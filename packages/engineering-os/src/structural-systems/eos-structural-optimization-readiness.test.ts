import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  bindCandidateCheckReference,
  bindCandidateObjectiveValueReference,
  composeMultiObjectiveCandidateSet,
  createCandidateEvidence,
  createD1jR3Store,
  deriveCandidateFeasibility,
  registerCandidateEvaluationSubject,
  registerHumanDefinedCandidate,
  type D1jR3DesignState,
  type D1jR3Store,
} from "./candidate-composition";
import {
  D1J_R4_AI_CAN_BE_REVIEWER_OF_RECORD,
  D1J_R4_AI_CAN_GOVERN_FINAL_SELECTION,
  D1J_R4_AUTOMATIC_SELECTION_RUNTIME_COUNT,
  D1J_R4_BASELINE_EVIDENCE_CAN_SUBSTITUTE_FOR_SELECTED_CANDIDATE_EVIDENCE,
  D1J_R4_CALLER_CAN_ESTABLISH_D1G_CERTIFICATION,
  D1J_R4_CALLER_CAN_SET_READINESS_FLAGS_DIRECTLY,
  D1J_R4_CANDIDATE_GENERATION_RUNTIME_COUNT,
  D1J_R4_CERTIFICATION_ELIGIBLE_EQUALS_CERTIFIED_DESIGN,
  D1J_R4_CERTIFICATION_TERM_EQUALS_DESIGN_CERTIFICATION,
  D1J_R4_CERTIFICATION_TERM_EQUALS_PROFESSIONAL_CERTIFICATION,
  D1J_R4_CERTIFICATION_TERM_EQUALS_REGULATORY_APPROVAL,
  D1J_R4_CERTIFICATION_TERM_EQUALS_SOLVER_CERTIFICATION,
  D1J_R4_D1G_CERTIFIED_SOLVER_STATUS,
  D1J_R4_D1G_OFFLINE_CONFORMANCE_EQUALS_CERTIFIED_SOLVER,
  D1J_R4_DESIGN_CERTIFICATION_API_COUNT,
  D1J_R4_ENGINEERING_CHECK_EXECUTION_API_COUNT,
  D1J_R4_ENGINEERING_CHECK_EXECUTION_COUNT,
  D1J_R4_HUMAN_SELECTION_EQUALS_CERTIFICATION,
  D1J_R4_HUMAN_SELECTION_EQUALS_DESIGN_APPROVAL,
  D1J_R4_OPTIMIZATION_EXECUTION_API_COUNT,
  D1J_R4_OPTIMIZATION_SEARCH_RUNTIME_COUNT,
  D1J_R4_PROCESS_EVIDENCE_EQUALS_PROFESSIONAL_CERTIFICATE,
  D1J_R4_READINESS_LAYER_NAMES,
  D1J_R4_RUNTIME_API,
  D1J_R4_SOLVER_EXECUTION_API_COUNT,
  D1J_R4_SOLVER_EXECUTION_COUNT,
  D1J_R4_SPACE_GASS_LIVE_EXECUTION_COUNT,
  D1J_R5_CANONICAL_PHASE,
  assessCertificationReadiness,
  composeSelectedCandidateEvidence,
  createD1jR4Store,
  createOptimizationStudyManifest,
  evaluateStudyEvidenceCompleteness,
  produceCertificationEvidenceReadinessResult,
  propagateCertificationEvidenceStaleness,
  recordCandidateSelection,
  registerCandidateReview,
  replayCertificationEvidence,
  supersedeCandidateReview,
  supersedeCandidateSelection,
  type D1jR4Store,
} from "./certification-readiness-gate";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  bindEvaluationDefinitionToProblem,
  createD1jR2Store,
  createEvaluationEvidenceSet,
  createObjectiveSet,
  createRequiredCheckSet,
  registerBaselineEvaluationSubject,
  registerConstraintDefinition,
  registerObjectiveDefinition,
  type D1jR2Actor,
  type D1jR2Catalog,
  type D1jR2OwnedCheck,
  type D1jR2Store,
} from "./objective-constraint-foundation";
import {
  createD1jR1Store,
  createOptimizationProblemFoundation,
  createVariableSet,
  registerDesignVariableDefinition,
  type D1jR1Catalog,
  type D1jR1Store,
} from "./optimization-problem-foundation";

const here = dirname(fileURLToPath(import.meta.url));

function clock(): () => string {
  let tick = 0;
  return () => `2026-04-02T00:00:${String(tick++).padStart(2, "0")}.000Z`;
}

