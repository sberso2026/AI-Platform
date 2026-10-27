import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D8_CANONICAL_MILESTONE_COUNT, D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT as ARCHITECTURE_DEVICE_COUNT, D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D8_CONTEXT_AUTHORITY, createD8R1Store, recordIacContext, recordIacObjectIdentity, type D8R1Actor } from "./identity-foundation";
import { createD8R2Store, recordIacTagContext, recordProcessMeasurementContext } from "./process-measurement-tag-context";
import {
  AI_CAN_INVENT_AUTHORITATIVE_D8_DEVICE_ATTRIBUTE,
  AI_CAN_INVENT_AUTHORITATIVE_D8_RANGE,
  AI_CAN_INVENT_AUTHORITATIVE_D8_SETPOINT,
  AI_CAN_PROMOTE_D8_DEVICE_CONTEXT_TO_VALIDATED_SELECTION,
  AI_CAN_SILENTLY_CHANGE_D8_R3_UNITS,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D8_DEVICE_CONTEXT_AUTO_ACCEPTED,
  CROSS_TENANT_D8_R3_ACCESS_ALLOWED,
  D4_MECHANICAL_EQUIPMENT_CONTEXT_EQUALS_D8_INSTRUMENT_SELECTION,
  D4_PACKAGE_CONTEXT_EQUALS_VALIDATED_D8_DEVICE_DESIGN,
  D5_PIPING_CONTEXT_EQUALS_D8_INSTRUMENT_SELECTION,
  D6_PROCESS_CONDITION_EQUALS_VALIDATED_INSTRUMENT_RANGE,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_INSTRUMENT_SELECTION,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EXPLICIT_DEVICE_MEASUREMENT_RELATIONSHIP_REQUIRED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_INFERRED_DEVICE_MEASUREMENT_RELATIONSHIP_ALLOWED,
  D8_INSTRUMENT_CONTEXT_EQUALS_VALIDATED_D5_PIPING_DESIGN,
  D8_INSTRUMENT_DATASHEET_CONTEXT_SUPPORTED,
  D8_INSTRUMENT_DEVICE_CONTEXT_IMPLEMENTED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_IMPLEMENTED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SERVICE_CONTEXT_SUPPORTED,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_R1_IDENTITY_REUSED,
  D8_R2_PROCESS_MEASUREMENT_TAG_CONTEXT_REUSED,
  D8_R2_RUNTIME_COUNT,
  D8_R3_AUTO_MUTATES_R1_IDENTITY,
  D8_R3_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT,
  D8_R3_CALCULATES_INSTRUMENT_RANGE,
  D8_R3_CALCULATES_SETPOINT,
  D8_R3_CAN_REFERENCE_D4_MECHANICAL_CONTEXT,
  D8_R3_CAN_REFERENCE_D5_PIPING_CONTEXT,
  D8_R3_CANONICAL_NEXT_PHASE,
  D8_R3_CANONICAL_NEXT_PHASE_SCOPE,
  D8_R3_DERIVES_INSTRUMENT_RANGE,
  D8_R3_DERIVES_MISSING_DEVICE_ATTRIBUTE,
  D8_R3_DERIVES_SETPOINT,
  D8_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R3_ESTIMATES_MISSING_DEVICE_ATTRIBUTE,
  D8_R3_HAZARDOUS_AREA_DEVICE_CONTEXT_SUPPORTED,
  D8_R3_HISTORY_PRESERVED,
  D8_R3_NEXT_PHASE_TYPE,
  D8_R3_PERFORMS_ACTUATOR_SIZING,
  D8_R3_PERFORMS_CONTROL_LOOP_ENGINEERING,
  D8_R3_PERFORMS_CONTROL_SYSTEM_DESIGN,
  D8_R3_PERFORMS_CONTROL_VALVE_SIZING,
  D8_R3_PERFORMS_DEVICE_PERFORMANCE_CALCULATION,
  D8_R3_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING,
  D8_R3_PERFORMS_INSTRUMENT_SELECTION,
  D8_R3_PERFORMS_INSTRUMENT_SIZING,
  D8_R3_PERFORMS_SIGNAL_ENGINEERING,
  D8_R3_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R3_SOURCE_AUTO_REPOINTED,
  D8_R3_SOURCE_BASIS_REQUIRED,
  D8_R3_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R3_STATUS,
  D8_R3_UNITS_PRESERVED,
  D8_R3_UNITS_REQUIRED,
  D8_R4_STARTED,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SUPPLIED_DEVICE_CERTIFICATION_CONTEXT_SUPPORTED,
  D8_SUPPLIED_INSTRUMENT_RANGE_CONTEXT_SUPPORTED,
  D8_SUPPLIED_SETPOINT_CONTEXT_SUPPORTED,
  D8_VENDOR_MANUFACTURER_CONTEXT_SUPPORTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DEVICE_CONTEXT_EQUALS_ENGINEERING_VALIDATION,
  EXACT_D4_MECHANICAL_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D5_PIPING_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_PROCESS_SOURCE_REVISION_REQUIRED,
  EXACT_D8_DEVICE_MEASUREMENT_ENDPOINT_REVISION_REQUIRED,
  EXACT_D8_INSTRUMENT_DEVICE_REVISION_REQUIRED,
  EXACT_D8_R1_R2_REFERENCE_REQUIRED,
  EXACT_D8_R2_MEASUREMENT_REVISION_REQUIRED,
  EXACT_D8_R2_TAG_REVISION_REQUIRED_WHEN_REFERENCED,
  FLOATING_D8_INSTRUMENT_DEVICE_REVISION_ALLOWED,
  FLOATING_D8_R3_SOURCE_REFERENCE_ALLOWED,
  HAZARDOUS_AREA_DEVICE_CONTEXT_EQUALS_VALIDATED_HAZARDOUS_AREA_SELECTION,
  HAZARDOUS_AREA_MARKING_EQUALS_CODE_CONFORMANCE,
  INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN,
  INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION,
  INSTRUMENT_DATASHEET_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN,
  INSTRUMENT_DATASHEET_PRESENT_EQUALS_PROJECT_VALIDATION,
  INSTRUMENT_SERVICE_CONTEXT_EQUALS_VALIDATED_DEVICE_SELECTION,
  MEASUREMENT_POINT_RELATIONSHIP_EQUALS_INSTRUMENT_SELECTION,
  NEW_DEPENDENCY_ADDED,
  SILENT_D8_R3_MUTATION_ALLOWED,
  SUPPLIED_DEVICE_CERTIFICATION_EQUALS_D8_CERTIFICATION,
  SUPPLIED_DEVICE_CERTIFICATION_EQUALS_PROJECT_VALIDATION,
  SUPPLIED_INSTRUMENT_RANGE_EQUALS_RANGE_CALCULATED_BY_EOS,
  SUPPLIED_INSTRUMENT_RANGE_EQUALS_VALIDATED_RANGE_SELECTION,
  SUPPLIED_SETPOINT_EQUALS_SETPOINT_CALCULATED_BY_EOS,
  SUPPLIED_SETPOINT_EQUALS_VALIDATED_SETPOINT,
  TAG_RELATIONSHIP_EQUALS_VALIDATED_DEVICE_ASSIGNMENT,
  VENDOR_INSTRUMENT_DATA_EQUALS_PROJECT_VALIDATION,
  VENDOR_SELECTED_DEVICE_EQUALS_PROJECT_VALIDATED_SELECTION,
  calculateIacDevicePerformance,
  createD8R3Store,
  deriveIacInstrumentRange,
  deriveIacSetpoint,
  mutateIacIdentity,
  mutateIacMeasurementContext,
  recordDeviceMeasurementRelationship,
  recordInstrumentDeviceContext,
  selectIacInstrument,
  sizeIacActuator,
  sizeIacControlValve,
  sizeIacInstrument,
} from "./instrument-device-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return { actorId: "iac-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D8_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D8-R3 instrument and device context", () => {
  it("records supplied device context without selecting or sizing the instrument", () => {
    expect(D8_R1_IDENTITY_REUSED && D8_R2_PROCESS_MEASUREMENT_TAG_CONTEXT_REUSED && EXACT_D8_R1_R2_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D8_R3_SOURCE_REFERENCE_ALLOWED || D8_R3_SOURCE_AUTO_REPOINTED || FLOATING_D8_INSTRUMENT_DEVICE_REVISION_ALLOWED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(3);
    expect(D8_R2_RUNTIME_COUNT).toBe(2);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_DEVICE_COUNT).toBe(0);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_IMPLEMENTED && D8_INSTRUMENT_DEVICE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY).toBe(true);
    expect(D8_CANONICAL_OBJECT_TAXONOMY_REUSED).toBe(true);
    expect(D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED).toBe(false);
    expect(EXACT_D8_INSTRUMENT_DEVICE_REVISION_REQUIRED && EXACT_D8_R2_MEASUREMENT_REVISION_REQUIRED && EXACT_D8_R2_TAG_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_SELECTION || INSTRUMENT_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN || DEVICE_CONTEXT_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(D8_EXPLICIT_DEVICE_MEASUREMENT_RELATIONSHIP_REQUIRED && EXACT_D8_DEVICE_MEASUREMENT_ENDPOINT_REVISION_REQUIRED).toBe(true);
    expect(D8_INFERRED_DEVICE_MEASUREMENT_RELATIONSHIP_ALLOWED || MEASUREMENT_POINT_RELATIONSHIP_EQUALS_INSTRUMENT_SELECTION || TAG_RELATIONSHIP_EQUALS_VALIDATED_DEVICE_ASSIGNMENT).toBe(false);
    expect(D8_INSTRUMENT_SERVICE_CONTEXT_SUPPORTED && D8_INSTRUMENT_DATASHEET_CONTEXT_SUPPORTED && D8_VENDOR_MANUFACTURER_CONTEXT_SUPPORTED).toBe(true);
    expect(INSTRUMENT_SERVICE_CONTEXT_EQUALS_VALIDATED_DEVICE_SELECTION || INSTRUMENT_DATASHEET_CONTEXT_EQUALS_VALIDATED_INSTRUMENT_DESIGN || INSTRUMENT_DATASHEET_PRESENT_EQUALS_PROJECT_VALIDATION).toBe(false);
    expect(VENDOR_INSTRUMENT_DATA_EQUALS_PROJECT_VALIDATION || VENDOR_SELECTED_DEVICE_EQUALS_PROJECT_VALIDATED_SELECTION).toBe(false);
    expect(D8_SUPPLIED_INSTRUMENT_RANGE_CONTEXT_SUPPORTED && D8_SUPPLIED_SETPOINT_CONTEXT_SUPPORTED && D8_R3_UNITS_REQUIRED && D8_R3_UNITS_PRESERVED).toBe(true);
    expect(SUPPLIED_INSTRUMENT_RANGE_EQUALS_VALIDATED_RANGE_SELECTION || SUPPLIED_INSTRUMENT_RANGE_EQUALS_RANGE_CALCULATED_BY_EOS || D8_R3_DERIVES_INSTRUMENT_RANGE || D8_R3_CALCULATES_INSTRUMENT_RANGE).toBe(false);
    expect(SUPPLIED_SETPOINT_EQUALS_VALIDATED_SETPOINT || SUPPLIED_SETPOINT_EQUALS_SETPOINT_CALCULATED_BY_EOS || D8_R3_DERIVES_SETPOINT || D8_R3_CALCULATES_SETPOINT).toBe(false);
    expect(AI_CAN_SILENTLY_CHANGE_D8_R3_UNITS || AI_CAN_INVENT_AUTHORITATIVE_D8_DEVICE_ATTRIBUTE || AI_CAN_INVENT_AUTHORITATIVE_D8_RANGE || AI_CAN_INVENT_AUTHORITATIVE_D8_SETPOINT || AI_CAN_PROMOTE_D8_DEVICE_CONTEXT_TO_VALIDATED_SELECTION).toBe(false);
    expect(D8_SUPPLIED_DEVICE_CERTIFICATION_CONTEXT_SUPPORTED && D8_R3_HAZARDOUS_AREA_DEVICE_CONTEXT_SUPPORTED).toBe(true);
    expect(SUPPLIED_DEVICE_CERTIFICATION_EQUALS_PROJECT_VALIDATION || SUPPLIED_DEVICE_CERTIFICATION_EQUALS_D8_CERTIFICATION || HAZARDOUS_AREA_DEVICE_CONTEXT_EQUALS_VALIDATED_HAZARDOUS_AREA_SELECTION || HAZARDOUS_AREA_MARKING_EQUALS_CODE_CONFORMANCE).toBe(false);
    expect(EXACT_D6_PROCESS_SOURCE_REVISION_REQUIRED && D8_R3_CAN_REFERENCE_D4_MECHANICAL_CONTEXT && EXACT_D4_MECHANICAL_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED && D8_R3_CAN_REFERENCE_D5_PIPING_CONTEXT && EXACT_D5_PIPING_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(D6_PROCESS_REQUIREMENT_EQUALS_D8_INSTRUMENT_SELECTION || D6_PROCESS_CONDITION_EQUALS_VALIDATED_INSTRUMENT_RANGE || D4_MECHANICAL_EQUIPMENT_CONTEXT_EQUALS_D8_INSTRUMENT_SELECTION || D4_PACKAGE_CONTEXT_EQUALS_VALIDATED_D8_DEVICE_DESIGN || D5_PIPING_CONTEXT_EQUALS_D8_INSTRUMENT_SELECTION || D8_INSTRUMENT_CONTEXT_EQUALS_VALIDATED_D5_PIPING_DESIGN).toBe(false);
    expect(D8_EQUALS_D4_MECHANICAL_AUTHORITY || D8_EQUALS_D5_PIPING_AUTHORITY || D8_EQUALS_D6_PROCESS_AUTHORITY || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY).toBe(false);
    expect(D8_R3_PERFORMS_INSTRUMENT_SELECTION || D8_R3_PERFORMS_INSTRUMENT_SIZING || D8_R3_PERFORMS_CONTROL_VALVE_SIZING || D8_R3_PERFORMS_ACTUATOR_SIZING || D8_R3_PERFORMS_DEVICE_PERFORMANCE_CALCULATION).toBe(false);
    expect(D8_R3_DERIVES_MISSING_DEVICE_ATTRIBUTE || D8_R3_ESTIMATES_MISSING_DEVICE_ATTRIBUTE || D8_R3_PERFORMS_SIGNAL_ENGINEERING || D8_R3_PERFORMS_CONTROL_LOOP_ENGINEERING || D8_R3_PERFORMS_CONTROL_SYSTEM_DESIGN || D8_R3_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING).toBe(false);
    expect([
      D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
      D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
      D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
      D8_ACTUATOR_SIZING_RUNTIME_COUNT,
      D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
      D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
      D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
      D8_SIL_CALCULATION_RUNTIME_COUNT,
      D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
      D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
      D8_D9_RUNTIME_INTEGRATION_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array.from({ length: 12 }, () => 0));
    expect(D8_R3_SOURCE_BASIS_REQUIRED && D8_R3_HISTORY_PRESERVED && D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D8_DEVICE_CONTEXT_AUTO_ACCEPTED || CROSS_TENANT_D8_R3_ACCESS_ALLOWED || SILENT_D8_R3_MUTATION_ALLOWED || D8_R3_AUTO_MUTATES_R1_IDENTITY || D8_R3_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT).toBe(false);
    expect(D8_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R3_REPLAY_PROTECTION_IMPLEMENTED && D8_R3_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D9_RUNTIME_STARTED || D8_R4_STARTED || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R3_STATUS).toBe("INSTRUMENT_AND_DEVICE_CONTEXT_IMPLEMENTED");
    expect(D8_R3_CANONICAL_NEXT_PHASE).toBe("EOS-D8-R4-SIGNAL-IO-AND-CONTROL-LOOP-CONTEXT");
    expect(D8_R3_NEXT_PHASE_TYPE).toBe("SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT");
    expect(D8_R3_CANONICAL_NEXT_PHASE_SCOPE).toMatch(/signal, I\/O and control-loop context/);

    const r1 = createD8R1Store();
    const who = actor();
    recordIacContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx", applicability: "project-a identity scope", limitations: "identity only" });
    const point = recordIacObjectIdentity(r1, who, { objectId: "mp-101", contextId: "ctx-1", objectType: "IAC_MEASUREMENT_POINT", citedLifecycleStage: "FEED", provenanceRef: "prov-mp", sourceBasisRef: "basis-mp", applicability: "project-a identity scope", limitations: "identity only" });
    const instrument = recordIacObjectIdentity(r1, who, { objectId: "pt-101", contextId: "ctx-1", objectType: "IAC_INSTRUMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-pt", sourceBasisRef: "basis-pt", applicability: "project-a identity scope", limitations: "identity only" });
    const valve = recordIacObjectIdentity(r1, who, { objectId: "fv-101", contextId: "ctx-1", objectType: "IAC_CONTROL_VALVE_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-fv", sourceBasisRef: "basis-fv", applicability: "project-a identity scope", limitations: "identity only" });
    const r2 = createD8R2Store(r1);
    const measured = recordProcessMeasurementContext(r2, who, { measurementRecordId: "meas-1", contextId: "ctx-1", objectId: point.objectId, objectRevisionFingerprint: point.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", provenanceRef: "prov-meas", sourceBasisRef: "basis-meas", applicability: "mp-101 measurement context", limitations: "context only" });
    const tag = recordIacTagContext(r2, who, { tagRecordId: "tag-1", tagToken: "PT-101", contextId: "ctx-1", objectId: instrument.objectId, objectRevisionFingerprint: instrument.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-tag", sourceBasisRef: "basis-tag", applicability: "pt-101 tag context", limitations: "tag only" });
    const before = JSON.stringify({ objects: r1.objects, r1History: r1.history, measurements: r2.measurements, tags: r2.tags, r2History: r2.history });
    const store = createD8R3Store(r2);
    const device = recordInstrumentDeviceContext(store, who, {
      deviceRecordId: "dev-1",
      contextId: "ctx-1",
      objectId: instrument.objectId,
      objectRevisionFingerprint: instrument.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      deviceClass: "TRANSMITTER",
      serviceContext: "PROCESS_MEASUREMENT_SERVICE",
      measurementPrinciple: "supplied diaphragm",
      manufacturer: "Acme",
      modelReference: "PTX-100",
      datasheetId: "DS-1",
      datasheetRevision: "ds-rev-1",
      suppliedRangeLow: "0",
      suppliedRangeHigh: "1600",
      suppliedRangeUnit: "kPa",
      suppliedSetpointValue: "1200",
      suppliedSetpointUnit: "kPa",
      suppliedCertificationRef: "supplied-iecex-ref",
      suppliedMarking: "supplied-nameplate",
      suppliedHazardousAreaMarking: "Ex d IIC T6 supplied",
      measurementRecordId: measured.measurementRecordId,
      measurementRevisionFingerprint: measured.fingerprint,
      tagRecordId: tag.tagRecordId,
      tagRevisionFingerprint: tag.fingerprint,
      d6SourceId: "d6-req-1",
      d6SourceRevisionFingerprint: "d6-req-rev-1",
      d6Subject: "PROCESS_MEASUREMENT_REQUIREMENT",
      d4SourceId: "d4-pkg-1",
      d4SourceRevisionFingerprint: "d4-pkg-rev-1",
      d4Subject: "INSTRUMENTATION_INTERFACE_POINTS",
      d5SourceId: "d5-line-1",
      d5SourceRevisionFingerprint: "d5-line-rev-1",
      d5Subject: "INLINE_INSTRUMENT",
      provenanceRef: "prov-dev-1",
      sourceBasisRef: "basis-dev-1",
      applicability: "pt-101 device context",
      limitations: "supplied context only; not selection or sizing",
    });
    expect(device.instrumentSelected).toBe(false);
    expect(device.validatedInstrumentDesign).toBe(false);
    expect(device.projectValidated).toBe(false);
    expect(device.rangeCalculated).toBe(false);
    expect(device.setpointCalculated).toBe(false);
    expect(device.certified).toBe(false);
    expect(device.hazardousAreaSelected).toBe(false);
    expect(device.conformant).toBe(false);
    expect(device.suppliedRangeUnit).toBe("kPa");
    expect(device.suppliedSetpointUnit).toBe("kPa");
    expect(device.objectRevisionFingerprint).toBe(instrument.fingerprint);
    expect(device.measurementRevisionFingerprint).toBe(measured.fingerprint);
    expect(device.tagRevisionFingerprint).toBe(tag.fingerprint);
    expect(device.datasheetRevision).toBe("ds-rev-1");
    const replay = recordInstrumentDeviceContext(store, who, {
      deviceRecordId: "dev-1",
      contextId: "ctx-1",
      objectId: instrument.objectId,
      objectRevisionFingerprint: instrument.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      deviceClass: "TRANSMITTER",
      serviceContext: "PROCESS_MEASUREMENT_SERVICE",
      measurementPrinciple: "supplied diaphragm",
      manufacturer: "Acme",
      modelReference: "PTX-100",
      datasheetId: "DS-1",
      datasheetRevision: "ds-rev-1",
      suppliedRangeLow: "0",
      suppliedRangeHigh: "1600",
      suppliedRangeUnit: "kPa",
      suppliedSetpointValue: "1200",
      suppliedSetpointUnit: "kPa",
      suppliedCertificationRef: "supplied-iecex-ref",
      suppliedMarking: "supplied-nameplate",
      suppliedHazardousAreaMarking: "Ex d IIC T6 supplied",
      measurementRecordId: measured.measurementRecordId,
      measurementRevisionFingerprint: measured.fingerprint,
      tagRecordId: tag.tagRecordId,
      tagRevisionFingerprint: tag.fingerprint,
      d6SourceId: "d6-req-1",
      d6SourceRevisionFingerprint: "d6-req-rev-1",
      d6Subject: "PROCESS_MEASUREMENT_REQUIREMENT",
      d4SourceId: "d4-pkg-1",
      d4SourceRevisionFingerprint: "d4-pkg-rev-1",
      d4Subject: "INSTRUMENTATION_INTERFACE_POINTS",
      d5SourceId: "d5-line-1",
      d5SourceRevisionFingerprint: "d5-line-rev-1",
      d5Subject: "INLINE_INSTRUMENT",
      provenanceRef: "prov-dev-1",
      sourceBasisRef: "basis-dev-1",
      applicability: "pt-101 device context",
      limitations: "supplied context only; not selection or sizing",
      assertedFingerprint: device.fingerprint,
    });
    expect(replay).toBe(device);
    const valveDevice = recordInstrumentDeviceContext(store, who, {
      deviceRecordId: "dev-valve",
      contextId: "ctx-1",
      objectId: valve.objectId,
      objectRevisionFingerprint: valve.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      deviceClass: "CONTROL_VALVE",
      serviceContext: "FINAL_ELEMENT",
      provenanceRef: "prov-valve",
      sourceBasisRef: "basis-valve",
      applicability: "fv-101 device context",
      limitations: "device context only; not valve sizing",
    });
    expect(valveDevice.instrumentSelected).toBe(false);
    expect(valveDevice.deviceClass).toBe("CONTROL_VALVE");
    const link = recordDeviceMeasurementRelationship(store, who, {
      relationshipId: "dev-rel-1",
      deviceRecordId: device.deviceRecordId,
      deviceRevisionFingerprint: device.fingerprint,
      measurementRecordId: measured.measurementRecordId,
      measurementRevisionFingerprint: measured.fingerprint,
      tagRecordId: tag.tagRecordId,
      tagRevisionFingerprint: tag.fingerprint,
      kind: "DEVICE_TO_MEASUREMENT",
      provenanceRef: "prov-rel",
      sourceBasisRef: "basis-rel",
      applicability: "pt-101 to mp-101 explicit",
      limitations: "not instrument selection",
    });
    expect(link.instrumentSelection).toBe(false);
    expect(link.validatedDeviceAssignment).toBe(false);
    expect(link.inferred).toBe(false);
    expect(link.measurementRevisionFingerprint).toBe(measured.fingerprint);
    expect(JSON.stringify({ objects: r1.objects, r1History: r1.history, measurements: r2.measurements, tags: r2.tags, r2History: r2.history })).toBe(before);

    const base = { contextId: "ctx-1", objectId: instrument.objectId, objectRevisionFingerprint: instrument.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", deviceClass: "TRANSMITTER", serviceContext: "PROCESS_MEASUREMENT_SERVICE", provenanceRef: "prov-x", sourceBasisRef: "basis-x", applicability: "pt-101 device context", limitations: "supplied only" };
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-float", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-unit", suppliedRangeLow: "0", suppliedRangeHigh: "10" })).toThrow(/MISSING_UNIT/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-sheet", datasheetId: "DS-2", datasheetRevision: "latest" })).toThrow(/DATASHEET_REVISION_REQUIRED/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-range", rangeDerivation: true })).toThrow(/RANGE_DERIVATION_NOT_IN_R3/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-set", setpointCalculation: true })).toThrow(/SETPOINT_DERIVATION_NOT_IN_R3/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-size", instrumentSizing: true })).toThrow(/INSTRUMENT_SIZING_NOT_IN_R3/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-perf", performanceCalculation: true })).toThrow(/DEVICE_PERFORMANCE_NOT_IN_R3/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-miss", deriveMissing: true })).toThrow(/MISSING_ATTRIBUTE_NOT_DERIVED/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-haz", hazardousAreaClassification: true })).toThrow(/HAZARDOUS_AREA_CLASSIFICATION_NOT_IN_R3/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-class", deviceClass: "TRANSFORMER" })).toThrow(/DEVICE_CLASS_NOT_ALLOWLISTED/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-d6", d6SourceId: "d6-x", d6SourceRevisionFingerprint: "latest", d6Subject: "PROCESS_MEASUREMENT_REQUIREMENT" })).toThrow(/D6_SOURCE_REVISION_REQUIRED/);
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-dup", suppliedRangeLow: "0", suppliedRangeHigh: "100", suppliedRangeUnit: "bar" })).toThrow(/DUPLICATE_DEVICE_REJECTED/);
    expect(store.devices[0].suppliedRangeUnit).toBe("kPa");
    expect(() => recordInstrumentDeviceContext(store, who, { ...base, deviceRecordId: "dev-1", suppliedRangeLow: "0", suppliedRangeHigh: "100", suppliedRangeUnit: "bar", assertedFingerprint: device.fingerprint })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(store.devices[0].fingerprint).toBe(device.fingerprint);
    expect(() => recordDeviceMeasurementRelationship(store, who, { relationshipId: "rel-bad", deviceRecordId: device.deviceRecordId, deviceRevisionFingerprint: device.fingerprint, measurementRecordId: measured.measurementRecordId, measurementRevisionFingerprint: measured.fingerprint, kind: "tag_naming", provenanceRef: "prov-bad", sourceBasisRef: "basis-bad", applicability: "pt-101 to mp-101 explicit", limitations: "not selection" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordDeviceMeasurementRelationship(store, who, { relationshipId: "rel-rev", deviceRecordId: device.deviceRecordId, deviceRevisionFingerprint: device.fingerprint, measurementRecordId: measured.measurementRecordId, measurementRevisionFingerprint: "spoofed", kind: "DEVICE_TO_MEASUREMENT", provenanceRef: "prov-bad", sourceBasisRef: "basis-bad", applicability: "pt-101 to mp-101 explicit", limitations: "not selection" })).toThrow(/R2_MEASUREMENT_REVISION_MISMATCH/);
    expect(() => recordInstrumentDeviceContext(store, actor({ tenantId: "tenant-b" }), { ...base, deviceRecordId: "dev-other" })).toThrow(/CROSS_SCOPE_OPERATION|R1_CONTEXT_NOT_FOUND/);
    expect(() => recordInstrumentDeviceContext(store, actor({ authority: "AI_ASSISTANT" }), { ...base, deviceRecordId: "dev-ai" })).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordInstrumentDeviceContext(store, actor({ authority: "ADMIN" }), { ...base, deviceRecordId: "dev-admin" })).toThrow(/ADMIN_NOT_IAC_AUTHORITY/);
    expect(() => selectIacInstrument()).toThrow(/INSTRUMENT_SELECTION_NOT_IN_R3/);
    expect(() => sizeIacInstrument()).toThrow(/INSTRUMENT_SIZING_NOT_IN_R3/);
    expect(() => deriveIacInstrumentRange()).toThrow(/RANGE_DERIVATION_NOT_IN_R3/);
    expect(() => deriveIacSetpoint()).toThrow(/SETPOINT_DERIVATION_NOT_IN_R3/);
    expect(() => sizeIacControlValve()).toThrow(/CONTROL_VALVE_SIZING_NOT_IN_R3/);
    expect(() => sizeIacActuator()).toThrow(/ACTUATOR_SIZING_NOT_IN_R3/);
    expect(() => calculateIacDevicePerformance()).toThrow(/DEVICE_PERFORMANCE_NOT_IN_R3/);
    expect(() => mutateIacIdentity()).toThrow(/R1_MUTATION_REJECTED/);
    expect(() => mutateIacMeasurementContext()).toThrow(/R2_MUTATION_REJECTED/);
    const revised = recordIacObjectIdentity(r1, who, { objectId: "pt-101-r2", contextId: "ctx-1", objectType: "IAC_INSTRUMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-pt-r2", sourceBasisRef: "basis-pt-r2", applicability: "project-a identity scope", limitations: "identity only", predecessorObjectId: instrument.objectId });
    expect(store.devices[0].objectRevisionFingerprint).toBe(instrument.fingerprint);
    expect(store.devices[0].measurementRevisionFingerprint).toBe(measured.fingerprint);
    expect(revised.predecessorObjectId).toBe(instrument.objectId);
    expect(r2.measurements[0].fingerprint).toBe(measured.fingerprint);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R3.INSTRUMENT_AND_DEVICE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R4.SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "instrument-device-context.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "instrument-device-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
