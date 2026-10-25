import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D8_CANONICAL_MILESTONE_COUNT, D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT, D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT as ARCHITECTURE_SAFETY_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD8R5Store, recordIacControlSystemContext } from "./control-system-architecture-context";
import { D8_CONTEXT_AUTHORITY, createD8R1Store, recordIacContext, recordIacObjectIdentity, type D8R1Actor } from "./identity-foundation";
import { createD8R3Store, recordInstrumentDeviceContext } from "./instrument-device-context";
import { createD8R2Store, recordProcessMeasurementContext } from "./process-measurement-tag-context";
import {
  AI_CAN_INVENT_AUTHORITATIVE_D8_ALARM_RELATIONSHIP,
  AI_CAN_INVENT_AUTHORITATIVE_D8_SIL_REQUIREMENT,
  AI_CAN_PROMOTE_D8_SAFETY_CONTEXT_TO_FUNCTIONAL_SAFETY_VALIDATED,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  ALARM_CONTEXT_EQUALS_ALARM_RATIONALIZATION_COMPLETE,
  ALARM_CONTEXT_EQUALS_VALIDATED_ALARM_DESIGN,
  BASISLESS_AUTHORITATIVE_D8_SAFETY_CONTEXT_AUTO_ACCEPTED,
  CAUSE_EFFECT_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED,
  CAUSE_EFFECT_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED,
  CROSS_TENANT_D8_R6_ACCESS_ALLOWED,
  D4_MECHANICAL_CONTEXT_EQUALS_D8_SAFETY_LOGIC,
  D5_PIPING_CONTEXT_EQUALS_D8_SAFETY_LOGIC,
  D6_ALARM_REQUIREMENT_EQUALS_VALIDATED_D8_ALARM_DESIGN,
  D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_SIS_IMPLEMENTATION,
  D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D8_ALARM_CONTEXT_IMPLEMENTED,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_CANONICAL_OBJECT_TAXONOMY_REUSED,
  D8_CAUSE_EFFECT_CONTEXT_SUPPORTED,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_ALARM_RELATIONSHIP_REQUIRED,
  D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_INFERRED_ALARM_RELATIONSHIP_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INTERLOCK_CONTEXT_IMPLEMENTED,
  D8_PERMISSIVE_CONTEXT_SUPPORTED,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_PROOF_TEST_EVIDENCE_CONTEXT_SUPPORTED,
  D8_R1_R5_EXACT_REVISIONS_REUSED,
  D8_R5_RUNTIME_COUNT,
  D8_R6_AUTO_ASSIGNS_ALARM_PRIORITY,
  D8_R6_AUTO_CONVERTS_CAUSE_EFFECT_TO_LOGIC,
  D8_R6_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT,
  D8_R6_CALCULATES_ALARM_PRIORITY,
  D8_R6_CANONICAL_NEXT_PHASE,
  D8_R6_CONFIGURES_DCS,
  D8_R6_CONFIGURES_SIS,
  D8_R6_DESIGNS_SIF_ARCHITECTURE,
  D8_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R6_GENERATES_SAFETY_LOGIC,
  D8_R6_HISTORY_PRESERVED,
  D8_R6_NEXT_PHASE_TYPE,
  D8_R6_PERFORMS_ALARM_RATIONALIZATION,
  D8_R6_PERFORMS_CYBERSECURITY_VALIDATION,
  D8_R6_PERFORMS_FUNCTIONAL_SAFETY_VALIDATION,
  D8_R6_PERFORMS_INTERLOCK_LOGIC_DESIGN,
  D8_R6_PERFORMS_NETWORK_DESIGN,
  D8_R6_PERFORMS_PFD_CALCULATION,
  D8_R6_PERFORMS_PFH_CALCULATION,
  D8_R6_PERFORMS_SHUTDOWN_LOGIC_DESIGN,
  D8_R6_PERFORMS_SIL_CALCULATION,
  D8_R6_PERFORMS_SIL_VERIFICATION,
  D8_R6_PERFORMS_TRIP_LOGIC_DESIGN,
  D8_R6_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R6_SOURCE_AUTO_REPOINTED,
  D8_R6_SOURCE_BASIS_REQUIRED,
  D8_R6_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R6_STATUS,
  D8_R7_STARTED,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_IMPLEMENTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SAFETY_REQUIREMENT_CONTEXT_SUPPORTED,
  D8_SHUTDOWN_CONTEXT_IMPLEMENTED,
  D8_SIF_CONTEXT_SUPPORTED,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_SUPPLIED_ALARM_PRIORITY_CONTEXT_SUPPORTED,
  D8_SUPPLIED_SIL_REQUIREMENT_CONTEXT_SUPPORTED,
  D8_TRIP_CONTEXT_IMPLEMENTED,
  D8_VENDOR_SAFETY_CERTIFICATION_CONTEXT_SUPPORTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D4_MECHANICAL_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D5_PIPING_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_PROCESS_SOURCE_REVISION_REQUIRED,
  EXACT_D7_ELECTRICAL_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D8_R1_IDENTITY_REVISION_REQUIRED,
  EXACT_D8_R2_MEASUREMENT_REVISION_REQUIRED,
  EXACT_D8_R4_SIGNAL_LOOP_REVISION_REQUIRED,
  EXACT_D8_R5_CONTROL_SYSTEM_REVISION_REQUIRED,
  EXACT_D8_R6_SOURCE_REVISION_REQUIRED,
  FLOATING_D8_R6_SOURCE_REFERENCE_ALLOWED,
  FUNCTIONAL_SAFETY_STANDARD_REFERENCE_EQUALS_COMPLIANCE,
  INTERLOCK_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED,
  NEW_DEPENDENCY_ADDED,
  PERMISSIVE_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED,
  PROOF_TEST_EVIDENCE_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  SAFETY_REQUIREMENT_CONTEXT_EQUALS_VALIDATED_SRS,
  SHUTDOWN_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED,
  SIF_CONTEXT_EQUALS_SIF_ARCHITECTURE_DESIGNED_BY_EOS,
  SIF_CONTEXT_EQUALS_SIF_VALIDATED,
  SIL_REQUIREMENT_EQUALS_SIL_CALCULATED_BY_EOS,
  SIL_REQUIREMENT_EQUALS_SIL_VERIFIED,
  SILENT_D8_R6_MUTATION_ALLOWED,
  TRIP_CONTEXT_EQUALS_VALIDATED_SHUTDOWN_LOGIC,
  VENDOR_SAFETY_CERTIFICATION_EQUALS_PROJECT_SAFETY_VALIDATION,
  calculateIacPfd,
  calculateIacSil,
  configureIacSisFromSafety,
  convertIacCauseEffectToLogic,
  createD8R6Store,
  designIacSifArchitecture,
  generateIacSafetyLogic,
  mutateIacControlSystemFromSafety,
  rationalizeIacAlarm,
  recordIacSafetyContext,
  recordIacSafetyRelationship,
  validateIacFunctionalSafety,
  verifyIacSil,
} from "./safety-interlock-shutdown-context";
import { createD8R4Store, recordIacControlLoopContext, recordIacIoContext, recordIacSignalContext } from "./signal-io-control-loop-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return { actorId: "iac-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D8_CONTEXT_AUTHORITY, ...overrides };
}

