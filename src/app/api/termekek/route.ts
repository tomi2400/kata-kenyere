import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const { data: kategoriak } = await supabase
    .from("kategoriak")
    .select("nev")
    .order("sorrend");

  const { data: termekek, error } = await supabase
    .from("termekek")
    .select("id, slug, nev, leiras, kategoria, ar, egyseg, foto_url, sorrend")
    .eq("aktiv", true)
    .order("sorrend");

  if (error) {
    return NextResponse.json({ error: "Hiba a termékek lekérésekor" }, { status: 500 });
  }

  // Kategóriák sorrendjében csoportosítva
  const kategoriaLista = kategoriak?.map((k) => k.nev) ?? [];

  return NextResponse.json({
    kategoriak: kategoriaLista,
    termekek: termekek ?? [],
  });
}
