import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import {
  deriveNapiAllapotok,
  deriveRendelesDisplayAllapot,
  matchesAllapotFilter,
  normalizeTetelAllapot,
} from "@/lib/rendeles-allapot";

type ProductRow = {
  id: string;
  slug: string;
  nev: string;
  kategoria: string;
  ar: number;
  egyseg: string;
  aktiv: boolean;
  sorrend?: number | null;
};

type OrderRow = {
  id: string;
  rendeles_szam: string;
  nev: string;
  email: string;
  telefon: string;
  megjegyzes: string | null;
  vegosszeg: number;
  allapot: string | null;
  created_at: string;
};

type TetelRow = {
  id: string;
  rendeles_id: string;
  rendeles_nap_id: string | null;
  termek_id: string | null;
  datum: string;
  nap: string;
  termek_nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
  allapot?: string | null;
};

type StockRow = {
  id: string;
  datum: string;
  termek_id: string;
  termek_nev: string;
  egyseg: string;
  extra_mennyiseg: number | null;
  elkeszult_mennyiseg: number | null;
  megjegyzes: string | null;
  updated_at?: string | null;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 31;

const NAP_NEVEK: Record<number, string> = {
  0: "Vasárnap",
  1: "Hétfő",
  2: "Kedd",
  3: "Szerda",
  4: "Csütörtök",
  5: "Péntek",
  6: "Szombat",
};

function toDateInput(date: Date) {
  return date.toISOString().split("T")[0];
}

function addDays(input: string, days: number) {
  const date = new Date(`${input}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

function daysBetween(tol: string, ig: string) {
  const result: string[] = [];
  let cursor = tol;
  while (cursor <= ig && result.length < MAX_RANGE_DAYS) {
    result.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return result;
}

function getNapNev(datum: string) {
  return NAP_NEVEK[new Date(`${datum}T12:00:00`).getDay()];
}

function safeNumber(value: number | null | undefined) {
  return Number(value ?? 0);
}

function getDateRange(searchParams: URLSearchParams) {
  const today = toDateInput(new Date());
  const tolParam = searchParams.get("tol");
  const igParam = searchParams.get("ig");
  const tol = tolParam && DATE_RE.test(tolParam) ? tolParam : today;
  let ig = igParam && DATE_RE.test(igParam) ? igParam : addDays(tol, 6);

  if (ig < tol) ig = tol;
  const maxIg = addDays(tol, MAX_RANGE_DAYS - 1);
  if (ig > maxIg) ig = maxIg;

  return { tol, ig };
}

function searchMatches(order: OrderRow, query: string) {
  const haystack = [
    order.nev,
    order.email,
    order.telefon,
    order.rendeles_szam,
    order.megjegyzes ?? "",
  ].join(" ").toLowerCase();

  return haystack.includes(query);
}

function isMissingStockTable(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return error.code === "42P01" || (error.message ?? "").toLowerCase().includes("napi_keszlet");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { tol, ig } = getDateRange(searchParams);
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const allapot = searchParams.get("allapot") ?? "mind";
  const selectedProductIds = new Set(
    (searchParams.get("termekek") ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean)
  );

  const [
    productsResult,
    napokResult,
    tetelekResult,
    stockResult,
  ] = await Promise.all([
    supabaseAdmin
      .from("termekek")
      .select("id, slug, nev, kategoria, ar, egyseg, aktiv, sorrend")
      .order("sorrend"),
    supabaseAdmin
      .from("rendeles_napok")
      .select("id, datum, nap, nyitott, hatarido")
      .gte("datum", tol)
      .lte("datum", ig)
      .order("datum"),
    supabaseAdmin
      .from("rendeles_tetelek")
      .select("id, rendeles_id, rendeles_nap_id, termek_id, datum, nap, termek_nev, mennyiseg, egysegar, reszosszeg, allapot")
      .gte("datum", tol)
      .lte("datum", ig)
      .order("datum"),
    supabaseAdmin
      .from("napi_keszlet")
      .select("id, datum, termek_id, termek_nev, egyseg, extra_mennyiseg, elkeszult_mennyiseg, megjegyzes, updated_at")
      .gte("datum", tol)
      .lte("datum", ig),
  ]);

  if (productsResult.error) {
    return NextResponse.json({ error: productsResult.error.message }, { status: 500 });
  }
  if (napokResult.error) {
    return NextResponse.json({ error: napokResult.error.message }, { status: 500 });
  }
  if (tetelekResult.error) {
    return NextResponse.json({ error: tetelekResult.error.message }, { status: 500 });
  }
  if (stockResult.error && !isMissingStockTable(stockResult.error)) {
    return NextResponse.json({ error: stockResult.error.message }, { status: 500 });
  }

  const products = ((productsResult.data ?? []) as ProductRow[]).filter((product) => product.aktiv);
  const allTetelek = (tetelekResult.data ?? []) as TetelRow[];
  const filteredTetelekForOrders = selectedProductIds.size > 0
    ? allTetelek.filter((tetel) => tetel.termek_id && selectedProductIds.has(tetel.termek_id))
    : allTetelek;
  const orderIds = Array.from(new Set(filteredTetelekForOrders.map((tetel) => tetel.rendeles_id)));

  let orders: OrderRow[] = [];
  if (orderIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("rendelesek")
      .select("id, rendeles_szam, nev, email, telefon, megjegyzes, vegosszeg, allapot, created_at")
      .in("id", orderIds)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    orders = (data ?? []) as OrderRow[];
  }

  const activeOrderIds = new Set(
    orders
      .filter((order) => order.allapot !== "torolve")
      .filter((order) => deriveRendelesDisplayAllapot(allTetelek.filter((tetel) => tetel.rendeles_id === order.id), order.allapot) !== "torolve")
      .map((order) => order.id)
  );

  const stockRows = stockResult.error ? [] : ((stockResult.data ?? []) as StockRow[]);
  const stockByDayProduct = new Map(stockRows.map((row) => [`${row.datum}__${row.termek_id}`, row]));
  const dayList = daysBetween(tol, ig);
  const napokByDatum = new Map((napokResult.data ?? []).map((nap) => [nap.datum, nap]));

  const summaries = dayList.map((datum) => {
    const productSummaries = products
      .filter((product) => selectedProductIds.size === 0 || selectedProductIds.has(product.id))
      .map((product) => {
        const dayItems = allTetelek.filter((tetel) =>
          tetel.datum === datum &&
          tetel.termek_id === product.id &&
          activeOrderIds.has(tetel.rendeles_id) &&
          normalizeTetelAllapot(tetel.allapot) !== "torolve"
        );
        const stock = stockByDayProduct.get(`${datum}__${product.id}`);
        const elorendelve = dayItems.reduce((sum, item) => sum + safeNumber(item.mennyiseg), 0);
        const kiadva = dayItems
          .filter((item) => normalizeTetelAllapot(item.allapot) === "atvetel")
          .reduce((sum, item) => sum + safeNumber(item.mennyiseg), 0);
        const extra = safeNumber(stock?.extra_mennyiseg);
        const elkeszult = safeNumber(stock?.elkeszult_mennyiseg);
        const gyartando = elorendelve;
        const foglaltMeg = Math.max(0, elorendelve - kiadva);
        const raktaron = elkeszult - kiadva - extra;

        return {
          datum,
          termek_id: product.id,
          slug: product.slug,
          termek_nev: product.nev,
          kategoria: product.kategoria,
          egyseg: product.egyseg,
          ar: product.ar,
          elorendelve,
          extra_mennyiseg: extra,
          gyartando,
          elkeszult_mennyiseg: elkeszult,
          kesz_tetelek: 0,
          kiadva,
          foglalt_meg: foglaltMeg,
          szabad_keszlet: raktaron,
          hiany: Math.max(0, elorendelve - elkeszult),
          megjegyzes: stock?.megjegyzes ?? "",
          updated_at: stock?.updated_at ?? null,
        };
      });

    const totals = productSummaries.reduce(
      (acc, item) => {
        acc.elorendelve += item.elorendelve;
        acc.extra += item.extra_mennyiseg;
        acc.gyartando += item.gyartando;
        acc.elkeszult += item.elkeszult_mennyiseg;
        acc.kiadva += item.kiadva;
        acc.hiany += item.hiany;
        acc.szabad += item.szabad_keszlet;
        return acc;
      },
      { elorendelve: 0, extra: 0, gyartando: 0, elkeszult: 0, kiadva: 0, hiany: 0, szabad: 0 }
    );

    return {
      datum,
      nap: napokByDatum.get(datum)?.nap ?? getNapNev(datum),
      rendelesNap: napokByDatum.get(datum) ?? null,
      products: productSummaries,
      totals,
    };
  });

  const rendelesek = orders
    .map((order) => {
      const tetelek = allTetelek
        .filter((tetel) => tetel.rendeles_id === order.id)
        .sort((a, b) => a.datum.localeCompare(b.datum));
      const calculatedDisplayAllapot = order.allapot === "torolve"
        ? "torolve"
        : deriveRendelesDisplayAllapot(tetelek, order.allapot);
      const display_allapot =
        calculatedDisplayAllapot === "kesz" || calculatedDisplayAllapot === "reszben"
          ? "uj"
          : calculatedDisplayAllapot;

      return {
        ...order,
        allapot: display_allapot,
        display_allapot,
        napi_allapotok: deriveNapiAllapotok(tetelek),
        rendeles_tetelek: tetelek,
      };
    })
    .filter((order) => (query ? searchMatches(order, query) : true))
    .filter((order) => matchesAllapotFilter(order.rendeles_tetelek, order.display_allapot, allapot));

  return NextResponse.json({
    dateRange: { tol, ig },
    products,
    napok: napokResult.data ?? [],
    summaries,
    rendelesek,
    stockTrackingReady: !stockResult.error,
    stockTrackingError: stockResult.error ? "A napi_keszlet tábla még nincs létrehozva." : null,
  });
}
