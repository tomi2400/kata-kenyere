"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import { MapPin, Clock, Mail } from "lucide-react";

function KoszonjukContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rendelesSzam = searchParams.get("rendelesSzam");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F4F2EC] px-5 py-16">

      {/* Logo */}
      <div className="mb-10">
        <Image src="/images/Logo_web_dark.png" alt="Kata Kenyere" width={40} height={40} />
      </div>

      <div className="w-full max-w-md">

        {/* Fejléc */}
        <div className="mb-6 text-center">
          <p className="mb-3 font-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[#9c6f3a]">
            Rendelés leadva
          </p>
          <h1 className="font-serif text-[clamp(2.2rem,5vw,3rem)] leading-[1.1] text-[#2C1F14]">
            Köszönjük<br />
            <em className="italic text-[#9c6f3a]">a rendelést.</em>
          </h1>
          {rendelesSzam && (
            <p className="mt-3 font-sans text-[0.78rem] text-[#6b5a47]">
              Rendelésszám:{" "}
              <span className="font-medium text-[#2C1F14]">{rendelesSzam}</span>
            </p>
          )}
        </div>

        {/* Email értesítő */}
        <div className="mb-4 flex items-start gap-4 rounded-xl border border-[rgba(156,111,58,0.2)] bg-white px-5 py-4 shadow-[0_2px_12px_rgba(44,31,20,0.06)]">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[rgba(156,111,58,0.1)]">
            <Mail className="h-3.5 w-3.5 text-[#9c6f3a]" />
          </div>
          <div>
            <p className="font-sans text-[0.85rem] font-medium text-[#2C1F14]">
              Emailben is elküldtük az összefoglalót
            </p>
            <p className="mt-0.5 font-sans text-[0.8rem] leading-[1.65] text-[#6b5a47]">
              Nézd meg a beérkező leveleidet — ott megtalálod a rendelésed részleteit.
              Ha nem érkezik meg pár percen belül, ellenőrizd a spam mappát is.
            </p>
          </div>
        </div>

        {/* Átvétel */}
        <div className="mb-4 overflow-hidden rounded-xl border border-[rgba(156,111,58,0.2)] bg-white shadow-[0_2px_12px_rgba(44,31,20,0.06)]">
          <div className="border-b border-[rgba(156,111,58,0.12)] px-5 py-3">
            <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[#9c6f3a]">
              Személyes átvétel
            </p>
          </div>
          <div className="divide-y divide-[rgba(156,111,58,0.1)]">
            <div className="flex items-center gap-3 px-5 py-3.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#9c6f3a]" />
              <p className="font-sans text-[0.85rem] text-[#2C1F14]">Pécs, Salakhegyi út 14.</p>
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Clock className="h-3.5 w-3.5 shrink-0 text-[#9c6f3a]" />
              <p className="font-sans text-[0.85rem] text-[#2C1F14]">Kedd – Péntek, 8:00–17:00</p>
            </div>
          </div>
        </div>

        {/* Idézet */}
        <div className="mb-8 rounded-xl bg-[#3B2010] px-5 py-5">
          <p className="font-serif text-[1.05rem] italic leading-[1.7] text-[rgba(244,242,236,0.85)]">
            {`„Frissen sütjük neked. Várunk szeretettel."`}
          </p>
          <p className="mt-2 font-sans text-[0.75rem] text-[rgba(244,242,236,0.4)]">— Kata és csapata</p>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push("/")}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#9c6f3a] py-[0.95rem] font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(156,111,58,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8a6030]"
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
