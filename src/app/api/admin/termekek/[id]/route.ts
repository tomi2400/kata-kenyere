import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { parseProductDetails, serializeProductDetails } from "@/lib/product-details";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const updateBody = { ...body };

  if (
    typeof body.leiras === "string" ||
    typeof body.hozzavalok === "string" ||
    typeof body.allergenek === "string"
  ) {
    const { data: currentProduct, error: currentError } = await supabaseAdmin
      .from("termekek")
      .select("leiras")
      .eq("id", params.id)
      .maybeSingle();

    if (currentError) {
      return NextResponse.json({ error: currentError.message }, { status: 500 });
    }

    if (!currentProduct) {
      return NextResponse.json({ error: "A termék nem található." }, { status: 404 });
    }

    const currentDetails = parseProductDetails(currentProduct.leiras);
    updateBody.leiras = serializeProductDetails({
      leiras: typeof body.leiras === "string" ? body.leiras : currentDetails.leiras,
      hozzavalok: typeof body.hozzavalok === "string" ? body.hozzavalok : currentDetails.hozzavalok,
      allergenek: typeof body.allergenek === "string" ? body.allergenek : currentDetails.allergenek,
    });
    delete updateBody.hozzavalok;
    delete updateBody.allergenek;
  }

  const { data, error } = await supabaseAdmin
    .from("termekek")
    .update(updateBody)
    .eq("id", params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ termek: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

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
