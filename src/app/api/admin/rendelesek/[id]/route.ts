import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { deriveRendelesDisplayAllapot, isTetelAllapot } from "@/lib/rendeles-allapot";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { allapot, datum } = body;

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

    const { data: tetelek, error: tetelekError } = await supabaseAdmin
      .from("rendeles_tetelek")
      .select("allapot, datum, nap")
      .eq("rendeles_id", params.id);

    if (tetelekError) {
      return NextResponse.json({ error: tetelekError.message }, { status: 500 });
    }

    const rendelesAllapot = deriveRendelesDisplayAllapot(tetelek ?? [], allapot);

    const { data, error } = await supabaseAdmin
      .from("rendelesek")
      .update({ allapot: rendelesAllapot })
      .eq("id", params.id)
      .select()
      .single();

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
