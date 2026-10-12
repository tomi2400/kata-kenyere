const CUSTOMER_LIMIT_EXEMPT_ADMIN_EMAILS = new Set([
  "kataleskovar@gmail.com",
]);

export function isCustomerLimitExemptAdminEmail(email: string | null | undefined) {
  return CUSTOMER_LIMIT_EXEMPT_ADMIN_EMAILS.has(email?.trim().toLowerCase() ?? "");
}
