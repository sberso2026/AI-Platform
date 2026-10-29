/**
 * EOS-D8-R10 Instrumentation and Control currentness and digital thread.
 * One bounded runtime on exact R1-R9 revisions. Canonical currentness, thread, lineage, and fingerprint only.
 * Current is not validated, approved, or conformant. Lineage is not authority. A fingerprint match is not approval.
 * Historical references stay on the cited revision.
 */
import {
  CURRENT_D8_RECORD_EQUALS_APPROVED,
  CURRENT_D8_RECORD_EQUALS_CONFORMANT,
  D8_CURRENTNESS_STATES,
  D8_IMPLEMENTATION_PHASE_TYPES,
  D8_IMPLEMENTATION_PHASES,
} from "@rtb/types";
import { isGovernedRelationType } from "../decision-intelligence/relations";
import { relationSemantics } from "../digital-thread/relation-semantics";
import { THREAD_DEFAULT_MAX_DEPTH } from "../digital-thread/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED } from "../structural-systems/interface-handoff-governance";
import { D8_CONTEXT_AUTHORITY, D8_DISCIPLINE, D8_EXPLICIT_RELATIONSHIP_KINDS, type D8R1Actor } from "./identity-foundation";
import {
  ADMIN_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  AI_EQUALS_D8_IAC_ENGINEERING_AUTHORITY,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED,
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
  D7_REOPENED,
  D7_STATUS,
  D7_TRACK_COMPLETE,
  D8_ACTUATOR_SIZING_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_AUTOMATIC_CONTROL_LOGIC_GENERATION_RUNTIME_COUNT,
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_CANONICAL_MILESTONE_COUNT,
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
  D8_D9_RUNTIME_INTEGRATION_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_DISCIPLINE_INTERFACE_RUNTIME_READY,
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
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_INSTRUMENT_SELECTION_RUNTIME_COUNT,
  D8_INSTRUMENT_SIZING_RUNTIME_COUNT,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_REVIEW_VALIDATION_RUNTIME_READY,
  D8_REUSES_CANONICAL_CURRENTNESS,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  D8_REUSES_CANONICAL_FINGERPRINT,
  D8_RUNTIME_COUNT as R9_RUNTIME_COUNT,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_SIL_CALCULATION_RUNTIME_COUNT,
  D8_SIL_VERIFICATION_RUNTIME_COUNT,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D8_RECORD_EQUALS_INVALID,
  STALE_REVIEW_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  type D8R9Store,
} from "./review-validation-governance";

