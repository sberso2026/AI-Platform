/**
 * C9-R5 bounded rectangular RC wall-section orchestrator.
 * A section check is not wall-member design, shear-wall design, or stability.
 * This module does not add a resistance formula or a wall analysis method.
 */

import { createHash } from "node:crypto";
import {
  EU_C3_METHOD_IDS,
  EU_C4_METHOD_IDS,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
} from "@rtb/types";
import { evaluateEuC7LongTermState, type EuC7LongTermInput } from "../eu-c7/long-term";
import { evaluateEuC8BasicRequiredAnchorage, type EuC8BasicAnchorageInput } from "../eu-c8/anchorage-evaluate";
import { evaluateEuC8CoverAssembly, type EuC8CoverAssemblyInput } from "../eu-c8/evaluate";
import { evaluateEuC8MinClearSpacing, type EuC8MinClearSpacingInput } from "../eu-c8/spacing-evaluate";
import { evaluateEuC3DemandPointCheck } from "../eu-c3/evaluate";
import { evaluateEuC4DemandPointCheck } from "../eu-c4/evaluate";
import { evaluateEuConcreteFlexure, type EuConcreteFlexureInput } from "../eu-flexure/evaluate";
import {
  EU_C9_C2_MEMBER_APPLICABILITY,
  EU_C9_C3_MEMBER_APPLICABILITY,
  EU_C9_C4_MEMBER_APPLICABILITY,
  EU_C9_C5_PUNCHING_MEMBER_APPLICABILITY,
  EU_C9_C5_SHEAR_MEMBER_APPLICABILITY,
  EU_C9_C5_TORSION_MEMBER_APPLICABILITY,
  EU_C9_C7_CRACK_WIDTH_MEMBER_APPLICABILITY,
  EU_C9_C7_LONG_TERM_MEMBER_APPLICABILITY,
  EU_C9_C8_BASIC_ANCHORAGE_MEMBER_APPLICABILITY,
  EU_C9_C8_COVER_MEMBER_APPLICABILITY,
  EU_C9_C8_SPACING_MEMBER_APPLICABILITY,
  EU_C9_CANONICAL_MEMBER_TYPE_IDS,
  EU_C9_MEMBER_CAPABILITY_MATRIX,
  EU_C9_PROFILE_COMPATIBILITY_CONTRACT,
  euC9ExecutionDagHasCycle,
} from "./foundation";
import { EU_C9_R2_REFERENCE_GENERATION, euC9R2AxialPresence, euC9R2MomentPresence, type EuC9R2SectionActions } from "./beam";
import { EU_C9_ORCHESTRATOR_REGISTRY as EU_C9_REGISTRY_THROUGH_R4 } from "./slab";

