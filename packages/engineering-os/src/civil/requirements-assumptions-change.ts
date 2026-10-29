/**
 * EOS-D2-R7 requirements, assumptions, decisions, and change context.
 * Reuses canonical EOS governance vocabulary and exact D2 object identity.
 * Does not redesign the Civil engineering solution.
 */
import {
  D2_CURRENTNESS_STATES,
  D2_IMPLEMENTATION_PHASES,
  D2_JURISDICTION_PROFILE_IDS,
  D2_MATURITY_STATES,
} from "@rtb/types";
import {
  assertAssumptionMateriality,
  assertAssumptionValidationStatus,
  assertHumanApprovalActor,
  assertSingleSelectedAlternative,
} from "../decision-intelligence/invariants";
import { INFORMATION_REQUIREMENT_AI_BOUNDARY, INFORMATION_REQUIREMENT_STATUSES } from "../information-requirements/types";
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
import {
  D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY as R6_UTILITY_READY,
  type D2R6Store,
} from "./utility-corridor-context";

export const D2_R7_STATUS = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED" as const;
export const D2_R7_MATURITY = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED" as const;
export const D2_R7_MATURITY_STATE = D2_R7_MATURITY;
export const D2_R7_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md" as const;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 7 as const;
export const D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY = R2_SPATIAL_READY;
export const D2_GRADING_EARTHWORKS_RUNTIME_READY = R3_GRADING_READY;
export const D2_ROADS_ACCESS_RUNTIME_READY = R4_ROADS_READY;
export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = R5_DRAINAGE_READY;
export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = R6_UTILITY_READY;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = true as const;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_CONTEXT_RUNTIME_COUNT = 1 as const;
export const CANONICAL_REQUIREMENT_GOVERNANCE_REUSED = true as const;
export const CANONICAL_ASSUMPTION_GOVERNANCE_REUSED = true as const;
export const CANONICAL_DECISION_GOVERNANCE_REUSED = true as const;
export const CANONICAL_CHANGE_GOVERNANCE_REUSED = true as const;
export const EXACT_D2_OBJECT_REFERENCE_REQUIRED = true as const;
export const FLOATING_D2_OBJECT_REFERENCE_ALLOWED = false as const;
export const D2_CIVIL_REQUIREMENT_RUNTIME_IMPLEMENTED = true as const;
export const D2_CIVIL_ASSUMPTION_RUNTIME_IMPLEMENTED = true as const;
export const D2_CIVIL_DECISION_RUNTIME_IMPLEMENTED = true as const;
export const D2_CIVIL_CHANGE_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const AI_CAN_INVENT_AUTHORITATIVE_CIVIL_REQUIREMENT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_CIVIL_ASSUMPTION = false as const;
export const REQUIREMENT_PRESENT_EQUALS_REQUIREMENT_SATISFIED = false as const;
export const REQUIREMENT_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const ASSUMPTION_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const AI_RECOMMENDATION_EQUALS_CIVIL_ENGINEERING_DECISION = false as const;
export const DECISION_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const DECISION_PRESENT_EQUALS_ENGINEERING_APPROVED = false as const;
export const EXPLICIT_D2_CHANGE_RELATIONSHIPS_SUPPORTED = true as const;
export const INFERRED_D2_DEPENDENCY_PROPAGATION_ALLOWED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_AUTOMATIC_RECALCULATION = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const AI_CAN_APPROVE_CIVIL_REQUIREMENT = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const AI_CAN_APPROVE_CIVIL_ASSUMPTION = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const AI_CAN_APPROVE_CIVIL_DECISION = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const AI_CAN_APPROVE_CIVIL_CHANGE = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const CANONICAL_FINGERPRINT_REUSED = true as const;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_R7_PROVENANCE_REQUIRED = true as const;
export const D2_R7_PROVENANCE_PRESERVED = true as const;
export const SILENT_D2_R7_MUTATION_ALLOWED = false as const;
export const D2_R7_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D2_R7_SCOPE_ENFORCED = true as const;
export const D2_R7_AUTHORITY_ROLES = ["AUTHOR", "REVIEWER", "DECISION_AUTHORITY", "LIFECYCLE_AUTHORITY", "SOURCE_AUTHORITY"] as const;
export const D2_R7_OPEN_REQUIREMENT_STATUSES = ["PLANNED", "REQUESTED", "AWAITING_INFORMATION", "RECEIVED", "NOT_APPLICABLE"] as const;

