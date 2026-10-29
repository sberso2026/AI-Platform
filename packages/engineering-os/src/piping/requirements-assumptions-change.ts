/**
 * EOS-D5-R7 Piping requirements, assumptions, decisions, and change.
 * One bounded runtime on exact R1-R6 revisions. A change may mark currentness.
 * It does not recalculate, redesign, validate, or rewrite upstream records.
 */
import {
  D5_CURRENTNESS_STATES,
  D5_IMPLEMENTATION_PHASE_TYPES,
  D5_IMPLEMENTATION_PHASES,
  D5_MATURITY_STATES,
  D5_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D5_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D5_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D5_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  PARALLEL_D5_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D5_CHANGE_ENGINE_CREATED,
  PARALLEL_D5_DECISION_ENGINE_CREATED,
  PARALLEL_D5_REQUIREMENT_ENGINE_CREATED,
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_PIPING_REQUIREMENT,
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
import { D5_CONTEXT_AUTHORITY, D5_EXPLICIT_RELATIONSHIP_KINDS, type D5R1Actor } from "./identity-foundation";
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
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
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
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as R6_CHANGE_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_READY,
  D5_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  D5_SPATIAL_CLASH_DETECTION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
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
  type D5R6Store,
} from "./stress-support-test-evidence-context";

export const D5_R7_STATUS = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED" as const;
export const D5_R7_MATURITY = D5_R7_STATUS;
export const D5_R7_MATURITY_STATE = D5_R7_STATUS;
export const D5_R7_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R7_REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 7 as const;
export const D5_R6_RUNTIME_COUNT = R6_RUNTIME_COUNT;
export const D5_R6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = R6_CHANGE_COUNT;
export const D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED = true as const;
export const D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 1 as const;
export const D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = true as const;
export const D5_R1_R6_EXACT_SUBJECT_REVISIONS_REUSED = true as const;
export const EXACT_D5_R7_SUBJECT_REVISION_REQUIRED = true as const;
export const FLOATING_D5_R7_SUBJECT_REFERENCE_ALLOWED = false as const;
export const D5_R7_SUBJECT_AUTO_REPOINTED = false as const;
export const D5_PIPING_REQUIREMENT_GOVERNANCE_IMPLEMENTED = true as const;
export const REQUIREMENT_PRESENT_EQUALS_VALIDATED = false as const;
export const REQUIREMENT_PRESENT_EQUALS_CONFORMANT = false as const;
export const D5_REQUIREMENT_SOURCE_BASIS_REQUIRED = true as const;
export const D5_REQUIREMENT_SOURCE_BASIS_TRACEABLE = true as const;
export const SOURCE_REQUIREMENT_AUTO_ADOPTED_AS_D5_REQUIREMENT = false as const;
export const VENDOR_REQUIREMENT_AUTO_ADOPTED_AS_D5_REQUIREMENT = false as const;
export const D5_PIPING_ASSUMPTION_GOVERNANCE_IMPLEMENTED = true as const;
export const ASSUMPTION_EQUALS_VALIDATED_FACT = false as const;
export const ASSUMPTION_EQUALS_ENGINEERING_VALIDATED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_ASSUMPTION = INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering;
export const D5_PIPING_ENGINEERING_DECISION_GOVERNANCE_IMPLEMENTED = true as const;
export const AI_RECOMMENDATION_EQUALS_PIPING_ENGINEERING_DECISION = false as const;
export const ADMIN_ACTION_EQUALS_PIPING_ENGINEERING_DECISION = false as const;
export const D5_PIPING_CHANGE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_EXPLICIT_CHANGE_DEPENDENCIES_SUPPORTED = true as const;
export const D5_INFERRED_CHANGE_DEPENDENCIES_ALLOWED = false as const;
export const D5_SUPERSESSION_GOVERNANCE_IMPLEMENTED = true as const;
export const SUPERSEDED_D5_RECORD_DELETED = false as const;
export const SUPERSEDED_D5_RECORD_EQUALS_INVALID = false as const;
export const D5_SUPERSESSION_HISTORY_PRESERVED = true as const;
export const D5_REASSESSMENT_GOVERNANCE_IMPLEMENTED = true as const;
export const REASSESSMENT_REQUIRED_EQUALS_INVALID = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_RECALCULATED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_REDESIGNED = false as const;
export const REASSESSMENT_REQUIRED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_VALIDATED = false as const;
export const REASSESSMENT_COMPLETED_EQUALS_APPROVED = false as const;
export const D5_R3_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D5_R7_AUTO_RECALCULATES_R3_DESIGN_CONDITION = false as const;
export const D5_R7_AUTO_CHANGES_R3_SPECIFICATION = false as const;
export const D5_R7_AUTO_CHANGES_R3_PIPING_CLASS = false as const;
export const D5_R4_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D5_R7_AUTO_RESELECTS_COMPONENT = false as const;
export const D5_R7_AUTO_RESELECTS_VALVE = false as const;
export const D5_R7_AUTO_REPLACES_COMPONENT = false as const;
export const D5_R5_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D5_R7_AUTO_REROUTES_PIPING = false as const;
export const D5_R7_AUTO_CHANGES_GEOMETRY = false as const;
export const D5_R7_AUTO_REGENERATES_ISOMETRIC = false as const;
export const D5_R7_AUTO_REGENERATES_SPOOL = false as const;
export const D5_R6_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D5_R7_AUTO_RECALCULATES_STRESS = false as const;
export const D5_R7_AUTO_RECALCULATES_FLEXIBILITY = false as const;
export const D5_R7_AUTO_RECALCULATES_SUPPORT_LOAD = false as const;
export const D5_R7_AUTO_REWRITES_NDE_RESULT = false as const;
export const D5_R7_AUTO_REWRITES_TEST_RESULT = false as const;
export const D5_R7_AUTO_REVALIDATES_EXTERNAL_EVIDENCE = false as const;
export const D5_R7_CHANGE_CAN_MARK_EXPLICIT_DEPENDENT_RECORD_STALE = true as const;
export const D5_R7_CHANGE_CAN_REQUIRE_REASSESSMENT = true as const;
export const D5_R7_INFERRED_STALENESS_PROPAGATION_ALLOWED = false as const;
export const D5_R7_AUTO_REPOINTS_DEPENDENT_HISTORY = false as const;
export const CURRENT_D5_RECORD_EQUALS_VALIDATED = false as const;
export const STALE_D5_RECORD_EQUALS_INVALID = false as const;
export const D5_CHANGE_AUTO_RECALCULATES_ENGINEERING = false as const;
export const D5_CHANGE_AUTO_REDESIGNS_ENGINEERING = false as const;
export const D5_CHANGE_AUTO_REVALIDATES_ENGINEERING = false as const;
export const D5_CHANGE_AUTO_APPROVES_ENGINEERING = false as const;
export const D5_CHANGE_AUTO_DETERMINES_CONFORMANCE = false as const;
export const D5_R7_HIDDEN_CALCULATION_ALLOWED = false as const;
export const AI_CAN_CLOSE_D5_ENGINEERING_REASSESSMENT_AS_VALIDATED = false as const;
export const ADMIN_CAN_CLOSE_D5_ENGINEERING_REASSESSMENT_AS_VALIDATED = false as const;
export const D5_R7_PROVENANCE_REQUIRED = true as const;
export const D5_R7_PROVENANCE_PRESERVED = true as const;
export const SILENT_D5_R7_MUTATION_ALLOWED = false as const;
export const D5_R7_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D5_R7_SCOPE_ENFORCED = true as const;
export const D5_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R7_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R7_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D5_R8_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_RECALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_REDESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_REROUTING_PROMOTION = false as const;
export const UNAUTHORIZED_AUTOMATIC_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_CONFORMANCE_PROMOTION = false as const;
export const D5_R8_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[7];
export const D5_R8_PHASE_TYPE = D5_IMPLEMENTATION_PHASE_TYPES[7];
export const D5_R8_CANONICAL_SCOPE =
  "Implement governed D5 Piping discipline interfaces and handoffs using exact R1-R7 revisions. Support exact counterpart references and bounded handoffs with D1 Structural, D2 Civil, D3 Geotechnical and D4 Mechanical, plus future contracts for D6 Process, D7 Electrical and D8 Instrumentation & Control. Preserve discipline authority, currentness, limitations and explicit counterpart semantics. Do not validate counterpart engineering, infer missing counterparts, transfer authority, recalculate/redesign Piping, perform cross-discipline reasoning or start D6-D9 runtime." as const;
