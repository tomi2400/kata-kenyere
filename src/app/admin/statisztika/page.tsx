"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ProductStat = {
  nev: string;
  kategoria: string;
  mennyiseg: number;
  bevetel: number;
};

type PickupDayStat = {
  datum: string;
  hetNap: string;
  rendelesDb: number;
  tetelDb: number;
  bevetel: number;
};

type WeekdayStat = {
  nap: string;
  rendelesDb: number;
  tetelDb: number;
  bevetel: number;
  atlagKosar: number;
};

type TrendStat = {
  datum: string;
  rendeles: number;
  bevetel: number;
};

type ProductTrend = {
  nev: string;
  adatok: { datum: string; mennyiseg: number }[];
};

type RepeatCustomerStat = {
  egyediVasarlok: number;
  visszateroVasarlok: number;
  arany: number;
  visszateroRendelesek: number;
  visszateroBevetel: number;
};

type PairStat = {
  par: string;
  rendelesDb: number;
};

type CancelStat = {
  darab: number;
  arany: number;
};

type BakerKpi = {
  legerosebbAtveteliNap: PickupDayStat | null;
  topDarabTermek: ProductStat | null;
  topBevetelTermek: ProductStat | null;
};

type Stats = {
  osszRendeles: number;
  osszBevetel: number;
  atlagErtek: number;
  topTermekek: ProductStat[];
  topBevetelesTermekek: ProductStat[];
  napiTrend: TrendStat[];
  atveteliNapok: PickupDayStat[];
  hetNapok: WeekdayStat[];
  termekTrend: ProductTrend[];
  visszateroVasarlok: RepeatCustomerStat;
  topTermekParok: PairStat[];
  torlesek: CancelStat;
  pekKpi: BakerKpi;
  tol: string;
  ig: string;
};

const LINE_COLORS = ["#c9973f", "#7c5c2e", "#4ade80", "#60a5fa", "#f472b6"];
const BAR_COLORS = ["#c9973f", "#a17634", "#7c5c2e", "#60a5fa", "#f59e0b", "#4ade80", "#f472b6"];

const QUICK_RANGES = [
  { label: "7 nap", days: 7 },
  { label: "30 nap", days: 30 },
  { label: "90 nap", days: 90 },
  { label: "Idén", days: -1 },
];

function todayStr() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysAgoStr(n: number) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function yearStartStr() {
  return `${new Date().getFullYear()}-01-01`;
}

function formatDatum(datum: string, options?: Intl.DateTimeFormatOptions) {
  if (!datum) return "Nincs adat";
  const date = new Date(`${datum}T12:00:00`);
  return date.toLocaleDateString("hu-HU", options ?? { month: "short", day: "numeric" });
}

function formatFt(n: number) {
  return `${n.toLocaleString("hu-HU")} Ft`;
}

type TooltipPayloadItem = { name: string; value: number; color: string };
type TooltipProps = { active?: boolean; payload?: TooltipPayloadItem[]; label?: string };

