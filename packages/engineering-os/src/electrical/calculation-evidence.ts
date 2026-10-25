/**
 * EOS-D7-R5 Electrical calculation evidence.
 * One bounded runtime on exact R1-R4 revisions. Supplied external evidence only.
 */
import {
  D7_CALCULATION_EVIDENCE_CLASSES,
  D7_CURRENTNESS_STATES,
  D7_ELECTRICAL_OBJECT_TYPES,
  D7_IMPLEMENTATION_PHASE_TYPES,
  D7_IMPLEMENTATION_PHASES,
  D7_MATURITY_STATES,
  ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_CALCULATION_PERFORMED_BY_EOS,
  ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_CODE_CONFORMANCE,
  ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_VALIDATED_ELECTRICAL_DESIGN,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D7_CONTEXT_AUTHORITY,
  D7_DISCIPLINE,
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
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_FEEDER_CABLE_RATING_RUNTIME_READY,
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
  D7_R1_IDENTITY_REUSED,
  D7_R2_SYSTEM_SOURCE_DISTRIBUTION_CONTEXT_REUSED,
  D7_R3_LOAD_CONSUMER_EQUIPMENT_CONTEXT_REUSED,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  type D7R4Store,
} from "./feeder-cable-rating-context";

export const D7_R5_STATUS = "ELECTRICAL_CALCULATION_EVIDENCE_IMPLEMENTED" as const;
export const D7_R5_MATURITY = D7_R5_STATUS;
export const D7_R5_MATURITY_STATE = D7_R5_STATUS;
export const D7_R5_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D7_R5_ELECTRICAL_CALCULATION_EVIDENCE_CLOSEOUT.md" as const;
export const D7_R4_RUNTIME_COUNT = R4_RUNTIME_COUNT;
export const D7_R4_FEEDER_CABLE_RATING_CONTEXT_REUSED = D7_FEEDER_CABLE_RATING_RUNTIME_READY;
export const EXACT_D7_R1_R4_REFERENCE_REQUIRED = true as const;
export const FLOATING_D7_R5_SOURCE_REFERENCE_ALLOWED = false as const;
export const D7_R5_SOURCE_AUTO_REPOINTED = false as const;
export const D7_RUNTIME_STARTED = true as const;
export const D7_RUNTIME_COUNT = 5 as const;
export const D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_IMPLEMENTED = true as const;
export const D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT = 1 as const;
export const D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_READY = true as const;
export const D7_REUSES_CANONICAL_EVIDENCE_GOVERNANCE = true as const;
export const PARALLEL_D7_EVIDENCE_FRAMEWORK_CREATED = false as const;
export const D7_EXTERNAL_ELECTRICAL_CALCULATION_EVIDENCE_SUPPORTED = true as const;
export const EXTERNAL_ELECTRICAL_EVIDENCE_EQUALS_EOS_CALCULATION = false as const;
export const EXTERNAL_ELECTRICAL_EVIDENCE_EQUALS_VALIDATED_DESIGN = false as const;
export const D7_R5_EVIDENCE_IDENTITY_IMPLEMENTED = true as const;
export const D7_R5_EXACT_EVIDENCE_REVISION_REQUIRED = true as const;
export const D7_R5_INPUT_RESULT_SEPARATION_IMPLEMENTED = true as const;
export const ELECTRICAL_EVIDENCE_INPUT_EQUALS_EVIDENCE_RESULT = false as const;
export const ELECTRICAL_EVIDENCE_RESULT_EQUALS_ADOPTED_ELECTRICAL_DESIGN = false as const;
export const ELECTRICAL_EVIDENCE_RESULT_AUTO_ADOPTED = false as const;
export const D7_LOAD_CALCULATION_EVIDENCE_SUPPORTED = true as const;
export const LOAD_CALCULATION_EVIDENCE_EQUALS_EOS_LOAD_CALCULATION = false as const;
export const LOAD_CALCULATION_EVIDENCE_EQUALS_ADOPTED_D7_LOAD = false as const;
export const LOAD_CALCULATION_EVIDENCE_EQUALS_VALIDATED_LOAD = false as const;
export const D7_LOAD_FLOW_EVIDENCE_SUPPORTED = true as const;
export const LOAD_FLOW_EVIDENCE_EQUALS_EOS_LOAD_FLOW_CALCULATION = false as const;
export const LOAD_FLOW_EVIDENCE_EQUALS_VALIDATED_NETWORK_DESIGN = false as const;
export const D7_SHORT_CIRCUIT_EVIDENCE_SUPPORTED = true as const;
export const SHORT_CIRCUIT_EVIDENCE_EQUALS_EOS_SHORT_CIRCUIT_CALCULATION = false as const;
export const SHORT_CIRCUIT_EVIDENCE_EQUALS_VALIDATED_EQUIPMENT_WITHSTAND = false as const;
export const D7_MOTOR_STARTING_EVIDENCE_SUPPORTED = true as const;
export const MOTOR_STARTING_EVIDENCE_EQUALS_EOS_MOTOR_STARTING_CALCULATION = false as const;
export const MOTOR_STARTING_EVIDENCE_EQUALS_VALIDATED_MOTOR_STARTING_DESIGN = false as const;
export const D7_VOLTAGE_DROP_EVIDENCE_SUPPORTED = true as const;
export const VOLTAGE_DROP_EVIDENCE_EQUALS_EOS_VOLTAGE_DROP_CALCULATION = false as const;
export const VOLTAGE_DROP_EVIDENCE_EQUALS_VALIDATED_CABLE_DESIGN = false as const;
export const D7_CABLE_SIZING_EVIDENCE_SUPPORTED = true as const;
export const D7_AMPACITY_EVIDENCE_SUPPORTED = true as const;
export const CABLE_SIZING_EVIDENCE_EQUALS_EOS_CABLE_SIZING_CALCULATION = false as const;
export const AMPACITY_EVIDENCE_EQUALS_EOS_AMPACITY_CALCULATION = false as const;
export const CABLE_SIZING_EVIDENCE_EQUALS_VALIDATED_CABLE_SELECTION = false as const;
export const D7_CABLE_DERATING_EVIDENCE_SUPPORTED = true as const;
export const DERATING_EVIDENCE_EQUALS_EOS_DERATING_CALCULATION = false as const;
export const DERATING_EVIDENCE_AUTO_CHANGES_CABLE_RATING = false as const;
export const D7_PROTECTION_COORDINATION_EVIDENCE_SUPPORTED = true as const;
export const PROTECTION_COORDINATION_EVIDENCE_EQUALS_EOS_PROTECTION_CALCULATION = false as const;
export const PROTECTION_COORDINATION_EVIDENCE_EQUALS_VALIDATED_PROTECTION_SETTING = false as const;
export const D7_ARC_FLASH_EVIDENCE_SUPPORTED = true as const;
export const ARC_FLASH_EVIDENCE_EQUALS_EOS_ARC_FLASH_CALCULATION = false as const;
export const ARC_FLASH_EVIDENCE_EQUALS_VALIDATED_ARC_FLASH_ASSESSMENT = false as const;
export const D7_GROUNDING_EVIDENCE_SUPPORTED = true as const;
export const GROUNDING_EVIDENCE_EQUALS_EOS_GROUNDING_CALCULATION = false as const;
export const GROUNDING_EVIDENCE_EQUALS_VALIDATED_GROUNDING_DESIGN = false as const;
export const GROUNDING_EVIDENCE_EQUALS_CODE_CONFORMANCE = false as const;
export const D7_POWER_QUALITY_EVIDENCE_SUPPORTED = true as const;
export const POWER_QUALITY_EVIDENCE_EQUALS_EOS_POWER_QUALITY_CALCULATION = false as const;
export const POWER_QUALITY_EVIDENCE_EQUALS_VALIDATED_POWER_QUALITY_DESIGN = false as const;
export const D7_HARMONIC_EVIDENCE_SUPPORTED = true as const;
export const HARMONIC_EVIDENCE_EQUALS_EOS_HARMONIC_CALCULATION = false as const;
export const HARMONIC_EVIDENCE_EQUALS_VALIDATED_HARMONIC_COMPLIANCE = false as const;
export const D7_BATTERY_UPS_SIZING_EVIDENCE_SUPPORTED = true as const;
export const BATTERY_UPS_EVIDENCE_EQUALS_EOS_BATTERY_UPS_CALCULATION = false as const;
export const BATTERY_UPS_EVIDENCE_EQUALS_VALIDATED_BATTERY_UPS_SELECTION = false as const;
export const D7_R5_DERIVES_MISSING_RESULT = false as const;
export const D7_R5_INTERPOLATES_ENGINEERING_RESULT = false as const;
export const D7_R5_EXTRAPOLATES_ENGINEERING_RESULT = false as const;
export const D7_R5_NORMALIZES_RESULT_TO_AUTHORITATIVE_TRUTH = false as const;
export const D7_R5_RECALCULATES_EXTERNAL_EVIDENCE = false as const;
export const D7_R5_HIDDEN_CALCULATION_ALLOWED = false as const;
export const D7_R5_UNITS_REQUIRED = true as const;
export const D7_R5_UNITS_PRESERVED = true as const;
export const AI_CAN_SILENTLY_CHANGE_D7_R5_UNITS = false as const;
export const D7_R5_EVIDENCE_ASSUMPTIONS_TRACEABLE = true as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_R5_EVIDENCE_ASSUMPTION = false as const;
export const D7_R5_SOURCE_TOOL_TRACEABLE = true as const;
export const D7_R5_SOURCE_MODEL_REVISION_TRACEABLE_WHERE_AVAILABLE = true as const;
export const EXACT_D7_R1_IDENTITY_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R2_CONTEXT_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R3_LOAD_CONSUMER_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const EXACT_D7_R4_FEEDER_CABLE_RATING_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D7_R5_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D7_R5_AUTO_MUTATES_R2_SYSTEM_SOURCE_DISTRIBUTION = false as const;
export const D7_R5_AUTO_MUTATES_R3_LOAD_CONSUMER_EQUIPMENT = false as const;
export const D7_R5_AUTO_MUTATES_R4_FEEDER_CABLE_RATING = false as const;
export const D7_R5_AUTO_ADOPTS_LOAD_RESULT = false as const;
export const D7_R5_AUTO_ADOPTS_LOAD_FLOW_RESULT = false as const;
export const D7_R5_AUTO_ADOPTS_SHORT_CIRCUIT_RESULT = false as const;
export const D7_R5_AUTO_ADOPTS_CABLE_SIZE_RESULT = false as const;
export const D7_R5_AUTO_ADOPTS_PROTECTION_RESULT = false as const;
export const D7_R5_AUTO_ADOPTS_GROUNDING_RESULT = false as const;
export const ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_ENGINEERING_VALIDATION = false as const;
export const ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_CONFORMANCE = false as const;
export const ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_APPROVAL = false as const;
export const ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_CERTIFICATION = false as const;
export const D7_R5_HISTORY_PRESERVED = true as const;
export const D7_R5_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D7_R5_MUTATION_ALLOWED = false as const;
export const D7_R5_SOURCE_BASIS_REQUIRED = true as const;
export const D7_R5_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D7_R5_EVIDENCE_AUTO_ACCEPTED = false as const;
export const D7_R5_APPLICABILITY_EXPLICIT = true as const;
export const D7_R5_LIMITATIONS_EXPLICIT = true as const;
export const D7_R5_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D7_R5_PROVENANCE_REQUIRED = true as const;
export const D7_R5_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D7_R5_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D7_R5_ACCESS_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_CALCULATION_EVIDENCE = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D7_CALCULATION_RESULT = false as const;
export const AI_CAN_PROMOTE_D7_EVIDENCE_TO_ADOPTED_DESIGN = false as const;
export const ADMIN_CAN_PROMOTE_D7_EVIDENCE_TO_VALIDATED_ENGINEERING = false as const;
export const D7_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R5_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D7_R5_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D7_R6_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_ELECTRICAL_CALCULATION_EXECUTION = false as const;
export const UNAUTHORIZED_LOAD_CALCULATION = false as const;
export const UNAUTHORIZED_LOAD_FLOW_CALCULATION = false as const;
export const UNAUTHORIZED_SHORT_CIRCUIT_CALCULATION = false as const;
export const UNAUTHORIZED_MOTOR_STARTING_CALCULATION = false as const;
export const UNAUTHORIZED_VOLTAGE_DROP_CALCULATION = false as const;
export const UNAUTHORIZED_CABLE_SIZING_CALCULATION = false as const;
export const UNAUTHORIZED_PROTECTION_COORDINATION_CALCULATION = false as const;
export const UNAUTHORIZED_ARC_FLASH_CALCULATION = false as const;
export const UNAUTHORIZED_GROUNDING_CALCULATION = false as const;
export const UNAUTHORIZED_EVIDENCE_AUTO_ADOPTION = false as const;
export const UNAUTHORIZED_EVIDENCE_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_EVIDENCE_TO_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_EVIDENCE_TO_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_UPSTREAM_D7_MUTATION = false as const;
export const D7_R5_EVIDENCE_CLASSES = [
  ...D7_CALCULATION_EVIDENCE_CLASSES,
  "AMPACITY",
  "CABLE_DERATING",
] as const;
export const D7_R5_SOURCE_ORIGINS = [
  "EXTERNAL_ENGINEERING_SOFTWARE",
  "VENDOR_MANUFACTURER_STUDY",
  "CONSULTANT_STUDY",
  "PROJECT_ENGINEERING_CALCULATION",
  "SUPPLIED_ENGINEERING_REPORT",
  "OTHER_GOVERNED_SOURCE",
] as const;
export const D7_R5_UNITS = ["V", "kV", "A", "kA", "W", "kW", "MW", "VA", "kVA", "MVA", "Hz", "mm2", "AWG", "kcmil", "percent", "ohm", "m", "s", "degC"] as const;
export const D7_R6_CANONICAL_PHASE = D7_IMPLEMENTATION_PHASES[5];
export const D7_R6_PHASE_TYPE = D7_IMPLEMENTATION_PHASE_TYPES[5];
export const D7_R6_CANONICAL_SCOPE =
  "Implement governed Electrical protection, grounding/earthing and hazardous-area context using exact R1-R5 revisions. Support supplied/adopted protection-setting context, protective-device relationships, supplied grounding/earthing context, hazardous-area source/classification references and Electrical equipment-suitability evidence where canonical. Preserve supplied protection data != validated settings, grounding evidence != validated grounding design, hazardous-area classification/context != validated Electrical equipment selection, and perform zero protection, grounding, arc-flash or hazardous-area calculations." as const;
