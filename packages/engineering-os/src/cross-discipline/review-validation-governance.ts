/**
 * EOS-D9-R7 review and validation governance.
 * One bounded runtime of review and D9-artefact validation over exact R1-R6 revisions.
 * Review completion and D9 validation are not source-discipline validation, approval, or conflict resolution.
 */
import {
  D8_REOPENED,
  D9_CANONICAL_MILESTONE_COUNT,
  D9_CANONICAL_PHASE_LIST,
  D9_CURRENTNESS_STATES,
  D9_DIGITAL_THREAD_MODULE,
  D9_FINGERPRINT_ALGORITHM,
  D9_IMPLEMENTATION_PHASE_TYPES,
  D9_IMPLEMENTATION_PHASES,
  D9_REUSES_CANONICAL_CURRENTNESS as ARCHITECTURE_REUSES_CURRENTNESS,
  D9_REUSES_CANONICAL_DIGITAL_THREAD as ARCHITECTURE_REUSES_THREAD,
  D9_REUSES_CANONICAL_FINGERPRINT as ARCHITECTURE_REUSES_FINGERPRINT,
  PARALLEL_D9_CURRENTNESS_ENGINE_CREATED as ARCHITECTURE_PARALLEL_CURRENTNESS,
  PARALLEL_D9_DIGITAL_THREAD_CREATED as ARCHITECTURE_PARALLEL_THREAD,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D6_STATUS,
  D7_STATUS,
  D8_STATUS,
  D8_TRACK_COMPLETE,
} from "../instrumentation-control/instrumentation-control-bounded-closeout";
import { type D9R3Store } from "./conflict-candidate-detection";
import { type D9R4Store } from "./conflict-governance-escalation";
import { type D9R2Store } from "./cross-discipline-observation";
import {
  D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY,
  D9_CONFLICT_DETECTION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT,
  D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT,
  D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY,
  D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D9_R7_CANONICAL_PHASE,
  D9_R7_PHASE_TYPE,
  D9_R7_STARTED,
  D9_RECOMMENDATION_RUNTIME_COUNT,
  D9_RECOMMENDATION_SUPPORT_RUNTIME_READY,
  D9_REVIEW_VALIDATION_RUNTIME_COUNT as R6_REVIEW_COUNT,
  D9_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT,
  D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY,
  type D9R6Assessment,
  type D9R6Store,
} from "./currentness-digital-thread";
import { type D9R5Store } from "./recommendation-support";
import {
  D9_R1_D1_STANDING_LIMITATION,
  buildD9SourceManifest,
  type D9R1Actor,
  type D9R1SourceEntry,
  type D9R1Store,
} from "./source-contract-read-model";

