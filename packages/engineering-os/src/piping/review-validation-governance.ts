/**
 * EOS-D5-R9 Piping review and validation governance.
 * One bounded runtime. Review completion is not validation.
 * Validation is not conformance, approval, or certification.
 */
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_REVIEWER_AUTHORITY,
  AI_CAN_AUTO_VALIDATE_PIPING_ENGINEERING,
  AI_EQUALS_D5_PIPING_ENGINEERING_REVIEWER_AUTHORITY,
  D5_CURRENTNESS_STATES,
  D5_IMPLEMENTATION_PHASE_TYPES,
  D5_IMPLEMENTATION_PHASES,
  D5_MATURITY_STATES,
  D5_VALIDATED_EQUALS_APPROVED,
  D5_VALIDATED_EQUALS_CERTIFIED,
  D5_VALIDATED_EQUALS_CONFORMANT,
} from "@rtb/types";
import {
  D2_R9_FINDING_DISPOSITIONS,
  D2_R9_REQUEST_STATUSES,
  D2_R9_SUBJECT_KINDS,
  D2_R9_VALIDATION_STATES,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED as CANONICAL_REVIEW_COMPLETED_EQUALS_VALIDATED,
  REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED as CANONICAL_REQUEST_EQUALS_VALIDATED,
  REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED as CANONICAL_REQUEST_EQUALS_COMPLETED,
} from "../civil/review-validation-governance";
import { assertHumanApprovalActor } from "../decision-intelligence/invariants";
import { D3_R9_FINDING_CATEGORIES } from "../geotechnical/review-validation-governance";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { FORBIDDEN_PRE_ISSUE_VERDICTS, PRE_ISSUE_AI_BOUNDARY, PRE_ISSUE_MATERIALITY } from "../pre-issue-review/types";
import { resolveAuthAssuranceLevel } from "../security-closure/privileged-mfa";
import { D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED } from "../structural-systems/interface-handoff-governance";
import { D5_CONTEXT_AUTHORITY, type D5R1Actor } from "./identity-foundation";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY,
  D5_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT as R8_REVIEW_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY,
  D5_RUNTIME_COUNT as R8_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_READY,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
  type D5R8Store,
} from "./discipline-interfaces-handoffs";

export const D5_R9_STATUS = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D5_R9_MATURITY = D5_R9_STATUS;
export const D5_R9_MATURITY_STATE = D5_R9_STATUS;
export const D5_R9_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 9 as const;
export const D5_R8_RUNTIME_COUNT = R8_RUNTIME_COUNT;
export const D5_R8_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = R8_REVIEW_COUNT;
export const D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED = true as const;
export const D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = true as const;
export const D5_REUSES_CANONICAL_REVIEW_GOVERNANCE = true as const;
export const D5_REUSES_CANONICAL_VALIDATION_GOVERNANCE = true as const;
export const PARALLEL_D5_REVIEW_ENGINE_CREATED = false as const;
export const PARALLEL_D5_VALIDATION_ENGINE_CREATED = false as const;
export const D5_R1_R8_EXACT_SUBJECT_REVISIONS_REUSED = true as const;
export const EXACT_D5_REVIEW_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D5_REVIEW_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D5_REVIEW_SUBJECT_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_PIPING_REVIEW_REQUEST_GOVERNANCE_IMPLEMENTED = true as const;
export const REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED = CANONICAL_REQUEST_EQUALS_COMPLETED;
export const REVIEW_REQUESTED_EQUALS_VALIDATED = CANONICAL_REQUEST_EQUALS_VALIDATED;
export const D5_REVIEWER_AUTHORITY_REQUIRED = true as const;
export const D5_REVIEWER_AUTHORITY_TRACEABLE = true as const;
export const D5_PIPING_REVIEW_FINDING_GOVERNANCE_IMPLEMENTED = true as const;
export const REVIEW_FINDING_EQUALS_ENGINEERING_INVALID = false as const;
export const REVIEW_FINDING_EQUALS_REDESIGN_REQUIRED = false as const;
export const D5_PIPING_FINDING_DISPOSITION_GOVERNANCE_IMPLEMENTED = true as const;
export const FINDING_ADDRESSED_EQUALS_VALIDATED = false as const;
export const FINDING_CLOSED_EQUALS_VALIDATED = false as const;
export const FINDING_CLOSED_EQUALS_APPROVED = false as const;
export const FINDING_CLOSED_EQUALS_CONFORMANT = false as const;
export const D5_PIPING_REVIEW_COMPLETION_GOVERNANCE_IMPLEMENTED = true as const;
export const REVIEW_COMPLETED_EQUALS_VALIDATED = CANONICAL_REVIEW_COMPLETED_EQUALS_VALIDATED;
export const REVIEW_COMPLETED_EQUALS_CONFORMANT = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const REVIEW_COMPLETED_EQUALS_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const REVIEW_COMPLETED_EQUALS_CERTIFIED = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const D5_PIPING_VALIDATION_BASIS_REQUIRED = true as const;
export const D5_PIPING_VALIDATION_BASIS_TRACEABLE = true as const;
export const D5_PIPING_VALIDATION_STATE_GOVERNANCE_IMPLEMENTED = true as const;
export const VALIDATED_EQUALS_CONFORMANT = D5_VALIDATED_EQUALS_CONFORMANT;
export const VALIDATED_EQUALS_APPROVED = D5_VALIDATED_EQUALS_APPROVED;
export const VALIDATED_EQUALS_CERTIFIED = D5_VALIDATED_EQUALS_CERTIFIED;
export const VALIDATED_EQUALS_GA_READY = false as const;
export const D5_R9_AUTO_VALIDATES_ENGINEERING = AI_CAN_AUTO_VALIDATE_PIPING_ENGINEERING;
export const D5_R7_REASSESSMENT_REVIEW_INTEGRATION_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_APPROVED = false as const;
export const PRIOR_D5_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const PRIOR_D5_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const STALE_D5_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D5_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_VALIDATED = false as const;
export const D5_R9_HISTORY_PRESERVED = true as const;
export const D5_R9_AUTO_REPOINTS_REVIEW_HISTORY = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_R9_AUTO_REPOINTS_VALIDATION_HISTORY = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const SILENT_D5_R9_MUTATION_ALLOWED = false as const;
export const D5_R8_INTERFACE_CONTEXT_REUSED = true as const;
export const D5_R9_VALIDATES_D1_STRUCTURAL_ENGINEERING = false as const;
export const D5_R9_VALIDATES_D2_CIVIL_ENGINEERING = false as const;
export const D5_R9_VALIDATES_D3_GEOTECHNICAL_ENGINEERING = false as const;
export const D5_R9_VALIDATES_D4_MECHANICAL_ENGINEERING = false as const;
export const D5_R9_VALIDATES_FUTURE_D6_PROCESS_ENGINEERING = false as const;
export const D5_R9_VALIDATES_FUTURE_D7_ELECTRICAL_ENGINEERING = false as const;
export const D5_R9_VALIDATES_FUTURE_D8_IAC_ENGINEERING = false as const;
export const D5_R9_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D5_R9_AUTO_MUTATES_R3_SPECIFICATION = false as const;
export const D5_R9_AUTO_MUTATES_R4_COMPONENT_CONTEXT = false as const;
export const D5_R9_AUTO_MUTATES_R5_ROUTING_CONTEXT = false as const;
export const D5_R9_AUTO_MUTATES_R6_EVIDENCE = false as const;
export const D5_R9_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D5_R9_AUTO_MUTATES_R8_INTERFACE_HANDOFF = false as const;
export const D5_R9_PROVENANCE_REQUIRED = true as const;
export const D5_R9_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D5_R9_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D5_REVIEW_VALIDATION_ACCESS_ALLOWED = false as const;
export const D5_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R9_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R9_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D5_R9_REQUEST_STATUSES = D2_R9_REQUEST_STATUSES;
export const D5_R9_FINDING_DISPOSITIONS = D2_R9_FINDING_DISPOSITIONS;
export const D5_R9_VALIDATION_STATES = D2_R9_VALIDATION_STATES;
export const D5_R9_CANONICAL_SUBJECT_KINDS = D2_R9_SUBJECT_KINDS;
export const D5_R9_SUBJECT_KINDS = [...D2_R9_SUBJECT_KINDS, "LINE", "CONDITION", "SPECIFICATION", "COMPONENT", "CONNECTION", "ROUTE", "EVIDENCE"] as const;
export const D5_R9_REVIEW_TYPES = ["PIPING_SUBJECT_REVIEW", "INTERFACE_HANDOFF_REVIEW"] as const;
export const D5_R9_FINDING_CATEGORIES = D3_R9_FINDING_CATEGORIES;
export const D5_R9_BASIS_KINDS = ["R3_CONDITION", "R3_SPECIFICATION", "R4_COMPONENT", "R5_ROUTE", "R6_EVIDENCE", "R7_DECISION", "R7_REASSESSMENT", "R8_HANDOFF"] as const;
export const D5_R9_REVIEW_AI_BOUNDARY_REUSED = PRE_ISSUE_AI_BOUNDARY;
export const UNAUTHORIZED_D5_R10_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_REVIEWER_AUTHORITY_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_COUNTERPART_VALIDATION = false as const;
export const UNAUTHORIZED_ENGINEERING_MUTATION = false as const;
export const D5_R10_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[9];
export const D5_R10_PHASE_TYPE = D5_IMPLEMENTATION_PHASE_TYPES[9];
export const D5_R10_CANONICAL_SCOPE =
  "Implement D5 Piping currentness and digital-thread integration across exact R1-R9 revisions using canonical EOS currentness, digital-thread and fingerprint mechanisms. Preserve explicit lineage, supersession, change/reassessment state, interface currentness and review/validation currentness. Do not create parallel currentness/thread/fingerprint mechanisms, infer lineage, auto-repoint historical references, recalculate/redesign engineering, perform cross-discipline reasoning or start R11-R12/D6-D9 runtime." as const;
