// Statikus termékadatok – később Supabase-ből jön
export type Termek = {
  id: string;
  nev: string;
  leiras: string;
  kategoria: string;
  ar: number;
  egyseg: string;
  foto: string;
};

export const KATEGORIAK = [
  "Klasszikus kovászos",
  "Változatok",
  "Tudatos választás",
  "Szezonális",
  "Édes péksütemény",
  "Reggeli klasszikusok",
  "Különlegességek",
];

export const TERMEKEK: Termek[] = [
  // Klasszikus kovászos
  { id: "feher-1kg", nev: "Fehér kenyér", leiras: "Klasszikus kovászos fehér kenyér", kategoria: "Klasszikus kovászos", ar: 1750, egyseg: "1 kg", foto: "/images/termek-placeholder.jpg" },
  { id: "feher-750g", nev: "Fehér kenyér", leiras: "Klasszikus kovászos fehér kenyér", kategoria: "Klasszikus kovászos", ar: 1350, egyseg: "750 g", foto: "/images/termek-placeholder.jpg" },
  { id: "feher-zsur-500g", nev: "Fehér zsúr", leiras: "Apró, ropogós zsúrkenyér", kategoria: "Klasszikus kovászos", ar: 950, egyseg: "500 g", foto: "/images/termek-placeholder.jpg" },
  // Változatok
  { id: "burgonyas-750g", nev: "Burgonyás kenyér", leiras: "Burgonyával dúsított kovászos cipó", kategoria: "Változatok", ar: 1500, egyseg: "750 g", foto: "/images/termek-placeholder.jpg" },
  { id: "kukoricás-750g", nev: "Kukoricás kenyér", leiras: "Kukoricalisztes kovászos cipó", kategoria: "Változatok", ar: 1700, egyseg: "750 g", foto: "/images/termek-placeholder.jpg" },
  { id: "lenmagos-750g", nev: "Lenmagos kenyér", leiras: "Lenmaggal gazdagított kovászos cipó", kategoria: "Változatok", ar: 1600, egyseg: "750 g", foto: "/images/termek-placeholder.jpg" },
  { id: "rozsos-cipo-750g", nev: "Rozsos cipó", leiras: "Rozsból és búzából sült kovászos cipó", kategoria: "Változatok", ar: 1700, egyseg: "750 g", foto: "/images/termek-placeholder.jpg" },
  { id: "magvas-rozsos-750g", nev: "Magvas rozsos cipó", leiras: "Magvas rozskenyér, ropogós héjjal", kategoria: "Változatok", ar: 1700, egyseg: "750 g", foto: "/images/termek-placeholder.jpg" },
  // Tudatos választás
  { id: "tk-buzakenyér-750g", nev: "100% tk. búzakenyér", leiras: "Teljes kiőrlésű búzakenyér, adalékanyag nélkül", kategoria: "Tudatos választás", ar: 1550, egyseg: "750 g", foto: "/images/termek-placeholder.jpg" },
  // Szezonális
  { id: "sutotokos-750g", nev: "Sütőtökös kenyér", leiras: "Sütőtökkel sült szezonális kovászos cipó", kategoria: "Szezonális", ar: 1600, egyseg: "750 g", foto: "/images/termek-placeholder.jpg" },
  { id: "sutotokos-tokmagos-750g", nev: "Sütőtökös-tökmagos", leiras: "Tökmaggal szórt sütőtökös kenyér", kategoria: "Szezonális", ar: 1700, egyseg: "750 g", foto: "/images/termek-placeholder.jpg" },
  // Édes péksütemény
  { id: "kakaos-csiga", nev: "Kakaós csiga", leiras: "Házi kakaós krémmel töltött kovászos csiga", kategoria: "Édes péksütemény", ar: 650, egyseg: "db", foto: "/images/termek-placeholder.jpg" },
  { id: "fahéjas-csiga", nev: "Fahéjas, mázas csiga", leiras: "Fahéjas töltelékű, cukormázas csiga", kategoria: "Édes péksütemény", ar: 690, egyseg: "db", foto: "/images/termek-placeholder.jpg" },
  { id: "leveles-toros-batyu", nev: "Leveles törős batyu", leiras: "Ropogós leveles tészta, töltött batyu", kategoria: "Édes péksütemény", ar: 750, egyseg: "db", foto: "/images/termek-placeholder.jpg" },
  // Reggeli klasszikusok
  { id: "kifli", nev: "Kifli", leiras: "Frissen sütött, ropogós kovászos kifli", kategoria: "Reggeli klasszikusok", ar: 250, egyseg: "db", foto: "/images/termek-placeholder.jpg" },
  { id: "perec", nev: "Perec", leiras: "Sós, ropogós kovászos perec", kategoria: "Reggeli klasszikusok", ar: 690, egyseg: "db", foto: "/images/termek-placeholder.jpg" },
  // Különlegességek
  { id: "aranygaluska-200g", nev: "Aranygaluska", leiras: "Vajas, cukros kovászos aranygaluska", kategoria: "Különlegességek", ar: 1590, egyseg: "200 g", foto: "/images/termek-placeholder.jpg" },
  { id: "babka-kakaos-200g", nev: "Babka kakaós", leiras: "Kakaós krémmel töltött lengyel fonott kalács", kategoria: "Különlegességek", ar: 1550, egyseg: "200 g", foto: "/images/termek-placeholder.jpg" },
  { id: "babka-kavés-200g", nev: "Babka kávés", leiras: "Kávés krémmel töltött fonott kalács", kategoria: "Különlegességek", ar: 1550, egyseg: "200 g", foto: "/images/termek-placeholder.jpg" },
  { id: "babka-toros-200g", nev: "Babka törős", leiras: "Diós-mézeskalács krémmel töltött babka", kategoria: "Különlegességek", ar: 1550, egyseg: "200 g", foto: "/images/termek-placeholder.jpg" },
  { id: "fonott-kalacs-250g", nev: "Fonott kalács", leiras: "Hagyományos vajas fonott kalács", kategoria: "Különlegességek", ar: 950, egyseg: "250 g", foto: "/images/termek-placeholder.jpg" },
];

export function getTermekekByKategoria(): Record<string, Termek[]> {
  return TERMEKEK.reduce((acc, t) => {
    if (!acc[t.kategoria]) acc[t.kategoria] = [];
    acc[t.kategoria].push(t);
    return acc;
  }, {} as Record<string, Termek[]>);
}

export function formatAr(ar: number): string {
  return ar.toLocaleString("hu-HU") + " Ft";
}
