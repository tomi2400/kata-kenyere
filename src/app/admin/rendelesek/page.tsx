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
  allapot: string;
};

type NapiAllapot = {
  datum: string;
  nap: string;
  allapot: string;
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
  display_allapot: string;
  created_at: string;
  rendeles_tetelek: Tetel[];
  napi_allapotok: NapiAllapot[];
};

const ALLAPOT_LABELS: Record<string, { label: string; color: string }> = {
  uj: { label: "Új", color: "bg-blue-100 text-blue-800" },
  feldolgozva: { label: "Feldolgozva", color: "bg-yellow-100 text-yellow-800" },
  kesz: { label: "Kész", color: "bg-green-100 text-green-800" },
  atvetel: { label: "Átvéve", color: "bg-purple-100 text-purple-800" },
  torolve: { label: "Törölve", color: "bg-red-100 text-red-800" },
  reszben: { label: "Részben kész", color: "bg-amber-100 text-amber-800" },
};

const NAPI_ALLAPOT_SORREND = ["uj", "feldolgozva", "kesz", "atvetel", "torolve"];

export default function RendelesekPage() {
  const [rendelesek, setRendelesek] = useState<Rendeles[]>([]);
  const [filter, setFilter] = useState("mind");
  const [datumFilter, setDatumFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [updatingKey, setUpdatingKey] = useState<string | null>(null);

  const fetchRendelesek = (allapot: string, datum: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (allapot !== "mind") params.set("allapot", allapot);
    if (datum) params.set("datum", datum);

    fetch(`/api/admin/rendelesek?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setRendelesek(data.rendelesek ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRendelesek(filter, datumFilter);
  }, [filter, datumFilter]);

  const updateNapiAllapot = async (id: string, datum: string, allapot: string) => {
    const key = `${id}_${datum}_${allapot}`;
    setUpdatingKey(key);
    await fetch(`/api/admin/rendelesek/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datum, allapot }),
    });
    setUpdatingKey(null);
    fetchRendelesek(filter, datumFilter);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("hu-HU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTetelDatum = (datum: string) => {
    const d = new Date(datum + "T00:00:00");
    return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
  };

  const groupedTetelekByDatum = (tetelek: Tetel[]) => {
    const groups = new Map<string, { nap: string; tetelek: Tetel[] }>();

    for (const tetel of tetelek) {
      const current = groups.get(tetel.datum);
      if (current) {
        current.tetelek.push(tetel);
      } else {
        groups.set(tetel.datum, { nap: tetel.nap, tetelek: [tetel] });
      }
    }

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([datum, value]) => ({
        datum,
        nap: value.nap,
        tetelek: value.tetelek,
      }));
  };

  const selected = rendelesek.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-brown-dark">Rendelések</h1>
        <p className="font-sans text-sm text-brown/50 mt-1">
          Beérkezett rendelések kezelése
        </p>
      </div>

      {/* Szűrők */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["mind", "uj", "feldolgozva", "kesz", "reszben", "atvetel", "torolve"].map((a) => (
            <button
              key={a}
              onClick={() => setFilter(a)}
              className={`
                px-3 py-1.5 rounded-lg font-sans text-sm whitespace-nowrap transition-colors cursor-pointer
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
        <input
          type="date"
          value={datumFilter}
          onChange={(e) => setDatumFilter(e.target.value)}
          className="ml-auto px-3 py-1.5 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none cursor-pointer"
          title="Szűrés átvételi dátum szerint"
        />
        {datumFilter && (
          <button
            onClick={() => setDatumFilter("")}
            className="text-brown/40 hover:text-brown-dark font-sans text-xs cursor-pointer"
          >
            ✕ Dátum törlése
          </button>
        )}
      </div>

      {/* Táblázat + részletek */}
      <div className="flex gap-6">
        {/* Bal: táblázat */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : rendelesek.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-sans text-brown/40 text-sm">Nincs rendelés</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-cream-dark overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cream-dark bg-cream-dark/50">
                    <th className="text-left font-sans text-xs font-semibold text-brown/60 px-4 py-3">Név</th>
                    <th className="text-left font-sans text-xs font-semibold text-brown/60 px-4 py-3 hidden md:table-cell">Termékek</th>
                    <th className="text-left font-sans text-xs font-semibold text-brown/60 px-4 py-3 hidden lg:table-cell">Dátum</th>
                    <th className="text-left font-sans text-xs font-semibold text-brown/60 px-4 py-3">Állapot</th>
                  </tr>
                </thead>
                <tbody>
                  {rendelesek.map((r, i) => {
                    const allapotInfo = ALLAPOT_LABELS[r.display_allapot] ?? { label: r.display_allapot, color: "bg-gray-100 text-gray-800" };
                    const isSelected = selectedId === r.id;
                    // Termékek összefoglalója
                    const tetelSummary = r.rendeles_tetelek
                      .slice(0, 2)
                      .map((t) => `${t.mennyiseg}× ${t.termek_nev}`)
                      .join(", ") + (r.rendeles_tetelek.length > 2 ? ` +${r.rendeles_tetelek.length - 2}` : "");
                    // Egyedi átvételi dátumok
                    const datumok = Array.from(new Set(r.rendeles_tetelek.map((t) => t.datum))).sort();

                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedId(isSelected ? null : r.id)}
                        className={`
                          cursor-pointer transition-colors
                          ${i < rendelesek.length - 1 ? "border-b border-cream-dark" : ""}
                          ${isSelected ? "bg-gold/10" : "hover:bg-cream-dark/30"}
                        `}
                      >
                        <td className="px-4 py-3">
                          <p className="font-sans text-sm font-semibold text-brown-dark">{r.nev}</p>
                          <p className="font-sans text-xs text-brown/40">{r.rendeles_szam}</p>
                          {r.megjegyzes && (
                            <p className="font-sans text-xs text-amber-600 mt-0.5 truncate max-w-[140px]" title={r.megjegyzes}>
                              📝 {r.megjegyzes}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="font-sans text-xs text-brown/70 truncate max-w-[200px]">{tetelSummary}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="font-sans text-xs text-brown/60">
                            {datumok.map(formatTetelDatum).join(", ")}
                          </p>
                          <p className="font-sans text-[10px] text-brown/40">{formatDate(r.created_at)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full font-sans text-[10px] font-semibold whitespace-nowrap ${allapotInfo.color}`}>
                            {allapotInfo.label}
                          </span>
                          {r.napi_allapotok.length > 1 && (
                            <p className="font-sans text-[10px] text-brown/40 mt-1">
                              {r.napi_allapotok.filter((item) => item.allapot === "atvetel").length}/{r.napi_allapotok.length} nap lezárva
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Jobb: részletek panel */}
        {selected && (
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-xl border border-cream-dark p-5 sticky top-4 space-y-4">
              {/* Fejléc */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-serif text-lg text-brown-dark">{selected.nev}</h2>
                  <p className="font-sans text-xs text-brown/40">{selected.rendeles_szam}</p>
                </div>
                <button
                  onClick={() => setSelectedId(null)}
                  className="text-brown/30 hover:text-brown-dark cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              {/* Állapot */}
              <div>
                <span className={`px-2 py-1 rounded-full font-sans text-xs font-semibold ${
                  ALLAPOT_LABELS[selected.display_allapot]?.color ?? "bg-gray-100 text-gray-800"
                }`}>
                  {ALLAPOT_LABELS[selected.display_allapot]?.label ?? selected.display_allapot}
                </span>
              </div>

              {/* Kontakt */}
              <div className="space-y-2">
                <div>
                  <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Email</p>
                  <a href={`mailto:${selected.email}`} className="font-sans text-sm text-brown-dark hover:text-gold break-all">
                    {selected.email}
                  </a>
                </div>
                <div>
                  <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Telefon</p>
                  <a href={`tel:${selected.telefon}`} className="font-sans text-sm text-brown-dark hover:text-gold">
                    {selected.telefon}
                  </a>
                </div>
              </div>

              {selected.megjegyzes && (
                <div>
                  <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Megjegyzés</p>
                  <p className="font-sans text-sm text-brown/70 mt-0.5">{selected.megjegyzes}</p>
                </div>
              )}

              {/* Tételek */}
              <div>
                <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider mb-2">Napi bontás</p>
                <div className="space-y-3">
                  {groupedTetelekByDatum(selected.rendeles_tetelek).map((group) => {
                    const napiAllapot = selected.napi_allapotok.find((item) => item.datum === group.datum)?.allapot ?? "uj";
                    const napiAllapotInfo = ALLAPOT_LABELS[napiAllapot] ?? { label: napiAllapot, color: "bg-gray-100 text-gray-800" };

                    return (
                      <div key={group.datum} className="rounded-xl border border-cream-dark p-3 bg-cream/50">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <p className="font-sans text-sm font-semibold text-brown-dark">
                              {group.nap}, {formatTetelDatum(group.datum)}
                            </p>
                            <p className="font-sans text-xs text-brown/40">
                              {group.tetelek.length} tétel
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full font-sans text-[10px] font-semibold whitespace-nowrap ${napiAllapotInfo.color}`}>
                            {napiAllapotInfo.label}
                          </span>
                        </div>

                        <div className="space-y-1.5 mb-3">
                          {group.tetelek.map((t) => (
                            <div key={t.id} className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-sans text-sm text-brown-dark font-medium">
                                  {t.mennyiseg}× {t.termek_nev}
                                </span>
                              </div>
                              <span className="font-sans text-xs text-brown/60 whitespace-nowrap">
                                {t.reszosszeg.toLocaleString("hu-HU")} Ft
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {NAPI_ALLAPOT_SORREND.map((allapot) => {
                            const active = napiAllapot === allapot;
                            const buttonInfo = ALLAPOT_LABELS[allapot];
                            const actionKey = `${selected.id}_${group.datum}_${allapot}`;

                            return (
                              <button
                                key={allapot}
                                onClick={() => updateNapiAllapot(selected.id, group.datum, allapot)}
                                disabled={updatingKey !== null}
                                className={`px-2.5 py-1.5 rounded-lg font-sans text-xs transition-colors cursor-pointer border ${
                                  active
                                    ? `${buttonInfo.color} border-current`
                                    : "bg-white text-brown/60 border-cream-dark hover:border-gold hover:text-brown-dark"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {updatingKey === actionKey ? "Mentés..." : buttonInfo.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 pt-2 border-t border-cream-dark flex justify-between">
                  <span className="font-sans text-xs text-brown/40">Összesen</span>
                  <span className="font-sans text-sm font-bold text-brown-dark">
                    {selected.vegosszeg.toLocaleString("hu-HU")} Ft
                  </span>
                </div>
              </div>

              <p className="font-sans text-xs text-brown/50">
                A státusz most naponként kezelhető. Így a több napra leadott rendeléseknél csak a megfelelő napi rész halad tovább.
              </p>

              <p className="font-sans text-[10px] text-brown/30 text-center">
                {formatDate(selected.created_at)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
