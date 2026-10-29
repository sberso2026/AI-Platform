/**
 * EOS-D8-R7 requirements, assumptions, decisions, change, and reassessment.
 * One bounded runtime on exact R1 through R6 revisions.
 * Canonical governance only. A change marks an explicit dependent. It does not redesign.
 */
import {
  AI_RECOMMENDATION_EQUALS_D8_ENGINEERING_DECISION,
  D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT,
  D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D8_ASSUMPTION_EQUALS_VALIDATED_FACT,
  D8_CHANGE_EQUALS_AUTOMATIC_REDESIGN,
  D8_CHANGE_EQUALS_AUTOMATIC_REVALIDATION,
  D8_CURRENTNESS_STATES,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
  D8_MATURITY_STATES,
  D8_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D8_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D8_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D8_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  PARALLEL_D8_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D8_CHANGE_ENGINE_CREATED,
  PARALLEL_D8_DECISION_ENGINE_CREATED,
  PARALLEL_D8_REQUIREMENT_ENGINE_CREATED,
  SOURCE_REQUIREMENT_AUTO_ADOPTED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
} from "@rtb/types";
import {
  assertAssumptionMateriality,
  assertAssumptionValidationStatus,
  assertHumanApprovalActor,
  assertSingleSelectedAlternative,
  assertSupersessionPair,
} from "../decision-intelligence/invariants";
import { INFORMATION_REQUIREMENT_AI_BOUNDARY, INFORMATION_REQUIREMENT_STATUSES, INFORMATION_REQUIREMENT_TYPES } from "../information-requirements/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D8_CONTEXT_AUTHORITY, D8_DISCIPLINE, type D8R1Actor, type D8R1ObjectRecord } from "./identity-foundation";
import {
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
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
  D6_REOPENED,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  D7_PROTECTION_CONTEXT_EQUALS_D8_SIS_IMPLEMENTATION,
  D7_REOPENED,
  D7_STATUS,
  D7_TRACK_COMPLETE,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
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
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  type D8R6Store,
} from "./safety-interlock-shutdown-context";

