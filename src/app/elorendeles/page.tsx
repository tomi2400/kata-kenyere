import Image from "next/image";
import Link from "next/link";
import DaySelector from "@/components/DaySelector";
import { getAvailableOrderDays } from "@/lib/deadline";

export const metadata = {
  title: "Előrendelés – Kata Kenyere",
  description: "Rendeld meg előre kedvenc kovászos kenyered! Válaszd ki a napot és állítsd össze a kosarad.",
};

export default function ElorendelesPage() {
  const days = getAvailableOrderDays();

  return (
    <div className="min-h-screen bg-cream">
      {/* HEADER – egyszerű, nem distract */}
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
            <em className="text-gold not-italic">rendelsz?</em>
          </h1>
          <p className="font-sans text-brown/60 text-sm leading-relaxed">
            Válassz egy vagy több napot – a termékeket<br className="hidden sm:block" /> a következő lépésben választhatod ki.
          </p>
        </div>

        <DaySelector days={days} redirectTo="/valasztas" />

        {/* Info kártyák */}
        <div className="mt-10 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: "📍", text: "Salakhegyi út 14." },
            { icon: "🕐", text: "K–P 8:00–17:00" },
            { icon: "🏠", text: "Személyes átvétel" },
          ].map((item) => (
            <div key={item.text} className="bg-cream-dark rounded-xl py-3 px-2">
              <div className="text-lg mb-1">{item.icon}</div>
              <p className="font-sans text-xs text-brown/60">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Rendelési határidők */}
        <div className="mt-6 bg-brown-dark rounded-xl p-4">
          <p className="font-sans text-xs text-cream/40 uppercase tracking-wider mb-3">Rendelési határidők</p>
          <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
            {[
              { nap: "Keddre", hatarido: "vasárnap 17:00-ig" },
              { nap: "Szerdára", hatarido: "hétfőig 17:00-ig" },
              { nap: "Csütörtökre", hatarido: "kedd 17:00-ig" },
              { nap: "Péntekre", hatarido: "szerdáig 17:00-ig" },
            ].map((item) => (
              <div key={item.nap} className="flex gap-1 items-baseline">
                <span className="font-sans text-xs font-semibold text-cream">{item.nap}</span>
                <span className="font-sans text-xs text-cream/40">→ {item.hatarido}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
