/**
 * EOS-D6-R9 Process review and validation governance.
 * One bounded runtime on exact R1-R8 revisions. Canonical review and validation governance only.
 * Review completion, finding closure, and evidence do not become validation, approval, or another discipline's truth.
 */
import {
  D6_CURRENTNESS_STATES,
  D6_IMPLEMENTATION_PHASE_TYPES,
  D6_IMPLEMENTATION_PHASES,
  D6_MATURITY_STATES,
  PROCESS_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  VALIDATED_PROCESS_RECORD_EQUALS_APPROVED,
  VALIDATED_PROCESS_RECORD_EQUALS_CERTIFIED,
  VALIDATED_PROCESS_RECORD_EQUALS_CONFORMANT,
} from "@rtb/types";
import {
  D2_R9_FINDING_DISPOSITIONS,
  D2_R9_REQUEST_STATUSES,
  D2_R9_SUBJECT_KINDS,
  D2_R9_VALIDATION_STATES,
  REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED,
} from "../civil/review-validation-governance";
import { assertHumanApprovalActor } from "../decision-intelligence/invariants";
import { D3_R9_FINDING_CATEGORIES } from "../geotechnical/review-validation-governance";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { FORBIDDEN_PRE_ISSUE_VERDICTS, PRE_ISSUE_AI_BOUNDARY, PRE_ISSUE_MATERIALITY } from "../pre-issue-review/types";
import { resolveAuthAssuranceLevel } from "../security-closure/privileged-mfa";
import { D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED } from "../structural-systems/interface-handoff-governance";
import { D6_CONTEXT_AUTHORITY, D6_DISCIPLINE, type D6R1Actor } from "./identity-foundation";
import { EXTERNAL_PROCESS_EVIDENCE_EQUALS_EOS_VALIDATION } from "./process-evidence-balances";
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
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
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
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT as R8_REVIEW_COUNT,
  D6_RUNTIME_COUNT as R8_RUNTIME_COUNT,
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
  PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION,
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
  type D6R8Store,
} from "./discipline-interfaces-handoffs";

