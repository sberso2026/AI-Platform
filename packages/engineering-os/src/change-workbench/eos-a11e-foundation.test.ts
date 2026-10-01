import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { generateEngineeringWorkPlan } from "../work-generator/generator";
import { templateFor } from "../work-generator/catalog";
import {
  A11A_SYSTEM_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  constructionSnapshot,
  WORKFLOW_READINESS,
} from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createTestArtifactService } from "../artifact-automation/service";
import { createTestPreIssueService } from "../pre-issue-review/service";
import { CHANGE_WORKBENCH_AI_BOUNDARY, CHANGE_WORKBENCH_PRIVACY, CHANGE_WORKBENCH_RECON, FORBIDDEN_IMPACT_ASSESSMENT_STATES } from "./types";
import { IMPACT_ASSESSMENT_POLICY } from "./policy";
import { createTestChangeWorkbenchService } from "./service";
import {
  A11E_PROJECT_A,
  A11E_PROJECT_B,
  A11E_TENANT,
  A11E_WORKSPACE,
  assumptionInvalidationFixture,
  clashFixture,
  commissioningFixture,
  deepChainFixture,
  feedVendorFixture,
  fieldChangeFixture,
  handoverStaleFixture,
  loadChangeFixture,
  requirementChangeFixture,
  steelConcreteOptions,
} from "./fixture";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: A11E_TENANT,
    workspaceId: A11E_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

