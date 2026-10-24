/**
 * C9-R3 bounded rectangular RC column orchestrator.
 * Section resistance is routed to existing C3 or C4 checks.
 * Uniaxial member second-order is the existing C6 nominal-curvature method
 * followed by its governed C3 handoff, represented as one check.
 * This module does not add a resistance formula, infer effective length,
 * invent an imperfection, or convert creep coefficients.
 */

import { createHash } from "node:crypto";
import {
  EU_C3_METHOD_IDS,
  EU_C4_METHOD_IDS,
  EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT,
  EU_C6_R2_METHOD_ID,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
} from "@rtb/types";
import { evaluateEuC5Torsion, type EuC5EvaluateInput } from "../eu-c5/evaluate";
import { evaluateEuC6NominalCurvature, type EuC6NominalCurvatureInput, type EuC6NominalCurvatureResult } from "../eu-c6/evaluate";
import { evaluateEuC7LongTermState, type EuC7LongTermInput } from "../eu-c7/long-term";
import { evaluateEuC8BasicRequiredAnchorage, type EuC8BasicAnchorageInput } from "../eu-c8/anchorage-evaluate";
import { evaluateEuC8CoverAssembly, type EuC8CoverAssemblyInput } from "../eu-c8/evaluate";
import { evaluateEuC8MinClearSpacing, type EuC8MinClearSpacingInput } from "../eu-c8/spacing-evaluate";
import { evaluateEuC3DemandPointCheck } from "../eu-c3/evaluate";
import { evaluateEuC4DemandPointCheck } from "../eu-c4/evaluate";
import {
  EU_C9_PROFILE_COMPATIBILITY_CONTRACT,
  EU_C9_SOLID_SLAB_ORCHESTRATION_FEASIBILITY,
  euC9ExecutionDagHasCycle,
} from "./foundation";
import {
  EU_C9_R2_ORCHESTRATOR_REGISTRY,
  EU_C9_R2_REFERENCE_GENERATION,
  euC9R2AxialPresence,
  euC9R2MomentPresence,
  type EuC9R2SectionActions,
} from "./beam";

