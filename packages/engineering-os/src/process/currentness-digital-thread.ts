/**
 * EOS-D6-R10 Process currentness and digital thread.
 * One bounded runtime. Records explicit lineage, supersession, and currentness
 * across exact D6 R1-R9 revisions. Reuses canonical currentness, digital-thread,
 * and fingerprint mechanisms. Does not rewrite history, infer lineage, mutate
 * engineering, transfer validation, or start D9.
 */
import { D6_CURRENTNESS_STATES, D6_IMPLEMENTATION_PHASE_TYPES, D6_IMPLEMENTATION_PHASES } from "@rtb/types";
import { isGovernedRelationType } from "../decision-intelligence/relations";
import { relationSemantics } from "../digital-thread/relation-semantics";
import { THREAD_DEFAULT_MAX_DEPTH } from "../digital-thread/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED } from "../structural-systems/interface-handoff-governance";
import {
  D6_CONTEXT_AUTHORITY,
  D6_DISCIPLINE,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_EXPLICIT_RELATIONSHIP_KINDS,
  D6_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED,
  D6_INFERRED_LINEAGE_ALLOWED,
  type D6R1Actor,
} from "./identity-foundation";
import { D6_R7_DEPENDENCY_TARGETS } from "./requirements-assumptions-change";
import {
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
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
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as R9_THREAD_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_READY,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D6_REVIEW_VALIDATION_RUNTIME_READY,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_RUNTIME_COUNT as R9_RUNTIME_COUNT,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D5_REOPEN,
  UNAUTHORIZED_D7_RUNTIME_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
  type D6R9Store,
} from "./review-validation-governance";

