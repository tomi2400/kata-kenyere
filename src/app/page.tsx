import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import GalleryStrip from "@/components/GalleryStrip";
import CookieSettingsButton from "@/components/CookieSettingsButton";
import {
  ArrowRight,
  Flame,
  Heart,
  Leaf,
  MapPin,
  Sparkles,
  Star,
  Wheat,
} from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kata Kenyere – Kézműves pékség Pécsett",
  description:
    "Pécs kézműves kovászos pékségéből rendelhetsz előre friss kenyeret, csigát, kiflit. Adalékanyagmentes, természetes kovász. Kedd–Péntek, Salakhegyi út 14.",
  alternates: { canonical: "https://katakenyere.hu" },
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
    szoveg:
      "A fővárosból érkeztem, kerestem Pécsen kovászos kenyeret. A magvasat választottam – nagyon finom bélzet, kiváló mag tészta. Csak ajánlani tudom!",
    datum: "1 hónapja",
  },
  {
    nev: "Emese Zentai",
    szoveg:
      "Na ez a csiga – kenyér nem kérdés. Puha, illatos, tökéletesen meg van sütve, és minden falatban ott van a minőség és a szeretet.",
    datum: "5 napja",
  },
];

const FEATURES = [
  {
    Icon: Wheat,
    cim: "Természetes kovász",
    szoveg: "Időt adunk a tésztának, nem adalékanyagot.",
  },
  {
    Icon: Heart,
    cim: "Kézzel, szívvel",
    szoveg: "Úgy készítjük, mintha a családunknak adnánk.",
  },
  {
    Icon: Sparkles,
    cim: "Mindig frissen sütve",
    szoveg: "Csak annyit készítünk, amennyit valóban rendeltek.",
  },
  {
    Icon: Leaf,
    cim: "Tiszta alapanyagok",
    szoveg: "Nálunk nincs mit rejtegetni az összetevőkben.",
  },
];

function StarsRow({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <div className="flex items-center gap-1 text-[#d0af77]">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={className} fill="currentColor" strokeWidth={0} />
      ))}
    </div>
  );
}

