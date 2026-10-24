/**
 * EOS-D4-R9 — Mechanical review and validation governance.
 * One bounded runtime. Reuses canonical EOS review and validation governance
 * on exact D4 R1-R8 revisions. Review, validation, conformance, approval,
 * and certification stay separate. AI and admin are not reviewer authority.
 */
import {
  D4_AUTHORITY_ROLES,
  D4_CURRENTNESS_STATES,
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D4_FINGERPRINT_ALGORITHM,
  D4_IMPLEMENTATION_PHASES,
  D4_MATURITY_STATES,
  D4_SILENT_REPOINTING_ALLOWED,
  D4_VALIDATED_EQUALS_APPROVED,
  D4_VALIDATED_EQUALS_CERTIFIED,
  D4_VALIDATED_EQUALS_CONFORMANT,
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
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { FORBIDDEN_PRE_ISSUE_VERDICTS, PRE_ISSUE_AI_BOUNDARY, PRE_ISSUE_MATERIALITY } from "../pre-issue-review/types";
import { resolveAuthAssuranceLevel } from "../security-closure/privileged-mfa";
import { D3_R9_FINDING_CATEGORIES } from "../geotechnical/review-validation-governance";
import { D4_CONTEXT_AUTHORITY, D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY, type D4R1Actor } from "./identity-foundation";
import { D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY } from "./equipment-system-context";
import { D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY } from "./design-condition-performance-context";
import { D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY } from "./vendor-data-evidence-context";
import { D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY } from "./mechanical-technical-context";
import { D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY, type D4R6UpstreamKind } from "./maintainability-access-package-context";
import { D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_CHANGE_READY } from "./requirements-assumptions-change";
import { D4_DISCIPLINE_INTERFACE_RUNTIME_READY as R8_INTERFACE_READY, type D4R8Store } from "./discipline-interfaces-handoffs";

export const D4_R9_STATUS = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D4_R9_MATURITY = D4_R9_STATUS;
export const D4_R9_MATURITY_STATE = D4_R9_STATUS;
export const D4_R9_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D4_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md" as const;
export const D4_REUSES_CANONICAL_REVIEW_GOVERNANCE = true as const;
export const D4_REUSES_CANONICAL_VALIDATION_GOVERNANCE = true as const;
export const PARALLEL_D4_REVIEW_ENGINE_CREATED = false as const;
export const PARALLEL_D4_VALIDATION_ENGINE_CREATED = false as const;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 9 as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED = true as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = true as const;
export const D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY_REUSED = D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY_REUSED = D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY_REUSED = D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY_REUSED = D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED = D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_CHANGE_READY;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = R8_INTERFACE_READY;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D4_R1_R8_EXACT_SUBJECT_REVISIONS_REUSED = true as const;
export const EXACT_D4_REVIEW_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D4_REVIEW_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D4_REVIEW_SUBJECT_AUTO_REPOINTED = D4_SILENT_REPOINTING_ALLOWED;
export const D4_REVIEW_REQUEST_GOVERNANCE_IMPLEMENTED = true as const;
export const REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED = CANONICAL_REQUEST_EQUALS_COMPLETED;
export const REVIEW_REQUESTED_EQUALS_VALIDATED = CANONICAL_REQUEST_EQUALS_VALIDATED;
export const D4_REVIEWER_AUTHORITY_REQUIRED = true as const;
export const D4_REVIEWER_AUTHORITY_EXPLICIT = true as const;
export const AI_EQUALS_D4_ENGINEERING_REVIEWER_AUTHORITY = false as const;
export const ADMIN_EQUALS_D4_ENGINEERING_REVIEWER_AUTHORITY = false as const;
export const AI_REVIEW_OUTPUT_EQUALS_ENGINEERING_REVIEW = PRE_ISSUE_AI_BOUNDARY.mayCreateFormalFindingAutomatically;
export const AI_REVIEW_OUTPUT_EQUALS_ENGINEERING_VALIDATION = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const ADMIN_REVIEW_ACTION_EQUALS_ENGINEERING_REVIEW = false as const;
export const D4_REVIEW_FINDING_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_REVIEW_FINDING_DISPOSITION_GOVERNANCE_IMPLEMENTED = true as const;
export const REVIEW_FINDING_EQUALS_ENGINEERING_INVALID = false as const;
export const REVIEW_FINDING_EQUALS_ENGINEERING_REDESIGNED = false as const;
export const FINDING_CLOSED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const FINDING_ADDRESSED_EQUALS_ENGINEERING_APPROVED = false as const;
export const D4_REVIEW_COMPLETION_GOVERNANCE_IMPLEMENTED = true as const;
export const REVIEW_COMPLETED_EQUALS_VALIDATED = CANONICAL_REVIEW_COMPLETED_EQUALS_VALIDATED;
export const REVIEW_COMPLETED_EQUALS_CONFORMANT = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const REVIEW_COMPLETED_EQUALS_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const REVIEW_COMPLETED_EQUALS_CERTIFIED = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const D4_VALIDATION_STATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_VALIDATION_BASIS_REQUIRED = true as const;
export const D4_VALIDATION_BASIS_TRACEABLE = true as const;
export const BASISLESS_D4_VALIDATION_AUTO_ACCEPTED = false as const;
export const VALIDATED_EQUALS_CONFORMANT = D4_VALIDATED_EQUALS_CONFORMANT;
export const VALIDATED_EQUALS_APPROVED = D4_VALIDATED_EQUALS_APPROVED;
export const VALIDATED_EQUALS_CERTIFIED = D4_VALIDATED_EQUALS_CERTIFIED;
export const D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const AI_CAN_AUTOMATICALLY_VALIDATE_D4_ENGINEERING = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const ADMIN_CAN_AUTOMATICALLY_VALIDATE_D4_ENGINEERING = false as const;
export const D4_R9_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D4_R9_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT = false as const;
export const D4_R9_AUTO_MUTATES_R4_VENDOR_EVIDENCE = false as const;
export const D4_R9_AUTO_MUTATES_R5_TECHNICAL_REQUIREMENT = false as const;
export const D4_R9_AUTO_MUTATES_R6_MAINTAINABILITY_CONTEXT = false as const;
export const D4_R9_AUTO_MUTATES_R8_INTERFACE_HANDOFF = false as const;
export const D4_R7_REASSESSMENT_REVIEW_INTEGRATION_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const PRIOR_D4_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const PRIOR_D4_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const D4_REVIEW_VALIDATION_HISTORY_PRESERVED = true as const;
export const D4_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D4_CURRENTNESS_ENGINE_CREATED = false as const;
export const STALE_D4_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D4_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const REASSESSMENT_REQUIRED_D4_SUBJECT_EXPOSED_AS_VALIDATED = false as const;
export const D4_R9_VALIDATES_D1_STRUCTURAL_ENGINEERING = false as const;
export const D4_R9_VALIDATES_D2_CIVIL_ENGINEERING = false as const;
export const D4_R9_VALIDATES_D3_GEOTECHNICAL_ENGINEERING = false as const;
export const D4_R9_VALIDATES_FUTURE_D5_D8_ENGINEERING = false as const;
export const D4_VALIDATION_EQUALS_CODE_CONFORMANCE = D4_VALIDATED_EQUALS_CONFORMANT;
export const D4_VALIDATION_EQUALS_PROJECT_APPROVAL = D4_VALIDATED_EQUALS_APPROVED;
export const D4_VALIDATION_EQUALS_CERTIFICATION = D4_VALIDATED_EQUALS_CERTIFIED;
export const D4_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D4_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D4_FINGERPRINT_ALGORITHM_REUSED = D4_FINGERPRINT_ALGORITHM;
export const D4_R9_PROVENANCE_REQUIRED = true as const;
export const D4_R9_PROVENANCE_PRESERVED = true as const;
export const SILENT_D4_R9_MUTATION_ALLOWED = false as const;
export const D4_R9_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R9_SCOPE_ENFORCED = true as const;
export const D4_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R9_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R9_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D4_R9_REQUEST_STATUSES = D2_R9_REQUEST_STATUSES;
export const D4_R9_FINDING_DISPOSITIONS = D2_R9_FINDING_DISPOSITIONS;
export const D4_R9_VALIDATION_STATES = D2_R9_VALIDATION_STATES;
export const D4_R9_CANONICAL_SUBJECT_KINDS = D2_R9_SUBJECT_KINDS;
export const D4_R9_SUBJECT_KINDS = [...D2_R9_SUBJECT_KINDS, "DESIGN", "EVIDENCE", "TECHNICAL", "MAINTAINABILITY"] as const;
export const D4_R9_REVIEW_TYPES = ["MECHANICAL_SUBJECT_REVIEW", "INTERFACE_HANDOFF_REVIEW"] as const;
export const D4_R9_FINDING_CATEGORIES = D3_R9_FINDING_CATEGORIES;
export const D4_R9_BASIS_KINDS = ["R3_DESIGN", "R4_VENDOR", "R5_REQUIREMENT", "R6_MAINTAINABILITY", "R7_DECISION", "R7_REASSESSMENT", "R8_HANDOFF"] as const;
export const D4_R9_AUTHORITY_ROLES_REUSED = D4_AUTHORITY_ROLES;
export const D4_R9_REVIEW_AI_BOUNDARY_REUSED = PRE_ISSUE_AI_BOUNDARY;

export {
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
};

export const D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D4_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D4_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D4_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D4_EQUIPMENT_SIZING_RUNTIME_COUNT = 0 as const;
export const D4_ROTATING_EQUIPMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_STATIC_EQUIPMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_THERMAL_MECHANICAL_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_MECHANICAL_LOAD_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D4_VIBRATION_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D4_FATIGUE_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D4_MECHANICAL_DESIGN_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D4_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT = 0 as const;
export const D4_ACCESS_PATH_SOLVER_RUNTIME_COUNT = 0 as const;
export const D4_REMOVAL_ROUTE_SOLVER_RUNTIME_COUNT = 0 as const;
export const D4_LAYOUT_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D4_AUTOMATIC_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const D1_STRUCTURAL_PACK_COMPLETE = false as const;
export const D1N_REOPENED = false as const;
export const D2_TRACK_COMPLETE = true as const;
export const D2_REOPENED = false as const;
export const D3_TRACK_COMPLETE = true as const;
export const D3_TRACK_COMPLETION_CLASSIFICATION = "COMPLETE_BOUNDED_WITH_LIMITATIONS" as const;
export const D3_REOPENED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_R10_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_REVIEWER_AUTHORITY_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_COUNTERPART_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R10_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[9];
export const D4_R10_PHASE_TYPE = "CURRENTNESS_AND_DIGITAL_THREAD" as const;
export const D4_R10_CANONICAL_SCOPE =
  "Implement dedicated D4 currentness and digital-thread runtime using canonical EOS mechanisms across exact R1-R9 Mechanical revisions. Support exact lineage, supersession/currentness propagation semantics, review/validation currentness and immutable history without inferred lineage, silent auto-repointing, engineering mutation, recalculation, redesign, cross-discipline reasoning, D9 integration or D5-D9 runtime." as const;
export const D4_R10_STARTED = false as const;
export const D4_R9_READY_FOR_NEXT_PHASE = true as const;
export const D4_R9_NEXT_PHASE = D4_R10_CANONICAL_PHASE;
export const D4_R9_NEXT_PHASE_TYPE = D4_R10_PHASE_TYPE;
export const D4_R9_CANONICAL_NEXT_PHASE = D4_R10_CANONICAL_PHASE;
export const D4_R9_CANONICAL_NEXT_PHASE_SCOPE = D4_R10_CANONICAL_SCOPE;
export const D4_R9_BLOCKER = "NONE" as const;
export const D4_R9_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const BROAD = new Set(["all", "global", "every", "unspecified", "any"]);
const INFERRED = new Set(["matching_tag", "shared_vendor", "shared_package", "system_membership", "proximity", "document_cooccurrence", "similar_value", "ai_similarity", "inferred"]);
const FORBIDDEN_VERDICTS = new Set<string>(FORBIDDEN_PRE_ISSUE_VERDICTS);

type Currentness = (typeof D4_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D4_R9_SUBJECT_KINDS)[number];
type BasisKind = (typeof D4_R9_BASIS_KINDS)[number];

type Prohibited = {
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  automaticValidation?: boolean;
  validated?: boolean;
  mutateR3?: boolean;
  mutateR3Performance?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateR8?: boolean;
  invalidateEngineering?: boolean;
  redesignEngineering?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  repoint?: boolean;
  validateD1?: boolean;
  validateD2?: boolean;
  validateD3?: boolean;
  validateFuture?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  d5Start?: boolean;
  d9Reasoning?: boolean;
  reviewCompleted?: boolean;
  reassessmentCompleted?: boolean;
  closeReassessmentAsValidated?: boolean;
};

export type D4R9Actor = D4R1Actor & {
  actorKind?: string;
  aal?: string | null;
  amr?: Array<string | { method?: string }> | null;
};

export type D4R9BasisInput = { kind: string; id: string; fingerprint: string };

export type D4R9Basis = { kind: BasisKind; id: string; fingerprint: string };

type ChainInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectKind: D4R6UpstreamKind;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  r5RecordId: string;
  r5RevisionFingerprint: string;
  r6RecordId: string;
  r6RevisionFingerprint: string;
  r8HandoffId: string;
  r8RevisionFingerprint: string;
  subjectKind: string;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
};

