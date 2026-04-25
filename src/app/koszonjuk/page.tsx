"use client";

import { useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Image from "next/image";
import { MapPin, Clock, Mail } from "lucide-react";

function KoszonjukContent() {
  const router = useRouter();
  const [rendelesSzam, setRendelesSzam] = useState<string | null>(null);

  useEffect(() => {
    const szam = sessionStorage.getItem("rendelesSzam");
    if (szam) {
      setRendelesSzam(szam);
      sessionStorage.removeItem("rendelesSzam");
    }
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-start bg-[#F4F2EC] px-4 pb-8 pt-8 sm:justify-center sm:px-5 sm:py-16">

      {/* Logo */}
      <div className="mb-6 sm:mb-10">
        <Image src="/images/Logo_web_dark.png" alt="Kata Kenyere" width={36} height={36} />
      </div>

      <div className="w-full max-w-[26rem]">

        {/* Fejléc */}
        <div className="mb-5 text-center sm:mb-6">
          <p className="mb-2.5 font-sans text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#9c6f3a] sm:mb-3 sm:text-[0.65rem] sm:tracking-[0.2em]">
            Rendelés leadva
          </p>
          <h1 className="font-serif text-[clamp(2rem,12vw,2.8rem)] leading-[1.05] text-[#2C1F14] sm:text-[clamp(2.2rem,5vw,3rem)] sm:leading-[1.1]">
            Köszönjük<br />
            <em className="italic text-[#9c6f3a]">a rendelést.</em>
          </h1>
          {rendelesSzam && (
            <p className="mt-3 break-words font-sans text-[0.76rem] text-[#6b5a47]">
              Rendelésszám:{" "}
              <span className="font-medium text-[#2C1F14]">{rendelesSzam}</span>
            </p>
          )}
        </div>

        {/* Email értesítő */}
        <div className="mb-3 flex max-w-full items-start gap-3 rounded-2xl border border-[rgba(156,111,58,0.2)] bg-white px-4 py-4 shadow-[0_2px_12px_rgba(44,31,20,0.06)] sm:mb-4 sm:gap-4 sm:rounded-xl sm:px-5">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(156,111,58,0.1)]">
            <Mail className="h-3.5 w-3.5 text-[#9c6f3a]" />
          </div>
          <div className="min-w-0">
            <p className="font-sans text-[0.84rem] font-medium leading-snug text-[#2C1F14]">
              Emailben is elküldtük az összefoglalót
            </p>
            <p className="mt-1 font-sans text-[0.78rem] leading-[1.55] text-[#6b5a47] sm:text-[0.8rem] sm:leading-[1.65]">
              Nézd meg a beérkező leveleidet — ott megtalálod a rendelésed részleteit.
              Ha nem érkezik meg pár percen belül, ellenőrizd a spam mappát is.
            </p>
          </div>
        </div>

        {/* Átvétel */}
        <div className="mb-3 overflow-hidden rounded-2xl border border-[rgba(156,111,58,0.2)] bg-white shadow-[0_2px_12px_rgba(44,31,20,0.06)] sm:mb-4 sm:rounded-xl">
          <div className="border-b border-[rgba(156,111,58,0.12)] px-4 py-3 sm:px-5">
            <p className="font-sans text-[0.62rem] font-medium uppercase tracking-[0.16em] text-[#9c6f3a] sm:text-[0.65rem] sm:tracking-[0.18em]">
              Személyes átvétel
            </p>
          </div>
          <div className="divide-y divide-[rgba(156,111,58,0.1)]">
            <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#9c6f3a]" />
              <p className="min-w-0 font-sans text-[0.84rem] leading-snug text-[#2C1F14]">Pécs, Salakhegyi út 14.</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#9c6f3a]" />
              <p className="min-w-0 font-sans text-[0.84rem] leading-snug text-[#2C1F14]">Kedd – Péntek, 8:00–17:00</p>
            </div>
          </div>
        </div>

        {/* Idézet */}
        <div className="mb-6 rounded-2xl bg-[#3B2010] px-4 py-4 sm:mb-8 sm:rounded-xl sm:px-5 sm:py-5">
          <p className="font-serif text-[0.98rem] italic leading-[1.55] text-[rgba(244,242,236,0.85)] sm:text-[1.05rem] sm:leading-[1.7]">
            {`„Frissen sütjük neked. Várunk szeretettel."`}
          </p>
          <p className="mt-2 font-sans text-[0.72rem] text-[rgba(244,242,236,0.85)] sm:text-[0.75rem]">— Kata Kenyere</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/")}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#9c6f3a] px-5 py-[0.9rem] font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(156,111,58,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8a6030] hover:shadow-[0_14px_32px_rgba(156,111,58,0.42)]"
        >
          Vissza a főoldalra
        </button>

      </div>
    </div>
  );
}

export default function KoszonjukPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F4F2EC]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9c6f3a] border-t-transparent" />
      </div>
    }>
      <KoszonjukContent />
    </Suspense>
  );
}
