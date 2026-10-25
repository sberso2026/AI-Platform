/**
 * EOS-D7-R2 Electrical system, source, and distribution context.
 * One bounded runtime on exact R1 identity revisions. Context and explicit relationships only.
 */
import {
  D7_CURRENTNESS_STATES,
  D7_DISTRIBUTION_EQUIPMENT_CLASSES,
  D7_IMPLEMENTATION_PHASE_TYPES,
  D7_IMPLEMENTATION_PHASES,
  D7_MATURITY_STATES,
  D7_POWER_SOURCE_CLASSES,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  ADMIN_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
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
  D7_CONTEXT_AUTHORITY,
  D7_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_DISCIPLINE,
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
  D7_IDENTITY_RUNTIME_READY as R1_IDENTITY_READY,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT,
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
  D7_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
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
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  type D7R1Actor,
  type D7R1ObjectRecord,
  type D7R1Store,
} from "./identity-foundation";

export const D7_R2_STATUS = "ELECTRICAL_SYSTEM_SOURCE_AND_DISTRIBUTION_CONTEXT_IMPLEMENTED" as const;
export const D7_R2_MATURITY = D7_R2_STATUS;
export const D7_R2_MATURITY_STATE = D7_R2_STATUS;
export const D7_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D7_R2_ELECTRICAL_SYSTEM_SOURCE_AND_DISTRIBUTION_CONTEXT_CLOSEOUT.md" as const;
export const D7_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const EXACT_D7_R1_IDENTITY_REVISION_REQUIRED = true as const;
export const FLOATING_D7_R2_SOURCE_REFERENCE_ALLOWED = false as const;
export const D7_R2_SOURCE_AUTO_REPOINTED = false as const;
export const D7_RUNTIME_STARTED = true as const;
export const D7_RUNTIME_COUNT = 2 as const;
export const D7_R1_RUNTIME_COUNT = R1_RUNTIME_COUNT;
export const D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_IMPLEMENTED = true as const;
export const D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_COUNT = 1 as const;
export const D7_SYSTEM_SOURCE_DISTRIBUTION_RUNTIME_READY = true as const;
export const D7_CANONICAL_OBJECT_TAXONOMY_REUSED = true as const;
export const D7_AUTHORITATIVE_OBJECT_TYPES_ALLOWLIST_ENFORCED = true as const;
export const D7_ELECTRICAL_SYSTEM_CONTEXT_IMPLEMENTED = true as const;
export const ELECTRICAL_SYSTEM_CONTEXT_EQUALS_VALIDATED_ELECTRICAL_DESIGN = false as const;
export const ELECTRICAL_SYSTEM_CONTEXT_EQUALS_LOAD_FLOW_MODEL = false as const;
export const ELECTRICAL_SYSTEM_CONTEXT_EQUALS_CODE_CONFORMANCE = false as const;
export const D7_ELECTRICAL_SOURCE_CONTEXT_IMPLEMENTED = true as const;
export const ELECTRICAL_SOURCE_CONTEXT_EQUALS_VALIDATED_SOURCE_CAPACITY = false as const;
export const ELECTRICAL_SOURCE_CONTEXT_EQUALS_GENERATOR_SIZING = false as const;
export const ELECTRICAL_SOURCE_CONTEXT_EQUALS_TRANSFORMER_SIZING = false as const;
export const D7_ELECTRICAL_DISTRIBUTION_CONTEXT_IMPLEMENTED = true as const;
export const DISTRIBUTION_CONTEXT_EQUALS_VALIDATED_NETWORK_DESIGN = false as const;
export const DISTRIBUTION_CONTEXT_EQUALS_LOAD_FLOW_VALIDATED = false as const;
export const DISTRIBUTION_CONTEXT_EQUALS_SHORT_CIRCUIT_VALIDATED = false as const;
export const D7_EXPLICIT_SYSTEM_SOURCE_RELATIONSHIP_REQUIRED = true as const;
export const D7_INFERRED_SYSTEM_SOURCE_RELATIONSHIP_ALLOWED = false as const;
export const D7_EXPLICIT_DISTRIBUTION_RELATIONSHIP_REQUIRED = true as const;
export const D7_INFERRED_DISTRIBUTION_RELATIONSHIP_ALLOWED = false as const;
export const EXACT_D7_R2_RELATIONSHIP_ENDPOINT_REVISION_REQUIRED = true as const;
export const D7_R2_RELATIONSHIP_ENDPOINT_AUTO_REPOINTED = false as const;
export const ELECTRICAL_SOURCE_PRESENT_EQUALS_CAPACITY_VALIDATED = false as const;
export const ELECTRICAL_GENERATOR_IDENTITY_EQUALS_GENERATOR_CAPACITY_VALIDATED = false as const;
export const ELECTRICAL_TRANSFORMER_IDENTITY_EQUALS_TRANSFORMER_CAPACITY_VALIDATED = false as const;
export const D7_BUS_CONTEXT_SUPPORTED = (D7_DISTRIBUTION_EQUIPMENT_CLASSES as readonly string[]).includes("BUS");
export const BUS_CONTEXT_EQUALS_VALIDATED_BUS_RATING = false as const;
export const BUS_CONTEXT_EQUALS_SHORT_CIRCUIT_WITHSTAND_VALIDATED = false as const;
export const D7_SWITCHBOARD_SWITCHGEAR_CONTEXT_SUPPORTED =
  (D7_DISTRIBUTION_EQUIPMENT_CLASSES as readonly string[]).includes("SWITCHBOARD") &&
  (D7_DISTRIBUTION_EQUIPMENT_CLASSES as readonly string[]).includes("SWITCHGEAR");
