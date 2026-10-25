import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D8_CANONICAL_MILESTONE_COUNT, D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT as ARCHITECTURE_SYSTEM_COUNT, D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D8_CONTEXT_AUTHORITY, createD8R1Store, recordIacContext, recordIacObjectIdentity, type D8R1Actor } from "./identity-foundation";
import { createD8R3Store, recordInstrumentDeviceContext } from "./instrument-device-context";
import { createD8R2Store, recordProcessMeasurementContext } from "./process-measurement-tag-context";
import { createD8R4Store, recordIacControlLoopContext, recordIacIoContext, recordIacSignalContext } from "./signal-io-control-loop-context";
import {
  AI_CAN_INVENT_AUTHORITATIVE_D8_CONTROLLER_ASSIGNMENT,
  AI_CAN_INVENT_AUTHORITATIVE_D8_NETWORK_TOPOLOGY,
  AI_CAN_PROMOTE_D8_CONTROL_SYSTEM_CONTEXT_TO_VALIDATED_DESIGN,
  AI_CAN_PROMOTE_D8_NETWORK_CONTEXT_TO_SECURE_NETWORK_DESIGN,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D8_CONTROL_SYSTEM_CONTEXT_AUTO_ACCEPTED,
  CONTROL_CABINET_CONTEXT_EQUALS_VALIDATED_CABINET_DESIGN,
  CONTROL_LOOP_TO_CONTROLLER_RELATIONSHIP_EQUALS_CONTROL_LOGIC_IMPLEMENTED,
  CONTROL_LOOP_TO_SYSTEM_RELATIONSHIP_EQUALS_VALIDATED_CONTROL_STRATEGY,
  CONTROL_PANEL_CONTEXT_EQUALS_PANEL_LAYOUT_DESIGN,
  CONTROL_PANEL_CONTEXT_EQUALS_VALIDATED_PANEL_DESIGN,
  CONTROL_SYSTEM_CONTEXT_EQUALS_CONTROL_SYSTEM_CONFIGURATION,
  CONTROL_SYSTEM_CONTEXT_EQUALS_ENGINEERING_VALIDATED,
  CONTROL_SYSTEM_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_DESIGN,
  CONTROL_SYSTEM_NODE_CONTEXT_EQUALS_CONTROLLER_CONFIGURATION,
  CONTROL_SYSTEM_NODE_CONTEXT_EQUALS_VALIDATED_CONTROLLER_SELECTION,
  CROSS_TENANT_D8_R5_ACCESS_ALLOWED,
  D6_CONTROL_REQUIREMENT_EQUALS_VALIDATED_D8_CONTROL_SYSTEM_ARCHITECTURE,
  D6_PROCESS_REQUIREMENT_EQUALS_D8_CONTROL_SYSTEM_DESIGN,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_POWER_INTERFACE_EQUALS_D8_CONTROL_SYSTEM_DESIGN,
  D7_POWER_INTERFACE_EQUALS_VALIDATED_CONTROL_PANEL_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_CONTROL_CABINET_CONTEXT_SUPPORTED,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_PANEL_CONTEXT_SUPPORTED,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_IMPLEMENTED,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_CONTROL_SYSTEM_CONTEXT_IMPLEMENTED,
  D8_CONTROL_SYSTEM_NODE_CONTEXT_IMPLEMENTED,
  D8_CONTROL_SYSTEM_TYPE_CONTEXT_SUPPORTED,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_CONTROL_SYSTEM_MEMBERSHIP_REQUIRED,
  D8_EXPLICIT_NETWORK_ENDPOINTS_REQUIRED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_HMI_CONTEXT_SUPPORTED,
  D8_INFERRED_CONTROL_SYSTEM_MEMBERSHIP_ALLOWED,
  D8_INFERRED_NETWORK_ENDPOINTS_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT,
  D8_MARSHALLING_CONTEXT_SUPPORTED,
  D8_NETWORK_INTERFACE_CONTEXT_IMPLEMENTED,
  D8_OT_CYBERSECURITY_CONTEXT_SUPPORTED,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT,
  D8_R1_R4_EXACT_REVISIONS_REUSED,
  D8_R4_RUNTIME_COUNT,
  D8_R5_ASSIGNS_NETWORK_ADDRESS,
  D8_R5_AUTO_ASSIGNS_CONTROLLER,
  D8_R5_AUTO_ASSIGNS_IO_CHANNEL,
  D8_R5_AUTO_ASSIGNS_IO_TO_CONTROLLER,
  D8_R5_AUTO_ASSIGNS_MARSHALLING_TERMINAL,
  D8_R5_AUTO_ASSIGNS_SIGNAL_TO_CONTROLLER,
  D8_R5_AUTO_CREATES_ALARM_CONTEXT,
  D8_R5_AUTO_GENERATES_SYSTEM_HIERARCHY,
  D8_R5_AUTO_MUTATES_R1_IDENTITY,
  D8_R5_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT,
  D8_R5_CANONICAL_NEXT_PHASE,
  D8_R5_CONFIGURES_DCS,
  D8_R5_CONFIGURES_HMI,
  D8_R5_CONFIGURES_NETWORK,
  D8_R5_CONFIGURES_PLC,
  D8_R5_CONFIGURES_RTU,
  D8_R5_CONFIGURES_SCADA,
  D8_R5_CONFIGURES_SIS,
  D8_R5_DETERMINES_NETWORK_SECURITY_COMPLIANCE,
  D8_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R5_GENERATES_CONTROL_LOGIC,
  D8_R5_GENERATES_HMI_GRAPHICS,
  D8_R5_HISTORY_PRESERVED,
  D8_R5_NEXT_PHASE_TYPE,
  D8_R5_PERFORMS_CONTROL_LOGIC_DESIGN,
  D8_R5_PERFORMS_CONTROL_LOOP_TUNING,
  D8_R5_PERFORMS_CONTROLLER_SIZING,
  D8_R5_PERFORMS_CYBERSECURITY_VALIDATION,
  D8_R5_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING,
  D8_R5_PERFORMS_IO_ALLOCATION,
  D8_R5_PERFORMS_NETWORK_BANDWIDTH_CALCULATION,
  D8_R5_PERFORMS_NETWORK_DESIGN,
  D8_R5_PERFORMS_NETWORK_OPTIMIZATION,
  D8_R5_PERFORMS_NETWORK_REDUNDANCY_DESIGN,
  D8_R5_PERFORMS_TERMINATION_DESIGN,
  D8_R5_R4_IO_REFERENCE_AUTO_REPOINTED,
  D8_R5_R4_LOOP_REFERENCE_AUTO_REPOINTED,
  D8_R5_R4_SIGNAL_REFERENCE_AUTO_REPOINTED,
  D8_R5_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R5_SOURCE_AUTO_REPOINTED,
  D8_R5_SOURCE_BASIS_REQUIRED,
  D8_R5_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R5_STATUS,
  D8_R6_STARTED,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SUPPLIED_COMMUNICATION_PROTOCOL_CONTEXT_SUPPORTED,
  D8_SUPPLIED_CONTROL_SYSTEM_HIERARCHY_SUPPORTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D8_CONTROL_SYSTEM_MEMBER_REVISION_REQUIRED,
  EXACT_D8_CONTROL_SYSTEM_NODE_REVISION_REQUIRED,
  EXACT_D8_NETWORK_ENDPOINT_REVISION_REQUIRED,
  EXACT_D8_R4_CONTROL_LOOP_REVISION_REQUIRED,
  EXACT_D8_R4_IO_REVISION_REQUIRED,
  EXACT_D8_R4_SIGNAL_REVISION_REQUIRED,
  EXACT_D8_R5_SOURCE_REVISION_REQUIRED,
  FLOATING_D8_CONTROL_SYSTEM_NODE_REVISION_ALLOWED,
  FLOATING_D8_R5_SOURCE_REFERENCE_ALLOWED,
  HMI_CONTEXT_EQUALS_HMI_CONFIGURATION,
  HMI_CONTEXT_EQUALS_VALIDATED_HMI_DESIGN,
  IO_TO_CONTROLLER_RELATIONSHIP_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS,
  IO_TO_SYSTEM_RELATIONSHIP_EQUALS_VALIDATED_IO_CONFIGURATION,
  MARSHALLING_CONTEXT_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS,
  MARSHALLING_CONTEXT_EQUALS_VALIDATED_TERMINATION_DESIGN,
  NETWORK_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED,
  NETWORK_CONTEXT_EQUALS_SECURE_NETWORK_DESIGN,
  NETWORK_CONTEXT_EQUALS_VALIDATED_NETWORK_DESIGN,
  NEW_DEPENDENCY_ADDED,
  OT_CYBERSECURITY_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED,
  SECURITY_ZONE_CONTEXT_EQUALS_VALIDATED_SECURITY_ARCHITECTURE,
  SIGNAL_TO_NODE_RELATIONSHIP_EQUALS_CONTROLLER_CONFIGURATION,
  SIGNAL_TO_SYSTEM_RELATIONSHIP_EQUALS_VALIDATED_SYSTEM_CONFIGURATION,
  SILENT_D8_R5_MUTATION_ALLOWED,
  SUPPLIED_CONTROL_SYSTEM_HIERARCHY_EQUALS_VALIDATED_SYSTEM_ARCHITECTURE,
  SUPPLIED_CONTROL_SYSTEM_TYPE_EQUALS_VALIDATED_SYSTEM_SELECTION,
  SUPPLIED_PROTOCOL_CONTEXT_EQUALS_VALIDATED_NETWORK_CONFIGURATION,
  allocateIacIo,
  assignIacMarshallingTerminal,
  configureIacDcs,
  configureIacHmi,
  configureIacNetwork,
  configureIacPlc,
  configureIacRtu,
  configureIacScada,
  configureIacSis,
  createD8R5Store,
  createIacAlarmContext,
  designIacNetwork,
  generateIacControlLogic,
  generateIacHmiGraphics,
  mutateIacSignalContext,
  recordIacControlNodeContext,
  recordIacControlSystemContext,
  recordIacControlSystemHierarchy,
  recordIacControlSystemLink,
  recordIacControlSystemMembership,
  recordIacNetworkInterfaceContext,
  recordIacSuppliedInterfaceContext,
  sizeIacController,
  tuneIacControlLoop,
  validateIacCybersecurity,
} from "./control-system-architecture-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return { actorId: "iac-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D8_CONTEXT_AUTHORITY, ...overrides };
}

