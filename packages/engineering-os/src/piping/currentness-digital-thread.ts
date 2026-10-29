/**
 * EOS-D5-R10 — Piping currentness and digital thread.
 * One bounded runtime. Records explicit lineage, supersession, and currentness
 * across exact D5 R1-R9 revisions. Reuses canonical currentness, digital-thread,
 * and fingerprint mechanisms. Does not rewrite history, infer lineage, mutate
 * engineering, transfer validation, or start D9.
 */
import {
  D5_CURRENTNESS_STATES,
  D5_IMPLEMENTATION_PHASES,
  D5_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D5_DIGITAL_THREAD_CREATED,
} from "@rtb/types";
import { isGovernedRelationType } from "../decision-intelligence/relations";
import { relationSemantics } from "../digital-thread/relation-semantics";
import { THREAD_DEFAULT_MAX_DEPTH } from "../digital-thread/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED } from "../structural-systems/interface-handoff-governance";
import { D5_CONTEXT_AUTHORITY, D5_DISCIPLINE, D5_EXPLICIT_RELATIONSHIP_KINDS, type D5R1Actor } from "./identity-foundation";
import { D5_R7_DEPENDENCY_TARGETS } from "./requirements-assumptions-change";
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
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT as R9_THREAD_COUNT,
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
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY,
  D5_RUNTIME_COUNT as R9_RUNTIME_COUNT,
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
  type D5R9Store,
} from "./review-validation-governance";

