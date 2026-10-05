import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const { data, error } = await supabaseAdmin
    .from("napi_kenyer_vevo_limit")
    .select("max_vevonkent")
    .eq("rendeles_nap_id", params.id)
    .maybeSingle();

  if (error) {
    if (process.env.VERCEL_ENV === "preview" && ["42P01", "PGRST205"].includes(error.code)) {
      return NextResponse.json({ max_vevonkent: null });
    }
    return NextResponse.json({ error: "Nem sikerült betölteni a közös kenyérkeretet." }, { status: 500 });
  }

  return NextResponse.json({ max_vevonkent: data?.max_vevonkent ?? null });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const maximum = body?.max_vevonkent;
  if (maximum !== null && (!Number.isInteger(maximum) || maximum < 1 || maximum > 99)) {
    return NextResponse.json({ error: "A maximum 1 és 99 közötti egész szám, vagy üres érték lehet." }, { status: 400 });
  }

  const { data: day, error: dayError } = await supabaseAdmin
    .from("rendeles_napok")
    .select("id")
    .eq("id", params.id)
    .maybeSingle();
  if (dayError) return NextResponse.json({ error: "Nem sikerült ellenőrizni a napot." }, { status: 500 });
  if (!day) return NextResponse.json({ error: "A nap nem található." }, { status: 404 });

  const result = maximum === null
    ? await supabaseAdmin.from("napi_kenyer_vevo_limit").delete().eq("rendeles_nap_id", params.id)
    : await supabaseAdmin.from("napi_kenyer_vevo_limit").upsert({ rendeles_nap_id: params.id, max_vevonkent: maximum });

  if (result.error) return NextResponse.json({ error: "Nem sikerült menteni a közös kenyérkeretet." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