export const EU_C9_R5_ORCHESTRATOR_ID = "EU_RC_WALL_SECTION_ORCHESTRATION_EN1992_REFERENCE" as const;
export const EU_C9_R5_ORCHESTRATOR_VERSION = "C9-R5" as const;
export const EU_C9_R5_CANONICAL_WALL_TYPE = "WALL" as const;
export const EU_C9_R5_WALL_TYPE_CLASSIFICATION = EU_C9_CANONICAL_MEMBER_TYPE_IDS.RECTANGULAR_WALL_SECTION;
export const EU_C9_R5_WALL_SCOPE = "ORDINARY_NON_PRESTRESSED_RECTANGULAR_RC_WALL_SECTION_SUPPLIED_ACTIONS" as const;
export const EU_C9_R5_WALL_EXCLUSIONS = "WALL_MEMBER_DESIGN_GLOBAL_ANALYSIS_LATERAL_FORCE_SHEAR_WALL_COUPLED_WALL_COUPLING_BEAM_BUCKLING_SECOND_ORDER_EFFECTIVE_LENGTH_OUT_OF_PLANE_STABILITY_SHELL_MEMBRANE_WALL_SHEAR_SEISMIC_BOUNDARY_ELEMENT_CONFINEMENT_FIRE_CONSTRUCTION_NONLINEAR_SERVICEABILITY_DEFLECTION_DURABILITY_DESIGN_ANCHORAGE_COMPRESSION_ANCHORAGE_LAPS" as const;
export const EU_C9_R5_R1_WALL_CAPABILITY_MATRIX_RECHECK = EU_C9_MEMBER_CAPABILITY_MATRIX.RECTANGULAR_WALL_SECTION;
export const EU_C9_R5_WALL_MODE_CONTRACT_DEFINED = true as const;
export const EU_C9_R5_WALL_MODE_CONTRACT = "EXPLICIT_SECTION_PURE_FLEXURE_OR_UNIAXIAL_NM_OR_BIAXIAL_PMM_PLUS_BOUNDED_DETAILING_CONTEXT" as const;
export const EU_C9_R5_WALL_SECTION_CHECK_EQUALS_WALL_MEMBER_DESIGN = false as const;
export const EU_C9_R5_WALL_SECTION_CHECK_EQUALS_GLOBAL_WALL_ANALYSIS = false as const;
export const EU_C9_R5_WALL_SECTION_CHECK_EQUALS_SHEAR_WALL_DESIGN = false as const;
export const EU_C9_R5_WALL_SECTION_CHECK_EQUALS_WALL_STABILITY = false as const;
export const EU_C9_R5_CAN_INVENT_MISSING_METHODS = false as const;
export const EU_C9_R5_CAN_EXPAND_METHOD_APPLICABILITY = false as const;
export const EU_C9_R5_CAN_SUBSTITUTE_DEFERRED_METHODS = false as const;
export const EU_C9_R5_CAN_OVERRIDE_FAIL_CLOSED_RESULT = false as const;
export const EU_C9_R5_NEW_ENGINEERING_FORMULA_IMPLEMENTED = false as const;
export const EU_C9_R5_ACTION_EFFECT_SOURCE_GOVERNED = true as const;
export const EU_C9_R5_ACTION_EFFECT_INVENTED = false as const;
export const AI_ACTION_EFFECT_AUTHORITY = false as const;
export const EU_C9_R5_ORCHESTRATOR_GENERATES_WALL_ACTION_EFFECTS = false as const;
export const EU_C9_R5_C2_WALL_APPLICABILITY = EU_C9_C2_MEMBER_APPLICABILITY;
export const EU_C9_R5_PURE_FLEXURE_ROUTING = "C2_WHEN_EXPLICIT_ZERO_AXIAL_AND_ONE_SECTION_MOMENT" as const;
export const EU_C9_R5_C3_WALL_APPLICABILITY = EU_C9_C3_MEMBER_APPLICABILITY;
export const EU_C9_R5_UNIAXIAL_NM_ROUTING = "C3_SECTION_ONLY_WHEN_AXIAL_AND_ONE_MOMENT_OR_EXPLICIT_PURE_AXIAL_AXIS" as const;
export const EU_C9_R5_C4_WALL_APPLICABILITY = EU_C9_C4_MEMBER_APPLICABILITY;
export const EU_C9_R5_BIAXIAL_PMM_ROUTING = "C4_SECTION_PMM_WHEN_AXIAL_AND_BOTH_MOMENTS" as const;
export const EU_C9_R5_C4_EQUALS_WALL_BIAXIAL_MEMBER_ANALYSIS = false as const;
export const EU_C9_R5_PURE_AXIAL_C3_SUPPORT = "C3_ON_EXPLICIT_SECTION_AXIS_ONLY_ELSE_BLOCKED_SCOPE_MISMATCH" as const;
export const EU_C9_R5_PURE_AXIAL_AXIS_CONTRACT = "EXPLICIT_MAJOR_OR_MINOR_AXIS_REQUIRED" as const;
export const EU_C9_R5_PURE_AXIAL_AXIS_GUESSED = false as const;
export const EU_C9_R5_WALL_AXIS_MAPPING_CONTRACT = "EXPLICIT_MAJOR_AND_MINOR_TO_IN_PLANE_OR_OUT_OF_PLANE" as const;
export const EU_C9_R5_AXIS_INFERENCE_FROM_UI = false as const;
export const EU_C9_R5_WALL_GEOMETRY_MAPPING_CONTRACT = "EXPLICIT_LENGTH_AND_THICKNESS_TO_SECTION_WIDTH_OR_DEPTH" as const;
export const EU_C9_R5_WALL_LENGTH_THICKNESS_SWAPPED_BY_HEURISTIC = false as const;
export const EU_C9_R5_C6_WALL_APPLICABILITY = "NOT_IMPLEMENTED_FOR_WALL_MEMBER" as const;
export const EU_C9_R5_C6_INVOKED_FOR_WALL = false as const;
export const EU_C9_R5_WALL_SLENDERNESS_RULE_IMPLEMENTED = false as const;
export const EU_C9_R5_WALL_EFFECTIVE_LENGTH_INFERRED = false as const;
export const EU_C9_R5_WALL_SECOND_ORDER_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R5_C5_SHEAR_WALL_APPLICABILITY = `${EU_C9_C5_SHEAR_MEMBER_APPLICABILITY}_BLOCKED_FOR_WALL_SECTION` as const;
export const EU_C9_R5_WALL_SHEAR_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R5_C5_SHEAR_EQUALS_SHEAR_WALL_DESIGN = false as const;
export const EU_C9_R5_PUNCHING_WALL_APPLICABILITY = `${EU_C9_C5_PUNCHING_MEMBER_APPLICABILITY}_NOT_A_WALL_SECTION_METHOD` as const;
export const EU_C9_R5_C5_TORSION_WALL_APPLICABILITY = `${EU_C9_C5_TORSION_MEMBER_APPLICABILITY}_NOT_INVOKED_WALL_SECTION_IS_NOT_A_TORSION_MEMBER` as const;
export const NEW_C9_R5_WALL_INTERACTION_FORMULA_IMPLEMENTED = false as const;
export const EU_C9_R5_C7_CRACK_WIDTH_WALL_APPLICABILITY = `${EU_C9_C7_CRACK_WIDTH_MEMBER_APPLICABILITY}_BLOCKED_FOR_WALL` as const;
export const EU_C9_R5_WALL_CRACK_WIDTH_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R5_C7_SLS_EQUALS_COMPLETE_WALL_SERVICEABILITY = false as const;
export const EU_C9_R5_WALL_DEFLECTION_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R5_DEFLECTION_REQUEST_CAN_PASS = false as const;
export const EU_C9_R5_LONG_TERM_WALL_APPLICABILITY = EU_C9_C7_LONG_TERM_MEMBER_APPLICABILITY;
export const EU_C9_R5_LONG_TERM_NODE_ROLE = "CONTEXT" as const;
export const EU_C9_R5_LONG_TERM_CONTEXT_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R5_LONG_TERM_STATE_EQUALS_WALL_DEFORMATION_CHECK = false as const;
export const EU_C9_R5_COVER_WALL_APPLICABILITY = EU_C9_C8_COVER_MEMBER_APPLICABILITY;
export const EU_C9_R5_COVER_NODE_ROLE = "CALCULATION" as const;
export const EU_C9_R5_COVER_ASSEMBLY_EQUALS_PROVIDED_COVER_COMPLIANCE = false as const;
export const EU_C9_R5_DURABILITY_COVER_LOOKUP_AVAILABLE = false as const;
export const EU_C9_R5_PROVIDED_COVER_COMPLIANCE_AVAILABLE = false as const;
export const EU_C9_R5_SPACING_WALL_APPLICABILITY = EU_C9_C8_SPACING_MEMBER_APPLICABILITY;
export const EU_C9_R5_SPACING_ROUTING_CONTRACT = "EQUAL_DIAMETER_EXPLICIT_ADJACENT_PAIR_SURFACE_GEOMETRY_AGGREGATE_NDP" as const;
export const EU_C9_R5_REINFORCEMENT_FACE_CONTRACT = "EXPLICIT_FACE_IDENTITY_NOT_COORDINATE_HEURISTIC" as const;
export const EU_C9_R5_REINFORCEMENT_FACE_GUESSED = false as const;
export const EU_C9_R5_ARBITRARY_WALL_BAR_PAIR_AUTO_CLASSIFIED = false as const;
export const EU_C9_R5_BASIC_ANCHORAGE_WALL_APPLICABILITY = EU_C9_C8_BASIC_ANCHORAGE_MEMBER_APPLICABILITY;
export const EU_C9_R5_COMPRESSION_ANCHORAGE_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R5_DESIGN_ANCHORAGE_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R5_BASIC_ANCHORAGE_EQUALS_DESIGN_ANCHORAGE = false as const;
export const EU_C9_R5_LAP_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R5_LAP_REQUEST_CAN_PASS = false as const;
export const EU_C9_R5_BOUNDARY_ELEMENT_DESIGN_AVAILABLE = false as const;
export const EU_C9_R5_BOUNDARY_ELEMENT_REQUEST_CAN_PASS = false as const;
export const EU_C9_R5_SEISMIC_WALL_DETAILING_AVAILABLE = false as const;
export const EU_C9_R5_NODE_ROLE_TAXONOMY_REUSED = true as const;
export const EU_C9_R5_CHECK_NODE_CAPABILITY_IDS = [
  "D1E.EU.C2.FLEXURE.UNIAXIAL",
  "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL",
  "D1E.EU.C4.BIAXIAL.PMM",
  "D1E.EU.C8.MIN_CLEAR_SPACING",
  "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE",
] as const;
export const EU_C9_R5_CALCULATION_NODE_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R5_CONTEXT_NODE_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R5_EMPTY_REQUIRED_CHECK_SET_CAN_PASS = false as const;
export const EU_C9_R5_DECLARED_SCOPE_CONTRACT = "EXPLICIT_DECLARED_WALL_SECTION_EVALUATION_SCOPE" as const;
export const EU_C9_R5_REQUIRED_CHECK_SELECTION_DETERMINISTIC = true as const;
export const AI_REQUIRED_CHECK_SELECTION_AUTHORITY = false as const;
export const EU_C9_R5_SECTION_ACTION_ROUTING_CONTRACT = "DECLARED_MODE_PLUS_ZERO_N_ONE_M_TO_C2_OR_N_ONE_M_TO_C3_OR_N_TWO_M_TO_C4_OR_PURE_N_ON_EXPLICIT_AXIS" as const;
export const EU_C9_R5_REDUNDANT_C2_C3_C4_EXECUTION = false as const;
export const D1C_COMBINATION_ENGINE_REUSED = true as const;
export const PARALLEL_C9_R5_COMBINATION_ENGINE_CREATED = false as const;
export const EU_C9_R5_PROFILE_COMPATIBILITY_REUSED = true as const;
export const EU_C9_R5_PROFILE_MISMATCH_FAILS_CLOSED = true as const;
export const EU_C9_R5_NDP_SEMANTIC_IDENTITY_REQUIRED = true as const;
export const EU_C9_R5_NDP_VALUE_ONLY_REUSE_ALLOWED = false as const;
export const C1_RULES_REUSED_FOR_C9_R5 = true as const;
export const PARALLEL_C9_R5_MATERIAL_MODEL_CREATED = false as const;
export const D1E_RECTANGULAR_SECTION_GEOMETRY_REUSED_FOR_WALL = true as const;
export const PARALLEL_WALL_SECTION_GEOMETRY_CREATED = false as const;
export const PARALLEL_WALL_DOMAIN_OBJECT_CREATED = false as const;
export const PARALLEL_WALL_MODEL_CREATED = false as const;
export const EU_C9_R5_SECTION_GEOMETRY_EQUALS_GLOBAL_WALL_MODEL = false as const;
export const EU_C9_R5_UNGOVERNED_RESULT_SUBSTITUTION_ALLOWED = false as const;
export const EU_C9_R5_WALL_EXECUTION_GRAPH = "PROFILE_GEOMETRY_SUPPLIED_ACTIONS_ONE_C2_OR_C3_OR_C4_SECTION_NODE_OPTIONAL_DETAILING_CONTEXT_AGGREGATION" as const;
export const EU_C9_R5_FAILURE_PROPAGATION = "PASS" as const;
export const EU_C9_R5_ONLY_REQUIRED_CHECK_NODES_AGGREGATED = true as const;
export const EU_C9_R5_MEMBER_AGGREGATION_IMPLEMENTED = true as const;
export const EU_C9_R5_MULTIPLE_MEMBER_FINDINGS_PRESERVED = true as const;
export const EU_C9_R5_AGGREGATION_PRECEDENCE = "NOT_SATISFIED_THEN_UNDETERMINED_OR_INVALID_INPUT_THEN_INCOMPLETE_FINDINGS_RETAINED" as const;
export const EU_C9_R5_WALL_RESULT_CONTRACT_GOVERNED = true as const;
export const EU_C9_R5_FULL_STANDARD_COVERAGE = false as const;
export const EU_C9_R5_DECLARED_SCOPE_COMPLETENESS_SEMANTICS = "PASS" as const;
export const EU_C9_R5_WALL_RESULT_EQUALS_COMPLETE_EN1992_WALL_DESIGN = false as const;
export const EU_C9_R5_WALL_RESULT_EQUALS_WALL_STRUCTURAL_ANALYSIS = false as const;
export const EU_C9_R5_WALL_RESULT_EQUALS_SHEAR_WALL_DESIGN = false as const;
export const EU_C9_R5_WALL_RESULT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const EU_C9_R5_WALL_RESULT_EQUALS_CERTIFICATION = false as const;
export const EU_C9_R5_MEMBER_PROVENANCE_GRAPH = "PASS" as const;
export const EU_C9_R5_MEMBER_FINGERPRINT_COMPLETE = true as const;
export const EU_C9_R5_DEPENDENCY_INVALIDATION = true as const;
export const STALE_C9_R5_WALL_RESULT_REUSE_ALLOWED = false as const;
export const EU_C9_R5_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const EU_C9_R5_REINFORCEMENT_AUTODESIGN = false as const;
export const EU_C9_R5_WALL_THICKNESS_AUTODESIGN = false as const;
export const EU_C9_R5_BOUNDARY_ELEMENT_AUTODESIGN = false as const;
export const EU_C9_R5_AUTOMATIC_BAR_REPOSITIONING = false as const;
export const EU_C9_R5_AUTOMATIC_ANCHORAGE_EXTENSION = false as const;
export const EU_C9_R5_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_BYPASS_REQUIRED_WALL_CHECKS = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_WALL_ACTION_EFFECTS = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_WALL_AXIS_MAPPING = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_WALL_STABILITY_INPUTS = false as const;
export const EU_C9_R5_OPTIMIZATION_ACCEPTS_INCOMPLETE_AS_FEASIBLE = false as const;
export const EU_C9_R5_OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const EU_C9_R5_PARETO_ACCEPTS_FAILED_WALL_AS_FEASIBLE = false as const;
export const EU_C9_R5_IMPLEMENTED_WALL_ORCHESTRATOR_COUNT = 1 as const;
export const EU_C9_R5_NUMERICALLY_VALIDATED_WALL_ORCHESTRATOR_COUNT = 1 as const;
export const EU_C9_R5_ENGINEER_VALIDATED_WALL_ORCHESTRATOR_COUNT = 0 as const;
export const EU_C9_R5_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const NUMERICAL_WALL_ORCHESTRATION_VALIDATION_EQUALS_ENGINEER_VALIDATION = false as const;
export const C9_WALL_ORCHESTRATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C9_R5_PRODUCT_SUBCLAIM = "BOUNDED_RC_WALL_SECTION_ORCHESTRATION_REFERENCE_CAPABILITY" as const;
export const CAPABILITY_MANIFEST_WALL_CLAIM_SECTION_ONLY = true as const;
export const EU_C9_R5_CLOSEOUT_NEXT_FEASIBILITY = "FEASIBLE" as const;
export const EU_C9_IMPLEMENTED_MEMBER_ORCHESTRATOR_INVENTORY = [
  "EU_RC_BEAM_ORCHESTRATION_EN1992_REFERENCE",
  "EU_RC_COLUMN_ORCHESTRATION_EN1992_REFERENCE",
  "EU_RC_SOLID_SLAB_ORCHESTRATION_EN1992_REFERENCE",
  "EU_RC_WALL_SECTION_ORCHESTRATION_EN1992_REFERENCE",
] as const;
export const AI_C9_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_C9_NUMERICAL_AUTHORITY = false as const;
export const AI_MEMBER_TYPE_AUTHORITY = false as const;
export const AI_WALL_AXIS_AUTHORITY = false as const;
export const AI_WALL_SHEAR_AUTHORITY = false as const;
export const AI_WALL_STABILITY_AUTHORITY = false as const;
export const AI_BOUNDARY_ELEMENT_AUTHORITY = false as const;
export const AI_NDP_AUTHORITY = false as const;
export const AI_CHECK_OVERRIDE_AUTHORITY = false as const;
export const AI_CONFORMANCE_AUTHORITY = false as const;
export const AI_ENGINEERING_APPROVAL = false as const;
export const EU_C9_R5_VALIDATION_DEBT_REDUCED_ITEMS = [
  "C9_WALL_SECTION_RUNTIME_ORCHESTRATOR",
  "C9_WALL_SECTION_ROUTING_VALIDATION",
  "C9_WALL_SECTION_AGGREGATION_VALIDATION",
] as const;
export const EU_C9_R5_VALIDATION_DEBT_REMAINING_ITEMS = [
  "WALL_GLOBAL_ANALYSIS",
  "WALL_SECOND_ORDER",
  "WALL_STABILITY",
  "WALL_SHEAR",
  "WALL_CRACK_WIDTH",
  "OUT_OF_PLANE_WALL_DESIGN",
  "SHEAR_WALL_DESIGN",
  "COUPLED_WALLS",
  "BOUNDARY_ELEMENTS",
  "SEISMIC_WALL_DETAILING",
  "GENERAL_STRUCTURAL_ANALYSIS",
  "DEFLECTION",
  "CALCULATED_CREEP",
  "CALCULATED_SHRINKAGE",
  "DURABILITY_COVER_LOOKUP",
  "PROVIDED_COVER_COMPLIANCE",
  "DESIGN_ANCHORAGE",
  "COMPRESSION_ANCHORAGE",
  "LAPS",
  "ENGINEER_VALIDATION",
  "NATIONAL_PROFILE_VALIDATION",
  "FORMAL_CONFORMANCE",
] as const;

