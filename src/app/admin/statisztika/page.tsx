"use client";

import { useState, useEffect } from "react";

type Stats = {
  osszRendeles: number;
  osszBevetel: number;
  atlagErtek: number;
  topTermekek: { nev: string; mennyiseg: number }[];
  napiTrend: { datum: string; rendeles: number; bevetel: number }[];
};

export default function StatisztikaPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/statisztika?days=${days}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [days]);

  const formatFt = (n: number) => n.toLocaleString("hu-HU") + " Ft";

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxMennyiseg = Math.max(...stats.topTermekek.map((t) => t.mennyiseg), 1);
  const maxBevetel = Math.max(...stats.napiTrend.map((t) => t.bevetel), 1);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brown-dark">Statisztika</h1>
          <p className="font-sans text-sm text-brown/50 mt-1">Attekinetes</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`
                px-3 py-1.5 rounded-lg font-sans text-xs transition-colors cursor-pointer
                ${days === d
                  ? "bg-gold text-brown-dark font-semibold"
                  : "bg-cream-dark text-brown/60 hover:bg-gold/20"
                }
              `}
            >
              {d} nap
            </button>
          ))}
        </div>
      </div>

      {/* Kartyak */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-white rounded-xl border border-cream-dark p-4">
          <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Rendelesek</p>
          <p className="font-sans text-2xl font-bold text-brown-dark mt-1">{stats.osszRendeles}</p>
        </div>
        <div className="bg-white rounded-xl border border-cream-dark p-4">
          <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Bevetel</p>
          <p className="font-sans text-2xl font-bold text-brown-dark mt-1">{formatFt(stats.osszBevetel)}</p>
        </div>
        <div className="bg-white rounded-xl border border-cream-dark p-4">
          <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Atlag ertek</p>
          <p className="font-sans text-2xl font-bold text-brown-dark mt-1">{formatFt(stats.atlagErtek)}</p>
        </div>
      </div>

      {/* Napi trend */}
      {stats.napiTrend.length > 0 && (
        <div className="mb-8">
          <h2 className="font-serif text-base text-brown/60 mb-3 pb-2 border-b border-gold/20">
            Napi bevetel
          </h2>
          <div className="bg-white rounded-xl border border-cream-dark p-4">
            <div className="flex items-end gap-1 h-32">
              {stats.napiTrend.map((t) => (
                <div key={t.datum} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gold/60 rounded-t-sm min-h-[2px]"
                    style={{ height: `${(t.bevetel / maxBevetel) * 100}%` }}
                    title={`${t.datum}: ${formatFt(t.bevetel)}`}
                  />
                  <span className="font-sans text-[8px] text-brown/40 -rotate-45 origin-center">
                    {t.datum.slice(5)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top termekek */}
      {stats.topTermekek.length > 0 && (
        <div>
          <h2 className="font-serif text-base text-brown/60 mb-3 pb-2 border-b border-gold/20">
            Top 10 termek
          </h2>
          <div className="space-y-2">
            {stats.topTermekek.map((t) => (
              <div key={t.nev} className="flex items-center gap-3">
                <span className="font-sans text-sm text-brown-dark w-40 truncate flex-shrink-0">
                  {t.nev}
                </span>
                <div className="flex-1 bg-cream-dark rounded-full h-5 overflow-hidden">
                  <div
                    className="h-full bg-gold/60 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(t.mennyiseg / maxMennyiseg) * 100}%` }}
                  >
                    <span className="font-sans text-[10px] font-bold text-brown-dark">
                      {t.mennyiseg}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
