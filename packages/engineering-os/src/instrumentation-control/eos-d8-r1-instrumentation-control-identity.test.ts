import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D8_CANONICAL_MILESTONE_COUNT,
  D8_IAC_OBJECT_TYPES,
  D8_R1_STARTED,
  D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
  D8_RUNTIME_STARTED as ARCHITECTURE_RUNTIME_STARTED,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  ADMIN_CAN_BYPASS_D8_AUTHORITATIVE_TYPE_ALLOWLIST,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D8_IAC_IDENTITY,
  AI_CAN_PROMOTE_UNKNOWN_D8_TYPE_TO_AUTHORITATIVE,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D8_IDENTITY_AUTO_ACCEPTED,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_REOPENED,
  D5_TRACK_COMPLETE,
  D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN,
  D6_REOPENED,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION,
  D7_REOPENED,
  D7_STATUS,
  D7_TRACK_COMPLETE,
  D8_0_ARCHITECTURE_REUSED,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_ARCHITECTURE_DEFINED,
  D8_ARCHITECTURE_READY,
  D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_CONTEXT_AUTHORITY,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXACT_OBJECT_REVISION_IDENTITY_REQUIRED,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_FLOATING_OBJECT_REVISION_ALLOWED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_IAC_OBJECT_IDENTITY_IMPLEMENTED,
  D8_IDENTITY_LIFECYCLE_STATE_EQUALS_VALIDATED,
  D8_IDENTITY_MATURITY_EQUALS_APPROVED,
  D8_IDENTITY_MATURITY_EQUALS_VALIDATED,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_IMPLEMENTED,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_R1_APPLICABILITY_EXPLICIT,
  D8_R1_AUTO_ADVANCES_MATURITY,
  D8_R1_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D8_R1_CANONICAL_NEXT_PHASE,
  D8_R1_CANONICAL_NEXT_PHASE_SCOPE,
  D8_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R1_FINGERPRINT_MISMATCH_AUTO_REBASELINED,
  D8_R1_FINGERPRINT_MISMATCH_AUTO_REPAIRED,
  D8_R1_FINGERPRINT_VERIFICATION_IMPLEMENTED,
  D8_R1_FREEFORM_AUTHORITATIVE_IDENTITY_ALLOWED,
  D8_R1_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D8_R1_HISTORY_PRESERVED,
  D8_R1_IDENTITY_AUTO_CREATES_CONTROL_LOOP_CONTEXT,
  D8_R1_IDENTITY_AUTO_CREATES_CONTROL_SYSTEM_CONTEXT,
  D8_R1_IDENTITY_AUTO_CREATES_INSTRUMENT_DEVICE_CONTEXT,
  D8_R1_IDENTITY_AUTO_CREATES_PROCESS_MEASUREMENT_CONTEXT,
  D8_R1_IDENTITY_AUTO_CREATES_SAFETY_INTERLOCK_SHUTDOWN_CONTEXT,
  D8_R1_IDENTITY_AUTO_CREATES_SIGNAL_IO_CONTEXT,
  D8_R1_LIFECYCLE_GOVERNANCE_IMPLEMENTED,
  D8_R1_LIMITATIONS_EXPLICIT,
  D8_R1_MATURITY,
  D8_R1_MATURITY_GOVERNANCE_IMPLEMENTED,
  D8_R1_NEXT_PHASE_TYPE,
  D8_R1_PERFORMS_ALARM_RATIONALIZATION,
  D8_R1_PERFORMS_CONTROL_LOOP_ENGINEERING,
  D8_R1_PERFORMS_CONTROL_SYSTEM_DESIGN,
  D8_R1_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING,
  D8_R1_PERFORMS_INSTRUMENT_SELECTION,
  D8_R1_PERFORMS_INSTRUMENT_SIZING,
  D8_R1_PERFORMS_INTERLOCK_LOGIC_DESIGN,
  D8_R1_PERFORMS_IO_ENGINEERING,
  D8_R1_PERFORMS_SHUTDOWN_LOGIC_DESIGN,
  D8_R1_PERFORMS_SIGNAL_ENGINEERING,
  D8_R1_PROVENANCE_PRESERVED,
  D8_R1_PROVENANCE_REQUIRED,
  D8_R1_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R1_SOURCE_BASIS_REQUIRED,
  D8_R1_SOURCE_BASIS_TRACEABLE,
  D8_R1_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R1_STATUS,
  D8_R1_UNKNOWN_AUTHORITATIVE_IDENTITY_AUTO_ACCEPTED,
  D8_R2_STARTED,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  IAC_OBJECT_IDENTITY_EQUALS_APPROVAL,
  IAC_OBJECT_IDENTITY_EQUALS_CERTIFICATION,
  IAC_OBJECT_IDENTITY_EQUALS_CODE_CONFORMANCE,
  IAC_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED,
  IAC_OBJECT_IDENTITY_EQUALS_VALIDATED_IAC_DESIGN,
  INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION,
  MEASUREMENT_POINT_CONTEXT_EQUALS_INSTRUMENT_SELECTION,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D8_R1_MUTATION_ALLOWED,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D8_R1_SCOPE_ENFORCED,
  CROSS_TENANT_D8_R1_ACCESS_ALLOWED,
  advanceIacMaturity,
  createD8R1Store,
  recordIacContext,
  recordIacControlLoopContext,
  recordIacControlSystemContext,
  recordIacInstrumentDeviceContext,
  recordIacObjectIdentity,
  recordIacProcessMeasurement,
  recordIacSafetyContext,
  recordIacSignalIoContext,
  reconstructIacObject,
  repairIacFingerprint,
  repointIacIdentity,
  type D8R1Actor,
} from "./identity-foundation";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return {
    actorId: "iac-recorder",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    authority: D8_CONTEXT_AUTHORITY,
    ...overrides,
  };
}

