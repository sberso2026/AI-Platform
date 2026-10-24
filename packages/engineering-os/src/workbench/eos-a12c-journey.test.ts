import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { createTestArtifactService } from "../artifact-automation/service";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createMemoryTemplatePolicyStore, policyRecord } from "../artifact-automation/memory-template-store";
import { createTestPreIssueService } from "../pre-issue-review/service";
import { createTestChangeWorkbenchService } from "../change-workbench/service";
import { handoverStaleFixture, loadChangeFixture } from "../change-workbench/fixture";
import { evaluateHandoverCompleteness } from "../information-requirements/handover";
import { mixedScopeView } from "../lifecycle-intelligence/resolve";
import { DEFAULT_ENGINEERING_LIFECYCLE_PROFILE, transitionAllowed } from "../lifecycle-intelligence/profile";
import { ref, snapshotFromPlan, workPlanThreadGraph } from "../work-generator/compose";
import {
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
} from "../work-generator/fixture";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { EngineeringWorkGeneratorService } from "../work-generator/service";
import { explainWhyAffected, explainWhyRelated } from "./explain-lifecycle";
import { appendJourneyTrace, createJourneyTrace } from "./journey-trace";
import { A12C_LIFECYCLE_RECON } from "./journeys";
import { lifecycleTaskLabel } from "./lifecycle-attention";
import { composeOperationsReference } from "./operations-reference";
import { workbenchActionsForLifecycle } from "./lifecycle-actions";

const SME_PROJECT = "project-beta-sme";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function generator() {
  return new EngineeringWorkGeneratorService({ from() { return this; } } as never, createMemoryWorkPlanStore());
}