export const D5_R8_STARTED = false as const;
export const D5_R7_READY_FOR_NEXT_PHASE = true as const;
export const D5_R7_NEXT_PHASE = D5_R8_CANONICAL_PHASE;
export const D5_R7_NEXT_PHASE_TYPE = D5_R8_PHASE_TYPE;
export const D5_R7_CANONICAL_NEXT_PHASE = D5_R8_CANONICAL_PHASE;
export const D5_R7_CANONICAL_NEXT_PHASE_SCOPE = D5_R8_CANONICAL_SCOPE;
export const D5_R7_BLOCKER = "NONE" as const;
export const D5_R7_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D5_R7_OPEN_REQUIREMENT_STATUSES = ["PLANNED", "REQUESTED", "AWAITING_INFORMATION", "RECEIVED", "NOT_APPLICABLE"] as const;
export const D5_R7_SOURCE_BASIS = [
  "SOURCE_REQUIREMENT",
  "VENDOR_REQUIREMENT",
  "PROJECT_PIPING_DATA",
  "R3_DESIGN_CONDITION",
  "AUTHORIZED_PIPING_ENGINEERING_INPUT",
] as const;
export const D5_R7_CHANGE_CATEGORIES = [
  "REQUIREMENT_CHANGED",
  "ASSUMPTION_CHANGED",
  "DECISION_SUPERSEDED",
  "DESIGN_CONDITION_CHANGED",
  "SPECIFICATION_CHANGED",
  "COMPONENT_CHANGED",
  "VALVE_CHANGED",
  "ROUTE_CHANGED",
  "FABRICATION_CHANGED",
  "STRESS_EVIDENCE_CHANGED",
  "SUPPORT_CONTEXT_CHANGED",
  "NDE_EVIDENCE_CHANGED",
  "TEST_EVIDENCE_CHANGED",
  "REASSESSMENT_REQUIRED",
] as const;
export const D5_R7_DEPENDENCY_TARGETS = [
  "R3_CONDITION",
  "R3_SPECIFICATION",
  "R4_COMPONENT",
  "R4_VALVE",
  "R4_CONNECTION",
  "R5_ROUTE",
  "R5_ISOMETRIC",
  "R5_SPOOL",
  "R5_WELD",
  "R6_STRESS",
  "R6_SUPPORT",
  "R6_NDE",
  "R6_TEST",
  "R7_REQUIREMENT",
  "R7_ASSUMPTION",
  "R7_DECISION",
] as const;
export const D5_R7_REASSESSMENT_STATES = ["REASSESSMENT_REQUIRED", "REASSESSMENT_COMPLETED"] as const;
export const D5_R7_CURRENTNESS_MARKS = ["STALE", "REASSESSMENT_REQUIRED"] as const;
export const D5_R7_SUBJECT_KINDS = ["STRESS", "SUPPORT", "INSPECTION", "NDE", "TEST"] as const;

export {
  SOURCE_REQUIREMENT_EQUALS_ADOPTED_PIPING_REQUIREMENT,
  D5_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  D5_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D5_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D5_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  PARALLEL_D5_REQUIREMENT_ENGINE_CREATED,
  PARALLEL_D5_ASSUMPTION_ENGINE_CREATED,
  PARALLEL_D5_DECISION_ENGINE_CREATED,
  PARALLEL_D5_CHANGE_ENGINE_CREATED,
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
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
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
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
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
  "similar_value", "ai_similarity", "inferred", "filename", "temporal_proximity", "semantic_similarity",
  "tag_similarity", "line_number_similarity", "document_proximity", "drawing_placement", "line_tag_pattern",
  "naming_similarity", "document_location", "common_service_name", "common_vendor", "drawing_proximity",
  "nearby_text", "drawing_geometry", "point_cloud", "point_cloud_proximity", "adjacent_components",
  "route_geometry", "nearby_structure", "ai_reasoning", "stress_evidence", "shared_line", "shared_system",
  "geometry_proximity", "component_adjacency", "ai_inference",
]);
const OPEN_REQUIREMENT_STATUSES = new Set<string>(D5_R7_OPEN_REQUIREMENT_STATUSES);

type R6Kind = (typeof D5_R7_SUBJECT_KINDS)[number];