function contextInput(overrides: Record<string, unknown> = {}) {
  return {
    contextId: "ctx-1",
    citedLifecycleStage: "FEED",
    provenanceRef: "prov-ctx-1",
    sourceBasisRef: "basis-iac-identity",
    applicability: "project-a identity scope",
    limitations: "identity only; no measurement or device engineering",
    ...overrides,
  };
}

function objectInput(overrides: Record<string, unknown> = {}) {
  return {
    objectId: "pt-101",
    contextId: "ctx-1",
    objectType: "IAC_INSTRUMENT",
    citedLifecycleStage: "FEED",
    provenanceRef: "prov-pt-101",
    sourceBasisRef: "basis-pt-101-identity",
    applicability: "project-a identity scope",
    limitations: "identity only; no instrument selection",
    ...overrides,
  };
}

describe("EOS-D8-R1 instrumentation and control identity", () => {
  it("records exact I&C identity without promoting engineering truth", () => {
    expect(D8_0_ARCHITECTURE_REUSED && D8_ARCHITECTURE_DEFINED && D8_ARCHITECTURE_READY).toBe(true);
    expect(ARCHITECTURE_RUNTIME_STARTED).toBe(false);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D8_R1_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY).toBe(true);
    expect(D8_CANONICAL_OBJECT_TAXONOMY_REUSED && D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED).toBe(true);
    expect(D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED || D8_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED).toBe(false);
    expect(D8_IAC_OBJECT_IDENTITY_IMPLEMENTED && D8_EXACT_OBJECT_REVISION_IDENTITY_REQUIRED).toBe(true);
    expect(D8_FLOATING_OBJECT_REVISION_ALLOWED).toBe(false);
    expect(D8_IAC_OBJECT_TYPES).toContain("IAC_INSTRUMENT");
    expect(D8_IAC_OBJECT_TYPES).not.toContain("TRANSMITTER");
    expect([
      IAC_OBJECT_IDENTITY_EQUALS_VALIDATED_IAC_DESIGN,
      IAC_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED,
      IAC_OBJECT_IDENTITY_EQUALS_CODE_CONFORMANCE,
      IAC_OBJECT_IDENTITY_EQUALS_APPROVAL,
      IAC_OBJECT_IDENTITY_EQUALS_CERTIFICATION,
      D8_R1_IDENTITY_AUTO_CREATES_PROCESS_MEASUREMENT_CONTEXT,
      D8_R1_IDENTITY_AUTO_CREATES_INSTRUMENT_DEVICE_CONTEXT,
      D8_R1_IDENTITY_AUTO_CREATES_SIGNAL_IO_CONTEXT,
      D8_R1_IDENTITY_AUTO_CREATES_CONTROL_LOOP_CONTEXT,
      D8_R1_IDENTITY_AUTO_CREATES_CONTROL_SYSTEM_CONTEXT,
      D8_R1_IDENTITY_AUTO_CREATES_SAFETY_INTERLOCK_SHUTDOWN_CONTEXT,
    ]).toEqual(Array.from({ length: 11 }, () => false));
    expect([
      D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
      D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
      D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
      D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
      D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
      D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
      D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D8_REVIEW_VALIDATION_RUNTIME_COUNT,
      D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D8_D9_RUNTIME_INTEGRATION_COUNT,
      D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D8_APPROVAL_RUNTIME_COUNT,
      D8_CERTIFICATION_RUNTIME_COUNT,
      D9_RUNTIME_COUNT,
      D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
      D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
      D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
      D8_ACTUATOR_SIZING_RUNTIME_COUNT,
      D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
      D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
      D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
      D8_SIL_CALCULATION_RUNTIME_COUNT,
      D8_SIL_VERIFICATION_RUNTIME_COUNT,
      D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
      D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
      D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
    ]).toEqual(Array.from({ length: 32 }, () => 0));
    expect(D9_RUNTIME_STARTED || D8_R2_STARTED).toBe(false);
    expect(D8_R1_LIFECYCLE_GOVERNANCE_IMPLEMENTED && D8_R1_MATURITY_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D8_IDENTITY_LIFECYCLE_STATE_EQUALS_VALIDATED || D8_R1_AUTO_ADVANCES_MATURITY || D8_IDENTITY_MATURITY_EQUALS_VALIDATED || D8_IDENTITY_MATURITY_EQUALS_APPROVED).toBe(false);
    expect(D8_R1_SOURCE_BASIS_REQUIRED && D8_R1_SOURCE_BASIS_TRACEABLE && D8_R1_PROVENANCE_REQUIRED && D8_R1_PROVENANCE_PRESERVED).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D8_IDENTITY_AUTO_ACCEPTED).toBe(false);
    expect(D8_R1_APPLICABILITY_EXPLICIT && D8_R1_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D8_R1_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D8_R1_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D8_R1_ACCESS_ALLOWED).toBe(false);
    expect(D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT && D8_EXPLICIT_LINEAGE_REQUIRED).toBe(true);
    expect(PARALLEL_D8_CURRENTNESS_ENGINE_CREATED || PARALLEL_D8_DIGITAL_THREAD_CREATED || D8_INFERRED_LINEAGE_ALLOWED || SECOND_D8_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(CURRENT_D8_RECORD_EQUALS_VALIDATED || STALE_D8_RECORD_EQUALS_INVALID || SUPERSEDED_D8_RECORD_EQUALS_INVALID).toBe(false);
    expect(D8_R1_FINGERPRINT_VERIFICATION_IMPLEMENTED && D8_R1_HISTORY_PRESERVED && D8_R1_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R1_REPLAY_PROTECTION_IMPLEMENTED && D8_R1_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D8_R1_FINGERPRINT_MISMATCH_AUTO_REPAIRED || D8_R1_FINGERPRINT_MISMATCH_AUTO_REBASELINED || D8_R1_HISTORICAL_REFERENCE_AUTO_REPOINTED || SILENT_D8_R1_MUTATION_ALLOWED).toBe(false);
    expect(D8_R1_UNKNOWN_AUTHORITATIVE_IDENTITY_AUTO_ACCEPTED || D8_R1_FREEFORM_AUTHORITATIVE_IDENTITY_ALLOWED).toBe(false);
    expect([
      D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
      D8_EQUALS_D2_CIVIL_AUTHORITY,
      D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
      D8_EQUALS_D4_MECHANICAL_AUTHORITY,
      D8_EQUALS_D5_PIPING_AUTHORITY,
      D8_EQUALS_D6_PROCESS_AUTHORITY,
      D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
      D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN,
      D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT,
      D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN,
      D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION,
      AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
      ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
      AI_CAN_INVENT_AUTHORITATIVE_D8_IAC_IDENTITY,
      AI_CAN_PROMOTE_UNKNOWN_D8_TYPE_TO_AUTHORITATIVE,
      ADMIN_CAN_BYPASS_D8_AUTHORITATIVE_TYPE_ALLOWLIST,
      PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE,
      MEASUREMENT_POINT_CONTEXT_EQUALS_INSTRUMENT_SELECTION,
      INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION,
      D8_R1_PERFORMS_INSTRUMENT_SIZING,
      D8_R1_PERFORMS_INSTRUMENT_SELECTION,
      D8_R1_PERFORMS_SIGNAL_ENGINEERING,
      D8_R1_PERFORMS_IO_ENGINEERING,
      D8_R1_PERFORMS_CONTROL_LOOP_ENGINEERING,
      D8_R1_PERFORMS_CONTROL_SYSTEM_DESIGN,
      D8_R1_PERFORMS_ALARM_RATIONALIZATION,
      D8_R1_PERFORMS_INTERLOCK_LOGIC_DESIGN,
      D8_R1_PERFORMS_SHUTDOWN_LOGIC_DESIGN,
      D8_R1_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING,
    ]).toEqual(Array.from({ length: 29 }, () => false));
    expect(D1_STRUCTURAL_PACK_COMPLETE || D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED || D6_REOPENED || D7_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE && D6_TRACK_COMPLETE && D7_TRACK_COMPLETE).toBe(true);
    expect(D6_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D7_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R1_STATUS).toBe("INSTRUMENTATION_CONTROL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED");
    expect(D8_R1_MATURITY).toBe(D8_R1_STATUS);
    expect(D8_R1_CANONICAL_NEXT_PHASE).toBe("EOS-D8-R2-PROCESS-MEASUREMENT-AND-TAG-CONTEXT");
    expect(D8_R1_NEXT_PHASE_TYPE).toBe("PROCESS_MEASUREMENT_AND_TAG_CONTEXT");
    expect(D8_R1_CANONICAL_NEXT_PHASE_SCOPE).toMatch(/process measurement point/);

    const store = createD8R1Store();
    const who = actor();
    const context = recordIacContext(store, who, contextInput());
    const created = recordIacObjectIdentity(store, who, objectInput({ displayName: "Pressure transmitter identity", projectTag: "PT-101" }));
    expect(created.engineeringValidated).toBe(false);
    expect(created.conformant).toBe(false);
    expect(created.approved).toBe(false);
    expect(created.certified).toBe(false);
    expect(created.processMeasurementContextEstablished).toBe(false);
    expect(created.instrumentDeviceContextEstablished).toBe(false);
    expect(created.signalIoContextEstablished).toBe(false);
    expect(created.controlLoopContextEstablished).toBe(false);
    expect(created.controlSystemContextEstablished).toBe(false);
    expect(created.safetyContextEstablished).toBe(false);
    expect(created.currentness).toBe("CURRENT");
    expect(created.citedLifecycleStage).toBe("FEED");
    expect(created.applicability).toBe("project-a identity scope");
    expect(created.limitations).toMatch(/identity only/);
    const replay = recordIacObjectIdentity(store, who, { ...objectInput({ displayName: "Pressure transmitter identity", projectTag: "PT-101" }), assertedFingerprint: created.fingerprint });
    expect(replay).toBe(created);
    expect(store.history.filter((row) => row.subjectId === created.objectId && row.action === "CREATED")).toHaveLength(1);

    const revised = recordIacObjectIdentity(store, who, objectInput({
      objectId: "pt-101-r2",
      predecessorObjectId: created.objectId,
      provenanceRef: "prov-pt-101-r2",
      sourceBasisRef: "basis-pt-101-identity-r2",
      displayName: "Pressure transmitter identity",
      projectTag: "PT-101",
    }));
    const historical = reconstructIacObject(store, created.objectId);
    expect(historical.objectId).toBe(created.objectId);
    expect(historical.fingerprint).toBe(created.fingerprint);
    expect(historical.currentness).toBe("SUPERSEDED");
    expect(historical.recordStatus).toBe("SUPERSEDED");
    expect(revised.predecessorObjectId).toBe(created.objectId);
    expect(revised.engineeringValidated).toBe(false);

    expect(() => recordIacObjectIdentity(store, who, objectInput({ objectType: "TRANSMITTER" }))).toThrow(/OBJECT_TYPE_NOT_ALLOWLISTED/);
    expect(() => recordIacObjectIdentity(store, who, objectInput({ objectId: "mp-1", objectType: "IAC_MEASUREMENT_POINT", provenanceRef: "prov-mp", sourceBasisRef: "basis-mp", processMeasurementContext: true }))).toThrow(/PROCESS_MEASUREMENT_NOT_IN_R1/);
    expect(() => recordIacObjectIdentity(store, who, objectInput({ objectId: "sig-1", objectType: "IAC_SIGNAL", provenanceRef: "prov-sig", sourceBasisRef: "basis-sig", signalEngineering: true }))).toThrow(/SIGNAL_IO_NOT_IN_R1/);
    expect(() => recordIacObjectIdentity(store, who, objectInput({ objectId: "loop-1", objectType: "IAC_CONTROL_LOOP", provenanceRef: "prov-loop", sourceBasisRef: "basis-loop", controlLoopEngineering: true }))).toThrow(/CONTROL_LOOP_NOT_IN_R1/);
    expect(() => recordIacObjectIdentity(store, who, objectInput({ objectId: "sys-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", provenanceRef: "prov-sys", sourceBasisRef: "basis-sys", controlSystemDesign: true }))).toThrow(/CONTROL_SYSTEM_NOT_IN_R1/);
    expect(() => recordIacObjectIdentity(store, who, objectInput({ objectId: "sif-1", objectType: "IAC_FUNCTIONAL_SAFETY_CONTEXT", provenanceRef: "prov-sif", sourceBasisRef: "basis-sif", functionalSafety: true }))).toThrow(/SAFETY_CONTEXT_NOT_IN_R1/);
    expect(() => recordIacObjectIdentity(store, who, objectInput({ assertedFingerprint: "spoofed" }))).toThrow(/FINGERPRINT_MISMATCH/);
    expect(reconstructIacObject(store, created.objectId).fingerprint).toBe(created.fingerprint);
    expect(() => recordIacObjectIdentity(store, who, objectInput({ objectId: "latest", provenanceRef: "prov-float", sourceBasisRef: "basis-float" }))).toThrow(/OBJECT_IDENTITY_REQUIRED/);
    expect(() => recordIacObjectIdentity(store, actor({ tenantId: "tenant-b" }), objectInput({ objectId: "other", provenanceRef: "prov-other", sourceBasisRef: "basis-other" }))).toThrow(/CROSS_SCOPE_OPERATION/);
    expect(() => recordIacObjectIdentity(store, actor({ authority: "AI_ASSISTANT" }), objectInput())).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordIacObjectIdentity(store, actor({ authority: "ADMIN" }), objectInput())).toThrow(/ADMIN_NOT_IAC_AUTHORITY/);
    expect(() => recordIacObjectIdentity(store, who, objectInput({ objectId: "rel-1", provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", relationships: [{ kind: "tag_similarity", targetObjectId: revised.objectId }] }))).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordIacContext(store, who, contextInput({ provenanceRef: "", sourceBasisRef: "" }))).toThrow(/MISSING_PROVENANCE/);
    expect(() => recordIacContext(store, who, contextInput({ contextId: "ctx-blank", provenanceRef: "prov-blank", applicability: "", limitations: "bounded" }))).toThrow(/MISSING_APPLICABILITY/);
    expect(() => recordIacObjectIdentity(store, who, objectInput({ objectId: "adv", provenanceRef: "prov-adv", sourceBasisRef: "basis-adv", advanceMaturity: true }))).toThrow(/MATURITY_PROGRESSION_NOT_IN_R1/);
    expect(() => recordIacProcessMeasurement()).toThrow(/PROCESS_MEASUREMENT_NOT_IN_R1/);
    expect(() => recordIacInstrumentDeviceContext()).toThrow(/INSTRUMENT_DEVICE_NOT_IN_R1/);
    expect(() => recordIacSignalIoContext()).toThrow(/SIGNAL_IO_NOT_IN_R1/);
    expect(() => recordIacControlLoopContext()).toThrow(/CONTROL_LOOP_NOT_IN_R1/);
    expect(() => recordIacControlSystemContext()).toThrow(/CONTROL_SYSTEM_NOT_IN_R1/);
    expect(() => recordIacSafetyContext()).toThrow(/SAFETY_CONTEXT_NOT_IN_R1/);
    expect(() => repointIacIdentity()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => repairIacFingerprint()).toThrow(/FINGERPRINT_REPAIR_REJECTED/);
    expect(() => advanceIacMaturity()).toThrow(/MATURITY_PROGRESSION_NOT_IN_R1/);
    expect(context.iacEngineeringAuthority).toBe(false);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R1.INSTRUMENTATION_CONTROL_IDENTITY_AND_OBJECT_FOUNDATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R2.PROCESS_MEASUREMENT_AND_TAG_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "identity-foundation.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "identity-foundation.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
