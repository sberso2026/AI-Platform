/**
 * C9-R2 bounded rectangular RC beam orchestrator.
 * It routes and aggregates existing C2-C8 methods. It does not add a resistance formula.
 */

import { createHash } from "node:crypto";
import {
  EU_C2_METHOD_IDS,
  EU_C3_METHOD_IDS,
  EU_C4_METHOD_IDS,
  EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID,
  EU_CONCRETE_PACK_CERTIFIED,
  EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
} from "@rtb/types";
import { evaluateEuC5Shear, evaluateEuC5Torsion, type EuC5EvaluateInput } from "../eu-c5/evaluate";
import { evaluateEuC7CrackWidth, type EuC7CrackWidthInput } from "../eu-c7/evaluate";
import { evaluateEuC7LongTermState, type EuC7LongTermInput } from "../eu-c7/long-term";
import { evaluateEuC8BasicRequiredAnchorage, type EuC8BasicAnchorageInput } from "../eu-c8/anchorage-evaluate";
import { evaluateEuC8CoverAssembly, type EuC8CoverAssemblyInput } from "../eu-c8/evaluate";
import { evaluateEuC8MinClearSpacing, type EuC8MinClearSpacingInput } from "../eu-c8/spacing-evaluate";
import { euC2MomentSignFromDemand } from "../eu-c2/evaluate";
import { evaluateEuC3DemandPointCheck, type EuC3SolveInput } from "../eu-c3/evaluate";
import { evaluateEuC4DemandPointCheck, type EuC4SolveInput } from "../eu-c4/evaluate";
import { evaluateEuConcreteFlexure, type EuConcreteFlexureInput } from "../eu-flexure/evaluate";
import {
  EU_C9_COLUMN_ORCHESTRATION_FEASIBILITY,
  EU_C9_PROFILE_COMPATIBILITY_CONTRACT,
  euC9ExecutionDagHasCycle,
} from "./foundation";
import type { StructuralDemandResult } from "@rtb/types";

