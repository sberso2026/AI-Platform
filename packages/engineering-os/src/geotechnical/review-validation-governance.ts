/**
 * EOS-D3-R9 review and validation governance.
 * One bounded runtime. Records review requests, findings, review completion,
 * and explicit validation state on exact D3 revisions. Reuses canonical
 * pre-issue, assurance, and Civil review-state governance. Does not calculate,
 * redesign, approve, certify, or start D4 through D9.
 */
import {
  D2_REOPENED as ARCH_D2_REOPENED,
  D3_0_CANONICAL_CURRENTNESS_REUSED,
  D3_0_CANONICAL_FINGERPRINT_REUSED,
  D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D3_APPROVAL_RUNTIME_COUNT as ARCH_APPROVAL_COUNT,
  D3_AUTHORITY_ROLES,
  D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT as ARCH_AUTO_VALIDATION_COUNT,
  D3_BEARING_CAPACITY_RUNTIME_COUNT as ARCH_BEARING_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT as ARCH_CERTIFICATION_COUNT,
  D3_CURRENTNESS_STATES,
  D3_D9_RUNTIME_INTEGRATION_COUNT as ARCH_D9_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT as ARCH_D9_SOURCE_COUNT,
  D3_EARTH_PRESSURE_RUNTIME_COUNT as ARCH_EARTH_PRESSURE_COUNT,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT as ARCH_FOUNDATION_CALC_COUNT,
  D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT as ARCH_GROUND_IMPROVEMENT_COUNT,
  D3_IMPLEMENTATION_PHASES,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT as ARCH_SETTLEMENT_COUNT,
  D3_SILENT_REPOINTING_ALLOWED,
  D3_SLOPE_STABILITY_RUNTIME_COUNT as ARCH_SLOPE_COUNT,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
} from "@rtb/types";
import {
  D2_R9_FINDING_DISPOSITIONS,
  D2_R9_REQUEST_STATUSES,
  D2_R9_SUBJECT_KINDS,
  D2_R9_VALIDATION_STATES,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED as CANONICAL_REVIEW_COMPLETED_EQUALS_VALIDATED,
  REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED as CANONICAL_REQUEST_EQUALS_VALIDATED,
  REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED as CANONICAL_REQUEST_EQUALS_COMPLETED,
  VALIDATED_EQUALS_CERTIFIED as CANONICAL_VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT as CANONICAL_VALIDATED_EQUALS_CONFORMANT,
  VALIDATED_EQUALS_ENGINEERING_APPROVED as CANONICAL_VALIDATED_EQUALS_APPROVED,
} from "../civil/review-validation-governance";
import { assertHumanApprovalActor } from "../decision-intelligence/invariants";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  FORBIDDEN_PRE_ISSUE_VERDICTS,
  PRE_ISSUE_AI_BOUNDARY,
  PRE_ISSUE_MATERIALITY,
} from "../pre-issue-review/types";
import { resolveAuthAssuranceLevel } from "../security-closure/privileged-mfa";
import { D3_CONTEXT_AUTHORITY, D3_DISCIPLINE, type D3R1Actor } from "./identity-foundation";
import { D3_R7_CHANGE_CATEGORIES, type D3R7ChangeRecord } from "./requirements-assumptions-change";
import {
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY as R8_INTERFACE_READY,
  D3_FIELD_LAB_TEST_RUNTIME_READY as R4_TEST_READY,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY as R6_CONTEXT_READY,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY as R5_PARAMETER_READY,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_CHANGE_READY,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY as R2_EVIDENCE_READY,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY as R3_READY,
  type D3R8Store,
} from "./discipline-interfaces-handoffs";

