"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  ChevronDown,
  ClipboardList,
  Mail,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-api";

type Product = {
  id: string;
  slug: string;
  nev: string;
  kategoria: string;
  ar: number;
  egyseg: string;
  aktiv: boolean;
};

type ProductSummary = {
  datum: string;
  termek_id: string;
  slug: string;
  termek_nev: string;
  kategoria: string;
  egyseg: string;
  ar: number;
  elorendelve: number;
  extra_mennyiseg: number;
  gyartando: number;
  elkeszult_mennyiseg: number;
  kesz_tetelek: number;
  kiadva: number;
  foglalt_meg: number;
  szabad_keszlet: number;
  hiany: number;
  megjegyzes: string;
  updated_at: string | null;
};

type WorkshopDay = {
  datum: string;
  nap: string;
  rendelesNap: { id: string; datum: string; nap: string; nyitott: boolean; hatarido: string | null } | null;
  products: ProductSummary[];
  totals: {
    elorendelve: number;
    extra: number;
    gyartando: number;
    elkeszult: number;
    kiadva: number;
    hiany: number;
    szabad: number;
  };
};

type Tetel = {
  id: string;
  datum: string;
  nap: string;
  termek_id: string | null;
  termek_nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
  allapot: string | null;
};

type Rendeles = {
  id: string;
  rendeles_szam: string;
  nev: string;
  email: string;
  telefon: string;
  megjegyzes: string | null;
  vegosszeg: number;
  allapot: string;
  display_allapot: string;
  created_at: string;
  rendeles_tetelek: Tetel[];
  napi_allapotok: { datum: string; nap: string; allapot: string }[];
};

type WorkshopData = {
  dateRange: { tol: string; ig: string };
  products: Product[];
  summaries: WorkshopDay[];
  rendelesek: Rendeles[];
  stockTrackingReady: boolean;
  stockTrackingError: string | null;
};

type StockDraft = {
  extra_mennyiseg: string;
  elkeszult_mennyiseg: string;
  megjegyzes: string;
};

type ManualOrderItem = {
  id: string;
  datum: string;
  termekSlug: string;
  mennyiseg: number;
};

type ManualOrderForm = {
  nev: string;
  email: string;
  telefon: string;
  megjegyzes: string;
  sendEmail: boolean;
  items: ManualOrderItem[];
};

const VIEW_LABELS = [
  { id: "rendelesek", label: "Rendelések", icon: ClipboardList },
  { id: "gyartas", label: "Gyártás, kiadás", icon: PackageCheck },
] as const;

type ViewId = (typeof VIEW_LABELS)[number]["id"];

const ALLAPOT_LABELS: Record<string, { label: string; color: string }> = {
  uj: { label: "Új", color: "bg-blue-100 text-blue-800 border-blue-200" },
  atvetel: { label: "Átvéve", color: "bg-purple-100 text-purple-800 border-purple-200" },
  torolve: { label: "Törölve", color: "bg-red-100 text-red-800 border-red-200" },
};

const ALLAPOT_OPTIONS = ["mind", "uj", "atvetel", "torolve"];
const TETEL_ALLAPOT_SORREND = ["uj", "atvetel", "torolve"];
const HU_DAYS = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(input: string, days: number) {
  const date = new Date(`${input}T12:00:00`);
  date.setDate(date.getDate() + days);
  return toInputDate(date);
}

function formatDayDate(datum: string) {
  const date = new Date(`${datum}T12:00:00`);
  return date.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}

function formatLongDate(datum: string) {
  const date = new Date(`${datum}T12:00:00`);
  return date.toLocaleDateString("hu-HU", { weekday: "long", month: "long", day: "numeric" });
}

function getNapNev(datum: string) {
  return HU_DAYS[new Date(`${datum}T12:00:00`).getDay()];
}

function formatFt(value: number) {
  return `${value.toLocaleString("hu-HU")} Ft`;
}

function getStockKey(datum: string, termekId: string) {
  return `${datum}__${termekId}`;
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
}

function totalProducedValue(orderedQuantity: number, extraQuantity: string) {
  return String(orderedQuantity + numberValue(extraQuantity));
}

function getTetelAllapot(tetel: Pick<Tetel, "allapot">) {
  return tetel.allapot === "kesz" ? "uj" : tetel.allapot || "uj";
}

function getDisplayAllapot(allapot: string | null) {
  return allapot === "kesz" || allapot === "reszben" ? "uj" : allapot || "uj";
}

function getInitialManualForm(datum: string, product?: Product): ManualOrderForm {
  return {
    nev: "",
    email: "",
    telefon: "",
    megjegyzes: "",
    sendEmail: false,
    items: [
      {
        id: crypto.randomUUID(),
        datum,
        termekSlug: product?.slug ?? "",
        mennyiseg: 1,
      },
    ],
  };
}

function getOrderDisplayName(order: Pick<Rendeles, "nev">) {
  return order.nev?.trim() || "Név nélkül";
}

function getOptionalContact(value: string) {
  return value?.trim() || "Nincs megadva";
}

