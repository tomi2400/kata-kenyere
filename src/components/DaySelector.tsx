"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";
import type { OrderDay } from "@/lib/deadline";

const NAP_HU: Record<string, string> = {
  Kedd: "Kedd",
  Szerda: "Szerda",
  Csütörtök: "Csütörtök",
  Péntek: "Péntek",
};

function formatDatum(datum: string): string {
  const d = new Date(datum);
  return d.toLocaleDateString("hu-HU", { month: "long", day: "numeric" });
}

export default function DaySelector({ days }: { days: OrderDay[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const { setSelectedDays } = useCartStore();
  const router = useRouter();

  const toggle = (datum: string) => {
    setSelected((prev) =>
      prev.includes(datum) ? prev.filter((d) => d !== datum) : [...prev, datum]
    );
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    const chosenDays = days
      .filter((d) => selected.includes(d.datum))
      .map((d) => ({ nap: d.nap, datum: d.datum }));
    setSelectedDays(chosenDays);
    router.push("/termekek");
  };

  if (days.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <p className="font-serif text-xl text-brown mb-2">
          Éppen nincs nyitott rendelési időszak.
        </p>
        <p className="text-brown/70 text-sm">
          Kövesd Instagram oldalunkat a legfrissebb infókért!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <p className="text-brown/70 text-center mb-6 font-sans">
        Akár több napra is rendelhetsz egyszerre
      </p>

      <div className="grid gap-3 mb-8">
        {days.map((day) => {
          const isSelected = selected.includes(day.datum);
          return (
            <button
              key={day.datum}
              onClick={() => toggle(day.datum)}
              className={`
                w-full text-left px-6 py-5 rounded-lg border-2 transition-all duration-200
                flex items-center justify-between group
                ${
                  isSelected
                    ? "border-gold bg-brown-dark text-cream"
                    : "border-gold/30 bg-cream hover:border-gold hover:bg-cream-dark"
                }
              `}
            >
              <div>
                <div className={`font-serif text-xl font-semibold ${isSelected ? "text-cream" : "text-brown-dark"}`}>
                  {NAP_HU[day.nap]}
                  <span className={`font-sans text-sm font-normal ml-3 ${isSelected ? "text-gold" : "text-brown/60"}`}>
                    {formatDatum(day.datum)}
                  </span>
                </div>
                <div className={`text-sm mt-1 font-sans ${isSelected ? "text-gold" : "text-brown/50"}`}>
                  ⏰ Rendelési határidő: {day.hatarido}
                </div>
              </div>
              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${isSelected ? "border-gold bg-gold" : "border-gold/40"}
              `}>
                {isSelected && (
                  <svg className="w-3 h-3 text-brown-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        disabled={selected.length === 0}
        className={`
          w-full py-4 px-8 rounded-lg font-sans font-semibold text-base transition-all duration-200
          flex items-center justify-center gap-2
          ${
            selected.length > 0
              ? "bg-brown-dark text-cream hover:bg-brown cursor-pointer"
              : "bg-brown-dark/30 text-cream/40 cursor-not-allowed"
          }
        `}
      >
        {selected.length > 0
          ? `Termékeket választok${selected.length > 1 ? ` (${selected.length} nap)` : ""}`
          : "Válassz legalább egy napot"}
        {selected.length > 0 && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        )}
      </button>
    </div>
  );
}