export const D6_R9_STATUS = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D6_R9_MATURITY = D6_R9_STATUS;
export const D6_R9_MATURITY_STATE = D6_R9_STATUS;
export const D6_R9_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D6_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md" as const;
export const D6_RUNTIME_STARTED = true as const;
export const D6_RUNTIME_COUNT = 9 as const;
export const D6_R8_RUNTIME_COUNT = R8_RUNTIME_COUNT;
export const D6_R8_REVIEW_VALIDATION_RUNTIME_COUNT = R8_REVIEW_COUNT;
export const D6_REVIEW_VALIDATION_RUNTIME_IMPLEMENTED = true as const;
export const D6_REVIEW_VALIDATION_RUNTIME_COUNT = 1 as const;
export const D6_REVIEW_VALIDATION_RUNTIME_READY = true as const;
export const D6_R1_R8_EXACT_SOURCE_REVISIONS_REUSED = true as const;
export const EXACT_D6_REVIEW_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D6_REVIEW_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D6_REVIEW_SUBJECT_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D6_REUSES_CANONICAL_REVIEW_GOVERNANCE = true as const;
export const D6_REUSES_CANONICAL_VALIDATION_GOVERNANCE = true as const;
export const PARALLEL_D6_REVIEW_ENGINE_CREATED = false as const;
export const PARALLEL_D6_VALIDATION_ENGINE_CREATED = false as const;
export const D6_PROCESS_REVIEW_REQUEST_IMPLEMENTED = true as const;
export const REVIEW_REQUESTED_EQUALS_REVIEW_COMPLETED = REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED;
export const REVIEW_REQUESTED_EQUALS_VALIDATED = REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED;
export const D6_REVIEWER_AUTHORITY_REQUIRED = true as const;
export const D6_REVIEWER_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D6_PROCESS_ENGINEERING_REVIEWER_AUTHORITY = false as const;
export const ADMIN_EQUALS_D6_PROCESS_ENGINEERING_REVIEWER_AUTHORITY = false as const;
export const D6_PROCESS_REVIEW_FINDING_IMPLEMENTED = true as const;
export const REVIEW_FINDING_EQUALS_PROCESS_DESIGN_INVALID = false as const;
export const REVIEW_FINDING_EQUALS_VALIDATION_FAILURE = false as const;
export const D6_PROCESS_FINDING_DISPOSITION_IMPLEMENTED = true as const;
export const FINDING_CLOSED_EQUALS_VALIDATED = false as const;
export const FINDING_ACCEPTED_EQUALS_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const FINDING_DISPOSITION_EQUALS_CONFORMANCE = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const D6_PROCESS_REVIEW_COMPLETION_IMPLEMENTED = true as const;
export const REVIEW_COMPLETED_EQUALS_VALIDATED = REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED;
export const REVIEW_COMPLETED_EQUALS_CONFORMANT = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const REVIEW_COMPLETED_EQUALS_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const REVIEW_COMPLETED_EQUALS_CERTIFIED = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const D6_PROCESS_VALIDATION_STATE_IMPLEMENTED = true as const;
export const VALIDATED_EQUALS_CONFORMANT = VALIDATED_PROCESS_RECORD_EQUALS_CONFORMANT;
export const VALIDATED_EQUALS_APPROVED = VALIDATED_PROCESS_RECORD_EQUALS_APPROVED;
export const VALIDATED_EQUALS_CERTIFIED = VALIDATED_PROCESS_RECORD_EQUALS_CERTIFIED;
export const VALIDATED_EQUALS_REGULATORY_APPROVED = false as const;
export const D6_R9_AUTO_VALIDATES_PROCESS_ENGINEERING = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const D6_R9_AUTO_VALIDATES_FROM_REVIEW_COMPLETION = false as const;
export const D6_R9_AUTO_VALIDATES_FROM_FINDING_CLOSURE = false as const;
export const D6_R9_AUTO_VALIDATES_FROM_EXTERNAL_EVIDENCE = false as const;
export const D6_R9_AUTO_VALIDATES_FROM_REASSESSMENT_COMPLETION = false as const;
export const D6_VALIDATION_AUTHORITY_REQUIRED = true as const;
export const D6_VALIDATION_AUTHORITY_TRACEABLE = true as const;
export const AI_EQUALS_D6_VALIDATION_AUTHORITY = false as const;
export const ADMIN_EQUALS_D6_VALIDATION_AUTHORITY = false as const;
export const D6_R7_REASSESSMENT_REVIEW_INTEGRATION_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_APPROVED = false as const;
export const D6_R7_CHANGE_REVIEW_INTEGRATION_IMPLEMENTED = true as const;
export const PRIOR_D6_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const PRIOR_D6_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const STALE_D6_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D6_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const REASSESSMENT_REQUIRED_D6_RECORD_EXPOSED_AS_VALIDATED = false as const;
export const D6_R8_INTERFACE_REVIEW_CONTEXT_SUPPORTED = true as const;
export const D6_REVIEW_OF_HANDOFF_EQUALS_COUNTERPART_VALIDATION = false as const;
export const D6_VALIDATION_OF_HANDOFF_EQUALS_COUNTERPART_ENGINEERING_VALIDATED = false as const;
export const D6_R9_VALIDATES_D4_MECHANICAL_ENGINEERING = false as const;
export const D6_R9_VALIDATES_D5_PIPING_ENGINEERING = false as const;
export const D6_R9_VALIDATES_D7_ELECTRICAL_ENGINEERING = false as const;
export const D6_R9_VALIDATES_D8_IAC_ENGINEERING = false as const;
export const D6_R9_VALIDATES_D4_EQUIPMENT_SELECTION = false as const;
export const EXTERNAL_PROCESS_EVIDENCE_EQUALS_PROCESS_VALIDATION = EXTERNAL_PROCESS_EVIDENCE_EQUALS_EOS_VALIDATION;
export const EXTERNAL_TOOL_RESULT_EQUALS_PROCESS_VALIDATION = false as const;
export const RELIEF_SCENARIO_EQUALS_RELIEF_DEVICE_VALIDATED = false as const;
export const SAFEGUARD_REQUIREMENT_EQUALS_SIF_VALIDATED = false as const;
export const D6_VALIDATION_AUTO_APPROVES_ENGINEERING = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const D6_VALIDATION_AUTO_CERTIFIES_ENGINEERING = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const D6_VALIDATION_AUTO_DETERMINES_CONFORMANCE = PRE_ISSUE_AI_BOUNDARY.mayDeclareCodeCompliance;
export const D6_R9_HISTORY_PRESERVED = true as const;
export const D6_R9_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const SILENT_D6_R9_MUTATION_ALLOWED = false as const;
export const D6_R9_PROVENANCE_REQUIRED = true as const;
export const D6_R9_PROVENANCE_PRESERVED = true as const;
export const D6_R9_SOURCE_BASIS_REQUIRED = true as const;
export const D6_R9_SOURCE_BASIS_TRACEABLE = true as const;
export const TENANT_WORKSPACE_PROJECT_D6_R9_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D6_R9_ACCESS_ALLOWED = false as const;
export const AI_CAN_CLOSE_D6_REVIEW_AS_ENGINEERING_VALIDATED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const AI_CAN_SET_AUTHORITATIVE_D6_VALIDATION_STATE = false as const;
export const ADMIN_CAN_PROMOTE_D6_REVIEW_TO_VALIDATION = false as const;
export const D6_R9_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D6_R9_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D6_R9_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_R9_REQUEST_STATUSES = D2_R9_REQUEST_STATUSES;
export const D6_R9_FINDING_DISPOSITIONS = D2_R9_FINDING_DISPOSITIONS;
export const D6_R9_VALIDATION_STATES = D2_R9_VALIDATION_STATES;
export const D6_R9_SUBJECT_KINDS = [...D2_R9_SUBJECT_KINDS, "CONDITION", "EVIDENCE", "DUTY", "SAFETY"] as const;
export const D6_R9_REVIEW_TYPES = ["PROCESS_SUBJECT_REVIEW", "INTERFACE_HANDOFF_REVIEW"] as const;
export const D6_R9_FINDING_CATEGORIES = D3_R9_FINDING_CATEGORIES;
export const D6_R9_BASIS_KINDS = ["R3_CONDITION", "R4_EVIDENCE", "R5_DUTY", "R6_SAFETY", "R7_REQUIREMENT", "R7_DECISION", "R7_REASSESSMENT", "R8_HANDOFF"] as const;
export const D6_R9_VALIDATION_AUTHORITY = "PROCESS_VALIDATION_AUTHORITY" as const;
export const D6_R9_REVIEW_AI_BOUNDARY_REUSED = PRE_ISSUE_AI_BOUNDARY;
export const D6_R10_CANONICAL_PHASE = D6_IMPLEMENTATION_PHASES[9];
export const D6_R10_PHASE_TYPE = D6_IMPLEMENTATION_PHASE_TYPES[9];
export const D6_R10_CANONICAL_SCOPE =
  "Integrate canonical currentness, supersession, explicit lineage, digital-thread and fingerprint governance across exact D6 R1-R9 revisions. Ensure stale/superseded records and validation states are not exposed as current, historical references are never auto-repointed, R7 reassessment and R8 handoff currentness are integrated, and R9 review/validation state is revision-bound. Do not add a parallel currentness/thread/fingerprint system, Process calculations, D9 runtime or cross-discipline reasoning." as const;
