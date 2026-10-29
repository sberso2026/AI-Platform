import { describe, expect, it } from "vitest";
import { CommerceDomainError } from "@rtb/platform-commerce";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { EngineeringWorkGeneratorService } from "../work-generator/service";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { conceptSnapshot, CRUSHER_EXPANSION_FEED_PROJECT_ID, CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, WORKFLOW_READINESS } from "../work-generator/fixture";
import { createTestChangeWorkbenchService } from "./service";
import { A11E_PROJECT_A, A11E_PROJECT_B, A11E_TENANT, A11E_WORKSPACE, loadChangeFixture } from "./fixture";
import { assertCanonicalWorkPlanOwnership } from "./work-plan-scope";
import { CHANGE_WORKBENCH_AI_BOUNDARY } from "./types";

function commerce(
  action: "analysis.read" | "analysis.write" | "project.read",
  tenantId = A11E_TENANT,
  workspaceId = A11E_WORKSPACE,
) {
  return createTestCommerceExecutionContext({
    tenantId,
    workspaceId,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function stubClient() {
  return { from() { return this; } } as never;
}

describe("Assess Change authorization context", () => {
  it("CASE 1: analysis.read loads the Work Plan and analysis.write mutates Impact Assessment", async () => {
    const plans = createMemoryWorkPlanStore();
    const generator = new EngineeringWorkGeneratorService(stubClient(), plans);
    const write = commerce("analysis.write", CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    const read = commerce("analysis.read", CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE);
    const plan = await generator.generatePlan(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CONCEPT_STUDY",
      lifecycleStage: "CONCEPT",
      snapshot: conceptSnapshot(),
      readiness: WORKFLOW_READINESS.conceptUnknown,
      acknowledged: true,
    });
    const loaded = await generator.getPlan(read, CRUSHER_FEED_TENANT, plan.id);
    expect(loaded?.id).toBe(plan.id);
    const impact = createTestChangeWorkbenchService({ graph: loadChangeFixture() });
    const result = await impact.assess(commerce("analysis.write"), A11E_TENANT, {
      sourceObjectType: "engineering_work_plan",
      sourceObjectId: plan.id,
      projectId: A11E_PROJECT_A,
    });
    expect(result.assessment.status).toBe("REVIEW_REQUIRED");
    expect(result.humanReviewRequired).toBe(true);
    expect(result.assessment.snapshot.automaticImpactConfirmation).toBe(false);
    expect(CHANGE_WORKBENCH_AI_BOUNDARY.mayConfirmImpact).toBe(false);
  });

  it("CASE 2: analysis.write cannot satisfy Work Plan getPlan / analysis.read", async () => {
    const generator = new EngineeringWorkGeneratorService(stubClient(), createMemoryWorkPlanStore());
    await expect(generator.getPlan(commerce("analysis.write"), A11E_TENANT, "missing")).rejects.toMatchObject({
      code: "action_mismatch",
      message: "Action mismatch: expected analysis.read",
    });
  });

  it("CASE 3: analysis.read can getPlan but cannot Assess Change", async () => {
    const generator = new EngineeringWorkGeneratorService(stubClient(), createMemoryWorkPlanStore());
    await expect(generator.getPlan(commerce("analysis.read"), A11E_TENANT, "missing")).resolves.toBeNull();
    const impact = createTestChangeWorkbenchService({ graph: loadChangeFixture() });
    await expect(
      impact.assess(commerce("analysis.read"), A11E_TENANT, {
        sourceObjectType: "engineering_information",
        sourceObjectId: "info-mech-load",
        projectId: A11E_PROJECT_A,
      }),
    ).rejects.toMatchObject({
      code: "action_mismatch",
      message: "Action mismatch: expected analysis.write",
    });
  });

  it("CASE 4: wrong action fail-closes getPlan and assess", async () => {
    const generator = new EngineeringWorkGeneratorService(stubClient(), createMemoryWorkPlanStore());
    const impact = createTestChangeWorkbenchService();
    await expect(generator.getPlan(commerce("project.read"), A11E_TENANT, "missing")).rejects.toBeInstanceOf(CommerceDomainError);
    await expect(
      impact.assess(commerce("project.read"), A11E_TENANT, {
        sourceObjectType: "engineering_information",
        sourceObjectId: "info-mech-load",
        projectId: A11E_PROJECT_A,
      }),
    ).rejects.toMatchObject({
      code: "action_mismatch",
    });
  });

  it("CASE 5: workPlanId from Project B is denied when the selected project is Project A", () => {
    expect(() => assertCanonicalWorkPlanOwnership(A11E_PROJECT_B, A11E_PROJECT_A)).toThrow("CROSS_PROJECT_WORKPLAN_DENIED");
    expect(() => assertCanonicalWorkPlanOwnership(A11E_PROJECT_A, A11E_PROJECT_A)).not.toThrow();
    expect(() => assertCanonicalWorkPlanOwnership(A11E_PROJECT_A, null)).not.toThrow();
  });

  it("CASE 6: cross-workspace getPlan returns null", async () => {
    const plans = createMemoryWorkPlanStore();
    const generator = new EngineeringWorkGeneratorService(stubClient(), plans);
    const plan = await generator.generatePlan(
      commerce("analysis.write", CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE),
      CRUSHER_FEED_TENANT,
      {
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        workType: "CONCEPT_STUDY",
        lifecycleStage: "CONCEPT",
        snapshot: conceptSnapshot(),
        readiness: WORKFLOW_READINESS.conceptUnknown,
        acknowledged: true,
      },
    );
    const otherWorkspace = commerce("analysis.read", CRUSHER_FEED_TENANT, "workspace-other");
    await expect(generator.getPlan(otherWorkspace, CRUSHER_FEED_TENANT, plan.id)).resolves.toBeNull();
  });

  it("CASE 7: cross-tenant getPlan is denied", async () => {
    const generator = new EngineeringWorkGeneratorService(stubClient(), createMemoryWorkPlanStore());
    const foreign = commerce("analysis.read", "tenant-b", A11E_WORKSPACE);
    await expect(generator.getPlan(foreign, A11E_TENANT, "any")).rejects.toBeInstanceOf(CommerceDomainError);
    await expect(generator.getPlan(foreign, "tenant-b", "any")).resolves.toBeNull();
  });

  it("does not auto-confirm value dimensions", async () => {
    const impact = createTestChangeWorkbenchService({ graph: loadChangeFixture() });
    const result = await impact.assess(commerce("analysis.write"), A11E_TENANT, {
      sourceObjectType: "engineering_information",
      sourceObjectId: "info-mech-load",
      projectId: A11E_PROJECT_A,
    });
    expect(result.assessment.snapshot.automaticCostAcceptance).toBe(false);
    expect(result.assessment.snapshot.automaticConstructabilityAcceptance).toBe(false);
    expect(result.assessment.snapshot.automaticCarbonAcceptance).toBe(false);
    expect(result.assessment.snapshot.automaticOptionWinner).toBe(false);
    expect(result.assessment.snapshot.potentialIsNotConfirmed).toBe(true);
  });
});