export const D7_R6_STARTED = false as const;
export const D7_R5_READY_FOR_NEXT_PHASE = true as const;
export const D7_R5_NEXT_PHASE = D7_R6_CANONICAL_PHASE;
export const D7_R5_NEXT_PHASE_TYPE = D7_R6_PHASE_TYPE;
export const D7_R5_CANONICAL_NEXT_PHASE = D7_R6_CANONICAL_PHASE;
export const D7_R5_CANONICAL_NEXT_PHASE_SCOPE = D7_R6_CANONICAL_SCOPE;
export const D7_R5_BLOCKER = "NONE" as const;
export const D7_R5_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_CALCULATION_PERFORMED_BY_EOS,
  ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_VALIDATED_ELECTRICAL_DESIGN,
  ELECTRICAL_CALCULATION_EVIDENCE_EQUALS_CODE_CONFORMANCE,
  D7_CALCULATION_EVIDENCE_CLASSES,
  D7_R1_IDENTITY_REUSED,
  D7_R2_SYSTEM_SOURCE_DISTRIBUTION_CONTEXT_REUSED,
  D7_R3_LOAD_CONSUMER_EQUIPMENT_CONTEXT_REUSED,
  D7_IDENTITY_RUNTIME_COUNT,
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
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_APPROVAL_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_INFERRED_LINEAGE_ALLOWED,
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
  D6_TRIP_SHUTDOWN_INTENT_EQUALS_D7_PROTECTION_OR_CONTROL_DESIGN,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["matching_name", "matching_tag", "name_similarity", "tag_similarity", "semantic_similarity", "ai_inference", "ai_reasoning", "inferred"]);
