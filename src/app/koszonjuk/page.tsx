import Image from "next/image";
import Link from "next/link";
import { MapPin, Clock } from "lucide-react";

export default function KoszonjukPage({
  searchParams,
}: {
  searchParams?: { rendelesSzam?: string };
}) {
  const rendelesSzam = searchParams?.rendelesSzam;

  return (
    <div className="min-h-screen bg-cream flex flex-col grain-overlay">
      <header className="px-6 py-5 flex items-center justify-between">
        <Image src="/images/logo.png" alt="Kata Kenyere" width={40} height={40} />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="paper-panel warm-ring rounded-[2rem] w-full max-w-xl px-6 py-10 md:px-8 md:py-12">
          <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mb-6 mx-auto">
            <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="w-10 h-px bg-gold mx-auto mb-5" />

          <h1 className="font-serif text-4xl text-brown-dark mb-3">
            Köszönjük<br />a rendelésedet!
          </h1>

          <p className="font-sans text-brown/60 text-base max-w-sm mb-8 leading-relaxed mx-auto">
            A rendelésed sikeresen beérkezett hozzánk.
            Ezt az oldalt használhatjuk stabil sikeres rendelési eseményként a mérésekhez is.
          </p>

          {rendelesSzam && (
            <div className="mb-8 rounded-2xl border border-gold/20 bg-white px-5 py-4 w-full max-w-sm mx-auto">
              <p className="font-sans text-xs text-brown/40 uppercase tracking-wider">Rendelési azonosító</p>
              <p className="font-sans text-lg font-semibold text-brown-dark mt-2">{rendelesSzam}</p>
            </div>
          )}

          <div className="bg-brown-dark rounded-2xl p-6 w-full max-w-sm mb-8 text-left mx-auto shadow-[0_18px_32px_rgba(61,35,20,0.16)]">
            <p className="font-sans text-xs text-cream/40 uppercase tracking-wider mb-3">Átvétel</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gold shrink-0" />
                <span className="font-sans text-sm text-cream">Pécs, Salakhegyi út 14.</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gold shrink-0" />
                <span className="font-sans text-sm text-cream">Kedd – Péntek: 8:00–17:00</span>
              </div>
            </div>
          </div>

          <p className="font-sans text-xs text-brown/45 max-w-sm mb-8 leading-relaxed mx-auto">
            Az automatikus emailes visszaigazolást a következő fejlesztési körben kötjük rá erre a sikeres leadási pontra.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm mx-auto">
            <Link
              href="/"
              className="flex-1 py-3 px-6 rounded-xl font-sans font-semibold text-sm bg-brown-dark text-cream hover:bg-brown transition-colors text-center"
            >
              Új rendelés
            </Link>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-6 rounded-xl font-sans font-semibold text-sm border-2 border-gold/30 text-brown-dark hover:border-gold transition-colors text-center bg-white/70"
            >
              Kövess minket
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="px-6 py-4 text-center">
        <p className="font-sans text-xs text-brown/30">
          © 2026 Kata Kenyere ·{" "}
          <Link href="/impresszum" className="hover:text-brown/50 transition-colors">Impresszum</Link>
        </p>
      </footer>
    </div>
  );
}
