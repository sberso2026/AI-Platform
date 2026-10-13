/**
 * C9-R4 bounded solid RC slab orchestrator.
 * A strip or punching check is routed to an existing C2, C5, C7, or C8 method.
 * This module does not analyse a slab, distribute moments, or invent actions.
 */

import { createHash } from "node:crypto";
import {
  EU_C5_PUNCHING_INTERIOR_METHOD_ID,
  EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
} from "@rtb/types";
import { evaluateEuC5Punching, evaluateEuC5Shear, type EuC5EvaluateInput } from "../eu-c5/evaluate";
import { evaluateEuC7CrackWidth, type EuC7CrackWidthInput } from "../eu-c7/evaluate";
import { evaluateEuC7LongTermState, type EuC7LongTermInput } from "../eu-c7/long-term";
import { evaluateEuC8BasicRequiredAnchorage, type EuC8BasicAnchorageInput } from "../eu-c8/anchorage-evaluate";
import { evaluateEuC8CoverAssembly, type EuC8CoverAssemblyInput } from "../eu-c8/evaluate";
import { evaluateEuC8MinClearSpacing, type EuC8MinClearSpacingInput } from "../eu-c8/spacing-evaluate";
import { evaluateEuConcreteFlexure, type EuConcreteFlexureInput } from "../eu-flexure/evaluate";
import {
  EU_C9_C2_MEMBER_APPLICABILITY,
  EU_C9_C3_MEMBER_APPLICABILITY,
  EU_C9_C4_MEMBER_APPLICABILITY,
  EU_C9_C5_PUNCHING_MEMBER_APPLICABILITY,
  EU_C9_C5_SHEAR_MEMBER_APPLICABILITY,
  EU_C9_C5_TORSION_MEMBER_APPLICABILITY,
  EU_C9_MEMBER_CAPABILITY_MATRIX,
  EU_C9_PROFILE_COMPATIBILITY_CONTRACT,
  EU_C9_WALL_ORCHESTRATION_FEASIBILITY,
  euC9ExecutionDagHasCycle,
} from "./foundation";
import { EU_C9_R2_REFERENCE_GENERATION, euC9R2AxialPresence, euC9R2MomentPresence, type EuC9R2SectionActions } from "./beam";
import { EU_C9_ORCHESTRATOR_REGISTRY as EU_C9_REGISTRY_THROUGH_R3 } from "./column";

