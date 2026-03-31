import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { type Termek, getTermekFoto, csoportositByKategoria } from "@/lib/products";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kovászos kenyerek és péksütemények – Kínálatunk",
  description:
    "Fehér kovászos kenyér, rozsos cipó, kakaós csiga, fahéjas batyu, kifli és sok más kézműves pékáru. Természetes alapanyagok, adalékanyag nélkül. Pécs, Salakhegyi út 14.",
  alternates: {
    canonical: "https://katakenyere.hu/termekek",
  },
  openGraph: {
    title: "Kata Kenyere kínálata – Kovászos kenyerek és péksütemények",
    description:
      "Kézzel formázott kovászos kenyerek, csigák, kiflik és különlegességek. Minden nap frissen sütve.",
    url: "https://katakenyere.hu/termekek",
  },
};

export default async function TermekekPage() {
  noStore();

  const { data: kategoriak } = await supabase
    .from("kategoriak")
    .select("nev")
    .order("sorrend");
  const { data: termekekRaw } = await supabase
    .from("termekek")
    .select("id, slug, nev, leiras, kategoria, ar, egyseg, foto_url, sorrend")
    .eq("aktiv", true)
    .order("sorrend");

  const kategoriaLista = kategoriak?.map((k) => k.nev) ?? [];
  const termekek: Termek[] = termekekRaw ?? [];
  const termekekByKategoria = csoportositByKategoria(termekek, kategoriaLista);

  return (
    <div className="bg-cream min-h-screen grain-overlay">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-8">
        <section className="paper-panel warm-ring rounded-[2rem] px-6 py-8 md:px-10 md:py-10 overflow-hidden relative">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative max-w-2xl">
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-brown/40 mb-3">Napi kézműves kínálat</p>
            <h1 className="font-serif text-4xl md:text-5xl text-brown-dark leading-[1.05]">
              Kenyerek,
              <br />
              <em className="text-gold not-italic">csigák és péksütik</em>
            </h1>
            <p className="font-sans text-brown/60 mt-4 leading-relaxed">
              Minden terméket úgy mutatunk itt, ahogy a vásárló is találkozik vele: tisztán, külön kiszereléssel,
              friss árral és egyértelmű kategóriákkal.
            </p>
          </div>
        </section>
      </div>

      {Object.entries(termekekByKategoria).map(([kategoria, termekek]) => (
        <section key={kategoria} className="max-w-6xl mx-auto px-6 mb-12">
          <div className="flex items-center gap-4 mb-5">
            <div className="h-px flex-1 bg-gold/25" />
            <h2 className="font-serif text-2xl text-brown-dark shrink-0">{kategoria}</h2>
            <div className="h-px flex-1 bg-gold/25" />
          </div>

          <div className="grid grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {termekek.map((termek) => (
              <div
                key={termek.id}
                className="bg-white rounded-[1.5rem] overflow-hidden border border-gold/15 shadow-[0_14px_30px_rgba(61,35,20,0.08)]"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={getTermekFoto(termek)}
                    alt={termek.nev}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/45 via-transparent to-white/10" />
                  <div className="absolute left-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.18em] text-brown-dark">
                    {termek.kategoria}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-serif text-base font-semibold text-brown-dark">
                      {termek.nev}
                    </p>
                    <p className="font-sans text-sm font-bold text-brown-dark shrink-0">
                      {termek.ar.toLocaleString("hu-HU")} Ft
                    </p>
                  </div>
                  <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-brown/45 mt-1">
                    {termek.egyseg}
                  </p>
                  <p className="font-sans text-sm text-brown/60 mt-3 min-h-[3rem] leading-relaxed">
                    {termek.leiras?.trim() || "Hagyományos, kézműves pékáru természetes alapanyagokkal."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="bg-brown-dark text-cream py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-10 h-px bg-gold mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-cream mb-3">
            Rendeld meg előre
          </h2>
          <p className="font-sans text-cream/60 mb-6">
            Válaszd ki a napot, add le a rendelésedet, és vedd át frissen sütve.
          </p>
          <Link
            href="/elorendeles"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-bold bg-gold text-brown-dark hover:bg-gold-light transition-colors"
          >
            Előrendelés indítása
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
