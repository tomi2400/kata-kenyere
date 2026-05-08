import { Resend } from "resend";
import {
  buildGoogleCalendarUrl,
  CalendarOrderData,
  formatCalendarDateLabel,
  getCalendarDayTotal,
  PICKUP_LOCATION,
} from "@/lib/order-calendar";

type OrderCustomer = {
  nev: string;
  email: string;
  telefon: string;
  megjegyzes?: string | null;
};

type SendOrderConfirmationInput = {
  customer: OrderCustomer;
  order: CalendarOrderData;
};

let resendClient: Resend | null = null;

function getResendClient() {
  if (!process.env.RESEND_API_KEY) return null;
  resendClient ??= new Resend(process.env.RESEND_API_KEY);
  return resendClient;
}

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://katakenyere.hu").replace(/\/$/, "");
}

function formatFt(amount: number) {
  return `${amount.toLocaleString("hu-HU")} Ft`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function textToHtml(value: string) {
  return escapeHtml(value).replace(/\n/g, "<br>");
}

function buildMapsUrl() {
  const params = new URLSearchParams({
    api: "1",
    destination: PICKUP_LOCATION,
  });

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

function buildIcsUrl(order: CalendarOrderData) {
  return `${getSiteUrl()}/api/rendeles/${encodeURIComponent(order.rendelesSzam)}/naptar`;
}

function buildDaySections(order: CalendarOrderData) {
  return order.napok
    .map((day) => {
      const items = day.items
        .map((item) => {
          const lineTotal = item.reszosszeg || item.egysegar * item.mennyiseg;
          return `
            <tr>
              <td style="padding:8px 0;color:#4b3a2a;">${escapeHtml(item.nev)}</td>
              <td style="padding:8px 0;text-align:center;color:#4b3a2a;">${item.mennyiseg}x</td>
              <td style="padding:8px 0;text-align:right;color:#4b3a2a;">${formatFt(lineTotal)}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <section style="border:1px solid #e7d7c2;border-radius:8px;padding:18px;margin:18px 0;background:#fffaf3;">
          <h2 style="font-size:18px;line-height:1.35;margin:0 0 6px;color:#2c1f14;">${escapeHtml(formatCalendarDateLabel(day))}</h2>
          <p style="margin:0 0 14px;color:#7a624b;">Átvétel: 8:00-17:00</p>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${items}
            <tr>
              <td colspan="2" style="border-top:1px solid #e7d7c2;padding:12px 0 0;color:#2c1f14;font-weight:700;">Napi összeg</td>
              <td style="border-top:1px solid #e7d7c2;padding:12px 0 0;text-align:right;color:#2c1f14;font-weight:700;">${formatFt(getCalendarDayTotal(day))}</td>
            </tr>
          </table>
          <p style="margin:16px 0 0;">
            <a href="${buildGoogleCalendarUrl(order, day)}" style="color:#9c6f3a;text-decoration:underline;">Hozzáadás Google Naptárhoz</a>
          </p>
        </section>
      `;
    })
    .join("");
}

function buildTextEmail(customer: OrderCustomer, order: CalendarOrderData) {
  const dayBlocks = order.napok
    .map((day) => {
      const items = day.items
        .map((item) => `- ${item.mennyiseg}x ${item.nev}: ${formatFt(item.reszosszeg || item.egysegar * item.mennyiseg)}`)
        .join("\n");

      return [
        formatCalendarDateLabel(day),
        "Átvétel: 8:00-17:00",
        items,
        `Napi összeg: ${formatFt(getCalendarDayTotal(day))}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    `Kedves ${customer.nev}!`,
    "",
    "Köszönjük a rendelésed, rögzítettük a rendszerben.",
    "",
    `Rendelésszám: ${order.rendelesSzam}`,
    `Teljes összeg: ${formatFt(order.vegosszeg)}`,
    "",
    dayBlocks,
    "",
    `Átvételi helyszín: ${PICKUP_LOCATION}`,
    `Útvonaltervezés: ${buildMapsUrl()}`,
    `Apple / Outlook naptár: ${buildIcsUrl(order)}`,
    "",
    "Ha kérdésed van, válaszolj erre az emailre.",
    "",
    "Kata Kenyere",
  ].join("\n");
}

function buildHtmlEmail(customer: OrderCustomer, order: CalendarOrderData) {
  const mapsUrl = buildMapsUrl();
  const icsUrl = buildIcsUrl(order);
  const note = customer.megjegyzes?.trim();

  return `
    <!doctype html>
    <html lang="hu">
      <body style="margin:0;background:#f7f1e8;font-family:Arial,Helvetica,sans-serif;color:#2c1f14;">
        <div style="display:none;max-height:0;overflow:hidden;">Köszönjük a rendelésed. Rendelésszám: ${escapeHtml(order.rendelesSzam)}</div>
        <main style="max-width:640px;margin:0 auto;padding:32px 18px;">
          <div style="background:#fffdf8;border:1px solid #eadcc9;border-radius:10px;padding:28px;">
            <p style="margin:0 0 10px;color:#9c6f3a;text-transform:uppercase;letter-spacing:2px;font-size:12px;font-weight:700;">Kata Kenyere</p>
            <h1 style="font-family:Georgia,serif;font-size:30px;line-height:1.2;margin:0 0 18px;color:#2c1f14;">Köszönjük a rendelésed!</h1>
            <p style="font-size:16px;line-height:1.7;margin:0 0 18px;color:#4b3a2a;">Kedves ${escapeHtml(customer.nev)}, rögzítettük a rendelésed. Az alábbiakban megtalálod a részleteket.</p>

            <div style="background:#f5eadb;border-radius:8px;padding:16px;margin:20px 0;">
              <p style="margin:0 0 6px;color:#7a624b;">Rendelésszám</p>
              <p style="margin:0;font-size:20px;font-weight:700;color:#2c1f14;">${escapeHtml(order.rendelesSzam)}</p>
              <p style="margin:14px 0 6px;color:#7a624b;">Teljes összeg</p>
              <p style="margin:0;font-size:22px;font-weight:700;color:#2c1f14;">${formatFt(order.vegosszeg)}</p>
            </div>

            ${buildDaySections(order)}

            <section style="margin:22px 0;padding:18px;border-left:4px solid #9c6f3a;background:#fbf4ea;">
              <p style="margin:0 0 8px;font-weight:700;color:#2c1f14;">Átvételi helyszín</p>
              <p style="margin:0;color:#4b3a2a;">${escapeHtml(PICKUP_LOCATION)}</p>
              <p style="margin:14px 0 0;">
                <a href="${mapsUrl}" style="display:inline-block;background:#9c6f3a;color:#fff;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:700;">Útvonaltervezés</a>
              </p>
            </section>

            <section style="margin:22px 0;">
              <p style="margin:0 0 10px;font-weight:700;color:#2c1f14;">Naptár</p>
              <p style="margin:0 0 12px;color:#4b3a2a;line-height:1.6;">A rendelési napokat be tudod tenni a saját naptáradba. Több átvételi nap esetén az Apple / Outlook fájl minden napot tartalmaz.</p>
              <p style="margin:0;">
                <a href="${icsUrl}" style="display:inline-block;background:#2c1f14;color:#fff;text-decoration:none;padding:12px 16px;border-radius:6px;font-weight:700;">Apple / Outlook naptár</a>
              </p>
            </section>

            ${
              note
                ? `<section style="margin:22px 0;"><p style="margin:0 0 8px;font-weight:700;color:#2c1f14;">Megjegyzésed</p><p style="margin:0;color:#4b3a2a;line-height:1.6;">${textToHtml(note)}</p></section>`
                : ""
            }

            <p style="font-size:14px;line-height:1.6;margin:24px 0 0;color:#7a624b;">Ha kérdésed van, válaszolj erre az emailre, és Katához érkezik meg.</p>
          </div>
        </main>
      </body>
    </html>
  `;
}

export async function sendOrderConfirmationEmail({ customer, order }: SendOrderConfirmationInput) {
  const resend = getResendClient();

  if (!resend) {
    console.warn("RESEND_API_KEY nincs beállítva, visszaigazoló email nem ment ki.");
    return;
  }

  const from = process.env.RESEND_FROM_EMAIL || "Kata Kenyere <rendeles@katakenyere.hu>";
  const replyTo = process.env.RESEND_REPLY_TO || "kataleskovar@gmail.com";
  const adminEmail = process.env.ADMIN_EMAIL?.trim();

  const { error } = await resend.emails.send({
    from,
    to: customer.email,
    bcc: adminEmail ? [adminEmail] : undefined,
    replyTo,
    subject: `Kata Kenyere rendelés visszaigazolás - ${order.rendelesSzam}`,
    html: buildHtmlEmail(customer, order),
    text: buildTextEmail(customer, order),
  });

  if (error) {
    throw new Error(`Resend email hiba: ${error.message}`);
  }
}