export type D5R7Dependency = {
  kind: (typeof D5_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetKind: (typeof D5_R7_DEPENDENCY_TARGETS)[number];
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
  closeAsValidated?: boolean;
  inferDependencies?: boolean;
  inferredStaleness?: boolean;
  sourceAutoAdopt?: boolean;
  vendorAutoAdopt?: boolean;
  recalculate?: boolean;
  recalculateDesign?: boolean;
  recalculateStress?: boolean;
  recalculateFlexibility?: boolean;
  recalculateSupportLoad?: boolean;
  redesign?: boolean;
  changeSpecification?: boolean;
  changePipingClass?: boolean;
  reselectComponent?: boolean;
  reselectValve?: boolean;
  replaceComponent?: boolean;
  reroute?: boolean;
  changeGeometry?: boolean;
  regenerateIsometric?: boolean;
  regenerateSpool?: boolean;
  rewriteNde?: boolean;
  rewriteTest?: boolean;
  revalidateExternal?: boolean;
  revalidate?: boolean;
  approve?: boolean;
  conformant?: boolean;
  certified?: boolean;
  engineeringValidated?: boolean;
  formula?: boolean;
  repoint?: boolean;
  propagate?: boolean;
  disciplineInterface?: boolean;
  d9Reasoning?: boolean;
};

export type D5R7SubjectInput = Prohibited & {
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
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
  citedCurrentness?: (typeof D5_CURRENTNESS_STATES)[number] | null;
  citedLifecycleStage: string;
  applicabilityRef: string;
  limitations: string;
  provenanceRef: string;
  identityBasis: string;
  assertedFingerprint?: string | null;
};

type BoundSubject = {
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
};

type GovernanceBase = BoundSubject & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  applicabilityRef: string;
  limitations: string;
  provenanceRef: string;
  authority: typeof D5_CONTEXT_AUTHORITY;
  pipingEngineeringAuthority: false;
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
  currentness: (typeof D5_CURRENTNESS_STATES)[number];
  citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number] | null;
  citedLifecycleStage: (typeof D5_MATURITY_STATES)[number];
  createdAt: string;
  createdBy: string;
};

export type D5R7RequirementRecord = GovernanceBase & {
  requirementId: string;
  statement: string;
  requirementCategory: (typeof INFORMATION_REQUIREMENT_TYPES)[number];
  sourceBasis: (typeof D5_R7_SOURCE_BASIS)[number];
  sourceRef: string;
  sourceRevision: string;
  requirementStatus: (typeof D5_R7_OPEN_REQUIREMENT_STATUSES)[number];
  adopted: boolean;
  adoptionRationale: string | null;
};

export type D5R7AssumptionRecord = GovernanceBase & {
  assumptionId: string;
  statement: string;
  basis: string;
  validationStatus: "unvalidated";
  materiality: string;
  validatedFact: false;
};

export type D5R7DecisionRecord = GovernanceBase & {
  decisionId: string;
  statement: string;
  basis: string;
  alternatives: { id: string; statement: string; is_selected: boolean }[];
  authoritativeDecision: true;
  aiRecommendation: false;
};

export type D5R7ChangeRecord = GovernanceBase & {
  changeId: string;
  changeCategory: (typeof D5_R7_CHANGE_CATEGORIES)[number];
  originRef: string;
  reason: string;
  dependencies: D5R7Dependency[];
  recalculated: false;
  redesigned: false;
};

export type D5R7ReassessmentRecord = GovernanceBase & {
  reassessmentId: string;
  changeId: string;
  targetId: string;
  targetFingerprint: string;
  state: (typeof D5_R7_REASSESSMENT_STATES)[number];
  recalculated: false;
  redesigned: false;
  engineeringValidated: false;
  approved: false;
};

export type D5R7CurrentnessMark = GovernanceBase & {
  markId: string;
  changeId: string;
  targetKind: (typeof D5_R7_DEPENDENCY_TARGETS)[number];
  targetId: string;
  targetFingerprint: string;
  mark: (typeof D5_R7_CURRENTNESS_MARKS)[number];
  invalidated: false;
  upstreamFingerprint: string;
};

export type D5R7HistoryRecord = {
  historyId: string;
  subjectKind: "REQUIREMENT" | "ASSUMPTION" | "DECISION" | "CHANGE" | "REASSESSMENT" | "CURRENTNESS";
  subjectId: string;
  fingerprint: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  recordedAt: string;
};

export type D5R7Store = {
  r6: D5R6Store;
  now: () => string;
  requirements: D5R7RequirementRecord[];
  assumptions: D5R7AssumptionRecord[];
  decisions: D5R7DecisionRecord[];
  changes: D5R7ChangeRecord[];
  reassessments: D5R7ReassessmentRecord[];
  currentnessMarks: D5R7CurrentnessMark[];
  history: D5R7HistoryRecord[];
};

type ChainRow = {
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
  fingerprint: string;
  tenantId: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
};