const MAGNITUDE = /^[0-9]+(\.[0-9]+)?$/;
const AWG_SIZE = /^[0-9]+(\/0)?$/;

type Currentness = (typeof D7_CURRENTNESS_STATES)[number];
type Stage = (typeof D7_MATURITY_STATES)[number];
type EvidenceClass = (typeof D7_R5_EVIDENCE_CLASSES)[number];
type SourceOrigin = (typeof D7_R5_SOURCE_ORIGINS)[number];

export type D7R5Measure = { name: string; value: string; unit: string };

type Prohibited = {
  deriveMissingResult?: boolean;
  interpolateResult?: boolean;
  extrapolateResult?: boolean;
  normalizeResult?: boolean;
  recalculate?: boolean;
  hiddenCalculation?: boolean;
  convertUnits?: boolean;
  inputEqualsResult?: boolean;
  autoAdopt?: boolean;
  autoAdoptLoad?: boolean;
  autoAdoptLoadFlow?: boolean;
  autoAdoptShortCircuit?: boolean;
  autoAdoptCableSize?: boolean;
  autoAdoptProtection?: boolean;
  autoAdoptGrounding?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  changeCableRating?: boolean;
  generateArcFlashLabel?: boolean;
  engineeringValidated?: boolean;
  codeConformance?: boolean;
  approval?: boolean;
  certification?: boolean;
  protectionContext?: boolean;
  hazardousArea?: boolean;
  d9Source?: boolean;
  repoint?: boolean;
};

