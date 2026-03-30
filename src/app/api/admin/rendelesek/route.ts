import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { deriveNapiAllapotok, deriveRendelesDisplayAllapot, matchesAllapotFilter } from "@/lib/rendeles-allapot";

type TetelRow = {
  id: string;
  datum: string;
  nap: string;
  termek_nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
  allapot?: string | null;
};

type RendelesRow = {
  id: string;
  rendeles_szam: string;
  nev: string;
  email: string;
  telefon: string;
  megjegyzes: string | null;
  vegosszeg: number;
  allapot: string | null;
  created_at: string;
  rendeles_tetelek: TetelRow[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const datum = searchParams.get("datum");
  const allapot = searchParams.get("allapot");

  let query = supabaseAdmin
    .from("rendelesek")
    .select(`
      id, rendeles_szam, nev, email, telefon, megjegyzes, vegosszeg, allapot, created_at,
      rendeles_tetelek (id, datum, nap, termek_nev, mennyiseg, egysegar, reszosszeg, allapot)
    `)
    .order("created_at", { ascending: false });

  // Ha datum szuro van, azokat a rendeleseket keressuk amiknek van tetele azon a napon
  if (datum) {
    const { data: tetelek } = await supabaseAdmin
      .from("rendeles_tetelek")
      .select("rendeles_id")
      .eq("datum", datum);

    const rendelesIds = Array.from(new Set((tetelek ?? []).map((t) => t.rendeles_id)));
    if (rendelesIds.length === 0) {
      return NextResponse.json({ rendelesek: [] });
    }
    query = query.in("id", rendelesIds);
  }

  const { data, error } = await query.limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rendelesek = ((data ?? []) as RendelesRow[]).map((rendeles) => {
    const napi_allapotok = deriveNapiAllapotok(rendeles.rendeles_tetelek ?? []);
    const display_allapot = deriveRendelesDisplayAllapot(rendeles.rendeles_tetelek ?? [], rendeles.allapot);

    return {
      ...rendeles,
      allapot: display_allapot,
      display_allapot,
      napi_allapotok,
    };
  });

  const filtered = allapot && allapot !== "mind"
    ? rendelesek.filter((rendeles) =>
        matchesAllapotFilter(rendeles.rendeles_tetelek ?? [], rendeles.display_allapot, allapot)
      )
    : rendelesek;

  return NextResponse.json({ rendelesek: filtered });
}
