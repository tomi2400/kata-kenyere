import { NextResponse } from "next/server";
import { buildIcsCalendar, buildIcsFilename, type CalendarOrderData } from "@/lib/order-calendar";
import { supabaseAdmin } from "@/lib/supabase/server";

type RendelesTetelRow = {
  datum: string;
  nap: string;
  termek_nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
};

type RendelesRow = {
  rendeles_szam: string;
  vegosszeg: number;
  rendeles_tetelek: RendelesTetelRow[];
};

function buildCalendarOrder(rendeles: RendelesRow): CalendarOrderData {
  const groups = new Map<string, CalendarOrderData["napok"][number]>();

  for (const tetel of rendeles.rendeles_tetelek ?? []) {
    const current = groups.get(tetel.datum);
    const item = {
      nev: tetel.termek_nev,
      mennyiseg: tetel.mennyiseg,
      egysegar: tetel.egysegar,
      reszosszeg: tetel.reszosszeg,
    };

    if (current) {
      current.items.push(item);
    } else {
      groups.set(tetel.datum, {
        nap: tetel.nap,
        datum: tetel.datum,
        items: [item],
      });
    }
  }

  return {
    rendelesSzam: rendeles.rendeles_szam,
    vegosszeg: rendeles.vegosszeg,
    napok: Array.from(groups.values()).sort((a, b) => a.datum.localeCompare(b.datum)),
  };
}

export async function GET(
  _request: Request,
  { params }: { params: { rendelesSzam: string } }
) {
  const rendelesSzam = decodeURIComponent(params.rendelesSzam);

  const { data, error } = await supabaseAdmin
    .from("rendelesek")
    .select(`
      rendeles_szam,
      vegosszeg,
      rendeles_tetelek (
        datum,
        nap,
        termek_nev,
        mennyiseg,
        egysegar,
        reszosszeg
      )
    `)
    .eq("rendeles_szam", rendelesSzam)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Rendelés nem található" }, { status: 404 });
  }

  const order = buildCalendarOrder(data as RendelesRow);
  const calendar = buildIcsCalendar(order);

  return new NextResponse(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${buildIcsFilename(order.rendelesSzam)}"`,
      "Cache-Control": "no-store",
    },
  });
}