export const EU_C9_R4_ORCHESTRATOR_ID = "EU_RC_SOLID_SLAB_ORCHESTRATION_EN1992_REFERENCE" as const;
export const EU_C9_R4_ORCHESTRATOR_VERSION = "C9-R4" as const;
export const EU_C9_R4_CANONICAL_SLAB_MEMBER_TYPE = "SLAB" as const;
export const EU_C9_R4_SLAB_SCOPE = "ORDINARY_NON_PRESTRESSED_SOLID_REINFORCED_CONCRETE_SLAB" as const;
export const EU_C9_R4_SLAB_EXCLUSIONS = "RIBBED_WAFFLE_VOIDED_PRESTRESSED_FLAT_SLAB_GLOBAL_ANALYSIS_TRANSFER_DEEP_D_REGION_SHELL_MEMBRANE_TWO_WAY_ANALYSIS_COLUMN_STRIP_ALLOCATION_SUPPORT_REACTION_YIELD_LINE_FIRE_SEISMIC_DIAPHRAGM_CONSTRUCTION_STAGE_NONLINEAR_DURABILITY_DEFLECTION_DESIGN_ANCHORAGE_LAPS" as const;
export const EU_C9_R4_R1_SLAB_CAPABILITY_MATRIX_RECHECK = EU_C9_MEMBER_CAPABILITY_MATRIX.SOLID_SLAB;
export const EU_C9_R4_SLAB_MODE_CONTRACT_DEFINED = true as const;
export const EU_C9_R4_SLAB_MODE_CONTRACT = "EXPLICIT_STRIP_FLEXURE_ONE_WAY_SHEAR_PUNCHING_CRACK_WIDTH_LONG_TERM_CONTEXT_COVER_SPACING_BASIC_ANCHORAGE" as const;
export const EU_C9_R4_SECTION_STRIP_CHECK_EQUALS_SLAB_ANALYSIS = false as const;
export const EU_C9_R4_PUNCHING_CHECK_EQUALS_GLOBAL_SLAB_ANALYSIS = false as const;
export const EU_C9_R4_ORCHESTRATION_GENERATES_SLAB_ACTIONS = false as const;
export const EU_C9_R4_CAN_INVENT_MISSING_METHODS = false as const;
export const EU_C9_R4_CAN_EXPAND_METHOD_APPLICABILITY = false as const;
export const EU_C9_R4_CAN_SUBSTITUTE_DEFERRED_METHODS = false as const;
export const EU_C9_R4_CAN_OVERRIDE_FAIL_CLOSED_RESULT = false as const;
export const EU_C9_R4_NEW_ENGINEERING_FORMULA_IMPLEMENTED = false as const;
export const EU_C9_R4_STRIP_WIDTH_ROUTE = "EXPLICIT_GOVERNED_INPUT_OR_CANONICAL_MODEL_STATE" as const;
export const EU_C9_R4_STRIP_WIDTH_INVENTED = false as const;
export const AI_STRIP_WIDTH_AUTHORITY = false as const;
export const EU_C9_R4_STRIP_ORIENTATION_GUESSED = false as const;
export const EU_C9_R4_FLEXURAL_ACTION_SOURCE_GOVERNED = true as const;
export const EU_C9_R4_FLEXURAL_ACTION_GENERATED_BY_ORCHESTRATOR = false as const;
export const EU_C9_R4_C2_SLAB_APPLICABILITY = EU_C9_C2_MEMBER_APPLICABILITY;
export const EU_C9_R4_STRIP_FLEXURE_ROUTING = "C2_WHEN_EXPLICIT_STRIP_REDUCES_TO_RECTANGULAR_PURE_FLEXURE" as const;
export const EU_C9_R4_C4_SLAB_APPLICABILITY = `${EU_C9_C4_MEMBER_APPLICABILITY}_NOT_TWO_WAY_SLAB_SOLVER` as const;
export const EU_C9_R4_TWO_WAY_SLAB_BENDING_AUTOMATICALLY_ROUTED_TO_C4 = false as const;
export const EU_C9_R4_C3_SLAB_APPLICABILITY = `${EU_C9_C3_MEMBER_APPLICABILITY}_NOT_SLAB_MEMBRANE_ANALYSIS` as const;
export const EU_C9_R4_GENERAL_MEMBRANE_ACTION_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R4_C5_ONE_WAY_SHEAR_APPLICABILITY = EU_C9_C5_SHEAR_MEMBER_APPLICABILITY;
export const EU_C9_R4_SHEAR_ACTION_SOURCE_GOVERNED = true as const;
export const EU_C9_R4_SUPPORT_REACTION_INFERRED = false as const;
export const EU_C9_R4_SHEAR_DEMAND_GENERATED_FROM_LOADS = false as const;
export const EU_C9_R4_C5_SHEAR_EQUALS_GENERAL_SLAB_SHEAR_DESIGN = false as const;
export const EU_C9_R4_PUNCHING_ROUTING_CONTRACT = "DECLARED_PUNCHING_INTERIOR_RECTANGULAR_EXPLICIT_FORCE_EXPLICIT_SUPPORT_EXISTING_C5_METHOD" as const;
export const EU_C9_R4_PUNCHING_METHOD_APPLICABILITY = EU_C9_C5_PUNCHING_MEMBER_APPLICABILITY;
export const EU_C9_R4_PUNCHING_DEMAND_ROUTE = "EXPLICIT_GOVERNED_INPUT_OR_EXISTING_GOVERNED_RESULT" as const;
export const EU_C9_R4_PUNCHING_DEMAND_INVENTED = false as const;
export const EU_C9_R4_EXISTING_PUNCHING_GEOMETRY_REUSED = true as const;
export const PARALLEL_PUNCHING_PERIMETER_ENGINE_CREATED = false as const;
export const EU_C9_R4_PUNCHING_SUPPORT_GEOMETRY_CONTRACT = "EXPLICIT_SUPPORT_POSITION_AND_OPENING_STATE_NO_INFERENCE" as const;
export const EU_C9_R4_PUNCHING_EQUALS_ONE_WAY_SHEAR = false as const;
export const EU_C9_R4_C5_TORSION_SLAB_APPLICABILITY = `${EU_C9_C5_TORSION_MEMBER_APPLICABILITY}_NOT_INVOKED_FOR_SLAB_STRIP` as const;
export const EU_C9_R4_C6_SLAB_STATE = "NOT_APPLICABLE" as const;
export const EU_C9_R4_C6_INVOKED_FOR_SLAB = false as const;
export const EU_C9_R4_CRACK_WIDTH_ROUTING_CONTRACT = "SOLID_SLAB_QUASI_PERMANENT_EXPLICIT_SIGMAS_FCTEFF_ECM_ES_BAR_COVER_AS" as const;
export const EU_C9_R4_C7_SLS_EQUALS_COMPLETE_SLAB_SERVICEABILITY = false as const;
export const EU_C9_R4_SLAB_DEFLECTION_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R4_DEFLECTION_REQUEST_CAN_PASS = false as const;
export const EU_C9_R4_LONG_TERM_NODE_ROLE = "CONTEXT" as const;
export const EU_C9_R4_LONG_TERM_CONTEXT_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R4_LONG_TERM_STATE_EQUALS_DEFLECTION = false as const;
export const EU_C9_R4_CALCULATED_CREEP_AVAILABLE = false as const;
export const EU_C9_R4_CALCULATED_SHRINKAGE_AVAILABLE = false as const;
export const EU_C9_R4_COVER_NODE_ROLE = "CALCULATION" as const;
export const EU_C9_R4_COVER_ASSEMBLY_EQUALS_PROVIDED_COVER_COMPLIANCE = false as const;
export const EU_C9_R4_DURABILITY_COVER_LOOKUP_AVAILABLE = false as const;
export const EU_C9_R4_PROVIDED_COVER_COMPLIANCE_AVAILABLE = false as const;
export const EU_C9_R4_SPACING_ROUTING_CONTRACT = "EQUAL_DIAMETER_EXPLICIT_BAR_PAIR_SURFACE_GEOMETRY_AGGREGATE_NDP_COEFFICIENT_AGGREGATE_ALLOWANCE" as const;
export const EU_C9_R4_ORTHOGONAL_BAR_CROSSING_EQUALS_PARALLEL_CLEAR_SPACING = false as const;
export const EU_C9_R4_BAR_LAYER_INFERRED_FROM_COORDINATE_ONLY = false as const;
export const EU_C9_R4_BASIC_ANCHORAGE_ROUTING_CONTRACT = "STRAIGHT_TENSION_BAR_EXPLICIT_SIGMASD_EXPLICIT_FBD" as const;
export const EU_C9_R4_BASIC_ANCHORAGE_CALCULATION_EQUALS_COMPLIANCE = false as const;
export const EU_C9_R4_BASIC_ANCHORAGE_CHECK_EQUALS_FULL_DESIGN_ANCHORAGE = false as const;
export const EU_C9_R4_DESIGN_ANCHORAGE_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R4_LAP_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R4_LAP_REQUEST_CAN_PASS = false as const;
export const EU_C9_R4_NODE_ROLE_TAXONOMY_REUSED = true as const;
export const EU_C9_R4_CHECK_NODE_CAPABILITY_IDS = [
  "D1E.EU.C2.FLEXURE.UNIAXIAL",
  "D1E.EU.C5.SHEAR",
  "D1E.EU.C5.PUNCHING",
  "D1E.EU.C7.SLS_REFERENCE",
  "D1E.EU.C8.MIN_CLEAR_SPACING",
  "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE",
] as const;
export const EU_C9_R4_CALCULATION_NODE_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R4_CONTEXT_NODE_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R4_EMPTY_REQUIRED_CHECK_SET_CAN_PASS = false as const;
export const EU_C9_R4_DECLARED_SCOPE_CONTRACT = "EXPLICIT_DECLARED_SLAB_EVALUATION_SCOPE" as const;
export const EU_C9_R4_REQUIRED_CHECK_SELECTION_DETERMINISTIC = true as const;
export const AI_REQUIRED_CHECK_SELECTION_AUTHORITY = false as const;
export const EU_C9_R4_ACTION_EFFECT_SOURCE_GOVERNED = true as const;
export const EU_C9_R4_ACTION_EFFECT_INVENTED = false as const;
export const AI_ACTION_EFFECT_AUTHORITY = false as const;
export const D1C_COMBINATION_ENGINE_REUSED = true as const;
export const PARALLEL_C9_R4_COMBINATION_ENGINE_CREATED = false as const;
export const EU_C9_R4_SLAB_ULS_EXECUTION_GRAPH = "C2_STRIP_FLEXURE_WHEN_APPLICABLE_C5_ONE_WAY_SHEAR_WHEN_APPLICABLE_C5_PUNCHING_WHEN_APPLICABLE_NO_C6" as const;
export const EU_C9_R4_SLAB_SLS_EXECUTION_GRAPH = "C7_CRACK_WIDTH_CHECK_C7_LONG_TERM_CONTEXT_DEFLECTION_DEFERRED" as const;
export const EU_C9_R4_SLAB_DETAILING_EXECUTION_GRAPH = "COVER_CALCULATION_SPACING_CHECK_BASIC_ANCHORAGE_CALCULATION_OR_CHECK_DESIGN_ANCHORAGE_NOT_IMPLEMENTED_LAPS_DEFERRED" as const;
export const EU_C9_R4_PROFILE_COMPATIBILITY_REUSED = true as const;
export const EU_C9_R4_PROFILE_MISMATCH_FAILS_CLOSED = true as const;
export const EU_C9_R4_NDP_SEMANTIC_IDENTITY_REQUIRED = true as const;
export const EU_C9_R4_NDP_VALUE_ONLY_REUSE_ALLOWED = false as const;
export const C1_RULES_REUSED_FOR_C9_R4 = true as const;
export const PARALLEL_C9_R4_MATERIAL_MODEL_CREATED = false as const;
export const D1E_SECTION_GEOMETRY_REUSED_FOR_SLAB = true as const;
export const D1E_REINFORCEMENT_GEOMETRY_REUSED_FOR_SLAB = true as const;
export const PARALLEL_SLAB_SECTION_GEOMETRY_CREATED = false as const;
export const EU_C9_R4_GLOBAL_SLAB_GEOMETRY_EQUALS_SECTION_STRIP_GEOMETRY = false as const;
export const EU_C9_R4_UNGOVERNED_RESULT_SUBSTITUTION_ALLOWED = false as const;
export const EU_C9_R4_FAILURE_PROPAGATION = "PASS" as const;
export const EU_C9_R4_ONLY_REQUIRED_CHECK_NODES_AGGREGATED = true as const;
export const EU_C9_R4_MEMBER_AGGREGATION_IMPLEMENTED = true as const;
export const EU_C9_R4_MULTIPLE_MEMBER_FINDINGS_PRESERVED = true as const;
export const EU_C9_R4_AGGREGATION_PRECEDENCE = "NOT_SATISFIED_THEN_UNDETERMINED_OR_INVALID_INPUT_THEN_INCOMPLETE_FINDINGS_RETAINED" as const;
export const EU_C9_R4_SLAB_RESULT_CONTRACT_GOVERNED = true as const;
export const EU_C9_R4_FULL_STANDARD_COVERAGE = false as const;
export const EU_C9_R4_DECLARED_SCOPE_COMPLETENESS_SEMANTICS = "PASS" as const;
export const EU_C9_R4_SLAB_RESULT_EQUALS_COMPLETE_EN1992_SLAB_DESIGN = false as const;
export const EU_C9_R4_SLAB_RESULT_EQUALS_STRUCTURAL_ANALYSIS = false as const;
export const EU_C9_R4_SLAB_RESULT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const EU_C9_R4_SLAB_RESULT_EQUALS_CERTIFICATION = false as const;
export const EU_C9_R4_MEMBER_PROVENANCE_GRAPH = "PASS" as const;
export const EU_C9_R4_MEMBER_FINGERPRINT_COMPLETE = true as const;
export const EU_C9_R4_DEPENDENCY_INVALIDATION = true as const;
export const STALE_C9_R4_SLAB_RESULT_REUSE_ALLOWED = false as const;
export const EU_C9_R4_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const EU_C9_R4_REINFORCEMENT_AUTODESIGN = false as const;
export const EU_C9_R4_SLAB_THICKNESS_AUTODESIGN = false as const;
export const EU_C9_R4_STRIP_AUTOGENERATION = false as const;
export const EU_C9_R4_AUTOMATIC_BAR_REPOSITIONING = false as const;
export const EU_C9_R4_AUTOMATIC_ANCHORAGE_EXTENSION = false as const;
export const EU_C9_R4_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_BYPASS_REQUIRED_SLAB_CHECKS = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_SLAB_ACTION_EFFECTS = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_STRIP_WIDTH = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_PUNCHING_DEMAND = false as const;
export const EU_C9_R4_OPTIMIZATION_ACCEPTS_INCOMPLETE_AS_FEASIBLE = false as const;
export const EU_C9_R4_OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const EU_C9_R4_PARETO_ACCEPTS_FAILED_SLAB_AS_FEASIBLE = false as const;
export const EU_C9_R4_IMPLEMENTED_SLAB_ORCHESTRATOR_COUNT = 1 as const;
export const EU_C9_R4_NUMERICALLY_VALIDATED_SLAB_ORCHESTRATOR_COUNT = 1 as const;
export const EU_C9_R4_ENGINEER_VALIDATED_SLAB_ORCHESTRATOR_COUNT = 0 as const;
export const EU_C9_R4_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const NUMERICAL_SLAB_ORCHESTRATION_VALIDATION_EQUALS_ENGINEER_VALIDATION = false as const;
export const C9_SLAB_ORCHESTRATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C9_R4_PRODUCT_SUBCLAIM = "BOUNDED_RC_SOLID_SLAB_ORCHESTRATION_REFERENCE_CAPABILITY" as const;
export const EU_C9_R4_WALL_NEXT_FEASIBILITY = EU_C9_WALL_ORCHESTRATION_FEASIBILITY;
export const PARALLEL_SOLID_SLAB_DOMAIN_OBJECT_CREATED = false as const;
export const EU_C9_R4_VALIDATION_DEBT_REDUCED_ITEMS = [
  "C9_SOLID_SLAB_RUNTIME_ORCHESTRATOR",
  "C9_SOLID_SLAB_ROUTING_VALIDATION",
  "C9_SOLID_SLAB_AGGREGATION_VALIDATION",
] as const;
export const EU_C9_R4_VALIDATION_DEBT_REMAINING_ITEMS = [
  "TWO_WAY_SLAB_ANALYSIS",
  "SLAB_DEFLECTION",
  "CALCULATED_CREEP",
  "CALCULATED_SHRINKAGE",
  "DURABILITY_COVER_LOOKUP",
  "PROVIDED_COVER_COMPLIANCE",
  "UNEQUAL_DIAMETER_SPACING",
  "DESIGN_BOND_STRENGTH_DERIVATION",
  "DESIGN_ANCHORAGE",
  "LAPS",
  "UNSUPPORTED_PUNCHING_GEOMETRIES",
  "GENERAL_STRUCTURAL_ANALYSIS",
  "ENGINEER_VALIDATION",
  "NATIONAL_PROFILE_VALIDATION",
  "FORMAL_CONFORMANCE",
] as const;