export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D2_REQUIREMENT_AUTO_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D2_ASSUMPTION_AUTO_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D2_DECISION_AUTO_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D2_CHANGE_AUTO_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_REVIEW_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_DEDICATED_CURRENTNESS_DIGITAL_THREAD_RUNTIME_COUNT = 0 as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D2_D1_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D3_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D4_D8_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
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

export const D2_R8_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[7];
export const D2_R8_PHASE_TYPE = "DISCIPLINE_INTERFACES_AND_HANDOFFS" as const;
export const D2_R8_CANONICAL_SCOPE =
  "Implement bounded governed Civil interface/handoff records using exact D2 object/evidence references. Support D2↔D1 Structural and D2↔D3 Geotechnical interface contracts plus future D4-D8 handoff placeholders defined by D2 architecture. Preserve discipline authority, exact revisions, provenance, limitations and currentness. Do not perform cross-discipline engineering reasoning, automatically resolve conflicts, validate counterpart discipline data, transfer authority, or start D3-D9 runtime." as const;
export const D2_R8_STARTED = false as const;
export const D2_R7_READY_FOR_NEXT_PHASE = true as const;
export const D2_R7_NEXT_PHASE = D2_R8_CANONICAL_PHASE;
export const D2_R7_NEXT_PHASE_TYPE = D2_R8_PHASE_TYPE;
export const D2_R7_CANONICAL_NEXT_PHASE = D2_R8_CANONICAL_PHASE;
export const D2_R7_CANONICAL_NEXT_PHASE_SCOPE = D2_R8_CANONICAL_SCOPE;
export const D2_R7_BLOCKER = "NONE" as const;
export const D2_R7_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);
const OPEN_REQUIREMENT_STATUSES = new Set<string>(D2_R7_OPEN_REQUIREMENT_STATUSES);

type Prohibited = {
  inventRequirement?: boolean;
  inventAssumption?: boolean;
  aiRecommendation?: boolean;
  approve?: boolean;
  satisfied?: boolean;
  validate?: boolean;
  certify?: boolean;
  inferDependencies?: boolean;
  redesign?: boolean;
  recalculate?: boolean;
  gradingDesign?: boolean;
  moveAlignment?: boolean;
  resizeDrainage?: boolean;
  rerouteUtility?: boolean;
  mutateSurface?: boolean;
  earthworksGeometry?: boolean;
  quantity?: boolean;
  repoint?: boolean;
  d1Integration?: boolean;
  d3Integration?: boolean;
  d9Reasoning?: boolean;
};

type Alternative = { id: string; statement: string; is_selected?: boolean };
type AffectedLink = { kind: string; targetObjectId: string };