export default async function Home() {

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fafaf8] grain-overlay text-[#4b2e1f]">
      <Navbar transparent />

      {/* ══════════════════════════════════════════
          HERO — változatlan
      ══════════════════════════════════════════ */}
      <section className="relative flex min-h-screen items-end overflow-hidden">
        <Image
          src="/images/DSC00045.JPG"
          alt="Kata Kenyere pékség friss kenyerek"
          fill
          className="object-cover hero-zoom"
          sizes="100vw"
          priority
        />

        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(21,14,10,0.78)_0%,rgba(21,14,10,0.58)_24%,rgba(21,14,10,0.26)_52%,rgba(21,14,10,0.16)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(21,14,10,0.34)_0%,rgba(21,14,10,0.18)_20%,rgba(21,14,10,0.22)_56%,rgba(21,14,10,0.82)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_48%,rgba(0,0,0,0.18)_0%,transparent_34%),radial-gradient(circle_at_72%_12%,rgba(255,248,235,0.06)_0%,transparent_24%)]" />

        <div className="relative z-10 w-full translate-y-6 px-6 pb-8 pt-28 md:translate-y-8 md:px-8 md:pb-10 md:pt-36 xl:px-12 2xl:px-16">
          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="max-w-[700px]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#ead2b1] [text-shadow:0_1px_14px_rgba(0,0,0,0.34)] reveal-up">
                Kézműves pékség · Pécs
              </p>
              <h1 className="mt-6 font-serif text-[clamp(3.6rem,7.5vw,6.2rem)] leading-[0.92] tracking-[-0.04em] text-[#fff5ea] [text-shadow:0_6px_24px_rgba(0,0,0,0.3)] reveal-soft delay-1">
                Frissen, <span className="text-[#f0d0aa]">kézzel,</span>
                <br />
                szeretettel.
              </h1>
              <p className="mt-7 max-w-[540px] text-[clamp(1rem,1.4vw,1.14rem)] font-light leading-[1.85] text-[#f5e8d6] [text-shadow:0_2px_14px_rgba(0,0,0,0.26)] reveal-up delay-2">
                Kovásszal kelesztett kenyerek és kézzel formázott pékáruk
                <br className="hidden sm:block" />– minden nap frissen sütve,
                természetes alapanyagokból.
              </p>

              <div className="mt-9 flex flex-wrap gap-3 reveal-up delay-3">
                <Link
                  href="/elorendeles"
                  className="inline-flex min-w-[10.5rem] items-center justify-center rounded-full bg-[#c79a66] px-7 py-[0.95rem] font-sans text-[0.875rem] font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(199,154,102,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b98b58] hover:shadow-[0_14px_32px_rgba(199,154,102,0.44)]"
                >
                  Előrendelés
                </Link>
                <Link
                  href="#kinalat"
                  className="inline-flex min-w-[10.5rem] items-center justify-center gap-2 rounded-full border border-[#f3e4d1]/28 bg-white/8 px-7 py-[0.95rem] font-sans text-[0.875rem] font-medium text-[#fff2e3] backdrop-blur-sm transition-all duration-300 hover:border-[#f3e4d1]/44 hover:bg-white/14"
                >
                  Kínálatunk
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            <aside className="hidden self-end justify-self-end text-right lg:block reveal-up delay-3">
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#d6b38b] [text-shadow:0_1px_10px_rgba(0,0,0,0.34)]">
                Nyitvatartás
              </p>
              <p className="mt-4 text-base leading-7 text-[#fff6eb] [text-shadow:0_1px_12px_rgba(0,0,0,0.32)]">
                Kedd – Péntek
              </p>
              <p className="mt-1.5 font-serif text-[2.4rem] leading-none text-[#fffaf2] [text-shadow:0_4px_18px_rgba(0,0,0,0.32)]">
                8:00–17:00
              </p>
              <p className="mt-5 text-sm leading-7 text-[#fff2e3] [text-shadow:0_1px_12px_rgba(0,0,0,0.3)]">
                Pécs, Salakhegyi út 14.
              </p>
            </aside>
          </div>

          <div className="mt-9 reveal-up delay-4">
            <div className="h-px w-full bg-[linear-gradient(90deg,rgba(243,228,209,0)_0%,rgba(243,228,209,0.16)_12%,rgba(243,228,209,0.24)_50%,rgba(243,228,209,0.16)_88%,rgba(243,228,209,0)_100%)]" />
            <div className="flex min-h-[72px] flex-wrap items-center justify-center gap-x-5 gap-y-2.5 pt-4">
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-[#c79a66]" fill="currentColor" strokeWidth={0} />
                <span className="font-sans text-[13px] tracking-[0.04em] text-[#fff4e6] [text-shadow:0_1px_8px_rgba(0,0,0,0.22)]">
                  5.0 vásárlói értékelés
                </span>
              </div>
              <span className="hidden h-3.5 w-px bg-[#c79a66]/28 sm:block" />
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 text-[#c79a66]" />
                <span className="font-sans text-[13px] tracking-[0.04em] text-[#fff4e6] [text-shadow:0_1px_8px_rgba(0,0,0,0.22)]">
                  Pécsi átvétel
                </span>
              </div>
              <span className="hidden h-3.5 w-px bg-[#c79a66]/28 sm:block" />
              <div className="flex items-center gap-2">
                <Flame className="h-3.5 w-3.5 text-[#c79a66]" />
                <span className="font-sans text-[13px] tracking-[0.04em] text-[#fff4e6] [text-shadow:0_1px_8px_rgba(0,0,0,0.22)]">
                  Napi friss sütés
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ÉRTÉKEK
          Bal: story szöveg + link
          Jobb: tiszta lista, nincs kártya-box
      ══════════════════════════════════════════ */}
      <section className="flow-surface px-6 py-[4.5rem] md:px-8 md:py-[5.5rem] xl:px-10 lg:flex lg:min-h-[72vh] lg:items-center">
        <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-2 lg:items-center lg:gap-20">

          <ScrollReveal variant="up">
            <div>
              <div className="mb-5 h-px w-10 bg-[#d0af77]" />
              <h2 className="font-serif text-[2.2rem] leading-[1.05] text-[#4b2e1f] md:text-[3.1rem]">
                Minden termékben
                <br />
                <span className="text-[#d0af77]">benne van a munkánk.</span>
              </h2>
              <p className="mt-6 max-w-md text-[0.98rem] leading-[1.85] text-[#7c5a46]">
                Amit mi csinálunk, az kicsit több idő. De megéri. Kenyereinket
                természetes kovásszal kelesztjük, kézzel formázzuk, a
                péksüteményeinket pedig ugyanezzel a gondossággal készítjük.
                Nincs benne semmi trükk, csak türelem és jó alapanyag.
              </p>
              <Link
                href="/rolunk"
                className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#c79a66]/40 px-5 py-2.5 text-sm font-medium text-[#5b3826] transition-all duration-300 hover:border-[#c79a66]/80 hover:bg-[#c79a66]/6"
              >
                Ismerd meg történetünket
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal variant="up" delay={120}>
            <ul className="divide-y divide-[#d8c09a]/40">
              {FEATURES.map(({ Icon, cim, szoveg }) => (
                <li key={cim} className="flex items-start gap-5 py-6 first:pt-0 last:pb-0">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c79a66]/10">
                    <Icon className="h-[15px] w-[15px] text-[#c79a66]" />
                  </div>
                  <div>
                    <p className="font-serif text-[1.05rem] text-[#4b2e1f]">{cim}</p>
                    <p className="mt-1.5 text-[0.83rem] leading-[1.7] text-[#7c5a46]">{szoveg}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          VÉLEMÉNYEK
          Sötét fotó háttér — ugyanaz a layered overlay
          logika mint a hero, nem egyszínű sáv
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-6 py-16 md:px-8 md:py-20 xl:px-10 lg:flex lg:min-h-[52vh] lg:items-center">
        <Image
          src="/images/DSC00039.JPG"
          alt="Kata Kenyere pékség hangulat"
          fill
          className="object-cover"
          sizes="100vw"
        />
        {/* Directional overlay — mint a hero */}
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(22,12,7,0.94)_0%,rgba(44,24,12,0.88)_50%,rgba(22,12,7,0.90)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,8,4,0.22)_0%,transparent_28%,transparent_72%,rgba(15,8,4,0.22)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_40%,rgba(199,154,102,0.10),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(255,255,255,0.04),transparent_20%)]" />

        <div className="relative z-10 mx-auto w-full max-w-5xl">
          <ScrollReveal variant="up">
            <div>
              <div className="mb-5 h-px w-10 bg-[#d0af77]" />
              <h2 className="font-serif text-[2rem] text-[#fff5ea] md:text-[2.8rem]">
                Amit a vendégeink írtak
              </h2>
              <div className="mt-3 flex items-center gap-2.5 text-sm text-[#d5b88d]">
                <StarsRow className="h-3.5 w-3.5" />
                <span>5,0 · 4 Google értékelés</span>
              </div>
            </div>
          </ScrollReveal>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {REVIEWS.map((review, index) => (
              <ScrollReveal key={review.nev} variant="up" delay={80 + index * 70}>
                <article className="rounded-[20px] border border-[rgba(199,154,102,0.18)] bg-[rgba(255,242,220,0.06)] p-6 backdrop-blur-[4px]">
                  <StarsRow />
                  <p className="mt-4 text-[0.95rem] italic leading-[1.75] text-[#f0e0cc]">
                    &bdquo;{review.szoveg}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center justify-between gap-4">
                    <p className="text-sm font-semibold text-[#fff4e7]">{review.nev}</p>
                    <p className="text-xs text-[#c5a07e]">{review.datum}</p>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal variant="up" delay={220}>
            <div className="mt-8 text-center">
              <a
                href="https://www.google.com/search?q=Kata+Kenyere+P%C3%A9cs#lrd=0x4741098b4df9a4e3:0x3b527ebc0b1c3406,1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-[#d5b88d] transition-colors hover:text-[#f3e4d0]"
              >
                Írj te is véleményt a Google-on
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          KÍNÁLAT
          Vízszintes scroll — mobilon gyors áttekintés
      ══════════════════════════════════════════ */}
      <section
        id="kinalat"
        className="flow-surface overflow-hidden pt-[4.5rem] pb-[4rem] md:pt-[5.5rem] md:pb-[4.5rem]"
      >
        <div className="relative z-10 w-full">
          {/* Cím — középre */}
          <ScrollReveal variant="up">
            <div className="mb-10 px-6 text-center">
              <div className="mx-auto mb-5 h-px w-10 bg-[#d0af77]" />
              <h2 className="font-serif text-[2rem] text-[#4b2e1f] md:text-[2.8rem]">
                Kínálatunkból
              </h2>
              <p className="mt-2 text-[0.875rem] text-[#8a6b58]">
                Előrendelhető termékek — frissen sütve, csak neked.
              </p>
            </div>
          </ScrollReveal>

          {/* Galéria — teljes szélesség, max-w konténeren kívül */}
          <GalleryStrip />

          {/* Teljes kínálat — középre, galéria alatt */}
          <ScrollReveal variant="up" delay={100}>
            <div className="mt-8 flex justify-center">
              <Link
                href="/termekek"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#9a7a5d] transition-colors hover:text-[#4b2e1f]"
              >
                Teljes kínálat
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>

      </section>

      {/* ── Átvezetés kínálat → CTA: concave wave ── */}
      <div className="pointer-events-none relative -mt-1 h-52 w-full overflow-hidden bg-[#fafaf8]">
        <svg viewBox="0 0 1440 208" fill="none" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d="M0,0 C360,208 1080,208 1440,0 L1440,208 L0,208 Z" fill="white" />
          <path d="M0,0 C360,208 1080,208 1440,0" stroke="rgba(201,169,110,0.22)" strokeWidth="1" fill="none" />
        </svg>
      </div>

      {/* ══════════════════════════════════════════
          LEZÁRÓ CTA
          A hero vizuális nyelvén: dekoratív vonal,
          eyebrow szöveg, arany gomb, trust strip
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white px-6 pt-0 pb-28 text-center md:px-8 md:pb-36 xl:px-10 lg:flex lg:min-h-[56vh] lg:items-center lg:justify-center">
        {/* Háttér meleg radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgba(199,154,102,0.07)_0%,transparent_70%)]" />

        <ScrollReveal variant="scale" className="relative z-10 w-full">
          <div className="mx-auto max-w-xl">

            {/* Dekoratív vonal — mint a hero trust strip előtt */}
            <div className="mx-auto mb-4 h-14 w-px bg-[linear-gradient(180deg,transparent_0%,rgba(208,175,119,0.75)_50%,rgba(208,175,119,0.35)_100%)]" />

            <Image
              src="/images/logo.png"
              alt="Kata Kenyere"
              width={52}
              height={52}
              className="mx-auto opacity-70"
            />

            {/* Eyebrow — mint a hero "Kézműves pékség · Pécs" */}
            <p className="mt-6 text-[11px] uppercase tracking-[0.26em] text-[#9a7a5d]">
              Frissességre időzített előrendelés
            </p>

            <h2 className="mt-3 font-serif text-[2.1rem] leading-tight text-[#4b2e1f] md:text-[3rem]">
              Rendeld meg előre,
              <br />
              <span className="text-[#d0af77]">mi frissen kisütjük.</span>
            </h2>

            <p className="mx-auto mt-5 max-w-md text-[0.98rem] leading-[1.85] text-[#7c5a46]">
              Válaszd ki a napot, állítsd össze a rendelésed, és vedd át
              személyesen Pécsen, amikor valóban neked készül el.
            </p>

            {/* Arany CTA — pontosan mint a hero primary gombja */}
            <Link
              href="/elorendeles"
              className="mt-8 inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-[#c79a66] px-8 py-[0.95rem] text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(199,154,102,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b98b58] hover:shadow-[0_14px_32px_rgba(199,154,102,0.44)]"
            >
              Előrendelés indítása
              <ArrowRight className="h-4 w-4" />
            </Link>

            {/* Trust strip — azonos pattern mint a hero trust stripje */}
            <div className="mt-8">
              <div className="flow-divider" />
              <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 text-sm text-[#9a7a5d]">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#c79a66]" />
                  <span>Átvétel személyesen · Pécs</span>
                </div>
                <span className="hidden h-3.5 w-px bg-[#c79a66]/25 sm:block" />
                <div className="flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-[#c79a66]" />
                  <span>Minden nap frissen sütve</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="relative bg-[#3e2315] px-6 pb-10 pt-11 text-[#e8d6c0] md:px-8 md:pb-12 md:pt-12 xl:px-10">
        {/* Wave into footer */}
        <div className="pointer-events-none absolute inset-x-0 -top-12 h-14 overflow-hidden">
          <svg viewBox="0 0 1440 56" fill="none" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d="M0,28 C360,56 720,0 1080,28 C1260,42 1380,18 1440,28 L1440,56 L0,56 Z" fill="#3e2315" />
          </svg>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col gap-10 border-b border-[#5a3020] pb-9 md:flex-row md:items-start md:justify-between">

            {/* Bal: logó + info */}
            <div className="shrink-0">
              <Image
                src="/images/logo.png"
                alt="Kata Kenyere"
                width={40}
                height={40}
                className="h-auto w-10 opacity-80"
              />
              <p className="mt-4 text-[0.8rem] leading-[1.65] text-[#cdb49b]">
                Kézműves kovászos pékség.
                <br />
                Pécs, Salakhegyi út 14.
                <br />
                K–P: 8:00–17:00
              </p>
            </div>

            {/* Közép: oldalak */}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#b89471]">Oldalak</p>
              <div className="mt-3.5 space-y-2">
                {[
                  { href: "/termekek", label: "Termékek" },
                  { href: "/rolunk", label: "Rólunk" },
                  { href: "/alapanyagok", label: "Alapanyagok" },
                  { href: "/kapcsolat", label: "Kapcsolat" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-[0.82rem] text-[#e8d6c0] transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Jobb: dokumentumok */}
            <div className="shrink-0">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#b89471]">Dokumentumok</p>
              <div className="mt-3.5 space-y-2">
                <Link href="/impresszum" className="block text-[0.82rem] text-[#e8d6c0] transition-colors hover:text-white">
                  Impresszum
                </Link>
                <Link href="/adatvedelmi" className="block text-[0.82rem] text-[#e8d6c0] transition-colors hover:text-white">
                  Adatvédelem
                </Link>
                <CookieSettingsButton />
              </div>
            </div>

          </div>

          <div className="pt-6 text-center text-[0.72rem] text-[#9e7d63]">
            © 2026 Kata Kenyere · Minden jog fenntartva
          </div>
        </div>
      </footer>
    </div>
  );
}
