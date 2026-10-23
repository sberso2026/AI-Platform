/**
 * EOS-D2-R10 currentness and digital thread.
 * Records explicit lineage and currentness marks across exact R1-R9 revisions.
 * Does not rewrite history, redesign Civil objects, or start D3 through D9.
 */
import {
  ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS_D2,
  AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS_D2,
  D2_CANONICAL_DIGITAL_THREAD_REUSED,
  D2_CURRENTNESS_STATES,
  D2_EXPLICIT_CHANGE_DEPENDENCIES,
  D2_IMPLEMENTATION_PHASES,
  D2_SILENT_REPOINTING_ALLOWED,
  INFERRED_D2_DEPENDENCY_PROPAGATION_ALLOWED as ARCH_INFERRED_PROPAGATION,
  PARALLEL_D2_DIGITAL_THREAD_CREATED as ARCH_PARALLEL_THREAD,
} from "@rtb/types";
import { isGovernedRelationType } from "../decision-intelligence/relations";
import { THREAD_DEFAULT_MAX_DEPTH } from "../digital-thread/types";
import { relationSemantics } from "../digital-thread/relation-semantics";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  D2_CONTEXT_AUTHORITY,
  D2_DISCIPLINE,
  D2_EXPLICIT_RELATIONSHIP_KINDS,
  type D2R1Actor,
} from "./identity-foundation";
import { D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY as R2_SPATIAL_READY } from "./spatial-surface-context";
import { D2_GRADING_EARTHWORKS_RUNTIME_READY as R3_GRADING_READY } from "./grading-earthworks-context";
import { D2_ROADS_ACCESS_RUNTIME_READY as R4_ROADS_READY } from "./roads-access-context";
import { D2_DRAINAGE_STORMWATER_RUNTIME_READY as R5_DRAINAGE_READY } from "./drainage-stormwater-context";
import { D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY as R6_UTILITY_READY } from "./utility-corridor-context";
import { D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R7_REQUIREMENTS_READY } from "./requirements-assumptions-change";
import { D2_DISCIPLINE_INTERFACE_RUNTIME_READY as R8_INTERFACE_READY } from "./discipline-interfaces-handoffs";
import {
  D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY as R9_REVIEW_READY,
  type D2R9Store,
} from "./review-validation-governance";