type Citation = {
  systemRecordId?: string | null;
  systemRevisionFingerprint?: string | null;
  sourceRecordId?: string | null;
  sourceRevisionFingerprint?: string | null;
  distributionRecordId?: string | null;
  distributionRevisionFingerprint?: string | null;
  loadRecordId?: string | null;
  loadRevisionFingerprint?: string | null;
  consumerRecordId?: string | null;
  consumerRevisionFingerprint?: string | null;
  supplyRecordId?: string | null;
  supplyRevisionFingerprint?: string | null;
  feederRecordId?: string | null;
  feederRevisionFingerprint?: string | null;
  cableRecordId?: string | null;
  cableRevisionFingerprint?: string | null;
  ratingRecordId?: string | null;
  ratingRevisionFingerprint?: string | null;
};

export type D7R5EvidenceInput = Prohibited & Citation & {
  evidenceId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  subjectObjectId: string;
  subjectRevisionFingerprint: string;
  evidenceClass: string;
  sourceOrigin: string;
  sourceToolName: string;
  sourceToolVersion: string;
  sourceOrganization: string;
  sourceDocumentRef: string;
  sourceModelRevision?: string | null;
  studyDate?: string | null;
  inputs: readonly D7R5Measure[];
  results: readonly D7R5Measure[];
  assumptions: readonly string[];
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string;
  predecessorEvidenceId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D7R5EvidenceRecord = {
  evidenceId: string;
  contextId: string;
  objectId: string;
  objectType: "ELECTRICAL_CALCULATION_EVIDENCE";
  objectRevisionFingerprint: string;
  subjectObjectId: string;
  subjectObjectType: D7R1ObjectRecord["objectType"];
  subjectRevisionFingerprint: string;
  evidenceClass: EvidenceClass;
  sourceOrigin: SourceOrigin;
  sourceToolName: string;
  sourceToolVersion: string;
  sourceOrganization: string;
  sourceDocumentRef: string;
  sourceModelRevision: string | null;
  studyDate: string | null;
  inputs: readonly D7R5Measure[];
  results: readonly D7R5Measure[];
  assumptions: readonly string[];
  systemRecordId: string | null;
  systemRevisionFingerprint: string | null;
  sourceRecordId: string | null;
  sourceRevisionFingerprint: string | null;
  distributionRecordId: string | null;
  distributionRevisionFingerprint: string | null;
  loadRecordId: string | null;
  loadRevisionFingerprint: string | null;
  consumerRecordId: string | null;
  consumerRevisionFingerprint: string | null;
  supplyRecordId: string | null;
  supplyRevisionFingerprint: string | null;
  feederRecordId: string | null;
  feederRevisionFingerprint: string | null;
  cableRecordId: string | null;
  cableRevisionFingerprint: string | null;
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
  eosCalculated: false;
  adoptedDesign: false;
  engineeringValidated: false;
  codeConformance: false;
  approved: false;
  certified: false;
  changesCableRating: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorEvidenceId: string | null;
};

export type D7R5History = {
  historyId: string;
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  subjectRevisionFingerprint: string;
  recordedAt: string;
};

export type D7R5Store = {
  r1: D7R1Store;
  r4: D7R4Store;
  now: () => string;
  evidence: D7R5EvidenceRecord[];
  history: D7R5History[];
};

function fail(code: string): never {
  throw new Error(`D7_R5_${code}`);
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
  if (input.deriveMissingResult === true || input.interpolateResult === true || input.extrapolateResult === true || input.normalizeResult === true) fail("RESULT_DERIVATION_NOT_IN_R5");
  if (input.recalculate === true || input.hiddenCalculation === true) fail("HIDDEN_CALCULATION_NOT_IN_R5");
  if (input.convertUnits === true) fail("UNIT_CHANGE_REJECTED");
  if (input.inputEqualsResult === true) fail("INPUT_RESULT_COLLAPSE_REJECTED");
  if (input.autoAdopt === true || input.autoAdoptLoad === true || input.autoAdoptLoadFlow === true || input.autoAdoptShortCircuit === true || input.autoAdoptCableSize === true || input.autoAdoptProtection === true || input.autoAdoptGrounding === true) fail("AUTO_ADOPTION_REJECTED");
  if (input.mutateR1 === true || input.mutateR2 === true || input.mutateR3 === true || input.mutateR4 === true) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.changeCableRating === true) fail("CABLE_RATING_NOT_CHANGED_BY_EVIDENCE");
  if (input.generateArcFlashLabel === true) fail("ARC_FLASH_LABEL_NOT_IN_R5");
  if (input.engineeringValidated === true || input.codeConformance === true || input.approval === true || input.certification === true) fail("VALIDATION_NOT_IN_R5");
  if (input.protectionContext === true || input.hazardousArea === true) fail("PROTECTION_GROUNDING_NOT_IN_R5");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R5");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
}

