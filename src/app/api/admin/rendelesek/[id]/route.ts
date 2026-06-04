import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { deriveRendelesDisplayAllapot, isTetelAllapot } from "@/lib/rendeles-allapot";

export const dynamic = "force-dynamic";

const NAP_NEVEK: Record<number, string> = {
  0: "Vasárnap",
  1: "Hétfő",
  2: "Kedd",
  3: "Szerda",
  4: "Csütörtök",
  5: "Péntek",
  6: "Szombat",
};

function isValidDateInput(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getNapNev(datum: string) {
  const date = new Date(`${datum}T12:00:00`);
  return NAP_NEVEK[date.getDay()];
}

async function updateRendelesAllapot(rendelesId: string, fallback?: string | null) {
  const { data: tetelek, error: tetelekError } = await supabaseAdmin
    .from("rendeles_tetelek")
    .select("allapot, datum, nap")
    .eq("rendeles_id", rendelesId);

  if (tetelekError) {
    return { data: null, error: tetelekError };
  }

  const rendelesAllapot = deriveRendelesDisplayAllapot(tetelek ?? [], fallback);
  const persistedAllapot = rendelesAllapot === "reszben" ? "uj" : rendelesAllapot;

  return supabaseAdmin
    .from("rendelesek")
    .update({ allapot: persistedAllapot })
    .eq("id", rendelesId)
    .select()
    .single();
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const { allapot, datum, ujDatum, tetelId } = body;

  if (tetelId && ujDatum) {
    if (typeof tetelId !== "string" || !isValidDateInput(ujDatum)) {
      return NextResponse.json({ error: "Érvénytelen tétel vagy dátum" }, { status: 400 });
    }

    const { data: napRecord, error: napError } = await supabaseAdmin
      .from("rendeles_napok")
      .select("id, nap")
      .eq("datum", ujDatum)
      .maybeSingle();

    if (napError) {
      return NextResponse.json({ error: napError.message }, { status: 500 });
    }

    const { error: tetelError } = await supabaseAdmin
      .from("rendeles_tetelek")
      .update({
        datum: ujDatum,
        nap: napRecord?.nap ?? getNapNev(ujDatum),
        rendeles_nap_id: napRecord?.id ?? null,
      })
      .eq("id", tetelId)
      .eq("rendeles_id", params.id);

    if (tetelError) {
      return NextResponse.json({ error: tetelError.message }, { status: 500 });
    }

    const { data, error } = await updateRendelesAllapot(params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rendeles: data });
  }

  if (tetelId && allapot) {
    if (typeof tetelId !== "string" || !isTetelAllapot(allapot)) {
      return NextResponse.json({ error: "Érvénytelen tétel vagy állapot" }, { status: 400 });
    }

    const { error: tetelError } = await supabaseAdmin
      .from("rendeles_tetelek")
      .update({ allapot })
      .eq("id", tetelId)
      .eq("rendeles_id", params.id);

    if (tetelError) {
      return NextResponse.json({ error: tetelError.message }, { status: 500 });
    }

    const { data, error } = await updateRendelesAllapot(params.id, allapot);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rendeles: data });
  }

  if (datum && ujDatum) {
    if (!isValidDateInput(datum) || !isValidDateInput(ujDatum)) {
      return NextResponse.json({ error: "Érvénytelen dátum" }, { status: 400 });
    }

    const { data: napRecord, error: napError } = await supabaseAdmin
      .from("rendeles_napok")
      .select("id, nap")
      .eq("datum", ujDatum)
      .maybeSingle();

    if (napError) {
      return NextResponse.json({ error: napError.message }, { status: 500 });
    }

    const { error: tetelError } = await supabaseAdmin
      .from("rendeles_tetelek")
      .update({
        datum: ujDatum,
        nap: napRecord?.nap ?? getNapNev(ujDatum),
        rendeles_nap_id: napRecord?.id ?? null,
      })
      .eq("rendeles_id", params.id)
      .eq("datum", datum);

    if (tetelError) {
      return NextResponse.json({ error: tetelError.message }, { status: 500 });
    }

    const { data, error } = await updateRendelesAllapot(params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rendeles: data });
  }

  if (!isTetelAllapot(allapot)) {
    return NextResponse.json({ error: "Érvénytelen állapot" }, { status: 400 });
  }

  if (datum) {
    const { error: tetelError } = await supabaseAdmin
      .from("rendeles_tetelek")
      .update({ allapot })
      .eq("rendeles_id", params.id)
      .eq("datum", datum);

    if (tetelError) {
      return NextResponse.json({ error: tetelError.message }, { status: 500 });
    }

    const { data, error } = await updateRendelesAllapot(params.id, allapot);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ rendeles: data });
  }

  const { data, error } = await supabaseAdmin
    .from("rendelesek")
    .update({ allapot })
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rendeles: data });
}