export const D9_R7_STATUS = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D9_R7_MATURITY = D9_R7_STATUS;
export const D9_R7_MATURITY_STATE = D9_R7_STATUS;
export const D9_R7_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D9_R7_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md" as const;
export const D9_R7_PHASE = D9_R7_CANONICAL_PHASE;
export const D9_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED = true as const;
export const D9_REVIEW_VALIDATION_RUNTIME_COUNT = 1 as const;
export const D9_REVIEW_VALIDATION_RUNTIME_READY = true as const;
export const D9_RUNTIME_STARTED = true as const;
export const D9_RUNTIME_COUNT = 7 as const;
export const D9_R7_R6_RUNTIME_REMAINS_SIX = R6_RUNTIME_COUNT === 6 && R6_REVIEW_COUNT === 0 && D9_R7_STARTED === false && D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT === 1 && D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY === true && D9_RECOMMENDATION_RUNTIME_COUNT === 1 && D9_RECOMMENDATION_SUPPORT_RUNTIME_READY === true && D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT === 1 && D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY === true && D9_CONFLICT_DETECTION_RUNTIME_COUNT === 1 && D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY === true && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT === 1 && D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY === true && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT === 1 && D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY === true;
export const D9_R7_ARCHITECTURE_REUSE_REMAINS = ARCHITECTURE_REUSES_CURRENTNESS === true && ARCHITECTURE_PARALLEL_CURRENTNESS === false && ARCHITECTURE_REUSES_THREAD === true && ARCHITECTURE_PARALLEL_THREAD === false && ARCHITECTURE_REUSES_FINGERPRINT === true;
export { D9_CONFLICT_CANDIDATE_DETECTION_RUNTIME_READY, D9_CONFLICT_DETECTION_RUNTIME_COUNT, D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_COUNT, D9_CONFLICT_GOVERNANCE_ESCALATION_RUNTIME_READY, D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_COUNT, D9_CROSS_DISCIPLINE_OBSERVATION_RUNTIME_READY, D9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT, D9_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY, D9_RECOMMENDATION_RUNTIME_COUNT, D9_RECOMMENDATION_SUPPORT_RUNTIME_READY, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_COUNT, D9_SOURCE_CONTRACT_READ_MODEL_RUNTIME_READY };
export const D9_R7_EXACT_SUBJECT_REVISION_REQUIRED = true as const;
export const D9_R7_FLOATING_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D9_R7_SUBJECT_AUTO_REPOINTED = false as const;
export const D9_R7_CAN_REVIEW_R1_READ_MODEL = true as const;
export const D9_R7_CAN_REVIEW_R2_OBSERVATION = true as const;
export const D9_R7_CAN_REVIEW_R3_CONFLICT_CANDIDATE = true as const;
export const D9_R7_CAN_REVIEW_R4_CONFLICT_GOVERNANCE = true as const;
export const D9_R7_CAN_REVIEW_R5_RECOMMENDATION = true as const;
export const D9_R7_CAN_REVIEW_R6_CURRENTNESS_THREAD = true as const;
export const D9_REVIEW_RECORD_IMPLEMENTED = true as const;
export const REVIEW_REQUESTED_EQUALS_REVIEW_ASSIGNED = false as const;
export const REVIEW_ASSIGNED_EQUALS_REVIEW_COMPLETED = false as const;
export const REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D9_R7_REVIEW_REQUIRES_TRACEABLE_REVIEWER = true as const;
export const D9_R7_REVIEWER_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D9_REVIEW_AUTHORITY = false as const;
export const ADMIN_EQUALS_D9_REVIEW_AUTHORITY = false as const;
export const AI_CAN_ASSIST_D9_REVIEW = true as const;
export const AI_ASSISTED_REVIEW_EQUALS_HUMAN_REVIEW = false as const;
export const AI_REVIEW_OUTPUT_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D9_R7_FINDING_CONTEXT_SUPPORTED = true as const;
export const FINDING_OPEN_EQUALS_FINDING_CLOSED = false as const;
export const FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const FINDING_ACCEPTED_EQUALS_APPROVED = false as const;
export const FINDING_CLOSED_EQUALS_CONFLICT_RESOLVED = false as const;
export const D9_R7_FINDING_EVIDENCE_REQUIRED = true as const;
export const D9_R7_FINDING_EVIDENCE_TRACEABLE = true as const;
export const D9_R7_FINDING_CLOSURE_AUTHORITY_REQUIRED = true as const;
export const D9_R7_FINDING_CLOSURE_AUTHORITY_TRACEABLE = true as const;
export const D9_VALIDATION_RECORD_IMPLEMENTED = true as const;
export const D9_VALIDATION_EQUALS_D1_STRUCTURAL_VALIDATION = false as const;
export const D9_VALIDATION_EQUALS_D2_CIVIL_VALIDATION = false as const;
export const D9_VALIDATION_EQUALS_D3_GEOTECHNICAL_VALIDATION = false as const;
export const D9_VALIDATION_EQUALS_D4_MECHANICAL_VALIDATION = false as const;
export const D9_VALIDATION_EQUALS_D5_PIPING_VALIDATION = false as const;
export const D9_VALIDATION_EQUALS_D6_PROCESS_VALIDATION = false as const;
export const D9_VALIDATION_EQUALS_D7_ELECTRICAL_VALIDATION = false as const;
export const D9_VALIDATION_EQUALS_D8_IAC_VALIDATION = false as const;
export const D9_R7_VALIDATION_REQUIRES_HUMAN_AUTHORITY = true as const;
export const D9_R7_VALIDATION_AUTHORITY_TRACEABLE = true as const;
export const AI_CAN_AUTHORITATIVELY_VALIDATE_D9 = false as const;
export const ADMIN_CAN_AUTHORITATIVELY_VALIDATE_D9_WITHOUT_ENGINEERING_AUTHORITY = false as const;
export const D9_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D9_R7_PERFORMS_AUTOMATIC_ENGINEERING_VALIDATION = false as const;
export const D9_VALIDATION_EQUALS_CONFORMANCE = false as const;
export const D9_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D9_VALIDATION_EQUALS_APPROVAL = false as const;
export const D9_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D9_VALIDATION_EQUALS_CERTIFICATION = false as const;
export const D9_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D9_VALIDATION_EQUALS_REGULATORY_APPROVAL = false as const;
export const CONFLICT_REVIEWED_EQUALS_CONFLICT_CONFIRMED = false as const;
export const CONFLICT_REVIEWED_EQUALS_CONFLICT_RESOLVED = false as const;
export const CONFLICT_REVIEWED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const RECOMMENDATION_REVIEWED_EQUALS_ENGINEERING_DECISION = false as const;
export const RECOMMENDATION_REVIEWED_EQUALS_APPROVAL = false as const;
export const RECOMMENDATION_REVIEWED_EQUALS_CONFLICT_RESOLUTION = false as const;
export const RECOMMENDATION_ACCEPTED_EQUALS_ENGINEERING_DECISION = false as const;
export const RECOMMENDATION_ACCEPTED_EQUALS_APPROVAL = false as const;
export const CURRENT_REVIEW_EQUALS_ENGINEERING_VALIDATED = false as const;
export const STALE_REVIEW_EQUALS_INVALID = false as const;
export const CURRENT_VALIDATION_RECORD_EQUALS_APPROVAL = false as const;
export const STALE_VALIDATION_RECORD_EQUALS_VALIDATION_FAILED = false as const;
export const SUPERSEDED_VALIDATION_RECORD_EQUALS_INVALID = false as const;
export const D9_R7_VALIDATION_EXACT_REVISION_REQUIRED = true as const;
export const D9_R7_VALIDATION_FLOATING_REFERENCE_ALLOWED = false as const;
export const D9_R7_NEW_REVISION_INHERITS_VALIDATION = false as const;
export const D9_R7_NEW_REVISION_INHERITS_APPROVAL = false as const;
export const D9_R7_CHANGE_CAN_REQUIRE_REASSESSMENT = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const D9_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D9_CURRENTNESS_ENGINE_CREATED = false as const;
export const D9_REUSES_CANONICAL_DIGITAL_THREAD = true as const;
export const D9_R7_DIGITAL_THREAD_MODULE = D9_DIGITAL_THREAD_MODULE;
export const PARALLEL_D9_DIGITAL_THREAD_CREATED = false as const;
export const D9_EXPLICIT_LINEAGE_REQUIRED = true as const;
export const D9_INFERRED_LINEAGE_ALLOWED = false as const;
export const D9_R7_REVIEW_VALIDATION_LINEAGE_PRESERVED = true as const;
export const D9_REUSES_CANONICAL_FINGERPRINT = D9_FINGERPRINT_ALGORITHM === "fingerprintCanonical" && ARCHITECTURE_REUSES_FINGERPRINT === true;
export const SECOND_D9_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D9_R7_REVIEW_VALIDATION_FINGERPRINT_VERIFICATION_SUPPORTED = true as const;
export const FINGERPRINT_MATCH_EQUALS_ENGINEERING_VALIDATED = false as const;
export const FINGERPRINT_MATCH_EQUALS_APPROVAL = false as const;
export const D9_R7_HISTORY_PRESERVED = true as const;
export const D9_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const SILENT_D9_R7_MUTATION_ALLOWED = false as const;
export const D9_R7_SOURCE_BASIS_REQUIRED = true as const;
export const D9_R7_SOURCE_BASIS_TRACEABLE = true as const;
export const D9_R7_PROVENANCE_REQUIRED = true as const;
export const D9_R7_PROVENANCE_PRESERVED = true as const;
export const D9_R7_APPLICABILITY_EXPLICIT = true as const;
export const D9_R7_AUTO_PROPAGATES_OUTSIDE_APPLICABILITY = false as const;
export const D9_R7_LIMITATIONS_EXPLICIT = true as const;
export const D9_R7_SOURCE_LIMITATIONS_PRESERVED = true as const;
export const D9_R7_CAN_SILENTLY_DROP_SOURCE_LIMITATIONS = false as const;
export const D9_R7_PRESERVES_D1_INCOMPLETE_STATUS = D1_STRUCTURAL_PACK_COMPLETE === false;
export const D9_R7_PRESERVES_D1_LIMITATIONS = true as const;
export const D9_TREATS_D1_STRUCTURAL_AS_COMPLETE = false as const;
export const D9_IGNORES_D1_STRUCTURAL_LIMITATIONS = false as const;
export const D9_EQUALS_D1_STRUCTURAL_AUTHORITY = false as const;
export const D9_EQUALS_D2_CIVIL_AUTHORITY = false as const;
export const D9_EQUALS_D3_GEOTECHNICAL_AUTHORITY = false as const;
export const D9_EQUALS_D4_MECHANICAL_AUTHORITY = false as const;
export const D9_EQUALS_D5_PIPING_AUTHORITY = false as const;
export const D9_EQUALS_D6_PROCESS_AUTHORITY = false as const;
export const D9_EQUALS_D7_ELECTRICAL_AUTHORITY = false as const;
export const D9_EQUALS_D8_IAC_AUTHORITY = false as const;
export const AI_EQUALS_D9_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D9_ENGINEERING_AUTHORITY = false as const;
export const D9_AUTO_VALIDATES_D1_STRUCTURAL = false as const;
export const D9_AUTO_VALIDATES_D2_CIVIL = false as const;
export const D9_AUTO_VALIDATES_D3_GEOTECHNICAL = false as const;
export const D9_AUTO_VALIDATES_D4_MECHANICAL = false as const;
export const D9_AUTO_VALIDATES_D5_PIPING = false as const;
export const D9_AUTO_VALIDATES_D6_PROCESS = false as const;
export const D9_AUTO_VALIDATES_D7_ELECTRICAL = false as const;
export const D9_AUTO_VALIDATES_D8_IAC = false as const;
export const D9_R7_AUTO_MUTATES_D1_STRUCTURAL = false as const;
export const D9_R7_AUTO_MUTATES_D2_CIVIL = false as const;
export const D9_R7_AUTO_MUTATES_D3_GEOTECHNICAL = false as const;
export const D9_R7_AUTO_MUTATES_D4_MECHANICAL = false as const;
export const D9_R7_AUTO_MUTATES_D5_PIPING = false as const;
export const D9_R7_AUTO_MUTATES_D6_PROCESS = false as const;
export const D9_R7_AUTO_MUTATES_D7_ELECTRICAL = false as const;
export const D9_R7_AUTO_MUTATES_D8_IAC = false as const;
export const D9_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D9_R7_RESOLVES_ENGINEERING_CONFLICT = false as const;
export const D9_ENGINEERING_DECISION_RUNTIME_COUNT = 0 as const;
export const D9_R7_MAKES_ENGINEERING_DECISION = false as const;
export const D9_R7_GENERATES_NEW_RECOMMENDATION = false as const;
export const D9_AUTOMATIC_ENGINEERING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D9_AUTOMATIC_ENGINEERING_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D9_ENGINEERING_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const TENANT_WORKSPACE_PROJECT_D9_R7_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D9_R7_ACCESS_ALLOWED = false as const;
export const D9_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D9_R7_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D9_R7_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D9_R7_RECORDER_AUTHORITY = "D9_REVIEW_VALIDATION_RECORDER" as const;
export const D9_R7_REVIEW_VERSION = "D9-R7-REVIEW-1" as const;
export const D9_R7_SUBJECT_KINDS = ["READ_MODEL", "OBSERVATION", "CANDIDATE", "GOVERNANCE", "RECOMMENDATION", "CURRENTNESS"] as const;
export const D9_R7_REVIEW_STATUSES = ["REQUESTED", "ASSIGNED", "COMPLETED"] as const;
export const D9_R7_FINDING_STATUSES = ["OPEN", "CLOSED", "ACCEPTED"] as const;
export const D9_R7_REVIEW_SCOPE = "D9_ARTEFACT" as const;
export const D9_R7_VALIDATION_SCOPE = "D9_ARTEFACT_INTEGRITY" as const;
export const D9_R8_CANONICAL_PHASE = D9_IMPLEMENTATION_PHASES[7];
export const D9_R8_PHASE_TYPE = D9_IMPLEMENTATION_PHASE_TYPES[7];
export const D9_R8_CANONICAL_SCOPE = "Close D9 as a bounded cross-discipline track without adding a substantive runtime. Verify R1 through R7 readiness and the nine canonical milestones. Preserve every zero-runtime authority boundary, the incomplete D1 pack, and the closed D2 through D8 tracks. D9 completion is bounded with limitations. Do not claim EOS general availability while D1 remains outstanding. Do not decide, approve, resolve, validate a source discipline, or mutate a source record." as const;
export const D9_R8_STARTED = false as const;
export const D9_R7_READY_FOR_NEXT_PHASE = true as const;
export const D9_R7_NEXT_PHASE = D9_R8_CANONICAL_PHASE;
export const D9_R7_NEXT_PHASE_TYPE = D9_R8_PHASE_TYPE;
export const D9_R7_CANONICAL_NEXT_PHASE = D9_R8_CANONICAL_PHASE;
export const D9_R7_CANONICAL_NEXT_PHASE_SCOPE = D9_R8_CANONICAL_SCOPE;
export const D9_R7_BLOCKER = "NONE" as const;
export const D9_R7_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D9_R7_DATABASE_SCHEMA_CHANGED = false as const;
export const D9_R7_NEW_DEPENDENCY_ADDED = false as const;
export const EOS_ALL_DISCIPLINES_COMPLETE = false as const;
export const EOS_GA_READY = false as const;
export const D9_R7_PRESERVES_CLOSED_TRACKS = D6_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D7_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_STATUS === "COMPLETE_BOUNDED_WITH_LIMITATIONS" && D8_TRACK_COMPLETE === true && D8_REOPENED === false;
export { D9_CANONICAL_MILESTONE_COUNT, D9_CANONICAL_PHASE_LIST, D9_CURRENTNESS_STATES };