function CustomTooltip({
  active,
  payload,
  label,
  formatter,
}: TooltipProps & { formatter?: (item: TooltipPayloadItem) => string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cream-dark rounded-lg p-3 text-xs shadow-md">
      <p className="font-semibold text-brown-dark mb-1">{label && label.includes("-") ? formatDatum(label) : label}</p>
      {payload.map((item) => (
        <p key={`${item.name}-${item.color}`} style={{ color: item.color }}>
          {item.name}: {formatter ? formatter(item) : item.value.toLocaleString("hu-HU")}
        </p>
      ))}
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-cream-dark p-5 ${className}`}>
      <div className="mb-4">
        <h2 className="font-serif text-lg text-brown-dark">{title}</h2>
        {subtitle && <p className="font-sans text-xs text-brown/50 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function KpiCard({ label, value, helper }: { label: string; value: string; helper?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-cream-dark p-4">
      <p className="font-sans text-[10px] text-brown/40 uppercase tracking-[0.22em]">{label}</p>
      <p className="font-sans text-2xl md:text-3xl font-bold text-brown-dark mt-2">{value}</p>
      {helper && <p className="font-sans text-xs text-brown/50 mt-2">{helper}</p>}
    </div>
  );
}

export default function StatisztikaPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tol, setTol] = useState(daysAgoStr(30));
  const [ig, setIg] = useState(todayStr());
  const [activeQuick, setActiveQuick] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/statisztika?tol=${tol}&ig=${ig}`)
      .then((response) => response.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tol, ig]);

  const applyQuick = (days: number) => {
    setActiveQuick(days);
    setTol(days === -1 ? yearStartStr() : daysAgoStr(days));
    setIg(todayStr());
  };

  const allDates = stats
    ? Array.from(new Set(stats.termekTrend.flatMap((termek) => termek.adatok.map((adat) => adat.datum)))).sort()
    : [];

  const termekTrendData = allDates.map((datum) => {
    const row: Record<string, string | number> = { datum };
    stats?.termekTrend.forEach((termek) => {
      const found = termek.adatok.find((adat) => adat.datum === datum);
      row[termek.nev] = found?.mennyiseg ?? 0;
    });
    return row;
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl text-brown-dark">Statisztika</h1>
        <p className="font-sans text-sm text-brown/50 mt-1">
          Olyan nézet, amiből a pék gyorsan látja a forgalmat, az átvételi csúcsokat és a húzótermékeket.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {QUICK_RANGES.map((range) => (
            <button
              key={range.label}
              onClick={() => applyQuick(range.days)}
              className={`px-3 py-1.5 rounded-lg font-sans text-xs transition-colors cursor-pointer ${
                activeQuick === range.days
                  ? "bg-gold text-brown-dark font-semibold"
                  : "bg-cream-dark text-brown/60 hover:bg-gold/20"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <input
            type="date"
            value={tol}
            onChange={(e) => {
              setTol(e.target.value);
              setActiveQuick(0);
            }}
            className="px-3 py-1.5 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none cursor-pointer"
          />
          <span className="font-sans text-xs text-brown/40">-</span>
          <input
            type="date"
            value={ig}
            onChange={(e) => {
              setIg(e.target.value);
              setActiveQuick(0);
            }}
            className="px-3 py-1.5 rounded-lg border border-cream-dark font-sans text-sm bg-white focus:border-gold focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {loading || !stats ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : stats.osszRendeles === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-cream-dark">
          <p className="font-sans text-brown/40">Ebben az időszakban nincs rendelési adat.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <KpiCard label="Rendelések" value={String(stats.osszRendeles)} />
            <KpiCard label="Bevétel" value={formatFt(stats.osszBevetel)} />
            <KpiCard label="Átlag rendelés" value={formatFt(stats.atlagErtek)} />
            <KpiCard
              label="Egyedi vásárlók"
              value={String(stats.visszateroVasarlok.egyediVasarlok)}
              helper={`${stats.visszateroVasarlok.visszateroVasarlok} visszatérő vásárló`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            <KpiCard
              label="Legerősebb átvételi nap"
              value={
                stats.pekKpi.legerosebbAtveteliNap?.datum
                  ? formatDatum(stats.pekKpi.legerosebbAtveteliNap.datum, { month: "short", day: "numeric" })
                  : "Nincs adat"
              }
              helper={
                stats.pekKpi.legerosebbAtveteliNap
                  ? `${stats.pekKpi.legerosebbAtveteliNap.rendelesDb} rendelés`
                  : undefined
              }
            />
            <KpiCard
              label="Top termék darabra"
              value={stats.pekKpi.topDarabTermek?.nev ?? "Nincs adat"}
              helper={
                stats.pekKpi.topDarabTermek
                  ? `${stats.pekKpi.topDarabTermek.mennyiseg.toLocaleString("hu-HU")} db`
                  : undefined
              }
            />
            <KpiCard
              label="Top termék bevételre"
              value={stats.pekKpi.topBevetelTermek?.nev ?? "Nincs adat"}
              helper={
                stats.pekKpi.topBevetelTermek
                  ? formatFt(stats.pekKpi.topBevetelTermek.bevetel)
                  : undefined
              }
            />
            <KpiCard
              label="Visszatérési arány"
              value={`${stats.visszateroVasarlok.arany}%`}
              helper={`${stats.torlesek.darab} törölt rendelés ebben az időszakban`}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SectionCard
              title="Top termékek"
              subtitle="Balra a legtöbbet rendelt termékek, jobbra melyik termék hozza a legtöbb bevételt."
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.18em] text-brown/40 mb-3">Darabszám szerint</p>
                  <ResponsiveContainer width="100%" height={Math.max(220, stats.topTermekek.length * 34)}>
                    <BarChart
                      data={[...stats.topTermekek].slice(0, 8).reverse()}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#a08060" }} allowDecimals={false} />
                      <YAxis type="category" dataKey="nev" width={170} tick={{ fontSize: 11, fill: "#4a3520" }} />
                      <Tooltip content={<CustomTooltip formatter={(item) => `${item.value} db`} />} />
                      <Bar dataKey="mennyiseg" fill="#c9973f" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="font-sans text-xs uppercase tracking-[0.18em] text-brown/40 mb-3">Bevétel szerint</p>
                  <ResponsiveContainer width="100%" height={Math.max(220, stats.topBevetelesTermekek.length * 34)}>
                    <BarChart
                      data={[...stats.topBevetelesTermekek].slice(0, 8).reverse()}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "#a08060" }}
                        tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                      />
                      <YAxis type="category" dataKey="nev" width={170} tick={{ fontSize: 11, fill: "#4a3520" }} />
                      <Tooltip content={<CustomTooltip formatter={(item) => formatFt(item.value)} />} />
                      <Bar dataKey="bevetel" fill="#7c5c2e" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Top termék trend"
              subtitle="A top 5 termék napi alakulása átvételi nap szerint."
            >
              {termekTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={termekTrendData} margin={{ top: 0, right: 0, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd0" />
                    <XAxis
                      dataKey="datum"
                      tickFormatter={(value) => formatDatum(value)}
                      tick={{ fontSize: 10, fill: "#a08060" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#a08060" }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip formatter={(item) => `${item.value} db`} />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    {stats.termekTrend.map((termek, index) => (
                      <Line
                        key={termek.nev}
                        type="monotone"
                        dataKey={termek.nev}
                        stroke={LINE_COLORS[index % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="font-sans text-sm text-brown/50">Ehhez az időszakhoz még nincs termék trend adat.</p>
              )}
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_1fr] gap-6">
            <SectionCard
              title="Átvételi napok terhelése"
              subtitle="Nem a rendelés leadásának napja, hanem az a nap, amikor át kell adni a termékeket."
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stats.atveteliNapok} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd0" />
                  <XAxis
                    dataKey="datum"
                    tickFormatter={(value) => formatDatum(value)}
                    tick={{ fontSize: 10, fill: "#a08060" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "#a08060" }} allowDecimals={false} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#a08060" }}
                    tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  />
                  <Tooltip
                    content={
                      <CustomTooltip
                        formatter={(item) => item.name.includes("bevétel") ? formatFt(item.value) : `${item.value} db`}
                      />
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar yAxisId="left" dataKey="rendelesDb" name="rendelés" fill="#c9973f" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="tetelDb" name="termék (db)" fill="#a17634" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="bevetel" name="bevétel" fill="#7c5c2e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>

            <SectionCard
              title="Rendelési napok trendje"
              subtitle="Mikor adtak le rendelést a kiválasztott időszakban."
            >
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={stats.napiTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd0" />
                  <XAxis
                    dataKey="datum"
                    tickFormatter={(value) => formatDatum(value)}
                    tick={{ fontSize: 10, fill: "#a08060" }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#a08060" }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip formatter={(item) => item.name === "bevétel" ? formatFt(item.value) : `${item.value} db`} />} />
                  <Bar dataKey="rendeles" name="rendelés" fill="#c9973f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <SectionCard
              title="Melyik hétköznap erős?"
              subtitle="Átvételi nap alapján összesítve. Ez mutatja, melyik napokra érdemes jobban készülni."
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.hetNapok} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e8dfd0" />
                  <XAxis dataKey="nap" tick={{ fontSize: 10, fill: "#a08060" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#a08060" }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip formatter={(item) => item.name === "bevétel" ? formatFt(item.value) : `${item.value} db`} />} />
                  <Bar dataKey="rendelesDb" name="rendelés" fill="#c9973f" radius={[4, 4, 0, 0]}>
                    {stats.hetNapok.map((item, index) => (
                      <Cell key={`${item.nap}-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stats.hetNapok.slice(0, 3).map((row) => (
                  <div key={row.nap} className="rounded-xl bg-cream/50 border border-cream-dark px-4 py-3">
                    <p className="font-sans text-xs uppercase tracking-[0.16em] text-brown/40">{row.nap}</p>
                    <p className="font-sans text-xl font-semibold text-brown-dark mt-1">{row.rendelesDb} rendelés</p>
                    <p className="font-sans text-xs text-brown/55 mt-1">{formatFt(row.bevetel)} bevétel</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Visszatérő vásárlók"
              subtitle="Email cím alapján normálva. Ugyanazzal az emaillel leadott több rendelést visszatérőnek számolunk."
            >
              <div className="space-y-4">
                <div className="rounded-xl bg-cream/50 border border-cream-dark p-4">
                  <p className="font-sans text-xs uppercase tracking-[0.16em] text-brown/40">Visszatérési arány</p>
                  <p className="font-sans text-3xl font-bold text-brown-dark mt-2">{stats.visszateroVasarlok.arany}%</p>
                  <p className="font-sans text-sm text-brown/55 mt-2">
                    {stats.visszateroVasarlok.visszateroVasarlok} visszatérő a {stats.visszateroVasarlok.egyediVasarlok} egyedi vásárlóból
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-cream-dark p-4">
                    <p className="font-sans text-xs text-brown/40 uppercase tracking-[0.16em]">Visszatérő rendelések</p>
                    <p className="font-sans text-2xl font-semibold text-brown-dark mt-2">
                      {stats.visszateroVasarlok.visszateroRendelesek}
                    </p>
                  </div>
                  <div className="rounded-xl border border-cream-dark p-4">
                    <p className="font-sans text-xs text-brown/40 uppercase tracking-[0.16em]">Visszatérő bevétel</p>
                    <p className="font-sans text-2xl font-semibold text-brown-dark mt-2">
                      {formatFt(stats.visszateroVasarlok.visszateroBevetel)}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-dashed border-cream-dark p-4">
                  <p className="font-sans text-sm text-brown/60">
                    Ha később külön vendégprofilt is akarsz, erre az email-alapú mérésre könnyen rá lehet építeni.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
            <SectionCard
              title="Gyakori termékpárok"
              subtitle="Melyik termékeket rendelik gyakran együtt ugyanabban a rendelésben."
            >
              {stats.topTermekParok.length > 0 ? (
                <div className="space-y-3">
                  {stats.topTermekParok.map((pair) => (
                    <div
                      key={pair.par}
                      className="flex items-center justify-between gap-4 rounded-xl border border-cream-dark px-4 py-3 bg-cream/40"
                    >
                      <div>
                        <p className="font-sans text-sm font-medium text-brown-dark">{pair.par}</p>
                        <p className="font-sans text-xs text-brown/45 mt-1">Gyakori együtt-rendelés</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-sans text-xl font-semibold text-brown-dark">{pair.rendelesDb}</p>
                        <p className="font-sans text-[11px] text-brown/45">rendelés</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="font-sans text-sm text-brown/50">Még nincs elég adat a termékpárokhoz.</p>
              )}
            </SectionCard>

            <SectionCard
              title="Törölt rendelések"
              subtitle="Külön tartjuk, hogy ne torzítsa az aktív statisztikákat, de mégis látszódjon."
            >
              <div className="rounded-xl bg-cream/50 border border-cream-dark p-4">
                <p className="font-sans text-xs uppercase tracking-[0.16em] text-brown/40">Törölt rendelések aránya</p>
                <p className="font-sans text-3xl font-bold text-brown-dark mt-2">{stats.torlesek.arany}%</p>
                <p className="font-sans text-sm text-brown/55 mt-2">
                  {stats.torlesek.darab} db törölt rendelés a kijelölt időszakban
                </p>
              </div>
              <div className="mt-4 rounded-xl border border-dashed border-cream-dark p-4">
                <p className="font-sans text-sm text-brown/60">
                  Ha később sok törlés lesz, erre külön ok szerinti bontást is rá tudunk tenni.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
