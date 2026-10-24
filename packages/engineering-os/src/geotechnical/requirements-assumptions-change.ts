/**
 * EOS-D3-R7 requirements, assumptions, decisions, and change.
 * One bounded runtime. Reuses canonical EOS governance. Explicit relationships only.
 */
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS,
  D2_REOPENED as ARCH_D2_REOPENED,
  D3_0_CANONICAL_CURRENTNESS_REUSED,
  D3_0_CANONICAL_FINGERPRINT_REUSED,
  D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D3_CURRENTNESS_STATES,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY as ARCH_EQUALS_D1,
  D3_EQUALS_D2_CIVIL_AUTHORITY as ARCH_EQUALS_D2,
  D3_EVIDENCE_PROVENANCE_REQUIRED as ARCH_PROVENANCE_REQUIRED,
  D3_IMPLEMENTATION_PHASES,
  D3_JURISDICTION_PROFILE_IDS,
  D3_MATURITY_STATES,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
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
  D3_CONTEXT_AUTHORITY,
  D3_DISCIPLINE,
  D3_EXPLICIT_RELATIONSHIP_KINDS,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  type D3R1Actor,
} from "./identity-foundation";
import { D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY as R2_EVIDENCE_READY } from "./site-investigation-evidence";
import { D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY as R3_READY } from "./stratigraphy-groundwater-material";
import { D3_FIELD_LAB_TEST_RUNTIME_READY as R4_TEST_READY } from "./field-lab-test-context";
import { D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY as R5_PARAMETER_READY } from "./geotechnical-parameter-context";
import { D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY as R6_CONTEXT_READY, type D3R6Store } from "./foundation-excavation-slope-context";

export const D3_R7_STATUS = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED" as const;
export const D3_R7_MATURITY = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED" as const;
export const D3_R7_MATURITY_STATE = D3_R7_MATURITY;
export const D3_R7_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D3_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md" as const;
export const D3_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE = true as const;
export const D3_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE = true as const;
export const D3_REUSES_CANONICAL_DECISION_GOVERNANCE = true as const;
export const D3_REUSES_CANONICAL_CHANGE_GOVERNANCE = true as const;
export const PARALLEL_D3_REQUIREMENT_SYSTEM_CREATED = false as const;
export const PARALLEL_D3_ASSUMPTION_SYSTEM_CREATED = false as const;
export const PARALLEL_D3_DECISION_SYSTEM_CREATED = false as const;
export const PARALLEL_D3_CHANGE_SYSTEM_CREATED = false as const;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 7 as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED = true as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 1 as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = R2_EVIDENCE_READY;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = R3_READY;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = R4_TEST_READY;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = R5_PARAMETER_READY;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = R6_CONTEXT_READY;
export const EXACT_D3_R1_R6_SUBJECT_REFERENCE_REQUIRED = true as const;
export const FLOATING_D3_GOVERNANCE_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D3_GOVERNANCE_REFERENCE_AUTO_REPOINTED = false as const;
export const D3_REQUIREMENT_CONTEXT_IMPLEMENTED = true as const;
export const D3_ASSUMPTION_CONTEXT_IMPLEMENTED = true as const;
export const D3_ENGINEERING_DECISION_CONTEXT_IMPLEMENTED = true as const;
export const D3_CHANGE_CONTEXT_IMPLEMENTED = true as const;
export const D3_EXPLICIT_CHANGE_RELATIONSHIPS_SUPPORTED = true as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D3_REQUIREMENT = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const AI_CAN_INVENT_AUTHORITATIVE_D3_ASSUMPTION = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const AI_CAN_CREATE_AUTHORITATIVE_D3_ENGINEERING_DECISION = false as const;
export const ASSUMPTION_EQUALS_VALIDATED_ENGINEERING_FACT = false as const;
export const AI_RECOMMENDATION_EQUALS_ENGINEERING_DECISION = false as const;
export const ADMIN_ACTION_EQUALS_ENGINEERING_DECISION = false as const;
export const D3_SUPERSESSION_REWRITES_HISTORY = false as const;
export const D3_SUPERSEDED_RECORD_AUTOMATICALLY_DELETED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_INVALID = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_RECALCULATED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_REDESIGNED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATED = false as const;
export const D3_EXPLICIT_CHANGE_DEPENDENCY_SUPPORTED = true as const;
export const D3_INFERRED_DEPENDENCY_PROPAGATION_ALLOWED = false as const;
export const D3_CHANGE_AUTO_MUTATES_R3_INTERPRETATION = false as const;
export const D3_CHANGE_AUTO_MUTATES_R4_TEST_RESULT = false as const;
export const D3_CHANGE_AUTO_MUTATES_R5_PARAMETER = false as const;
export const D3_CHANGE_AUTO_MUTATES_R6_RECOMMENDATION = false as const;
export const D3_CHANGE_AUTO_RECALCULATES_PARAMETER = false as const;
export const D3_CHANGE_AUTO_REDESIGNS_FOUNDATION = false as const;
export const D3_CHANGE_AUTO_REDESIGNS_EXCAVATION = false as const;
export const D3_CHANGE_AUTO_REDESIGNS_SLOPE = false as const;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const AI_CAN_CLOSE_D3_REASSESSMENT_AS_ENGINEERING_COMPLETE = false as const;
export const CANONICAL_CURRENTNESS_REUSED = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const D3_R7_PROVENANCE_REQUIRED = ARCH_PROVENANCE_REQUIRED;
export const D3_R7_PROVENANCE_PRESERVED = true as const;
export const D3_R7_AUTO_REPOINTED = false as const;
export const SILENT_D3_R7_MUTATION_ALLOWED = false as const;
export const D3_R7_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_R7_SCOPE_ENFORCED = true as const;
export const D3_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D3_R7_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D3_R7_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const D3_CHANGE_AUTO_MUTATES_D1_STRUCTURAL_OBJECT = false as const;
export const D3_CHANGE_AUTO_MUTATES_D2_CIVIL_OBJECT = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED = false as const;
export const CHANGE_ACCEPTED_EQUALS_ENGINEERING_APPROVED = false as const;
export const DECISION_RECORDED_EQUALS_ENGINEERING_CERTIFIED = false as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D3_R8_RUNTIME_STARTED = false as const;