const FLOATING = new Set(["latest", "head", "floating", "tip", "unspecified", "current"]);
const CONCLUSION = /\b(therefore|incorrect|confirmed|recommend|approved|validated|escalate|decide|resolve)\b/i;

export type D9R7Actor = D9R1Actor;
export type D9R7SubjectKind = (typeof D9_R7_SUBJECT_KINDS)[number];
export type D9R7FindingInput = { findingId: string; statement: string; evidence: string; status: string; closureAuthorityId?: string };
export type D9R7Finding = { findingId: string; statement: string; evidence: string; status: (typeof D9_R7_FINDING_STATUSES)[number]; closureAuthorityId: string | null; closedEqualsValidated: false; acceptedEqualsApproved: false; closedEqualsResolved: false };
export type D9R7ChainInput = {
  assessmentId: string;
  assessmentFingerprint: string;
  recommendationId: string;
  recommendationFingerprint: string;
  governanceId: string;
  governanceFingerprint: string;
  candidateId: string;
  candidateFingerprint: string;
  observationId: string;
  observationFingerprint: string;
  sourceAContractId: string;
  sourceAExactRevision: string;
  sourceAFingerprint: string;
  sourceBContractId: string;
  sourceBExactRevision: string;
  sourceBFingerprint: string;
  lineageFromRevision: string;
  lineageToRevision: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: string;
  subjectKind: string;
  subjectId: string;
  subjectFingerprint: string;
};
export type D9R7ReviewInput = D9R7ChainInput & {
  reviewId: string;
  reviewStatus: string;
  reviewerId: string;
  assigneeId?: string;
  findings: readonly D9R7FindingInput[];
  rationale: string;
  assertedFingerprint?: string | null;
  tenantId?: string;
  aiAssisted?: boolean;
  noteReassessment?: boolean;
  reassessmentCompleted?: boolean;
  infer?: boolean;
  repoint?: boolean;
  resolve?: boolean;
  decide?: boolean;
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  validateDiscipline?: boolean;
  mutateSource?: boolean;
  design?: boolean;
  optimize?: boolean;
  regenerate?: boolean;
  inheritValidation?: boolean;
  stripLimitations?: boolean;
  stripApplicability?: boolean;
  stripProvenance?: boolean;
  completeAsAi?: boolean;
};
export type D9R7ValidationInput = D9R7ChainInput & {
  validationId: string;
  reviewId: string;
  reviewFingerprint: string;
  validatorId: string;
  validationEvidence: string;
  validationBasis: string;
  assertedFingerprint?: string | null;
  tenantId?: string;
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  validateDiscipline?: boolean;
  regulatoryApproval?: boolean;
  inheritValidation?: boolean;
  repoint?: boolean;
  resolve?: boolean;
  decide?: boolean;
  mutateSource?: boolean;
};

