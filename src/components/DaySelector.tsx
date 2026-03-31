"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/store";

type Day = {
  nap: string;
  datum: string;
  hatarido: string;
};

const HU_MONTHS = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December",
];
const HU_DAYS = ["H", "K", "Sz", "Cs", "P", "Sz", "V"];

function buildCalendarCells(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // H=0..V=6
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(
      `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    );
  }
  return cells;
}

export default function DaySelector({
  days,
  redirectTo = "/valasztas",
}: {
  days: Day[];
  redirectTo?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const { setSelectedDays } = useCartStore();
  const router = useRouter();

  // Elérhető napok map-je
  const availableMap = useMemo(
    () => new Map(days.map((d) => [d.datum, d])),
    [days]
  );

  // Elérhető hónapok
  const availableMonths = useMemo(() => {
    const months = Array.from(new Set(days.map((d) => d.datum.slice(0, 7)))).sort();
    return months.map((m) => {
      const [y, mo] = m.split("-");
      return { year: Number(y), month: Number(mo) - 1, key: m };
    });
  }, [days]);

  const [monthIndex, setMonthIndex] = useState(0);

  const currentMonth = availableMonths[monthIndex] ?? {
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    key: "",
  };

  const cells = buildCalendarCells(currentMonth.year, currentMonth.month);
  const today = new Date().toISOString().split("T")[0];

  const toggle = (datum: string) => {
    if (!availableMap.has(datum)) return;
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

  // Kiválasztott napok rendezve
  const selectedDays = days.filter((d) => selected.includes(d.datum));

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
    <div className="w-full max-w-xl mx-auto">
      <p className="text-brown/60 text-center mb-6 font-sans text-sm">
        Akár több napra is rendelhetsz egyszerre
      </p>

      <div className="paper-panel rounded-[2rem] border border-gold/20 overflow-hidden warm-ring">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gold/10">
          <button
            onClick={() => setMonthIndex((i) => Math.max(0, i - 1))}
            disabled={monthIndex === 0}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-dark transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-default"
          >
            <svg className="w-4 h-4 text-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="font-serif text-base text-brown-dark">
            {currentMonth.year}. {HU_MONTHS[currentMonth.month]}
          </span>

          <button
            onClick={() => setMonthIndex((i) => Math.min(availableMonths.length - 1, i + 1))}
            disabled={monthIndex === availableMonths.length - 1}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-dark transition-colors disabled:opacity-20 cursor-pointer disabled:cursor-default"
          >
            <svg className="w-4 h-4 text-brown" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 px-3 pt-4">
          {HU_DAYS.map((d, i) => (
            <div key={i} className="text-center font-sans text-[11px] font-semibold text-brown/30 pb-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-y-1.5 px-3 pb-4">
          {cells.map((datum, idx) => {
            if (!datum) return <div key={`e-${idx}`} />;

            const available = availableMap.has(datum);
            const isSelected = selected.includes(datum);
            const isPast = datum < today;
            const isToday = datum === today;
            const dayNum = Number(datum.split("-")[2]);

            if (isSelected) {
              return (
                <button
                  key={datum}
                  onClick={() => toggle(datum)}
                  className="aspect-square flex flex-col items-center justify-center rounded-2xl bg-gold cursor-pointer transition-all hover:bg-gold/80 shadow-sm"
                >
                  <span className="font-sans text-sm font-bold text-brown-dark">{dayNum}</span>
                </button>
              );
            }

            if (available) {
              return (
                <button
                  key={datum}
                  onClick={() => toggle(datum)}
                  className="aspect-square flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all border border-gold/30 hover:border-gold hover:bg-white group bg-white/55"
                >
                  <span className={`font-sans text-sm font-semibold ${isToday ? "text-gold" : "text-brown-dark"}`}>
                    {dayNum}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/60 group-hover:bg-gold mt-0.5" />
                </button>
              );
            }

            return (
              <div
                key={datum}
                className="aspect-square flex items-center justify-center"
              >
                <span className={`font-sans text-sm ${isPast ? "text-brown/15" : "text-brown/25"} ${isToday ? "font-bold text-brown/40" : ""}`}>
                  {dayNum}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-3">
        <span className="flex items-center gap-1.5 font-sans text-xs text-brown/40">
          <span className="w-3 h-3 rounded border-2 border-gold/40 inline-block" />
          Rendelhető nap
        </span>
        <span className="flex items-center gap-1.5 font-sans text-xs text-brown/40">
          <span className="w-3 h-3 rounded bg-gold inline-block" />
          Kiválasztva
        </span>
      </div>

      {/* Kiválasztott napok összesítője */}
      {selectedDays.length > 0 && (
        <div className="mt-5 paper-panel rounded-2xl p-4 space-y-3 border border-gold/15">
          <p className="font-sans text-xs font-semibold text-brown/40 uppercase tracking-wider">
            Kiválasztott napok
          </p>
          {selectedDays.map((d) => (
            <div key={d.datum} className="flex items-center justify-between">
              <div className="min-w-0">
                <span className="font-sans text-sm font-semibold text-brown-dark">{d.nap}</span>
                <span className="font-sans text-xs text-brown/50 ml-2 block sm:inline sm:ml-2">
                  {new Date(d.datum + "T00:00:00").toLocaleDateString("hu-HU", { month: "long", day: "numeric" })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline font-sans text-xs text-brown/40">
                  {d.hatarido}
                </span>
                <button
                  onClick={() => toggle(d.datum)}
                  className="text-brown/30 hover:text-red-400 transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tovább gomb */}
      <button
        onClick={handleContinue}
        disabled={selected.length === 0}
        className={`
          w-full mt-5 py-4 px-8 rounded-[1.4rem] font-sans font-semibold text-base transition-all duration-200
          flex items-center justify-center gap-2
          ${selected.length > 0
            ? "bg-brown-dark text-cream hover:bg-brown cursor-pointer shadow-[0_18px_32px_rgba(61,35,20,0.18)]"
            : "bg-brown-dark/20 text-brown/30 cursor-not-allowed"
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
