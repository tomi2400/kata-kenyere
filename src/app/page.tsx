import Image from "next/image";
import Link from "next/link";
import DaySelector from "@/components/DaySelector";
import { getAvailableOrderDays } from "@/lib/deadline";

export default function Home() {
  const days = getAvailableOrderDays();

  return (
    <main className="min-h-screen bg-cream">
      {/* NAV */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-5">
        <Image
          src="/images/logo.png"
          alt="Kata Kenyere"
          width={52}
          height={52}
          className="drop-shadow-sm"
        />
        <Link
          href="/rolunk"
          className="font-sans text-sm text-cream/90 hover:text-cream transition-colors"
        >
          Rólunk
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative h-[70vh] min-h-[480px] flex items-end">
        <Image
          src="/images/termek-placeholder.jpg"
          alt="Kata Kenyere kovászos kenyér"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brown-dark via-brown-dark/60 to-transparent" />

        <div className="relative z-10 px-6 pb-12 md:px-12 max-w-3xl">
          <p className="font-sans text-xs tracking-widest text-gold uppercase mb-3">
            Kata Kenyere · Pécs
          </p>
          <h1 className="font-serif text-5xl md:text-6xl text-cream leading-tight mb-3">
            Frissen
            <br />
            <em className="text-gold not-italic">az igazi.</em>
          </h1>
          <p className="font-sans text-cream/80 text-base md:text-lg max-w-md">
            Kovásszal kelesztve, kézzel formázva,
            <br />
            minden nap frissen sütve.
          </p>
        </div>
      </section>

      {/* INFO SÁV */}
      <section className="bg-brown-dark text-cream">
        <div className="max-w-3xl mx-auto px-6 py-5 flex flex-wrap gap-6 items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-gold text-lg">📍</span>
            <div>
              <p className="text-xs text-cream/50 uppercase tracking-wider font-sans">Helyszín</p>
              <p className="font-sans text-sm font-medium">Pécs, Salakhegyi út 14.</p>
            </div>
          </div>
          <div className="w-px h-8 bg-cream/10 hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-gold text-lg">🕐</span>
            <div>
              <p className="text-xs text-cream/50 uppercase tracking-wider font-sans">Nyitvatartás</p>
              <p className="font-sans text-sm font-medium">K–P: 8:00–17:00</p>
            </div>
          </div>
          <div className="w-px h-8 bg-cream/10 hidden sm:block" />
          <div className="flex items-center gap-3">
            <span className="text-gold text-lg">🏠</span>
            <div>
              <p className="text-xs text-cream/50 uppercase tracking-wider font-sans">Átvétel</p>
              <p className="font-sans text-sm font-medium">Személyesen a pékségben</p>
            </div>
          </div>
        </div>
      </section>

      {/* NAP VÁLASZTÓ */}
      <section className="py-16 px-4">
        <div className="text-center mb-10">
          <div className="w-12 h-px bg-gold mx-auto mb-6" />
          <h2 className="font-serif text-3xl md:text-4xl text-brown-dark mb-3">
            Melyik napra rendelsz?
          </h2>
          <p className="font-sans text-brown/60 text-sm">
            Válaszd ki a napot — termékeket a következő oldalon választhatsz
          </p>
        </div>

        <DaySelector days={days} />
      </section>

      {/* MIÉRT MI */}
      <section className="bg-brown-dark text-cream py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-12 h-px bg-gold mx-auto mb-6" />
          <h2 className="font-serif text-3xl mb-10">
            Mindent frissen,
            <br />
            <em className="text-gold not-italic">kézzel készítünk</em>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 text-left">
            {[
              {
                icon: "🌾",
                cim: "Kovászos kelesztés",
                szoveg:
                  "Minden kenyerünk természetes kovásszal készül, adalékanyagok nélkül.",
              },
              {
                icon: "🤲",
                cim: "Kézzel formázva",
                szoveg:
                  "Gép nem érinti a tésztát – minden cipót saját kezünkkel formázunk.",
              },
              {
                icon: "🔥",
                cim: "Naponta frissen",
                szoveg:
                  "Csak annyit sütünk amennyit előrendeltek. Nincs felesleges veszteség.",
              },
            ].map((item) => (
              <div key={item.cim}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-serif text-lg text-gold mb-2">{item.cim}</h3>
                <p className="font-sans text-cream/70 text-sm leading-relaxed">
                  {item.szoveg}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-brown-dark border-t border-cream/10 py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Image
            src="/images/logo.png"
            alt="Kata Kenyere"
            width={36}
            height={36}
            className="opacity-70"
          />
          <div className="flex gap-6 text-xs text-cream/40 font-sans">
            <Link
              href="/impresszum"
              className="hover:text-cream/70 transition-colors"
            >
              Impresszum
            </Link>
            <Link
              href="/adatvedelmi"
              className="hover:text-cream/70 transition-colors"
            >
              Adatvédelem
            </Link>
            <Link
              href="/rolunk"
              className="hover:text-cream/70 transition-colors"
            >
              Rólunk
            </Link>
          </div>
          <p className="text-xs text-cream/30 font-sans">© 2026 Kata Kenyere</p>
        </div>
      </footer>
    </main>
  );
}
