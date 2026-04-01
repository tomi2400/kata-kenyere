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
  const actualReviews = REVIEWS.filter((review) => review.szoveg !== "Hamarosan...").slice(0, 2);

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f5edd9_16%,#f1e6d2_54%,#f5edd9_100%)] grain-overlay">
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
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,14,10,0.34)_0%,rgba(20,14,10,0.18)_26%,rgba(20,14,10,0.34)_58%,rgba(20,14,10,0.84)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(226,193,155,0.2)_0%,transparent_30%),radial-gradient(circle_at_82%_14%,rgba(255,255,255,0.12)_0%,transparent_24%),radial-gradient(circle_at_center,transparent_34%,rgba(20,14,10,0.18)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent_0%,rgba(20,14,10,0.24)_32%,rgba(245,237,217,0.9)_88%,#f5edd9_100%)]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pb-10 md:pb-14 pt-28 md:pt-36">
          <div className="grid items-end gap-12 lg:grid-cols-[minmax(0,1fr)_240px]">
            <div className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#d7b287] reveal-up">
                Kézműves pékség · Pécs
              </p>
              <h1 className="mt-6 max-w-3xl font-serif text-[clamp(3.8rem,8vw,6.4rem)] leading-[0.88] tracking-[-0.04em] text-cream reveal-soft delay-1">
                Frissen, <em className="text-[#e2c19b] not-italic">kézzel,</em>
                <br />
                szeretettel.
              </h1>
              <p className="mt-7 max-w-xl text-[clamp(1.02rem,1.55vw,1.14rem)] leading-8 text-cream/84 reveal-up delay-2">
                Kovásszal kelesztett kenyerek és kézzel formázott pékáruk
                <br className="hidden sm:block" />
                {" "}– minden nap frissen sütve, természetes alapanyagokból.
              </p>
              <div className="mt-10 flex flex-wrap gap-4 reveal-up delay-3">
                <Link
                  href="/elorendeles"
                  className="inline-flex min-w-[11.5rem] items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 font-sans text-sm font-bold text-brown-dark shadow-[0_20px_42px_rgba(31,20,12,0.22)] transition-all hover:bg-gold-light hover-lift"
                >
                  Előrendelés
                </Link>
                <Link
                  href="/termekek"
                  className="inline-flex min-w-[11.5rem] items-center justify-center gap-2 rounded-full border border-cream/22 bg-white/8 px-7 py-4 font-sans text-sm font-medium text-cream transition-all hover:border-cream/40 hover:bg-white/12 hover-lift"
                >
                  Kínálatunk
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.25}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            <aside className="max-w-[240px] self-end justify-self-start lg:justify-self-end text-left text-cream reveal-up delay-3">
              <div className="border-l border-cream/16 pl-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cream/48">Átvétel és nyitvatartás</p>
                <p className="mt-3 text-sm leading-7 text-cream/78">Kedd – Péntek</p>
                <p className="mt-1 font-serif text-[2.3rem] leading-none text-cream">8:00–17:00</p>
                <p className="mt-5 text-sm leading-7 text-cream/62">
                  Pécs, Salakhegyi út 14.
                </p>
              </div>
            </aside>
          </div>

          <div className="mt-14 reveal-up delay-4">
            <div className="story-surface-dark inline-flex max-w-4xl flex-col gap-3 rounded-[30px] border border-white/12 px-5 py-4 md:flex-row md:items-center md:gap-0 md:rounded-full md:px-6">
              {[
                { Icon: Star, value: "5.0 Google értékelés" },
                { Icon: MapPin, value: "Átvétel Pécsen" },
                { Icon: Flame, value: "Minden nap frissen sütve" },
              ].map(({ Icon, value }, index) => (
                <div
                  key={value}
                  className={`flex items-center gap-3 text-cream/88 md:px-5 ${index !== 2 ? "md:border-r md:border-white/10" : ""}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="font-sans text-sm font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MIÉRT MI ═══ */}
      <section className="relative z-10 -mt-8 px-6 pb-24 pt-8 md:-mt-14 md:pb-28 md:pt-14">
        <div className="max-w-6xl mx-auto">
          <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-16">
            <div className="reveal-up">
              <div className="w-10 h-px bg-gold mb-5" />
              <p className="text-[11px] uppercase tracking-[0.22em] text-brown/48 mb-4">
                Bizalom és érték
              </p>
              <h2 className="font-serif text-4xl md:text-5xl text-brown-dark mb-5 leading-tight">
                Minden termékben
                <br />
                <em className="text-gold not-italic">benne van a munkánk.</em>
              </h2>
              <p className="max-w-xl font-sans text-brown/70 leading-8 mb-8">
                Amit mi csinálunk, az kicsit több idő. De megéri. Kenyereinket természetes
                kovásszal kelesztjük, kézzel formázzuk – péksüteményeinket pedig ugyanezzel a
                gondossággal készítjük. Nincs benne semmi trükk, csak türelem és jó alapanyag.
              </p>
              <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {[
                  { Icon: Wheat, cim: "Természetes kovász", szoveg: "Időt adunk a tésztának, nem adalékanyagot." },
                  { Icon: Leaf, cim: "Kézzel, szívvel", szoveg: "Úgy készítjük, mintha a családunknak adnánk." },
                  { Icon: Flame, cim: "Mindig frissen sütve", szoveg: "Csak annyit készítünk, amennyit valóban kértek." },
                  { Icon: Heart, cim: "Tiszta alapanyagok", szoveg: "Egyszerű, természetes összetevőkkel dolgozunk." },
                ].map(({ Icon, cim, szoveg }, index) => (
                  <div
                    key={cim}
                    className={`border-brown-dark/10 pt-4 ${index < 2 ? "border-t" : "border-t sm:border-t-0"}`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/55 text-gold shadow-[0_12px_30px_rgba(61,35,20,0.08)]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="font-serif text-lg text-brown-dark">{cim}</p>
                        <p className="mt-1 font-sans text-sm leading-7 text-brown/60">{szoveg}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/rolunk"
                className="mt-8 inline-flex items-center gap-2 font-sans text-sm font-semibold text-brown-dark border-b-2 border-gold pb-0.5 hover:border-brown-dark transition-colors"
              >
                Ismerd meg történetünket →
              </Link>
            </div>
            <div className="story-surface reveal-scale delay-2 rounded-[34px] px-6 py-7 sm:px-8 sm:py-8">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brown-dark/10 pb-5">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-brown/45">Vendégvisszajelzés</p>
                  <p className="mt-2 font-serif text-2xl text-brown-dark">5,0 Google értékelés</p>
                </div>
                <div className="flex items-center gap-3">
                  <StarRating n={5} />
                  <span className="font-sans text-sm text-brown/55">Pécsi átvétellel</span>
                </div>
              </div>

              <div className="mt-6 space-y-5">
                {actualReviews.map((review) => (
                  <div key={review.nev} className="border-b border-brown-dark/8 pb-5 last:border-b-0 last:pb-0">
                    <p className="font-sans text-base leading-8 text-brown/74 italic">
                      &bdquo;{review.szoveg}&rdquo;
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <p className="font-sans text-sm font-semibold text-brown-dark">{review.nev}</p>
                      {review.datum ? (
                        <p className="font-sans text-xs uppercase tracking-[0.16em] text-brown/38">{review.datum}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="https://g.page/r/kata-kenyere/review"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-medium text-brown-dark hover:text-gold-dark transition-colors"
              >
                Google vélemények megnyitása →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TERMÉK ELŐNÉZET ═══ */}
      <section className="relative px-6 py-24 md:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="reveal-up">
              <div className="w-10 h-px bg-gold mb-4" />
              <p className="text-[11px] uppercase tracking-[0.22em] text-brown/48 mb-4">Termékek</p>
              <h2 className="font-serif text-3xl md:text-5xl text-brown-dark">Kínálatunkból</h2>
              <p className="mt-3 max-w-2xl font-sans text-sm leading-7 text-brown/65">
                A rendelhető termékeket mindig az aktuális kínálatból mutatjuk, hogy a választás gyors és biztos maradjon.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row reveal-up delay-1">
              <Link
                href="/termekek"
                className="inline-flex items-center justify-center rounded-full border border-brown-dark/15 px-6 py-3.5 font-sans text-sm font-semibold text-brown-dark transition-colors hover:border-brown-dark"
              >
                Teljes kínálat
              </Link>
              <Link
                href="/elorendeles"
                className="inline-flex items-center justify-center rounded-full bg-brown-dark px-6 py-3.5 font-sans text-sm font-bold text-cream transition-colors hover:bg-brown"
              >
                Előrendelés
              </Link>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-4 reveal-soft delay-2">
            {KINALAT_PREVIEW.map((termek) => (
              <article key={termek.slug} className="group flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] border border-brown-dark/10 bg-white/45 shadow-[0_18px_44px_rgba(61,35,20,0.08)] transition-transform duration-500 group-hover:-translate-y-1">
                  <Image
                    src={getTermekFoto(termek)}
                    alt={termek.nev}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-brown-dark/38 to-transparent" />
                </div>

                <div className="mt-4 px-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-serif text-xl font-semibold text-brown-dark">{termek.nev}</p>
                      <p className="mt-1 font-sans text-[11px] uppercase tracking-[0.18em] text-brown/45">{termek.egyseg}</p>
                    </div>
                    <p className="pt-1 font-sans text-base font-bold text-brown-dark whitespace-nowrap">
                      {termek.ar.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>

                  <p className="mt-3 min-h-[4.5rem] font-sans text-sm leading-7 text-brown/58">
                    {termek.leiras?.trim() || "Kézműves péksütemény, frissen készítve az átvételi napodra."}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-brown-dark/8 pt-4">
                    <span className="font-sans text-[11px] uppercase tracking-[0.18em] text-brown/40">
                      Előrendelhető
                    </span>
                    <Link
                      href="/elorendeles"
                      className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-brown-dark transition-colors hover:text-gold-dark"
                    >
                      Rendelés
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 reveal-up delay-3">
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

      {/* ═══ CTA SZEKCIÓ ═══ */}
      <section className="px-6 pb-24 pt-10 md:pb-28 md:pt-16 text-center">
        <div className="max-w-3xl mx-auto reveal-scale">
          <div className="mx-auto h-20 w-px bg-[linear-gradient(180deg,transparent_0%,rgba(201,169,110,0.85)_50%,transparent_100%)]" />
          <Image
            src="/images/logo.png"
            alt="Kata Kenyere"
            width={56}
            height={56}
            className="mx-auto mb-6 mt-2 opacity-80"
          />
          <p className="text-[11px] uppercase tracking-[0.22em] text-brown/44">
            Frissességre időzített előrendelés
          </p>
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
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-sans text-sm text-brown/58">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gold shrink-0" />
              Átvétel személyesen · Pécs
            </span>
            <span className="hidden h-1.5 w-1.5 rounded-full bg-gold/70 sm:block" />
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gold shrink-0" />
              Minden nap frissen sütve
            </span>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="bg-[linear-gradient(180deg,#211712_0%,#1b130f_100%)] border-t border-cream/8 py-10 px-6">
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
