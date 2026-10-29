import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D8_CANONICAL_MILESTONE_COUNT, D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT, D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT as ARCHITECTURE_SIGNAL_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D8_CONTEXT_AUTHORITY, createD8R1Store, recordIacContext, recordIacObjectIdentity, type D8R1Actor } from "./identity-foundation";
import { createD8R3Store, recordInstrumentDeviceContext } from "./instrument-device-context";
import { createD8R2Store, recordProcessMeasurementContext } from "./process-measurement-tag-context";
import {
  AI_CAN_INVENT_AUTHORITATIVE_D8_IO_ASSIGNMENT,
  AI_CAN_INVENT_AUTHORITATIVE_D8_LOOP_MEMBERSHIP,
  AI_CAN_INVENT_AUTHORITATIVE_D8_SIGNAL_RELATIONSHIP,
  AI_CAN_PROMOTE_D8_LOOP_CONTEXT_TO_VALIDATED_CONTROL_STRATEGY,
  AI_CAN_PROMOTE_D8_SIGNAL_CONTEXT_TO_VALIDATED_IO_DESIGN,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D8_SIGNAL_IO_LOOP_CONTEXT_AUTO_ACCEPTED,
  CONTROL_LOOP_CONTEXT_EQUALS_CONTROL_LOGIC_DESIGN,
  CONTROL_LOOP_CONTEXT_EQUALS_LOOP_TUNING,
  CONTROL_LOOP_CONTEXT_EQUALS_VALIDATED_CONTROL_PERFORMANCE,
  CONTROL_LOOP_PURPOSE_EQUALS_VALIDATED_CONTROL_STRATEGY,
  CROSS_TENANT_D8_R4_ACCESS_ALLOWED,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_CONTROL_LOGIC,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOOP_DESIGN,
  D7_POWER_INTERFACE_EQUALS_D8_IO_CONFIGURATION,
  D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_CONTEXT_IMPLEMENTED,
  D8_CONTROL_LOOP_PURPOSE_CONTEXT_SUPPORTED,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_CONTROL_LOOP_MEMBERSHIP_REQUIRED,
  D8_EXPLICIT_SIGNAL_DESTINATION_REQUIRED,
  D8_EXPLICIT_SIGNAL_SOURCE_REQUIRED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_INFERRED_CONTROL_LOOP_MEMBERSHIP_ALLOWED,
  D8_INFERRED_SIGNAL_DESTINATION_ALLOWED,
  D8_INFERRED_SIGNAL_SOURCE_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_IO_CONTEXT_IMPLEMENTED,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_R1_R3_EXACT_REVISIONS_REUSED,
  D8_R3_RUNTIME_COUNT,
  D8_R4_AUTO_ASSIGNS_CONTROLLER,
  D8_R4_AUTO_ASSIGNS_IO_CHANNEL,
  D8_R4_AUTO_CREATES_ALARM_CONTEXT,
  D8_R4_AUTO_CREATES_SIGNAL_PATH,
  D8_R4_AUTO_MUTATES_R1_IDENTITY,
  D8_R4_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT,
  D8_R4_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT,
  D8_R4_AUTO_ROUTES_SIGNAL,
  D8_R4_CANONICAL_NEXT_PHASE,
  D8_R4_CONFIGURES_DCS,
  D8_R4_CONFIGURES_PLC,
  D8_R4_CONFIGURES_SCADA,
  D8_R4_CONFIGURES_SIS,
  D8_R4_DERIVES_MISSING_SIGNAL_ATTRIBUTE,
  D8_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R4_GENERATES_CONTROL_LOGIC,
  D8_R4_HISTORY_PRESERVED,
  D8_R4_NEXT_PHASE_TYPE,
  D8_R4_PERFORMS_CONTROL_LOGIC_DESIGN,
  D8_R4_PERFORMS_CONTROL_LOOP_TUNING,
  D8_R4_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING,
  D8_R4_PERFORMS_IO_ALLOCATION,
  D8_R4_PERFORMS_IO_ALLOCATION_OPTIMIZATION,
  D8_R4_PERFORMS_SIGNAL_DESIGN_CALCULATION,
  D8_R4_R2_REFERENCE_AUTO_REPOINTED,
  D8_R4_R3_REFERENCE_AUTO_REPOINTED,
  D8_R4_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R4_SOURCE_AUTO_REPOINTED,
  D8_R4_SOURCE_BASIS_REQUIRED,
  D8_R4_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R4_STATUS,
  D8_R5_STARTED,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIGNAL_CONTEXT_IMPLEMENTED,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_IMPLEMENTED,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIGNAL_TYPE_CONTEXT_SUPPORTED,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SUPPLIED_IO_CHANNEL_CONTEXT_SUPPORTED,
  D8_SUPPLIED_IO_TYPE_CONTEXT_SUPPORTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D8_CONTROL_LOOP_MEMBER_REVISION_REQUIRED,
  EXACT_D8_R2_MEASUREMENT_REVISION_REQUIRED,
  EXACT_D8_R3_DEVICE_REVISION_REQUIRED,
  EXACT_D8_R4_SOURCE_REVISION_REQUIRED,
  EXACT_D8_SIGNAL_ENDPOINT_REVISION_REQUIRED,
  FLOATING_D8_R4_SOURCE_REFERENCE_ALLOWED,
  INSTRUMENT_DEVICE_CONTEXT_EQUALS_IO_ALLOCATION,
  INSTRUMENT_DEVICE_CONTEXT_EQUALS_SIGNAL_DESIGN,
  IO_CONTEXT_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS,
  IO_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_CONFIGURATION,
  MEASUREMENT_POINT_CONTEXT_EQUALS_SIGNAL_DESIGN,
  NEW_DEPENDENCY_ADDED,
  PROCESS_MEASUREMENT_CONTEXT_EQUALS_IO_CONFIGURATION,
  SIGNAL_CONTEXT_EQUALS_CONTROL_LOGIC,
  SIGNAL_CONTEXT_EQUALS_VALIDATED_IO_DESIGN,
  SIGNAL_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  SILENT_D8_R4_MUTATION_ALLOWED,
  SUPPLIED_IO_CHANNEL_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS,
  SUPPLIED_IO_CHANNEL_EQUALS_VALIDATED_CONTROL_SYSTEM_CONFIGURATION,
  SUPPLIED_IO_TYPE_EQUALS_VALIDATED_IO_CONFIGURATION,
  SUPPLIED_SIGNAL_TYPE_EQUALS_VALIDATED_SIGNAL_DESIGN,
  allocateIacIo,
  assignIacIoChannel,
  calculateIacSignalDesign,
  configureIacDcs,
  configureIacPlc,
  configureIacScada,
  configureIacSis,
  createD8R4Store,
  createIacAlarmContext,
  designIacControlLogic,
  deriveIacSignalAttribute,
  generateIacControlLogic,
  mutateIacDeviceFromSignalContext,
  mutateIacIdentityFromSignalContext,
  mutateIacMeasurementFromSignalContext,
  optimizeIacIoAllocation,
  recordIacControlLoopContext,
  recordIacControlLoopMembership,
  recordIacIoContext,
  recordIacSignalContext,
  recordIacSignalEndpointRelationship,
  routeIacSignal,
  tuneIacControlLoop,
} from "./signal-io-control-loop-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return { actorId: "iac-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D8_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D8-R4 signal, I/O, and control-loop context", () => {
  it("records explicit signal, I/O, and loop context without allocating or tuning", () => {
    expect(D8_R1_R3_EXACT_REVISIONS_REUSED && EXACT_D8_R4_SOURCE_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D8_R4_SOURCE_REFERENCE_ALLOWED || D8_R4_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(4);
    expect(D8_R3_RUNTIME_COUNT).toBe(3);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_SIGNAL_COUNT).toBe(0);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_IMPLEMENTED && D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY).toBe(true);
    expect(D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT).toBe(1);
    expect(D8_CANONICAL_OBJECT_TAXONOMY_REUSED).toBe(true);
    expect(D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED).toBe(false);
    expect(D8_SIGNAL_CONTEXT_IMPLEMENTED && D8_SIGNAL_TYPE_CONTEXT_SUPPORTED && D8_IO_CONTEXT_IMPLEMENTED && D8_SUPPLIED_IO_TYPE_CONTEXT_SUPPORTED && D8_SUPPLIED_IO_CHANNEL_CONTEXT_SUPPORTED && D8_CONTROL_LOOP_CONTEXT_IMPLEMENTED && D8_CONTROL_LOOP_PURPOSE_CONTEXT_SUPPORTED).toBe(true);
    expect(SIGNAL_CONTEXT_EQUALS_VALIDATED_IO_DESIGN || SIGNAL_CONTEXT_EQUALS_CONTROL_LOGIC || SIGNAL_PRESENT_EQUALS_ENGINEERING_VALIDATED || SUPPLIED_SIGNAL_TYPE_EQUALS_VALIDATED_SIGNAL_DESIGN).toBe(false);
    expect(D8_EXPLICIT_SIGNAL_SOURCE_REQUIRED && D8_EXPLICIT_SIGNAL_DESTINATION_REQUIRED && EXACT_D8_SIGNAL_ENDPOINT_REVISION_REQUIRED).toBe(true);
    expect(D8_INFERRED_SIGNAL_SOURCE_ALLOWED || D8_INFERRED_SIGNAL_DESTINATION_ALLOWED || D8_R4_AUTO_ROUTES_SIGNAL || D8_R4_AUTO_CREATES_SIGNAL_PATH).toBe(false);
    expect(IO_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_CONFIGURATION || IO_CONTEXT_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS || SUPPLIED_IO_TYPE_EQUALS_VALIDATED_IO_CONFIGURATION).toBe(false);
    expect(SUPPLIED_IO_CHANNEL_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS || SUPPLIED_IO_CHANNEL_EQUALS_VALIDATED_CONTROL_SYSTEM_CONFIGURATION || D8_R4_PERFORMS_IO_ALLOCATION || D8_R4_PERFORMS_IO_ALLOCATION_OPTIMIZATION || D8_R4_AUTO_ASSIGNS_IO_CHANNEL).toBe(false);
    expect(CONTROL_LOOP_CONTEXT_EQUALS_CONTROL_LOGIC_DESIGN || CONTROL_LOOP_CONTEXT_EQUALS_LOOP_TUNING || CONTROL_LOOP_CONTEXT_EQUALS_VALIDATED_CONTROL_PERFORMANCE || CONTROL_LOOP_PURPOSE_EQUALS_VALIDATED_CONTROL_STRATEGY).toBe(false);
    expect(D8_EXPLICIT_CONTROL_LOOP_MEMBERSHIP_REQUIRED && EXACT_D8_CONTROL_LOOP_MEMBER_REVISION_REQUIRED && EXACT_D8_R2_MEASUREMENT_REVISION_REQUIRED && EXACT_D8_R3_DEVICE_REVISION_REQUIRED).toBe(true);
    expect(D8_INFERRED_CONTROL_LOOP_MEMBERSHIP_ALLOWED || D8_R4_R2_REFERENCE_AUTO_REPOINTED || D8_R4_R3_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(MEASUREMENT_POINT_CONTEXT_EQUALS_SIGNAL_DESIGN || PROCESS_MEASUREMENT_CONTEXT_EQUALS_IO_CONFIGURATION || INSTRUMENT_DEVICE_CONTEXT_EQUALS_SIGNAL_DESIGN || INSTRUMENT_DEVICE_CONTEXT_EQUALS_IO_ALLOCATION).toBe(false);
    expect(D8_R4_PERFORMS_SIGNAL_DESIGN_CALCULATION || D8_R4_DERIVES_MISSING_SIGNAL_ATTRIBUTE || D8_R4_PERFORMS_CONTROL_LOOP_TUNING || D8_R4_PERFORMS_CONTROL_LOGIC_DESIGN || D8_R4_GENERATES_CONTROL_LOGIC).toBe(false);
    expect(D8_R4_CONFIGURES_DCS || D8_R4_CONFIGURES_PLC || D8_R4_CONFIGURES_SIS || D8_R4_CONFIGURES_SCADA || D8_R4_AUTO_ASSIGNS_CONTROLLER || D8_R4_AUTO_CREATES_ALARM_CONTEXT || D8_R4_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING).toBe(false);
    expect([
      D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
      D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
      D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
      D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
      D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
      D8_SIL_CALCULATION_RUNTIME_COUNT,
      D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
      D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
      D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
      D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
      D8_ACTUATOR_SIZING_RUNTIME_COUNT,
      D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
      D8_D9_RUNTIME_INTEGRATION_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array.from({ length: 14 }, () => 0));
    expect(D8_EQUALS_D6_PROCESS_AUTHORITY || D8_EQUALS_D7_ELECTRICAL_AUTHORITY || D6_PROCESS_REQUIREMENT_EQUALS_D8_CONTROL_LOGIC || D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOOP_DESIGN || D7_POWER_INTERFACE_EQUALS_D8_IO_CONFIGURATION || D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN || D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D8_SIGNAL_RELATIONSHIP || AI_CAN_INVENT_AUTHORITATIVE_D8_IO_ASSIGNMENT || AI_CAN_INVENT_AUTHORITATIVE_D8_LOOP_MEMBERSHIP || AI_CAN_PROMOTE_D8_SIGNAL_CONTEXT_TO_VALIDATED_IO_DESIGN || AI_CAN_PROMOTE_D8_LOOP_CONTEXT_TO_VALIDATED_CONTROL_STRATEGY).toBe(false);
    expect(D8_R4_SOURCE_BASIS_REQUIRED && D8_R4_HISTORY_PRESERVED && D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D8_SIGNAL_IO_LOOP_CONTEXT_AUTO_ACCEPTED || CROSS_TENANT_D8_R4_ACCESS_ALLOWED || SILENT_D8_R4_MUTATION_ALLOWED || D8_R4_AUTO_MUTATES_R1_IDENTITY || D8_R4_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT || D8_R4_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT).toBe(false);
    expect(D8_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R4_REPLAY_PROTECTION_IMPLEMENTED && D8_R4_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D9_RUNTIME_STARTED || D8_R5_STARTED || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R4_STATUS).toBe("SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT_IMPLEMENTED");
    expect(D8_R4_CANONICAL_NEXT_PHASE).toBe("EOS-D8-R5-CONTROL-SYSTEM-ARCHITECTURE-CONTEXT");
    expect(D8_R4_NEXT_PHASE_TYPE).toBe("CONTROL_SYSTEM_ARCHITECTURE_CONTEXT");

    const r1 = createD8R1Store();
    const who = actor();
    const identity = { citedLifecycleStage: "FEED", provenanceRef: "prov-id", sourceBasisRef: "basis-id", applicability: "project-a identity scope", limitations: "identity only" };
    recordIacContext(r1, who, { contextId: "ctx-1", ...identity });
    const point = recordIacObjectIdentity(r1, who, { objectId: "mp-101", contextId: "ctx-1", objectType: "IAC_MEASUREMENT_POINT", ...identity });
    const instrument = recordIacObjectIdentity(r1, who, { objectId: "pt-101", contextId: "ctx-1", objectType: "IAC_INSTRUMENT", ...identity });
    const signalObject = recordIacObjectIdentity(r1, who, { objectId: "sig-101", contextId: "ctx-1", objectType: "IAC_SIGNAL", ...identity });
    const ioObject = recordIacObjectIdentity(r1, who, { objectId: "io-101", contextId: "ctx-1", objectType: "IAC_IO_POINT", ...identity });
    const ioOther = recordIacObjectIdentity(r1, who, { objectId: "io-102", contextId: "ctx-1", objectType: "IAC_IO_POINT", citedLifecycleStage: "FEED", provenanceRef: "prov-io-102", sourceBasisRef: "basis-io-102", applicability: "io-102 identity scope", limitations: "identity only" });
    const loopObject = recordIacObjectIdentity(r1, who, { objectId: "lc-101", contextId: "ctx-1", objectType: "IAC_CONTROL_LOOP", ...identity });
    const r2 = createD8R2Store(r1);
    const measured = recordProcessMeasurementContext(r2, who, { measurementRecordId: "meas-1", contextId: "ctx-1", objectId: point.objectId, objectRevisionFingerprint: point.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", provenanceRef: "prov-meas", sourceBasisRef: "basis-meas", applicability: "mp-101 measurement context", limitations: "context only" });
    const r3 = createD8R3Store(r2);
    const device = recordInstrumentDeviceContext(r3, who, { deviceRecordId: "dev-1", contextId: "ctx-1", objectId: instrument.objectId, objectRevisionFingerprint: instrument.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", deviceClass: "TRANSMITTER", serviceContext: "PROCESS_MEASUREMENT_SERVICE", provenanceRef: "prov-dev", sourceBasisRef: "basis-dev", applicability: "pt-101 device context", limitations: "device context only" });
    const before = JSON.stringify({ objects: r1.objects, r1History: r1.history, measurements: r2.measurements, tags: r2.tags, r2History: r2.history, devices: r3.devices, relationships: r3.relationships, r3History: r3.history });
    const store = createD8R4Store(r3);
    const signal = recordIacSignalContext(store, who, {
      signalRecordId: "sig-rec-1",
      contextId: "ctx-1",
      objectId: signalObject.objectId,
      objectRevisionFingerprint: signalObject.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      signalType: "ANALOG_INPUT",
      signalDirection: "INPUT",
      sourceObjectId: instrument.objectId,
      sourceObjectRevisionFingerprint: instrument.fingerprint,
      destinationObjectId: ioObject.objectId,
      destinationObjectRevisionFingerprint: ioObject.fingerprint,
      suppliedUnit: "kPa",
      suppliedProtocolReference: "supplied 4-20 mA reference",
      measurementRecordId: measured.measurementRecordId,
      measurementRevisionFingerprint: measured.fingerprint,
      deviceRecordId: device.deviceRecordId,
      deviceRevisionFingerprint: device.fingerprint,
      provenanceRef: "prov-sig",
      sourceBasisRef: "basis-sig",
      applicability: "sig-101 signal context",
      limitations: "context only",
    });
    const io = recordIacIoContext(store, who, {
      ioRecordId: "io-rec-1",
      contextId: "ctx-1",
      objectId: ioObject.objectId,
      objectRevisionFingerprint: ioObject.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      suppliedIoType: "ANALOG_INPUT",
      suppliedChannelReference: "CH-12 supplied",
      suppliedTerminalReference: "TB-1 supplied",
      suppliedMarshallingReference: "MR-1 supplied",
      provenanceRef: "prov-io",
      sourceBasisRef: "basis-io",
      applicability: "io-101 io context",
      limitations: "supplied reference only",
    });
    const loop = recordIacControlLoopContext(store, who, {
      loopRecordId: "loop-1",
      contextId: "ctx-1",
      objectId: loopObject.objectId,
      objectRevisionFingerprint: loopObject.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      loopPurpose: "REGULATORY_CONTROL",
      measurementRecordId: measured.measurementRecordId,
      measurementRevisionFingerprint: measured.fingerprint,
      deviceRecordId: device.deviceRecordId,
      deviceRevisionFingerprint: device.fingerprint,
      provenanceRef: "prov-loop",
      sourceBasisRef: "basis-loop",
      applicability: "lc-101 loop context",
      limitations: "membership is separate",
    });
    expect(store.memberships).toEqual([]);
    expect(loop.validatedStrategy).toBe(false);
    expect(loop.tuned).toBe(false);
    expect(loop.logicDesign).toBe(false);
    expect(signal.validatedIoDesign).toBe(false);
    expect(signal.controlLogic).toBe(false);
    expect(signal.routedByEos).toBe(false);
    expect(signal.suppliedUnit).toBe("kPa");
    expect(io.allocatedByEos).toBe(false);
    expect(io.channelAssignedByEos).toBe(false);
    expect(io.validatedConfiguration).toBe(false);
    expect(io.suppliedChannelReference).toBe("CH-12 supplied");
    const membership = recordIacControlLoopMembership(store, who, { membershipId: "mem-1", loopRecordId: loop.loopRecordId, loopRevisionFingerprint: loop.fingerprint, memberKind: "MEASUREMENT", memberRecordId: measured.measurementRecordId, memberRevisionFingerprint: measured.fingerprint, provenanceRef: "prov-mem", sourceBasisRef: "basis-mem", applicability: "lc-101 measurement member", limitations: "explicit only" });
    recordIacControlLoopMembership(store, who, { membershipId: "mem-2", loopRecordId: loop.loopRecordId, loopRevisionFingerprint: loop.fingerprint, memberKind: "DEVICE", memberRecordId: device.deviceRecordId, memberRevisionFingerprint: device.fingerprint, provenanceRef: "prov-mem", sourceBasisRef: "basis-mem", applicability: "lc-101 device member", limitations: "explicit only" });
    recordIacControlLoopMembership(store, who, { membershipId: "mem-3", loopRecordId: loop.loopRecordId, loopRevisionFingerprint: loop.fingerprint, memberKind: "SIGNAL", memberRecordId: signal.signalRecordId, memberRevisionFingerprint: signal.fingerprint, provenanceRef: "prov-mem", sourceBasisRef: "basis-mem", applicability: "lc-101 signal member", limitations: "explicit only" });
    const endpoint = recordIacSignalEndpointRelationship(store, who, { relationshipId: "rel-src", signalRecordId: signal.signalRecordId, signalRevisionFingerprint: signal.fingerprint, kind: "SIGNAL_SOURCE", endpointObjectId: instrument.objectId, endpointObjectRevisionFingerprint: instrument.fingerprint, provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "sig-101 source", limitations: "explicit endpoint" });
    expect(membership.inferred).toBe(false);
    expect(endpoint.routedByEos).toBe(false);
    expect(endpoint.endpointObjectRevisionFingerprint).toBe(instrument.fingerprint);
    const replay = recordIacSignalContext(store, who, {
      signalRecordId: "sig-rec-1",
      contextId: "ctx-1",
      objectId: signalObject.objectId,
      objectRevisionFingerprint: signalObject.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      signalType: "ANALOG_INPUT",
      signalDirection: "INPUT",
      sourceObjectId: instrument.objectId,
      sourceObjectRevisionFingerprint: instrument.fingerprint,
      destinationObjectId: ioObject.objectId,
      destinationObjectRevisionFingerprint: ioObject.fingerprint,
      suppliedUnit: "kPa",
      suppliedProtocolReference: "supplied 4-20 mA reference",
      measurementRecordId: measured.measurementRecordId,
      measurementRevisionFingerprint: measured.fingerprint,
      deviceRecordId: device.deviceRecordId,
      deviceRevisionFingerprint: device.fingerprint,
      provenanceRef: "prov-sig",
      sourceBasisRef: "basis-sig",
      applicability: "sig-101 signal context",
      limitations: "context only",
    });
    expect(replay.fingerprint).toBe(signal.fingerprint);
    expect(store.signals).toHaveLength(1);

    const signalBase = {
      contextId: "ctx-1",
      objectId: signalObject.objectId,
      objectRevisionFingerprint: signalObject.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      signalType: "ANALOG_INPUT",
      signalDirection: "INPUT",
      sourceObjectId: instrument.objectId,
      sourceObjectRevisionFingerprint: instrument.fingerprint,
      destinationObjectId: ioObject.objectId,
      destinationObjectRevisionFingerprint: ioObject.fingerprint,
      suppliedUnit: "kPa",
      provenanceRef: "prov-sig",
      sourceBasisRef: "basis-sig",
      applicability: "sig-101 signal context",
      limitations: "context only",
    };
    expect(() => recordIacSignalContext(store, who, { ...signalBase, signalRecordId: "sig-dup", suppliedProtocolReference: "other supplied reference" })).toThrow(/DUPLICATE_SIGNAL_REJECTED/);
    expect(store.signals[0].suppliedUnit).toBe("kPa");
    expect(() => recordIacSignalContext(store, who, { ...signalBase, signalRecordId: "sig-rec-1", suppliedProtocolReference: "changed reference", assertedFingerprint: signal.fingerprint })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(store.signals[0].fingerprint).toBe(signal.fingerprint);
    expect(() => recordIacSignalContext(store, who, { ...signalBase, signalRecordId: "sig-open", destinationObjectId: "", destinationObjectRevisionFingerprint: "" })).toThrow(/SIGNAL_ENDPOINT_REVISION_REQUIRED/);
    expect(() => recordIacSignalContext(store, who, { ...signalBase, signalRecordId: "sig-float", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordIacSignalContext(store, who, { ...signalBase, signalRecordId: "sig-type", signalType: "CALCULATED_ANALOG" })).toThrow(/SIGNAL_TYPE_NOT_ALLOWLISTED/);
    expect(() => recordIacSignalContext(store, who, { ...signalBase, signalRecordId: "sig-meas", measurementRecordId: measured.measurementRecordId, measurementRevisionFingerprint: "spoofed" })).toThrow(/R2_MEASUREMENT_REVISION_MISMATCH/);
    expect(() => recordIacSignalContext(store, who, { ...signalBase, signalRecordId: "sig-dev", deviceRecordId: device.deviceRecordId, deviceRevisionFingerprint: "spoofed" })).toThrow(/R3_DEVICE_REVISION_MISMATCH/);
    expect(() => recordIacSignalContext(store, who, { ...signalBase, signalRecordId: "sig-alarm", alarmContextId: "ALM-1" })).toThrow(/ALARM_CONTEXT_NOT_IN_R4/);
    expect(() => recordIacSignalContext(store, who, { ...signalBase, signalRecordId: "sig-node", controllerNodeId: "node-1" })).toThrow(/CONTROL_SYSTEM_NODE_NOT_IN_R4/);
    expect(() => recordIacSignalContext(store, actor({ tenantId: "tenant-b" }), { ...signalBase, signalRecordId: "sig-cross" })).toThrow(/CROSS_SCOPE_OPERATION|R1_CONTEXT_NOT_FOUND/);
    expect(() => recordIacSignalContext(store, actor({ actorId: "AI-recorder", authority: "AI" }), { ...signalBase, signalRecordId: "sig-ai" })).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordIacSignalContext(store, actor({ authority: "ADMIN" }), { ...signalBase, signalRecordId: "sig-admin" })).toThrow(/ADMIN_NOT_IAC_AUTHORITY/);
    expect(() => recordIacIoContext(store, who, { ioRecordId: "io-auto", contextId: "ctx-1", objectId: ioObject.objectId, objectRevisionFingerprint: ioObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", suppliedIoType: "ANALOG_INPUT", suppliedChannelReference: "auto", provenanceRef: "prov-io", sourceBasisRef: "basis-io", applicability: "io-101 io context", limitations: "supplied reference only" })).toThrow(/CHANNEL_REFERENCE_SPOOF_REJECTED/);
    expect(() => recordIacIoContext(store, who, { ioRecordId: "io-dup", contextId: "ctx-1", objectId: ioObject.objectId, objectRevisionFingerprint: ioObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", suppliedIoType: "ANALOG_INPUT", suppliedChannelReference: "CH-99 supplied", provenanceRef: "prov-io", sourceBasisRef: "basis-io", applicability: "io-101 io context", limitations: "supplied reference only" })).toThrow(/DUPLICATE_IO_REJECTED/);
    expect(store.ioRecords[0].suppliedChannelReference).toBe("CH-12 supplied");
    expect(() => recordIacIoContext(store, who, { ioRecordId: "io-clash", contextId: "ctx-1", objectId: ioOther.objectId, objectRevisionFingerprint: ioOther.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", suppliedIoType: "ANALOG_INPUT", suppliedChannelReference: "CH-12 supplied", provenanceRef: "prov-io", sourceBasisRef: "basis-io", applicability: "io-102 io context", limitations: "supplied reference only" })).toThrow(/CHANNEL_ASSIGNMENT_CONFLICT/);
    expect(() => recordIacControlLoopMembership(store, who, { membershipId: "mem-inferred", loopRecordId: loop.loopRecordId, loopRevisionFingerprint: loop.fingerprint, memberKind: "tag_naming", memberRecordId: measured.measurementRecordId, memberRevisionFingerprint: measured.fingerprint, provenanceRef: "prov-mem", sourceBasisRef: "basis-mem", applicability: "lc-101 measurement member", limitations: "explicit only" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordIacSignalEndpointRelationship(store, who, { relationshipId: "rel-spoof", signalRecordId: signal.signalRecordId, signalRevisionFingerprint: signal.fingerprint, kind: "SIGNAL_DESTINATION", endpointObjectId: instrument.objectId, endpointObjectRevisionFingerprint: instrument.fingerprint, provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "sig-101 source", limitations: "explicit endpoint" })).toThrow(/SIGNAL_ENDPOINT_MISMATCH/);
    expect(() => recordIacSignalEndpointRelationship(store, who, { relationshipId: "rel-dup", signalRecordId: signal.signalRecordId, signalRevisionFingerprint: signal.fingerprint, kind: "SIGNAL_SOURCE", endpointObjectId: instrument.objectId, endpointObjectRevisionFingerprint: instrument.fingerprint, provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "sig-101 source", limitations: "explicit endpoint" })).toThrow(/DUPLICATE_SIGNAL_RELATIONSHIP_REJECTED/);
    expect(() => routeIacSignal()).toThrow(/SIGNAL_ROUTING_NOT_IN_R4/);
    expect(() => allocateIacIo()).toThrow(/IO_ALLOCATION_NOT_IN_R4/);
    expect(() => optimizeIacIoAllocation()).toThrow(/IO_ALLOCATION_NOT_IN_R4/);
    expect(() => assignIacIoChannel()).toThrow(/IO_ALLOCATION_NOT_IN_R4/);
    expect(() => tuneIacControlLoop()).toThrow(/LOOP_TUNING_NOT_IN_R4/);
    expect(() => designIacControlLogic()).toThrow(/CONTROL_LOGIC_NOT_IN_R4/);
    expect(() => generateIacControlLogic()).toThrow(/CONTROL_LOGIC_NOT_IN_R4/);
    expect(() => configureIacDcs()).toThrow(/CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R4/);
    expect(() => configureIacPlc()).toThrow(/CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R4/);
    expect(() => configureIacSis()).toThrow(/CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R4/);
    expect(() => configureIacScada()).toThrow(/CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R4/);
    expect(() => calculateIacSignalDesign()).toThrow(/SIGNAL_DESIGN_CALCULATION_NOT_IN_R4/);
    expect(() => deriveIacSignalAttribute()).toThrow(/MISSING_SIGNAL_ATTRIBUTE_NOT_DERIVED/);
    expect(() => createIacAlarmContext()).toThrow(/ALARM_CONTEXT_NOT_IN_R4/);
    expect(() => mutateIacIdentityFromSignalContext()).toThrow(/R1_MUTATION_REJECTED/);
    expect(() => mutateIacMeasurementFromSignalContext()).toThrow(/R2_MUTATION_REJECTED/);
    expect(() => mutateIacDeviceFromSignalContext()).toThrow(/R3_MUTATION_REJECTED/);
    const revisedIo = recordIacIoContext(store, who, { ioRecordId: "io-rec-2", predecessorIoRecordId: io.ioRecordId, contextId: "ctx-1", objectId: ioObject.objectId, objectRevisionFingerprint: ioObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", suppliedIoType: "ANALOG_INPUT", suppliedChannelReference: "CH-13 supplied", suppliedTerminalReference: "TB-1 supplied", suppliedMarshallingReference: "MR-1 supplied", provenanceRef: "prov-io", sourceBasisRef: "basis-io-r2", applicability: "io-101 io context", limitations: "supplied reference only" });
    expect(store.ioRecords[0].suppliedChannelReference).toBe("CH-12 supplied");
    expect(store.ioRecords[0].recordStatus).toBe("SUPERSEDED");
    expect(revisedIo.suppliedChannelReference).toBe("CH-13 supplied");
    expect(JSON.stringify({ objects: r1.objects, r1History: r1.history, measurements: r2.measurements, tags: r2.tags, r2History: r2.history, devices: r3.devices, relationships: r3.relationships, r3History: r3.history })).toBe(before);
    const revised = recordIacObjectIdentity(r1, who, { objectId: "sig-101-r2", contextId: "ctx-1", objectType: "IAC_SIGNAL", ...identity, predecessorObjectId: signalObject.objectId });
    expect(store.signals[0].objectRevisionFingerprint).toBe(signalObject.fingerprint);
    expect(store.signals[0].sourceObjectRevisionFingerprint).toBe(instrument.fingerprint);
    expect(store.signals[0].destinationObjectRevisionFingerprint).toBe(ioObject.fingerprint);
    expect(store.signals[0].measurementRevisionFingerprint).toBe(measured.fingerprint);
    expect(store.signals[0].deviceRevisionFingerprint).toBe(device.fingerprint);
    expect(r2.measurements[0].fingerprint).toBe(measured.fingerprint);
    expect(r3.devices[0].fingerprint).toBe(device.fingerprint);
    expect(revised.predecessorObjectId).toBe(signalObject.objectId);
    expect(r1.objects.find((row) => row.objectId === "sig-101")?.signalIoContextEstablished).toBe(false);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R4.SIGNAL_IO_AND_CONTROL_LOOP_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R5.CONTROL_SYSTEM_ARCHITECTURE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "signal-io-control-loop-context.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "signal-io-control-loop-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