export const SWITCHBOARD_CONTEXT_EQUALS_VALIDATED_SWITCHBOARD_DESIGN = false as const;
export const SWITCHGEAR_CONTEXT_EQUALS_VALIDATED_SWITCHGEAR_RATING = false as const;
export const D7_TRANSFORMER_CONTEXT_SUPPORTED = (D7_DISTRIBUTION_EQUIPMENT_CLASSES as readonly string[]).includes("TRANSFORMER");
export const TRANSFORMER_CONTEXT_EQUALS_VALIDATED_TRANSFORMER_SIZING = false as const;
export const TRANSFORMER_CONTEXT_EQUALS_VALIDATED_IMPEDANCE_MODEL = false as const;
export const D7_GENERATOR_CONTEXT_SUPPORTED =
  (D7_DISTRIBUTION_EQUIPMENT_CLASSES as readonly string[]).includes("GENERATOR") &&
  (D7_POWER_SOURCE_CLASSES as readonly string[]).includes("ONSITE_GENERATION");
export const GENERATOR_CONTEXT_EQUALS_VALIDATED_GENERATOR_SIZING = false as const;
export const GENERATOR_CONTEXT_EQUALS_VALIDATED_GENERATOR_PERFORMANCE = false as const;
export const D7_DISTRIBUTION_HIERARCHY_EQUALS_LOAD_FLOW_RESULT = false as const;
export const D7_DISTRIBUTION_HIERARCHY_EQUALS_ENERGIZED_STATE = false as const;
export const D7_DISTRIBUTION_HIERARCHY_EQUALS_OPERABILITY_VALIDATED = false as const;
export const D7_R2_SOURCE_BASIS_REQUIRED = true as const;
export const D7_R2_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D7_R2_CONTEXT_AUTO_ACCEPTED = false as const;
export const D7_R2_APPLICABILITY_EXPLICIT = true as const;
export const D7_R2_LIMITATIONS_EXPLICIT = true as const;
export const D7_R2_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D7_R2_PROVENANCE_REQUIRED = true as const;
export const D7_R2_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D7_R2_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D7_R2_ACCESS_ALLOWED = false as const;
export const D7_R2_HISTORY_PRESERVED = true as const;
export const D7_R2_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D7_R2_MUTATION_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_SYSTEM_RELATIONSHIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_SOURCE_RELATIONSHIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_DISTRIBUTION_RELATIONSHIP = false as const;
export const ADMIN_CAN_PROMOTE_UNGOVERNED_D7_R2_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D7_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R2_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D7_R2_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D7_R3_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_LOAD_CONTEXT_PROMOTION = false as const;
export const UNAUTHORIZED_FEEDER_CABLE_PROMOTION = false as const;
export const UNAUTHORIZED_CALCULATION_EVIDENCE_PROMOTION = false as const;
export const UNAUTHORIZED_PROTECTION_GROUNDING_PROMOTION = false as const;
export const UNAUTHORIZED_ELECTRICAL_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_ELECTRICAL_DESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_ELECTRICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_INFERRED_SYSTEM_SOURCE_RELATIONSHIP = false as const;
export const UNAUTHORIZED_INFERRED_DISTRIBUTION_RELATIONSHIP = false as const;
export const UNAUTHORIZED_HISTORICAL_AUTO_REPOINT = false as const;
export const D7_R2_SYSTEM_ROLES = ["DISTRIBUTION_SYSTEM", "GENERATION_SYSTEM", "EMERGENCY_SYSTEM", "UTILITY_POWER_SYSTEM", "OTHER_ELECTRICAL_SYSTEM"] as const;
export const D7_R2_NOMINAL_CLASSIFICATIONS = ["NOMINAL_CLASS_UNSTATED", "LOW_VOLTAGE_CLASS", "MEDIUM_VOLTAGE_CLASS", "HIGH_VOLTAGE_CLASS", "DC_CLASS"] as const;
export const D7_R2_SOURCE_ROLES = ["UTILITY_GRID", "GENERATOR_SOURCE", "TRANSFORMER_FED_SOURCE", "ALTERNATE_SOURCE", "EMERGENCY_SOURCE", "UPS_OR_DC_SOURCE", "OTHER_CANONICAL_SOURCE"] as const;
export const D7_R2_HIERARCHY_ROLES = ["SUPPLY_NODE", "DISTRIBUTION_NODE", "BUS_NODE"] as const;
export const D7_R2_RELATIONSHIP_KINDS = ["SOURCE_TO_SYSTEM", "SYSTEM_TO_BUS", "BUS_TO_DISTRIBUTION", "SOURCE_HIERARCHY", "DISTRIBUTION_HIERARCHY"] as const;
export const D7_R3_CANONICAL_PHASE = D7_IMPLEMENTATION_PHASES[2];
export const D7_R3_PHASE_TYPE = D7_IMPLEMENTATION_PHASE_TYPES[2];
export const D7_R3_CANONICAL_SCOPE =
  "Implement governed Electrical load, consumer and Electrical-equipment context using exact R1 identities and R2 system/source/distribution revisions. Support explicitly supplied and adopted Electrical load requirements, consumer relationships, equipment supply context and case/applicability information while preserving source requirement != adopted Electrical load, Mechanical/Process requirement != Electrical design, and load context != load calculation. Do not calculate connected/demand/diversified load, perform load flow, size/select equipment, implement feeder/cable design, protection/grounding/hazardous-area engineering, validation, D9 runtime or cross-discipline reasoning." as const;