export const EU_C9_R3_ORCHESTRATOR_ID = "EU_RC_COLUMN_ORCHESTRATION_EN1992_REFERENCE" as const;
export const EU_C9_R3_ORCHESTRATOR_VERSION = "C9-R3" as const;
export const EU_C9_R3_MEMBER_TYPE = "COLUMN" as const;
export const EU_C9_R3_COLUMN_SCOPE = "ORDINARY_NON_PRESTRESSED_PRISMATIC_RECTANGULAR_REINFORCED_CONCRETE_COLUMN" as const;
export const EU_C9_R3_COLUMN_EXCLUSIONS = "NON_PRISMATIC_CIRCULAR_UNLESS_EXPLICITLY_SUPPORTED_FRAME_SWAY_GENERAL_PDELTA_BIAXIAL_SECOND_ORDER_EIGENVALUE_NONLINEAR_SEISMIC_FIRE_CONSTRUCTION_STAGE_PRESTRESSED_GENERAL_SHEAR_COMPLETE_DURABILITY_DESIGN_ANCHORAGE_COMPRESSION_ANCHORAGE_LAPS" as const;
export const EU_C9_R3_CAN_INVENT_MISSING_METHODS = false as const;
export const EU_C9_R3_CAN_EXPAND_METHOD_APPLICABILITY = false as const;
export const EU_C9_R3_CAN_SUBSTITUTE_DEFERRED_METHODS = false as const;
export const EU_C9_R3_CAN_OVERRIDE_FAIL_CLOSED_RESULT = false as const;
export const EU_C9_R3_NEW_ENGINEERING_FORMULA_IMPLEMENTED = false as const;
export const EU_C9_R3_SECTION_CHECK_EQUALS_MEMBER_STABILITY = false as const;
export const EU_C9_R3_C4_PMM_EQUALS_BIAXIAL_SECOND_ORDER = false as const;
export const EU_C9_R3_C6_EQUALS_GENERAL_COLUMN_STABILITY = false as const;
export const EU_C9_R3_COLUMN_MODE_CONTRACT_DEFINED = true as const;
export const EU_C9_R3_COLUMN_MODE_CONTRACT = "EXPLICIT_SECTION_UNIAXIAL_OR_SECTION_BIAXIAL_OR_MEMBER_SECOND_ORDER_UNIAXIAL" as const;
export const EU_C9_R3_SECTION_UNIAXIAL_METHOD = "C3" as const;
export const EU_C9_R3_C3_USED_AS_MEMBER_STABILITY_METHOD = false as const;
export const EU_C9_R3_SECTION_BIAXIAL_METHOD = "C4" as const;
export const EU_C9_R3_C4_USED_AS_GENERAL_COLUMN_ANALYSIS = false as const;
export const EU_C9_R3_C4_INCLUDES_SECOND_ORDER_AUTOMATICALLY = false as const;
export const EU_C9_R3_SECOND_ORDER_METHOD = "C6_THEN_C3" as const;
export const EU_C9_R3_C6_C3_HANDOFF_REUSED = true as const;
export const EU_C9_R3_C6_APPLICABILITY_CONTRACT = "ISOLATED_PRISMATIC_RECTANGULAR_UNIAXIAL_COMPRESSION_EXPLICIT_L0_EXPLICIT_END_MOMENTS_EXPLICIT_PHIEF_EXPLICIT_ES_EXISTING_NOMINAL_CURVATURE_PROFILE" as const;
export const EU_C9_R3_C6_USED_AS_GENERAL_PDELTA = false as const;
export const EU_C9_R3_C6_USED_AS_FRAME_ANALYSIS = false as const;
export const EU_C9_R3_C6_USED_AS_GLOBAL_STABILITY_ANALYSIS = false as const;
export const EU_C9_R3_AUTOMATIC_SECOND_ORDER_NEGLECT_DECISION = false as const;
export const EU_C9_R3_SLENDERNESS_LIMIT_RULE_IMPLEMENTED = false as const;
export const EU_C9_R3_C6_SLENDERNESS_REUSED = true as const;
export const EU_C9_R3_SLENDERNESS_USED_AS_UNGOVERNED_NEGLECT_GATE = false as const;
export const EU_C9_R3_EFFECTIVE_LENGTH_ROUTE = "EXPLICIT_GOVERNED_INPUT" as const;
export const EU_C9_R3_EFFECTIVE_LENGTH_INFERRED_FROM_SUPPORTS = false as const;
export const AI_EFFECTIVE_LENGTH_AUTHORITY = false as const;
export const EU_C9_R3_C6_END_MOMENT_CONTRACT_REUSED = true as const;
export const EU_C9_R3_FIRST_ORDER_MOMENTS_INCLUDE_IMPERFECTION = true as const;
export const EU_C9_R3_ADDITIONAL_IMPERFECTION_MOMENT_ADDED = false as const;
export const AI_IMPERFECTION_AUTHORITY = false as const;
export const EU_C9_R3_PHIEF_ROUTE = "EXPLICIT_GOVERNED_INPUT" as const;
export const EU_C9_R3_PHIEF_DEFAULTED = false as const;
export const EU_C9_R3_PHIEF_INVENTED = false as const;
export const EU_C9_R3_C7_PHI_AUTOMATICALLY_USED_AS_C6_PHIEF = false as const;
export const EU_C9_R3_C7_TO_C6_CREEP_TRANSFORMATION_IMPLEMENTED = false as const;
export const EU_C9_R3_ES_ROUTE = "EXPLICIT_GOVERNED_INPUT" as const;
export const EU_C9_R3_C6_C3_AXIAL_SIGN_CONVERSION_REUSED = true as const;
export const EU_C9_R3_C6_C3_SIGN_CONVERSION_COUNT = EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT;
export const EU_C9_R3_DOUBLE_AXIAL_SIGN_CONVERSION = false as const;
export const EU_C9_R3_C6_TOTAL_MOMENT_TO_C3_HANDOFF = "GOVERNED" as const;
export const EU_C9_R3_C6_C4_HANDOFF_STATE = "BLOCKED_MISSING_AUTHORITY" as const;
export const EU_C9_R3_C6_OUTPUT_USED_FOR_C4 = false as const;
export const EU_C9_R3_BIAXIAL_SECOND_ORDER_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R3_PURE_AXIAL_C3_SUPPORT = "C3_ON_EXPLICIT_SECTION_AXIS_ONLY_ELSE_BLOCKED_SCOPE_MISMATCH" as const;
export const EU_C9_R3_PURE_AXIAL_AXIS_CONTRACT = "EXPLICIT_MAJOR_OR_MINOR_AXIS_REQUIRED" as const;
export const EU_C9_R3_PURE_AXIAL_AXIS_GUESSED = false as const;
export const EU_C9_R3_PURE_AXIAL_C6_ROUTING = "NOT_AUTOMATIC_MISSING_END_MOMENT_STATE_FAILS_CLOSED" as const;
export const EU_C9_R3_UNIAXIAL_SECTION_ROUTING = "C3_WHEN_APPLICABLE" as const;
export const EU_C9_R3_BIAXIAL_SECTION_ROUTING = "C4_WHEN_APPLICABLE" as const;
export const EU_C9_R3_C2_COLUMN_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R3_C2_INVOKED_FOR_COLUMN = false as const;
export const EU_C9_R3_COLUMN_SHEAR_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R3_COLUMN_PUNCHING_STATE = "NOT_APPLICABLE" as const;
export const EU_C9_R3_PUNCHING_INVOKED = false as const;
export const EU_C9_R3_TORSION_ROUTING_CONTRACT = "DECLARED_TORSION_SCOPE_AND_TRANSPORTED_TORSION_AND_EXPLICIT_METHOD_INPUTS" as const;
export const NEW_C9_R3_COLUMN_INTERACTION_FORMULA_IMPLEMENTED = false as const;
export const EU_C9_R3_COLUMN_CRACK_WIDTH_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R3_LONG_TERM_NODE_ROLE = "CONTEXT" as const;
export const EU_C9_R3_LONG_TERM_CONTEXT_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R3_LONG_TERM_STATE_EQUALS_COLUMN_DEFLECTION_OR_STABILITY = false as const;
export const EU_C9_R3_COVER_NODE_ROLE = "CALCULATION" as const;
export const EU_C9_R3_COVER_ASSEMBLY_EQUALS_PROVIDED_COVER_COMPLIANCE = false as const;
export const EU_C9_R3_PROVIDED_COVER_COMPLIANCE_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R3_SPACING_ROUTING_CONTRACT = "EQUAL_DIAMETER_ADJACENT_BARS_EXPLICIT_AGGREGATE_EXPLICIT_NDP_EXPLICIT_ADJACENCY" as const;
export const EU_C9_R3_ARBITRARY_COLUMN_BAR_PAIR_AUTO_CLASSIFIED = false as const;
export const EU_C9_R3_BASIC_ANCHORAGE_ROUTING_CONTRACT = "STRAIGHT_TENSION_BAR_EXPLICIT_STRESS_EXPLICIT_BOND_PER_BAR_NOT_MEMBER_LABEL" as const;
export const EU_C9_R3_COMPRESSION_ANCHORAGE_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R3_DESIGN_ANCHORAGE_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R3_BASIC_ANCHORAGE_EQUALS_DESIGN_ANCHORAGE = false as const;
export const EU_C9_R3_LAP_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R3_LAP_REQUEST_CAN_PASS = false as const;
export const EU_C9_R3_NODE_ROLE_TAXONOMY_REUSED = true as const;
export const EU_C9_R3_CHECK_NODE_CAPABILITY_IDS = [
  "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL",
  "D1E.EU.C4.BIAXIAL.PMM",
  "D1E.EU.C6.C3_COMPOSITE",
  "D1E.EU.C5.TORSION",
  "D1E.EU.C8.MIN_CLEAR_SPACING",
  "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE",
] as const;
export const EU_C9_R3_C6_C3_COMPOSITE_NODE_CONTRACT = "ONE_REQUIRED_CHECK_C6_NOMINAL_CURVATURE_THEN_GOVERNED_C3_HANDOFF" as const;
export const EU_C9_R3_C6_INTERMEDIATE_RESULT_DOUBLE_COUNTED_AS_PASS = false as const;
export const EU_C9_R3_CALCULATION_NODE_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R3_CONTEXT_NODE_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R3_EMPTY_REQUIRED_CHECK_SET_CAN_PASS = false as const;
export const EU_C9_R3_DECLARED_SCOPE_CONTRACT = "EXPLICIT_DECLARED_COLUMN_EVALUATION_SCOPE" as const;
export const EU_C9_R3_REQUIRED_CHECK_SELECTION_DETERMINISTIC = true as const;
export const AI_REQUIRED_CHECK_SELECTION_AUTHORITY = false as const;
export const EU_C9_R3_ACTION_EFFECT_SOURCE_GOVERNED = true as const;
export const EU_C9_R3_ACTION_EFFECT_INVENTED = false as const;
export const D1C_COMBINATION_ENGINE_REUSED = true as const;
export const PARALLEL_C9_R3_COMBINATION_ENGINE_CREATED = false as const;
export const EU_C9_R3_PROFILE_COMPATIBILITY_REUSED = true as const;
export const EU_C9_R3_PROFILE_MISMATCH_FAILS_CLOSED = true as const;
export const EU_C9_R3_NDP_SEMANTIC_IDENTITY_REQUIRED = true as const;
export const EU_C9_R3_NDP_VALUE_ONLY_REUSE_ALLOWED = false as const;
export const C1_RULES_REUSED_FOR_C9_R3 = true as const;
export const PARALLEL_C9_R3_MATERIAL_MODEL_CREATED = false as const;
export const D1E_RECTANGULAR_SECTION_GEOMETRY_REUSED = true as const;
export const PARALLEL_COLUMN_SECTION_GEOMETRY_CREATED = false as const;
export const EU_C9_R3_SECTION_GEOMETRY_EQUALS_MEMBER_STABILITY_INPUTS = false as const;
export const EU_C9_R3_COLUMN_EXECUTION_GRAPH = "SECTION_UNIAXIAL_C3_OR_SECTION_BIAXIAL_C4_OR_C6_THEN_C3_COMPOSITE; DETAILING_AND_TORSION_ONLY_WHEN_DECLARED" as const;
export const EU_C9_R3_COLUMN_EXECUTION_DAG_IMPLEMENTED = true as const;
export const EU_C9_R3_CIRCULAR_ENGINEERING_DEPENDENCY = false as const;
export const EU_C9_R3_FAILURE_PROPAGATION = "PASS" as const;
export const EU_C9_R3_ONLY_REQUIRED_CHECK_NODES_AGGREGATED = true as const;
export const EU_C9_R3_MEMBER_AGGREGATION_IMPLEMENTED = true as const;
export const EU_C9_R3_MULTIPLE_MEMBER_FINDINGS_PRESERVED = true as const;
export const EU_C9_R3_COLUMN_RESULT_CONTRACT_GOVERNED = true as const;
export const EU_C9_R3_C6_INTERMEDIATE_PROVENANCE_PRESERVED = true as const;
export const EU_C9_R3_FULL_STANDARD_COVERAGE = false as const;
export const EU_C9_R3_DECLARED_SCOPE_COMPLETENESS_SEMANTICS = "PASS" as const;
export const EU_C9_R3_COLUMN_RESULT_EQUALS_COMPLETE_EN1992_COLUMN_DESIGN = false as const;
export const EU_C9_R3_COLUMN_RESULT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const EU_C9_R3_COLUMN_RESULT_EQUALS_CERTIFICATION = false as const;
export const EU_C9_R3_MEMBER_PROVENANCE_GRAPH = "PASS" as const;
export const EU_C9_R3_MEMBER_FINGERPRINT_COMPLETE = true as const;
export const EU_C9_R3_DEPENDENCY_INVALIDATION = true as const;
export const STALE_C9_R3_COLUMN_RESULT_REUSE_ALLOWED = false as const;
export const EU_C9_R3_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const EU_C9_R3_REINFORCEMENT_AUTODESIGN = false as const;
export const EU_C9_R3_MEMBER_GEOMETRY_AUTODESIGN = false as const;
export const EU_C9_R3_EFFECTIVE_LENGTH_AUTODESIGN = false as const;
export const EU_C9_R3_AUTOMATIC_REBAR_REPOSITIONING = false as const;
export const EU_C9_R3_AUTOMATIC_ANCHORAGE_EXTENSION = false as const;
export const EU_C9_R3_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_BYPASS_REQUIRED_COLUMN_CHECKS = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_COLUMN_ENGINEERING_INPUTS = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_EFFECTIVE_LENGTH = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_PHIEF = false as const;
export const EU_C9_R3_OPTIMIZATION_ACCEPTS_INCOMPLETE_AS_FEASIBLE = false as const;
export const EU_C9_R3_OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const EU_C9_R3_PARETO_ACCEPTS_FAILED_COLUMN_AS_FEASIBLE = false as const;
export const EU_C9_R3_IMPLEMENTED_COLUMN_ORCHESTRATOR_COUNT = 1 as const;
export const EU_C9_R3_NUMERICALLY_VALIDATED_COLUMN_ORCHESTRATOR_COUNT = 1 as const;
export const EU_C9_R3_ENGINEER_VALIDATED_COLUMN_ORCHESTRATOR_COUNT = 0 as const;
export const EU_C9_R3_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const NUMERICAL_COLUMN_ORCHESTRATION_VALIDATION_EQUALS_ENGINEER_VALIDATION = false as const;
export const C9_COLUMN_ORCHESTRATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C9_R3_PRODUCT_SUBCLAIM = "BOUNDED_RC_COLUMN_ORCHESTRATION_REFERENCE_CAPABILITY" as const;
export const EU_C9_R3_ORCHESTRATOR_REGISTRY_UPDATED = true as const;
export const PARALLEL_ORCHESTRATOR_REGISTRY_CREATED = false as const;
export const EU_C9_R3_SOLID_SLAB_NEXT_FEASIBILITY = EU_C9_SOLID_SLAB_ORCHESTRATION_FEASIBILITY;
export const EU_C9_R3_VALIDATION_DEBT_REDUCED_ITEMS = [
  "C9_COLUMN_RUNTIME_ORCHESTRATOR",
  "C9_COLUMN_ROUTING_VALIDATION",
  "C9_C6_C3_ORCHESTRATION_VALIDATION",
  "C9_COLUMN_AGGREGATION_VALIDATION",
] as const;
export const EU_C9_R3_VALIDATION_DEBT_REMAINING_ITEMS = [
  "BIAXIAL_SECOND_ORDER",
  "GENERAL_PDELTA",
  "GENERAL_FRAME_ANALYSIS",
  "COLUMN_SHEAR",
  "COLUMN_CRACK_WIDTH",
  "DEFLECTION",
  "CALCULATED_CREEP",
  "CALCULATED_SHRINKAGE",
  "DURABILITY_COVER_LOOKUP",
  "PROVIDED_COVER_COMPLIANCE",
  "DESIGN_BOND_STRENGTH_DERIVATION",
  "BOND_CONDITION_DERIVATION",
  "DESIGN_ANCHORAGE",
  "COMPRESSION_ANCHORAGE",
  "LAPS",
  "ENGINEER_VALIDATION",
  "NATIONAL_PROFILE_VALIDATION",
  "FORMAL_CONFORMANCE",
] as const;