function fail(code: string): never {
  throw new Error(`D5_R7_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) {
    fail(code);
  }
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
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
  if (input.inventRequirement === true) fail("INVENTED_REQUIREMENT_REJECTED");
  if (input.inventAssumption === true) fail("INVENTED_ASSUMPTION_REJECTED");
  if (input.aiRecommendation === true) fail("AI_RECOMMENDATION_NOT_DECISION");
  if (input.adminAction === true) fail("ADMIN_ACTION_NOT_DECISION");
  if (input.closeAsValidated === true) fail("REASSESSMENT_CLOSURE_REJECTED");
  if (input.sourceAutoAdopt === true) fail("SOURCE_AUTO_ADOPTION_REJECTED");
  if (input.vendorAutoAdopt === true) fail("VENDOR_AUTO_ADOPTION_REJECTED");
  if (input.inferDependencies === true) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.inferredStaleness === true) fail("INFERRED_STALENESS_REJECTED");
  if (input.recalculate === true || input.recalculateDesign === true || input.recalculateStress === true || input.recalculateFlexibility === true || input.recalculateSupportLoad === true) {
    fail("RECALCULATION_REJECTED");
  }
  if (input.redesign === true) fail("REDESIGN_REJECTED");
  if (input.changeSpecification === true || input.changePipingClass === true) fail("SPECIFICATION_MUTATION_REJECTED");
  if (input.reselectComponent === true || input.reselectValve === true || input.replaceComponent === true) fail("COMPONENT_RESELECTION_REJECTED");
  if (input.reroute === true || input.changeGeometry === true) fail("REROUTE_REJECTED");
  if (input.regenerateIsometric === true || input.regenerateSpool === true) fail("FABRICATION_REGENERATION_REJECTED");
  if (input.rewriteNde === true || input.rewriteTest === true || input.revalidateExternal === true) fail("EVIDENCE_REWRITE_REJECTED");
  if (input.revalidate === true || input.conformant === true || input.certified === true || input.engineeringValidated === true) fail("VALIDATION_REJECTED");
  if (input.approve === true) fail("APPROVAL_REJECTED");
  if (input.formula === true) fail("HIDDEN_CALCULATION_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_REJECTED");
  if (input.d9Reasoning === true) fail("CROSS_DISCIPLINE_REASONING_REJECTED");
}

function citedCurrentnessOf(value: D5R7SubjectInput["citedCurrentness"]): (typeof D5_CURRENTNESS_STATES)[number] | null {
  if (value == null) return null;
  if (!(D5_CURRENTNESS_STATES as readonly string[]).includes(value)) fail("CURRENTNESS_INVALID");
  return value;
}

function maturityOf(value: string): (typeof D5_MATURITY_STATES)[number] {
  const token = value.trim();
  if (!(D5_MATURITY_STATES as readonly string[]).includes(token)) fail("LIFECYCLE_INVALID");
  return token as (typeof D5_MATURITY_STATES)[number];
}

function r6Row(store: D5R6Store, kind: R6Kind, id: string): ChainRow | undefined {
  if (kind === "STRESS") return store.stressEvidence.find((row) => row.evidenceRecordId === id);
  if (kind === "SUPPORT") return store.supports.find((row) => row.supportRecordId === id);
  if (kind === "INSPECTION") return store.inspections.find((row) => row.inspectionRecordId === id);
  if (kind === "NDE") return store.nde.find((row) => row.ndeRecordId === id);
  return store.tests.find((row) => row.testRecordId === id);
}

function upstreamSeal(store: D5R7Store): string {
  const r3 = store.r6.r5.r4.r3;
  const conditions = r3.conditions.map((row) => `${row.conditionId}:${row.fingerprint}:${row.designPressure.value}:${row.designPressure.unit}:${row.currentness}`).join("|");
  const specifications = r3.specifications.map((row) => `${row.specificationId}:${row.fingerprint}:${row.specificationRef}:${row.pipingClass}:${row.currentness}`).join("|");
  const components = store.r6.r5.r4.components.map((row) => `${row.componentRecordId}:${row.fingerprint}:${row.componentClassification}:${row.currentness}`).join("|");
  const valves = store.r6.r5.r4.valves.map((row) => `${row.valveRecordId}:${row.fingerprint}:${row.valveType}:${row.currentness}`).join("|");
  const routes = store.r6.r5.routes.map((row) => `${row.routeRecordId}:${row.fingerprint}:${row.currentness}`).join("|");
  const isometrics = store.r6.r5.isometrics.map((row) => `${row.isometricRecordId}:${row.fingerprint}:${row.documentRevision}`).join("|");
  const spools = store.r6.r5.spools.map((row) => `${row.spoolRecordId}:${row.fingerprint}:${row.spoolTag}`).join("|");
  const welds = store.r6.r5.welds.map((row) => `${row.weldRecordId}:${row.fingerprint}:${row.currentness}`).join("|");
  const stress = store.r6.stressEvidence.map((row) => `${row.evidenceRecordId}:${row.fingerprint}:${row.stressResult.value}:${row.stressResult.unit}:${row.currentness}`).join("|");
  const nde = store.r6.nde.map((row) => `${row.ndeRecordId}:${row.fingerprint}:${row.observedStatus}:${row.currentness}`).join("|");
  const tests = store.r6.tests.map((row) => `${row.testRecordId}:${row.fingerprint}:${row.observedStatus}:${row.currentness}`).join("|");
  return [conditions, specifications, components, valves, routes, isometrics, spools, welds, stress, nde, tests].join("#");
}

function requireChain(store: D5R7Store, actor: D5R1Actor, input: D5R7SubjectInput): BoundSubject {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.identityBasis.trim() !== "EXPLICIT") fail("INFERRED_SUBJECT_REJECTED");
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r6.r5.r4.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) {
    fail("R1_CONTEXT_NOT_FOUND");
  }
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r6.r5.r4.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.fingerprint !== objectRevision) fail(object ? "R1_REVISION_MISMATCH" : "R1_OBJECT_NOT_FOUND");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  const line = store.r6.r5.r4.r2.lines.find((row) => row.lineRecordId === explicit(input.lineRecordId, "R2_LINE_REQUIRED"));
  const lineRevision = explicit(input.lineContextFingerprint, "R2_REVISION_REQUIRED");
  if (!line || line.fingerprint !== lineRevision) fail(line ? "R2_REVISION_MISMATCH" : "R2_LINE_NOT_FOUND");
  if (line.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  const condition = store.r6.r5.r4.r3.conditions.find((row) => row.conditionId === explicit(input.conditionId, "R3_CONDITION_REQUIRED"));
  const conditionRevision = explicit(input.conditionRevisionFingerprint, "R3_REVISION_REQUIRED");
  if (!condition || condition.fingerprint !== conditionRevision) fail(condition ? "R3_REVISION_MISMATCH" : "R3_CONDITION_NOT_FOUND");
  if (condition.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  const component = store.r6.r5.r4.components.find((row) => row.componentRecordId === explicit(input.componentRecordId, "R4_COMPONENT_REQUIRED"));
  const componentRevision = explicit(input.componentRevisionFingerprint, "R4_COMPONENT_REVISION_REQUIRED");
  if (!component || component.fingerprint !== componentRevision) fail(component ? "R4_COMPONENT_REVISION_MISMATCH" : "R4_COMPONENT_NOT_FOUND");
  const connection = store.r6.r5.r4.connections.find((row) => row.connectionRecordId === explicit(input.connectionRecordId, "R4_CONNECTION_REQUIRED"));
  const connectionRevision = explicit(input.connectionRevisionFingerprint, "R4_CONNECTION_REVISION_REQUIRED");
  if (!connection || connection.fingerprint !== connectionRevision) fail(connection ? "R4_CONNECTION_REVISION_MISMATCH" : "R4_CONNECTION_NOT_FOUND");
  const route = store.r6.r5.routes.find((row) => row.routeRecordId === explicit(input.routeRecordId, "R5_ROUTE_REQUIRED"));
  const routeRevision = explicit(input.routeRevisionFingerprint, "R5_REVISION_REQUIRED");
  if (!route || route.fingerprint !== routeRevision) fail(route ? "R5_REVISION_MISMATCH" : "R5_ROUTE_NOT_FOUND");
  if (route.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  const subjectKind = explicit(input.r6SubjectKind, "R6_SUBJECT_REQUIRED");
  if (!(D5_R7_SUBJECT_KINDS as readonly string[]).includes(subjectKind)) fail("R6_SUBJECT_INVALID");
  const subjectId = explicit(input.r6SubjectId, "R6_SUBJECT_REQUIRED");
  const subjectRevision = explicit(input.r6RevisionFingerprint, "R6_REVISION_REQUIRED");
  const subject = r6Row(store.r6, subjectKind as R6Kind, subjectId);
  if (!subject || subject.fingerprint !== subjectRevision) fail(subject ? "R6_REVISION_MISMATCH" : "R6_SUBJECT_NOT_FOUND");
  if (subject.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  if (subject.objectId !== object.objectId || subject.objectRevisionFingerprint !== object.fingerprint) fail("R6_SUBJECT_MISMATCH");
  if (subject.lineRecordId !== line.lineRecordId || subject.lineContextFingerprint !== line.fingerprint) fail("R6_SUBJECT_MISMATCH");
  if (subject.conditionId !== condition.conditionId || subject.conditionRevisionFingerprint !== condition.fingerprint) fail("R6_SUBJECT_MISMATCH");
  if (subject.componentRecordId !== component.componentRecordId || subject.componentRevisionFingerprint !== component.fingerprint) fail("R6_SUBJECT_MISMATCH");
  if (subject.connectionRecordId !== connection.connectionRecordId || subject.connectionRevisionFingerprint !== connection.fingerprint) fail("R6_SUBJECT_MISMATCH");
  if (subject.routeRecordId !== route.routeRecordId || subject.routeRevisionFingerprint !== route.fingerprint) fail("R6_SUBJECT_MISMATCH");
  const cited = citedCurrentnessOf(input.citedCurrentness);
  if ((cited === null || cited === "CURRENT") && [context, object, line, condition, component, connection, route, subject].some((row) => row.recordStatus !== "CURRENT")) {
    fail("SOURCE_NOT_CURRENT");
  }
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
    r6SubjectKind: subjectKind as R6Kind,
    r6SubjectId: subjectId,
    r6RevisionFingerprint: subject.fingerprint,
  };
}

function remember(
  store: D5R7Store,
  subjectKind: D5R7HistoryRecord["subjectKind"],
  subjectId: string,
  fingerprint: string,
  recordStatus: D5R7HistoryRecord["recordStatus"],
): void {
  store.history.push({
    historyId: `d5r7-history-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    fingerprint,
    recordStatus,
    recordedAt: store.now(),
  });
}

