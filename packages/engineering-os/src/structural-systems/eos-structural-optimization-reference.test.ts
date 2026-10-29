import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  D1J_R2_CANDIDATE_GENERATION_RUNTIME_COUNT,
  D1J_R2_CERTIFICATION_EVIDENCE_RUNTIME_COUNT,
  D1J_R2_D1G_CERTIFIED_SOLVER_STATUS,
  D1J_R2_DEFAULT_OBJECTIVE_WEIGHTS_CREATED,
  D1J_R2_ENGINEERING_CHECK_EXECUTION_COUNT,
  D1J_R2_OPTIMIZATION_ALGORITHM_RUNTIME_COUNT,
  D1J_R2_SOLVER_EXECUTION_COUNT,
  D1J_R3_PARAMETER_ASSIGNMENT_SEMANTIC_READINESS,
  bindEvaluationDefinitionToProblem,
  createD1jR2Store,
  createEvaluationEvidenceSet,
  createObjectiveSet,
  createRequiredCheckSet,
  deriveFeasibilityReference,
  evaluateEvaluationCompleteness,
  inspectFeasibilityReference,
  parameterSemanticBoundary,
  propagateEvaluationStaleness,
  registerAnalysisResultReference,
  registerBaselineEvaluationSubject,
  registerCheckResultReference,
  registerConstraintDefinition,
  registerObjectiveDefinition,
  registerObjectiveValueReference,
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
  return () => `2026-04-01T00:00:${String(tick++).padStart(2, "0")}.000Z`;
}

function r1Catalog(): D1jR1Catalog {
  const identity = (kind: "STRUCTURAL_SYSTEM" | "MEMBER", id: string, systemId = "sys-1") => ({
    kind, id, structuralSystemId: kind === "STRUCTURAL_SYSTEM" ? id : systemId,
    tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", version: "v1", lifecycle: "CURRENT" as const,
    authority: "D1F_OWNER", validationState: "RECORDED", contentFingerprint: `${kind}-${id}-fp`, status: "CURRENT" as const,
  });
  return {
    identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("MEMBER", "mem-1"), identity("MEMBER", "mem-2")],
    bindings: [{ bindingId: "bind-1", jurisdictionBindingRef: "jurisdiction-au", standardBindingRefs: ["standard-1"], fingerprint: "bind-fp-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT" }],
    domainSources: [{
      domainSourceId: "length-rule", sourceClass: "GOVERNED_ENGINEERING_RULE", authority: "RULE_AUTHORITY", fingerprint: "length-rule-fp", version: "1",
      tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT", catalogueEntries: null, enumerationIds: null, booleanMeanings: null,
      quantity: "length", unit: "m", engineeringMinimum: 1, engineeringMaximum: 10, integerMinimum: null, integerMaximum: null,
    }],
  };
}

function check(id: string, verdict: D1jR2OwnedCheck["authoritativeVerdict"], overrides: Partial<D1jR2OwnedCheck> = {}): D1jR2OwnedCheck {
  return {
    checkResultId: id, sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "TENSION", version: "v1", fingerprint: `${id}-fp`, targetId: "mem-1",
    jurisdictionBindingRef: "jurisdiction-au", standardBindingRefs: ["standard-1"], authoritativeVerdict: verdict, numericMetric: null, authority: "D1D_OWNER",
    validationState: "RECORDED", analysisResultId: null, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT", evidenceClass: "OWNED",
    ...overrides,
  };
}

function catalog(extra: Partial<D1jR2Catalog> = {}): D1jR2Catalog {
  return {
    objectiveSources: [{
      sourceId: "qty-1", sourceDomain: "GOVERNED_QUANTITY", version: "v1", fingerprint: "qty-fp-1", quantity: "length", unit: "m", value: 4,
      authority: "QUANTITY_OWNER", validationState: "VERIFIED", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", targetId: "mem-1", status: "CURRENT", evidenceClass: "OWNED",
    }],
    checkResults: [check("check-pass", "CHECK_SATISFIED"), check("check-fail", "CHECK_NOT_SATISFIED", { fingerprint: "check-fail-fp" }), check("check-number", null, { fingerprint: "check-number-fp", numericMetric: 0.82 })],
    analyses: [{
      resultSetId: "result-1", analysisRunId: "run-1", analysisModelId: "model-1", version: "v1", fingerprint: "analysis-fp-1", providerId: "SPACE_GASS",
      validationState: "RECORDED", solverReadiness: "NOT_CERTIFIED", targetId: "sys-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", status: "CURRENT", evidenceClass: "OWNED",
    }],
    applicabilityRulings: [{ rulingId: "ruling-na", applicability: "NOT_APPLICABLE", authority: "HUMAN_ENGINEER", fingerprint: "ruling-fp", status: "CURRENT" }],
    evaluationProfiles: [
      { profileId: "profile-none", solverAssurance: "NONE", fingerprint: "profile-none-fp" },
      { profileId: "profile-certified", solverAssurance: "CERTIFIED_SOLVER_REQUIRED", fingerprint: "profile-certified-fp" },
    ],
    solverReadinessChanged: false,
    ...extra,
  };
}