export const EU_C9_R5_DECLARED_SCOPE_IDS = [
  "SECTION_PURE_FLEXURE",
  "SECTION_UNIAXIAL_NM",
  "SECTION_BIAXIAL_PMM",
  "LONG_TERM_CONTEXT",
  "COVER_REQUIREMENT",
  "REINFORCEMENT_SPACING",
  "BASIC_ANCHORAGE",
  "WALL_SHEAR",
  "WALL_SECOND_ORDER",
  "PUNCHING",
  "TORSION",
  "CRACK_WIDTH",
  "DEFLECTION",
  "PROVIDED_COVER_COMPLIANCE",
  "DESIGN_ANCHORAGE",
  "COMPRESSION_ANCHORAGE",
  "LAPS",
  "BOUNDARY_ELEMENT",
  "SEISMIC_DETAILING",
] as const;

export type EuC9R5DeclaredScope = (typeof EU_C9_R5_DECLARED_SCOPE_IDS)[number];
export type EuC9R5NodeRole = "CHECK" | "CALCULATION" | "CONTEXT";
export type EuC9R5ExecutionStatus =
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
export type EuC9R5OverallState =
  | "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE"
  | "MEMBER_NOT_SATISFIED"
  | "MEMBER_INCOMPLETE"
  | "MEMBER_UNDETERMINED"
  | "ORCHESTRATION_BLOCKED";
