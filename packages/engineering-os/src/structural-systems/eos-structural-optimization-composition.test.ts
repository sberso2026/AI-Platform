import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  D1J_R3_AUTOMATIC_SELECTION_RUNTIME_COUNT,
  D1J_R3_CANDIDATE_GENERATION_RUNTIME_COUNT,
  D1J_R3_CANDIDATE_RUNTIME_API,
  D1J_R3_D1G_CERTIFIED_SOLVER_STATUS,
  D1J_R3_DEFAULT_DOMINANCE_TOLERANCE_CREATED,
  D1J_R3_ENGINEERING_CHECK_EXECUTION_COUNT,
  D1J_R3_GLOBAL_RANKING_RUNTIME_COUNT,
  D1J_R3_HUMAN_SELECTION_RUNTIME_COUNT,
  D1J_R3_OPTIMIZATION_SEARCH_RUNTIME_COUNT,
  D1J_R3_SOLVER_EXECUTION_COUNT,
  D1J_R3_VARIABLE_ASSIGNMENT_REFERENCE_RUNTIME_COUNT,
  assessComparisonEligibility,
  bindCandidateAnalysisReference,
  bindCandidateCheckReference,
  bindCandidateObjectiveValueReference,
  composeMultiObjectiveCandidateSet,
  createCandidateEvidence,
  createD1jR3Store,
  deriveCandidateFeasibility,
  inspectCandidate,
  objectiveUnitsCompatible,
  propagateCandidateStaleness,
  produceCandidateCompositionResult,
  registerCandidateEvaluationSubject,
  registerGovernedImportedCandidate,
  registerHumanDefinedCandidate,
  registerVariableAssignmentReference,
  replayCandidate,
  supersedeCandidate,
  type D1jR3DesignState,
  type D1jR3Store,
} from "./candidate-composition";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  createD1jR2Store,
  createObjectiveSet,
  createRequiredCheckSet,
  bindEvaluationDefinitionToProblem,
  registerBaselineEvaluationSubject,
  registerCheckResultReference,
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
    identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("STRUCTURAL_SYSTEM", "sys-2"), identity("MEMBER", "mem-1"), identity("MEMBER", "mem-2"), identity("MEMBER", "mem-s2", "sys-2")],
    bindings: [
      { bindingId: "bind-1", jurisdictionBindingRef: "jurisdiction-au", standardBindingRefs: ["standard-1"], fingerprint: "bind-fp-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT" as const },
      { bindingId: "bind-2", jurisdictionBindingRef: "jurisdiction-au", standardBindingRefs: ["standard-2"], fingerprint: "bind-fp-2", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT" as const },
    ],
    domainSources: [{
      domainSourceId: "length-rule", sourceClass: "GOVERNED_ENGINEERING_RULE", authority: "RULE_AUTHORITY", fingerprint: "length-rule-fp", version: "1",
      tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT" as const, catalogueEntries: null, enumerationIds: null, booleanMeanings: null,
      quantity: "length", unit: "m", engineeringMinimum: 1, engineeringMaximum: 10, integerMinimum: null, integerMaximum: null,
    }],
  };
}

function check(id: string, verdict: D1jR2OwnedCheck["authoritativeVerdict"], designStateFingerprint: string | null, overrides: Partial<D1jR2OwnedCheck> = {}): D1jR2OwnedCheck {
  return {
    checkResultId: id, sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "TENSION", version: "v1", fingerprint: `${id}-fp`, targetId: "mem-1",
    jurisdictionBindingRef: "jurisdiction-au", standardBindingRefs: ["standard-1"], authoritativeVerdict: verdict, numericMetric: null, authority: "D1D_OWNER",
    validationState: "RECORDED", analysisResultId: null, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT", evidenceClass: "OWNED",
    designStateFingerprint, ...overrides,
  };
}

function quantity(id: string, value: number, designStateFingerprint: string | null, overrides: Partial<D1jR2Catalog["objectiveSources"][number]> = {}) {
  return {
    sourceId: id, sourceDomain: "GOVERNED_QUANTITY" as const, version: "v1", fingerprint: `${id}-fp`, quantity: "length", unit: "m", value,
    authority: "QUANTITY_OWNER", validationState: "VERIFIED", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", targetId: "mem-1",
    status: "CURRENT" as const, evidenceClass: "OWNED" as const, designStateFingerprint, ...overrides,
  };
}

