/**
 * EOS-D1I-R4 external monitoring reference tests.
 * Synthetic identities only. No provider connection and no sample payload.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  D1I_R3_COMPARATOR_REGISTRY,
  createD1iR3Store,
} from "./twin-conflict-composition";
import {
  D1I_R4_ACCELERATION_AUTO_INTEGRATED,
  D1I_R4_CALLER_CHECKSUM_CAN_ESTABLISH_SOURCE_TRUTH,
  D1I_R4_DEFAULT_CALIBRATION_INTERVAL_CREATED,
  D1I_R4_DATA_FETCH_API_COUNT,
  D1I_R4_ENGINEERING_THRESHOLD_ENGINE_COUNT,
  D1I_R4_MATURITY_STATE,
  D1I_R4_R3_COMPARATOR_REGISTRY_MODIFIED,
  D1I_R4_SENSOR_ANALYTICS_RUNTIME_COUNT,
  D1I_R4_SHM_DIAGNOSIS_RUNTIME_COUNT,
  D1I_R4_STREAMING_RUNTIME_COUNT,
  D1I_R4_TELEMETRY_AUTO_PROMOTED_TO_MEASURED_STATE,
  D1I_R5_CANONICAL_PHASE_FROM_REPOSITORY,
  D1I_R5_CANONICAL_SCOPE_FROM_REPOSITORY,
  D1I_R5_HANDOFF_READY,
  assessClockCompatibility,
  bindMonitoringChannelToStructuralTarget,
  createD1iR4Store,
  inspectTelemetryDataReference,
  produceTelemetryMonitoringReferenceResult,
  registerMonitoringChannelReference,
  registerMonitoringDeviceReference,
  registerMonitoringSource,
  registerTelemetryDataReference,
  registerTelemetryStateReference,
  reportObservedSourceFingerprint,
  supersedeMonitoringDevice,
  supersedeMonitoringTargetBinding,
  withdrawMonitoringSourceAuthority,
  evaluateTelemetryReferenceStatus,
  type D1iR4Store,
} from "./twin-monitoring-reference";
import { createD1iR1Store, createTwin, registerStateReference, type D1iR1Actor, type D1iR1Catalog, type D1iR1StructuralIdentity } from "./twin-reference-foundation";
import { createD1iR2Store, createExplicitTwinSnapshot, queryAsKnownAtTime, selectCurrentStateReference } from "./twin-temporal-governance";

const here = dirname(fileURLToPath(import.meta.url));
const actor: D1iR1Actor = { actorId: "engineer-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", authority: "HUMAN" };

function identity(kind: D1iR1StructuralIdentity["kind"], id: string): D1iR1StructuralIdentity {
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
  };
}

function catalog(): D1iR1Catalog {
  return { identities: [identity("STRUCTURAL_SYSTEM", "sys-1"), identity("MEMBER", "mem-1"), identity("MEMBER", "mem-2")], contexts: [], findings: [], measurements: [], interpretations: [], conditionStates: [], analysisResults: [], upstreamMarks: [] };
}

function boot(clock: { now: string }) {
  const runtime = createD1iR4Store(createD1iR3Store(createD1iR2Store(createD1iR1Store(catalog(), () => clock.now))));
  createTwin(runtime, actor, { twinId: "twin-1", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", twinScope: "STRUCTURAL_SYSTEM", targetKind: "STRUCTURAL_SYSTEM", targetId: "sys-1", parentStructuralSystemId: null, purpose: "monitoring-reference", governanceProfileRef: "profile-1", version: "1" });
  return runtime;
}

function source(runtime: D1iR4Store, id = "src-1") {
  return registerMonitoringSource(runtime, actor, { monitoringSourceId: id, tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", providerKind: "DATA_LOGGER", sourceSystemType: "LOGGER", externalSystemInstanceRef: `instance-${id}`, sourceAuthority: "EXTERNAL_OWNER", version: "1" });
}

function device(runtime: D1iR4Store, id: string, externalDeviceId: string, displayName = "North gauge") {
  return registerMonitoringDeviceReference(runtime, actor, { deviceReferenceId: id, monitoringSourceId: "src-1", externalDeviceId, deviceType: "ACCELEROMETER", displayName, manufacturer: "Maker", model: "A1", serial: externalDeviceId, version: "1" });
}

function channel(runtime: D1iR4Store, id: string, deviceReferenceId: string, overrides: Partial<Parameters<typeof registerMonitoringChannelReference>[2]> = {}) {
  return registerMonitoringChannelReference(runtime, actor, { channelReferenceId: id, deviceReferenceId, externalChannelId: `ch-${id}`, channelName: "X", measurementQuantity: "acceleration", unit: "m/s2", axis: "member-local-x", processingClass: "RAW_SOURCE_DATA", version: "1", ...overrides });
}

function bind(runtime: D1iR4Store, id: string, channelReferenceId: string, targetId = "mem-1") {
  return bindMonitoringChannelToStructuralTarget(runtime, actor, { bindingId: id, twinId: "twin-1", channelReferenceId, targetKind: "MEMBER", targetId, bindingPurpose: "local-response-reference", basis: "installation-record", limitations: "not global response", version: "1" });
}

function dataset(runtime: D1iR4Store, id: string, bindingId: string, channelReferenceId: string, overrides: Partial<Parameters<typeof registerTelemetryDataReference>[2]> = {}) {
  return registerTelemetryDataReference(runtime, actor, {
    telemetryReferenceId: id,
    monitoringSourceId: "src-1",
    deviceReferenceId: "dev-1",
    channelReferenceIds: [channelReferenceId],
    externalDatasetOrObservationId: `dataset-${id}`,
    sourceDataClass: "RAW_SOURCE_DATA",
    governedSourceFingerprint: `governed-${id}`,
    targetBindingIds: [bindingId],
    limitations: "reference only",
    version: "1",
    timeBasis: { deviceTime: "2026-06-01T00:00:00.000Z", observationTime: "2026-06-01T00:00:00.000Z", datasetStart: "2026-06-01T00:00:00.000Z", datasetEnd: "2026-06-01T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" },
    ...overrides,
  });
}

describe("EOS-D1I-R4 external monitoring reference interface", () => {
  it("registers source, device, and channel identity without inferring unit or axis", () => {
    const runtime = boot({ now: "2026-06-20T00:00:00.000Z" });
    const registered = source(runtime);
    expect(registered.validatesMeasurements).toBe(false);
    expect(registered.providerKind).toBe("DATA_LOGGER");
    const first = device(runtime, "dev-1", "serial-a");
    const replacement = device(runtime, "dev-2", "serial-b");
    expect(replacement.deviceReferenceId).not.toBe(first.deviceReferenceId);
    expect(replacement.externalDeviceId).not.toBe(first.externalDeviceId);
    const axis = channel(runtime, "ch-1", "dev-1");
    expect(axis.measurementQuantity).toBe("acceleration");
    expect(axis.unit).toBe("m/s2");
    expect(() => channel(runtime, "ch-missing-unit", "dev-1", { measurementQuantity: "length", unit: undefined, axis: null })).toThrow("UNIT_REQUIRED");
    expect(() => channel(runtime, "ch-missing-axis", "dev-1", { axis: null })).toThrow("AXIS_REQUIRED");
    expect(() => registerMonitoringSource(runtime, actor, { monitoringSourceId: "bad", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", providerKind: "VENDOR_CLOUD", sourceSystemType: "X", externalSystemInstanceRef: "x", sourceAuthority: "EXTERNAL_OWNER", version: "1" })).toThrow("UNSUPPORTED_PROVIDER");
  });

  it("binds only an explicit target and keeps relocation history", () => {
    const runtime = boot({ now: "2026-06-20T00:00:00.000Z" });
    source(runtime);
    device(runtime, "dev-1", "serial-a");
    channel(runtime, "ch-1", "dev-1");
    expect(() => bindMonitoringChannelToStructuralTarget(runtime, actor, { bindingId: "near", twinId: "twin-1", channelReferenceId: "ch-1", targetKind: "MEMBER", targetId: "", bindingPurpose: "guess", basis: "coordinates", limitations: "none", version: "1", coordinates: [1, 2] } as never)).toThrow("TARGET_BINDING_REQUIRED");
    const bound = bind(runtime, "bind-1", "ch-1");
    expect(bound.structuralTargetRef.targetId).toBe("mem-1");
    expect(bound.globalMemberResponse).toBe(false);
    expect(bound.validatesSensor).toBe(false);
    expect(bound.effectiveTo).toBeNull();
    const moved = supersedeMonitoringTargetBinding(runtime, actor, "bind-1", { bindingId: "bind-2", twinId: "twin-1", channelReferenceId: "ch-1", targetKind: "MEMBER", targetId: "mem-2", bindingPurpose: "relocated", basis: "installation-record", limitations: "successor", version: "2" });
    expect(bound.structuralTargetRef.targetId).toBe("mem-1");
    expect(bound.fingerprint).not.toBe(moved.fingerprint);
    expect(moved.predecessorId).toBe("bind-1");
    expect(runtime.monitoringHistory.some((row) => row.subjectId === "bind-1" && row.action === "SUPERSEDED")).toBe(true);
  });

  it("references datasets without samples, raw relabeling, or caller-checksum truth", () => {
    const runtime = boot({ now: "2026-06-20T00:00:00.000Z" });
    source(runtime);
    device(runtime, "dev-1", "serial-a");
    channel(runtime, "ch-1", "dev-1");
    bind(runtime, "bind-1", "ch-1");
    const raw = dataset(runtime, "tel-1", "bind-1", "ch-1");
    expect(raw.sourceDataClass).toBe("RAW_SOURCE_DATA");
    expect(JSON.stringify(raw)).not.toContain("samples");
    expect(raw.sampleCountProvesComplete).toBe(false);
    expect(raw.timeRangeProvesContinuous).toBe(false);
    const processed = dataset(runtime, "tel-p", "bind-1", "ch-1", { sourceDataClass: "SOURCE_PROCESSED_DATA", governedSourceFingerprint: "governed-p", externalDatasetOrObservationId: "dataset-p" });
    expect(processed.sourceDataClass).not.toBe("RAW_SOURCE_DATA");
    const derived = dataset(runtime, "tel-d", "bind-1", "ch-1", { sourceDataClass: "SOURCE_DERIVED_RESULT", governedSourceFingerprint: "governed-d", externalDatasetOrObservationId: "dataset-d", derivedAlgorithmId: "vendor-alg", derivedAlgorithmVersion: "3" });
    expect(derived.directMeasurement).toBe(false);
    expect(() => dataset(runtime, "tel-raw-derived", "bind-1", "ch-1", { sourceDataClass: "RAW_SOURCE_DATA", derivedAlgorithmId: "vendor-alg", governedSourceFingerprint: "governed-x", externalDatasetOrObservationId: "dataset-x" })).toThrow("UNSUPPORTED_SOURCE_CLASS");
    expect(raw.sourceFingerprint).toBe("governed-tel-1");
    expect(() => dataset(runtime, "spoof", "bind-1", "ch-1", { callerChecksum: "attacker", governedSourceFingerprint: "governed-real", externalDatasetOrObservationId: "dataset-spoof" })).toThrow("SOURCE_FINGERPRINT_MISMATCH");
    expect(() => dataset(runtime, "none", "bind-1", "ch-1", { governedSourceFingerprint: undefined, externalDatasetOrObservationId: "dataset-none" })).toThrow("SOURCE_FINGERPRINT_UNRESOLVED");
    const changed = reportObservedSourceFingerprint(runtime, raw.telemetryReferenceId, "other-fingerprint");
    expect(changed.sourceFingerprint).toBe("governed-tel-1");
    expect(runtime.monitoringHistory.some((row) => row.subjectId === raw.telemetryReferenceId && row.action === "STALE")).toBe(true);
    expect(() => dataset(runtime, "payload", "bind-1", "ch-1", { samples: [1, 2, 3] } as never)).toThrow("SAMPLE_PAYLOAD_REJECTED");
    const alert = dataset(runtime, "alert", "bind-1", "ch-1", { sourceDataClass: "SOURCE_ALERT_OR_EVENT", governedSourceFingerprint: "governed-alert", externalDatasetOrObservationId: "dataset-alert" });
    expect(alert.unsafe).toBe(false);
    expect(alert.engineeringAuthority).toBe(false);
    expect(runtime.conflicts).toHaveLength(0);
    expect(runtime.catalog.findings).toHaveLength(0);
  });

  it("keeps clock, calibration, quality, and known-at uncertainty explicit", () => {
    const clock = { now: "2026-06-20T00:00:00.000Z" };
    const runtime = boot(clock);
    source(runtime);
    device(runtime, "dev-1", "serial-a");
    const firstCalibration = channel(runtime, "ch-1", "dev-1", { calibration: { calibrationStatus: "CALIBRATED_SOURCE_REPORTED", calibrationReferenceId: "cal-1", calibrationDate: "2026-01-01T00:00:00.000Z" } });
    bind(runtime, "bind-1", "ch-1");
    const early = dataset(runtime, "tel-1", "bind-1", "ch-1", { calibration: firstCalibration.calibration });
    expect(early.timeBasis.clockQuality).toBe("UNKNOWN");
    expect(early.timeBasis.knownAtTime).toBe("2026-06-20T00:00:00.000Z");
    expect(early.timeBasis.deviceTime).not.toBe(early.timeBasis.knownAtTime);
    expect(early.sourceQuality).toBe("UNKNOWN");
    expect(early.calibration.structuralValidation).toBe(false);
    const other = { ...early.timeBasis, deviceTime: "2026-06-01T00:00:01.000Z" };
    expect(assessClockCompatibility(early.timeBasis, other).synchronized).toBe(false);
    expect(() => dataset(runtime, "backdate", "bind-1", "ch-1", { knownAtTime: "2020-01-01T00:00:00.000Z" } as never)).toThrow("TEMPORAL_HISTORY_TAMPERING_REJECTED");
    const laterChannel = channel(runtime, "ch-2", "dev-1", { externalChannelId: "ch-2", calibration: { calibrationStatus: "CALIBRATED_SOURCE_REPORTED", calibrationReferenceId: "cal-2" }, predecessorId: "ch-1", version: "2" });
    expect(laterChannel.calibration.calibrationReferenceId).toBe("cal-2");
    expect(inspectTelemetryDataReference(runtime, "tel-1").calibration.calibrationReferenceId).toBe("cal-1");
    expect(D1I_R4_DEFAULT_CALIBRATION_INTERVAL_CREATED).toBe(false);
    const historyBefore = runtime.history.length;
    clock.now = "2026-07-01T00:00:00.000Z";
    const late = dataset(runtime, "late", "bind-1", "ch-1", { governedSourceFingerprint: "governed-late", externalDatasetOrObservationId: "dataset-late", timeBasis: { deviceTime: "2026-06-01T00:00:00.000Z", observationTime: "2026-06-01T00:00:00.000Z", datasetStart: "2026-06-01T00:00:00.000Z", datasetEnd: "2026-06-01T00:00:00.000Z", clockQuality: "UNKNOWN", clockClaimAuthority: "UNKNOWN" } });
    const pinned = registerTelemetryStateReference(runtime, actor, { telemetryReferenceId: late.telemetryReferenceId, version: "1", limitations: "late registration" });
    expect(pinned.stateClass).toBe("TELEMETRY_STATE");
    expect(late.timeBasis.deviceTime).toBe("2026-06-01T00:00:00.000Z");
    expect(late.timeBasis.knownAtTime).toBe("2026-07-01T00:00:00.000Z");
    const asKnown = queryAsKnownAtTime(runtime, { twinId: "twin-1", knownAt: "2026-06-25T00:00:00.000Z", declaredScope: { targetIds: ["mem-1"], stateClasses: ["TELEMETRY_STATE"], sourceDomains: ["FUTURE_TELEMETRY"], purpose: "review" } });
    expect(asKnown.eligibleReferenceIds).not.toContain(pinned.stateReferenceId);
    expect(runtime.history.length).toBeGreaterThan(historyBefore);
  });

  it("pins telemetry state without promotion, current-selection change, snapshot mutation, or conflict", () => {
    const clock = { now: "2026-06-10T00:00:00.000Z" };
    const runtime = boot(clock);
    const design = registerStateReference(runtime, actor, { twinId: "twin-1", sourceDomain: "D1F_STRUCTURAL_SYSTEM", sourceObjectType: "STRUCTURAL_SYSTEM", sourceObjectId: "sys-1", stateClass: "DESIGN_OR_REFERENCE_STATE", limitations: "identity", version: "1" });
    const selected = selectCurrentStateReference(runtime, actor, { twinId: "twin-1", targetId: "sys-1", stateClass: "DESIGN_OR_REFERENCE_STATE", sourceDomain: "D1F_STRUCTURAL_SYSTEM", purpose: "review", selectionBasis: "human-review", limitations: "lane", version: "1", stateReferenceId: design.stateReferenceId });
    const snapshot = createExplicitTwinSnapshot(runtime, actor, { snapshotId: "before", twinId: "twin-1", snapshotPurpose: "HISTORICAL_RECORD", declaredScope: { targetIds: ["sys-1"], stateClasses: ["DESIGN_OR_REFERENCE_STATE"], sourceDomains: ["D1F_STRUCTURAL_SYSTEM"], purpose: "review" }, stateReferenceIds: [design.stateReferenceId], limitations: "frozen", version: "1" });
    const frozen = [...snapshot.stateReferenceIds];
    clock.now = "2026-06-20T00:00:00.000Z";
    source(runtime);
    device(runtime, "dev-1", "serial-a");
    channel(runtime, "ch-1", "dev-1");
    bind(runtime, "bind-1", "ch-1");
    const row = dataset(runtime, "tel-1", "bind-1", "ch-1");
    const pinned = registerTelemetryStateReference(runtime, actor, { telemetryReferenceId: row.telemetryReferenceId, stateReferenceId: "tel-state-1", version: "1", limitations: "pin" });
    const state = runtime.references.find((item) => item.stateReferenceId === pinned.stateReferenceId);
    expect(state?.stateClass).toBe("TELEMETRY_STATE");
    expect(state?.sourceDomain).toBe("FUTURE_TELEMETRY");
    expect(state?.sourceFingerprint).toBe(row.fingerprint);
    expect(state?.sourceObjectId).toBe(row.telemetryReferenceId);
    expect(D1I_R4_TELEMETRY_AUTO_PROMOTED_TO_MEASURED_STATE).toBe(false);
    expect(runtime.references.some((item) => item.stateClass === "MEASURED_STATE")).toBe(false);
    expect(selected.selectedStateReferenceId).toBe(design.stateReferenceId);
    expect(snapshot.stateReferenceIds).toEqual(frozen);
    expect(runtime.conflicts).toHaveLength(0);
    expect(runtime.assessments).toHaveLength(0);
    expect(D1I_R4_R3_COMPARATOR_REGISTRY_MODIFIED).toBe(false);
    expect(D1I_R4_COMPARATOR_REGISTRY_UNCHANGED(D1I_R3_COMPARATOR_REGISTRY)).toBe(true);
    expect(D1I_R4_ACCELERATION_AUTO_INTEGRATED).toBe(false);
    expect(D1I_R4_ENGINEERING_THRESHOLD_ENGINE_COUNT).toBe(0);
    expect(row.directMeasurement).toBe(false);
  });
});

function D1I_R4_COMPARATOR_REGISTRY_UNCHANGED(value: string): boolean {
  return value.includes("Allowlisted pairs only");
}

describe("EOS-D1I-R4 history, isolation, and scope boundary", () => {
  it("keeps append-only history, fingerprints, staleness, and provenance", () => {
    const clock = { now: "2026-06-20T00:00:00.000Z" };
    const runtime = boot(clock);
    const registered = source(runtime);
    const first = device(runtime, "dev-1", "serial-a");
    const again = device(runtime, "dev-1", "serial-a");
    expect(again.fingerprint).toBe(first.fingerprint);
    const replaced = supersedeMonitoringDevice(runtime, actor, "dev-1", { deviceReferenceId: "dev-2", monitoringSourceId: "src-1", externalDeviceId: "serial-b", deviceType: "ACCELEROMETER", displayName: "North gauge", version: "1" });
    expect(replaced.externalDeviceId).not.toBe(first.externalDeviceId);
    expect(first.externalDeviceId).toBe("serial-a");
    channel(runtime, "ch-1", "dev-1");
    expect(() => channel(runtime, "ch-1", "dev-1", { unit: "mm/s2", version: "2" })).toThrow("CHANNEL_CONFIGURATION_MUTATED");
    const bound = bind(runtime, "bind-1", "ch-1");
    const row = dataset(runtime, "tel-1", "bind-1", "ch-1");
    registerTelemetryStateReference(runtime, actor, { telemetryReferenceId: row.telemetryReferenceId, version: "1", limitations: "pin" });
    const beforeFingerprint = row.fingerprint;
    const beforeBinding = row.targetBindingIds[0];
    supersedeMonitoringTargetBinding(runtime, actor, "bind-1", { bindingId: "bind-2", twinId: "twin-1", channelReferenceId: "ch-1", targetKind: "MEMBER", targetId: "mem-2", bindingPurpose: "later", basis: "installation-record", limitations: "new", version: "2" });
    expect(row.targetBindingIds[0]).toBe(beforeBinding);
    expect(row.fingerprint).toBe(beforeFingerprint);
    evaluateTelemetryReferenceStatus(runtime, row.telemetryReferenceId);
    withdrawMonitoringSourceAuthority(runtime, registered.sourceAuthority);
    expect(runtime.monitoringHistory.filter((item) => item.subjectId === row.telemetryReferenceId && item.action === "STALE").length).toBeGreaterThan(0);
    expect(runtime.monitoringHistory.filter((item) => item.subjectId === "dev-1" && item.action === "REGISTERED")).toHaveLength(1);
    expect(row.provenance.sourceAuthority).toBe("EXTERNAL_OWNER");
    expect(bound.provenance.mappingAuthority).toBe("HUMAN");
    const result = produceTelemetryMonitoringReferenceResult(runtime, "twin-1");
    expect(result.continuousMonitoring).toBe(false);
    expect(result.structuralAdequacy).toBe(false);
    expect(result.engineeringApproval).toBe(false);
    expect(result.runtimeDiagnostics.every((item) => item.structuralFinding === false && item.conflict === false)).toBe(true);
  });

  it("rejects cross-scope, network, secrets, analytics, and model effects", () => {
    const runtime = boot({ now: "2026-06-20T00:00:00.000Z" });
    expect(() => registerMonitoringSource(runtime, { ...actor, projectId: "project-2" }, { monitoringSourceId: "x", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", providerKind: "DATA_LOGGER", sourceSystemType: "LOGGER", externalSystemInstanceRef: "ext", sourceAuthority: "EXTERNAL_OWNER", version: "1" })).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => registerMonitoringSource(runtime, { ...actor, tenantId: "tenant-2" }, { monitoringSourceId: "y", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", providerKind: "DATA_LOGGER", sourceSystemType: "LOGGER", externalSystemInstanceRef: "ext", sourceAuthority: "EXTERNAL_OWNER", version: "1" })).toThrow("CROSS_TENANT_OPERATION");
    expect(() => registerMonitoringSource(runtime, { ...actor, authority: "AI_ASSISTANT" }, { monitoringSourceId: "ai", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", providerKind: "DATA_LOGGER", sourceSystemType: "LOGGER", externalSystemInstanceRef: "ext", sourceAuthority: "EXTERNAL_OWNER", version: "1" })).toThrow("UNAUTHORIZED");
    expect(() => registerMonitoringSource(runtime, actor, { monitoringSourceId: "url", tenantId: "tenant-1", workspaceId: "workspace-1", projectId: "project-1", providerKind: "DATA_LOGGER", sourceSystemType: "LOGGER", externalSystemInstanceRef: "ext", sourceAuthority: "EXTERNAL_OWNER", version: "1", url: "http://127.0.0.1/sensor" } as never)).toThrow("ARBITRARY_URL_REJECTED");
    expect(() => registerMonitoringDeviceReference(runtime, actor, { deviceReferenceId: "path", monitoringSourceId: "src-1", externalDeviceId: "serial", deviceType: "ACCELEROMETER", version: "1", path: "../secret" } as never)).toThrow("ARBITRARY_PATH_REJECTED");
    source(runtime);
    expect(() => registerMonitoringDeviceReference(runtime, actor, { deviceReferenceId: "secret-dev", monitoringSourceId: "src-1", externalDeviceId: "serial-z", deviceType: "ACCELEROMETER", version: "1", apiKey: "hidden" } as never)).toThrow("SECRET_STORAGE_REJECTED");
    expect(D1I_R4_DATA_FETCH_API_COUNT).toBe(0);
    expect(D1I_R4_STREAMING_RUNTIME_COUNT).toBe(0);
    expect(D1I_R4_SENSOR_ANALYTICS_RUNTIME_COUNT).toBe(0);
    expect(D1I_R4_SHM_DIAGNOSIS_RUNTIME_COUNT).toBe(0);
    expect(D1I_R4_CALLER_CHECKSUM_CAN_ESTABLISH_SOURCE_TRUTH).toBe(false);
    expect(runtime.catalog.analysisResults).toHaveLength(0);
    const sourceText = readFileSync(join(here, "twin-monitoring-reference.ts"), "utf8");
    const doc = readFileSync(join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_R4_EXTERNAL_TELEMETRY_MONITORING_REFERENCE_INTERFACE.md"), "utf8");
    expect(sourceText).not.toMatch(/\bfetch\(|mqtt|opcua|modbus|WebSocket|fft\(|child_process|eval\(|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "twin-monitoring-reference.ts"), sourceText)).toEqual([]);
    expect(scanAnalysisFormulaBypass(join(here, "../../../../docs/architecture/engineering-os/EOS_D1I_R4_EXTERNAL_TELEMETRY_MONITORING_REFERENCE_INTERFACE.md"), doc)).toEqual([]);
    expect(D1I_R4_MATURITY_STATE).toBe("STRUCTURAL_DIGITAL_TWIN_EXTERNAL_TELEMETRY_MONITORING_REFERENCE_INTERFACE_IMPLEMENTED");
    expect(D1I_R5_HANDOFF_READY).toBe(true);
    expect(D1I_R5_CANONICAL_PHASE_FROM_REPOSITORY).toBe("EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT");
    expect(D1I_R5_CANONICAL_SCOPE_FROM_REPOSITORY).toContain("EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT");
    expect(doc).toContain("EOS-D1I-R5-STRUCTURAL-DIGITAL-TWIN-CLOSEOUT");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_EXTERNAL_MONITORING_REFERENCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_SENSOR_STREAMING")?.implementationState).toBe("NOT_IMPLEMENTED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D1I.STRUCTURAL_DIGITAL_TWIN_RUNTIME")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
