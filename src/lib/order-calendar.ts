export type CalendarOrderItem = {
  nev: string;
  mennyiseg: number;
  egysegar: number;
  reszosszeg: number;
  egyseg?: string;
};

export type CalendarOrderDay = {
  nap: string;
  datum: string;
  items: CalendarOrderItem[];
};

export type CalendarOrderData = {
  rendelesSzam: string;
  vegosszeg: number;
  napok: CalendarOrderDay[];
};

const TIMEZONE = "Europe/Budapest";
const PICKUP_START = "080000";
const PICKUP_END = "170000";
export const PICKUP_LOCATION = "Kata Kenyere, Pécs, Salakhegyi út 14.";

function compactDate(datum: string) {
  return datum.replaceAll("-", "");
}

function formatFt(amount: number) {
  return `${amount.toLocaleString("hu-HU")} Ft`;
}

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function utcStamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function safeFilePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
}

function foldIcsLine(line: string) {
  const chunks: string[] = [];
  let remaining = line;

  while (remaining.length > 74) {
    chunks.push(remaining.slice(0, 74));
    remaining = ` ${remaining.slice(74)}`;
  }

  chunks.push(remaining);
  return chunks.join("\r\n");
}

export function getCalendarDayTotal(day: CalendarOrderDay) {
  return day.items.reduce((sum, item) => sum + (item.reszosszeg || item.egysegar * item.mennyiseg), 0);
}

export function formatCalendarDateLabel(day: CalendarOrderDay) {
  return new Date(`${day.datum}T00:00:00`).toLocaleDateString("hu-HU", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export function buildCalendarDescription(order: CalendarOrderData, day: CalendarOrderDay) {
  const itemLines = day.items.map((item) => {
    const unit = item.egyseg ? ` (${item.egyseg})` : "";
    return `- ${item.mennyiseg}x ${item.nev}${unit}: ${formatFt(item.reszosszeg || item.egysegar * item.mennyiseg)}`;
  });

  return [
    `Rendelésszám: ${order.rendelesSzam}`,
    `Átvétel: ${formatCalendarDateLabel(day)}, 8:00-17:00`,
    `Helyszín: ${PICKUP_LOCATION}`,
    "",
    "Tételek:",
    ...itemLines,
    "",
    `Napi összeg: ${formatFt(getCalendarDayTotal(day))}`,
    `Teljes rendelés: ${formatFt(order.vegosszeg)}`,
  ].join("\n");
}

export function buildGoogleCalendarUrl(order: CalendarOrderData, day: CalendarOrderDay) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Kata Kenyere rendelés átvétele - ${day.nap}`,
    dates: `${compactDate(day.datum)}T${PICKUP_START}/${compactDate(day.datum)}T${PICKUP_END}`,
    details: buildCalendarDescription(order, day),
    location: PICKUP_LOCATION,
    ctz: TIMEZONE,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function buildIcsCalendar(order: CalendarOrderData) {
  const events = order.napok.map((day) => {
    const date = compactDate(day.datum);
    const summary = `Kata Kenyere rendelés átvétele - ${day.nap}`;
    const uid = `${safeFilePart(order.rendelesSzam)}-${day.datum}@katakenyere.hu`;

    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${utcStamp()}`,
      `SUMMARY:${escapeIcsText(summary)}`,
      `DTSTART;TZID=${TIMEZONE}:${date}T${PICKUP_START}`,
      `DTEND;TZID=${TIMEZONE}:${date}T${PICKUP_END}`,
      `LOCATION:${escapeIcsText(PICKUP_LOCATION)}`,
      `DESCRIPTION:${escapeIcsText(buildCalendarDescription(order, day))}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Holnap átveheted a Kata Kenyere rendelésed.",
      "TRIGGER:-P1D",
      "END:VALARM",
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      "DESCRIPTION:Ma átveheted a Kata Kenyere rendelésed.",
      "TRIGGER:-PT2H",
      "END:VALARM",
      "END:VEVENT",
    ].join("\r\n");
  });

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kata Kenyere//Rendeles naptar//HU",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-TIMEZONE:${TIMEZONE}`,
    ...events,
    "END:VCALENDAR",
  ]
    .flatMap((block) => block.split("\r\n"))
    .map(foldIcsLine)
    .join("\r\n");
}

export function buildIcsFilename(rendelesSzam: string) {
  return `kata-kenyere-${safeFilePart(rendelesSzam) || "rendeles"}.ics`;
}
