import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Dátumtartomány: tol/ig, vagy visszafelé kompatibilis days paraméter
  let tolStr: string;
  let igStr: string;

  if (searchParams.get("tol") && searchParams.get("ig")) {
    tolStr = searchParams.get("tol")!;
    igStr = searchParams.get("ig")!;
  } else {
    const days = Number(searchParams.get("days") || "30");
    const ig = new Date();
    const tol = new Date();
    tol.setDate(tol.getDate() - days);
    tolStr = tol.toISOString().split("T")[0];
    igStr = ig.toISOString().split("T")[0];
  }

  const tolISO = tolStr + "T00:00:00.000Z";
  const igISO = igStr + "T23:59:59.999Z";

  // Összes rendelés (nem törölve)
  const { count: osszRendeles } = await supabaseAdmin
    .from("rendelesek")
    .select("id", { count: "exact", head: true })
    .neq("allapot", "torolve")
    .gte("created_at", tolISO)
    .lte("created_at", igISO);

  // Bevétel
  const { data: bevetelData } = await supabaseAdmin
    .from("rendelesek")
    .select("vegosszeg")
    .neq("allapot", "torolve")
    .gte("created_at", tolISO)
    .lte("created_at", igISO);

  const osszBevetel = (bevetelData ?? []).reduce((s, r) => s + r.vegosszeg, 0);
  const atlagErtek = osszRendeles && osszRendeles > 0
    ? Math.round(osszBevetel / osszRendeles)
    : 0;

  // Tételek a tartományban (a tételek datum mezője a rendelési nap dátuma)
  const { data: tetelek } = await supabaseAdmin
    .from("rendeles_tetelek")
    .select("datum, termek_nev, mennyiseg, rendeles_id")
    .gte("datum", tolStr)
    .lte("datum", igStr);

  // Top termékek
  const termekMap: Record<string, number> = {};
  for (const t of tetelek ?? []) {
    termekMap[t.termek_nev] = (termekMap[t.termek_nev] || 0) + t.mennyiseg;
  }
  const topTermekek = Object.entries(termekMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([nev, mennyiseg]) => ({ nev, mennyiseg }));

  // Napi trend: rendelések és bevétel naponta (rendelés létrehozásának dátuma)
  const { data: rendelesekData } = await supabaseAdmin
    .from("rendelesek")
    .select("created_at, vegosszeg")
    .neq("allapot", "torolve")
    .gte("created_at", tolISO)
    .lte("created_at", igISO);

  const napiTrendMap: Record<string, { rendeles: number; bevetel: number }> = {};
  for (const r of rendelesekData ?? []) {
    const nap = r.created_at.split("T")[0];
    if (!napiTrendMap[nap]) napiTrendMap[nap] = { rendeles: 0, bevetel: 0 };
    napiTrendMap[nap].rendeles++;
    napiTrendMap[nap].bevetel += r.vegosszeg;
  }
  const napiTrend = Object.entries(napiTrendMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([datum, data]) => ({ datum, ...data }));

  // Terméktrend: per termék, per rendelési nap dátum
  const termekTrendMap: Record<string, Record<string, number>> = {};
  for (const t of tetelek ?? []) {
    if (!termekTrendMap[t.termek_nev]) termekTrendMap[t.termek_nev] = {};
    termekTrendMap[t.termek_nev][t.datum] =
      (termekTrendMap[t.termek_nev][t.datum] || 0) + t.mennyiseg;
  }

  // Top 5 termék trendje
  const top5 = topTermekek.slice(0, 5).map((t) => t.nev);
  const termekTrend = top5.map((nev) => ({
    nev,
    adatok: Object.entries(termekTrendMap[nev] ?? {})
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([datum, mennyiseg]) => ({ datum, mennyiseg })),
  }));

  return NextResponse.json({
    osszRendeles: osszRendeles ?? 0,
    osszBevetel,
    atlagErtek,
    topTermekek,
    napiTrend,
    termekTrend,
    tol: tolStr,
    ig: igStr,
  });
}
