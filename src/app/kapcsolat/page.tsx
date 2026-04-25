import Link from "next/link";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, MapPin, Clock, Phone, Mail } from "lucide-react";
import { defaultOpenGraphImage } from "@/lib/seo";

export const metadata = {
  title: "Kapcsolat és elérhetőségek – Pécs, Salakhegyi út 14.",
  description: "Kata Kenyere pékség elérhetőségei: cím (Pécs, Salakhegyi út 14.), nyitvatartás (K–P 8–17h), telefon, email.",
  alternates: { canonical: "https://katakenyere.hu/kapcsolat" },
  openGraph: {
    title: "Kapcsolat – Kata Kenyere, Pécs",
    description: "Pécs, Salakhegyi út 14. · Kedd–Péntek 8:00–17:00",
    url: "https://katakenyere.hu/kapcsolat",
    images: [defaultOpenGraphImage],
  },
};

export default function KapcsolatPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] grain-overlay text-[#4b2e1f]">
      <Navbar />

      <main className="mx-auto max-w-2xl px-6 py-16 md:px-8">

        <ScrollReveal variant="up">
          <div className="mb-5 h-px w-10 bg-[#d0af77]" />
          <h1 className="font-serif text-[2.6rem] leading-[1.05] text-[#3d2314] md:text-[3.2rem]">Kapcsolat</h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-[#7c5a46]">Kérdésed van? Szívesen segítünk.</p>
        </ScrollReveal>

        <div className="mt-10 space-y-4">
          {[
            { Icon: MapPin, title: "Cím", lines: ["Pécs, Salakhegyi út 14.", "7624 Pécs"] },
            { Icon: Clock, title: "Nyitvatartás", lines: ["Kedd – Péntek: 8:00–17:00", "Hétvégén zárva"] },
            { Icon: Phone, title: "Telefon", lines: ["+36 30 936 2058"] },
            { Icon: Mail, title: "Email", lines: ["kataleskovar@gmail.com"] },
          ].map(({ Icon, title, lines }, i) => (
            <ScrollReveal key={title} variant="up" delay={i * 60}>
              <div className="flex items-start gap-5 rounded-[20px] border border-[#ede8df] bg-white p-5 transition-all duration-300 hover:border-[#c79a66]/40 hover:shadow-[0_8px_24px_rgba(91,56,38,0.07)]">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#c79a66]/10">
                  <Icon className="h-3.5 w-3.5 text-[#c79a66]" />
                </div>
                <div>
                  <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#9a7a5d]">{title}</p>
                  {lines.map((line) => (
                    <p key={line} className="mt-0.5 font-sans text-sm font-medium text-[#4b2e1f]">{line}</p>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal variant="up" delay={240} className="mt-10">
          <h2 className="mb-4 font-serif text-xl text-[#3d2314]">Kövess minket</h2>
          <div className="flex gap-3">
            {["Instagram", "Facebook"].map((platform) => (
              <a
                key={platform}
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[#c79a66]/40 px-5 py-2.5 font-sans text-sm font-medium text-[#5b3826] transition-all duration-300 hover:border-[#c79a66] hover:bg-[#c79a66]/6"
              >
                {platform}
              </a>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="scale" delay={300} className="mt-12">
          <div className="rounded-[20px] bg-[#3e2315] p-8 text-center">
            <p className="font-serif text-[1.6rem] text-[#fff5ea]">Inkább rendelnél?</p>
            <p className="mt-2 font-sans text-sm text-[#e8d6c0]/60">Válaszd ki a napot és állítsd össze a rendelésedet.</p>
            <Link
              href="/elorendeles"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#c79a66] px-7 py-[0.9rem] font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(199,154,102,0.38)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b98b58] hover:shadow-[0_14px_32px_rgba(199,154,102,0.44)]"
            >
              Előrendelés
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </ScrollReveal>

      </main>
    </div>
  );
}