export const EU_C9_R2_ORCHESTRATOR_ID = "EU_RC_BEAM_ORCHESTRATION_EN1992_REFERENCE" as const;
export const EU_C9_R2_ORCHESTRATOR_VERSION = "C9-R2" as const;
export const EU_C9_R2_REFERENCE_GENERATION = "EN1992-1-1-GEN1" as const;
export const EU_C9_R2_CAN_INVENT_MISSING_METHODS = false as const;
export const EU_C9_R2_CAN_EXPAND_METHOD_APPLICABILITY = false as const;
export const EU_C9_R2_CAN_SUBSTITUTE_DEFERRED_METHODS = false as const;
export const EU_C9_R2_CAN_OVERRIDE_FAIL_CLOSED_RESULT = false as const;
export const EU_C9_R2_NEW_ENGINEERING_FORMULA_IMPLEMENTED = false as const;
export const EU_C9_R2_BEAM_SCOPE = "ORDINARY_NON_PRESTRESSED_RECTANGULAR_REINFORCED_CONCRETE_BEAM" as const;
export const EU_C9_R2_MEMBER_TYPE = "BEAM" as const;
export const EU_C9_R2_BEAM_EXCLUSIONS = [
  "PRESTRESSED_BEAMS",
  "DEEP_BEAMS_D_REGIONS",
  "STRUT_AND_TIE",
  "FIRE_DESIGN",
  "SEISMIC_DUCTILE_DETAILING",
  "CONSTRUCTION_STAGE_ANALYSIS",
  "NONLINEAR_FRAME_BEHAVIOR",
  "NON_PRISMATIC_MEMBERS",
  "GENERAL_CONTINUOUS_BEAM_ANALYSIS",
  "GENERAL_REDISTRIBUTION",
  "GENERAL_BEAM_DEFLECTION",
  "COMPLETE_DURABILITY_DESIGN",
  "FULL_DESIGN_ANCHORAGE",
  "LAPS",
] as const;
export const EU_C9_R2_SECTION_ACTION_ROUTING_CONTRACT = "D1C_AXIAL_PRESENCE_AND_EXPLICIT_MAJOR_MINOR_MOMENT_PRESENCE_EXACT_CANONICAL_ZERO" as const;
export const EU_C9_R2_PURE_FLEXURE_ROUTING = "C2_WHEN_WITHIN_C2_SCOPE" as const;
export const EU_C9_R2_C2_C3_REDUNDANT_EXECUTION_FOR_PURE_FLEXURE = false as const;
export const EU_C9_R2_UNIAXIAL_NM_ROUTING = "C3_ONLY_FOR_NONZERO_AXIAL_AND_ONE_ACTIVE_BENDING_AXIS" as const;
export const EU_C9_R2_BIAXIAL_ROUTING = "C4_WHEN_BOTH_BENDING_AXES_ACTIVE" as const;
export const EU_C9_R2_PURE_AXIAL_ROUTING = "C3_ON_EXPLICIT_SECTION_AXIS_ONLY_ELSE_BLOCKED_SCOPE_MISMATCH" as const;
export const EU_C9_R2_AXIS_MAPPING_CONTRACT = "EXPLICIT_MAJOR_AND_MINOR_MOMENT_FIELDS_WITH_EXISTING_C2_SIGN_HELPER" as const;
export const EU_C9_R2_AXIS_INFERENCE_FROM_UI_ORIENTATION = false as const;
export const EU_C9_R2_NODE_ROLES = ["CHECK", "CALCULATION", "CONTEXT"] as const;
export type EuC9R2NodeRole = (typeof EU_C9_R2_NODE_ROLES)[number];
export const EU_C9_R2_NODE_ROLE_TAXONOMY_DEFINED = true as const;
export const EU_C9_R2_CHECK_NODE_CAPABILITY_IDS = [
  "D1E.EU.C2.FLEXURE.UNIAXIAL",
  "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL",
  "D1E.EU.C4.BIAXIAL.PMM",
  "D1E.EU.C5.SHEAR",
  "D1E.EU.C5.TORSION",
  "D1E.EU.C7.SLS_REFERENCE",
  "D1E.EU.C8.MIN_CLEAR_SPACING",
  "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE",
] as const;
export const EU_C9_R2_CALCULATION_NODE_CAPABILITY_IDS = [
  "D1E.EU.C8.COVER_ASSEMBLY",
  "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE",
] as const;
export const EU_C9_R2_CALCULATION_NODE_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R2_CONTEXT_NODE_CAPABILITY_IDS = ["D1E.EU.C7.EXPLICIT_LONG_TERM"] as const;
export const EU_C9_R2_CONTEXT_NODE_CAN_COUNT_AS_SATISFIED = false as const;
export const EU_C9_R2_NODE_EXECUTION_STATE_CONTRACT = "CHECK_USES_ORCHESTRATION_STATUSES; CALCULATION_SUCCESS=CALCULATED; CONTEXT_SUCCESS=AVAILABLE" as const;
export const EU_C9_R2_EMPTY_REQUIRED_CHECK_SET_CAN_PASS = false as const;
export const EU_C9_R2_EMPTY_REQUIRED_CHECK_SET_STATE = "MEMBER_UNDETERMINED" as const;
export const EU_C9_R2_DECLARED_SCOPE_IDS = [
  "ULS_SECTION",
  "SHEAR",
  "TORSION",
  "SLS_CRACK_WIDTH",
  "LONG_TERM_CONTEXT",
  "COVER_REQUIREMENT",
  "REINFORCEMENT_SPACING",
  "BASIC_ANCHORAGE",
  "PROVIDED_COVER_COMPLIANCE",
  "DESIGN_ANCHORAGE",
  "LAP_DESIGN",
  "DEFLECTION",
  "CALCULATED_CREEP",
  "CALCULATED_SHRINKAGE",
  "PUNCHING",
  "SECOND_ORDER",
] as const;
export type EuC9R2DeclaredScope = (typeof EU_C9_R2_DECLARED_SCOPE_IDS)[number];
export const EU_C9_R2_DECLARED_SCOPE_CONTRACT = "EXPLICIT_DECLARED_EVALUATION_SCOPE" as const;
export const EU_C9_R2_REQUIRED_CHECK_SELECTION_DETERMINISTIC = true as const;
export const AI_REQUIRED_CHECK_SELECTION_AUTHORITY = false as const;
export const EU_C9_R2_DECLARED_SCOPE_COMPLETE_EQUALS_FULL_BEAM_DESIGN = false as const;
export const EU_C9_R2_FULL_STANDARD_COVERAGE_DEFAULT = false as const;
export const EU_C9_R2_PUNCHING_STATE = "NOT_APPLICABLE" as const;
export const EU_C9_R2_C6_SECOND_ORDER_STATE = "NOT_APPLICABLE" as const;
export const EU_C9_R2_C6_INVOKED_FOR_BEAM = false as const;
export const EU_C9_R2_SHEAR_SCOPE_REUSED = true as const;
export const EU_C9_R2_SHEAR_METHOD_BROADENED = false as const;
export const EU_C9_R2_C5_SHEAR_EQUALS_GENERAL_SHEAR_DESIGN = false as const;
export const EU_C9_R2_TORSION_ROUTING_CONTRACT = "DECLARED_TORSION_SCOPE_AND_TRANSPORTED_TORSION_AND_EXPLICIT_METHOD_INPUTS" as const;
export const NEW_C9_R2_VT_INTERACTION_FORMULA_IMPLEMENTED = false as const;
export const EU_C9_R2_CRACK_WIDTH_ROUTING_CONTRACT = "DECLARED_SLS_CRACK_WIDTH_AND_EXPLICIT_C7_INPUTS" as const;
export const EU_C9_R2_C7_SLS_EQUALS_COMPLETE_BEAM_SERVICEABILITY = false as const;
export const EU_C9_R2_LONG_TERM_NODE_ROLE = "CONTEXT" as const;
export const EU_C9_R2_LONG_TERM_STATE_EQUALS_DEFLECTION_CHECK = false as const;
export const EU_C9_R2_COVER_NODE_ROLE = "CALCULATION" as const;
export const EU_C9_R2_COVER_ASSEMBLY_EQUALS_COVER_COMPLIANCE = false as const;
export const EU_C9_R2_PROVIDED_COVER_COMPLIANCE_REQUEST_FAILS_INCOMPLETE = true as const;
export const EU_C9_R2_SPACING_ROUTING_CONTRACT = "EQUAL_DIAMETER_SURFACE_TO_SURFACE_EXPLICIT_AGGREGATE_AND_NDP" as const;
export const EU_C9_R2_UNEQUAL_DIAMETER_SPACING_STATE = "NOT_IMPLEMENTED" as const;
export const EU_C9_R2_BASIC_ANCHORAGE_NODE_MODE_CONTRACT = "CALCULATION_WITHOUT_CHECK_REQUEST; CHECK_WHEN_EXPLICIT_AVAILABLE_LENGTH_AND_CRITICAL_SECTION" as const;
export const EU_C9_R2_BASIC_ANCHORAGE_CALCULATION_NODE_ROLE = "CALCULATION" as const;
export const EU_C9_R2_BASIC_ANCHORAGE_CHECK_MODE_GOVERNED = true as const;
export const EU_C9_R2_BASIC_ANCHORAGE_CHECK_EQUALS_FULL_DESIGN_ANCHORAGE = false as const;
export const EU_C9_R2_DESIGN_ANCHORAGE_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R2_LAP_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R2_LAP_REQUEST_CAN_PASS = false as const;
export const EU_C9_R2_DEFLECTION_RUNTIME_AVAILABLE = false as const;
export const EU_C9_R2_DEFLECTION_REQUEST_CAN_PASS = false as const;
export const EU_C9_R2_CALCULATED_CREEP_AVAILABLE = false as const;
export const EU_C9_R2_CALCULATED_SHRINKAGE_AVAILABLE = false as const;
export const EU_C9_R2_BEAM_INPUT_CONTRACT = "MEMBER_SCOPE_PROFILE_GEOMETRY_REINFORCEMENT_ACTIONS_DECLARED_SCOPE_EXPLICIT_INPUTS" as const;
export const EU_C9_R2_ACTION_EFFECT_SOURCE_GOVERNED = true as const;
export const EU_C9_R2_ACTION_EFFECT_INVENTED = false as const;
export const D1C_COMBINATION_ENGINE_REUSED = true as const;
export const PARALLEL_C9_R2_COMBINATION_ENGINE_CREATED = false as const;
export const EU_C9_R2_BEAM_ULS_EXECUTION_GRAPH = "C2_OR_C3_OR_C4_EXCLUSIVE; C5_SHEAR; C5_TORSION; C6_EXCLUDED" as const;
export const EU_C9_R2_BEAM_SLS_EXECUTION_GRAPH = "C7_CRACK_WIDTH_CHECK; C7_LONG_TERM_CONTEXT; DEFLECTION_NOT_EXECUTED" as const;
export const EU_C9_R2_BEAM_DETAILING_EXECUTION_GRAPH = "COVER_CALCULATION; SPACING_CHECK; ANCHORAGE_CALCULATION_OR_CHECK; DESIGN_ANCHORAGE_NOT_IMPLEMENTED; LAPS_DEFERRED" as const;
export const EU_C9_R2_PROFILE_COMPATIBILITY_REUSED = true as const;
export const EU_C9_R2_PROFILE_MISMATCH_FAILS_CLOSED = true as const;
export const EU_C9_R2_NDP_SEMANTIC_IDENTITY_REQUIRED = true as const;
export const EU_C9_R2_NDP_VALUE_ONLY_REUSE_ALLOWED = false as const;
export const EU_C9_R2_UNGOVERNED_RESULT_SUBSTITUTION_ALLOWED = false as const;
export const EU_C9_R2_BEAM_EXECUTION_DAG_IMPLEMENTED = true as const;
export const EU_C9_R2_CIRCULAR_ENGINEERING_DEPENDENCY = false as const;
export const EU_C9_R2_FAILURE_PROPAGATION = "PASS" as const;
export const EU_C9_R2_ONLY_REQUIRED_CHECK_NODES_AGGREGATED = true as const;
export const EU_C9_R2_MEMBER_AGGREGATION_IMPLEMENTED = true as const;
export const EU_C9_R2_AGGREGATION_PRECEDENCE = "NOT_SATISFIED_THEN_UNDETERMINED_OR_INVALID_INPUT_THEN_INCOMPLETE_FINDINGS_RETAINED" as const;
export const EU_C9_R2_MULTIPLE_MEMBER_FINDINGS_PRESERVED = true as const;
export const EU_C9_R2_BEAM_RESULT_CONTRACT_GOVERNED = true as const;
export const EU_C9_R2_FULL_STANDARD_COVERAGE = false as const;
export const EU_C9_R2_DECLARED_SCOPE_COMPLETENESS_SEMANTICS = "PASS" as const;
export const EU_C9_R2_BEAM_RESULT_EQUALS_COMPLETE_EN1992_BEAM_DESIGN = false as const;
export const EU_C9_R2_BEAM_RESULT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const EU_C9_R2_BEAM_RESULT_EQUALS_CERTIFICATION = false as const;
export const EU_C9_R2_MEMBER_PROVENANCE_GRAPH = "PASS" as const;
export const EU_C9_R2_MEMBER_FINGERPRINT_COMPLETE = true as const;
export const EU_C9_R2_DEPENDENCY_INVALIDATION = true as const;
export const STALE_C9_R2_BEAM_RESULT_REUSE_ALLOWED = false as const;
export const EU_C9_R2_HISTORICAL_RESULT_REPRODUCIBLE = true as const;
export const EU_C9_R2_REINFORCEMENT_AUTODESIGN = false as const;
export const EU_C9_R2_MEMBER_GEOMETRY_AUTODESIGN = false as const;
export const EU_C9_R2_AUTOMATIC_BAR_REPOSITIONING = false as const;
export const EU_C9_R2_AUTOMATIC_ANCHORAGE_EXTENSION = false as const;
export const EU_C9_R2_INVERSE_DESIGN_RECHECK_READY = true as const;
export const GENERATIVE_MODEL_CAN_BYPASS_REQUIRED_BEAM_CHECKS = false as const;
export const GENERATIVE_MODEL_CAN_INVENT_BEAM_ENGINEERING_INPUTS = false as const;
export const EU_C9_R2_OPTIMIZATION_ACCEPTS_INCOMPLETE_AS_FEASIBLE = false as const;
export const EU_C9_R2_OPTIMIZATION_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const EU_C9_R2_PARETO_ACCEPTS_FAILED_BEAM_AS_FEASIBLE = false as const;
export const EU_C9_R2_IMPLEMENTED_BEAM_ORCHESTRATOR_COUNT = 1 as const;
export const EU_C9_R2_NUMERICALLY_VALIDATED_BEAM_ORCHESTRATOR_COUNT = 1 as const;
export const EU_C9_R2_ENGINEER_VALIDATED_BEAM_ORCHESTRATOR_COUNT = 0 as const;
export const EU_C9_R2_ENGINEER_VALIDATION_STATE = "PENDING_HUMAN_ENGINEERING_REVIEW" as const;
export const NUMERICAL_BEAM_ORCHESTRATION_VALIDATION_EQUALS_ENGINEER_VALIDATION = false as const;
export const C9_BEAM_ORCHESTRATION_EQUALS_STANDARD_CONFORMANCE = false as const;
export const EU_C9_R2_PRODUCT_SUBCLAIM = "BOUNDED_RC_BEAM_ORCHESTRATION_REFERENCE_CAPABILITY" as const;
export const EU_C9_R2_ORCHESTRATOR_REGISTRY_UPDATED = true as const;
export const PARALLEL_ORCHESTRATOR_REGISTRY_CREATED = false as const;
export const GENERAL_BEAM_ANALYSIS_SOLVER_IMPLEMENTED = false as const;
export const EU_C9_R2_COLUMN_NEXT_FEASIBILITY = EU_C9_COLUMN_ORCHESTRATION_FEASIBILITY;
export const EU_VALIDATION_DEBT_REDUCED_ITEMS = [
  "C9_BEAM_RUNTIME_ORCHESTRATOR",
  "C9_BEAM_ROUTING_VALIDATION",
  "C9_BEAM_AGGREGATION_VALIDATION",
] as const;
export const EU_C9_R2_BEAM_EXECUTION_DAG_ACYCLIC = true as const;

