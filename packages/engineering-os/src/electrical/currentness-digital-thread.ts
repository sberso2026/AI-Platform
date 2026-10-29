/**
 * EOS-D7-R10 Electrical currentness and digital thread.
 * One bounded runtime on exact R1-R9 revisions. Canonical currentness, thread, and fingerprint only.
 * Current is not validated, approved, or conformant. Newer revisions do not rewrite history or transfer review.
 */
import { D7_CURRENTNESS_STATES, D7_IMPLEMENTATION_PHASE_TYPES, D7_IMPLEMENTATION_PHASES } from "@rtb/types";
import { isGovernedRelationType } from "../decision-intelligence/relations";
import { relationSemantics } from "../digital-thread/relation-semantics";
import { THREAD_DEFAULT_MAX_DEPTH } from "../digital-thread/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED } from "../structural-systems/interface-handoff-governance";
import { D7_CONTEXT_AUTHORITY, D7_DISCIPLINE, D7_EXPLICIT_RELATIONSHIP_KINDS, type D7R1Actor } from "./identity-foundation";
import { D7_R7_DEPENDENCY_TARGETS } from "./requirements-assumptions-change";
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
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_READY,
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
  D7_PRIOR_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  D7_PRIOR_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_REVIEW_VALIDATION_RUNTIME_READY,
  D7_REUSES_CANONICAL_CURRENTNESS,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  D7_RUNTIME_COUNT as R9_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  STALE_D7_VALIDATION_EXPOSED_AS_CURRENT_VALIDATION,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_VALIDATION_EXPOSED_AS_CURRENT_VALIDATION,
  UNAUTHORIZED_APPROVAL_PROMOTION,
  UNAUTHORIZED_CERTIFICATION_PROMOTION,
  UNAUTHORIZED_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_ELECTRICAL_CALCULATION_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_DESIGN_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_HISTORICAL_AUTO_REPOINT,
  UNAUTHORIZED_INFERRED_LINEAGE,
  UNAUTHORIZED_PARALLEL_CURRENTNESS_ENGINE,
  UNAUTHORIZED_PARALLEL_DIGITAL_THREAD,
  UNAUTHORIZED_PRODUCT_CLAIM,
  UNAUTHORIZED_SECOND_FINGERPRINT_ALGORITHM,
  type D7R9Store,
} from "./review-validation-governance";

