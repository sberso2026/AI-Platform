import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D6_EQUIPMENT_DUTY_RUNTIME_COUNT as ARCHITECTURE_DUTY_COUNT, D6_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D4_CONTEXT_AUTHORITY, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity } from "../mechanical/identity-foundation";
import { createD5R1Store } from "../piping/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D6_CONTEXT_AUTHORITY, createD6R1Store, recordProcessContext, recordProcessObjectIdentity } from "./identity-foundation";
import { createD6R2Store, recordProcessStreamContext, recordProcessSystemContext } from "./system-stream-service-context";
import { createD6R3Store, recordProcessDesignCaseContext, recordProcessOperatingCaseContext, recordProcessOperatingCondition } from "./operating-design-basis-conditions";
import {
  D6_EQUIPMENT_DUTY_RUNTIME_COUNT as R4_DUTY_COUNT,
  D6_R5_STARTED,
  D6_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  createD6R4Store,
  recordProcessCalculationEvidence,
} from "./process-evidence-balances";
import {
  AI_CAN_INVENT_AUTHORITATIVE_D6_EQUIPMENT_DUTY,
  AI_CAN_INVENT_AUTHORITATIVE_D6_UTILITY_REQUIREMENT,
  AI_CAN_SILENTLY_CHANGE_D6_R5_UNITS,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_CAN_PROMOTE_UNGOVERNED_D6_R5_CONTEXT_TO_ENGINEERING_TRUTH,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D6_R5_RECORD_AUTO_ACCEPTED,
  CROSS_TENANT_D6_R5_ACCESS_ALLOWED,
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
  D6_ADOPTED_PROCESS_EQUIPMENT_REQUIREMENT_SUPPORTED,
  D6_APPROVAL_RUNTIME_COUNT,
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
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_CASE_APPLICABILITY_EXPLICIT,
  D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_IMPLEMENTED,
  D6_EQUIPMENT_DUTY_RUNTIME_READY,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CAPACITY_PERFORMANCE_REQUIREMENT_IMPLEMENTED,
  D6_PROCESS_EQUIPMENT_DUTY_CONTEXT_IMPLEMENTED,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_PROCESS_UTILITY_CONTEXT_IMPLEMENTED,
  D6_R1_IDENTITY_REUSED,
  D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED,
  D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED,
  D6_R4_PROCESS_EVIDENCE_CONTEXT_REUSED,
  D6_R5_APPLICABILITY_EXPLICIT,
  D6_R5_AUTO_CREATES_PROCESS_SAFETY_REQUIREMENT,
  D6_R5_AUTO_CREATES_RELIEF_SCENARIO,
  D6_R5_AUTO_INFERS_SAFEGUARD,
  D6_R5_AUTO_MATCHES_EQUIPMENT_TO_DUTY,
  D6_R5_AUTO_MUTATES_D4_RECORD,
  D6_R5_AUTO_MUTATES_D5_LINE_OR_PIPING_CONTEXT,
  D6_R5_AUTO_MUTATES_R3_DESIGN_BASIS,
  D6_R5_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D6_R5_AUTO_MUTATES_R3_OPERATING_CONDITION,
  D6_R5_AUTO_MUTATES_R4_EVIDENCE,
  D6_R5_AUTO_PROPAGATES_DUTY_ACROSS_CASES,
  D6_R5_AUTO_PROPAGATES_UTILITY_REQUIREMENT_ACROSS_CASES,
  D6_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D6_R5_AUTO_REPOINTED,
  D6_R5_AUTO_REPOINTS_D4_REFERENCE,
  D6_R5_AUTO_REVALIDATES_R4_EVIDENCE,
  D6_R5_CALCULATES_EQUIPMENT_DUTY,
  D6_R5_CALCULATES_UTILITY_CONSUMPTION,
  D6_R5_CAN_REFERENCE_D4_MECHANICAL_CONTEXT,
  D6_R5_CAN_REFERENCE_R4_ENERGY_BALANCE_EVIDENCE,
  D6_R5_CAN_REFERENCE_R4_HYDRAULIC_EVIDENCE,
  D6_R5_CREATES_D7_ELECTRICAL_DESIGN,
  D6_R5_CREATES_D8_IAC_DESIGN,
  D6_R5_DERIVES_MISSING_EQUIPMENT_DUTY,
  D6_R5_DERIVES_MISSING_UTILITY_DEMAND,
  D6_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R5_HIDDEN_CALCULATION_ALLOWED,
  D6_R5_HIDDEN_EQUIPMENT_DUTY_CALCULATION_ALLOWED,
  D6_R5_HISTORY_PRESERVED,
  D6_R5_LIMITATIONS_EXPLICIT,
  D6_R5_PROVENANCE_PRESERVED,
  D6_R5_PROVENANCE_REQUIRED,
  D6_R5_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R5_REUSES_R4_EVIDENCE_WITHOUT_MUTATION,
  D6_R5_SELECTS_EQUIPMENT,
  D6_R5_SELECTS_EQUIPMENT_TYPE,
  D6_R5_SELECTS_MODEL,
  D6_R5_SELECTS_VENDOR,
  D6_R5_SIZES_COMPRESSOR,
  D6_R5_SIZES_HEAT_EXCHANGER,
  D6_R5_SIZES_OTHER_MECHANICAL_EQUIPMENT,
  D6_R5_SIZES_PUMP,
  D6_R5_SIZES_VESSEL,
  D6_R5_SOURCE_AUTO_REPOINTED,
  D6_R5_SOURCE_BASIS_REQUIRED,
  D6_R5_SOURCE_BASIS_TRACEABLE,
  D6_R5_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R5_TRANSFERS_D4_AUTHORITY,
  D6_R5_TRANSFERS_D5_AUTHORITY,
  D6_R5_TRANSFERS_D7_AUTHORITY,
  D6_R5_TRANSFERS_D8_AUTHORITY,
  D6_R5_UNITS_PRESERVED,
  D6_R5_UNITS_REQUIRED,
  D6_R5_VALIDATES_D4_MECHANICAL_ENGINEERING,
  D6_R5_VALIDATES_D5_PIPING_ENGINEERING,
  D6_R6_STARTED,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_SUPPLIED_EQUIPMENT_DUTY_EVIDENCE_SUPPORTED,
  D6_SUPPLIED_UTILITY_EVIDENCE_SUPPORTED,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D6_UTILITY_REQUIREMENT_CASE_APPLICABILITY_EXPLICIT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  ENERGY_BALANCE_RESULT_AUTO_CREATES_MECHANICAL_REQUIREMENT,
  ENERGY_BALANCE_RESULT_EQUALS_ADOPTED_EQUIPMENT_DUTY,
  EXACT_D4_MECHANICAL_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_R1_R4_REFERENCE_REQUIRED,
  EXACT_D6_R3_DESIGN_CASE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_R3_OPERATING_CASE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_R4_EVIDENCE_REVISION_REQUIRED,
  FLOATING_D6_R5_SOURCE_REFERENCE_ALLOWED,
  HYDRAULIC_RESULT_AUTO_CREATES_MECHANICAL_SELECTION,
  HYDRAULIC_RESULT_EQUALS_VALIDATED_PUMP_DUTY,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PROCESS_CAPACITY_REQUIREMENT_EQUALS_MECHANICAL_DESIGN,
  PROCESS_EQUIPMENT_DUTY_EQUALS_EQUIPMENT_SIZED_BY_EOS,
  PROCESS_EQUIPMENT_DUTY_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
  PROCESS_EQUIPMENT_DUTY_EQUALS_VALIDATED_MECHANICAL_SELECTION,
  PROCESS_PERFORMANCE_REQUIREMENT_EQUALS_VALIDATED_EQUIPMENT_PERFORMANCE,
  PROCESS_UTILITY_REQUIREMENT_EQUALS_UTILITY_CALCULATED_BY_EOS,
  PROCESS_UTILITY_REQUIREMENT_EQUALS_VALIDATED_UTILITY_SYSTEM_DESIGN,
  R4_EVIDENCE_REFERENCE_EQUALS_R5_ENGINEERING_VALIDATION,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D6_R5_MUTATION_ALLOWED,
  SUPPLIED_EQUIPMENT_DUTY_AUTO_ADOPTED,
  SUPPLIED_EQUIPMENT_DUTY_EQUALS_ADOPTED_PROCESS_REQUIREMENT,
  SUPPLIED_UTILITY_EVIDENCE_AUTO_ADOPTED,
  SUPPLIED_UTILITY_EVIDENCE_EQUALS_VALIDATED_UTILITY_REQUIREMENT,
  TENANT_WORKSPACE_PROJECT_D6_R5_SCOPE_ENFORCED,
  calculateEquipmentDuty,
  calculateUtilityConsumption,
  createD6R5Store,
  createReliefScenarioFromDuty,
  mutateMechanicalRecordFromDuty,
  recordAdoptedProcessEquipmentRequirement,
  recordAdoptedProcessUtilityRequirement,
  recordProcessCapacityPerformanceRequirement,
  recordProcessEquipmentDutyContext,
  recordSuppliedProcessUtilityEvidence,
  selectProcessEquipment,
  sizeProcessEquipment,
  validateProcessDuty,
} from "./equipment-duty-utility-context";

