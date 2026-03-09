import Link from "next/link";
import Navbar from "@/components/Navbar";
import { AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Adalékanyagmentes kovászos kenyér – Alapanyagaink",
  description:
    "Kovász, liszt, víz, só – ennyi. Tudd meg pontosan miből sütjük a kenyerünket. Természetes alapanyagok, tartósítószer és javítószer nélkül. Kata Kenyere, Pécs.",
  alternates: {
    canonical: "https://katakenyere.hu/alapanyagok",
  },
  openGraph: {
    title: "Természetes alapanyagok – Kata Kenyere kovászos pékség",
    description: "Kovász, liszt, víz, só. Semmi más. Tudd pontosan mi van a kenyeredben.",
    url: "https://katakenyere.hu/alapanyagok",
  },
};

const ALAPANYAGOK = [
  {
    nev: "Kovász",
    leiras:
      "Az egyetlen kelesztőszer amit használunk. A mi kovászunk évek óta él – naponta etetjük, gondozzuk. Természetes erjedés útján teszi könnyebbé a kenyeret és adja azt az egyedi savanykás ízt.",
  },
  {
    nev: "Liszt",
    leiras:
      "Magyar malmok lisztjét használjuk. A fehér kenyereinkhez BL-80 kenyérlisztet, a teljes kiőrlésű termékekhez 100%-os tönköly- vagy búzalisztet. Minden termékünknél feltüntetjük.",
  },
  {
    nev: "Víz",
    leiras:
      "Semmi különös – csapvíz. De a hőmérséklete és a mennyisége pontosan kiszámított. A tészta hidratációja határozza meg a bélzet szerkezetét.",
  },
  {
    nev: "Só",
    leiras:
      "Tengeri só, adalékanyag nélkül. Az ízért és a gluténszerkezet erősítéséért van benne – semmi más.",
  },
  {
    nev: "Magvak & feltétek",
    leiras:
      "A magvas kenyereinkbe napraforgó, len, tökmag, szezám kerül – mind nyersen, előkészítve. A csigákba házi lekvár, kakaó és fahéj.",
  },
];

const NINCS_LISTA = [
  "Élesztő",
  "Emulgeátor",
  "Tartósítószer",
  "Adalékanyag",
  "Javítószer",
  "Glutén hozzáadva (csak ami természetesen benne van a lisztben)",
];

export default function AlapanyagokPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* FEJLÉC */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-10 h-px bg-gold mx-auto mb-5" />
          <h1 className="font-serif text-4xl text-brown-dark mb-4">Alapanyagok</h1>
          <p className="font-sans text-brown/60 leading-relaxed max-w-xl mx-auto">
            Tudjuk mi van a kenyerünkben – és azt akarjuk, hogy te is tudd. Egyszerű lista, semmi rejtett összetevő.
          </p>
        </div>
      </section>

      {/* ÖSSZETEVŐK */}
      <section className="px-6 pb-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {ALAPANYAGOK.map((item, i) => (
            <div key={item.nev} className="flex gap-5 bg-cream-dark rounded-xl p-6">
              <div className="w-9 h-9 rounded-full border border-gold/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-serif text-sm text-gold font-semibold">{i + 1}</span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-brown-dark mb-1">{item.nev}</h3>
                <p className="font-sans text-sm text-brown/70 leading-relaxed">{item.leiras}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NEM TARTALMAZ */}
      <section className="py-16 px-6 bg-brown-dark">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <h2 className="font-serif text-3xl text-cream mb-3">Ami nincs benne</h2>
            <p className="font-sans text-cream/50 text-sm">Nincs, soha nem volt, soha nem lesz.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {NINCS_LISTA.map((item) => (
              <div key={item} className="flex items-center gap-3 bg-cream/5 border border-cream/10 rounded-xl px-5 py-3">
                <svg className="w-5 h-5 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="font-sans text-sm text-cream/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ALLERGEN INFO */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-gold/10 border border-gold/30 rounded-2xl p-6">
            <div className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-lg bg-gold/20 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-gold" />
              </div>
              <div>
                <h3 className="font-serif text-lg text-brown-dark mb-2">Allergének</h3>
                <p className="font-sans text-sm text-brown/70 leading-relaxed">
                  Termékeink tartalmaznak <strong>glutént</strong> (búza, rozs, tönköly). Egyes termékek szezánt, napraforgót, lenmagot tartalmaznak. Ha allergiád vagy intoleranciád van, kérdezz bátran – szívesen segítünk megtalálni a számodra megfelelő terméket.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-cream-dark text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="font-serif text-3xl text-brown-dark mb-3">
            Kóstold meg te is
          </h2>
          <p className="font-sans text-brown/60 mb-8">
            Rendeld meg előre és mi frissen kisütjük neked.
          </p>
          <Link
            href="/elorendeles"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-bold text-base bg-brown-dark text-cream hover:bg-brown transition-colors"
          >
            Előrendelés
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
