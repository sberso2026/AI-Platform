import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT as ARCHITECTURE_SAFETY_COUNT, D6_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D4_CONTEXT_AUTHORITY, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity } from "../mechanical/identity-foundation";
import { D5_CONTEXT_AUTHORITY, createD5R1Store, recordPipingContext, recordPipingObjectIdentity } from "../piping/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D6_CONTEXT_AUTHORITY, createD6R1Store, recordProcessContext, recordProcessObjectIdentity } from "./identity-foundation";
import { createD6R2Store, recordProcessStreamContext, recordProcessSystemContext } from "./system-stream-service-context";
import { createD6R3Store, recordProcessDesignCaseContext, recordProcessOperatingCaseContext, recordProcessOperatingCondition } from "./operating-design-basis-conditions";
import { createD6R4Store, recordProcessCalculationEvidence } from "./process-evidence-balances";
import {
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT as R5_SAFETY_COUNT,
  D6_R6_STARTED,
  D6_RUNTIME_COUNT as R5_RUNTIME_COUNT,
  createD6R5Store,
  recordProcessEquipmentDutyContext,
  recordSuppliedProcessUtilityEvidence,
} from "./equipment-duty-utility-context";
import {
  AI_CAN_INVENT_AUTHORITATIVE_D6_HAZARD_FINDING,
  AI_CAN_INVENT_AUTHORITATIVE_D6_RELIEF_SCENARIO,
  AI_CAN_INVENT_AUTHORITATIVE_D6_SAFEGUARD_REQUIREMENT,
  AI_CAN_INVENT_D6_R6_ENGINEERING_ASSUMPTION,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_CAN_PROMOTE_UNGOVERNED_D6_R6_CONTEXT_TO_ENGINEERING_TRUTH,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  BASISLESS_AUTHORITATIVE_D6_R6_RECORD_AUTO_ACCEPTED,
  CROSS_TENANT_D6_R6_ACCESS_ALLOWED,
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
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DEPRESSURING_CONTEXT_IMPLEMENTED,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
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
  D6_HAZARD_STUDY_CONTEXT_SUPPORTED,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_PROCESS_HAZARD_FINDING_CONTEXT_IMPLEMENTED,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_PROCESS_SAFETY_CONTEXT_IMPLEMENTED,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_IMPLEMENTED,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_PROCESS_SAFEGUARD_REQUIREMENT_CONTEXT_IMPLEMENTED,
  D6_R1_IDENTITY_REUSED,
  D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED,
  D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED,
  D6_R4_PROCESS_EVIDENCE_CONTEXT_REUSED,
  D6_R5_EQUIPMENT_DUTY_CONTEXT_REUSED,
  D6_R6_APPLICABILITY_EXPLICIT,
  D6_R6_ASSUMPTIONS_EXPLICIT,
  D6_R6_AUTO_ACCEPTS_PROCESS_RISK,
  D6_R6_AUTO_APPROVES_SAFEGUARD,
  D6_R6_AUTO_CLOSES_HAZARD_FINDING,
  D6_R6_AUTO_CREATES_D5_RELIEF_PIPING_DESIGN,
  D6_R6_AUTO_MATCHES_RELIEF_DEVICE_TO_SCENARIO,
  D6_R6_AUTO_MUTATES_D5_PIPING_CONTEXT,
  D6_R6_AUTO_MUTATES_R3_DESIGN_CONDITION,
  D6_R6_AUTO_MUTATES_R3_OPERATING_CONDITION,
  D6_R6_AUTO_MUTATES_R4_EVIDENCE,
  D6_R6_AUTO_MUTATES_R5_EQUIPMENT_DUTY,
  D6_R6_AUTO_MUTATES_R5_UTILITY_CONTEXT,
  D6_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D6_R6_AUTO_REPOINTED,
  D6_R6_AUTO_REVALIDATES_R4_EVIDENCE,
  D6_R6_CALCULATES_RELIEF_LOAD,
  D6_R6_CAN_REFERENCE_D5_PIPING_CONTEXT,
  D6_R6_CREATES_D8_IAC_DESIGN,
  D6_R6_DERIVES_BLOWDOWN_RATE,
  D6_R6_DERIVES_DEPRESSURING_TIME,
  D6_R6_DERIVES_MISSING_RELIEF_LOAD,
  D6_R6_DETERMINES_SIL_TARGET,
  D6_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R6_HIDDEN_RELIEF_CALCULATION_ALLOWED,
  D6_R6_HISTORY_PRESERVED,
  D6_R6_LIMITATIONS_EXPLICIT,
  D6_R6_PERFORMS_DEPRESSURING_CALCULATION,
  D6_R6_PERFORMS_LOPA,
  D6_R6_PERFORMS_RISK_REDUCTION_CALCULATION,
  D6_R6_PROVENANCE_PRESERVED,
  D6_R6_PROVENANCE_REQUIRED,
  D6_R6_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R6_REUSES_R4_EVIDENCE_WITHOUT_MUTATION,
  D6_R6_REUSES_R5_CONTEXT_WITHOUT_MUTATION,
  D6_R6_SELECTS_RELIEF_DEVICE,
  D6_R6_SELECTS_RELIEF_DEVICE_TYPE,
  D6_R6_SELECTS_RELIEF_DEVICE_VENDOR,
  D6_R6_SIL_CALCULATION_ALLOWED,
  D6_R6_SIZES_RELIEF_DEVICE,
  D6_R6_SOURCE_AUTO_REPOINTED,
  D6_R6_SOURCE_BASIS_REQUIRED,
  D6_R6_SOURCE_BASIS_TRACEABLE,
  D6_R6_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R6_TRANSFERS_D4_AUTHORITY,
  D6_R6_TRANSFERS_D5_AUTHORITY,
  D6_R6_TRANSFERS_D8_AUTHORITY,
  D6_R6_VALIDATES_D4_MECHANICAL_ENGINEERING,
  D6_R6_VALIDATES_D5_PIPING_ENGINEERING,
  D6_R6_VALIDATES_D8_IAC_ENGINEERING,
  D6_R6_VALIDATES_SIF,
  D6_R7_STARTED,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_RELIEF_SCENARIO_CONTEXT_IMPLEMENTED,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_SUPPLIED_RELIEF_LOAD_EVIDENCE_SUPPORTED,
  D6_SUPPLIED_SIL_LOPA_EVIDENCE_SUPPORTED,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DEPRESSURING_CONTEXT_EQUALS_DEPRESSURING_CALCULATION_BY_EOS,
  DEPRESSURING_REQUIREMENT_EQUALS_VALIDATED_BLOWDOWN_DESIGN,
  EXACT_D5_PIPING_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_R1_R5_REFERENCE_REQUIRED,
  EXACT_D6_R3_CONDITION_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_R3_DESIGN_CASE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_R3_OPERATING_CASE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_R4_EVIDENCE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D6_R5_DUTY_REVISION_REQUIRED_WHEN_REFERENCED,
  FLOATING_D6_R6_SOURCE_REFERENCE_ALLOWED,
  HAZARD_STUDY_FINDING_EQUALS_APPROVED_SAFEGUARD,
  HAZARD_STUDY_FINDING_EQUALS_ENGINEERING_VALIDATED,
  HAZARD_STUDY_RECORD_EQUALS_EOS_HAZARD_ANALYSIS,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PROCESS_HAZARD_FINDING_EQUALS_APPROVED_SAFEGUARD,
  PROCESS_HAZARD_FINDING_EQUALS_PROCESS_DESIGN_INVALID,
  PROCESS_HAZARD_FINDING_EQUALS_VALIDATED_RISK_REDUCTION,
  PROCESS_SAFETY_CONTEXT_EQUALS_APPROVED_SAFETY_CASE,
  PROCESS_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  PROCESS_SAFETY_CONTEXT_EQUALS_REGULATORY_APPROVAL,
  PROCESS_SAFETY_CONTEXT_EQUALS_VALIDATED_SAFETY_DESIGN,
  PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_APPROVED_SAFEGUARD_DESIGN,
  PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_IAC_IMPLEMENTATION,
  PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_VALIDATED_RISK_REDUCTION,
  R4_EVIDENCE_EQUALS_R6_ENGINEERING_VALIDATION,
  RELIEF_REQUIREMENT_EQUALS_RELIEF_DEVICE_DESIGN,
  RELIEF_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION,
  RELIEF_REQUIREMENT_EQUALS_VALIDATED_RELIEF_DEVICE_SELECTION,
  RELIEF_SCENARIO_EQUALS_ENGINEERING_APPROVAL,
  RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_DESIGN,
  RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_SELECTION,
  RELIEF_SCENARIO_EQUALS_RELIEF_LOAD_CALCULATED_BY_EOS,
  SAFEGUARD_REQUIREMENT_EQUALS_ENGINEERING_APPROVAL,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D6_R6_MUTATION_ALLOWED,
  SUPPLIED_LOPA_RESULT_EQUALS_EOS_RISK_VALIDATION,
  SUPPLIED_RELIEF_LOAD_AUTO_ADOPTED_AS_VALIDATED,
  SUPPLIED_RELIEF_LOAD_EQUALS_RELIEF_LOAD_CALCULATED_BY_EOS,
  SUPPLIED_RELIEF_LOAD_EQUALS_VALIDATED_RELIEF_DEVICE_SIZE,
  SUPPLIED_SIL_TARGET_EQUALS_EOS_SIL_DETERMINATION,
  TENANT_WORKSPACE_PROJECT_D6_R6_SCOPE_ENFORCED,
  UNAUTHORIZED_DEPRESSURING_CALCULATION,
  UNAUTHORIZED_D6_R7_R12_RUNTIME_PROMOTION,
  UNAUTHORIZED_FUNCTIONAL_SAFETY_PROMOTION,
  UNAUTHORIZED_RELIEF_CALCULATION,
  UNAUTHORIZED_RELIEF_DEVICE_SELECTION,
  UNAUTHORIZED_RELIEF_DEVICE_SIZING,
  UNAUTHORIZED_RISK_ACCEPTANCE,
  UNAUTHORIZED_SAFEGUARD_DESIGN,
  UNAUTHORIZED_SIL_CALCULATION,
  UNAUTHORIZED_SIL_TARGET_DETERMINATION,
  acceptProcessRisk,
  calculateReliefLoad,
  createD6R6Store,
  designProcessSafeguard,
  determineSilTarget,
  performDepressuringCalculation,
  performLopa,
  recordDepressuringContext,
  recordHazardStudyContext,
  recordProcessHazardFinding,
  recordProcessSafeguardRequirement,
  recordProcessSafetyContext,
  recordReliefScenarioContext,
  selectReliefDevice,
  sizeReliefDevice,
  validateProcessSafety,
} from "./process-safety-relief-context";

