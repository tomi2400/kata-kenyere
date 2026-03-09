import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { TERMEKEK } from "@/lib/products";

export const metadata: Metadata = {
  title: "Kézműves kovászos pékség Pécsett – Kata Kenyere",
  description:
    "Pécs kézműves kovászos pékségéből rendelhetsz előre friss kenyeret, csigát, kiflit. Adalékanyagmentes, természetes kovász. Kedd–Péntek, Salakhegyi út 14.",
  alternates: {
    canonical: "https://katakenyere.hu",
  },
  openGraph: {
    title: "Kata Kenyere – Kovászos kenyér Pécs, előrendelésre",
    description:
      "Kézzel formázott, kovásszal kelesztett pékáruk frissen. Rendelj online, vedd át személyesen Pécsett.",
    url: "https://katakenyere.hu",
  },
};

const REVIEWS = [
  {
    nev: "Péter Fekete",
    szoveg: "A fővárosból érkeztem, kerestem Pécsen kovászos kenyeret. A magvasat választottam – nagyon finom bélzet, kiváló mag tészta. Csak ajánlani tudom!",
    csillag: 5,
    datum: "1 hónapja",
  },
  {
    nev: "Emese Zentai",
    szoveg: "Na ez a csiga – kenyér nem kérdés. Puha, illatos, tökéletesen meg van sütve, és minden falatban ott van a minőség és a szeretet.",
    csillag: 5,
    datum: "5 napja",
  },
  // TODO: add remaining 2 reviews
  {
    nev: "Vélemény 3",
    szoveg: "Hamarosan...",
    csillag: 5,
    datum: "",
  },
  {
    nev: "Vélemény 4",
    szoveg: "Hamarosan...",
    csillag: 5,
    datum: "",
  },
];

const KINALAT_PREVIEW = TERMEKEK.slice(0, 4);

