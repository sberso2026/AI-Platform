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
    expect(getBusinessOsFoundationDeclaration().previewAccess.mode).toBe("feature_flag_foundation");
    expect(getBusinessOsFoundationDeclaration().previewAccess.usesCommercePreviewLifecycle).toBe(false);
    expect(getBusinessOsFoundationDeclaration().previewAccess.usesReleaseChannel).toBe(false);
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
    expect(BUSINESS_OS_RUNTIME_MANIFEST.agents?.map((a) => a.id)).toEqual(["business-development-agent"]);
  });
});

describe("BOS-0 capability registry", () => {
  it("registers all capability identifiers and implements owner_command through work_operations", () => {
    const ids = defaultBusinessCapabilityRegistry.ids();
    expect([...ids]).toEqual([...BUSINESS_CAPABILITY_IDS]);
    expect(ids).toHaveLength(18);
    for (const cap of defaultBusinessCapabilityRegistry.list()) {
      if (
        cap.id === "owner_command" ||
        cap.id === "financial_intelligence" ||
        cap.id === "growth_intelligence" ||
        cap.id === "revenue_execution" ||
        cap.id === "customer_intelligence" ||
        cap.id === "profit_intelligence" ||
        cap.id === "work_operations" ||
        cap.id === "decision_action" ||
        cap.id === "business_risk" ||
        cap.id === "business_context" ||
        cap.id === "ai_workforce"
      ) {
        expect(cap.implemented).toBe(true);
        expect(cap.activationStatus).toBe("preview");
        expect(defaultBusinessCapabilityRegistry.isImplemented(cap.id)).toBe(true);
      } else {
        expect(cap.implemented).toBe(false);
        expect(cap.activationStatus).toBe("registered");
        expect(defaultBusinessCapabilityRegistry.isImplemented(cap.id)).toBe(false);
      }
    }
  });
});

