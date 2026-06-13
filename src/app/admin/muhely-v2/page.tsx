"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Info,
  PackageCheck,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-api";
import styles from "./page.module.css";

type Product = {
  id: string;
  slug: string;
  nev: string;
  kategoria: string;
  ar: number;
  egyseg: string;
};

type ProductSummary = {
  termek_id: string;
  termek_nev: string;
  kategoria: string;
  egyseg: string;
  elorendelve: number;
  extra_mennyiseg: number;
  elkeszult_mennyiseg: number;
  kiadva: number;
  updated_at: string | null;
};

type WorkshopData = {
  products: Product[];
  summaries: {
    datum: string;
    nap: string;
    products: ProductSummary[];
  }[];
  stockTrackingReady: boolean;
  stockTrackingError: string | null;
};

type OrderItem = {
  id: string;
  termek_id: string | null;
  datum: string;
  nap: string;
  termek_nev: string;
  mennyiseg: number;
  allapot: string | null;
};

type Order = {
  id: string;
  rendeles_szam: string;
  nev: string;
  email: string;
  telefon: string;
  megjegyzes: string | null;
  rendeles_tetelek: OrderItem[];
};

type DayStatus = "uj" | "reszben" | "atvetel" | "torolve";

type StockDraft = {
  produced: string;
  walkInSales: string;
};

type ManualOrderItem = {
  id: string;
  datum: string;
  productId: string;
  quantity: number;
};

type ManualOrderForm = {
  nev: string;
  email: string;
  telefon: string;
  megjegyzes: string;
  sendEmail: boolean;
  items: ManualOrderItem[];
};

const DAY_NAMES = ["V", "H", "K", "Sze", "Cs", "P", "Szo"];
const FULL_DAY_NAMES = ["Vasárnap", "Hétfő", "Kedd", "Szerda", "Csütörtök", "Péntek", "Szombat"];
const PRODUCT_ORDER_KEY = "kata-muhely-v2-product-order";

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