export const D7_R3_STARTED = false as const;
export const D7_R2_READY_FOR_NEXT_PHASE = true as const;
export const D7_R2_NEXT_PHASE = D7_R3_CANONICAL_PHASE;
export const D7_R2_NEXT_PHASE_TYPE = D7_R3_PHASE_TYPE;
export const D7_R2_CANONICAL_NEXT_PHASE = D7_R3_CANONICAL_PHASE;
export const D7_R2_CANONICAL_NEXT_PHASE_SCOPE = D7_R3_CANONICAL_SCOPE;
export const D7_R2_BLOCKER = "NONE" as const;
export const D7_R2_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D7_IDENTITY_RUNTIME_COUNT,
  D7_FREEFORM_AUTHORITATIVE_OBJECT_TYPE_ALLOWED,
  D7_UNKNOWN_AUTHORITATIVE_OBJECT_TYPE_AUTO_ACCEPTED,
  D7_LOAD_CONSUMER_EQUIPMENT_RUNTIME_COUNT,
  D7_FEEDER_CABLE_RATING_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
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
  D6_PROCESS_REQUIREMENT_EQUALS_D7_ELECTRICAL_DESIGN,
  D6_POWER_LOAD_REQUIREMENT_EQUALS_VALIDATED_D7_LOAD,
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D7_PROTECTION_OR_CONTROL_DESIGN,
  MECHANICAL_EQUIPMENT_DUTY_EQUALS_ELECTRICAL_MOTOR_DESIGN,
  MECHANICAL_EQUIPMENT_SELECTION_EQUALS_VALIDATED_ELECTRICAL_SUPPLY_DESIGN,
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
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set([
  "matching_name",
  "matching_tag",
  "name_similarity",
  "tag_similarity",
  "voltage_label",
  "common_document",
  "document_adjacency",
  "document_reference",
  "proximity",
  "physical_proximity",
  "same_area",
  "same_project_area",
  "same_system_name",
  "semantic_similarity",
  "timestamp",
  "ai_inference",
  "ai_reasoning",
  "inferred",
]);

type Currentness = (typeof D7_CURRENTNESS_STATES)[number];
type Stage = (typeof D7_MATURITY_STATES)[number];

type Prohibited = {
  connectedLoad?: boolean;
  demandLoad?: boolean;
  diversifiedLoad?: boolean;
  operatingLoad?: boolean;
  consumerDuty?: boolean;
  motorLoad?: boolean;
  processLoadAdopted?: boolean;
  mechanicalDemand?: boolean;
  feederDesign?: boolean;
  cableSelection?: boolean;
  cableSize?: boolean;
  conductorSize?: boolean;
  ampacity?: boolean;
  voltageDrop?: boolean;
  installationMethod?: boolean;
  breakerCoordination?: boolean;
  calculationEvidence?: boolean;
  loadFlow?: boolean;
  shortCircuit?: boolean;
  protectionSetting?: boolean;
  groundingDesign?: boolean;
  hazardousAreaSuitability?: boolean;
  arcFlash?: boolean;
  capacityValidated?: boolean;
  generatorSizing?: boolean;
  transformerSizing?: boolean;
  busRating?: boolean;
  switchboardDesign?: boolean;
  switchgearRating?: boolean;
  impedanceModel?: boolean;
  generatorPerformance?: boolean;
  energized?: boolean;
  operabilityValidated?: boolean;
  networkDesignValidated?: boolean;
  requirementChange?: boolean;
  disciplineInterface?: boolean;
  reviewValidation?: boolean;
  d9Source?: boolean;
  engineeringValidated?: boolean;
  codeConformance?: boolean;
  approved?: boolean;
  certified?: boolean;
  automaticDesign?: boolean;
  inferredRelationship?: boolean;
  propagate?: boolean;
  advanceMaturity?: boolean;
  repoint?: boolean;
};