export type D9R7Review = {
  reviewId: string;
  reviewVersion: typeof D9_R7_REVIEW_VERSION;
  reviewScope: typeof D9_R7_REVIEW_SCOPE;
  subjectKind: D9R7SubjectKind;
  subjectId: string;
  subjectFingerprint: string;
  reviewStatus: (typeof D9_R7_REVIEW_STATUSES)[number];
  reviewerId: string;
  reviewerAuthority: typeof D9_R7_RECORDER_AUTHORITY;
  assigneeId: string | null;
  findings: readonly D9R7Finding[];
  rationale: string;
  assessmentId: string;
  assessmentFingerprint: string;
  recommendationId: string;
  recommendationFingerprint: string;
  governanceId: string;
  governanceFingerprint: string;
  candidateId: string;
  candidateFingerprint: string;
  observationId: string;
  observationFingerprint: string;
  sourceAContractId: string;
  sourceAExactRevision: string;
  sourceAFingerprint: string;
  sourceBContractId: string;
  sourceBExactRevision: string;
  sourceBFingerprint: string;
  lineageFromRevision: string;
  lineageToRevision: string;
  sourceBasisRef: string;
  provenanceRef: string;
  applicability: string;
  limitations: string;
  d1Limitations: typeof D9_R1_D1_STANDING_LIMITATION;
  d1PackComplete: false;
  citedCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  digitalThreadModule: typeof D9_R7_DIGITAL_THREAD_MODULE;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  fingerprint: string;
  aiAssisted: boolean;
  reassessmentNoted: boolean;
  reassessmentCompleted: boolean;
  requestedEqualsAssigned: false;
  assignedEqualsCompleted: false;
  completedEqualsValidated: false;
  conflictReviewedEqualsConfirmed: false;
  conflictReviewedEqualsResolved: false;
  recommendationReviewedEqualsDecision: false;
  recommendationReviewedEqualsApproval: false;
  currentReviewEqualsValidated: false;
  staleReviewEqualsInvalid: false;
  reassessmentRequiredEqualsValidationFailed: false;
  reassessmentCompletedEqualsValidated: false;
  engineeringValidated: false;
  disciplineValidated: false;
  conformance: false;
  approved: false;
  certified: false;
  regulatoryApproval: false;
  resolved: false;
  engineeringDecision: false;
  authoritative: false;
  recordedAt: string;
};

export type D9R7Validation = {
  validationId: string;
  reviewVersion: typeof D9_R7_REVIEW_VERSION;
  validationScope: typeof D9_R7_VALIDATION_SCOPE;
  reviewId: string;
  reviewFingerprint: string;
  validatorId: string;
  validatorAuthority: typeof D9_R7_RECORDER_AUTHORITY;
  validationEvidence: string;
  validationBasis: string;
  subjectKind: D9R7SubjectKind;
  subjectId: string;
  subjectFingerprint: string;
  sourceAExactRevision: string;
  sourceBExactRevision: string;
  citedCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  applicability: string;
  limitations: string;
  d1Limitations: typeof D9_R1_D1_STANDING_LIMITATION;
  d1PackComplete: false;
  provenanceRef: string;
  lineageFromRevision: string;
  lineageToRevision: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  fingerprint: string;
  engineeringValidated: false;
  disciplineValidated: false;
  conformance: false;
  approved: false;
  certified: false;
  regulatoryApproval: false;
  currentEqualsApproval: false;
  staleEqualsValidationFailed: false;
  supersededEqualsInvalid: false;
  inheritedFromNewRevision: false;
  authoritative: false;
  recordedAt: string;
};

export type D9R7History = { historyId: string; recordId: string; action: "REVIEW_CREATED" | "VALIDATION_CREATED"; fingerprint: string; recordedAt: string };
export type D9R7Store = { tenantId: string; workspaceId: string; projectId: string; now: () => string; reviews: D9R7Review[]; validations: D9R7Validation[]; history: D9R7History[] };
export type D9R7AiNote = { aiAssisted: true; authoritative: false; humanReview: false; engineeringValidated: false; note: string };

type Chain = {
  assessment: D9R6Assessment;
  recommendationId: string;
  governanceId: string;
  candidateId: string;
  observationId: string;
  sourceA: D9R1SourceEntry;
  sourceB: D9R1SourceEntry;
  subjectKind: D9R7SubjectKind;
  subjectId: string;
  subjectFingerprint: string;
  lineageFromRevision: string;
  lineageToRevision: string;
  citedCurrentness: (typeof D9_CURRENTNESS_STATES)[number];
  d1Limitations: typeof D9_R1_D1_STANDING_LIMITATION;
};

