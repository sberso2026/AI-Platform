import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT as ARCHITECTURE_INTERFACE_COUNT, D6_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_CONTEXT_AUTHORITY, createD2R1Store, recordCivilContext, recordCivilObjectIdentity } from "../civil/identity-foundation";
import { D3_CONTEXT_AUTHORITY, createD3R1Store, recordGeotechnicalContext, recordGeotechnicalObjectIdentity } from "../geotechnical/identity-foundation";
import { D4_CONTEXT_AUTHORITY, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity } from "../mechanical/identity-foundation";
import { D5_CONTEXT_AUTHORITY, createD5R1Store, recordPipingContext, recordPipingObjectIdentity } from "../piping/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D6_CONTEXT_AUTHORITY, createD6R1Store, recordProcessContext, recordProcessObjectIdentity } from "./identity-foundation";
import { createD6R2Store, recordProcessStreamContext } from "./system-stream-service-context";
import { createD6R3Store, recordProcessOperatingCaseContext, recordProcessOperatingCondition } from "./operating-design-basis-conditions";
import { createD6R4Store, recordProcessCalculationEvidence } from "./process-evidence-balances";
import { createD6R5Store, recordProcessEquipmentDutyContext } from "./equipment-duty-utility-context";
import { createD6R6Store, recordProcessSafetyContext } from "./process-safety-relief-context";
import { D6_R8_STARTED, D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT as R7_INTERFACE_COUNT, D6_RUNTIME_COUNT as R7_RUNTIME_COUNT, createD6R7Store, recordProcessChange, recordProcessReassessment, recordProcessSourceRequirement } from "./requirements-assumptions-change";
import {
  ADMIN_CAN_PROMOTE_D6_HANDOFF_TO_COUNTERPART_VALIDATION,
  AI_CAN_INVENT_D6_INTERFACE_COUNTERPART,
  AI_CAN_INVENT_D6_INTERFACE_RELATIONSHIP,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D6_R8_HANDOFF_AUTO_ACCEPTED,
  CROSS_TENANT_D6_R8_ACCESS_ALLOWED,
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
  D6_APPROVAL_RUNTIME_COUNT,
  D6_AUTO_MUTATES_D4_COUNTERPART,
  D6_AUTO_MUTATES_D5_COUNTERPART,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D1_D3_INTERFACE_REFERENCE_SUPPORTED_WHERE_CANONICAL,
  D6_D4_HANDOFF_IMPLEMENTED,
  D6_D4_HANDOFF_TRANSFERS_MECHANICAL_AUTHORITY,
  D6_D4_HANDOFF_VALIDATES_MECHANICAL_ENGINEERING,
  D6_D5_CONTRACT_COMPATIBLE_WITH_EXISTING_D5_R8_CONTRACT,
  D6_D5_HANDOFF_IMPLEMENTED,
  D6_D5_HANDOFF_TRANSFERS_PIPING_AUTHORITY,
  D6_D5_HANDOFF_VALIDATES_PIPING_ENGINEERING,
  D6_D7_HANDOFF_CONTRACT_IMPLEMENTED,
  D6_D7_HANDOFF_CREATES_ELECTRICAL_DESIGN,
  D6_D7_HANDOFF_TRANSFERS_ELECTRICAL_AUTHORITY,
  D6_D7_RUNTIME_INTEGRATION_COUNT,
  D6_D8_HANDOFF_CONTRACT_IMPLEMENTED,
  D6_D8_HANDOFF_CREATES_IAC_DESIGN,
  D6_D8_HANDOFF_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D6_D8_HANDOFF_TRANSFERS_IAC_AUTHORITY,
  D6_D8_RUNTIME_INTEGRATION_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED,
  D6_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_READY,
  D6_EXPLICIT_COUNTERPART_REFERENCE_REQUIRED,
  D6_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_APPROVED,
  D6_HANDOFF_COMPLETED_EQUALS_COUNTERPART_VALIDATED,
  D6_HANDOFF_CONTENT_EQUALS_COUNTERPART_ENGINEERING_TRUTH,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_INFERRED_COUNTERPART_ALLOWED,
  D6_INTERFACE_CHANGE_AUTO_MUTATES_COUNTERPART,
  D6_INTERFACE_CHANGE_AUTO_RECALCULATES_COUNTERPART,
  D6_INTERFACE_CHANGE_AUTO_REPOINTS_COUNTERPART,
  D6_INTERFACE_CHANGE_AUTO_REVALIDATES_COUNTERPART,
  D6_INTERFACE_COUNTERPART_AUTHORITY_PRESERVED,
  D6_INTERFACE_COUNTERPART_AUTO_REPOINTED,
  D6_INTERFACE_COUNTERPART_HISTORY_AUTO_REPOINTED,
  D6_INTERFACE_CURRENTNESS_INTEGRATED,
  D6_INTERFACE_EXPLICIT_DEPENDENCY_REQUIRED,
  D6_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D6_INTERFACE_INFERRED_DEPENDENCY_ALLOWED,
  D6_INTERFACE_SOURCE_AUTHORITY_PRESERVED,
  D6_INTERFACE_SOURCE_AUTO_REPOINTED,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_MISSING_COUNTERPART_AUTO_FABRICATED,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_R1_R7_EXACT_SOURCE_REVISIONS_REUSED,
  D6_R7_CHANGE_INTERFACE_INTEGRATION_IMPLEMENTED,
  D6_R7_REASSESSMENT_INTERFACE_INTEGRATION_IMPLEMENTED,
  D6_R8_APPLICABILITY_EXPLICIT,
  D6_R8_AUTO_ADOPTS_D5_PIPING_DESIGN_CONDITION,
  D6_R8_AUTO_MUTATES_R1_IDENTITY,
  D6_R8_AUTO_MUTATES_R2_SYSTEM_STREAM_CONTEXT,
  D6_R8_AUTO_MUTATES_R3_CONDITION,
  D6_R8_AUTO_MUTATES_R4_EVIDENCE,
  D6_R8_AUTO_MUTATES_R5_EQUIPMENT_DUTY,
  D6_R8_AUTO_MUTATES_R6_SAFETY_CONTEXT,
  D6_R8_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D6_R8_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D6_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R8_HISTORY_PRESERVED,
  D6_R8_LIMITATIONS_EXPLICIT,
  D6_R8_PROVENANCE_PRESERVED,
  D6_R8_PROVENANCE_REQUIRED,
  D6_R8_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R8_SOURCE_BASIS_REQUIRED,
  D6_R8_SOURCE_BASIS_TRACEABLE,
  D6_R8_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R9_STARTED,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REUSES_CANONICAL_INTERFACE_GOVERNANCE,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_TRANSFERS_D1_D3_AUTHORITY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D6_VALIDATES_D1_STRUCTURAL_ENGINEERING,
  D6_VALIDATES_D2_CIVIL_ENGINEERING,
  D6_VALIDATES_D3_GEOTECHNICAL_ENGINEERING,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D4_COUNTERPART_REVISION_REQUIRED,
  EXACT_D5_COUNTERPART_REVISION_REQUIRED,
  EXACT_D6_INTERFACE_COUNTERPART_REVISION_REQUIRED,
  EXACT_D6_INTERFACE_SOURCE_REVISION_REQUIRED,
  FLOATING_D6_INTERFACE_COUNTERPART_REFERENCE_ALLOWED,
  FLOATING_D6_INTERFACE_SOURCE_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PARALLEL_D6_INTERFACE_FRAMEWORK_CREATED,
  PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION,
  PROCESS_CONTROL_INTENT_EQUALS_IAC_DESIGN,
  PROCESS_EQUIPMENT_DUTY_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
  PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION,
  PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_INSTRUMENT_DESIGN,
  PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_IAC_IMPLEMENTATION,
  PROCESS_SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION,
  PROCESS_STREAM_EQUALS_PIPING_LINE,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D6_HANDOFF_EXPOSED_AS_CURRENT,
  SUPERSEDED_D6_HANDOFF_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D6_R8_SCOPE_ENFORCED,
  adoptPipingDesignConditionFromProcess,
  createD6R8Store,
  currentProcessInterfaceHandoffs,
  fabricateProcessInterfaceCounterpart,
  markProcessInterfaceFromChange,
  mutateProcessInterfaceCounterpart,
  reasonAcrossProcessDisciplines,
  recalculateProcessInterfaceCounterpart,
  recordProcessInterfaceHandoff,
  repointProcessInterface,
  revalidateProcessInterfaceCounterpart,
  validateMechanicalFromProcessHandoff,
} from "./discipline-interfaces-handoffs";