export const D3_R9_STATUS = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D3_R9_MATURITY = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D3_R9_MATURITY_STATE = D3_R9_MATURITY;
export const D3_R9_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D3_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md" as const;
export const D3_REUSES_CANONICAL_REVIEW_GOVERNANCE = true as const;
export const D3_REUSES_CANONICAL_VALIDATION_GOVERNANCE = true as const;
export const PARALLEL_D3_REVIEW_SYSTEM_CREATED = false as const;
export const PARALLEL_D3_VALIDATION_SYSTEM_CREATED = false as const;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 9 as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED = true as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 1 as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = R2_EVIDENCE_READY;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = R3_READY;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = R4_TEST_READY;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = R5_PARAMETER_READY;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = R6_CONTEXT_READY;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_CHANGE_READY;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = R8_INTERFACE_READY;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const EXACT_D3_REVIEW_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D3_REVIEW_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D3_REVIEW_SUBJECT_AUTO_REPOINTED = D3_SILENT_REPOINTING_ALLOWED;
export const D3_REVIEW_REQUEST_CONTEXT_IMPLEMENTED = true as const;
export const D3_REVIEWER_AUTHORITY_EXPLICIT = true as const;
export const D3_REVIEW_FINDING_CONTEXT_IMPLEMENTED = true as const;
export const D3_REVIEW_COMPLETION_STATE_IMPLEMENTED = true as const;
export const D3_VALIDATION_STATE_IMPLEMENTED = true as const;
export const REVIEW_REQUEST_EQUALS_REVIEW_COMPLETED = CANONICAL_REQUEST_EQUALS_COMPLETED;
export const REVIEW_REQUEST_EQUALS_ENGINEERING_VALIDATED = CANONICAL_REQUEST_EQUALS_VALIDATED;
export const REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED = CANONICAL_REVIEW_COMPLETED_EQUALS_VALIDATED;
export const REVIEW_COMPLETED_EQUALS_CONFORMANT = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const REVIEW_COMPLETED_EQUALS_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const REVIEW_COMPLETED_EQUALS_CERTIFIED = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const VALIDATED_EQUALS_CONFORMANT = CANONICAL_VALIDATED_EQUALS_CONFORMANT;
export const VALIDATED_EQUALS_ENGINEERING_APPROVED = CANONICAL_VALIDATED_EQUALS_APPROVED;
export const VALIDATED_EQUALS_CERTIFIED = CANONICAL_VALIDATED_EQUALS_CERTIFIED;
export const AI_EQUALS_D3_REVIEWER_AUTHORITY = false as const;
export const ADMIN_EQUALS_D3_REVIEWER_AUTHORITY = false as const;
export const AI_CAN_AUTOMATICALLY_VALIDATE_D3_ENGINEERING = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const ADMIN_CAN_AUTOMATICALLY_VALIDATE_D3_ENGINEERING = false as const;
export const AI_GENERATED_REVIEW_EQUALS_ENGINEERING_VALIDATION = PRE_ISSUE_AI_BOUNDARY.mayCreateFormalFindingAutomatically;
export const ADMIN_REVIEW_ACTION_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D3_FINDING_AUTO_MUTATES_ENGINEERING = false as const;
export const D3_FINDING_AUTO_INVALIDATES_ENGINEERING = false as const;
export const D3_FINDING_AUTO_CHANGES_R3_INTERPRETATION = false as const;
export const D3_FINDING_AUTO_CHANGES_R4_TEST_RESULT = false as const;
export const D3_FINDING_AUTO_CHANGES_R5_PARAMETER = false as const;
export const D3_FINDING_AUTO_CHANGES_R6_RECOMMENDATION = false as const;
export const D3_FINDING_AUTO_CHANGES_R7_DECISION = false as const;
export const D3_FINDING_AUTO_CHANGES_R8_HANDOFF = false as const;
export const PRIOR_D3_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const PRIOR_D3_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const D3_R7_CHANGE_GOVERNANCE_REUSED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D3_REVIEW_VALIDATES_D1_STRUCTURAL_ENGINEERING = false as const;
export const D3_REVIEW_VALIDATES_D2_CIVIL_ENGINEERING = false as const;
export const D3_VALIDATION_VALIDATES_COUNTERPART_DISCIPLINE = false as const;
export const STALE_D3_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const REASSESSMENT_REQUIRED_RECORD_EXPOSED_AS_VALIDATED = false as const;
export const CANONICAL_CURRENTNESS_REUSED = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const D3_R9_PROVENANCE_REQUIRED = true as const;
export const D3_R9_PROVENANCE_PRESERVED = true as const;
export const D3_R9_AUTO_REPOINTED = D3_SILENT_REPOINTING_ALLOWED;
export const SILENT_D3_R9_MUTATION_ALLOWED = false as const;
export const D3_R9_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_R9_SCOPE_ENFORCED = true as const;
export const D3_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D3_R9_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D3_R9_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D3_R9_REQUEST_STATUSES = D2_R9_REQUEST_STATUSES;
export const D3_R9_FINDING_DISPOSITIONS = D2_R9_FINDING_DISPOSITIONS;
export const D3_R9_VALIDATION_STATES = D2_R9_VALIDATION_STATES;
export const D3_R9_SUBJECT_KINDS = D2_R9_SUBJECT_KINDS;
export const D3_R9_REVIEW_TYPES = ["GEOTECHNICAL_SUBJECT_REVIEW", "INTERFACE_HANDOFF_REVIEW"] as const;
export const D3_R9_FINDING_CATEGORIES = ["OBSERVATION", "COMMENT", "CLARIFICATION_REQUIRED", "CONCERN", "NONCONFORMANCE_CANDIDATE", "REASSESSMENT_RECOMMENDATION", "UNRESOLVED_ISSUE"] as const;
export const D3_R9_AUTHORITY_ROLES_REUSED = D3_AUTHORITY_ROLES;
export const D3_R9_REVIEW_AI_BOUNDARY_REUSED = PRE_ISSUE_AI_BOUNDARY;
export const D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = ARCH_AUTO_VALIDATION_COUNT;
export const D3_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D3_APPROVAL_RUNTIME_COUNT = ARCH_APPROVAL_COUNT;
export const D3_CERTIFICATION_RUNTIME_COUNT = ARCH_CERTIFICATION_COUNT;
export const D3_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_CALCULATION_RUNTIME_COUNT = ARCH_FOUNDATION_CALC_COUNT;
export const D3_BEARING_CAPACITY_RUNTIME_COUNT = ARCH_BEARING_COUNT;
export const D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT = ARCH_SETTLEMENT_COUNT;
export const D3_PILE_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_STABILITY_RUNTIME_COUNT = ARCH_SLOPE_COUNT;
export const D3_EARTH_PRESSURE_RUNTIME_COUNT = ARCH_EARTH_PRESSURE_COUNT;
export const D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT = ARCH_GROUND_IMPROVEMENT_COUNT;
export const D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT = ARCH_D9_SOURCE_COUNT;
export const D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_D9_RUNTIME_INTEGRATION_COUNT = ARCH_D9_INTEGRATION_COUNT;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const D2_REOPENED = ARCH_D2_REOPENED;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_R10_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R10_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[9];
export const D3_R10_PHASE_TYPE = "CURRENTNESS_AND_DIGITAL_THREAD" as const;
export const D3_R10_CANONICAL_SCOPE = "Integrate canonical currentness, exact revision lineage, supersession, explicit dependency/currentness propagation, reassessment semantics, review/validation currentness and interface/handoff currentness across D3 R1-R9. Reuse canonical EOS currentness, digital-thread and fingerprint mechanisms. Do not infer dependencies, auto-recalculate, redesign, revalidate, approve, certify or start D4-D9." as const;
export const D3_R10_STARTED = false as const;
export const D3_R9_READY_FOR_NEXT_PHASE = true as const;
export const D3_R9_NEXT_PHASE = D3_R10_CANONICAL_PHASE;
export const D3_R9_NEXT_PHASE_TYPE = D3_R10_PHASE_TYPE;
export const D3_R9_CANONICAL_NEXT_PHASE = D3_R10_CANONICAL_PHASE;
export const D3_R9_CANONICAL_NEXT_PHASE_SCOPE = D3_R10_CANONICAL_SCOPE;
export const D3_R9_BLOCKER = "NONE" as const;
export const D3_R9_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default", "nearby", "similar"]);
const FORBIDDEN_VERDICTS = new Set<string>(FORBIDDEN_PRE_ISSUE_VERDICTS);