export const D6_R10_STATUS = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D6_R10_MATURITY = D6_R10_STATUS;
export const D6_R10_MATURITY_STATE = D6_R10_STATUS;
export const D6_R10_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D6_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md" as const;
export const D6_RUNTIME_STARTED = true as const;
export const D6_RUNTIME_COUNT = 10 as const;
export const D6_R9_RUNTIME_COUNT = R9_RUNTIME_COUNT;
export const D6_R9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = R9_THREAD_COUNT;
export const D6_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED = true as const;
export const D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 1 as const;
export const D6_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = true as const;
export const D6_R1_R9_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D6_R10_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D6_R10_REFERENCE_ALLOWED = false as const;
export const D6_R10_SOURCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D6_R10_THREAD_DEPTH_REUSED = THREAD_DEFAULT_MAX_DEPTH;
export const D6_EXPLICIT_LINEAGE_SUPPORTED = true as const;
export const D6_CURRENT_RECORD_IDENTIFICATION_IMPLEMENTED = true as const;
export const D6_STALE_RECORD_STATE_SUPPORTED = true as const;
export const D6_SUPERSEDED_RECORD_STATE_SUPPORTED = true as const;
export const CURRENT_D6_RECORD_EQUALS_VALIDATED = false as const;
export const CURRENT_D6_RECORD_EQUALS_APPROVED = false as const;
export const CURRENT_D6_RECORD_EQUALS_CONFORMANT = false as const;
export const CURRENT_D6_RECORD_EQUALS_CERTIFIED = false as const;
export const STALE_D6_RECORD_EQUALS_INVALID = false as const;
export const STALE_D6_RECORD_EQUALS_REJECTED = false as const;
export const SUPERSEDED_D6_RECORD_EQUALS_INVALID = false as const;
export const SUPERSEDED_D6_RECORD_EQUALS_REJECTED = false as const;
export const D6_R10_HISTORY_PRESERVED = true as const;
export const D6_R10_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D6_R10_HISTORICAL_RECORD_MUTATED_TO_CURRENT = false as const;
export const D6_R10_AUTO_REPOINTS_SUPERSEDED_REFERENCE = false as const;
export const D6_R10_AUTO_REPOINTS_STALE_REFERENCE = false as const;
export const D6_R10_R1_IDENTITY_CURRENTNESS_INTEGRATED = true as const;
export const NEW_D6_IDENTITY_REVISION_AUTO_REPOINTS_HISTORY = false as const;
export const NEW_D6_IDENTITY_REVISION_AUTO_INVALIDATES_PRIOR_REVISION = false as const;
export const D6_R10_R2_CONTEXT_CURRENTNESS_INTEGRATED = true as const;
export const NEW_R2_CONTEXT_AUTO_REWRITES_HISTORICAL_RELATIONSHIP = false as const;
export const STALE_R2_CONTEXT_EXPOSED_AS_CURRENT = false as const;
export const D6_R10_R3_CONDITION_CURRENTNESS_INTEGRATED = true as const;
export const NEW_SOURCE_CONDITION_AUTO_REPLACES_ADOPTED_PROCESS_CONDITION = false as const;
export const NEW_OPERATING_CONDITION_AUTO_REPLACES_PRIOR_OPERATING_CONDITION = false as const;
export const NEW_DESIGN_CONDITION_AUTO_REPLACES_PRIOR_DESIGN_CONDITION = false as const;
export const D6_R10_R4_EVIDENCE_CURRENTNESS_INTEGRATED = true as const;
export const NEW_EXTERNAL_EVIDENCE_AUTO_REPLACES_PRIOR_EVIDENCE = false as const;
export const STALE_PROCESS_EVIDENCE_EXPOSED_AS_CURRENT = false as const;
export const D6_R10_R5_DUTY_UTILITY_CURRENTNESS_INTEGRATED = true as const;
export const NEW_DUTY_EVIDENCE_AUTO_REPLACES_ADOPTED_DUTY = false as const;
export const NEW_UTILITY_EVIDENCE_AUTO_REPLACES_ADOPTED_REQUIREMENT = false as const;
export const D6_R10_R6_SAFETY_RELIEF_CURRENTNESS_INTEGRATED = true as const;
export const NEW_RELIEF_EVIDENCE_AUTO_REPLACES_RELIEF_SCENARIO = false as const;
export const NEW_HAZARD_STUDY_OUTPUT_AUTO_CLOSES_PRIOR_FINDING = false as const;
export const NEW_SIL_LOPA_EVIDENCE_AUTO_REPLACES_PRIOR_SAFETY_REQUIREMENT = false as const;
export const D6_R10_R7_CHANGE_CURRENTNESS_INTEGRATED = true as const;
export const D6_R10_R7_REASSESSMENT_CURRENTNESS_INTEGRATED = true as const;
export const D6_R10_R7_SUPERSESSION_INTEGRATED = true as const;
export const REASSESSMENT_REQUIRED_D6_RECORD_EXPOSED_AS_VALIDATED = false as const;
export const REASSESSMENT_REQUIRED_D6_RECORD_EXPOSED_AS_FULLY_CURRENT = false as const;
export const SUPERSEDED_D6_RECORD_DELETED = false as const;
export const SUPERSEDED_D6_RECORD_EXPOSED_AS_CURRENT = false as const;
export const D6_R10_R8_INTERFACE_CURRENTNESS_INTEGRATED = true as const;
export const STALE_D6_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D6_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const D6_R10_AUTO_REPOINTS_INTERFACE_COUNTERPART = false as const;
export const D6_R10_AUTO_MUTATES_INTERFACE_COUNTERPART = false as const;
export const D6_R10_R9_REVIEW_CURRENTNESS_INTEGRATED = true as const;
export const PRIOR_D6_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const STALE_D6_REVIEW_EXPOSED_AS_CURRENT_REVIEW = false as const;
export const D6_R10_R9_VALIDATION_CURRENTNESS_INTEGRATED = true as const;
export const PRIOR_D6_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const STALE_D6_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D6_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const D6_R10_REVIEW_STATE_AUTO_TRANSFER_ALLOWED = false as const;
export const D6_R10_VALIDATION_STATE_AUTO_TRANSFER_ALLOWED = false as const;
export const D6_R10_FINGERPRINT_CURRENTNESS_INTEGRATED = true as const;
export const D6_R10_FINGERPRINT_MISMATCH_DETECTED = true as const;
export const D6_R10_FINGERPRINT_MISMATCH_AUTO_REPAIRED = false as const;
export const D6_R10_FINGERPRINT_MISMATCH_AUTO_REBASELINED = false as const;
export const D6_R10_CANONICAL_THREAD_RELATIONSHIPS_IMPLEMENTED = true as const;
export const D6_R10_INFERRED_THREAD_RELATIONSHIP_ALLOWED = false as const;
export const D6_R10_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D6_R10_AUTO_MUTATES_R2_CONTEXT = false as const;
export const D6_R10_AUTO_MUTATES_R3_CONDITIONS = false as const;
export const D6_R10_AUTO_MUTATES_R4_EVIDENCE = false as const;
export const D6_R10_AUTO_MUTATES_R5_DUTY_UTILITY = false as const;
export const D6_R10_AUTO_MUTATES_R6_SAFETY_RELIEF = false as const;
export const D6_R10_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D6_R10_AUTO_MUTATES_R8_HANDOFF = false as const;
export const D6_R10_AUTO_MUTATES_R9_REVIEW_VALIDATION = false as const;
export const D6_R10_TRIGGERS_PROCESS_RECALCULATION = false as const;
export const D6_R10_TRIGGERS_AUTOMATIC_REDESIGN = false as const;
export const D6_R10_TRIGGERS_AUTOMATIC_REVALIDATION = false as const;
export const D6_R10_TRIGGERS_AUTOMATIC_APPROVAL = false as const;
export const TENANT_WORKSPACE_PROJECT_D6_R10_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D6_R10_ACCESS_ALLOWED = false as const;
export const D6_R10_PROVENANCE_REQUIRED = true as const;
export const D6_R10_PROVENANCE_PRESERVED = true as const;
export const AI_CAN_INVENT_D6_LINEAGE_RELATIONSHIP = false as const;
export const AI_CAN_REPOINT_D6_HISTORICAL_REFERENCE = false as const;
export const ADMIN_CAN_OVERRIDE_D6_FINGERPRINT_MISMATCH_AS_VALID = false as const;
export const D6_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D6_R10_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D6_R10_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_R10_SUBJECT_KINDS = ["CONTEXT", "OBJECT", "SYSTEM", "STREAM", "SERVICE", "OPERATING_CASE", "DESIGN_CASE", "CONDITION", "OPERATING_CONDITION", "DESIGN_CONDITION", "DESIGN_BASIS", "EVIDENCE", "DUTY", "UTILITY", "SAFETY", "RELIEF", "REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE", "REASSESSMENT", "HANDOFF", "REVIEW_REQUEST", "FINDING", "DISPOSITION", "COMPLETION", "VALIDATION"] as const;
export const D6_R11_CANONICAL_PHASE = D6_IMPLEMENTATION_PHASES[10];
export const D6_R11_PHASE_TYPE = D6_IMPLEMENTATION_PHASE_TYPES[10];
export const D6_R11_CANONICAL_SCOPE = "Implement exactly one canonical D6-to-D9 source-contract runtime exposing existing D6 Process truth from exact R1-R10 revisions. Expose currentness, explicit lineage, provenance, authority, limitations, review/validation state and interface state without creating new engineering facts, deriving new engineering values, generating requirements/recommendations/decisions, transferring engineering authority or starting D9 reasoning/runtime. D9 integration remains zero." as const;
export const D6_R11_STARTED = false as const;
export const D6_R10_READY_FOR_NEXT_PHASE = true as const;
export const D6_R10_NEXT_PHASE = D6_R11_CANONICAL_PHASE;
export const D6_R10_NEXT_PHASE_TYPE = D6_R11_PHASE_TYPE;
export const D6_R10_CANONICAL_NEXT_PHASE = D6_R11_CANONICAL_PHASE;
export const D6_R10_CANONICAL_NEXT_PHASE_SCOPE = D6_R11_CANONICAL_SCOPE;
export const D6_R10_BLOCKER = "NONE" as const;
export const D6_R10_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const UNAUTHORIZED_D6_R11_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PARALLEL_CURRENTNESS_ENGINE = false as const;
export const UNAUTHORIZED_PARALLEL_DIGITAL_THREAD = false as const;
export const UNAUTHORIZED_SECOND_FINGERPRINT_ALGORITHM = false as const;
export const UNAUTHORIZED_INFERRED_LINEAGE = false as const;
export const UNAUTHORIZED_HISTORICAL_AUTO_REPOINT = false as const;
export const UNAUTHORIZED_VALIDATION_TRANSFER_TO_NEW_REVISION = false as const;
export const UNAUTHORIZED_STALE_AS_CURRENT_PROMOTION = false as const;
export const UNAUTHORIZED_SUPERSEDED_AS_CURRENT_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_RECALCULATION = false as const;
export const UNAUTHORIZED_PROCESS_REDESIGN = false as const;
export const UNAUTHORIZED_PROCESS_REVALIDATION = false as const;

