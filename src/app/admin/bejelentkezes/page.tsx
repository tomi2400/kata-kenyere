"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "reset">("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Hibas email vagy jelszo");
      setLoading(false);
      return;
    }

    router.push("/admin/gyartas");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: `${window.location.origin}/admin/jelszo-modositas` }
    );

    if (resetError) {
      setError("Nem sikerult elkuleni a levelet");
      setLoading(false);
      return;
    }

    setSuccess("Ellenorizd az email fiokod! Kuldtunk egy linket a jelszo modositashoz.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-brown-dark flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/images/logo.png"
            alt="Kata Kenyere"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h1 className="font-serif text-2xl text-cream">Admin</h1>
          <p className="font-sans text-sm text-cream/50 mt-1">
            {mode === "login" ? "Bejelentkezes" : "Jelszo visszaallitas"}
          </p>
        </div>

        {mode === "login" ? (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-sans text-xs text-cream/60 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-brown text-cream font-sans text-sm
                    border border-cream/10 focus:border-gold focus:outline-none transition-colors
                    placeholder:text-cream/30"
                  placeholder="admin@katakenyere.hu"
                />
              </div>

              <div>
                <label className="block font-sans text-xs text-cream/60 mb-1">
                  Jelszo
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                {loading ? "Bejelentkezes..." : "Bejelentkezes"}
              </button>
            </form>

            <button
              onClick={() => { setMode("reset"); setError(""); }}
              className="w-full mt-4 font-sans text-xs text-cream/40 hover:text-cream/70 transition-colors cursor-pointer"
            >
              Elfelejtetted a jelszavad?
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block font-sans text-xs text-cream/60 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg bg-brown text-cream font-sans text-sm
                    border border-cream/10 focus:border-gold focus:outline-none transition-colors
                    placeholder:text-cream/30"
                  placeholder="admin@katakenyere.hu"
                />
              </div>

              {error && (
                <p className="font-sans text-sm text-red-400 text-center">{error}</p>
              )}
              {success && (
                <p className="font-sans text-sm text-green-400 text-center">{success}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-sans font-semibold text-sm
                  bg-gold text-brown-dark hover:bg-gold-light transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? "Kuldes..." : "Visszaallito link kuldese"}
              </button>
            </form>

            <button
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className="w-full mt-4 font-sans text-xs text-cream/40 hover:text-cream/70 transition-colors cursor-pointer"
            >
              Vissza a bejelentkezeshez
            </button>
          </>
        )}
      </div>
    </div>
  );
}
