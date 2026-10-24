/**
 * EOS-D2-R9 review and validation governance.
 * Records Civil review requests, findings, and validation state on exact
 * D2 revisions. Does not calculate, approve, certify, or start D3 through D9.
 */
import {
  ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  CIVIL_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  D2_AUTHORITY_ROLES,
  D2_CURRENTNESS_STATES,
  D2_HUMAN_OVERSIGHT_CLASSES,
  D2_IMPLEMENTATION_PHASES,
} from "@rtb/types";
import { assertHumanApprovalActor } from "../decision-intelligence/invariants";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  FORBIDDEN_PRE_ISSUE_VERDICTS,
  PRE_ISSUE_AI_BOUNDARY,
  PRE_ISSUE_MATERIALITY,
} from "../pre-issue-review/types";
import { resolveAuthAssuranceLevel } from "../security-closure/privileged-mfa";
import {
  D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D2_CONTEXT_AUTHORITY,
  D2_DISCIPLINE,
  type D2R1Actor,
} from "./identity-foundation";
import { D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY as R2_SPATIAL_READY } from "./spatial-surface-context";
import { D2_GRADING_EARTHWORKS_RUNTIME_READY as R3_GRADING_READY } from "./grading-earthworks-context";
import { D2_ROADS_ACCESS_RUNTIME_READY as R4_ROADS_READY } from "./roads-access-context";
import { D2_DRAINAGE_STORMWATER_RUNTIME_READY as R5_DRAINAGE_READY } from "./drainage-stormwater-context";
import { D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY as R6_UTILITY_READY } from "./utility-corridor-context";
import { D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_REQUIREMENTS_READY } from "./requirements-assumptions-change";
import {
  D2_DISCIPLINE_INTERFACE_RUNTIME_READY as R8_INTERFACE_READY,
  type D2R8Store,
} from "./discipline-interfaces-handoffs";