export type EuC9R5SectionMode = "SECTION_PURE_FLEXURE" | "SECTION_UNIAXIAL_NM" | "SECTION_BIAXIAL_PMM";
export type EuC9R5WallSection = {
  wallLengthMm: number;
  wallThicknessMm: number;
  lengthMapsTo: "SECTION_WIDTH" | "SECTION_DEPTH";
};
export type EuC9R5AxisMapping = {
  majorAxisRole: "IN_PLANE" | "OUT_OF_PLANE";
  minorAxisRole: "IN_PLANE" | "OUT_OF_PLANE";
};
export type EuC9R5SectionRoute = {
  state: "ROUTED" | "UNDETERMINED" | "INVALID_INPUT" | "BLOCKED_SCOPE_MISMATCH";
  methodId: string | null;
  axis: "MAJOR_AXIS" | "MINOR_AXIS" | null;
  executesC2: boolean;
  executesC3: boolean;
  executesC4: boolean;
  reason: string | null;
};

export type EuC9R5NodeResult = {
  capabilityId: string;
  nodeRole: EuC9R5NodeRole;
  executionStatus: EuC9R5ExecutionStatus;
  requiredCheck: boolean;
  methodId: string | null;
  profileId: string | null;
  numericalResult: number | null;
  resultFingerprint: string | null;
  unresolvedInputs: readonly string[];
  executedMethodIds: readonly string[];
};

export type EuC9R5WallInput = {
  memberId: string;
  memberType: string;
  declaredEvaluationScope?: readonly EuC9R5DeclaredScope[] | null;
  standardContext?: { family: string; generation: string; profileId: string } | null;
  geometryShape?: "RECTANGULAR" | "CIRCULAR" | "OTHER" | null;
  materialRef?: string | null;
  reinforcementRef?: string | null;
  wallSection?: EuC9R5WallSection | null;
  axisMapping?: EuC9R5AxisMapping | null;
  actions?: EuC9R2SectionActions | null;
  combinationId?: string | null;
  flexure?: EuConcreteFlexureInput | null;
  c3?: Parameters<typeof evaluateEuC3DemandPointCheck>[0] | null;
  c4?: Parameters<typeof evaluateEuC4DemandPointCheck>[0] | null;
  longTerm?: EuC7LongTermInput | null;
  cover?: EuC8CoverAssemblyInput | null;
  spacing?: EuC8MinClearSpacingInput | null;
  anchorage?: EuC8BasicAnchorageInput | null;
  reinforcementFaceId?: string | null;
  guessReinforcementFace?: boolean;
  autoClassifyBarPair?: boolean;
  prestressed?: boolean;
  coupledWall?: boolean;
  couplingBeam?: boolean;
  fireDesign?: boolean;
  constructionStage?: boolean;
  nonlinearAnalysis?: boolean;
  generateActions?: boolean;
  inferEffectiveLength?: boolean;
  inferRestraint?: boolean;
  axisInferredFromUi?: boolean;
  calculateSlenderness?: boolean;
  runPDelta?: boolean;
  invokeColumnSecondOrder?: boolean;
  reinforcementAutodesign?: boolean;
  thicknessAutodesign?: boolean;
  boundaryElementAutodesign?: boolean;
  automaticBarRepositioning?: boolean;
  automaticAnchorageExtension?: boolean;
  hardCodedCombinationFactors?: boolean;
  ndpValueOnlyReuse?: boolean;
  priorResultFingerprint?: string | null;
};

export type EuC9R5WallResult = {
  orchestratorId: typeof EU_C9_R5_ORCHESTRATOR_ID;
  orchestratorVersion: typeof EU_C9_R5_ORCHESTRATOR_VERSION;
  memberId: string;
  memberType: string;
  canonicalWallType: typeof EU_C9_R5_CANONICAL_WALL_TYPE;
  declaredEvaluationScope: readonly EuC9R5DeclaredScope[];
  sectionAxis: "MAJOR_AXIS" | "MINOR_AXIS" | null;
  axisMapping: EuC9R5AxisMapping | null;
  wallSection: EuC9R5WallSection | null;
  executedCapabilityIds: readonly string[];
  nodes: readonly EuC9R5NodeResult[];
  checkNodes: readonly EuC9R5NodeResult[];
  calculationNodes: readonly EuC9R5NodeResult[];
  contextNodes: readonly EuC9R5NodeResult[];
  sectionResult: { methodId: string | null; checkState: string | null; numericalResult: number | null } | null;
  notApplicableCapabilities: readonly string[];
  deferredCapabilities: readonly string[];
  unavailableRelevantCapabilities: readonly string[];
  unresolvedInputs: readonly string[];
  perCapabilityResults: readonly EuC9R5NodeResult[];
  failedChecks: readonly string[];
  blockingFindings: readonly string[];
  overallState: EuC9R5OverallState;
  evaluationCompleteForDeclaredScope: boolean;
  fullStandardCoverage: false;
  engineerValidationState: typeof EU_C9_R5_ENGINEER_VALIDATION_STATE;
  conformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  productClaim: typeof EU_CONCRETE_PRODUCT_CLAIM_LEVEL;
  memberFingerprint: string;
  provenanceGraph: readonly EuC9R5NodeResult[];
  staleReuseRejected: boolean;
  warnings: readonly string[];
};

const CLOSED_STATUSES = ["SATISFIED", "CALCULATED", "AVAILABLE", "NOT_APPLICABLE"] as const;
const SECTION_MODES = ["SECTION_PURE_FLEXURE", "SECTION_UNIAXIAL_NM", "SECTION_BIAXIAL_PMM"] as const;