export const D6_R10_STARTED = false as const;
export const D6_R9_READY_FOR_NEXT_PHASE = true as const;
export const D6_R9_NEXT_PHASE = D6_R10_CANONICAL_PHASE;
export const D6_R9_NEXT_PHASE_TYPE = D6_R10_PHASE_TYPE;
export const D6_R9_CANONICAL_NEXT_PHASE = D6_R10_CANONICAL_PHASE;
export const D6_R9_CANONICAL_NEXT_PHASE_SCOPE = D6_R10_CANONICAL_SCOPE;
export const D6_R9_BLOCKER = "NONE" as const;
export const D6_R9_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const UNAUTHORIZED_D6_R10_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_VALIDATION = false as const;
export const UNAUTHORIZED_REVIEW_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_FINDING_CLOSURE_TO_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_VALIDATION_TRANSFER_TO_NEW_REVISION = false as const;
export const UNAUTHORIZED_COUNTERPART_DISCIPLINE_VALIDATION = false as const;
export const UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_CERTIFICATION_PROMOTION = false as const;

export {
  PROCESS_SAFETY_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  PROCESS_EQUIPMENT_REQUIREMENT_EQUALS_VALIDATED_MECHANICAL_SELECTION,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_EQUIPMENT_DUTY_RUNTIME_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D6_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_APPROVAL_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
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
const FORBIDDEN = new Set<string>(FORBIDDEN_PRE_ISSUE_VERDICTS);
const CLOSED = new Set(["closed", "accepted", "approved", "validated", "conformant", "certified"]);

type Currentness = (typeof D6_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D6_R9_SUBJECT_KINDS)[number];
type Prohibited = {
  automaticValidation?: boolean;
  validated?: boolean;
  reviewCompleted?: boolean;
  closeFindingAsValidated?: boolean;
  closeReassessmentAsValidated?: boolean;
  evidenceEqualsValidation?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  repoint?: boolean;
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  validateCounterpart?: boolean;
  validateMechanical?: boolean;
  validatePiping?: boolean;
  validateElectrical?: boolean;
  validateIac?: boolean;
  functionalSafety?: boolean;
  reliefDeviceValidated?: boolean;
  sifValidated?: boolean;
  mechanicalSelection?: boolean;
  mutateUpstream?: boolean;
  d9Reasoning?: boolean;
  reasonAcrossDisciplines?: boolean;
};

export type D6R9Actor = D6R1Actor & { actorKind?: "human" | "ai"; aal?: string; amr?: string[] };

type SourcePin = {
  objectId: string;
  subjectObjectId?: string;
  fingerprint: string;
  provenanceRef: string;
  recordStatus: string;
  currentness: string;
  tenantId: string;
};

export type D6R9SubjectPin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2Kind: "STREAM" | "SYSTEM";
  r2RecordId: string;
  r2Fingerprint: string;
  subjectRecordStatus: string;
  subjectCurrentness: string;
};

type Basis = { kind: (typeof D6_R9_BASIS_KINDS)[number]; id: string; fingerprint: string };

type Governed = D6R9SubjectPin & {
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  citedCurrentness: Currentness;
  currentness: Currentness;
  citedLifecycleStage: (typeof D6_MATURITY_STATES)[number];
  fingerprint: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  engineeringValidated: boolean;
  conformant: false;
  approved: false;
  certified: false;
  counterpartValidated: false;
  evidenceEqualsValidation: false;
  functionalSafetyValidated: false;
  reliefDeviceValidated: false;
  sifValidated: false;
  mechanicalSelectionValidated: false;
  deleted: false;
  invalidated: false;
  createdAt: string;
  createdBy: string;
};

export type D6R9ReviewRequestRecord = Governed & {
  reviewRequestId: string;
  reviewType: (typeof D6_R9_REVIEW_TYPES)[number];
  reviewScope: string;
  requestStatus: (typeof D6_R9_REQUEST_STATUSES)[number];
  requestedReviewerAuthority: "REVIEWER";
  reviewCompleted: false;
  predecessorReviewRequestId: string | null;
  predecessorFingerprint: string | null;
};

export type D6R9FindingRecord = Governed & {
  findingId: string;
  reviewRequestId: string;
  findingCategory: (typeof D6_R9_FINDING_CATEGORIES)[number];
  severity: (typeof PRE_ISSUE_MATERIALITY)[number];
  findingText: string;
  disposition: (typeof D6_R9_FINDING_DISPOSITIONS)[number];
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  engineeringInvalid: false;
};

export type D6R9DispositionRecord = Governed & {
  dispositionId: string;
  findingId: string;
  disposition: (typeof D6_R9_FINDING_DISPOSITIONS)[number];
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  changeId: string | null;
  changeFingerprint: string | null;
  reassessmentId: string | null;
  reassessmentFingerprint: string | null;
};

export type D6R9CompletionRecord = Governed & {
  completionId: string;
  reviewRequestId: string;
  reviewCompleted: true;
  reviewerId: string;
  reviewerAuthority: "REVIEWER";
  predecessorCompletionId: string | null;
  predecessorFingerprint: string | null;
};

export type D6R9ValidationRecord = Governed & {
  validationId: string;
  validationScope: string;
  validationState: (typeof D6_R9_VALIDATION_STATES)[number];
  validationAuthority: typeof D6_R9_VALIDATION_AUTHORITY;
  validatorId: string;
  basis: Basis[];
  reviewRequestId: string | null;
  changeId: string | null;
  changeFingerprint: string | null;
  reassessmentId: string | null;
  reassessmentFingerprint: string | null;
  predecessorValidationId: string | null;
  predecessorFingerprint: string | null;
};

export type D6R9History = {
  historyId: string;
  subjectKind: "REQUEST" | "FINDING" | "DISPOSITION" | "COMPLETION" | "VALIDATION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D6R9Store = {
  r8: D6R8Store;
  now: () => string;
  requests: D6R9ReviewRequestRecord[];
  findings: D6R9FindingRecord[];
  dispositions: D6R9DispositionRecord[];
  completions: D6R9CompletionRecord[];
  validations: D6R9ValidationRecord[];
  history: D6R9History[];
};

