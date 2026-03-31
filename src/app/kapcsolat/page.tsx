import Link from "next/link";
import Navbar from "@/components/Navbar";
import { MapPin, Clock, Phone, Mail } from "lucide-react";

export const metadata = {
  title: "Kapcsolat és elérhetőségek – Pécs, Salakhegyi út 14.",
  description:
    "Kata Kenyere pékség elérhetőségei: cím (Pécs, Salakhegyi út 14.), nyitvatartás (K–P 8–17h), telefon, email. Kérdéssel fordulj hozzánk bátran!",
  alternates: {
    canonical: "https://katakenyere.hu/kapcsolat",
  },
  openGraph: {
    title: "Kapcsolat – Kata Kenyere, Pécs",
    description: "Pécs, Salakhegyi út 14. · Kedd–Péntek 8:00–17:00",
    url: "https://katakenyere.hu/kapcsolat",
  },
};

export default function KapcsolatPage() {
  return (
    <div className="min-h-screen bg-cream grain-overlay">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <section className="paper-panel warm-ring rounded-[1.9rem] px-6 py-8 mb-10 reveal-scale">
          <div className="w-10 h-px bg-gold mb-5" />
          <h1 className="font-serif text-4xl text-brown-dark mb-3">Kapcsolat</h1>
          <p className="font-sans text-brown/60">
            Kérdésed van? Szívesen segítünk.
          </p>
        </section>

        <section className="space-y-6 mb-12">
          {[
            {
              Icon: MapPin,
              title: "Cím",
              lines: ["Pécs, Salakhegyi út 14.", "7624 Pécs"],
            },
            {
              Icon: Clock,
              title: "Nyitvatartás",
              lines: ["Kedd – Péntek: 8:00–17:00", "Hétvégén zárva"],
            },
            {
              Icon: Phone,
              title: "Telefon",
              lines: ["+36 ....."],
            },
            {
              Icon: Mail,
              title: "Email",
              lines: ["hello@katakenyere.hu"],
            },
          ].map(({ Icon, title, lines }) => (
            <div key={title} className="flex items-start gap-5 p-5 bg-cream-dark rounded-xl reveal-up hover-lift">
              <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-gold" />
              </div>
              <div>
                <p className="font-sans text-xs text-brown/40 uppercase tracking-wider mb-1">{title}</p>
                {lines.map((line) => (
                  <p key={line} className="font-sans text-sm text-brown-dark font-medium">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="mb-12 reveal-up delay-2">
          <h2 className="font-serif text-xl text-brown-dark mb-4">Kövess minket</h2>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-sans text-sm font-semibold border-2 border-gold/30 text-brown-dark hover:border-gold transition-colors hover-lift"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-sans text-sm font-semibold border-2 border-gold/30 text-brown-dark hover:border-gold transition-colors hover-lift"
            >
              Facebook
            </a>
          </div>
        </section>

        <div className="bg-brown-dark rounded-2xl p-8 text-center reveal-scale delay-3">
          <p className="font-serif text-2xl text-cream mb-2">Inkább rendelnél?</p>
          <p className="font-sans text-cream/60 text-sm mb-6">Válaszd ki a napot és állítsd össze a rendelésedet.</p>
          <Link
            href="/elorendeles"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-sans font-bold text-sm bg-gold text-brown-dark hover:bg-gold-light transition-colors hover-lift"
          >
            Előrendelés
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
