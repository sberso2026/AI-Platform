/**
 * EOS-D7-R4 Electrical feeder, cable, and rating context.
 * One bounded runtime on exact R1 identities and exact R2 and R3 revisions. Supplied context only.
 */
import {
  CABLE_CONTEXT_EQUALS_VALIDATED_CABLE_SIZING,
  D7_CURRENTNESS_STATES,
  D7_IMPLEMENTATION_PHASE_TYPES,
  D7_IMPLEMENTATION_PHASES,
  D7_MATURITY_STATES,
  FEEDER_CONTEXT_EQUALS_VALIDATED_FEEDER_DESIGN,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D7_CONTEXT_AUTHORITY,
  D7_DISCIPLINE,
  type D7R1Actor,
  type D7R1ObjectRecord,
  type D7R1Store,
} from "./identity-foundation";
import type { D7R2DistributionRecord, D7R2SourceRecord, D7R2Store, D7R2SystemRecord } from "./system-source-distribution-context";
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
  D7_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_IDENTITY_RUNTIME_COUNT,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT,
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_READY,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_R1_IDENTITY_REUSED,
  D7_R2_SYSTEM_SOURCE_DISTRIBUTION_CONTEXT_REUSED,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D7_R2_DISTRIBUTION_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D7_R2_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D7_R2_SYSTEM_REVISION_REQUIRED_WHEN_REFERENCED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  type D7R3ConsumerRecord,
  type D7R3LoadRecord,
  type D7R3Store,
  type D7R3SupplyRecord,
} from "./load-consumer-equipment-context";