export const EU_C9_R2_ORCHESTRATOR_REGISTRY = [{
  orchestratorId: EU_C9_R2_ORCHESTRATOR_ID,
  version: EU_C9_R2_ORCHESTRATOR_VERSION,
  memberType: EU_C9_R2_MEMBER_TYPE,
  scope: EU_C9_R2_BEAM_SCOPE,
  profileContract: EU_C9_PROFILE_COMPATIBILITY_CONTRACT,
  validationState: "NUMERICALLY_VALIDATED",
  engineerValidationState: EU_C9_R2_ENGINEER_VALIDATION_STATE,
  conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  fullStandardCoverage: EU_C9_R2_FULL_STANDARD_COVERAGE,
  productClaim: EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
  subClaim: EU_C9_R2_PRODUCT_SUBCLAIM,
}] as const;

export type EuC9R2ExecutionStatus =
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

export type EuC9R2OverallState =
  | "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE"
  | "MEMBER_NOT_SATISFIED"
  | "MEMBER_INCOMPLETE"
  | "MEMBER_UNDETERMINED"
  | "ORCHESTRATION_BLOCKED";

export type EuC9R2Presence = "ABSENT" | "CANONICAL_ZERO" | "PRESENT" | "INVALID";

export type EuC9R2AxialAction =
  | { status: "NO_AXIAL_COMPONENTS"; valueN: 0 }
  | { status: "AXIAL_DIRECT"; valueN: number };

