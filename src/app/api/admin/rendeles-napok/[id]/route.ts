import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("rendeles_napok")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ nap: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  // Ellenőrzés: van-e rendelés erre a napra?
  const { count } = await supabaseAdmin
    .from("rendeles_tetelek")
    .select("id", { count: "exact", head: true })
    .eq("rendeles_nap_id", params.id);

  if (count && count > 0) {
    return NextResponse.json(
      { error: "Nem törölhető: vannak rendelések erre a napra." },
      { status: 409 }
    );
  }

  // Napi termékek törlése is
  await supabaseAdmin
    .from("napi_termekek")
    .delete()
    .eq("rendeles_nap_id", params.id);

  const { error } = await supabaseAdmin
    .from("rendeles_napok")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
