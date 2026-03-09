import Image from "next/image";
import Link from "next/link";
import { getTermekekByKategoria } from "@/lib/products";
import Navbar from "@/components/Navbar";

export default function TermekekPage() {
  const termekekByKategoria = getTermekekByKategoria();

  return (
    <div className="bg-cream min-h-screen">
      <Navbar />

      {/* Page header */}
      <div className="max-w-5xl mx-auto px-6 pt-12 pb-8">
        <div className="w-10 h-px bg-gold mb-4" />
        <h1 className="font-serif text-4xl text-brown-dark">Kínálatunk</h1>
        <p className="font-sans text-brown/60 mt-2">
          Kézműves kovászos termékek, frissen sütve
        </p>
      </div>

      {/* Product categories */}
      {Object.entries(termekekByKategoria).map(([kategoria, termekek]) => (
        <section key={kategoria} className="max-w-5xl mx-auto px-6 mb-10">
          <h2 className="font-serif text-xl text-brown-dark border-b border-gold/30 pb-2 mb-4">
            {kategoria}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {termekek.map((termek) => (
              <div
                key={termek.id}
                className="bg-cream-dark rounded-xl overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-[4/3]">
                  <Image
                    src={termek.foto}
                    alt={termek.nev}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                </div>

                {/* Content */}
                <div className="p-3">
                  <p className="font-serif text-sm font-semibold text-brown-dark">
                    {termek.nev}
                  </p>
                  <p className="font-sans text-xs text-brown/50">
                    {termek.egyseg}
                  </p>
                  <p className="font-sans text-sm font-bold text-brown-dark mt-1">
                    {termek.ar.toLocaleString("hu-HU")} Ft
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Bottom CTA */}
      <div className="bg-brown-dark text-cream py-16 text-center">
        <div className="max-w-xl mx-auto">
          <div className="w-10 h-px bg-gold mx-auto mb-6" />
          <h2 className="font-serif text-3xl text-cream mb-3">
            Rendeld meg előre
          </h2>
          <p className="font-sans text-cream/60 mb-6">
            Válaszd ki a napot, add le a rendelésedet, és vedd át frissen sütve.
          </p>
          <Link
            href="/elorendeles"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-sans font-bold bg-gold text-brown-dark hover:bg-gold-light transition-colors"
          >
            Előrendelés indítása
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
