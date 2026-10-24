import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { traverseThread } from "../digital-thread/traversal";
import { WORK_GENERATOR_AI_BOUNDARY, WORK_GENERATOR_PRIVACY } from "./types";
import { ENGINEERING_WORK_TEMPLATES, templateFor } from "./catalog";
import { candidateWorkPlanAssurance, composeDeliverableFromWorkPlan, workPlanThreadGraph, WORK_GENERATOR_RECON } from "./compose";
import {
  A11A_DELIVERABLE_ID,
  A11A_INTERFACE_ID,
  A11A_SYSTEM_ID,
  commissioningSnapshot,
  conceptSnapshot,
  constructionSnapshot,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  detailedDesignReadySnapshot,
  feasibilitySnapshot,
  feedStructuralSnapshot,
  handoverSnapshot,
  optionStudySnapshot,
  WORKFLOW_READINESS,
} from "./fixture";
import { generateEngineeringWorkPlan } from "./generator";
import { createMemoryWorkPlanStore } from "./memory-store";
import { EngineeringWorkGeneratorService } from "./service";

function commerce(action: "analysis.read" | "analysis.write", tenantId = CRUSHER_FEED_TENANT, workspaceId = CRUSHER_FEED_WORKSPACE) {
  return createTestCommerceExecutionContext({
    tenantId,
    workspaceId,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function stubClient() {
  return { from() { return this; } } as never;
}

function service() {
  return new EngineeringWorkGeneratorService(stubClient(), createMemoryWorkPlanStore());
}

describe("EOS-A11A Engineering Work Generator", () => {
  it("keeps WorkTemplate and WorkPlan distinct from WBS, Review Package, Deliverable, and Kernel Workflow", () => {
    expect(WORK_GENERATOR_RECON.kernelWorkflow).toBe("REUSE");
    expect(WORK_GENERATOR_RECON.jobService).toBe("REUSE");
    expect(WORK_GENERATOR_RECON.eventBus).toBe("REUSE");
    expect(WORK_GENERATOR_RECON.wbsWorkPackage).toBe("LEGACY");
    expect(WORK_GENERATOR_RECON.engineeringWorkTemplate).toBe("MISSING");
    const catalog = service().catalog();
    expect(catalog.notAWbsPackage).toBe(true);
    expect(catalog.notAReviewPackage).toBe(true);
    expect(catalog.notADeliverable).toBe(true);
    expect(catalog.notAWorkflowEngine).toBe(true);
    expect(catalog.templates.every((row) => row.version === "v1")).toBe(true);
    expect(catalog.workTypes).toHaveLength(12);
  });

  it("certifies CONCEPT STUDY without generating design", async () => {
    const svc = service();
    const plan = await svc.generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CONCEPT_STUDY",
      lifecycleStage: "CONCEPT",
      systemId: A11A_SYSTEM_ID,
      snapshot: conceptSnapshot(),
      readiness: WORKFLOW_READINESS.conceptUnknown,
      acknowledged: true,
    });
    expect(plan.templateCode).toBe("EWT-CONCEPT-STUDY");
    expect(plan.readiness).toBe("READY_WITH_CONDITIONS");
    expect(plan.startAllowed).toBe(true);
    expect(plan.explanations.engineeringApproved).toBe(false);
    expect(plan.context.expectedOutputs.map((row) => row.outputType)).toEqual(expect.arrayContaining(["CONCEPT_STUDY", "OPTION_STUDY"]));
    expect(plan.context.expectedOutputs.every((row) => row.generated === false)).toBe(true);
    expect(plan.context.actions.map((row) => row.code)).toEqual(expect.arrayContaining(["PREPARE_CONCEPT_STUDY", "PREPARE_PRELIMINARY_SIZING", "PREPARE_OPTION_STUDY"]));
    expect(plan.context.actions.find((row) => row.code === "PREPARE_CONCEPT_STUDY")?.availability).toBe("DEFERRED_IMPLEMENTATION");
    expect(plan.context.requirements[0]?.whyIncluded).toMatch(/Client production/);
  });

  it("certifies OPTION STUDY without selecting a winner", async () => {
    const plan = await service().generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "OPTION_STUDY",
      lifecycleStage: "PREFEASIBILITY",
      snapshot: optionStudySnapshot(),
      readiness: WORKFLOW_READINESS.optionUnknown,
      acknowledged: true,
    });
    expect(plan.explanations.optionWinnerSelected).toBe(false);
    expect(plan.context.expectedOutputs.some((row) => row.outputType === "OPTION_STUDY")).toBe(true);
    expect(plan.context.actions.some((row) => row.code === "PREPARE_OPTION_STUDY")).toBe(true);
  });

  it("certifies multidisciplined FEASIBILITY work with interfaces and requirements", async () => {
    const plan = await service().generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "ENGINEERING_ANALYSIS",
      lifecycleStage: "FEASIBILITY",
      snapshot: feasibilitySnapshot(),
      readiness: WORKFLOW_READINESS.feasibilityConditions,
      acknowledged: true,
    });
    expect(plan.discipline).toBe("PROCESS");
    expect(plan.context.interfaces[0]?.objectId).toBe(A11A_INTERFACE_ID);
    expect(plan.context.requirements).toHaveLength(2);
    expect(plan.readiness).toBe("READY_WITH_CONDITIONS");
  });

  it("certifies FEED structural engineering as blocked until geotechnical input is accepted", async () => {
    const svc = service();
    const plan = await svc.generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "FEED",
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.feedBlocked,
    });
    expect(plan.templateCode).toBe("EWT-FEED-STRUCT");
    expect(plan.readiness).toBe("BLOCKED_INFORMATION_MISSING");
    expect(plan.startAllowed).toBe(false);
    expect(plan.context.gaps[0]?.title).toMatch(/Geotechnical/);
    expect(plan.context.information.some((row) => row.title === "Structural design criteria")).toBe(true);
    expect(plan.context.deliverable?.objectId).toBe(A11A_DELIVERABLE_ID);
    const started = await svc.startWork(commerce("analysis.write"), CRUSHER_FEED_TENANT, plan.id);
    expect(started.allowed).toBe(false);
    expect(started.autoApproved).toBe(false);
    expect(composeDeliverableFromWorkPlan(true).maturityChanged).toBe(false);
  });

  it("certifies DETAILED DESIGN foundation calculation and allows start only when READY", async () => {
    const svc = service();
    const plan = await svc.generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "DETAILED_DESIGN",
      snapshot: detailedDesignReadySnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    expect(plan.templateCode).toBe("EWT-DD-FOUNDATION");
    expect(plan.readiness).toBe("READY");
    expect(plan.context.expectedOutputs.map((row) => row.outputType)).toEqual(
      expect.arrayContaining(["CALCULATION_WORKBOOK", "ANALYSIS_REQUEST", "DRAWING_INPUT", "DESIGN_REPORT"]),
    );
    const started = await svc.startWork(commerce("analysis.write"), CRUSHER_FEED_TENANT, plan.id);
    expect(started.allowed).toBe(true);
    expect(started.plan.status).toBe("IN_PROGRESS");
    expect(started.autoApproved).toBe(false);
  });

  it("certifies construction RFI/TQ response without an Aconex connector", async () => {
    const plan = await service().generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "RFI_TQ_RESPONSE",
      lifecycleStage: "CONSTRUCTION",
      relatedObjectType: "technical_query",
      relatedObjectId: "rfi-anchor-bolt-location",
      snapshot: constructionSnapshot(),
      readiness: WORKFLOW_READINESS.constructionReady,
    });
    expect(plan.context.actions.map((row) => row.code)).toEqual(
      expect.arrayContaining(["ASSESS_CHANGE", "PREPARE_RFI_TQ_RESPONSE", "OPEN_CURRENT_DRAWING", "CREATE_REVIEW"]),
    );
    expect(plan.relatedObjectId).toBe("rfi-anchor-bolt-location");
  });

  it("certifies commissioning engineering without becoming a commissioning platform", async () => {
    const plan = await service().generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "COMMISSIONING_ENGINEERING",
      lifecycleStage: "COMMISSIONING",
      snapshot: commissioningSnapshot(),
      readiness: WORKFLOW_READINESS.commissioningConditions,
      acknowledged: true,
    });
    expect(plan.readiness).toBe("READY_WITH_CONDITIONS");
    expect(plan.context.requirements[0]?.title).toMatch(/test requirements/i);
  });

  it("certifies handover preparation using the A10C handover package reference", async () => {
    const plan = await service().generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "HANDOVER_PREPARATION",
      lifecycleStage: "COMMISSIONING",
      snapshot: handoverSnapshot(),
      readiness: WORKFLOW_READINESS.handoverBlocked,
    });
    expect(plan.context.handoverPackage?.objectId).toBe("ho-crusher-subsys");
    expect(plan.startAllowed).toBe(false);
    expect(plan.context.actions.some((row) => row.code === "PREPARE_HANDOVER")).toBe(true);
  });

  it("fingerprints inputs and marks a refreshed plan stale without overwriting provenance", async () => {
    const svc = service();
    const first = await svc.generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "DETAILED_DESIGN",
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.feedBlocked,
    });
    const refreshed = await svc.refreshPlan(
      commerce("analysis.write"),
      CRUSHER_FEED_TENANT,
      first.id,
      detailedDesignReadySnapshot(),
      WORKFLOW_READINESS.detailedReady,
    );
    expect(refreshed.diff.changedReadiness).toBe(true);
    expect(refreshed.diff.newInformation).toEqual(expect.arrayContaining(["Geotechnical bearing capacity"]));
    expect(refreshed.historicalProvenancePreserved).toBe(true);
    expect(refreshed.next.supersedesPlanId).toBe(first.id);
    expect(refreshed.next.inputFingerprint).not.toBe(first.inputFingerprint);
    const previous = await svc.getPlan(commerce("analysis.read"), CRUSHER_FEED_TENANT, first.id);
    expect(previous?.status).toBe("SUPERSEDED");
    expect(previous?.generatedAt).toBe(first.generatedAt);
    expect(svc.evaluateStaleness(first, detailedDesignReadySnapshot()).state).toBe("STALE");
  });

  it("does not admit unmanaged personal files into a work plan", async () => {
    await expect(
      service().generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        workType: "CONCEPT_STUDY",
        snapshot: conceptSnapshot(),
        unmanagedPath: "C:\\Users\\me\\Documents\\Personal\\mortgage.xlsx",
      }),
    ).rejects.toThrow(/unmanaged_file_outside_eos/);
  });

  it("composes Digital Thread with USES and DEPENDS_ON and does not auto-create findings", async () => {
    const plan = generateEngineeringWorkPlan({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      template: templateFor("DESIGN_CALCULATION", "DETAILED_DESIGN")!,
      snapshot: detailedDesignReadySnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    const graph = workPlanThreadGraph(plan);
    const traversal = traverseThread(graph, {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      root: { objectType: "engineering_work_plan", objectId: plan.id },
      direction: "both",
      maxDepth: 2,
    });
    expect(graph.links.some((row) => row.relationship === "USES")).toBe(true);
    expect(graph.links.some((row) => row.relationship === "DEPENDS_ON")).toBe(true);
    expect(traversal.relationships.length).toBeGreaterThan(0);
    const assurance = candidateWorkPlanAssurance(plan);
    expect(assurance.automaticFinding).toBe(false);
    expect(WORK_GENERATOR_AI_BOUNDARY.mayApproveWork).toBe(false);
    expect(WORK_GENERATOR_AI_BOUNDARY.maySelectGoverningInformation).toBe(false);
    expect(WORK_GENERATOR_PRIVACY.employeeProductivityScoring).toBe("PROHIBITED");
    expect(plan.metrics.durationMs).toBeLessThan(1000);
    expect(plan.metrics.informationReferencesEvaluated).toBeGreaterThan(0);
  });

  it("continues an existing plan without rebuilding context by hand", async () => {
    const svc = service();
    const plan = await svc.generatePlan(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "DESIGN_CALCULATION",
      lifecycleStage: "DETAILED_DESIGN",
      snapshot: detailedDesignReadySnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    const summary = svc.continueWorkSummary(plan);
    expect(summary.workType).toBe("DESIGN_CALCULATION");
    expect(summary.projectId).toBe(CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(summary.expectedOutputs.length).toBeGreaterThan(0);
    expect(summary.actions.length).toBeGreaterThan(0);
  });
});
