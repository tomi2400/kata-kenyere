import test from "node:test";
import assert from "node:assert/strict";
import { isCustomerLimitExemptAdminEmail } from "./customer-limit-exemption.ts";

test("Kata admin e-mail-címe mentes a vevői limitek alól", () => {
  assert.equal(isCustomerLimitExemptAdminEmail("kataleskovar@gmail.com"), true);
  assert.equal(isCustomerLimitExemptAdminEmail(" KATALESKOVAR@GMAIL.COM "), true);
});

test("más e-mail-cím nem kap limitkivételt", () => {
  assert.equal(isCustomerLimitExemptAdminEmail("vasarlo@example.com"), false);
  assert.equal(isCustomerLimitExemptAdminEmail(null), false);
});
