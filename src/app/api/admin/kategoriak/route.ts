import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from("kategoriak")
    .select("id, nev, sorrend")
    .order("sorrend");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ kategoriak: data ?? [] });
}

export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { nev } = body;

  if (!nev?.trim()) {
    return NextResponse.json({ error: "Hiányzó kategórianév" }, { status: 400 });
  }

  // Sorrend: eddigi max + 1
  const { data: last } = await supabaseAdmin
    .from("kategoriak")
    .select("sorrend")
    .order("sorrend", { ascending: false })
    .limit(1)
    .single();

  const sorrend = (last?.sorrend ?? 0) + 1;

  const { data, error } = await supabaseAdmin
    .from("kategoriak")
    .insert({ nev: nev.trim(), sorrend })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ kategoria: data });
}