export {
  D6_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  D6_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  D6_INFERRED_LINEAGE_ALLOWED,
  D6_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_EQUIPMENT_DUTY_RUNTIME_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D6_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D6_REVIEW_VALIDATION_RUNTIME_READY,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_APPROVAL_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
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
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D5_REOPEN,
  UNAUTHORIZED_D7_RUNTIME_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set(["matching_tag", "matching_value", "shared_identity", "common_document", "semantic_similarity", "timestamp", "system_membership", "ai_inference", "inferred", "filename", "proximity", "similar_value"]);
const PROPAGATION = new Set(["DEPENDS_ON", "BASED_ON", "AFFECTS", "USES", "SUPPORTED_BY", "CONSTRAINED_BY", "PARENT", "OBJECT_REFERENCE", "REVIEWS"]);

type Currentness = (typeof D6_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D6_R10_SUBJECT_KINDS)[number];
type Prohibited = {
  infer?: boolean;
  identicalTags?: boolean;
  sharedIdentity?: boolean;
  matchingValues?: boolean;
  commonDocument?: boolean;
  semantic?: boolean;
  timestamp?: boolean;
  systemMembership?: boolean;
  repoint?: boolean;
  repointStale?: boolean;
  repointSuperseded?: boolean;
  replaceAdoptedCondition?: boolean;
  replaceOperatingCondition?: boolean;
  replaceDesignCondition?: boolean;
  replaceEvidence?: boolean;
  replaceDuty?: boolean;
  replaceUtility?: boolean;
  replaceRelief?: boolean;
  closeFinding?: boolean;
  replaceSafety?: boolean;
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
  approve?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  repairFingerprint?: boolean;
  rebaselineFingerprint?: boolean;
  overrideMismatch?: boolean;
  d9?: boolean;
  reason?: boolean;
};

export type D6R10Actor = D6R1Actor & { actorKind?: string };

export type D6R10Pin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
};

