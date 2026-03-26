import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: { datum: string } }
) {
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
