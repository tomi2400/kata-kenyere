import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MapPin, Clock, Star, Wheat, Flame, Leaf, Heart } from "lucide-react";
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

const KINALAT_PREVIEW = TERMEKEK.slice(0, 8);

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
      <section className="relative min-h-[85vh] flex items-end">
        <Image
          src="/images/termek-placeholder.jpg"
          alt="Kata Kenyere kovászos kenyér"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/95 via-brown-dark/50 to-brown-dark/10" />
        <div className="absolute inset-0 bg-gradient-to-b from-brown-dark/40 via-transparent to-transparent" />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-16 md:pb-20">
          <p className="font-sans text-xs tracking-[0.2em] text-gold uppercase mb-4">
            Kézműves pékség · Pécs
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-cream leading-[1.05] mb-4 max-w-2xl">
            Frissen,
            <br />
            <em className="text-gold not-italic">kézzel,</em>
            <br />
            szeretettel.
          </h1>
          <p className="font-sans text-cream/75 text-lg max-w-md mb-8 leading-relaxed">
            Kovásszal kelesztett kenyerek és kézzel formázott pékáruk –
            minden nap frissen sütve.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/elorendeles"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-sans font-bold text-base bg-gold text-brown-dark hover:bg-gold-light transition-colors"
            >
              Előrendelés
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/termekek"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-sans font-semibold text-base border-2 border-cream/30 text-cream hover:border-cream/60 transition-colors"
            >
              Kínálatunk
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ INFO SÁV ═══ */}
      <section className="bg-brown-dark text-cream">
        <div className="max-w-5xl mx-auto px-6 py-4 flex flex-wrap gap-y-3 items-center justify-between">
          {[
            { Icon: MapPin, label: "Helyszín", value: "Pécs, Salakhegyi út 14." },
            { Icon: Clock, label: "Nyitvatartás", value: "K–P: 8:00–17:00" },
            { Icon: Star, label: "Google értékelés", value: "5,0 · 4 vélemény" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-gold shrink-0" />
              <div>
                <p className="text-xs text-cream/40 uppercase tracking-wider font-sans">{label}</p>
                <p className="font-sans text-sm font-medium">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MIÉRT MI ═══ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-10 h-px bg-gold mb-5" />
              <h2 className="font-serif text-4xl text-brown-dark mb-5 leading-tight">
                Minden termékben
                <br />
                <em className="text-gold not-italic">benne van a munkánk.</em>
              </h2>
              <p className="font-sans text-brown/70 leading-relaxed mb-6">
                Amit mi csinálunk, az kicsit több idő. De megéri.<br />
                Kenyereinket természetes kovásszal kelesztjük, kézzel formázzuk<br />
                – péksüteményeinket pedig ugyanezzel a gondossággal készítjük.<br />
                Nincs benne semmi trükk, csak türelem és jó alapanyag.
              </p>
              <Link
                href="/rolunk"
                className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brown-dark border-b-2 border-gold pb-0.5 hover:border-brown-dark transition-colors"
              >
                Ismerd meg történetünket →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { Icon: Wheat, cim: "Természetes kovász", szoveg: "Időt adunk a tésztának, nem adalékanyagot" },
                { Icon: Leaf, cim: "Kézzel, szívvel", szoveg: "Úgy készítjük, mintha a családunknak adnánk" },
                { Icon: Flame, cim: "Mindig frissen sütve", szoveg: "Csak annyit készítünk, amennyit rendeltek" },
                { Icon: Heart, cim: "Tiszta alapanyagok", szoveg: "Nálunk nincs mit rejtegetni" },
              ].map(({ Icon, cim, szoveg }) => (
                <div key={cim} className="bg-cream-dark rounded-xl p-4">
                  <Icon className="w-5 h-5 text-gold mb-3" />
                  <p className="font-serif text-sm font-semibold text-brown-dark mb-1">{cim}</p>
                  <p className="font-sans text-xs text-brown/60 leading-relaxed">{szoveg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TERMÉK ELŐNÉZET ═══ */}
      <section className="py-16 px-6 bg-cream-dark">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="w-10 h-px bg-gold mb-4" />
              <h2 className="font-serif text-3xl text-brown-dark">Kínálatunkból</h2>
            </div>
            <Link
              href="/termekek"
              className="font-sans text-sm text-brown/60 hover:text-brown-dark transition-colors hidden sm:block"
            >
              Teljes kínálat →
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 -mx-6 px-6 snap-x snap-mandatory scrollbar-none mb-6">
            {KINALAT_PREVIEW.map((termek) => (
              <div key={termek.id} className="rounded-xl overflow-hidden bg-cream shrink-0 w-[46vw] sm:w-56 snap-start">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={termek.foto}
                    alt={termek.nev}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 46vw, 224px"
                  />
                </div>
                <div className="p-3">
                  <p className="font-serif text-sm font-semibold text-brown-dark">{termek.nev}</p>
                  <p className="font-sans text-xs text-brown/50">{termek.egyseg}</p>
                  <p className="font-sans text-sm font-bold text-brown-dark mt-1">
                    {termek.ar.toLocaleString("hu-HU")} Ft
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Link
              href="/termekek"
              className="flex-1 sm:flex-none py-3 px-6 rounded-xl font-sans font-semibold text-sm border-2 border-brown-dark/20 text-brown-dark hover:border-brown-dark transition-colors text-center"
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
        </div>
      </section>

      {/* ═══ GOOGLE REVIEWS ═══ */}
      <section className="py-20 px-6 bg-brown-dark">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <h2 className="font-serif text-3xl text-cream mb-2">
              Amit vendégeink írtak
            </h2>
            <div className="flex items-center justify-center gap-2 mt-3">
              <StarRating n={5} />
              <span className="font-sans text-cream/60 text-sm">5,0 · 4 Google értékelés</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            {REVIEWS.filter(r => r.szoveg !== "Hamarosan...").map((review) => (
              <div key={review.nev} className="bg-cream/5 border border-cream/10 rounded-2xl p-5">
                <StarRating n={review.csillag} />
                <p className="font-sans text-cream/80 text-sm leading-relaxed mt-3 mb-4 italic">
                  &bdquo;{review.szoveg}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <p className="font-sans text-sm font-semibold text-cream">{review.nev}</p>
                  {review.datum && (
                    <p className="font-sans text-xs text-cream/40">{review.datum}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <a
              href="https://g.page/r/kata-kenyere/review"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-sans text-sm text-gold hover:text-gold-light transition-colors"
            >
              Írj te is véleményt a Google-n →
            </a>
          </div>
        </div>
      </section>

      {/* ═══ CTA SZEKCIÓ ═══ */}
      <section className="py-20 px-6 bg-cream text-center">
        <div className="max-w-xl mx-auto">
          <Image
            src="/images/logo.png"
            alt="Kata Kenyere"
            width={56}
            height={56}
            className="mx-auto mb-6 opacity-80"
          />
          <h2 className="font-serif text-4xl text-brown-dark mb-4">
            Rendeld meg előre,
            <br />
            <em className="text-gold not-italic">mi frissen kisütjük.</em>
          </h2>
          <p className="font-sans text-brown/60 mb-8 leading-relaxed">
            Válaszd ki a napot, állítsd össze a rendelésed!
          </p>
          <Link
            href="/elorendeles"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-bold text-base bg-brown-dark text-cream hover:bg-brown transition-colors"
          >
            Előrendelés indítása
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <p className="font-sans text-sm text-brown/60 mt-4 flex items-center justify-center gap-1.5">
            <svg className="w-4 h-4 text-gold shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            Átvétel személyesen · Pécs, Salakhegyi út 14.
          </p>
        </div>
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