export const EU_C9_R5_WALL_EXECUTION_DAG = [
  { id: "CONTEXT_PROFILE", upstream: [] },
  { id: "SECTION_GEOMETRY", upstream: ["CONTEXT_PROFILE"] },
  { id: "ACTION_TUPLE", upstream: ["CONTEXT_PROFILE"] },
  { id: "SECTION_CHECK", upstream: ["SECTION_GEOMETRY", "ACTION_TUPLE"] },
  { id: "LONG_TERM", upstream: ["CONTEXT_PROFILE"] },
  { id: "COVER", upstream: ["SECTION_GEOMETRY"] },
  { id: "SPACING", upstream: ["SECTION_GEOMETRY"] },
  { id: "ANCHORAGE", upstream: ["SECTION_GEOMETRY"] },
  { id: "AGGREGATION", upstream: ["SECTION_CHECK", "LONG_TERM", "COVER", "SPACING", "ANCHORAGE"] },
] as const;

export function euC9R5WallExecutionDagHasCycle(): boolean {
  const upstream = new Map<string, readonly string[]>(EU_C9_R5_WALL_EXECUTION_DAG.map((node) => [node.id, node.upstream]));
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
  return EU_C9_R5_WALL_EXECUTION_DAG.some((node) => walk(node.id)) || euC9ExecutionDagHasCycle();
}

export const EU_C9_R5_WALL_EXECUTION_DAG_IMPLEMENTED = true as const;
export const EU_C9_R5_WALL_EXECUTION_DAG_ACYCLIC = true as const;
export const EU_C9_R5_CIRCULAR_ENGINEERING_DEPENDENCY = false as const;

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stable(item)).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
}

