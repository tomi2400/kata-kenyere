"use client";

import { useState } from "react";
import DayProductLimitEditor from "@/components/DayProductLimitEditor";
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
  egyseg: "1 db",
  foto_url: "/images/DSC00045.JPG",
};

export default function CustomerLimitPreview() {
  const [limit, setLimit] = useState<number | null>(3);
  const [draft, setDraft] = useState("3");
  const [quantity, setQuantity] = useState(0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    const value = draft.trim();
    const nextLimit = value === "" ? null : Number(value);
    if (nextLimit !== null && (!Number.isInteger(nextLimit) || nextLimit < 1 || nextLimit > 99)) {
      setError("A maximum 1 és 99 közötti egész szám lehet.");
      return;
    }
    setError("");
    setLimit(nextLimit);
    setQuantity((current) => Math.min(current, nextLimit ?? 99));
    setSaved(true);
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
              <div className="mt-3 border-t border-cream-dark pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brown/60">Elérhető termékek</p>
                <div className="mt-2 flex items-center justify-between"><span>Kovászos kenyér</span><span className="font-semibold text-green-700">Elérhető</span></div>
              </div>
            </div>
            <div className="mt-5">
              <DayProductLimitEditor
                products={[product]}
                limits={limit === null ? {} : { [product.id]: limit }}
                drafts={{ [product.id]: draft }}
                successId={saved ? product.id : null}
                error={error}
                showBulkSaveHint={false}
                onChange={(_, value) => { setDraft(value); setSaved(false); }}
                onSave={save}
              />
            </div>
            <p className="mt-4 font-sans text-xs leading-5 text-brown/60">
              Írd át a maximumot, kattints a Mentés gombra, majd nézd meg a vásárlói kártyán a változást. Üres mezővel kikapcsolhatod a külön limitet.
            </p>
          </section>

          <section>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-brown/50">Vásárlói rendelési felület · péntek</p>
            <div className="mt-3 max-w-sm">
              <ProductCard
                termek={product}
                datum={day.datum}
                maxVevonkent={limit}
                preview={{ quantity, onChange: setQuantity }}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
