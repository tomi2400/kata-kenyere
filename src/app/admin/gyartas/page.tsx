"use client";

import { useState, useEffect } from "react";

type GyartasItem = {
  termek_nev: string;
  egyseg: string;
  ossz_mennyiseg: number;
};

type NapInfo = {
  datum: string;
  nap: string;
};

export default function GyartasPage() {
  const [items, setItems] = useState<GyartasItem[]>([]);
  const [napok, setNapok] = useState<NapInfo[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Elerheto napok betoltese
  useEffect(() => {
    fetch("/api/admin/gyartas/napok")
      .then((res) => res.json())
      .then((data) => {
        setNapok(data.napok ?? []);
        if (data.napok?.length > 0) {
          setSelectedDate(data.napok[0].datum);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Gyartasi lista betoltese a kivalasztott napra
  useEffect(() => {
    if (!selectedDate) return;
    setLoading(true);
    fetch(`/api/admin/gyartas/${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data.items ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brown-dark">Gyartasi lista</h1>
          <p className="font-sans text-sm text-brown/50 mt-1">
            Mit kell sutni ma?
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg font-sans text-sm
            bg-brown-dark text-cream hover:bg-brown transition-colors cursor-pointer print:hidden"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
          </svg>
          Nyomtatas
        </button>
      </div>

      {/* Nap valaszto */}
      {napok.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {napok.map((nap) => (
            <button
              key={nap.datum}
              onClick={() => setSelectedDate(nap.datum)}
              className={`
                px-4 py-2 rounded-lg font-sans text-sm whitespace-nowrap transition-colors cursor-pointer
                ${selectedDate === nap.datum
                  ? "bg-gold text-brown-dark font-semibold"
                  : "bg-cream-dark text-brown/60 hover:bg-gold/20"
                }
              `}
            >
              {nap.nap} ({nap.datum})
            </button>
          ))}
        </div>
      )}

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-sans text-brown/40 text-sm">
            {napok.length === 0
              ? "Meg nincsenek rendelesi napok beallitva"
              : "Erre a napra meg nincs rendeles"
            }
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-cream-dark overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-cream-dark bg-cream-dark/50">
                <th className="text-left font-sans text-xs font-semibold text-brown/60 px-4 py-3">
                  Termek
                </th>
                <th className="text-left font-sans text-xs font-semibold text-brown/60 px-4 py-3">
                  Egyseg
                </th>
                <th className="text-right font-sans text-xs font-semibold text-brown/60 px-4 py-3">
                  Mennyiseg
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr
                  key={item.termek_nev}
                  className={i < items.length - 1 ? "border-b border-cream-dark" : ""}
                >
                  <td className="font-sans text-sm text-brown-dark px-4 py-3">
                    {item.termek_nev}
                  </td>
                  <td className="font-sans text-sm text-brown/50 px-4 py-3">
                    {item.egyseg}
                  </td>
                  <td className="font-sans text-sm font-bold text-brown-dark px-4 py-3 text-right">
                    {item.ossz_mennyiseg}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