function identity(id: string) {
  return { citedLifecycleStage: "FEED" as const, provenanceRef: `prov-${id}`, sourceBasisRef: `basis-${id}`, applicability: `${id} identity scope`, limitations: "identity only" };
}

describe("EOS-D8-R6 safety interlock and shutdown context", () => {
  it("records supplied safety source context without implementing logic", () => {
    expect(D8_R1_R5_EXACT_REVISIONS_REUSED && EXACT_D8_R6_SOURCE_REVISION_REQUIRED && EXACT_D8_R1_IDENTITY_REVISION_REQUIRED && EXACT_D8_R2_MEASUREMENT_REVISION_REQUIRED && EXACT_D8_R4_SIGNAL_LOOP_REVISION_REQUIRED && EXACT_D8_R5_CONTROL_SYSTEM_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D8_R6_SOURCE_REFERENCE_ALLOWED || D8_R6_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(6);
    expect(D8_R5_RUNTIME_COUNT).toBe(5);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_SAFETY_COUNT).toBe(0);
    expect(D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY && D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY && D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY && D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY).toBe(true);
    expect(D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_IMPLEMENTED && D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY).toBe(true);
    expect(D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_COUNT).toBe(1);
    expect(D8_CANONICAL_OBJECT_TAXONOMY_REUSED).toBe(true);
    expect(D8_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED).toBe(false);
    expect(D8_ALARM_CONTEXT_IMPLEMENTED && D8_SUPPLIED_ALARM_PRIORITY_CONTEXT_SUPPORTED && D8_INTERLOCK_CONTEXT_IMPLEMENTED && D8_TRIP_CONTEXT_IMPLEMENTED && D8_SHUTDOWN_CONTEXT_IMPLEMENTED && D8_PERMISSIVE_CONTEXT_SUPPORTED && D8_CAUSE_EFFECT_CONTEXT_SUPPORTED).toBe(true);
    expect(ALARM_CONTEXT_EQUALS_ALARM_RATIONALIZATION_COMPLETE || ALARM_CONTEXT_EQUALS_VALIDATED_ALARM_DESIGN || D8_R6_CALCULATES_ALARM_PRIORITY || D8_R6_AUTO_ASSIGNS_ALARM_PRIORITY || D8_R6_PERFORMS_ALARM_RATIONALIZATION).toBe(false);
    expect(INTERLOCK_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED || TRIP_CONTEXT_EQUALS_VALIDATED_SHUTDOWN_LOGIC || SHUTDOWN_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED || PERMISSIVE_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED).toBe(false);
    expect(CAUSE_EFFECT_CONTEXT_EQUALS_CONTROL_LOGIC_IMPLEMENTED || CAUSE_EFFECT_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATED || D8_R6_AUTO_CONVERTS_CAUSE_EFFECT_TO_LOGIC).toBe(false);
    expect(D8_EXPLICIT_ALARM_RELATIONSHIP_REQUIRED).toBe(true);
    expect(D8_INFERRED_ALARM_RELATIONSHIP_ALLOWED).toBe(false);
    expect(D8_SIF_CONTEXT_SUPPORTED && D8_SUPPLIED_SIL_REQUIREMENT_CONTEXT_SUPPORTED && D8_SAFETY_REQUIREMENT_CONTEXT_SUPPORTED && D8_VENDOR_SAFETY_CERTIFICATION_CONTEXT_SUPPORTED && D8_PROOF_TEST_EVIDENCE_CONTEXT_SUPPORTED).toBe(true);
    expect(SIF_CONTEXT_EQUALS_SIF_VALIDATED || SIF_CONTEXT_EQUALS_SIF_ARCHITECTURE_DESIGNED_BY_EOS || SIL_REQUIREMENT_EQUALS_SIL_VERIFIED || SIL_REQUIREMENT_EQUALS_SIL_CALCULATED_BY_EOS || SAFETY_REQUIREMENT_CONTEXT_EQUALS_VALIDATED_SRS || VENDOR_SAFETY_CERTIFICATION_EQUALS_PROJECT_SAFETY_VALIDATION || PROOF_TEST_EVIDENCE_EQUALS_FUNCTIONAL_SAFETY_VALIDATION || FUNCTIONAL_SAFETY_STANDARD_REFERENCE_EQUALS_COMPLIANCE).toBe(false);
    expect(D8_R6_PERFORMS_SIL_CALCULATION || D8_R6_PERFORMS_SIL_VERIFICATION || D8_R6_PERFORMS_PFD_CALCULATION || D8_R6_PERFORMS_PFH_CALCULATION || D8_R6_DESIGNS_SIF_ARCHITECTURE || D8_R6_PERFORMS_FUNCTIONAL_SAFETY_VALIDATION || D8_R6_CONFIGURES_SIS).toBe(false);
    expect(D8_R6_PERFORMS_INTERLOCK_LOGIC_DESIGN || D8_R6_PERFORMS_TRIP_LOGIC_DESIGN || D8_R6_PERFORMS_SHUTDOWN_LOGIC_DESIGN || D8_R6_GENERATES_SAFETY_LOGIC || D8_R6_CONFIGURES_DCS || D8_R6_PERFORMS_NETWORK_DESIGN || D8_R6_PERFORMS_CYBERSECURITY_VALIDATION).toBe(false);
    expect([
      D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
      D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
      D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
      D8_SIL_CALCULATION_RUNTIME_COUNT,
      D8_SIL_VERIFICATION_RUNTIME_COUNT,
      D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
      D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
      D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
      D9_RUNTIME_COUNT,
    ]).toEqual(Array.from({ length: 9 }, () => 0));
    expect(EXACT_D6_PROCESS_SOURCE_REVISION_REQUIRED && EXACT_D7_ELECTRICAL_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED && EXACT_D4_MECHANICAL_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED && EXACT_D5_PIPING_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(D6_ALARM_REQUIREMENT_EQUALS_VALIDATED_D8_ALARM_DESIGN || D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN || D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION || D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN || D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION || D7_PROTECTION_CONTEXT_EQUALS_D8_SIS_IMPLEMENTATION || D4_MECHANICAL_CONTEXT_EQUALS_D8_SAFETY_LOGIC || D5_PIPING_CONTEXT_EQUALS_D8_SAFETY_LOGIC).toBe(false);
    expect(D8_EQUALS_D6_PROCESS_AUTHORITY || D8_EQUALS_D7_ELECTRICAL_AUTHORITY || D8_R6_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY || AI_CAN_INVENT_AUTHORITATIVE_D8_ALARM_RELATIONSHIP || AI_CAN_INVENT_AUTHORITATIVE_D8_SIL_REQUIREMENT || AI_CAN_PROMOTE_D8_SAFETY_CONTEXT_TO_FUNCTIONAL_SAFETY_VALIDATED).toBe(false);
    expect(D8_R6_SOURCE_BASIS_REQUIRED && D8_R6_HISTORY_PRESERVED && D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D8_SAFETY_CONTEXT_AUTO_ACCEPTED || CROSS_TENANT_D8_R6_ACCESS_ALLOWED || SILENT_D8_R6_MUTATION_ALLOWED).toBe(false);
    expect(D8_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R6_REPLAY_PROTECTION_IMPLEMENTED && D8_R6_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D9_RUNTIME_STARTED || D8_R7_STARTED || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R6_STATUS).toBe("SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT_IMPLEMENTED");
    expect(D8_R6_CANONICAL_NEXT_PHASE).toBe("EOS-D8-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE");
    expect(D8_R6_NEXT_PHASE_TYPE).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE");

    const r1 = createD8R1Store();
    const who = actor();
    recordIacContext(r1, who, { contextId: "ctx-1", ...identity("ctx") });
    const point = recordIacObjectIdentity(r1, who, { objectId: "mp-101", contextId: "ctx-1", objectType: "IAC_MEASUREMENT_POINT", ...identity("mp-101") });
    const instrument = recordIacObjectIdentity(r1, who, { objectId: "pt-101", contextId: "ctx-1", objectType: "IAC_INSTRUMENT", ...identity("pt-101") });
    const signalObject = recordIacObjectIdentity(r1, who, { objectId: "sig-101", contextId: "ctx-1", objectType: "IAC_SIGNAL", ...identity("sig-101") });
    const ioObject = recordIacObjectIdentity(r1, who, { objectId: "io-101", contextId: "ctx-1", objectType: "IAC_IO_POINT", ...identity("io-101") });
    const loopObject = recordIacObjectIdentity(r1, who, { objectId: "lc-101", contextId: "ctx-1", objectType: "IAC_CONTROL_LOOP", ...identity("lc-101") });
    const systemObject = recordIacObjectIdentity(r1, who, { objectId: "sys-101", contextId: "ctx-1", objectType: "IAC_CONTROL_SYSTEM_CONTEXT", ...identity("sys-101") });
    const alarmObject = recordIacObjectIdentity(r1, who, { objectId: "alm-101", contextId: "ctx-1", objectType: "IAC_ALARM_CONTEXT", ...identity("alm-101") });
    const interlockObject = recordIacObjectIdentity(r1, who, { objectId: "ilk-101", contextId: "ctx-1", objectType: "IAC_INTERLOCK_CONTEXT", ...identity("ilk-101") });
    const permissiveObject = recordIacObjectIdentity(r1, who, { objectId: "prm-101", contextId: "ctx-1", objectType: "IAC_INTERLOCK_CONTEXT", ...identity("prm-101") });
    const tripObject = recordIacObjectIdentity(r1, who, { objectId: "trp-101", contextId: "ctx-1", objectType: "IAC_SHUTDOWN_CONTEXT", ...identity("trp-101") });
    const shutdownObject = recordIacObjectIdentity(r1, who, { objectId: "sd-101", contextId: "ctx-1", objectType: "IAC_SHUTDOWN_CONTEXT", ...identity("sd-101") });
    const causeObject = recordIacObjectIdentity(r1, who, { objectId: "ce-101", contextId: "ctx-1", objectType: "IAC_CAUSE_EFFECT_CONTEXT", ...identity("ce-101") });
    const sifObject = recordIacObjectIdentity(r1, who, { objectId: "sif-101", contextId: "ctx-1", objectType: "IAC_FUNCTIONAL_SAFETY_CONTEXT", ...identity("sif-101") });
    const silObject = recordIacObjectIdentity(r1, who, { objectId: "sil-101", contextId: "ctx-1", objectType: "IAC_FUNCTIONAL_SAFETY_CONTEXT", ...identity("sil-101") });
    const requirementObject = recordIacObjectIdentity(r1, who, { objectId: "srs-101", contextId: "ctx-1", objectType: "IAC_FUNCTIONAL_SAFETY_CONTEXT", ...identity("srs-101") });
    const vendorObject = recordIacObjectIdentity(r1, who, { objectId: "ven-101", contextId: "ctx-1", objectType: "IAC_FUNCTIONAL_SAFETY_CONTEXT", ...identity("ven-101") });
    const proofObject = recordIacObjectIdentity(r1, who, { objectId: "prf-101", contextId: "ctx-1", objectType: "IAC_FUNCTIONAL_SAFETY_CONTEXT", ...identity("prf-101") });
    const standardObject = recordIacObjectIdentity(r1, who, { objectId: "std-101", contextId: "ctx-1", objectType: "IAC_FUNCTIONAL_SAFETY_CONTEXT", ...identity("std-101") });
    const r2 = createD8R2Store(r1);
    const measured = recordProcessMeasurementContext(r2, who, { measurementRecordId: "meas-1", contextId: "ctx-1", objectId: point.objectId, objectRevisionFingerprint: point.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", provenanceRef: "prov-meas", sourceBasisRef: "basis-meas", applicability: "mp-101 measurement context", limitations: "context only" });
    const r3 = createD8R3Store(r2);
    const device = recordInstrumentDeviceContext(r3, who, { deviceRecordId: "dev-1", contextId: "ctx-1", objectId: instrument.objectId, objectRevisionFingerprint: instrument.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", deviceClass: "TRANSMITTER", serviceContext: "PROCESS_MEASUREMENT_SERVICE", provenanceRef: "prov-dev", sourceBasisRef: "basis-dev", applicability: "pt-101 device context", limitations: "device context only" });
    const r4 = createD8R4Store(r3);
    const signal = recordIacSignalContext(r4, who, { signalRecordId: "sig-rec-1", contextId: "ctx-1", objectId: signalObject.objectId, objectRevisionFingerprint: signalObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", signalType: "ANALOG_INPUT", signalDirection: "INPUT", sourceObjectId: instrument.objectId, sourceObjectRevisionFingerprint: instrument.fingerprint, destinationObjectId: ioObject.objectId, destinationObjectRevisionFingerprint: ioObject.fingerprint, measurementRecordId: measured.measurementRecordId, measurementRevisionFingerprint: measured.fingerprint, deviceRecordId: device.deviceRecordId, deviceRevisionFingerprint: device.fingerprint, provenanceRef: "prov-sig", sourceBasisRef: "basis-sig", applicability: "sig-101 signal context", limitations: "context only" });
    recordIacIoContext(r4, who, { ioRecordId: "io-rec-1", contextId: "ctx-1", objectId: ioObject.objectId, objectRevisionFingerprint: ioObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", suppliedIoType: "ANALOG_INPUT", suppliedChannelReference: "CH-12 supplied", provenanceRef: "prov-io", sourceBasisRef: "basis-io", applicability: "io-101 io context", limitations: "supplied reference only" });
    const loop = recordIacControlLoopContext(r4, who, { loopRecordId: "loop-1", contextId: "ctx-1", objectId: loopObject.objectId, objectRevisionFingerprint: loopObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", loopPurpose: "REGULATORY_CONTROL", provenanceRef: "prov-loop", sourceBasisRef: "basis-loop", applicability: "lc-101 loop context", limitations: "context only" });
    const r5 = createD8R5Store(r4);
    const system = recordIacControlSystemContext(r5, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", systemRecordId: "sys-rec-1", objectId: systemObject.objectId, objectRevisionFingerprint: systemObject.fingerprint, systemType: "DCS", provenanceRef: "prov-sys", sourceBasisRef: "basis-sys", applicability: "sys-101 system context", limitations: "context only" });
    const before = JSON.stringify({ objects: r1.objects, measurements: r2.measurements, devices: r3.devices, signals: r4.signals, loops: r4.loops, systems: r5.systems, r5History: r5.history });
    const store = createD8R6Store(r5);
    const bound = { contextId: "ctx-1", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT" };
    const upstream = { d6SourceId: "d6-alarm-1", d6SourceRevisionFingerprint: "fp-d6-alarm", d6Subject: "ALARM_OR_TRIP_PROCESS_INTENT", d7SourceId: "d7-trip-1", d7SourceRevisionFingerprint: "fp-d7-trip", d7Subject: "TRIP_OR_INTERLOCK_ELECTRICAL_CONTEXT", d4SourceId: "d4-trip-1", d4SourceRevisionFingerprint: "fp-d4-trip", d4Subject: "TRIP_OR_ALARM_INTERFACES", d5SourceId: "d5-inline-1", d5SourceRevisionFingerprint: "fp-d5-inline", d5Subject: "INLINE_INSTRUMENT" };
    const alarm = recordIacSafetyContext(store, who, { ...bound, ...upstream, contextRecordId: "alm-rec-1", objectId: alarmObject.objectId, objectRevisionFingerprint: alarmObject.fingerprint, kind: "ALARM", suppliedPriority: "supplied high", provenanceRef: "prov-alm", sourceBasisRef: "basis-alm", applicability: "alm-101 alarm context", limitations: "context only" });
    const interlock = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "ilk-rec-1", objectId: interlockObject.objectId, objectRevisionFingerprint: interlockObject.fingerprint, kind: "INTERLOCK", suppliedReference: "supplied interlock intent", provenanceRef: "prov-ilk", sourceBasisRef: "basis-ilk", applicability: "ilk-101 interlock context", limitations: "intent only" });
    const permissive = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "prm-rec-1", objectId: permissiveObject.objectId, objectRevisionFingerprint: permissiveObject.fingerprint, kind: "PERMISSIVE", provenanceRef: "prov-prm", sourceBasisRef: "basis-prm", applicability: "prm-101 permissive context", limitations: "intent only" });
    const trip = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "trp-rec-1", objectId: tripObject.objectId, objectRevisionFingerprint: tripObject.fingerprint, kind: "TRIP", provenanceRef: "prov-trp", sourceBasisRef: "basis-trp", applicability: "trp-101 trip context", limitations: "intent only" });
    const shutdown = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "sd-rec-1", objectId: shutdownObject.objectId, objectRevisionFingerprint: shutdownObject.fingerprint, kind: "SHUTDOWN", provenanceRef: "prov-sd", sourceBasisRef: "basis-sd", applicability: "sd-101 shutdown context", limitations: "intent only" });
    const cause = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "ce-rec-1", objectId: causeObject.objectId, objectRevisionFingerprint: causeObject.fingerprint, kind: "CAUSE_EFFECT", suppliedReference: "supplied cause and effect sheet", provenanceRef: "prov-ce", sourceBasisRef: "basis-ce", applicability: "ce-101 cause context", limitations: "source only" });
    const sif = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "sif-rec-1", objectId: sifObject.objectId, objectRevisionFingerprint: sifObject.fingerprint, kind: "SIF", suppliedReference: "supplied SIF source reference", provenanceRef: "prov-sif", sourceBasisRef: "basis-sif", applicability: "sif-101 sif context", limitations: "source only" });
    const sil = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "sil-rec-1", objectId: silObject.objectId, objectRevisionFingerprint: silObject.fingerprint, kind: "SIL_REQUIREMENT", suppliedSilRequirement: "SIL 2 supplied", provenanceRef: "prov-sil", sourceBasisRef: "basis-sil", applicability: "sil-101 sil context", limitations: "supplied requirement only" });
    const requirement = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "srs-rec-1", objectId: requirementObject.objectId, objectRevisionFingerprint: requirementObject.fingerprint, kind: "SAFETY_REQUIREMENT", suppliedReference: "supplied SRS reference", provenanceRef: "prov-srs", sourceBasisRef: "basis-srs", applicability: "srs-101 requirement context", limitations: "source only" });
    const vendor = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "ven-rec-1", objectId: vendorObject.objectId, objectRevisionFingerprint: vendorObject.fingerprint, kind: "VENDOR_CERTIFICATION", suppliedReference: "supplied vendor certificate reference", provenanceRef: "prov-ven", sourceBasisRef: "basis-ven", applicability: "ven-101 vendor context", limitations: "evidence only" });
    const proof = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "prf-rec-1", objectId: proofObject.objectId, objectRevisionFingerprint: proofObject.fingerprint, kind: "PROOF_TEST", suppliedReference: "supplied proof-test evidence reference", provenanceRef: "prov-prf", sourceBasisRef: "basis-prf", applicability: "prf-101 proof context", limitations: "evidence only" });
    const standard = recordIacSafetyContext(store, who, { ...bound, contextRecordId: "std-rec-1", objectId: standardObject.objectId, objectRevisionFingerprint: standardObject.fingerprint, kind: "STANDARD_REFERENCE", suppliedReference: "supplied IEC 61511 reference", provenanceRef: "prov-std", sourceBasisRef: "basis-std", applicability: "std-101 standard context", limitations: "reference only" });
    const alarmLink = recordIacSafetyRelationship(store, who, { relationshipId: "rel-alm", kind: "ALARM", subjectRecordId: alarm.contextRecordId, subjectRevisionFingerprint: alarm.fingerprint, endpointKind: "MEASUREMENT", endpointRecordId: measured.measurementRecordId, endpointRevisionFingerprint: measured.fingerprint, provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "alm-101 mp-101 alarm link", limitations: "explicit only" });
    const interlockLink = recordIacSafetyRelationship(store, who, { relationshipId: "rel-ilk", kind: "INTERLOCK", subjectRecordId: interlock.contextRecordId, subjectRevisionFingerprint: interlock.fingerprint, endpointKind: "SIGNAL", endpointRecordId: signal.signalRecordId, endpointRevisionFingerprint: signal.fingerprint, provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "ilk-101 sig-101 interlock link", limitations: "explicit only" });
    const tripLink = recordIacSafetyRelationship(store, who, { relationshipId: "rel-trp", kind: "TRIP", subjectRecordId: trip.contextRecordId, subjectRevisionFingerprint: trip.fingerprint, endpointKind: "LOOP", endpointRecordId: loop.loopRecordId, endpointRevisionFingerprint: loop.fingerprint, provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "trp-101 lc-101 trip link", limitations: "explicit only" });
    const shutdownLink = recordIacSafetyRelationship(store, who, { relationshipId: "rel-sd", kind: "SHUTDOWN", subjectRecordId: shutdown.contextRecordId, subjectRevisionFingerprint: shutdown.fingerprint, endpointKind: "CONTROL_SYSTEM", endpointRecordId: system.systemRecordId, endpointRevisionFingerprint: system.fingerprint, provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "sd-101 sys-101 shutdown link", limitations: "explicit only" });
    expect(alarm.alarmRationalized).toBe(false);
    expect(alarm.priorityValidated).toBe(false);
    expect(alarm.priorityCalculated).toBe(false);
    expect(alarm.suppliedPriority).toBe("supplied high");
    expect(alarm.d6.sourceRevisionFingerprint).toBe("fp-d6-alarm");
    expect(alarm.d6AlarmEqualsValidatedDesign).toBe(false);
    expect(alarm.d7EqualsSisImplementation).toBe(false);
    expect(alarm.d4EqualsSafetyLogic).toBe(false);
    expect(alarm.d5EqualsSafetyLogic).toBe(false);
    expect(interlock.logicImplemented).toBe(false);
    expect(permissive.validatedPermissiveLogic).toBe(false);
    expect(trip.validatedShutdownLogic).toBe(false);
    expect(shutdown.functionalSafetyValidated).toBe(false);
    expect(cause.causeEffectConvertedToLogic).toBe(false);
    expect(cause.validatedLogicDesign).toBe(false);
    expect(sif.sifValidated).toBe(false);
    expect(sif.sifArchitectureDesignedByEos).toBe(false);
    expect(sil.silVerified).toBe(false);
    expect(sil.silCalculatedByEos).toBe(false);
    expect(sil.suppliedSilRequirement).toBe("SIL 2 supplied");
    expect(requirement.validatedSrs).toBe(false);
    expect(vendor.vendorEqualsProjectValidation).toBe(false);
    expect(proof.proofTestEqualsValidation).toBe(false);
    expect(proof.proofTestEqualsSifValidated).toBe(false);
    expect(standard.standardEqualsCompliance).toBe(false);
    expect(alarmLink.inferred).toBe(false);
    expect(interlockLink.logicImplemented).toBe(false);
    expect(tripLink.endpointRevisionFingerprint).toBe(loop.fingerprint);
    expect(shutdownLink.endpointObjectId).toBe("sys-101");
    const replay = recordIacSafetyContext(store, who, { ...bound, ...upstream, contextRecordId: "alm-rec-1", objectId: alarmObject.objectId, objectRevisionFingerprint: alarmObject.fingerprint, kind: "ALARM", suppliedPriority: "supplied high", provenanceRef: "prov-alm", sourceBasisRef: "basis-alm", applicability: "alm-101 alarm context", limitations: "context only" });
    expect(replay.fingerprint).toBe(alarm.fingerprint);
    expect(store.contexts.filter((row) => row.kind === "ALARM")).toHaveLength(1);

    const alarmBase = { ...bound, ...upstream, objectId: alarmObject.objectId, objectRevisionFingerprint: alarmObject.fingerprint, kind: "ALARM", suppliedPriority: "supplied high", provenanceRef: "prov-alm", sourceBasisRef: "basis-alm", applicability: "alm-101 alarm context", limitations: "context only" };
    expect(() => recordIacSafetyContext(store, who, { ...alarmBase, contextRecordId: "alm-dup" })).toThrow(/DUPLICATE_SAFETY_CONTEXT_REJECTED/);
    expect(() => recordIacSafetyContext(store, who, { ...alarmBase, contextRecordId: "alm-rec-1", suppliedPriority: "supplied low", assertedFingerprint: alarm.fingerprint })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(store.contexts[0].fingerprint).toBe(alarm.fingerprint);
    expect(() => recordIacSafetyContext(store, who, { ...alarmBase, contextRecordId: "alm-float", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordIacSafetyContext(store, who, { ...alarmBase, contextRecordId: "alm-d6", d6SourceRevisionFingerprint: "latest" })).toThrow(/D6_SOURCE_REVISION_REQUIRED/);
    expect(() => recordIacSafetyContext(store, who, { ...alarmBase, contextRecordId: "alm-d7", d7SourceRevisionFingerprint: undefined })).toThrow(/D7_SOURCE_REVISION_REQUIRED/);
    expect(() => recordIacSafetyContext(store, who, { ...alarmBase, contextRecordId: "alm-repoint", autoRepointD6: true })).toThrow(/D6_SOURCE_AUTO_REPOINT_REJECTED/);
    expect(() => recordIacSafetyContext(store, who, { ...bound, contextRecordId: "bad-kind", objectId: signalObject.objectId, objectRevisionFingerprint: signalObject.fingerprint, kind: "ALARM", provenanceRef: "prov-bad", sourceBasisRef: "basis-bad", applicability: "sig-101 alarm context", limitations: "context only" })).toThrow(/OBJECT_TYPE_NOT_SAFETY_KIND/);
    expect(() => recordIacSafetyRelationship(store, who, { relationshipId: "rel-infer", kind: "tag_name", subjectRecordId: alarm.contextRecordId, subjectRevisionFingerprint: alarm.fingerprint, endpointKind: "MEASUREMENT", endpointRecordId: measured.measurementRecordId, endpointRevisionFingerprint: measured.fingerprint, provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "alm-101 mp-101 alarm link", limitations: "explicit only" })).toThrow(/RELATIONSHIP_KIND_NOT_ALLOWLISTED/);
    expect(() => recordIacSafetyRelationship(store, who, { relationshipId: "rel-spoof", kind: "ALARM", subjectRecordId: alarm.contextRecordId, subjectRevisionFingerprint: alarm.fingerprint, endpointKind: "MEASUREMENT", endpointRecordId: measured.measurementRecordId, endpointRevisionFingerprint: "spoofed", provenanceRef: "prov-rel", sourceBasisRef: "basis-rel", applicability: "alm-101 mp-101 alarm link", limitations: "explicit only" })).toThrow(/MEASUREMENT_REVISION_MISMATCH/);
    expect(() => recordIacSafetyContext(store, who, { ...alarmBase, contextRecordId: "alm-pfd", pfdValue: "0.01" })).toThrow(/PFD_CALCULATION_NOT_IN_R6/);
    expect(() => recordIacSafetyContext(store, who, { ...alarmBase, contextRecordId: "alm-sis", configureSis: true })).toThrow(/SIS_CONFIGURATION_NOT_IN_R6/);
    expect(() => recordIacSafetyContext(store, actor({ tenantId: "tenant-b" }), { ...alarmBase, contextRecordId: "alm-cross" })).toThrow(/CROSS_SCOPE_OPERATION|R1_CONTEXT_NOT_FOUND/);
    expect(() => recordIacSafetyContext(store, actor({ actorId: "AI-recorder", authority: "AI" }), { ...alarmBase, contextRecordId: "alm-ai" })).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordIacSafetyContext(store, actor({ authority: "ADMIN" }), { ...alarmBase, contextRecordId: "alm-admin" })).toThrow(/ADMIN_NOT_IAC_AUTHORITY/);
    expect(() => rationalizeIacAlarm()).toThrow(/ALARM_RATIONALIZATION_NOT_IN_R6/);
    expect(() => calculateIacSil()).toThrow(/SIL_CALCULATION_NOT_IN_R6/);
    expect(() => verifyIacSil()).toThrow(/SIL_CALCULATION_NOT_IN_R6/);
    expect(() => calculateIacPfd()).toThrow(/PFD_CALCULATION_NOT_IN_R6/);
    expect(() => designIacSifArchitecture()).toThrow(/SIF_DESIGN_NOT_IN_R6/);
    expect(() => configureIacSisFromSafety()).toThrow(/SIS_CONFIGURATION_NOT_IN_R6/);
    expect(() => generateIacSafetyLogic()).toThrow(/SAFETY_LOGIC_NOT_IN_R6/);
    expect(() => convertIacCauseEffectToLogic()).toThrow(/CAUSE_EFFECT_TO_LOGIC_NOT_IN_R6/);
    expect(() => validateIacFunctionalSafety()).toThrow(/FUNCTIONAL_SAFETY_VALIDATION_NOT_IN_R6/);
    expect(() => mutateIacControlSystemFromSafety()).toThrow(/R5_MUTATION_REJECTED/);
    const revised = recordIacSafetyContext(store, who, { ...bound, ...upstream, d6SourceRevisionFingerprint: "fp-d6-alarm-r2", contextRecordId: "alm-rec-2", predecessorContextRecordId: alarm.contextRecordId, objectId: alarmObject.objectId, objectRevisionFingerprint: alarmObject.fingerprint, kind: "ALARM", suppliedPriority: "supplied low", provenanceRef: "prov-alm", sourceBasisRef: "basis-alm-r2", applicability: "alm-101 alarm context", limitations: "context only" });
    expect(store.contexts[0].suppliedPriority).toBe("supplied high");
    expect(store.contexts[0].d6.sourceRevisionFingerprint).toBe("fp-d6-alarm");
    expect(store.contexts[0].recordStatus).toBe("SUPERSEDED");
    expect(revised.suppliedPriority).toBe("supplied low");
    expect(JSON.stringify({ objects: r1.objects, measurements: r2.measurements, devices: r3.devices, signals: r4.signals, loops: r4.loops, systems: r5.systems, r5History: r5.history })).toBe(before);
    const revisedObject = recordIacObjectIdentity(r1, who, { objectId: "alm-101-r2", contextId: "ctx-1", objectType: "IAC_ALARM_CONTEXT", ...identity("alm-101-r2"), predecessorObjectId: alarmObject.objectId });
    expect(store.contexts[0].objectRevisionFingerprint).toBe(alarmObject.fingerprint);
    expect(revised.objectRevisionFingerprint).toBe(alarmObject.fingerprint);
    expect(r4.signals[0].fingerprint).toBe(signal.fingerprint);
    expect(r5.systems[0].fingerprint).toBe(system.fingerprint);
    expect(r3.devices[0].fingerprint).toBe(device.fingerprint);
    expect(r2.measurements[0].fingerprint).toBe(measured.fingerprint);
    expect(revisedObject.predecessorObjectId).toBe(alarmObject.objectId);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R6.SAFETY_INTERLOCK_AND_SHUTDOWN_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "safety-interlock-shutdown-context.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "safety-interlock-shutdown-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
