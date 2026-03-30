"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin/gyartas", label: "Gyártás", icon: "clipboard" },
  { href: "/admin/rendelesek", label: "Rendelések", icon: "package" },
  { href: "/admin/termekek", label: "Termékek", icon: "bread" },
  { href: "/admin/napok", label: "Napok", icon: "calendar" },
  { href: "/admin/statisztika", label: "Statisztika", icon: "chart" },
];

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  const cn = className || "w-5 h-5";
  switch (icon) {
    case "clipboard":
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      );
    case "package":
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      );
    case "bread":
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-2.21 0-4 1.79-4 4v5a2 2 0 002 2h4a2 2 0 002-2v-5c0-2.21-1.79-4-4-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12c0-2.21-1.79-4-4-4 0 0 0 4 4 4zm8 0c0-2.21 1.79-4 4-4 0 0 0 4-4 4z" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      );
    case "chart":
      return (
        <svg className={cn} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13h4v8H3zm7-5h4v13h-4zm7-5h4v18h-4z" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);

  // Login es jelszo-modositas oldalon nem kell auth guard
  const isLoginPage = pathname === "/admin/bejelentkezes";
  const isPasswordPage = pathname === "/admin/jelszo-modositas";
  const isPublicPage = isLoginPage || isPasswordPage;

  useEffect(() => {
    if (isPublicPage) {
      setChecking(false);
      setAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/admin/bejelentkezes");
        return;
      }

      // Ellenorizzuk, hogy admin-e
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("id")
        .eq("id", session.user.id)
        .single();

      if (!adminRow) {
        await supabase.auth.signOut();
        router.replace("/admin/bejelentkezes");
        return;
      }

      setAuthenticated(true);
      setChecking(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.replace("/admin/bejelentkezes");
      }
    });

    return () => subscription.unsubscribe();
  }, [isPublicPage, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/admin/bejelentkezes");
  };

  // Publikus oldalak: nincs layout keret
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Auth check loading
  if (checking || !authenticated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* SIDEBAR - desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-brown-dark min-h-screen fixed left-0 top-0">
        {/* Logo */}
        <div className="p-4 border-b border-cream/10">
          <Link href="/admin/gyartas" className="flex items-center gap-3">
            <Image src="/images/logo.png" alt="Kata Kenyere" width={32} height={32} />
            <div>
              <p className="font-serif text-sm text-cream">Kata Kenyere</p>
              <p className="font-sans text-[10px] text-cream/40">Admin</p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 font-sans text-sm transition-colors
                  ${isActive
                    ? "text-gold bg-cream/5 border-r-2 border-gold"
                    : "text-cream/60 hover:text-cream hover:bg-cream/5"
                  }
                `}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Jelszo + Logout */}
        <div className="p-4 border-t border-cream/10 space-y-3">
          <Link
            href="/admin/jelszo-modositas"
            className="flex items-center gap-2 font-sans text-xs text-cream/40 hover:text-cream/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            Jelszó módosítás
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 font-sans text-xs text-cream/40 hover:text-cream/70 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Kijelentkezés
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-56 pb-20 md:pb-0">
        {children}
      </main>

      {/* BOTTOM TAB NAV - mobil */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-brown-dark border-t border-cream/10 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-0.5 px-2 py-1 transition-colors
                  ${isActive ? "text-gold" : "text-cream/40"}
                `}
              >
                <NavIcon icon={item.icon} className="w-5 h-5" />
                <span className="font-sans text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
