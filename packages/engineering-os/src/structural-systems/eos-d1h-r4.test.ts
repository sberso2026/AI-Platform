import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CANONICAL_INTERNAL_UNITS } from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  correctConditionState,
  correctEngineeringInterpretation,
  createD1hR3Store,
  recordConditionRating,
  recordConditionState,
  recordEngineeringInterpretation,
  registerConditionRatingScheme,
  retireConditionRatingScheme,
  type D1hR3RatingInput,
  type D1hR3SchemeInput,
} from "./inspection-condition";
import {
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
  correctInspectionMeasurement,
  correctStructuralFinding,
  createD1hR2Store,
  recordHumanValidation,
  recordInspectionMeasurement,
  recordStructuralFinding,
  type D1hR2FindingInput,
  type D1hR2MeasurementInput,
} from "./inspection-finding";
import {
  averageMeasurementComparisons,
  compareConditionRatings,
  computeDeteriorationRate,
  confirmAssociationFromAi,
  confirmAssociationFromImageSimilarity,
  confirmAssociationFromProximity,
  correctAnalysisResultLink,
  correctConditionContinuity,
  correctFindingAssociation,
  correctMeasurementComparison,
  createD1hR4Store,
  createInterpretationFromChange,
  d1iTemporalReference,
  deletePriorFindings,
  D1H_R4_COMPLETENESS_STATES,
  D1H_R4_DETERIORATION_RATE_ENGINE_COUNT,
  D1H_R4_DIGITAL_TWIN_RUNTIME_COUNT,
  D1H_R4_MATURITY_STATE,
  D1H_R4_NEW_ENGINEERING_FORMULA_COUNT,
  D1H_R5_REQUIRED_R4_CONTRACTS,
  diagnoseCause,
  equateFindingsByTarget,
  evaluateTemporalAssociation,
  existingUnitPairCompatible,
  extrapolateFutureCondition,
  fitTemporalTrend,
  inferTimezoneFromProjectLocation,
  mergeFindingRecords,
  modifyCapacityFromTemporalRecord,
  normalizeWithExistingUnitSystem,
  promoteLinkedAnalysisAuthority,
  propagateTemporalStaleness,
  rebindStaleTarget,
  recordAnalysisResultLink,
  recordChangeEvidence,
  recordConditionContinuity,
  recordFindingAssociation,
  recordMeasurementComparison,
  resolveConflictingAssociations,
  selectCurrentFindingAssociation,
  selectLatestAnalysisResult,
  temporalProvenance,
  updateAnalysisModelFromCondition,
  updateAnalysisModelFromMeasurement,
  updateConditionRatingFromChange,
  withdrawAssociationConfirmation,
  withdrawTemporalAuthority,
  type D1hR4AnalysisIdentityRef,
  type D1hR4AssociationInput,
  type D1hR4MeasurementBasis,
} from "./inspection-temporal";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "inspection-temporal.ts");
const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1H_R4_TEMPORAL_HISTORY_ASSOCIATION_ANALYSIS_LINKAGE.md");

function object(kind: D1hR1CatalogObject["kind"], id: string, overrides: Partial<D1hR1CatalogObject> = {}): D1hR1CatalogObject {
  return { kind, id, structuralSystemId: "sys-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", version: "1", lifecycle: "CURRENT", ...overrides };
}

