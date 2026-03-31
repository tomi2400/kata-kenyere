"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/termekek", label: "Termékek" },
  { href: "/rolunk", label: "Rólunk" },
  { href: "/alapanyagok", label: "Alapanyagok" },
  { href: "/kapcsolat", label: "Kapcsolat" },
];

export default function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow,transform,backdrop-filter] duration-500
        ${transparent && !open && !scrolled
          ? "bg-transparent"
          : "bg-cream/86 border-b border-gold/20 shadow-[0_14px_40px_rgba(61,35,20,0.08)] backdrop-blur-xl"
        }
      `}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div
            className={`
              flex h-16 items-center justify-between rounded-full px-4 sm:px-5
              transition-[background-color,border-color,box-shadow] duration-500
              ${transparent && !open && !scrolled
                ? "border border-cream/10 bg-white/0"
                : "border border-white/45 bg-white/35 shadow-[0_10px_35px_rgba(61,35,20,0.08)] backdrop-blur-xl"
              }
            `}
          >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 reveal-up">
            <Image
              src="/images/logo.png"
              alt="Kata Kenyere"
              width={38}
              height={38}
              className={transparent && !open && !scrolled ? "brightness-0 invert" : ""}
            />
            <span className={`font-serif text-base tracking-[0.02em] hidden sm:block ${transparent && !open && !scrolled ? "text-cream" : "text-brown-dark"}`}>
              Kata Kenyere
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7 reveal-up delay-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`
                  font-sans text-[13px] tracking-[0.08em] uppercase transition-colors rounded
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-1 px-1 py-0.5
                  ${pathname === l.href
                    ? "text-gold font-medium"
                    : transparent && !scrolled
                      ? "text-cream/72 hover:text-cream"
                      : "text-brown/60 hover:text-brown-dark"
                  }
                `}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* CTA + hamburger */}
          <div className="flex items-center gap-3">
            <Link
              href="/elorendeles"
              className="hidden sm:flex items-center gap-1.5 rounded-full px-5 py-2.5 font-sans text-sm font-semibold bg-gold text-brown-dark hover:bg-gold-light transition-colors reveal-up delay-2 hover-lift shadow-[0_10px_24px_rgba(31,20,12,0.14)]"
            >
              Előrendelés
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setOpen((v) => !v)}
              className={`md:hidden p-2 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${transparent && !open && !scrolled ? "text-cream" : "text-brown-dark"}`}
              aria-label={open ? "Menü bezárása" : "Menü megnyitása"}
              aria-expanded={open}
            >
              {open ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="mx-4 mt-3 rounded-[28px] border border-gold/15 bg-cream/95 px-4 py-4 space-y-1 shadow-[0_18px_48px_rgba(61,35,20,0.12)] backdrop-blur-xl md:hidden reveal-soft">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block rounded-2xl px-3 py-2.5 font-sans text-sm text-brown/80 hover:bg-brown-dark/5 hover:text-brown-dark transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/elorendeles"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-sans font-bold text-sm bg-gold text-brown-dark"
              >
                Előrendelés →
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Spacer (csak nem-transparent navnál) */}
      {!transparent && <div className="h-16" />}
    </>
  );
}
