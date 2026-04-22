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
      .then((data) => { setTermekek(data.termekek); setKategoriak(data.kategoriak); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (mounted && selectedDays.length === 0) router.replace("/");
  }, [mounted, selectedDays, router]);

  useEffect(() => {
    if (!mounted || selectedDays.length === 0) return;
    if (currentStep < 0 || currentStep >= selectedDays.length) {
      setCurrentStep(Math.max(0, selectedDays.length - 1));
    }
  }, [mounted, selectedDays, currentStep, setCurrentStep]);

  if (!mounted || selectedDays.length === 0 || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf8]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c79a66] border-t-transparent" />
      </div>
    );
  }

  const termekekByKategoria = csoportositByKategoria(termekek, kategoriak);
  const currentDay = selectedDays[currentStep];
  const isLastDay = currentStep === selectedDays.length - 1;
  const dayTotal = getDayTotal(currentDay.datum);
  const totalItems = (carts[currentDay.datum] ?? []).reduce((s, i) => s + i.mennyiseg, 0);

  const handleNext = () => {
    if (isLastDay) { setCurrentStep(currentStep); router.push("/osszesites"); }
    else { setCurrentStep(currentStep + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }
  };

  const handleBack = () => {
    if (currentStep > 0) { setCurrentStep(currentStep - 1); window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    router.push("/elorendeles");
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-32 grain-overlay text-[#4b2e1f]">
      <header className="sticky top-0 z-20 border-b border-[#ede8df] bg-white/90 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={() => router.push("/")} className="flex items-center gap-2 cursor-pointer">
              <Image src="/images/logo.png" alt="Kata Kenyere" width={30} height={30} />
            </button>
            <button onClick={handleBack} className="font-sans text-xs text-[#9a7a5d] transition-colors hover:text-[#4b2e1f] cursor-pointer">
              ← Vissza
            </button>
          </div>
          <DayProgress steps={selectedDays} currentIndex={currentStep} />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-6">
        <section className="mb-6 overflow-hidden rounded-[20px] border border-[#ede8df] bg-white px-5 py-5 md:px-6 md:py-6">
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#9a7a5d]">{currentStep + 1}. lépés</p>
          <h1 className="mt-1 font-serif text-[1.8rem] text-[#3d2314] md:text-[2.2rem]">{currentDay.nap}i kínálat</h1>
          <p className="mt-2 font-sans text-sm leading-relaxed text-[#7c5a46]">
            Állítsd össze erre a napra a kosarat. A mennyiségek külön ennél az átvételi napnál számolódnak.
          </p>
        </section>

        {Object.entries(termekekByKategoria).map(([kategoria, termekek]) => (
          <section key={kategoria} className="mb-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#d0af77]/30" />
              <h2 className="font-serif text-base text-[#4b2e1f] shrink-0">{kategoria}</h2>
              <div className="h-px flex-1 bg-[#d0af77]/30" />
            </div>
            <p className="mb-4 font-sans text-xs text-[#9a7a5d]">
              Az itt kiválasztott termékek csak a {currentDay.nap.toLowerCase()}i átvételhez kerülnek.
            </p>
            <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
              {termekek.map((termek) => (
                <ProductCard key={termek.id} termek={termek} datum={currentDay.datum} />
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-5">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 rounded-[20px] border border-[#3e2315]/12 bg-white px-5 py-4 shadow-[0_-2px_0_rgba(0,0,0,0.04),0_8px_32px_rgba(40,20,10,0.18)]">
          <div>
            {totalItems > 0 ? (
              <>
                <p className="font-sans text-xs uppercase tracking-[0.16em] text-[#9a7a5d]">{totalItems} tétel</p>
                <p className="font-sans text-lg font-bold text-[#3e2315]">{formatAr(dayTotal)}</p>
              </>
            ) : (
              <p className="font-sans text-sm text-[#9a7a5d]">Még nem választottál erre a napra</p>
            )}
          </div>
          <button
            onClick={handleNext}
            disabled={totalItems === 0}
            className={`flex items-center gap-2 rounded-full px-6 py-3 font-sans text-sm font-semibold transition-all duration-300 ${
              totalItems > 0
                ? "bg-[#c79a66] text-[#fff9f0] hover:-translate-y-0.5 hover:bg-[#b98b58] cursor-pointer shadow-[0_4px_14px_rgba(199,154,102,0.35)]"
                : "cursor-not-allowed bg-[#ede8df] text-[#b8a898]"
            }`}
          >
            {isLastDay ? "Összesítés" : `${selectedDays[currentStep + 1]?.nap}i termékek`}
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
