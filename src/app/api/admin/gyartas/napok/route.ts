import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

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
