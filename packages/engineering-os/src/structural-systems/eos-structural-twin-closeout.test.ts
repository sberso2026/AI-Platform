import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { D1hProvenanceRef } from "@rtb/types";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import type { D1hR1ContextRecord } from "./inspection-evidence";
import type { D1hR2InspectionMeasurement } from "./inspection-finding";
import type { D1hR3ConditionState } from "./inspection-condition";
import type { D1hR4AnalysisIdentityRef } from "./inspection-temporal";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { D1I_RUNTIME_IMPLEMENTED, D1J_STARTED, D1_STRUCTURAL_PACK_COMPLETE, D2_STARTED_BY_THIS_PHASE } from "./post-d1h-roadmap";
import {
  type D1iR1Actor,
  type D1iR1Catalog,
  type D1iR1StructuralIdentity,
  createD1iR1Store,
  createTwin,
  evaluateStateReferenceStatus,
  registerStateReference,
} from "./twin-reference-foundation";
import { createD1iR2Store, createExplicitTwinSnapshot, evaluateCurrentSelection, queryAsKnownAtTime, queryAsOfEffectiveTime, selectCurrentStateReference } from "./twin-temporal-governance";
import { assessStateCompatibility, composeMultiSourceState, confirmConflict, conflictStatusAsKnownAt, createConflictCandidate, createD1iR3Store, recordConflictDisposition, retireComparatorVersion, type D1iR3BasisSide } from "./twin-conflict-composition";
import {
  assessClockCompatibility,
  bindMonitoringChannelToStructuralTarget,
  createD1iR4Store,
  registerGovernedMonitoringImport,
  registerMonitoringChannelReference,
  registerMonitoringDeviceReference,
  registerMonitoringSource,
  registerTelemetryDataReference,
  registerTelemetryStateReference,
  reportObservedSourceFingerprint,
  evaluateTelemetryReferenceStatus,
  supersedeMonitoringDevice,
  supersedeMonitoringTargetBinding,
  withdrawMonitoringSourceAuthority,
  type D1iR4Store,
} from "./twin-monitoring-reference";
import {
  CANONICAL_NEXT_PHASE,
  D1G_CERTIFIED_SOLVER_STATUS,
  D1I_FINAL_MATURITY_EQUALS_ENGINEER_VALIDATED,
  D1I_METHOD_CONFORMANCE_VALIDATION_COUNT,
  D1I_R5_CALLER_CHECKSUM_ALONE_CAN_REGISTER_EXACT_DATASET,
  D1I_R5_CURRENT_BINDING_RETROACTIVELY_APPLIES_TO_OLD_DATA,
  D1I_R5_D1J_ASSUMES_CERTIFIED_D1G_SOLVER,
  D1I_R5_D1J_BOUNDED_DEVELOPMENT_PERMISSION,
  D1I_R5_FINAL_MATURITY_STATE,
  D1I_R5_HISTORICAL_BINDING_APPLIES_AFTER_RELOCATION,
  D1I_R5_LATER_CALIBRATION_RETROACTIVELY_VALIDATES_OLD_DATA,
  D1I_R5_SINGLE_UNIVERSAL_CURRENT_STATE,
  D1I_SOFTWARE_ENGINEER_VALIDATION_COUNT,
  D1I_STREAMING_RUNTIME_COUNT,
  D1J_CURRENT_STATUS,
  D1_STRUCTURAL_PACK_COMPLETE as D1_PACK_FROM_CLOSEOUT,
  D2_STARTED_BY_D1I_CLOSEOUT,
  NEXT_PHASE_TYPE,
} from "./twin-closeout";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D1iR1Actor = { actorId: "engineer-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authority: "HUMAN" };

function provenance(): D1hProvenanceRef {
  return { tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", actorOrSystem: "inspector-1", timestamp: "2026-06-10T00:00:00.000Z", authority: "HUMAN", version: "1", fingerprint: "prov-fp" };
}

function identity(kind: D1iR1StructuralIdentity["kind"], id: string): D1iR1StructuralIdentity {
  return { kind, id, structuralSystemId: kind === "STRUCTURAL_SYSTEM" ? id : "sys-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", version: "1", lifecycle: "CURRENT", authority: "HUMAN", validationState: "CURRENT", effectiveAt: "2026-01-01T00:00:00.000Z", contentFingerprint: `${kind}-${id}-fp` };
}

function context(): D1hR1ContextRecord {
  return { inspectionContextId: "ctx-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1", inspectionSessionId: "ses-1", purpose: "ROUTINE", scopeStatement: "member scope", inspectedAt: "2026-06-01T00:00:00.000Z", coverageScopeRef: "scope-1", methodRefs: ["visual"], sourceAuthority: "HUMAN", governanceProfileRef: "profile-1", provenance: provenance(), version: "1", status: "RECORDED", declaredTargetIds: ["mem-1"], recordedAt: "2026-06-10T00:00:00.000Z", fingerprint: "ctx-ctx-1-fp", engineeringApproval: false, predecessorId: null };
}

function condition(id: string): D1hR3ConditionState {
  return { recordKind: "CONDITION_STATE", conditionStateId: id, inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", targetKind: "MEMBER", assessmentScope: "member-face", ratingSchemeId: null, schemeVersion: null, schemeFingerprint: null, ratingId: null, ratingValueCode: null, interpretationId: null, assessmentBasisRef: "basis-1", supportingFindingIds: [], supportingMeasurementIds: [], supportingEvidenceIds: [], relevantValidationIds: [], coverageIds: [], coverageLimitations: [], inputValidation: [], allInputsValidated: false, authority: "HUMAN", status: "CURRENT", limitations: "limited access", createdAt: "2026-06-09T00:00:00.000Z", createdBy: "inspector-1", provenance: provenance(), version: "4", fingerprint: `cond-${id}-fp`, supersedesConditionStateId: null, goodCondition: false, structuralAdequacy: false, assetSafe: false, repairRequired: false, sectionPropertyChanged: false, materialPropertyChanged: false, capacityChanged: false, analysisModelChanged: false, supportChanged: false, releaseChanged: false, loadChanged: false, analysisInputCreated: false, repairActionCreated: false };
}

function measurement(id: string, measuredAt: string): D1hR2InspectionMeasurement {
  return { recordKind: "INSPECTION_MEASUREMENT", measurementId: id, inspectionContextId: "ctx-1", inspectionSessionId: "ses-1", targetId: "mem-1", evidenceId: "ev-1", findingId: null, quantity: "crack-width", value: 424242, unit: "mm", location: null, methodRef: "gauge", sourceType: "INSTRUMENT_MEASURED", instrumentRef: "gauge-1", measuredAt, uncertainty: null, accuracy: null, calibrationBasis: null, modelIdentity: null, modelVersion: null, authority: "HUMAN", validationState: "UNVALIDATED", provenance: provenance(), version: "2", fingerprint: `meas-${id}-fp`, supersedesMeasurementId: null, governs: false, instrumentMeasured: true, sectionPropertyUpdated: false, analysisGeometryUpdated: false, capacityChanged: false, materialPropertyChanged: false, analysisModelChanged: false };
}

function analysis(): D1hR4AnalysisIdentityRef {
  return { analysisResultId: "result-1", analysisModelId: "model-1", analysisModelVersion: "7", analysisModelFingerprint: "model-fp-1", analysisRunId: "run-1", analysisRunFingerprint: "run-fp-1", resultSetId: "set-1", normalizedResultId: "norm-1", resultClass: "GOVERNED_RESULT", authorityState: "VERIFIED_GOVERNED", runStatus: "COMPLETED", resultCategory: "NODAL_DISPLACEMENT", quantity: "displacement", locationKind: "MEMBER_START", loadCaseId: "case-1", combinationId: "comb-1", providerId: "provider-1", providerVersion: "1", providerProvenanceRef: "d1g-provider-provenance", modelValidationEvidenceRef: null, analysisTimestamp: "2026-06-01T00:00:00.000Z", structuralStateRef: "analysis-state", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1" };
}

function catalog(): D1iR1Catalog {
  return { identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("MEMBER", "mem-1"), identity("MEMBER", "mem-2")], contexts: [context()], findings: [], measurements: [measurement("meas-1", "2026-06-01T00:00:00.000Z"), measurement("meas-2", "2026-06-01T00:00:00.000Z"), measurement("meas-late", "2026-07-01T00:00:00.000Z")], interpretations: [], conditionStates: [condition("cond-1")], analysisResults: [analysis()], upstreamMarks: [] };
}

function boot(clock: { now: string }) {
  const source = catalog();
  const runtime = createD1iR4Store(createD1iR3Store(createD1iR2Store(createD1iR1Store(source, () => clock.now))));
  createTwin(runtime, actor, { twinId: "twin-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", twinScope: "STRUCTURAL_SYSTEM", targetKind: "STRUCTURAL_SYSTEM", targetId: "sys-1", parentStructuralSystemId: null, purpose: "inspection-history", governanceProfileRef: "profile-1", version: "1" });
  return { runtime, source };
}

function pin(runtime: D1iR4Store, objectType: string, objectId: string, stateClass: string, stateReferenceId: string) {
  return registerStateReference(runtime, actor, { stateReferenceId, twinId: "twin-1", sourceDomain: objectType === "ANALYSIS_RESULT" ? "D1F_ANALYSIS" : "D1H_INSPECTION_CONDITION", sourceObjectType: objectType, sourceObjectId: objectId, stateClass, limitations: "pinned", version: "1" });
}

function side(referenceId: string, overrides: Partial<D1iR3BasisSide> = {}): D1iR3BasisSide {
  return { stateReferenceId: referenceId, quantity: "length", unit: "m", location: "face-a", method: "gauge", descriptiveValue: "12.1", ...overrides };
}

function lane(stateClass: string, targetId: string, sourceDomain = "D1H_INSPECTION_CONDITION") {
  return { twinId: "twin-1", targetId, stateClass, sourceDomain, purpose: "review", selectionBasis: "human-review", limitations: "lane only", version: "1" };
}

function monitor(runtime: D1iR4Store) {
  registerMonitoringSource(runtime, actor, { monitoringSourceId: "src-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", providerKind: "DATA_LOGGER", sourceSystemType: "LOGGER", externalSystemInstanceRef: "instance-src-1", sourceAuthority: "EXTERNAL_OWNER", version: "1" });
  registerMonitoringDeviceReference(runtime, actor, { deviceReferenceId: "dev-1", monitoringSourceId: "src-1", externalDeviceId: "serial-a", deviceType: "ACCELEROMETER", displayName: "North gauge", version: "1" });
  return registerMonitoringChannelReference(runtime, actor, { channelReferenceId: "ch-1", deviceReferenceId: "dev-1", externalChannelId: "ch-1", channelName: "X", measurementQuantity: "acceleration", unit: "m/s2", axis: "member-local-x", processingClass: "RAW_SOURCE_DATA", calibration: { calibrationStatus: "CALIBRATED_SOURCE_REPORTED", calibrationReferenceId: "cal-1", calibrationDate: "2026-01-01T00:00:00.000Z" }, version: "1" });
}

function bindAt(runtime: D1iR4Store, id: string, channelReferenceId: string, targetId: string, from: string, to: string) {
  return bindMonitoringChannelToStructuralTarget(runtime, actor, { bindingId: id, twinId: "twin-1", channelReferenceId, targetKind: "MEMBER", targetId, bindingPurpose: "local-response-reference", basis: "installation-record", limitations: "interval required", effectiveFrom: from, effectiveTo: to, version: "1" });
}

function cite(runtime: D1iR4Store, id: string, externalId: string, fingerprint: string) {
  return registerGovernedMonitoringImport(runtime, actor, { importId: `import-${id}`, monitoringSourceId: "src-1", artifactId: `artifact-${id}`, externalDatasetOrObservationId: externalId, sourceFingerprint: fingerprint, version: "1" });
}

describe("EOS-D1I-R5 structural digital twin closeout", () => {
  it("closes one bounded twin without copying upstream bodies or promoting validation", () => {
    const clock = { now: "2026-06-20T00:00:00.000Z" };
    const { runtime, source } = boot(clock);
    const before = JSON.stringify(source);
    const analytical = pin(runtime, "ANALYSIS_RESULT", "result-1", "ANALYTICAL_STATE", "ref-an");
    const measured = pin(runtime, "INSPECTION_MEASUREMENT", "meas-1", "MEASURED_STATE", "ref-meas");
    const measuredLater = pin(runtime, "INSPECTION_MEASUREMENT", "meas-2", "MEASURED_STATE", "ref-meas-2");
    const conditionRef = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-cond");
    expect(analytical.stateClass).toBe("ANALYTICAL_STATE");
    expect(analytical.governsPhysicalState).toBe(false);
    const analyticalSelection = selectCurrentStateReference(runtime, actor, { ...lane("ANALYTICAL_STATE", "sys-1", "D1F_ANALYSIS"), stateReferenceId: analytical.stateReferenceId });
    const conditionSelection = selectCurrentStateReference(runtime, actor, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: conditionRef.stateReferenceId });
    expect(analyticalSelection.selectionId).not.toBe(conditionSelection.selectionId);
    expect(analyticalSelection.structuralTruth).toBe(false);
    expect(analyticalSelection.engineeringApproval).toBe(false);
    expect(analyticalSelection.validatedSource).toBe(false);
    const snapshot = createExplicitTwinSnapshot(runtime, actor, { twinId: "twin-1", snapshotPurpose: "HISTORICAL_RECORD", declaredScope: { targetIds: ["sys-1", "mem-1"], stateClasses: ["ANALYTICAL_STATE", "MEASURED_STATE", "CONDITION_STATE"], sourceDomains: [], purpose: "review" }, stateReferenceIds: [analytical.stateReferenceId, measured.stateReferenceId, conditionRef.stateReferenceId], limitations: "declared", version: "1" });
    const frozenIds = [...snapshot.stateReferenceIds];
    const known = queryAsKnownAtTime(runtime, { twinId: "twin-1", knownAt: "2026-06-20T00:00:00.000Z", declaredScope: { targetIds: ["sys-1", "mem-1"], stateClasses: ["ANALYTICAL_STATE", "MEASURED_STATE", "CONDITION_STATE", "TELEMETRY_STATE"], sourceDomains: [], purpose: "review" } });
    const asOf = queryAsOfEffectiveTime(runtime, { twinId: "twin-1", effectiveTime: "2026-06-01T00:00:00.000Z", knownAtCutoff: "2026-06-20T00:00:00.000Z", declaredScope: { targetIds: ["sys-1", "mem-1"], stateClasses: ["ANALYTICAL_STATE", "MEASURED_STATE", "CONDITION_STATE"], sourceDomains: [], purpose: "review" } });
    expect(asOf.eligibleReferenceIds).toEqual(expect.arrayContaining([analytical.stateReferenceId, measured.stateReferenceId, conditionRef.stateReferenceId]));
    const assessment = assessStateCompatibility(runtime, actor, { twinId: "twin-1", stateReferenceIds: [measured.stateReferenceId, measuredLater.stateReferenceId], comparisonPurpose: "review", basis: [side(measured.stateReferenceId, { descriptiveValue: "12.1" }), side(measuredLater.stateReferenceId, { descriptiveValue: "12.4" })], version: "1" });
    expect(assessment.differenceObserved).toBe(true);
    expect(assessment.conflictCreated).toBe(false);
    const candidate = createConflictCandidate(runtime, actor, { compatibilityAssessmentId: assessment.compatibilityAssessmentId, candidateBasis: "values differ", version: "1" });
    expect(candidate.status).toBe("CANDIDATE");
    clock.now = "2026-06-21T00:00:00.000Z";
    const confirmed = confirmConflict(runtime, actor, { conflictId: candidate.conflictId, reviewBasis: "human review", reviewScope: "review", limitations: "not truth", version: "2" });
    const selectionsBeforeDisposition = JSON.stringify(runtime.selections);
    recordConflictDisposition(runtime, actor, { conflictId: confirmed.conflict.conflictId, reviewId: confirmed.review.reviewId, purpose: "acknowledge", outcome: "ACKNOWLEDGE_PARALLEL_STATES", limitations: "no selection change", version: "1" });
    expect(JSON.stringify(runtime.selections)).toBe(selectionsBeforeDisposition);
    expect(conflictStatusAsKnownAt(runtime, candidate.conflictId, "2026-06-20T00:00:00.000Z")).toBe("CANDIDATE");
    const composition = composeMultiSourceState(runtime, actor, { twinId: "twin-1", declaredScope: { targetIds: ["mem-1"], stateClasses: ["MEASURED_STATE"], purpose: "review" }, stateReferenceIds: [measured.stateReferenceId, measuredLater.stateReferenceId], compatibilityAssessmentIds: [assessment.compatibilityAssessmentId], conflictIds: [candidate.conflictId], limitations: "references only", version: "1" });
    expect(composition.fingerprint).toBeTruthy();
    monitor(runtime);
    const binding = bindAt(runtime, "bind-b1", "ch-1", "mem-1", "2026-01-01T00:00:00.000Z", "2026-07-31T00:00:00.000Z");
    cite(runtime, "tel-1", "dataset-tel-1", "governed-tel-1");
    const telemetry = registerTelemetryDataReference(runtime, actor, { telemetryReferenceId: "tel-1", monitoringSourceId: "src-1", deviceReferenceId: "dev-1", channelReferenceIds: ["ch-1"], externalDatasetOrObservationId: "dataset-tel-1", sourceDataClass: "RAW_SOURCE_DATA", governedImportId: "import-tel-1", targetBindingIds: [binding.bindingId], limitations: "reference only", version: "1", timeBasis: { deviceTime: "2026-06-01T00:00:00.000Z", observationTime: "2026-06-01T00:00:00.000Z", datasetStart: "2026-06-01T00:00:00.000Z", datasetEnd: "2026-06-01T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" } });
    const telemetryState = registerTelemetryStateReference(runtime, actor, { telemetryReferenceId: telemetry.telemetryReferenceId, version: "1", limitations: "pin" });
    expect(telemetryState.stateClass).toBe("TELEMETRY_STATE");
    expect(telemetry.sourceFingerprint).toBe("governed-tel-1");
    expect(runtime.references.find((row) => row.stateReferenceId === telemetryState.stateReferenceId)?.sourceFingerprint).toBe(telemetry.fingerprint);
    expect(runtime.selections.map((row) => row.selectionId).sort()).toEqual([analyticalSelection.selectionId, conditionSelection.selectionId].sort());
    expect([...snapshot.stateReferenceIds]).toEqual(frozenIds);
    expect(runtime.conflicts).toHaveLength(2);
    clock.now = "2026-07-02T00:00:00.000Z";
    const late = pin(runtime, "INSPECTION_MEASUREMENT", "meas-late", "MEASURED_STATE", "ref-late");
    const priorKnown = queryAsKnownAtTime(runtime, { twinId: "twin-1", knownAt: "2026-06-20T00:00:00.000Z", declaredScope: { targetIds: ["sys-1", "mem-1"], stateClasses: ["MEASURED_STATE"], sourceDomains: [], purpose: "review" } });
    expect(priorKnown.eligibleReferenceIds).not.toContain(late.stateReferenceId);
    expect(known.eligibleReferenceIds).not.toContain(late.stateReferenceId);
    const moved = supersedeMonitoringTargetBinding(runtime, actor, binding.bindingId, { bindingId: "bind-b2", twinId: "twin-1", channelReferenceId: "ch-1", targetKind: "MEMBER", targetId: "mem-2", bindingPurpose: "relocated", basis: "installation-record", limitations: "successor", effectiveFrom: "2026-08-01T00:00:00.000Z", effectiveTo: "2026-12-31T00:00:00.000Z", version: "2" });
    expect(telemetry.targetBindingIds).toEqual([binding.bindingId]);
    expect(moved.structuralTargetRef.targetId).toBe("mem-2");
    const replaced = supersedeMonitoringDevice(runtime, actor, "dev-1", { deviceReferenceId: "dev-2", monitoringSourceId: "src-1", externalDeviceId: "serial-b", deviceType: "ACCELEROMETER", displayName: "North gauge", version: "1" });
    expect(telemetry.deviceReferenceId).toBe("dev-1");
    expect(replaced.deviceReferenceId).toBe("dev-2");
    const laterChannel = registerMonitoringChannelReference(runtime, actor, { channelReferenceId: "ch-2", deviceReferenceId: "dev-2", externalChannelId: "ch-2", channelName: "X2", measurementQuantity: "acceleration", unit: "m/s2", axis: "member-local-x", processingClass: "RAW_SOURCE_DATA", calibration: { calibrationStatus: "CALIBRATED_SOURCE_REPORTED", calibrationReferenceId: "cal-2" }, version: "1" });
    expect(telemetry.calibration.calibrationReferenceId).toBe("cal-1");
    expect(laterChannel.calibration.calibrationReferenceId).toBe("cal-2");
    expect(source.analysisResults[0]?.analysisModelFingerprint).toBe("model-fp-1");
    expect(source.conditionStates[0]?.capacityChanged).toBe(false);
    expect(source.measurements[0]?.fingerprint).toBe("meas-meas-1-fp");
    expect(JSON.stringify(source)).toBe(before);
    source.analysisResults[0]!.analysisModelFingerprint = "model-fp-2";
    expect(evaluateStateReferenceStatus(runtime, analytical.stateReferenceId).referenceStatus).toBe("STALE_REFERENCE");
    source.measurements[0]!.fingerprint = "meas-changed";
    expect(evaluateStateReferenceStatus(runtime, measured.stateReferenceId).referenceStatus).toBe("STALE_REFERENCE");
    expect(evaluateCurrentSelection(runtime, analyticalSelection.selectionId).status).toBe("STALE_REVIEW_REQUIRED");
    retireComparatorVersion(runtime, assessment.comparatorVersion);
    expect(runtime.conflictHistory.some((row) => row.subjectId === assessment.compatibilityAssessmentId && row.action === "STALE")).toBe(true);
    evaluateTelemetryReferenceStatus(runtime, telemetry.telemetryReferenceId);
    expect(runtime.monitoringHistory.some((row) => row.subjectId === telemetry.telemetryReferenceId && row.action === "STALE")).toBe(true);
    expect(() => registerMonitoringChannelReference(runtime, actor, { channelReferenceId: "ch-1", deviceReferenceId: "dev-1", externalChannelId: "ch-1", channelName: "X", measurementQuantity: "acceleration", unit: "mm/s2", axis: "member-local-x", processingClass: "RAW_SOURCE_DATA", version: "2" })).toThrow("CHANNEL_CONFIGURATION_MUTATED");
    reportObservedSourceFingerprint(runtime, telemetry.telemetryReferenceId, "other-fingerprint");
    expect(telemetry.sourceFingerprint).toBe("governed-tel-1");
    withdrawMonitoringSourceAuthority(runtime, "EXTERNAL_OWNER");
    expect(D1I_SOFTWARE_ENGINEER_VALIDATION_COUNT).toBe(0);
    expect(D1I_METHOD_CONFORMANCE_VALIDATION_COUNT).toBe(0);
    expect(D1I_FINAL_MATURITY_EQUALS_ENGINEER_VALIDATED).toBe(false);
  });

  it("attributes telemetry only inside an explicit binding interval", () => {
    const clock = { now: "2026-09-01T00:00:00.000Z" };
    const { runtime } = boot(clock);
    monitor(runtime);
    const early = bindAt(runtime, "bind-b1", "ch-1", "mem-1", "2026-07-01T00:00:00.000Z", "2026-08-01T00:00:00.000Z");
    cite(runtime, "before", "dataset-before", "fp-before");
    const june = { telemetryReferenceId: "before", monitoringSourceId: "src-1", deviceReferenceId: "dev-1", channelReferenceIds: ["ch-1"], externalDatasetOrObservationId: "dataset-before", sourceDataClass: "RAW_SOURCE_DATA", governedImportId: "import-before", targetBindingIds: [early.bindingId], limitations: "before", version: "1", timeBasis: { observationTime: "2026-06-15T00:00:00.000Z", datasetStart: "2026-06-15T00:00:00.000Z", datasetEnd: "2026-06-15T00:00:00.000Z", clockQuality: "UNKNOWN" as const, clockClaimAuthority: "UNKNOWN" as const } };
    expect(() => registerTelemetryDataReference(runtime, actor, june)).toThrow("BINDING_TIME_INCOMPATIBLE");
    cite(runtime, "inside", "dataset-inside", "fp-inside");
    const inside = registerTelemetryDataReference(runtime, actor, { ...june, telemetryReferenceId: "inside", externalDatasetOrObservationId: "dataset-inside", governedImportId: "import-inside", timeBasis: { observationTime: "2026-07-15T00:00:00.000Z", datasetStart: "2026-07-15T00:00:00.000Z", datasetEnd: "2026-07-15T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" } });
    expect(inside.targetBindingIds).toEqual([early.bindingId]);
    cite(runtime, "after", "dataset-after", "fp-after");
    expect(() => registerTelemetryDataReference(runtime, actor, { ...june, telemetryReferenceId: "after", externalDatasetOrObservationId: "dataset-after", governedImportId: "import-after", timeBasis: { observationTime: "2026-09-01T00:00:00.000Z", datasetStart: "2026-09-01T00:00:00.000Z", datasetEnd: "2026-09-01T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" } })).toThrow("BINDING_TIME_INCOMPATIBLE");
    const successor = supersedeMonitoringTargetBinding(runtime, actor, early.bindingId, { bindingId: "bind-b2", twinId: "twin-1", channelReferenceId: "ch-1", targetKind: "MEMBER", targetId: "mem-2", bindingPurpose: "relocated", basis: "installation-record", limitations: "successor", effectiveFrom: "2026-08-01T00:00:00.000Z", effectiveTo: "2026-12-31T00:00:00.000Z", version: "2" });
    cite(runtime, "sept", "dataset-sept", "fp-sept");
    const september = registerTelemetryDataReference(runtime, actor, { ...june, telemetryReferenceId: "sept", externalDatasetOrObservationId: "dataset-sept", governedImportId: "import-sept", targetBindingIds: [successor.bindingId], timeBasis: { observationTime: "2026-09-01T00:00:00.000Z", datasetStart: "2026-09-01T00:00:00.000Z", datasetEnd: "2026-09-01T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" } });
    expect(september.targetBindingIds).toEqual([successor.bindingId]);
    expect(inside.targetBindingIds).toEqual([early.bindingId]);
    expect(D1I_R5_CURRENT_BINDING_RETROACTIVELY_APPLIES_TO_OLD_DATA).toBe(false);
    expect(D1I_R5_HISTORICAL_BINDING_APPLIES_AFTER_RELOCATION).toBe(false);
  });

  it("fails closed for unknown binding time, partial channels, and caller checksums", () => {
    const { runtime } = boot({ now: "2026-06-20T00:00:00.000Z" });
    monitor(runtime);
    registerMonitoringChannelReference(runtime, actor, { channelReferenceId: "ch-2", deviceReferenceId: "dev-1", externalChannelId: "ch-2", channelName: "Y", measurementQuantity: "acceleration", unit: "m/s2", axis: "member-local-y", processingClass: "RAW_SOURCE_DATA", version: "1" });
    const undated = bindMonitoringChannelToStructuralTarget(runtime, actor, { bindingId: "bind-unknown", twinId: "twin-1", channelReferenceId: "ch-1", targetKind: "MEMBER", targetId: "mem-1", bindingPurpose: "local-response-reference", basis: "installation-record", limitations: "unknown interval", version: "1" });
    cite(runtime, "unknown", "dataset-unknown", "fp-unknown");
    expect(() => registerTelemetryDataReference(runtime, actor, { telemetryReferenceId: "unknown", monitoringSourceId: "src-1", deviceReferenceId: "dev-1", channelReferenceIds: ["ch-1"], externalDatasetOrObservationId: "dataset-unknown", sourceDataClass: "RAW_SOURCE_DATA", governedImportId: "import-unknown", targetBindingIds: [undated.bindingId], limitations: "unresolved", version: "1", timeBasis: { observationTime: "2026-06-01T00:00:00.000Z", datasetStart: "2026-06-01T00:00:00.000Z", datasetEnd: "2026-06-01T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" } })).toThrow("BINDING_TIME_UNRESOLVED");
    const dated = bindAt(runtime, "bind-one", "ch-1", "mem-1", "2026-01-01T00:00:00.000Z", "2026-12-31T00:00:00.000Z");
    cite(runtime, "multi", "dataset-multi", "fp-multi");
    expect(() => registerTelemetryDataReference(runtime, actor, { telemetryReferenceId: "multi", monitoringSourceId: "src-1", deviceReferenceId: "dev-1", channelReferenceIds: ["ch-1", "ch-2"], externalDatasetOrObservationId: "dataset-multi", sourceDataClass: "RAW_SOURCE_DATA", governedImportId: "import-multi", targetBindingIds: [dated.bindingId], limitations: "one channel", version: "1", timeBasis: { observationTime: "2026-06-01T00:00:00.000Z", datasetStart: "2026-06-01T00:00:00.000Z", datasetEnd: "2026-06-01T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" } })).toThrow("TARGET_BINDING_REQUIRED");
    expect(() => registerTelemetryDataReference(runtime, actor, { telemetryReferenceId: "bare", monitoringSourceId: "src-1", deviceReferenceId: "dev-1", channelReferenceIds: ["ch-1"], externalDatasetOrObservationId: "dataset-bare", sourceDataClass: "RAW_SOURCE_DATA", governedSourceFingerprint: "caller-only", callerChecksum: "caller-only", targetBindingIds: [dated.bindingId], limitations: "no import", version: "1", timeBasis: { observationTime: "2026-06-01T00:00:00.000Z", datasetStart: "2026-06-01T00:00:00.000Z", datasetEnd: "2026-06-01T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" } })).toThrow("SOURCE_FINGERPRINT_UNRESOLVED");
    cite(runtime, "exact", "dataset-exact", "fp-exact");
    expect(() => registerGovernedMonitoringImport(runtime, actor, { importId: "import-exact", monitoringSourceId: "src-1", artifactId: "artifact-exact", externalDatasetOrObservationId: "dataset-exact", sourceFingerprint: "fp-other", version: "1" })).toThrow("SOURCE_FINGERPRINT_MISMATCH");
    const row = registerTelemetryDataReference(runtime, actor, { telemetryReferenceId: "exact", monitoringSourceId: "src-1", deviceReferenceId: "dev-1", channelReferenceIds: ["ch-1"], externalDatasetOrObservationId: "dataset-exact", sourceDataClass: "RAW_SOURCE_DATA", governedImportId: "import-exact", callerChecksum: "fp-exact", targetBindingIds: [dated.bindingId], limitations: "pinned", version: "1", timeBasis: { observationTime: "2026-06-01T00:00:00.000Z", datasetStart: "2026-06-01T00:00:00.000Z", datasetEnd: "2026-06-15T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" } });
    expect(row.sourceFingerprint).toBe("fp-exact");
    expect(row.callerChecksumAccepted).toBe(false);
    expect(() => registerTelemetryStateReference(runtime, actor, { telemetryReferenceId: row.telemetryReferenceId, referencePointTime: "2026-05-01T00:00:00.000Z", version: "1", limitations: "outside" })).toThrow("TIME_BASIS_UNRESOLVED");
    const pinned = registerTelemetryStateReference(runtime, actor, { telemetryReferenceId: row.telemetryReferenceId, referencePointTime: "2026-06-10T00:00:00.000Z", version: "1", limitations: "index" });
    expect(runtime.references.find((item) => item.stateReferenceId === pinned.stateReferenceId)?.governsPhysicalState).toBe(false);
    expect(assessClockCompatibility(row.timeBasis, row.timeBasis).synchronized).toBe(false);
    expect(D1I_R5_CALLER_CHECKSUM_ALONE_CAN_REGISTER_EXACT_DATASET).toBe(false);
    expect(() => bindMonitoringChannelToStructuralTarget(runtime, { ...actor, authority: "AI" }, { bindingId: "ai-bind", twinId: "twin-1", channelReferenceId: "ch-1", targetKind: "MEMBER", targetId: "mem-1", bindingPurpose: "guess", basis: "model", limitations: "no", effectiveFrom: "2026-01-01T00:00:00.000Z", effectiveTo: "2026-12-31T00:00:00.000Z", version: "1" })).toThrow("UNAUTHORIZED");
    expect(() => registerTelemetryDataReference(runtime, { ...actor, projectId: "project-2" }, { telemetryReferenceId: "cross-p", monitoringSourceId: "src-1", deviceReferenceId: "dev-1", channelReferenceIds: ["ch-1"], externalDatasetOrObservationId: "dataset-exact", sourceDataClass: "RAW_SOURCE_DATA", governedImportId: "import-exact", targetBindingIds: [dated.bindingId], limitations: "cross", version: "1" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => registerMonitoringSource(runtime, { ...actor, tenantId: "tenant-2" }, { monitoringSourceId: "src-2", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", providerKind: "DATA_LOGGER", sourceSystemType: "LOGGER", externalSystemInstanceRef: "instance-2", sourceAuthority: "EXTERNAL_OWNER", version: "1" })).toThrow("CROSS_TENANT_OPERATION");
  });

  it("keeps closeout claims, roadmap history, and engineering scope bounded", () => {
    const monitoring = readFileSync(join(here, "twin-monitoring-reference.ts"), "utf8");
    const closeout = readFileSync(join(here, "twin-closeout.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_R5_STRUCTURAL_DIGITAL_TWIN_CLOSEOUT.md"), "utf8");
    expect(scanAnalysisFormulaBypass(join(here, "twin-closeout.ts"), closeout)).toEqual([]);
    expect(scanAnalysisFormulaBypass(join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_R5_STRUCTURAL_DIGITAL_TWIN_CLOSEOUT.md"), doc)).toEqual([]);
    expect(monitoring).not.toMatch(/\bfetch\(|mqtt|opcua|modbus|WebSocket|fft\(|child_process|eval\(|new Function/);
    expect(D1I_R5_FINAL_MATURITY_STATE).toBe("STRUCTURAL_DIGITAL_TWIN_BOUNDED_RUNTIME_IMPLEMENTED");
    expect(D1I_R5_SINGLE_UNIVERSAL_CURRENT_STATE).toBe(false);
    expect(D1I_STREAMING_RUNTIME_COUNT).toBe(0);
    expect(D1I_R5_LATER_CALIBRATION_RETROACTIVELY_VALIDATES_OLD_DATA).toBe(false);
    expect(D1J_STARTED).toBe(false);
    expect(D1I_RUNTIME_IMPLEMENTED).toBe(false);
    expect(D2_STARTED_BY_THIS_PHASE).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D2_STARTED_BY_D1I_CLOSEOUT).toBe(false);
    expect(D1_PACK_FROM_CLOSEOUT).toBe(false);
    expect(D1J_CURRENT_STATUS).toBe("NOT_STARTED");
    expect(D1G_CERTIFIED_SOLVER_STATUS).toBe("NOT_CERTIFIED");
    expect(D1I_R5_D1J_ASSUMES_CERTIFIED_D1G_SOLVER).toBe(false);
    expect(D1I_R5_D1J_BOUNDED_DEVELOPMENT_PERMISSION).toBe("NOT_AUTHORIZED");
    expect(CANONICAL_NEXT_PHASE).toBe("EOS-ROADMAP-POST-D1I-CANONICALIZATION");
    expect(NEXT_PHASE_TYPE).toBe("ROADMAP_GOVERNANCE");
    const bounded = STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_BOUNDED_RUNTIME");
    const umbrella = STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_RUNTIME");
    expect(bounded?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(bounded?.validationState).toBe("NOT_VALIDATED");
    expect(umbrella?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(doc).toContain("EOS-ROADMAP-POST-D1I-CANONICALIZATION");
  });
});
