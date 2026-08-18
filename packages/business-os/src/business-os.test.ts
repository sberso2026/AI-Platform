import { describe, expect, it } from "vitest";
import { validatePluginManifest } from "@rtb/plugin-sdk";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import type { EntitlementDecision } from "@rtb/platform-commerce";
import { EntitlementReasonCode } from "@rtb/platform-commerce";
import {
  BUSINESS_CAPABILITY_IDS,
  BUSINESS_OS_FEATURE_KEY,
  BUSINESS_OS_ID,
  BUSINESS_PERMISSIONS,
} from "@rtb/types";
import {
  BUSINESS_OS_MANIFEST,
  BUSINESS_OS_RUNTIME_MANIFEST,
  BUSINESS_PERMISSION_MAP,
  createBusinessOS,
  evaluateBusinessOsAccess,
  getBusinessOsFoundationDeclaration,
  hasBusinessPermission,
  implementsOwnAiStack,
  defaultBusinessCapabilityRegistry,
} from "./index";

function deny(reasonCode: string): EntitlementDecision {
  return {
    allowed: false,
    decision: "deny",
    reasonCode: reasonCode as EntitlementDecision["reasonCode"],
  };
}

function allow(): EntitlementDecision {
  return {
    allowed: true,
    decision: "allow",
    reasonCode: EntitlementReasonCode.ALLOW_FEATURE_ENABLED,
  };
}

describe("BOS-0 identity and contracts", () => {
  it("uses canonical business OS id and existing feature key", () => {
    expect(BUSINESS_OS_RUNTIME_MANIFEST.id).toBe("business");
    expect(BUSINESS_OS_RUNTIME_MANIFEST.id).toBe(BUSINESS_OS_ID);
    expect(BUSINESS_OS_MANIFEST.operating_system).toBe("business");
    expect(getBusinessOsFoundationDeclaration().featureKey).toBe(BUSINESS_OS_FEATURE_KEY);
    expect(getBusinessOsFoundationDeclaration().featureKey).toBe("business_os");
    expect(getBusinessOsFoundationDeclaration().productSlug).toBe("business-os");
  });

  it("keeps catalog coming_soon in BOS-0", () => {
    expect(BUSINESS_OS_RUNTIME_MANIFEST.catalogStatus).toBe("coming_soon");
    expect(getBusinessOsFoundationDeclaration().catalogStatus).toBe("coming_soon");
  });

  it("does not implement an independent AI stack", () => {
    expect(implementsOwnAiStack).toBe(false);
    expect(getBusinessOsFoundationDeclaration().implementsOwnAiStack).toBe(false);
    expect(getBusinessOsFoundationDeclaration().NoAutonomousApproval).toBe(true);
    expect(getBusinessOsFoundationDeclaration().duplicateKnowledgeGraphDetected).toBe(false);
  });

  it("validates plugin-shaped manifest against plugin-sdk", () => {
    expect(() => validatePluginManifest(BUSINESS_OS_MANIFEST)).not.toThrow();
  });

  it("does not register domain modules in BOS-0", () => {
    expect(BUSINESS_OS_RUNTIME_MANIFEST.modules).toEqual([]);
    expect(BUSINESS_OS_RUNTIME_MANIFEST.agents).toEqual([]);
  });
});

describe("BOS-0 capability registry", () => {
  it("registers all future capability identifiers without domain logic", () => {
    const ids = defaultBusinessCapabilityRegistry.ids();
    expect([...ids]).toEqual([...BUSINESS_CAPABILITY_IDS]);
    expect(ids).toHaveLength(18);
    for (const cap of defaultBusinessCapabilityRegistry.list()) {
      expect(cap.implemented).toBe(false);
      expect(cap.activationStatus).toBe("registered");
      expect(defaultBusinessCapabilityRegistry.isImplemented(cap.id)).toBe(false);
    }
  });
});