export const EU_C9_R4_DECLARED_SCOPE_IDS = [
  "STRIP_FLEXURE",
  "ONE_WAY_SHEAR",
  "PUNCHING",
  "SLS_CRACK_WIDTH",
  "LONG_TERM_CONTEXT",
  "COVER_REQUIREMENT",
  "REINFORCEMENT_SPACING",
  "BASIC_ANCHORAGE",
  "TWO_WAY_ANALYSIS",
  "MEMBRANE",
  "C4_TWO_WAY",
  "C6_SECOND_ORDER",
  "TORSION",
  "DEFLECTION",
  "CALCULATED_CREEP",
  "CALCULATED_SHRINKAGE",
  "PROVIDED_COVER_COMPLIANCE",
  "DESIGN_ANCHORAGE",
  "LAPS",
] as const;

export type EuC9R4DeclaredScope = (typeof EU_C9_R4_DECLARED_SCOPE_IDS)[number];
export type EuC9R4StripOrientation = "X" | "Y" | "MAJOR" | "MINOR";
export type EuC9R4NodeRole = "CHECK" | "CALCULATION" | "CONTEXT";
export type EuC9R4ExecutionStatus =
  | "SATISFIED"
  | "NOT_SATISFIED"
  | "UNDETERMINED"
  | "NOT_APPLICABLE"
  | "NOT_IMPLEMENTED"
  | "DEFERRED"
  | "BLOCKED_SCOPE_MISMATCH"
  | "BLOCKED_DEPENDENCY"
  | "INVALID_INPUT"
  | "CALCULATED"
  | "AVAILABLE";