export const EU_C9_R3_DECLARED_SCOPE_IDS = [
  "SECTION_UNIAXIAL",
  "SECTION_BIAXIAL",
  "MEMBER_SECOND_ORDER_UNIAXIAL",
  "TORSION",
  "LONG_TERM_CONTEXT",
  "COVER_REQUIREMENT",
  "REINFORCEMENT_SPACING",
  "BASIC_ANCHORAGE",
  "PROVIDED_COVER_COMPLIANCE",
  "COLUMN_SHEAR",
  "CRACK_WIDTH",
  "DESIGN_ANCHORAGE",
  "LAPS",
  "COMPRESSION_ANCHORAGE",
  "C2_FLEXURE",
  "PUNCHING",
  "C6_C4_HANDOFF",
] as const;

export type EuC9R3DeclaredScope = (typeof EU_C9_R3_DECLARED_SCOPE_IDS)[number];
export type EuC9R3ColumnMode = "SECTION_UNIAXIAL" | "SECTION_BIAXIAL" | "MEMBER_SECOND_ORDER_UNIAXIAL";
export type EuC9R3NodeRole = "CHECK" | "CALCULATION" | "CONTEXT";
export type EuC9R3ExecutionStatus =
  | "SATISFIED"
  | "NOT_SATISFIED"
  | "UNDETERMINED"
  | "NOT_APPLICABLE"
  | "NOT_IMPLEMENTED"
  | "DEFERRED"
  | "BLOCKED_SCOPE_MISMATCH"
  | "BLOCKED_DEPENDENCY"
  | "BLOCKED_MISSING_AUTHORITY"
  | "INVALID_INPUT"
  | "CALCULATED"
  | "AVAILABLE";
export type EuC9R3OverallState =
  | "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE"
  | "MEMBER_NOT_SATISFIED"
  | "MEMBER_INCOMPLETE"
  | "MEMBER_UNDETERMINED"
  | "ORCHESTRATION_BLOCKED";

export type EuC9R3SectionRoute = {
  state: "ROUTED" | "BLOCKED_SCOPE_MISMATCH" | "INVALID_INPUT" | "NOT_APPLICABLE";
  methodId: string | null;
  axis: "MAJOR_AXIS" | "MINOR_AXIS" | null;
  executesC2: false;
  executesC3: boolean;
  executesC4: boolean;
  reason: string | null;
};

export type EuC9R3C6Intermediate = {
  methodId: string;
  profileId: string;
  slenderness: number | null;
  phiEf: number | null;
  nominalCurvaturePerMm: number | null;
  secondOrderMomentNmm: number | null;
  totalDesignMomentNmm: number | null;
  c3AxialInputN: number | null;
  c3MomentInputNm: number | null;
  c3Utilization: number | null;
  c3CheckState: EuC6NominalCurvatureResult["c3CheckState"];
  c3MethodId: string | null;
  additionalImperfectionNmm: 0 | null;
  signConversionCount: typeof EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT;
  fingerprint: string;
};

export type EuC9R3NodeResult = {
  capabilityId: string;
  nodeRole: EuC9R3NodeRole;
  executionStatus: EuC9R3ExecutionStatus;
  requiredCheck: boolean;
  methodId: string | null;
  profileId: string | null;
  numericalResult: number | null;
  resultFingerprint: string | null;
  unresolvedInputs: readonly string[];
  executedMethodIds: readonly string[];
};

