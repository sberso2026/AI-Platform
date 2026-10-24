/**
 * EOS-D4-R7 — Mechanical requirements, assumptions, decisions, and change.
 * One bounded runtime. Reuses canonical EOS governance. Does not recalculate or redesign.
 */
import {
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
} from "@rtb/types";
import {
  assertAssumptionMateriality,
  assertAssumptionValidationStatus,
  assertHumanApprovalActor,
  assertSingleSelectedAlternative,
  assertSupersessionPair,
} from "../decision-intelligence/invariants";
import { INFORMATION_REQUIREMENT_AI_BOUNDARY, INFORMATION_REQUIREMENT_STATUSES } from "../information-requirements/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D4_CONTEXT_AUTHORITY,
  D4_EXPLICIT_RELATIONSHIP_KINDS,
  D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  type D4R1Actor,
} from "./identity-foundation";
import { D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY, D4_RUNTIME_COUNT as D4_R2_RUNTIME_COUNT } from "./equipment-system-context";
import { D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY, D4_RUNTIME_COUNT as D4_R3_RUNTIME_COUNT } from "./design-condition-performance-context";
import {
  D4_RUNTIME_COUNT as D4_R4_RUNTIME_COUNT,
  D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY,
} from "./vendor-data-evidence-context";
import {
  D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY,
  D4_RUNTIME_COUNT as D4_R5_RUNTIME_COUNT,
} from "./mechanical-technical-context";
import {
  D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY,
  D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R6_CHANGE_READY,
  D4_RUNTIME_COUNT as D4_R6_RUNTIME_COUNT,
  type D4R6Store,
  type D4R6UpstreamKind,
} from "./maintainability-access-package-context";

export const D4_R7_STATUS = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED" as const;
export const D4_R7_MATURITY = D4_R7_STATUS;
export const D4_R7_MATURITY_STATE = D4_R7_STATUS;
export const D4_RUNTIME_STARTED = true as const;
export const D4_RUNTIME_COUNT = 7 as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED = true as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 1 as const;
export const D4_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = true as const;
export const D4_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE = true as const;
export const D4_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE = true as const;
export const D4_REUSES_CANONICAL_DECISION_GOVERNANCE = true as const;
export const D4_REUSES_CANONICAL_CHANGE_GOVERNANCE = true as const;
export const PARALLEL_D4_REQUIREMENT_ENGINE_CREATED = false as const;
export const PARALLEL_D4_ASSUMPTION_ENGINE_CREATED = false as const;
export const PARALLEL_D4_DECISION_ENGINE_CREATED = false as const;
export const PARALLEL_D4_CHANGE_ENGINE_CREATED = false as const;
export const D4_R1_R6_EXACT_SUBJECT_REVISIONS_REUSED = true as const;
export const EXACT_D4_R7_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D4_R7_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D4_R7_SUBJECT_AUTO_REPOINTED = false as const;
export const D4_REQUIREMENT_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_ASSUMPTION_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const SOURCE_REQUIREMENT_EQUALS_ADOPTED_MECHANICAL_REQUIREMENT = false as const;
export const REQUIREMENT_PRESENT_EQUALS_VALIDATED = false as const;
export const REQUIREMENT_PRESENT_EQUALS_CONFORMANT = false as const;
export const ASSUMPTION_EQUALS_VALIDATED_FACT = false as const;
export const ASSUMPTION_EQUALS_ENGINEERING_VALIDATED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D4_ASSUMPTION = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const AI_CAN_INVENT_AUTHORITATIVE_D4_REQUIREMENT = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const AI_RECOMMENDATION_EQUALS_ENGINEERING_DECISION = false as const;
export const ADMIN_ACTION_EQUALS_ENGINEERING_DECISION = false as const;
export const AI_CAN_CREATE_AUTHORITATIVE_D4_ENGINEERING_DECISION = false as const;
export const ADMIN_CAN_CREATE_ENGINEERING_AUTHORITY_BY_ACTION = false as const;
export const D4_EXPLICIT_CHANGE_DEPENDENCIES_SUPPORTED = true as const;
export const D4_INFERRED_CHANGE_DEPENDENCY_ALLOWED = false as const;
export const D4_R7_SUPERSESSION_GOVERNANCE_IMPLEMENTED = true as const;
export const SUPERSEDED_D4_RECORD_EQUALS_DELETED = false as const;
export const SUPERSEDED_D4_RECORD_EQUALS_INVALID = false as const;
export const SUPERSEDED_D4_RECORD_AUTO_REPLACED_IN_HISTORY = false as const;
export const D4_REASSESSMENT_REQUIRED_STATE_IMPLEMENTED = true as const;
export const D4_REASSESSMENT_COMPLETED_STATE_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_INVALID = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_RECALCULATED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_REDESIGNED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_APPROVED = false as const;
export const D4_CHANGE_AUTO_RECALCULATES_ENGINEERING = false as const;
export const D4_CHANGE_AUTO_REDESIGNS_ENGINEERING = false as const;
export const D4_CHANGE_AUTO_REVALIDATES_ENGINEERING = false as const;
export const D4_CHANGE_AUTO_APPROVES_ENGINEERING = false as const;
export const D4_R7_R3_CHANGE_GOVERNANCE_INTEGRATED = true as const;
export const D4_R7_AUTO_MUTATES_R3_DESIGN_CONDITION = false as const;
export const D4_R7_AUTO_MUTATES_R3_PERFORMANCE_CONTEXT = false as const;
export const D4_R7_AUTO_RECALCULATES_R3_DESIGN_CONDITION = false as const;
export const D4_R7_AUTO_RECALCULATES_R3_PERFORMANCE = false as const;
export const D4_R7_R4_VENDOR_CHANGE_GOVERNANCE_INTEGRATED = true as const;
export const NEW_VENDOR_REVISION_AUTO_ADOPTED_AS_ENGINEERING = false as const;
export const VENDOR_CHANGE_AUTO_OVERRIDES_ENGINEERING = false as const;
export const ENGINEERING_CONTEXT_AUTO_OVERRIDES_VENDOR_EVIDENCE = false as const;
export const D4_R7_R5_TECHNICAL_REQUIREMENT_CHANGE_GOVERNANCE_INTEGRATED = true as const;
export const D4_R7_AUTO_REWRITES_R5_REQUIREMENT = false as const;
export const D4_R7_AUTO_REWRITES_R5_TECHNICAL_CONTEXT = false as const;
export const D4_R7_R6_MAINTAINABILITY_CHANGE_GOVERNANCE_INTEGRATED = true as const;
export const D4_R7_AUTO_RECALCULATES_CLEARANCE = false as const;
export const D4_R7_AUTO_SOLVES_ACCESS_PATH = false as const;
export const D4_R7_AUTO_SOLVES_REMOVAL_ROUTE = false as const;
export const D4_R7_AUTO_REDESIGNS_PACKAGE_ARRANGEMENT = false as const;
export const D4_R7_AUTO_PERFORMS_LIFTING_ANALYSIS = false as const;
export const AI_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D4_MECHANICAL_ENGINEERING_AUTHORITY = false as const;
export const AI_CAN_CLOSE_D4_REASSESSMENT_AS_ENGINEERING_COMPLETE = false as const;
export const CHANGE_ACCEPTED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const DECISION_RECORDED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D4_REUSES_CANONICAL_CURRENTNESS = true as const;
export const PARALLEL_D4_CURRENTNESS_ENGINE_CREATED = false as const;
export const D4_REUSES_CANONICAL_FINGERPRINT = true as const;
export const SECOND_D4_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D4_FINGERPRINT_ALGORITHM_REUSED = D4_FINGERPRINT_ALGORITHM;
export const D4_R7_PROVENANCE_REQUIRED = true as const;
export const D4_R7_PROVENANCE_PRESERVED = true as const;
export const SILENT_D4_R7_MUTATION_ALLOWED = false as const;
export const D4_R7_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D4_R7_SCOPE_ENFORCED = true as const;
export const D4_R7_HIDDEN_CALCULATION_ALLOWED = false as const;
export const D4_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D4_R7_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D4_R7_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export {
  D4_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D4_EQUALS_D2_CIVIL_AUTHORITY,
  D4_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D4_EQUALS_D5_PIPING_AUTHORITY,
  D4_EQUALS_D6_PROCESS_AUTHORITY,
  D4_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D4_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
};

