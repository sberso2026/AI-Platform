import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as ARCHITECTURE_CHANGE_COUNT, D6_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D6_CONTEXT_AUTHORITY, createD6R1Store, recordProcessContext, recordProcessObjectIdentity } from "./identity-foundation";
import { createD6R2Store, recordProcessStreamContext, recordProcessSystemContext } from "./system-stream-service-context";
import { createD6R3Store, recordProcessDesignBasisContext, recordProcessOperatingCaseContext, recordProcessOperatingCondition } from "./operating-design-basis-conditions";
import { createD6R4Store, recordProcessCalculationEvidence } from "./process-evidence-balances";
import { createD6R5Store, recordProcessEquipmentDutyContext, recordSuppliedProcessUtilityEvidence } from "./equipment-duty-utility-context";
import {
  D6_R7_STARTED,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as R6_CHANGE_COUNT,
  D6_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  createD6R6Store,
  recordProcessSafetyContext,
} from "./process-safety-relief-context";
import { createD5R1Store } from "../piping/identity-foundation";
import {
  AI_CAN_CREATE_PROCESS_ENGINEERING_DECISION_WITHOUT_AUTHORITY,
  AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_ASSUMPTION,
  AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_REQUIREMENT,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_GENERATED_REQUIREMENT_AUTO_ADOPTED,
  AI_RECOMMENDATION_EQUALS_PROCESS_ENGINEERING_DECISION,
  ADMIN_ACTION_EQUALS_PROCESS_ENGINEERING_DECISION,
  ADMIN_CAN_CLOSE_PROCESS_REASSESSMENT_AS_VALIDATED,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ASSUMPTION_EQUALS_VALIDATED_FACT,
  BASISLESS_AUTHORITATIVE_D6_R7_RECORD_AUTO_ACCEPTED,
  CHANGED_ASSUMPTION_AUTO_INVALIDATES_ALL_DEPENDENTS,
  CHANGED_ASSUMPTION_AUTO_RECALCULATES_PROCESS_DESIGN,
  CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D4,
  CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D5,
  CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D7,
  CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D8,
  CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_ENGINEERING,
  CROSS_TENANT_D6_R7_ACCESS_ALLOWED,
  CURRENT_D6_RECORD_EQUALS_VALIDATED,
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
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CHANGE_AUTO_ADOPTS_NEW_PROCESS_CONDITION,
  D6_CHANGE_AUTO_APPROVES_ENGINEERING,
  D6_CHANGE_AUTO_APPROVES_SAFEGUARD,
  D6_CHANGE_AUTO_CERTIFIES_ENGINEERING,
  D6_CHANGE_AUTO_CLOSES_HAZARD_FINDING,
  D6_CHANGE_AUTO_DETERMINES_CONFORMANCE,
  D6_CHANGE_AUTO_RECALCULATES_DEPRESSURING,
  D6_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D6_CHANGE_AUTO_RECALCULATES_EQUIPMENT_DUTY,
  D6_CHANGE_AUTO_RECALCULATES_R3_CONDITION,
  D6_CHANGE_AUTO_RECALCULATES_R4_EVIDENCE,
  D6_CHANGE_AUTO_RECALCULATES_RELIEF_LOAD,
  D6_CHANGE_AUTO_REDESIGNS_ENGINEERING,
  D6_CHANGE_AUTO_REDETERMINES_SIL,
  D6_CHANGE_AUTO_REPOINTS_R1_IDENTITY_HISTORY,
  D6_CHANGE_AUTO_RESELECTS_EQUIPMENT,
  D6_CHANGE_AUTO_RESIZES_RELIEF_DEVICE,
  D6_CHANGE_AUTO_REVALIDATES_ENGINEERING,
  D6_CHANGE_AUTO_REVALIDATES_R4_EVIDENCE,
  D6_CHANGE_AUTO_REWRITES_EXTERNAL_RESULT,
  D6_CHANGE_AUTO_REWRITES_R2_SYSTEM_STREAM_CONTEXT,
  D6_CHANGE_AUTO_REWRITES_R3_DESIGN_BASIS,
  D6_CHANGE_AUTO_REWRITES_UTILITY_REQUIREMENT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
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
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_ASSUMPTION_GOVERNANCE_IMPLEMENTED,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CHANGE_GOVERNANCE_IMPLEMENTED,
  D6_PROCESS_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_PROCESS_REQUIREMENT_EXPLICIT_ADOPTION_REQUIRED,
  D6_PROCESS_REQUIREMENT_GOVERNANCE_IMPLEMENTED,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_R1_R6_EXACT_SUBJECT_REVISIONS_REUSED,
  D6_R7_ASSUMPTION_CHANGE_GOVERNED,
  D6_R7_CHANGE_HISTORY_AUTO_REPOINTED,
  D6_R7_DECISION_SUPERSESSION_GOVERNED,
  D6_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R7_EXPLICIT_CHANGE_DEPENDENCY_REQUIRED,
  D6_R7_EXPLICIT_DEPENDENT_STALENESS_SUPPORTED,
  D6_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D6_R7_INFERRED_CHANGE_DEPENDENCY_ALLOWED,
  D6_R7_INFERRED_STALENESS_PROPAGATION_ALLOWED,
  D6_R7_PROVENANCE_PRESERVED,
  D6_R7_PROVENANCE_REQUIRED,
  D6_R7_R1_IDENTITY_CHANGE_INTEGRATION_IMPLEMENTED,
  D6_R7_R2_CONTEXT_CHANGE_INTEGRATION_IMPLEMENTED,
  D6_R7_R3_CHANGE_INTEGRATION_IMPLEMENTED,
  D6_R7_R4_CHANGE_INTEGRATION_IMPLEMENTED,
  D6_R7_R5_CHANGE_INTEGRATION_IMPLEMENTED,
  D6_R7_R6_CHANGE_INTEGRATION_IMPLEMENTED,
  D6_R7_REASSESSMENT_GOVERNANCE_IMPLEMENTED,
  D6_R7_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R7_SOURCE_BASIS_REQUIRED,
  D6_R7_SOURCE_BASIS_TRACEABLE,
  D6_R7_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R7_SUBJECT_AUTO_REPOINTED,
  D6_R7_SUPERSESSION_GOVERNANCE_IMPLEMENTED,
  D6_R8_STARTED,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D6_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D6_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D6_R7_SUBJECT_REVISION_REQUIRED,
  FLOATING_D6_R7_SUBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D6_CHANGE_ENGINE_CREATED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DECISION_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PARALLEL_D6_REQUIREMENT_ENGINE_CREATED,
  PROCESS_ASSUMPTION_EQUALS_ENGINEERING_VALIDATED,
  PROCESS_ASSUMPTION_EQUALS_VALIDATED_FACT,
  PROCESS_ENGINEERING_DECISION_EQUALS_APPROVAL,
  REASSESSMENT_COMPLETED_EQUALS_APPROVED,
  REASSESSMENT_COMPLETED_EQUALS_CONFORMANT,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED,
  REQUIREMENT_PRESENT_EQUALS_CONFORMANT,
  REQUIREMENT_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  SOURCE_REQUIREMENT_AUTO_ADOPTED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_PROCESS_REQUIREMENT,
  STALE_D6_RECORD_EQUALS_INVALID,
  SUPERSEDED_D6_RECORD_DELETED,
  SUPERSEDED_D6_RECORD_EQUALS_INVALID,
  SUPERSEDED_PROCESS_DECISION_AUTO_REPLACED_IN_HISTORY,
  SUPERSEDED_PROCESS_DECISION_DELETED,
  TENANT_WORKSPACE_PROJECT_D6_R7_SCOPE_ENFORCED,
  VENDOR_REQUIREMENT_AUTO_ADOPTED,
  approveProcessFromChange,
  certifyProcessFromChange,
  closeProcessReassessmentAsValidated,
  createD6R7Store,
  determineProcessConformance,
  inferProcessChangeDependency,
  markProcessDependentCurrentness,
  recalculateProcessFromChange,
  recordAdoptedProcessRequirement,
  recordProcessAssumption,
  recordProcessChange,
  recordProcessEngineeringDecision,
  recordProcessReassessment,
  recordProcessSourceRequirement,
  redesignProcessFromChange,
  repointProcessGovernance,
  revalidateProcessFromChange,
  updateCounterpartFromRequirement,
} from "./requirements-assumptions-change";

