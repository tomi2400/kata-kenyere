import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const [daysResult, limitsResult] = await Promise.all([
    supabaseAdmin.from("rendeles_napok").select("id, datum, nap").gte("datum", new Date().toISOString().slice(0, 10)).order("datum").limit(90),
    supabaseAdmin.from("napi_termek_vevo_limit").select("rendeles_nap_id, max_vevonkent").eq("termek_id", params.id),
  ]);

  if (daysResult.error || limitsResult.error) {
    return NextResponse.json({ error: "Nem sikerült betölteni a napi limiteket. Ellenőrizd az adatbázis frissítését." }, { status: 500 });
  }

  const limits = new Map((limitsResult.data ?? []).map((row) => [row.rendeles_nap_id, row.max_vevonkent]));
  return NextResponse.json({ napok: (daysResult.data ?? []).map((day) => ({ ...day, max_vevonkent: limits.get(day.id) ?? null })) });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const dayId = body?.rendeles_nap_id;
  const maximum = body?.max_vevonkent;

  if (typeof dayId !== "string" || (maximum !== null && (!Number.isInteger(maximum) || maximum < 1 || maximum > 99))) {
    return NextResponse.json({ error: "A maximum 1 és 99 közötti egész szám, vagy üres érték lehet." }, { status: 400 });
  }

  const [dayResult, productResult] = await Promise.all([
    supabaseAdmin.from("rendeles_napok").select("id").eq("id", dayId).maybeSingle(),
    supabaseAdmin.from("termekek").select("id").eq("id", params.id).maybeSingle(),
  ]);
  if (dayResult.error || productResult.error) return NextResponse.json({ error: "Ellenőrzési hiba." }, { status: 500 });
  if (!dayResult.data || !productResult.data) return NextResponse.json({ error: "A nap vagy a termék nem található." }, { status: 404 });

  const result = maximum === null
    ? await supabaseAdmin.from("napi_termek_vevo_limit").delete().eq("rendeles_nap_id", dayId).eq("termek_id", params.id)
    : await supabaseAdmin.from("napi_termek_vevo_limit").upsert({ rendeles_nap_id: dayId, termek_id: params.id, max_vevonkent: maximum });

  if (result.error) return NextResponse.json({ error: "Nem sikerült menteni a napi limitet." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
