"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/lib/store";
import { formatAr } from "@/lib/products";

function formatDatum(datum: string): string {
  const d = new Date(datum);
  return d.toLocaleDateString("hu-HU", { month: "long", day: "numeric", weekday: "long" });
}

export default function OsszesitesPage() {
  const router = useRouter();
  const { selectedDays, carts, getTotal, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ nev: "", email: "", telefon: "", megjegyzes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (mounted && selectedDays.length === 0) router.replace("/");
  }, [mounted, selectedDays, router]);

  if (!mounted || selectedDays.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
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
        nap: day.nap,
        datum: day.datum,
        termekId: item.termekId,
        nev: item.nev,
        mennyiseg: item.mennyiseg,
        egysegar: item.ar,
        reszosszeg: item.ar * item.mennyiseg,
      }))
    );

    try {
      const res = await fetch("/api/rendeles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rendelesek, vegosszeg: total }),
      });

      if (res.ok) {
        clearCart();
        router.push("/koszonjuk");
      } else {
        alert("Hiba történt, kérlek próbáld újra!");
      }
    } catch {
      alert("Hiba történt, kérlek próbáld újra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream pb-12">
      {/* HEADER */}
      <header className="bg-cream border-b border-gold/20 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Image src="/images/logo.png" alt="Kata Kenyere" width={36} height={36} />
          </Link>
          <Link href="/termekek" className="font-sans text-xs text-brown/50 hover:text-brown transition-colors">
            ← Vissza a termékekhez
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 space-y-8">

        {/* Cím */}
        <div>
          <div className="w-8 h-px bg-gold mb-3" />
          <h1 className="font-serif text-3xl text-brown-dark">Rendelés összesítése</h1>
        </div>

        {/* Rendelések napok szerint */}
        <section className="space-y-4">
          {selectedDays.map((day) => {
            const items = carts[day.datum] ?? [];
            if (items.length === 0) return null;
            const dayTotal = items.reduce((s, i) => s + i.ar * i.mennyiseg, 0);
            return (
              <div key={day.datum} className="bg-cream-dark rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-base font-semibold text-brown-dark">
                    {day.nap}
                    <span className="font-sans text-xs font-normal text-brown/50 ml-2">
                      {formatDatum(day.datum)}
                    </span>
                  </h3>
                  <span className="font-sans text-sm font-bold text-brown-dark">{formatAr(dayTotal)}</span>
                </div>
                <div className="space-y-1.5">
                  {items.map((item) => (
                    <div key={item.termekId} className="flex items-center justify-between text-sm">
                      <span className="font-sans text-brown/80">
                        {item.nev}
                        <span className="text-brown/40 ml-1">({item.egyseg})</span>
                      </span>
                      <span className="font-sans text-brown/60 ml-4 shrink-0">
                        {item.mennyiseg} × {formatAr(item.ar)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </section>

        {/* Végösszeg */}
        <div className="flex items-center justify-between py-4 border-t-2 border-gold/30">
          <span className="font-serif text-lg text-brown-dark">Végösszeg</span>
          <span className="font-serif text-2xl font-bold text-brown-dark">{formatAr(total)}</span>
        </div>

        {/* Átvétel info */}
        <div className="bg-brown-dark rounded-xl p-4 flex gap-4">
          <span className="text-2xl">📍</span>
          <div>
            <p className="font-sans text-sm font-semibold text-cream">Személyes átvétel</p>
            <p className="font-sans text-xs text-cream/60 mt-0.5">Pécs, Salakhegyi út 14. · K–P: 8:00–17:00</p>
          </div>
        </div>

        {/* Form */}
        <section>
          <h2 className="font-serif text-xl text-brown-dark mb-4">Adataid</h2>
          <div className="space-y-4">
            {[
              { key: "nev", label: "Teljes neved", type: "text", placeholder: "Kovács Katalin", req: true },
              { key: "email", label: "Email cím", type: "email", placeholder: "pelda@email.com", req: true },
              { key: "telefon", label: "Telefonszám", type: "tel", placeholder: "+36 30 123 4567", req: true },
            ].map(({ key, label, type, placeholder, req }) => (
              <div key={key}>
                <label className="block font-sans text-sm font-medium text-brown-dark mb-1">
                  {label} {req && <span className="text-red-500">*</span>}
                </label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className={`
                    w-full px-4 py-3 rounded-lg font-sans text-sm bg-white border transition-colors outline-none
                    ${errors[key] ? "border-red-400 focus:border-red-500" : "border-gold/30 focus:border-gold"}
                  `}
                />
                {errors[key] && <p className="font-sans text-xs text-red-500 mt-1">{errors[key]}</p>}
              </div>
            ))}

            <div>
              <label className="block font-sans text-sm font-medium text-brown-dark mb-1">
                Megjegyzés <span className="text-brown/40 font-normal">(opcionális)</span>
              </label>
              <textarea
                placeholder="Pl. speciális kérés, allergia..."
                value={form.megjegyzes}
                onChange={(e) => setForm((f) => ({ ...f, megjegyzes: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 rounded-lg font-sans text-sm bg-white border border-gold/30 focus:border-gold outline-none transition-colors resize-none"
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-xl font-sans font-bold text-base bg-brown-dark text-cream hover:bg-brown transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              Küldés...
            </>
          ) : (
            <>
              Rendelés elküldése
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </>
          )}
        </button>

        <p className="font-sans text-xs text-brown/40 text-center">
          Elküldéssel elfogadod az{" "}
          <Link href="/adatvedelmi" className="underline hover:text-brown/70">adatkezelési tájékoztatót</Link>.
        </p>
      </main>
    </div>
  );
}