function baseFields(
  store: D5R7Store,
  actor: D5R1Actor,
  input: D5R7SubjectInput,
  bound: BoundSubject,
  fingerprint: string,
  predecessorId: string | null,
  predecessorFingerprint: string | null,
): GovernanceBase {
  const applicabilityRef = explicit(input.applicabilityRef, "APPLICABILITY_REQUIRED");
  if (applicabilityRef !== bound.objectId) fail("APPLICABILITY_MISMATCH");
  const cited = citedCurrentnessOf(input.citedCurrentness);
  return {
    ...bound,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    applicabilityRef,
    limitations: explicit(input.limitations, "LIMITATIONS_REQUIRED"),
    provenanceRef: explicit(input.provenanceRef, "PROVENANCE_REQUIRED"),
    authority: D5_CONTEXT_AUTHORITY,
    pipingEngineeringAuthority: false,
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
    currentness: cited ?? "CURRENT",
    citedCurrentness: cited,
    citedLifecycleStage: maturityOf(input.citedLifecycleStage),
    createdAt: store.now(),
    createdBy: actor.actorId,
  };
}

function dependencyExists(store: D5R7Store, targetKind: string, targetId: string, targetFingerprint: string, tenantId: string): boolean {
  const r3 = store.r6.r5.r4.r3;
  const r4 = store.r6.r5.r4;
  const r5 = store.r6.r5;
  if (targetKind === "R3_CONDITION") return r3.conditions.some((row) => row.conditionId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R3_SPECIFICATION") return r3.specifications.some((row) => row.specificationId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R4_COMPONENT") return r4.components.some((row) => row.componentRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R4_VALVE") return r4.valves.some((row) => row.valveRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R4_CONNECTION") return r4.connections.some((row) => row.connectionRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R5_ROUTE") return r5.routes.some((row) => row.routeRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R5_ISOMETRIC") return r5.isometrics.some((row) => row.isometricRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R5_SPOOL") return r5.spools.some((row) => row.spoolRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R5_WELD") return r5.welds.some((row) => row.weldRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R6_STRESS") return store.r6.stressEvidence.some((row) => row.evidenceRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R6_SUPPORT") return store.r6.supports.some((row) => row.supportRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R6_NDE") return store.r6.nde.some((row) => row.ndeRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R6_TEST") return store.r6.tests.some((row) => row.testRecordId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R7_REQUIREMENT") return store.requirements.some((row) => row.requirementId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  if (targetKind === "R7_ASSUMPTION") return store.assumptions.some((row) => row.assumptionId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
  return store.decisions.some((row) => row.decisionId === targetId && row.fingerprint === targetFingerprint && row.tenantId === tenantId);
}

function resolveDependency(store: D5R7Store, actor: D5R1Actor, link: DependencyInput): D5R7Dependency {
  if (link.inferred === true || (link.inference != null && INFERRED.has(link.inference.trim().toLowerCase()))) fail("INFERRED_DEPENDENCY_REJECTED");
  const kind = explicit(link.kind, "RELATIONSHIP_NOT_EXPLICIT");
  if (!(D5_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) fail("RELATIONSHIP_NOT_EXPLICIT");
  const targetKind = explicit(link.targetKind, "DEPENDENCY_TARGET_REQUIRED");
  if (!(D5_R7_DEPENDENCY_TARGETS as readonly string[]).includes(targetKind)) fail("DEPENDENCY_TARGET_INVALID");
  const targetId = explicit(link.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(link.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  if (!dependencyExists(store, targetKind, targetId, targetFingerprint, actor.tenantId)) fail("DEPENDENCY_REVISION_MISMATCH");
  return {
    kind: kind as D5R7Dependency["kind"],
    targetKind: targetKind as D5R7Dependency["targetKind"],
    targetId,
    targetFingerprint,
  };
}

function finish<T extends { fingerprint: string }>(store: D5R7Store, before: string, record: T, asserted: string | null | undefined): T {
  if (asserted != null && asserted !== record.fingerprint) fail("FINGERPRINT_MISMATCH");
  if (upstreamSeal(store) !== before) fail("UPSTREAM_MUTATED");
  return record;
}

export function createD5R7Store(r6: D5R6Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D5R7Store {
  return { r6, now, requirements: [], assumptions: [], decisions: [], changes: [], reassessments: [], currentnessMarks: [], history: [] };
}

function commitRequirement(
  store: D5R7Store,
  actor: D5R1Actor,
  input: D5R7SubjectInput & {
    requirementId: string;
    statement: string;
    requirementCategory: string;
    sourceBasis: string;
    sourceRef: string;
    sourceRevision: string;
    requirementStatus?: string;
    adoptionRationale?: string | null;
    predecessorRequirementId?: string | null;
  },
  adopted: boolean,
): D5R7RequirementRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const requestedStatus = input.requirementStatus ?? "PLANNED";
  if (!(INFORMATION_REQUIREMENT_STATUSES as readonly string[]).includes(requestedStatus)) fail("REQUIREMENT_STATUS_INVALID");
  if (!OPEN_REQUIREMENT_STATUSES.has(requestedStatus)) fail("REQUIREMENT_ACCEPTANCE_NOT_IN_R7");
  const statement = explicit(input.statement, "REQUIREMENT_STATEMENT_REQUIRED");
  const requirementCategory = explicit(input.requirementCategory, "REQUIREMENT_CATEGORY_REQUIRED");
  if (!(INFORMATION_REQUIREMENT_TYPES as readonly string[]).includes(requirementCategory)) fail("REQUIREMENT_CATEGORY_INVALID");
  const sourceBasis = explicit(input.sourceBasis, "SOURCE_BASIS_REQUIRED");
  if (!(D5_R7_SOURCE_BASIS as readonly string[]).includes(sourceBasis)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  const sourceRef = explicit(input.sourceRef, "SOURCE_REFERENCE_REQUIRED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const rationale = input.adoptionRationale && input.adoptionRationale.trim() ? explicit(input.adoptionRationale, "ADOPTION_RATIONALE_REQUIRED") : null;
  if (adopted && !rationale) fail("ADOPTION_RATIONALE_REQUIRED");
  if (!adopted && rationale) fail("SOURCE_NOT_ADOPTED");
  const requirementId = explicit(input.requirementId, "REQUIREMENT_REQUIRED");
  const predecessor = input.predecessorRequirementId
    ? store.requirements.find((row) => row.requirementId === explicit(input.predecessorRequirementId ?? "", "PREDECESSOR_INVALID")) ?? null
    : null;
  if (input.predecessorRequirementId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT" || predecessor.adopted !== adopted)) {
    fail("PREDECESSOR_NOT_FOUND");
  }
  const fingerprint = fingerprintCanonical({
    requirementId,
    ...bound,
    statement,
    requirementCategory,
    sourceBasis,
    sourceRef,
    sourceRevision,
    requestedStatus,
    adopted,
    rationale,
    applicabilityRef: input.applicabilityRef,
    limitations: input.limitations,
    predecessor: predecessor?.requirementId ?? null,
  });
  const existing = store.requirements.find((row) => row.requirementId === requirementId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_REQUIREMENT_REJECTED");
  if (store.requirements.some((row) => row.recordStatus === "CURRENT" && row.requirementId !== predecessor?.requirementId && row.objectId === bound.objectId && row.statement === statement && row.sourceRevision === sourceRevision && row.adopted === adopted)) {
    fail("DUPLICATE_REQUIREMENT_REJECTED");
  }
  const predecessorFingerprint = predecessor?.fingerprint ?? null;
  if (predecessor) {
    const index = store.requirements.findIndex((row) => row.requirementId === predecessor.requirementId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.requirements[index] = superseded;
    remember(store, "REQUIREMENT", superseded.requirementId, superseded.fingerprint, "SUPERSEDED");
  }
  const record: D5R7RequirementRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.requirementId ?? null, predecessorFingerprint),
    requirementId,
    statement,
    requirementCategory: requirementCategory as D5R7RequirementRecord["requirementCategory"],
    sourceBasis: sourceBasis as D5R7RequirementRecord["sourceBasis"],
    sourceRef,
    sourceRevision,
    requirementStatus: requestedStatus as D5R7RequirementRecord["requirementStatus"],
    adopted,
    adoptionRationale: rationale,
  };
  store.requirements.push(record);
  remember(store, "REQUIREMENT", record.requirementId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordPipingSourceRequirement(
  store: D5R7Store,
  actor: D5R1Actor,
  input: D5R7SubjectInput & {
    requirementId: string;
    statement: string;
    requirementCategory: string;
    sourceBasis: string;
    sourceRef: string;
    sourceRevision: string;
    requirementStatus?: string;
    adoptionRationale?: string | null;
    predecessorRequirementId?: string | null;
  },
): D5R7RequirementRecord {
  return commitRequirement(store, actor, input, false);
}

export function recordPipingGovernedRequirement(
  store: D5R7Store,
  actor: D5R1Actor,
  input: D5R7SubjectInput & {
    requirementId: string;
    statement: string;
    requirementCategory: string;
    sourceBasis: string;
    sourceRef: string;
    sourceRevision: string;
    requirementStatus?: string;
    adoptionRationale?: string | null;
    predecessorRequirementId?: string | null;
  },
): D5R7RequirementRecord {
  return commitRequirement(store, actor, input, true);
}

export function recordPipingAssumption(
  store: D5R7Store,
  actor: D5R1Actor,
  input: D5R7SubjectInput & {
    assumptionId: string;
    statement: string;
    basis: string;
    validationStatus?: string;
    materiality?: string;
    predecessorAssumptionId?: string | null;
  },
): D5R7AssumptionRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const validationStatus = input.validationStatus ?? "unvalidated";
  assertAssumptionValidationStatus(validationStatus);
  if (validationStatus !== "unvalidated") fail("ASSUMPTION_NOT_VALIDATED_FACT");
  const materiality = input.materiality ?? "medium";
  assertAssumptionMateriality(materiality);
  const statement = explicit(input.statement, "ASSUMPTION_STATEMENT_REQUIRED");
  const basis = explicit(input.basis, "SOURCE_BASIS_REQUIRED");
  const assumptionId = explicit(input.assumptionId, "ASSUMPTION_REQUIRED");
  const predecessor = input.predecessorAssumptionId
    ? store.assumptions.find((row) => row.assumptionId === explicit(input.predecessorAssumptionId ?? "", "PREDECESSOR_INVALID")) ?? null
    : null;
  if (input.predecessorAssumptionId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_FOUND");
  const fingerprint = fingerprintCanonical({ assumptionId, ...bound, statement, basis, validationStatus, materiality, predecessor: predecessor?.assumptionId ?? null });
  const existing = store.assumptions.find((row) => row.assumptionId === assumptionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_ASSUMPTION_REJECTED");
  if (store.assumptions.some((row) => row.recordStatus === "CURRENT" && row.assumptionId !== predecessor?.assumptionId && row.objectId === bound.objectId && row.statement === statement)) {
    fail("DUPLICATE_ASSUMPTION_REJECTED");
  }
  const predecessorFingerprint = predecessor?.fingerprint ?? null;
  if (predecessor) {
    const index = store.assumptions.findIndex((row) => row.assumptionId === predecessor.assumptionId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.assumptions[index] = superseded;
    remember(store, "ASSUMPTION", superseded.assumptionId, superseded.fingerprint, "SUPERSEDED");
  }
  const record: D5R7AssumptionRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.assumptionId ?? null, predecessorFingerprint),
    assumptionId,
    statement,
    basis,
    validationStatus: "unvalidated",
    materiality,
    validatedFact: false,
  };
  store.assumptions.push(record);
  remember(store, "ASSUMPTION", record.assumptionId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordPipingEngineeringDecision(
  store: D5R7Store,
  actor: D5R1Actor,
  input: D5R7SubjectInput & {
    decisionId: string;
    statement: string;
    basis: string;
    alternatives: { id: string; statement: string; is_selected?: boolean }[];
    predecessorDecisionId?: string | null;
  },
): D5R7DecisionRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const alternatives = (input.alternatives ?? []).map((row) => ({
    id: explicit(row.id, "ALTERNATIVE_REQUIRED"),
    statement: explicit(row.statement, "ALTERNATIVE_REQUIRED"),
    is_selected: row.is_selected === true,
  }));
  if (alternatives.length === 0) fail("ALTERNATIVE_REQUIRED");
  assertSingleSelectedAlternative(alternatives);
  const statement = explicit(input.statement, "DECISION_STATEMENT_REQUIRED");
  const basis = explicit(input.basis, "SOURCE_BASIS_REQUIRED");
  const decisionId = explicit(input.decisionId, "DECISION_REQUIRED");
  const predecessor = input.predecessorDecisionId
    ? store.decisions.find((row) => row.decisionId === explicit(input.predecessorDecisionId ?? "", "PREDECESSOR_INVALID")) ?? null
    : null;
  if (input.predecessorDecisionId) {
    if (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_FOUND");
    assertSupersessionPair({
      decisionId,
      supersedesDecisionId: predecessor.decisionId,
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      prior: { id: predecessor.decisionId, tenant_id: predecessor.tenantId, workspace_id: predecessor.workspaceId },
    });
  }
  const fingerprint = fingerprintCanonical({ decisionId, ...bound, statement, basis, alternatives, predecessor: predecessor?.decisionId ?? null });
  const existing = store.decisions.find((row) => row.decisionId === decisionId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_DECISION_REJECTED");
  if (store.decisions.some((row) => row.recordStatus === "CURRENT" && row.decisionId !== predecessor?.decisionId && row.objectId === bound.objectId && row.statement === statement)) {
    fail("DUPLICATE_DECISION_REJECTED");
  }
  const predecessorFingerprint = predecessor?.fingerprint ?? null;
  if (predecessor) {
    const index = store.decisions.findIndex((row) => row.decisionId === predecessor.decisionId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.decisions[index] = superseded;
    remember(store, "DECISION", superseded.decisionId, superseded.fingerprint, "SUPERSEDED");
  }
  const record: D5R7DecisionRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.decisionId ?? null, predecessorFingerprint),
    decisionId,
    statement,
    basis,
    alternatives,
    authoritativeDecision: true,
    aiRecommendation: false,
  };
  store.decisions.push(record);
  remember(store, "DECISION", record.decisionId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordPipingChange(
  store: D5R7Store,
  actor: D5R1Actor,
  input: D5R7SubjectInput & {
    changeId: string;
    changeCategory: string;
    originRef: string;
    reason: string;
    dependencies: DependencyInput[];
    predecessorChangeId?: string | null;
  },
): D5R7ChangeRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const changeCategory = explicit(input.changeCategory, "CHANGE_CATEGORY_REQUIRED");
  if (!(D5_R7_CHANGE_CATEGORIES as readonly string[]).includes(changeCategory)) fail("CHANGE_CATEGORY_INVALID");
  if (!input.dependencies || input.dependencies.length === 0) fail("EXPLICIT_DEPENDENCY_REQUIRED");
  const dependencies = input.dependencies.map((link) => resolveDependency(store, actor, link));
  const originRef = explicit(input.originRef, "CHANGE_ORIGIN_REQUIRED");
  const reason = explicit(input.reason, "CHANGE_REASON_REQUIRED");
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const predecessor = input.predecessorChangeId
    ? store.changes.find((row) => row.changeId === explicit(input.predecessorChangeId ?? "", "PREDECESSOR_INVALID")) ?? null
    : null;
  if (input.predecessorChangeId && (!predecessor || predecessor.objectId !== bound.objectId || predecessor.recordStatus !== "CURRENT")) fail("PREDECESSOR_NOT_FOUND");
  const fingerprint = fingerprintCanonical({ changeId, ...bound, changeCategory, originRef, reason, dependencies, predecessor: predecessor?.changeId ?? null });
  const existing = store.changes.find((row) => row.changeId === changeId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_CHANGE_REJECTED");
  if (store.changes.some((row) => row.recordStatus === "CURRENT" && row.changeId !== predecessor?.changeId && row.objectId === bound.objectId && row.changeCategory === changeCategory && row.reason === reason)) {
    fail("DUPLICATE_CHANGE_REJECTED");
  }
  const predecessorFingerprint = predecessor?.fingerprint ?? null;
  if (predecessor) {
    const index = store.changes.findIndex((row) => row.changeId === predecessor.changeId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.changes[index] = superseded;
    remember(store, "CHANGE", superseded.changeId, superseded.fingerprint, "SUPERSEDED");
  }
  const record: D5R7ChangeRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, predecessor?.changeId ?? null, predecessorFingerprint),
    changeId,
    changeCategory: changeCategory as D5R7ChangeRecord["changeCategory"],
    originRef,
    reason,
    dependencies,
  };
  store.changes.push(record);
  remember(store, "CHANGE", record.changeId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recordPipingReassessment(
  store: D5R7Store,
  actor: D5R1Actor,
  input: D5R7SubjectInput & {
    reassessmentId: string;
    changeId: string;
    targetId: string;
    targetFingerprint: string;
    state: string;
  },
): D5R7ReassessmentRecord {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const change = store.changes.find((row) => row.changeId === changeId && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!change || change.objectId !== bound.objectId) fail("CHANGE_NOT_FOUND");
  const targetId = explicit(input.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(input.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  if (!change.dependencies.some((link) => link.targetId === targetId && link.targetFingerprint === targetFingerprint)) fail("DEPENDENCY_REVISION_MISMATCH");
  if (!(D5_R7_REASSESSMENT_STATES as readonly string[]).includes(input.state)) fail("REASSESSMENT_STATE_INVALID");
  const state = input.state as D5R7ReassessmentRecord["state"];
  const reassessmentId = explicit(input.reassessmentId, "REASSESSMENT_REQUIRED");
  const fingerprint = fingerprintCanonical({ reassessmentId, changeId, targetId, targetFingerprint, state, ...bound });
  const existing = store.reassessments.find((row) => row.reassessmentId === reassessmentId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_REASSESSMENT_REJECTED");
  if (store.reassessments.some((row) => row.recordStatus === "CURRENT" && row.changeId === changeId && row.targetId === targetId && row.state === state)) {
    fail("DUPLICATE_REASSESSMENT_REJECTED");
  }
  const record: D5R7ReassessmentRecord = {
    ...baseFields(store, actor, input, bound, fingerprint, null, null),
    reassessmentId,
    changeId,
    targetId,
    targetFingerprint,
    state,
  };
  store.reassessments.push(record);
  remember(store, "REASSESSMENT", record.reassessmentId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function markPipingDependentCurrentness(
  store: D5R7Store,
  actor: D5R1Actor,
  input: D5R7SubjectInput & {
    markId: string;
    changeId: string;
    targetKind: string;
    targetId: string;
    targetFingerprint: string;
    mark: string;
  },
): D5R7CurrentnessMark {
  const before = upstreamSeal(store);
  const bound = requireChain(store, actor, input);
  const changeId = explicit(input.changeId, "CHANGE_REQUIRED");
  const change = store.changes.find((row) => row.changeId === changeId && row.recordStatus === "CURRENT" && row.tenantId === actor.tenantId);
  if (!change || change.objectId !== bound.objectId) fail("CHANGE_NOT_FOUND");
  const targetKind = explicit(input.targetKind, "DEPENDENCY_TARGET_REQUIRED");
  const targetId = explicit(input.targetId, "DEPENDENCY_TARGET_REQUIRED");
  const targetFingerprint = explicit(input.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
  const link = change.dependencies.find((row) => row.targetKind === targetKind && row.targetId === targetId && row.targetFingerprint === targetFingerprint);
  if (!link) fail("DEPENDENCY_REVISION_MISMATCH");
  if (!(D5_R7_CURRENTNESS_MARKS as readonly string[]).includes(input.mark)) fail("CURRENTNESS_MARK_INVALID");
  const mark = input.mark as D5R7CurrentnessMark["mark"];
  const markId = explicit(input.markId, "CURRENTNESS_MARK_REQUIRED");
  const fingerprint = fingerprintCanonical({ markId, changeId, targetKind, targetId, targetFingerprint, mark, upstreamFingerprint: targetFingerprint, ...bound });
  const existing = store.currentnessMarks.find((row) => row.markId === markId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? finish(store, before, existing, input.assertedFingerprint) : fail("DUPLICATE_CURRENTNESS_MARK_REJECTED");
  const record: D5R7CurrentnessMark = {
    ...baseFields(store, actor, input, bound, fingerprint, null, null),
    markId,
    changeId,
    targetKind: link.targetKind,
    targetId,
    targetFingerprint,
    mark,
    upstreamFingerprint: targetFingerprint,
    currentness: mark,
    invalidated: false,
  };
  store.currentnessMarks.push(record);
  remember(store, "CURRENTNESS", record.markId, record.fingerprint, "CURRENT");
  return finish(store, before, record, input.assertedFingerprint);
}

export function recalculatePipingFromChange(): never {
  fail("RECALCULATION_REJECTED");
}
export function redesignPipingFromChange(): never {
  fail("REDESIGN_REJECTED");
}
export function changePipingSpecification(): never {
  fail("SPECIFICATION_MUTATION_REJECTED");
}
export function reselectPipingComponent(): never {
  fail("COMPONENT_RESELECTION_REJECTED");
}
export function reroutePiping(): never {
  fail("REROUTE_REJECTED");
}
export function regeneratePipingIsometric(): never {
  fail("FABRICATION_REGENERATION_REJECTED");
}
export function rewritePipingEvidence(): never {
  fail("EVIDENCE_REWRITE_REJECTED");
}
export function validatePipingChange(): never {
  fail("VALIDATION_REJECTED");
}
export function approvePipingChange(): never {
  fail("APPROVAL_REJECTED");
}
export function determinePipingConformance(): never {
  fail("CONFORMANCE_REJECTED");
}
export function inferPipingChangeDependency(): never {
  fail("INFERRED_DEPENDENCY_REJECTED");
}
export function repointPipingGovernance(): never {
  fail("AUTO_REPOINT_REJECTED");
}
export function closePipingReassessmentAsValidated(): never {
  fail("REASSESSMENT_CLOSURE_REJECTED");
}
export function openPipingDisciplineInterface(): never {
  fail("DISCIPLINE_INTERFACE_REJECTED");
}
export function mutatePipingGovernance(): never {
  fail("SILENT_MUTATION_REJECTED");
}