export const D5_R10_STARTED = false as const;
export const D5_R9_READY_FOR_NEXT_PHASE = true as const;
export const D5_R9_NEXT_PHASE = D5_R10_CANONICAL_PHASE;
export const D5_R9_NEXT_PHASE_TYPE = D5_R10_PHASE_TYPE;
export const D5_R9_CANONICAL_NEXT_PHASE = D5_R10_CANONICAL_PHASE;
export const D5_R9_CANONICAL_NEXT_PHASE_SCOPE = D5_R10_CANONICAL_SCOPE;
export const D5_R9_BLOCKER = "NONE" as const;
export const D5_R9_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  AI_EQUALS_D5_PIPING_ENGINEERING_REVIEWER_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_REVIEWER_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D5_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  D5_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_VALVE_SIZING_RUNTIME_COUNT,
  D5_COMPONENT_SIZING_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_AUTOMATIC_ROUTING_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_GEOMETRY_SOLVER_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY,
  D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_READY,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D5_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  D6_RUNTIME_STARTED,
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
  UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const BROAD = new Set(["all", "global", "every", "unspecified", "any"]);
const INFERRED = new Set(["matching_tag", "shared_vendor", "shared_package", "system_membership", "proximity", "document_cooccurrence", "similar_value", "ai_similarity", "inferred", "ai_inference"]);
const FORBIDDEN_VERDICTS = new Set<string>(FORBIDDEN_PRE_ISSUE_VERDICTS);
type Currentness = (typeof D5_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D5_R9_SUBJECT_KINDS)[number];
type BasisKind = (typeof D5_R9_BASIS_KINDS)[number];
type R6Kind = "STRESS" | "SUPPORT" | "INSPECTION" | "NDE" | "TEST";
type R7Kind = "REQUIREMENT" | "ASSUMPTION" | "DECISION" | "CHANGE";

type Prohibited = {
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  automaticValidation?: boolean;
  validated?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateR7?: boolean;
  mutateR8?: boolean;
  invalidateEngineering?: boolean;
  redesignEngineering?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  repoint?: boolean;
  validateD1?: boolean;
  validateD2?: boolean;
  validateD3?: boolean;
  validateD4?: boolean;
  validateFuture?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  d6Start?: boolean;
  d9Reasoning?: boolean;
  reviewCompleted?: boolean;
  reassessmentCompleted?: boolean;
  closeReassessmentAsValidated?: boolean;
};

export type D5R9Actor = D5R1Actor & {
  actorKind?: string;
  aal?: string | null;
  amr?: Array<string | { method?: string }> | null;
};

export type D5R9BasisInput = { kind: string; id: string; fingerprint: string };
export type D5R9Basis = { kind: BasisKind; id: string; fingerprint: string };

type ChainInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  conditionId: string;
  conditionRevisionFingerprint: string;
  specificationId: string;
  specificationFingerprint: string;
  componentRecordId: string;
  componentRevisionFingerprint: string;
  connectionRecordId: string;
  connectionRevisionFingerprint: string;
  routeRecordId: string;
  routeRevisionFingerprint: string;
  r6SubjectKind: string;
  r6SubjectId: string;
  r6RevisionFingerprint: string;
  r7SubjectKind: string;
  r7SubjectId: string;
  r7RevisionFingerprint: string;
  r8HandoffId: string;
  r8RevisionFingerprint: string;
  subjectKind: string;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
};

export type D5R9SubjectPin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  conditionId: string;
  conditionRevisionFingerprint: string;
  specificationId: string;
  specificationFingerprint: string;
  componentRecordId: string;
  componentRevisionFingerprint: string;
  connectionRecordId: string;
  connectionRevisionFingerprint: string;
  routeRecordId: string;
  routeRevisionFingerprint: string;
  r6SubjectKind: R6Kind;
  r6SubjectId: string;
  r6RevisionFingerprint: string;
  r7SubjectKind: R7Kind;
  r7SubjectId: string;
  r7RevisionFingerprint: string;
  r8HandoffId: string;
  r8RevisionFingerprint: string;
  subjectRecordStatus: "CURRENT" | "SUPERSEDED";
  subjectCurrentness: Currentness;
};

type GovernedBase = D5R9SubjectPin & {
  applicability: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: Currentness;
  currentness: Currentness;
  citedLifecycleStage: (typeof D5_MATURITY_STATES)[number];
  fingerprint: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  deleted: false;
  invalidated: false;
  conformant: false;
  engineeringApproved: false;
  certified: false;
  d1Validated: false;
  d2Validated: false;
  d3Validated: false;
  d4Validated: false;
  futureDisciplineValidated: false;
  recalculated: false;
  redesigned: false;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  createdAt: string;
  createdBy: string;
};

export type D5R9ReviewRequestRecord = GovernedBase & {
  reviewRequestId: string;
  reviewType: (typeof D5_R9_REVIEW_TYPES)[number];
  reviewScope: string;
  requestStatus: (typeof D5_R9_REQUEST_STATUSES)[number];
  requestedReviewerAuthority: "REVIEWER";
  requesterId: string;
  reviewCompleted: false;
  engineeringValidated: false;
  predecessorReviewRequestId: string | null;
  predecessorFingerprint: string | null;
};

export type D5R9FindingRecord = GovernedBase & {
  findingId: string;
  reviewRequestId: string;
  findingCategory: (typeof D5_R9_FINDING_CATEGORIES)[number];
  severity: (typeof PRE_ISSUE_MATERIALITY)[number];
  findingText: string;
  disposition: (typeof D5_R9_FINDING_DISPOSITIONS)[number];
  changeId: string | null;
  changeFingerprint: string | null;
  reassessmentId: string | null;
  reassessmentFingerprint: string | null;
  engineeringInvalid: false;
  engineeringValidated: false;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  authoritativeReview: true;
  aiReview: false;
};

export type D5R9CompletionRecord = GovernedBase & {
  completionId: string;
  reviewRequestId: string;
  reviewCompleted: true;
  engineeringValidated: false;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  predecessorCompletionId: string | null;
  predecessorFingerprint: string | null;
};

export type D5R9ValidationRecord = GovernedBase & {
  validationId: string;
  reviewRequestId: string | null;
  validationScope: string;
  basis: readonly D5R9Basis[];
  validationState: (typeof D5_R9_VALIDATION_STATES)[number];
  changeId: string | null;
  changeFingerprint: string | null;
  reassessmentId: string | null;
  reassessmentFingerprint: string | null;
  engineeringValidated: boolean;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  predecessorValidationId: string | null;
  predecessorFingerprint: string | null;
};

export type D5R9History = {
  historyId: string;
  subjectKind: "REVIEW_REQUEST" | "FINDING" | "COMPLETION" | "VALIDATION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D5R9Store = {
  r8: D5R8Store;
  now: () => string;
  requests: D5R9ReviewRequestRecord[];
  findings: D5R9FindingRecord[];
  completions: D5R9CompletionRecord[];
  validations: D5R9ValidationRecord[];
  history: D5R9History[];
};

