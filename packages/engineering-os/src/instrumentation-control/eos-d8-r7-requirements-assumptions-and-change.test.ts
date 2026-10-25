import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D8_CANONICAL_MILESTONE_COUNT,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as ARCHITECTURE_REQUIREMENTS_COUNT,
  D8_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD8R5Store } from "./control-system-architecture-context";
import { D8_CONTEXT_AUTHORITY, createD8R1Store, recordIacContext, recordIacObjectIdentity, type D8R1Actor } from "./identity-foundation";
import { createD8R3Store } from "./instrument-device-context";
import { createD8R2Store, recordProcessMeasurementContext } from "./process-measurement-tag-context";
import {
  ADMIN_CAN_CREATE_AUTHORITATIVE_D8_ASSUMPTION_WITHOUT_AUTHORITY,
  ADMIN_CAN_PROMOTE_D8_DECISION_TO_APPROVAL,
  ADMIN_CAN_PROMOTE_D8_REQUIREMENT_TO_ENGINEERING_TRUTH_WITHOUT_AUTHORITY,
  ADMIN_EQUALS_D8_ENGINEERING_DECISION_AUTHORITY,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D8_REQUIREMENT_ADOPTION_AUTHORITY,
  AI_CAN_ADOPT_D8_REQUIREMENT,
  AI_CAN_APPROVE_D8_ENGINEERING_DECISION,
  AI_CAN_CLOSE_REASSESSMENT_AS_VALIDATED,
  AI_CAN_CREATE_AUTHORITATIVE_D8_ASSUMPTION,
  AI_CAN_MAKE_AUTHORITATIVE_D8_ENGINEERING_DECISION,
  AI_EQUALS_D8_ENGINEERING_DECISION_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_EQUALS_D8_REQUIREMENT_ADOPTION_AUTHORITY,
  AI_RECOMMENDATION_EQUALS_D8_ENGINEERING_DECISION,
  BASISLESS_AUTHORITATIVE_D8_REQUIREMENT_AUTO_ACCEPTED,
  CROSS_TENANT_D8_R7_ACCESS_ALLOWED,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  D4_MECHANICAL_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT,
  D5_PIPING_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT,
  D6_CONTROL_REQUIREMENT_EQUALS_VALIDATED_D8_CONTROL_SYSTEM,
  D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT,
  D6_PROCESS_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT,
  D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_ELECTRICAL_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT,
  D7_POWER_REQUIREMENT_EQUALS_D8_CONTROL_SYSTEM_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_SIS_IMPLEMENTATION,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_ASSUMPTION_APPLICABILITY_EXPLICIT,
  D8_ASSUMPTION_AUTHORITY_REQUIRED,
  D8_ASSUMPTION_AUTHORITY_TRACEABLE,
  D8_ASSUMPTION_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D8_ASSUMPTION_CONTEXT_IMPLEMENTED,
  D8_ASSUMPTION_EQUALS_APPROVED_ENGINEERING,
  D8_ASSUMPTION_EQUALS_VALIDATED_FACT,
  D8_ASSUMPTION_LIMITATIONS_EXPLICIT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CHANGE_AUTO_CALCULATES_PFD,
  D8_CHANGE_AUTO_CALCULATES_PFH,
  D8_CHANGE_AUTO_CHANGES_ALARM_PRIORITY,
  D8_CHANGE_AUTO_CHANGES_INSTRUMENT_RANGE,
  D8_CHANGE_AUTO_CHANGES_SETPOINT,
  D8_CHANGE_AUTO_MARKS_UNRELATED_RECORD_STALE,
  D8_CHANGE_AUTO_RATIONALIZES_ALARM,
  D8_CHANGE_AUTO_REALLOCATES_IO,
  D8_CHANGE_AUTO_REASSIGNS_CONTROLLER,
  D8_CHANGE_AUTO_REASSIGNS_IO_CHANNEL,
  D8_CHANGE_AUTO_REBUILDS_CONTROL_LOOP,
  D8_CHANGE_AUTO_RECALCULATES_SIL,
  D8_CHANGE_AUTO_RECONFIGURES_DCS,
  D8_CHANGE_AUTO_RECONFIGURES_NETWORK,
  D8_CHANGE_AUTO_RECONFIGURES_PLC,
  D8_CHANGE_AUTO_RECONFIGURES_RTU,
  D8_CHANGE_AUTO_RECONFIGURES_SCADA,
  D8_CHANGE_AUTO_RECONFIGURES_SIS,
  D8_CHANGE_AUTO_REDESIGNS_SIF,
  D8_CHANGE_AUTO_REPOINTS_HISTORICAL_REFERENCE,
  D8_CHANGE_AUTO_RESELECTS_INSTRUMENT,
  D8_CHANGE_AUTO_RESIZES_INSTRUMENT,
  D8_CHANGE_AUTO_RETUNES_CONTROL_LOOP,
  D8_CHANGE_AUTO_REVALIDATES_FUNCTIONAL_SAFETY,
  D8_CHANGE_AUTO_REVERIFIES_SIL,
  D8_CHANGE_AUTO_REWRITES_CONTROL_LOGIC,
  D8_CHANGE_AUTO_REWRITES_INTERLOCK_LOGIC,
  D8_CHANGE_AUTO_REWRITES_SHUTDOWN_LOGIC,
  D8_CHANGE_AUTO_REWRITES_SIGNAL_RELATIONSHIP,
  D8_CHANGE_AUTO_REWRITES_TRIP_LOGIC,
  D8_CHANGE_CONTEXT_IMPLEMENTED,
  D8_CHANGE_CURRENTNESS_INTEGRATION_IMPLEMENTED,
  D8_CHANGE_EQUALS_AUTOMATIC_RECALCULATION,
  D8_CHANGE_EQUALS_AUTOMATIC_RECONFIGURATION,
  D8_CHANGE_EQUALS_AUTOMATIC_REDESIGN,
  D8_CHANGE_EQUALS_AUTOMATIC_REVALIDATION,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D8_ENGINEERING_DECISION_AUTHORITY_REQUIRED,
  D8_ENGINEERING_DECISION_AUTHORITY_TRACEABLE,
  D8_ENGINEERING_DECISION_BASIS_REQUIRED,
  D8_ENGINEERING_DECISION_BASIS_TRACEABLE,
  D8_ENGINEERING_DECISION_CONTEXT_IMPLEMENTED,
  D8_ENGINEERING_DECISION_EQUALS_APPROVAL,
  D8_ENGINEERING_DECISION_EQUALS_CONFORMANCE,
  D8_ENGINEERING_DECISION_EQUALS_VALIDATION,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_CHANGE_DEPENDENCY_REQUIRED,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D8_INFERRED_CHANGE_DEPENDENCY_ALLOWED,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_INFERRED_SUPERSESSION_ALLOWED,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_R1_R6_EXACT_REVISIONS_REUSED,
  D8_R6_RUNTIME_COUNT,
  D8_R7_APPLICABILITY_EXPLICIT,
  D8_R7_AUTO_MUTATES_D1_STRUCTURAL,
  D8_R7_AUTO_MUTATES_D2_CIVIL,
  D8_R7_AUTO_MUTATES_D3_GEOTECHNICAL,
  D8_R7_AUTO_MUTATES_D4_MECHANICAL,
  D8_R7_AUTO_MUTATES_D5_PIPING,
  D8_R7_AUTO_MUTATES_D6_PROCESS,
  D8_R7_AUTO_MUTATES_D7_ELECTRICAL,
  D8_R7_AUTO_MUTATES_R1_IDENTITY,
  D8_R7_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT,
  D8_R7_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT,
  D8_R7_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT,
  D8_R7_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT,
  D8_R7_AUTO_MUTATES_R6_SAFETY_CONTEXT,
  D8_R7_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D8_R7_CANONICAL_NEXT_PHASE,
  D8_R7_CHANGE_CAN_REQUIRE_R6_REASSESSMENT,
  D8_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D8_R7_GENERATES_CONTROL_LOGIC,
  D8_R7_GENERATES_SAFETY_LOGIC,
  D8_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED,
  D8_R7_HISTORY_PRESERVED,
  D8_R7_INFORMATION_MAY_APPROVE_ENGINEERING,
  D8_R7_LIMITATIONS_EXPLICIT,
  D8_R7_MODIFIES_CONTROL_LOGIC,
  D8_R7_NEXT_PHASE_TYPE,
  D8_R7_PERFORMS_CONTROL_LOOP_TUNING,
  D8_R7_PERFORMS_FUNCTIONAL_SAFETY_VALIDATION,
  D8_R7_PERFORMS_PFD_CALCULATION,
  D8_R7_PERFORMS_PFH_CALCULATION,
  D8_R7_PERFORMS_SIL_CALCULATION,
  D8_R7_PERFORMS_SIL_VERIFICATION,
  D8_R7_PROVENANCE_PRESERVED,
  D8_R7_PROVENANCE_REQUIRED,
  D8_R7_REPLAY_PROTECTION_IMPLEMENTED,
  D8_R7_REQUIREMENT_SOURCE_BASIS_REQUIRED,
  D8_R7_REQUIREMENT_SOURCE_BASIS_TRACEABLE,
  D8_R7_SOURCE_BASIS_REQUIRED,
  D8_R7_SOURCE_BASIS_TRACEABLE,
  D8_R7_SPOOFING_PROTECTION_IMPLEMENTED,
  D8_R7_STATUS,
  D8_R7_SUBJECT_AUTO_REPOINTED,
  D8_R8_STARTED,
  D8_REASSESSMENT_AUTO_INFERRED_FROM_SIMILARITY,
  D8_REASSESSMENT_GOVERNANCE_IMPLEMENTED,
  D8_REASSESSMENT_PERFORMS_AUTOMATIC_RECONFIGURATION,
  D8_REASSESSMENT_PERFORMS_AUTOMATIC_REDESIGN,
  D8_REASSESSMENT_PERFORMS_AUTOMATIC_REVALIDATION,
  D8_REASSESSMENT_PERFORMS_ENGINEERING_CALCULATION,
  D8_REASSESSMENT_TRIGGER_REQUIRES_EXPLICIT_DEPENDENCY,
  D8_REQUIREMENT_ADOPTION_AUTHORITY_REQUIRED,
  D8_REQUIREMENT_ADOPTION_AUTHORITY_TRACEABLE,
  D8_REQUIREMENT_ADOPTION_EXPLICIT,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D8_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_SOURCE_REQUIREMENT_CONTEXT_IMPLEMENTED,
  D8_SUPERSESSION_EXPLICIT,
  D8_SUPERSESSION_GOVERNANCE_IMPLEMENTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D8_R7_SUBJECT_REVISION_REQUIRED,
  EXACT_D8_REQUIREMENT_SUBJECT_REVISION_REQUIRED,
  FLOATING_D8_R7_SUBJECT_REFERENCE_ALLOWED,
  FLOATING_D8_REQUIREMENT_SUBJECT_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D8_CHANGE_ENGINE_CREATED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DECISION_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  PARALLEL_D8_REQUIREMENT_ENGINE_CREATED,
  R6_REASSESSMENT_REQUIRED_EQUALS_ALARM_INVALID,
  R6_REASSESSMENT_REQUIRED_EQUALS_SIF_INVALID,
  R6_REASSESSMENT_REQUIRED_EQUALS_SIL_FAILED,
  REASSESSMENT_COMPLETED_EQUALS_APPROVED,
  REASSESSMENT_COMPLETED_EQUALS_CONFORMANT,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_DESIGN_INVALID,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D8_R7_MUTATION_ALLOWED,
  SOURCE_REQUIREMENT_AUTO_ADOPTED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  TENANT_WORKSPACE_PROJECT_D8_R7_SCOPE_ENFORCED,
  adoptIacRequirementAutomatically,
  closeIacReassessmentAsValidated,
  createD8R7Store,
  inferIacChangeDependency,
  markIacDependentCurrentness,
  mutateIacSafetyContextFromChange,
  rationalizeIacAlarmFromChange,
  recalculateIacSilFromChange,
  recordIacAdoptedRequirement,
  recordIacAssumption,
  recordIacChange,
  recordIacEngineeringDecision,
  recordIacReassessment,
  recordIacSourceRequirement,
  reselectIacInstrumentFromChange,
  retuneIacLoopFromChange,
  rewriteIacControlLogicFromChange,
} from "./requirements-assumptions-change";
import { createD8R6Store, recordIacSafetyContext } from "./safety-interlock-shutdown-context";
import { createD8R4Store } from "./signal-io-control-loop-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D8R1Actor> = {}): D8R1Actor {
  return { actorId: "iac-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D8_CONTEXT_AUTHORITY, ...overrides };
}

