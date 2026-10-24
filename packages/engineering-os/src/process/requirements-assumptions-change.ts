/**
 * EOS-D6-R7 Process requirements, assumptions, decisions, and change.
 * One bounded runtime on exact R1-R6 revisions. Canonical governance only.
 * A change may mark an explicit dependent. It does not recalculate or rewrite upstream records.
 */
import {
  AI_RECOMMENDATION_EQUALS_PROCESS_ENGINEERING_DECISION,
  ASSUMPTION_EQUALS_VALIDATED_FACT,
  D6_CURRENTNESS_STATES,
  D6_IMPLEMENTATION_PHASE_TYPES,
  D6_IMPLEMENTATION_PHASES,
  D6_MATURITY_STATES,
  D6_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D6_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D6_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D6_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  PARALLEL_D6_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D6_CHANGE_ENGINE_CREATED,
  PARALLEL_D6_DECISION_ENGINE_CREATED,
  PARALLEL_D6_REQUIREMENT_ENGINE_CREATED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_PROCESS_REQUIREMENT,
} from "@rtb/types";
import {
  assertAssumptionMateriality,
  assertAssumptionValidationStatus,
  assertHumanApprovalActor,
  assertSingleSelectedAlternative,
  assertSupersessionPair,
} from "../decision-intelligence/invariants";
import { INFORMATION_REQUIREMENT_AI_BOUNDARY, INFORMATION_REQUIREMENT_STATUSES, INFORMATION_REQUIREMENT_TYPES } from "../information-requirements/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D6_CONTEXT_AUTHORITY, D6_DISCIPLINE, D6_EXPLICIT_RELATIONSHIP_KINDS, type D6R1Actor } from "./identity-foundation";
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
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
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
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as R6_CHANGE_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT as R6_RUNTIME_COUNT,
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
  UNAUTHORIZED_PROCESS_CALCULATION_PROMOTION,
  UNAUTHORIZED_PROCESS_SAFETY_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
  type D6R6Store,
} from "./process-safety-relief-context";

