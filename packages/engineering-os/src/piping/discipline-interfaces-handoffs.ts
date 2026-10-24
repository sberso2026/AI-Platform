/**
 * EOS-D5-R8 Piping discipline interfaces and handoffs.
 * One bounded runtime. Reuses canonical interface governance and exact R1-R7 revisions.
 * A handoff cites an exact counterpart. It does not transfer authority or validate that discipline.
 */
import {
  D5_CREATES_AUTHORITATIVE_PROCESS_DESIGN,
  D5_CURRENTNESS_STATES,
  D5_D1_FUTURE_CONTRACT_SUBJECTS,
  D5_D2_FUTURE_CONTRACT_SUBJECTS,
  D5_D3_CREATES_GEOTECHNICAL_CONCLUSION,
  D5_D3_FUTURE_CONTRACT_SUBJECTS,
  D4_MECHANICAL_OBJECT_TYPES,
  D5_D4_INTERFACE_SUBJECTS,
  D5_D4_REUSES_D4_FUTURE_PIPING_CONTRACT,
  D5_D6_FUTURE_CONTRACT_SUBJECTS,
  D5_D7_FUTURE_CONTRACT_SUBJECTS,
  D5_D8_FUTURE_CONTRACT_SUBJECTS,
  D5_IMPLEMENTATION_PHASE_TYPES,
  D5_IMPLEMENTATION_PHASES,
  D5_INSTRUMENT_CONNECTION_CONTEXT_EQUALS_IAC_DESIGN,
  D5_MATURITY_STATES,
  D5_TRANSFERS_CIVIL_AUTHORITY,
  D5_TRANSFERS_ELECTRICAL_AUTHORITY,
  D5_TRANSFERS_GEOTECHNICAL_AUTHORITY,
  D5_TRANSFERS_IAC_AUTHORITY,
  D5_TRANSFERS_MECHANICAL_AUTHORITY,
  D5_TRANSFERS_PROCESS_AUTHORITY,
  D5_TRANSFERS_STRUCTURAL_AUTHORITY,
  MECHANICAL_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN,
  PIPING_CONNECTION_CONTEXT_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
  PIPING_HEAT_TRACING_REQUIREMENT_EQUALS_ELECTRICAL_DESIGN,
  PIPING_SUPPORT_REQUIREMENT_EQUALS_STRUCTURAL_SUPPORT_DESIGN,
} from "@rtb/types";
import { D2_R8_HANDOFF_STATUSES } from "../civil/discipline-interfaces-handoffs";
import type { D2R1Store } from "../civil/identity-foundation";
import { assertHumanApprovalActor } from "../decision-intelligence/invariants";
import type { D3R1Store } from "../geotechnical/identity-foundation";
import type { D4R1Store } from "../mechanical/identity-foundation";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1K_R3_AI_CAN_APPROVE_INTERFACE,
  D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED,
} from "../structural-systems/interface-handoff-governance";
import type { D1kR1Store } from "../structural-systems/interface-identity-foundation";
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
  D5_CONSTRUCTABILITY_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT as R7_INTERFACE_COUNT,
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
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY,
  D5_RUNTIME_COUNT as R7_RUNTIME_COUNT,
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
  type D5R7Store,
} from "./requirements-assumptions-change";

