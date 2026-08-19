import { describe, expect, it } from "vitest";
import { resolveCustomerMatch, assertNotAmbiguous } from "./conversion";
import type { BusinessCustomer } from "@rtb/types";

function customer(partial: Partial<BusinessCustomer> & { organisationName: string }): BusinessCustomer {
  return {
    id: partial.id ?? partial.organisationName,
    tenantId: "t1",
    workspaceId: "w1",
    tradingName: null,
    externalIds: {},
    customerStatus: "active",
    sourceType: "demo",
    provenance: {},
    isDemo: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...partial,
  };
}

describe("BOS-5 customer conversion matching", () => {
  it("returns none when there is no organisation or domain match", () => {
    const match = resolveCustomerMatch(
      [customer({ organisationName: "Northbound Civils", domain: "northbound.example" })],
      { organisationName: "Won pavement patch" },
    );
    expect(match.kind).toBe("none");
  });

  it("returns exact for a unique organisation or domain", () => {
    const existing = customer({ organisationName: "Harbour Inspection Co", domain: "harbour.example" });
    expect(resolveCustomerMatch([existing], { organisationName: "Harbour Inspection Co" }).kind).toBe("exact");
    expect(resolveCustomerMatch([existing], { domain: "HARBOUR.example" }).kind).toBe("exact");
  });

  it("returns ambiguous when two live customers share the candidate identity", () => {
    const match = resolveCustomerMatch(
      [
        customer({ id: "a", organisationName: "Metro Interchange Authority", domain: "metro.example" }),
        customer({ id: "b", organisationName: "Metro Interchange Authority", domain: "metro-alt.example" }),
      ],
      { organisationName: "Metro Interchange Authority" },
    );
    expect(match.kind).toBe("ambiguous");
    if (match.kind === "ambiguous") expect(match.matches).toHaveLength(2);
    expect(() => assertNotAmbiguous(match)).toThrow("conversion_ambiguous");
  });

  it("ignores archived customers when matching domain duplicates", () => {
    const match = resolveCustomerMatch(
      [
        customer({
          id: "old",
          organisationName: "Northbound Civils",
          domain: "northbound.example",
          customerStatus: "archived",
          archivedAt: "2026-01-01T00:00:00.000Z",
        }),
        customer({ id: "live", organisationName: "Northbound Civils", domain: "northbound.example" }),
      ],
      { domain: "northbound.example" },
    );
    expect(match.kind).toBe("exact");
    if (match.kind === "exact") expect(match.customer.id).toBe("live");
  });
});