export type D7R2BoundInput = Prohibited & {
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
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D7_CONTEXT_AUTHORITY;
  electricalEngineeringAuthority: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
};

export type D7R2SystemInput = D7R2BoundInput & {
  systemRecordId: string;
  systemRole: string;
  nominalClassification: string;
  predecessorSystemRecordId?: string | null;
};

export type D7R2SystemRecord = Truth & {
  systemRecordId: string;
  systemRole: (typeof D7_R2_SYSTEM_ROLES)[number];
  nominalClassification: (typeof D7_R2_NOMINAL_CLASSIFICATIONS)[number];
  validatedElectricalDesign: false;
  loadFlowModel: false;
  predecessorSystemRecordId: string | null;
};

export type D7R2SourceInput = D7R2BoundInput & {
  sourceRecordId: string;
  sourceClass: string;
  sourceRole: string;
  predecessorSourceRecordId?: string | null;
};

export type D7R2SourceRecord = Truth & {
  sourceRecordId: string;
  sourceClass: (typeof D7_POWER_SOURCE_CLASSES)[number];
  sourceRole: (typeof D7_R2_SOURCE_ROLES)[number];
  capacityValidated: false;
  generatorSizing: false;
  transformerSizing: false;
  predecessorSourceRecordId: string | null;
};

export type D7R2DistributionInput = D7R2BoundInput & {
  distributionRecordId: string;
  equipmentClass: string;
  hierarchyRole: string;
  predecessorDistributionRecordId?: string | null;
};

export type D7R2DistributionRecord = Truth & {
  distributionRecordId: string;
  equipmentClass: (typeof D7_DISTRIBUTION_EQUIPMENT_CLASSES)[number];
  hierarchyRole: (typeof D7_R2_HIERARCHY_ROLES)[number];
  networkDesignValidated: false;
  loadFlowValidated: false;
  shortCircuitValidated: false;
  busRatingValidated: false;
  shortCircuitWithstandValidated: false;
  switchboardDesignValidated: false;
  switchgearRatingValidated: false;
  transformerSizingValidated: false;
  impedanceModelValidated: false;
  generatorSizingValidated: false;
  generatorPerformanceValidated: false;
  predecessorDistributionRecordId: string | null;
};

