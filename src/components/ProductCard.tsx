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
      rounded-[1.4rem] overflow-hidden border
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
          <div className="absolute top-3 right-3 bg-gold text-brown-dark text-xs font-bold font-sans px-2.5 py-1 rounded-full shadow-sm">
            {qty} db
          </div>
        )}
      </div>

      <div className={`p-4 ${isSelected ? "bg-gradient-to-b from-white to-cream" : "bg-white"}`}>
        <div className="mb-3">
          <p className="font-serif text-base font-semibold text-brown-dark leading-tight">
            {termek.nev}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-brown/45">{termek.egyseg}</p>
            <p className="font-sans text-sm font-bold text-brown-dark">
              {formatAr(termek.ar)}
            </p>
          </div>
        </div>
        <p className="font-sans text-xs text-brown/55 min-h-[2.5rem] leading-relaxed">
          {termek.leiras?.trim() || "Kézműves péksütemény, frissen készítve az átvételi napodra."}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className="font-sans text-[11px] text-brown/40">
            {qty > 0 ? `Kosárban: ${qty} db` : "Egy kattintással hozzáadható"}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3">
          {qty === 0 ? (
            <button
              onClick={() => change(1)}
              className="w-full py-2.5 text-xs font-sans font-semibold rounded-xl bg-brown-dark text-cream hover:bg-brown transition-colors cursor-pointer shadow-sm"
            >
              + Hozzáadom
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full justify-between rounded-xl border border-gold/20 bg-cream px-2 py-2">
              <button
                onClick={() => change(-1)}
                className="w-9 h-9 rounded-xl bg-white hover:bg-gold/15 text-brown-dark font-bold text-base flex items-center justify-center transition-colors cursor-pointer border border-gold/10"
                aria-label="Kevesebb"
              >
                −
              </button>
              <span className="font-sans font-bold text-brown-dark text-sm">{qty} db</span>
              <button
                onClick={() => change(1)}
                className="w-9 h-9 rounded-xl bg-brown-dark hover:bg-brown text-cream font-bold text-base flex items-center justify-center transition-colors cursor-pointer"
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