function catalog(): D1jR2Catalog {
  return {
    objectiveSources: [quantity("qty-base", 4, null), quantity("qty-a", 4, "ds-a-fp"), quantity("qty-b", 6, "ds-b-fp"), quantity("qty-c", 4, "ds-c-fp"), quantity("qty-fail", 9, "ds-fail-fp")],
    checkResults: [
      check("check-base", "CHECK_SATISFIED", null),
      check("check-a", "CHECK_SATISFIED", "ds-a-fp"),
      check("check-b", "CHECK_SATISFIED", "ds-b-fp"),
      check("check-c", "CHECK_SATISFIED", "ds-c-fp"),
      check("check-fail", "CHECK_NOT_SATISFIED", "ds-fail-fp", { fingerprint: "check-fail-fp" }),
    ],
    analyses: [{
      resultSetId: "result-a", analysisRunId: "run-a", analysisModelId: "model-a", version: "v1", fingerprint: "analysis-a-fp", providerId: "SPACE_GASS",
      validationState: "RECORDED", solverReadiness: "NOT_CERTIFIED", targetId: "sys-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1",
      status: "CURRENT", evidenceClass: "OWNED", designStateFingerprint: "ds-a-fp",
    }, {
      resultSetId: "result-base", analysisRunId: "run-base", analysisModelId: "model-base", version: "v1", fingerprint: "analysis-base-fp", providerId: "SPACE_GASS",
      validationState: "RECORDED", solverReadiness: "NOT_CERTIFIED", targetId: "sys-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1",
      status: "CURRENT", evidenceClass: "OWNED",
    }],
    applicabilityRulings: [],
    evaluationProfiles: [{ profileId: "profile-none", solverAssurance: "NONE", fingerprint: "profile-none-fp" }],
    solverReadinessChanged: false,
  };
}

function design(id: string, systemId = "sys-1", overrides: Partial<D1jR3DesignState> = {}): D1jR3DesignState {
  return {
    designStateId: id, version: "v1", fingerprint: `${id}-fp`, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1",
    structuralSystemId: systemId, authority: "DESIGN_AUTHORITY", validationState: "RECORDED", sourceKind: "GOVERNED_DESIGN_STATE_REFERENCE", status: "CURRENT", ...overrides,
  };
}

function bindProblem(r1: D1jR1Store, r2: D1jR2Store, problemId: string, sourceObjectId: string, bindingId: string, direction: "MINIMIZE" | "MAXIMIZE" = "MINIMIZE", checkKind = "TENSION", memberId = "mem-1") {
  createOptimizationProblemFoundation(r1, actor(), {
    optimizationProblemId: problemId, baselineRefId: `${problemId}-baseline`, sourceDomain: "D1F_STRUCTURAL_SYSTEM", sourceObjectId, bindingId,
    scope: { scopeKind: "STRUCTURAL_SYSTEM", structuralSystemId: sourceObjectId, designDiscipline: "STRUCTURAL", projectStage: "DETAILED_DESIGN", purpose: "study", limitations: "r1" },
    limitations: "foundation", version: "1", governanceProfileRef: "profile-1",
  });
  registerDesignVariableDefinition(r1, actor(), { variableId: `${problemId}-var`, optimizationProblemId: problemId, semanticKey: "GOVERNED_BOUNDED_QUANTITY", targetKind: "MEMBER", targetId: memberId, parameterKind: "GOVERNED_BOUNDED_QUANTITY", quantity: "length", unit: "m", domainSourceId: "length-rule", applicability: "APPLICABLE", limitations: "shape", version: "1" });
  const head = createVariableSet(r1, actor(), { variableSetId: `${problemId}-set`, optimizationProblemId: problemId, variableIds: [`${problemId}-var`], version: "1" }).problem;
  registerObjectiveDefinition(r2, actor(), { objectiveId: `${problemId}-obj`, optimizationProblemId: head.optimizationProblemId, semanticType: "GOVERNED_QUANTITY", direction, sourceId: "qty-base", unit: "m", version: "1" });
  registerConstraintDefinition(r2, actor(), { constraintId: `${problemId}-con`, optimizationProblemId: head.optimizationProblemId, sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind, targetId: memberId, applicability: "REQUIRED", version: "1" });
  createObjectiveSet(r2, actor(), { objectiveSetId: `${problemId}-obj-set`, optimizationProblemId: head.optimizationProblemId, objectiveIds: [`${problemId}-obj`], version: "1" });
  createRequiredCheckSet(r2, actor(), { requiredCheckSetId: `${problemId}-check-set`, optimizationProblemId: head.optimizationProblemId, constraintIds: [`${problemId}-con`], evaluationProfileId: "profile-none", version: "1" });
  return bindEvaluationDefinitionToProblem(r2, actor(), { successorProblemId: `${problemId}-r2`, predecessorProblemId: head.optimizationProblemId, objectiveSetId: `${problemId}-obj-set`, requiredCheckSetId: `${problemId}-check-set`, version: "1" });
}