describe("EOS-D6-R8 discipline interfaces and handoffs", () => {
  it("hands exact Process revisions to other disciplines without transferring authority", () => {
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(8);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D6_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT).toBe(1);
    expect(R7_INTERFACE_COUNT).toBe(0);
    expect(ARCHITECTURE_INTERFACE_COUNT).toBe(0);
    expect(D6_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D6_R8_STARTED).toBe(false);
    expect(D6_R9_STARTED).toBe(false);
    expect(D6_R1_R7_EXACT_SOURCE_REVISIONS_REUSED && EXACT_D6_INTERFACE_SOURCE_REVISION_REQUIRED && EXACT_D6_INTERFACE_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D6_INTERFACE_SOURCE_REFERENCE_ALLOWED || FLOATING_D6_INTERFACE_COUNTERPART_REFERENCE_ALLOWED || D6_INTERFACE_SOURCE_AUTO_REPOINTED || D6_INTERFACE_COUNTERPART_AUTO_REPOINTED).toBe(false);
    expect(D6_PROCESS_IDENTITY_RUNTIME_READY && D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY && D6_PROCESS_EVIDENCE_RUNTIME_READY && D6_EQUIPMENT_DUTY_RUNTIME_READY && D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY && D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D6_REUSES_CANONICAL_INTERFACE_GOVERNANCE).toBe(true);
    expect(PARALLEL_D6_INTERFACE_FRAMEWORK_CREATED).toBe(false);
    expect(D6_EXPLICIT_COUNTERPART_REFERENCE_REQUIRED).toBe(true);
    expect(D6_INFERRED_COUNTERPART_ALLOWED || D6_MISSING_COUNTERPART_AUTO_FABRICATED).toBe(false);
    expect(D6_D4_HANDOFF_IMPLEMENTED && EXACT_D4_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(D6_D4_HANDOFF_TRANSFERS_MECHANICAL_AUTHORITY || D6_D4_HANDOFF_VALIDATES_MECHANICAL_ENGINEERING || D6_AUTO_MUTATES_D4_COUNTERPART).toBe(false);
    expect(D6_D5_HANDOFF_IMPLEMENTED && D6_D5_CONTRACT_COMPATIBLE_WITH_EXISTING_D5_R8_CONTRACT && EXACT_D5_COUNTERPART_REVISION_REQUIRED).toBe(true);
    expect(D6_D5_HANDOFF_TRANSFERS_PIPING_AUTHORITY || D6_D5_HANDOFF_VALIDATES_PIPING_ENGINEERING || D6_AUTO_MUTATES_D5_COUNTERPART).toBe(false);
    expect(D6_D7_HANDOFF_CONTRACT_IMPLEMENTED).toBe(true);
    expect(D6_D7_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D6_D7_HANDOFF_TRANSFERS_ELECTRICAL_AUTHORITY || D6_D7_HANDOFF_CREATES_ELECTRICAL_DESIGN).toBe(false);
    expect(D6_D8_HANDOFF_CONTRACT_IMPLEMENTED).toBe(true);
    expect(D6_D8_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D6_D8_HANDOFF_TRANSFERS_IAC_AUTHORITY || D6_D8_HANDOFF_CREATES_IAC_DESIGN || D6_D8_HANDOFF_EQUALS_FUNCTIONAL_SAFETY_VALIDATION).toBe(false);
    expect(D6_D1_D3_INTERFACE_REFERENCE_SUPPORTED_WHERE_CANONICAL).toBe(true);
    expect(D6_VALIDATES_D1_STRUCTURAL_ENGINEERING || D6_VALIDATES_D2_CIVIL_ENGINEERING || D6_VALIDATES_D3_GEOTECHNICAL_ENGINEERING || D6_TRANSFERS_D1_D3_AUTHORITY).toBe(false);
    expect(D6_HANDOFF_CONTENT_EQUALS_COUNTERPART_ENGINEERING_TRUTH || D6_HANDOFF_COMPLETED_EQUALS_COUNTERPART_VALIDATED || D6_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_APPROVED).toBe(false);
    expect(D6_INTERFACE_SOURCE_AUTHORITY_PRESERVED && D6_INTERFACE_COUNTERPART_AUTHORITY_PRESERVED).toBe(true);
    expect(D6_R7_CHANGE_INTERFACE_INTEGRATION_IMPLEMENTED && D6_R7_REASSESSMENT_INTERFACE_INTEGRATION_IMPLEMENTED && D6_INTERFACE_EXPLICIT_DEPENDENCY_REQUIRED && D6_INTERFACE_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D6_INTERFACE_CHANGE_AUTO_MUTATES_COUNTERPART || D6_INTERFACE_CHANGE_AUTO_RECALCULATES_COUNTERPART || D6_INTERFACE_CHANGE_AUTO_REVALIDATES_COUNTERPART || D6_INTERFACE_CHANGE_AUTO_REPOINTS_COUNTERPART || D6_INTERFACE_INFERRED_DEPENDENCY_ALLOWED).toBe(false);
    expect(STALE_D6_HANDOFF_EXPOSED_AS_CURRENT || SUPERSEDED_D6_HANDOFF_EXPOSED_AS_CURRENT || D6_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED || D6_INTERFACE_COUNTERPART_HISTORY_AUTO_REPOINTED).toBe(false);
    expect(D6_R8_HISTORY_PRESERVED).toBe(true);
    expect(D6_R8_AUTO_MUTATES_R1_IDENTITY || D6_R8_AUTO_MUTATES_R2_SYSTEM_STREAM_CONTEXT || D6_R8_AUTO_MUTATES_R3_CONDITION || D6_R8_AUTO_MUTATES_R4_EVIDENCE || D6_R8_AUTO_MUTATES_R5_EQUIPMENT_DUTY || D6_R8_AUTO_MUTATES_R6_SAFETY_CONTEXT || D6_R8_AUTO_MUTATES_R7_CHANGE_GOVERNANCE).toBe(false);
    expect(PROCESS_CONDITION_EQUALS_PIPING_DESIGN_CONDITION || PROCESS_SOURCE_CONDITION_EQUALS_ADOPTED_PIPING_DESIGN_CONDITION || PROCESS_STREAM_EQUALS_PIPING_LINE || D6_R8_AUTO_ADOPTS_D5_PIPING_DESIGN_CONDITION).toBe(false);
    expect(PROCESS_EQUIPMENT_DUTY_EQUALS_MECHANICAL_EQUIPMENT_DESIGN || PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION).toBe(false);
    expect(PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_IAC_IMPLEMENTATION || PROCESS_CONTROL_INTENT_EQUALS_IAC_DESIGN || PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_INSTRUMENT_DESIGN).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS && D6_REUSES_CANONICAL_DIGITAL_THREAD && D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED || PARALLEL_D6_DIGITAL_THREAD_CREATED || SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D6_R8_PROVENANCE_REQUIRED && D6_R8_PROVENANCE_PRESERVED && D6_R8_SOURCE_BASIS_REQUIRED && D6_R8_SOURCE_BASIS_TRACEABLE && D6_R8_APPLICABILITY_EXPLICIT && D6_R8_LIMITATIONS_EXPLICIT).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D6_R8_HANDOFF_AUTO_ACCEPTED || D6_R8_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D6_R8_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R8_ACCESS_ALLOWED).toBe(false);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || AI_CAN_INVENT_D6_INTERFACE_COUNTERPART || AI_CAN_INVENT_D6_INTERFACE_RELATIONSHIP || ADMIN_CAN_PROMOTE_D6_HANDOFF_TO_COUNTERPART_VALIDATION).toBe(false);
    expect(D6_EQUALS_D1_STRUCTURAL_AUTHORITY || D6_EQUALS_D2_CIVIL_AUTHORITY || D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D6_EQUALS_D4_MECHANICAL_AUTHORITY || D6_EQUALS_D5_PIPING_AUTHORITY || D6_EQUALS_D7_ELECTRICAL_AUTHORITY || D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D6_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED && D6_R8_REPLAY_PROTECTION_IMPLEMENTED && D6_R8_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D6_REVIEW_VALIDATION_RUNTIME_COUNT, D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D6_D9_RUNTIME_INTEGRATION_COUNT,
      D6_PROCESS_CALCULATION_RUNTIME_COUNT, D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT, D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT, D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
      D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT, D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT, D6_RELIEF_CALCULATION_RUNTIME_COUNT, D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
      D6_UTILITY_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT, D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D6_APPROVAL_RUNTIME_COUNT, D6_CERTIFICATION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
    ]).toEqual(Array(23).fill(0));
    expect(D1_STRUCTURAL_PACK_COMPLETE || D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && !D2_REOPENED && D3_TRACK_COMPLETE && !D3_REOPENED && D4_TRACK_COMPLETE && !D4_REOPENED && D5_TRACK_COMPLETE && !D5_REOPENED).toBe(true);
    expect(D7_RUNTIME_STARTED || D8_RUNTIME_STARTED || D9_RUNTIME_STARTED || D9_RUNTIME_COUNT !== 0).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const actor = { actorId: "proc-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D6_CONTEXT_AUTHORITY };
    const r1 = createD6R1Store();
    recordProcessContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: string) => recordProcessObjectIdentity(r1, actor, {
      objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`,
    });
    const stream = identity("stream-1", "PROCESS_STREAM");
    const operatingIdentity = identity("op-1", "PROCESS_OPERATING_CASE");
    const evidenceIdentity = identity("ev-1", "PROCESS_CALCULATION_EVIDENCE");
    const dutyIdentity = identity("duty-1", "PROCESS_EQUIPMENT_DUTY");
    const safetyIdentity = identity("safety-1", "PROCESS_SAFETY_CONTEXT");
    const r2 = createD6R2Store(r1, createD5R1Store());
    const streamContext = recordProcessStreamContext(r2, actor, {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint, citedLifecycleStage: "FEED",
      provenanceRef: "prov-r2", sourceBasisRef: "basis-r2", citedCurrentness: "CURRENT", applicability: `applies only to ${stream.objectId}`,
      limitations: "descriptive context only", streamRecordId: "stream-rec", streamFunction: "FEED",
    });
    const r3 = createD6R3Store(r2);
    const operatingCase = recordProcessOperatingCaseContext(r3, actor, {
      contextId: "ctx-1", objectId: operatingIdentity.objectId, objectRevisionFingerprint: operatingIdentity.fingerprint, citedLifecycleStage: "FEED",
      provenanceRef: "prov-r3", sourceBasisRef: "basis-r3", citedCurrentness: "CURRENT", applicability: `applies only to ${operatingIdentity.objectId}`,
      limitations: "supplied value only", caseRecordId: "op-rec", caseName: "Normal operation", caseType: "NORMAL_OPERATION",
    });
    const condition = recordProcessOperatingCondition(r3, actor, {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint, citedLifecycleStage: "FEED",
      provenanceRef: "prov-cond", sourceBasisRef: "basis-cond", citedCurrentness: "CURRENT", applicability: `applies only to ${stream.objectId}`,
      limitations: "supplied value only", conditionId: "op-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa", r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const r4 = createD6R4Store(r3);
    const energy = recordProcessCalculationEvidence(r4, actor, {
      contextId: "ctx-1", objectId: evidenceIdentity.objectId, objectRevisionFingerprint: evidenceIdentity.fingerprint,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint, evidenceId: "energy-1",
      citedLifecycleStage: "FEED", provenanceRef: "prov-r4", sourceBasisRef: "basis-r4", citedCurrentness: "CURRENT",
      applicability: `applies only to ${stream.objectId} and ${evidenceIdentity.objectId}`, limitations: "supplied external evidence only",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      sourceToolName: "SupplierBalance", sourceToolVersion: "4.2", sourceModelRevision: "model-a", sourceReportRef: "HMB-014", sourceAuthorityRef: "balance author PE-14",
      evidenceClass: "ENERGY_BALANCE", assumptions: ["Enthalpy reference was stated by the supplier"],
      values: [
        { valueId: "ein", role: "INPUT", name: "ENTHALPY_IN", valueKind: "QUANTITY", value: "400", unit: "kJ/kg", basisRef: "EB-2-in" },
        { valueId: "eout", role: "RESULT", name: "DUTY", valueKind: "QUANTITY", value: "1500", unit: "kW", basisRef: "EB-2-out" },
      ],
    });
    const r5 = createD6R5Store(r4);
    const duty = recordProcessEquipmentDutyContext(r5, actor, {
      contextId: "ctx-1", objectId: dutyIdentity.objectId, objectRevisionFingerprint: dutyIdentity.fingerprint,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint, requirementId: "duty-rec",
      citedLifecycleStage: "FEED", provenanceRef: "prov-r5", sourceBasisRef: "basis-r5", citedCurrentness: "CURRENT",
      applicability: `applies only to ${stream.objectId} and ${dutyIdentity.objectId}`, limitations: "process requirement only",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      requirementKind: "HEAT_DUTY", serviceRole: "feed heater process duty", value: "1400", unit: "kW",
    });
    const r6 = createD6R6Store(r5);
    const safety = recordProcessSafetyContext(r6, actor, {
      contextId: "ctx-1", objectId: safetyIdentity.objectId, objectRevisionFingerprint: safetyIdentity.fingerprint,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint, recordId: "safety-rec",
      citedLifecycleStage: "FEED", provenanceRef: "prov-r6", sourceBasisRef: "basis-r6", citedCurrentness: "CURRENT",
      applicability: `applies only to ${stream.objectId} and ${safetyIdentity.objectId}`, limitations: "supplied safety context only",
      assumptions: "The scenario boundary was stated by the supplied study", statement: "Process safety context for the feed stream",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const r7 = createD6R7Store(r6);
    const subject = {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      citedCurrentness: "CURRENT", citedLifecycleStage: "FEED", applicability: `applies only to ${stream.objectId}`,
      limitations: "governed process context only", provenanceRef: "prov-r7", sourceBasisRef: "basis-r7",
    };
    const requirement = recordProcessSourceRequirement(r7, actor, {
      ...subject, requirementId: "req-source", statement: "The feed stream shall retain the supplied operating pressure",
      requirementCategory: "DESIGN_INPUT", sourceClass: "SOURCE_REQUIREMENT", sourceRef: "PDB-1", sourceRevision: "A",
    });
    const link = (targetKind: string, targetId: string, targetFingerprint: string) => ({ kind: "OBJECT_REFERENCE", targetKind, targetId, targetFingerprint });
    const change = recordProcessChange(r7, actor, {
      ...subject, changeId: "chg-1", changeCategory: "R5_DUTY_CHANGED", reason: "The source document revision was explicitly replaced",
      dependencies: [
        link("R3_CONDITION", condition.conditionId, condition.fingerprint),
        link("R4_EVIDENCE", energy.evidenceId, energy.fingerprint),
        link("R5_DUTY", duty.requirementId, duty.fingerprint),
        link("R6_SAFETY", safety.recordId, safety.fingerprint),
      ],
    });
    recordProcessReassessment(r7, actor, {
      ...subject, reassessmentId: "ras-duty", changeId: change.changeId, targetId: duty.requirementId, targetFingerprint: duty.fingerprint, state: "REASSESSMENT_REQUIRED",
    });
    const mechActor = { ...actor, actorId: "mech-recorder", authority: D4_CONTEXT_AUTHORITY };
    const d4 = createD4R1Store();
    recordMechanicalContext(d4, mechActor, { contextId: "mctx", citedLifecycleStage: "FEED", provenanceRef: "prov-mctx" });
    const equipment = recordMechanicalObjectIdentity(d4, mechActor, { objectId: "eq-1", contextId: "mctx", objectType: "MECHANICAL_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-eq-1" });
    const pipeActor = { ...actor, actorId: "pipe-recorder", authority: D5_CONTEXT_AUTHORITY };
    const d5 = createD5R1Store();
    recordPipingContext(d5, pipeActor, { contextId: "pctx", citedLifecycleStage: "FEED", provenanceRef: "prov-pctx" });
    const line = recordPipingObjectIdentity(d5, pipeActor, { objectId: "line-1", contextId: "pctx", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "prov-line-1" });
    const civilActor = { ...actor, actorId: "civil-recorder", authority: D2_CONTEXT_AUTHORITY };
    const d2 = createD2R1Store();
    recordCivilContext(d2, civilActor, { contextId: "cctx", citedLifecycleStage: "FEED", provenanceRef: "prov-cctx" });
    const site = recordCivilObjectIdentity(d2, civilActor, { objectId: "site-1", contextId: "cctx", objectType: "CIVIL_SITE", citedLifecycleStage: "FEED", provenanceRef: "prov-site-1" });
    const geoActor = { ...actor, actorId: "geo-recorder", authority: D3_CONTEXT_AUTHORITY };
    const d3 = createD3R1Store();
    recordGeotechnicalContext(d3, geoActor, { contextId: "gctx", citedLifecycleStage: "FEED", provenanceRef: "prov-gctx" });
    const borehole = recordGeotechnicalObjectIdentity(d3, geoActor, { objectId: "bh-1", contextId: "gctx", objectType: "BOREHOLE", citedLifecycleStage: "FEED", provenanceRef: "prov-bh-1" });
    const before = {
      condition: JSON.stringify(r3.conditions),
      evidence: JSON.stringify(r4.evidence),
      duty: JSON.stringify(r5.duties),
      safety: JSON.stringify(r6.records),
      change: JSON.stringify(r7.changes),
      equipment: JSON.stringify(d4.objects),
      line: JSON.stringify(d5.objects),
      site: JSON.stringify(d2.objects),
      borehole: JSON.stringify(d3.objects),
    };
    const store = createD6R8Store(r7, d4, d5, d2, d3);
    const base = {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      citedCurrentness: "CURRENT", citedLifecycleStage: "FEED", applicability: `applies only to ${stream.objectId}`,
      limitations: "handoff communicates process context only", provenanceRef: "prov-r8", sourceBasisRef: "basis-r8",
      direction: "D6_TO_COUNTERPART", identityBasis: "EXPLICIT", tenantId: "t1", workspaceId: "w1", projectId: "p1",
    };
    const mechanicalInput = {
      ...base, handoffId: "hof-d4", sourceKind: "R5_DUTY", sourceId: duty.requirementId, sourceFingerprint: duty.fingerprint,
      dependencies: [link("R5_DUTY", duty.requirementId, duty.fingerprint)], counterpartDiscipline: "mechanical", interfaceTopic: "PROCESS_DUTY",
      counterpartId: equipment.objectId, counterpartRevision: equipment.provenanceRef, counterpartFingerprint: equipment.fingerprint, handoffStatus: "COMPLETE",
    };
    const mechanical = recordProcessInterfaceHandoff(store, actor, mechanicalInput);
    expect(recordProcessInterfaceHandoff(store, actor, mechanicalInput)).toBe(mechanical);
    expect(mechanical.interfaceComplete).toBe(true);
    expect(mechanical.engineeringValidated).toBe(false);
    expect(mechanical.mechanicalDesign).toBe(false);
    expect(mechanical.authorityTransferred).toBe(false);
    expect(mechanical.sourceAuthority).toBe(D6_CONTEXT_AUTHORITY);
    expect(mechanical.receivingAuthority).toBe("mechanical");
    expect(mechanical.counterpart?.sourceRevision).toBe(equipment.provenanceRef);
    const piping = recordProcessInterfaceHandoff(store, actor, {
      ...base, handoffId: "hof-d5", sourceKind: "R3_CONDITION", sourceId: condition.conditionId, sourceFingerprint: condition.fingerprint,
      dependencies: [link("R3_CONDITION", condition.conditionId, condition.fingerprint)], counterpartDiscipline: "piping", interfaceTopic: "PROCESS_CONDITION",
      counterpartId: line.objectId, counterpartRevision: line.provenanceRef, counterpartFingerprint: line.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(piping.pipingConditionAdopted).toBe(false);
    expect(piping.counterpart?.counterpartId).toBe(line.objectId);
    expect(line.objectId).not.toBe(stream.objectId);
    const evidenceHandoff = recordProcessInterfaceHandoff(store, actor, {
      ...base, handoffId: "hof-d5-evidence", sourceKind: "R4_EVIDENCE", sourceId: energy.evidenceId, sourceFingerprint: energy.fingerprint,
      dependencies: [link("R4_EVIDENCE", energy.evidenceId, energy.fingerprint)], counterpartDiscipline: "piping", interfaceTopic: "LINE_SIZING_SOURCE_OR_RESULT_REFERENCE",
      counterpartId: line.objectId, counterpartRevision: line.provenanceRef, counterpartFingerprint: line.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(evidenceHandoff.sourceFingerprint).toBe(energy.fingerprint);
    const electrical = recordProcessInterfaceHandoff(store, actor, {
      ...base, handoffId: "hof-d7", sourceKind: "R7_REQUIREMENT", sourceId: requirement.requirementId, sourceFingerprint: requirement.fingerprint,
      dependencies: [link("R7_REQUIREMENT", requirement.requirementId, requirement.fingerprint)], counterpartDiscipline: "electrical",
      interfaceTopic: "MOTOR_OR_LOAD_PROCESS_REQUIREMENT", handoffStatus: "AWAITING_COUNTERPART",
    });
    expect(electrical.counterpart).toBeNull();
    expect(electrical.interfaceComplete).toBe(false);
    expect(electrical.electricalDesignCreated).toBe(false);
    const iac = recordProcessInterfaceHandoff(store, actor, {
      ...base, handoffId: "hof-d8", sourceKind: "R6_SAFETY", sourceId: safety.recordId, sourceFingerprint: safety.fingerprint,
      dependencies: [link("R6_SAFETY", safety.recordId, safety.fingerprint)], counterpartDiscipline: "instrumentation_control",
      interfaceTopic: "PROCESS_SAFEGUARDING_REQUIREMENT", handoffStatus: "AWAITING_COUNTERPART",
    });
    expect(iac.functionalSafetyValidated).toBe(false);
    expect(iac.iacDesignCreated).toBe(false);
    const civil = recordProcessInterfaceHandoff(store, actor, {
      ...base, handoffId: "hof-d2", sourceKind: "R7_REQUIREMENT", sourceId: requirement.requirementId, sourceFingerprint: requirement.fingerprint,
      dependencies: [link("R7_REQUIREMENT", requirement.requirementId, requirement.fingerprint)], counterpartDiscipline: "civil",
      interfaceTopic: "JUSTIFIED_CANONICAL_REFERENCE", counterpartId: site.objectId, counterpartRevision: site.provenanceRef, counterpartFingerprint: site.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(civil.engineeringValidated).toBe(false);
    const geotech = recordProcessInterfaceHandoff(store, actor, {
      ...base, handoffId: "hof-d3", sourceKind: "R7_REQUIREMENT", sourceId: requirement.requirementId, sourceFingerprint: requirement.fingerprint,
      dependencies: [link("R7_REQUIREMENT", requirement.requirementId, requirement.fingerprint)], counterpartDiscipline: "geotechnical",
      interfaceTopic: "JUSTIFIED_CANONICAL_REFERENCE", counterpartId: borehole.objectId, counterpartRevision: borehole.provenanceRef, counterpartFingerprint: borehole.fingerprint, handoffStatus: "COMPLETE",
    });
    expect(geotech.authorityTransferred).toBe(false);
    const awaiting = recordProcessInterfaceHandoff(store, actor, {
      ...base, handoffId: "hof-missing", sourceKind: "R5_DUTY", sourceId: duty.requirementId, sourceFingerprint: duty.fingerprint,
      dependencies: [link("R5_DUTY", duty.requirementId, duty.fingerprint)], counterpartDiscipline: "mechanical", interfaceTopic: "PROCESS_CAPACITY_REQUIREMENT",
      handoffStatus: "AWAITING_COUNTERPART",
    });
    expect(awaiting.counterpart).toBeNull();
    expect(awaiting.interfaceComplete).toBe(false);
    const next = recordProcessInterfaceHandoff(store, actor, {
      ...mechanicalInput, handoffId: "hof-d4-next", predecessorHandoffId: mechanical.handoffId, limitations: "handoff communicates the revised process context only",
    });
    const stored = store.handoffs.find((row) => row.handoffId === mechanical.handoffId);
    expect(stored?.recordStatus).toBe("SUPERSEDED");
    expect(stored?.currentness).toBe("SUPERSEDED");
    expect(stored?.fingerprint).toBe(mechanical.fingerprint);
    expect(stored?.counterpart?.sourceRevision).toBe(equipment.provenanceRef);
    expect(next.predecessorFingerprint).toBe(mechanical.fingerprint);
    expect(currentProcessInterfaceHandoffs(store, actor).some((row) => row.handoffId === mechanical.handoffId)).toBe(false);
    const stale = markProcessInterfaceFromChange(store, actor, {
      handoffId: piping.handoffId, handoffFingerprint: piping.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "STALE",
    });
    expect(stale.currentness).toBe("STALE");
    expect(stale.fingerprint).toBe(piping.fingerprint);
    expect(stale.engineeringValidated).toBe(false);
    expect(stale.counterpart?.fingerprint).toBe(line.fingerprint);
    expect(currentProcessInterfaceHandoffs(store, actor).some((row) => row.handoffId === piping.handoffId)).toBe(false);
    const reassessed = markProcessInterfaceFromChange(store, actor, {
      handoffId: next.handoffId, handoffFingerprint: next.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "REASSESSMENT_REQUIRED",
    });
    expect(reassessed.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(reassessed.engineeringValidated).toBe(false);
    expect(reassessed.approved).toBe(false);
    expect(JSON.stringify(r3.conditions)).toBe(before.condition);
    expect(JSON.stringify(r4.evidence)).toBe(before.evidence);
    expect(JSON.stringify(r5.duties)).toBe(before.duty);
    expect(JSON.stringify(r6.records)).toBe(before.safety);
    expect(JSON.stringify(r7.changes)).toBe(before.change);
    expect(JSON.stringify(d4.objects)).toBe(before.equipment);
    expect(JSON.stringify(d5.objects)).toBe(before.line);
    expect(JSON.stringify(d2.objects)).toBe(before.site);
    expect(JSON.stringify(d3.objects)).toBe(before.borehole);
    expect(condition.measure).toEqual({ value: "150", unit: "kPa" });
    expect(duty.measure).toEqual({ value: "1400", unit: "kW" });

    const reject = (run: () => void) => expect(run).toThrow(/D6_R8_/);
    reject(() => recordProcessInterfaceHandoff(store, actor, { ...mechanicalInput, handoffId: "bad-infer", inference: "matching tag" }));
    reject(() => recordProcessInterfaceHandoff(store, actor, { ...base, handoffId: "bad-fab", sourceKind: "R7_REQUIREMENT", sourceId: requirement.requirementId, sourceFingerprint: requirement.fingerprint, dependencies: [link("R7_REQUIREMENT", requirement.requirementId, requirement.fingerprint)], counterpartDiscipline: "electrical", interfaceTopic: "POWER_REQUIREMENT_CONTEXT", counterpartId: "invented-motor", counterpartRevision: "A", handoffStatus: "AWAITING_COUNTERPART" }));
    reject(() => recordProcessInterfaceHandoff(store, actor, { ...mechanicalInput, handoffId: "bad-float", objectRevisionFingerprint: "latest" }));
    reject(() => recordProcessInterfaceHandoff(store, actor, { ...mechanicalInput, handoffId: "bad-fp", counterpartFingerprint: "spoof" }));
    reject(() => recordProcessInterfaceHandoff(store, actor, { ...base, handoffId: "bad-empty", sourceKind: "R5_DUTY", sourceId: duty.requirementId, sourceFingerprint: duty.fingerprint, dependencies: [], counterpartDiscipline: "mechanical", interfaceTopic: "PROCESS_DUTY", counterpartId: equipment.objectId, counterpartRevision: equipment.provenanceRef, handoffStatus: "COMPLETE" }));
    reject(() => recordProcessInterfaceHandoff(store, actor, { ...mechanicalInput, handoffId: "bad-scope", tenantId: "t2" }));
    reject(() => recordProcessInterfaceHandoff(store, { ...actor, actorId: "AI_1" }, { ...mechanicalInput, handoffId: "bad-ai" }));
    reject(() => recordProcessInterfaceHandoff(store, { ...actor, authority: "ADMIN" }, { ...mechanicalInput, handoffId: "bad-admin", promoteValidated: true }));
    reject(() => markProcessInterfaceFromChange(store, actor, { handoffId: civil.handoffId, handoffFingerprint: civil.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "STALE" }));
    reject(() => recordProcessInterfaceHandoff(store, actor, { ...mechanicalInput, handoffId: "bad-dup" }));
    expect(JSON.stringify(d4.objects)).toBe(before.equipment);
    expect(JSON.stringify(d5.objects)).toBe(before.line);
    expect(JSON.stringify(r3.conditions)).toBe(before.condition);
    expect(repointProcessInterface).toThrow(/D6_R8_/);
    expect(mutateProcessInterfaceCounterpart).toThrow(/D6_R8_/);
    expect(recalculateProcessInterfaceCounterpart).toThrow(/D6_R8_/);
    expect(revalidateProcessInterfaceCounterpart).toThrow(/D6_R8_/);
    expect(adoptPipingDesignConditionFromProcess).toThrow(/D6_R8_/);
    expect(fabricateProcessInterfaceCounterpart).toThrow(/D6_R8_/);
    expect(reasonAcrossProcessDisciplines).toThrow(/D6_R8_/);
    expect(validateMechanicalFromProcessHandoff).toThrow(/D6_R8_/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "discipline-interfaces-handoffs.ts"), "utf8");
    expect(sourceText).toMatch(/assertInterfaceType|assertHumanApprovalActor|D2_R8_HANDOFF_STATUSES|D6_D5_INTERFACE_SUBJECTS/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "discipline-interfaces-handoffs.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
