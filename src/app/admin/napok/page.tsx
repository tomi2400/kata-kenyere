"use client";

import { useState, useEffect } from "react";

type RendelesNap = {
  id: string;
  datum: string;
  nap: string;
  nyitott: boolean;
  hatarido: string | null;
};

export default function NapokPage() {
  const [napok, setNapok] = useState<RendelesNap[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchNapok = () => {
    setLoading(true);
    fetch("/api/admin/rendeles-napok")
      .then((res) => res.json())
      .then((data) => {
        setNapok(data.napok ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNapok();
  }, []);

  const generateDays = async () => {
    setGenerating(true);
    await fetch("/api/admin/rendeles-napok/general", { method: "POST" });
    setGenerating(false);
    fetchNapok();
  };

  const toggleNyitott = async (nap: RendelesNap) => {
    await fetch(`/api/admin/rendeles-napok/${nap.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nyitott: !nap.nyitott }),
    });
    fetchNapok();
  };

  const formatDatum = (datum: string) => {
    const d = new Date(datum + "T00:00:00");
    return d.toLocaleDateString("hu-HU", {
      month: "long",
      day: "numeric",
    });
  };

  const formatHatarido = (hatarido: string | null) => {
    if (!hatarido) return "—";
    const d = new Date(hatarido);
    return d.toLocaleString("hu-HU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isPast = (datum: string) => {
    return datum < new Date().toISOString().split("T")[0];
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-brown-dark">Rendelesi napok</h1>
          <p className="font-sans text-sm text-brown/50 mt-1">
            Melyik napokon lehet rendelni
          </p>
        </div>
        <button
          onClick={generateDays}
          disabled={generating}
          className="px-4 py-2 rounded-lg font-sans text-sm font-semibold
            bg-gold text-brown-dark hover:bg-gold-light transition-colors
            disabled:opacity-50 cursor-pointer"
        >
          {generating ? "Generalas..." : "Kov. 2 het megnyitasa"}
        </button>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : napok.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-sans text-brown/40 text-sm mb-4">
            Meg nincsenek rendelesi napok
          </p>
          <p className="font-sans text-brown/40 text-xs">
            Kattints a &quot;Kov. 2 het megnyitasa&quot; gombra a napok generelasahoz
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {napok.map((nap) => {
            const past = isPast(nap.datum);
            return (
              <div
                key={nap.id}
                className={`
                  flex items-center justify-between gap-4 bg-white rounded-xl border border-cream-dark p-4
                  ${past ? "opacity-40" : ""}
                `}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-sm font-semibold text-brown-dark">
                      {nap.nap}
                    </p>
                    <p className="font-sans text-sm text-brown/50">
                      {formatDatum(nap.datum)}
                    </p>
                  </div>
                  <p className="font-sans text-xs text-brown/40 mt-0.5">
                    Hatarido: {formatHatarido(nap.hatarido)}
                  </p>
                </div>

                <button
                  onClick={() => toggleNyitott(nap)}
                  disabled={past}
                  className={`
                    w-10 h-6 rounded-full transition-colors cursor-pointer relative
                    ${nap.nyitott ? "bg-green-500" : "bg-gray-300"}
                    disabled:cursor-not-allowed
                  `}
                  title={nap.nyitott ? "Nyitott" : "Zarva"}
                >
                  <div
                    className={`
                      absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
                      ${nap.nyitott ? "left-5" : "left-1"}
                    `}
                  />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