export default function MuhelyPage() {
  const today = useMemo(() => toInputDate(new Date()), []);
  const [activeView, setActiveView] = useState<ViewId>("rendelesek");
  const [tol, setTol] = useState(today);
  const [ig, setIg] = useState(addDays(today, 6));
  const [selectedDate, setSelectedDate] = useState(today);
  const [search, setSearch] = useState("");
  const [allapot, setAllapot] = useState("mind");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [productionProductQuery, setProductionProductQuery] = useState("");
  const [productionSelectedProductIds, setProductionSelectedProductIds] = useState<string[]>([]);
  const lastProductionSelectionDateRef = useRef<string | null>(null);
  const [data, setData] = useState<WorkshopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stockDrafts, setStockDrafts] = useState<Record<string, StockDraft>>({});
  const [savingStockKey, setSavingStockKey] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);
  const [dateEdits, setDateEdits] = useState<Record<string, string>>({});
  const [showManualOrder, setShowManualOrder] = useState(false);
  const [manualForm, setManualForm] = useState<ManualOrderForm>(() => getInitialManualForm(today));
  const [manualSaving, setManualSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const productMap = useMemo(
    () => new Map((data?.products ?? []).map((product) => [product.slug, product])),
    [data?.products]
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ tol, ig, allapot });
    if (search.trim()) params.set("q", search.trim());
    if (selectedProductIds.length > 0) params.set("termekek", selectedProductIds.join(","));

    try {
      const res = await adminFetch(`/api/admin/muhely?${params.toString()}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nem sikerült betölteni a műhely adatokat.");
      setData(json);
      if (!json.summaries?.some((day: WorkshopDay) => day.datum === selectedDate)) {
        setSelectedDate(json.summaries?.[0]?.datum ?? tol);
      }
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Nem sikerült betölteni a műhely adatokat.");
    } finally {
      setLoading(false);
    }
  }, [allapot, ig, search, selectedDate, selectedProductIds, tol]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchData();
    }, search ? 250 : 0);

    return () => clearTimeout(timeout);
  }, [fetchData, search]);

  useEffect(() => {
    if (!data) return;
    const nextDrafts: Record<string, StockDraft> = {};
    for (const day of data.summaries) {
      for (const product of day.products) {
        nextDrafts[getStockKey(day.datum, product.termek_id)] = {
          extra_mennyiseg: String(product.extra_mennyiseg),
          elkeszult_mennyiseg: String(product.elkeszult_mennyiseg),
          megjegyzes: product.megjegyzes ?? "",
        };
      }
    }
    setStockDrafts(nextDrafts);
  }, [data]);

  const selectedDay = data?.summaries.find((day) => day.datum === selectedDate) ?? data?.summaries[0] ?? null;
  const visibleOrders = useMemo(
    () => (data?.rendelesek ?? []).filter((order) =>
      order.rendeles_tetelek.some((tetel) => tetel.datum === selectedDate)
    ),
    [data?.rendelesek, selectedDate]
  );
  const selectedOrder = visibleOrders.find((order) => order.id === selectedOrderId) ?? null;

  useEffect(() => {
    if (!selectedOrderId) return;
    if (!visibleOrders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(null);
    }
  }, [selectedOrderId, visibleOrders]);

  useEffect(() => {
    if (!selectedOrder) return;
    const nextValues = selectedOrder.rendeles_tetelek.reduce<Record<string, string>>((acc, tetel) => {
      acc[tetel.id] = tetel.datum;
      return acc;
    }, {});
    setDateEdits(nextValues);
  }, [selectedOrder]);

  const visibleDayProducts = useMemo(() => {
    const rows = selectedDay?.products ?? [];
    const query = productionProductQuery.trim().toLowerCase();
    const selectedIds = new Set(productionSelectedProductIds);

    const selectedRows = rows.filter((item) => selectedIds.has(item.termek_id));

    if (!query) return selectedRows;

    return selectedRows.filter((item) =>
      `${item.termek_nev} ${item.kategoria} ${item.egyseg}`.toLowerCase().includes(query)
    );
  }, [productionProductQuery, productionSelectedProductIds, selectedDay?.products]);

  const preorderedProductionProductIds = useMemo(
    () => (selectedDay?.products ?? [])
      .filter((product) => product.elorendelve > 0)
      .map((product) => product.termek_id),
    [selectedDay?.products]
  );

  const preorderedSelectionActive = useMemo(() => {
    if (preorderedProductionProductIds.length === 0) return false;
    if (productionSelectedProductIds.length !== preorderedProductionProductIds.length) return false;

    const selectedIds = new Set(productionSelectedProductIds);

    return preorderedProductionProductIds.every((id) => selectedIds.has(id));
  }, [preorderedProductionProductIds, productionSelectedProductIds]);

  const productionProductOptions = useMemo(() => {
    const rows = selectedDay?.products ?? [];
    const query = productionProductQuery.trim().toLowerCase();

    if (!query) return rows;

    return rows.filter((item) =>
      `${item.termek_nev} ${item.kategoria} ${item.egyseg}`.toLowerCase().includes(query)
    );
  }, [productionProductQuery, selectedDay?.products]);

  useEffect(() => {
    if (!selectedDay) return;
    if (lastProductionSelectionDateRef.current === selectedDay.datum) return;

    lastProductionSelectionDateRef.current = selectedDay.datum;
    setProductionSelectedProductIds(preorderedProductionProductIds);
  }, [preorderedProductionProductIds, selectedDay]);

  const getOrderItemsForProduct = useCallback((datum: string, termekId: string) => {
    return (data?.rendelesek ?? [])
      .filter((order) => order.display_allapot !== "torolve")
      .flatMap((order) =>
        order.rendeles_tetelek
          .filter((tetel) => tetel.datum === datum && tetel.termek_id === termekId && getTetelAllapot(tetel) !== "torolve")
          .map((tetel) => ({ order, tetel }))
      )
      .sort((a, b) => getOrderDisplayName(a.order).localeCompare(getOrderDisplayName(b.order), "hu"));
  }, [data?.rendelesek]);

  const updateDatePreset = (preset: "today" | "tomorrow" | "week") => {
    if (preset === "today") {
      setTol(today);
      setIg(today);
      setSelectedDate(today);
    }
    if (preset === "tomorrow") {
      const tomorrow = addDays(today, 1);
      setTol(tomorrow);
      setIg(tomorrow);
      setSelectedDate(tomorrow);
    }
    if (preset === "week") {
      setTol(today);
      setIg(addDays(today, 6));
      setSelectedDate(today);
    }
  };

  const toggleProductFilter = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleProductionProduct = (productId: string) => {
    setProductionSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const selectPreorderedProductionProducts = () => {
    setProductionSelectedProductIds(preorderedProductionProductIds);
  };

  const selectAllProductionProducts = () => {
    setProductionSelectedProductIds((selectedDay?.products ?? []).map((product) => product.termek_id));
  };

  const clearProductionProducts = () => {
    setProductionSelectedProductIds([]);
  };

  const saveStock = async (product: ProductSummary) => {
    const key = getStockKey(product.datum, product.termek_id);
    const draft = stockDrafts[key];
    if (!draft || !data?.stockTrackingReady) return;

    setSavingStockKey(key);
    setNotice("");

    try {
      const res = await adminFetch("/api/admin/muhely/keszlet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datum: product.datum,
          termek_id: product.termek_id,
          extra_mennyiseg: numberValue(draft.extra_mennyiseg),
          elkeszult_mennyiseg: numberValue(draft.elkeszult_mennyiseg),
          megjegyzes: draft.megjegyzes,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nem sikerült menteni a készletet.");
      setNotice("Mennyiségek mentve.");
      await fetchData();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nem sikerült menteni a készletet.");
    } finally {
      setSavingStockKey(null);
    }
  };

  const updateTetelAllapot = async (orderId: string, tetelId: string, nextAllapot: string) => {
    const key = `${orderId}_${tetelId}_${nextAllapot}`;
    setUpdatingKey(key);
    await adminFetch(`/api/admin/rendelesek/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tetelId, allapot: nextAllapot }),
    });
    setUpdatingKey(null);
    await fetchData();
  };

  const updateTetelAtveteliDatum = async (orderId: string, tetelId: string, currentDatum: string, ujDatum: string) => {
    if (!ujDatum || ujDatum === currentDatum) return;
    const key = `${orderId}_${tetelId}_date`;
    setUpdatingKey(key);
    await adminFetch(`/api/admin/rendelesek/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tetelId, ujDatum }),
    });
    setUpdatingKey(null);
    await fetchData();
  };

  const openManualOrder = () => {
    setManualForm(getInitialManualForm(selectedDate, data?.products[0]));
    setShowManualOrder(true);
  };

  const updateManualItem = (id: string, patch: Partial<ManualOrderItem>) => {
    setManualForm((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const addManualItem = () => {
    setManualForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: crypto.randomUUID(),
          datum: selectedDate,
          termekSlug: data?.products[0]?.slug ?? "",
          mennyiseg: 1,
        },
      ],
    }));
  };

  const removeManualItem = (id: string) => {
    setManualForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((item) => item.id !== id),
    }));
  };

  const submitManualOrder = async () => {
    setManualSaving(true);
    setError("");
    setNotice("");

    const rendelesek = manualForm.items
      .map((item) => {
        const product = productMap.get(item.termekSlug);
        if (!product || item.mennyiseg <= 0) return null;

        return {
          nap: getNapNev(item.datum),
          datum: item.datum,
          termekId: product.slug,
          nev: product.nev,
          mennyiseg: item.mennyiseg,
          egysegar: product.ar,
          reszosszeg: product.ar * item.mennyiseg,
        };
      })
      .filter(Boolean);

    try {
      const res = await adminFetch("/api/rendeles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nev: manualForm.nev,
          email: manualForm.email,
          telefon: manualForm.telefon,
          megjegyzes: manualForm.megjegyzes,
          sendEmail: manualForm.sendEmail && Boolean(manualForm.email.trim()),
          source: "admin_manual",
          rendelesek,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Nem sikerült rögzíteni a rendelést.");
      setShowManualOrder(false);
      setNotice(`Rendelés rögzítve: ${json.rendelesSzam}`);
      await fetchData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nem sikerült rögzíteni a rendelést.");
    } finally {
      setManualSaving(false);
    }
  };

  const renderDayTabs = () => (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {(data?.summaries ?? []).map((day) => {
        const active = day.datum === selectedDate;
        return (
          <button
            key={day.datum}
            onClick={() => setSelectedDate(day.datum)}
            className={`min-w-[116px] rounded-lg border px-3 py-2 text-left font-sans transition-colors ${
              active
                ? "border-gold bg-gold/15 text-brown-dark"
                : "border-cream-dark bg-white text-brown/60 hover:border-gold/50"
            }`}
          >
            <span className="block text-xs font-semibold">{day.nap}</span>
            <span className="block text-[11px]">{formatDayDate(day.datum)}</span>
            <span className={`mt-1 block text-[10px] ${day.totals.elorendelve > day.totals.kiadva ? "text-amber-700" : "text-brown/45"}`}>
              {day.totals.elorendelve > day.totals.kiadva
                ? `${day.totals.elorendelve - day.totals.kiadva} kiadandó`
                : "nincs kiadandó"}
            </span>
          </button>
        );
      })}
    </div>
  );

  const renderProductRows = () => {
    if (!selectedDay) return null;

    const rows = visibleDayProducts;

    return (
      <div className="rounded-lg border border-cream-dark bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-dark px-4 py-3">
          <div>
            <h2 className="font-serif text-lg text-brown-dark">{formatLongDate(selectedDay.datum)}</h2>
            <p className="font-sans text-xs text-brown/45">
              Írd be, mennyi készült összesen. Pipáld ki lent, amit már odaadtatok a vevőnek.
            </p>
          </div>
        </div>

        <div className="border-b border-cream-dark bg-cream/25 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-cream-dark bg-white px-3 py-2 md:max-w-[360px]">
              <Search className="h-4 w-4 text-brown/35" />
              <input
                value={productionProductQuery}
                onChange={(event) => setProductionProductQuery(event.target.value)}
                placeholder="Termék keresése"
                className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-brown/35"
              />
            </div>
            <button
              onClick={selectPreorderedProductionProducts}
              disabled={preorderedProductionProductIds.length === 0}
              className={`rounded-lg border px-3 py-2 font-sans text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                preorderedSelectionActive
                  ? "border-gold bg-gold/15 text-brown-dark"
                  : "border-cream-dark bg-white text-brown/70 hover:border-gold"
              }`}
            >
              Előrendeltek kijelölése
            </button>
            <button
              onClick={selectAllProductionProducts}
              className="rounded-lg border border-cream-dark bg-white px-3 py-2 font-sans text-xs font-semibold text-brown/70 hover:border-gold"
            >
              Összes kijelölése
            </button>
            <button
              onClick={clearProductionProducts}
              className="rounded-lg border border-cream-dark bg-white px-3 py-2 font-sans text-xs font-semibold text-brown/55 hover:border-gold"
            >
              Kijelölés törlése
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {productionProductOptions.map((product) => {
              const active = productionSelectedProductIds.includes(product.termek_id);

              return (
                <button
                  key={product.termek_id}
                  onClick={() => toggleProductionProduct(product.termek_id)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-sans text-xs ${
                    active
                      ? "border-gold bg-gold/15 text-brown-dark"
                      : "border-cream-dark bg-white text-brown/60 hover:border-gold/50"
                  }`}
                >
                  <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${active ? "border-gold bg-gold text-brown-dark" : "border-cream-dark"}`}>
                    {active && <Check className="h-3 w-3" />}
                  </span>
                  <span>{product.termek_nev}</span>
                  {product.elorendelve > 0 && (
                    <span className="rounded-full bg-cream-dark px-1.5 py-0.5 text-[10px] text-brown/50">
                      {product.elorendelve}
                    </span>
                  )}
                </button>
              );
            })}
            {productionProductOptions.length === 0 && (
              <p className="font-sans text-xs text-brown/45">Nincs találat erre a keresésre.</p>
            )}
          </div>
          <p className="mt-3 font-sans text-xs text-brown/45">
            {productionSelectedProductIds.length} termék kijelölve
          </p>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center font-sans text-sm text-brown/45">
            Nincs kijelölt termék, ami megfelel a keresésnek.
          </div>
        ) : (
          <div className="divide-y divide-cream-dark">
            {rows.map((product) => {
              const key = getStockKey(product.datum, product.termek_id);
              const draft = stockDrafts[key] ?? {
                extra_mennyiseg: String(product.extra_mennyiseg),
                elkeszult_mennyiseg: String(product.elkeszult_mennyiseg),
                megjegyzes: product.megjegyzes ?? "",
              };
              const draftExtraEladas = numberValue(draft.extra_mennyiseg);
              const draftElkeszult = numberValue(draft.elkeszult_mennyiseg);
              const draftRaktaron = draftElkeszult - product.kiadva - draftExtraEladas;
              const kiadando = Math.max(0, product.elorendelve - product.kiadva);
              const orderItems = getOrderItemsForProduct(product.datum, product.termek_id);

              return (
                <section key={key} className="p-4">
                  <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(360px,1.25fr)]">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-sans text-base font-bold text-brown-dark">{product.termek_nev}</h3>
                        <p className="font-sans text-xs text-brown/45">{product.kategoria} · {product.egyseg}</p>
                      </div>

                      <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
                        <label className="rounded-lg border-2 border-gold/55 bg-gold/10 p-3">
                          <span className="block font-sans text-[10px] font-semibold uppercase leading-tight tracking-normal text-brown/55">
                            Össz. gyártott
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={draft.elkeszult_mennyiseg}
                            disabled={!data?.stockTrackingReady}
                            onChange={(event) => setStockDrafts((prev) => ({
                              ...prev,
                              [key]: { ...draft, elkeszult_mennyiseg: event.target.value },
                            }))}
                            className="mt-2 h-14 w-full rounded-lg border border-gold/40 bg-white px-3 text-center font-sans text-3xl font-bold text-brown-dark outline-none focus:border-gold disabled:bg-cream-dark/40"
                          />
                          <span className="mt-2 block font-sans text-[11px] leading-relaxed text-brown/45">
                            Ezt írjátok be először.
                          </span>
                        </label>

                        <div className="grid min-w-0 grid-cols-3 gap-2">
                          <div className="rounded-lg border border-cream-dark bg-cream/40 p-3">
                            <p className="font-sans text-[10px] font-semibold uppercase leading-tight tracking-normal text-brown/40">
                              Előrendelés
                            </p>
                            <p className="mt-2 font-sans text-2xl font-bold text-brown-dark">{product.elorendelve}</p>
                          </div>
                          <div className="rounded-lg border border-cream-dark bg-cream/40 p-3">
                            <p className="font-sans text-[10px] font-semibold uppercase leading-tight tracking-normal text-brown/40">
                              Kiadva
                            </p>
                            <p className="mt-2 font-sans text-2xl font-bold text-brown-dark">{product.kiadva}</p>
                          </div>
                          <div className="rounded-lg border border-cream-dark bg-cream/40 p-3">
                            <p className="font-sans text-[10px] font-semibold uppercase leading-tight tracking-normal text-brown/40">
                              Még kiadandó
                            </p>
                            <p className="mt-2 font-sans text-2xl font-bold text-brown-dark">{kiadando}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 xl:grid-cols-[220px_minmax(0,1fr)]">
                        <label className="rounded-lg border border-cream-dark bg-white p-3 font-sans text-[10px] font-semibold uppercase leading-tight tracking-normal text-brown/45">
                          Eladás rendelés nélkül
                          <input
                            type="number"
                            min={0}
                            value={draft.extra_mennyiseg}
                            disabled={!data?.stockTrackingReady}
                            onChange={(event) => setStockDrafts((prev) => ({
                              ...prev,
                              [key]: {
                                ...(prev[key] ?? draft),
                                extra_mennyiseg: event.target.value,
                                elkeszult_mennyiseg: totalProducedValue(product.elorendelve, event.target.value),
                              },
                            }))}
                            className="mt-2 h-11 w-full rounded-lg border border-cream-dark bg-white px-3 text-center font-sans text-xl font-bold normal-case tracking-normal text-brown-dark outline-none focus:border-gold disabled:bg-cream-dark/40"
                          />
                        </label>

                        <div className="rounded-lg border border-cream-dark bg-cream/30 p-3">
                          <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
                            <div>
                              <p className="font-sans text-[10px] font-semibold uppercase leading-tight tracking-normal text-brown/40">
                                Várható raktáron nap végén
                              </p>
                              <p className="mt-1 font-sans text-xs leading-relaxed text-brown/50">
                                Össz. gyártott mínusz kiadott előrendelés mínusz rendelés nélküli eladás.
                              </p>
                            </div>
                            <p className="font-sans text-3xl font-bold text-brown-dark">{draftRaktaron}</p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                        <input
                          type="text"
                          value={draft.megjegyzes}
                          disabled={!data?.stockTrackingReady}
                          placeholder="Megjegyzés: pl. pultos eladás, félretéve, nap végén maradt"
                          onChange={(event) => setStockDrafts((prev) => ({
                            ...prev,
                            [key]: { ...draft, megjegyzes: event.target.value },
                          }))}
                          className="h-10 rounded-lg border border-cream-dark bg-white px-3 font-sans text-sm outline-none focus:border-gold disabled:bg-cream-dark/40"
                        />
                        <button
                          onClick={() => saveStock(product)}
                          disabled={!data?.stockTrackingReady || savingStockKey !== null}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brown-dark px-4 font-sans text-sm font-semibold text-cream hover:bg-brown disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {savingStockKey === key ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          Mennyiségek mentése
                        </button>
                      </div>
                    </div>

                    <div className="rounded-lg border border-cream-dark bg-cream/25">
                      <div className="border-b border-cream-dark px-3 py-2">
                        <p className="font-sans text-sm font-bold text-brown-dark">Kinek kell kiadni?</p>
                        <p className="font-sans text-xs text-brown/45">Ha a vevő átvette ezt a terméket, pipáld ki.</p>
                      </div>
                      {orderItems.length === 0 ? (
                        <div className="px-3 py-8 text-center font-sans text-sm text-brown/45">Nincs előrendelés ebből a termékből.</div>
                      ) : (
                        <div className="divide-y divide-cream-dark">
                          {orderItems.map(({ order, tetel }) => {
                            const allapot = getTetelAllapot(tetel);
                            const issued = allapot === "atvetel";
                            const actionKey = `${order.id}_${tetel.id}_${issued ? "uj" : "atvetel"}`;

                            return (
                              <div key={tetel.id} className={`grid grid-cols-[1fr_auto] gap-3 px-3 py-2 ${issued ? "bg-green-50" : "bg-white"}`}>
                                <div className="min-w-0">
                                  <p className={`truncate font-sans text-sm font-semibold ${issued ? "text-green-800 line-through" : "text-brown-dark"}`}>
                                    {order.nev}
                                  </p>
                                  <p className="font-sans text-xs text-brown/45">
                                    {tetel.mennyiseg} db · {order.rendeles_szam}
                                  </p>
                                </div>
                                <button
                                  onClick={() => updateTetelAllapot(order.id, tetel.id, issued ? "uj" : "atvetel")}
                                  disabled={updatingKey !== null}
                                  className={`inline-flex min-w-[104px] items-center justify-center gap-2 rounded-lg border px-3 py-2 font-sans text-xs font-bold ${
                                    issued
                                      ? "border-green-500 bg-green-500 text-white"
                                      : "border-cream-dark bg-white text-brown-dark hover:border-gold"
                                  } disabled:cursor-not-allowed disabled:opacity-50`}
                                >
                                  {updatingKey === actionKey ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : issued ? <Check className="h-3.5 w-3.5" /> : null}
                                  {issued ? "Kiadva" : "Kiadás"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderOrders = () => (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="rounded-lg border border-cream-dark bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-dark px-4 py-3">
          <div>
            <h2 className="font-serif text-lg text-brown-dark">Rendelések</h2>
            <p className="font-sans text-xs text-brown/45">
              {selectedDay ? `${formatLongDate(selectedDay.datum)} rendelései. A többnapos rendelések teljes részlete megmarad.` : "Név, email, telefon, termék és állapot szerint is szűrhető."}
            </p>
          </div>
          <button
            onClick={openManualOrder}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-3 py-2 font-sans text-sm font-semibold text-brown-dark hover:bg-gold-light"
          >
            <Plus className="h-4 w-4" />
            Új rendelés
          </button>
        </div>

        {!data || visibleOrders.length === 0 ? (
          <div className="px-4 py-12 text-center font-sans text-sm text-brown/45">Nincs rendelés a kiválasztott napra a megadott szűréssel.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-cream-dark bg-cream-dark/40">
                  <th className="px-4 py-3 text-left font-sans text-xs font-semibold text-brown/55">Vevő</th>
                  <th className="px-4 py-3 text-left font-sans text-xs font-semibold text-brown/55">Termékek</th>
                  <th className="px-4 py-3 text-left font-sans text-xs font-semibold text-brown/55">Napok</th>
                  <th className="px-4 py-3 text-left font-sans text-xs font-semibold text-brown/55">Állapot</th>
                  <th className="px-4 py-3 text-right font-sans text-xs font-semibold text-brown/55">Összeg</th>
                </tr>
              </thead>
              <tbody>
                {visibleOrders.map((order) => {
                  const selected = order.id === selectedOrderId;
                  const displayAllapot = getDisplayAllapot(order.display_allapot);
                  const status = ALLAPOT_LABELS[displayAllapot] ?? { label: displayAllapot, color: "bg-gray-100 text-gray-800 border-gray-200" };
                  const selectedDayItems = order.rendeles_tetelek.filter((tetel) => tetel.datum === selectedDate);
                  const summary = selectedDayItems
                    .slice(0, 3)
                    .map((tetel) => `${tetel.mennyiseg}x ${tetel.termek_nev}`)
                    .join(", ");
                  const dateSummary = Array.from(new Set(order.rendeles_tetelek.map((tetel) => tetel.datum))).sort().map(formatDayDate).join(", ");

                  return (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrderId(selected ? null : order.id)}
                      className={`cursor-pointer border-b border-cream-dark last:border-b-0 ${selected ? "bg-gold/10" : "hover:bg-cream-dark/30"}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-sans text-sm font-semibold text-brown-dark">{getOrderDisplayName(order)}</p>
                        <p className="font-sans text-[11px] text-brown/40">{order.rendeles_szam}</p>
                        {order.megjegyzes && <p className="mt-1 max-w-[180px] truncate font-sans text-[11px] text-amber-700">{order.megjegyzes}</p>}
                      </td>
                      <td className="px-4 py-3 font-sans text-xs text-brown/65">{summary}{selectedDayItems.length > 3 ? "..." : ""}</td>
                      <td className="px-4 py-3 font-sans text-xs text-brown/60">{dateSummary}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2 py-1 font-sans text-[11px] font-semibold ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-sans text-sm font-semibold text-brown-dark">{formatFt(order.vegosszeg)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-cream-dark bg-white p-3">
        {!selectedOrder ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
            <ClipboardList className="h-8 w-8 text-brown/25" />
            <p className="mt-3 font-sans text-sm font-semibold text-brown-dark">Válassz rendelést</p>
            <p className="mt-1 max-w-[260px] font-sans text-xs leading-relaxed text-brown/45">
              Itt tudod termékenként átírni az átvételi napot, kiadni, vagy szükség esetén törölni a tételt.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-serif text-lg text-brown-dark">{getOrderDisplayName(selectedOrder)}</h3>
                <p className="font-sans text-xs text-brown/40">{selectedOrder.rendeles_szam}</p>
              </div>
              <button onClick={() => setSelectedOrderId(null)} className="rounded-lg p-1 text-brown/35 hover:bg-cream-dark hover:text-brown-dark">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-1.5 rounded-lg border border-cream-dark bg-cream/40 p-2.5">
              {selectedOrder.email?.trim() ? (
                <a href={`mailto:${selectedOrder.email}`} className="flex items-center gap-2 font-sans text-sm text-brown-dark hover:text-gold">
                  <Mail className="h-4 w-4" />
                  {selectedOrder.email}
                </a>
              ) : (
                <p className="flex items-center gap-2 font-sans text-sm text-brown/45">
                  <Mail className="h-4 w-4" />
                  {getOptionalContact(selectedOrder.email)}
                </p>
              )}
              {selectedOrder.telefon?.trim() ? (
                <a href={`tel:${selectedOrder.telefon}`} className="block font-sans text-sm text-brown-dark hover:text-gold">
                  {selectedOrder.telefon}
                </a>
              ) : (
                <p className="font-sans text-sm text-brown/45">{getOptionalContact(selectedOrder.telefon)}</p>
              )}
              {selectedOrder.megjegyzes && <p className="font-sans text-sm leading-relaxed text-brown/65">{selectedOrder.megjegyzes}</p>}
            </div>

            <div>
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-normal text-brown/45">
                Termékek külön kezelve
              </p>
              <div className="space-y-2">
                {selectedOrder.rendeles_tetelek
                  .slice()
                  .sort((a, b) => a.datum.localeCompare(b.datum) || a.termek_nev.localeCompare(b.termek_nev, "hu"))
                  .map((tetel) => {
                    const allapot = getTetelAllapot(tetel);
                    const allapotInfo = ALLAPOT_LABELS[allapot] ?? { label: allapot, color: "bg-gray-100 text-gray-800 border-gray-200" };
                    const currentDateEdit = dateEdits[tetel.id] ?? tetel.datum;
                    const isSelectedDayTetel = tetel.datum === selectedDate;

                    return (
                      <div key={tetel.id} className={`rounded-lg border p-2.5 ${isSelectedDayTetel ? "border-gold/50 bg-gold/5" : "border-cream-dark bg-white"}`}>
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <p className="font-sans text-sm font-bold text-brown-dark">
                              {tetel.mennyiseg}x {tetel.termek_nev}
                            </p>
                            <p className="font-sans text-xs text-brown/45">
                              {tetel.nap}, {formatDayDate(tetel.datum)} · {formatFt(tetel.reszosszeg)}
                            </p>
                          </div>
                          <span className={`rounded-full border px-2 py-1 font-sans text-[11px] font-semibold ${allapotInfo.color}`}>
                            {allapotInfo.label}
                          </span>
                        </div>

                        <div className="mb-2 rounded-lg border border-cream-dark bg-cream/35 p-2">
                          <label className="block font-sans text-[11px] font-semibold text-brown/50">
                            Átvételi nap csak ennél a terméknél
                            <div className="mt-1 grid grid-cols-[1fr_auto] gap-2">
                              <input
                                type="date"
                                value={currentDateEdit}
                                onChange={(event) => setDateEdits((prev) => ({ ...prev, [tetel.id]: event.target.value }))}
                                className="h-9 rounded-lg border border-cream-dark bg-white px-2 font-sans text-sm font-normal text-brown-dark outline-none focus:border-gold"
                              />
                              <button
                                onClick={() => updateTetelAtveteliDatum(selectedOrder.id, tetel.id, tetel.datum, currentDateEdit)}
                                disabled={updatingKey !== null || currentDateEdit === tetel.datum}
                                className="rounded-lg border border-cream-dark bg-white px-3 font-sans text-xs font-semibold text-brown/70 hover:border-gold disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updatingKey === `${selectedOrder.id}_${tetel.id}_date` ? "Mentés..." : "Mentés"}
                              </button>
                            </div>
                          </label>
                        </div>

                        <div className="grid grid-cols-3 gap-1.5">
                          {TETEL_ALLAPOT_SORREND.map((statusId) => {
                            const active = allapot === statusId;
                            const actionKey = `${selectedOrder.id}_${tetel.id}_${statusId}`;

                            return (
                              <button
                                key={statusId}
                                onClick={() => updateTetelAllapot(selectedOrder.id, tetel.id, statusId)}
                                disabled={updatingKey !== null}
                                className={`min-w-0 whitespace-nowrap rounded-md border px-1.5 py-1.5 font-sans text-[11px] font-bold leading-none ${
                                  active
                                    ? ALLAPOT_LABELS[statusId].color
                                    : "border-cream-dark bg-white text-brown/60 hover:border-gold"
                                } disabled:cursor-not-allowed disabled:opacity-50`}
                              >
                                {updatingKey === actionKey ? "Mentés..." : ALLAPOT_LABELS[statusId].label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderManualOrderModal = () => {
    if (!showManualOrder) return null;

    const total = manualForm.items.reduce((sum, item) => {
      const product = productMap.get(item.termekSlug);
      return sum + (product?.ar ?? 0) * item.mennyiseg;
    }, 0);

    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-brown-dark/45 px-4 py-6">
        <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
          <div className="flex items-start justify-between gap-4 border-b border-cream-dark px-5 py-4">
            <div>
              <h2 className="font-serif text-xl text-brown-dark">Új kézi rendelés</h2>
              <p className="font-sans text-xs text-brown/45">Helyben vagy telefonon kért rendelés rögzítése ugyanabba a rendszerbe.</p>
            </div>
            <button onClick={() => setShowManualOrder(false)} className="rounded-lg p-1 text-brown/40 hover:bg-cream-dark hover:text-brown-dark">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-4 px-5 py-5 md:grid-cols-3">
            <label className="font-sans text-xs font-semibold text-brown/60">
              Név (opcionális)
              <input
                value={manualForm.nev}
                onChange={(event) => setManualForm((prev) => ({ ...prev, nev: event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-cream-dark px-3 font-sans text-sm font-normal text-brown-dark outline-none focus:border-gold"
              />
            </label>
            <label className="font-sans text-xs font-semibold text-brown/60">
              Email (opcionális)
              <input
                type="email"
                value={manualForm.email}
                onChange={(event) => setManualForm((prev) => ({ ...prev, email: event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-cream-dark px-3 font-sans text-sm font-normal text-brown-dark outline-none focus:border-gold"
              />
            </label>
            <label className="font-sans text-xs font-semibold text-brown/60">
              Telefon (opcionális)
              <input
                value={manualForm.telefon}
                onChange={(event) => setManualForm((prev) => ({ ...prev, telefon: event.target.value }))}
                className="mt-1 h-10 w-full rounded-lg border border-cream-dark px-3 font-sans text-sm font-normal text-brown-dark outline-none focus:border-gold"
              />
            </label>
          </div>

          <div className="px-5">
            <label className="font-sans text-xs font-semibold text-brown/60">
              Megjegyzés
              <textarea
                value={manualForm.megjegyzes}
                onChange={(event) => setManualForm((prev) => ({ ...prev, megjegyzes: event.target.value }))}
                rows={3}
                className="mt-1 w-full resize-none rounded-lg border border-cream-dark px-3 py-2 font-sans text-sm font-normal text-brown-dark outline-none focus:border-gold"
              />
            </label>
          </div>

          <div className="mt-5 border-y border-cream-dark">
            <div className="grid grid-cols-[1fr_1fr_90px_44px] gap-2 bg-cream-dark/35 px-5 py-2 font-sans text-[11px] font-semibold uppercase tracking-normal text-brown/45">
              <span>Nap</span>
              <span>Termék</span>
              <span className="text-right">Menny.</span>
              <span />
            </div>
            <div className="divide-y divide-cream-dark">
              {manualForm.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1fr_1fr_90px_44px] gap-2 px-5 py-3">
                  <input
                    type="date"
                    value={item.datum}
                    onChange={(event) => updateManualItem(item.id, { datum: event.target.value })}
                    className="h-10 rounded-lg border border-cream-dark px-2 font-sans text-sm outline-none focus:border-gold"
                  />
                  <select
                    value={item.termekSlug}
                    onChange={(event) => updateManualItem(item.id, { termekSlug: event.target.value })}
                    className="h-10 min-w-0 rounded-lg border border-cream-dark px-2 font-sans text-sm outline-none focus:border-gold"
                  >
                    {(data?.products ?? []).map((product) => (
                      <option key={product.id} value={product.slug}>{product.nev} ({product.egyseg})</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={item.mennyiseg}
                    onChange={(event) => updateManualItem(item.id, { mennyiseg: Math.max(1, Number(event.target.value || 1)) })}
                    className="h-10 rounded-lg border border-cream-dark px-2 text-right font-sans text-sm outline-none focus:border-gold"
                  />
                  <button
                    onClick={() => removeManualItem(item.id)}
                    className="flex h-10 items-center justify-center rounded-lg border border-cream-dark text-brown/45 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <button
              onClick={addManualItem}
              className="inline-flex items-center gap-2 rounded-lg border border-cream-dark px-3 py-2 font-sans text-sm font-semibold text-brown/70 hover:border-gold"
            >
              <Plus className="h-4 w-4" />
              Tétel hozzáadása
            </button>

            <label className="flex items-center gap-2 font-sans text-sm text-brown/70">
              <input
                type="checkbox"
                checked={manualForm.sendEmail}
                onChange={(event) => setManualForm((prev) => ({ ...prev, sendEmail: event.target.checked }))}
                className="h-4 w-4 accent-gold"
              />
              Visszaigazoló email küldése
            </label>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-cream-dark px-5 py-4">
            <div>
              <p className="font-sans text-xs uppercase tracking-normal text-brown/40">Végösszeg</p>
              <p className="font-sans text-lg font-bold text-brown-dark">{formatFt(total)}</p>
            </div>
            <button
              onClick={submitManualOrder}
              disabled={manualSaving}
              className="rounded-lg bg-brown-dark px-5 py-3 font-sans text-sm font-semibold text-cream hover:bg-brown disabled:cursor-not-allowed disabled:opacity-50"
            >
              {manualSaving ? "Rögzítés..." : "Rendelés rögzítése"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-8">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-brown-dark">Napi műhely</h1>
          <p className="mt-1 font-sans text-sm text-brown/50">
            Rendelések, gyártás és készlet egy helyen, ugyanazzal a dátum- és termékszűréssel.
          </p>
        </div>
        <button
          onClick={() => void fetchData()}
          className="inline-flex items-center gap-2 rounded-lg border border-cream-dark bg-white px-3 py-2 font-sans text-sm font-semibold text-brown/70 hover:border-gold"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Frissítés
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-cream-dark bg-white p-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => updateDatePreset("today")} className="rounded-lg bg-cream-dark px-3 py-2 font-sans text-sm text-brown/70 hover:bg-gold/20">Ma</button>
          <button onClick={() => updateDatePreset("tomorrow")} className="rounded-lg bg-cream-dark px-3 py-2 font-sans text-sm text-brown/70 hover:bg-gold/20">Holnap</button>
          <button onClick={() => updateDatePreset("week")} className="rounded-lg bg-cream-dark px-3 py-2 font-sans text-sm text-brown/70 hover:bg-gold/20">Következő 7 nap</button>
          <div className="flex items-center gap-2 rounded-lg border border-cream-dark px-2 py-1">
            <input type="date" value={tol} onChange={(event) => { setTol(event.target.value); setSelectedDate(event.target.value); }} className="h-8 bg-transparent font-sans text-sm outline-none" />
            <span className="font-sans text-xs text-brown/35">-</span>
            <input type="date" value={ig} min={tol} onChange={(event) => setIg(event.target.value)} className="h-8 bg-transparent font-sans text-sm outline-none" />
          </div>
          <div className="ml-auto flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-cream-dark px-3 py-2 md:max-w-[360px]">
            <Search className="h-4 w-4 text-brown/35" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Név, email, telefon, rendelési szám"
              className="min-w-0 flex-1 bg-transparent font-sans text-sm outline-none placeholder:text-brown/35"
            />
          </div>
          <button
            onClick={() => setShowFilters((value) => !value)}
            className="inline-flex items-center gap-2 rounded-lg border border-cream-dark px-3 py-2 font-sans text-sm text-brown/70 hover:border-gold"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Szűrők
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-cream-dark pt-4 lg:grid-cols-[220px_1fr]">
            <div>
              <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-normal text-brown/45">Állapot</p>
              <div className="flex flex-wrap gap-2">
                {ALLAPOT_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => setAllapot(status)}
                    className={`rounded-lg px-3 py-1.5 font-sans text-xs font-semibold ${
                      allapot === status
                        ? "bg-gold text-brown-dark"
                        : "bg-cream-dark text-brown/60 hover:bg-gold/20"
                    }`}
                  >
                    {status === "mind" ? "Mind" : ALLAPOT_LABELS[status]?.label ?? status}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="font-sans text-xs font-semibold uppercase tracking-normal text-brown/45">Termék pipák</p>
                {selectedProductIds.length > 0 && (
                  <button onClick={() => setSelectedProductIds([])} className="font-sans text-xs text-gold hover:underline">
                    Összes termék
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(data?.products ?? []).map((product) => {
                  const active = selectedProductIds.includes(product.id);
                  return (
                    <button
                      key={product.id}
                      onClick={() => toggleProductFilter(product.id)}
                      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 font-sans text-xs ${
                        active
                          ? "border-gold bg-gold/15 text-brown-dark"
                          : "border-cream-dark bg-white text-brown/60 hover:border-gold/50"
                      }`}
                    >
                      <span className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${active ? "border-gold bg-gold text-brown-dark" : "border-cream-dark"}`}>
                        {active && <Check className="h-3 w-3" />}
                      </span>
                      {product.nev}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {notice && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-sans text-sm font-semibold text-green-800">
          {notice}
        </div>
      )}

      {(error || data?.stockTrackingError) && (
        <div className="mb-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 font-sans text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-semibold">{error || data?.stockTrackingError}</p>
            {data?.stockTrackingError && (
              <p className="mt-1 text-xs">
                A felület betölt, de gyártott mennyiséget csak a `supabase/migrations/20260510075519_create_napi_keszlet.sql` lefuttatása után lehet menteni.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mb-4">{renderDayTabs()}</div>

      <div className="mb-5 flex gap-2 overflow-x-auto border-b border-cream-dark print:hidden">
        {VIEW_LABELS.map((view) => {
          const Icon = view.icon;
          const active = activeView === view.id;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 font-sans text-sm font-semibold transition-colors ${
                active
                  ? "border-gold text-brown-dark"
                  : "border-transparent text-brown/45 hover:text-brown-dark"
              }`}
            >
              <Icon className="h-4 w-4" />
              {view.label}
            </button>
          );
        })}
      </div>

      {loading && !data ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-5">
          {activeView === "rendelesek" && renderOrders()}
          {activeView === "gyartas" && (
            <div className="space-y-4">
              {renderProductRows()}
            </div>
          )}
        </div>
      )}

      {renderManualOrderModal()}
    </div>
  );
}
