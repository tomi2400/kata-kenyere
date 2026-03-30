export const TETEL_ALLAPOTOK = ["uj", "feldolgozva", "kesz", "atvetel", "torolve"] as const;
export const DISPLAY_ALLAPOTOK = [...TETEL_ALLAPOTOK, "reszben"] as const;

export type TetelAllapot = (typeof TETEL_ALLAPOTOK)[number];
export type DisplayAllapot = (typeof DISPLAY_ALLAPOTOK)[number];

type TetelLike = {
  datum: string;
  nap: string;
  allapot?: string | null;
};

export type NapiAllapot = {
  datum: string;
  nap: string;
  allapot: DisplayAllapot;
};

export function isTetelAllapot(value: string): value is TetelAllapot {
  return TETEL_ALLAPOTOK.includes(value as TetelAllapot);
}

export function normalizeTetelAllapot(value?: string | null): TetelAllapot {
  return value && isTetelAllapot(value) ? value : "uj";
}

export function deriveGroupedStatus(statuses: Array<string | null | undefined>): DisplayAllapot {
  const unique = Array.from(new Set(statuses.map((status) => normalizeTetelAllapot(status))));
  if (unique.length === 0) return "uj";
  if (unique.length === 1) return unique[0];
  return "reszben";
}

export function deriveNapiAllapotok<T extends TetelLike>(tetelek: T[]): NapiAllapot[] {
  const grouped = new Map<string, { nap: string; statuses: Array<string | null | undefined> }>();

  for (const tetel of tetelek) {
    const current = grouped.get(tetel.datum);
    if (current) {
      current.statuses.push(tetel.allapot);
    } else {
      grouped.set(tetel.datum, { nap: tetel.nap, statuses: [tetel.allapot] });
    }
  }

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([datum, value]) => ({
      datum,
      nap: value.nap,
      allapot: deriveGroupedStatus(value.statuses),
    }));
}

export function deriveRendelesDisplayAllapot<T extends TetelLike>(
  tetelek: T[],
  fallback?: string | null
): DisplayAllapot {
  const napiAllapotok = deriveNapiAllapotok(tetelek);
  if (napiAllapotok.length === 0) {
    return fallback && (DISPLAY_ALLAPOTOK as readonly string[]).includes(fallback)
      ? (fallback as DisplayAllapot)
      : "uj";
  }

  const unique = Array.from(new Set(napiAllapotok.map((item) => item.allapot)));
  if (unique.length === 1) return unique[0];
  return "reszben";
}

export function matchesAllapotFilter<T extends TetelLike>(
  tetelek: T[],
  displayAllapot: DisplayAllapot,
  filter: string
): boolean {
  if (filter === "mind") return true;
  if (filter === "reszben") return displayAllapot === "reszben";
  if (displayAllapot === filter) return true;

  return deriveNapiAllapotok(tetelek).some((item) => item.allapot === filter);
}
