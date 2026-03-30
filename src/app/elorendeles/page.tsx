import Image from "next/image";
import Link from "next/link";
import DaySelector from "@/components/DaySelector";
import { supabaseAdmin } from "@/lib/supabase/server";
import { MapPin, Clock, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kovászos kenyér előrendelés online – Pécs",
  description:
    "Rendeld meg előre kedvenc kovászos kenyered Pécsről! Válassz napot, állítsd össze a kosarad, mi frissen kisütjük. Átvétel: Salakhegyi út 14., K–P 8–17h.",
  alternates: {
    canonical: "https://katakenyere.hu/elorendeles",
  },
  openGraph: {
    title: "Kovászos kenyér előrendelés – Kata Kenyere, Pécs",
    description: "Válassz napot, állítsd össze a kosarad – mi frissen kisütjük neked.",
    url: "https://katakenyere.hu/elorendeles",
  },
};

function formatHatarido(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const month = d.toLocaleDateString("hu-HU", { month: "long" });
  const day = d.getDate();
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${month} ${day}., ${hour}:${min}-ig`;
}

export default async function ElorendelesPage() {
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
    <div className="min-h-screen bg-cream">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gold/20">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/images/logo.png" alt="Kata Kenyere" width={36} height={36} />
          <span className="font-serif text-sm text-brown-dark hidden sm:block">Kata Kenyere</span>
        </Link>
        <Link href="/termekek" className="font-sans text-xs text-brown/50 hover:text-brown transition-colors">
          ← Kínálatunk
        </Link>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        {/* Fejléc */}
        <div className="text-center mb-10">
          <div className="w-10 h-px bg-gold mx-auto mb-6" />
          <h1 className="font-serif text-4xl text-brown-dark mb-3">
            Melyik napra<br />
            <em className="text-gold italic">rendelsz?</em>
          </h1>
          <p className="font-sans text-brown/60 text-sm leading-relaxed">
            Válassz egy vagy több napot – a termékeket<br className="hidden sm:block" /> a következő lépésben választhatod ki.
          </p>
        </div>

        <DaySelector days={days} redirectTo="/valasztas" />

        {/* Info kártyák */}
        <div className="mt-10 grid grid-cols-3 gap-3 text-center">
          {[
            { Icon: MapPin, text: "Salakhegyi út 14." },
            { Icon: Clock, text: "K–P 8:00–17:00" },
            { Icon: ShoppingBag, text: "Személyes átvétel" },
          ].map(({ Icon, text }) => (
            <div key={text} className="bg-cream-dark rounded-xl py-4 px-2 flex flex-col items-center gap-2">
              <Icon className="w-4 h-4 text-gold" />
              <p className="font-sans text-xs text-brown/60">{text}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
