"use client";

import { useState } from "react";
import DayProductAvailabilityRow from "@/components/DayProductAvailabilityRow";
import ProductCard from "@/components/ProductCard";
import type { Termek } from "@/lib/products";

const day = { datum: "2026-10-09", nap: "Péntek" };

const product: Termek = {
  id: "preview-bread",
  slug: "preview-kovaszos-kenyer",
  nev: "Kovászos kenyér",
  leiras: "Frissen sült, hosszú érlelésű kovászos kenyér.",
  kategoria: "Kenyerek",
  ar: 2500,
  egyseg: "1 kg",
  foto_url: "/images/DSC00045.JPG",
};

const secondProduct = { id: "preview-white-bread", nev: "Fehér kenyér", egyseg: "750 g" };

export default function CustomerLimitPreview() {
  const [limits, setLimits] = useState<Record<string, number>>({ [product.id]: 3 });
  const [drafts, setDrafts] = useState<Record<string, string>>({ [product.id]: "3", [secondProduct.id]: "" });
  const [enabledIds, setEnabledIds] = useState<string[]>([product.id, secondProduct.id]);
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    const nextLimits: Record<string, number> = {};
    for (const [id, draft] of Object.entries(drafts)) {
      const value = draft.trim();
      if (value === "") continue;
      const maximum = Number(value);
      if (!Number.isInteger(maximum) || maximum < 1 || maximum > 99) {
        setError("A maximum 1 és 99 közötti egész szám lehet.");
        return;
      }
      nextLimits[id] = maximum;
    }
    setError("");
    setLimits(nextLimits);
    setQuantity((current) => Math.min(current, nextLimits[product.id] ?? 99));
    setSaved(true);
  };

  const toggle = (id: string) => {
    setEnabledIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const changeDraft = (id: string, value: string) => {
    setDrafts((current) => ({ ...current, [id]: value }));
    setSaved(false);
    setError("");
  };

  return (
    <main className="min-h-screen bg-[#fafaf8] px-4 py-10 text-[#4b2e1f]">
      <div className="mx-auto max-w-4xl">
        <span className="rounded-full border border-gold/40 bg-white px-3 py-1 font-sans text-xs font-semibold uppercase tracking-[0.12em] text-brown-dark">
          Interaktív preview
        </span>
        <h1 className="mt-5 font-serif text-3xl text-brown-dark">Vevőnkénti napi maximum</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-brown/70">
          Próbáld ki, hogyan jelenik meg a pénteki kenyérlimit a Rendelési napok adminfelületen és a vásárló előtt.
          Ez a bemutató mintaadatokat használ: nem ment beállítást, és nem küld rendelést.
        </p>

        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-2xl border border-cream-dark bg-cream p-5">
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-brown/50">Rendelési napok · admin</p>
            <h2 className="mt-2 font-serif text-xl text-brown-dark">Péntek · 2026. október 9.</h2>
            <div className="mt-5 rounded-xl border border-cream-dark bg-white p-3 font-sans text-xs text-brown-dark">
              <div className="flex items-center justify-between"><span>Rendelés fogadása</span><span className="font-semibold text-green-700">Bekapcsolva</span></div>
              <button type="button" onClick={save} className="mt-4 w-full rounded-lg bg-gold py-2 font-sans text-sm font-semibold text-brown-dark hover:bg-gold-light">
                Módosítások mentése
              </button>
              <p className="mt-2 font-sans text-[10px] leading-4 text-brown/50">
                Csak a bekapcsolt termékek lesznek rendelhetők. A kapcsolók azonnal mentődnek.
                <br />
                Az adott nap minden termékénél külön állítható a maximum. Üres mezőnél nincs külön limit.
              </p>
              {error && <p className="mt-2 font-sans text-xs text-red-600">{error}</p>}
              {saved && <p className="mt-2 font-sans text-xs text-green-700">Minden módosítás mentve.</p>}
              <div className="mt-4 border-t border-cream-dark pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brown/60">Elérhető termékek</p>
                <div className="mt-2 rounded-xl border border-cream-dark bg-cream/40 p-3">
                  <p className="mb-2 font-sans text-xs font-semibold text-brown-dark">Kovászos kenyerek</p>
                  <div className="space-y-1.5">
                    {[product, secondProduct].map((item) => (
                      <DayProductAvailabilityRow
                        key={item.id}
                        id={item.id}
                        name={item.nev}
                        unit={item.egyseg}
                        enabled={enabledIds.includes(item.id)}
                        limitDraft={drafts[item.id] ?? ""}
                        onToggle={() => toggle(item.id)}
                        onLimitChange={(value) => changeDraft(item.id, value)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 font-sans text-xs leading-5 text-brown/60">
              Állítsd be a két termék maximumát külön-külön, majd a Módosítások mentése gombbal próbáld ki a változást. A vásárlói kártya a kovászos kenyérhez tartozik.
            </p>
          </section>

          <section>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-brown/50">Vásárlói rendelési felület · péntek</p>
            {enabledIds.includes(product.id) ? (
              <div className="mt-3 max-w-sm">
                <ProductCard
                  termek={product}
                  datum={day.datum}
                  maxVevonkent={limits[product.id] ?? null}
                  preview={{ quantity, onChange: setQuantity }}
                />
              </div>
            ) : (
              <p className="mt-3 rounded-xl border border-cream-dark bg-white p-4 font-sans text-sm text-brown/60">
                A kovászos kenyér most ki van kapcsolva, ezért a vásárlók nem rendelhetik.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