export const D2_R10_STATUS = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D2_R10_MATURITY = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D2_R10_MATURITY_STATE = D2_R10_MATURITY;
export const D2_R10_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md" as const;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 10 as const;
export const D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY = R2_SPATIAL_READY;
export const D2_GRADING_EARTHWORKS_RUNTIME_READY = R3_GRADING_READY;
export const D2_ROADS_ACCESS_RUNTIME_READY = R4_ROADS_READY;
export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = R5_DRAINAGE_READY;
export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = R6_UTILITY_READY;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = R7_REQUIREMENTS_READY;
export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = R8_INTERFACE_READY;
export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = R9_REVIEW_READY;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = true as const;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED = true as const;
export const D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT = 1 as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const CANONICAL_DIGITAL_THREAD_REUSED = D2_CANONICAL_DIGITAL_THREAD_REUSED;
export const PARALLEL_D2_DIGITAL_THREAD_CREATED = ARCH_PARALLEL_THREAD;
export const CANONICAL_FINGERPRINT_REUSED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_R10_THREAD_DEPTH_REUSED = THREAD_DEFAULT_MAX_DEPTH;
export const EXACT_D2_REVISION_REFERENCE_REQUIRED = true as const;
export const FLOATING_D2_REVISION_REFERENCE_ALLOWED = false as const;
export const HISTORICAL_REFERENCE_AUTO_REPOINTED = D2_SILENT_REPOINTING_ALLOWED;
export const SUPERSESSION_REWRITES_HISTORICAL_REFERENCE = false as const;
export const D2_EXPLICIT_LINEAGE_RUNTIME_IMPLEMENTED = true as const;
export const INFERRED_D2_LINEAGE_ALLOWED = false as const;
export const D2_SUPERSESSION_GOVERNANCE_IMPLEMENTED = true as const;
export const SUPERSEDED_EQUALS_DELETED = false as const;
export const SUPERSEDED_EQUALS_INVALID = false as const;
export const SUPERSEDED_EQUALS_AUTOMATICALLY_REPLACED_EVERYWHERE = false as const;
export const D2_CURRENTNESS_STATE_RUNTIME_IMPLEMENTED = true as const;
export const STALE_EQUALS_ENGINEERING_INVALID = false as const;
export const STALE_EQUALS_ENGINEERING_REJECTED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID = false as const;
export const EXPLICIT_D2_CURRENTNESS_PROPAGATION_IMPLEMENTED = true as const;
export const INFERRED_D2_DEPENDENCY_PROPAGATION_ALLOWED = ARCH_INFERRED_PROPAGATION;
export const D2_CURRENTNESS_PROPAGATION_MUTATES_ENGINEERING_CONTENT = false as const;
export const D2_CURRENTNESS_AUTO_RECALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CURRENTNESS_AUTO_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D2_CURRENTNESS_AUTO_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_R7_CHANGE_GOVERNANCE_INTEGRATED_WITH_CURRENTNESS = true as const;
export const REQUIREMENT_CHANGE_AUTO_REDESIGNS_CIVIL_OBJECT = false as const;
export const ASSUMPTION_CHANGE_AUTO_REDESIGNS_CIVIL_OBJECT = false as const;
export const DECISION_CHANGE_AUTO_REDESIGNS_CIVIL_OBJECT = false as const;
export const D2_R8_INTERFACE_CURRENTNESS_INTEGRATED = true as const;
export const D2_R9_REVIEW_VALIDATION_CURRENTNESS_INTEGRATED = true as const;
export const PRIOR_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const PRIOR_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const STALE_REVIEW_AUTO_REPOINTED = false as const;
export const STALE_VALIDATION_AUTO_REPOINTED = false as const;
export const STALE_HANDOFF_AUTO_REPOINTED = D2_SILENT_REPOINTING_ALLOWED;
export const HANDOFF_CURRENTNESS_EQUALS_COUNTERPART_VALIDATION = false as const;
export const D2_EVIDENCE_LINEAGE_SUPPORTED = true as const;
export const EVIDENCE_LINEAGE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS_D2;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS_D2;
export const AI_CAN_SILENTLY_CREATE_AUTHORITATIVE_DEPENDENCY = false as const;
export const AI_CAN_SILENTLY_REPOINT_HISTORICAL_REFERENCE = false as const;
export const D2_R10_PROVENANCE_REQUIRED = true as const;
export const D2_R10_PROVENANCE_PRESERVED = true as const;
export const SILENT_D2_R10_MUTATION_ALLOWED = false as const;
export const D2_R10_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D2_R10_SCOPE_ENFORCED = true as const;
export const D2_R10_SUBJECT_KINDS = ["CONTEXT", "OBJECT", "SURFACE", "GRADING", "ROADS", "DRAINAGE", "UTILITY", "REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE", "HANDOFF", "EVIDENCE", "REVIEW_REQUEST", "FINDING", "VALIDATION"] as const;
export const D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_REVIEW_EXECUTION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_COUNTERPART_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D2_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D3_RUNTIME_STARTED = false as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;

export const D2_R11_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[10];
export const D2_R11_PHASE_TYPE = "D9_SOURCE_CONTRACT" as const;
export const D2_R11_CANONICAL_SCOPE =
  "Implement the bounded D2 source contract for future D9 Cross-Discipline Intelligence using exact governed D2 records. Expose Civil identity, type, revision, currentness, authority, provenance, requirements, assumptions, decisions, evidence, interfaces, spatial context, lifecycle, limitations and canonical fingerprint without starting D9 reasoning, transferring Civil authority, fabricating counterpart discipline data, recalculating engineering, validating Civil engineering, or starting D3-D9 runtime." as const;