function requireObject(store: D7R5Store, actor: D7R1Actor, contextId: string, objectId: string, revision: string, allowed: readonly string[], cited: Currentness): D7R1ObjectRecord {
  const context = store.r1.contexts.find((row) => row.contextId === contextId);
  const object = store.r1.objects.find((row) => row.objectId === explicit(objectId, "R1_OBJECT_REQUIRED"));
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (!object || !allowed.includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== explicit(revision, "R1_REVISION_REQUIRED")) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== context.contextId || object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function optionalPair(id: string | null | undefined, revision: string | null | undefined, code: string): { id: string; revision: string } | null {
  const hasId = id != null && id.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail(code);
  return { id: id as string, revision: revision as string };
}

function requireCurrent<T extends { tenantId: string; fingerprint: string; recordStatus: "CURRENT" | "SUPERSEDED" }>(rows: readonly T[], id: string, fingerprint: string, actor: D7R1Actor, idOf: (row: T) => string, code: string): T {
  const row = rows.find((item) => idOf(item) === explicit(id, code));
  if (!row || row.fingerprint !== explicit(fingerprint, code) || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT") fail(code);
  return row;
}

function readMeasures(rows: readonly D7R5Measure[] | undefined, code: string): D7R5Measure[] {
  if (!rows || rows.length === 0) fail(code);
  return rows.map((row) => {
    const name = explicit(row.name, code);
    const unit = allow(explicit(row.unit, "UNIT_REQUIRED"), D7_R5_UNITS, "UNIT_NOT_PRESERVED");
    const value = explicit(row.value, code);
    if (unit === "AWG") {
      if (!AWG_SIZE.test(value)) fail("HIDDEN_CALCULATION");
    } else if (!MAGNITUDE.test(value)) fail("HIDDEN_CALCULATION");
    return { name, value, unit };
  });
}

function readAssumptions(rows: readonly string[] | undefined): string[] {
  if (!rows || rows.length === 0) fail("ASSUMPTION_REQUIRED");
  return rows.map((row) => explicit(row, "ASSUMPTION_REQUIRED"));
}

export function createD7R5Store(r1: D7R1Store, r4: D7R4Store, now: () => string = () => "2026-10-25T00:00:00.000Z"): D7R5Store {
  if (r4.r1 !== r1 || r4.r2.r1 !== r1 || r4.r3.r1 !== r1 || r4.r3.r2 !== r4.r2) fail("R1_R4_STORE_MISMATCH");
  return { r1, r4, now, evidence: [], history: [] };
}

export function recordElectricalCalculationEvidence(store: D7R5Store, actor: D7R1Actor, input: D7R5EvidenceInput): D7R5EvidenceRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const evidenceObject = requireObject(store, actor, contextId, input.objectId, input.objectRevisionFingerprint, ["ELECTRICAL_CALCULATION_EVIDENCE"], citedCurrentness);
  const subject = requireObject(store, actor, contextId, input.subjectObjectId, input.subjectRevisionFingerprint, D7_ELECTRICAL_OBJECT_TYPES, citedCurrentness);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const evidenceClass = allow(explicit(input.evidenceClass, "EVIDENCE_CLASS_REQUIRED"), D7_R5_EVIDENCE_CLASSES, "EVIDENCE_CLASS_NOT_ALLOWLISTED");
  const sourceOrigin = allow(explicit(input.sourceOrigin, "SOURCE_ORIGIN_REQUIRED"), D7_R5_SOURCE_ORIGINS, "SOURCE_ORIGIN_NOT_ALLOWLISTED");
  const inputs = readMeasures(input.inputs, "INPUT_REQUIRED");
  const results = readMeasures(input.results, "RESULT_REQUIRED");
  const assumptions = readAssumptions(input.assumptions);
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(evidenceObject.objectId) || !applicability.includes(subject.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const systemPair = optionalPair(input.systemRecordId, input.systemRevisionFingerprint, "R2_SYSTEM_REVISION_REQUIRED");
  const sourcePair = optionalPair(input.sourceRecordId, input.sourceRevisionFingerprint, "R2_SOURCE_REVISION_REQUIRED");
  const distributionPair = optionalPair(input.distributionRecordId, input.distributionRevisionFingerprint, "R2_DISTRIBUTION_REVISION_REQUIRED");
  const loadPair = optionalPair(input.loadRecordId, input.loadRevisionFingerprint, "R3_LOAD_REVISION_REQUIRED");
  const consumerPair = optionalPair(input.consumerRecordId, input.consumerRevisionFingerprint, "R3_CONSUMER_REVISION_REQUIRED");
  const supplyPair = optionalPair(input.supplyRecordId, input.supplyRevisionFingerprint, "R3_SUPPLY_REVISION_REQUIRED");
  const feederPair = optionalPair(input.feederRecordId, input.feederRevisionFingerprint, "R4_FEEDER_REVISION_REQUIRED");
  const cablePair = optionalPair(input.cableRecordId, input.cableRevisionFingerprint, "R4_CABLE_REVISION_REQUIRED");
  const ratingPair = optionalPair(input.ratingRecordId, input.ratingRevisionFingerprint, "R4_RATING_REVISION_REQUIRED");
  const system = systemPair ? requireCurrent(store.r4.r2.systems, systemPair.id, systemPair.revision, actor, (row) => row.systemRecordId, "R2_SYSTEM_REVISION_MISMATCH") : null;
  const source = sourcePair ? requireCurrent(store.r4.r2.sources, sourcePair.id, sourcePair.revision, actor, (row) => row.sourceRecordId, "R2_SOURCE_REVISION_MISMATCH") : null;
  const distribution = distributionPair ? requireCurrent(store.r4.r2.distributions, distributionPair.id, distributionPair.revision, actor, (row) => row.distributionRecordId, "R2_DISTRIBUTION_REVISION_MISMATCH") : null;
  const load = loadPair ? requireCurrent(store.r4.r3.loads, loadPair.id, loadPair.revision, actor, (row) => row.loadRecordId, "R3_LOAD_REVISION_MISMATCH") : null;
  const consumer = consumerPair ? requireCurrent(store.r4.r3.consumers, consumerPair.id, consumerPair.revision, actor, (row) => row.consumerRecordId, "R3_CONSUMER_REVISION_MISMATCH") : null;
  const supply = supplyPair ? requireCurrent(store.r4.r3.supplies, supplyPair.id, supplyPair.revision, actor, (row) => row.supplyRecordId, "R3_SUPPLY_REVISION_MISMATCH") : null;
  const feeder = feederPair ? requireCurrent(store.r4.feeders, feederPair.id, feederPair.revision, actor, (row) => row.feederRecordId, "R4_FEEDER_REVISION_MISMATCH") : null;
  const cable = cablePair ? requireCurrent(store.r4.cables, cablePair.id, cablePair.revision, actor, (row) => row.cableRecordId, "R4_CABLE_REVISION_MISMATCH") : null;
  const rating = ratingPair ? requireCurrent(store.r4.ratings, ratingPair.id, ratingPair.revision, actor, (row) => row.ratingRecordId, "R4_RATING_REVISION_MISMATCH") : null;
  const before = {
    evidenceObject: evidenceObject.fingerprint,
    subject: subject.fingerprint,
    system: system?.fingerprint ?? null,
    source: source?.fingerprint ?? null,
    distribution: distribution?.fingerprint ?? null,
    load: load?.fingerprint ?? null,
    loadValue: load?.suppliedValue ?? null,
    consumer: consumer?.fingerprint ?? null,
    supply: supply?.fingerprint ?? null,
    feeder: feeder?.fingerprint ?? null,
    cable: cable?.fingerprint ?? null,
    cableSize: cable?.suppliedSizeAttribute ?? null,
    rating: rating?.fingerprint ?? null,
    ratingValue: rating?.suppliedValue ?? null,
  };
  const sourceModelRevision = input.sourceModelRevision == null || input.sourceModelRevision.trim() === "" ? null : explicit(input.sourceModelRevision, "SOURCE_MODEL_REVISION_REQUIRED");
  const studyDate = input.studyDate == null || input.studyDate.trim() === "" ? null : explicit(input.studyDate, "STUDY_DATE_INVALID");
  if (studyDate && !/^\d{4}-\d{2}-\d{2}/.test(studyDate)) fail("STUDY_DATE_INVALID");
  const evidenceId = explicit(input.evidenceId, "EVIDENCE_REQUIRED");
  const predecessor = input.predecessorEvidenceId ? store.evidence.find((row) => row.evidenceId === input.predecessorEvidenceId) : null;
  if (input.predecessorEvidenceId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== evidenceObject.objectId || predecessor.subjectRevisionFingerprint !== subject.fingerprint)) fail("PREDECESSOR_NOT_CURRENT");
  const bound = {
    systemRecordId: system?.systemRecordId ?? null,
    systemRevisionFingerprint: system?.fingerprint ?? null,
    sourceRecordId: source?.sourceRecordId ?? null,
    sourceRevisionFingerprint: source?.fingerprint ?? null,
    distributionRecordId: distribution?.distributionRecordId ?? null,
    distributionRevisionFingerprint: distribution?.fingerprint ?? null,
    loadRecordId: load?.loadRecordId ?? null,
    loadRevisionFingerprint: load?.fingerprint ?? null,
    consumerRecordId: consumer?.consumerRecordId ?? null,
    consumerRevisionFingerprint: consumer?.fingerprint ?? null,
    supplyRecordId: supply?.supplyRecordId ?? null,
    supplyRevisionFingerprint: supply?.fingerprint ?? null,
    feederRecordId: feeder?.feederRecordId ?? null,
    feederRevisionFingerprint: feeder?.fingerprint ?? null,
    cableRecordId: cable?.cableRecordId ?? null,
    cableRevisionFingerprint: cable?.fingerprint ?? null,
    ratingRecordId: rating?.ratingRecordId ?? null,
    ratingRevisionFingerprint: rating?.fingerprint ?? null,
  };
  const fingerprint = fingerprintCanonical({
    evidenceId,
    objectId: evidenceObject.objectId,
    objectRevisionFingerprint: evidenceObject.fingerprint,
    subjectObjectId: subject.objectId,
    subjectRevisionFingerprint: subject.fingerprint,
    evidenceClass,
    sourceOrigin,
    sourceToolName: explicit(input.sourceToolName, "SOURCE_TOOL_REQUIRED"),
    sourceToolVersion: explicit(input.sourceToolVersion, "SOURCE_TOOL_VERSION_REQUIRED"),
    sourceOrganization: explicit(input.sourceOrganization, "SOURCE_ORGANIZATION_REQUIRED"),
    sourceDocumentRef: explicit(input.sourceDocumentRef, "SOURCE_DOCUMENT_REQUIRED"),
    sourceModelRevision,
    studyDate,
    inputs,
    results,
    assumptions,
    ...bound,
    applicability,
    limitations,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    citedLifecycleStage: stage,
    citedCurrentness,
  });
  if (
    evidenceObject.fingerprint !== before.evidenceObject
    || subject.fingerprint !== before.subject
    || (system?.fingerprint ?? null) !== before.system
    || (source?.fingerprint ?? null) !== before.source
    || (distribution?.fingerprint ?? null) !== before.distribution
    || (load?.fingerprint ?? null) !== before.load
    || (load?.suppliedValue ?? null) !== before.loadValue
    || (consumer?.fingerprint ?? null) !== before.consumer
    || (supply?.fingerprint ?? null) !== before.supply
    || (feeder?.fingerprint ?? null) !== before.feeder
    || (cable?.fingerprint ?? null) !== before.cable
    || (cable?.suppliedSizeAttribute ?? null) !== before.cableSize
    || (rating?.fingerprint ?? null) !== before.rating
    || (rating?.suppliedValue ?? null) !== before.ratingValue
  ) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.evidence.find((row) => row.recordStatus === "CURRENT" && row.evidenceId !== predecessor?.evidenceId && row.objectRevisionFingerprint === evidenceObject.fingerprint && row.evidenceClass === evidenceClass && row.subjectRevisionFingerprint === subject.fingerprint && row.sourceDocumentRef === explicit(input.sourceDocumentRef, "SOURCE_DOCUMENT_REQUIRED"));
  const existing = store.evidence.find((row) => row.evidenceId === evidenceId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_EVIDENCE_REJECTED");
  if (duplicate) fail("DUPLICATE_EVIDENCE_REJECTED");
  if (predecessor) {
    const priorSubject = predecessor.subjectRevisionFingerprint;
    const index = store.evidence.findIndex((row) => row.evidenceId === predecessor.evidenceId);
    store.evidence[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.evidence[index].subjectRevisionFingerprint !== priorSubject) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectId: predecessor.evidenceId, action: "SUPERSEDED", fingerprint: predecessor.fingerprint, subjectRevisionFingerprint: priorSubject, recordedAt: store.now() });
  }
  const record: D7R5EvidenceRecord = Object.freeze({
    evidenceId,
    contextId,
    objectId: evidenceObject.objectId,
    objectType: "ELECTRICAL_CALCULATION_EVIDENCE",
    objectRevisionFingerprint: evidenceObject.fingerprint,
    subjectObjectId: subject.objectId,
    subjectObjectType: subject.objectType,
    subjectRevisionFingerprint: subject.fingerprint,
    evidenceClass,
    sourceOrigin,
    sourceToolName: explicit(input.sourceToolName, "SOURCE_TOOL_REQUIRED"),
    sourceToolVersion: explicit(input.sourceToolVersion, "SOURCE_TOOL_VERSION_REQUIRED"),
    sourceOrganization: explicit(input.sourceOrganization, "SOURCE_ORGANIZATION_REQUIRED"),
    sourceDocumentRef: explicit(input.sourceDocumentRef, "SOURCE_DOCUMENT_REQUIRED"),
    sourceModelRevision,
    studyDate,
    inputs,
    results,
    assumptions,
    ...bound,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D7_DISCIPLINE,
    citedLifecycleStage: stage,
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    applicability,
    limitations,
    citedCurrentness,
    authority: D7_CONTEXT_AUTHORITY,
    eosCalculated: false,
    adoptedDesign: false,
    engineeringValidated: false,
    codeConformance: false,
    approved: false,
    certified: false,
    changesCableRating: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorEvidenceId: predecessor?.evidenceId ?? null,
  });
  store.evidence.push(record);
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectId: evidenceId, action: "CREATED", fingerprint, subjectRevisionFingerprint: subject.fingerprint, recordedAt: store.now() });
  return record;
}

export function reconstructElectricalCalculationEvidence(store: D7R5Store, evidenceId: string): D7R5EvidenceRecord {
  const record = store.evidence.find((row) => row.evidenceId === evidenceId);
  if (!record) fail("EVIDENCE_NOT_FOUND");
  return record;
}

export function performElectricalLoadCalculation(): never {
  return fail("HIDDEN_CALCULATION_NOT_IN_R5");
}

export function adoptElectricalEvidenceResult(): never {
  return fail("AUTO_ADOPTION_REJECTED");
}

export function repointElectricalCalculationEvidence(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function recordElectricalProtectionContext(): never {
  return fail("PROTECTION_GROUNDING_NOT_IN_R5");
}
