"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type RendelesNap = {
  id: string;
  datum: string;
  nap: string;
  nyitott: boolean;
  hatarido: string | null;
};

type Termek = {
  id: string;
  nev: string;
  kategoria: string;
  egyseg: string;
  aktiv: boolean;
  sorrend?: number;
};

const HU_MONTHS = [
  "Január", "Február", "Március", "Április", "Május", "Június",
  "Július", "Augusztus", "Szeptember", "Október", "November", "December",
];
const HU_DAYS_SHORT = ["H", "K", "Sz", "Cs", "P", "Sz", "V"];

function toLocalDateStr(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildCalendarDays(year: number, month: number): (string | null)[] {
  const firstDay = new Date(year, month, 1);
  // JS: 0=Sun..6=Sat → convert to Mon-first (0=Mon..6=Sun)
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(`${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }
  return cells;
}

function toLocalDatetimeValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultHatarido(datum: string): string {
  const d = new Date(datum + "T00:00:00");
  d.setDate(d.getDate() - 2);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

export default function NapokPage() {
  const today = toLocalDateStr(new Date());
  const now = new Date();

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [napok, setNapok] = useState<RendelesNap[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Szerkesztő panel
  const [editNap, setEditNap] = useState<RendelesNap | null>(null);
  const [editHatarido, setEditHatarido] = useState("");
  const [editNyitott, setEditNyitott] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedRef = useRef<{ id: string; nyitott: boolean; hatarido: string } | null>(null);

  // Termékek a naphoz
  const [allTermekek, setAllTermekek] = useState<Termek[]>([]);
  const [kategoriak, setKategoriak] = useState<string[]>([]);
  const [napiTermekIds, setNapiTermekIds] = useState<string[] | null>(null); // null = betöltés alatt
  const [termekSaving, setTermekSaving] = useState(false);

  const fetchNapok = useCallback(() => {
    setLoading(true);
    const tol = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-01`;
    const ig = toLocalDateStr(new Date(viewYear, viewMonth + 1, 0));
    fetch(`/api/admin/rendeles-napok?tol=${tol}&ig=${ig}`)
      .then((r) => r.json())
      .then((d) => {
        setNapok(d.napok ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [viewYear, viewMonth]);

  useEffect(() => {
    fetchNapok();
  }, [fetchNapok]);

  // Termékek betöltése (egyszer)
  useEffect(() => {
    fetch("/api/admin/termekek")
      .then((r) => r.json())
      .then((d) => {
        setAllTermekek((d.termekek ?? []).filter((t: Termek) => t.aktiv));
        setKategoriak(d.kategoriak ?? []);
      });
  }, []);

  // Napi termékek betöltése, ha szerkesztő megnyílik
  useEffect(() => {
    if (!editNap) return;
    setNapiTermekIds(null);
    fetch(`/api/admin/napi-termekek/${editNap.id}`)
      .then((r) => r.json())
      .then((d) => setNapiTermekIds(d.termek_ids ?? []));
  }, [editNap]);

  const openEditor = (nap: RendelesNap) => {
    setEditNap(nap);
    const hataridoValue = toLocalDatetimeValue(nap.hatarido);
    setEditHatarido(hataridoValue);
    setEditNyitott(nap.nyitott);
    lastSavedRef.current = {
      id: nap.id,
      nyitott: nap.nyitott,
      hatarido: hataridoValue,
    };
    setDeleteError("");
  };

  const closeEditor = async () => {
    await saveEditor({ silent: true, keepalive: true });
    setEditNap(null);
    setNapiTermekIds(null);
    setDeleteError("");
  };

  const createDay = async (datum: string) => {
    setCreating(true);
    const res = await fetch("/api/admin/rendeles-napok", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ datum }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.nap) {
      fetchNapok();
      openEditor(data.nap);
    }
  };

  const saveEditor = useCallback(async (options?: { silent?: boolean; keepalive?: boolean }) => {
    if (!editNap) return;

    const lastSaved = lastSavedRef.current;
    const unchanged =
      lastSaved &&
      lastSaved.id === editNap.id &&
      lastSaved.nyitott === editNyitott &&
      lastSaved.hatarido === editHatarido;

    if (unchanged) return;

    if (!options?.silent) setSaving(true);
    const hatarisoISO = editHatarido
      ? new Date(editHatarido).toISOString()
      : null;

    await fetch(`/api/admin/rendeles-napok/${editNap.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nyitott: editNyitott, hatarido: hatarisoISO }),
      keepalive: options?.keepalive,
    });
    lastSavedRef.current = {
      id: editNap.id,
      nyitott: editNyitott,
      hatarido: editHatarido,
    };
    if (!options?.silent) setSaving(false);
    fetchNapok();
  }, [editNap, editNyitott, editHatarido, fetchNapok]);

  const deleteDay = async () => {
    if (!editNap) return;
    setDeleting(true);
    setDeleteError("");
    const res = await fetch(`/api/admin/rendeles-napok/${editNap.id}`, { method: "DELETE" });
    const data = await res.json();
    setDeleting(false);
    if (res.ok) {
      closeEditor();
      fetchNapok();
    } else {
      setDeleteError(data.error ?? "Hiba a törlés során.");
    }
  };

  const saveTermekek = async (newIds: string[]) => {
    if (!editNap) return;
    setTermekSaving(true);
    await fetch(`/api/admin/napi-termekek/${editNap.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ termek_ids: newIds }),
    });
    setNapiTermekIds(newIds);
    setTermekSaving(false);
  };

  const toggleTermek = (termekId: string) => {
    if (napiTermekIds === null) return;
    const isAll = napiTermekIds.length === 0;
    // Ha mind elérhető és kikapcsolunk egyet → explicitté tesszük az összes többit
    let current = isAll ? allTermekek.map((t) => t.id) : [...napiTermekIds];
    if (current.includes(termekId)) {
      current = current.filter((id) => id !== termekId);
    } else {
      current = [...current, termekId];
    }
    // Ha minden be van kapcsolva → üres (minden elérhető)
    if (current.length === allTermekek.length) current = [];
    saveTermekek(current);
  };

  const setAllTermekekOn = () => saveTermekek([]);

  const getEnabledIds = () => {
    if (napiTermekIds === null) return [];
    return napiTermekIds.length === 0 ? allTermekek.map((t) => t.id) : napiTermekIds;
  };

  const toggleCategory = (termekIds: string[], shouldEnable: boolean) => {
    if (napiTermekIds === null) return;

    const current = new Set(getEnabledIds());
    for (const termekId of termekIds) {
      if (shouldEnable) current.add(termekId);
      else current.delete(termekId);
    }

    const next = Array.from(current);
    saveTermekek(next.length === allTermekek.length ? [] : next);
  };

  const groupedTermekek = [
    ...kategoriak.map((kategoria) => ({
      kategoria,
      items: allTermekek.filter((t) => t.kategoria === kategoria),
    })).filter(({ items }) => items.length > 0),
    ...Array.from(new Set(allTermekek.map((t) => t.kategoria)))
      .filter((kategoria) => !kategoriak.includes(kategoria))
      .map((kategoria) => ({
        kategoria,
        items: allTermekek.filter((t) => t.kategoria === kategoria),
      })),
  ];

  const napokByDatum = Object.fromEntries(napok.map((n) => [n.datum, n]));
  const cells = buildCalendarDays(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  useEffect(() => {
    if (!editNap) return;

    const lastSaved = lastSavedRef.current;
    const changed =
      !lastSaved ||
      lastSaved.id !== editNap.id ||
      lastSaved.nyitott !== editNyitott ||
      lastSaved.hatarido !== editHatarido;

    if (!changed) return;

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);
    autosaveTimeoutRef.current = setTimeout(() => {
      saveEditor({ silent: true }).catch(() => undefined);
    }, 700);

    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    };
  }, [editNap, editNyitott, editHatarido, saveEditor]);

  useEffect(() => {
    const flushPendingSave = () => {
      if (!editNap) return;
      saveEditor({ silent: true, keepalive: true }).catch(() => undefined);
    };

    window.addEventListener("pagehide", flushPendingSave);
    window.addEventListener("beforeunload", flushPendingSave);

    return () => {
      window.removeEventListener("pagehide", flushPendingSave);
      window.removeEventListener("beforeunload", flushPendingSave);
    };
  }, [editNap, saveEditor]);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-brown-dark">Rendelési napok</h1>
        <p className="font-sans text-sm text-brown/50 mt-1">
          Kattints egy napra a naptárban a beállításhoz
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Naptár */}
        <div className="flex-1 min-w-0">
          {/* Hónap navigáció */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-cream-dark transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="font-serif text-lg text-brown-dark">
              {viewYear}. {HU_MONTHS[viewMonth]}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-cream-dark transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-brown/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Nap fejlécek */}
          <div className="grid grid-cols-7 mb-1">
            {HU_DAYS_SHORT.map((d, i) => (
              <div key={i} className="text-center font-sans text-[11px] font-semibold text-brown/40 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Naptár cellák */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {cells.map((datum, idx) => {
                if (!datum) {
                  return <div key={`empty-${idx}`} />;
                }
                const nap = napokByDatum[datum];
                const isPast = datum < today;
                const isToday = datum === today;
                const isSelected = editNap?.datum === datum;
                const isHataridonTul = nap?.hatarido
                  ? new Date(nap.hatarido) < new Date()
                  : false;
                const isPastWithoutNap = isPast && !nap;

                let cellClass = "relative min-h-[52px] rounded-xl border-2 transition-all ";
                if (isSelected) {
                  cellClass += "border-gold bg-gold/10 ";
                } else if (isPastWithoutNap) {
                  cellClass += "border-stone-200 bg-stone-100/80 cursor-pointer hover:border-stone-300 ";
                } else if (nap) {
                  if (nap.nyitott && !isHataridonTul) {
                    cellClass += "border-green-400 bg-green-50 cursor-pointer hover:border-green-500 ";
                  } else {
                    cellClass += "border-green-200 bg-green-50/50 cursor-pointer hover:border-green-300 ";
                  }
                } else {
                  cellClass += "border-cream-dark bg-white cursor-pointer hover:border-gold/50 hover:bg-gold/5 ";
                }

                return (
                  <button
                    key={datum}
                    onClick={() => {
                      if (nap) openEditor(nap);
                      else createDay(datum);
                    }}
                    className={cellClass + "text-left p-1.5 w-full"}
                  >
                    <span className={`font-sans text-xs font-semibold block
                      ${isToday ? "text-gold" : nap ? "text-green-800" : isPast ? "text-stone-500" : "text-brown-dark"}
                    `}>
                      {Number(datum.split("-")[2])}
                    </span>
                    {isToday && (
                      <span className="font-sans text-[9px] leading-tight block mt-0.5 text-gold font-semibold">
                        Mai nap
                      </span>
                    )}
                    {nap && (
                      <span className={`font-sans text-[9px] leading-tight block mt-0.5
                        ${nap.nyitott && !isHataridonTul ? "text-green-700" : "text-green-500"}
                      `}>
                        {nap.nyitott && !isHataridonTul ? "Nyitott" : nap.nyitott ? "Lejárt" : "Zárva"}
                      </span>
                    )}
                    {!nap && isPast && (
                      <span className="font-sans text-[9px] leading-tight block mt-0.5 text-stone-500">
                        Korábbi nap
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Jelmagyarázat */}
          <div className="flex items-center gap-4 mt-4 font-sans text-xs text-brown/50">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-100 border border-green-400 inline-block" />
              Nyitott rendelési nap
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-white border-2 border-cream-dark inline-block" />
              Új vagy mai nap megnyitása
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-stone-100 border border-stone-300 inline-block" />
              Korábbi nap
            </span>
          </div>
        </div>

        {/* Szerkesztő panel */}
        {editNap && (
          <div className="w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-cream-dark p-5 space-y-4 sticky top-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base text-brown-dark">{editNap.nap}</h3>
                  <p className="font-sans text-xs text-brown/40">
                    {new Date(editNap.datum + "T00:00:00").toLocaleDateString("hu-HU", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
                <button onClick={() => void closeEditor()} className="text-brown/30 hover:text-brown-dark cursor-pointer p-1">✕</button>
              </div>

              {/* Nyitott / Zárt */}
              <div className="flex items-center justify-between">
                <span className="font-sans text-sm text-brown-dark">Rendelés fogadása</span>
                <button
                  onClick={() => setEditNyitott(!editNyitott)}
                  className={`w-10 h-6 rounded-full transition-colors cursor-pointer relative
                    ${editNyitott ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                    ${editNyitott ? "left-5" : "left-1"}`} />
                </button>
              </div>

              {/* Határidő */}
              <div>
                <label className="block font-sans text-xs text-brown/60 mb-1">Rendelési határidő</label>
                <input
                  type="datetime-local"
                  value={editHatarido}
                  onChange={(e) => setEditHatarido(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none"
                />
                <button
                  onClick={() => setEditHatarido(toLocalDatetimeValue(defaultHatarido(editNap.datum)))}
                  className="mt-1 font-sans text-xs text-brown/40 hover:text-gold cursor-pointer"
                >
                  Alapértelmezett (2 nappal korábban, 23:59)
                </button>
              </div>

              {/* Mentés gomb */}
              <button
                onClick={() => void saveEditor()}
                disabled={saving}
                className="w-full py-2 rounded-lg font-sans text-sm font-semibold
                  bg-gold text-brown-dark hover:bg-gold-light transition-colors
                  disabled:opacity-50 cursor-pointer"
              >
                {saving ? "Mentés..." : "Mentés most"}
              </button>
              <p className="font-sans text-[10px] text-brown/40 -mt-2">
                A módosítások automatikusan mentődnek.
              </p>

              {/* Termékek */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-sans text-xs font-semibold text-brown/60 uppercase tracking-wider">
                    Elérhető termékek
                  </p>
                  <div className="flex items-center gap-3">
                    {napiTermekIds !== null && (
                      <span className="font-sans text-[10px] text-brown/40">
                        {getEnabledIds().length}/{allTermekek.length} aktív
                      </span>
                    )}
                    {napiTermekIds !== null && napiTermekIds.length > 0 && (
                      <button
                        onClick={setAllTermekekOn}
                        className="font-sans text-[10px] text-gold hover:underline cursor-pointer"
                      >
                        Mind be
                      </button>
                    )}
                  </div>
                </div>

                {napiTermekIds === null ? (
                  <div className="flex justify-center py-4">
                    <div className="w-5 h-5 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {groupedTermekek.map(({ kategoria, items }) => {
                      const enabledIds = getEnabledIds();
                      const enabledCount = items.filter((item) => enabledIds.includes(item.id)).length;
                      const allEnabled = enabledCount === items.length;

                      return (
                        <div key={kategoria} className="rounded-xl border border-cream-dark p-3 bg-cream/40">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div>
                              <p className="font-sans text-xs font-semibold text-brown-dark">
                                {kategoria}
                              </p>
                              <p className="font-sans text-[10px] text-brown/40">
                                {enabledCount}/{items.length} elérhető
                              </p>
                            </div>
                            <button
                              onClick={() => toggleCategory(items.map((item) => item.id), !allEnabled)}
                              disabled={termekSaving}
                              className="font-sans text-[10px] text-gold hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline"
                            >
                              {allEnabled ? "Mind ki" : "Mind be"}
                            </button>
                          </div>

                          <div className="space-y-1.5">
                            {items.map((t) => {
                              const isOn = enabledIds.includes(t.id);
                              return (
                                <div
                                  key={t.id}
                                  className={`flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                                    isOn ? "bg-white" : "bg-transparent"
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <p className={`font-sans text-xs truncate ${isOn ? "text-brown-dark font-medium" : "text-brown/50"}`}>
                                      {t.nev}
                                    </p>
                                    <p className={`font-sans text-[10px] ${isOn ? "text-brown/50" : "text-brown/30"}`}>
                                      {t.egyseg}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => toggleTermek(t.id)}
                                    disabled={termekSaving}
                                    className={`flex-shrink-0 w-8 h-5 rounded-full transition-colors cursor-pointer relative
                                      ${isOn ? "bg-green-500" : "bg-gray-300"}
                                      disabled:opacity-50`}
                                  >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform
                                      ${isOn ? "left-[14px]" : "left-0.5"}`} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {napiTermekIds !== null && napiTermekIds.length === 0 && (
                  <p className="font-sans text-[10px] text-green-600 mt-1">Minden termék elérhető</p>
                )}
              </div>

              {/* Nap törlése */}
              <div className="pt-1 border-t border-cream-dark">
                {deleteError && (
                  <p className="font-sans text-xs text-red-600 mb-2">{deleteError}</p>
                )}
                <button
                  onClick={deleteDay}
                  disabled={deleting}
                  className="w-full py-2 rounded-lg font-sans text-xs text-red-500
                    hover:bg-red-50 border border-red-200 transition-colors cursor-pointer
                    disabled:opacity-50"
                >
                  {deleting ? "Törlés..." : "Nap törlése"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Creating spinner overlay */}
        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
            <div className="bg-white rounded-xl p-6 shadow-xl">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-sans text-sm text-brown/60 mt-3">Nap létrehozása...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
