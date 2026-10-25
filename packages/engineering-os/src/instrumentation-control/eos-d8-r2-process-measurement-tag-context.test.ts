import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D8_CANONICAL_MILESTONE_COUNT,
  D8_MEASUREMENT_CONTEXT_RUNTIME_COUNT,
  D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D8_CONTEXT_AUTHORITY, createD8R1Store, recordIacContext, recordIacObjectIdentity, type D8R1Actor } from "./identity-foundation";
import {
  ADMIN_CAN_PROMOTE_UNGOVERNED_D8_R2_CONTEXT_TO_ENGINEERING_TRUTH,
  AI_CAN_INVENT_AUTHORITATIVE_D8_MEASUREMENT_POINT,
  AI_CAN_INVENT_AUTHORITATIVE_D8_MEASUREMENT_REQUIREMENT,
  AI_CAN_INVENT_AUTHORITATIVE_D8_PROCESS_VALUE,
  AI_CAN_INVENT_AUTHORITATIVE_D8_TAG_RELATIONSHIP,
  AI_CAN_PROMOTE_D8_MEASUREMENT_CONTEXT_TO_VALIDATED_DESIGN,
  AI_CAN_SILENTLY_CHANGE_D8_R2_UNITS,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D8_MEASUREMENT_CONTEXT_AUTO_ACCEPTED,
  CROSS_TENANT_D8_R2_ACCESS_ALLOWED,
  D6_PROCESS_CONDITION_EQUALS_D8_MEASUREMENT_RESULT,
  D6_PROCESS_CONDITION_EQUALS_VALIDATED_D8_INSTRUMENT_RANGE,
  D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_INSTRUMENT_SELECTION,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_D6_RUNTIME_INTEGRATION_COUNT,
  D8_D7_RUNTIME_INTEGRATION_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_MEASUREMENT_OBJECT_RELATIONSHIP_REQUIRED,
  D8_EXPLICIT_TAG_RELATIONSHIP_REQUIRED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_IAC_TAG_CONTEXT_IMPLEMENTED,
  D8_INFERRED_MEASUREMENT_OBJECT_RELATIONSHIP_ALLOWED,
  D8_INFERRED_TAG_RELATIONSHIP_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_MEASUREMENT_REQUIREMENT_CONTEXT_SUPPORTED,
  D8_PROCESS_MEASUREMENT_CONTEXT_IMPLEMENTED,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_IMPLEMENTED,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_PROCESS_VARIABLE_TYPE_CONTEXT_SUPPORTED,
  D8_R1_IDENTITY_REUSED,
  D8_R1_RUNTIME_COUNT,
  D8_R2_AUTO_CREATES_INSTRUMENT_DEVICE_CONTEXT,
  D8_R2_AUTO_MUTATES_R1_IDENTITY,
  D8_R2_CAN_REFERENCE_D6_PROCESS_CONDITION,
  D8_R2_CAN_REFERENCE_D6_PROCESS_REQUIREMENT,
  D8_R2_CANONICAL_NEXT_PHASE,
  D8_R2_CANONICAL_NEXT_PHASE_SCOPE,
  D8_R2_D6_SOURCE_AUTO_REPOINTED,
  D8_R2_DERIVES_INSTRUMENT_RANGE,
  D8_R2_DERIVES_PROCESS_VALUE,
  D8_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R2_ESTIMATES_PROCESS_VALUE,
  D8_R2_HISTORY_PRESERVED,
  D8_R2_IDENTITY_REFERENCE_AUTO_REPOINTED,
  D8_R2_NEXT_PHASE_TYPE,
  D8_R2_PERFORMS_ALARM_RATIONALIZATION,
  D8_R2_PERFORMS_CONTROL_LOOP_ENGINEERING,
  D8_R2_PERFORMS_CONTROL_SYSTEM_DESIGN,
  D8_R2_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING,
  D8_R2_PERFORMS_INSTRUMENT_SELECTION,
  D8_R2_PERFORMS_INSTRUMENT_SIZING,
  D8_R2_PERFORMS_INTERLOCK_LOGIC_DESIGN,
  D8_R2_PERFORMS_IO_ENGINEERING,
  D8_R2_PERFORMS_SHUTDOWN_LOGIC_DESIGN,
  D8_R2_PERFORMS_SIGNAL_ENGINEERING,
  D8_R2_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R2_SELECTS_INSTRUMENT_RANGE,
  D8_R2_SOURCE_BASIS_REQUIRED,
  D8_R2_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R2_STATUS,
  D8_R2_UNITS_PRESERVED,
  D8_R2_UNITS_REQUIRED,
  D8_R3_STARTED,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D6_PROCESS_SOURCE_REVISION_REQUIRED,
  EXACT_D8_MEASUREMENT_OBJECT_ENDPOINT_REVISION_REQUIRED,
  EXACT_D8_R1_IDENTITY_REVISION_REQUIRED,
  EXACT_D8_TAG_RELATIONSHIP_ENDPOINT_REVISION_REQUIRED,
  FLOATING_D6_PROCESS_SOURCE_REFERENCE_ALLOWED,
  FLOATING_D8_R2_IDENTITY_REFERENCE_ALLOWED,
  IAC_TAG_CONTEXT_EQUALS_VALIDATED_IAC_DESIGN,
  IAC_TAG_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  MEASUREMENT_POINT_RELATIONSHIP_EQUALS_INSTRUMENT_SELECTION,
  MEASUREMENT_REQUIREMENT_AUTO_SELECTS_INSTRUMENT,
  MEASUREMENT_REQUIREMENT_EQUALS_INSTRUMENT_SELECTION,
  NEW_DEPENDENCY_ADDED,
  PROCESS_MEASUREMENT_CONTEXT_EQUALS_PROCESS_CALCULATION,
  PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN,
  PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE,
  SILENT_D8_R2_MUTATION_ALLOWED,
  createD8R2Store,
  deriveIacInstrumentRange,
  deriveIacProcessValue,
  mutateIacIdentity,
  recordIacInstrumentDeviceContext,
  recordIacSignalIoContext,
  recordIacTagContext,
  recordIacTagRelationship,
  recordMeasurementObjectRelationship,
  recordMeasurementRequirementContext,
  recordProcessMeasurementContext,
  selectIacInstrument,
  sizeIacInstrument,
} from "./process-measurement-tag-context";

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

