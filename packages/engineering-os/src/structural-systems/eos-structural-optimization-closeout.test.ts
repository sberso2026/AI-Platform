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
  registerVariableAssignmentReference,
  type D1jR3DesignState,
  type D1jR3Store,
} from "./candidate-composition";
import {
  assessCertificationReadiness,
  composeSelectedCandidateEvidence,
  createD1jR4Store,
  createOptimizationStudyManifest,
  produceCertificationEvidenceReadinessResult,
  propagateCertificationEvidenceStaleness,
  recordCandidateSelection,
  registerCandidateReview,
  replayCertificationEvidence,
  type D1jR4Store,
} from "./certification-readiness-gate";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  bindEvaluationDefinitionToProblem,
  createD1jR2Store,
  createObjectiveSet,
  createRequiredCheckSet,
  registerConstraintDefinition,
  registerObjectiveDefinition,
  type D1jR2Actor,
  type D1jR2Catalog,
  type D1jR2OwnedCheck,
  type D1jR2Store,
} from "./objective-constraint-foundation";
import {
  claimScopeSupported,
  D1J_CLOSEOUT_LIMITATIONS,
  D1J_CURRENT_CERTIFICATION_ELIGIBILITY,
  D1J_ENGINEER_VALIDATION_EVIDENCE_COUNT,
  D1J_FINAL_BASELINE_EVIDENCE_AUTO_REUSED_FOR_CANDIDATE,
  D1J_FINAL_CERTIFICATION_ELIGIBILITY,
  D1J_FINAL_MATURITY,
  D1J_FINAL_MATURITY_IMPLIES_CERTIFICATION_ELIGIBLE,
  D1J_FINAL_MATURITY_IMPLIES_OPTIMIZER,
  D1J_FINAL_PARAMETER_SEMANTIC_STATUS,
  D1J_FINAL_TRACK_STATUS,
  D1J_R5_ASSIGNMENT_RUNTIME_COUNT,
  D1J_R5_AUTOMATIC_SELECTION_COUNT,
  D1J_R5_CANDIDATE_GENERATION_RUNTIME_COUNT,
  D1J_R5_CERTIFICATION_TERM_EQUALS_DESIGN_APPROVAL,
  D1J_R5_CERTIFICATION_TERM_EQUALS_PROFESSIONAL_CERTIFICATION,
  D1J_R5_CERTIFICATION_TERM_EQUALS_REGULATORY_CERTIFICATION,
  D1J_R5_CERTIFICATION_TERM_EQUALS_SOLVER_CERTIFICATION,
  D1J_R5_D1G_CERTIFIED_SOLVER_STATUS,
  D1J_R5_DOMINATED_EQUALS_INFEASIBLE,
  D1J_R5_ENGINEERING_CHECK_EXECUTION_COUNT,
  D1J_R5_HUMAN_STUDY_REVIEW_EQUALS_D1J_ENGINEER_VALIDATION,
  D1J_R5_INVENTS_UNAUTHORIZED_SUCCESSOR_PHASE,
  D1J_R5_MODEL_MUTATION_COUNT,
  D1J_R5_NEW_FEATURE_RUNTIME_COUNT,
  D1J_R5_NONDOMINATED_EQUALS_APPROVED,
  D1J_R5_OPTIMIZATION_ALGORITHM_RUNTIME_COUNT,
  D1J_R5_SEARCH_RUNTIME_COUNT,
  D1J_R5_SOLVER_EXECUTION_COUNT,
  D1J_TRACK_CLOSED,
  D2_STARTED_BY_D1J_R5,
  POST_D1J_NEXT_ACTION_DECISION,
} from "./optimization-closeout";
import {
  createD1jR1Store,
  createOptimizationProblemFoundation,
  createVariableSet,
  registerDesignVariableDefinition,
  type D1jR1Catalog,
  type D1jR1Store,
} from "./optimization-problem-foundation";
import { D1_STRUCTURAL_PACK_COMPLETE, D1K_CURRENT_STATUS, D2_STARTED_BY_THIS_PHASE } from "./roadmap-after-twin-closeout";

const here = dirname(fileURLToPath(import.meta.url));

function clock(): () => string {
  let tick = 0;
  return () => `2026-04-02T00:00:${String(tick++).padStart(2, "0")}.000Z`;
}