type Chain = {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2Kind: string;
  r2RecordId: string;
  r2Fingerprint: string;
  subjectKind: string;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

function fail(code: string): never {
  throw new Error(`D6_R9_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function sameScope(row: { tenantId: string; workspaceId: string; projectId: string }, actor: D6R9Actor): boolean {
  return row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId;
}

function assertScope(actor: D6R9Actor, input: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (explicit(input.tenantId, "SCOPE_REQUIRED") !== actor.tenantId || explicit(input.workspaceId, "SCOPE_REQUIRED") !== actor.workspaceId || explicit(input.projectId, "SCOPE_REQUIRED") !== actor.projectId) {
    fail("SCOPE_MISMATCH");
  }
}

function assertHuman(actor: D6R9Actor, code: string): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.actorKind === "ai") fail(code);
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") fail(code);
  if (actor.authority === "PROCESS_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertRecorder(actor: D6R9Actor): void {
  assertHuman(actor, "AI_NOT_PROCESS_AUTHORITY");
  if (actor.authority !== D6_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
}

function assertReviewer(actor: D6R9Actor): void {
  assertHuman(actor, "AI_NOT_PROCESS_REVIEWER");
  if (actor.authority !== "REVIEWER" || actor.actorKind !== "human") fail("REVIEWER_AUTHORITY_REQUIRED");
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function assertValidator(actor: D6R9Actor): void {
  assertHuman(actor, "AI_NOT_VALIDATION_AUTHORITY");
  if (actor.authority !== D6_R9_VALIDATION_AUTHORITY || actor.actorKind !== "human") fail("VALIDATION_AUTHORITY_REQUIRED");
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function assertProhibited(input: Prohibited): void {
  if (input.automaticValidation === true || input.validated === true) fail("AUTOMATIC_VALIDATION_REJECTED");
  if (input.reviewCompleted === true) fail("REVIEW_REQUEST_NOT_COMPLETION");
  if (input.closeFindingAsValidated === true) fail("FINDING_CLOSURE_NOT_VALIDATION");
  if (input.closeReassessmentAsValidated === true) fail("REASSESSMENT_NOT_VALIDATION");
  if (input.evidenceEqualsValidation === true) fail("EVIDENCE_NOT_VALIDATION");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R9");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R9");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R9");
  if (input.validateCounterpart === true || input.validateMechanical === true || input.validatePiping === true || input.validateElectrical === true || input.validateIac === true) {
    fail("COUNTERPART_VALIDATION_REJECTED");
  }
  if (input.functionalSafety === true || input.reliefDeviceValidated === true || input.sifValidated === true) fail("SAFETY_VALIDATION_REJECTED");
  if (input.mechanicalSelection === true) fail("MECHANICAL_SELECTION_NOT_VALIDATED");
  if (input.mutateUpstream === true) fail("UPSTREAM_MUTATION_REJECTED");
  if (input.d9Reasoning === true || input.reasonAcrossDisciplines === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R9");
}

function locate(store: D6R8Store, kind: string, id: string): SourcePin | undefined {
  const r7 = store.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r3.r2;
  const r1 = r2.r1;
  if (kind === "OBJECT") return r1.objects.find((row) => row.objectId === id);
  if (kind === "CONDITION") return r3.conditions.find((row) => row.conditionId === id);
  if (kind === "EVIDENCE") return r4.evidence.find((row) => row.evidenceId === id);
  if (kind === "DUTY") return r5.duties.find((row) => row.requirementId === id);
  if (kind === "SAFETY") return r6.records.find((row) => row.recordId === id);
  if (kind === "REQUIREMENT") return r7.requirements.find((row) => row.requirementId === id);
  if (kind === "ASSUMPTION") return r7.assumptions.find((row) => row.assumptionId === id);
  if (kind === "DECISION") return r7.decisions.find((row) => row.decisionId === id);
  if (kind === "CHANGE") return r7.changes.find((row) => row.changeId === id);
  if (kind === "HANDOFF") return store.handoffs.find((row) => row.handoffId === id);
  return undefined;
}

function governedObject(row: SourcePin): string {
  return row.subjectObjectId ?? row.objectId;
}

function seal(store: D6R9Store): string {
  const r7 = store.r8.r7;
  return JSON.stringify({
    objects: r7.r6.r5.r4.r3.r2.r1.objects,
    streams: r7.r6.r5.r4.r3.r2.streams,
    conditions: r7.r6.r5.r4.r3.conditions,
    evidence: r7.r6.r5.r4.evidence,
    duties: r7.r6.r5.duties,
    safety: r7.r6.records,
    requirements: r7.requirements,
    changes: r7.changes,
    reassessments: r7.reassessments,
    handoffs: store.r8.handoffs,
  });
}

function bind(store: D6R9Store, actor: D6R9Actor, input: Chain, cited: Currentness): D6R9SubjectPin {
  const context = store.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === explicit(input.contextId, "R1_CONTEXT_REQUIRED"));
  if (!context || !sameScope(context, actor)) fail("R1_CONTEXT_NOT_FOUND");
  const object = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === explicit(input.objectId, "R1_OBJECT_REQUIRED"));
  if (!object || object.fingerprint !== explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED") || !sameScope(object, actor)) fail("R1_REVISION_MISMATCH");
  const r2Kind = explicit(input.r2Kind, "R2_KIND_REQUIRED");
  if (r2Kind !== "STREAM" && r2Kind !== "SYSTEM") fail("R2_KIND_INVALID");
  const r2Id = explicit(input.r2RecordId, "R2_RECORD_REQUIRED");
  const r2 = r2Kind === "STREAM"
    ? store.r8.r7.r6.r5.r4.r3.r2.streams.find((row) => row.streamRecordId === r2Id)
    : store.r8.r7.r6.r5.r4.r3.r2.systems.find((row) => row.systemRecordId === r2Id);
  if (!r2 || r2.fingerprint !== explicit(input.r2Fingerprint, "R2_REVISION_REQUIRED") || r2.objectId !== object.objectId || r2.tenantId !== actor.tenantId) fail("R2_REVISION_MISMATCH");
  const subjectKind = explicit(input.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D6_R9_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subject = locate(store.r8, subjectKind, subjectId);
  const subjectFingerprint = explicit(input.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const subjectRevision = explicit(input.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  if (!subject || subject.fingerprint !== subjectFingerprint || subject.provenanceRef !== subjectRevision || subject.tenantId !== actor.tenantId || governedObject(subject) !== object.objectId) {
    fail("SUBJECT_REVISION_MISMATCH");
  }
  if (cited === "CURRENT" && (subject.recordStatus !== "CURRENT" || object.recordStatus !== "CURRENT" || r2.recordStatus !== "CURRENT" || context.recordStatus !== "CURRENT")) fail("SUBJECT_NOT_CURRENT");
  return {
    subjectKind: subjectKind as SubjectKind,
    subjectId,
    subjectRevision: subject.provenanceRef,
    subjectFingerprint: subject.fingerprint,
    contextId: context.contextId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    r2Kind,
    r2RecordId: explicit(input.r2RecordId, "R2_RECORD_REQUIRED"),
    r2Fingerprint: r2.fingerprint,
    subjectRecordStatus: subject.recordStatus,
    subjectCurrentness: subject.currentness,
  };
}

function samePin(left: D6R9SubjectPin, right: D6R9SubjectPin): boolean {
  return left.subjectKind === right.subjectKind && left.subjectId === right.subjectId && left.subjectFingerprint === right.subjectFingerprint && left.subjectRevision === right.subjectRevision;
}

function remember(store: D6R9Store, subjectKind: D6R9History["subjectKind"], subjectId: string, action: D6R9History["action"], fingerprint: string): void {
  store.history.push({ historyId: `d6r9-history-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function governedFields(store: D6R9Store, actor: D6R9Actor, pin: D6R9SubjectPin, applicability: string, limitations: string, provenanceRef: string, sourceBasisRef: string, cited: Currentness, lifecycle: string, fingerprint: string, engineeringValidated: boolean): Omit<Governed, keyof D6R9SubjectPin> & D6R9SubjectPin {
  const stage = lifecycle.trim();
  if (!(D6_MATURITY_STATES as readonly string[]).includes(stage)) fail("LIFECYCLE_INVALID");
  if (!applicability.includes(pin.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return {
    ...pin,
    applicability,
    limitations,
    provenanceRef,
    sourceBasisRef,
    citedCurrentness: cited,
    currentness: cited,
    citedLifecycleStage: stage as Governed["citedLifecycleStage"],
    fingerprint,
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    engineeringValidated,
    conformant: false,
    approved: false,
    certified: false,
    counterpartValidated: false,
    evidenceEqualsValidation: false,
    functionalSafetyValidated: false,
    reliefDeviceValidated: false,
    sifValidated: false,
    mechanicalSelectionValidated: false,
    deleted: false,
    invalidated: false,
    createdAt: store.now(),
    createdBy: actor.actorId,
  };
}

function linkedReassessment(store: D6R9Store, actor: D6R9Actor, pin: D6R9SubjectPin, changeId: string | null | undefined, changeFingerprint: string | null | undefined, reassessmentId: string | null | undefined, reassessmentFingerprint: string | null | undefined) {
  const change = store.r8.r7.changes.find((row) => row.changeId === explicit(changeId ?? "", "CHANGE_REFERENCE_REQUIRED") && sameScope(row, actor));
  if (!change || change.fingerprint !== explicit(changeFingerprint ?? "", "CHANGE_REVISION_REQUIRED") || change.recordStatus !== "CURRENT") fail("CHANGE_REVISION_MISMATCH");
  if (!change.dependencies.some((link) => link.targetId === pin.subjectId && link.targetFingerprint === pin.subjectFingerprint)) fail("CHANGE_SUBJECT_NOT_EXPLICIT");
  const reassessment = store.r8.r7.reassessments.find((row) => row.reassessmentId === explicit(reassessmentId ?? "", "REASSESSMENT_REFERENCE_REQUIRED") && sameScope(row, actor));
  if (!reassessment || reassessment.fingerprint !== explicit(reassessmentFingerprint ?? "", "REASSESSMENT_REVISION_REQUIRED") || reassessment.changeId !== change.changeId || reassessment.targetId !== pin.subjectId || reassessment.targetFingerprint !== pin.subjectFingerprint) {
    fail("REASSESSMENT_REVISION_MISMATCH");
  }
  return { changeId: change.changeId, changeFingerprint: change.fingerprint, reassessmentId: reassessment.reassessmentId, reassessmentFingerprint: reassessment.fingerprint, engineeringValidated: reassessment.engineeringValidated };
}

function resolveBasis(store: D6R9Store, items: readonly { kind: string; id: string; fingerprint: string }[] | undefined, requireCurrent: boolean): Basis[] {
  const resolved: Basis[] = [];
  for (const item of items ?? []) {
    const kind = explicit(item.kind, "BASIS_KIND_REQUIRED");
    if (!(D6_R9_BASIS_KINDS as readonly string[]).includes(kind)) fail("BASIS_KIND_INVALID");
    const id = explicit(item.id, "BASIS_REFERENCE_REQUIRED");
    const fingerprint = explicit(item.fingerprint, "BASIS_REVISION_REQUIRED");
    const mapped = kind === "R3_CONDITION" ? "CONDITION" : kind === "R4_EVIDENCE" ? "EVIDENCE" : kind === "R5_DUTY" ? "DUTY" : kind === "R6_SAFETY" ? "SAFETY" : kind === "R7_REQUIREMENT" ? "REQUIREMENT" : kind === "R7_DECISION" ? "DECISION" : kind === "R7_REASSESSMENT" ? "REASSESSMENT" : "HANDOFF";
    const row = mapped === "REASSESSMENT"
      ? store.r8.r7.reassessments.find((entry) => entry.reassessmentId === id && entry.fingerprint === fingerprint)
      : locate(store.r8, mapped, id);
    if (!row || row.fingerprint !== fingerprint) fail("BASIS_REVISION_MISMATCH");
    if (requireCurrent && row.recordStatus !== "CURRENT") fail("BASIS_NOT_CURRENT");
    resolved.push({ kind: kind as Basis["kind"], id, fingerprint: row.fingerprint });
  }
  return resolved;
}

export function createD6R9Store(r8: D6R8Store, now: () => string = () => r8.now()): D6R9Store {
  return { r8, now, requests: [], findings: [], dispositions: [], completions: [], validations: [], history: [] };
}

export function currentProcessValidations(store: D6R9Store, actor: D6R9Actor): D6R9ValidationRecord[] {
  return store.validations.filter((row) => sameScope(row, actor) && row.recordStatus === "CURRENT" && row.currentness === "CURRENT" && row.validationState === "VALIDATED");
}

export function recordProcessReviewRequest(store: D6R9Store, actor: D6R9Actor, input: Prohibited & Chain & {
  reviewRequestId: string; reviewType: string; reviewScope: string; requestedReviewerAuthority: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null; predecessorReviewRequestId?: string | null;
}): D6R9ReviewRequestRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D6_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const reviewType = explicit(input.reviewType, "REVIEW_TYPE_REQUIRED");
  if (!(D6_R9_REVIEW_TYPES as readonly string[]).includes(reviewType)) fail("REVIEW_TYPE_INVALID");
  if (reviewType === "INTERFACE_HANDOFF_REVIEW" && pin.subjectKind !== "HANDOFF") fail("HANDOFF_SUBJECT_REQUIRED");
  if (explicit(input.requestedReviewerAuthority, "REVIEWER_AUTHORITY_REQUIRED") !== "REVIEWER") fail("REVIEWER_AUTHORITY_REQUIRED");
  const reviewScope = explicit(input.reviewScope, "REVIEW_SCOPE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const predecessor = input.predecessorReviewRequestId ? store.requests.find((row) => row.reviewRequestId === explicit(input.predecessorReviewRequestId ?? "", "REVIEW_REQUEST_REQUIRED")) : null;
  if (input.predecessorReviewRequestId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("REVIEW_REQUEST_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ reviewRequestId, ...pin, reviewType, reviewScope, requestedReviewerAuthority: "REVIEWER", applicability, limitations, cited, provenanceRef, sourceBasisRef, predecessorReviewRequestId: predecessor?.reviewRequestId ?? null, discipline: D6_DISCIPLINE });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requests.find((row) => row.reviewRequestId === reviewRequestId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("REVIEW_REQUEST_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${reviewType}`;
  if (store.requests.some((row) => row.recordStatus === "CURRENT" && row.reviewRequestId !== predecessor?.reviewRequestId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.reviewType}` === signature)) fail("DUPLICATE_REVIEW_REQUEST_REJECTED");
  if (predecessor) {
    const index = store.requests.findIndex((row) => row.reviewRequestId === predecessor.reviewRequestId);
    store.requests[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "REQUEST", predecessor.reviewRequestId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D6R9ReviewRequestRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, false),
    reviewRequestId, reviewType: reviewType as D6R9ReviewRequestRecord["reviewType"], reviewScope, requestStatus: "REQUESTED", requestedReviewerAuthority: "REVIEWER", reviewCompleted: false,
    predecessorReviewRequestId: predecessor?.reviewRequestId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  store.requests.push(record);
  remember(store, "REQUEST", record.reviewRequestId, "CREATED", record.fingerprint);
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordProcessReviewFinding(store: D6R9Store, actor: D6R9Actor, input: Prohibited & Chain & {
  findingId: string; reviewRequestId: string; findingCategory: string; severity: string; findingText: string; disposition: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null;
}): D6R9FindingRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D6_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const request = store.requests.find((row) => row.reviewRequestId === explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!request || !samePin(request, pin)) fail("REVIEW_REQUEST_NOT_FOUND");
  const findingCategory = explicit(input.findingCategory, "FINDING_CATEGORY_REQUIRED");
  if (FORBIDDEN.has(findingCategory) || !(D6_R9_FINDING_CATEGORIES as readonly string[]).includes(findingCategory)) fail("FINDING_CATEGORY_INVALID");
  const severity = explicit(input.severity, "FINDING_SEVERITY_REQUIRED");
  if (!(PRE_ISSUE_MATERIALITY as readonly string[]).includes(severity)) fail("FINDING_SEVERITY_INVALID");
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (CLOSED.has(disposition.toLowerCase()) || FORBIDDEN.has(disposition) || !(D6_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory === "REASSESSMENT_RECOMMENDATION" && disposition !== "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  if (findingCategory !== "REASSESSMENT_RECOMMENDATION" && disposition === "REASSESSMENT_REQUESTED") fail("FINDING_DISPOSITION_INVALID");
  const findingText = explicit(input.findingText, "FINDING_TEXT_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const findingId = explicit(input.findingId, "FINDING_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ findingId, reviewRequestId: request.reviewRequestId, ...pin, findingCategory, severity, findingText, disposition, applicability, limitations, cited, provenanceRef, sourceBasisRef, reviewerId: actor.actorId });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.findings.find((row) => row.findingId === findingId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FINDING_ALREADY_RECORDED");
  const signature = `${request.reviewRequestId}|${pin.subjectFingerprint}|${findingCategory}|${findingText}`;
  if (store.findings.some((row) => `${row.reviewRequestId}|${row.subjectFingerprint}|${row.findingCategory}|${row.findingText}` === signature)) fail("DUPLICATE_FINDING_REJECTED");
  const record: D6R9FindingRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, false),
    findingId, reviewRequestId: request.reviewRequestId, findingCategory: findingCategory as D6R9FindingRecord["findingCategory"], severity: severity as D6R9FindingRecord["severity"], findingText, disposition: disposition as D6R9FindingRecord["disposition"],
    reviewerId: actor.actorId, reviewerAuthority: "REVIEWER", engineeringInvalid: false,
  };
  store.findings.push(record);
  remember(store, "FINDING", record.findingId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordProcessFindingDisposition(store: D6R9Store, actor: D6R9Actor, input: Prohibited & Chain & {
  dispositionId: string; findingId: string; disposition: string; changeId?: string | null; changeFingerprint?: string | null; reassessmentId?: string | null; reassessmentFingerprint?: string | null; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null;
}): D6R9DispositionRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D6_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const finding = store.findings.find((row) => row.findingId === explicit(input.findingId, "FINDING_ID_REQUIRED") && row.tenantId === actor.tenantId);
  if (!finding || !samePin(finding, pin)) fail("FINDING_NOT_FOUND");
  const originalFingerprint = finding.fingerprint;
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (CLOSED.has(disposition.toLowerCase()) || FORBIDDEN.has(disposition) || !(D6_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  const linked = disposition === "REASSESSMENT_REQUESTED" ? linkedReassessment(store, actor, pin, input.changeId, input.changeFingerprint, input.reassessmentId, input.reassessmentFingerprint) : null;
  if (linked && linked.engineeringValidated) fail("REASSESSMENT_NOT_VALIDATION");
  if (!linked && (input.changeId || input.reassessmentId)) fail("CHANGE_REFERENCE_UNEXPECTED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const dispositionId = explicit(input.dispositionId, "DISPOSITION_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ dispositionId, findingId: finding.findingId, ...pin, disposition, linked, applicability, limitations, cited, provenanceRef, sourceBasisRef, reviewerId: actor.actorId });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.dispositions.find((row) => row.dispositionId === dispositionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DISPOSITION_ALREADY_RECORDED");
  if (store.dispositions.some((row) => row.findingId === finding.findingId && row.disposition === disposition && row.subjectFingerprint === pin.subjectFingerprint)) fail("DUPLICATE_DISPOSITION_REJECTED");
  const record: D6R9DispositionRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, false),
    dispositionId, findingId: finding.findingId, disposition: disposition as D6R9DispositionRecord["disposition"], reviewerId: actor.actorId, reviewerAuthority: "REVIEWER",
    changeId: linked?.changeId ?? null, changeFingerprint: linked?.changeFingerprint ?? null, reassessmentId: linked?.reassessmentId ?? null, reassessmentFingerprint: linked?.reassessmentFingerprint ?? null,
  };
  store.dispositions.push(record);
  remember(store, "DISPOSITION", record.dispositionId, "CREATED", record.fingerprint);
  if (finding.fingerprint !== originalFingerprint || finding.engineeringValidated !== false) fail("SILENT_MUTATION_REJECTED");
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordProcessReviewCompletion(store: D6R9Store, actor: D6R9Actor, input: Prohibited & Chain & {
  completionId: string; reviewRequestId: string; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null; predecessorCompletionId?: string | null;
}): D6R9CompletionRecord {
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D6_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const request = store.requests.find((row) => row.reviewRequestId === explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!request || !samePin(request, pin)) fail("REVIEW_REQUEST_NOT_FOUND");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const completionId = explicit(input.completionId, "COMPLETION_ID_REQUIRED");
  const predecessor = input.predecessorCompletionId ? store.completions.find((row) => row.completionId === explicit(input.predecessorCompletionId ?? "", "COMPLETION_ID_REQUIRED")) : null;
  if (input.predecessorCompletionId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("COMPLETION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ completionId, reviewRequestId: request.reviewRequestId, ...pin, applicability, limitations, cited, provenanceRef, sourceBasisRef, reviewerId: actor.actorId, predecessorCompletionId: predecessor?.completionId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.completions.find((row) => row.completionId === completionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("COMPLETION_ALREADY_RECORDED");
  const signature = `${request.reviewRequestId}|${pin.subjectFingerprint}`;
  if (store.completions.some((row) => row.recordStatus === "CURRENT" && row.completionId !== predecessor?.completionId && `${row.reviewRequestId}|${row.subjectFingerprint}` === signature)) fail("DUPLICATE_COMPLETION_REJECTED");
  if (predecessor) {
    const index = store.completions.findIndex((row) => row.completionId === predecessor.completionId);
    store.completions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "COMPLETION", predecessor.completionId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D6R9CompletionRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, false),
    completionId, reviewRequestId: request.reviewRequestId, reviewCompleted: true, reviewerId: actor.actorId, reviewerAuthority: "REVIEWER",
    predecessorCompletionId: predecessor?.completionId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  store.completions.push(record);
  remember(store, "COMPLETION", record.completionId, "CREATED", record.fingerprint);
  if (seal(store) !== before || request.reviewCompleted !== false || request.engineeringValidated !== false || request.requestStatus !== "REQUESTED") fail("UPSTREAM_MUTATED");
  return record;
}

export function recordProcessValidationState(store: D6R9Store, actor: D6R9Actor, input: Prohibited & Chain & {
  validationId: string; validationScope: string; validationState: string; basis?: readonly { kind: string; id: string; fingerprint: string }[]; reviewRequestId?: string | null; changeId?: string | null; changeFingerprint?: string | null; reassessmentId?: string | null; reassessmentFingerprint?: string | null; applicability: string; limitations: string; provenanceRef: string; sourceBasisRef: string; citedCurrentness: string; citedLifecycleStage: string; assertedFingerprint?: string | null; predecessorValidationId?: string | null;
}): D6R9ValidationRecord {
  if ((blockedParty(actor.actorId) || actor.actorKind === "ai" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") && input.validationState === "VALIDATED") fail("AI_CANNOT_VALIDATE");
  assertValidator(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D6_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const pin = bind(store, actor, input, cited as Currentness);
  const validationState = explicit(input.validationState, "VALIDATION_STATE_REQUIRED");
  if (FORBIDDEN.has(validationState) || !(D6_R9_VALIDATION_STATES as readonly string[]).includes(validationState)) fail("VALIDATION_STATE_INVALID");
  if (validationState === "STALE" && cited !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "REASSESSMENT_REQUIRED" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && cited !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && (pin.subjectCurrentness === "STALE" || pin.subjectCurrentness === "SUPERSEDED" || pin.subjectCurrentness === "REASSESSMENT_REQUIRED" || pin.subjectRecordStatus !== "CURRENT")) fail("STALE_NOT_VALIDATED");
  if (validationState === "VALIDATED" && store.r8.r7.reassessments.some((row) => row.recordStatus === "CURRENT" && row.targetId === pin.subjectId && row.targetFingerprint === pin.subjectFingerprint && row.state === "REASSESSMENT_REQUIRED")) fail("REASSESSMENT_NOT_VALIDATED");
  if (validationState === "VALIDATED" && (input.changeId || input.reassessmentId)) fail("REASSESSMENT_NOT_VALIDATION");
  const basis = resolveBasis(store, input.basis, validationState === "VALIDATED");
  if (validationState === "VALIDATED" && basis.length === 0) fail("BASIS_REQUIRED");
  const linked = validationState === "REASSESSMENT_REQUIRED" ? linkedReassessment(store, actor, pin, input.changeId, input.changeFingerprint, input.reassessmentId, input.reassessmentFingerprint) : null;
  if (linked && linked.engineeringValidated) fail("REASSESSMENT_NOT_VALIDATION");
  if (!linked && (input.changeId || input.reassessmentId)) fail("CHANGE_REFERENCE_UNEXPECTED");
  const validationScope = explicit(input.validationScope, "VALIDATION_SCOPE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const validationId = explicit(input.validationId, "VALIDATION_ID_REQUIRED");
  const reviewRequestId = input.reviewRequestId ? explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") : null;
  if (reviewRequestId) {
    const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
    if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
    if (request.engineeringValidated) fail("REVIEW_REQUEST_NOT_VALIDATION");
  }
  const predecessor = input.predecessorValidationId ? store.validations.find((row) => row.validationId === explicit(input.predecessorValidationId ?? "", "VALIDATION_ID_REQUIRED")) : null;
  if (input.predecessorValidationId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("VALIDATION_NOT_FOUND");
  if (predecessor && !samePin(predecessor, pin)) fail("VALIDATION_TRANSFER_REJECTED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const engineeringValidated = validationState === "VALIDATED";
  const fingerprint = fingerprintCanonical({ validationId, reviewRequestId, ...pin, validationScope, basis, validationState, linked, engineeringValidated, applicability, limitations, cited, provenanceRef, sourceBasisRef, validatorId: actor.actorId, validationAuthority: D6_R9_VALIDATION_AUTHORITY, predecessorValidationId: predecessor?.validationId ?? null });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.validations.find((row) => row.validationId === validationId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("VALIDATION_ALREADY_RECORDED");
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectFingerprint}|${validationScope}|${validationState}`;
  if (store.validations.some((row) => row.recordStatus === "CURRENT" && row.validationId !== predecessor?.validationId && `${row.subjectKind}|${row.subjectId}|${row.subjectFingerprint}|${row.validationScope}|${row.validationState}` === signature)) fail("DUPLICATE_VALIDATION_REJECTED");
  if (predecessor) {
    const index = store.validations.findIndex((row) => row.validationId === predecessor.validationId);
    store.validations[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "VALIDATION", predecessor.validationId, "SUPERSEDED", predecessor.fingerprint);
  }
  const record: D6R9ValidationRecord = {
    ...governedFields(store, actor, pin, applicability, limitations, provenanceRef, sourceBasisRef, cited as Currentness, input.citedLifecycleStage, fingerprint, engineeringValidated),
    validationId, validationScope, validationState: validationState as D6R9ValidationRecord["validationState"], validationAuthority: D6_R9_VALIDATION_AUTHORITY, validatorId: actor.actorId, basis, reviewRequestId,
    changeId: linked?.changeId ?? null, changeFingerprint: linked?.changeFingerprint ?? null, reassessmentId: linked?.reassessmentId ?? null, reassessmentFingerprint: linked?.reassessmentFingerprint ?? null,
    predecessorValidationId: predecessor?.validationId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
  };
  store.validations.push(record);
  remember(store, "VALIDATION", record.validationId, "CREATED", record.fingerprint);
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  if (record.validationState === "VALIDATED" && (record.currentness !== "CURRENT" || currentProcessValidations(store, actor).some((row) => row.validationId === record.validationId && row.currentness !== "CURRENT"))) fail("STALE_EXPOSED_AS_CURRENT");
  if (record.currentness === "STALE" && currentProcessValidations(store, actor).some((row) => row.validationId === record.validationId)) fail("STALE_EXPOSED_AS_CURRENT");
  if (record.recordStatus === "SUPERSEDED" && record.validationState === "VALIDATED") fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  return record;
}

export function repointProcessReview(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function transferProcessValidation(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}
export function automaticallyValidateProcessEngineering(): never {
  return fail("AUTOMATIC_VALIDATION_REJECTED");
}
export function closeProcessReassessmentAsValidated(): never {
  return fail("REASSESSMENT_NOT_VALIDATION");
}
export function validateProcessCounterpart(): never {
  return fail("COUNTERPART_VALIDATION_REJECTED");
}
export function approveProcessFromValidation(): never {
  return fail("APPROVAL_NOT_IN_R9");
}
export function certifyProcessFromValidation(): never {
  return fail("CERTIFICATION_NOT_IN_R9");
}
export function determineProcessConformanceFromValidation(): never {
  return fail("CONFORMANCE_NOT_IN_R9");
}
