import { describe, expect, it } from "vitest";
import {
  XERO_ALLOWED_CAPABILITIES,
  XERO_ALLOWED_OAUTH_SCOPES,
  XERO_DENIED_CAPABILITIES,
  XERO_DENIED_OAUTH_SCOPES,
  XERO_MUTATION_OPERATIONS,
  XERO_SCOPE_MINIMISATION_VERIFIED,
  XERO_THREAT_MODEL,
  assertXeroCapabilityAllowed,
  assertXeroScopeAllowed,
  xeroAccountingPathAllowed,
} from "./xero-policy";

describe("Xero capability allowlist", () => {
  it("allows only current BOS read contracts and denies mutations/scopes", () => {
    expect(XERO_ALLOWED_CAPABILITIES).toEqual(["accounting.read", "financial_facts.read"]);
    expect(XERO_DENIED_CAPABILITIES).toContain("payment.create");
    expect(XERO_ALLOWED_OAUTH_SCOPES.every((scope) => scope === "offline_access" || scope.endsWith(".read"))).toBe(
      true,
    );
    expect(XERO_ALLOWED_OAUTH_SCOPES).toEqual([
      "offline_access",
      "accounting.settings.read",
      "accounting.invoices.read",
      "accounting.contacts.read",
    ]);
    expect(XERO_DENIED_OAUTH_SCOPES).toContain("accounting.transactions");
    expect(XERO_DENIED_OAUTH_SCOPES).toContain("accounting.transactions.read");
    expect(XERO_DENIED_OAUTH_SCOPES).toContain("accounting.payments.read");
    expect(() => assertXeroScopeAllowed("accounting.transactions.read")).toThrow("xero_scope_forbidden");
    expect(XERO_MUTATION_OPERATIONS).toContain("createInvoice");
    expect(() => assertXeroCapabilityAllowed("payroll.write")).toThrow("xero_capability_forbidden");
    expect(() => assertXeroScopeAllowed("accounting.transactions")).toThrow("xero_scope_forbidden");
    expect(xeroAccountingPathAllowed("/api.xro/2.0/Invoices")).toBe(true);
    expect(xeroAccountingPathAllowed("/api.xro/2.0/Payments")).toBe(false);
    expect(XERO_THREAT_MODEL).toHaveLength(16);
    expect(XERO_SCOPE_MINIMISATION_VERIFIED).toBe(true);
  });
});