export const D4_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 0 as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
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
export const D4_STRUCTURAL_LIFTING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D4_RIGGING_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D4_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D4_CONFORMANCE_DETERMINATION_RUNTIME_COUNT = 0 as const;
export const D4_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D4_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D4_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D4_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
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

export const D4_MECHANICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY_REUSED = D4_EQUIPMENT_SYSTEM_CONTEXT_RUNTIME_READY;
export const D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY_REUSED = D4_DESIGN_CONDITION_PERFORMANCE_RUNTIME_READY;
export const D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY_REUSED = D4_VENDOR_DATA_EVIDENCE_RUNTIME_READY;
export const D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY_REUSED = D4_MECHANICAL_TECHNICAL_CONTEXT_RUNTIME_READY;
export const D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY_REUSED = D4_MAINTAINABILITY_ACCESS_PACKAGE_RUNTIME_READY;
export const D4_R6_CHANGE_RUNTIME_READY = R6_CHANGE_READY;
export const D4_R2_RUNTIME_COUNT_REUSED = D4_R2_RUNTIME_COUNT;
export const D4_R3_RUNTIME_COUNT_REUSED = D4_R3_RUNTIME_COUNT;
export const D4_R4_RUNTIME_COUNT_REUSED = D4_R4_RUNTIME_COUNT;
export const D4_R5_RUNTIME_COUNT_REUSED = D4_R5_RUNTIME_COUNT;
export const D4_R6_RUNTIME_COUNT_REUSED = D4_R6_RUNTIME_COUNT;
export const D4_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D4_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D4_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D4_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;

export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_R8_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D5_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_CHANGE_RECALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_CHANGE_REDESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_MECHANICAL_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D4_R8_CANONICAL_PHASE = D4_IMPLEMENTATION_PHASES[7];
export const D4_R8_PHASE_TYPE = "DISCIPLINE_INTERFACES_AND_HANDOFFS" as const;
export const D4_R8_CANONICAL_SCOPE =
  "Implement governed Mechanical discipline interfaces and handoffs using exact D4 R1-R7 revisions and canonical EOS interface governance. Support exact D4-to-D1/D2/D3 handoffs and future D5-D8 counterpart contracts while preserving discipline authority, explicit counterpart references, currentness, limitations and history. Do not fabricate missing counterpart information, transfer authority, perform cross-discipline reasoning, automatically recalculate/redesign, implement review/validation or start D5-D9 runtime." as const;