function identity(id: string) {
  return { citedLifecycleStage: "FEED" as const, provenanceRef: `prov-${id}`, sourceBasisRef: `basis-${id}`, applicability: `${id} identity scope`, limitations: "identity only" };
}

describe("EOS-D8-R7 requirements assumptions and change", () => {
  it("records governed change without redesigning the subject", () => {
    expect(D8_R1_R6_EXACT_REVISIONS_REUSED && EXACT_D8_R7_SUBJECT_REVISION_REQUIRED && EXACT_D8_REQUIREMENT_SUBJECT_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D8_R7_SUBJECT_REFERENCE_ALLOWED || FLOATING_D8_REQUIREMENT_SUBJECT_ALLOWED || D8_R7_SUBJECT_AUTO_REPOINTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(true);
    expect(D8_RUNTIME_COUNT).toBe(7);
    expect(D8_R6_RUNTIME_COUNT).toBe(6);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_REQUIREMENTS_COUNT).toBe(0);
    expect(D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED && D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT).toBe(1);
    expect(D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY && D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY && D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY && D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY && D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY && D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY).toBe(true);
    expect(D8_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE && D8_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE && D8_REUSES_CANONICAL_DECISION_GOVERNANCE && D8_REUSES_CANONICAL_CHANGE_GOVERNANCE).toBe(true);
    expect(PARALLEL_D8_REQUIREMENT_ENGINE_CREATED || PARALLEL_D8_ASSUMPTION_ENGINE_CREATED || PARALLEL_D8_DECISION_ENGINE_CREATED || PARALLEL_D8_CHANGE_ENGINE_CREATED).toBe(false);
    expect(D8_SOURCE_REQUIREMENT_CONTEXT_IMPLEMENTED && D8_REQUIREMENT_ADOPTION_EXPLICIT && D8_REQUIREMENT_ADOPTION_AUTHORITY_REQUIRED && D8_REQUIREMENT_ADOPTION_AUTHORITY_TRACEABLE && D8_R7_REQUIREMENT_SOURCE_BASIS_REQUIRED && D8_R7_REQUIREMENT_SOURCE_BASIS_TRACEABLE).toBe(true);
    expect(SOURCE_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT || SOURCE_REQUIREMENT_AUTO_ADOPTED || AI_EQUALS_D8_REQUIREMENT_ADOPTION_AUTHORITY || ADMIN_EQUALS_D8_REQUIREMENT_ADOPTION_AUTHORITY || BASISLESS_AUTHORITATIVE_D8_REQUIREMENT_AUTO_ACCEPTED || AI_CAN_ADOPT_D8_REQUIREMENT || ADMIN_CAN_PROMOTE_D8_REQUIREMENT_TO_ENGINEERING_TRUTH_WITHOUT_AUTHORITY).toBe(false);
    expect(D4_MECHANICAL_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT || D5_PIPING_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT || D6_PROCESS_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT || D7_ELECTRICAL_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT).toBe(false);
    expect(D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT || D6_CONTROL_REQUIREMENT_EQUALS_VALIDATED_D8_CONTROL_SYSTEM || D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN || D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION).toBe(false);
    expect(D7_POWER_REQUIREMENT_EQUALS_D8_CONTROL_SYSTEM_DESIGN || D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN || D7_PROTECTION_CONTEXT_EQUALS_D8_SIS_IMPLEMENTATION).toBe(false);
    expect(D8_ASSUMPTION_CONTEXT_IMPLEMENTED && D8_ASSUMPTION_AUTHORITY_REQUIRED && D8_ASSUMPTION_AUTHORITY_TRACEABLE && D8_ASSUMPTION_APPLICABILITY_EXPLICIT && D8_ASSUMPTION_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D8_ASSUMPTION_EQUALS_VALIDATED_FACT || D8_ASSUMPTION_EQUALS_APPROVED_ENGINEERING || AI_CAN_CREATE_AUTHORITATIVE_D8_ASSUMPTION || ADMIN_CAN_CREATE_AUTHORITATIVE_D8_ASSUMPTION_WITHOUT_AUTHORITY || D8_ASSUMPTION_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D8_ENGINEERING_DECISION_CONTEXT_IMPLEMENTED && D8_ENGINEERING_DECISION_AUTHORITY_REQUIRED && D8_ENGINEERING_DECISION_AUTHORITY_TRACEABLE && D8_ENGINEERING_DECISION_BASIS_REQUIRED && D8_ENGINEERING_DECISION_BASIS_TRACEABLE).toBe(true);
    expect(AI_RECOMMENDATION_EQUALS_D8_ENGINEERING_DECISION || D8_ENGINEERING_DECISION_EQUALS_APPROVAL || D8_ENGINEERING_DECISION_EQUALS_VALIDATION || D8_ENGINEERING_DECISION_EQUALS_CONFORMANCE || AI_EQUALS_D8_ENGINEERING_DECISION_AUTHORITY || ADMIN_EQUALS_D8_ENGINEERING_DECISION_AUTHORITY || AI_CAN_MAKE_AUTHORITATIVE_D8_ENGINEERING_DECISION || AI_CAN_APPROVE_D8_ENGINEERING_DECISION).toBe(false);
    expect(D8_CHANGE_CONTEXT_IMPLEMENTED && D8_EXPLICIT_CHANGE_DEPENDENCY_REQUIRED && D8_SUPERSESSION_GOVERNANCE_IMPLEMENTED && D8_SUPERSESSION_EXPLICIT && D8_REASSESSMENT_GOVERNANCE_IMPLEMENTED && D8_REASSESSMENT_TRIGGER_REQUIRES_EXPLICIT_DEPENDENCY && D8_R7_CHANGE_CAN_REQUIRE_R6_REASSESSMENT && D8_CHANGE_CURRENTNESS_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D8_CHANGE_EQUALS_AUTOMATIC_REDESIGN || D8_CHANGE_EQUALS_AUTOMATIC_RECONFIGURATION || D8_CHANGE_EQUALS_AUTOMATIC_RECALCULATION || D8_CHANGE_EQUALS_AUTOMATIC_REVALIDATION).toBe(false);
    expect(D8_CHANGE_AUTO_RESELECTS_INSTRUMENT || D8_CHANGE_AUTO_RESIZES_INSTRUMENT || D8_CHANGE_AUTO_CHANGES_INSTRUMENT_RANGE || D8_CHANGE_AUTO_CHANGES_SETPOINT || D8_CHANGE_AUTO_REWRITES_SIGNAL_RELATIONSHIP || D8_CHANGE_AUTO_REALLOCATES_IO || D8_CHANGE_AUTO_REASSIGNS_IO_CHANNEL || D8_CHANGE_AUTO_REBUILDS_CONTROL_LOOP || D8_CHANGE_AUTO_RETUNES_CONTROL_LOOP).toBe(false);
    expect(D8_CHANGE_AUTO_RECONFIGURES_DCS || D8_CHANGE_AUTO_RECONFIGURES_PLC || D8_CHANGE_AUTO_RECONFIGURES_SIS || D8_CHANGE_AUTO_RECONFIGURES_SCADA || D8_CHANGE_AUTO_RECONFIGURES_RTU || D8_CHANGE_AUTO_REASSIGNS_CONTROLLER || D8_CHANGE_AUTO_RECONFIGURES_NETWORK).toBe(false);
    expect(D8_CHANGE_AUTO_REWRITES_CONTROL_LOGIC || D8_CHANGE_AUTO_REWRITES_INTERLOCK_LOGIC || D8_CHANGE_AUTO_REWRITES_TRIP_LOGIC || D8_CHANGE_AUTO_REWRITES_SHUTDOWN_LOGIC || D8_CHANGE_AUTO_RATIONALIZES_ALARM || D8_CHANGE_AUTO_CHANGES_ALARM_PRIORITY).toBe(false);
    expect(D8_CHANGE_AUTO_RECALCULATES_SIL || D8_CHANGE_AUTO_REVERIFIES_SIL || D8_CHANGE_AUTO_CALCULATES_PFD || D8_CHANGE_AUTO_CALCULATES_PFH || D8_CHANGE_AUTO_REDESIGNS_SIF || D8_CHANGE_AUTO_REVALIDATES_FUNCTIONAL_SAFETY).toBe(false);
    expect(D8_INFERRED_SUPERSESSION_ALLOWED || D8_INFERRED_CHANGE_DEPENDENCY_ALLOWED || D8_HISTORICAL_REFERENCE_AUTO_REPOINTED || D8_CHANGE_AUTO_REPOINTS_HISTORICAL_REFERENCE || SUPERSEDED_D8_RECORD_EQUALS_INVALID || D8_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED || REASSESSMENT_REQUIRED_EQUALS_DESIGN_INVALID || REASSESSMENT_COMPLETED_EQUALS_VALIDATED || REASSESSMENT_COMPLETED_EQUALS_APPROVED || REASSESSMENT_COMPLETED_EQUALS_CONFORMANT).toBe(false);
    expect(D8_REASSESSMENT_AUTO_INFERRED_FROM_SIMILARITY || D8_REASSESSMENT_PERFORMS_ENGINEERING_CALCULATION || D8_REASSESSMENT_PERFORMS_AUTOMATIC_REDESIGN || D8_REASSESSMENT_PERFORMS_AUTOMATIC_RECONFIGURATION || D8_REASSESSMENT_PERFORMS_AUTOMATIC_REVALIDATION).toBe(false);
    expect(R6_REASSESSMENT_REQUIRED_EQUALS_ALARM_INVALID || R6_REASSESSMENT_REQUIRED_EQUALS_SIF_INVALID || R6_REASSESSMENT_REQUIRED_EQUALS_SIL_FAILED).toBe(false);
    expect(D8_R7_PERFORMS_SIL_CALCULATION || D8_R7_PERFORMS_SIL_VERIFICATION || D8_R7_PERFORMS_PFD_CALCULATION || D8_R7_PERFORMS_PFH_CALCULATION || D8_R7_PERFORMS_FUNCTIONAL_SAFETY_VALIDATION || D8_R7_GENERATES_CONTROL_LOGIC || D8_R7_GENERATES_SAFETY_LOGIC || D8_R7_MODIFIES_CONTROL_LOGIC || D8_R7_PERFORMS_CONTROL_LOOP_TUNING).toBe(false);
    expect([D8_SIL_CALCULATION_RUNTIME_COUNT, D8_SIL_VERIFICATION_RUNTIME_COUNT, D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT, D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT, D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT, D8_INSTRUMENT_SIZING_RUNTIME_COUNT, D8_INSTRUMENT_SELECTION_RUNTIME_COUNT, D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT, D8_ACTUATOR_SIZING_RUNTIME_COUNT, D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT, D8_REVIEW_VALIDATION_RUNTIME_COUNT, D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT, D8_D9_RUNTIME_INTEGRATION_COUNT, D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT, D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT, D8_APPROVAL_RUNTIME_COUNT, D8_CERTIFICATION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT, D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT, D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT, D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT, D9_RUNTIME_COUNT]).toEqual(Array(26).fill(0));
    expect(D9_RUNTIME_STARTED || D8_R8_STARTED).toBe(false);
    expect(D8_R7_AUTO_MUTATES_R1_IDENTITY || D8_R7_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT || D8_R7_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT || D8_R7_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT || D8_R7_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT || D8_R7_AUTO_MUTATES_R6_SAFETY_CONTEXT).toBe(false);
    expect(D8_R7_AUTO_MUTATES_D1_STRUCTURAL || D8_R7_AUTO_MUTATES_D2_CIVIL || D8_R7_AUTO_MUTATES_D3_GEOTECHNICAL || D8_R7_AUTO_MUTATES_D4_MECHANICAL || D8_R7_AUTO_MUTATES_D5_PIPING || D8_R7_AUTO_MUTATES_D6_PROCESS || D8_R7_AUTO_MUTATES_D7_ELECTRICAL).toBe(false);
    expect(D8_EQUALS_D1_STRUCTURAL_AUTHORITY || D8_EQUALS_D2_CIVIL_AUTHORITY || D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY || D8_EQUALS_D4_MECHANICAL_AUTHORITY || D8_EQUALS_D5_PIPING_AUTHORITY || D8_EQUALS_D6_PROCESS_AUTHORITY || D8_EQUALS_D7_ELECTRICAL_AUTHORITY || AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY || ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY || AI_CAN_CLOSE_REASSESSMENT_AS_VALIDATED || ADMIN_CAN_PROMOTE_D8_DECISION_TO_APPROVAL).toBe(false);
    expect(D8_R7_SOURCE_BASIS_REQUIRED && D8_R7_SOURCE_BASIS_TRACEABLE && D8_R7_APPLICABILITY_EXPLICIT && D8_R7_LIMITATIONS_EXPLICIT && D8_R7_PROVENANCE_REQUIRED && D8_R7_PROVENANCE_PRESERVED && D8_R7_HISTORY_PRESERVED && TENANT_WORKSPACE_PROJECT_D8_R7_SCOPE_ENFORCED && D8_REUSES_CANONICAL_CURRENTNESS && D8_REUSES_CANONICAL_DIGITAL_THREAD && D8_REUSES_CANONICAL_FINGERPRINT && D8_EXPLICIT_LINEAGE_REQUIRED && D8_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED && D8_R7_REPLAY_PROTECTION_IMPLEMENTED && D8_R7_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D8_R7_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY || CROSS_TENANT_D8_R7_ACCESS_ALLOWED || PARALLEL_D8_CURRENTNESS_ENGINE_CREATED || PARALLEL_D8_DIGITAL_THREAD_CREATED || D8_INFERRED_LINEAGE_ALLOWED || SECOND_D8_FINGERPRINT_ALGORITHM_CREATED || CURRENT_D8_RECORD_EQUALS_VALIDATED || STALE_D8_RECORD_EQUALS_INVALID || D8_CHANGE_AUTO_MARKS_UNRELATED_RECORD_STALE || SILENT_D8_R7_MUTATION_ALLOWED || D8_R7_INFORMATION_MAY_APPROVE_ENGINEERING || DATABASE_SCHEMA_CHANGED || NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D8_CANONICAL_MILESTONE_COUNT).toBe(13);
    expect(D8_R7_STATUS).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED");
    expect(D8_R7_CANONICAL_NEXT_PHASE).toBe("EOS-D8-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS");
    expect(D8_R7_NEXT_PHASE_TYPE).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS");

    const r1 = createD8R1Store();
    const who = actor();
    recordIacContext(r1, who, { contextId: "ctx-1", ...identity("ctx") });
    const point = recordIacObjectIdentity(r1, who, { objectId: "mp-101", contextId: "ctx-1", objectType: "IAC_MEASUREMENT_POINT", ...identity("mp-101") });
    const alarmObject = recordIacObjectIdentity(r1, who, { objectId: "alm-101", contextId: "ctx-1", objectType: "IAC_ALARM_CONTEXT", ...identity("alm-101") });
    const r2 = createD8R2Store(r1);
    const measured = recordProcessMeasurementContext(r2, who, { measurementRecordId: "meas-1", contextId: "ctx-1", objectId: point.objectId, objectRevisionFingerprint: point.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", measurementPurpose: "PROCESS_MONITORING", processVariableType: "PRESSURE", locationReference: "line-explicit-12", provenanceRef: "prov-meas", sourceBasisRef: "basis-meas", applicability: "mp-101 measurement context", limitations: "context only" });
    const r6 = createD8R6Store(createD8R5Store(createD8R4Store(createD8R3Store(r2))));
    const alarm = recordIacSafetyContext(r6, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", contextRecordId: "alm-rec-1", objectId: alarmObject.objectId, objectRevisionFingerprint: alarmObject.fingerprint, kind: "ALARM", suppliedPriority: "supplied high", provenanceRef: "prov-alm", sourceBasisRef: "basis-alm", applicability: "alm-101 alarm context", limitations: "context only" });
    const before = JSON.stringify({ objects: r1.objects, measurements: r2.measurements, contexts: r6.contexts, r6History: r6.history });
    const store = createD8R7Store(r6, {
      d4: [{ id: "d4-req-1", fingerprint: "fp-d4-req", tenantId: "tenant-a" }],
      d5: [{ id: "d5-req-1", fingerprint: "fp-d5-req", tenantId: "tenant-a" }],
      d6: [{ id: "d6-req-1", fingerprint: "fp-d6-req", tenantId: "tenant-a" }],
      d7: [{ id: "d7-req-1", fingerprint: "fp-d7-req", tenantId: "tenant-a" }],
    });
    const governed = { contextId: "ctx-1", objectId: point.objectId, objectRevisionFingerprint: point.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-req", sourceBasisRef: "basis-req", applicability: "mp-101 requirement scope", limitations: "requirement context only" };
    const source = recordIacSourceRequirement(store, who, { ...governed, requirementId: "req-src-1", statement: "Measure line pressure within the supplied range", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "DESIGN_INPUT", sourceClass: "D8_GOVERNED_CONTEXT", sourceRef: "d8-basis-note-1", sourceRevision: "rev-d8-1" });
    const d6 = recordIacSourceRequirement(store, who, { ...governed, requirementId: "req-d6-1", statement: "Process measurement requirement remains a process source", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "INTERFACE_INPUT", sourceClass: "D6_PROCESS_REQUIREMENT", sourceRef: "d6-req-1", sourceRevision: "fp-d6-req", upstreamId: "d6-req-1", upstreamFingerprint: "fp-d6-req" });
    const d4 = recordIacSourceRequirement(store, who, { ...governed, requirementId: "req-d4-1", statement: "Mechanical interface requirement remains a mechanical source", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "INTERFACE_INPUT", sourceClass: "D4_MECHANICAL_REQUIREMENT", sourceRef: "d4-req-1", sourceRevision: "fp-d4-req", upstreamId: "d4-req-1", upstreamFingerprint: "fp-d4-req" });
    const d5 = recordIacSourceRequirement(store, who, { ...governed, requirementId: "req-d5-1", statement: "Piping interface requirement remains a piping source", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "INTERFACE_INPUT", sourceClass: "D5_PIPING_REQUIREMENT", sourceRef: "d5-req-1", sourceRevision: "fp-d5-req", upstreamId: "d5-req-1", upstreamFingerprint: "fp-d5-req" });
    const d7 = recordIacSourceRequirement(store, who, { ...governed, requirementId: "req-d7-1", statement: "Electrical interface requirement remains an electrical source", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "INTERFACE_INPUT", sourceClass: "D7_ELECTRICAL_REQUIREMENT", sourceRef: "d7-req-1", sourceRevision: "fp-d7-req", upstreamId: "d7-req-1", upstreamFingerprint: "fp-d7-req" });
    const adopted = recordIacAdoptedRequirement(store, who, { ...governed, requirementId: "req-ad-1", statement: source.statement, requirementCategory: "DESIGN_INPUT", sourceClass: source.sourceClass, sourceRef: source.sourceRef, sourceRevision: source.sourceRevision, sourceRequirementId: source.requirementId, adoptionRationale: "Adopted for the mp-101 governed revision by context authority" });
    const assumption = recordIacAssumption(store, who, { ...governed, assumptionId: "asm-1", statement: "Transmitter remains in the supplied service", validationStatus: "unvalidated", materiality: "medium" });
    const decision = recordIacEngineeringDecision(store, who, { ...governed, decisionId: "dec-1", statement: "Keep the supplied instrument context", alternatives: [{ id: "alt-a", statement: "Retain supplied transmitter context", is_selected: true }, { id: "alt-b", statement: "Record a later human review", is_selected: false }] });
    const successor = recordIacEngineeringDecision(store, who, { ...governed, decisionId: "dec-2", predecessorDecisionId: decision.decisionId, statement: "Keep the revised supplied instrument context", alternatives: [{ id: "alt-c", statement: "Retain the revised supplied context", is_selected: true }, { id: "alt-d", statement: "Leave the prior decision historical", is_selected: false }] });
    const alarmGoverned = { contextId: "ctx-1", objectId: alarmObject.objectId, objectRevisionFingerprint: alarmObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-chg", sourceBasisRef: "basis-chg", applicability: "alm-101 change scope", limitations: "change does not redesign" };
    const change = recordIacChange(store, who, { ...alarmGoverned, changeId: "chg-1", changeCategory: "R6_SAFETY_CHANGED", reason: "Supplied alarm source text was revised by the process authority", priorRevisionFingerprint: alarmObject.fingerprint, currentRevisionFingerprint: alarmObject.fingerprint, dependencies: [{ targetKind: "R6_SAFETY", targetId: alarm.contextRecordId, targetFingerprint: alarm.fingerprint }] });
    const required = recordIacReassessment(store, who, { ...alarmGoverned, reassessmentId: "ras-1", changeId: change.changeId, targetKind: "R6_SAFETY", targetId: alarm.contextRecordId, targetFingerprint: alarm.fingerprint, state: "REASSESSMENT_REQUIRED" });
    const completed = recordIacReassessment(store, who, { ...alarmGoverned, reassessmentId: "ras-2", changeId: change.changeId, targetKind: "R6_SAFETY", targetId: alarm.contextRecordId, targetFingerprint: alarm.fingerprint, state: "REASSESSMENT_COMPLETED" });
    const mark = markIacDependentCurrentness(store, who, { ...alarmGoverned, markId: "mark-1", changeId: change.changeId, targetKind: "R6_SAFETY", targetId: alarm.contextRecordId, targetFingerprint: alarm.fingerprint, mark: "REASSESSMENT_REQUIRED" });
    const revised = recordIacSourceRequirement(store, who, { ...governed, requirementId: "req-src-2", predecessorRequirementId: source.requirementId, statement: "Measure line pressure within the revised supplied range", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "DESIGN_INPUT", sourceClass: "D8_GOVERNED_CONTEXT", sourceRef: "d8-basis-note-1", sourceRevision: "rev-d8-2" });

    expect(source.adopted).toBe(false);
    expect(source.adoptionAuthorityId).toBeNull();
    expect(source.objectRevisionFingerprint).toBe(point.fingerprint);
    expect(store.requirements.find((row) => row.requirementId === source.requirementId)?.adopted).toBe(false);
    expect(store.requirements.find((row) => row.requirementId === source.requirementId)?.recordStatus).toBe("SUPERSEDED");
    expect(store.requirements.find((row) => row.requirementId === source.requirementId)?.objectRevisionFingerprint).toBe(point.fingerprint);
    expect(adopted.adopted).toBe(true);
    expect(adopted.autoAdopted).toBe(false);
    expect(adopted.requirementRole).toBe("ADOPTED_D8_REQUIREMENT");
    expect(adopted.adoptionAuthorityId).toBe("iac-recorder");
    expect(adopted.sourceRequirementFingerprint).toBe(source.fingerprint);
    expect(adopted.designSatisfied).toBe(false);
    expect(d6.adopted || d4.adopted || d5.adopted || d7.adopted).toBe(false);
    expect(d6.upstreamFingerprint).toBe("fp-d6-req");
    expect(assumption.validationStatus).toBe("unvalidated");
    expect(assumption.validatedFact).toBe(false);
    expect(assumption.approvedEngineering).toBe(false);
    expect(assumption.authorityId).toBe("iac-recorder");
    expect(decision.approved || decision.validated || decision.conformant || decision.aiRecommendation).toBe(false);
    expect(decision.authorityId).toBe("iac-recorder");
    expect(store.decisions.find((row) => row.decisionId === decision.decisionId)?.recordStatus).toBe("SUPERSEDED");
    expect(store.decisions.find((row) => row.decisionId === decision.decisionId)?.objectRevisionFingerprint).toBe(point.fingerprint);
    expect(successor.predecessorDecisionId).toBe(decision.decisionId);
    expect(successor.approved).toBe(false);
    expect(change.automaticRedesign || change.automaticReconfiguration || change.automaticRecalculation || change.automaticRevalidation).toBe(false);
    expect(change.dependencies).toEqual([{ targetKind: "R6_SAFETY", targetId: alarm.contextRecordId, targetFingerprint: alarm.fingerprint }]);
    expect(change.priorRevisionFingerprint).toBe(alarmObject.fingerprint);
    expect(required.state).toBe("REASSESSMENT_REQUIRED");
    expect(required.validationFailed || required.designInvalid || required.alarmInvalid || required.sifInvalid || required.silFailed).toBe(false);
    expect(completed.validated || completed.approved || completed.conformant).toBe(false);
    expect(mark.unrelated || mark.exposedAsCurrent || mark.staleEqualsInvalid).toBe(false);
    expect(mark.mark).toBe("REASSESSMENT_REQUIRED");
    expect(revised.predecessorRequirementId).toBe(source.requirementId);
    expect(r6.contexts[0].recordStatus).toBe("CURRENT");
    expect(r6.contexts[0].fingerprint).toBe(alarm.fingerprint);
    expect(r6.contexts[0].alarmRationalized).toBe(false);
    expect(r6.contexts[0].sifValidated).toBe(false);
    expect(r6.contexts[0].silVerified).toBe(false);
    expect(r2.measurements[0].fingerprint).toBe(measured.fingerprint);
    expect(JSON.stringify({ objects: r1.objects, measurements: r2.measurements, contexts: r6.contexts, r6History: r6.history })).toBe(before);
    const replay = recordIacSourceRequirement(store, who, { ...governed, requirementId: "req-src-2", statement: "Measure line pressure within the revised supplied range", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "DESIGN_INPUT", sourceClass: "D8_GOVERNED_CONTEXT", sourceRef: "d8-basis-note-1", sourceRevision: "rev-d8-2" });
    expect(replay.fingerprint).toBe(revised.fingerprint);

    const sourceBase = { ...governed, statement: "Measure line pressure within the revised supplied range", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "DESIGN_INPUT", sourceClass: "D8_GOVERNED_CONTEXT", sourceRef: "d8-basis-note-1", sourceRevision: "rev-d8-2" };
    expect(() => recordIacSourceRequirement(store, who, { ...sourceBase, requirementId: "req-dup" })).toThrow(/DUPLICATE_REQUIREMENT_REJECTED/);
    expect(() => recordIacSourceRequirement(store, who, { ...governed, requirementId: "req-src-2", statement: "changed statement", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "DESIGN_INPUT", sourceClass: "D8_GOVERNED_CONTEXT", sourceRef: "d8-basis-note-1", sourceRevision: "rev-d8-2", assertedFingerprint: revised.fingerprint })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordIacSourceRequirement(store, who, { ...sourceBase, requirementId: "req-float", objectRevisionFingerprint: "latest" })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordIacSourceRequirement(store, who, { ...sourceBase, requirementId: "req-role", requirementRole: "ADOPTED_D8_REQUIREMENT" })).toThrow(/ADOPTION_EXPLICIT_REQUIRED/);
    expect(() => recordIacSourceRequirement(store, who, { ...sourceBase, requirementId: "req-accept", requirementStatus: "ACCEPTED_FOR_PURPOSE" })).toThrow(/REQUIREMENT_ACCEPTANCE_NOT_IN_R7/);
    expect(() => recordIacSourceRequirement(store, who, { ...governed, requirementId: "req-d6-float", statement: "another process source", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "INTERFACE_INPUT", sourceClass: "D6_PROCESS_REQUIREMENT", sourceRef: "d6-req-1", sourceRevision: "fp-d6-missing", upstreamId: "d6-req-1", upstreamFingerprint: "latest" })).toThrow(/UPSTREAM_REVISION_REQUIRED/);
    expect(() => recordIacSourceRequirement(store, actor({ actorId: "AI-recorder", authority: "AI" }), { ...sourceBase, requirementId: "req-ai" })).toThrow(/AI_NOT_IAC_AUTHORITY/);
    expect(() => recordIacSourceRequirement(store, actor({ authority: "ADMIN" }), { ...sourceBase, requirementId: "req-admin" })).toThrow(/ADMIN_NOT_IAC_AUTHORITY/);
    expect(() => recordIacSourceRequirement(store, actor({ tenantId: "tenant-b" }), { ...sourceBase, requirementId: "req-cross" })).toThrow(/CROSS_SCOPE_OPERATION|R1_CONTEXT_NOT_FOUND/);
    expect(() => recordIacSourceRequirement(store, who, { ...sourceBase, requirementId: "req-auto", autoAdopt: true })).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => recordIacAssumption(store, who, { ...governed, assumptionId: "asm-fact", statement: "A different assumption", validationStatus: "validated" })).toThrow(/ASSUMPTION_NOT_VALIDATED_FACT/);
    expect(() => recordIacEngineeringDecision(store, who, { ...governed, decisionId: "dec-ai", statement: "An AI decision", aiRecommendation: true, alternatives: [{ id: "alt-e", statement: "Suggested text", is_selected: true }] })).toThrow(/AI_DECISION_REJECTED/);
    expect(() => recordIacEngineeringDecision(store, who, { ...governed, decisionId: "dec-empty", statement: "No alternative", alternatives: [] })).toThrow(/ALTERNATIVE_REQUIRED/);
    expect(() => recordIacEngineeringDecision(store, who, { ...governed, decisionId: "dec-two", statement: "Two selected", alternatives: [{ id: "alt-f", statement: "First", is_selected: true }, { id: "alt-g", statement: "Second", is_selected: true }] })).toThrow(/at most one alternative/);
    expect(() => recordIacChange(store, who, { ...alarmGoverned, changeId: "chg-empty", changeCategory: "R6_SAFETY_CHANGED", reason: "Missing dependency", priorRevisionFingerprint: alarmObject.fingerprint, currentRevisionFingerprint: alarmObject.fingerprint, dependencies: [] })).toThrow(/EXPLICIT_DEPENDENCY_REQUIRED/);
    expect(() => recordIacChange(store, who, { ...alarmGoverned, changeId: "chg-infer", changeCategory: "R6_SAFETY_CHANGED", reason: "Inferred dependency", priorRevisionFingerprint: alarmObject.fingerprint, currentRevisionFingerprint: alarmObject.fingerprint, dependencies: [{ targetKind: "tag_match", targetId: alarm.contextRecordId, targetFingerprint: alarm.fingerprint }] })).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => recordIacChange(store, who, { ...alarmGoverned, changeId: "chg-pfd", changeCategory: "R6_SAFETY_CHANGED", reason: "Would calculate PFD", priorRevisionFingerprint: alarmObject.fingerprint, currentRevisionFingerprint: alarmObject.fingerprint, dependencies: [{ targetKind: "R6_SAFETY", targetId: alarm.contextRecordId, targetFingerprint: alarm.fingerprint }], calculatePfd: true })).toThrow(/FUNCTIONAL_SAFETY_CHANGE_NOT_IN_R7/);
    expect(() => recordIacChange(store, who, { ...alarmGoverned, changeId: "chg-sis", changeCategory: "R6_SAFETY_CHANGED", reason: "Would reconfigure SIS", priorRevisionFingerprint: alarmObject.fingerprint, currentRevisionFingerprint: alarmObject.fingerprint, dependencies: [{ targetKind: "R6_SAFETY", targetId: alarm.contextRecordId, targetFingerprint: alarm.fingerprint }], reconfigureSis: true })).toThrow(/CONTROL_SYSTEM_CHANGE_NOT_IN_R7/);
    expect(() => markIacDependentCurrentness(store, who, { ...governed, markId: "mark-unrelated", changeId: change.changeId, targetKind: "R1_OBJECT", targetId: point.objectId, targetFingerprint: point.fingerprint, mark: "STALE" })).toThrow(/UNRELATED_CURRENTNESS_REJECTED/);
    expect(r2.measurements[0].recordStatus).toBe("CURRENT");
    expect(() => adoptIacRequirementAutomatically()).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => reselectIacInstrumentFromChange()).toThrow(/INSTRUMENT_CHANGE_NOT_IN_R7/);
    expect(() => retuneIacLoopFromChange()).toThrow(/LOOP_CHANGE_NOT_IN_R7/);
    expect(() => rationalizeIacAlarmFromChange()).toThrow(/ALARM_CHANGE_NOT_IN_R7/);
    expect(() => recalculateIacSilFromChange()).toThrow(/FUNCTIONAL_SAFETY_CHANGE_NOT_IN_R7/);
    expect(() => rewriteIacControlLogicFromChange()).toThrow(/LOGIC_CHANGE_NOT_IN_R7/);
    expect(() => inferIacChangeDependency()).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => closeIacReassessmentAsValidated()).toThrow(/REASSESSMENT_NOT_VALIDATION/);
    expect(() => mutateIacSafetyContextFromChange()).toThrow(/UPSTREAM_MUTATION_REJECTED/);
    expect(r6.contexts[0].fingerprint).toBe(alarm.fingerprint);
    expect(store.currentnessMarks).toHaveLength(1);
    const successorObject = recordIacObjectIdentity(r1, who, { objectId: "mp-101-r2", contextId: "ctx-1", objectType: "IAC_MEASUREMENT_POINT", ...identity("mp-101-r2"), predecessorObjectId: point.objectId });
    expect(successorObject.predecessorObjectId).toBe(point.objectId);
    expect(revised.objectRevisionFingerprint).toBe(point.fingerprint);
    expect(adopted.objectRevisionFingerprint).toBe(point.fingerprint);

    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D8.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    const sourceText = readFileSync(join(here, "requirements-assumptions-change.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).toMatch(/assertHumanApprovalActor/);
    expect(sourceText).toMatch(/assertAssumptionValidationStatus/);
    expect(sourceText).toMatch(/assertSingleSelectedAlternative/);
    expect(sourceText).toMatch(/assertSupersessionPair/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "requirements-assumptions-change.ts"), sourceText)).toEqual([]);
    const pkg = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(pkg.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
