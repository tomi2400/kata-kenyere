import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  const now = new Date();

  // Nyitott, jövőbeli napok lekérése
  const { data: napok, error } = await supabase
    .from("rendeles_napok")
    .select("id, datum, nap, hatarido")
    .eq("nyitott", true)
    .gte("datum", now.toISOString().split("T")[0])
    .order("datum")
    .limit(4);

  if (error) {
    return NextResponse.json({ error: "Hiba a napok lekérésekor" }, { status: 500 });
  }

  // Szűrjük ki azokat, ahol a határidő már lejárt
  const elérhetoNapok = (napok ?? []).filter((nap) => {
    const hatarido = new Date(nap.hatarido);
    return hatarido > now;
  });

  // Minden naphoz lekérjük az elérhető termékeket
  const result = await Promise.all(
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
        // Ha nincs korlátozás (üres lista), minden termék elérhető
        korlatozott_termek_ids: napiTermekek?.map((t) => t.termek_id) ?? [],
      };
    })
  );

  return NextResponse.json(result);
}