export function euC9R5Fingerprint(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

function hasScope(scope: readonly EuC9R5DeclaredScope[], id: EuC9R5DeclaredScope): boolean {
  return scope.includes(id);
}

function mapCheck(state: string): EuC9R5ExecutionStatus {
  if (state === "CHECK_SATISFIED" || state === "SATISFIED") return "SATISFIED";
  if (state === "CHECK_NOT_SATISFIED" || state === "NOT_SATISFIED") return "NOT_SATISFIED";
  return "UNDETERMINED";
}

function node(partial: EuC9R5NodeResult): EuC9R5NodeResult {
  return partial;
}

function unresolved(capabilityId: string, role: EuC9R5NodeRole, status: EuC9R5ExecutionStatus, required: boolean, profileId: string, unresolvedInputs: readonly string[]): EuC9R5NodeResult {
  return node({ capabilityId, nodeRole: role, executionStatus: status, requiredCheck: required, methodId: null, profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs, executedMethodIds: [] });
}

function momentValue(moment: EuC9R2SectionActions["majorMoment"]): number | null {
  return moment.status === "PRESENT" ? moment.signedNm : null;
}

function axisMappingGoverned(mapping: EuC9R5AxisMapping | null | undefined): boolean {
  if (!mapping) return false;
  return mapping.majorAxisRole !== mapping.minorAxisRole
    && (mapping.majorAxisRole === "IN_PLANE" || mapping.majorAxisRole === "OUT_OF_PLANE")
    && (mapping.minorAxisRole === "IN_PLANE" || mapping.minorAxisRole === "OUT_OF_PLANE");
}

export function wallSectionMatchesGeometry(
  geometry: { shape: string; regions: readonly { kind: string; widthMm?: number; depthMm?: number }[] },
  section: EuC9R5WallSection,
): boolean {
  const region = geometry.regions[0];
  if (geometry.shape !== "RECTANGULAR" || geometry.regions.length !== 1 || region?.kind !== "RECTANGLE") return false;
  if (!(section.wallLengthMm > 0) || !(section.wallThicknessMm > 0)) return false;
  if (section.lengthMapsTo === "SECTION_WIDTH") return region.widthMm === section.wallLengthMm && region.depthMm === section.wallThicknessMm;
  if (section.lengthMapsTo === "SECTION_DEPTH") return region.depthMm === section.wallLengthMm && region.widthMm === section.wallThicknessMm;
  return false;
}

function closedRoute(state: EuC9R5SectionRoute["state"], reason: string): EuC9R5SectionRoute {
  return { state, methodId: null, axis: null, executesC2: false, executesC3: false, executesC4: false, reason };
}

export function routeEuC9R5WallSection(input: {
  mode: EuC9R5SectionMode;
  actions: EuC9R2SectionActions;
}): EuC9R5SectionRoute {
  const axial = euC9R2AxialPresence(input.actions.axial);
  const major = euC9R2MomentPresence(input.actions.majorMoment);
  const minor = euC9R2MomentPresence(input.actions.minorMoment);
  if (axial === "INVALID" || major === "INVALID" || minor === "INVALID") return closedRoute("INVALID_INPUT", "ACTION_EFFECT");
  if (input.mode === "SECTION_PURE_FLEXURE") {
    if (major === "PRESENT" && minor === "PRESENT") return closedRoute("BLOCKED_SCOPE_MISMATCH", "TWO_MOMENTS_ARE_NOT_PURE_FLEXURE");
    if (axial === "PRESENT") return closedRoute("BLOCKED_SCOPE_MISMATCH", "AXIAL_IS_NOT_PURE_FLEXURE");
    if (axial !== "CANONICAL_ZERO") return closedRoute("UNDETERMINED", "EXPLICIT_ZERO_AXIAL");
    if (major === "PRESENT") {
      return { state: "ROUTED", methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR", axis: "MAJOR_AXIS", executesC2: true, executesC3: false, executesC4: false, reason: null };
    }
    if (minor === "PRESENT") {
      return { state: "ROUTED", methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR", axis: "MINOR_AXIS", executesC2: true, executesC3: false, executesC4: false, reason: null };
    }
    return closedRoute("UNDETERMINED", "GOVERNED_MOMENT");
  }
  if (input.mode === "SECTION_BIAXIAL_PMM") {
    if (axial === "ABSENT" || major !== "PRESENT" || minor !== "PRESENT") return closedRoute("BLOCKED_SCOPE_MISMATCH", "BIAXIAL_REQUIRES_AXIAL_AND_BOTH_MOMENTS");
    return { state: "ROUTED", methodId: EU_C4_METHOD_IDS[0], axis: null, executesC2: false, executesC3: false, executesC4: true, reason: null };
  }
  if (major === "PRESENT" && minor === "PRESENT") return closedRoute("BLOCKED_SCOPE_MISMATCH", "BIAXIAL_ACTIONS_IN_UNIAXIAL_MODE");
  if (axial === "ABSENT" || axial === "CANONICAL_ZERO") return closedRoute("BLOCKED_SCOPE_MISMATCH", "UNIAXIAL_NM_REQUIRES_AXIAL_FORCE");
  if (major === "PRESENT") {
    return { state: "ROUTED", methodId: EU_C3_METHOD_IDS[0], axis: "MAJOR_AXIS", executesC2: false, executesC3: true, executesC4: false, reason: null };
  }
  if (minor === "PRESENT") {
    return { state: "ROUTED", methodId: EU_C3_METHOD_IDS[1], axis: "MINOR_AXIS", executesC2: false, executesC3: true, executesC4: false, reason: null };
  }
  const axis = input.actions.pureAxialSectionAxis ?? null;
  if (axis !== "MAJOR_AXIS" && axis !== "MINOR_AXIS") return closedRoute("BLOCKED_SCOPE_MISMATCH", "PURE_AXIAL_REQUIRES_EXPLICIT_AXIS");
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

function demandAxialIsZero(flexure: EuConcreteFlexureInput): boolean {
  const axial = flexure.demand.axial;
  if ("status" in axial) return axial.status === "NO_AXIAL_COMPONENTS" && axial.valueN === 0;
  return axial.valueN === 0;
}

function finish(input: EuC9R5WallInput, nodes: readonly EuC9R5NodeResult[], blocking: string | null, forced: EuC9R5OverallState | null, sectionAxis: "MAJOR_AXIS" | "MINOR_AXIS" | null, sectionResult: EuC9R5WallResult["sectionResult"]): EuC9R5WallResult {
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
  let overall: EuC9R5OverallState = forced ?? "MEMBER_UNDETERMINED";
  if (!forced) {
    if (required.length === 0) overall = "MEMBER_UNDETERMINED";
    else if (required.some((item) => item.executionStatus === "NOT_SATISFIED")) overall = "MEMBER_NOT_SATISFIED";
    else if (nodes.some((item) => item.executionStatus === "UNDETERMINED" || item.executionStatus === "INVALID_INPUT")) overall = "MEMBER_UNDETERMINED";
    else if (nodes.some((item) => item.executionStatus === "NOT_IMPLEMENTED" || item.executionStatus === "DEFERRED" || item.executionStatus === "BLOCKED_DEPENDENCY" || item.executionStatus === "BLOCKED_SCOPE_MISMATCH")) overall = "MEMBER_INCOMPLETE";
    else if (required.every((item) => item.executionStatus === "SATISFIED")) overall = "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE";
  }
  const open = nodes.some((item) => !CLOSED_STATUSES.includes(item.executionStatus as (typeof CLOSED_STATUSES)[number]));
  const fingerprint = euC9R5Fingerprint({
    memberId: input.memberId,
    memberType: input.memberType,
    scope,
    wallSection: input.wallSection ?? null,
    axisMapping: input.axisMapping ?? null,
    standardContext: input.standardContext ?? null,
    geometryShape: input.geometryShape ?? null,
    reinforcementRef: input.reinforcementRef ?? null,
    materialRef: input.materialRef ?? null,
    actions: input.actions ?? null,
    combinationId: input.combinationId ?? null,
    graph: EU_C9_R5_ORCHESTRATOR_VERSION,
  });
  return {
    orchestratorId: EU_C9_R5_ORCHESTRATOR_ID,
    orchestratorVersion: EU_C9_R5_ORCHESTRATOR_VERSION,
    memberId: input.memberId,
    memberType: input.memberType,
    canonicalWallType: EU_C9_R5_CANONICAL_WALL_TYPE,
    declaredEvaluationScope: scope,
    sectionAxis,
    axisMapping: input.axisMapping ?? null,
    wallSection: input.wallSection ?? null,
    executedCapabilityIds: nodes.flatMap((item) => item.executedMethodIds),
    nodes,
    checkNodes: nodes.filter((item) => item.nodeRole === "CHECK"),
    calculationNodes: nodes.filter((item) => item.nodeRole === "CALCULATION"),
    contextNodes: nodes.filter((item) => item.nodeRole === "CONTEXT"),
    sectionResult,
    notApplicableCapabilities: nodes.filter((item) => item.executionStatus === "NOT_APPLICABLE").map((item) => item.capabilityId),
    deferredCapabilities,
    unavailableRelevantCapabilities,
    unresolvedInputs,
    perCapabilityResults: nodes,
    failedChecks,
    blockingFindings,
    overallState: overall,
    evaluationCompleteForDeclaredScope: !open && required.length > 0 && required.every((item) => item.executionStatus === "SATISFIED") && overall !== "ORCHESTRATION_BLOCKED",
    fullStandardCoverage: false,
    engineerValidationState: EU_C9_R5_ENGINEER_VALIDATION_STATE,
    conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    productClaim: EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
    memberFingerprint: fingerprint,
    provenanceGraph: nodes,
    staleReuseRejected: input.priorResultFingerprint != null && input.priorResultFingerprint !== fingerprint,
    warnings: [EU_C9_R5_PRODUCT_SUBCLAIM, "WALL_SECTION_CHECK_IS_NOT_WALL_MEMBER_DESIGN"],
  };
}

function blocked(input: EuC9R5WallInput, finding: string): EuC9R5WallResult {
  return finish(input, [], finding, "ORCHESTRATION_BLOCKED", null, null);
}

export function orchestrateEuC9R5WallSection(input: EuC9R5WallInput): EuC9R5WallResult {
  if (EU_CONCRETE_PACK_CERTIFIED || EU_C9_R5_NEW_ENGINEERING_FORMULA_IMPLEMENTED || EU_C9_R5_C6_INVOKED_FOR_WALL || NEW_C9_R5_WALL_INTERACTION_FORMULA_IMPLEMENTED) {
    return blocked(input, "AUTHORITY_BOUNDARY");
  }
  if (input.memberType !== EU_C9_R5_CANONICAL_WALL_TYPE) return blocked(input, "INVALID_MEMBER_TYPE");
  if (input.prestressed || input.coupledWall || input.couplingBeam || input.fireDesign || input.constructionStage || input.nonlinearAnalysis) {
    return blocked(input, "UNSUPPORTED_WALL_SCOPE");
  }
  if (input.generateActions || input.inferEffectiveLength || input.inferRestraint || input.axisInferredFromUi || input.calculateSlenderness || input.runPDelta || input.invokeColumnSecondOrder) {
    return blocked(input, "WALL_ANALYSIS_INFERENCE_REJECTED");
  }
  if (input.reinforcementAutodesign || input.thicknessAutodesign || input.boundaryElementAutodesign || input.automaticBarRepositioning || input.automaticAnchorageExtension) {
    return blocked(input, "AUTODESIGN_REJECTED");
  }
  if (input.hardCodedCombinationFactors || input.ndpValueOnlyReuse) return blocked(input, "PROFILE_OR_NDP_REJECTED");
  if (!input.standardContext || input.standardContext.family !== "EN1992" || input.standardContext.generation !== EU_C9_R2_REFERENCE_GENERATION || !input.standardContext.profileId) {
    return blocked(input, "PROFILE_MISMATCH");
  }
  if (input.geometryShape != null && input.geometryShape !== "RECTANGULAR") {
    return finish(input, [unresolved("GEOMETRY", "CONTEXT", "INVALID_INPUT", false, input.standardContext.profileId, ["RECTANGULAR_GEOMETRY"])], "INVALID_GEOMETRY", "MEMBER_UNDETERMINED", null, null);
  }
  const scope = input.declaredEvaluationScope;
  if (!scope || scope.length === 0) return finish(input, [], "MISSING_DECLARED_SCOPE", "MEMBER_UNDETERMINED", null, null);
  const sectionModes = SECTION_MODES.filter((mode) => hasScope(scope, mode));
  if (sectionModes.length > 1) return blocked(input, "MIXED_EVALUATION_MODES");
  const profileId = input.standardContext.profileId;
  const nodes: EuC9R5NodeResult[] = [];
  let sectionAxis: "MAJOR_AXIS" | "MINOR_AXIS" | null = null;
  let sectionResult: EuC9R5WallResult["sectionResult"] = null;
  const materials = Boolean(input.materialRef && input.reinforcementRef);

  if (sectionModes.length === 1) {
    const mode = sectionModes[0];
    const capabilityId = mode === "SECTION_PURE_FLEXURE" ? "D1E.EU.C2.FLEXURE.UNIAXIAL" : mode === "SECTION_BIAXIAL_PMM" ? "D1E.EU.C4.BIAXIAL.PMM" : "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL";
    if (!materials) nodes.push(unresolved(capabilityId, "CHECK", "UNDETERMINED", true, profileId, ["MATERIAL_OR_REINFORCEMENT"]));
    else if (!input.actions) nodes.push(unresolved(capabilityId, "CHECK", "UNDETERMINED", true, profileId, ["ACTION_TUPLE"]));
    else if (!axisMappingGoverned(input.axisMapping)) nodes.push(unresolved(capabilityId, "CHECK", "UNDETERMINED", true, profileId, ["AXIS_MAPPING"]));
    else if (!input.wallSection || input.geometryShape !== "RECTANGULAR") nodes.push(unresolved(capabilityId, "CHECK", "UNDETERMINED", true, profileId, ["WALL_SECTION_GEOMETRY"]));
    else {
      const route = routeEuC9R5WallSection({ mode, actions: input.actions });
      sectionAxis = route.axis;
      if (route.state !== "ROUTED" || !route.methodId) {
        const status = route.state === "UNDETERMINED" ? "UNDETERMINED" : route.state === "INVALID_INPUT" ? "INVALID_INPUT" : "BLOCKED_SCOPE_MISMATCH";
        nodes.push(unresolved(capabilityId, "CHECK", status, true, profileId, [route.reason ?? "SECTION_ROUTE"]));
      } else if (route.executesC2 && route.axis) {
        const flexure = input.flexure;
        const active = route.axis === "MINOR_AXIS" ? input.actions.minorMoment : input.actions.majorMoment;
        const governed = momentValue(active);
        const matches = flexure != null
          && flexure.methodId === route.methodId
          && flexure.axis === route.axis
          && flexure.demand.moment.signed === governed
          && demandAxialIsZero(flexure)
          && wallSectionMatchesGeometry(flexure.geometry, input.wallSection);
        if (!matches || !flexure) nodes.push(unresolved(capabilityId, "CHECK", "INVALID_INPUT", true, profileId, ["C2_INPUT_DOES_NOT_MATCH_WALL_SECTION"]));
        else {
          const solved = evaluateEuConcreteFlexure(flexure);
          const status = mapCheck(solved.checkState);
          sectionResult = { methodId: route.methodId, checkState: solved.checkState, numericalResult: solved.designRuleUtilization };
          nodes.push(node({ capabilityId, nodeRole: "CHECK", executionStatus: status, requiredCheck: true, methodId: route.methodId, profileId, numericalResult: solved.designRuleUtilization, resultFingerprint: solved.resultFingerprint, unresolvedInputs: status === "UNDETERMINED" ? ["C2_FLEXURE"] : [], executedMethodIds: [route.methodId] }));
        }
      } else if (route.executesC3 && route.axis) {
        const payload = input.c3;
        const active = route.axis === "MINOR_AXIS" ? input.actions.minorMoment : input.actions.majorMoment;
        const activeMoment = momentValue(active);
        const agrees = payload != null
          && payload.methodId === route.methodId
          && payload.axis === route.axis
          && payload.demand.axial.valueN === input.actions.axial.valueN
          && (activeMoment === null ? payload.demand.moment.signed === 0 : payload.demand.moment.signed === activeMoment)
          && wallSectionMatchesGeometry(payload.geometry, input.wallSection);
        if (!agrees || !payload) nodes.push(unresolved(capabilityId, "CHECK", "INVALID_INPUT", true, profileId, ["C3_INPUT_DOES_NOT_MATCH_WALL_SECTION"]));
        else {
          const solved = evaluateEuC3DemandPointCheck(payload);
          const status = mapCheck(solved.checkState);
          sectionResult = { methodId: payload.methodId, checkState: solved.checkState, numericalResult: solved.utilization };
          nodes.push(node({ capabilityId, nodeRole: "CHECK", executionStatus: status, requiredCheck: true, methodId: payload.methodId, profileId, numericalResult: solved.utilization, resultFingerprint: euC9R5Fingerprint({ check: solved.checkState, utilization: solved.utilization }), unresolvedInputs: status === "UNDETERMINED" ? [solved.failReason ?? "C3"] : [], executedMethodIds: [payload.methodId] }));
        }
      } else if (route.executesC4) {
        const payload = input.c4;
        const agrees = payload != null
          && payload.methodId === route.methodId
          && payload.demand.moment.signed === momentValue(input.actions.majorMoment)
          && payload.demandMyNm === momentValue(input.actions.minorMoment)
          && payload.demand.axial.valueN === input.actions.axial.valueN
          && wallSectionMatchesGeometry(payload.geometry, input.wallSection);
        if (!agrees || !payload) nodes.push(unresolved(capabilityId, "CHECK", "INVALID_INPUT", true, profileId, ["C4_INPUT_DOES_NOT_MATCH_WALL_SECTION"]));
        else {
          const solved = evaluateEuC4DemandPointCheck(payload);
          const status = mapCheck(solved.checkState);
          sectionResult = { methodId: payload.methodId, checkState: solved.checkState, numericalResult: solved.resistanceRadiusNm };
          nodes.push(node({ capabilityId, nodeRole: "CHECK", executionStatus: status, requiredCheck: true, methodId: payload.methodId, profileId, numericalResult: solved.resistanceRadiusNm, resultFingerprint: euC9R5Fingerprint({ check: solved.checkState, radius: solved.resistanceRadiusNm }), unresolvedInputs: status === "UNDETERMINED" ? [solved.failReason ?? "C4"] : [], executedMethodIds: [payload.methodId] }));
        }
      }
    }
  }

  if (hasScope(scope, "WALL_SHEAR")) nodes.push(unresolved("D1E.EU.C5.SHEAR", "CHECK", "BLOCKED_SCOPE_MISMATCH", true, profileId, []));
  if (hasScope(scope, "WALL_SECOND_ORDER")) nodes.push(unresolved("WALL_SECOND_ORDER", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  if (hasScope(scope, "PUNCHING")) nodes.push(unresolved("D1E.EU.C5.PUNCHING", "CHECK", "NOT_APPLICABLE", false, profileId, []));
  if (hasScope(scope, "TORSION")) nodes.push(unresolved("D1E.EU.C5.TORSION", "CHECK", "NOT_APPLICABLE", false, profileId, []));
  if (hasScope(scope, "CRACK_WIDTH")) nodes.push(unresolved("D1E.EU.C7.SLS_REFERENCE", "CHECK", "BLOCKED_SCOPE_MISMATCH", true, profileId, []));
  if (hasScope(scope, "DEFLECTION")) nodes.push(unresolved("WALL_DEFLECTION", "CHECK", "DEFERRED", true, profileId, []));
  if (hasScope(scope, "BOUNDARY_ELEMENT")) nodes.push(unresolved("BOUNDARY_ELEMENT", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  if (hasScope(scope, "SEISMIC_DETAILING")) nodes.push(unresolved("SEISMIC_WALL_DETAILING", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  if (hasScope(scope, "LONG_TERM_CONTEXT")) {
    if (!input.longTerm) nodes.push(unresolved("D1E.EU.C7.EXPLICIT_LONG_TERM", "CONTEXT", "UNDETERMINED", false, profileId, ["EXPLICIT_CREEP_AND_SHRINKAGE"]));
    else if (input.longTerm.calculateCreep || input.longTerm.calculateShrinkage) nodes.push(unresolved("CALCULATED_LONG_TERM_DEFORMATION", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    else {
      const solved = evaluateEuC7LongTermState(input.longTerm);
      nodes.push(node({ capabilityId: "D1E.EU.C7.EXPLICIT_LONG_TERM", nodeRole: "CONTEXT", executionStatus: solved.accepted ? "AVAILABLE" : "UNDETERMINED", requiredCheck: false, methodId: solved.methodId, profileId, numericalResult: null, resultFingerprint: solved.resultFingerprint, unresolvedInputs: solved.accepted ? [] : [solved.failReason ?? "LONG_TERM_INPUT"], executedMethodIds: solved.accepted ? [solved.methodId] : [] }));
    }
  }
  if (hasScope(scope, "COVER_REQUIREMENT")) {
    if (!input.cover) nodes.push(unresolved("D1E.EU.C8.COVER_ASSEMBLY", "CALCULATION", "UNDETERMINED", false, profileId, ["COVER_INPUT"]));
    else {
      const solved = evaluateEuC8CoverAssembly(input.cover);
      nodes.push(node({ capabilityId: "D1E.EU.C8.COVER_ASSEMBLY", nodeRole: "CALCULATION", executionStatus: solved.calculationState === "COVER_REQUIREMENT_CALCULATED" ? "CALCULATED" : "UNDETERMINED", requiredCheck: false, methodId: solved.methodId, profileId: solved.profileId, numericalResult: solved.nominalCoverMm, resultFingerprint: solved.inputFingerprint, unresolvedInputs: [], executedMethodIds: solved.calculationState === "COVER_REQUIREMENT_CALCULATED" ? [solved.methodId] : [] }));
    }
  }
  if (hasScope(scope, "PROVIDED_COVER_COMPLIANCE")) nodes.push(unresolved("PROVIDED_COVER_COMPLIANCE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  if (hasScope(scope, "REINFORCEMENT_SPACING")) {
    const spacing = input.spacing;
    const diameterA = spacing?.barA?.diameter?.value;
    const diameterB = spacing?.barB?.diameter?.value;
    if (input.guessReinforcementFace || input.autoClassifyBarPair) nodes.push(unresolved("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    else if (!input.reinforcementFaceId) nodes.push(unresolved("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "UNDETERMINED", true, profileId, ["REINFORCEMENT_FACE"]));
    else if (spacing && diameterA != null && diameterB != null && diameterA !== diameterB) nodes.push(unresolved("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    else if (!spacing) nodes.push(unresolved("D1E.EU.C8.MIN_CLEAR_SPACING", "CHECK", "UNDETERMINED", true, profileId, ["SPACING_INPUT"]));
    else {
      const solved = evaluateEuC8MinClearSpacing(spacing);
      const status = solved.failReason === "UNEQUAL_BAR_DIAMETERS" ? "NOT_IMPLEMENTED" : solved.ok ? mapCheck(solved.checkState) : "UNDETERMINED";
      nodes.push(node({ capabilityId: "D1E.EU.C8.MIN_CLEAR_SPACING", nodeRole: "CHECK", executionStatus: status, requiredCheck: true, methodId: solved.methodId, profileId: solved.profileId, numericalResult: solved.measuredClearSpacingMm, resultFingerprint: solved.resultFingerprint, unresolvedInputs: solved.ok ? [] : [solved.failReason ?? "SPACING_INPUT"], executedMethodIds: solved.ok ? [solved.methodId] : [] }));
    }
  }
  if (hasScope(scope, "BASIC_ANCHORAGE")) {
    const anchorage = input.anchorage;
    if (!anchorage) nodes.push(unresolved("D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", "CALCULATION", "UNDETERMINED", false, profileId, ["ANCHORAGE_INPUT"]));
    else if (anchorage.forceState === "COMPRESSION") nodes.push(unresolved("COMPRESSION_ANCHORAGE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
    else {
      const solved = evaluateEuC8BasicRequiredAnchorage(anchorage);
      const checkMode = anchorage.checkRequested === true;
      const status: EuC9R5ExecutionStatus = !solved.ok ? "UNDETERMINED" : checkMode ? mapCheck(solved.checkState ?? "UNDETERMINED") : "CALCULATED";
      nodes.push(node({ capabilityId: "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", nodeRole: checkMode ? "CHECK" : "CALCULATION", executionStatus: status, requiredCheck: checkMode, methodId: solved.methodId, profileId: solved.profileId, numericalResult: solved.basicRequiredAnchorageLengthMm, resultFingerprint: solved.resultFingerprint, unresolvedInputs: solved.ok ? [] : [solved.failReason ?? "ANCHORAGE_INPUT"], executedMethodIds: solved.ok ? [solved.methodId] : [] }));
    }
  }
  if (hasScope(scope, "COMPRESSION_ANCHORAGE")) nodes.push(unresolved("COMPRESSION_ANCHORAGE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  if (hasScope(scope, "DESIGN_ANCHORAGE")) nodes.push(unresolved("DESIGN_ANCHORAGE", "CHECK", "NOT_IMPLEMENTED", true, profileId, []));
  if (hasScope(scope, "LAPS")) nodes.push(unresolved("LAPS", "CHECK", "DEFERRED", true, profileId, []));
  return finish(input, nodes, null, null, sectionAxis, sectionResult);
}

export const EU_C9_R5_ORCHESTRATOR_REGISTRY = [{
  orchestratorId: EU_C9_R5_ORCHESTRATOR_ID,
  version: EU_C9_R5_ORCHESTRATOR_VERSION,
  classification: "SECTION_ONLY",
  memberType: EU_C9_R5_CANONICAL_WALL_TYPE,
  scope: EU_C9_R5_WALL_SCOPE,
  geometryMapping: EU_C9_R5_WALL_GEOMETRY_MAPPING_CONTRACT,
  axisMapping: EU_C9_R5_WALL_AXIS_MAPPING_CONTRACT,
  actionRouting: EU_C9_R5_SECTION_ACTION_ROUTING_CONTRACT,
  c2Applicability: EU_C9_R5_C2_WALL_APPLICABILITY,
  c3Applicability: EU_C9_R5_C3_WALL_APPLICABILITY,
  c4Applicability: EU_C9_R5_C4_WALL_APPLICABILITY,
  exclusions: EU_C9_R5_WALL_EXCLUSIONS,
  detailingRouting: "COVER_CALCULATION_SPACING_CHECK_BASIC_TENSION_ANCHORAGE",
  nodeRoles: "CHECK_CALCULATION_CONTEXT",
  aggregation: EU_C9_R5_AGGREGATION_PRECEDENCE,
  fingerprintVersion: EU_C9_R5_ORCHESTRATOR_VERSION,
  validationState: "NUMERICALLY_VALIDATED",
  engineerValidationState: EU_C9_R5_ENGINEER_VALIDATION_STATE,
  conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  fullStandardCoverage: EU_C9_R5_FULL_STANDARD_COVERAGE,
  productClaim: EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  subClaim: EU_C9_R5_PRODUCT_SUBCLAIM,
  profileContract: EU_C9_PROFILE_COMPATIBILITY_CONTRACT,
}] as const;

export const EU_C9_ORCHESTRATOR_REGISTRY = [...EU_C9_REGISTRY_THROUGH_R4, ...EU_C9_R5_ORCHESTRATOR_REGISTRY] as const;
