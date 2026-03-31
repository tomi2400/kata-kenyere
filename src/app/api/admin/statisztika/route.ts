import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

type OrderRow = {
  id: string;
  email: string | null;
  created_at: string;
  vegosszeg: number;
  allapot: string | null;
};

type ItemRow = {
  datum: string;
  termek_nev: string;
  mennyiseg: number;
  rendeles_id: string;
  termek_id: string | null;
  reszosszeg: number;
  allapot: string | null;
};

type ProductRow = {
  id: string;
  nev: string;
  egyseg: string | null;
  kategoria: string | null;
};

const HET_NAPJAI = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
const HET_NAP_SORREND = ["Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat", "Vasárnap"];

function normalizeEmail(email: string | null) {
  return email?.trim().toLowerCase() || null;
}

function formatProductLabel(product: ProductRow | undefined, fallbackName: string) {
  if (!product) return fallbackName;
  return product.egyseg ? `${product.nev} (${product.egyseg})` : product.nev;
}

function getWeekdayLabel(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  return HET_NAPJAI[date.getDay()];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  let tolStr: string;
  let igStr: string;

  if (searchParams.get("tol") && searchParams.get("ig")) {
    tolStr = searchParams.get("tol")!;
    igStr = searchParams.get("ig")!;
  } else {
    const days = Number(searchParams.get("days") || "30");
    const ig = new Date();
    const tol = new Date();
    tol.setDate(tol.getDate() - days);
    tolStr = tol.toISOString().split("T")[0];
    igStr = ig.toISOString().split("T")[0];
  }

  const tolISO = `${tolStr}T00:00:00.000Z`;
  const igISO = `${igStr}T23:59:59.999Z`;

  const [{ data: ordersData, error: ordersError }, { data: itemsData, error: itemsError }] = await Promise.all([
    supabaseAdmin
      .from("rendelesek")
      .select("id, email, created_at, vegosszeg, allapot")
      .gte("created_at", tolISO)
      .lte("created_at", igISO),
    supabaseAdmin
      .from("rendeles_tetelek")
      .select("datum, termek_nev, mennyiseg, rendeles_id, termek_id, reszosszeg, allapot")
      .gte("datum", tolStr)
      .lte("datum", igStr),
  ]);

  if (ordersError || itemsError) {
    console.error("Statisztika lekérdezési hiba:", ordersError || itemsError);
    return NextResponse.json({ error: "Hiba a statisztikák betöltésekor" }, { status: 500 });
  }

  const allOrders = (ordersData ?? []) as OrderRow[];
  const activeOrders = allOrders.filter((order) => order.allapot !== "torolve");
  const activeOrderIds = new Set(activeOrders.map((order) => order.id));
  const toroltRendelesekSzama = allOrders.length - activeOrders.length;

  const allItems = (itemsData ?? []) as ItemRow[];
  const activeItems = allItems.filter(
    (item) => activeOrderIds.has(item.rendeles_id) && item.allapot !== "torolve"
  );

  const productIds = Array.from(new Set(activeItems.map((item) => item.termek_id).filter(Boolean))) as string[];
  const { data: productsData, error: productsError } = productIds.length > 0
    ? await supabaseAdmin
      .from("termekek")
      .select("id, nev, egyseg, kategoria")
      .in("id", productIds)
    : { data: [], error: null };

  if (productsError) {
    console.error("Termék statisztika lekérdezési hiba:", productsError);
    return NextResponse.json({ error: "Hiba a statisztikák betöltésekor" }, { status: 500 });
  }

  const productById = new Map(((productsData ?? []) as ProductRow[]).map((product) => [product.id, product]));

  const osszRendeles = activeOrders.length;
  const osszBevetel = activeOrders.reduce((sum, order) => sum + (order.vegosszeg || 0), 0);
  const atlagErtek = osszRendeles > 0 ? Math.round(osszBevetel / osszRendeles) : 0;

  const termekStatsMap: Record<string, {
    nev: string;
    kategori: string;
    mennyiseg: number;
    bevetel: number;
  }> = {};

  const atveteliNapMap: Record<string, {
    rendelesSet: Set<string>;
    tetelDb: number;
    bevetel: number;
  }> = {};

  const napiTrendMap: Record<string, { rendeles: number; bevetel: number }> = {};
  const termekTrendMap: Record<string, Record<string, number>> = {};
  const hetnapMap: Record<string, { rendelesSet: Set<string>; tetelDb: number; bevetel: number }> = {};

  for (const order of activeOrders) {
    const nap = order.created_at.split("T")[0];
    if (!napiTrendMap[nap]) napiTrendMap[nap] = { rendeles: 0, bevetel: 0 };
    napiTrendMap[nap].rendeles += 1;
    napiTrendMap[nap].bevetel += order.vegosszeg || 0;
  }

  for (const item of activeItems) {
    const product = item.termek_id ? productById.get(item.termek_id) : undefined;
    const productKey = item.termek_id || `${item.termek_nev}__fallback`;
    const productName = formatProductLabel(product, item.termek_nev);
    const category = product?.kategoria || "Egyéb";

    if (!termekStatsMap[productKey]) {
      termekStatsMap[productKey] = {
        nev: productName,
        kategori: category,
        mennyiseg: 0,
        bevetel: 0,
      };
    }
    termekStatsMap[productKey].mennyiseg += item.mennyiseg || 0;
    termekStatsMap[productKey].bevetel += item.reszosszeg || 0;

    if (!atveteliNapMap[item.datum]) {
      atveteliNapMap[item.datum] = { rendelesSet: new Set(), tetelDb: 0, bevetel: 0 };
    }
    atveteliNapMap[item.datum].rendelesSet.add(item.rendeles_id);
    atveteliNapMap[item.datum].tetelDb += item.mennyiseg || 0;
    atveteliNapMap[item.datum].bevetel += item.reszosszeg || 0;

    const hetNap = getWeekdayLabel(item.datum);
    if (!hetnapMap[hetNap]) {
      hetnapMap[hetNap] = { rendelesSet: new Set(), tetelDb: 0, bevetel: 0 };
    }
    hetnapMap[hetNap].rendelesSet.add(item.rendeles_id);
    hetnapMap[hetNap].tetelDb += item.mennyiseg || 0;
    hetnapMap[hetNap].bevetel += item.reszosszeg || 0;

    if (!termekTrendMap[productName]) termekTrendMap[productName] = {};
    termekTrendMap[productName][item.datum] =
      (termekTrendMap[productName][item.datum] || 0) + (item.mennyiseg || 0);
  }

  const topTermekek = Object.values(termekStatsMap)
    .sort((a, b) => b.mennyiseg - a.mennyiseg)
    .slice(0, 10)
    .map(({ nev, kategori, mennyiseg, bevetel }) => ({ nev, kategoria: kategori, mennyiseg, bevetel }));

  const topBevetelesTermekek = Object.values(termekStatsMap)
    .sort((a, b) => b.bevetel - a.bevetel)
    .slice(0, 10)
    .map(({ nev, kategori, mennyiseg, bevetel }) => ({ nev, kategoria: kategori, mennyiseg, bevetel }));

  const top5TrendTermekek = topTermekek.slice(0, 5).map((termek) => termek.nev);
  const termekTrend = top5TrendTermekek.map((nev) => ({
    nev,
    adatok: Object.entries(termekTrendMap[nev] ?? {})
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([datum, mennyiseg]) => ({ datum, mennyiseg })),
  }));

  const atveteliNapok = Object.entries(atveteliNapMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([datum, data]) => ({
      datum,
      rendelesDb: data.rendelesSet.size,
      tetelDb: data.tetelDb,
      bevetel: data.bevetel,
      hetNap: getWeekdayLabel(datum),
    }));

  const napiTrend = Object.entries(napiTrendMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([datum, data]) => ({ datum, ...data }));

  const hetNapok = HET_NAP_SORREND.map((nap) => {
    const data = hetnapMap[nap];
    return {
      nap,
      rendelesDb: data?.rendelesSet.size || 0,
      tetelDb: data?.tetelDb || 0,
      bevetel: data?.bevetel || 0,
      atlagKosar: data?.rendelesSet.size ? Math.round((data.bevetel || 0) / data.rendelesSet.size) : 0,
    };
  }).filter((row) => row.rendelesDb > 0 || row.tetelDb > 0 || row.bevetel > 0);

  const emailMap: Record<string, { rendelesDb: number; bevetel: number }> = {};
  for (const order of activeOrders) {
    const normalized = normalizeEmail(order.email);
    if (!normalized) continue;
    if (!emailMap[normalized]) emailMap[normalized] = { rendelesDb: 0, bevetel: 0 };
    emailMap[normalized].rendelesDb += 1;
    emailMap[normalized].bevetel += order.vegosszeg || 0;
  }

  const customerEntries = Object.values(emailMap);
  const egyediVasarlok = customerEntries.length;
  const visszateroCustomers = customerEntries.filter((customer) => customer.rendelesDb > 1);
  const visszateroVasarlok = visszateroCustomers.length;
  const visszateroRendelesek = visszateroCustomers.reduce((sum, customer) => sum + customer.rendelesDb, 0);
  const visszateroBevetel = visszateroCustomers.reduce((sum, customer) => sum + customer.bevetel, 0);

  const termekParMap: Record<string, { par: string; rendelesDb: number }> = {};
  const activeItemsByOrder = new Map<string, Set<string>>();
  for (const item of activeItems) {
    const product = item.termek_id ? productById.get(item.termek_id) : undefined;
    const productKey = item.termek_id || `${item.termek_nev}__fallback`;
    const productName = formatProductLabel(product, item.termek_nev);
    if (!activeItemsByOrder.has(item.rendeles_id)) activeItemsByOrder.set(item.rendeles_id, new Set());
    activeItemsByOrder.get(item.rendeles_id)!.add(`${productKey}|||${productName}`);
  }

  for (const uniqueProducts of Array.from(activeItemsByOrder.values())) {
    const products = Array.from(uniqueProducts).sort();
    for (let i = 0; i < products.length; i += 1) {
      for (let j = i + 1; j < products.length; j += 1) {
        const [, leftName] = products[i].split("|||");
        const [, rightName] = products[j].split("|||");
        const pairLabel = `${leftName} + ${rightName}`;
        if (!termekParMap[pairLabel]) termekParMap[pairLabel] = { par: pairLabel, rendelesDb: 0 };
        termekParMap[pairLabel].rendelesDb += 1;
      }
    }
  }

  const topTermekParok = Object.values(termekParMap)
    .sort((a, b) => b.rendelesDb - a.rendelesDb)
    .slice(0, 8);

  const legerosebbAtveteliNap = atveteliNapok.reduce(
    (best, current) => (current.rendelesDb > best.rendelesDb ? current : best),
    { datum: "", rendelesDb: 0, tetelDb: 0, bevetel: 0, hetNap: "" }
  );

  return NextResponse.json({
    osszRendeles,
    osszBevetel,
    atlagErtek,
    topTermekek,
    topBevetelesTermekek,
    napiTrend,
    atveteliNapok,
    hetNapok,
    termekTrend,
    visszateroVasarlok: {
      egyediVasarlok,
      visszateroVasarlok,
      arany: egyediVasarlok > 0 ? Math.round((visszateroVasarlok / egyediVasarlok) * 100) : 0,
      visszateroRendelesek,
      visszateroBevetel,
    },
    topTermekParok,
    torlesek: {
      darab: toroltRendelesekSzama,
      arany: allOrders.length > 0 ? Math.round((toroltRendelesekSzama / allOrders.length) * 100) : 0,
    },
    pekKpi: {
      legerosebbAtveteliNap,
      topDarabTermek: topTermekek[0] ?? null,
      topBevetelTermek: topBevetelesTermekek[0] ?? null,
    },
    tol: tolStr,
    ig: igStr,
  });
}