export const D8_R7_STATUS = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED" as const;
export const D8_R7_MATURITY = D8_R7_STATUS;
export const D8_R7_MATURITY_STATE = D8_R7_STATUS;
export const D8_R7_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D8_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md" as const;
export const D8_R1_R6_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D8_R7_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D8_R7_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D8_R7_SUBJECT_AUTO_REPOINTED = false as const;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 7 as const;
export const D8_R6_RUNTIME_COUNT = R6_RUNTIME_COUNT;
export const D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED = true as const;
export const D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 1 as const;
export const D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = true as const;
export const D8_SOURCE_REQUIREMENT_CONTEXT_IMPLEMENTED = true as const;
export const D8_REQUIREMENT_ADOPTION_EXPLICIT = true as const;
export const D8_REQUIREMENT_ADOPTION_AUTHORITY_REQUIRED = true as const;
export const D8_REQUIREMENT_ADOPTION_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D8_REQUIREMENT_ADOPTION_AUTHORITY = false as const;
export const ADMIN_EQUALS_D8_REQUIREMENT_ADOPTION_AUTHORITY = false as const;
export const D8_R7_REQUIREMENT_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R7_REQUIREMENT_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D8_REQUIREMENT_AUTO_ACCEPTED = false as const;
export const EXACT_D8_REQUIREMENT_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D8_REQUIREMENT_SUBJECT_ALLOWED = false as const;
export const D4_MECHANICAL_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT = false as const;
export const D5_PIPING_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT = false as const;
export const D6_PROCESS_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT = false as const;
export const D7_ELECTRICAL_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT = false as const;
export const D6_CONTROL_REQUIREMENT_EQUALS_VALIDATED_D8_CONTROL_SYSTEM = false as const;
export const D7_POWER_REQUIREMENT_EQUALS_D8_CONTROL_SYSTEM_DESIGN = false as const;
export const D8_ASSUMPTION_CONTEXT_IMPLEMENTED = true as const;
export const D8_ASSUMPTION_EQUALS_APPROVED_ENGINEERING = false as const;
export const D8_ASSUMPTION_AUTHORITY_REQUIRED = true as const;
export const D8_ASSUMPTION_AUTHORITY_TRACEABLE = true as const;
export const AI_CAN_CREATE_AUTHORITATIVE_D8_ASSUMPTION = false as const;
export const ADMIN_CAN_CREATE_AUTHORITATIVE_D8_ASSUMPTION_WITHOUT_AUTHORITY = false as const;
export const D8_ASSUMPTION_APPLICABILITY_EXPLICIT = true as const;
export const D8_ASSUMPTION_LIMITATIONS_EXPLICIT = true as const;
export const D8_ASSUMPTION_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D8_ENGINEERING_DECISION_CONTEXT_IMPLEMENTED = true as const;
export const D8_ENGINEERING_DECISION_EQUALS_APPROVAL = false as const;
export const D8_ENGINEERING_DECISION_EQUALS_VALIDATION = false as const;
export const D8_ENGINEERING_DECISION_EQUALS_CONFORMANCE = false as const;
export const D8_ENGINEERING_DECISION_AUTHORITY_REQUIRED = true as const;
export const D8_ENGINEERING_DECISION_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D8_ENGINEERING_DECISION_AUTHORITY = false as const;
export const ADMIN_EQUALS_D8_ENGINEERING_DECISION_AUTHORITY = false as const;
export const D8_ENGINEERING_DECISION_BASIS_REQUIRED = true as const;
export const D8_ENGINEERING_DECISION_BASIS_TRACEABLE = true as const;
export const D8_CHANGE_CONTEXT_IMPLEMENTED = true as const;
export const D8_CHANGE_EQUALS_AUTOMATIC_RECONFIGURATION = false as const;
export const D8_CHANGE_EQUALS_AUTOMATIC_RECALCULATION = false as const;
export const D8_CHANGE_AUTO_RESELECTS_INSTRUMENT = false as const;
export const D8_CHANGE_AUTO_RESIZES_INSTRUMENT = false as const;
export const D8_CHANGE_AUTO_CHANGES_INSTRUMENT_RANGE = false as const;
export const D8_CHANGE_AUTO_CHANGES_SETPOINT = false as const;
export const D8_CHANGE_AUTO_REWRITES_SIGNAL_RELATIONSHIP = false as const;
export const D8_CHANGE_AUTO_REALLOCATES_IO = false as const;
export const D8_CHANGE_AUTO_REASSIGNS_IO_CHANNEL = false as const;
export const D8_CHANGE_AUTO_REBUILDS_CONTROL_LOOP = false as const;
export const D8_CHANGE_AUTO_RETUNES_CONTROL_LOOP = false as const;
export const D8_CHANGE_AUTO_RECONFIGURES_DCS = false as const;
export const D8_CHANGE_AUTO_RECONFIGURES_PLC = false as const;
export const D8_CHANGE_AUTO_RECONFIGURES_SIS = false as const;
export const D8_CHANGE_AUTO_RECONFIGURES_SCADA = false as const;
export const D8_CHANGE_AUTO_RECONFIGURES_RTU = false as const;
export const D8_CHANGE_AUTO_REASSIGNS_CONTROLLER = false as const;
export const D8_CHANGE_AUTO_RECONFIGURES_NETWORK = false as const;
export const D8_CHANGE_AUTO_REWRITES_CONTROL_LOGIC = false as const;
export const D8_CHANGE_AUTO_REWRITES_INTERLOCK_LOGIC = false as const;
export const D8_CHANGE_AUTO_REWRITES_TRIP_LOGIC = false as const;
export const D8_CHANGE_AUTO_REWRITES_SHUTDOWN_LOGIC = false as const;
export const D8_CHANGE_AUTO_RATIONALIZES_ALARM = false as const;
export const D8_CHANGE_AUTO_CHANGES_ALARM_PRIORITY = false as const;
export const D8_CHANGE_AUTO_RECALCULATES_SIL = false as const;
export const D8_CHANGE_AUTO_REVERIFIES_SIL = false as const;
export const D8_CHANGE_AUTO_CALCULATES_PFD = false as const;
export const D8_CHANGE_AUTO_CALCULATES_PFH = false as const;
export const D8_CHANGE_AUTO_REDESIGNS_SIF = false as const;
export const D8_CHANGE_AUTO_REVALIDATES_FUNCTIONAL_SAFETY = false as const;
export const D8_SUPERSESSION_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_SUPERSESSION_EXPLICIT = true as const;
export const D8_INFERRED_SUPERSESSION_ALLOWED = false as const;
export const D8_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const D8_CHANGE_AUTO_REPOINTS_HISTORICAL_REFERENCE = false as const;
export const D8_EXPLICIT_CHANGE_DEPENDENCY_REQUIRED = true as const;
export const D8_INFERRED_CHANGE_DEPENDENCY_ALLOWED = false as const;
export const D8_REASSESSMENT_GOVERNANCE_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_DESIGN_INVALID = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_APPROVED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_CONFORMANT = false as const;
export const D8_REASSESSMENT_TRIGGER_REQUIRES_EXPLICIT_DEPENDENCY = true as const;
export const D8_REASSESSMENT_AUTO_INFERRED_FROM_SIMILARITY = false as const;
export const D8_REASSESSMENT_PERFORMS_ENGINEERING_CALCULATION = false as const;
export const D8_REASSESSMENT_PERFORMS_AUTOMATIC_REDESIGN = false as const;
export const D8_REASSESSMENT_PERFORMS_AUTOMATIC_RECONFIGURATION = false as const;
export const D8_REASSESSMENT_PERFORMS_AUTOMATIC_REVALIDATION = false as const;
export const D8_R7_CHANGE_CAN_REQUIRE_R6_REASSESSMENT = true as const;
export const R6_REASSESSMENT_REQUIRED_EQUALS_ALARM_INVALID = false as const;
export const R6_REASSESSMENT_REQUIRED_EQUALS_SIF_INVALID = false as const;
export const R6_REASSESSMENT_REQUIRED_EQUALS_SIL_FAILED = false as const;
export const D8_R7_PERFORMS_SIL_CALCULATION = false as const;
export const D8_R7_PERFORMS_SIL_VERIFICATION = false as const;
export const D8_R7_PERFORMS_PFD_CALCULATION = false as const;
export const D8_R7_PERFORMS_PFH_CALCULATION = false as const;
export const D8_R7_PERFORMS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const D8_R7_GENERATES_CONTROL_LOGIC = false as const;
export const D8_R7_GENERATES_SAFETY_LOGIC = false as const;
export const D8_R7_MODIFIES_CONTROL_LOGIC = false as const;
export const D8_R7_PERFORMS_CONTROL_LOOP_TUNING = false as const;
export const D8_R7_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D8_R7_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT = false as const;
export const D8_R7_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT = false as const;
export const D8_R7_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT = false as const;
export const D8_R7_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT = false as const;
export const D8_R7_AUTO_MUTATES_R6_SAFETY_CONTEXT = false as const;
export const D8_R7_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D8_R7_AUTO_MUTATES_D2_CIVIL = false as const;
export const D8_R7_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D8_R7_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D8_R7_AUTO_MUTATES_D5_PIPING = false as const;
export const D8_R7_AUTO_MUTATES_D6_PROCESS = false as const;
export const D8_R7_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const AI_CAN_ADOPT_D8_REQUIREMENT = false as const;
export const AI_CAN_MAKE_AUTHORITATIVE_D8_ENGINEERING_DECISION = false as const;
export const AI_CAN_APPROVE_D8_ENGINEERING_DECISION = false as const;
export const AI_CAN_CLOSE_REASSESSMENT_AS_VALIDATED = false as const;
export const ADMIN_CAN_PROMOTE_D8_REQUIREMENT_TO_ENGINEERING_TRUTH_WITHOUT_AUTHORITY = false as const;
export const ADMIN_CAN_PROMOTE_D8_DECISION_TO_APPROVAL = false as const;
export const D8_R7_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R7_SOURCE_BASIS_TRACEABLE = true as const;
export const D8_R7_APPLICABILITY_EXPLICIT = true as const;
export const D8_R7_LIMITATIONS_EXPLICIT = true as const;
export const D8_R7_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D8_R7_PROVENANCE_REQUIRED = true as const;
export const D8_R7_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D8_R7_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R7_ACCESS_ALLOWED = false as const;
export const D8_CHANGE_CURRENTNESS_INTEGRATION_IMPLEMENTED = true as const;
export const D8_CHANGE_AUTO_MARKS_UNRELATED_RECORD_STALE = false as const;
export const D8_R7_HISTORY_PRESERVED = true as const;
export const D8_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D8_R7_MUTATION_ALLOWED = false as const;
export const D8_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R7_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R7_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D8_R7_INFORMATION_MAY_APPROVE_ENGINEERING = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const D8_R7_REQUIREMENT_ROLES = ["SOURCE_REQUIREMENT", "CANDIDATE_REQUIREMENT", "ADOPTED_D8_REQUIREMENT"] as const;
export const D8_R7_OPEN_REQUIREMENT_STATUSES = ["PLANNED", "REQUESTED", "AWAITING_INFORMATION", "RECEIVED", "NOT_APPLICABLE"] as const;
export const D8_R7_SOURCE_CLASSES = ["D8_GOVERNED_CONTEXT", "D4_MECHANICAL_REQUIREMENT", "D5_PIPING_REQUIREMENT", "D6_PROCESS_REQUIREMENT", "D7_ELECTRICAL_REQUIREMENT"] as const;
export const D8_R7_CHANGE_CATEGORIES = ["REQUIREMENT_CHANGED", "ASSUMPTION_CHANGED", "DECISION_SUPERSEDED", "R2_MEASUREMENT_CHANGED", "R3_DEVICE_CHANGED", "R4_SIGNAL_CHANGED", "R5_SYSTEM_CHANGED", "R6_SAFETY_CHANGED", "REASSESSMENT_REQUIRED"] as const;
export const D8_R7_DEPENDENCY_TARGETS = ["R1_OBJECT", "R2_MEASUREMENT", "R3_DEVICE", "R4_SIGNAL", "R4_IO", "R4_LOOP", "R5_SYSTEM", "R5_NODE", "R6_SAFETY", "R7_REQUIREMENT", "R7_ASSUMPTION", "R7_DECISION"] as const;
export const D8_R7_REASSESSMENT_STATES = ["REASSESSMENT_REQUIRED", "REASSESSMENT_COMPLETED"] as const;
export const D8_R7_CURRENTNESS_MARKS = ["STALE", "REASSESSMENT_REQUIRED"] as const;
export const UNAUTHORIZED_D8_R8_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_REQUIREMENT_AUTO_ADOPTION = false as const;
export const UNAUTHORIZED_ASSUMPTION_PROMOTION_TO_FACT = false as const;
export const UNAUTHORIZED_AI_ENGINEERING_DECISION = false as const;
export const UNAUTHORIZED_DECISION_TO_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_INSTRUMENT_RESELECTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_INSTRUMENT_RESIZING = false as const;
export const UNAUTHORIZED_AUTOMATIC_RANGE_CHANGE = false as const;
export const UNAUTHORIZED_AUTOMATIC_SETPOINT_CHANGE = false as const;
export const UNAUTHORIZED_IO_REALLOCATION = false as const;
export const UNAUTHORIZED_IO_CHANNEL_REASSIGNMENT = false as const;
export const UNAUTHORIZED_LOOP_RETUNING = false as const;
export const UNAUTHORIZED_DCS_RECONFIGURATION = false as const;
export const UNAUTHORIZED_PLC_RECONFIGURATION = false as const;
export const UNAUTHORIZED_SIS_RECONFIGURATION = false as const;
export const UNAUTHORIZED_SCADA_RECONFIGURATION = false as const;
export const UNAUTHORIZED_RTU_RECONFIGURATION = false as const;
export const UNAUTHORIZED_CONTROL_LOGIC_REWRITE = false as const;
export const UNAUTHORIZED_INTERLOCK_LOGIC_REWRITE = false as const;
export const UNAUTHORIZED_TRIP_LOGIC_REWRITE = false as const;
export const UNAUTHORIZED_SHUTDOWN_LOGIC_REWRITE = false as const;
export const UNAUTHORIZED_ALARM_PRIORITY_CHANGE = false as const;
export const UNAUTHORIZED_SIL_RECALCULATION = false as const;
export const UNAUTHORIZED_SIL_REVERIFICATION = false as const;
export const UNAUTHORIZED_SIF_REDESIGN = false as const;
export const UNAUTHORIZED_FUNCTIONAL_SAFETY_REVALIDATION = false as const;
export const UNAUTHORIZED_COUNTERPART_DISCIPLINE_MUTATION = false as const;
export const UNAUTHORIZED_INFERRED_DEPENDENCY = false as const;
export const UNAUTHORIZED_INFERRED_SUPERSESSION = false as const;
export const D8_R8_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[7];
export const D8_R8_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[7];
export const D8_R8_CANONICAL_SCOPE =
  "Implement governed D8 discipline interfaces and handoffs using exact D8 R1 through R7 revisions and exact counterpart discipline revisions. Support bounded handoffs with D6 Process and D7 Electrical, and justified bounded contexts with D4 Mechanical, D5 Piping, D1 Structural, D2 Civil, and D3 Geotechnical. Preserve handoff content distinct from counterpart engineering truth, handoff completion distinct from counterpart validation, handoff acceptance distinct from counterpart approval, a D8 requirement distinct from a counterpart adopted requirement, and D8 validation state distinct from counterpart validation state. Require explicit counterpart revisions and explicit interface dependencies. Do not infer counterpart relationships, transfer engineering authority, mutate counterpart records, validate counterpart engineering, start D9 reasoning, or auto-propagate changes into counterpart disciplines." as const;