export const D8_R10_STATUS = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D8_R10_MATURITY = D8_R10_STATUS;
export const D8_R10_MATURITY_STATE = D8_R10_STATUS;
export const D8_R10_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D8_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md" as const;
export const D8_RUNTIME_STARTED = true as const;
export const D8_RUNTIME_COUNT = 10 as const;
export const D8_R9_RUNTIME_COUNT = R9_RUNTIME_COUNT;
export const D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED = true as const;
export const D8_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 1 as const;
export const D8_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = true as const;
export const D8_R1_R9_EXACT_REVISIONS_REUSED = true as const;
export const EXACT_D8_R10_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D8_R10_SOURCE_REFERENCE_ALLOWED = false as const;
export const D8_R10_SOURCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D8_R10_THREAD_DEPTH_REUSED = THREAD_DEFAULT_MAX_DEPTH;
export const D8_EXACT_REVISION_CURRENTNESS_IMPLEMENTED = true as const;
export const D8_CURRENT_STATE_SUPPORTED = true as const;
export const D8_STALE_STATE_SUPPORTED = true as const;
export const D8_SUPERSEDED_STATE_SUPPORTED = true as const;
export const D8_CURRENTNESS_TRANSITION_GOVERNED = true as const;
export const D8_CURRENTNESS_TRANSITION_REQUIRES_EXPLICIT_BASIS = true as const;
export const D8_CURRENTNESS_INFERRED_FROM_SEMANTIC_SIMILARITY = false as const;
export const D8_CURRENTNESS_INFERRED_FROM_TAG_SIMILARITY = false as const;
export const D8_REVISION_LINEAGE_IMPLEMENTED = true as const;
export const EXACT_D8_PREDECESSOR_REVISION_REQUIRED = true as const;
export const EXACT_D8_SUCCESSOR_REVISION_REQUIRED_WHEN_PRESENT = true as const;
export const LINEAGE_EQUALS_VALIDATION = false as const;
export const LINEAGE_EQUALS_APPROVAL = false as const;
export const LINEAGE_EQUALS_AUTHORITY = false as const;
export const D8_R10_FINGERPRINT_VERIFICATION_IMPLEMENTED = true as const;
export const FINGERPRINT_MATCH_EQUALS_VALIDATED = false as const;
export const FINGERPRINT_MATCH_EQUALS_APPROVED = false as const;
export const FINGERPRINT_MATCH_EQUALS_CONFORMANT = false as const;
export const D8_R10_FINGERPRINT_MISMATCH_AUTO_REPAIRED = false as const;
export const D8_R10_FINGERPRINT_MISMATCH_AUTO_REBASELINED = false as const;
export const D8_R10_HISTORY_PRESERVED = true as const;
export const D8_R10_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const SILENT_D8_R10_MUTATION_ALLOWED = false as const;
export const D8_R10_R7_CHANGE_CURRENTNESS_INTEGRATION_IMPLEMENTED = true as const;
export const D8_CHANGE_AUTO_MARKS_UNRELATED_RECORD_STALE = false as const;
export const D8_CHANGE_AUTO_REPOINTS_HISTORICAL_REFERENCE = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D8_R10_R7_REASSESSMENT_CURRENTNESS_INTEGRATION_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_STALE = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_CURRENT = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const D8_R10_R8_HANDOFF_CURRENTNESS_INTEGRATION_IMPLEMENTED = true as const;
export const CURRENT_D8_HANDOFF_EQUALS_COUNTERPART_VALIDATED = false as const;
export const STALE_D8_HANDOFF_EQUALS_COUNTERPART_INVALID = false as const;
export const SUPERSEDED_D8_HANDOFF_EQUALS_COUNTERPART_INVALID = false as const;
export const EXACT_D8_R8_COUNTERPART_REVISION_REQUIRED = true as const;
export const FLOATING_COUNTERPART_REFERENCE_ALLOWED = false as const;
export const D8_R10_COUNTERPART_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D8_R10_R9_REVIEW_CURRENTNESS_INTEGRATION_IMPLEMENTED = true as const;
export const SUPERSEDED_REVIEW_EQUALS_INVALID = false as const;
export const D8_R10_R9_VALIDATION_CURRENTNESS_INTEGRATION_IMPLEMENTED = true as const;
export const CURRENT_VALIDATION_RECORD_EQUALS_APPROVED = false as const;
export const STALE_VALIDATION_RECORD_EQUALS_VALIDATION_FAILED = false as const;
export const SUPERSEDED_VALIDATION_RECORD_EQUALS_INVALID = false as const;
export const NEW_D8_REVISION_INHERITS_PRIOR_VALIDATION_AUTOMATICALLY = false as const;
export const NEW_D8_REVISION_INHERITS_PRIOR_APPROVAL_AUTOMATICALLY = false as const;
export const D8_DIGITAL_THREAD_RELATIONSHIP_IMPLEMENTED = true as const;
export const D8_DIGITAL_THREAD_RELATIONSHIP_EXPLICIT = true as const;
export const D8_INFERRED_DIGITAL_THREAD_RELATIONSHIP_ALLOWED = false as const;
export const DIGITAL_THREAD_RELATIONSHIP_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const DIGITAL_THREAD_RELATIONSHIP_EQUALS_REQUIREMENT_ADOPTION = false as const;
export const DIGITAL_THREAD_RELATIONSHIP_EQUALS_VALIDATION = false as const;
export const DIGITAL_THREAD_RELATIONSHIP_EQUALS_APPROVAL = false as const;
export const D8_R10_INFERRED_RELATIONSHIP_FROM_NAME = false as const;
export const D8_R10_INFERRED_RELATIONSHIP_FROM_TAG = false as const;
export const D8_R10_INFERRED_RELATIONSHIP_FROM_DOCUMENT_PROXIMITY = false as const;
export const D8_R10_INFERRED_RELATIONSHIP_FROM_SEMANTIC_SIMILARITY = false as const;
export const D8_R10_AI_AUTO_CREATES_AUTHORITATIVE_THREAD_RELATIONSHIP = false as const;
export const D8_R10_THREAD_PROVENANCE_REQUIRED = true as const;
export const D8_R10_THREAD_PROVENANCE_PRESERVED = true as const;
export const D8_R10_SOURCE_BASIS_REQUIRED = true as const;
export const D8_R10_SOURCE_BASIS_TRACEABLE = true as const;
export const D8_R10_APPLICABILITY_EXPLICIT = true as const;
export const D8_R10_LIMITATIONS_EXPLICIT = true as const;
export const D8_R10_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const TENANT_WORKSPACE_PROJECT_D8_R10_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D8_R10_ACCESS_ALLOWED = false as const;
export const D8_R10_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D8_R10_AUTO_MUTATES_R2_MEASUREMENT_TAG_CONTEXT = false as const;
export const D8_R10_AUTO_MUTATES_R3_INSTRUMENT_DEVICE_CONTEXT = false as const;
export const D8_R10_AUTO_MUTATES_R4_SIGNAL_IO_LOOP_CONTEXT = false as const;
export const D8_R10_AUTO_MUTATES_R5_CONTROL_SYSTEM_CONTEXT = false as const;
export const D8_R10_AUTO_MUTATES_R6_SAFETY_CONTEXT = false as const;
export const D8_R10_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D8_R10_AUTO_MUTATES_R8_INTERFACE_HANDOFF = false as const;
export const D8_R10_AUTO_MUTATES_R9_REVIEW_VALIDATION = false as const;
export const D8_R10_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D8_R10_AUTO_MUTATES_D2_CIVIL = false as const;
export const D8_R10_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D8_R10_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D8_R10_AUTO_MUTATES_D5_PIPING = false as const;
export const D8_R10_AUTO_MUTATES_D6_PROCESS = false as const;
export const D8_R10_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const AI_CAN_MARK_D8_RECORD_CURRENT_WITHOUT_GOVERNED_BASIS = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D8_LINEAGE = false as const;
export const AI_CAN_REBASELINE_D8_FINGERPRINT = false as const;
export const AI_CAN_PROMOTE_CURRENTNESS_TO_VALIDATION = false as const;
export const ADMIN_CAN_PROMOTE_CURRENTNESS_TO_ENGINEERING_TRUTH = false as const;
export const ADMIN_CAN_REBASELINE_D8_FINGERPRINT_WITHOUT_GOVERNANCE = false as const;
export const D8_R10_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION = false as const;
export const D8_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D8_R10_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D8_R10_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D8_R10_SUBJECT_KINDS = ["OBJECT", "MEASUREMENT", "DEVICE", "SIGNAL", "IO", "LOOP", "SYSTEM", "SAFETY", "REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE", "REASSESSMENT", "HANDOFF", "REVIEW_REQUEST", "FINDING", "VALIDATION"] as const;
export const D8_R11_CANONICAL_PHASE = D8_IMPLEMENTATION_PHASES[10];
export const D8_R11_PHASE_TYPE = D8_IMPLEMENTATION_PHASE_TYPES[10];
export const D8_R11_CANONICAL_SCOPE = "Implement the read-only D8 source contract for future D9 cross-discipline intelligence. The contract may expose governed D8 facts and relationships from exact R1-R10 revisions, including identities, measurement and tag context, instruments and devices, signals, I/O and loops, control-system context, safety, interlock and shutdown context, requirements, assumptions and decisions, changes and reassessments, interfaces and handoffs, review and validation governance, currentness, lineage, provenance, and limitations. D9 source contract is not D9 runtime. D9 read access does not transfer D8 authority. The source contract does not create a new engineering fact, derived value, requirement, assumption, engineering decision, or recommendation. D9 remains unstarted. Do not perform cross-discipline reasoning, conflict detection, conflict resolution, or recommendations during R11." as const;
export const D8_R11_STARTED = false as const;
export const D8_R10_READY_FOR_NEXT_PHASE = true as const;
export const D8_R10_NEXT_PHASE = D8_R11_CANONICAL_PHASE;
export const D8_R10_NEXT_PHASE_TYPE = D8_R11_PHASE_TYPE;
export const D8_R10_CANONICAL_NEXT_PHASE = D8_R11_CANONICAL_PHASE;
export const D8_R10_CANONICAL_NEXT_PHASE_SCOPE = D8_R11_CANONICAL_SCOPE;
export const D8_R10_BLOCKER = "NONE" as const;
export const D8_R10_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const UNAUTHORIZED_D8_R11_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PARALLEL_CURRENTNESS_ENGINE = false as const;
export const UNAUTHORIZED_PARALLEL_DIGITAL_THREAD = false as const;
export const UNAUTHORIZED_SECOND_FINGERPRINT_ALGORITHM = false as const;
export const UNAUTHORIZED_INFERRED_LINEAGE = false as const;
export const UNAUTHORIZED_INFERRED_DIGITAL_THREAD_RELATIONSHIP = false as const;
export const UNAUTHORIZED_HISTORICAL_AUTO_REPOINT = false as const;
export const UNAUTHORIZED_FINGERPRINT_AUTO_REPAIR = false as const;
export const UNAUTHORIZED_FINGERPRINT_REBASELINE = false as const;
export const UNAUTHORIZED_CURRENTNESS_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_FINGERPRINT_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_LINEAGE_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_COUNTERPART_VALIDATION_PROMOTION = false as const;