describe("EOS-A12C crusher support end-to-end lifecycle journey", () => {
  it("certifies governed continuity Concept through Handover without rebuilding context", async () => {
    expect(A12C_LIFECYCLE_RECON.newLifecycleDomain).toBe("NO");
    const svc = generator();
    const plans = createMemoryWorkPlanStore();
    const wired = new EngineeringWorkGeneratorService({ from() { return this; } } as never, plans);
    const policies = createMemoryTemplatePolicyStore();
    const artifacts = createMemoryArtifactStore();
    const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id), undefined, policies);
    const review = createTestPreIssueService({ artifacts, loadPlan: (id) => plans.getPlan(id) });
    const trace = createJourneyTrace("Crusher Support System");

    const concept = await wired.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CONCEPT_STUDY",
      lifecycleStage: "CONCEPT",
      systemId: A11A_SYSTEM_ID,
      snapshot: conceptSnapshot(),
      readiness: WORKFLOW_READINESS.conceptUnknown,
      acknowledged: true,
    });
    expect(concept.templateCode).toBe("EWT-CONCEPT-STUDY");
    expect(concept.explanations.engineeringApproved).toBe(false);
    const conceptArt = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, {
      workPlanId: concept.id,
      artifactType: "TECHNICAL_MEMORANDUM",
    });
    expect(conceptArt.ok).toBe(true);
    if (!conceptArt.ok) return;
    expect(conceptArt.resolution.sourceClass).toBe("EOS_DEFAULT");
    appendJourneyTrace(trace, {
      stage: "CONCEPT",
      objects: [{ type: "engineering_work_plan", id: concept.id, title: "Concept study" }],
      workPlanId: concept.id,
      information: concept.context.information.map((row) => row.title),
      artifacts: [conceptArt.artifact.id],
    });

    const pfs = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: concept.id,
      snapshot: optionStudySnapshot(),
      readiness: WORKFLOW_READINESS.optionUnknown,
      acknowledged: true,
    });
    expect(pfs.historicalPreserved).toBe(true);
    expect(pfs.previous.status).not.toBe("SUPERSEDED");
    expect(pfs.next.lifecycleStage).toBe("PREFEASIBILITY");
    expect(pfs.next.relatedObjectId).toBe(concept.id);
    expect(pfs.next.context.requirements.some((row) => row.objectId === "req-client-12mtpa")).toBe(true);
    expect(pfs.next.context.assumptions.some((row) => /validation|Inherited from CONCEPT/i.test(row.whyIncluded))).toBe(true);
    expect(pfs.handoff.advancesLifecycleGate).toBe(false);
    expect(pfs.next.context.decisions.some((row) => row.objectId === "dec-plant-location")).toBe(true);

    const feas = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: pfs.next.id,
      snapshot: feasibilitySnapshot(),
      readiness: WORKFLOW_READINESS.feasibilityConditions,
      acknowledged: true,
    });
    expect(feas.next.lifecycleStage).toBe("FEASIBILITY");
    expect(feas.next.workType).toBe("ENGINEERING_ANALYSIS");
    expect(feas.next.context.interfaces.some((row) => row.objectId === "if-cr-cv-01")).toBe(true);
    expect(feas.next.context.requirements.length).toBeGreaterThan(0);

    const feed = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: feas.next.id,
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    expect(feed.next.lifecycleStage).toBe("FEED");
    expect(feed.next.workType).toBe("DESIGN_CALCULATION");
    expect(feed.next.context.gaps.some((row) => /not automatically marked suitable for FEED|Geotechnical/i.test(row.explanation) || /Geotechnical/.test(row.title))).toBe(true);
    const feedCalc = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: feed.next.id, artifactType: "CALCULATION_WORKBOOK" });
    const feedReport = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: feed.next.id, artifactType: "DESIGN_REPORT" });
    expect(feedCalc.ok && feedReport.ok).toBe(true);
    const specPlan = await wired.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "SPECIFICATION",
      lifecycleStage: "FEED",
      systemId: A11A_SYSTEM_ID,
      relatedObjectType: "engineering_work_plan",
      relatedObjectId: feed.next.id,
      snapshot: snapshotFromPlan(feed.next),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    const feedSpec = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: specPlan.id, artifactType: "SPECIFICATION" });
    expect(feedSpec.ok).toBe(true);
    if (feedCalc.ok) {
      expect(feedCalc.artifact.provenance.templateSourceClass).toBe("EOS_DEFAULT");
    }

    const dd = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: feed.next.id,
      snapshot: detailedDesignReadySnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    expect(dd.next.lifecycleStage).toBe("DETAILED_DESIGN");
    expect(dd.next.workType).toBe("DESIGN_CALCULATION");
    expect(dd.next.id).not.toBe(feed.next.id);
    expect((await plans.getPlan(feed.next.id))?.status).not.toBe("SUPERSEDED");
    expect(dd.next.context.decisions.some((row) => /Pad foundation|Inherited from FEED/i.test(row.title) || row.whyIncluded.includes("FEED"))).toBe(true);
    const ddCalc = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: dd.next.id, artifactType: "CALCULATION_WORKBOOK" });
    expect(ddCalc.ok).toBe(true);
    const preIssue = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: dd.next.id });
    expect(preIssue.review.engineeringApproved).toBe(false);

    const impact = createTestChangeWorkbenchService({ graph: loadChangeFixture() });
    const assessed = await impact.assess(commerce(), CRUSHER_FEED_TENANT, {
      sourceObjectType: "change",
      sourceObjectId: "chg-mech-load",
      projectId: "proj-a11e-alpha",
      workflow: "DETAILED_DESIGN_CHANGE",
    });
    expect(assessed.assessment.snapshot.candidates.length).toBeGreaterThan(0);
    expect(JSON.stringify(assessed.assessment)).toMatch(/1380|1250|POTENTIAL|potential/i);

    const construction = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: dd.next.id,
      snapshot: constructionSnapshot(),
      readiness: WORKFLOW_READINESS.constructionReady,
    });
    expect(construction.next.lifecycleStage).toBe("CONSTRUCTION");
    expect(construction.next.workType).toBe("RFI_TQ_RESPONSE");
    expect(construction.next.context.information.some((row) => /Anchor bolt|Inherited from DETAILED_DESIGN/i.test(row.title) || row.whyIncluded.includes("DETAILED_DESIGN"))).toBe(true);
    const rfiArt = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: construction.next.id, artifactType: "RFI_RESPONSE" });
    expect(rfiArt.ok).toBe(true);
    const rfiReview = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: construction.next.id });
    expect(rfiReview.review.engineeringApproved).toBe(false);

    const commissioning = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: construction.next.id,
      snapshot: commissioningSnapshot(),
      readiness: WORKFLOW_READINESS.commissioningConditions,
      acknowledged: true,
    });
    expect(commissioning.next.lifecycleStage).toBe("COMMISSIONING");
    expect(commissioning.next.workType).toBe("COMMISSIONING_ENGINEERING");

    const handover = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: commissioning.next.id,
      workType: "HANDOVER_PREPARATION",
      toStage: "COMMISSIONING",
      snapshot: handoverSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    expect(handover.next.workType).toBe("HANDOVER_PREPARATION");
    expect(handover.next.templateCode).toBe("EWT-HANDOVER");
    const hoArt = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: handover.next.id, artifactType: "TECHNICAL_MEMORANDUM" });
    expect(hoArt.ok).toBe(true);
    if (hoArt.ok) {
      expect(hoArt.artifact.provenance.templateSourceClass).toBe("EOS_DEFAULT");
    }

    const late = evaluateHandoverCompleteness({
      pkg: {
        id: "ho-crusher",
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        displayName: "Crusher handover",
        systemId: A11A_SYSTEM_ID,
        assetId: null,
        discipline: "STRUCTURAL",
        lifecycleStage: "COMMISSIONING",
        state: "READY_FOR_REVIEW",
        acceptedBy: null,
        acceptedAt: null,
        createdBy: "eng",
        createdAt: "2026-10-01T00:00:00.000Z",
        updatedAt: "2026-10-01T00:00:00.000Z",
      },
      requirements: [],
      evaluations: [{
        requirementId: "req-final-dwg",
        satisfied: false,
        received: true,
        acceptedForPurpose: true,
        stale: true,
        superseded: true,
        conflicted: false,
        unmanagedRejected: false,
        informationRefId: "dwg-final",
        authorityOutcome: "AUTHORITATIVE_FOR_PURPOSE",
        freshness: "STALE",
        engineeringApproved: false,
        explanation: "Late approved change after handover assembly.",
      }],
    });
    expect(late.completeness).toBe("STALE");
    expect(late.humanAcceptanceRequired).toBe(true);
    const hoImpact = createTestChangeWorkbenchService({ graph: handoverStaleFixture() });
    const hoAssessed = await hoImpact.assess(commerce(), CRUSHER_FEED_TENANT, {
      sourceObjectType: "change",
      sourceObjectId: "chg-late",
      projectId: "proj-a11e-alpha",
      workflow: "HANDOVER",
    });
    expect(hoAssessed.assessment.snapshot.candidates.some((row) => row.objectId === "ho-pkg")).toBe(true);
    const why = explainWhyAffected(handoverStaleFixture(), "change", "chg-late");
    expect(why.some((row) => /affects|stale|handover/i.test(row))).toBe(true);

    const listed = await wired.listPlans(commerce("analysis.read"), CRUSHER_FEED_TENANT, CRUSHER_EXPANSION_FEED_PROJECT_ID);
    expect(listed.some((row) => row.lifecycleStage === "CONCEPT" && row.id === concept.id)).toBe(true);
    expect(listed.find((row) => row.id === concept.id)?.lifecycleStage).toBe("CONCEPT");
    expect(listed.find((row) => row.id === feed.next.id)?.lifecycleStage).toBe("FEED");
    if (conceptArt.ok && hoArt.ok) {
      expect(conceptArt.artifact.templateVersion).toBeTruthy();
      expect(hoArt.artifact.templateCode).not.toBe(conceptArt.artifact.templateCode);
    }

    const graph = workPlanThreadGraph(dd.next);
    expect(explainWhyRelated(graph, "engineering_work_plan", dd.next.id).length).toBeGreaterThan(0);
    expect(trace.sourceOfTruth).toBe(false);
    expect(transitionAllowed(DEFAULT_ENGINEERING_LIFECYCLE_PROFILE, "OPERATIONS", "MODIFICATION")).toBe(true);

    const ops = composeOperationsReference({
      assetCode: "P-101",
      designRequirement: dd.next.context.requirements[0] ?? ref("requirement", "req-foundation-capacity", "Foundation capacity", "Design requirement."),
      designDecision: dd.next.context.decisions[0] ?? null,
      drawing: ref("drawing", "dwg-anchor-bolt", "Anchor bolt drawing", "Construction drawing."),
      commissioningEvidence: commissioning.next.context.information[0]
        ? ref("engineering_information", "test-1", commissioning.next.context.information[0].title, "Commissioning evidence.")
        : null,
      modificationHistory: [ref("change", "chg-mod-1", "Future modification", "Traces to original design basis.")],
    });
    expect(ops.assetCode).toBe("P-101");
    expect(ops.modificationHistory[0]?.title).toMatch(/modification/i);

    expect(workbenchActionsForLifecycle("FEED").map((r) => r.code)).not.toEqual(workbenchActionsForLifecycle("CONSTRUCTION").map((r) => r.code));
    expect(lifecycleTaskLabel("FEED").action).not.toBe(lifecycleTaskLabel("CONSTRUCTION").action);

    const mixed = mixedScopeView([
      { id: "1", tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID, scopeType: "SYSTEM", scopeId: "sys-process", stage: "FEED", profileId: "x", profileVersion: "v1", version: 1, assignedAt: "2026-10-01T00:00:00.000Z" },
      { id: "2", tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID, scopeType: "SYSTEM", scopeId: "sys-struct", stage: "DETAILED_DESIGN", profileId: "x", profileVersion: "v1", version: 1, assignedAt: "2026-10-01T00:00:00.000Z" },
      { id: "3", tenantId: CRUSHER_FEED_TENANT, workspaceId: CRUSHER_FEED_WORKSPACE, projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID, scopeType: "ASSET", scopeId: "pkg-con", stage: "CONSTRUCTION", profileId: "x", profileVersion: "v1", version: 1, assignedAt: "2026-10-01T00:00:00.000Z" },
    ]);
    expect(new Set(mixed.map((row) => row.stage)).size).toBe(3);
    expect(svc).toBeTruthy();
  });

  it("resolves Project/Client override for enterprise while SME uses EOS Default across lifecycle artifacts", async () => {
    const plans = createMemoryWorkPlanStore();
    const wired = new EngineeringWorkGeneratorService({ from() { return this; } } as never, plans);
    const policies = createMemoryTemplatePolicyStore();
    const artifacts = createMemoryArtifactStore();
    const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id), undefined, policies);
    const sme = await wired.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: SME_PROJECT,
      workType: "HANDOVER_PREPARATION",
      lifecycleStage: "COMMISSIONING",
      snapshot: handoverSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    const smeGen = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: sme.id, artifactType: "TECHNICAL_MEMORANDUM" });
    expect(smeGen.ok).toBe(true);
    if (!smeGen.ok) return;
    expect(smeGen.resolution.sourceClass).toBe("EOS_DEFAULT");
    const historicalCode = smeGen.artifact.templateCode;
    await policies.savePolicy(policyRecord({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      artifactType: "TECHNICAL_MEMORANDUM",
      templateCode: "ABC-HO-REPORT",
      templateVersion: "3.0.0",
      name: "ABC Handover Report",
      sourceClass: "COMPANY_OFFICIAL",
      packagedAssetKey: "EAT-HANDOVER-REPORT",
      branding: { companyName: "ABC Engineering" },
    }));
    await policies.savePolicy(policyRecord({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      artifactType: "TECHNICAL_MEMORANDUM",
      templateCode: "ALPHA-HO-REPORT",
      templateVersion: "1.2.0",
      name: "Project Alpha Handover Report",
      sourceClass: "PROJECT_CLIENT_APPROVED",
      packagedAssetKey: "EAT-HANDOVER-REPORT",
      branding: { companyName: "Alpha Client Format" },
    }));
    const enterprise = await wired.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "HANDOVER_PREPARATION",
      lifecycleStage: "COMMISSIONING",
      systemId: A11A_SYSTEM_ID,
      snapshot: handoverSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    const companyProject = await wired.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: "project-gamma-company",
      workType: "HANDOVER_PREPARATION",
      lifecycleStage: "COMMISSIONING",
      snapshot: handoverSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    const entGen = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: enterprise.id, artifactType: "TECHNICAL_MEMORANDUM" });
    const companyGen = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: companyProject.id, artifactType: "TECHNICAL_MEMORANDUM" });
    expect(entGen.ok && companyGen.ok).toBe(true);
    if (!entGen.ok || !companyGen.ok) return;
    expect(entGen.resolution.sourceClass).toBe("PROJECT_CLIENT_APPROVED");
    expect(entGen.artifact.templateCode).toBe("ALPHA-HO-REPORT");
    expect(companyGen.resolution.sourceClass).toBe("COMPANY_OFFICIAL");
    await policies.savePolicy(policyRecord({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: SME_PROJECT,
      artifactType: "TECHNICAL_MEMORANDUM",
      templateCode: "BETA-HO-LATER",
      templateVersion: "9.0.0",
      name: "Later project template",
      sourceClass: "PROJECT_CLIENT_APPROVED",
      packagedAssetKey: "EAT-HANDOVER-REPORT",
    }));
    const later = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: sme.id, artifactType: "TECHNICAL_MEMORANDUM" });
    expect(later.ok).toBe(true);
    if (!later.ok) return;
    expect(smeGen.artifact.templateCode).toBe(historicalCode);
    expect(later.artifact.templateCode).toBe("BETA-HO-LATER");
    expect(smeGen.artifact.id).not.toBe(later.artifact.id);
  });
});
