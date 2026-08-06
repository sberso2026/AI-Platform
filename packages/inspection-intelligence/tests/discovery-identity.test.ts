import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_ENGINEERING_DOMAIN_COMPLETE,
  INSPECTION_OPERATIONAL_WORKFLOWS_READY,
  INSPECTION_AI_VISION_IMPLEMENTED,
  INSPECTION_MOBILE_PRODUCT_IMPLEMENTED,
  INSPECTION_OFFLINE_SYNC_IMPLEMENTED,
  getInspectionIntelligenceDomainDeclaration,
  runInspectionOperationalWorkflowHappyPath,
  INSPECTION_REPORTING_DATA_MODELS,
  INSPECTION_OPERATIONAL_WORKFLOW_STEPS,
} from "../src";
import {
  assertEngineeringWorkflowSdkComplete,
  ENGINEERING_WORKFLOW_SDK_VERSION,
  ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS,
} from "@rtb/engineering-os";

describe("Phase 9E operational workflows", () => {
  it("locks operational identity without mobile, offline, or AI Vision", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("0.5.0-operational-workflows");
    expect(INSPECTION_ENGINEERING_DOMAIN_COMPLETE).toBe(true);
    expect(INSPECTION_OPERATIONAL_WORKFLOWS_READY).toBe(true);
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(false);
    expect(INSPECTION_MOBILE_PRODUCT_IMPLEMENTED).toBe(false);
    expect(INSPECTION_OFFLINE_SYNC_IMPLEMENTED).toBe(false);
    const decl = getInspectionIntelligenceDomainDeclaration();
    expect(decl.usesEngineeringWorkflowSdk).toBe(true);
    expect(decl.operationalWorkflowsReady).toBe(true);
    expect(decl.reportingPreparationImplemented).toBe(true);
  });

  it("exposes complete Engineering Workflow SDK capabilities", () => {
    expect(ENGINEERING_WORKFLOW_SDK_VERSION).toBe("0.5.0");
    expect(ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS).toContain("definitions");
    expect(ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS).toContain("transitionGuards");
    expect(ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS).toContain("slaTimers");
    expect(() => assertEngineeringWorkflowSdkComplete()).not.toThrow();
  });

  it("runs assignment → execution → review → approval → verification → close-out with events", async () => {
    const result = await runInspectionOperationalWorkflowHappyPath({
      tenantId: "t1",
      workspaceId: "w1",
      sessionId: "s1",
      actorUserId: "u1",
    });
    expect(result.instance.state).toBe("closed");
    expect(result.assignment.status).toBe("open");
    expect(result.review.status).toBe("completed");
    expect(result.approval.status).toBe("approved");
    expect(result.verification.status).toBe("passed");
    expect(result.events.some((e) => e.type === "engineering.workflow.started")).toBe(true);
    expect(result.events.some((e) => e.type === "engineering.workflow.transitioned")).toBe(true);
    expect(result.events.some((e) => e.type === "engineering.workflow.completed")).toBe(true);
    expect(result.events.every((e) => e.source === "engineering_workflow_sdk")).toBe(true);
    expect(result.stepsCompleted).toEqual([...INSPECTION_OPERATIONAL_WORKFLOW_STEPS]);
    expect(result.auditTrail.length).toBeGreaterThan(5);
    expect(result.reportingOutputs.length).toBe(INSPECTION_REPORTING_DATA_MODELS.length);
    expect(result.reportingOutputs.every((o) => o.mobileReady === false)).toBe(true);
  });
});