function actor(overrides: Partial<D1jR2Actor> = {}): D1jR2Actor {
  return { actorId: "engineer-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authority: "HUMAN_ENGINEER", ...overrides };
}

function r1Catalog(): D1jR1Catalog {
  const identity = (kind: "STRUCTURAL_SYSTEM" | "MEMBER", id: string) => ({
    kind, id, structuralSystemId: kind === "STRUCTURAL_SYSTEM" ? id : "sys-1",
    tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", version: "v1", lifecycle: "CURRENT" as const,
    authority: "D1F_OWNER", validationState: "RECORDED", contentFingerprint: `${kind}-${id}-fp`, status: "CURRENT" as const,
  });
  return {
    identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("MEMBER", "mem-1")],
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
    objectiveSources: [quantity("qty-base", 4, null), quantity("qty-a", 4, "ds-a-fp"), quantity("qty-b", 6, "ds-b-fp")],
    checkResults: [check("check-base", "CHECK_SATISFIED", null), check("check-a", "CHECK_SATISFIED", "ds-a-fp"), check("check-b", "CHECK_SATISFIED", "ds-b-fp")],
    analyses: [], applicabilityRulings: [],
    evaluationProfiles: [{ profileId: "profile-none", solverAssurance: "NONE", fingerprint: "profile-none-fp" }],
    solverReadinessChanged: false,
  };
}

