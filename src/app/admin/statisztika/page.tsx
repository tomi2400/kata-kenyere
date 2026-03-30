"use client";

import { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend, CartesianGrid,
} from "recharts";

type Stats = {
  osszRendeles: number;
  osszBevetel: number;
  atlagErtek: number;
  topTermekek: { nev: string; mennyiseg: number }[];
  napiTrend: { datum: string; rendeles: number; bevetel: number }[];
  termekTrend: { nev: string; adatok: { datum: string; mennyiseg: number }[] }[];
  tol: string;
  ig: string;
};

const LINE_COLORS = ["#c9973f", "#7c5c2e", "#4ade80", "#60a5fa", "#f472b6"];

const QUICK_RANGES = [
  { label: "7 nap", days: 7 },
  { label: "30 nap", days: 30 },
  { label: "90 nap", days: 90 },
  { label: "Idén", days: -1 },
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function daysAgoStr(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function yearStartStr() {
  return `${new Date().getFullYear()}-01-01`;
}

function formatDatum(datum: string) {
  const d = new Date(datum + "T00:00:00");
  return d.toLocaleDateString("hu-HU", { month: "short", day: "numeric" });
}

type TooltipPayloadItem = { name: string; value: number; color: string };
type TooltipProps = { active?: boolean; payload?: TooltipPayloadItem[]; label?: string };

const FtTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cream-dark rounded-lg p-2 text-xs shadow-md">
      <p className="font-semibold text-brown-dark mb-1">{formatDatum(label ?? "")}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {typeof p.value === "number" && p.value > 1000
            ? p.value.toLocaleString("hu-HU") + " Ft"
            : p.value + " db"}
        </p>
      ))}
    </div>
  );
};

export default function StatisztikaPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tol, setTol] = useState(daysAgoStr(30));
  const [ig, setIg] = useState(todayStr());
  const [activeQuick, setActiveQuick] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/statisztika?tol=${tol}&ig=${ig}`)
      .then((r) => r.json())
      .then((d) => {
        setStats(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tol, ig]);

  const applyQuick = (days: number) => {
    setActiveQuick(days);
    if (days === -1) {
      setTol(yearStartStr());
    } else {
      setTol(daysAgoStr(days));
    }
    setIg(todayStr());
  };

  const formatFt = (n: number) => n.toLocaleString("hu-HU") + " Ft";

  // Összesítünk minden dátumot a terméktrend-hez (közös x-tengely)
  const allDates = stats
    ? Array.from(new Set(stats.termekTrend.flatMap((t) => t.adatok.map((a) => a.datum)))).sort()
    : [];

  const termekTrendData = allDates.map((datum) => {
    const row: Record<string, string | number> = { datum };
    stats?.termekTrend.forEach((t) => {
      const found = t.adatok.find((a) => a.datum === datum);
      row[t.nev] = found?.mennyiseg ?? 0;
    });
    return row;
  });

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-brown-dark">Statisztika</h1>
        <p className="font-sans text-sm text-brown/50 mt-1">Rendelési trendek és áttekintés</p>
      </div>

      {/* Dátumszűrő */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {QUICK_RANGES.map((q) => (
            <button
              key={q.label}
              onClick={() => applyQuick(q.days)}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs transition-colors cursor-pointer
                ${activeQuick === q.days
                  ? "bg-gold text-brown-dark font-semibold"
                  : "bg-cream-dark text-brown/60 hover:bg-gold/20"
                }`}
            >
              {q.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={tol}
            onChange={(e) => { setTol(e.target.value); setActiveQuick(0); }}
            className="px-3 py-1.5 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none cursor-pointer"
          />
          <span className="font-sans text-xs text-brown/40">–</span>
          <input
            type="date"
            value={ig}
            onChange={(e) => { setIg(e.target.value); setActiveQuick(0); }}
            className="px-3 py-1.5 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {loading || !stats ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI kártyák */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-cream-dark p-4">
              <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Rendelések</p>
              <p className="font-sans text-3xl font-bold text-brown-dark mt-1">{stats.osszRendeles}</p>
            </div>
            <div className="bg-white rounded-xl border border-cream-dark p-4">
              <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Bevétel</p>
              <p className="font-sans text-2xl font-bold text-brown-dark mt-1">{formatFt(stats.osszBevetel)}</p>
            </div>
            <div className="bg-white rounded-xl border border-cream-dark p-4">
              <p className="font-sans text-[10px] text-brown/40 uppercase tracking-wider">Átlag rendelés</p>
              <p className="font-sans text-2xl font-bold text-brown-dark mt-1">{formatFt(stats.atlagErtek)}</p>
            </div>
          </div>

          {/* Napi rendelési mennyiségek */}
          {stats.napiTrend.length > 0 && (
            <div className="bg-white rounded-xl border border-cream-dark p-5">
              <h2 className="font-serif text-base text-brown/70 mb-4">Napi rendelések száma</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.napiTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd0" />
                  <XAxis
                    dataKey="datum"
                    tickFormatter={formatDatum}
                    tick={{ fontSize: 10, fill: "#a08060" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#a08060" }} allowDecimals={false} />
                  <Tooltip content={<FtTooltip />} />
                  <Bar dataKey="rendeles" name="rendelés (db)" fill="#c9973f" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Termékek trendje */}
          {termekTrendData.length > 0 && stats.termekTrend.length > 0 && (
            <div className="bg-white rounded-xl border border-cream-dark p-5">
              <h2 className="font-serif text-base text-brown/70 mb-4">Top 5 termék trendje (db/nap)</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={termekTrendData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd0" />
                  <XAxis
                    dataKey="datum"
                    tickFormatter={formatDatum}
                    tick={{ fontSize: 10, fill: "#a08060" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#a08060" }} allowDecimals={false} />
                  <Tooltip content={<FtTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                    formatter={(value) => <span style={{ color: "#7c5c2e" }}>{value}</span>}
                  />
                  {stats.termekTrend.map((t, i) => (
                    <Line
                      key={t.nev}
                      type="monotone"
                      dataKey={t.nev}
                      stroke={LINE_COLORS[i % LINE_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Legnépszerűbb termékek */}
          {stats.topTermekek.length > 0 && (
            <div className="bg-white rounded-xl border border-cream-dark p-5">
              <h2 className="font-serif text-base text-brown/70 mb-4">Legnépszerűbb termékek (top 10)</h2>
              <ResponsiveContainer width="100%" height={stats.topTermekek.length * 36 + 20}>
                <BarChart
                  data={[...stats.topTermekek].reverse()}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
                >
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#a08060" }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="nev"
                    tick={{ fontSize: 11, fill: "#4a3520" }}
                    width={140}
                  />
                  <Tooltip
                    formatter={(value) => [`${value} db`, "Mennyiség"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="mennyiseg" name="db" fill="#c9973f" radius={[0, 3, 3, 0]} label={{ position: "right", fontSize: 11, fill: "#7c5c2e" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {stats.osszRendeles === 0 && (
            <div className="text-center py-16">
              <p className="font-sans text-brown/40">Ebben az időszakban nincs rendelési adat.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
