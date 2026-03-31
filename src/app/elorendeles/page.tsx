import Image from "next/image";
import Link from "next/link";
import DaySelector from "@/components/DaySelector";
import { supabaseAdmin } from "@/lib/supabase/server";
import { MapPin, Clock, ShoppingBag } from "lucide-react";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

function formatHatarido(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  // Mindig Budapest időzónában formázzuk
  return d.toLocaleString("hu-HU", {
    timeZone: "Europe/Budapest",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + "-ig";
}

export default async function ElorendelesPage() {
  // Next.js 14: fetch cache teljes tiltása ennél a kérésnél
  noStore();

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const { data: napok } = await supabaseAdmin
    .from("rendeles_napok")
    .select("id, datum, nap, hatarido")
    .eq("nyitott", true)
    .gte("datum", todayStr)
    .order("datum")
    .limit(90);

  const days = (napok ?? [])
    .filter((nap) => nap.hatarido && new Date(nap.hatarido) > now)
    .map((nap) => ({
      nap: nap.nap as string,
      datum: nap.datum,
      hatarido: formatHatarido(nap.hatarido),
    }));

  return (
    <div className="min-h-screen bg-cream grain-overlay">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gold/20 bg-cream/80 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Kata Kenyere" width={36} height={36} />
          <span className="font-serif text-sm text-brown-dark hidden sm:block">Kata Kenyere</span>
        </Link>
        <Link href="/termekek" className="font-sans text-xs text-brown/50 hover:text-brown transition-colors">
          ← Kínálatunk
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 md:py-14">
        <section className="paper-panel warm-ring rounded-[2rem] px-6 py-8 md:px-10 md:py-10 mb-8 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/70 px-3 py-1 mb-5">
              <span className="h-2 w-2 rounded-full bg-gold" />
              <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-brown/55">Online előrendelés</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-brown-dark mb-4 leading-[1.05]">
              Válaszd ki,
              <br />
              <em className="text-gold not-italic">mikor süssünk neked.</em>
            </h1>
            <p className="font-sans text-brown/65 text-sm md:text-base leading-relaxed max-w-xl">
              Több napot is kiválaszthatsz egyszerre. A következő lépésben napokra bontva tudsz termékeket rendelni,
              így minden átvétel külön átlátható marad.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[
            { cim: "1. Nap kiválasztása", szoveg: "Jelöld be, melyik napokra szeretnél rendelni." },
            { cim: "2. Termékek napokra", szoveg: "Minden naphoz külön állíthatod össze a kosarat." },
            { cim: "3. Egy leadás", szoveg: "A végén egyben tudod elküldeni az egész rendelést." },
          ].map((item) => (
            <div key={item.cim} className="paper-panel rounded-2xl px-4 py-4 border border-gold/15">
              <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-brown/40 mb-2">{item.cim}</p>
              <p className="font-sans text-sm text-brown/70 leading-relaxed">{item.szoveg}</p>
            </div>
          ))}
        </div>

        <DaySelector days={days} redirectTo="/valasztas" />

        <div className="mt-10 grid grid-cols-3 gap-3 text-center">
          {[
            { Icon: MapPin, text: "Salakhegyi út 14." },
            { Icon: Clock, text: "K–P 8:00–17:00" },
            { Icon: ShoppingBag, text: "Személyes átvétel" },
          ].map(({ Icon, text }) => (
            <div key={text} className="paper-panel rounded-2xl py-4 px-2 flex flex-col items-center gap-2 border border-gold/15">
              <Icon className="w-4 h-4 text-gold" />
              <p className="font-sans text-xs text-brown/60">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