function formatLongDate(input: string) {
  return new Date(`${input}T12:00:00`).toLocaleDateString("hu-HU", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatShortDate(input: string) {
  return new Date(`${input}T12:00:00`).toLocaleDateString("hu-HU", {
    month: "short",
    day: "numeric",
  });
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isBreadCategory(category: string) {
  return normalizeText(category).includes("kenyer");
}

function normalizeStatus(status: string | null) {
  return status === "feldolgozva" || status === "kesz" || !status ? "uj" : status;
}

function quantityValue(value: string) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.round(number) : 0;
}

function formatFt(value: number) {
  return `${value.toLocaleString("hu-HU")} Ft`;
}

function getDayName(datum: string) {
  return FULL_DAY_NAMES[new Date(`${datum}T12:00:00`).getDay()];
}

function getInitialManualOrder(datum: string, product?: Product): ManualOrderForm {
  return {
    nev: "",
    email: "",
    telefon: "",
    megjegyzes: "",
    sendEmail: false,
    items: [{
      id: crypto.randomUUID(),
      datum,
      productId: product?.id ?? "",
      quantity: 1,
    }],
  };
}

function getDayItems(order: Order, selectedDate: string) {
  return order.rendeles_tetelek.filter((item) => item.datum === selectedDate);
}

function getActiveDayItems(order: Order, selectedDate: string) {
  return getDayItems(order, selectedDate).filter((item) => normalizeStatus(item.allapot) !== "torolve");
}

function getDayStatus(order: Order, selectedDate: string): DayStatus {
  const dayItems = getDayItems(order, selectedDate);
  const activeItems = getActiveDayItems(order, selectedDate);

  if (dayItems.length > 0 && activeItems.length === 0) return "torolve";
  if (activeItems.length > 0 && activeItems.every((item) => normalizeStatus(item.allapot) === "atvetel")) {
    return "atvetel";
  }
  if (activeItems.some((item) => normalizeStatus(item.allapot) === "atvetel")) return "reszben";
  return "uj";
}

function getOrderName(order: Order) {
  return order.nev?.trim() || "Név nélkül";
}

function getProductLabel(item: OrderItem, productMap: Map<string, Product>) {
  const product = item.termek_id ? productMap.get(item.termek_id) : null;
  const unit = product?.egyseg.trim();
  if (!unit || normalizeText(item.termek_nev).includes(normalizeText(unit))) {
    return item.termek_nev;
  }
  return `${item.termek_nev} · ${unit}`;
}

function statusLabel(status: DayStatus) {
  if (status === "atvetel") return "Átadva";
  if (status === "reszben") return "Részben átadva";
  if (status === "torolve") return "Törölve";
  return "Kiadandó";
}

function statusSurface(status: DayStatus) {
  if (status === "atvetel") return "border-emerald-300 bg-emerald-100";
  if (status === "reszben") return "border-amber-300 bg-amber-100";
  if (status === "torolve") return "border-slate-200 bg-slate-100";
  return "border-cream-dark bg-white";
}

function statusText(status: DayStatus) {
  if (status === "atvetel") return "text-emerald-900";
  if (status === "reszben") return "text-amber-900";
  if (status === "torolve") return "text-slate-500";
  return "text-brown-dark";
}

export default function MuhelyV2Page() {
  const today = useMemo(() => toInputDate(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const [products, setProducts] = useState<Product[]>([]);
  const [summaryProducts, setSummaryProducts] = useState<ProductSummary[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [onlyPending, setOnlyPending] = useState(false);
  const [productOrder, setProductOrder] = useState<string[]>([]);
  const [stockDrafts, setStockDrafts] = useState<Record<string, StockDraft>>({});
  const [stockTrackingReady, setStockTrackingReady] = useState(true);
  const [stockTrackingError, setStockTrackingError] = useState<string | null>(null);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [addProductId, setAddProductId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [dateEdits, setDateEdits] = useState<Record<string, string>>({});
  const [showManualOrder, setShowManualOrder] = useState(false);
  const [manualOrder, setManualOrder] = useState<ManualOrderForm>(() => getInitialManualOrder(today));
  const [manualSaving, setManualSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [workshopResponse, ordersResponse] = await Promise.all([
        adminFetch(`/api/admin/muhely?tol=${selectedDate}&ig=${selectedDate}&allapot=mind`, {
          cache: "no-store",
        }),
        adminFetch(`/api/admin/rendelesek?datum=${selectedDate}`, { cache: "no-store" }),
      ]);

      const [workshopJson, ordersJson] = await Promise.all([
        workshopResponse.json(),
        ordersResponse.json(),
      ]);

      if (!workshopResponse.ok) {
        throw new Error(workshopJson.error ?? "Nem sikerült betölteni a napi összesítést.");
      }
      if (!ordersResponse.ok) {
        throw new Error(ordersJson.error ?? "Nem sikerült betölteni a rendeléseket.");
      }

      const workshopData = workshopJson as WorkshopData;
      const nextSummaryProducts = workshopData.summaries?.[0]?.products ?? [];

      setProducts(workshopData.products ?? []);
      setSummaryProducts(nextSummaryProducts);
      setStockTrackingReady(workshopData.stockTrackingReady);
      setStockTrackingError(workshopData.stockTrackingError);
      setStockDrafts(Object.fromEntries(nextSummaryProducts.map((product) => [
        product.termek_id,
        {
          produced: String(product.elkeszult_mennyiseg),
          walkInSales: String(product.extra_mennyiseg),
        },
      ])));
      setOrders(ordersJson.rendelesek ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Nem sikerült betölteni a műhelyt.");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    setSelectedOrderId(null);
    setNotice("");
  }, [selectedDate]);

  useEffect(() => {
    try {
      const savedOrder = JSON.parse(localStorage.getItem(PRODUCT_ORDER_KEY) ?? "[]");
      if (Array.isArray(savedOrder) && savedOrder.every((id) => typeof id === "string")) {
        setProductOrder(savedOrder);
      }
    } catch {
      setProductOrder([]);
    }
  }, []);

  const productMap = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  );

  const orderedProducts = useMemo(() => {
    const summaryById = new Map(summaryProducts.map((product) => [product.termek_id, product]));
    const orderIndex = new Map(productOrder.map((id, index) => [id, index]));
    const issuedByProduct = new Map<string, number>();

    for (const order of orders) {
      for (const item of getActiveDayItems(order, selectedDate)) {
        if (!item.termek_id || normalizeStatus(item.allapot) !== "atvetel") continue;
        issuedByProduct.set(item.termek_id, (issuedByProduct.get(item.termek_id) ?? 0) + item.mennyiseg);
      }
    }

    return products
      .filter((product) => {
        const summary = summaryById.get(product.id);
        return (summary?.elorendelve ?? 0) > 0 || Boolean(summary?.updated_at);
      })
      .map((product, index) => ({ product, index }))
      .sort((a, b) => {
        const aSavedIndex = orderIndex.get(a.product.id);
        const bSavedIndex = orderIndex.get(b.product.id);

        if (aSavedIndex !== undefined || bSavedIndex !== undefined) {
          if (aSavedIndex === undefined) return 1;
          if (bSavedIndex === undefined) return -1;
          return aSavedIndex - bSavedIndex;
        }

        const breadDifference = Number(isBreadCategory(b.product.kategoria)) - Number(isBreadCategory(a.product.kategoria));
        return breadDifference || a.index - b.index;
      })
      .map(({ product }) => {
        const summary = summaryById.get(product.id);
        return {
        ...product,
          total: summary?.elorendelve ?? 0,
          produced: summary?.elkeszult_mennyiseg ?? 0,
          walkInSales: summary?.extra_mennyiseg ?? 0,
          issued: issuedByProduct.get(product.id) ?? 0,
        };
      });
  }, [orders, productOrder, products, selectedDate, summaryProducts]);

  const availableProducts = useMemo(() => {
    const visibleIds = new Set(orderedProducts.map((product) => product.id));
    return products.filter((product) => !visibleIds.has(product.id));
  }, [orderedProducts, products]);

  useEffect(() => {
    if (!availableProducts.some((product) => product.id === addProductId)) {
      setAddProductId(availableProducts[0]?.id ?? "");
    }
  }, [addProductId, availableProducts]);

  const dayOrders = useMemo(() => {
    const query = normalizeText(search.trim());

    return orders
      .filter((order) => getDayItems(order, selectedDate).length > 0)
      .filter((order) => getDayStatus(order, selectedDate) !== "torolve")
      .filter((order) => {
        if (!query) return true;
        const haystack = [
          getOrderName(order),
          order.telefon,
          order.email,
          order.rendeles_szam,
          order.megjegyzes ?? "",
          ...getDayItems(order, selectedDate).map((item) => item.termek_nev),
        ].join(" ");
        return normalizeText(haystack).includes(query);
      })
      .filter((order) => !onlyPending || getDayStatus(order, selectedDate) !== "atvetel")
      .sort((a, b) => getOrderName(a).localeCompare(getOrderName(b), "hu"));
  }, [onlyPending, orders, search, selectedDate]);

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) ?? null;

  useEffect(() => {
    if (!selectedOrder) return;
    setDateEdits(Object.fromEntries(selectedOrder.rendeles_tetelek.map((item) => [item.id, item.datum])));
  }, [selectedOrder]);

  const persistProductOrder = (nextOrder: string[]) => {
    setProductOrder(nextOrder);
    localStorage.setItem(PRODUCT_ORDER_KEY, JSON.stringify(nextOrder));
  };

  const moveProduct = (productId: string, direction: -1 | 1) => {
    const visibleIds = orderedProducts.map((product) => product.id);
    const currentIndex = visibleIds.indexOf(productId);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= visibleIds.length) return;

    const nextVisibleIds = [...visibleIds];
    [nextVisibleIds[currentIndex], nextVisibleIds[nextIndex]] = [
      nextVisibleIds[nextIndex],
      nextVisibleIds[currentIndex],
    ];
    const visibleSet = new Set(nextVisibleIds);
    persistProductOrder([
      ...nextVisibleIds,
      ...products.map((product) => product.id).filter((id) => !visibleSet.has(id)),
    ]);
  };

  const saveStock = async (
    productId: string,
    override?: Partial<StockDraft>,
    successMessage?: string
  ) => {
    if (!stockTrackingReady) return false;

    const currentDraft = stockDrafts[productId] ?? { produced: "0", walkInSales: "0" };
    const nextDraft = { ...currentDraft, ...override };
    const produced = quantityValue(nextDraft.produced);
    const walkInSales = quantityValue(nextDraft.walkInSales);

    setStockDrafts((current) => ({
      ...current,
      [productId]: {
        produced: String(produced),
        walkInSales: String(walkInSales),
      },
    }));
    setSavingProductId(productId);
    setError("");

    try {
      const response = await adminFetch("/api/admin/muhely/keszlet", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datum: selectedDate,
          termek_id: productId,
          elkeszult_mennyiseg: produced,
          extra_mennyiseg: walkInSales,
          megjegyzes: "",
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Nem sikerült menteni a napi készletet.");

      setSummaryProducts((current) => current.map((product) => (
        product.termek_id === productId
          ? {
              ...product,
              elkeszult_mennyiseg: produced,
              extra_mennyiseg: walkInSales,
              updated_at: json.keszlet?.updated_at ?? new Date().toISOString(),
            }
          : product
      )));
      if (successMessage) setNotice(successMessage);
      return true;
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Nem sikerült menteni a napi készletet.");
      return false;
    } finally {
      setSavingProductId(null);
    }
  };

  const incrementWalkInSale = (productId: string) => {
    const draft = stockDrafts[productId] ?? { produced: "0", walkInSales: "0" };
    const nextValue = quantityValue(draft.walkInSales) + 1;
    void saveStock(productId, { walkInSales: String(nextValue) });
  };

  const incrementProduced = (productId: string) => {
    const draft = stockDrafts[productId] ?? { produced: "0", walkInSales: "0" };
    const nextValue = quantityValue(draft.produced) + 1;
    void saveStock(productId, { produced: String(nextValue) });
  };

  const addProductToDay = async () => {
    if (!addProductId) return;
    const product = productMap.get(addProductId);
    const saved = await saveStock(
      addProductId,
      { produced: "0", walkInSales: "0" },
      product ? `${product.nev} hozzáadva a napi készlethez.` : "Termék hozzáadva."
    );
    if (!saved) return;

    const visibleIds = orderedProducts.map((item) => item.id);
    const nextVisibleIds = [...visibleIds, addProductId];
    const visibleSet = new Set(nextVisibleIds);
    persistProductOrder([
      ...nextVisibleIds,
      ...products.map((item) => item.id).filter((id) => !visibleSet.has(id)),
    ]);
  };

  const updateDayStatus = async (order: Order, nextStatus: "uj" | "atvetel") => {
    const key = `${order.id}_${selectedDate}_${nextStatus}`;
    const previousOrders = orders;

    setPendingKey(key);
    setError("");
    setNotice("");
    setOrders((current) => current.map((currentOrder) => {
      if (currentOrder.id !== order.id) return currentOrder;
      return {
        ...currentOrder,
        rendeles_tetelek: currentOrder.rendeles_tetelek.map((item) => {
          if (item.datum !== selectedDate || normalizeStatus(item.allapot) === "torolve") return item;
          return { ...item, allapot: nextStatus };
        }),
      };
    }));

    try {
      const response = await adminFetch(`/api/admin/rendelesek/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datum: selectedDate, allapot: nextStatus }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Nem sikerült módosítani az átadást.");
      setNotice(nextStatus === "atvetel" ? `${getOrderName(order)} teljes napi rendelése átadva.` : "Az átadás visszavonva.");
    } catch (updateError) {
      setOrders(previousOrders);
      setError(updateError instanceof Error ? updateError.message : "Nem sikerült módosítani az átadást.");
    } finally {
      setPendingKey(null);
    }
  };

  const updateItemStatus = async (order: Order, item: OrderItem) => {
    const issued = normalizeStatus(item.allapot) === "atvetel";
    const nextStatus = issued ? "uj" : "atvetel";
    const key = `${order.id}_${item.id}_${nextStatus}`;
    const previousOrders = orders;

    setPendingKey(key);
    setError("");
    setNotice("");
    setOrders((current) => current.map((currentOrder) => (
      currentOrder.id === order.id
        ? {
            ...currentOrder,
            rendeles_tetelek: currentOrder.rendeles_tetelek.map((currentItem) => (
              currentItem.id === item.id ? { ...currentItem, allapot: nextStatus } : currentItem
            )),
          }
        : currentOrder
    )));

    try {
      const response = await adminFetch(`/api/admin/rendelesek/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tetelId: item.id, allapot: nextStatus }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Nem sikerült módosítani a tételt.");
    } catch (updateError) {
      setOrders(previousOrders);
      setError(updateError instanceof Error ? updateError.message : "Nem sikerült módosítani a tételt.");
    } finally {
      setPendingKey(null);
    }
  };

  const updateItemDate = async (order: Order, item: OrderItem) => {
    const nextDate = dateEdits[item.id];
    if (!nextDate || nextDate === item.datum) return;

    const key = `${order.id}_${item.id}_date`;
    setPendingKey(key);
    setError("");

    try {
      const response = await adminFetch(`/api/admin/rendelesek/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tetelId: item.id, ujDatum: nextDate }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Nem sikerült módosítani az átvételi napot.");
      setNotice(`${getProductLabel(item, productMap)} átvételi napja módosítva.`);
      await fetchData();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Nem sikerült módosítani az átvételi napot.");
    } finally {
      setPendingKey(null);
    }
  };

  const openManualOrder = () => {
    setManualOrder(getInitialManualOrder(selectedDate, products[0]));
    setShowManualOrder(true);
  };

  const updateManualItem = (id: string, patch: Partial<ManualOrderItem>) => {
    setManualOrder((current) => ({
      ...current,
      items: current.items.map((item) => item.id === id ? { ...item, ...patch } : item),
    }));
  };

  const addManualItem = () => {
    setManualOrder((current) => ({
      ...current,
      items: [...current.items, {
        id: crypto.randomUUID(),
        datum: selectedDate,
        productId: products[0]?.id ?? "",
        quantity: 1,
      }],
    }));
  };

  const removeManualItem = (id: string) => {
    setManualOrder((current) => ({
      ...current,
      items: current.items.length === 1
        ? current.items
        : current.items.filter((item) => item.id !== id),
    }));
  };

  const submitManualOrder = async () => {
    const items = manualOrder.items.flatMap((item) => {
      const product = productMap.get(item.productId);
      if (!product || item.quantity <= 0) return [];

      return [{
        nap: getDayName(item.datum),
        datum: item.datum,
        termekId: product.slug,
        nev: product.nev,
        mennyiseg: item.quantity,
        egysegar: product.ar,
        reszosszeg: product.ar * item.quantity,
      }];
    });

    if (items.length === 0) {
      setError("Legalább egy érvényes rendelési tétel szükséges.");
      return;
    }

    setManualSaving(true);
    setError("");

    try {
      const response = await adminFetch("/api/rendeles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nev: manualOrder.nev,
          email: manualOrder.email,
          telefon: manualOrder.telefon,
          megjegyzes: manualOrder.megjegyzes,
          sendEmail: manualOrder.sendEmail && Boolean(manualOrder.email.trim()),
          source: "admin_manual",
          rendelesek: items,
        }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Nem sikerült rögzíteni a rendelést.");
      setShowManualOrder(false);
      setNotice(`Rendelés rögzítve: ${json.rendelesSzam}`);
      await fetchData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nem sikerült rögzíteni a rendelést.");
    } finally {
      setManualSaving(false);
    }
  };

  const dateOptions = useMemo(
    () => [-2, -1, 0, 1, 2].map((offset) => addDays(selectedDate, offset)),
    [selectedDate]
  );

  const manualOrderTotal = useMemo(
    () => manualOrder.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + (product?.ar ?? 0) * item.quantity;
    }, 0),
    [manualOrder.items, productMap]
  );

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] px-3 pb-28 pt-3 sm:px-4 sm:pt-4 md:px-6 md:pb-8">
      <header className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-brown-dark">Műhely V2</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openManualOrder}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brown-dark px-4 font-sans text-sm font-black text-cream shadow-sm active:scale-95"
          >
            <Plus className="h-5 w-5" />
            Új rendelés
          </button>
          <button
            type="button"
            onClick={() => void fetchData()}
            aria-label="Adatok frissítése"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cream-dark bg-white text-brown/70 shadow-sm active:scale-95"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <section className="sticky top-0 z-20 -mx-3 mb-3 border-y border-cream-dark bg-cream/95 px-3 py-2 shadow-sm backdrop-blur sm:-mx-4 sm:px-4 md:static md:mx-0 md:rounded-2xl md:border md:bg-white md:shadow-none">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            aria-label="Előző nap"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cream-dark bg-white text-brown-dark active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="min-w-0 flex-1 text-center">
            <p className="truncate font-serif text-lg capitalize text-brown-dark">{formatLongDate(selectedDate)}</p>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              aria-label="Átvételi nap"
              className="mt-0.5 max-w-full bg-transparent text-center font-sans text-xs font-semibold text-brown/50 outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            aria-label="Következő nap"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cream-dark bg-white text-brown-dark active:scale-95"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 grid grid-cols-5 gap-1.5">
          {dateOptions.map((date) => {
            const parsedDate = new Date(`${date}T12:00:00`);
            const active = date === selectedDate;
            return (
              <button
                key={date}
                type="button"
                onClick={() => setSelectedDate(date)}
                className={`min-w-0 rounded-lg px-1 py-1.5 text-center font-sans ${
                  active ? "bg-brown-dark text-cream" : "bg-cream-dark/70 text-brown/60"
                }`}
              >
                <span className="block text-[10px] font-bold">{DAY_NAMES[parsedDate.getDay()]}</span>
                <span className="block text-xs">{parsedDate.getDate()}.</span>
              </button>
            );
          })}
        </div>

        {selectedDate !== today && (
          <button
            type="button"
            onClick={() => setSelectedDate(today)}
            className="mt-2 w-full rounded-lg py-1 font-sans text-xs font-bold text-gold-dark"
          >
            Ugrás a mai napra
          </button>
        )}
      </section>

      <section className="mb-3 overflow-hidden rounded-xl border border-cream-dark bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-dark px-4 py-3">
          <div>
            <h2 className="font-sans text-base font-black text-brown-dark">Napi készlet</h2>
            <p className="font-sans text-xs text-brown/45">A beírt mennyiségek automatikusan mentődnek.</p>
          </div>
          {availableProducts.length > 0 && (
            <div className="flex min-w-[260px] flex-1 items-center gap-2 sm:max-w-[430px]">
              <select
                value={addProductId}
                onChange={(event) => setAddProductId(event.target.value)}
                className="h-10 min-w-0 flex-1 rounded-lg border border-cream-dark bg-white px-2 font-sans text-xs font-semibold text-brown-dark outline-none focus:border-gold"
              >
                {availableProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.nev} ({product.egyseg.trim()})
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void addProductToDay()}
                disabled={!addProductId || savingProductId !== null || !stockTrackingReady}
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-brown-dark px-3 font-sans text-xs font-black text-cream disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Termék
              </button>
            </div>
          )}
        </div>

        {orderedProducts.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="font-sans text-sm font-bold text-brown-dark">Még nincs termék a napi készletben.</p>
            <p className="mt-1 font-sans text-xs text-brown/45">Adj hozzá egy terméket a fenti választóból.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-max border-collapse">
              <thead>
                <tr className="bg-cream-dark/55">
                  <th className="sticky left-0 z-10 w-[152px] min-w-[152px] border-b border-r border-cream-dark bg-cream-dark px-4 py-3 text-left font-sans text-xs font-black uppercase text-brown/55">
                    Készlet
                  </th>
                  {orderedProducts.map((product, index) => (
                    <th
                      key={product.id}
                      className={`w-[160px] min-w-[160px] border-b border-r border-cream-dark px-3 py-3 text-center ${
                        isBreadCategory(product.kategoria) ? "bg-gold/15" : ""
                      }`}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => moveProduct(product.id, -1)}
                          disabled={index === 0}
                          aria-label={`${product.nev} mozgatása balra`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 text-brown/55 hover:bg-white disabled:opacity-20"
                        >
                          <ArrowLeft className="h-4.5 w-4.5" />
                        </button>
                        {savingProductId === product.id && <RefreshCw className="h-4 w-4 animate-spin text-gold-dark" />}
                        <button
                          type="button"
                          onClick={() => moveProduct(product.id, 1)}
                          disabled={index === orderedProducts.length - 1}
                          aria-label={`${product.nev} mozgatása jobbra`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/60 text-brown/55 hover:bg-white disabled:opacity-20"
                        >
                          <ArrowRight className="h-4.5 w-4.5" />
                        </button>
                      </div>
                      <span className="block max-w-[154px] font-sans text-sm font-black leading-tight text-brown-dark">{product.nev}</span>
                      <span className="mt-0.5 block font-sans text-[11px] font-medium text-brown/45">{product.egyseg.trim()}</span>
                      <span className="mt-1 block font-sans text-[11px] font-bold text-brown/55">{product.total} db rendelve</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-red-50">
                  <th className="sticky left-0 z-[5] border-b border-r border-red-200 bg-red-100 px-3 py-3 text-left font-sans text-[11px] font-black text-red-900">
                    Össz. gyártott
                    <span className="mt-0.5 block text-[9px] font-medium text-red-800/60">Raktárkészlet</span>
                  </th>
                  {orderedProducts.map((product) => {
                    const draft = stockDrafts[product.id] ?? {
                      produced: String(product.produced),
                      walkInSales: String(product.walkInSales),
                    };
                    return (
                      <td key={product.id} className="border-b border-r border-red-200 p-2.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={draft.produced}
                            disabled={!stockTrackingReady}
                            onFocus={(event) => event.currentTarget.select()}
                            onChange={(event) => setStockDrafts((current) => ({
                              ...current,
                              [product.id]: { ...draft, produced: event.target.value },
                            }))}
                            onBlur={() => void saveStock(product.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") event.currentTarget.blur();
                            }}
                            className="h-12 min-w-0 flex-1 rounded-lg border border-red-200 bg-white px-1 text-center font-sans text-xl font-black text-brown-dark outline-none focus:border-red-400 disabled:bg-red-50"
                          />
                          <button
                            type="button"
                            onClick={() => incrementProduced(product.id)}
                            disabled={!stockTrackingReady || savingProductId !== null}
                            aria-label={`${product.nev} gyártott mennyiség növelése eggyel`}
                            className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-red-500 font-sans text-sm font-black text-white active:scale-95 disabled:opacity-50"
                          >
                            +1
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-amber-50">
                  <th className="sticky left-0 z-[5] border-b border-r border-amber-200 bg-amber-100 px-3 py-3 text-left font-sans text-[11px] font-black text-amber-900">
                    Helyben eladva
                    <span className="mt-0.5 block text-[9px] font-medium text-amber-800/60">Rendelés nélkül</span>
                  </th>
                  {orderedProducts.map((product) => {
                    const draft = stockDrafts[product.id] ?? {
                      produced: String(product.produced),
                      walkInSales: String(product.walkInSales),
                    };
                    return (
                      <td key={product.id} className="border-b border-r border-amber-200 p-2.5">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={draft.walkInSales}
                            disabled={!stockTrackingReady}
                            onFocus={(event) => event.currentTarget.select()}
                            onChange={(event) => setStockDrafts((current) => ({
                              ...current,
                              [product.id]: { ...draft, walkInSales: event.target.value },
                            }))}
                            onBlur={() => void saveStock(product.id)}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") event.currentTarget.blur();
                            }}
                            className="h-12 min-w-0 flex-1 rounded-lg border border-amber-200 bg-white px-1 text-center font-sans text-xl font-black text-brown-dark outline-none focus:border-amber-400 disabled:bg-amber-50"
                          />
                          <button
                            type="button"
                            onClick={() => incrementWalkInSale(product.id)}
                            disabled={!stockTrackingReady || savingProductId !== null}
                            aria-label={`${product.nev} helyben eladott mennyiség növelése eggyel`}
                            className="flex h-12 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 font-sans text-sm font-black text-white active:scale-95 disabled:opacity-50"
                          >
                            +1
                          </button>
                        </div>
                      </td>
                    );
                  })}
                </tr>
                <tr className="bg-blue-50">
                  <th className="sticky left-0 z-[5] border-b border-r border-blue-200 bg-blue-100 px-3 py-3 text-left font-sans text-[11px] font-black text-blue-900">
                    Rendelésből kiadva
                  </th>
                  {orderedProducts.map((product) => (
                    <td key={product.id} className="border-b border-r border-blue-200 px-2 py-3 text-center font-sans text-lg font-black text-blue-900">
                      {product.issued}
                    </td>
                  ))}
                </tr>
                <tr className="bg-emerald-50">
                  <th className="sticky left-0 z-[5] border-r border-emerald-200 bg-emerald-100 px-3 py-3 text-left font-sans text-[11px] font-black text-emerald-900">
                    Napi maradék
                  </th>
                  {orderedProducts.map((product) => {
                    const draft = stockDrafts[product.id] ?? {
                      produced: String(product.produced),
                      walkInSales: String(product.walkInSales),
                    };
                    const remaining = quantityValue(draft.produced) - quantityValue(draft.walkInSales) - product.issued;
                    return (
                      <td
                        key={product.id}
                        className={`border-r border-emerald-200 px-2 py-3 text-center font-sans text-xl font-black ${
                          remaining < 0 ? "bg-red-100 text-red-800" : "text-emerald-900"
                        }`}
                      >
                        {remaining}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <div className="border-t border-cream-dark bg-cream/30 px-3 py-2">
          <p className="font-sans text-[10px] text-brown/45">
            Napi maradék = össz. gyártott - helyben eladva - rendelésből kiadva.
          </p>
        </div>
      </section>

      <section className="mb-3 flex gap-2">
        <label className="flex h-12 min-w-0 flex-1 items-center gap-2 rounded-xl border border-cream-dark bg-white px-3">
          <Search className="h-5 w-5 shrink-0 text-brown/35" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Név vagy telefonszám"
            className="min-w-0 flex-1 bg-transparent font-sans text-base text-brown-dark outline-none placeholder:text-brown/35"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Keresés törlése">
              <X className="h-5 w-5 text-brown/40" />
            </button>
          )}
        </label>
        <button
          type="button"
          onClick={() => setOnlyPending((current) => !current)}
          className={`shrink-0 rounded-xl border px-3 font-sans text-xs font-bold ${
            onlyPending
              ? "border-amber-400 bg-amber-100 text-amber-900"
              : "border-cream-dark bg-white text-brown/60"
          }`}
        >
          {onlyPending ? "Kiadandók" : "Mind"}
        </button>
      </section>

      {notice && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 font-sans text-sm font-semibold text-emerald-900">
          <Check className="h-4 w-4 shrink-0" />
          {notice}
        </div>
      )}

      {(error || stockTrackingError) && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-sans text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error || stockTrackingError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="h-8 w-8 animate-spin text-gold" />
        </div>
      ) : dayOrders.length === 0 ? (
        <div className="rounded-2xl border border-cream-dark bg-white px-4 py-16 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-brown/20" />
          <p className="mt-3 font-sans text-base font-bold text-brown-dark">
            {search || onlyPending ? "Nincs találat" : "Erre a napra nincs kiadandó rendelés"}
          </p>
          <p className="mt-1 font-sans text-sm text-brown/45">
            {onlyPending ? "Minden látható rendelést átadtatok." : "Válassz másik napot a fenti dátumsávban."}
          </p>
        </div>
      ) : (
        <>
          <div className={styles.cardView}>
            <div className="space-y-2.5">
              {dayOrders.map((order) => {
                const dayItems = getActiveDayItems(order, selectedDate);
                const status = getDayStatus(order, selectedDate);
                const otherDates = new Set(order.rendeles_tetelek.filter((item) => item.datum !== selectedDate).map((item) => item.datum));
                const actionKey = `${order.id}_${selectedDate}_atvetel`;

                return (
                  <article key={order.id} className={`overflow-hidden rounded-2xl border-2 shadow-sm ${statusSurface(status)}`}>
                    <button
                      type="button"
                      onClick={() => setSelectedOrderId(order.id)}
                      className="w-full px-4 pb-3 pt-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h2 className={`truncate font-sans text-lg font-black ${statusText(status)}`}>{getOrderName(order)}</h2>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {order.telefon && (
                              <span className="inline-flex items-center gap-1 font-sans text-xs text-brown/55">
                                <Phone className="h-3.5 w-3.5" />
                                {order.telefon}
                              </span>
                            )}
                            {otherDates.size > 0 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 font-sans text-[10px] font-bold text-brown/55">
                                <Clock3 className="h-3 w-3" />
                                +{otherDates.size} másik nap
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 font-sans text-[10px] font-black uppercase ${
                          status === "atvetel"
                            ? "bg-emerald-600 text-white"
                            : status === "reszben"
                              ? "bg-amber-500 text-white"
                              : "bg-brown-dark text-cream"
                        }`}>
                          {statusLabel(status)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        {dayItems.map((item) => {
                          const issued = normalizeStatus(item.allapot) === "atvetel";
                          return (
                            <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-white/70 px-3 py-2">
                              <span className={`font-sans text-sm font-semibold ${issued ? "text-emerald-800 line-through" : "text-brown-dark"}`}>
                                {getProductLabel(item, productMap)}
                              </span>
                              <span className={`shrink-0 font-sans text-base font-black ${issued ? "text-emerald-700" : "text-brown-dark"}`}>
                                {item.mennyiseg} db
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {order.megjegyzes && (
                        <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 font-sans text-xs font-semibold text-amber-900">
                          {order.megjegyzes}
                        </p>
                      )}
                    </button>

                    <div className="border-t border-black/10 p-2">
                      {status === "atvetel" ? (
                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(order.id)}
                          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 font-sans text-base font-black text-white"
                        >
                          <Check className="h-6 w-6" />
                          Átadva
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void updateDayStatus(order, "atvetel")}
                          disabled={pendingKey !== null}
                          className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brown-dark font-sans text-base font-black text-cream shadow-sm active:scale-[0.99] disabled:opacity-60"
                        >
                          {pendingKey === actionKey ? <RefreshCw className="h-5 w-5 animate-spin" /> : <PackageCheck className="h-6 w-6" />}
                          {status === "reszben" ? "Maradék átadása" : "Teljes csomag átadása"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className={styles.matrixView}>
            <div className="overflow-x-auto rounded-2xl border border-cream-dark bg-white shadow-sm">
              <table className="w-full min-w-max border-collapse">
                <thead>
                  <tr className="bg-cream-dark/60">
                    <th className="sticky left-0 z-10 min-w-[210px] border-b border-r border-cream-dark bg-cream-dark px-3 py-3 text-left font-sans text-xs font-black uppercase text-brown/60">
                      Vásárló
                    </th>
                    {orderedProducts.map((product) => (
                      <th key={product.id} className={`min-w-[112px] border-b border-r border-cream-dark px-2 py-2 text-center ${isBreadCategory(product.kategoria) ? "bg-gold/15" : ""}`}>
                        <span className="block max-w-[140px] font-sans text-xs font-black text-brown-dark">{product.nev}</span>
                        <span className="block font-sans text-[10px] font-medium text-brown/45">{product.egyseg.trim()}</span>
                        <span className="mt-1 block font-sans text-sm font-black text-brown-dark">Σ {product.total}</span>
                      </th>
                    ))}
                    <th className="sticky right-0 z-10 min-w-[148px] border-b border-cream-dark bg-cream-dark px-3 py-3 text-center font-sans text-xs font-black uppercase text-brown/60">
                      Átadás
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dayOrders.map((order) => {
                    const status = getDayStatus(order, selectedDate);
                    const dayItems = getActiveDayItems(order, selectedDate);
                    const itemByProductId = new Map(dayItems.filter((item) => item.termek_id).map((item) => [item.termek_id!, item]));
                    const otherDates = new Set(order.rendeles_tetelek.filter((item) => item.datum !== selectedDate).map((item) => item.datum));
                    const surface = statusSurface(status);
                    const actionKey = `${order.id}_${selectedDate}_atvetel`;

                    return (
                      <tr key={order.id} className={surface}>
                        <td className={`sticky left-0 z-[5] border-b border-r border-cream-dark px-3 py-2 ${surface}`}>
                          <button type="button" onClick={() => setSelectedOrderId(order.id)} className="block w-full text-left">
                            <span className={`block max-w-[190px] truncate font-sans text-sm font-black ${statusText(status)}`}>{getOrderName(order)}</span>
                            <span className="block font-sans text-[10px] text-brown/50">{order.telefon || order.rendeles_szam}</span>
                            {order.megjegyzes && (
                              <span className="mt-1 block max-w-[200px] truncate font-sans text-[10px] font-bold text-amber-800" title={order.megjegyzes}>
                                {order.megjegyzes}
                              </span>
                            )}
                            {otherDates.size > 0 && (
                              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/70 px-1.5 py-0.5 font-sans text-[9px] font-bold text-brown/50">
                                <Clock3 className="h-2.5 w-2.5" />
                                +{otherDates.size} másik nap
                              </span>
                            )}
                          </button>
                        </td>
                        {orderedProducts.map((product) => {
                          const item = itemByProductId.get(product.id);
                          if (!item) {
                            return <td key={product.id} className="border-b border-r border-cream-dark px-2 py-2 text-center text-brown/20">-</td>;
                          }
                          const issued = normalizeStatus(item.allapot) === "atvetel";
                          const itemActionKey = `${order.id}_${item.id}_${issued ? "uj" : "atvetel"}`;
                          return (
                            <td key={product.id} className="border-b border-r border-cream-dark p-1.5 text-center">
                              <button
                                type="button"
                                onClick={() => void updateItemStatus(order, item)}
                                disabled={pendingKey !== null}
                                title={`${product.nev}: ${issued ? "átadás visszavonása" : "tétel átadása"}`}
                                className={`mx-auto flex min-h-11 min-w-16 items-center justify-center gap-1 rounded-lg border px-2 font-sans text-base font-black ${
                                  issued
                                    ? "border-emerald-500 bg-emerald-600 text-white"
                                    : "border-white/70 bg-white/80 text-brown-dark hover:border-gold"
                                } disabled:opacity-60`}
                              >
                                {pendingKey === itemActionKey ? <RefreshCw className="h-4 w-4 animate-spin" /> : issued ? <Check className="h-4 w-4" /> : null}
                                {item.mennyiseg}
                              </button>
                            </td>
                          );
                        })}
                        <td className={`sticky right-0 z-[5] border-b border-cream-dark px-2 py-2 ${surface}`}>
                          {status === "atvetel" ? (
                            <button
                              type="button"
                              onClick={() => setSelectedOrderId(order.id)}
                              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 font-sans text-xs font-black text-white"
                            >
                              <Check className="h-4 w-4" />
                              Átadva
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => void updateDayStatus(order, "atvetel")}
                              disabled={pendingKey !== null}
                              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-brown-dark px-3 font-sans text-xs font-black text-cream disabled:opacity-60"
                            >
                              {pendingKey === actionKey ? <RefreshCw className="h-4 w-4 animate-spin" /> : <PackageCheck className="h-4 w-4" />}
                              {status === "reszben" ? "Maradék" : "Mind átadva"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 flex items-center gap-1.5 font-sans text-[11px] text-brown/45">
              <Info className="h-3.5 w-3.5" />
              Egy számra koppintva csak az adott termék, a jobb oldali gombbal a teljes napi csomag adható át.
            </p>
          </div>
        </>
      )}

      {showManualOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-brown-dark/50 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Új rendelés bezárása"
            onClick={() => setShowManualOrder(false)}
            className="absolute inset-0"
          />
          <section className="relative z-10 max-h-[94vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-3xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-cream-dark bg-white px-4 py-4 sm:px-5">
              <div>
                <h2 className="font-serif text-xl text-brown-dark">Új rendelés</h2>
                <p className="font-sans text-xs text-brown/45">Helyben vagy telefonon leadott rendelés rögzítése.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowManualOrder(false)}
                aria-label="Bezárás"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-dark text-brown/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="font-sans text-xs font-bold text-brown/60">
                  Név
                  <input
                    value={manualOrder.nev}
                    onChange={(event) => setManualOrder((current) => ({ ...current, nev: event.target.value }))}
                    className="mt-1 h-11 w-full rounded-xl border border-cream-dark px-3 font-sans text-base font-normal text-brown-dark outline-none focus:border-gold"
                  />
                </label>
                <label className="font-sans text-xs font-bold text-brown/60">
                  Telefonszám
                  <input
                    value={manualOrder.telefon}
                    onChange={(event) => setManualOrder((current) => ({ ...current, telefon: event.target.value }))}
                    className="mt-1 h-11 w-full rounded-xl border border-cream-dark px-3 font-sans text-base font-normal text-brown-dark outline-none focus:border-gold"
                  />
                </label>
                <label className="font-sans text-xs font-bold text-brown/60">
                  Email
                  <input
                    type="email"
                    value={manualOrder.email}
                    onChange={(event) => setManualOrder((current) => ({ ...current, email: event.target.value }))}
                    className="mt-1 h-11 w-full rounded-xl border border-cream-dark px-3 font-sans text-base font-normal text-brown-dark outline-none focus:border-gold"
                  />
                </label>
              </div>

              <label className="block font-sans text-xs font-bold text-brown/60">
                Megjegyzés
                <textarea
                  value={manualOrder.megjegyzes}
                  onChange={(event) => setManualOrder((current) => ({ ...current, megjegyzes: event.target.value }))}
                  rows={2}
                  className="mt-1 w-full resize-none rounded-xl border border-cream-dark px-3 py-2 font-sans text-base font-normal text-brown-dark outline-none focus:border-gold"
                />
              </label>

              <div className="overflow-hidden rounded-xl border border-cream-dark">
                <div className="bg-cream-dark/45 px-3 py-2 font-sans text-xs font-black uppercase text-brown/50">
                  Tételek
                </div>
                <div className="divide-y divide-cream-dark">
                  {manualOrder.items.map((item) => (
                    <div key={item.id} className="grid gap-2 p-3 sm:grid-cols-[150px_minmax(0,1fr)_90px_44px]">
                      <input
                        type="date"
                        value={item.datum}
                        onChange={(event) => updateManualItem(item.id, { datum: event.target.value })}
                        className="h-11 rounded-xl border border-cream-dark px-2 font-sans text-sm outline-none focus:border-gold"
                      />
                      <select
                        value={item.productId}
                        onChange={(event) => updateManualItem(item.id, { productId: event.target.value })}
                        className="h-11 min-w-0 rounded-xl border border-cream-dark px-2 font-sans text-sm outline-none focus:border-gold"
                      >
                        {products.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.nev} ({product.egyseg.trim()})
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        inputMode="numeric"
                        value={item.quantity}
                        onChange={(event) => updateManualItem(item.id, {
                          quantity: Math.max(1, Number(event.target.value || 1)),
                        })}
                        className="h-11 rounded-xl border border-cream-dark px-2 text-center font-sans text-base font-black outline-none focus:border-gold"
                      />
                      <button
                        type="button"
                        onClick={() => removeManualItem(item.id)}
                        disabled={manualOrder.items.length === 1}
                        aria-label="Tétel törlése"
                        className="flex h-11 items-center justify-center rounded-xl border border-cream-dark text-brown/45 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={addManualItem}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-cream-dark px-3 font-sans text-sm font-bold text-brown/70 hover:border-gold"
                >
                  <Plus className="h-4 w-4" />
                  Tétel hozzáadása
                </button>
                <label className="flex items-center gap-2 font-sans text-sm text-brown/65">
                  <input
                    type="checkbox"
                    checked={manualOrder.sendEmail}
                    onChange={(event) => setManualOrder((current) => ({ ...current, sendEmail: event.target.checked }))}
                    disabled={!manualOrder.email.trim()}
                    className="h-4 w-4 accent-gold"
                  />
                  Visszaigazoló email
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-cream-dark bg-white px-4 py-4 sm:px-5">
              <div>
                <p className="font-sans text-[10px] font-bold uppercase text-brown/40">Végösszeg</p>
                <p className="font-sans text-lg font-black text-brown-dark">{formatFt(manualOrderTotal)}</p>
              </div>
              <button
                type="button"
                onClick={() => void submitManualOrder()}
                disabled={manualSaving}
                className="h-12 rounded-xl bg-brown-dark px-5 font-sans text-sm font-black text-cream disabled:opacity-50"
              >
                {manualSaving ? "Rögzítés..." : "Rendelés rögzítése"}
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-brown-dark/50 sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Részletek bezárása"
            onClick={() => setSelectedOrderId(null)}
            className="absolute inset-0"
          />
          <section className="relative z-10 max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-cream shadow-2xl sm:max-w-xl sm:rounded-3xl">
            <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-cream-dark bg-white px-4 py-4">
              <div>
                <h2 className="font-serif text-xl text-brown-dark">{getOrderName(selectedOrder)}</h2>
                <p className="font-sans text-xs text-brown/45">{selectedOrder.rendeles_szam}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrderId(null)}
                aria-label="Bezárás"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-cream-dark text-brown/60"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              {(selectedOrder.telefon || selectedOrder.email) && (
                <div className="rounded-xl border border-cream-dark bg-white p-3">
                  {selectedOrder.telefon && (
                    <a href={`tel:${selectedOrder.telefon}`} className="flex min-h-10 items-center gap-2 font-sans text-base font-bold text-brown-dark">
                      <Phone className="h-5 w-5 text-gold-dark" />
                      {selectedOrder.telefon}
                    </a>
                  )}
                  {selectedOrder.email && <p className="break-all font-sans text-xs text-brown/50">{selectedOrder.email}</p>}
                </div>
              )}

              {selectedOrder.megjegyzes && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
                  <p className="font-sans text-[10px] font-black uppercase text-amber-800/60">Megjegyzés</p>
                  <p className="mt-1 font-sans text-sm font-semibold text-amber-900">{selectedOrder.megjegyzes}</p>
                </div>
              )}

              <div>
                <h3 className="mb-2 font-sans text-xs font-black uppercase text-brown/45">
                  {formatLongDate(selectedDate)}
                </h3>
                <div className="space-y-2">
                  {getActiveDayItems(selectedOrder, selectedDate).map((item) => {
                    const issued = normalizeStatus(item.allapot) === "atvetel";
                    const itemActionKey = `${selectedOrder.id}_${item.id}_${issued ? "uj" : "atvetel"}`;
                    const dateActionKey = `${selectedOrder.id}_${item.id}_date`;
                    const editedDate = dateEdits[item.id] ?? item.datum;
                    return (
                      <div
                        key={item.id}
                        className={`overflow-hidden rounded-xl border-2 ${
                          issued ? "border-emerald-400 bg-emerald-100" : "border-cream-dark bg-white"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => void updateItemStatus(selectedOrder, item)}
                          disabled={pendingKey !== null}
                          className="flex min-h-14 w-full items-center justify-between gap-3 px-3 text-left disabled:opacity-60"
                        >
                          <span>
                            <span className={`block font-sans text-sm font-bold ${issued ? "text-emerald-900 line-through" : "text-brown-dark"}`}>
                              {getProductLabel(item, productMap)}
                            </span>
                            <span className="font-sans text-xs text-brown/45">{issued ? "Átadva, koppints a visszavonáshoz" : "Koppints az átadáshoz"}</span>
                          </span>
                          <span className={`flex min-w-16 items-center justify-end gap-1 font-sans text-lg font-black ${issued ? "text-emerald-700" : "text-brown-dark"}`}>
                            {pendingKey === itemActionKey ? <RefreshCw className="h-4 w-4 animate-spin" /> : issued ? <Check className="h-5 w-5" /> : null}
                            {item.mennyiseg} db
                          </span>
                        </button>
                        <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-black/10 bg-white/70 p-2">
                          <label className="font-sans text-[10px] font-black uppercase text-brown/45">
                            Átvételi nap
                            <input
                              type="date"
                              value={editedDate}
                              onChange={(event) => setDateEdits((current) => ({
                                ...current,
                                [item.id]: event.target.value,
                              }))}
                              className="mt-1 h-10 w-full rounded-lg border border-cream-dark bg-white px-2 font-sans text-sm font-normal text-brown-dark outline-none focus:border-gold"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => void updateItemDate(selectedOrder, item)}
                            disabled={pendingKey !== null || editedDate === item.datum}
                            className="mt-4 h-10 rounded-lg bg-brown-dark px-3 font-sans text-xs font-black text-cream disabled:opacity-35"
                          >
                            {pendingKey === dateActionKey ? "Mentés..." : "Nap mentése"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {selectedOrder.rendeles_tetelek.some((item) => item.datum !== selectedDate) && (
                <details className="rounded-xl border border-cream-dark bg-white">
                  <summary className="cursor-pointer px-3 py-3 font-sans text-sm font-bold text-brown/70">
                    Más napokra leadott rendelései
                  </summary>
                  <div className="space-y-2 border-t border-cream-dark px-3 py-3">
                    {selectedOrder.rendeles_tetelek
                      .filter((item) => item.datum !== selectedDate)
                      .sort((a, b) => a.datum.localeCompare(b.datum))
                      .map((item) => (
                        <div key={item.id} className="flex items-start justify-between gap-3 font-sans text-sm">
                          <span>
                            <span className="block font-bold text-brown-dark">{getProductLabel(item, productMap)}</span>
                            <span className="text-xs text-brown/45">{formatShortDate(item.datum)}</span>
                          </span>
                          <span className="font-black text-brown-dark">{item.mennyiseg} db</span>
                        </div>
                      ))}
                  </div>
                </details>
              )}

              {getDayStatus(selectedOrder, selectedDate) === "atvetel" ? (
                <button
                  type="button"
                  onClick={() => void updateDayStatus(selectedOrder, "uj")}
                  disabled={pendingKey !== null}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white font-sans text-sm font-bold text-red-700 disabled:opacity-60"
                >
                  <RotateCcw className="h-4 w-4" />
                  Teljes napi átadás visszavonása
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void updateDayStatus(selectedOrder, "atvetel")}
                  disabled={pendingKey !== null}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-brown-dark font-sans text-base font-black text-cream disabled:opacity-60"
                >
                  <PackageCheck className="h-5 w-5" />
                  Teljes napi csomag átadása
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