export const D5_R8_STATUS = "DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED" as const;
export const D5_R8_MATURITY = D5_R8_STATUS;
export const D5_R8_MATURITY_STATE = D5_R8_STATUS;
export const D5_R8_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 8 as const;
export const D5_R7_RUNTIME_COUNT = R7_RUNTIME_COUNT;
export const D5_R7_DISCIPLINE_INTERFACE_RUNTIME_COUNT = R7_INTERFACE_COUNT;
export const D5_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED = true as const;
export const D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 1 as const;
export const D5_DISCIPLINE_INTERFACE_RUNTIME_READY = true as const;
export const D5_REUSES_CANONICAL_INTERFACE_GOVERNANCE = true as const;
export const PARALLEL_D5_INTERFACE_FRAMEWORK_CREATED = false as const;
export const D5_R1_R7_EXACT_SOURCE_REVISIONS_REUSED = true as const;
export const EXACT_D5_INTERFACE_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D5_INTERFACE_SOURCE_REFERENCE_ALLOWED = false as const;
export const D5_INTERFACE_SOURCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_D1_HANDOFF_IMPLEMENTED = true as const;
export const EXACT_D1_COUNTERPART_REVISION_REQUIRED = true as const;
export const PIPING_SUPPORT_LOAD_REFERENCE_EQUALS_STRUCTURAL_VALIDATION = false as const;
export const D5_R8_VALIDATES_D1_STRUCTURAL_ENGINEERING = false as const;
export const D5_D2_HANDOFF_IMPLEMENTED = true as const;
export const EXACT_D2_COUNTERPART_REVISION_REQUIRED = true as const;
export const D5_R8_VALIDATES_D2_CIVIL_ENGINEERING = false as const;
export const D5_D3_HANDOFF_IMPLEMENTED = true as const;
export const EXACT_D3_COUNTERPART_REVISION_REQUIRED = true as const;
export const D5_R8_VALIDATES_D3_GEOTECHNICAL_ENGINEERING = false as const;
export const D5_D4_HANDOFF_IMPLEMENTED = true as const;
export const EXACT_D4_COUNTERPART_REVISION_REQUIRED = true as const;
export const D5_R8_VALIDATES_D4_MECHANICAL_ENGINEERING = false as const;
export const D5_D6_FUTURE_INTERFACE_CONTRACT_DEFINED = true as const;
export const D5_D7_FUTURE_INTERFACE_CONTRACT_DEFINED = true as const;
export const D5_D8_FUTURE_INTERFACE_CONTRACT_DEFINED = true as const;
export const D5_EXACT_COUNTERPART_REFERENCE_REQUIRED = true as const;
export const D5_INFERRED_COUNTERPART_REFERENCE_ALLOWED = false as const;
export const D5_MISSING_COUNTERPART_AUTO_FABRICATED = false as const;
export const MISSING_D5_COUNTERPART_EQUALS_INTERFACE_COMPLETE = false as const;
export const D5_INTERFACE_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D5_INTERFACE_COUNTERPART_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const STALE_D5_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const D5_R7_CHANGE_INTERFACE_INTEGRATION_IMPLEMENTED = true as const;
export const D5_R8_CHANGE_AUTO_RECALCULATES_ENGINEERING = false as const;
export const D5_R8_CHANGE_AUTO_REDESIGNS_ENGINEERING = false as const;
export const D5_R8_CHANGE_AUTO_REVALIDATES_INTERFACE = false as const;
export const D5_R8_CHANGE_AUTO_REPOINTS_COUNTERPART = false as const;
export const D5_R8_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D5_R8_AUTO_MUTATES_R3_SPECIFICATION = false as const;
export const D5_R8_AUTO_MUTATES_R4_COMPONENT_CONTEXT = false as const;
export const D5_R8_AUTO_MUTATES_R5_ROUTING_CONTEXT = false as const;
export const D5_R8_AUTO_MUTATES_R6_EVIDENCE = false as const;
export const D5_R8_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D5_R8_VALIDATES_COUNTERPART_ENGINEERING = false as const;
export const D5_R8_TRANSFERS_DISCIPLINE_AUTHORITY = false as const;
export const AI_CAN_PROMOTE_D5_HANDOFF_TO_ENGINEERING_VALIDATED = D1K_R3_AI_CAN_APPROVE_INTERFACE;
export const D5_R8_PROVENANCE_REQUIRED = true as const;
export const D5_R8_PROVENANCE_PRESERVED = true as const;
export const SILENT_D5_R8_MUTATION_ALLOWED = false as const;
export const D5_R8_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D5_R8_SCOPE_ENFORCED = true as const;
export const D5_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R8_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R8_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D5_R8_HANDOFF_STATUSES = D2_R8_HANDOFF_STATUSES;
export const D5_R8_DIRECTIONS = ["D5_TO_COUNTERPART", "COUNTERPART_TO_D5"] as const;
export const D5_R8_LIVE_DISCIPLINES = ["structural", "civil", "geotechnical", "mechanical"] as const;
export const D5_R8_FUTURE_DISCIPLINES = ["process", "electrical", "instrumentation_control"] as const;
export const D5_R8_SUBJECT_KINDS = ["REQUIREMENT", "ASSUMPTION", "DECISION", "CHANGE"] as const;
export const UNAUTHORIZED_D5_R9_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_COUNTERPART_FABRICATION = false as const;
export const UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_COUNTERPART_VALIDATION = false as const;
export const UNAUTHORIZED_PIPING_RECALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_REDESIGN_PROMOTION = false as const;
export const D5_R9_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[8];
export const D5_R9_PHASE_TYPE = D5_IMPLEMENTATION_PHASE_TYPES[8];
export const D5_R9_CANONICAL_SCOPE =
  "Implement canonical Piping review and validation governance across exact R1-R8 revisions. Support review requests, reviewer authority, findings, disposition, completion, validation basis/state and reassessment linkage while preserving review != validation != conformance != approval != certification. AI/admin must not become Piping reviewer authority. Do not mutate engineering records, validate counterpart engineering, perform calculations, cross-discipline reasoning or start R10-R12/D6-D9 runtime." as const;
