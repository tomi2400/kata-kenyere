import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nev, email, telefon, megjegyzes, rendelesek, vegosszeg } = body;

    // Validáció
    if (!nev?.trim()) {
      return NextResponse.json({ error: "Név megadása kötelező" }, { status: 400 });
    }
    if (!email?.trim() || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Érvényes email cím szükséges" }, { status: 400 });
    }
    if (!telefon?.trim()) {
      return NextResponse.json({ error: "Telefonszám megadása kötelező" }, { status: 400 });
    }
    if (!rendelesek || rendelesek.length === 0) {
      return NextResponse.json({ error: "Legalább egy tétel szükséges" }, { status: 400 });
    }

    // Rendelésszám generálása: KK-YYYYMMDD-NNN
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const { count } = await supabaseAdmin
      .from("rendelesek")
      .select("*", { count: "exact", head: true })
      .like("rendeles_szam", `KK-${today}-%`);
    const sorszam = String((count ?? 0) + 1).padStart(3, "0");
    const rendelesSzam = `KK-${today}-${sorszam}`;

    // Rendelés mentése
    const { data: rendeles, error: rendelesError } = await supabaseAdmin
      .from("rendelesek")
      .insert({
        rendeles_szam: rendelesSzam,
        nev: nev.trim(),
        email: email.trim(),
        telefon: telefon.trim(),
        megjegyzes: megjegyzes?.trim() || null,
        vegosszeg,
        allapot: "uj",
      })
      .select("id")
      .single();

    if (rendelesError || !rendeles) {
      console.error("Rendelés mentési hiba:", rendelesError);
      return NextResponse.json({ error: "Hiba a rendelés mentésekor" }, { status: 500 });
    }

    // Tételek mentése
    // Termék slug → UUID feloldás
    const slugok = Array.from(new Set(rendelesek.map((r: { termekId: string }) => r.termekId))) as string[];
    const { data: termekek } = await supabaseAdmin
      .from("termekek")
      .select("id, slug")
      .in("slug", slugok);

    const slugMap = new Map(termekek?.map((t) => [t.slug, t.id]) ?? []);

    // Rendelési napok feloldása dátum alapján
    const datumok = Array.from(new Set(rendelesek.map((r: { datum: string }) => r.datum))) as string[];
    const { data: napok } = await supabaseAdmin
      .from("rendeles_napok")
      .select("id, datum")
      .in("datum", datumok);

    const datumMap = new Map(napok?.map((n) => [n.datum, n.id]) ?? []);

    const tetelek = rendelesek.map((r: {
      nap: string;
      datum: string;
      termekId: string;
      nev: string;
      mennyiseg: number;
      egysegar: number;
      reszosszeg: number;
    }) => ({
      rendeles_id: rendeles.id,
      rendeles_nap_id: datumMap.get(r.datum) || null,
      termek_id: slugMap.get(r.termekId) || null,
      datum: r.datum,
      nap: r.nap,
      termek_nev: r.nev,
      mennyiseg: r.mennyiseg,
      egysegar: r.egysegar,
      reszosszeg: r.reszosszeg,
    }));

    const { error: tetelError } = await supabaseAdmin
      .from("rendeles_tetelek")
      .insert(tetelek);

    if (tetelError) {
      console.error("Tétel mentési hiba:", tetelError);
      return NextResponse.json({ error: "Hiba a tételek mentésekor" }, { status: 500 });
    }

    // TODO: Email küldés (Resend) - következő lépésben

    return NextResponse.json({
      success: true,
      rendelesSzam,
    });
  } catch (error) {
    console.error("Rendelés hiba:", error);
    return NextResponse.json({ error: "Váratlan hiba történt" }, { status: 500 });
  }
}
