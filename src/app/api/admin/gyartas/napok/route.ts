import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("rendeles_napok")
    .select("datum, nap")
    .gte("datum", new Date().toISOString().split("T")[0])
    .order("datum")
    .limit(14);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ napok: data });
}