export type D4R9SubjectPin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2SubjectId: string;
  r2RevisionFingerprint: string;
  r3RecordId: string;
  r3RevisionFingerprint: string;
  r4RecordId: string;
  r4RevisionFingerprint: string;
  r5RecordId: string;
  r5RevisionFingerprint: string;
  r6RecordId: string;
  r6RevisionFingerprint: string;
  r8HandoffId: string;
  r8RevisionFingerprint: string;
  subjectRecordStatus: "CURRENT" | "SUPERSEDED";
  subjectCurrentness: Currentness;
};

type GovernedBase = D4R9SubjectPin & {
  applicability: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: Currentness;
  currentness: Currentness;
  citedLifecycleStage: (typeof D4_MATURITY_STATES)[number];
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
  futureDisciplineValidated: false;
  recalculated: false;
  redesigned: false;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  createdAt: string;
  createdBy: string;
};

export type D4R9ReviewRequestRecord = GovernedBase & {
  reviewRequestId: string;
  reviewType: (typeof D4_R9_REVIEW_TYPES)[number];
  reviewScope: string;
  requestStatus: (typeof D4_R9_REQUEST_STATUSES)[number];
  requestedReviewerAuthority: "REVIEWER";
  requesterId: string;
  reviewCompleted: false;
  engineeringValidated: false;
  predecessorReviewRequestId: string | null;
  predecessorFingerprint: string | null;
};

