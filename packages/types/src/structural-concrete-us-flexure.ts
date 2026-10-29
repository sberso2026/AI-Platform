/**
 * EOS-D1E-US-2 — bounded US/ACI-profile RC uniaxial flexure.
 * Reuses D1E-1 kernel and D1E-US-1 standard context. Not a numerical ACI 318 resistance engine.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { EngineeringRuleAuthorityType } from "./structural-steel";
import { US_CONCRETE_STANDARD_EDITION } from "./structural-concrete";
import {
  US_CONCRETE_STANDARD_AMENDMENT_STATE,
  US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  US_CONCRETE_STANDARD_ERRATA_STATE,
  US_CONCRETE_STANDARD_FAMILY,
} from "./structural-concrete-us";

export const EOS_D1E_US2_PHASE = "EOS-D1E-US-2" as const;
export const D1E_US2_SCOPE = "bounded ACI-profile RC uniaxial flexure using D1E-1 kernel and governed US-1 standard context" as const;
export const D1E_US2_SCOPE_CONFIRMED = true as const;
export const US1_CONCRETE_STANDARD_BINDING_REUSED = true as const;
export const PARALLEL_US_STANDARD_CONTEXT_CREATED = false as const;
export const PARALLEL_US_RC_SECTION_SOLVER_CREATED = false as const;
export const US_CONCRETE_RULES_CONFINED_TO_US_ADAPTER = true as const;
export const US_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL = false as const;
export const US_CONCRETE_FLEXURE_CONTEXT = true as const;
export const D1C_US_CONCRETE_MOMENT_DEMAND_REUSED = true as const;
export const US_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND = false as const;
export const US_UNIAXIAL_FLEXURE_SCOPE = true as const;
export const US_AXIAL_FLEXURE_CODE_DESIGN_IMPLEMENTED = false as const;
export const US_BIAXIAL_CODE_DESIGN_IMPLEMENTED = false as const;
export const US_FLEXURE_AXIAL_ACTION_APPLICABILITY_EXPLICIT = true as const;
export const US_CONCRETE_MATERIAL_PROPERTIES_GOVERNED = true as const;
export const US_REINFORCEMENT_PROPERTIES_GOVERNED = true as const;
export const US_FLEXURE_DESIGN_AND_MATERIAL_STANDARD_SEPARATE = true as const;
export const D1E1_SECTION_GEOMETRY_REUSED_FOR_US_FLEXURE = true as const;
export const D1E1_REINFORCEMENT_GEOMETRY_REUSED_FOR_US_FLEXURE = true as const;
export const D1E1_PLANE_SECTION_KINEMATICS_REUSED_FOR_US_FLEXURE = true as const;
export const D1E1_SECTION_INTEGRATOR_REUSED_FOR_US_FLEXURE = true as const;
export const PARALLEL_US_SECTION_INTEGRATOR_CREATED = false as const;
export const D1E1_EQUILIBRIUM_SOLVER_REUSED_FOR_US_FLEXURE = true as const;
export const PARALLEL_US_NEUTRAL_AXIS_SOLVER_CREATED = false as const;
export const US_FLEXURE_EQUILIBRIUM_NONCONVERGENCE_FAILS_CLOSED = true as const;
export const US_NEUTRAL_AXIS_EQUALS_ACI_CODE_STRENGTH_STATE = false as const;
export const US_CONCRETE_COMPRESSION_PARAMETER_GUESSED = false as const;
export const US_CONCRETE_ULTIMATE_STRAIN_GUESSED = false as const;
export const US_REINFORCEMENT_STRAIN_LIMIT_GUESSED = false as const;
export const US_STRESS_BLOCK_PARAMETER_GUESSED = false as const;
export const US_FLEXURE_STRENGTH_REDUCTION_FACTOR_GUESSED = false as const;
export const US_FLEXURE_STRAIN_THRESHOLD_GUESSED = false as const;
export const UNKNOWN_US_FLEXURE_CODE_PARAMETER_GUESSED = false as const;
export const US_FLEXURE_STRENGTH_LAYERS_SEPARATE = true as const;
export const STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_RC_FLEXURE = false as const;
export const US_CONCRETE_FLEXURE_METHOD_REGISTRY = true as const;
export const US_FLEXURE_METHOD_SCOPE_CLASSIFIED = true as const;
export const US_ELASTIC_SECTION_REFERENCE_REUSED = true as const;
export const ELASTIC_RC_REFERENCE_EQUALS_ACI_FLEXURAL_STRENGTH = false as const;
export const US_CONCRETE_FLEXURE_RESULT = true as const;
export const US_FLEXURE_RESULT_AUTHORITY_EXPLICIT = true as const;
export const MECHANICS_RATIO_LABELLED_AS_ACI_CHECK = false as const;
export const US_FLEXURE_CHECK_STATE = true as const;
export const US_FLEXURE_BUILDING_CODE_COMPLIANCE_STATE = true as const;
export const ACI_FLEXURE_CHECK_EQUALS_BUILDING_CODE_COMPLIANCE = false as const;
export const ACI_CONCRETE_DESIGN_EQUALS_BUILDING_CODE_COMPLIANCE_FLEXURE = false as const;
export const DIRECT_CONTRACT_ACI_FLEXURE_EQUALS_BUILDING_CODE_COMPLIANCE = false as const;
export const US_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL = false as const;
export const AUTOMATIC_US_CONCRETE_APPROVAL = false as const;
export const US_MINIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED = false as const;
export const US_MAXIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED = false as const;
export const NUMERICAL_US_CRACK_CONTROL_IMPLEMENTED = false as const;
export const US_LONG_TERM_DEFLECTION_IMPLEMENTED = false as const;
export const NUMERICAL_US_DURABILITY_CHECK_IMPLEMENTED = false as const;
export const NUMERICAL_US_LAP_SPLICE_DESIGN_IMPLEMENTED = false as const;
export const US_CONCRETE_COLUMN_STABILITY_CODE_DESIGN_IMPLEMENTED = false as const;
export const US_FLEXURE_DEPENDENCY_INVALIDATION = true as const;
export const STALE_US_FLEXURE_RESULT_REUSE_ALLOWED = false as const;
export const HISTORICAL_US_FLEXURE_RESULT_REPRODUCIBLE = true as const;
export const SELF_REFERENTIAL_US_FLEXURE_BENCHMARKS = false as const;
export const COMMON_RC_BENCHMARK_EQUALS_ACI_CONFORMANCE = false as const;
export const BENCHMARK_EQUALS_ACI_CONFORMANCE = false as const;
export const US_FLEXURE_HUMAN_VALIDATION_REQUIRED = true as const;
export const US_FLEXURE_INDEPENDENT_BENCHMARKS = "PASS" as const;
export const US_FLEXURE_D1C_PROVENANCE = "PASS" as const;
export const US_FLEXURE_RESULT_PROVENANCE = "PASS" as const;
export const LLM_US_CONCRETE_NUMERICAL_AUTHORITY = false as const;
export const AI_STRAIN_THRESHOLD_AUTHORITY = false as const;
export const AI_ACI_CONFORMANCE_AUTHORITY_FLEXURE = false as const;
export const US_RC_INVERSE_DESIGN_HANDOFF_READY = true as const;
export const GENERATIVE_US_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK = false as const;
export const GENERATIVE_OPTIMIZER_CAN_CHANGE_US_STANDARD_CONTEXT = false as const;
export const INVALID_US_RC_CANDIDATE_FAILS_CLOSED = true as const;
export const US_RC_OPTIMIZATION_RECHECK_REQUIRED = true as const;
export const US_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const US_RC_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const US_CONCRETE_FLEXURE_FAIL_CLOSED = true as const;
export const US_CONCRETE_RESULT_WARNING_MODEL = true as const;
export const THREE_JURISDICTION_RC_KERNEL_REUSE_AUDIT = "PASS" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_US2 = false as const;
export const D1E_US2_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const D1E_CONCRETE_ARCHITECTURE_READY_FOR_CLOSEOUT = true as const;
export const EU_CONCRETE_CONFORMANCE_TRACK_ARCHITECTURALLY_READY = true as const;
export const EOS_D1E_US2_CLOSED = true as const;
export const D1E_US_ROADMAP_HANDOFF_VALIDATED_US2 = true as const;
export const US_FLEXURE_IMPLEMENTATION_VERSION = "d1e-us2.0" as const;
export const US_FLEXURE_AXIAL_APPLICABILITY = "PURE_OR_NEAR_PURE_FLEXURE_ONLY" as const;
export const US_FLEXURE_PACK_EDITION = US_CONCRETE_STANDARD_EDITION;
export const US_FLEXURE_PACK_AMENDMENT = US_CONCRETE_STANDARD_AMENDMENT_STATE;
export const US_FLEXURE_PACK_ERRATA = US_CONCRETE_STANDARD_ERRATA_STATE;

export const US_FLEXURE_AXES = ["MAJOR_AXIS", "MINOR_AXIS"] as const;
export type UsFlexureAxis = (typeof US_FLEXURE_AXES)[number];

export const US_FLEXURE_METHOD_SCOPES = [
  "MECHANICS_REFERENCE_ONLY",
  "FRAMEWORK_ONLY",
  "GOVERNED_IMPLEMENTABLE",
  "VALIDATION_REQUIRED",
  "VALIDATED",
] as const;
export type UsFlexureMethodScope = (typeof US_FLEXURE_METHOD_SCOPES)[number];

export const US_FLEXURE_RESULT_AUTHORITIES = [
  "MECHANICS_REFERENCE",
  "CODE_PROFILE_REFERENCE",
  "CODE_NOMINAL_STRENGTH",
  "CODE_DESIGN_STRENGTH",
] as const;
export type UsFlexureResultAuthority = (typeof US_FLEXURE_RESULT_AUTHORITIES)[number];

export const US_FLEXURE_STRENGTH_LAYERS = [
  "MECHANICS_REFERENCE",
  "CODE_NOMINAL_STRENGTH",
  "CODE_DESIGN_STRENGTH",
  "BUILDING_CODE_COMPLIANCE",
  "ENGINEERING_APPROVAL",
] as const;

export const US_FLEXURE_WARNING_CODES = [
  "MECHANICS_REFERENCE_ONLY",
  "ACI_DESIGN_METHOD_UNAVAILABLE",
  "STANDARD_EDITION_UNCONFIRMED",
  "BUILDING_CODE_CONTEXT_MISSING",
  "LOCAL_AMENDMENT_MISSING",
  "STRESS_BLOCK_AUTHORITY_MISSING",
  "STRENGTH_REDUCTION_FACTOR_MISSING",
  "STRAIN_LIMIT_AUTHORITY_MISSING",
  "VALIDATION_REQUIRED",
  "HUMAN_ENGINEERING_REVIEW_REQUIRED",
  "NOT_APPROVED_FOR_CONSTRUCTION",
  "UNSUPPORTED_AXIAL_ACTION",
  "EQUILIBRIUM_NOT_CONVERGED",
  "DIRECT_CONTRACT_NOT_BUILDING_CODE_COMPLIANCE",
] as const;
export type UsFlexureWarningCode = (typeof US_FLEXURE_WARNING_CODES)[number];

export type UsConcreteFlexureMethodRecord = {
  methodId: string;
  methodType: "ELASTIC_SECTION_REFERENCE" | "ACI_UNIAXIAL_FLEXURE";
  axis: UsFlexureAxis;
  engineeringRuleRef: string;
  authorityType: EngineeringRuleAuthorityType;
  technicalBasisRef: string;
  aciFamily: typeof US_CONCRETE_STANDARD_FAMILY;
  edition: typeof US_CONCRETE_STANDARD_EDITION;
  amendmentErrataDependency: true;
  buildingCodeDependency: boolean;
  localAmendmentDependency: boolean;
  requiredMaterialModels: readonly string[];
  stressBlockDependency: string | null;
  strainRuleDependency: readonly string[];
  strengthFactorDependency: string | null;
  reinforcementDependencies: readonly string[];
  applicability: string;
  requiredInputs: readonly string[];
  outputSemantics: UsFlexureResultAuthority;
  implementationVersion: typeof US_FLEXURE_IMPLEMENTATION_VERSION;
  numericalValidationState: string;
  engineeringValidationState: string;
  standardConformanceState: typeof US_CONCRETE_STANDARD_CONFORMANCE_STATE;
  benchmarkRefs: readonly string[];
  methodScope: UsFlexureMethodScope;
};

export type UsConcreteFlexureContext = {
  memberRef: string;
  sectionRef: string;
  concreteMaterialRef: string;
  reinforcementMaterialRefs: readonly string[];
  reinforcementLayoutRef: string;
  bendingAxis: UsFlexureAxis;
  momentDemandRef: string;
  aciFamily: typeof US_CONCRETE_STANDARD_FAMILY;
  standardEdition: string;
  amendmentState: string;
  errataState: string;
  buildingCodeContextRef: string | null;
  localAmendmentRefs: readonly string[];
  directContractProfile: boolean;
  materialResponseRuleRefs: readonly string[];
  stressBlockRuleRef: string | null;
  strainRuleRefs: readonly string[];
  strengthReductionRuleRef: string | null;
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: typeof US_CONCRETE_STANDARD_CONFORMANCE_STATE;
  provenance: EosGlobalProvenanceContract;
};

export type UsConcreteFlexureFingerprint = {
  memberRef: string;
  sectionGeometryVersion: string;
  reinforcementFingerprint: string;
  concreteMaterialRef: string;
  reinforcementMaterialRef: string;
  momentDemandRef: string;
  combinationId: string | null;
  d1cRevision: string;
  aciFamily: string;
  edition: string;
  amendmentState: string;
  errataState: string;
  buildingCodeContextRef: string | null;
  localAmendmentRef: string | null;
  materialModelRef: string | null;
  stressBlockRuleRef: string | null;
  strainRuleRef: string | null;
  strengthFactorRef: string | null;
  methodVersion: string;
};

export type UsConcreteFlexureResult = {
  memberRef: string;
  sectionRef: string;
  axis: UsFlexureAxis;
  momentDemandRef: string;
  momentDemandNm: number;
  geometryFingerprint: string;
  reinforcementFingerprint: string;
  materialRefs: readonly string[];
  mechanicsState: "EQUILIBRATED" | "NOT_CONVERGED" | "NOT_EVALUATED";
  codeDesignState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  buildingCodeComplianceState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  checkState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  resultAuthority: UsFlexureResultAuthority;
  neutralAxis: { exists: boolean; labelledAciCodeStrength: false };
  strainStateRefs: readonly string[];
  materialResponseRefs: readonly string[];
  referenceMomentNm: number | null;
  nominalStrengthNm: null;
  designStrengthNm: null;
  aciUtilization: null;
  mechanicsDemandRatio: number | null;
  aciFamily: typeof US_CONCRETE_STANDARD_FAMILY;
  edition: string;
  amendmentState: string;
  errataState: string;
  buildingCodeContextRef: string | null;
  localAmendmentRefs: readonly string[];
  directContractProfile: boolean;
  stressBlockRuleRef: string | null;
  strainRuleRef: string | null;
  strengthReductionRuleRef: string | null;
  methodVersion: typeof US_FLEXURE_IMPLEMENTATION_VERSION;
  validationState: string;
  conformanceState: typeof US_CONCRETE_STANDARD_CONFORMANCE_STATE;
  benchmarkState: string;
  provenance: EosGlobalProvenanceContract;
  humanReviewState: "required";
  approvalState: "not_approved";
  warnings: readonly UsFlexureWarningCode[];
  completeness: string;
  labelledAciStrength: false;
  detailingComplianceImplied: false;
  statutoryUsComplianceClaimed: false;
};
