/**
 * EOS-D7-R3 Electrical load, consumer, and equipment-supply context.
 * One bounded runtime on exact R1 identities and exact R2 revisions. Supplied context only.
 */
import {
  D7_CURRENTNESS_STATES,
  D7_IMPLEMENTATION_PHASE_TYPES,
  D7_IMPLEMENTATION_PHASES,
  D7_MATURITY_STATES,
  SOURCE_LOAD_REQUIREMENT_EQUALS_ADOPTED_ELECTRICAL_LOAD,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D7_CONTEXT_AUTHORITY,
  D7_DISCIPLINE,
  D7_IDENTITY_RUNTIME_READY as R1_IDENTITY_READY,
  ELECTRICAL_CONSUMER_CONTEXT_EQUALS_VALIDATED_EQUIPMENT_SELECTION,
  ELECTRICAL_LOAD_CONTEXT_EQUALS_VALIDATED_LOAD_CALCULATION,
  type D7R1Actor,
  type D7R1ObjectRecord,
  type D7R1Store,
} from "./identity-foundation";
import {
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
  D6_POWER_LOAD_REQUIREMENT_EQUALS_VALIDATED_D7_LOAD,
  D6_PROCESS_REQUIREMENT_EQUALS_D7_ELECTRICAL_DESIGN,
  D6_REOPENED,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D7_PROTECTION_OR_CONTROL_DESIGN,
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
  D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_FEEDER_CABLE_RATING_RUNTIME_COUNT,
  D7_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_IDENTITY_RUNTIME_COUNT,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_COUNT as R2_SYSTEM_COUNT,
  D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_READY,
  D7_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  MECHANICAL_EQUIPMENT_DUTY_EQUALS_ELECTRICAL_MOTOR_DESIGN,
  MECHANICAL_EQUIPMENT_SELECTION_EQUALS_VALIDATED_ELECTRICAL_SUPPLY_DESIGN,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  type D7R2DistributionRecord,
  type D7R2SourceRecord,
  type D7R2Store,
  type D7R2SystemRecord,
} from "./system-source-distribution-context";

