import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();

  const now = new Date();

  // Nyitott, jövőbeli napok lekérése
  const { data: napok, error } = await supabase
    .from("rendeles_napok")
    .select("id, datum, nap, hatarido")
    .eq("nyitott", true)
    .gte("datum", now.toISOString().split("T")[0])
    .order("datum")
    .limit(90);

  if (error) {
    return NextResponse.json({ error: "Hiba a napok lekérésekor" }, { status: 500 });
  }

  // Szűrjük ki azokat, ahol a határidő már lejárt
  const elérhetoNapok = (napok ?? []).filter((nap) => {
    const hatarido = new Date(nap.hatarido);
    return hatarido > now;
  });

  const dayIds = elérhetoNapok.map((nap) => nap.id);
  const [productLimitResult, breadLimitResult] = await Promise.all([
    dayIds.length
      ? supabaseAdmin.from("napi_termek_vevo_limit").select("rendeles_nap_id, termek_id, max_vevonkent").in("rendeles_nap_id", dayIds)
      : Promise.resolve({ data: [], error: null }),
    dayIds.length
      ? supabaseAdmin.from("napi_kenyer_vevo_limit").select("rendeles_nap_id, max_vevonkent").in("rendeles_nap_id", dayIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const { data: limitRows, error: limitError } = productLimitResult;
  const { data: breadLimitRows, error: breadLimitError } = breadLimitResult;
  const missingPreviewTable = process.env.VERCEL_ENV === "preview" &&
    (limitError?.code === "42P01" || limitError?.code === "PGRST205");
  if (limitError && !missingPreviewTable) {
    return NextResponse.json({ error: "Hiba a rendelési limitek lekérésekor" }, { status: 500 });
  }
  const missingPreviewBreadTable = process.env.VERCEL_ENV === "preview" &&
    (breadLimitError?.code === "42P01" || breadLimitError?.code === "PGRST205");
  if (breadLimitError && !missingPreviewBreadTable) {
    return NextResponse.json({ error: "Hiba a közös kenyérkeret lekérésekor" }, { status: 500 });
  }
  const limitsByDay = new Map<string, Record<string, number>>();
  for (const row of limitRows ?? []) {
    const limits = limitsByDay.get(row.rendeles_nap_id) ?? {};
    limits[row.termek_id] = row.max_vevonkent;
    limitsByDay.set(row.rendeles_nap_id, limits);
  }
  const breadLimitByDay = new Map((breadLimitRows ?? []).map((row) => [row.rendeles_nap_id, row.max_vevonkent]));

  // Minden naphoz lekérjük az elérhető termékeket
  const daysWithProducts = await Promise.all(
    elérhetoNapok.map(async (nap) => {
      const { data: napiTermekek } = await supabase
        .from("napi_termekek")
        .select("termek_id")
        .eq("rendeles_nap_id", nap.id);

      return {
        id: nap.id,
        datum: nap.datum,
        nap: nap.nap,
        hatarido: nap.hatarido,
        korlatozott_termek_ids: napiTermekek?.map((t) => t.termek_id) ?? [],
        max_vevonkent: limitsByDay.get(nap.id) ?? {},
        kenyer_max_vevonkent: breadLimitByDay.get(nap.id) ?? null,
      };
    })
  );

  const result = daysWithProducts.filter((nap) => nap.korlatozott_termek_ids.length > 0);

  return NextResponse.json(result);
}