function actor(overrides: Partial<D1jR2Actor> = {}): D1jR2Actor {
  return { actorId: "engineer-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authority: "HUMAN_ENGINEER", ...overrides };
}

function r1Catalog(): D1jR1Catalog {
  const identity = (kind: "STRUCTURAL_SYSTEM" | "MEMBER", id: string, systemId = "sys-1") => ({
    kind, id, structuralSystemId: kind === "STRUCTURAL_SYSTEM" ? id : systemId,
    tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", version: "v1", lifecycle: "CURRENT" as const,
    authority: "D1F_OWNER", validationState: "RECORDED", contentFingerprint: `${kind}-${id}-fp`, status: "CURRENT" as const,
  });
  return {
    identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("MEMBER", "mem-1"), identity("MEMBER", "mem-2")],
    bindings: [{ bindingId: "bind-1", jurisdictionBindingRef: "jurisdiction-au", standardBindingRefs: ["standard-1"], fingerprint: "bind-fp-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT" as const }],
    domainSources: [{
      domainSourceId: "length-rule", sourceClass: "GOVERNED_ENGINEERING_RULE", authority: "RULE_AUTHORITY", fingerprint: "length-rule-fp", version: "1",
      tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT" as const, catalogueEntries: null, enumerationIds: null, booleanMeanings: null,
      quantity: "length", unit: "m", engineeringMinimum: 1, engineeringMaximum: 10, integerMinimum: null, integerMaximum: null,
    }],
  };
}

function check(id: string, verdict: D1jR2OwnedCheck["authoritativeVerdict"], designStateFingerprint: string | null): D1jR2OwnedCheck {
  return {
    checkResultId: id, sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "TENSION", version: "v1", fingerprint: `${id}-fp`, targetId: "mem-1",
    jurisdictionBindingRef: "jurisdiction-au", standardBindingRefs: ["standard-1"], authoritativeVerdict: verdict, numericMetric: null, authority: "D1D_OWNER",
    validationState: "RECORDED", analysisResultId: null, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT", evidenceClass: "OWNED",
    designStateFingerprint,
  };
}

function quantity(id: string, value: number, designStateFingerprint: string | null) {
  return {
    sourceId: id, sourceDomain: "GOVERNED_QUANTITY" as const, version: "v1", fingerprint: `${id}-fp`, quantity: "length", unit: "m", value,
    authority: "QUANTITY_OWNER", validationState: "VERIFIED", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", targetId: "mem-1",
    status: "CURRENT" as const, evidenceClass: "OWNED" as const, designStateFingerprint,
  };
}

function catalog(): D1jR2Catalog {
  return {
    objectiveSources: [quantity("qty-base", 4, null), quantity("qty-a", 4, "ds-a-fp"), quantity("qty-b", 6, "ds-b-fp"), quantity("qty-fail", 9, "ds-fail-fp")],
    checkResults: [check("check-base", "CHECK_SATISFIED", null), check("check-a", "CHECK_SATISFIED", "ds-a-fp"), check("check-b", "CHECK_SATISFIED", "ds-b-fp"), check("check-fail", "CHECK_NOT_SATISFIED", "ds-fail-fp")],
    analyses: [],
    applicabilityRulings: [],
    evaluationProfiles: [{ profileId: "profile-none", solverAssurance: "NONE", fingerprint: "profile-none-fp" }],
    solverReadinessChanged: false,
  };
}

function design(id: string, overrides: Partial<D1jR3DesignState> = {}): D1jR3DesignState {
  return {
    designStateId: id, version: "v1", fingerprint: `${id}-fp`, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1",
    structuralSystemId: "sys-1", authority: "DESIGN_AUTHORITY", validationState: "RECORDED", sourceKind: "GOVERNED_DESIGN_STATE_REFERENCE", status: "CURRENT", ...overrides,
  };
}