export const D5_R10_STATUS = "CURRENTNESS_AND_DIGITAL_THREAD_IMPLEMENTED" as const;
export const D5_R10_MATURITY = D5_R10_STATUS;
export const D5_R10_MATURITY_STATE = D5_R10_STATUS;
export const D5_R10_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D5_R10_CURRENTNESS_AND_DIGITAL_THREAD_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 10 as const;
export const D5_R9_RUNTIME_COUNT = R9_RUNTIME_COUNT;
export const D5_R9_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = R9_THREAD_COUNT;
export const D5_CURRENTNESS_DIGITAL_THREAD_RUNTIME_IMPLEMENTED = true as const;
export const D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 1 as const;
export const D5_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = true as const;
export const D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY_REUSED = D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY;
export const D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY_REUSED = D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY;
export const D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY_REUSED = D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY;
export const D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY_REUSED = D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY;
export const D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY_REUSED = D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY;
export const D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_READY_REUSED = D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_READY;
export const D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY_REUSED = D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY;
export const D5_DISCIPLINE_INTERFACE_RUNTIME_READY_REUSED = D5_DISCIPLINE_INTERFACE_RUNTIME_READY;
export const D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY_REUSED = D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY;
export { D5_REUSES_CANONICAL_CURRENTNESS, D5_REUSES_CANONICAL_DIGITAL_THREAD, D5_REUSES_CANONICAL_FINGERPRINT, PARALLEL_D5_CURRENTNESS_ENGINE_CREATED, PARALLEL_D5_DIGITAL_THREAD_CREATED, SECOND_D5_FINGERPRINT_ALGORITHM_CREATED };
export const D5_R10_THREAD_DEPTH_REUSED = THREAD_DEFAULT_MAX_DEPTH;
export const D5_CANONICAL_FINGERPRINT_INTEGRATED = true as const;
export const D5_R1_R9_THREAD_FINGERPRINT_TRACEABLE = true as const;
export const D5_R1_R9_EXACT_SOURCE_REVISIONS_REUSED = true as const;
export const EXACT_D5_DIGITAL_THREAD_REVISION_REQUIRED = true as const;
export const FLOATING_D5_DIGITAL_THREAD_REFERENCE_ALLOWED = false as const;
export const D5_DIGITAL_THREAD_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_EXPLICIT_LINEAGE_SUPPORTED = true as const;
export const D5_INFERRED_LINEAGE_ALLOWED = false as const;
export const D5_R1_R9_DIGITAL_THREAD_TRACEABLE = true as const;
export const D5_SUPERSESSION_CURRENTNESS_INTEGRATED = true as const;
export const SUPERSEDED_D5_REVISION_EXPOSED_AS_CURRENT = false as const;
export const STALE_D5_REVISION_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D5_REVISION_DELETED = false as const;
export const D5_SUPERSESSION_HISTORY_PRESERVED = true as const;
export const D5_HISTORICAL_REFERENCE_AUTO_REPOINT_ALLOWED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_HISTORICAL_LINEAGE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_R7_CHANGE_CURRENTNESS_INTEGRATED = true as const;
export const D5_R7_REASSESSMENT_CURRENTNESS_INTEGRATED = true as const;
export const REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_VALIDATED = false as const;
export const REASSESSMENT_REQUIRED_D5_RECORD_EXPOSED_AS_UNCHANGED_CURRENT_ENGINEERING = false as const;
export const D5_R9_REVIEW_CURRENTNESS_INTEGRATED = true as const;
export const D5_R9_VALIDATION_CURRENTNESS_INTEGRATED = true as const;
export const PRIOR_D5_REVIEW_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const PRIOR_D5_VALIDATION_AUTO_TRANSFERS_TO_NEW_REVISION = false as const;
export const STALE_D5_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D5_VALIDATION_EXPOSED_AS_CURRENT = false as const;
export const D5_R8_INTERFACE_CURRENTNESS_INTEGRATED = true as const;
export const D5_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_INTERFACE_COUNTERPART_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const STALE_D5_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const D5_R6_EVIDENCE_CURRENTNESS_INTEGRATED = true as const;
export const SUPERSEDED_STRESS_EVIDENCE_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_NDE_EVIDENCE_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_TEST_EVIDENCE_EXPOSED_AS_CURRENT = false as const;
export const D5_R5_ROUTING_FABRICATION_CURRENTNESS_INTEGRATED = true as const;
export const D5_R4_COMPONENT_CONNECTION_CURRENTNESS_INTEGRATED = true as const;
export const D5_R3_DESIGN_SPECIFICATION_CURRENTNESS_INTEGRATED = true as const;
export const NEW_SOURCE_CONDITION_AUTO_REPLACES_ADOPTED_D5_CONDITION = false as const;
export const NEW_SPECIFICATION_REVISION_AUTO_ADOPTED = false as const;
export const CURRENT_D5_RECORD_EQUALS_VALIDATED = false as const;
export const STALE_D5_RECORD_EQUALS_INVALID = false as const;
export const SUPERSEDED_D5_RECORD_EQUALS_INVALID = false as const;
export const D5_R10_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D5_R10_AUTO_MUTATES_R3_SPECIFICATION = false as const;
export const D5_R10_AUTO_MUTATES_R4_COMPONENT_CONTEXT = false as const;
export const D5_R10_AUTO_MUTATES_R5_ROUTING_CONTEXT = false as const;
export const D5_R10_AUTO_MUTATES_R6_EVIDENCE = false as const;
export const D5_R10_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D5_R10_AUTO_MUTATES_R8_INTERFACE_HANDOFF = false as const;
export const D5_R10_AUTO_MUTATES_R9_VALIDATION_STATE = false as const;
export const D5_R10_EXPLICIT_RELATIONSHIP_REQUIRED_FOR_PROPAGATION = true as const;
export const D5_R10_INFERRED_PROPAGATION_ALLOWED = false as const;
export const D5_R10_PROVENANCE_REQUIRED = true as const;
export const D5_R10_PROVENANCE_PRESERVED = true as const;
export const D5_R10_HISTORY_PRESERVED = true as const;
export const SILENT_D5_R10_MUTATION_ALLOWED = false as const;
export const TENANT_WORKSPACE_PROJECT_D5_R10_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D5_DIGITAL_THREAD_ACCESS_ALLOWED = false as const;
export { AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY, ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY };
export const AI_CAN_INFER_AUTHORITATIVE_D5_LINEAGE = false as const;
export const ADMIN_CAN_SILENTLY_REPOINT_D5_HISTORY = false as const;
export const D5_R10_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R10_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R10_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export {
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
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
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
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
};
export const UNAUTHORIZED_D5_R11_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PARALLEL_CURRENTNESS_ENGINE = false as const;
export const UNAUTHORIZED_PARALLEL_DIGITAL_THREAD = false as const;
export const UNAUTHORIZED_SECOND_FINGERPRINT = false as const;
export const UNAUTHORIZED_INFERRED_LINEAGE = false as const;
export const UNAUTHORIZED_HISTORY_AUTO_REPOINT = false as const;
export const UNAUTHORIZED_ENGINEERING_RECALCULATION = false as const;
export const UNAUTHORIZED_ENGINEERING_REDESIGN = false as const;
export const UNAUTHORIZED_VALIDATION_PROMOTION = false as const;
export const D5_R10_SUBJECT_KINDS = ["CONTEXT", "OBJECT", "SYSTEM", "LINE", "SERVICE", "CONDITION", "SPECIFICATION", "COMPONENT", "CONNECTION", "VALVE", "ROUTE", "ISOMETRIC", "SPOOL", "WELD", "STRESS", "SUPPORT", "INSPECTION", "NDE", "TEST", "REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE", "REASSESSMENT", "HANDOFF", "REVIEW_REQUEST", "FINDING", "COMPLETION", "VALIDATION"] as const;

