import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { allapot } = body;

  if (!["uj", "feldolgozva", "kesz", "atvetel", "torolve"].includes(allapot)) {
    return NextResponse.json({ error: "Érvénytelen állapot" }, { status: 400 });
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
