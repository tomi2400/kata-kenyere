"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

export default function JelszoModositasPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase automatikusan kezeli a recovery tokent az URL hash-bol
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // Ha mar be van lepve (pl. belsö admin jelszó változtatás linken jött)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("A jelszonak legalabb 6 karakter hosszunak kell lennie");
      return;
    }

    if (password !== confirmPassword) {
      setError("A ket jelszo nem egyezik");
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError("Nem sikerult modositani a jelszot");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/admin/gyartas"), 2000);
  };

  return (
    <div className="min-h-screen bg-brown-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Image
            src="/images/logo.png"
            alt="Kata Kenyere"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h1 className="font-serif text-2xl text-cream">Jelszo modositas</h1>
        </div>

        {success ? (
          <div className="text-center">
            <p className="font-sans text-sm text-green-400 mb-2">
              Jelszo sikeresen modositva!
            </p>
            <p className="font-sans text-xs text-cream/50">
              Atiranyitas...
            </p>
          </div>
        ) : !ready ? (
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-sans text-sm text-cream/50">
              Betoltes...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-sans text-xs text-cream/60 mb-1">
                Uj jelszo
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg bg-brown text-cream font-sans text-sm
                  border border-cream/10 focus:border-gold focus:outline-none transition-colors
                  placeholder:text-cream/30"
                placeholder="Legalabb 6 karakter"
              />
            </div>

            <div>
              <label className="block font-sans text-xs text-cream/60 mb-1">
                Uj jelszo ujra
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-brown text-cream font-sans text-sm
                  border border-cream/10 focus:border-gold focus:outline-none transition-colors
                  placeholder:text-cream/30"
                placeholder="********"
              />
            </div>

            {error && (
              <p className="font-sans text-sm text-red-400 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-sans font-semibold text-sm
                bg-gold text-brown-dark hover:bg-gold-light transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Mentes..." : "Jelszo modositasa"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
