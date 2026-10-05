export const SHARED_BREAD_CATEGORIES = [
  "Kovászos kenyerek",
  "Ízesített kovászos kenyerek",
  "Rozsos és teljes kiőrlésű kenyerek",
] as const;

export function countsTowardBreadLimit(product: { kategoria: string; nev: string }) {
  return SHARED_BREAD_CATEGORIES.some((category) => category === product.kategoria)
    && !product.nev.toLocaleLowerCase("hu-HU").includes("bagett");
}

export function maxQuantityWithinBreadLimit(limit: number, used: number, currentQuantity: number) {
  return Math.max(0, limit - used + currentQuantity);
}
