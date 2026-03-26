import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const datum = searchParams.get("datum");
  const allapot = searchParams.get("allapot");

  let query = supabaseAdmin
    .from("rendelesek")
    .select(`
      id, rendeles_szam, nev, email, telefon, megjegyzes, vegosszeg, allapot, created_at,
      rendeles_tetelek (id, datum, nap, termek_nev, mennyiseg, egysegar, reszosszeg)
    `)
    .order("created_at", { ascending: false });

  if (allapot && allapot !== "mind") {
    query = query.eq("allapot", allapot);
  }

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

  return NextResponse.json({ rendelesek: data });
}
