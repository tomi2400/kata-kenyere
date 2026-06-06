"use client";

import { useState } from "react";
import Image from "next/image";
import { Info } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatAr, getTermekFoto, type Termek } from "@/lib/products";
import { pushDataLayerEvent } from "@/lib/tracking";
import ProductDetailsModal from "@/components/ProductDetailsModal";

const MAX_ITEM_QUANTITY = 99;

export default function ProductCard({ termek, datum }: { termek: Termek; datum: string }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { carts, setQuantity } = useCartStore();
  const dayItems = carts[datum] ?? [];
  const item = dayItems.find((i) => i.termekId === termek.slug);
  const qty = item?.mennyiseg ?? 0;

  const change = (delta: number) => {
    const newQty = Math.min(MAX_ITEM_QUANTITY, Math.max(0, qty + delta));
    if (newQty === qty) return;

    const eventName = delta > 0 ? "product_added" : "product_quantity_changed";

    pushDataLayerEvent(eventName, {
      product_id: termek.slug,
      product_name: termek.nev,
      item_category: termek.kategoria,
      pickup_date: datum,
      previous_quantity: qty,
      quantity: newQty,
      quantity_delta: delta,
      value: delta > 0 ? termek.ar : newQty * termek.ar,
      currency: "HUF",
      ecommerce: {
        currency: "HUF",
        value: delta > 0 ? termek.ar : newQty * termek.ar,
        items: [
          {
            item_id: termek.slug,
            item_name: termek.nev,
            item_category: termek.kategoria,
            price: termek.ar,
            quantity: delta > 0 ? 1 : newQty,
            pickup_date: datum,
          },
        ],
      },
    });

    setQuantity(
      datum,
      {
        termekId: termek.slug,
        nev: termek.nev,
        ar: termek.ar,
        egyseg: termek.egyseg,
        fotoUrl: getTermekFoto(termek),
      },
      newQty
    );
  };

  const isSelected = qty > 0;

  return (
    <>
      <article className={`
        flex h-full flex-col overflow-hidden rounded-[1.1rem] border sm:rounded-[1.4rem]
        transition-[transform,box-shadow,border-color] duration-300
        hover:-translate-y-1
        ${isSelected ? "border-gold shadow-[0_20px_40px_rgba(61,35,20,0.16)]" : "border-gold/15 hover:border-gold/40 shadow-[0_14px_28px_rgba(61,35,20,0.08)]"}
      `}>
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
          aria-label={`${termek.nev} részleteinek megnyitása`}
        >
          <div className="relative aspect-[4/3] bg-cream-dark">
            <Image
              src={getTermekFoto(termek)}
              alt={termek.nev}
              fill
              className="object-cover scale-[1.02]"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brown-dark/55 via-transparent to-white/10" />
            {isSelected && (
              <div className="absolute right-2 top-2 rounded-full bg-gold px-2 py-0.5 font-sans text-[10px] font-bold text-brown-dark shadow-sm sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
                {qty} db
              </div>
            )}
          </div>

          <div className={`p-3 pb-0 sm:p-4 sm:pb-0 ${isSelected ? "bg-gradient-to-b from-white to-cream" : "bg-white"}`}>
            <div className="mb-2.5 sm:mb-3">
              <p className="min-h-[2.25rem] break-words font-serif text-[0.9rem] font-semibold leading-tight text-brown-dark sm:min-h-[2.5rem] sm:text-base">
                {termek.nev}
              </p>
              <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
                <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-brown/45 sm:text-[11px] sm:tracking-[0.18em]">
                  {termek.egyseg}
                </p>
                <p className="font-sans text-xs font-bold text-brown-dark sm:text-sm">
                  {formatAr(termek.ar)}
                </p>
              </div>
            </div>
            <p className="overflow-hidden font-sans text-[0.7rem] leading-relaxed text-brown/55 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] sm:text-xs">
              {termek.leiras?.trim() || "Kézműves péksütemény, frissen készítve az átvételi napodra."}
            </p>
            <span className="mt-2.5 flex items-center gap-1.5 font-sans text-[10px] font-semibold text-gold sm:text-[11px]">
              <Info className="h-3.5 w-3.5" />
              Részletek
            </span>
          </div>
        </button>

        <div className={`mt-auto p-3 pt-3 sm:p-4 sm:pt-4 ${isSelected ? "bg-cream" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <span className="font-sans text-[10px] leading-snug text-brown/40 sm:text-[11px]">
              {qty > 0 ? `Kosárban: ${qty} db` : "Egy kattintással hozzáadható"}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            {qty === 0 ? (
              <button
                type="button"
                onClick={() => change(1)}
                className="w-full cursor-pointer rounded-xl bg-brown-dark px-2 py-2.5 font-sans text-[0.7rem] font-semibold text-cream shadow-sm transition-colors hover:bg-brown sm:text-xs"
              >
                + Hozzáadom
              </button>
            ) : (
              <div className="flex w-full items-center justify-between gap-1.5 rounded-xl border border-gold/20 bg-cream px-1.5 py-1.5 sm:gap-2 sm:px-2 sm:py-2">
                <button
                  type="button"
                  onClick={() => change(-1)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-gold/10 bg-white text-sm font-bold text-brown-dark transition-colors hover:bg-gold/15 sm:h-9 sm:w-9 sm:text-base"
                  aria-label="Kevesebb"
                >
                  −
                </button>
                <span className="font-sans text-xs font-bold text-brown-dark sm:text-sm">{qty} db</span>
                <button
                  type="button"
                  onClick={() => change(1)}
                  disabled={qty >= MAX_ITEM_QUANTITY}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-brown-dark text-sm font-bold text-cream transition-colors hover:bg-brown sm:h-9 sm:w-9 sm:text-base"
                  aria-label="Több"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      <ProductDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        termek={termek}
        mode="order"
        quantity={qty}
        onQuantityChange={change}
        maxQuantity={MAX_ITEM_QUANTITY}
      />
    </>
  );
}
