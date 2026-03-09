import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Kapcsolat – Kata Kenyere",
  description: "Lépj kapcsolatba a Kata Kenyere pékséggel. Cím, telefonszám, email.",
};

export default function KapcsolatPage() {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      <main className="max-w-2xl mx-auto px-6 py-16">
        <div className="w-10 h-px bg-gold mb-5" />
        <h1 className="font-serif text-4xl text-brown-dark mb-3">Kapcsolat</h1>
        <p className="font-sans text-brown/60 mb-12">
          Kérdésed van? Szívesen segítünk.
        </p>

        {/* Elérhetőségek */}
        <section className="space-y-6 mb-12">
          {[
            {
              icon: "📍",
              title: "Cím",
              lines: ["Pécs, Salakhegyi út 14.", "7624 Pécs"],
            },
            {
              icon: "🕐",
              title: "Nyitvatartás",
              lines: ["Kedd – Péntek: 8:00–17:00", "Hétvégén zárva"],
            },
            {
              icon: "📞",
              title: "Telefon",
              lines: ["+36 ....."],
            },
            {
              icon: "✉️",
              title: "Email",
              lines: ["hello@katakenyere.hu"],
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-5 p-5 bg-cream-dark rounded-xl">
              <span className="text-2xl mt-0.5">{item.icon}</span>
              <div>
                <p className="font-sans text-xs text-brown/40 uppercase tracking-wider mb-1">{item.title}</p>
                {item.lines.map((line) => (
                  <p key={line} className="font-sans text-sm text-brown-dark font-medium">{line}</p>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Közösségi média */}
        <section className="mb-12">
          <h2 className="font-serif text-xl text-brown-dark mb-4">Kövess minket</h2>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-sans text-sm font-semibold border-2 border-gold/30 text-brown-dark hover:border-gold transition-colors"
            >
              Instagram
            </a>
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-sans text-sm font-semibold border-2 border-gold/30 text-brown-dark hover:border-gold transition-colors"
            >
              Facebook
            </a>
          </div>
        </section>

        {/* CTA */}
        <div className="bg-brown-dark rounded-2xl p-8 text-center">
          <p className="font-serif text-2xl text-cream mb-2">Inkább rendelnél?</p>
          <p className="font-sans text-cream/60 text-sm mb-6">Válaszd ki a napot és állítsd össze a rendelésedet.</p>
          <Link
            href="/elorendeles"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-sans font-bold text-sm bg-gold text-brown-dark hover:bg-gold-light transition-colors"
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