export const D2_R11_STARTED = false as const;
export const D2_R10_READY_FOR_NEXT_PHASE = true as const;
export const D2_R10_NEXT_PHASE = D2_R11_CANONICAL_PHASE;
export const D2_R10_NEXT_PHASE_TYPE = D2_R11_PHASE_TYPE;
export const D2_R10_CANONICAL_NEXT_PHASE = D2_R11_CANONICAL_PHASE;
export const D2_R10_CANONICAL_NEXT_PHASE_SCOPE = D2_R11_CANONICAL_SCOPE;
export const D2_R10_BLOCKER = "NONE" as const;
export const D2_R10_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);
const PROPAGATION_RELATIONS = new Set(["DEPENDS_ON", "BASED_ON", "AFFECTS", "USES", "SUPPORTED_BY", "CONSTRAINED_BY", "PARENT", "OBJECT_REFERENCE", "REVIEWS"]);

type Currentness = (typeof D2_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D2_R10_SUBJECT_KINDS)[number];

type Prohibited = {
  infer?: boolean;
  proximity?: boolean;
  similarName?: boolean;
  chronology?: boolean;
  repoint?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  optimize?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  validate?: boolean;
  approve?: boolean;
  certify?: boolean;
  d3Start?: boolean;
  d9Reasoning?: boolean;
};

export type D2R10Actor = D2R1Actor & { actorKind?: string };

export type D2R10Pin = {
  subjectKind: SubjectKind;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
  contextId: string;
};

type Endpoint = {
  subjectKind: string;
  subjectId: string;
  subjectRevision: string;
  subjectFingerprint: string;
};

