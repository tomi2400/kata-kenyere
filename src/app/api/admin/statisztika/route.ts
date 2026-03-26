import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  // Ossz rendelesek (nem torolt)
  const { count: osszRendeles } = await supabaseAdmin
    .from("rendelesek")
    .select("id", { count: "exact", head: true })
    .neq("allapot", "torolve")
    .gte("created_at", sinceStr);

  // Ossz bevetel
  const { data: bevetelData } = await supabaseAdmin
    .from("rendelesek")
    .select("vegosszeg")
    .neq("allapot", "torolve")
    .gte("created_at", sinceStr);

  const osszBevetel = (bevetelData ?? []).reduce((s, r) => s + r.vegosszeg, 0);
  const atlagErtek = osszRendeles && osszRendeles > 0 ? Math.round(osszBevetel / osszRendeles) : 0;

  // Top termekek
  const { data: topTermekek } = await supabaseAdmin
    .from("rendeles_tetelek")
    .select("termek_nev, mennyiseg")
    .gte("created_at", sinceStr);

  const termekMap: Record<string, number> = {};
  for (const t of topTermekek ?? []) {
    termekMap[t.termek_nev] = (termekMap[t.termek_nev] || 0) + t.mennyiseg;
  }

  const topList = Object.entries(termekMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([nev, mennyiseg]) => ({ nev, mennyiseg }));

  // Napi trend (utolso 14 nap)
  const trendSince = new Date();
  trendSince.setDate(trendSince.getDate() - 14);

  const { data: trendData } = await supabaseAdmin
    .from("rendelesek")
    .select("created_at, vegosszeg")
    .neq("allapot", "torolve")
    .gte("created_at", trendSince.toISOString());

  const napiTrend: Record<string, { rendeles: number; bevetel: number }> = {};
  for (const r of trendData ?? []) {
    const nap = r.created_at.split("T")[0];
    if (!napiTrend[nap]) napiTrend[nap] = { rendeles: 0, bevetel: 0 };
    napiTrend[nap].rendeles++;
    napiTrend[nap].bevetel += r.vegosszeg;
  }

  const trend = Object.entries(napiTrend)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([datum, data]) => ({ datum, ...data }));

  return NextResponse.json({
    osszRendeles: osszRendeles ?? 0,
    osszBevetel,
    atlagErtek,
    topTermekek: topList,
    napiTrend: trend,
  });
}