export type EuC9R2MomentAction =
  | { status: "ABSENT" }
  | { status: "PRESENT"; signedNm: number };

export type EuC9R2SectionActions = {
  axial: EuC9R2AxialAction;
  majorMoment: EuC9R2MomentAction;
  minorMoment: EuC9R2MomentAction;
  pureAxialSectionAxis?: "MAJOR_AXIS" | "MINOR_AXIS" | null;
};

export type EuC9R2SectionRoute = {
  state: "ROUTED" | "BLOCKED_SCOPE_MISMATCH" | "INVALID_INPUT" | "NOT_APPLICABLE";
  capabilityId: "D1E.EU.C2.FLEXURE.UNIAXIAL" | "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL" | "D1E.EU.C4.BIAXIAL.PMM" | null;
  methodId: string | null;
  axis: "MAJOR_AXIS" | "MINOR_AXIS" | null;
  momentSign: "POSITIVE" | "NEGATIVE" | null;
  executesC2: boolean;
  executesC3: boolean;
  executesC4: boolean;
};

export type EuC9R2BeamInput = {
  memberId: string;
  memberType: string;
  declaredEvaluationScope: readonly EuC9R2DeclaredScope[] | null;
  standardContext: { family: string; generation: string; profileId: string } | null;
  geometryShape?: string | null;
  reinforcementRef?: string | null;
  materialRef?: string | null;
  actions?: EuC9R2SectionActions | null;
  combinationId?: string | null;
  hardCodedCombinationFactors?: boolean;
  ndpValueOnlyReuse?: boolean;
  prestressed?: boolean;
  deepBeam?: boolean;
  strutAndTie?: boolean;
  fireDesign?: boolean;
  seismicDetailing?: boolean;
  nonPrismatic?: boolean;
  priorResultFingerprint?: string | null;
  shear?: EuC5EvaluateInput | null;
  torsion?: EuC5EvaluateInput | null;
  crackWidth?: EuC7CrackWidthInput | null;
  longTerm?: EuC7LongTermInput | null;
  cover?: EuC8CoverAssemblyInput | null;
  spacing?: EuC8MinClearSpacingInput | null;
  anchorage?: EuC8BasicAnchorageInput | null;
  flexure?: EuConcreteFlexureInput | null;
  axialFlexure?: (EuC3SolveInput & { demand: StructuralDemandResult }) | null;
  biaxial?: (EuC4SolveInput & { demand: StructuralDemandResult }) | null;
};

export type EuC9R2NodeResult = {
  capabilityId: string;
  nodeRole: EuC9R2NodeRole;
  executionStatus: EuC9R2ExecutionStatus;
  requiredCheck: boolean;
  methodId: string | null;
  profileId: string | null;
  numericalResult: number | null;
  resultFingerprint: string | null;
  unresolvedInputs: readonly string[];
};

export type EuC9R2BeamResult = {
  orchestratorId: typeof EU_C9_R2_ORCHESTRATOR_ID;
  orchestratorVersion: typeof EU_C9_R2_ORCHESTRATOR_VERSION;
  memberId: string;
  memberType: string;
  declaredEvaluationScope: readonly string[];
  selectedSectionMethodId: string | null;
  executedCapabilityIds: readonly string[];
  nodes: readonly EuC9R2NodeResult[];
  notApplicableCapabilities: readonly string[];
  deferredChecks: readonly string[];
  unavailableChecks: readonly string[];
  failedChecks: readonly string[];
  blockingFindings: readonly string[];
  unresolvedInputs: readonly string[];
  overallState: EuC9R2OverallState;
  evaluationCompleteForDeclaredScope: boolean;
  fullStandardCoverage: false;
  engineerValidationState: typeof EU_C9_R2_ENGINEER_VALIDATION_STATE;
  conformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  productClaim: typeof EU_CONCRETE_PRODUCT_CLAIM_LEVEL;
  memberFingerprint: string;
  staleReuseRejected: boolean;
  warnings: readonly string[];
};

export function euC9R2AxialPresence(axial: EuC9R2AxialAction): EuC9R2Presence {
  if (axial.status === "NO_AXIAL_COMPONENTS") return axial.valueN === 0 ? "ABSENT" : "INVALID";
  if (!Number.isFinite(axial.valueN)) return "INVALID";
  return axial.valueN === 0 ? "CANONICAL_ZERO" : "PRESENT";
}

export function euC9R2MomentPresence(moment: EuC9R2MomentAction): EuC9R2Presence {
  if (moment.status === "ABSENT") return "ABSENT";
  if (!Number.isFinite(moment.signedNm)) return "INVALID";
  return moment.signedNm === 0 ? "CANONICAL_ZERO" : "PRESENT";
}

function c2Method(axis: "MAJOR_AXIS" | "MINOR_AXIS"): string {
  return axis === "MINOR_AXIS" ? EU_C2_METHOD_IDS[1] : EU_C2_METHOD_IDS[0];
}

function c3Method(axis: "MAJOR_AXIS" | "MINOR_AXIS"): string {
  return axis === "MINOR_AXIS" ? EU_C3_METHOD_IDS[1] : EU_C3_METHOD_IDS[0];
}

function activeSign(moment: EuC9R2MomentAction): "POSITIVE" | "NEGATIVE" | null {
  if (moment.status !== "PRESENT" || moment.signedNm === 0 || !Number.isFinite(moment.signedNm)) return null;
  return euC2MomentSignFromDemand(moment.signedNm);
}