export const D7_R3_STATUS = "LOAD_CONSUMER_AND_EQUIPMENT_CONTEXT_IMPLEMENTED" as const;
export const D7_R3_MATURITY = D7_R3_STATUS;
export const D7_R3_MATURITY_STATE = D7_R3_STATUS;
export const D7_R3_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D7_R3_LOAD_CONSUMER_AND_EQUIPMENT_CONTEXT_CLOSEOUT.md" as const;
export const D7_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const D7_R2_SYSTEM_SOURCE_DISTRIBUTION_CONTEXT_REUSED = D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_READY;
export const D7_R2_RUNTIME_COUNT = R2_RUNTIME_COUNT;
export const D7_R2_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_COUNT = R2_SYSTEM_COUNT;
export const EXACT_D7_R1_R2_REFERENCE_REQUIRED = true as const;
export const FLOATING_D7_R3_SOURCE_REFERENCE_ALLOWED = false as const;
export const D7_R3_SOURCE_AUTO_REPOINTED = false as const;
export const D7_RUNTIME_STARTED = true as const;
export const D7_RUNTIME_COUNT = 3 as const;
export const D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_IMPLEMENTED = true as const;
export const D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT = 1 as const;
export const D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_READY = true as const;
export const D7_CANONICAL_OBJECT_TAXONOMY_REUSED = true as const;
export const D7_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED = true as const;
export const D7_ELECTRICAL_LOAD_CONTEXT_IMPLEMENTED = true as const;
export const ELECTRICAL_LOAD_CONTEXT_EQUALS_LOAD_FLOW_RESULT = false as const;
export const ELECTRICAL_LOAD_CONTEXT_EQUALS_VALIDATED_ELECTRICAL_DESIGN = false as const;
export const D7_SUPPLIED_LOAD_REQUIREMENT_SUPPORTED = true as const;
export const D7_ADOPTED_ELECTRICAL_LOAD_SUPPORTED = true as const;
export const SUPPLIED_LOAD_AUTO_ADOPTED = false as const;
export const D7_R3_CALCULATES_CONNECTED_LOAD = false as const;
export const D7_R3_CALCULATES_DEMAND_LOAD = false as const;
export const D7_R3_CALCULATES_DIVERSIFIED_LOAD = false as const;
export const D7_R3_CALCULATES_MAXIMUM_DEMAND = false as const;
export const D7_R3_DERIVES_MISSING_LOAD = false as const;
export const D7_R3_HIDDEN_LOAD_CALCULATION_ALLOWED = false as const;
export const D7_R3_UNITS_REQUIRED = true as const;
export const D7_R3_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D7_R3_UNITS = false as const;
export const D7_ELECTRICAL_CONSUMER_CONTEXT_IMPLEMENTED = true as const;
export const ELECTRICAL_CONSUMER_CONTEXT_EQUALS_FEEDER_DESIGN = false as const;
export const D7_EXPLICIT_CONSUMER_RELATIONSHIP_REQUIRED = true as const;
export const D7_INFERRED_CONSUMER_RELATIONSHIP_ALLOWED = false as const;
export const EXACT_D7_R3_CONSUMER_RELATIONSHIP_ENDPOINT_REVISION_REQUIRED = true as const;
export const D7_R3_CONSUMER_RELATIONSHIP_AUTO_REPOINTED = false as const;
export const D7_ELECTRICAL_EQUIPMENT_SUPPLY_CONTEXT_IMPLEMENTED = true as const;
export const ELECTRICAL_EQUIPMENT_SUPPLY_CONTEXT_EQUALS_VALIDATED_EQUIPMENT_SELECTION = false as const;
export const ELECTRICAL_EQUIPMENT_SUPPLY_CONTEXT_EQUALS_VALIDATED_FEEDER_DESIGN = false as const;
export const ELECTRICAL_EQUIPMENT_SUPPLY_CONTEXT_EQUALS_VALIDATED_CABLE_DESIGN = false as const;
export const D7_R3_CAN_REFERENCE_D6_PROCESS_REQUIREMENT = true as const;
export const EXACT_D6_PROCESS_REQUIREMENT_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D6_POWER_LOAD_REQUIREMENT_EQUALS_ADOPTED_D7_ELECTRICAL_LOAD = false as const;
export const D7_R3_AUTO_ADOPTS_D6_PROCESS_LOAD_REQUIREMENT = false as const;
export const D7_R3_CAN_REFERENCE_D4_MECHANICAL_CONTEXT = true as const;
export const EXACT_D4_MECHANICAL_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const MECHANICAL_EQUIPMENT_DUTY_EQUALS_ADOPTED_ELECTRICAL_LOAD = false as const;
export const D7_R3_AUTO_ADOPTS_MECHANICAL_DUTY_AS_ELECTRICAL_LOAD = false as const;
export const D7_R3_SELECTS_ELECTRICAL_EQUIPMENT = false as const;
export const D7_R3_SIZES_TRANSFORMER = false as const;
export const D7_R3_SIZES_GENERATOR = false as const;
export const D7_R3_SIZES_MOTOR = false as const;
export const D7_R3_SIZES_SWITCHGEAR = false as const;
export const D7_R3_SIZES_UPS = false as const;
export const D7_R3_SIZES_BATTERY = false as const;
export const D7_R3_CASE_APPLICABILITY_EXPLICIT = true as const;
export const D7_R3_AUTO_PROPAGATES_LOAD_ACROSS_CASES = false as const;
export const D7_R3_DUTY_AVAILABILITY_CONTEXT_SUPPORTED = true as const;
export const D7_R3_DUTY_CONTEXT_EQUALS_RELIABILITY_VALIDATED = false as const;
export const D7_R3_AVAILABILITY_CONTEXT_EQUALS_REDUNDANCY_DESIGN_VALIDATED = false as const;
export const EXACT_D7_R2_SYSTEM_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R2_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R2_DISTRIBUTION_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D7_R3_AUTO_MUTATES_R2_SYSTEM_CONTEXT = false as const;
export const D7_R3_AUTO_MUTATES_R2_SOURCE_CONTEXT = false as const;
export const D7_R3_AUTO_MUTATES_R2_DISTRIBUTION_CONTEXT = false as const;
export const D7_R3_LOAD_CONTEXT_AUTO_VALIDATES_SOURCE_CAPACITY = false as const;
export const D7_R3_LOAD_CONTEXT_AUTO_RESIZES_SOURCE = false as const;
export const D7_R3_LOAD_CONTEXT_AUTO_RECONFIGURES_DISTRIBUTION = false as const;
export const D7_R3_PERFORMS_LOAD_FLOW = false as const;
export const D7_R3_PERFORMS_SHORT_CIRCUIT_CALCULATION = false as const;
export const D7_R3_PERFORMS_MOTOR_STARTING_CALCULATION = false as const;
export const D7_R3_SOURCE_BASIS_REQUIRED = true as const;
export const D7_R3_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D7_R3_CONTEXT_AUTO_ACCEPTED = false as const;
export const D7_R3_APPLICABILITY_EXPLICIT = true as const;
export const D7_R3_LIMITATIONS_EXPLICIT = true as const;
export const D7_R3_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D7_R3_PROVENANCE_REQUIRED = true as const;
export const D7_R3_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D7_R3_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D7_R3_ACCESS_ALLOWED = false as const;
export const D7_R3_HISTORY_PRESERVED = true as const;
export const D7_R3_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D7_R3_MUTATION_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_LOAD = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_CONSUMER_RELATIONSHIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_EQUIPMENT_SUPPLY_CONTEXT = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D7_R3_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D7_R3_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R3_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D7_R3_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D7_R4_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_LOAD_CALCULATION = false as const;
export const UNAUTHORIZED_LOAD_FLOW_CALCULATION = false as const;
export const UNAUTHORIZED_SHORT_CIRCUIT_CALCULATION = false as const;
export const UNAUTHORIZED_MOTOR_STARTING_CALCULATION = false as const;
export const UNAUTHORIZED_EQUIPMENT_SIZING = false as const;
export const UNAUTHORIZED_EQUIPMENT_SELECTION = false as const;
export const UNAUTHORIZED_SOURCE_REQUIREMENT_AUTO_ADOPTION = false as const;
export const UNAUTHORIZED_PROCESS_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_MECHANICAL_AUTHORITY_TRANSFER = false as const;
export const D7_R3_LOAD_ROLES = ["SUPPLIED_LOAD_REQUIREMENT", "ADOPTED_ELECTRICAL_LOAD"] as const;
export const D7_R3_CASES = ["NORMAL_CASE", "STARTUP_CASE", "SHUTDOWN_CASE", "EMERGENCY_CASE", "OTHER_GOVERNED_CASE"] as const;
export const D7_R3_DUTIES = ["CONTINUOUS", "INTERMITTENT", "STANDBY", "UNSPECIFIED_DUTY"] as const;
export const D7_R3_AVAILABILITY = ["REQUIRED", "NONESSENTIAL", "UNSPECIFIED_AVAILABILITY"] as const;
export const D7_R3_UNITS = ["W", "kW", "MW", "VA", "kVA", "MVA", "A", "kA", "V", "kV"] as const;
export const D7_R3_CONSUMER_CLASSES = ["MOTOR_CONSUMER", "LIGHTING_CONSUMER", "HEATER_CONSUMER", "PROCESS_CONSUMER", "OTHER_CANONICAL_CONSUMER"] as const;
export const D7_R3_VOLTAGE_CONTEXTS = ["VOLTAGE_CONTEXT_UNSTATED", "LOW_VOLTAGE_SUPPLY_CONTEXT", "MEDIUM_VOLTAGE_SUPPLY_CONTEXT", "HIGH_VOLTAGE_SUPPLY_CONTEXT", "DC_SUPPLY_CONTEXT"] as const;
export const D7_R3_PHASE_CONTEXTS = ["PHASE_CONTEXT_UNSTATED", "SINGLE_PHASE", "THREE_PHASE", "DC_PHASE"] as const;
export const D7_R3_CONSUMER_RELATIONSHIP_KINDS = ["CONSUMER_TO_SYSTEM", "CONSUMER_TO_SOURCE", "CONSUMER_TO_DISTRIBUTION"] as const;
export const D7_R4_CANONICAL_PHASE = D7_IMPLEMENTATION_PHASES[3];
export const D7_R4_PHASE_TYPE = D7_IMPLEMENTATION_PHASE_TYPES[3];
export const D7_R4_CANONICAL_SCOPE =
  "Implement governed feeder, cable and Electrical-rating context using exact R1-R3 revisions. Support exact feeder/cable relationships, supplied/adopted rating context, conductor/cable attributes where explicitly governed, installation/reference context and source/basis/provenance/currentness. Preserve feeder/cable context != cable sizing, supplied rating != validated rating, equipment rating context != validated selection, and do not calculate voltage drop, ampacity, cable size, short-circuit withstand, protection coordination or any other Electrical calculation." as const;