export const D3_R7_CHANGE_CATEGORIES = ["REQUIREMENT_CHANGED", "ASSUMPTION_CHANGED", "DECISION_SUPERSEDED", "SOURCE_EVIDENCE_CHANGED", "PARAMETER_CHANGED", "RECOMMENDATION_CHANGED", "SUBJECT_REVISION_SUPERSEDED", "REASSESSMENT_REQUIRED"] as const;
export const D3_R7_OPEN_REQUIREMENT_STATUSES = ["PLANNED", "REQUESTED", "AWAITING_INFORMATION", "RECEIVED", "NOT_APPLICABLE"] as const;

export const D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_BEARING_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_PILE_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_STABILITY_RUNTIME_COUNT = 0 as const;
export const D3_EARTH_PRESSURE_RUNTIME_COUNT = 0 as const;
export const D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT = 0 as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 0 as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D3_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D3_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
export const D3_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D2_REOPENED = ARCH_D2_REOPENED;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_R8_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D3_RECALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_REDESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R8_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[7];
export const D3_R8_PHASE_TYPE = "DISCIPLINE_INTERFACES_AND_HANDOFFS" as const;
export const D3_R8_CANONICAL_SCOPE = "Implement governed D3 interfaces/handoffs to D1 Structural and D2 Civil using exact D3 revisions while establishing bounded placeholders/contracts for future D4-D8. Preserve discipline authority and explicit currentness/limitations. Do not perform cross-discipline reasoning, conflict resolution, counterpart validation, automatic redesign or start D4-D9 runtime." as const;
export const D3_R8_STARTED = false as const;
export const D3_R7_READY_FOR_NEXT_PHASE = true as const;
export const D3_R7_NEXT_PHASE = D3_R8_CANONICAL_PHASE;
export const D3_R7_NEXT_PHASE_TYPE = D3_R8_PHASE_TYPE;
export const D3_R7_CANONICAL_NEXT_PHASE = D3_R8_CANONICAL_PHASE;
export const D3_R7_CANONICAL_NEXT_PHASE_SCOPE = D3_R8_CANONICAL_SCOPE;
export const D3_R7_BLOCKER = "NONE" as const;
export const D3_R7_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default", "nearby", "similar"]);
const BROAD = new Set(["all", "any", "everywhere", "unrestricted"]);
const OPEN_REQUIREMENT_STATUSES = new Set<string>(D3_R7_OPEN_REQUIREMENT_STATUSES);

