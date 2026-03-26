import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("rendeles_napok")
    .select("*")
    .gte("datum", new Date().toISOString().split("T")[0])
    .order("datum")
    .limit(30);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ napok: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { datum, nap, hatarido } = body;

  if (!datum || !nap) {
    return NextResponse.json({ error: "Hianyzo datum vagy nap" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("rendeles_napok")
    .insert({
      datum,
      nap,
      nyitott: true,
      hatarido: hatarido || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ nap: data });
}