export const D5_R9_STARTED = false as const;
export const D5_R8_READY_FOR_NEXT_PHASE = true as const;
export const D5_R8_NEXT_PHASE = D5_R9_CANONICAL_PHASE;
export const D5_R8_NEXT_PHASE_TYPE = D5_R9_PHASE_TYPE;
export const D5_R8_CANONICAL_NEXT_PHASE = D5_R9_CANONICAL_PHASE;
export const D5_R8_CANONICAL_NEXT_PHASE_SCOPE = D5_R9_CANONICAL_SCOPE;
export const D5_R8_BLOCKER = "NONE" as const;
export const D5_R8_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D5_TRANSFERS_STRUCTURAL_AUTHORITY,
  D5_TRANSFERS_CIVIL_AUTHORITY,
  D5_TRANSFERS_GEOTECHNICAL_AUTHORITY,
  D5_TRANSFERS_MECHANICAL_AUTHORITY,
  D5_TRANSFERS_PROCESS_AUTHORITY,
  D5_TRANSFERS_ELECTRICAL_AUTHORITY,
  D5_TRANSFERS_IAC_AUTHORITY,
  D5_CREATES_AUTHORITATIVE_PROCESS_DESIGN,
  D5_D3_CREATES_GEOTECHNICAL_CONCLUSION,
  D5_D4_REUSES_D4_FUTURE_PIPING_CONTRACT,
  MECHANICAL_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN,
  PIPING_CONNECTION_CONTEXT_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
  PIPING_HEAT_TRACING_REQUIREMENT_EQUALS_ELECTRICAL_DESIGN,
  PIPING_SUPPORT_REQUIREMENT_EQUALS_STRUCTURAL_SUPPORT_DESIGN,
  D5_INSTRUMENT_CONNECTION_CONTEXT_EQUALS_IAC_DESIGN,
  D5_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  D5_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
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
  D5_CONSTRUCTABILITY_DETERMINATION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
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
const INFERRED = new Set([
  "matching_tag", "shared_vendor", "shared_package", "system_membership", "proximity", "document_cooccurrence",
  "similar_value", "ai_similarity", "inferred", "semantic_similarity", "tag_similarity", "geometry_proximity",
  "component_adjacency", "ai_inference", "shared_line", "shared_system", "nearby_structure", "route_geometry",
]);
const LIVE = new Set<string>(D5_R8_LIVE_DISCIPLINES);
const FUTURE = new Set<string>(D5_R8_FUTURE_DISCIPLINES);
type LiveDiscipline = (typeof D5_R8_LIVE_DISCIPLINES)[number];
type FutureDiscipline = (typeof D5_R8_FUTURE_DISCIPLINES)[number];
type Currentness = (typeof D5_CURRENTNESS_STATES)[number];
type R6Kind = "STRESS" | "SUPPORT" | "INSPECTION" | "NDE" | "TEST";
type R7Kind = (typeof D5_R8_SUBJECT_KINDS)[number];

type Prohibited = {
  transferAuthority?: boolean;
  reasonAcrossDisciplines?: boolean;
  detectConflict?: boolean;
  resolveConflict?: boolean;
  validateCounterpart?: boolean;
  fabricateCounterpart?: boolean;
  inferCounterpart?: boolean;
  approve?: boolean;
  certify?: boolean;
  validate?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  repoint?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateR7?: boolean;
  revalidateInterface?: boolean;
  promoteValidated?: boolean;
  d6Start?: boolean;
  d9Reasoning?: boolean;
};

export type D5R8HandoffInput = Prohibited & {
  handoffId: string;
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
  counterpartDiscipline: string;
  direction: string;
  interfaceTopic: string;
  counterpartInterfaceId?: string | null;
  counterpartSourceRevision?: string | null;
  counterpartFingerprint?: string | null;
  inference?: string | null;
  citedCurrentness: string;
  citedLifecycleStage: string;
  applicabilityRef: string;
  limitations: string;
  handoffStatus: string;
  provenanceRef: string;
  identityBasis: string;
  assertedFingerprint?: string | null;
  predecessorHandoffId?: string | null;
};

export type D5R8CounterpartPin = {
  interfaceId: string;
  sourceRevision: string;
  fingerprint: string;
  discipline: LiveDiscipline;
};

type BoundSource = {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  conditionId: string;
  conditionRevisionFingerprint: string;
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
};

export type D5R8HandoffRecord = BoundSource & {
  handoffId: string;
  counterpartDiscipline: LiveDiscipline | FutureDiscipline;
  direction: (typeof D5_R8_DIRECTIONS)[number];
  interfaceTopic: string;
  counterpart: D5R8CounterpartPin | null;
  applicabilityRef: string;
  limitations: string;
  sourceAuthority: typeof D5_CONTEXT_AUTHORITY;
  receivingAuthority: string;
  authorityTransferred: false;
  interfaceComplete: boolean;
  reviewed: false;
  engineeringValidated: false;
  approved: false;
  conformant: false;
  certified: false;
  deleted: false;
  invalidated: false;
  recalculated: false;
  redesigned: false;
  geotechnicalConclusion: false;
  handoffStatus: (typeof D5_R8_HANDOFF_STATUSES)[number];
  citedCurrentness: Currentness;
  currentness: Currentness;
  citedLifecycleStage: (typeof D5_MATURITY_STATES)[number];
  provenanceRef: string;
  fingerprint: string;
  predecessorHandoffId: string | null;
  predecessorFingerprint: string | null;
  recordStatus: "CURRENT" | "SUPERSEDED";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  createdAt: string;
  createdBy: string;
};

export type D5R8History = {
  historyId: string;
  handoffId: string;
  action: "CREATED" | "SUPERSEDED" | "CURRENTNESS_MARKED";
  fingerprint: string;
  recordedAt: string;
};

