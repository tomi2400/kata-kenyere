"use client";

import { useState, useEffect, useCallback } from "react";

type GyartasItem = {
  termek_nev: string;
  egyseg: string;
  ossz_mennyiseg: number;
};

const DONE_KEY = (datum: string, nev: string) => `gyartas_kesz_${datum}_${nev}`;

export default function GyartasPage() {
  const [items, setItems] = useState<GyartasItem[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [doneSet, setDoneSet] = useState<Set<string>>(new Set());
  const [csakNemKesz, setCsakNemKesz] = useState(false);

  // Gyártási lista betöltése a kiválasztott napra
  const loadItems = useCallback((datum: string) => {
    setLoading(true);
    fetch(`/api/admin/gyartas/${datum}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadItems(selectedDate);
  }, [selectedDate, loadItems]);

  // localStorage-ból betöltjük a kész állapotokat
  useEffect(() => {
    if (items.length === 0) return;
    const saved = new Set<string>();
    for (const item of items) {
      const key = DONE_KEY(selectedDate, item.termek_nev);
      if (localStorage.getItem(key) === "1") {
        saved.add(item.termek_nev);
      }
    }
    setDoneSet(saved);
  }, [items, selectedDate]);

  const toggleDone = (termek_nev: string) => {
    const key = DONE_KEY(selectedDate, termek_nev);
    setDoneSet((prev) => {
      const next = new Set(prev);
      if (next.has(termek_nev)) {
        next.delete(termek_nev);
        localStorage.removeItem(key);
      } else {
        next.add(termek_nev);
        localStorage.setItem(key, "1");
      }
      return next;
    });
  };

  const formatDate = (datum: string) => {
    const d = new Date(datum + "T00:00:00");
    return d.toLocaleDateString("hu-HU", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const visibleItems = csakNemKesz
    ? items.filter((i) => !doneSet.has(i.termek_nev))
    : items;

  const mindenKesz = items.length > 0 && items.every((i) => doneSet.has(i.termek_nev));

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brown-dark">Gyártási lista</h1>
          <p className="font-sans text-sm text-brown/50 mt-1">
            Mit kell sütni ma?
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm
            bg-brown-dark text-cream hover:bg-brown transition-colors cursor-pointer print:hidden"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Nyomtatás
        </button>
      </div>

      {/* Dátumválasztó + szűrő */}
      <div className="flex flex-wrap items-center gap-3 mb-6 print:hidden">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none cursor-pointer"
        />
        <span className="font-sans text-sm text-brown/50">
          {formatDate(selectedDate)}
        </span>
        {items.length > 0 && (
          <button
            onClick={() => setCsakNemKesz(!csakNemKesz)}
            className={`ml-auto px-3 py-1.5 rounded-lg font-sans text-xs transition-colors cursor-pointer
              ${csakNemKesz
                ? "bg-gold text-brown-dark font-semibold"
                : "bg-cream-dark text-brown/60 hover:bg-gold/20"
              }`}
          >
            Csak a nem kész tételek
          </button>
        )}
      </div>

      {/* Minden kész banner */}
      {mindenKesz && (
        <div className="mb-6 px-4 py-3 bg-green-50 border border-green-200 rounded-xl font-sans text-sm text-green-700 font-semibold text-center print:hidden">
          ✓ Nap lezárva – minden tétel kész!
        </div>
      )}

      {/* Táblázat */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-sans text-brown/40 text-sm">
            Erre a napra még nincs rendelés
          </p>
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-sans text-brown/40 text-sm">
            Minden tétel el van készítve ✓
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-cream-dark overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-dark bg-cream-dark/50">
                <th className="text-left font-sans text-xs font-semibold text-brown/60 px-4 py-3 w-8 print:hidden">
                </th>
                <th className="text-left font-sans text-xs font-semibold text-brown/60 px-4 py-3">
                  Termék
                </th>
                <th className="text-left font-sans text-xs font-semibold text-brown/60 px-4 py-3">
                  Egység
                </th>
                <th className="text-right font-sans text-xs font-semibold text-brown/60 px-4 py-3">
                  Mennyiség
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item, i) => {
                const kesz = doneSet.has(item.termek_nev);
                return (
                  <tr
                    key={item.termek_nev}
                    className={`${i < visibleItems.length - 1 ? "border-b border-cream-dark" : ""} ${kesz ? "bg-green-50" : ""}`}
                  >
                    <td className="px-4 py-3 print:hidden">
                      <button
                        onClick={() => toggleDone(item.termek_nev)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer
                          ${kesz ? "bg-green-500 border-green-500" : "border-cream-dark hover:border-gold"}`}
                      >
                        {kesz && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </td>
                    <td className={`font-sans text-sm px-4 py-3 ${kesz ? "text-brown/40 line-through" : "text-brown-dark font-medium"}`}>
                      {item.termek_nev}
                    </td>
                    <td className={`font-sans text-sm px-4 py-3 ${kesz ? "text-brown/30" : "text-brown/50"}`}>
                      {item.egyseg}
                    </td>
                    <td className={`font-sans text-lg font-bold px-4 py-3 text-right ${kesz ? "text-brown/30 line-through" : "text-brown-dark"}`}>
                      {item.ossz_mennyiseg}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
