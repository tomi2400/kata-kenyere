import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function toSafeQuantity(value: unknown) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) return 0;
  return Math.round(numberValue);
}

function isMissingStockTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || (error.message ?? "").toLowerCase().includes("napi_keszlet");
}

export async function PATCH(request: Request) {
  const authError = await requireAdmin(request);
  if (authError) return authError;

  const body = await request.json();
  const {
    datum,
    termek_id,
    extra_mennyiseg,
    elkeszult_mennyiseg,
    megjegyzes,
  } = body;

  if (typeof datum !== "string" || !DATE_RE.test(datum)) {
    return NextResponse.json({ error: "Érvénytelen dátum." }, { status: 400 });
  }

  if (typeof termek_id !== "string" || !termek_id.trim()) {
    return NextResponse.json({ error: "Hiányzó termék." }, { status: 400 });
  }

  const { data: product, error: productError } = await supabaseAdmin
    .from("termekek")
    .select("id, nev, egyseg")
    .eq("id", termek_id)
    .single();

  if (productError || !product) {
    return NextResponse.json({ error: "A termék nem található." }, { status: 404 });
  }

  const payload = {
    datum,
    termek_id: product.id,
    termek_nev: product.nev,
    egyseg: product.egyseg,
    extra_mennyiseg: toSafeQuantity(extra_mennyiseg),
    elkeszult_mennyiseg: toSafeQuantity(elkeszult_mennyiseg),
    megjegyzes: typeof megjegyzes === "string" && megjegyzes.trim() ? megjegyzes.trim() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("napi_keszlet")
    .upsert(payload, { onConflict: "datum,termek_id" })
    .select()
    .single();

  if (error) {
    if (isMissingStockTable(error)) {
      return NextResponse.json(
        { error: "A napi készlet tábla még nincs létrehozva. Futtasd a supabase/migrations mappában lévő SQL-t." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ keszlet: data });
}
