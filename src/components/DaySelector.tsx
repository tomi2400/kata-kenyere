"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";

type Day = {
  nap: string;
  datum: string;
  hatarido: string;
};

function getMonthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("hu-HU", { year: "numeric", month: "long" });
}

function getDayNumber(datum: string): number {
  return Number(datum.split("-")[2]);
}

export default function DaySelector({ days, redirectTo = "/valasztas" }: { days: Day[]; redirectTo?: string }) {
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
    router.push(redirectTo);
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

  // Hónapok szerinti csoportosítás
  const grouped: Record<string, Day[]> = {};
  for (const day of days) {
    const key = day.datum.slice(0, 7);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(day);
  }
  const months = Object.keys(grouped).sort();

  return (
    <div className="w-full max-w-xl mx-auto">
      <p className="text-brown/60 text-center mb-8 font-sans text-sm">
        Akár több napra is rendelhetsz egyszerre
      </p>

      <div className="space-y-8 mb-10">
        {months.map((monthKey) => (
          <div key={monthKey}>
            {/* Hónap fejléc */}
            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-gold/20" />
              <span className="font-sans text-xs font-semibold text-brown/40 uppercase tracking-widest">
                {getMonthLabel(monthKey)}
              </span>
              <div className="h-px flex-1 bg-gold/20" />
            </div>

            {/* Napok */}
            <div className="space-y-2">
              {grouped[monthKey].map((day) => {
                const isSelected = selected.includes(day.datum);
                return (
                  <button
                    key={day.datum}
                    onClick={() => toggle(day.datum)}
                    className={`
                      w-full text-left rounded-2xl border transition-all duration-200 cursor-pointer
                      flex items-center justify-between gap-4
                      ${isSelected
                        ? "border-gold bg-brown-dark px-5 py-4 shadow-md"
                        : "border-gold/20 bg-white hover:border-gold/50 hover:bg-cream-dark/40 px-5 py-4"
                      }
                    `}
                  >
                    {/* Bal: dátum kör + infók */}
                    <div className="flex items-center gap-4">
                      {/* Nap száma */}
                      <div className={`
                        w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0
                        ${isSelected ? "bg-gold/20" : "bg-cream-dark"}
                      `}>
                        <span className={`font-serif text-xl leading-none font-bold ${isSelected ? "text-gold" : "text-brown-dark"}`}>
                          {getDayNumber(day.datum)}
                        </span>
                      </div>

                      {/* Nap neve + határidő */}
                      <div>
                        <p className={`font-serif text-lg font-semibold leading-tight ${isSelected ? "text-cream" : "text-brown-dark"}`}>
                          {day.nap}
                        </p>
                        <p className={`font-sans text-xs mt-0.5 flex items-center gap-1 ${isSelected ? "text-gold/80" : "text-brown/40"}`}>
                          <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" />
                            <path strokeLinecap="round" d="M12 6v6l4 2" />
                          </svg>
                          Határidő: {day.hatarido}
                        </p>
                      </div>
                    </div>

                    {/* Jobb: checkbox */}
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
                      ${isSelected ? "border-gold bg-gold" : "border-gold/30"}
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
          </div>
        ))}
      </div>

      {/* Tovább gomb – sticky mobilon */}
      <div className="sticky bottom-4">
        <button
          onClick={handleContinue}
          disabled={selected.length === 0}
          className={`
            w-full py-4 px-8 rounded-2xl font-sans font-semibold text-base transition-all duration-200
            flex items-center justify-center gap-2 shadow-lg
            ${selected.length > 0
              ? "bg-brown-dark text-cream hover:bg-brown cursor-pointer"
              : "bg-brown-dark/20 text-brown/30 cursor-not-allowed shadow-none"
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
    </div>
  );
}
