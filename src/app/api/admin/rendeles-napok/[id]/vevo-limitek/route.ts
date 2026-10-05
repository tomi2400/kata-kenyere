import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from("napi_termek_vevo_limit")
    .select("termek_id, max_vevonkent")
    .eq("rendeles_nap_id", params.id);

  if (error) {
    return NextResponse.json({ error: "Nem sikerült betölteni a napi limiteket. Ellenőrizd az adatbázis frissítését." }, { status: 500 });
  }

  return NextResponse.json({ max_vevonkent: Object.fromEntries((data ?? []).map((row) => [row.termek_id, row.max_vevonkent])) });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const productId = body?.termek_id;
  const maximum = body?.max_vevonkent;

  if (typeof productId !== "string" || (maximum !== null && (!Number.isInteger(maximum) || maximum < 1 || maximum > 99))) {
    return NextResponse.json({ error: "A maximum 1 és 99 közötti egész szám, vagy üres érték lehet." }, { status: 400 });
  }

  const [dayResult, productResult] = await Promise.all([
    supabaseAdmin.from("rendeles_napok").select("id").eq("id", params.id).maybeSingle(),
    supabaseAdmin.from("termekek").select("id").eq("id", productId).maybeSingle(),
  ]);
  if (dayResult.error || productResult.error) return NextResponse.json({ error: "Ellenőrzési hiba." }, { status: 500 });
  if (!dayResult.data || !productResult.data) return NextResponse.json({ error: "A nap vagy a termék nem található." }, { status: 404 });

  const result = maximum === null
    ? await supabaseAdmin.from("napi_termek_vevo_limit").delete().eq("rendeles_nap_id", params.id).eq("termek_id", productId)
    : await supabaseAdmin.from("napi_termek_vevo_limit").upsert({ rendeles_nap_id: params.id, termek_id: productId, max_vevonkent: maximum });

  if (result.error) return NextResponse.json({ error: "Nem sikerült menteni a napi limitet." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