function fail(code: string): never {
  throw new Error(`D5_R9_${code}`);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase())) fail(code);
  return token;
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function isCurrentness(value: string): value is Currentness {
  return (D5_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function maturityOf(value: string): (typeof D5_MATURITY_STATES)[number] {
  const token = value.trim();
  if (!(D5_MATURITY_STATES as readonly string[]).includes(token)) fail("LIFECYCLE_INVALID");
  return token as (typeof D5_MATURITY_STATES)[number];
}

function guardText(value: string, code: string): string {
  const token = explicit(value, code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function assertProhibited(input: Prohibited): void {
  if (input.approve === true) fail("APPROVAL_NOT_IN_R9");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R9");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R9");
  if (input.automaticValidation === true || input.validated === true) fail("AUTOMATIC_VALIDATION_REJECTED");
  if (input.reassessmentCompleted === true || input.closeReassessmentAsValidated === true) fail("REASSESSMENT_NOT_VALIDATION");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR4 === true) fail("R4_MUTATION_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.mutateR6 === true) fail("R6_MUTATION_REJECTED");
  if (input.mutateR7 === true) fail("R7_MUTATION_REJECTED");
  if (input.mutateR8 === true) fail("R8_MUTATION_REJECTED");
  if (input.invalidateEngineering === true) fail("FINDING_INVALIDATION_REJECTED");
  if (input.redesignEngineering === true || input.redesign === true) fail("REDESIGN_NOT_IN_R9");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.validateD1 === true) fail("D1_VALIDATION_REJECTED");
  if (input.validateD2 === true) fail("D2_VALIDATION_REJECTED");
  if (input.validateD3 === true) fail("D3_VALIDATION_REJECTED");
  if (input.validateD4 === true) fail("D4_VALIDATION_REJECTED");
  if (input.validateFuture === true) fail("FUTURE_DISCIPLINE_VALIDATION_REJECTED");
  if (input.recalculate === true) fail("CALCULATION_NOT_IN_R9");
  if (input.d6Start === true) fail("FUTURE_DISCIPLINE_RUNTIME_REJECTED");
  if (input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R9");
  if (input.reviewCompleted === true) fail("REVIEW_REQUEST_NOT_COMPLETION");
}

function sameScope(row: { tenantId: string; workspaceId: string; projectId: string }, actor: D5R9Actor): boolean {
  return row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId;
}

function assertScope(actor: D5R9Actor, input: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (explicit(input.tenantId, "SCOPE_REQUIRED") !== actor.tenantId || explicit(input.workspaceId, "SCOPE_REQUIRED") !== actor.workspaceId || explicit(input.projectId, "SCOPE_REQUIRED") !== actor.projectId) {
    fail("SCOPE_MISMATCH");
  }
}

function assertRecorder(actor: D5R9Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_PIPING_AUTHORITY");
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") fail("ADMIN_NOT_PIPING_AUTHORITY");
  if (actor.authority === "PIPING_ENGINEERING_AUTHORITY" || actor.authority === "REVIEWER") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
  assertHumanApprovalActor(actor.actorKind ?? "human", actor.actorId);
}

function assertReviewer(actor: D5R9Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_PIPING_REVIEWER");
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") fail("ADMIN_NOT_PIPING_REVIEWER");
  if (actor.authority !== "REVIEWER") fail("REVIEWER_AUTHORITY_REQUIRED");
  if (actor.actorKind !== "human") fail("REVIEWER_AUTHORITY_REQUIRED");
  assertHumanApprovalActor(actor.actorKind, actor.actorId);
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function r6Row(store: D5R8Store, kind: R6Kind, id: string) {
  if (kind === "STRESS") return store.r7.r6.stressEvidence.find((row) => row.evidenceRecordId === id);
  if (kind === "SUPPORT") return store.r7.r6.supports.find((row) => row.supportRecordId === id);
  if (kind === "INSPECTION") return store.r7.r6.inspections.find((row) => row.inspectionRecordId === id);
  if (kind === "NDE") return store.r7.r6.nde.find((row) => row.ndeRecordId === id);
  return store.r7.r6.tests.find((row) => row.testRecordId === id);
}

function seal(store: D5R9Store): string {
  const r3 = store.r8.r7.r6.r5.r4.r3;
  const conditions = r3.conditions.map((row) => `${row.conditionId}:${row.fingerprint}:${row.designPressure.value}:${row.currentness}`).join("|");
  const specifications = r3.specifications.map((row) => `${row.specificationId}:${row.fingerprint}:${row.pipingClass}:${row.currentness}`).join("|");
  const components = store.r8.r7.r6.r5.r4.components.map((row) => `${row.componentRecordId}:${row.fingerprint}:${row.componentClassification}:${row.currentness}`).join("|");
  const routes = store.r8.r7.r6.r5.routes.map((row) => `${row.routeRecordId}:${row.fingerprint}:${row.currentness}`).join("|");
  const support = store.r8.r7.r6.supports.map((row) => `${row.supportRecordId}:${row.fingerprint}:${row.supportFunction}`).join("|");
  const changes = store.r8.r7.changes.map((row) => `${row.changeId}:${row.fingerprint}:${row.recalculated}:${row.redesigned}`).join("|");
  const reassessments = store.r8.r7.reassessments.map((row) => `${row.reassessmentId}:${row.fingerprint}:${row.state}:${row.engineeringValidated}`).join("|");
  const handoffs = store.r8.handoffs.map((row) => `${row.handoffId}:${row.fingerprint}:${row.recordStatus}:${row.engineeringValidated}`).join("|");
  return [conditions, specifications, components, routes, support, changes, reassessments, handoffs].join("#");
}

function matches(row: { fingerprint: string; provenanceRef: string; recordStatus: "CURRENT" | "SUPERSEDED"; currentness: Currentness } | undefined, id: string, fingerprint: string, revision: string) {
  return row != null && row.fingerprint === fingerprint && row.provenanceRef === revision ? row : null;
}

function bind(store: D5R9Store, actor: D5R9Actor, input: ChainInput, cited: Currentness): D5R9SubjectPin {
  const context = store.r8.r7.r6.r5.r4.r1.contexts.find((row) => row.contextId === explicit(input.contextId, "R1_CONTEXT_REQUIRED"));
  if (!context || !sameScope(context, actor)) fail("R1_CONTEXT_NOT_FOUND");
  const object = store.r8.r7.r6.r5.r4.r1.objects.find((row) => row.objectId === explicit(input.objectId, "R1_OBJECT_REQUIRED"));
  if (!object || object.fingerprint !== explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED") || !sameScope(object, actor)) fail("R1_REVISION_MISMATCH");
  const line = store.r8.r7.r6.r5.r4.r2.lines.find((row) => row.lineRecordId === explicit(input.lineRecordId, "R2_LINE_REQUIRED"));
  if (!line || line.fingerprint !== explicit(input.lineContextFingerprint, "R2_REVISION_REQUIRED") || line.tenantId !== actor.tenantId) fail("R2_REVISION_MISMATCH");
  const condition = store.r8.r7.r6.r5.r4.r3.conditions.find((row) => row.conditionId === explicit(input.conditionId, "R3_CONDITION_REQUIRED"));
  if (!condition || condition.fingerprint !== explicit(input.conditionRevisionFingerprint, "R3_REVISION_REQUIRED") || condition.tenantId !== actor.tenantId) fail("R3_REVISION_MISMATCH");
  const specification = store.r8.r7.r6.r5.r4.r3.specifications.find((row) => row.specificationId === explicit(input.specificationId, "R3_SPECIFICATION_REQUIRED"));
  if (!specification || specification.fingerprint !== explicit(input.specificationFingerprint, "R3_SPECIFICATION_REVISION_REQUIRED") || specification.tenantId !== actor.tenantId) fail("R3_SPECIFICATION_REVISION_MISMATCH");
  const component = store.r8.r7.r6.r5.r4.components.find((row) => row.componentRecordId === explicit(input.componentRecordId, "R4_COMPONENT_REQUIRED"));
  if (!component || component.fingerprint !== explicit(input.componentRevisionFingerprint, "R4_REVISION_REQUIRED") || component.tenantId !== actor.tenantId) fail("R4_REVISION_MISMATCH");
  const connection = store.r8.r7.r6.r5.r4.connections.find((row) => row.connectionRecordId === explicit(input.connectionRecordId, "R4_CONNECTION_REQUIRED"));
  if (!connection || connection.fingerprint !== explicit(input.connectionRevisionFingerprint, "R4_CONNECTION_REVISION_REQUIRED")) fail("R4_CONNECTION_REVISION_MISMATCH");
  const route = store.r8.r7.r6.r5.routes.find((row) => row.routeRecordId === explicit(input.routeRecordId, "R5_ROUTE_REQUIRED"));
  if (!route || route.fingerprint !== explicit(input.routeRevisionFingerprint, "R5_REVISION_REQUIRED") || route.tenantId !== actor.tenantId) fail("R5_REVISION_MISMATCH");
  const r6Kind = explicit(input.r6SubjectKind, "R6_SUBJECT_REQUIRED");
  if (!["STRESS", "SUPPORT", "INSPECTION", "NDE", "TEST"].includes(r6Kind)) fail("R6_SUBJECT_INVALID");
  const r6 = r6Row(store.r8, r6Kind as R6Kind, explicit(input.r6SubjectId, "R6_SUBJECT_REQUIRED"));
  if (!r6 || r6.fingerprint !== explicit(input.r6RevisionFingerprint, "R6_REVISION_REQUIRED") || r6.objectId !== object.objectId || r6.tenantId !== actor.tenantId) fail("R6_REVISION_MISMATCH");
  const r7Kind = explicit(input.r7SubjectKind, "R7_SUBJECT_REQUIRED");
  if (!["REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE"].includes(r7Kind)) fail("R7_SUBJECT_INVALID");
  const r7Id = explicit(input.r7SubjectId, "R7_SUBJECT_REQUIRED");
  const r7 =
    r7Kind === "REQUIREMENT" ? store.r8.r7.requirements.find((row) => row.requirementId === r7Id)
    : r7Kind === "ASSUMPTION" ? store.r8.r7.assumptions.find((row) => row.assumptionId === r7Id)
    : r7Kind === "DECISION" ? store.r8.r7.decisions.find((row) => row.decisionId === r7Id)
    : store.r8.r7.changes.find((row) => row.changeId === r7Id);
  if (!r7 || r7.fingerprint !== explicit(input.r7RevisionFingerprint, "R7_REVISION_REQUIRED") || r7.objectId !== object.objectId || r7.tenantId !== actor.tenantId) fail("R7_REVISION_MISMATCH");
  const handoff = store.r8.handoffs.find((row) => row.handoffId === explicit(input.r8HandoffId, "R8_HANDOFF_REQUIRED"));
  if (!handoff || handoff.fingerprint !== explicit(input.r8RevisionFingerprint, "R8_REVISION_REQUIRED") || handoff.objectId !== object.objectId || !sameScope(handoff, actor)) fail("R8_REVISION_MISMATCH");
  const kind = explicit(input.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D5_R9_SUBJECT_KINDS as readonly string[]).includes(kind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(input.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(input.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const located =
    kind === "OBJECT" ? (object.objectId === subjectId ? matches(object, subjectId, subjectFingerprint, subjectRevision) : null)
    : kind === "LINE" ? (line.lineRecordId === subjectId ? matches(line, subjectId, subjectFingerprint, subjectRevision) : null)
    : kind === "CONDITION" ? (condition.conditionId === subjectId ? matches(condition, subjectId, subjectFingerprint, subjectRevision) : null)
    : kind === "SPECIFICATION" ? (specification.specificationId === subjectId ? matches(specification, subjectId, subjectFingerprint, subjectRevision) : null)
    : kind === "COMPONENT" ? (component.componentRecordId === subjectId ? matches(component, subjectId, subjectFingerprint, subjectRevision) : null)
    : kind === "CONNECTION" ? (connection.connectionRecordId === subjectId ? matches(connection, subjectId, subjectFingerprint, subjectRevision) : null)
    : kind === "ROUTE" ? (route.routeRecordId === subjectId ? matches(route, subjectId, subjectFingerprint, subjectRevision) : null)
    : kind === "EVIDENCE" ? (explicit(input.r6SubjectId, "R6_SUBJECT_REQUIRED") === subjectId ? matches(r6, subjectId, subjectFingerprint, subjectRevision) : null)
    : kind === "REQUIREMENT" ? matches(store.r8.r7.requirements.find((row) => row.requirementId === subjectId && row.objectId === object.objectId), subjectId, subjectFingerprint, subjectRevision)
    : kind === "ASSUMPTION" ? matches(store.r8.r7.assumptions.find((row) => row.assumptionId === subjectId && row.objectId === object.objectId), subjectId, subjectFingerprint, subjectRevision)
    : kind === "DECISION" ? matches(store.r8.r7.decisions.find((row) => row.decisionId === subjectId && row.objectId === object.objectId), subjectId, subjectFingerprint, subjectRevision)
    : kind === "CHANGE" ? matches(store.r8.r7.changes.find((row) => row.changeId === subjectId && row.objectId === object.objectId), subjectId, subjectFingerprint, subjectRevision)
    : kind === "HANDOFF" ? (handoff.handoffId === subjectId ? matches(handoff, subjectId, subjectFingerprint, subjectRevision) : null)
    : null;
  if (!located) fail("SUBJECT_REVISION_MISMATCH");
  if (cited === "CURRENT" && located.recordStatus !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  if (cited === "CURRENT" && [context, object, line, condition, specification, component, connection, route, r6, r7, handoff].some((row) => row.recordStatus !== "CURRENT")) fail("SOURCE_NOT_CURRENT");
  return {
    subjectKind: kind as SubjectKind, subjectId, subjectRevision, subjectFingerprint, contextId: context.contextId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint,
    lineRecordId: line.lineRecordId, lineContextFingerprint: line.fingerprint, conditionId: condition.conditionId, conditionRevisionFingerprint: condition.fingerprint,
    specificationId: specification.specificationId, specificationFingerprint: specification.fingerprint, componentRecordId: component.componentRecordId, componentRevisionFingerprint: component.fingerprint,
    connectionRecordId: connection.connectionRecordId, connectionRevisionFingerprint: connection.fingerprint, routeRecordId: route.routeRecordId, routeRevisionFingerprint: route.fingerprint,
    r6SubjectKind: r6Kind as R6Kind, r6SubjectId: explicit(input.r6SubjectId, "R6_SUBJECT_REQUIRED"), r6RevisionFingerprint: r6.fingerprint,
    r7SubjectKind: r7Kind as R7Kind, r7SubjectId: r7Id, r7RevisionFingerprint: r7.fingerprint, r8HandoffId: handoff.handoffId, r8RevisionFingerprint: handoff.fingerprint,
    subjectRecordStatus: located.recordStatus, subjectCurrentness: located.currentness,
  };
}

function samePin(left: D5R9SubjectPin, right: D5R9SubjectPin): boolean {
  return left.subjectKind === right.subjectKind && left.subjectId === right.subjectId && left.subjectFingerprint === right.subjectFingerprint && left.objectRevisionFingerprint === right.objectRevisionFingerprint && left.r8RevisionFingerprint === right.r8RevisionFingerprint;
}

function resolveBasis(store: D5R9Store, actor: D5R9Actor, pin: D5R9SubjectPin, items: readonly D5R9BasisInput[] | undefined, requireCurrent: boolean): D5R9Basis[] {
  const resolved: D5R9Basis[] = [];
  for (const item of items ?? []) {
    const kind = explicit(item.kind, "BASIS_KIND_REQUIRED");
    if (!(D5_R9_BASIS_KINDS as readonly string[]).includes(kind)) fail("BASIS_KIND_INVALID");
    const id = explicit(item.id, "BASIS_REFERENCE_REQUIRED");
    const fingerprint = explicit(item.fingerprint, "BASIS_REVISION_REQUIRED");
    const row =
      kind === "R3_CONDITION" ? store.r8.r7.r6.r5.r4.r3.conditions.find((entry) => entry.conditionId === id && entry.fingerprint === fingerprint)
      : kind === "R3_SPECIFICATION" ? store.r8.r7.r6.r5.r4.r3.specifications.find((entry) => entry.specificationId === id && entry.fingerprint === fingerprint)
      : kind === "R4_COMPONENT" ? store.r8.r7.r6.r5.r4.components.find((entry) => entry.componentRecordId === id && entry.fingerprint === fingerprint)
      : kind === "R5_ROUTE" ? store.r8.r7.r6.r5.routes.find((entry) => entry.routeRecordId === id && entry.fingerprint === fingerprint)
      : kind === "R6_EVIDENCE" ? r6Row(store.r8, pin.r6SubjectKind, id)
      : kind === "R7_DECISION" ? store.r8.r7.decisions.find((entry) => entry.decisionId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId && sameScope(entry, actor))
      : kind === "R7_REASSESSMENT" ? store.r8.r7.reassessments.find((entry) => entry.reassessmentId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId && sameScope(entry, actor))
      : store.r8.handoffs.find((entry) => entry.handoffId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId && sameScope(entry, actor));
    if (!row || row.fingerprint !== fingerprint) fail("BASIS_REVISION_MISMATCH");
    if (requireCurrent && row.recordStatus !== "CURRENT") fail("BASIS_NOT_CURRENT");
    resolved.push({ kind: kind as BasisKind, id, fingerprint: row.fingerprint });
  }
  return resolved;
}

function requireReassessment(store: D5R9Store, actor: D5R9Actor, pin: D5R9SubjectPin, changeId: string | null | undefined, changeFingerprint: string | null | undefined, reassessmentId: string | null | undefined, reassessmentFingerprint: string | null | undefined) {
  const change = store.r8.r7.changes.find((row) => row.changeId === explicit(changeId ?? "", "CHANGE_REFERENCE_REQUIRED") && row.objectId === pin.objectId && sameScope(row, actor));
  if (!change || change.fingerprint !== explicit(changeFingerprint ?? "", "CHANGE_REVISION_REQUIRED") || change.recordStatus !== "CURRENT" || change.changeCategory !== "REASSESSMENT_REQUIRED") fail("CHANGE_REVISION_MISMATCH");
  const reassessment = store.r8.r7.reassessments.find((row) => row.reassessmentId === explicit(reassessmentId ?? "", "REASSESSMENT_REFERENCE_REQUIRED") && row.objectId === pin.objectId && sameScope(row, actor));
  if (!reassessment || reassessment.fingerprint !== explicit(reassessmentFingerprint ?? "", "REASSESSMENT_REVISION_REQUIRED") || reassessment.changeId !== change.changeId || reassessment.recordStatus !== "CURRENT" || reassessment.state !== "REASSESSMENT_REQUIRED") {
    fail("REASSESSMENT_REVISION_MISMATCH");
  }
  return { changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint };
}

function remember(store: D5R9Store, subjectKind: D5R9History["subjectKind"], subjectId: string, action: D5R9History["action"], fingerprint: string): void {
  store.history.push({ historyId: `d5r9-history-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function common(store: D5R9Store, actor: D5R9Actor, applicability: string, limitations: string, provenanceRef: string, cited: Currentness, lifecycle: string, fingerprint: string): Pick<GovernedBase, "applicability" | "limitations" | "provenanceRef" | "citedCurrentness" | "currentness" | "citedLifecycleStage" | "fingerprint" | "recordStatus" | "deleted" | "invalidated" | "conformant" | "engineeringApproved" | "certified" | "d1Validated" | "d2Validated" | "d3Validated" | "d4Validated" | "futureDisciplineValidated" | "recalculated" | "redesigned" | "tenantId" | "workspaceId" | "projectId" | "createdAt" | "createdBy"> {
  return {
    applicability, limitations, provenanceRef, citedCurrentness: cited, currentness: cited, citedLifecycleStage: maturityOf(lifecycle), fingerprint,
    recordStatus: "CURRENT", deleted: false, invalidated: false, conformant: false, engineeringApproved: false, certified: false,
    d1Validated: false, d2Validated: false, d3Validated: false, d4Validated: false, futureDisciplineValidated: false, recalculated: false, redesigned: false,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, createdAt: store.now(), createdBy: actor.actorId,
  };
}

export function createD5R9Store(r8: D5R8Store, now: () => string = () => r8.now()): D5R9Store {
  return { r8, now, requests: [], findings: [], completions: [], validations: [], history: [] };
}

export function recordPipingReviewRequest(store: D5R9Store, actor: D5R9Actor, input: Prohibited & ChainInput & {
  reviewRequestId: string; reviewType: string; reviewScope: string; requestedReviewerAuthority: string; applicability: string; limitations: string; citedCurrentness: string; citedLifecycleStage: string; provenanceRef: string; assertedFingerprint?: string | null; predecessorReviewRequestId?: string | null;
}): D5R9ReviewRequestRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const reviewType = explicit(input.reviewType, "REVIEW_TYPE_REQUIRED");
  if (!(D5_R9_REVIEW_TYPES as readonly string[]).includes(reviewType)) fail("REVIEW_TYPE_INVALID");
  if (reviewType === "INTERFACE_HANDOFF_REVIEW" && pin.subjectKind !== "HANDOFF") fail("HANDOFF_SUBJECT_REQUIRED");
  if (explicit(input.requestedReviewerAuthority, "REVIEWER_AUTHORITY_REQUIRED") !== "REVIEWER") fail("REVIEWER_AUTHORITY_REQUIRED");
  const reviewScope = guardText(input.reviewScope, "REVIEW_SCOPE_REQUIRED");
  const applicability = guardText(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = guardText(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const predecessor = input.predecessorReviewRequestId ? store.requests.find((row) => row.reviewRequestId === explicit(input.predecessorReviewRequestId ?? "", "REVIEW_REQUEST_REQUIRED")) : null;
  if (input.predecessorReviewRequestId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("REVIEW_REQUEST_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor && cited !== "STALE" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const fingerprint = fingerprintCanonical({ reviewRequestId, ...pin, reviewType, reviewScope, requestedReviewerAuthority: "REVIEWER", applicability, limitations, cited, provenanceRef, predecessorReviewRequestId: predecessor?.reviewRequestId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requests.find((row) => row.reviewRequestId === reviewRequestId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("REVIEW_REQUEST_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${reviewType}`;
  if (store.requests.some((row) => row.recordStatus === "CURRENT" && row.reviewRequestId !== predecessor?.reviewRequestId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.reviewType}` === signature)) fail("DUPLICATE_REVIEW_REQUEST_REJECTED");
  const record: D5R9ReviewRequestRecord = {
    ...pin, ...common(store, actor, applicability, limitations, provenanceRef, cited, input.citedLifecycleStage, fingerprint),
    reviewRequestId, reviewType: reviewType as D5R9ReviewRequestRecord["reviewType"], reviewScope, requestStatus: "REQUESTED", requestedReviewerAuthority: "REVIEWER", requesterId: actor.actorId, reviewCompleted: false, engineeringValidated: false, predecessorReviewRequestId: predecessor?.reviewRequestId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
    remember(store, "REVIEW_REQUEST", predecessor.reviewRequestId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.requests.push(record);
  remember(store, "REVIEW_REQUEST", record.reviewRequestId, "CREATED", record.fingerprint);
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordPipingReviewFinding(store: D5R9Store, actor: D5R9Actor, input: Prohibited & ChainInput & {
  findingId: string; reviewRequestId: string; findingCategory: string; severity: string; findingText: string; disposition: string; changeId?: string | null; changeFingerprint?: string | null; reassessmentId?: string | null; reassessmentFingerprint?: string | null; applicability: string; limitations: string; citedCurrentness: string; citedLifecycleStage: string; provenanceRef: string; assertedFingerprint?: string | null;
}): D5R9FindingRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const request = store.requests.find((row) => row.reviewRequestId === explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") && row.recordStatus === "CURRENT");
  if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
  const findingCategory = explicit(input.findingCategory, "FINDING_CATEGORY_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(findingCategory) || !(D5_R9_FINDING_CATEGORIES as readonly string[]).includes(findingCategory)) fail("FINDING_CATEGORY_INVALID");
  const severity = explicit(input.severity, "FINDING_SEVERITY_REQUIRED");
  if (!(PRE_ISSUE_MATERIALITY as readonly string[]).includes(severity)) fail("FINDING_SEVERITY_INVALID");
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(disposition) || !(D5_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory === "REASSESSMENT_RECOMMENDATION" && disposition !== "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory !== "REASSESSMENT_RECOMMENDATION" && disposition === "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  const linked = disposition === "REASSESSMENT_REQUESTED" ? requireReassessment(store, actor, pin, input.changeId, input.changeFingerprint, input.reassessmentId, input.reassessmentFingerprint) : null;
  if (!linked && (input.changeId || input.changeFingerprint || input.reassessmentId || input.reassessmentFingerprint)) fail("CHANGE_REFERENCE_UNEXPECTED");
  const findingText = guardText(input.findingText, "FINDING_TEXT_REQUIRED");
  const applicability = guardText(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = guardText(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const findingId = explicit(input.findingId, "FINDING_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ findingId, reviewRequestId: request.reviewRequestId, ...pin, findingCategory, severity, findingText, disposition, linked, applicability, limitations, cited, provenanceRef, reviewerId: actor.actorId });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.findings.find((row) => row.findingId === findingId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINDING_ALREADY_RECORDED");
  const signature = `${request.reviewRequestId}|${pin.subjectId}|${pin.subjectFingerprint}|${findingCategory}|${findingText}`;
  if (store.findings.some((row) => `${row.reviewRequestId}|${row.subjectId}|${row.subjectFingerprint}|${row.findingCategory}|${row.findingText}` === signature)) fail("DUPLICATE_FINDING_REJECTED");
  const record: D5R9FindingRecord = {
    ...pin, ...common(store, actor, applicability, limitations, provenanceRef, cited, input.citedLifecycleStage, fingerprint),
    findingId, reviewRequestId: request.reviewRequestId, findingCategory: findingCategory as D5R9FindingRecord["findingCategory"], severity: severity as D5R9FindingRecord["severity"], findingText, disposition: disposition as D5R9FindingRecord["disposition"],
    changeId: linked?.changeId ?? null, changeFingerprint: linked?.changeFingerprint ?? null, reassessmentId: linked?.reassessmentId ?? null, reassessmentFingerprint: linked?.reassessmentFingerprint ?? null,
    engineeringInvalid: false, engineeringValidated: false, reviewerId: actor.actorId, reviewerAuthority: "REVIEWER", authoritativeReview: true, aiReview: false,
  };
  store.findings.push(record);
  remember(store, "FINDING", record.findingId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordPipingReviewCompletion(store: D5R9Store, actor: D5R9Actor, input: Prohibited & ChainInput & {
  completionId: string; reviewRequestId: string; applicability: string; limitations: string; citedCurrentness: string; citedLifecycleStage: string; provenanceRef: string; assertedFingerprint?: string | null; predecessorCompletionId?: string | null;
}): D5R9CompletionRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const request = store.requests.find((row) => row.reviewRequestId === explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") && row.recordStatus === "CURRENT");
  if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
  const applicability = guardText(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = guardText(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const completionId = explicit(input.completionId, "COMPLETION_ID_REQUIRED");
  const predecessor = input.predecessorCompletionId ? store.completions.find((row) => row.completionId === explicit(input.predecessorCompletionId ?? "", "COMPLETION_ID_REQUIRED")) : null;
  if (input.predecessorCompletionId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("COMPLETION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor && cited !== "STALE" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const fingerprint = fingerprintCanonical({ completionId, reviewRequestId: request.reviewRequestId, ...pin, applicability, limitations, cited, provenanceRef, reviewerId: actor.actorId, predecessorCompletionId: predecessor?.completionId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.completions.find((row) => row.completionId === completionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("COMPLETION_ALREADY_RECORDED");
  const signature = `${request.reviewRequestId}|${pin.subjectId}|${pin.subjectFingerprint}`;
  if (store.completions.some((row) => row.recordStatus === "CURRENT" && row.completionId !== predecessor?.completionId && `${row.reviewRequestId}|${row.subjectId}|${row.subjectFingerprint}` === signature)) fail("DUPLICATE_COMPLETION_REJECTED");
  const record: D5R9CompletionRecord = {
    ...pin, ...common(store, actor, applicability, limitations, provenanceRef, cited, input.citedLifecycleStage, fingerprint),
    completionId, reviewRequestId: request.reviewRequestId, reviewCompleted: true, engineeringValidated: false, reviewerId: actor.actorId, reviewerAuthority: "REVIEWER", predecessorCompletionId: predecessor?.completionId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
    remember(store, "COMPLETION", predecessor.completionId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.completions.push(record);
  remember(store, "COMPLETION", record.completionId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordPipingValidationState(store: D5R9Store, actor: D5R9Actor, input: Prohibited & ChainInput & {
  validationId: string; reviewRequestId?: string | null; validationScope: string; basis?: readonly D5R9BasisInput[]; validationState: string; changeId?: string | null; changeFingerprint?: string | null; reassessmentId?: string | null; reassessmentFingerprint?: string | null; applicability: string; limitations: string; citedCurrentness: string; citedLifecycleStage: string; provenanceRef: string; assertedFingerprint?: string | null; predecessorValidationId?: string | null;
}): D5R9ValidationRecord {
  if ((blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") && (input.validationState === "VALIDATED" || input.automaticValidation === true)) fail("AI_CANNOT_VALIDATE");
  if ((actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") && (input.validationState === "VALIDATED" || input.automaticValidation === true)) fail("ADMIN_CANNOT_VALIDATE");
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const validationState = explicit(input.validationState, "VALIDATION_STATE_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(validationState) || !(D5_R9_VALIDATION_STATES as readonly string[]).includes(validationState)) fail("VALIDATION_STATE_INVALID");
  if (validationState === "STALE" && cited !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "REASSESSMENT_REQUIRED" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && cited !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && (pin.subjectCurrentness === "REASSESSMENT_REQUIRED" || pin.subjectCurrentness === "STALE" || pin.subjectCurrentness === "SUPERSEDED" || pin.subjectRecordStatus !== "CURRENT")) fail("REASSESSMENT_NOT_VALIDATED");
  if (validationState === "VALIDATED" && (input.changeId || input.reassessmentId)) fail("REASSESSMENT_NOT_VALIDATION");
  const basis = resolveBasis(store, actor, pin, input.basis, validationState === "VALIDATED");
  if (validationState === "VALIDATED" && basis.length === 0) fail("BASIS_REQUIRED");
  const linked = validationState === "REASSESSMENT_REQUIRED" ? requireReassessment(store, actor, pin, input.changeId, input.changeFingerprint, input.reassessmentId, input.reassessmentFingerprint) : null;
  if (!linked && (input.changeId || input.changeFingerprint || input.reassessmentId || input.reassessmentFingerprint)) fail("CHANGE_REFERENCE_UNEXPECTED");
  const validationScope = guardText(input.validationScope, "VALIDATION_SCOPE_REQUIRED");
  const applicability = guardText(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = guardText(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const validationId = explicit(input.validationId, "VALIDATION_ID_REQUIRED");
  const reviewRequestId = input.reviewRequestId ? explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") : null;
  if (reviewRequestId) {
    const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
    if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
  }
  const predecessor = input.predecessorValidationId ? store.validations.find((row) => row.validationId === explicit(input.predecessorValidationId ?? "", "VALIDATION_ID_REQUIRED")) : null;
  if (input.predecessorValidationId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("VALIDATION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("VALIDATION_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor && cited !== "STALE" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const engineeringValidated = validationState === "VALIDATED";
  const fingerprint = fingerprintCanonical({ validationId, reviewRequestId, ...pin, validationScope, basis, validationState, linked, engineeringValidated, applicability, limitations, cited, provenanceRef, reviewerId: actor.actorId, predecessorValidationId: predecessor?.validationId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.validations.find((row) => row.validationId === validationId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("VALIDATION_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${validationScope}|${validationState}`;
  if (store.validations.some((row) => row.recordStatus === "CURRENT" && row.validationId !== predecessor?.validationId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.validationScope}|${row.validationState}` === signature)) fail("DUPLICATE_VALIDATION_REJECTED");
  const record: D5R9ValidationRecord = {
    ...pin, ...common(store, actor, applicability, limitations, provenanceRef, cited, input.citedLifecycleStage, fingerprint),
    validationId, reviewRequestId, validationScope, basis, validationState: validationState as D5R9ValidationRecord["validationState"],
    changeId: linked?.changeId ?? null, changeFingerprint: linked?.changeFingerprint ?? null, reassessmentId: linked?.reassessmentId ?? null, reassessmentFingerprint: linked?.reassessmentFingerprint ?? null,
    engineeringValidated, reviewerId: actor.actorId, reviewerAuthority: "REVIEWER", predecessorValidationId: predecessor?.validationId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
    remember(store, "VALIDATION", predecessor.validationId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.validations.push(record);
  remember(store, "VALIDATION", record.validationId, "CREATED", record.fingerprint);
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  if (record.currentness === "STALE" && record.recordStatus === "CURRENT" && validationState === "VALIDATED") fail("STALE_EXPOSED_AS_CURRENT");
  if (record.currentness === "SUPERSEDED" && validationState === "VALIDATED") fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  return record;
}

export function repointPipingReview(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function transferPipingValidation(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}
export function mutatePipingConditionFromReview(): never {
  return fail("R3_MUTATION_REJECTED");
}
export function mutatePipingSpecificationFromReview(): never {
  return fail("R3_MUTATION_REJECTED");
}
export function mutatePipingComponentFromReview(): never {
  return fail("R4_MUTATION_REJECTED");
}
export function mutatePipingRouteFromReview(): never {
  return fail("R5_MUTATION_REJECTED");
}
export function mutatePipingEvidenceFromReview(): never {
  return fail("R6_MUTATION_REJECTED");
}
export function mutatePipingChangeFromReview(): never {
  return fail("R7_MUTATION_REJECTED");
}
export function mutatePipingHandoffFromReview(): never {
  return fail("R8_MUTATION_REJECTED");
}
export function validatePipingCounterpartFromReview(): never {
  return fail("D1_VALIDATION_REJECTED");
}
export function automaticallyValidatePipingEngineering(): never {
  return fail("AUTOMATIC_VALIDATION_REJECTED");
}
export function closePipingReassessmentAsValidated(): never {
  return fail("REASSESSMENT_NOT_VALIDATION");
}
export function reasonAcrossPipingReview(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R9");
}
