import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_ENGINEERING_DOMAIN_COMPLETE,
  INSPECTION_AI_VISION_IMPLEMENTED,
  INSPECTION_MOBILE_PRODUCT_IMPLEMENTED,
  INSPECTION_DEFECT_FRAMEWORK_IMPLEMENTED,
  getInspectionIntelligenceDomainDeclaration,
  runEngineeringDomainCompletionHappyPath,
  INSPECTION_KPI_DEFINITIONS,
  createInProcessRiskRegisterAdapter,
} from "../src";
import {
  assertEngineeringDomainSdkComplete,
  ENGINEERING_DOMAIN_SDK_VERSION,
  ENGINEERING_DOMAIN_SDK_CONTRACT_KEYS,
} from "@rtb/engineering-os";

describe("Phase 9D engineering domain completion", () => {
  it("locks domain identity without mobile or AI Vision", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("0.4.0-engineering-domain");
    expect(INSPECTION_ENGINEERING_DOMAIN_COMPLETE).toBe(true);
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(false);
    expect(INSPECTION_MOBILE_PRODUCT_IMPLEMENTED).toBe(false);
    expect(INSPECTION_DEFECT_FRAMEWORK_IMPLEMENTED).toBe(true);
    const decl = getInspectionIntelligenceDomainDeclaration();
    expect(decl.usesEngineeringDomainSdk).toBe(true);
    expect(decl.engineeringDomainComplete).toBe(true);
    expect(decl.closeOutLifecycleImplemented).toBe(true);
  });

  it("exposes complete Engineering Domain SDK contracts", () => {
    expect(ENGINEERING_DOMAIN_SDK_VERSION).toBe("0.4.0");
    expect(ENGINEERING_DOMAIN_SDK_CONTRACT_KEYS).toContain("defects");
    expect(ENGINEERING_DOMAIN_SDK_CONTRACT_KEYS).toContain("knowledgeGraph");
    expect(() => assertEngineeringDomainSdkComplete()).not.toThrow();
  });

  it("runs defect → recommendation → CA → assessment → verification → close-out → compliance → risk → KPIs", async () => {
    const result = await runEngineeringDomainCompletionHappyPath({
      tenantId: "t1",
      workspaceId: "w1",
      sessionId: "s1",
      actorUserId: "u1",
    });
    expect(result.sessionStatus).toBe("closed");
    expect(result.closeOutAllowed).toBe(true);
    expect(result.riskId).toMatch(/^risk_/);
    expect(result.kpis.some((k) => k.key === "verification_pass_rate" && k.value === 1)).toBe(
      true,
    );
    expect(INSPECTION_KPI_DEFINITIONS.length).toBeGreaterThanOrEqual(8);
    const adapter = createInProcessRiskRegisterAdapter();
    expect(adapter.linkOrCreate).toBeTypeOf("function");
  });
});