function context() {
  const r1 = createD1jR1Store(r1Catalog(), clock());
  const r2 = createD1jR2Store(r1, catalog(), clock());
  const successor = bindProblem(r1, r2, "problem-1", "sys-1", "bind-1");
  const r3 = createD1jR3Store(r2, [design("ds-a"), design("ds-b"), design("ds-c"), design("ds-fail"), design("ds-open"), design("ds-standard"), design("ds-2", "sys-2")], clock());
  return { r1, r2, r3, successor };
}

function evaluate(r3: D1jR3Store, candidateId: string, designStateId: string, checkId: string, origin: "human" | "imported" = "human") {
  const register = origin === "human" ? registerHumanDefinedCandidate : registerGovernedImportedCandidate;
  const candidate = register(r3, actor(), { candidateId, optimizationProblemId: "problem-1-r2", designStateId, version: "1" });
  const subject = registerCandidateEvaluationSubject(r3, actor(), { subjectId: `${candidateId}-subject`, candidateId });
  const value = bindCandidateObjectiveValueReference(r3, actor(), { objectiveValueReferenceId: `${candidateId}-value`, candidateId, subjectId: subject.subjectId, objectiveId: "problem-1-obj", callerValue: 999 });
  if (checkId) bindCandidateCheckReference(r3, actor(), { checkResultReferenceId: `${candidateId}-check`, candidateId, subjectId: subject.subjectId, constraintId: "problem-1-con", sourceCheckResultId: checkId, callerStatus: "PASS" });
  const evidence = createCandidateEvidence(r3, actor(), {
    evaluationEvidenceSetId: `${candidateId}-evidence`, candidateId, subjectId: subject.subjectId,
    objectiveValueReferenceIds: [value.objectiveValueReferenceId], checkResultReferenceIds: checkId ? [`${candidateId}-check`] : [], analysisReferenceIds: [], version: "1",
  });
  const evaluation = deriveCandidateFeasibility(r3, actor(), { candidateId, evidenceId: evidence.evaluationEvidenceSetId });
  return { candidate, subject, value, evaluation };
}