export const D7_R4_STARTED = false as const;
export const D7_R3_READY_FOR_NEXT_PHASE = true as const;
export const D7_R3_NEXT_PHASE = D7_R4_CANONICAL_PHASE;
export const D7_R3_NEXT_PHASE_TYPE = D7_R4_PHASE_TYPE;
export const D7_R3_CANONICAL_NEXT_PHASE = D7_R4_CANONICAL_PHASE;
export const D7_R3_CANONICAL_NEXT_PHASE_SCOPE = D7_R4_CANONICAL_SCOPE;
export const D7_R3_BLOCKER = "NONE" as const;
export const D7_R3_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  SOURCE_LOAD_REQUIREMENT_EQUALS_ADOPTED_ELECTRICAL_LOAD,
  ELECTRICAL_LOAD_CONTEXT_EQUALS_VALIDATED_LOAD_CALCULATION,
  ELECTRICAL_CONSUMER_CONTEXT_EQUALS_VALIDATED_EQUIPMENT_SELECTION,
  D6_PROCESS_REQUIREMENT_EQUALS_D7_ELECTRICAL_DESIGN,
  D6_POWER_LOAD_REQUIREMENT_EQUALS_VALIDATED_D7_LOAD,
  MECHANICAL_EQUIPMENT_DUTY_EQUALS_ELECTRICAL_MOTOR_DESIGN,
  MECHANICAL_EQUIPMENT_SELECTION_EQUALS_VALIDATED_ELECTRICAL_SUPPLY_DESIGN,
  D7_IDENTITY_RUNTIME_COUNT,
  D7_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D7_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D7_FEEDER_CABLE_RATING_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
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
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D7_CABLE_SIZING_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_ARC_FLASH_CALCULATION_RUNTIME_COUNT,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_BATTERY_UPS_CALCULATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_APPROVAL_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
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
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D7_PROTECTION_OR_CONTROL_DESIGN,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["matching_name", "matching_tag", "name_similarity", "tag_similarity", "equipment_number", "drawing_adjacency", "semantic_similarity", "ai_inference", "ai_reasoning", "inferred"]);
const MAGNITUDE = /^[0-9]+(\.[0-9]+)?$/;

type Currentness = (typeof D7_CURRENTNESS_STATES)[number];
type Stage = (typeof D7_MATURITY_STATES)[number];
type LoadRole = (typeof D7_R3_LOAD_ROLES)[number];
type CaseName = (typeof D7_R3_CASES)[number];

type Prohibited = {
  connectedLoadCalculation?: boolean;
  demandLoadCalculation?: boolean;
  diversifiedLoadCalculation?: boolean;
  maximumDemand?: boolean;
  deriveMissingLoad?: boolean;
  hiddenCalculation?: boolean;
  loadFlow?: boolean;
  shortCircuit?: boolean;
  motorStarting?: boolean;
  selectEquipment?: boolean;
  sizeTransformer?: boolean;
  sizeGenerator?: boolean;
  sizeMotor?: boolean;
  sizeSwitchgear?: boolean;
  sizeUps?: boolean;
  sizeBattery?: boolean;
  feederDesign?: boolean;
  cableSize?: boolean;
  ampacity?: boolean;
  voltageDrop?: boolean;
  protectionSetting?: boolean;
  groundingDesign?: boolean;
  hazardousArea?: boolean;
  calculationEvidence?: boolean;
  reviewValidation?: boolean;
  d9Source?: boolean;
  autoAdopt?: boolean;
  propagateAcrossCases?: boolean;
  convertUnits?: boolean;
  validateCapacity?: boolean;
  resizeSource?: boolean;
  reconfigureDistribution?: boolean;
  mutateR2?: boolean;
  engineeringValidated?: boolean;
  inferredRelationship?: boolean;
  repoint?: boolean;
  processAuthority?: boolean;
  mechanicalAuthority?: boolean;
};

export type D7R3ExternalRevision = {
  recordId: string;
  fingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
};

export type D7R3ProcessRequirementSource = { requirements: readonly (D7R3ExternalRevision & { requirementId: string })[] };
export type D7R3MechanicalContextSource = { records: readonly D7R3ExternalRevision[] };

type Bound = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  caseName: string;
  duty: string;
  availability: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type Truth = {
  contextId: string;
  objectId: string;
  objectType: D7R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  caseName: CaseName;
  duty: (typeof D7_R3_DUTIES)[number];
  availability: (typeof D7_R3_AVAILABILITY)[number];
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  electricalEngineeringAuthority: false;
  engineeringValidated: false;
  calculated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
};