export const D2_R9_STATUS = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D2_R9_MATURITY = "REVIEW_AND_VALIDATION_GOVERNANCE_IMPLEMENTED" as const;
export const D2_R9_MATURITY_STATE = D2_R9_MATURITY;
export const D2_R9_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R9_REVIEW_AND_VALIDATION_GOVERNANCE_CLOSEOUT.md" as const;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 9 as const;
export const D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY = R2_SPATIAL_READY;
export const D2_GRADING_EARTHWORKS_RUNTIME_READY = R3_GRADING_READY;
export const D2_ROADS_ACCESS_RUNTIME_READY = R4_ROADS_READY;
export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = R5_DRAINAGE_READY;
export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = R6_UTILITY_READY;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_REQUIREMENTS_READY;
export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = R8_INTERFACE_READY;
export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = true as const;
export const D2_CIVIL_REVIEW_REQUEST_RUNTIME_IMPLEMENTED = true as const;
export const D2_CIVIL_REVIEW_FINDING_RUNTIME_IMPLEMENTED = true as const;
export const D2_CIVIL_VALIDATION_GOVERNANCE_RUNTIME_IMPLEMENTED = true as const;
export const CANONICAL_REVIEW_GOVERNANCE_REUSED = true as const;
export const CANONICAL_AUTHORITY_GOVERNANCE_REUSED = true as const;
export const PARALLEL_D2_REVIEW_AUTHORITY_FRAMEWORK_CREATED = false as const;
export const D2_R9_AAL2_GUARD_REUSED = true as const;
export const D2_R9_REVIEW_AI_BOUNDARY_REUSED = PRE_ISSUE_AI_BOUNDARY;
export const D2_R9_AUTHORITY_ROLES_REUSED = D2_AUTHORITY_ROLES;
export const D2_R9_OVERSIGHT_CLASSES_REUSED = D2_HUMAN_OVERSIGHT_CLASSES;
export const EXACT_D2_REVIEW_SUBJECT_REFERENCE_REQUIRED = true as const;
export const FLOATING_D2_REVIEW_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D2_REVIEWER_AUTHORITY_GOVERNED = true as const;
export const AI_EQUALS_D2_CIVIL_REVIEWER = false as const;
export const ADMIN_EQUALS_D2_CIVIL_REVIEWER = false as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY;
export const REVIEW_REQUEST_PRESENT_EQUALS_REVIEW_COMPLETED = false as const;
export const REVIEW_REQUEST_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const REVIEW_FINDING_EQUALS_AUTOMATIC_DESIGN_CHANGE = false as const;
export const REVIEW_FINDING_EQUALS_ENGINEERING_INVALID = false as const;
export const AI_CAN_AUTOMATICALLY_VALIDATE_CIVIL_ENGINEERING = PRE_ISSUE_AI_BOUNDARY.mayCertifyCalculation;
export const ADMIN_CAN_AUTOMATICALLY_VALIDATE_CIVIL_ENGINEERING = false as const;
export const EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = CIVIL_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED;
export const REVIEW_COMPLETED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const VALIDATED_EQUALS_CONFORMANT = false as const;
export const VALIDATED_EQUALS_ENGINEERING_APPROVED = PRE_ISSUE_AI_BOUNDARY.mayApproveDesign;
export const VALIDATED_EQUALS_CERTIFIED = false as const;
export const D2_REVIEW_AUTO_MUTATES_ENGINEERING_OBJECT = false as const;
export const D2_VALIDATION_AUTO_MUTATES_ENGINEERING_OBJECT = false as const;
export const PRIOR_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const PRIOR_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const STALE_REVIEW_AUTO_REPOINTED = false as const;
export const STALE_VALIDATION_AUTO_REPOINTED = false as const;
export const D2_REVIEW_OF_INTERFACE_EQUALS_COUNTERPART_DISCIPLINE_VALIDATION = false as const;
export const D2_VALIDATION_OF_CIVIL_HANDOFF_EQUALS_D1_VALIDATION = false as const;
export const D2_VALIDATION_OF_CIVIL_HANDOFF_EQUALS_D3_VALIDATION = false as const;
export const D2_R9_PROVENANCE_REQUIRED = true as const;
export const D2_R9_PROVENANCE_PRESERVED = true as const;
export const CANONICAL_FINGERPRINT_REUSED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const SILENT_D2_R9_MUTATION_ALLOWED = false as const;
export const D2_R9_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D2_R9_SCOPE_ENFORCED = true as const;
export const D2_R9_REVIEW_TYPES = ["CIVIL_SUBJECT_REVIEW", "INTERFACE_HANDOFF_REVIEW"] as const;
export const D2_R9_REQUEST_STATUSES = ["REQUESTED"] as const;
export const D2_R9_FINDING_DISPOSITIONS = ["OPEN", "NOTED", "REASSESSMENT_REQUESTED"] as const;
export const D2_R9_VALIDATION_STATES = ["NOT_VALIDATED", "EVIDENCE_INCOMPLETE", "VALIDATED", "STALE", "REASSESSMENT_REQUIRED"] as const;
export const D2_R9_SUBJECT_KINDS = ["OBJECT", "REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE", "HANDOFF"] as const;
export const D2_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_REVIEW_FINDING_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_REVIEW_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_COUNTERPART_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT = 0 as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D2_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D3_RUNTIME_STARTED = false as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D3_D9_RUNTIME_STARTED = false as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;

export const D2_R10_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[9];
export const D2_R10_PHASE_TYPE = "CURRENTNESS_AND_DIGITAL_THREAD" as const;
export const D2_R10_CANONICAL_SCOPE =
  "Implement the dedicated bounded D2 currentness and digital-thread integration using canonical EOS primitives across R1-R9 records. Establish explicit lineage, supersession, stale/reassessment propagation over governed relationships and exact revisions without creating a parallel currentness engine, silently repointing history, inferring undocumented dependencies, recalculating engineering, or starting D3-D9." as const;
export const D2_R10_STARTED = false as const;
export const D2_R11_STARTED = false as const;
export const D2_R9_READY_FOR_NEXT_PHASE = true as const;
export const D2_R9_NEXT_PHASE = D2_R10_CANONICAL_PHASE;
export const D2_R9_NEXT_PHASE_TYPE = D2_R10_PHASE_TYPE;
export const D2_R9_CANONICAL_NEXT_PHASE = D2_R10_CANONICAL_PHASE;
export const D2_R9_CANONICAL_NEXT_PHASE_SCOPE = D2_R10_CANONICAL_SCOPE;
export const D2_R9_BLOCKER = "NONE" as const;
export const D2_R9_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);
const FORBIDDEN_VERDICTS = new Set<string>(FORBIDDEN_PRE_ISSUE_VERDICTS);

