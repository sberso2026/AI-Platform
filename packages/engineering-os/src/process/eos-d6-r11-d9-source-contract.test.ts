import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D6_D9_SOURCE_CONTRACT_FIELDS, D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT as ARCHITECTURE_SOURCE_COUNT, D6_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D4_CONTEXT_AUTHORITY, createD4R1Store, recordMechanicalContext, recordMechanicalObjectIdentity } from "../mechanical/identity-foundation";
import { createD5R1Store } from "../piping/identity-foundation";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D6_CONTEXT_AUTHORITY, createD6R1Store, recordProcessContext, recordProcessObjectIdentity } from "./identity-foundation";
import { createD6R2Store, recordProcessFluidContext, recordProcessPhaseContext, recordProcessServiceFunction, recordProcessStreamContext, recordProcessStreamServiceAssociation, recordProcessSuppliedCompositionContext, recordProcessSystemContext, recordProcessSystemStreamMembership } from "./system-stream-service-context";
import { createD6R3Store, recordProcessDesignBasisContext, recordProcessDesignCaseContext, recordProcessDesignCondition, recordProcessOperatingCaseContext, recordProcessOperatingCondition } from "./operating-design-basis-conditions";
import { createD6R4Store, recordProcessCalculationEvidence } from "./process-evidence-balances";
import { createD6R5Store, recordProcessCapacityPerformanceRequirement, recordProcessEquipmentDutyContext, recordSuppliedProcessUtilityEvidence } from "./equipment-duty-utility-context";
import { createD6R6Store, recordDepressuringContext, recordProcessHazardFinding, recordProcessSafeguardRequirement, recordProcessSafetyContext, recordReliefScenarioContext } from "./process-safety-relief-context";
import { createD6R7Store, recordProcessAssumption, recordProcessChange, recordProcessEngineeringDecision, recordProcessReassessment, recordProcessSourceRequirement } from "./requirements-assumptions-change";
import { createD6R8Store, recordProcessInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { createD6R9Store, recordProcessReviewCompletion, recordProcessReviewRequest, recordProcessValidationState } from "./review-validation-governance";
import { D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT as R10_SOURCE_COUNT, D6_R11_STARTED, D6_RUNTIME_COUNT as R10_RUNTIME_COUNT, createD6R10Store, recordProcessCurrentness, recordProcessLineage, recordProcessSupersession } from "./currentness-digital-thread";
import {
  AI_CAN_INVENT_D6_D9_SOURCE_FACT,
  AI_CAN_INVENT_D6_D9_SOURCE_LINEAGE,
  AI_CAN_PROMOTE_D6_D9_SOURCE_TO_ENGINEERING_DECISION,
  ADMIN_CAN_PROMOTE_D6_D9_SOURCE_TO_VALIDATION,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  CROSS_TENANT_D6_R11_ACCESS_ALLOWED,
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
  D6_D9_EXPOSES_CANONICAL_FINGERPRINT,
  D6_D9_EXPOSES_COMPOSITION_CONTEXT,
  D6_D9_EXPOSES_CURRENTNESS_STATE,
  D6_D9_EXPOSES_DESIGN_CASES,
  D6_D9_EXPOSES_DESIGN_CONDITIONS,
  D6_D9_EXPOSES_DEPRESSURING_CONTEXT,
  D6_D9_EXPOSES_DISCIPLINE_INTERFACE_STATE,
  D6_D9_EXPOSES_ENERGY_BALANCE_EVIDENCE,
  D6_D9_EXPOSES_EXACT_INTERFACE_COUNTERPART_REVISIONS,
  D6_D9_EXPOSES_EXACT_PROCESS_REVISIONS,
  D6_D9_EXPOSES_EXPLICIT_LINEAGE,
  D6_D9_EXPOSES_FLUID_CONTEXT,
  D6_D9_EXPOSES_HAZARD_FINDINGS,
  D6_D9_EXPOSES_HYDRAULIC_EVIDENCE,
  D6_D9_EXPOSES_INFERRED_LINEAGE,
  D6_D9_EXPOSES_LIMITATIONS,
  D6_D9_EXPOSES_APPLICABILITY,
  D6_D9_EXPOSES_AUTHORITY_CONTEXT,
  D6_D9_EXPOSES_MASS_BALANCE_EVIDENCE,
  D6_D9_EXPOSES_OPERATING_CASES,
  D6_D9_EXPOSES_OPERATING_CONDITIONS,
  D6_D9_EXPOSES_PHASE_CONTEXT,
  D6_D9_EXPOSES_PROCESS_ASSUMPTIONS,
  D6_D9_EXPOSES_PROCESS_CAPACITY_PERFORMANCE_REQUIREMENTS,
  D6_D9_EXPOSES_PROCESS_CHANGE_STATE,
  D6_D9_EXPOSES_PROCESS_DESIGN_BASIS,
  D6_D9_EXPOSES_PROCESS_ENGINEERING_DECISIONS,
  D6_D9_EXPOSES_PROCESS_EQUIPMENT_DUTY,
  D6_D9_EXPOSES_PROCESS_EVIDENCE,
  D6_D9_EXPOSES_PROCESS_IDENTITIES,
  D6_D9_EXPOSES_PROCESS_REASSESSMENT_STATE,
  D6_D9_EXPOSES_PROCESS_REQUIREMENTS,
  D6_D9_EXPOSES_PROCESS_SAFETY_CONTEXT,
  D6_D9_EXPOSES_PROCESS_SERVICE_CONTEXT,
  D6_D9_EXPOSES_PROCESS_STREAM_CONTEXT,
  D6_D9_EXPOSES_PROCESS_SUPERSESSION_STATE,
  D6_D9_EXPOSES_PROCESS_SYSTEM_CONTEXT,
  D6_D9_EXPOSES_PROCESS_UTILITY_CONTEXT,
  D6_D9_EXPOSES_PROVENANCE,
  D6_D9_EXPOSES_RELIEF_SCENARIOS,
  D6_D9_EXPOSES_REVIEW_STATE,
  D6_D9_EXPOSES_SAFEGUARD_REQUIREMENTS,
  D6_D9_EXPOSES_STALE_STATE,
  D6_D9_EXPOSES_SUPERSEDED_STATE,
  D6_D9_EXPOSES_THERMODYNAMIC_PROPERTY_EVIDENCE,
  D6_D9_EXPOSES_VALIDATION_STATE,
  D6_D9_PROVENANCE_TRACEABLE_TO_SOURCE,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_CREATES_ENGINEERING_DECISION,
  D6_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT,
  D6_D9_SOURCE_CONTRACT_CREATES_RECOMMENDATION,
  D6_D9_SOURCE_CONTRACT_CREATES_REQUIREMENT,
  D6_D9_SOURCE_CONTRACT_CURRENTNESS_INTEGRATED,
  D6_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE,
  D6_D9_SOURCE_CONTRACT_DETECTS_CROSS_DISCIPLINE_CONFLICT,
  D6_D9_SOURCE_CONTRACT_INFERS_MISSING_ENGINEERING_VALUE,
  D6_D9_SOURCE_CONTRACT_READ_ONLY,
  D6_D9_SOURCE_CONTRACT_RECOMMENDS_CROSS_DISCIPLINE_ACTION,
  D6_D9_SOURCE_CONTRACT_RESOLVES_CROSS_DISCIPLINE_CONFLICT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED,
  D6_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D6_D9_SOURCE_AUTO_REPOINTED,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_R10_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_R10_RUNTIME_COUNT,
  D6_R11_AUTO_MUTATES_R1_IDENTITY,
  D6_R11_AUTO_MUTATES_R10_CURRENTNESS_THREAD,
  D6_R11_AUTO_MUTATES_R2_CONTEXT,
  D6_R11_AUTO_MUTATES_R3_CONDITIONS,
  D6_R11_AUTO_MUTATES_R4_EVIDENCE,
  D6_R11_AUTO_MUTATES_R5_DUTY_UTILITY,
  D6_R11_AUTO_MUTATES_R6_SAFETY_RELIEF,
  D6_R11_AUTO_MUTATES_R7_CHANGE_GOVERNANCE,
  D6_R11_AUTO_MUTATES_R8_HANDOFF,
  D6_R11_AUTO_MUTATES_R9_REVIEW_VALIDATION,
  D6_R11_CANONICAL_NEXT_PHASE,
  D6_R11_CANONICAL_NEXT_PHASE_SCOPE,
  D6_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D6_R11_HISTORY_PRESERVED,
  D6_R11_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D6_R11_MATURITY,
  D6_R11_REPLAY_PROTECTION_IMPLEMENTED,
  D6_R11_SOURCE_REVISION_AUTO_REPOINTED,
  D6_R11_SPOOFING_PROTECTION_IMPLEMENTED,
  D6_R11_STATUS,
  D6_R12_CANONICAL_PHASE,
  D6_R12_PHASE_TYPE,
  D6_R12_STARTED,
  D6_R1_R10_EXACT_REVISIONS_REUSED,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_D9_SOURCE_CONTRACT_ARCHITECTURE,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_CAN_MUTATE_D6_SOURCE_TRUTH,
  D9_CAN_REPOINT_D6_SOURCE_REVISION,
  D9_PROCESS_IDENTITY_EXPOSURE_CREATES_NEW_PROCESS_IDENTITY,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  D9_SOURCE_CONTRACT_AUTO_ADOPTS_PROCESS_CONDITION,
  D9_SOURCE_CONTRACT_AUTO_ADOPTS_SOURCE_REQUIREMENT,
  D9_SOURCE_CONTRACT_AUTO_CLOSES_REASSESSMENT,
  D9_SOURCE_CONTRACT_AUTO_REASSESSES_PROCESS_RECORD,
  D9_SOURCE_CONTRACT_CALCULATES_COMPOSITION,
  D9_SOURCE_CONTRACT_CALCULATES_DEPRESSURING,
  D9_SOURCE_CONTRACT_CALCULATES_EQUIPMENT_DUTY,
  D9_SOURCE_CONTRACT_CALCULATES_RELIEF_LOAD,
  D9_SOURCE_CONTRACT_CALCULATES_THERMODYNAMIC_PROPERTIES,
  D9_SOURCE_CONTRACT_CALCULATES_UTILITY_DEMAND,
  D9_SOURCE_CONTRACT_CREATES_PROCESS_ASSUMPTION,
  D9_SOURCE_CONTRACT_CREATES_PROCESS_ENGINEERING_DECISION,
  D9_SOURCE_CONTRACT_CREATES_PROCESS_REQUIREMENT,
  D9_SOURCE_CONTRACT_CREATES_REVIEW_STATE,
  D9_SOURCE_CONTRACT_CREATES_SECOND_FINGERPRINT,
  D9_SOURCE_CONTRACT_CREATES_VALIDATION_STATE,
  D9_SOURCE_CONTRACT_CURRENT_EQUALS_VALIDATED,
  D9_SOURCE_CONTRACT_DERIVES_PROCESS_CONDITION,
  D9_SOURCE_CONTRACT_INFERS_COUNTERPART,
  D9_SOURCE_CONTRACT_INFERS_STREAM_SERVICE_RELATIONSHIP,
  D9_SOURCE_CONTRACT_INFERS_SYSTEM_STREAM_RELATIONSHIP,
  D9_SOURCE_CONTRACT_MUTATES_COUNTERPART,
  D9_SOURCE_CONTRACT_NORMALIZES_COMPOSITION_TO_ENGINEERING_TRUTH,
  D9_SOURCE_CONTRACT_PERFORMS_SIL_CALCULATION,
  D9_SOURCE_CONTRACT_PROMOTES_ASSUMPTION_TO_VALIDATED_FACT,
  D9_SOURCE_CONTRACT_REBASELINES_FINGERPRINT,
  D9_SOURCE_CONTRACT_RECALCULATES_PROCESS_EVIDENCE,
  D9_SOURCE_CONTRACT_RECOMMENDATION_EQUALS_PROCESS_ENGINEERING_DECISION,
  D9_SOURCE_CONTRACT_APPROVES_SAFEGUARD,
  D9_SOURCE_CONTRACT_SELECTS_EQUIPMENT,
  D9_SOURCE_CONTRACT_SIZES_EQUIPMENT,
  D9_SOURCE_CONTRACT_SIZES_RELIEF_DEVICE,
  D9_SOURCE_CONTRACT_STALE_EQUALS_INVALID,
  D9_SOURCE_CONTRACT_SUPERSEDED_EQUALS_INVALID,
  D9_SOURCE_CONTRACT_TRANSFERS_DISCIPLINE_AUTHORITY,
  D9_SOURCE_CONTRACT_TRANSFERS_PROCESS_AUTHORITY,
  D9_SOURCE_CONTRACT_VALIDATES_D6_ENGINEERING,
  D9_SOURCE_CONTRACT_VALIDATES_PROCESS_EVIDENCE,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D6_D9_SOURCE_REVISION_REQUIRED,
  FLOATING_D6_D9_SOURCE_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_D9_SOURCE_CONTRACT_FRAMEWORK_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D6_SOURCE_CONTRACT_RECORD_EXPOSED_AS_CURRENT,
  SUPERSEDED_D6_SOURCE_CONTRACT_RECORD_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D6_R11_SCOPE_ENFORCED,
  calculateProcessFromSource,
  createD6R11Store,
  createProcessDecisionFromSource,
  createProcessRecommendationFromSource,
  createProcessRequirementFromSource,
  deriveProcessSourceFact,
  detectProcessCrossDisciplineConflict,
  inferProcessSourceLineage,
  mutateProcessSourceTruth,
  rebaselineProcessSourceFingerprint,
  recommendProcessCrossDisciplineAction,
  recordProcessSourceContract,
  repointProcessSourceContract,
  resolveProcessCrossDisciplineConflict,
  startD9FromProcessSource,
  validateProcessFromSource,
} from "./d9-source-contract";

describe("EOS-D6-R11 D9 source contract", () => {
  it("exposes exact Process revisions without creating truth or starting D9", () => {
    expect(D6_R11_STATUS).toBe("D9_SOURCE_CONTRACT_IMPLEMENTED");
    expect(D6_R11_MATURITY).toBe(D6_R11_STATUS);
    expect(D6_RUNTIME_STARTED).toBe(true);
    expect(D6_RUNTIME_COUNT).toBe(11);
    expect(D6_R10_RUNTIME_COUNT).toBe(10);
    expect(R10_RUNTIME_COUNT).toBe(10);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D6_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(1);
    expect(D6_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(true);
    expect(D6_R10_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(0);
    expect(R10_SOURCE_COUNT).toBe(0);
    expect(ARCHITECTURE_SOURCE_COUNT).toBe(0);
    expect(D6_R11_STARTED).toBe(false);
    expect(D6_R12_STARTED).toBe(false);
    expect(D6_R12_CANONICAL_PHASE).toBe("EOS-D6-R12-PROCESS-BOUNDED-CLOSEOUT");
    expect(D6_R12_PHASE_TYPE).toBe("PROCESS_BOUNDED_CLOSEOUT");
    expect(D6_R11_CANONICAL_NEXT_PHASE).toBe(D6_R12_CANONICAL_PHASE);
    expect(D6_R11_CANONICAL_NEXT_PHASE_SCOPE).toContain("R12 must add no new substantive Process runtime");
    expect(D6_R1_R10_EXACT_REVISIONS_REUSED && EXACT_D6_D9_SOURCE_REVISION_REQUIRED && D6_REUSES_CANONICAL_D9_SOURCE_CONTRACT_ARCHITECTURE && D6_D9_SOURCE_CONTRACT_READ_ONLY).toBe(true);
    expect(FLOATING_D6_D9_SOURCE_REFERENCE_ALLOWED || D6_D9_SOURCE_AUTO_REPOINTED || PARALLEL_D6_D9_SOURCE_CONTRACT_FRAMEWORK_CREATED || D9_CAN_MUTATE_D6_SOURCE_TRUTH || D9_CAN_REPOINT_D6_SOURCE_REVISION).toBe(false);
    expect(D6_D9_EXPOSES_PROCESS_IDENTITIES && D6_D9_EXPOSES_EXACT_PROCESS_REVISIONS && D6_D9_EXPOSES_PROCESS_SYSTEM_CONTEXT && D6_D9_EXPOSES_PROCESS_STREAM_CONTEXT && D6_D9_EXPOSES_PROCESS_SERVICE_CONTEXT).toBe(true);
    expect(D6_D9_EXPOSES_OPERATING_CASES && D6_D9_EXPOSES_DESIGN_CASES && D6_D9_EXPOSES_PROCESS_DESIGN_BASIS && D6_D9_EXPOSES_OPERATING_CONDITIONS && D6_D9_EXPOSES_DESIGN_CONDITIONS).toBe(true);
    expect(D6_D9_EXPOSES_FLUID_CONTEXT && D6_D9_EXPOSES_PHASE_CONTEXT && D6_D9_EXPOSES_COMPOSITION_CONTEXT && D6_D9_EXPOSES_PROCESS_EVIDENCE).toBe(true);
    expect(D6_D9_EXPOSES_MASS_BALANCE_EVIDENCE && D6_D9_EXPOSES_ENERGY_BALANCE_EVIDENCE && D6_D9_EXPOSES_HYDRAULIC_EVIDENCE && D6_D9_EXPOSES_THERMODYNAMIC_PROPERTY_EVIDENCE).toBe(true);
    expect(D6_D9_EXPOSES_PROCESS_EQUIPMENT_DUTY && D6_D9_EXPOSES_PROCESS_CAPACITY_PERFORMANCE_REQUIREMENTS && D6_D9_EXPOSES_PROCESS_UTILITY_CONTEXT).toBe(true);
    expect(D6_D9_EXPOSES_PROCESS_SAFETY_CONTEXT && D6_D9_EXPOSES_HAZARD_FINDINGS && D6_D9_EXPOSES_RELIEF_SCENARIOS && D6_D9_EXPOSES_DEPRESSURING_CONTEXT && D6_D9_EXPOSES_SAFEGUARD_REQUIREMENTS).toBe(true);
    expect(D6_D9_EXPOSES_PROCESS_REQUIREMENTS && D6_D9_EXPOSES_PROCESS_ASSUMPTIONS && D6_D9_EXPOSES_PROCESS_ENGINEERING_DECISIONS).toBe(true);
    expect(D6_D9_EXPOSES_PROCESS_CHANGE_STATE && D6_D9_EXPOSES_PROCESS_SUPERSESSION_STATE && D6_D9_EXPOSES_PROCESS_REASSESSMENT_STATE).toBe(true);
    expect(D6_D9_EXPOSES_DISCIPLINE_INTERFACE_STATE && D6_D9_EXPOSES_EXACT_INTERFACE_COUNTERPART_REVISIONS && D6_D9_EXPOSES_REVIEW_STATE && D6_D9_EXPOSES_VALIDATION_STATE).toBe(true);
    expect(D6_D9_EXPOSES_CURRENTNESS_STATE && D6_D9_EXPOSES_STALE_STATE && D6_D9_EXPOSES_SUPERSEDED_STATE && D6_D9_EXPOSES_EXPLICIT_LINEAGE && D6_D9_EXPOSES_PROVENANCE && D6_D9_PROVENANCE_TRACEABLE_TO_SOURCE).toBe(true);
    expect(D6_D9_EXPOSES_AUTHORITY_CONTEXT && D6_D9_EXPOSES_APPLICABILITY && D6_D9_EXPOSES_LIMITATIONS && D6_D9_EXPOSES_CANONICAL_FINGERPRINT && D6_D9_SOURCE_CONTRACT_CURRENTNESS_INTEGRATED).toBe(true);
    expect(D6_D9_EXPOSES_INFERRED_LINEAGE || D9_PROCESS_IDENTITY_EXPOSURE_CREATES_NEW_PROCESS_IDENTITY || D9_SOURCE_CONTRACT_INFERS_SYSTEM_STREAM_RELATIONSHIP || D9_SOURCE_CONTRACT_INFERS_STREAM_SERVICE_RELATIONSHIP).toBe(false);
    expect(D9_SOURCE_CONTRACT_DERIVES_PROCESS_CONDITION || D9_SOURCE_CONTRACT_AUTO_ADOPTS_PROCESS_CONDITION || D9_SOURCE_CONTRACT_CALCULATES_COMPOSITION || D9_SOURCE_CONTRACT_NORMALIZES_COMPOSITION_TO_ENGINEERING_TRUTH || D9_SOURCE_CONTRACT_CALCULATES_THERMODYNAMIC_PROPERTIES).toBe(false);
    expect(D9_SOURCE_CONTRACT_RECALCULATES_PROCESS_EVIDENCE || D9_SOURCE_CONTRACT_VALIDATES_PROCESS_EVIDENCE || D9_SOURCE_CONTRACT_CALCULATES_EQUIPMENT_DUTY || D9_SOURCE_CONTRACT_SELECTS_EQUIPMENT || D9_SOURCE_CONTRACT_SIZES_EQUIPMENT || D9_SOURCE_CONTRACT_CALCULATES_UTILITY_DEMAND).toBe(false);
    expect(D9_SOURCE_CONTRACT_CALCULATES_RELIEF_LOAD || D9_SOURCE_CONTRACT_SIZES_RELIEF_DEVICE || D9_SOURCE_CONTRACT_CALCULATES_DEPRESSURING || D9_SOURCE_CONTRACT_PERFORMS_SIL_CALCULATION || D9_SOURCE_CONTRACT_APPROVES_SAFEGUARD).toBe(false);
    expect(D9_SOURCE_CONTRACT_CREATES_PROCESS_REQUIREMENT || D9_SOURCE_CONTRACT_AUTO_ADOPTS_SOURCE_REQUIREMENT || D9_SOURCE_CONTRACT_CREATES_PROCESS_ASSUMPTION || D9_SOURCE_CONTRACT_PROMOTES_ASSUMPTION_TO_VALIDATED_FACT).toBe(false);
    expect(D9_SOURCE_CONTRACT_CREATES_PROCESS_ENGINEERING_DECISION || D9_SOURCE_CONTRACT_RECOMMENDATION_EQUALS_PROCESS_ENGINEERING_DECISION || D9_SOURCE_CONTRACT_AUTO_REASSESSES_PROCESS_RECORD || D9_SOURCE_CONTRACT_AUTO_CLOSES_REASSESSMENT).toBe(false);
    expect(D9_SOURCE_CONTRACT_INFERS_COUNTERPART || D9_SOURCE_CONTRACT_MUTATES_COUNTERPART || D9_SOURCE_CONTRACT_TRANSFERS_DISCIPLINE_AUTHORITY || D9_SOURCE_CONTRACT_CREATES_REVIEW_STATE || D9_SOURCE_CONTRACT_CREATES_VALIDATION_STATE || D9_SOURCE_CONTRACT_VALIDATES_D6_ENGINEERING).toBe(false);
    expect(D9_SOURCE_CONTRACT_CURRENT_EQUALS_VALIDATED || D9_SOURCE_CONTRACT_STALE_EQUALS_INVALID || D9_SOURCE_CONTRACT_SUPERSEDED_EQUALS_INVALID || D9_SOURCE_CONTRACT_CREATES_SECOND_FINGERPRINT || D9_SOURCE_CONTRACT_REBASELINES_FINGERPRINT).toBe(false);
    expect(D6_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT || D6_D9_SOURCE_CONTRACT_DERIVES_NEW_ENGINEERING_VALUE || D6_D9_SOURCE_CONTRACT_INFERS_MISSING_ENGINEERING_VALUE).toBe(false);
    expect(D6_D9_SOURCE_CONTRACT_CREATES_REQUIREMENT || D6_D9_SOURCE_CONTRACT_CREATES_RECOMMENDATION || D6_D9_SOURCE_CONTRACT_CREATES_ENGINEERING_DECISION).toBe(false);
    expect(D6_D9_SOURCE_CONTRACT_DETECTS_CROSS_DISCIPLINE_CONFLICT || D6_D9_SOURCE_CONTRACT_RESOLVES_CROSS_DISCIPLINE_CONFLICT || D6_D9_SOURCE_CONTRACT_RECOMMENDS_CROSS_DISCIPLINE_ACTION).toBe(false);
    expect(D6_REUSES_CANONICAL_CURRENTNESS && D6_REUSES_CANONICAL_DIGITAL_THREAD && D6_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D6_CURRENTNESS_ENGINE_CREATED || PARALLEL_D6_DIGITAL_THREAD_CREATED || SECOND_D6_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D6_R11_HISTORY_PRESERVED).toBe(true);
    expect(D6_R11_HISTORICAL_REFERENCE_AUTO_REPOINTED || D6_R11_SOURCE_REVISION_AUTO_REPOINTED || STALE_D6_SOURCE_CONTRACT_RECORD_EXPOSED_AS_CURRENT || SUPERSEDED_D6_SOURCE_CONTRACT_RECORD_EXPOSED_AS_CURRENT).toBe(false);
    expect(D6_R11_AUTO_MUTATES_R1_IDENTITY || D6_R11_AUTO_MUTATES_R2_CONTEXT || D6_R11_AUTO_MUTATES_R3_CONDITIONS || D6_R11_AUTO_MUTATES_R4_EVIDENCE || D6_R11_AUTO_MUTATES_R5_DUTY_UTILITY || D6_R11_AUTO_MUTATES_R6_SAFETY_RELIEF || D6_R11_AUTO_MUTATES_R7_CHANGE_GOVERNANCE || D6_R11_AUTO_MUTATES_R8_HANDOFF || D6_R11_AUTO_MUTATES_R9_REVIEW_VALIDATION || D6_R11_AUTO_MUTATES_R10_CURRENTNESS_THREAD).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D6_R11_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D6_R11_ACCESS_ALLOWED || AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY || AI_CAN_INVENT_D6_D9_SOURCE_FACT || AI_CAN_INVENT_D6_D9_SOURCE_LINEAGE || AI_CAN_PROMOTE_D6_D9_SOURCE_TO_ENGINEERING_DECISION || ADMIN_CAN_PROMOTE_D6_D9_SOURCE_TO_VALIDATION).toBe(false);
    expect(D9_SOURCE_CONTRACT_TRANSFERS_PROCESS_AUTHORITY).toBe(false);
    expect(D6_EQUALS_D1_STRUCTURAL_AUTHORITY || D6_EQUALS_D2_CIVIL_AUTHORITY || D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D6_EQUALS_D4_MECHANICAL_AUTHORITY || D6_EQUALS_D5_PIPING_AUTHORITY || D6_EQUALS_D7_ELECTRICAL_AUTHORITY || D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(D6_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED && D6_R11_REPLAY_PROTECTION_IMPLEMENTED && D6_R11_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D6_D9_RUNTIME_INTEGRATION_COUNT,
      D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D6_PROCESS_CALCULATION_RUNTIME_COUNT, D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT, D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT, D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT, D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
      D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT, D6_RELIEF_CALCULATION_RUNTIME_COUNT, D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT, D6_UTILITY_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT, D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D6_APPROVAL_RUNTIME_COUNT, D6_CERTIFICATION_RUNTIME_COUNT,
    ]).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    expect(D1_STRUCTURAL_PACK_COMPLETE || D1N_REOPENED || D2_REOPENED || D3_REOPENED || D4_REOPENED || D5_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE && D3_TRACK_COMPLETE && D4_TRACK_COMPLETE && D5_TRACK_COMPLETE).toBe(true);
    expect(D7_RUNTIME_STARTED || D8_RUNTIME_STARTED || D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D6.R12.PROCESS_BOUNDED_CLOSEOUT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");

    const actor = { actorId: "proc-recorder", tenantId: "t1", workspaceId: "w1", projectId: "p1", authority: D6_CONTEXT_AUTHORITY };
    const reviewer = { ...actor, actorId: "rev-1", authority: "REVIEWER" as const, actorKind: "human" as const, aal: "aal2" };
    const validator = { ...actor, actorId: "val-1", authority: "PROCESS_VALIDATION_AUTHORITY" as const, actorKind: "human" as const, aal: "aal2" };
    const r1 = createD6R1Store();
    recordProcessContext(r1, actor, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: string, extra: { phaseClassification?: string } = {}) => recordProcessObjectIdentity(r1, actor, {
      objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, ...extra,
    });
    const stream = identity("stream-1", "PROCESS_STREAM");
    const nextStream = identity("stream-2", "PROCESS_STREAM");
    const system = identity("sys-1", "PROCESS_SYSTEM");
    const unrelated = identity("sys-unrelated", "PROCESS_SYSTEM");
    const service = identity("svc-1", "PROCESS_SERVICE");
    const fluid = identity("fluid-1", "PROCESS_FLUID", { phaseClassification: "VAPOR" });
    const composition = identity("comp-1", "PROCESS_COMPOSITION_CONTEXT");
    const operatingIdentity = identity("op-1", "PROCESS_OPERATING_CASE");
    const designIdentity = identity("des-1", "PROCESS_DESIGN_CASE");
    const basisIdentity = identity("basis-1", "PROCESS_DESIGN_BASIS");
    const evidenceIdentity = identity("ev-1", "PROCESS_CALCULATION_EVIDENCE");
    const dutyIdentity = identity("duty-1", "PROCESS_EQUIPMENT_DUTY");
    const capacityIdentity = identity("cap-1", "PROCESS_EQUIPMENT_DUTY");
    const utilityIdentity = identity("util-1", "PROCESS_UTILITY_REQUIREMENT");
    const safetyIdentity = identity("safety-1", "PROCESS_SAFETY_CONTEXT");
    const reliefIdentity = identity("relief-1", "PROCESS_RELIEF_SCENARIO");
    const bound = (objectId: string, fingerprint: string, provenanceRef: string) => ({
      contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED",
      provenanceRef, sourceBasisRef: `basis-${provenanceRef}`, citedCurrentness: "CURRENT",
      applicability: `applies only to ${objectId}`, limitations: "supplied governed context only",
    });
    const r2 = createD6R2Store(r1, createD5R1Store());
    const fluidContext = recordProcessFluidContext(r2, actor, { ...bound(fluid.objectId, fluid.fingerprint, "prov-fluid"), fluidRecordId: "fluid-rec", descriptiveContext: "Supplied hydrocarbon vapor" });
    recordProcessPhaseContext(r2, actor, { ...bound(fluid.objectId, fluid.fingerprint, "prov-phase"), phaseRecordId: "phase-rec", citedPhaseClassification: "VAPOR" });
    recordProcessSuppliedCompositionContext(r2, actor, { ...bound(composition.objectId, composition.fingerprint, "prov-comp"), compositionRecordId: "comp-rec", suppliedStatement: "Supplier stated a hydrocarbon mixture" });
    const streamContext = recordProcessStreamContext(r2, actor, {
      ...bound(stream.objectId, stream.fingerprint, "prov-stream"), streamRecordId: "stream-rec", streamFunction: "FEED",
      fluidObjectId: fluid.objectId, fluidRevisionFingerprint: fluid.fingerprint, citedPhaseClassification: "VAPOR",
      compositionObjectId: composition.objectId, compositionRevisionFingerprint: composition.fingerprint,
    });
    recordProcessSystemContext(r2, actor, { ...bound(system.objectId, system.fingerprint, "prov-sys"), systemRecordId: "sys-rec", purpose: "Feed preparation system", systemFunction: "SEPARATION", systemCategory: "PRIMARY_PROCESS_SYSTEM" });
    recordProcessSystemContext(r2, actor, { ...bound(unrelated.objectId, unrelated.fingerprint, "prov-unrelated"), systemRecordId: "sys-other", purpose: "Unrelated utility system", systemFunction: "UTILITY_SUPPORT", systemCategory: "UTILITY_PROCESS_SYSTEM" });
    const serviceContext = recordProcessServiceFunction(r2, actor, { ...bound(service.objectId, service.fingerprint, "prov-svc"), serviceRecordId: "svc-rec", serviceFunction: "SEPARATION", serviceDescription: "Separates the feed stream" });
    recordProcessSystemStreamMembership(r2, actor, { ...bound(stream.objectId, stream.fingerprint, "prov-mem"), membershipId: "mem-1", systemObjectId: system.objectId, systemRevisionFingerprint: system.fingerprint });
    recordProcessStreamServiceAssociation(r2, actor, { ...bound(stream.objectId, stream.fingerprint, "prov-assoc"), associationId: "assoc-1", serviceObjectId: service.objectId, serviceRevisionFingerprint: service.fingerprint });
    const r3 = createD6R3Store(r2);
    const operatingCase = recordProcessOperatingCaseContext(r3, actor, { ...bound(operatingIdentity.objectId, operatingIdentity.fingerprint, "prov-op"), caseRecordId: "op-rec", caseName: "Normal operation", caseType: "NORMAL_OPERATION" });
    const designCase = recordProcessDesignCaseContext(r3, actor, { ...bound(designIdentity.objectId, designIdentity.fingerprint, "prov-des"), caseRecordId: "des-rec", caseName: "Design case", caseType: "DESIGN" });
    const basis = recordProcessDesignBasisContext(r3, actor, {
      ...bound(basisIdentity.objectId, basisIdentity.fingerprint, "prov-basis"), basisRecordId: "basis-rec", basisStatement: "Design basis supplied by the process basis document",
      sourceDocumentRef: "PDB-001-A", operatingCaseRecordId: operatingCase.caseRecordId, operatingCaseFingerprint: operatingCase.fingerprint,
      designCaseRecordId: designCase.caseRecordId, designCaseFingerprint: designCase.fingerprint,
    });
    const condition = recordProcessOperatingCondition(r3, actor, {
      ...bound(stream.objectId, stream.fingerprint, "prov-ocond"), conditionId: "op-cond", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "NORMAL", value: "150", unit: "kPa", r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      fluidRecordId: fluidContext.fluidRecordId, fluidRecordFingerprint: fluidContext.fingerprint,
    });
    recordProcessDesignCondition(r3, actor, {
      ...bound(stream.objectId, stream.fingerprint, "prov-dcond"), conditionId: "des-cond", caseRecordId: designCase.caseRecordId, caseContextFingerprint: designCase.fingerprint,
      quantityKind: "PRESSURE", conditionRole: "MAXIMUM", value: "500", unit: "kPa", r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const r4 = createD6R4Store(r3);
    const evidence = (evidenceId: string, evidenceClass: string, evidenceContext: string | undefined, name: string, value: string, unit: string) => recordProcessCalculationEvidence(r4, actor, {
      ...bound(evidenceIdentity.objectId, evidenceIdentity.fingerprint, `prov-${evidenceId}`),
      applicability: `applies only to ${stream.objectId} and ${evidenceIdentity.objectId}`,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint, evidenceId,
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
      sourceToolName: "SupplierBalance", sourceToolVersion: "4.2", sourceModelRevision: `model-${evidenceId}`, sourceReportRef: `RPT-${evidenceId}`, sourceAuthorityRef: "balance author PE-14",
      evidenceClass, ...(evidenceContext ? { evidenceContext } : {}), assumptions: ["The supplier stated the value explicitly"],
      values: [
        { valueId: `${evidenceId}-in`, role: "INPUT", name: "SUPPLIED_INPUT", valueKind: "QUANTITY", value: "1", unit, basisRef: `in-${evidenceId}` },
        { valueId: `${evidenceId}-v`, role: "RESULT", name, valueKind: "QUANTITY", value, unit, basisRef: `basis-${evidenceId}` },
      ],
    });
    evidence("mass-1", "MASS_BALANCE", undefined, "MASS_FLOW", "1000", "kg/h");
    const energy = evidence("energy-1", "ENERGY_BALANCE", undefined, "DUTY", "1500", "kW");
    evidence("hyd-1", "HYDRAULIC", undefined, "STATIC_PRESSURE", "140", "kPa");
    evidence("drop-1", "PRESSURE_DROP", undefined, "FRICTION_LOSS", "20", "kPa");
    evidence("thermo-1", "OTHER_PROCESS_CALCULATION", "THERMODYNAMIC_PROPERTY", "DENSITY", "2", "kg/m3");
    const r5 = createD6R5Store(r4);
    const dutyBase = (requirementId: string, objectId: string, fingerprint: string) => ({
      ...bound(objectId, fingerprint, `prov-${requirementId}`),
      applicability: `applies only to ${stream.objectId} and ${objectId}`,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint, requirementId,
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    const duty = recordProcessEquipmentDutyContext(r5, actor, { ...dutyBase("duty-rec", dutyIdentity.objectId, dutyIdentity.fingerprint), requirementKind: "HEAT_DUTY", serviceRole: "feed heater process duty", value: "1400", unit: "kW" });
    recordProcessCapacityPerformanceRequirement(r5, actor, { ...dutyBase("cap-rec", capacityIdentity.objectId, capacityIdentity.fingerprint), requirementKind: "FLOW_CAPACITY", serviceRole: "feed capacity", value: "1000", unit: "kg/h" });
    recordSuppliedProcessUtilityEvidence(r5, actor, { ...dutyBase("util-rec", utilityIdentity.objectId, utilityIdentity.fingerprint), utilityRecordId: "util-rec", utilityType: "STEAM", value: "2", unit: "t/h" });
    const r6 = createD6R6Store(r5);
    const safetyBase = (recordId: string, objectId: string, fingerprint: string) => ({
      ...bound(objectId, fingerprint, `prov-${recordId}`),
      applicability: `applies only to ${stream.objectId} and ${objectId}`,
      subjectObjectId: stream.objectId, subjectRevisionFingerprint: stream.fingerprint, recordId,
      assumptions: "The scenario boundary was stated by the supplied study",
      caseClass: "OPERATING", caseRecordId: operatingCase.caseRecordId, caseContextFingerprint: operatingCase.fingerprint,
      r2StreamRecordId: streamContext.streamRecordId, r2StreamFingerprint: streamContext.fingerprint,
    });
    recordProcessSafetyContext(r6, actor, { ...safetyBase("safety-rec", safetyIdentity.objectId, safetyIdentity.fingerprint), statement: "Process safety context for the feed stream" });
    recordProcessHazardFinding(r6, actor, { ...safetyBase("finding-rec", safetyIdentity.objectId, safetyIdentity.fingerprint), statement: "Low flow was identified by the supplied study" });
    recordReliefScenarioContext(r6, actor, { ...safetyBase("relief-rec", reliefIdentity.objectId, reliefIdentity.fingerprint), statement: "Relief scenario for blocked outlet", initiatingCondition: "Blocked outlet was stated by the study" });
    recordDepressuringContext(r6, actor, { ...safetyBase("blow-rec", reliefIdentity.objectId, reliefIdentity.fingerprint), statement: "Depressuring requirement for the feed system", initiatingCondition: "Fire exposure was stated by the study" });
    recordProcessSafeguardRequirement(r6, actor, { ...safetyBase("safe-req", reliefIdentity.objectId, reliefIdentity.fingerprint), statement: "Shutdown intent was stated for low flow", safeguardIntent: "SHUTDOWN" });
    const r7 = createD6R7Store(r6);
    const subject = {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      citedCurrentness: "CURRENT", citedLifecycleStage: "FEED", applicability: `applies only to ${stream.objectId}`,
      limitations: "governed process context only", provenanceRef: "prov-r7", sourceBasisRef: "basis-r7",
    };
    recordProcessSourceRequirement(r7, actor, { ...subject, requirementId: "req-source", statement: "The feed stream shall retain the supplied operating pressure", requirementCategory: "DESIGN_INPUT", sourceClass: "SOURCE_REQUIREMENT", sourceRef: "PDB-1", sourceRevision: "A" });
    recordProcessAssumption(r7, actor, { ...subject, assumptionId: "asm-1", statement: "The supplied study boundary remains applicable to this stream" });
    recordProcessEngineeringDecision(r7, actor, { ...subject, decisionId: "dec-1", statement: "Retain the supplied operating pressure as the governed process requirement", alternatives: [{ id: "keep", statement: "Retain the supplied statement", is_selected: true }] });
    const link = (targetKind: string, targetId: string, targetFingerprint: string) => ({ kind: "OBJECT_REFERENCE", targetKind, targetId, targetFingerprint });
    const change = recordProcessChange(r7, actor, { ...subject, changeId: "chg-1", changeCategory: "R5_DUTY_CHANGED", reason: "The source document revision was explicitly replaced", dependencies: [link("R5_DUTY", duty.requirementId, duty.fingerprint), link("R3_CONDITION", condition.conditionId, condition.fingerprint)] });
    recordProcessReassessment(r7, actor, { ...subject, reassessmentId: "ras-duty", changeId: change.changeId, targetId: duty.requirementId, targetFingerprint: duty.fingerprint, state: "REASSESSMENT_REQUIRED" });
    const mechActor = { ...actor, actorId: "mech-recorder", authority: D4_CONTEXT_AUTHORITY };
    const d4 = createD4R1Store();
    recordMechanicalContext(d4, mechActor, { contextId: "mctx", citedLifecycleStage: "FEED", provenanceRef: "prov-mctx" });
    const equipment = recordMechanicalObjectIdentity(d4, mechActor, { objectId: "eq-1", contextId: "mctx", objectType: "MECHANICAL_EQUIPMENT", citedLifecycleStage: "FEED", provenanceRef: "prov-eq-1" });
    const r8 = createD6R8Store(r7, d4);
    const handoff = recordProcessInterfaceHandoff(r8, actor, {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      citedCurrentness: "CURRENT", citedLifecycleStage: "FEED", applicability: `applies only to ${stream.objectId}`,
      limitations: "handoff communicates process context only", provenanceRef: "prov-r8", sourceBasisRef: "basis-r8",
      direction: "D6_TO_COUNTERPART", identityBasis: "EXPLICIT", tenantId: "t1", workspaceId: "w1", projectId: "p1",
      handoffId: "hof-d4", sourceKind: "R3_CONDITION", sourceId: condition.conditionId, sourceFingerprint: condition.fingerprint,
      dependencies: [link("R3_CONDITION", condition.conditionId, condition.fingerprint)], counterpartDiscipline: "mechanical", interfaceTopic: "OPERATING_OR_DESIGN_CONDITION_SOURCE",
      counterpartId: equipment.objectId, counterpartRevision: equipment.provenanceRef, counterpartFingerprint: equipment.fingerprint, handoffStatus: "COMPLETE",
    });
    const review = createD6R9Store(r8);
    const chain = {
      contextId: "ctx-1", objectId: stream.objectId, objectRevisionFingerprint: stream.fingerprint,
      r2Kind: "STREAM", r2RecordId: streamContext.streamRecordId, r2Fingerprint: streamContext.fingerprint,
      subjectKind: "CONDITION", subjectId: condition.conditionId, subjectRevision: condition.provenanceRef, subjectFingerprint: condition.fingerprint,
      tenantId: "t1", workspaceId: "w1", projectId: "p1", citedCurrentness: "CURRENT", citedLifecycleStage: "FEED",
      applicability: `applies only to ${stream.objectId}`, limitations: "review records the governed activity only", provenanceRef: "prov-r9", sourceBasisRef: "basis-r9",
    };
    const request = recordProcessReviewRequest(review, actor, { ...chain, reviewRequestId: "req-cond", reviewType: "PROCESS_SUBJECT_REVIEW", reviewScope: "supplied pressure", requestedReviewerAuthority: "REVIEWER" });
    recordProcessReviewCompletion(review, reviewer, { ...chain, completionId: "done-cond", reviewRequestId: request.reviewRequestId });
    const validated = recordProcessValidationState(review, validator, { ...chain, validationId: "val-cond", validationScope: "supplied operating pressure", validationState: "VALIDATED", basis: [{ kind: "R3_CONDITION", id: condition.conditionId, fingerprint: condition.fingerprint }], reviewRequestId: request.reviewRequestId });
    const thread = createD6R10Store(review);
    recordProcessLineage(thread, actor, { lineageId: "lin-1", contextId: "ctx-1", source: { subjectKind: "OBJECT", subjectId: stream.objectId, subjectRevision: stream.provenanceRef, subjectFingerprint: stream.fingerprint }, target: { subjectKind: "OPERATING_CONDITION", subjectId: condition.conditionId, subjectRevision: condition.provenanceRef, subjectFingerprint: condition.fingerprint }, relationshipType: "OBJECT_REFERENCE", citedCurrentness: "CURRENT", provenanceRef: "prov-r10" });
    recordProcessCurrentness(thread, actor, { eventId: "cur-ev", contextId: "ctx-1", subject: { subjectKind: "EVIDENCE", subjectId: energy.evidenceId, subjectRevision: energy.provenanceRef, subjectFingerprint: energy.fingerprint }, currentness: "STALE", provenanceRef: "prov-stale-ev" });
    const before = JSON.stringify({ objects: r1.objects, streams: r2.streams, systems: r2.systems, conditions: r3.conditions, evidence: r4.evidence, duties: r5.duties, safety: r6.records, requirements: r7.requirements, handoffs: r8.handoffs, reviews: review.requests, validations: review.validations, lineage: thread.lineage, marks: thread.marks });
    const source = createD6R11Store(thread);
    const input = { contractId: "src-1", contextId: "ctx-1", objectId: stream.objectId, sourceRevision: stream.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-r11" };
    const contract = recordProcessSourceContract(source, actor, input);
    expect(recordProcessSourceContract(source, actor, input)).toBe(contract);
    const fields = contract.fields;
    expect(D6_D9_SOURCE_CONTRACT_FIELDS.every((key) => key in fields)).toBe(true);
    const identityField = fields.IDENTITY as { exactRevision: string; objectId: string; newIdentityCreated: boolean };
    const contextField = fields.SYSTEM_STREAM_OR_SERVICE as { systems: { subjectId: string }[]; streams: { subjectId: string }[]; services: { subjectId: string; serviceFunction: string }[]; inferredSystemStream: boolean; inferredStreamService: boolean };
    const cases = fields.OPERATING_OR_DESIGN_CASE as { operatingCases: { subjectId: string }[]; designCases: { subjectId: string }[]; bases: { subjectId: string; basisStatement: string }[] };
    const processConditions = fields.PROCESS_CONDITIONS as { operating: { subjectId: string; calculated: boolean }[]; design: { subjectId: string }[]; derived: boolean; autoAdopted: boolean };
    const fluidField = fields.FLUID_OR_COMPOSITION_CONTEXT as { fluids: { descriptiveContext: string; thermodynamicModel: boolean }[]; phases: { citedPhaseClassification: string }[]; compositions: { normalizedToTruth: boolean }[]; calculated: boolean };
    const evidenceField = fields.EVIDENCE as { mass: { subjectId: string }[]; energy: { subjectId: string; currentness: string; eosValidation: boolean }[]; hydraulic: { subjectId: string }[]; thermodynamic: { subjectId: string }[]; recalculated: boolean };
    const dutyField = fields.EQUIPMENT_DUTIES as { duties: { subjectId: string; currentness: string; equipmentSelected: boolean }[]; capacity: { subjectId: string }[]; utilities: { utilityType: string; calculatedByEos: boolean }[]; sized: boolean };
    const safetyField = fields.PROCESS_SAFETY_OR_RELIEF_CONTEXT as { safety: { subjectId: string }[]; findings: { hazardClosed: boolean }[]; relief: { reliefLoadCalculatedByEos: boolean }[]; depressuring: { depressuringCalculatedByEos: boolean }[]; safeguards: { safeguardApproved: boolean }[] };
    const currentnessField = fields.CURRENTNESS as { state: string; changes: { subjectId: string }[]; supersessions: unknown[]; reassessments: { state: string; engineeringValidated: boolean }[]; currentEqualsValidated: boolean };
    const lineageField = fields.LINEAGE as { relationshipType: string; inferred: boolean; sourceRevision: string }[];
    const interfaces = fields.INTERFACES as { counterpart: { sourceRevision: string; fingerprint: string } | null; counterpartInferred: boolean; authorityTransferred: boolean }[];
    const reviewField = fields.REVIEW_VALIDATION as { reviews: { requestStatus: string; reviewCompleted: boolean }[]; validations: { validationState: string; currentness: string; engineeringValidated: boolean; approved: boolean }[]; validatesEngineering: boolean };
    expect(identityField.objectId).toBe(stream.objectId);
    expect(identityField.exactRevision).toBe(stream.provenanceRef);
    expect(identityField.newIdentityCreated).toBe(false);
    expect(contextField.streams.map((row) => row.subjectId)).toContain(streamContext.streamRecordId);
    expect(contextField.systems.map((row) => row.subjectId)).toEqual(["sys-rec"]);
    expect(contextField.services.map((row) => row.subjectId)).toEqual([serviceContext.serviceRecordId]);
    expect(contextField.inferredSystemStream).toBe(false);
    expect(contextField.inferredStreamService).toBe(false);
    expect(cases.operatingCases.map((row) => row.subjectId)).toContain(operatingCase.caseRecordId);
    expect(cases.designCases.map((row) => row.subjectId)).toContain(designCase.caseRecordId);
    expect(cases.bases.map((row) => row.subjectId)).toContain(basis.basisRecordId);
    expect(processConditions.operating.map((row) => row.subjectId)).toContain(condition.conditionId);
    expect(processConditions.design.length).toBe(1);
    expect(processConditions.derived).toBe(false);
    expect(processConditions.autoAdopted).toBe(false);
    expect(processConditions.operating[0]?.calculated).toBe(false);
    expect(fluidField.fluids[0]?.descriptiveContext).toBe("Supplied hydrocarbon vapor");
    expect(fluidField.fluids[0]?.thermodynamicModel).toBe(false);
    expect(fluidField.phases[0]?.citedPhaseClassification).toBe("VAPOR");
    expect(fluidField.compositions[0]?.normalizedToTruth).toBe(false);
    expect(fluidField.calculated).toBe(false);
    expect(evidenceField.mass.length).toBe(1);
    expect(evidenceField.energy[0]?.subjectId).toBe(energy.evidenceId);
    expect(evidenceField.energy[0]?.currentness).toBe("STALE");
    expect(evidenceField.energy[0]?.eosValidation).toBe(false);
    expect(evidenceField.hydraulic.length).toBe(2);
    expect(evidenceField.thermodynamic.length).toBe(1);
    expect(evidenceField.recalculated).toBe(false);
    expect(dutyField.duties[0]?.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(dutyField.duties[0]?.equipmentSelected).toBe(false);
    expect(dutyField.capacity.length).toBe(1);
    expect(dutyField.utilities[0]?.utilityType).toBe("STEAM");
    expect(dutyField.utilities[0]?.calculatedByEos).toBe(false);
    expect(dutyField.sized).toBe(false);
    expect(safetyField.safety.length).toBe(1);
    expect(safetyField.findings[0]?.hazardClosed).toBe(false);
    expect(safetyField.relief[0]?.reliefLoadCalculatedByEos).toBe(false);
    expect(safetyField.depressuring[0]?.depressuringCalculatedByEos).toBe(false);
    expect(safetyField.safeguards[0]?.safeguardApproved).toBe(false);
    expect((fields.REQUIREMENTS as { createdByContract: boolean }[])[0]?.createdByContract).toBe(false);
    expect((fields.ASSUMPTIONS as { validatedFact: boolean }[])[0]?.validatedFact).toBe(false);
    expect((fields.ENGINEERING_DECISIONS as { createdByContract: boolean; aiRecommendation: boolean }[])[0]?.aiRecommendation).toBe(false);
    expect(currentnessField.state).toBe("CURRENT");
    expect(currentnessField.currentEqualsValidated).toBe(false);
    expect(currentnessField.changes.map((row) => row.subjectId)).toContain(change.changeId);
    expect(currentnessField.reassessments[0]?.state).toBe("REASSESSMENT_REQUIRED");
    expect(currentnessField.reassessments[0]?.engineeringValidated).toBe(false);
    expect(lineageField[0]?.relationshipType).toBe("OBJECT_REFERENCE");
    expect(lineageField[0]?.inferred).toBe(false);
    expect(lineageField[0]?.sourceRevision).toBe(stream.provenanceRef);
    expect(interfaces[0]?.counterpart?.fingerprint).toBe(equipment.fingerprint);
    expect(interfaces[0]?.counterpart?.sourceRevision).toBe(handoff.counterpart?.sourceRevision);
    expect(interfaces[0]?.counterpartInferred).toBe(false);
    expect(interfaces[0]?.authorityTransferred).toBe(false);
    expect(reviewField.reviews[0]?.requestStatus).toBe("REQUESTED");
    expect(reviewField.reviews[0]?.reviewCompleted).toBe(false);
    expect(reviewField.validations[0]?.validationState).toBe(validated.validationState);
    expect(reviewField.validations[0]?.approved).toBe(false);
    expect(reviewField.validatesEngineering).toBe(false);
    expect(fields.PROVENANCE).toBe("prov-r11");
    expect((fields.AUTHORITY as { process: string; aiAuthoritative: boolean; transferred: boolean }).process).toBe(D6_CONTEXT_AUTHORITY);
    expect((fields.AUTHORITY as { aiAuthoritative: boolean }).aiAuthoritative).toBe(false);
    expect((fields.APPLICABILITY as string[]).length).toBeGreaterThan(0);
    expect((fields.LIMITATIONS as string[]).length).toBeGreaterThan(0);
    expect(fields.FINGERPRINT).toBe(contract.fingerprint);
    expect(contract.exactRevision).toBe(stream.provenanceRef);
    expect(contract.engineeringFactCreated).toBe(false);
    expect(contract.engineeringDerived).toBe(false);
    expect(contract.d9Started).toBe(false);
    expect(contract.validatesEngineering).toBe(false);
    expect(JSON.stringify({ objects: r1.objects, streams: r2.streams, systems: r2.systems, conditions: r3.conditions, evidence: r4.evidence, duties: r5.duties, safety: r6.records, requirements: r7.requirements, handoffs: r8.handoffs, reviews: review.requests, validations: review.validations, lineage: thread.lineage, marks: thread.marks })).toBe(before);
    const reject = (fn: () => unknown) => expect(fn).toThrow(/D6_R11_/);
    reject(() => recordProcessSourceContract(source, actor, { ...input, contractId: "src-dup" }));
    reject(() => recordProcessSourceContract(source, actor, { ...input, contractId: "src-spoof", assertedFingerprint: "spoof" }));
    reject(() => recordProcessSourceContract(source, actor, { ...input, contractId: "src-tenant", tenantId: "t2" }));
    reject(() => recordProcessSourceContract(source, { ...actor, actorId: "AI_1", actorKind: "ai" }, { ...input, contractId: "src-ai" }));
    reject(() => recordProcessSourceContract(source, { ...actor, authority: "ADMIN" }, { ...input, contractId: "src-admin", validate: true }));
    reject(() => recordProcessSourceContract(source, actor, { ...input, contractId: "src-infer", infer: true }));
    reject(() => recordProcessSourceContract(source, actor, { ...input, contractId: "src-derive", derive: true }));
    reject(() => recordProcessSourceContract(source, actor, { ...input, contractId: "src-req", createRequirement: true }));
    reject(() => recordProcessSourceContract(source, actor, { ...input, contractId: "src-float", sourceRevision: "latest" }));
    reject(() => recordProcessSourceContract(source, actor, { ...input, contractId: "src-wrong", sourceRevision: nextStream.provenanceRef }));
    recordProcessSupersession(thread, actor, { supersessionId: "sup-1", contextId: "ctx-1", predecessor: { subjectKind: "OBJECT", subjectId: stream.objectId, subjectRevision: stream.provenanceRef, subjectFingerprint: stream.fingerprint }, successor: { subjectKind: "OBJECT", subjectId: nextStream.objectId, subjectRevision: nextStream.provenanceRef, subjectFingerprint: nextStream.fingerprint }, citedCurrentness: "CURRENT", provenanceRef: "prov-sup" });
    expect(contract.exactRevision).toBe(stream.provenanceRef);
    reject(() => recordProcessSourceContract(source, actor, { ...input, contractId: "src-stale-current", citedCurrentness: "CURRENT" }));
    const historical = recordProcessSourceContract(source, actor, { ...input, contractId: "src-historical", citedCurrentness: "SUPERSEDED", provenanceRef: "prov-r11-historical" });
    expect(historical.currentness).toBe("SUPERSEDED");
    expect(historical.exactRevision).toBe(stream.provenanceRef);
    expect(historical.fields.CURRENTNESS).toMatchObject({ state: "SUPERSEDED" });
    expect(repointProcessSourceContract).toThrow(/D6_R11_/);
    expect(inferProcessSourceLineage).toThrow(/D6_R11_/);
    expect(deriveProcessSourceFact).toThrow(/D6_R11_/);
    expect(createProcessRequirementFromSource).toThrow(/D6_R11_/);
    expect(createProcessRecommendationFromSource).toThrow(/D6_R11_/);
    expect(createProcessDecisionFromSource).toThrow(/D6_R11_/);
    expect(detectProcessCrossDisciplineConflict).toThrow(/D6_R11_/);
    expect(resolveProcessCrossDisciplineConflict).toThrow(/D6_R11_/);
    expect(recommendProcessCrossDisciplineAction).toThrow(/D6_R11_/);
    expect(startD9FromProcessSource).toThrow(/D6_R11_/);
    expect(mutateProcessSourceTruth).toThrow(/D6_R11_/);
    expect(rebaselineProcessSourceFingerprint).toThrow(/D6_R11_/);
    expect(validateProcessFromSource).toThrow(/D6_R11_/);
    expect(calculateProcessFromSource).toThrow(/D6_R11_/);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "d9-source-contract.ts"), "utf8");
    expect(sourceText).toMatch(/relationSemantics|fingerprintCanonical|exposedProcessCurrentness|D6_D9_SOURCE_CONTRACT_FIELDS/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "d9-source-contract.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