describe("EOS-A11E Change Impact, Option Study & Construction Workbench", () => {
  it("reuses canonical Change/Impact/Optimization/Decision and never auto-confirms", () => {
    const service = createTestChangeWorkbenchService();
    const catalog = service.catalog();
    expect(catalog.recon.changeIntelligence).toBe("REUSE");
    expect(catalog.recon.impactIntelligence).toBe("EXTEND");
    expect(catalog.recon.optimizationIntelligence).toBe("REUSE");
    expect(catalog.recon.decisionIntelligence).toBe("REUSE");
    expect(catalog.recon.digitalThread).toBe("COMPOSE");
    expect(catalog.recon.preIssueReview).toBe("REUSE");
    expect(catalog.duplicateChangeDomainCreated).toBe(false);
    expect(catalog.automaticOptionWinner).toBe(false);
    expect(catalog.autonomousChangeApproval).toBe(false);
    expect(CHANGE_WORKBENCH_AI_BOUNDARY.mayConfirmImpact).toBe(false);
    expect(CHANGE_WORKBENCH_AI_BOUNDARY.mayChooseOption).toBe(false);
    expect(CHANGE_WORKBENCH_PRIVACY.binaryDuplication).toBe("NO");
    expect(CHANGE_WORKBENCH_RECON.newChangeDomain).toBe("NO");
    expect(FORBIDDEN_IMPACT_ASSESSMENT_STATES).toEqual(expect.arrayContaining(["APPROVED_DESIGN", "SAFE", "IFC_READY"]));
    expect(IMPACT_ASSESSMENT_POLICY.autoConfirmImpact).toBe(false);
    expect(IMPACT_ASSESSMENT_POLICY.opaqueAiRelevanceScore).toBe(false);
  });

  it("discovers the mechanical load Digital Thread as POTENTIAL_IMPACT only", async () => {
    const events: string[] = [];
    const service = createTestChangeWorkbenchService({
      graph: loadChangeFixture(),
      recorder: async (_c, _t, input) => {
        events.push(input.eventType);
      },
    });
    const result = await service.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "engineering_information",
      sourceObjectId: "info-mech-load",
      projectId: A11E_PROJECT_A,
      workflow: "DETAILED_DESIGN_CHANGE",
    });
    const ids = result.assessment.snapshot.candidates.map((row) => row.objectId);
    expect(ids).toEqual(expect.arrayContaining(["ifc-mech-struct", "an-024", "str-calc-021", "s-104", "del-foundations"]));
    expect(result.assessment.snapshot.candidates.every((row) => row.disposition === "POTENTIAL_IMPACT" || row.objectId === "s-notes")).toBe(true);
    expect(result.assessment.snapshot.candidates.every((row) => row.autoConfirmed === false)).toBe(true);
    expect(result.assessment.snapshot.automaticImpactConfirmation).toBe(false);
    expect(result.assessment.snapshot.candidates.some((row) => row.disposition === "CONFIRMED_IMPACT")).toBe(false);
    expect(result.assessment.snapshot.disciplines.sort()).toEqual(expect.arrayContaining(["STRUCTURAL", "MECHANICAL"]));
    expect(result.assessment.snapshot.disciplines).not.toContain("ELECTRICAL");
    expect(result.assessment.snapshot.candidates.some((row) => row.objectId === "e-999-unrelated")).toBe(false);
    for (const candidate of result.assessment.snapshot.candidates) {
      expect(candidate.relationPath.length).toBeGreaterThan(0);
      expect(candidate.reason).toMatch(/RELATED/);
      expect(candidate.traversalDepth).toBeGreaterThan(0);
      expect(candidate.sourceEvidence).toBe("engineering_information:info-mech-load");
    }
    expect(result.assessment.snapshot.pack.binaryContentCopied).toBe(false);
    expect(events).toEqual(expect.arrayContaining(["IMPACT_ASSESSMENT_STARTED", "IMPACT_ASSESSMENT_COMPLETED"]));
  });

  it("requires human confirmation and does not silently reconfirm NOT_IMPACTED", async () => {
    const service = createTestChangeWorkbenchService({ graph: loadChangeFixture() });
    const first = await service.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "engineering_information",
      sourceObjectId: "info-mech-load",
      projectId: A11E_PROJECT_A,
    });
    await service.dispose(commerce(), A11E_TENANT, {
      assessmentId: first.assessment.id,
      candidateIds: ["analysis_result:an-024"],
      disposition: "CONFIRMED_IMPACT",
    });
    await service.dispose(commerce(), A11E_TENANT, {
      assessmentId: first.assessment.id,
      candidateIds: ["calculation:str-calc-021"],
      disposition: "CONFIRMED_IMPACT",
    });
    await service.dispose(commerce(), A11E_TENANT, {
      assessmentId: first.assessment.id,
      candidateIds: ["drawing:s-104"],
      disposition: "NEEDS_INVESTIGATION",
    });
    const dismissed = await service.dispose(commerce(), A11E_TENANT, {
      assessmentId: first.assessment.id,
      candidateIds: ["drawing:s-notes"],
      disposition: "NOT_IMPACTED",
      rationale: "General notes drawing is related but not load-bearing.",
    });
    expect(dismissed.snapshot.candidates.find((row) => row.objectId === "del-foundations")?.disposition).toBe("POTENTIAL_IMPACT");
    expect(dismissed.snapshot.actions.some((row) => row.code === "PREPARE_ANALYSIS" && row.completed === false)).toBe(true);
    const rerun = await service.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "engineering_information",
      sourceObjectId: "info-mech-load",
      projectId: A11E_PROJECT_A,
    });
    expect(rerun.historicalPreserved).toBe(true);
    expect(rerun.comparison.overwritten).toBe(false);
    expect(rerun.assessment.supersedesAssessmentId).toBe(first.assessment.id);
    expect(rerun.assessment.snapshot.candidates.find((row) => row.objectId === "an-024")?.disposition).toBe("CONFIRMED_IMPACT");
    expect(rerun.assessment.snapshot.candidates.find((row) => row.objectId === "str-calc-021")?.disposition).toBe("CONFIRMED_IMPACT");
    expect(rerun.assessment.snapshot.candidates.find((row) => row.objectId === "s-104")?.disposition).toBe("NEEDS_INVESTIGATION");
    expect(rerun.assessment.snapshot.candidates.find((row) => row.objectId === "s-notes")?.disposition).toBe("NOT_IMPACTED");
    expect(rerun.assessment.snapshot.candidates.find((row) => row.objectId === "del-foundations")?.disposition).toBe("POTENTIAL_IMPACT");
  });

  it("reports PARTIAL_TRAVERSAL when Digital Thread bounds are reached", async () => {
    const service = createTestChangeWorkbenchService({ graph: deepChainFixture(8) });
    const result = await service.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "change",
      sourceObjectId: "chg-deep",
      projectId: A11E_PROJECT_A,
      maxDepth: 2,
    });
    expect(result.assessment.completeness).toBe("PARTIAL");
    expect(result.assessment.traversalStatus).toBe("PARTIAL_TRAVERSAL");
    expect(result.completenessNote).toMatch(/not a claim that all real engineering impacts/);
  });

  it("surfaces requirement, assumption, interface, analysis, deliverable, configuration, review, and work-plan impact", async () => {
    const req = createTestChangeWorkbenchService({ graph: requirementChangeFixture() });
    const reqResult = await req.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "requirement",
      sourceObjectId: "req-prod",
      projectId: A11E_PROJECT_A,
      workflow: "CONCEPT_PFS",
    });
    const reqIds = reqResult.assessment.snapshot.candidates.map((row) => row.objectId);
    expect(reqIds).toEqual(expect.arrayContaining(["ar-proc", "dec-duty", "del-bod", "ifc-pm", "wp-proc", "rev-req"]));

    const asm = createTestChangeWorkbenchService({ graph: assumptionInvalidationFixture() });
    const asmResult = await asm.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "assumption",
      sourceObjectId: "asm-soil",
      projectId: A11E_PROJECT_A,
    });
    expect(asmResult.assessment.snapshot.candidates.some((row) => row.objectId === "ar-found")).toBe(true);
    expect(asmResult.assessment.snapshot.candidates.find((row) => row.objectId === "ar-found")?.reason).toMatch(/Assumption/);

    const load = createTestChangeWorkbenchService({ graph: loadChangeFixture() });
    const loadResult = await load.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "engineering_information",
      sourceObjectId: "info-mech-load",
      projectId: A11E_PROJECT_A,
    });
    const cats = loadResult.assessment.snapshot.candidates.map((row) => row.category);
    expect(cats).toEqual(expect.arrayContaining(["INTERFACE", "ANALYSIS", "CALCULATION", "DRAWING", "DELIVERABLE", "REVIEW", "WORK_PLAN", "CONFIGURATION"]));
  });

  it("compares option studies with visible criteria and no automatic winner", async () => {
    const service = createTestChangeWorkbenchService({ graph: requirementChangeFixture() });
    const result = await service.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "requirement",
      sourceObjectId: "req-prod",
      projectId: A11E_PROJECT_A,
      workflow: "OPTION_STUDY",
      optionStudy: { title: "Steel vs concrete vs modular support", options: steelConcreteOptions() },
    });
    const study = result.assessment.snapshot.optionStudy!;
    expect(study.criteria.map((row) => row.label)).toEqual(expect.arrayContaining(["CAPEX", "OPEX", "Schedule", "Constructability", "Maintainability"]));
    expect(study.criteria.every((row) => row.weightSource === "HUMAN_ENTERED")).toBe(true);
    expect(study.automaticWinner).toBe(false);
    expect(study.selectedOptionId).toBeNull();
    expect(study.humanDecisionRequired).toBe(true);
    expect(study.optimizationReused).toBe(true);
    expect(study.decisionIntelligenceReused).toBe(true);
    expect(study.pareto.length).toBe(3);
    const decided = await service.recordHumanDecision(commerce(), A11E_TENANT, result.assessment.id, "opt-a", "dec-human-1");
    expect(decided.snapshot.optionStudy?.humanDecisionRecorded).toBe(true);
    expect(decided.snapshot.optionStudy?.automaticWinner).toBe(false);
    expect(decided.snapshot.automaticOptionWinner).toBe(false);
    expect(service.rejectCallerClaims({ automaticWinner: true })).toBe("caller_supplied_authority_rejected");
  });

  it("assembles FEED vendor footprint impact only where evidence exists", async () => {
    const service = createTestChangeWorkbenchService({ graph: feedVendorFixture() });
    const result = await service.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "engineering_information",
      sourceObjectId: "info-vendor-fp",
      projectId: A11E_PROJECT_A,
      workflow: "FEED_CHANGE",
    });
    const ids = result.assessment.snapshot.candidates.map((row) => row.objectId);
    expect(ids).toEqual(expect.arrayContaining(["ifc-ms", "an-support", "calc-support", "s-support", "c-found", "del-feed", "wp-feed"]));
    expect(result.assessment.snapshot.disciplines.sort()).toEqual(["CIVIL", "MECHANICAL", "STRUCTURAL"]);
    expect(result.assessment.snapshot.disciplines).not.toContain("ELECTRICAL");
    expect(result.assessment.snapshot.disciplines).not.toContain("PIPING");
  });

  it("assesses construction field change and clash without choosing a technical solution", async () => {
    const field = createTestChangeWorkbenchService({ graph: fieldChangeFixture() });
    const fieldResult = await field.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "technical_query",
      sourceObjectId: "rfi-anchor-75",
      projectId: A11E_PROJECT_A,
      workflow: "FIELD_CHANGE",
      constructionQuery: {
        id: "rfi-anchor-75",
        type: "FIELD_CHANGE",
        summary: "Move anchor bolts 75 mm. Clash with reinforcement.",
        location: "Crusher foundation",
      },
    });
    const fieldIds = fieldResult.assessment.snapshot.candidates.map((row) => row.objectId);
    expect(fieldIds).toEqual(expect.arrayContaining(["s-anchor", "s-rebar", "m-baseplate", "calc-anchor", "an-found", "bl-con"]));
    expect(fieldResult.assessment.snapshot.construction?.workPlanType).toBe("RFI_TQ_RESPONSE");
    expect(fieldResult.assessment.snapshot.construction?.humanDecisionRequired).toBe(true);
    expect(fieldResult.assessment.snapshot.construction?.technicalSolutionChosen).toBe(false);
    expect(field.artifactContracts().rfiResponse.label).toBe("DRAFT FOR ENGINEER REVIEW");
    expect(field.artifactContracts().preIssueReviewReused).toBe(true);

    const clash = createTestChangeWorkbenchService({ graph: clashFixture() });
    const clashResult = await clash.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "technical_query",
      sourceObjectId: "rfi-pipe-beam",
      projectId: A11E_PROJECT_A,
      workflow: "CONSTRUCTION_RFI",
      constructionQuery: { id: "rfi-pipe-beam", type: "RFI", summary: "Pipe conflicts with structural beam." },
    });
    expect(clashResult.assessment.snapshot.candidates.map((row) => row.objectId)).toEqual(
      expect.arrayContaining(["pipe-12", "beam-s8", "s-steel", "ifc-pipe-struct"]),
    );
    expect(clashResult.assessment.snapshot.construction?.technicalSolutionChosen).toBe(false);
  });

  it("identifies commissioning and handover impacts without automatic acceptance", async () => {
    const comm = createTestChangeWorkbenchService({ graph: commissioningFixture() });
    const commResult = await comm.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "technical_query",
      sourceObjectId: "cq-op-dev",
      projectId: A11E_PROJECT_A,
      workflow: "COMMISSIONING",
      constructionQuery: { id: "cq-op-dev", type: "COMMISSIONING_QUERY", summary: "Test result differs from expected operating condition." },
    });
    expect(commResult.assessment.snapshot.candidates.map((row) => row.objectId)).toEqual(
      expect.arrayContaining(["info-op", "bl-comm", "dec-op", "ho-sys"]),
    );

    const ho = createTestChangeWorkbenchService({ graph: handoverStaleFixture() });
    const hoResult = await ho.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "change",
      sourceObjectId: "chg-late",
      projectId: A11E_PROJECT_A,
      workflow: "HANDOVER",
    });
    expect(hoResult.assessment.snapshot.candidates.some((row) => row.objectId === "ho-pkg" && row.category === "HANDOVER")).toBe(true);
    expect(hoResult.assessment.snapshot.candidates.find((row) => row.objectId === "ho-pkg")?.reason).toMatch(/Handover/);
  });

  it("keeps Project A assessment isolated when the UI shows Project B", async () => {
    const service = createTestChangeWorkbenchService({ graph: loadChangeFixture() });
    const result = await service.assess(commerce(), A11E_TENANT, {
      sourceObjectType: "engineering_information",
      sourceObjectId: "info-mech-load",
      projectId: A11E_PROJECT_A,
      selectedProjectId: A11E_PROJECT_B,
    });
    expect(result.assessment.projectId).toBe(A11E_PROJECT_A);
    expect(result.viewProjectMismatch).toBe(true);
    expect(result.crossProjectContamination).toBe(false);
    expect(result.assessment.snapshot.candidates.every((row) => row.projectId === A11E_PROJECT_A)).toBe(true);
    expect(result.assessment.snapshot.candidates.some((row) => row.objectId === "e-999-unrelated")).toBe(false);
  });

  it("reuses A11B artifact generation and A11D pre-issue review for construction response", async () => {
    const plan = generateEngineeringWorkPlan({
      tenantId: A11E_TENANT,
      workspaceId: A11E_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "RFI_TQ_RESPONSE",
      template: templateFor("RFI_TQ_RESPONSE", "CONSTRUCTION")!,
      snapshot: constructionSnapshot(),
      readiness: WORKFLOW_READINESS.constructionReady,
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      relatedObjectType: "technical_query",
      relatedObjectId: "rfi-anchor-75",
      generatedBy: "cert-a11e",
    });
    const plans = createMemoryWorkPlanStore();
    await plans.savePlan(plan);
    const artifacts = createMemoryArtifactStore();
    const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id));
    const generated = await artifactSvc.generate(commerce(), A11E_TENANT, { workPlanId: plan.id, artifactType: "RFI_RESPONSE" });
    if (!generated.ok) throw new Error("rfi generate failed");
    expect(generated.artifact.status).toMatch(/DRAFT|READY_FOR_ENGINEER_REVIEW/);
    const stored = await artifacts.getArtifact(generated.artifact.id);
    const review = createTestPreIssueService({ artifacts, loadPlan: (id) => plans.getPlan(id) });
    const ran = await review.run(commerce(), A11E_TENANT, { workPlanId: plan.id, artifactId: stored!.id });
    expect(ran.review.engineeringApproved).toBe(false);
    expect(ran.review.designApproved).toBe(false);

    const changePlan = generateEngineeringWorkPlan({
      tenantId: A11E_TENANT,
      workspaceId: A11E_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CHANGE_ASSESSMENT",
      template: templateFor("CHANGE_ASSESSMENT", "CONSTRUCTION")!,
      snapshot: constructionSnapshot(),
      readiness: WORKFLOW_READINESS.constructionReady,
      generatedBy: "cert-a11e",
    });
    await plans.savePlan(changePlan);
    const impact = await artifactSvc.generate(commerce(), A11E_TENANT, {
      workPlanId: changePlan.id,
      artifactType: "TECHNICAL_MEMORANDUM",
      templateCode: "EAT-IMPACT-REPORT",
    });
    expect(impact.ok).toBe(true);
  });
});
