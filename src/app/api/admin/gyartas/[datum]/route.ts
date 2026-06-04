import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { datum: string } }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { datum } = params;

  // Napi gyartasi osszesito: termekenkent ossz mennyiseg
  const { data, error } = await supabaseAdmin.rpc("napi_gyartasi_osszesito", {
    target_date: datum,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}
