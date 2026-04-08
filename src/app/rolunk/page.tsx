import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, MapPin, Clock, Phone, Mail, Clock3, Wheat, Flame, Leaf, Heart } from "lucide-react";

export const metadata = {
  title: "Kézműves kovászos pékség Pécsről – A mi történetünk",
  description: "Kata és csapata minden reggel 4-kor kezd, hogy te reggel friss kenyeret kaphass. Ismerd meg a pécsi kézműves kovászos pékség mögött álló embereket és értékeket.",
  alternates: { canonical: "https://katakenyere.hu/rolunk" },
  openGraph: {
    title: "Rólunk – Kata Kenyere kovászos pékség Pécs",
    description: "A kovász, az idő és a kéz munkája – ez a Kata Kenyere.",
    url: "https://katakenyere.hu/rolunk",
  },
};

const ERTEKEK = [
  { Icon: Clock3, cim: "Az idő az alapanyag", szoveg: "A kovász 12–18 óra alatt érik. Nem lehet gyorsítani. Ez a titok." },
  { Icon: Wheat, cim: "Kézbe vesszük", szoveg: "Minden cipót kézzel formázunk. A gép nem érzi, mikor van kész a tészta." },
  { Icon: Flame, cim: "Csak annyit sütünk", szoveg: "Amennyi előrendelés érkezik, annyit sütünk. Nincs maradék, nincs hulladék." },
  { Icon: Leaf, cim: "Tudjuk mi van benne", szoveg: "Liszt, víz, só, kovász. Ha kérdezed mi van a kenyeredben, tudunk válaszolni." },
  { Icon: MapPin, cim: "Helyi büszkeség", szoveg: "Pécsi pékség, pécsi embereknek. A helyi alapanyag is prioritás nálunk." },
  { Icon: Heart, cim: "Szeretettel csináljuk", szoveg: "Nem melóból sütjük. Ez a munkánk és a szenvedélyünk egyszerre." },
];

export default function RolunkPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] grain-overlay text-[#4b2e1f]">
      <Navbar />

      {/* Hero fotó */}
      <section className="relative flex h-72 items-end overflow-hidden sm:h-96">
        <Image src="/images/DSC00042.JPG" alt="Kata Kenyere műhely" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,14,10,0.18)_0%,rgba(21,14,10,0.72)_100%)]" />
        <div className="relative z-10 w-full px-6 pb-10 md:px-8 xl:px-10">
          <div className="mx-auto max-w-5xl">
            <div className="mb-4 h-px w-10 bg-[#d0af77]" />
            <h1 className="font-serif text-[2.8rem] text-[#fff5ea] md:text-[3.6rem]">Rólunk</h1>
          </div>
        </div>
      </section>

      {/* Történet */}
      <section className="px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <ScrollReveal variant="up">
            <div className="mb-5 h-px w-10 bg-[#d0af77]" />
            <h2 className="font-serif text-[2rem] leading-tight text-[#3d2314] md:text-[2.6rem]">
              Kata és a<br />
              <span className="text-[#d0af77]">kovász szerelme.</span>
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-[#7c5a46]">
              Minden reggel 4-kor kezdődik a munka, mire te reggel megérkezel, a kenyér már sül.
              Kata a kovásszal való munkát hivatásnak tekinti – nem termelésnek, hanem alkotásnak.
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[#7c5a46]">
              A Kata Kenyere 2023-ban indult egy egyszerű felismeréssel: Pécsnek szüksége van egy helyre,
              ahol valódi kovászos kenyeret kapnak az emberek. Nem gyorsítóval, nem adalékanyaggal –
              csak liszttel, vízzel, sóval és idővel.
            </p>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[#7c5a46]">
              Ma már naponta 60–80 kenyeret sütünk, de minden darab ugyanolyan figyelmet kap, mint az első.
            </p>
          </ScrollReveal>
          <ScrollReveal variant="scale" delay={120}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px]">
              <Image src="/images/DSC00043.JPG" alt="Kata a pékségben" fill className="object-cover" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Értékek */}
      <section className="bg-white px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal variant="up">
            <div className="mb-12 text-center">
              <div className="mx-auto mb-5 h-px w-10 bg-[#d0af77]" />
              <h2 className="font-serif text-[2rem] text-[#3d2314] md:text-[2.6rem]">Amit hiszünk</h2>
            </div>
          </ScrollReveal>
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {ERTEKEK.map(({ Icon, cim, szoveg }, i) => (
              <ScrollReveal key={cim} variant="up" delay={i * 60}>
                <div className="rounded-[20px] border border-[#ede8df] bg-[#fafaf8] p-6">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#c79a66]/10">
                    <Icon className="h-[15px] w-[15px] text-[#c79a66]" />
                  </div>
                  <p className="font-serif text-[1.05rem] text-[#4b2e1f]">{cim}</p>
                  <p className="mt-2 text-[0.83rem] leading-relaxed text-[#7c5a46]">{szoveg}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Helyszín */}
      <section className="px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <ScrollReveal variant="scale" className="order-2 md:order-1">
            <div className="rounded-[20px] border border-[#ede8df] bg-white p-8">
              <p className="mb-5 font-sans text-[11px] uppercase tracking-[0.22em] text-[#9a7a5d]">Látogass meg minket</p>
              <div className="space-y-5">
                {[
                  { Icon: MapPin, label: "Cím", value: "Pécs, Salakhegyi út 14." },
                  { Icon: Clock, label: "Nyitvatartás", value: "Kedd – Péntek: 8:00–17:00" },
                  { Icon: Phone, label: "Telefon", value: "+36 ....." },
                  { Icon: Mail, label: "Email", value: "hello@katakenyere.hu" },
                ].map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c79a66]/10">
                      <Icon className="h-3.5 w-3.5 text-[#c79a66]" />
                    </div>
                    <div>
                      <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#9a7a5d]">{label}</p>
                      <p className="mt-0.5 font-sans text-sm font-medium text-[#4b2e1f]">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal variant="up" delay={120} className="order-1 md:order-2">
            <div className="mb-5 h-px w-10 bg-[#d0af77]" />
            <h2 className="font-serif text-[2rem] leading-tight text-[#3d2314] md:text-[2.6rem]">
              Gyere be hozzánk,<br />
              <span className="text-[#d0af77]">szívesen látunk.</span>
            </h2>
            <p className="mt-5 text-[0.95rem] leading-relaxed text-[#7c5a46]">
              A pékség Pécs csendesebb részén, a Salakhegyi úton található. Ha átmész, friss kenyérillat fogad –
              és Kata biztosan szívesen mesél a nap sütéséről.
            </p>
            <Link
              href="/elorendeles"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c79a66] px-7 py-[0.9rem] font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(199,154,102,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b98b58]"
            >
              Előrendelés
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