export const D8_R8_STARTED = false as const;
export const D8_R7_READY_FOR_NEXT_PHASE = true as const;
export const D8_R7_NEXT_PHASE = D8_R8_CANONICAL_PHASE;
export const D8_R7_NEXT_PHASE_TYPE = D8_R8_PHASE_TYPE;
export const D8_R7_CANONICAL_NEXT_PHASE = D8_R8_CANONICAL_PHASE;
export const D8_R7_CANONICAL_NEXT_PHASE_SCOPE = D8_R8_CANONICAL_SCOPE;
export const D8_R7_BLOCKER = "NONE" as const;
export const D8_R7_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D8_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  PARALLEL_D8_REQUIREMENT_ENGINE_CREATED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_D8_REQUIREMENT,
  SOURCE_REQUIREMENT_AUTO_ADOPTED,
  D8_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  PARALLEL_D8_ASSUMPTION_ENGINE_CREATED,
  D8_ASSUMPTION_EQUALS_VALIDATED_FACT,
  D8_REUSES_CANONICAL_DECISION_GOVERNANCE,
  PARALLEL_D8_DECISION_ENGINE_CREATED,
  AI_RECOMMENDATION_EQUALS_D8_ENGINEERING_DECISION,
  D8_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  PARALLEL_D8_CHANGE_ENGINE_CREATED,
  D8_CHANGE_EQUALS_AUTOMATIC_REDESIGN,
  D8_CHANGE_EQUALS_AUTOMATIC_REVALIDATION,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  D6_PROCESS_MEASUREMENT_REQUIREMENT_EQUALS_VALIDATED_D8_INSTRUMENT,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D6_PROCESS_SAFETY_INTENT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_D8_SIS_IMPLEMENTATION,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_CONTROL_VALVE_SIZING_RUNTIME_COUNT,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_CONTROL_LOOP_TUNING_RUNTIME_COUNT,
  D8_CONTROL_LOGIC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D8_FUNCTIONAL_SAFETY_VALIDATION_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D8_REVIEW_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D8_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D8_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D8_EQUALS_D2_CIVIL_AUTHORITY,
  D8_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D8_EQUALS_D4_MECHANICAL_AUTHORITY,
  D8_EQUALS_D5_PIPING_AUTHORITY,
  D8_EQUALS_D6_PROCESS_AUTHORITY,
  D8_EQUALS_D7_ELECTRICAL_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  D8_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_INFERRED_LINEAGE_ALLOWED,
  D8_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  D5_TRACK_COMPLETE,
  D5_REOPENED,
  D6_TRACK_COMPLETE,
  D6_STATUS,
  D6_REOPENED,
  D7_TRACK_COMPLETE,
  D7_STATUS,
  D7_REOPENED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const SPOOF = new Set(["auto", "validated", "approved", "compliant", "certified", "optimized", "calculated"]);