export type D7R2RelationshipInput = Prohibited & {
  relationshipId: string;
  kind: string;
  contextId: string;
  fromObjectId: string;
  fromObjectRevisionFingerprint: string;
  toObjectId: string;
  toObjectRevisionFingerprint: string;
  fromContextRecordId: string;
  fromContextFingerprint: string;
  toContextRecordId: string;
  toContextFingerprint: string;
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

export type D7R2RelationshipRecord = {
  relationshipId: string;
  kind: (typeof D7_R2_RELATIONSHIP_KINDS)[number];
  contextId: string;
  fromObjectId: string;
  fromObjectRevisionFingerprint: string;
  toObjectId: string;
  toObjectRevisionFingerprint: string;
  fromContextRecordId: string;
  fromContextFingerprint: string;
  toContextRecordId: string;
  toContextFingerprint: string;
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
  electricalEngineeringAuthority: false;
  engineeringValidated: false;
  inferred: false;
  loadFlowResult: false;
  energized: false;
  operabilityValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorRelationshipId: string | null;
};

export type D7R2History = {
  historyId: string;
  subjectKind: "SYSTEM" | "SOURCE" | "DISTRIBUTION" | "RELATIONSHIP";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D7R2Store = {
  r1: D7R1Store;
  now: () => string;
  systems: D7R2SystemRecord[];
  sources: D7R2SourceRecord[];
  distributions: D7R2DistributionRecord[];
  relationships: D7R2RelationshipRecord[];
  history: D7R2History[];
};

type Prepared = {
  contextId: string;
  object: D7R1ObjectRecord;
  stage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
};

function fail(code: string): never {
  throw new Error(`D7_R2_${code}`);
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
  if (input.connectedLoad === true || input.demandLoad === true || input.diversifiedLoad === true || input.operatingLoad === true || input.consumerDuty === true || input.motorLoad === true || input.processLoadAdopted === true || input.mechanicalDemand === true) fail("LOAD_CONTEXT_NOT_IN_R2");
  if (input.feederDesign === true || input.cableSelection === true || input.cableSize === true || input.conductorSize === true || input.ampacity === true || input.voltageDrop === true || input.installationMethod === true || input.breakerCoordination === true) fail("FEEDER_CABLE_NOT_IN_R2");
  if (input.calculationEvidence === true || input.loadFlow === true || input.shortCircuit === true) fail("CALCULATION_NOT_IN_R2");
  if (input.protectionSetting === true || input.groundingDesign === true || input.hazardousAreaSuitability === true || input.arcFlash === true) fail("PROTECTION_GROUNDING_NOT_IN_R2");
  if (input.capacityValidated === true || input.generatorSizing === true || input.transformerSizing === true || input.busRating === true || input.switchboardDesign === true || input.switchgearRating === true || input.impedanceModel === true || input.generatorPerformance === true) fail("SIZING_NOT_IN_R2");
  if (input.energized === true || input.operabilityValidated === true || input.networkDesignValidated === true) fail("TOPOLOGY_NOT_ANALYTICAL_TRUTH");
  if (input.requirementChange === true) fail("REQUIREMENT_CHANGE_NOT_IN_R2");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R2");
  if (input.reviewValidation === true || input.engineeringValidated === true || input.codeConformance === true || input.approved === true || input.certified === true) fail("VALIDATION_NOT_IN_R2");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R2");
  if (input.automaticDesign === true) fail("DESIGN_NOT_IN_R2");
  if (input.inferredRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.advanceMaturity === true) fail("MATURITY_PROGRESSION_NOT_IN_R2");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
}

function remember(store: D7R2Store, subjectKind: D7R2History["subjectKind"], subjectId: string, action: D7R2History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function requireContext(store: D7R2Store, actor: D7R1Actor, contextId: string): string {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context.contextId;
}

function requireObject(store: D7R2Store, actor: D7R1Actor, contextId: string, objectId: string, revisionFingerprint: string, allowed: readonly string[], cited: Currentness): D7R1ObjectRecord {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(revisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === id);
  if (!object || !allowed.includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  if (cited === "SUPERSEDED" && object.recordStatus !== "SUPERSEDED") fail("R1_OBJECT_CURRENTNESS_MISMATCH");
  return object;
}

function sameLineage(store: D7R2Store, object: D7R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D7R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    const predecessorId: string | null = cursor.predecessorObjectId;
    cursor = predecessorId ? store.r1.objects.find((row) => row.objectId === predecessorId) : undefined;
  }
  return false;
}

function prepare(store: D7R2Store, actor: D7R1Actor, input: D7R2BoundInput, allowed: readonly string[]): Prepared {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const contextId = requireContext(store, actor, input.contextId);
  const object = requireObject(store, actor, contextId, input.objectId, input.objectRevisionFingerprint, allowed, citedCurrentness);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return { contextId, object, stage, provenanceRef, sourceBasisRef, applicability, limitations, citedCurrentness };
}

function truthBase(actor: D7R1Actor, prepared: Prepared, fingerprint: string): Truth {
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
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D7_CONTEXT_AUTHORITY,
    electricalEngineeringAuthority: false,
    engineeringValidated: false,
    conformant: false,
    approved: false,
    certified: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: "",
    recordStatus: "CURRENT",
    currentness: "CURRENT",
  };
}

function place<T extends { fingerprint: string; tenantId: string; recordStatus: "CURRENT" | "SUPERSEDED"; currentness: "CURRENT" | "SUPERSEDED" }>(
  store: D7R2Store,
  rows: T[],
  kind: D7R2History["subjectKind"],
  id: string,
  fingerprint: string,
  tenantId: string,
  predecessor: T | null,
  idOf: (row: T) => string,
  kept: (row: T) => { objectRevisionFingerprint?: string; fromObjectRevisionFingerprint?: string; toObjectRevisionFingerprint?: string },
  duplicate: T | undefined,
  duplicateCode: string,
  record: T,
): T {
  const existing = rows.find((row) => idOf(row) === id);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === tenantId ? existing : fail(duplicateCode);
  if (duplicate) fail(duplicateCode);
  if (predecessor) {
    const before = kept(predecessor);
    const index = rows.findIndex((row) => idOf(row) === idOf(predecessor));
    rows[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    const after = kept(rows[index]);
    if (
      after.objectRevisionFingerprint !== before.objectRevisionFingerprint ||
      after.fromObjectRevisionFingerprint !== before.fromObjectRevisionFingerprint ||
      after.toObjectRevisionFingerprint !== before.toObjectRevisionFingerprint
    ) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    remember(store, kind, idOf(predecessor), "SUPERSEDED", predecessor.fingerprint);
  }
  rows.push(record);
  remember(store, kind, id, "CREATED", fingerprint);
  return record;
}

export function createD7R2Store(r1: D7R1Store, now: () => string = () => "2026-10-25T00:00:00.000Z"): D7R2Store {
  return { r1, now, systems: [], sources: [], distributions: [], relationships: [], history: [] };
}

export function recordElectricalSystemContext(store: D7R2Store, actor: D7R1Actor, input: D7R2SystemInput): D7R2SystemRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_SYSTEM"]);
  const systemRecordId = explicit(input.systemRecordId, "SYSTEM_CONTEXT_REQUIRED");
  const systemRole = explicit(input.systemRole, "SYSTEM_ROLE_REQUIRED");
  const nominalClassification = explicit(input.nominalClassification, "NOMINAL_CLASSIFICATION_REQUIRED");
  if (!(D7_R2_SYSTEM_ROLES as readonly string[]).includes(systemRole)) fail("SYSTEM_ROLE_NOT_ALLOWLISTED");
  if (!(D7_R2_NOMINAL_CLASSIFICATIONS as readonly string[]).includes(nominalClassification)) fail("NOMINAL_CLASSIFICATION_NOT_ALLOWLISTED");
  const predecessor = input.predecessorSystemRecordId ? store.systems.find((row) => row.systemRecordId === input.predecessorSystemRecordId) : null;
  if (input.predecessorSystemRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    systemRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    systemRole,
    nominalClassification,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
    predecessorSystemRecordId: predecessor?.systemRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.systems.find((row) => row.recordStatus === "CURRENT" && row.systemRecordId !== predecessor?.systemRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.systemRole === systemRole && row.nominalClassification === nominalClassification);
  const record: D7R2SystemRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    systemRecordId,
    systemRole: systemRole as D7R2SystemRecord["systemRole"],
    nominalClassification: nominalClassification as D7R2SystemRecord["nominalClassification"],
    validatedElectricalDesign: false,
    loadFlowModel: false,
    predecessorSystemRecordId: predecessor?.systemRecordId ?? null,
  });
  return place(store, store.systems, "SYSTEM", systemRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.systemRecordId, (row) => ({ objectRevisionFingerprint: row.objectRevisionFingerprint }), duplicate, "DUPLICATE_SYSTEM_REJECTED", record);
}

export function recordElectricalSourceContext(store: D7R2Store, actor: D7R1Actor, input: D7R2SourceInput): D7R2SourceRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_POWER_SOURCE"]);
  const sourceRecordId = explicit(input.sourceRecordId, "SOURCE_CONTEXT_REQUIRED");
  const sourceClass = explicit(input.sourceClass, "SOURCE_CLASS_REQUIRED");
  const sourceRole = explicit(input.sourceRole, "SOURCE_ROLE_REQUIRED");
  if (!(D7_POWER_SOURCE_CLASSES as readonly string[]).includes(sourceClass)) fail("SOURCE_CLASS_NOT_ALLOWLISTED");
  if (!(D7_R2_SOURCE_ROLES as readonly string[]).includes(sourceRole)) fail("SOURCE_ROLE_NOT_ALLOWLISTED");
  const predecessor = input.predecessorSourceRecordId ? store.sources.find((row) => row.sourceRecordId === input.predecessorSourceRecordId) : null;
  if (input.predecessorSourceRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    sourceRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    sourceClass,
    sourceRole,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
    predecessorSourceRecordId: predecessor?.sourceRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.sources.find((row) => row.recordStatus === "CURRENT" && row.sourceRecordId !== predecessor?.sourceRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.sourceClass === sourceClass && row.sourceRole === sourceRole);
  const record: D7R2SourceRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    sourceRecordId,
    sourceClass: sourceClass as D7R2SourceRecord["sourceClass"],
    sourceRole: sourceRole as D7R2SourceRecord["sourceRole"],
    capacityValidated: false,
    generatorSizing: false,
    transformerSizing: false,
    predecessorSourceRecordId: predecessor?.sourceRecordId ?? null,
  });
  return place(store, store.sources, "SOURCE", sourceRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.sourceRecordId, (row) => ({ objectRevisionFingerprint: row.objectRevisionFingerprint }), duplicate, "DUPLICATE_SOURCE_REJECTED", record);
}

