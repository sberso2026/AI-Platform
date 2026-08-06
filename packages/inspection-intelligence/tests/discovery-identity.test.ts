import { describe, expect, it } from "vitest";
import {
  INSPECTION_ENTERPRISE_FOUNDATION_READY,
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_AI_VISION_IMPLEMENTED,
  INSPECTION_OFFLINE_SYNC_IMPLEMENTED,
  getInspectionIntelligenceEnterpriseDeclaration,
  CONDITION_RATING_RESERVED,
  DEFECT_TAXONOMY_RESERVED,
  OFFLINE_SYNC_CONTRACTS_RESERVED,
  PLATFORM_EVENT_PIPELINE,
  createMeasurementEngine,
  InspectionPackSdk,
  COATINGS_PACK_SCAFFOLD,
  GENERIC_INSPECTION_PACK_SDK,
  runEnterpriseFoundationHappyPath,
  canTransition,
} from "../src";
import {
  createEngineeringModuleSdkSkeleton,
  ENGINEERING_MODULE_SDK_FUTURE_CONSUMERS,
  ENGINEERING_MODULE_SDK_VERSION,
} from "@rtb/engineering-os";

describe("Phase 9C enterprise foundation", () => {
  it("locks enterprise identity and reservations", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("0.3.0-enterprise-foundation");
    expect(INSPECTION_ENTERPRISE_FOUNDATION_READY).toBe(true);
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(false);
    expect(INSPECTION_OFFLINE_SYNC_IMPLEMENTED).toBe(false);
    expect(CONDITION_RATING_RESERVED).toBe(true);
    expect(DEFECT_TAXONOMY_RESERVED).toBe(true);
    expect(OFFLINE_SYNC_CONTRACTS_RESERVED.mobileProductImplemented).toBe(false);
    expect(PLATFORM_EVENT_PIPELINE[0]).toBe("inspection");
    expect(PLATFORM_EVENT_PIPELINE.at(-1)).toBe("executive_dashboard");
    const decl = getInspectionIntelligenceEnterpriseDeclaration();
    expect(decl.usesEngineeringModuleSdk).toBe(true);
    expect(decl.usesInspectionPackSdk).toBe(true);
    expect(decl.couplesVia).toBe("inspection_target");
  });

  it("exposes Engineering Module SDK and Inspection Pack SDK", () => {
    expect(ENGINEERING_MODULE_SDK_VERSION).toBe("0.3.0");
    expect(ENGINEERING_MODULE_SDK_FUTURE_CONSUMERS).toContain("asset_intelligence");
    const sdk = createEngineeringModuleSdkSkeleton({
      moduleKey: "inspection_intelligence",
      version: "0.3.0-enterprise-foundation",
      displayName: "Inspection Intelligence",
      routePrefix: "/engineering/apps/inspection-intelligence",
      commerceApplicationKey: "inspection_intelligence",
      lifecycle: "active",
    });
    expect(sdk.ai.executeAssist).toBeTypeOf("function");
    const packs = new InspectionPackSdk();
    packs.register(COATINGS_PACK_SCAFFOLD);
    expect(packs.get("generic")?.packId).toBe(GENERIC_INSPECTION_PACK_SDK.packId);
    expect(packs.get("coatings")?.featureFlags.commercial).toBe(false);
  });

  it("runs durable persistence happy path with immutable templates/evidence and events", async () => {
    const store = await runEnterpriseFoundationHappyPath({
      tenantId: "t1",
      workspaceId: "w1",
      actorUserId: "u1",
    });
    expect(store.templateVersions.length).toBeGreaterThanOrEqual(2);
    expect(store.templateVersions.every((v) => v.immutable)).toBe(true);
    expect(store.targets.length).toBeGreaterThan(0);
    expect(store.sessions[0]?.status).toBe("approved");
    expect(store.evidence[0]?.immutable).toBe(true);
    expect(store.approvals).toHaveLength(1);
    expect(store.events.some((e) => e.type === "ReviewApproved")).toBe(true);
    expect(store.packRegistry.some((p) => p.packId === "generic")).toBe(true);
    expect(canTransition("started", "completed")).toBe(true);
    const engine = createMeasurementEngine();
    expect(engine.reservedFormulaLibrary).toBe(true);
  });
});