export const D7_R10_STATUS = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D7_R10_MATURITY = D7_R10_STATUS;
export const D7_R10_MATURITY_STATE = D7_R10_STATUS;
export const D7_R10_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D7_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md" as const;
export const D7_RUNTIME_STARTED = true as const;
export const D7_RUNTIME_COUNT = 10 as const;
export const D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_IMPLEMENTED = true as const;
export const D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 1 as const;
export const D7_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = true as const;
export const D7_R1_R9_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D7_R10_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D7_R10_SOURCE_REFERENCE_ALLOWED = false as const;
export const D7_R10_SOURCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D7_R10_THREAD_DEPTH_REUSED = THREAD_DEFAULT_MAX_DEPTH;
export const D7_CURRENT_RECORD_STATE_SUPPORTED = true as const;
export const CURRENT_D7_RECORD_EQUALS_APPROVED = false as const;
export const CURRENT_D7_RECORD_EQUALS_CONFORMANT = false as const;
export const CURRENT_D7_RECORD_EQUALS_CERTIFIED = false as const;
export const D7_STALE_RECORD_STATE_SUPPORTED = true as const;
export const D7_SUPERSEDED_RECORD_STATE_SUPPORTED = true as const;
export const D7_R10_HISTORY_PRESERVED = true as const;
export const D7_R10_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D7_R10_HISTORICAL_RECORD_AUTO_MUTATED = false as const;
export const D7_R10_LATEST_REVISION_AUTO_REPOINT_ALLOWED = false as const;
export const D7_R10_EXPLICIT_THREAD_RELATIONSHIP_REQUIRED = true as const;
export const D7_R10_INFERRED_THREAD_RELATIONSHIP_ALLOWED = false as const;
export const D7_R10_FINGERPRINT_MISMATCH_DETECTED = true as const;
export const D7_R10_FINGERPRINT_MISMATCH_AUTO_REPAIRED = false as const;
export const D7_R10_FINGERPRINT_MISMATCH_AUTO_REBASELINED = false as const;
export const D7_R10_R1_IDENTITY_CURRENTNESS_INTEGRATED = true as const;
export const NEW_D7_IDENTITY_REVISION_AUTO_REPOINTS_HISTORY = false as const;
export const NEW_D7_IDENTITY_REVISION_INVALIDATES_PRIOR_IDENTITY = false as const;
export const D7_R10_R2_SYSTEM_SOURCE_DISTRIBUTION_CURRENTNESS_INTEGRATED = true as const;
export const NEW_D7_SYSTEM_REVISION_AUTO_REWRITES_HISTORICAL_RELATIONSHIP = false as const;
export const NEW_D7_SOURCE_REVISION_AUTO_REPLACES_PRIOR_SOURCE_CONTEXT = false as const;
export const NEW_D7_DISTRIBUTION_REVISION_AUTO_REWRITES_PRIOR_HIERARCHY = false as const;
export const D7_R10_R3_LOAD_CONSUMER_EQUIPMENT_CURRENTNESS_INTEGRATED = true as const;
export const NEW_D7_LOAD_CONTEXT_AUTO_REPLACES_ADOPTED_LOAD = false as const;
export const NEW_D7_LOAD_CONTEXT_AUTO_RECALCULATES_LOAD = false as const;
export const NEW_D7_CONSUMER_REVISION_AUTO_REPOINTS_HISTORICAL_FEEDER = false as const;
export const D7_R10_R4_FEEDER_CABLE_RATING_CURRENTNESS_INTEGRATED = true as const;
export const NEW_D7_FEEDER_REVISION_AUTO_REPOINTS_CABLE = false as const;
export const NEW_D7_CABLE_REVISION_AUTO_REPLACES_PRIOR_CABLE_CONTEXT = false as const;
export const NEW_D7_RATING_AUTO_REPLACES_ADOPTED_RATING = false as const;
export const D7_R10_R5_CALCULATION_EVIDENCE_CURRENTNESS_INTEGRATED = true as const;
export const NEW_D7_EVIDENCE_AUTO_REPLACES_PRIOR_EVIDENCE = false as const;
export const NEW_D7_EVIDENCE_AUTO_ADOPTS_RESULT = false as const;
export const STALE_D7_EVIDENCE_EXPOSED_AS_CURRENT = false as const;
export const D7_R10_R6_PROTECTION_CURRENTNESS_INTEGRATED = true as const;
export const NEW_PROTECTION_EVIDENCE_AUTO_REPLACES_ADOPTED_SETTING = false as const;
export const NEW_PROTECTION_SETTING_AUTO_INVALIDATES_PRIOR_SETTING = false as const;
export const NEW_PROTECTION_SETTING_AUTO_VALIDATES_COORDINATION = false as const;
export const D7_R10_R6_GROUNDING_CURRENTNESS_INTEGRATED = true as const;
export const NEW_GROUNDING_EVIDENCE_AUTO_REPLACES_GROUNDING_CONTEXT = false as const;
export const NEW_GROUNDING_EVIDENCE_AUTO_VALIDATES_GROUNDING_DESIGN = false as const;
export const D7_R10_R6_HAZARDOUS_AREA_CURRENTNESS_INTEGRATED = true as const;
export const NEW_HAZARDOUS_AREA_SOURCE_AUTO_RECLASSIFIES_AREA = false as const;
export const NEW_EQUIPMENT_SUITABILITY_EVIDENCE_AUTO_REPLACES_PRIOR_SELECTION = false as const;
export const NEW_CERTIFICATION_EVIDENCE_AUTO_APPROVES_EQUIPMENT = false as const;
export const D7_R10_R7_REQUIREMENT_CURRENTNESS_INTEGRATED = true as const;
export const NEW_SOURCE_REQUIREMENT_AUTO_REPLACES_ADOPTED_REQUIREMENT = false as const;
export const SUPERSEDED_REQUIREMENT_EXPOSED_AS_CURRENT = false as const;
export const D7_R10_R7_ASSUMPTION_CURRENTNESS_INTEGRATED = true as const;
export const SUPERSEDED_ASSUMPTION_EXPOSED_AS_CURRENT = false as const;
export const ASSUMPTION_CHANGE_AUTO_RECALCULATES_ENGINEERING = false as const;
export const D7_R10_R7_DECISION_CURRENTNESS_INTEGRATED = true as const;
export const SUPERSEDED_D7_DECISION_EXPOSED_AS_CURRENT = false as const;
export const NEW_DECISION_AUTO_DELETES_PRIOR_DECISION = false as const;
export const D7_R10_R7_CHANGE_REASSESSMENT_CURRENTNESS_INTEGRATED = true as const;
export const REASSESSMENT_REQUIRED_D7_RECORD_EXPOSED_AS_FULLY_CURRENT = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_INVALID = false as const;
export const D7_R10_R8_HANDOFF_CURRENTNESS_INTEGRATED = true as const;
export const STALE_D7_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D7_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const NEW_COUNTERPART_REVISION_AUTO_REPOINTS_HANDOFF = false as const;
export const NEW_SOURCE_REVISION_AUTO_REPOINTS_HANDOFF = false as const;
export const D7_R10_R9_REVIEW_CURRENTNESS_INTEGRATED = true as const;
export const STALE_D7_REVIEW_EXPOSED_AS_CURRENT = false as const;
export const D7_R10_R9_VALIDATION_CURRENTNESS_INTEGRATED = true as const;
export const D7_R10_REVIEW_STATE_AUTO_TRANSFER_ALLOWED = false as const;
export const D7_R10_VALIDATION_STATE_AUTO_TRANSFER_ALLOWED = false as const;
export const D7_R10_CANONICAL_THREAD_RELATIONSHIPS_IMPLEMENTED = true as const;
export const D7_R10_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D7_R10_AUTO_MUTATES_R2_SYSTEM_SOURCE_DISTRIBUTION = false as const;
export const D7_R10_AUTO_MUTATES_R3_LOAD_CONSUMER_EQUIPMENT = false as const;
export const D7_R10_AUTO_MUTATES_R4_FEEDER_CABLE_RATING = false as const;
export const D7_R10_AUTO_MUTATES_R5_CALCULATION_EVIDENCE = false as const;
export const D7_R10_AUTO_MUTATES_R6_PROTECTION_GROUNDING_HAZARDOUS_AREA = false as const;
export const D7_R10_AUTO_MUTATES_R7_REQUIREMENT_CHANGE = false as const;
export const D7_R10_AUTO_MUTATES_R8_HANDOFF = false as const;
export const D7_R10_AUTO_MUTATES_R9_REVIEW_VALIDATION = false as const;
export const D7_R10_PERFORMS_ENGINEERING_RECALCULATION = false as const;
export const D7_R10_PERFORMS_ELECTRICAL_REDESIGN = false as const;
export const D7_R10_PERFORMS_AUTOMATIC_REVALIDATION = false as const;
export const D7_R10_DETERMINES_CONFORMANCE = false as const;
export const D7_R10_APPROVES_ENGINEERING = false as const;
export const D7_R10_CERTIFIES_ENGINEERING = false as const;
export const TENANT_WORKSPACE_PROJECT_D7_R10_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D7_R10_ACCESS_ALLOWED = false as const;
export const D7_R10_PROVENANCE_REQUIRED = true as const;
export const D7_R10_PROVENANCE_PRESERVED = true as const;
export const AI_CAN_INVENT_D7_LINEAGE = false as const;
export const AI_CAN_AUTO_REPOINT_D7_HISTORY = false as const;
export const AI_CAN_PROMOTE_CURRENT_TO_VALIDATED = false as const;
export const ADMIN_CAN_OVERRIDE_D7_FINGERPRINT_MISMATCH_AS_VALID = false as const;
export const ADMIN_CAN_PROMOTE_CURRENT_TO_APPROVED = false as const;
export const D7_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R10_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D7_R10_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D7_R10_SUBJECT_KINDS = ["CONTEXT", "OBJECT", "SYSTEM", "SOURCE", "DISTRIBUTION", "LOAD", "CONSUMER", "SUPPLY", "FEEDER", "CABLE", "RATING", "EVIDENCE", "PROTECTION", "SETTING", "GROUNDING", "HAZARDOUS_AREA", "SUITABILITY", "REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE", "REASSESSMENT", "HANDOFF", "REVIEW_REQUEST", "FINDING", "DISPOSITION", "COMPLETION", "VALIDATION"] as const;
export const D7_R11_CANONICAL_PHASE = D7_IMPLEMENTATION_PHASES[10];
export const D7_R11_PHASE_TYPE = D7_IMPLEMENTATION_PHASE_TYPES[10];
export const D7_R11_CANONICAL_SCOPE =
  "Implement the read-only canonical D7-to-D9 source contract using exact D7 R1-R10 revisions. Expose governed Electrical truth, provenance, currentness, exact revisions, authority, applicability, limitations and fingerprint to future D9 intelligence without creating new Electrical facts, deriving missing engineering values, mutating D7 source truth, transferring discipline authority or starting D9 runtime. D9 integration remains zero and global cross-discipline reasoning remains zero." as const;
