import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

const NAP_NEVEK: Record<number, string> = {
  0: "Vasárnap",
  1: "Hétfő",
  2: "Kedd",
  3: "Szerda",
  4: "Csütörtök",
  5: "Péntek",
  6: "Szombat",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tol = searchParams.get("tol");
  const ig = searchParams.get("ig");

  let query = supabaseAdmin
    .from("rendeles_napok")
    .select("*")
    .order("datum");

  if (tol && ig) {
    query = query.gte("datum", tol).lte("datum", ig);
  } else {
    query = query
      .gte("datum", new Date().toISOString().split("T")[0])
      .limit(60);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ napok: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { datum, hatarido: haataridoParam } = body;

  if (!datum) {
    return NextResponse.json({ error: "Hiányzó dátum" }, { status: 400 });
  }

  // Nap neve automatikusan a dátumból
  const d = new Date(datum + "T00:00:00");
  const nap = NAP_NEVEK[d.getDay()];

  // Határidő: 2 nappal korábban 23:59, ha nincs megadva
  let hatarido = haataridoParam;
  if (!hatarido) {
    const deadline = new Date(datum + "T00:00:00");
    deadline.setDate(deadline.getDate() - 2);
    deadline.setHours(23, 59, 0, 0);
    hatarido = deadline.toISOString();
  }

  const { data, error } = await supabaseAdmin
    .from("rendeles_napok")
    .insert({ datum, nap, nyitott: true, hatarido })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ nap: data });
}
