import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { D1hProvenanceRef } from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import type { D1hR1ContextRecord } from "./inspection-evidence";
import type { D1hR2InspectionMeasurement, D1hR2StructuralFinding } from "./inspection-finding";
import type { D1hR3ConditionState } from "./inspection-condition";
import type { D1hR4AnalysisIdentityRef } from "./inspection-temporal";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  type D1iR1Actor,
  type D1iR1Catalog,
  type D1iR1StructuralIdentity,
  createD1iR1Store,
  createTwin,
  evaluateStateReferenceStatus,
  registerStateReference,
} from "./twin-reference-foundation";
import { createD1iR2Store, createExplicitTwinSnapshot, selectCurrentStateReference, supersedeCurrentStateSelection } from "./twin-temporal-governance";
import {
  D1I_R3_AI_CONFLICT_CAN_GOVERN,
  D1I_R3_DEFAULT_CONFLICT_TOLERANCE,
  D1I_R3_MATURITY_STATE,
  D1I_R3_NUMERIC_INEQUALITY_EQUALS_CONFLICT,
  D1I_R4_CANONICAL_PHASE_FROM_REPOSITORY,
  D1I_R4_HANDOFF_READY,
  type D1iR3BasisSide,
  assessStateCompatibility,
  composeMultiSourceState,
  confirmConflict,
  confirmNoConflict,
  conflictStatusAsKnownAt,
  conflictsAsKnownAt,
  createConflictCandidate,
  createD1iR3Store,
  evaluateCompositionStatus,
  evaluateConflictStatus,
  recordConflictDisposition,
  retireComparatorVersion,
  retireRatingSchemeFingerprint,
  withdrawConflictAuthority,
} from "./twin-conflict-composition";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D1iR1Actor = { actorId: "engineer-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authority: "HUMAN" };

function provenance(): D1hProvenanceRef {
  return { tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", actorOrSystem: "inspector-1", timestamp: "2026-06-10T00:00:00.000Z", authority: "HUMAN", version: "1", fingerprint: "prov-fp" };
}

function identity(kind: D1iR1StructuralIdentity["kind"], id: string): D1iR1StructuralIdentity {
  return { kind, id, structuralSystemId: kind === "STRUCTURAL_SYSTEM" ? id : "sys-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", version: "1", lifecycle: "CURRENT", authority: "HUMAN", validationState: "CURRENT", effectiveAt: "2026-01-01T00:00:00.000Z", contentFingerprint: `${kind}-${id}-fp` };
}

function context(): D1hR1ContextRecord {
  return { inspectionContextId: "ctx-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1", inspectionSessionId: "ses-1", purpose: "ROUTINE", scopeStatement: "member scope", inspectedAt: "2026-06-01T00:00:00.000Z", coverageScopeRef: "scope-1", methodRefs: ["visual"], sourceAuthority: "HUMAN", governanceProfileRef: "profile-1", provenance: provenance(), version: "1", status: "RECORDED", declaredTargetIds: ["mem-1", "mem-2"], recordedAt: "2026-06-10T00:00:00.000Z", fingerprint: "ctx-fp", engineeringApproval: false, predecessorId: null };
}

function condition(id: string): D1hR3ConditionState {
  return { recordKind: "CONDITION_STATE", conditionStateId: id, inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", targetKind: "MEMBER", assessmentScope: "member-face", ratingSchemeId: null, schemeVersion: null, schemeFingerprint: null, ratingId: null, ratingValueCode: null, interpretationId: null, assessmentBasisRef: "basis-1", supportingFindingIds: [], supportingMeasurementIds: [], supportingEvidenceIds: [], relevantValidationIds: [], coverageIds: [], coverageLimitations: [], inputValidation: [], allInputsValidated: false, authority: "HUMAN", status: "CURRENT", limitations: "limited access", createdAt: "2026-06-09T00:00:00.000Z", createdBy: "inspector-1", provenance: provenance(), version: "4", fingerprint: `cond-${id}-fp`, supersedesConditionStateId: null, goodCondition: false, structuralAdequacy: false, assetSafe: false, repairRequired: false, sectionPropertyChanged: false, materialPropertyChanged: false, capacityChanged: false, analysisModelChanged: false, supportChanged: false, releaseChanged: false, loadChanged: false, analysisInputCreated: false, repairActionCreated: false };
}

function measurement(id: string, targetId: string, measuredAt: string): D1hR2InspectionMeasurement {
  return { recordKind: "INSPECTION_MEASUREMENT", measurementId: id, inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId, evidenceId: "ev-1", findingId: null, quantity: "crack-width", value: 424242, unit: "mm", location: null, methodRef: "gauge", sourceType: "INSTRUMENT_MEASURED", instrumentRef: "gauge-1", measuredAt, uncertainty: null, accuracy: null, calibrationBasis: null, modelIdentity: null, modelVersion: null, authority: "HUMAN", validationState: "UNVALIDATED", provenance: provenance(), version: "2", fingerprint: `meas-${id}-fp`, supersedesMeasurementId: null, governs: false, instrumentMeasured: true, sectionPropertyUpdated: false, analysisGeometryUpdated: false, capacityChanged: false, materialPropertyChanged: false, analysisModelChanged: false };
}

function finding(): D1hR2StructuralFinding {
  return { recordKind: "STRUCTURAL_FINDING", findingId: "find-1", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", findingType: "CRACKING", location: null, supportingEvidenceIds: [], origin: "HUMAN_RECORDED", authority: "HUMAN", validationState: "UNVALIDATED", createdAt: "2026-06-09T00:00:00.000Z", createdBy: "inspector-1", provenance: provenance(), version: "1", fingerprint: "find-fp", supersedesFindingId: null, governs: false, conditionRating: false, severity: false, badCondition: false, unsafe: false, repairRequired: false, sectionPropertiesChanged: false, materialPropertiesChanged: false, capacityChanged: false, analysisModelChanged: false };
}

function analysis(): D1hR4AnalysisIdentityRef {
  return { analysisResultId: "result-1", analysisModelId: "model-1", analysisModelVersion: "7", analysisModelFingerprint: "model-fp-1", analysisRunId: "run-1", analysisRunFingerprint: "run-fp-1", resultSetId: "set-1", normalizedResultId: "norm-1", resultClass: "GOVERNED_RESULT", authorityState: "VERIFIED_GOVERNED", runStatus: "COMPLETED", resultCategory: "NODAL_DISPLACEMENT", quantity: "displacement", locationKind: "MEMBER_START", loadCaseId: "case-1", combinationId: "comb-1", providerId: "provider-1", providerVersion: "1", providerProvenanceRef: "d1g-provider-provenance", modelValidationEvidenceRef: null, analysisTimestamp: "2026-06-01T00:00:00.000Z", structuralStateRef: "analysis-state", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1" };
}

function catalog(): D1iR1Catalog {
  return { identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("MEMBER", "mem-1"), identity("MEMBER", "mem-2")], contexts: [context()], findings: [finding()], measurements: [measurement("meas-1", "mem-1", "2026-06-01T00:00:00.000Z"), measurement("meas-2", "mem-1", "2026-06-01T00:00:00.000Z"), measurement("meas-x", "mem-2", "2026-06-01T00:00:00.000Z"), measurement("meas-late", "mem-1", "2026-07-01T00:00:00.000Z")], interpretations: [], conditionStates: [condition("cond-1"), condition("cond-2")], analysisResults: [analysis()], upstreamMarks: [] };
}

function boot(clock: { now: string }) {
  const source = catalog();
  const runtime = createD1iR3Store(createD1iR2Store(createD1iR1Store(source, () => clock.now)));
  createTwin(runtime, actor, { twinId: "twin-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", twinScope: "STRUCTURAL_SYSTEM", targetKind: "STRUCTURAL_SYSTEM", targetId: "sys-1", parentStructuralSystemId: null, purpose: "inspection-history", governanceProfileRef: "profile-1", version: "1" });
  return { runtime, source };
}

function pin(runtime: ReturnType<typeof boot>["runtime"], objectType: string, objectId: string, stateClass: string, stateReferenceId: string) {
  return registerStateReference(runtime, actor, { stateReferenceId, twinId: "twin-1", sourceDomain: objectType === "ANALYSIS_RESULT" ? "D1F_ANALYSIS" : "D1H_INSPECTION_CONDITION", sourceObjectType: objectType, sourceObjectId: objectId, stateClass, limitations: "pinned", version: "1" });
}

function side(referenceId: string, overrides: Partial<D1iR3BasisSide> = {}): D1iR3BasisSide {
  return { stateReferenceId: referenceId, quantity: "length", unit: "m", location: "face-a", method: "gauge", descriptiveValue: "12.1", ...overrides };
}

describe("EOS-D1I-R3 state conflict and multi-source composition", () => {
  it("requires explicit comparability and does not turn a numeric difference into a conflict", () => {
    const clock = { now: "2026-06-10T00:00:00.000Z" };
    const { runtime } = boot(clock);
    const left = pin(runtime, "INSPECTION_MEASUREMENT", "meas-1", "MEASURED_STATE", "ref-m1");
    const right = pin(runtime, "INSPECTION_MEASUREMENT", "meas-2", "MEASURED_STATE", "ref-m2");
    const otherTarget = pin(runtime, "INSPECTION_MEASUREMENT", "meas-x", "MEASURED_STATE", "ref-mx");
    const later = pin(runtime, "INSPECTION_MEASUREMENT", "meas-late", "MEASURED_STATE", "ref-mlate");
    const analytical = pin(runtime, "ANALYSIS_RESULT", "result-1", "ANALYTICAL_STATE", "ref-an");
    const observed = pin(runtime, "STRUCTURAL_FINDING", "find-1", "OBSERVED_STATE", "ref-ob");
    const comparable = assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId, { descriptiveValue: "12.1" }), side(right.stateReferenceId, { descriptiveValue: "12.4" })], version: "1" });
    expect(comparable.compatibilityStatus).toBe("COMPARABLE");
    expect(comparable.differenceObserved).toBe(true);
    expect(comparable.conflictCreated).toBe(false);
    expect(runtime.conflicts).toHaveLength(0);
    expect(D1I_R3_NUMERIC_INEQUALITY_EQUALS_CONFLICT).toBe(false);
    expect(D1I_R3_DEFAULT_CONFLICT_TOLERANCE).toBe("NONE");
    expect(assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId, { quantity: "length" }), side(right.stateReferenceId, { quantity: "force", unit: "N" })], version: "1" }).limitations).toBe("QUANTITY_INCOMPATIBLE");
    expect(assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId, { unit: "m" }), side(right.stateReferenceId, { unit: "mm" })], version: "1" }).limitations).toBe("UNIT_INCOMPATIBLE");
    expect(assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId, { location: "face-a" }), side(right.stateReferenceId, { location: "face-b" })], version: "1" }).limitations).toBe("LOCATION_INCOMPATIBLE");
    expect(assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, otherTarget.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId), side(otherTarget.stateReferenceId)], version: "1" }).limitations).toBe("TARGET_MISMATCH");
    expect(assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, later.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId), side(later.stateReferenceId)], version: "1" }).limitations).toBe("TEMPORAL_CONTEXT_MISMATCH");
    expect(assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId, { method: "gauge" }), side(right.stateReferenceId, { method: "visual" })], version: "1" }).limitations).toBe("MEASUREMENT_BASIS_UNRESOLVED");
    const unresolvedAxis = assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [analytical.stateReferenceId, left.stateReferenceId], comparisonPurpose: "predicted-measured", basis: [side(analytical.stateReferenceId, { loadCaseId: "case-1", combinationId: "comb-1", analysisLocation: "start", sign: "positive" }), side(left.stateReferenceId, { loadCaseId: "case-1", combinationId: "comb-1", analysisLocation: "start", sign: "positive" })], version: "1" });
    expect(unresolvedAxis.limitations).toBe("AXIS_SIGN_UNRESOLVED");
    expect(unresolvedAxis.conflictCreated).toBe(false);
    const caseMismatch = assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [analytical.stateReferenceId, left.stateReferenceId], comparisonPurpose: "predicted-measured", basis: [side(analytical.stateReferenceId, { axis: "local-x", sign: "positive", loadCaseId: "case-1", combinationId: "comb-1", analysisLocation: "start", descriptiveValue: "12.1" }), side(left.stateReferenceId, { axis: "local-x", sign: "positive", loadCaseId: "case-2", combinationId: "comb-1", analysisLocation: "start", descriptiveValue: "12.4" })], version: "1" });
    expect(caseMismatch.limitations).toBe("ANALYSIS_CASE_MISMATCH");
    expect(caseMismatch.differenceObserved).toBe(false);
    expect(observed.stateReferenceId).not.toBe(left.stateReferenceId);
    expect(runtime.conflicts).toHaveLength(0);
  });

  it("keeps condition schemes and fingerprints incomparable without creating a conflict", () => {
    const { runtime } = boot({ now: "2026-06-10T00:00:00.000Z" });
    const left = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-c1");
    const right = pin(runtime, "CONDITION_STATE", "cond-2", "CONDITION_STATE", "ref-c2");
    const cross = assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "condition", basis: [{ stateReferenceId: left.stateReferenceId, ratingSchemeId: "scheme-a", schemeVersion: "1", schemeFingerprint: "fp-a" }, { stateReferenceId: right.stateReferenceId, ratingSchemeId: "scheme-b", schemeVersion: "1", schemeFingerprint: "fp-b" }], version: "1" });
    const fingerprint = assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "condition", basis: [{ stateReferenceId: left.stateReferenceId, ratingSchemeId: "scheme-a", schemeVersion: "1", schemeFingerprint: "fp-a" }, { stateReferenceId: right.stateReferenceId, ratingSchemeId: "scheme-a", schemeVersion: "1", schemeFingerprint: "fp-other" }], version: "1" });
    expect(cross.compatibilityStatus).toBe("NOT_COMPARABLE");
    expect(fingerprint.compatibilityStatus).toBe("NOT_COMPARABLE");
    expect(runtime.conflicts).toHaveLength(0);
  });

  it("separates candidates, human confirmation, disposition, and R2 selection", () => {
    const clock = { now: "2026-06-12T00:00:00.000Z" };
    const { runtime, source } = boot(clock);
    const left = pin(runtime, "INSPECTION_MEASUREMENT", "meas-1", "MEASURED_STATE", "ref-m1");
    const right = pin(runtime, "INSPECTION_MEASUREMENT", "meas-2", "MEASURED_STATE", "ref-m2");
    const analytical = pin(runtime, "ANALYSIS_RESULT", "result-1", "ANALYTICAL_STATE", "ref-an");
    const observed = pin(runtime, "STRUCTURAL_FINDING", "find-1", "OBSERVED_STATE", "ref-ob");
    const conditionRef = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-c1");
    const replacement = pin(runtime, "CONDITION_STATE", "cond-2", "CONDITION_STATE", "ref-c2");
    const assessment = assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId), side(right.stateReferenceId, { descriptiveValue: "12.4" })], version: "1" });
    const candidate = createConflictCandidate(runtime, actor, { compatibilityAssessmentId: assessment.compatibilityAssessmentId, candidateBasis: "values differ", version: "1" });
    expect(candidate.status).toBe("CANDIDATE");
    expect(candidate.engineeringTruth).toBe(false);
    const aiCandidate = createConflictCandidate(runtime, { ...actor, actorId: "advisor", authority: "AI" }, { compatibilityAssessmentId: assessment.compatibilityAssessmentId, candidateBasis: "ai suggestion", version: "1" });
    expect(aiCandidate.status).toBe("CANDIDATE");
    expect(() => confirmConflict(runtime, { ...actor, authority: "AI" }, { conflictId: aiCandidate.conflictId, reviewBasis: "ai", reviewScope: "review", limitations: "no", version: "1" })).toThrow("UNAUTHORIZED");
    expect(D1I_R3_AI_CONFLICT_CAN_GOVERN).toBe(false);
    const selected = selectCurrentStateReference(runtime, actor, { twinId: "twin-1", targetId: "mem-1", stateClass: "CONDITION_STATE", sourceDomain: "D1H_INSPECTION_CONDITION", purpose: "review", stateReferenceId: conditionRef.stateReferenceId, selectionBasis: "human-review", limitations: "lane", version: "1" });
    const snapshot = createExplicitTwinSnapshot(runtime, actor, { twinId: "twin-1", snapshotPurpose: "HISTORICAL_RECORD", declaredScope: { targetIds: ["mem-1"], stateClasses: ["MEASURED_STATE"], sourceDomains: [], purpose: "review" }, stateReferenceIds: [left.stateReferenceId], limitations: "frozen", version: "1" });
    const snapshotIds = [...snapshot.stateReferenceIds];
    clock.now = "2026-06-20T00:00:00.000Z";
    const confirmed = confirmConflict(runtime, actor, { conflictId: candidate.conflictId, reviewBasis: "human inspection", reviewScope: "review", limitations: "not truth", version: "1" });
    expect(candidate.status).toBe("CANDIDATE");
    expect(confirmed.conflict.status).toBe("HUMAN_CONFIRMED_CONFLICT");
    expect(conflictStatusAsKnownAt(runtime, candidate.conflictId, "2026-06-15T00:00:00.000Z")).toBe("CANDIDATE");
    expect(conflictsAsKnownAt(runtime, "2026-06-15T00:00:00.000Z").some((row) => row.status === "HUMAN_CONFIRMED_CONFLICT")).toBe(false);
    const noConflict = confirmNoConflict(runtime, actor, { conflictId: aiCandidate.conflictId, reviewBasis: "parallel evidence", reviewScope: "review", limitations: "not safe", version: "1" });
    expect(noConflict.conflict.status).toBe("HUMAN_CONFIRMED_NOT_CONFLICT");
    const disposition = recordConflictDisposition(runtime, actor, { conflictId: confirmed.conflict.conflictId, reviewId: confirmed.review.reviewId, purpose: "engineering-review-context", outcome: "REFER_TO_CURRENT_STATE_SELECTION_WORKFLOW", limitations: "purpose only", version: "1" });
    expect(disposition.changesCurrentSelection).toBe(false);
    expect(selected.selectedStateReferenceId).toBe(conditionRef.stateReferenceId);
    expect(selected.status).toBe("ACTIVE");
    clock.now = "2026-06-21T00:00:00.000Z";
    const changed = supersedeCurrentStateSelection(runtime, actor, selected.selectionId, { twinId: "twin-1", targetId: "mem-1", stateClass: "CONDITION_STATE", sourceDomain: "D1H_INSPECTION_CONDITION", purpose: "review", stateReferenceId: replacement.stateReferenceId, selectionBasis: "separate-r2", limitations: "after review", version: "1" });
    expect(changed.selectionBasis).toBe("separate-r2");
    expect(runtime.reviews.some((row) => row.reviewId === confirmed.review.reviewId)).toBe(true);
    expect(runtime.selectionHistory.some((row) => row.subjectId === changed.selectionId)).toBe(true);
    expect(snapshot.stateReferenceIds).toEqual(snapshotIds);
    const composition = composeMultiSourceState(runtime, actor, { twinId: "twin-1", declaredScope: { targetIds: ["sys-1", "mem-1"], stateClasses: ["ANALYTICAL_STATE", "MEASURED_STATE", "OBSERVED_STATE", "CONDITION_STATE"], purpose: "review" }, stateReferenceIds: [right.stateReferenceId, analytical.stateReferenceId, observed.stateReferenceId, conditionRef.stateReferenceId, left.stateReferenceId], selectionIds: [changed.selectionId], snapshotId: snapshot.snapshotId, compatibilityAssessmentIds: [assessment.compatibilityAssessmentId], conflictIds: [candidate.conflictId, confirmed.conflict.conflictId], limitations: "preserve all", version: "1" });
    const reversed = composeMultiSourceState(runtime, actor, { twinId: "twin-1", declaredScope: composition.declaredScope, stateReferenceIds: [...composition.stateReferenceIds].reverse(), selectionIds: composition.selectionIds, snapshotId: snapshot.snapshotId, compatibilityAssessmentIds: composition.compatibilityAssessmentIds, conflictIds: [...composition.conflictIds].reverse(), limitations: "preserve all", version: "1" });
    expect(reversed.fingerprint).toBe(composition.fingerprint);
    expect(composition.winningSourceId).toBeNull();
    expect(composition.averagedValue).toBeNull();
    expect(composition.stateReferenceIds).toHaveLength(5);
    expect(JSON.stringify(composition)).not.toContain("424242");
    expect(candidate.fingerprint).not.toBe(confirmed.conflict.fingerprint);
    expect(source.conditionStates[0]!.capacityChanged).toBe(false);
    expect(source.analysisResults[0]!.analysisModelVersion).toBe("7");
    expect(confirmed.conflict.snapshotId).toBeNull();
  });

  it("reconstructs conflict history without rewriting earlier knowledge, snapshots, or sources", () => {
    const clock = { now: "2026-06-10T00:00:00.000Z" };
    const { runtime, source } = boot(clock);
    const left = pin(runtime, "INSPECTION_MEASUREMENT", "meas-1", "MEASURED_STATE", "ref-m1");
    const right = pin(runtime, "INSPECTION_MEASUREMENT", "meas-2", "MEASURED_STATE", "ref-m2");
    const conditionRef = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-c1");
    const replacement = pin(runtime, "CONDITION_STATE", "cond-2", "CONDITION_STATE", "ref-c2");
    const before = conflictsAsKnownAt(runtime, "2026-06-05T00:00:00.000Z");
    const assessment = assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId, { ratingSchemeId: "scheme-a", schemeVersion: "1", schemeFingerprint: "scheme-fp" }), side(right.stateReferenceId, { descriptiveValue: "12.4", ratingSchemeId: "scheme-a", schemeVersion: "1", schemeFingerprint: "scheme-fp" })], version: "1" });
    const candidate = createConflictCandidate(runtime, actor, { compatibilityAssessmentId: assessment.compatibilityAssessmentId, candidateBasis: "late comparison", snapshotId: createExplicitTwinSnapshot(runtime, actor, { twinId: "twin-1", snapshotPurpose: "HISTORICAL_RECORD", declaredScope: { targetIds: ["mem-1"], stateClasses: ["MEASURED_STATE"], sourceDomains: [], purpose: "review" }, stateReferenceIds: [left.stateReferenceId], limitations: "old", version: "1" }).snapshotId, version: "1" });
    const oldSnapshot = runtime.snapshots[0]!;
    const oldIds = [...oldSnapshot.stateReferenceIds];
    expect(before).toHaveLength(0);
    expect(conflictsAsKnownAt(runtime, "2026-06-05T00:00:00.000Z")).toHaveLength(0);
    clock.now = "2026-06-20T00:00:00.000Z";
    const confirmed = confirmConflict(runtime, actor, { conflictId: candidate.conflictId, reviewBasis: "later", reviewScope: "review", limitations: "later", version: "1" });
    const disposition = recordConflictDisposition(runtime, actor, { conflictId: confirmed.conflict.conflictId, reviewId: confirmed.review.reviewId, purpose: "later-purpose", outcome: "DEFER", limitations: "later", version: "1" });
    expect(runtime.dispositions.filter((row) => row.recordedAt <= "2026-06-15T00:00:00.000Z")).toHaveLength(0);
    expect(disposition.recordedAt).toBe("2026-06-20T00:00:00.000Z");
    expect(oldSnapshot.stateReferenceIds).toEqual(oldIds);
    expect(candidate.snapshotId).toBe(oldSnapshot.snapshotId);
    source.measurements[0]!.fingerprint = "changed";
    evaluateStateReferenceStatus(runtime, left.stateReferenceId);
    expect(evaluateConflictStatus(runtime, candidate.conflictId)).toBe("STALE");
    expect(candidate.status).toBe("CANDIDATE");
    expect(candidate.stateReferenceIds).toContain(left.stateReferenceId);
    const selected = selectCurrentStateReference(runtime, actor, { twinId: "twin-1", targetId: "mem-1", stateClass: "CONDITION_STATE", sourceDomain: "D1H_INSPECTION_CONDITION", purpose: "review", stateReferenceId: conditionRef.stateReferenceId, selectionBasis: "lane", limitations: "lane", version: "1" });
    const composition = composeMultiSourceState(runtime, actor, { twinId: "twin-1", declaredScope: { targetIds: ["mem-1"], stateClasses: ["MEASURED_STATE", "CONDITION_STATE"], purpose: "review" }, stateReferenceIds: [right.stateReferenceId, conditionRef.stateReferenceId], selectionIds: [selected.selectionId], limitations: "depends on selection", version: "1" });
    supersedeCurrentStateSelection(runtime, actor, selected.selectionId, { twinId: "twin-1", targetId: "mem-1", stateClass: "CONDITION_STATE", sourceDomain: "D1H_INSPECTION_CONDITION", purpose: "review", stateReferenceId: replacement.stateReferenceId, selectionBasis: "replacement", limitations: "new", version: "1" });
    expect(evaluateCompositionStatus(runtime, composition.compositionId)).toBe("STALE");
    expect(composition.stateReferenceIds).toEqual([conditionRef.stateReferenceId, right.stateReferenceId].sort());
    retireComparatorVersion(runtime, assessment.comparatorVersion);
    expect(evaluateConflictStatus(runtime, confirmed.conflict.conflictId)).toBe("STALE");
    retireRatingSchemeFingerprint(runtime, "scheme-fp");
    expect(runtime.conflictHistory.some((row) => row.subjectId === candidate.conflictId && row.action === "STALE")).toBe(true);
    withdrawConflictAuthority(runtime, actor.actorId);
    expect(runtime.conflictHistory.some((row) => row.subjectKind === "REVIEW" && row.action === "STALE")).toBe(true);
    expect(left.fingerprint).toBe(left.fingerprint);
    expect(source.analysisResults[0]!.analysisModelId).toBe("model-1");
    expect(() => assessStateCompatibility(runtime, { ...actor, projectId: "project-2" }, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId), side(right.stateReferenceId)], version: "1" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => createConflictCandidate(runtime, { ...actor, tenantId: "tenant-2" }, { compatibilityAssessmentId: assessment.compatibilityAssessmentId, candidateBasis: "cross", version: "1" })).toThrow("CROSS_TENANT_OPERATION");
    expect(() => confirmConflict(runtime, actor, { conflictId: candidate.conflictId, reviewBasis: "x", reviewScope: "review", limitations: "x", version: "1", reviewedAt: "2020-01-01T00:00:00.000Z" } as never)).toThrow("TEMPORAL_HISTORY_TAMPERING_REJECTED");
    expect(() => assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [left.stateReferenceId, right.stateReferenceId], comparisonPurpose: "review", basis: [side(left.stateReferenceId), side(right.stateReferenceId)], version: "1", expression: "a > b" })).toThrow("ARBITRARY_COMPARISON_EXPRESSION");
  });

  it("keeps the engineering boundary closed and names the repository R4 phase", () => {
    const source = readFileSync(join(here, "twin-conflict-composition.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_R3_STATE_CONFLICT_MULTI_SOURCE_COMPOSITION.md"), "utf8");
    expect(source).not.toMatch(/percentDifference|majorityVote|eval\(|compareAnyStates|healthScore/);
    expect(scanAnalysisFormulaBypass(join(here, "twin-conflict-composition.ts"), source)).toEqual([]);
    expect(scanAnalysisFormulaBypass(join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_R3_STATE_CONFLICT_MULTI_SOURCE_COMPOSITION.md"), doc)).toEqual([]);
    expect(D1I_R3_MATURITY_STATE).toBe("STRUCTURAL_DIGITAL_TWIN_STATE_CONFLICT_MULTI_SOURCE_COMPOSITION_RUNTIME_IMPLEMENTED");
    expect(D1I_R4_CANONICAL_PHASE_FROM_REPOSITORY).toBe("EOS-D1I-R4-EXTERNAL-TELEMETRY-MONITORING-REFERENCE-INTERFACE");
    expect(D1I_R4_HANDOFF_READY).toBe(true);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_CONFLICT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_AUTOMATIC_TRUTH_SELECTION")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_TELEMETRY")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
