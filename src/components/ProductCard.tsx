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
      rounded-xl overflow-hidden border-2
      transition-[transform,box-shadow,border-color] duration-200
      hover:-translate-y-0.5
      ${isSelected ? "border-gold shadow-lg" : "border-cream-dark hover:border-gold/40 hover:shadow-md"}
    `}>
      {/* Fotó */}
      <div className="relative aspect-[4/3] bg-cream-dark">
        <Image
          src={getTermekFoto(termek)}
          alt={termek.nev}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, 33vw"
        />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-gold text-brown-dark text-xs font-bold font-sans px-2 py-0.5 rounded-full">
            {qty} db
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 bg-cream">
        <p className="font-serif text-sm font-semibold text-brown-dark leading-tight">
          {termek.nev}
        </p>
        <p className="font-sans text-xs text-brown/50 mt-0.5">{termek.egyseg}</p>
        <p className="font-sans text-sm font-bold text-brown-dark mt-1">
          {formatAr(termek.ar)}
        </p>

        {/* Mennyiség */}
        <div className="flex items-center justify-between mt-3">
          {qty === 0 ? (
            <button
              onClick={() => change(1)}
              className="w-full py-2 text-xs font-sans font-semibold rounded-lg bg-brown-dark text-cream hover:bg-brown transition-colors cursor-pointer"
            >
              + Hozzáadom
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full justify-between">
              <button
                onClick={() => change(-1)}
                className="w-8 h-8 rounded-lg bg-cream-dark hover:bg-gold/20 text-brown-dark font-bold text-base flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Kevesebb"
              >
                −
              </button>
              <span className="font-sans font-bold text-brown-dark text-sm">{qty} db</span>
              <button
                onClick={() => change(1)}
                className="w-8 h-8 rounded-lg bg-brown-dark hover:bg-brown text-cream font-bold text-base flex items-center justify-center transition-colors cursor-pointer"
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