type Endpoint = { subjectKind: string; subjectId: string; subjectRevision: string; subjectFingerprint: string };
type Hit = { revision: string; fingerprint: string; status: string; currentness: string; contextId: string; tenantId: string };
type Row = { provenanceRef: string; fingerprint: string; recordStatus: string; currentness: string; contextId?: string; tenantId: string };

export type D6R10LineageRecord = {
  lineageId: string;
  contextId: string;
  source: D6R10Pin;
  target: D6R10Pin;
  relationshipType: string;
  processDependency: (typeof D6_R7_DEPENDENCY_TARGETS)[number] | null;
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

export type D6R10SupersessionRecord = {
  supersessionId: string;
  contextId: string;
  predecessor: D6R10Pin;
  successor: D6R10Pin;
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

export type D6R10CurrentnessMark = {
  eventId: string;
  contextId: string;
  subject: D6R10Pin;
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

export type D6R10History = { historyId: string; subjectKind: "LINEAGE" | "SUPERSESSION" | "CURRENTNESS"; subjectId: string; action: "CREATED"; fingerprint: string; recordedAt: string };

export type D6R10Store = {
  r9: D6R9Store;
  now: () => string;
  lineage: D6R10LineageRecord[];
  supersessions: D6R10SupersessionRecord[];
  marks: D6R10CurrentnessMark[];
  history: D6R10History[];
};

export type D6R10Trace = { origin: D6R10Pin; nodes: D6R10Pin[]; edges: D6R10LineageRecord[]; currentness: Currentness };

function fail(code: string): never {
  throw new Error(`D6_R10_${code}`);
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
  return (D6_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.identicalTags === true || input.sharedIdentity === true || input.matchingValues === true || input.commonDocument === true || input.semantic === true || input.timestamp === true || input.systemMembership === true) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint === true || input.repointStale === true || input.repointSuperseded === true) fail("AUTO_REPOINT_REJECTED");
  if (input.replaceAdoptedCondition === true || input.replaceOperatingCondition === true || input.replaceDesignCondition === true) fail("CONDITION_AUTO_REPLACEMENT_REJECTED");
  if (input.replaceEvidence === true) fail("EVIDENCE_AUTO_REPLACEMENT_REJECTED");
  if (input.replaceDuty === true || input.replaceUtility === true) fail("DUTY_AUTO_REPLACEMENT_REJECTED");
  if (input.replaceRelief === true || input.closeFinding === true || input.replaceSafety === true) fail("SAFETY_AUTO_REPLACEMENT_REJECTED");
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
  if (input.approve === true) fail("APPROVAL_NOT_IN_R10");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.repairFingerprint === true || input.rebaselineFingerprint === true || input.overrideMismatch === true) fail("FINGERPRINT_OVERRIDE_REJECTED");
  if (input.d9 === true) fail("D9_NOT_STARTED");
  if (input.reason === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10");
}

function assertScope(actor: D6R10Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D6R10Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_CANNOT_INVENT_LINEAGE");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority === "PROCESS_ENGINEERING_AUTHORITY" || actor.authority === "REVIEWER" || actor.authority === "PROCESS_VALIDATION_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D6_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  return cited;
}

function remember(store: D6R10Store, subjectKind: D6R10History["subjectKind"], subjectId: string, fingerprint: string): void {
  store.history.push({ historyId: `d6r10-history-${store.history.length + 1}`, subjectKind, subjectId, action: "CREATED", fingerprint, recordedAt: store.now() });
}

function rowHit(row: Row | undefined, revision?: string): Hit | undefined {
  if (!row) return undefined;
  return { revision: revision ?? row.provenanceRef, fingerprint: row.fingerprint, status: row.recordStatus, currentness: row.currentness, contextId: row.contextId ?? "", tenantId: row.tenantId };
}

function pinKey(pin: D6R10Pin): string {
  return `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${pin.subjectFingerprint}`;
}

function locate(store: D6R10Store, kind: SubjectKind, id: string): Hit | undefined {
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
  if (kind === "STREAM") return rowHit(r2.streams.find((row) => row.streamRecordId === id));
  if (kind === "SERVICE") return rowHit(r2.services.find((row) => row.serviceRecordId === id));
  if (kind === "OPERATING_CASE") return rowHit(r3.operatingCases.find((row) => row.caseRecordId === id));
  if (kind === "DESIGN_CASE") return rowHit(r3.designCases.find((row) => row.caseRecordId === id));
  if (kind === "DESIGN_BASIS") return rowHit(r3.bases.find((row) => row.basisRecordId === id));
  if (kind === "CONDITION") return rowHit(r3.conditions.find((row) => row.conditionId === id));
  if (kind === "OPERATING_CONDITION") return rowHit(r3.conditions.find((row) => row.conditionId === id && row.conditionClass === "OPERATING"));
  if (kind === "DESIGN_CONDITION") return rowHit(r3.conditions.find((row) => row.conditionId === id && row.conditionClass === "DESIGN"));
  if (kind === "EVIDENCE") return rowHit(r4.evidence.find((row) => row.evidenceId === id));
  if (kind === "DUTY") return rowHit(r5.duties.find((row) => row.requirementId === id));
  if (kind === "UTILITY") return rowHit(r5.utilities.find((row) => row.utilityRecordId === id));
  if (kind === "SAFETY") return rowHit(r6.records.find((row) => row.recordId === id && row.recordKind !== "RELIEF_SCENARIO" && row.recordKind !== "DEPRESSURING"));
  if (kind === "RELIEF") return rowHit(r6.records.find((row) => row.recordId === id && (row.recordKind === "RELIEF_SCENARIO" || row.recordKind === "DEPRESSURING")));
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

function reassessmentBlocksCurrent(store: D6R10Store, pin: D6R10Pin): boolean {
  const rows = store.r9.r8.r7.reassessments;
  if (pin.subjectKind === "REASSESSMENT") {
    const row = rows.find((item) => item.reassessmentId === pin.subjectId && item.fingerprint === pin.subjectFingerprint);
    return row?.state === "REASSESSMENT_REQUIRED" && row.recordStatus === "CURRENT";
  }
  return rows.some((row) => row.recordStatus === "CURRENT" && row.state === "REASSESSMENT_REQUIRED" && row.targetId === pin.subjectId && row.targetFingerprint === pin.subjectFingerprint);
}

function storedCurrentness(store: D6R10Store, subject: D6R10Pin): Currentness {
  const hit = locate(store, subject.subjectKind, subject.subjectId);
  if (!hit || !isCurrentness(hit.currentness) || hit.fingerprint !== subject.subjectFingerprint) fail("CURRENTNESS_INVALID");
  return hit.currentness;
}

export function exposedProcessCurrentness(store: D6R10Store, subject: D6R10Pin): Currentness {
  const overlay = [...store.marks].reverse().find((row) => pinKey(row.subject) === pinKey(subject));
  const base = overlay?.currentness ?? storedCurrentness(store, subject);
  if (base === "CURRENT" && reassessmentBlocksCurrent(store, subject)) return "REASSESSMENT_REQUIRED";
  return base;
}

function live(store: D6R10Store, actor: D6R10Actor, contextId: string, endpoint: Endpoint, cited: Currentness): D6R10Pin {
  const subjectKind = explicit(endpoint.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D6_R10_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(endpoint.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(endpoint.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(endpoint.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const context = store.r9.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D6_DISCIPLINE) fail("DISCIPLINE_NOT_PROCESS");
  const hit = locate(store, subjectKind as SubjectKind, subjectId);
  if (!hit || hit.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
  if (hit.contextId !== "" && hit.contextId !== context.contextId) fail("SUBJECT_NOT_FOUND");
  if (hit.fingerprint !== subjectFingerprint || hit.revision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
  const pin: D6R10Pin = { subjectKind: subjectKind as SubjectKind, subjectId, subjectRevision, subjectFingerprint, contextId: context.contextId };
  const effective = exposedProcessCurrentness(store, pin);
  if (cited === "CURRENT" && (hit.status !== "CURRENT" || effective !== "CURRENT")) fail("SUBJECT_NOT_CURRENT");
  if (hit.status === "SUPERSEDED" && cited !== "SUPERSEDED") fail("SUBJECT_NOT_CURRENT");
  if (effective === "STALE" && cited === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  if (effective === "SUPERSEDED" && cited === "CURRENT") fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  if (effective === "REASSESSMENT_REQUIRED" && cited === "CURRENT") fail("REASSESSMENT_EXPOSED_AS_CURRENT");
  return pin;
}

function snapshot(store: D6R10Store): string {
  const r8 = store.r9.r8;
  const r7 = r8.r7;
  return JSON.stringify({
    objects: r7.r6.r5.r4.r3.r2.r1.objects,
    streams: r7.r6.r5.r4.r3.r2.streams,
    systems: r7.r6.r5.r4.r3.r2.systems,
    services: r7.r6.r5.r4.r3.r2.services,
    conditions: r7.r6.r5.r4.r3.conditions,
    evidence: r7.r6.r5.r4.evidence,
    duties: r7.r6.r5.duties,
    utilities: r7.r6.r5.utilities,
    safety: r7.r6.records,
    changes: r7.changes,
    reassessments: r7.reassessments,
    handoffs: r8.handoffs,
    requests: store.r9.requests,
    findings: store.r9.findings,
    validations: store.r9.validations,
  });
}

function downstream(store: D6R10Store, origin: D6R10Pin): D6R10Pin[] {
  const found: D6R10Pin[] = [];
  const seen = new Set<string>([pinKey(origin)]);
  let frontier = [origin];
  for (let depth = 0; depth < THREAD_DEFAULT_MAX_DEPTH && frontier.length > 0; depth += 1) {
    const next: D6R10Pin[] = [];
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

function markOf(store: D6R10Store, actor: D6R10Actor, eventId: string, subject: D6R10Pin, currentness: Currentness, provenanceRef: string): D6R10CurrentnessMark {
  const fingerprint = fingerprintCanonical({ eventId, subject, currentness, provenanceRef, engineeringInvalid: false, engineeringValidated: false, contentMutated: false });
  return Object.freeze({
    eventId, contextId: subject.contextId, subject, currentness, engineeringInvalid: false, engineeringValidated: false, rejected: false, approved: false, conformant: false, certified: false,
    contentMutated: false, recalculated: false, redesigned: false, provenanceRef, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(),
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
}

function collectPins(store: D6R10Store, actor: D6R10Actor): D6R10Pin[] {
  const pins: D6R10Pin[] = [];
  const push = (kind: SubjectKind, id: string) => {
    const hit = locate(store, kind, id);
    if (!hit || hit.tenantId !== actor.tenantId) return;
    pins.push({ subjectKind: kind, subjectId: id, subjectRevision: hit.revision, subjectFingerprint: hit.fingerprint, contextId: hit.contextId });
  };
  const r8 = store.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  r2.r1.contexts.forEach((row) => push("CONTEXT", row.contextId));
  r2.r1.objects.forEach((row) => push("OBJECT", row.objectId));
  r2.systems.forEach((row) => push("SYSTEM", row.systemRecordId));
  r2.streams.forEach((row) => push("STREAM", row.streamRecordId));
  r2.services.forEach((row) => push("SERVICE", row.serviceRecordId));
  r3.operatingCases.forEach((row) => push("OPERATING_CASE", row.caseRecordId));
  r3.designCases.forEach((row) => push("DESIGN_CASE", row.caseRecordId));
  r3.bases.forEach((row) => push("DESIGN_BASIS", row.basisRecordId));
  r3.conditions.forEach((row) => push(row.conditionClass === "DESIGN" ? "DESIGN_CONDITION" : "OPERATING_CONDITION", row.conditionId));
  r4.evidence.forEach((row) => push("EVIDENCE", row.evidenceId));
  r5.duties.forEach((row) => push("DUTY", row.requirementId));
  r5.utilities.forEach((row) => push("UTILITY", row.utilityRecordId));
  r6.records.forEach((row) => push(row.recordKind === "RELIEF_SCENARIO" || row.recordKind === "DEPRESSURING" ? "RELIEF" : "SAFETY", row.recordId));
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

export function createD6R10Store(r9: D6R9Store, now: () => string = () => r9.now()): D6R10Store {
  return { r9, now, lineage: [], supersessions: [], marks: [], history: [] };
}

export function currentProcessPins(store: D6R10Store, actor: D6R10Actor): D6R10Pin[] {
  return collectPins(store, actor).filter((pin) => {
    const context = store.r9.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === pin.contextId && row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId);
    return context != null && exposedProcessCurrentness(store, pin) === "CURRENT";
  });
}

export function recordProcessLineage(store: D6R10Store, actor: D6R10Actor, input: Prohibited & {
  lineageId: string; contextId: string; source: Endpoint; target: Endpoint; relationshipType: string; processDependency?: string | null; authoritative?: boolean; candidate?: boolean; citedCurrentness: string; provenanceRef: string; assertedFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D6R10LineageRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const source = live(store, actor, contextId, input.source, cited);
  const target = live(store, actor, contextId, input.target, cited);
  if (pinKey(source) === pinKey(target)) fail("LINEAGE_SELF_LINK_REJECTED");
  const relationshipType = explicit(input.relationshipType, "RELATIONSHIP_REQUIRED");
  if (relationshipType === "SUPERSEDES") fail("SUPERSESSION_FUNCTION_REQUIRED");
  const identity = (D6_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(relationshipType);
  if (!identity && (!isGovernedRelationType(relationshipType) || !relationSemantics(relationshipType))) fail("RELATION_NOT_GOVERNED");
  let processDependency: D6R10LineageRecord["processDependency"] = null;
  if (input.processDependency != null && input.processDependency !== "") {
    const dependency = explicit(input.processDependency, "DEPENDENCY_NOT_EXPLICIT");
    if (!(D6_R7_DEPENDENCY_TARGETS as readonly string[]).includes(dependency)) fail("DEPENDENCY_NOT_EXPLICIT");
    processDependency = dependency as D6R10LineageRecord["processDependency"];
  }
  if (downstream(store, target).some((pin) => pinKey(pin) === pinKey(source))) fail("CIRCULAR_LINEAGE_REJECTED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const lineageId = explicit(input.lineageId, "LINEAGE_ID_REQUIRED");
  const authoritative = input.authoritative !== false && input.candidate !== true;
  const fingerprint = fingerprintCanonical({ lineageId, contextId: source.contextId, source, target, relationshipType, processDependency, authoritative, candidate: input.candidate === true, citedCurrentness: cited, provenanceRef, engineeringValidated: false });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.lineage.find((row) => row.lineageId === lineageId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("LINEAGE_ALREADY_RECORDED");
  const signature = `${pinKey(source)}|${pinKey(target)}|${relationshipType}|${processDependency ?? ""}`;
  if (store.lineage.some((row) => `${pinKey(row.source)}|${pinKey(row.target)}|${row.relationshipType}|${row.processDependency ?? ""}` === signature)) fail("DUPLICATE_LINEAGE_REJECTED");
  const before = snapshot(store);
  const record: D6R10LineageRecord = Object.freeze({
    lineageId, contextId: source.contextId, source, target, relationshipType, processDependency, authoritative, candidate: input.candidate === true, citedCurrentness: cited,
    engineeringValidated: false, approved: false, conformant: false, certified: false, provenanceRef, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT",
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  store.lineage.push(record);
  remember(store, "LINEAGE", record.lineageId, record.fingerprint);
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return record;
}

export function recordProcessSupersession(store: D6R10Store, actor: D6R10Actor, input: Prohibited & {
  supersessionId: string; contextId: string; predecessor: Endpoint; successor: Endpoint; citedCurrentness: string; provenanceRef: string; assertedFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D6R10SupersessionRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const predecessor = live(store, actor, contextId, input.predecessor, "STALE");
  const successor = live(store, actor, contextId, input.successor, cited === "SUPERSEDED" ? "CURRENT" : cited);
  if (predecessor.subjectKind !== successor.subjectKind) fail("SUPERSESSION_KIND_MISMATCH");
  if (pinKey(predecessor) === pinKey(successor)) fail("SUPERSESSION_SELF_REJECTED");
  if (exposedProcessCurrentness(store, predecessor) === "SUPERSEDED") fail("FALSE_SUPERSESSION_REJECTED");
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
  const record: D6R10SupersessionRecord = Object.freeze({
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

export function recordProcessCurrentness(store: D6R10Store, actor: D6R10Actor, input: Prohibited & {
  eventId: string; contextId: string; subject: Endpoint; currentness: string; propagate?: boolean; provenanceRef: string; assertedFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D6R10CurrentnessMark[] {
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
    if (mark.engineeringInvalid || mark.rejected || mark.approved || mark.contentMutated || mark.recalculated || mark.redesigned) fail("CONTENT_MUTATION_REJECTED");
    store.marks.push(mark);
    remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  }
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return created;
}

export function traceProcessDigitalThread(store: D6R10Store, actor: D6R10Actor, input: { contextId: string; subject: Endpoint; citedCurrentness: string; tenantId?: string; workspaceId?: string; projectId?: string }): D6R10Trace {
  assertRecorder(actor);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const origin = live(store, actor, explicit(input.contextId, "R1_CONTEXT_REQUIRED"), input.subject, cited);
  const nodes = [origin, ...downstream(store, origin)];
  const keys = new Set(nodes.map(pinKey));
  const edges = store.lineage.filter((edge) => edge.contextId === origin.contextId && edge.authoritative && !edge.candidate && keys.has(pinKey(edge.source)) && keys.has(pinKey(edge.target)));
  const currentness = exposedProcessCurrentness(store, origin);
  if (currentness !== "CURRENT" && cited === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  return { origin, nodes, edges, currentness };
}

export function repointProcessDigitalThread(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function inferProcessLineage(): never {
  return fail("INFERRED_LINEAGE_REJECTED");
}
export function replaceAdoptedProcessConditionFromCurrentness(): never {
  return fail("CONDITION_AUTO_REPLACEMENT_REJECTED");
}
export function replaceOperatingConditionFromCurrentness(): never {
  return fail("CONDITION_AUTO_REPLACEMENT_REJECTED");
}
export function replaceDesignConditionFromCurrentness(): never {
  return fail("CONDITION_AUTO_REPLACEMENT_REJECTED");
}
export function replaceProcessEvidenceFromCurrentness(): never {
  return fail("EVIDENCE_AUTO_REPLACEMENT_REJECTED");
}
export function replaceAdoptedDutyFromCurrentness(): never {
  return fail("DUTY_AUTO_REPLACEMENT_REJECTED");
}
export function replaceAdoptedUtilityFromCurrentness(): never {
  return fail("DUTY_AUTO_REPLACEMENT_REJECTED");
}
export function replaceReliefScenarioFromCurrentness(): never {
  return fail("SAFETY_AUTO_REPLACEMENT_REJECTED");
}
export function closeProcessFindingFromCurrentness(): never {
  return fail("SAFETY_AUTO_REPLACEMENT_REJECTED");
}
export function replaceSafetyRequirementFromCurrentness(): never {
  return fail("SAFETY_AUTO_REPLACEMENT_REJECTED");
}
export function transferProcessReviewFromCurrentness(): never {
  return fail("REVIEW_TRANSFER_REJECTED");
}
export function transferProcessValidationFromCurrentness(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}
export function repairProcessFingerprint(): never {
  return fail("FINGERPRINT_OVERRIDE_REJECTED");
}
export function recalculateFromProcessCurrentness(): never {
  return fail("RECALCULATION_NOT_IN_R10");
}
export function redesignFromProcessCurrentness(): never {
  return fail("REDESIGN_NOT_IN_R10");
}
export function revalidateFromProcessCurrentness(): never {
  return fail("REVALIDATION_NOT_IN_R10");
}
export function approveFromProcessCurrentness(): never {
  return fail("APPROVAL_NOT_IN_R10");
}
export function reasonAcrossProcessCurrentness(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10");
}