function actor(overrides: Partial<D1jR2Actor> = {}): D1jR2Actor {
  return { actorId: "engineer-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authority: "HUMAN_ENGINEER", ...overrides };
}

function foundation(): { r1: D1jR1Store; r2: D1jR2Store } {
  const r1 = createD1jR1Store(r1Catalog(), clock());
  createOptimizationProblemFoundation(r1, actor(), {
    optimizationProblemId: "problem-1", baselineRefId: "baseline-1", sourceDomain: "D1F_STRUCTURAL_SYSTEM", sourceObjectId: "sys-1", bindingId: "bind-1",
    scope: { scopeKind: "STRUCTURAL_SYSTEM", structuralSystemId: "sys-1", designDiscipline: "STRUCTURAL", projectStage: "DETAILED_DESIGN", purpose: "study", limitations: "r1" },
    limitations: "foundation", version: "1", governanceProfileRef: "profile-1",
  });
  return { r1, r2: createD1jR2Store(r1, catalog(), clock()) };
}

function objective(runtime: D1jR2Store, id = "obj-1") {
  return registerObjectiveDefinition(runtime, actor(), { objectiveId: id, optimizationProblemId: "problem-1", semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-1", unit: "m", version: "1" });
}

function constraint(runtime: D1jR2Store, id = "con-1", kind = "TENSION") {
  return registerConstraintDefinition(runtime, actor(), { constraintId: id, optimizationProblemId: "problem-1", sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: kind, targetId: "mem-1", applicability: "REQUIRED", version: "1" });
}

function bound(runtime: D1jR2Store, profile = "profile-none", checkIds = ["con-1"]) {
  createObjectiveSet(runtime, actor(), { objectiveSetId: "obj-set-1", optimizationProblemId: "problem-1", objectiveIds: ["obj-1"], version: "1" });
  createRequiredCheckSet(runtime, actor(), { requiredCheckSetId: "check-set-1", optimizationProblemId: "problem-1", constraintIds: checkIds, evaluationProfileId: profile, version: "1" });
  return bindEvaluationDefinitionToProblem(runtime, actor(), { successorProblemId: "problem-r2", predecessorProblemId: "problem-1", objectiveSetId: "obj-set-1", requiredCheckSetId: "check-set-1", version: "1" });
}

describe("EOS-D1J-R2 objective constraint feasibility reference foundation", () => {
  it("defines a governed objective and rejects a missing or incompatible unit", () => {
    const { r2 } = foundation();
    const defined = objective(r2);
    expect(defined.direction).toBe("MINIMIZE");
    expect(defined.defaultWeight).toBeNull();
    expect(defined.normalizationPolicyRef).toBeNull();
    expect(defined.sourceAuthority).toBe("QUANTITY_OWNER");
    expect(D1J_R2_DEFAULT_OBJECTIVE_WEIGHTS_CREATED).toBe(false);
    expect(() => registerObjectiveDefinition(r2, actor(), { objectiveId: "obj-unit", optimizationProblemId: "problem-1", semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-1", unit: null, version: "1" })).toThrow("OBJECTIVE_UNIT_REQUIRED");
    expect(() => registerObjectiveDefinition(r2, actor(), { objectiveId: "obj-pa", optimizationProblemId: "problem-1", semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-1", unit: "Pa", version: "1" })).toThrow("OBJECTIVE_UNIT_INCOMPATIBLE");
  });

  it("resolves the objective value from the source and ignores a caller number", () => {
    const { r2 } = foundation();
    objective(r2);
    constraint(r2);
    bound(r2);
    const subject = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "subject-1", optimizationProblemId: "problem-r2" });
    const value = registerObjectiveValueReference(r2, actor(), { objectiveValueReferenceId: "value-1", subjectId: subject.subjectId, objectiveId: "obj-1", callerValue: 999 });
    expect(value.value).toBe(4);
    expect(value.sourceAuthority).toBe("QUANTITY_OWNER");
    expect(value.copiesSourceBody).toBe(false);
    expect(() => registerObjectiveValueReference(r2, actor(), { objectiveValueReferenceId: "value-spoof", subjectId: subject.subjectId, objectiveId: "obj-1", expectedFingerprint: "spoof" })).toThrow("OBJECTIVE_VALUE_FINGERPRINT_MISMATCH");
    expect(() => registerObjectiveValueReference(r2, actor(), { objectiveValueReferenceId: "value-rate", subjectId: subject.subjectId, objectiveId: "obj-1", callerRate: 9, callerFactor: 2 })).toThrow("OBJECTIVE_VALUE_NOT_FOUND");
  });

  it("builds an order-independent objective set and an allowlisted required-check set", () => {
    const { r2 } = foundation();
    objective(r2);
    r2.catalog.objectiveSources.push({ ...r2.catalog.objectiveSources[0]!, sourceId: "metric-1", sourceDomain: "D1G_ANALYSIS_METRIC", fingerprint: "metric-fp", value: 2 });
    registerObjectiveDefinition(r2, actor(), { objectiveId: "obj-2", optimizationProblemId: "problem-1", semanticType: "D1G_ANALYSIS_METRIC", direction: "MAXIMIZE", sourceId: "metric-1", unit: "m", version: "1" });
    const forward = createObjectiveSet(r2, actor(), { objectiveSetId: "set-a", optimizationProblemId: "problem-1", objectiveIds: ["obj-1", "obj-2"], version: "1" });
    const reverse = createObjectiveSet(r2, actor(), { objectiveSetId: "set-b", optimizationProblemId: "problem-1", objectiveIds: ["obj-2", "obj-1"], version: "1" });
    expect(forward.fingerprint).toBe(reverse.fingerprint);
    constraint(r2);
    expect(() => registerConstraintDefinition(r2, actor(), { constraintId: "con-path", optimizationProblemId: "problem-1", sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "members[0].stress", targetId: "mem-1", applicability: "REQUIRED", version: "1" })).toThrow("CONSTRAINT_TYPE_UNSUPPORTED");
  });

  it("rejects an arbitrary check, an empty set, unknown applicability, and an ungoverned waiver", () => {
    const { r2 } = foundation();
    expect(() => constraint(r2, "con-bad", "NOT_A_CHECK")).toThrow("CONSTRAINT_TYPE_UNSUPPORTED");
    objective(r2);
    constraint(r2);
    expect(() => createRequiredCheckSet(r2, actor(), { requiredCheckSetId: "empty", optimizationProblemId: "problem-1", constraintIds: [], evaluationProfileId: "profile-none", version: "1" })).toThrow("EMPTY_REQUIRED_CHECK_SET");
    expect(() => registerConstraintDefinition(r2, actor(), { constraintId: "con-unknown", optimizationProblemId: "problem-1", sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "SHEAR_MAJOR", targetId: "mem-1", applicability: "UNKNOWN", version: "1" })).toThrow("CHECK_APPLICABILITY_UNRESOLVED");
    expect(() => registerConstraintDefinition(r2, actor(), { constraintId: "con-waive", optimizationProblemId: "problem-1", sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "SHEAR_MAJOR", targetId: "mem-1", applicability: "NOT_APPLICABLE", version: "1" })).toThrow("CHECK_APPLICABILITY_UNRESOLVED");
    expect(registerConstraintDefinition(r2, actor(), { constraintId: "con-na", optimizationProblemId: "problem-1", sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "SHEAR_MAJOR", targetId: "mem-1", applicability: "NOT_APPLICABLE", rulingId: "ruling-na", version: "1" }).requiredness).toBe("NOT_APPLICABLE");
  });

  it("binds an R2 successor without rewriting the R1 problem and stays short of runtime readiness", () => {
    const { r1, r2 } = foundation();
    registerDesignVariableDefinition(r1, actor(), { variableId: "var-1", optimizationProblemId: "problem-1", semanticKey: "GOVERNED_BOUNDED_QUANTITY", targetKind: "MEMBER", targetId: "mem-1", parameterKind: "GOVERNED_BOUNDED_QUANTITY", quantity: "length", unit: "m", domainSourceId: "length-rule", applicability: "APPLICABLE", limitations: "shape", version: "1" });
    const head = createVariableSet(r1, actor(), { variableSetId: "set-1", optimizationProblemId: "problem-1", variableIds: ["var-1"], version: "1" }).problem;
    const beforeHead = JSON.stringify(head);
    const beforeOriginal = JSON.stringify(r1.problems[0]);
    registerObjectiveDefinition(r2, actor(), { objectiveId: "obj-1", optimizationProblemId: head.optimizationProblemId, semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-1", unit: "m", version: "1" });
    registerConstraintDefinition(r2, actor(), { constraintId: "con-1", optimizationProblemId: head.optimizationProblemId, sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "TENSION", targetId: "mem-1", applicability: "REQUIRED", version: "1" });
    createObjectiveSet(r2, actor(), { objectiveSetId: "obj-set-1", optimizationProblemId: head.optimizationProblemId, objectiveIds: ["obj-1"], version: "1" });
    createRequiredCheckSet(r2, actor(), { requiredCheckSetId: "check-set-1", optimizationProblemId: head.optimizationProblemId, constraintIds: ["con-1"], evaluationProfileId: "profile-none", version: "1" });
    const successor = bindEvaluationDefinitionToProblem(r2, actor(), { successorProblemId: "problem-r2", predecessorProblemId: head.optimizationProblemId, objectiveSetId: "obj-set-1", requiredCheckSetId: "check-set-1", version: "1" });
    expect(successor.fingerprint).not.toBe(head.fingerprint);
    expect(successor.r1Fingerprint).toBe(head.fingerprint);
    expect(successor.optimizationRuntimeReady).toBe(false);
    expect(successor.candidateGenerationReady).toBe(false);
    expect(successor.certificationReady).toBe(false);
    expect(JSON.stringify(head)).toBe(beforeHead);
    expect(JSON.stringify(r1.problems[0])).toBe(beforeOriginal);
  });

  it("pins the owning check verdict and rejects spoofed status, numeric inference, and scope mismatch", () => {
    const { r2 } = foundation();
    objective(r2);
    constraint(r2);
    const successor = bound(r2);
    const subject = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "subject-1", optimizationProblemId: successor.optimizationProblemId });
    const reference = registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-1", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass", callerStatus: "FAIL", callerAuthority: "ELEVATED" });
    expect(reference.authoritativeStatus).toBe("PASS");
    expect(reference.sourceAuthority).toBe("D1D_OWNER");
    expect(() => registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-spoof", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass", expectedFingerprint: "spoof" })).toThrow("CHECK_FINGERPRINT_MISMATCH");
    expect(() => registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-number", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-number" })).toThrow("CHECK_STATUS_UNRESOLVED");
    r2.catalog.checkResults[0]!.standardBindingRefs = ["other-standard"];
    expect(() => registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-standard", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass" })).toThrow("CHECK_STANDARD_MISMATCH");
    r2.catalog.checkResults[0]!.standardBindingRefs = ["standard-1"];
    r2.catalog.checkResults[0]!.targetId = "mem-2";
    expect(() => registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-target", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass" })).toThrow("CHECK_TARGET_MISMATCH");
  });

  it("pins an exact analysis reference without treating it as a check or certifying D1G", () => {
    const { r2 } = foundation();
    objective(r2);
    constraint(r2);
    const successor = bound(r2, "profile-certified");
    const analysis = registerAnalysisResultReference(r2, actor(), { analysisReferenceId: "analysis-ref-1", resultSetId: "result-1", callerValidation: "CERTIFIED" });
    expect(analysis.validationState).toBe("RECORDED");
    expect(analysis.certifiedSolverStatus).toBe("NOT_CERTIFIED");
    expect(D1J_R2_D1G_CERTIFIED_SOLVER_STATUS).toBe("NOT_CERTIFIED");
    expect(analysis.promotesAuthority).toBe(false);
    expect(() => registerAnalysisResultReference(r2, actor(), { analysisReferenceId: "analysis-spoof", resultSetId: "result-1", expectedFingerprint: "spoof" })).toThrow("ANALYSIS_FINGERPRINT_MISMATCH");
    const subject = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "subject-1", optimizationProblemId: successor.optimizationProblemId });
    const evidence = createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "evidence-analysis", optimizationProblemId: successor.optimizationProblemId, subjectId: subject.subjectId, objectiveValueReferenceIds: [], checkResultReferenceIds: [], analysisReferenceIds: ["analysis-ref-1"], version: "1" });
    expect(deriveFeasibilityReference(r2, actor(), evidence.evaluationEvidenceSetId).feasibilityState).toBe("UNDETERMINED");
  });

  it("records feasible, infeasible, missing, stale, and separated objective outcomes", () => {
    const { r2 } = foundation();
    objective(r2);
    constraint(r2);
    const successor = bound(r2);
    const subject = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "subject-1", optimizationProblemId: successor.optimizationProblemId });
    const pass = registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-pass", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass" });
    const value = registerObjectiveValueReference(r2, actor(), { objectiveValueReferenceId: "value-1", subjectId: subject.subjectId, objectiveId: "obj-1" });
    const evidence = createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "evidence-1", optimizationProblemId: successor.optimizationProblemId, subjectId: subject.subjectId, objectiveValueReferenceIds: [value.objectiveValueReferenceId], checkResultReferenceIds: [pass.checkResultReferenceId], analysisReferenceIds: [], version: "1" });
    const feasible = deriveFeasibilityReference(r2, actor(), evidence.evaluationEvidenceSetId);
    expect(feasible.feasibilityState).toBe("FEASIBLE");
    expect(feasible.certificationEligible).toBe(false);
    expect(feasible.executesFormula).toBe(false);
    expect(inspectFeasibilityReference(r2, feasible.feasibilityReferenceId).fingerprint).toBe(feasible.fingerprint);

    const failRuntime = foundation().r2;
    objective(failRuntime);
    constraint(failRuntime);
    const failSuccessor = bound(failRuntime);
    const failSubject = registerBaselineEvaluationSubject(failRuntime, actor(), { subjectId: "subject-1", optimizationProblemId: failSuccessor.optimizationProblemId });
    const failed = registerCheckResultReference(failRuntime, actor(), { checkResultReferenceId: "ref-fail", subjectId: failSubject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-fail" });
    const failValue = registerObjectiveValueReference(failRuntime, actor(), { objectiveValueReferenceId: "value-1", subjectId: failSubject.subjectId, objectiveId: "obj-1" });
    const failEvidence = createEvaluationEvidenceSet(failRuntime, actor(), { evaluationEvidenceSetId: "evidence-fail", optimizationProblemId: failSuccessor.optimizationProblemId, subjectId: failSubject.subjectId, objectiveValueReferenceIds: [failValue.objectiveValueReferenceId], checkResultReferenceIds: [failed.checkResultReferenceId], analysisReferenceIds: [], version: "1" });
    expect(deriveFeasibilityReference(failRuntime, actor(), failEvidence.evaluationEvidenceSetId).feasibilityState).toBe("INFEASIBLE");
  });

  it("keeps a definitive fail infeasible when another check is missing, and a gap without fail undetermined", () => {
    const { r2 } = foundation();
    objective(r2);
    constraint(r2, "con-1", "TENSION");
    constraint(r2, "con-2", "SHEAR_MAJOR");
    const successor = bound(r2, "profile-none", ["con-1", "con-2"]);
    const subject = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "subject-1", optimizationProblemId: successor.optimizationProblemId });
    const failed = registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-fail", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-fail" });
    const value = registerObjectiveValueReference(r2, actor(), { objectiveValueReferenceId: "value-1", subjectId: subject.subjectId, objectiveId: "obj-1" });
    const evidence = createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "evidence-gap", optimizationProblemId: successor.optimizationProblemId, subjectId: subject.subjectId, objectiveValueReferenceIds: [value.objectiveValueReferenceId], checkResultReferenceIds: [failed.checkResultReferenceId], analysisReferenceIds: [], version: "1" });
    const mixed = deriveFeasibilityReference(r2, actor(), evidence.evaluationEvidenceSetId);
    expect(mixed.feasibilityState).toBe("INFEASIBLE");
    expect(mixed.evaluationCompleteness).not.toBe("COMPLETE_FOR_DECLARED_SCOPE");
    expect(mixed.missingCheckIds).toContain("con-2");

    const open = foundation().r2;
    objective(open);
    constraint(open);
    const openSuccessor = bound(open);
    const openSubject = registerBaselineEvaluationSubject(open, actor(), { subjectId: "subject-1", optimizationProblemId: openSuccessor.optimizationProblemId });
    const openValue = registerObjectiveValueReference(open, actor(), { objectiveValueReferenceId: "value-1", subjectId: openSubject.subjectId, objectiveId: "obj-1" });
    const openEvidence = createEvaluationEvidenceSet(open, actor(), { evaluationEvidenceSetId: "evidence-open", optimizationProblemId: openSuccessor.optimizationProblemId, subjectId: openSubject.subjectId, objectiveValueReferenceIds: [openValue.objectiveValueReferenceId], checkResultReferenceIds: [], analysisReferenceIds: [], version: "1" });
    expect(deriveFeasibilityReference(open, actor(), openEvidence.evaluationEvidenceSetId).feasibilityState).toBe("UNDETERMINED");
  });

  it("separates objective coverage from feasibility and refuses offsets", () => {
    const { r2 } = foundation();
    objective(r2);
    constraint(r2);
    const successor = bound(r2);
    const subject = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "subject-1", optimizationProblemId: successor.optimizationProblemId });
    const pass = registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-pass", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass" });
    const evidence = createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "evidence-no-value", optimizationProblemId: successor.optimizationProblemId, subjectId: subject.subjectId, objectiveValueReferenceIds: [], checkResultReferenceIds: [pass.checkResultReferenceId], analysisReferenceIds: [], version: "1" });
    const separated = deriveFeasibilityReference(r2, actor(), evidence.evaluationEvidenceSetId);
    expect(separated.feasibilityState).toBe("FEASIBLE");
    expect(evaluateEvaluationCompleteness(r2, evidence.evaluationEvidenceSetId).objectiveCompleteness).not.toBe("COMPLETE_FOR_DECLARED_SCOPE");

    const present = foundation().r2;
    objective(present);
    constraint(present, "con-1");
    constraint(present, "con-2", "SHEAR_MAJOR");
    const presentSuccessor = bound(present, "profile-none", ["con-1", "con-2"]);
    const presentSubject = registerBaselineEvaluationSubject(present, actor(), { subjectId: "subject-1", optimizationProblemId: presentSuccessor.optimizationProblemId });
    const presentValue = registerObjectiveValueReference(present, actor(), { objectiveValueReferenceId: "value-1", subjectId: presentSubject.subjectId, objectiveId: "obj-1" });
    const presentPass = registerCheckResultReference(present, actor(), { checkResultReferenceId: "ref-pass", subjectId: presentSubject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass" });
    const presentEvidence = createEvaluationEvidenceSet(present, actor(), { evaluationEvidenceSetId: "evidence-present", optimizationProblemId: presentSuccessor.optimizationProblemId, subjectId: presentSubject.subjectId, objectiveValueReferenceIds: [presentValue.objectiveValueReferenceId], checkResultReferenceIds: [presentPass.checkResultReferenceId], analysisReferenceIds: [], version: "1" });
    expect(deriveFeasibilityReference(present, actor(), presentEvidence.evaluationEvidenceSetId).feasibilityState).toBe("UNDETERMINED");
  });

  it("does not select the latest check, merge ambiguous results, or count a duplicate as new evidence", () => {
    const { r2 } = foundation();
    r2.catalog.checkResults.push(check("check-pass-2", "CHECK_SATISFIED", { fingerprint: "check-pass-2-fp", version: "v2" }));
    objective(r2);
    constraint(r2);
    const successor = bound(r2);
    const subject = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "subject-1", optimizationProblemId: successor.optimizationProblemId });
    expect(() => registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-latest", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "latest" })).toThrow("CHECK_RESULT_NOT_FOUND");
    const first = registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-1", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass" });
    const second = registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-2", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass-2" });
    expect(() => createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "evidence-ambiguous", optimizationProblemId: successor.optimizationProblemId, subjectId: subject.subjectId, objectiveValueReferenceIds: [], checkResultReferenceIds: [first.checkResultReferenceId, second.checkResultReferenceId], analysisReferenceIds: [], version: "1" })).toThrow("EVIDENCE_AMBIGUOUS");
    const duplicate = createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "evidence-duplicate", optimizationProblemId: successor.optimizationProblemId, subjectId: subject.subjectId, objectiveValueReferenceIds: [], checkResultReferenceIds: [first.checkResultReferenceId, first.checkResultReferenceId], analysisReferenceIds: [], version: "1" });
    expect(duplicate.checkResultReferenceIds).toEqual([first.checkResultReferenceId]);
  });

  it("keeps fixture evidence, stale passes, and unsupported checks out of a certified feasible claim", () => {
    const { r2 } = foundation();
    r2.catalog.checkResults[0]!.evidenceClass = "FIXTURE";
    objective(r2);
    constraint(r2);
    const successor = bound(r2);
    const subject = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "subject-1", optimizationProblemId: successor.optimizationProblemId });
    const pass = registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-pass", subjectId: subject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass" });
    const evidence = createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "evidence-fixture", optimizationProblemId: successor.optimizationProblemId, subjectId: subject.subjectId, objectiveValueReferenceIds: [], checkResultReferenceIds: [pass.checkResultReferenceId], analysisReferenceIds: [], version: "1" });
    const fixture = deriveFeasibilityReference(r2, actor(), evidence.evaluationEvidenceSetId);
    expect(fixture.productionEngineeringEvidence).toBe(false);
    expect(fixture.certificationEligible).toBe(false);

    r2.catalog.checkResults[0]!.status = "STALE";
    const stale = deriveFeasibilityReference(r2, actor(), evidence.evaluationEvidenceSetId);
    expect(stale.feasibilityState).toBe("UNDETERMINED");

    const unsupported = foundation().r2;
    unsupported.catalog.checkResults[0]!.status = "UNSUPPORTED";
    objective(unsupported);
    constraint(unsupported);
    const unsupportedSuccessor = bound(unsupported);
    const unsupportedSubject = registerBaselineEvaluationSubject(unsupported, actor(), { subjectId: "subject-1", optimizationProblemId: unsupportedSuccessor.optimizationProblemId });
    expect(() => registerCheckResultReference(unsupported, actor(), { checkResultReferenceId: "ref-unsupported", subjectId: unsupportedSubject.subjectId, constraintId: "con-1", sourceCheckResultId: "check-pass" })).toThrow("REQUIRED_CHECK_UNSUPPORTED");
  });

  it("preserves history, propagates staleness, and rejects cross-scope actors", () => {
    const { r1, r2 } = foundation();
    const first = objective(r2);
    const next = registerObjectiveDefinition(r2, actor(), { objectiveId: "obj-2", optimizationProblemId: "problem-1", semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-1", unit: "m", version: "2", successorOfObjectiveId: "obj-1" });
    expect(first.status).toBe("SUPERSEDED");
    expect(next.fingerprint).not.toBe(first.fingerprint);
    constraint(r2);
    createObjectiveSet(r2, actor(), { objectiveSetId: "obj-set-1", optimizationProblemId: "problem-1", objectiveIds: ["obj-2"], version: "1" });
    const firstSet = createRequiredCheckSet(r2, actor(), { requiredCheckSetId: "check-set-1", optimizationProblemId: "problem-1", constraintIds: ["con-1"], evaluationProfileId: "profile-none", version: "1" });
    registerConstraintDefinition(r2, actor(), { constraintId: "con-2", optimizationProblemId: "problem-1", sourceDomain: "D1D_STEEL_MEMBER_CHECK", checkKind: "TENSION", targetId: "mem-1", applicability: "REQUIRED", version: "2", successorOfConstraintId: "con-1" });
    const secondSet = createRequiredCheckSet(r2, actor(), { requiredCheckSetId: "check-set-2", optimizationProblemId: "problem-1", constraintIds: ["con-2"], evaluationProfileId: "profile-none", version: "2" });
    expect(secondSet.fingerprint).not.toBe(firstSet.fingerprint);
    const successor = bindEvaluationDefinitionToProblem(r2, actor(), { successorProblemId: "problem-r2", predecessorProblemId: "problem-1", objectiveSetId: "obj-set-1", requiredCheckSetId: "check-set-2", version: "1" });
    const beforeR1 = r1.problems[0]!.fingerprint;
    const subject = registerBaselineEvaluationSubject(r2, actor(), { subjectId: "subject-1", optimizationProblemId: successor.optimizationProblemId });
    const pass = registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-pass", subjectId: subject.subjectId, constraintId: "con-2", sourceCheckResultId: "check-pass" });
    const firstEvidence = createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "evidence-1", optimizationProblemId: successor.optimizationProblemId, subjectId: subject.subjectId, objectiveValueReferenceIds: [], checkResultReferenceIds: [pass.checkResultReferenceId], analysisReferenceIds: [], version: "1" });
    r2.catalog.checkResults.push(check("check-pass-b", "CHECK_SATISFIED", { fingerprint: "check-pass-b-fp" }));
    const replacement = registerCheckResultReference(r2, actor(), { checkResultReferenceId: "ref-b", subjectId: subject.subjectId, constraintId: "con-2", sourceCheckResultId: "check-pass-b" });
    const secondEvidence = createEvaluationEvidenceSet(r2, actor(), { evaluationEvidenceSetId: "evidence-2", optimizationProblemId: successor.optimizationProblemId, subjectId: subject.subjectId, objectiveValueReferenceIds: [], checkResultReferenceIds: [replacement.checkResultReferenceId], analysisReferenceIds: [], version: "2", successorOfEvidenceId: firstEvidence.evaluationEvidenceSetId });
    expect(firstEvidence.status).toBe("SUPERSEDED");
    expect(secondEvidence.fingerprint).not.toBe(firstEvidence.fingerprint);
    expect(r1.problems[0]!.fingerprint).toBe(beforeR1);
    const history = r2.history.length;
    r2.catalog.objectiveSources[0]!.status = "STALE";
    r2.catalog.checkResults[0]!.status = "STALE";
    r2.catalog.analyses[0]!.status = "STALE";
    r2.catalog.solverReadinessChanged = true;
    r1.catalog.bindings[0]!.status = "STALE";
    r1.catalog.identities[0]!.contentFingerprint = "changed";
    propagateEvaluationStaleness(r2);
    expect(r2.history.length).toBeGreaterThan(history);
    expect(successor.status).toBe("STALE");
    expect(r2.catalog.checkResults[0]!.authority).toBe("D1D_OWNER");
    const isolated = foundation();
    expect(() => registerObjectiveDefinition(isolated.r2, actor({ projectId: "project-2" }), { objectiveId: "obj-p", optimizationProblemId: "problem-1", semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-1", unit: "m", version: "1" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => registerObjectiveDefinition(isolated.r2, actor({ tenantId: "tenant-2" }), { objectiveId: "obj-t", optimizationProblemId: "problem-1", semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-1", unit: "m", version: "1" })).toThrow("CROSS_TENANT_OPERATION");
  });

  it("keeps generic parameter kinds from becoming model setters and excludes execution surfaces", () => {
    const boundary = parameterSemanticBoundary();
    expect(boundary.concreteParameter).toBe(false);
    expect(boundary.mutatesModel).toBe(false);
    expect(D1J_R3_PARAMETER_ASSIGNMENT_SEMANTIC_READINESS).toBe("PARTIAL_GENERIC_SEMANTICS_ONLY");
    expect(D1J_R2_CANDIDATE_GENERATION_RUNTIME_COUNT).toBe(0);
    expect(D1J_R2_OPTIMIZATION_ALGORITHM_RUNTIME_COUNT).toBe(0);
    expect(D1J_R2_SOLVER_EXECUTION_COUNT).toBe(0);
    expect(D1J_R2_ENGINEERING_CHECK_EXECUTION_COUNT).toBe(0);
    expect(D1J_R2_CERTIFICATION_EVIDENCE_RUNTIME_COUNT).toBe(0);
    const source = readFileSync(join(here, "objective-constraint-foundation.ts"), "utf8");
    expect(source).not.toContain("eval(");
    expect(source).not.toContain("new Function");
    expect(source).not.toContain("child_process");
    expect(source).not.toContain("utilization");
    expect(source).not.toContain("<= 1");
    expect(scanAnalysisFormulaBypass(join(here, "objective-constraint-foundation.ts"), source)).toEqual([]);
    expect(readdirSync(here).filter((name) => /digital-twin|d1i-/i.test(name))).toEqual([]);
    const repeat = foundation();
    const created = objective(repeat.r2);
    const count = repeat.r2.history.length;
    expect(registerObjectiveDefinition(repeat.r2, actor(), { objectiveId: "obj-1", optimizationProblemId: "problem-1", semanticType: "GOVERNED_QUANTITY", direction: "MINIMIZE", sourceId: "qty-1", unit: "m", version: "1" })).toBe(created);
    expect(repeat.r2.history).toHaveLength(count);
  });
});