export const D6_R7_STATUS = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED" as const;
export const D6_R7_MATURITY = D6_R7_STATUS;
export const D6_R7_MATURITY_STATE = D6_R7_STATUS;
export const D6_R7_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D6_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md" as const;
export const D6_RUNTIME_STARTED = true as const;
export const D6_RUNTIME_COUNT = 7 as const;
export const D6_R6_RUNTIME_COUNT = R6_RUNTIME_COUNT;
export const D6_R6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = R6_CHANGE_COUNT;
export const D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED = true as const;
export const D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 1 as const;
export const D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = true as const;
export const D6_R1_R6_EXACT_SUBJECT_REVISIONS_REUSED = true as const;
export const EXACT_D6_R7_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D6_R7_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D6_R7_SUBJECT_AUTO_REPOINTED = false as const;
export const D6_PROCESS_REQUIREMENT_GOVERNANCE_IMPLEMENTED = true as const;
export const REQUIREMENT_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const REQUIREMENT_PRESENT_EQUALS_CONFORMANT = false as const;
export const D6_PROCESS_REQUIREMENT_EXPLICIT_ADOPTION_REQUIRED = true as const;
export const SOURCE_REQUIREMENT_AUTO_ADOPTED = false as const;
export const VENDOR_REQUIREMENT_AUTO_ADOPTED = false as const;
export const AI_GENERATED_REQUIREMENT_AUTO_ADOPTED = false as const;
export const D6_PROCESS_ASSUMPTION_GOVERNANCE_IMPLEMENTED = true as const;
export const PROCESS_ASSUMPTION_EQUALS_VALIDATED_FACT = ASSUMPTION_EQUALS_VALIDATED_FACT;
export const PROCESS_ASSUMPTION_EQUALS_ENGINEERING_VALIDATED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_ASSUMPTION = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_PROCESS_REQUIREMENT = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const D6_PROCESS_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED = true as const;
export const ADMIN_ACTION_EQUALS_PROCESS_ENGINEERING_DECISION = false as const;
export const PROCESS_ENGINEERING_DECISION_EQUALS_APPROVAL = false as const;
export const AI_CAN_CREATE_PROCESS_ENGINEERING_DECISION_WITHOUT_AUTHORITY = false as const;
export const D6_PROCESS_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D6_R7_EXPLICIT_CHANGE_DEPENDENCY_REQUIRED = true as const;
export const D6_R7_INFERRED_CHANGE_DEPENDENCY_ALLOWED = false as const;
export const D6_R7_SUPERSESSION_GOVERNANCE_IMPLEMENTED = true as const;
export const SUPERSEDED_D6_RECORD_DELETED = false as const;
export const SUPERSEDED_D6_RECORD_EQUALS_INVALID = false as const;
export const D6_R7_HISTORY_PRESERVED = true as const;
export const D6_R7_REASSESSMENT_GOVERNANCE_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_ENGINEERING_INVALID = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATION_FAILED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_APPROVED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_CONFORMANT = false as const;
export const ADMIN_CAN_CLOSE_PROCESS_REASSESSMENT_AS_VALIDATED = false as const;
export const D6_R7_EXPLICIT_DEPENDENT_STALENESS_SUPPORTED = true as const;
export const D6_R7_INFERRED_STALENESS_PROPAGATION_ALLOWED = false as const;
export const D6_R7_R3_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D6_CHANGE_AUTO_RECALCULATES_R3_CONDITION = false as const;
export const D6_CHANGE_AUTO_REWRITES_R3_DESIGN_BASIS = false as const;
export const D6_CHANGE_AUTO_ADOPTS_NEW_PROCESS_CONDITION = false as const;
export const D6_R7_R4_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D6_CHANGE_AUTO_RECALCULATES_R4_EVIDENCE = false as const;
export const D6_CHANGE_AUTO_REVALIDATES_R4_EVIDENCE = false as const;
export const D6_CHANGE_AUTO_REWRITES_EXTERNAL_RESULT = false as const;
export const D6_R7_R5_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D6_CHANGE_AUTO_RECALCULATES_EQUIPMENT_DUTY = false as const;
export const D6_CHANGE_AUTO_RESELECTS_EQUIPMENT = false as const;
export const D6_CHANGE_AUTO_REWRITES_UTILITY_REQUIREMENT = false as const;
export const D6_R7_R6_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D6_CHANGE_AUTO_RECALCULATES_RELIEF_LOAD = false as const;
export const D6_CHANGE_AUTO_RESIZES_RELIEF_DEVICE = false as const;
export const D6_CHANGE_AUTO_RECALCULATES_DEPRESSURING = false as const;
export const D6_CHANGE_AUTO_REDETERMINES_SIL = false as const;
export const D6_CHANGE_AUTO_CLOSES_HAZARD_FINDING = false as const;
export const D6_CHANGE_AUTO_APPROVES_SAFEGUARD = false as const;
export const D6_R7_R1_IDENTITY_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D6_R7_R2_CONTEXT_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D6_CHANGE_AUTO_REPOINTS_R1_IDENTITY_HISTORY = false as const;
export const D6_CHANGE_AUTO_REWRITES_R2_SYSTEM_STREAM_CONTEXT = false as const;
export const D6_CHANGE_AUTO_RECALCULATES_ENGINEERING = false as const;
export const D6_CHANGE_AUTO_REDESIGNS_ENGINEERING = false as const;
export const D6_CHANGE_AUTO_REVALIDATES_ENGINEERING = false as const;
export const D6_CHANGE_AUTO_APPROVES_ENGINEERING = false as const;
export const D6_CHANGE_AUTO_DETERMINES_CONFORMANCE = false as const;
export const D6_CHANGE_AUTO_CERTIFIES_ENGINEERING = false as const;
export const CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_ENGINEERING = false as const;
export const CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D4 = false as const;
export const CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D5 = false as const;
export const CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D7 = false as const;
export const CHANGED_PROCESS_REQUIREMENT_AUTO_UPDATES_D8 = false as const;
export const D6_R7_ASSUMPTION_CHANGE_GOVERNED = true as const;
export const CHANGED_ASSUMPTION_AUTO_RECALCULATES_PROCESS_DESIGN = false as const;
export const CHANGED_ASSUMPTION_AUTO_INVALIDATES_ALL_DEPENDENTS = false as const;
export const D6_R7_DECISION_SUPERSESSION_GOVERNED = true as const;
export const SUPERSEDED_PROCESS_DECISION_DELETED = false as const;
export const SUPERSEDED_PROCESS_DECISION_AUTO_REPLACED_IN_HISTORY = false as const;
export const CURRENT_D6_RECORD_EQUALS_VALIDATED = false as const;
export const STALE_D6_RECORD_EQUALS_INVALID = false as const;
export const D6_R7_HISTORICAL_REFERENCE_AUTO_REPOINTED = false as const;
export const D6_R7_CHANGE_HISTORY_AUTO_REPOINTED = false as const;
export const D6_R7_PROVENANCE_REQUIRED = true as const;
export const D6_R7_PROVENANCE_PRESERVED = true as const;
export const D6_R7_SOURCE_BASIS_REQUIRED = true as const;
export const D6_R7_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D6_R7_RECORD_AUTO_ACCEPTED = false as const;
export const TENANT_WORKSPACE_PROJECT_D6_R7_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D6_R7_ACCESS_ALLOWED = false as const;
export const D6_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D6_R7_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D6_R7_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D6_R8_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_RECALCULATION = false as const;
export const UNAUTHORIZED_PROCESS_REDESIGN = false as const;
export const UNAUTHORIZED_PROCESS_REVALIDATION = false as const;
export const UNAUTHORIZED_REQUIREMENT_AUTO_IMPLEMENTATION = false as const;
export const UNAUTHORIZED_INFERRED_DEPENDENCY = false as const;
export const UNAUTHORIZED_INFERRED_STALENESS_PROPAGATION = false as const;
export const UNAUTHORIZED_PROCESS_CONFORMANCE_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_APPROVAL_PROMOTION = false as const;
export const D6_R8_CANONICAL_PHASE = D6_IMPLEMENTATION_PHASES[7];
export const D6_R8_PHASE_TYPE = D6_IMPLEMENTATION_PHASE_TYPES[7];
export const D6_R8_CANONICAL_SCOPE =
  "Implement canonical D6 Process discipline interfaces and handoffs across exact R1-R7 revisions. Support exact governed Process-to-D4 Mechanical, D5 Piping, future D7 Electrical and future D8 I&C handoff records, plus justified D1-D3 references where canonical. Require explicit exact counterpart revisions, preserve source and counterpart authority, integrate R7 change/reassessment currentness, prohibit fabricated counterparts, inferred relationships, automatic mutation or validation of counterpart engineering, and keep D9/cross-discipline reasoning runtime at zero." as const;
