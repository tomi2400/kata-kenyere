import assert from "node:assert/strict";
import test from "node:test";
import { countsTowardBreadLimit, maxQuantityWithinBreadLimit } from "./bread-limit.ts";

test("minden jelenlegi kenyérkategória beleszámít, a bagett nem", () => {
  assert.equal(countsTowardBreadLimit({ kategoria: "Kovászos kenyerek", nev: "Fehér kenyér" }), true);
  assert.equal(countsTowardBreadLimit({ kategoria: "Ízesített kovászos kenyerek", nev: "Lenmagos kenyér" }), true);
  assert.equal(countsTowardBreadLimit({ kategoria: "Rozsos és teljes kiőrlésű kenyerek", nev: "Rozsos cipó" }), true);
  assert.equal(countsTowardBreadLimit({ kategoria: "Kovászos kenyerek", nev: "Bagett" }), false);
  assert.equal(countsTowardBreadLimit({ kategoria: "Kovászos kenyerek", nev: "Mini bagett" }), false);
  assert.equal(countsTowardBreadLimit({ kategoria: "Kalácsok és babka", nev: "Kalács" }), false);
});

test("egy fehér 1 kg és két fehér 750 g után nincs hely új kenyérnek", () => {
  const limit = 3;
  const used = 1 + 2;
  assert.equal(maxQuantityWithinBreadLimit(limit, used, 0), 0);
  assert.equal(maxQuantityWithinBreadLimit(limit, used, 1), 1);
  assert.equal(maxQuantityWithinBreadLimit(limit, used, 2), 2);
  assert.equal(maxQuantityWithinBreadLimit(limit, used - 1, 0), 1);
});