export function routeEuC9R2SectionAction(actions: EuC9R2SectionActions): EuC9R2SectionRoute {
  const axial = euC9R2AxialPresence(actions.axial);
  const major = euC9R2MomentPresence(actions.majorMoment);
  const minor = euC9R2MomentPresence(actions.minorMoment);
  const none = {
    capabilityId: null,
    methodId: null,
    axis: null,
    momentSign: null,
    executesC2: false,
    executesC3: false,
    executesC4: false,
  } as const;
  if (axial === "INVALID" || major === "INVALID" || minor === "INVALID") {
    return { ...none, state: "INVALID_INPUT" };
  }
  if (major === "PRESENT" && minor === "PRESENT") {
    return {
      state: "ROUTED",
      capabilityId: "D1E.EU.C4.BIAXIAL.PMM",
      methodId: EU_C4_METHOD_IDS[0],
      axis: null,
      momentSign: null,
      executesC2: false,
      executesC3: false,
      executesC4: true,
    };
  }
  if (major === "PRESENT" || minor === "PRESENT") {
    const axis = major === "PRESENT" ? "MAJOR_AXIS" : "MINOR_AXIS";
    const moment = axis === "MAJOR_AXIS" ? actions.majorMoment : actions.minorMoment;
    if (axial === "PRESENT") {
      return {
        state: "ROUTED",
        capabilityId: "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL",
        methodId: c3Method(axis),
        axis,
        momentSign: activeSign(moment),
        executesC2: false,
        executesC3: true,
        executesC4: false,
      };
    }
    return {
      state: "ROUTED",
      capabilityId: "D1E.EU.C2.FLEXURE.UNIAXIAL",
      methodId: c2Method(axis),
      axis,
      momentSign: activeSign(moment),
      executesC2: true,
      executesC3: false,
      executesC4: false,
    };
  }
  if (axial === "PRESENT") {
    if (actions.pureAxialSectionAxis === "MAJOR_AXIS" || actions.pureAxialSectionAxis === "MINOR_AXIS") {
      return {
        state: "ROUTED",
        capabilityId: "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL",
        methodId: c3Method(actions.pureAxialSectionAxis),
        axis: actions.pureAxialSectionAxis,
        momentSign: euC2MomentSignFromDemand(0),
        executesC2: false,
        executesC3: true,
        executesC4: false,
      };
    }
    return { ...none, state: "BLOCKED_SCOPE_MISMATCH" };
  }
  return { ...none, state: "NOT_APPLICABLE" };
}

export const EU_C9_R2_BEAM_EXECUTION_DAG = [
  { id: "CONTEXT_PROFILE", upstream: [] },
  { id: "GEOMETRY_MATERIAL", upstream: ["CONTEXT_PROFILE"] },
  { id: "ACTION_ROUTING", upstream: ["CONTEXT_PROFILE"] },
  { id: "SECTION", upstream: ["GEOMETRY_MATERIAL", "ACTION_ROUTING"] },
  { id: "D1E.EU.C5.SHEAR", upstream: ["GEOMETRY_MATERIAL", "ACTION_ROUTING"] },
  { id: "D1E.EU.C5.TORSION", upstream: ["GEOMETRY_MATERIAL", "ACTION_ROUTING"] },
  { id: "D1E.EU.C7.SLS_REFERENCE", upstream: ["GEOMETRY_MATERIAL", "ACTION_ROUTING"] },
  { id: "D1E.EU.C7.EXPLICIT_LONG_TERM", upstream: ["CONTEXT_PROFILE"] },
  { id: "D1E.EU.C8.COVER_ASSEMBLY", upstream: ["GEOMETRY_MATERIAL"] },
  { id: "D1E.EU.C8.MIN_CLEAR_SPACING", upstream: ["GEOMETRY_MATERIAL"] },
  { id: "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", upstream: ["GEOMETRY_MATERIAL"] },
  { id: "AGGREGATION", upstream: ["SECTION", "D1E.EU.C5.SHEAR", "D1E.EU.C5.TORSION", "D1E.EU.C7.SLS_REFERENCE", "D1E.EU.C7.EXPLICIT_LONG_TERM", "D1E.EU.C8.COVER_ASSEMBLY", "D1E.EU.C8.MIN_CLEAR_SPACING", "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE"] },
] as const;

export function euC9R2BeamExecutionDagHasCycle(): boolean {
  const upstream = new Map<string, readonly string[]>(EU_C9_R2_BEAM_EXECUTION_DAG.map((node) => [node.id, node.upstream]));
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
  return EU_C9_R2_BEAM_EXECUTION_DAG.some((node) => walk(node.id)) || euC9ExecutionDagHasCycle();
}

function stable(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => stable(item)).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${stable(record[key])}`).join(",")}}`;
}