export const D6_R8_STARTED = false as const;
export const D6_R7_READY_FOR_NEXT_PHASE = true as const;
export const D6_R7_NEXT_PHASE = D6_R8_CANONICAL_PHASE;
export const D6_R7_NEXT_PHASE_TYPE = D6_R8_PHASE_TYPE;
export const D6_R7_CANONICAL_NEXT_PHASE = D6_R8_CANONICAL_PHASE;
export const D6_R7_CANONICAL_NEXT_PHASE_SCOPE = D6_R8_CANONICAL_SCOPE;
export const D6_R7_BLOCKER = "NONE" as const;
export const D6_R7_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D6_R7_OPEN_REQUIREMENT_STATUSES = ["PLANNED", "REQUESTED", "AWAITING_INFORMATION", "RECEIVED", "NOT_APPLICABLE"] as const;
export const D6_R7_SOURCE_BASIS = [
  "SOURCE_REQUIREMENT",
  "VENDOR_REQUIREMENT",
  "PROJECT_PROCESS_DATA",
  "R3_PROCESS_CONDITION",
  "R4_SUPPLIED_EVIDENCE",
  "R5_PROCESS_DUTY",
  "R6_SAFETY_CONTEXT",
  "AUTHORIZED_PROCESS_CONTEXT",
] as const;
export const D6_R7_CHANGE_CATEGORIES = [
  "REQUIREMENT_CHANGED",
  "ASSUMPTION_CHANGED",
  "DECISION_SUPERSEDED",
  "R1_IDENTITY_CHANGED",
  "R2_CONTEXT_CHANGED",
  "R3_CONDITION_CHANGED",
  "R3_DESIGN_BASIS_CHANGED",
  "R4_EVIDENCE_CHANGED",
  "R5_DUTY_CHANGED",
  "R5_UTILITY_CHANGED",
  "R6_SAFETY_CHANGED",
  "REASSESSMENT_REQUIRED",
] as const;
export const D6_R7_DEPENDENCY_TARGETS = [
  "R1_IDENTITY",
  "R2_STREAM",
  "R2_SYSTEM",
  "R3_CONDITION",
  "R3_DESIGN_BASIS",
  "R4_EVIDENCE",
  "R5_DUTY",
  "R5_UTILITY",
  "R6_SAFETY",
  "R7_REQUIREMENT",
  "R7_ASSUMPTION",
  "R7_DECISION",
] as const;
export const D6_R7_REASSESSMENT_STATES = ["REASSESSMENT_REQUIRED", "REASSESSMENT_COMPLETED"] as const;
export const D6_R7_CURRENTNESS_MARKS = ["STALE", "REASSESSMENT_REQUIRED"] as const;

export {
  D6_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  D6_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D6_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D6_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  PARALLEL_D6_REQUIREMENT_ENGINE_CREATED,
  PARALLEL_D6_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D6_DECISION_ENGINE_CREATED,
  PARALLEL_D6_CHANGE_ENGINE_CREATED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_PROCESS_REQUIREMENT,
  ASSUMPTION_EQUALS_VALIDATED_FACT,
  AI_RECOMMENDATION_EQUALS_PROCESS_ENGINEERING_DECISION,
  D6_PROCESS_IDENTITY_RUNTIME_READY,
  D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_READY,
  D6_PROCESS_EVIDENCE_RUNTIME_READY,
  D6_EQUIPMENT_DUTY_RUNTIME_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_READY,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
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
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_APPROVAL_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
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
  UNAUTHORIZED_PROCESS_CALCULATION_PROMOTION,
  UNAUTHORIZED_PROCESS_SAFETY_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set(["inferred", "matching_name", "similar_value", "document_proximity", "ai_inference", "auto_max", "semantic similarity", "shared tag", "shared system", "document proximity", "matching values", "ai interpretation"]);
const BROAD = new Set(["all", "global", "every", "any"]);
const OPEN_REQUIREMENT_STATUSES = new Set<string>(D6_R7_OPEN_REQUIREMENT_STATUSES);

type Currentness = (typeof D6_CURRENTNESS_STATES)[number];
type Stage = (typeof D6_MATURITY_STATES)[number];
type HistoryKind = "REQUIREMENT" | "ASSUMPTION" | "DECISION" | "CHANGE" | "REASSESSMENT" | "CURRENTNESS";

type Prohibited = {
  inventRequirement?: boolean;
  inventAssumption?: boolean;
  aiRecommendation?: boolean;
  adminAction?: boolean;
  closeAsValidated?: boolean;
  sourceAutoAdopt?: boolean;
  vendorAutoAdopt?: boolean;
  aiGeneratedAutoAdopt?: boolean;
  inferDependencies?: boolean;
  inferredStaleness?: boolean;
  recalculate?: boolean;
  recalculateCondition?: boolean;
  rewriteBasis?: boolean;
  adoptCondition?: boolean;
  recalculateEvidence?: boolean;
  revalidateEvidence?: boolean;
  rewriteResult?: boolean;
  recalculateDuty?: boolean;
  reselectEquipment?: boolean;
  rewriteUtility?: boolean;
  recalculateRelief?: boolean;
  resizeReliefDevice?: boolean;
  recalculateDepressuring?: boolean;
  redetermineSil?: boolean;
  closeFinding?: boolean;
  approveSafeguard?: boolean;
  repointIdentity?: boolean;
  rewriteContext?: boolean;
  redesign?: boolean;
  revalidate?: boolean;
  approve?: boolean;
  conformant?: boolean;
  certify?: boolean;
  updateEngineering?: boolean;
  updateD4?: boolean;
  updateD5?: boolean;
  updateD7?: boolean;
  updateD8?: boolean;
  invalidateAll?: boolean;
  repoint?: boolean;
  propagate?: boolean;
  disciplineInterface?: boolean;
  d9Reasoning?: boolean;
};

export type D6R7SubjectInput = Prohibited & {
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2Kind: string;
  r2RecordId: string;
  r2Fingerprint: string;
  citedCurrentness: string;
  citedLifecycleStage: string;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  assertedFingerprint?: string | null;
};

type BoundSubject = {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  r2Kind: "STREAM" | "SYSTEM";
  r2RecordId: string;
  r2Fingerprint: string;
};

type GovernanceBase = BoundSubject & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D6_DISCIPLINE;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  authority: typeof D6_CONTEXT_AUTHORITY;
  processEngineeringAuthority: false;
  engineeringValidated: false;
  approved: false;
  conformant: false;
  certified: false;
  invalidated: false;
  deleted: false;
  recalculated: false;
  redesigned: false;
  fingerprint: string;
  predecessorId: string | null;
  predecessorFingerprint: string | null;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: Currentness;
  citedLifecycleStage: Stage;
  recordedAt: string;
  recordedBy: string;
};

