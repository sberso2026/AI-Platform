import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { D1hProvenanceRef } from "@rtb/types";
import type { D1hR1ContextRecord } from "./inspection-evidence";
import type { D1hR2InspectionMeasurement } from "./inspection-finding";
import type { D1hR3ConditionState } from "./inspection-condition";
import type { D1hR4AnalysisIdentityRef } from "./inspection-temporal";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import {
  type D1iR1Actor,
  type D1iR1Catalog,
  type D1iR1StructuralIdentity,
  createD1iR1Store,
  createTwin,
  evaluateStateReferenceStatus,
  registerStateReference,
  supersedeStateReference,
} from "./twin-reference-foundation";
import {
  D1I_R2_AI_RUNTIME_COUNT,
  D1I_R2_AS_KNOWN_USES_REFERENCE_HISTORY,
  D1I_R2_AS_OF_EFFECTIVE_USES_LATEST_PRIOR_AS_GENERIC_VALIDITY,
  D1I_R2_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D1I_R2_CURRENT_REFERENCE_STATUS_EQUALS_CURRENT_SELECTION,
  D1I_R2_LATE_DATA_CAN_AFFECT_LATER_EFFECTIVE_RECONSTRUCTION,
  D1I_R2_MATURITY_STATE,
  D1I_R2_NEWEST_REFERENCE_AUTO_SELECTED,
  D1I_R2_POINT_OBSERVATION_AUTO_EXTENDED_TO_PRESENT,
  D1I_R2_STATE_CONFLICT_RUNTIME_COUNT,
  D1I_R2_STRUCTURAL_ADEQUACY_RUNTIME_COUNT,
  D1I_R3_HANDOFF_READY,
  type D1iR2DeclaredScope,
  createCurrentTwinSnapshot,
  createD1iR2Store,
  createExplicitTwinSnapshot,
  evaluateCurrentSelection,
  evaluateSnapshotStatus,
  inspectCurrentStateView,
  produceTwinTemporalRuntimeResult,
  queryAsKnownAtTime,
  queryAsOfEffectiveTime,
  selectCurrentStateReference,
  selectionAsKnownAt,
  statusAsKnownAt,
  supersedeCurrentStateSelection,
  withdrawSelectionAuthority,
} from "./twin-temporal-governance";

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
  return { analysisResultId: "result-1", analysisModelId: "model-1", analysisModelVersion: "7", analysisModelFingerprint: "model-fp-1", analysisRunId: "run-1", analysisRunFingerprint: "run-fp-1", resultSetId: "set-1", normalizedResultId: "norm-1", resultClass: "GOVERNED_RESULT", authorityState: "VERIFIED_GOVERNED", runStatus: "COMPLETED", resultCategory: "NODAL_DISPLACEMENT", quantity: "displacement", locationKind: "MEMBER_START", loadCaseId: "case-1", combinationId: "comb-1", providerId: "provider-1", providerVersion: "1", providerProvenanceRef: "d1g-provider-provenance", modelValidationEvidenceRef: null, analysisTimestamp: "2026-05-01T00:00:00.000Z", structuralStateRef: "analysis-state", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", structuralSystemId: "sys-1" };
}

function catalog(): D1iR1Catalog {
  return { identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("MEMBER", "mem-1")], contexts: [context()], findings: [], measurements: [measurement("meas-1", "2026-06-01T00:00:00.000Z"), measurement("meas-2", "2026-06-15T00:00:00.000Z")], interpretations: [], conditionStates: [condition("cond-1"), condition("cond-2")], analysisResults: [analysis()], upstreamMarks: [] };
}

function scope(stateClasses: string[], purpose = "review"): D1iR2DeclaredScope {
  return { targetIds: ["sys-1", "mem-1"], stateClasses, sourceDomains: [], purpose };
}

