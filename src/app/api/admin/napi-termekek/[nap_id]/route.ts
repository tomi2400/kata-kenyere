import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// GET: visszaadja az engedélyezett termék ID-kat erre a napra
// Üres tömb = minden termék elérhető (nincs korlátozás)
export async function GET(
  request: Request,
  { params }: { params: { nap_id: string } }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

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
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const rawTermekIds = body?.termek_ids;

  if (!Array.isArray(rawTermekIds) || rawTermekIds.some((id) => typeof id !== "string")) {
    return NextResponse.json({ error: "Érvénytelen terméklista." }, { status: 400 });
  }

  const termek_ids = Array.from(new Set(rawTermekIds));

  const { data: day, error: dayError } = await supabaseAdmin
    .from("rendeles_napok")
    .select("id")
    .eq("id", params.nap_id)
    .maybeSingle();

  if (dayError) {
    return NextResponse.json({ error: dayError.message }, { status: 500 });
  }

  if (!day) {
    return NextResponse.json({ error: "A rendelési nap nem található." }, { status: 404 });
  }

  if (termek_ids.length > 0) {
    const { data: products, error: productsError } = await supabaseAdmin
      .from("termekek")
      .select("id")
      .in("id", termek_ids);

    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }

    if ((products ?? []).length !== termek_ids.length) {
      return NextResponse.json({ error: "A terméklista ismeretlen terméket tartalmaz." }, { status: 400 });
    }
  }

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