type Currentness = (typeof D3_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D3_R9_SUBJECT_KINDS)[number];
type FindingCategory = (typeof D3_R9_FINDING_CATEGORIES)[number];

type Prohibited = {
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  automaticValidation?: boolean;
  mutateEngineering?: boolean;
  invalidateEngineering?: boolean;
  changeR3?: boolean;
  changeR4?: boolean;
  changeR5?: boolean;
  changeR6?: boolean;
  changeR7?: boolean;
  changeR8?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  repoint?: boolean;
  validateCounterpart?: boolean;
  validateD1?: boolean;
  validateD2?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  deriveParameter?: boolean;
  bearing?: boolean;
  settlement?: boolean;
  slope?: boolean;
  d4Start?: boolean;
  d9Reasoning?: boolean;
  reviewCompleted?: boolean;
  validated?: boolean;
  reassessmentCompleted?: boolean;
};

export type D3R9Actor = D3R1Actor & {
  actorKind?: string;
  aal?: string | null;
  amr?: Array<string | { method?: string }> | null;
};

export type D3R9SubjectPin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
};

type SubjectInput = {
  subjectKind: string;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
  evidenceReferenceIds?: readonly string[];
};

export type D3R9ReviewRequestInput = Prohibited & SubjectInput & {
  reviewRequestId: string;
  reviewType: string;
  reviewScope: string;
  purpose: string;
  requestedReviewerAuthority: string;
  limitations: string;
  requestedAt: string;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  predecessorReviewRequestId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D3R9ReviewRequestRecord = D3R9SubjectPin & {
  reviewRequestId: string;
  reviewType: (typeof D3_R9_REVIEW_TYPES)[number];
  reviewScope: string;
  purpose: string;
  requestStatus: (typeof D3_R9_REQUEST_STATUSES)[number];
  reviewCompleted: false;
  engineeringValidated: false;
  conformant: false;
  engineeringApproved: false;
  certified: false;
  requestedReviewerAuthority: "REVIEWER";
  requesterId: string;
  evidenceReferenceIds: readonly string[];
  limitations: string;
  requestedAt: string;
  citedCurrentness: Currentness;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorReviewRequestId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R9FindingInput = Prohibited & SubjectInput & {
  findingId: string;
  reviewRequestId: string;
  findingCategory: string;
  severity: string;
  findingText: string;
  disposition: string;
  affectedObjectId: string;
  changeContextId?: string | null;
  limitations: string;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D3R9FindingRecord = D3R9SubjectPin & {
  findingId: string;
  reviewRequestId: string;
  findingCategory: FindingCategory;
  severity: (typeof PRE_ISSUE_MATERIALITY)[number];
  findingText: string;
  disposition: (typeof D3_R9_FINDING_DISPOSITIONS)[number];
  affectedObjectId: string;
  changeContextId: string | null;
  evidenceReferenceIds: readonly string[];
  nonconformanceCandidate: boolean;
  conformanceDetermined: false;
  engineeringInvalid: false;
  engineeringValidated: false;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  limitations: string;
  citedCurrentness: Currentness;
  provenanceRef: string;
  fingerprint: string;
  aal: "aal2";
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT";
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R9CompletionInput = Prohibited & SubjectInput & {
  completionId: string;
  reviewRequestId: string;
  limitations: string;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  predecessorCompletionId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D3R9CompletionRecord = D3R9SubjectPin & {
  completionId: string;
  reviewRequestId: string;
  reviewCompleted: true;
  engineeringValidated: false;
  conformant: false;
  engineeringApproved: false;
  certified: false;
  counterpartDisciplineValidated: false;
  d1Validated: false;
  d2Validated: false;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  limitations: string;
  citedCurrentness: Currentness;
  provenanceRef: string;
  fingerprint: string;
  aal: "aal2";
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorCompletionId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R9ValidationInput = Prohibited & SubjectInput & {
  validationId: string;
  reviewRequestId?: string | null;
  validationScope: string;
  requiredEvidenceReferenceIds: readonly string[];
  validationState: string;
  changeContextId?: string | null;
  limitations: string;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  predecessorValidationId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D3R9ValidationRecord = D3R9SubjectPin & {
  validationId: string;
  reviewRequestId: string | null;
  validationScope: string;
  requiredEvidenceReferenceIds: readonly string[];
  evidenceActuallyPresent: readonly string[];
  validationState: (typeof D3_R9_VALIDATION_STATES)[number];
  changeContextId: string | null;
  engineeringValidated: boolean;
  conformant: false;
  engineeringApproved: false;
  certified: false;
  counterpartDisciplineValidated: false;
  d1Validated: false;
  d2Validated: false;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  limitations: string;
  citedCurrentness: Currentness;
  provenanceRef: string;
  fingerprint: string;
  aal: "aal2";
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorValidationId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R9History = {
  historyId: string;
  subjectKind: "REVIEW_REQUEST" | "FINDING" | "COMPLETION" | "VALIDATION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D3R9Store = {
  r8: D3R8Store;
  now: () => string;
  requests: D3R9ReviewRequestRecord[];
  findings: D3R9FindingRecord[];
  completions: D3R9CompletionRecord[];
  validations: D3R9ValidationRecord[];
  history: D3R9History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isCurrentness(value: string): value is Currentness {
  return (D3_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.approve === true) fail("APPROVAL_NOT_IN_R9");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R9");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R9");
  if (input.automaticValidation === true || input.validated === true) fail("AUTOMATIC_VALIDATION_REJECTED");
  if (input.reassessmentCompleted === true) fail("REASSESSMENT_NOT_VALIDATION");
  if (input.mutateEngineering === true) fail("FINDING_MUTATION_REJECTED");
  if (input.invalidateEngineering === true) fail("FINDING_INVALIDATION_REJECTED");
  if (input.changeR3 === true) fail("R3_CHANGE_REJECTED");
  if (input.changeR4 === true) fail("R4_CHANGE_REJECTED");
  if (input.changeR5 === true) fail("R5_CHANGE_REJECTED");
  if (input.changeR6 === true) fail("R6_CHANGE_REJECTED");
  if (input.changeR7 === true) fail("R7_CHANGE_REJECTED");
  if (input.changeR8 === true) fail("R8_CHANGE_REJECTED");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.validateCounterpart === true) fail("COUNTERPART_VALIDATION_REJECTED");
  if (input.validateD1 === true) fail("D1_VALIDATION_REJECTED");
  if (input.validateD2 === true) fail("D2_VALIDATION_REJECTED");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R9");
  if (input.recalculate === true || input.deriveParameter === true || input.bearing === true || input.settlement === true || input.slope === true) fail("CALCULATION_NOT_IN_R9");
  if (input.d4Start === true) fail("D4_NOT_STARTED");
  if (input.d9Reasoning === true) fail("D9_NOT_STARTED");
  if (input.reviewCompleted === true) fail("REVIEW_REQUEST_NOT_COMPLETION");
}

function assertScope(actor: D3R9Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D3R9Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") fail("AI_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority !== D3_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertReviewer(actor: D3R9Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") fail("AI_NOT_GEOTECHNICAL_REVIEWER");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_GEOTECHNICAL_REVIEWER");
  if (actor.authority !== "REVIEWER" || !(D3_AUTHORITY_ROLES as readonly string[]).includes(actor.authority)) fail("REVIEWER_AUTHORITY_REQUIRED");
  assertHumanApprovalActor(actor.actorKind ?? "", actor.actorId);
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  return cited;
}

function requireContext(store: D3R9Store, actor: D3R9Actor, contextId: string, cited: Currentness) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  if (cited === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function pinSubject(store: D3R9Store, actor: D3R9Actor, input: SubjectInput, cited: Currentness): D3R9SubjectPin {
  const subjectKind = explicit(input.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D3_R9_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(input.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(input.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const context = requireContext(store, actor, input.contextId, cited);
  const kind = subjectKind as SubjectKind;
  const currentOk = (status: string) => {
    if (cited === "CURRENT" && status !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  };
  if (kind === "OBJECT") {
    const object = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === subjectId && row.contextId === context.contextId);
    if (!object || object.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
    if (object.fingerprint !== subjectFingerprint || object.provenanceRef !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
    currentOk(object.recordStatus);
  } else if (kind === "REQUIREMENT") {
    const row = store.r8.r7.requirements.find((item) => item.requirementContextId === subjectId && item.contextId === context.contextId);
    if (!row || row.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || row.sourceRevision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
    currentOk(row.recordStatus);
  } else if (kind === "ASSUMPTION") {
    const row = store.r8.r7.assumptions.find((item) => item.assumptionContextId === subjectId && item.contextId === context.contextId);
    if (!row || row.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || row.provenanceRef !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
    currentOk(row.recordStatus);
  } else if (kind === "DECISION") {
    const row = store.r8.r7.decisions.find((item) => item.decisionContextId === subjectId && item.contextId === context.contextId);
    if (!row || row.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || row.provenanceRef !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
    currentOk(row.recordStatus);
  } else if (kind === "CHANGE") {
    const row = store.r8.r7.changes.find((item) => item.changeContextId === subjectId && item.contextId === context.contextId);
    if (!row || row.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || row.provenanceRef !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
    currentOk(row.recordStatus);
  } else {
    const row = store.r8.handoffs.find((item) => item.handoffId === subjectId && item.contextId === context.contextId);
    if (!row || row.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || row.sourceRevision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
    currentOk(row.recordStatus);
  }
  return { subjectKind: kind, subjectId, subjectRevision, subjectFingerprint, contextId: context.contextId };
}

function evidenceIds(store: D3R9Store, actor: D3R9Actor, contextId: string, ids: readonly string[] | undefined): string[] {
  if (!Array.isArray(ids) || ids.length === 0) fail("EVIDENCE_REFERENCE_REQUIRED");
  const unique = [...new Set(ids.map((id) => explicit(id, "EVIDENCE_REFERENCE_REQUIRED")))].sort();
  for (const id of unique) {
    const evidence = store.r8.r7.r6.r5.r4.r3.r2.evidence.find((row) => row.evidenceReferenceId === id);
    if (!evidence || evidence.contextId !== contextId || evidence.tenantId !== actor.tenantId) fail("EVIDENCE_REFERENCE_REQUIRED");
  }
  return unique;
}

function samePin(left: D3R9SubjectPin, right: D3R9SubjectPin): boolean {
  return left.subjectKind === right.subjectKind && left.subjectId === right.subjectId && left.subjectRevision === right.subjectRevision && left.subjectFingerprint === right.subjectFingerprint && left.contextId === right.contextId;
}

function remember(store: D3R9Store, subjectKind: D3R9History["subjectKind"], subjectId: string, action: D3R9History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function snapshot(store: D3R9Store): string {
  const objects = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.map((row) => row.objectId + row.fingerprint + row.recordStatus + row.provenanceRef).join("|");
  const evidence = store.r8.r7.r6.r5.r4.r3.r2.evidence.map((row) => row.evidenceReferenceId + row.fingerprint + row.recordStatus).join("|");
  const requirements = store.r8.r7.requirements.map((row) => row.requirementContextId + row.fingerprint + row.recordStatus).join("|");
  const assumptions = store.r8.r7.assumptions.map((row) => row.assumptionContextId + row.fingerprint + row.recordStatus).join("|");
  const decisions = store.r8.r7.decisions.map((row) => row.decisionContextId + row.fingerprint + row.recordStatus).join("|");
  const changes = store.r8.r7.changes.map((row) => row.changeContextId + row.fingerprint + row.recordStatus + String(row.reassessmentRequired)).join("|");
  const handoffs = store.r8.handoffs.map((row) => row.handoffId + row.fingerprint + row.recordStatus + row.sourceRevision).join("|");
  return `${objects}#${evidence}#${requirements}#${assumptions}#${decisions}#${changes}#${handoffs}#${store.r8.r7.reassessments.length}`;
}

function requireChange(store: D3R9Store, actor: D3R9Actor, contextId: string, changeContextId: string): D3R7ChangeRecord {
  const id = explicit(changeContextId, "CHANGE_REFERENCE_REQUIRED");
  const change = store.r8.r7.changes.find((row) => row.changeContextId === id && row.contextId === contextId);
  if (!change || change.tenantId !== actor.tenantId || change.recordStatus !== "CURRENT") fail("CHANGE_REFERENCE_REQUIRED");
  if (!(D3_R7_CHANGE_CATEGORIES as readonly string[]).includes(change.changeCategory) || change.reassessmentRequired !== true) fail("CHANGE_REFERENCE_REQUIRED");
  return change;
}

function guardPredecessor(predecessor: { tenantId: string; recordStatus: string } | null | undefined, requested: string | null | undefined, actor: D3R9Actor, pin: D3R9SubjectPin, predecessorPin: D3R9SubjectPin | null, cited: Currentness, transferCode: string): void {
  if (requested && !predecessor) fail("PREDECESSOR_NOT_FOUND");
  if (!predecessor || !predecessorPin) return;
  if (predecessor.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (!samePin(predecessorPin, pin)) fail(transferCode);
  if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  if (cited !== "STALE" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
}

export function createD3R9Store(r8: D3R8Store, now: () => string = () => r8.now()): D3R9Store {
  return { r8, now, requests: [], findings: [], completions: [], validations: [], history: [] };
}

export function recordGeotechnicalReviewRequest(store: D3R9Store, actor: D3R9Actor, input: D3R9ReviewRequestInput): D3R9ReviewRequestRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const pin = pinSubject(store, actor, input, cited);
  const reviewType = explicit(input.reviewType, "REVIEW_TYPE_REQUIRED");
  if (!(D3_R9_REVIEW_TYPES as readonly string[]).includes(reviewType)) fail("REVIEW_TYPE_INVALID");
  if (reviewType === "INTERFACE_HANDOFF_REVIEW" && pin.subjectKind !== "HANDOFF") fail("HANDOFF_SUBJECT_REQUIRED");
  const requestedReviewerAuthority = explicit(input.requestedReviewerAuthority, "REVIEWER_AUTHORITY_REQUIRED");
  if (requestedReviewerAuthority !== "REVIEWER" || !(D3_AUTHORITY_ROLES as readonly string[]).includes(requestedReviewerAuthority)) fail("REVIEWER_AUTHORITY_REQUIRED");
  const reviewScope = explicit(input.reviewScope, "REVIEW_SCOPE_REQUIRED");
  const purpose = explicit(input.purpose, "REVIEW_PURPOSE_REQUIRED");
  const evidenceReferenceIds = evidenceIds(store, actor, pin.contextId, input.evidenceReferenceIds);
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const requestedAt = explicit(input.requestedAt, "REQUESTED_AT_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const fingerprint = fingerprintCanonical({
    reviewRequestId, ...pin, reviewType, reviewScope, purpose, requestedReviewerAuthority, evidenceReferenceIds, limitations, requestedAt, citedCurrentness: cited, provenanceRef, predecessorReviewRequestId: input.predecessorReviewRequestId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requests.find((row) => row.reviewRequestId === reviewRequestId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("REVIEW_REQUEST_ALREADY_RECORDED");
  const predecessor = input.predecessorReviewRequestId ? store.requests.find((row) => row.reviewRequestId === input.predecessorReviewRequestId) : null;
  guardPredecessor(predecessor, input.predecessorReviewRequestId, actor, pin, predecessor ?? null, cited, "REVIEW_TRANSFER_REJECTED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${reviewType}`;
  if (store.requests.some((row) => row.recordStatus === "CURRENT" && row.reviewRequestId !== predecessor?.reviewRequestId && row.contextId === pin.contextId && `${row.subjectKind}|${row.subjectId}|${row.subjectRevision}|${row.reviewType}` === signature)) fail("DUPLICATE_REVIEW_REQUEST_REJECTED");
  const before = snapshot(store);
  const record: D3R9ReviewRequestRecord = Object.freeze({
    reviewRequestId,
    ...pin,
    reviewType: reviewType as D3R9ReviewRequestRecord["reviewType"],
    reviewScope,
    purpose,
    requestStatus: "REQUESTED",
    reviewCompleted: false,
    engineeringValidated: false,
    conformant: false,
    engineeringApproved: false,
    certified: false,
    requestedReviewerAuthority: "REVIEWER",
    requesterId: actor.actorId,
    evidenceReferenceIds,
    limitations,
    requestedAt,
    citedCurrentness: cited,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorReviewRequestId: predecessor?.reviewRequestId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.requests.findIndex((row) => row.reviewRequestId === predecessor.reviewRequestId);
    store.requests[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    remember(store, "REVIEW_REQUEST", predecessor.reviewRequestId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.requests.push(record);
  remember(store, "REVIEW_REQUEST", record.reviewRequestId, "CREATED", record.fingerprint);
  if (snapshot(store) !== before) fail("SUBJECT_MUTATION_REJECTED");
  return record;
}

export function recordGeotechnicalReviewFinding(store: D3R9Store, actor: D3R9Actor, input: D3R9FindingInput): D3R9FindingRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const pin = pinSubject(store, actor, input, cited);
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
  if (!request || request.tenantId !== actor.tenantId || request.workspaceId !== actor.workspaceId || request.projectId !== actor.projectId) fail("REVIEW_REQUEST_NOT_FOUND");
  if (!samePin(request, pin)) fail("FINDING_SUBJECT_MISMATCH");
  const findingCategory = explicit(input.findingCategory, "FINDING_CATEGORY_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(findingCategory) || !(D3_R9_FINDING_CATEGORIES as readonly string[]).includes(findingCategory)) fail("FINDING_CATEGORY_INVALID");
  const severity = explicit(input.severity, "FINDING_SEVERITY_REQUIRED");
  if (!(PRE_ISSUE_MATERIALITY as readonly string[]).includes(severity)) fail("FINDING_SEVERITY_INVALID");
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(disposition) || !(D3_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory === "REASSESSMENT_RECOMMENDATION" && disposition !== "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory !== "REASSESSMENT_RECOMMENDATION" && disposition === "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  const findingText = explicit(input.findingText, "FINDING_TEXT_REQUIRED");
  const affectedObjectId = explicit(input.affectedObjectId, "AFFECTED_OBJECT_REQUIRED");
  const affected = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === affectedObjectId && row.contextId === pin.contextId && row.tenantId === actor.tenantId);
  if (!affected) fail("AFFECTED_OBJECT_REQUIRED");
  const evidenceReferenceIds = evidenceIds(store, actor, pin.contextId, input.evidenceReferenceIds);
  const change = findingCategory === "REASSESSMENT_RECOMMENDATION" ? requireChange(store, actor, pin.contextId, input.changeContextId ?? "") : null;
  if (change == null && input.changeContextId) fail("CHANGE_REFERENCE_UNEXPECTED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const findingId = explicit(input.findingId, "FINDING_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({
    findingId, reviewRequestId, ...pin, findingCategory, severity, findingText, disposition, affectedObjectId, changeContextId: change?.changeContextId ?? null, evidenceReferenceIds, limitations, citedCurrentness: cited, provenanceRef, reviewerId: actor.actorId,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.findings.find((row) => row.findingId === findingId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINDING_ALREADY_RECORDED");
  const signature = `${reviewRequestId}|${pin.subjectId}|${pin.subjectRevision}|${findingCategory}|${findingText}`;
  if (store.findings.some((row) => row.contextId === pin.contextId && `${row.reviewRequestId}|${row.subjectId}|${row.subjectRevision}|${row.findingCategory}|${row.findingText}` === signature)) fail("DUPLICATE_FINDING_REJECTED");
  const before = snapshot(store);
  const record: D3R9FindingRecord = Object.freeze({
    findingId,
    reviewRequestId,
    ...pin,
    findingCategory: findingCategory as FindingCategory,
    severity: severity as D3R9FindingRecord["severity"],
    findingText,
    disposition: disposition as D3R9FindingRecord["disposition"],
    affectedObjectId,
    changeContextId: change?.changeContextId ?? null,
    evidenceReferenceIds,
    nonconformanceCandidate: findingCategory === "NONCONFORMANCE_CANDIDATE",
    conformanceDetermined: false,
    engineeringInvalid: false,
    engineeringValidated: false,
    reviewerId: actor.actorId,
    reviewerAuthority: "REVIEWER",
    limitations,
    citedCurrentness: cited,
    provenanceRef,
    fingerprint,
    aal: "aal2",
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  store.findings.push(record);
  remember(store, "FINDING", record.findingId, "CREATED", record.fingerprint);
  if (snapshot(store) !== before) fail("SUBJECT_MUTATION_REJECTED");
  if (request.reviewCompleted !== false || request.engineeringValidated !== false) fail("REVIEW_REQUEST_NOT_COMPLETION");
  return record;
}

export function recordGeotechnicalReviewCompletion(store: D3R9Store, actor: D3R9Actor, input: D3R9CompletionInput): D3R9CompletionRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const pin = pinSubject(store, actor, input, cited);
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
  if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
  if (request.reviewCompleted !== false || request.engineeringValidated !== false) fail("REVIEW_REQUEST_NOT_COMPLETION");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const completionId = explicit(input.completionId, "COMPLETION_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({
    completionId, reviewRequestId, ...pin, limitations, citedCurrentness: cited, provenanceRef, reviewerId: actor.actorId, predecessorCompletionId: input.predecessorCompletionId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.completions.find((row) => row.completionId === completionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("COMPLETION_ALREADY_RECORDED");
  const predecessor = input.predecessorCompletionId ? store.completions.find((row) => row.completionId === input.predecessorCompletionId) : null;
  guardPredecessor(predecessor, input.predecessorCompletionId, actor, pin, predecessor ?? null, cited, "REVIEW_TRANSFER_REJECTED");
  const signature = `${reviewRequestId}|${pin.subjectId}|${pin.subjectRevision}`;
  if (store.completions.some((row) => row.recordStatus === "CURRENT" && row.completionId !== predecessor?.completionId && row.contextId === pin.contextId && `${row.reviewRequestId}|${row.subjectId}|${row.subjectRevision}` === signature)) fail("DUPLICATE_COMPLETION_REJECTED");
  const before = snapshot(store);
  const record: D3R9CompletionRecord = Object.freeze({
    completionId,
    reviewRequestId,
    ...pin,
    reviewCompleted: true,
    engineeringValidated: false,
    conformant: false,
    engineeringApproved: false,
    certified: false,
    counterpartDisciplineValidated: false,
    d1Validated: false,
    d2Validated: false,
    reviewerId: actor.actorId,
    reviewerAuthority: "REVIEWER",
    limitations,
    citedCurrentness: cited,
    provenanceRef,
    fingerprint,
    aal: "aal2",
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorCompletionId: predecessor?.completionId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.completions.findIndex((row) => row.completionId === predecessor.completionId);
    store.completions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    remember(store, "COMPLETION", predecessor.completionId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.completions.push(record);
  remember(store, "COMPLETION", record.completionId, "CREATED", record.fingerprint);
  if (snapshot(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false) fail("SUBJECT_MUTATION_REJECTED");
  return record;
}

export function recordGeotechnicalValidationState(store: D3R9Store, actor: D3R9Actor, input: D3R9ValidationInput): D3R9ValidationRecord {
  if ((blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") && (input.validationState === "VALIDATED" || input.automaticValidation === true)) fail("AI_CANNOT_VALIDATE");
  if ((actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") && (input.validationState === "VALIDATED" || input.automaticValidation === true)) fail("ADMIN_CANNOT_VALIDATE");
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const pin = pinSubject(store, actor, input, cited);
  const validationState = explicit(input.validationState, "VALIDATION_STATE_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(validationState) || !(D3_R9_VALIDATION_STATES as readonly string[]).includes(validationState)) fail("VALIDATION_STATE_INVALID");
  if (validationState === "STALE" && cited !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "REASSESSMENT_REQUIRED" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && cited !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  const requiredEvidenceReferenceIds = evidenceIds(store, actor, pin.contextId, input.requiredEvidenceReferenceIds);
  const evidenceActuallyPresent = evidenceIds(store, actor, pin.contextId, input.evidenceReferenceIds);
  if (validationState === "VALIDATED" && requiredEvidenceReferenceIds.some((id) => !evidenceActuallyPresent.includes(id))) fail("EVIDENCE_REQUIRED_FOR_VALIDATION");
  const change = validationState === "REASSESSMENT_REQUIRED" ? requireChange(store, actor, pin.contextId, input.changeContextId ?? "") : null;
  if (change == null && input.changeContextId) fail("CHANGE_REFERENCE_UNEXPECTED");
  const validationScope = explicit(input.validationScope, "VALIDATION_SCOPE_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const validationId = explicit(input.validationId, "VALIDATION_ID_REQUIRED");
  const reviewRequestId = input.reviewRequestId ? explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") : null;
  if (reviewRequestId) {
    const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
    if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
    if (request.reviewCompleted !== false) fail("REVIEW_REQUEST_NOT_COMPLETION");
  }
  const engineeringValidated = validationState === "VALIDATED";
  const fingerprint = fingerprintCanonical({
    validationId, reviewRequestId, ...pin, validationScope, requiredEvidenceReferenceIds, evidenceActuallyPresent, validationState, changeContextId: change?.changeContextId ?? null, engineeringValidated, limitations, citedCurrentness: cited, provenanceRef, reviewerId: actor.actorId, predecessorValidationId: input.predecessorValidationId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.validations.find((row) => row.validationId === validationId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("VALIDATION_ALREADY_RECORDED");
  const predecessor = input.predecessorValidationId ? store.validations.find((row) => row.validationId === input.predecessorValidationId) : null;
  guardPredecessor(predecessor, input.predecessorValidationId, actor, pin, predecessor ?? null, cited, "VALIDATION_TRANSFER_REJECTED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${validationScope}|${validationState}`;
  if (store.validations.some((row) => row.recordStatus === "CURRENT" && row.validationId !== predecessor?.validationId && row.contextId === pin.contextId && `${row.subjectKind}|${row.subjectId}|${row.subjectRevision}|${row.validationScope}|${row.validationState}` === signature)) fail("DUPLICATE_VALIDATION_REJECTED");
  const before = snapshot(store);
  const record: D3R9ValidationRecord = Object.freeze({
    validationId,
    reviewRequestId,
    ...pin,
    validationScope,
    requiredEvidenceReferenceIds,
    evidenceActuallyPresent,
    validationState: validationState as D3R9ValidationRecord["validationState"],
    changeContextId: change?.changeContextId ?? null,
    engineeringValidated,
    conformant: false,
    engineeringApproved: false,
    certified: false,
    counterpartDisciplineValidated: false,
    d1Validated: false,
    d2Validated: false,
    reviewerId: actor.actorId,
    reviewerAuthority: "REVIEWER",
    limitations,
    citedCurrentness: cited,
    provenanceRef,
    fingerprint,
    aal: "aal2",
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorValidationId: predecessor?.validationId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.validations.findIndex((row) => row.validationId === predecessor.validationId);
    store.validations[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    remember(store, "VALIDATION", predecessor.validationId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.validations.push(record);
  remember(store, "VALIDATION", record.validationId, "CREATED", record.fingerprint);
  if (snapshot(store) !== before) fail("SUBJECT_MUTATION_REJECTED");
  if (record.validationState === "STALE" && (record.citedCurrentness === "CURRENT" || record.engineeringValidated)) fail("STALE_VALIDATION_EXPOSED_AS_CURRENT");
  if (record.validationState === "REASSESSMENT_REQUIRED" && record.engineeringValidated) fail("REASSESSMENT_EXPOSED_AS_VALIDATED");
  return record;
}

export function mutateReviewedGeotechnicalSubject(): never {
  return fail("SUBJECT_MUTATION_REJECTED");
}

export function transferPriorGeotechnicalReview(): never {
  return fail("REVIEW_TRANSFER_REJECTED");
}

export function transferPriorGeotechnicalValidation(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}

export function repointGeotechnicalReview(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function automaticallyValidateGeotechnicalEngineering(): never {
  return fail("AUTOMATIC_VALIDATION_REJECTED");
}

export function approveGeotechnicalEngineering(): never {
  return fail("APPROVAL_NOT_IN_R9");
}

export function certifyGeotechnicalEngineering(): never {
  return fail("CERTIFICATION_NOT_IN_R9");
}

export function conformGeotechnicalEngineering(): never {
  return fail("CONFORMANCE_NOT_IN_R9");
}