export {
  D8_REVIEW_VALIDATION_RUNTIME_READY,
  D8_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D8_INSTRUMENTATION_CONTROL_IDENTITY_RUNTIME_READY,
  D8_PROCESS_MEASUREMENT_TAG_RUNTIME_READY,
  D8_INSTRUMENT_DEVICE_CONTEXT_RUNTIME_READY,
  D8_SIGNAL_IO_CONTROL_LOOP_RUNTIME_READY,
  D8_CONTROL_SYSTEM_ARCHITECTURE_RUNTIME_READY,
  D8_SAFETY_INTERLOCK_SHUTDOWN_RUNTIME_READY,
  D8_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D8_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D8_CURRENTNESS_ENGINE_CREATED,
  D8_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D8_DIGITAL_THREAD_CREATED,
  D8_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D8_FINGERPRINT_ALGORITHM_CREATED,
  D8_EXPLICIT_LINEAGE_REQUIRED,
  D8_INFERRED_LINEAGE_ALLOWED,
  CURRENT_D8_RECORD_EQUALS_VALIDATED,
  CURRENT_D8_RECORD_EQUALS_APPROVED,
  CURRENT_D8_RECORD_EQUALS_CONFORMANT,
  STALE_D8_RECORD_EQUALS_INVALID,
  SUPERSEDED_D8_RECORD_EQUALS_INVALID,
  CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED,
  STALE_REVIEW_EQUALS_INVALID,
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
  D8_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D8_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D8_APPROVAL_RUNTIME_COUNT,
  D8_CERTIFICATION_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_DESIGN_RUNTIME_COUNT,
  D8_AUTOMATIC_IAC_REDESIGN_RUNTIME_COUNT,
  D8_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D8_D9_RUNTIME_INTEGRATION_COUNT,
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
  D8_CANONICAL_MILESTONE_COUNT,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set(["inferred", "similarity", "semantic", "semantic_similarity", "tag_name", "tag_match", "similar_tag", "document_proximity", "filename", "timestamp", "sequence"]);
const PROPAGATION = new Set(["DEPENDS_ON", "BASED_ON", "AFFECTS", "USES", "SUPPORTED_BY", "CONSTRAINED_BY", "PARENT", "OBJECT_REFERENCE", "REVIEWS"]);

type Currentness = (typeof D8_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D8_R10_SUBJECT_KINDS)[number];
type Prohibited = {
  infer?: boolean;
  inferFromName?: boolean;
  inferFromTag?: boolean;
  documentProximity?: boolean;
  semantic?: boolean;
  repoint?: boolean;
  repointCounterpart?: boolean;
  repairFingerprint?: boolean;
  rebaselineFingerprint?: boolean;
  promoteValidated?: boolean;
  promoteApproved?: boolean;
  inheritValidation?: boolean;
  inheritApproval?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateR7?: boolean;
  mutateR8?: boolean;
  mutateR9?: boolean;
  mutateD1?: boolean;
  mutateD2?: boolean;
  mutateD3?: boolean;
  mutateD4?: boolean;
  mutateD5?: boolean;
  mutateD6?: boolean;
  mutateD7?: boolean;
  automaticValidation?: boolean;
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  d9?: boolean;
  reason?: boolean;
  propagateOutsideApplicability?: boolean;
};

export type D8R10Actor = D8R1Actor & { actorKind?: string };

export type D8R10Pin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
};

type Endpoint = { subjectKind: string; subjectId: string; subjectRevision: string; subjectFingerprint: string };
type Hit = {
  revision: string;
  fingerprint: string;
  status: string;
  currentness: string;
  contextId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  objectId: string;
  objectRevisionFingerprint: string;
};
type Packed = {
  provenanceRef?: string;
  fingerprint: string;
  recordStatus: string;
  currentness: string;
  contextId?: string;
  tenantId: string;
  workspaceId?: string;
  projectId?: string;
  objectId?: string;
  objectRevisionFingerprint?: string;
};