describe("EOS-D6-R5 equipment duty and utility context", () => {
  it("records Process duty and utility requirements without sizing or selecting equipment", () => {
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D6_EQUIPMENT_DUTY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_EQUIPMENT_DUTY_RUNTIME_COUNT).toBe(1);
    expect(R4_DUTY_COUNT).toBe(0);
    expect(ARCHITECTURE_DUTY_COUNT).toBe(0);
    expect(D6_EQUIPMENT_DUTY_RUNTIME_READY).toBe(true);
    expect(D6_R5_STARTED).toBe(false);
    expect(D6_R6_STARTED).toBe(false);
    expect(D6_R1_IDENTITY_REUSED && D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED && D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED && D6_R4_PROCESS_EVIDENCE_CONTEXT_REUSED).toBe(true);
    expect(D6_PROCESS_IDENTITY_RUNTIME_READY && D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY && D6_DESIGN_BASIS_CONDITION_RUNTIME_READY && D6_PROCESS_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(EXACT_D6_R1_R4_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D6_R5_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D6_R5_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D6_PROCESS_EQUIPMENT_DUTY_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_EQUIPMENT_DUTY_EQUALS_MECHANICAL_EQUIPMENT_DESIGN).toBe(false);
    expect(PROCESS_EQUIPMENT_DUTY_EQUALS_VALIDATED_MECHANICAL_SELECTION).toBe(false);
    expect(PROCESS_EQUIPMENT_DUTY_EQUALS_EQUIPMENT_SIZED_BY_EOS).toBe(false);
    expect(D6_PROCESS_CAPACITY_PERFORMANCE_REQUIREMENT_IMPLEMENTED).toBe(true);
    expect(PROCESS_CAPACITY_REQUIREMENT_EQUALS_MECHANICAL_DESIGN).toBe(false);
    expect(PROCESS_PERFORMANCE_REQUIREMENT_EQUALS_VALIDATED_EQUIPMENT_PERFORMANCE).toBe(false);
    expect(D6_SUPPLIED_EQUIPMENT_DUTY_EVIDENCE_SUPPORTED).toBe(true);
    expect(D6_ADOPTED_PROCESS_EQUIPMENT_REQUIREMENT_SUPPORTED).toBe(true);
    expect(SUPPLIED_EQUIPMENT_DUTY_EQUALS_ADOPTED_PROCESS_REQUIREMENT).toBe(false);
    expect(SUPPLIED_EQUIPMENT_DUTY_AUTO_ADOPTED).toBe(false);
    expect(EXACT_D6_R4_EVIDENCE_REVISION_REQUIRED).toBe(true);
    expect(D6_R5_REUSES_R4_EVIDENCE_WITHOUT_MUTATION).toBe(true);
    expect(R4_EVIDENCE_REFERENCE_EQUALS_R5_ENGINEERING_VALIDATION).toBe(false);
    expect(D6_R5_AUTO_REVALIDATES_R4_EVIDENCE).toBe(false);
    expect(D6_R5_CALCULATES_EQUIPMENT_DUTY).toBe(false);
    expect(D6_R5_DERIVES_MISSING_EQUIPMENT_DUTY).toBe(false);
    expect(D6_R5_HIDDEN_EQUIPMENT_DUTY_CALCULATION_ALLOWED).toBe(false);
    expect(D6_R5_SELECTS_EQUIPMENT || D6_R5_SELECTS_EQUIPMENT_TYPE || D6_R5_SELECTS_VENDOR || D6_R5_SELECTS_MODEL || D6_R5_AUTO_MATCHES_EQUIPMENT_TO_DUTY).toBe(false);
    expect(D6_R5_SIZES_PUMP || D6_R5_SIZES_COMPRESSOR || D6_R5_SIZES_HEAT_EXCHANGER || D6_R5_SIZES_VESSEL || D6_R5_SIZES_OTHER_MECHANICAL_EQUIPMENT).toBe(false);
    expect(D6_R5_CAN_REFERENCE_D4_MECHANICAL_CONTEXT).toBe(true);
    expect(EXACT_D4_MECHANICAL_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(D6_R5_TRANSFERS_D4_AUTHORITY || D6_R5_VALIDATES_D4_MECHANICAL_ENGINEERING || D6_R5_AUTO_MUTATES_D4_RECORD || D6_R5_AUTO_REPOINTS_D4_REFERENCE).toBe(false);
    expect(D6_PROCESS_UTILITY_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_UTILITY_REQUIREMENT_EQUALS_UTILITY_CALCULATED_BY_EOS).toBe(false);
    expect(PROCESS_UTILITY_REQUIREMENT_EQUALS_VALIDATED_UTILITY_SYSTEM_DESIGN).toBe(false);
    expect(D6_R5_CALCULATES_UTILITY_CONSUMPTION).toBe(false);
    expect(D6_R5_DERIVES_MISSING_UTILITY_DEMAND).toBe(false);
    expect(D6_SUPPLIED_UTILITY_EVIDENCE_SUPPORTED).toBe(true);
    expect(SUPPLIED_UTILITY_EVIDENCE_EQUALS_VALIDATED_UTILITY_REQUIREMENT).toBe(false);
    expect(SUPPLIED_UTILITY_EVIDENCE_AUTO_ADOPTED).toBe(false);
    expect(D6_R5_CAN_REFERENCE_R4_ENERGY_BALANCE_EVIDENCE).toBe(true);
    expect(ENERGY_BALANCE_RESULT_EQUALS_ADOPTED_EQUIPMENT_DUTY).toBe(false);
    expect(ENERGY_BALANCE_RESULT_AUTO_CREATES_MECHANICAL_REQUIREMENT).toBe(false);
    expect(D6_R5_CAN_REFERENCE_R4_HYDRAULIC_EVIDENCE).toBe(true);
    expect(HYDRAULIC_RESULT_EQUALS_VALIDATED_PUMP_DUTY).toBe(false);
    expect(HYDRAULIC_RESULT_AUTO_CREATES_MECHANICAL_SELECTION).toBe(false);
    expect(EXACT_D6_R3_OPERATING_CASE_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(EXACT_D6_R3_DESIGN_CASE_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(D6_EQUIPMENT_DUTY_CASE_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D6_UTILITY_REQUIREMENT_CASE_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D6_R5_AUTO_PROPAGATES_DUTY_ACROSS_CASES).toBe(false);
    expect(D6_R5_AUTO_PROPAGATES_UTILITY_REQUIREMENT_ACROSS_CASES).toBe(false);
    expect(D6_R5_UNITS_REQUIRED && D6_R5_UNITS_PRESERVED).toBe(true);
    expect(AI_CAN_SILENTLY_CHANGE_D6_R5_UNITS).toBe(false);
    expect(D6_R5_SOURCE_BASIS_REQUIRED && D6_R5_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D6_R5_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(D6_R5_APPLICABILITY_EXPLICIT && D6_R5_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D6_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D6_R5_AUTO_MUTATES_R3_OPERATING_CONDITION || D6_R5_AUTO_MUTATES_R3_DESIGN_CONDITION || D6_R5_AUTO_MUTATES_R3_DESIGN_BASIS || D6_R5_AUTO_MUTATES_R4_EVIDENCE).toBe(false);
    expect(D6_R5_AUTO_CREATES_RELIEF_SCENARIO || D6_R5_AUTO_CREATES_PROCESS_SAFETY_REQUIREMENT || D6_R5_AUTO_INFERS_SAFEGUARD).toBe(false);
    expect(D6_R5_CREATES_D7_ELECTRICAL_DESIGN || D6_R5_TRANSFERS_D7_AUTHORITY || D6_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D6_R5_CREATES_D8_IAC_DESIGN || D6_R5_TRANSFERS_D8_AUTHORITY || D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D6_R5_VALIDATES_D5_PIPING_ENGINEERING || D6_R5_TRANSFERS_D5_AUTHORITY || D6_R5_AUTO_MUTATES_D5_LINE_OR_PIPING_CONTEXT).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS && D6_REUSES_CANONICAL_DIGITAL_THREAD && D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED || PARALLEL_D6_DIGITAL_THREAD_CREATED || SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D6_R5_HISTORY_PRESERVED).toBe(true);
    expect(D6_R5_AUTO_REPOINTED || SILENT_D6_R5_MUTATION_ALLOWED).toBe(false);
    expect(D6_R5_PROVENANCE_REQUIRED && D6_R5_PROVENANCE_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D6_R5_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R5_ACCESS_ALLOWED).toBe(false);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_EQUIPMENT_DUTY || AI_CAN_INVENT_AUTHORITATIVE_D6_UTILITY_REQUIREMENT || ADMIN_CAN_PROMOTE_UNGOVERNED_D6_R5_CONTEXT_TO_ENGINEERING_TRUTH).toBe(false);
    expect(D6_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED && D6_R5_REPLAY_PROTECTION_IMPLEMENTED && D6_R5_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D6_R5_HIDDEN_CALCULATION_ALLOWED).toBe(false);
    expect([
      D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT, D6_RELIEF_CALCULATION_RUNTIME_COUNT, D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
      D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT, D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT, D6_REVIEW_VALIDATION_RUNTIME_COUNT,
      D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D6_D9_RUNTIME_INTEGRATION_COUNT,
      D6_PROCESS_CALCULATION_RUNTIME_COUNT, D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT, D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
      D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT, D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT, D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
      D6_UTILITY_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D6_APPROVAL_RUNTIME_COUNT,
      D6_CERTIFICATION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
    ]).toEqual(Array(26).fill(0));
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && !D2_REOPENED && D3_TRACK_COMPLETE && !D3_REOPENED && D4_TRACK_COMPLETE && !D4_REOPENED && D5_TRACK_COMPLETE && !D5_REOPENED).toBe(true);
    expect(D7_RUNTIME_STARTED || D8_RUNTIME_STARTED || D9_RUNTIME_STARTED || D9_RUNTIME_COUNT !== 0).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R5.EQUIPMENT_DUTY_AND_UTILITY_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R6.PROCESS_SAFETY_AND_RELIEF_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");

    const actor = { actorId: "proc-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D6_CONTEXT_AUTHORITY };
    const r1 = createD6R1Store();
    recordProcessContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: string, extra: Record<string, unknown> = {}) => recordProcessObjectIdentity(r1, actor, {
      objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, ...extra,
    });
    const system = identity("sys-1", "PROCESS_SYSTEM");
    const stream = identity("stream-1", "PROCESS_STREAM");
    const operatingIdentity = identity("op-1", "PROCESS_OPERATING_CASE");
    const designIdentity = identity("des-1", "PROCESS_DESIGN_CASE");
    const evidenceIdentity = identity("ev-1", "PROCESS_CALCULATION_EVIDENCE");
    const hydraulicIdentity = identity("ev-2", "PROCESS_CALCULATION_EVIDENCE");
    const dutyIdentity = identity("duty-1", "PROCESS_EQUIPMENT_DUTY");
    const capacityIdentity = identity("duty-2", "PROCESS_EQUIPMENT_DUTY");
    const utilityIdentity = identity("util-1", "PROCESS_UTILITY_REQUIREMENT");
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
    const designCase = recordProcessDesignCaseContext(r3, actor, { ...bound3(designIdentity.objectId, designIdentity.fingerprint), caseRecordId: "des-rec", caseName: "Design case", caseType: "DESIGN" });
    recordProcessOperatingCondition(r3, actor, {
      ...bound3(stream.objectId, stream.fingerprint), conditionId: "op-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa", r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const r4 = createD6R4Store(r3);
    const evidenceBase = (evidenceId: string, objectId: string, fingerprint: string) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint,
      evidenceId, citedLifecycleStage: "FEED", provenanceRef: "prov-r4", sourceBasisRef: "basis-r4", citedCurrentness: "CURRENT",
      applicability: `applies only to ${stream.objectId} and ${objectId}`, limitations: "supplied external evidence only",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      sourceToolName: "SupplierBalance", sourceToolVersion: "4.2", sourceModelRevision: "model-a", sourceReportRef: "HMB-014", sourceAuthorityRef: "balance author PE-14",
    });
    const energy = recordProcessCalculationEvidence(r4, actor, {
      ...evidenceBase("energy-1", evidenceIdentity.objectId, evidenceIdentity.fingerprint), evidenceClass: "ENERGY_BALANCE",
      assumptions: ["Enthalpy reference was stated by the supplier"],
      values: [
        { valueId: "ein", role: "INPUT", name: "ENTHALPY_IN", valueKind: "QUANTITY", value: "400", unit: "kJ/kg", basisRef: "EB-2-in" },
        { valueId: "eout", role: "RESULT", name: "DUTY", valueKind: "QUANTITY", value: "1500", unit: "kW", basisRef: "EB-2-out" },
      ],
    });
    const hydraulic = recordProcessCalculationEvidence(r4, actor, {
      ...evidenceBase("hyd-1", hydraulicIdentity.objectId, hydraulicIdentity.fingerprint), evidenceClass: "HYDRAULIC",
      assumptions: ["Hydraulic profile was supplied for this stream only"],
      values: [
        { valueId: "hin", role: "INPUT", name: "FLOW", valueKind: "QUANTITY", value: "12", unit: "m3/h", basisRef: "HY-1-in" },
        { valueId: "hout", role: "RESULT", name: "STATIC_HEAD", valueKind: "QUANTITY", value: "40", unit: "m", basisRef: "HY-1-out" },
      ],
    });
    const mechanical = { actorId: "mech-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D4_CONTEXT_AUTHORITY };
    const d4 = createD4R1Store();
    recordMechanicalContext(d4, mechanical, { contextId: "d4-ctx", citedLifecycleStage: "FEED", provenanceRef: "d4-prov" });
    const pump = recordMechanicalObjectIdentity(d4, mechanical, { objectId: "pump-1", contextId: "d4-ctx", objectType: "ROTATING_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "d4-pump" });
    const before = { evidence: JSON.stringify(r4.evidence), conditions: JSON.stringify(r3.conditions), d4: d4.objects.length };
    const store = createD6R5Store(r4, d4);
    const dutyBase = (requirementId: string, objectId: string, fingerprint: string) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint,
      requirementId, citedLifecycleStage: "FEED", provenanceRef: "prov-r5", sourceBasisRef: "basis-r5", citedCurrentness: "CURRENT",
      applicability: `applies only to ${stream.objectId} and ${objectId}`, limitations: "process requirement only",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const duty = recordProcessEquipmentDutyContext(store, actor, {
      ...dutyBase("duty-rec", dutyIdentity.objectId, dutyIdentity.fingerprint), requirementKind: "HEAT_DUTY", serviceRole: "feed heater process duty",
      availabilityStatement: "Continuous operation was explicitly stated", value: "1400", unit: "kW",
      evidenceId: energy.evidenceId, evidenceFingerprint: energy.fingerprint,
      mechanicalObjectId: pump.objectId, mechanicalRevisionFingerprint: pump.fingerprint,
    });
    expect(duty.disposition).toBe("SUPPLIED");
    expect(duty.measure).toEqual({ value: "1400", unit: "kW" });
    expect(duty.calculatedByEos).toBe(false);
    expect(duty.mechanicalDesign).toBe(false);
    expect(duty.validatedMechanicalSelection).toBe(false);
    expect(duty.sizedByEos).toBe(false);
    expect(duty.equipmentSelected).toBe(false);
    expect(duty.eosValidation).toBe(false);
    expect(duty.adoptedFromEvidenceResult).toBe(false);
    expect(duty.evidenceFingerprint).toBe(energy.fingerprint);
    expect(duty.mechanicalRevisionFingerprint).toBe(pump.fingerprint);
    expect(duty.caseContextFingerprint).toBe(operatingCase.fingerprint);
    expect(recordProcessEquipmentDutyContext(store, actor, {
      ...dutyBase("duty-rec", dutyIdentity.objectId, dutyIdentity.fingerprint), requirementKind: "HEAT_DUTY", serviceRole: "feed heater process duty",
      availabilityStatement: "Continuous operation was explicitly stated", value: "1400", unit: "kW",
      evidenceId: energy.evidenceId, evidenceFingerprint: energy.fingerprint, mechanicalObjectId: pump.objectId, mechanicalRevisionFingerprint: pump.fingerprint,
    })).toBe(duty);
    const adopted = recordAdoptedProcessEquipmentRequirement(store, actor, {
      ...dutyBase("duty-adopted", dutyIdentity.objectId, dutyIdentity.fingerprint), suppliedRequirementId: duty.requirementId, value: "1400", unit: "kW",
    });
    expect(adopted.disposition).toBe("ADOPTED");
    expect(adopted.suppliedRequirementFingerprint).toBe(duty.fingerprint);
    expect(store.duties.find((row) => row.requirementId === duty.requirementId)?.recordStatus).toBe("CURRENT");
    expect(store.duties.find((row) => row.requirementId === duty.requirementId)?.measure).toEqual({ value: "1400", unit: "kW" });
    const capacity = recordProcessCapacityPerformanceRequirement(store, actor, {
      ...dutyBase("cap-rec", capacityIdentity.objectId, capacityIdentity.fingerprint), requirementKind: "PUMPING", value: "35", unit: "m",
      evidenceId: hydraulic.evidenceId, evidenceFingerprint: hydraulic.fingerprint,
    });
    expect(capacity.family).toBe("CAPACITY_PERFORMANCE");
    expect(capacity.measure).toEqual({ value: "35", unit: "m" });
    expect(capacity.equipmentSelected).toBe(false);
    expect(hydraulic.results[0]?.measure).toEqual({ value: "40", unit: "m" });
    const utilityBase = (utilityRecordId: string) => ({
      contextId: "ctx-1", objectId: utilityIdentity.objectId, objectRevisionFingerprint: utilityIdentity.fingerprint,
      subjectObjectId: system.objectId, subjectRevisionFingerprint: system.fingerprint, utilityRecordId,
      citedLifecycleStage: "FEED", provenanceRef: "prov-util", sourceBasisRef: "basis-util", citedCurrentness: "CURRENT",
      applicability: `applies only to ${system.objectId} and ${utilityIdentity.objectId}`, limitations: "supplied utility evidence only",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2SystemRecordId: systemContext.systemRecordId, r2SystemFingerprint: systemContext.fingerprint,
    });
    const utility = recordSuppliedProcessUtilityEvidence(store, actor, { ...utilityBase("steam-1"), utilityType: "STEAM", value: "2", unit: "t/h" });
    expect(utility.disposition).toBe("SUPPLIED");
    expect(utility.calculatedByEos).toBe(false);
    expect(utility.validatedUtilityRequirement).toBe(false);
    expect(utility.validatedUtilitySystemDesign).toBe(false);
    const adoptedUtility = recordAdoptedProcessUtilityRequirement(store, actor, { ...utilityBase("steam-adopted"), suppliedUtilityRecordId: utility.utilityRecordId, value: "2", unit: "t/h" });
    expect(adoptedUtility.disposition).toBe("ADOPTED");
    expect(store.utilities.find((row) => row.utilityRecordId === utility.utilityRecordId)?.recordStatus).toBe("CURRENT");
    expect(store.duties.filter((row) => row.caseRecordId === designCase.caseRecordId)).toEqual([]);
    expect(JSON.stringify(r4.evidence)).toBe(before.evidence);
    expect(JSON.stringify(r3.conditions)).toBe(before.conditions);
    expect(d4.objects).toHaveLength(before.d4);
    expect(energy.results.find((row) => row.name === "DUTY")?.measure).toEqual({ value: "1500", unit: "kW" });
    const replaced = identity("duty-3", "PROCESS_EQUIPMENT_DUTY", { predecessorObjectId: dutyIdentity.objectId });
    const next = recordProcessEquipmentDutyContext(store, actor, {
      ...dutyBase("duty-rec-2", replaced.objectId, replaced.fingerprint), requirementKind: "HEAT_DUTY", serviceRole: "revised feed heater process duty",
      value: "1450", unit: "kW", predecessorRecordId: duty.requirementId,
    });
    expect(next.predecessorRecordId).toBe(duty.requirementId);
    expect(store.duties.find((row) => row.requirementId === duty.requirementId)?.fingerprint).toBe(duty.fingerprint);
    expect(store.duties.find((row) => row.requirementId === duty.requirementId)?.recordStatus).toBe("SUPERSEDED");

    const reject = (run: () => void) => expect(run).toThrow(/D6_R5_/);
    const bad = { ...dutyBase("bad", capacityIdentity.objectId, capacityIdentity.fingerprint), requirementKind: "FLOW_CAPACITY", value: "10", unit: "m3/h" };
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-calc", calculateDuty: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-derive", deriveDuty: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-hidden", hiddenCalculation: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-select", selectEquipment: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-vendor", selectVendor: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-model", selectModel: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-match", autoMatch: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-pump", sizePump: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-hx", sizeHeatExchanger: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-vessel", sizeVessel: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-adopt", autoAdopt: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-spread", propagateAcrossCases: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-copy", evidenceId: energy.evidenceId, evidenceFingerprint: energy.fingerprint, copyEvidenceResult: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-energy", autoCreateFromEnergy: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-hyd", autoCreateFromHydraulic: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-reval", revalidateEvidence: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-r3", mutateOperatingCondition: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-d4", validateMechanical: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-d4-mut", mutateD4: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-relief", createRelief: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-safe", inferSafeguard: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-elec", createElectrical: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-iac", createIac: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-pipe", validatePiping: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-unit", normalizedUnit: "MW" }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-case", caseContextFingerprint: "latest" }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-evidence", evidenceId: energy.evidenceId, evidenceFingerprint: "spoof" }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-mech", mechanicalObjectId: "missing", mechanicalRevisionFingerprint: "missing" }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-omit", value: "" }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-basis", sourceBasisRef: " " }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-scope", tenantId: "t2" }));
    reject(() => recordProcessEquipmentDutyContext(store, { ...actor, actorId: "AI_1" }, { ...bad, requirementId: "bad-ai" }));
    reject(() => recordProcessEquipmentDutyContext(store, { ...actor, authority: "ADMIN" }, { ...bad, requirementId: "bad-admin", promoteToTruth: true }));
    reject(() => recordProcessEquipmentDutyContext(store, actor, { ...bad, requirementId: "bad-fp", assertedFingerprint: "spoof" }));
    reject(() => recordSuppliedProcessUtilityEvidence(store, actor, { ...utilityBase("bad-util"), utilityType: "STEAM", value: "2", unit: "t/h" }));
    reject(() => recordAdoptedProcessUtilityRequirement(store, actor, { ...utilityBase("bad-util-unit"), suppliedUtilityRecordId: utility.utilityRecordId, value: "2", unit: "kg/h" }));
    expect(JSON.stringify(r4.evidence)).toBe(before.evidence);
    expect(JSON.stringify(r3.conditions)).toBe(before.conditions);
    expect(d4.objects).toHaveLength(1);
    expect(calculateEquipmentDuty).toThrow(/D6_R5_/);
    expect(selectProcessEquipment).toThrow(/D6_R5_/);
    expect(sizeProcessEquipment).toThrow(/D6_R5_/);
    expect(calculateUtilityConsumption).toThrow(/D6_R5_/);
    expect(createReliefScenarioFromDuty).toThrow(/D6_R5_/);
    expect(mutateMechanicalRecordFromDuty).toThrow(/D6_R5_/);
    expect(validateProcessDuty).toThrow(/D6_R5_/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "equipment-duty-utility-context.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "equipment-duty-utility-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