export type D7R3LoadInput = Bound & {
  loadRecordId: string;
  statementRole: string;
  suppliedValue: string;
  unit: string;
  adoptedFromLoadRecordId?: string | null;
  adoptionRationale?: string | null;
  predecessorLoadRecordId?: string | null;
};

export type D7R3LoadRecord = Truth & {
  loadRecordId: string;
  statementRole: LoadRole;
  suppliedValue: string;
  unit: (typeof D7_R3_UNITS)[number];
  adopted: boolean;
  adoptedFromLoadRecordId: string | null;
  adoptedFromFingerprint: string | null;
  adoptionRationale: string | null;
  validatedLoadCalculation: false;
  loadFlowResult: false;
  predecessorLoadRecordId: string | null;
};

export type D7R3ConsumerInput = Bound & {
  consumerRecordId: string;
  consumerClass: string;
  loadRecordId?: string | null;
  loadRevisionFingerprint?: string | null;
  predecessorConsumerRecordId?: string | null;
};

export type D7R3ConsumerRecord = Truth & {
  consumerRecordId: string;
  consumerClass: (typeof D7_R3_CONSUMER_CLASSES)[number];
  loadRecordId: string | null;
  loadRevisionFingerprint: string | null;
  validatedEquipmentSelection: false;
  feederDesign: false;
  predecessorConsumerRecordId: string | null;
};