export const D7_R4_STATUS = "FEEDER_CABLE_AND_RATING_CONTEXT_IMPLEMENTED" as const;
export const D7_R4_MATURITY = D7_R4_STATUS;
export const D7_R4_MATURITY_STATE = D7_R4_STATUS;
export const D7_R4_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D7_R4_FEEDER_CABLE_AND_RATING_CONTEXT_CLOSEOUT.md" as const;
export const D7_R3_RUNTIME_COUNT = R3_RUNTIME_COUNT;
export const D7_R3_LOAD_CONSUMER_EQUIPMENT_CONTEXT_REUSED = D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_READY;
export const EXACT_D7_R1_R3_REFERENCE_REQUIRED = true as const;
export const FLOATING_D7_R4_SOURCE_REFERENCE_ALLOWED = false as const;
export const D7_R4_SOURCE_AUTO_REPOINTED = false as const;
export const D7_RUNTIME_STARTED = true as const;
export const D7_RUNTIME_COUNT = 4 as const;
export const D7_FEEDER_CABLE_RATING_RUNTIME_IMPLEMENTED = true as const;
export const D7_FEEDER_CABLE_RATING_RUNTIME_COUNT = 1 as const;
export const D7_FEEDER_CABLE_RATING_RUNTIME_READY = true as const;
export const D7_CANONICAL_OBJECT_TAXONOMY_REUSED = true as const;
export const D7_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED = true as const;
export const D7_ELECTRICAL_FEEDER_CONTEXT_IMPLEMENTED = true as const;
export const FEEDER_CONTEXT_EQUALS_VALIDATED_CABLE_SELECTION = false as const;
export const FEEDER_CONTEXT_EQUALS_PROTECTION_COORDINATION = false as const;
export const D7_EXPLICIT_FEEDER_ENDPOINTS_REQUIRED = true as const;
export const D7_INFERRED_FEEDER_ENDPOINT_ALLOWED = false as const;
export const EXACT_D7_FEEDER_ENDPOINT_REVISION_REQUIRED = true as const;
export const D7_FEEDER_ENDPOINT_AUTO_REPOINTED = false as const;
export const D7_ELECTRICAL_CABLE_CONTEXT_IMPLEMENTED = true as const;
export const CABLE_CONTEXT_EQUALS_VALIDATED_AMPACITY = false as const;
export const CABLE_CONTEXT_EQUALS_VALIDATED_VOLTAGE_DROP = false as const;
export const CABLE_CONTEXT_EQUALS_SHORT_CIRCUIT_WITHSTAND_VALIDATED = false as const;
export const D7_EXPLICIT_FEEDER_CABLE_RELATIONSHIP_REQUIRED = true as const;
export const D7_INFERRED_FEEDER_CABLE_RELATIONSHIP_ALLOWED = false as const;
export const EXACT_D7_FEEDER_CABLE_RELATIONSHIP_REVISION_REQUIRED = true as const;
export const D7_FEEDER_CABLE_RELATIONSHIP_AUTO_REPOINTED = false as const;
export const D7_SUPPLIED_ELECTRICAL_RATING_SUPPORTED = true as const;
export const D7_ADOPTED_ELECTRICAL_RATING_SUPPORTED = true as const;
export const SUPPLIED_ELECTRICAL_RATING_EQUALS_ADOPTED_ELECTRICAL_RATING = false as const;
export const SUPPLIED_ELECTRICAL_RATING_AUTO_ADOPTED = false as const;
export const ADOPTED_ELECTRICAL_RATING_EQUALS_VALIDATED_RATING = false as const;
export const D7_ELECTRICAL_RATING_CONTEXT_IMPLEMENTED = true as const;
export const RATING_CONTEXT_EQUALS_ENGINEERING_CALCULATION = false as const;
export const RATING_CONTEXT_EQUALS_VALIDATED_EQUIPMENT_SELECTION = false as const;
export const RATING_CONTEXT_EQUALS_CODE_CONFORMANCE = false as const;
export const D7_R4_UNITS_REQUIRED = true as const;
export const D7_R4_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D7_R4_UNITS = false as const;
export const D7_CABLE_INSTALLATION_REFERENCE_CONTEXT_SUPPORTED = true as const;
export const INSTALLATION_REFERENCE_CONTEXT_EQUALS_VALIDATED_INSTALLATION_DESIGN = false as const;
export const INSTALLATION_CONTEXT_AUTO_DERIVES_DERATING_FACTOR = false as const;
export const D7_R4_CALCULATES_CABLE_SIZE = false as const;
export const D7_R4_DERIVES_CONDUCTOR_SIZE = false as const;
export const D7_R4_AUTO_SELECTS_CABLE = false as const;
export const D7_R4_CALCULATES_AMPACITY = false as const;
export const D7_R4_CALCULATES_CURRENT_CARRYING_CAPACITY = false as const;
export const D7_R4_CALCULATES_DERATING = false as const;
export const D7_R4_CALCULATES_VOLTAGE_DROP = false as const;
export const D7_R4_CALCULATES_SHORT_CIRCUIT_WITHSTAND = false as const;
export const D7_R4_CALCULATES_THERMAL_WITHSTAND = false as const;
export const D7_R4_SELECTS_BREAKER = false as const;
export const D7_R4_SELECTS_PROTECTION_DEVICE = false as const;
export const D7_R4_COORDINATES_CABLE_AND_PROTECTION = false as const;
export const EXACT_D7_R3_LOAD_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R3_CONSUMER_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R3_EQUIPMENT_SUPPLY_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D7_R4_AUTO_MUTATES_R3_LOAD_CONTEXT = false as const;
export const D7_R4_AUTO_MUTATES_R3_CONSUMER_CONTEXT = false as const;
export const D7_R4_AUTO_MUTATES_R3_EQUIPMENT_SUPPLY_CONTEXT = false as const;
export const D7_R4_LOAD_CONTEXT_AUTO_SIZES_FEEDER = false as const;
export const D7_R4_LOAD_CONTEXT_AUTO_SIZES_CABLE = false as const;
export const D7_R4_LOAD_CONTEXT_AUTO_SELECTS_BREAKER = false as const;
export const D7_R4_AUTO_MUTATES_R2_SYSTEM_CONTEXT = false as const;
export const D7_R4_AUTO_MUTATES_R2_SOURCE_CONTEXT = false as const;
export const D7_R4_AUTO_MUTATES_R2_DISTRIBUTION_CONTEXT = false as const;
export const D7_R4_FEEDER_CABLE_CONTEXT_AUTO_VALIDATES_SOURCE_CAPACITY = false as const;
export const D7_R4_FEEDER_CABLE_CONTEXT_AUTO_VALIDATES_DISTRIBUTION_CAPACITY = false as const;
export const EQUIPMENT_RATING_CONTEXT_EQUALS_VALIDATED_EQUIPMENT_SELECTION = false as const;
export const EQUIPMENT_RATING_CONTEXT_EQUALS_VALIDATED_SYSTEM_DESIGN = false as const;
export const D7_R4_HISTORY_PRESERVED = true as const;
export const D7_R4_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D7_R4_MUTATION_ALLOWED = false as const;
export const D7_R4_SOURCE_BASIS_REQUIRED = true as const;
export const D7_R4_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D7_R4_CONTEXT_AUTO_ACCEPTED = false as const;
export const D7_R4_APPLICABILITY_EXPLICIT = true as const;
export const D7_R4_LIMITATIONS_EXPLICIT = true as const;
export const D7_R4_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D7_R4_PROVENANCE_REQUIRED = true as const;
export const D7_R4_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D7_R4_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D7_R4_ACCESS_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_FEEDER_RELATIONSHIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_CABLE_RELATIONSHIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_RATING = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D7_R4_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D7_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R4_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D7_R4_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D7_R5_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_CABLE_SIZING_CALCULATION = false as const;
export const UNAUTHORIZED_AMPACITY_CALCULATION = false as const;
export const UNAUTHORIZED_DERATING_CALCULATION = false as const;
export const UNAUTHORIZED_VOLTAGE_DROP_CALCULATION = false as const;
export const UNAUTHORIZED_SHORT_CIRCUIT_WITHSTAND_CALCULATION = false as const;
export const UNAUTHORIZED_BREAKER_SELECTION = false as const;
export const UNAUTHORIZED_PROTECTION_COORDINATION = false as const;
export const UNAUTHORIZED_SUPPLIED_RATING_AUTO_ADOPTION = false as const;
export const UNAUTHORIZED_RATING_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_FEEDER_TO_VALIDATED_DESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_CABLE_TO_VALIDATED_DESIGN_PROMOTION = false as const;
export const D7_R4_FEEDER_ROLES = ["SOURCE_FEEDER", "DISTRIBUTION_FEEDER", "CONSUMER_FEEDER", "OTHER_CANONICAL_FEEDER_ROLE"] as const;
export const D7_R4_ENDPOINT_KINDS = ["SOURCE_ENDPOINT", "DISTRIBUTION_ENDPOINT", "SYSTEM_ENDPOINT", "LOAD_ENDPOINT", "CONSUMER_ENDPOINT", "EQUIPMENT_SUPPLY_ENDPOINT"] as const;
export const D7_R4_RELATIONSHIP_KINDS = ["FEEDER_TO_CABLE"] as const;
export const D7_R4_RATING_ROLES = ["SUPPLIED_ELECTRICAL_RATING", "ADOPTED_ELECTRICAL_RATING"] as const;
export const D7_R4_RATING_CATEGORIES = ["VOLTAGE_RATING", "CURRENT_RATING", "POWER_RATING", "FREQUENCY_RATING", "INTERRUPTING_WITHSTAND_RATING_CONTEXT", "INSULATION_SYSTEM_RATING_CONTEXT"] as const;
export const D7_R4_UNITS = ["V", "kV", "A", "kA", "W", "kW", "MW", "VA", "kVA", "MVA", "Hz", "mm2", "AWG", "kcmil"] as const;
export const D7_R4_SIZE_UNITS = ["mm2", "AWG", "kcmil"] as const;
export const D7_R4_CONDUCTOR_MATERIALS = ["COPPER", "ALUMINIUM", "CONDUCTOR_MATERIAL_UNSTATED"] as const;
export const D7_R4_INSULATION_CONTEXTS = ["XLPE", "PVC", "EPR", "INSULATION_CONTEXT_UNSTATED"] as const;
export const D7_R4_INSTALLATION_ENVIRONMENTS = ["INDOOR", "OUTDOOR", "INSTALLATION_ENVIRONMENT_UNSTATED"] as const;
export const D7_R4_ROUTING_CATEGORIES = ["TRAY", "CONDUIT", "DIRECT_BURIED", "ROUTING_REFERENCE_UNSTATED"] as const;
export const D7_R4_INSTALLATION_METHODS = ["TRAY_REFERENCE", "CONDUIT_REFERENCE", "BURIAL_REFERENCE", "INSTALLATION_METHOD_UNSTATED"] as const;
export const D7_R5_CANONICAL_PHASE = D7_IMPLEMENTATION_PHASES[4];
export const D7_R5_PHASE_TYPE = D7_IMPLEMENTATION_PHASE_TYPES[4];
export const D7_R5_CANONICAL_SCOPE =
  "Implement governed external/supplied Electrical calculation and study evidence using exact R1-R4 revisions. Support evidence packages for canonical studies such as load calculation, load flow, short circuit, motor starting, voltage drop, cable sizing/ampacity, protection coordination, arc flash, grounding, power quality, harmonics and battery/UPS sizing where repository taxonomy permits. Preserve calculation evidence != calculation performed by EOS, evidence result != adopted Electrical design, evidence != validation/conformance/approval, and keep every Electrical calculation runtime at zero." as const;
