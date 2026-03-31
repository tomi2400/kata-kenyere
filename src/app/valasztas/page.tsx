"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { type Termek, csoportositByKategoria, formatAr } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import DayProgress from "@/components/DayProgress";

export default function TermekekPage() {
  const router = useRouter();
  const { selectedDays, carts, getDayTotal, currentStep, setCurrentStep } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [termekek, setTermekek] = useState<Termek[]>([]);
  const [kategoriak, setKategoriak] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetch("/api/termekek", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setTermekek(data.termekek);
        setKategoriak(data.kategoriak);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Ha nincs kiválasztott nap, vissza a főoldalra
  useEffect(() => {
    if (mounted && selectedDays.length === 0) {
      router.replace("/");
    }
  }, [mounted, selectedDays, router]);

  useEffect(() => {
    if (!mounted || selectedDays.length === 0) return;
    if (currentStep < 0 || currentStep >= selectedDays.length) {
      setCurrentStep(Math.max(0, selectedDays.length - 1));
    }
  }, [mounted, selectedDays, currentStep, setCurrentStep]);

  if (!mounted || selectedDays.length === 0 || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const termekekByKategoria = csoportositByKategoria(termekek, kategoriak);
  const currentDay = selectedDays[currentStep];
  const isLastDay = currentStep === selectedDays.length - 1;
  const dayTotal = getDayTotal(currentDay.datum);
  const totalItems = (carts[currentDay.datum] ?? []).reduce((s, i) => s + i.mennyiseg, 0);

  const handleNext = () => {
    if (isLastDay) {
      setCurrentStep(currentStep);
      router.push("/osszesites");
    } else {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/elorendeles");
  };

  return (
    <div className="min-h-screen bg-cream pb-32 grain-overlay">
      <header className="sticky top-0 z-20 bg-cream/85 backdrop-blur-md border-b border-gold/15 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => router.push("/")} className="flex items-center gap-2 cursor-pointer">
              <Image src="/images/logo.png" alt="Kata Kenyere" width={32} height={32} />
            </button>
            <button
              onClick={handleBack}
              className="font-sans text-xs text-brown/50 hover:text-brown transition-colors cursor-pointer"
            >
              ← Vissza
            </button>
          </div>
          <DayProgress steps={selectedDays} currentIndex={currentStep} />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-6">
        <section className="paper-panel warm-ring rounded-[1.75rem] px-5 py-5 md:px-6 md:py-6 mb-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-gold/10 blur-2xl" />
          <div className="relative">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-brown/40 mb-2">
              {currentStep + 1}. lépés
            </p>
            <h1 className="font-serif text-2xl md:text-3xl text-brown-dark">
              {currentDay.nap}i kínálat
            </h1>
            <p className="font-sans text-sm text-brown/55 mt-2 max-w-lg leading-relaxed">
              Állítsd össze erre a napra a kosarat. A mennyiségek külön ennél az átvételi napnál számolódnak.
            </p>
          </div>
        </section>

        {Object.entries(termekekByKategoria).map(([kategoria, termekek]) => (
          <section key={kategoria} className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gold/25" />
              <h2 className="font-serif text-base text-brown/70 shrink-0">
                {kategoria}
              </h2>
              <div className="h-px flex-1 bg-gold/25" />
            </div>
            <p className="font-sans text-xs text-brown/45 mb-4">
              Az itt kiválasztott termékek csak a {currentDay.nap.toLowerCase()}i átvételhez kerülnek.
            </p>
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-2 gap-4">
              {termekek.map((termek) => (
                <ProductCard
                  key={termek.id}
                  termek={termek}
                  datum={currentDay.datum}
                />
              ))}
            </div>
          </section>
        ))}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 safe-area-pb">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4 rounded-[1.7rem] bg-brown-dark/96 backdrop-blur-md border border-cream/10 px-5 py-4 shadow-[0_26px_50px_rgba(61,35,20,0.28)]">
          <div>
            {totalItems > 0 ? (
              <>
                <p className="font-sans text-xs uppercase tracking-[0.16em] text-cream/45">{totalItems} tétel</p>
                <p className="font-sans font-bold text-cream text-lg">
                  {formatAr(dayTotal)}
                </p>
              </>
            ) : (
              <p className="font-sans text-sm text-cream/40">Még nem választottál erre a napra</p>
            )}
          </div>

          <button
            onClick={handleNext}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-lg font-sans font-semibold text-sm transition-all
              ${totalItems > 0
                ? "bg-gold text-brown-dark hover:bg-gold-light cursor-pointer"
                : "bg-cream/10 text-cream/30 cursor-not-allowed"
              }
            `}
            disabled={totalItems === 0}
          >
            {isLastDay ? "Összesítés" : `${selectedDays[currentStep + 1]?.nap}i termékek`}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
