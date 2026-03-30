import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();

  const { data, error } = await supabaseAdmin
    .from("kategoriak")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ kategoria: data });
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  // Megkeressük a kategória nevét
  const { data: kat } = await supabaseAdmin
    .from("kategoriak")
    .select("nev")
    .eq("id", params.id)
    .single();

  if (!kat) {
    return NextResponse.json({ error: "Kategória nem található" }, { status: 404 });
  }

  // Ellenőrzés: van-e termék ebben a kategóriában?
  const { count } = await supabaseAdmin
    .from("termekek")
    .select("id", { count: "exact", head: true })
    .eq("kategoria", kat.nev);

  if (count && count > 0) {
    return NextResponse.json(
      { error: `Nem törölhető: ${count} termék tartozik ehhez a kategóriához.` },
      { status: 409 }
    );
  }

  const { error } = await supabaseAdmin
    .from("kategoriak")
    .delete()
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
