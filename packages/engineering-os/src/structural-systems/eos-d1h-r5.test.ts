import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CANONICAL_INTERNAL_UNITS, D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED } from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  CANONICAL_NEXT_IMPLEMENTATION_PHASE,
  D1H_ANALYSIS_LINK_RUNTIME_COUNT,
  D1H_AUTOMATIC_RATING_ENGINE_COUNT,
  D1H_CAPACITY_ASSESSMENT_RUNTIME_COUNT,
  D1H_CAUSAL_DIAGNOSIS_ENGINE_COUNT,
  D1H_CHANGE_EVIDENCE_RUNTIME_COUNT,
  D1H_CONDITION_CONTINUITY_RUNTIME_COUNT,
  D1H_CONDITION_RATING_RUNTIME_COUNT,
  D1H_CONDITION_STATE_RUNTIME_COUNT,
  D1H_DIGITAL_TWIN_RUNTIME_COUNT,
  D1H_ENGINEERING_INTERPRETATION_RUNTIME_COUNT,
  D1H_EVIDENCE_FOUNDATION_RUNTIME_COUNT,
  D1H_FINDING_ASSOCIATION_RUNTIME_COUNT,
  D1H_HUMAN_VALIDATION_RUNTIME_COUNT,
  D1H_MEASUREMENT_COMPARISON_RUNTIME_COUNT,
  D1H_MEASUREMENT_RUNTIME_COUNT,
  D1H_METHOD_CONFORMANCE_VALIDATION_COUNT,
  D1H_NEW_ENGINEERING_FORMULA_COUNT,
  D1H_R5_AI_GOVERNING_AUTHORITY_COUNT,
  D1H_R5_DEFAULT_CONDITION_RATING_SCHEME,
  D1H_R5_FINAL_MATURITY_STATE,
  D1H_R5_HISTORICAL_RATING_FLOATS_TO_CURRENT_SCHEME,
  D1H_RECORD_LEVEL_HUMAN_VALIDATION_RUNTIME_COUNT,
  D1H_SOFTWARE_ENGINEER_VALIDATION_COUNT,
  D1H_STRUCTURAL_ADEQUACY_RUNTIME_COUNT,
  D1H_STRUCTURAL_FINDING_RUNTIME_COUNT,
  D1H_TRACK_STATUS,
  D1I_CAN_MUTATE_D1H_HISTORY,
  D1I_REAUTHORS_D1H_CONDITION_STATES,
  D1I_REAUTHORS_D1H_EVIDENCE,
  D1I_REAUTHORS_D1H_FINDINGS,
  D1I_REAUTHORS_D1H_TEMPORAL_HISTORY,
  D2_STARTED_BY_D1H_CLOSEOUT,
  POST_D1H_NEXT_TRACK,
  RATING_SCHEME_CONTENT_IMMUTABLE_PER_ID_VERSION,
  d1hCapabilityManifestReconciled,
  d1hCloseoutHandoff,
  d1hValidationMatrixReconciled,
} from "./inspection-closeout";
import {
  createD1hR3Store,
  recordConditionRating,
  recordConditionState,
  recordEngineeringInterpretation,
  registerConditionRatingScheme,
  retireConditionRatingScheme,
  selectRatingFromMeasurement,
  type D1hR3RatingInput,
  type D1hR3SchemeInput,
} from "./inspection-condition";
import {
  D1H_R1_EVIDENCE_CAN_EXIST_WITHOUT_FINDING,
  D1H_R1_ORPHAN_BOUNDED_REGION_ALLOWED,
  INACCESSIBLE_EQUALS_INSPECTED,
  bindStructuralInspectionTarget,
  createD1hR1Store,
  invalidateStructuralInspectionRecord,
  recordStructuralInspectionContext,
  recordStructuralInspectionCoverage,
  recordStructuralInspectionEvidence,
  type D1hR1CatalogObject,
  type D1hR1EvidenceInput,
  type D1hR1TargetInput,
} from "./inspection-evidence";
import {
  D1H_R2_NEGATIVE_OBSERVATION_CREATES_FINDING,
  correctInspectionMeasurement,
  createD1hR2Store,
  propagateR1EvidenceStaleness,
  recordHumanValidation,
  recordInspectionMeasurement,
  recordStructuralFinding,
  type D1hR2FindingInput,
  type D1hR2MeasurementInput,
} from "./inspection-finding";
import { D1H_R3_NO_FINDING_EQUALS_GOOD_CONDITION, propagateConditionStaleness } from "./inspection-condition";
import {
  D1H_R5_SAME_SCHEME_ID_VERSION_DIFFERENT_FINGERPRINT_COMPARABLE,
  TEMPORAL_RATING_COMPARABILITY_REQUIRES_SCHEME_FINGERPRINT_MATCH,
  compareConditionRatings,
  computeDeteriorationRate,
  confirmAssociationFromAi,
  createD1hR4Store,
  diagnoseCause,
  extrapolateFutureCondition,
  mergeFindingRecords,
  propagateTemporalStaleness,
  ratingSchemesHistoricallyComparable,
  recordAnalysisResultLink,
  recordChangeEvidence,
  recordConditionContinuity,
  recordFindingAssociation,
  recordMeasurementComparison,
  selectLatestAnalysisResult,
  updateAnalysisModelFromCondition,
  withdrawAssociationConfirmation,
  type D1hR4AnalysisIdentityRef,
  type D1hR4MeasurementBasis,
} from "./inspection-temporal";

