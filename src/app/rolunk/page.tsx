import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MapPin, Clock, Phone, Mail, Clock3, Wheat, Flame, Leaf, Heart } from "lucide-react";

export const metadata = {
  title: "Rólunk – Kata Kenyere",
  description: "Ismerd meg Kata Kenyere történetét – kézműves kovászos pékség Pécsről.",
};

export default function RolunkPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* HERO */}
      <section className="relative h-72 sm:h-96 flex items-end">
        <Image
          src="/images/termek-placeholder.jpg"
          alt="Kata Kenyere műhely"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/90 via-brown-dark/40 to-transparent" />
        <div className="relative z-10 max-w-5xl mx-auto px-6 pb-10 w-full">
          <div className="w-10 h-px bg-gold mb-4" />
          <h1 className="font-serif text-4xl sm:text-5xl text-cream">Rólunk</h1>
        </div>
      </section>

      {/* TÖRTÉNET */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-10 h-px bg-gold mb-5" />
            <h2 className="font-serif text-3xl text-brown-dark mb-5 leading-tight">
              Kata és a<br />
              <em className="text-gold not-italic">kovász szerelme.</em>
            </h2>
            <p className="font-sans text-brown/70 leading-relaxed mb-4">
              Minden reggel 4-kor kezdődik a munka, mire te reggel megérkezel, a kenyér már sül. Kata a kovásszal való munkát hivatásnak tekinti – nem termelésnek, hanem alkotásnak.
            </p>
            <p className="font-sans text-brown/70 leading-relaxed mb-4">
              A Kata Kenyere 2023-ban indult egy egyszerű felismeréssel: Pécsnek szüksége van egy helyre, ahol valódi kovászos kenyeret kapnak az emberek. Nem gyorsítóval, nem adalékanyaggal – csak liszttel, vízzel, sóval és idővel.
            </p>
            <p className="font-sans text-brown/70 leading-relaxed">
              Ma már naponta 60-80 kenyeret sütünk, de minden darab ugyanolyan figyelmet kap, mint az első.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="/images/termek-placeholder.jpg"
              alt="Kata a pékségben"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ÉRTÉKEK */}
      <section className="py-20 px-6 bg-cream-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <h2 className="font-serif text-3xl text-brown-dark">Amit hiszünk</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                Icon: Clock3,
                cim: "Az idő az alapanyag",
                szoveg: "A kovász 12–18 óra alatt érik. Nem lehet gyorsítani. Ez a titok.",
              },
              {
                Icon: Wheat,
                cim: "Kézbe vesszük",
                szoveg: "Minden cipót kézzel formázunk. A gép nem érzi, mikor van kész a tészta.",
              },
              {
                Icon: Flame,
                cim: "Csak annyit sütünk",
                szoveg: "Amennyi előrendelés érkezik, annyit sütünk. Nincs maradék, nincs hulladék.",
              },
              {
                Icon: Leaf,
                cim: "Tudjuk mi van benne",
                szoveg: "Liszt, víz, só, kovász. Ha kérdezed mi van a kenyeredben, tudunk válaszolni.",
              },
              {
                Icon: MapPin,
                cim: "Helyi büszkeség",
                szoveg: "Pécsi pékség, pécsi embereknek. A helyi alapanyag is prioritás nálunk.",
              },
              {
                Icon: Heart,
                cim: "Szeretettel csináljuk",
                szoveg: "Nem melóból sütjük. Ez a munkánk és a szenvedélyünk egyszerre.",
              },
            ].map(({ Icon, cim, szoveg }) => (
              <div key={cim} className="bg-cream rounded-xl p-6">
                <Icon className="w-5 h-5 text-gold mb-4" />
                <p className="font-serif text-base font-semibold text-brown-dark mb-2">{cim}</p>
                <p className="font-sans text-sm text-brown/60 leading-relaxed">{szoveg}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HELYSZÍN */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-cream-dark rounded-2xl p-8">
            <p className="font-sans text-xs text-brown/40 uppercase tracking-wider mb-4">Látogass meg minket</p>
            <div className="space-y-4">
              {[
                { Icon: MapPin, label: "Cím", value: "Pécs, Salakhegyi út 14." },
                { Icon: Clock, label: "Nyitvatartás", value: "Kedd – Péntek: 8:00–17:00" },
                { Icon: Phone, label: "Telefon", value: "+36 ....." },
                { Icon: Mail, label: "Email", value: "hello@katakenyere.hu" },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4">
                  <Icon className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                  <div>
                    <p className="font-sans text-xs text-brown/40 uppercase tracking-wider">{label}</p>
                    <p className="font-sans text-sm text-brown-dark font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2">
            <div className="w-10 h-px bg-gold mb-5" />
            <h2 className="font-serif text-3xl text-brown-dark mb-5 leading-tight">
              Gyere be hozzánk,<br />
              <em className="text-gold not-italic">szívesen látunk.</em>
            </h2>
            <p className="font-sans text-brown/70 leading-relaxed mb-6">
              A pékség Pécs csendesebb részén, a Salakhegyi úton található. Ha átmész, friss kenyérillat fogad – és Kata biztosan szívesen mesél a nap sütéséről.
            </p>
            <Link
              href="/elorendeles"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-sans font-bold text-sm bg-brown-dark text-cream hover:bg-brown transition-colors"
            >
              Előrendelés
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