export type D2R7RequirementInput = Prohibited & {
  requirementContextId: string;
  contextId: string;
  objectId: string;
  requirementText: string;
  sourceRef: string;
  sourceRevision: string;
  applicability: string;
  affectedObjectIds: readonly string[];
  jurisdictionProfileId: string;
  requirementStatus?: string;
  evidenceObjectIds: readonly string[];
  citedLifecycleStage: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorRequirementContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R7AssumptionInput = Prohibited & {
  assumptionContextId: string;
  contextId: string;
  objectId: string;
  statement: string;
  sourceRef: string;
  rationale: string;
  affectedObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  validationStatus?: string;
  materiality?: string;
  candidateSuggestion?: boolean;
  citedLifecycleStage: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorAssumptionContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R7DecisionInput = Prohibited & {
  decisionContextId: string;
  contextId: string;
  objectId: string;
  statement: string;
  rationale: string;
  authorityRole: string;
  alternatives?: readonly Alternative[];
  affectedObjectIds: readonly string[];
  requirementObjectIds: readonly string[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  citedLifecycleStage: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorDecisionContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R7ChangeInput = Prohibited & {
  changeContextId: string;
  contextId: string;
  initiatingSource: string;
  changedObjectId: string;
  affectedRelationships: readonly AffectedLink[];
  rationale: string;
  reassessmentRequired: boolean;
  authorityRole: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorChangeContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type GovernanceBase = {
  contextId: string;
  provenanceRef: string;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  citedLifecycleStage?: (typeof D2_MATURITY_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  engineeringValidated: false;
  engineeringApproved: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R7RequirementRecord = GovernanceBase & {
  requirementContextId: string;
  objectId: string;
  requirementText: string;
  sourceRef: string;
  sourceRevision: string;
  applicability: string;
  affectedObjectIds: readonly string[];
  jurisdictionProfileId: (typeof D2_JURISDICTION_PROFILE_IDS)[number];
  requirementStatus: (typeof D2_R7_OPEN_REQUIREMENT_STATUSES)[number];
  evidenceObjectIds: readonly string[];
  requirementSatisfied: false;
  predecessorRequirementContextId: string | null;
};

export type D2R7AssumptionRecord = GovernanceBase & {
  assumptionContextId: string;
  objectId: string;
  statement: string;
  sourceRef: string;
  rationale: string;
  affectedObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  validationStatus: "unvalidated";
  materiality: "low" | "medium" | "high" | "critical";
  adoption: "RECORDED" | "CANDIDATE";
  authoritativeAdopted: boolean;
  predecessorAssumptionContextId: string | null;
};

export type D2R7DecisionRecord = GovernanceBase & {
  decisionContextId: string;
  objectId: string;
  statement: string;
  rationale: string;
  authorityRole: (typeof D2_R7_AUTHORITY_ROLES)[number];
  alternatives: readonly { id: string; statement: string; is_selected: boolean }[];
  affectedObjectIds: readonly string[];
  requirementObjectIds: readonly string[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  predecessorDecisionContextId: string | null;
};

export type D2R7ChangeRecord = Omit<GovernanceBase, "citedLifecycleStage"> & {
  changeContextId: string;
  initiatingSource: string;
  changedObjectId: string;
  affectedRelationships: readonly { kind: (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number]; targetObjectId: string }[];
  rationale: string;
  reassessmentRequired: boolean;
  engineeringInvalid: false;
  automaticRecalculation: false;
  authorityRole: (typeof D2_R7_AUTHORITY_ROLES)[number];
  predecessorChangeContextId: string | null;
};

export type D2R7Reassessment = {
  objectId: string;
  changeContextId: string;
  status: "REASSESSMENT_REQUIRED";
  engineeringInvalid: false;
  automaticRecalculation: false;
  engineeringValidated: false;
};

export type D2R7History = {
  historyId: string;
  subjectKind: "REQUIREMENT" | "ASSUMPTION" | "DECISION" | "CHANGE";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R7Store = {
  r6: D2R6Store;
  now: () => string;
  requirements: D2R7RequirementRecord[];
  assumptions: D2R7AssumptionRecord[];
  decisions: D2R7DecisionRecord[];
  changes: D2R7ChangeRecord[];
  reassessments: D2R7Reassessment[];
  history: D2R7History[];
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

function isCurrentness(value: string): value is (typeof D2_CURRENTNESS_STATES)[number] {
  return (D2_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function isMaturity(value: string): value is (typeof D2_MATURITY_STATES)[number] {
  return (D2_MATURITY_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D2R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "CIVIL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_CIVIL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D2_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D2R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.inventRequirement === true) fail("REQUIREMENT_NOT_INVENTED");
  if (input.inventAssumption === true) fail("ASSUMPTION_NOT_INVENTED");
  if (input.aiRecommendation === true) fail("AI_RECOMMENDATION_NOT_DECISION");
  if (input.satisfied === true) fail("REQUIREMENT_SATISFACTION_NOT_IN_R7");
  if (input.validate === true) fail("VALIDATION_NOT_IN_R7");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R7");
  if (input.inferDependencies === true) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.redesign === true || input.gradingDesign === true || input.moveAlignment === true || input.resizeDrainage === true || input.rerouteUtility === true || input.mutateSurface === true || input.earthworksGeometry === true) fail("REDESIGN_NOT_IN_R7");
  if (input.recalculate === true) fail("RECALCULATION_NOT_IN_R7");
  if (input.quantity === true) fail("QUANTITY_NOT_IN_R7");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.d1Integration === true || input.d3Integration === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R7");
}

function refuseApproval(actor: D2R1Actor, approve: boolean | undefined): void {
  if (approve !== true) return;
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) assertHumanApprovalActor("ai", actor.actorId);
  fail("APPROVAL_NOT_IN_R7");
}

function currentnessOf(value: string): (typeof D2_CURRENTNESS_STATES)[number] {
  if (!isCurrentness(value.trim())) fail("CURRENTNESS_INVALID");
  return value.trim() as (typeof D2_CURRENTNESS_STATES)[number];
}

function maturityOf(value: string): (typeof D2_MATURITY_STATES)[number] {
  if (!isMaturity(value.trim())) fail("MATURITY_INVALID");
  return value.trim() as (typeof D2_MATURITY_STATES)[number];
}

function authorityRoleOf(value: string): (typeof D2_R7_AUTHORITY_ROLES)[number] {
  const role = explicit(value, "AUTHORITY_ROLE_REQUIRED");
  if (role === "CIVIL_ENGINEERING_AUTHORITY" || role === "AI" || role === "ADMIN" || role === "ADMINISTRATOR") fail("AUTHORITY_ROLE_NOT_CIVIL_ENGINEERING");
  if (!(D2_R7_AUTHORITY_ROLES as readonly string[]).includes(role)) fail("AUTHORITY_ROLE_INVALID");
  return role as (typeof D2_R7_AUTHORITY_ROLES)[number];
}

function requireContext(store: D2R7Store, actor: D2R1Actor, contextId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObjects(store: D2R7Store, actor: D2R1Actor, contextId: string, objectIds: readonly string[] | undefined, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], code: string, objectType?: string): string[] {
  if (!Array.isArray(objectIds) || objectIds.length === 0) fail(code);
  const ids = [...new Set(objectIds.map((id) => explicit(id, code)))].sort();
  for (const id of ids) {
    const object = store.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
    if (!object || object.contextId !== contextId || object.tenantId !== actor.tenantId) fail(code);
    if (objectType && object.objectType !== objectType) fail(code);
    if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  }
  return ids;
}

function requireObject(store: D2R7Store, actor: D2R1Actor, contextId: string, objectId: string, objectType: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], code: string) {
  return requireObjects(store, actor, contextId, [objectId], citedCurrentness, code, objectType)[0];
}

function evidenceIds(store: D2R7Store, actor: D2R1Actor, contextId: string, objectIds: readonly string[] | undefined): string[] {
  if (!Array.isArray(objectIds)) fail("EVIDENCE_REFERENCE_REQUIRED");
  const ids = [...new Set(objectIds.map((id) => explicit(id, "EVIDENCE_REFERENCE_REQUIRED")))].sort();
  for (const id of ids) {
    const object = store.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
    if (!object || object.objectType !== "CIVIL_EVIDENCE_REFERENCE" || object.contextId !== contextId || object.tenantId !== actor.tenantId) fail("EVIDENCE_REFERENCE_REQUIRED");
  }
  return ids;
}

function remember(store: D2R7Store, subjectKind: D2R7History["subjectKind"], subjectId: string, action: D2R7History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function governedBase(actor: D2R1Actor, store: D2R7Store, provenanceRef: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], citedLifecycleStage: (typeof D2_MATURITY_STATES)[number] | undefined, fingerprint: string): GovernanceBase {
  return {
    contextId: "",
    provenanceRef,
    citedCurrentness,
    citedLifecycleStage,
    authority: D2_CONTEXT_AUTHORITY,
    engineeringValidated: false,
    engineeringApproved: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  };
}

export function createD2R7Store(r6: D2R6Store, now: () => string = () => "2026-10-22T00:00:00.000Z"): D2R7Store {
  return { r6, now, requirements: [], assumptions: [], decisions: [], changes: [], reassessments: [], history: [] };
}

export function recordCivilRequirement(store: D2R7Store, actor: D2R1Actor, input: D2R7RequirementInput): D2R7RequirementRecord {
  refuseApproval(actor, input.approve);
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const objectId = requireObject(store, actor, context.contextId, input.objectId, "CIVIL_REQUIREMENT", citedCurrentness, "REQUIREMENT_OBJECT_REQUIRED");
  const affectedObjectIds = requireObjects(store, actor, context.contextId, input.affectedObjectIds, citedCurrentness, "AFFECTED_OBJECT_REQUIRED");
  const evidenceObjectIds = evidenceIds(store, actor, context.contextId, input.evidenceObjectIds);
  const jurisdictionProfileId = explicit(input.jurisdictionProfileId, "JURISDICTION_PROFILE_REQUIRED");
  if (!(D2_JURISDICTION_PROFILE_IDS as readonly string[]).includes(jurisdictionProfileId)) fail("JURISDICTION_PROFILE_INVALID");
  const requestedStatus = input.requirementStatus ?? "PLANNED";
  if (!(INFORMATION_REQUIREMENT_STATUSES as readonly string[]).includes(requestedStatus)) fail("REQUIREMENT_STATUS_INVALID");
  if (!OPEN_REQUIREMENT_STATUSES.has(requestedStatus)) fail("REQUIREMENT_ACCEPTANCE_NOT_IN_R7");
  const requirementText = explicit(input.requirementText, "REQUIREMENT_TEXT_REQUIRED");
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const requirementContextId = explicit(input.requirementContextId, "REQUIREMENT_CONTEXT_REQUIRED");
  const predecessor = input.predecessorRequirementContextId ? store.requirements.find((row) => row.requirementContextId === input.predecessorRequirementContextId) : null;
  if (input.predecessorRequirementContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    requirementContextId,
    contextId: context.contextId,
    objectId,
    requirementText,
    sourceRef,
    sourceRevision,
    applicability,
    affectedObjectIds,
    jurisdictionProfileId,
    requirementStatus: requestedStatus,
    evidenceObjectIds,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorRequirementContextId: predecessor?.requirementContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requirements.find((row) => row.requirementContextId === requirementContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("REQUIREMENT_ALREADY_RECORDED");
  }
  const signature = `${objectId}|${requirementText}|${sourceRef}|${sourceRevision}|${affectedObjectIds.join(",")}`;
  if (store.requirements.some((row) => row.recordStatus === "CURRENT" && row.requirementContextId !== predecessor?.requirementContextId && row.contextId === context.contextId && `${row.objectId}|${row.requirementText}|${row.sourceRef}|${row.sourceRevision}|${row.affectedObjectIds.join(",")}` === signature)) fail("DUPLICATE_REQUIREMENT_REJECTED");
  const record: D2R7RequirementRecord = Object.freeze({
    ...governedBase(actor, store, provenanceRef, citedCurrentness, citedLifecycleStage, fingerprint),
    contextId: context.contextId,
    requirementContextId,
    objectId,
    requirementText,
    sourceRef,
    sourceRevision,
    applicability,
    affectedObjectIds,
    jurisdictionProfileId: jurisdictionProfileId as (typeof D2_JURISDICTION_PROFILE_IDS)[number],
    requirementStatus: requestedStatus as (typeof D2_R7_OPEN_REQUIREMENT_STATUSES)[number],
    evidenceObjectIds,
    requirementSatisfied: false,
    predecessorRequirementContextId: predecessor?.requirementContextId ?? null,
  });
  if (predecessor) {
    const index = store.requirements.findIndex((row) => row.requirementContextId === predecessor.requirementContextId);
    store.requirements[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    remember(store, "REQUIREMENT", predecessor.requirementContextId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.requirements.push(record);
  remember(store, "REQUIREMENT", record.requirementContextId, "CREATED", record.fingerprint);
  return record;
}

export function recordCivilAssumption(store: D2R7Store, actor: D2R1Actor, input: D2R7AssumptionInput): D2R7AssumptionRecord {
  refuseApproval(actor, input.approve);
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const objectId = requireObject(store, actor, context.contextId, input.objectId, "CIVIL_ASSUMPTION", citedCurrentness, "ASSUMPTION_OBJECT_REQUIRED");
  const affectedObjectIds = requireObjects(store, actor, context.contextId, input.affectedObjectIds, citedCurrentness, "AFFECTED_OBJECT_REQUIRED");
  const evidenceObjectIds = evidenceIds(store, actor, context.contextId, input.evidenceObjectIds);
  const validationStatus = input.validationStatus ?? "unvalidated";
  assertAssumptionValidationStatus(validationStatus);
  if (validationStatus !== "unvalidated") fail("ASSUMPTION_VALIDATION_NOT_IN_R7");
  const materiality = input.materiality ?? "medium";
  assertAssumptionMateriality(materiality);
  const statement = explicit(input.statement, "ASSUMPTION_STATEMENT_REQUIRED");
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const rationale = explicit(input.rationale, "RATIONALE_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const assumptionContextId = explicit(input.assumptionContextId, "ASSUMPTION_CONTEXT_REQUIRED");
  const adoption = input.candidateSuggestion === true ? "CANDIDATE" : "RECORDED";
  const authoritativeAdopted = adoption === "RECORDED";
  const predecessor = input.predecessorAssumptionContextId ? store.assumptions.find((row) => row.assumptionContextId === input.predecessorAssumptionContextId) : null;
  if (input.predecessorAssumptionContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    assumptionContextId,
    contextId: context.contextId,
    objectId,
    statement,
    sourceRef,
    rationale,
    affectedObjectIds,
    evidenceObjectIds,
    validationStatus,
    materiality,
    adoption,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorAssumptionContextId: predecessor?.assumptionContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.assumptions.find((row) => row.assumptionContextId === assumptionContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("ASSUMPTION_ALREADY_RECORDED");
  }
  const record: D2R7AssumptionRecord = Object.freeze({
    ...governedBase(actor, store, provenanceRef, citedCurrentness, citedLifecycleStage, fingerprint),
    contextId: context.contextId,
    assumptionContextId,
    objectId,
    statement,
    sourceRef,
    rationale,
    affectedObjectIds,
    evidenceObjectIds,
    validationStatus,
    materiality,
    adoption,
    authoritativeAdopted,
    predecessorAssumptionContextId: predecessor?.assumptionContextId ?? null,
  });
  if (predecessor) {
    const index = store.assumptions.findIndex((row) => row.assumptionContextId === predecessor.assumptionContextId);
    store.assumptions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    remember(store, "ASSUMPTION", predecessor.assumptionContextId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.assumptions.push(record);
  remember(store, "ASSUMPTION", record.assumptionContextId, "CREATED", record.fingerprint);
  return record;
}

export function recordCivilDecision(store: D2R7Store, actor: D2R1Actor, input: D2R7DecisionInput): D2R7DecisionRecord {
  refuseApproval(actor, input.approve);
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const objectId = requireObject(store, actor, context.contextId, input.objectId, "CIVIL_DECISION", citedCurrentness, "DECISION_OBJECT_REQUIRED");
  const affectedObjectIds = requireObjects(store, actor, context.contextId, input.affectedObjectIds, citedCurrentness, "AFFECTED_OBJECT_REQUIRED");
  const requirementObjectIds = requireObjects(store, actor, context.contextId, input.requirementObjectIds, citedCurrentness, "REQUIREMENT_OBJECT_REQUIRED", "CIVIL_REQUIREMENT");
  const assumptionObjectIds = requireObjects(store, actor, context.contextId, input.assumptionObjectIds, citedCurrentness, "ASSUMPTION_OBJECT_REQUIRED", "CIVIL_ASSUMPTION");
  const evidenceObjectIds = evidenceIds(store, actor, context.contextId, input.evidenceObjectIds);
  const alternatives = (input.alternatives ?? []).map((item) => ({
    id: explicit(item.id, "ALTERNATIVE_REQUIRED"),
    statement: explicit(item.statement, "ALTERNATIVE_REQUIRED"),
    is_selected: item.is_selected === true,
  }));
  assertSingleSelectedAlternative(alternatives);
  const statement = explicit(input.statement, "DECISION_STATEMENT_REQUIRED");
  const rationale = explicit(input.rationale, "RATIONALE_REQUIRED");
  const authorityRole = authorityRoleOf(input.authorityRole);
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const decisionContextId = explicit(input.decisionContextId, "DECISION_CONTEXT_REQUIRED");
  const predecessor = input.predecessorDecisionContextId ? store.decisions.find((row) => row.decisionContextId === input.predecessorDecisionContextId) : null;
  if (input.predecessorDecisionContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    decisionContextId,
    contextId: context.contextId,
    objectId,
    statement,
    rationale,
    authorityRole,
    alternatives,
    affectedObjectIds,
    requirementObjectIds,
    assumptionObjectIds,
    evidenceObjectIds,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorDecisionContextId: predecessor?.decisionContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.decisions.find((row) => row.decisionContextId === decisionContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("DECISION_ALREADY_RECORDED");
  }
  const record: D2R7DecisionRecord = Object.freeze({
    ...governedBase(actor, store, provenanceRef, citedCurrentness, citedLifecycleStage, fingerprint),
    contextId: context.contextId,
    decisionContextId,
    objectId,
    statement,
    rationale,
    authorityRole,
    alternatives,
    affectedObjectIds,
    requirementObjectIds,
    assumptionObjectIds,
    evidenceObjectIds,
    predecessorDecisionContextId: predecessor?.decisionContextId ?? null,
  });
  if (predecessor) {
    const index = store.decisions.findIndex((row) => row.decisionContextId === predecessor.decisionContextId);
    store.decisions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    remember(store, "DECISION", predecessor.decisionContextId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.decisions.push(record);
  remember(store, "DECISION", record.decisionContextId, "CREATED", record.fingerprint);
  return record;
}

export function recordCivilChange(store: D2R7Store, actor: D2R1Actor, input: D2R7ChangeInput): D2R7ChangeRecord {
  refuseApproval(actor, input.approve);
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const changedObjectId = requireObject(store, actor, context.contextId, input.changedObjectId, "", citedCurrentness, "CHANGED_OBJECT_REQUIRED");
  if (!Array.isArray(input.affectedRelationships) || input.affectedRelationships.length === 0) fail("AFFECTED_RELATIONSHIP_REQUIRED");
  const affectedRelationships = input.affectedRelationships.map((link) => {
    if (!(D2_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    const targetObjectId = requireObject(store, actor, context.contextId, link.targetObjectId, "", citedCurrentness, "AFFECTED_OBJECT_REQUIRED");
    return { kind: link.kind as (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number], targetObjectId };
  }).sort((left, right) => `${left.kind}|${left.targetObjectId}`.localeCompare(`${right.kind}|${right.targetObjectId}`));
  if (input.reassessmentRequired !== true && input.reassessmentRequired !== false) fail("REASSESSMENT_FLAG_REQUIRED");
  const initiatingSource = explicit(input.initiatingSource, "INITIATING_SOURCE_REQUIRED");
  const rationale = explicit(input.rationale, "RATIONALE_REQUIRED");
  const authorityRole = authorityRoleOf(input.authorityRole);
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const changeContextId = explicit(input.changeContextId, "CHANGE_CONTEXT_REQUIRED");
  const predecessor = input.predecessorChangeContextId ? store.changes.find((row) => row.changeContextId === input.predecessorChangeContextId) : null;
  if (input.predecessorChangeContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    changeContextId,
    contextId: context.contextId,
    initiatingSource,
    changedObjectId,
    affectedRelationships,
    rationale,
    reassessmentRequired: input.reassessmentRequired,
    authorityRole,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorChangeContextId: predecessor?.changeContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.changes.find((row) => row.changeContextId === changeContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("CHANGE_ALREADY_RECORDED");
  }
  const before = store.r6.r5.r4.r3.r2.r1.objects.map((row) => row.objectId + row.recordStatus).join("|");
  const record: D2R7ChangeRecord = Object.freeze({
    ...governedBase(actor, store, provenanceRef, citedCurrentness, undefined, fingerprint),
    contextId: context.contextId,
    changeContextId,
    initiatingSource,
    changedObjectId,
    affectedRelationships,
    rationale,
    reassessmentRequired: input.reassessmentRequired,
    engineeringInvalid: false,
    automaticRecalculation: false,
    authorityRole,
    predecessorChangeContextId: predecessor?.changeContextId ?? null,
  });
  if (predecessor) {
    const index = store.changes.findIndex((row) => row.changeContextId === predecessor.changeContextId);
    store.changes[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    remember(store, "CHANGE", predecessor.changeContextId, "SUPERSEDED", predecessor.fingerprint);
  }
  store.changes.push(record);
  remember(store, "CHANGE", record.changeContextId, "CREATED", record.fingerprint);
  if (record.reassessmentRequired) {
    for (const link of affectedRelationships) {
      store.reassessments.push({
        objectId: link.targetObjectId,
        changeContextId: record.changeContextId,
        status: "REASSESSMENT_REQUIRED",
        engineeringInvalid: false,
        automaticRecalculation: false,
        engineeringValidated: false,
      });
    }
  }
  if (store.r6.r5.r4.r3.r2.r1.objects.map((row) => row.objectId + row.recordStatus).join("|") !== before) fail("UPSTREAM_MUTATION_REJECTED");
  return record;
}

export function mutateRequirementsAssumptionsChange(): never {
  return fail("R7_MUTATION_REJECTED");
}

export function redesignCivil(): never {
  return fail("REDESIGN_NOT_IN_R7");
}

export function calculateFromGovernance(): never {
  return fail("RECALCULATION_NOT_IN_R7");
}
