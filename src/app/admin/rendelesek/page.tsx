"use client";

import { useState, useEffect } from "react";

type Tetel = {
  id: string;
  datum: string;
  nap: string;
  termek_nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
};

type Rendeles = {
  id: string;
  rendeles_szam: string;
  nev: string;
  email: string;
  telefon: string;
  megjegyzes: string | null;
  vegosszeg: number;
  allapot: string;
  created_at: string;
  rendeles_tetelek: Tetel[];
};

const ALLAPOT_LABELS: Record<string, { label: string; color: string }> = {
  uj: { label: "Uj", color: "bg-blue-100 text-blue-800" },
  folyamatban: { label: "Folyamatban", color: "bg-yellow-100 text-yellow-800" },
  kesz: { label: "Kesz", color: "bg-green-100 text-green-800" },
  torolve: { label: "Torolve", color: "bg-red-100 text-red-800" },
};

const ALLAPOT_FLOW = ["uj", "folyamatban", "kesz"];

export default function RendelesekPage() {
  const [rendelesek, setRendelesek] = useState<Rendeles[]>([]);
  const [filter, setFilter] = useState("mind");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchRendelesek = (allapot: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (allapot !== "mind") params.set("allapot", allapot);

    fetch(`/api/admin/rendelesek?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setRendelesek(data.rendelesek ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRendelesek(filter);
  }, [filter]);

  const updateAllapot = async (id: string, allapot: string) => {
    await fetch(`/api/admin/rendelesek/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allapot }),
    });
    fetchRendelesek(filter);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("hu-HU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-brown-dark">Rendelesek</h1>
        <p className="font-sans text-sm text-brown/50 mt-1">
          Beerkezett rendelesek kezelese
        </p>
      </div>

      {/* Szuro */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["mind", "uj", "folyamatban", "kesz", "torolve"].map((a) => (
          <button
            key={a}
            onClick={() => setFilter(a)}
            className={`
              px-4 py-2 rounded-lg font-sans text-sm whitespace-nowrap transition-colors cursor-pointer
              ${filter === a
                ? "bg-gold text-brown-dark font-semibold"
                : "bg-cream-dark text-brown/60 hover:bg-gold/20"
              }
            `}
          >
            {a === "mind" ? "Mind" : ALLAPOT_LABELS[a]?.label ?? a}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rendelesek.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-sans text-brown/40 text-sm">Nincs rendeles</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rendelesek.map((r) => {
            const isExpanded = expandedId === r.id;
            const allapotInfo = ALLAPOT_LABELS[r.allapot] ?? { label: r.allapot, color: "bg-gray-100 text-gray-800" };
            const nextAllapot = ALLAPOT_FLOW[ALLAPOT_FLOW.indexOf(r.allapot) + 1];

            return (
              <div key={r.id} className="bg-white rounded-xl border border-cream-dark overflow-hidden">
                {/* Kartya fejlec */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-cream-dark/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-sans text-sm font-bold text-brown-dark truncate">
                        {r.nev}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold ${allapotInfo.color}`}>
                        {allapotInfo.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 font-sans text-xs text-brown/50">
                      <span>{r.rendeles_szam}</span>
                      <span>{formatDate(r.created_at)}</span>
                      <span className="font-semibold text-brown-dark">
                        {r.vegosszeg.toLocaleString("hu-HU")} Ft
                      </span>
                    </div>
                  </div>
                  <svg
                    className={`w-4 h-4 text-brown/30 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Reszletek */}
                {isExpanded && (
                  <div className="border-t border-cream-dark px-4 py-4 space-y-4">
                    {/* Kontakt */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Email</p>
                        <a href={`mailto:${r.email}`} className="font-sans text-sm text-brown-dark hover:text-gold">
                          {r.email}
                        </a>
                      </div>
                      <div>
                        <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Telefon</p>
                        <a href={`tel:${r.telefon}`} className="font-sans text-sm text-brown-dark hover:text-gold">
                          {r.telefon}
                        </a>
                      </div>
                    </div>

                    {r.megjegyzes && (
                      <div>
                        <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Megjegyzes</p>
                        <p className="font-sans text-sm text-brown/70">{r.megjegyzes}</p>
                      </div>
                    )}

                    {/* Tetelek */}
                    <div>
                      <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider mb-2">Tetelek</p>
                      <div className="space-y-1">
                        {r.rendeles_tetelek.map((t) => (
                          <div key={t.id} className="flex items-center justify-between font-sans text-sm">
                            <span className="text-brown-dark">
                              {t.mennyiseg}x {t.termek_nev}
                              <span className="text-brown/40 ml-1">({t.nap})</span>
                            </span>
                            <span className="text-brown/60">
                              {t.reszosszeg.toLocaleString("hu-HU")} Ft
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Allapot valtas */}
                    {nextAllapot && r.allapot !== "torolve" && (
                      <div className="flex items-center gap-2 pt-2">
                        <button
                          onClick={() => updateAllapot(r.id, nextAllapot)}
                          className="px-4 py-2 rounded-lg font-sans text-sm font-semibold
                            bg-gold text-brown-dark hover:bg-gold-light transition-colors cursor-pointer"
                        >
                          {nextAllapot === "folyamatban" ? "Elfogadas" : "Kesz"}
                        </button>
                        {r.allapot === "uj" && (
                          <button
                            onClick={() => updateAllapot(r.id, "torolve")}
                            className="px-4 py-2 rounded-lg font-sans text-sm
                              text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            Torles
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