export type D4R9FindingRecord = GovernedBase & {
  findingId: string;
  reviewRequestId: string;
  findingCategory: (typeof D4_R9_FINDING_CATEGORIES)[number];
  severity: (typeof PRE_ISSUE_MATERIALITY)[number];
  findingText: string;
  disposition: (typeof D4_R9_FINDING_DISPOSITIONS)[number];
  changeContextId: string | null;
  changeFingerprint: string | null;
  engineeringInvalid: false;
  engineeringValidated: false;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  authoritativeReview: true;
  aiReview: false;
};

export type D4R9CompletionRecord = GovernedBase & {
  completionId: string;
  reviewRequestId: string;
  reviewCompleted: true;
  engineeringValidated: false;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  predecessorCompletionId: string | null;
  predecessorFingerprint: string | null;
};

export type D4R9ValidationRecord = GovernedBase & {
  validationId: string;
  reviewRequestId: string | null;
  validationScope: string;
  basis: readonly D4R9Basis[];
  validationState: (typeof D4_R9_VALIDATION_STATES)[number];
  changeContextId: string | null;
  changeFingerprint: string | null;
  engineeringValidated: boolean;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  predecessorValidationId: string | null;
  predecessorFingerprint: string | null;
};

export type D4R9History = {
  historyId: string;
  subjectKind: "REVIEW_REQUEST" | "FINDING" | "COMPLETION" | "VALIDATION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D4R9Store = {
  r8: D4R8Store;
  now: () => string;
  requests: D4R9ReviewRequestRecord[];
  findings: D4R9FindingRecord[];
  completions: D4R9CompletionRecord[];
  validations: D4R9ValidationRecord[];
  history: D4R9History[];
};

function fail(code: string): never {
  throw new Error(`D4_R9_${code}`);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase())) fail(code);
  return token;
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || value === "LLM" || value === "OPTIMIZER";
}