export const D7_R11_STARTED = false as const;
export const D7_R10_READY_FOR_NEXT_PHASE = true as const;
export const D7_R10_NEXT_PHASE = D7_R11_CANONICAL_PHASE;
export const D7_R10_NEXT_PHASE_TYPE = D7_R11_PHASE_TYPE;
export const D7_R10_CANONICAL_NEXT_PHASE = D7_R11_CANONICAL_PHASE;
export const D7_R10_CANONICAL_NEXT_PHASE_SCOPE = D7_R11_CANONICAL_SCOPE;
export const D7_R10_BLOCKER = "NONE" as const;
export const D7_R10_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const UNAUTHORIZED_D7_R11_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_INFERRED_THREAD_RELATIONSHIP = false as const;
export const UNAUTHORIZED_REVIEW_TRANSFER_TO_NEW_REVISION = false as const;
export const UNAUTHORIZED_VALIDATION_TRANSFER_TO_NEW_REVISION = false as const;
export const UNAUTHORIZED_CURRENT_TO_VALIDATED_PROMOTION = false as const;
export const UNAUTHORIZED_CURRENT_TO_APPROVED_PROMOTION = false as const;
export const UNAUTHORIZED_ELECTRICAL_REDESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_REVALIDATION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;

export {
  D7_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D7_REVIEW_VALIDATION_RUNTIME_READY,
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
  D7_PRIOR_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION,
  D7_PRIOR_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION,
  STALE_D7_VALIDATION_EXPOSED_AS_CURRENT_VALIDATION,
  SUPERSEDED_D7_VALIDATION_EXPOSED_AS_CURRENT_VALIDATION,
  REASSESSMENT_COMPLETED_EQUALS_VALIDATED,
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
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_APPROVAL_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
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
  UNAUTHORIZED_PARALLEL_CURRENTNESS_ENGINE,
  UNAUTHORIZED_PARALLEL_DIGITAL_THREAD,
  UNAUTHORIZED_SECOND_FINGERPRINT_ALGORITHM,
  UNAUTHORIZED_INFERRED_LINEAGE,
  UNAUTHORIZED_HISTORICAL_AUTO_REPOINT,
  UNAUTHORIZED_ELECTRICAL_CALCULATION_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_DESIGN_PROMOTION,
  UNAUTHORIZED_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_APPROVAL_PROMOTION,
  UNAUTHORIZED_CERTIFICATION_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set(["matching_tag", "matching_name", "matching_value", "same_voltage", "same_system", "topology", "topology_proximity", "document_co_occurrence", "semantic_similarity", "ai_inference", "ai_interpretation", "inferred", "name", "tag"]);
const PROPAGATION = new Set(["DEPENDS_ON", "BASED_ON", "AFFECTS", "USES", "SUPPORTED_BY", "CONSTRAINED_BY", "PARENT", "OBJECT_REFERENCE", "REVIEWS"]);

type Currentness = (typeof D7_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D7_R10_SUBJECT_KINDS)[number];
type Prohibited = {
  infer?: boolean;
  identicalTags?: boolean;
  sameVoltage?: boolean;
  sameSystem?: boolean;
  topology?: boolean;
  documentCoOccurrence?: boolean;
  semantic?: boolean;
  repoint?: boolean;
  replaceAdoptedLoad?: boolean;
  recalculateLoad?: boolean;
  repointFeeder?: boolean;
  repointCable?: boolean;
  replaceRating?: boolean;
  replaceEvidence?: boolean;
  adoptEvidence?: boolean;
  replaceSetting?: boolean;
  invalidateSetting?: boolean;
  validateCoordination?: boolean;
  replaceGrounding?: boolean;
  validateGrounding?: boolean;
  reclassifyArea?: boolean;
  replaceSuitability?: boolean;
  approveEquipment?: boolean;
  replaceAdoptedRequirement?: boolean;
  recalculateFromAssumption?: boolean;
  deleteDecision?: boolean;
  repointHandoff?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateR7?: boolean;
  mutateR8?: boolean;
  mutateR9?: boolean;
  recalculate?: boolean;
  redesign?: boolean;
  revalidate?: boolean;
  conform?: boolean;
  approve?: boolean;
  certify?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  repairFingerprint?: boolean;
  rebaselineFingerprint?: boolean;
  overrideMismatch?: boolean;
  promoteValidated?: boolean;
  promoteApproved?: boolean;
  d9?: boolean;
  reason?: boolean;
};

export type D7R10Actor = D7R1Actor & { actorKind?: string };

export type D7R10Pin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
};

