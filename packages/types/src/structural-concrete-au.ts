/**
 * EOS-D1E-AU-1 — bounded AU RC uniaxial flexure profile.
 * AS 3600 family binding only. Not a numerical AS 3600 capacity engine.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { EngineeringRuleAuthorityType } from "./structural-steel";
import { AU_CONCRETE_STANDARD_EDITION } from "./structural-concrete";

export const EOS_D1E_AU1_PHASE = "EOS-D1E-AU-1" as const;
export const D1E_AU1_SCOPE = "first bounded AU AS 3600 uniaxial RC flexure slice" as const;
export const D1E_AU1_SCOPE_CONFIRMED = true as const;
export const COMMON_RC_SECTION_KERNEL_REUSED = true as const;
export const PARALLEL_AU_RC_SECTION_SOLVER_CREATED = false as const;
export const AU_CONCRETE_RULES_CONFINED_TO_AU_ADAPTER = true as const;
export const AU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL = false as const;
export const AU_CONCRETE_STANDARD_FAMILY_BOUND = true as const;
export const AU_CONCRETE_STANDARD_AMENDMENT_STATE = "UNKNOWN_PENDING_CONFIRMATION" as const;
export const SILENT_AS3600_EDITION_INFERENCE = false as const;
export const AU_CONCRETE_PROFILE_AND_CONFORMANCE_SEPARATE = true as const;
export const AU_CONCRETE_FLEXURE_CONTEXT = true as const;
export const D1C_AU_CONCRETE_MOMENT_DEMAND_REUSED = true as const;
export const AU_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND = false as const;
export const AU_UNIAXIAL_FLEXURE_SCOPE = true as const;
export const AU_AXIAL_FLEXURE_CODE_DESIGN_IMPLEMENTED = false as const;
export const AU_BIAXIAL_CODE_DESIGN_IMPLEMENTED = false as const;
export const AU_FLEXURE_AXIAL_ACTION_APPLICABILITY_EXPLICIT = true as const;
export const NONZERO_AXIAL_ACTION_SILENTLY_IGNORED = false as const;
export const AU_CONCRETE_MATERIAL_PROPERTIES_GOVERNED = true as const;
export const AU_CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES = false as const;
export const AU_REINFORCEMENT_PROPERTIES_GOVERNED = true as const;
export const D1E1_SECTION_GEOMETRY_REUSED = true as const;
export const D1E1_REINFORCEMENT_GEOMETRY_REUSED = true as const;
export const GEOMETRIC_CLEARANCE_EQUALS_AS3600_COVER_COMPLIANCE = false as const;
export const AU_CONCRETE_MATERIAL_RESPONSE_AUTHORITY_REQUIRED = true as const;
export const AU_CONCRETE_COMPRESSION_RESPONSE_FRAMEWORK = true as const;
export const AU_STRESS_BLOCK_PARAMETER_GUESSED = false as const;
export const AU_CONCRETE_TENSION_TREATMENT_EXPLICIT = true as const;
export const AU_REINFORCEMENT_RESPONSE_FRAMEWORK = true as const;
export const AU_REINFORCEMENT_STRAIN_PARAMETER_GUESSED = false as const;
export const AU_ULTIMATE_CONCRETE_STRAIN_SOURCE_EXPLICIT = true as const;
export const AU_ULTIMATE_CONCRETE_STRAIN_GUESSED = false as const;
export const AU_REINFORCEMENT_STRAIN_LIMIT_GUESSED = false as const;
export const AU_STRESS_BLOCK_RULE_FRAMEWORK = true as const;
export const AS3600_STRESS_BLOCK_IN_COMMON_KERNEL = false as const;
export const AU_FLEXURE_STRENGTH_FACTOR_SOURCE_EXPLICIT = true as const;
export const AU_FLEXURE_STRENGTH_FACTOR_GUESSED = false as const;
export const AU_FLEXURE_CAPACITY_SEMANTICS_EXPLICIT = true as const;
export const D1E1_PLANE_SECTION_KINEMATICS_REUSED = true as const;
export const D1E1_SECTION_INTEGRATOR_REUSED = true as const;
export const PARALLEL_AU_SECTION_INTEGRATOR_CREATED = false as const;
export const D1E1_EQUILIBRIUM_SOLVER_REUSED = true as const;
export const PARALLEL_AU_NEUTRAL_AXIS_SOLVER_CREATED = false as const;
export const AU_FLEXURE_EQUILIBRIUM_NONCONVERGENCE_FAILS_CLOSED = true as const;
export const AU_NEUTRAL_AXIS_EQUALS_CODE_CAPACITY_STATE = false as const;
export const AU_CONCRETE_FLEXURE_METHOD_REGISTRY = true as const;
export const AU_FLEXURE_METHOD_SCOPE_CLASSIFIED = true as const;
export const AU_ELASTIC_SECTION_REFERENCE_REUSED = true as const;
export const ELASTIC_RC_REFERENCE_EQUALS_AS3600_FLEXURAL_CAPACITY = false as const;
export const UNKNOWN_AU_FLEXURE_CODE_PARAMETER_GUESSED = false as const;
export const AU_CONCRETE_FLEXURE_RESULT = true as const;
export const AU_FLEXURE_RESULT_AUTHORITY_EXPLICIT = true as const;
export const AU_FLEXURE_UTILIZATION_GOVERNED = true as const;
export const MECHANICS_RATIO_LABELLED_AS_AS3600_CHECK = false as const;
export const AU_FLEXURE_CHECK_STATE = true as const;
export const AU_FLEXURE_REINFORCEMENT_LAYOUT_APPLICABILITY_EXPLICIT = true as const;
export const AU_MINIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED = false as const;
export const AU_MAXIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED = false as const;
export const AU_FLEXURE_DUCTILITY_FRAMEWORK = true as const;
export const AU_DUCTILITY_LIMIT_GUESSED = false as const;
export const AU_FLEXURE_CAPACITY_EQUALS_DETAILING_COMPLIANCE = false as const;
export const AU_CONCRETE_SHEAR_CODE_METHOD_IMPLEMENTED = false as const;
export const AU_CONCRETE_COLUMN_CODE_DESIGN_IMPLEMENTED = false as const;
export const AU_PUNCHING_SHEAR_CODE_METHOD_IMPLEMENTED = false as const;
export const AU_CONCRETE_TORSION_CODE_METHOD_IMPLEMENTED = false as const;
export const AU_CODE_CRACK_CONTROL_IMPLEMENTED = false as const;
export const AU_LONG_TERM_DEFLECTION_IMPLEMENTED = false as const;
export const AU_DEVELOPMENT_LENGTH_IMPLEMENTED = false as const;
export const AU_LAP_SPLICE_DESIGN_IMPLEMENTED = false as const;
export const AU_DURABILITY_CODE_CHECK_IMPLEMENTED = false as const;
export const AU_CODE_COVER_CHECK_IMPLEMENTED = false as const;
export const AU_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED = false as const;
export const AU_FLEXURE_DEPENDENCY_INVALIDATION = true as const;
export const STALE_AU_FLEXURE_RESULT_REUSE_ALLOWED = false as const;
export const HISTORICAL_AU_FLEXURE_RESULT_REPRODUCIBLE = true as const;
export const SELF_REFERENTIAL_AU_FLEXURE_BENCHMARKS = false as const;
export const COMMON_RC_BENCHMARK_EQUALS_AS3600_CONFORMANCE = false as const;
export const AU_CONCRETE_FLEXURE_CONFORMANCE_MODEL = true as const;
export const BENCHMARK_EQUALS_AS3600_CONFORMANCE = false as const;
export const AU_CONCRETE_STANDARD_CONFORMANCE_STATE = "INTENDED_PROFILE" as const;
export const AU_CONCRETE_PACK_CERTIFIED = false as const;
export const AU_FLEXURE_HUMAN_VALIDATION_REQUIRED = true as const;
export const AU_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL = false as const;
export const AUTOMATIC_AU_CONCRETE_APPROVAL = false as const;
export const AI_AU_CONCRETE_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_AU_CONCRETE_NUMERICAL_AUTHORITY = false as const;
export const AI_STRESS_BLOCK_AUTHORITY = false as const;
export const AI_STRENGTH_FACTOR_AUTHORITY = false as const;
export const AI_AS3600_CONFORMANCE_AUTHORITY = false as const;
export const AU_RC_INVERSE_DESIGN_HANDOFF_READY = true as const;
export const GENERATIVE_AU_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK = false as const;
export const INVALID_AU_RC_CANDIDATE_FAILS_CLOSED = true as const;
export const AU_RC_OPTIMIZATION_RECHECK_REQUIRED = true as const;
export const AU_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const AU_RC_MTO_HANDOFF_REUSED = true as const;
export const DEFAULT_AU_CONCRETE_COST_RATE = false as const;
export const DEFAULT_AU_CONCRETE_CARBON_FACTOR = false as const;
export const DEFAULT_AU_REINFORCEMENT_CARBON_FACTOR = false as const;
export const AU_CONCRETE_MATERIAL_CATALOG_ADAPTER_READY = true as const;
export const AU_REINFORCEMENT_CATALOG_ADAPTER_READY = true as const;
export const COPYRIGHTED_AS3600_TEXT_COMMITTED = false as const;
export const AU_CONCRETE_FLEXURE_FAIL_CLOSED = true as const;
export const AU_CONCRETE_RESULT_WARNING_MODEL = true as const;
export const AU_CONCRETE_PRODUCT_CLAIM_LEVEL = "AU_CONCRETE_MECHANICS_REFERENCE_CAPABILITY" as const;
export const AU_CONCRETE_IMPLEMENTATION_MATURITY = "FRAMEWORK_PLUS_COMMON_MECHANICS" as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_AU1 = false as const;
export const D1E_AU1_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const EOS_D1E_AU1_CLOSED = true as const;
export const AU_FLEXURE_IMPLEMENTATION_VERSION = "d1e-au1.0" as const;
export const AU_FLEXURE_AXIAL_APPLICABILITY = "PURE_OR_NEAR_PURE_FLEXURE_ONLY" as const;

export const AU_CONCRETE_STANDARD_FAMILY = "AS 3600" as const;
export const AU_CONCRETE_STANDARD_IDENTIFIER = "AS 3600" as const;

export const AU_FLEXURE_AXES = ["MAJOR_AXIS", "MINOR_AXIS"] as const;
export type AuFlexureAxis = (typeof AU_FLEXURE_AXES)[number];

export const AU_FLEXURE_METHOD_SCOPES = [
  "MECHANICS_REFERENCE_ONLY",
  "GOVERNED_IMPLEMENTABLE",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type AuFlexureMethodScope = (typeof AU_FLEXURE_METHOD_SCOPES)[number];

export const AU_FLEXURE_RESULT_AUTHORITIES = ["MECHANICS_REFERENCE", "CODE_PROFILE_REFERENCE", "CODE_DESIGN_CAPACITY"] as const;
export type AuFlexureResultAuthority = (typeof AU_FLEXURE_RESULT_AUTHORITIES)[number];

export const AU_FLEXURE_WARNING_CODES = [
  "MECHANICS_REFERENCE_ONLY",
  "AS3600_DESIGN_METHOD_UNAVAILABLE",
  "STANDARD_EDITION_UNCONFIRMED",
  "STRESS_BLOCK_AUTHORITY_MISSING",
  "DESIGN_FACTOR_MISSING",
  "STRAIN_LIMIT_AUTHORITY_MISSING",
  "VALIDATION_REQUIRED",
  "HUMAN_ENGINEERING_REVIEW_REQUIRED",
  "NOT_APPROVED_FOR_CONSTRUCTION",
  "UNSUPPORTED_AXIAL_ACTION",
  "EQUILIBRIUM_NOT_CONVERGED",
] as const;
export type AuFlexureWarningCode = (typeof AU_FLEXURE_WARNING_CODES)[number];

export type AuConcreteFlexureMethodRecord = {
  methodId: string;
  methodType: "ELASTIC_SECTION_REFERENCE" | "AS3600_UNIAXIAL_FLEXURE";
  axis: AuFlexureAxis;
  engineeringRuleRef: string;
  authorityType: EngineeringRuleAuthorityType;
  technicalBasisRef: string;
  as3600EditionRequirement: typeof AU_CONCRETE_STANDARD_EDITION;
  requiredMaterialModels: readonly string[];
  stressBlockDependency: string | null;
  strainLimitDependencies: readonly string[];
  strengthFactorDependency: string | null;
  reinforcementDependencies: readonly string[];
  applicability: string;
  requiredInputs: readonly string[];
  outputSemantics: AuFlexureResultAuthority;
  implementationVersion: typeof AU_FLEXURE_IMPLEMENTATION_VERSION;
  numericalValidationState: string;
  engineeringValidationState: string;
  standardConformanceState: typeof AU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  benchmarkRefs: readonly string[];
  methodScope: AuFlexureMethodScope;
};

export type AuConcreteFlexureContext = {
  memberRef: string;
  sectionRef: string;
  concreteMaterialRef: string;
  reinforcementMaterialRefs: readonly string[];
  reinforcementLayoutRef: string;
  axis: AuFlexureAxis;
  momentDemandRef: string;
  standardContextRef: string;
  calculationContextRef: string;
  materialResponseRuleRefs: readonly string[];
  stressBlockRuleRef: string | null;
  strainLimitRuleRefs: readonly string[];
  strengthFactorRef: string | null;
  classificationDuctilityRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: typeof AU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  provenance: EosGlobalProvenanceContract;
};

export type AuConcreteFlexureFingerprint = {
  memberRef: string;
  sectionGeometryVersion: string;
  reinforcementFingerprint: string;
  concreteMaterialRef: string;
  reinforcementMaterialRef: string;
  momentDemandRef: string;
  combinationId: string | null;
  d1cRevision: string;
  standardEdition: string;
  materialModelRef: string | null;
  stressBlockRuleRef: string | null;
  strainLimitRuleRef: string | null;
  strengthFactorRef: string | null;
  methodVersion: string;
};

export type AuConcreteFlexureResult = {
  memberRef: string;
  sectionRef: string;
  axis: AuFlexureAxis;
  momentDemandRef: string;
  momentDemandNm: number;
  mechanicsState: "EQUILIBRATED" | "NOT_CONVERGED" | "NOT_EVALUATED";
  codeDesignState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  checkState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  resultAuthority: AuFlexureResultAuthority;
  neutralAxis: { exists: boolean; labelledCodeCapacity: false };
  strainStateRefs: readonly string[];
  materialResponseRefs: readonly string[];
  mechanicsReferenceMomentNm: number | null;
  nominalReferenceMomentNm: null;
  designMomentCapacityNm: null;
  as3600Utilization: null;
  mechanicsDemandRatio: number | null;
  stressBlockRuleRef: string | null;
  strengthFactorRef: string | null;
  standardContextRef: string;
  methodVersion: typeof AU_FLEXURE_IMPLEMENTATION_VERSION;
  validationState: string;
  conformanceState: typeof AU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  benchmarkState: string;
  provenance: EosGlobalProvenanceContract;
  humanReviewState: "required";
  approvalState: "not_approved";
  warnings: readonly AuFlexureWarningCode[];
  completeness: string;
  labelledAs3600Capacity: false;
  detailingComplianceImplied: false;
};
