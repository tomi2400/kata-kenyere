import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ArrowRight } from "lucide-react";
import { type Termek, getTermekFoto, formatAr, csoportositByKategoria } from "@/lib/products";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kovászos kenyerek és péksütemények – Kínálatunk",
  description: "Fehér kovászos kenyér, rozsos cipó, kakaós csiga, fahéjas batyu, kifli és sok más kézműves pékáru. Természetes alapanyagok, adalékanyag nélkül. Pécs, Salakhegyi út 14.",
  alternates: { canonical: "https://katakenyere.hu/termekek" },
  openGraph: {
    title: "Kata Kenyere kínálata – Kovászos kenyerek és péksütemények",
    description: "Kézzel formázott kovászos kenyerek, csigák, kiflik és különlegességek. Minden nap frissen sütve.",
    url: "https://katakenyere.hu/termekek",
  },
};

export default async function TermekekPage() {
  noStore();

  const { data: kategoriak } = await supabase.from("kategoriak").select("nev").order("sorrend");
  const { data: termekekRaw } = await supabase
    .from("termekek")
    .select("id, slug, nev, leiras, kategoria, ar, egyseg, foto_url, sorrend")
    .eq("aktiv", true)
    .order("sorrend");

  const kategoriaLista = kategoriak?.map((k) => k.nev) ?? [];
  const termekek: Termek[] = termekekRaw ?? [];
  const termekekByKategoria = csoportositByKategoria(termekek, kategoriaLista);

  return (
    <div className="min-h-screen bg-[#fafaf8] grain-overlay text-[#4b2e1f]">
      <Navbar />

      <section className="px-6 pt-14 pb-12 md:px-8 xl:px-10">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal variant="up">
            <div className="mb-5 h-px w-10 bg-[#d0af77]" />
            <h1 className="font-serif text-[2.6rem] leading-[1.05] text-[#3d2314] md:text-[3.6rem]">
              Kínálatunkból
            </h1>
            <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-[#7c5a46]">
              Minden terméket természetes kovásszal kelesztünk, kézzel formázunk —
              adalékanyag és tartósítószer nélkül.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {Object.entries(termekekByKategoria).map(([kategoria, termekLista]) => (
        <section key={kategoria} className="px-6 pb-14 md:px-8 xl:px-10">
          <div className="mx-auto max-w-6xl">
            <ScrollReveal variant="up">
              <div className="mb-8 flex items-center gap-4">
                <div className="h-px flex-1 bg-[#d0af77]/30" />
                <h2 className="font-serif text-xl text-[#4b2e1f] shrink-0">{kategoria}</h2>
                <div className="h-px flex-1 bg-[#d0af77]/30" />
              </div>
            </ScrollReveal>
            <div className="grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {termekLista.map((termek, i) => (
                <ScrollReveal key={termek.id} variant="up" delay={i * 60}>
                  <Link
                    href="/elorendeles"
                    className="group block overflow-hidden rounded-[20px] border border-[#ede8df] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c79a66]/50 hover:shadow-[0_16px_36px_rgba(91,56,38,0.10)]"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={getTermekFoto(termek)}
                        alt={termek.nev}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(40,20,10,0.32)] via-transparent to-transparent" />
                      <div className="absolute left-3 top-3 rounded-full bg-[#fafaf8]/90 px-2.5 py-1 font-sans text-[10px] uppercase tracking-[0.18em] text-[#4b2e1f]">
                        {termek.kategoria}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-serif text-[0.975rem] leading-snug text-[#4b2e1f]">{termek.nev}</p>
                        <p className="shrink-0 font-sans text-sm font-semibold text-[#5b3826]">{formatAr(termek.ar)}</p>
                      </div>
                      {termek.egyseg && (
                        <p className="mt-0.5 font-sans text-[11px] uppercase tracking-[0.14em] text-[#9d7f63]">{termek.egyseg}</p>
                      )}
                      {termek.leiras && (
                        <p className="mt-2 font-sans text-[0.8rem] leading-relaxed text-[#7c5a46] line-clamp-2">{termek.leiras}</p>
                      )}
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="bg-[#3e2315] px-6 py-20 text-center md:px-8 xl:px-10">
        <ScrollReveal variant="up">
          <div className="mx-auto max-w-lg">
            <div className="mx-auto mb-5 h-px w-10 bg-[#d0af77]" />
            <h2 className="font-serif text-[2rem] text-[#fff5ea] md:text-[2.6rem]">Rendeld meg előre</h2>
            <p className="mx-auto mt-4 max-w-sm font-sans text-[0.9rem] leading-relaxed text-[#e8d6c0]/70">
              Válaszd ki a napot, add le a rendelésedet, és vedd át frissen sütve.
            </p>
            <Link
              href="/elorendeles"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c79a66] px-8 py-[0.95rem] font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(199,154,102,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b98b58]"
            >
              Előrendelés indítása
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
