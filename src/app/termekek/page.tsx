import type { Metadata } from "next";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { ArrowRight } from "lucide-react";
import { type Termek, csoportositByKategoria } from "@/lib/products";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import TrackedLink from "@/components/TrackedLink";
import CatalogProductCard from "@/components/CatalogProductCard";
import { defaultOpenGraphImage } from "@/lib/seo";
import { withParsedProductDetails } from "@/lib/product-details";
import type { ProductAvailability } from "@/components/ProductDetailsModal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kovászos kenyerek és péksütemények – Kínálatunk",
  description: "Kovászos kenyerek, ízesített és teljes kiőrlésű kenyerek, kalácsok, babka, kakaós csiga, pogácsák, kiflik és sós péksütemények. Pécs, Salakhegyi út 14.",
  alternates: { canonical: "https://katakenyere.hu/termekek" },
  openGraph: {
    title: "Kata Kenyere kínálata – Kovászos kenyerek és péksütemények",
    description: "Kézzel formázott kovászos kenyerek, kalácsok, édes és sós péksütemények. Minden nap frissen sütve.",
    url: "https://katakenyere.hu/termekek",
    images: [defaultOpenGraphImage],
  },
};

function getBudapestDateInput() {
  const parts = new Intl.DateTimeFormat("hu-HU", {
    timeZone: "Europe/Budapest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";

  return `${year}-${month}-${day}`;
}

export default async function TermekekPage() {
  noStore();

  const { data: kategoriak } = await supabase.from("kategoriak").select("nev").order("sorrend");
  const { data: termekekRaw } = await supabase
    .from("termekek")
    .select("id, slug, nev, leiras, kategoria, ar, egyseg, foto_url, sorrend")
    .eq("aktiv", true)
    .order("sorrend");

  const kategoriaLista = kategoriak?.map((k) => k.nev) ?? [];
  const termekek: Termek[] = (termekekRaw ?? []).map(withParsedProductDetails);
  const termekekByKategoria = csoportositByKategoria(termekek, kategoriaLista);
  const now = new Date();
  const today = getBudapestDateInput();
  const { data: openDays } = await supabase
    .from("rendeles_napok")
    .select("id, datum, nap, hatarido")
    .eq("nyitott", true)
    .gte("datum", today)
    .order("datum")
    .limit(90);
  const availableDays = (openDays ?? []).filter(
    (day) => day.hatarido && new Date(day.hatarido) > now
  );
  const dayById = new Map(availableDays.map((day) => [day.id, day]));
  const { data: dailyProducts } = availableDays.length > 0
    ? await supabase
      .from("napi_termekek")
      .select("rendeles_nap_id, termek_id")
      .in("rendeles_nap_id", availableDays.map((day) => day.id))
    : { data: [] };
  const availabilityByProduct = new Map<string, ProductAvailability[]>();

  for (const row of dailyProducts ?? []) {
    const day = dayById.get(row.rendeles_nap_id);
    if (!day) continue;

    const availability = availabilityByProduct.get(row.termek_id) ?? [];
    availability.push({ datum: day.datum, nap: day.nap });
    availabilityByProduct.set(row.termek_id, availability);
  }

  availabilityByProduct.forEach((availability) => {
    availability.sort((a, b) => a.datum.localeCompare(b.datum));
  });

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
              Kenyereinket természetes kovásszal kelesztjük, kézzel formázzuk, a péksüteményeinket
              ugyanezzel a gondossággal készítjük.{" "}
              <Link
                href="/alapanyagok"
                className="inline-flex items-center gap-1 font-medium text-[#c79a66] underline-offset-2 hover:underline"
              >
                Nézd meg, mi van benne
                <ArrowRight className="h-3 w-3" />
              </Link>
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
            <div className="grid auto-rows-fr grid-cols-2 items-stretch gap-3 md:grid-cols-3 md:gap-5 xl:grid-cols-4">
              {termekLista.map((termek, i) => (
                <ScrollReveal key={termek.id} variant="up" delay={i * 60} className="h-full">
                  <CatalogProductCard
                    termek={termek}
                    availability={availabilityByProduct.get(termek.id) ?? []}
                  />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Hullámos átmenet → barna CTA */}
      <div className="pointer-events-none relative h-20 w-full" style={{ background: "linear-gradient(to bottom, #fafaf8 50%, #3e2315 50%)" }}>
        <svg viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          <path d="M0,0 L1440,0 L1440,40 C1200,12 960,76 720,48 C480,20 240,80 0,56 L0,0 Z" fill="#fafaf8" />
          <path d="M0,56 C240,80 480,20 720,48 C960,76 1200,12 1440,40 L1440,80 L0,80 Z" fill="#3e2315" />
        </svg>
      </div>

      {/* CTA szekció */}
      <section className="bg-[#3e2315] px-6 pb-20 pt-8 text-center md:px-8 md:pb-28 xl:px-10">
        <ScrollReveal variant="up">
          <div className="mx-auto max-w-lg">
            <div className="mx-auto mb-5 h-px w-10 bg-[#d0af77]" />
            <h2 className="font-serif text-[2rem] text-[#fff5ea] md:text-[2.6rem]">Rendeld meg előre</h2>
            <p className="mx-auto mt-4 max-w-sm font-sans text-[0.9rem] leading-relaxed text-[#e8d6c0]/70">
              Válaszd ki a napot, add le a rendelésedet, és vedd át frissen sütve.
            </p>
            <TrackedLink
              href="/elorendeles"
              trackingData={{
                cta_location: "products_final",
                cta_label: "Előrendelés indítása",
              }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#c79a66] px-8 py-[0.95rem] font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(199,154,102,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b98b58] hover:shadow-[0_14px_32px_rgba(199,154,102,0.44)]"
            >
              Előrendelés indítása
              <ArrowRight className="h-4 w-4" />
            </TrackedLink>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