export type EuC9R3ColumnInput = {
  memberId: string;
  memberType: string;
  declaredEvaluationScope?: readonly EuC9R3DeclaredScope[] | null;
  standardContext?: { family: string; generation: string; profileId: string } | null;
  geometryShape?: "RECTANGULAR" | "CIRCULAR" | "OTHER" | null;
  materialRef?: string | null;
  reinforcementRef?: string | null;
  actions?: EuC9R2SectionActions | null;
  combinationId?: string | null;
  c3?: Parameters<typeof evaluateEuC3DemandPointCheck>[0] | null;
  c4?: Parameters<typeof evaluateEuC4DemandPointCheck>[0] | null;
  secondOrder?: EuC6NominalCurvatureInput | null;
  creepCoefficientPhi?: number | null;
  torsion?: EuC5EvaluateInput | null;
  longTerm?: EuC7LongTermInput | null;
  cover?: EuC8CoverAssemblyInput | null;
  spacing?: EuC8MinClearSpacingInput | null;
  anchorage?: EuC8BasicAnchorageInput | null;
  prestressed?: boolean;
  nonPrismatic?: boolean;
  fireDesign?: boolean;
  seismicDetailing?: boolean;
  constructionStage?: boolean;
  swayFrameAnalysis?: boolean;
  generalPDelta?: boolean;
  effectiveLengthInferenceRequested?: boolean;
  supportConditionInferenceRequested?: boolean;
  swayInferenceRequested?: boolean;
  additionalImperfectionRequested?: boolean;
  slendernessNeglectRequested?: boolean;
  useC7PhiAsPhiEf?: boolean;
  hardCodedCombinationFactors?: boolean;
  ndpValueOnlyReuse?: boolean;
  priorResultFingerprint?: string | null;
};

export type EuC9R3ColumnResult = {
  orchestratorId: typeof EU_C9_R3_ORCHESTRATOR_ID;
  orchestratorVersion: typeof EU_C9_R3_ORCHESTRATOR_VERSION;
  memberId: string;
  memberType: string;
  columnEvaluationMode: EuC9R3ColumnMode | null;
  declaredEvaluationScope: readonly EuC9R3DeclaredScope[];
  sectionAxis: "MAJOR_AXIS" | "MINOR_AXIS" | null;
  executedCapabilityIds: readonly string[];
  nodes: readonly EuC9R3NodeResult[];
  checkNodes: readonly EuC9R3NodeResult[];
  calculationNodes: readonly EuC9R3NodeResult[];
  contextNodes: readonly EuC9R3NodeResult[];
  c6Intermediate: EuC9R3C6Intermediate | null;
  sectionResult: { methodId: string | null; checkState: string | null; numericalResult: number | null } | null;
  notApplicableCapabilities: readonly string[];
  deferredChecks: readonly string[];
  unavailableChecks: readonly string[];
  failedChecks: readonly string[];
  blockingFindings: readonly string[];
  unresolvedInputs: readonly string[];
  overallState: EuC9R3OverallState;
  evaluationCompleteForDeclaredScope: boolean;
  fullStandardCoverage: false;
  engineerValidationState: typeof EU_C9_R3_ENGINEER_VALIDATION_STATE;
  conformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  productClaim: typeof EU_CONCRETE_PRODUCT_CLAIM_LEVEL;
  memberFingerprint: string;
  provenanceGraph: readonly EuC9R3NodeResult[];
  staleReuseRejected: boolean;
  warnings: readonly string[];
};

const CLOSED_STATUSES = ["SATISFIED", "CALCULATED", "AVAILABLE", "NOT_APPLICABLE"] as const;

export const EU_C9_R3_COLUMN_EXECUTION_DAG = [
  { id: "CONTEXT_PROFILE", upstream: [] },
  { id: "GEOMETRY_MATERIAL", upstream: ["CONTEXT_PROFILE"] },
  { id: "ACTION_ROUTING", upstream: ["CONTEXT_PROFILE"] },
  { id: "SECTION_UNIAXIAL", upstream: ["GEOMETRY_MATERIAL", "ACTION_ROUTING"] },
  { id: "SECTION_BIAXIAL", upstream: ["GEOMETRY_MATERIAL", "ACTION_ROUTING"] },
  { id: "MEMBER_SECOND_ORDER_C6", upstream: ["GEOMETRY_MATERIAL", "ACTION_ROUTING"] },
  { id: "C6_C3_HANDOFF", upstream: ["MEMBER_SECOND_ORDER_C6"] },
  { id: "TORSION", upstream: ["GEOMETRY_MATERIAL", "ACTION_ROUTING"] },
  { id: "LONG_TERM_CONTEXT", upstream: ["CONTEXT_PROFILE"] },
  { id: "COVER", upstream: ["GEOMETRY_MATERIAL"] },
  { id: "SPACING", upstream: ["GEOMETRY_MATERIAL"] },
  { id: "ANCHORAGE", upstream: ["GEOMETRY_MATERIAL"] },
  { id: "AGGREGATION", upstream: ["SECTION_UNIAXIAL", "SECTION_BIAXIAL", "C6_C3_HANDOFF", "TORSION", "LONG_TERM_CONTEXT", "COVER", "SPACING", "ANCHORAGE"] },
] as const;

export function euC9R3ColumnExecutionDagHasCycle(): boolean {
  const upstream = new Map<string, readonly string[]>(EU_C9_R3_COLUMN_EXECUTION_DAG.map((node) => [node.id, node.upstream]));
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const walk = (id: string): boolean => {
    if (visiting.has(id)) return true;
    if (visited.has(id)) return false;
    visiting.add(id);
    for (const parent of upstream.get(id) ?? []) {
      if (walk(parent)) return true;
    }
    visiting.delete(id);
    visited.add(id);
    return false;
  };
  return EU_C9_R3_COLUMN_EXECUTION_DAG.some((node) => walk(node.id)) || euC9ExecutionDagHasCycle();
}

export const EU_C9_R3_COLUMN_EXECUTION_DAG_ACYCLIC = true as const;

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stable(item)).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
}

