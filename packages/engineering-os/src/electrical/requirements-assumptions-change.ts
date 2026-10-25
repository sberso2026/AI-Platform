/**
 * EOS-D7-R7 Electrical requirements, assumptions, decisions, and change.
 * One bounded runtime on exact R1-R6 revisions. Canonical governance only.
 * A change may mark an explicit dependent. It does not recalculate or redesign.
 */
import {
  ADMIN_ACTION_EQUALS_ELECTRICAL_ENGINEERING_DECISION,
  AI_CAN_INVENT_AUTHORITATIVE_D7_ELECTRICAL_ASSUMPTION,
  AI_RECOMMENDATION_EQUALS_ELECTRICAL_ENGINEERING_DECISION,
  D6_POWER_LOAD_REQUIREMENT_EQUALS_VALIDATED_D7_LOAD,
  D6_PROCESS_REQUIREMENT_EQUALS_D7_ELECTRICAL_DESIGN,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D7_PROTECTION_OR_CONTROL_DESIGN,
  D7_CHANGE_AUTO_APPROVES_ENGINEERING,
  D7_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D7_CHANGE_AUTO_REDESIGNS_ENGINEERING,
  D7_CHANGE_AUTO_REVALIDATES_ENGINEERING,
  D7_CURRENTNESS_STATES,
  D7_ELECTRICAL_OBJECT_TYPES,
  D7_IMPLEMENTATION_PHASE_TYPES,
  D7_IMPLEMENTATION_PHASES,
  D7_MATURITY_STATES,
  D7_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D7_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D7_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D7_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  ELECTRICAL_ASSUMPTION_EQUALS_VALIDATED_FACT,
  MECHANICAL_EQUIPMENT_DUTY_EQUALS_ELECTRICAL_MOTOR_DESIGN,
  PARALLEL_D7_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D7_CHANGE_ENGINE_CREATED,
  PARALLEL_D7_DECISION_ENGINE_CREATED,
  PARALLEL_D7_REQUIREMENT_ENGINE_CREATED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_ELECTRICAL_REQUIREMENT,
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
import { D7_CONTEXT_AUTHORITY, D7_DISCIPLINE, D7_EXPLICIT_RELATIONSHIP_KINDS, type D7R1Actor } from "./identity-foundation";
import {
  D7_APPROVAL_RUNTIME_COUNT,
  D7_ARC_FLASH_CALCULATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_BATTERY_UPS_CALCULATION_RUNTIME_COUNT,
  D7_CABLE_SIZING_CALCULATION_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  ADMIN_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
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
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  UNAUTHORIZED_APPROVAL_PROMOTION,
  UNAUTHORIZED_CERTIFICATION_PROMOTION,
  UNAUTHORIZED_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_VALIDATION_PROMOTION,
  type D7R6Store,
} from "./protection-grounding-hazardous-area-context";
import type { D7R1Store } from "./identity-foundation";

export const D7_R7_STATUS = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED" as const;
export const D7_R7_MATURITY = D7_R7_STATUS;
export const D7_R7_MATURITY_STATE = D7_R7_STATUS;
export const D7_R7_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D7_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md" as const;
export const D7_R1_R6_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D7_R7_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D7_R7_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D7_R7_SUBJECT_AUTO_REPOINTED = false as const;
export const D7_RUNTIME_STARTED = true as const;
export const D7_RUNTIME_COUNT = 7 as const;
export const D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED = true as const;
export const D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 1 as const;
export const D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = true as const;
export const D7_ELECTRICAL_REQUIREMENT_GOVERNANCE_IMPLEMENTED = true as const;
export const SOURCE_REQUIREMENT_AUTO_ADOPTED = false as const;
export const SOURCE_REQUIREMENT_EQUALS_ELECTRICAL_DESIGN = false as const;
export const SOURCE_REQUIREMENT_EQUALS_VALIDATED_ELECTRICAL_DESIGN = false as const;
export const D7_R7_REQUIREMENT_SOURCE_REQUIRED = true as const;
export const D7_R7_REQUIREMENT_BASIS_TRACEABLE = true as const;
export const D7_R7_CAN_REFERENCE_D6_PROCESS_REQUIREMENT = true as const;
export const EXACT_D6_PROCESS_REQUIREMENT_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D6_PROCESS_REQUIREMENT_AUTO_ADOPTED_AS_D7_REQUIREMENT = false as const;
export const D7_R7_CAN_REFERENCE_D4_MECHANICAL_CONTEXT = true as const;
export const EXACT_D4_MECHANICAL_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const MECHANICAL_DUTY_AUTO_ADOPTED_AS_D7_REQUIREMENT = false as const;
export const D7_ELECTRICAL_ASSUMPTION_GOVERNANCE_IMPLEMENTED = true as const;
export const ELECTRICAL_ASSUMPTION_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D7_R7_ASSUMPTION_SOURCE_BASIS_REQUIRED = true as const;
export const D7_R7_ASSUMPTION_SOURCE_BASIS_TRACEABLE = true as const;
export const D7_ELECTRICAL_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED = true as const;
export const ELECTRICAL_ENGINEERING_DECISION_EQUALS_APPROVAL = false as const;
export const D7_ENGINEERING_DECISION_AUTHORITY_REQUIRED = true as const;
export const D7_ENGINEERING_DECISION_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D7_ENGINEERING_DECISION_AUTHORITY = false as const;
export const ADMIN_EQUALS_D7_ENGINEERING_DECISION_AUTHORITY = false as const;
export const D7_ELECTRICAL_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R7_EXPLICIT_DEPENDENCY_REQUIRED = true as const;
export const D7_R7_INFERRED_DEPENDENCY_ALLOWED = false as const;
export const D7_R7_SUPERSESSION_GOVERNANCE_IMPLEMENTED = true as const;
export const SUPERSEDED_D7_RECORD_DELETED = false as const;
export const D7_R7_REASSESSMENT_GOVERNANCE_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_DESIGN_INVALID = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_APPROVED = false as const;
export const D7_R7_EXPLICIT_DEPENDENT_STALENESS_SUPPORTED = true as const;
export const D7_R7_INFERRED_STALENESS_PROPAGATION_ALLOWED = false as const;
export const D7_R7_CHANGE_AUTO_REPOINTS_R1_IDENTITY = false as const;
export const D7_R7_CHANGE_AUTO_REWRITES_IDENTITY_HISTORY = false as const;
export const D7_R7_CHANGE_AUTO_RECONFIGURES_ELECTRICAL_SYSTEM = false as const;
export const D7_R7_CHANGE_AUTO_REPLACES_POWER_SOURCE = false as const;
export const D7_R7_CHANGE_AUTO_REWRITES_DISTRIBUTION_HIERARCHY = false as const;
export const D7_R7_CHANGE_AUTO_RECALCULATES_LOAD = false as const;
export const D7_R7_CHANGE_AUTO_RECALCULATES_DEMAND = false as const;
export const D7_R7_CHANGE_AUTO_RECALCULATES_DIVERSITY = false as const;
export const D7_R7_CHANGE_AUTO_REWRITES_ADOPTED_LOAD = false as const;
export const D7_R7_CHANGE_AUTO_RESELECTS_ELECTRICAL_EQUIPMENT = false as const;
export const D7_R7_CHANGE_AUTO_RESIZES_SOURCE = false as const;
export const D7_R7_CHANGE_AUTO_SIZES_FEEDER = false as const;
export const D7_R7_CHANGE_AUTO_SIZES_CABLE = false as const;
export const D7_R7_CHANGE_AUTO_RECALCULATES_AMPACITY = false as const;
export const D7_R7_CHANGE_AUTO_RECALCULATES_VOLTAGE_DROP = false as const;
export const D7_R7_CHANGE_AUTO_RESELECTS_BREAKER = false as const;
export const D7_R7_CHANGE_AUTO_RECALCULATES_R5_EVIDENCE = false as const;
export const D7_R7_CHANGE_AUTO_REVALIDATES_R5_EVIDENCE = false as const;
export const D7_R7_CHANGE_AUTO_REWRITES_EXTERNAL_EVIDENCE = false as const;
export const D7_R7_CHANGE_AUTO_RECALCULATES_PROTECTION_SETTING = false as const;
export const D7_R7_CHANGE_AUTO_PERFORMS_PROTECTION_COORDINATION = false as const;
export const D7_R7_CHANGE_AUTO_RESELECTS_PROTECTION_DEVICE = false as const;
export const D7_R7_CHANGE_AUTO_RECALCULATES_GROUNDING = false as const;
export const D7_R7_CHANGE_AUTO_REDESIGNS_GROUNDING = false as const;
export const D7_R7_CHANGE_AUTO_RECLASSIFIES_HAZARDOUS_AREA = false as const;
export const D7_R7_CHANGE_AUTO_RESELECTS_HAZARDOUS_AREA_EQUIPMENT = false as const;
export const D7_R7_CHANGE_AUTO_APPROVES_EQUIPMENT_SUITABILITY = false as const;
export const D7_CHANGE_AUTO_DETERMINES_CONFORMANCE = false as const;
export const D7_CHANGE_AUTO_CERTIFIES_ENGINEERING = false as const;
export const D7_ASSUMPTION_CHANGE_GOVERNED = true as const;
export const D7_ASSUMPTION_CHANGE_AUTO_RECALCULATES_ENGINEERING = false as const;
export const D7_ASSUMPTION_CHANGE_AUTO_INVALIDATES_ALL_DEPENDENTS = false as const;
export const D7_REQUIREMENT_CHANGE_GOVERNED = true as const;
export const D7_REQUIREMENT_CHANGE_AUTO_UPDATES_ENGINEERING = false as const;
export const D7_REQUIREMENT_CHANGE_AUTO_RECALCULATES_ENGINEERING = false as const;
export const D7_ENGINEERING_DECISION_SUPERSESSION_GOVERNED = true as const;
export const SUPERSEDED_D7_DECISION_DELETED = false as const;
export const SUPERSEDED_D7_DECISION_HISTORY_REPLACED = false as const;
export const STALE_D7_RECORD_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D7_RECORD_EXPOSED_AS_CURRENT = false as const;
export const D7_R7_HISTORY_PRESERVED = true as const;
export const D7_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D7_R7_MUTATION_ALLOWED = false as const;
export const D7_R7_SOURCE_BASIS_REQUIRED = true as const;
export const D7_R7_SOURCE_BASIS_TRACEABLE = true as const;
export const D7_R7_APPLICABILITY_EXPLICIT = true as const;
export const D7_R7_LIMITATIONS_EXPLICIT = true as const;
export const D7_R7_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D7_R7_PROVENANCE_REQUIRED = true as const;
export const D7_R7_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D7_R7_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D7_R7_ACCESS_ALLOWED = false as const;
export const AI_CAN_AUTO_ADOPT_D7_REQUIREMENT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_ASSUMPTION = AI_CAN_INVENT_AUTHORITATIVE_D7_ELECTRICAL_ASSUMPTION;
export const AI_CAN_CREATE_AUTHORITATIVE_D7_ENGINEERING_DECISION = false as const;
export const AI_CAN_CLOSE_D7_REASSESSMENT_AS_VALIDATED = false as const;
export const ADMIN_CAN_PROMOTE_D7_CHANGE_TO_ENGINEERING_APPROVAL = false as const;
export const D7_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R7_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D7_R7_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D7_R8_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_SOURCE_REQUIREMENT_AUTO_ADOPTION = false as const;
export const UNAUTHORIZED_ASSUMPTION_TO_FACT_PROMOTION = false as const;
export const UNAUTHORIZED_AI_DECISION_PROMOTION = false as const;
export const UNAUTHORIZED_INFERRED_DEPENDENCY = false as const;
export const UNAUTHORIZED_INFERRED_STALENESS_PROPAGATION = false as const;
export const UNAUTHORIZED_LOAD_RECALCULATION = false as const;
export const UNAUTHORIZED_LOAD_FLOW_RECALCULATION = false as const;
export const UNAUTHORIZED_CABLE_SIZING_RECALCULATION = false as const;
export const UNAUTHORIZED_PROTECTION_RECALCULATION = false as const;
export const UNAUTHORIZED_GROUNDING_RECALCULATION = false as const;
export const UNAUTHORIZED_HAZARDOUS_AREA_RECLASSIFICATION = false as const;
export const UNAUTHORIZED_ELECTRICAL_REDESIGN = false as const;
export const D7_R7_REQUIREMENT_ROLES = ["SOURCE_REQUIREMENT", "CANDIDATE_REQUIREMENT", "ADOPTED_ELECTRICAL_REQUIREMENT"] as const;
export const D7_R7_OPEN_REQUIREMENT_STATUSES = ["PLANNED", "REQUESTED", "AWAITING_INFORMATION", "RECEIVED", "NOT_APPLICABLE"] as const;
export const D7_R7_SOURCE_CLASSES = [
  "D6_PROCESS_REQUIREMENT",
  "D4_MECHANICAL_CONTEXT",
  "PROJECT_REQUIREMENT",
  "OWNER_REQUIREMENT",
  "VENDOR_MANUFACTURER_INFORMATION",
  "STANDARD_JURISDICTION_REFERENCE",
  "DESIGN_BASIS",
  "SUPPLIED_ENGINEERING_SOURCE",
] as const;
export const D7_R7_CHANGE_CATEGORIES = [
  "REQUIREMENT_CHANGED",
  "ASSUMPTION_CHANGED",
  "DECISION_SUPERSEDED",
  "R1_IDENTITY_CHANGED",
  "R2_CONTEXT_CHANGED",
  "R3_LOAD_CHANGED",
  "R4_FEEDER_CHANGED",
  "R5_EVIDENCE_CHANGED",
  "R6_PROTECTION_CHANGED",
  "R6_GROUNDING_CHANGED",
  "R6_HAZARDOUS_AREA_CHANGED",
  "REASSESSMENT_REQUIRED",
] as const;
export const D7_R7_DEPENDENCY_TARGETS = [
  "R1_IDENTITY",
  "R2_SYSTEM",
  "R2_SOURCE",
  "R2_DISTRIBUTION",
  "R3_LOAD",
  "R3_CONSUMER",
  "R3_SUPPLY",
  "R4_FEEDER",
  "R4_CABLE",
  "R4_RATING",
  "R5_EVIDENCE",
  "R6_DEVICE",
  "R6_SETTING",
  "R6_GROUNDING",
  "R6_HAZARDOUS_AREA",
  "R6_SUITABILITY",
  "R7_REQUIREMENT",
  "R7_ASSUMPTION",
  "R7_DECISION",
] as const;
export const D7_R7_REASSESSMENT_STATES = ["REASSESSMENT_REQUIRED", "REASSESSMENT_COMPLETED"] as const;
export const D7_R7_CURRENTNESS_MARKS = ["STALE", "REASSESSMENT_REQUIRED"] as const;
export const D7_R8_CANONICAL_PHASE = D7_IMPLEMENTATION_PHASES[7];
export const D7_R8_PHASE_TYPE = D7_IMPLEMENTATION_PHASE_TYPES[7];
export const D7_R8_CANONICAL_SCOPE =
  "Implement canonical Electrical discipline-interface and handoff governance using exact D7 R1-R7 revisions. Support explicit, exact-revision handoffs with D4 Mechanical, D6 Process, future D8 I&C and justified D1-D3/D5 contexts, while preserving counterpart authority. Handoff content must not become counterpart engineering truth, acceptance must not equal counterpart validation/approval, and no counterpart object may be silently mutated, recalculated, revalidated or auto-repointed. D8 runtime remains zero and D9 reasoning remains zero." as const;
export const D7_R8_STARTED = false as const;
export const D7_R7_READY_FOR_NEXT_PHASE = true as const;
export const D7_R7_NEXT_PHASE = D7_R8_CANONICAL_PHASE;
export const D7_R7_NEXT_PHASE_TYPE = D7_R8_PHASE_TYPE;
export const D7_R7_CANONICAL_NEXT_PHASE = D7_R8_CANONICAL_PHASE;
export const D7_R7_CANONICAL_NEXT_PHASE_SCOPE = D7_R8_CANONICAL_SCOPE;
export const D7_R7_BLOCKER = "NONE" as const;
export const D7_R7_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D7_R7_INFORMATION_MAY_APPROVE_ENGINEERING = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;

export {
  D7_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  PARALLEL_D7_REQUIREMENT_ENGINE_CREATED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_ELECTRICAL_REQUIREMENT,
  D6_PROCESS_REQUIREMENT_EQUALS_D7_ELECTRICAL_DESIGN,
  D6_POWER_LOAD_REQUIREMENT_EQUALS_VALIDATED_D7_LOAD,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D7_PROTECTION_OR_CONTROL_DESIGN,
  D7_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  PARALLEL_D7_ASSUMPTION_ENGINE_CREATED,
  ELECTRICAL_ASSUMPTION_EQUALS_VALIDATED_FACT,
  AI_CAN_INVENT_AUTHORITATIVE_D7_ELECTRICAL_ASSUMPTION,
  D7_REUSES_CANONICAL_DECISION_GOVERNANCE,
  PARALLEL_D7_DECISION_ENGINE_CREATED,
  AI_RECOMMENDATION_EQUALS_ELECTRICAL_ENGINEERING_DECISION,
  ADMIN_ACTION_EQUALS_ELECTRICAL_ENGINEERING_DECISION,
  D7_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  PARALLEL_D7_CHANGE_ENGINE_CREATED,
  D7_CHANGE_AUTO_RECALCULATES_ENGINEERING,
  D7_CHANGE_AUTO_REDESIGNS_ENGINEERING,
  D7_CHANGE_AUTO_REVALIDATES_ENGINEERING,
  D7_CHANGE_AUTO_APPROVES_ENGINEERING,
  MECHANICAL_EQUIPMENT_DUTY_EQUALS_ELECTRICAL_MOTOR_DESIGN,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D7_CABLE_SIZING_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_ARC_FLASH_CALCULATION_RUNTIME_COUNT,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_BATTERY_UPS_CALCULATION_RUNTIME_COUNT,
  D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_APPROVAL_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  D7_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
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
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  UNAUTHORIZED_APPROVAL_PROMOTION,
  UNAUTHORIZED_CERTIFICATION_PROMOTION,
  UNAUTHORIZED_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_VALIDATION_PROMOTION,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set(["inferred", "matching_name", "matching_tag", "same_system", "same_voltage", "topology", "topology_proximity", "same_source_document", "semantic_similarity", "ai_inference", "ai_reasoning", "drawing"]);
const BROAD = new Set(["all", "global", "every", "any"]);

type Stage = (typeof D7_MATURITY_STATES)[number];
type Currentness = (typeof D7_CURRENTNESS_STATES)[number];
type RequirementRole = (typeof D7_R7_REQUIREMENT_ROLES)[number];
type SourceClass = (typeof D7_R7_SOURCE_CLASSES)[number];
type ChangeCategory = (typeof D7_R7_CHANGE_CATEGORIES)[number];
type TargetKind = (typeof D7_R7_DEPENDENCY_TARGETS)[number];
type RelationKind = (typeof D7_EXPLICIT_RELATIONSHIP_KINDS)[number];

export type D7R7ExternalRevision = {
  requirementId?: string;
  recordId?: string;
  fingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
};

type Prohibited = {
  autoAdopt?: boolean;
  autoAdoptD6?: boolean;
  autoAdoptMechanical?: boolean;
  recalculateLoad?: boolean;
  recalculateDemand?: boolean;
  recalculateDiversity?: boolean;
  rewriteAdoptedLoad?: boolean;
  reselectEquipment?: boolean;
  resizeSource?: boolean;
  sizeFeeder?: boolean;
  sizeCable?: boolean;
  recalculateAmpacity?: boolean;
  recalculateVoltageDrop?: boolean;
  reselectBreaker?: boolean;
  recalculateEvidence?: boolean;
  revalidateEvidence?: boolean;
  rewriteEvidence?: boolean;
  recalculateProtection?: boolean;
  performCoordination?: boolean;
  reselectDevice?: boolean;
  recalculateGrounding?: boolean;
  redesignGrounding?: boolean;
  reclassifyHazardous?: boolean;
  reselectHazardousEquipment?: boolean;
  approveSuitability?: boolean;
  revalidateEngineering?: boolean;
  approveEngineering?: boolean;
  determineConformance?: boolean;
  certifyEngineering?: boolean;
  repointIdentity?: boolean;
  rewriteIdentityHistory?: boolean;
  reconfigureSystem?: boolean;
  replaceSource?: boolean;
  rewriteDistribution?: boolean;
  inferDependency?: boolean;
  inferStaleness?: boolean;
  invalidateAllDependents?: boolean;
  aiRecommendation?: boolean;
  adminDecision?: boolean;
  closeReassessmentAsValidated?: boolean;
  exposeStaleAsCurrent?: boolean;
  exposeSupersededAsCurrent?: boolean;
  assumptionAsFact?: boolean;
  requirementAsDesign?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
};

export type D7R7SubjectInput = Prohibited & {
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

type BoundSubject = {
  contextId: string;
  objectId: string;
  objectType: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: Stage;
  citedCurrentness: Currentness;
};

type GovernanceBase = BoundSubject & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  authority: typeof D7_CONTEXT_AUTHORITY;
  electricalEngineeringAuthority: false;
  engineeringValidated: false;
  approved: false;
  conformant: false;
  certified: false;
  deleted: false;
  recalculated: false;
  redesigned: false;
  fingerprint: string;
  predecessorId: string | null;
  predecessorFingerprint: string | null;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  recordedAt: string;
  recordedBy: string;
};

export type D7R7RequirementRecord = GovernanceBase & {
  requirementId: string;
  statement: string;
  requirementRole: RequirementRole;
  requirementCategory: (typeof INFORMATION_REQUIREMENT_TYPES)[number];
  requirementStatus: (typeof D7_R7_OPEN_REQUIREMENT_STATUSES)[number];
  sourceClass: SourceClass;
  sourceRef: string;
  sourceRevision: string;
  processRequirementId: string | null;
  processRequirementFingerprint: string | null;
  mechanicalRecordId: string | null;
  mechanicalRevisionFingerprint: string | null;
  adopted: boolean;
  adoptionRationale: string | null;
  sourceRequirementId: string | null;
  sourceRequirementFingerprint: string | null;
  designSatisfied: false;
};

export type D7R7AssumptionRecord = GovernanceBase & {
  assumptionId: string;
  statement: string;
  validationStatus: "unvalidated";
  materiality: string;
  validatedFact: false;
};

export type D7R7DecisionRecord = GovernanceBase & {
  decisionId: string;
  statement: string;
  alternatives: { id: string; statement: string; is_selected: boolean }[];
  authoritativeDecision: true;
  aiRecommendation: false;
  adminAction: false;
};

export type D7R7Dependency = {
  kind: RelationKind;
  targetKind: TargetKind;
  targetId: string;
  targetFingerprint: string;
};

export type D7R7ChangeRecord = GovernanceBase & {
  changeId: string;
  changeCategory: ChangeCategory;
  reason: string;
  dependencies: D7R7Dependency[];
};

export type D7R7ReassessmentRecord = GovernanceBase & {
  reassessmentId: string;
  changeId: string;
  targetId: string;
  targetFingerprint: string;
  state: (typeof D7_R7_REASSESSMENT_STATES)[number];
  validationFailed: false;
  designInvalid: false;
};

export type D7R7CurrentnessMark = GovernanceBase & {
  markId: string;
  changeId: string;
  targetKind: TargetKind;
  targetId: string;
  targetFingerprint: string;
  mark: (typeof D7_R7_CURRENTNESS_MARKS)[number];
  exposedAsCurrent: false;
};

export type D7R7History = {
  historyId: string;
  subjectKind: "REQUIREMENT" | "ASSUMPTION" | "DECISION" | "CHANGE" | "REASSESSMENT" | "CURRENTNESS";
  subjectId: string;
  fingerprint: string;
  action: "CREATED" | "SUPERSEDED";
  recordedAt: string;
};

export type D7R7Store = {
  r1: D7R1Store;
  r6: D7R6Store;
  process: { requirements: readonly D7R7ExternalRevision[] } | null;
  mechanical: { records: readonly D7R7ExternalRevision[] } | null;
  now: () => string;
  requirements: D7R7RequirementRecord[];
  assumptions: D7R7AssumptionRecord[];
  decisions: D7R7DecisionRecord[];
  changes: D7R7ChangeRecord[];
  reassessments: D7R7ReassessmentRecord[];
  currentnessMarks: D7R7CurrentnessMark[];
  history: D7R7History[];
};

type DependencyInput = {
  kind: string;
  targetKind: string;
  targetId: string;
  targetFingerprint: string;
  inferred?: boolean;
  inference?: string | null;
};

function fail(code: string): never {
  throw new Error(`D7_R7_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function assertActor(actor: D7R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_ELECTRICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_ELECTRICAL_AUTHORITY");
  if (actor.authority === "ELECTRICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_ELECTRICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D7_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertScope(actor: D7R1Actor, input: D7R7SubjectInput): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.autoAdopt === true || input.autoAdoptD6 === true || input.autoAdoptMechanical === true) fail("AUTO_ADOPTION_REJECTED");
  if (input.recalculateLoad === true || input.recalculateDemand === true || input.recalculateDiversity === true || input.rewriteAdoptedLoad === true) fail("LOAD_RECALCULATION_REJECTED");
  if (input.reselectEquipment === true || input.resizeSource === true) fail("EQUIPMENT_RESELECTION_REJECTED");
  if (input.sizeFeeder === true || input.sizeCable === true || input.recalculateAmpacity === true || input.recalculateVoltageDrop === true || input.reselectBreaker === true) fail("CABLE_RECALCULATION_REJECTED");
  if (input.recalculateEvidence === true || input.revalidateEvidence === true || input.rewriteEvidence === true) fail("EVIDENCE_RECALCULATION_REJECTED");
  if (input.recalculateProtection === true || input.performCoordination === true || input.reselectDevice === true) fail("PROTECTION_RECALCULATION_REJECTED");
  if (input.recalculateGrounding === true || input.redesignGrounding === true) fail("GROUNDING_RECALCULATION_REJECTED");
  if (input.reclassifyHazardous === true || input.reselectHazardousEquipment === true || input.approveSuitability === true) fail("HAZARDOUS_AREA_RECLASSIFICATION_REJECTED");
  if (input.revalidateEngineering === true) fail("REVALIDATION_REJECTED");
  if (input.approveEngineering === true) fail("APPROVAL_REJECTED");
  if (input.determineConformance === true) fail("CONFORMANCE_REJECTED");
  if (input.certifyEngineering === true) fail("CERTIFICATION_REJECTED");
  if (input.repointIdentity === true || input.rewriteIdentityHistory === true) fail("IDENTITY_REWRITE_REJECTED");
  if (input.reconfigureSystem === true || input.replaceSource === true || input.rewriteDistribution === true) fail("TOPOLOGY_REDESIGN_REJECTED");
  if (input.inferDependency === true) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.inferStaleness === true || input.invalidateAllDependents === true) fail("INFERRED_STALENESS_REJECTED");
  if (input.aiRecommendation === true) fail("AI_DECISION_REJECTED");
  if (input.adminDecision === true) fail("ADMIN_DECISION_REJECTED");
  if (input.closeReassessmentAsValidated === true) fail("REASSESSMENT_NOT_VALIDATION");
  if (input.exposeStaleAsCurrent === true) fail("STALE_NOT_CURRENT");
  if (input.exposeSupersededAsCurrent === true) fail("SUPERSEDED_NOT_CURRENT");
  if (input.assumptionAsFact === true) fail("ASSUMPTION_NOT_FACT");
  if (input.requirementAsDesign === true) fail("REQUIREMENT_NOT_DESIGN");
  if (input.mutateR1 === true || input.mutateR2 === true || input.mutateR3 === true || input.mutateR4 === true || input.mutateR5 === true || input.mutateR6 === true) fail("UPSTREAM_MUTATION_REJECTED");
}

function requireSubject(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput): BoundSubject {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const stage = input.citedLifecycleStage.trim();
  if (!(D7_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === objectId);
  if (!object || !(D7_ELECTRICAL_OBJECT_TYPES as readonly string[]).includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision || object.contextId !== context.contextId) fail("R1_REVISION_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  explicit(input.limitations, "LIMITATIONS_REQUIRED");
  explicit(input.provenanceRef, "MISSING_PROVENANCE");
  explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  return { contextId, objectId: object.objectId, objectType: object.objectType, objectRevisionFingerprint: object.fingerprint, citedLifecycleStage: stage as Stage, citedCurrentness: cited as Currentness };
}

function upstreamSeal(store: D7R7Store): string {
  const r2 = store.r6.r5.r4.r2;
  const r3 = store.r6.r5.r4.r3;
  const r4 = store.r6.r5.r4;
  const r5 = store.r6.r5;
  return JSON.stringify({
    objects: store.r1.objects.map((row) => [row.objectId, row.fingerprint, row.recordStatus]),
    systems: r2.systems.map((row) => [row.systemRecordId, row.fingerprint, row.recordStatus]),
    sources: r2.sources.map((row) => [row.sourceRecordId, row.fingerprint, row.recordStatus]),
    distributions: r2.distributions.map((row) => [row.distributionRecordId, row.fingerprint, row.recordStatus]),
    loads: r3.loads.map((row) => [row.loadRecordId, row.fingerprint, row.recordStatus, row.suppliedValue, row.adopted]),
    feeders: r4.feeders.map((row) => [row.feederRecordId, row.fingerprint, row.recordStatus, row.protectionCoordination]),
    cables: r4.cables.map((row) => [row.cableRecordId, row.fingerprint, row.recordStatus, row.suppliedSizeAttribute]),
    evidence: r5.evidence.map((row) => [row.evidenceId, row.fingerprint, row.recordStatus, row.results.map((item) => item.value).join("|")]),
    settings: store.r6.settings.map((row) => [row.settingRecordId, row.fingerprint, row.recordStatus, row.suppliedValue, row.adopted]),
    grounding: store.r6.grounding.map((row) => [row.groundingRecordId, row.fingerprint, row.recordStatus, row.suppliedResistanceValue]),
    areas: store.r6.hazardousAreas.map((row) => [row.areaRecordId, row.fingerprint, row.recordStatus, row.zoneOrDivision]),
    suitability: store.r6.suitability.map((row) => [row.suitabilityRecordId, row.fingerprint, row.recordStatus, row.validatedSelection]),
  });
}

function finish<T extends { fingerprint: string }>(store: D7R7Store, before: string, record: T, asserted: string | undefined): T {
  if (asserted != null && asserted !== record.fingerprint) fail("FINGERPRINT_MISMATCH");
  if (upstreamSeal(store) !== before) fail("UPSTREAM_MUTATION_REJECTED");
  return record;
}

function baseFields(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput, bound: BoundSubject, fingerprint: string, predecessorId: string | null, predecessorFingerprint: string | null): GovernanceBase {
  return {
    ...bound,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    applicability: explicit(input.applicability, "APPLICABILITY_REQUIRED"),
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    authority: D7_CONTEXT_AUTHORITY,
    electricalEngineeringAuthority: false,
    engineeringValidated: false,
    approved: false,
    conformant: false,
    certified: false,
    deleted: false,
    recalculated: false,
    redesigned: false,
    fingerprint,
    predecessorId,
    predecessorFingerprint,
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    recordedAt: store.now(),
    recordedBy: actor.actorId,
  };
}

function remember(store: D7R7Store, subjectKind: D7R7History["subjectKind"], subjectId: string, fingerprint: string, action: D7R7History["action"]) {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, fingerprint, action, recordedAt: store.now() });
}

function externalRevision(rows: readonly D7R7ExternalRevision[], id: string, fingerprint: string, actor: D7R1Actor, code: string): { id: string; fingerprint: string } {
  const token = explicit(id, code);
  const revision = explicit(fingerprint, code);
  const row = rows.find((item) => (item.requirementId ?? item.recordId) === token);
  if (!row || row.fingerprint !== revision || row.recordStatus !== "CURRENT") fail(code);
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  return { id: token, fingerprint: revision };
}

function dependencyExists(store: D7R7Store, targetKind: string, targetId: string, targetFingerprint: string, tenantId: string): boolean {
  const match = (id: string, fingerprint: string, rowTenant: string, status: string) => id === targetId && fingerprint === targetFingerprint && rowTenant === tenantId && status === "CURRENT";
  const r2 = store.r6.r5.r4.r2;
  const r3 = store.r6.r5.r4.r3;
  const r4 = store.r6.r5.r4;
  if (targetKind === "R1_IDENTITY") return store.r1.objects.some((row) => match(row.objectId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R2_SYSTEM") return r2.systems.some((row) => match(row.systemRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R2_SOURCE") return r2.sources.some((row) => match(row.sourceRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R2_DISTRIBUTION") return r2.distributions.some((row) => match(row.distributionRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R3_LOAD") return r3.loads.some((row) => match(row.loadRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R3_CONSUMER") return r3.consumers.some((row) => match(row.consumerRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R3_SUPPLY") return r3.supplies.some((row) => match(row.supplyRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R4_FEEDER") return r4.feeders.some((row) => match(row.feederRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R4_CABLE") return r4.cables.some((row) => match(row.cableRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R4_RATING") return r4.ratings.some((row) => match(row.ratingRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R5_EVIDENCE") return store.r6.r5.evidence.some((row) => match(row.evidenceId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R6_DEVICE") return store.r6.devices.some((row) => match(row.deviceRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R6_SETTING") return store.r6.settings.some((row) => match(row.settingRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R6_GROUNDING") return store.r6.grounding.some((row) => match(row.groundingRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R6_HAZARDOUS_AREA") return store.r6.hazardousAreas.some((row) => match(row.areaRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R6_SUITABILITY") return store.r6.suitability.some((row) => match(row.suitabilityRecordId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R7_REQUIREMENT") return store.requirements.some((row) => match(row.requirementId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R7_ASSUMPTION") return store.assumptions.some((row) => match(row.assumptionId, row.fingerprint, row.tenantId, row.recordStatus));
  if (targetKind === "R7_DECISION") return store.decisions.some((row) => match(row.decisionId, row.fingerprint, row.tenantId, row.recordStatus));
  return false;
}

function resolveDependency(store: D7R7Store, actor: D7R1Actor, link: DependencyInput): D7R7Dependency {
  if (link.inferred === true || (link.inference != null && link.inference.trim() !== "")) fail("INFERRED_DEPENDENCY_REJECTED");
  const kindToken = link.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_DEPENDENCY_REJECTED");
  if (!(D7_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(kindToken)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
  const targetKind = explicit(link.targetKind, "DEPENDENCY_TARGET_REQUIRED");
  if (!(D7_R7_DEPENDENCY_TARGETS as readonly string[]).includes(targetKind)) fail("DEPENDENCY_TARGET_INVALID");
  const targetId = explicit(link.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(link.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  if (!dependencyExists(store, targetKind, targetId, targetFingerprint, actor.tenantId)) fail("DEPENDENCY_REVISION_MISMATCH");
  return { kind: kindToken as RelationKind, targetKind: targetKind as TargetKind, targetId, targetFingerprint };
}

export function createD7R7Store(
  r1: D7R1Store,
  r6: D7R6Store,
  sources: { process?: { requirements: readonly D7R7ExternalRevision[] } | null; mechanical?: { records: readonly D7R7ExternalRevision[] } | null } = {},
  now: () => string = () => "2026-10-25T00:00:00.000Z",
): D7R7Store {
  if (R6_RUNTIME_COUNT !== 6) fail("R6_RUNTIME_COUNT_UNEXPECTED");
  if (r6.r5.r1 !== r1 || r6.r5.r4.r1 !== r1 || r6.r5.r4.r2.r1 !== r1 || r6.r5.r4.r3.r1 !== r1 || r6.r5.r4.r3.r2 !== r6.r5.r4.r2) fail("R1_R6_STORE_MISMATCH");
  return { r1, r6, process: sources.process ?? null, mechanical: sources.mechanical ?? null, now, requirements: [], assumptions: [], decisions: [], changes: [], reassessments: [], currentnessMarks: [], history: [] };
}

function commitRequirement(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput & {
  requirementId: string;
  statement: string;
  requirementRole: string;
  requirementCategory: string;
  sourceClass: string;
  sourceRef: string;
  sourceRevision: string;
  requirementStatus?: string;
  adoptionRationale?: string | null;
  sourceRequirementId?: string | null;
  processRequirementId?: string | null;
  processRequirementFingerprint?: string | null;
  mechanicalRecordId?: string | null;
  mechanicalRevisionFingerprint?: string | null;
  predecessorRequirementId?: string | null;
}, adopted: boolean): D7R7RequirementRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const requestedStatus = input.requirementStatus ?? "PLANNED";
  if (!(INFORMATION_REQUIREMENT_STATUSES as readonly string[]).includes(requestedStatus)) fail("REQUIREMENT_STATUS_INVALID");
  if (!(D7_R7_OPEN_REQUIREMENT_STATUSES as readonly string[]).includes(requestedStatus)) fail("REQUIREMENT_ACCEPTANCE_NOT_IN_R7");
  const statement = explicit(input.statement, "REQUIREMENT_STATEMENT_REQUIRED");
  const requirementCategory = explicit(input.requirementCategory, "REQUIREMENT_CATEGORY_REQUIRED");
  if (!(INFORMATION_REQUIREMENT_TYPES as readonly string[]).includes(requirementCategory)) fail("REQUIREMENT_CATEGORY_INVALID");
  const sourceClass = explicit(input.sourceClass, "SOURCE_BASIS_REQUIRED");
  if (!(D7_R7_SOURCE_CLASSES as readonly string[]).includes(sourceClass)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  const requirementRole = explicit(input.requirementRole, "REQUIREMENT_ROLE_REQUIRED");
  if (adopted && requirementRole !== "ADOPTED_ELECTRICAL_REQUIREMENT") fail("ADOPTION_REQUIRED");
  if (!adopted && requirementRole === "ADOPTED_ELECTRICAL_REQUIREMENT") fail("SOURCE_NOT_ADOPTED");
  if (!adopted && !(requirementRole === "SOURCE_REQUIREMENT" || requirementRole === "CANDIDATE_REQUIREMENT")) fail("REQUIREMENT_ROLE_INVALID");
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const hasProcess = (input.processRequirementId != null && input.processRequirementId.trim() !== "") || (input.processRequirementFingerprint != null && input.processRequirementFingerprint.trim() !== "");
  const hasMechanical = (input.mechanicalRecordId != null && input.mechanicalRecordId.trim() !== "") || (input.mechanicalRevisionFingerprint != null && input.mechanicalRevisionFingerprint.trim() !== "");
  if (sourceClass === "D6_PROCESS_REQUIREMENT" && !hasProcess) fail("D6_REVISION_REQUIRED");
  if (sourceClass !== "D6_PROCESS_REQUIREMENT" && hasProcess) fail("D6_REFERENCE_NOT_EXPLICIT");
  if (sourceClass === "D4_MECHANICAL_CONTEXT" && !hasMechanical) fail("D4_REVISION_REQUIRED");
  if (sourceClass !== "D4_MECHANICAL_CONTEXT" && hasMechanical) fail("D4_REFERENCE_NOT_EXPLICIT");
  const process = hasProcess ? externalRevision(store.process?.requirements ?? [], input.processRequirementId ?? "", input.processRequirementFingerprint ?? "", actor, "D6_REVISION_MISMATCH") : null;
  const mechanical = hasMechanical ? externalRevision(store.mechanical?.records ?? [], input.mechanicalRecordId ?? "", input.mechanicalRevisionFingerprint ?? "", actor, "D4_REVISION_MISMATCH") : null;
  if (hasProcess && !store.process) fail("D6_REVISION_MISMATCH");
  if (hasMechanical && !store.mechanical) fail("D4_REVISION_MISMATCH");
  const rationale = input.adoptionRationale && input.adoptionRationale.trim() ? explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED") : null;
  if (adopted && !rationale) fail("ADOPTION_RATIONALE_REQUIRED");
  if (!adopted && rationale) fail("SOURCE_NOT_ADOPTED");
  let sourceRequirementId: string | null = null;
  let sourceRequirementFingerprint: string | null = null;
  if (adopted) {
    sourceRequirementId = explicit(input.sourceRequirementId ?? "", "SOURCE_REQUIREMENT_REQUIRED");
    const source = store.requirements.find((row) => row.requirementId === sourceRequirementId);
    if (!source || source.adopted || source.recordStatus !== "CURRENT" || source.tenantId !== actor.tenantId) fail("SOURCE_REQUIREMENT_NOT_CURRENT");
    if (source.statement !== statement || source.objectId !== bound.objectId || source.sourceRevision !== sourceRevision) fail("ADOPTION_RESTATEMENT_MISMATCH");
    sourceRequirementFingerprint = source.fingerprint;
  }
  const requirementId = explicit(input.requirementId, "REQUIREMENT_REQUIRED");
  const predecessor = input.predecessorRequirementId ? store.requirements.find((row) => row.requirementId === input.predecessorRequirementId) ?? null : null;
  if (input.predecessorRequirementId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT" || predecessor.adopted !== adopted)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    requirementId, ...bound, statement, requirementRole, requirementCategory, sourceClass, sourceRef, sourceRevision, requestedStatus, adopted, rationale,
    processRequirementId: process?.id ?? null, mechanicalRecordId: mechanical?.id ?? null, sourceRequirementId, applicability: input.applicability, limitations: input.limitations,
  });
  const existing = store.requirements.find((row) => row.requirementId === requirementId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_REQUIREMENT_REJECTED");
  if (store.requirements.some((row) => row.recordStatus === "CURRENT" && row.requirementId !== predecessor?.requirementId && row.objectId === bound.objectId && row.statement === statement && row.sourceRevision === sourceRevision && row.adopted === adopted)) fail("DUPLICATE_REQUIREMENT_REJECTED");
  if (predecessor) {
    const prior = predecessor.objectRevisionFingerprint;
    const index = store.requirements.findIndex((row) => row.requirementId === predecessor.requirementId);
    store.requirements[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.requirements[index]?.objectRevisionFingerprint !== prior) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "REQUIREMENT", predecessor.requirementId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D7R7RequirementRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.requirementId ?? null, predecessor?.fingerprint ?? null),
    requirementId, statement, requirementRole: requirementRole as RequirementRole,
    requirementCategory: requirementCategory as D7R7RequirementRecord["requirementCategory"],
    requirementStatus: requestedStatus as D7R7RequirementRecord["requirementStatus"],
    sourceClass: sourceClass as SourceClass, sourceRef, sourceRevision,
    processRequirementId: process?.id ?? null, processRequirementFingerprint: process?.fingerprint ?? null,
    mechanicalRecordId: mechanical?.id ?? null, mechanicalRevisionFingerprint: mechanical?.fingerprint ?? null,
    adopted, adoptionRationale: rationale, sourceRequirementId, sourceRequirementFingerprint, designSatisfied: false,
  };
  store.requirements.push(record);
  remember(store, "REQUIREMENT", requirementId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordElectricalSourceRequirement(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput & {
  requirementId: string; statement: string; requirementRole: string; requirementCategory: string; sourceClass: string; sourceRef: string; sourceRevision: string;
  requirementStatus?: string; processRequirementId?: string | null; processRequirementFingerprint?: string | null; mechanicalRecordId?: string | null; mechanicalRevisionFingerprint?: string | null; predecessorRequirementId?: string | null;
}): D7R7RequirementRecord {
  return commitRequirement(store, actor, input, false);
}

export function recordAdoptedElectricalRequirement(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput & {
  requirementId: string; statement: string; requirementCategory: string; sourceClass: string; sourceRef: string; sourceRevision: string; sourceRequirementId: string;
  requirementStatus?: string; adoptionRationale?: string | null; processRequirementId?: string | null; processRequirementFingerprint?: string | null; mechanicalRecordId?: string | null; mechanicalRevisionFingerprint?: string | null; predecessorRequirementId?: string | null;
}): D7R7RequirementRecord {
  return commitRequirement(store, actor, { ...input, requirementRole: "ADOPTED_ELECTRICAL_REQUIREMENT" }, true);
}

export function recordElectricalAssumption(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput & {
  assumptionId: string; statement: string; validationStatus?: string; materiality?: string; predecessorAssumptionId?: string | null;
}): D7R7AssumptionRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const validationStatus = input.validationStatus ?? "unvalidated";
  assertAssumptionValidationStatus(validationStatus);
  if (validationStatus !== "unvalidated") fail("ASSUMPTION_NOT_VALIDATED_FACT");
  const materiality = input.materiality ?? "medium";
  assertAssumptionMateriality(materiality);
  const statement = explicit(input.statement, "ASSUMPTION_STATEMENT_REQUIRED");
  const assumptionId = explicit(input.assumptionId, "ASSUMPTION_REQUIRED");
  const predecessor = input.predecessorAssumptionId ? store.assumptions.find((row) => row.assumptionId === input.predecessorAssumptionId) ?? null : null;
  if (input.predecessorAssumptionId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ assumptionId, ...bound, statement, validationStatus, materiality, predecessor: predecessor?.assumptionId ?? null });
  const existing = store.assumptions.find((row) => row.assumptionId === assumptionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_ASSUMPTION_REJECTED");
  if (store.assumptions.some((row) => row.recordStatus === "CURRENT" && row.assumptionId !== predecessor?.assumptionId && row.objectId === bound.objectId && row.statement === statement)) fail("DUPLICATE_ASSUMPTION_REJECTED");
  if (predecessor) {
    const prior = predecessor.objectRevisionFingerprint;
    const index = store.assumptions.findIndex((row) => row.assumptionId === predecessor.assumptionId);
    store.assumptions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.assumptions[index]?.objectRevisionFingerprint !== prior) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "ASSUMPTION", predecessor.assumptionId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D7R7AssumptionRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.assumptionId ?? null, predecessor?.fingerprint ?? null),
    assumptionId, statement, validationStatus: "unvalidated", materiality, validatedFact: false,
  };
  store.assumptions.push(record);
  remember(store, "ASSUMPTION", assumptionId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordElectricalEngineeringDecision(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput & {
  decisionId: string; statement: string; alternatives: { id: string; statement: string; is_selected?: boolean }[]; predecessorDecisionId?: string | null;
}): D7R7DecisionRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const alternatives = (input.alternatives ?? []).map((row) => ({
    id: explicit(row.id, "ALTERNATIVE_REQUIRED"),
    statement: explicit(row.statement, "ALTERNATIVE_REQUIRED"),
    is_selected: row.is_selected === true,
  }));
  if (alternatives.length === 0) fail("ALTERNATIVE_REQUIRED");
  assertSingleSelectedAlternative(alternatives);
  const statement = explicit(input.statement, "DECISION_STATEMENT_REQUIRED");
  const decisionId = explicit(input.decisionId, "DECISION_REQUIRED");
  const predecessor = input.predecessorDecisionId ? store.decisions.find((row) => row.decisionId === input.predecessorDecisionId) ?? null : null;
  if (input.predecessorDecisionId) {
    if (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    assertSupersessionPair({
      decisionId, supersedesDecisionId: predecessor.decisionId, tenantId: actor.tenantId, workspaceId: actor.workspaceId,
      prior: { id: predecessor.decisionId, tenant_id: predecessor.tenantId, workspace_id: predecessor.workspaceId },
    });
  }
  const fingerprint = fingerprintCanonical({ decisionId, ...bound, statement, alternatives, predecessor: predecessor?.decisionId ?? null });
  const existing = store.decisions.find((row) => row.decisionId === decisionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_DECISION_REJECTED");
  if (store.decisions.some((row) => row.recordStatus === "CURRENT" && row.decisionId !== predecessor?.decisionId && row.objectId === bound.objectId && row.statement === statement)) fail("DUPLICATE_DECISION_REJECTED");
  const priorHistory = predecessor ? store.history.filter((row) => row.subjectId === predecessor.decisionId).map((row) => row.fingerprint) : [];
  if (predecessor) {
    const priorRevision = predecessor.objectRevisionFingerprint;
    const index = store.decisions.findIndex((row) => row.decisionId === predecessor.decisionId);
    store.decisions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.decisions[index]?.objectRevisionFingerprint !== priorRevision) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, "DECISION", predecessor.decisionId, predecessor.fingerprint, "SUPERSEDED");
  }
  if (predecessor && !priorHistory.every((item, index) => store.history.filter((row) => row.subjectId === predecessor.decisionId)[index]?.fingerprint === item)) fail("HISTORY_REPLACED");
  const record: D7R7DecisionRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.decisionId ?? null, predecessor?.fingerprint ?? null),
    decisionId, statement, alternatives, authoritativeDecision: true, aiRecommendation: false, adminAction: false,
  };
  store.decisions.push(record);
  remember(store, "DECISION", decisionId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordElectricalChange(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput & {
  changeId: string; changeCategory: string; reason: string; dependencies: DependencyInput[]; predecessorChangeId?: string | null;
}): D7R7ChangeRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const changeCategory = explicit(input.changeCategory, "CHANGE_CATEGORY_REQUIRED");
  if (!(D7_R7_CHANGE_CATEGORIES as readonly string[]).includes(changeCategory)) fail("CHANGE_CATEGORY_INVALID");
  if (!input.dependencies || input.dependencies.length === 0) fail("EXPLICIT_DEPENDENCY_REQUIRED");
  const dependencies = input.dependencies.map((link) => resolveDependency(store, actor, link));
  const reason = explicit(input.reason, "CHANGE_REASON_REQUIRED");
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const predecessor = input.predecessorChangeId ? store.changes.find((row) => row.changeId === input.predecessorChangeId) ?? null : null;
  if (input.predecessorChangeId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ changeId, ...bound, changeCategory, reason, dependencies, predecessor: predecessor?.changeId ?? null });
  const existing = store.changes.find((row) => row.changeId === changeId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_CHANGE_REJECTED");
  if (store.changes.some((row) => row.recordStatus === "CURRENT" && row.changeId !== predecessor?.changeId && row.objectId === bound.objectId && row.changeCategory === changeCategory && row.reason === reason)) fail("DUPLICATE_CHANGE_REJECTED");
  if (predecessor) {
    const index = store.changes.findIndex((row) => row.changeId === predecessor.changeId);
    store.changes[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "CHANGE", predecessor.changeId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D7R7ChangeRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.changeId ?? null, predecessor?.fingerprint ?? null),
    changeId, changeCategory: changeCategory as ChangeCategory, reason, dependencies,
  };
  store.changes.push(record);
  remember(store, "CHANGE", changeId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordElectricalReassessment(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput & {
  reassessmentId: string; changeId: string; targetId: string; targetFingerprint: string; state: string;
}): D7R7ReassessmentRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const change = store.changes.find((row) => row.changeId === changeId && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!change || change.objectId !== bound.objectId) fail("CHANGE_NOT_FOUND");
  const targetId = explicit(input.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(input.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  if (!change.dependencies.some((link) => link.targetId === targetId && link.targetFingerprint === targetFingerprint)) fail("DEPENDENCY_REVISION_MISMATCH");
  if (!(D7_R7_REASSESSMENT_STATES as readonly string[]).includes(input.state)) fail("REASSESSMENT_STATE_INVALID");
  const state = input.state as D7R7ReassessmentRecord["state"];
  const reassessmentId = explicit(input.reassessmentId, "REASSESSMENT_REQUIRED_ID");
  const fingerprint = fingerprintCanonical({ reassessmentId, changeId, targetId, targetFingerprint, state, ...bound });
  const existing = store.reassessments.find((row) => row.reassessmentId === reassessmentId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_REASSESSMENT_REJECTED");
  if (store.reassessments.some((row) => row.recordStatus === "CURRENT" && row.changeId === changeId && row.targetId === targetId && row.state === state)) fail("DUPLICATE_REASSESSMENT_REJECTED");
  const record: D7R7ReassessmentRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, null, null),
    reassessmentId, changeId, targetId, targetFingerprint, state, validationFailed: false, designInvalid: false,
  };
  store.reassessments.push(record);
  remember(store, "REASSESSMENT", reassessmentId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function markElectricalDependentCurrentness(store: D7R7Store, actor: D7R1Actor, input: D7R7SubjectInput & {
  markId: string; changeId: string; targetKind: string; targetId: string; targetFingerprint: string; mark: string;
}): D7R7CurrentnessMark {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const change = store.changes.find((row) => row.changeId === changeId && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!change || change.objectId !== bound.objectId) fail("CHANGE_NOT_FOUND");
  const targetKind = explicit(input.targetKind, "DEPENDENCY_TARGET_REQUIRED");
  const targetId = explicit(input.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(input.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  const link = change.dependencies.find((row) => row.targetKind === targetKind && row.targetId === targetId && row.targetFingerprint === targetFingerprint);
  if (!link) fail("DEPENDENCY_REVISION_MISMATCH");
  if (!(D7_R7_CURRENTNESS_MARKS as readonly string[]).includes(input.mark)) fail("CURRENTNESS_MARK_INVALID");
  const mark = input.mark as D7R7CurrentnessMark["mark"];
  const markId = explicit(input.markId, "CURRENTNESS_MARK_REQUIRED");
  const fingerprint = fingerprintCanonical({ markId, changeId, targetKind, targetId, targetFingerprint, mark, ...bound });
  const existing = store.currentnessMarks.find((row) => row.markId === markId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_CURRENTNESS_MARK_REJECTED");
  const record: D7R7CurrentnessMark = {
    ...baseFields(store, actor, input, bound, fingerprint, null, null),
    markId, changeId, targetKind: link.targetKind, targetId, targetFingerprint, mark, exposedAsCurrent: false,
  };
  store.currentnessMarks.push(record);
  remember(store, "CURRENTNESS", markId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recalculateElectricalFromChange(): never {
  return fail("LOAD_RECALCULATION_REJECTED");
}
export function redesignElectricalFromChange(): never {
  return fail("TOPOLOGY_REDESIGN_REJECTED");
}
export function revalidateElectricalFromChange(): never {
  return fail("REVALIDATION_REJECTED");
}
export function inferElectricalChangeDependency(): never {
  return fail("INFERRED_DEPENDENCY_REJECTED");
}
export function closeElectricalReassessmentAsValidated(): never {
  return fail("REASSESSMENT_NOT_VALIDATION");
}