const INFERRED = new Set([
  "tag_match",
  "similar_description",
  "process_variable",
  "same_loop",
  "same_system",
  "document_proximity",
  "drawing_proximity",
  "semantic_similarity",
  "ai_similarity",
  "inferred",
  "ai_interpretation",
]);

type Stage = (typeof D8_MATURITY_STATES)[number];
type Currentness = (typeof D8_CURRENTNESS_STATES)[number];
type Status = "CURRENT" | "SUPERSEDED";
type SourceClass = (typeof D8_R7_SOURCE_CLASSES)[number];
type TargetKind = (typeof D8_R7_DEPENDENCY_TARGETS)[number];
type ExternalRevision = { id: string; fingerprint: string; tenantId: string };

type Prohibited = {
  autoAdopt?: boolean;
  inferSupersession?: boolean;
  inferDependency?: boolean;
  inferStaleness?: boolean;
  reselectInstrument?: boolean;
  resizeInstrument?: boolean;
  changeRange?: boolean;
  changeSetpoint?: boolean;
  rewriteSignal?: boolean;
  reallocateIo?: boolean;
  reassignChannel?: boolean;
  rebuildLoop?: boolean;
  retuneLoop?: boolean;
  reconfigureDcs?: boolean;
  reconfigurePlc?: boolean;
  reconfigureSis?: boolean;
  reconfigureScada?: boolean;
  reconfigureRtu?: boolean;
  reassignController?: boolean;
  reconfigureNetwork?: boolean;
  rewriteControlLogic?: boolean;
  rewriteInterlock?: boolean;
  rewriteTrip?: boolean;
  rewriteShutdown?: boolean;
  rationalizeAlarm?: boolean;
  changeAlarmPriority?: boolean;
  recalculateSil?: boolean;
  reverifySil?: boolean;
  calculatePfd?: boolean;
  calculatePfh?: boolean;
  redesignSif?: boolean;
  revalidateFunctionalSafety?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateD1?: boolean;
  mutateD2?: boolean;
  mutateD3?: boolean;
  mutateD4?: boolean;
  mutateD5?: boolean;
  mutateD6?: boolean;
  mutateD7?: boolean;
  aiRecommendation?: boolean;
  adminDecision?: boolean;
  approveDecision?: boolean;
  closeReassessmentAsValidated?: boolean;
  repoint?: boolean;
  propagate?: boolean;
};

type Governed = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type Dependency = { targetKind: TargetKind; targetId: string; targetFingerprint: string };
type DependencyInput = { targetKind: string; targetId: string; targetFingerprint: string };

export type D8R7ExternalSources = {
  d4?: readonly ExternalRevision[];
  d5?: readonly ExternalRevision[];
  d6?: readonly ExternalRevision[];
  d7?: readonly ExternalRevision[];
};

export type D8R7RequirementRecord = {
  requirementId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D8_DISCIPLINE;
  authority: typeof D8_CONTEXT_AUTHORITY;
  statement: string;
  requirementRole: (typeof D8_R7_REQUIREMENT_ROLES)[number];
  requirementCategory: (typeof INFORMATION_REQUIREMENT_TYPES)[number];
  requirementStatus: (typeof D8_R7_OPEN_REQUIREMENT_STATUSES)[number];
  sourceClass: SourceClass;
  sourceRef: string;
  sourceRevision: string;
  upstreamId: string | null;
  upstreamFingerprint: string | null;
  adopted: boolean;
  autoAdopted: false;
  adoptionRationale: string | null;
  adoptionAuthorityId: string | null;
  sourceRequirementId: string | null;
  sourceRequirementFingerprint: string | null;
  designSatisfied: false;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorRequirementId: string | null;
};

export type D8R7AssumptionRecord = {
  assumptionId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  statement: string;
  validationStatus: "unvalidated";
  materiality: string;
  validatedFact: false;
  approvedEngineering: false;
  authorityId: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  fingerprint: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorAssumptionId: string | null;
};

export type D8R7DecisionRecord = {
  decisionId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  statement: string;
  alternatives: { id: string; statement: string; is_selected: boolean }[];
  authorityId: string;
  aiRecommendation: false;
  approved: false;
  validated: false;
  conformant: false;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  fingerprint: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorDecisionId: string | null;
};

export type D8R7ChangeRecord = {
  changeId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  priorRevisionFingerprint: string;
  currentRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  changeCategory: (typeof D8_R7_CHANGE_CATEGORIES)[number];
  reason: string;
  authorityId: string;
  dependencies: Dependency[];
  automaticRedesign: false;
  automaticReconfiguration: false;
  automaticRecalculation: false;
  automaticRevalidation: false;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  fingerprint: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
  predecessorChangeId: string | null;
};

export type D8R7ReassessmentRecord = {
  reassessmentId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  tenantId: string;
  changeId: string;
  targetKind: TargetKind;
  targetId: string;
  targetFingerprint: string;
  state: (typeof D8_R7_REASSESSMENT_STATES)[number];
  validationFailed: false;
  designInvalid: false;
  validated: false;
  approved: false;
  conformant: false;
  alarmInvalid: false;
  sifInvalid: false;
  silFailed: false;
  fingerprint: string;
  recordedAt: string;
  recordStatus: Status;
  currentness: Status;
};

export type D8R7CurrentnessMark = {
  markId: string;
  changeId: string;
  targetKind: TargetKind;
  targetId: string;
  targetFingerprint: string;
  mark: (typeof D8_R7_CURRENTNESS_MARKS)[number];
  unrelated: false;
  exposedAsCurrent: false;
  staleEqualsInvalid: false;
  fingerprint: string;
  recordedAt: string;
};

export type D8R7History = { historyId: string; subjectKind: string; subjectId: string; action: "CREATED" | "SUPERSEDED"; fingerprint: string; recordedAt: string };

export type D8R7Store = {
  r6: D8R6Store;
  sources: D8R7ExternalSources;
  now: () => string;
  requirements: D8R7RequirementRecord[];
  assumptions: D8R7AssumptionRecord[];
  decisions: D8R7DecisionRecord[];
  changes: D8R7ChangeRecord[];
  reassessments: D8R7ReassessmentRecord[];
  currentnessMarks: D8R7CurrentnessMark[];
  history: D8R7History[];
};

