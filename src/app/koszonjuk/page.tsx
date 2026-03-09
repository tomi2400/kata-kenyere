import Image from "next/image";
import Link from "next/link";

export default function KoszonjukPage() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* HEADER */}
      <header className="px-6 py-5 flex items-center justify-between">
        <Image src="/images/logo.png" alt="Kata Kenyere" width={40} height={40} />
      </header>

      {/* TARTALOM */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
        {/* Ikon */}
        <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <div className="w-10 h-px bg-gold mx-auto mb-5" />

        <h1 className="font-serif text-4xl text-brown-dark mb-3">
          Köszönjük<br />a rendelésedet!
        </h1>

        <p className="font-sans text-brown/60 text-base max-w-sm mb-8 leading-relaxed">
          Emailben küldtünk visszaigazolást a rendelésed részleteivel.
          Kérjük, ellenőrizd a postaládádat.
        </p>

        {/* Átvétel info */}
        <div className="bg-brown-dark rounded-2xl p-6 w-full max-w-sm mb-8 text-left">
          <p className="font-sans text-xs text-cream/40 uppercase tracking-wider mb-3">Átvétel</p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-gold text-lg">📍</span>
              <span className="font-sans text-sm text-cream">Pécs, Salakhegyi út 14.</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gold text-lg">🕐</span>
              <span className="font-sans text-sm text-cream">Kedd – Péntek: 8:00–17:00</span>
            </div>
          </div>
        </div>

        {/* CTA-k */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
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
            className="flex-1 py-3 px-6 rounded-xl font-sans font-semibold text-sm border-2 border-gold/30 text-brown-dark hover:border-gold transition-colors text-center"
          >
            Kövess minket
          </a>
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
