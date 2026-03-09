export type OrderDay = {
  nap: "Kedd" | "Szerda" | "Csütörtök" | "Péntek";
  datum: string; // YYYY-MM-DD
  hatarido: string; // pl. "vasárnap 17:00-ig"
  nyitott: boolean;
};

const NAP_SORREND: OrderDay["nap"][] = ["Kedd", "Szerda", "Csütörtök", "Péntek"];

// Hány nappal előtte kell leadni (a rendelési nap weekday-éhez képest)

const HATARIDO_NEV: Record<OrderDay["nap"], string> = {
  Kedd: "vasárnap 17:00-ig",
  Szerda: "hétfőig 17:00-ig",
  Csütörtök: "kedd 17:00-ig",
  Péntek: "szerdáig 17:00-ig",
};

// Weekday index: 0=vasárnap, 1=hétfő, 2=kedd, 3=szerda, 4=csütörtök, 5=péntek, 6=szombat
const NAP_WEEKDAY: Record<OrderDay["nap"], number> = {
  Kedd: 2,
  Szerda: 3,
  Csütörtök: 4,
  Péntek: 5,
};

const HATARIDO_WEEKDAY: Record<OrderDay["nap"], number> = {
  Kedd: 0,      // vasárnap
  Szerda: 1,    // hétfő
  Csütörtök: 2, // kedd
  Péntek: 3,    // szerda
};

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getAvailableOrderDays(): OrderDay[] {
  const now = new Date();
  const currentHour = now.getHours();
  const todayWeekday = now.getDay(); // 0=vasárnap

  const result: OrderDay[] = [];

  // Következő 2 hét napjait nézzük
  for (let offset = 0; offset <= 14; offset++) {
    const targetDate = addDays(now, offset);
    const targetWeekday = targetDate.getDay();

    const nap = NAP_SORREND.find((n) => NAP_WEEKDAY[n] === targetWeekday);
    if (!nap) continue;

    // Határidő napja
    const deadlineWeekday = HATARIDO_WEEKDAY[nap];

    // A határidő napja az adott héten = targetDate - különbség
    const dayDiff = (targetWeekday - deadlineWeekday + 7) % 7;
    const deadlineDate = addDays(targetDate, -dayDiff);

    // Nyitott-e?
    const deadlineDay = deadlineDate.getDay();
    const isDeadlineDay = todayWeekday === deadlineDay &&
      deadlineDate.toDateString() === now.toDateString();
    const isPastDeadline =
      deadlineDate < now && !isDeadlineDay ||
      (isDeadlineDay && currentHour >= 17);

    const nyitott = !isPastDeadline;

    // Csak nyitott napokat adunk vissza, max 4 (egy hét)
    if (nyitott && result.length < 4) {
      result.push({
        nap,
        datum: formatDate(targetDate),
        hatarido: HATARIDO_NEV[nap],
        nyitott: true,
      });
    }
  }

  return result;
}