export type D2R10LineageInput = Prohibited & {
  lineageId: string;
  contextId: string;
  source: Endpoint;
  target: Endpoint;
  relationshipType: string;
  civilDependency?: string | null;
  authoritative?: boolean;
  candidate?: boolean;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R10LineageRecord = {
  lineageId: string;
  contextId: string;
  source: D2R10Pin;
  target: D2R10Pin;
  relationshipType: string;
  civilDependency: (typeof D2_EXPLICIT_CHANGE_DEPENDENCIES)[number] | null;
  authoritative: boolean;
  candidate: boolean;
  citedCurrentness: Currentness;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT";
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R10SupersessionInput = Prohibited & {
  supersessionId: string;
  contextId: string;
  predecessor: Endpoint;
  successor: Endpoint;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R10SupersessionRecord = {
  supersessionId: string;
  contextId: string;
  predecessor: D2R10Pin;
  successor: D2R10Pin;
  deleted: false;
  invalid: false;
  historicalEdgesRewritten: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R10CurrentnessInput = Prohibited & {
  eventId: string;
  contextId: string;
  subject: Endpoint;
  currentness: string;
  propagate?: boolean;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R10CurrentnessMark = {
  eventId: string;
  contextId: string;
  subject: D2R10Pin;
  currentness: Currentness;
  engineeringInvalid: false;
  engineeringRejected: false;
  contentMutated: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R10History = {
  historyId: string;
  subjectKind: "LINEAGE" | "SUPERSESSION" | "CURRENTNESS";
  subjectId: string;
  action: "CREATED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R10Store = {
  r9: D2R9Store;
  now: () => string;
  lineage: D2R10LineageRecord[];
  supersessions: D2R10SupersessionRecord[];
  marks: D2R10CurrentnessMark[];
  history: D2R10History[];
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
  if (input.infer === true || input.proximity === true || input.similarName === true || input.chronology === true) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R10");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R10");
  if (input.optimize === true) fail("OPTIMIZATION_NOT_IN_R10");
  if (input.transferReview === true || input.transferValidation === true) fail("REVISION_TRANSFER_REJECTED");
  if (input.validate === true) fail("VALIDATION_NOT_IN_R10");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R10");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R10");
  if (input.d3Start === true) fail("D3_NOT_STARTED");
  if (input.d9Reasoning === true) fail("D9_NOT_STARTED");
}

function assertScope(actor: D2R10Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D2R10Actor, authoritative: boolean): void {
  const ai = blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai";
  if (ai && authoritative) fail("AI_CANNOT_CREATE_AUTHORITATIVE_DEPENDENCY");
  if (!ai && (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN")) fail("ADMIN_NOT_CIVIL_AUTHORITY");
  if (!ai && actor.authority !== D2_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  return cited;
}

function remember(store: D2R10Store, subjectKind: D2R10History["subjectKind"], subjectId: string, fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action: "CREATED", fingerprint, recordedAt: store.now() });
}

function live(store: D2R10Store, actor: D2R10Actor, contextId: string, endpoint: Endpoint, cited: Currentness): D2R10Pin {
  const subjectKind = explicit(endpoint.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D2_R10_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(endpoint.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(endpoint.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(endpoint.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const context = store.r9.r8.r7.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  const kind = subjectKind as SubjectKind;
  const objects = store.r9.r8.r7.r6.r5.r4.r3.r2.r1.objects;
  let revision = "";
  let fingerprint = "";
  let status = "CURRENT";
  let recordContext = "";
  if (kind === "CONTEXT") {
    revision = context.fingerprint;
    fingerprint = context.fingerprint;
    status = context.recordStatus;
    recordContext = context.contextId;
  } else if (kind === "OBJECT" || kind === "EVIDENCE") {
    const row = objects.find((item) => item.objectId === subjectId);
    if (!row || (kind === "EVIDENCE" && row.objectType !== "CIVIL_EVIDENCE_REFERENCE")) fail("SUBJECT_NOT_FOUND");
    revision = row.fingerprint;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "SURFACE") {
    const row = store.r9.r8.r7.r6.r5.r4.r3.r2.surfaces.find((item) => item.surfaceContextId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.revision;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "GRADING") {
    const row = store.r9.r8.r7.r6.r5.r4.r3.grading.find((item) => item.gradingContextId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.fingerprint;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "ROADS") {
    const row = store.r9.r8.r7.r6.r5.r4.roads.find((item) => item.roadsContextId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.fingerprint;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "DRAINAGE") {
    const row = store.r9.r8.r7.r6.r5.drainage.find((item) => item.drainageContextId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.fingerprint;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "UTILITY") {
    const row = store.r9.r8.r7.r6.utilities.find((item) => item.utilityContextId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.fingerprint;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "REQUIREMENT") {
    const row = store.r9.r8.r7.requirements.find((item) => item.requirementContextId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.sourceRevision;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "ASSUMPTION") {
    const row = store.r9.r8.r7.assumptions.find((item) => item.assumptionContextId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.fingerprint;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "DECISION") {
    const row = store.r9.r8.r7.decisions.find((item) => item.decisionContextId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.fingerprint;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "CHANGE") {
    const row = store.r9.r8.r7.changes.find((item) => item.changeContextId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.fingerprint;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "HANDOFF") {
    const row = store.r9.r8.handoffs.find((item) => item.handoffId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.sourceRevision;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "REVIEW_REQUEST") {
    const row = store.r9.requests.find((item) => item.reviewRequestId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.subjectRevision;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else if (kind === "FINDING") {
    const row = store.r9.findings.find((item) => item.findingId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.subjectRevision;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  } else {
    const row = store.r9.validations.find((item) => item.validationId === subjectId);
    if (!row) fail("SUBJECT_NOT_FOUND");
    revision = row.subjectRevision;
    fingerprint = row.fingerprint;
    status = row.recordStatus;
    recordContext = row.contextId;
  }
  if (recordContext !== context.contextId) fail("SUBJECT_NOT_FOUND");
  if (fingerprint !== subjectFingerprint || revision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
  if (cited === "CURRENT" && status !== "CURRENT") fail("SUBJECT_NOT_CURRENT");
  return { subjectKind: kind, subjectId, subjectRevision, subjectFingerprint, contextId: context.contextId };
}

function snapshot(store: D2R10Store): string {
  const objects = store.r9.r8.r7.r6.r5.r4.r3.r2.r1.objects.map((row) => `${row.objectId}:${row.fingerprint}:${row.recordStatus}`).join("|");
  const handoffs = store.r9.r8.handoffs.map((row) => `${row.handoffId}:${row.sourceRevision}:${row.fingerprint}:${row.counterpart?.interfaceId ?? ""}`).join("|");
  const reviews = store.r9.requests.map((row) => `${row.reviewRequestId}:${row.subjectId}:${row.subjectRevision}`).join("|");
  const validations = store.r9.validations.map((row) => `${row.validationId}:${row.subjectId}:${row.subjectRevision}:${row.engineeringValidated}`).join("|");
  const requirements = store.r9.r8.r7.requirements.map((row) => `${row.requirementContextId}:${row.requirementText}:${row.fingerprint}`).join("|");
  return `${objects}#${handoffs}#${reviews}#${validations}#${requirements}`;
}

function pinKey(pin: D2R10Pin): string {
  return `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${pin.subjectFingerprint}`;
}

export function createD2R10Store(r9: D2R9Store, now: () => string = () => "2026-10-23T00:00:00.000Z"): D2R10Store {
  return { r9, now, lineage: [], supersessions: [], marks: [], history: [] };
}

export function recordCivilLineage(store: D2R10Store, actor: D2R10Actor, input: D2R10LineageInput): D2R10LineageRecord {
  const authoritative = input.authoritative !== false && input.candidate !== true;
  if ((blockedParty(actor.actorId) || actor.actorKind === "ai") && input.repoint === true) fail("AI_CANNOT_REPOINT_HISTORY");
  assertRecorder(actor, authoritative);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const source = live(store, actor, contextId, input.source, cited);
  const target = live(store, actor, contextId, input.target, cited);
  if (pinKey(source) === pinKey(target)) fail("LINEAGE_SELF_LINK_REJECTED");
  const relationshipType = explicit(input.relationshipType, "RELATIONSHIP_REQUIRED");
  const identity = (D2_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(relationshipType);
  if (relationshipType === "SUPERSEDES") fail("SUPERSESSION_FUNCTION_REQUIRED");
  if (!identity && (!isGovernedRelationType(relationshipType) || !relationSemantics(relationshipType))) fail("RELATION_NOT_GOVERNED");
  let civilDependency: D2R10LineageRecord["civilDependency"] = null;
  if (input.civilDependency != null && input.civilDependency !== "") {
    const dependency = explicit(input.civilDependency, "DEPENDENCY_NOT_EXPLICIT");
    if (!(D2_EXPLICIT_CHANGE_DEPENDENCIES as readonly string[]).includes(dependency)) fail("DEPENDENCY_NOT_EXPLICIT");
    civilDependency = dependency as D2R10LineageRecord["civilDependency"];
  }
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const lineageId = explicit(input.lineageId, "LINEAGE_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({
    lineageId,
    contextId: source.contextId,
    source,
    target,
    relationshipType,
    civilDependency,
    authoritative,
    candidate: input.candidate === true,
    citedCurrentness: cited,
    provenanceRef,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.lineage.find((row) => row.lineageId === lineageId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("LINEAGE_ALREADY_RECORDED");
  }
  const signature = `${pinKey(source)}|${pinKey(target)}|${relationshipType}|${civilDependency ?? ""}`;
  if (store.lineage.some((row) => row.contextId === source.contextId && `${pinKey(row.source)}|${pinKey(row.target)}|${row.relationshipType}|${row.civilDependency ?? ""}` === signature)) fail("DUPLICATE_LINEAGE_REJECTED");
  const before = snapshot(store);
  const record: D2R10LineageRecord = Object.freeze({
    lineageId,
    contextId: source.contextId,
    source,
    target,
    relationshipType,
    civilDependency,
    authoritative,
    candidate: input.candidate === true,
    citedCurrentness: cited,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  store.lineage.push(record);
  remember(store, "LINEAGE", record.lineageId, record.fingerprint);
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return record;
}

export function recordCivilSupersession(store: D2R10Store, actor: D2R10Actor, input: D2R10SupersessionInput): D2R10SupersessionRecord {
  assertRecorder(actor, true);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const predecessor = live(store, actor, contextId, input.predecessor, "STALE");
  const successor = live(store, actor, contextId, input.successor, cited === "SUPERSEDED" ? "CURRENT" : cited);
  if (predecessor.subjectKind !== successor.subjectKind) fail("SUPERSESSION_KIND_MISMATCH");
  if (pinKey(predecessor) === pinKey(successor)) fail("SUPERSESSION_SELF_REJECTED");
  const beforeEdges = store.lineage.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const supersessionId = explicit(input.supersessionId, "SUPERSESSION_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({ supersessionId, contextId, predecessor, successor, provenanceRef });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.supersessions.find((row) => row.supersessionId === supersessionId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("SUPERSESSION_ALREADY_RECORDED");
  }
  const before = snapshot(store);
  const record: D2R10SupersessionRecord = Object.freeze({
    supersessionId,
    contextId,
    predecessor,
    successor,
    deleted: false,
    invalid: false,
    historicalEdgesRewritten: false,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  store.supersessions.push(record);
  remember(store, "SUPERSESSION", record.supersessionId, record.fingerprint);
  const mark = markOf(store, actor, `mark-${supersessionId}`, predecessor, "SUPERSEDED", provenanceRef);
  store.marks.push(mark);
  remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  if (store.lineage.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|") !== beforeEdges) fail("HISTORICAL_REFERENCE_REWRITTEN");
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return record;
}

function markOf(store: D2R10Store, actor: D2R10Actor, eventId: string, subject: D2R10Pin, currentness: Currentness, provenanceRef: string): D2R10CurrentnessMark {
  const fingerprint = fingerprintCanonical({ eventId, subject, currentness, provenanceRef, engineeringInvalid: false });
  return Object.freeze({
    eventId,
    contextId: subject.contextId,
    subject,
    currentness,
    engineeringInvalid: false,
    engineeringRejected: false,
    contentMutated: false,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
}

function downstream(store: D2R10Store, origin: D2R10Pin): D2R10Pin[] {
  const found: D2R10Pin[] = [];
  const seen = new Set<string>([pinKey(origin)]);
  let frontier = [origin];
  for (let depth = 0; depth < THREAD_DEFAULT_MAX_DEPTH && frontier.length > 0; depth += 1) {
    const next: D2R10Pin[] = [];
    for (const pin of frontier) {
      for (const edge of store.lineage) {
        if (!edge.authoritative || edge.candidate || edge.contextId !== origin.contextId) continue;
        if (pinKey(edge.source) !== pinKey(pin)) continue;
        if (!PROPAGATION_RELATIONS.has(edge.relationshipType)) continue;
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

export function recordCivilCurrentness(store: D2R10Store, actor: D2R10Actor, input: D2R10CurrentnessInput): D2R10CurrentnessMark[] {
  assertRecorder(actor, true);
  assertProhibited(input);
  assertScope(actor, input);
  const currentness = currentnessOf(input.currentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const subject = live(store, actor, contextId, input.subject, currentness === "CURRENT" ? "CURRENT" : "STALE");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const eventId = explicit(input.eventId, "CURRENTNESS_EVENT_REQUIRED");
  const fingerprint = fingerprintCanonical({ eventId, subject, currentness, provenanceRef, propagate: input.propagate === true });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.marks.find((row) => row.eventId === eventId);
  if (existing) {
    if (existing.fingerprint === fingerprintCanonical({ eventId, subject, currentness, provenanceRef, engineeringInvalid: false }) && existing.tenantId === actor.tenantId) return [existing];
    fail("CURRENTNESS_ALREADY_RECORDED");
  }
  const before = snapshot(store);
  const created = [markOf(store, actor, eventId, subject, currentness, provenanceRef)];
  if (input.propagate === true && currentness !== "CURRENT") {
    downstream(store, subject).forEach((pin, index) => {
      const propagated = currentness === "SUPERSEDED" ? "REASSESSMENT_REQUIRED" : currentness;
      created.push(markOf(store, actor, `${eventId}-${index + 1}`, pin, propagated, provenanceRef));
    });
  }
  for (const mark of created) {
    store.marks.push(mark);
    remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  }
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return created;
}

export function repointHistoricalReference(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function inferCivilLineage(): never {
  return fail("INFERRED_LINEAGE_REJECTED");
}

export function redesignFromCurrentness(): never {
  return fail("REDESIGN_NOT_IN_R10");
}

export function recalculateFromCurrentness(): never {
  return fail("RECALCULATION_NOT_IN_R10");
}

export function optimizeFromCurrentness(): never {
  return fail("OPTIMIZATION_NOT_IN_R10");
}