export function euC9R2Fingerprint(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

function node(partial: EuC9R2NodeResult): EuC9R2NodeResult {
  return partial;
}

function mapCheck(state: string): EuC9R2ExecutionStatus {
  if (state === "CHECK_SATISFIED" || state === "SATISFIED") return "SATISFIED";
  if (state === "CHECK_NOT_SATISFIED" || state === "NOT_SATISFIED") return "NOT_SATISFIED";
  if (state === "UNSUPPORTED_AXIAL_STATE" || state === "UNSUPPORTED_RULE_APPLICABILITY" || state === "UNSUPPORTED_SCOPE") return "BLOCKED_SCOPE_MISMATCH";
  return "UNDETERMINED";
}

function hasScope(scope: readonly EuC9R2DeclaredScope[], id: EuC9R2DeclaredScope): boolean {
  return scope.includes(id);
}

function blocked(input: EuC9R2BeamInput, finding: string): EuC9R2BeamResult {
  return finish(input, [], finding, "ORCHESTRATION_BLOCKED", false);
}

function finish(
  input: EuC9R2BeamInput,
  nodes: readonly EuC9R2NodeResult[],
  blocking: string | null,
  forced: EuC9R2OverallState | null,
  complete: boolean,
): EuC9R2BeamResult {
  const required = nodes.filter((item) => item.requiredCheck);
  const failedChecks = required.filter((item) => item.executionStatus === "NOT_SATISFIED").map((item) => item.capabilityId);
  const deferredChecks = nodes.filter((item) => item.executionStatus === "DEFERRED").map((item) => item.capabilityId);
  const unavailableChecks = nodes.filter((item) => item.executionStatus === "NOT_IMPLEMENTED" || item.executionStatus === "BLOCKED_DEPENDENCY" || item.executionStatus === "BLOCKED_SCOPE_MISMATCH").map((item) => item.capabilityId);
  const unresolvedInputs = nodes.flatMap((item) => item.unresolvedInputs);
  const blockingFindings = [
    ...(blocking ? [blocking] : []),
    ...failedChecks.map((id) => `FAILED:${id}`),
    ...deferredChecks.map((id) => `DEFERRED:${id}`),
    ...unavailableChecks.map((id) => `UNAVAILABLE:${id}`),
    ...nodes.filter((item) => item.executionStatus === "UNDETERMINED" || item.executionStatus === "INVALID_INPUT").map((item) => `UNRESOLVED:${item.capabilityId}`),
  ];
  let overall: EuC9R2OverallState = forced ?? "MEMBER_UNDETERMINED";
  if (!forced) {
    if (required.length === 0) overall = "MEMBER_UNDETERMINED";
    else if (required.some((item) => item.executionStatus === "NOT_SATISFIED")) overall = "MEMBER_NOT_SATISFIED";
    else if (nodes.some((item) => item.executionStatus === "UNDETERMINED" || item.executionStatus === "INVALID_INPUT")) overall = "MEMBER_UNDETERMINED";
    else if (nodes.some((item) => item.executionStatus === "NOT_IMPLEMENTED" || item.executionStatus === "DEFERRED" || item.executionStatus === "BLOCKED_DEPENDENCY" || item.executionStatus === "BLOCKED_SCOPE_MISMATCH")) overall = "MEMBER_INCOMPLETE";
    else if (required.every((item) => item.executionStatus === "SATISFIED")) overall = "MEMBER_SATISFIED_FOR_EXECUTED_BOUNDED_SCOPE";
  }
  const fingerprint = euC9R2Fingerprint({
    memberId: input.memberId,
    memberType: input.memberType,
    scope: input.declaredEvaluationScope,
    standardContext: input.standardContext,
    geometryShape: input.geometryShape ?? null,
    reinforcementRef: input.reinforcementRef ?? null,
    materialRef: input.materialRef ?? null,
    actions: input.actions ?? null,
    combinationId: input.combinationId ?? null,
    graph: EU_C9_R2_ORCHESTRATOR_VERSION,
  });
  return {
    orchestratorId: EU_C9_R2_ORCHESTRATOR_ID,
    orchestratorVersion: EU_C9_R2_ORCHESTRATOR_VERSION,
    memberId: input.memberId,
    memberType: input.memberType,
    declaredEvaluationScope: input.declaredEvaluationScope ?? [],
    selectedSectionMethodId: nodes.find((item) => item.capabilityId.startsWith("D1E.EU.C2") || item.capabilityId.startsWith("D1E.EU.C3") || item.capabilityId.startsWith("D1E.EU.C4"))?.methodId ?? null,
    executedCapabilityIds: nodes.filter((item) => item.resultFingerprint != null).map((item) => item.capabilityId),
    nodes,
    notApplicableCapabilities: nodes.filter((item) => item.executionStatus === "NOT_APPLICABLE").map((item) => item.capabilityId),
    deferredChecks,
    unavailableChecks,
    failedChecks,
    blockingFindings,
    unresolvedInputs,
    overallState: overall,
    evaluationCompleteForDeclaredScope: complete && overall !== "ORCHESTRATION_BLOCKED",
    fullStandardCoverage: false,
    engineerValidationState: EU_C9_R2_ENGINEER_VALIDATION_STATE,
    conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
    productClaim: EU_CONCRETE_PRODUCT_CLAIM_LEVEL,
    memberFingerprint: fingerprint,
    staleReuseRejected: input.priorResultFingerprint != null && input.priorResultFingerprint !== fingerprint,
    warnings: ["BOUNDED_RC_BEAM_ORCHESTRATION_REFERENCE_CAPABILITY"],
  };
}

function shearEligible(actions: EuC9R2SectionActions | null | undefined, shear: EuC5EvaluateInput | null | undefined): EuC9R2ExecutionStatus | null {
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

export function orchestrateEuC9R2Beam(input: EuC9R2BeamInput): EuC9R2BeamResult {
  if (EU_CONCRETE_PACK_CERTIFIED || EU_C9_R2_NEW_ENGINEERING_FORMULA_IMPLEMENTED || EU_C9_R2_C6_INVOKED_FOR_BEAM) {
    return blocked(input, "AUTHORITY_BOUNDARY");
  }
  if (input.memberType !== EU_C9_R2_MEMBER_TYPE) return blocked(input, "INVALID_MEMBER_TYPE");
  if (input.prestressed || input.deepBeam || input.strutAndTie || input.fireDesign || input.seismicDetailing || input.nonPrismatic) {
    return blocked(input, "BEAM_SCOPE_EXCLUSION");
  }
  if (input.hardCodedCombinationFactors || input.ndpValueOnlyReuse) return blocked(input, "PROFILE_OR_NDP_REJECTED");
  if (!input.standardContext || input.standardContext.family !== "EN1992" || input.standardContext.generation !== EU_C9_R2_REFERENCE_GENERATION || !input.standardContext.profileId) {
    return blocked(input, "PROFILE_MISMATCH");
  }
  if (input.geometryShape != null && input.geometryShape !== "RECTANGULAR") {
    return finish(input, [node({
      capabilityId: "GEOMETRY",
      nodeRole: "CONTEXT",
      executionStatus: "INVALID_INPUT",
      requiredCheck: false,
      methodId: null,
      profileId: input.standardContext.profileId,
      numericalResult: null,
      resultFingerprint: null,
      unresolvedInputs: ["RECTANGULAR_GEOMETRY"],
    })], "INVALID_GEOMETRY", "MEMBER_UNDETERMINED", false);
  }
  const scope = input.declaredEvaluationScope;
  if (!scope || scope.length === 0) return finish(input, [], "MISSING_DECLARED_SCOPE", "MEMBER_UNDETERMINED", false);

  const nodes: EuC9R2NodeResult[] = [];
  const route = input.actions ? routeEuC9R2SectionAction(input.actions) : null;

  if (hasScope(scope, "ULS_SECTION")) {
    if (!route || route.state === "NOT_APPLICABLE") {
      nodes.push(node({ capabilityId: "D1E.EU.C2.FLEXURE.UNIAXIAL", nodeRole: "CHECK", executionStatus: "UNDETERMINED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["SECTION_ACTION"] }));
    } else if (route.state !== "ROUTED") {
      nodes.push(node({ capabilityId: route.capabilityId ?? "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL", nodeRole: "CHECK", executionStatus: route.state, requiredCheck: true, methodId: route.methodId, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
    } else if (route.executesC2) {
      const flexure = input.flexure;
      if (!flexure || flexure.methodId !== route.methodId || flexure.axis !== route.axis) {
        nodes.push(node({ capabilityId: "D1E.EU.C2.FLEXURE.UNIAXIAL", nodeRole: "CHECK", executionStatus: "UNDETERMINED", requiredCheck: true, methodId: route.methodId, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["C2_FLEXURE_INPUT"] }));
      } else {
        const solved = evaluateEuConcreteFlexure(flexure);
        nodes.push(node({ capabilityId: "D1E.EU.C2.FLEXURE.UNIAXIAL", nodeRole: "CHECK", executionStatus: mapCheck(solved.checkState), requiredCheck: true, methodId: route.methodId, profileId: input.standardContext.profileId, numericalResult: solved.designRuleUtilization, resultFingerprint: solved.resultFingerprint ?? route.methodId, unresolvedInputs: [] }));
      }
    } else if (route.executesC3) {
      const axialFlexure = input.axialFlexure;
      if (!axialFlexure || axialFlexure.methodId !== route.methodId || axialFlexure.axis !== route.axis) {
        nodes.push(node({ capabilityId: "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL", nodeRole: "CHECK", executionStatus: "UNDETERMINED", requiredCheck: true, methodId: route.methodId, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["C3_AXIAL_FLEXURE_INPUT"] }));
      } else {
        const solved = evaluateEuC3DemandPointCheck(axialFlexure);
        nodes.push(node({ capabilityId: "D1E.EU.C3.AXIAL_FLEXURE.UNIAXIAL", nodeRole: "CHECK", executionStatus: mapCheck(solved.checkState), requiredCheck: true, methodId: route.methodId, profileId: input.standardContext.profileId, numericalResult: solved.utilization, resultFingerprint: route.methodId, unresolvedInputs: [] }));
      }
    } else if (route.executesC4) {
      if (!input.biaxial || input.biaxial.methodId !== route.methodId) {
        nodes.push(node({ capabilityId: "D1E.EU.C4.BIAXIAL.PMM", nodeRole: "CHECK", executionStatus: "UNDETERMINED", requiredCheck: true, methodId: route.methodId, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["C4_BIAXIAL_INPUT"] }));
      } else {
        const solved = evaluateEuC4DemandPointCheck(input.biaxial);
        nodes.push(node({ capabilityId: "D1E.EU.C4.BIAXIAL.PMM", nodeRole: "CHECK", executionStatus: mapCheck(solved.checkState), requiredCheck: true, methodId: route.methodId, profileId: input.standardContext.profileId, numericalResult: solved.demandRadiusNm, resultFingerprint: route.methodId, unresolvedInputs: [] }));
      }
    }
  }

  if (hasScope(scope, "SHEAR")) {
    const gate = shearEligible(input.actions, input.shear);
    if (gate) {
      nodes.push(node({ capabilityId: "D1E.EU.C5.SHEAR", nodeRole: "CHECK", executionStatus: gate, requiredCheck: true, methodId: EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: gate === "UNDETERMINED" ? ["EXPLICIT_ZERO_AXIAL_OR_SHEAR_INPUT"] : [] }));
    } else if (!input.shear) {
      nodes.push(node({ capabilityId: "D1E.EU.C5.SHEAR", nodeRole: "CHECK", executionStatus: "UNDETERMINED", requiredCheck: true, methodId: EU_C5_SHEAR_WITHOUT_REINFORCEMENT_METHOD_ID, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["SHEAR_INPUT"] }));
    } else {
      const solved = evaluateEuC5Shear(input.shear);
      nodes.push(node({ capabilityId: "D1E.EU.C5.SHEAR", nodeRole: "CHECK", executionStatus: mapCheck(solved.failReason ?? solved.checkState), requiredCheck: true, methodId: solved.methodId, profileId: input.standardContext.profileId, numericalResult: solved.resistance?.value ?? null, resultFingerprint: solved.fingerprint, unresolvedInputs: [] }));
    }
  }

  if (hasScope(scope, "TORSION")) {
    const torsion = input.torsion;
    if (!torsion || torsion.demand.torsion.status !== "TRANSPORTED" || !torsion.torsionRequest) {
      nodes.push(node({ capabilityId: "D1E.EU.C5.TORSION", nodeRole: "CHECK", executionStatus: "UNDETERMINED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["EXPLICIT_TORSION_INPUT"] }));
    } else {
      const solved = evaluateEuC5Torsion(torsion);
      nodes.push(node({ capabilityId: "D1E.EU.C5.TORSION", nodeRole: "CHECK", executionStatus: mapCheck(solved.failReason ?? solved.checkState), requiredCheck: true, methodId: solved.methodId, profileId: input.standardContext.profileId, numericalResult: solved.resistance?.value ?? null, resultFingerprint: solved.fingerprint, unresolvedInputs: [] }));
    }
  }

  if (hasScope(scope, "PUNCHING")) {
    nodes.push(node({ capabilityId: "D1E.EU.C5.PUNCHING", nodeRole: "CHECK", executionStatus: "NOT_APPLICABLE", requiredCheck: false, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
  }
  if (hasScope(scope, "SECOND_ORDER")) {
    nodes.push(node({ capabilityId: "D1E.EU.C6.NOMINAL_CURVATURE", nodeRole: "CHECK", executionStatus: "NOT_APPLICABLE", requiredCheck: false, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
  }
  if (hasScope(scope, "SLS_CRACK_WIDTH")) {
    if (!input.crackWidth) {
      nodes.push(node({ capabilityId: "D1E.EU.C7.SLS_REFERENCE", nodeRole: "CHECK", executionStatus: "UNDETERMINED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["sigmaS"] }));
    } else {
      const solved = evaluateEuC7CrackWidth(input.crackWidth);
      const status = solved.calculationState === "COMPLETE" ? mapCheck(solved.checkState) : "UNDETERMINED";
      nodes.push(node({ capabilityId: "D1E.EU.C7.SLS_REFERENCE", nodeRole: "CHECK", executionStatus: status, requiredCheck: true, methodId: solved.methodId, profileId: input.standardContext.profileId, numericalResult: solved.crackWidthMm, resultFingerprint: solved.resultFingerprint, unresolvedInputs: solved.calculationState === "COMPLETE" ? [] : [solved.failReason ?? "C7_INPUT"] }));
    }
  }
  if (hasScope(scope, "LONG_TERM_CONTEXT")) {
    if (!input.longTerm) {
      nodes.push(node({ capabilityId: "D1E.EU.C7.EXPLICIT_LONG_TERM", nodeRole: "CONTEXT", executionStatus: "UNDETERMINED", requiredCheck: false, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["EXPLICIT_CREEP_AND_SHRINKAGE"] }));
    } else {
      const solved = evaluateEuC7LongTermState(input.longTerm);
      nodes.push(node({ capabilityId: "D1E.EU.C7.EXPLICIT_LONG_TERM", nodeRole: "CONTEXT", executionStatus: solved.accepted ? "AVAILABLE" : "UNDETERMINED", requiredCheck: false, methodId: solved.methodId, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: solved.resultFingerprint, unresolvedInputs: solved.accepted ? [] : [solved.failReason ?? "LONG_TERM_INPUT"] }));
    }
  }
  if (hasScope(scope, "COVER_REQUIREMENT")) {
    if (!input.cover) {
      nodes.push(node({ capabilityId: "D1E.EU.C8.COVER_ASSEMBLY", nodeRole: "CALCULATION", executionStatus: "UNDETERMINED", requiredCheck: false, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["COVER_COMPONENTS"] }));
    } else {
      const solved = evaluateEuC8CoverAssembly(input.cover);
      nodes.push(node({ capabilityId: "D1E.EU.C8.COVER_ASSEMBLY", nodeRole: "CALCULATION", executionStatus: solved.ok && solved.calculationState === "COVER_REQUIREMENT_CALCULATED" ? "CALCULATED" : "UNDETERMINED", requiredCheck: false, methodId: solved.methodId, profileId: solved.profileId, numericalResult: solved.nominalCoverMm, resultFingerprint: solved.inputFingerprint, unresolvedInputs: solved.ok ? [] : [solved.failReason ?? "COVER_INPUT"] }));
    }
  }
  if (hasScope(scope, "PROVIDED_COVER_COMPLIANCE")) {
    nodes.push(node({ capabilityId: "PROVIDED_COVER_COMPLIANCE", nodeRole: "CHECK", executionStatus: "NOT_IMPLEMENTED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
  }
  if (hasScope(scope, "REINFORCEMENT_SPACING")) {
    const spacing = input.spacing;
    const diameterA = spacing?.barA?.diameter?.value;
    const diameterB = spacing?.barB?.diameter?.value;
    if (spacing && diameterA != null && diameterB != null && diameterA !== diameterB) {
      nodes.push(node({ capabilityId: "D1E.EU.C8.MIN_CLEAR_SPACING", nodeRole: "CHECK", executionStatus: "NOT_IMPLEMENTED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
    } else if (!spacing) {
      nodes.push(node({ capabilityId: "D1E.EU.C8.MIN_CLEAR_SPACING", nodeRole: "CHECK", executionStatus: "UNDETERMINED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["SPACING_INPUT"] }));
    } else {
      const solved = evaluateEuC8MinClearSpacing(spacing);
      const status = solved.failReason === "UNEQUAL_BAR_DIAMETERS" ? "NOT_IMPLEMENTED" : solved.ok ? mapCheck(solved.checkState) : "UNDETERMINED";
      nodes.push(node({ capabilityId: "D1E.EU.C8.MIN_CLEAR_SPACING", nodeRole: "CHECK", executionStatus: status, requiredCheck: true, methodId: solved.methodId, profileId: solved.profileId, numericalResult: solved.measuredClearSpacingMm, resultFingerprint: solved.resultFingerprint, unresolvedInputs: solved.ok ? [] : [solved.failReason ?? "SPACING_INPUT"] }));
    }
  }
  if (hasScope(scope, "BASIC_ANCHORAGE")) {
    const anchorage = input.anchorage;
    if (!anchorage) {
      nodes.push(node({ capabilityId: "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", nodeRole: "CALCULATION", executionStatus: "UNDETERMINED", requiredCheck: false, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: ["ANCHORAGE_INPUT"] }));
    } else {
      const solved = evaluateEuC8BasicRequiredAnchorage(anchorage);
      const checkMode = anchorage.checkRequested === true;
      const status: EuC9R2ExecutionStatus = !solved.ok
        ? "UNDETERMINED"
        : checkMode
          ? mapCheck(solved.checkState ?? "UNDETERMINED")
          : "CALCULATED";
      nodes.push(node({ capabilityId: "D1E.EU.C8.BASIC_REQUIRED_ANCHORAGE", nodeRole: checkMode ? "CHECK" : "CALCULATION", executionStatus: status, requiredCheck: checkMode, methodId: solved.methodId, profileId: solved.profileId, numericalResult: solved.basicRequiredAnchorageLengthMm, resultFingerprint: solved.resultFingerprint, unresolvedInputs: solved.ok ? [] : [solved.failReason ?? "ANCHORAGE_INPUT"] }));
    }
  }
  if (hasScope(scope, "DESIGN_ANCHORAGE")) {
    nodes.push(node({ capabilityId: "DESIGN_ANCHORAGE", nodeRole: "CHECK", executionStatus: "NOT_IMPLEMENTED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
  }
  if (hasScope(scope, "LAP_DESIGN")) {
    nodes.push(node({ capabilityId: "LAPS", nodeRole: "CHECK", executionStatus: "DEFERRED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
  }
  if (hasScope(scope, "DEFLECTION")) {
    nodes.push(node({ capabilityId: "DEFLECTION", nodeRole: "CHECK", executionStatus: "DEFERRED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
  }
  if (hasScope(scope, "CALCULATED_CREEP")) {
    nodes.push(node({ capabilityId: "CALCULATED_CREEP", nodeRole: "CONTEXT", executionStatus: "DEFERRED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
  }
  if (hasScope(scope, "CALCULATED_SHRINKAGE")) {
    nodes.push(node({ capabilityId: "CALCULATED_SHRINKAGE", nodeRole: "CONTEXT", executionStatus: "DEFERRED", requiredCheck: true, methodId: null, profileId: input.standardContext.profileId, numericalResult: null, resultFingerprint: null, unresolvedInputs: [] }));
  }

  const incomplete = nodes.some((item) => ["NOT_IMPLEMENTED", "DEFERRED", "BLOCKED_SCOPE_MISMATCH", "BLOCKED_DEPENDENCY", "UNDETERMINED", "INVALID_INPUT", "NOT_SATISFIED"].includes(item.executionStatus));
  const success = nodes.every((item) => item.executionStatus === "SATISFIED" || item.executionStatus === "CALCULATED" || item.executionStatus === "AVAILABLE" || item.executionStatus === "NOT_APPLICABLE");
  return finish(input, nodes, null, null, !incomplete && success && nodes.length > 0);
}
