import Link from "next/link";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Adalékanyagmentes kovászos kenyér – Alapanyagaink",
  description: "Kovász, liszt, víz, só – ennyi. Tudd meg pontosan miből sütjük a kenyerünket. Természetes alapanyagok, tartósítószer és javítószer nélkül.",
  alternates: { canonical: "https://katakenyere.hu/alapanyagok" },
  openGraph: {
    title: "Természetes alapanyagok – Kata Kenyere kovászos pékség",
    description: "Kovász, liszt, víz, só. Semmi más. Tudd pontosan mi van a kenyeredben.",
    url: "https://katakenyere.hu/alapanyagok",
  },
};

const ALAPANYAGOK = [
  { nev: "Kovász", leiras: "Az egyetlen kelesztőszer amit használunk. A mi kovászunk évek óta él – naponta etetjük, gondozzuk. Természetes erjedés útján teszi könnyebbé a kenyeret és adja azt az egyedi savanykás ízt." },
  { nev: "Liszt", leiras: "Magyar malmok lisztjét használjuk. A fehér kenyereinkhez BL-80 kenyérlisztet, a teljes kiőrlésű termékekhez 100%-os tönköly- vagy búzalisztet. Minden termékünknél feltüntetjük." },
  { nev: "Víz", leiras: "Semmi különös – csapvíz. De a hőmérséklete és a mennyisége pontosan kiszámított. A tészta hidratációja határozza meg a bélzet szerkezetét." },
  { nev: "Só", leiras: "Tengeri só, adalékanyag nélkül. Az ízért és a gluténszerkezet erősítéséért van benne – semmi más." },
  { nev: "Magvak & feltétek", leiras: "A magvas kenyereinkbe napraforgó, len, tökmag, szezám kerül – mind nyersen, előkészítve. A csigákba házi lekvár, kakaó és fahéj." },
];

const NINCS_LISTA = [
  "Élesztő", "Emulgeátor", "Tartósítószer", "Adalékanyag", "Javítószer",
  "Glutén hozzáadva (csak ami természetesen benne van a lisztben)",
];

export default function AlapanyagokPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] grain-overlay text-[#4b2e1f]">
      <Navbar />

      {/* Hero */}
      <section className="px-6 py-16 text-center md:px-8 xl:px-10">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal variant="up">
            <div className="mx-auto mb-5 h-px w-10 bg-[#d0af77]" />
            <h1 className="font-serif text-[2.6rem] leading-[1.05] text-[#3d2314] md:text-[3.2rem]">Alapanyagok</h1>
            <p className="mx-auto mt-4 max-w-xl text-[0.95rem] leading-relaxed text-[#7c5a46]">
              Tudjuk mi van a kenyerünkben – és azt akarjuk, hogy te is tudd.
              Egyszerű lista, semmi rejtett összetevő.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Lista */}
      <section className="px-6 pb-16 md:px-8 xl:px-10">
        <div className="mx-auto max-w-3xl space-y-4">
          {ALAPANYAGOK.map((item, i) => (
            <ScrollReveal key={item.nev} variant="up" delay={i * 60}>
              <div className="flex gap-5 rounded-[20px] border border-[#ede8df] bg-white p-6">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d0af77]/40 bg-[#c79a66]/8">
                  <span className="font-serif text-sm font-semibold text-[#c79a66]">{i + 1}</span>
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#3d2314]">{item.nev}</h3>
                  <p className="mt-1.5 text-[0.875rem] leading-relaxed text-[#7c5a46]">{item.leiras}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Ami nincs benne */}
      <section className="bg-[#3e2315] px-6 py-16 md:px-8 xl:px-10">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal variant="up">
            <div className="mb-10 text-center">
              <div className="mx-auto mb-5 h-px w-10 bg-[#d0af77]" />
              <h2 className="font-serif text-[2rem] text-[#fff5ea]">Ami nincs benne</h2>
              <p className="mt-2 font-sans text-sm text-[#e8d6c0]/50">Nincs, soha nem volt, soha nem lesz.</p>
            </div>
          </ScrollReveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {NINCS_LISTA.map((item, i) => (
              <ScrollReveal key={item} variant="up" delay={i * 50}>
                <div className="flex items-center gap-3 rounded-[16px] border border-[#fff5ea]/10 bg-white/5 px-5 py-3.5">
                  <svg className="h-4 w-4 shrink-0 text-[#d0af77]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-sans text-sm text-[#e8d6c0]/80">{item}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Allergének */}
      <section className="px-6 py-14 md:px-8 xl:px-10">
        <div className="mx-auto max-w-3xl">
          <ScrollReveal variant="scale">
            <div className="rounded-[20px] border border-[#c79a66]/25 bg-[#c79a66]/6 p-6">
              <div className="flex gap-4">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c79a66]/15">
                  <AlertTriangle className="h-4 w-4 text-[#c79a66]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg text-[#3d2314]">Allergének</h3>
                  <p className="mt-2 text-[0.875rem] leading-relaxed text-[#7c5a46]">
                    Termékeink tartalmaznak <strong>glutént</strong> (búza, rozs, tönköly). Egyes termékek szezánt,
                    napraforgót, lenmagot tartalmaznak. Ha allergiád vagy intoleranciád van, kérdezz bátran –
                    szívesen segítünk megtalálni a számodra megfelelő terméket.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 text-center md:px-8 xl:px-10">
        <ScrollReveal variant="up">
          <div className="mx-auto max-w-lg">
            <h2 className="font-serif text-[2rem] text-[#3d2314]">Kóstold meg te is</h2>
            <p className="mt-3 font-sans text-[0.9rem] text-[#7c5a46]">Rendeld meg előre és mi frissen kisütjük neked.</p>
            <Link
              href="/elorendeles"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#c79a66] px-8 py-[0.95rem] font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(199,154,102,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b98b58]"
            >
              Előrendelés
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
