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
        fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color,box-shadow] duration-500
        ${transparent && !open && !scrolled
          ? "bg-transparent"
          : "border-b border-[#ede8df] bg-white/95 shadow-[0_12px_28px_rgba(61,35,20,0.08)] backdrop-blur-md"
        }
      `}>
        <div className="w-full px-6 md:px-8 xl:px-10 2xl:px-12">
          <div className="grid h-[76px] grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 reveal-up justify-self-start">
              <Image
                src={transparent && !open && !scrolled ? "/images/Logo_web_white.png" : "/images/Logo_web_dark.png"}
                alt="Kata Kenyere"
                width={32}
                height={32}
                className="opacity-95"
              />
              <span className={`font-serif text-[1.1rem] tracking-[0.01em] hidden sm:block ${transparent && !open && !scrolled ? "text-[#f8edde]" : "text-brown-dark"}`}>
                Kata Kenyere
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-10 reveal-up delay-1 justify-self-center">
              {LINKS.map((l) => (
                <Link
                key={l.href}
                href={l.href}
                className={`
                    font-sans text-[13px] font-normal tracking-[0.03em] transition-colors rounded
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 focus-visible:ring-offset-1 px-1 py-0.5
                    ${pathname === l.href
                      ? "text-gold-dark"
                      : transparent && !scrolled
                        ? "text-[#f0dfca] hover:text-[#fff5e9]"
                        : "text-brown/68 hover:text-brown-dark"
                    }
                  `}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* CTA + hamburger */}
            <div className="flex items-center gap-3 justify-self-end">
              <Link
                href="/elorendeles"
                className="hidden sm:flex items-center gap-1.5 rounded-full px-5 py-2.5 font-sans text-sm font-semibold bg-[#c79a66] text-[#fff7eb] hover:bg-[#b98b58] transition-colors reveal-up delay-2"
              >
                Előrendelés
              </Link>

              {/* Hamburger */}
              <button
                onClick={() => setOpen((v) => !v)}
                className={`md:hidden p-2 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${transparent && !open && !scrolled ? "text-[#f6ead8]" : "text-brown-dark"}`}
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
          <div className="mx-4 mb-4 rounded-[24px] border border-[#ede8df] bg-white/95 px-4 py-4 space-y-1 shadow-[0_18px_40px_rgba(61,35,20,0.1)] md:hidden reveal-soft backdrop-blur-md">
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
                className="flex items-center justify-center gap-2 w-full py-3 rounded-full font-sans font-bold text-sm bg-[#c79a66] text-[#fff7eb]"
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