function fail(code: string): never {
  throw new Error(`D8_R7_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || SPOOF.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function assertActor(actor: D8R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_IAC_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_IAC_AUTHORITY");
  if (actor.authority === "IAC_ENGINEERING_AUTHORITY" || actor.authority === "INSTRUMENTATION_CONTROL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_IAC_ENGINEERING_AUTHORITY");
  if (actor.authority !== D8_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertScope(actor: D8R1Actor, input: Governed): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.autoAdopt === true) fail("AUTO_ADOPTION_REJECTED");
  if (input.inferSupersession === true) fail("INFERRED_SUPERSESSION_REJECTED");
  if (input.inferDependency === true || input.inferStaleness === true) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.reselectInstrument === true || input.resizeInstrument === true || input.changeRange === true || input.changeSetpoint === true) fail("INSTRUMENT_CHANGE_NOT_IN_R7");
  if (input.rewriteSignal === true || input.reallocateIo === true || input.reassignChannel === true) fail("IO_CHANGE_NOT_IN_R7");
  if (input.rebuildLoop === true || input.retuneLoop === true) fail("LOOP_CHANGE_NOT_IN_R7");
  if (input.reconfigureDcs === true || input.reconfigurePlc === true || input.reconfigureSis === true || input.reconfigureScada === true || input.reconfigureRtu === true || input.reassignController === true || input.reconfigureNetwork === true) fail("CONTROL_SYSTEM_CHANGE_NOT_IN_R7");
  if (input.rewriteControlLogic === true || input.rewriteInterlock === true || input.rewriteTrip === true || input.rewriteShutdown === true) fail("LOGIC_CHANGE_NOT_IN_R7");
  if (input.rationalizeAlarm === true || input.changeAlarmPriority === true) fail("ALARM_CHANGE_NOT_IN_R7");
  if (input.recalculateSil === true || input.reverifySil === true || input.calculatePfd === true || input.calculatePfh === true || input.redesignSif === true || input.revalidateFunctionalSafety === true) fail("FUNCTIONAL_SAFETY_CHANGE_NOT_IN_R7");
  if (input.mutateR1 === true || input.mutateR2 === true || input.mutateR3 === true || input.mutateR4 === true || input.mutateR5 === true || input.mutateR6 === true) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.mutateD1 === true || input.mutateD2 === true || input.mutateD3 === true || input.mutateD4 === true || input.mutateD5 === true || input.mutateD6 === true || input.mutateD7 === true) fail("COUNTERPART_MUTATION_REJECTED");
  if (input.aiRecommendation === true) fail("AI_DECISION_REJECTED");
  if (input.adminDecision === true || input.approveDecision === true) fail("APPROVAL_NOT_IN_R7");
  if (input.closeReassessmentAsValidated === true) fail("REASSESSMENT_NOT_VALIDATION");
  if (input.repoint === true) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
}

function governed(input: Governed, scopeId: string) {
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(scopeId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return { provenanceRef, sourceBasisRef, applicability, limitations };
}

function requireObject(store: D8R7Store, actor: D8R1Actor, input: Governed): D8R1ObjectRecord {
  const citedCurrentness = input.citedCurrentness.trim();
  if (!(D8_CURRENTNESS_STATES as readonly string[]).includes(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const stage = input.citedLifecycleStage.trim();
  if (!(D8_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.recordStatus !== "CURRENT" || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  const objectId = explicit(input.objectId, "R1_REVISION_REQUIRED");
  const revision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.fingerprint !== revision || object.contextId !== context.contextId) fail("R1_REVISION_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if ((citedCurrentness as Currentness) === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function remember(store: D8R7Store, subjectKind: string, subjectId: string, action: D8R7History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function externalOf(rows: readonly ExternalRevision[] | undefined, id: string, fingerprint: string, actor: D8R1Actor, code: string): ExternalRevision {
  const sourceId = explicit(id, code);
  const sourceFingerprint = explicit(fingerprint, code);
  const row = rows?.find((item) => item.id === sourceId && item.fingerprint === sourceFingerprint && item.tenantId === actor.tenantId);
  if (!row) fail(code);
  return row;
}

function dependencyOf(store: D8R7Store, actor: D8R1Actor, link: DependencyInput): Dependency {
  if (INFERRED.has(link.targetKind.trim().toLowerCase())) fail("INFERRED_DEPENDENCY_REJECTED");
  const targetKind = explicit(link.targetKind, "DEPENDENCY_TARGET_REQUIRED");
  if (!(D8_R7_DEPENDENCY_TARGETS as readonly string[]).includes(targetKind)) fail("DEPENDENCY_TARGET_NOT_ALLOWLISTED");
  const targetId = explicit(link.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(link.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  const kind = targetKind as TargetKind;
  const matches = (row: { tenantId: string; recordStatus: Status; fingerprint: string } | undefined) => Boolean(row && row.tenantId === actor.tenantId && row.recordStatus === "CURRENT" && row.fingerprint === targetFingerprint);
  let found = false;
  if (kind === "R1_OBJECT") found = matches(store.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === targetId));
  if (kind === "R2_MEASUREMENT") found = matches(store.r6.r5.r4.r3.r2.measurements.find((row) => row.measurementRecordId === targetId));
  if (kind === "R3_DEVICE") found = matches(store.r6.r5.r4.r3.devices.find((row) => row.deviceRecordId === targetId));
  if (kind === "R4_SIGNAL") found = matches(store.r6.r5.r4.signals.find((row) => row.signalRecordId === targetId));
  if (kind === "R4_IO") found = matches(store.r6.r5.r4.ioRecords.find((row) => row.ioRecordId === targetId));
  if (kind === "R4_LOOP") found = matches(store.r6.r5.r4.loops.find((row) => row.loopRecordId === targetId));
  if (kind === "R5_SYSTEM") found = matches(store.r6.r5.systems.find((row) => row.systemRecordId === targetId));
  if (kind === "R5_NODE") found = matches(store.r6.r5.nodes.find((row) => row.nodeRecordId === targetId));
  if (kind === "R6_SAFETY") found = matches(store.r6.contexts.find((row) => row.contextRecordId === targetId));
  if (kind === "R7_REQUIREMENT") found = matches(store.requirements.find((row) => row.requirementId === targetId));
  if (kind === "R7_ASSUMPTION") found = matches(store.assumptions.find((row) => row.assumptionId === targetId));
  if (kind === "R7_DECISION") found = matches(store.decisions.find((row) => row.decisionId === targetId));
  if (!found) fail("DEPENDENCY_REVISION_MISMATCH");
  return { targetKind: kind, targetId, targetFingerprint };
}

export function createD8R7Store(r6: D8R6Store, sources: D8R7ExternalSources = {}, now: () => string = () => "2026-10-25T00:00:00.000Z"): D8R7Store {
  if (R6_RUNTIME_COUNT !== 6) fail("R6_RUNTIME_COUNT_UNEXPECTED");
  return { r6, sources, now, requirements: [], assumptions: [], decisions: [], changes: [], reassessments: [], currentnessMarks: [], history: [] };
}

export function recordIacSourceRequirement(store: D8R7Store, actor: D8R1Actor, input: Governed & {
  requirementId: string;
  statement: string;
  requirementRole: string;
  requirementCategory: string;
  sourceClass: string;
  sourceRef: string;
  sourceRevision: string;
  requirementStatus?: string;
  upstreamId?: string | null;
  upstreamFingerprint?: string | null;
  predecessorRequirementId?: string | null;
}): D8R7RequirementRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const object = requireObject(store, actor, input);
  const requirementRole = explicit(input.requirementRole, "REQUIREMENT_ROLE_REQUIRED");
  if (requirementRole === "ADOPTED_D8_REQUIREMENT") fail("ADOPTION_EXPLICIT_REQUIRED");
  if (!(D8_R7_REQUIREMENT_ROLES as readonly string[]).includes(requirementRole)) fail("REQUIREMENT_ROLE_INVALID");
  const requestedStatus = input.requirementStatus ?? "PLANNED";
  if (!(INFORMATION_REQUIREMENT_STATUSES as readonly string[]).includes(requestedStatus)) fail("REQUIREMENT_STATUS_INVALID");
  if (!(D8_R7_OPEN_REQUIREMENT_STATUSES as readonly string[]).includes(requestedStatus)) fail("REQUIREMENT_ACCEPTANCE_NOT_IN_R7");
  const requirementCategory = explicit(input.requirementCategory, "REQUIREMENT_CATEGORY_REQUIRED");
  if (!(INFORMATION_REQUIREMENT_TYPES as readonly string[]).includes(requirementCategory)) fail("REQUIREMENT_CATEGORY_INVALID");
  const sourceClass = explicit(input.sourceClass, "SOURCE_BASIS_REQUIRED") as SourceClass;
  if (!(D8_R7_SOURCE_CLASSES as readonly string[]).includes(sourceClass)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  const statement = explicit(input.statement, "REQUIREMENT_STATEMENT_REQUIRED");
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const upstreamNeeded = sourceClass !== "D8_GOVERNED_CONTEXT";
  const upstream = upstreamNeeded
    ? externalOf(
        sourceClass === "D4_MECHANICAL_REQUIREMENT" ? store.sources.d4 : sourceClass === "D5_PIPING_REQUIREMENT" ? store.sources.d5 : sourceClass === "D6_PROCESS_REQUIREMENT" ? store.sources.d6 : store.sources.d7,
        input.upstreamId ?? "",
        input.upstreamFingerprint ?? "",
        actor,
        "UPSTREAM_REVISION_REQUIRED",
      )
    : null;
  if (!upstreamNeeded && (input.upstreamId || input.upstreamFingerprint)) fail("UPSTREAM_REFERENCE_NOT_EXPLICIT");
  const basis = governed(input, object.objectId);
  const requirementId = explicit(input.requirementId, "REQUIREMENT_REQUIRED");
  const predecessor = input.predecessorRequirementId ? store.requirements.find((row) => row.requirementId === input.predecessorRequirementId) ?? null : null;
  if (input.predecessorRequirementId && (!predecessor || predecessor.objectId !== object.objectId || predecessor.recordStatus !== "CURRENT" || predecessor.adopted)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ requirementId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint, statement, requirementRole, requirementCategory, sourceClass, sourceRef, sourceRevision, upstreamId: upstream?.id ?? null, upstreamFingerprint: upstream?.fingerprint ?? null, adopted: false, ...basis });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requirements.find((row) => row.requirementId === requirementId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINGERPRINT_MISMATCH");
  if (store.requirements.some((row) => row.recordStatus === "CURRENT" && row.requirementId !== predecessor?.requirementId && row.objectId === object.objectId && row.statement === statement && row.sourceRevision === sourceRevision && row.adopted === false)) fail("DUPLICATE_REQUIREMENT_REJECTED");
  if (predecessor) {
    const kept = predecessor.objectRevisionFingerprint;
    const index = store.requirements.findIndex((row) => row.requirementId === predecessor.requirementId);
    store.requirements[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.requirements[index].objectRevisionFingerprint !== kept) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "REQUIREMENT", predecessor.requirementId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D8R7RequirementRecord = Object.freeze({
    requirementId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    authority: D8_CONTEXT_AUTHORITY,
    statement,
    requirementRole: requirementRole as D8R7RequirementRecord["requirementRole"],
    requirementCategory: requirementCategory as D8R7RequirementRecord["requirementCategory"],
    requirementStatus: requestedStatus as D8R7RequirementRecord["requirementStatus"],
    sourceClass,
    sourceRef,
    sourceRevision,
    upstreamId: upstream?.id ?? null,
    upstreamFingerprint: upstream?.fingerprint ?? null,
    adopted: false,
    autoAdopted: false,
    adoptionRationale: null,
    adoptionAuthorityId: null,
    sourceRequirementId: null,
    sourceRequirementFingerprint: null,
    designSatisfied: false,
    ...basis,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRequirementId: predecessor?.requirementId ?? null,
  });
  store.requirements.push(record);
  remember(store, "REQUIREMENT", requirementId, "CREATED", fingerprint);
  return record;
}

export function recordIacAdoptedRequirement(store: D8R7Store, actor: D8R1Actor, input: Governed & {
  requirementId: string;
  statement: string;
  requirementCategory: string;
  sourceClass: string;
  sourceRef: string;
  sourceRevision: string;
  sourceRequirementId: string;
  adoptionRationale: string;
  upstreamId?: string | null;
  upstreamFingerprint?: string | null;
}): D8R7RequirementRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const object = requireObject(store, actor, input);
  const sourceRequirementId = explicit(input.sourceRequirementId, "SOURCE_REQUIREMENT_REQUIRED");
  const source = store.requirements.find((row) => row.requirementId === sourceRequirementId);
  if (!source || source.adopted || source.recordStatus !== "CURRENT" || source.tenantId !== actor.tenantId || source.objectId !== object.objectId) fail("SOURCE_REQUIREMENT_NOT_CURRENT");
  const statement = explicit(input.statement, "REQUIREMENT_STATEMENT_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const sourceClass = explicit(input.sourceClass, "SOURCE_BASIS_REQUIRED");
  if (source.statement !== statement || source.sourceRevision !== sourceRevision || source.sourceClass !== sourceClass) fail("ADOPTION_RESTATEMENT_MISMATCH");
  const rationale = explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED");
  const basis = governed(input, object.objectId);
  const requirementId = explicit(input.requirementId, "REQUIREMENT_REQUIRED");
  if (requirementId === source.requirementId) fail("ADOPTION_EXPLICIT_REQUIRED");
  const fingerprint = fingerprintCanonical({ requirementId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint, statement, requirementRole: "ADOPTED_D8_REQUIREMENT", requirementCategory: source.requirementCategory, sourceClass: source.sourceClass, sourceRef: source.sourceRef, sourceRevision, upstreamId: source.upstreamId, upstreamFingerprint: source.upstreamFingerprint, adopted: true, rationale, sourceRequirementId, authorityId: actor.actorId, ...basis });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requirements.find((row) => row.requirementId === requirementId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINGERPRINT_MISMATCH");
  if (store.requirements.some((row) => row.recordStatus === "CURRENT" && row.objectId === object.objectId && row.statement === statement && row.adopted === true)) fail("DUPLICATE_REQUIREMENT_REJECTED");
  const adopted: D8R7RequirementRecord = Object.freeze({
    requirementId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D8_DISCIPLINE,
    authority: D8_CONTEXT_AUTHORITY,
    statement,
    requirementRole: "ADOPTED_D8_REQUIREMENT",
    requirementCategory: source.requirementCategory,
    requirementStatus: source.requirementStatus,
    sourceClass: source.sourceClass,
    sourceRef: source.sourceRef,
    sourceRevision,
    upstreamId: source.upstreamId,
    upstreamFingerprint: source.upstreamFingerprint,
    adopted: true,
    autoAdopted: false,
    adoptionRationale: rationale,
    adoptionAuthorityId: actor.actorId,
    sourceRequirementId,
    sourceRequirementFingerprint: source.fingerprint,
    designSatisfied: false,
    ...basis,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRequirementId: null,
  });
  store.requirements.push(adopted);
  remember(store, "REQUIREMENT", requirementId, "CREATED", fingerprint);
  const preserved = store.requirements.find((row) => row.requirementId === sourceRequirementId);
  if (!preserved || preserved.adopted !== false || preserved.fingerprint !== source.fingerprint || preserved.objectRevisionFingerprint !== source.objectRevisionFingerprint) fail("SOURCE_AUTO_ADOPTED_REJECTED");
  return adopted;
}

export function recordIacAssumption(store: D8R7Store, actor: D8R1Actor, input: Governed & {
  assumptionId: string;
  statement: string;
  validationStatus?: string;
  materiality?: string;
  predecessorAssumptionId?: string | null;
}): D8R7AssumptionRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const object = requireObject(store, actor, input);
  const validationStatus = input.validationStatus ?? "unvalidated";
  assertAssumptionValidationStatus(validationStatus);
  if (validationStatus !== "unvalidated") fail("ASSUMPTION_NOT_VALIDATED_FACT");
  const materiality = input.materiality ?? "medium";
  assertAssumptionMateriality(materiality);
  const statement = explicit(input.statement, "ASSUMPTION_STATEMENT_REQUIRED");
  const basis = governed(input, object.objectId);
  const assumptionId = explicit(input.assumptionId, "ASSUMPTION_REQUIRED");
  const predecessor = input.predecessorAssumptionId ? store.assumptions.find((row) => row.assumptionId === input.predecessorAssumptionId) ?? null : null;
  if (input.predecessorAssumptionId && (!predecessor || predecessor.objectId !== object.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ assumptionId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint, statement, validationStatus, materiality, ...basis });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.assumptions.find((row) => row.assumptionId === assumptionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINGERPRINT_MISMATCH");
  if (store.assumptions.some((row) => row.recordStatus === "CURRENT" && row.assumptionId !== predecessor?.assumptionId && row.objectId === object.objectId && row.statement === statement)) fail("DUPLICATE_ASSUMPTION_REJECTED");
  if (predecessor) {
    const kept = predecessor.objectRevisionFingerprint;
    const index = store.assumptions.findIndex((row) => row.assumptionId === predecessor.assumptionId);
    store.assumptions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.assumptions[index].objectRevisionFingerprint !== kept) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "ASSUMPTION", predecessor.assumptionId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D8R7AssumptionRecord = Object.freeze({
    assumptionId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    statement,
    validationStatus: "unvalidated",
    materiality,
    validatedFact: false,
    approvedEngineering: false,
    authorityId: actor.actorId,
    ...basis,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorAssumptionId: predecessor?.assumptionId ?? null,
  });
  store.assumptions.push(record);
  remember(store, "ASSUMPTION", assumptionId, "CREATED", fingerprint);
  return record;
}

export function recordIacEngineeringDecision(store: D8R7Store, actor: D8R1Actor, input: Governed & {
  decisionId: string;
  statement: string;
  alternatives: { id: string; statement: string; is_selected?: boolean }[];
  predecessorDecisionId?: string | null;
}): D8R7DecisionRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const object = requireObject(store, actor, input);
  const alternatives = (input.alternatives ?? []).map((row) => ({ id: explicit(row.id, "ALTERNATIVE_REQUIRED"), statement: explicit(row.statement, "ALTERNATIVE_REQUIRED"), is_selected: row.is_selected === true }));
  if (alternatives.length === 0) fail("ALTERNATIVE_REQUIRED");
  assertSingleSelectedAlternative(alternatives);
  if (alternatives.filter((row) => row.is_selected).length !== 1) fail("ALTERNATIVE_REQUIRED");
  const statement = explicit(input.statement, "DECISION_STATEMENT_REQUIRED");
  const basis = governed(input, object.objectId);
  const decisionId = explicit(input.decisionId, "DECISION_REQUIRED");
  const predecessor = input.predecessorDecisionId ? store.decisions.find((row) => row.decisionId === input.predecessorDecisionId) ?? null : null;
  if (input.predecessorDecisionId) {
    if (!predecessor || predecessor.objectId !== object.objectId || predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    assertSupersessionPair({ decisionId, supersedesDecisionId: predecessor.decisionId, tenantId: actor.tenantId, workspaceId: actor.workspaceId, prior: { id: predecessor.decisionId, tenant_id: predecessor.tenantId, workspace_id: predecessor.workspaceId } });
  }
  const fingerprint = fingerprintCanonical({ decisionId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint, statement, alternatives, ...basis, predecessor: predecessor?.decisionId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.decisions.find((row) => row.decisionId === decisionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINGERPRINT_MISMATCH");
  if (store.decisions.some((row) => row.recordStatus === "CURRENT" && row.decisionId !== predecessor?.decisionId && row.objectId === object.objectId && row.statement === statement)) fail("DUPLICATE_DECISION_REJECTED");
  if (predecessor) {
    const kept = predecessor.objectRevisionFingerprint;
    const index = store.decisions.findIndex((row) => row.decisionId === predecessor.decisionId);
    store.decisions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.decisions[index].objectRevisionFingerprint !== kept) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "DECISION", predecessor.decisionId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D8R7DecisionRecord = Object.freeze({
    decisionId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    statement,
    alternatives,
    authorityId: actor.actorId,
    aiRecommendation: false,
    approved: false,
    validated: false,
    conformant: false,
    ...basis,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorDecisionId: predecessor?.decisionId ?? null,
  });
  store.decisions.push(record);
  remember(store, "DECISION", decisionId, "CREATED", fingerprint);
  return record;
}

export function recordIacChange(store: D8R7Store, actor: D8R1Actor, input: Governed & {
  changeId: string;
  changeCategory: string;
  reason: string;
  priorRevisionFingerprint: string;
  currentRevisionFingerprint: string;
  dependencies: DependencyInput[];
  predecessorChangeId?: string | null;
}): D8R7ChangeRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const object = requireObject(store, actor, input);
  const changeCategory = explicit(input.changeCategory, "CHANGE_CATEGORY_REQUIRED");
  if (!(D8_R7_CHANGE_CATEGORIES as readonly string[]).includes(changeCategory)) fail("CHANGE_CATEGORY_INVALID");
  if (!input.dependencies || input.dependencies.length === 0) fail("EXPLICIT_DEPENDENCY_REQUIRED");
  const dependencies = input.dependencies.map((link) => dependencyOf(store, actor, link));
  const priorRevisionFingerprint = explicit(input.priorRevisionFingerprint, "PRIOR_REVISION_REQUIRED");
  const currentRevisionFingerprint = explicit(input.currentRevisionFingerprint, "CURRENT_REVISION_REQUIRED");
  if (priorRevisionFingerprint !== object.fingerprint || currentRevisionFingerprint !== object.fingerprint) fail("SUBJECT_REVISION_MISMATCH");
  const reason = explicit(input.reason, "CHANGE_REASON_REQUIRED");
  const basis = governed(input, object.objectId);
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const predecessor = input.predecessorChangeId ? store.changes.find((row) => row.changeId === input.predecessorChangeId) ?? null : null;
  if (input.predecessorChangeId && (!predecessor || predecessor.objectId !== object.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ changeId, objectId: object.objectId, priorRevisionFingerprint, currentRevisionFingerprint, changeCategory, reason, dependencies, ...basis });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.changes.find((row) => row.changeId === changeId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINGERPRINT_MISMATCH");
  if (store.changes.some((row) => row.recordStatus === "CURRENT" && row.changeId !== predecessor?.changeId && row.objectId === object.objectId && row.reason === reason)) fail("DUPLICATE_CHANGE_REJECTED");
  if (predecessor) {
    const kept = predecessor.priorRevisionFingerprint;
    const index = store.changes.findIndex((row) => row.changeId === predecessor.changeId);
    store.changes[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.changes[index].priorRevisionFingerprint !== kept) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "CHANGE", predecessor.changeId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D8R7ChangeRecord = Object.freeze({
    changeId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    priorRevisionFingerprint,
    currentRevisionFingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    changeCategory: changeCategory as D8R7ChangeRecord["changeCategory"],
    reason,
    authorityId: actor.actorId,
    dependencies,
    automaticRedesign: false,
    automaticReconfiguration: false,
    automaticRecalculation: false,
    automaticRevalidation: false,
    ...basis,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorChangeId: predecessor?.changeId ?? null,
  });
  store.changes.push(record);
  remember(store, "CHANGE", changeId, "CREATED", fingerprint);
  return record;
}

export function recordIacReassessment(store: D8R7Store, actor: D8R1Actor, input: Governed & {
  reassessmentId: string;
  changeId: string;
  targetKind: string;
  targetId: string;
  targetFingerprint: string;
  state: string;
}): D8R7ReassessmentRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const object = requireObject(store, actor, input);
  const change = store.changes.find((row) => row.changeId === explicit(input.changeId, "CHANGE_REQUIRED") && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!change) fail("CHANGE_NOT_FOUND");
  const target = dependencyOf(store, actor, input);
  if (!change.dependencies.some((link) => link.targetKind === target.targetKind && link.targetId === target.targetId && link.targetFingerprint === target.targetFingerprint)) fail("DEPENDENCY_REVISION_MISMATCH");
  if (!(D8_R7_REASSESSMENT_STATES as readonly string[]).includes(input.state)) fail("REASSESSMENT_STATE_INVALID");
  const state = input.state as D8R7ReassessmentRecord["state"];
  const reassessmentId = explicit(input.reassessmentId, "REASSESSMENT_REQUIRED_ID");
  const fingerprint = fingerprintCanonical({ reassessmentId, changeId: change.changeId, ...target, state, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.reassessments.find((row) => row.reassessmentId === reassessmentId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINGERPRINT_MISMATCH");
  if (store.reassessments.some((row) => row.recordStatus === "CURRENT" && row.changeId === change.changeId && row.targetId === target.targetId && row.state === state)) fail("DUPLICATE_REASSESSMENT_REJECTED");
  const record: D8R7ReassessmentRecord = Object.freeze({
    reassessmentId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    tenantId: actor.tenantId,
    changeId: change.changeId,
    ...target,
    state,
    validationFailed: false,
    designInvalid: false,
    validated: false,
    approved: false,
    conformant: false,
    alarmInvalid: false,
    sifInvalid: false,
    silFailed: false,
    fingerprint,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
  });
  store.reassessments.push(record);
  remember(store, "REASSESSMENT", reassessmentId, "CREATED", fingerprint);
  return record;
}

export function markIacDependentCurrentness(store: D8R7Store, actor: D8R1Actor, input: Governed & {
  markId: string;
  changeId: string;
  targetKind: string;
  targetId: string;
  targetFingerprint: string;
  mark: string;
}): D8R7CurrentnessMark {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  requireObject(store, actor, input);
  const change = store.changes.find((row) => row.changeId === explicit(input.changeId, "CHANGE_REQUIRED") && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!change) fail("CHANGE_NOT_FOUND");
  const target = dependencyOf(store, actor, input);
  if (!change.dependencies.some((link) => link.targetKind === target.targetKind && link.targetId === target.targetId && link.targetFingerprint === target.targetFingerprint)) fail("UNRELATED_CURRENTNESS_REJECTED");
  if (!(D8_R7_CURRENTNESS_MARKS as readonly string[]).includes(input.mark)) fail("CURRENTNESS_MARK_INVALID");
  const mark = input.mark as D8R7CurrentnessMark["mark"];
  const markId = explicit(input.markId, "CURRENTNESS_MARK_REQUIRED");
  const fingerprint = fingerprintCanonical({ markId, changeId: change.changeId, ...target, mark });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.currentnessMarks.find((row) => row.markId === markId);
  if (existing) return existing.fingerprint === fingerprint ? existing : fail("FINGERPRINT_MISMATCH");
  const record: D8R7CurrentnessMark = Object.freeze({
    markId,
    changeId: change.changeId,
    ...target,
    mark,
    unrelated: false,
    exposedAsCurrent: false,
    staleEqualsInvalid: false,
    fingerprint,
    recordedAt: store.now(),
  });
  store.currentnessMarks.push(record);
  remember(store, "CURRENTNESS", markId, "CREATED", fingerprint);
  return record;
}

export function adoptIacRequirementAutomatically(): never {
  fail("AUTO_ADOPTION_REJECTED");
}
export function reselectIacInstrumentFromChange(): never {
  fail("INSTRUMENT_CHANGE_NOT_IN_R7");
}
export function retuneIacLoopFromChange(): never {
  fail("LOOP_CHANGE_NOT_IN_R7");
}
export function rationalizeIacAlarmFromChange(): never {
  fail("ALARM_CHANGE_NOT_IN_R7");
}
export function recalculateIacSilFromChange(): never {
  fail("FUNCTIONAL_SAFETY_CHANGE_NOT_IN_R7");
}
export function rewriteIacControlLogicFromChange(): never {
  fail("LOGIC_CHANGE_NOT_IN_R7");
}
export function inferIacChangeDependency(): never {
  fail("INFERRED_DEPENDENCY_REJECTED");
}
export function closeIacReassessmentAsValidated(): never {
  fail("REASSESSMENT_NOT_VALIDATION");
}
export function mutateIacSafetyContextFromChange(): never {
  fail("UPSTREAM_MUTATION_REJECTED");
}