export const D4_R8_STARTED = false as const;
export const D4_R7_READY_FOR_NEXT_PHASE = true as const;
export const D4_R7_NEXT_PHASE = D4_R8_CANONICAL_PHASE;
export const D4_R7_NEXT_PHASE_TYPE = D4_R8_PHASE_TYPE;
export const D4_R7_CANONICAL_NEXT_PHASE = D4_R8_CANONICAL_PHASE;
export const D4_R7_CANONICAL_NEXT_PHASE_SCOPE = D4_R8_CANONICAL_SCOPE;
export const D4_R7_BLOCKER = "NONE" as const;
export const D4_R7_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D4_R7_OPEN_REQUIREMENT_STATUSES = ["PLANNED", "REQUESTED", "AWAITING_INFORMATION", "RECEIVED", "NOT_APPLICABLE"] as const;
export const D4_R7_CHANGE_CATEGORIES = [
  "REQUIREMENT_CHANGED",
  "ASSUMPTION_CHANGED",
  "DECISION_SUPERSEDED",
  "VENDOR_EVIDENCE_CHANGED",
  "DESIGN_CONDITION_CHANGED",
  "TECHNICAL_REQUIREMENT_CHANGED",
  "MAINTAINABILITY_CONTEXT_CHANGED",
  "REASSESSMENT_REQUIRED",
] as const;
export const D4_R7_DEPENDENCY_TARGETS = ["R3_DESIGN", "R4_VENDOR", "R5_REQUIREMENT", "R6_MAINTAINABILITY", "R7_REQUIREMENT", "R7_ASSUMPTION", "R7_DECISION"] as const;
export const D4_R7_REASSESSMENT_STATES = ["REASSESSMENT_REQUIRED", "REASSESSMENT_COMPLETED"] as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const BROAD = new Set(["all", "global", "every", "unspecified", "any"]);
const INFERRED = new Set(["matching_tag", "shared_vendor", "shared_package", "system_membership", "proximity", "document_cooccurrence", "similar_value", "ai_similarity", "inferred"]);
const OPEN_REQUIREMENT_STATUSES = new Set<string>(D4_R7_OPEN_REQUIREMENT_STATUSES);

export type D4R7Dependency = {
  kind: (typeof D4_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetKind: (typeof D4_R7_DEPENDENCY_TARGETS)[number];
  targetId: string;
  targetFingerprint: string;
};

type DependencyInput = {
  kind: string;
  targetKind: string;
  targetId: string;
  targetFingerprint: string;
  inference?: string | null;
  inferred?: boolean;
};

type Prohibited = {
  inventRequirement?: boolean;
  inventAssumption?: boolean;
  aiRecommendation?: boolean;
  adminAction?: boolean;
  closeAsEngineeringComplete?: boolean;
  inferDependencies?: boolean;
  recalculate?: boolean;
  redesign?: boolean;
  revalidate?: boolean;
  approve?: boolean;
  mutateR3?: boolean;
  mutateR3Performance?: boolean;
  recalculateR3?: boolean;
  adoptVendorRevision?: boolean;
  vendorOverridesEngineering?: boolean;
  engineeringOverridesVendor?: boolean;
  rewriteR5?: boolean;
  rewriteR5Context?: boolean;
  recalculateClearance?: boolean;
  accessPath?: boolean;
  removalRoute?: boolean;
  redesignPackage?: boolean;
  liftingAnalysis?: boolean;
  formula?: boolean;
  repoint?: boolean;
  disciplineInterface?: boolean;
  d9Reasoning?: boolean;
  conforms?: boolean;
  certified?: boolean;
  engineeringValidated?: boolean;
};

export type D4R7SubjectInput = Prohibited & {
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
  citedCurrentness?: (typeof D4_CURRENTNESS_STATES)[number] | null;
  citedLifecycleStage: string;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  assertedFingerprint?: string | null;
};

type BoundSubject = {
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
};

type GovernanceBase = BoundSubject & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  authority: typeof D4_CONTEXT_AUTHORITY;
  engineeringValidated: false;
  engineeringApproved: false;
  conformant: false;
  certified: false;
  invalidated: false;
  deleted: false;
  fingerprint: string;
  predecessorId: string | null;
  predecessorFingerprint: string | null;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: (typeof D4_CURRENTNESS_STATES)[number];
  citedCurrentness: (typeof D4_CURRENTNESS_STATES)[number] | null;
  citedLifecycleStage: (typeof D4_MATURITY_STATES)[number];
  createdAt: string;
  createdBy: string;
};

export type D4R7RequirementRecord = GovernanceBase & {
  requirementContextId: string;
  statement: string;
  sourceBasis: string;
  sourceRef: string;
  sourceRevision: string;
  requirementStatus: (typeof D4_R7_OPEN_REQUIREMENT_STATUSES)[number];
  adopted: boolean;
  adoptionRationale: string | null;
};

export type D4R7AssumptionRecord = GovernanceBase & {
  assumptionContextId: string;
  statement: string;
  basis: string;
  validationStatus: "unvalidated";
  materiality: string;
  validatedFact: false;
};

export type D4R7DecisionRecord = GovernanceBase & {
  decisionContextId: string;
  statement: string;
  basis: string;
  alternatives: { id: string; statement: string; is_selected: boolean }[];
  authoritativeDecision: true;
  aiRecommendation: false;
};

export type D4R7ChangeRecord = GovernanceBase & {
  changeContextId: string;
  changeCategory: (typeof D4_R7_CHANGE_CATEGORIES)[number];
  originRef: string;
  reason: string;
  dependencies: D4R7Dependency[];
  vendorAdopted: false;
  recalculated: false;
  redesigned: false;
};

export type D4R7ReassessmentRecord = GovernanceBase & {
  reassessmentContextId: string;
  changeContextId: string;
  targetId: string;
  targetFingerprint: string;
  state: (typeof D4_R7_REASSESSMENT_STATES)[number];
  recalculated: false;
  redesigned: false;
};

export type D4R7HistoryRecord = {
  historyId: string;
  subjectKind: "REQUIREMENT" | "ASSUMPTION" | "DECISION" | "CHANGE" | "REASSESSMENT";
  subjectId: string;
  fingerprint: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  recordedAt: string;
};