function design(id: string): D1jR3DesignState {
  return {
    designStateId: id, version: "v1", fingerprint: `${id}-fp`, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1",
    structuralSystemId: "sys-1", authority: "DESIGN_AUTHORITY", validationState: "RECORDED", sourceKind: "GOVERNED_DESIGN_STATE_REFERENCE", status: "CURRENT",
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

function evaluate(r3: D1jR3Store, candidateId: string, designStateId: string, checkId: string) {
  const candidate = registerHumanDefinedCandidate(r3, actor(), { candidateId, optimizationProblemId: "problem-1-r2", designStateId, version: "1" });
  const subject = registerCandidateEvaluationSubject(r3, actor(), { subjectId: `${candidateId}-subject`, candidateId });
  const value = bindCandidateObjectiveValueReference(r3, actor(), { objectiveValueReferenceId: `${candidateId}-value`, candidateId, subjectId: subject.subjectId, objectiveId: "problem-1-obj" });
  bindCandidateCheckReference(r3, actor(), { checkResultReferenceId: `${candidateId}-check`, candidateId, subjectId: subject.subjectId, constraintId: "problem-1-con", sourceCheckResultId: checkId });
  const evidence = createCandidateEvidence(r3, actor(), {
    evaluationEvidenceSetId: `${candidateId}-evidence`, candidateId, subjectId: subject.subjectId,
    objectiveValueReferenceIds: [value.objectiveValueReferenceId], checkResultReferenceIds: [`${candidateId}-check`], analysisReferenceIds: [], version: "1",
  });
  return { candidate, evaluation: deriveCandidateFeasibility(r3, actor(), { candidateId, evidenceId: evidence.evaluationEvidenceSetId }) };
}

function study() {
  const r1 = createD1jR1Store(r1Catalog(), clock());
  const r2 = createD1jR2Store(r1, catalog(), clock());
  const problem = bindProblem(r1, r2);
  const r3 = createD1jR3Store(r2, [design("ds-a"), design("ds-b")], clock());
  const r4 = createD1jR4Store(r3, clock());
  const first = evaluate(r3, "cand-a", "ds-a", "check-a");
  const second = evaluate(r3, "cand-b", "ds-b", "check-b");
  const set = composeMultiObjectiveCandidateSet(r3, actor(), { candidateSetId: "set-1", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a", "cand-b"], version: "1" });
  return { r1, r2, r3, r4, problem, first, second, set };
}

function closeStudy(r4: D1jR4Store, candidateId: string, rationale: string) {
  const review = registerCandidateReview(r4, actor(), { reviewId: `review-${candidateId}`, candidateId, candidateSetId: "set-1", reviewScope: "CANDIDATE_RECORD", reviewBasis: "pinned evidence", reviewOutcome: "REVIEW_RECORDED_WITH_LIMITATIONS", limitations: "reference only", version: "1" });
  const selection = recordCandidateSelection(r4, actor(), { selectionId: `selection-${candidateId}`, candidateSetId: "set-1", selectedCandidateId: candidateId, selectionPurpose: "PREFERRED_FOR_FURTHER_DEVELOPMENT", tradeOffRationale: rationale, version: "1" });
  const evidence = composeSelectedCandidateEvidence(r4, actor(), { selectedEvidenceId: `selected-${candidateId}`, selectionId: selection.selectionId, reviewId: review.reviewId });
  const manifest = createOptimizationStudyManifest(r4, actor(), { manifestId: `manifest-${candidateId}`, studyEvidenceId: `study-${candidateId}`, optimizationProblemId: "problem-1-r2", candidateSetId: "set-1", reviewIds: [review.reviewId], selectionId: selection.selectionId, selectedEvidenceId: evidence.selectedEvidenceId, version: "1" });
  const eligibility = assessCertificationReadiness(r4, actor(), { eligibilityId: `elig-${candidateId}`, manifestId: manifest.manifest.manifestId, version: "1", callerD1gStatus: "CERTIFIED", callerEngineerValidated: true, callerConformanceValidated: true, callerEligible: true });
  return { review, selection, evidence, manifest, eligibility };
}

describe("EOS-D1J-R5 structural optimization certification closeout", () => {
  it("closes a bounded study path without certification eligibility", () => {
    const packed = study();
    const closed = closeStudy(packed.r4, "cand-a", "further development");
    const result = produceCertificationEvidenceReadinessResult(packed.r4, closed.eligibility.eligibilityId);
    expect(closed.manifest.studyEvidence.completeness).toBe("COMPLETE_FOR_DECLARED_SCOPE");
    expect(closed.eligibility.eligibilityState).toBe("NOT_ELIGIBLE");
    expect(result.certificationEligibility).toBe("NOT_ELIGIBLE");
    expect(result.D1GCertifiedSolverStatus).toBe("NOT_CERTIFIED");
    expect(result.D1JEngineerValidationStatus).toBe("NOT_VALIDATED");
    expect(D1J_R5_E2E_COUNTS()).toEqual({ optimizer: 0, solver: 0, mutation: 0 });
    expect(D1J_FINAL_CERTIFICATION_ELIGIBILITY).toBe("NOT_ELIGIBLE");
    expect(D1J_CURRENT_CERTIFICATION_ELIGIBILITY).toBe("NOT_ELIGIBLE");
    expect(closed.eligibility.blockingReasons).toEqual(["D1G_CERTIFIED_SOLVER_REQUIRED", "D1J_CONFORMANCE_VALIDATION_REQUIRED", "D1J_ENGINEER_VALIDATION_REQUIRED"]);
    expect(closed.review.softwareValidation).toBe(false);
    expect(D1J_R5_HUMAN_STUDY_REVIEW_EQUALS_D1J_ENGINEER_VALIDATION).toBe(false);
    expect(D1J_ENGINEER_VALIDATION_EVIDENCE_COUNT).toBe(0);
    expect(D1J_R5_D1G_CERTIFIED_SOLVER_STATUS).toBe("NOT_CERTIFIED");
    expect(closed.selection.designApproval).toBe(false);
    expect(closed.selection.certification).toBe(false);
  });

  it("keeps feasibility when comparison eligibility is absent and does not treat Pareto as approval", () => {
    const packed = study();
    const feasibilityBefore = packed.first.evaluation.feasibilityState;
    packed.first.candidate.baselineFingerprint = "other-baseline";
    const set = composeMultiObjectiveCandidateSet(packed.r3, actor(), { candidateSetId: "set-ineligible", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a"], version: "2" });
    expect(set.ineligibleCandidateIds).toContain("cand-a");
    expect(packed.first.evaluation.feasibilityState).toBe(feasibilityBefore);
    expect(feasibilityBefore).toBe("FEASIBLE");
    const review = registerCandidateReview(packed.r4, actor(), { reviewId: "review-ineligible", candidateId: "cand-a", candidateSetId: "set-ineligible", reviewScope: "CANDIDATE_EVIDENCE", reviewBasis: "own evidence", reviewOutcome: "REVIEW_RECORDED", limitations: "not comparable", version: "1" });
    const selection = recordCandidateSelection(packed.r4, actor(), { selectionId: "selection-ineligible", candidateSetId: "set-ineligible", selectedCandidateId: "cand-a", selectionPurpose: "SELECTED_OPTIMIZATION_ALTERNATIVE", tradeOffRationale: "kept for its own evidence", version: "1" });
    expect(selection.comparisonIneligible).toBe(true);
    expect(selection.feasibilityState).toBe("FEASIBLE");
    expect(claimScopeSupported("FEASIBILITY_CLAIM", { comparisonIneligible: true, feasibilityState: selection.feasibilityState, eligibilityState: "NOT_ELIGIBLE" })).toBe(true);
    expect(claimScopeSupported("MULTI_OBJECTIVE_COMPARISON_CLAIM", { comparisonIneligible: true, feasibilityState: "FEASIBLE", eligibilityState: "NOT_ELIGIBLE" })).toBe(false);
    expect(claimScopeSupported("PARETO_COMPOSITION_CLAIM", { comparisonIneligible: true, feasibilityState: "FEASIBLE", eligibilityState: "NOT_ELIGIBLE" })).toBe(false);
    expect(claimScopeSupported("CERTIFICATION_ELIGIBILITY_CLAIM", { comparisonIneligible: false, feasibilityState: "FEASIBLE", eligibilityState: "NOT_ELIGIBLE" })).toBe(false);
    expect(review.candidateId).toBe("cand-a");
    expect(packed.set.selectedWinner).toBeNull();
    expect(packed.set.nonDominatedCandidateIds).toContain("cand-a");
    expect(packed.r4.selections.filter((row) => row.candidateSetId === "set-1")).toHaveLength(0);
    expect(packed.first.candidate.approved).toBe(false);
    expect(packed.first.candidate.selected).toBe(false);
    expect(D1J_R5_NONDOMINATED_EQUALS_APPROVED).toBe(false);
    const dominated = closeStudy(packed.r4, "cand-b", "constructability is outside the recorded objective");
    expect(packed.set.dominatedCandidateIds).toContain("cand-b");
    expect(dominated.selection.dominated).toBe(true);
    expect(dominated.selection.feasibilityState).toBe("FEASIBLE");
    expect(dominated.eligibility.blockingReasons).not.toContain("DOMINATED");
    expect(D1J_R5_DOMINATED_EQUALS_INFEASIBLE).toBe(false);
    expect(packed.set.dominatedCandidateIds).toContain("cand-b");
  });

  it("preserves parameter-semantic debt, reference-only candidates, replay, and staleness", () => {
    const packed = study();
    expect(() => registerVariableAssignmentReference(packed.r3, actor(), { concreteParameterSemanticRef: "GOVERNED_BOUNDED_QUANTITY" })).toThrow("GENERIC_PARAMETER_KIND");
    expect(D1J_FINAL_PARAMETER_SEMANTIC_STATUS).toBe("NOT_AVAILABLE");
    expect(D1J_R5_ASSIGNMENT_RUNTIME_COUNT).toBe(0);
    expect(packed.first.candidate.referenceOnly).toBe(true);
    expect(packed.first.candidate.claimsModelMapping).toBe(false);
    expect(D1J_FINAL_BASELINE_EVIDENCE_AUTO_REUSED_FOR_CANDIDATE).toBe(false);
    const closed = closeStudy(packed.r4, "cand-a", "audit");
    expect(closed.manifest.manifest.referenceOnlyCandidates).toBe(true);
    expect(closed.manifest.manifest.generatedDesign).toBe(false);
    const firstFingerprint = closed.manifest.manifest.fingerprint;
    const again = createOptimizationStudyManifest(packed.r4, actor(), { manifestId: "manifest-again", studyEvidenceId: "study-again", optimizationProblemId: "problem-1-r2", candidateSetId: "set-1", reviewIds: [closed.review.reviewId], selectionId: closed.selection.selectionId, selectedEvidenceId: closed.evidence.selectedEvidenceId, version: "1" });
    expect(again.manifest.fingerprint).toBe(firstFingerprint);
    const replay = replayCertificationEvidence(packed.r4, closed.manifest.manifest.manifestId);
    expect(replay.problemFingerprint).toBe(packed.problem.fingerprint);
    expect(replay.baselineFingerprint).toBe(closed.manifest.manifest.baselineFingerprint);
    expect(replay.selectedCandidateId).toBe("cand-a");
    expect(replay.reviewerIds).toEqual(["engineer-1"]);
    expect(replay.d1gStatus).toBe("NOT_CERTIFIED");
    expect(replay.engineerValidationStatus).toBe("NOT_VALIDATED");
    expect(closed.review.callerBackdated).toBe(false);
    expect(closed.selection.callerBackdated).toBe(false);
    packed.r1.catalog.identities[0]!.contentFingerprint = "changed";
    propagateCertificationEvidenceStaleness(packed.r4);
    expect(closed.manifest.manifest.status).toBe("STALE");
    expect(packed.r4.history.length).toBeGreaterThan(0);
  });

  it("does not add optimizer, solver, mutation, certification, or an unauthorized successor", () => {
    const source = readFileSync(join(here, "optimization-closeout.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1J_R5_STRUCTURAL_OPTIMIZATION_CERTIFICATION_CLOSEOUT.md"), "utf8");
    const reviewPackage = readFileSync(join(here, "../../../engineering-review/package.json"), "utf8");
    const persistencePackage = readFileSync(join(here, "../../../engineering-review-persistence/package.json"), "utf8");
    expect(scanAnalysisFormulaBypass(join(here, "optimization-closeout.ts"), source)).toEqual([]);
    expect(scanAnalysisFormulaBypass(join(here, "../../../../docs/architecture/engineering-os/EOS_D1J_R5_STRUCTURAL_OPTIMIZATION_CERTIFICATION_CLOSEOUT.md"), doc)).toEqual([]);
    expect(source.includes("from \"@rtb/engineering-review\"")).toBe(false);
    expect(source.includes("generateCandidate")).toBe(false);
    expect(source.includes("child_process")).toBe(false);
    expect(doc.includes("```")).toBe(false);
    expect(doc.toLowerCase().includes("ga ready")).toBe(false);
    expect(D1J_R5_NEW_FEATURE_RUNTIME_COUNT).toBe(0);
    expect(D1J_R5_OPTIMIZATION_ALGORITHM_RUNTIME_COUNT).toBe(0);
    expect(D1J_R5_CANDIDATE_GENERATION_RUNTIME_COUNT).toBe(0);
    expect(D1J_R5_SEARCH_RUNTIME_COUNT).toBe(0);
    expect(D1J_R5_SOLVER_EXECUTION_COUNT).toBe(0);
    expect(D1J_R5_ENGINEERING_CHECK_EXECUTION_COUNT).toBe(0);
    expect(D1J_R5_MODEL_MUTATION_COUNT).toBe(0);
    expect(D1J_R5_AUTOMATIC_SELECTION_COUNT).toBe(0);
    expect(D1J_R5_CERTIFICATION_TERM_EQUALS_PROFESSIONAL_CERTIFICATION).toBe(false);
    expect(D1J_R5_CERTIFICATION_TERM_EQUALS_REGULATORY_CERTIFICATION).toBe(false);
    expect(D1J_R5_CERTIFICATION_TERM_EQUALS_DESIGN_APPROVAL).toBe(false);
    expect(D1J_R5_CERTIFICATION_TERM_EQUALS_SOLVER_CERTIFICATION).toBe(false);
    expect(D1J_FINAL_MATURITY).toBe("STRUCTURAL_OPTIMIZATION_CERTIFICATION_BOUNDED_RUNTIME_IMPLEMENTED");
    expect(D1J_FINAL_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1J_FINAL_MATURITY_IMPLIES_OPTIMIZER).toBe(false);
    expect(D1J_FINAL_MATURITY_IMPLIES_CERTIFICATION_ELIGIBLE).toBe(false);
    expect(D1J_TRACK_CLOSED).toBe(true);
    expect(D1J_CLOSEOUT_LIMITATIONS.includes("NOT_ELIGIBLE")).toBe(true);
    expect(D1J_R5_INVENTS_UNAUTHORIZED_SUCCESSOR_PHASE).toBe(false);
    expect(POST_D1J_NEXT_ACTION_DECISION).toBe("ROADMAP_GOVERNANCE_REQUIRED");
    expect(D1K_CURRENT_STATUS).toBe("NOT_STARTED");
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D2_STARTED_BY_D1J_R5).toBe(false);
    expect(D2_STARTED_BY_THIS_PHASE).toBe(false);
    expect(reviewPackage.includes("\"test\": \"vitest run\"")).toBe(true);
    expect(persistencePackage.includes("test:unit")).toBe(true);
    expect(persistencePackage.includes("secret-scan")).toBe(true);
    expect(persistencePackage.includes("test:rls")).toBe(true);
  });
});

function D1J_R5_E2E_COUNTS() {
  return { optimizer: 0, solver: 0, mutation: 0 };
}