export type EuC9R4OverallState =
  | "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE"
  | "MEMBER_NOT_SATISFIED"
  | "MEMBER_INCOMPLETE"
  | "MEMBER_UNDETERMINED"
  | "ORCHESTRATION_BLOCKED";

export type EuC9R4Strip = {
  stripId: string;
  orientation: EuC9R4StripOrientation;
  widthMm: number;
};

export type EuC9R4StripRoute = {
  state: "ROUTED" | "UNDETERMINED" | "INVALID_INPUT" | "NOT_IMPLEMENTED";
  methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR" | "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR" | null;
  axis: "MAJOR_AXIS" | "MINOR_AXIS" | null;
  executesC2: boolean;
  executesC3: false;
  executesC4: false;
  reason: string | null;
};

export type EuC9R4NodeResult = {
  capabilityId: string;
  nodeRole: EuC9R4NodeRole;
  executionStatus: EuC9R4ExecutionStatus;
  requiredCheck: boolean;
  methodId: string | null;
  profileId: string | null;
  numericalResult: number | null;
  resultFingerprint: string | null;
  unresolvedInputs: readonly string[];
  executedMethodIds: readonly string[];
};

export type EuC9R4SlabInput = {
  memberId: string;
  memberType: string;
  slabForm?: "SOLID" | "RIBBED" | "WAFFLE" | "VOIDED" | "TRANSFER" | "DEEP" | null;
  declaredEvaluationScope?: readonly EuC9R4DeclaredScope[] | null;
  standardContext?: { family: string; generation: string; profileId: string } | null;
  geometryShape?: "RECTANGULAR" | "CIRCULAR" | "OTHER" | null;
  materialRef?: string | null;
  reinforcementRef?: string | null;
  strip?: EuC9R4Strip | null;
  globalSlabWidthMm?: number | null;
  actions?: EuC9R2SectionActions | null;
  combinationId?: string | null;
  flexure?: EuConcreteFlexureInput | null;
  shear?: EuC5EvaluateInput | null;
  punching?: EuC5EvaluateInput | null;
  crackWidth?: EuC7CrackWidthInput | null;
  longTerm?: EuC7LongTermInput | null;
  cover?: EuC8CoverAssemblyInput | null;
  spacing?: EuC8MinClearSpacingInput | null;
  spacingLayerA?: string | null;
  spacingLayerB?: string | null;
  orthogonalBarCrossing?: boolean;
  anchorage?: EuC8BasicAnchorageInput | null;
  supportId?: string | null;
  prestressed?: boolean;
  ribbed?: boolean;
  waffle?: boolean;
  voided?: boolean;
  transferSlab?: boolean;
  deepSlab?: boolean;
  dRegion?: boolean;
  fireDesign?: boolean;
  seismicDiaphragm?: boolean;
  constructionStage?: boolean;
  nonlinearAnalysis?: boolean;
  shellAction?: boolean;
  twoWayAnalysisRequested?: boolean;
  generateActions?: boolean;
  inferSupportReaction?: boolean;
  generateShearFromLoads?: boolean;
  inventPunchingDemand?: boolean;
  inventStripWidth?: boolean;
  reinforcementAutodesign?: boolean;
  thicknessAutodesign?: boolean;
  stripAutogeneration?: boolean;
  automaticBarRepositioning?: boolean;
  automaticAnchorageExtension?: boolean;
  hardCodedCombinationFactors?: boolean;
  ndpValueOnlyReuse?: boolean;
  priorResultFingerprint?: string | null;
};

export type EuC9R4SlabResult = {
  orchestratorId: typeof EU_C9_R4_ORCHESTRATOR_ID;
  orchestratorVersion: typeof EU_C9_R4_ORCHESTRATOR_VERSION;
  memberId: string;
  memberType: string;
  declaredEvaluationScope: readonly EuC9R4DeclaredScope[];
  stripId: string | null;
  stripOrientation: EuC9R4StripOrientation | null;
  stripWidthMm: number | null;
  supportId: string | null;
  standardContext: EuC9R4SlabInput["standardContext"];
  executedCapabilityIds: readonly string[];
  nodes: readonly EuC9R4NodeResult[];
  checkNodes: readonly EuC9R4NodeResult[];
  calculationNodes: readonly EuC9R4NodeResult[];
  contextNodes: readonly EuC9R4NodeResult[];
  notApplicableCapabilities: readonly string[];
  deferredCapabilities: readonly string[];
  unavailableRelevantCapabilities: readonly string[];
  unresolvedInputs: readonly string[];
  perCapabilityResults: readonly EuC9R4NodeResult[];
  failedChecks: readonly string[];
  blockingFindings: readonly string[];
  overallState: EuC9R4OverallState;
  evaluationCompleteForDeclaredScope: boolean;
  fullStandardCoverage: false;
  engineerValidationState: typeof EU_C9_R4_ENGINEER_VALIDATION_STATE;
  conformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  productClaim: typeof EU_CONCRETE_PRODUCT_CLAIM_LEVEL;
  memberFingerprint: string;
  provenanceGraph: readonly EuC9R4NodeResult[];
  staleReuseRejected: boolean;
  warnings: readonly string[];
};

const CLOSED_STATUSES = ["SATISFIED", "CALCULATED", "AVAILABLE", "NOT_APPLICABLE"] as const;

export const EU_C9_R4_SLAB_EXECUTION_DAG = [
  { id: "CONTEXT_PROFILE", upstream: [] },
  { id: "GEOMETRY", upstream: ["CONTEXT_PROFILE"] },
  { id: "STRIP", upstream: ["GEOMETRY"] },
  { id: "ACTIONS", upstream: ["CONTEXT_PROFILE"] },
  { id: "STRIP_FLEXURE", upstream: ["STRIP", "ACTIONS"] },
  { id: "ONE_WAY_SHEAR", upstream: ["GEOMETRY", "ACTIONS"] },
  { id: "PUNCHING", upstream: ["GEOMETRY", "ACTIONS"] },
  { id: "CRACK_WIDTH", upstream: ["GEOMETRY", "ACTIONS"] },
  { id: "LONG_TERM", upstream: ["CONTEXT_PROFILE"] },
  { id: "COVER", upstream: ["GEOMETRY"] },
  { id: "SPACING", upstream: ["GEOMETRY"] },
  { id: "ANCHORAGE", upstream: ["GEOMETRY"] },
  { id: "AGGREGATION", upstream: ["STRIP_FLEXURE", "ONE_WAY_SHEAR", "PUNCHING", "CRACK_WIDTH", "LONG_TERM", "COVER", "SPACING", "ANCHORAGE"] },
] as const;

export function euC9R4SlabExecutionDagHasCycle(): boolean {
  const upstream = new Map<string, readonly string[]>(EU_C9_R4_SLAB_EXECUTION_DAG.map((node) => [node.id, node.upstream]));
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
  return EU_C9_R4_SLAB_EXECUTION_DAG.some((node) => walk(node.id)) || euC9ExecutionDagHasCycle();
}