function fail(code: string): never {
  throw new Error(`D9_R7_${code}`);
}

function blockedParty(value: string): boolean {
  const token = value.toUpperCase();
  return token === "AI" || token.startsWith("AI_") || token.startsWith("AI-") || token.startsWith("AI ") || token.includes("LLM");
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase())) fail(code);
  if (/calc\(|solve\(/i.test(token)) fail("DERIVATION_REJECTED");
  return token;
}

function prose(value: string, code: string): string {
  const token = explicit(value, code);
  if (CONCLUSION.test(token)) fail("CONCLUSION_REJECTED");
  return token;
}

function stateOf(value: string): (typeof D9_CURRENTNESS_STATES)[number] {
  if (!(D9_CURRENTNESS_STATES as readonly string[]).includes(value)) fail("CURRENTNESS_SPOOFED");
  return value as (typeof D9_CURRENTNESS_STATES)[number];
}

function assertActor(actor: D9R7Actor, stores: { tenantId: string; workspaceId: string; projectId: string }[], store: D9R7Store): void {
  if (!actor.actorId.trim()) fail("SCOPE_REQUIRED");
  for (const scoped of [...stores, store]) {
    if (actor.tenantId !== scoped.tenantId || actor.workspaceId !== scoped.workspaceId || actor.projectId !== scoped.projectId) fail("CROSS_SCOPE_REJECTED");
  }
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_D9_AUTHORITY");
  if (actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR" || actor.actorId === "ADMIN") fail("ADMIN_CANNOT_OVERRIDE");
  if (actor.authority !== D9_R7_RECORDER_AUTHORITY) fail("RECORDER_AUTHORITY_REQUIRED");
}

function findEntry(r1: D9R1Store, contractId: string, exactRevision: string, fingerprint: string): D9R1SourceEntry {
  const entry = r1.entries.find((row) => row.contractId === contractId && row.exactRevision === exactRevision && row.tenantId === r1.tenantId);
  if (!entry) fail("SOURCE_REVISION_NOT_ON_MANIFEST");
  if (entry.fingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  return entry;
}

function loadChain(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, r5: D9R5Store, r6: D9R6Store, input: D9R7ChainInput): Chain {
  if (!(D9_R7_SUBJECT_KINDS as readonly string[]).includes(input.subjectKind)) fail("SUBJECT_SPOOFED");
  const assessment = r6.assessments.find((row) => row.assessmentId === input.assessmentId && row.tenantId === r6.tenantId);
  if (!assessment || assessment.fingerprint !== input.assessmentFingerprint) fail("ASSESSMENT_REVISION_MISMATCH");
  const recommendation = r5.recommendations.find((row) => row.recommendationId === input.recommendationId && row.tenantId === r5.tenantId);
  if (!recommendation || recommendation.fingerprint !== input.recommendationFingerprint || recommendation.recommendationId !== assessment.recommendationId || recommendation.fingerprint !== assessment.recommendationFingerprint) fail("RECOMMENDATION_REVISION_MISMATCH");
  const governance = r4.records.find((row) => row.governanceId === input.governanceId && row.tenantId === r4.tenantId);
  if (!governance || governance.fingerprint !== input.governanceFingerprint || governance.governanceId !== recommendation.governanceId || governance.fingerprint !== recommendation.governanceFingerprint) fail("GOVERNANCE_REVISION_MISMATCH");
  const candidate = r3.candidates.find((row) => row.candidateId === input.candidateId && row.tenantId === r3.tenantId);
  if (!candidate || candidate.fingerprint !== input.candidateFingerprint || candidate.candidateId !== governance.candidateId || candidate.fingerprint !== governance.candidateFingerprint) fail("CANDIDATE_REVISION_MISMATCH");
  const observation = r2.observations.find((row) => row.observationId === input.observationId && row.tenantId === r2.tenantId);
  if (!observation || observation.fingerprint !== input.observationFingerprint || observation.observationId !== governance.observationId || observation.fingerprint !== governance.observationFingerprint) fail("OBSERVATION_REVISION_MISMATCH");
  const sourceARevision = explicit(input.sourceAExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceBRevision = explicit(input.sourceBExactRevision, "EXACT_REVISION_REQUIRED");
  const sourceAContractId = explicit(input.sourceAContractId, "SOURCE_A_REQUIRED");
  const sourceBContractId = explicit(input.sourceBContractId, "SOURCE_B_REQUIRED");
  if (sourceAContractId !== assessment.sourceAContractId || sourceARevision !== assessment.sourceAExactRevision || input.sourceAFingerprint !== assessment.sourceAFingerprint) fail("EXACT_REVISION_MISMATCH");
  if (sourceBContractId !== assessment.sourceBContractId || sourceBRevision !== assessment.sourceBExactRevision || input.sourceBFingerprint !== assessment.sourceBFingerprint) fail("EXACT_REVISION_MISMATCH");
  const manifest = buildD9SourceManifest(r1);
  if (manifest.d1.packComplete || manifest.d1.limitations !== D9_R1_D1_STANDING_LIMITATION) fail("D1_LIMITATION_MISSING");
  const sourceA = findEntry(r1, sourceAContractId, sourceARevision, input.sourceAFingerprint);
  const sourceB = findEntry(r1, sourceBContractId, sourceBRevision, input.sourceBFingerprint);
  const citedCurrentness = stateOf(input.citedCurrentness);
  if (citedCurrentness !== assessment.assessedCurrentness) fail("CURRENTNESS_MISMATCH");
  const lineageFromRevision = explicit(input.lineageFromRevision, "LINEAGE_REVISION_REQUIRED");
  const lineageToRevision = explicit(input.lineageToRevision, "LINEAGE_REVISION_REQUIRED");
  if (lineageFromRevision !== assessment.lineageFromRevision || lineageToRevision !== assessment.lineageToRevision) fail("LINEAGE_MISMATCH");
  const lineageEntry = [sourceA, sourceB].find((entry) => entry.lineage.some((row) => row.fromRevision === lineageFromRevision && row.toRevision === lineageToRevision) && entry.exactRevision === lineageToRevision);
  if (!lineageEntry) fail("LINEAGE_NOT_EXPLICIT");
  const subjectKind = input.subjectKind as D9R7SubjectKind;
  const subjectId = explicit(input.subjectId, "SUBJECT_ID_REQUIRED");
  const expected = subjectKind === "READ_MODEL"
    ? (subjectId === sourceA.entryId ? sourceA : subjectId === sourceB.entryId ? sourceB : fail("SUBJECT_REVISION_MISMATCH"))
    : subjectKind === "OBSERVATION" ? observation
    : subjectKind === "CANDIDATE" ? candidate
    : subjectKind === "GOVERNANCE" ? governance
    : subjectKind === "RECOMMENDATION" ? recommendation
    : assessment;
  const expectedId = subjectKind === "READ_MODEL" ? subjectId : subjectKind === "OBSERVATION" ? observation.observationId : subjectKind === "CANDIDATE" ? candidate.candidateId : subjectKind === "GOVERNANCE" ? governance.governanceId : subjectKind === "RECOMMENDATION" ? recommendation.recommendationId : assessment.assessmentId;
  const expectedFingerprint = subjectKind === "READ_MODEL" ? (expected as D9R1SourceEntry).fingerprint : subjectKind === "OBSERVATION" ? observation.fingerprint : subjectKind === "CANDIDATE" ? candidate.fingerprint : subjectKind === "GOVERNANCE" ? governance.fingerprint : subjectKind === "RECOMMENDATION" ? recommendation.fingerprint : assessment.fingerprint;
  if (subjectId !== expectedId || input.subjectFingerprint !== expectedFingerprint) fail("SUBJECT_REVISION_MISMATCH");
  return { assessment, recommendationId: recommendation.recommendationId, governanceId: governance.governanceId, candidateId: candidate.candidateId, observationId: observation.observationId, sourceA, sourceB, subjectKind, subjectId, subjectFingerprint: expectedFingerprint, lineageFromRevision, lineageToRevision, citedCurrentness, d1Limitations: manifest.d1.limitations };
}

function texts(chain: Chain, recommendationLimitations: string, governanceLimitations: string, input: D9R7ChainInput) {
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!sourceBasisRef.includes(chain.assessment.sourceBasisRef) || !sourceBasisRef.includes(chain.sourceA.sourceBasisRef) || !sourceBasisRef.includes(chain.sourceB.sourceBasisRef)) fail("SOURCE_BASIS_NOT_TRACEABLE");
  if (!provenanceRef.includes(chain.recommendationId) || !provenanceRef.includes(chain.governanceId) || !provenanceRef.includes(chain.candidateId) || !provenanceRef.includes(chain.observationId) || !provenanceRef.includes(chain.assessment.assessmentId) || !provenanceRef.includes(chain.sourceA.contractId) || !provenanceRef.includes(chain.sourceB.contractId) || !provenanceRef.includes(D9_R7_REVIEW_VERSION)) fail("PROVENANCE_NOT_TRACEABLE");
  if (!applicability.includes(chain.assessment.applicability)) fail("APPLICABILITY_NOT_PRESERVED");
  if (!limitations.includes(chain.assessment.limitations) || !limitations.includes(recommendationLimitations) || !limitations.includes(governanceLimitations) || !limitations.includes(chain.sourceA.limitations) || !limitations.includes(chain.sourceB.limitations) || !limitations.includes(D9_R1_D1_STANDING_LIMITATION)) fail("SOURCE_LIMITATION_NOT_PRESERVED");
  return { sourceBasisRef, provenanceRef, applicability, limitations };
}

function findingsOf(findings: readonly D9R7FindingInput[], actor: D9R7Actor, subjectId: string, sourceAContractId: string, sourceBContractId: string): D9R7Finding[] {
  if (findings.length < 1) fail("FINDING_REQUIRED");
  const rows = findings.map((row) => {
    const status = row.status;
    if (!(D9_R7_FINDING_STATUSES as readonly string[]).includes(status)) fail("FINDING_STATUS_SPOOFED");
    const evidence = prose(row.evidence, "FINDING_EVIDENCE_REQUIRED");
    const statement = prose(row.statement, "FINDING_STATEMENT_REQUIRED");
    if (!evidence.includes(subjectId) || !evidence.includes(sourceAContractId) || !evidence.includes(sourceBContractId)) fail("FINDING_EVIDENCE_NOT_TRACEABLE");
    const closed = status === "CLOSED" || status === "ACCEPTED";
    if (closed) {
      if (row.closureAuthorityId !== actor.actorId) fail("CLOSURE_AUTHORITY_REQUIRED");
      if (!evidence.includes(actor.actorId)) fail("CLOSURE_AUTHORITY_NOT_TRACEABLE");
    } else if (row.closureAuthorityId) fail("FINDING_STATUS_SPOOFED");
    return {
      findingId: explicit(row.findingId, "FINDING_ID_REQUIRED"),
      statement,
      evidence,
      status: status as (typeof D9_R7_FINDING_STATUSES)[number],
      closureAuthorityId: closed ? actor.actorId : null,
      closedEqualsValidated: false as const,
      acceptedEqualsApproved: false as const,
      closedEqualsResolved: false as const,
    };
  });
  if (new Set(rows.map((row) => row.findingId)).size !== rows.length) fail("DUPLICATE_FINDING_REJECTED");
  return rows.sort((left, right) => left.findingId.localeCompare(right.findingId));
}

export function createD9R7Store(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, r5: D9R5Store, r6: D9R6Store, now: () => string = () => r6.now()): D9R7Store {
  for (const scoped of [r2, r3, r4, r5, r6]) {
    if (r1.tenantId !== scoped.tenantId || r1.workspaceId !== scoped.workspaceId || r1.projectId !== scoped.projectId) fail("SCOPE_REQUIRED");
  }
  if (!D9_R7_R6_RUNTIME_REMAINS_SIX || !D9_R7_ARCHITECTURE_REUSE_REMAINS || D9_CANONICAL_MILESTONE_COUNT !== 9 || D9_R7_PHASE_TYPE !== "REVIEW_AND_VALIDATION_GOVERNANCE" || !D9_CANONICAL_PHASE_LIST.includes(D9_R7_PHASE)) fail("PHASE_LIST_UNEXPECTED");
  return { tenantId: r1.tenantId, workspaceId: r1.workspaceId, projectId: r1.projectId, now, reviews: [], validations: [], history: [] };
}

export function aiAssistD9Review(input: { note: string; evidence: string; complete?: boolean; validate?: boolean }): D9R7AiNote {
  if (input.complete || input.validate) fail("AI_REVIEW_AUTHORITY_REJECTED");
  return Object.freeze({ aiAssisted: true as const, authoritative: false as const, humanReview: false as const, engineeringValidated: false as const, note: prose(input.note, "NOTE_REQUIRED") });
}

export function recordD9Review(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, r5: D9R5Store, r6: D9R6Store, store: D9R7Store, actor: D9R7Actor, input: D9R7ReviewInput): D9R7Review {
  assertActor(actor, [r1, r2, r3, r4, r5, r6], store);
  if (input.infer) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint || input.inheritValidation) fail("AUTO_REPOINT_REJECTED");
  if (input.resolve) fail("CONFLICT_RESOLUTION_REJECTED");
  if (input.decide) fail("DECISION_REJECTED");
  if (input.approve || input.certify || input.conform || input.validateDiscipline) fail("VALIDATION_PROMOTION_REJECTED");
  if (input.mutateSource) fail("SOURCE_MUTATION_REJECTED");
  if (input.design || input.optimize) fail("DESIGN_REJECTED");
  if (input.regenerate) fail("RECOMMENDATION_REJECTED");
  if (input.stripLimitations) fail("LIMITATION_STRIPPING_REJECTED");
  if (input.stripApplicability) fail("APPLICABILITY_STRIPPING_REJECTED");
  if (input.stripProvenance) fail("PROVENANCE_STRIPPING_REJECTED");
  if (input.completeAsAi) fail("AI_REVIEW_AUTHORITY_REJECTED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_SCOPE_REJECTED");
  if (!(D9_R7_REVIEW_STATUSES as readonly string[]).includes(input.reviewStatus)) fail("REVIEW_STATUS_SPOOFED");
  const chain = loadChain(r1, r2, r3, r4, r5, r6, input);
  const reviewerId = explicit(input.reviewerId, "REVIEWER_REQUIRED");
  if (reviewerId !== actor.actorId) fail("REVIEWER_MISMATCH");
  const reviewStatus = input.reviewStatus as (typeof D9_R7_REVIEW_STATUSES)[number];
  let assigneeId: string | null = null;
  if (reviewStatus === "REQUESTED") {
    if (input.assigneeId) fail("REVIEW_STATUS_SPOOFED");
  } else {
    assigneeId = explicit(input.assigneeId ?? "", "ASSIGNEE_REQUIRED");
    if (blockedParty(assigneeId) || assigneeId === "ADMIN" || assigneeId === chain.sourceA.authority || assigneeId === chain.sourceB.authority) fail("AUTHORITY_SPOOFED");
  }
  const findings = findingsOf(input.findings, actor, chain.subjectId, chain.sourceA.contractId, chain.sourceB.contractId);
  const rationale = prose(input.rationale, "RATIONALE_REQUIRED");
  const recommendation = r5.recommendations.find((row) => row.recommendationId === chain.recommendationId);
  const governance = r4.records.find((row) => row.governanceId === chain.governanceId);
  if (!recommendation || !governance) fail("SUBJECT_REVISION_MISMATCH");
  const kept = texts(chain, recommendation.limitations, governance.limitations, input);
  const body = {
    reviewVersion: D9_R7_REVIEW_VERSION,
    reviewScope: D9_R7_REVIEW_SCOPE,
    subjectKind: chain.subjectKind,
    subjectId: chain.subjectId,
    subjectFingerprint: chain.subjectFingerprint,
    reviewStatus,
    reviewerId,
    reviewerAuthority: D9_R7_RECORDER_AUTHORITY,
    assigneeId,
    findings,
    rationale,
    assessmentId: chain.assessment.assessmentId,
    assessmentFingerprint: chain.assessment.fingerprint,
    recommendationId: chain.recommendationId,
    recommendationFingerprint: recommendation.fingerprint,
    governanceId: chain.governanceId,
    governanceFingerprint: governance.fingerprint,
    candidateId: chain.candidateId,
    candidateFingerprint: input.candidateFingerprint,
    observationId: chain.observationId,
    observationFingerprint: input.observationFingerprint,
    sourceAContractId: chain.sourceA.contractId,
    sourceAExactRevision: chain.sourceA.exactRevision,
    sourceAFingerprint: chain.sourceA.fingerprint,
    sourceBContractId: chain.sourceB.contractId,
    sourceBExactRevision: chain.sourceB.exactRevision,
    sourceBFingerprint: chain.sourceB.fingerprint,
    lineageFromRevision: chain.lineageFromRevision,
    lineageToRevision: chain.lineageToRevision,
    sourceBasisRef: kept.sourceBasisRef,
    provenanceRef: kept.provenanceRef,
    applicability: kept.applicability,
    limitations: kept.limitations,
    d1Limitations: chain.d1Limitations,
    d1PackComplete: false as const,
    citedCurrentness: chain.citedCurrentness,
    digitalThreadModule: D9_R7_DIGITAL_THREAD_MODULE,
    tenantId: store.tenantId,
    workspaceId: store.workspaceId,
    projectId: store.projectId,
    aiAssisted: input.aiAssisted === true,
    reassessmentNoted: input.noteReassessment === true,
    reassessmentCompleted: input.reassessmentCompleted === true,
    requestedEqualsAssigned: false as const,
    assignedEqualsCompleted: false as const,
    completedEqualsValidated: false as const,
    conflictReviewedEqualsConfirmed: false as const,
    conflictReviewedEqualsResolved: false as const,
    recommendationReviewedEqualsDecision: false as const,
    recommendationReviewedEqualsApproval: false as const,
    currentReviewEqualsValidated: false as const,
    staleReviewEqualsInvalid: false as const,
    reassessmentRequiredEqualsValidationFailed: false as const,
    reassessmentCompletedEqualsValidated: false as const,
    engineeringValidated: false as const,
    disciplineValidated: false as const,
    conformance: false as const,
    approved: false as const,
    certified: false as const,
    regulatoryApproval: false as const,
    resolved: false as const,
    engineeringDecision: false as const,
    authoritative: false as const,
  };
  const fingerprint = fingerprintCanonical(body);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const reviewId = explicit(input.reviewId, "REVIEW_ID_REQUIRED");
  const existing = store.reviews.find((row) => row.reviewId === reviewId);
  if (existing) return existing.fingerprint === fingerprint ? existing : fail("REPLAY_REJECTED");
  const findingKey = findings.map((row) => row.statement).join("|");
  if (store.reviews.some((row) => row.subjectKind === chain.subjectKind && row.subjectFingerprint === chain.subjectFingerprint && row.reviewStatus === reviewStatus && row.findings.map((finding) => finding.statement).join("|") === findingKey)) fail("DUPLICATE_REVIEW_REJECTED");
  const review: D9R7Review = Object.freeze({ ...body, reviewId, fingerprint, recordedAt: store.now() });
  store.reviews.push(review);
  store.history.push({ historyId: `d9-r7-hist-${store.history.length + 1}`, recordId: reviewId, action: "REVIEW_CREATED", fingerprint, recordedAt: review.recordedAt });
  return review;
}

export function recordD9Validation(r1: D9R1Store, r2: D9R2Store, r3: D9R3Store, r4: D9R4Store, r5: D9R5Store, r6: D9R6Store, store: D9R7Store, actor: D9R7Actor, input: D9R7ValidationInput): D9R7Validation {
  assertActor(actor, [r1, r2, r3, r4, r5, r6], store);
  if (input.approve || input.certify || input.conform || input.validateDiscipline || input.regulatoryApproval) fail("VALIDATION_PROMOTION_REJECTED");
  if (input.inheritValidation || input.repoint) fail("AUTO_REPOINT_REJECTED");
  if (input.resolve) fail("CONFLICT_RESOLUTION_REJECTED");
  if (input.decide) fail("DECISION_REJECTED");
  if (input.mutateSource) fail("SOURCE_MUTATION_REJECTED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_SCOPE_REJECTED");
  const chain = loadChain(r1, r2, r3, r4, r5, r6, input);
  const validatorId = explicit(input.validatorId, "VALIDATOR_REQUIRED");
  if (validatorId !== actor.actorId) fail("VALIDATOR_MISMATCH");
  const review = store.reviews.find((row) => row.reviewId === input.reviewId && row.tenantId === store.tenantId);
  if (!review || review.fingerprint !== input.reviewFingerprint) fail("REVIEW_REVISION_MISMATCH");
  if (review.reviewStatus !== "COMPLETED") fail("REVIEW_NOT_COMPLETED");
  if (review.subjectFingerprint !== chain.subjectFingerprint || review.sourceAExactRevision !== chain.sourceA.exactRevision || review.sourceBExactRevision !== chain.sourceB.exactRevision) fail("VALIDATION_REVISION_MISMATCH");
  const recommendation = r5.recommendations.find((row) => row.recommendationId === chain.recommendationId);
  const governance = r4.records.find((row) => row.governanceId === chain.governanceId);
  if (!recommendation || !governance) fail("SUBJECT_REVISION_MISMATCH");
  const kept = texts(chain, recommendation.limitations, governance.limitations, input);
  const validationEvidence = prose(input.validationEvidence, "VALIDATION_EVIDENCE_REQUIRED");
  const validationBasis = prose(input.validationBasis, "VALIDATION_BASIS_REQUIRED");
  if (!validationEvidence.includes(review.reviewId) || !validationEvidence.includes(chain.subjectId) || !validationEvidence.includes(chain.sourceA.contractId) || !validationEvidence.includes(chain.sourceB.contractId) || !validationEvidence.includes(actor.actorId)) fail("VALIDATION_EVIDENCE_NOT_TRACEABLE");
  if (!validationBasis.includes(chain.sourceA.sourceBasisRef) || !validationBasis.includes(chain.sourceB.sourceBasisRef)) fail("VALIDATION_BASIS_NOT_TRACEABLE");
  const body = {
    reviewVersion: D9_R7_REVIEW_VERSION,
    validationScope: D9_R7_VALIDATION_SCOPE,
    reviewId: review.reviewId,
    reviewFingerprint: review.fingerprint,
    validatorId,
    validatorAuthority: D9_R7_RECORDER_AUTHORITY,
    validationEvidence,
    validationBasis,
    subjectKind: chain.subjectKind,
    subjectId: chain.subjectId,
    subjectFingerprint: chain.subjectFingerprint,
    sourceAExactRevision: chain.sourceA.exactRevision,
    sourceBExactRevision: chain.sourceB.exactRevision,
    citedCurrentness: chain.citedCurrentness,
    applicability: kept.applicability,
    limitations: kept.limitations,
    d1Limitations: chain.d1Limitations,
    d1PackComplete: false as const,
    provenanceRef: kept.provenanceRef,
    lineageFromRevision: chain.lineageFromRevision,
    lineageToRevision: chain.lineageToRevision,
    tenantId: store.tenantId,
    workspaceId: store.workspaceId,
    projectId: store.projectId,
    engineeringValidated: false as const,
    disciplineValidated: false as const,
    conformance: false as const,
    approved: false as const,
    certified: false as const,
    regulatoryApproval: false as const,
    currentEqualsApproval: false as const,
    staleEqualsValidationFailed: false as const,
    supersededEqualsInvalid: false as const,
    inheritedFromNewRevision: false as const,
    authoritative: false as const,
  };
  const fingerprint = fingerprintCanonical(body);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const validationId = explicit(input.validationId, "VALIDATION_ID_REQUIRED");
  const existing = store.validations.find((row) => row.validationId === validationId);
  if (existing) return existing.fingerprint === fingerprint ? existing : fail("REPLAY_REJECTED");
  if (store.validations.some((row) => row.reviewFingerprint === review.fingerprint && row.subjectFingerprint === chain.subjectFingerprint)) fail("DUPLICATE_VALIDATION_REJECTED");
  const validation: D9R7Validation = Object.freeze({ ...body, validationId, fingerprint, recordedAt: store.now() });
  store.validations.push(validation);
  store.history.push({ historyId: `d9-r7-hist-${store.history.length + 1}`, recordId: validationId, action: "VALIDATION_CREATED", fingerprint, recordedAt: validation.recordedAt });
  return validation;
}

export function repointD9Review(): never { return fail("AUTO_REPOINT_REJECTED"); }
export function inheritD9Validation(): never { return fail("VALIDATION_INHERITANCE_REJECTED"); }
export function resolveFromD9Review(): never { return fail("CONFLICT_RESOLUTION_REJECTED"); }
export function decideFromD9Review(): never { return fail("DECISION_REJECTED"); }
export function approveFromD9Review(): never { return fail("VALIDATION_PROMOTION_REJECTED"); }
export function certifyFromD9Review(): never { return fail("VALIDATION_PROMOTION_REJECTED"); }
export function validateDisciplineFromD9Review(): never { return fail("DISCIPLINE_VALIDATION_REJECTED"); }
export function mutateD9ReviewSource(): never { return fail("SOURCE_MUTATION_REJECTED"); }