function catalog() {
  return {
    objects: [object("STRUCTURAL_SYSTEM", "sys-1"), object("MEMBER", "mem-1"), object("MEMBER", "mem-2")],
    sessions: [{ inspectionSessionId: "ses-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1" }],
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
  return { evidenceId: "ev-1", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", sourceClass: "PHOTO", sourceArtifactId: "art-photo", analysisResultId: null, priorEvidenceId: null, derivedFromEvidenceId: null, capturedAt: "2026-10-18T02:00:00.000Z", capturedBy: "inspector-1", location: location(), methodRef: "photo", unit: null, authority: "HUMAN_OBSERVATION", modelIdentity: null, modelVersion: null, executionFingerprint: null, provenance: provenance(), version: "1", recordedAt: "2026-10-18T02:00:00.000Z", explicitNegativeObservation: false, negativeScopeStatement: null, ...overrides };
}

function targetInput(id: string, extras: Partial<D1hR1TargetInput> = {}): D1hR1TargetInput {
  return { targetId: id, targetKind: "MEMBER", structuralSystemId: "sys-1", memberId: id, connectionId: null, supportId: null, foundationIdentity: null, parentTargetKind: null, parentTargetId: null, regionRef: null, candidateOnly: false, inferredBy: null, ...extras };
}

function contextInput(id: string, inspectedAt: string) {
  return { inspectionContextId: id, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1", inspectionSessionId: "ses-1", purpose: "ROUTINE" as const, scopeStatement: "member scope", inspectedAt, coverageScopeRef: "scope-1", methodRefs: ["visual"], sourceAuthority: "HUMAN", governanceProfileRef: "profile-1", provenance: provenance(), version: "1", status: "RECORDED" as const, declaredTargetIds: ["mem-1"], recordedAt: inspectedAt };
}

function prepared() {
  const r1 = createD1hR1Store();
  const source = catalog();
  recordStructuralInspectionContext(r1, source, contextInput("ctx-1", "2026-01-01T00:00:00.000Z"));
  recordStructuralInspectionContext(r1, source, contextInput("ctx-2", "2026-06-01T00:00:00.000Z"));
  bindStructuralInspectionTarget(r1, source, "ctx-1", targetInput("mem-1"));
  bindStructuralInspectionTarget(r1, source, "ctx-2", targetInput("mem-1"));
  bindStructuralInspectionTarget(r1, source, "ctx-2", targetInput("mem-2"));
  recordStructuralInspectionCoverage(r1, { coverageId: "cov-1", inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "visible face", authority: "HUMAN", provenance: provenance(), version: "1", recordedAt: "2026-01-01T01:00:00.000Z" });
  recordStructuralInspectionCoverage(r1, { coverageId: "cov-2", inspectionContextId: "ctx-2", inspectionSessionId: "ses-1", targetId: "mem-1", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "visible face", authority: "HUMAN", provenance: provenance(), version: "1", recordedAt: "2026-06-01T01:00:00.000Z" });
  recordStructuralInspectionEvidence(r1, source, evidenceInput());
  recordStructuralInspectionEvidence(r1, source, evidenceInput({ evidenceId: "ev-2", inspectionContextId: "ctx-2", capturedAt: "2026-06-01T02:00:00.000Z", recordedAt: "2026-06-01T02:00:00.000Z", location: location("loc-2") }));
  recordStructuralInspectionEvidence(r1, source, evidenceInput({ evidenceId: "ev-3", inspectionContextId: "ctx-2", capturedAt: "2026-06-01T02:30:00.000Z", recordedAt: "2026-06-01T02:30:00.000Z", location: location("loc-3") }));
  return { r1, r2: createD1hR2Store(), r3: createD1hR3Store(), r4: createD1hR4Store(), source };
}

function findingInput(overrides: Partial<D1hR2FindingInput> = {}): D1hR2FindingInput {
  return { findingId: "find-1", inspectionContextId: "ctx-1", targetId: "mem-1", findingType: "CRACKING", location: location(), supportingEvidenceIds: ["ev-1"], origin: "HUMAN_RECORDED", authority: "HUMAN", createdAt: "2026-01-01T03:00:00.000Z", createdBy: "inspector-1", provenance: provenance(), version: "1", modelIdentity: null, modelVersion: null, executionFingerprint: null, ...overrides };
}

function measurementInput(overrides: Partial<D1hR2MeasurementInput> = {}): D1hR2MeasurementInput {
  return { measurementId: "meas-1", inspectionContextId: "ctx-1", targetId: "mem-1", evidenceId: "ev-1", findingId: "find-1", quantity: "force", value: 1000, unit: CANONICAL_INTERNAL_UNITS.force, dimensionless: false, location: location(), methodRef: "gauge", sourceType: "INSTRUMENT_MEASURED", instrumentRef: "gauge-1", measuredAt: "2026-01-01T04:00:00.000Z", uncertainty: null, accuracy: null, calibrationBasis: "gauge-zero", modelIdentity: null, modelVersion: null, authority: "HUMAN", provenance: provenance(), version: "1", ...overrides };
}

const validators = [{ validatorId: "rev-1", role: "ENGINEER_REVIEWER" as const, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authorized: true }];

function basis(calibration: string | null = "gauge-zero"): D1hR4MeasurementBasis {
  return { referenceDatum: calibration, gaugeLength: calibration, calibrationBasis: calibration, orientation: calibration, surfaceFace: calibration, memberStation: calibration, coordinateSystem: calibration, measurementSetup: calibration };
}

function associationInput(overrides: Partial<D1hR4AssociationInput> = {}): D1hR4AssociationInput {
  return {
    associationId: "assoc-1",
    sourceFindingId: "find-1",
    relatedFindingId: "find-2",
    targetId: "mem-1",
    associationType: "ONE_TO_ONE",
    associationStatus: "POSSIBLE_MATCH",
    basisRefs: [{ basisId: "b1", kind: "LOCATION", ref: "loc-1" }],
    createdBy: "engineer-1",
    authority: "HUMAN",
    validatedBy: null,
    validationRef: null,
    limitations: "locations are nearby and are not an identity proof",
    recordCreatedAt: "2026-06-02T00:00:00.000Z",
    provenance: provenance(),
    version: "1",
    ...overrides,
  };
}

function pair() {
  const bundle = prepared();
  recordStructuralFinding(bundle.r1, bundle.r2, findingInput());
  recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-2", inspectionContextId: "ctx-2", supportingEvidenceIds: ["ev-2"], location: location("loc-2"), createdAt: "2026-06-01T03:00:00.000Z" }));
  recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-3", inspectionContextId: "ctx-2", supportingEvidenceIds: ["ev-3"], location: location("loc-3"), createdAt: "2026-06-01T03:30:00.000Z" }));
  return bundle;
}

function validateMeasurement(bundle: ReturnType<typeof prepared>, validationId: string, measurementId: string, contextId: string) {
  recordHumanValidation(bundle.r1, bundle.r2, validators, { validationId, inspectionContextId: contextId, subjectType: "MEASUREMENT_VALUE", subjectId: measurementId, scopeStatement: "value only", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-06-01T05:00:00.000Z", decision: "CONFIRMED", limitations: "value only", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null });
}

function comparableMeasurements(bundle = pair()) {
  recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput());
  recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-2", inspectionContextId: "ctx-2", evidenceId: "ev-2", findingId: "find-2", value: 2500, measuredAt: "2026-06-01T04:00:00.000Z" }));
  validateMeasurement(bundle, "val-m1", "meas-1", "ctx-1");
  validateMeasurement(bundle, "val-m2", "meas-2", "ctx-2");
  return bundle;
}

function comparisonInput(overrides: Record<string, unknown> = {}) {
  return { comparisonId: "cmp-1", priorMeasurementId: "meas-1", currentMeasurementId: "meas-2", priorBasis: basis(), currentBasis: basis(), limitations: "descriptive difference only", authority: "HUMAN", recordCreatedAt: "2026-06-02T00:00:00.000Z", provenance: provenance(), version: "1", ...overrides };
}

function schemeInput(overrides: Partial<D1hR3SchemeInput> = {}): D1hR3SchemeInput {
  return {
    ratingSchemeId: "TEST_CONDITION_SCHEME_V1",
    schemeVersion: "1",
    profileRef: "test-profile",
    schemeAuthority: "HUMAN",
    applicability: { projectId: "project-1", assetOwnerRef: null, clientRef: null, inspectionStandardRef: "test-standard", assetClass: null, targetKinds: ["MEMBER"] },
    ratingValueDefinitions: [{ code: "1", label: "test label one", descriptionRef: null, explicitOrder: 1 }, { code: "2", label: "test label two", descriptionRef: null, explicitOrder: 2 }],
    provenance: provenance(),
    status: "TEST_ONLY",
    ...overrides,
  };
}

function identity(runId = "run-1", overrides: Partial<D1hR4AnalysisIdentityRef> = {}): D1hR4AnalysisIdentityRef {
  return {
    analysisResultId: "result-1",
    analysisModelId: "model-1",
    analysisModelVersion: "1",
    analysisModelFingerprint: "model-fp-1",
    analysisRunId: runId,
    analysisRunFingerprint: `run-fp-${runId}`,
    resultSetId: `set-${runId}`,
    normalizedResultId: `norm-${runId}`,
    resultClass: "NORMALIZED_RESULT",
    authorityState: "VERIFIED_GOVERNED",
    runStatus: "COMPLETED",
    resultCategory: "NODAL_DISPLACEMENT",
    quantity: "force",
    locationKind: "MEMBER_START",
    loadCaseId: "case-1",
    combinationId: "comb-1",
    providerId: "provider-1",
    providerVersion: "1",
    providerProvenanceRef: "d1g-provider-provenance",
    modelValidationEvidenceRef: null,
    analysisTimestamp: "2025-01-01T00:00:00.000Z",
    structuralStateRef: "analysis-state",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    structuralSystemId: "sys-1",
    ...overrides,
  };
}

function linkInput(overrides: Record<string, unknown> = {}) {
  return { analysisLinkId: "link-1", inspectionContextId: "ctx-1", targetId: "mem-1", evidenceIds: ["ev-1"], findingIds: ["find-1"], measurementIds: [] as string[], conditionStateIds: [] as string[], analysisResultId: "result-1", inspectionStructuralStateRef: "inspection-state", linkPurpose: "CONTEXT_REFERENCE" as const, measurementLocationId: null, limitations: "contextual reference", authority: "HUMAN", recordCreatedAt: "2026-06-02T00:00:00.000Z", provenance: provenance(), version: "1", ...overrides };
}

describe("EOS-D1H-R4 temporal association and analysis linkage", () => {
  it("keeps a possible match distinct from confirmed identity and from AI governance", () => {
    const bundle = pair();
    const findingCount = bundle.r2.structuralFindings.length;
    const possible = recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput());
    expect(possible.associationStatus).toBe("POSSIBLE_MATCH");
    expect(possible.identityProof).toBe(false);
    expect(possible.governs).toBe(false);
    expect(possible.sourceInspectionAt).not.toBe(possible.recordCreatedAt);
    expect(possible.sourceFindingRecordedAt).not.toBe(possible.sourceInspectionAt);
    expect(possible.timezoneInferred).toBe(false);
    const confirmed = recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "assoc-same", associationStatus: "HUMAN_CONFIRMED_SAME_CONDITION", validatedBy: "rev-1", validationRef: "val-assoc" }));
    expect(confirmed.governs).toBe(true);
    expect(confirmed.identityProof).toBe(false);
    const distinct = recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "assoc-distinct", associationStatus: "HUMAN_CONFIRMED_DISTINCT", validatedBy: "rev-1" }));
    expect(distinct.associationStatus).toBe("HUMAN_CONFIRMED_DISTINCT");
    expect(bundle.r2.structuralFindings.length).toBe(findingCount);
    expect(() => resolveConflictingAssociations()).toThrow(/CONFLICTING_ASSOCIATIONS_AUTO_RESOLVE_REJECTED/);
    expect(() => equateFindingsByTarget()).toThrow(/SAME_TARGET_EQUALS_SAME_FINDING_REJECTED/);
    expect(() => confirmAssociationFromProximity()).toThrow(/GEOMETRIC_PROXIMITY/);
    expect(() => confirmAssociationFromImageSimilarity()).toThrow(/IMAGE_SIMILARITY/);
    const ai = recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "assoc-ai", authority: "AI_CANDIDATE", createdBy: "candidate-model" }));
    expect(ai.governs).toBe(false);
    expect(() => confirmAssociationFromAi()).toThrow(/AI_ASSOCIATION_AUTO_CONFIRMED_REJECTED/);
    expect(() => recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "assoc-ai-govern", authority: "AI_CANDIDATE", associationStatus: "HUMAN_CONFIRMED_SAME_CONDITION" }))).toThrow(/AI_ASSOCIATION_CANNOT_GOVERN/);
    expect(() => inferTimezoneFromProjectLocation()).toThrow(/TIMEZONE_INFERENCE_REJECTED/);
    expect(D1H_R4_MATURITY_STATE).toBe("STRUCTURAL_CONDITION_TEMPORAL_ASSOCIATION_ANALYSIS_LINKAGE_RUNTIME_IMPLEMENTED");
  });

  it("represents split and merged lineage without deleting findings or crossing a project", () => {
    const bundle = pair();
    const before = bundle.r2.structuralFindings.map((row) => JSON.stringify(row));
    recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "split-a", relatedFindingId: "find-2", associationType: "ONE_TO_MANY", associationStatus: "SPLIT_LINEAGE", validatedBy: "rev-1" }));
    recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "split-b", relatedFindingId: "find-3", associationType: "ONE_TO_MANY", associationStatus: "SPLIT_LINEAGE", validatedBy: "rev-1" }));
    recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "merge-a", sourceFindingId: "find-2", relatedFindingId: "find-3", associationType: "MANY_TO_ONE", associationStatus: "MERGED_LINEAGE", validatedBy: "rev-1" }));
    recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "merge-b", sourceFindingId: "find-1", relatedFindingId: "find-3", associationType: "MANY_TO_ONE", associationStatus: "MERGED_LINEAGE", validatedBy: "rev-1" }));
    expect(bundle.r2.structuralFindings.map((row) => JSON.stringify(row))).toEqual(before);
    expect(bundle.r4.associations.every((row) => row.findingsMerged === false && row.findingsDeleted === false)).toBe(true);
    expect(() => mergeFindingRecords()).toThrow(/ASSOCIATION_MERGES_FINDING_RECORDS_REJECTED/);
    expect(() => deletePriorFindings()).toThrow(/ASSOCIATION_DELETES_PRIOR_FINDINGS_REJECTED/);
    bundle.source.objects.push(object("STRUCTURAL_SYSTEM", "sys-2", { projectId: "project-2", structuralSystemId: "sys-2" }));
    bundle.source.objects.push(object("MEMBER", "mem-x", { projectId: "project-2", structuralSystemId: "sys-2" }));
    bundle.source.sessions.push({ inspectionSessionId: "ses-x", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-2" });
    bundle.source.artifacts.push({ artifactId: "art-x", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-2", contentFingerprint: "hash-x" });
    const foreignProvenance = { ...provenance(), projectId: "project-2" };
    recordStructuralInspectionContext(bundle.r1, bundle.source, { ...contextInput("ctx-x", "2026-07-01T00:00:00.000Z"), projectId: "project-2", structuralSystemId: "sys-2", inspectionSessionId: "ses-x", provenance: foreignProvenance, declaredTargetIds: ["mem-x"] });
    bindStructuralInspectionTarget(bundle.r1, bundle.source, "ctx-x", { ...targetInput("mem-x"), structuralSystemId: "sys-2" });
    recordStructuralInspectionCoverage(bundle.r1, { coverageId: "cov-x", inspectionContextId: "ctx-x", inspectionSessionId: "ses-x", targetId: "mem-x", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "visible face", authority: "HUMAN", provenance: foreignProvenance, version: "1", recordedAt: "2026-07-01T01:00:00.000Z" });
    recordStructuralInspectionEvidence(bundle.r1, bundle.source, evidenceInput({ evidenceId: "ev-x", inspectionContextId: "ctx-x", inspectionSessionId: "ses-x", targetId: "mem-x", sourceArtifactId: "art-x", provenance: foreignProvenance }));
    recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-x", inspectionContextId: "ctx-x", targetId: "mem-x", supportingEvidenceIds: ["ev-x"], provenance: foreignProvenance }));
    expect(() => recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "assoc-x", relatedFindingId: "find-x" }))).toThrow(/CROSS_PROJECT_ASSOCIATION_REJECTED/);
    bundle.source.objects.push(object("STRUCTURAL_SYSTEM", "sys-t", { tenantId: "tenant-2", projectId: "project-1", structuralSystemId: "sys-t" }));
    bundle.source.objects.push(object("MEMBER", "mem-t", { tenantId: "tenant-2", projectId: "project-1", structuralSystemId: "sys-t" }));
    bundle.source.sessions.push({ inspectionSessionId: "ses-t", tenantId: "tenant-2", workspaceId: "workspace-1", projectId: "project-1" });
    bundle.source.artifacts.push({ artifactId: "art-t", tenantId: "tenant-2", workspaceId: "workspace-1", projectId: "project-1", contentFingerprint: "hash-t" });
    const tenantProvenance = { ...provenance(), tenantId: "tenant-2" };
    recordStructuralInspectionContext(bundle.r1, bundle.source, { ...contextInput("ctx-t", "2026-07-02T00:00:00.000Z"), tenantId: "tenant-2", structuralSystemId: "sys-t", inspectionSessionId: "ses-t", provenance: tenantProvenance, declaredTargetIds: ["mem-t"] });
    bindStructuralInspectionTarget(bundle.r1, bundle.source, "ctx-t", { ...targetInput("mem-t"), structuralSystemId: "sys-t" });
    recordStructuralInspectionCoverage(bundle.r1, { coverageId: "cov-t", inspectionContextId: "ctx-t", inspectionSessionId: "ses-t", targetId: "mem-t", regionRef: null, methodRef: "visual", accessState: "INSPECTED_WITH_FINDINGS", limitations: "visible face", authority: "HUMAN", provenance: tenantProvenance, version: "1", recordedAt: "2026-07-02T01:00:00.000Z" });
    recordStructuralInspectionEvidence(bundle.r1, bundle.source, evidenceInput({ evidenceId: "ev-t", inspectionContextId: "ctx-t", inspectionSessionId: "ses-t", targetId: "mem-t", sourceArtifactId: "art-t", provenance: tenantProvenance }));
    recordStructuralFinding(bundle.r1, bundle.r2, findingInput({ findingId: "find-t", inspectionContextId: "ctx-t", targetId: "mem-t", supportingEvidenceIds: ["ev-t"], provenance: tenantProvenance }));
    expect(() => recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationId: "assoc-t", relatedFindingId: "find-t" }))).toThrow(/CROSS_TENANT_ASSOCIATION_REJECTED/);
    expect(() => rebindStaleTarget()).toThrow(/STALE_TARGET_AUTO_REBOUND_REJECTED/);
  });

  it("compares only compatible measurements and normalizes units with the existing converters", () => {
    const bundle = comparableMeasurements();
    const compared = recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput());
    expect(compared.comparisonStatus).toBe("COMPARABLE");
    expect(compared.rawDifference).toBe(1500);
    expect(compared.unitNormalizationRef).toBe("toForceN");
    expect(compared.rateComputed).toBe(false);
    expect(compared.deteriorationRate).toBeNull();
    expect(compared.promoted).toBe(false);
    expect(normalizeWithExistingUnitSystem("force", 1, "kN")).toBe(1000);
    expect(existingUnitPairCompatible("force", "kN", "N")).toBe(true);
    expect(existingUnitPairCompatible("length", "m", "Pa")).toBe(false);
    recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-len", inspectionContextId: "ctx-2", evidenceId: "ev-2", findingId: "find-2", quantity: "length", value: 0.002, unit: CANONICAL_INTERNAL_UNITS.length, measuredAt: "2026-06-01T04:10:00.000Z" }));
    expect(recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput({ comparisonId: "cmp-quantity", currentMeasurementId: "meas-len" })).comparisonStatus).toBe("NOT_COMPARABLE_QUANTITY");
    recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-unit", inspectionContextId: "ctx-2", evidenceId: "ev-2", findingId: "find-2", quantity: "length", value: 1, unit: CANONICAL_INTERNAL_UNITS.secondMoment, measuredAt: "2026-06-01T04:20:00.000Z" }));
    recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-len-prior", quantity: "length", value: 0.002, unit: CANONICAL_INTERNAL_UNITS.length }));
    validateMeasurement(bundle, "val-len", "meas-len-prior", "ctx-1");
    validateMeasurement(bundle, "val-unit", "meas-unit", "ctx-2");
    expect(recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput({ comparisonId: "cmp-unit", priorMeasurementId: "meas-len-prior", currentMeasurementId: "meas-unit" })).comparisonStatus).toBe("NOT_COMPARABLE_UNIT");
    recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-loc", inspectionContextId: "ctx-2", evidenceId: "ev-2", findingId: "find-2", value: 1100, location: location("loc-2"), measuredAt: "2026-06-01T04:30:00.000Z" }));
    validateMeasurement(bundle, "val-loc", "meas-loc", "ctx-2");
    expect(recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput({ comparisonId: "cmp-loc", currentMeasurementId: "meas-loc" })).comparisonStatus).toBe("NOT_COMPARABLE_LOCATION");
    recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-method", inspectionContextId: "ctx-2", evidenceId: "ev-2", findingId: "find-2", value: 1100, methodRef: "tape", measuredAt: "2026-06-01T04:40:00.000Z" }));
    validateMeasurement(bundle, "val-method", "meas-method", "ctx-2");
    expect(recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput({ comparisonId: "cmp-method", currentMeasurementId: "meas-method" })).comparisonStatus).toBe("NOT_COMPARABLE_METHOD");
    recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-basis", inspectionContextId: "ctx-2", evidenceId: "ev-2", findingId: "find-2", value: 1100, calibrationBasis: null, measuredAt: "2026-06-01T04:50:00.000Z" }));
    expect(recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput({ comparisonId: "cmp-basis", currentMeasurementId: "meas-basis", currentBasis: basis(null) })).comparisonStatus).toBe("NOT_COMPARABLE_BASIS");
    recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput({ measurementId: "meas-open", inspectionContextId: "ctx-2", evidenceId: "ev-2", findingId: "find-2", value: 1100, measuredAt: "2026-06-01T04:55:00.000Z" }));
    const unvalidated = recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput({ comparisonId: "cmp-open", currentMeasurementId: "meas-open" }));
    expect(unvalidated.comparisonStatus).toBe("VALIDATION_STATE_LIMITATION");
    expect(unvalidated.promoted).toBe(false);
    expect(unvalidated.currentValidationState).toBe("UNVALIDATED");
    expect(unvalidated.rawDifference).toBeNull();
  });

  it("records observed change without a rate, a forecast, or a rating update", () => {
    const bundle = comparableMeasurements();
    const ratingCount = bundle.r3.ratings.length;
    recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput());
    const change = recordChangeEvidence(bundle.r4, { changeEvidenceId: "change-1", comparisonId: "cmp-1", limitations: "observation only", recordCreatedAt: "2026-06-02T01:00:00.000Z", provenance: provenance(), version: "1" });
    expect(change.observedDifference).toBe(1500);
    expect(change.deterioration).toBe(false);
    expect(change.deteriorationRate).toBeNull();
    expect(change.cause).toBeNull();
    expect(change.repairEffectiveness).toBe(false);
    expect(change.ratingUpdated).toBe(false);
    expect(bundle.r3.ratings.length).toBe(ratingCount);
    expect(D1H_R4_DETERIORATION_RATE_ENGINE_COUNT).toBe(0);
    expect(() => computeDeteriorationRate()).toThrow(/DETERIORATION_RATE_REJECTED/);
    expect(() => extrapolateFutureCondition()).toThrow(/TEMPORAL_EXTRAPOLATION_REJECTED/);
    expect(() => fitTemporalTrend()).toThrow(/TREND_MODEL_REJECTED/);
    expect(() => updateConditionRatingFromChange()).toThrow(/CONDITION_RATING_UPDATE_REJECTED/);
    expect(() => createInterpretationFromChange()).toThrow(/INTERPRETATION_AUTO_CREATE_REJECTED/);
    expect(() => averageMeasurementComparisons()).toThrow(/COMPARISON_AVERAGE_REJECTED/);
  });

  it("links condition states by reference and refuses cross-scheme rating comparison", () => {
    const bundle = comparableMeasurements();
    recordHumanValidation(bundle.r1, bundle.r2, validators, { validationId: "val-find", inspectionContextId: "ctx-1", subjectType: "FINDING_CLASSIFICATION", subjectId: "find-1", scopeStatement: "classification only", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-01-01T05:00:00.000Z", decision: "CONFIRMED", limitations: "classification only", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null });
    registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-1", schemeInput());
    registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-2", schemeInput({ ratingSchemeId: "TEST_CONDITION_SCHEME_V2", profileRef: "other-profile" }));
    recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, { interpretationId: "int-1", inspectionContextId: "ctx-1", targetId: "mem-1", supportingEvidenceIds: ["ev-1"], supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], supportingValidationIds: ["val-find"], authorId: "engineer-1", reviewerId: null, statement: "Observed condition is recorded.", basisRefs: ["inspection-note:n1"], limitations: "visible face", assumptions: "none", createdAt: "2026-01-01T06:00:00.000Z", authority: "HUMAN", provenance: provenance(), version: "1" });
    recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, { interpretationId: "int-2", inspectionContextId: "ctx-2", targetId: "mem-1", supportingEvidenceIds: ["ev-2"], supportingFindingIds: ["find-2"], supportingMeasurementIds: ["meas-2"], supportingValidationIds: [], authorId: "engineer-1", reviewerId: null, statement: "Later observation is recorded.", basisRefs: ["inspection-note:n2"], limitations: "visible face", assumptions: "none", createdAt: "2026-06-01T06:00:00.000Z", authority: "HUMAN", provenance: provenance(), version: "1" });
    const rating = (overrides: Partial<D1hR3RatingInput>): D1hR3RatingInput => ({ ratingId: "rate-1", inspectionContextId: "ctx-1", targetId: "mem-1", ratingSchemeId: "TEST_CONDITION_SCHEME_V1", schemeVersion: "1", ratingValueCode: "2", interpretationId: "int-1", assessmentBasisRef: "inspection-note:n1", supportingEvidenceIds: ["ev-1"], supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], limitations: "visible face", assessedAt: "2026-01-01T07:00:00.000Z", authority: "HUMAN", provenance: provenance(), version: "1", imported: false, ...overrides });
    recordConditionRating(bundle.r1, bundle.r2, bundle.r3, rating({}));
    recordConditionRating(bundle.r1, bundle.r2, bundle.r3, rating({ ratingId: "rate-2", inspectionContextId: "ctx-2", ratingSchemeId: "TEST_CONDITION_SCHEME_V2", interpretationId: "int-2", assessmentBasisRef: "inspection-note:n2", supportingEvidenceIds: ["ev-2"], supportingFindingIds: ["find-2"], supportingMeasurementIds: ["meas-2"], assessedAt: "2026-06-01T07:00:00.000Z" }));
    recordConditionState(bundle.r1, bundle.r2, bundle.r3, { conditionStateId: "state-1", inspectionContextId: "ctx-1", targetId: "mem-1", assessmentScope: "member-face", ratingId: "rate-1", interpretationId: "int-1", assessmentBasisRef: "inspection-note:n1", supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], supportingEvidenceIds: ["ev-1"], relevantValidationIds: ["val-find"], coverageIds: ["cov-1"], authority: "HUMAN", status: "CURRENT", limitations: "visible face", createdAt: "2026-01-01T08:00:00.000Z", createdBy: "engineer-1", provenance: provenance(), version: "1" });
    recordConditionState(bundle.r1, bundle.r2, bundle.r3, { conditionStateId: "state-2", inspectionContextId: "ctx-2", targetId: "mem-1", assessmentScope: "member-face", ratingId: "rate-2", interpretationId: "int-2", assessmentBasisRef: "inspection-note:n2", supportingFindingIds: ["find-2"], supportingMeasurementIds: ["meas-2"], supportingEvidenceIds: ["ev-2"], relevantValidationIds: [], coverageIds: ["cov-2"], authority: "HUMAN", status: "CURRENT", limitations: "visible face", createdAt: "2026-06-01T08:00:00.000Z", createdBy: "engineer-1", provenance: provenance(), version: "1" });
    const before = JSON.stringify(bundle.r3.conditionStates);
    const continuity = recordConditionContinuity(bundle.r1, bundle.r3, bundle.r4, { continuityId: "cont-1", targetId: "mem-1", priorConditionStateId: "state-1", currentConditionStateId: "state-2", associationIds: [], comparisonIds: [], continuityStatus: "RECORDED", authority: "HUMAN", limitations: "reference only", recordCreatedAt: "2026-06-02T00:00:00.000Z", provenance: provenance(), version: "1" });
    expect(JSON.stringify(bundle.r3.conditionStates)).toBe(before);
    expect(continuity.reauthoredConditionState).toBe(false);
    expect(continuity.ratingValuesComparable).toBe(false);
    expect(continuity.priorInspectionAt).toBe("2026-01-01T00:00:00.000Z");
    expect(continuity.currentConditionEffectiveAt).toBe("2026-06-01T08:00:00.000Z");
    expect(continuity.chronologyInferredFromRecordOrder).toBe(false);
    expect(continuity.sameRatingEqualsUnchanged).toBe(false);
    expect(() => compareConditionRatings(bundle.r3, "state-1", "state-2")).toThrow(/CROSS_SCHEME_RATING_COMPARISON_REJECTED/);
    expect(temporalProvenance(bundle.r1, bundle.r2, bundle.r3, bundle.r4, "cont-1")).toEqual(expect.arrayContaining(["context:ctx-1", "coverage:cov-1", "evidence:ev-1", "finding:find-1", "measurement:meas-1", "condition:state-1", "condition:state-2", "continuity:cont-1"]));
    expect(d1iTemporalReference(bundle.r4, "cont-1").copiedEvidence).toBe(false);
    expect(d1iTemporalReference(bundle.r4, "cont-1").reauthorsHistory).toBe(false);
  });

  it("binds an immutable analysis run and keeps prediction distinct from measurement", () => {
    const bundle = pair();
    recordInspectionMeasurement(bundle.r1, bundle.r2, measurementInput());
    const identities = [identity("run-1"), identity("run-2", { analysisTimestamp: "2026-08-01T00:00:00.000Z" })];
    const link = recordAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, identities, bundle.r4, linkInput());
    expect(link.analysisRunId).toBe("run-1");
    expect(link.analysisModelFingerprint).toBe("model-fp-1");
    expect(link.analysisRunFingerprint).toBe("run-fp-run-1");
    expect(link.loadCaseId).toBe("case-1");
    expect(link.combinationId).toBe("comb-1");
    expect(link.authorityState).toBe("VERIFIED_GOVERNED");
    expect(link.resultClass).toBe("NORMALIZED_RESULT");
    expect(link.governsCondition).toBe(false);
    expect(link.temporalMismatch).toBe(true);
    expect(link.contemporaneous).toBe(false);
    expect(link.analysisTimestamp).not.toBe(link.inspectionAt);
    expect(() => selectLatestAnalysisResult()).toThrow(/LATEST_ANALYSIS_AUTO_SELECTED_REJECTED/);
    expect(link.analysisRunId).not.toBe("run-2");
    const predicted = recordAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, identities, bundle.r4, linkInput({ analysisLinkId: "link-measured", measurementIds: ["meas-1"], measurementLocationId: "loc-1", linkPurpose: "COMPARISON_CONTEXT" }));
    expect(predicted.predictedEqualsMeasured).toBe(false);
    expect(predicted.agreementEqualsModelValidation).toBe(false);
    expect(predicted.disagreementDiagnosesDamage).toBe(false);
    expect(predicted.analysisModelUpdated).toBe(false);
    expect(predicted.capacityChanged).toBe(false);
    expect(() => diagnoseCause()).toThrow(/CAUSAL_DIAGNOSIS_REJECTED/);
    expect(() => updateAnalysisModelFromMeasurement()).toThrow(/MEASUREMENT_MODEL_UPDATE_REJECTED/);
    expect(() => updateAnalysisModelFromCondition()).toThrow(/CONDITION_MODEL_UPDATE_REJECTED/);
    expect(() => modifyCapacityFromTemporalRecord()).toThrow(/CAPACITY_MODIFICATION_REJECTED/);
    expect(() => promoteLinkedAnalysisAuthority()).toThrow(/ANALYSIS_AUTHORITY_PROMOTION_REJECTED/);
    const nonconverged = recordAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, [identity("run-1", { runStatus: "NONCONVERGED", authorityState: "IMPORTED_PENDING_VERIFICATION" })], bundle.r4, linkInput({ analysisLinkId: "link-nc" }));
    expect(nonconverged.governsCondition).toBe(false);
    expect(nonconverged.runStatus).toBe("NONCONVERGED");
    expect(() => recordAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, identities, bundle.r4, linkInput({ analysisLinkId: "link-latest", analysisResultId: "LATEST_RESULT" }))).toThrow(/DYNAMIC_LATEST_ANALYSIS_REFERENCE_REJECTED/);
    expect(() => recordAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, identities, bundle.r4, Object.assign(linkInput({ analysisLinkId: "link-govern" }), { governsCondition: true }))).toThrow(/SCOPE_REJECTED:governsCondition/);
  });

  it("preserves history and propagates invalidation without deleting records", () => {
    const bundle = comparableMeasurements();
    const association = recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput({ associationStatus: "HUMAN_CONFIRMED_SAME_CONDITION", validatedBy: "rev-1" }));
    const comparison = recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput());
    recordChangeEvidence(bundle.r4, { changeEvidenceId: "change-1", comparisonId: "cmp-1", limitations: "observation only", recordCreatedAt: "2026-06-02T01:00:00.000Z", provenance: provenance(), version: "1" });
    const identities = [identity()];
    const link = recordAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, identities, bundle.r4, linkInput());
    const associationSnapshot = JSON.stringify(association);
    const comparisonSnapshot = JSON.stringify(comparison);
    const linkSnapshot = JSON.stringify(link);
    correctFindingAssociation(bundle.r1, bundle.r2, bundle.r4, "assoc-1", associationInput({ associationId: "assoc-2", version: "2", associationStatus: "HUMAN_CONFIRMED_DISTINCT", validatedBy: "rev-1", limitations: "later review" }));
    correctMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, "cmp-1", comparisonInput({ comparisonId: "cmp-2", version: "2", limitations: "later review" }));
    correctAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, identities, bundle.r4, "link-1", linkInput({ analysisLinkId: "link-2", version: "2", limitations: "later review" }));
    expect(JSON.stringify(bundle.r4.associations[0])).toBe(associationSnapshot);
    expect(JSON.stringify(bundle.r4.comparisons[0])).toBe(comparisonSnapshot);
    expect(JSON.stringify(bundle.r4.analysisLinks[0])).toBe(linkSnapshot);
    const associationCount = bundle.r4.associations.length;
    withdrawAssociationConfirmation(bundle.r4, "assoc-2", "2026-06-03T00:00:00.000Z");
    expect(bundle.r4.associations.length).toBe(associationCount);
    correctStructuralFinding(bundle.r1, bundle.r2, "find-1", findingInput({ findingId: "find-1b", version: "2", findingType: "CORROSION" }), "FINDING_CLASSIFICATION_CORRECTED");
    correctInspectionMeasurement(bundle.r1, bundle.r2, "meas-1", measurementInput({ measurementId: "meas-1b", version: "2", value: 1200, findingId: "find-1b" }), "MEASUREMENT_CORRECTED");
    identities[0]!.analysisRunFingerprint = "run-fp-changed";
    propagateTemporalStaleness(bundle.r1, bundle.r2, bundle.r3, identities, bundle.r4, "2026-06-04T00:00:00.000Z");
    expect(bundle.r4.states.some((row) => row.subjectId === "assoc-1" && row.effective === "STALE")).toBe(true);
    expect(bundle.r4.states.some((row) => row.subjectId === "cmp-1" && row.effective === "STALE")).toBe(true);
    expect(bundle.r4.states.some((row) => row.subjectId === "link-1" && row.effective === "STALE")).toBe(true);
    expect(bundle.r4.analysisLinks[0]?.analysisRunId).toBe("run-1");
    expect(bundle.r4.invalidations.every((row) => row.deletesSubject === false)).toBe(true);
    expect(() => rebindStaleTarget()).toThrow(/STALE_TARGET_AUTO_REBOUND_REJECTED/);
  });

  it("stales continuity when the condition state or rating scheme changes", () => {
    const bundle = comparableMeasurements();
    recordHumanValidation(bundle.r1, bundle.r2, validators, { validationId: "val-find", inspectionContextId: "ctx-1", subjectType: "FINDING_CLASSIFICATION", subjectId: "find-1", scopeStatement: "classification only", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-01-01T05:00:00.000Z", decision: "CONFIRMED", limitations: "classification only", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null });
    recordHumanValidation(bundle.r1, bundle.r2, validators, { validationId: "val-find-2", inspectionContextId: "ctx-2", subjectType: "FINDING_CLASSIFICATION", subjectId: "find-2", scopeStatement: "classification only", validatorId: "rev-1", role: "ENGINEER_REVIEWER", validatedAt: "2026-06-01T05:00:00.000Z", decision: "CONFIRMED", limitations: "classification only", authority: "HUMAN", provenance: provenance(), version: "1", supersedesValidationId: null });
    registerConditionRatingScheme(bundle.r1, bundle.r3, "ctx-1", schemeInput());
    const interpretation = { interpretationId: "int-1", inspectionContextId: "ctx-1", targetId: "mem-1", supportingEvidenceIds: ["ev-1"], supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], supportingValidationIds: ["val-find"], authorId: "engineer-1", reviewerId: null, statement: "Observed condition is recorded.", basisRefs: ["inspection-note:n1"], limitations: "visible face", assumptions: "none", createdAt: "2026-01-01T06:00:00.000Z", authority: "HUMAN" as const, provenance: provenance(), version: "1" };
    recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, interpretation);
    recordEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, { ...interpretation, interpretationId: "int-2", inspectionContextId: "ctx-2", supportingEvidenceIds: ["ev-2"], supportingFindingIds: ["find-2"], supportingMeasurementIds: ["meas-2"], supportingValidationIds: ["val-find-2"], createdAt: "2026-06-01T06:00:00.000Z", statement: "Later observation is recorded.", basisRefs: ["inspection-note:n2"] });
    const rating = (overrides: Partial<D1hR3RatingInput>): D1hR3RatingInput => ({ ratingId: "rate-1", inspectionContextId: "ctx-1", targetId: "mem-1", ratingSchemeId: "TEST_CONDITION_SCHEME_V1", schemeVersion: "1", ratingValueCode: "1", interpretationId: "int-1", assessmentBasisRef: "inspection-note:n1", supportingEvidenceIds: ["ev-1"], supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], limitations: "visible face", assessedAt: "2026-01-01T07:00:00.000Z", authority: "HUMAN", provenance: provenance(), version: "1", imported: false, ...overrides });
    recordConditionRating(bundle.r1, bundle.r2, bundle.r3, rating({}));
    recordConditionRating(bundle.r1, bundle.r2, bundle.r3, rating({ ratingId: "rate-2", inspectionContextId: "ctx-2", interpretationId: "int-2", assessmentBasisRef: "inspection-note:n2", supportingEvidenceIds: ["ev-2"], supportingFindingIds: ["find-2"], supportingMeasurementIds: ["meas-2"], assessedAt: "2026-06-01T07:00:00.000Z", ratingValueCode: "2" }));
    const state = { conditionStateId: "state-1", inspectionContextId: "ctx-1", targetId: "mem-1", assessmentScope: "member-face", ratingId: "rate-1", interpretationId: "int-1", assessmentBasisRef: "inspection-note:n1", supportingFindingIds: ["find-1"], supportingMeasurementIds: ["meas-1"], supportingEvidenceIds: ["ev-1"], relevantValidationIds: ["val-find"], coverageIds: ["cov-1"], authority: "HUMAN" as const, status: "CURRENT" as const, limitations: "visible face", createdAt: "2026-01-01T08:00:00.000Z", createdBy: "engineer-1", provenance: provenance(), version: "1" };
    recordConditionState(bundle.r1, bundle.r2, bundle.r3, state);
    recordConditionState(bundle.r1, bundle.r2, bundle.r3, { ...state, conditionStateId: "state-2", inspectionContextId: "ctx-2", ratingId: "rate-2", interpretationId: "int-2", assessmentBasisRef: "inspection-note:n2", supportingFindingIds: ["find-2"], supportingMeasurementIds: ["meas-2"], supportingEvidenceIds: ["ev-2"], relevantValidationIds: ["val-find-2"], coverageIds: ["cov-2"], createdAt: "2026-06-01T08:00:00.000Z" });
    const continuity = recordConditionContinuity(bundle.r1, bundle.r3, bundle.r4, { continuityId: "cont-1", targetId: "mem-1", priorConditionStateId: "state-1", currentConditionStateId: "state-2", associationIds: [], comparisonIds: [], continuityStatus: "RECORDED", authority: "HUMAN", limitations: "reference only", recordCreatedAt: "2026-06-02T00:00:00.000Z", provenance: provenance(), version: "1" });
    const snapshot = JSON.stringify(continuity);
    correctConditionContinuity(bundle.r1, bundle.r3, bundle.r4, "cont-1", { continuityId: "cont-2", targetId: "mem-1", priorConditionStateId: "state-1", currentConditionStateId: "state-2", associationIds: [], comparisonIds: [], continuityStatus: "RECORDED", authority: "HUMAN", limitations: "later review", recordCreatedAt: "2026-06-02T02:00:00.000Z", provenance: provenance(), version: "2" });
    expect(JSON.stringify(bundle.r4.continuities[0])).toBe(snapshot);
    correctEngineeringInterpretation(bundle.r1, bundle.r2, bundle.r3, "int-1", { ...interpretation, interpretationId: "int-1b", version: "2", statement: "Corrected observation statement." });
    correctConditionState(bundle.r1, bundle.r2, bundle.r3, "state-1", { ...state, conditionStateId: "state-1b", version: "2", interpretationId: "int-1b" });
    retireConditionRatingScheme(bundle.r3, "TEST_CONDITION_SCHEME_V1", "1", "2026-06-03T00:00:00.000Z");
    invalidateStructuralInspectionRecord(bundle.r1, "TARGET_REVISION", "TARGET", "mem-1", "2026-06-04T00:00:00.000Z");
    propagateTemporalStaleness(bundle.r1, bundle.r2, bundle.r3, [], bundle.r4, "2026-06-04T01:00:00.000Z");
    expect(JSON.stringify(bundle.r4.continuities[0])).toBe(snapshot);
    expect(bundle.r4.states.some((row) => row.subjectId === "cont-1" && row.effective === "STALE")).toBe(true);
    expect(bundle.r4.continuities.length).toBe(2);
    withdrawTemporalAuthority(bundle.r4, "CONTINUITY", "cont-1", "2026-06-05T00:00:00.000Z");
    expect(bundle.r4.continuities.length).toBe(2);
  });

  it("changes fingerprints, repeats a result, and keeps diagnostics separate from findings", () => {
    const bundle = comparableMeasurements();
    const association = recordFindingAssociation(bundle.r1, bundle.r2, bundle.r4, associationInput());
    const other = pair();
    expect(recordFindingAssociation(other.r1, other.r2, other.r4, associationInput({ associationStatus: "CONTINUITY_UNRESOLVED" })).fingerprint).not.toBe(association.fingerprint);
    const comparison = recordMeasurementComparison(bundle.r1, bundle.r2, bundle.r4, comparisonInput());
    const again = comparableMeasurements();
    expect(recordMeasurementComparison(again.r1, again.r2, again.r4, comparisonInput({ version: "2" })).fingerprint).not.toBe(comparison.fingerprint);
    const identities = [identity()];
    const link = recordAnalysisResultLink(bundle.r1, bundle.r2, bundle.source.analysisResults, identities, bundle.r4, linkInput());
    expect(recordAnalysisResultLink(again.r1, again.r2, again.source.analysisResults, [identity("run-9")], again.r4, linkInput()).fingerprint).not.toBe(link.fingerprint);
    selectCurrentFindingAssociation(bundle.r4, association.associationId, "HUMAN", "2026-06-03T00:00:00.000Z");
    const result = evaluateTemporalAssociation(bundle.r1, bundle.r2, bundle.r3, identities, bundle.r4, { resultId: "temporal-1", inspectionContextIds: ["ctx-1", "ctx-2"], declaredAssociationIds: ["assoc-1"], declaredContinuityIds: [], declaredComparisonIds: ["cmp-1"], declaredChangeEvidenceIds: [], declaredAnalysisLinkIds: ["link-1"], scope: "declared temporal scope", provenance: provenance() });
    expect(result.completeness).toBe("COMPLETE_FOR_DECLARED_TEMPORAL_SCOPE");
    expect(result.deteriorationAssessment).toBe(false);
    expect(result.causalDiagnosis).toBe(false);
    expect(result.structuralAdequacy).toBe(false);
    expect("findings" in result).toBe(false);
    expect(result.runtimeDiagnostics.every((row) => row.structuralFinding === false)).toBe(true);
    expect(D1H_R4_COMPLETENESS_STATES).toContain("COMPLETE_FOR_DECLARED_TEMPORAL_SCOPE");
    expect(D1H_R5_REQUIRED_R4_CONTRACTS).toContain("analysisResultLinkIdentity");
    expect(D1H_R4_DIGITAL_TWIN_RUNTIME_COUNT).toBe(0);
    expect(D1H_R4_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
  });

  it("keeps the temporal runtime inside its boundary and updates the capability manifest", () => {
    const sourceText = readFileSync(sourcePath, "utf8");
    const doc = readFileSync(docPath, "utf8");
    expect(scanAnalysisFormulaBypass(sourcePath, sourceText)).toEqual([]);
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(`${sourceText}\n${doc}`).not.toMatch(/corrosion rate\s*=|crack growth\s*=|fatigue life\s*=|remaining life\s*=|future value\s*=|capacity reduction\s*=|stiffness loss\s*=/i);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_FINDING_ASSOCIATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CONDITION_TEMPORAL_CONTINUITY")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_MEASUREMENT_HISTORICAL_COMPARISON")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CHANGE_EVIDENCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_ANALYSIS_RESULT_LINKAGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_DETERIORATION_PREDICTION")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CAUSAL_DIAGNOSIS")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_DIGITAL_TWIN")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1H.STRUCTURAL_CONDITION_RUNTIME")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