export const EU_C9_R4_SLAB_EXECUTION_DAG_IMPLEMENTED = true as const;
export const EU_C9_R4_SLAB_EXECUTION_DAG_ACYCLIC = true as const;
export const EU_C9_R4_CIRCULAR_ENGINEERING_DEPENDENCY = false as const;

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stable(item)).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
}

export function euC9R4Fingerprint(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

function hasScope(scope: readonly EuC9R4DeclaredScope[], id: EuC9R4DeclaredScope): boolean {
  return scope.includes(id);
}

function mapCheck(state: string): EuC9R4ExecutionStatus {
  if (state === "CHECK_SATISFIED" || state === "SATISFIED") return "SATISFIED";
  if (state === "CHECK_NOT_SATISFIED" || state === "NOT_SATISFIED") return "NOT_SATISFIED";
  return "UNDETERMINED";
}

function node(partial: EuC9R4NodeResult): EuC9R4NodeResult {
  return partial;
}

function unresolved(capabilityId: string, role: EuC9R4NodeRole, status: EuC9R4ExecutionStatus, required: boolean, profileId: string, unresolvedInputs: readonly string[]): EuC9R4NodeResult {
  return node({ capabilityId, nodeRole: role, executionStatus: status, requiredCheck: required, methodId: null, profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs, executedMethodIds: [] });
}

function explicitStripWidth(strip: EuC9R4Strip | null | undefined): number | null {
  if (!strip || typeof strip.widthMm !== "number" || !Number.isFinite(strip.widthMm) || !(strip.widthMm > 0)) return null;
  if (strip.orientation !== "X" && strip.orientation !== "Y" && strip.orientation !== "MAJOR" && strip.orientation !== "MINOR") return null;
  if (!strip.stripId) return null;
  return strip.widthMm;
}

export function routeEuC9R4StripFlexure(input: {
  strip: EuC9R4Strip | null | undefined;
  actions: EuC9R2SectionActions | null | undefined;
}): EuC9R4StripRoute {
  const blocked = (state: EuC9R4StripRoute["state"], reason: string): EuC9R4StripRoute => ({
    state, methodId: null, axis: null, executesC2: false, executesC3: false, executesC4: false, reason,
  });
  if (!explicitStripWidth(input.strip) || !input.strip) return blocked("UNDETERMINED", input.strip?.orientation ? "STRIP_WIDTH" : "STRIP_ORIENTATION_OR_WIDTH");
  if (!input.actions) return blocked("UNDETERMINED", "GOVERNED_MOMENT");
  const axial = euC9R2AxialPresence(input.actions.axial);
  const major = euC9R2MomentPresence(input.actions.majorMoment);
  const minor = euC9R2MomentPresence(input.actions.minorMoment);
  if (axial === "INVALID" || major === "INVALID" || minor === "INVALID") return blocked("INVALID_INPUT", "ACTION_EFFECT");
  if (major === "PRESENT" && minor === "PRESENT") return blocked("NOT_IMPLEMENTED", "ORTHOGONAL_MOMENTS_ARE_NOT_C4");
  if (axial === "PRESENT") return blocked("NOT_IMPLEMENTED", "MEMBRANE_ACTION_UNSUPPORTED");
  if (axial === "ABSENT") return blocked("UNDETERMINED", "EXPLICIT_ZERO_AXIAL");
  const majorAxis = input.strip.orientation === "X" || input.strip.orientation === "MAJOR";
  const active = majorAxis ? major : minor;
  const other = majorAxis ? minor : major;
  if (other === "PRESENT") return blocked("NOT_IMPLEMENTED", "ORTHOGONAL_MOMENTS_ARE_NOT_C4");
  if (active !== "PRESENT") return blocked("UNDETERMINED", "GOVERNED_MOMENT");
  return {
    state: "ROUTED",
    methodId: majorAxis ? "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR" : "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR",
    axis: majorAxis ? "MAJOR_AXIS" : "MINOR_AXIS",
    executesC2: true,
    executesC3: false,
    executesC4: false,
    reason: null,
  };
}

function sectionWidthMatches(geometry: EuConcreteFlexureInput["geometry"], widthMm: number): boolean {
  const region = geometry.regions[0];
  return geometry.shape === "RECTANGULAR" && geometry.regions.length === 1 && region?.kind === "RECTANGLE" && region.widthMm === widthMm;
}

function demandAxialIsZero(flexure: EuConcreteFlexureInput): boolean {
  const axial = flexure.demand.axial as { status?: string; valueN?: number };
  return axial.valueN === 0 && (axial.status === "NO_AXIAL_COMPONENTS" || axial.status === "AXIAL_DIRECT");
}

function shearGate(actions: EuC9R2SectionActions | null | undefined, shear: EuC5EvaluateInput | null | undefined): EuC9R4ExecutionStatus | null {
  if (!actions) return "UNDETERMINED";
  const axial = euC9R2AxialPresence(actions.axial);
  if (axial === "INVALID") return "INVALID_INPUT";
  if (axial === "PRESENT") return "BLOCKED_SCOPE_MISMATCH";
  if (axial === "ABSENT") return "UNDETERMINED";
  if (!shear) return null;
  if (shear.designShearReinforcement === "PRESENT") return "BLOCKED_SCOPE_MISMATCH";
  if (shear.designShearReinforcement !== "NONE") return "UNDETERMINED";
  if (shear.axialForceN !== 0) return "INVALID_INPUT";
  return null;
}

function finish(input: EuC9R4SlabInput, nodes: readonly EuC9R4NodeResult[], blocking: string | null, forced: EuC9R4OverallState | null): EuC9R4SlabResult {
  const scope = input.declaredEvaluationScope ?? [];
  const required = nodes.filter((item) => item.requiredCheck);
  const failedChecks = required.filter((item) => item.executionStatus === "NOT_SATISFIED").map((item) => item.capabilityId);
  const deferredCapabilities = nodes.filter((item) => item.executionStatus === "DEFERRED").map((item) => item.capabilityId);
  const unavailableRelevantCapabilities = nodes.filter((item) => item.executionStatus === "NOT_IMPLEMENTED" || item.executionStatus === "BLOCKED_DEPENDENCY" || item.executionStatus === "BLOCKED_SCOPE_MISMATCH").map((item) => item.capabilityId);
  const unresolvedInputs = nodes.flatMap((item) => item.unresolvedInputs);
  const blockingFindings = [
    ...(blocking ? [blocking] : []),
    ...failedChecks.map((id) => `FAILED:${id}`),
    ...deferredCapabilities.map((id) => `DEFERRED:${id}`),
    ...unavailableRelevantCapabilities.map((id) => `UNAVAILABLE:${id}`),
    ...nodes.filter((item) => item.executionStatus === "UNDETERMINED" || item.executionStatus === "INVALID_INPUT").map((item) => `UNRESOLVED:${item.capabilityId}`),
  ];
  let overall: EuC9R4OverallState = forced ?? "MEMBER_UNDETERMINED";
  if (!forced) {
    if (required.length === 0) overall = "MEMBER_UNDETERMINED";
    else if (required.some((item) => item.executionStatus === "NOT_SATISFIED")) overall = "MEMBER_NOT_SATISFIED";
    else if (nodes.some((item) => item.executionStatus === "UNDETERMINED" || item.executionStatus === "INVALID_INPUT")) overall = "MEMBER_UNDETERMINED";
    else if (nodes.some((item) => item.executionStatus === "NOT_IMPLEMENTED" || item.executionStatus === "DEFERRED" || item.executionStatus === "BLOCKED_DEPENDENCY" || item.executionStatus === "BLOCKED_SCOPE_MISMATCH")) overall = "MEMBER_INCOMPLETE";
    else if (required.every((item) => item.executionStatus === "SATISFIED")) overall = "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE";
  }
  const open = nodes.some((item) => !CLOSED_STATUSES.includes(item.executionStatus as (typeof CLOSED_STATUSES)[number]));
  const complete = !open && required.length > 0 && required.every((item) => item.executionStatus === "SATISFIED");
  const fingerprint = euC9R4Fingerprint({
    memberId: input.memberId,
    memberType: input.memberType,
    slabForm: input.slabForm ?? null,
    scope,
    stripId: input.strip?.stripId ?? null,
    stripOrientation: input.strip?.orientation ?? null,
    stripWidthMm: input.strip?.widthMm ?? null,
    globalSlabWidthMm: input.globalSlabWidthMm ?? null,
    supportId: input.supportId ?? null,
    punchingSupport: input.punching?.supportPosition ?? null,
    punchingOpening: input.punching?.openingPresent ?? null,
    standardContext: input.standardContext ?? null,
    geometryShape: input.geometryShape ?? null,
    reinforcementRef: input.reinforcementRef ?? null,
    materialRef: input.materialRef ?? null,
    actions: input.actions ?? null,
    combinationId: input.combinationId ?? null,
    graph: EU_C9_R4_ORCHESTRATOR_VERSION,
  });
  return {
    orchestratorId: EU_C9_R4_ORCHESTRATOR_ID,
    orchestratorVersion: EU_C9_R4_ORCHESTRATOR_VERSION,
    memberId: input.memberId,
    memberType: input.memberType,
    declaredEvaluationScope: scope,
    stripId: input.strip?.stripId ?? null,
    stripOrientation: input.strip?.orientation ?? null,
    stripWidthMm: explicitStripWidth(input.strip),
    supportId: input.supportId ?? null,
    standardContext: input.standardContext ?? null,
    executedCapabilityIds: nodes.flatMap((item) => item.executedMethodIds),
    nodes,
    checkNodes: nodes.filter((item) => item.nodeRole === "CHECK"),
    calculationNodes: nodes.filter((item) => item.nodeRole === "CALCULATION"),
    contextNodes: nodes.filter((item) => item.nodeRole === "CONTEXT"),
    notApplicableCapabilities: nodes.filter((item) => item.executionStatus === "NOT_APPLICABLE").map((item) => item.capabilityId),
    deferredCapabilities,
    unavailableRelevantCapabilities,
    unresolvedInputs,
    perCapabilityResults: nodes,
    failedChecks,
    blockingFindings,
    overallState: overall,
    evaluationCompleteForDeclaredScope: complete && overall !== "ORCHESTRATION_BLOCKED",
    fullStandardCoverage: false,
    engineerValidationState: EU_C9_R4_ENGINEER_VALIDATION_STATE,
    conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    productClaim: EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
    memberFingerprint: fingerprint,
    provenanceGraph: nodes,
    staleReuseRejected: input.priorResultFingerprint != null && input.priorResultFingerprint !== fingerprint,
    warnings: [EU_C9_R4_PRODUCT_SUBCLAIM, "SECTION_STRIP_CHECK_IS_NOT_SLAB_ANALYSIS", "PUNCHING_CHECK_IS_NOT_GLOBAL_SLAB_ANALYSIS"],
  };
}

function blocked(input: EuC9R4SlabInput, finding: string): EuC9R4SlabResult {
  return finish(input, [], finding, "ORCHESTRATION_BLOCKED");
}

function excluded(input: EuC9R4SlabInput): boolean {
  return Boolean(
    input.prestressed || input.ribbed || input.waffle || input.voided || input.transferSlab || input.deepSlab || input.dRegion
    || input.fireDesign || input.seismicDiaphragm || input.constructionStage || input.nonlinearAnalysis || input.shellAction
    || (input.slabForm != null && input.slabForm !== "SOLID"),
  );
}

export function orchestrateEuC9R4SolidSlab(input: EuC9R4SlabInput): EuC9R4SlabResult {
  if (EU_CONCRETE_PACK_CERTIFIED || EU_C9_R4_NEW_ENGINEERING_FORMULA_IMPLEMENTED || EU_C9_R4_C6_INVOKED_FOR_SLAB || EU_C9_R4_TWO_WAY_SLAB_BENDING_AUTOMATICALLY_ROUTED_TO_C4) {
    return blocked(input, "AUTHORITY_BOUNDARY");
  }
  if (input.memberType !== EU_C9_R4_CANONICAL_SLAB_MEMBER_TYPE) return blocked(input, "INVALID_MEMBER_TYPE");
  if (excluded(input)) return blocked(input, "UNSUPPORTED_SLAB_TYPE");
  if (input.generateActions || input.inferSupportReaction || input.generateShearFromLoads || input.inventPunchingDemand || input.inventStripWidth) {
    return blocked(input, "ACTION_OR_GEOMETRY_INVENTION_REJECTED");
  }
  if (input.reinforcementAutodesign || input.thicknessAutodesign || input.stripAutogeneration || input.automaticBarRepositioning || input.automaticAnchorageExtension) {
    return blocked(input, "AUTODESIGN_REJECTED");
  }
  if (input.hardCodedCombinationFactors || input.ndpValueOnlyReuse) return blocked(input, "PROFILE_OR_NDP_REJECTED");
  if (!input.standardContext || input.standardContext.family !== "EN1992" || input.standardContext.generation !== EU_C9_R2_REFERENCE_GENERATION || !input.standardContext.profileId) {
    return blocked(input, "PROFILE_MISMATCH");
  }
  if (input.geometryShape != null && input.geometryShape !== "RECTANGULAR") {
    return finish(input, [unresolved("GEOMETRY", "CONTEXT", "INVALID_INPUT", false, input.standardContext.profileId, ["RECTANGULAR_GEOMETRY"])], "INVALID_GEOMETRY", "MEMBER_UNDETERMINED");
  }
  const scope = input.declaredEvaluationScope;
  if (!scope || scope.length === 0) return finish(input, [], "MISSING_DECLARED_SCOPE", "MEMBER_UNDETERMINED");
  const profileId = input.standardContext.profileId;
  const nodes: EuC9R4NodeResult[] = [];
  const materials = Boolean(input.materialRef && input.reinforcementRef);

  if (hasScope(scope, "STRIP_FLEXURE") || input.twoWayAnalysisRequested) {
    if (input.twoWayAnalysisRequested || hasScope(scope, "TWO_WAY_ANALYSIS") || hasScope(scope, "C4_TWO_WAY")) {
      nodes.push(unresolved("TWO_WAY_SLAB_ANALYSIS", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    } else if (!materials) {
      nodes.push(unresolved("D1E.EU.C2.FLEXURE.UNIAXIAL", "CHECK", "UNDETERMINED", true, profileId, ["MATERIAL_OR_REINFORCEMENT"]));
    } else if (input.geometryShape !== "RECTANGULAR") {
      nodes.push(unresolved("D1E.EU.C2.FLEXURE.UNIAXIAL", "CHECK", "UNDETERMINED", true, profileId, ["RECTANGULAR_GEOMETRY"]));
    } else {
      const route = routeEuC9R4StripFlexure({ strip: input.strip, actions: input.actions });
      if (route.state !== "ROUTED" || !route.methodId || !route.axis) {
        const status = route.state === "ROUTED" ? "UNDETERMINED" : route.state;
        nodes.push(unresolved("D1E.EU.C2.FLEXURE.UNIAXIAL", "CHECK", status, true, profileId, [route.reason ?? "STRIP_FLEXURE"]));
      } else {
        const flexure = input.flexure;
        const governed = route.axis === "MINOR_AXIS" ? input.actions?.minorMoment : input.actions?.majorMoment;
        const governedMoment = governed?.status === "PRESENT" ? governed.signedNm : null;
        const matches = flexure != null
          && flexure.methodId === route.methodId
          && flexure.axis === route.axis
          && flexure.demand.moment.signed === governedMoment
          && demandAxialIsZero(flexure)
          && sectionWidthMatches(flexure.geometry, input.strip?.widthMm ?? Number.NaN);
        if (!matches || !flexure) {
          nodes.push(unresolved("D1E.EU.C2.FLEXURE.UNIAXIAL", "CHECK", "INVALID_INPUT", true, profileId, ["C2_INPUT_DOES_NOT_MATCH_STRIP"]));
        } else {
          const solved = evaluateEuConcreteFlexure(flexure);
          const status = mapCheck(solved.checkState);
          nodes.push(node({
            capabilityId: "D1E.EU.C2.FLEXURE.UNIAXIAL",
            nodeRole: "CHECK",
            executionStatus: status,
            requiredCheck: true,
            methodId: route.methodId,
            profileId,
            numericalResult: solved.designRuleUtilization,
            resultFingerprint: solved.resultFingerprint,
            unresolvedInputs: status === "UNDETERMINED" ? ["C2_FLEXURE"] : [],
            executedMethodIds: [route.methodId],
          }));
        }
      }
    }
  }

  if (hasScope(scope, "ONE_WAY_SHEAR")) {
    const gate = shearGate(input.actions, input.shear);
    if (gate === "BLOCKED_SCOPE_MISMATCH") {
      nodes.push(unresolved("D1E.EU.C5.SHEAR", "CHECK", "BLOCKED_SCOPE_MISMATCH", true, profileId, []));
    } else if (!materials) {
      nodes.push(unresolved("D1E.EU.C5.SHEAR", "CHECK", "UNDETERMINED", true, profileId, ["MATERIAL_OR_REINFORCEMENT"]));
    } else if (gate) {
      nodes.push(unresolved("D1E.EU.C5.SHEAR", "CHECK", gate, true, profileId, ["EXPLICIT_ZERO_AXIAL_OR_SHEAR_INPUT"]));
    } else if (!input.shear || input.shear.demand.shear == null) {
      nodes.push(unresolved("D1E.EU.C5.SHEAR", "CHECK", "UNDETERMINED", true, profileId, ["SHEAR_DEMAND"]));
    } else {
      const solved = evaluateEuC5Shear(input.shear);
      const status = solved.ok ? mapCheck(solved.checkState) : "UNDETERMINED";
      nodes.push(node({
        capabilityId: "D1E.EU.C5.SHEAR",
        nodeRole: "CHECK",
        executionStatus: status,
        requiredCheck: true,
        methodId: solved.methodId ?? EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID,
        profileId,
        numericalResult: solved.resistance?.value ?? null,
        resultFingerprint: solved.fingerprint,
        unresolvedInputs: status === "UNDETERMINED" ? [solved.failReason ?? "SHEAR"] : [],
        executedMethodIds: solved.ok && solved.methodId ? [solved.methodId] : [],
      }));
    }
  }

  if (hasScope(scope, "PUNCHING")) {
    const punching = input.punching;
    if (!materials) {
      nodes.push(unresolved("D1E.EU.C5.PUNCHING", "CHECK", "UNDETERMINED", true, profileId, ["MATERIAL_OR_REINFORCEMENT"]));
    } else if (!punching || punching.supportPosition == null || punching.openingPresent == null) {
      nodes.push(unresolved("D1E.EU.C5.PUNCHING", "CHECK", "UNDETERMINED", true, profileId, ["SUPPORT_GEOMETRY"]));
    } else if (punching.supportPosition !== "INTERIOR" || punching.openingPresent !== false || punching.eccentricityMode === "COMPUTE_MOMENT_TRANSFER") {
      nodes.push(unresolved("D1E.EU.C5.PUNCHING", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    } else if (punching.punchingForce == null || punching.eccentricityMode !== "EXPLICIT_BETA_ONLY") {
      nodes.push(unresolved("D1E.EU.C5.PUNCHING", "CHECK", "UNDETERMINED", true, profileId, ["PUNCHING_DEMAND"]));
    } else {
      const solved = evaluateEuC5Punching(punching);
      const status = solved.ok ? mapCheck(solved.checkState) : "UNDETERMINED";
      nodes.push(node({
        capabilityId: "D1E.EU.C5.PUNCHING",
        nodeRole: "CHECK",
        executionStatus: status,
        requiredCheck: true,
        methodId: solved.methodId ?? EU_C5_PUNCHING_INTERIOR_METHOD_ID,
        profileId,
        numericalResult: solved.resistance?.value ?? null,
        resultFingerprint: solved.fingerprint,
        unresolvedInputs: status === "UNDETERMINED" ? [solved.failReason ?? "PUNCHING"] : [],
        executedMethodIds: solved.ok && solved.methodId ? [solved.methodId] : [],
      }));
    }
  }

  if (hasScope(scope, "SLS_CRACK_WIDTH")) {
    const crack = input.crackWidth;
    if (!materials) {
      nodes.push(unresolved("D1E.EU.C7.SLS_REFERENCE", "CHECK", "UNDETERMINED", true, profileId, ["MATERIAL_OR_REINFORCEMENT"]));
    } else if (!crack || crack.memberType !== "SOLID_SLAB") {
      nodes.push(unresolved("D1E.EU.C7.SLS_REFERENCE", "CHECK", crack && crack.memberType !== "SOLID_SLAB" ? "BLOCKED_SCOPE_MISMATCH" : "UNDETERMINED", true, profileId, ["SOLID_SLAB_CRACK_INPUT"]));
    } else if (crack.sigmaSMpa == null || crack.sigmaSLimitState !== "SLS" || crack.sigmaSProvenanceRef == null) {
      nodes.push(unresolved("D1E.EU.C7.SLS_REFERENCE", "CHECK", "UNDETERMINED", true, profileId, ["sigmaS"]));
    } else {
      const solved = evaluateEuC7CrackWidth(crack);
      const status = solved.calculationState === "COMPLETE" ? mapCheck(solved.checkState) : "UNDETERMINED";
      nodes.push(node({
        capabilityId: "D1E.EU.C7.SLS_REFERENCE",
        nodeRole: "CHECK",
        executionStatus: status,
        requiredCheck: true,
        methodId: solved.methodId,
        profileId,
        numericalResult: solved.crackWidthMm,
        resultFingerprint: solved.resultFingerprint,
        unresolvedInputs: status === "UNDETERMINED" ? [solved.failReason ?? "CRACK_WIDTH"] : [],
        executedMethodIds: status === "UNDETERMINED" ? [] : [solved.methodId],
      }));
    }
  }

  if (hasScope(scope, "C6_SECOND_ORDER")) {
    nodes.push(unresolved("D1E.EU.C6.NOMINAL_CURVATURE", "CHECK", "NOT_APPLICABLE", false, profileId, []));
  }
  if (hasScope(scope, "TORSION")) {
    nodes.push(unresolved("D1E.EU.C5.TORSION", "CHECK", "NOT_APPLICABLE", false, profileId, []));
  }
  if (hasScope(scope, "MEMBRANE")) {
    nodes.push(unresolved("MEMBRANE_ACTION", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "TWO_WAY_ANALYSIS") && !hasScope(scope, "STRIP_FLEXURE") && !input.twoWayAnalysisRequested) {
    nodes.push(unresolved("TWO_WAY_SLAB_ANALYSIS", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "C4_TWO_WAY") && !hasScope(scope, "STRIP_FLEXURE") && !input.twoWayAnalysisRequested) {
    nodes.push(unresolved("TWO_WAY_SLAB_ANALYSIS", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "DEFLECTION")) {
    nodes.push(unresolved("SLAB_DEFLECTION", "CHECK", "DEFERRED", true, profileId, []));
  }
  if (hasScope(scope, "CALCULATED_CREEP") || input.longTerm?.calculateCreep) {
    nodes.push(unresolved("CALCULATED_CREEP", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "CALCULATED_SHRINKAGE") || input.longTerm?.calculateShrinkage) {
    nodes.push(unresolved("CALCULATED_SHRINKAGE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "LONG_TERM_CONTEXT") && !input.longTerm?.calculateCreep && !input.longTerm?.calculateShrinkage) {
    if (!input.longTerm) {
      nodes.push(unresolved("D1E.EU.C7.EXPLICIT_LONG_TERM", "CONTEXT", "UNDETERMINED", false, profileId, ["EXPLICIT_CREEP_AND_SHRINKAGE"]));
    } else {
      const solved = evaluateEuC7LongTermState(input.longTerm);
      nodes.push(node({
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
      nodes.push(unresolved("D1E.EU.C8.COVER_ASSEMBLY", "CALCULATION", "UNDETERMINED", false, profileId, ["COVER_INPUT"]));
    } else {
      const solved = evaluateEuC8CoverAssembly(input.cover);
      nodes.push(node({
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
    nodes.push(unresolved("PROVIDED_COVER_COMPLIANCE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "REINFORCEMENT_SPACING")) {
    const spacing = input.spacing;
    const diameterA = spacing?.barA?.diameter?.value;
    const diameterB = spacing?.barB?.diameter?.value;
    if (input.orthogonalBarCrossing) {
      nodes.push(unresolved("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    } else if (spacing?.spacingContext === "VERTICAL_LAYER_ADJACENT" && (!input.spacingLayerA || !input.spacingLayerB)) {
      nodes.push(unresolved("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "UNDETERMINED", true, profileId, ["BAR_LAYER"]));
    } else if (spacing && diameterA != null && diameterB != null && diameterA !== diameterB) {
      nodes.push(unresolved("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    } else if (!spacing) {
      nodes.push(unresolved("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "UNDETERMINED", true, profileId, ["SPACING_INPUT"]));
    } else {
      const solved = evaluateEuC8MinClearSpacing(spacing);
      const status = solved.failReason === "UNEQUAL_BAR_DIAMETERS" ? "NOT_IMPLEMENTED" : solved.ok ? mapCheck(solved.checkState) : "UNDETERMINED";
      nodes.push(node({
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
      nodes.push(unresolved("D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", "CALCULATION", "UNDETERMINED", false, profileId, ["ANCHORAGE_INPUT"]));
    } else if (anchorage.forceState === "COMPRESSION") {
      nodes.push(unresolved("COMPRESSION_ANCHORAGE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    } else {
      const solved = evaluateEuC8BasicRequiredAnchorage(anchorage);
      const checkMode = anchorage.checkRequested === true;
      const status: EuC9R4ExecutionStatus = !solved.ok ? "UNDETERMINED" : checkMode ? mapCheck(solved.checkState ?? "UNDETERMINED") : "CALCULATED";
      nodes.push(node({
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
  if (hasScope(scope, "DESIGN_ANCHORAGE")) {
    nodes.push(unresolved("DESIGN_ANCHORAGE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  }
  if (hasScope(scope, "LAPS")) {
    nodes.push(unresolved("LAPS", "CHECK", "DEFERRED", true, profileId, []));
  }

  return finish(input, nodes, null, null);
}

export const EU_C9_R4_ORCHESTRATOR_REGISTRY = [{
  orchestratorId: EU_C9_R4_ORCHESTRATOR_ID,
  version: EU_C9_R4_ORCHESTRATOR_VERSION,
  memberType: EU_C9_R4_CANONICAL_SLAB_MEMBER_TYPE,
  scope: EU_C9_R4_SLAB_SCOPE,
  stripSemantics: EU_C9_R4_STRIP_WIDTH_ROUTE,
  actionSource: EU_C9_R4_PUNCHING_DEMAND_ROUTE,
  flexureApplicability: EU_C9_R4_C2_SLAB_APPLICABILITY,
  oneWayShearApplicability: EU_C9_R4_C5_ONE_WAY_SHEAR_APPLICABILITY,
  punchingApplicability: EU_C9_R4_PUNCHING_METHOD_APPLICABILITY,
  slsRouting: EU_C9_R4_SLAB_SLS_EXECUTION_GRAPH,
  detailingRouting: EU_C9_R4_SLAB_DETAILING_EXECUTION_GRAPH,
  unsupportedGlobalAnalysis: EU_C9_R4_SLAB_EXCLUSIONS,
  nodeRoles: "CHECK_CALCULATION_CONTEXT",
  aggregation: EU_C9_R4_AGGREGATION_PRECEDENCE,
  fingerprintVersion: EU_C9_R4_ORCHESTRATOR_VERSION,
  validationState: "NUMERICALLY_VALIDATED",
  engineerValidationState: EU_C9_R4_ENGINEER_VALIDATION_STATE,
  conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  fullStandardCoverage: EU_C9_R4_FULL_STANDARD_COVERAGE,
  productClaim: EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  subClaim: EU_C9_R4_PRODUCT_SUBCLAIM,
  profileContract: EU_C9_PROFILE_COMPATIBILITY_CONTRACT,
}] as const;

export const EU_C9_ORCHESTRATOR_REGISTRY = [...EU_C9_REGISTRY_THROUGH_R3, ...EU_C9_R4_ORCHESTRATOR_REGISTRY] as const;