type Currentness = (typeof D2_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D2_R9_SUBJECT_KINDS)[number];

type Prohibited = {
  approve?: boolean;
  certify?: boolean;
  conform?: boolean;
  automaticValidation?: boolean;
  automaticResolution?: boolean;
  mutateSubject?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  repoint?: boolean;
  validateCounterpart?: boolean;
  validateD1?: boolean;
  validateD3?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  d3Start?: boolean;
  d9Reasoning?: boolean;
  reviewCompleted?: boolean;
};

export type D2R9Actor = D2R1Actor & {
  actorKind?: string;
  aal?: string | null;
  amr?: Array<string | { method?: string }> | null;
};

export type D2R9SubjectPin = {
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
  requirementContextIds?: readonly string[];
  assumptionContextIds?: readonly string[];
  decisionContextIds?: readonly string[];
  handoffIds?: readonly string[];
  evidenceObjectIds?: readonly string[];
};

export type D2R9ReviewRequestInput = Prohibited & SubjectInput & {
  reviewRequestId: string;
  reviewType: string;
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

export type D2R9ReviewRequestRecord = D2R9SubjectPin & {
  reviewRequestId: string;
  reviewType: (typeof D2_R9_REVIEW_TYPES)[number];
  requestStatus: "REQUESTED";
  reviewCompleted: false;
  engineeringValidated: false;
  requestedReviewerAuthority: "REVIEWER";
  requesterId: string;
  evidenceObjectIds: readonly string[];
  requirementContextIds: readonly string[];
  assumptionContextIds: readonly string[];
  decisionContextIds: readonly string[];
  handoffIds: readonly string[];
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

export type D2R9FindingInput = Prohibited & SubjectInput & {
  findingId: string;
  reviewRequestId: string;
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

export type D2R9FindingRecord = D2R9SubjectPin & {
  findingId: string;
  reviewRequestId: string;
  severity: (typeof PRE_ISSUE_MATERIALITY)[number];
  findingText: string;
  disposition: (typeof D2_R9_FINDING_DISPOSITIONS)[number];
  affectedObjectId: string;
  changeContextId: string | null;
  evidenceObjectIds: readonly string[];
  engineeringInvalid: false;
  automaticDesignChange: false;
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

export type D2R9ValidationInput = Prohibited & SubjectInput & {
  validationId: string;
  reviewRequestId?: string | null;
  validationScope: string;
  requiredEvidenceObjectIds: readonly string[];
  validationState: string;
  limitations: string;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  predecessorValidationId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R9ValidationRecord = D2R9SubjectPin & {
  validationId: string;
  reviewRequestId: string | null;
  validationScope: string;
  requiredEvidenceObjectIds: readonly string[];
  evidenceActuallyPresent: readonly string[];
  validationState: (typeof D2_R9_VALIDATION_STATES)[number];
  engineeringValidated: boolean;
  conformant: false;
  engineeringApproved: false;
  certified: false;
  counterpartDisciplineValidated: false;
  d1Validated: false;
  d3Validated: false;
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

export type D2R9History = {
  historyId: string;
  subjectKind: "REVIEW_REQUEST" | "FINDING" | "VALIDATION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R9Store = {
  r8: D2R8Store;
  now: () => string;
  requests: D2R9ReviewRequestRecord[];
  findings: D2R9FindingRecord[];
  validations: D2R9ValidationRecord[];
  history: D2R9History[];
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
  return (D2_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.approve === true) fail("APPROVAL_NOT_IN_R9");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R9");
  if (input.conform === true) fail("CONFORMANCE_NOT_IN_R9");
  if (input.automaticValidation === true) fail("AUTOMATIC_VALIDATION_REJECTED");
  if (input.automaticResolution === true) fail("AUTOMATIC_FINDING_RESOLUTION_REJECTED");
  if (input.mutateSubject === true) fail("SUBJECT_MUTATION_REJECTED");
  if (input.transferReview === true || input.transferValidation === true) fail("REVISION_TRANSFER_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.validateCounterpart === true || input.validateD1 === true || input.validateD3 === true) fail("COUNTERPART_VALIDATION_REJECTED");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R9");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R9");
  if (input.d3Start === true) fail("D3_NOT_STARTED");
  if (input.d9Reasoning === true) fail("D9_NOT_STARTED");
  if (input.reviewCompleted === true) fail("REVIEW_REQUEST_NOT_COMPLETION");
}

function assertScope(actor: D2R9Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D2R9Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT") fail("AI_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_CIVIL_AUTHORITY");
  if (actor.authority !== D2_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertReviewer(actor: D2R9Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") fail("AI_NOT_CIVIL_REVIEWER");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_CIVIL_REVIEWER");
  if (actor.authority !== "REVIEWER" || !(D2_AUTHORITY_ROLES as readonly string[]).includes(actor.authority)) fail("REVIEWER_AUTHORITY_REQUIRED");
  assertHumanApprovalActor(actor.actorKind ?? "", actor.actorId);
  if (resolveAuthAssuranceLevel({ aal: actor.aal, amr: actor.amr }) !== "aal2") fail("AAL2_REQUIRED");
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  return cited;
}

function requireContext(store: D2R9Store, actor: D2R9Actor, contextId: string, cited: Currentness) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  if (cited === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function pinSubject(store: D2R9Store, actor: D2R9Actor, input: SubjectInput, cited: Currentness): D2R9SubjectPin {
  const subjectKind = explicit(input.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D2_R9_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(input.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(input.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(input.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const context = requireContext(store, actor, input.contextId, cited);
  const kind = subjectKind as SubjectKind;
  if (kind === "OBJECT") {
    const object = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === subjectId && row.contextId === context.contextId);
    if (!object || object.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
    if (object.fingerprint !== subjectFingerprint || subjectRevision !== object.fingerprint) fail("SUBJECT_REVISION_MISMATCH");
    if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  } else if (kind === "REQUIREMENT") {
    const row = store.r8.r7.requirements.find((item) => item.requirementContextId === subjectId && item.contextId === context.contextId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || row.sourceRevision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  } else if (kind === "ASSUMPTION") {
    const row = store.r8.r7.assumptions.find((item) => item.assumptionContextId === subjectId && item.contextId === context.contextId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || subjectRevision !== row.fingerprint) fail("SUBJECT_REVISION_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  } else if (kind === "DECISION") {
    const row = store.r8.r7.decisions.find((item) => item.decisionContextId === subjectId && item.contextId === context.contextId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || subjectRevision !== row.fingerprint) fail("SUBJECT_REVISION_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  } else if (kind === "CHANGE") {
    const row = store.r8.r7.changes.find((item) => item.changeContextId === subjectId && item.contextId === context.contextId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || subjectRevision !== row.fingerprint) fail("SUBJECT_REVISION_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  } else {
    const row = store.r8.handoffs.find((item) => item.handoffId === subjectId && item.contextId === context.contextId);
    if (!row || row.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
    if (row.fingerprint !== subjectFingerprint || row.sourceRevision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  }
  return { subjectKind: kind, subjectId, subjectRevision, subjectFingerprint, contextId: context.contextId };
}

function evidenceIds(store: D2R9Store, actor: D2R9Actor, contextId: string, objectIds: readonly string[] | undefined, code: string): string[] {
  if (!Array.isArray(objectIds)) fail(code);
  const ids = [...new Set(objectIds.map((id) => explicit(id, code)))].sort();
  for (const id of ids) {
    const object = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
    if (!object || object.objectType !== "CIVIL_EVIDENCE_REFERENCE" || object.contextId !== contextId || object.tenantId !== actor.tenantId) fail(code);
  }
  return ids;
}

function citeIds<T>(rows: readonly T[], ids: readonly string[] | undefined, pick: (row: T) => string, contextOf: (row: T) => string, code: string, contextId: string): string[] {
  if (!Array.isArray(ids)) fail(code);
  const unique = [...new Set(ids.map((id) => explicit(id, code)))].sort();
  for (const id of unique) {
    if (!rows.some((row) => pick(row) === id && contextOf(row) === contextId)) fail(code);
  }
  return unique;
}

function remember(store: D2R9Store, subjectKind: D2R9History["subjectKind"], subjectId: string, action: D2R9History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function snapshot(store: D2R9Store): string {
  const objects = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.map((row) => row.objectId + row.fingerprint + row.recordStatus).join("|");
  const handoffs = store.r8.handoffs.map((row) => row.handoffId + row.fingerprint + row.recordStatus + (row.counterpart?.interfaceId ?? "")).join("|");
  const requirements = store.r8.r7.requirements.map((row) => row.requirementContextId + row.fingerprint).join("|");
  return `${objects}#${handoffs}#${requirements}#${store.r8.r7.reassessments.length}`;
}

function samePin(left: D2R9SubjectPin, right: D2R9SubjectPin): boolean {
  return left.subjectKind === right.subjectKind && left.subjectId === right.subjectId && left.subjectRevision === right.subjectRevision && left.subjectFingerprint === right.subjectFingerprint;
}

export function createD2R9Store(r8: D2R8Store, now: () => string = () => "2026-10-23T00:00:00.000Z"): D2R9Store {
  return { r8, now, requests: [], findings: [], validations: [], history: [] };
}

export function recordCivilReviewRequest(store: D2R9Store, actor: D2R9Actor, input: D2R9ReviewRequestInput): D2R9ReviewRequestRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const pin = pinSubject(store, actor, input, cited);
  const reviewType = explicit(input.reviewType, "REVIEW_TYPE_REQUIRED");
  if (!(D2_R9_REVIEW_TYPES as readonly string[]).includes(reviewType)) fail("REVIEW_TYPE_INVALID");
  if (reviewType === "INTERFACE_HANDOFF_REVIEW" && pin.subjectKind !== "HANDOFF") fail("HANDOFF_SUBJECT_REQUIRED");
  const requestedReviewerAuthority = explicit(input.requestedReviewerAuthority, "REVIEWER_AUTHORITY_REQUIRED");
  if (requestedReviewerAuthority !== "REVIEWER") fail("REVIEWER_AUTHORITY_REQUIRED");
  const evidenceObjectIds = evidenceIds(store, actor, pin.contextId, input.evidenceObjectIds, "EVIDENCE_REFERENCE_REQUIRED");
  const requirementContextIds = citeIds(store.r8.r7.requirements, input.requirementContextIds, (row) => row.requirementContextId, (row) => row.contextId, "REQUIREMENT_REFERENCE_REQUIRED", pin.contextId);
  const assumptionContextIds = citeIds(store.r8.r7.assumptions, input.assumptionContextIds, (row) => row.assumptionContextId, (row) => row.contextId, "ASSUMPTION_REFERENCE_REQUIRED", pin.contextId);
  const decisionContextIds = citeIds(store.r8.r7.decisions, input.decisionContextIds, (row) => row.decisionContextId, (row) => row.contextId, "DECISION_REFERENCE_REQUIRED", pin.contextId);
  const handoffIds = citeIds(store.r8.handoffs, input.handoffIds, (row) => row.handoffId, (row) => row.contextId, "HANDOFF_REFERENCE_REQUIRED", pin.contextId);
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const requestedAt = explicit(input.requestedAt, "REQUESTED_AT_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const predecessor = input.predecessorReviewRequestId ? store.requests.find((row) => row.reviewRequestId === input.predecessorReviewRequestId) : null;
  if (input.predecessorReviewRequestId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor && !samePin(predecessor, pin)) fail("REVIEW_TRANSFER_REJECTED");
  if (predecessor && cited !== "STALE" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const fingerprint = fingerprintCanonical({
    reviewRequestId,
    ...pin,
    reviewType,
    requestedReviewerAuthority,
    evidenceObjectIds,
    requirementContextIds,
    assumptionContextIds,
    decisionContextIds,
    handoffIds,
    limitations,
    requestedAt,
    citedCurrentness: cited,
    provenanceRef,
    predecessorReviewRequestId: predecessor?.reviewRequestId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requests.find((row) => row.reviewRequestId === reviewRequestId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("REVIEW_REQUEST_ALREADY_RECORDED");
  }
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${reviewType}`;
  if (store.requests.some((row) => row.recordStatus === "CURRENT" && row.reviewRequestId !== predecessor?.reviewRequestId && row.contextId === pin.contextId && `${row.subjectKind}|${row.subjectId}|${row.subjectRevision}|${row.reviewType}` === signature)) fail("DUPLICATE_REVIEW_REQUEST_REJECTED");
  const before = snapshot(store);
  const record: D2R9ReviewRequestRecord = Object.freeze({
    reviewRequestId,
    ...pin,
    reviewType: reviewType as D2R9ReviewRequestRecord["reviewType"],
    requestStatus: "REQUESTED",
    reviewCompleted: false,
    engineeringValidated: false,
    requestedReviewerAuthority: "REVIEWER",
    requesterId: actor.actorId,
    evidenceObjectIds,
    requirementContextIds,
    assumptionContextIds,
    decisionContextIds,
    handoffIds,
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

export function recordCivilReviewFinding(store: D2R9Store, actor: D2R9Actor, input: D2R9FindingInput): D2R9FindingRecord {
  if (PRE_ISSUE_AI_BOUNDARY.mayCreateFormalFindingAutomatically && input.automaticResolution === true) fail("AUTOMATIC_FINDING_RESOLUTION_REJECTED");
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const pin = pinSubject(store, actor, input, cited);
  const reviewRequestId = explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED");
  const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
  if (!request || request.tenantId !== actor.tenantId || request.workspaceId !== actor.workspaceId || request.projectId !== actor.projectId) fail("REVIEW_REQUEST_NOT_FOUND");
  if (!samePin(request, pin)) fail("FINDING_SUBJECT_MISMATCH");
  const severity = explicit(input.severity, "FINDING_SEVERITY_REQUIRED");
  if (!(PRE_ISSUE_MATERIALITY as readonly string[]).includes(severity)) fail("FINDING_SEVERITY_INVALID");
  const disposition = explicit(input.disposition, "FINDING_DISPOSITION_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(disposition)) fail("FORBIDDEN_REVIEW_VERDICT");
  if (!(D2_R9_FINDING_DISPOSITIONS as readonly string[]).includes(disposition)) fail("FINDING_DISPOSITION_INVALID");
  const findingText = explicit(input.findingText, "FINDING_TEXT_REQUIRED");
  const affectedObjectId = explicit(input.affectedObjectId, "AFFECTED_OBJECT_REQUIRED");
  const affected = store.r8.r7.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === affectedObjectId && row.contextId === pin.contextId && row.tenantId === actor.tenantId);
  if (!affected) fail("AFFECTED_OBJECT_REQUIRED");
  const evidenceObjectIds = evidenceIds(store, actor, pin.contextId, input.evidenceObjectIds, "EVIDENCE_REFERENCE_REQUIRED");
  let changeContextId: string | null = null;
  if (disposition === "REASSESSMENT_REQUESTED") {
    changeContextId = explicit(input.changeContextId ?? "", "CHANGE_REFERENCE_REQUIRED");
    const change = store.r8.r7.changes.find((row) => row.changeContextId === changeContextId && row.contextId === pin.contextId);
    if (!change) fail("CHANGE_REFERENCE_REQUIRED");
  } else if (input.changeContextId) {
    fail("CHANGE_REFERENCE_UNEXPECTED");
  }
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const findingId = explicit(input.findingId, "FINDING_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({
    findingId,
    reviewRequestId,
    ...pin,
    severity,
    findingText,
    disposition,
    affectedObjectId,
    changeContextId,
    evidenceObjectIds,
    limitations,
    citedCurrentness: cited,
    provenanceRef,
    reviewerId: actor.actorId,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.findings.find((row) => row.findingId === findingId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("FINDING_ALREADY_RECORDED");
  }
  const signature = `${reviewRequestId}|${pin.subjectId}|${pin.subjectRevision}|${findingText}`;
  if (store.findings.some((row) => row.contextId === pin.contextId && `${row.reviewRequestId}|${row.subjectId}|${row.subjectRevision}|${row.findingText}` === signature)) fail("DUPLICATE_FINDING_REJECTED");
  const before = snapshot(store);
  const record: D2R9FindingRecord = Object.freeze({
    findingId,
    reviewRequestId,
    ...pin,
    severity: severity as D2R9FindingRecord["severity"],
    findingText,
    disposition: disposition as D2R9FindingRecord["disposition"],
    affectedObjectId,
    changeContextId,
    evidenceObjectIds,
    engineeringInvalid: false,
    automaticDesignChange: false,
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

export function recordCivilValidationGovernance(store: D2R9Store, actor: D2R9Actor, input: D2R9ValidationInput): D2R9ValidationRecord {
  if ((blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") && (input.validationState === "VALIDATED" || input.automaticValidation === true)) fail("AI_CANNOT_VALIDATE");
  if ((actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") && (input.validationState === "VALIDATED" || input.automaticValidation === true)) fail("ADMIN_CANNOT_VALIDATE");
  assertReviewer(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const pin = pinSubject(store, actor, input, cited);
  const validationState = explicit(input.validationState, "VALIDATION_STATE_REQUIRED");
  if (FORBIDDEN_VERDICTS.has(validationState)) fail("FORBIDDEN_REVIEW_VERDICT");
  if (!(D2_R9_VALIDATION_STATES as readonly string[]).includes(validationState)) fail("VALIDATION_STATE_INVALID");
  if (validationState === "STALE" && cited !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "REASSESSMENT_REQUIRED" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (validationState === "VALIDATED" && cited !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  const requiredEvidenceObjectIds = evidenceIds(store, actor, pin.contextId, input.requiredEvidenceObjectIds, "EVIDENCE_REFERENCE_REQUIRED");
  const evidenceActuallyPresent = evidenceIds(store, actor, pin.contextId, input.evidenceObjectIds, "EVIDENCE_REFERENCE_REQUIRED");
  if (validationState === "VALIDATED") {
    if (requiredEvidenceObjectIds.length === 0) fail("EVIDENCE_REQUIRED_FOR_VALIDATION");
    if (requiredEvidenceObjectIds.some((id) => !evidenceActuallyPresent.includes(id))) fail("EVIDENCE_REQUIRED_FOR_VALIDATION");
  }
  const validationScope = explicit(input.validationScope, "VALIDATION_SCOPE_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const validationId = explicit(input.validationId, "VALIDATION_ID_REQUIRED");
  const reviewRequestId = input.reviewRequestId ? explicit(input.reviewRequestId, "REVIEW_REQUEST_REQUIRED") : null;
  if (reviewRequestId) {
    const request = store.requests.find((row) => row.reviewRequestId === reviewRequestId && row.recordStatus === "CURRENT");
    if (!request || !samePin(request, pin) || request.tenantId !== actor.tenantId) fail("REVIEW_REQUEST_NOT_FOUND");
  }
  const predecessor = input.predecessorValidationId ? store.validations.find((row) => row.validationId === input.predecessorValidationId) : null;
  if (input.predecessorValidationId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  if (predecessor && !samePin(predecessor, pin)) fail("VALIDATION_TRANSFER_REJECTED");
  if (predecessor && cited !== "STALE" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const engineeringValidated = validationState === "VALIDATED";
  const fingerprint = fingerprintCanonical({
    validationId,
    reviewRequestId,
    ...pin,
    validationScope,
    requiredEvidenceObjectIds,
    evidenceActuallyPresent,
    validationState,
    engineeringValidated,
    limitations,
    citedCurrentness: cited,
    provenanceRef,
    reviewerId: actor.actorId,
    predecessorValidationId: predecessor?.validationId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.validations.find((row) => row.validationId === validationId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("VALIDATION_ALREADY_RECORDED");
  }
  const signature = `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${validationScope}|${validationState}`;
  if (store.validations.some((row) => row.recordStatus === "CURRENT" && row.validationId !== predecessor?.validationId && row.contextId === pin.contextId && `${row.subjectKind}|${row.subjectId}|${row.subjectRevision}|${row.validationScope}|${row.validationState}` === signature)) fail("DUPLICATE_VALIDATION_REJECTED");
  const before = snapshot(store);
  const record: D2R9ValidationRecord = Object.freeze({
    validationId,
    reviewRequestId,
    ...pin,
    validationScope,
    requiredEvidenceObjectIds,
    evidenceActuallyPresent,
    validationState: validationState as D2R9ValidationRecord["validationState"],
    engineeringValidated,
    conformant: false,
    engineeringApproved: false,
    certified: false,
    counterpartDisciplineValidated: false,
    d1Validated: false,
    d3Validated: false,
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
  return record;
}

export function mutateReviewedSubject(): never {
  return fail("SUBJECT_MUTATION_REJECTED");
}

export function transferPriorReview(): never {
  return fail("REVIEW_TRANSFER_REJECTED");
}

export function transferPriorValidation(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}

export function repointStaleReview(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function repointStaleValidation(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function automaticallyValidateCivilEngineering(): never {
  return fail("AUTOMATIC_VALIDATION_REJECTED");
}

export function approveCivilWork(): never {
  return fail("APPROVAL_NOT_IN_R9");
}

export function certifyCivilWork(): never {
  return fail("CERTIFICATION_NOT_IN_R9");
}

export function resolveReviewFinding(): never {
  return fail("AUTOMATIC_FINDING_RESOLUTION_REJECTED");
}
