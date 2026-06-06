import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const kategoria = typeof body?.kategoria === "string" ? body.kategoria.trim() : "";
  const rawTermekIds = body?.termek_ids;

  if (
    !kategoria ||
    !Array.isArray(rawTermekIds) ||
    rawTermekIds.length === 0 ||
    rawTermekIds.some((id) => typeof id !== "string")
  ) {
    return NextResponse.json({ error: "Érvénytelen sorrend." }, { status: 400 });
  }

  const termekIds = Array.from(new Set(rawTermekIds));
  if (termekIds.length !== rawTermekIds.length) {
    return NextResponse.json({ error: "A terméklista ismétlődő elemet tartalmaz." }, { status: 400 });
  }

  const { data: categoryProducts, error: productsError } = await supabaseAdmin
    .from("termekek")
    .select("id")
    .eq("kategoria", kategoria);

  if (productsError) {
    return NextResponse.json({ error: productsError.message }, { status: 500 });
  }

  const categoryIds = new Set((categoryProducts ?? []).map((termek) => termek.id));
  const hasExactCategoryProducts =
    categoryIds.size === termekIds.length &&
    termekIds.every((termekId) => categoryIds.has(termekId));

  if (!hasExactCategoryProducts) {
    return NextResponse.json(
      { error: "A sorrend nem egyezik a kategória termékeivel. Frissítsd az oldalt." },
      { status: 409 }
    );
  }

  for (let index = 0; index < termekIds.length; index += 1) {
    const termekId = termekIds[index];
    const { error } = await supabaseAdmin
      .from("termekek")
      .update({ sorrend: index + 1 })
      .eq("id", termekId)
      .eq("kategoria", kategoria);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true, termek_ids: termekIds });
}