type Prohibited = {
  inventRequirement?: boolean;
  inventAssumption?: boolean;
  aiRecommendation?: boolean;
  aiDecision?: boolean;
  closeReassessment?: boolean;
  inferDependencies?: boolean;
  invalidate?: boolean;
  recalculate?: boolean;
  redesignFoundation?: boolean;
  redesignExcavation?: boolean;
  redesignSlope?: boolean;
  mutateInterpretation?: boolean;
  mutateTestResult?: boolean;
  mutateParameter?: boolean;
  mutateRecommendation?: boolean;
  mutateStructural?: boolean;
  mutateCivil?: boolean;
  validate?: boolean;
  approve?: boolean;
  certify?: boolean;
  repoint?: boolean;
  disciplineInterface?: boolean;
  d9Reasoning?: boolean;
};

type Scoped = Prohibited & {
  contextId: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: string;
  citedLifecycleStage: string;
  evidenceReferenceIds: readonly string[];
  assertedFingerprint?: string;
};

export type D3R7RequirementInput = Scoped & {
  requirementContextId: string;
  objectId: string;
  requirementText: string;
  sourceRef: string;
  sourceRevision: string;
  affectedObjectIds: readonly string[];
  jurisdictionProfileId: string;
  requirementStatus?: string;
  predecessorRequirementContextId?: string | null;
};

export type D3R7AssumptionInput = Scoped & {
  assumptionContextId: string;
  objectId: string;
  statement: string;
  rationale: string;
  affectedObjectIds: readonly string[];
  validationStatus?: string;
  materiality?: string;
  candidateSuggestion?: boolean;
  predecessorAssumptionContextId?: string | null;
};

export type D3R7DecisionInput = Scoped & {
  decisionContextId: string;
  objectId: string;
  statement: string;
  rationale: string;
  affectedObjectIds: readonly string[];
  requirementContextIds?: readonly string[];
  assumptionContextIds?: readonly string[];
  alternatives?: readonly { id: string; statement: string; is_selected?: boolean }[];
  predecessorDecisionContextId?: string | null;
};

export type D3R7ChangeInput = Prohibited & {
  changeContextId: string;
  contextId: string;
  objectId: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  changeCategory: string;
  changedObjectId: string;
  affectedRelationships: readonly { kind: string; targetObjectId: string }[];
  rationale: string;
  limitations: string;
  reassessmentRequired: boolean;
  provenanceRef: string;
  citedCurrentness: string;
  evidenceReferenceIds: readonly string[];
  assertedFingerprint?: string;
  predecessorChangeContextId?: string | null;
};