export const D7_R5_STARTED = false as const;
export const D7_R4_READY_FOR_NEXT_PHASE = true as const;
export const D7_R4_NEXT_PHASE = D7_R5_CANONICAL_PHASE;
export const D7_R4_NEXT_PHASE_TYPE = D7_R5_PHASE_TYPE;
export const D7_R4_CANONICAL_NEXT_PHASE = D7_R5_CANONICAL_PHASE;
export const D7_R4_CANONICAL_NEXT_PHASE_SCOPE = D7_R5_CANONICAL_SCOPE;
export const D7_R4_BLOCKER = "NONE" as const;
export const D7_R4_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  FEEDER_CONTEXT_EQUALS_VALIDATED_FEEDER_DESIGN,
  CABLE_CONTEXT_EQUALS_VALIDATED_CABLE_SIZING,
  D7_R1_IDENTITY_REUSED,
  D7_R2_SYSTEM_SOURCE_DISTRIBUTION_CONTEXT_REUSED,
  D7_IDENTITY_RUNTIME_COUNT,
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT,
  D7_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D7_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
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
  EXACT_D7_R2_SYSTEM_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D7_R2_SOURCE_REVISION_REQUIRED_WHEN_REFERENCED,
  EXACT_D7_R2_DISTRIBUTION_REVISION_REQUIRED_WHEN_REFERENCED,
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
const INFERRED = new Set(["matching_name", "matching_tag", "name_similarity", "tag_similarity", "equipment_number", "drawing_adjacency", "topology_proximity", "semantic_similarity", "ai_inference", "ai_reasoning", "inferred"]);
const MAGNITUDE = /^[0-9]+(\.[0-9]+)?$/;
const AWG_SIZE = /^[0-9]+(\/0)?$/;
const CATEGORY_UNITS: Record<(typeof D7_R4_RATING_CATEGORIES)[number], readonly string[]> = {
  VOLTAGE_RATING: ["V", "kV"],
  CURRENT_RATING: ["A", "kA"],
  POWER_RATING: ["W", "kW", "MW", "VA", "kVA", "MVA"],
  FREQUENCY_RATING: ["Hz"],
  INTERRUPTING_WITHSTAND_RATING_CONTEXT: ["A", "kA"],
  INSULATION_SYSTEM_RATING_CONTEXT: ["V", "kV"],
};

type Currentness = (typeof D7_CURRENTNESS_STATES)[number];
type Stage = (typeof D7_MATURITY_STATES)[number];
type RatingRole = (typeof D7_R4_RATING_ROLES)[number];
type RatingCategory = (typeof D7_R4_RATING_CATEGORIES)[number];
type EndpointKind = (typeof D7_R4_ENDPOINT_KINDS)[number];

