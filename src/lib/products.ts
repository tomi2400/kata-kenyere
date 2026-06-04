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

const TERMEK_PLACEHOLDER_FOTO = "/images/termek-placeholder.jpg";

function isSupportedImageSrc(src: string): boolean {
  if (src.startsWith("/")) return true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;

  try {
    const imageUrl = new URL(src);
    const storageUrl = new URL(supabaseUrl);

    return (
      imageUrl.protocol === "https:" &&
      imageUrl.hostname === storageUrl.hostname &&
      imageUrl.pathname.startsWith("/storage/v1/object/public/")
    );
  } catch {
    return false;
  }
}

// Placeholder fotó ha nincs saját kép
export function getTermekFoto(termek: Termek): string {
  const fotoUrl = termek.foto_url?.trim();

  return fotoUrl && isSupportedImageSrc(fotoUrl) ? fotoUrl : TERMEK_PLACEHOLDER_FOTO;
}

// Termékek csoportosítása kategóriánként (API válaszból)
export function csoportositByKategoria(
  termekek: Termek[],
  kategoriak: string[]
): Record<string, Termek[]> {
  const result: Record<string, Termek[]> = {};
  const rendezettKategoriak = [
    ...kategoriak,
    ...Array.from(new Set(termekek.map((termek) => termek.kategoria))).filter(
      (kategoria) => !kategoriak.includes(kategoria)
    ),
  ];

  for (const kat of rendezettKategoriak) {
    const items = termekek.filter((t) => t.kategoria === kat);
    if (items.length > 0) result[kat] = items;
  }
  return result;
}

export function formatAr(ar: number): string {
  return ar.toLocaleString("hu-HU") + " Ft";
}
