"use client";

import Image from "next/image";
import { useCartStore } from "@/lib/store";
import { formatAr, getTermekFoto, type Termek } from "@/lib/products";

export default function ProductCard({ termek, datum }: { termek: Termek; datum: string }) {
  const { carts, setQuantity } = useCartStore();
  const dayItems = carts[datum] ?? [];
  const item = dayItems.find((i) => i.termekId === termek.slug);
  const qty = item?.mennyiseg ?? 0;

  const change = (delta: number) => {
    const newQty = Math.max(0, qty + delta);
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
    <div className={`
      overflow-hidden rounded-[1.1rem] border sm:rounded-[1.4rem]
      transition-[transform,box-shadow,border-color] duration-300
      hover:-translate-y-1
      ${isSelected ? "border-gold shadow-[0_20px_40px_rgba(61,35,20,0.16)]" : "border-gold/15 hover:border-gold/40 shadow-[0_14px_28px_rgba(61,35,20,0.08)]"}
    `}>
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

      <div className={`p-3 sm:p-4 ${isSelected ? "bg-gradient-to-b from-white to-cream" : "bg-white"}`}>
        <div className="mb-2.5 sm:mb-3">
          <p className="font-serif text-[0.9rem] font-semibold leading-tight text-brown-dark sm:text-base">
            {termek.nev}
          </p>
          <div className="mt-1 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <p className="font-sans text-[9px] uppercase tracking-[0.14em] text-brown/45 sm:text-[11px] sm:tracking-[0.18em]">{termek.egyseg}</p>
            <p className="font-sans text-xs font-bold text-brown-dark sm:text-sm">
              {formatAr(termek.ar)}
            </p>
          </div>
        </div>
        <p className="line-clamp-2 min-h-[2.45rem] font-sans text-[0.7rem] leading-relaxed text-brown/55 sm:min-h-[2.5rem] sm:text-xs">
          {termek.leiras?.trim() || "Kézműves péksütemény, frissen készítve az átvételi napodra."}
        </p>

        <div className="mt-3 flex items-center justify-between sm:mt-4">
          <span className="font-sans text-[10px] leading-snug text-brown/40 sm:text-[11px]">
            {qty > 0 ? `Kosárban: ${qty} db` : "Egy kattintással hozzáadható"}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          {qty === 0 ? (
            <button
              onClick={() => change(1)}
              className="w-full cursor-pointer rounded-xl bg-brown-dark px-2 py-2.5 font-sans text-[0.7rem] font-semibold text-cream shadow-sm transition-colors hover:bg-brown sm:text-xs"
            >
              + Hozzáadom
            </button>
          ) : (
            <div className="flex w-full items-center justify-between gap-1.5 rounded-xl border border-gold/20 bg-cream px-1.5 py-1.5 sm:gap-2 sm:px-2 sm:py-2">
              <button
                onClick={() => change(-1)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl border border-gold/10 bg-white text-sm font-bold text-brown-dark transition-colors hover:bg-gold/15 sm:h-9 sm:w-9 sm:text-base"
                aria-label="Kevesebb"
              >
                −
              </button>
              <span className="font-sans text-xs font-bold text-brown-dark sm:text-sm">{qty} db</span>
              <button
                onClick={() => change(1)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-xl bg-brown-dark text-sm font-bold text-cream transition-colors hover:bg-brown sm:h-9 sm:w-9 sm:text-base"
                aria-label="Több"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
