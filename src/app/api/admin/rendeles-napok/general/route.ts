import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Kovetkezo 2 het kedd-pentek napjainak automatikus generelasa
export async function POST(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const NAP_NEVEK: Record<number, string> = {
    2: "Kedd",
    3: "Szerda",
    4: "Csütörtök",
    5: "Péntek",
  };

  const today = new Date();
  const napok: { datum: string; nap: string; nyitott: boolean; hatarido: string }[] = [];

  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dayOfWeek = d.getDay();

    if (dayOfWeek >= 2 && dayOfWeek <= 5) {
      const datum = d.toISOString().split("T")[0];

      // Hatarido: 2 nappal elotte 17:00
      const deadline = new Date(d);
      deadline.setDate(deadline.getDate() - 2);
      deadline.setHours(17, 0, 0, 0);

      napok.push({
        datum,
        nap: NAP_NEVEK[dayOfWeek],
        nyitott: true,
        hatarido: deadline.toISOString(),
      });
    }
  }

  // Upsert: ha mar letezik a datum, nem irja felul
  let created = 0;
  for (const nap of napok) {
    const { error } = await supabaseAdmin
      .from("rendeles_napok")
      .upsert(nap, { onConflict: "datum", ignoreDuplicates: true });

    if (!error) created++;
  }

  return NextResponse.json({ created, total: napok.length });
}
