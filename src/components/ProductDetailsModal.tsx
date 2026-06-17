"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Info,
  Minus,
  Plus,
  ShoppingBag,
  TriangleAlert,
  Wheat,
  X,
} from "lucide-react";
import { PRODUCT_IMAGE_NOTICE, formatAr, getTermekFoto, type Termek } from "@/lib/products";
import { pushDataLayerEvent } from "@/lib/tracking";

export type ProductAvailability = {
  datum: string;
  nap: string;
};

type ProductDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  termek: Termek;
} & (
  | {
      mode: "catalog";
      availability: ProductAvailability[];
    }
  | {
      mode: "order";
      quantity: number;
      onQuantityChange: (delta: number) => void;
      maxQuantity: number;
    }
);

function formatAvailabilityDate(datum: string) {
  const [year, month, day] = datum.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("hu-HU", {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export default function ProductDetailsModal(props: ProductDetailsModalProps) {
  const { open, onClose, termek } = props;
  const [mounted, setMounted] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    const previouslyFocusedElement = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocusedElement instanceof HTMLElement) {
        previouslyFocusedElement.focus();
      }
    };
  }, [open]);

  if (!mounted || !open) return null;

  const hasIngredients = Boolean(termek.hozzavalok?.trim());
  const hasAllergens = Boolean(termek.allergenek?.trim());

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-[#2d180f]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative grid max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-t-[24px] bg-[#fffdf9] shadow-[0_28px_80px_rgba(35,18,10,0.32)] sm:max-h-[90vh] sm:rounded-[24px] md:grid-cols-[0.92fr_1.08fr]"
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#5b3826] shadow-md transition-colors hover:bg-[#f5eadc]"
          aria-label="Bezárás"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative aspect-[16/10] bg-[#eee4d8] md:aspect-auto md:min-h-[520px]">
          <Image
            src={getTermekFoto(termek)}
            alt={termek.nev}
            fill
            className="object-cover"
            sizes="(max-width: 767px) 100vw, 45vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2d180f]/35 via-transparent to-transparent" />
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain px-5 pb-6 pt-5 sm:px-7 sm:pb-7 sm:pt-7">
          <p className="font-sans text-[10px] uppercase tracking-[0.18em] text-[#a08065]">
            {termek.kategoria}
          </p>
          <div className="mt-1 flex items-start justify-between gap-4 pr-8">
            <div>
              <h2 id={titleId} className="font-serif text-2xl leading-tight text-[#3d2314] sm:text-[2rem]">
                {termek.nev}
              </h2>
              <p className="mt-1 font-sans text-xs uppercase tracking-[0.14em] text-[#9d7f63]">
                {termek.egyseg}
              </p>
            </div>
            <p className="shrink-0 font-sans text-base font-bold text-[#4b2e1f]">
              {formatAr(termek.ar)}
            </p>
          </div>

          {termek.leiras?.trim() && (
            <p className="mt-5 whitespace-pre-line font-sans text-sm leading-7 text-[#6f4d39]">
              {termek.leiras.trim()}
            </p>
          )}

          <div className="mt-5 flex gap-2 rounded-xl border border-[#eadfd2] bg-[#faf4eb] px-4 py-3 text-[#80634f]">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#c79a66]" />
            <p className="font-sans text-xs leading-5 sm:text-sm">
              {PRODUCT_IMAGE_NOTICE}
            </p>
          </div>

          {(hasIngredients || hasAllergens) && (
            <div className="mt-6 space-y-4 border-t border-[#eadfd2] pt-5">
              {hasIngredients && (
                <section>
                  <div className="flex items-center gap-2 text-[#7b593f]">
                    <Wheat className="h-4 w-4 text-[#c79a66]" />
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                      Összetevők
                    </h3>
                  </div>
                  <p className="mt-2 font-sans text-xs leading-6 text-[#80634f] sm:text-sm">
                    {termek.hozzavalok?.trim()}
                  </p>
                </section>
              )}

              {hasAllergens && (
                <section className="rounded-xl border border-[#d7a76b]/35 bg-[#fff8ed] px-4 py-3">
                  <div className="flex items-center gap-2 text-[#805326]">
                    <TriangleAlert className="h-4 w-4" />
                    <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                      Allergének
                    </h3>
                  </div>
                  <p className="mt-1.5 font-sans text-xs leading-6 text-[#805f43] sm:text-sm">
                    {termek.allergenek?.trim()}
                  </p>
                </section>
              )}
            </div>
          )}

          {props.mode === "catalog" ? (
            <div className="mt-6 border-t border-[#eadfd2] pt-5">
              <div className="flex items-center gap-2 text-[#7b593f]">
                <CalendarDays className="h-4 w-4 text-[#c79a66]" />
                <h3 className="font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                  Előrendelhető időpontok
                </h3>
              </div>

              {props.availability.length > 0 ? (
                <>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {props.availability.map((day) => (
                      <span
                        key={day.datum}
                        className="rounded-full border border-[#d8b98c]/45 bg-[#faf4eb] px-3 py-1.5 font-sans text-xs text-[#684733]"
                      >
                        {formatAvailabilityDate(day.datum)}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/elorendeles"
                    onClick={() => {
                      pushDataLayerEvent("product_preorder_clicked", {
                        product_id: termek.slug,
                        product_name: termek.nev,
                        price: termek.ar,
                        currency: "HUF",
                        item_category: termek.kategoria,
                        cta_location: "product_details",
                      });
                    }}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#4b2e1f] px-4 py-3 font-sans text-sm font-semibold text-[#fff9f0] transition-colors hover:bg-[#68432d]"
                  >
                    Előrendelés indítása
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#f3eee8] px-4 py-3 text-[#806f61]">
                  <Info className="h-4 w-4 shrink-0" />
                  <p className="font-sans text-sm font-medium">Jelenleg nem előrendelhető.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 border-t border-[#eadfd2] pt-5">
              <div className="mb-3 flex items-center gap-2 text-[#7b593f]">
                <ShoppingBag className="h-4 w-4 text-[#c79a66]" />
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.14em]">
                  Mennyiség erre a napra
                </p>
              </div>

              {props.quantity === 0 ? (
                <button
                  type="button"
                  onClick={() => props.onQuantityChange(1)}
                  className="w-full rounded-xl bg-[#4b2e1f] px-4 py-3 font-sans text-sm font-semibold text-[#fff9f0] transition-colors hover:bg-[#68432d]"
                >
                  + Kosárba teszem
                </button>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-[#d8b98c]/45 bg-[#faf4eb] p-2">
                  <button
                    type="button"
                    onClick={() => props.onQuantityChange(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#4b2e1f] shadow-sm transition-colors hover:bg-[#f2e4d3]"
                    aria-label="Kevesebb"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-sans text-sm font-bold text-[#4b2e1f]">
                    {props.quantity} db
                  </span>
                  <button
                    type="button"
                    onClick={() => props.onQuantityChange(1)}
                    disabled={props.quantity >= props.maxQuantity}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#4b2e1f] text-[#fff9f0] transition-colors hover:bg-[#68432d] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Több"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