function identity(id: string) {
  return { citedLifecycleStage: "FEED" as const, provenanceRef: `prov-${id}`, sourceBasisRef: `basis-${id}`, applicability: `${id} identity scope`, limitations: "identity only" };
}

describe("EOS-D8-R5 control-system architecture context", () => {
  it("records supplied control-system context without configuring a system", () => {
    expect(D8_R1_R4_EXACT_REVISIONS_REUSED && EXACT_D8_R5_SOURCE_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D8_R5_SOURCE_REFERENCE_ALLOWED || D8_R5_SOURCE_AUTO_REPOINTED || FLOATING_D8_CONTROL_SYSTEM_NODE_REVISION_ALLOWED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(5);
    expect(D8_R4_RUNTIME_COUNT).toBe(4);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_SYSTEM_COUNT).toBe(0);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D8_PROCESS_MEASUREMENT_TAG_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_COUNT).toBe(1);
    expect(D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_IMPLEMENTED && D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY).toBe(true);
    expect(D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_COUNT).toBe(1);
    expect(D8_CANONICAL_OBJECT_TAXONOMY_REUSED).toBe(true);
    expect(D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED).toBe(false);
    expect(D8_CONTROL_SYSTEM_CONTEXT_IMPLEMENTED && D8_CONTROL_SYSTEM_TYPE_CONTEXT_SUPPORTED && D8_CONTROL_SYSTEM_NODE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(CONTROL_SYSTEM_CONTEXT_EQUALS_VALIDATED_CONTROL_SYSTEM_DESIGN || CONTROL_SYSTEM_CONTEXT_EQUALS_CONTROL_SYSTEM_CONFIGURATION || CONTROL_SYSTEM_CONTEXT_EQUALS_ENGINEERING_VALIDATED || SUPPLIED_CONTROL_SYSTEM_TYPE_EQUALS_VALIDATED_SYSTEM_SELECTION).toBe(false);
    expect(CONTROL_SYSTEM_NODE_CONTEXT_EQUALS_CONTROLLER_CONFIGURATION || CONTROL_SYSTEM_NODE_CONTEXT_EQUALS_VALIDATED_CONTROLLER_SELECTION).toBe(false);
    expect(EXACT_D8_CONTROL_SYSTEM_NODE_REVISION_REQUIRED && D8_EXPLICIT_CONTROL_SYSTEM_MEMBERSHIP_REQUIRED && EXACT_D8_CONTROL_SYSTEM_MEMBER_REVISION_REQUIRED && D8_SUPPLIED_CONTROL_SYSTEM_HIERARCHY_SUPPORTED).toBe(true);
    expect(D8_INFERRED_CONTROL_SYSTEM_MEMBERSHIP_ALLOWED || SUPPLIED_CONTROL_SYSTEM_HIERARCHY_EQUALS_VALIDATED_SYSTEM_ARCHITECTURE || D8_R5_AUTO_GENERATES_SYSTEM_HIERARCHY || D8_R5_AUTO_ASSIGNS_CONTROLLER || D8_R5_AUTO_ASSIGNS_SIGNAL_TO_CONTROLLER || D8_R5_AUTO_ASSIGNS_IO_TO_CONTROLLER).toBe(false);
    expect(EXACT_D8_R4_SIGNAL_REVISION_REQUIRED && EXACT_D8_R4_IO_REVISION_REQUIRED && EXACT_D8_R4_CONTROL_LOOP_REVISION_REQUIRED).toBe(true);
    expect(D8_R5_R4_SIGNAL_REFERENCE_AUTO_REPOINTED || D8_R5_R4_IO_REFERENCE_AUTO_REPOINTED || D8_R5_R4_LOOP_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(SIGNAL_TO_SYSTEM_RELATIONSHIP_EQUALS_VALIDATED_SYSTEM_CONFIGURATION || SIGNAL_TO_NODE_RELATIONSHIP_EQUALS_CONTROLLER_CONFIGURATION || IO_TO_SYSTEM_RELATIONSHIP_EQUALS_VALIDATED_IO_CONFIGURATION || IO_TO_CONTROLLER_RELATIONSHIP_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS || CONTROL_LOOP_TO_SYSTEM_RELATIONSHIP_EQUALS_VALIDATED_CONTROL_STRATEGY || CONTROL_LOOP_TO_CONTROLLER_RELATIONSHIP_EQUALS_CONTROL_LOGIC_IMPLEMENTED).toBe(false);
    expect(D8_HMI_CONTEXT_SUPPORTED && D8_CONTROL_PANEL_CONTEXT_SUPPORTED && D8_CONTROL_CABINET_CONTEXT_SUPPORTED && D8_MARSHALLING_CONTEXT_SUPPORTED && D8_NETWORK_INTERFACE_CONTEXT_IMPLEMENTED && D8_SUPPLIED_COMMUNICATION_PROTOCOL_CONTEXT_SUPPORTED && D8_OT_CYBERSECURITY_CONTEXT_SUPPORTED).toBe(true);
    expect(HMI_CONTEXT_EQUALS_HMI_CONFIGURATION || HMI_CONTEXT_EQUALS_VALIDATED_HMI_DESIGN || D8_R5_CONFIGURES_HMI || D8_R5_GENERATES_HMI_GRAPHICS).toBe(false);
    expect(CONTROL_PANEL_CONTEXT_EQUALS_VALIDATED_PANEL_DESIGN || CONTROL_PANEL_CONTEXT_EQUALS_PANEL_LAYOUT_DESIGN || CONTROL_CABINET_CONTEXT_EQUALS_VALIDATED_CABINET_DESIGN).toBe(false);
    expect(MARSHALLING_CONTEXT_EQUALS_VALIDATED_TERMINATION_DESIGN || MARSHALLING_CONTEXT_EQUALS_IO_ALLOCATION_PERFORMED_BY_EOS || D8_R5_PERFORMS_TERMINATION_DESIGN || D8_R5_AUTO_ASSIGNS_MARSHALLING_TERMINAL).toBe(false);
    expect(D8_EXPLICIT_NETWORK_ENDPOINTS_REQUIRED && EXACT_D8_NETWORK_ENDPOINT_REVISION_REQUIRED).toBe(true);
    expect(D8_INFERRED_NETWORK_ENDPOINTS_ALLOWED || NETWORK_CONTEXT_EQUALS_VALIDATED_NETWORK_DESIGN || NETWORK_CONTEXT_EQUALS_SECURE_NETWORK_DESIGN || NETWORK_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED || SUPPLIED_PROTOCOL_CONTEXT_EQUALS_VALIDATED_NETWORK_CONFIGURATION).toBe(false);
    expect(D8_R5_CONFIGURES_NETWORK || D8_R5_ASSIGNS_NETWORK_ADDRESS || D8_R5_PERFORMS_NETWORK_DESIGN || D8_R5_PERFORMS_NETWORK_OPTIMIZATION || D8_R5_PERFORMS_NETWORK_BANDWIDTH_CALCULATION || D8_R5_PERFORMS_NETWORK_REDUNDANCY_DESIGN).toBe(false);
    expect(OT_CYBERSECURITY_CONTEXT_EQUALS_CYBERSECURITY_VALIDATED || SECURITY_ZONE_CONTEXT_EQUALS_VALIDATED_SECURITY_ARCHITECTURE || D8_R5_PERFORMS_CYBERSECURITY_VALIDATION || D8_R5_DETERMINES_NETWORK_SECURITY_COMPLIANCE).toBe(false);
    expect(D8_R5_CONFIGURES_DCS || D8_R5_CONFIGURES_PLC || D8_R5_CONFIGURES_SIS || D8_R5_CONFIGURES_SCADA || D8_R5_CONFIGURES_RTU || D8_R5_PERFORMS_CONTROL_LOGIC_DESIGN || D8_R5_GENERATES_CONTROL_LOGIC || D8_R5_PERFORMS_CONTROL_LOOP_TUNING || D8_R5_PERFORMS_IO_ALLOCATION || D8_R5_AUTO_ASSIGNS_IO_CHANNEL || D8_R5_PERFORMS_CONTROLLER_SIZING || D8_R5_PERFORMS_FUNCTIONAL_SAFETY_ENGINEERING || D8_R5_AUTO_CREATES_ALARM_CONTEXT).toBe(false);
    expect([
      D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
      D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
      D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
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
    ]).toEqual(Array.from({ length: 13 }, () => 0));
    expect(D8_EQUALS_D6_PROCESS_AUTHORITY || D8_EQUALS_D7_ELECTRICAL_AUTHORITY || D6_PROCESS_REQUIREMENT_EQUALS_D8_CONTROL_SYSTEM_DESIGN || D6_CONTROL_REQUIREMENT_EQUALS_VALIDATED_D8_CONTROL_SYSTEM_ARCHITECTURE || D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN || D7_POWER_INTERFACE_EQUALS_D8_CONTROL_SYSTEM_DESIGN || D7_POWER_INTERFACE_EQUALS_VALIDATED_CONTROL_PANEL_DESIGN || D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN || D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D8_NETWORK_TOPOLOGY || AI_CAN_INVENT_AUTHORITATIVE_D8_CONTROLLER_ASSIGNMENT || AI_CAN_PROMOTE_D8_CONTROL_SYSTEM_CONTEXT_TO_VALIDATED_DESIGN || AI_CAN_PROMOTE_D8_NETWORK_CONTEXT_TO_SECURE_NETWORK_DESIGN).toBe(false);
    expect(D8_R5_SOURCE_BASIS_REQUIRED && D8_R5_HISTORY_PRESERVED && D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D8_CONTROL_SYSTEM_CONTEXT_AUTO_ACCEPTED || CROSS_TENANT_D8_R5_ACCESS_ALLOWED || SILENT_D8_R5_MUTATION_ALLOWED || D8_R5_AUTO_MUTATES_R1_IDENTITY || D8_R5_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT).toBe(false);
    expect(D8_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R5_REPLAY_PROTECTION_IMPLEMENTED && D8_R5_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D9_RUNTIME_STARTED || D8_R6_STARTED || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R5_STATUS).toBe("CONTROL_SYSTEM_ARCHITECTURE_CONTEXT_IMPLEMENTED");
    expect(D8_R5_CANONICAL_NEXT_PHASE).toBe("EOS-D8-R6-SAFETY-INTERLOCK-AND-SHUTDOWN-CONTEXT");
    expect(D8_R5_NEXT_PHASE_TYPE).toBe("SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT");

    const r1 = createD8R1Store();
    const who = actor();
    recordIacContext(r1, who, { contextId: "ctx-1", ...identity("ctx") });
    const point = recordIacObjectIdentity(r1, who, { objectId: "mp-101", contextId: "ctx-1", objectType: "IAC_MEASUREMENT_POINT", ...identity("mp-101") });
    const instrument = recordIacObjectIdentity(r1, who, { objectId: "pt-101", contextId: "ctx-1", objectType: "IAC_INSTRUMENT", ...identity("pt-101") });
    const signalObject = recordIacObjectIdentity(r1, who, { objectId: "sig-101", contextId: "ctx-1", objectType: "IAC_SIGNAL", ...identity("sig-101") });
    const ioObject = recordIacObjectIdentity(r1, who, { objectId: "io-101", contextId: "ctx-1", objectType: "IAC_IO_POINT", ...identity("io-101") });
    const loopObject = recordIacObjectIdentity(r1, who, { objectId: "lc-101", contextId: "ctx-1", objectType: "IAC_CONTROL_LOOP", ...identity("lc-101") });
    const systemObject = recordIacObjectIdentity(r1, who, { objectId: "sys-101", contextId: "ctx-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", ...identity("sys-101") });
    const nodeObject = recordIacObjectIdentity(r1, who, { objectId: "node-101", contextId: "ctx-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", ...identity("node-101") });
    const nodeOther = recordIacObjectIdentity(r1, who, { objectId: "node-102", contextId: "ctx-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", ...identity("node-102") });
    const hmiObject = recordIacObjectIdentity(r1, who, { objectId: "hmi-101", contextId: "ctx-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", ...identity("hmi-101") });
    const panelObject = recordIacObjectIdentity(r1, who, { objectId: "pnl-101", contextId: "ctx-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", ...identity("pnl-101") });
    const cabinetObject = recordIacObjectIdentity(r1, who, { objectId: "cab-101", contextId: "ctx-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", ...identity("cab-101") });
    const marshallingObject = recordIacObjectIdentity(r1, who, { objectId: "msh-101", contextId: "ctx-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", ...identity("msh-101") });
    const r2 = createD8R2Store(r1);
    const measured = recordProcessMeasurementContext(r2, who, { measurementRecordId: "meas-1", contextId: "ctx-1", objectId: point.objectId, objectRevisionFingerprint: point.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", provenanceRef: "prov-meas", sourceBasisRef: "basis-meas", applicability: "mp-101 measurement context", limitations: "context only" });
    const r3 = createD8R3Store(r2);
    const device = recordInstrumentDeviceContext(r3, who, { deviceRecordId: "dev-1", contextId: "ctx-1", objectId: instrument.objectId, objectRevisionFingerprint: instrument.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", deviceClass: "TRANSMITTER", serviceContext: "PROCESS_MEASUREMENT_SERVICE", provenanceRef: "prov-dev", sourceBasisRef: "basis-dev", applicability: "pt-101 device context", limitations: "device context only" });
    const r4 = createD8R4Store(r3);
    const signal = recordIacSignalContext(r4, who, { signalRecordId: "sig-rec-1", contextId: "ctx-1", objectId: signalObject.objectId, objectRevisionFingerprint: signalObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", signalType: "ANALOG_INPUT", signalDirection: "INPUT", sourceObjectId: instrument.objectId, sourceObjectRevisionFingerprint: instrument.fingerprint, destinationObjectId: ioObject.objectId, destinationObjectRevisionFingerprint: ioObject.fingerprint, measurementRecordId: measured.measurementRecordId, measurementRevisionFingerprint: measured.fingerprint, deviceRecordId: device.deviceRecordId, deviceRevisionFingerprint: device.fingerprint, provenanceRef: "prov-sig", sourceBasisRef: "basis-sig", applicability: "sig-101 signal context", limitations: "context only" });
    const io = recordIacIoContext(r4, who, { ioRecordId: "io-rec-1", contextId: "ctx-1", objectId: ioObject.objectId, objectRevisionFingerprint: ioObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", suppliedIoType: "ANALOG_INPUT", suppliedChannelReference: "CH-12 supplied", provenanceRef: "prov-io", sourceBasisRef: "basis-io", applicability: "io-101 io context", limitations: "supplied reference only" });
    const loop = recordIacControlLoopContext(r4, who, { loopRecordId: "loop-1", contextId: "ctx-1", objectId: loopObject.objectId, objectRevisionFingerprint: loopObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", loopPurpose: "REGULATORY_CONTROL", provenanceRef: "prov-loop", sourceBasisRef: "basis-loop", applicability: "lc-101 loop context", limitations: "context only" });
    const before = JSON.stringify({ objects: r1.objects, r1History: r1.history, measurements: r2.measurements, r2History: r2.history, devices: r3.devices, r3History: r3.history, signals: r4.signals, ioRecords: r4.ioRecords, loops: r4.loops, r4History: r4.history });
    const store = createD8R5Store(r4);
    const bound = { contextId: "ctx-1", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT" };
    const system = recordIacControlSystemContext(store, who, { ...bound, systemRecordId: "sys-rec-1", objectId: systemObject.objectId, objectRevisionFingerprint: systemObject.fingerprint, systemType: "DCS", provenanceRef: "prov-sys", sourceBasisRef: "basis-sys", applicability: "sys-101 system context", limitations: "context only" });
    const node = recordIacControlNodeContext(store, who, { ...bound, nodeRecordId: "node-rec-1", objectId: nodeObject.objectId, objectRevisionFingerprint: nodeObject.fingerprint, nodeRole: "CONTROLLER", provenanceRef: "prov-node", sourceBasisRef: "basis-node", applicability: "node-101 node context", limitations: "context only" });
    const other = recordIacControlNodeContext(store, who, { ...bound, nodeRecordId: "node-rec-2", objectId: nodeOther.objectId, objectRevisionFingerprint: nodeOther.fingerprint, nodeRole: "RTU_NODE", provenanceRef: "prov-node-2", sourceBasisRef: "basis-node-2", applicability: "node-102 node context", limitations: "context only" });
    const hierarchy = recordIacControlSystemHierarchy(store, who, { hierarchyId: "hier-1", parentRecordId: node.nodeRecordId, parentRevisionFingerprint: node.fingerprint, childRecordId: other.nodeRecordId, childRevisionFingerprint: other.fingerprint, kind: "SUPPLIED_PARENT", provenanceRef: "prov-hier", sourceBasisRef: "basis-hier", applicability: "node-102 supplied parent", limitations: "supplied hierarchy only" });
    expect(store.memberships).toEqual([]);
    expect(hierarchy.generatedByEos).toBe(false);
    expect(hierarchy.validatedArchitecture).toBe(false);
    const membership = recordIacControlSystemMembership(store, who, { membershipId: "mem-1", systemRecordId: system.systemRecordId, systemRevisionFingerprint: system.fingerprint, nodeRecordId: node.nodeRecordId, nodeRevisionFingerprint: node.fingerprint, kind: "SYSTEM_MEMBER", provenanceRef: "prov-mem", sourceBasisRef: "basis-mem", applicability: "sys-101 node member", limitations: "explicit only" });
    const hmi = recordIacSuppliedInterfaceContext(store, who, { ...bound, interfaceRecordId: "hmi-rec-1", objectId: hmiObject.objectId, objectRevisionFingerprint: hmiObject.fingerprint, interfaceKind: "HMI", suppliedReference: "supplied operator view", provenanceRef: "prov-hmi", sourceBasisRef: "basis-hmi", applicability: "hmi-101 hmi context", limitations: "context only" });
    const panel = recordIacSuppliedInterfaceContext(store, who, { ...bound, interfaceRecordId: "pnl-rec-1", objectId: panelObject.objectId, objectRevisionFingerprint: panelObject.fingerprint, interfaceKind: "CONTROL_PANEL", suppliedReference: "supplied panel reference", provenanceRef: "prov-pnl", sourceBasisRef: "basis-pnl", applicability: "pnl-101 panel context", limitations: "context only" });
    const cabinet = recordIacSuppliedInterfaceContext(store, who, { ...bound, interfaceRecordId: "cab-rec-1", objectId: cabinetObject.objectId, objectRevisionFingerprint: cabinetObject.fingerprint, interfaceKind: "CABINET", suppliedReference: "supplied cabinet reference", provenanceRef: "prov-cab", sourceBasisRef: "basis-cab", applicability: "cab-101 cabinet context", limitations: "context only" });
    const marshalling = recordIacSuppliedInterfaceContext(store, who, { ...bound, interfaceRecordId: "msh-rec-1", objectId: marshallingObject.objectId, objectRevisionFingerprint: marshallingObject.fingerprint, interfaceKind: "MARSHALLING", suppliedReference: "supplied marshalling reference", provenanceRef: "prov-msh", sourceBasisRef: "basis-msh", applicability: "msh-101 marshalling context", limitations: "context only" });
    const network = recordIacNetworkInterfaceContext(store, who, { networkRecordId: "net-1", sourceNodeRecordId: node.nodeRecordId, sourceNodeRevisionFingerprint: node.fingerprint, destinationNodeRecordId: other.nodeRecordId, destinationNodeRevisionFingerprint: other.fingerprint, suppliedSegmentReference: "supplied segment A", suppliedProtocolReference: "supplied Modbus reference", suppliedVendorReference: "supplied vendor reference", suppliedCybersecurityReference: "supplied zone reference", provenanceRef: "prov-net", sourceBasisRef: "basis-net", applicability: "node-101 node-102 network context", limitations: "supplied interface only" });
    const signalLink = recordIacControlSystemLink(store, who, { linkId: "link-sig", kind: "SIGNAL_TO_SYSTEM", targetRecordId: system.systemRecordId, targetRevisionFingerprint: system.fingerprint, memberRecordId: signal.signalRecordId, memberRevisionFingerprint: signal.fingerprint, provenanceRef: "prov-link", sourceBasisRef: "basis-link", applicability: "sys-101 signal link", limitations: "explicit only" });
    const ioLink = recordIacControlSystemLink(store, who, { linkId: "link-io", kind: "IO_TO_NODE", targetRecordId: node.nodeRecordId, targetRevisionFingerprint: node.fingerprint, memberRecordId: io.ioRecordId, memberRevisionFingerprint: io.fingerprint, provenanceRef: "prov-link", sourceBasisRef: "basis-link", applicability: "node-101 io link", limitations: "explicit only" });
    const loopLink = recordIacControlSystemLink(store, who, { linkId: "link-loop", kind: "LOOP_TO_SYSTEM", targetRecordId: system.systemRecordId, targetRevisionFingerprint: system.fingerprint, memberRecordId: loop.loopRecordId, memberRevisionFingerprint: loop.fingerprint, provenanceRef: "prov-link", sourceBasisRef: "basis-link", applicability: "sys-101 loop link", limitations: "explicit only" });
    expect(system.validatedDesign).toBe(false);
    expect(system.configured).toBe(false);
    expect(system.systemType).toBe("DCS");
    expect(node.controllerConfigured).toBe(false);
    expect(node.controllerSelected).toBe(false);
    expect(membership.inferred).toBe(false);
    expect(hmi.hmiConfigured).toBe(false);
    expect(hmi.graphicsGenerated).toBe(false);
    expect(panel.panelDesign).toBe(false);
    expect(cabinet.cabinetDesign).toBe(false);
    expect(marshalling.terminationDesign).toBe(false);
    expect(marshalling.allocatedByEos).toBe(false);
    expect(network.validatedNetworkDesign).toBe(false);
    expect(network.secureNetworkDesign).toBe(false);
    expect(network.cybersecurityValidated).toBe(false);
    expect(network.addressAssigned).toBe(false);
    expect(network.suppliedProtocolReference).toBe("supplied Modbus reference");
    expect(signalLink.validatedConfiguration).toBe(false);
    expect(ioLink.ioAllocated).toBe(false);
    expect(loopLink.controlLogic).toBe(false);
    expect(loopLink.validatedStrategy).toBe(false);
    const replay = recordIacControlSystemContext(store, who, { ...bound, systemRecordId: "sys-rec-1", objectId: systemObject.objectId, objectRevisionFingerprint: systemObject.fingerprint, systemType: "DCS", provenanceRef: "prov-sys", sourceBasisRef: "basis-sys", applicability: "sys-101 system context", limitations: "context only" });
    expect(replay.fingerprint).toBe(system.fingerprint);
    expect(store.systems).toHaveLength(1);

    const systemBase = { ...bound, objectId: systemObject.objectId, objectRevisionFingerprint: systemObject.fingerprint, systemType: "DCS", provenanceRef: "prov-sys", sourceBasisRef: "basis-sys", applicability: "sys-101 system context", limitations: "context only" };
    expect(() => recordIacControlSystemContext(store, who, { ...systemBase, systemRecordId: "sys-dup", systemType: "PLC" })).toThrow(/DUPLICATE_SYSTEM_REJECTED/);
    expect(store.systems[0].systemType).toBe("DCS");
    expect(() => recordIacControlSystemContext(store, who, { ...systemBase, systemRecordId: "sys-rec-1", systemType: "PLC", assertedFingerprint: system.fingerprint })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(store.systems[0].fingerprint).toBe(system.fingerprint);
    expect(() => recordIacControlSystemContext(store, who, { ...systemBase, systemRecordId: "sys-float", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordIacControlSystemContext(store, who, { ...systemBase, systemRecordId: "sys-type", systemType: "FIREWALL" })).toThrow(/SYSTEM_TYPE_NOT_ALLOWLISTED/);
    expect(() => recordIacControlSystemMembership(store, who, { membershipId: "mem-inferred", systemRecordId: system.systemRecordId, systemRevisionFingerprint: system.fingerprint, nodeRecordId: node.nodeRecordId, nodeRevisionFingerprint: node.fingerprint, kind: "naming_convention", provenanceRef: "prov-mem", sourceBasisRef: "basis-mem", applicability: "sys-101 node member", limitations: "explicit only" })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordIacControlSystemHierarchy(store, who, { hierarchyId: "hier-gen", parentRecordId: system.systemRecordId, parentRevisionFingerprint: system.fingerprint, childRecordId: other.nodeRecordId, childRevisionFingerprint: other.fingerprint, kind: "SUPPLIED_PARENT", autoGenerateHierarchy: true, provenanceRef: "prov-hier", sourceBasisRef: "basis-hier", applicability: "node-102 supplied parent", limitations: "supplied hierarchy only" })).toThrow(/HIERARCHY_GENERATION_NOT_IN_R5/);
    expect(() => recordIacControlSystemHierarchy(store, who, { hierarchyId: "hier-clash", parentRecordId: system.systemRecordId, parentRevisionFingerprint: system.fingerprint, childRecordId: other.nodeRecordId, childRevisionFingerprint: other.fingerprint, kind: "SUPPLIED_PARENT", provenanceRef: "prov-hier", sourceBasisRef: "basis-hier", applicability: "node-102 supplied parent", limitations: "supplied hierarchy only" })).toThrow(/CONFLICTING_HIERARCHY_REJECTED/);
    expect(store.hierarchies[0].parentRevisionFingerprint).toBe(node.fingerprint);
    expect(() => recordIacControlSystemLink(store, who, { linkId: "link-spoof", kind: "SIGNAL_TO_SYSTEM", targetRecordId: system.systemRecordId, targetRevisionFingerprint: system.fingerprint, memberRecordId: signal.signalRecordId, memberRevisionFingerprint: "spoofed", provenanceRef: "prov-link", sourceBasisRef: "basis-link", applicability: "sys-101 signal link", limitations: "explicit only" })).toThrow(/R4_SIGNAL_REVISION_MISMATCH/);
    expect(() => recordIacNetworkInterfaceContext(store, who, { networkRecordId: "net-address", sourceNodeRecordId: node.nodeRecordId, sourceNodeRevisionFingerprint: node.fingerprint, destinationNodeRecordId: other.nodeRecordId, destinationNodeRevisionFingerprint: other.fingerprint, networkAddress: "10.1.1.1", provenanceRef: "prov-net", sourceBasisRef: "basis-net", applicability: "node-101 node-102 network context", limitations: "supplied interface only" })).toThrow(/NETWORK_ADDRESS_NOT_IN_R5/);
    expect(() => recordIacSuppliedInterfaceContext(store, who, { ...bound, interfaceRecordId: "msh-term", objectId: marshallingObject.objectId, objectRevisionFingerprint: marshallingObject.fingerprint, interfaceKind: "MARSHALLING", marshallingTerminal: "TB-9", provenanceRef: "prov-msh", sourceBasisRef: "basis-msh", applicability: "msh-101 marshalling context", limitations: "context only" })).toThrow(/TERMINATION_DESIGN_NOT_IN_R5/);
    expect(() => recordIacControlSystemContext(store, who, { ...systemBase, systemRecordId: "sys-alarm", alarmContextId: "ALM-1" })).toThrow(/ALARM_CONTEXT_NOT_IN_R5/);
    expect(() => recordIacControlSystemContext(store, actor({ tenantId: "tenant-b" }), { ...systemBase, systemRecordId: "sys-cross" })).toThrow(/CROSS_SCOPE_OPERATION|R1_CONTEXT_NOT_FOUND/);
    expect(() => recordIacControlSystemContext(store, actor({ actorId: "AI-recorder", authority: "AI" }), { ...systemBase, systemRecordId: "sys-ai" })).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordIacControlSystemContext(store, actor({ authority: "ADMIN" }), { ...systemBase, systemRecordId: "sys-admin" })).toThrow(/ADMIN_NOT_IAC_AUTHORITY/);
    expect(() => configureIacDcs()).toThrow(/CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5/);
    expect(() => configureIacPlc()).toThrow(/CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5/);
    expect(() => configureIacSis()).toThrow(/CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5/);
    expect(() => configureIacScada()).toThrow(/CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5/);
    expect(() => configureIacRtu()).toThrow(/CONTROL_SYSTEM_CONFIGURATION_NOT_IN_R5/);
    expect(() => configureIacHmi()).toThrow(/HMI_CONFIGURATION_NOT_IN_R5/);
    expect(() => generateIacHmiGraphics()).toThrow(/HMI_CONFIGURATION_NOT_IN_R5/);
    expect(() => generateIacControlLogic()).toThrow(/CONTROL_LOGIC_NOT_IN_R5/);
    expect(() => tuneIacControlLoop()).toThrow(/LOOP_TUNING_NOT_IN_R5/);
    expect(() => allocateIacIo()).toThrow(/IO_ALLOCATION_NOT_IN_R5/);
    expect(() => designIacNetwork()).toThrow(/NETWORK_DESIGN_NOT_IN_R5/);
    expect(() => configureIacNetwork()).toThrow(/NETWORK_CONFIGURATION_NOT_IN_R5/);
    expect(() => validateIacCybersecurity()).toThrow(/CYBERSECURITY_VALIDATION_NOT_IN_R5/);
    expect(() => sizeIacController()).toThrow(/CONTROLLER_SIZING_NOT_IN_R5/);
    expect(() => assignIacMarshallingTerminal()).toThrow(/TERMINATION_DESIGN_NOT_IN_R5/);
    expect(() => createIacAlarmContext()).toThrow(/ALARM_CONTEXT_NOT_IN_R5/);
    expect(() => mutateIacSignalContext()).toThrow(/R4_MUTATION_REJECTED/);
    const revisedNetwork = recordIacNetworkInterfaceContext(store, who, { networkRecordId: "net-2", predecessorNetworkRecordId: network.networkRecordId, sourceNodeRecordId: node.nodeRecordId, sourceNodeRevisionFingerprint: node.fingerprint, destinationNodeRecordId: other.nodeRecordId, destinationNodeRevisionFingerprint: other.fingerprint, suppliedProtocolReference: "supplied OPC reference", suppliedCybersecurityReference: "supplied zone reference", provenanceRef: "prov-net", sourceBasisRef: "basis-net-r2", applicability: "node-101 node-102 network context", limitations: "supplied interface only" });
    expect(store.networks[0].suppliedProtocolReference).toBe("supplied Modbus reference");
    expect(store.networks[0].sourceNodeRevisionFingerprint).toBe(node.fingerprint);
    expect(store.networks[0].recordStatus).toBe("SUPERSEDED");
    expect(revisedNetwork.suppliedProtocolReference).toBe("supplied OPC reference");
    expect(JSON.stringify({ objects: r1.objects, r1History: r1.history, measurements: r2.measurements, r2History: r2.history, devices: r3.devices, r3History: r3.history, signals: r4.signals, ioRecords: r4.ioRecords, loops: r4.loops, r4History: r4.history })).toBe(before);
    const revised = recordIacObjectIdentity(r1, who, { objectId: "sys-101-r2", contextId: "ctx-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", ...identity("sys-101-r2"), predecessorObjectId: systemObject.objectId });
    expect(store.systems[0].objectRevisionFingerprint).toBe(systemObject.fingerprint);
    expect(store.links[0].memberRevisionFingerprint).toBe(signal.fingerprint);
    expect(r4.signals[0].fingerprint).toBe(signal.fingerprint);
    expect(r3.devices[0].fingerprint).toBe(device.fingerprint);
    expect(r2.measurements[0].fingerprint).toBe(measured.fingerprint);
    expect(revised.predecessorObjectId).toBe(systemObject.objectId);
    expect(r1.objects.find((row) => row.objectId === "sys-101")?.controlSystemContextEstablished).toBe(false);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R5.CONTROL_SYSTEM_ARCHITECTURE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R6.SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "control-system-architecture-context.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "control-system-architecture-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
