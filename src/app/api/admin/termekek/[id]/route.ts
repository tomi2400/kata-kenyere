import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("termekek")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ termek: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await supabaseAdmin
    .from("termekek")
    .delete()
    .eq("id", params.id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        { error: "Ez a termék nem törölhető, mert már kapcsolódik meglévő rendeléshez vagy más adathoz." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
