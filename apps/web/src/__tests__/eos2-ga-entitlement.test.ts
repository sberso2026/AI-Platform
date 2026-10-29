import { describe, expect, it } from "vitest";
import {
  EOS2_GA_PRODUCT_KEY,
  evaluateEos2GaEntitlement,
  legacyEngineeringOsGrantsEos2,
  type Eos2GaEntitlementRecord,
} from "../lib/commerce/eos2-ga-entitlement";

const baseRecord: Eos2GaEntitlementRecord = {
  productKey: EOS2_GA_PRODUCT_KEY,
  tenantId: "tenant-a",
  workspaceId: "ws-a",
  status: "active",
  grantSource: "INTERNAL_VALIDATION",
  validFrom: "2020-01-01T00:00:00.000Z",
  validUntil: null,
};

const open = {
  authenticated: true,
  requestedProductKey: EOS2_GA_PRODUCT_KEY,
  tenantId: "tenant-a",
  workspaceId: "ws-a",
  record: baseRecord,
  enrolled: true,
  rolloutMode: "controlled_pilot" as const,
  emergencyOff: false,
  now: new Date("2026-10-29T00:00:00.000Z"),
};

describe("EOS 2 GA entitlement evaluator", () => {
  it("allows a valid active grant with enrollment", () => {
    expect(evaluateEos2GaEntitlement(open)).toEqual({ entitled: true, reason: "active" });
  });

  it("denies wrong product", () => {
    expect(
      evaluateEos2GaEntitlement({ ...open, requestedProductKey: "engineering-os" }).reason,
    ).toBe("wrong_product");
    expect(
      evaluateEos2GaEntitlement({
        ...open,
        record: { ...baseRecord, productKey: "engineering-os" },
      }).reason,
    ).toBe("wrong_product");
  });

  it("denies wrong tenant or workspace", () => {
    expect(evaluateEos2GaEntitlement({ ...open, tenantId: "other" }).reason).toBe("wrong_tenant");
    expect(evaluateEos2GaEntitlement({ ...open, workspaceId: "other" }).reason).toBe(
      "wrong_workspace",
    );
  });

  it("denies expired, revoked, suspended, missing", () => {
    expect(evaluateEos2GaEntitlement({ ...open, record: null }).reason).toBe("missing");
    expect(
      evaluateEos2GaEntitlement({
        ...open,
        record: { ...baseRecord, status: "expired" },
      }).reason,
    ).toBe("expired");
    expect(
      evaluateEos2GaEntitlement({
        ...open,
        record: { ...baseRecord, validUntil: "2020-01-02T00:00:00.000Z" },
      }).reason,
    ).toBe("expired");
    expect(
      evaluateEos2GaEntitlement({
        ...open,
        record: { ...baseRecord, status: "revoked", revokedAt: "2026-01-01T00:00:00.000Z" },
      }).reason,
    ).toBe("revoked");
    expect(
      evaluateEos2GaEntitlement({
        ...open,
        record: { ...baseRecord, status: "suspended", suspendedAt: "2026-01-01T00:00:00.000Z" },
      }).reason,
    ).toBe("suspended");
  });

  it("denies entitled-but-not-enrolled and enrolled-but-rollout-off", () => {
    expect(evaluateEos2GaEntitlement({ ...open, enrolled: false }).reason).toBe("not_enrolled");
    expect(evaluateEos2GaEntitlement({ ...open, rolloutMode: "off" }).reason).toBe("rollout_off");
  });

  it("allows general_availability only with entitlement and enrollment", () => {
    expect(
      evaluateEos2GaEntitlement({ ...open, rolloutMode: "general_availability" }),
    ).toEqual({ entitled: true, reason: "active" });
    expect(
      evaluateEos2GaEntitlement({
        ...open,
        rolloutMode: "general_availability",
        enrolled: false,
      }).reason,
    ).toBe("not_enrolled");
  });

  it("never auto-enables from legacy engineering-os entitlement", () => {
    expect(legacyEngineeringOsGrantsEos2("engineering-os")).toBe(false);
    expect(legacyEngineeringOsGrantsEos2(null)).toBe(false);
  });
});