describe("EOS-D6-R6 process safety and relief context", () => {
  it("records Process safety and relief context without calculating loads or designing safeguards", () => {
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D6_PROCESS_SAFETY_RELIEF_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT).toBe(1);
    expect(R5_SAFETY_COUNT).toBe(0);
    expect(ARCHITECTURE_SAFETY_COUNT).toBe(0);
    expect(D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY).toBe(true);
    expect(D6_R6_STARTED).toBe(false);
    expect(D6_R7_STARTED).toBe(false);
    expect(D6_R1_IDENTITY_REUSED && D6_R2_SYSTEM_STREAM_SERVICE_CONTEXT_REUSED && D6_R3_DESIGN_BASIS_CONDITION_CONTEXT_REUSED && D6_R4_PROCESS_EVIDENCE_CONTEXT_REUSED && D6_R5_EQUIPMENT_DUTY_CONTEXT_REUSED).toBe(true);
    expect(D6_PROCESS_IDENTITY_RUNTIME_READY && D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY && D6_DESIGN_BASIS_CONDITION_RUNTIME_READY && D6_PROCESS_EVIDENCE_RUNTIME_READY && D6_EQUIPMENT_DUTY_RUNTIME_READY).toBe(true);
    expect(EXACT_D6_R1_R5_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D6_R6_SOURCE_REFERENCE_ALLOWED || D6_R6_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D6_PROCESS_SAFETY_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_SAFETY_CONTEXT_EQUALS_VALIDATED_SAFETY_DESIGN || PROCESS_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION || PROCESS_SAFETY_CONTEXT_EQUALS_REGULATORY_APPROVAL || PROCESS_SAFETY_CONTEXT_EQUALS_APPROVED_SAFETY_CASE).toBe(false);
    expect(D6_HAZARD_STUDY_CONTEXT_SUPPORTED).toBe(true);
    expect(HAZARD_STUDY_RECORD_EQUALS_EOS_HAZARD_ANALYSIS || HAZARD_STUDY_FINDING_EQUALS_APPROVED_SAFEGUARD || HAZARD_STUDY_FINDING_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D6_PROCESS_HAZARD_FINDING_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_HAZARD_FINDING_EQUALS_PROCESS_DESIGN_INVALID || PROCESS_HAZARD_FINDING_EQUALS_APPROVED_SAFEGUARD || PROCESS_HAZARD_FINDING_EQUALS_VALIDATED_RISK_REDUCTION).toBe(false);
    expect(D6_RELIEF_SCENARIO_CONTEXT_IMPLEMENTED).toBe(true);
    expect(RELIEF_SCENARIO_EQUALS_RELIEF_LOAD_CALCULATED_BY_EOS || RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_DESIGN || RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_SELECTION || RELIEF_SCENARIO_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D6_SUPPLIED_RELIEF_LOAD_EVIDENCE_SUPPORTED).toBe(true);
    expect(SUPPLIED_RELIEF_LOAD_EQUALS_RELIEF_LOAD_CALCULATED_BY_EOS || SUPPLIED_RELIEF_LOAD_EQUALS_VALIDATED_RELIEF_DEVICE_SIZE || SUPPLIED_RELIEF_LOAD_AUTO_ADOPTED_AS_VALIDATED).toBe(false);
    expect(D6_RELIEF_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D6_R6_CALCULATES_RELIEF_LOAD || D6_R6_DERIVES_MISSING_RELIEF_LOAD || D6_R6_HIDDEN_RELIEF_CALCULATION_ALLOWED).toBe(false);
    expect(D6_R6_SIZES_RELIEF_DEVICE || D6_R6_SELECTS_RELIEF_DEVICE || D6_R6_SELECTS_RELIEF_DEVICE_TYPE || D6_R6_SELECTS_RELIEF_DEVICE_VENDOR || D6_R6_AUTO_MATCHES_RELIEF_DEVICE_TO_SCENARIO).toBe(false);
    expect(RELIEF_REQUIREMENT_EQUALS_RELIEF_DEVICE_DESIGN || RELIEF_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION || RELIEF_REQUIREMENT_EQUALS_VALIDATED_RELIEF_DEVICE_SELECTION).toBe(false);
    expect(D6_R6_VALIDATES_D4_MECHANICAL_ENGINEERING || D6_R6_TRANSFERS_D4_AUTHORITY).toBe(false);
    expect(D6_R6_CAN_REFERENCE_D5_PIPING_CONTEXT && EXACT_D5_PIPING_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(D6_R6_VALIDATES_D5_PIPING_ENGINEERING || D6_R6_TRANSFERS_D5_AUTHORITY || D6_R6_AUTO_MUTATES_D5_PIPING_CONTEXT || D6_R6_AUTO_CREATES_D5_RELIEF_PIPING_DESIGN).toBe(false);
    expect(D6_DEPRESSURING_CONTEXT_IMPLEMENTED).toBe(true);
    expect(DEPRESSURING_CONTEXT_EQUALS_DEPRESSURING_CALCULATION_BY_EOS || DEPRESSURING_REQUIREMENT_EQUALS_VALIDATED_BLOWDOWN_DESIGN).toBe(false);
    expect(D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D6_R6_PERFORMS_DEPRESSURING_CALCULATION || D6_R6_DERIVES_DEPRESSURING_TIME || D6_R6_DERIVES_BLOWDOWN_RATE).toBe(false);
    expect(D6_PROCESS_SAFEGUARD_REQUIREMENT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_APPROVED_SAFEGUARD_DESIGN || PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_IAC_IMPLEMENTATION || PROCESS_SAFEGUARD_REQUIREMENT_EQUALS_VALIDATED_RISK_REDUCTION || SAFEGUARD_REQUIREMENT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D6_R6_CREATES_D8_IAC_DESIGN || D6_R6_TRANSFERS_D8_AUTHORITY || D6_R6_VALIDATES_D8_IAC_ENGINEERING || D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D6_R6_SIL_CALCULATION_ALLOWED || D6_R6_DETERMINES_SIL_TARGET || D6_R6_PERFORMS_LOPA || D6_R6_PERFORMS_RISK_REDUCTION_CALCULATION || D6_R6_VALIDATES_SIF).toBe(false);
    expect(D6_SUPPLIED_SIL_LOPA_EVIDENCE_SUPPORTED).toBe(true);
    expect(SUPPLIED_SIL_TARGET_EQUALS_EOS_SIL_DETERMINATION || SUPPLIED_LOPA_RESULT_EQUALS_EOS_RISK_VALIDATION).toBe(false);
    expect(EXACT_D6_R3_OPERATING_CASE_REVISION_REQUIRED_WHEN_REFERENCED && EXACT_D6_R3_DESIGN_CASE_REVISION_REQUIRED_WHEN_REFERENCED && EXACT_D6_R3_CONDITION_REVISION_REQUIRED_WHEN_REFERENCED).toBe(true);
    expect(EXACT_D6_R4_EVIDENCE_REVISION_REQUIRED_WHEN_REFERENCED && D6_R6_REUSES_R4_EVIDENCE_WITHOUT_MUTATION).toBe(true);
    expect(R4_EVIDENCE_EQUALS_R6_ENGINEERING_VALIDATION || D6_R6_AUTO_REVALIDATES_R4_EVIDENCE).toBe(false);
    expect(EXACT_D6_R5_DUTY_REVISION_REQUIRED_WHEN_REFERENCED && D6_R6_REUSES_R5_CONTEXT_WITHOUT_MUTATION).toBe(true);
    expect(D6_R6_AUTO_MUTATES_R3_DESIGN_CONDITION || D6_R6_AUTO_MUTATES_R3_OPERATING_CONDITION || D6_R6_AUTO_MUTATES_R4_EVIDENCE || D6_R6_AUTO_MUTATES_R5_EQUIPMENT_DUTY || D6_R6_AUTO_MUTATES_R5_UTILITY_CONTEXT).toBe(false);
    expect(D6_R6_SOURCE_BASIS_REQUIRED && D6_R6_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(BASISLESS_AUTHORITATIVE_D6_R6_RECORD_AUTO_ACCEPTED).toBe(false);
    expect(D6_R6_APPLICABILITY_EXPLICIT && D6_R6_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D6_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D6_R6_ASSUMPTIONS_EXPLICIT).toBe(true);
    expect(AI_CAN_INVENT_D6_R6_ENGINEERING_ASSUMPTION).toBe(false);
    expect(D6_R6_AUTO_ACCEPTS_PROCESS_RISK || D6_R6_AUTO_CLOSES_HAZARD_FINDING || D6_R6_AUTO_APPROVES_SAFEGUARD).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS && D6_REUSES_CANONICAL_DIGITAL_THREAD && D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED || PARALLEL_D6_DIGITAL_THREAD_CREATED || SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D6_R6_HISTORY_PRESERVED).toBe(true);
    expect(D6_R6_AUTO_REPOINTED || SILENT_D6_R6_MUTATION_ALLOWED).toBe(false);
    expect(D6_R6_PROVENANCE_REQUIRED && D6_R6_PROVENANCE_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D6_R6_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R6_ACCESS_ALLOWED).toBe(false);
    expect(AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D6_HAZARD_FINDING || AI_CAN_INVENT_AUTHORITATIVE_D6_RELIEF_SCENARIO || AI_CAN_INVENT_AUTHORITATIVE_D6_SAFEGUARD_REQUIREMENT || ADMIN_CAN_PROMOTE_UNGOVERNED_D6_R6_CONTEXT_TO_ENGINEERING_TRUTH).toBe(false);
    expect(D6_EQUALS_D1_STRUCTURAL_AUTHORITY || D6_EQUALS_D2_CIVIL_AUTHORITY || D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D6_EQUALS_D4_MECHANICAL_AUTHORITY || D6_EQUALS_D5_PIPING_AUTHORITY || D6_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D6_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED && D6_R6_REPLAY_PROTECTION_IMPLEMENTED && D6_R6_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(UNAUTHORIZED_D6_R7_R12_RUNTIME_PROMOTION || UNAUTHORIZED_RELIEF_CALCULATION || UNAUTHORIZED_RELIEF_DEVICE_SIZING || UNAUTHORIZED_RELIEF_DEVICE_SELECTION || UNAUTHORIZED_DEPRESSURING_CALCULATION || UNAUTHORIZED_SIL_CALCULATION || UNAUTHORIZED_SIL_TARGET_DETERMINATION || UNAUTHORIZED_SAFEGUARD_DESIGN || UNAUTHORIZED_RISK_ACCEPTANCE || UNAUTHORIZED_FUNCTIONAL_SAFETY_PROMOTION).toBe(false);
    expect([
      D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT, D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT, D6_REVIEW_VALIDATION_RUNTIME_COUNT,
      D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D6_D9_RUNTIME_INTEGRATION_COUNT,
      D6_PROCESS_CALCULATION_RUNTIME_COUNT, D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT, D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
      D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT, D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT, D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
      D6_RELIEF_CALCULATION_RUNTIME_COUNT, D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT, D6_UTILITY_CALCULATION_RUNTIME_COUNT,
      D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D6_APPROVAL_RUNTIME_COUNT, D6_CERTIFICATION_RUNTIME_COUNT,
      D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
    ]).toEqual(Array(25).fill(0));
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && !D2_REOPENED && D3_TRACK_COMPLETE && !D3_REOPENED && D4_TRACK_COMPLETE && !D4_REOPENED && D5_TRACK_COMPLETE && !D5_REOPENED).toBe(true);
    expect(D7_RUNTIME_STARTED || D8_RUNTIME_STARTED || D9_RUNTIME_STARTED || D9_RUNTIME_COUNT !== 0).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R6.PROCESS_SAFETY_AND_RELIEF_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

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
    const dutyIdentity = identity("duty-1", "PROCESS_EQUIPMENT_DUTY");
    const utilityIdentity = identity("util-1", "PROCESS_UTILITY_REQUIREMENT");
    const safetyIdentity = identity("safety-1", "PROCESS_SAFETY_CONTEXT");
    const studyIdentity = identity("study-1", "PROCESS_SAFETY_CONTEXT");
    const findingIdentity = identity("finding-1", "PROCESS_SAFETY_CONTEXT");
    const reliefIdentity = identity("relief-1", "PROCESS_RELIEF_SCENARIO");
    const blowIdentity = identity("blow-1", "PROCESS_RELIEF_SCENARIO");
    const guardIdentity = identity("guard-1", "PROCESS_RELIEF_SCENARIO");
    const d5 = createD5R1Store();
    const piping = { actorId: "pipe-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D5_CONTEXT_AUTHORITY };
    recordPipingContext(d5, piping, { contextId: "d5-ctx", citedLifecycleStage: "FEED", provenanceRef: "d5-prov" });
    const line = recordPipingObjectIdentity(d5, piping, { objectId: "line-1", contextId: "d5-ctx", objectType: "PIPING_LINE", citedLifecycleStage: "FEED", provenanceRef: "d5-line" });
    const r2 = createD6R2Store(r1, d5);
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
    const condition = recordProcessOperatingCondition(r3, actor, {
      ...bound3(stream.objectId, stream.fingerprint), conditionId: "op-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
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
    const mechanical = { actorId: "mech-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D4_CONTEXT_AUTHORITY };
    const d4 = createD4R1Store();
    recordMechanicalContext(d4, mechanical, { contextId: "d4-ctx", citedLifecycleStage: "FEED", provenanceRef: "d4-prov" });
    const pump = recordMechanicalObjectIdentity(d4, mechanical, { objectId: "pump-1", contextId: "d4-ctx", objectType: "ROTATING_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "d4-pump" });
    const r5 = createD6R5Store(r4, d4);
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
      r2SystemRecordId: systemContext.systemRecordId, r2SystemFingerprint: systemContext.fingerprint,
      utilityType: "STEAM", value: "2", unit: "t/h",
    });
    const before = {
      evidence: JSON.stringify(r4.evidence),
      conditions: JSON.stringify(r3.conditions),
      duties: JSON.stringify(r5.duties),
      utilities: JSON.stringify(r5.utilities),
      d4: d4.objects.length,
      d5: d5.objects.length,
    };
    const store = createD6R6Store(r5, d4);
    const base = (recordId: string, objectId: string, fingerprint: string, subjectId: string, subjectFingerprint: string, streamBound: boolean) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, subjectObjectId: subjectId, subjectRevisionFingerprint: subjectFingerprint,
      recordId, citedLifecycleStage: "FEED", provenanceRef: "prov-r6", sourceBasisRef: "basis-r6", citedCurrentness: "CURRENT",
      applicability: `applies only to ${subjectId} and ${objectId}`, limitations: "supplied safety context only", assumptions: "The scenario boundary was stated by the supplied study",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      ...(streamBound
        ? { r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint }
        : { r2SystemRecordId: systemContext.systemRecordId, r2SystemFingerprint: systemContext.fingerprint }),
    });
    const safety = recordProcessSafetyContext(store, actor, {
      ...base("safety-rec", safetyIdentity.objectId, safetyIdentity.fingerprint, system.objectId, system.fingerprint, false),
      statement: "Process safety context for the feed system operating case",
      utilityRecordId: utility.utilityRecordId, utilityRevisionFingerprint: utility.fingerprint,
    });
    expect(safety.recordKind).toBe("SAFETY_CONTEXT");
    expect(safety.validatedSafetyDesign).toBe(false);
    expect(safety.functionalSafetyValidation).toBe(false);
    expect(safety.regulatoryApproval).toBe(false);
    expect(safety.approvedSafetyCase).toBe(false);
    expect(safety.utilityRevisionFingerprint).toBe(utility.fingerprint);
    expect(recordProcessSafetyContext(store, actor, {
      ...base("safety-rec", safetyIdentity.objectId, safetyIdentity.fingerprint, system.objectId, system.fingerprint, false),
      statement: "Process safety context for the feed system operating case",
      utilityRecordId: utility.utilityRecordId, utilityRevisionFingerprint: utility.fingerprint,
    })).toBe(safety);
    const study = recordHazardStudyContext(store, actor, {
      ...base("study-rec", studyIdentity.objectId, studyIdentity.fingerprint, stream.objectId, stream.fingerprint, true),
      statement: "External HAZOP node was supplied for the feed heater", studyKind: "HAZOP", studyReference: "HAZOP-14 node feed heater",
      conditionId: condition.conditionId, conditionFingerprint: condition.fingerprint,
    });
    expect(study.studyKind).toBe("HAZOP");
    expect(study.eosHazardAnalysis).toBe(false);
    expect(study.approvedSafeguard).toBe(false);
    expect(study.engineeringValidated).toBe(false);
    expect(study.conditionFingerprint).toBe(condition.fingerprint);
    const finding = recordProcessHazardFinding(store, actor, {
      ...base("finding-rec", findingIdentity.objectId, findingIdentity.fingerprint, stream.objectId, stream.fingerprint, true),
      statement: "Low flow was identified by the supplied study",
    });
    expect(finding.processDesignInvalid).toBe(false);
    expect(finding.approvedSafeguard).toBe(false);
    expect(finding.validatedRiskReduction).toBe(false);
    expect(finding.hazardClosed).toBe(false);
    const relief = recordReliefScenarioContext(store, actor, {
      ...base("relief-rec", reliefIdentity.objectId, reliefIdentity.fingerprint, stream.objectId, stream.fingerprint, true),
      statement: "Relief scenario for blocked outlet", initiatingCondition: "Blocked outlet was stated by the study",
      value: "12", unit: "kg/s", evidenceId: energy.evidenceId, evidenceFingerprint: energy.fingerprint,
      dutyRequirementId: duty.requirementId, dutyRevisionFingerprint: duty.fingerprint,
      conditionId: condition.conditionId, conditionFingerprint: condition.fingerprint,
      mechanicalObjectId: pump.objectId, mechanicalRevisionFingerprint: pump.fingerprint,
      pipingLineObjectId: line.objectId, pipingLineRevisionFingerprint: line.fingerprint,
    });
    expect(relief.scenarioClass).toBe("RELIEF");
    expect(relief.suppliedLoad).toEqual({ value: "12", unit: "kg/s" });
    expect(relief.reliefLoadCalculatedByEos).toBe(false);
    expect(relief.reliefDeviceDesign).toBe(false);
    expect(relief.reliefDeviceSelection).toBe(false);
    expect(relief.validatedReliefDeviceSize).toBe(false);
    expect(relief.autoAdoptedLoad).toBe(false);
    expect(relief.validatedMechanicalSelection).toBe(false);
    expect(relief.engineeringApproval).toBe(false);
    expect(relief.evidenceFingerprint).toBe(energy.fingerprint);
    expect(relief.dutyRevisionFingerprint).toBe(duty.fingerprint);
    expect(relief.pipingLineRevisionFingerprint).toBe(line.fingerprint);
    expect(relief.caseContextFingerprint).toBe(operatingCase.fingerprint);
    expect(energy.results.find((row) => row.name === "DUTY")?.measure).toEqual({ value: "1500", unit: "kW" });
    expect(duty.measure).toEqual({ value: "1400", unit: "kW" });
    const blowdown = recordDepressuringContext(store, actor, {
      ...base("blow-rec", blowIdentity.objectId, blowIdentity.fingerprint, stream.objectId, stream.fingerprint, true),
      statement: "Depressuring requirement for the feed system", initiatingCondition: "Fire exposure was stated by the study",
    });
    expect(blowdown.scenarioClass).toBe("DEPRESSURING");
    expect(blowdown.suppliedLoad).toBeNull();
    expect(blowdown.depressuringCalculatedByEos).toBe(false);
    expect(blowdown.validatedBlowdownDesign).toBe(false);
    const safeguard = recordProcessSafeguardRequirement(store, actor, {
      ...base("guard-rec", guardIdentity.objectId, guardIdentity.fingerprint, stream.objectId, stream.fingerprint, true),
      statement: "Shutdown intent was stated for low flow", safeguardIntent: "SHUTDOWN",
      silEvidenceRef: "Supplier sheet states SIL 2 for this shutdown intent", lopaEvidenceRef: "Supplier LOPA sheet LOPA-9 states the reduction factor",
    });
    expect(safeguard.scenarioClass).toBe("SAFEGUARDING");
    expect(safeguard.safeguardIntent).toBe("SHUTDOWN");
    expect(safeguard.iacImplementation).toBe(false);
    expect(safeguard.approvedSafeguardDesign).toBe(false);
    expect(safeguard.silCalculatedByEos).toBe(false);
    expect(safeguard.silTargetDeterminedByEos).toBe(false);
    expect(safeguard.lopaPerformedByEos).toBe(false);
    expect(safeguard.eosSilDetermination).toBe(false);
    expect(safeguard.eosRiskValidation).toBe(false);
    expect(safeguard.safeguardApproved).toBe(false);
    expect(safeguard.silEvidenceRef).toBe("Supplier sheet states SIL 2 for this shutdown intent");
    expect(store.records.filter((row) => row.caseRecordId === designCase.caseRecordId)).toEqual([]);
    expect(JSON.stringify(r4.evidence)).toBe(before.evidence);
    expect(JSON.stringify(r3.conditions)).toBe(before.conditions);
    expect(JSON.stringify(r5.duties)).toBe(before.duties);
    expect(JSON.stringify(r5.utilities)).toBe(before.utilities);
    expect(d4.objects).toHaveLength(before.d4);
    expect(d5.objects).toHaveLength(before.d5);
    expect(condition.measure).toEqual({ value: "150", unit: "kPa" });
    const replaced = identity("relief-2", "PROCESS_RELIEF_SCENARIO", { predecessorObjectId: reliefIdentity.objectId });
    const next = recordReliefScenarioContext(store, actor, {
      ...base("relief-rec-2", replaced.objectId, replaced.fingerprint, stream.objectId, stream.fingerprint, true),
      statement: "Revised relief scenario for blocked outlet", initiatingCondition: "Blocked outlet was stated by the study",
      value: "13", unit: "kg/s", predecessorRecordId: relief.recordId,
    });
    expect(next.predecessorRecordId).toBe(relief.recordId);
    expect(store.records.find((row) => row.recordId === relief.recordId)?.fingerprint).toBe(relief.fingerprint);
    expect(store.records.find((row) => row.recordId === relief.recordId)?.recordStatus).toBe("SUPERSEDED");

    const reject = (run: () => void) => expect(run).toThrow(/D6_R6_/);
    const bad = {
      ...base("bad", reliefIdentity.objectId, reliefIdentity.fingerprint, stream.objectId, stream.fingerprint, true),
      statement: "Another supplied relief statement", initiatingCondition: "A distinct initiating event was stated",
    };
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-calc", calculateReliefLoad: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-derive", deriveReliefLoad: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-hidden", hiddenReliefCalculation: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-size", sizeReliefDevice: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-select", selectReliefDevice: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-type", selectReliefDeviceType: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-vendor", selectReliefVendor: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-match", autoMatchReliefDevice: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-adopt", autoAdoptLoad: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-copy", evidenceId: energy.evidenceId, evidenceFingerprint: energy.fingerprint, copyEvidenceResult: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-reval", revalidateEvidence: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-r3", mutateOperatingCondition: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-r4", mutateEvidence: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-r5", mutateDuty: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-util", mutateUtility: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-d4", validateMechanical: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-d5", validatePiping: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-pipe", createReliefPiping: true }));
    reject(() => recordDepressuringContext(store, actor, { ...bad, recordId: "bad-blow", performDepressuring: true }));
    reject(() => recordDepressuringContext(store, actor, { ...bad, recordId: "bad-time", deriveDepressuringTime: true }));
    reject(() => recordDepressuringContext(store, actor, { ...bad, recordId: "bad-rate", deriveBlowdownRate: true }));
    reject(() => recordProcessSafeguardRequirement(store, actor, { ...bad, recordId: "bad-iac", safeguardIntent: "ALARM", statement: "Alarm intent was stated", createIac: true }));
    reject(() => recordProcessSafeguardRequirement(store, actor, { ...bad, recordId: "bad-sil", safeguardIntent: "ALARM", statement: "Alarm intent was stated", determineSil: true }));
    reject(() => recordProcessSafeguardRequirement(store, actor, { ...bad, recordId: "bad-lopa", safeguardIntent: "ALARM", statement: "Alarm intent was stated", performLopa: true }));
    reject(() => recordProcessSafeguardRequirement(store, actor, { ...bad, recordId: "bad-sif", safeguardIntent: "ALARM", statement: "Alarm intent was stated", validateSif: true }));
    reject(() => recordProcessSafeguardRequirement(store, actor, { ...bad, recordId: "bad-design", safeguardIntent: "ALARM", statement: "Alarm intent was stated", designSafeguard: true }));
    reject(() => recordProcessHazardFinding(store, actor, { ...base("bad-close", findingIdentity.objectId, findingIdentity.fingerprint, stream.objectId, stream.fingerprint, true), statement: "A separate finding was stated", closeFinding: true }));
    reject(() => recordProcessSafetyContext(store, actor, { ...base("bad-risk", safetyIdentity.objectId, safetyIdentity.fingerprint, system.objectId, system.fingerprint, false), statement: "A separate safety statement", acceptRisk: true }));
    reject(() => recordProcessSafeguardRequirement(store, actor, { ...bad, recordId: "bad-approve", safeguardIntent: "ISOLATION", statement: "Isolation intent was stated", approveSafeguard: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-assume", inventAssumption: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-case", caseContextFingerprint: "latest" }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-cond", conditionId: condition.conditionId, conditionFingerprint: "spoof" }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-ev", evidenceId: energy.evidenceId, evidenceFingerprint: "spoof" }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-duty", dutyRequirementId: duty.requirementId, dutyRevisionFingerprint: "spoof" }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-line", pipingLineObjectId: "missing", pipingLineRevisionFingerprint: "missing" }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-basis", sourceBasisRef: " " }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-blank", assumptions: " " }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-scope", tenantId: "t2" }));
    reject(() => recordProcessHazardFinding(store, { ...actor, actorId: "AI_1" }, { ...base("bad-ai", findingIdentity.objectId, findingIdentity.fingerprint, stream.objectId, stream.fingerprint, true), statement: "Invented finding" }));
    reject(() => recordProcessSafetyContext(store, { ...actor, authority: "ADMIN" }, { ...base("bad-admin", safetyIdentity.objectId, safetyIdentity.fingerprint, system.objectId, system.fingerprint, false), statement: "Promoted context", promoteToTruth: true }));
    reject(() => recordReliefScenarioContext(store, actor, { ...bad, recordId: "bad-fp", assertedFingerprint: "spoof" }));
    reject(() => recordProcessHazardFinding(store, actor, { ...base("finding-dup", findingIdentity.objectId, findingIdentity.fingerprint, stream.objectId, stream.fingerprint, true), statement: "Low flow was identified by the supplied study" }));
    expect(JSON.stringify(r4.evidence)).toBe(before.evidence);
    expect(JSON.stringify(r3.conditions)).toBe(before.conditions);
    expect(JSON.stringify(r5.duties)).toBe(before.duties);
    expect(JSON.stringify(r5.utilities)).toBe(before.utilities);
    expect(d4.objects).toHaveLength(1);
    expect(d5.objects).toHaveLength(1);
    expect(calculateReliefLoad).toThrow(/D6_R6_/);
    expect(sizeReliefDevice).toThrow(/D6_R6_/);
    expect(selectReliefDevice).toThrow(/D6_R6_/);
    expect(performDepressuringCalculation).toThrow(/D6_R6_/);
    expect(determineSilTarget).toThrow(/D6_R6_/);
    expect(performLopa).toThrow(/D6_R6_/);
    expect(designProcessSafeguard).toThrow(/D6_R6_/);
    expect(acceptProcessRisk).toThrow(/D6_R6_/);
    expect(validateProcessSafety).toThrow(/D6_R6_/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "process-safety-relief-context.ts"), "utf8");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "process-safety-relief-context.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