export type D5R8Store = {
  r7: D5R7Store;
  d1: D1kR1Store | null;
  d2: D2R1Store | null;
  d3: D3R1Store | null;
  d4: D4R1Store | null;
  now: () => string;
  handoffs: D5R8HandoffRecord[];
  history: D5R8History[];
};

function fail(code: string): never {
  throw new Error(`D5_R8_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function isCurrentness(value: string): value is Currentness {
  return (D5_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function maturityOf(value: string): (typeof D5_MATURITY_STATES)[number] {
  const token = value.trim();
  if (!(D5_MATURITY_STATES as readonly string[]).includes(token)) fail("LIFECYCLE_INVALID");
  return token as (typeof D5_MATURITY_STATES)[number];
}

function assertActor(actor: D5R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PIPING_AUTHORITY");
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") {
    fail("ADMIN_NOT_PIPING_AUTHORITY");
  }
  if (actor.authority === "PIPING_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertProhibited(input: Prohibited): void {
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.reasonAcrossDisciplines === true || input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
  if (input.detectConflict === true) fail("CONFLICT_DETECTION_NOT_IN_R8");
  if (input.resolveConflict === true) fail("CONFLICT_RESOLUTION_NOT_IN_R8");
  if (input.validateCounterpart === true || input.validate === true || input.revalidateInterface === true || input.promoteValidated === true) {
    fail("COUNTERPART_VALIDATION_NOT_IN_R8");
  }
  if (input.fabricateCounterpart === true) fail("COUNTERPART_FABRICATION_REJECTED");
  if (input.inferCounterpart === true) fail("INFERRED_COUNTERPART_REJECTED");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R8");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R8");
  if (input.redesign === true) fail("REDESIGN_NOT_IN_R8");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R8");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.mutateR3 === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateR4 === true) fail("R4_MUTATION_REJECTED");
  if (input.mutateR5 === true) fail("R5_MUTATION_REJECTED");
  if (input.mutateR6 === true) fail("R6_MUTATION_REJECTED");
  if (input.mutateR7 === true) fail("R7_MUTATION_REJECTED");
  if (input.d6Start === true) fail("FUTURE_DISCIPLINE_RUNTIME_REJECTED");
}

function sameScope(row: { tenantId: string; workspaceId: string; projectId: string }, actor: D5R1Actor): boolean {
  return row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId;
}

function r6Row(store: D5R7Store, kind: R6Kind, id: string) {
  if (kind === "STRESS") return store.r6.stressEvidence.find((row) => row.evidenceRecordId === id);
  if (kind === "SUPPORT") return store.r6.supports.find((row) => row.supportRecordId === id);
  if (kind === "INSPECTION") return store.r6.inspections.find((row) => row.inspectionRecordId === id);
  if (kind === "NDE") return store.r6.nde.find((row) => row.ndeRecordId === id);
  return store.r6.tests.find((row) => row.testRecordId === id);
}

function r7Row(store: D5R7Store, kind: R7Kind, id: string) {
  if (kind === "REQUIREMENT") return store.requirements.find((row) => row.requirementId === id);
  if (kind === "ASSUMPTION") return store.assumptions.find((row) => row.assumptionId === id);
  if (kind === "DECISION") return store.decisions.find((row) => row.decisionId === id);
  return store.changes.find((row) => row.changeId === id);
}

function seal(store: D5R8Store): string {
  const r3 = store.r7.r6.r5.r4.r3;
  const conditions = r3.conditions.map((row) => `${row.conditionId}:${row.fingerprint}:${row.designPressure.value}:${row.designPressure.unit}:${row.currentness}`).join("|");
  const specifications = r3.specifications.map((row) => `${row.specificationId}:${row.fingerprint}:${row.specificationRef}:${row.pipingClass}:${row.currentness}`).join("|");
  const components = store.r7.r6.r5.r4.components.map((row) => `${row.componentRecordId}:${row.fingerprint}:${row.componentClassification}:${row.currentness}`).join("|");
  const routes = store.r7.r6.r5.routes.map((row) => `${row.routeRecordId}:${row.fingerprint}:${row.currentness}`).join("|");
  const stress = store.r7.r6.stressEvidence.map((row) => `${row.evidenceRecordId}:${row.fingerprint}:${row.stressResult.value}:${row.stressResult.unit}`).join("|");
  const nde = store.r7.r6.nde.map((row) => `${row.ndeRecordId}:${row.fingerprint}:${row.observedStatus}`).join("|");
  const tests = store.r7.r6.tests.map((row) => `${row.testRecordId}:${row.fingerprint}:${row.observedStatus}`).join("|");
  const changes = store.r7.changes.map((row) => `${row.changeId}:${row.fingerprint}:${row.recalculated}:${row.redesigned}:${row.recordStatus}`).join("|");
  const d1 = store.d1?.records.map((row) => `${row.interfaceId}:${row.fingerprint}:${row.sourceRevision}:${row.recordStatus}`).join("|") ?? "";
  const d2 = store.d2?.objects.map((row) => `${row.objectId}:${row.fingerprint}:${row.provenanceRef}:${row.recordStatus}`).join("|") ?? "";
  const d3 = store.d3?.objects.map((row) => `${row.objectId}:${row.fingerprint}:${row.provenanceRef}:${row.recordStatus}`).join("|") ?? "";
  const d4 = store.d4?.objects.map((row) => `${row.objectId}:${row.fingerprint}:${row.provenanceRef}:${row.recordStatus}`).join("|") ?? "";
  return [conditions, specifications, components, routes, stress, nde, tests, changes, d1, d2, d3, d4].join("#");
}

function bindSource(store: D5R8Store, actor: D5R1Actor, input: D5R8HandoffInput, cited: Currentness): BoundSource {
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r7.r6.r5.r4.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || !sameScope(context, actor)) fail("R1_CONTEXT_NOT_FOUND");
  const object = store.r7.r6.r5.r4.r1.objects.find((row) => row.objectId === explicit(input.objectId, "R1_OBJECT_REQUIRED"));
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  if (!object || object.fingerprint !== objectRevision || !sameScope(object, actor)) fail(object ? "R1_REVISION_MISMATCH" : "R1_OBJECT_NOT_FOUND");
  const line = store.r7.r6.r5.r4.r2.lines.find((row) => row.lineRecordId === explicit(input.lineRecordId, "R2_LINE_REQUIRED"));
  if (!line || line.fingerprint !== explicit(input.lineContextFingerprint, "R2_REVISION_REQUIRED") || line.tenantId !== actor.tenantId) fail(line ? "R2_REVISION_MISMATCH" : "R2_LINE_NOT_FOUND");
  const condition = store.r7.r6.r5.r4.r3.conditions.find((row) => row.conditionId === explicit(input.conditionId, "R3_CONDITION_REQUIRED"));
  if (!condition || condition.fingerprint !== explicit(input.conditionRevisionFingerprint, "R3_REVISION_REQUIRED") || condition.tenantId !== actor.tenantId) {
    fail(condition ? "R3_REVISION_MISMATCH" : "R3_CONDITION_NOT_FOUND");
  }
  const component = store.r7.r6.r5.r4.components.find((row) => row.componentRecordId === explicit(input.componentRecordId, "R4_COMPONENT_REQUIRED"));
  if (!component || component.fingerprint !== explicit(input.componentRevisionFingerprint, "R4_COMPONENT_REVISION_REQUIRED")) fail(component ? "R4_COMPONENT_REVISION_MISMATCH" : "R4_COMPONENT_NOT_FOUND");
  const connection = store.r7.r6.r5.r4.connections.find((row) => row.connectionRecordId === explicit(input.connectionRecordId, "R4_CONNECTION_REQUIRED"));
  if (!connection || connection.fingerprint !== explicit(input.connectionRevisionFingerprint, "R4_CONNECTION_REVISION_REQUIRED")) fail(connection ? "R4_CONNECTION_REVISION_MISMATCH" : "R4_CONNECTION_NOT_FOUND");
  const route = store.r7.r6.r5.routes.find((row) => row.routeRecordId === explicit(input.routeRecordId, "R5_ROUTE_REQUIRED"));
  if (!route || route.fingerprint !== explicit(input.routeRevisionFingerprint, "R5_REVISION_REQUIRED") || route.tenantId !== actor.tenantId) fail(route ? "R5_REVISION_MISMATCH" : "R5_ROUTE_NOT_FOUND");
  const r6Kind = explicit(input.r6SubjectKind, "R6_SUBJECT_REQUIRED");
  if (!["STRESS", "SUPPORT", "INSPECTION", "NDE", "TEST"].includes(r6Kind)) fail("R6_SUBJECT_INVALID");
  const r6 = r6Row(store.r7, r6Kind as R6Kind, explicit(input.r6SubjectId, "R6_SUBJECT_REQUIRED"));
  if (!r6 || r6.fingerprint !== explicit(input.r6RevisionFingerprint, "R6_REVISION_REQUIRED") || r6.tenantId !== actor.tenantId) fail(r6 ? "R6_REVISION_MISMATCH" : "R6_SUBJECT_NOT_FOUND");
  if (r6.objectId !== object.objectId || r6.objectRevisionFingerprint !== object.fingerprint) fail("R6_SUBJECT_MISMATCH");
  const r7Kind = explicit(input.r7SubjectKind, "R7_SUBJECT_REQUIRED");
  if (!(D5_R8_SUBJECT_KINDS as readonly string[]).includes(r7Kind)) fail("R7_SUBJECT_INVALID");
  const r7 = r7Row(store.r7, r7Kind as R7Kind, explicit(input.r7SubjectId, "R7_SUBJECT_REQUIRED"));
  if (!r7 || r7.fingerprint !== explicit(input.r7RevisionFingerprint, "R7_REVISION_REQUIRED") || r7.tenantId !== actor.tenantId) fail(r7 ? "R7_REVISION_MISMATCH" : "R7_SUBJECT_NOT_FOUND");
  if (r7.objectId !== object.objectId) fail("R7_SUBJECT_MISMATCH");
  if (cited === "CURRENT" && [context, object, line, condition, component, connection, route, r6, r7].some((row) => row.recordStatus !== "CURRENT")) fail("SOURCE_NOT_CURRENT");
  return {
    contextId,
    objectId: object.objectId,
    objectRevisionFingerprint: object.fingerprint,
    lineRecordId: line.lineRecordId,
    lineContextFingerprint: line.fingerprint,
    conditionId: condition.conditionId,
    conditionRevisionFingerprint: condition.fingerprint,
    componentRecordId: component.componentRecordId,
    componentRevisionFingerprint: component.fingerprint,
    connectionRecordId: connection.connectionRecordId,
    connectionRevisionFingerprint: connection.fingerprint,
    routeRecordId: route.routeRecordId,
    routeRevisionFingerprint: route.fingerprint,
    r6SubjectKind: r6Kind as R6Kind,
    r6SubjectId: explicit(input.r6SubjectId, "R6_SUBJECT_REQUIRED"),
    r6RevisionFingerprint: r6.fingerprint,
    r7SubjectKind: r7Kind as R7Kind,
    r7SubjectId: explicit(input.r7SubjectId, "R7_SUBJECT_REQUIRED"),
    r7RevisionFingerprint: r7.fingerprint,
  };
}

function topicFor(discipline: string, topic: string): string {
  const value = explicit(topic, "INTERFACE_TOPIC_REQUIRED");
  const allowed =
    discipline === "structural"
      ? D5_D1_FUTURE_CONTRACT_SUBJECTS
      : discipline === "civil"
        ? D5_D2_FUTURE_CONTRACT_SUBJECTS
        : discipline === "geotechnical"
          ? D5_D3_FUTURE_CONTRACT_SUBJECTS
          : discipline === "mechanical"
            ? D5_D4_INTERFACE_SUBJECTS
            : discipline === "process"
              ? D5_D6_FUTURE_CONTRACT_SUBJECTS
              : discipline === "electrical"
                ? D5_D7_FUTURE_CONTRACT_SUBJECTS
                : D5_D8_FUTURE_CONTRACT_SUBJECTS;
  if (!(allowed as readonly string[]).includes(value)) fail("INTERFACE_TOPIC_INVALID");
  return value;
}

function pinCounterpart(
  store: D5R8Store,
  actor: D5R1Actor,
  discipline: string,
  interfaceId: string | null | undefined,
  revision: string | null | undefined,
  fingerprint: string | null | undefined,
  cited: Currentness,
): D5R8CounterpartPin | null {
  if (FUTURE.has(discipline)) {
    if (interfaceId != null || revision != null || fingerprint != null) fail("COUNTERPART_FABRICATION_REJECTED");
    return null;
  }
  if (interfaceId == null || interfaceId === "") {
    if (revision != null || fingerprint != null) fail("COUNTERPART_REVISION_WITHOUT_REFERENCE");
    return null;
  }
  const id = explicit(interfaceId, "COUNTERPART_REFERENCE_REQUIRED");
  const sourceRevision = explicit(revision ?? "", "COUNTERPART_REVISION_REQUIRED");
  const asserted = fingerprint == null || fingerprint === "" ? null : explicit(fingerprint, "COUNTERPART_FINGERPRINT_REQUIRED");
  if (discipline === "structural") {
    const row = store.d1?.records.find((item) => item.interfaceId === id);
    if (!row || !sameScope(row, actor)) fail("COUNTERPART_NOT_FOUND");
    const sides = [row.sourceDiscipline, row.targetDiscipline];
    if (!sides.includes("structural") || !sides.includes("piping")) fail("COUNTERPART_DISCIPLINE_PAIR_INVALID");
    if (row.sourceRevision !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
    if (asserted != null && row.fingerprint !== asserted) fail("FINGERPRINT_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
    return { interfaceId: row.interfaceId, sourceRevision: row.sourceRevision, fingerprint: row.fingerprint, discipline: "structural" };
  }
  if (discipline === "mechanical") {
    const row = store.d4?.objects.find((item) => item.objectId === id);
    if (!row || !sameScope(row, actor)) fail("COUNTERPART_NOT_FOUND");
    if (!(D4_MECHANICAL_OBJECT_TYPES as readonly string[]).includes(row.objectType)) fail("COUNTERPART_NOT_FOUND");
    if (row.provenanceRef !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
    if (asserted != null && row.fingerprint !== asserted) fail("FINGERPRINT_MISMATCH");
    if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
    return { interfaceId: row.objectId, sourceRevision: row.provenanceRef, fingerprint: row.fingerprint, discipline: "mechanical" };
  }
  const rows = discipline === "civil" ? store.d2?.objects : store.d3?.objects;
  const row = rows?.find((item) => item.objectId === id);
  if (!row || !sameScope(row, actor)) fail("COUNTERPART_NOT_FOUND");
  if (row.provenanceRef !== sourceRevision) fail("COUNTERPART_REVISION_MISMATCH");
  if (asserted != null && row.fingerprint !== asserted) fail("FINGERPRINT_MISMATCH");
  if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
  return { interfaceId: row.objectId, sourceRevision: row.provenanceRef, fingerprint: row.fingerprint, discipline: discipline as LiveDiscipline };
}

export function createD5R8Store(
  r7: D5R7Store,
  d1: D1kR1Store | null = null,
  d2: D2R1Store | null = null,
  d3: D3R1Store | null = null,
  d4: D4R1Store | null = null,
  now: () => string = () => r7.now(),
): D5R8Store {
  return { r7, d1, d2, d3, d4, now, handoffs: [], history: [] };
}

export function recordPipingInterfaceHandoff(store: D5R8Store, actor: D5R1Actor, input: D5R8HandoffInput): D5R8HandoffRecord {
  assertActor(actor);
  assertProhibited(input);
  if (input.identityBasis.trim() !== "EXPLICIT") fail("INFERRED_COUNTERPART_REJECTED");
  if (input.inference && INFERRED.has(input.inference.trim().toLowerCase())) fail("INFERRED_COUNTERPART_REJECTED");
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) fail("SCOPE_MISMATCH");
  const citedCurrentness = input.citedCurrentness.trim();
  if (!isCurrentness(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const before = seal(store);
  const bound = bindSource(store, actor, input, citedCurrentness);
  const discipline = explicit(input.counterpartDiscipline, "COUNTERPART_DISCIPLINE_REQUIRED");
  if (!LIVE.has(discipline) && !FUTURE.has(discipline)) fail("COUNTERPART_DISCIPLINE_INVALID");
  const direction = explicit(input.direction, "DIRECTION_REQUIRED");
  if (!(D5_R8_DIRECTIONS as readonly string[]).includes(direction)) fail("DIRECTION_INVALID");
  const interfaceTopic = topicFor(discipline, input.interfaceTopic);
  const counterpart = pinCounterpart(store, actor, discipline, input.counterpartInterfaceId, input.counterpartSourceRevision, input.counterpartFingerprint, citedCurrentness);
  const handoffStatus = explicit(input.handoffStatus, "HANDOFF_STATUS_REQUIRED");
  if (!(D5_R8_HANDOFF_STATUSES as readonly string[]).includes(handoffStatus)) fail("HANDOFF_STATUS_INVALID");
  if ((FUTURE.has(discipline) || !counterpart) && handoffStatus === "COMPLETE") fail("INCOMPLETE_COUNTERPART_NOT_COMPLETE");
  if (handoffStatus === "COMPLETE" && citedCurrentness !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if ((handoffStatus === "AWAITING_COUNTERPART" || handoffStatus === "NOT_YET_AVAILABLE") && counterpart) fail("COUNTERPART_NOT_AWAITING");
  if (handoffStatus === "STALE" && citedCurrentness !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (handoffStatus === "REASSESSMENT_REQUIRED" && citedCurrentness !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  if (citedCurrentness === "CURRENT" && (handoffStatus === "STALE" || handoffStatus === "REASSESSMENT_REQUIRED")) fail("CURRENTNESS_STATUS_MISMATCH");
  const applicabilityRef = explicit(input.applicabilityRef, "APPLICABILITY_REQUIRED");
  if (applicabilityRef !== bound.objectId) fail("APPLICABILITY_MISMATCH");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const handoffId = explicit(input.handoffId, "HANDOFF_ID_REQUIRED");
  const predecessorId = input.predecessorHandoffId ? explicit(input.predecessorHandoffId, "HANDOFF_ID_REQUIRED") : null;
  const predecessor = predecessorId ? store.handoffs.find((row) => row.handoffId === predecessorId) : null;
  if (predecessorId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("HANDOFF_NOT_FOUND");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const interfaceComplete = handoffStatus === "COMPLETE" && counterpart !== null;
  const fingerprint = fingerprintCanonical({
    handoffId,
    ...bound,
    counterpartDiscipline: discipline,
    direction,
    interfaceTopic,
    counterpart,
    applicabilityRef,
    limitations,
    handoffStatus,
    citedCurrentness,
    provenanceRef,
    authority: D5_CONTEXT_AUTHORITY,
    predecessorHandoffId: predecessor?.handoffId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.handoffs.find((row) => row.handoffId === handoffId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("HANDOFF_ALREADY_RECORDED");
  const signature = `${bound.objectId}|${bound.objectRevisionFingerprint}|${discipline}|${direction}|${interfaceTopic}|${counterpart?.interfaceId ?? ""}|${counterpart?.sourceRevision ?? ""}`;
  if (store.handoffs.some((row) => row.recordStatus === "CURRENT" && row.handoffId !== predecessor?.handoffId && `${row.objectId}|${row.objectRevisionFingerprint}|${row.counterpartDiscipline}|${row.direction}|${row.interfaceTopic}|${row.counterpart?.interfaceId ?? ""}|${row.counterpart?.sourceRevision ?? ""}` === signature)) {
    fail("DUPLICATE_HANDOFF_REJECTED");
  }
  const predecessorFingerprint = predecessor?.fingerprint ?? null;
  if (predecessor) {
    const index = store.handoffs.findIndex((row) => row.handoffId === predecessor.handoffId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.handoffs[index] = superseded;
    store.history.push({ historyId: `d5r8-history-${store.history.length + 1}`, handoffId: superseded.handoffId, action: "SUPERSEDED", fingerprint: superseded.fingerprint, recordedAt: store.now() });
  }
  const record: D5R8HandoffRecord = {
    handoffId,
    ...bound,
    counterpartDiscipline: discipline as D5R8HandoffRecord["counterpartDiscipline"],
    direction: direction as D5R8HandoffRecord["direction"],
    interfaceTopic,
    counterpart,
    applicabilityRef,
    limitations,
    sourceAuthority: D5_CONTEXT_AUTHORITY,
    receivingAuthority: discipline,
    authorityTransferred: false,
    interfaceComplete,
    reviewed: false,
    engineeringValidated: false,
    approved: false,
    conformant: false,
    certified: false,
    deleted: false,
    invalidated: false,
    recalculated: false,
    redesigned: false,
    geotechnicalConclusion: false,
    handoffStatus: handoffStatus as D5R8HandoffRecord["handoffStatus"],
    citedCurrentness,
    currentness: citedCurrentness,
    citedLifecycleStage: maturityOf(input.citedLifecycleStage),
    provenanceRef,
    fingerprint,
    predecessorHandoffId: predecessor?.handoffId ?? null,
    predecessorFingerprint,
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    createdAt: store.now(),
    createdBy: actor.actorId,
  };
  store.handoffs.push(record);
  store.history.push({ historyId: `d5r8-history-${store.history.length + 1}`, handoffId: record.handoffId, action: "CREATED", fingerprint: record.fingerprint, recordedAt: store.now() });
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function markPipingInterfaceFromChange(
  store: D5R8Store,
  actor: D5R1Actor,
  input: Prohibited & {
    handoffId: string;
    handoffFingerprint: string;
    changeId: string;
    changeFingerprint: string;
    mark: string;
  },
): D5R8HandoffRecord {
  assertActor(actor);
  assertProhibited(input);
  const before = seal(store);
  const handoffId = explicit(input.handoffId, "HANDOFF_ID_REQUIRED");
  const handoffFingerprint = explicit(input.handoffFingerprint, "HANDOFF_REVISION_REQUIRED");
  const index = store.handoffs.findIndex((row) => row.handoffId === handoffId && row.tenantId === actor.tenantId);
  const handoff = index >= 0 ? store.handoffs[index] : null;
  if (!handoff || handoff.fingerprint !== handoffFingerprint) fail(handoff ? "FINGERPRINT_MISMATCH" : "HANDOFF_NOT_FOUND");
  if (handoff.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const change = store.r7.changes.find((row) => row.changeId === explicit(input.changeId, "CHANGE_REFERENCE_REQUIRED"));
  if (!change || change.fingerprint !== explicit(input.changeFingerprint, "CHANGE_REVISION_REQUIRED") || change.tenantId !== actor.tenantId) fail("CHANGE_REVISION_MISMATCH");
  if (input.mark !== "STALE" && input.mark !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_MARK_INVALID");
  const mark = input.mark;
  const marked: D5R8HandoffRecord = Object.freeze({
    ...handoff,
    currentness: mark,
    handoffStatus: mark,
    interfaceComplete: false,
    engineeringValidated: false,
    invalidated: false,
    recalculated: false,
    redesigned: false,
  });
  store.handoffs[index] = marked;
  store.history.push({ historyId: `d5r8-history-${store.history.length + 1}`, handoffId: marked.handoffId, action: "CURRENTNESS_MARKED", fingerprint: marked.fingerprint, recordedAt: store.now() });
  if (marked.fingerprint !== handoffFingerprint) fail("AUTO_REPOINT_REJECTED");
  if (marked.currentness === "CURRENT") fail("STALE_EXPOSED_AS_CURRENT");
  if (seal(store) !== before) fail("UPSTREAM_MUTATED");
  return marked;
}

export function repointPipingHandoff(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function mutatePipingInterface(): never {
  return fail("SILENT_MUTATION_REJECTED");
}
export function reasonAcrossPipingDisciplines(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
}
export function validatePipingCounterpart(): never {
  return fail("COUNTERPART_VALIDATION_NOT_IN_R8");
}
export function fabricatePipingCounterpart(): never {
  return fail("COUNTERPART_FABRICATION_REJECTED");
}
export function recalculateFromPipingInterface(): never {
  return fail("RECALCULATION_NOT_IN_R8");
}
export function redesignFromPipingInterface(): never {
  return fail("REDESIGN_NOT_IN_R8");
}
export function startFuturePipingDisciplineRuntime(): never {
  return fail("FUTURE_DISCIPLINE_RUNTIME_REJECTED");
}
