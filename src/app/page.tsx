import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import Navbar from "@/components/Navbar";
import { MapPin, Clock, Star, Wheat, Flame, Leaf, Heart } from "lucide-react";
import { type Termek, getTermekFoto } from "@/lib/products";
import { supabase } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kata Kenyere – Kézműves pékség Pécsett",
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

export default async function Home() {
  noStore();

  const { data: termekekRaw } = await supabase
    .from("termekek")
    .select("id, slug, nev, leiras, kategoria, ar, egyseg, foto_url, sorrend")
    .eq("aktiv", true)
    .order("sorrend")
    .limit(8);
  const KINALAT_PREVIEW: Termek[] = termekekRaw ?? [];
  return (
    <div className="min-h-screen bg-cream grain-overlay">
      <Navbar transparent />

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen overflow-hidden flex items-end">
        <Image
          src="/images/DSC00039.JPG"
          alt="Kata Kenyere pékség enteriőr"
          fill
          className="object-cover hero-zoom"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,14,10,0.24)_0%,rgba(20,14,10,0.1)_28%,rgba(20,14,10,0.28)_58%,rgba(20,14,10,0.78)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(20,14,10,0.18)_100%)]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-8 md:pb-10 pt-28 md:pt-36">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#d7b287] reveal-up">
                Kézműves pékség · Pécs
              </p>
              <h1 className="mt-5 max-w-2xl font-serif text-[clamp(3.3rem,7vw,5.6rem)] leading-[0.92] text-cream reveal-soft delay-1">
                Frissen, <em className="text-[#e2c19b] not-italic">kézzel,</em>
                <br />
                szeretettel.
              </h1>
              <p className="mt-6 max-w-lg text-base leading-8 text-cream/72 reveal-up delay-2">
                Kovásszal kelesztett kenyerek és kézzel formázott pékáruk
                <br className="hidden sm:block" />
                {" "}– minden nap frissen sütve, természetes alapanyagokból.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 reveal-up delay-3">
                <Link
                  href="/elorendeles"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3.5 font-sans text-sm font-bold text-brown-dark shadow-[0_18px_40px_rgba(31,20,12,0.2)] transition-all hover:bg-gold-light hover-lift"
                >
                  Előrendelés
                </Link>
                <Link
                  href="/termekek"
                  className="inline-flex items-center gap-2 rounded-full border border-cream/20 bg-white/5 px-6 py-3.5 font-sans text-sm font-medium text-cream transition-all hover:border-cream/40 hover:bg-white/10 hover-lift"
                >
                  Kínálatunk
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <aside className="self-end justify-self-start lg:justify-self-end text-left lg:text-right text-cream reveal-up delay-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-cream/48">Nyitvatartás</p>
                <p className="mt-3 text-sm leading-7 text-cream/76">Kedd – Péntek</p>
                <p className="mt-1 font-serif text-4xl leading-none text-cream">8:00–17:00</p>
              </div>
              <p className="mt-8 text-sm leading-7 text-cream/56">
                Pécs, Salakhegyi út 14.
              </p>
            </aside>
          </div>

          <div className="mt-10 reveal-up delay-4">
            <div className="overflow-hidden rounded-[22px] border border-white/10 bg-[rgba(52,38,28,0.58)] shadow-[0_24px_60px_rgba(15,10,7,0.22)] backdrop-blur-md">
              <div className="grid md:grid-cols-3">
                {[
                  { label: "Helyszín", value: "Pécs, Salakhegyi út 14." },
                  { label: "Nyitvatartás", value: "K–P: 8:00–17:00" },
                  { label: "Google értékelés", value: "5,0 · 4 vélemény" },
                ].map(({ label, value }, index) => (
                  <div
                    key={label}
                    className={`px-6 py-5 text-cream ${index !== 2 ? "md:border-r md:border-white/10" : ""}`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cream/42">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-cream/82">{value}</p>
                    {label === "Google értékelés" ? (
                      <div className="mt-2">
                        <StarRating n={5} />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ INFO SÁV ═══ */}
      <section className="relative -mt-px bg-[linear-gradient(180deg,#130e0b_0%,#221813_100%)] text-cream">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap gap-x-8 gap-y-4 items-center justify-between">
          {[
            { Icon: MapPin, label: "Átvétel", value: "Személyesen Pécsen" },
            { Icon: Clock, label: "Nyitvatartás", value: "K–P: 8:00–17:00" },
            { Icon: Star, label: "Vélemény", value: "5,0 · Google értékelések" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3 reveal-up hover-lift">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-cream/12 bg-cream/6">
                <Icon className="h-4 w-4 text-gold shrink-0" />
              </span>
              <div>
                <p className="text-[11px] text-cream/38 uppercase tracking-[0.2em] font-sans">{label}</p>
                <p className="font-sans text-sm font-medium text-cream/84">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ MIÉRT MI ═══ */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="reveal-up">
              <div className="w-10 h-px bg-gold mb-5" />
              <h2 className="font-serif text-4xl md:text-5xl text-brown-dark mb-5 leading-tight">
                Minden termékben
                <br />
                <em className="text-gold not-italic">benne van a munkánk.</em>
              </h2>
              <p className="max-w-xl font-sans text-brown/70 leading-8 mb-6">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 reveal-scale delay-2">
              {[
                { Icon: Wheat, cim: "Természetes kovász", szoveg: "Időt adunk a tésztának, nem adalékanyagot" },
                { Icon: Leaf, cim: "Kézzel, szívvel", szoveg: "Úgy készítjük, mintha a családunknak adnánk" },
                { Icon: Flame, cim: "Mindig frissen sütve", szoveg: "Csak annyit készítünk, amennyit rendeltek" },
                { Icon: Heart, cim: "Tiszta alapanyagok", szoveg: "Nálunk nincs mit rejtegetni" },
              ].map(({ Icon, cim, szoveg }) => (
                <div key={cim} className="paper-panel rounded-[24px] p-5 hover-lift">
                  <Icon className="w-5 h-5 text-gold mb-3" />
                  <p className="font-serif text-base font-semibold text-brown-dark mb-1">{cim}</p>
                  <p className="font-sans text-sm text-brown/60 leading-7">{szoveg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TERMÉK ELŐNÉZET ═══ */}
      <section className="py-24 px-6 bg-[linear-gradient(180deg,#efe4cf_0%,#e8d7bc_100%)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
            <div className="reveal-up">
              <div className="w-10 h-px bg-gold mb-4" />
              <h2 className="font-serif text-3xl md:text-5xl text-brown-dark">Kínálatunkból</h2>
              <p className="mt-3 max-w-lg font-sans text-sm leading-7 text-brown/65">
                A rendelhető termékeket mindig az aktuális kínálatból mutatjuk, hogy a választás gyors és biztos maradjon.
              </p>
            </div>
            <Link
              href="/termekek"
              className="font-sans text-sm text-brown/60 hover:text-brown-dark transition-colors hidden sm:block"
            >
              Teljes kínálat →
            </Link>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-3 -mx-6 px-6 snap-x snap-mandatory scrollbar-none mb-6 reveal-soft delay-1">
            {KINALAT_PREVIEW.map((termek) => (
              <div key={termek.slug} className="paper-panel rounded-[28px] overflow-hidden shrink-0 w-[72vw] sm:w-[280px] snap-start hover-lift">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={getTermekFoto(termek)}
                    alt={termek.nev}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-[1.04]"
                    sizes="(max-width: 640px) 72vw, 280px"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brown-dark/30 to-transparent" />
                </div>
                <div className="p-5">
                  <p className="font-serif text-xl font-semibold text-brown-dark">{termek.nev}</p>
                  <p className="mt-1 font-sans text-sm text-brown/50">{termek.egyseg}</p>
                  <p className="font-sans text-base font-bold text-brown-dark mt-3">
                    {termek.ar.toLocaleString("hu-HU")} Ft
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 reveal-up delay-2">
            <Link
              href="/termekek"
              className="flex-1 sm:flex-none py-3.5 px-6 rounded-full font-sans font-semibold text-sm border border-brown-dark/20 text-brown-dark hover:border-brown-dark transition-colors text-center"
            >
              Teljes kínálat →
            </Link>
            <Link
              href="/elorendeles"
              className="flex-1 sm:flex-none py-3.5 px-6 rounded-full font-sans font-bold text-sm bg-brown-dark text-cream hover:bg-brown transition-colors text-center"
            >
              Előrendelés →
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ GOOGLE REVIEWS ═══ */}
      <section className="py-24 px-6 bg-[linear-gradient(180deg,#1a130f_0%,#2a1d16_100%)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 reveal-up">
            <div className="w-10 h-px bg-gold mx-auto mb-5" />
            <h2 className="font-serif text-3xl md:text-5xl text-cream mb-2">
              Amit vendégeink írtak
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-cream/56">
              A legjobb visszajelzés számunkra az, hogy újra visszajönnek érte. Ezek a sorok is ezt mutatják.
            </p>
            <div className="flex items-center justify-center gap-2 mt-5">
              <StarRating n={5} />
              <span className="font-sans text-cream/60 text-sm">5,0 · 4 Google értékelés</span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 mb-8 reveal-soft delay-1">
            {REVIEWS.filter(r => r.szoveg !== "Hamarosan...").map((review) => (
              <div key={review.nev} className="glass-panel rounded-[28px] p-6 hover-lift">
                <StarRating n={review.csillag} />
                <p className="font-sans text-cream/80 text-base leading-8 mt-4 mb-5 italic">
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

          <div className="text-center reveal-up delay-2">
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
      <section className="py-24 px-6 bg-cream text-center">
        <div className="paper-panel max-w-3xl mx-auto rounded-[36px] px-6 py-12 sm:px-10 reveal-scale">
          <Image
            src="/images/logo.png"
            alt="Kata Kenyere"
            width={56}
            height={56}
            className="mx-auto mb-6 opacity-80"
          />
          <h2 className="font-serif text-4xl md:text-5xl text-brown-dark mb-4">
            Rendeld meg előre,
            <br />
            <em className="text-gold not-italic">mi frissen kisütjük.</em>
          </h2>
          <p className="mx-auto max-w-xl font-sans text-brown/60 mb-8 leading-8">
            Válaszd ki a napot, állítsd össze a rendelésed, és gyere érte akkor, amikor valóban elkészül neked.
          </p>
          <Link
            href="/elorendeles"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-sans font-bold text-base bg-brown-dark text-cream hover:bg-brown transition-colors hover-lift"
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