export type D7R3RelationshipInput = Prohibited & {
  relationshipId: string;
  kind: string;
  contextId: string;
  consumerObjectId: string;
  consumerObjectRevisionFingerprint: string;
  consumerRecordId: string;
  consumerRevisionFingerprint: string;
  targetRecordId: string;
  targetRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string;
  predecessorRelationshipId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D7R3RelationshipRecord = {
  relationshipId: string;
  kind: (typeof D7_R3_CONSUMER_RELATIONSHIP_KINDS)[number];
  contextId: string;
  consumerObjectId: string;
  consumerObjectRevisionFingerprint: string;
  consumerRecordId: string;
  consumerRevisionFingerprint: string;
  targetRecordId: string;
  targetRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  citedCurrentness: Currentness;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  authority: typeof D7_CONTEXT_AUTHORITY;
  inferred: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRelationshipId: string | null;
};

export type D7R3SupplyInput = Bound & {
  supplyRecordId: string;
  systemRecordId: string;
  systemRevisionFingerprint: string;
  sourceRecordId?: string | null;
  sourceRevisionFingerprint?: string | null;
  distributionRecordId?: string | null;
  distributionRevisionFingerprint?: string | null;
  voltageContext: string;
  phaseContext: string;
  loadRecordId?: string | null;
  loadRevisionFingerprint?: string | null;
  processRequirementId?: string | null;
  processRequirementFingerprint?: string | null;
  mechanicalRecordId?: string | null;
  mechanicalRevisionFingerprint?: string | null;
  predecessorSupplyRecordId?: string | null;
};

export type D7R3SupplyRecord = Truth & {
  supplyRecordId: string;
  systemRecordId: string;
  systemRevisionFingerprint: string;
  sourceRecordId: string | null;
  sourceRevisionFingerprint: string | null;
  distributionRecordId: string | null;
  distributionRevisionFingerprint: string | null;
  voltageContext: (typeof D7_R3_VOLTAGE_CONTEXTS)[number];
  phaseContext: (typeof D7_R3_PHASE_CONTEXTS)[number];
  loadRecordId: string | null;
  loadRevisionFingerprint: string | null;
  processRequirementId: string | null;
  processRequirementFingerprint: string | null;
  processRequirementAdopted: false;
  mechanicalRecordId: string | null;
  mechanicalRevisionFingerprint: string | null;
  mechanicalDutyAdopted: false;
  validatedEquipmentSelection: false;
  validatedFeederDesign: false;
  validatedCableDesign: false;
  predecessorSupplyRecordId: string | null;
};

export type D7R3History = {
  historyId: string;
  subjectKind: "LOAD" | "CONSUMER" | "SUPPLY" | "RELATIONSHIP";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D7R3Store = {
  r1: D7R1Store;
  r2: D7R2Store;
  process: D7R3ProcessRequirementSource | null;
  mechanical: D7R3MechanicalContextSource | null;
  now: () => string;
  loads: D7R3LoadRecord[];
  consumers: D7R3ConsumerRecord[];
  supplies: D7R3SupplyRecord[];
  relationships: D7R3RelationshipRecord[];
  history: D7R3History[];
};

function fail(code: string): never {
  throw new Error(`D7_R3_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isStage(value: string): value is Stage {
  return (D7_MATURITY_STATES as readonly string[]).includes(value);
}

function isCurrentness(value: string): value is Currentness {
  return (D7_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D7R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_ELECTRICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_ELECTRICAL_AUTHORITY");
  if (actor.authority === "ELECTRICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_ELECTRICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D7_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D7R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.connectedLoadCalculation === true || input.demandLoadCalculation === true || input.diversifiedLoadCalculation === true || input.maximumDemand === true || input.deriveMissingLoad === true || input.hiddenCalculation === true) fail("LOAD_CALCULATION_NOT_IN_R3");
  if (input.loadFlow === true) fail("LOAD_FLOW_NOT_IN_R3");
  if (input.shortCircuit === true) fail("SHORT_CIRCUIT_NOT_IN_R3");
  if (input.motorStarting === true) fail("MOTOR_STARTING_NOT_IN_R3");
  if (input.selectEquipment === true || input.sizeTransformer === true || input.sizeGenerator === true || input.sizeMotor === true || input.sizeSwitchgear === true || input.sizeUps === true || input.sizeBattery === true) fail("SIZING_NOT_IN_R3");
  if (input.feederDesign === true || input.cableSize === true || input.ampacity === true || input.voltageDrop === true) fail("FEEDER_CABLE_NOT_IN_R3");
  if (input.protectionSetting === true || input.groundingDesign === true || input.hazardousArea === true) fail("PROTECTION_GROUNDING_NOT_IN_R3");
  if (input.calculationEvidence === true) fail("CALCULATION_EVIDENCE_NOT_IN_R3");
  if (input.reviewValidation === true || input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R3");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R3");
  if (input.autoAdopt === true) fail("AUTO_ADOPTION_REJECTED");
  if (input.propagateAcrossCases === true || input.convertUnits === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.validateCapacity === true || input.resizeSource === true || input.reconfigureDistribution === true || input.mutateR2 === true) fail("R2_MUTATION_REJECTED");
  if (input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.processAuthority === true || input.mechanicalAuthority === true) fail("DISCIPLINE_AUTHORITY_NOT_TRANSFERRED");
}

function remember(store: D7R3Store, subjectKind: D7R3History["subjectKind"], subjectId: string, action: D7R3History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function requireObject(store: D7R3Store, actor: D7R1Actor, contextId: string, objectId: string, revision: string, allowed: readonly string[], cited: Currentness): D7R1ObjectRecord {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const fingerprint = explicit(revision, "R1_REVISION_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  const object = store.r1.objects.find((row) => row.objectId === id);
  if (!object || !allowed.includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== fingerprint) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== context.contextId || object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  if (cited === "SUPERSEDED" && object.recordStatus !== "SUPERSEDED") fail("R1_OBJECT_CURRENTNESS_MISMATCH");
  return object;
}

function caseDuty(input: Bound, objectId: string): { caseName: CaseName; duty: D7R3LoadRecord["duty"]; availability: D7R3LoadRecord["availability"]; applicability: string; limitations: string } {
  const caseName = explicit(input.caseName, "CASE_REQUIRED");
  if (!(D7_R3_CASES as readonly string[]).includes(caseName)) fail("CASE_NOT_ALLOWLISTED");
  const duty = explicit(input.duty, "DUTY_REQUIRED");
  const availability = explicit(input.availability, "AVAILABILITY_REQUIRED");
  if (!(D7_R3_DUTIES as readonly string[]).includes(duty)) fail("DUTY_NOT_ALLOWLISTED");
  if (!(D7_R3_AVAILABILITY as readonly string[]).includes(availability)) fail("AVAILABILITY_NOT_ALLOWLISTED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(objectId) || !applicability.includes(caseName)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return { caseName: caseName as CaseName, duty: duty as D7R3LoadRecord["duty"], availability: availability as D7R3LoadRecord["availability"], applicability, limitations };
}

function prepare(store: D7R3Store, actor: D7R1Actor, input: Bound, allowed: readonly string[]) {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const object = requireObject(store, actor, contextId, input.objectId, input.objectRevisionFingerprint, allowed, citedCurrentness);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const governed = caseDuty(input, object.objectId);
  return {
    contextId,
    object,
    stage,
    citedCurrentness,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    ...governed,
  };
}

function truthBase(actor: D7R1Actor, prepared: ReturnType<typeof prepare>, fingerprint: string): Truth {
  return {
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: prepared.object.objectType,
    objectRevisionFingerprint: prepared.object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    caseName: prepared.caseName,
    duty: prepared.duty,
    availability: prepared.availability,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D7_CONTEXT_AUTHORITY,
    electricalEngineeringAuthority: false,
    engineeringValidated: false,
    calculated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: "",
    recordStatus: "CURRENT",
    currentness: "CURRENT",
  };
}

function place<T extends { fingerprint: string; tenantId: string; recordStatus: "CURRENT" | "SUPERSEDED"; currentness: "CURRENT" | "SUPERSEDED"; objectRevisionFingerprint?: string; consumerObjectRevisionFingerprint?: string; targetRevisionFingerprint?: string }>(
  store: D7R3Store,
  rows: T[],
  kind: D7R3History["subjectKind"],
  id: string,
  fingerprint: string,
  tenantId: string,
  predecessor: T | null,
  idOf: (row: T) => string,
  duplicate: T | undefined,
  duplicateCode: string,
  record: T,
): T {
  const existing = rows.find((row) => idOf(row) === id);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === tenantId ? existing : fail(duplicateCode);
  if (duplicate) fail(duplicateCode);
  if (predecessor) {
    const before = { objectRevisionFingerprint: predecessor.objectRevisionFingerprint, consumerObjectRevisionFingerprint: predecessor.consumerObjectRevisionFingerprint, targetRevisionFingerprint: predecessor.targetRevisionFingerprint };
    const index = rows.findIndex((row) => idOf(row) === idOf(predecessor));
    rows[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    const after = rows[index];
    if (after.objectRevisionFingerprint !== before.objectRevisionFingerprint || after.consumerObjectRevisionFingerprint !== before.consumerObjectRevisionFingerprint || after.targetRevisionFingerprint !== before.targetRevisionFingerprint) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, kind, idOf(predecessor), "SUPERSEDED", predecessor.fingerprint);
  }
  rows.push(record);
  remember(store, kind, id, "CREATED", fingerprint);
  return record;
}

function requireLoad(store: D7R3Store, actor: D7R1Actor, loadRecordId: string | null | undefined, revision: string | null | undefined): D7R3LoadRecord | null {
  const hasId = loadRecordId != null && loadRecordId.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail("LOAD_REVISION_REQUIRED");
  const row = store.loads.find((item) => item.loadRecordId === explicit(loadRecordId as string, "LOAD_REVISION_REQUIRED"));
  if (!row || row.fingerprint !== explicit(revision as string, "LOAD_REVISION_REQUIRED") || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT") fail("LOAD_REVISION_MISMATCH");
  return row;
}

function requireR2<T extends { tenantId: string; workspaceId: string; projectId: string; fingerprint: string; recordStatus: "CURRENT" | "SUPERSEDED" }>(rows: readonly T[], id: string, fingerprint: string, actor: D7R1Actor, idOf: (row: T) => string, code: string, cited: Currentness): T {
  const row = rows.find((item) => idOf(item) === explicit(id, code));
  if (!row || row.fingerprint !== explicit(fingerprint, code)) fail(code);
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail(code);
  return row;
}

function optionalPair(id: string | null | undefined, revision: string | null | undefined, code: string): { id: string; revision: string } | null {
  const hasId = id != null && id.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail(code);
  return { id: id as string, revision: revision as string };
}

function externalRevision(rows: readonly { recordId?: string; requirementId?: string; fingerprint: string; tenantId: string; workspaceId: string; projectId: string; recordStatus: "CURRENT" | "SUPERSEDED" }[], id: string, fingerprint: string, actor: D7R1Actor, code: string): { id: string; fingerprint: string } {
  const token = explicit(id, code);
  const revision = explicit(fingerprint, code);
  const row = rows.find((item) => (item.requirementId ?? item.recordId) === token);
  if (!row || row.fingerprint !== revision) fail(code);
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (row.recordStatus !== "CURRENT") fail(code);
  return { id: token, fingerprint: revision };
}

export function createD7R3Store(r1: D7R1Store, r2: D7R2Store, sources: { process?: D7R3ProcessRequirementSource | null; mechanical?: D7R3MechanicalContextSource | null } = {}, now: () => string = () => "2026-10-25T00:00:00.000Z"): D7R3Store {
  if (r2.r1 !== r1) fail("R1_R2_STORE_MISMATCH");
  return { r1, r2, process: sources.process ?? null, mechanical: sources.mechanical ?? null, now, loads: [], consumers: [], supplies: [], relationships: [], history: [] };
}

export function recordElectricalLoadContext(store: D7R3Store, actor: D7R1Actor, input: D7R3LoadInput): D7R3LoadRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_LOAD"]);
  const loadRecordId = explicit(input.loadRecordId, "LOAD_CONTEXT_REQUIRED");
  const statementRole = explicit(input.statementRole, "LOAD_ROLE_REQUIRED");
  if (!(D7_R3_LOAD_ROLES as readonly string[]).includes(statementRole)) fail("LOAD_ROLE_NOT_ALLOWLISTED");
  const suppliedValue = explicit(input.suppliedValue, "LOAD_VALUE_REQUIRED");
  if (!MAGNITUDE.test(suppliedValue)) fail("HIDDEN_LOAD_CALCULATION");
  const unit = explicit(input.unit, "UNIT_REQUIRED");
  if (!(D7_R3_UNITS as readonly string[]).includes(unit)) fail("UNIT_NOT_PRESERVED");
  const adoptedFrom = input.adoptedFromLoadRecordId ? store.loads.find((row) => row.loadRecordId === input.adoptedFromLoadRecordId) : null;
  if (statementRole === "SUPPLIED_LOAD_REQUIREMENT" && input.adoptedFromLoadRecordId) fail("SUPPLIED_LOAD_AUTO_ADOPTED");
  if (statementRole === "ADOPTED_ELECTRICAL_LOAD") {
    const rationale = input.adoptionRationale ? explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED") : "";
    if (!adoptedFrom || !rationale || adoptedFrom.statementRole !== "SUPPLIED_LOAD_REQUIREMENT" || adoptedFrom.recordStatus !== "CURRENT" || adoptedFrom.tenantId !== actor.tenantId || adoptedFrom.caseName !== prepared.caseName || adoptedFrom.objectId !== prepared.object.objectId) fail("ADOPTION_REQUIRED");
  }
  const predecessor = input.predecessorLoadRecordId ? store.loads.find((row) => row.loadRecordId === input.predecessorLoadRecordId) : null;
  if (input.predecessorLoadRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    loadRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    statementRole,
    suppliedValue,
    unit,
    caseName: prepared.caseName,
    duty: prepared.duty,
    availability: prepared.availability,
    adoptedFromLoadRecordId: adoptedFrom?.loadRecordId ?? null,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.loads.find((row) => row.recordStatus === "CURRENT" && row.loadRecordId !== predecessor?.loadRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.caseName === prepared.caseName && (row.statementRole === statementRole || (statementRole === "ADOPTED_ELECTRICAL_LOAD" && row.statementRole === "ADOPTED_ELECTRICAL_LOAD")));
  const record: D7R3LoadRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    loadRecordId,
    statementRole: statementRole as LoadRole,
    suppliedValue,
    unit: unit as D7R3LoadRecord["unit"],
    adopted: statementRole === "ADOPTED_ELECTRICAL_LOAD",
    adoptedFromLoadRecordId: adoptedFrom?.loadRecordId ?? null,
    adoptedFromFingerprint: adoptedFrom?.fingerprint ?? null,
    adoptionRationale: statementRole === "ADOPTED_ELECTRICAL_LOAD" ? explicit(input.adoptionRationale ?? "", "ADOPTION_RATIONALE_REQUIRED") : null,
    validatedLoadCalculation: false,
    loadFlowResult: false,
    predecessorLoadRecordId: predecessor?.loadRecordId ?? null,
  });
  return place(store, store.loads, "LOAD", loadRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.loadRecordId, duplicate, "DUPLICATE_LOAD_REJECTED", record);
}

export function recordElectricalConsumerContext(store: D7R3Store, actor: D7R1Actor, input: D7R3ConsumerInput): D7R3ConsumerRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_CONSUMER"]);
  const consumerRecordId = explicit(input.consumerRecordId, "CONSUMER_CONTEXT_REQUIRED");
  const consumerClass = explicit(input.consumerClass, "CONSUMER_CLASS_REQUIRED");
  if (!(D7_R3_CONSUMER_CLASSES as readonly string[]).includes(consumerClass)) fail("CONSUMER_CLASS_NOT_ALLOWLISTED");
  const load = requireLoad(store, actor, input.loadRecordId, input.loadRevisionFingerprint);
  const predecessor = input.predecessorConsumerRecordId ? store.consumers.find((row) => row.consumerRecordId === input.predecessorConsumerRecordId) : null;
  if (input.predecessorConsumerRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    consumerRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    consumerClass,
    loadRecordId: load?.loadRecordId ?? null,
    loadRevisionFingerprint: load?.fingerprint ?? null,
    caseName: prepared.caseName,
    duty: prepared.duty,
    availability: prepared.availability,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.consumers.find((row) => row.recordStatus === "CURRENT" && row.consumerRecordId !== predecessor?.consumerRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.caseName === prepared.caseName && row.consumerClass === consumerClass);
  const record: D7R3ConsumerRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    consumerRecordId,
    consumerClass: consumerClass as D7R3ConsumerRecord["consumerClass"],
    loadRecordId: load?.loadRecordId ?? null,
    loadRevisionFingerprint: load?.fingerprint ?? null,
    validatedEquipmentSelection: false,
    feederDesign: false,
    predecessorConsumerRecordId: predecessor?.consumerRecordId ?? null,
  });
  return place(store, store.consumers, "CONSUMER", consumerRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.consumerRecordId, duplicate, "DUPLICATE_CONSUMER_REJECTED", record);
}

export function recordElectricalConsumerRelationship(store: D7R3Store, actor: D7R1Actor, input: D7R3RelationshipInput): D7R3RelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const relationshipId = explicit(input.relationshipId, "RELATIONSHIP_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (!(D7_R3_CONSUMER_RELATIONSHIP_KINDS as readonly string[]).includes(kindToken)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
  const kind = kindToken as D7R3RelationshipRecord["kind"];
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const consumerObject = requireObject(store, actor, contextId, input.consumerObjectId, input.consumerObjectRevisionFingerprint, ["ELECTRICAL_CONSUMER"], citedCurrentness);
  const consumer = store.consumers.find((row) => row.consumerRecordId === explicit(input.consumerRecordId, "CONSUMER_REVISION_REQUIRED"));
  if (!consumer || consumer.fingerprint !== explicit(input.consumerRevisionFingerprint, "CONSUMER_REVISION_REQUIRED") || consumer.objectId !== consumerObject.objectId || consumer.objectRevisionFingerprint !== consumerObject.fingerprint || consumer.recordStatus !== "CURRENT") fail("CONSUMER_REVISION_MISMATCH");
  let target: D7R2SystemRecord | D7R2SourceRecord | D7R2DistributionRecord;
  if (kind === "CONSUMER_TO_SYSTEM") target = requireR2(store.r2.systems, input.targetRecordId, input.targetRevisionFingerprint, actor, (row) => row.systemRecordId, "R2_SYSTEM_REVISION_MISMATCH", citedCurrentness);
  else if (kind === "CONSUMER_TO_SOURCE") target = requireR2(store.r2.sources, input.targetRecordId, input.targetRevisionFingerprint, actor, (row) => row.sourceRecordId, "R2_SOURCE_REVISION_MISMATCH", citedCurrentness);
  else target = requireR2(store.r2.distributions, input.targetRecordId, input.targetRevisionFingerprint, actor, (row) => row.distributionRecordId, "R2_DISTRIBUTION_REVISION_MISMATCH", citedCurrentness);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(consumerObject.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const predecessor = input.predecessorRelationshipId ? store.relationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.kind !== kind || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind,
    consumerObjectId: consumerObject.objectId,
    consumerObjectRevisionFingerprint: consumerObject.fingerprint,
    consumerRecordId: consumer.consumerRecordId,
    consumerRevisionFingerprint: consumer.fingerprint,
    targetRecordId: input.targetRecordId.trim(),
    targetRevisionFingerprint: target.fingerprint,
    applicability,
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    citedLifecycleStage: stage,
    citedCurrentness,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.relationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.kind === kind && row.consumerObjectRevisionFingerprint === consumerObject.fingerprint && row.targetRevisionFingerprint === target.fingerprint);
  const record: D7R3RelationshipRecord = Object.freeze({
    relationshipId,
    kind,
    contextId,
    consumerObjectId: consumerObject.objectId,
    consumerObjectRevisionFingerprint: consumerObject.fingerprint,
    consumerRecordId: consumer.consumerRecordId,
    consumerRevisionFingerprint: consumer.fingerprint,
    targetRecordId: input.targetRecordId.trim(),
    targetRevisionFingerprint: target.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: stage,
    citedCurrentness,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability,
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    authority: D7_CONTEXT_AUTHORITY,
    inferred: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  return place(store, store.relationships, "RELATIONSHIP", relationshipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.relationshipId, duplicate, "DUPLICATE_RELATIONSHIP_REJECTED", record);
}

export function recordElectricalEquipmentSupplyContext(store: D7R3Store, actor: D7R1Actor, input: D7R3SupplyInput): D7R3SupplyRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_MOTOR_DRIVE"]);
  const supplyRecordId = explicit(input.supplyRecordId, "SUPPLY_CONTEXT_REQUIRED");
  const system = requireR2(store.r2.systems, input.systemRecordId, input.systemRevisionFingerprint, actor, (row) => row.systemRecordId, "R2_SYSTEM_REVISION_MISMATCH", prepared.citedCurrentness);
  const sourcePair = optionalPair(input.sourceRecordId, input.sourceRevisionFingerprint, "R2_SOURCE_REVISION_REQUIRED");
  const distributionPair = optionalPair(input.distributionRecordId, input.distributionRevisionFingerprint, "R2_DISTRIBUTION_REVISION_REQUIRED");
  const source = sourcePair ? requireR2(store.r2.sources, sourcePair.id, sourcePair.revision, actor, (row) => row.sourceRecordId, "R2_SOURCE_REVISION_MISMATCH", prepared.citedCurrentness) : null;
  const distribution = distributionPair ? requireR2(store.r2.distributions, distributionPair.id, distributionPair.revision, actor, (row) => row.distributionRecordId, "R2_DISTRIBUTION_REVISION_MISMATCH", prepared.citedCurrentness) : null;
  const voltageContext = explicit(input.voltageContext, "VOLTAGE_CONTEXT_REQUIRED");
  const phaseContext = explicit(input.phaseContext, "PHASE_CONTEXT_REQUIRED");
  if (!(D7_R3_VOLTAGE_CONTEXTS as readonly string[]).includes(voltageContext)) fail("VOLTAGE_CONTEXT_NOT_ALLOWLISTED");
  if (!(D7_R3_PHASE_CONTEXTS as readonly string[]).includes(phaseContext)) fail("PHASE_CONTEXT_NOT_ALLOWLISTED");
  const load = requireLoad(store, actor, input.loadRecordId, input.loadRevisionFingerprint);
  const processPair = optionalPair(input.processRequirementId, input.processRequirementFingerprint, "PROCESS_REQUIREMENT_REVISION_REQUIRED");
  const mechanicalPair = optionalPair(input.mechanicalRecordId, input.mechanicalRevisionFingerprint, "MECHANICAL_REVISION_REQUIRED");
  if (processPair && !store.process) fail("PROCESS_REQUIREMENT_NOT_FOUND");
  if (mechanicalPair && !store.mechanical) fail("MECHANICAL_CONTEXT_NOT_FOUND");
  const process = processPair ? externalRevision(store.process?.requirements ?? [], processPair.id, processPair.revision, actor, "PROCESS_REQUIREMENT_NOT_FOUND") : null;
  const mechanical = mechanicalPair ? externalRevision(store.mechanical?.records ?? [], mechanicalPair.id, mechanicalPair.revision, actor, "MECHANICAL_CONTEXT_NOT_FOUND") : null;
  const predecessor = input.predecessorSupplyRecordId ? store.supplies.find((row) => row.supplyRecordId === input.predecessorSupplyRecordId) : null;
  if (input.predecessorSupplyRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const beforeSystem = system.fingerprint;
  const beforeSource = source?.fingerprint ?? null;
  const beforeDistribution = distribution?.fingerprint ?? null;
  const fingerprint = fingerprintCanonical({
    supplyRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    systemRecordId: system.systemRecordId,
    systemRevisionFingerprint: system.fingerprint,
    sourceRecordId: source?.sourceRecordId ?? null,
    sourceRevisionFingerprint: source?.fingerprint ?? null,
    distributionRecordId: distribution?.distributionRecordId ?? null,
    distributionRevisionFingerprint: distribution?.fingerprint ?? null,
    voltageContext,
    phaseContext,
    loadRecordId: load?.loadRecordId ?? null,
    loadRevisionFingerprint: load?.fingerprint ?? null,
    processRequirementId: process?.id ?? null,
    processRequirementFingerprint: process?.fingerprint ?? null,
    mechanicalRecordId: mechanical?.id ?? null,
    mechanicalRevisionFingerprint: mechanical?.fingerprint ?? null,
    caseName: prepared.caseName,
    duty: prepared.duty,
    availability: prepared.availability,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
  });
  if (system.fingerprint !== beforeSystem || (source?.fingerprint ?? null) !== beforeSource || (distribution?.fingerprint ?? null) !== beforeDistribution) fail("R2_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.supplies.find((row) => row.recordStatus === "CURRENT" && row.supplyRecordId !== predecessor?.supplyRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.caseName === prepared.caseName && row.systemRevisionFingerprint === system.fingerprint);
  const record: D7R3SupplyRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    supplyRecordId,
    systemRecordId: system.systemRecordId,
    systemRevisionFingerprint: system.fingerprint,
    sourceRecordId: source?.sourceRecordId ?? null,
    sourceRevisionFingerprint: source?.fingerprint ?? null,
    distributionRecordId: distribution?.distributionRecordId ?? null,
    distributionRevisionFingerprint: distribution?.fingerprint ?? null,
    voltageContext: voltageContext as D7R3SupplyRecord["voltageContext"],
    phaseContext: phaseContext as D7R3SupplyRecord["phaseContext"],
    loadRecordId: load?.loadRecordId ?? null,
    loadRevisionFingerprint: load?.fingerprint ?? null,
    processRequirementId: process?.id ?? null,
    processRequirementFingerprint: process?.fingerprint ?? null,
    processRequirementAdopted: false,
    mechanicalRecordId: mechanical?.id ?? null,
    mechanicalRevisionFingerprint: mechanical?.fingerprint ?? null,
    mechanicalDutyAdopted: false,
    validatedEquipmentSelection: false,
    validatedFeederDesign: false,
    validatedCableDesign: false,
    predecessorSupplyRecordId: predecessor?.supplyRecordId ?? null,
  });
  return place(store, store.supplies, "SUPPLY", supplyRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.supplyRecordId, duplicate, "DUPLICATE_SUPPLY_REJECTED", record);
}

export function reconstructElectricalLoad(store: D7R3Store, loadRecordId: string): D7R3LoadRecord {
  const record = store.loads.find((row) => row.loadRecordId === loadRecordId);
  if (!record) fail("LOAD_NOT_FOUND");
  return record;
}

export function repointElectricalLoadContext(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function mutateElectricalLoadContext(): never {
  return fail("SILENT_MUTATION_REJECTED");
}

export function recordElectricalFeederDesign(): never {
  return fail("FEEDER_CABLE_NOT_IN_R3");
}

export function recordElectricalCalculationEvidence(): never {
  return fail("CALCULATION_EVIDENCE_NOT_IN_R3");
}

export function recordElectricalProtectionContext(): never {
  return fail("PROTECTION_GROUNDING_NOT_IN_R3");
}
