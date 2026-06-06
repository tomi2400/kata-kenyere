import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { supabase } from "@/lib/supabase/client";

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
      };
    })
  );

  const result = daysWithProducts.filter((nap) => nap.korlatozott_termek_ids.length > 0);

  return NextResponse.json(result);
}
