import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import { getPrimaryMarketingTouch, sanitizeMarketingAttribution } from "@/lib/tracking";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type SubmittedOrderItem = {
  nap: string;
  datum: string;
  termekId: string;
  nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
};

type OrderInsertItem = {
  rendeles_id: string;
  rendeles_nap_id: string | null;
  termek_id: string | null;
  datum: string;
  nap: string;
  termek_nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
  allapot: "uj";
};

type PreparedOrderItem = Omit<OrderInsertItem, "rendeles_id" | "allapot">;

type ProductRow = {
  id: string;
  slug: string;
  nev: string;
  ar: number;
  egyseg: string;
};

type OrderDayRow = {
  id: string;
  datum: string;
  nap: string;
  nyitott: boolean;
  hatarido: string | null;
};

type NapiTermekRow = {
  rendeles_nap_id: string;
  termek_id: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_ITEM_QUANTITY = 99;

const NAP_NEVEK: Record<number, string> = {
  0: "Vasárnap",
  1: "Hétfő",
  2: "Kedd",
  3: "Szerda",
  4: "Csütörtök",
  5: "Péntek",
  6: "Szombat",
};

function getBudapestDateStamp() {
  const parts = new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}${month}${day}`;
}

function getBudapestDateInput() {
  const stamp = getBudapestDateStamp();

  return `${stamp.slice(0, 4)}-${stamp.slice(4, 6)}-${stamp.slice(6, 8)}`;
}

function generateRendelesSzam() {
  const suffix = randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();

  return `KK-${getBudapestDateStamp()}-${suffix}`;
}

function getNapNev(datum: string) {
  return NAP_NEVEK[new Date(`${datum}T12:00:00`).getDay()] ?? datum;
}

function toSafeQuantity(value: unknown) {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue) || numberValue <= 0) return null;

  const rounded = Math.round(numberValue);
  if (rounded > MAX_ITEM_QUANTITY) return null;

  return rounded;
}

function isDuplicateOrderNumberError(error: { code?: string; message?: string } | null) {
  return error?.code === "23505" && (error.message ?? "").toLowerCase().includes("rendeles_szam");
}

function isMissingMarketingColumnsError(error: { code?: string; message?: string; details?: string | null }) {
  const text = `${error.code ?? ""} ${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();

  return (
    text.includes("marketing_attribution") ||
    text.includes("traffic_source") ||
    text.includes("traffic_medium") ||
    text.includes("utm_") ||
    text.includes("gclid") ||
    text.includes("fbclid") ||
    text.includes("msclkid")
  );
}

function isSubmittedOrderItem(item: unknown): item is SubmittedOrderItem {
  if (!item || typeof item !== "object") return false;

  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.datum === "string" &&
    typeof candidate.termekId === "string" &&
    typeof candidate.nev === "string" &&
    Number(candidate.mennyiseg) > 0
  );
}

async function prepareOrderItems(
  submittedItems: SubmittedOrderItem[],
  isManualOrder: boolean
): Promise<
  | { ok: true; items: PreparedOrderItem[]; total: number }
  | { ok: false; error: string; status: number }