describe("BOS-0 permissions", () => {
  it("maps view/manage/admin onto the business resource", () => {
    expect(BUSINESS_PERMISSIONS).toEqual([
      "business_os.view",
      "business_os.manage",
      "business_os.admin",
      "business_os.owner_command.view",
      "business_os.owner_command.manage",
      "business_os.financial_intelligence.view",
      "business_os.financial_intelligence.manage",
      "business_os.growth_intelligence.view",
      "business_os.growth_intelligence.manage",
      "business_os.revenue_execution.view",
      "business_os.revenue_execution.manage",
      "business_os.revenue_execution.approve",
      "business_os.customer_intelligence.view",
      "business_os.customer_intelligence.manage",
      "business_os.profit_intelligence.view",
      "business_os.profit_intelligence.manage",
      "business_os.work_operations.view",
      "business_os.work_operations.manage",
      "business_os.decision_action.view",
      "business_os.decision_action.manage",
      "business_os.decision_action.approve",
      "business_os.business_risk.view",
      "business_os.business_risk.manage",
      "business_os.business_risk.approve",
      "business_os.business_context.view",
      "business_os.business_context.manage",
      "business_os.ai_workforce.view",
      "business_os.ai_workforce.manage",
      "business_os.ai_workforce.run",
      "business_os.ai_workforce.approve",
      "business_os.connectors.view",
      "business_os.connectors.manage",
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
    expect(BUSINESS_PERMISSION_MAP["business_os.owner_command.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.owner_command.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.financial_intelligence.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.financial_intelligence.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.growth_intelligence.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.growth_intelligence.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.revenue_execution.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.revenue_execution.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.revenue_execution.approve"]).toEqual({
      resource: "business",
      action: "admin",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.customer_intelligence.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.customer_intelligence.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.profit_intelligence.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.profit_intelligence.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.work_operations.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.work_operations.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.decision_action.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.decision_action.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.decision_action.approve"]).toEqual({
      resource: "business",
      action: "admin",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.business_risk.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.business_risk.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.business_risk.approve"]).toEqual({
      resource: "business",
      action: "admin",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.business_context.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.business_context.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.ai_workforce.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.ai_workforce.manage"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.ai_workforce.run"]).toEqual({
      resource: "business",
      action: "execute",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.ai_workforce.approve"]).toEqual({
      resource: "business",
      action: "admin",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.connectors.view"]).toEqual({
      resource: "business",
      action: "read",
    });
    expect(BUSINESS_PERMISSION_MAP["business_os.connectors.manage"]).toEqual({
      resource: "business",
      action: "execute",
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
    expect(hasBusinessPermission(viewer, "business_os.owner_command.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.financial_intelligence.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.growth_intelligence.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.revenue_execution.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.customer_intelligence.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.profit_intelligence.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.work_operations.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.decision_action.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.business_risk.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.business_context.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.ai_workforce.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.connectors.view")).toBe(true);
    expect(hasBusinessPermission(viewer, "business_os.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.owner_command.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.financial_intelligence.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.growth_intelligence.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.revenue_execution.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.customer_intelligence.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.profit_intelligence.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.work_operations.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.decision_action.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.business_risk.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.business_context.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.ai_workforce.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.connectors.manage")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.ai_workforce.run")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.ai_workforce.approve")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.decision_action.approve")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.business_risk.approve")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.revenue_execution.approve")).toBe(false);
    expect(hasBusinessPermission(viewer, "business_os.admin")).toBe(false);
    expect(hasBusinessPermission([{ resource: "business", action: "execute" }], "business_os.revenue_execution.manage")).toBe(
      true,
    );
    expect(hasBusinessPermission([{ resource: "business", action: "execute" }], "business_os.revenue_execution.approve")).toBe(
      false,
    );
    expect(hasBusinessPermission([{ resource: "business", action: "execute" }], "business_os.ai_workforce.approve")).toBe(
      false,
    );
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

  it("fails closed when commerce reports licence or plan gaps (not coming_soon absence)", async () => {
    for (const code of [
      EntitlementReasonCode.DENY_LICENCE_NOT_FOUND,
      EntitlementReasonCode.DENY_FEATURE_NOT_ENABLED,
      EntitlementReasonCode.DENY_APPLICATION_NOT_IN_PLAN,
    ]) {
      const decision = await evaluateBusinessOsAccess({
        ...base,
        evaluateFeature: async () => true,
        checkEntitlement: async () => deny(code),
      });
      expect(decision.allowed).toBe(false);
      expect(decision.reason).toBe("entitlement_denied");
      expect(decision.entitlementReasonCode).toBe(code);
    }
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
    expect(bos.status.snapshot().phase).toBe("BOS-14");
    expect(bos.status.configuration().kernelServices.aiDirector).toBe(true);
    expect(bos.status.configuration().kernelServices.knowledgeGraph).toBe(true);
    expect(bos.capabilities.list()).toHaveLength(18);
    expect(bos.capabilities.isImplemented("owner_command")).toBe(true);
    expect(bos.capabilities.isImplemented("financial_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("growth_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("revenue_execution")).toBe(true);
    expect(bos.capabilities.isImplemented("customer_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("profit_intelligence")).toBe(true);
    expect(bos.capabilities.isImplemented("work_operations")).toBe(true);
    expect(bos.capabilities.isImplemented("decision_action")).toBe(true);
    expect(bos.capabilities.isImplemented("business_risk")).toBe(true);
    expect(bos.capabilities.isImplemented("business_context")).toBe(true);
    expect(bos.capabilities.isImplemented("ai_workforce")).toBe(true);
    expect(bos.capabilities.list().filter((c) => c.implemented).map((c) => c.id)).toEqual([
      "owner_command",
      "financial_intelligence",
      "growth_intelligence",
      "revenue_execution",
      "customer_intelligence",
      "profit_intelligence",
      "work_operations",
      "decision_action",
      "business_risk",
      "business_context",
      "ai_workforce",
    ]);
    expect(bos.ownerCommand).toBeDefined();
    expect(bos.financialIntelligence).toBeDefined();
    expect(bos.growthIntelligence).toBeDefined();
    expect(bos.revenueExecution).toBeDefined();
    expect(bos.customerIntelligence).toBeDefined();
    expect(bos.profitIntelligence).toBeDefined();
    expect(bos.workOperations).toBeDefined();
    expect(bos.decisionAction).toBeDefined();
    expect(bos.businessRisk).toBeDefined();
    expect(bos.businessContextGraph).toBeDefined();
    expect(bos.aiWorkforce).toBeDefined();
    expect(bos.connectors).toBeDefined();
    expect(bos.businessContextGraph.contract().implementsOwnAiStack).toBe(false);
    expect(bos.businessContextGraph.aiWorkforce().available).toBe(true);
    expect(bos.aiWorkforce.contract().implementsOwnAiStack).toBe(false);
    expect(bos.aiWorkforce.contract().duplicateAgentRuntimeDetected).toBe(false);
    expect(bos.connectors.contract().implemented).toBe(true);
    expect(bos.connectors.contract().duplicateIntegrationStackDetected).toBe(false);
    expect(bos.connectors.status().requiredForBusinessOs).toBe(false);
  });
});

describe("BOS-1 events and AI contract", () => {
  it("declares owner-command events on the existing event bus contract", () => {
    const types = BUSINESS_OS_RUNTIME_MANIFEST.events?.map((e) => e.type) ?? [];
    expect(types).toEqual(
      expect.arrayContaining([
        "business_os.kpi.updated",
        "business_os.signal.created",
        "business_os.signal.resolved",
        "business_os.recommendation.created",
        "business_os.decision.created",
        "business_os.decision.updated",
        "business_os.action.created",
        "business_os.action.completed",
        "business_os.finance.snapshot_ingested",
        "business_os.finance.metrics_updated",
        "business_os.finance.signal_detected",
        "business_os.growth.lead_created",
        "business_os.growth.opportunity_created",
        "business_os.growth.metrics_updated",
        "business_os.growth.signal_detected",
        "business_os.revenue.engagement_created",
        "business_os.revenue.proposal_created",
        "business_os.revenue.pricing_evaluated",
        "business_os.revenue.draft_prepared",
        "business_os.customer.created",
        "business_os.customer.converted",
        "business_os.customer.health_updated",
        "business_os.customer.signal_detected",
        "business_os.profit.fact_ingested",
        "business_os.profit.metrics_updated",
        "business_os.profit.leakage_detected",
        "business_os.profit.classification_updated",
        "business_os.operations.work_created",
        "business_os.operations.metrics_updated",
        "business_os.operations.risk_detected",
        "business_os.risk.created",
        "business_os.risk.assessed",
        "business_os.risk.outside_tolerance",
        "business_os.context.node_projected",
        "business_os.context.relationship_projected",
        "business_os.context.projection_failed",
        "business_os.context.rebuild_completed",
        "business_os.context.unresolved_reference_detected",
        "business_os.ai_workforce.agent_installed",
        "business_os.ai_workforce.agent_enabled",
        "business_os.ai_workforce.run_completed",
        "business_os.ai_workforce.approval_requested",
        "business_os.connectors.configured",
        "business_os.connectors.revoked",
        "business_os.connectors.sync_started",
        "business_os.connectors.import_committed",
      ]),
    );
  });
});
