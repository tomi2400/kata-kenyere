"use client";

import { useState } from "react";
import DayProductAvailabilityRow from "@/components/DayProductAvailabilityRow";
import ProductCard from "@/components/ProductCard";
import type { Termek } from "@/lib/products";
import { countsTowardBreadLimit } from "@/lib/bread-limit";

const day = { datum: "2026-10-09", nap: "Péntek" };

const product: Termek = {
  id: "preview-bread",
  slug: "preview-feher-1kg",
  nev: "Fehér kenyér",
  leiras: "Frissen sült, hosszú érlelésű kovászos fehér kenyér.",
  kategoria: "Kovászos kenyerek",
  ar: 2500,
  egyseg: "1 kg",
  foto_url: "/images/DSC00045.JPG",
};

const secondProduct: Termek = {
  ...product,
  id: "preview-white-bread",
  slug: "preview-feher-750g",
  egyseg: "750 g",
  ar: 2000,
};
const baguette: Termek = {
  ...product,
  id: "preview-baguette",
  slug: "preview-bagett",
  nev: "Bagett",
  leiras: "Ropogós, friss bagett.",
  egyseg: "300 g",
  ar: 950,
};
const previewProducts = [product, secondProduct, baguette];

export default function CustomerLimitPreview() {
  const [limits, setLimits] = useState<Record<string, number>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [breadLimit, setBreadLimit] = useState<number | null>(3);
  const [breadDraft, setBreadDraft] = useState("3");
  const [enabledIds, setEnabledIds] = useState<string[]>(previewProducts.map((item) => item.id));
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const breadUsed = previewProducts.reduce((sum, item) => sum + (
    countsTowardBreadLimit(item) ? quantities[item.id] ?? 0 : 0
  ), 0);

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
    const nextBreadLimit = breadDraft.trim() === "" ? null : Number(breadDraft.trim());
    if (nextBreadLimit !== null && (!Number.isInteger(nextBreadLimit) || nextBreadLimit < 1 || nextBreadLimit > 99)) {
      setError("A közös kenyérmaximum 1 és 99 közötti egész szám lehet.");
      return;
    }
    setError("");
    setLimits(nextLimits);
    setBreadLimit(nextBreadLimit);
    setQuantities((current) => {
      const next = { ...current };
      let remaining = nextBreadLimit ?? 99;
      for (const item of previewProducts) {
        const productMaximum = nextLimits[item.id] ?? 99;
        const breadMaximum = countsTowardBreadLimit(item) ? remaining : 99;
        next[item.id] = Math.min(next[item.id] ?? 0, productMaximum, breadMaximum);
        if (countsTowardBreadLimit(item)) remaining -= next[item.id];
      }
      return next;
    });
    setSaved(true);
  };

  const toggle = (id: string) => {
    setEnabledIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setQuantities((current) => ({ ...current, [id]: 0 }));
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
        <h1 className="mt-5 font-serif text-3xl text-brown-dark">Közös pénteki kenyérkeret</h1>
        <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-brown/70">
          Próbáld ki, hogyan számítódik együtt a pénteki kenyérmennyiség a Rendelési napok adminfelületen és a vásárló előtt.
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
              <div className="mt-3 rounded-lg border border-gold/30 bg-cream/50 p-3">
                <label htmlFor="preview-bread-limit" className="block font-sans text-xs font-semibold text-brown-dark">
                  Kenyerek együtt – maximum vevőnként
                </label>
                <p className="mt-1 font-sans text-[10px] text-brown/55">
                  A pénteki kenyerek egy közös keretbe számítanak. A bagett nem. Üresen nincs közös limit.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="preview-bread-limit"
                    type="number"
                    min={1}
                    max={99}
                    step={1}
                    value={breadDraft}
                    onChange={(event) => { setBreadDraft(event.target.value); setSaved(false); }}
                    className="w-20 rounded-lg border border-cream-dark bg-white px-2 py-1.5 font-sans text-xs focus:border-gold focus:outline-none"
                  />
                  <span className="font-sans text-xs text-brown/55">db / vevő</span>
                </div>
              </div>
              {error && <p className="mt-2 font-sans text-xs text-red-600">{error}</p>}
              {saved && <p className="mt-2 font-sans text-xs text-green-700">Minden módosítás mentve.</p>}
              <div className="mt-4 border-t border-cream-dark pt-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-brown/60">Elérhető termékek</p>
                <div className="mt-2 rounded-xl border border-cream-dark bg-cream/40 p-3">
                  <p className="mb-2 font-sans text-xs font-semibold text-brown-dark">Kovászos kenyerek</p>
                  <div className="space-y-1.5">
                    {previewProducts.map((item) => (
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
              Próbáld ki: 1 db fehér 1 kg + 2 db fehér 750 g után a kenyérkeret betelik. A bagett ettől függetlenül hozzáadható.
            </p>
          </section>

          <section>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-brown/50">Vásárlói rendelési felület · péntek</p>
            {breadLimit !== null && (
              <div className="mt-3 rounded-xl bg-cream px-3 py-2 font-sans text-xs text-brown-dark">
                <p className="font-semibold">Közös kenyérkeret: {breadUsed}/{breadLimit} db. A bagett nem számít bele.</p>
                <p className="mt-1 text-brown/60">Az azonos e-mail-címmel korábban leadott rendelések is beleszámítanak.</p>
              </div>
            )}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {previewProducts.filter((item) => enabledIds.includes(item.id)).map((item) => (
                <ProductCard
                  key={item.id}
                  termek={item}
                  datum={day.datum}
                  maxVevonkent={limits[item.id] ?? null}
                  breadGroup={breadLimit !== null && countsTowardBreadLimit(item)
                    ? { limit: breadLimit, used: breadUsed }
                    : null}
                  preview={{
                    quantity: quantities[item.id] ?? 0,
                    onChange: (quantity) => setQuantities((current) => ({ ...current, [item.id]: quantity })),
                  }}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
