import { Resend } from "resend";
import {
  buildGoogleCalendarUrl,
  CalendarOrderData,
  formatCalendarDateLabel,
  getCalendarDayTotal,
  PICKUP_LOCATION,
} from "@/lib/order-calendar";
import { GOOGLE_REVIEW_URL } from "@/lib/review";
import { FACEBOOK_URL, INSTAGRAM_URL } from "@/lib/social";

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
              <td style="padding:5px 0;color:#4b3a2a;font-size:14px;line-height:1.45;">${item.mennyiseg}x ${escapeHtml(item.nev)}</td>
              <td style="padding:5px 0;text-align:right;color:#4b3a2a;font-size:14px;line-height:1.45;">${formatFt(lineTotal)}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <section style="border-top:1px solid #eadcc9;padding:16px 0 14px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 10px;">
            <tr>
              <td style="font-size:15px;line-height:1.4;font-weight:700;color:#2c1f14;">${escapeHtml(formatCalendarDateLabel(day))}</td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
            ${items}
            <tr>
              <td style="padding:8px 0 0;color:#7a624b;font-size:13px;">Napi összeg</td>
              <td style="padding:8px 0 0;text-align:right;color:#2c1f14;font-size:13px;font-weight:700;">${formatFt(getCalendarDayTotal(day))}</td>
            </tr>
          </table>
        </section>
      `;
    })
    .join("");
}

function buildGoogleCalendarLinks(order: CalendarOrderData) {
  return order.napok
    .map(
      (day) => `
        <p style="margin:0 0 9px;">
          <a href="${buildGoogleCalendarUrl(order, day)}" style="display:inline-block;border:1px solid #d1ad68;border-radius:999px;color:#9c6f3a;text-decoration:none;font-size:13px;font-weight:700;padding:8px 13px;">Google Naptár erre a napra - ${escapeHtml(formatCalendarDateLabel(day))}</a>
        </p>
      `
    )
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
        items,
        `Napi összeg: ${formatFt(getCalendarDayTotal(day))}`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    `Köszönjük a rendelésed, ${customer.nev}!`,
    "",
    `Rendelésszám: ${order.rendelesSzam}`,
    "",
    dayBlocks,
    "",
    `Teljes összeg: ${formatFt(order.vegosszeg)}`,
    "",
    "Átvétel",
    `${PICKUP_LOCATION}`,
    `Útvonaltervezés: ${buildMapsUrl()}`,
    "",
    "Ha szeretnél emlékeztetőt beállítani, az átvételi napot hozzáadhatod a naptáradhoz.",
    ...order.napok.map((day) => `Google Naptár erre a napra (${formatCalendarDateLabel(day)}): ${buildGoogleCalendarUrl(order, day)}`),
    `Apple / Outlook naptár: ${buildIcsUrl(order)}`,
    "",
    "Ha kérdésed van, válaszolj erre az emailre.",
    "",
    "Ízlett, amit hazavittél? Nagyon sokat jelent nekünk, ha írsz pár sort Google-on.",
    `Google értékelés írása: ${GOOGLE_REVIEW_URL}`,
    "",
    `Instagram: ${INSTAGRAM_URL}`,
    `Facebook: ${FACEBOOK_URL}`,
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
      <body style="margin:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#2c1f14;">
        <div style="display:none;max-height:0;overflow:hidden;">Köszönjük a rendelésed. Rendelésszám: ${escapeHtml(order.rendelesSzam)}</div>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#ffffff;border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:28px 14px;">
              <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px;background:#ffffff;border:1px solid #e5ddd3;border-top:5px solid #c59b47;border-radius:8px;border-collapse:separate;">
                <tr>
                  <td style="padding:30px 24px 26px;font-family:Arial,Helvetica,sans-serif;color:#2c1f14;">
            <p style="margin:0 0 10px;text-align:center;color:#9c6f3a;text-transform:uppercase;letter-spacing:2px;font-size:11px;font-weight:700;">Kata Kenyere</p>
            <h1 style="font-family:Georgia,serif;font-size:25px;line-height:1.25;margin:0 0 18px;text-align:center;color:#2c1f14;font-weight:400;">Köszönjük a rendelésed, ${escapeHtml(customer.nev)}!</h1>

            <p style="margin:0 0 18px;font-size:14px;color:#7a624b;">Rendelésszám: <strong style="color:#2c1f14;">${escapeHtml(order.rendelesSzam)}</strong></p>

            <p style="margin:0 0 4px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#9c6f3a;font-weight:700;">Rendelésed</p>

            ${buildDaySections(order)}

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border-top:1px solid #eadcc9;margin:0 0 18px;">
              <tr>
                <td style="padding:14px 0 0;font-size:15px;font-weight:700;color:#2c1f14;">Teljes összeg</td>
                <td style="padding:14px 0 0;text-align:right;font-size:15px;font-weight:700;color:#2c1f14;">${formatFt(order.vegosszeg)}</td>
              </tr>
            </table>

            <div style="border-top:1px solid #eadcc9;margin:0 0 18px;padding:16px 0 0;">
              <p style="margin:0 0 6px;font-size:12px;letter-spacing:1.4px;text-transform:uppercase;color:#9c6f3a;font-weight:700;">Átvétel</p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#2c1f14;">${escapeHtml(PICKUP_LOCATION)}</p>
              <p style="margin:10px 0 0;font-size:13px;">
                <a href="${mapsUrl}" style="display:inline-block;border:1px solid #d8c5ab;border-radius:999px;color:#9c6f3a;text-decoration:none;font-weight:700;padding:8px 13px;">Útvonaltervezés</a>
              </p>
            </div>

            <section style="margin:0 0 18px;">
              <p style="margin:0 0 10px;font-size:13px;line-height:1.65;color:#7a624b;">Ha szeretnél emlékeztetőt beállítani, az átvételi napot hozzáadhatod a naptáradhoz.</p>
              ${buildGoogleCalendarLinks(order)}
              <p style="margin:2px 0 0;">
                <a href="${icsUrl}" style="display:inline-block;border:1px solid #d8c5ab;border-radius:999px;color:#9c6f3a;text-decoration:none;font-size:13px;font-weight:700;padding:8px 13px;">Apple / Outlook naptár</a>
              </p>
            </section>

            ${
              note
                ? `<section style="margin:22px 0;"><p style="margin:0 0 8px;font-weight:700;color:#2c1f14;">Megjegyzésed</p><p style="margin:0;color:#4b3a2a;line-height:1.6;">${textToHtml(note)}</p></section>`
                : ""
            }

            <p style="font-size:13px;line-height:1.65;margin:20px 0 0;color:#7a624b;">Ha kérdésed van, válaszolj erre az emailre.</p>

            <div style="border-top:1px solid #eadcc9;margin:18px 0 0;padding:18px 0 0;text-align:center;">
              <p style="font-family:Georgia,serif;font-size:18px;line-height:1.35;margin:0 0 8px;color:#2c1f14;">Ízlett, amit hazavittél?</p>
              <p style="font-size:13px;line-height:1.65;margin:0 auto;max-width:350px;color:#7a624b;">Nagyon sokat jelent nekünk, ha írsz pár sort Google-on.</p>
              <p style="margin:12px 0 0;font-size:13px;">
                <a href="${GOOGLE_REVIEW_URL}" style="display:inline-block;background:#9c6f3a;border:1px solid #9c6f3a;border-radius:999px;color:#ffffff;text-decoration:none;font-weight:700;padding:9px 15px;">Google értékelés írása</a>
              </p>
            </div>

            <div style="margin:16px 0 0;padding:4px 0 0;text-align:center;">
              <p style="font-size:12px;line-height:1.5;margin:0 0 9px;color:#9a846b;">Találkozunk itt is</p>
              <a href="${INSTAGRAM_URL}" aria-label="Instagram" style="display:inline-block;border:1px solid #d8c5ab;border-radius:999px;color:#9c6f3a;text-decoration:none;font-size:12px;font-weight:700;margin:0 4px;padding:7px 11px;">Instagram</a>
              <a href="${FACEBOOK_URL}" aria-label="Facebook" style="display:inline-block;border:1px solid #d8c5ab;border-radius:999px;color:#9c6f3a;text-decoration:none;font-size:12px;font-weight:700;margin:0 4px;padding:7px 11px;">Facebook</a>
            </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
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
    subject: `Kata Kenyere rendelésed visszaigazolása - ${order.rendelesSzam}`,
    html: buildHtmlEmail(customer, order),
    text: buildTextEmail(customer, order),
  });

  if (error) {
    throw new Error(`Resend email hiba: ${error.message}`);
  }
}
