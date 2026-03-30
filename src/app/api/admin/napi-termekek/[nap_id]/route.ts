import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

// GET: visszaadja az engedélyezett termék ID-kat erre a napra
// Üres tömb = minden termék elérhető (nincs korlátozás)
export async function GET(
  _request: Request,
  { params }: { params: { nap_id: string } }
) {
  const { data, error } = await supabaseAdmin
    .from("napi_termekek")
    .select("termek_id")
    .eq("rendeles_nap_id", params.nap_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const termek_ids = (data ?? []).map((r) => r.termek_id);
  return NextResponse.json({ termek_ids });
}

// PUT: beállítja az engedélyezett termékeket erre a napra
// Üres termek_ids = minden elérhető (töröl minden korlátozást)
export async function PUT(
  request: Request,
  { params }: { params: { nap_id: string } }
) {
  const body = await request.json();
  const { termek_ids }: { termek_ids: string[] } = body;

  // Először töröljük a meglévő beállításokat
  const { error: delError } = await supabaseAdmin
    .from("napi_termekek")
    .delete()
    .eq("rendeles_nap_id", params.nap_id);

  if (delError) {
    return NextResponse.json({ error: delError.message }, { status: 500 });
  }

  // Ha van mit betenni, insertáljuk
  if (termek_ids.length > 0) {
    const rows = termek_ids.map((termek_id) => ({
      rendeles_nap_id: params.nap_id,
      termek_id,
    }));

    const { error: insError } = await supabaseAdmin
      .from("napi_termekek")
      .insert(rows);

    if (insError) {
      return NextResponse.json({ error: insError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, termek_ids });
}