function bindProblem(r1: D1jR1Store, r2: D1jR2Store) {
  createOptimizationProblemFoundation(r1, actor(), {
    optimizationProblemId: "problem-1", baselineRefId: "problem-1-baseline", sourceDomain: "D1F_STRUCTURAL_SYSTEM", sourceObjectId: "sys-1", bindingId: "bind-1",
    scope: { scopeKind: "STRUCTURAL_SYSTEM", structuralSystemId: "sys-1", designDiscipline: "STRUCTURAL", projectStage: "DETAILED_DESIGN", purpose: "study", limitations: "r1" },
    limitations: "foundation", version: "1", governanceProfileRef: "profile-1",
  });
  registerDesignVariableDefinition(r1, actor(), { variableId: "problem-1-var", optimizationProblemId: "problem-1", semanticKey: "GOVERNED_BOUNDED_QUANTITY", targetKind: "MEMBER", targetId: "mem-1", parameterKind: "GOVERNED_BOUNDED_QUANTITY", quantity: "length", unit: "m", domainSourceId: "length-rule", applicability: "APPLICABLE", limitations: "shape", version: "1" });
  const head = createVariableSet(r1, actor(), { variableSetId: "problem-1-set", optimizationProblemId: "problem-1", variableIds: ["problem-1-var"], version: "1" }).problem;
  registerObjectiveDefinition(r2, actor(), { objectiveId: "problem-1-obj", optimizationProblemId: head.optimizationProblemId, semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-base", unit: "m", version: "1" });
  registerConstraintDefinition(r2, actor(), { constraintId: "problem-1-con", optimizationProblemId: head.optimizationProblemId, sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "TENSION", targetId: "mem-1", applicability: "REQUIRED", version: "1" });
  createObjectiveSet(r2, actor(), { objectiveSetId: "problem-1-obj-set", optimizationProblemId: head.optimizationProblemId, objectiveIds: ["problem-1-obj"], version: "1" });
  createRequiredCheckSet(r2, actor(), { requiredCheckSetId: "problem-1-check-set", optimizationProblemId: head.optimizationProblemId, constraintIds: ["problem-1-con"], evaluationProfileId: "profile-none", version: "1" });
  return bindEvaluationDefinitionToProblem(r2, actor(), { successorProblemId: "problem-1-r2", predecessorProblemId: head.optimizationProblemId, objectiveSetId: "problem-1-obj-set", requiredCheckSetId: "problem-1-check-set", version: "1" });
}

function openStores() {
  const r1 = createD1jR1Store(r1Catalog(), clock());
  const r2 = createD1jR2Store(r1, catalog(), clock());
  bindProblem(r1, r2);
  const r3 = createD1jR3Store(r2, [design("ds-a"), design("ds-b"), design("ds-fail"), design("ds-open")], clock());
  const r4 = createD1jR4Store(r3, clock());
  return { r1, r2, r3, r4 };
}

function evaluate(r3: D1jR3Store, candidateId: string, designStateId: string, checkId: string | null, includeObjective = true) {
  const candidate = registerHumanDefinedCandidate(r3, actor(), { candidateId, optimizationProblemId: "problem-1-r2", designStateId, version: "1" });
  const subject = registerCandidateEvaluationSubject(r3, actor(), { subjectId: `${candidateId}-subject`, candidateId });
  const value = includeObjective ? bindCandidateObjectiveValueReference(r3, actor(), { objectiveValueReferenceId: `${candidateId}-value`, candidateId, subjectId: subject.subjectId, objectiveId: "problem-1-obj" }) : null;
  if (checkId) bindCandidateCheckReference(r3, actor(), { checkResultReferenceId: `${candidateId}-check`, candidateId, subjectId: subject.subjectId, constraintId: "problem-1-con", sourceCheckResultId: checkId });
  const evidence = createCandidateEvidence(r3, actor(), {
    evaluationEvidenceSetId: `${candidateId}-evidence`, candidateId, subjectId: subject.subjectId,
    objectiveValueReferenceIds: value ? [value.objectiveValueReferenceId] : [], checkResultReferenceIds: checkId ? [`${candidateId}-check`] : [], analysisReferenceIds: [], version: "1",
  });
  const evaluation = deriveCandidateFeasibility(r3, actor(), { candidateId, evidenceId: evidence.evaluationEvidenceSetId });
  return { candidate, evaluation };
}

function study(ids = ["cand-a", "cand-b"]) {
  const stores = openStores();
  evaluate(stores.r3, "cand-a", "ds-a", "check-a");
  evaluate(stores.r3, "cand-b", "ds-b", "check-b");
  const set = composeMultiObjectiveCandidateSet(stores.r3, actor(), { candidateSetId: "set-1", optimizationProblemId: "problem-1-r2", candidateIds: ids, version: "1" });
  return { ...stores, set };
}

function reviewOf(r4: D1jR4Store, reviewId: string, candidateId: string, outcome = "REVIEW_RECORDED_WITH_LIMITATIONS") {
  return registerCandidateReview(r4, actor(), { reviewId, candidateId, candidateSetId: "set-1", reviewScope: "CANDIDATE_RECORD", reviewBasis: "pinned evidence", reviewOutcome: outcome, limitations: "reference only", version: "1" });
}

function selectOf(r4: D1jR4Store, selectionId: string, candidateId: string, rationale = "project access") {
  return recordCandidateSelection(r4, actor(), { selectionId, candidateSetId: "set-1", selectedCandidateId: candidateId, selectionPurpose: "PREFERRED_FOR_FURTHER_DEVELOPMENT", tradeOffRationale: rationale, version: "1" });
}

function manifestOf(r4: D1jR4Store, reviewIds: string[], selectionId: string | null, selectedEvidenceId: string | null, manifestId = "manifest-1") {
  return createOptimizationStudyManifest(r4, actor(), { manifestId, studyEvidenceId: `${manifestId}-evidence`, optimizationProblemId: "problem-1-r2", candidateSetId: "set-1", reviewIds, selectionId, selectedEvidenceId, version: "1" });
}

describe("EOS-D1J-R4 certification evidence readiness gate", () => {
  it("records a human review without changing feasibility or accepting an AI reviewer", () => {
    const { r3, r4, set } = study();
    const before = r3.evaluations.find((row) => row.candidateId === "cand-a")?.feasibilityState;
    const review = reviewOf(r4, "review-1", "cand-a");
    expect(review.reviewerIdentity).toBe("engineer-1");
    expect(review.softwareValidation).toBe(false);
    expect(review.feasibilityState).toBe(before);
    expect(set.dominatedCandidateIds).toContain("cand-b");
    expect(D1J_R4_AI_CAN_BE_REVIEWER_OF_RECORD).toBe(false);
    expect(() => registerCandidateReview(r4, actor({ authority: "AI" }), { reviewId: "ai", candidateId: "cand-a", candidateSetId: "set-1", reviewScope: "CANDIDATE_RECORD", reviewBasis: "note", reviewOutcome: "REVIEW_RECORDED", limitations: "none", version: "1" })).toThrow("UNAUTHORIZED");
    expect(() => registerCandidateReview(r4, actor(), { reviewId: "spoof", candidateId: "cand-a", candidateSetId: "set-1", reviewScope: "CANDIDATE_RECORD", reviewBasis: "note", reviewOutcome: "REVIEW_RECORDED", limitations: "none", version: "1", claimedReviewerId: "other-user" })).toThrow("REVIEWER_IDENTITY_SPOOF");
    expect(r3.evaluations.find((row) => row.candidateId === "cand-a")?.feasibilityState).toBe(before);
  });

  it("records a human selection inside the candidate set and rejects AI, optimizer, and outsiders", () => {
    const { r3, r4, set } = study();
    expect(r4.selections).toHaveLength(0);
    expect(set.selectedWinner).toBeNull();
    const selection = selectOf(r4, "selection-1", "cand-a");
    expect(selection.selectionActor).toBe("engineer-1");
    expect(selection.designApproval).toBe(false);
    expect(selection.certification).toBe(false);
    expect(r3.candidates.find((row) => row.candidateId === "cand-a")?.selected).toBe(false);
    expect(D1J_R4_HUMAN_SELECTION_EQUALS_DESIGN_APPROVAL).toBe(false);
    expect(D1J_R4_HUMAN_SELECTION_EQUALS_CERTIFICATION).toBe(false);
    expect(D1J_R4_AI_CAN_GOVERN_FINAL_SELECTION).toBe(false);
    expect(D1J_R4_AUTOMATIC_SELECTION_RUNTIME_COUNT).toBe(0);
    expect(() => recordCandidateSelection(r4, actor(), { selectionId: "out", candidateSetId: "set-1", selectedCandidateId: "cand-missing", selectionPurpose: "SELECTED_OPTIMIZATION_ALTERNATIVE", version: "1" })).toThrow("CANDIDATE_NOT_FOUND");
    registerHumanDefinedCandidate(r3, actor(), { candidateId: "cand-open", optimizationProblemId: "problem-1-r2", designStateId: "ds-open", version: "1" });
    expect(() => recordCandidateSelection(r4, actor(), { selectionId: "outside", candidateSetId: "set-1", selectedCandidateId: "cand-open", selectionPurpose: "SELECTED_OPTIMIZATION_ALTERNATIVE", version: "1" })).toThrow("CANDIDATE_NOT_IN_SET");
    expect(() => recordCandidateSelection(r4, actor({ authority: "AI" }), { selectionId: "ai", candidateSetId: "set-1", selectedCandidateId: "cand-a", selectionPurpose: "SELECTED_OPTIMIZATION_ALTERNATIVE", version: "1" })).toThrow("UNAUTHORIZED");
    expect(() => recordCandidateSelection(r4, actor({ authority: "OPTIMIZER" }), { selectionId: "opt", candidateSetId: "set-1", selectedCandidateId: "cand-a", selectionPurpose: "SELECTED_OPTIMIZATION_ALTERNATIVE", version: "1" })).toThrow("UNAUTHORIZED");
    expect(() => recordCandidateSelection(r4, actor(), { selectionId: "bad-fp", candidateSetId: "set-1", selectedCandidateId: "cand-a", selectionPurpose: "SELECTED_OPTIMIZATION_ALTERNATIVE", expectedCandidateFingerprint: "spoof", version: "1" })).toThrow("CANDIDATE_FINGERPRINT_MISMATCH");
  });

  it("keeps a dominated selection dominated and requires rationale", () => {
    const { r4, set } = study();
    expect(() => selectOf(r4, "selection-dominated", "cand-b", "")).toThrow("SELECTION_RATIONALE_REQUIRED");
    const selection = selectOf(r4, "selection-dominated", "cand-b", "constructability outweighs the recorded length");
    expect(selection.dominated).toBe(true);
    expect(set.dominatedCandidateIds).toContain("cand-b");
    expect(set.nonDominatedCandidateIds).not.toContain("cand-b");
    expect(selection.designApproval).toBe(false);
  });

  it("retains infeasible and undetermined selections without making them eligible", () => {
    const infeasible = openStores();
    evaluate(infeasible.r3, "cand-fail", "ds-fail", "check-fail");
    const failSet = composeMultiObjectiveCandidateSet(infeasible.r3, actor(), { candidateSetId: "set-1", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-fail"], version: "1" });
    reviewOf(infeasible.r4, "review-fail", "cand-fail");
    const failSelection = selectOf(infeasible.r4, "selection-fail", "cand-fail", "retained for audit");
    const failEvidence = composeSelectedCandidateEvidence(infeasible.r4, actor(), { selectedEvidenceId: "evidence-fail", selectionId: failSelection.selectionId, reviewId: "review-fail" });
    const failManifest = manifestOf(infeasible.r4, ["review-fail"], failSelection.selectionId, failEvidence.selectedEvidenceId);
    const failEligibility = assessCertificationReadiness(infeasible.r4, actor(), { eligibilityId: "elig-fail", manifestId: failManifest.manifest.manifestId, version: "1" });
    expect(failSet.infeasibleCandidateIds).toContain("cand-fail");
    expect(failEligibility.eligibilityState).toBe("NOT_ELIGIBLE");
    expect(failEligibility.blockingReasons).toContain("SELECTED_CANDIDATE_INFEASIBLE");
    const open = openStores();
    registerHumanDefinedCandidate(open.r3, actor(), { candidateId: "cand-open", optimizationProblemId: "problem-1-r2", designStateId: "ds-open", version: "1" });
    composeMultiObjectiveCandidateSet(open.r3, actor(), { candidateSetId: "set-1", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-open"], version: "1" });
    reviewOf(open.r4, "review-open", "cand-open");
    const openSelection = selectOf(open.r4, "selection-open", "cand-open", "unresolved evidence");
    const openManifest = manifestOf(open.r4, ["review-open"], openSelection.selectionId, null);
    const openEligibility = assessCertificationReadiness(open.r4, actor(), { eligibilityId: "elig-open", manifestId: openManifest.manifest.manifestId, version: "1" });
    expect(openSelection.feasibilityState).toBe("UNDETERMINED");
    expect(openEligibility.eligibilityState).toBe("NOT_ELIGIBLE");
    expect(openEligibility.blockingReasons).toContain("SELECTED_CANDIDATE_UNDETERMINED");
  });

  it("pins an immutable manifest and rejects a floating reference", () => {
    const { r4 } = study();
    reviewOf(r4, "review-a", "cand-a");
    reviewOf(r4, "review-b", "cand-b");
    const selection = selectOf(r4, "selection-1", "cand-a");
    const evidence = composeSelectedCandidateEvidence(r4, actor(), { selectedEvidenceId: "selected-1", selectionId: selection.selectionId, reviewId: "review-a" });
    const first = manifestOf(r4, ["review-a", "review-b"], selection.selectionId, evidence.selectedEvidenceId);
    const reversed = manifestOf(r4, ["review-b", "review-a"], selection.selectionId, evidence.selectedEvidenceId, "manifest-2");
    expect(reversed.manifest.manifestId).toBe(first.manifest.manifestId);
    expect(reversed.manifest.fingerprint).toBe(first.manifest.fingerprint);
    expect(first.manifest.parameterSemanticStatus).toBe("NOT_AVAILABLE");
    expect(first.manifest.referenceOnlyCandidates).toBe(true);
    expect(first.manifest.generatedDesign).toBe(false);
    expect(first.manifest.d1gStatus).toBe("NOT_CERTIFIED");
    expect(() => manifestOf(r4, ["review-a"], selection.selectionId, evidence.selectedEvidenceId, "latest")).toThrow("STUDY_MANIFEST_INCOMPLETE");
  });

  it("separates complete evidence from certification eligibility", () => {
    const { r4 } = study();
    const bare = manifestOf(r4, [], null, null, "manifest-bare");
    expect(evaluateStudyEvidenceCompleteness(r4, bare.manifest.manifestId)).toBe("INCOMPLETE");
    reviewOf(r4, "review-a", "cand-a");
    const selection = selectOf(r4, "selection-1", "cand-a");
    const evidence = composeSelectedCandidateEvidence(r4, actor(), { selectedEvidenceId: "selected-1", selectionId: selection.selectionId, reviewId: "review-a" });
    const pinned = manifestOf(r4, ["review-a"], selection.selectionId, evidence.selectedEvidenceId);
    expect(pinned.studyEvidence.completeness).toBe("COMPLETE_FOR_DECLARED_SCOPE");
    expect(pinned.studyEvidence.certificationEligibility).toBe("NOT_ELIGIBLE");
    expect(pinned.studyEvidence.designModel).toBe(false);
    expect(pinned.studyEvidence.engineeringApproval).toBe(false);
    const eligibility = assessCertificationReadiness(r4, actor(), {
      eligibilityId: "elig-1", manifestId: pinned.manifest.manifestId, version: "1",
      callerD1gStatus: "CERTIFIED", callerEngineerValidated: true, callerConformanceValidated: true, callerOfflineConformance: true, callerEligible: true,
    });
    expect(eligibility.eligibilityState).toBe("NOT_ELIGIBLE");
    expect(eligibility.d1gStatus).toBe("NOT_CERTIFIED");
    expect(eligibility.engineerValidationStatus).toBe("NOT_VALIDATED");
    expect(eligibility.conformanceValidationStatus).toBe("NOT_VALIDATED");
    expect(eligibility.certificate).toBe(false);
    expect(eligibility.blockingReasons).toEqual(["D1G_CERTIFIED_SOLVER_REQUIRED", "D1J_CONFORMANCE_VALIDATION_REQUIRED", "D1J_ENGINEER_VALIDATION_REQUIRED"]);
    expect(D1J_R4_D1G_CERTIFIED_SOLVER_STATUS).toBe("NOT_CERTIFIED");
    expect(D1J_R4_D1G_OFFLINE_CONFORMANCE_EQUALS_CERTIFIED_SOLVER).toBe(false);
    expect(D1J_R4_CALLER_CAN_ESTABLISH_D1G_CERTIFICATION).toBe(false);
    expect(D1J_R4_CALLER_CAN_SET_READINESS_FLAGS_DIRECTLY).toBe(false);
    const result = produceCertificationEvidenceReadinessResult(r4, eligibility.eligibilityId);
    expect(result.certificationEligibility).toBe("NOT_ELIGIBLE");
    expect(result.readinessLayers.ARCHITECTURE_READY).toBe(true);
    expect(result.readinessLayers.FIXTURE_TEST_READY).toBe(true);
    expect(result.readinessLayers.CERTIFICATION_ELIGIBLE).toBe(false);
    expect(result.certificate).toBe(false);
    expect(result.designApproval).toBe(false);
    expect(D1J_R4_READINESS_LAYER_NAMES).toHaveLength(7);
  });

  it("rejects missing objective evidence, missing check evidence, and baseline substitution", () => {
    const missingObjective = openStores();
    evaluate(missingObjective.r3, "cand-a", "ds-a", "check-a", false);
    composeMultiObjectiveCandidateSet(missingObjective.r3, actor(), { candidateSetId: "set-1", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a"], version: "1" });
    reviewOf(missingObjective.r4, "review-a", "cand-a");
    const objectiveSelection = selectOf(missingObjective.r4, "selection-1", "cand-a");
    const objectiveEvidence = composeSelectedCandidateEvidence(missingObjective.r4, actor(), { selectedEvidenceId: "selected-1", selectionId: objectiveSelection.selectionId, reviewId: "review-a" });
    const objectiveManifest = manifestOf(missingObjective.r4, ["review-a"], objectiveSelection.selectionId, objectiveEvidence.selectedEvidenceId);
    expect(objectiveEvidence.objectiveValueReferenceIds).toHaveLength(0);
    expect(evaluateStudyEvidenceCompleteness(missingObjective.r4, objectiveManifest.manifest.manifestId)).toBe("INCOMPLETE");
    const missingCheck = openStores();
    evaluate(missingCheck.r3, "cand-a", "ds-a", null);
    composeMultiObjectiveCandidateSet(missingCheck.r3, actor(), { candidateSetId: "set-1", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a"], version: "1" });
    reviewOf(missingCheck.r4, "review-a", "cand-a");
    const checkSelection = selectOf(missingCheck.r4, "selection-1", "cand-a");
    const checkEvidence = composeSelectedCandidateEvidence(missingCheck.r4, actor(), { selectedEvidenceId: "selected-1", selectionId: checkSelection.selectionId, reviewId: "review-a" });
    const checkManifest = manifestOf(missingCheck.r4, ["review-a"], checkSelection.selectionId, checkEvidence.selectedEvidenceId);
    expect(checkEvidence.checkResultReferenceIds).toHaveLength(0);
    expect(evaluateStudyEvidenceCompleteness(missingCheck.r4, checkManifest.manifest.manifestId)).toBe("INCOMPLETE");
    const { r2, r4 } = study();
    reviewOf(r4, "review-a", "cand-a");
    const selection = selectOf(r4, "selection-1", "cand-a");
    const baseline = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "baseline-subject", optimizationProblemId: "problem-1-r2" });
    const baselineEvidence = createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "baseline-evidence", optimizationProblemId: "problem-1-r2", subjectId: baseline.subjectId, objectiveValueReferenceIds: [], checkResultReferenceIds: [], analysisReferenceIds: [], version: "1" });
    expect(D1J_R4_BASELINE_EVIDENCE_CAN_SUBSTITUTE_FOR_SELECTED_CANDIDATE_EVIDENCE).toBe(false);
    expect(() => composeSelectedCandidateEvidence(r4, actor(), { selectedEvidenceId: "selected-base", selectionId: selection.selectionId, reviewId: "review-a", evidenceId: baselineEvidence.evaluationEvidenceSetId })).toThrow("BASELINE_EVIDENCE_SUBSTITUTION");
  });

  it("keeps review, selection, manifest, and eligibility history append-only", () => {
    const { r4 } = study();
    reviewOf(r4, "review-1", "cand-a");
    const review2 = supersedeCandidateReview(r4, actor(), { successorReviewId: "review-2", reviewId: "review-1", reviewOutcome: "NOT_ACCEPTED_FOR_STUDY", version: "2" });
    reviewOf(r4, "review-b", "cand-b");
    selectOf(r4, "selection-1", "cand-a", "first preference");
    const selection2 = supersedeCandidateSelection(r4, actor(), { successorSelectionId: "selection-2", selectionId: "selection-1", selectedCandidateId: "cand-b", tradeOffRationale: "later project constraint", version: "2" });
    const evidence = composeSelectedCandidateEvidence(r4, actor(), { selectedEvidenceId: "selected-2", selectionId: selection2.selectionId, reviewId: "review-b" });
    const first = manifestOf(r4, ["review-2", "review-b"], selection2.selectionId, evidence.selectedEvidenceId);
    const firstEligibility = assessCertificationReadiness(r4, actor(), { eligibilityId: "elig-1", manifestId: first.manifest.manifestId, version: "1" });
    r4.sources.engineerValidationFingerprint = "engineer-watch-2";
    propagateCertificationEvidenceStaleness(r4);
    const second = createOptimizationStudyManifest(r4, actor(), { manifestId: "manifest-2", studyEvidenceId: "study-2", optimizationProblemId: "problem-1-r2", candidateSetId: "set-1", reviewIds: ["review-2", "review-b"], selectionId: selection2.selectionId, selectedEvidenceId: evidence.selectedEvidenceId, version: "2" });
    const secondEligibility = assessCertificationReadiness(r4, actor(), { eligibilityId: "elig-2", manifestId: second.manifest.manifestId, version: "2" });
    expect(r4.reviews.find((row) => row.reviewId === "review-1")?.status).toBe("SUPERSEDED");
    expect(review2.candidateId).toBe("cand-a");
    expect(r4.reviews.find((row) => row.reviewId === "review-2")?.fingerprint).not.toBe(r4.reviews[0]?.fingerprint);
    expect(r4.selections.find((row) => row.selectionId === "selection-1")?.status).toBe("SUPERSEDED");
    expect(selection2.selectedCandidateId).toBe("cand-b");
    expect(first.manifest.status).toBe("STALE");
    expect(firstEligibility.status).toBe("STALE");
    expect(second.manifest.status).toBe("CURRENT");
    expect(secondEligibility.eligibilityState).toBe("NOT_ELIGIBLE");
    expect(r4.history.filter((row) => row.subjectId === "review-1").length).toBeGreaterThan(0);
    const replay = replayCertificationEvidence(r4, "manifest-2");
    expect(replay.selectedCandidateId).toBe("cand-b");
    expect(replay.selectorId).toBe("engineer-1");
    expect(replay.rationale).toBe("later project constraint");
    expect(replay.d1gStatus).toBe("NOT_CERTIFIED");
    expect(replay.eligibility).toEqual(["NOT_ELIGIBLE"]);
  });

  it("propagates staleness for upstream evidence and repeated submissions stay idempotent", () => {
    const cause = (mutate: (packed: ReturnType<typeof study>) => void) => {
      const packed = study();
      reviewOf(packed.r4, "review-a", "cand-a");
      const selection = selectOf(packed.r4, "selection-1", "cand-a");
      const evidence = composeSelectedCandidateEvidence(packed.r4, actor(), { selectedEvidenceId: "selected-1", selectionId: selection.selectionId, reviewId: "review-a" });
      const pinned = manifestOf(packed.r4, ["review-a"], selection.selectionId, evidence.selectedEvidenceId);
      mutate(packed);
      propagateCertificationEvidenceStaleness(packed.r4);
      expect(pinned.manifest.status).toBe("STALE");
      const eligibility = assessCertificationReadiness(packed.r4, actor(), { eligibilityId: "elig-stale", manifestId: pinned.manifest.manifestId, version: "1" });
      expect(eligibility.eligibilityState).toBe("NOT_ELIGIBLE");
      expect(eligibility.blockingReasons).toContain("STUDY_MANIFEST_STALE");
    };
    cause(({ r1 }) => { r1.catalog.identities[0]!.contentFingerprint = "changed"; });
    cause(({ r1 }) => { r1.variableSets[0]!.status = "STALE"; });
    cause(({ r2 }) => { r2.objectiveSets[0]!.status = "STALE"; });
    cause(({ r2 }) => { r2.checkSets[0]!.status = "STALE"; });
    cause(({ r3 }) => { r3.designStates[0]!.fingerprint = "changed"; });
    cause(({ r2 }) => { r2.valueRefs[0]!.status = "STALE"; });
    cause(({ r2 }) => { r2.feasibilityRefs[0]!.status = "STALE"; });
    cause(({ r3 }) => { r3.sets[0]!.status = "STALE"; });
    cause(({ r4 }) => { supersedeCandidateReview(r4, actor(), { successorReviewId: "review-b", reviewId: "review-a", reviewOutcome: "REVIEW_RECORDED", version: "2" }); });
    cause(({ r4 }) => { supersedeCandidateSelection(r4, actor(), { successorSelectionId: "selection-2", selectionId: "selection-1", selectedCandidateId: "cand-b", tradeOffRationale: "changed preference", version: "2" }); });
    cause(({ r2 }) => { r2.catalog.solverReadinessChanged = true; });
    cause(({ r4 }) => { r4.sources.engineerValidationFingerprint = "engineer-2"; });
    cause(({ r4 }) => { r4.sources.conformanceValidationFingerprint = "conformance-2"; });
    const packed = study();
    const review = reviewOf(packed.r4, "review-a", "cand-a");
    const before = packed.r4.history.length;
    expect(reviewOf(packed.r4, "review-again", "cand-a").reviewId).toBe(review.reviewId);
    const selection = selectOf(packed.r4, "selection-1", "cand-a");
    expect(selectOf(packed.r4, "selection-again", "cand-a").selectionId).toBe(selection.selectionId);
    expect(packed.r4.history.length).toBe(before + 1);
    expect(() => reviewOf(packed.r4, "cross", "cand-a")).not.toThrow();
    expect(() => registerCandidateReview(packed.r4, actor({ projectId: "project-2" }), { reviewId: "cross-project", candidateId: "cand-a", candidateSetId: "set-1", reviewScope: "STUDY_RECORD", reviewBasis: "other", reviewOutcome: "REVIEW_RECORDED", limitations: "none", version: "9" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordCandidateSelection(packed.r4, actor({ tenantId: "tenant-2" }), { selectionId: "cross-tenant", candidateSetId: "set-1", selectedCandidateId: "cand-a", selectionPurpose: "SELECTED_OPTIMIZATION_ALTERNATIVE", version: "9" })).toThrow("CROSS_TENANT_OPERATION");
  });

  it("does not expose certification, solver, optimizer, or check execution", () => {
    const source = readFileSync(join(here, "certification-readiness-gate.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1J_R4_CERTIFICATION_EVIDENCE_READINESS_GATE.md"), "utf8");
    expect(scanAnalysisFormulaBypass(join(here, "certification-readiness-gate.ts"), source)).toEqual([]);
    expect(scanAnalysisFormulaBypass(join(here, "../../../../docs/architecture/engineering-os/EOS_D1J_R4_CERTIFICATION_EVIDENCE_READINESS_GATE.md"), doc)).toEqual([]);
    expect(source.includes("eval(")).toBe(false);
    expect(source.includes("approveDesign")).toBe(false);
    expect(source.includes("certifyDesign")).toBe(false);
    expect(source.includes("child_process")).toBe(false);
    expect(D1J_R4_RUNTIME_API.includes("approveDesign")).toBe(false);
    expect(D1J_R4_DESIGN_CERTIFICATION_API_COUNT).toBe(0);
    expect(D1J_R4_OPTIMIZATION_EXECUTION_API_COUNT).toBe(0);
    expect(D1J_R4_SOLVER_EXECUTION_API_COUNT).toBe(0);
    expect(D1J_R4_ENGINEERING_CHECK_EXECUTION_API_COUNT).toBe(0);
    expect(D1J_R4_OPTIMIZATION_SEARCH_RUNTIME_COUNT).toBe(0);
    expect(D1J_R4_CANDIDATE_GENERATION_RUNTIME_COUNT).toBe(0);
    expect(D1J_R4_SOLVER_EXECUTION_COUNT).toBe(0);
    expect(D1J_R4_ENGINEERING_CHECK_EXECUTION_COUNT).toBe(0);
    expect(D1J_R4_SPACE_GASS_LIVE_EXECUTION_COUNT).toBe(0);
    expect(D1J_R4_CERTIFICATION_TERM_EQUALS_PROFESSIONAL_CERTIFICATION).toBe(false);
    expect(D1J_R4_CERTIFICATION_TERM_EQUALS_REGULATORY_APPROVAL).toBe(false);
    expect(D1J_R4_CERTIFICATION_TERM_EQUALS_DESIGN_CERTIFICATION).toBe(false);
    expect(D1J_R4_CERTIFICATION_TERM_EQUALS_SOLVER_CERTIFICATION).toBe(false);
    expect(D1J_R4_CERTIFICATION_ELIGIBLE_EQUALS_CERTIFIED_DESIGN).toBe(false);
    expect(D1J_R4_PROCESS_EVIDENCE_EQUALS_PROFESSIONAL_CERTIFICATE).toBe(false);
    expect(D1J_R5_CANONICAL_PHASE).toBe("EOS-D1J-R5-STRUCTURAL-OPTIMIZATION-CERTIFICATION-CLOSEOUT");
    expect(doc.includes("```")).toBe(false);
  });
});
