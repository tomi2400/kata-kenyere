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
  // Soft delete: aktiv = false
  const { error } = await supabaseAdmin
    .from("termekek")
    .update({ aktiv: false })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
