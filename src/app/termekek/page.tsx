"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { getTermekekByKategoria, formatAr } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import DayProgress from "@/components/DayProgress";

export default function TermekekPage() {
  const router = useRouter();
  const { selectedDays, carts, getDayTotal } = useCartStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ha nincs kiválasztott nap, vissza a főoldalra
  useEffect(() => {
    if (mounted && selectedDays.length === 0) {
      router.replace("/");
    }
  }, [mounted, selectedDays, router]);

  if (!mounted || selectedDays.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const termekekByKategoria = getTermekekByKategoria();
  const currentDay = selectedDays[currentStep];
  const isLastDay = currentStep === selectedDays.length - 1;
  const dayTotal = getDayTotal(currentDay.datum);
  const totalItems = (carts[currentDay.datum] ?? []).reduce((s, i) => s + i.mennyiseg, 0);

  const handleNext = () => {
    if (isLastDay) {
      router.push("/osszesites");
    } else {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-32">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-gold/20 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/images/logo.png" alt="Kata Kenyere" width={32} height={32} />
            </Link>
            <Link href="/" className="font-sans text-xs text-brown/50 hover:text-brown transition-colors">
              ← Vissza
            </Link>
          </div>
          <DayProgress steps={selectedDays} currentIndex={currentStep} />
        </div>
      </header>

      {/* TARTALOM */}
      <main className="max-w-2xl mx-auto px-4 pt-6">

        {/* Nap fejléc */}
        <div className="mb-6">
          <div className="w-8 h-px bg-gold mb-3" />
          <h1 className="font-serif text-2xl text-brown-dark">
            {currentDay.nap}i kínálat
          </h1>
          <p className="font-sans text-sm text-brown/50 mt-1">
            Válaszd ki amit szeretnél rendelni
          </p>
        </div>

        {/* Kategóriák */}
        {Object.entries(termekekByKategoria).map(([kategoria, termekek]) => (
          <section key={kategoria} className="mb-8">
            <h2 className="font-serif text-base text-brown/60 mb-3 pb-2 border-b border-gold/20">
              {kategoria}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      {/* FLOATING BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-brown-dark border-t border-cream/10 px-4 py-4 safe-area-pb">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            {totalItems > 0 ? (
              <>
                <p className="font-sans text-xs text-cream/50">{totalItems} tétel</p>
                <p className="font-sans font-bold text-cream text-lg">
                  {formatAr(dayTotal)}
                </p>
              </>
            ) : (
              <p className="font-sans text-sm text-cream/40">Még nem választottál</p>
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