describe("EOS-D6-R7 requirements assumptions and change", () => {
  it("governs Process requirements and change without recalculating engineering", () => {
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(7);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT).toBe(1);
    expect(R6_CHANGE_COUNT).toBe(0);
    expect(ARCHITECTURE_CHANGE_COUNT).toBe(0);
    expect(D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D6_R7_STARTED).toBe(false);
    expect(D6_R8_STARTED).toBe(false);
    expect(D6_R1_R6_EXACT_SUBJECT_REVISIONS_REUSED && EXACT_D6_R7_SUBJECT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D6_R7_SUBJECT_REFERENCE_ALLOWED || D6_R7_SUBJECT_AUTO_REPOINTED).toBe(false);
    expect(D6_PROCESS_IDENTITY_RUNTIME_READY && D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY && D6_PROCESS_EVIDENCE_RUNTIME_READY && D6_EQUIPMENT_DUTY_RUNTIME_READY && D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY).toBe(true);
    expect(D6_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE && D6_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE && D6_REUSES_CANONICAL_DECISION_GOVERNANCE && D6_REUSES_CANONICAL_CHANGE_GOVERNANCE).toBe(true);
    expect(PARALLEL_D6_REQUIREMENT_ENGINE_CREATED || PARALLEL_D6_ASSUMPTION_ENGINE_CREATED || PARALLEL_D6_DECISION_ENGINE_CREATED || PARALLEL_D6_CHANGE_ENGINE_CREATED).toBe(false);
    expect(D6_PROCESS_REQUIREMENT_GOVERNANCE_IMPLEMENTED && D6_PROCESS_REQUIREMENT_EXPLICIT_ADOPTION_REQUIRED).toBe(true);
    expect(SOURCE_REQUIREMENT_EQUALS_ADOPTED_PROCESS_REQUIREMENT || REQUIREMENT_PRESENT_EQUALS_ENGINEERING_VALIDATED || REQUIREMENT_PRESENT_EQUALS_CONFORMANT).toBe(false);
    expect(SOURCE_REQUIREMENT_AUTO_ADOPTED || VENDOR_REQUIREMENT_AUTO_ADOPTED || AI_GENERATED_REQUIREMENT_AUTO_ADOPTED).toBe(false);
    expect(D6_PROCESS_ASSUMPTION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(PROCESS_ASSUMPTION_EQUALS_VALIDATED_FACT || ASSUMPTION_EQUALS_VALIDATED_FACT || PROCESS_ASSUMPTION_EQUALS_ENGINEERING_VALIDATED || AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_ASSUMPTION || AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_REQUIREMENT).toBe(false);
    expect(D6_PROCESS_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(AI_RECOMMENDATION_EQUALS_PROCESS_ENGINEERING_DECISION || ADMIN_ACTION_EQUALS_PROCESS_ENGINEERING_DECISION || PROCESS_ENGINEERING_DECISION_EQUALS_APPROVAL || AI_CAN_CREATE_PROCESS_ENGINEERING_DECISION_WITHOUT_AUTHORITY).toBe(false);
    expect(D6_PROCESS_CHANGE_GOVERNANCE_IMPLEMENTED && D6_R7_EXPLICIT_CHANGE_DEPENDENCY_REQUIRED).toBe(true);
    expect(D6_R7_INFERRED_CHANGE_DEPENDENCY_ALLOWED).toBe(false);
    expect(D6_R7_SUPERSESSION_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(SUPERSEDED_D6_RECORD_DELETED || SUPERSEDED_D6_RECORD_EQUALS_INVALID).toBe(false);
    expect(D6_R7_REASSESSMENT_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID || REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED || REASSESSMENT_COMPLETED_EQUALS_VALIDATED || REASSESSMENT_COMPLETED_EQUALS_APPROVED || REASSESSMENT_COMPLETED_EQUALS_CONFORMANT || ADMIN_CAN_CLOSE_PROCESS_REASSESSMENT_AS_VALIDATED).toBe(false);
    expect(D6_R7_EXPLICIT_DEPENDENT_STALENESS_SUPPORTED).toBe(true);
    expect(D6_R7_INFERRED_STALENESS_PROPAGATION_ALLOWED).toBe(false);
    expect(D6_R7_R1_IDENTITY_CHANGE_INTEGRATION_IMPLEMENTED && D6_R7_R2_CONTEXT_CHANGE_INTEGRATION_IMPLEMENTED && D6_R7_R3_CHANGE_INTEGRATION_IMPLEMENTED && D6_R7_R4_CHANGE_INTEGRATION_IMPLEMENTED && D6_R7_R5_CHANGE_INTEGRATION_IMPLEMENTED && D6_R7_R6_CHANGE_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D6_CHANGE_AUTO_RECALCULATES_R3_CONDITION || D6_CHANGE_AUTO_REWRITES_R3_DESIGN_BASIS || D6_CHANGE_AUTO_ADOPTS_NEW_PROCESS_CONDITION).toBe(false);
    expect(D6_CHANGE_AUTO_RECALCULATES_R4_EVIDENCE || D6_CHANGE_AUTO_REVALIDATES_R4_EVIDENCE || D6_CHANGE_AUTO_REWRITES_EXTERNAL_RESULT).toBe(false);
    expect(D6_CHANGE_AUTO_RECALCULATES_EQUIPMENT_DUTY || D6_CHANGE_AUTO_RESELECTS_EQUIPMENT || D6_CHANGE_AUTO_REWRITES_UTILITY_REQUIREMENT).toBe(false);
    expect(D6_CHANGE_AUTO_RECALCULATES_RELIEF_LOAD || D6_CHANGE_AUTO_RESIZES_RELIEF_DEVICE || D6_CHANGE_AUTO_RECALCULATES_DEPRESSURING || D6_CHANGE_AUTO_REDETERMINES_SIL || D6_CHANGE_AUTO_CLOSES_HAZARD_FINDING || D6_CHANGE_AUTO_APPROVES_SAFEGUARD).toBe(false);
    expect(D6_CHANGE_AUTO_REPOINTS_R1_IDENTITY_HISTORY || D6_CHANGE_AUTO_REWRITES_R2_SYSTEM_STREAM_CONTEXT).toBe(false);
    expect(D6_CHANGE_AUTO_RECALCULATES_ENGINEERING || D6_CHANGE_AUTO_REDESIGNS_ENGINEERING || D6_CHANGE_AUTO_REVALIDATES_ENGINEERING || D6_CHANGE_AUTO_APPROVES_ENGINEERING || D6_CHANGE_AUTO_DETERMINES_CONFORMANCE || D6_CHANGE_AUTO_CERTIFIES_ENGINEERING).toBe(false);
    expect(CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_ENGINEERING || CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D4 || CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D5 || CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D7 || CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D8).toBe(false);
    expect(D6_R7_ASSUMPTION_CHANGE_GOVERNED).toBe(true);
    expect(CHANGED_ASSUMPTION_AUTO_RECALCULATES_PROCESS_DESIGN || CHANGED_ASSUMPTION_AUTO_INVALIDATES_ALL_DEPENDENTS).toBe(false);
    expect(D6_R7_DECISION_SUPERSESSION_GOVERNED).toBe(true);
    expect(SUPERSEDED_PROCESS_DECISION_DELETED || SUPERSEDED_PROCESS_DECISION_AUTO_REPLACED_IN_HISTORY).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS && D6_REUSES_CANONICAL_DIGITAL_THREAD && D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED || PARALLEL_D6_DIGITAL_THREAD_CREATED || SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(CURRENT_D6_RECORD_EQUALS_VALIDATED || STALE_D6_RECORD_EQUALS_INVALID || SUPERSEDED_D6_RECORD_EQUALS_INVALID).toBe(false);
    expect(D6_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED || D6_R7_CHANGE_HISTORY_AUTO_REPOINTED).toBe(false);
    expect(D6_R7_PROVENANCE_REQUIRED && D6_R7_PROVENANCE_PRESERVED && D6_R7_SOURCE_BASIS_REQUIRED && D6_R7_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D6_R7_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D6_R7_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R7_ACCESS_ALLOWED).toBe(false);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(D6_EQUALS_D1_STRUCTURAL_AUTHORITY || D6_EQUALS_D2_CIVIL_AUTHORITY || D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D6_EQUALS_D4_MECHANICAL_AUTHORITY || D6_EQUALS_D5_PIPING_AUTHORITY || D6_EQUALS_D7_ELECTRICAL_AUTHORITY || D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D6_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED && D6_R7_REPLAY_PROTECTION_IMPLEMENTED && D6_R7_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT, D6_REVIEW_VALIDATION_RUNTIME_COUNT, D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D6_D9_RUNTIME_INTEGRATION_COUNT, D6_PROCESS_CALCULATION_RUNTIME_COUNT,
      D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT, D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT, D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
      D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT, D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT, D6_RELIEF_CALCULATION_RUNTIME_COUNT,
      D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT, D6_UTILITY_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
      D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT, D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D6_APPROVAL_RUNTIME_COUNT, D6_CERTIFICATION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
    ]).toEqual(Array(24).fill(0));
    expect(D1_STRUCTURAL_PACK_COMPLETE || D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && !D2_REOPENED && D3_TRACK_COMPLETE && !D3_REOPENED && D4_TRACK_COMPLETE && !D4_REOPENED && D5_TRACK_COMPLETE && !D5_REOPENED).toBe(true);
    expect(D7_RUNTIME_STARTED || D8_RUNTIME_STARTED || D9_RUNTIME_STARTED || D9_RUNTIME_COUNT !== 0).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const actor = { actorId: "proc-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D6_CONTEXT_AUTHORITY };
    const r1 = createD6R1Store();
    recordProcessContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: string) => recordProcessObjectIdentity(r1, actor, {
      objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`,
    });
    const system = identity("sys-1", "PROCESS_SYSTEM");
    const stream = identity("stream-1", "PROCESS_STREAM");
    const operatingIdentity = identity("op-1", "PROCESS_OPERATING_CASE");
    const basisIdentity = identity("basis-obj", "PROCESS_DESIGN_BASIS");
    const evidenceIdentity = identity("ev-1", "PROCESS_CALCULATION_EVIDENCE");
    const dutyIdentity = identity("duty-1", "PROCESS_EQUIPMENT_DUTY");
    const utilityIdentity = identity("util-1", "PROCESS_UTILITY_REQUIREMENT");
    const safetyIdentity = identity("safety-1", "PROCESS_SAFETY_CONTEXT");
    const r2 = createD6R2Store(r1, createD5R1Store());
    const bound2 = (objectId: string, fingerprint: string) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", provenanceRef: "prov-r2", sourceBasisRef: "basis-r2",
      citedCurrentness: "CURRENT", applicability: `applies only to ${objectId}`, limitations: "descriptive context only",
    });
    const systemContext = recordProcessSystemContext(r2, actor, { ...bound2(system.objectId, system.fingerprint), systemRecordId: "sys-rec", purpose: "Feed preparation system", systemFunction: "SEPARATION", systemCategory: "PRIMARY_PROCESS_SYSTEM" });
    const streamContext = recordProcessStreamContext(r2, actor, { ...bound2(stream.objectId, stream.fingerprint), streamRecordId: "stream-rec", streamFunction: "FEED" });
    const r3 = createD6R3Store(r2);
    const bound3 = (objectId: string, fingerprint: string) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", provenanceRef: "prov-r3", sourceBasisRef: "basis-r3",
      citedCurrentness: "CURRENT", applicability: `applies only to ${objectId}`, limitations: "supplied value only",
    });
    const operatingCase = recordProcessOperatingCaseContext(r3, actor, { ...bound3(operatingIdentity.objectId, operatingIdentity.fingerprint), caseRecordId: "op-rec", caseName: "Normal operation", caseType: "NORMAL_OPERATION" });
    const condition = recordProcessOperatingCondition(r3, actor, {
      ...bound3(stream.objectId, stream.fingerprint), conditionId: "op-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa", r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const basis = recordProcessDesignBasisContext(r3, actor, {
      ...bound3(basisIdentity.objectId, basisIdentity.fingerprint), basisRecordId: "basis-rec", basisStatement: "Basis statement was supplied for this stream", sourceDocumentRef: "PDB-1",
      operatingCaseRecordId: operatingCase.caseRecordId, operatingCaseFingerprint: operatingCase.fingerprint,
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
    const utility = recordSuppliedProcessUtilityEvidence(r5, actor, {
      contextId: "ctx-1", objectId: utilityIdentity.objectId, objectRevisionFingerprint: utilityIdentity.fingerprint,
      subjectObjectId: system.objectId, subjectRevisionFingerprint: system.fingerprint, utilityRecordId: "steam-1",
      citedLifecycleStage: "FEED", provenanceRef: "prov-util", sourceBasisRef: "basis-util", citedCurrentness: "CURRENT",
      applicability: `applies only to ${system.objectId} and ${utilityIdentity.objectId}`, limitations: "supplied utility evidence only",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2SystemRecordId: systemContext.systemRecordId, r2SystemFingerprint: systemContext.fingerprint, utilityType: "STEAM", value: "2", unit: "t/h",
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
    const before = {
      objects: JSON.stringify(r1.objects),
      streams: JSON.stringify(r2.streams),
      conditions: JSON.stringify(r3.conditions),
      bases: JSON.stringify(r3.bases),
      evidence: JSON.stringify(r4.evidence),
      duties: JSON.stringify(r5.duties),
      utilities: JSON.stringify(r5.utilities),
      safety: JSON.stringify(r6.records),
    };
    const store = createD6R7Store(r6);
    const subject = {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      citedCurrentness: "CURRENT", citedLifecycleStage: "FEED", applicability: `applies only to ${stream.objectId}`,
      limitations: "governed process context only", provenanceRef: "prov-r7", sourceBasisRef: "basis-r7",
    };
    const source = recordProcessSourceRequirement(store, actor, {
      ...subject, requirementId: "req-source", statement: "The feed stream shall retain the supplied operating pressure",
      requirementCategory: "DESIGN_INPUT", sourceClass: "SOURCE_REQUIREMENT", sourceRef: "PDB-1", sourceRevision: "A",
    });
    expect(source.adopted).toBe(false);
    expect(source.engineeringValidated).toBe(false);
    expect(source.conformant).toBe(false);
    expect(recordProcessSourceRequirement(store, actor, {
      ...subject, requirementId: "req-source", statement: "The feed stream shall retain the supplied operating pressure",
      requirementCategory: "DESIGN_INPUT", sourceClass: "SOURCE_REQUIREMENT", sourceRef: "PDB-1", sourceRevision: "A",
    })).toBe(source);
    const adopted = recordAdoptedProcessRequirement(store, actor, {
      ...subject, requirementId: "req-adopted", sourceRequirementId: source.requirementId,
      statement: "The feed stream shall retain the supplied operating pressure",
      requirementCategory: "DESIGN_INPUT", sourceClass: "SOURCE_REQUIREMENT", sourceRef: "PDB-1", sourceRevision: "A",
      adoptionRationale: "Process context authority adopted the source statement without changing it",
    });
    expect(adopted.adopted).toBe(true);
    expect(adopted.sourceRequirementFingerprint).toBe(source.fingerprint);
    expect(store.requirements.find((row) => row.requirementId === source.requirementId)?.adopted).toBe(false);
    expect(store.requirements.find((row) => row.requirementId === source.requirementId)?.recordStatus).toBe("CURRENT");
    const assumption = recordProcessAssumption(store, actor, { ...subject, assumptionId: "asm-1", statement: "The supplied study boundary remains applicable to this stream" });
    const untouched = recordProcessAssumption(store, actor, { ...subject, assumptionId: "asm-2", statement: "A second supplied boundary remains applicable to this stream" });
    expect(assumption.validationStatus).toBe("unvalidated");
    expect(assumption.validatedFact).toBe(false);
    expect(assumption.engineeringValidated).toBe(false);
    const decision = recordProcessEngineeringDecision(store, actor, {
      ...subject, decisionId: "dec-1", statement: "Retain the supplied operating pressure as the governed process requirement",
      alternatives: [
        { id: "keep", statement: "Retain the supplied statement", is_selected: true },
        { id: "revise", statement: "Revise the supplied statement", is_selected: false },
      ],
    });
    expect(decision.authoritativeDecision).toBe(true);
    expect(decision.aiRecommendation).toBe(false);
    expect(decision.approved).toBe(false);
    const originalDecisionHistory = store.history.filter((row) => row.subjectId === decision.decisionId).map((row) => row.fingerprint);
    const nextDecision = recordProcessEngineeringDecision(store, actor, {
      ...subject, decisionId: "dec-2", predecessorDecisionId: decision.decisionId,
      statement: "Retain the revised supplied operating pressure as the governed process requirement",
      alternatives: [{ id: "keep", statement: "Retain the revised supplied statement", is_selected: true }],
    });
    const storedDecision = store.decisions.find((row) => row.decisionId === decision.decisionId);
    expect(storedDecision?.recordStatus).toBe("SUPERSEDED");
    expect(storedDecision?.deleted).toBe(false);
    expect(storedDecision?.invalidated).toBe(false);
    expect(storedDecision?.fingerprint).toBe(decision.fingerprint);
    expect(nextDecision.predecessorFingerprint).toBe(decision.fingerprint);
    expect(store.history.filter((row) => row.subjectId === decision.decisionId).slice(0, originalDecisionHistory.length).map((row) => row.fingerprint)).toEqual(originalDecisionHistory);
    const link = (targetKind: string, targetId: string, targetFingerprint: string) => ({ kind: "OBJECT_REFERENCE", targetKind, targetId, targetFingerprint });
    const change = recordProcessChange(store, actor, {
      ...subject, changeId: "chg-1", changeCategory: "R3_CONDITION_CHANGED", reason: "The source document revision was explicitly replaced",
      dependencies: [
        link("R1_IDENTITY", stream.objectId, stream.fingerprint),
        link("R2_STREAM", streamContext.streamRecordId, streamContext.fingerprint),
        link("R3_CONDITION", condition.conditionId, condition.fingerprint),
        link("R3_DESIGN_BASIS", basis.basisRecordId, basis.fingerprint),
        link("R4_EVIDENCE", energy.evidenceId, energy.fingerprint),
        link("R5_DUTY", duty.requirementId, duty.fingerprint),
        link("R5_UTILITY", utility.utilityRecordId, utility.fingerprint),
        link("R6_SAFETY", safety.recordId, safety.fingerprint),
        link("R7_REQUIREMENT", source.requirementId, source.fingerprint),
        link("R7_ASSUMPTION", assumption.assumptionId, assumption.fingerprint),
      ],
    });
    const mark = markProcessDependentCurrentness(store, actor, {
      ...subject, markId: "mark-1", changeId: change.changeId, targetKind: "R3_CONDITION", targetId: condition.conditionId, targetFingerprint: condition.fingerprint, mark: "STALE",
    });
    expect(mark.mark).toBe("STALE");
    expect(mark.invalidated).toBe(false);
    expect(condition.recordStatus).toBe("CURRENT");
    expect(condition.measure).toEqual({ value: "150", unit: "kPa" });
    const required = recordProcessReassessment(store, actor, {
      ...subject, reassessmentId: "ras-required", changeId: change.changeId, targetId: condition.conditionId, targetFingerprint: condition.fingerprint, state: "REASSESSMENT_REQUIRED",
    });
    const completed = recordProcessReassessment(store, actor, {
      ...subject, reassessmentId: "ras-done", changeId: change.changeId, targetId: assumption.assumptionId, targetFingerprint: assumption.fingerprint, state: "REASSESSMENT_COMPLETED",
    });
    expect(required.validationFailed).toBe(false);
    expect(required.engineeringValidated).toBe(false);
    expect(completed.engineeringValidated).toBe(false);
    expect(completed.approved).toBe(false);
    expect(completed.conformant).toBe(false);
    expect(store.currentnessMarks.some((row) => row.targetId === untouched.assumptionId)).toBe(false);
    expect(untouched.recordStatus).toBe("CURRENT");
    expect(untouched.invalidated).toBe(false);
    expect(JSON.stringify(r1.objects)).toBe(before.objects);
    expect(JSON.stringify(r2.streams)).toBe(before.streams);
    expect(JSON.stringify(r3.conditions)).toBe(before.conditions);
    expect(JSON.stringify(r3.bases)).toBe(before.bases);
    expect(JSON.stringify(r4.evidence)).toBe(before.evidence);
    expect(JSON.stringify(r5.duties)).toBe(before.duties);
    expect(JSON.stringify(r5.utilities)).toBe(before.utilities);
    expect(JSON.stringify(r6.records)).toBe(before.safety);
    expect(energy.results.find((row) => row.name === "DUTY")?.measure).toEqual({ value: "1500", unit: "kW" });
    expect(duty.measure).toEqual({ value: "1400", unit: "kW" });
    expect(safety.hazardClosed).toBe(false);

    const reject = (run: () => void) => expect(run).toThrow(/D6_R7_/);
    const badReq = { ...subject, requirementId: "bad", statement: "A distinct supplied requirement statement", requirementCategory: "DESIGN_INPUT", sourceClass: "SOURCE_REQUIREMENT", sourceRef: "PDB-2", sourceRevision: "A" };
    reject(() => recordProcessSourceRequirement(store, actor, { ...badReq, sourceAutoAdopt: true }));
    reject(() => recordProcessSourceRequirement(store, actor, { ...badReq, requirementId: "bad-vendor", sourceClass: "VENDOR_REQUIREMENT", vendorAutoAdopt: true }));
    reject(() => recordProcessSourceRequirement(store, actor, { ...badReq, requirementId: "bad-ai-req", aiGeneratedAutoAdopt: true }));
    reject(() => recordProcessSourceRequirement(store, actor, { ...badReq, requirementId: "bad-status", requirementStatus: "ACCEPTED_FOR_PURPOSE" }));
    reject(() => recordAdoptedProcessRequirement(store, actor, { ...badReq, requirementId: "bad-adopt", sourceRequirementId: source.requirementId, statement: source.statement, sourceRef: "PDB-1", adoptionRationale: "" }));
    reject(() => recordProcessAssumption(store, actor, { ...subject, assumptionId: "bad-fact", statement: "Another assumption statement", validationStatus: "validated" }));
    reject(() => recordProcessAssumption(store, actor, { ...subject, assumptionId: "bad-invent", statement: "Another assumption statement", inventAssumption: true }));
    reject(() => recordProcessEngineeringDecision(store, actor, { ...subject, decisionId: "bad-ai", statement: "An unauthorized decision statement", aiRecommendation: true, alternatives: [{ id: "only", statement: "Only alternative", is_selected: true }] }));
    reject(() => recordProcessChange(store, actor, { ...subject, changeId: "bad-empty", changeCategory: "REQUIREMENT_CHANGED", reason: "No dependency was supplied", dependencies: [] }));
    reject(() => recordProcessChange(store, actor, { ...subject, changeId: "bad-infer", changeCategory: "REQUIREMENT_CHANGED", reason: "An inferred link was offered", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_CONDITION", targetId: condition.conditionId, targetFingerprint: condition.fingerprint, inferred: true }] }));
    reject(() => recordProcessChange(store, actor, { ...subject, changeId: "bad-fp", changeCategory: "R4_EVIDENCE_CHANGED", reason: "A spoofed evidence revision was offered", dependencies: [link("R4_EVIDENCE", energy.evidenceId, "spoof")] }));
    reject(() => recordProcessChange(store, actor, { ...subject, changeId: "bad-float", changeCategory: "R2_CONTEXT_CHANGED", reason: "A floating revision was offered", r2Fingerprint: "latest", dependencies: [link("R2_STREAM", streamContext.streamRecordId, streamContext.fingerprint)] }));
    reject(() => markProcessDependentCurrentness(store, actor, { ...subject, markId: "bad-mark", changeId: change.changeId, targetKind: "R7_ASSUMPTION", targetId: untouched.assumptionId, targetFingerprint: untouched.fingerprint, mark: "STALE" }));
    reject(() => markProcessDependentCurrentness(store, actor, { ...subject, markId: "bad-broad", changeId: change.changeId, targetKind: "R3_CONDITION", targetId: condition.conditionId, targetFingerprint: condition.fingerprint, mark: "STALE", inferredStaleness: true }));
    reject(() => recordProcessReassessment(store, actor, { ...subject, reassessmentId: "bad-close", changeId: change.changeId, targetId: condition.conditionId, targetFingerprint: condition.fingerprint, state: "REASSESSMENT_COMPLETED", closeAsValidated: true }));
    reject(() => recordProcessChange(store, actor, { ...subject, changeId: "bad-calc", changeCategory: "R5_DUTY_CHANGED", reason: "A calculation was requested", recalculateDuty: true, dependencies: [link("R5_DUTY", duty.requirementId, duty.fingerprint)] }));
    reject(() => recordProcessChange(store, actor, { ...subject, changeId: "bad-relief", changeCategory: "R6_SAFETY_CHANGED", reason: "A relief calculation was requested", recalculateRelief: true, dependencies: [link("R6_SAFETY", safety.recordId, safety.fingerprint)] }));
    reject(() => recordProcessChange(store, actor, { ...subject, changeId: "bad-d4", changeCategory: "REQUIREMENT_CHANGED", reason: "A mechanical update was requested", updateD4: true, dependencies: [link("R7_REQUIREMENT", source.requirementId, source.fingerprint)] }));
    reject(() => recordProcessSourceRequirement(store, actor, { ...badReq, requirementId: "bad-scope", tenantId: "t2" }));
    reject(() => recordProcessAssumption(store, { ...actor, actorId: "AI_1" }, { ...subject, assumptionId: "bad-ai", statement: "Invented assumption" }));
    reject(() => recordProcessReassessment(store, { ...actor, authority: "ADMIN" }, { ...subject, reassessmentId: "bad-admin", changeId: change.changeId, targetId: condition.conditionId, targetFingerprint: condition.fingerprint, state: "REASSESSMENT_COMPLETED", closeAsValidated: true }));
    reject(() => recordProcessSourceRequirement(store, actor, { ...badReq, requirementId: "bad-assert", assertedFingerprint: "spoof" }));
    reject(() => recordProcessSourceRequirement(store, actor, { ...subject, requirementId: "req-dup", statement: source.statement, requirementCategory: "DESIGN_INPUT", sourceClass: "SOURCE_REQUIREMENT", sourceRef: "PDB-9", sourceRevision: "A" }));
    expect(JSON.stringify(r3.conditions)).toBe(before.conditions);
    expect(JSON.stringify(r4.evidence)).toBe(before.evidence);
    expect(JSON.stringify(r5.duties)).toBe(before.duties);
    expect(JSON.stringify(r6.records)).toBe(before.safety);
    expect(recalculateProcessFromChange).toThrow(/D6_R7_/);
    expect(redesignProcessFromChange).toThrow(/D6_R7_/);
    expect(revalidateProcessFromChange).toThrow(/D6_R7_/);
    expect(approveProcessFromChange).toThrow(/D6_R7_/);
    expect(determineProcessConformance).toThrow(/D6_R7_/);
    expect(certifyProcessFromChange).toThrow(/D6_R7_/);
    expect(inferProcessChangeDependency).toThrow(/D6_R7_/);
    expect(repointProcessGovernance).toThrow(/D6_R7_/);
    expect(closeProcessReassessmentAsValidated).toThrow(/D6_R7_/);
    expect(updateCounterpartFromRequirement).toThrow(/D6_R7_/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "requirements-assumptions-change.ts"), "utf8");
    expect(sourceText).toMatch(/assertHumanApprovalActor|assertAssumptionValidationStatus|assertSupersessionPair|INFORMATION_REQUIREMENT_STATUSES/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "requirements-assumptions-change.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
