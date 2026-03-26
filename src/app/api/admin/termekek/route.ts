import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const { data: kategoriak } = await supabaseAdmin
    .from("kategoriak")
    .select("nev")
    .order("sorrend");

  const { data: termekek, error } = await supabaseAdmin
    .from("termekek")
    .select("*")
    .order("sorrend");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    termekek: termekek ?? [],
    kategoriak: kategoriak?.map((k) => k.nev) ?? [],
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { nev, slug, leiras, kategoria, ar, egyseg, foto_url } = body;

  if (!nev || !slug || !kategoria || !ar || !egyseg) {
    return NextResponse.json({ error: "Hianyzo mezok" }, { status: 400 });
  }

  // Sorrend: kategoria utolso eleme + 1
  const { data: lastItem } = await supabaseAdmin
    .from("termekek")
    .select("sorrend")
    .eq("kategoria", kategoria)
    .order("sorrend", { ascending: false })
    .limit(1)
    .single();

  const sorrend = (lastItem?.sorrend ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from("termekek")
    .insert({
      nev,
      slug,
      leiras: leiras || "",
      kategoria,
      ar: Number(ar),
      egyseg,
      foto_url: foto_url || null,
      sorrend,
      aktiv: true,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ termek: data });
}