describe("EOS-D1J-R3 candidate lineage comparison composition", () => {
  it("registers a human-defined reference candidate without approving or checking it", () => {
    const { r2, r3 } = context();
    const beforeBaseline = JSON.stringify(r2.subjects);
    const beforeIdentities = JSON.stringify(r2.r1.catalog.identities);
    const candidate = registerHumanDefinedCandidate(r3, actor(), { candidateId: "cand-1", optimizationProblemId: "problem-1-r2", designStateId: "ds-a", version: "1" });
    expect(candidate.approved).toBe(false);
    expect(candidate.checked).toBe(false);
    expect(candidate.feasible).toBe(false);
    expect(candidate.selected).toBe(false);
    expect(candidate.validationState).toBe("UNVALIDATED");
    expect(candidate.referenceOnly).toBe(true);
    expect(candidate.claimsModelMapping).toBe(false);
    expect(candidate.copiesSourceBody).toBe(false);
    expect(candidate.callerBackdated).toBe(false);
    expect(JSON.stringify(r2.subjects)).toBe(beforeBaseline);
    expect(JSON.stringify(r2.r1.catalog.identities)).toBe(beforeIdentities);
    expect(() => registerHumanDefinedCandidate(r3, actor(), { candidateId: "spoof", optimizationProblemId: "problem-1-r2", designStateId: "ds-a", expectedFingerprint: "spoof", version: "1" })).toThrow("CANDIDATE_FINGERPRINT_MISMATCH");
    expect(() => registerHumanDefinedCandidate(r3, actor(), { candidateId: "latest", optimizationProblemId: "problem-1-r2", designStateId: "latest", version: "1" })).toThrow("CANDIDATE_SOURCE_UNSUPPORTED");
  });

  it("registers an imported candidate without treating import as engineer validation", () => {
    const { r3 } = context();
    const imported = registerGovernedImportedCandidate(r3, actor(), { candidateId: "imported-1", optimizationProblemId: "problem-1-r2", designStateId: "ds-b", version: "1" });
    expect(imported.candidateOrigin).toBe("IMPORTED_GOVERNED");
    expect(imported.engineerValidated).toBe(false);
    expect(imported.approved).toBe(false);
  });

  it("rejects generic parameter kinds, property paths, and model mapping claims", () => {
    const { r3 } = context();
    expect(() => registerVariableAssignmentReference(r3, actor(), { concreteParameterSemanticRef: "GOVERNED_BOUNDED_QUANTITY" })).toThrow("GENERIC_PARAMETER_KIND");
    expect(() => registerVariableAssignmentReference(r3, actor(), { concreteParameterSemanticRef: "GOVERNED_CATALOGUE_CHOICE" })).toThrow("GENERIC_PARAMETER_KIND");
    expect(() => registerVariableAssignmentReference(r3, actor(), { concreteParameterSemanticRef: "GOVERNED_INTEGER_COUNT" })).toThrow("GENERIC_PARAMETER_KIND");
    expect(() => registerVariableAssignmentReference(r3, actor(), { concreteParameterSemanticRef: "member.section.depth" })).toThrow("ARBITRARY_PROPERTY_PATH");
    expect(() => registerVariableAssignmentReference(r3, actor(), { concreteParameterSemanticRef: "members[0].section" })).toThrow("ARBITRARY_PROPERTY_PATH");
    expect(() => registerVariableAssignmentReference(r3, actor(), { concreteParameterSemanticRef: "https://example.test/section" })).toThrow("ARBITRARY_PROPERTY_PATH");
    expect(() => registerVariableAssignmentReference(r3, actor({ authority: "AI" }), { concreteParameterSemanticRef: "section-semantic" })).toThrow("UNAUTHORIZED");
    expect(D1J_R3_VARIABLE_ASSIGNMENT_REFERENCE_RUNTIME_COUNT).toBe(0);
    expect(r3.assignments).toEqual([]);
  });

  it("keeps candidate identity immutable and rejects self, cyclic, and cross-problem parents", () => {
    const { r1, r2, r3 } = context();
    const first = registerHumanDefinedCandidate(r3, actor(), { candidateId: "cand-a", optimizationProblemId: "problem-1-r2", designStateId: "ds-a", version: "1" });
    const again = registerHumanDefinedCandidate(r3, actor(), { candidateId: "cand-a2", optimizationProblemId: "problem-1-r2", designStateId: "ds-a", version: "1" });
    expect(again.candidateId).toBe(first.candidateId);
    const successor = supersedeCandidate(r3, actor(), { successorCandidateId: "cand-a-next", candidateId: first.candidateId, designStateId: "ds-b", version: "2" });
    expect(successor.candidateId).not.toBe(first.candidateId);
    expect(inspectCandidate(r3, first.candidateId).status).toBe("SUPERSEDED");
    expect(first.designStateFingerprint).toBe("ds-a-fp");
    const child = registerHumanDefinedCandidate(r3, actor(), { candidateId: "cand-child", optimizationProblemId: "problem-1-r2", designStateId: "ds-c", parentCandidateId: successor.candidateId, version: "1" });
    expect(child.parentCandidateId).toBe(successor.candidateId);
    expect(child.validationState).toBe("UNVALIDATED");
    expect(() => registerHumanDefinedCandidate(r3, actor(), { candidateId: "self", optimizationProblemId: "problem-1-r2", designStateId: "ds-c", parentCandidateId: "self", version: "1" })).toThrow("SELF_PARENT");
    expect(() => supersedeCandidate(r3, actor(), { successorCandidateId: "cycle", candidateId: successor.candidateId, designStateId: "ds-b", version: "3" })).not.toThrow();
    const parentOfChild = inspectCandidate(r3, child.candidateId);
    expect(() => registerHumanDefinedCandidate(r3, actor(), { candidateId: "cycle-2", optimizationProblemId: "problem-1-r2", designStateId: "ds-b", parentCandidateId: parentOfChild.candidateId, successorOfCandidateId: successor.candidateId, version: "4" })).toThrow("LINEAGE_CYCLE");
    bindProblem(r1, r2, "problem-2", "sys-2", "bind-1", "MINIMIZE", "TENSION", "mem-s2");
    const other = registerHumanDefinedCandidate(r3, actor(), { candidateId: "other", optimizationProblemId: "problem-2-r2", designStateId: "ds-2", version: "1" });
    expect(() => registerHumanDefinedCandidate(r3, actor(), { candidateId: "cross", optimizationProblemId: "problem-1-r2", designStateId: "ds-c", parentCandidateId: other.candidateId, version: "1" })).toThrow("CROSS_PROBLEM_PARENT");
  });

  it("binds candidate evidence only when the design-state fingerprint matches", () => {
    const { r2, r3 } = context();
    const baseline = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "baseline-subject", optimizationProblemId: "problem-1-r2" });
    const before = JSON.stringify(baseline);
    registerCheckResultReference(r2, actor(), { checkResultReferenceId: "baseline-check", subjectId: baseline.subjectId, constraintId: "problem-1-con", sourceCheckResultId: "check-base" });
    const evaluated = evaluate(r3, "cand-a", "ds-a", "check-a");
    expect(evaluated.value.value).toBe(4);
    expect(evaluated.value.value).not.toBe(999);
    expect(evaluated.candidate.feasible).toBe(false);
    expect(evaluated.evaluation.feasibilityState).toBe("FEASIBLE");
    expect(r2.feasibilityRefs[0]?.executesFormula).toBe(false);
    expect(JSON.stringify(baseline)).toBe(before);
    expect(() => bindCandidateCheckReference(r3, actor(), { checkResultReferenceId: "reuse", candidateId: "cand-a", subjectId: evaluated.subject.subjectId, constraintId: "problem-1-con", sourceCheckResultId: "check-base" })).toThrow("CANDIDATE_EVIDENCE_UNCORRELATED");
    expect(() => bindCandidateAnalysisReference(r3, actor(), { analysisReferenceId: "analysis-base-ref", candidateId: "cand-a", resultSetId: "result-base", callerValidation: "CERTIFIED" })).toThrow("CANDIDATE_EVIDENCE_UNCORRELATED");
    const analysis = bindCandidateAnalysisReference(r3, actor(), { analysisReferenceId: "analysis-a-ref", candidateId: "cand-a", resultSetId: "result-a", callerValidation: "CERTIFIED" });
    expect(analysis.certifiedSolverStatus).toBe(D1J_R3_D1G_CERTIFIED_SOLVER_STATUS);
    expect(analysis.promotesAuthority).toBe(false);
    expect(analysis.certifiedSolverStatus).toBe("NOT_CERTIFIED");
  });

  it("compares only compatible feasible candidates and preserves the other populations", () => {
    const { r1, r2, r3 } = context();
    evaluate(r3, "cand-a", "ds-a", "check-a");
    evaluate(r3, "cand-b", "ds-b", "check-b");
    const eligible = assessComparisonEligibility(r3, actor(), { comparisonEligibilityId: "elig-1", candidateAId: "cand-a", candidateBId: "cand-b" });
    expect(eligible.eligibilityState).toBe("ELIGIBLE");
    const set = composeMultiObjectiveCandidateSet(r3, actor(), { candidateSetId: "set-1", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a", "cand-b"], version: "1" });
    expect(set.nonDominatedCandidateIds).toEqual(["cand-a"]);
    expect(set.dominatedCandidateIds).toEqual(["cand-b"]);
    expect(set.selectedWinner).toBeNull();
    expect(set.recommendedDesign).toBe(false);
    expect(set.globalRank).toBeNull();
    expect(D1J_R3_DEFAULT_DOMINANCE_TOLERANCE_CREATED).toBe(false);
    evaluate(r3, "cand-c", "ds-c", "check-c");
    const equal = composeMultiObjectiveCandidateSet(r3, actor(), { candidateSetId: "set-equal", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a", "cand-c"], version: "1" });
    expect(equal.nonDominatedCandidateIds).toEqual(expect.arrayContaining(["cand-a", "cand-c"]));
    expect(equal.dominatedCandidateIds).toEqual([]);
    expect(equal.selectedWinner).toBeNull();
    evaluate(r3, "cand-fail", "ds-fail", "check-fail");
    const failed = composeMultiObjectiveCandidateSet(r3, actor(), { candidateSetId: "set-fail", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a", "cand-fail"], version: "1" });
    expect(failed.infeasibleCandidateIds).toContain("cand-fail");
    expect(failed.nonDominatedCandidateIds).not.toContain("cand-fail");
    expect(inspectCandidate(r3, "cand-fail").status).toBe("CURRENT");
    const mirror = context();
    evaluate(mirror.r3, "cand-a", "ds-a", "check-a");
    evaluate(mirror.r3, "cand-b", "ds-b", "check-b");
    const reversed = composeMultiObjectiveCandidateSet(mirror.r3, actor(), { candidateSetId: "set-reversed", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-b", "cand-a"], version: "1" });
    expect(reversed.fingerprint).toBe(set.fingerprint);
    const missing = registerHumanDefinedCandidate(r3, actor(), { candidateId: "cand-missing", optimizationProblemId: "problem-1-r2", designStateId: "ds-open", version: "1" });
    expect(missing.candidateId).toBeDefined();
    const open = composeMultiObjectiveCandidateSet(r3, actor(), { candidateSetId: "set-open", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a", "cand-missing"], version: "1" });
    expect(open.undeterminedCandidateIds).toContain("cand-missing");
    expect(open.nonDominatedCandidateIds).not.toContain("cand-missing");
    bindProblem(r1, r2, "problem-2", "sys-2", "bind-1", "MAXIMIZE", "SHEAR_MAJOR", "mem-s2");
    r2.catalog.checkResults.push(check("check-shear", "CHECK_SATISFIED", "ds-2-fp", { checkKind: "SHEAR_MAJOR", fingerprint: "check-shear-fp", standardBindingRefs: ["standard-1"] }));
    registerHumanDefinedCandidate(r3, actor(), { candidateId: "other-problem", optimizationProblemId: "problem-2-r2", designStateId: "ds-2", version: "1" });
    expect(assessComparisonEligibility(r3, actor(), { comparisonEligibilityId: "elig-problem", candidateAId: "cand-a", candidateBId: "other-problem" }).reasons).toEqual(expect.arrayContaining(["PROBLEM", "BASELINE", "OBJECTIVE_SET", "REQUIRED_CHECK_SET"]));
    bindProblem(r1, r2, "problem-3", "sys-1", "bind-2");
    registerHumanDefinedCandidate(r3, actor(), { candidateId: "other-standard", optimizationProblemId: "problem-3-r2", designStateId: "ds-standard", version: "1" });
    expect(assessComparisonEligibility(r3, actor(), { comparisonEligibilityId: "elig-standard", candidateAId: "cand-a", candidateBId: "other-standard" }).reasons).toContain("STANDARD_BINDING");
    r3.r2.catalog.objectiveSources.find((row) => row.sourceId === "qty-b")!.validationState = "UNVALIDATED";
    expect(assessComparisonEligibility(r3, actor(), { comparisonEligibilityId: "elig-assurance", candidateAId: "cand-a", candidateBId: "cand-b" }).reasons).toContain("OBJECTIVE_SOURCE_ASSURANCE");
    const left = r3.r2.valueRefs.find((row) => row.objectiveValueReferenceId === "cand-a-value")!;
    const right = r3.r2.valueRefs.find((row) => row.objectiveValueReferenceId === "cand-b-value")!;
    right.unit = "mm";
    expect(objectiveUnitsCompatible("length", left.unit, right.unit)).toBe(false);
    expect(assessComparisonEligibility(r3, actor(), { comparisonEligibilityId: "elig-unit", candidateAId: "cand-a", candidateBId: "cand-b" }).reasons).toContain("OBJECTIVE_UNIT");
    const result = produceCandidateCompositionResult(r3, set.candidateSetId);
    expect(result.selectedWinner).toBeNull();
    expect(result.certification).toBe(false);
    expect(result.automaticWinner).toBe(false);
  });

  it("propagates staleness without mutating sources or deleting history", () => {
    const { r1, r2, r3 } = context();
    evaluate(r3, "cand-a", "ds-a", "check-a");
    composeMultiObjectiveCandidateSet(r3, actor(), { candidateSetId: "set-1", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a"], version: "1" });
    const authority = r2.catalog.checkResults[0]!.authority;
    const analysisAuthority = r2.catalog.analyses[0]!.providerId;
    const before = r3.history.length;
    r3.designStates[0]!.fingerprint = "changed";
    propagateCandidateStaleness(r3);
    expect(inspectCandidate(r3, "cand-a").status).toBe("STALE");
    expect(r3.sets[0]?.status).toBe("STALE");
    expect(r3.history.length).toBeGreaterThan(before);
    expect(r2.catalog.checkResults[0]!.authority).toBe(authority);
    expect(r2.catalog.analyses[0]!.providerId).toBe(analysisAuthority);
    const fresh = context();
    evaluate(fresh.r3, "cand-a", "ds-a", "check-a");
    fresh.r1.catalog.identities[0]!.contentFingerprint = "moved";
    propagateCandidateStaleness(fresh.r3);
    expect(inspectCandidate(fresh.r3, "cand-a").status).toBe("STALE");
    const variable = context();
    evaluate(variable.r3, "cand-a", "ds-a", "check-a");
    variable.r1.variableSets[0]!.status = "STALE";
    propagateCandidateStaleness(variable.r3);
    expect(inspectCandidate(variable.r3, "cand-a").status).toBe("STALE");
    const objective = context();
    evaluate(objective.r3, "cand-a", "ds-a", "check-a");
    objective.r2.objectiveSets[0]!.status = "STALE";
    propagateCandidateStaleness(objective.r3);
    expect(inspectCandidate(objective.r3, "cand-a").status).toBe("STALE");
    const checks = context();
    evaluate(checks.r3, "cand-a", "ds-a", "check-a");
    checks.r2.checkSets[0]!.status = "STALE";
    propagateCandidateStaleness(checks.r3);
    expect(inspectCandidate(checks.r3, "cand-a").status).toBe("STALE");
    const profile = context();
    evaluate(profile.r3, "cand-a", "ds-a", "check-a");
    profile.r2.catalog.evaluationProfiles[0]!.fingerprint = "profile-next";
    propagateCandidateStaleness(profile.r3);
    expect(inspectCandidate(profile.r3, "cand-a").status).toBe("STALE");
    const value = context();
    evaluate(value.r3, "cand-a", "ds-a", "check-a");
    value.r2.catalog.objectiveSources.find((row) => row.sourceId === "qty-a")!.fingerprint = "qty-a-next";
    propagateCandidateStaleness(value.r3);
    expect(inspectCandidate(value.r3, "cand-a").status).toBe("STALE");
    const feasibility = context();
    evaluate(feasibility.r3, "cand-a", "ds-a", "check-a");
    feasibility.r2.feasibilityRefs[0]!.status = "STALE";
    propagateCandidateStaleness(feasibility.r3);
    expect(inspectCandidate(feasibility.r3, "cand-a").status).toBe("STALE");
    const solver = context();
    evaluate(solver.r3, "cand-a", "ds-a", "check-a");
    solver.r2.catalog.solverReadinessChanged = true;
    propagateCandidateStaleness(solver.r3);
    expect(inspectCandidate(solver.r3, "cand-a").status).toBe("STALE");
    expect(r1.catalog.identities[0]!.authority).toBe("D1F_OWNER");
  });

  it("keeps history, fingerprints, provenance, idempotency, and isolation", () => {
    const { r3 } = context();
    const first = evaluate(r3, "cand-a", "ds-a", "check-a").candidate;
    const historyAfter = r3.history.length;
    registerHumanDefinedCandidate(r3, actor(), { candidateId: "cand-a-repeat", optimizationProblemId: "problem-1-r2", designStateId: "ds-a", version: "1" });
    expect(r3.history.length).toBe(historyAfter);
    expect(r3.candidates.filter((row) => row.designStateFingerprint === "ds-a-fp" && row.status !== "SUPERSEDED")).toHaveLength(1);
    bindCandidateCheckReference(r3, actor(), { checkResultReferenceId: "cand-a-check-2", candidateId: "cand-a", subjectId: "cand-a-subject", constraintId: "problem-1-con", sourceCheckResultId: "check-a" });
    expect(r3.r2.checkRefs.filter((row) => row.sourceCheckResultId === "check-a")).toHaveLength(1);
    const next = supersedeCandidate(r3, actor(), { successorCandidateId: "cand-a-next", candidateId: first.candidateId, designStateId: "ds-b", version: "2" });
    const replay = replayCandidate(r3, next.candidateId);
    expect(replay.designStateFingerprint).toBe("ds-b-fp");
    expect(replay.history.length).toBeGreaterThan(0);
    const other = context();
    const left = evaluate(r3, "cand-order-a", "ds-c", "check-c").candidate;
    const right = evaluate(other.r3, "cand-order-a", "ds-c", "check-c").candidate;
    expect(left.fingerprint).toBe(right.fingerprint);
    const forward = composeMultiObjectiveCandidateSet(r3, actor(), { candidateSetId: "order-a", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-a-next", "cand-order-a"], version: "1" });
    evaluate(other.r3, "cand-b", "ds-b", "check-b");
    const reverse = composeMultiObjectiveCandidateSet(other.r3, actor(), { candidateSetId: "order-b", optimizationProblemId: "problem-1-r2", candidateIds: ["cand-b", "cand-order-a"], version: "1" });
    expect(forward.fingerprint).not.toBe("");
    expect(reverse.candidateIds).toEqual(expect.arrayContaining(["cand-b", "cand-order-a"]));
    expect(() => registerHumanDefinedCandidate(r3, actor({ tenantId: "tenant-2" }), { candidateId: "tenant", optimizationProblemId: "problem-1-r2", designStateId: "ds-a", version: "1" })).toThrow("CROSS_TENANT_OPERATION");
    expect(() => registerHumanDefinedCandidate(r3, actor({ projectId: "project-2" }), { candidateId: "project", optimizationProblemId: "problem-1-r2", designStateId: "ds-a", version: "1" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(D1J_R3_CANDIDATE_GENERATION_RUNTIME_COUNT).toBe(0);
    expect(D1J_R3_OPTIMIZATION_SEARCH_RUNTIME_COUNT).toBe(0);
    expect(D1J_R3_SOLVER_EXECUTION_COUNT).toBe(0);
    expect(D1J_R3_ENGINEERING_CHECK_EXECUTION_COUNT).toBe(0);
    expect(D1J_R3_GLOBAL_RANKING_RUNTIME_COUNT).toBe(0);
    expect(D1J_R3_AUTOMATIC_SELECTION_RUNTIME_COUNT).toBe(0);
    expect(D1J_R3_HUMAN_SELECTION_RUNTIME_COUNT).toBe(0);
    expect(D1J_R3_CANDIDATE_RUNTIME_API).not.toContain("generateCandidate");
  });

  it("does not introduce engineering execution, ranking, or a dominance tolerance", () => {
    const source = readFileSync(join(here, "candidate-composition.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1J_R3_CANDIDATE_LINEAGE_COMPARISON_COMPOSITION.md"), "utf8");
    expect(scanAnalysisFormulaBypass(join(here, "candidate-composition.ts"), source)).toEqual([]);
    expect(scanAnalysisFormulaBypass(join(here, "../../../../docs/architecture/engineering-os/EOS_D1J_R3_CANDIDATE_LINEAGE_COMPARISON_COMPOSITION.md"), doc)).toEqual([]);
    for (const token of ["eval(", "new Function", "child_process", "utilization", "<= 1", "generateCandidate", "randomCandidate"]) {
      expect(source.includes(token)).toBe(false);
    }
    expect(D1J_R3_VARIABLE_ASSIGNMENT_REFERENCE_RUNTIME_COUNT).toBe(0);
  });
});