export const D5_R11_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[10];
export const D5_R11_PHASE_TYPE = "D9_SOURCE_CONTRACT" as const;
export const D5_R11_CANONICAL_SCOPE = "Implement exactly one governed D5 Piping source contract for future D9 consumption using exact R1-R10 revisions. Expose existing governed Piping facts and metadata, including identity, system/line/service context, design conditions, specifications/classes, components/connections/valves, routing/fabrication, stress/support/test evidence, requirements/assumptions/decisions/change, interfaces, review/validation, currentness, lineage, authority, limitations, provenance and fingerprint. The source contract must not create new engineering facts, derive values, perform calculations, fabricate counterparts, infer lineage, transfer engineering authority or perform D9 reasoning. D9 runtime must remain 0." as const;
export const D5_R11_STARTED = false as const;
export const D5_R10_READY_FOR_NEXT_PHASE = true as const;
export const D5_R10_NEXT_PHASE = D5_R11_CANONICAL_PHASE;
export const D5_R10_NEXT_PHASE_TYPE = D5_R11_PHASE_TYPE;
export const D5_R10_CANONICAL_NEXT_PHASE = D5_R11_CANONICAL_PHASE;
export const D5_R10_CANONICAL_NEXT_PHASE_SCOPE = D5_R11_CANONICAL_SCOPE;
export const D5_R10_BLOCKER = "NONE" as const;
export const D5_R10_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["matching_tag", "matching_line_number", "matching_filename", "semantic_similarity", "component_similarity", "drawing_proximity", "timestamp", "ai_inference", "inferred", "filename", "line_number", "proximity", "similar_value", "ai_similarity"]);
const PROPAGATION_RELATIONS = new Set(["DEPENDS_ON", "BASED_ON", "AFFECTS", "USES", "SUPPORTED_BY", "CONSTRAINED_BY", "PARENT", "OBJECT_REFERENCE", "REVIEWS"]);

type Currentness = (typeof D5_CURRENTNESS_STATES)[number];
type SubjectKind = (typeof D5_R10_SUBJECT_KINDS)[number];

type Prohibited = {
  infer?: boolean;
  identicalTags?: boolean;
  lineNumber?: boolean;
  filename?: boolean;
  semantic?: boolean;
  componentSimilarity?: boolean;
  drawingProximity?: boolean;
  timestamp?: boolean;
  repoint?: boolean;
  mutateR3?: boolean;
  mutateSpecification?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateR7?: boolean;
  mutateR8?: boolean;
  mutateR9?: boolean;
  recalculate?: boolean;
  redesign?: boolean;
  replaceCondition?: boolean;
  adoptSpecification?: boolean;
  transferReview?: boolean;
  transferValidation?: boolean;
  validate?: boolean;
  d9?: boolean;
  reason?: boolean;
};

export type D5R10Actor = D5R1Actor & { actorKind?: string };