export function recordElectricalDistributionContext(store: D7R2Store, actor: D7R1Actor, input: D7R2DistributionInput): D7R2DistributionRecord {
  const prepared = prepare(store, actor, input, ["ELECTRICAL_DISTRIBUTION_EQUIPMENT"]);
  const distributionRecordId = explicit(input.distributionRecordId, "DISTRIBUTION_CONTEXT_REQUIRED");
  const equipmentClass = explicit(input.equipmentClass, "EQUIPMENT_CLASS_REQUIRED");
  const hierarchyRole = explicit(input.hierarchyRole, "HIERARCHY_ROLE_REQUIRED");
  if (!(D7_DISTRIBUTION_EQUIPMENT_CLASSES as readonly string[]).includes(equipmentClass)) fail("EQUIPMENT_CLASS_NOT_ALLOWLISTED");
  if (!(D7_R2_HIERARCHY_ROLES as readonly string[]).includes(hierarchyRole)) fail("HIERARCHY_ROLE_NOT_ALLOWLISTED");
  if (equipmentClass === "BUS" && hierarchyRole !== "BUS_NODE") fail("BUS_ROLE_MISMATCH");
  if (equipmentClass !== "BUS" && hierarchyRole === "BUS_NODE") fail("BUS_ROLE_MISMATCH");
  const predecessor = input.predecessorDistributionRecordId ? store.distributions.find((row) => row.distributionRecordId === input.predecessorDistributionRecordId) : null;
  if (input.predecessorDistributionRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    distributionRecordId,
    contextId: prepared.contextId,
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    equipmentClass,
    hierarchyRole,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness,
    predecessorDistributionRecordId: predecessor?.distributionRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.distributions.find((row) => row.recordStatus === "CURRENT" && row.distributionRecordId !== predecessor?.distributionRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.equipmentClass === equipmentClass);
  const record: D7R2DistributionRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    distributionRecordId,
    equipmentClass: equipmentClass as D7R2DistributionRecord["equipmentClass"],
    hierarchyRole: hierarchyRole as D7R2DistributionRecord["hierarchyRole"],
    networkDesignValidated: false,
    loadFlowValidated: false,
    shortCircuitValidated: false,
    busRatingValidated: false,
    shortCircuitWithstandValidated: false,
    switchboardDesignValidated: false,
    switchgearRatingValidated: false,
    transformerSizingValidated: false,
    impedanceModelValidated: false,
    generatorSizingValidated: false,
    generatorPerformanceValidated: false,
    predecessorDistributionRecordId: predecessor?.distributionRecordId ?? null,
  });
  return place(store, store.distributions, "DISTRIBUTION", distributionRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.distributionRecordId, (row) => ({ objectRevisionFingerprint: row.objectRevisionFingerprint }), duplicate, "DUPLICATE_DISTRIBUTION_REJECTED", record);
}

