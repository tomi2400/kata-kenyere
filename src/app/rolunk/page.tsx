import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, MapPin, Clock } from "lucide-react";

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
  { num: "18–24h", cim: "Érlelési idő",       szoveg: "A kovász nem siet. Mi sem sietünk. Ennyi idő alatt a glutén előemésztődik, nem a szervezetnek kell lebontania." },
  { num: "4",      cim: "Alapanyag",           szoveg: "Liszt, víz, só, kovász. Ha kérdezed, mi van a kenyeredben, tudunk válaszolni. Pont ennyi, és pont elég." },
  { num: "1",      cim: "Az első kovász",      szoveg: "Amit 2018-ban csináltam, azóta is él. Nem dobtuk el és kezdtük újra, ugyanazt a kovász használjuk ma is." },
  { num: "0",      cim: "Adalékanyag",         szoveg: "Nulla. Nem azért, mert ez most divat. Hanem mert soha nem is tettünk bele. Nem szokásunk." },
  { num: "∞",      cim: "Kísérletezés",        szoveg: "Mindig van egy következő kísérlet. Ami beválik, az marad. Ami nem, az is megtanított valamit." },
  { num: "♥",      cim: "Olyat sütünk",        szoveg: "Amit a saját asztalunkra is felteszünk. Ez az egyetlen mérce, amit soha nem engedünk el." },
];

const CSAPAT = [
  { initial: "K",  nev: "Kata",   szerep: "Pék, alapító — és még mindig én vagyok a legszigorúbb a saját kenyereinkkel." },
  { initial: "M",  nev: "Máté",   szerep: "A nagyobbik fiam — a kávézón dolgozik, de a dagasztásban is segít." },
  { initial: "Mi", nev: "Misi",   szerep: "A spirulinás kenyér az ő ötlete volt. Nem lett termék, de legalább megpróbáltuk." },
  { initial: "H",  nev: "Hancsi", szerep: "Hancsi csinálja a leveles töltelékeket, nélküle nem mennének a péktermékeink." },
];