export type D5R10Pin = {
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

export type D5R10LineageInput = Prohibited & {
  lineageId: string;
  contextId: string;
  source: Endpoint;
  target: Endpoint;
  relationshipType: string;
  pipingDependency?: string | null;
  authoritative?: boolean;
  candidate?: boolean;
  citedCurrentness: string;
  provenanceRef: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D5R10LineageRecord = {
  lineageId: string;
  contextId: string;
  source: D5R10Pin;
  target: D5R10Pin;
  relationshipType: string;
  pipingDependency: (typeof D5_R7_DEPENDENCY_TARGETS)[number] | null;
  authoritative: boolean;
  candidate: boolean;
  citedCurrentness: Currentness;
  engineeringValidated: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT";
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D5R10SupersessionInput = Prohibited & {
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

export type D5R10SupersessionRecord = {
  supersessionId: string;
  contextId: string;
  predecessor: D5R10Pin;
  successor: D5R10Pin;
  deleted: false;
  historicalEdgesRewritten: false;
  provenanceRef: string;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D5R10CurrentnessInput = Prohibited & {
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

export type D5R10CurrentnessMark = {
  eventId: string;
  contextId: string;
  subject: D5R10Pin;
  currentness: Currentness;
  engineeringInvalid: false;
  engineeringValidated: false;
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

export type D5R10History = {
  historyId: string;
  subjectKind: "LINEAGE" | "SUPERSESSION" | "CURRENTNESS";
  subjectId: string;
  action: "CREATED";
  fingerprint: string;
  recordedAt: string;
};

export type D5R10Store = {
  r9: D5R9Store;
  now: () => string;
  lineage: D5R10LineageRecord[];
  supersessions: D5R10SupersessionRecord[];
  marks: D5R10CurrentnessMark[];
  history: D5R10History[];
};

export type D5R10Trace = {
  origin: D5R10Pin;
  nodes: D5R10Pin[];
  edges: D5R10LineageRecord[];
  currentness: Currentness;
};

function fail(code: string): never {
  throw new Error(`D5_R10_${code}`);
}

function blockedParty(value: string): boolean {
  const token = value.toUpperCase();
  return token === "AI" || token.startsWith("AI_") || token.startsWith("AI-") || token.startsWith("AI ") || token.includes("LLM") || token.includes("OPTIMIZER");
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase())) fail(code);
  if (INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail("INFERRED_LINEAGE_REJECTED");
  return token;
}

function isCurrentness(value: string): value is Currentness {
  return (D5_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function assertProhibited(input: Prohibited): void {
  if (input.infer === true || input.identicalTags === true || input.lineNumber === true || input.filename === true || input.semantic === true || input.componentSimilarity === true || input.drawingProximity === true || input.timestamp === true) fail("INFERRED_LINEAGE_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.mutateR3 === true || input.mutateSpecification === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR4 === true) fail("R4_MUTATION_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.mutateR6 === true) fail("R6_MUTATION_REJECTED");
  if (input.mutateR7 === true) fail("R7_MUTATION_REJECTED");
  if (input.mutateR8 === true) fail("R8_MUTATION_REJECTED");
  if (input.mutateR9 === true) fail("R9_MUTATION_REJECTED");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R10");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R10");
  if (input.replaceCondition === true) fail("CONDITION_AUTO_REPLACEMENT_REJECTED");
  if (input.adoptSpecification === true) fail("SPECIFICATION_AUTO_ADOPTION_REJECTED");
  if (input.transferReview === true) fail("REVIEW_TRANSFER_REJECTED");
  if (input.transferValidation === true) fail("VALIDATION_TRANSFER_REJECTED");
  if (input.validate === true) fail("VALIDATION_NOT_IN_R10");
  if (input.d9 === true) fail("D9_NOT_STARTED");
  if (input.reason === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10");
}

function assertScope(actor: D5R10Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D5R10Actor): void {
  if (blockedParty(actor.actorId) || blockedParty(actor.authority) || actor.authority === "AI_ASSISTANT" || actor.actorKind === "ai") fail("AI_CANNOT_INFER_LINEAGE");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_CANNOT_REPOINT");
  if (actor.authority === "PIPING_ENGINEERING_AUTHORITY" || actor.authority === "REVIEWER") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function currentnessOf(value: string): Currentness {
  const cited = value.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  return cited;
}

function remember(store: D5R10Store, subjectKind: D5R10History["subjectKind"], subjectId: string, fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action: "CREATED", fingerprint, recordedAt: store.now() });
}

type Hit = { revision: string; fingerprint: string; status: string; currentness: string; contextId: string; tenantId: string };
type Row = { provenanceRef: string; fingerprint: string; recordStatus: string; currentness: string; contextId?: string; tenantId: string };

function rowHit(row: Row | undefined, revision?: string): Hit | undefined {
  if (!row) return undefined;
  return { revision: revision ?? row.provenanceRef, fingerprint: row.fingerprint, status: row.recordStatus, currentness: row.currentness, contextId: row.contextId ?? "", tenantId: row.tenantId };
}

function pinKey(pin: D5R10Pin): string {
  return `${pin.subjectKind}|${pin.subjectId}|${pin.subjectRevision}|${pin.subjectFingerprint}`;
}

function live(store: D5R10Store, actor: D5R10Actor, contextId: string, endpoint: Endpoint, cited: Currentness): D5R10Pin {
  const subjectKind = explicit(endpoint.subjectKind, "SUBJECT_KIND_REQUIRED");
  if (!(D5_R10_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("SUBJECT_KIND_INVALID");
  const subjectId = explicit(endpoint.subjectId, "SUBJECT_REFERENCE_REQUIRED");
  const subjectRevision = explicit(endpoint.subjectRevision, "SUBJECT_REVISION_REQUIRED");
  const subjectFingerprint = explicit(endpoint.subjectFingerprint, "SUBJECT_FINGERPRINT_REQUIRED");
  const r8 = store.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r1 = r4.r1;
  const context = r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (context.discipline !== D5_DISCIPLINE) fail("DISCIPLINE_NOT_PIPING");
  const kind = subjectKind as SubjectKind;
  let hit: Hit | undefined;
  if (kind === "CONTEXT") {
    if (subjectId !== context.contextId) fail("SUBJECT_NOT_FOUND");
    hit = rowHit(context);
  } else if (kind === "OBJECT") hit = rowHit(r1.objects.find((row) => row.objectId === subjectId));
  else if (kind === "SYSTEM") hit = rowHit(r4.r2.systems.find((row) => row.systemRecordId === subjectId));
  else if (kind === "LINE") hit = rowHit(r4.r2.lines.find((row) => row.lineRecordId === subjectId));
  else if (kind === "SERVICE") hit = rowHit(r4.r2.services.find((row) => row.serviceRecordId === subjectId));
  else if (kind === "CONDITION") hit = rowHit(r4.r3.conditions.find((row) => row.conditionId === subjectId));
  else if (kind === "SPECIFICATION") hit = rowHit(r4.r3.specifications.find((row) => row.specificationId === subjectId));
  else if (kind === "COMPONENT") hit = rowHit(r4.components.find((row) => row.componentRecordId === subjectId));
  else if (kind === "CONNECTION") hit = rowHit(r4.connections.find((row) => row.connectionRecordId === subjectId));
  else if (kind === "VALVE") hit = rowHit(r4.valves.find((row) => row.valveRecordId === subjectId));
  else if (kind === "ROUTE") hit = rowHit(r5.routes.find((row) => row.routeRecordId === subjectId));
  else if (kind === "ISOMETRIC") hit = rowHit(r5.isometrics.find((row) => row.isometricRecordId === subjectId));
  else if (kind === "SPOOL") hit = rowHit(r5.spools.find((row) => row.spoolRecordId === subjectId));
  else if (kind === "WELD") hit = rowHit(r5.welds.find((row) => row.weldRecordId === subjectId));
  else if (kind === "STRESS") hit = rowHit(r6.stressEvidence.find((row) => row.evidenceRecordId === subjectId));
  else if (kind === "SUPPORT") hit = rowHit(r6.supports.find((row) => row.supportRecordId === subjectId));
  else if (kind === "INSPECTION") hit = rowHit(r6.inspections.find((row) => row.inspectionRecordId === subjectId));
  else if (kind === "NDE") hit = rowHit(r6.nde.find((row) => row.ndeRecordId === subjectId));
  else if (kind === "TEST") hit = rowHit(r6.tests.find((row) => row.testRecordId === subjectId));
  else if (kind === "REQUIREMENT") hit = rowHit(r7.requirements.find((row) => row.requirementId === subjectId));
  else if (kind === "ASSUMPTION") hit = rowHit(r7.assumptions.find((row) => row.assumptionId === subjectId));
  else if (kind === "DECISION") hit = rowHit(r7.decisions.find((row) => row.decisionId === subjectId));
  else if (kind === "CHANGE") hit = rowHit(r7.changes.find((row) => row.changeId === subjectId));
  else if (kind === "REASSESSMENT") hit = rowHit(r7.reassessments.find((row) => row.reassessmentId === subjectId));
  else if (kind === "HANDOFF") hit = rowHit(r8.handoffs.find((row) => row.handoffId === subjectId));
  else if (kind === "REVIEW_REQUEST") {
    const row = store.r9.requests.find((item) => item.reviewRequestId === subjectId);
    hit = rowHit(row, row?.subjectRevision);
  } else if (kind === "FINDING") {
    const row = store.r9.findings.find((item) => item.findingId === subjectId);
    hit = rowHit(row, row?.subjectRevision);
  } else if (kind === "COMPLETION") {
    const row = store.r9.completions.find((item) => item.completionId === subjectId);
    hit = rowHit(row, row?.subjectRevision);
  } else {
    const row = store.r9.validations.find((item) => item.validationId === subjectId);
    hit = rowHit(row, row?.subjectRevision);
  }
  if (!hit || hit.tenantId !== actor.tenantId) fail("SUBJECT_NOT_FOUND");
  if (hit.contextId !== "" && hit.contextId !== context.contextId) fail("SUBJECT_NOT_FOUND");
  if (hit.fingerprint !== subjectFingerprint || hit.revision !== subjectRevision) fail("SUBJECT_REVISION_MISMATCH");
  const provisional: D5R10Pin = { subjectKind: kind, subjectId, subjectRevision, subjectFingerprint, contextId: context.contextId };
  const overlaid = [...store.marks].reverse().find((row) => pinKey(row.subject) === pinKey(provisional));
  const effective = overlaid?.currentness ?? hit.currentness;
  if (cited === "CURRENT" && (hit.status !== "CURRENT" || hit.currentness !== "CURRENT" || effective !== "CURRENT")) fail("SUBJECT_NOT_CURRENT");
  if (hit.status === "SUPERSEDED" && cited !== "SUPERSEDED") fail("SUBJECT_NOT_CURRENT");
  return provisional;
}

function snapshot(store: D5R10Store): string {
  const r4 = store.r9.r8.r7.r6.r5.r4;
  const r3 = r4.r3;
  const r5 = store.r9.r8.r7.r6.r5;
  const r6 = store.r9.r8.r7.r6;
  const r7 = store.r9.r8.r7;
  const conditions = r3.conditions.map((row) => `${row.conditionId}:${row.fingerprint}:${row.designPressure.value}:${row.currentness}`).join("|");
  const specifications = r3.specifications.map((row) => `${row.specificationId}:${row.fingerprint}:${row.pipingClass}:${row.currentness}`).join("|");
  const components = r4.components.map((row) => `${row.componentRecordId}:${row.fingerprint}:${row.componentClassification}:${row.currentness}`).join("|");
  const connections = r4.connections.map((row) => `${row.connectionRecordId}:${row.fingerprint}:${row.currentness}`).join("|");
  const valves = r4.valves.map((row) => `${row.valveRecordId}:${row.fingerprint}:${row.currentness}`).join("|");
  const routes = r5.routes.map((row) => `${row.routeRecordId}:${row.fingerprint}:${row.currentness}`).join("|");
  const fabrication = [...r5.isometrics, ...r5.spools, ...r5.welds].map((row) => `${row.fingerprint}:${row.currentness}`).join("|");
  const evidence = [...r6.stressEvidence, ...r6.supports, ...r6.inspections, ...r6.nde, ...r6.tests].map((row) => `${row.fingerprint}:${row.currentness}`).join("|");
  const changes = r7.changes.map((row) => `${row.changeId}:${row.fingerprint}:${row.recalculated}:${row.redesigned}`).join("|");
  const reassessments = r7.reassessments.map((row) => `${row.reassessmentId}:${row.fingerprint}:${row.state}:${row.engineeringValidated}`).join("|");
  const handoffs = store.r9.r8.handoffs.map((row) => `${row.handoffId}:${row.fingerprint}:${row.recordStatus}:${row.engineeringValidated}:${row.counterpart?.interfaceId ?? ""}:${row.counterpart?.fingerprint ?? ""}:${row.currentness}`).join("|");
  const reviews = store.r9.requests.map((row) => `${row.reviewRequestId}:${row.subjectRevision}:${row.fingerprint}:${row.reviewCompleted}:${row.engineeringValidated}`).join("|");
  const validations = store.r9.validations.map((row) => `${row.validationId}:${row.subjectRevision}:${row.engineeringValidated}:${row.fingerprint}:${row.currentness}`).join("|");
  return `${conditions}#${specifications}#${components}#${connections}#${valves}#${routes}#${fabrication}#${evidence}#${changes}#${reassessments}#${handoffs}#${reviews}#${validations}`;
}

function downstream(store: D5R10Store, origin: D5R10Pin): D5R10Pin[] {
  const found: D5R10Pin[] = [];
  const seen = new Set<string>([pinKey(origin)]);
  let frontier = [origin];
  for (let depth = 0; depth < THREAD_DEFAULT_MAX_DEPTH && frontier.length > 0; depth += 1) {
    const next: D5R10Pin[] = [];
    for (const pin of frontier) {
      for (const edge of store.lineage) {
        if (!edge.authoritative || edge.candidate || edge.contextId !== origin.contextId) continue;
        if (pinKey(edge.source) !== pinKey(pin) || !PROPAGATION_RELATIONS.has(edge.relationshipType)) continue;
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

function markOf(store: D5R10Store, actor: D5R10Actor, eventId: string, subject: D5R10Pin, currentness: Currentness, provenanceRef: string): D5R10CurrentnessMark {
  const fingerprint = fingerprintCanonical({ eventId, subject, currentness, provenanceRef, engineeringInvalid: false, engineeringValidated: false, contentMutated: false });
  return Object.freeze({
    eventId,
    contextId: subject.contextId,
    subject,
    currentness,
    engineeringInvalid: false,
    engineeringValidated: false,
    contentMutated: false,
    recalculated: false,
    redesigned: false,
    provenanceRef,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
}

export function createD5R10Store(r9: D5R9Store, now: () => string = () => r9.now()): D5R10Store {
  return { r9, now, lineage: [], supersessions: [], marks: [], history: [] };
}

function storedCurrentness(store: D5R10Store, subject: D5R10Pin): Currentness {
  const r8 = store.r9.r8;
  const r7 = r8.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const kind = subject.subjectKind;
  let currentness = "";
  if (kind === "CONTEXT") currentness = r4.r1.contexts.find((row) => row.contextId === subject.subjectId)?.currentness ?? "";
  else if (kind === "OBJECT") currentness = r4.r1.objects.find((row) => row.objectId === subject.subjectId && row.fingerprint === subject.subjectFingerprint)?.currentness ?? "";
  else if (kind === "SYSTEM") currentness = r4.r2.systems.find((row) => row.systemRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "LINE") currentness = r4.r2.lines.find((row) => row.lineRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "SERVICE") currentness = r4.r2.services.find((row) => row.serviceRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "CONDITION") currentness = r4.r3.conditions.find((row) => row.conditionId === subject.subjectId)?.currentness ?? "";
  else if (kind === "SPECIFICATION") currentness = r4.r3.specifications.find((row) => row.specificationId === subject.subjectId)?.currentness ?? "";
  else if (kind === "COMPONENT") currentness = r4.components.find((row) => row.componentRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "CONNECTION") currentness = r4.connections.find((row) => row.connectionRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "VALVE") currentness = r4.valves.find((row) => row.valveRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "ROUTE") currentness = r5.routes.find((row) => row.routeRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "ISOMETRIC") currentness = r5.isometrics.find((row) => row.isometricRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "SPOOL") currentness = r5.spools.find((row) => row.spoolRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "WELD") currentness = r5.welds.find((row) => row.weldRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "STRESS") currentness = r6.stressEvidence.find((row) => row.evidenceRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "SUPPORT") currentness = r6.supports.find((row) => row.supportRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "INSPECTION") currentness = r6.inspections.find((row) => row.inspectionRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "NDE") currentness = r6.nde.find((row) => row.ndeRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "TEST") currentness = r6.tests.find((row) => row.testRecordId === subject.subjectId)?.currentness ?? "";
  else if (kind === "REQUIREMENT") currentness = r7.requirements.find((row) => row.requirementId === subject.subjectId)?.currentness ?? "";
  else if (kind === "ASSUMPTION") currentness = r7.assumptions.find((row) => row.assumptionId === subject.subjectId)?.currentness ?? "";
  else if (kind === "DECISION") currentness = r7.decisions.find((row) => row.decisionId === subject.subjectId)?.currentness ?? "";
  else if (kind === "CHANGE") currentness = r7.changes.find((row) => row.changeId === subject.subjectId)?.currentness ?? "";
  else if (kind === "REASSESSMENT") currentness = r7.reassessments.find((row) => row.reassessmentId === subject.subjectId)?.currentness ?? "";
  else if (kind === "HANDOFF") currentness = r8.handoffs.find((row) => row.handoffId === subject.subjectId)?.currentness ?? "";
  else if (kind === "REVIEW_REQUEST") currentness = store.r9.requests.find((row) => row.reviewRequestId === subject.subjectId)?.currentness ?? "";
  else if (kind === "FINDING") currentness = store.r9.findings.find((row) => row.findingId === subject.subjectId)?.currentness ?? "";
  else if (kind === "COMPLETION") currentness = store.r9.completions.find((row) => row.completionId === subject.subjectId)?.currentness ?? "";
  else currentness = store.r9.validations.find((row) => row.validationId === subject.subjectId)?.currentness ?? "";
  if (!isCurrentness(currentness)) fail("CURRENTNESS_INVALID");
  return currentness;
}

export function exposedPipingCurrentness(store: D5R10Store, subject: D5R10Pin): Currentness {
  const latest = [...store.marks].reverse().find((row) => pinKey(row.subject) === pinKey(subject));
  return latest?.currentness ?? storedCurrentness(store, subject);
}

export function recordPipingLineage(store: D5R10Store, actor: D5R10Actor, input: D5R10LineageInput): D5R10LineageRecord {
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
  const identity = (D5_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(relationshipType);
  if (!identity && (!isGovernedRelationType(relationshipType) || !relationSemantics(relationshipType))) fail("RELATION_NOT_GOVERNED");
  let pipingDependency: D5R10LineageRecord["pipingDependency"] = null;
  if (input.pipingDependency != null && input.pipingDependency !== "") {
    const dependency = explicit(input.pipingDependency, "DEPENDENCY_NOT_EXPLICIT");
    if (!(D5_R7_DEPENDENCY_TARGETS as readonly string[]).includes(dependency)) fail("DEPENDENCY_NOT_EXPLICIT");
    pipingDependency = dependency as D5R10LineageRecord["pipingDependency"];
  }
  if (downstream(store, target).some((pin) => pinKey(pin) === pinKey(source))) fail("CIRCULAR_LINEAGE_REJECTED");
  const authoritative = input.authoritative !== false && input.candidate !== true;
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const lineageId = explicit(input.lineageId, "LINEAGE_ID_REQUIRED");
  const fingerprint = fingerprintCanonical({
    lineageId, contextId: source.contextId, source, target, relationshipType, pipingDependency, authoritative, candidate: input.candidate === true, citedCurrentness: cited, provenanceRef, engineeringValidated: false,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.lineage.find((row) => row.lineageId === lineageId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("LINEAGE_ALREADY_RECORDED");
  const signature = `${pinKey(source)}|${pinKey(target)}|${relationshipType}|${pipingDependency ?? ""}`;
  if (store.lineage.some((row) => row.contextId === source.contextId && `${pinKey(row.source)}|${pinKey(row.target)}|${row.relationshipType}|${row.pipingDependency ?? ""}` === signature)) fail("DUPLICATE_LINEAGE_REJECTED");
  const before = snapshot(store);
  const record: D5R10LineageRecord = Object.freeze({
    lineageId,
    contextId: source.contextId,
    source,
    target,
    relationshipType,
    pipingDependency,
    authoritative,
    candidate: input.candidate === true,
    citedCurrentness: cited,
    engineeringValidated: false,
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

export function recordPipingSupersession(store: D5R10Store, actor: D5R10Actor, input: D5R10SupersessionInput): D5R10SupersessionRecord {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const predecessor = live(store, actor, contextId, input.predecessor, "STALE");
  const successor = live(store, actor, contextId, input.successor, cited === "SUPERSEDED" ? "CURRENT" : cited);
  if (predecessor.subjectKind !== successor.subjectKind) fail("SUPERSESSION_KIND_MISMATCH");
  if (pinKey(predecessor) === pinKey(successor)) fail("SUPERSESSION_SELF_REJECTED");
  if (exposedPipingCurrentness(store, predecessor) === "SUPERSEDED") fail("FALSE_SUPERSESSION_REJECTED");
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
  const record: D5R10SupersessionRecord = Object.freeze({
    supersessionId,
    contextId,
    predecessor,
    successor,
    deleted: false,
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
  if (mark.currentness === "CURRENT" || mark.engineeringValidated) fail("SUPERSEDED_EXPOSED_AS_CURRENT");
  store.marks.push(mark);
  remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  if (store.lineage.map((row) => `${pinKey(row.source)}>${pinKey(row.target)}`).join("|") !== beforeEdges) fail("HISTORICAL_REFERENCE_REWRITTEN");
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  if (record.deleted || record.historicalEdgesRewritten) fail("HISTORICAL_REFERENCE_REWRITTEN");
  return record;
}

export function recordPipingCurrentness(store: D5R10Store, actor: D5R10Actor, input: D5R10CurrentnessInput): D5R10CurrentnessMark[] {
  assertRecorder(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const currentness = currentnessOf(input.currentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const subject = live(store, actor, contextId, input.subject, currentness === "CURRENT" ? "CURRENT" : "STALE");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const eventId = explicit(input.eventId, "CURRENTNESS_EVENT_REQUIRED");
  const root = markOf(store, actor, eventId, subject, currentness, provenanceRef);
  if (input.assertedFingerprint != null && input.assertedFingerprint !== root.fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.marks.find((row) => row.eventId === eventId);
  if (existing) return existing.fingerprint === root.fingerprint && existing.tenantId === actor.tenantId ? [existing] : fail("CURRENTNESS_ALREADY_RECORDED");
  const latest = [...store.marks].reverse().find((row) => pinKey(row.subject) === pinKey(subject));
  if (currentness === "CURRENT" && latest && latest.currentness !== "CURRENT") fail("CURRENTNESS_PROMOTION_REJECTED");
  if (currentness !== "CURRENT" && root.currentness === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  if (currentness === "REASSESSMENT_REQUIRED" && (root.engineeringValidated || root.currentness === "CURRENT")) fail("REASSESSMENT_EXPOSED_AS_VALIDATED");
  const before = snapshot(store);
  const created = [root];
  if (input.propagate === true && currentness !== "CURRENT") {
    const propagated = currentness === "SUPERSEDED" ? "REASSESSMENT_REQUIRED" : currentness;
    downstream(store, subject).forEach((pin, index) => {
      created.push(markOf(store, actor, `${eventId}-${index + 1}`, pin, propagated, provenanceRef));
    });
  }
  for (const mark of created) {
    if (mark.currentness !== "CURRENT" && mark.engineeringValidated) fail("STALE_EXPOSED_AS_CURRENT");
    if (mark.contentMutated || mark.recalculated || mark.redesigned) fail("CONTENT_MUTATION_REJECTED");
    store.marks.push(mark);
    remember(store, "CURRENTNESS", mark.eventId, mark.fingerprint);
  }
  if (snapshot(store) !== before) fail("CONTENT_MUTATION_REJECTED");
  return created;
}

export function tracePipingDigitalThread(store: D5R10Store, actor: D5R10Actor, input: { contextId: string; subject: Endpoint; citedCurrentness: string; tenantId?: string; workspaceId?: string; projectId?: string }): D5R10Trace {
  assertRecorder(actor);
  assertScope(actor, input);
  const cited = currentnessOf(input.citedCurrentness);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const origin = live(store, actor, contextId, input.subject, cited);
  const nodes = [origin, ...downstream(store, origin)];
  const keys = new Set(nodes.map(pinKey));
  const edges = store.lineage.filter((edge) => edge.contextId === origin.contextId && edge.authoritative && !edge.candidate && keys.has(pinKey(edge.source)) && keys.has(pinKey(edge.target)));
  const currentness = exposedPipingCurrentness(store, origin);
  if (currentness !== "CURRENT" && cited === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  return { origin, nodes, edges, currentness };
}

export function repointPipingDigitalThread(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function inferPipingLineage(): never {
  return fail("INFERRED_LINEAGE_REJECTED");
}

export function replaceAdoptedConditionFromCurrentness(): never {
  return fail("CONDITION_AUTO_REPLACEMENT_REJECTED");
}

export function adoptSpecificationRevisionFromCurrentness(): never {
  return fail("SPECIFICATION_AUTO_ADOPTION_REJECTED");
}

export function transferPipingReviewFromCurrentness(): never {
  return fail("REVIEW_TRANSFER_REJECTED");
}

export function transferPipingValidationFromCurrentness(): never {
  return fail("VALIDATION_TRANSFER_REJECTED");
}

export function mutateConditionFromCurrentness(): never {
  return fail("R3_MUTATION_REJECTED");
}

export function mutateSpecificationFromCurrentness(): never {
  return fail("R3_MUTATION_REJECTED");
}

export function mutateComponentFromCurrentness(): never {
  return fail("R4_MUTATION_REJECTED");
}

export function mutateRouteFromCurrentness(): never {
  return fail("R5_MUTATION_REJECTED");
}

export function mutateEvidenceFromCurrentness(): never {
  return fail("R6_MUTATION_REJECTED");
}

export function mutateChangeFromCurrentness(): never {
  return fail("R7_MUTATION_REJECTED");
}

export function mutateHandoffFromCurrentness(): never {
  return fail("R8_MUTATION_REJECTED");
}

export function mutateValidationFromCurrentness(): never {
  return fail("R9_MUTATION_REJECTED");
}

export function recalculateFromPipingCurrentness(): never {
  return fail("RECALCULATION_NOT_IN_R10");
}

export function redesignFromPipingCurrentness(): never {
  return fail("REDESIGN_NOT_IN_R10");
}

export function validateFromPipingCurrentness(): never {
  return fail("VALIDATION_NOT_IN_R10");
}

export function reasonAcrossPipingCurrentness(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R10");
}
