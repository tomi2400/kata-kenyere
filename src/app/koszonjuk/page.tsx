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
    <div className="flex min-h-screen flex-col bg-[#fafaf8] grain-overlay text-[#4b2e1f]">
      <header className="border-b border-[#ede8df] bg-white/90 px-6 py-4 backdrop-blur-sm">
        <Image src="/images/logo.png" alt="Kata Kenyere" width={36} height={36} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-full max-w-lg rounded-[24px] border border-[#ede8df] bg-white px-6 py-10 md:px-8 md:py-12">

          {/* Pipa ikon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#c79a66]/15">
            <svg className="h-10 w-10 text-[#c79a66]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div className="mx-auto mb-5 h-px w-10 bg-[#d0af77]" />

          <h1 className="font-serif text-[2rem] text-[#3d2314] md:text-[2.4rem]">
            Köszönjük<br />a rendelésedet!
          </h1>
          <p className="mx-auto mt-4 max-w-sm font-sans text-[0.9rem] leading-relaxed text-[#7c5a46]">
            A rendelésed sikeresen beérkezett hozzánk.
          </p>

          {rendelesSzam && (
            <div className="mx-auto mt-6 w-full max-w-xs rounded-[16px] border border-[#ede8df] bg-[#fafaf8] px-5 py-4">
              <p className="font-sans text-[11px] uppercase tracking-[0.18em] text-[#9a7a5d]">Rendelési azonosító</p>
              <p className="mt-1.5 font-sans text-lg font-semibold text-[#3d2314]">{rendelesSzam}</p>
            </div>
          )}

          {/* Átvétel info */}
          <div className="mx-auto mt-6 w-full max-w-xs rounded-[16px] bg-[#3e2315] p-5 text-left">
            <p className="mb-3 font-sans text-[11px] uppercase tracking-[0.18em] text-[#e8d6c0]/50">Átvétel</p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-[#c79a66]" />
                <span className="font-sans text-sm text-[#e8d6c0]">Pécs, Salakhegyi út 14.</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 shrink-0 text-[#c79a66]" />
                <span className="font-sans text-sm text-[#e8d6c0]">Kedd – Péntek: 8:00–17:00</span>
              </div>
            </div>
          </div>

          <div className="mx-auto mt-8 flex w-full max-w-xs flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex-1 rounded-full bg-[#c79a66] py-3 px-6 text-center font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_6px_18px_rgba(199,154,102,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b98b58]"
            >
              Új rendelés
            </Link>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-full border border-[#c79a66]/40 py-3 px-6 text-center font-sans text-sm font-semibold text-[#5b3826] transition-all duration-300 hover:border-[#c79a66] hover:bg-[#c79a66]/6"
            >
              Kövess minket
            </a>
          </div>
        </div>
      </main>

      <footer className="px-6 py-4 text-center">
        <p className="font-sans text-xs text-[#9a7a5d]">
          © 2026 Kata Kenyere ·{" "}
          <Link href="/impresszum" className="transition-colors hover:text-[#4b2e1f]">Impresszum</Link>
        </p>
      </footer>
    </div>
  );
}