function StarRating({ n }: { n: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-gold fill-gold" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar transparent />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[90vh] flex items-end">
        <Image
          src="/images/termek-placeholder.jpg"
          alt="Kata Kenyere kovászos kenyér"
          fill
          className="object-cover hero-fade"
          priority
        />
        {/* Gradient alulról és felülről is – navbar területe is sötét */}
        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark via-brown-dark/55 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/50 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-20 md:pb-28">
          <p className="hero-tag font-sans text-[0.65rem] tracking-[0.25em] text-gold/80 uppercase mb-5">
            Kézműves kovászos pékség · Pécs
          </p>
          <h1 className="hero-title font-serif text-[clamp(3rem,8vw,5.5rem)] text-cream leading-[0.95] mb-5 max-w-xl">
            Frissen,
            <br />
            <em className="text-gold italic">kézzel,</em>
            <br />
            szeretettel.
          </h1>
          <p className="hero-body font-sans text-cream/65 text-base sm:text-lg max-w-sm mb-9 leading-relaxed">
            Előrendelhetsz online, vagy beugorhatsz személyesen –
            K–P minden nap frissen sütünk.
          </p>
          <div className="hero-cta flex flex-wrap gap-3">
            <Link
              href="/elorendeles"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-sans font-bold text-sm bg-gold text-brown-dark hover:bg-gold-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Előrendelés
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/termekek"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-sans font-semibold text-sm border border-cream/25 text-cream/80 hover:border-cream/50 hover:text-cream transition-colors"
            >
              Kínálatunk
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ INFO SÁV ═══ */}
      <section className="bg-brown-dark border-b border-cream/10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex flex-wrap items-center gap-x-5 gap-y-1">
          <span className="font-sans text-xs text-cream/55">Pécs, Salakhegyi út 14.</span>
          <span className="text-cream/20 text-xs hidden sm:block">·</span>
          <span className="font-sans text-xs text-cream/55">Kedd–Péntek&nbsp;&nbsp;8:00–17:00</span>
          <span className="text-cream/20 text-xs hidden sm:block">·</span>
          <span className="font-sans text-xs text-gold/70">Online előrendelés és személyes vétel</span>
        </div>
      </section>

      {/* ═══ MIÉRT MI ═══ */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <ScrollReveal className="md:sticky md:top-28">
              <div className="w-10 h-px bg-gold mb-6" />
              <h2 className="font-serif text-[clamp(2rem,4vw,2.75rem)] text-brown-dark mb-6 leading-[1.1]">
                Minden kenyérben
                <br />
                <em className="text-gold italic">benne van a munkánk.</em>
              </h2>
              <p className="font-sans text-brown/65 leading-relaxed mb-8 text-[0.9375rem]">
                Nem futószalagon, nem gyorsítva – minden cipót kézzel formázunk, természetes kovásszal kelesztünk. Ez több időt vesz igénybe, de az eredmény más. Ezt akkor érted meg, amikor beleharapsz.
              </p>
              <Link
                href="/rolunk"
                className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brown-dark border-b border-gold pb-px hover:border-brown-dark transition-colors"
              >
                Ismerd meg történetünket →
              </Link>
            </ScrollReveal>

            <div className="grid grid-cols-2 gap-5">
              {[
                { cim: "Kovászos kelesztés", szoveg: "Természetes kovász, élesztő és adalékanyag nélkül." },
                { cim: "Kézzel formázva", szoveg: "Gép nem érinti a tésztát – minden cipó kézzel kerül formájába." },
                { cim: "Naponta frissen", szoveg: "Előrendelésre és személyes vásárlásra egyaránt sütünk K–P." },
                { cim: "Tiszta alapanyag", szoveg: "Tudjuk, mi van benne. Kérdezz bátran." },
              ].map(({ cim, szoveg }, i) => (
                <ScrollReveal key={cim} delay={(i + 1) as 1 | 2 | 3 | 4}>
                  <div className="border-l-2 border-gold/35 pl-4 py-1">
                    <p className="font-serif text-[0.9375rem] text-brown-dark mb-1.5 leading-snug">{cim}</p>
                    <p className="font-sans text-xs text-brown/55 leading-relaxed">{szoveg}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SZÁMOK ═══ */}
      <section className="bg-brown-dark py-14 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6 sm:gap-12">
          {[
            { szam: "~300", szoveg: "kenyér naponta" },
            { szam: "100%", szoveg: "természetes alapanyag" },
            { szam: "2 nap", szoveg: "előre rendelhető" },
          ].map(({ szam, szoveg }, i) => (
            <ScrollReveal key={szoveg} delay={(i + 1) as 1 | 2 | 3}>
              <div className="text-center sm:text-left">
                <p className="font-serif text-[clamp(2rem,5vw,3.5rem)] text-cream leading-none mb-2">{szam}</p>
                <p className="font-sans text-[0.65rem] text-cream/35 uppercase tracking-widest">{szoveg}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══ TERMÉK ELŐNÉZET ═══ */}
      <section className="py-20 px-6 bg-cream-dark">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="w-10 h-px bg-gold mb-4" />
                <h2 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] text-brown-dark">Kínálatunkból</h2>
              </div>
              <Link
                href="/termekek"
                className="font-sans text-sm text-brown/50 hover:text-brown-dark transition-colors hidden sm:block"
              >
                Teljes kínálat →
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {KINALAT_PREVIEW.map((termek, i) => (
              <ScrollReveal key={termek.id} delay={(Math.min(i + 1, 4)) as 1 | 2 | 3 | 4}>
                <div className="rounded-xl overflow-hidden bg-cream group transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={termek.foto}
                      alt={termek.nev}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="font-serif text-sm font-semibold text-brown-dark leading-snug">{termek.nev}</p>
                    <p className="font-sans text-xs text-brown/45 mt-0.5">{termek.egyseg}</p>
                    <p className="font-sans text-sm font-bold text-brown-dark mt-1.5">
                      {termek.ar.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal>
            <div className="flex gap-3">
              <Link
                href="/termekek"
                className="flex-1 sm:flex-none py-3 px-6 rounded-xl font-sans font-semibold text-sm border border-brown-dark/20 text-brown-dark hover:border-brown-dark transition-colors text-center"
              >
                Teljes kínálat →
              </Link>
              <Link
                href="/elorendeles"
                className="flex-1 sm:flex-none py-3 px-6 rounded-xl font-sans font-bold text-sm bg-gold text-brown-dark hover:bg-gold-light transition-colors text-center"
              >
                Előrendelés →
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ GOOGLE REVIEWS ═══ */}
      <section className="py-24 px-6 bg-brown-dark">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal className="text-center mb-14">
            <div className="w-10 h-px bg-gold/50 mx-auto mb-6" />
            <h2 className="font-serif text-[clamp(1.75rem,4vw,2.5rem)] text-cream mb-3">
              Amit vendégeink írtak
            </h2>
            <div className="flex items-center justify-center gap-2">
              <StarRating n={5} />
              <span className="font-sans text-cream/45 text-sm">5,0 · 4 Google értékelés</span>
            </div>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-5 mb-10">
            {REVIEWS.filter(r => r.szoveg !== "Hamarosan...").map((review, i) => (
              <ScrollReveal key={review.nev} delay={(i + 1) as 1 | 2}>
                <div className="relative bg-cream/[0.06] rounded-2xl p-7 pt-9">
                  <span className="absolute top-4 left-6 font-serif text-6xl leading-none text-gold/15 select-none" aria-hidden="true">
                    &ldquo;
                  </span>
                  <p className="font-sans text-cream/70 text-[0.9rem] leading-relaxed mb-5 relative">
                    {review.szoveg}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-cream/10">
                    <div>
                      <p className="font-sans text-sm font-semibold text-cream">{review.nev}</p>
                      <StarRating n={review.csillag} />
                    </div>
                    {review.datum && (
                      <p className="font-sans text-xs text-cream/30">{review.datum}</p>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="text-center">
            <a
              href="https://g.page/r/kata-kenyere/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-sans text-sm text-gold/70 hover:text-gold transition-colors"
            >
              Írj te is véleményt a Google-n →
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ CTA SZEKCIÓ ═══ */}
      <section className="py-28 px-6 bg-cream text-center">
        <ScrollReveal className="max-w-xl mx-auto">
          <Image
            src="/images/logo.png"
            alt="Kata Kenyere"
            width={48}
            height={48}
            className="mx-auto mb-8 opacity-60"
          />
          <h2 className="font-serif text-[clamp(2rem,5vw,3rem)] text-brown-dark mb-5 leading-[1.1]">
            Rendeld meg előre –
            <br />
            <em className="text-gold italic">mi frissen kisütjük.</em>
          </h2>
          <p className="font-sans text-brown/55 mb-10 leading-relaxed max-w-sm mx-auto">
            Add le a rendelésed legalább két nappal korábban – az átvétel reggelén sütjük ki.
          </p>
          <Link
            href="/elorendeles"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-sans font-bold text-sm bg-brown-dark text-cream hover:bg-brown transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown-dark focus-visible:ring-offset-2"
          >
            Előrendelés indítása
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="font-sans text-xs text-brown/30 mt-5">
            Átvétel személyesen · Pécs, Salakhegyi út 14.
          </p>
        </ScrollReveal>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-brown-dark border-t border-cream/10 py-10 px-6">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 gap-8">
          <div>
            <Image src="/images/logo.png" alt="Kata Kenyere" width={40} height={40} className="mb-3 opacity-80" />
            <p className="font-sans text-xs text-cream/40 leading-relaxed">
              Kézműves kovászos pékség.<br />
              Pécs, Salakhegyi út 14.<br />
              K–P: 8:00–17:00
            </p>
          </div>
          <div>
            <p className="font-sans text-xs text-cream/30 uppercase tracking-wider mb-3">Oldalak</p>
            <div className="space-y-2">
              {[
                { href: "/termekek", label: "Termékek" },
                { href: "/rolunk", label: "Rólunk" },
                { href: "/alapanyagok", label: "Alapanyagok" },
                { href: "/kapcsolat", label: "Kapcsolat" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="block font-sans text-sm text-cream/50 hover:text-cream/80 transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-sans text-xs text-cream/30 uppercase tracking-wider mb-3">Rendelés</p>
            <div className="space-y-2">
              <Link href="/elorendeles" className="block font-sans text-sm text-gold hover:text-gold-light transition-colors font-medium">
                Előrendelés →
              </Link>
              <Link href="/impresszum" className="block font-sans text-sm text-cream/50 hover:text-cream/80 transition-colors">Impresszum</Link>
              <Link href="/adatvedelmi" className="block font-sans text-sm text-cream/50 hover:text-cream/80 transition-colors">Adatvédelem</Link>
            </div>
          </div>
        </div>
        <div className="max-w-5xl mx-auto mt-8 pt-6 border-t border-cream/10 text-center">
          <p className="font-sans text-xs text-cream/20">© 2026 Kata Kenyere · Minden jog fenntartva</p>
        </div>
      </footer>
    </div>
  );
}