export type D6R7Dependency = {
  kind: (typeof D6_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetKind: (typeof D6_R7_DEPENDENCY_TARGETS)[number];
  targetId: string;
  targetFingerprint: string;
};

export type D6R7RequirementRecord = GovernanceBase & {
  requirementId: string;
  statement: string;
  requirementCategory: (typeof INFORMATION_REQUIREMENT_TYPES)[number];
  sourceClass: (typeof D6_R7_SOURCE_BASIS)[number];
  sourceRef: string;
  sourceRevision: string;
  requirementStatus: (typeof D6_R7_OPEN_REQUIREMENT_STATUSES)[number];
  adopted: boolean;
  adoptionRationale: string | null;
  sourceRequirementId: string | null;
  sourceRequirementFingerprint: string | null;
};

export type D6R7AssumptionRecord = GovernanceBase & {
  assumptionId: string;
  statement: string;
  validationStatus: "unvalidated";
  materiality: string;
  validatedFact: false;
};

export type D6R7DecisionRecord = GovernanceBase & {
  decisionId: string;
  statement: string;
  alternatives: { id: string; statement: string; is_selected: boolean }[];
  authoritativeDecision: true;
  aiRecommendation: false;
  adminAction: false;
};

export type D6R7ChangeRecord = GovernanceBase & {
  changeId: string;
  changeCategory: (typeof D6_R7_CHANGE_CATEGORIES)[number];
  reason: string;
  dependencies: D6R7Dependency[];
};

export type D6R7ReassessmentRecord = GovernanceBase & {
  reassessmentId: string;
  changeId: string;
  targetId: string;
  targetFingerprint: string;
  state: (typeof D6_R7_REASSESSMENT_STATES)[number];
  validationFailed: false;
};

export type D6R7CurrentnessMark = GovernanceBase & {
  markId: string;
  changeId: string;
  targetKind: (typeof D6_R7_DEPENDENCY_TARGETS)[number];
  targetId: string;
  targetFingerprint: string;
  mark: (typeof D6_R7_CURRENTNESS_MARKS)[number];
};

export type D6R7History = {
  historyId: string;
  subjectKind: HistoryKind;
  subjectId: string;
  fingerprint: string;
  action: "CREATED" | "SUPERSEDED";
  recordedAt: string;
};

export type D6R7Store = {
  r6: D6R6Store;
  now: () => string;
  requirements: D6R7RequirementRecord[];
  assumptions: D6R7AssumptionRecord[];
  decisions: D6R7DecisionRecord[];
  changes: D6R7ChangeRecord[];
  reassessments: D6R7ReassessmentRecord[];
  currentnessMarks: D6R7CurrentnessMark[];
  history: D6R7History[];
};

type DependencyInput = {
  kind: string;
  targetKind: string;
  targetId: string;
  targetFingerprint: string;
  inferred?: boolean;
  inference?: string | null;
};

function fail(code: string): never {
  throw new Error(`D6_R7_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function assertActor(actor: D6R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "PROCESS_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_PROCESS_ENGINEERING_AUTHORITY");
  if (actor.authority !== D6_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertProhibited(input: Prohibited): void {
  if (input.inventRequirement === true || input.inventAssumption === true) fail("GOVERNANCE_NOT_INVENTED");
  if (input.aiRecommendation === true || input.adminAction === true) fail("DECISION_AUTHORITY_REJECTED");
  if (input.closeAsValidated === true) fail("REASSESSMENT_NOT_VALIDATION");
  if (input.sourceAutoAdopt === true || input.vendorAutoAdopt === true || input.aiGeneratedAutoAdopt === true) fail("REQUIREMENT_NOT_AUTO_ADOPTED");
  if (input.inferDependencies === true) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.inferredStaleness === true || input.propagate === true || input.invalidateAll === true) fail("INFERRED_STALENESS_REJECTED");
  if (input.recalculate === true || input.recalculateCondition === true || input.recalculateEvidence === true || input.recalculateDuty === true || input.recalculateRelief === true || input.recalculateDepressuring === true) fail("RECALCULATION_REJECTED");
  if (input.rewriteBasis === true || input.adoptCondition === true || input.rewriteResult === true || input.rewriteUtility === true || input.rewriteContext === true) fail("UPSTREAM_REWRITE_REJECTED");
  if (input.revalidateEvidence === true || input.revalidate === true) fail("REVALIDATION_REJECTED");
  if (input.reselectEquipment === true || input.resizeReliefDevice === true || input.redetermineSil === true) fail("REDESIGN_REJECTED");
  if (input.redesign === true || input.updateEngineering === true) fail("REDESIGN_REJECTED");
  if (input.closeFinding === true || input.approveSafeguard === true || input.approve === true) fail("APPROVAL_REJECTED");
  if (input.conformant === true) fail("CONFORMANCE_REJECTED");
  if (input.certify === true) fail("CERTIFICATION_REJECTED");
  if (input.repointIdentity === true || input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.updateD4 === true || input.updateD5 === true || input.updateD7 === true || input.updateD8 === true) fail("COUNTERPART_NOT_UPDATED");
  if (input.disciplineInterface === true) fail("INTERFACE_NOT_IN_R7");
  if (input.d9Reasoning === true) fail("D9_NOT_IN_R7");
}

function assertScope(actor: D6R1Actor, input: D6R7SubjectInput): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function requireSubject(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput): BoundSubject {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!(D6_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const stage = input.citedLifecycleStage.trim();
  if (!(D6_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r6.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("R1_CONTEXT_NOT_FOUND");
  if (cited === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r6.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === objectId);
  if (!object || (object.objectType !== "PROCESS_STREAM" && object.objectType !== "PROCESS_SYSTEM")) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision || object.contextId !== context.contextId) fail("R1_REVISION_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  const r2Kind = explicit(input.r2Kind, "R2_CONTEXT_REQUIRED");
  const r2RecordId = explicit(input.r2RecordId, "R2_CONTEXT_REQUIRED");
  const r2Fingerprint = explicit(input.r2Fingerprint, "R2_REVISION_REQUIRED");
  if (r2Kind === "STREAM") {
    const row = store.r6.r5.r4.r3.r2.streams.find((item) => item.streamRecordId === r2RecordId);
    if (!row || row.fingerprint !== r2Fingerprint || row.objectId !== object.objectId || row.recordStatus !== "CURRENT" || row.tenantId !== actor.tenantId) fail("R2_REVISION_MISMATCH");
  } else if (r2Kind === "SYSTEM") {
    const row = store.r6.r5.r4.r3.r2.systems.find((item) => item.systemRecordId === r2RecordId);
    if (!row || row.fingerprint !== r2Fingerprint || row.objectId !== object.objectId || row.recordStatus !== "CURRENT" || row.tenantId !== actor.tenantId) fail("R2_REVISION_MISMATCH");
  } else fail("R2_CONTEXT_INVALID");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  explicit(input.limitations, "LIMITATIONS_REQUIRED");
  explicit(input.provenanceRef, "MISSING_PROVENANCE");
  explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  return { contextId, objectId, objectRevisionFingerprint: revision, r2Kind: r2Kind as "STREAM" | "SYSTEM", r2RecordId, r2Fingerprint };
}

function upstreamSeal(store: D6R7Store): string {
  const r1 = store.r6.r5.r4.r3.r2.r1;
  const r2 = store.r6.r5.r4.r3.r2;
  const r3 = store.r6.r5.r4.r3;
  const r4 = store.r6.r5.r4;
  const r5 = store.r6.r5;
  return JSON.stringify({
    objects: r1.objects.map((row) => [row.objectId, row.fingerprint, row.recordStatus, row.predecessorObjectId]),
    streams: r2.streams.map((row) => [row.streamRecordId, row.fingerprint, row.recordStatus]),
    systems: r2.systems.map((row) => [row.systemRecordId, row.fingerprint, row.recordStatus]),
    cases: [...r3.operatingCases, ...r3.designCases].map((row) => [row.caseRecordId, row.fingerprint, row.recordStatus]),
    conditions: r3.conditions.map((row) => [row.conditionId, row.fingerprint, row.recordStatus, row.measure.value, row.measure.unit]),
    bases: r3.bases.map((row) => [row.basisRecordId, row.fingerprint, row.recordStatus, row.basisStatement]),
    evidence: r4.evidence.map((row) => [row.evidenceId, row.fingerprint, row.recordStatus]),
    duties: r5.duties.map((row) => [row.requirementId, row.fingerprint, row.recordStatus, row.measure.value, row.measure.unit]),
    utilities: r5.utilities.map((row) => [row.utilityRecordId, row.fingerprint, row.recordStatus, row.measure.value, row.measure.unit]),
    safety: store.r6.records.map((row) => [row.recordId, row.fingerprint, row.recordStatus, row.hazardClosed, row.safeguardApproved]),
  });
}

function finish<T extends { fingerprint: string }>(store: D6R7Store, before: string, record: T, asserted: string | null | undefined): T {
  if (asserted != null && asserted !== record.fingerprint) fail("FINGERPRINT_MISMATCH");
  if (upstreamSeal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

function baseFields(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput, bound: BoundSubject, fingerprint: string, predecessorId: string | null, predecessorFingerprint: string | null): GovernanceBase {
  return {
    ...bound,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D6_DISCIPLINE,
    applicability: explicit(input.applicability, "APPLICABILITY_REQUIRED"),
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    provenanceRef: explicit(input.provenanceRef, "MISSING_PROVENANCE"),
    sourceBasisRef: explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS"),
    authority: D6_CONTEXT_AUTHORITY,
    processEngineeringAuthority: false,
    engineeringValidated: false,
    approved: false,
    conformant: false,
    certified: false,
    invalidated: false,
    deleted: false,
    recalculated: false,
    redesigned: false,
    fingerprint,
    predecessorId,
    predecessorFingerprint,
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    citedLifecycleStage: input.citedLifecycleStage.trim() as Stage,
    recordedAt: store.now(),
    recordedBy: actor.actorId,
  };
}

function remember(store: D6R7Store, subjectKind: HistoryKind, subjectId: string, fingerprint: string, action: D6R7History["action"]) {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, fingerprint, action, recordedAt: store.now() });
}

function dependencyExists(store: D6R7Store, targetKind: string, targetId: string, targetFingerprint: string, tenantId: string): boolean {
  const r1 = store.r6.r5.r4.r3.r2.r1;
  const r2 = store.r6.r5.r4.r3.r2;
  const r3 = store.r6.r5.r4.r3;
  const r4 = store.r6.r5.r4;
  const r5 = store.r6.r5;
  if (targetKind === "R1_IDENTITY") return r1.objects.some((row) => row.objectId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R2_STREAM") return r2.streams.some((row) => row.streamRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R2_SYSTEM") return r2.systems.some((row) => row.systemRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R3_CONDITION") return r3.conditions.some((row) => row.conditionId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R3_DESIGN_BASIS") return r3.bases.some((row) => row.basisRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R4_EVIDENCE") return r4.evidence.some((row) => row.evidenceId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R5_DUTY") return r5.duties.some((row) => row.requirementId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R5_UTILITY") return r5.utilities.some((row) => row.utilityRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R6_SAFETY") return store.r6.records.some((row) => row.recordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R7_REQUIREMENT") return store.requirements.some((row) => row.requirementId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R7_ASSUMPTION") return store.assumptions.some((row) => row.assumptionId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  return store.decisions.some((row) => row.decisionId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
}

function resolveDependency(store: D6R7Store, actor: D6R1Actor, link: DependencyInput): D6R7Dependency {
  if (link.inferred === true || (link.inference != null && link.inference.trim() !== "")) fail("INFERRED_DEPENDENCY_REJECTED");
  const kind = explicit(link.kind, "RELATIONSHIP_NOT_EXPLICIT");
  if (!(D6_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) fail("RELATIONSHIP_NOT_EXPLICIT");
  const targetKind = explicit(link.targetKind, "DEPENDENCY_TARGET_REQUIRED");
  if (!(D6_R7_DEPENDENCY_TARGETS as readonly string[]).includes(targetKind)) fail("DEPENDENCY_TARGET_INVALID");
  const targetId = explicit(link.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(link.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  if (!dependencyExists(store, targetKind, targetId, targetFingerprint, actor.tenantId)) fail("DEPENDENCY_REVISION_MISMATCH");
  return { kind: kind as D6R7Dependency["kind"], targetKind: targetKind as D6R7Dependency["targetKind"], targetId, targetFingerprint };
}

export function createD6R7Store(r6: D6R6Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D6R7Store {
  return { r6, now, requirements: [], assumptions: [], decisions: [], changes: [], reassessments: [], currentnessMarks: [], history: [] };
}

function commitRequirement(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput & {
  requirementId: string;
  statement: string;
  requirementCategory: string;
  sourceClass: string;
  sourceRef: string;
  sourceRevision: string;
  requirementStatus?: string;
  adoptionRationale?: string | null;
  sourceRequirementId?: string | null;
  predecessorRequirementId?: string | null;
}, adopted: boolean): D6R7RequirementRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const requestedStatus = input.requirementStatus ?? "PLANNED";
  if (!(INFORMATION_REQUIREMENT_STATUSES as readonly string[]).includes(requestedStatus)) fail("REQUIREMENT_STATUS_INVALID");
  if (!OPEN_REQUIREMENT_STATUSES.has(requestedStatus)) fail("REQUIREMENT_ACCEPTANCE_NOT_IN_R7");
  const statement = explicit(input.statement, "REQUIREMENT_STATEMENT_REQUIRED");
  const requirementCategory = explicit(input.requirementCategory, "REQUIREMENT_CATEGORY_REQUIRED");
  if (!(INFORMATION_REQUIREMENT_TYPES as readonly string[]).includes(requirementCategory)) fail("REQUIREMENT_CATEGORY_INVALID");
  const sourceClass = explicit(input.sourceClass, "SOURCE_BASIS_REQUIRED");
  if (!(D6_R7_SOURCE_BASIS as readonly string[]).includes(sourceClass)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const rationale = input.adoptionRationale && input.adoptionRationale.trim() ? explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED") : null;
  if (adopted && !rationale) fail("ADOPTION_RATIONALE_REQUIRED");
  if (!adopted && rationale) fail("SOURCE_NOT_ADOPTED");
  let sourceRequirementId: string | null = null;
  let sourceRequirementFingerprint: string | null = null;
  if (adopted) {
    sourceRequirementId = explicit(input.sourceRequirementId ?? "", "SOURCE_REQUIREMENT_REQUIRED");
    const source = store.requirements.find((row) => row.requirementId === sourceRequirementId);
    if (!source || source.adopted || source.recordStatus !== "CURRENT" || source.tenantId !== actor.tenantId) fail("SOURCE_REQUIREMENT_NOT_CURRENT");
    if (source.statement !== statement || source.objectId !== bound.objectId || source.sourceRevision !== sourceRevision) fail("ADOPTION_RESTATEMENT_MISMATCH");
    sourceRequirementFingerprint = source.fingerprint;
  }
  const requirementId = explicit(input.requirementId, "REQUIREMENT_REQUIRED");
  const predecessor = input.predecessorRequirementId ? store.requirements.find((row) => row.requirementId === input.predecessorRequirementId) ?? null : null;
  if (input.predecessorRequirementId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT" || predecessor.adopted !== adopted)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    requirementId, ...bound, statement, requirementCategory, sourceClass, sourceRef, sourceRevision, requestedStatus, adopted, rationale,
    sourceRequirementId, sourceRequirementFingerprint, applicability: input.applicability, limitations: input.limitations, predecessor: predecessor?.requirementId ?? null,
  });
  const existing = store.requirements.find((row) => row.requirementId === requirementId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_REQUIREMENT_REJECTED");
  if (store.requirements.some((row) => row.recordStatus === "CURRENT" && row.requirementId !== predecessor?.requirementId && row.objectId === bound.objectId && row.statement === statement && row.sourceRevision === sourceRevision && row.adopted === adopted)) fail("DUPLICATE_REQUIREMENT_REJECTED");
  if (predecessor) {
    const index = store.requirements.findIndex((row) => row.requirementId === predecessor.requirementId);
    store.requirements[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "REQUIREMENT", predecessor.requirementId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D6R7RequirementRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.requirementId ?? null, predecessor?.fingerprint ?? null),
    requirementId, statement, requirementCategory: requirementCategory as D6R7RequirementRecord["requirementCategory"],
    sourceClass: sourceClass as D6R7RequirementRecord["sourceClass"], sourceRef, sourceRevision,
    requirementStatus: requestedStatus as D6R7RequirementRecord["requirementStatus"], adopted, adoptionRationale: rationale,
    sourceRequirementId, sourceRequirementFingerprint,
  };
  store.requirements.push(record);
  remember(store, "REQUIREMENT", requirementId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordProcessSourceRequirement(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput & {
  requirementId: string; statement: string; requirementCategory: string; sourceClass: string; sourceRef: string; sourceRevision: string;
  requirementStatus?: string; adoptionRationale?: string | null; predecessorRequirementId?: string | null;
}): D6R7RequirementRecord {
  return commitRequirement(store, actor, input, false);
}

export function recordAdoptedProcessRequirement(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput & {
  requirementId: string; statement: string; requirementCategory: string; sourceClass: string; sourceRef: string; sourceRevision: string;
  sourceRequirementId: string; requirementStatus?: string; adoptionRationale?: string | null; predecessorRequirementId?: string | null;
}): D6R7RequirementRecord {
  return commitRequirement(store, actor, input, true);
}

export function recordProcessAssumption(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput & {
  assumptionId: string; statement: string; validationStatus?: string; materiality?: string; predecessorAssumptionId?: string | null;
}): D6R7AssumptionRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const validationStatus = input.validationStatus ?? "unvalidated";
  assertAssumptionValidationStatus(validationStatus);
  if (validationStatus !== "unvalidated") fail("ASSUMPTION_NOT_VALIDATED_FACT");
  const materiality = input.materiality ?? "medium";
  assertAssumptionMateriality(materiality);
  const statement = explicit(input.statement, "ASSUMPTION_STATEMENT_REQUIRED");
  const assumptionId = explicit(input.assumptionId, "ASSUMPTION_REQUIRED");
  const predecessor = input.predecessorAssumptionId ? store.assumptions.find((row) => row.assumptionId === input.predecessorAssumptionId) ?? null : null;
  if (input.predecessorAssumptionId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ assumptionId, ...bound, statement, validationStatus, materiality, predecessor: predecessor?.assumptionId ?? null });
  const existing = store.assumptions.find((row) => row.assumptionId === assumptionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_ASSUMPTION_REJECTED");
  if (store.assumptions.some((row) => row.recordStatus === "CURRENT" && row.assumptionId !== predecessor?.assumptionId && row.objectId === bound.objectId && row.statement === statement)) fail("DUPLICATE_ASSUMPTION_REJECTED");
  if (predecessor) {
    const index = store.assumptions.findIndex((row) => row.assumptionId === predecessor.assumptionId);
    store.assumptions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "ASSUMPTION", predecessor.assumptionId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D6R7AssumptionRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.assumptionId ?? null, predecessor?.fingerprint ?? null),
    assumptionId, statement, validationStatus: "unvalidated", materiality, validatedFact: false,
  };
  store.assumptions.push(record);
  remember(store, "ASSUMPTION", assumptionId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordProcessEngineeringDecision(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput & {
  decisionId: string; statement: string; alternatives: { id: string; statement: string; is_selected?: boolean }[]; predecessorDecisionId?: string | null;
}): D6R7DecisionRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const alternatives = (input.alternatives ?? []).map((row) => ({
    id: explicit(row.id, "ALTERNATIVE_REQUIRED"),
    statement: explicit(row.statement, "ALTERNATIVE_REQUIRED"),
    is_selected: row.is_selected === true,
  }));
  if (alternatives.length === 0) fail("ALTERNATIVE_REQUIRED");
  assertSingleSelectedAlternative(alternatives);
  const statement = explicit(input.statement, "DECISION_STATEMENT_REQUIRED");
  const decisionId = explicit(input.decisionId, "DECISION_REQUIRED");
  const predecessor = input.predecessorDecisionId ? store.decisions.find((row) => row.decisionId === input.predecessorDecisionId) ?? null : null;
  if (input.predecessorDecisionId) {
    if (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
    assertSupersessionPair({
      decisionId, supersedesDecisionId: predecessor.decisionId, tenantId: actor.tenantId, workspaceId: actor.workspaceId,
      prior: { id: predecessor.decisionId, tenant_id: predecessor.tenantId, workspace_id: predecessor.workspaceId },
    });
  }
  const fingerprint = fingerprintCanonical({ decisionId, ...bound, statement, alternatives, predecessor: predecessor?.decisionId ?? null });
  const existing = store.decisions.find((row) => row.decisionId === decisionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_DECISION_REJECTED");
  if (store.decisions.some((row) => row.recordStatus === "CURRENT" && row.decisionId !== predecessor?.decisionId && row.objectId === bound.objectId && row.statement === statement)) fail("DUPLICATE_DECISION_REJECTED");
  const priorHistory = predecessor ? store.history.filter((row) => row.subjectId === predecessor.decisionId).map((row) => row.fingerprint) : [];
  if (predecessor) {
    const index = store.decisions.findIndex((row) => row.decisionId === predecessor.decisionId);
    store.decisions[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "DECISION", predecessor.decisionId, predecessor.fingerprint, "SUPERSEDED");
  }
  if (predecessor && !priorHistory.every((fingerprint, index) => store.history.filter((row) => row.subjectId === predecessor.decisionId)[index]?.fingerprint === fingerprint)) fail("HISTORY_REPLACED");
  const record: D6R7DecisionRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.decisionId ?? null, predecessor?.fingerprint ?? null),
    decisionId, statement, alternatives, authoritativeDecision: true, aiRecommendation: false, adminAction: false,
  };
  store.decisions.push(record);
  remember(store, "DECISION", decisionId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordProcessChange(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput & {
  changeId: string; changeCategory: string; reason: string; dependencies: DependencyInput[]; predecessorChangeId?: string | null;
}): D6R7ChangeRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const changeCategory = explicit(input.changeCategory, "CHANGE_CATEGORY_REQUIRED");
  if (!(D6_R7_CHANGE_CATEGORIES as readonly string[]).includes(changeCategory)) fail("CHANGE_CATEGORY_INVALID");
  if (!input.dependencies || input.dependencies.length === 0) fail("EXPLICIT_DEPENDENCY_REQUIRED");
  const dependencies = input.dependencies.map((link) => resolveDependency(store, actor, link));
  const reason = explicit(input.reason, "CHANGE_REASON_REQUIRED");
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const predecessor = input.predecessorChangeId ? store.changes.find((row) => row.changeId === input.predecessorChangeId) ?? null : null;
  if (input.predecessorChangeId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({ changeId, ...bound, changeCategory, reason, dependencies, predecessor: predecessor?.changeId ?? null });
  const existing = store.changes.find((row) => row.changeId === changeId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_CHANGE_REJECTED");
  if (store.changes.some((row) => row.recordStatus === "CURRENT" && row.changeId !== predecessor?.changeId && row.objectId === bound.objectId && row.changeCategory === changeCategory && row.reason === reason)) fail("DUPLICATE_CHANGE_REJECTED");
  if (predecessor) {
    const index = store.changes.findIndex((row) => row.changeId === predecessor.changeId);
    store.changes[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    remember(store, "CHANGE", predecessor.changeId, predecessor.fingerprint, "SUPERSEDED");
  }
  const record: D6R7ChangeRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.changeId ?? null, predecessor?.fingerprint ?? null),
    changeId, changeCategory: changeCategory as D6R7ChangeRecord["changeCategory"], reason, dependencies,
  };
  store.changes.push(record);
  remember(store, "CHANGE", changeId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordProcessReassessment(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput & {
  reassessmentId: string; changeId: string; targetId: string; targetFingerprint: string; state: string;
}): D6R7ReassessmentRecord {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const change = store.changes.find((row) => row.changeId === changeId && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!change || change.objectId !== bound.objectId) fail("CHANGE_NOT_FOUND");
  const targetId = explicit(input.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(input.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  if (!change.dependencies.some((link) => link.targetId === targetId && link.targetFingerprint === targetFingerprint)) fail("DEPENDENCY_REVISION_MISMATCH");
  if (!(D6_R7_REASSESSMENT_STATES as readonly string[]).includes(input.state)) fail("REASSESSMENT_STATE_INVALID");
  const state = input.state as D6R7ReassessmentRecord["state"];
  const reassessmentId = explicit(input.reassessmentId, "REASSESSMENT_REQUIRED");
  const fingerprint = fingerprintCanonical({ reassessmentId, changeId, targetId, targetFingerprint, state, ...bound });
  const existing = store.reassessments.find((row) => row.reassessmentId === reassessmentId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_REASSESSMENT_REJECTED");
  if (store.reassessments.some((row) => row.recordStatus === "CURRENT" && row.changeId === changeId && row.targetId === targetId && row.state === state)) fail("DUPLICATE_REASSESSMENT_REJECTED");
  const record: D6R7ReassessmentRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, null, null),
    reassessmentId, changeId, targetId, targetFingerprint, state, validationFailed: false,
  };
  store.reassessments.push(record);
  remember(store, "REASSESSMENT", reassessmentId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function markProcessDependentCurrentness(store: D6R7Store, actor: D6R1Actor, input: D6R7SubjectInput & {
  markId: string; changeId: string; targetKind: string; targetId: string; targetFingerprint: string; mark: string;
}): D6R7CurrentnessMark {
  const before = upstreamSeal(store);
  const bound = requireSubject(store, actor, input);
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const change = store.changes.find((row) => row.changeId === changeId && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!change || change.objectId !== bound.objectId) fail("CHANGE_NOT_FOUND");
  const targetKind = explicit(input.targetKind, "DEPENDENCY_TARGET_REQUIRED");
  const targetId = explicit(input.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(input.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  const link = change.dependencies.find((row) => row.targetKind === targetKind && row.targetId === targetId && row.targetFingerprint === targetFingerprint);
  if (!link) fail("DEPENDENCY_REVISION_MISMATCH");
  if (!(D6_R7_CURRENTNESS_MARKS as readonly string[]).includes(input.mark)) fail("CURRENTNESS_MARK_INVALID");
  const mark = input.mark as D6R7CurrentnessMark["mark"];
  const markId = explicit(input.markId, "CURRENTNESS_MARK_REQUIRED");
  const fingerprint = fingerprintCanonical({ markId, changeId, targetKind, targetId, targetFingerprint, mark, ...bound });
  const existing = store.currentnessMarks.find((row) => row.markId === markId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_CURRENTNESS_MARK_REJECTED");
  const record: D6R7CurrentnessMark = {
    ...baseFields(store, actor, input, bound, fingerprint, null, null),
    markId, changeId, targetKind: link.targetKind, targetId, targetFingerprint, mark,
  };
  store.currentnessMarks.push(record);
  remember(store, "CURRENTNESS", markId, fingerprint, "CREATED");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recalculateProcessFromChange(): never {
  return fail("RECALCULATION_REJECTED");
}
export function redesignProcessFromChange(): never {
  return fail("REDESIGN_REJECTED");
}
export function revalidateProcessFromChange(): never {
  return fail("REVALIDATION_REJECTED");
}
export function approveProcessFromChange(): never {
  return fail("APPROVAL_REJECTED");
}
export function determineProcessConformance(): never {
  return fail("CONFORMANCE_REJECTED");
}
export function certifyProcessFromChange(): never {
  return fail("CERTIFICATION_REJECTED");
}
export function inferProcessChangeDependency(): never {
  return fail("INFERRED_DEPENDENCY_REJECTED");
}
export function repointProcessGovernance(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function closeProcessReassessmentAsValidated(): never {
  return fail("REASSESSMENT_NOT_VALIDATION");
}
export function updateCounterpartFromRequirement(): never {
  return fail("COUNTERPART_NOT_UPDATED");
}