> {
  const aggregated = new Map<string, { datum: string; termekSlug: string; mennyiseg: number }>();

  for (const item of submittedItems) {
    if (!DATE_RE.test(item.datum)) {
      return { ok: false, error: "Érvénytelen átvételi dátum.", status: 400 };
    }

    const mennyiseg = toSafeQuantity(item.mennyiseg);
    if (!mennyiseg) {
      return {
        ok: false,
        error: `Egy tételből legfeljebb ${MAX_ITEM_QUANTITY} darab rendelhető egyszerre.`,
        status: 400,
      };
    }

    const termekSlug = item.termekId.trim();
    const key = `${item.datum}__${termekSlug}`;
    const current = aggregated.get(key);
    const nextQuantity = (current?.mennyiseg ?? 0) + mennyiseg;

    if (nextQuantity > MAX_ITEM_QUANTITY) {
      return {
        ok: false,
        error: `Egy tételből legfeljebb ${MAX_ITEM_QUANTITY} darab rendelhető egyszerre.`,
        status: 400,
      };
    }

    aggregated.set(key, {
      datum: item.datum,
      termekSlug,
      mennyiseg: nextQuantity,
    });
  }

  const requestedItems = Array.from(aggregated.values());
  const slugok = Array.from(new Set(requestedItems.map((item) => item.termekSlug)));
  const datumok = Array.from(new Set(requestedItems.map((item) => item.datum)));

  const { data: termekek, error: termekError } = await supabaseAdmin
    .from("termekek")
    .select("id, slug, nev, ar, egyseg")
    .eq("aktiv", true)
    .in("slug", slugok);

  if (termekError) {
    return { ok: false, error: "Hiba a termékek ellenőrzésekor.", status: 500 };
  }

  const productBySlug = new Map(((termekek ?? []) as ProductRow[]).map((termek) => [termek.slug, termek]));
  const missingProduct = slugok.find((slug) => !productBySlug.has(slug));

  if (missingProduct) {
    return {
      ok: false,
      error: "A kosárban van olyan termék, ami már nem rendelhető. Frissítsd az oldalt és ellenőrizd a kosarat.",
      status: 400,
    };
  }

  const { data: napok, error: napError } = await supabaseAdmin
    .from("rendeles_napok")
    .select("id, datum, nap, nyitott, hatarido")
    .in("datum", datumok);

  if (napError) {
    return { ok: false, error: "Hiba az átvételi napok ellenőrzésekor.", status: 500 };
  }

  const now = new Date();
  const today = getBudapestDateInput();
  const dayByDate = new Map(((napok ?? []) as OrderDayRow[]).map((nap) => [nap.datum, nap]));

  if (!isManualOrder) {
    for (const datum of datumok) {
      const nap = dayByDate.get(datum);
      const hatarido = nap?.hatarido ? new Date(nap.hatarido) : null;

      if (!nap || !nap.nyitott || datum < today || !hatarido || hatarido <= now) {
        return {
          ok: false,
          error: "A kiválasztott átvételi nap már nem rendelhető. Kérlek válassz új napot.",
          status: 400,
        };
      }
    }
  }

  const napIds = Array.from(new Set((napok ?? []).map((nap) => nap.id)));
  const { data: napiTermekek, error: napiTermekekError } = napIds.length > 0
    ? await supabaseAdmin
      .from("napi_termekek")
      .select("rendeles_nap_id, termek_id")
      .in("rendeles_nap_id", napIds)
    : { data: [], error: null };

  if (napiTermekekError) {
    return { ok: false, error: "Hiba a napi kínálat ellenőrzésekor.", status: 500 };
  }

  const allowedProductsByDayId = new Map<string, Set<string>>();
  for (const row of (napiTermekek ?? []) as NapiTermekRow[]) {
    const current = allowedProductsByDayId.get(row.rendeles_nap_id) ?? new Set<string>();
    current.add(row.termek_id);
    allowedProductsByDayId.set(row.rendeles_nap_id, current);
  }

  const items: PreparedOrderItem[] = [];

  for (const item of requestedItems) {
    const product = productBySlug.get(item.termekSlug)!;
    const nap = dayByDate.get(item.datum) ?? null;
    const allowedProducts = nap
      ? allowedProductsByDayId.get(nap.id) ?? new Set<string>()
      : new Set<string>();

    if (!isManualOrder && !allowedProducts.has(product.id)) {
      return {
        ok: false,
        error: `${product.nev} a kiválasztott átvételi napon már nem elérhető.`,
        status: 400,
      };
    }

    items.push({
      rendeles_nap_id: nap?.id ?? null,
      termek_id: product.id,
      datum: item.datum,
      nap: nap?.nap ?? getNapNev(item.datum),
      termek_nev: product.nev,
      mennyiseg: item.mennyiseg,
      egysegar: product.ar,
      reszosszeg: item.mennyiseg * product.ar,
    });
  }

  return {
    ok: true,
    items,
    total: items.reduce((sum, item) => sum + item.reszosszeg, 0),
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nev, email, telefon, megjegyzes, rendelesek } = body;
    const isManualOrder = body.source === "admin_manual" || body.manual === true;
    const sendEmail = isManualOrder ? body.sendEmail !== false : true;
    const vevoNev = typeof nev === "string" ? nev.trim() : "";
    const vevoEmail = typeof email === "string" ? email.trim() : "";
    const vevoTelefon = typeof telefon === "string" ? telefon.trim() : "";
    const vevoMegjegyzes = typeof megjegyzes === "string" && megjegyzes.trim() ? megjegyzes.trim() : null;
    const submittedRendelesek = Array.isArray(rendelesek) ? rendelesek.filter(isSubmittedOrderItem) : [];
    const marketingAttribution = sanitizeMarketingAttribution(body.marketingAttribution);
    const primaryMarketingTouch = getPrimaryMarketingTouch(marketingAttribution);

    if (isManualOrder) {
      const authError = await requireAdmin(request);
      if (authError) return authError;
    }

    // Validáció
    if (!isManualOrder && !vevoNev) {
      return NextResponse.json({ error: "Név megadása kötelező" }, { status: 400 });
    }
    if (!isManualOrder && (!vevoEmail || !/\S+@\S+\.\S+/.test(vevoEmail))) {
      return NextResponse.json({ error: "Érvényes email cím szükséges" }, { status: 400 });
    }
    if (!isManualOrder && !vevoTelefon) {
      return NextResponse.json({ error: "Telefonszám megadása kötelező" }, { status: 400 });
    }
    if (submittedRendelesek.length === 0) {
      return NextResponse.json({ error: "Legalább egy tétel szükséges" }, { status: 400 });
    }

    const preparedOrder = await prepareOrderItems(submittedRendelesek, isManualOrder);

    if (!preparedOrder.ok) {
      return NextResponse.json({ error: preparedOrder.error }, { status: preparedOrder.status });
    }

    const szamoltVegosszeg = preparedOrder.total;

    // Rendelés mentése
    const marketingRendelesInsert = {
      marketing_attribution: marketingAttribution ?? {},
      traffic_source: primaryMarketingTouch?.traffic_source ?? null,
      traffic_medium: primaryMarketingTouch?.traffic_medium ?? null,
      utm_source: primaryMarketingTouch?.utm_source ?? null,
      utm_medium: primaryMarketingTouch?.utm_medium ?? null,
      utm_campaign: primaryMarketingTouch?.utm_campaign ?? null,
      utm_content: primaryMarketingTouch?.utm_content ?? null,
      utm_term: primaryMarketingTouch?.utm_term ?? null,
      gclid: primaryMarketingTouch?.gclid ?? null,
      fbclid: primaryMarketingTouch?.fbclid ?? null,
      msclkid: primaryMarketingTouch?.msclkid ?? null,
      landing_page: primaryMarketingTouch?.landing_page ?? null,
      referrer: primaryMarketingTouch?.referrer ?? null,
    };

    let rendelesSzam = "";
    let rendeles: { id: string } | null = null;
    let rendelesError: { code?: string; message?: string; details?: string | null } | null = null;

    for (let attempt = 0; attempt < 5; attempt += 1) {
      rendelesSzam = generateRendelesSzam();

      const baseRendelesInsert = {
        rendeles_szam: rendelesSzam,
        nev: vevoNev,
        email: vevoEmail,
        telefon: vevoTelefon,
        megjegyzes: vevoMegjegyzes,
        vegosszeg: szamoltVegosszeg,
        allapot: "uj",
      };

      let insertResult = await supabaseAdmin
        .from("rendelesek")
        .insert({ ...baseRendelesInsert, ...marketingRendelesInsert })
        .select("id")
        .single();

      if (insertResult.error && isMissingMarketingColumnsError(insertResult.error)) {
        console.warn(
          "Marketing attribution columns are missing from rendelesek. Retrying order insert without attribution fields.",
          insertResult.error
        );

        insertResult = await supabaseAdmin
          .from("rendelesek")
          .insert(baseRendelesInsert)
          .select("id")
          .single();
      }

      if (insertResult.error && isDuplicateOrderNumberError(insertResult.error)) {
        rendelesError = insertResult.error;
        continue;
      }

      rendeles = insertResult.data;
      rendelesError = insertResult.error;
      break;
    }

    if (rendelesError || !rendeles) {
      console.error("Rendelés mentési hiba:", rendelesError);
      return NextResponse.json({ error: "Hiba a rendelés mentésekor" }, { status: 500 });
    }

    const tetelek: OrderInsertItem[] = preparedOrder.items.map((item) => ({
      ...item,
      rendeles_id: rendeles.id,
      allapot: "uj",
    }));

    const { error: tetelError } = await supabaseAdmin
      .from("rendeles_tetelek")
      .insert(tetelek);

    if (tetelError) {
      await supabaseAdmin
        .from("rendelesek")
        .delete()
        .eq("id", rendeles.id);
      console.error("Tétel mentési hiba:", tetelError);
      return NextResponse.json({ error: "Hiba a tételek mentésekor" }, { status: 500 });
    }

    const emailNapok = Array.from(new Set(tetelek.map((tetel) => tetel.datum)))
      .sort()
      .map((datum) => {
        const napiTetelek = tetelek.filter((tetel) => tetel.datum === datum);

        return {
          datum,
          nap: napiTetelek[0]?.nap || datum,
          items: napiTetelek.map((tetel) => ({
            nev: tetel.termek_nev,
            mennyiseg: tetel.mennyiseg,
            egysegar: tetel.egysegar,
            reszosszeg: tetel.reszosszeg,
          })),
        };
      });

    if (sendEmail && vevoEmail) {
      try {
        await sendOrderConfirmationEmail({
          customer: {
            nev: vevoNev,
            email: vevoEmail,
            telefon: vevoTelefon,
            megjegyzes: vevoMegjegyzes,
          },
          order: {
            rendelesSzam,
            vegosszeg: szamoltVegosszeg,
            napok: emailNapok,
          },
        });
      } catch (emailError) {
        console.error("Visszaigazoló email küldési hiba:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      rendelesSzam,
    });
  } catch (error) {
    console.error("Rendelés hiba:", error);
    return NextResponse.json({ error: "Váratlan hiba történt" }, { status: 500 });
  }
}