export type D4R7Store = {
  r6: D4R6Store;
  now: () => string;
  requirements: D4R7RequirementRecord[];
  assumptions: D4R7AssumptionRecord[];
  decisions: D4R7DecisionRecord[];
  changes: D4R7ChangeRecord[];
  reassessments: D4R7ReassessmentRecord[];
  history: D4R7HistoryRecord[];
};

type Actor = D4R1Actor;

function fail(code: string): never {
  throw new Error(`D4_R7_${code}`);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase())) fail(code);
  return token;
}

function currentnessOf(value: (typeof D4_CURRENTNESS_STATES)[number] | null | undefined): (typeof D4_CURRENTNESS_STATES)[number] | null {
  if (value === undefined || value === null) return null;
  if (!(D4_CURRENTNESS_STATES as readonly string[]).includes(value)) fail("CURRENTNESS_INVALID");
  return value;
}

function maturityOf(value: string): (typeof D4_MATURITY_STATES)[number] {
  const token = value.trim();
  if (!(D4_MATURITY_STATES as readonly string[]).includes(token)) fail("LIFECYCLE_INVALID");
  return token as (typeof D4_MATURITY_STATES)[number];
}

function assertActor(actor: Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (/^AI(?:\b|_)/i.test(actor.actorId) || actor.actorId === "LLM" || actor.actorId === "OPTIMIZER" || /^AI(?:\b|_)/i.test(actor.authority)) {
    fail("AI_NOT_MECHANICAL_AUTHORITY");
  }
  if (actor.actorId === "ADMIN" || actor.actorId === "ADMINISTRATOR" || actor.authority === "ADMIN" || actor.authority === "ADMINISTRATOR") {
    fail("ADMIN_NOT_MECHANICAL_AUTHORITY");
  }
  if (actor.authority === "MECHANICAL_ENGINEERING_AUTHORITY") fail("AUTHORITY_SPOOFING_REJECTED");
  if (actor.authority !== D4_CONTEXT_AUTHORITY) fail("RECORDER_AUTHORITY_INVALID");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertProhibited(input: Prohibited): void {
  if (input.inventRequirement === true) fail("INVENTED_REQUIREMENT_REJECTED");
  if (input.inventAssumption === true) fail("INVENTED_ASSUMPTION_REJECTED");
  if (input.aiRecommendation === true) fail("AI_RECOMMENDATION_NOT_DECISION");
  if (input.adminAction === true) fail("ADMIN_ACTION_NOT_DECISION");
  if (input.closeAsEngineeringComplete === true) fail("REASSESSMENT_CLOSURE_REJECTED");
  if (input.inferDependencies === true) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.recalculate === true || input.recalculateR3 === true || input.recalculateClearance === true) fail("RECALCULATION_REJECTED");
  if (input.redesign === true || input.redesignPackage === true) fail("REDESIGN_REJECTED");
  if (input.revalidate === true || input.conforms === true || input.certified === true || input.engineeringValidated === true) fail("VALIDATION_AUTHORITY_REJECTED");
  if (input.approve === true) fail("APPROVAL_RUNTIME_REJECTED");
  if (input.mutateR3 === true || input.mutateR3Performance === true) fail("R3_MUTATION_REJECTED");
  if (input.adoptVendorRevision === true) fail("VENDOR_AUTO_ADOPTION_REJECTED");
  if (input.vendorOverridesEngineering === true) fail("VENDOR_OVERRIDE_REJECTED");
  if (input.engineeringOverridesVendor === true) fail("ENGINEERING_OVERRIDE_REJECTED");
  if (input.rewriteR5 === true || input.rewriteR5Context === true) fail("R5_REWRITE_REJECTED");
  if (input.accessPath === true) fail("ACCESS_PATH_SOLVER_REJECTED");
  if (input.removalRoute === true) fail("REMOVAL_ROUTE_SOLVER_REJECTED");
  if (input.liftingAnalysis === true) fail("LIFTING_ANALYSIS_REJECTED");
  if (input.formula === true) fail("HIDDEN_CALCULATION_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_REJECTED");
  if (input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_REJECTED");
}

function guardText(value: string, code: string): string {
  const token = explicit(value, code);
  if (/[=*]|calc\(|sqrt\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function upstreamSeal(store: D4R7Store): string {
  const r3 = store.r6.r5.r4.r3.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  const r4 = store.r6.r5.r4.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.suppliedValue}:${row.recordStatus}`).join("|");
  const r5 = store.r6.r5.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.requirementStatement}:${row.recordStatus}`).join("|");
  const r6 = store.r6.records.map((row) => `${row.recordId}:${row.fingerprint}:${row.statement}:${row.recordStatus}`).join("|");
  return `${r3}#${r4}#${r5}#${r6}`;
}

function requireChain(store: D4R7Store, actor: Actor, input: D4R7SubjectInput): BoundSubject {
  assertActor(actor);
  assertProhibited(input);
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) fail("SCOPE_MISMATCH");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== tenantId || context.workspaceId !== workspaceId || context.projectId !== projectId) fail("R1_CONTEXT_NOT_FOUND");
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.contextId !== context.contextId || object.fingerprint !== objectRevision) fail("R1_REVISION_MISMATCH");
  const subjectKind = input.r2SubjectKind;
  const subjectId = explicit(input.r2SubjectId, "R2_SUBJECT_REQUIRED");
  const subjectRevision = explicit(input.r2RevisionFingerprint, "R2_REVISION_REQUIRED");
  const rows =
    subjectKind === "CLASSIFICATION"
      ? store.r6.r5.r4.r3.r2.classifications
      : subjectKind === "SERVICE"
        ? store.r6.r5.r4.r3.r2.services
        : subjectKind === "MEMBERSHIP"
          ? store.r6.r5.r4.r3.r2.memberships
          : store.r6.r5.r4.r3.r2.descriptions;
  const subject = rows.find((row) => {
    if (subjectKind === "CLASSIFICATION" && "classificationId" in row) return row.classificationId === subjectId;
    if (subjectKind === "SERVICE" && "serviceContextId" in row) return row.serviceContextId === subjectId;
    if (subjectKind === "MEMBERSHIP" && "membershipId" in row) return row.membershipId === subjectId;
    if (subjectKind === "DESCRIPTION" && "descriptionId" in row) return row.descriptionId === subjectId;
    return false;
  });
  if (!subject || subject.fingerprint !== subjectRevision || subject.objectId !== object.objectId) fail("R2_REVISION_MISMATCH");
  const r3 = store.r6.r5.r4.r3.records.find((row) => row.recordId === explicit(input.r3RecordId, "R3_RECORD_REQUIRED"));
  if (!r3 || r3.fingerprint !== explicit(input.r3RevisionFingerprint, "R3_REVISION_REQUIRED") || r3.objectId !== object.objectId) fail("R3_REVISION_MISMATCH");
  const r4 = store.r6.r5.r4.records.find((row) => row.recordId === explicit(input.r4RecordId, "R4_RECORD_REQUIRED"));
  if (!r4 || r4.fingerprint !== explicit(input.r4RevisionFingerprint, "R4_REVISION_REQUIRED") || r4.objectId !== object.objectId) fail("R4_REVISION_MISMATCH");
  const r5 = store.r6.r5.records.find((row) => row.recordId === explicit(input.r5RecordId, "R5_RECORD_REQUIRED"));
  if (!r5 || r5.fingerprint !== explicit(input.r5RevisionFingerprint, "R5_REVISION_REQUIRED") || r5.objectId !== object.objectId) fail("R5_REVISION_MISMATCH");
  const r6 = store.r6.records.find((row) => row.recordId === explicit(input.r6RecordId, "R6_RECORD_REQUIRED"));
  if (!r6 || r6.fingerprint !== explicit(input.r6RevisionFingerprint, "R6_REVISION_REQUIRED") || r6.objectId !== object.objectId) fail("R6_REVISION_MISMATCH");
  const cited = currentnessOf(input.citedCurrentness);
  if ((cited === null || cited === "CURRENT") && [context, object, subject, r3, r4, r5, r6].some((row) => row.recordStatus !== "CURRENT")) {
    fail("SOURCE_NOT_CURRENT");
  }
  return {
    contextId,
    objectId,
    objectRevisionFingerprint: object.fingerprint,
    r2SubjectKind: subjectKind,
    r2SubjectId: subjectId,
    r2RevisionFingerprint: subjectRevision,
    r3RecordId: r3.recordId,
    r3RevisionFingerprint: r3.fingerprint,
    r4RecordId: r4.recordId,
    r4RevisionFingerprint: r4.fingerprint,
    r5RecordId: r5.recordId,
    r5RevisionFingerprint: r5.fingerprint,
    r6RecordId: r6.recordId,
    r6RevisionFingerprint: r6.fingerprint,
  };
}