type Base = {
  contextId: string;
  applicability?: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  citedLifecycleStage?: (typeof D3_MATURITY_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  engineeringValidated: false;
  engineeringApproved: false;
  engineeringCertified: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R7RequirementRecord = Base & {
  requirementContextId: string;
  objectId: string;
  requirementText: string;
  sourceRef: string;
  sourceRevision: string;
  applicability: string;
  affectedObjectIds: readonly string[];
  evidenceReferenceIds: readonly string[];
  jurisdictionProfileId: (typeof D3_JURISDICTION_PROFILE_IDS)[number];
  requirementStatus: (typeof D3_R7_OPEN_REQUIREMENT_STATUSES)[number];
  requirementSatisfied: false;
  predecessorRequirementContextId: string | null;
};

export type D3R7AssumptionRecord = Base & {
  assumptionContextId: string;
  objectId: string;
  statement: string;
  rationale: string;
  applicability: string;
  affectedObjectIds: readonly string[];
  evidenceReferenceIds: readonly string[];
  validationStatus: "unvalidated";
  materiality: "low" | "medium" | "high" | "critical";
  validatedEngineeringFact: false;
  adoption: "RECORDED" | "CANDIDATE";
  predecessorAssumptionContextId: string | null;
};

export type D3R7DecisionRecord = Base & {
  decisionContextId: string;
  objectId: string;
  statement: string;
  rationale: string;
  applicability: string;
  affectedObjectIds: readonly string[];
  evidenceReferenceIds: readonly string[];
  requirementContextIds: readonly string[];
  assumptionContextIds: readonly string[];
  alternatives: readonly { id: string; statement: string; is_selected: boolean }[];
  authoritativeDecision: boolean;
  aiRecommendation: false;
  predecessorDecisionContextId: string | null;
};

export type D3R7ChangeRecord = Base & {
  changeContextId: string;
  objectId: string;
  changeCategory: (typeof D3_R7_CHANGE_CATEGORIES)[number];
  changedObjectId: string;
  affectedRelationships: readonly { kind: (typeof D3_EXPLICIT_RELATIONSHIP_KINDS)[number]; targetObjectId: string }[];
  evidenceReferenceIds: readonly string[];
  rationale: string;
  reassessmentRequired: boolean;
  engineeringInvalid: false;
  automaticRecalculation: false;
  automaticRedesign: false;
  predecessorChangeContextId: string | null;
};

export type D3R7Reassessment = {
  objectId: string;
  changeContextId: string;
  status: "REASSESSMENT_REQUIRED";
  engineeringInvalid: false;
  automaticRecalculation: false;
  automaticRedesign: false;
  engineeringValidated: false;
};

export type D3R7History = {
  historyId: string;
  subjectKind: "REQUIREMENT" | "ASSUMPTION" | "DECISION" | "CHANGE";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D3R7Store = {
  r6: D3R6Store;
  now: () => string;
  requirements: D3R7RequirementRecord[];
  assumptions: D3R7AssumptionRecord[];
  decisions: D3R7DecisionRecord[];
  changes: D3R7ChangeRecord[];
  reassessments: D3R7Reassessment[];
  history: D3R7History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isCurrentness(value: string): value is (typeof D3_CURRENTNESS_STATES)[number] {
  return (D3_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function currentnessOf(value: string): (typeof D3_CURRENTNESS_STATES)[number] {
  const token = value.trim();
  if (!isCurrentness(token)) fail("CURRENTNESS_INVALID");
  return token;
}

function maturityOf(value: string): (typeof D3_MATURITY_STATES)[number] {
  const token = value.trim();
  if (!(D3_MATURITY_STATES as readonly string[]).includes(token)) fail("LIFECYCLE_INVALID");
  return token as (typeof D3_MATURITY_STATES)[number];
}

function assertActor(actor: D3R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "GEOTECHNICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_GEOTECHNICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D3_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertScope(actor: D3R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.inventRequirement === true) fail("AI_CANNOT_INVENT_AUTHORITATIVE_REQUIREMENT");
  if (input.inventAssumption === true) fail("AI_CANNOT_INVENT_AUTHORITATIVE_ASSUMPTION");
  if (input.aiRecommendation === true || input.aiDecision === true) fail("AI_RECOMMENDATION_NOT_DECISION");
  if (input.closeReassessment === true) fail("AI_CANNOT_CLOSE_REASSESSMENT");
  if (input.inferDependencies === true) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.invalidate === true) fail("AUTOMATIC_INVALIDATION_REJECTED");
  if (input.recalculate === true) fail("AUTOMATIC_RECALCULATION_REJECTED");
  if (input.redesignFoundation === true) fail("FOUNDATION_REDESIGN_NOT_IN_R7");
  if (input.redesignExcavation === true) fail("EXCAVATION_REDESIGN_NOT_IN_R7");
  if (input.redesignSlope === true) fail("SLOPE_REDESIGN_NOT_IN_R7");
  if (input.mutateInterpretation === true) fail("R3_MUTATION_REJECTED");
  if (input.mutateTestResult === true) fail("R4_MUTATION_REJECTED");
  if (input.mutateParameter === true) fail("R5_MUTATION_REJECTED");
  if (input.mutateRecommendation === true) fail("R6_MUTATION_REJECTED");
  if (input.mutateStructural === true) fail("D1_MUTATION_REJECTED");
  if (input.mutateCivil === true) fail("D2_MUTATION_REJECTED");
  if (input.validate === true) fail("VALIDATION_NOT_IN_R7");
  if (input.approve === true) fail("APPROVAL_NOT_IN_R7");
  if (input.certify === true) fail("CERTIFICATION_NOT_IN_R7");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.disciplineInterface === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R7");
}

function requireContext(store: D3R7Store, actor: D3R1Actor, contextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_TENANT_OPERATION");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D3R7Store, actor: D3R1Actor, contextId: string, objectId: string, objectType: string | null, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], code: string) {
  const id = explicit(objectId, code);
  const object = store.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (objectType && object.objectType !== objectType) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId || object.tenantId !== actor.tenantId) fail("R1_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object.objectId;
}

function requireObjects(store: D3R7Store, actor: D3R1Actor, contextId: string, ids: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]): string[] {
  if (!ids || ids.length === 0) fail("SUBJECT_REFERENCE_REQUIRED");
  const resolved: string[] = [];
  for (const raw of ids) {
    const id = requireObject(store, actor, contextId, raw, null, citedCurrentness, "SUBJECT_REFERENCE_REQUIRED");
    if (resolved.includes(id)) fail("DUPLICATE_SUBJECT_LINK");
    resolved.push(id);
  }
  return resolved;
}

function requireEvidence(store: D3R7Store, actor: D3R1Actor, contextId: string, ids: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]): string[] {
  if (!ids || ids.length === 0) fail("GOVERNANCE_WITHOUT_EVIDENCE");
  const resolved: string[] = [];
  for (const raw of ids) {
    const id = explicit(raw, "R2_EVIDENCE_REQUIRED");
    if (resolved.includes(id)) fail("DUPLICATE_EVIDENCE_LINK");
    const row = store.r6.r5.r4.r3.r2.evidence.find((item) => item.evidenceReferenceId === id);
    if (!row) fail("R2_EVIDENCE_NOT_FOUND");
    if (row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R2_EVIDENCE_CONTEXT_MISMATCH");
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_EVIDENCE_NOT_CURRENT");
    resolved.push(row.evidenceReferenceId);
  }
  return resolved;
}

function remember(store: D3R7Store, subjectKind: D3R7History["subjectKind"], subjectId: string, action: D3R7History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function baseOf(actor: D3R1Actor, limitations: string, provenanceRef: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], citedLifecycleStage: (typeof D3_MATURITY_STATES)[number] | undefined, fingerprint: string, recordedAt: string): Base {
  return {
    contextId: "",
    limitations,
    provenanceRef,
    citedCurrentness,
    citedLifecycleStage,
    authority: D3_CONTEXT_AUTHORITY,
    engineeringValidated: false,
    engineeringApproved: false,
    engineeringCertified: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt,
    recordStatus: "CURRENT",
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  };
}

export function createD3R7Store(r6: D3R6Store, now: () => string = () => r6.now()): D3R7Store {
  return { r6, now, requirements: [], assumptions: [], decisions: [], changes: [], reassessments: [], history: [] };
}

export function recordGeotechnicalRequirement(store: D3R7Store, actor: D3R1Actor, input: D3R7RequirementInput): D3R7RequirementRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const objectId = requireObject(store, actor, context.contextId, input.objectId, "GEOTECHNICAL_REQUIREMENT", citedCurrentness, "REQUIREMENT_OBJECT_REQUIRED");
  const affectedObjectIds = requireObjects(store, actor, context.contextId, input.affectedObjectIds, citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness);
  const jurisdictionProfileId = explicit(input.jurisdictionProfileId, "JURISDICTION_PROFILE_REQUIRED");
  if (!(D3_JURISDICTION_PROFILE_IDS as readonly string[]).includes(jurisdictionProfileId)) fail("JURISDICTION_PROFILE_INVALID");
  const requestedStatus = input.requirementStatus ?? "PLANNED";
  if (!(INFORMATION_REQUIREMENT_STATUSES as readonly string[]).includes(requestedStatus)) fail("REQUIREMENT_STATUS_INVALID");
  if (!OPEN_REQUIREMENT_STATUSES.has(requestedStatus)) fail("REQUIREMENT_ACCEPTANCE_NOT_IN_R7");
  const requirementText = explicit(input.requirementText, "REQUIREMENT_TEXT_REQUIRED");
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const requirementContextId = explicit(input.requirementContextId, "REQUIREMENT_CONTEXT_REQUIRED");
  const predecessor = input.predecessorRequirementContextId ? store.requirements.find((row) => row.requirementContextId === input.predecessorRequirementContextId) : null;
  if (input.predecessorRequirementContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail(predecessor ? "PREDECESSOR_NOT_CURRENT" : "REQUIREMENT_NOT_FOUND");
  const fingerprint = fingerprintCanonical({
    requirementContextId, contextId: context.contextId, objectId, requirementText, sourceRef, sourceRevision, applicability, limitations, affectedObjectIds, evidenceReferenceIds, jurisdictionProfileId, requirementStatus: requestedStatus, citedLifecycleStage, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, predecessorRequirementContextId: predecessor?.requirementContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.requirements.find((row) => row.requirementContextId === requirementContextId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("REQUIREMENT_ALREADY_RECORDED");
  if (store.requirements.some((row) => row.recordStatus === "CURRENT" && row.requirementContextId !== predecessor?.requirementContextId && row.objectId === objectId && row.requirementText === requirementText && row.sourceRevision === sourceRevision)) fail("DUPLICATE_REQUIREMENT_REJECTED");
  const record: D3R7RequirementRecord = Object.freeze({
    ...baseOf(actor, limitations, provenanceRef, citedCurrentness, citedLifecycleStage, fingerprint, store.now()),
    contextId: context.contextId, applicability, requirementContextId, objectId, requirementText, sourceRef, sourceRevision, affectedObjectIds, evidenceReferenceIds, jurisdictionProfileId: jurisdictionProfileId as D3R7RequirementRecord["jurisdictionProfileId"], requirementStatus: requestedStatus as D3R7RequirementRecord["requirementStatus"], requirementSatisfied: false, predecessorRequirementContextId: predecessor?.requirementContextId ?? null,
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

export function recordGeotechnicalAssumption(store: D3R7Store, actor: D3R1Actor, input: D3R7AssumptionInput): D3R7AssumptionRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const objectId = requireObject(store, actor, context.contextId, input.objectId, "GEOTECHNICAL_ASSUMPTION", citedCurrentness, "ASSUMPTION_OBJECT_REQUIRED");
  const affectedObjectIds = requireObjects(store, actor, context.contextId, input.affectedObjectIds, citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness);
  const validationStatus = input.validationStatus ?? "unvalidated";
  assertAssumptionValidationStatus(validationStatus);
  if (validationStatus !== "unvalidated") fail("ASSUMPTION_NOT_VALIDATED_FACT");
  const materiality = input.materiality ?? "medium";
  assertAssumptionMateriality(materiality);
  const statement = explicit(input.statement, "ASSUMPTION_STATEMENT_REQUIRED");
  const rationale = explicit(input.rationale, "RATIONALE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const assumptionContextId = explicit(input.assumptionContextId, "ASSUMPTION_CONTEXT_REQUIRED");
  const adoption = input.candidateSuggestion === true ? "CANDIDATE" : "RECORDED";
  const predecessor = input.predecessorAssumptionContextId ? store.assumptions.find((row) => row.assumptionContextId === input.predecessorAssumptionContextId) : null;
  if (input.predecessorAssumptionContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail(predecessor ? "PREDECESSOR_NOT_CURRENT" : "ASSUMPTION_NOT_FOUND");
  const fingerprint = fingerprintCanonical({
    assumptionContextId, contextId: context.contextId, objectId, statement, rationale, applicability, limitations, affectedObjectIds, evidenceReferenceIds, validationStatus, materiality, adoption, citedLifecycleStage, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, predecessorAssumptionContextId: predecessor?.assumptionContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.assumptions.find((row) => row.assumptionContextId === assumptionContextId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("ASSUMPTION_ALREADY_RECORDED");
  if (store.assumptions.some((row) => row.recordStatus === "CURRENT" && row.assumptionContextId !== predecessor?.assumptionContextId && row.objectId === objectId && row.statement === statement)) fail("DUPLICATE_ASSUMPTION_REJECTED");
  const record: D3R7AssumptionRecord = Object.freeze({
    ...baseOf(actor, limitations, provenanceRef, citedCurrentness, citedLifecycleStage, fingerprint, store.now()),
    contextId: context.contextId, applicability, assumptionContextId, objectId, statement, rationale, affectedObjectIds, evidenceReferenceIds, validationStatus, materiality, validatedEngineeringFact: false, adoption, predecessorAssumptionContextId: predecessor?.assumptionContextId ?? null,
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

export function recordGeotechnicalDecision(store: D3R7Store, actor: D3R1Actor, input: D3R7DecisionInput): D3R7DecisionRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const objectId = requireObject(store, actor, context.contextId, input.objectId, "GEOTECHNICAL_DECISION", citedCurrentness, "DECISION_OBJECT_REQUIRED");
  const affectedObjectIds = requireObjects(store, actor, context.contextId, input.affectedObjectIds, citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness);
  const requirementContextIds = input.requirementContextIds ?? [];
  for (const raw of requirementContextIds) {
    const id = explicit(raw, "REQUIREMENT_REFERENCE_REQUIRED");
    const row = store.requirements.find((item) => item.requirementContextId === id);
    if (!row || row.tenantId !== actor.tenantId) fail("REQUIREMENT_NOT_FOUND");
  }
  const assumptionContextIds = input.assumptionContextIds ?? [];
  for (const raw of assumptionContextIds) {
    const id = explicit(raw, "ASSUMPTION_REFERENCE_REQUIRED");
    const row = store.assumptions.find((item) => item.assumptionContextId === id);
    if (!row || row.tenantId !== actor.tenantId) fail("ASSUMPTION_NOT_FOUND");
  }
  const alternatives = (input.alternatives ?? []).map((row) => ({ id: explicit(row.id, "ALTERNATIVE_REQUIRED"), statement: explicit(row.statement, "ALTERNATIVE_REQUIRED"), is_selected: row.is_selected === true }));
  assertSingleSelectedAlternative(alternatives);
  const statement = explicit(input.statement, "DECISION_STATEMENT_REQUIRED");
  const rationale = explicit(input.rationale, "RATIONALE_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const decisionContextId = explicit(input.decisionContextId, "DECISION_CONTEXT_REQUIRED");
  const predecessor = input.predecessorDecisionContextId ? store.decisions.find((row) => row.decisionContextId === input.predecessorDecisionContextId) : null;
  if (input.predecessorDecisionContextId) {
    if (!predecessor || predecessor.tenantId !== actor.tenantId) fail(predecessor ? "R1_CONTEXT_MISMATCH" : "DECISION_NOT_FOUND");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    assertSupersessionPair({ decisionId: decisionContextId, supersedesDecisionId: predecessor.decisionContextId, tenantId: actor.tenantId, workspaceId: actor.workspaceId, prior: { id: predecessor.decisionContextId, tenant_id: predecessor.tenantId, workspace_id: predecessor.workspaceId } });
  }
  const fingerprint = fingerprintCanonical({
    decisionContextId, contextId: context.contextId, objectId, statement, rationale, applicability, limitations, affectedObjectIds, evidenceReferenceIds, requirementContextIds, assumptionContextIds, alternatives, citedLifecycleStage, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, predecessorDecisionContextId: predecessor?.decisionContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.decisions.find((row) => row.decisionContextId === decisionContextId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DECISION_ALREADY_RECORDED");
  if (store.decisions.some((row) => row.recordStatus === "CURRENT" && row.decisionContextId !== predecessor?.decisionContextId && row.objectId === objectId && row.statement === statement)) fail("DUPLICATE_DECISION_REJECTED");
  const record: D3R7DecisionRecord = Object.freeze({
    ...baseOf(actor, limitations, provenanceRef, citedCurrentness, citedLifecycleStage, fingerprint, store.now()),
    contextId: context.contextId, applicability, decisionContextId, objectId, statement, rationale, affectedObjectIds, evidenceReferenceIds, requirementContextIds: requirementContextIds.map((id) => id.trim()), assumptionContextIds: assumptionContextIds.map((id) => id.trim()), alternatives, authoritativeDecision: true, aiRecommendation: false, predecessorDecisionContextId: predecessor?.decisionContextId ?? null,
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

export function recordGeotechnicalChange(store: D3R7Store, actor: D3R1Actor, input: D3R7ChangeInput): D3R7ChangeRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const objectId = requireObject(store, actor, context.contextId, input.objectId, "GEOTECHNICAL_GOVERNANCE_RECORD", citedCurrentness, "CHANGE_OBJECT_REQUIRED");
  const changedObjectId = requireObject(store, actor, context.contextId, input.changedObjectId, null, citedCurrentness, "CHANGED_SUBJECT_REQUIRED");
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness);
  const changeCategory = explicit(input.changeCategory, "CHANGE_CATEGORY_REQUIRED");
  if (!(D3_R7_CHANGE_CATEGORIES as readonly string[]).includes(changeCategory)) fail("CHANGE_CATEGORY_NOT_ALLOWLISTED");
  if (!input.affectedRelationships || input.affectedRelationships.length === 0) fail("EXPLICIT_RELATIONSHIP_REQUIRED");
  const affectedRelationships = input.affectedRelationships.map((link) => {
    const kind = explicit(link.kind, "RELATIONSHIP_NOT_EXPLICIT");
    if (!(D3_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) fail("RELATIONSHIP_NOT_EXPLICIT");
    return { kind: kind as (typeof D3_EXPLICIT_RELATIONSHIP_KINDS)[number], targetObjectId: requireObject(store, actor, context.contextId, link.targetObjectId, null, citedCurrentness, "SUBJECT_REFERENCE_REQUIRED") };
  });
  const rationale = explicit(input.rationale, "RATIONALE_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const changeContextId = explicit(input.changeContextId, "CHANGE_CONTEXT_REQUIRED");
  if (changeCategory === "REASSESSMENT_REQUIRED" && input.reassessmentRequired !== true) fail("REASSESSMENT_FLAG_REQUIRED");
  const predecessor = input.predecessorChangeContextId ? store.changes.find((row) => row.changeContextId === input.predecessorChangeContextId) : null;
  if (input.predecessorChangeContextId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("CHANGE_NOT_FOUND");
  const fingerprint = fingerprintCanonical({
    changeContextId, contextId: context.contextId, objectId, changeCategory, changedObjectId, affectedRelationships, evidenceReferenceIds, rationale, limitations, reassessmentRequired: input.reassessmentRequired === true, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, predecessorChangeContextId: predecessor?.changeContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.changes.find((row) => row.changeContextId === changeContextId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("CHANGE_ALREADY_RECORDED");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  if (store.changes.some((row) => row.recordStatus === "CURRENT" && row.changeContextId !== predecessor?.changeContextId && row.changedObjectId === changedObjectId && row.changeCategory === changeCategory && row.rationale === rationale)) fail("DUPLICATE_CHANGE_REJECTED");
  const record: D3R7ChangeRecord = Object.freeze({
    ...baseOf(actor, limitations, provenanceRef, citedCurrentness, undefined, fingerprint, store.now()),
    contextId: context.contextId, changeContextId, objectId, changeCategory: changeCategory as D3R7ChangeRecord["changeCategory"], changedObjectId, affectedRelationships, evidenceReferenceIds, rationale, reassessmentRequired: input.reassessmentRequired === true, engineeringInvalid: false, automaticRecalculation: false, automaticRedesign: false, predecessorChangeContextId: predecessor?.changeContextId ?? null,
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
      store.reassessments.push({ objectId: link.targetObjectId, changeContextId: record.changeContextId, status: "REASSESSMENT_REQUIRED", engineeringInvalid: false, automaticRecalculation: false, automaticRedesign: false, engineeringValidated: false });
    }
  }
  return record;
}

export function mutateRequirementsAssumptionsChange(): never {
  return fail("R7_MUTATION_REJECTED");
}

export function repointGovernanceRecord(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function inferGeotechnicalDependencies(): never {
  return fail("INFERRED_DEPENDENCY_REJECTED");
}

export function closeGeotechnicalReassessment(): never {
  return fail("AI_CANNOT_CLOSE_REASSESSMENT");
}
