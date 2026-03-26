export type Termek = {
  id: string;
  slug: string;
  nev: string;
  leiras: string;
  kategoria: string;
  ar: number;
  egyseg: string;
  foto_url: string | null;
};

// Placeholder fotó ha nincs saját kép
export function getTermekFoto(termek: Termek): string {
  return termek.foto_url || "/images/termek-placeholder.jpg";
}

// Termékek csoportosítása kategóriánként (API válaszból)
export function csoportositByKategoria(
  termekek: Termek[],
  kategoriak: string[]
): Record<string, Termek[]> {
  const result: Record<string, Termek[]> = {};
  for (const kat of kategoriak) {
    const items = termekek.filter((t) => t.kategoria === kat);
    if (items.length > 0) result[kat] = items;
  }
  return result;
}

export function formatAr(ar: number): string {
  return ar.toLocaleString("hu-HU") + " Ft";
}