export default function RolunkPage() {
  return (
    <div className="min-h-screen bg-[#F4F2EC] text-[#2C1F14]">
      <Navbar />

      {/* ── Hero fotó — marad ── */}
      <section className="relative flex h-72 items-end overflow-hidden sm:h-96">
        <Image src="/images/DSC00042.JPG" alt="Kata Kenyere műhely" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,14,10,0.18)_0%,rgba(21,14,10,0.72)_100%)]" />
        <div className="relative z-10 w-full px-6 pb-10 md:px-8 xl:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="mb-4 h-px w-10 bg-[#9c6f3a]" />
            <h1 className="font-serif text-[2.8rem] leading-none text-[#fff5ea] md:text-[3.6rem]">Rólunk</h1>
          </div>
        </div>
      </section>

      {/* ── Hero szöveg ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] px-6 py-20 text-center md:px-8">
        <ScrollReveal variant="up">
          <p className="mb-6 font-sans text-[0.7rem] font-medium uppercase tracking-[0.18em] text-[#6b5a47]">
            Kata Kenyere — Pécs
          </p>
          <h2 className="font-serif text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.15] text-[#2C1F14]">
            Nem terveztük.<br />
            <em className="italic text-[#9c6f3a]">Csak elkezdtük.</em>
          </h2>
          <p className="mx-auto mt-6 max-w-[560px] font-sans text-[1.05rem] font-light leading-[1.8] text-[#6b5a47]">
            Egy édesanya, egy kovász és egy véletlenül összekevert tál liszt és víz története.
            Abból lett, ami most van.
          </p>
        </ScrollReveal>
      </section>

      {/* ── Így kezdődött ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal variant="up">
            <p className="mb-8 font-sans text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#9c6f3a]">
              Így kezdődött
            </p>
          </ScrollReveal>

          <div className="grid items-start gap-10 md:grid-cols-[3fr_2fr]">
            {/* bal oszlop */}
            <ScrollReveal variant="up" delay={60}>
              <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.15] text-[#2C1F14]">
                2018-ban összekevertem<br />
                <em className="italic text-[#9c6f3a]">lisztet meg vizet.</em>
              </h2>
              <p className="mt-5 text-[0.95rem] leading-[1.85] text-[#6b5a47]">
                Nem volt nagy terv mögötte. Otthon voltam a gyermekeimmel, minden nap sütöttem valamit
                a családnak — csigát, buktát, lepényt. Aztán egy gasztroblogon megláttam a kovász szót.
                Nem tudtam pontosan, mi az. Összekevertem a lisztet és a vizet, és néztem, mi lesz belőle.
              </p>
              <p className="mt-4 text-[0.95rem] leading-[1.85] text-[#6b5a47]">
                Lett belőle valami élő. Mozgott, nőtt, dolgoztak benne a gombák és a baktériumok.{" "}
                <strong className="font-medium text-[#2C1F14]">Olyan volt, mintha szerelmes lettem volna.</strong>{" "}
                Reggel szívdobogva keltem fel, hogy megetessem.
              </p>
              <blockquote className="my-7 border-l-2 border-[#9c6f3a] pl-6">
                <p className="font-serif text-[1.2rem] italic leading-[1.6] text-[#2C1F14]">
                  {`„Annyira meg kellett volna jegyeznem azt a pillanatot! Összekevertem a lisztet és a vizet — és ebből élet lett."`}
                </p>
              </blockquote>
              <p className="text-[0.95rem] leading-[1.85] text-[#6b5a47]">
                Az első kovász azóta is él. Ugyanaz, amit 2018-ban csináltam. Ma is azt használjuk.
              </p>
            </ScrollReveal>

            {/* jobb doboz — Kata képe */}
            <ScrollReveal variant="scale" delay={120}>
              <div className="overflow-hidden rounded-xl border border-[rgba(156,111,58,0.2)] bg-[rgba(156,111,58,0.06)] p-5">
                <div className="mb-4 overflow-hidden rounded-lg">
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg">
                    <Image
                      src="/images/DSC00043.JPG"
                      alt="Kata a pékségben"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <h3 className="font-serif text-[1.6rem] leading-[1.15] text-[#2C1F14]">Öt hónap az első kenyérig.</h3>
                <p className="mt-3 text-[0.95rem] leading-[1.85] text-[#6b5a47]">
                  Sokan vannak, akik elkezdik és két hét után feladják. Én öt hónapig próbáltam.
                  Nem jött össze. A kovász élt, a kenyér nem lett jó. Tanultam, videókat néztem,
                  recepteket olvastam, csatlakoztam a Kovászlabor csoporthoz.
                </p>
                <p className="mt-3 text-[0.95rem] leading-[1.85] text-[#6b5a47]">
                  Aztán egyszer kijött a kemencéből az első olyan kenyér, amit nem szégyelltem megmutatni.
                  Én nem szoktam posztolgatni, de ezt megosztottam, mert annyi vér és verejték volt benne, olyan őrült nagy dolognak tartottam!
                </p>
                <p className="mt-3 text-[0.95rem] leading-[1.85] text-[#6b5a47]">
                  <strong className="font-medium text-[#2C1F14]">Onnantól nem volt megállás.</strong>
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal variant="up">
            <p className="mb-4 font-sans text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#9c6f3a]">
              Hogyan jutottunk idáig
            </p>
            <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.15] text-[#2C1F14]">
              Patacstól<br />
              <em className="italic text-[#9c6f3a]">a Salakhegyi útig.</em>
            </h2>
          </ScrollReveal>

          <div className="mt-8 flex flex-col">
            {[
              {
                year: "2018",
                cim: "Az első kovász",
                szoveg: "Otthon voltam a gyermekeimmel. Összekevertem a lisztet és a vizet. Öt hónapba telt, mire az első kenyér valóban sikerült. Az óvónők voltak az első vevőim — ők kértek először tőlem kenyeret.",
              },
              {
                year: "→",
                cim: "A patacsi szuterén",
                szoveg: "15–20 négyzetméter, egy kis pince. Ott kezdtük el igazán. Kézzel, kicsiben, minden nap. Nem volt mindig egyszerű, de mindig megoldódott.",
              },
              {
                year: "2023",
                cim: "Megnyílt a pékség",
                szoveg: "Kinőttük a szuterént. Átköltöztünk a Salakhegyi útra, ahol ma is vagyunk. A férjem vállalkozása működött itt korábban — átalakítottuk pékségnek. Az első három hónap nagyon húzós volt: hajnali háromkor keltem, hétre értem haza.",
              },
              {
                year: "Ma",
                cim: "Ami most épül",
                szoveg: "Már a következő lépésen dolgozunk. Hamarosan megnyílik a kávézónk a szomszédban, ahol a saját pékáruink mellett helyi termelői különlegességek is helyet kapnak. Mert mindig van hova fejlődni.",
              },
            ].map((item, i) => (
              <ScrollReveal key={item.year + item.cim} variant="up" delay={i * 60}>
                <div className="grid grid-cols-[70px_1fr] gap-8 border-b border-[rgba(156,111,58,0.2)] py-7 last:border-b-0 md:grid-cols-[90px_1fr]">
                  <div className="font-serif text-[1.8rem] font-medium leading-none text-[#9c6f3a] pt-0.5">
                    {item.year}
                  </div>
                  <div>
                    <p className="mb-1 font-sans text-[0.85rem] font-medium text-[#2C1F14]">{item.cim}</p>
                    <p className="text-[0.92rem] leading-[1.85] text-[#6b5a47]">{item.szoveg}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Értékek rács ── */}
      <section id="ertekek" className="border-b border-[rgba(156,111,58,0.2)] px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal variant="up">
            <p className="mb-4 font-sans text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#9c6f3a]">
              Amiben hiszünk
            </p>
            <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.15] text-[#2C1F14]">
              Nincs benne trükk.<br />
              <em className="italic text-[#9c6f3a]">Csak idő és szeretet.</em>
            </h2>
          </ScrollReveal>

          <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[rgba(156,111,58,0.2)] bg-[rgba(156,111,58,0.2)] md:grid-cols-3">
            {ERTEKEK.map((e, i) => (
              <ScrollReveal key={e.cim} variant="up" delay={i * 40} className="h-full">
                <div className="h-full bg-[#F4F2EC] p-7">
                  <div className="mb-2 font-serif text-[2.6rem] font-light leading-none text-[#9c6f3a]">
                    {e.num}
                  </div>
                  <p className="mb-2 font-sans text-[0.85rem] font-medium text-[#2C1F14]">{e.cim}</p>
                  <p className="text-[0.82rem] leading-[1.65] text-[#6b5a47]">{e.szoveg}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Csapat ── */}
      <section className="border-b border-[rgba(156,111,58,0.2)] px-6 py-20 md:px-8 xl:px-10">
        <div className="mx-auto max-w-4xl">
          <ScrollReveal variant="up">
            <p className="mb-4 font-sans text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#9c6f3a]">
              A csapat
            </p>
            <h2 className="font-serif text-[clamp(1.9rem,3.5vw,2.6rem)] leading-[1.15] text-[#2C1F14]">
              Egy igazi<br />
              <em className="italic text-[#9c6f3a]">családi vállalkozás.</em>
            </h2>
            <p className="mt-4 max-w-[540px] text-[0.95rem] leading-[1.85] text-[#6b5a47]">
              Négy gyermekem van, a férjemmel hatan vagyunk. Nem munkának hívjuk, ez az életünk.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {CSAPAT.map((p, i) => (
              <ScrollReveal key={p.nev} variant="up" delay={i * 60}>
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-[#9c6f3a] font-serif text-[1.2rem] font-medium text-[#9c6f3a]">
                    {p.initial}
                  </div>
                  <p className="font-sans text-[0.9rem] font-medium text-[#2C1F14]">{p.nev}</p>
                  <p className="mt-1 text-[0.78rem] leading-[1.5] text-[#6b5a47]">{p.szerep}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Záró CTA ── */}
      <section className="px-6 py-24 text-center md:px-8">
        <ScrollReveal variant="up">
          <h2 className="font-serif text-[clamp(2rem,4vw,2.8rem)] leading-[1.15] text-[#2C1F14]">
            Gyere be.<br />
            <em className="italic text-[#9c6f3a]">Szívesen mesélünk.</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[440px] text-[0.95rem] leading-[1.85] text-[#6b5a47]">
            Ha megérkezel, friss kenyérillat fogad. Ennél több ígéretünk nincs, de ennél több nem is kell.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/elorendeles"
              className="inline-flex items-center gap-2 rounded-full bg-[#9c6f3a] px-8 py-[0.9rem] font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(156,111,58,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8a6030]"
            >
              Előrendelés
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <div className="flex items-center gap-6 text-[0.82rem] text-[#6b5a47]">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-[#9c6f3a]" />
                Salakhegyi út 14.
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-[#9c6f3a]" />
                K–P 8–17
              </span>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
