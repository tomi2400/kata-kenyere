import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { sendOrderConfirmationEmail } from "@/lib/order-email";
import { getPrimaryMarketingTouch, sanitizeMarketingAttribution } from "@/lib/tracking";

type SubmittedOrderItem = {
  nap: string;
  datum: string;
  termekId: string;
  nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
};

type OrderInsertItem = {
  rendeles_id: string;
  rendeles_nap_id: string | null;
  termek_id: string | null;
  datum: string;
  nap: string;
  termek_nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
  allapot: "uj";
};

function isMissingMarketingColumnsError(error: { code?: string; message?: string; details?: string | null }) {
  const text = `${error.code ?? ""} ${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();

  return (
    text.includes("marketing_attribution") ||
    text.includes("traffic_source") ||
    text.includes("traffic_medium") ||
    text.includes("utm_") ||
    text.includes("gclid") ||
    text.includes("fbclid") ||
    text.includes("msclkid")
  );
}

function isSubmittedOrderItem(item: unknown): item is SubmittedOrderItem {
  if (!item || typeof item !== "object") return false;

  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.datum === "string" &&
    typeof candidate.termekId === "string" &&
    typeof candidate.nev === "string" &&
    Number(candidate.mennyiseg) > 0
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nev, email, telefon, megjegyzes, rendelesek } = body;
    const isManualOrder = body.source === "admin_manual" || body.manual === true;
    const sendEmail = body.sendEmail !== false;
    const vevoNev = typeof nev === "string" ? nev.trim() : "";
    const vevoEmail = typeof email === "string" ? email.trim() : "";
    const vevoTelefon = typeof telefon === "string" ? telefon.trim() : "";
    const vevoMegjegyzes = typeof megjegyzes === "string" && megjegyzes.trim() ? megjegyzes.trim() : null;
    const submittedRendelesek = Array.isArray(rendelesek) ? rendelesek.filter(isSubmittedOrderItem) : [];
    const marketingAttribution = sanitizeMarketingAttribution(body.marketingAttribution);
    const primaryMarketingTouch = getPrimaryMarketingTouch(marketingAttribution);

    // Validáció
    if (!isManualOrder && !vevoNev) {
      return NextResponse.json({ error: "Név megadása kötelező" }, { status: 400 });
    }
    if (!isManualOrder && (!vevoEmail || !/\S+@\S+\.\S+/.test(vevoEmail))) {
      return NextResponse.json({ error: "Érvényes email cím szükséges" }, { status: 400 });
    }
    if (!isManualOrder && !vevoTelefon) {
      return NextResponse.json({ error: "Telefonszám megadása kötelező" }, { status: 400 });
    }
    if (submittedRendelesek.length === 0) {
      return NextResponse.json({ error: "Legalább egy tétel szükséges" }, { status: 400 });
    }

    const szamoltVegosszeg = submittedRendelesek.reduce(
      (sum: number, r: { egysegar: number; mennyiseg: number }) =>
        sum + Number(r.egysegar || 0) * Number(r.mennyiseg || 0),
      0
    );

    // Rendelésszám generálása: KK-YYYYMMDD-NNN
    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const { count } = await supabaseAdmin
      .from("rendelesek")
      .select("*", { count: "exact", head: true })
      .like("rendeles_szam", `KK-${today}-%`);
    const sorszam = String((count ?? 0) + 1).padStart(3, "0");
    const rendelesSzam = `KK-${today}-${sorszam}`;

    // Rendelés mentése
    const baseRendelesInsert = {
      rendeles_szam: rendelesSzam,
      nev: vevoNev,
      email: vevoEmail,
      telefon: vevoTelefon,
      megjegyzes: vevoMegjegyzes,
      vegosszeg: szamoltVegosszeg,
      allapot: "uj",
    };
    const marketingRendelesInsert = {
      marketing_attribution: marketingAttribution ?? {},
      traffic_source: primaryMarketingTouch?.traffic_source ?? null,
      traffic_medium: primaryMarketingTouch?.traffic_medium ?? null,
      utm_source: primaryMarketingTouch?.utm_source ?? null,
      utm_medium: primaryMarketingTouch?.utm_medium ?? null,
      utm_campaign: primaryMarketingTouch?.utm_campaign ?? null,
      utm_content: primaryMarketingTouch?.utm_content ?? null,
      utm_term: primaryMarketingTouch?.utm_term ?? null,
      gclid: primaryMarketingTouch?.gclid ?? null,
      fbclid: primaryMarketingTouch?.fbclid ?? null,
      msclkid: primaryMarketingTouch?.msclkid ?? null,
      landing_page: primaryMarketingTouch?.landing_page ?? null,
      referrer: primaryMarketingTouch?.referrer ?? null,
    };

    let { data: rendeles, error: rendelesError } = await supabaseAdmin
      .from("rendelesek")
      .insert({ ...baseRendelesInsert, ...marketingRendelesInsert })
      .select("id")
      .single();

    if (rendelesError && isMissingMarketingColumnsError(rendelesError)) {
      console.warn(
        "Marketing attribution columns are missing from rendelesek. Retrying order insert without attribution fields.",
        rendelesError
      );

      const retryResult = await supabaseAdmin
        .from("rendelesek")
        .insert(baseRendelesInsert)
        .select("id")
        .single();

      rendeles = retryResult.data;
      rendelesError = retryResult.error;
    }

    if (rendelesError || !rendeles) {
      console.error("Rendelés mentési hiba:", rendelesError);
      return NextResponse.json({ error: "Hiba a rendelés mentésekor" }, { status: 500 });
    }

    // Tételek mentése
    // Termék slug → UUID feloldás
    const slugok = Array.from(new Set(submittedRendelesek.map((r: { termekId: string }) => r.termekId))) as string[];
    const { data: termekek } = await supabaseAdmin
      .from("termekek")
      .select("id, slug")
      .in("slug", slugok);

    const slugMap = new Map(termekek?.map((t) => [t.slug, t.id]) ?? []);

    // Rendelési napok feloldása dátum alapján
    const datumok = Array.from(new Set(submittedRendelesek.map((r: { datum: string }) => r.datum))) as string[];
    const { data: rendelesNapok } = await supabaseAdmin
      .from("rendeles_napok")
      .select("id, datum")
      .in("datum", datumok);

    const datumMap = new Map(rendelesNapok?.map((n) => [n.datum, n.id]) ?? []);

    const tetelek: OrderInsertItem[] = submittedRendelesek.map((r: SubmittedOrderItem) => {
      const mennyiseg = Number(r.mennyiseg || 0);
      const egysegar = Number(r.egysegar || 0);

      return {
        rendeles_id: rendeles.id,
        rendeles_nap_id: datumMap.get(r.datum) || null,
        termek_id: slugMap.get(r.termekId) || null,
        datum: r.datum,
        nap: r.nap,
        termek_nev: r.nev,
        mennyiseg,
        egysegar,
        reszosszeg: mennyiseg * egysegar,
        allapot: "uj",
      };
    });

    const { error: tetelError } = await supabaseAdmin
      .from("rendeles_tetelek")
      .insert(tetelek);

    if (tetelError) {
      console.error("Tétel mentési hiba:", tetelError);
      return NextResponse.json({ error: "Hiba a tételek mentésekor" }, { status: 500 });
    }

    const emailNapok = Array.from(new Set(tetelek.map((tetel) => tetel.datum)))
      .sort()
      .map((datum) => {
        const napiTetelek = tetelek.filter((tetel) => tetel.datum === datum);

        return {
          datum,
          nap: napiTetelek[0]?.nap || datum,
          items: napiTetelek.map((tetel) => ({
            nev: tetel.termek_nev,
            mennyiseg: tetel.mennyiseg,
            egysegar: tetel.egysegar,
            reszosszeg: tetel.reszosszeg,
          })),
        };
      });

    if (sendEmail && vevoEmail) {
      try {
        await sendOrderConfirmationEmail({
          customer: {
            nev: vevoNev,
            email: vevoEmail,
            telefon: vevoTelefon,
            megjegyzes: vevoMegjegyzes,
          },
          order: {
            rendelesSzam,
            vegosszeg: szamoltVegosszeg,
            napok: emailNapok,
          },
        });
      } catch (emailError) {
        console.error("Visszaigazoló email küldési hiba:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      rendelesSzam,
    });
  } catch (error) {
    console.error("Rendelés hiba:", error);
    return NextResponse.json({ error: "Váratlan hiba történt" }, { status: 500 });
  }
}