type Endpoint = { subjectKind: string; subjectId: string; subjectRevision: string; subjectFingerprint: string };
type Hit = { revision: string; fingerprint: string; status: string; currentness: string; contextId: string; tenantId: string };
type Row = { provenanceRef: string; fingerprint: string; recordStatus: string; currentness: string; contextId?: string; tenantId: string };

export type D7R10LineageRecord = {
  lineageId: string;
  contextId: string;
  source: D7R10Pin;
  target: D7R10Pin;
  relationshipType: string;
  electricalDependency: (typeof D7_R7_DEPENDENCY_TARGETS)[number] | null;
  authoritative: boolean;
  candidate: boolean;
  citedCurrentness: Currentness;
  engineeringValidated: false;
  approved: false;
  conformant: false;
  certified: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT";
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D7R10SupersessionRecord = {
  supersessionId: string;
  contextId: string;
  predecessor: D7R10Pin;
  successor: D7R10Pin;
  deleted: false;
  historicalEdgesRewritten: false;
  priorRevisionInvalidated: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D7R10CurrentnessMark = {
  eventId: string;
  contextId: string;
  subject: D7R10Pin;
  currentness: Currentness;
  engineeringInvalid: false;
  engineeringValidated: false;
  rejected: false;
  approved: false;
  conformant: false;
  certified: false;
  contentMutated: false;
  recalculated: false;
  redesigned: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D7R10History = { historyId: string; subjectKind: "LINEAGE" | "SUPERSESSION" | "CURRENTNESS"; subjectId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D7R10Store = { r9: D7R9Store; now: () => string; lineage: D7R10LineageRecord[]; supersessions: D7R10SupersessionRecord[]; marks: D7R10CurrentnessMark[]; history: D7R10History[] };
export type D7R10Trace = { origin: D7R10Pin; nodes: D7R10Pin[]; edges: D7R10LineageRecord[]; currentness: Currentness };

function fail(code: string): never {
  throw new Error(`D7_R10_${code}`);
}

function blockedParty(value: string): boolean {
  const token = value.toUpperCase();
  return token === "AI" || token.startsWith("AI_") || token.startsWith("AI-") || token.startsWith("AI ") || token.includes("LLM") || token.includes("OPTIMIZER");
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase())) fail(code);
  if (INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail("INFERRED_LINEAGE_REJECTED");
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function isCurrentness(value: string): value is Currentness {
  return (D7_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.identicalTags === true || input.sameVoltage === true || input.sameSystem === true || input.topology === true || input.documentCoOccurrence === true || input.semantic === true) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint === true || input.repointFeeder === true || input.repointCable === true || input.repointHandoff === true) fail("AUTO_REPOINT_REJECTED");
  if (input.replaceAdoptedLoad === true || input.recalculateLoad === true) fail("LOAD_AUTO_REPLACEMENT_REJECTED");
  if (input.replaceRating === true) fail("RATING_AUTO_REPLACEMENT_REJECTED");
  if (input.replaceEvidence === true || input.adoptEvidence === true) fail("EVIDENCE_AUTO_REPLACEMENT_REJECTED");
  if (input.replaceSetting === true || input.invalidateSetting === true || input.validateCoordination === true) fail("PROTECTION_AUTO_REPLACEMENT_REJECTED");
  if (input.replaceGrounding === true || input.validateGrounding === true) fail("GROUNDING_AUTO_REPLACEMENT_REJECTED");
  if (input.reclassifyArea === true || input.replaceSuitability === true || input.approveEquipment === true) fail("HAZARDOUS_AREA_AUTO_REPLACEMENT_REJECTED");
  if (input.replaceAdoptedRequirement === true) fail("REQUIREMENT_AUTO_REPLACEMENT_REJECTED");
  if (input.recalculateFromAssumption === true) fail("ASSUMPTION_RECALCULATION_REJECTED");
  if (input.deleteDecision === true) fail("DECISION_DELETION_REJECTED");
  if (input.mutateR1 === true) fail("R1_MUTATION_REJECTED");
  if (input.mutateR2 === true) fail("R2_MUTATION_REJECTED");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR4 === true) fail("R4_MUTATION_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.mutateR6 === true) fail("R6_MUTATION_REJECTED");
  if (input.mutateR7 === true) fail("R7_MUTATION_REJECTED");
  if (input.mutateR8 === true) fail("R8_MUTATION_REJECTED");
  if (input.mutateR9 === true) fail("R9_MUTATION_REJECTED");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R10");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R10");
  if (input.revalidate === true) fail("REVALIDATION_NOT_IN_R10");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R10");
  if (input.approve === true || input.promoteApproved === true) fail("APPROVAL_NOT_IN_R10");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R10");
  if (input.promoteValidated === true) fail("CURRENT_NOT_VALIDATED");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.repairFingerprint === true || input.rebaselineFingerprint === true || input.overrideMismatch === true) fail("FINGERPRINT_OVERRIDE_REJECTED");
  if (input.d9 === true) fail("D9_NOT_STARTED");
  if (input.reason === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10");
}

function assertScope(actor: D7R10Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D7R10Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_CANNOT_INVENT_LINEAGE");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority === "ELECTRICAL_ENGINEERING_AUTHORITY" || actor.authority === "REVIEWER" || actor.authority === "ELECTRICAL_VALIDATION_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D7_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  return cited;
}

function remember(store: D7R10Store, subjectKind: D7R10History["subjectKind"], subjectId: string, fingerprint: string): void {
  store.history.push({ historyId: `d7r10-history-${store.history.length + 1}`, subjectKind, subjectId, action: "CREATED", fingerprint, recordedAt: store.now() });
}

function rowHit(row: Row | undefined, revision?: string): Hit | undefined {
  if (!row) return undefined;
  return { revision: revision ?? row.provenanceRef, fingerprint: row.fingerprint, status: row.recordStatus, currentness: row.currentness, contextId: row.contextId ?? "", tenantId: row.tenantId };
}

function pinKey(pin: D7R10Pin): string {
  return `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${pin.subjectFingerprint}`;
}

function locate(store: D7R10Store, kind: SubjectKind, id: string): Hit | undefined {
  const r8 = store.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  const r1 = r2.r1;
  if (kind === "CONTEXT") return rowHit(r1.contexts.find((row) => row.contextId === id));
  if (kind === "OBJECT") return rowHit(r1.objects.find((row) => row.objectId === id));
  if (kind === "SYSTEM") return rowHit(r2.systems.find((row) => row.systemRecordId === id));
  if (kind === "SOURCE") return rowHit(r2.sources.find((row) => row.sourceRecordId === id));
  if (kind === "DISTRIBUTION") return rowHit(r2.distributions.find((row) => row.distributionRecordId === id));
  if (kind === "LOAD") return rowHit(r3.loads.find((row) => row.loadRecordId === id));
  if (kind === "CONSUMER") return rowHit(r3.consumers.find((row) => row.consumerRecordId === id));
  if (kind === "SUPPLY") return rowHit(r3.supplies.find((row) => row.supplyRecordId === id));
  if (kind === "FEEDER") return rowHit(r4.feeders.find((row) => row.feederRecordId === id));
  if (kind === "CABLE") return rowHit(r4.cables.find((row) => row.cableRecordId === id));
  if (kind === "RATING") return rowHit(r4.ratings.find((row) => row.ratingRecordId === id));
  if (kind === "EVIDENCE") return rowHit(r5.evidence.find((row) => row.evidenceId === id));
  if (kind === "PROTECTION") return rowHit(r6.devices.find((row) => row.deviceRecordId === id));
  if (kind === "SETTING") return rowHit(r6.settings.find((row) => row.settingRecordId === id));
  if (kind === "GROUNDING") return rowHit(r6.grounding.find((row) => row.groundingRecordId === id));
  if (kind === "HAZARDOUS_AREA") return rowHit(r6.hazardousAreas.find((row) => row.areaRecordId === id));
  if (kind === "SUITABILITY") return rowHit(r6.suitability.find((row) => row.suitabilityRecordId === id));
  if (kind === "REQUIREMENT") return rowHit(r7.requirements.find((row) => row.requirementId === id));
  if (kind === "ASSUMPTION") return rowHit(r7.assumptions.find((row) => row.assumptionId === id));
  if (kind === "DECISION") return rowHit(r7.decisions.find((row) => row.decisionId === id));
  if (kind === "CHANGE") return rowHit(r7.changes.find((row) => row.changeId === id));
  if (kind === "REASSESSMENT") return rowHit(r7.reassessments.find((row) => row.reassessmentId === id));
  if (kind === "HANDOFF") return rowHit(r8.handoffs.find((row) => row.handoffId === id));
  if (kind === "REVIEW_REQUEST") {
    const row = store.r9.requests.find((item) => item.reviewRequestId === id);
    return rowHit(row, row?.subjectRevision);
  }
  if (kind === "FINDING") {
    const row = store.r9.findings.find((item) => item.findingId === id);
    return rowHit(row, row?.subjectRevision);
  }
  if (kind === "DISPOSITION") {
    const row = store.r9.dispositions.find((item) => item.dispositionId === id);
    return rowHit(row, row?.subjectRevision);
  }
  if (kind === "COMPLETION") {
    const row = store.r9.completions.find((item) => item.completionId === id);
    return rowHit(row, row?.subjectRevision);
  }
  const row = store.r9.validations.find((item) => item.validationId === id);
  return rowHit(row, row?.subjectRevision);
}

function reassessmentBlocksCurrent(store: D7R10Store, pin: D7R10Pin): boolean {
  const rows = store.r9.r8.r7.reassessments;
  if (pin.subjectKind === "REASSESSMENT") {
    const row = rows.find((item) => item.reassessmentId === pin.subjectId && item.fingerprint === pin.subjectFingerprint);
    return row?.state === "REASSESSMENT_REQUIRED" && row.recordStatus === "CURRENT";
  }
  return rows.some((row) => row.recordStatus === "CURRENT" && row.state === "REASSESSMENT_REQUIRED" && row.targetId === pin.subjectId && row.targetFingerprint === pin.subjectFingerprint);
}

function storedCurrentness(store: D7R10Store, subject: D7R10Pin): Currentness {
  const hit = locate(store, subject.subjectKind, subject.subjectId);
  if (!hit || !isCurrentness(hit.currentness) || hit.fingerprint !== subject.subjectFingerprint) fail("CURRENTNESS_INVALID");
  return hit.currentness;
}

export function exposedElectricalCurrentness(store: D7R10Store, subject: D7R10Pin): Currentness {
  const overlay = [...store.marks].reverse().find((row) => pinKey(row.subject) === pinKey(subject));
  const base = overlay?.currentness ?? storedCurrentness(store, subject);
  if (base === "CURRENT" && reassessmentBlocksCurrent(store, subject)) return "REASSESSMENT_REQUIRED";
  return base;
}

function live(store: D7R10Store, actor: D7R10Actor, contextId: string, endpoint: Endpoint, cited: Currentness): D7R10Pin {
  const subjectKind = explicit(endpoint.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D7_R10_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(endpoint.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(endpoint.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(endpoint.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const context = store.r9.r8.r7.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D7_DISCIPLINE) fail("DISCIPLINE_NOT_ELECTRICAL");
  const hit = locate(store, subjectKind as SubjectKind, subjectId);
  if (!hit || hit.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
  if (hit.contextId !== "" && hit.contextId !== context.contextId) fail("SUBJECT_NOT_FOUND");
  if (hit.fingerprint !== subjectFingerprint || hit.revision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
  const pin: D7R10Pin = { subjectKind: subjectKind as SubjectKind, subjectId, subjectRevision, subjectFingerprint, contextId: context.contextId };
  const effective = exposedElectricalCurrentness(store, pin);
  if (effective === "STALE" && cited === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  if (effective === "SUPERSEDED" && cited === "CURRENT") fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  if (effective === "REASSESSMENT_REQUIRED" && cited === "CURRENT") fail("REASSESSMENT_EXPOSED_AS_CURRENT");
  if (cited === "CURRENT" && (hit.status !== "CURRENT" || effective !== "CURRENT")) fail("SUBJECT_NOT_CURRENT");
  if (hit.status === "SUPERSEDED" && cited !== "SUPERSEDED") fail("SUBJECT_NOT_CURRENT");
  return pin;
}

function snapshot(store: D7R10Store): string {
  const r8 = store.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r4 = r6.r5.r4;
  return JSON.stringify({
    objects: r6.r5.r1.objects,
    systems: r4.r3.r2.systems,
    sources: r4.r3.r2.sources,
    distributions: r4.r3.r2.distributions,
    loads: r4.r3.loads,
    feeders: r4.feeders,
    cables: r4.cables,
    ratings: r4.ratings,
    evidence: r6.r5.evidence,
    devices: r6.devices,
    settings: r6.settings,
    grounding: r6.grounding,
    hazardousAreas: r6.hazardousAreas,
    suitability: r6.suitability,
    requirements: r7.requirements,
    assumptions: r7.assumptions,
    decisions: r7.decisions,
    changes: r7.changes,
    reassessments: r7.reassessments,
    handoffs: r8.handoffs,
    requests: store.r9.requests,
    findings: store.r9.findings,
    validations: store.r9.validations,
  });
}

function downstream(store: D7R10Store, origin: D7R10Pin): D7R10Pin[] {
  const found: D7R10Pin[] = [];
  const seen = new Set<string>([pinKey(origin)]);
  let frontier = [origin];
  for (let depth = 0; depth < THREAD_DEFAULT_MAX_DEPTH && frontier.length > 0; depth += 1) {
    const next: D7R10Pin[] = [];
    for (const pin of frontier) {
      for (const edge of store.lineage) {
        if (!edge.authoritative || edge.candidate || edge.contextId !== origin.contextId) continue;
        if (pinKey(edge.source) !== pinKey(pin) || !PROPAGATION.has(edge.relationshipType)) continue;
        const key = pinKey(edge.target);
        if (seen.has(key)) continue;
        seen.add(key);
        found.push(edge.target);
        next.push(edge.target);
      }
    }
    frontier = next;
  }
  return found;
}

function markOf(store: D7R10Store, actor: D7R10Actor, eventId: string, subject: D7R10Pin, currentness: Currentness, provenanceRef: string): D7R10CurrentnessMark {
  const fingerprint = fingerprintCanonical({ eventId, subject, currentness, provenanceRef, engineeringInvalid: false, engineeringValidated: false, contentMutated: false });
  return Object.freeze({
    eventId, contextId: subject.contextId, subject, currentness, engineeringInvalid: false, engineeringValidated: false, rejected: false, approved: false, conformant: false, certified: false,
    contentMutated: false, recalculated: false, redesigned: false, provenanceRef, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(),
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
}

function collectPins(store: D7R10Store, actor: D7R10Actor): D7R10Pin[] {
  const pins: D7R10Pin[] = [];
  const push = (kind: SubjectKind, id: string) => {
    const hit = locate(store, kind, id);
    if (!hit || hit.tenantId !== actor.tenantId) return;
    pins.push({ subjectKind: kind, subjectId: id, subjectRevision: hit.revision, subjectFingerprint: hit.fingerprint, contextId: hit.contextId });
  };
  const r8 = store.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r4 = r6.r5.r4;
  const r2 = r4.r3.r2;
  r2.r1.contexts.forEach((row) => push("CONTEXT", row.contextId));
  r2.r1.objects.forEach((row) => push("OBJECT", row.objectId));
  r2.systems.forEach((row) => push("SYSTEM", row.systemRecordId));
  r2.sources.forEach((row) => push("SOURCE", row.sourceRecordId));
  r2.distributions.forEach((row) => push("DISTRIBUTION", row.distributionRecordId));
  r4.r3.loads.forEach((row) => push("LOAD", row.loadRecordId));
  r4.r3.consumers.forEach((row) => push("CONSUMER", row.consumerRecordId));
  r4.r3.supplies.forEach((row) => push("SUPPLY", row.supplyRecordId));
  r4.feeders.forEach((row) => push("FEEDER", row.feederRecordId));
  r4.cables.forEach((row) => push("CABLE", row.cableRecordId));
  r4.ratings.forEach((row) => push("RATING", row.ratingRecordId));
  r6.r5.evidence.forEach((row) => push("EVIDENCE", row.evidenceId));
  r6.devices.forEach((row) => push("PROTECTION", row.deviceRecordId));
  r6.settings.forEach((row) => push("SETTING", row.settingRecordId));
  r6.grounding.forEach((row) => push("GROUNDING", row.groundingRecordId));
  r6.hazardousAreas.forEach((row) => push("HAZARDOUS_AREA", row.areaRecordId));
  r6.suitability.forEach((row) => push("SUITABILITY", row.suitabilityRecordId));
  r7.requirements.forEach((row) => push("REQUIREMENT", row.requirementId));
  r7.assumptions.forEach((row) => push("ASSUMPTION", row.assumptionId));
  r7.decisions.forEach((row) => push("DECISION", row.decisionId));
  r7.changes.forEach((row) => push("CHANGE", row.changeId));
  r7.reassessments.forEach((row) => push("REASSESSMENT", row.reassessmentId));
  r8.handoffs.forEach((row) => push("HANDOFF", row.handoffId));
  store.r9.requests.forEach((row) => push("REVIEW_REQUEST", row.reviewRequestId));
  store.r9.findings.forEach((row) => push("FINDING", row.findingId));
  store.r9.dispositions.forEach((row) => push("DISPOSITION", row.dispositionId));
  store.r9.completions.forEach((row) => push("COMPLETION", row.completionId));
  store.r9.validations.forEach((row) => push("VALIDATION", row.validationId));
  return pins;
}

export function createD7R10Store(r9: D7R9Store, now: () => string = () => r9.now()): D7R10Store {
  if (R9_RUNTIME_COUNT !== 9) fail("R9_RUNTIME_COUNT_UNEXPECTED");
  const r7 = r9.r8.r7;
  if (r7.r6.r5.r1 !== r7.r1 || r7.r6.r5.r4.r1 !== r7.r1 || r7.r6.r5.r4.r2.r1 !== r7.r1 || r7.r6.r5.r4.r3.r1 !== r7.r1 || r7.r6.r5.r4.r3.r2 !== r7.r6.r5.r4.r2) fail("R1_R9_STORE_MISMATCH");
  return { r9, now, lineage: [], supersessions: [], marks: [], history: [] };
}

export function currentElectricalThreadPins(store: D7R10Store, actor: D7R10Actor): D7R10Pin[] {
  return collectPins(store, actor).filter((pin) => {
    const context = store.r9.r8.r7.r1.contexts.find((row) => row.contextId === pin.contextId && row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
    return context != null && exposedElectricalCurrentness(store, pin) === "CURRENT";
  });
}

export function recordElectricalLineage(store: D7R10Store, actor: D7R10Actor, input: Prohibited & {
  lineageId: string; contextId: string; source: Endpoint; target: Endpoint; relationshipType: string; electricalDependency?: string | null; authoritative?: boolean; candidate?: boolean; citedCurrentness: string; provenanceRef: string; assertedFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D7R10LineageRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const relationshipType = explicit(input.relationshipType, "RELATIONSHIP_REQUIRED");
  if (relationshipType === "SUPERSEDES") fail("SUPERSESSION_FUNCTION_REQUIRED");
  const identity = (D7_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(relationshipType);
  if (!identity && (!isGovernedRelationType(relationshipType) || !relationSemantics(relationshipType))) fail("RELATION_NOT_GOVERNED");
  const source = live(store, actor, contextId, input.source, cited);
  const target = live(store, actor, contextId, input.target, cited);
  if (pinKey(source) === pinKey(target)) fail("LINEAGE_SELF_LINK_REJECTED");
  let electricalDependency: D7R10LineageRecord["electricalDependency"] = null;
  if (input.electricalDependency != null && input.electricalDependency !== "") {
    const dependency = explicit(input.electricalDependency, "DEPENDENCY_NOT_EXPLICIT");
    if (!(D7_R7_DEPENDENCY_TARGETS as readonly string[]).includes(dependency)) fail("DEPENDENCY_NOT_EXPLICIT");
    electricalDependency = dependency as D7R10LineageRecord["electricalDependency"];
  }
  if (downstream(store, target).some((pin) => pinKey(pin) === pinKey(source))) fail("CIRCULAR_LINEAGE_REJECTED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const lineageId = explicit(input.lineageId, "LINEAGE_ID_REQUIRED");
  const authoritative = input.authoritative !== false && input.candidate !== true;
  const fingerprint = fingerprintCanonical({ lineageId, contextId: source.contextId, source, target, relationshipType, electricalDependency, authoritative, candidate: input.candidate === true, citedCurrentness: cited, provenanceRef, engineeringValidated: false });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.lineage.find((row) => row.lineageId === lineageId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("LINEAGE_ALREADY_RECORDED");
  const signature = `${pinKey(source)}|${pinKey(target)}|${relationshipType}|${electricalDependency ?? ""}`;
  if (store.lineage.some((row) => `${pinKey(row.source)}|${pinKey(row.target)}|${row.relationshipType}|${row.electricalDependency ?? ""}` === signature)) fail("DUPLICATE_LINEAGE_REJECTED");
  const before = snapshot(store);
  const record: D7R10LineageRecord = Object.freeze({
    lineageId, contextId: source.contextId, source, target, relationshipType, electricalDependency, authoritative, candidate: input.candidate === true, citedCurrentness: cited,
    engineeringValidated: false, approved: false, conformant: false, certified: false, provenanceRef, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT",
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  store.lineage.push(record);
  remember(store, "LINEAGE", record.lineageId, record.fingerprint);
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return record;
}

export function recordElectricalSupersession(store: D7R10Store, actor: D7R10Actor, input: Prohibited & {
  supersessionId: string; contextId: string; predecessor: Endpoint; successor: Endpoint; citedCurrentness: string; provenanceRef: string; assertedFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D7R10SupersessionRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const predecessor = live(store, actor, contextId, input.predecessor, "STALE");
  const successor = live(store, actor, contextId, input.successor, cited === "SUPERSEDED" ? "CURRENT" : cited);
  if (predecessor.subjectKind !== successor.subjectKind) fail("SUPERSESSION_KIND_MISMATCH");
  if (pinKey(predecessor) === pinKey(successor)) fail("SUPERSESSION_SELF_REJECTED");
  if (exposedElectricalCurrentness(store, predecessor) === "SUPERSEDED") fail("FALSE_SUPERSESSION_REJECTED");
  const beforeEdges = store.lineage.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const supersessionId = explicit(input.supersessionId, "SUPERSESSION_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ supersessionId, contextId, predecessor, successor, provenanceRef });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.supersessions.find((row) => row.supersessionId === supersessionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("SUPERSESSION_ALREADY_RECORDED");
  const pair = `${pinKey(predecessor)}>${pinKey(successor)}`;
  if (store.supersessions.some((row) => `${pinKey(row.predecessor)}>${pinKey(row.successor)}` === pair)) fail("DUPLICATE_SUPERSESSION_REJECTED");
  const before = snapshot(store);
  const record: D7R10SupersessionRecord = Object.freeze({
    supersessionId, contextId, predecessor, successor, deleted: false, historicalEdgesRewritten: false, priorRevisionInvalidated: false, provenanceRef, fingerprint,
    recordedBy: actor.actorId, recordedAt: store.now(), tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  store.supersessions.push(record);
  remember(store, "SUPERSESSION", record.supersessionId, record.fingerprint);
  const mark = markOf(store, actor, `mark-${supersessionId}`, predecessor, "SUPERSEDED", provenanceRef);
  if (mark.currentness === "CURRENT" || mark.engineeringValidated || mark.engineeringInvalid) fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  store.marks.push(mark);
  remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  if (store.lineage.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|") !== beforeEdges) fail("HISTORICAL_REFERENCE_REWRITTEN");
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return record;
}

export function recordElectricalCurrentness(store: D7R10Store, actor: D7R10Actor, input: Prohibited & {
  eventId: string; contextId: string; subject: Endpoint; currentness: string; propagate?: boolean; provenanceRef: string; assertedFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D7R10CurrentnessMark[] {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const currentness = currentnessOf(input.currentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const subject = live(store, actor, contextId, input.subject, currentness === "CURRENT" ? "CURRENT" : currentness === "SUPERSEDED" ? "STALE" : currentness);
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const eventId = explicit(input.eventId, "CURRENTNESS_EVENT_REQUIRED");
  const root = markOf(store, actor, eventId, subject, currentness, provenanceRef);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== root.fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.marks.find((row) => row.eventId === eventId);
  if (existing) return existing.fingerprint === root.fingerprint && existing.tenantId === actor.tenantId ? [existing] : fail("CURRENTNESS_ALREADY_RECORDED");
  const latest = [...store.marks].reverse().find((row) => pinKey(row.subject) === pinKey(subject));
  if (currentness === "CURRENT" && latest && latest.currentness !== "CURRENT") fail("CURRENTNESS_PROMOTION_REJECTED");
  if (currentness !== "CURRENT" && (root.currentness === "CURRENT" || root.engineeringValidated)) fail("STALE_EXPOSED_AS_CURRENT");
  if (currentness === "REASSESSMENT_REQUIRED" && (root.engineeringValidated || root.currentness === "CURRENT")) fail("REASSESSMENT_EXPOSED_AS_VALIDATED");
  const before = snapshot(store);
  const created = [root];
  if (input.propagate === true && currentness !== "CURRENT") {
    const propagated = currentness === "SUPERSEDED" ? "REASSESSMENT_REQUIRED" : currentness;
    downstream(store, subject).forEach((pin, index) => created.push(markOf(store, actor, `${eventId}-${index + 1}`, pin, propagated, provenanceRef)));
  }
  for (const mark of created) {
    if (mark.engineeringInvalid || mark.rejected || mark.approved || mark.contentMutated || mark.recalculated || mark.redesigned || mark.engineeringValidated) fail("CONTENT_MUTATION_REJECTED");
    store.marks.push(mark);
    remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  }
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return created;
}

export function traceElectricalDigitalThread(store: D7R10Store, actor: D7R10Actor, input: { contextId: string; subject: Endpoint; citedCurrentness: string; tenantId?: string; workspaceId?: string; projectId?: string }): D7R10Trace {
  assertRecorder(actor);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const origin = live(store, actor, explicit(input.contextId, "R1_CONTEXT_REQUIRED"), input.subject, cited);
  const nodes = [origin, ...downstream(store, origin)];
  const keys = new Set(nodes.map(pinKey));
  const edges = store.lineage.filter((edge) => edge.contextId === origin.contextId && edge.authoritative && !edge.candidate && keys.has(pinKey(edge.source)) && keys.has(pinKey(edge.target)));
  const currentness = exposedElectricalCurrentness(store, origin);
  if (currentness !== "CURRENT" && cited === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  return { origin, nodes, edges, currentness };
}

export function repointElectricalDigitalThread(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function inferElectricalLineage(): never { return fail("INFERRED_LINEAGE_REJECTED"); }
export function replaceAdoptedElectricalLoadFromCurrentness(): never { return fail("LOAD_AUTO_REPLACEMENT_REJECTED"); }
export function replaceElectricalEvidenceFromCurrentness(): never { return fail("EVIDENCE_AUTO_REPLACEMENT_REJECTED"); }
export function replaceElectricalSettingFromCurrentness(): never { return fail("PROTECTION_AUTO_REPLACEMENT_REJECTED"); }
export function replaceElectricalGroundingFromCurrentness(): never { return fail("GROUNDING_AUTO_REPLACEMENT_REJECTED"); }
export function reclassifyElectricalHazardousAreaFromCurrentness(): never { return fail("HAZARDOUS_AREA_AUTO_REPLACEMENT_REJECTED"); }
export function transferElectricalReviewFromCurrentness(): never { return fail("REVIEW_TRANSFER_REJECTED"); }
export function transferElectricalValidationFromCurrentness(): never { return fail("VALIDATION_TRANSFER_REJECTED"); }
export function repairElectricalFingerprint(): never { return fail("FINGERPRINT_OVERRIDE_REJECTED"); }
export function recalculateFromElectricalCurrentness(): never { return fail("RECALCULATION_NOT_IN_R10"); }
export function redesignFromElectricalCurrentness(): never { return fail("REDESIGN_NOT_IN_R10"); }
export function revalidateFromElectricalCurrentness(): never { return fail("REVALIDATION_NOT_IN_R10"); }
export function approveFromElectricalCurrentness(): never { return fail("APPROVAL_NOT_IN_R10"); }
export function reasonAcrossElectricalCurrentness(): never { return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10"); }