describe("EOS-D8-R2 process measurement and tag context", () => {
  it("records measurement and tag context without fabricating process or instrument truth", () => {
    expect(D8_R1_IDENTITY_REUSED && EXACT_D8_R1_IDENTITY_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D8_R2_IDENTITY_REFERENCE_ALLOWED || D8_R2_IDENTITY_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(2);
    expect(D8_R1_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D8_MEASUREMENT_CONTEXT_RUNTIME_COUNT).toBe(0);
    expect(D8_PROCESS_MEASUREMENT_TAG_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT).toBe(1);
    expect(D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY).toBe(true);
    expect(D8_CANONICAL_OBJECT_TAXONOMY_REUSED && D8_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED).toBe(true);
    expect(D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED).toBe(false);
    expect(D8_PROCESS_MEASUREMENT_CONTEXT_IMPLEMENTED && D8_MEASUREMENT_REQUIREMENT_CONTEXT_SUPPORTED && D8_PROCESS_VARIABLE_TYPE_CONTEXT_SUPPORTED && D8_IAC_TAG_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_PROCESS_VALUE || PROCESS_MEASUREMENT_CONTEXT_EQUALS_PROCESS_CALCULATION || PROCESS_MEASUREMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN).toBe(false);
    expect(MEASUREMENT_REQUIREMENT_EQUALS_INSTRUMENT_SELECTION || MEASUREMENT_REQUIREMENT_AUTO_SELECTS_INSTRUMENT || D8_R2_DERIVES_PROCESS_VALUE || D8_R2_ESTIMATES_PROCESS_VALUE).toBe(false);
    expect(IAC_TAG_CONTEXT_EQUALS_VALIDATED_IAC_DESIGN || IAC_TAG_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D8_EXPLICIT_TAG_RELATIONSHIP_REQUIRED && EXACT_D8_TAG_RELATIONSHIP_ENDPOINT_REVISION_REQUIRED && D8_EXPLICIT_MEASUREMENT_OBJECT_RELATIONSHIP_REQUIRED && EXACT_D8_MEASUREMENT_OBJECT_ENDPOINT_REVISION_REQUIRED).toBe(true);
    expect(D8_INFERRED_TAG_RELATIONSHIP_ALLOWED || D8_INFERRED_MEASUREMENT_OBJECT_RELATIONSHIP_ALLOWED || MEASUREMENT_POINT_RELATIONSHIP_EQUALS_INSTRUMENT_SELECTION).toBe(false);
    expect(EXACT_D6_PROCESS_SOURCE_REVISION_REQUIRED && D8_R2_CAN_REFERENCE_D6_PROCESS_REQUIREMENT && D8_R2_CAN_REFERENCE_D6_PROCESS_CONDITION).toBe(true);
    expect(FLOATING_D6_PROCESS_SOURCE_REFERENCE_ALLOWED || D8_R2_D6_SOURCE_AUTO_REPOINTED || D6_PROCESS_REQUIREMENT_EQUALS_D8_IAC_DESIGN || D6_PROCESS_REQUIREMENT_EQUALS_D8_INSTRUMENT_SELECTION || D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT).toBe(false);
    expect(D6_PROCESS_CONDITION_EQUALS_D8_MEASUREMENT_RESULT || D6_PROCESS_CONDITION_EQUALS_VALIDATED_D8_INSTRUMENT_RANGE).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D8_PROCESS_VALUE || AI_CAN_INVENT_AUTHORITATIVE_D8_MEASUREMENT_REQUIREMENT || AI_CAN_SILENTLY_CHANGE_D8_R2_UNITS).toBe(false);
    expect(D8_R2_UNITS_REQUIRED && D8_R2_UNITS_PRESERVED && D8_R2_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D8_MEASUREMENT_CONTEXT_AUTO_ACCEPTED || CROSS_TENANT_D8_R2_ACCESS_ALLOWED).toBe(false);
    expect(D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT && D8_R2_HISTORY_PRESERVED).toBe(true);
    expect(SILENT_D8_R2_MUTATION_ALLOWED || D8_R2_AUTO_MUTATES_R1_IDENTITY).toBe(false);
    expect(D8_EQUALS_D6_PROCESS_AUTHORITY || D8_EQUALS_D7_ELECTRICAL_AUTHORITY || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D8_MEASUREMENT_POINT || AI_CAN_INVENT_AUTHORITATIVE_D8_TAG_RELATIONSHIP || AI_CAN_PROMOTE_D8_MEASUREMENT_CONTEXT_TO_VALIDATED_DESIGN || ADMIN_CAN_PROMOTE_UNGOVERNED_D8_R2_CONTEXT_TO_ENGINEERING_TRUTH).toBe(false);
    expect([
      D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
      D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
      D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
      D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
      D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
      D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
      D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
      D8_SIL_CALCULATION_RUNTIME_COUNT,
      D8_SIL_VERIFICATION_RUNTIME_COUNT,
      D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
      D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
      D8_ACTUATOR_SIZING_RUNTIME_COUNT,
      D8_D6_RUNTIME_INTEGRATION_COUNT,
      D8_D7_RUNTIME_INTEGRATION_COUNT,
      D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D8_D9_RUNTIME_INTEGRATION_COUNT,
      D8_APPROVAL_RUNTIME_COUNT,
      D8_CERTIFICATION_RUNTIME_COUNT,
      D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
      D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
      D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array.from({ length: 22 }, () => 0));
    expect(D8_R2_PERFORMS_INSTRUMENT_SELECTION || D8_R2_PERFORMS_INSTRUMENT_SIZING || D8_R2_SELECTS_INSTRUMENT_RANGE || D8_R2_DERIVES_INSTRUMENT_RANGE || D8_R2_AUTO_CREATES_INSTRUMENT_DEVICE_CONTEXT).toBe(false);
    expect(D8_R2_PERFORMS_SIGNAL_ENGINEERING || D8_R2_PERFORMS_IO_ENGINEERING || D8_R2_PERFORMS_CONTROL_LOOP_ENGINEERING || D8_R2_PERFORMS_CONTROL_SYSTEM_DESIGN).toBe(false);
    expect(D8_R2_PERFORMS_ALARM_RATIONALIZATION || D8_R2_PERFORMS_INTERLOCK_LOGIC_DESIGN || D8_R2_PERFORMS_SHUTDOWN_LOGIC_DESIGN || D8_R2_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING).toBe(false);
    expect(D9_RUNTIME_STARTED || D8_R3_STARTED || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D8_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R2_REPLAY_PROTECTION_IMPLEMENTED && D8_R2_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R2_STATUS).toBe("PROCESS_MEASUREMENT_AND_TAG_CONTEXT_IMPLEMENTED");
    expect(D8_R2_CANONICAL_NEXT_PHASE).toBe("EOS-D8-R3-INSTRUMENT-AND-DEVICE-CONTEXT");
    expect(D8_R2_NEXT_PHASE_TYPE).toBe("INSTRUMENT_AND_DEVICE_CONTEXT");
    expect(D8_R2_CANONICAL_NEXT_PHASE_SCOPE).toMatch(/instrument and device context/);

    const r1 = createD8R1Store();
    const who = actor();
    recordIacContext(r1, who, {
      contextId: "ctx-1",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-ctx-1",
      sourceBasisRef: "basis-iac-identity",
      applicability: "project-a identity scope",
      limitations: "identity only",
    });
    const point = recordIacObjectIdentity(r1, who, {
      objectId: "mp-101",
      contextId: "ctx-1",
      objectType: "IAC_MEASUREMENT_POINT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-mp-101",
      sourceBasisRef: "basis-mp-101",
      applicability: "project-a identity scope",
      limitations: "identity only",
    });
    const instrument = recordIacObjectIdentity(r1, who, {
      objectId: "pt-101",
      contextId: "ctx-1",
      objectType: "IAC_INSTRUMENT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-pt-101",
      sourceBasisRef: "basis-pt-101",
      applicability: "project-a identity scope",
      limitations: "identity only",
      projectTag: "PT-101",
    });
    const before = JSON.stringify({ objects: r1.objects, history: r1.history });
    const store = createD8R2Store(r1);
    const bound = {
      contextId: "ctx-1",
      objectId: point.objectId,
      objectRevisionFingerprint: point.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-measure-1",
      sourceBasisRef: "basis-measure-1",
      applicability: "mp-101 measurement context",
      limitations: "context only; no process value or instrument selection",
    };
    const measured = recordProcessMeasurementContext(store, who, {
      ...bound,
      measurementRecordId: "meas-1",
      measurementPurpose: "PROCESS_MONITORING",
      processVariableType: "PRESSURE",
      locationReference: "line-explicit-12",
      d6SourceId: "d6-cond-1",
      d6SourceRevisionFingerprint: "d6-cond-rev-1",
      d6Subject: "PROCESS_MEASUREMENT_REQUIREMENT",
      suppliedConditionValue: "1200",
      suppliedConditionUnit: "kPa",
    });
    expect(measured.validatedProcessValue).toBe(false);
    expect(measured.processCalculation).toBe(false);
    expect(measured.instrumentSelection).toBe(false);
    expect(measured.measuredResult).toBe(false);
    expect(measured.validatedInstrumentRange).toBe(false);
    expect(measured.suppliedConditionUnit).toBe("kPa");
    expect(measured.suppliedConditionValue).toBe("1200");
    expect(measured.objectRevisionFingerprint).toBe(point.fingerprint);
    const replay = recordProcessMeasurementContext(store, who, {
      ...bound,
      measurementRecordId: "meas-1",
      measurementPurpose: "PROCESS_MONITORING",
      processVariableType: "PRESSURE",
      locationReference: "line-explicit-12",
      d6SourceId: "d6-cond-1",
      d6SourceRevisionFingerprint: "d6-cond-rev-1",
      d6Subject: "PROCESS_MEASUREMENT_REQUIREMENT",
      suppliedConditionValue: "1200",
      suppliedConditionUnit: "kPa",
      assertedFingerprint: measured.fingerprint,
    });
    expect(replay).toBe(measured);
    const requirement = recordMeasurementRequirementContext(store, who, {
      ...bound,
      requirementRecordId: "req-1",
      measurementRecordId: measured.measurementRecordId,
      requirementText: "measure line pressure",
      d6SourceId: "d6-req-1",
      d6SourceRevisionFingerprint: "d6-req-rev-1",
      d6Subject: "PROCESS_MEASUREMENT_REQUIREMENT",
      provenanceRef: "prov-req-1",
      sourceBasisRef: "basis-req-1",
    });
    expect(requirement.instrumentSelected).toBe(false);
    expect(requirement.validatedInstrumentDesign).toBe(false);
    expect(requirement.d6SourceRevisionFingerprint).toBe("d6-req-rev-1");
    const tag = recordIacTagContext(store, who, {
      ...bound,
      objectId: instrument.objectId,
      objectRevisionFingerprint: instrument.fingerprint,
      applicability: "pt-101 tag context",
      tagRecordId: "tag-1",
      tagToken: "PT-101",
      provenanceRef: "prov-tag-1",
      sourceBasisRef: "basis-tag-1",
    });
    expect(tag.validatedIacDesign).toBe(false);
    expect(tag.engineeringValidated).toBe(false);
    const tagLink = recordIacTagRelationship(store, who, {
      relationshipId: "tag-rel-1",
      tagRecordId: tag.tagRecordId,
      tagRevisionFingerprint: tag.fingerprint,
      objectId: instrument.objectId,
      objectRevisionFingerprint: instrument.fingerprint,
      kind: "TAG_TO_OBJECT",
      provenanceRef: "prov-tag-rel-1",
      sourceBasisRef: "basis-tag-rel-1",
      applicability: "pt-101 explicit tag link",
      limitations: "explicit endpoint only",
    });
    expect(tagLink.inferred).toBe(false);
    expect(tagLink.objectRevisionFingerprint).toBe(instrument.fingerprint);
    const link = recordMeasurementObjectRelationship(store, who, {
      relationshipId: "meas-rel-1",
      measurementRecordId: measured.measurementRecordId,
      measurementRevisionFingerprint: measured.fingerprint,
      fromObjectId: point.objectId,
      fromObjectRevisionFingerprint: point.fingerprint,
      toObjectId: instrument.objectId,
      toObjectRevisionFingerprint: instrument.fingerprint,
      kind: "MEASUREMENT_POINT_TO_OBJECT",
      provenanceRef: "prov-meas-rel-1",
      sourceBasisRef: "basis-meas-rel-1",
      applicability: "mp-101 to pt-101 explicit",
      limitations: "not instrument selection",
    });
    expect(link.instrumentSelection).toBe(false);
    expect(link.fromObjectRevisionFingerprint).toBe(point.fingerprint);
    expect(JSON.stringify({ objects: r1.objects, history: r1.history })).toBe(before);

    expect(() => recordProcessMeasurementContext(store, who, { ...bound, measurementRecordId: "meas-float", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordProcessMeasurementContext(store, who, { ...bound, measurementRecordId: "meas-unit", measurementPurpose: "PROCESS_MONITORING", processVariableType: "FLOW", locationReference: "line-explicit-12", suppliedConditionValue: "10" })).toThrow(/MISSING_UNIT/);
    expect(() => recordProcessMeasurementContext(store, who, { ...bound, measurementRecordId: "meas-d6", measurementPurpose: "PROCESS_MONITORING", processVariableType: "LEVEL", locationReference: "line-explicit-12", suppliedConditionValue: "10", suppliedConditionUnit: "m", d6SourceRevisionFingerprint: "latest", d6SourceId: "d6-x", d6Subject: "PROCESS_MEASUREMENT_REQUIREMENT" })).toThrow(/D6_SOURCE_REVISION_REQUIRED/);
    expect(() => recordProcessMeasurementContext(store, who, { ...bound, measurementRecordId: "meas-value", measurementPurpose: "PROCESS_MONITORING", processVariableType: "TEMPERATURE", locationReference: "line-explicit-12", processValue: true })).toThrow(/PROCESS_VALUE_NOT_IN_R2/);
    expect(() => recordProcessMeasurementContext(store, who, { ...bound, measurementRecordId: "meas-select", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", instrumentSelection: true })).toThrow(/INSTRUMENT_SELECTION_NOT_IN_R2/);
    expect(() => recordProcessMeasurementContext(store, who, { ...bound, measurementRecordId: "meas-range", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", rangeDerivation: true })).toThrow(/INSTRUMENT_RANGE_NOT_IN_R2/);
    expect(() => recordProcessMeasurementContext(store, who, { ...bound, measurementRecordId: "meas-var", measurementPurpose: "PROCESS_MONITORING", processVariableType: "DENSITY", locationReference: "line-explicit-12" })).toThrow(/PROCESS_VARIABLE_NOT_ALLOWLISTED/);
    expect(() => recordMeasurementRequirementContext(store, who, { ...bound, requirementRecordId: "req-float", measurementRecordId: measured.measurementRecordId, requirementText: "measure line pressure", d6SourceId: "d6-req-1", d6SourceRevisionFingerprint: "latest", d6Subject: "PROCESS_MEASUREMENT_REQUIREMENT" })).toThrow(/D6_SOURCE_REVISION_REQUIRED/);
    expect(() => recordIacTagRelationship(store, who, { relationshipId: "tag-rel-bad", tagRecordId: tag.tagRecordId, tagRevisionFingerprint: tag.fingerprint, objectId: instrument.objectId, objectRevisionFingerprint: instrument.fingerprint, kind: "tag_prefix", provenanceRef: "prov-bad", sourceBasisRef: "basis-bad", applicability: "pt-101 explicit tag link", limitations: "explicit endpoint only" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordMeasurementObjectRelationship(store, who, { relationshipId: "meas-rel-bad", measurementRecordId: measured.measurementRecordId, measurementRevisionFingerprint: measured.fingerprint, fromObjectId: point.objectId, fromObjectRevisionFingerprint: point.fingerprint, toObjectId: instrument.objectId, toObjectRevisionFingerprint: "spoofed", kind: "MEASUREMENT_POINT_TO_OBJECT", provenanceRef: "prov-bad", sourceBasisRef: "basis-bad", applicability: "mp-101 to pt-101 explicit", limitations: "not instrument selection" })).toThrow(/R1_REVISION_MISMATCH/);
    expect(() => recordProcessMeasurementContext(store, actor({ tenantId: "tenant-b" }), { ...bound, measurementRecordId: "meas-other", measurementPurpose: "ACCOUNTING", processVariableType: "FLOW", locationReference: "other-line" })).toThrow(/CROSS_SCOPE_OPERATION/);
    expect(() => recordProcessMeasurementContext(store, actor({ authority: "AI_ASSISTANT" }), { ...bound, measurementRecordId: "meas-ai", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12" })).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordIacTagContext(store, actor({ authority: "ADMIN" }), { ...bound, objectId: instrument.objectId, objectRevisionFingerprint: instrument.fingerprint, applicability: "pt-101 tag context", tagRecordId: "tag-admin", tagToken: "PT-101" })).toThrow(/ADMIN_NOT_IAC_AUTHORITY/);
    expect(() => recordProcessMeasurementContext(store, who, { ...bound, measurementRecordId: "meas-1", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", suppliedConditionUnit: "bar", suppliedConditionValue: "12", d6SourceId: "d6-cond-1", d6SourceRevisionFingerprint: "d6-cond-rev-1", d6Subject: "PROCESS_MEASUREMENT_REQUIREMENT", assertedFingerprint: measured.fingerprint })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(store.measurements[0].suppliedConditionUnit).toBe("kPa");
    expect(store.measurements[0].fingerprint).toBe(measured.fingerprint);
    expect(() => selectIacInstrument()).toThrow(/INSTRUMENT_SELECTION_NOT_IN_R2/);
    expect(() => sizeIacInstrument()).toThrow(/INSTRUMENT_SIZING_NOT_IN_R2/);
    expect(() => deriveIacInstrumentRange()).toThrow(/INSTRUMENT_RANGE_NOT_IN_R2/);
    expect(() => deriveIacProcessValue()).toThrow(/PROCESS_VALUE_NOT_IN_R2/);
    expect(() => recordIacInstrumentDeviceContext()).toThrow(/INSTRUMENT_DEVICE_NOT_IN_R2/);
    expect(() => recordIacSignalIoContext()).toThrow(/SIGNAL_IO_NOT_IN_R2/);
    expect(() => mutateIacIdentity()).toThrow(/R1_MUTATION_REJECTED/);
    const revisedPoint = recordIacObjectIdentity(r1, who, {
      objectId: "mp-101-r2",
      contextId: "ctx-1",
      objectType: "IAC_MEASUREMENT_POINT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-mp-101-r2",
      sourceBasisRef: "basis-mp-101-r2",
      applicability: "project-a identity scope",
      limitations: "identity only",
      predecessorObjectId: point.objectId,
    });
    expect(store.measurements[0].objectRevisionFingerprint).toBe(point.fingerprint);
    expect(store.measurements[0].objectId).toBe(point.objectId);
    expect(revisedPoint.predecessorObjectId).toBe(point.objectId);
    expect(point.fingerprint).toBe(store.measurements[0].objectRevisionFingerprint);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R2.PROCESS_MEASUREMENT_AND_TAG_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R3.INSTRUMENT_AND_DEVICE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "process-measurement-tag-context.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "process-measurement-tag-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
