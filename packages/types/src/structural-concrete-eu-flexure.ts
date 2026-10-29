/**
 * EOS-D1E-EU-2 — bounded Eurocode RC uniaxial flexure.
 * Reuses D1E-1 kernel and D1E-EU-1 standard context. Not a numerical EN 1992 resistance engine.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { EngineeringRuleAuthorityType, EurocodeGenerationFamily } from "./structural-steel";
import { EU_CONCRETE_STANDARD_EDITION } from "./structural-concrete";
import { EU_CONCRETE_STANDARD_CONFORMANCE_STATE, type En1992PartId } from "./structural-concrete-eu";

export const EOS_D1E_EU2_PHASE = "EOS-D1E-EU-2" as const;
export const D1E_EU2_SCOPE = "bounded Eurocode RC uniaxial flexure using D1E-1 kernel and governed EN 1992 context" as const;
export const D1E_EU2_SCOPE_CONFIRMED = true as const;
export const EU1_STANDARD_BINDING_REUSED = true as const;
export const PARALLEL_EU_STANDARD_CONTEXT_CREATED = false as const;
export const PARALLEL_EU_RC_SECTION_SOLVER_CREATED = false as const;
export const EU_CONCRETE_RULES_CONFINED_TO_EU_ADAPTER = true as const;
export const EU_PARAMETER_LEAKAGE_INTO_COMMON_RC_KERNEL = false as const;
export const EU_FLEXURE_STANDARD_PART_REQUIRED = true as const;
export const EU_FLEXURE_NATIONAL_ANNEX_DEPENDENCY_SUPPORTED = true as const;
export const EU_FLEXURE_NATIONAL_ANNEX_INFERRED_FROM_USER_LOCATION = false as const;
export const EU_FLEXURE_NDP_DEPENDENCY_EXPLICIT = true as const;
export const EU_FLEXURE_NDP_VALUE_GUESSED = false as const;
export const EU_FLEXURE_ANNEX_NDP_COMPATIBILITY = true as const;
export const EU_CONCRETE_FLEXURE_CONTEXT = true as const;
export const D1C_EU_CONCRETE_MOMENT_DEMAND_REUSED = true as const;
export const EU_FLEXURE_RECALCULATES_STRUCTURAL_DEMAND = false as const;
export const EU_UNIAXIAL_FLEXURE_SCOPE = true as const;
export const EU_AXIAL_FLEXURE_CODE_DESIGN_IMPLEMENTED = false as const;
export const EU_BIAXIAL_CODE_DESIGN_IMPLEMENTED = false as const;
export const EU_FLEXURE_AXIAL_ACTION_APPLICABILITY_EXPLICIT = true as const;
export const EU_CONCRETE_MATERIAL_PROPERTIES_GOVERNED = true as const;
export const EU_REINFORCEMENT_PROPERTIES_GOVERNED = true as const;
export const EU_FLEXURE_DESIGN_AND_MATERIAL_STANDARD_SEPARATE = true as const;
export const D1E1_SECTION_GEOMETRY_REUSED_FOR_EU_FLEXURE = true as const;
export const D1E1_REINFORCEMENT_GEOMETRY_REUSED_FOR_EU_FLEXURE = true as const;
export const EU_CONCRETE_MATERIAL_RESPONSE_AUTHORITY_REQUIRED = true as const;
export const EU_CONCRETE_COMPRESSION_RESPONSE_FRAMEWORK = true as const;
export const EU_CONCRETE_COMPRESSION_PARAMETER_GUESSED = false as const;
export const EU_CONCRETE_TENSION_TREATMENT_EXPLICIT = true as const;
export const EU_REINFORCEMENT_RESPONSE_FRAMEWORK = true as const;
export const EU_REINFORCEMENT_RESPONSE_PARAMETER_GUESSED = false as const;
export const EU_CHARACTERISTIC_AND_DESIGN_MATERIAL_VALUES_SEPARATE = true as const;
export const EU_FLEXURE_PARTIAL_FACTOR_SOURCE_EXPLICIT = true as const;
export const EU_FLEXURE_PARTIAL_FACTOR_GUESSED = false as const;
export const EU_DESIGN_STRENGTH_DERIVATION_GOVERNED = true as const;
export const EU_CONCRETE_ULTIMATE_STRAIN_SOURCE_EXPLICIT = true as const;
export const EU_CONCRETE_ULTIMATE_STRAIN_GUESSED = false as const;
export const EU_REINFORCEMENT_STRAIN_LIMIT_GUESSED = false as const;
export const EU_CONCRETE_STRESS_BLOCK_RULE_FRAMEWORK = true as const;
export const EU_STRESS_BLOCK_PARAMETER_GUESSED = false as const;
export const EU_FLEXURE_PARAMETER_NDP_DEPENDENCY_MODEL = true as const;
export const PARALLEL_EU_SECTION_INTEGRATOR_CREATED = false as const;
export const EU_FLEXURE_EQUILIBRIUM_NONCONVERGENCE_FAILS_CLOSED = true as const;
export const EU_NEUTRAL_AXIS_EQUALS_CODE_RESISTANCE_STATE = false as const;
export const EU_CONCRETE_FLEXURE_METHOD_REGISTRY = true as const;
export const EU_FLEXURE_METHOD_SCOPE_CLASSIFIED = true as const;
export const EU_ELASTIC_SECTION_REFERENCE_REUSED = true as const;
export const ELASTIC_RC_REFERENCE_EQUALS_EN1992_FLEXURAL_RESISTANCE = false as const;
export const UNKNOWN_EU_FLEXURE_CODE_PARAMETER_GUESSED = false as const;
export const EU_CONCRETE_FLEXURE_RESULT = true as const;
export const EU_FLEXURE_RESULT_AUTHORITY_EXPLICIT = true as const;
export const EU_FLEXURE_UTILIZATION_GOVERNED = true as const;
export const MECHANICS_RATIO_LABELLED_AS_EN1992_CHECK = false as const;
export const EU_FLEXURE_CHECK_STATE = true as const;
export const EU_FLEXURE_REINFORCEMENT_LAYOUT_APPLICABILITY_EXPLICIT = true as const;
export const EU_MINIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED = false as const;
export const EU_MAXIMUM_REINFORCEMENT_CODE_CHECK_IMPLEMENTED = false as const;
export const EU_FLEXURE_DUCTILITY_FRAMEWORK = true as const;
export const EU_DUCTILITY_LIMIT_GUESSED = false as const;
export const EU_FLEXURAL_RESISTANCE_EQUALS_DETAILING_COMPLIANCE = false as const;
export const NUMERICAL_EU_CONCRETE_TORSION_IMPLEMENTED = true as const;
export const NUMERICAL_EU_CRACK_WIDTH_DESIGN_IMPLEMENTED = false as const;
export const EU_LONG_TERM_DEFLECTION_IMPLEMENTED = false as const;
export const NUMERICAL_EU_DURABILITY_CHECK_IMPLEMENTED = false as const;
export const NUMERICAL_EU_LAP_SPLICE_DESIGN_IMPLEMENTED = false as const;
export const EU_CONCRETE_COLUMN_STABILITY_CODE_DESIGN_IMPLEMENTED = false as const;
export const EU_FLEXURE_DEPENDENCY_INVALIDATION = true as const;
export const STALE_EU_FLEXURE_RESULT_REUSE_ALLOWED = false as const;
export const HISTORICAL_EU_FLEXURE_RESULT_REPRODUCIBLE = true as const;
export const SELF_REFERENTIAL_EU_FLEXURE_BENCHMARKS = false as const;
export const COMMON_RC_BENCHMARK_EQUALS_EN1992_CONFORMANCE = false as const;
export const EU_CONCRETE_FLEXURE_CONFORMANCE_MODEL = true as const;
export const BENCHMARK_EQUALS_EN1992_CONFORMANCE = false as const;
export const EU_FLEXURE_HUMAN_VALIDATION_REQUIRED = true as const;
export const EU_FLEXURE_CHECK_EQUALS_ENGINEERING_APPROVAL = false as const;
export const AUTOMATIC_EU_CONCRETE_APPROVAL = false as const;
export const AI_EU_CONCRETE_ASSISTANCE_ADVISORY_ONLY = true as const;
export const AI_EU_CONCRETE_ASSISTANCE_ADVISORY_ONLY_FLEXURE = true as const;
export const LLM_EU_CONCRETE_NUMERICAL_AUTHORITY = false as const;
export const PARALLEL_EU_NEUTRAL_AXIS_SOLVER_CREATED = false as const;
export const EU_RC_OPTIMIZATION_ACCEPTS_UNDETERMINED = false as const;
export const EU_FLEXURE_INDEPENDENT_BENCHMARKS = "PASS" as const;
export const EU_FLEXURE_D1C_PROVENANCE = "PASS" as const;
export const EU_FLEXURE_RESULT_PROVENANCE = "PASS" as const;
export const D1E1_PLANE_SECTION_KINEMATICS_REUSED_FOR_EU_FLEXURE = true as const;
export const D1E1_SECTION_INTEGRATOR_REUSED_FOR_EU_FLEXURE = true as const;
export const D1E1_EQUILIBRIUM_SOLVER_REUSED_FOR_EU_FLEXURE = true as const;
export const COMMON_RC_SECTION_KERNEL_REUSED_FOR_EU_FLEXURE = true as const;
export const AI_EU_STRESS_BLOCK_AUTHORITY = false as const;
export const AI_EN1992_CONFORMANCE_AUTHORITY = false as const;
export const EU_RC_INVERSE_DESIGN_HANDOFF_READY = true as const;
export const GENERATIVE_EU_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK = false as const;
export const GENERATIVE_OPTIMIZER_CAN_CHANGE_EU_STANDARD_CONTEXT = false as const;
export const INVALID_EU_RC_CANDIDATE_FAILS_CLOSED = true as const;
export const EU_RC_OPTIMIZATION_RECHECK_REQUIRED = true as const;
export const EU_RC_PARETO_ACCEPTS_UNDETERMINED_AS_FEASIBLE = false as const;
export const EU_RC_MTO_HANDOFF_REUSED = true as const;
export const EU_CONCRETE_FLEXURE_FAIL_CLOSED = true as const;
export const EU_CONCRETE_RESULT_WARNING_MODEL = true as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E_EU2 = false as const;
export const D1E_EU2_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const EOS_D1E_EU2_CLOSED = true as const;
export const D1E_EU_VALIDATION_DEBT_UPDATED = true as const;
export const D1E_EU_ROADMAP_HANDOFF_VALIDATED = true as const;
export const EU_FLEXURE_IMPLEMENTATION_VERSION = "d1e-eu2.0" as const;
export const EU_FLEXURE_AXIAL_APPLICABILITY = "PURE_OR_NEAR_PURE_FLEXURE_ONLY" as const;

export const EU_FLEXURE_AXES = ["MAJOR_AXIS", "MINOR_AXIS"] as const;
export type EuFlexureAxis = (typeof EU_FLEXURE_AXES)[number];

export const EU_FLEXURE_METHOD_SCOPES = [
  "MECHANICS_REFERENCE_ONLY",
  "GOVERNED_IMPLEMENTABLE",
  "FRAMEWORK_ONLY",
  "VALIDATION_REQUIRED",
  "NOT_IMPLEMENTED",
] as const;
export type EuFlexureMethodScope = (typeof EU_FLEXURE_METHOD_SCOPES)[number];

export const EU_FLEXURE_RESULT_AUTHORITIES = ["MECHANICS_REFERENCE", "CODE_PROFILE_REFERENCE", "CODE_DESIGN_RESISTANCE"] as const;
export type EuFlexureResultAuthority = (typeof EU_FLEXURE_RESULT_AUTHORITIES)[number];

export const EU_FLEXURE_WARNING_CODES = [
  "MECHANICS_REFERENCE_ONLY",
  "EN1992_DESIGN_METHOD_UNAVAILABLE",
  "STANDARD_EDITION_UNCONFIRMED",
  "NATIONAL_ANNEX_MISSING",
  "NDP_MISSING",
  "DESIGN_MODEL_AUTHORITY_MISSING",
  "PARTIAL_FACTOR_MISSING",
  "STRAIN_LIMIT_AUTHORITY_MISSING",
  "VALIDATION_REQUIRED",
  "HUMAN_ENGINEERING_REVIEW_REQUIRED",
  "NOT_APPROVED_FOR_CONSTRUCTION",
  "UNSUPPORTED_AXIAL_ACTION",
  "EQUILIBRIUM_NOT_CONVERGED",
] as const;
export type EuFlexureWarningCode = (typeof EU_FLEXURE_WARNING_CODES)[number];

export type EuConcreteFlexureMethodRecord = {
  methodId: string;
  methodType: "ELASTIC_SECTION_REFERENCE" | "EN1992_UNIAXIAL_FLEXURE" | "EN1992_UNIAXIAL_AXIAL_FLEXURE" | "EN1992_BIAXIAL_PMM";
  axis: EuFlexureAxis | "BIAXIAL_PMM";
  engineeringRuleRef: string;
  authorityType: EngineeringRuleAuthorityType;
  technicalBasisRef: string;
  standardFamily: "EN 1992";
  generation: EurocodeGenerationFamily;
  edition: typeof EU_CONCRETE_STANDARD_EDITION;
  part: En1992PartId;
  nationalAnnexDependency: boolean;
  ndpDependency: readonly string[];
  requiredMaterialModels: readonly string[];
  stressBlockOrDesignModelDependency: string | null;
  strainLimitDependencies: readonly string[];
  partialFactorDependencies: readonly string[];
  reinforcementDependencies: readonly string[];
  applicability: string;
  requiredInputs: readonly string[];
  outputSemantics: EuFlexureResultAuthority;
  implementationVersion: string;
  numericalValidationState: string;
  engineeringValidationState: string;
  standardConformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  benchmarkRefs: readonly string[];
  methodScope: EuFlexureMethodScope;
};

export type EuConcreteFlexureContext = {
  memberRef: string;
  sectionRef: string;
  concreteMaterialRef: string;
  reinforcementMaterialRefs: readonly string[];
  reinforcementLayoutRef: string;
  bendingAxis: EuFlexureAxis;
  momentDemandRef: string;
  standardFamily: "EN 1992";
  standardGeneration: EurocodeGenerationFamily;
  standardEdition: string;
  standardPartRefs: readonly (En1992PartId | string)[];
  nationalAnnexRef: string | null;
  ndpSetRef: string | null;
  materialResponseRuleRefs: readonly string[];
  stressBlockOrDesignModelRef: string | null;
  strainLimitRuleRefs: readonly string[];
  partialFactorRefs: readonly string[];
  ductilityClassificationRefs: readonly string[];
  technicalBasisRefs: readonly string[];
  validationState: string;
  conformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  provenance: EosGlobalProvenanceContract;
};

export type EuConcreteFlexureFingerprint = {
  memberRef: string;
  sectionGeometryVersion: string;
  reinforcementFingerprint: string;
  concreteMaterialRef: string;
  reinforcementMaterialRef: string;
  momentDemandRef: string;
  combinationId: string | null;
  d1cRevision: string;
  standardFamily: string;
  generation: string;
  edition: string;
  part: string;
  nationalAnnexRef: string | null;
  ndpSetRef: string | null;
  materialModelRef: string | null;
  stressBlockOrDesignModelRef: string | null;
  strainLimitRuleRef: string | null;
  partialFactorRef: string | null;
  methodVersion: string;
};

export type EuConcreteFlexureResult = {
  memberRef: string;
  sectionRef: string;
  axis: EuFlexureAxis;
  momentDemandRef: string;
  momentDemandNm: number;
  mechanicsState: "EQUILIBRATED" | "NOT_CONVERGED" | "NOT_EVALUATED";
  codeDesignState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  checkState: "CHECK_SATISFIED" | "CHECK_NOT_SATISFIED" | "CHECK_UNDETERMINED";
  resultAuthority: EuFlexureResultAuthority;
  neutralAxis: { exists: boolean; labelledCodeResistance: false };
  strainStateRefs: readonly string[];
  materialResponseRefs: readonly string[];
  methodId: string;
  momentSign: "POSITIVE" | "NEGATIVE" | null;
  referenceMomentNm: number | null;
  resistanceMomentNm: number | null;
  resistanceMomentUnit: "N.m";
  designRuleResistanceNm: number | null;
  designRuleUtilization: number | null;
  resistanceAuthorityLayer: string | null;
  equilibriumResidualN: number | null;
  geometryFingerprint: string | null;
  resultFingerprint: string | null;
  integrationConfiguration: string | null;
  solverConfiguration: string | null;
  constitutiveParameterVersion: string | null;
  nominalDesignResistanceNm: null;
  designResistanceNm: null;
  en1992Utilization: null;
  mechanicsDemandRatio: number | null;
  standardFamily: "EN 1992";
  generation: string;
  edition: string;
  part: string;
  nationalAnnexRef: string | null;
  ndpSetRef: string | null;
  stressBlockOrDesignModelRef: string | null;
  partialFactorRefs: readonly string[];
  methodVersion: string;
  validationState: string;
  conformanceState: typeof EU_CONCRETE_STANDARD_CONFORMANCE_STATE;
  benchmarkState: string;
  provenance: EosGlobalProvenanceContract;
  humanReviewState: "required";
  approvalState: "not_approved";
  warnings: readonly EuFlexureWarningCode[];
  completeness: string;
  labelledEn1992Resistance: false;
  detailingComplianceImplied: false;
  statutoryEuComplianceClaimed: false;
};