type Prohibited = {
  calculateCableSize?: boolean;
  deriveConductorSize?: boolean;
  autoSelectCable?: boolean;
  calculateAmpacity?: boolean;
  calculateCurrentCarryingCapacity?: boolean;
  calculateDerating?: boolean;
  calculateVoltageDrop?: boolean;
  calculateShortCircuitWithstand?: boolean;
  calculateThermalWithstand?: boolean;
  selectBreaker?: boolean;
  selectProtectionDevice?: boolean;
  coordinateCableAndProtection?: boolean;
  loadFlow?: boolean;
  motorStarting?: boolean;
  grounding?: boolean;
  arcFlash?: boolean;
  harmonics?: boolean;
  batteryUps?: boolean;
  autoAdopt?: boolean;
  convertUnits?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  autoSizeFeeder?: boolean;
  autoSizeCable?: boolean;
  autoSelectBreaker?: boolean;
  validateSourceCapacity?: boolean;
  validateDistributionCapacity?: boolean;
  calculationEvidence?: boolean;
  protectionGrounding?: boolean;
  hazardousArea?: boolean;
  reviewValidation?: boolean;
  engineeringValidated?: boolean;
  d9Source?: boolean;
  inferredRelationship?: boolean;
  repoint?: boolean;
  deratingFactor?: string | null;
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

type FrozenRevision = {
  objectRevisionFingerprint?: string;
  feederObjectRevisionFingerprint?: string;
  feederRevisionFingerprint?: string;
  cableRevisionFingerprint?: string;
  targetRevisionFingerprint?: string;
};

export type D7R4FeederInput = Governed & {
  feederRecordId: string;
  feederRole: string;
  ratingRecordId?: string | null;
  ratingRevisionFingerprint?: string | null;
  predecessorFeederRecordId?: string | null;
};

export type D7R4FeederRecord = {
  feederRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "ELECTRICAL_FEEDER";
  objectRevisionFingerprint: string;
  feederRole: (typeof D7_R4_FEEDER_ROLES)[number];
  ratingRecordId: string | null;
  ratingRevisionFingerprint: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  validatedFeederDesign: false;
  validatedCableSelection: false;
  protectionCoordination: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorFeederRecordId: string | null;
};

export type D7R4EndpointInput = Prohibited & {
  endpointId: string;
  kind: string;
  contextId: string;
  feederObjectId: string;
  feederObjectRevisionFingerprint: string;
  feederRecordId: string;
  feederRevisionFingerprint: string;
  targetRecordId: string;
  targetRevisionFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string;
  predecessorEndpointId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D7R4EndpointRecord = {
  endpointId: string;
  kind: EndpointKind;
  contextId: string;
  feederObjectId: string;
  feederObjectRevisionFingerprint: string;
  feederRecordId: string;
  feederRevisionFingerprint: string;
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
  predecessorEndpointId: string | null;
};

export type D7R4CableInput = Governed & {
  cableRecordId: string;
  conductorMaterial: string;
  suppliedCoreCount: string;
  insulationContext: string;
  suppliedSizeAttribute: string;
  sizeUnit: string;
  installationEnvironment: string;
  routingCategory: string;
  installationMethod: string;
  ambientContext: string;
  associatedFeederRecordId?: string | null;
  associatedFeederRevisionFingerprint?: string | null;
  predecessorCableRecordId?: string | null;
};

export type D7R4CableRecord = {
  cableRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "ELECTRICAL_CABLE";
  objectRevisionFingerprint: string;
  conductorMaterial: (typeof D7_R4_CONDUCTOR_MATERIALS)[number];
  suppliedCoreCount: string;
  insulationContext: (typeof D7_R4_INSULATION_CONTEXTS)[number];
  suppliedSizeAttribute: string;
  sizeUnit: (typeof D7_R4_SIZE_UNITS)[number];
  sizeCalculated: false;
  installationEnvironment: (typeof D7_R4_INSTALLATION_ENVIRONMENTS)[number];
  routingCategory: (typeof D7_R4_ROUTING_CATEGORIES)[number];
  installationMethod: (typeof D7_R4_INSTALLATION_METHODS)[number];
  ambientContext: string;
  deratingFactorDerived: false;
  validatedInstallationDesign: false;
  associatedFeederRecordId: string | null;
  associatedFeederRevisionFingerprint: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  validatedCableSizing: false;
  validatedAmpacity: false;
  validatedVoltageDrop: false;
  shortCircuitWithstandValidated: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorCableRecordId: string | null;
};

export type D7R4RelationshipInput = Prohibited & {
  relationshipId: string;
  kind: string;
  contextId: string;
  feederObjectId: string;
  feederObjectRevisionFingerprint: string;
  feederRecordId: string;
  feederRevisionFingerprint: string;
  cableObjectId: string;
  cableObjectRevisionFingerprint: string;
  cableRecordId: string;
  cableRevisionFingerprint: string;
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

export type D7R4RelationshipRecord = {
  relationshipId: string;
  kind: "FEEDER_TO_CABLE";
  contextId: string;
  feederObjectId: string;
  feederObjectRevisionFingerprint: string;
  feederRecordId: string;
  feederRevisionFingerprint: string;
  cableObjectId: string;
  cableObjectRevisionFingerprint: string;
  cableRecordId: string;
  cableRevisionFingerprint: string;
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

export type D7R4RatingInput = Governed & {
  ratingRecordId: string;
  statementRole: string;
  ratingCategory: string;
  suppliedValue: string;
  unit: string;
  adoptedFromRatingRecordId?: string | null;
  adoptionRationale?: string | null;
  predecessorRatingRecordId?: string | null;
};

export type D7R4RatingRecord = {
  ratingRecordId: string;
  contextId: string;
  objectId: string;
  objectType: "ELECTRICAL_EQUIPMENT_RATING";
  objectRevisionFingerprint: string;
  statementRole: RatingRole;
  ratingCategory: RatingCategory;
  suppliedValue: string;
  unit: string;
  adopted: boolean;
  adoptedFromRatingRecordId: string | null;
  adoptedFromFingerprint: string | null;
  adoptionRationale: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D7_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  validatedRating: false;
  engineeringCalculation: false;
  validatedEquipmentSelection: false;
  validatedSystemDesign: false;
  codeConformance: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRatingRecordId: string | null;
};

export type D7R4History = {
  historyId: string;
  subjectKind: "FEEDER" | "ENDPOINT" | "CABLE" | "RELATIONSHIP" | "RATING";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D7R4Store = {
  r1: D7R1Store;
  r2: D7R2Store;
  r3: D7R3Store;
  now: () => string;
  feeders: D7R4FeederRecord[];
  endpoints: D7R4EndpointRecord[];
  cables: D7R4CableRecord[];
  relationships: D7R4RelationshipRecord[];
  ratings: D7R4RatingRecord[];
  history: D7R4History[];
};

function fail(code: string): never {
  throw new Error(`D7_R4_${code}`);
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

function allow<T extends string>(value: string, rows: readonly T[], code: string): T {
  if (!(rows as readonly string[]).includes(value)) fail(code);
  return value as T;
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
  if (input.calculateCableSize === true || input.deriveConductorSize === true || input.autoSelectCable === true) fail("CABLE_SIZING_NOT_IN_R4");
  if (input.calculateAmpacity === true || input.calculateCurrentCarryingCapacity === true || input.calculateDerating === true || input.deratingFactor != null) fail("AMPACITY_DERATING_NOT_IN_R4");
  if (input.calculateVoltageDrop === true) fail("VOLTAGE_DROP_NOT_IN_R4");
  if (input.calculateShortCircuitWithstand === true || input.calculateThermalWithstand === true) fail("WITHSTAND_NOT_IN_R4");
  if (input.selectBreaker === true || input.selectProtectionDevice === true || input.coordinateCableAndProtection === true || input.autoSelectBreaker === true) fail("PROTECTION_SELECTION_NOT_IN_R4");
  if (input.loadFlow === true || input.motorStarting === true || input.grounding === true || input.arcFlash === true || input.harmonics === true || input.batteryUps === true) fail("CALCULATION_NOT_IN_R4");
  if (input.autoAdopt === true) fail("AUTO_ADOPTION_REJECTED");
  if (input.convertUnits === true) fail("UNIT_CHANGE_REJECTED");
  if (input.mutateR2 === true) fail("R2_MUTATION_REJECTED");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.autoSizeFeeder === true || input.autoSizeCable === true) fail("LOAD_DOES_NOT_SIZE_FEEDER_OR_CABLE");
  if (input.validateSourceCapacity === true || input.validateDistributionCapacity === true) fail("CAPACITY_VALIDATION_NOT_IN_R4");
  if (input.calculationEvidence === true) fail("CALCULATION_EVIDENCE_NOT_IN_R4");
  if (input.protectionGrounding === true || input.hazardousArea === true) fail("PROTECTION_GROUNDING_NOT_IN_R4");
  if (input.reviewValidation === true || input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R4");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R4");
  if (input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
}

function remember(store: D7R4Store, subjectKind: D7R4History["subjectKind"], subjectId: string, action: D7R4History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function requireObject(store: D7R4Store, actor: D7R1Actor, contextId: string, objectId: string, revision: string, allowed: readonly string[], cited: Currentness): D7R1ObjectRecord {
  const object = store.r1.objects.find((row) => row.objectId === explicit(objectId, "R1_OBJECT_REQUIRED"));
  const context = store.r1.contexts.find((row) => row.contextId === explicit(contextId, "R1_CONTEXT_REQUIRED"));
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (!object || !allowed.includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== explicit(revision, "R1_REVISION_REQUIRED")) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== context.contextId || object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  if (cited === "SUPERSEDED" && object.recordStatus !== "SUPERSEDED") fail("R1_OBJECT_CURRENTNESS_MISMATCH");
  return object;
}

function prepare(store: D7R4Store, actor: D7R1Actor, input: Governed, allowed: readonly string[]) {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const object = requireObject(store, actor, contextId, input.objectId, input.objectRevisionFingerprint, allowed, citedCurrentness);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return {
    contextId,
    object,
    stage,
    citedCurrentness,
    applicability,
    limitations,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
  };
}

function place<T extends FrozenRevision & { fingerprint: string; tenantId: string; recordStatus: "CURRENT" | "SUPERSEDED"; currentness: "CURRENT" | "SUPERSEDED" }>(
  store: D7R4Store,
  rows: T[],
  kind: D7R4History["subjectKind"],
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
    const before = {
      objectRevisionFingerprint: predecessor.objectRevisionFingerprint,
      feederObjectRevisionFingerprint: predecessor.feederObjectRevisionFingerprint,
      feederRevisionFingerprint: predecessor.feederRevisionFingerprint,
      cableRevisionFingerprint: predecessor.cableRevisionFingerprint,
      targetRevisionFingerprint: predecessor.targetRevisionFingerprint,
    };
    const index = rows.findIndex((row) => idOf(row) === idOf(predecessor));
    rows[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    const after = rows[index];
    if (
      after.objectRevisionFingerprint !== before.objectRevisionFingerprint
      || after.feederObjectRevisionFingerprint !== before.feederObjectRevisionFingerprint
      || after.feederRevisionFingerprint !== before.feederRevisionFingerprint
      || after.cableRevisionFingerprint !== before.cableRevisionFingerprint
      || after.targetRevisionFingerprint !== before.targetRevisionFingerprint
    ) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, kind, idOf(predecessor), "SUPERSEDED", predecessor.fingerprint);
  }
  rows.push(record);
  remember(store, kind, id, "CREATED", fingerprint);
  return record;
}

function optionalPair(id: string | null | undefined, revision: string | null | undefined, code: string): { id: string; revision: string } | null {
  const hasId = id != null && id.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail(code);
  return { id: id as string, revision: revision as string };
}

function requireR2<T extends { tenantId: string; workspaceId: string; projectId: string; fingerprint: string; recordStatus: "CURRENT" | "SUPERSEDED" }>(rows: readonly T[], id: string, fingerprint: string, actor: D7R1Actor, idOf: (row: T) => string, code: string, cited: Currentness): T {
  const row = rows.find((item) => idOf(item) === explicit(id, code));
  if (!row || row.fingerprint !== explicit(fingerprint, code)) fail(code);
  if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail(code);
  return row;
}

function requireCurrent<T extends { tenantId: string; fingerprint: string; recordStatus: "CURRENT" | "SUPERSEDED" }>(rows: readonly T[], id: string, fingerprint: string, actor: D7R1Actor, idOf: (row: T) => string, code: string): T {
  const row = rows.find((item) => idOf(item) === explicit(id, code));
  if (!row || row.fingerprint !== explicit(fingerprint, code) || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT") fail(code);
  return row;
}

function sizeToken(value: string, unit: string): string {
  const token = explicit(value, "SIZE_ATTRIBUTE_REQUIRED");
  if (unit === "AWG") {
    if (!AWG_SIZE.test(token)) fail("DERIVED_CONDUCTOR_SIZE");
    return token;
  }
  if (!MAGNITUDE.test(token)) fail("DERIVED_CONDUCTOR_SIZE");
  return token;
}

export function createD7R4Store(r1: D7R1Store, r2: D7R2Store, r3: D7R3Store, now: () => string = () => "2026-10-25T00:00:00.000Z"): D7R4Store {
  if (r2.r1 !== r1 || r3.r1 !== r1 || r3.r2 !== r2) fail("R1_R3_STORE_MISMATCH");
  return { r1, r2, r3, now, feeders: [], endpoints: [], cables: [], relationships: [], ratings: [], history: [] };
}

export function recordElectricalRatingContext(store: D7R4Store, actor: D7R1Actor, input: D7R4RatingInput): D7R4RatingRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_EQUIPMENT_RATING"]);
  const ratingRecordId = explicit(input.ratingRecordId, "RATING_CONTEXT_REQUIRED");
  const statementRole = allow(explicit(input.statementRole, "RATING_ROLE_REQUIRED"), D7_R4_RATING_ROLES, "RATING_ROLE_NOT_ALLOWLISTED");
  const ratingCategory = allow(explicit(input.ratingCategory, "RATING_CATEGORY_REQUIRED"), D7_R4_RATING_CATEGORIES, "RATING_CATEGORY_NOT_ALLOWLISTED");
  const suppliedValue = explicit(input.suppliedValue, "RATING_VALUE_REQUIRED");
  if (!MAGNITUDE.test(suppliedValue)) fail("RATING_CALCULATION_NOT_IN_R4");
  const unit = explicit(input.unit, "UNIT_REQUIRED");
  if (!CATEGORY_UNITS[ratingCategory].includes(unit)) fail("UNIT_NOT_PRESERVED");
  const adoptedFrom = input.adoptedFromRatingRecordId ? store.ratings.find((row) => row.ratingRecordId === input.adoptedFromRatingRecordId) : null;
  if (statementRole === "SUPPLIED_ELECTRICAL_RATING" && input.adoptedFromRatingRecordId) fail("SUPPLIED_RATING_AUTO_ADOPTED");
  if (statementRole === "ADOPTED_ELECTRICAL_RATING") {
    const rationale = input.adoptionRationale ? explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED") : "";
    if (!adoptedFrom || !rationale || adoptedFrom.statementRole !== "SUPPLIED_ELECTRICAL_RATING" || adoptedFrom.recordStatus !== "CURRENT" || adoptedFrom.tenantId !== actor.tenantId || adoptedFrom.ratingCategory !== ratingCategory || adoptedFrom.objectId !== prepared.object.objectId || adoptedFrom.unit !== unit) fail("ADOPTION_REQUIRED");
  }
  const predecessor = input.predecessorRatingRecordId ? store.ratings.find((row) => row.ratingRecordId === input.predecessorRatingRecordId) : null;
  if (input.predecessorRatingRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    ratingRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    statementRole,
    ratingCategory,
    suppliedValue,
    unit,
    adoptedFromRatingRecordId: adoptedFrom?.ratingRecordId ?? null,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.ratings.find((row) => row.recordStatus === "CURRENT" && row.ratingRecordId !== predecessor?.ratingRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.ratingCategory === ratingCategory && row.statementRole === statementRole);
  const record: D7R4RatingRecord = Object.freeze({
    ratingRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: "ELECTRICAL_EQUIPMENT_RATING",
    objectRevisionFingerprint: prepared.object.fingerprint,
    statementRole,
    ratingCategory,
    suppliedValue,
    unit,
    adopted: statementRole === "ADOPTED_ELECTRICAL_RATING",
    adoptedFromRatingRecordId: adoptedFrom?.ratingRecordId ?? null,
    adoptedFromFingerprint: adoptedFrom?.fingerprint ?? null,
    adoptionRationale: statementRole === "ADOPTED_ELECTRICAL_RATING" ? explicit(input.adoptionRationale ?? "", "ADOPTION_RATIONALE_REQUIRED") : null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D7_CONTEXT_AUTHORITY,
    validatedRating: false,
    engineeringCalculation: false,
    validatedEquipmentSelection: false,
    validatedSystemDesign: false,
    codeConformance: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRatingRecordId: predecessor?.ratingRecordId ?? null,
  });
  return place(store, store.ratings, "RATING", ratingRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.ratingRecordId, duplicate, "DUPLICATE_RATING_REJECTED", record);
}

export function recordElectricalFeederContext(store: D7R4Store, actor: D7R1Actor, input: D7R4FeederInput): D7R4FeederRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_FEEDER"]);
  const feederRecordId = explicit(input.feederRecordId, "FEEDER_CONTEXT_REQUIRED");
  const feederRole = allow(explicit(input.feederRole, "FEEDER_ROLE_REQUIRED"), D7_R4_FEEDER_ROLES, "FEEDER_ROLE_NOT_ALLOWLISTED");
  const ratingPair = optionalPair(input.ratingRecordId, input.ratingRevisionFingerprint, "RATING_REVISION_REQUIRED");
  const rating = ratingPair ? requireCurrent(store.ratings, ratingPair.id, ratingPair.revision, actor, (row) => row.ratingRecordId, "RATING_REVISION_MISMATCH") : null;
  const predecessor = input.predecessorFeederRecordId ? store.feeders.find((row) => row.feederRecordId === input.predecessorFeederRecordId) : null;
  if (input.predecessorFeederRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const before = rating?.fingerprint ?? null;
  const fingerprint = fingerprintCanonical({
    feederRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    feederRole,
    ratingRecordId: rating?.ratingRecordId ?? null,
    ratingRevisionFingerprint: rating?.fingerprint ?? null,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
  });
  if ((rating?.fingerprint ?? null) !== before) fail("RATING_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.feeders.find((row) => row.recordStatus === "CURRENT" && row.feederRecordId !== predecessor?.feederRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.feederRole === feederRole);
  const record: D7R4FeederRecord = Object.freeze({
    feederRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: "ELECTRICAL_FEEDER",
    objectRevisionFingerprint: prepared.object.fingerprint,
    feederRole,
    ratingRecordId: rating?.ratingRecordId ?? null,
    ratingRevisionFingerprint: rating?.fingerprint ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D7_CONTEXT_AUTHORITY,
    validatedFeederDesign: false,
    validatedCableSelection: false,
    protectionCoordination: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorFeederRecordId: predecessor?.feederRecordId ?? null,
  });
  return place(store, store.feeders, "FEEDER", feederRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.feederRecordId, duplicate, "DUPLICATE_FEEDER_REJECTED", record);
}

function resolveEndpoint(store: D7R4Store, actor: D7R1Actor, kind: EndpointKind, targetId: string, targetRevision: string, cited: Currentness): { recordId: string; fingerprint: string } {
  if (kind === "SOURCE_ENDPOINT") {
    const row: D7R2SourceRecord = requireR2(store.r2.sources, targetId, targetRevision, actor, (item) => item.sourceRecordId, "R2_SOURCE_REVISION_MISMATCH", cited);
    return { recordId: row.sourceRecordId, fingerprint: row.fingerprint };
  }
  if (kind === "DISTRIBUTION_ENDPOINT") {
    const row: D7R2DistributionRecord = requireR2(store.r2.distributions, targetId, targetRevision, actor, (item) => item.distributionRecordId, "R2_DISTRIBUTION_REVISION_MISMATCH", cited);
    return { recordId: row.distributionRecordId, fingerprint: row.fingerprint };
  }
  if (kind === "SYSTEM_ENDPOINT") {
    const row: D7R2SystemRecord = requireR2(store.r2.systems, targetId, targetRevision, actor, (item) => item.systemRecordId, "R2_SYSTEM_REVISION_MISMATCH", cited);
    return { recordId: row.systemRecordId, fingerprint: row.fingerprint };
  }
  if (kind === "LOAD_ENDPOINT") {
    const row: D7R3LoadRecord = requireCurrent(store.r3.loads, targetId, targetRevision, actor, (item) => item.loadRecordId, "R3_LOAD_REVISION_MISMATCH");
    return { recordId: row.loadRecordId, fingerprint: row.fingerprint };
  }
  if (kind === "CONSUMER_ENDPOINT") {
    const row: D7R3ConsumerRecord = requireCurrent(store.r3.consumers, targetId, targetRevision, actor, (item) => item.consumerRecordId, "R3_CONSUMER_REVISION_MISMATCH");
    return { recordId: row.consumerRecordId, fingerprint: row.fingerprint };
  }
  const row: D7R3SupplyRecord = requireCurrent(store.r3.supplies, targetId, targetRevision, actor, (item) => item.supplyRecordId, "R3_EQUIPMENT_SUPPLY_REVISION_MISMATCH");
  return { recordId: row.supplyRecordId, fingerprint: row.fingerprint };
}

export function recordElectricalFeederEndpoint(store: D7R4Store, actor: D7R1Actor, input: D7R4EndpointInput): D7R4EndpointRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const endpointId = explicit(input.endpointId, "ENDPOINT_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  const kind = allow(kindToken, D7_R4_ENDPOINT_KINDS, "ENDPOINT_KIND_NOT_EXPLICIT");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const feederObject = requireObject(store, actor, contextId, input.feederObjectId, input.feederObjectRevisionFingerprint, ["ELECTRICAL_FEEDER"], citedCurrentness);
  const feeder = requireCurrent(store.feeders, input.feederRecordId, input.feederRevisionFingerprint, actor, (row) => row.feederRecordId, "FEEDER_REVISION_MISMATCH");
  if (feeder.objectId !== feederObject.objectId || feeder.objectRevisionFingerprint !== feederObject.fingerprint) fail("FEEDER_REVISION_MISMATCH");
  const beforeFeeder = feeder.fingerprint;
  const target = resolveEndpoint(store, actor, kind, input.targetRecordId, input.targetRevisionFingerprint, citedCurrentness);
  if (feeder.fingerprint !== beforeFeeder || target.fingerprint !== explicit(input.targetRevisionFingerprint, "ENDPOINT_REVISION_REQUIRED")) fail("R2_R3_MUTATION_REJECTED");
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(feederObject.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const predecessor = input.predecessorEndpointId ? store.endpoints.find((row) => row.endpointId === input.predecessorEndpointId) : null;
  if (input.predecessorEndpointId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.kind !== kind || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    endpointId,
    kind,
    feederObjectId: feederObject.objectId,
    feederObjectRevisionFingerprint: feederObject.fingerprint,
    feederRecordId: feeder.feederRecordId,
    feederRevisionFingerprint: feeder.fingerprint,
    targetRecordId: target.recordId,
    targetRevisionFingerprint: target.fingerprint,
    applicability,
    limitations,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    citedLifecycleStage: stage,
    citedCurrentness,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.endpoints.find((row) => row.recordStatus === "CURRENT" && row.endpointId !== predecessor?.endpointId && row.kind === kind && row.feederRevisionFingerprint === feeder.fingerprint && row.targetRevisionFingerprint === target.fingerprint);
  const record: D7R4EndpointRecord = Object.freeze({
    endpointId,
    kind,
    contextId,
    feederObjectId: feederObject.objectId,
    feederObjectRevisionFingerprint: feederObject.fingerprint,
    feederRecordId: feeder.feederRecordId,
    feederRevisionFingerprint: feeder.fingerprint,
    targetRecordId: target.recordId,
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
    limitations,
    authority: D7_CONTEXT_AUTHORITY,
    inferred: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorEndpointId: predecessor?.endpointId ?? null,
  });
  return place(store, store.endpoints, "ENDPOINT", endpointId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.endpointId, duplicate, "DUPLICATE_ENDPOINT_REJECTED", record);
}

export function recordElectricalCableContext(store: D7R4Store, actor: D7R1Actor, input: D7R4CableInput): D7R4CableRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_CABLE"]);
  const cableRecordId = explicit(input.cableRecordId, "CABLE_CONTEXT_REQUIRED");
  const conductorMaterial = allow(explicit(input.conductorMaterial, "CONDUCTOR_MATERIAL_REQUIRED"), D7_R4_CONDUCTOR_MATERIALS, "CONDUCTOR_MATERIAL_NOT_ALLOWLISTED");
  const suppliedCoreCount = explicit(input.suppliedCoreCount, "CORE_COUNT_REQUIRED");
  if (!/^[0-9]+$/.test(suppliedCoreCount)) fail("DERIVED_CONDUCTOR_SIZE");
  const insulationContext = allow(explicit(input.insulationContext, "INSULATION_CONTEXT_REQUIRED"), D7_R4_INSULATION_CONTEXTS, "INSULATION_CONTEXT_NOT_ALLOWLISTED");
  const sizeUnit = allow(explicit(input.sizeUnit, "UNIT_REQUIRED"), D7_R4_SIZE_UNITS, "UNIT_NOT_PRESERVED");
  const suppliedSizeAttribute = sizeToken(input.suppliedSizeAttribute, sizeUnit);
  const installationEnvironment = allow(explicit(input.installationEnvironment, "INSTALLATION_ENVIRONMENT_REQUIRED"), D7_R4_INSTALLATION_ENVIRONMENTS, "INSTALLATION_ENVIRONMENT_NOT_ALLOWLISTED");
  const routingCategory = allow(explicit(input.routingCategory, "ROUTING_CATEGORY_REQUIRED"), D7_R4_ROUTING_CATEGORIES, "ROUTING_CATEGORY_NOT_ALLOWLISTED");
  const installationMethod = allow(explicit(input.installationMethod, "INSTALLATION_METHOD_REQUIRED"), D7_R4_INSTALLATION_METHODS, "INSTALLATION_METHOD_NOT_ALLOWLISTED");
  const ambientContext = explicit(input.ambientContext, "AMBIENT_CONTEXT_REQUIRED");
  const feederPair = optionalPair(input.associatedFeederRecordId, input.associatedFeederRevisionFingerprint, "FEEDER_REVISION_REQUIRED");
  const feeder = feederPair ? requireCurrent(store.feeders, feederPair.id, feederPair.revision, actor, (row) => row.feederRecordId, "FEEDER_REVISION_MISMATCH") : null;
  const beforeFeeder = feeder?.fingerprint ?? null;
  const predecessor = input.predecessorCableRecordId ? store.cables.find((row) => row.cableRecordId === input.predecessorCableRecordId) : null;
  if (input.predecessorCableRecordId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    cableRecordId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    conductorMaterial,
    suppliedCoreCount,
    insulationContext,
    suppliedSizeAttribute,
    sizeUnit,
    installationEnvironment,
    routingCategory,
    installationMethod,
    ambientContext,
    associatedFeederRecordId: feeder?.feederRecordId ?? null,
    associatedFeederRevisionFingerprint: feeder?.fingerprint ?? null,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
  });
  if ((feeder?.fingerprint ?? null) !== beforeFeeder) fail("R3_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.cables.find((row) => row.recordStatus === "CURRENT" && row.cableRecordId !== predecessor?.cableRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint);
  const record: D7R4CableRecord = Object.freeze({
    cableRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectType: "ELECTRICAL_CABLE",
    objectRevisionFingerprint: prepared.object.fingerprint,
    conductorMaterial,
    suppliedCoreCount,
    insulationContext,
    suppliedSizeAttribute,
    sizeUnit,
    sizeCalculated: false,
    installationEnvironment,
    routingCategory,
    installationMethod,
    ambientContext,
    deratingFactorDerived: false,
    validatedInstallationDesign: false,
    associatedFeederRecordId: feeder?.feederRecordId ?? null,
    associatedFeederRevisionFingerprint: feeder?.fingerprint ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D7_CONTEXT_AUTHORITY,
    validatedCableSizing: false,
    validatedAmpacity: false,
    validatedVoltageDrop: false,
    shortCircuitWithstandValidated: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorCableRecordId: predecessor?.cableRecordId ?? null,
  });
  return place(store, store.cables, "CABLE", cableRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.cableRecordId, duplicate, "DUPLICATE_CABLE_REJECTED", record);
}

export function recordElectricalFeederCableRelationship(store: D7R4Store, actor: D7R1Actor, input: D7R4RelationshipInput): D7R4RelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const relationshipId = explicit(input.relationshipId, "RELATIONSHIP_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (kindToken !== "FEEDER_TO_CABLE") fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const feederObject = requireObject(store, actor, contextId, input.feederObjectId, input.feederObjectRevisionFingerprint, ["ELECTRICAL_FEEDER"], citedCurrentness);
  const cableObject = requireObject(store, actor, contextId, input.cableObjectId, input.cableObjectRevisionFingerprint, ["ELECTRICAL_CABLE"], citedCurrentness);
  const feeder = requireCurrent(store.feeders, input.feederRecordId, input.feederRevisionFingerprint, actor, (row) => row.feederRecordId, "FEEDER_REVISION_MISMATCH");
  const cable = requireCurrent(store.cables, input.cableRecordId, input.cableRevisionFingerprint, actor, (row) => row.cableRecordId, "CABLE_REVISION_MISMATCH");
  if (feeder.objectId !== feederObject.objectId || feeder.objectRevisionFingerprint !== feederObject.fingerprint) fail("FEEDER_REVISION_MISMATCH");
  if (cable.objectId !== cableObject.objectId || cable.objectRevisionFingerprint !== cableObject.fingerprint) fail("CABLE_REVISION_MISMATCH");
  const beforeFeeder = feeder.fingerprint;
  const beforeCable = cable.fingerprint;
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(feederObject.objectId) || !applicability.includes(cableObject.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (feeder.fingerprint !== beforeFeeder || cable.fingerprint !== beforeCable) fail("R2_R3_MUTATION_REJECTED");
  const predecessor = input.predecessorRelationshipId ? store.relationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind: "FEEDER_TO_CABLE",
    feederObjectId: feederObject.objectId,
    feederObjectRevisionFingerprint: feederObject.fingerprint,
    feederRecordId: feeder.feederRecordId,
    feederRevisionFingerprint: feeder.fingerprint,
    cableObjectId: cableObject.objectId,
    cableObjectRevisionFingerprint: cableObject.fingerprint,
    cableRecordId: cable.cableRecordId,
    cableRevisionFingerprint: cable.fingerprint,
    applicability,
    limitations,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    citedLifecycleStage: stage,
    citedCurrentness,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.relationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.feederRevisionFingerprint === feeder.fingerprint && row.cableRevisionFingerprint === cable.fingerprint);
  const record: D7R4RelationshipRecord = Object.freeze({
    relationshipId,
    kind: "FEEDER_TO_CABLE",
    contextId,
    feederObjectId: feederObject.objectId,
    feederObjectRevisionFingerprint: feederObject.fingerprint,
    feederRecordId: feeder.feederRecordId,
    feederRevisionFingerprint: feeder.fingerprint,
    cableObjectId: cableObject.objectId,
    cableObjectRevisionFingerprint: cableObject.fingerprint,
    cableRecordId: cable.cableRecordId,
    cableRevisionFingerprint: cable.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: stage,
    citedCurrentness,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability,
    limitations,
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

export function reconstructElectricalFeeder(store: D7R4Store, feederRecordId: string): D7R4FeederRecord {
  const record = store.feeders.find((row) => row.feederRecordId === feederRecordId);
  if (!record) fail("FEEDER_NOT_FOUND");
  return record;
}

export function repointElectricalFeederContext(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function calculateElectricalCableSize(): never {
  return fail("CABLE_SIZING_NOT_IN_R4");
}

export function deriveInstallationDerating(): never {
  return fail("AMPACITY_DERATING_NOT_IN_R4");
}

export function recordElectricalCalculationEvidence(): never {
  return fail("CALCULATION_EVIDENCE_NOT_IN_R4");
}

export function recordElectricalProtectionContext(): never {
  return fail("PROTECTION_GROUNDING_NOT_IN_R4");
}