function contextBinding(store: D7R2Store, recordId: string, fingerprint: string): { objectId: string; objectRevisionFingerprint: string; equipmentClass: string | null; kind: "SYSTEM" | "SOURCE" | "DISTRIBUTION" } {
  const system = store.systems.find((row) => row.systemRecordId === recordId);
  const source = store.sources.find((row) => row.sourceRecordId === recordId);
  const distribution = store.distributions.find((row) => row.distributionRecordId === recordId);
  const found = system ?? source ?? distribution;
  if (!found || found.fingerprint !== fingerprint) fail("CONTEXT_REVISION_MISMATCH");
  if (found.recordStatus !== "CURRENT") fail("CONTEXT_NOT_CURRENT");
  if (system && system.systemRecordId === recordId) return { objectId: system.objectId, objectRevisionFingerprint: system.objectRevisionFingerprint, equipmentClass: null, kind: "SYSTEM" };
  if (source && source.sourceRecordId === recordId) return { objectId: source.objectId, objectRevisionFingerprint: source.objectRevisionFingerprint, equipmentClass: null, kind: "SOURCE" };
  return { objectId: distribution!.objectId, objectRevisionFingerprint: distribution!.objectRevisionFingerprint, equipmentClass: distribution!.equipmentClass, kind: "DISTRIBUTION" };
}