function remember(store: D4R7Store, subjectKind: D4R7HistoryRecord["subjectKind"], subjectId: string, fingerprint: string, recordStatus: D4R7HistoryRecord["recordStatus"]): void {
  store.history.push({
    historyId: `d4r7-history-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    fingerprint,
    recordStatus,
    recordedAt: store.now(),
  });
}

function resolveDependency(store: D4R7Store, link: DependencyInput): D4R7Dependency {
  if (link.inferred === true || (link.inference && INFERRED.has(link.inference.trim().toLowerCase()))) fail("INFERRED_DEPENDENCY_REJECTED");
  const kind = explicit(link.kind, "RELATIONSHIP_NOT_EXPLICIT");
  if (!(D4_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) fail("RELATIONSHIP_NOT_EXPLICIT");
  const targetKind = explicit(link.targetKind, "DEPENDENCY_TARGET_REQUIRED");
  if (!(D4_R7_DEPENDENCY_TARGETS as readonly string[]).includes(targetKind)) fail("DEPENDENCY_TARGET_INVALID");
  const targetId = explicit(link.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(link.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  const found =
    targetKind === "R3_DESIGN"
      ? store.r6.r5.r4.r3.records.some((row) => row.recordId === targetId && row.fingerprint === targetFingerprint)
      : targetKind === "R4_VENDOR"
        ? store.r6.r5.r4.records.some((row) => row.recordId === targetId && row.fingerprint === targetFingerprint)
        : targetKind === "R5_REQUIREMENT"
          ? store.r6.r5.records.some((row) => row.recordId === targetId && row.fingerprint === targetFingerprint)
          : targetKind === "R6_MAINTAINABILITY"
            ? store.r6.records.some((row) => row.recordId === targetId && row.fingerprint === targetFingerprint)
            : targetKind === "R7_REQUIREMENT"
              ? store.requirements.some((row) => row.requirementContextId === targetId && row.fingerprint === targetFingerprint)
              : targetKind === "R7_ASSUMPTION"
                ? store.assumptions.some((row) => row.assumptionContextId === targetId && row.fingerprint === targetFingerprint)
                : store.decisions.some((row) => row.decisionContextId === targetId && row.fingerprint === targetFingerprint);
  if (!found) fail("DEPENDENCY_REVISION_MISMATCH");
  return { kind: kind as D4R7Dependency["kind"], targetKind: targetKind as D4R7Dependency["targetKind"], targetId, targetFingerprint };
}

function baseFields(store: D4R7Store, actor: Actor, input: D4R7SubjectInput, bound: BoundSubject, fingerprint: string, predecessorId: string | null, predecessorFingerprint: string | null): GovernanceBase {
  const cited = currentnessOf(input.citedCurrentness);
  return {
    ...bound,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    applicability: explicit(input.applicability, "APPLICABILITY_REQUIRED"),
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    provenanceRef: explicit(input.provenanceRef, "PROVENANCE_REQUIRED"),
    authority: D4_CONTEXT_AUTHORITY,
    engineeringValidated: false,
    engineeringApproved: false,
    conformant: false,
    certified: false,
    invalidated: false,
    deleted: false,
    fingerprint,
    predecessorId,
    predecessorFingerprint,
    recordStatus: "CURRENT",
    currentness: cited ?? "CURRENT",
    citedCurrentness: cited,
    citedLifecycleStage: maturityOf(input.citedLifecycleStage),
    createdAt: store.now(),
    createdBy: actor.actorId,
  };
}

export function createD4R7Store(r6: D4R6Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D4R7Store {
  return { r6, now, requirements: [], assumptions: [], decisions: [], changes: [], reassessments: [], history: [] };
}

function finish<T extends { fingerprint: string }>(store: D4R7Store, before: string, record: T, asserted: string | null | undefined): T {
  if (asserted != null && asserted !== record.fingerprint) fail("FINGERPRINT_MISMATCH");
  if (upstreamSeal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function recordMechanicalGovernedSourceRequirement(
  store: D4R7Store,
  actor: Actor,
  input: D4R7SubjectInput & {
    requirementContextId: string;
    statement: string;
    sourceBasis: string;
    sourceRef: string;
    sourceRevision: string;
    requirementStatus?: string;
    adoptionRationale?: string | null;
    predecessorRequirementContextId?: string | null;
  },
): D4R7RequirementRecord {
  return commitRequirement(store, actor, input, false);
}

export function recordMechanicalGovernedRequirement(
  store: D4R7Store,
  actor: Actor,
  input: D4R7SubjectInput & {
    requirementContextId: string;
    statement: string;
    sourceBasis: string;
    sourceRef: string;
    sourceRevision: string;
    requirementStatus?: string;
    adoptionRationale?: string | null;
    predecessorRequirementContextId?: string | null;
  },
): D4R7RequirementRecord {
  return commitRequirement(store, actor, input, true);
}

function commitRequirement(
  store: D4R7Store,
  actor: Actor,
  input: D4R7SubjectInput & {
    requirementContextId: string;
    statement: string;
    sourceBasis: string;
    sourceRef: string;
    sourceRevision: string;
    requirementStatus?: string;
    adoptionRationale?: string | null;
    predecessorRequirementContextId?: string | null;
  },
  adopted: boolean,
): D4R7RequirementRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const requestedStatus = input.requirementStatus ?? "PLANNED";
  if (!(INFORMATION_REQUIREMENT_STATUSES as readonly string[]).includes(requestedStatus)) fail("REQUIREMENT_STATUS_INVALID");
  if (!OPEN_REQUIREMENT_STATUSES.has(requestedStatus)) fail("REQUIREMENT_ACCEPTANCE_NOT_IN_R7");
  const statement = guardText(input.statement, "REQUIREMENT_STATEMENT_REQUIRED");
  const sourceBasis = explicit(input.sourceBasis, "SOURCE_BASIS_REQUIRED");
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const rationale = input.adoptionRationale && input.adoptionRationale.trim() ? explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED") : null;
  if (adopted && !rationale) fail("ADOPTION_RATIONALE_REQUIRED");
  if (!adopted && rationale) fail("SOURCE_NOT_ADOPTED");
  const requirementContextId = explicit(input.requirementContextId, "REQUIREMENT_REQUIRED");
  const predecessor = input.predecessorRequirementContextId
    ? store.requirements.find((row) => row.requirementContextId === explicit(input.predecessorRequirementContextId ?? "", "PREDECESSOR_INVALID")) ?? null
    : null;
  if (input.predecessorRequirementContextId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT" || predecessor.adopted !== adopted)) {
    fail("PREDECESSOR_NOT_FOUND");
  }
  const fingerprint = fingerprintCanonical({
    requirementContextId,
    ...bound,
    statement,
    sourceBasis,
    sourceRef,
    sourceRevision,
    requestedStatus,
    adopted,
    rationale,
    applicability: input.applicability,
    limitations: input.limitations,
    predecessor: predecessor?.requirementContextId ?? null,
  });
  const existing = store.requirements.find((row) => row.requirementContextId === requirementContextId);
  if (existing) return existing.fingerprint === fingerprint ? finish(store, before, existing, input.assertedFingerprint) : fail("RECORD_ALREADY_RECORDED");
  if (store.requirements.some((row) => row.recordStatus === "CURRENT" && row.requirementContextId !== predecessor?.requirementContextId && row.objectId === bound.objectId && row.statement === statement && row.sourceRevision === sourceRevision && row.adopted === adopted)) {
    fail("DUPLICATE_RECORD_REJECTED");
  }
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
    remember(store, "REQUIREMENT", predecessor.requirementContextId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D4R7RequirementRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.requirementContextId ?? null, predecessor?.fingerprint ?? null),
    requirementContextId,
    statement,
    sourceBasis,
    sourceRef,
    sourceRevision,
    requirementStatus: requestedStatus as D4R7RequirementRecord["requirementStatus"],
    adopted,
    adoptionRationale: rationale,
  };
  store.requirements.push(record);
  remember(store, "REQUIREMENT", record.requirementContextId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordMechanicalAssumption(
  store: D4R7Store,
  actor: Actor,
  input: D4R7SubjectInput & {
    assumptionContextId: string;
    statement: string;
    basis: string;
    validationStatus?: string;
    materiality?: string;
    predecessorAssumptionContextId?: string | null;
  },
): D4R7AssumptionRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const validationStatus = input.validationStatus ?? "unvalidated";
  assertAssumptionValidationStatus(validationStatus);
  if (validationStatus !== "unvalidated") fail("ASSUMPTION_NOT_VALIDATED_FACT");
  const materiality = input.materiality ?? "medium";
  assertAssumptionMateriality(materiality);
  const statement = guardText(input.statement, "ASSUMPTION_STATEMENT_REQUIRED");
  const basis = explicit(input.basis, "SOURCE_BASIS_REQUIRED");
  const assumptionContextId = explicit(input.assumptionContextId, "ASSUMPTION_REQUIRED");
  const predecessor = input.predecessorAssumptionContextId
    ? store.assumptions.find((row) => row.assumptionContextId === explicit(input.predecessorAssumptionContextId ?? "", "PREDECESSOR_INVALID")) ?? null
    : null;
  if (input.predecessorAssumptionContextId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_FOUND");
  const fingerprint = fingerprintCanonical({ assumptionContextId, ...bound, statement, basis, validationStatus, materiality, predecessor: predecessor?.assumptionContextId ?? null });
  const existing = store.assumptions.find((row) => row.assumptionContextId === assumptionContextId);
  if (existing) return existing.fingerprint === fingerprint ? finish(store, before, existing, input.assertedFingerprint) : fail("RECORD_ALREADY_RECORDED");
  if (store.assumptions.some((row) => row.recordStatus === "CURRENT" && row.assumptionContextId !== predecessor?.assumptionContextId && row.objectId === bound.objectId && row.statement === statement)) {
    fail("DUPLICATE_RECORD_REJECTED");
  }
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
    remember(store, "ASSUMPTION", predecessor.assumptionContextId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D4R7AssumptionRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.assumptionContextId ?? null, predecessor?.fingerprint ?? null),
    assumptionContextId,
    statement,
    basis,
    validationStatus: "unvalidated",
    materiality,
    validatedFact: false,
  };
  store.assumptions.push(record);
  remember(store, "ASSUMPTION", record.assumptionContextId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordMechanicalEngineeringDecision(
  store: D4R7Store,
  actor: Actor,
  input: D4R7SubjectInput & {
    decisionContextId: string;
    statement: string;
    basis: string;
    alternatives: { id: string; statement: string; is_selected?: boolean }[];
    predecessorDecisionContextId?: string | null;
  },
): D4R7DecisionRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const alternatives = (input.alternatives ?? []).map((row) => ({
    id: explicit(row.id, "ALTERNATIVE_REQUIRED"),
    statement: guardText(row.statement, "ALTERNATIVE_REQUIRED"),
    is_selected: row.is_selected === true,
  }));
  if (alternatives.length === 0) fail("ALTERNATIVE_REQUIRED");
  assertSingleSelectedAlternative(alternatives);
  const statement = guardText(input.statement, "DECISION_STATEMENT_REQUIRED");
  const basis = explicit(input.basis, "SOURCE_BASIS_REQUIRED");
  const decisionContextId = explicit(input.decisionContextId, "DECISION_REQUIRED");
  const predecessor = input.predecessorDecisionContextId
    ? store.decisions.find((row) => row.decisionContextId === explicit(input.predecessorDecisionContextId ?? "", "PREDECESSOR_INVALID")) ?? null
    : null;
  if (input.predecessorDecisionContextId) {
    if (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_FOUND");
    assertSupersessionPair({
      decisionId: decisionContextId,
      supersedesDecisionId: predecessor.decisionContextId,
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      prior: { id: predecessor.decisionContextId, tenant_id: predecessor.tenantId, workspace_id: predecessor.workspaceId },
    });
  }
  const fingerprint = fingerprintCanonical({ decisionContextId, ...bound, statement, basis, alternatives, predecessor: predecessor?.decisionContextId ?? null });
  const existing = store.decisions.find((row) => row.decisionContextId === decisionContextId);
  if (existing) return existing.fingerprint === fingerprint ? finish(store, before, existing, input.assertedFingerprint) : fail("RECORD_ALREADY_RECORDED");
  if (store.decisions.some((row) => row.recordStatus === "CURRENT" && row.decisionContextId !== predecessor?.decisionContextId && row.objectId === bound.objectId && row.statement === statement)) {
    fail("DUPLICATE_RECORD_REJECTED");
  }
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
    remember(store, "DECISION", predecessor.decisionContextId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D4R7DecisionRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.decisionContextId ?? null, predecessor?.fingerprint ?? null),
    decisionContextId,
    statement,
    basis,
    alternatives,
    authoritativeDecision: true,
    aiRecommendation: false,
  };
  store.decisions.push(record);
  remember(store, "DECISION", record.decisionContextId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordMechanicalChange(
  store: D4R7Store,
  actor: Actor,
  input: D4R7SubjectInput & {
    changeContextId: string;
    changeCategory: string;
    originRef: string;
    reason: string;
    dependencies: DependencyInput[];
    predecessorChangeContextId?: string | null;
  },
): D4R7ChangeRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const changeCategory = explicit(input.changeCategory, "CHANGE_CATEGORY_REQUIRED");
  if (!(D4_R7_CHANGE_CATEGORIES as readonly string[]).includes(changeCategory)) fail("CHANGE_CATEGORY_INVALID");
  if (!input.dependencies || input.dependencies.length === 0) fail("EXPLICIT_DEPENDENCY_REQUIRED");
  const dependencies = input.dependencies.map((link) => resolveDependency(store, link));
  const originRef = explicit(input.originRef, "CHANGE_ORIGIN_REQUIRED");
  const reason = guardText(input.reason, "CHANGE_REASON_REQUIRED");
  const changeContextId = explicit(input.changeContextId, "CHANGE_REQUIRED");
  const predecessor = input.predecessorChangeContextId
    ? store.changes.find((row) => row.changeContextId === explicit(input.predecessorChangeContextId ?? "", "PREDECESSOR_INVALID")) ?? null
    : null;
  if (input.predecessorChangeContextId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_FOUND");
  const fingerprint = fingerprintCanonical({ changeContextId, ...bound, changeCategory, originRef, reason, dependencies, predecessor: predecessor?.changeContextId ?? null });
  const existing = store.changes.find((row) => row.changeContextId === changeContextId);
  if (existing) return existing.fingerprint === fingerprint ? finish(store, before, existing, input.assertedFingerprint) : fail("RECORD_ALREADY_RECORDED");
  if (store.changes.some((row) => row.recordStatus === "CURRENT" && row.changeContextId !== predecessor?.changeContextId && row.objectId === bound.objectId && row.changeCategory === changeCategory && row.reason === reason)) {
    fail("DUPLICATE_RECORD_REJECTED");
  }
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    predecessor.currentness = "SUPERSEDED";
    remember(store, "CHANGE", predecessor.changeContextId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D4R7ChangeRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.changeContextId ?? null, predecessor?.fingerprint ?? null),
    changeContextId,
    changeCategory: changeCategory as D4R7ChangeRecord["changeCategory"],
    originRef,
    reason,
    dependencies,
    vendorAdopted: false,
    recalculated: false,
    redesigned: false,
  };
  store.changes.push(record);
  remember(store, "CHANGE", record.changeContextId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordMechanicalReassessment(
  store: D4R7Store,
  actor: Actor,
  input: D4R7SubjectInput & {
    reassessmentContextId: string;
    changeContextId: string;
    targetId: string;
    targetFingerprint: string;
    state: string;
  },
): D4R7ReassessmentRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const changeContextId = explicit(input.changeContextId, "CHANGE_REQUIRED");
  const change = store.changes.find((row) => row.changeContextId === changeContextId && row.recordStatus === "CURRENT");
  if (!change || change.objectId !== bound.objectId) fail("CHANGE_NOT_FOUND");
  const targetId = explicit(input.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(input.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  if (!change.dependencies.some((link) => link.targetId === targetId && link.targetFingerprint === targetFingerprint)) fail("DEPENDENCY_REVISION_MISMATCH");
  if (!(D4_R7_REASSESSMENT_STATES as readonly string[]).includes(input.state)) fail("REASSESSMENT_STATE_INVALID");
  const state = input.state as D4R7ReassessmentRecord["state"];
  const reassessmentContextId = explicit(input.reassessmentContextId, "REASSESSMENT_REQUIRED");
  const fingerprint = fingerprintCanonical({ reassessmentContextId, changeContextId, targetId, targetFingerprint, state, ...bound });
  const existing = store.reassessments.find((row) => row.reassessmentContextId === reassessmentContextId);
  if (existing) return existing.fingerprint === fingerprint ? finish(store, before, existing, input.assertedFingerprint) : fail("RECORD_ALREADY_RECORDED");
  if (store.reassessments.some((row) => row.recordStatus === "CURRENT" && row.changeContextId === changeContextId && row.targetId === targetId && row.state === state)) {
    fail("DUPLICATE_RECORD_REJECTED");
  }
  const record: D4R7ReassessmentRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, null, null),
    reassessmentContextId,
    changeContextId,
    targetId,
    targetFingerprint,
    state,
    recalculated: false,
    redesigned: false,
  };
  store.reassessments.push(record);
  remember(store, "REASSESSMENT", record.reassessmentContextId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recalculateFromChange(): never {
  fail("RECALCULATION_REJECTED");
}
export function redesignFromChange(): never {
  fail("REDESIGN_REJECTED");
}
export function mutateDesignCondition(): never {
  fail("R3_MUTATION_REJECTED");
}
export function mutatePerformanceContext(): never {
  fail("R3_MUTATION_REJECTED");
}
export function adoptVendorRevision(): never {
  fail("VENDOR_AUTO_ADOPTION_REJECTED");
}
export function overrideEngineeringWithVendor(): never {
  fail("VENDOR_OVERRIDE_REJECTED");
}
export function overrideVendorWithEngineering(): never {
  fail("ENGINEERING_OVERRIDE_REJECTED");
}
export function rewriteTechnicalRequirement(): never {
  fail("R5_REWRITE_REJECTED");
}
export function rewriteTechnicalContext(): never {
  fail("R5_REWRITE_REJECTED");
}
export function recalculateClearance(): never {
  fail("RECALCULATION_REJECTED");
}
export function solveAccessPath(): never {
  fail("ACCESS_PATH_SOLVER_REJECTED");
}
export function solveRemovalRoute(): never {
  fail("REMOVAL_ROUTE_SOLVER_REJECTED");
}
export function redesignPackageArrangement(): never {
  fail("REDESIGN_REJECTED");
}
export function analyzeLifting(): never {
  fail("LIFTING_ANALYSIS_REJECTED");
}
export function inferChangeDependency(): never {
  fail("INFERRED_DEPENDENCY_REJECTED");
}
export function repointGovernance(): never {
  fail("AUTO_REPOINT_REJECTED");
}
export function mutateGovernance(): never {
  fail("SILENT_MUTATION_REJECTED");
}
export function closeReassessmentAsEngineeringComplete(): never {
  fail("REASSESSMENT_CLOSURE_REJECTED");
}
export function validateChange(): never {
  fail("VALIDATION_AUTHORITY_REJECTED");
}
export function approveChange(): never {
  fail("APPROVAL_RUNTIME_REJECTED");
}
export function certifyChange(): never {
  fail("CERTIFICATION_RUNTIME_REJECTED");
}
export function openDisciplineInterface(): never {
  fail("DISCIPLINE_INTERFACE_REJECTED");
}
export function sizeMechanicalEquipment(): never {
  fail("EQUIPMENT_SIZING_REJECTED");
}
