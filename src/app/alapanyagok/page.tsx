import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Alapanyagok – Kata Kenyere | Tudd, mi van a kenyeredben",
  description: "Liszt, víz, só, kovász. Semmi más. Megmutatjuk, honnan jön az alapanyagunk, hogyan kelesztünk, és mi az, ami soha nem kerül bele.",
  alternates: { canonical: "https://katakenyere.hu/alapanyagok" },
  openGraph: {
    title: "Alapanyagok – Kata Kenyere",
    description: "Négy alapanyag, nulla adalékanyag. Tudd, mi van a kenyeredben.",
    url: "https://katakenyere.hu/alapanyagok",
  },
};

const NINCS = [
  "Élesztő a kenyerekben",
  "Emulgeátor",
  "Tartósítószer",
  "Adalékanyag",
  "Javítószer",
  "Hozzáadott glutén",
];

export default function AlapanyagokPage() {
  return (
    <div className="min-h-screen bg-[#F4F2EC] text-[#2C1F14]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] px-6 pb-16 pt-24 text-center md:px-8">
        <ScrollReveal variant="up">
          <p className="mb-5 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#9c6f3a]">
            Alapanyagok
          </p>
          <h1 className="font-serif text-[clamp(2.4rem,5vw,3.4rem)] leading-[1.15] text-[#2C1F14]">
            Semmi rejtett.<br />
            <em className="italic text-[#9c6f3a]">Semmi felesleges.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-[500px] font-sans text-[1rem] font-light leading-[1.85] text-[#6b5a47]">
            Tudjuk, mi van a kenyereinkben és a péksüteményeinkben. Azt akarjuk, hogy te is tudd.
            Nem azért, mert muszáj, hanem mert így csináljuk.
          </p>
        </ScrollReveal>
      </section>

      {/* ── A kovász ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto max-w-[860px]">
          <ScrollReveal variant="up">
            <p className="mb-5 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#9c6f3a]">
              A kovász
            </p>
          </ScrollReveal>

          <div className="grid items-start gap-12 md:grid-cols-2">
            <ScrollReveal variant="up" delay={40}>
              <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.15] text-[#2C1F14]">
                Ez nem csak<br />
                <em className="italic text-[#9c6f3a]">egy alapanyag.</em>
              </h2>
              <p className="mt-5 text-[0.92rem] leading-[1.85] text-[#6b5a47]">
                2018-ban összekevertem lisztet és vizet, és valami elindult. Mozgott, nőtt,
                dolgoztak benne a gombák és a baktériumok. Az a kovász azóta is él.
                Naponta etetjük, gondozzuk, minden kenyerünkben az van.
              </p>
              <p className="mt-4 text-[0.92rem] leading-[1.85] text-[#6b5a47]">
                A kovász az egyetlen kelesztőszer, amit a kenyereinkhez használunk.
                Természetes erjedés útján könnyíti az emésztést, előemésztődik a glutén,
                és ez adja azt a mély, összetett ízt, ami semmivel sem pótolható.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="scale" delay={100}>
              <div className="rounded-xl border border-[rgba(156,111,58,0.2)] bg-[rgba(156,111,58,0.06)] p-7">
                <div className="font-serif text-[3.5rem] font-light leading-none text-[#9c6f3a]">
                  2018
                </div>
                <p className="mb-5 mt-1 font-sans text-[0.75rem] font-medium tracking-[0.05em] text-[#2C1F14]">
                  Az első kovász, ami azóta is él
                </p>
                {[
                  "Naponta etetjük és gondozzuk",
                  "Természetes erjedés",
                  "18–24 óra alatt a glutén előemésztődik",
                  "Egyedi, mély íz",
                ].map((sor) => (
                  <div key={sor} className="mb-3 flex items-start gap-3">
                    <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9c6f3a]" />
                    <p className="text-[0.82rem] leading-[1.6] text-[#6b5a47]">{sor}</p>
                  </div>
                ))}
                <blockquote className="mt-5 border-l-2 border-[#9c6f3a] pl-5">
                  <p className="font-serif text-[1.1rem] italic leading-[1.6] text-[#2C1F14]">
                    {`„Összekevertem a lisztet és a vizet — és ebből élet lett."`}
                  </p>
                </blockquote>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Liszt, víz, só ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto max-w-[860px]">
          <ScrollReveal variant="up">
            <p className="mb-4 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#9c6f3a]">
              A kenyereink
            </p>
            <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.15] text-[#2C1F14]">
              A 3 alapanyag.<br />
              <em className="italic text-[#9c6f3a]">Semmi több, semmi kevesebb.</em>
            </h2>
            <p className="mt-4 text-[0.92rem] leading-[1.85] text-[#6b5a47]">
              Ha kérdezed, mi van a kenyeredben, bármikor tudunk válaszolni.
            </p>
          </ScrollReveal>

          <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[rgba(156,111,58,0.2)] bg-[rgba(156,111,58,0.2)] sm:grid-cols-3">
            {[
              {
                cim: "Liszt",
                szoveg: "Magyar malmokból. Fehér kenyérhez BL-80 kenyérliszt a Marosmalmomból, teljes kiőrlésűhöz BIOM köves bio malomból őrölt búzaliszt.",
              },
              {
                cim: "Víz",
                szoveg: "Csapvíz, de pontosan kimért hőmérsékleten és mennyiségben, mert a tészta hidratációja határozza meg, milyen lesz a bélzet szerkezete.",
              },
              {
                cim: "Só",
                szoveg: "Tengeri só, adalékmentes. Az ízért, valamint azért van benne, mert erősíti a gluténszerkezetet. Semmi más nem kerül bele.",
              },
            ].map((k, i) => (
              <ScrollReveal key={k.cim} variant="up" delay={i * 60} className="h-full">
                <div className="h-full bg-[#F4F2EC] px-7 py-8">
                  <h3 className="font-serif text-[1.25rem] leading-[1.15] text-[#2C1F14]">{k.cim}</h3>
                  <p className="mt-3 text-[0.88rem] leading-[1.85] text-[#6b5a47]">{k.szoveg}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Idő mint alapanyag ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] bg-[rgba(156,111,58,0.04)] px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto max-w-[860px]">
          <ScrollReveal variant="up">
            <p className="mb-4 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#9c6f3a]">
              Az idő mint alapanyag
            </p>
            <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.15] text-[#2C1F14]">
              18–24 óra.<br />
              <em className="italic text-[#9c6f3a]">Ez a titkunk.</em>
            </h2>
            <p className="mt-4 text-[0.92rem] leading-[1.85] text-[#6b5a47]">
              Egy kenyér nálunk nem készül el pár óra alatt. Az érlelést nem siettetjük, mert nem lehet.
            </p>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={80}>
            <div className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-[rgba(156,111,58,0.2)] bg-[rgba(156,111,58,0.2)] sm:grid-cols-3">
              <div className="flex flex-col bg-[rgba(156,111,58,0.07)] px-6 py-7">
                <p className="mb-2 font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#9c6f3a]">Dagasztás</p>
                <p className="font-serif text-[1.9rem] leading-none text-[#2C1F14]">Este</p>
                <p className="mt-2 font-sans text-[0.78rem] leading-[1.6] text-[#6b5a47]">előformázás, pihentetés</p>
              </div>
              <div className="flex flex-col bg-[rgba(156,111,58,0.13)] px-6 py-7">
                <p className="mb-2 font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#9c6f3a]">Hűtőkamra</p>
                <p className="font-serif text-[1.9rem] leading-none text-[#2C1F14]">12–18 óra</p>
                <p className="mt-2 font-sans text-[0.78rem] leading-[1.6] text-[#6b5a47]">lassú érlelés, a glutén előemésztődik</p>
              </div>
              <div className="flex flex-col bg-[#9c6f3a] px-6 py-7">
                <p className="mb-2 font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[rgba(244,242,236,0.7)]">Kemence</p>
                <p className="font-serif text-[1.9rem] leading-none text-[#F4F2EC]">Reggel</p>
                <p className="mt-2 font-sans text-[0.78rem] leading-[1.6] text-[rgba(244,242,236,0.7)]">frissen, neked</p>
              </div>
            </div>
            <p className="mt-4 font-sans text-[0.82rem] italic text-[#6b5a47]">
              A tésztát nézzük, nem az órát. Addig várunk, ameddig el nem készül.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Péksütemények ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] px-6 py-28 md:px-8 xl:px-10">
        <div className="mx-auto max-w-[860px]">
          <ScrollReveal variant="up">
            <p className="mb-4 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#9c6f3a]">
              Péksütemények
            </p>
          </ScrollReveal>

          <div className="grid items-start gap-12 md:grid-cols-2">
            <ScrollReveal variant="up" delay={40}>
              <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.15] text-[#2C1F14]">
                A péksüteményeinket<br />
                <em className="italic text-[#9c6f3a]">sem siettetjük.</em>
              </h2>
              <p className="mt-5 text-[0.92rem] leading-[1.85] text-[#6b5a47]">
                A kiflit, perecet, csigákat és apró péktermékeinket este dagasztjuk, másnap pedig kisütjük.
                Minimális élesztővel, hosszú érleléssel, mert hisszük, az ízben megérződik.
              </p>
              <p className="mt-4 text-[0.92rem] leading-[1.85] text-[#6b5a47]">
                A töltelékek háziasak és frissek. Semmi tartósított.
              </p>
            </ScrollReveal>

            <ScrollReveal variant="up" delay={100}>
              <div className="flex flex-col gap-3">
                {[
                  { bold: "Kifli, perec", rest: "— liszt, tej, tojás, só, cukor, minimális élesztő" },
                  { bold: "Csigák, apró péktermékek", rest: "— házi töltelék, semmi hozzáadott adalék" },
                  { bold: "Magvas feltétek", rest: "— tökmag, len, napraforgó, szezám" },
                ].map((item) => (
                  <div
                    key={item.bold}
                    className="flex items-start gap-3 rounded-xl border border-[rgba(156,111,58,0.2)] bg-[rgba(156,111,58,0.06)] px-5 py-4"
                  >
                    <div className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#9c6f3a]" />
                    <p className="text-[0.85rem] leading-[1.6] text-[#6b5a47]">
                      <strong className="font-medium text-[#2C1F14]">{item.bold}</strong>
                      {item.rest}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Ami nincs benne — sötét szekció ── */}
      <section className="px-6 py-20 md:px-8 xl:px-10" style={{ backgroundColor: "#3B2010" }}>
        <div className="mx-auto max-w-[860px]">
          <ScrollReveal variant="up">
            <p className="mb-4 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#c9975a]">
              Ami nincs benne
            </p>
            <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.5rem)] leading-[1.15] text-[#F4F2EC]">
              Mikor elkezdtem a saját<br />
              kenyeremet enni,{" "}
              <em className="italic text-[#c9975a]">akkor tűnt fel.</em>
            </h2>
            <p className="mt-5 max-w-[520px] font-sans text-[0.92rem] font-light leading-[1.8] text-[rgba(244,242,236,0.55)]">
              Addig fel sem tűnt, mi van a boltiban. Aztán egyszer csak nem tudtam visszamenni.
              Azóta nálunk ezek sosem kerültek bele, és nem is fognak.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {NINCS.map((item, i) => (
              <ScrollReveal key={item} variant="up" delay={i * 40}>
                <div className="flex items-center gap-3 rounded-xl border border-[rgba(244,242,236,0.1)] bg-[rgba(255,255,255,0.06)] px-4 py-3.5">
                  <div className="relative h-3.5 w-3.5 shrink-0">
                    <div className="absolute left-1/2 top-1/2 h-[1.5px] w-[9px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm bg-[#c9975a]" />
                    <div className="absolute left-1/2 top-1/2 h-[1.5px] w-[9px] -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-sm bg-[#c9975a]" />
                  </div>
                  <span className="font-sans text-[0.82rem] font-light text-[rgba(244,242,236,0.65)]">
                    {item}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal variant="up" delay={160}>
            <blockquote className="mt-10 border-l-2 border-[#c9975a] pl-6">
              <p className="font-serif text-[1.1rem] italic leading-[1.6] text-[rgba(244,242,236,0.85)]">
                {`„Nem azért csináljuk, mert ez most divat. Hanem mert soha nem is tettünk bele. Nem szokásunk."`}
              </p>
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Allergének ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] px-6 py-14 md:px-8 xl:px-10">
        <div className="mx-auto max-w-[860px]">
          <ScrollReveal variant="up">
            <div className="flex items-start gap-4 rounded-xl border border-[rgba(156,111,58,0.2)] p-6">
              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#9c6f3a]" />
              <div>
                <p className="mb-1 font-sans text-[0.85rem] font-medium text-[#2C1F14]">Allergének</p>
                <p className="text-[0.83rem] leading-[1.75] text-[#6b5a47]">
                  Termékeink tartalmaznak{" "}
                  <strong className="font-medium text-[#2C1F14]">glutént</strong>{" "}
                  (búza, rozs, tönköly). Egyes termékek szezánt, napraforgót és lenmagot
                  tartalmaznak. Ha allergiád vagy intoleranciád van, kérdezz bátran,
                  szívesen segítünk megtalálni a számodra megfelelő terméket.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-28 text-center md:px-8">
        <ScrollReveal variant="up">
          <div className="mx-auto mb-6 h-px w-10 bg-[#9c6f3a]" />
          <p className="mb-3 font-sans text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[#9c6f3a]">
            Frissességre időzített előrendelés
          </p>
          <h2 className="font-serif text-[clamp(2rem,4vw,2.8rem)] leading-[1.15] text-[#2C1F14]">
            Kóstold meg te is.<br />
            <em className="italic text-[#9c6f3a]">Frissen sütjük neked.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[380px] text-[0.92rem] leading-[1.85] text-[#6b5a47]">
            Válaszd ki a napot, add le a rendelésedet, és vedd át személyesen Pécsen, amikor valóban neked készül el.
          </p>
          <Link
            href="/elorendeles"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#9c6f3a] px-8 py-[0.95rem] font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(156,111,58,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8a6030] hover:shadow-[0_14px_32px_rgba(156,111,58,0.42)]"
          >
            Előrendelés indítása
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </ScrollReveal>
      </section>
    </div>
  );
}