function boot(clock: { now: string }) {
  const source = catalog();
  const runtime = createD1iR2Store(createD1iR1Store(source, () => clock.now));
  createTwin(runtime, actor, { twinId: "twin-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", twinScope: "STRUCTURAL_SYSTEM", targetKind: "STRUCTURAL_SYSTEM", targetId: "sys-1", parentStructuralSystemId: null, purpose: "inspection-history", governanceProfileRef: "profile-1", version: "1" });
  return { runtime, source };
}

function pin(runtime: ReturnType<typeof boot>["runtime"], objectType: string, objectId: string, stateClass: string, stateReferenceId: string) {
  return registerStateReference(runtime, actor, { stateReferenceId, twinId: "twin-1", sourceDomain: objectType === "ANALYSIS_RESULT" ? "D1F_ANALYSIS" : "D1H_INSPECTION_CONDITION", sourceObjectType: objectType, sourceObjectId: objectId, stateClass, limitations: "pinned", version: "1" });
}

function lane(stateClass: string, targetId: string, sourceDomain = "D1H_INSPECTION_CONDITION") {
  return { twinId: "twin-1", targetId, stateClass, sourceDomain, purpose: "review", selectionBasis: "human-review", limitations: "lane only", version: "1" };
}

describe("EOS-D1I-R2 temporal snapshot and current selection", () => {
  it("selects one valid reference and keeps other state classes independent", () => {
    const clock = { now: "2026-06-10T00:00:00.000Z" };
    const { runtime } = boot(clock);
    const conditionRef = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-cond");
    const measured = pin(runtime, "INSPECTION_MEASUREMENT", "meas-1", "MEASURED_STATE", "ref-meas");
    const analytical = pin(runtime, "ANALYSIS_RESULT", "result-1", "ANALYTICAL_STATE", "ref-an");
    const selected = selectCurrentStateReference(runtime, actor, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: conditionRef.stateReferenceId });
    const measuredSelection = selectCurrentStateReference(runtime, actor, { ...lane("MEASURED_STATE", "mem-1"), stateReferenceId: measured.stateReferenceId });
    const analyticalSelection = selectCurrentStateReference(runtime, actor, { ...lane("ANALYTICAL_STATE", "sys-1", "D1F_ANALYSIS"), stateReferenceId: analytical.stateReferenceId });
    expect(selected.selectedStateReferenceId).toBe(conditionRef.stateReferenceId);
    expect(selected.structuralTruth).toBe(false);
    expect(selected.validatedSource).toBe(false);
    expect(selected.engineeringApproval).toBe(false);
    expect(measured.sourceValidationState).toBe("UNVALIDATED");
    expect([selected, measuredSelection, analyticalSelection].map((row) => row.status)).toEqual(["ACTIVE", "ACTIVE", "ACTIVE"]);
    expect(analyticalSelection.structuralTruth).toBe(false);
    expect(selectCurrentStateReference(runtime, actor, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: conditionRef.stateReferenceId }).selectionId).toBe(selected.selectionId);
    expect(runtime.selections).toHaveLength(3);
  });

  it("rejects a second active selection in the same lane and keeps superseded history", () => {
    const clock = { now: "2026-06-10T00:00:00.000Z" };
    const { runtime } = boot(clock);
    const first = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-cond-1");
    const second = pin(runtime, "CONDITION_STATE", "cond-2", "CONDITION_STATE", "ref-cond-2");
    const selected = selectCurrentStateReference(runtime, actor, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: first.stateReferenceId, selectionId: "s1" });
    expect(() => selectCurrentStateReference(runtime, actor, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: second.stateReferenceId })).toThrow("MULTIPLE_ACTIVE_SELECTIONS");
    clock.now = "2026-06-20T00:00:00.000Z";
    const successor = supersedeCurrentStateSelection(runtime, actor, selected.selectionId, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: second.stateReferenceId, selectionId: "s2" });
    expect(selected.status).toBe("SUPERSEDED");
    expect(successor.supersedesSelectionId).toBe("s1");
    expect(selectionAsKnownAt(runtime, lane("CONDITION_STATE", "mem-1"), "2026-06-15T00:00:00.000Z")?.selectionId).toBe("s1");
    clock.now = "2026-06-21T00:00:00.000Z";
    pin(runtime, "INSPECTION_MEASUREMENT", "meas-2", "MEASURED_STATE", "ref-meas-2");
    expect(successor.selectedStateReferenceId).toBe(second.stateReferenceId);
  });

  it("does not replace a selection when a newer reference arrives or the selected reference becomes stale", () => {
    const clock = { now: "2026-06-10T00:00:00.000Z" };
    const { runtime, source } = boot(clock);
    const first = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-cond-1");
    const selected = selectCurrentStateReference(runtime, actor, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: first.stateReferenceId });
    clock.now = "2026-06-12T00:00:00.000Z";
    pin(runtime, "CONDITION_STATE", "cond-2", "CONDITION_STATE", "ref-cond-2");
    expect(selected.selectedStateReferenceId).toBe(first.stateReferenceId);
    expect(runtime.selections).toHaveLength(1);
    source.conditionStates[0]!.fingerprint = "changed-fp";
    clock.now = "2026-06-20T00:00:00.000Z";
    evaluateStateReferenceStatus(runtime, first.stateReferenceId);
    evaluateCurrentSelection(runtime, selected.selectionId);
    expect(selected.status).toBe("STALE_REVIEW_REQUIRED");
    expect(selected.selectedStateReferenceId).toBe(first.stateReferenceId);
    expect(statusAsKnownAt(runtime, first.stateReferenceId, "2026-06-15T00:00:00.000Z")).toBe("CURRENT_REFERENCE");
  });

  it("keeps explicit and current snapshots immutable, ordered, and scope-relative", () => {
    const clock = { now: "2026-06-05T00:00:00.000Z" };
    const { runtime } = boot(clock);
    const analytical = pin(runtime, "ANALYSIS_RESULT", "result-1", "ANALYTICAL_STATE", "ref-an");
    const conditionRef = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-cond");
    const reversed = createExplicitTwinSnapshot(runtime, actor, { twinId: "twin-1", snapshotPurpose: "HISTORICAL_RECORD", declaredScope: scope(["ANALYTICAL_STATE", "CONDITION_STATE"]), stateReferenceIds: [conditionRef.stateReferenceId, analytical.stateReferenceId], limitations: "explicit", version: "1" });
    const forward = createExplicitTwinSnapshot(runtime, actor, { twinId: "twin-1", snapshotPurpose: "HISTORICAL_RECORD", declaredScope: scope(["ANALYTICAL_STATE", "CONDITION_STATE"]), stateReferenceIds: [analytical.stateReferenceId, conditionRef.stateReferenceId], limitations: "explicit", version: "1" });
    expect(forward.fingerprint).toBe(reversed.fingerprint);
    expect(forward.healthy).toBe(false);
    expect(forward.adequate).toBe(false);
    expect(JSON.stringify(forward)).not.toContain("424242");
    const partial = createExplicitTwinSnapshot(runtime, actor, { snapshotId: "partial", twinId: "twin-1", snapshotPurpose: "COMPARISON_CONTEXT", declaredScope: scope(["ANALYTICAL_STATE", "MEASURED_STATE"]), stateReferenceIds: [analytical.stateReferenceId], limitations: "missing measured", version: "1" });
    expect(partial.completeness).toBe("PARTIAL");
    expect(partial.damaged).toBe(false);
    const empty = createExplicitTwinSnapshot(runtime, actor, { snapshotId: "empty", twinId: "twin-1", snapshotPurpose: "ENGINEERING_REVIEW_CONTEXT", declaredScope: scope(["MEASURED_STATE"]), stateReferenceIds: [], limitations: "none selected", version: "1" });
    expect(empty.completeness).toBe("INCOMPLETE");
    const ids = [...forward.stateReferenceIds];
    clock.now = "2026-06-10T00:00:00.000Z";
    pin(runtime, "INSPECTION_MEASUREMENT", "meas-1", "MEASURED_STATE", "ref-meas");
    expect(forward.stateReferenceIds).toEqual(ids);
    selectCurrentStateReference(runtime, actor, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: conditionRef.stateReferenceId });
    const current = createCurrentTwinSnapshot(runtime, actor, { twinId: "twin-1", snapshotPurpose: "CURRENT_REFERENCE_SET", declaredScope: scope(["CONDITION_STATE", "ANALYTICAL_STATE"]), limitations: "current lanes", version: "1" });
    expect(current.temporalMode).toBe("CURRENT_SELECTION");
    expect(current.stateReferenceIds).toEqual([conditionRef.stateReferenceId]);
    expect(current.currentSelectionIds).toHaveLength(1);
  });

  it("reconstructs known-at history, late data, and point observations without choosing a winner", () => {
    const clock = { now: "2026-06-10T00:00:00.000Z" };
    const { runtime, source } = boot(clock);
    const conditionRef = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-cond-1");
    const other = pin(runtime, "CONDITION_STATE", "cond-2", "CONDITION_STATE", "ref-cond-2");
    const early = pin(runtime, "INSPECTION_MEASUREMENT", "meas-1", "MEASURED_STATE", "ref-meas-1");
    const later = pin(runtime, "INSPECTION_MEASUREMENT", "meas-2", "MEASURED_STATE", "ref-meas-2");
    const analytical = pin(runtime, "ANALYSIS_RESULT", "result-1", "ANALYTICAL_STATE", "ref-an");
    const before = queryAsKnownAtTime(runtime, { twinId: "twin-1", knownAt: "2026-06-05T00:00:00.000Z", declaredScope: scope(["CONDITION_STATE"]) });
    expect(before.eligibleReferenceIds).not.toContain(conditionRef.stateReferenceId);
    const after = queryAsKnownAtTime(runtime, { twinId: "twin-1", knownAt: "2026-06-11T00:00:00.000Z", declaredScope: scope(["CONDITION_STATE"]) });
    expect(after.eligibleReferenceIds).toContain(conditionRef.stateReferenceId);
    expect(after.persistedAsSnapshot).toBe(false);
    const late = queryAsOfEffectiveTime(runtime, { twinId: "twin-1", effectiveTime: "2026-06-01T00:00:00.000Z", knownAtCutoff: "2026-06-11T00:00:00.000Z", declaredScope: scope(["CONDITION_STATE"]) });
    expect(late.eligibleReferenceIds).toContain(conditionRef.stateReferenceId);
    expect(late.autoGoverned).toBe(false);
    expect(late.selectedReferenceIds).toEqual([]);
    expect(late.runtimeDiagnostics.map((row) => row.code)).toContain("MULTIPLE_ELIGIBLE_REFERENCES");
    expect(late.runtimeDiagnostics.every((row) => row.stateConflict === false && row.structuralFinding === false)).toBe(true);
    const point = queryAsOfEffectiveTime(runtime, { twinId: "twin-1", effectiveTime: "2026-06-20T00:00:00.000Z", knownAtCutoff: "2026-06-20T00:00:00.000Z", declaredScope: scope(["MEASURED_STATE"]) });
    expect(point.eligibleReferenceIds).not.toContain(early.stateReferenceId);
    expect(point.eligibleReferenceIds).not.toContain(later.stateReferenceId);
    expect(point.pointObservationExtended).toBe(false);
    expect(point.selectedReferenceIds).toEqual([]);
    const analysisView = queryAsOfEffectiveTime(runtime, { twinId: "twin-1", effectiveTime: "2026-06-01T00:00:00.000Z", declaredScope: scope(["ANALYTICAL_STATE"]) });
    expect(analysisView.eligibleReferenceIds).not.toContain(analytical.stateReferenceId);
    expect(analysisView.analysisTimestampEqualsPhysicalEffectiveTime).toBe(false);
    const currentView = inspectCurrentStateView(runtime, { twinId: "twin-1", declaredScope: scope(["CONDITION_STATE"]) });
    expect(currentView.selectedReferenceIds).toEqual([]);
    expect(currentView.runtimeDiagnostics.some((row) => row.code === "CURRENT_SELECTION_MISSING")).toBe(true);
    clock.now = "2026-06-25T00:00:00.000Z";
    supersedeStateReference(runtime, actor, conditionRef.stateReferenceId, { stateReferenceId: "ref-cond-3", twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-2", stateClass: "CONDITION_STATE", limitations: "successor", version: "1" });
    expect(conditionRef.referenceStatus).toBe("SUPERSEDED_REFERENCE");
    expect(statusAsKnownAt(runtime, conditionRef.stateReferenceId, "2026-06-15T00:00:00.000Z")).toBe("CURRENT_REFERENCE");
    source.measurements[0]!.fingerprint = "meas-changed";
    evaluateStateReferenceStatus(runtime, early.stateReferenceId);
    const snapshot = createExplicitTwinSnapshot(runtime, actor, { snapshotId: "before-stale", twinId: "twin-1", snapshotPurpose: "AS_OF_RECONSTRUCTION", declaredScope: scope(["MEASURED_STATE"]), stateReferenceIds: [later.stateReferenceId], limitations: "frozen", version: "1" });
    source.measurements[1]!.fingerprint = "meas-2-changed";
    evaluateStateReferenceStatus(runtime, later.stateReferenceId);
    const marked = evaluateSnapshotStatus(runtime, snapshot.snapshotId);
    expect(marked.stateReferenceIds).toEqual([later.stateReferenceId]);
    expect(marked.status).toBe("STALE_FOR_CURRENT_USE");
    expect(other.stateReferenceId).not.toBe(conditionRef.stateReferenceId);
  });

  it("invalidates selections without switching references and rejects unauthorized or cross-boundary operations", () => {
    const clock = { now: "2026-06-10T00:00:00.000Z" };
    const { runtime, source } = boot(clock);
    const conditionRef = pin(runtime, "CONDITION_STATE", "cond-1", "CONDITION_STATE", "ref-cond");
    const selected = selectCurrentStateReference(runtime, actor, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: conditionRef.stateReferenceId });
    const before = conditionRef.fingerprint;
    source.identities[0]!.lifecycle = "SUPERSEDED";
    evaluateStateReferenceStatus(runtime, conditionRef.stateReferenceId);
    evaluateCurrentSelection(runtime, selected.selectionId);
    expect(selected.status).toBe("STALE_REVIEW_REQUIRED");
    expect(selected.selectedStateReferenceId).toBe(conditionRef.stateReferenceId);
    expect(conditionRef.fingerprint).toBe(before);
    source.identities[0]!.lifecycle = "CURRENT";
    source.conditionStates[0]!.authority = "WITHDRAWN";
    evaluateStateReferenceStatus(runtime, conditionRef.stateReferenceId);
    expect(conditionRef.referenceStatus).toBe("INVALID_REFERENCE");
    const withdrawn = selectCurrentStateReference(runtime, { ...actor, actorId: "engineer-2" }, { ...lane("MEASURED_STATE", "mem-1"), stateReferenceId: pin(runtime, "INSPECTION_MEASUREMENT", "meas-1", "MEASURED_STATE", "ref-meas").stateReferenceId });
    withdrawSelectionAuthority(runtime, "engineer-2");
    expect(withdrawn.status).toBe("INVALID");
    expect(() => selectCurrentStateReference(runtime, { ...actor, authority: "AI" }, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: conditionRef.stateReferenceId })).toThrow("UNAUTHORIZED");
    expect(() => createExplicitTwinSnapshot(runtime, { ...actor, projectId: "project-2" }, { twinId: "twin-1", snapshotPurpose: "HISTORICAL_RECORD", declaredScope: scope(["CONDITION_STATE"]), stateReferenceIds: [], limitations: "cross", version: "1" })).toThrow("CROSS_PROJECT_REFERENCE");
    expect(() => selectCurrentStateReference(runtime, { ...actor, tenantId: "tenant-2" }, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: conditionRef.stateReferenceId })).toThrow("CROSS_TENANT_REFERENCE");
    expect(() => selectCurrentStateReference(runtime, actor, { ...lane("CONDITION_STATE", "mem-1"), stateReferenceId: conditionRef.stateReferenceId, selectedAt: "2020-01-01T00:00:00.000Z" } as never)).toThrow("TEMPORAL_HISTORY_TAMPERING_REJECTED");
    expect(() => queryAsOfEffectiveTime(runtime, { twinId: "twin-1", effectiveTime: "2026-06-01T00:00:00.000Z", declaredScope: scope(["CONDITION_STATE"]), expression: "status = current" })).toThrow("ARBITRARY_QUERY_EXPRESSION");
    const result = produceTwinTemporalRuntimeResult(runtime, "twin-1");
    expect(result.digitalTwinComplete).toBe(false);
    expect(result.structuralAdequacy).toBe(false);
    expect(source.conditionStates[0]!.capacityChanged).toBe(false);
    expect(source.analysisResults[0]!.analysisModelVersion).toBe("7");
  });

  it("keeps conflict, telemetry, and formula scope closed", () => {
    const source = readFileSync(join(here, "twin-temporal-governance.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_R2_TEMPORAL_SNAPSHOT_CURRENT_AS_OF_STATE_GOVERNANCE.md"), "utf8");
    expect(source).not.toMatch(/resolveStateConflict|healthScore|stiffnessMatrix|telemetry|selectGoverning/);
    expect(scanAnalysisFormulaBypass(join(here, "twin-temporal-governance.ts"), source)).toEqual([]);
    expect(scanAnalysisFormulaBypass(join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_R2_TEMPORAL_SNAPSHOT_CURRENT_AS_OF_STATE_GOVERNANCE.md"), doc)).toEqual([]);
    expect(D1I_R2_STATE_CONFLICT_RUNTIME_COUNT).toBe(0);
    expect(D1I_R2_CONFLICT_RESOLUTION_RUNTIME_COUNT).toBe(0);
    expect(D1I_R2_AI_RUNTIME_COUNT).toBe(0);
    expect(D1I_R2_STRUCTURAL_ADEQUACY_RUNTIME_COUNT).toBe(0);
    expect(D1I_R2_NEWEST_REFERENCE_AUTO_SELECTED).toBe(false);
    expect(D1I_R2_AS_OF_EFFECTIVE_USES_LATEST_PRIOR_AS_GENERIC_VALIDITY).toBe(false);
    expect(D1I_R2_POINT_OBSERVATION_AUTO_EXTENDED_TO_PRESENT).toBe(false);
    expect(D1I_R2_CURRENT_REFERENCE_STATUS_EQUALS_CURRENT_SELECTION).toBe(false);
    expect(D1I_R2_AS_KNOWN_USES_REFERENCE_HISTORY).toBe(true);
    expect(D1I_R2_LATE_DATA_CAN_AFFECT_LATER_EFFECTIVE_RECONSTRUCTION).toBe(true);
    expect(D1I_R2_MATURITY_STATE).toBe("STRUCTURAL_DIGITAL_TWIN_TEMPORAL_SNAPSHOT_CURRENT_AS_OF_RUNTIME_IMPLEMENTED");
    expect(D1I_R3_HANDOFF_READY).toBe(true);
    const current = STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_CURRENT_STATE");
    const conflict = STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_CONFLICT");
    const telemetry = STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_TELEMETRY");
    expect(current?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(conflict?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(telemetry?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