export type D8R10EdgeRecord = {
  edgeId: string;
  edgeClass: "LINEAGE" | "THREAD";
  contextId: string;
  source: D8R10Pin;
  target: D8R10Pin;
  relationshipType: string;
  authoritative: false;
  candidate: false;
  engineeringAuthority: false;
  requirementAdopted: false;
  engineeringValidated: false;
  approved: false;
  citedCurrentness: Currentness;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT";
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D8R10SupersessionRecord = {
  supersessionId: string;
  contextId: string;
  predecessor: D8R10Pin;
  successor: D8R10Pin;
  validationInherited: false;
  approvalInherited: false;
  historicalEdgesRewritten: false;
  priorRevisionInvalidated: false;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D8R10CurrentnessMark = {
  eventId: string;
  contextId: string;
  subject: D8R10Pin;
  currentness: Currentness;
  changeId: string | null;
  changeFingerprint: string | null;
  reassessmentId: string | null;
  reassessmentFingerprint: string | null;
  engineeringValidated: false;
  approved: false;
  conformant: false;
  invalid: false;
  validationFailed: false;
  counterpartValidated: false;
  authorityTransferred: false;
  requirementAdopted: false;
  contentMutated: false;
  historicalRepointed: false;
  fingerprintRepaired: false;
  rebaselined: false;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D8R10FingerprintVerification = {
  match: true;
  validated: false;
  approved: false;
  conformant: false;
  subjectFingerprint: string;
};

export type D8R10History = { historyId: string; subjectKind: "LINEAGE" | "THREAD" | "SUPERSESSION" | "CURRENTNESS"; subjectId: string; action: "CREATED"; fingerprint: string; recordedAt: string };
export type D8R10Store = { r9: D8R9Store; now: () => string; edges: D8R10EdgeRecord[]; supersessions: D8R10SupersessionRecord[]; marks: D8R10CurrentnessMark[]; history: D8R10History[] };

function fail(code: string): never {
  throw new Error(`D8_R10_${code}`);
}

function blockedParty(value: string): boolean {
  const token = value.toUpperCase();
  return token === "AI" || token.startsWith("AI_") || token.startsWith("AI-") || token.startsWith("AI ") || token.includes("LLM") || token.includes("OPTIMIZER");
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase())) fail(code);
  if (INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail("INFERRED_RELATIONSHIP_REJECTED");
  return token;
}

function isCurrentness(value: string): value is Currentness {
  return (D8_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.inferFromName === true || input.inferFromTag === true || input.documentProximity === true || input.semantic === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.repoint === true || input.repointCounterpart === true) fail("AUTO_REPOINT_REJECTED");
  if (input.repairFingerprint === true || input.rebaselineFingerprint === true) fail("FINGERPRINT_OVERRIDE_REJECTED");
  if (input.promoteValidated === true) fail("CURRENT_NOT_VALIDATED");
  if (input.promoteApproved === true) fail("CURRENT_NOT_APPROVED");
  if (input.inheritValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.inheritApproval === true) fail("APPROVAL_TRANSFER_REJECTED");
  if (input.mutateR1 === true || input.mutateR2 === true || input.mutateR3 === true || input.mutateR4 === true || input.mutateR5 === true || input.mutateR6 === true || input.mutateR7 === true || input.mutateR8 === true || input.mutateR9 === true) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.mutateD1 === true || input.mutateD2 === true || input.mutateD3 === true || input.mutateD4 === true || input.mutateD5 === true || input.mutateD6 === true || input.mutateD7 === true) fail("COUNTERPART_MUTATION_REJECTED");
  if (input.automaticValidation === true) fail("AUTOMATIC_VALIDATION_REJECTED");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R10");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R10");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R10");
  if (input.d9 === true) fail("D9_NOT_STARTED");
  if (input.reason === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10");
  if (input.propagateOutsideApplicability === true) fail("APPLICABILITY_MISMATCH");
}

function assertScope(actor: D8R10Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D8R10Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_IAC_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority === "IAC_VALIDATION_AUTHORITY" || actor.authority === "REVIEWER" || actor.authority === "IAC_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D8_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  return cited;
}

function remember(store: D8R10Store, subjectKind: D8R10History["subjectKind"], subjectId: string, fingerprint: string): void {
  store.history.push({ historyId: `d8r10-history-${store.history.length + 1}`, subjectKind, subjectId, action: "CREATED", fingerprint, recordedAt: store.now() });
}

function pack(row: Packed, revision?: string): Hit {
  return {
    revision: revision ?? row.provenanceRef ?? row.fingerprint,
    fingerprint: row.fingerprint,
    status: row.recordStatus,
    currentness: row.currentness,
    contextId: row.contextId ?? "",
    tenantId: row.tenantId,
    workspaceId: row.workspaceId ?? "",
    projectId: row.projectId ?? "",
    objectId: row.objectId ?? "",
    objectRevisionFingerprint: row.objectRevisionFingerprint ?? row.fingerprint,
  };
}

function pinKey(pin: D8R10Pin): string {
  return `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${pin.subjectFingerprint}`;
}

function locate(store: D8R10Store, kind: SubjectKind, id: string): Hit | undefined {
  const r8 = store.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  const r1 = r2.r1;
  if (kind === "OBJECT") {
    const row = r1.objects.find((item) => item.objectId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "MEASUREMENT") {
    const row = r2.measurements.find((item) => item.measurementRecordId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "DEVICE") {
    const row = r3.devices.find((item) => item.deviceRecordId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "SIGNAL") {
    const row = r4.signals.find((item) => item.signalRecordId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "IO") {
    const row = r4.ioRecords.find((item) => item.ioRecordId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "LOOP") {
    const row = r4.loops.find((item) => item.loopRecordId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "SYSTEM") {
    const row = r5.systems.find((item) => item.systemRecordId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "SAFETY") {
    const row = r6.contexts.find((item) => item.contextRecordId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "REQUIREMENT") {
    const row = r7.requirements.find((item) => item.requirementId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "ASSUMPTION") {
    const row = r7.assumptions.find((item) => item.assumptionId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "DECISION") {
    const row = r7.decisions.find((item) => item.decisionId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "CHANGE") {
    const row = r7.changes.find((item) => item.changeId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "REASSESSMENT") {
    const row = r7.reassessments.find((item) => item.reassessmentId === id);
    return row ? pack({ ...row, provenanceRef: row.fingerprint, objectId: row.objectId, objectRevisionFingerprint: row.objectRevisionFingerprint }) : undefined;
  }
  if (kind === "HANDOFF") {
    const row = r8.handoffs.find((item) => item.handoffId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "REVIEW_REQUEST") {
    const row = store.r9.requests.find((item) => item.reviewRequestId === id);
    return row ? pack(row) : undefined;
  }
  if (kind === "FINDING") {
    const row = store.r9.findings.find((item) => item.findingId === id);
    return row ? pack(row) : undefined;
  }
  const row = store.r9.validations.find((item) => item.validationId === id);
  return row ? pack(row) : undefined;
}

function storedCurrentness(store: D8R10Store, subject: D8R10Pin): Currentness {
  const hit = locate(store, subject.subjectKind, subject.subjectId);
  if (!hit || !isCurrentness(hit.currentness) || hit.fingerprint !== subject.subjectFingerprint) fail("CURRENTNESS_INVALID");
  return hit.currentness;
}

export function exposedIacCurrentness(store: D8R10Store, subject: D8R10Pin): Currentness {
  const overlay = [...store.marks].reverse().find((row) => pinKey(row.subject) === pinKey(subject));
  return overlay?.currentness ?? storedCurrentness(store, subject);
}

function live(store: D8R10Store, actor: D8R10Actor, contextId: string, endpoint: Endpoint, cited: Currentness): D8R10Pin {
  const subjectKind = explicit(endpoint.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D8_R10_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(endpoint.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(endpoint.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(endpoint.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const context = store.r9.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D8_DISCIPLINE) fail("DISCIPLINE_NOT_IAC");
  const hit = locate(store, subjectKind as SubjectKind, subjectId);
  if (!hit || hit.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
  if (hit.workspaceId !== "" && hit.workspaceId !== actor.workspaceId) fail("SCOPE_MISMATCH");
  if (hit.projectId !== "" && hit.projectId !== actor.projectId) fail("SCOPE_MISMATCH");
  if (hit.contextId !== "" && hit.contextId !== context.contextId) fail("SUBJECT_NOT_FOUND");
  if (hit.fingerprint !== subjectFingerprint || hit.revision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
  const pin: D8R10Pin = { subjectKind: subjectKind as SubjectKind, subjectId, subjectRevision, subjectFingerprint, contextId: context.contextId };
  const effective = exposedIacCurrentness(store, pin);
  if (effective === "STALE" && cited === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  if (effective === "SUPERSEDED" && cited === "CURRENT") fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  if (effective === "REASSESSMENT_REQUIRED" && cited === "CURRENT") fail("REASSESSMENT_EXPOSED_AS_CURRENT");
  if (cited === "CURRENT" && (hit.status !== "CURRENT" || effective !== "CURRENT")) fail("SUBJECT_NOT_CURRENT");
  if (hit.status === "SUPERSEDED" && cited !== "SUPERSEDED") fail("SUBJECT_NOT_CURRENT");
  return pin;
}

function snapshot(store: D8R10Store): string {
  const r8 = store.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  return JSON.stringify({
    objects: r2.r1.objects,
    measurements: r2.measurements,
    devices: r3.devices,
    signals: r4.signals,
    ioRecords: r4.ioRecords,
    loops: r4.loops,
    systems: r5.systems,
    contexts: r6.contexts,
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

function downstream(store: D8R10Store, origin: D8R10Pin): D8R10Pin[] {
  const found: D8R10Pin[] = [];
  const seen = new Set<string>([pinKey(origin)]);
  let frontier = [origin];
  for (let depth = 0; depth < THREAD_DEFAULT_MAX_DEPTH && frontier.length > 0; depth += 1) {
    const next: D8R10Pin[] = [];
    for (const pin of frontier) {
      for (const edge of store.edges) {
        if (edge.contextId !== origin.contextId || edge.candidate || edge.authoritative) continue;
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

function governedRelation(relationshipType: string): string {
  const relation = explicit(relationshipType, "RELATIONSHIP_REQUIRED");
  if (relation === "SUPERSEDES") fail("SUPERSESSION_FUNCTION_REQUIRED");
  const identity = (D8_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(relation);
  if (!identity && (!isGovernedRelationType(relation) || !relationSemantics(relation))) fail("RELATION_NOT_GOVERNED");
  return relation;
}

function applicabilityOf(value: string, subjectId: string): string {
  const applicability = explicit(value, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(subjectId)) fail("APPLICABILITY_MISMATCH");
  return applicability;
}

function assertCounterpart(store: D8R10Store, pin: D8R10Pin, input: { counterpartRevision?: string | null; counterpartFingerprint?: string | null }): void {
  if (pin.subjectKind !== "HANDOFF") return;
  const handoff = store.r9.r8.handoffs.find((row) => row.handoffId === pin.subjectId && row.fingerprint === pin.subjectFingerprint);
  if (!handoff) fail("SUBJECT_NOT_FOUND");
  const revision = explicit(input.counterpartRevision ?? "", "COUNTERPART_REVISION_REQUIRED");
  const fingerprint = explicit(input.counterpartFingerprint ?? "", "COUNTERPART_REVISION_REQUIRED");
  if (handoff.counterpart.sourceRevision !== revision || handoff.counterpart.fingerprint !== fingerprint) fail("COUNTERPART_REVISION_MISMATCH");
}

function changeCovers(change: { dependencies: readonly { targetId: string; targetFingerprint: string }[] }, hit: Hit, subjectId: string, subjectFingerprint: string): boolean {
  return change.dependencies.some((link) => (link.targetId === subjectId && link.targetFingerprint === subjectFingerprint) || (hit.objectId !== "" && link.targetId === hit.objectId && link.targetFingerprint === hit.objectRevisionFingerprint));
}

function requireChange(store: D8R10Store, actor: D8R10Actor, hit: Hit, subjectId: string, subjectFingerprint: string, changeId: string | null | undefined, changeFingerprint: string | null | undefined): { changeId: string; changeFingerprint: string } {
  const id = explicit(changeId ?? "", "EXPLICIT_BASIS_REQUIRED");
  const fingerprint = explicit(changeFingerprint ?? "", "EXPLICIT_BASIS_REQUIRED");
  const change = store.r9.r8.r7.changes.find((row) => row.changeId === id);
  if (!change || change.fingerprint !== fingerprint || change.tenantId !== actor.tenantId || change.recordStatus !== "CURRENT") fail("CHANGE_REVISION_MISMATCH");
  if (!changeCovers(change, hit, subjectId, subjectFingerprint)) fail("UNRELATED_CURRENTNESS_REJECTED");
  return { changeId: id, changeFingerprint: fingerprint };
}

function requireReassessment(store: D8R10Store, actor: D8R10Actor, hit: Hit, subjectId: string, subjectFingerprint: string, currentness: Currentness, reassessmentId: string | null | undefined, reassessmentFingerprint: string | null | undefined): { reassessmentId: string; reassessmentFingerprint: string } | null {
  if (reassessmentId == null || reassessmentId === "") return null;
  const id = explicit(reassessmentId, "REASSESSMENT_REVISION_REQUIRED");
  const fingerprint = explicit(reassessmentFingerprint ?? "", "REASSESSMENT_REVISION_REQUIRED");
  const row = store.r9.r8.r7.reassessments.find((item) => item.reassessmentId === id);
  if (!row || row.fingerprint !== fingerprint || row.tenantId !== actor.tenantId || row.recordStatus !== "CURRENT") fail("REASSESSMENT_REVISION_MISMATCH");
  const covers = (row.targetId === subjectId && row.targetFingerprint === subjectFingerprint) || (hit.objectId !== "" && row.targetId === hit.objectId && row.targetFingerprint === hit.objectRevisionFingerprint);
  if (!covers) fail("UNRELATED_CURRENTNESS_REJECTED");
  if (row.state === "REASSESSMENT_COMPLETED") fail("REASSESSMENT_COMPLETED_NOT_CURRENT");
  if (currentness === "REASSESSMENT_REQUIRED" && row.state !== "REASSESSMENT_REQUIRED") fail("REASSESSMENT_REVISION_MISMATCH");
  if (row.validated) fail("REASSESSMENT_NOT_VALIDATED");
  return { reassessmentId: id, reassessmentFingerprint: fingerprint };
}

export function createD8R10Store(r9: D8R9Store, now: () => string = () => r9.now()): D8R10Store {
  if (R9_RUNTIME_COUNT !== 9) fail("R9_RUNTIME_COUNT_UNEXPECTED");
  const r1 = r9.r8.r7.r6.r5.r4.r3.r2.r1;
  if (!Array.isArray(r1.contexts) || !Array.isArray(r1.objects) || r9.r8.r7.r6.r5.r4.r3.r2.r1 !== r1) fail("R1_R9_STORE_MISMATCH");
  return { r9, now, edges: [], supersessions: [], marks: [], history: [] };
}

function writeEdge(store: D8R10Store, actor: D8R10Actor, edgeClass: "LINEAGE" | "THREAD", input: Prohibited & {
  edgeId: string; contextId: string; source: Endpoint; target: Endpoint; relationshipType: string; citedCurrentness: string; provenanceRef: string; sourceBasisRef: string; applicability: string; limitations: string; assertedFingerprint?: string | null; counterpartRevision?: string | null; counterpartFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D8R10EdgeRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const relationshipType = governedRelation(input.relationshipType);
  const source = live(store, actor, contextId, input.source, cited);
  const target = live(store, actor, contextId, input.target, cited);
  assertCounterpart(store, source, input);
  assertCounterpart(store, target, input);
  if (pinKey(source) === pinKey(target)) fail("LINEAGE_SELF_LINK_REJECTED");
  if (downstream(store, target).some((pin) => pinKey(pin) === pinKey(source))) fail("CIRCULAR_LINEAGE_REJECTED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_BASIS");
  const applicability = applicabilityOf(input.applicability, source.subjectId);
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const edgeId = explicit(input.edgeId, "EDGE_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ edgeId, edgeClass, source, target, relationshipType, citedCurrentness: cited, provenanceRef, sourceBasisRef, applicability, limitations, engineeringValidated: false, authoritative: false });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.edges.find((row) => row.edgeId === edgeId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("EDGE_ALREADY_RECORDED");
  const signature = `${edgeClass}|${pinKey(source)}|${pinKey(target)}|${relationshipType}`;
  if (store.edges.some((row) => `${row.edgeClass}|${pinKey(row.source)}|${pinKey(row.target)}|${row.relationshipType}` === signature)) fail(edgeClass === "LINEAGE" ? "DUPLICATE_LINEAGE_REJECTED" : "DUPLICATE_THREAD_REJECTED");
  const before = snapshot(store);
  const beforeEdges = store.edges.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|");
  const record: D8R10EdgeRecord = Object.freeze({
    edgeId, edgeClass, contextId: source.contextId, source, target, relationshipType, authoritative: false, candidate: false, engineeringAuthority: false, requirementAdopted: false, engineeringValidated: false, approved: false, citedCurrentness: cited,
    provenanceRef, sourceBasisRef, applicability, limitations, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  store.edges.push(record);
  remember(store, edgeClass, record.edgeId, record.fingerprint);
  if (store.edges.filter((row) => row.edgeId !== record.edgeId).map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|") !== beforeEdges) fail("HISTORICAL_REFERENCE_REWRITTEN");
  if (snapshot(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordIacRevisionLineage(store: D8R10Store, actor: D8R10Actor, input: Prohibited & {
  lineageId: string; contextId: string; predecessor: Endpoint; successor: Endpoint; relationshipType: string; citedCurrentness: string; provenanceRef: string; sourceBasisRef: string; applicability: string; limitations: string; assertedFingerprint?: string | null; counterpartRevision?: string | null; counterpartFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D8R10EdgeRecord {
  return writeEdge(store, actor, "LINEAGE", { ...input, edgeId: input.lineageId, source: input.predecessor, target: input.successor });
}

export function recordIacThreadRelationship(store: D8R10Store, actor: D8R10Actor, input: Prohibited & {
  relationshipId: string; contextId: string; source: Endpoint; target: Endpoint; relationshipType: string; citedCurrentness: string; provenanceRef: string; sourceBasisRef: string; applicability: string; limitations: string; assertedFingerprint?: string | null; counterpartRevision?: string | null; counterpartFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D8R10EdgeRecord {
  return writeEdge(store, actor, "THREAD", { ...input, edgeId: input.relationshipId });
}

export function recordIacRevisionSupersession(store: D8R10Store, actor: D8R10Actor, input: Prohibited & {
  supersessionId: string; contextId: string; predecessor: Endpoint; successor: Endpoint; provenanceRef: string; sourceBasisRef: string; applicability: string; limitations: string; assertedFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D8R10SupersessionRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const predecessor = live(store, actor, contextId, input.predecessor, "STALE");
  const successor = live(store, actor, contextId, input.successor, "CURRENT");
  if (predecessor.subjectKind !== successor.subjectKind) fail("SUPERSESSION_KIND_MISMATCH");
  if (pinKey(predecessor) === pinKey(successor)) fail("SUPERSESSION_SELF_REJECTED");
  if (exposedIacCurrentness(store, predecessor) === "SUPERSEDED") fail("FALSE_SUPERSESSION_REJECTED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_BASIS");
  const applicability = applicabilityOf(input.applicability, predecessor.subjectId);
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const supersessionId = explicit(input.supersessionId, "SUPERSESSION_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ supersessionId, predecessor, successor, provenanceRef, sourceBasisRef, validationInherited: false, approvalInherited: false });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.supersessions.find((row) => row.supersessionId === supersessionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("SUPERSESSION_ALREADY_RECORDED");
  const pair = `${pinKey(predecessor)}>${pinKey(successor)}`;
  if (store.supersessions.some((row) => `${pinKey(row.predecessor)}>${pinKey(row.successor)}` === pair)) fail("DUPLICATE_SUPERSESSION_REJECTED");
  const before = snapshot(store);
  const beforeEdges = store.edges.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|");
  const record: D8R10SupersessionRecord = Object.freeze({
    supersessionId, contextId: predecessor.contextId, predecessor, successor, validationInherited: false, approvalInherited: false, historicalEdgesRewritten: false, priorRevisionInvalidated: false,
    provenanceRef, sourceBasisRef, applicability, limitations, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  store.supersessions.push(record);
  remember(store, "SUPERSESSION", record.supersessionId, record.fingerprint);
  const mark = markOf(store, actor, `mark-${supersessionId}`, predecessor, "SUPERSEDED", null, null, provenanceRef, sourceBasisRef, applicability, limitations);
  if (mark.invalid || mark.engineeringValidated || mark.approved || mark.currentness !== "SUPERSEDED") fail("SUPERSEDED_EXPOSED_AS_INVALID");
  store.marks.push(mark);
  remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  if (store.edges.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|") !== beforeEdges) fail("HISTORICAL_REFERENCE_REWRITTEN");
  if (snapshot(store) !== before) fail("UPSTREAM_MUTATED");
  const inherited = store.r9.validations.some((row) => row.subjectId === successor.subjectId && row.subjectFingerprint === successor.subjectFingerprint && row.engineeringValidated);
  if (inherited && predecessor.subjectId !== successor.subjectId) fail("VALIDATION_TRANSFER_REJECTED");
  return record;
}

function markOf(store: D8R10Store, actor: D8R10Actor, eventId: string, subject: D8R10Pin, currentness: Currentness, change: { changeId: string; changeFingerprint: string } | null, reassessment: { reassessmentId: string; reassessmentFingerprint: string } | null, provenanceRef: string, sourceBasisRef: string, applicability: string, limitations: string): D8R10CurrentnessMark {
  const fingerprint = fingerprintCanonical({ eventId, subject, currentness, changeId: change?.changeId ?? null, reassessmentId: reassessment?.reassessmentId ?? null, provenanceRef, sourceBasisRef, engineeringValidated: false, approved: false, invalid: false });
  return Object.freeze({
    eventId, contextId: subject.contextId, subject, currentness, changeId: change?.changeId ?? null, changeFingerprint: change?.changeFingerprint ?? null, reassessmentId: reassessment?.reassessmentId ?? null, reassessmentFingerprint: reassessment?.reassessmentFingerprint ?? null,
    engineeringValidated: false, approved: false, conformant: false, invalid: false, validationFailed: false, counterpartValidated: false, authorityTransferred: false, requirementAdopted: false, contentMutated: false, historicalRepointed: false, fingerprintRepaired: false, rebaselined: false,
    provenanceRef, sourceBasisRef, applicability, limitations, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
}

export function recordIacCurrentnessTransition(store: D8R10Store, actor: D8R10Actor, input: Prohibited & {
  eventId: string; contextId: string; subject: Endpoint; currentness: string; changeId?: string | null; changeFingerprint?: string | null; reassessmentId?: string | null; reassessmentFingerprint?: string | null; counterpartRevision?: string | null; counterpartFingerprint?: string | null; propagate?: boolean; provenanceRef: string; sourceBasisRef: string; applicability: string; limitations: string; assertedFingerprint?: string | null; tenantId?: string; workspaceId?: string; projectId?: string;
}): D8R10CurrentnessMark {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const currentness = currentnessOf(input.currentness);
  if (currentness === "SUPERSEDED") fail("SUPERSESSION_FUNCTION_REQUIRED");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const cited = currentness === "CURRENT" ? "CURRENT" : currentness;
  const subject = live(store, actor, contextId, input.subject, cited);
  assertCounterpart(store, subject, input);
  const hit = locate(store, subject.subjectKind, subject.subjectId);
  if (!hit) fail("SUBJECT_NOT_FOUND");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_BASIS");
  const applicability = applicabilityOf(input.applicability, subject.subjectId);
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const change = currentness === "STALE" || currentness === "REASSESSMENT_REQUIRED" ? requireChange(store, actor, hit, subject.subjectId, subject.subjectFingerprint, input.changeId, input.changeFingerprint) : null;
  const reassessment = requireReassessment(store, actor, hit, subject.subjectId, subject.subjectFingerprint, currentness, input.reassessmentId, input.reassessmentFingerprint);
  if (currentness === "REASSESSMENT_REQUIRED" && !reassessment) fail("EXPLICIT_BASIS_REQUIRED");
  if (currentness === "CURRENT" && input.reassessmentId) fail("REASSESSMENT_COMPLETED_NOT_CURRENT");
  const eventId = explicit(input.eventId, "CURRENTNESS_EVENT_REQUIRED");
  const root = markOf(store, actor, eventId, subject, currentness, change, reassessment, provenanceRef, sourceBasisRef, applicability, limitations);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== root.fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.marks.find((row) => row.eventId === eventId);
  if (existing) return existing.fingerprint === root.fingerprint && existing.tenantId === actor.tenantId ? existing : fail("CURRENTNESS_ALREADY_RECORDED");
  if (root.engineeringValidated || root.approved || root.invalid || root.validationFailed || root.counterpartValidated || root.authorityTransferred) fail("CURRENT_NOT_VALIDATED");
  if (currentness === "STALE" && (root.invalid || root.currentness !== "STALE")) fail("STALE_EXPOSED_AS_INVALID");
  if (currentness === "REASSESSMENT_REQUIRED" && (root.currentness === "STALE" || root.engineeringValidated)) fail("REASSESSMENT_EXPOSED_AS_STALE");
  if (subject.subjectKind === "REVIEW_REQUEST" && root.engineeringValidated) fail("REVIEW_NOT_VALIDATED");
  if (subject.subjectKind === "VALIDATION" && (root.approved || root.validationFailed || root.invalid)) fail("VALIDATION_NOT_APPROVED");
  if (subject.subjectKind === "HANDOFF" && root.counterpartValidated) fail("HANDOFF_NOT_COUNTERPART_VALIDATED");
  const before = snapshot(store);
  const beforeEdges = store.edges.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|");
  store.marks.push(root);
  remember(store, "CURRENTNESS", root.eventId, root.fingerprint);
  if (input.propagate === true && !applicability.includes(subject.subjectId)) fail("APPLICABILITY_MISMATCH");
  if (store.edges.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|") !== beforeEdges) fail("HISTORICAL_REFERENCE_REWRITTEN");
  if (snapshot(store) !== before) fail("UPSTREAM_MUTATED");
  return root;
}

export function verifyIacRecordFingerprint(store: D8R10Store, actor: D8R10Actor, input: Prohibited & {
  contextId: string; subject: Endpoint; tenantId?: string; workspaceId?: string; projectId?: string;
}): D8R10FingerprintVerification {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const subjectKind = explicit(input.subject.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D8_R10_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.subject.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(input.subject.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const supplied = input.subject.subjectFingerprint.trim();
  if (!supplied || FLOATING.has(supplied.toLowerCase())) fail("SUBJECT_FINGERPRINT_REQUIRED");
  const context = store.r9.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId) fail("R1_CONTEXT_NOT_FOUND");
  const hit = locate(store, subjectKind as SubjectKind, subjectId);
  if (!hit || hit.tenantId !== actor.tenantId || hit.revision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
  if (hit.fingerprint !== supplied) fail("FINGERPRINT_MISMATCH");
  return { match: true, validated: false, approved: false, conformant: false, subjectFingerprint: hit.fingerprint };
}

export function repointIacHistoricalReference(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function inferIacLineage(): never { return fail("INFERRED_RELATIONSHIP_REJECTED"); }
export function inferIacThreadRelationship(): never { return fail("INFERRED_RELATIONSHIP_REJECTED"); }
export function repairIacFingerprint(): never { return fail("FINGERPRINT_OVERRIDE_REJECTED"); }
export function rebaselineIacFingerprint(): never { return fail("FINGERPRINT_OVERRIDE_REJECTED"); }
export function promoteIacCurrentnessToValidation(): never { return fail("CURRENT_NOT_VALIDATED"); }
export function promoteIacFingerprintToApproval(): never { return fail("FINGERPRINT_NOT_APPROVAL"); }
export function promoteIacLineageToAuthority(): never { return fail("LINEAGE_NOT_AUTHORITY"); }
export function inheritIacValidation(): never { return fail("VALIDATION_TRANSFER_REJECTED"); }
export function automaticallyValidateIacFromCurrentness(): never { return fail("AUTOMATIC_VALIDATION_REJECTED"); }
export function reasonAcrossIacCurrentness(): never { return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10"); }
