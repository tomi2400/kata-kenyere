"use client";

import { useState } from "react";
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
  const pathname = usePathname();

  return (
    <>
      <header className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${transparent && !open
          ? "bg-transparent"
          : "bg-cream/95 backdrop-blur-sm border-b border-gold/20 shadow-sm"
        }
      `}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/images/logo.png"
              alt="Kata Kenyere"
              width={38}
              height={38}
              className={transparent && !open ? "brightness-0 invert" : ""}
            />
            <span className={`font-serif text-base hidden sm:block ${transparent && !open ? "text-cream" : "text-brown-dark"}`}>
              Kata Kenyere
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`
                  font-sans text-sm transition-colors
                  ${pathname === l.href
                    ? "text-gold font-medium"
                    : transparent
                      ? "text-cream/80 hover:text-cream"
                      : "text-brown/70 hover:text-brown-dark"
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
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg font-sans font-semibold text-sm bg-gold text-brown-dark hover:bg-gold-light transition-colors"
            >
              Előrendelés
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setOpen((v) => !v)}
              className={`md:hidden p-2 rounded-lg ${transparent && !open ? "text-cream" : "text-brown-dark"}`}
              aria-label="Menü"
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

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-cream border-t border-gold/20 px-4 py-4 space-y-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block py-2.5 font-sans text-sm text-brown/80 hover:text-brown-dark transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/elorendeles"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-sans font-bold text-sm bg-gold text-brown-dark"
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