describe("BOS-0 permissions", () => {
  it("maps view/manage/admin onto the business resource", () => {
    expect(BUSINESS_PERMISSIONS).toEqual([
      "business_os.view",
      "business_os.manage",
      "business_os.admin",
    ]);
    expect(BUSINESS_PERMISSION_MAP["business_os.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.admin"]).toEqual({
      resource: "business",
      action: "admin",
    });
  });

  it("grants owner tenant.admin all BOS permissions", () => {
    const owner = [{ resource: "tenant" as const, action: "admin" as const }];
    for (const p of BUSINESS_PERMISSIONS) {
      expect(hasBusinessPermission(owner, p)).toBe(true);
    }
  });

  it("fails closed without business permission", () => {
    expect(hasBusinessPermission([], "business_os.view")).toBe(false);
    expect(
      hasBusinessPermission([{ resource: "engineering", action: "read" }], "business_os.view"),
    ).toBe(false);
  });

  it("does not treat view as manage", () => {
    const viewer = [{ resource: "business" as const, action: "read" as const }];
    expect(hasBusinessPermission(viewer, "business_os.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.admin")).toBe(false);
  });
});

describe("BOS-0 access evaluation", () => {
  const base = {
    tenantId: "11111111-1111-4111-8111-111111111111",
    userId: "22222222-2222-4222-8222-222222222222",
    permissions: [{ resource: "tenant" as const, action: "admin" as const }],
  };

  it("fails closed when feature flag is off", async () => {
    const decision = await evaluateBusinessOsAccess({
      ...base,
      evaluateFeature: async () => false,
      checkEntitlement: async () => allow(),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("feature_disabled");
  });

  it("fails closed when unauthorized for BOS", async () => {
    const decision = await evaluateBusinessOsAccess({
      ...base,
      permissions: [{ resource: "engineering", action: "read" }],
      evaluateFeature: async () => true,
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("permission_denied");
  });

  it("allows foundation preview when product is not commercially installed", async () => {
    const decision = await evaluateBusinessOsAccess({
      ...base,
      evaluateFeature: async () => true,
      checkEntitlement: async () => deny(EntitlementReasonCode.DENY_PRODUCT_NOT_FOUND),
    });
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("allowed_preview");
  });

  it("fails closed when a business-os installation is suspended", async () => {
    const decision = await evaluateBusinessOsAccess({
      ...base,
      evaluateFeature: async () => true,
      checkEntitlement: async () => deny(EntitlementReasonCode.DENY_SUBSCRIPTION_SUSPENDED),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("entitlement_denied");
  });

  it("allows when commerce entitles business-os", async () => {
    const decision = await evaluateBusinessOsAccess({
      ...base,
      evaluateFeature: async () => true,
      checkEntitlement: async () => allow(),
    });
    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("allowed_entitled");
  });

  it("fails closed when entitlement service is unavailable", async () => {
    const decision = await evaluateBusinessOsAccess({
      ...base,
      evaluateFeature: async () => true,
      checkEntitlement: async () => ({
        allowed: false,
        decision: "unavailable",
        reasonCode: EntitlementReasonCode.UNAVAILABLE_COMMERCE_DATA,
      }),
    });
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("entitlement_unavailable");
  });

  it("scopes feature evaluation to the requesting tenant", async () => {
    const seen: string[] = [];
    await evaluateBusinessOsAccess({
      ...base,
      tenantId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      evaluateFeature: async (input) => {
        seen.push(input.tenantId);
        return false;
      },
    });
    expect(seen).toEqual(["aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"]);
  });
});

describe("createBusinessOS", () => {
  it("requires Platform Kernel and does not fork AI services", () => {
    const supabase = {} as SupabaseClient;
    const kernel = createPlatformKernel(supabase);
    const bos = createBusinessOS(supabase, kernel);
    expect(bos.status.snapshot().implementsOwnAiStack).toBe(false);
    expect(bos.status.snapshot().osId).toBe("business");
    expect(bos.status.configuration().kernelServices.aiDirector).toBe(true);
    expect(bos.capabilities.list()).toHaveLength(18);
    expect(bos.status.snapshot().capabilities.every((c) => c.implemented === false)).toBe(true);
  });
});
