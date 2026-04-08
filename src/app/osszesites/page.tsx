"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { formatAr } from "@/lib/products";

function formatDatum(datum: string): string {
  const d = new Date(datum);
  return d.toLocaleDateString("hu-HU", { month: "long", day: "numeric", weekday: "long" });
}

export default function OsszesitesPage() {
  const router = useRouter();
  const { selectedDays, carts, getTotal, clearCart, setCurrentStep } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nev: "", email: "", telefon: "", megjegyzes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (mounted && selectedDays.length === 0) router.replace("/"); }, [mounted, selectedDays, router]);

  if (!mounted || selectedDays.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fafaf8]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#c79a66] border-t-transparent" />
      </div>
    );
  }

  const total = getTotal();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.nev.trim()) e.nev = "Kötelező";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Érvényes email kell";
    if (!form.telefon.trim()) e.telefon = "Kötelező";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    const rendelesek = selectedDays.flatMap((day) =>
      (carts[day.datum] ?? []).map((item) => ({
        nap: day.nap, datum: day.datum, termekId: item.termekId,
        nev: item.nev, mennyiseg: item.mennyiseg, egysegar: item.ar, reszosszeg: item.ar * item.mennyiseg,
      }))
    );
    try {
      const res = await fetch("/api/rendeles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rendelesek, vegosszeg: total }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        clearCart();
        const rendelesSzam = data?.rendelesSzam ? `?rendelesSzam=${encodeURIComponent(data.rendelesSzam)}` : "";
        router.push(`/koszonjuk${rendelesSzam}`);
      } else { alert("Hiba történt, kérlek próbáld újra!"); }
    } catch { alert("Hiba történt, kérlek próbáld újra!"); }
    finally { setLoading(false); }
  };

  const handleBack = () => { setCurrentStep(Math.max(0, selectedDays.length - 1)); router.push("/valasztas"); };

  return (
    <div className="min-h-screen bg-[#fafaf8] pb-12 grain-overlay text-[#4b2e1f]">
      <header className="border-b border-[#ede8df] bg-white/90 px-4 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/"><Image src="/images/logo.png" alt="Kata Kenyere" width={32} height={32} /></Link>
          <button onClick={handleBack} className="font-sans text-xs text-[#9a7a5d] transition-colors hover:text-[#4b2e1f] cursor-pointer">← Vissza</button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 pt-8">

        {/* Fejléc kártya */}
        <section className="overflow-hidden rounded-[20px] border border-[#ede8df] bg-white px-5 py-6 md:px-7 md:py-7">
          <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#9a7a5d]">Utolsó lépés</p>
          <h1 className="mt-1 font-serif text-[1.8rem] text-[#3d2314]">Rendelés összesítése</h1>
          <p className="mt-2 font-sans text-sm leading-relaxed text-[#7c5a46]">
            Nézd át nyugodtan a napokra bontott kosarat, aztán add meg az adataidat.
          </p>
        </section>

        {/* Napok */}
        <section className="space-y-3">
          {selectedDays.map((day) => {
            const items = carts[day.datum] ?? [];
            if (items.length === 0) return null;
            const dayTotal = items.reduce((s, i) => s + i.ar * i.mennyiseg, 0);
            return (
              <div key={day.datum} className="rounded-[20px] border border-[#ede8df] bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-serif text-base text-[#3d2314]">
                    {day.nap}
                    <span className="ml-2 font-sans text-xs font-normal text-[#9a7a5d]">{formatDatum(day.datum)}</span>
                  </h3>
                  <span className="font-sans text-sm font-semibold text-[#5b3826]">{formatAr(dayTotal)}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item.termekId} className="flex items-center justify-between text-sm">
                      <span className="font-sans text-[#7c5a46]">
                        {item.nev}<span className="ml-1 text-[#9a7a5d]">({item.egyseg})</span>
                      </span>
                      <span className="ml-4 shrink-0 font-sans text-[#9a7a5d]">{item.mennyiseg} × {formatAr(item.ar)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Végösszeg */}
        <div className="flex items-center justify-between rounded-[20px] border border-[#c79a66]/30 bg-white px-5 py-5">
          <div>
            <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-[#9a7a5d]">Végösszeg</p>
            <span className="font-serif text-3xl font-bold text-[#3d2314]">{formatAr(total)}</span>
          </div>
          <p className="max-w-[12rem] text-right font-sans text-sm text-[#9a7a5d]">Minden kiválasztott nap és tétel együtt</p>
        </div>

        {/* Átvétel info */}
        <div className="flex items-center gap-4 rounded-[20px] bg-[#3e2315] p-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#c79a66]/20">
            <MapPin className="h-4 w-4 text-[#c79a66]" />
          </div>
          <div>
            <p className="font-sans text-sm font-semibold text-[#fff5ea]">Személyes átvétel</p>
            <p className="font-sans text-xs text-[#e8d6c0]/60">Pécs, Salakhegyi út 14. · K–P: 8:00–17:00</p>
          </div>
        </div>

        {/* Adatok */}
        <section className="rounded-[20px] border border-[#ede8df] bg-white p-5 md:p-6">
          <h2 className="mb-5 font-serif text-xl text-[#3d2314]">Adataid</h2>
          <div className="space-y-4">
            {[
              { key: "nev", label: "Teljes neved", type: "text", placeholder: "Kovács Katalin" },
              { key: "email", label: "Email cím", type: "email", placeholder: "pelda@email.com" },
              { key: "telefon", label: "Telefonszám", type: "tel", placeholder: "+36 30 123 4567" },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="mb-1 block font-sans text-sm font-medium text-[#4b2e1f]">
                  {label} <span className="text-red-400">*</span>
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={`w-full rounded-[12px] border px-4 py-3 font-sans text-sm outline-none transition-colors bg-[#fafaf8] ${
                    errors[key] ? "border-red-300 focus:border-red-400" : "border-[#ede8df] focus:border-[#c79a66]"
                  }`}
                />
                {errors[key] && <p className="mt-1 font-sans text-xs text-red-400">{errors[key]}</p>}
              </div>
            ))}
            <div>
              <label className="mb-1 block font-sans text-sm font-medium text-[#4b2e1f]">
                Megjegyzés <span className="font-normal text-[#9a7a5d]">(opcionális)</span>
              </label>
              <textarea
                placeholder="Pl. speciális kérés, allergia..."
                value={form.megjegyzes}
                onChange={(e) => setForm((f) => ({ ...f, megjegyzes: e.target.value }))}
                rows={3}
                className="w-full resize-none rounded-[12px] border border-[#ede8df] bg-[#fafaf8] px-4 py-3 font-sans text-sm outline-none transition-colors focus:border-[#c79a66]"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c79a66] py-4 font-sans text-sm font-semibold text-[#fff9f0] shadow-[0_8px_24px_rgba(199,154,102,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b98b58] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <><div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Küldés...</>
          ) : (
            <>Rendelés elküldése
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <p className="text-center font-sans text-xs text-[#9a7a5d]">
          Elküldéssel elfogadod az{" "}
          <Link href="/adatvedelmi" className="underline hover:text-[#4b2e1f]">adatkezelési tájékoztatót</Link>.
        </p>
      </main>
    </div>
  );
}