export function recordElectricalDistributionRelationship(store: D7R2Store, actor: D7R1Actor, input: D7R2RelationshipInput): D7R2RelationshipRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const relationshipId = explicit(input.relationshipId, "RELATIONSHIP_REQUIRED");
  const kindToken = input.kind.trim();
  if (INFERRED.has(kindToken.toLowerCase())) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (!(D7_R2_RELATIONSHIP_KINDS as readonly string[]).includes(kindToken)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
  const kind = kindToken as D7R2RelationshipRecord["kind"];
  const contextId = requireContext(store, actor, input.contextId);
  const fromContext = contextBinding(store, explicit(input.fromContextRecordId, "FROM_CONTEXT_REQUIRED"), explicit(input.fromContextFingerprint, "FROM_CONTEXT_REVISION_REQUIRED"));
  const toContext = contextBinding(store, explicit(input.toContextRecordId, "TO_CONTEXT_REQUIRED"), explicit(input.toContextFingerprint, "TO_CONTEXT_REVISION_REQUIRED"));
  const fromObject = requireObject(store, actor, contextId, input.fromObjectId, input.fromObjectRevisionFingerprint, ["ELECTRICAL_SYSTEM", "ELECTRICAL_POWER_SOURCE", "ELECTRICAL_DISTRIBUTION_EQUIPMENT"], citedCurrentness);
  const toObject = requireObject(store, actor, contextId, input.toObjectId, input.toObjectRevisionFingerprint, ["ELECTRICAL_SYSTEM", "ELECTRICAL_POWER_SOURCE", "ELECTRICAL_DISTRIBUTION_EQUIPMENT"], citedCurrentness);
  if (fromObject.objectId !== fromContext.objectId || fromObject.fingerprint !== fromContext.objectRevisionFingerprint) fail("ENDPOINT_REVISION_MISMATCH");
  if (toObject.objectId !== toContext.objectId || toObject.fingerprint !== toContext.objectRevisionFingerprint) fail("ENDPOINT_REVISION_MISMATCH");
  if (fromObject.objectId === toObject.objectId) fail("RELATIONSHIP_ENDPOINT_COLLISION");
  if (kind === "SOURCE_TO_SYSTEM" && (fromContext.kind !== "SOURCE" || toContext.kind !== "SYSTEM")) fail("RELATIONSHIP_ENDPOINT_TYPE_REJECTED");
  if (kind === "SYSTEM_TO_BUS" && (fromContext.kind !== "SYSTEM" || toContext.kind !== "DISTRIBUTION" || toContext.equipmentClass !== "BUS")) fail("RELATIONSHIP_ENDPOINT_TYPE_REJECTED");
  if (kind === "BUS_TO_DISTRIBUTION" && (fromContext.kind !== "DISTRIBUTION" || fromContext.equipmentClass !== "BUS" || toContext.kind !== "DISTRIBUTION")) fail("RELATIONSHIP_ENDPOINT_TYPE_REJECTED");
  if (kind === "SOURCE_HIERARCHY" && (fromContext.kind !== "SOURCE" || toContext.kind !== "SOURCE")) fail("RELATIONSHIP_ENDPOINT_TYPE_REJECTED");
  if (kind === "DISTRIBUTION_HIERARCHY" && (fromContext.kind !== "DISTRIBUTION" || toContext.kind !== "DISTRIBUTION")) fail("RELATIONSHIP_ENDPOINT_TYPE_REJECTED");
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(fromObject.objectId) || !applicability.includes(toObject.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const predecessor = input.predecessorRelationshipId ? store.relationships.find((row) => row.relationshipId === input.predecessorRelationshipId) : null;
  if (input.predecessorRelationshipId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.kind !== kind) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    relationshipId,
    kind,
    contextId,
    fromObjectId: fromObject.objectId,
    fromObjectRevisionFingerprint: fromObject.fingerprint,
    toObjectId: toObject.objectId,
    toObjectRevisionFingerprint: toObject.fingerprint,
    fromContextRecordId: input.fromContextRecordId.trim(),
    fromContextFingerprint: input.fromContextFingerprint.trim(),
    toContextRecordId: input.toContextRecordId.trim(),
    toContextFingerprint: input.toContextFingerprint.trim(),
    applicability,
    limitations,
    provenanceRef,
    sourceBasisRef,
    citedLifecycleStage: stage,
    citedCurrentness,
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.relationships.find((row) => row.recordStatus === "CURRENT" && row.relationshipId !== predecessor?.relationshipId && row.kind === kind && row.fromObjectRevisionFingerprint === fromObject.fingerprint && row.toObjectRevisionFingerprint === toObject.fingerprint && row.fromObjectId === fromObject.objectId && row.toObjectId === toObject.objectId);
  const record: D7R2RelationshipRecord = Object.freeze({
    relationshipId,
    kind,
    contextId,
    fromObjectId: fromObject.objectId,
    fromObjectRevisionFingerprint: fromObject.fingerprint,
    toObjectId: toObject.objectId,
    toObjectRevisionFingerprint: toObject.fingerprint,
    fromContextRecordId: input.fromContextRecordId.trim(),
    fromContextFingerprint: input.fromContextFingerprint.trim(),
    toContextRecordId: input.toContextRecordId.trim(),
    toContextFingerprint: input.toContextFingerprint.trim(),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: stage,
    citedCurrentness,
    provenanceRef,
    sourceBasisRef,
    applicability,
    limitations,
    authority: D7_CONTEXT_AUTHORITY,
    electricalEngineeringAuthority: false,
    engineeringValidated: false,
    inferred: false,
    loadFlowResult: false,
    energized: false,
    operabilityValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorRelationshipId: predecessor?.relationshipId ?? null,
  });
  return place(store, store.relationships, "RELATIONSHIP", relationshipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.relationshipId, (row) => ({ fromObjectRevisionFingerprint: row.fromObjectRevisionFingerprint, toObjectRevisionFingerprint: row.toObjectRevisionFingerprint }), duplicate, "DUPLICATE_RELATIONSHIP_REJECTED", record);
}

export function reconstructElectricalRelationship(store: D7R2Store, relationshipId: string): D7R2RelationshipRecord {
  const record = store.relationships.find((row) => row.relationshipId === relationshipId);
  if (!record) fail("RELATIONSHIP_NOT_FOUND");
  return record;
}

export function repointElectricalDistributionRelationship(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function mutateElectricalDistributionContext(): never {
  return fail("SILENT_MUTATION_REJECTED");
}

export function recordElectricalLoadContext(): never {
  return fail("LOAD_CONTEXT_NOT_IN_R2");
}

export function recordElectricalFeederDesign(): never {
  return fail("FEEDER_CABLE_NOT_IN_R2");
}

export function recordElectricalCalculationEvidence(): never {
  return fail("CALCULATION_NOT_IN_R2");
}

export function recordElectricalProtectionContext(): never {
  return fail("PROTECTION_GROUNDING_NOT_IN_R2");
}
