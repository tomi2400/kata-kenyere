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
  return d.toLocaleString("hu-HU", {
    timeZone: "Europe/Budapest",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + "-ig";
}

export default async function ElorendelesPage() {
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
    <div className="min-h-screen bg-[#fafaf8] grain-overlay text-[#4b2e1f]">
      {/* Header */}
      <header className="border-b border-[#ede8df] bg-white/90 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/images/logo.png" alt="Kata Kenyere" width={32} height={32} />
            <span className="hidden font-serif text-sm text-[#3d2314] sm:block">Kata Kenyere</span>
          </Link>
          <Link href="/termekek" className="font-sans text-xs text-[#9a7a5d] transition-colors hover:text-[#4b2e1f]">
            ← Kínálatunk
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10 md:py-14">

        {/* Hero kártya */}
        <section className="mb-8 overflow-hidden rounded-[24px] border border-[#ede8df] bg-white px-6 py-8 md:px-10 md:py-10">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d0af77]/30 bg-[#fafaf8] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c79a66]" />
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#9a7a5d]">Online előrendelés</span>
          </div>
          <h1 className="font-serif text-[2.2rem] leading-tight text-[#3d2314] md:text-[2.8rem]">
            Válaszd ki,<br />
            <span className="text-[#d0af77]">mikor süssünk neked.</span>
          </h1>
          <p className="mt-4 max-w-xl font-sans text-[0.9rem] leading-relaxed text-[#7c5a46]">
            Több napot is kiválaszthatsz egyszerre. A következő lépésben napokra bontva tudsz termékeket rendelni,
            így minden átvétel külön átlátható marad.
          </p>
        </section>

        {/* Lépések */}
        <div className="mb-8 grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            { cim: "1. Nap kiválasztása", szoveg: "Jelöld be, melyik napokra szeretnél rendelni." },
            { cim: "2. Termékek napokra", szoveg: "Minden naphoz külön állíthatod össze a kosarat." },
            { cim: "3. Egy leadás", szoveg: "A végén egyben tudod elküldeni az egész rendelést." },
          ].map((item) => (
            <div key={item.cim} className="rounded-[16px] border border-[#ede8df] bg-white px-4 py-4">
              <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#9a7a5d]">{item.cim}</p>
              <p className="mt-1.5 font-sans text-sm leading-relaxed text-[#7c5a46]">{item.szoveg}</p>
            </div>
          ))}
        </div>

        <DaySelector days={days} redirectTo="/valasztas" />

        {/* Info sáv */}
        <div className="mt-10 grid grid-cols-3 gap-3 text-center">
          {[
            { Icon: MapPin, text: "Salakhegyi út 14." },
            { Icon: Clock, text: "K–P 8:00–17:00" },
            { Icon: ShoppingBag, text: "Személyes átvétel" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex flex-col items-center gap-2 rounded-[16px] border border-[#ede8df] bg-white px-2 py-4">
              <Icon className="h-4 w-4 text-[#c79a66]" />
              <p className="font-sans text-xs text-[#7c5a46]">{text}</p>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