export function euC9R3Fingerprint(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

function hasScope(scope: readonly EuC9R3DeclaredScope[], id: EuC9R3DeclaredScope): boolean {
  return scope.includes(id);
}

function modeOf(scope: readonly EuC9R3DeclaredScope[]): EuC9R3ColumnMode | null {
  if (hasScope(scope, "SECTION_UNIAXIAL")) return "SECTION_UNIAXIAL";
  if (hasScope(scope, "SECTION_BIAXIAL")) return "SECTION_BIAXIAL";
  if (hasScope(scope, "MEMBER_SECOND_ORDER_UNIAXIAL")) return "MEMBER_SECOND_ORDER_UNIAXIAL";
  return null;
}

function mapCheck(state: string): EuC9R3ExecutionStatus {
  if (state === "CHECK_SATISFIED" || state === "SATISFIED") return "SATISFIED";
  if (state === "CHECK_NOT_SATISFIED" || state === "NOT_SATISFIED") return "NOT_SATISFIED";
  return "UNDETERMINED";
}

function blockedRoute(reason: string): EuC9R3SectionRoute {
  return { state: "BLOCKED_SCOPE_MISMATCH", methodId: null, axis: null, executesC2: false, executesC3: false, executesC4: false, reason };
}

export function routeEuC9R3ColumnSection(input: {
  mode: "SECTION_UNIAXIAL" | "SECTION_BIAXIAL";
  actions: EuC9R2SectionActions;
}): EuC9R3SectionRoute {
  const axial = euC9R2AxialPresence(input.actions.axial);
  const major = euC9R2MomentPresence(input.actions.majorMoment);
  const minor = euC9R2MomentPresence(input.actions.minorMoment);
  if (axial === "INVALID" || major === "INVALID" || minor === "INVALID") {
    return { state: "INVALID_INPUT", methodId: null, axis: null, executesC2: false, executesC3: false, executesC4: false, reason: "INVALID_ACTION" };
  }
  if (input.mode === "SECTION_BIAXIAL") {
    if (axial === "ABSENT" || major !== "PRESENT" || minor !== "PRESENT") return blockedRoute("BIAXIAL_MODE_REQUIRES_AXIAL_AND_BOTH_AXES");
    return { state: "ROUTED", methodId: EU_C4_METHOD_IDS[0], axis: null, executesC2: false, executesC3: false, executesC4: true, reason: null };
  }
  if (major === "PRESENT" && minor === "PRESENT") return blockedRoute("BIAXIAL_ACTIONS_IN_UNIAXIAL_MODE");
  if (axial === "ABSENT") return blockedRoute("C2_NOT_AVAILABLE_FOR_COLUMN");
  if (major === "PRESENT") {
    return { state: "ROUTED", methodId: EU_C3_METHOD_IDS[0], axis: "MAJOR_AXIS", executesC2: false, executesC3: true, executesC4: false, reason: null };
  }
  if (minor === "PRESENT") {
    return { state: "ROUTED", methodId: EU_C3_METHOD_IDS[1], axis: "MINOR_AXIS", executesC2: false, executesC3: true, executesC4: false, reason: null };
  }
  const axis = input.actions.pureAxialSectionAxis ?? null;
  if (axis !== "MAJOR_AXIS" && axis !== "MINOR_AXIS") return blockedRoute("PURE_AXIAL_REQUIRES_EXPLICIT_AXIS");
  return {
    state: "ROUTED",
    methodId: axis === "MINOR_AXIS" ? EU_C3_METHOD_IDS[1] : EU_C3_METHOD_IDS[0],
    axis,
    executesC2: false,
    executesC3: true,
    executesC4: false,
    reason: null,
  };
}

function blankNode(partial: EuC9R3NodeResult): EuC9R3NodeResult {
  return partial;
}

function intermediateOf(result: EuC6NominalCurvatureResult): EuC9R3C6Intermediate {
  return {
    methodId: result.methodId,
    profileId: result.profileId,
    slenderness: result.slenderness,
    phiEf: result.phiEf,
    nominalCurvaturePerMm: result.nominalCurvaturePerMm,
    secondOrderMomentNmm: result.secondOrderMomentNmm,
    totalDesignMomentNmm: result.totalDesignMomentNmm,
    c3AxialInputN: result.c3AxialInputN,
    c3MomentInputNm: result.c3MomentInputNm,
    c3Utilization: result.c3Utilization,
    c3CheckState: result.c3CheckState,
    c3MethodId: result.c3MethodId,
    additionalImperfectionNmm: result.additionalImperfectionNmm,
    signConversionCount: EU_C6_R2_AXIAL_SIGN_CONVERSION_COUNT,
    fingerprint: result.fingerprint,
  };
}

function finish(
  input: EuC9R3ColumnInput,
  nodes: readonly EuC9R3NodeResult[],
  blocking: string | null,
  forced: EuC9R3OverallState | null,
  complete: boolean,
  c6Intermediate: EuC9R3C6Intermediate | null,
  sectionAxis: "MAJOR_AXIS" | "MINOR_AXIS" | null,
  sectionResult: EuC9R3ColumnResult["sectionResult"],
): EuC9R3ColumnResult {
  const scope = input.declaredEvaluationScope ?? [];
  const required = nodes.filter((item) => item.requiredCheck);
  const failedChecks = required.filter((item) => item.executionStatus === "NOT_SATISFIED").map((item) => item.capabilityId);
  const deferredChecks = nodes.filter((item) => item.executionStatus === "DEFERRED").map((item) => item.capabilityId);
  const unavailableChecks = nodes.filter((item) => item.executionStatus === "NOT_IMPLEMENTED" || item.executionStatus === "BLOCKED_DEPENDENCY" || item.executionStatus === "BLOCKED_SCOPE_MISMATCH" || item.executionStatus === "BLOCKED_MISSING_AUTHORITY").map((item) => item.capabilityId);
  const unresolvedInputs = nodes.flatMap((item) => item.unresolvedInputs);
  const blockingFindings = [
    ...(blocking ? [blocking] : []),
    ...failedChecks.map((id) => `FAILED:${id}`),
    ...deferredChecks.map((id) => `DEFERRED:${id}`),
    ...unavailableChecks.map((id) => `UNAVAILABLE:${id}`),
    ...nodes.filter((item) => item.executionStatus === "UNDETERMINED" || item.executionStatus === "INVALID_INPUT").map((item) => `UNRESOLVED:${item.capabilityId}`),
  ];
  let overall: EuC9R3OverallState = forced ?? "MEMBER_UNDETERMINED";
  if (!forced) {
    if (required.length === 0) overall = "MEMBER_UNDETERMINED";
    else if (required.some((item) => item.executionStatus === "NOT_SATISFIED")) overall = "MEMBER_NOT_SATISFIED";
    else if (nodes.some((item) => item.executionStatus === "UNDETERMINED" || item.executionStatus === "INVALID_INPUT")) overall = "MEMBER_UNDETERMINED";
    else if (nodes.some((item) => item.executionStatus === "NOT_IMPLEMENTED" || item.executionStatus === "DEFERRED" || item.executionStatus === "BLOCKED_DEPENDENCY" || item.executionStatus === "BLOCKED_SCOPE_MISMATCH" || item.executionStatus === "BLOCKED_MISSING_AUTHORITY")) overall = "MEMBER_INCOMPLETE";
    else if (required.every((item) => item.executionStatus === "SATISFIED")) overall = "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE";
  }
  const fingerprint = euC9R3Fingerprint({
    memberId: input.memberId,
    memberType: input.memberType,
    scope,
    mode: modeOf(scope),
    standardContext: input.standardContext ?? null,
    geometryShape: input.geometryShape ?? null,
    reinforcementRef: input.reinforcementRef ?? null,
    materialRef: input.materialRef ?? null,
    actions: input.actions ?? null,
    combinationId: input.combinationId ?? null,
    l0Mm: input.secondOrder?.l0Mm ?? null,
    m01Nmm: input.secondOrder?.m01Nmm ?? null,
    m02Nmm: input.secondOrder?.m02Nmm ?? null,
    phiEf: input.secondOrder?.phiEf ?? null,
    esMPa: input.secondOrder?.esMPa ?? null,
    graph: EU_C9_R3_ORCHESTRATOR_VERSION,
  });
  return {
    orchestratorId: EU_C9_R3_ORCHESTRATOR_ID,
    orchestratorVersion: EU_C9_R3_ORCHESTRATOR_VERSION,
    memberId: input.memberId,
    memberType: input.memberType,
    columnEvaluationMode: hasScope(scope, "SECTION_BIAXIAL") && hasScope(scope, "MEMBER_SECOND_ORDER_UNIAXIAL") ? null : modeOf(scope),
    declaredEvaluationScope: scope,
    sectionAxis,
    executedCapabilityIds: nodes.flatMap((item) => item.executedMethodIds),
    nodes,
    checkNodes: nodes.filter((item) => item.nodeRole === "CHECK"),
    calculationNodes: nodes.filter((item) => item.nodeRole === "CALCULATION"),
    contextNodes: nodes.filter((item) => item.nodeRole === "CONTEXT"),
    c6Intermediate,
    sectionResult,
    notApplicableCapabilities: nodes.filter((item) => item.executionStatus === "NOT_APPLICABLE").map((item) => item.capabilityId),
    deferredChecks,
    unavailableChecks,
    failedChecks,
    blockingFindings,
    unresolvedInputs,
    overallState: overall,
    evaluationCompleteForDeclaredScope: complete && overall !== "ORCHESTRATION_BLOCKED",
    fullStandardCoverage: false,
    engineerValidationState: EU_C9_R3_ENGINEER_VALIDATION_STATE,
    conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    productClaim: EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
    memberFingerprint: fingerprint,
    provenanceGraph: nodes,
    staleReuseRejected: input.priorResultFingerprint != null && input.priorResultFingerprint !== fingerprint,
    warnings: [EU_C9_R3_PRODUCT_SUBCLAIM, "SECTION_RESISTANCE_IS_NOT_MEMBER_STABILITY"],
  };
}

function blocked(input: EuC9R3ColumnInput, finding: string): EuC9R3ColumnResult {
  return finish(input, [], finding, "ORCHESTRATION_BLOCKED", false, null, null, null);
}

function unresolvedNode(capabilityId: string, role: EuC9R3NodeRole, status: EuC9R3ExecutionStatus, required: boolean, profileId: string, unresolved: readonly string[]): EuC9R3NodeResult {
  return blankNode({ capabilityId, nodeRole: role, executionStatus: status, requiredCheck: required, methodId: null, profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: unresolved, executedMethodIds: [] });
}

function momentValue(moment: EuC9R2SectionActions["majorMoment"]): number | null {
  return moment.status === "PRESENT" ? moment.signedNm : null;
}

export function orchestrateEuC9R3Column(input: EuC9R3ColumnInput): EuC9R3ColumnResult {
  if (
    EU_CONCRETE_PACK_CERTIFIED ||
    EU_C9_R3_NEW_ENGINEERING_FORMULA_IMPLEMENTED ||
    EU_C9_R3_C2_INVOKED_FOR_COLUMN ||
    EU_C9_R3_C6_C3_SIGN_CONVERSION_COUNT !== 1 ||
    EU_C9_R3_DOUBLE_AXIAL_SIGN_CONVERSION
  ) {
    return blocked(input, "AUTHORITY_BOUNDARY");
  }
  if (input.memberType !== EU_C9_R3_MEMBER_TYPE) return blocked(input, "INVALID_MEMBER_TYPE");
  if (input.prestressed || input.nonPrismatic || input.fireDesign || input.seismicDetailing || input.constructionStage || input.swayFrameAnalysis || input.generalPDelta) {
    return blocked(input, "COLUMN_SCOPE_EXCLUSION");
  }
  if (input.effectiveLengthInferenceRequested) return blocked(input, "EFFECTIVE_LENGTH_INFERENCE_REJECTED");
  if (input.supportConditionInferenceRequested) return blocked(input, "SUPPORT_CONDITION_INFERENCE_REJECTED");
  if (input.swayInferenceRequested) return blocked(input, "SWAY_INFERENCE_REJECTED");
  if (input.additionalImperfectionRequested) return blocked(input, "IMPERFECTION_INVENTION_REJECTED");
  if (input.slendernessNeglectRequested) return blocked(input, "SLENDERNESS_NEGLECT_REJECTED");
  if (input.useC7PhiAsPhiEf) return blocked(input, "C7_PHI_SUBSTITUTION_REJECTED");
  if (input.hardCodedCombinationFactors || input.ndpValueOnlyReuse) return blocked(input, "PROFILE_OR_NDP_REJECTED");
  if (!input.standardContext || input.standardContext.family !== "EN1992" || input.standardContext.generation !== EU_C9_R2_REFERENCE_GENERATION || !input.standardContext.profileId) {
    return blocked(input, "PROFILE_MISMATCH");
  }
  if (input.geometryShape != null && input.geometryShape !== "RECTANGULAR") {
    return finish(input, [unresolvedNode("GEOMETRY", "CONTEXT", "INVALID_INPUT", false, input.standardContext.profileId, ["RECTANGULAR_GEOMETRY"])], "INVALID_GEOMETRY", "MEMBER_UNDETERMINED", false, null, null, null);
  }
  const scope = input.declaredEvaluationScope;
  if (!scope || scope.length === 0) return finish(input, [], "MISSING_DECLARED_SCOPE", "MEMBER_UNDETERMINED", false, null, null, null);
  if (hasScope(scope, "SECTION_UNIAXIAL") && (hasScope(scope, "SECTION_BIAXIAL") || hasScope(scope, "MEMBER_SECOND_ORDER_UNIAXIAL"))) {
    return blocked(input, "MIXED_EVALUATION_MODES");
  }

  const profileId = input.standardContext.profileId;
  const nodes: EuC9R3NodeResult[] = [];
  let c6Intermediate: EuC9R3C6Intermediate | null = null;
  let sectionAxis: "MAJOR_AXIS" | "MINOR_AXIS" | null = null;
  let sectionResult: EuC9R3ColumnResult["sectionResult"] = null;
  const biaxialSecondOrder = hasScope(scope, "SECTION_BIAXIAL") && hasScope(scope, "MEMBER_SECOND_ORDER_UNIAXIAL");

  if (biaxialSecondOrder) {
    nodes.push(unresolvedNode("BIAXIAL_SECOND_ORDER", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  } else if (hasScope(scope, "SECTION_UNIAXIAL") || hasScope(scope, "SECTION_BIAXIAL")) {
    const mode = hasScope(scope, "SECTION_BIAXIAL") ? "SECTION_BIAXIAL" : "SECTION_UNIAXIAL";
    const capabilityId = mode === "SECTION_BIAXIAL" ? "D1E.EU.C4.BIAXIAL.PMM" : "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL";
    if (!input.materialRef || !input.reinforcementRef) {
      nodes.push(unresolvedNode(capabilityId, "CHECK", "UNDETERMINED", true, profileId, ["MATERIAL_OR_REINFORCEMENT"]));
    } else if (!input.actions) {
      nodes.push(unresolvedNode(capabilityId, "CHECK", "UNDETERMINED", true, profileId, ["SECTION_ACTIONS"]));
    } else if (input.geometryShape !== "RECTANGULAR") {
      nodes.push(unresolvedNode(capabilityId, "CHECK", "UNDETERMINED", true, profileId, ["RECTANGULAR_GEOMETRY"]));
    } else {
      const route = routeEuC9R3ColumnSection({ mode, actions: input.actions });
      sectionAxis = route.axis;
      if (route.state !== "ROUTED" || !route.methodId) {
        nodes.push(unresolvedNode(capabilityId, "CHECK", route.state === "INVALID_INPUT" ? "INVALID_INPUT" : "BLOCKED_SCOPE_MISMATCH", true, profileId, [route.reason ?? "SECTION_ROUTE"]));
      } else if (mode === "SECTION_UNIAXIAL") {
        const payload = input.c3;
        const active = route.axis === "MINOR_AXIS" ? input.actions.minorMoment : input.actions.majorMoment;
        const activeMoment = momentValue(active);
        const demandMoment = payload?.demand.moment.signed;
        const demandAxial = payload?.demand.axial.valueN;
        const momentAgrees = payload != null && (activeMoment === null ? demandMoment === 0 : demandMoment === activeMoment);
        const axialAgrees = payload != null && demandAxial === input.actions.axial.valueN;
        if (!payload || payload.methodId !== route.methodId || payload.axis !== route.axis || !momentAgrees || !axialAgrees) {
          nodes.push(unresolvedNode(capabilityId, "CHECK", "INVALID_INPUT", true, profileId, ["C3_INPUT_DOES_NOT_MATCH_ROUTE"]));
        } else {
          const solved = evaluateEuC3DemandPointCheck(payload);
          const status = mapCheck(solved.checkState);
          sectionResult = { methodId: payload.methodId, checkState: solved.checkState, numericalResult: solved.utilization };
          nodes.push(blankNode({
            capabilityId,
            nodeRole: "CHECK",
            executionStatus: status,
            requiredCheck: true,
            methodId: payload.methodId,
            profileId,
            numericalResult: solved.utilization,
            resultFingerprint: euC9R3Fingerprint({ check: solved.checkState, utilization: solved.utilization, axial: solved.demandAxialN, moment: solved.demandMomentNm }),
            unresolvedInputs: status === "UNDETERMINED" ? [solved.failReason ?? "C3_UNDETERMINED"] : [],
            executedMethodIds: [payload.methodId],
          }));
        }
      } else {
        const payload = input.c4;
        const majorMoment = momentValue(input.actions.majorMoment);
        const minorMoment = momentValue(input.actions.minorMoment);
        const agrees = payload != null
          && payload.methodId === route.methodId
          && payload.demand.moment.signed === majorMoment
          && payload.demandMyNm === minorMoment
          && payload.demand.axial.valueN === input.actions.axial.valueN;
        if (!agrees || !payload) {
          nodes.push(unresolvedNode(capabilityId, "CHECK", "INVALID_INPUT", true, profileId, ["C4_INPUT_DOES_NOT_MATCH_ROUTE"]));
        } else {
          const solved = evaluateEuC4DemandPointCheck(payload);
          const status = mapCheck(solved.checkState);
          sectionResult = { methodId: payload.methodId, checkState: solved.checkState, numericalResult: solved.resistanceRadiusNm };
          nodes.push(blankNode({
            capabilityId,
            nodeRole: "CHECK",
            executionStatus: status,
            requiredCheck: true,
            methodId: payload.methodId,
            profileId,
            numericalResult: solved.resistanceRadiusNm,
            resultFingerprint: euC9R3Fingerprint({ check: solved.checkState, radius: solved.resistanceRadiusNm, axial: solved.demandAxialN }),
            unresolvedInputs: status === "UNDETERMINED" ? [solved.failReason ?? "C4_UNDETERMINED"] : [],
            executedMethodIds: [payload.methodId],
          }));
        }
      }
    }
  } else if (hasScope(scope, "MEMBER_SECOND_ORDER_UNIAXIAL")) {
    const bothMoments = input.actions
      && euC9R2MomentPresence(input.actions.majorMoment) === "PRESENT"
      && euC9R2MomentPresence(input.actions.minorMoment) === "PRESENT";
    if (bothMoments) {
      nodes.push(unresolvedNode("BIAXIAL_SECOND_ORDER", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    } else if (!input.materialRef || !input.reinforcementRef) {
      nodes.push(unresolvedNode("D1E.EU.C6.C3_COMPOSITE", "CHECK", "UNDETERMINED", true, profileId, ["MATERIAL_OR_REINFORCEMENT"]));
    } else if (input.creepCoefficientPhi != null && (input.secondOrder == null || input.secondOrder.phiEf == null)) {
      nodes.push(unresolvedNode("D1E.EU.C6.C3_COMPOSITE", "CHECK", "UNDETERMINED", true, profileId, ["phiEf"]));
    } else if (!input.secondOrder) {
      nodes.push(unresolvedNode("D1E.EU.C6.C3_COMPOSITE", "CHECK", "UNDETERMINED", true, profileId, ["l0Mm", "m01Nmm", "m02Nmm", "phiEf", "esMPa"]));
    } else {
      const solved = evaluateEuC6NominalCurvature(input.secondOrder);
      c6Intermediate = intermediateOf(solved);
      sectionAxis = input.secondOrder.axis;
      const reason = solved.failReason;
      if (reason === "PROFILE_MISMATCH" || reason === "GENERATION_MISMATCH" || reason === "STALE_PROFILE" || reason === "AUTHORITY_BOUNDARY") {
        return blocked(input, reason);
      }
      let status: EuC9R3ExecutionStatus = "UNDETERMINED";
      let unresolved: string[] = [];
      if (reason === "MISSING_EFFECTIVE_LENGTH") unresolved = ["l0Mm"];
      else if (reason === "MISSING_END_MOMENTS") unresolved = ["m01Nmm", "m02Nmm"];
      else if (reason === "INVALID_END_MOMENT_ORDER") status = "INVALID_INPUT";
      else if (reason === "MISSING_OR_INVALID_CREEP") unresolved = ["phiEf"];
      else if (reason === "MISSING_OR_INVALID_ES") unresolved = ["esMPa"];
      else if (reason === "UNSUPPORTED_GEOMETRY" || reason === "INVALID_GEOMETRY" || reason === "C3_METHOD_MISMATCH" || reason === "UNSUPPORTED_AXIAL") status = "INVALID_INPUT";
      else if (reason) unresolved = [reason];
      else if (solved.c3CheckState == null) unresolved = ["C3_HANDOFF"];
      else status = mapCheck(solved.checkState);
      if (solved.c3MethodId && solved.c3CheckState) {
        sectionResult = { methodId: solved.c3MethodId, checkState: solved.c3CheckState, numericalResult: solved.c3Utilization };
      }
      const executed = solved.calculationState === "COMPLETE" ? [solved.methodId, ...(solved.c3MethodId ? [solved.c3MethodId] : [])] : [];
      nodes.push(blankNode({
        capabilityId: "D1E.EU.C6.C3_COMPOSITE",
        nodeRole: "CHECK",
        executionStatus: status,
        requiredCheck: true,
        methodId: EU_C6_R2_METHOD_ID,
        profileId: solved.profileId,
        numericalResult: solved.c3Utilization,
        resultFingerprint: solved.fingerprint || null,
        unresolvedInputs: unresolved,
        executedMethodIds: executed,
      }));
    }
  }

  if (hasScope(scope, "C6_C4_HANDOFF")) {
    nodes.push(unresolvedNode("C6_C4_HANDOFF", "CHECK", "BLOCKED_MISSING_AUTHORITY", true, profileId, []));
  }
  if (hasScope(scope, "C2_FLEXURE")) {
    nodes.push(unresolvedNode("D1E.EU.C2.FLEXURE.UNIAXIAL", "CHECK", "BLOCKED_SCOPE_MISMATCH", true, profileId, []));
  }
  if (hasScope(scope, "COLUMN_SHEAR")) {
    nodes.push(unresolvedNode("D1E.EU.C5.SHEAR", "CHECK", "BLOCKED_SCOPE_MISMATCH", true, profileId, []));
  }
  if (hasScope(scope, "PUNCHING")) {
    nodes.push(unresolvedNode("D1E.EU.C5.PUNCHING", "CHECK", "NOT_APPLICABLE", false, profileId, []));
  }
  if (hasScope(scope, "CRACK_WIDTH")) {
    nodes.push(unresolvedNode("D1E.EU.C7.SLS_REFERENCE", "CHECK", "BLOCKED_SCOPE_MISMATCH", true, profileId, []));
  }
  if (hasScope(scope, "TORSION")) {
    const torsion = input.torsion;
    if (!torsion || torsion.demand.torsion.status !== "TRANSPORTED" || !torsion.torsionRequest) {
      nodes.push(unresolvedNode("D1E.EU.C5.TORSION", "CHECK", "UNDETERMINED", true, profileId, ["EXPLICIT_TORSION_INPUT"]));
    } else {
      const solved = evaluateEuC5Torsion(torsion);
      nodes.push(blankNode({
        capabilityId: "D1E.EU.C5.TORSION",
        nodeRole: "CHECK",
        executionStatus: mapCheck(solved.checkState),
        requiredCheck: true,
        methodId: solved.methodId,
        profileId,
        numericalResult: solved.resistance?.value ?? null,
        resultFingerprint: solved.fingerprint,
        unresolvedInputs: [],
        executedMethodIds: solved.methodId ? [solved.methodId] : [],
      }));
    }
  }
  if (hasScope(scope, "LONG_TERM_CONTEXT")) {
    if (!input.longTerm) {
      nodes.push(unresolvedNode("D1E.EU.C7.EXPLICIT_LONG_TERM", "CONTEXT", "UNDETERMINED", false, profileId, ["EXPLICIT_CREEP_AND_SHRINKAGE"]));
    } else {
      const solved = evaluateEuC7LongTermState(input.longTerm);
      nodes.push(blankNode({
        capabilityId: "D1E.EU.C7.EXPLICIT_LONG_TERM",
        nodeRole: "CONTEXT",
        executionStatus: solved.accepted ? "AVAILABLE" : "UNDETERMINED",
        requiredCheck: false,
        methodId: solved.methodId,
        profileId,
        numericalResult: null,
        resultFingerprint: solved.resultFingerprint,
        unresolvedInputs: solved.accepted ? [] : [solved.failReason ?? "LONG_TERM_INPUT"],
        executedMethodIds: solved.accepted ? [solved.methodId] : [],
      }));
    }
  }
  if (hasScope(scope, "COVER_REQUIREMENT")) {
    if (!input.cover) {
      nodes.push(unresolvedNode("D1E.EU.C8.COVER_ASSEMBLY", "CALCULATION", "UNDETERMINED", false, profileId, ["COVER_INPUT"]));
    } else {
      const solved = evaluateEuC8CoverAssembly(input.cover);
      nodes.push(blankNode({
        capabilityId: "D1E.EU.C8.COVER_ASSEMBLY",
        nodeRole: "CALCULATION",
        executionStatus: solved.calculationState === "COVER_REQUIREMENT_CALCULATED" ? "CALCULATED" : "UNDETERMINED",
        requiredCheck: false,
        methodId: solved.methodId,
        profileId: solved.profileId,
        numericalResult: solved.nominalCoverMm,
        resultFingerprint: solved.inputFingerprint,
        unresolvedInputs: [],
        executedMethodIds: solved.calculationState === "COVER_REQUIREMENT_CALCULATED" ? [solved.methodId] : [],
      }));
    }
  }
  if (hasScope(scope, "PROVIDED_COVER_COMPLIANCE")) {
    nodes.push(unresolvedNode("PROVIDED_COVER_COMPLIANCE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "REINFORCEMENT_SPACING")) {
    const spacing = input.spacing;
    const diameterA = spacing?.barA?.diameter?.value;
    const diameterB = spacing?.barB?.diameter?.value;
    if (spacing && diameterA != null && diameterB != null && diameterA !== diameterB) {
      nodes.push(unresolvedNode("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    } else if (!spacing) {
      nodes.push(unresolvedNode("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "UNDETERMINED", true, profileId, ["SPACING_INPUT"]));
    } else {
      const solved = evaluateEuC8MinClearSpacing(spacing);
      const status = solved.failReason === "UNEQUAL_BAR_DIAMETERS" ? "NOT_IMPLEMENTED" : solved.ok ? mapCheck(solved.checkState) : "UNDETERMINED";
      nodes.push(blankNode({
        capabilityId: "D1E.EU.C8.MIN_CLEAR_SPACING",
        nodeRole: "CHECK",
        executionStatus: status,
        requiredCheck: true,
        methodId: solved.methodId,
        profileId: solved.profileId,
        numericalResult: solved.measuredClearSpacingMm,
        resultFingerprint: solved.resultFingerprint,
        unresolvedInputs: solved.ok ? [] : [solved.failReason ?? "SPACING_INPUT"],
        executedMethodIds: solved.ok ? [solved.methodId] : [],
      }));
    }
  }
  if (hasScope(scope, "BASIC_ANCHORAGE")) {
    const anchorage = input.anchorage;
    if (!anchorage) {
      nodes.push(unresolvedNode("D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", "CALCULATION", "UNDETERMINED", false, profileId, ["ANCHORAGE_INPUT"]));
    } else if (anchorage.forceState === "COMPRESSION") {
      nodes.push(unresolvedNode("COMPRESSION_ANCHORAGE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    } else {
      const solved = evaluateEuC8BasicRequiredAnchorage(anchorage);
      const checkMode = anchorage.checkRequested === true;
      const status: EuC9R3ExecutionStatus = !solved.ok ? "UNDETERMINED" : checkMode ? mapCheck(solved.checkState ?? "UNDETERMINED") : "CALCULATED";
      nodes.push(blankNode({
        capabilityId: "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE",
        nodeRole: checkMode ? "CHECK" : "CALCULATION",
        executionStatus: status,
        requiredCheck: checkMode,
        methodId: solved.methodId,
        profileId: solved.profileId,
        numericalResult: solved.basicRequiredAnchorageLengthMm,
        resultFingerprint: solved.resultFingerprint,
        unresolvedInputs: solved.ok ? [] : [solved.failReason ?? "ANCHORAGE_INPUT"],
        executedMethodIds: solved.ok ? [solved.methodId] : [],
      }));
    }
  }
  if (hasScope(scope, "COMPRESSION_ANCHORAGE")) {
    nodes.push(unresolvedNode("COMPRESSION_ANCHORAGE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "DESIGN_ANCHORAGE")) {
    nodes.push(unresolvedNode("DESIGN_ANCHORAGE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "LAPS")) {
    nodes.push(unresolvedNode("LAPS", "CHECK", "DEFERRED", true, profileId, []));
  }

  const incomplete = nodes.some((item) => ["NOT_IMPLEMENTED", "DEFERRED", "BLOCKED_SCOPE_MISMATCH", "BLOCKED_DEPENDENCY", "BLOCKED_MISSING_AUTHORITY", "UNDETERMINED", "INVALID_INPUT", "NOT_SATISFIED"].includes(item.executionStatus));
  const success = nodes.length > 0 && nodes.every((item) => CLOSED_STATUSES.includes(item.executionStatus as (typeof CLOSED_STATUSES)[number]));
  return finish(input, nodes, null, null, !incomplete && success, c6Intermediate, sectionAxis, sectionResult);
}

export const EU_C9_R3_ORCHESTRATOR_REGISTRY = [{
  orchestratorId: EU_C9_R3_ORCHESTRATOR_ID,
  version: EU_C9_R3_ORCHESTRATOR_VERSION,
  memberType: EU_C9_R3_MEMBER_TYPE,
  scope: EU_C9_R3_COLUMN_SCOPE,
  evaluationModes: EU_C9_R3_COLUMN_MODE_CONTRACT,
  c3Routing: EU_C9_R3_UNIAXIAL_SECTION_ROUTING,
  c4Routing: EU_C9_R3_BIAXIAL_SECTION_ROUTING,
  c6C3Composite: EU_C9_R3_C6_C3_COMPOSITE_NODE_CONTRACT,
  c6Restrictions: EU_C9_R3_C6_APPLICABILITY_CONTRACT,
  effectiveLengthPolicy: EU_C9_R3_EFFECTIVE_LENGTH_ROUTE,
  imperfectionPolicy: "SUPPLIED_FIRST_ORDER_MOMENTS_ALREADY_INCLUDE_IMPERFECTION",
  phiEfPolicy: EU_C9_R3_PHIEF_ROUTE,
  biaxialSecondOrder: "NOT_IMPLEMENTED",
  columnShear: "BLOCKED_SCOPE_MISMATCH",
  columnCrackWidth: "BLOCKED_SCOPE_MISMATCH",
  aggregation: "NOT_SATISFIED_THEN_UNDETERMINED_OR_INVALID_INPUT_THEN_INCOMPLETE_FINDINGS_RETAINED",
  fingerprintVersion: EU_C9_R3_ORCHESTRATOR_VERSION,
  validationState: "NUMERICALLY_VALIDATED",
  engineerValidationState: EU_C9_R3_ENGINEER_VALIDATION_STATE,
  conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  fullStandardCoverage: EU_C9_R3_FULL_STANDARD_COVERAGE,
  productClaim: EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  subClaim: EU_C9_R3_PRODUCT_SUBCLAIM,
  profileContract: EU_C9_PROFILE_COMPATIBILITY_CONTRACT,
}] as const;

export const EU_C9_ORCHESTRATOR_REGISTRY = [...EU_C9_R2_ORCHESTRATOR_REGISTRY, ...EU_C9_R3_ORCHESTRATOR_REGISTRY] as const;
