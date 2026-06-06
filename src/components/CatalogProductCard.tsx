"use client";

import { useState } from "react";
import Image from "next/image";
import { Info } from "lucide-react";
import ProductDetailsModal, { type ProductAvailability } from "@/components/ProductDetailsModal";
import { formatAr, getTermekFoto, type Termek } from "@/lib/products";
import { pushDataLayerEvent } from "@/lib/tracking";

type CatalogProductCardProps = {
  termek: Termek;
  availability: ProductAvailability[];
};

export default function CatalogProductCard({ termek, availability }: CatalogProductCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const openDetails = () => {
    setDetailsOpen(true);
    pushDataLayerEvent("product_details_opened", {
      product_id: termek.slug,
      product_name: termek.nev,
      item_category: termek.kategoria,
      cta_location: "products_listing",
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={openDetails}
        className="group flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-[20px] border border-[#ede8df] bg-white text-left transition-all duration-300 hover:-translate-y-1.5 hover:border-[#c79a66]/50 hover:shadow-[0_16px_36px_rgba(91,56,38,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c79a66]"
        aria-label={`${termek.nev} részleteinek megnyitása`}
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden">
          <Image
            src={getTermekFoto(termek)}
            alt={termek.nev}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(40,20,10,0.32)] via-transparent to-transparent" />
        </div>
        <div className="flex flex-1 flex-col p-3 md:p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="min-h-[2.15rem] break-words font-serif text-[0.875rem] leading-snug text-[#4b2e1f] md:min-h-[2.45rem] md:text-[0.975rem]">
              {termek.nev}
            </p>
            <p className="shrink-0 font-sans text-xs font-semibold text-[#5b3826] md:text-sm">
              {formatAr(termek.ar)}
            </p>
          </div>
          {termek.egyseg && (
            <p className="mt-0.5 font-sans text-[10px] uppercase tracking-[0.14em] text-[#9d7f63] md:text-[11px]">
              {termek.egyseg}
            </p>
          )}
          {termek.leiras && (
            <p className="mt-1.5 overflow-hidden font-sans text-[0.75rem] leading-relaxed text-[#7c5a46] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] md:mt-2 md:text-[0.8rem]">
              {termek.leiras}
            </p>
          )}
          <span className="mt-auto flex items-center gap-1.5 pt-3 font-sans text-[11px] font-semibold text-[#b18454]">
            <Info className="h-3.5 w-3.5" />
            Részletek
          </span>
        </div>
      </button>

      <ProductDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        termek={termek}
        mode="catalog"
        availability={availability}
      />
    </>
  );
}
