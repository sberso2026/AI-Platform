import { describe, expect, it } from "vitest";
import { BUSINESS_CAPABILITY_IDS } from "@rtb/types";
import { NoVendorHardDependency } from "./version";
import {
  BOS_CORE_NO_VENDOR_HARD_DEPENDENCY_PASS,
  BOS_CORE_VENDOR_NEUTRAL_PASS,
  BOS_GA_CERTIFIED_PROVIDERS,
  BOS_GA_REQUIRED_GATES_DEFINED,
  BOS_PREVIEW_PROMOTION_GATES_DEFINED,
  BOS_PRODUCTION_ELIGIBILITY_SCOPE_PASS,
  BOS_V1_CORE_CAPABILITY_IDS,
  BOS_V1_CORE_GA_GATES,
  BOS_V1_EXCLUDED_CAPABILITY_IDS,
  BOS_V1_FEATURE_SET,
  BOS_V1_FINAL_QUALIFICATION_PLAN,
  BOS_V1_FINAL_QUALIFICATION_READY,
  BOS_V1_GA_PROMOTED,
  BOS_V1_GA_SCOPE_DEFINED,
  BOS_V1_PREVIEW_PROVIDERS,
  BOS_V1_RELEASE_SCOPE,
  assertBosProviderPromotion,
  assertBosV1ScopeIntegrity,
  assertNoPeerProviderPromotion,
  bosV1CapabilityReleaseClass,
  bosV1ProviderProductStatus,
} from "./release-scope";
import { defaultBusinessCapabilityRegistry } from "./capabilities";
import { buildBusinessOsManifest } from "./manifest";

describe("BOS-16A10 v1.0 GA feature scope", () => {
  it("freezes BOS Core as GA_REQUIRED and connectors as Preview without deleting registered capabilities", () => {
    assertBosV1ScopeIntegrity();
    expect(BOS_V1_GA_SCOPE_DEFINED).toBe(true);
    expect(BOS_V1_GA_PROMOTED).toBe(true);
    expect(BUSINESS_CAPABILITY_IDS).toHaveLength(18);
    expect(BOS_V1_CORE_CAPABILITY_IDS).toHaveLength(11);
    expect(BOS_V1_EXCLUDED_CAPABILITY_IDS).toHaveLength(7);
    expect(BOS_V1_PREVIEW_PROVIDERS).toEqual(["xero", "microsoft_365", "hubspot"]);
    expect(BOS_GA_CERTIFIED_PROVIDERS).toEqual([]);
    expect(BOS_V1_FEATURE_SET.filter((row) => row.releaseClass === "GA_REQUIRED")).toHaveLength(11);
    expect(BOS_V1_FEATURE_SET.filter((row) => row.releaseClass === "PREVIEW")).toHaveLength(3);
    expect(BOS_V1_FEATURE_SET.filter((row) => row.releaseClass === "EXCLUDED")).toHaveLength(7);
    expect(BOS_V1_FEATURE_SET.some((row) => row.releaseClass === "BETA")).toBe(false);
    for (const id of BUSINESS_CAPABILITY_IDS) {
      expect(["GA_REQUIRED", "EXCLUDED"]).toContain(bosV1CapabilityReleaseClass(id));
    }
    expect(defaultBusinessCapabilityRegistry.ids()).toHaveLength(18);
    expect(buildBusinessOsManifest().catalogStatus).toBe("available");
    expect(BOS_V1_RELEASE_SCOPE.commerceCatalogUnchanged).toBe("available");
    expect(BOS_V1_RELEASE_SCOPE.commerceLifecycle).toBe("active");
    expect(BOS_V1_RELEASE_SCOPE.noVendorHardDependency).toBe(true);
    expect(NoVendorHardDependency).toBe(true);
    expect(BOS_CORE_VENDOR_NEUTRAL_PASS).toBe(true);
    expect(BOS_CORE_NO_VENDOR_HARD_DEPENDENCY_PASS).toBe(true);
    expect(BOS_GA_REQUIRED_GATES_DEFINED).toBe(true);
    expect(BOS_PREVIEW_PROMOTION_GATES_DEFINED).toBe(true);
    expect(BOS_PRODUCTION_ELIGIBILITY_SCOPE_PASS).toBe(true);
    expect(BOS_V1_CORE_GA_GATES).toEqual([
      "internal_architecture",
      "ai_workforce_regression",
      "live_rls",
      "browser_e2e",
    ]);
    expect(BOS_V1_FINAL_QUALIFICATION_PLAN).toHaveLength(8);
    expect(BOS_V1_FINAL_QUALIFICATION_READY).toBe(true);
  });

  it("keeps Xero, Microsoft 365, and HubSpot as Preview and fails closed without live evidence", () => {
    expect(bosV1ProviderProductStatus("xero")).toBe("PREVIEW");
    expect(bosV1ProviderProductStatus("microsoft_365")).toBe("PREVIEW");
    expect(bosV1ProviderProductStatus("hubspot")).toBe("PREVIEW");
    expect(() =>
      assertBosProviderPromotion({ requestedStatus: "CERTIFIED", liveExecutionPassed: false }),
    ).toThrow("provider_certified_without_live_evidence");
    expect(() =>
      assertBosProviderPromotion({ requestedStatus: "PREVIEW", liveExecutionPassed: false }),
    ).not.toThrow();
    expect(() =>
      assertNoPeerProviderPromotion({
        promoted: "xero",
        before: { xero: "PREVIEW", microsoft_365: "PREVIEW", hubspot: "PREVIEW" },
        after: { xero: "CERTIFIED", microsoft_365: "CERTIFIED", hubspot: "PREVIEW" },
      }),
    ).toThrow("peer_provider_promotion_forbidden");
    expect(() =>
      assertNoPeerProviderPromotion({
        promoted: "xero",
        before: { xero: "PREVIEW", microsoft_365: "PREVIEW", hubspot: "PREVIEW" },
        after: { xero: "CERTIFIED", microsoft_365: "PREVIEW", hubspot: "PREVIEW" },
      }),
    ).not.toThrow();
  });
});