const here = dirname(fileURLToPath(import.meta.url));

function object(kind: D1hR1CatalogObject["kind"], id: string, overrides: Partial<D1hR1CatalogObject> = {}): D1hR1CatalogObject {
  return { kind, id, structuralSystemId: "sys-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", version: "1", lifecycle: "CURRENT", ...overrides };
}

function catalog() {
  return {
    objects: [object("STRUCTURAL_SYSTEM", "sys-1"), object("MEMBER", "mem-1")],
    sessions: [
      { inspectionSessionId: "ses-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1" },
      { inspectionSessionId: "ses-2", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1" },
    ],
    artifacts: [{ artifactId: "art-photo", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-photo" }],
    analysisResults: [{ analysisResultId: "result-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1" }],
  };
}

function provenance(version = "1") {
  return { tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", actorOrSystem: "engineer-1", timestamp: "2026-10-18T00:00:00.000Z", authority: "HUMAN", version, fingerprint: "pending" };
}

function location(id = "loc-1") {
  return { locationId: id, locationKind: "MEMBER_STATION_OR_RANGE" as const, description: "explicit station", explicit: true as const, aiSuggested: false, confirmed: true, inferredBy: null };
}

function evidenceInput(overrides: Partial<D1hR1EvidenceInput> = {}): D1hR1EvidenceInput {
  return { evidenceId: "ev-1", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", sourceClass: "PHOTO", sourceArtifactId: "art-photo", analysisResultId: null, priorEvidenceId: null, derivedFromEvidenceId: null, capturedAt: "2026-01-01T02:00:00.000Z", capturedBy: "inspector-1", location: location(), methodRef: "photo", unit: null, authority: "HUMAN_OBSERVATION", modelIdentity: null, modelVersion: null, executionFingerprint: null, provenance: provenance(), version: "1", recordedAt: "2026-01-01T02:00:00.000Z", explicitNegativeObservation: false, negativeScopeStatement: null, ...overrides };
}

function targetInput(id: string): D1hR1TargetInput {
  return { targetId: id, targetKind: "MEMBER", structuralSystemId: "sys-1", memberId: id, connectionId: null, supportId: null, foundationIdentity: null, parentTargetKind: null, parentTargetId: null, regionRef: null, candidateOnly: false, inferredBy: null };
}

function contextInput(id: string, sessionId: string, inspectedAt: string) {
  return { inspectionContextId: id, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1", inspectionSessionId: sessionId, purpose: "ROUTINE" as const, scopeStatement: "member scope", inspectedAt, coverageScopeRef: "scope-1", methodRefs: ["visual"], sourceAuthority: "HUMAN", governanceProfileRef: "profile-1", provenance: provenance(), version: "1", status: "RECORDED" as const, declaredTargetIds: ["mem-1"], recordedAt: inspectedAt };
}

function findingInput(overrides: Partial<D1hR2FindingInput> = {}): D1hR2FindingInput {
  return { findingId: "find-1", inspectionContextId: "ctx-1", targetId: "mem-1", findingType: "CRACKING", location: location(), supportingEvidenceIds: ["ev-1"], origin: "HUMAN_RECORDED", authority: "HUMAN", createdAt: "2026-01-01T03:00:00.000Z", createdBy: "inspector-1", provenance: provenance(), version: "1", modelIdentity: null, modelVersion: null, executionFingerprint: null, ...overrides };
}

function measurementInput(overrides: Partial<D1hR2MeasurementInput> = {}): D1hR2MeasurementInput {
  return { measurementId: "meas-1", inspectionContextId: "ctx-1", targetId: "mem-1", evidenceId: "ev-1", findingId: "find-1", quantity: "force", value: 1000, unit: CANONICAL_INTERNAL_UNITS.force, dimensionless: false, location: location(), methodRef: "gauge", sourceType: "INSTRUMENT_MEASURED", instrumentRef: "gauge-1", measuredAt: "2026-01-01T04:00:00.000Z", uncertainty: null, accuracy: null, calibrationBasis: "gauge-zero", modelIdentity: null, modelVersion: null, authority: "HUMAN", provenance: provenance(), version: "1", ...overrides };
}

const validators = [{ validatorId: "rev-1", role: "ENGINEER_REVIEWER" as const, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authorized: true }];

function basis(): D1hR4MeasurementBasis {
  const calibration = "gauge-zero";
  return { referenceDatum: calibration, gaugeLength: calibration, calibrationBasis: calibration, orientation: calibration, surfaceFace: calibration, memberStation: calibration, coordinateSystem: calibration, measurementSetup: calibration };
}

function schemeInput(overrides: Partial<D1hR3SchemeInput> = {}): D1hR3SchemeInput {
  return { ratingSchemeId: "TEST_CONDITION_SCHEME_V1", schemeVersion: "1", profileRef: "test-profile", schemeAuthority: "HUMAN", applicability: { projectId: "project-1", assetOwnerRef: null, clientRef: null, inspectionStandardRef: "test-standard", assetClass: null, targetKinds: ["MEMBER"] }, ratingValueDefinitions: [{ code: "1", label: "test label one", descriptionRef: null, explicitOrder: 1 }, { code: "2", label: "test label two", descriptionRef: null, explicitOrder: 2 }], provenance: provenance(), status: "TEST_ONLY", ...overrides };
}

function identity(overrides: Partial<D1hR4AnalysisIdentityRef> = {}): D1hR4AnalysisIdentityRef {
  return { analysisResultId: "result-1", analysisModelId: "model-1", analysisModelVersion: "1", analysisModelFingerprint: "model-fp-1", analysisRunId: "run-1", analysisRunFingerprint: "run-fp-run-1", resultSetId: "set-run-1", normalizedResultId: "norm-run-1", resultClass: "NORMALIZED_RESULT", authorityState: "VERIFIED_GOVERNED", runStatus: "COMPLETED", resultCategory: "NODAL_DISPLACEMENT", quantity: "force", locationKind: "MEMBER_START", loadCaseId: "case-1", combinationId: "comb-1", providerId: "provider-1", providerVersion: "1", providerProvenanceRef: "d1g-provider-provenance", modelValidationEvidenceRef: null, analysisTimestamp: "2025-01-01T00:00:00.000Z", structuralStateRef: "analysis-state", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1", ...overrides };
}

function confirmMeasurement(bundle: ReturnType<typeof base>, prefix: string, measurementId: string, contextId: string) {
  const subjects = ["MEASUREMENT_VALUE", "MEASUREMENT_UNIT", "MEASUREMENT_LOCATION", "MEASUREMENT_METHOD"] as const;
  subjects.forEach((subjectType, index) => {
    recordHumanValidation(bundle.r1, bundle.r2, validators, { validationId: `${prefix}-${index}`, inspectionContextId: contextId, subjectType, subjectId: measurementId, scopeStatement: subjectType, validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-06-01T05:00:00.000Z", decision: "CONFIRMED", limitations: subjectType, authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null });
  });
}

function base() {
  const r1 = createD1hR1Store();
  const source = catalog();
  recordStructuralInspectionContext(r1, source, contextInput("ctx-1", "ses-1", "2026-01-01T00:00:00.000Z"));
  recordStructuralInspectionContext(r1, source, contextInput("ctx-2", "ses-2", "2026-06-01T00:00:00.000Z"));
  bindStructuralInspectionTarget(r1, source, "ctx-1", targetInput("mem-1"));
  bindStructuralInspectionTarget(r1, source, "ctx-2", targetInput("mem-1"));
  recordStructuralInspectionCoverage(r1, { coverageId: "cov-1", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "visible face", authority: "HUMAN", provenance: provenance(), version: "1", recordedAt: "2026-01-01T01:00:00.000Z" });
  recordStructuralInspectionCoverage(r1, { coverageId: "cov-2", inspectionContextId: "ctx-2", inspectionSessionId: "ses-2", targetId: "mem-1", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "visible face", authority: "HUMAN", provenance: provenance(), version: "1", recordedAt: "2026-06-01T01:00:00.000Z" });
  recordStructuralInspectionEvidence(r1, source, evidenceInput());
  recordStructuralInspectionEvidence(r1, source, evidenceInput({ evidenceId: "ev-2", inspectionContextId: "ctx-2", inspectionSessionId: "ses-2", capturedAt: "2026-06-01T02:00:00.000Z", recordedAt: "2026-06-01T02:00:00.000Z" }));
  const r2 = createD1hR2Store();
  const r3 = createD1hR3Store();
  const r4 = createD1hR4Store();
  recordStructuralFinding(r1, r2, findingInput());
  recordInspectionMeasurement(r1, r2, measurementInput());
  recordHumanValidation(r1, r2, validators, { validationId: "val-find-1", inspectionContextId: "ctx-1", subjectType: "FINDING_CLASSIFICATION", subjectId: "find-1", scopeStatement: "classification only", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-01-01T05:00:00.000Z", decision: "CONFIRMED", limitations: "classification only", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null });
  registerConditionRatingScheme(r1, r3, "ctx-1", schemeInput());
  return { r1, r2, r3, r4, source };
}

function rate(bundle: ReturnType<typeof base>, overrides: Partial<D1hR3RatingInput> = {}) {
  return recordConditionRating(bundle.r1, bundle.r2, bundle.r3, { ratingId: "rate-1", inspectionContextId: "ctx-1", targetId: "mem-1", ratingSchemeId: "TEST_CONDITION_SCHEME_V1", schemeVersion: "1", ratingValueCode: "1", interpretationId: "int-1", assessmentBasisRef: "inspection-note:n1", supportingEvidenceIds: ["ev-1"], supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], limitations: "visible face only", assessedAt: "2026-01-01T07:00:00.000Z", authority: "HUMAN", provenance: provenance(), version: "1", imported: false, ...overrides });
}

function chain() {
  const bundle = base();
  confirmMeasurement(bundle, "val-m1", "meas-1", "ctx-1");
  recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, { interpretationId: "int-1", inspectionContextId: "ctx-1", targetId: "mem-1", supportingEvidenceIds: ["ev-1"], supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], supportingValidationIds: ["val-find-1"], authorId: "engineer-1", reviewerId: null, statement: "T1 observation is recorded for the declared member scope.", basisRefs: ["inspection-note:n1"], limitations: "visible face only", assumptions: "no hidden face", createdAt: "2026-01-01T06:00:00.000Z", authority: "HUMAN", provenance: provenance(), version: "1" });
  const rating1 = rate(bundle);
  const state1 = recordConditionState(bundle.r1, bundle.r2, bundle.r3, { conditionStateId: "state-1", inspectionContextId: "ctx-1", targetId: "mem-1", assessmentScope: "member-face-t1", ratingId: "rate-1", interpretationId: "int-1", assessmentBasisRef: "inspection-note:n1", supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], supportingEvidenceIds: ["ev-1"], relevantValidationIds: ["val-find-1"], coverageIds: ["cov-1"], authority: "HUMAN", status: "CURRENT", limitations: "visible face only", createdAt: "2026-01-01T08:00:00.000Z", createdBy: "engineer-1", provenance: provenance(), version: "1" });
  const t1 = JSON.stringify(state1);
  recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-2", inspectionContextId: "ctx-2", supportingEvidenceIds: ["ev-2"], createdAt: "2026-06-01T03:00:00.000Z" }));
  recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-2", inspectionContextId: "ctx-2", evidenceId: "ev-2", findingId: "find-2", value: 2500, measuredAt: "2026-06-01T04:00:00.000Z" }));
  confirmMeasurement(bundle, "val-m2", "meas-2", "ctx-2");
  recordHumanValidation(bundle.r1, bundle.r2, validators, { validationId: "val-find-2", inspectionContextId: "ctx-2", subjectType: "FINDING_CLASSIFICATION", subjectId: "find-2", scopeStatement: "classification only", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-06-01T05:30:00.000Z", decision: "CONFIRMED", limitations: "classification only", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null });
  recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, { interpretationId: "int-2", inspectionContextId: "ctx-2", targetId: "mem-1", supportingEvidenceIds: ["ev-2"], supportingFindingIds: ["find-2"], supportingMeasurementIds: ["meas-2"], supportingValidationIds: ["val-find-2"], authorId: "engineer-1", reviewerId: null, statement: "T2 observation is a separate finding record.", basisRefs: ["inspection-note:n2"], limitations: "visible face only", assumptions: "no hidden face", createdAt: "2026-06-01T06:00:00.000Z", authority: "HUMAN", provenance: provenance(), version: "1" });
  rate(bundle, { ratingId: "rate-2", inspectionContextId: "ctx-2", ratingValueCode: "2", interpretationId: "int-2", assessmentBasisRef: "inspection-note:n2", supportingEvidenceIds: ["ev-2"], supportingFindingIds: ["find-2"], supportingMeasurementIds: ["meas-2"], assessedAt: "2026-06-01T07:00:00.000Z" });
  const state2 = recordConditionState(bundle.r1, bundle.r2, bundle.r3, { conditionStateId: "state-2", inspectionContextId: "ctx-2", targetId: "mem-1", assessmentScope: "member-face-t2", ratingId: "rate-2", interpretationId: "int-2", assessmentBasisRef: "inspection-note:n2", supportingFindingIds: ["find-2"], supportingMeasurementIds: ["meas-2"], supportingEvidenceIds: ["ev-2"], relevantValidationIds: ["val-find-2"], coverageIds: ["cov-2"], authority: "HUMAN", status: "CURRENT", limitations: "visible face only", createdAt: "2026-06-01T08:00:00.000Z", createdBy: "engineer-1", provenance: provenance(), version: "1" });
  const association = recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, { associationId: "assoc-1", sourceFindingId: "find-1", relatedFindingId: "find-2", targetId: "mem-1", associationType: "ONE_TO_ONE", associationStatus: "HUMAN_CONFIRMED_SAME_CONDITION", basisRefs: [{ basisId: "b1", kind: "LOCATION", ref: "loc-1" }], createdBy: "engineer-1", authority: "HUMAN", validatedBy: "rev-1", validationRef: "val-assoc", limitations: "human confirmation is not an identity proof", recordCreatedAt: "2026-06-02T00:00:00.000Z", provenance: provenance(), version: "1" });
  const comparison = recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, { comparisonId: "cmp-1", priorMeasurementId: "meas-1", currentMeasurementId: "meas-2", priorBasis: basis(), currentBasis: basis(), limitations: "descriptive difference only", authority: "HUMAN", recordCreatedAt: "2026-06-02T00:00:00.000Z", provenance: provenance(), version: "1" });
  const change = recordChangeEvidence(bundle.r4, { changeEvidenceId: "change-1", comparisonId: "cmp-1", limitations: "observation only", recordCreatedAt: "2026-06-02T01:00:00.000Z", provenance: provenance(), version: "1" });
  recordConditionContinuity(bundle.r1, bundle.r3, bundle.r4, { continuityId: "cont-1", targetId: "mem-1", priorConditionStateId: "state-1", currentConditionStateId: "state-2", associationIds: ["assoc-1"], comparisonIds: ["cmp-1"], continuityStatus: "RECORDED", authority: "HUMAN", limitations: "same scheme fingerprint is not a deterioration conclusion", recordCreatedAt: "2026-06-02T02:00:00.000Z", provenance: provenance(), version: "1" });
  const link = recordAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, [identity()], bundle.r4, { analysisLinkId: "link-1", inspectionContextId: "ctx-2", targetId: "mem-1", evidenceIds: ["ev-2"], findingIds: ["find-2"], measurementIds: ["meas-2"], conditionStateIds: ["state-2"], analysisResultId: "result-1", inspectionStructuralStateRef: "inspection-state", linkPurpose: "CONTEXT_REFERENCE", measurementLocationId: "loc-1", limitations: "exact historical result", authority: "HUMAN", recordCreatedAt: "2026-06-02T03:00:00.000Z", provenance: provenance(), version: "1" });
  return { ...bundle, t1, rating1, state1, state2, association, comparison, change, link };
}

function effective(states: readonly { subjectKind: string; subjectId: string; effective: string }[], kind: string, id: string) {
  return [...states].reverse().find((row) => row.subjectKind === kind && row.subjectId === id)?.effective;
}

describe("EOS-D1H-R5 structural inspection condition closeout", () => {
  it("closes one T1 and T2 chain without merging findings or calculating a rate", () => {
    const first = chain();
    const second = chain();
    expect(first.t1).toBe(JSON.stringify(first.r3.conditionStates.find((row) => row.conditionStateId === "state-1")));
    expect(first.r2.structuralFindings.map((row) => row.findingId)).toEqual(["find-1", "find-2"]);
    expect(first.association.findingsMerged).toBe(false);
    expect(first.association.validatedBy).toBe("rev-1");
    expect(first.r1.coverages.map((row) => row.coverageId)).toEqual(["cov-1", "cov-2"]);
    expect(first.comparison.comparisonStatus).toBe("COMPARABLE");
    expect(first.comparison.rawDifference).toBe(1500);
    expect(first.comparison.deteriorationRate).toBeNull();
    expect(first.comparison.rateComputed).toBe(false);
    expect(first.change.observedDifference).toBe(1500);
    expect(first.change.deterioration).toBe(false);
    expect(first.change.deteriorationRate).toBeNull();
    expect(first.rating1.schemeFingerprint).toBe(first.r3.schemes[0]?.fingerprint);
    expect(first.state1.schemeFingerprint).toBe(first.rating1.schemeFingerprint);
    expect(first.state2.ratingValueCode).toBe("2");
    expect(first.link.analysisResultId).toBe("result-1");
    expect(first.link.analysisRunId).toBe("run-1");
    expect(first.link.governsCondition).toBe(false);
    expect(first.link.analysisModelUpdated).toBe(false);
    expect(first.state1.capacityChanged).toBe(false);
    expect(first.state1.sectionPropertyChanged).toBe(false);
    expect(first.state1.materialPropertyChanged).toBe(false);
    expect(first.state1.structuralAdequacy).toBe(false);
    expect(first.state1.assetSafe).toBe(false);
    expect(first.state1.repairRequired).toBe(false);
    expect(first.state2.fingerprint).toBe(second.state2.fingerprint);
    expect(first.link.fingerprint).toBe(second.link.fingerprint);
    expect(first.state2.supportingEvidenceIds).toEqual(["ev-2"]);
    expect(first.state2.targetId).toBe("mem-1");
    expect(() => selectLatestAnalysisResult()).toThrow(/LATEST_ANALYSIS_AUTO_SELECTED_REJECTED/);
    expect(() => computeDeteriorationRate()).toThrow(/DETERIORATION_RATE_REJECTED/);
    expect(() => selectRatingFromMeasurement()).toThrow(/MEASUREMENT_AUTO_SELECTS_RATING/);
  });

  it("propagates one upstream change at a time without deleting history", () => {
    const evidence = chain();
    const before = evidence.r2.structuralFindings.length;
    invalidateStructuralInspectionRecord(evidence.r1, "SOURCE_CORRECTION", "EVIDENCE", "ev-1", "2026-07-01T00:00:00.000Z");
    propagateR1EvidenceStaleness(evidence.r1, evidence.r2, "2026-07-01T00:00:00.000Z");
    propagateConditionStaleness(evidence.r1, evidence.r2, evidence.r3, "2026-07-01T00:00:00.000Z");
    propagateTemporalStaleness(evidence.r1, evidence.r2, evidence.r3, [identity()], evidence.r4, "2026-07-01T00:00:00.000Z");
    expect(effective(evidence.r2.states, "FINDING", "find-1")).toBe("STALE");
    expect(effective(evidence.r4.states, "ASSOCIATION", "assoc-1")).toBe("STALE");
    expect(evidence.r2.structuralFindings.length).toBe(before);

    const measurement = chain();
    correctInspectionMeasurement(measurement.r1, measurement.r2, "meas-2", measurementInput({ measurementId: "meas-2b", inspectionContextId: "ctx-2", evidenceId: "ev-2", findingId: "find-2", value: 2600, measuredAt: "2026-06-01T04:00:00.000Z", version: "2" }), "MEASUREMENT_CORRECTED");
    propagateTemporalStaleness(measurement.r1, measurement.r2, measurement.r3, [identity()], measurement.r4, "2026-07-02T00:00:00.000Z");
    expect(effective(measurement.r4.states, "COMPARISON", "cmp-1")).toBe("STALE");
    expect(measurement.r2.measurements.some((row) => row.measurementId === "meas-2")).toBe(true);

    const confirmation = chain();
    withdrawAssociationConfirmation(confirmation.r4, "assoc-1", "2026-07-03T00:00:00.000Z");
    expect(effective(confirmation.r4.states, "ASSOCIATION", "assoc-1")).toBe("STALE");
    expect(confirmation.r4.associations.length).toBe(1);

    const scheme = chain();
    retireConditionRatingScheme(scheme.r3, "TEST_CONDITION_SCHEME_V1", "1", "2026-07-04T00:00:00.000Z");
    propagateConditionStaleness(scheme.r1, scheme.r2, scheme.r3, "2026-07-04T00:00:00.000Z");
    propagateTemporalStaleness(scheme.r1, scheme.r2, scheme.r3, [identity()], scheme.r4, "2026-07-04T00:00:00.000Z");
    expect(effective(scheme.r3.states, "CONDITION_STATE", "state-1")).toBe("STALE");
    expect(effective(scheme.r4.states, "CONTINUITY", "cont-1")).toBe("STALE");

    const analysis = chain();
    propagateTemporalStaleness(analysis.r1, analysis.r2, analysis.r3, [identity({ analysisModelFingerprint: "model-fp-changed" })], analysis.r4, "2026-07-05T00:00:00.000Z");
    expect(effective(analysis.r4.states, "ANALYSIS_LINK", "link-1")).toBe("STALE");
    expect(analysis.r4.analysisLinks[0]?.analysisResultId).toBe("result-1");
  });

  it("rejects same scheme identity when the content fingerprint differs", () => {
    const bundle = base();
    const scheme = bundle.r3.schemes[0]!;
    expect(() => registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-1", schemeInput({ ratingValueDefinitions: [{ code: "1", label: "changed label", descriptionRef: null, explicitOrder: 1 }] }))).toThrow(/DUPLICATE_SCHEME_VERSION/);
    expect(() => { scheme.ratingValueDefinitions[0]!.label = "changed"; }).toThrow(TypeError);
    expect(ratingSchemesHistoricallyComparable({ ratingSchemeId: scheme.ratingSchemeId, schemeVersion: scheme.schemeVersion, fingerprint: scheme.fingerprint }, { ratingSchemeId: scheme.ratingSchemeId, schemeVersion: scheme.schemeVersion, fingerprint: "different-content" })).toBe(false);
    const closed = chain();
    closed.state2.schemeFingerprint = "different-content";
    expect(() => compareConditionRatings(closed.r3, "state-1", "state-2")).toThrow(/CROSS_SCHEME_RATING_COMPARISON_REJECTED/);
    expect(RATING_SCHEME_CONTENT_IMMUTABLE_PER_ID_VERSION).toBe(true);
    expect(TEMPORAL_RATING_COMPARABILITY_REQUIRES_SCHEME_FINGERPRINT_MATCH).toBe(true);
    expect(D1H_R5_SAME_SCHEME_ID_VERSION_DIFFERENT_FINGERPRINT_COMPARABLE).toBe(false);
    expect(D1H_R5_HISTORICAL_RATING_FLOATS_TO_CURRENT_SCHEME).toBe(false);
    expect(D1H_R5_DEFAULT_CONDITION_RATING_SCHEME).toBe("NONE");
  });

  it("keeps record validation separate from software validation and from a digital twin", () => {
    const bundle = chain();
    expect(bundle.r2.validations.length).toBeGreaterThan(0);
    expect(D1H_RECORD_LEVEL_HUMAN_VALIDATION_RUNTIME_COUNT).toBe(1);
    expect(D1H_SOFTWARE_ENGINEER_VALIDATION_COUNT).toBe(0);
    expect(D1H_METHOD_CONFORMANCE_VALIDATION_COUNT).toBe(0);
    expect(D1H_R5_FINAL_MATURITY_STATE).toBe("STRUCTURAL_INSPECTION_CONDITION_BOUNDED_RUNTIME_IMPLEMENTED");
    expect(D1H_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_HUMAN_VALIDATION_RUNTIME")?.validationState).toBe("NOT_VALIDATED");
    const handoff = d1hCloseoutHandoff(bundle.r1, bundle.r2, bundle.r3, bundle.r4);
    expect(handoff.copiedBodies).toBe(false);
    expect(handoff.reauthorsEvidence).toBe(false);
    expect(handoff.mutatesHistory).toBe(false);
    expect(handoff.digitalTwinImplemented).toBe(false);
    expect(JSON.stringify(handoff)).not.toContain("T1 observation");
    expect(JSON.stringify(handoff)).not.toContain("1000");
    expect(D1I_STRUCTURAL_DIGITAL_TWIN_IMPLEMENTED).toBe(false);
    expect(D1H_DIGITAL_TWIN_RUNTIME_COUNT).toBe(0);
    expect(D1I_REAUTHORS_D1H_EVIDENCE).toBe(false);
    expect(D1I_REAUTHORS_D1H_FINDINGS).toBe(false);
    expect(D1I_REAUTHORS_D1H_CONDITION_STATES).toBe(false);
    expect(D1I_REAUTHORS_D1H_TEMPORAL_HISTORY).toBe(false);
    expect(D1I_CAN_MUTATE_D1H_HISTORY).toBe(false);
    expect(POST_D1H_NEXT_TRACK).toBe("D1I_STRUCTURAL_DIGITAL_TWIN");
    expect(CANONICAL_NEXT_IMPLEMENTATION_PHASE).toBe("NOT_DEFINED");
    expect(D2_STARTED_BY_D1H_CLOSEOUT).toBe(false);
    expect(d1hCapabilityManifestReconciled(STRUCTURAL_CAPABILITY_MANIFEST)).toBe(true);
    expect(d1hValidationMatrixReconciled(STRUCTURAL_CAPABILITY_MANIFEST)).toBe(true);
  });

  it("rejects AI governance and cross-scope binding", () => {
    const bundle = base();
    expect(() => recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-ai", authority: "AI" }))).toThrow(/AI_AUTHORITY_REJECTED/);
    expect(() => recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-ai", authority: "AI" }))).toThrow(/AI_AUTHORITY_REJECTED/);
    expect(() => recordHumanValidation(bundle.r1, bundle.r2, validators, { validationId: "val-ai", inspectionContextId: "ctx-1", subjectType: "STRUCTURAL_FINDING", subjectId: "find-1", scopeStatement: "ai", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-01-01T05:00:00.000Z", decision: "CONFIRMED", limitations: "ai", authority: "AI", provenance: provenance(), version: "1", supersedesValidationId: null })).toThrow(/AI_AUTHORITY_REJECTED/);
    expect(() => recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, { interpretationId: "int-ai", inspectionContextId: "ctx-1", targetId: "mem-1", supportingEvidenceIds: ["ev-1"], supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], supportingValidationIds: ["val-find-1"], authorId: "model", reviewerId: null, statement: "draft", basisRefs: ["inspection-note:n1"], limitations: "draft", assumptions: "draft", createdAt: "2026-01-01T06:00:00.000Z", authority: "AI" as "HUMAN", provenance: provenance(), version: "1" })).toThrow(/INTERPRETATION_AUTHORITY_UNKNOWN/);
    expect(() => rate(bundle, { ratingId: "rate-ai", authority: "AI", interpretationId: null })).toThrow(/AI_AUTHORITY_REJECTED/);
    expect(() => recordConditionState(bundle.r1, bundle.r2, bundle.r3, { conditionStateId: "state-ai", inspectionContextId: "ctx-1", targetId: "mem-1", assessmentScope: "ai", ratingId: null, interpretationId: null, assessmentBasisRef: "inspection-note:n1", supportingFindingIds: [], supportingMeasurementIds: [], supportingEvidenceIds: [], relevantValidationIds: [], coverageIds: ["cov-1"], authority: "AI", status: "UNRATED", limitations: "draft", createdAt: "2026-01-01T08:00:00.000Z", createdBy: "model", provenance: provenance(), version: "1" })).toThrow(/AI_AUTHORITY_REJECTED/);
    expect(() => confirmAssociationFromAi()).toThrow(/AI_ASSOCIATION_AUTO_CONFIRMED_REJECTED/);
    expect(() => recordAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, [identity()], bundle.r4, { analysisLinkId: "link-ai", inspectionContextId: "ctx-1", targetId: "mem-1", evidenceIds: ["ev-1"], findingIds: ["find-1"], measurementIds: [], conditionStateIds: [], analysisResultId: "result-1", inspectionStructuralStateRef: "inspection-state", linkPurpose: "CONTEXT_REFERENCE", measurementLocationId: null, limitations: "ai", authority: "AI", recordCreatedAt: "2026-06-02T03:00:00.000Z", provenance: provenance(), version: "1" })).toThrow(/AI_AUTHORITY_REJECTED/);
    expect(D1H_R5_AI_GOVERNING_AUTHORITY_COUNT).toBe(0);
    bundle.source.objects.push(object("STRUCTURAL_SYSTEM", "sys-2", { projectId: "project-2", structuralSystemId: "sys-2" }));
    bundle.source.objects.push(object("MEMBER", "mem-x", { projectId: "project-2", structuralSystemId: "sys-2" }));
    bundle.source.sessions.push({ inspectionSessionId: "ses-x", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-2" });
    bundle.source.artifacts.push({ artifactId: "art-x", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-2", contentFingerprint: "hash-x" });
    const foreign = { ...provenance(), projectId: "project-2" };
    recordStructuralInspectionContext(bundle.r1, bundle.source, { ...contextInput("ctx-x", "ses-x", "2026-07-01T00:00:00.000Z"), projectId: "project-2", structuralSystemId: "sys-2", provenance: foreign, declaredTargetIds: ["mem-x"] });
    bindStructuralInspectionTarget(bundle.r1, bundle.source, "ctx-x", { ...targetInput("mem-x"), structuralSystemId: "sys-2" });
    recordStructuralInspectionCoverage(bundle.r1, { coverageId: "cov-x", inspectionContextId: "ctx-x", inspectionSessionId: "ses-x", targetId: "mem-x", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "visible face", authority: "HUMAN", provenance: foreign, version: "1", recordedAt: "2026-07-01T01:00:00.000Z" });
    recordStructuralInspectionEvidence(bundle.r1, bundle.source, evidenceInput({ evidenceId: "ev-x", inspectionContextId: "ctx-x", inspectionSessionId: "ses-x", targetId: "mem-x", sourceArtifactId: "art-x", provenance: foreign }));
    recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-x", inspectionContextId: "ctx-x", targetId: "mem-x", supportingEvidenceIds: ["ev-x"], provenance: foreign }));
    expect(() => recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, { associationId: "assoc-x", sourceFindingId: "find-1", relatedFindingId: "find-x", targetId: "mem-1", associationType: "ONE_TO_ONE", associationStatus: "POSSIBLE_MATCH", basisRefs: [{ basisId: "b1", kind: "LOCATION", ref: "loc-1" }], createdBy: "engineer-1", authority: "HUMAN", validatedBy: null, validationRef: null, limitations: "cross project", recordCreatedAt: "2026-07-02T00:00:00.000Z", provenance: provenance(), version: "1" })).toThrow(/CROSS_PROJECT_ASSOCIATION_REJECTED/);
    bundle.source.objects.push(object("STRUCTURAL_SYSTEM", "sys-t", { tenantId: "tenant-2", structuralSystemId: "sys-t" }));
    bundle.source.objects.push(object("MEMBER", "mem-t", { tenantId: "tenant-2", structuralSystemId: "sys-t" }));
    bundle.source.sessions.push({ inspectionSessionId: "ses-t", tenantId: "tenant-2", workspaceId: "workspace-1", projectId: "project-1" });
    bundle.source.artifacts.push({ artifactId: "art-t", tenantId: "tenant-2", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-t" });
    const tenant = { ...provenance(), tenantId: "tenant-2" };
    recordStructuralInspectionContext(bundle.r1, bundle.source, { ...contextInput("ctx-t", "ses-t", "2026-08-01T00:00:00.000Z"), tenantId: "tenant-2", structuralSystemId: "sys-t", provenance: tenant, declaredTargetIds: ["mem-t"] });
    bindStructuralInspectionTarget(bundle.r1, bundle.source, "ctx-t", { ...targetInput("mem-t"), structuralSystemId: "sys-t" });
    recordStructuralInspectionCoverage(bundle.r1, { coverageId: "cov-t", inspectionContextId: "ctx-t", inspectionSessionId: "ses-t", targetId: "mem-t", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "visible face", authority: "HUMAN", provenance: tenant, version: "1", recordedAt: "2026-08-01T01:00:00.000Z" });
    recordStructuralInspectionEvidence(bundle.r1, bundle.source, evidenceInput({ evidenceId: "ev-t", inspectionContextId: "ctx-t", inspectionSessionId: "ses-t", targetId: "mem-t", sourceArtifactId: "art-t", provenance: tenant }));
    recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-t", inspectionContextId: "ctx-t", targetId: "mem-t", supportingEvidenceIds: ["ev-t"], provenance: tenant }));
    expect(() => recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, { associationId: "assoc-t", sourceFindingId: "find-1", relatedFindingId: "find-t", targetId: "mem-1", associationType: "ONE_TO_ONE", associationStatus: "POSSIBLE_MATCH", basisRefs: [{ basisId: "b1", kind: "LOCATION", ref: "loc-1" }], createdBy: "engineer-1", authority: "HUMAN", validatedBy: null, validationRef: null, limitations: "cross tenant", recordCreatedAt: "2026-08-02T00:00:00.000Z", provenance: provenance(), version: "1" })).toThrow(/CROSS_TENANT_ASSOCIATION_REJECTED/);
  });

  it("keeps the bounded chain free of engineering automation", () => {
    const files = ["inspection-evidence.ts", "inspection-finding.ts", "inspection-condition.ts", "inspection-temporal.ts", "inspection-closeout.ts"].map((name) => readFileSync(join(here, name), "utf8"));
    const source = files.join("\n");
    expect(source).not.toMatch(/corrosion rate\s*=|crack growth\s*=|fatigue life\s*=|remaining life\s*=|future value\s*=|capacity reduction\s*=|stiffness loss\s*=|safe if|unsafe if/i);
    expect(source).not.toMatch(/face recognition|person tracking|employee scoring|worker productivity|worker behavior/i);
    const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1H_R5_STRUCTURAL_INSPECTION_CONDITION_CLOSEOUT.md");
    expect(scanAnalysisFormulaBypass(docPath, readFileSync(docPath, "utf8"))).toEqual([]);
    expect(D1H_R3_NO_FINDING_EQUALS_GOOD_CONDITION).toBe(false);
    expect(D1H_R1_EVIDENCE_CAN_EXIST_WITHOUT_FINDING).toBe(true);
    expect(INACCESSIBLE_EQUALS_INSPECTED).toBe(false);
    expect(D1H_R2_NEGATIVE_OBSERVATION_CREATES_FINDING).toBe(false);
    expect(D1H_R1_ORPHAN_BOUNDED_REGION_ALLOWED).toBe(false);
    expect(D1H_STRUCTURAL_ADEQUACY_RUNTIME_COUNT).toBe(0);
    expect(D1H_CAPACITY_ASSESSMENT_RUNTIME_COUNT).toBe(0);
    expect(D1H_AUTOMATIC_RATING_ENGINE_COUNT).toBe(0);
    expect(D1H_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1H_EVIDENCE_FOUNDATION_RUNTIME_COUNT).toBe(1);
    expect(D1H_STRUCTURAL_FINDING_RUNTIME_COUNT).toBe(1);
    expect(D1H_MEASUREMENT_RUNTIME_COUNT).toBe(1);
    expect(D1H_HUMAN_VALIDATION_RUNTIME_COUNT).toBe(1);
    expect(D1H_ENGINEERING_INTERPRETATION_RUNTIME_COUNT).toBe(1);
    expect(D1H_CONDITION_RATING_RUNTIME_COUNT).toBe(1);
    expect(D1H_CONDITION_STATE_RUNTIME_COUNT).toBe(1);
    expect(D1H_FINDING_ASSOCIATION_RUNTIME_COUNT).toBe(1);
    expect(D1H_CONDITION_CONTINUITY_RUNTIME_COUNT).toBe(1);
    expect(D1H_MEASUREMENT_COMPARISON_RUNTIME_COUNT).toBe(1);
    expect(D1H_CHANGE_EVIDENCE_RUNTIME_COUNT).toBe(1);
    expect(D1H_ANALYSIS_LINK_RUNTIME_COUNT).toBe(1);
    expect(D1H_CAUSAL_DIAGNOSIS_ENGINE_COUNT).toBe(0);
    expect(() => diagnoseCause()).toThrow(/CAUSAL_DIAGNOSIS_REJECTED/);
    expect(() => extrapolateFutureCondition()).toThrow(/TEMPORAL_EXTRAPOLATION_REJECTED/);
    expect(() => mergeFindingRecords()).toThrow(/ASSOCIATION_MERGES_FINDING_RECORDS_REJECTED/);
    expect(() => updateAnalysisModelFromCondition()).toThrow(/CONDITION_MODEL_UPDATE_REJECTED/);
  });
});