function isCurrentness(value: string): value is Currentness {
  return (D4_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function maturityOf(value: string): (typeof D4_MATURITY_STATES)[number] {
  const token = value.trim();
  if (!(D4_MATURITY_STATES as readonly string[]).includes(token)) fail("LIFECYCLE_INVALID");
  return token as (typeof D4_MATURITY_STATES)[number];
}

function guardText(value: string, code: string): string {
  const token = explicit(value, code);
  if (/[=*]|calc\(|sqrt\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function assertProhibited(input: Prohibited): void {
  if (input.approve === true) fail("APPROVAL_NOT_IN_R9");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R9");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R9");
  if (input.automaticValidation === true || input.validated === true) fail("AUTOMATIC_VALIDATION_REJECTED");
  if (input.reassessmentCompleted === true || input.closeReassessmentAsValidated === true) fail("REASSESSMENT_NOT_VALIDATION");
  if (input.mutateR3 === true || input.mutateR3Performance === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR4 === true) fail("R4_MUTATION_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.mutateR6 === true) fail("R6_MUTATION_REJECTED");
  if (input.mutateR8 === true) fail("R8_MUTATION_REJECTED");
  if (input.invalidateEngineering === true) fail("FINDING_INVALIDATION_REJECTED");
  if (input.redesignEngineering === true || input.redesign === true) fail("REDESIGN_NOT_IN_R9");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.validateD1 === true) fail("D1_VALIDATION_REJECTED");
  if (input.validateD2 === true) fail("D2_VALIDATION_REJECTED");
  if (input.validateD3 === true) fail("D3_VALIDATION_REJECTED");
  if (input.validateFuture === true) fail("FUTURE_DISCIPLINE_VALIDATION_REJECTED");
  if (input.recalculate === true) fail("CALCULATION_NOT_IN_R9");
  if (input.d5Start === true) fail("FUTURE_DISCIPLINE_RUNTIME_REJECTED");
  if (input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R9");
  if (input.reviewCompleted === true) fail("REVIEW_REQUEST_NOT_COMPLETION");
}

function sameScope(row: { tenantId: string; workspaceId: string; projectId: string }, actor: D4R9Actor): boolean {
  return row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId;
}

function assertScope(actor: D4R9Actor, input: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) fail("SCOPE_MISMATCH");
}

function assertRecorder(actor: D4R9Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_MECHANICAL_AUTHORITY");
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") fail("ADMIN_NOT_MECHANICAL_AUTHORITY");
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY" || actor.authority === "REVIEWER") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
  assertHumanApprovalActor(actor.actorKind ?? "human", actor.actorId);
}

function assertReviewer(actor: D4R9Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail("AI_NOT_MECHANICAL_REVIEWER");
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") fail("ADMIN_NOT_MECHANICAL_REVIEWER");
  if (actor.authority !== "REVIEWER" || !(D4_AUTHORITY_ROLES as readonly string[]).includes(actor.authority)) fail("REVIEWER_AUTHORITY_REQUIRED");
  assertHumanApprovalActor(actor.actorKind ?? "", actor.actorId);
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function seal(store: D4R9Store): string {
  const r3 = store.r8.r7.r6.r5.r4.r3.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  const r4 = store.r8.r7.r6.r5.r4.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  const r5 = store.r8.r7.r6.r5.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.requirementStatement}:${row.recordStatus}`).join("|");
  const r6 = store.r8.r7.r6.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.statement}:${row.recordStatus}`).join("|");
  const changes = store.r8.r7.changes.map((row) => `${row.changeContextId}:${row.fingerprint}:${row.recalculated}:${row.redesigned}`).join("|");
  const handoffs = store.r8.handoffs.map((row) => `${row.handoffId}:${row.fingerprint}:${row.recordStatus}:${row.engineeringValidated}`).join("|");
  return `${r3}#${r4}#${r5}#${r6}#${changes}#${handoffs}`;
}

function bind(store: D4R9Store, actor: D4R9Actor, input: ChainInput, cited: Currentness): D4R9SubjectPin {
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || !sameScope(context, actor)) fail("R1_CONTEXT_NOT_FOUND");
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.contextId !== context.contextId || object.fingerprint !== objectRevision || !sameScope(object, actor)) fail("R1_REVISION_MISMATCH");
  const subjectKind = input.r2SubjectKind;
  const r2SubjectId = explicit(input.r2SubjectId, "R2_SUBJECT_REQUIRED");
  const r2Revision = explicit(input.r2RevisionFingerprint, "R2_REVISION_REQUIRED");
  const rows = subjectKind === "CLASSIFICATION" ? store.r8.r7.r6.r5.r4.r3.r2.classifications : subjectKind === "SERVICE" ? store.r8.r7.r6.r5.r4.r3.r2.services : subjectKind === "MEMBERSHIP" ? store.r8.r7.r6.r5.r4.r3.r2.memberships : store.r8.r7.r6.r5.r4.r3.r2.descriptions;
  const r2 = rows.find((row) => {
    if (subjectKind === "CLASSIFICATION" && "classificationId" in row) return row.classificationId === r2SubjectId;
    if (subjectKind === "SERVICE" && "serviceContextId" in row) return row.serviceContextId === r2SubjectId;
    if (subjectKind === "MEMBERSHIP" && "membershipId" in row) return row.membershipId === r2SubjectId;
    if (subjectKind === "DESCRIPTION" && "descriptionId" in row) return row.descriptionId === r2SubjectId;
    return false;
  });
  if (!r2 || r2.fingerprint !== r2Revision || r2.objectId !== object.objectId) fail("R2_REVISION_MISMATCH");
  const r3 = store.r8.r7.r6.r5.r4.r3.records.find((row) => row.recordId === explicit(input.r3RecordId, "R3_RECORD_REQUIRED"));
  if (!r3 || r3.fingerprint !== explicit(input.r3RevisionFingerprint, "R3_REVISION_REQUIRED") || r3.objectId !== object.objectId) fail("R3_REVISION_MISMATCH");
  const r4 = store.r8.r7.r6.r5.r4.records.find((row) => row.recordId === explicit(input.r4RecordId, "R4_RECORD_REQUIRED"));
  if (!r4 || r4.fingerprint !== explicit(input.r4RevisionFingerprint, "R4_REVISION_REQUIRED") || r4.objectId !== object.objectId) fail("R4_REVISION_MISMATCH");
  const r5 = store.r8.r7.r6.r5.records.find((row) => row.recordId === explicit(input.r5RecordId, "R5_RECORD_REQUIRED"));
  if (!r5 || r5.fingerprint !== explicit(input.r5RevisionFingerprint, "R5_REVISION_REQUIRED") || r5.objectId !== object.objectId) fail("R5_REVISION_MISMATCH");
  const r6 = store.r8.r7.r6.records.find((row) => row.recordId === explicit(input.r6RecordId, "R6_RECORD_REQUIRED"));
  if (!r6 || r6.fingerprint !== explicit(input.r6RevisionFingerprint, "R6_REVISION_REQUIRED") || r6.objectId !== object.objectId) fail("R6_REVISION_MISMATCH");
  const handoffId = explicit(input.r8HandoffId, "R8_HANDOFF_REQUIRED");
  const handoffRevision = explicit(input.r8RevisionFingerprint, "R8_REVISION_REQUIRED");
  const handoff = store.r8.handoffs.find((row) => row.handoffId === handoffId);
  if (!handoff || handoff.fingerprint !== handoffRevision || handoff.objectId !== object.objectId || !sameScope(handoff, actor)) fail("R8_REVISION_MISMATCH");
  const kind = explicit(input.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D4_R9_SUBJECT_KINDS as readonly string[]).includes(kind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(input.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(input.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const located =
    kind === "OBJECT" ? object.objectId === subjectId && object.fingerprint === subjectFingerprint && object.provenanceRef === subjectRevision ? object : null
    : kind === "DESIGN" ? r3.recordId === subjectId && r3.fingerprint === subjectFingerprint && r3.provenanceRef === subjectRevision ? r3 : null
    : kind === "EVIDENCE" ? r4.recordId === subjectId && r4.fingerprint === subjectFingerprint && r4.provenanceRef === subjectRevision ? r4 : null
    : kind === "TECHNICAL" ? r5.recordId === subjectId && r5.fingerprint === subjectFingerprint && r5.provenanceRef === subjectRevision ? r5 : null
    : kind === "MAINTAINABILITY" ? r6.recordId === subjectId && r6.fingerprint === subjectFingerprint && r6.provenanceRef === subjectRevision ? r6 : null
    : kind === "REQUIREMENT" ? store.r8.r7.requirements.find((row) => row.requirementContextId === subjectId && row.fingerprint === subjectFingerprint && row.provenanceRef === subjectRevision && row.objectId === object.objectId) ?? null
    : kind === "ASSUMPTION" ? store.r8.r7.assumptions.find((row) => row.assumptionContextId === subjectId && row.fingerprint === subjectFingerprint && row.provenanceRef === subjectRevision && row.objectId === object.objectId) ?? null
    : kind === "DECISION" ? store.r8.r7.decisions.find((row) => row.decisionContextId === subjectId && row.fingerprint === subjectFingerprint && row.provenanceRef === subjectRevision && row.objectId === object.objectId) ?? null
    : kind === "CHANGE" ? store.r8.r7.changes.find((row) => row.changeContextId === subjectId && row.fingerprint === subjectFingerprint && row.provenanceRef === subjectRevision && row.objectId === object.objectId) ?? null
    : kind === "HANDOFF" ? handoff.handoffId === subjectId && handoff.fingerprint === subjectFingerprint && handoff.provenanceRef === subjectRevision ? handoff : null
    : null;
  if (!located) fail("SUBJECT_REVISION_MISMATCH");
  if (cited === "CURRENT" && located.recordStatus !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  if (cited === "CURRENT" && [context, object, r2, r3, r4, r5, r6, handoff].some((row) => row.recordStatus !== "CURRENT")) fail("SOURCE_NOT_CURRENT");
  return {
    subjectKind: kind as SubjectKind,
    subjectId,
    subjectRevision,
    subjectFingerprint,
    contextId,
    objectId,
    objectRevisionFingerprint: object.fingerprint,
    r2SubjectId,
    r2RevisionFingerprint: r2.fingerprint,
    r3RecordId: r3.recordId,
    r3RevisionFingerprint: r3.fingerprint,
    r4RecordId: r4.recordId,
    r4RevisionFingerprint: r4.fingerprint,
    r5RecordId: r5.recordId,
    r5RevisionFingerprint: r5.fingerprint,
    r6RecordId: r6.recordId,
    r6RevisionFingerprint: r6.fingerprint,
    r8HandoffId: handoff.handoffId,
    r8RevisionFingerprint: handoff.fingerprint,
    subjectRecordStatus: located.recordStatus,
    subjectCurrentness: located.currentness,
  };
}

function samePin(left: D4R9SubjectPin, right: D4R9SubjectPin): boolean {
  return left.subjectKind === right.subjectKind && left.subjectId === right.subjectId && left.subjectFingerprint === right.subjectFingerprint && left.objectRevisionFingerprint === right.objectRevisionFingerprint && left.r8RevisionFingerprint === right.r8RevisionFingerprint;
}

function resolveBasis(store: D4R9Store, actor: D4R9Actor, pin: D4R9SubjectPin, items: readonly D4R9BasisInput[] | undefined, requireCurrent: boolean): D4R9Basis[] {
  const resolved: D4R9Basis[] = [];
  for (const item of items ?? []) {
    const kind = explicit(item.kind, "BASIS_KIND_REQUIRED");
    if (!(D4_R9_BASIS_KINDS as readonly string[]).includes(kind)) fail("BASIS_KIND_INVALID");
    const id = explicit(item.id, "BASIS_REFERENCE_REQUIRED");
    const fingerprint = explicit(item.fingerprint, "BASIS_REVISION_REQUIRED");
    const row =
      kind === "R3_DESIGN" ? store.r8.r7.r6.r5.r4.r3.records.find((entry) => entry.recordId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId)
      : kind === "R4_VENDOR" ? store.r8.r7.r6.r5.r4.records.find((entry) => entry.recordId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId)
      : kind === "R5_REQUIREMENT" ? store.r8.r7.r6.r5.records.find((entry) => entry.recordId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId)
      : kind === "R6_MAINTAINABILITY" ? store.r8.r7.r6.records.find((entry) => entry.recordId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId)
      : kind === "R7_DECISION" ? store.r8.r7.decisions.find((entry) => entry.decisionContextId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId && sameScope(entry, actor))
      : kind === "R7_REASSESSMENT" ? store.r8.r7.reassessments.find((entry) => entry.reassessmentContextId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId && sameScope(entry, actor))
      : store.r8.handoffs.find((entry) => entry.handoffId === id && entry.fingerprint === fingerprint && entry.objectId === pin.objectId && sameScope(entry, actor));
    if (!row) fail("BASIS_REVISION_MISMATCH");
    if (requireCurrent && row.recordStatus !== "CURRENT") fail("BASIS_NOT_CURRENT");
    resolved.push({ kind: kind as BasisKind, id, fingerprint: row.fingerprint });
  }
  return resolved;
}

function requireReassessmentChange(store: D4R9Store, actor: D4R9Actor, pin: D4R9SubjectPin, changeContextId: string | null | undefined, changeFingerprint: string | null | undefined): { changeContextId: string; changeFingerprint: string } {
  const id = explicit(changeContextId ?? "", "CHANGE_REFERENCE_REQUIRED");
  const fingerprint = explicit(changeFingerprint ?? "", "CHANGE_REVISION_REQUIRED");
  const change = store.r8.r7.changes.find((row) => row.changeContextId === id && row.objectId === pin.objectId && sameScope(row, actor));
  if (!change || change.fingerprint !== fingerprint || change.recordStatus !== "CURRENT" || change.changeCategory !== "REASSESSMENT_REQUIRED") fail("CHANGE_REVISION_MISMATCH");
  return { changeContextId: change.changeContextId, changeFingerprint: change.fingerprint };
}

function remember(store: D4R9Store, subjectKind: D4R9History["subjectKind"], subjectId: string, action: D4R9History["action"], fingerprint: string): void {
  store.history.push({ historyId: `d4r9-history-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function common(store: D4R9Store, actor: D4R9Actor, pin: D4R9SubjectPin, applicability: string, limitations: string, provenanceRef: string, cited: Currentness, lifecycle: string, fingerprint: string): Omit<GovernedBase, "subjectKind" | "subjectId" | "subjectRevision" | "subjectFingerprint" | "contextId" | "objectId" | "objectRevisionFingerprint" | "r2SubjectId" | "r2RevisionFingerprint" | "r3RecordId" | "r3RevisionFingerprint" | "r4RecordId" | "r4RevisionFingerprint" | "r5RecordId" | "r5RevisionFingerprint" | "r6RecordId" | "r6RevisionFingerprint" | "r8HandoffId" | "r8RevisionFingerprint" | "subjectRecordStatus" | "subjectCurrentness"> {
  return {
    applicability, limitations, provenanceRef, citedCurrentness: cited, currentness: cited, citedLifecycleStage: maturityOf(lifecycle), fingerprint,
    recordStatus: "CURRENT", deleted: false, invalidated: false, conformant: false, engineeringApproved: false, certified: false,
    d1Validated: false, d2Validated: false, d3Validated: false, futureDisciplineValidated: false, recalculated: false, redesigned: false,
    tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, createdAt: store.now(), createdBy: actor.actorId,
  };
}

export function createD4R9Store(r8: D4R8Store, now: () => string = () => r8.now()): D4R9Store {
  return { r8, now, requests: [], findings: [], completions: [], validations: [], history: [] };
}

export function recordMechanicalReviewRequest(store: D4R9Store, actor: D4R9Actor, input: Prohibited & ChainInput & {
  reviewRequestId: string; reviewType: string; reviewScope: string; requestedReviewerAuthority: string; applicability: string; limitations: string; citedCurrentness: string; citedLifecycleStage: string; provenanceRef: string; assertedFingerprint?: string | null; predecessorReviewRequestId?: string | null;
}): D4R9ReviewRequestRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const reviewType = explicit(input.reviewType, "REVIEW_TYPE_REQUIRED");
  if (!(D4_R9_REVIEW_TYPES as readonly string[]).includes(reviewType)) fail("REVIEW_TYPE_INVALID");
  if (reviewType === "INTERFACE_HANDOFF_REVIEW" && pin.subjectKind !== "HANDOFF") fail("HANDOFF_SUBJECT_REQUIRED");
  const requestedReviewerAuthority = explicit(input.requestedReviewerAuthority, "REVIEWER_AUTHORITY_REQUIRED");
  if (requestedReviewerAuthority !== "REVIEWER") fail("REVIEWER_AUTHORITY_REQUIRED");
  const reviewScope = guardText(input.reviewScope, "REVIEW_SCOPE_REQUIRED");
  const applicability = guardText(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = guardText(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const predecessorId = input.predecessorReviewRequestId ? explicit(input.predecessorReviewRequestId, "REVIEW_REQUEST_REQUIRED") : null;
  const predecessor = predecessorId ? store.requests.find((row) => row.reviewRequestId === predecessorId) : null;
  if (predecessorId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("REVIEW_REQUEST_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor && cited !== "STALE" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const fingerprint = fingerprintCanonical({ reviewRequestId, ...pin, reviewType, reviewScope, requestedReviewerAuthority, applicability, limitations, cited, provenanceRef, predecessorReviewRequestId: predecessor?.reviewRequestId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requests.find((row) => row.reviewRequestId === reviewRequestId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("REVIEW_REQUEST_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${reviewType}`;
  if (store.requests.some((row) => row.recordStatus === "CURRENT" && row.reviewRequestId !== predecessor?.reviewRequestId && row.contextId === pin.contextId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.reviewType}` === signature)) fail("DUPLICATE_REVIEW_REQUEST_REJECTED");
  const record: D4R9ReviewRequestRecord = {
    ...pin, ...common(store, actor, pin, applicability, limitations, provenanceRef, cited, input.citedLifecycleStage, fingerprint),
    reviewRequestId, reviewType: reviewType as D4R9ReviewRequestRecord["reviewType"], reviewScope, requestStatus: "REQUESTED", requestedReviewerAuthority: "REVIEWER", requesterId: actor.actorId, reviewCompleted: false, engineeringValidated: false, predecessorReviewRequestId: predecessor?.reviewRequestId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
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

export function recordMechanicalReviewFinding(store: D4R9Store, actor: D4R9Actor, input: Prohibited & ChainInput & {
  findingId: string; reviewRequestId: string; findingCategory: string; severity: string; findingText: string; disposition: string; changeContextId?: string | null; changeFingerprint?: string | null; applicability: string; limitations: string; citedCurrentness: string; citedLifecycleStage: string; provenanceRef: string; assertedFingerprint?: string | null;
}): D4R9FindingRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
  if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
  const findingCategory = explicit(input.findingCategory, "FINDING_CATEGORY_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(findingCategory) || !(D4_R9_FINDING_CATEGORIES as readonly string[]).includes(findingCategory)) fail("FINDING_CATEGORY_INVALID");
  const severity = explicit(input.severity, "FINDING_SEVERITY_REQUIRED");
  if (!(PRE_ISSUE_MATERIALITY as readonly string[]).includes(severity)) fail("FINDING_SEVERITY_INVALID");
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(disposition) || !(D4_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory === "REASSESSMENT_RECOMMENDATION" && disposition !== "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory !== "REASSESSMENT_RECOMMENDATION" && disposition === "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  const change = disposition === "REASSESSMENT_REQUESTED" ? requireReassessmentChange(store, actor, pin, input.changeContextId, input.changeFingerprint) : null;
  if (!change && (input.changeContextId || input.changeFingerprint)) fail("CHANGE_REFERENCE_UNEXPECTED");
  const findingText = guardText(input.findingText, "FINDING_TEXT_REQUIRED");
  const applicability = guardText(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = guardText(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const findingId = explicit(input.findingId, "FINDING_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ findingId, reviewRequestId, ...pin, findingCategory, severity, findingText, disposition, change, applicability, limitations, cited, provenanceRef, reviewerId: actor.actorId });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.findings.find((row) => row.findingId === findingId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINDING_ALREADY_RECORDED");
  const signature = `${reviewRequestId}|${pin.subjectId}|${pin.subjectFingerprint}|${findingCategory}|${findingText}`;
  if (store.findings.some((row) => row.contextId === pin.contextId && `${row.reviewRequestId}|${row.subjectId}|${row.subjectFingerprint}|${row.findingCategory}|${row.findingText}` === signature)) fail("DUPLICATE_FINDING_REJECTED");
  const record: D4R9FindingRecord = {
    ...pin, ...common(store, actor, pin, applicability, limitations, provenanceRef, cited, input.citedLifecycleStage, fingerprint),
    findingId, reviewRequestId, findingCategory: findingCategory as D4R9FindingRecord["findingCategory"], severity: severity as D4R9FindingRecord["severity"], findingText, disposition: disposition as D4R9FindingRecord["disposition"], changeContextId: change?.changeContextId ?? null, changeFingerprint: change?.changeFingerprint ?? null, engineeringInvalid: false, engineeringValidated: false, reviewerId: actor.actorId, reviewerAuthority: "REVIEWER", authoritativeReview: true, aiReview: false,
  };
  store.findings.push(record);
  remember(store, "FINDING", record.findingId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordMechanicalReviewCompletion(store: D4R9Store, actor: D4R9Actor, input: Prohibited & ChainInput & {
  completionId: string; reviewRequestId: string; applicability: string; limitations: string; citedCurrentness: string; citedLifecycleStage: string; provenanceRef: string; assertedFingerprint?: string | null; predecessorCompletionId?: string | null;
}): D4R9CompletionRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
  if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
  if (request.reviewCompleted !== false || request.engineeringValidated !== false) fail("REVIEW_REQUEST_NOT_COMPLETION");
  const applicability = guardText(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = guardText(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const completionId = explicit(input.completionId, "COMPLETION_ID_REQUIRED");
  const predecessorId = input.predecessorCompletionId ? explicit(input.predecessorCompletionId, "COMPLETION_ID_REQUIRED") : null;
  const predecessor = predecessorId ? store.completions.find((row) => row.completionId === predecessorId) : null;
  if (predecessorId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("COMPLETION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor && cited !== "STALE" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const fingerprint = fingerprintCanonical({ completionId, reviewRequestId, ...pin, applicability, limitations, cited, provenanceRef, reviewerId: actor.actorId, predecessorCompletionId: predecessor?.completionId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.completions.find((row) => row.completionId === completionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("COMPLETION_ALREADY_RECORDED");
  const signature = `${reviewRequestId}|${pin.subjectId}|${pin.subjectFingerprint}`;
  if (store.completions.some((row) => row.recordStatus === "CURRENT" && row.completionId !== predecessor?.completionId && row.contextId === pin.contextId && `${row.reviewRequestId}|${row.subjectId}|${row.subjectFingerprint}` === signature)) fail("DUPLICATE_COMPLETION_REJECTED");
  const record: D4R9CompletionRecord = {
    ...pin, ...common(store, actor, pin, applicability, limitations, provenanceRef, cited, input.citedLifecycleStage, fingerprint),
    completionId, reviewRequestId, reviewCompleted: true, engineeringValidated: false, reviewerId: actor.actorId, reviewerAuthority: "REVIEWER", predecessorCompletionId: predecessor?.completionId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
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

export function recordMechanicalValidationState(store: D4R9Store, actor: D4R9Actor, input: Prohibited & ChainInput & {
  validationId: string; reviewRequestId?: string | null; validationScope: string; basis?: readonly D4R9BasisInput[]; validationState: string; changeContextId?: string | null; changeFingerprint?: string | null; applicability: string; limitations: string; citedCurrentness: string; citedLifecycleStage: string; provenanceRef: string; assertedFingerprint?: string | null; predecessorValidationId?: string | null;
}): D4R9ValidationRecord {
  if ((blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") && (input.validationState === "VALIDATED" || input.automaticValidation === true)) fail("AI_CANNOT_VALIDATE");
  if ((actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") && (input.validationState === "VALIDATED" || input.automaticValidation === true)) fail("ADMIN_CANNOT_VALIDATE");
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited);
  const validationState = explicit(input.validationState, "VALIDATION_STATE_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(validationState) || !(D4_R9_VALIDATION_STATES as readonly string[]).includes(validationState)) fail("VALIDATION_STATE_INVALID");
  if (validationState === "STALE" && cited !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "REASSESSMENT_REQUIRED" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && cited !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && (pin.subjectCurrentness === "REASSESSMENT_REQUIRED" || pin.subjectCurrentness === "STALE" || pin.subjectCurrentness === "SUPERSEDED" || pin.subjectRecordStatus !== "CURRENT")) fail("REASSESSMENT_NOT_VALIDATED");
  const basis = resolveBasis(store, actor, pin, input.basis, validationState === "VALIDATED");
  if (validationState === "VALIDATED" && basis.length === 0) fail("BASIS_REQUIRED");
  const change = validationState === "REASSESSMENT_REQUIRED" ? requireReassessmentChange(store, actor, pin, input.changeContextId, input.changeFingerprint) : null;
  if (!change && (input.changeContextId || input.changeFingerprint)) fail("CHANGE_REFERENCE_UNEXPECTED");
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
  const predecessorId = input.predecessorValidationId ? explicit(input.predecessorValidationId, "VALIDATION_ID_REQUIRED") : null;
  const predecessor = predecessorId ? store.validations.find((row) => row.validationId === predecessorId) : null;
  if (predecessorId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("VALIDATION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("VALIDATION_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor && cited !== "STALE" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const engineeringValidated = validationState === "VALIDATED";
  const fingerprint = fingerprintCanonical({ validationId, reviewRequestId, ...pin, validationScope, basis, validationState, change, engineeringValidated, applicability, limitations, cited, provenanceRef, reviewerId: actor.actorId, predecessorValidationId: predecessor?.validationId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.validations.find((row) => row.validationId === validationId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("VALIDATION_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${validationScope}|${validationState}`;
  if (store.validations.some((row) => row.recordStatus === "CURRENT" && row.validationId !== predecessor?.validationId && row.contextId === pin.contextId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.validationScope}|${row.validationState}` === signature)) fail("DUPLICATE_VALIDATION_REJECTED");
  const record: D4R9ValidationRecord = {
    ...pin, ...common(store, actor, pin, applicability, limitations, provenanceRef, cited, input.citedLifecycleStage, fingerprint),
    validationId, reviewRequestId, validationScope, basis, validationState: validationState as D4R9ValidationRecord["validationState"], changeContextId: change?.changeContextId ?? null, changeFingerprint: change?.changeFingerprint ?? null, engineeringValidated, reviewerId: actor.actorId, reviewerAuthority: "REVIEWER", predecessorValidationId: predecessor?.validationId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
    remember(store, "VALIDATION", predecessor.validationId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.validations.push(record);
  remember(store, "VALIDATION", record.validationId, "CREATED", record.fingerprint);
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function repointMechanicalReview(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function transferMechanicalValidation(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}
export function mutateDesignFromReview(): never {
  return fail("R3_MUTATION_REJECTED");
}
export function mutateVendorEvidenceFromReview(): never {
  return fail("R4_MUTATION_REJECTED");
}
export function mutateTechnicalRequirementFromReview(): never {
  return fail("R5_MUTATION_REJECTED");
}
export function mutateMaintainabilityFromReview(): never {
  return fail("R6_MUTATION_REJECTED");
}
export function mutateHandoffFromReview(): never {
  return fail("R8_MUTATION_REJECTED");
}
export function validateMechanicalCounterpart(): never {
  return fail("D1_VALIDATION_REJECTED");
}
export function automaticallyValidateMechanicalEngineering(): never {
  return fail("AUTOMATIC_VALIDATION_REJECTED");
}
export function closeReassessmentAsValidated(): never {
  return fail("REASSESSMENT_NOT_VALIDATION");
}
export function reasonAcrossMechanicalReview(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R9");
}
