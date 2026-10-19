import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import type { D1hProvenanceRef } from "@rtb/types";
import type { D1hR1ContextRecord } from "./inspection-evidence";
import type { D1hR2InspectionMeasurement, D1hR2StructuralFinding } from "./inspection-finding";
import type { D1hR3ConditionState, D1hR3EngineeringInterpretation } from "./inspection-condition";
import type { D1hR4AnalysisIdentityRef } from "./inspection-temporal";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  D1I_R1_CURRENT_REFERENCE_STATUS_EQUALS_GOVERNING_CURRENT_STATE,
  D1I_R1_CURRENT_STATE_SELECTOR_RUNTIME_COUNT,
  D1I_R1_MATURITY_STATE,
  D1I_R1_SNAPSHOT_RUNTIME_COUNT,
  D1I_R1_STATE_CONFLICT_RUNTIME_COUNT,
  type D1iR1Actor,
  type D1iR1Catalog,
  type D1iR1StructuralIdentity,
  createD1iR1Store,
  createTwin,
  evaluateStateReferenceStatus,
  produceTwinReferenceFoundationResult,
  registerStateReference,
  supersedeStateReference,
} from "./twin-reference-foundation";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D1iR1Actor = { actorId: "engineer-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authority: "HUMAN" };

function provenance(): D1hProvenanceRef {
  return { tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", actorOrSystem: "inspector-1", timestamp: "2026-06-10T00:00:00.000Z", authority: "HUMAN", version: "1", fingerprint: "prov-fp" };
}

function identity(kind: D1iR1StructuralIdentity["kind"], id: string, overrides: Partial<D1iR1StructuralIdentity> = {}): D1iR1StructuralIdentity {
  return {
    kind,
    id,
    structuralSystemId: kind === "STRUCTURAL_SYSTEM" ? id : "sys-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    version: "1",
    lifecycle: "CURRENT",
    authority: "HUMAN",
    validationState: "CURRENT",
    effectiveAt: "2026-01-01T00:00:00.000Z",
    contentFingerprint: `${kind}-${id}-fp`,
    ...overrides,
  };
}

function context(id = "ctx-1", inspectedAt = "2026-06-01T00:00:00.000Z"): D1hR1ContextRecord {
  return {
    inspectionContextId: id,
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    structuralSystemId: "sys-1",
    inspectionSessionId: "ses-1",
    purpose: "ROUTINE",
    scopeStatement: "member scope",
    inspectedAt,
    coverageScopeRef: "scope-1",
    methodRefs: ["visual"],
    sourceAuthority: "HUMAN",
    governanceProfileRef: "profile-1",
    provenance: provenance(),
    version: "1",
    status: "RECORDED",
    declaredTargetIds: ["mem-1"],
    recordedAt: "2026-06-10T00:00:00.000Z",
    fingerprint: `ctx-${id}-fp`,
    engineeringApproval: false,
    predecessorId: null,
  };
}

function condition(id = "cond-1", overrides: Partial<D1hR3ConditionState> = {}): D1hR3ConditionState {
  return {
    recordKind: "CONDITION_STATE",
    conditionStateId: id,
    inspectionContextId: "ctx-1",
    inspectionSessionId: "ses-1",
    targetId: "mem-1",
    targetKind: "MEMBER",
    assessmentScope: "member-face",
    ratingSchemeId: null,
    schemeVersion: null,
    schemeFingerprint: null,
    ratingId: null,
    ratingValueCode: null,
    interpretationId: null,
    assessmentBasisRef: "basis-1",
    supportingFindingIds: [],
    supportingMeasurementIds: [],
    supportingEvidenceIds: [],
    relevantValidationIds: [],
    coverageIds: [],
    coverageLimitations: [],
    inputValidation: [],
    allInputsValidated: false,
    authority: "HUMAN",
    status: "CURRENT",
    limitations: "limited access",
    createdAt: "2026-06-09T00:00:00.000Z",
    createdBy: "inspector-1",
    provenance: provenance(),
    version: "4",
    fingerprint: `cond-${id}-fp`,
    supersedesConditionStateId: null,
    goodCondition: false,
    structuralAdequacy: false,
    assetSafe: false,
    repairRequired: false,
    sectionPropertyChanged: false,
    materialPropertyChanged: false,
    capacityChanged: false,
    analysisModelChanged: false,
    supportChanged: false,
    releaseChanged: false,
    loadChanged: false,
    analysisInputCreated: false,
    repairActionCreated: false,
    ...overrides,
  };
}

function measurement(id = "meas-1"): D1hR2InspectionMeasurement {
  return {
    recordKind: "INSPECTION_MEASUREMENT",
    measurementId: id,
    inspectionContextId: "ctx-1",
    inspectionSessionId: "ses-1",
    targetId: "mem-1",
    evidenceId: "ev-1",
    findingId: null,
    quantity: "crack-width",
    value: 424242,
    unit: "mm",
    location: null,
    methodRef: "gauge",
    sourceType: "INSTRUMENT_MEASURED",
    instrumentRef: "gauge-1",
    measuredAt: "2026-06-01T00:00:00.000Z",
    uncertainty: null,
    accuracy: null,
    calibrationBasis: null,
    modelIdentity: null,
    modelVersion: null,
    authority: "HUMAN",
    validationState: "UNVALIDATED",
    provenance: provenance(),
    version: "2",
    fingerprint: `meas-${id}-fp`,
    supersedesMeasurementId: null,
    governs: false,
    instrumentMeasured: true,
    sectionPropertyUpdated: false,
    analysisGeometryUpdated: false,
    capacityChanged: false,
    materialPropertyChanged: false,
    analysisModelChanged: false,
  };
}

function interpretation(id = "int-1"): D1hR3EngineeringInterpretation {
  return {
    recordKind: "ENGINEERING_INTERPRETATION",
    interpretationId: id,
    inspectionContextId: "ctx-1",
    targetId: "mem-1",
    supportingEvidenceIds: [],
    supportingFindingIds: [],
    supportingMeasurementIds: [],
    supportingValidationIds: [],
    authorId: "engineer-1",
    reviewerId: null,
    statement: "UNIQUE_INTERPRETATION_SENTENCE",
    basisRefs: ["basis-1"],
    limitations: "limited",
    assumptions: "none stated",
    createdAt: "2026-06-09T00:00:00.000Z",
    authority: "HUMAN",
    governs: false,
    structuralAdequacy: false,
    capacityAssessment: false,
    repairApproval: false,
    provenance: provenance(),
    version: "3",
    fingerprint: `int-${id}-fp`,
    supersedesInterpretationId: null,
  };
}

function finding(id = "find-1", targetId = "mem-1"): D1hR2StructuralFinding {
  return {
    recordKind: "STRUCTURAL_FINDING",
    findingId: id,
    inspectionContextId: "ctx-1",
    inspectionSessionId: "ses-1",
    targetId,
    findingType: "CRACKING",
    location: null,
    supportingEvidenceIds: [],
    origin: "HUMAN_RECORDED",
    authority: "HUMAN",
    validationState: "UNVALIDATED",
    createdAt: "2026-06-09T00:00:00.000Z",
    createdBy: "inspector-1",
    provenance: provenance(),
    version: "1",
    fingerprint: `find-${id}-fp`,
    supersedesFindingId: null,
    governs: false,
    conditionRating: false,
    severity: false,
    badCondition: false,
    unsafe: false,
    repairRequired: false,
    sectionPropertiesChanged: false,
    materialPropertiesChanged: false,
    capacityChanged: false,
    analysisModelChanged: false,
  };
}

function analysis(overrides: Partial<D1hR4AnalysisIdentityRef> = {}): D1hR4AnalysisIdentityRef {
  return {
    analysisResultId: "result-1",
    analysisModelId: "model-1",
    analysisModelVersion: "7",
    analysisModelFingerprint: "model-fp-1",
    analysisRunId: "run-1",
    analysisRunFingerprint: "run-fp-1",
    resultSetId: "set-1",
    normalizedResultId: "norm-1",
    resultClass: "GOVERNED_RESULT",
    authorityState: "VERIFIED_GOVERNED",
    runStatus: "COMPLETED",
    resultCategory: "NODAL_DISPLACEMENT",
    quantity: "displacement",
    locationKind: "MEMBER_START",
    loadCaseId: "case-1",
    combinationId: "comb-1",
    providerId: "provider-1",
    providerVersion: "1",
    providerProvenanceRef: "d1g-provider-provenance",
    modelValidationEvidenceRef: null,
    analysisTimestamp: "2026-05-01T00:00:00.000Z",
    structuralStateRef: "analysis-state",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    structuralSystemId: "sys-1",
    ...overrides,
  };
}

function catalog(overrides: Partial<D1iR1Catalog> = {}): D1iR1Catalog {
  return {
    identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("MEMBER", "mem-1"), identity("MEMBER", "mem-2"), identity("MEMBER", "mem-x", { structuralSystemId: "sys-2", projectId: "project-1" })],
    contexts: [context()],
    findings: [finding(), finding("find-x", "mem-x")],
    measurements: [measurement()],
    interpretations: [interpretation()],
    conditionStates: [condition(), condition("cond-2", { fingerprint: "cond-cond-2-fp" })],
    analysisResults: [analysis()],
    upstreamMarks: [],
    ...overrides,
  };
}

function store(now = "2026-06-10T00:00:00.000Z", source = catalog()) {
  return createD1iR1Store(source, () => now);
}

function twinInput(overrides: Record<string, unknown> = {}) {
  return {
    twinId: "twin-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    twinScope: "STRUCTURAL_SYSTEM" as const,
    targetKind: "STRUCTURAL_SYSTEM" as const,
    targetId: "sys-1",
    parentStructuralSystemId: null,
    purpose: "inspection-history",
    governanceProfileRef: "profile-1",
    version: "1",
    ...overrides,
  };
}

describe("EOS-D1I-R1 twin identity and state reference foundation", () => {
  it("creates a governed twin and rejects orphan, cross-project, AI, and geometry scope", () => {
    const runtime = store();
    const created = createTwin(runtime, actor, twinInput());
    expect(created.replacesStructuralIdentity).toBe(false);
    expect(created.governedStructuralTargetRef.targetId).toBe("sys-1");
    expect(created.fingerprint).toBe(createTwin(runtime, actor, twinInput()).fingerprint);
    expect(() => createTwin(runtime, actor, twinInput({ twinId: "twin-orphan", targetId: "missing" }))).toThrow("TARGET_NOT_FOUND");
    expect(() => createTwin(runtime, actor, twinInput({ twinId: "twin-project", projectId: "project-2" }))).toThrow("CROSS_PROJECT_REFERENCE");
    expect(() => createTwin(runtime, { ...actor, tenantId: "tenant-2" }, twinInput())).toThrow("CROSS_TENANT_REFERENCE");
    expect(() => createTwin(runtime, { ...actor, authority: "AI" }, twinInput({ twinId: "twin-ai" }))).toThrow("UNAUTHORIZED");
    expect(() => createTwin(runtime, actor, twinInput({ twinId: "twin-bounded", twinScope: "BOUNDED_STRUCTURAL_ASSET_SCOPE", targetKind: "MEMBER", targetId: "mem-1", parentStructuralSystemId: null }))).toThrow("BOUNDED_SCOPE_PARENT_REQUIRED");
    expect(() => createTwin(runtime, actor, { ...twinInput({ twinId: "twin-geo", twinScope: "BOUNDED_STRUCTURAL_ASSET_SCOPE", targetKind: "MEMBER", targetId: "mem-1", parentStructuralSystemId: "sys-1" }), coordinates: [1, 2] } as ReturnType<typeof twinInput>)).toThrow("BOUNDED_SCOPE_GEOMETRY_REJECTED");
    const second = createTwin(runtime, actor, twinInput({ twinId: "twin-2", purpose: "analysis-context" }));
    expect(second.twinId).not.toBe(created.twinId);
    expect(D1I_R1_MATURITY_STATE).toBe("STRUCTURAL_DIGITAL_TWIN_IDENTITY_STATE_REFERENCE_RUNTIME_FOUNDATION_IMPLEMENTED");
  });

  it("pins D1H condition, measurement, and interpretation without copying bodies or using createdAt", () => {
    const source = catalog();
    const before = JSON.stringify(source.conditionStates[0]);
    const runtime = store("2026-06-10T00:00:00.000Z", source);
    createTwin(runtime, actor, twinInput());
    const pinned = registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" });
    expect(pinned.sourceVersion).toBe("4");
    expect(pinned.sourceFingerprint).toBe("cond-cond-1-fp");
    expect(pinned.sourceAuthority).toBe("HUMAN");
    expect(pinned.sourceValidationState).toBe("CURRENT");
    expect(pinned.effectiveTime).toBe("2026-06-01T00:00:00.000Z");
    expect(pinned.knownAtTime).toBe("2026-06-10T00:00:00.000Z");
    expect(pinned.effectiveTime).not.toBe(source.conditionStates[0].createdAt);
    expect(pinned.governsPhysicalState).toBe(false);
    expect(pinned.copiesSourceBody).toBe(false);
    expect(JSON.stringify(source.conditionStates[0])).toBe(before);
    expect(JSON.stringify(pinned)).not.toContain("UNIQUE_INTERPRETATION_SENTENCE");
    expect(JSON.stringify(pinned)).not.toContain("424242");
    const measured = registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "INSPECTION_MEASUREMENT", sourceObjectId: "meas-1", stateClass: "MEASURED_STATE", limitations: "none", version: "1" });
    expect(measured.sourceVersion).toBe("2");
    expect(measured.effectiveTime).toBe("2026-06-01T00:00:00.000Z");
    expect(measured.sourceValidationState).toBe("UNVALIDATED");
    const interpreted = registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "ENGINEERING_INTERPRETATION", sourceObjectId: "int-1", stateClass: "ENGINEERING_INTERPRETED_STATE", limitations: "none", version: "1" });
    expect(interpreted.effectiveTime).toBe("2026-06-01T00:00:00.000Z");
    expect(interpreted.knownAtTime).toBe("2026-06-10T00:00:00.000Z");
    expect(JSON.stringify(interpreted)).not.toContain("UNIQUE_INTERPRETATION_SENTENCE");
  });

  it("pins analysis authority and rejects measured or observed classification", () => {
    const runtime = store();
    createTwin(runtime, actor, twinInput());
    const pinned = registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1F_ANALYSIS", sourceObjectType: "ANALYSIS_RESULT", sourceObjectId: "result-1", stateClass: "ANALYTICAL_STATE", limitations: "none", version: "1" });
    expect(pinned.sourceVersion).toBe("7");
    expect(pinned.analysisAuthorityClass).toBe("GOVERNED");
    expect(pinned.sourceAuthority).toBe("VERIFIED_GOVERNED");
    expect(pinned.analysisRunId).toBe("run-1");
    expect(pinned.effectiveTime).toBe("2026-05-01T00:00:00.000Z");
    expect(pinned.governsPhysicalState).toBe(false);
    expect(() => registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1F_ANALYSIS", sourceObjectType: "ANALYSIS_RESULT", sourceObjectId: "result-1", stateClass: "MEASURED_STATE", limitations: "none", version: "1" })).toThrow("STATE_CLASS_SOURCE_MISMATCH");
    expect(() => registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1F_ANALYSIS", sourceObjectType: "ANALYSIS_RESULT", sourceObjectId: "result-1", stateClass: "OBSERVED_STATE", limitations: "none", version: "1" })).toThrow("STATE_CLASS_SOURCE_MISMATCH");
    expect(() => registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "MEASURED_STATE", limitations: "none", version: "1" })).toThrow("STATE_CLASS_SOURCE_MISMATCH");
    expect(() => registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "INSPECTION_MEASUREMENT", sourceObjectId: "meas-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" })).toThrow("STATE_CLASS_SOURCE_MISMATCH");
    const externalStore = store();
    createTwin(externalStore, actor, twinInput());
    const external = registerStateReference(externalStore, actor, { twinId: "twin-1", sourceDomain: "D1G_EXTERNAL_ANALYSIS_RESULT", sourceObjectType: "ANALYSIS_RESULT", sourceObjectId: "result-1", stateClass: "ANALYTICAL_STATE", limitations: "external", version: "1" });
    expect(external.sourceDomain).toBe("D1G_EXTERNAL_ANALYSIS_RESULT");
  });

  it("rejects spoofed fingerprint, authority, validation, known-at, and unsupported sources", () => {
    const runtime = store();
    createTwin(runtime, actor, twinInput());
    const base = { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" };
    expect(() => registerStateReference(runtime, actor, { ...base, expectedSourceFingerprint: "spoof" })).toThrow("SOURCE_FINGERPRINT_MISMATCH");
    expect(() => registerStateReference(runtime, actor, { ...base, assertedSourceAuthority: "VERIFIED_GOVERNED" })).toThrow("SOURCE_AUTHORITY_ASSERTION_REJECTED");
    expect(() => registerStateReference(runtime, actor, { ...base, assertedSourceValidationState: "CERTIFIED" })).toThrow("SOURCE_VALIDATION_ASSERTION_REJECTED");
    expect(() => registerStateReference(runtime, actor, { ...base, knownAtTime: "2020-01-01T00:00:00.000Z" })).toThrow("KNOWN_AT_BACKDATE_REJECTED");
    expect(() => registerStateReference(runtime, actor, { ...base, sourceDomain: "FUTURE_TELEMETRY", sourceObjectType: "SENSOR" })).toThrow("SOURCE_DOMAIN_UNSUPPORTED");
    expect(() => registerStateReference(runtime, actor, { ...base, sourceDomain: "OTHER_GOVERNED_SOURCE" })).toThrow("SOURCE_DOMAIN_UNSUPPORTED");
    expect(() => registerStateReference(runtime, actor, { ...base, sourceDomain: "D1Z_UNKNOWN" })).toThrow("SOURCE_DOMAIN_UNSUPPORTED");
    expect(() => registerStateReference(runtime, actor, { ...base, sourceObjectType: "CONDITION_RATING", sourceObjectId: "rating-1" })).toThrow("SOURCE_OBJECT_TYPE_UNSUPPORTED");
    expect(() => registerStateReference(runtime, actor, { ...base, stateClass: "INFERRED_STATE" })).toThrow("STATE_CLASS_SOURCE_MISMATCH");
    expect(() => registerStateReference(runtime, actor, { ...base, sourceObjectId: "../secret" })).toThrow("ARBITRARY_SOURCE_SELECTOR");
    expect(() => registerStateReference(runtime, actor, { ...base, sourceObjectId: "missing" })).toThrow("SOURCE_NOT_FOUND");
  });

  it("enforces target scope and cross-boundary references", () => {
    const runtime = store();
    createTwin(runtime, actor, twinInput());
    const member = registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "STRUCTURAL_FINDING", sourceObjectId: "find-1", stateClass: "OBSERVED_STATE", limitations: "none", version: "1" });
    expect(member.structuralTargetRef.targetId).toBe("mem-1");
    expect(() => registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "STRUCTURAL_FINDING", sourceObjectId: "find-x", stateClass: "OBSERVED_STATE", limitations: "none", version: "1" })).toThrow("TARGET_SCOPE_MISMATCH");
    createTwin(runtime, actor, twinInput({ twinId: "twin-member", twinScope: "BOUNDED_STRUCTURAL_ASSET_SCOPE", targetKind: "MEMBER", targetId: "mem-1", parentStructuralSystemId: "sys-1", purpose: "member-only" }));
    expect(registerStateReference(runtime, actor, { twinId: "twin-member", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" }).twinId).toBe("twin-member");
    expect(() => registerStateReference(runtime, actor, { twinId: "twin-member", sourceDomain: "D1F_ANALYSIS", sourceObjectType: "ANALYSIS_RESULT", sourceObjectId: "result-1", stateClass: "ANALYTICAL_STATE", limitations: "none", version: "1" })).toThrow("TARGET_SCOPE_MISMATCH");
    const foreign = catalog();
    foreign.conditionStates[0] = condition("cond-foreign");
    foreign.contexts[0] = { ...context("ctx-foreign"), projectId: "project-9", inspectionContextId: "ctx-foreign" };
    foreign.conditionStates[0].inspectionContextId = "ctx-foreign";
    const foreignStore = store("2026-06-10T00:00:00.000Z", foreign);
    createTwin(foreignStore, actor, twinInput());
    expect(() => registerStateReference(foreignStore, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-foreign", stateClass: "CONDITION_STATE", limitations: "none", version: "1" })).toThrow("CROSS_PROJECT_REFERENCE");
    foreign.contexts[0].projectId = "project-1";
    foreign.contexts[0].tenantId = "tenant-9";
    expect(() => registerStateReference(foreignStore, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-foreign", stateClass: "CONDITION_STATE", limitations: "none", version: "1" })).toThrow("CROSS_TENANT_REFERENCE");
  });

  it("keeps history pinned across supersession, fingerprint change, and staleness", () => {
    const source = catalog();
    const runtime = store("2026-06-10T00:00:00.000Z", source);
    createTwin(runtime, actor, twinInput());
    const first = registerStateReference(runtime, actor, { stateReferenceId: "ref-1", twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" });
    const again = registerStateReference(runtime, actor, { stateReferenceId: "ref-again", twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" });
    expect(again.stateReferenceId).toBe(first.stateReferenceId);
    expect(runtime.references.filter((row) => row.sourceObjectId === "cond-1")).toHaveLength(1);
    const second = supersedeStateReference(runtime, actor, "ref-1", { stateReferenceId: "ref-2", twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-2", stateClass: "CONDITION_STATE", limitations: "successor", version: "2" });
    expect(first.referenceStatus).toBe("SUPERSEDED_REFERENCE");
    expect(first.sourceFingerprint).toBe("cond-cond-1-fp");
    expect(second.predecessorId).toBe("ref-1");
    expect(runtime.history.filter((row) => row.subjectId === "ref-1").length).toBeGreaterThan(0);
    source.conditionStates[1].fingerprint = "changed-fp";
    const changed = evaluateStateReferenceStatus(runtime, "ref-2");
    expect(changed.referenceStatus).toBe("STALE_REFERENCE");
    expect(changed.sourceFingerprint).toBe("cond-cond-2-fp");
    const historyBefore = runtime.history.length;
    source.upstreamMarks.push({ objectType: "CONDITION_STATE", objectId: "cond-1", mark: "INVALID" });
    evaluateStateReferenceStatus(runtime, "ref-1");
    expect(runtime.history.length).toBe(historyBefore);
    const fresh = store();
    createTwin(fresh, actor, twinInput());
    const live = registerStateReference(fresh, actor, { stateReferenceId: "ref-live", twinId: "twin-1", sourceDomain: "D1F_ANALYSIS", sourceObjectType: "ANALYSIS_RESULT", sourceObjectId: "result-1", stateClass: "ANALYTICAL_STATE", limitations: "none", version: "1" });
    const pinnedFingerprint = live.sourceFingerprint;
    fresh.catalog.analysisResults[0].authorityState = "STALE";
    expect(evaluateStateReferenceStatus(fresh, "ref-live").referenceStatus).toBe("STALE_REFERENCE");
    expect(live.sourceFingerprint).toBe(pinnedFingerprint);
    fresh.catalog.analysisResults[0].authorityState = "VERIFIED_GOVERNED";
    fresh.catalog.identities[0].lifecycle = "SUPERSEDED";
    expect(evaluateStateReferenceStatus(fresh, "ref-live").sourceObjectId).toBe("result-1");
    const withdrawn = store();
    createTwin(withdrawn, actor, twinInput());
    registerStateReference(withdrawn, actor, { stateReferenceId: "ref-w", twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" });
    withdrawn.catalog.conditionStates[0].authority = "WITHDRAWN";
    expect(evaluateStateReferenceStatus(withdrawn, "ref-w").referenceStatus).toBe("INVALID_REFERENCE");
    expect(withdrawn.catalog.conditionStates[0].capacityChanged).toBe(false);
  });

  it("records provenance, deterministic fingerprints, and non-governing current reference status", () => {
    const left = store();
    const right = store();
    createTwin(left, actor, twinInput());
    createTwin(right, actor, twinInput());
    const a = registerStateReference(left, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" });
    const b = registerStateReference(right, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" });
    expect(a.fingerprint).toBe(b.fingerprint);
    expect(a.fingerprint).toContain("") ;
    expect(a.provenance.sourceFingerprint).toBe(a.sourceFingerprint);
    expect(a.provenance.registrationAuthority).toBe("HUMAN");
    expect(a.provenance.sourceAuthority).toBe("HUMAN");
    expect(a.referenceStatus).toBe("CURRENT_REFERENCE");
    expect(a.statusMeaning).toBe("ACTIVE_REFERENCE_RECORD_NOT_GOVERNING_STATE");
    expect(D1I_R1_CURRENT_REFERENCE_STATUS_EQUALS_GOVERNING_CURRENT_STATE).toBe(false);
    expect(D1I_R1_CURRENT_STATE_SELECTOR_RUNTIME_COUNT).toBe(0);
    expect(D1I_R1_SNAPSHOT_RUNTIME_COUNT).toBe(0);
    expect(D1I_R1_STATE_CONFLICT_RUNTIME_COUNT).toBe(0);
    const later = createD1iR1Store(catalog(), () => "2026-06-11T00:00:00.000Z");
    createTwin(later, actor, twinInput());
    const shifted = registerStateReference(later, actor, { twinId: "twin-1", sourceDomain: "D1H_INSPECTION_CONDITION", sourceObjectType: "CONDITION_STATE", sourceObjectId: "cond-1", stateClass: "CONDITION_STATE", limitations: "none", version: "1" });
    expect(shifted.fingerprint).not.toBe(a.fingerprint);
    const result = produceTwinReferenceFoundationResult(left, "twin-1");
    expect(result.completeness).toBe("COMPLETE_FOR_DECLARED_REFERENCE_SCOPE");
    expect(result.healthyStructure).toBe(false);
    expect(result.structuralAdequacy).toBe(false);
    expect(result.runtimeDiagnostics.every((row) => row.structuralFinding === false && row.twinState === false)).toBe(true);
    const failed = catalog({ analysisResults: [analysis({ runStatus: "FAILED", authorityState: "FAILED_ANALYSIS" })] });
    const failedStore = store("2026-06-10T00:00:00.000Z", failed);
    createTwin(failedStore, actor, twinInput());
    const failedRef = registerStateReference(failedStore, actor, { twinId: "twin-1", sourceDomain: "D1F_ANALYSIS", sourceObjectType: "ANALYSIS_RESULT", sourceObjectId: "result-1", stateClass: "ANALYTICAL_STATE", limitations: "failed context", version: "1" });
    expect(failedRef.referenceStatus).toBe("HISTORICAL_REFERENCE");
    expect(failedRef.governsPhysicalState).toBe(false);
    const sourceText = readFileSync(join(here, "twin-reference-foundation.ts"), "utf8");
    expect(sourceText).not.toMatch(/fetchAnySource|resolveAnyObject|getObjectByPath|lookupArbitrarySource/);
    expect(sourceText).not.toMatch(/export function selectGoverning|export function createTwinSnapshot|export function resolveStateConflict|export function queryAsOf/);
    expect(scanAnalysisFormulaBypass(join(here, "twin-reference-foundation.ts"), sourceText)).toEqual([]);
    const docPath = join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_R1_TWIN_IDENTITY_STATE_REFERENCE_FOUNDATION.md");
    const doc = readFileSync(docPath, "utf8");
    expect(scanAnalysisFormulaBypass(docPath, doc)).toEqual([]);
    expect(doc).not.toMatch(/```/);
  });
});
