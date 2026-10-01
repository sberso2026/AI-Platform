import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { createTestArtifactService } from "../artifact-automation/service";
import { createMemoryArtifactStore } from "../artifact-automation/memory-store";
import { createMemoryTemplatePolicyStore, policyRecord } from "../artifact-automation/memory-template-store";
import { LegacyRelationalArtifactBinaryStore, MemoryObjectArtifactBinaryStore, RoutingArtifactBinaryStore } from "../artifact-automation/binary-adapters";
import { assertObjectKeyAuthorization, hashBytes, pointerFromArtifact } from "../artifact-automation/binary-store";
import { createTestPreIssueService } from "../pre-issue-review/service";
import { createTestChangeWorkbenchService } from "../change-workbench/service";
import {
  A11E_PROJECT_A,
  A11E_PROJECT_B,
  fieldChangeFixture,
  handoverStaleFixture,
  loadChangeFixture,
  steelConcreteOptions,
} from "../change-workbench/fixture";
import { assembleConstructionContext } from "../change-workbench/construction";
import { EngineeringInformationRequirementService } from "../information-requirements/service";
import { createMemoryInformationRequirementStore } from "../information-requirements/memory-store";
import {
  A10A_MECH_LOAD_ID,
  A10A_SOURCE_B_ID,
  A10C_GEO_REF_ID,
  A10C_MANAGED_REPO_ID,
  A10C_SURVEY_REF_ID,
  a10cAuthorityPolicies,
  foundationInformationRefs,
} from "../information-requirements/fixture";
import { evaluateHandoverCompleteness } from "../information-requirements/handover";
import { createMemoryWorkPlanStore } from "../work-generator/memory-store";
import { EngineeringWorkGeneratorService } from "../work-generator/service";
import { ref, snapshotFromPlan, workPlanThreadGraph } from "../work-generator/compose";
import {
  A11A_HANDOVER_ID,
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
import { inheritWorkPlanContext } from "../workbench/inherit";
import { workbenchActionsForLifecycle } from "../workbench/lifecycle-actions";
import { answerLifecycleQuestion, LIFECYCLE_ASK_QUESTIONS } from "../workbench/ask-lifecycle";
import { composeOperationsReference } from "../workbench/operations-reference";
import { explainDecisionOrigin, explainWhatChanged, explainWhyAffected, explainWhyRelated } from "../workbench/explain-lifecycle";
import { resolveEngineeringAttention } from "../attention/resolve";
import type { AttentionProjectSnapshot } from "../attention/types";
import { SPACE_GASS_CATALOG_ENTRY } from "../external-tools/catalog";
import { officeToolReadiness } from "../tool-orchestration/tools";
import { returnedBinaryUploadsInPilot, SURVEILLANCE_PROHIBITIONS } from "./a14a-profile";
import {
  A15A_AUTHORITY_REMINDER,
  A15A_CARRY_FORWARD_BLOCKERS,
  A15A_DATA_CLASSIFICATIONS,
  A15A_DEMONSTRATION_SCRIPT,
  A15A_FEATURE_FREEZE_BOUNDARIES,
  A15A_FUTURE_PILOT_METRICS,
  A15A_MODE,
  A15A_OPTIONAL_PROFILE_A,
  A15A_POST_V1_BACKLOG,
  A15A_PRODUCTIVITY_CLAIM,
  A15A_SCENARIO,
  A15A_SURVEILLANCE_PROHIBITED,
  A15A_UX_FRICTION,
  A15A_VALUE_CLASSES,
  a15aPilotEligible,
  a15aReturnedUserUploadAllowed,
  remainingPilotBlockers,
  type A15AArtifactManifestRow,
} from "./a15a-demonstrator";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function timed<T>(fn: () => Promise<T> | T): Promise<{ value: T; ms: number }> {
  const t0 = Date.now();
  return Promise.resolve(fn()).then((value) => ({ value, ms: Date.now() - t0 }));
}

function emptyAttention(id: string, name: string, lifecycle: string): AttentionProjectSnapshot {
  return {
    projectId: id,
    projectName: name,
    lifecycleStage: lifecycle,
    workPlans: [],
    requirements: [],
    reviews: [],
    impacts: [],
    decisions: [],
    interfaces: [],
    events: [],
  };
}

describe("EOS-A15A end-to-end crusher engineering demonstrator", () => {
  it("keeps demonstration-only labels, synthetic classification, freeze, and A14B blockers unwaived", () => {
    expect(A15A_MODE).toBe("DEMONSTRATION_ONLY");
    expect(A15A_SCENARIO.environment).toBe("DEMONSTRATION / NON-PRODUCTION");
    expect(A15A_SCENARIO.notLivePilot).toBe(true);
    expect(A15A_SCENARIO.notCertifiedDesignAutomation).toBe(true);
    expect(A15A_SCENARIO.dataClassification).toBe("SYNTHETIC_DEMONSTRATION_DATA");
    expect(A15A_DATA_CLASSIFICATIONS).toContain("HUMAN_CONFIRMED_DEMONSTRATION_DECISION");
    expect(A15A_DATA_CLASSIFICATIONS).toContain("CONTROLLED_FIXTURE_NOT_USER_UPLOAD");
    expect(A15A_FEATURE_FREEZE_BOUNDARIES.newEngineeringDomain).toBe(false);
    expect(A15A_FEATURE_FREEZE_BOUNDARIES.newVendorConnector).toBe(false);
    expect(A15A_FEATURE_FREEZE_BOUNDARIES.newEventBus).toBe(false);
    expect(A15A_FEATURE_FREEZE_BOUNDARIES.realSolver).toBe(false);
    expect(A15A_FEATURE_FREEZE_BOUNDARIES.malwareBypass).toBe(false);
    expect(A15A_FEATURE_FREEZE_BOUNDARIES.mfaBypass).toBe(false);
    expect(A15A_OPTIONAL_PROFILE_A.realSolverExecution).toBe("NOT_APPLICABLE");
    expect(A15A_OPTIONAL_PROFILE_A.liveSharePoint).toBe("NOT_APPLICABLE");
    expect(A15A_CARRY_FORWARD_BLOCKERS.every((row) => row.waived === false)).toBe(true);
    expect(remainingPilotBlockers().some((row) => row.startsWith("HUMAN_AAL2_GATE"))).toBe(true);
    expect(remainingPilotBlockers().some((row) => row.startsWith("HOSTED_MALWARE_SCANNER"))).toBe(true);
    expect(remainingPilotBlockers().some((row) => row.startsWith("DEPENDENCY_POLICY_GATE"))).toBe(true);
    expect(a15aReturnedUserUploadAllowed({})).toBe(false);
    expect(returnedBinaryUploadsInPilot({})).toBe(false);
    expect(A15A_PRODUCTIVITY_CLAIM).toBe("NONE");
    expect(A15A_VALUE_CLASSES).toEqual(expect.arrayContaining(["PROVEN_IN_DEMONSTRATOR", "NOT_YET_PROVEN", "FUTURE_PILOT_METRIC"]));
    expect(A15A_FUTURE_PILOT_METRICS.length).toBeGreaterThan(3);
    expect(A15A_SURVEILLANCE_PROHIBITED.keystrokes).toBe(false);
    expect(SURVEILLANCE_PROHIBITIONS.productivityScoring).toBe(false);
    expect(A15A_AUTHORITY_REMINDER.humanRetainsJudgment).toBe(true);
    expect(A15A_DEMONSTRATION_SCRIPT[0]).toMatch(/My Engineering Day/);
    expect(A15A_UX_FRICTION.some((row) => row.id === "HUMAN_AAL2_GATE" && row.class === "BLOCKER")).toBe(true);
    expect(A15A_POST_V1_BACKLOG).toEqual(expect.arrayContaining(["hosted malware scanner deployment"]));
    const eligibility = a15aPilotEligible(false);
    expect(eligibility.a15bEligible).toBe(false);
    expect(eligibility.recommendedNextPhase).toBe("EOS Pilot Gate Closeout");
  });

  it("runs the Crusher Support demonstrator from Concept through Handover with object storage and human gates", async () => {
    const timings: Record<string, number> = {};
    const manifest: A15AArtifactManifestRow[] = [];
    const plans = createMemoryWorkPlanStore();
    const wired = new EngineeringWorkGeneratorService({ from() { return this; } } as never, plans);
    const policies = createMemoryTemplatePolicyStore();
    const artifacts = createMemoryArtifactStore();
    const routing = new RoutingArtifactBinaryStore(new LegacyRelationalArtifactBinaryStore(), new MemoryObjectArtifactBinaryStore());
    const artifactSvc = createTestArtifactService(artifacts, (id) => plans.getPlan(id), undefined, policies, routing);
    const review = createTestPreIssueService({ artifacts, loadPlan: (id) => plans.getPlan(id) });
    await policies.savePolicy(policyRecord({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      artifactType: "DESIGN_REPORT",
      templateCode: "RTB-FEED-DR",
      templateVersion: "1.0.0",
      name: "Company FEED Design Report",
      sourceClass: "COMPANY_OFFICIAL",
      packagedAssetKey: "EAT-REPORT-DESIGN",
      branding: { companyName: "RTB Engineering (synthetic demonstration)" },
    }));

    expect(workbenchActionsForLifecycle("CONCEPT").some((row) => /concept|option|governing/i.test(`${row.code} ${row.label}`))).toBe(true);
    expect(workbenchActionsForLifecycle("FEED").map((row) => row.code)).not.toEqual(workbenchActionsForLifecycle("CONSTRUCTION").map((row) => row.code));

    const conceptTimed = await timed(() => wired.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CONCEPT_STUDY",
      lifecycleStage: "CONCEPT",
      systemId: A11A_SYSTEM_ID,
      snapshot: conceptSnapshot(),
      readiness: WORKFLOW_READINESS.conceptUnknown,
      acknowledged: true,
    }));
    timings.findGoverningInformationMs = conceptTimed.ms;
    const concept = conceptTimed.value;
    expect(concept.templateCode).toBe("EWT-CONCEPT-STUDY");
    expect(concept.explanations.engineeringApproved).toBe(false);
    expect(concept.context.gaps.some((row) => /Geotechnical/i.test(row.title))).toBe(true);
    const conceptArt = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: concept.id, artifactType: "TECHNICAL_MEMORANDUM" });
    expect(conceptArt.ok).toBe(true);
    if (!conceptArt.ok) return;
    expect(conceptArt.artifact.storageKind).toBe("OBJECT_STORAGE");
    expect(conceptArt.artifact.contentBase64).toBe("");
    expect(conceptArt.resolution.sourceClass).toBe("EOS_DEFAULT");

    const optionWorkbench = createTestChangeWorkbenchService({ graph: loadChangeFixture() });
    const optionTimed = await timed(() => optionWorkbench.assess(commerce(), CRUSHER_FEED_TENANT, {
      sourceObjectType: "requirement",
      sourceObjectId: "req-load",
      projectId: A11E_PROJECT_A,
      workflow: "OPTION_STUDY",
      optionStudy: { title: "Steel vs concrete vs modular crusher support (SYNTHETIC DEMONSTRATION DATA)", options: steelConcreteOptions() },
    }));
    const study = optionTimed.value.assessment.snapshot.optionStudy!;
    expect(study.pareto.length).toBe(3);
    expect(study.automaticWinner).toBe(false);
    expect(study.humanDecisionRequired).toBe(true);
    const decided = await optionWorkbench.recordHumanDecision(commerce(), CRUSHER_FEED_TENANT, optionTimed.value.assessment.id, "opt-a", "dec-human-demo-1");
    expect(decided.snapshot.optionStudy?.humanDecisionRecorded).toBe(true);
    expect(decided.snapshot.optionStudy?.automaticWinner).toBe(false);
    expect(decided.snapshot.optionStudy?.selectedOptionId).toBe("opt-a");

    const pfs = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: concept.id,
      snapshot: optionStudySnapshot(),
      readiness: WORKFLOW_READINESS.optionUnknown,
      acknowledged: true,
    });
    expect(pfs.historicalPreserved).toBe(true);
    expect(pfs.next.lifecycleStage).toBe("PREFEASIBILITY");
    expect(pfs.next.context.requirements.some((row) => row.objectId === "req-client-12mtpa")).toBe(true);
    const inherited = inheritWorkPlanContext({
      from: concept.context,
      fromStage: "CONCEPT",
      toStage: "PREFEASIBILITY",
      fromPlanId: concept.id,
      systemId: A11A_SYSTEM_ID,
    });
    expect(inherited.assumptions.some((row) => row.disposition === "VALIDATE")).toBe(true);
    const optionArt = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: pfs.next.id, artifactType: "OPTION_STUDY_PRESENTATION" });
    expect(optionArt.ok).toBe(true);
    if (!optionArt.ok) return;
    expect(optionArt.artifact.storageKind).toBe("OBJECT_STORAGE");

    const feas = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: pfs.next.id,
      snapshot: feasibilitySnapshot(),
      readiness: WORKFLOW_READINESS.feasibilityConditions,
      acknowledged: true,
    });
    expect(feas.next.lifecycleStage).toBe("FEASIBILITY");
    expect(feas.next.context.interfaces.some((row) => row.objectId === "if-cr-cv-01")).toBe(true);

    const infoSvc = new EngineeringInformationRequirementService({ from() { return this; } } as never, createMemoryInformationRequirementStore());
    const created = await infoSvc.instantiateWorkRequirements(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      lifecycleStage: "FEED",
      systemId: A11A_SYSTEM_ID,
      deliverableId: "str-anl-feed",
    });
    const byTitle = Object.fromEntries(created.map((row) => [row.title, row]));
    const accept = async (requirementId: string, informationRefId: string) => {
      await infoSvc.applyAction(commerce(), CRUSHER_FEED_TENANT, { requirementId, action: "receiveInformation", informationRefId, managedRepositoryId: A10C_MANAGED_REPO_ID });
      return infoSvc.applyAction(commerce(), CRUSHER_FEED_TENANT, { requirementId, action: "acceptForPurpose", informationRefId, managedRepositoryId: A10C_MANAGED_REPO_ID });
    };
    await accept(byTitle["Structural design criteria"]!.id, A10A_SOURCE_B_ID);
    await accept(byTitle["Mechanical equipment reactions"]!.id, A10A_MECH_LOAD_ID);
    await accept(byTitle["Survey level"]!.id, A10C_SURVEY_REF_ID);
    const blocked = await infoSvc.resolveWorkReadiness(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      refs: foundationInformationRefs(),
      policies: a10cAuthorityPolicies(),
    });
    expect(blocked.state).toBe("BLOCKED_INFORMATION_MISSING");
    await accept(byTitle["Geotechnical bearing capacity"]!.id, A10C_GEO_REF_ID);
    const ready = await infoSvc.resolveWorkReadiness(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      refs: foundationInformationRefs(),
      policies: a10cAuthorityPolicies(),
    });
    expect(ready.state).toBe("READY");
    expect(ready.engineeringApproved).toBe(false);

    const feedTimed = await timed(() => wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: feas.next.id,
      snapshot: feedStructuralSnapshot(),
      readiness: WORKFLOW_READINESS.feedBlocked,
    }));
    timings.createWorkPlanMs = feedTimed.ms;
    const feed = feedTimed.value;
    expect(feed.next.lifecycleStage).toBe("FEED");
    expect(feed.next.workType).toBe("DESIGN_CALCULATION");
    expect(feed.next.context.gaps.some((row) => /Geotechnical/i.test(row.title) || /Geotechnical/i.test(row.explanation))).toBe(true);
    const feedReady = await wired.refreshPlan(
      commerce(),
      CRUSHER_FEED_TENANT,
      feed.next.id,
      detailedDesignReadySnapshot(),
      WORKFLOW_READINESS.detailedReady,
    );
    expect(feedReady.historicalProvenancePreserved).toBe(true);
    expect(feedReady.next.readiness).toBe("READY");

    const genXlsx = await timed(() => artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: feedReady.next.id, artifactType: "CALCULATION_WORKBOOK" }));
    const genDocx = await timed(() => artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: feedReady.next.id, artifactType: "DESIGN_REPORT" }));
    timings.generateXlsxMs = genXlsx.ms;
    timings.generateDocxMs = genDocx.ms;
    expect(genXlsx.value.ok && genDocx.value.ok).toBe(true);
    if (!genXlsx.value.ok || !genDocx.value.ok) return;
    const xlsxArtifact = genXlsx.value.artifact;
    const docxArtifact = genDocx.value.artifact;
    expect(xlsxArtifact.storageKind).toBe("OBJECT_STORAGE");
    expect(docxArtifact.storageKind).toBe("OBJECT_STORAGE");
    expect(genDocx.value.resolution.sourceClass).toBe("COMPANY_OFFICIAL");
    expect(genXlsx.value.resolution.sourceClass).toBe("EOS_DEFAULT");
    expect(xlsxArtifact.provenance.templateSourceClass === "EOS_DEFAULT" || genXlsx.value.resolution.sourceClass === "EOS_DEFAULT").toBe(true);
    const downloadTimed = await timed(() => artifactSvc.openBinary(commerce("analysis.read"), CRUSHER_FEED_TENANT, docxArtifact.id));
    timings.authorizedDownloadMs = downloadTimed.ms;
    expect(downloadTimed.value?.bytes.byteLength).toBeGreaterThan(32);
    expect(hashBytes(downloadTimed.value!.bytes)).toBe(docxArtifact.contentSha256 ?? docxArtifact.sha256);
    expect(() => assertObjectKeyAuthorization(pointerFromArtifact(docxArtifact), {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: A11E_PROJECT_B,
    })).toThrow(/OBJECT_KEY_SCOPE_DENIED|scope/i);

    const specPlan = await wired.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "SPECIFICATION",
      lifecycleStage: "FEED",
      systemId: A11A_SYSTEM_ID,
      relatedObjectType: "engineering_work_plan",
      relatedObjectId: feedReady.next.id,
      snapshot: snapshotFromPlan(feedReady.next),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    const specArt = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: specPlan.id, artifactType: "SPECIFICATION" });
    expect(specArt.ok).toBe(true);
    if (!specArt.ok) return;
    expect(specArt.artifact.storageKind).toBe("OBJECT_STORAGE");

    const reviewTimed = await timed(() => review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: feedReady.next.id }));
    timings.preIssueReviewMs = reviewTimed.ms;
    expect(reviewTimed.value.review.engineeringApproved).toBe(false);
    expect(reviewTimed.value.review.deterministicReview).toBe("available");
    const firstReviewId = reviewTimed.value.review.id;
    const dispositionTarget = reviewTimed.value.findings.find((row) => row.id) ?? null;
    if (dispositionTarget) {
      const disposed = await review.dispose(commerce(), CRUSHER_FEED_TENANT, {
        findingId: dispositionTarget.id,
        action: "accept",
        reason: "HUMAN demonstration disposition — not engineering design acceptance.",
        workPlanId: feedReady.next.id,
      });
      expect(disposed.automaticApproval).toBe(false);
    }
    const rerun = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: feedReady.next.id });
    expect(rerun.review.id).not.toBe(firstReviewId);
    expect(rerun.review.engineeringApproved).toBe(false);
    const history = await review.latest(commerce("analysis.read"), CRUSHER_FEED_TENANT, feedReady.next.id);
    expect(history.history.map((row) => row.id)).toEqual(expect.arrayContaining([firstReviewId, rerun.review.id]));

    const vendorRev = detailedDesignReadySnapshot();
    const loadRow = vendorRev.information.find((row) => /Mechanical equipment reactions/i.test(row.title));
    if (loadRow) loadRow.revision = "D";
    const staleEval = wired.evaluateStaleness(feedReady.next, vendorRev);
    expect(staleEval.state).toBe("STALE");
    const refreshed = await wired.refreshPlan(commerce(), CRUSHER_FEED_TENANT, feedReady.next.id, vendorRev, WORKFLOW_READINESS.detailedReady);
    expect(refreshed.historicalProvenancePreserved).toBe(true);
    expect(refreshed.next.inputFingerprint).not.toBe(feedReady.next.inputFingerprint);

    const impact = createTestChangeWorkbenchService({ graph: loadChangeFixture() });
    const impactTimed = await timed(() => impact.assess(commerce(), CRUSHER_FEED_TENANT, {
      sourceObjectType: "change",
      sourceObjectId: "chg-mech-load",
      projectId: A11E_PROJECT_A,
      workflow: "DETAILED_DESIGN_CHANGE",
    }));
    timings.impactAssessmentMs = impactTimed.ms;
    expect(impactTimed.value.assessment.snapshot.candidates.length).toBeGreaterThan(0);
    expect(JSON.stringify(impactTimed.value.assessment)).toMatch(/1380|1250|POTENTIAL|potential/i);
    await impact.dispose(commerce(), CRUSHER_FEED_TENANT, {
      assessmentId: impactTimed.value.assessment.id,
      candidateIds: ["analysis_result:an-024"],
      disposition: "CONFIRMED_IMPACT",
      rationale: "HUMAN_CONFIRMED_DEMONSTRATION_DECISION — vendor reaction change may affect analysis context.",
    });
    const notImpacted = await impact.dispose(commerce(), CRUSHER_FEED_TENANT, {
      assessmentId: impactTimed.value.assessment.id,
      candidateIds: ["drawing:s-notes"],
      disposition: "NOT_IMPACTED",
      rationale: "General notes drawing is related but not load-bearing (demonstration).",
    });
    expect(notImpacted.snapshot.candidates.find((row) => row.objectId === "s-notes")?.disposition).toBe("NOT_IMPACTED");
    expect(notImpacted.snapshot.candidates.find((row) => row.objectId === "an-024")?.disposition).toBe("CONFIRMED_IMPACT");

    const dd = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: refreshed.next.id,
      snapshot: detailedDesignReadySnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    });
    expect(dd.next.lifecycleStage).toBe("DETAILED_DESIGN");
    expect(dd.next.context.decisions.length).toBeGreaterThan(0);
    expect(SPACE_GASS_CATALOG_ENTRY.capabilities.some((row) => row.certification === "NOT_CERTIFIED")).toBe(true);
    expect(officeToolReadiness().length).toBeGreaterThan(0);
    expect(A15A_OPTIONAL_PROFILE_A.realSolverExecution).toBe("NOT_APPLICABLE");

    const construction = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: dd.next.id,
      snapshot: constructionSnapshot(),
      readiness: WORKFLOW_READINESS.constructionReady,
    });
    expect(construction.next.lifecycleStage).toBe("CONSTRUCTION");
    expect(construction.next.workType).toBe("RFI_TQ_RESPONSE");
    const assembled = assembleConstructionContext({
      graph: fieldChangeFixture(),
      query: { id: "rfi-anchor-75", type: "FIELD_CHANGE", summary: "Anchor bolt conflicts with reinforcement", projectId: A11E_PROJECT_A, location: "Crusher foundation" },
    });
    expect(assembled.assembled.some((row) => /drawing|specification|query/i.test(row.role))).toBe(true);
    const field = createTestChangeWorkbenchService({ graph: fieldChangeFixture() });
    const fieldResult = await field.assess(commerce(), CRUSHER_FEED_TENANT, {
      sourceObjectType: "technical_query",
      sourceObjectId: "rfi-anchor-75",
      projectId: A11E_PROJECT_A,
      workflow: "FIELD_CHANGE",
      constructionQuery: {
        id: "rfi-anchor-75",
        type: "FIELD_CHANGE",
        summary: "Move anchor bolts 75 mm. Clash with reinforcement. SYNTHETIC DEMONSTRATION DATA — not technical acceptance.",
        location: "Crusher foundation",
      },
    });
    expect(fieldResult.assessment.snapshot.construction?.technicalSolutionChosen).toBe(false);
    expect(field.artifactContracts().rfiResponse.label).toBe("DRAFT FOR ENGINEER REVIEW");
    const rfiTimed = await timed(() => artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: construction.next.id, artifactType: "RFI_RESPONSE" }));
    timings.rfiResponseMs = rfiTimed.ms;
    expect(rfiTimed.value.ok).toBe(true);
    if (!rfiTimed.value.ok) return;
    expect(rfiTimed.value.artifact.storageKind).toBe("OBJECT_STORAGE");
    expect(rfiTimed.value.resolution.sourceClass).toMatch(/EOS_DEFAULT|COMPANY_OFFICIAL|PROJECT_CLIENT_APPROVED/);
    const rfiReview = await review.run(commerce(), CRUSHER_FEED_TENANT, { workPlanId: construction.next.id });
    expect(rfiReview.review.engineeringApproved).toBe(false);
    expect(JSON.stringify(rfiReview.review)).not.toMatch(/correspondence issued|RFI answered/i);

    const commissioning = await wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: construction.next.id,
      snapshot: commissioningSnapshot(),
      readiness: WORKFLOW_READINESS.commissioningConditions,
      acknowledged: true,
    });
    expect(commissioning.next.lifecycleStage).toBe("COMMISSIONING");
    expect(commissioning.next.context.gaps.some((row) => /punchlist|condition/i.test(row.title + row.explanation))).toBe(true);

    const handoverTimed = await timed(() => wired.continueIntoNextLifecycle(commerce(), CRUSHER_FEED_TENANT, {
      fromPlanId: commissioning.next.id,
      workType: "HANDOVER_PREPARATION",
      toStage: "COMMISSIONING",
      snapshot: handoverSnapshot(),
      readiness: WORKFLOW_READINESS.detailedReady,
    }));
    timings.handoverSummaryMs = handoverTimed.ms;
    expect(handoverTimed.value.next.workType).toBe("HANDOVER_PREPARATION");
    const hoArt = await artifactSvc.generate(commerce(), CRUSHER_FEED_TENANT, { workPlanId: handoverTimed.value.next.id, artifactType: "TECHNICAL_MEMORANDUM" });
    expect(hoArt.ok).toBe(true);
    if (!hoArt.ok) return;
    expect(hoArt.artifact.storageKind).toBe("OBJECT_STORAGE");
    expect(hoArt.resolution.sourceClass).toBe("EOS_DEFAULT");

    const late = evaluateHandoverCompleteness({
      pkg: {
        id: A11A_HANDOVER_ID,
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        displayName: "Crusher handover (synthetic)",
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
      projectId: A11E_PROJECT_A,
      workflow: "HANDOVER",
    });
    expect(hoAssessed.assessment.snapshot.candidates.some((row) => row.objectId === "ho-pkg")).toBe(true);
    expect(explainWhyAffected(handoverStaleFixture(), "change", "chg-late").some((row) => /affects|stale|handover/i.test(row))).toBe(true);

    const ops = composeOperationsReference({
      assetCode: "CR-101",
      designRequirement: dd.next.context.requirements[0] ?? ref("requirement", "req-foundation-capacity", "Foundation capacity", "SYNTHETIC_DEMONSTRATION_DATA"),
      designDecision: dd.next.context.decisions[0] ?? null,
      drawing: ref("drawing", "dwg-anchor-bolt", "Anchor bolt drawing", "Construction drawing."),
      commissioningEvidence: commissioning.next.context.information[0]
        ? ref("engineering_information", "test-1", commissioning.next.context.information[0].title, "Commissioning evidence.")
        : null,
      modificationHistory: [ref("change", "chg-mech-load", "Vendor load Rev D", "FEED change history.")],
    });
    expect(ops.assetCode).toBe("CR-101");
    expect(ops.assetManagementOs).toBe(false);

    const graph = workPlanThreadGraph(dd.next);
    expect(explainWhyRelated(graph, "engineering_work_plan", dd.next.id).length).toBeGreaterThan(0);
    expect(explainDecisionOrigin(loadChangeFixture(), "dec-foundation").length).toBeGreaterThan(0);
    expect(explainWhatChanged(loadChangeFixture(), "change", "chg-mech-load").length).toBeGreaterThan(0);
    const ask = answerLifecycleQuestion(LIFECYCLE_ASK_QUESTIONS[1], {
      plans: [concept, pfs.next, feas.next, feedReady.next, dd.next, construction.next, commissioning.next, handoverTimed.value.next],
      feedFingerprint: feedReady.next.inputFingerprint,
      currentFingerprint: dd.next.inputFingerprint,
    });
    expect(ask.length).toBeGreaterThan(10);

    for (const generated of [conceptArt, optionArt, genXlsx.value, genDocx.value, specArt, rfiTimed.value, hoArt]) {
      if (!generated.ok || !generated.artifact) continue;
      manifest.push({
        artifactType: generated.artifact.artifactType,
        filename: generated.artifact.fileName,
        templateSource: generated.resolution.sourceClass ?? "UNRESOLVED",
        templateVersion: generated.artifact.templateVersion ?? generated.resolution.template?.version ?? "unknown",
        workPlanId: generated.artifact.workPlanId,
        sha256: generated.artifact.contentSha256 ?? generated.artifact.sha256 ?? "",
        byteSize: generated.artifact.contentSizeBytes ?? generated.artifact.byteSize ?? 0,
        storageKind: generated.artifact.storageKind ?? "OBJECT_STORAGE",
        generationStatus: generated.artifact.status ?? "GENERATED",
        reviewStatus: "HUMAN_REQUIRED",
      });
    }
    expect(manifest.every((row) => row.storageKind === "OBJECT_STORAGE")).toBe(true);
    expect(manifest.some((row) => row.templateSource === "COMPANY_OFFICIAL")).toBe(true);
    expect(manifest.some((row) => row.templateSource === "EOS_DEFAULT")).toBe(true);
    expect(Number.isFinite(timings.createWorkPlanMs)).toBe(true);
    expect(Number.isFinite(timings.generateDocxMs)).toBe(true);
    expect(Number.isFinite(timings.preIssueReviewMs)).toBe(true);
    expect(Number.isFinite(timings.impactAssessmentMs)).toBe(true);
    expect(A15A_PRODUCTIVITY_CLAIM).toBe("NONE");
  }, 120_000);

  it("projects My Engineering Day attention states across two projects without contamination", () => {
    const crusher = emptyAttention(CRUSHER_EXPANSION_FEED_PROJECT_ID, "Crusher Expansion Demonstrator", "FEED");
    crusher.workPlans = [{
      id: "plan-foundation",
      workType: "DESIGN_CALCULATION",
      status: "BLOCKED",
      readiness: "BLOCKED_INFORMATION_MISSING",
      startAllowed: false,
      discipline: "STRUCTURAL",
      systemId: A11A_SYSTEM_ID,
      relatedObjectType: null,
      relatedObjectId: null,
    }];
    crusher.requirements = [{
      id: "req-mech-reactions",
      title: "Mechanical Equipment Reactions",
      status: "AWAITING_INFORMATION",
      blocking: true,
      providerDiscipline: "MECHANICAL",
      providerKind: "DISCIPLINE",
      providerRole: null,
      consumerDiscipline: "STRUCTURAL",
      neededBy: "2026-10-05T00:00:00.000Z",
      requiredForObjectId: "plan-foundation",
      workType: "FOUNDATION_CALCULATION",
    }];
    const waiting = resolveEngineeringAttention({
      viewer: {
        userId: "cert-er-a1",
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        authorizedProjectIds: [CRUSHER_EXPANSION_FEED_PROJECT_ID, A11E_PROJECT_B],
        role: null,
        discipline: "STRUCTURAL",
      },
      projects: [crusher],
      nowIso: "2026-10-01T12:00:00.000Z",
    });
    expect(waiting.sections.WAITING_ON_OTHERS).toHaveLength(1);

    const ready = emptyAttention(CRUSHER_EXPANSION_FEED_PROJECT_ID, "Crusher Expansion Demonstrator", "FEED");
    ready.workPlans = [{ ...crusher.workPlans[0]!, status: "READY", readiness: "READY", startAllowed: true }];
    ready.requirements = [{ ...crusher.requirements[0]!, status: "ACCEPTED_FOR_PURPOSE" }];
    ready.events = [{
      id: "ev-accepted",
      eventType: "INFORMATION_ACCEPTED",
      sourceObjectType: "engineering_information_requirement",
      sourceObjectId: "req-mech-reactions",
      materiality: "MATERIAL",
      occurredAt: "2026-10-01T10:00:00.000Z",
    }];
    ready.reviews = [{ id: "rev-feed", workPlanId: "plan-foundation", resultState: "ATTENTION_REQUIRED", openConditionCount: 1, targetTitle: "FEED Design Report" }];
    ready.impacts = [{
      id: "imp-opt",
      status: "REVIEW_REQUIRED",
      workflow: "OPTION_STUDY",
      workPlanId: "plan-foundation",
      optionStudyNeedsDecision: true,
      constructionQuery: null,
      sourceObjectId: "opt-a",
    }];
    ready.decisions = [{ id: "dec-human-demo-1", title: "Select Option A", approvalStatus: "pending" }];
    const after = resolveEngineeringAttention({
      viewer: {
        userId: "cert-er-a1",
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        authorizedProjectIds: [CRUSHER_EXPANSION_FEED_PROJECT_ID, A11E_PROJECT_B],
        role: null,
        discipline: "STRUCTURAL",
      },
      projects: [ready],
      nowIso: "2026-10-01T12:00:00.000Z",
    });
    expect(after.sections.WAITING_ON_OTHERS).toHaveLength(0);
    expect(after.sections.RECENTLY_READY.length + after.sections.DO_NOW.length).toBeGreaterThan(0);
    expect(after.sections.REVIEW_REQUIRED.length).toBeGreaterThan(0);

    const other = emptyAttention(A11E_PROJECT_B, "Certification Project B", "CONSTRUCTION");
    other.workPlans = [{
      id: "plan-b-rfi",
      workType: "RFI_TQ_RESPONSE",
      status: "READY",
      readiness: "READY",
      startAllowed: true,
      discipline: "STRUCTURAL",
      systemId: null,
      relatedObjectType: "technical_query",
      relatedObjectId: "rfi-anchor-75",
    }];
    const leaked = emptyAttention("proj-unauthorized", "Unauthorized", "FEED");
    leaked.workPlans = [{
      id: "plan-leak",
      workType: "DESIGN_CALCULATION",
      status: "READY",
      readiness: "READY",
      startAllowed: true,
      discipline: "STRUCTURAL",
      systemId: null,
      relatedObjectType: null,
      relatedObjectId: null,
    }];
    const multi = resolveEngineeringAttention({
      viewer: {
        userId: "cert-er-a1",
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        authorizedProjectIds: [CRUSHER_EXPANSION_FEED_PROJECT_ID, A11E_PROJECT_B],
        role: null,
        discipline: "STRUCTURAL",
      },
      projects: [ready, other, leaked],
      nowIso: "2026-10-01T12:00:00.000Z",
    });
    expect(multi.items.some((row) => row.projectId === CRUSHER_EXPANSION_FEED_PROJECT_ID)).toBe(true);
    expect(multi.items.some((row) => row.projectId === A11E_PROJECT_B)).toBe(true);
    expect(multi.items.some((row) => row.projectId === "proj-unauthorized")).toBe(false);
    expect(JSON.stringify(multi)).not.toContain("Unauthorized");
  });

  it("does not treat controlled internal artifacts as hosted returned-file uploads", () => {
    expect(a15aReturnedUserUploadAllowed({})).toBe(false);
    expect(A15A_DATA_CLASSIFICATIONS).toContain("CONTROLLED_FIXTURE_NOT_USER_UPLOAD");
    expect(A15A_SCENARIO.notLivePilot).toBe(true);
  });
});
