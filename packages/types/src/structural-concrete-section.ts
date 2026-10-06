/**
 * EOS-D1E-1 — jurisdiction-neutral RC section geometry / kinematics / mechanics kernel.
 * Not AS 3600 capacity, Eurocode 2 resistance, or ACI 318 strength.
 */

import type { EosGlobalProvenanceContract } from "./global-governance";
import type { EngineeringRuleAuthorityType, SteelSourceAuthorityType } from "./structural-steel";
import type {
  ConcreteCover,
  ConcreteMaterial,
  ReinforcementLayout,
  ReinforcementMaterial,
} from "./structural-concrete";

export const EOS_D1E1_PHASE = "EOS-D1E-1" as const;
export const D1E1_CANONICAL_SCOPE = "common RC section mechanics / deterministic geometry foundation" as const;
export const D1E1_CANONICAL_SCOPE_CONFIRMED = true as const;
export const D1E0_CONCRETE_ARCHITECTURE_REUSED = true as const;
export const PARALLEL_RC_SECTION_ARCHITECTURE_CREATED = false as const;
export const RC_SECTION_MECHANICS_JURISDICTION_NEUTRAL = true as const;
export const CONCRETE_SECTION_LOCAL_COORDINATE_SYSTEM = true as const;
export const RC_SECTION_SIGN_CONVENTIONS_EXPLICIT = true as const;
export const RC_SECTION_UNIT_SAFETY = true as const;
export const SILENT_RC_UNIT_CONVERSION = false as const;
export const RECTANGULAR_SECTION_GEOMETRY_IMPLEMENTED = true as const;
export const CIRCULAR_SECTION_GEOMETRY_IMPLEMENTED = true as const;
export const FLANGED_SECTION_GEOMETRY_IMPLEMENTED = true as const;
export const ASYMMETRIC_SECTION_GEOMETRY_SUPPORTED = true as const;
export const POLYGONAL_SECTION_GEOMETRY_IMPLEMENTED = true as const;
export const INVALID_POLYGON_FAILS_CLOSED = true as const;
export const CONCRETE_SECTION_VOID_GEOMETRY_IMPLEMENTED = true as const;
export const INVALID_VOID_GEOMETRY_FAILS_CLOSED = true as const;
export const CONCRETE_MULTI_REGION_GEOMETRY_SUPPORTED = true as const;
export const CONCRETE_GROSS_SECTION_PROPERTIES = true as const;
export const CONCRETE_PRINCIPAL_SECTION_PROPERTIES = true as const;
export const CONCRETE_GEOMETRY_PROPERTY_PROVENANCE = true as const;
export const RC_BAR_GEOMETRY_REUSED = true as const;
export const RC_BAR_AREA_GOVERNED = true as const;
export const UNGOVERNED_BAR_NAME_GENERATES_AREA = false as const;
export const RC_REINFORCEMENT_GROUP_GEOMETRY_IMPLEMENTED = true as const;
export const RC_REINFORCEMENT_GEOMETRIC_PROPERTIES = true as const;
export const RC_BAR_CONTAINMENT_VALIDATION = true as const;
export const RC_GEOMETRIC_SURFACE_CLEARANCE = true as const;
export const GEOMETRIC_CLEARANCE_EQUALS_CODE_COVER = false as const;
export const RC_BAR_CLEAR_SPACING_GEOMETRY = true as const;
export const RC_REINFORCEMENT_LAYER_GEOMETRY = true as const;
export const RC_SECTION_CONFIGURATION_FINGERPRINT = true as const;
export const RC_GEOMETRY_DEPENDENCY_INVALIDATION = true as const;
export const RC_REINFORCEMENT_DISPLACEMENT_TREATMENT_EXPLICIT = true as const;
export const RC_PLANE_SECTION_KINEMATICS_IMPLEMENTED = true as const;
export const PLANE_SECTION_ASSUMPTION_EXPLICIT = true as const;
export const RC_SECTION_STRAIN_RESULT = true as const;
export const RC_BAR_STRAIN_FROM_SECTION_KINEMATICS = true as const;
export const DEFAULT_BOND_SLIP_MODEL = false as const;
export const D1E0_MATERIAL_RESPONSE_INTERFACE_REUSED = true as const;
export const CODE_STRESS_BLOCK_IN_COMMON_KERNEL = false as const;
export const RC_GENERIC_MATERIAL_RESPONSE_CONTRACT = true as const;
export const RC_MATERIAL_MODEL_AUTHORITY_REQUIRED = true as const;
export const RC_LINEAR_ELASTIC_CONCRETE_REFERENCE = true as const;
export const CONCRETE_E_MODULUS_GOVERNED = true as const;
export const CONCRETE_E_DERIVED_FROM_UNGOVERNED_GRADE = false as const;
export const RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE = true as const;
export const LINEAR_ELASTIC_REFERENCE_EQUALS_CODE_CAPACITY = false as const;
export const DEFAULT_CONCRETE_CRACKING_MODEL = false as const;
export const CONCRETE_TENSION_RESPONSE_EXPLICIT = true as const;
export const DEFAULT_CONCRETE_ULTIMATE_STRAIN = false as const;
export const DEFAULT_REINFORCEMENT_STRAIN_LIMIT = false as const;
export const RC_SECTION_DISCRETIZATION_IMPLEMENTED = true as const;
export const RC_SECTION_DISCRETIZATION_DETERMINISTIC = true as const;
export const RC_NUMERICAL_TOLERANCE_MODEL = true as const;
export const RC_GENERIC_SECTION_INTEGRATOR = true as const;
export const RC_SECTION_RESULTANT_REFERENCE = true as const;
export const RC_RESULTANT_SIGN_CONVENTION_EXPLICIT = true as const;
export const RC_SECTION_RESULTANT_PROVENANCE = true as const;
export const D1E0_SECTION_EQUILIBRIUM_CONTRACT_REUSED = true as const;
export const RC_SECTION_EQUILIBRIUM_RESIDUAL = true as const;
export const RC_SECTION_EQUILIBRIUM_SOLVER_IMPLEMENTED = true as const;
export const RC_EQUILIBRIUM_NONCONVERGENCE_FAILS_CLOSED = true as const;
export const RC_NEUTRAL_AXIS_GEOMETRY_SUPPORTED = true as const;
export const NEUTRAL_AXIS_EQUALS_CODE_CAPACITY_STATE = false as const;
export const RC_UNCRACKED_ELASTIC_SECTION_REFERENCE = true as const;
export const TRANSFORMED_SECTION_MODULAR_RATIO_GUESSED = false as const;
export const RC_ELASTIC_REFERENCE_SCOPE_TRUTHFUL = true as const;
export const D1C_SECTION_ACTION_HANDOFF_READY = true as const;
export const PARALLEL_RC_STRUCTURAL_ANALYSIS_ENGINE_CREATED = false as const;
export const D1C_EQUALS_GENERAL_CONCRETE_ANALYSIS = false as const;
export const RC_FLEXURE_MECHANICS_HANDOFF_READY = true as const;
export const RC_AXIAL_FLEXURE_HANDOFF_READY = true as const;
export const AU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON = false as const;
export const EU_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON = false as const;
export const US_CONCRETE_PARAMETER_LEAKAGE_INTO_COMMON = false as const;
export const COMMON_RC_KERNEL_READY_FOR_AU_ADAPTER = true as const;
export const COMMON_RC_KERNEL_READY_FOR_EU_ADAPTER = true as const;
export const COMMON_RC_KERNEL_READY_FOR_US_ADAPTER = true as const;
export const RC_COMMON_MECHANICS_RULE_AUTHORITY = true as const;
export const SELF_REFERENTIAL_RC_BENCHMARKS = false as const;
export const D1E1_STANDARD_CONFORMANCE_VALIDATED = false as const;
export const D1E1_PRODUCT_CLAIM_LEVEL = "DETERMINISTIC_RC_SECTION_GEOMETRY_AND_MECHANICS_FOUNDATION" as const;
export const PARALLEL_CAPABILITY_MANIFEST_CREATED = false as const;
export const RC_INVERSE_DESIGN_GEOMETRY_EVALUATION_READY = true as const;
export const GENERATIVE_GEOMETRY_BYPASSES_VALIDATION = false as const;
export const INVALID_GENERATIVE_RC_CANDIDATE_FAILS_CLOSED = true as const;
export const RC_SECTION_OPTIMIZATION_HANDOFF_READY = true as const;
export const RC_SECTION_MTO_HANDOFF_READY = true as const;
export const DEFAULT_REINFORCEMENT_CARBON_FACTOR = false as const;
export const AI_RC_SECTION_ASSISTANCE_ADVISORY_ONLY = true as const;
export const LLM_RC_SECTION_NUMERICAL_AUTHORITY = false as const;
export const AI_CAN_OVERRIDE_DETERMINISTIC_SECTION_KERNEL = false as const;
export const RC_SECTION_MECHANICS_EQUALS_ENGINEERING_APPROVAL = false as const;
export const AUTOMATIC_RC_ENGINEERING_APPROVAL = false as const;
export const PARALLEL_RC_SECURITY_MODEL_CREATED = false as const;
export const RC_SECTION_CONTEXT_PII_REQUIRED = false as const;
export const SCHEMA_CHANGE_REQUIRED_FOR_D1E1 = false as const;
export const D1E1_GOVERNANCE_DOES_NOT_REDUCE_EU_HIGH_WATER_MARK = true as const;
export const EOS_D1E1_CLOSED = true as const;
export const RC_SECTION_MECHANICS_METHOD_VERSION = "d1e1.0" as const;
export const RC_COMMON_MECHANICS_AUTHORITY_TYPE = "ESTABLISHED_ENGINEERING_MECHANICS" as const satisfies EngineeringRuleAuthorityType;

export const RC_LENGTH_UNITS = ["mm", "m"] as const;
export type RcLengthUnit = (typeof RC_LENGTH_UNITS)[number];

export const RC_RESULT_AUTHORITIES = ["GEOMETRY_RESULT", "MECHANICS_REFERENCE", "ELASTIC_REFERENCE"] as const;
export type RcResultAuthority = (typeof RC_RESULT_AUTHORITIES)[number];

export const RC_REINFORCEMENT_DISPLACEMENT_TREATMENTS = [
  "CONCRETE_GROSS_SEPARATE",
  "SUBTRACT_REINFORCEMENT_AREA",
  "OTHER_GOVERNED_TREATMENT",
] as const;
export type RcReinforcementDisplacementTreatment = (typeof RC_REINFORCEMENT_DISPLACEMENT_TREATMENTS)[number];

export const RC_CONCRETE_TENSION_TREATMENTS = ["ELASTIC_TENSION", "NO_TENSION", "OTHER_GOVERNED"] as const;
export type RcConcreteTensionTreatment = (typeof RC_CONCRETE_TENSION_TREATMENTS)[number];

export const RC_CRACK_STATES = ["UNCRACKED_REFERENCE", "CRACK_STATE_NOT_EVALUATED"] as const;
export type RcCrackState = (typeof RC_CRACK_STATES)[number];

export const RC_BAR_CONTAINMENT_STATES = ["INSIDE_CONCRETE", "OUTSIDE_CONCRETE", "INSIDE_VOID", "ON_INVALID_BOUNDARY"] as const;
export type RcBarContainmentState = (typeof RC_BAR_CONTAINMENT_STATES)[number];

export const RC_EQUILIBRIUM_SOLVER_STATES = ["CONVERGED", "NOT_CONVERGED", "CHECK_UNDETERMINED"] as const;
export type RcEquilibriumSolverState = (typeof RC_EQUILIBRIUM_SOLVER_STATES)[number];

export const RC_PLANE_SECTION_ASSUMPTION = "PLANE_SECTIONS_REMAIN_PLANE" as const;

export const RC_SECTION_SIGN_CONVENTIONS = {
  origin: "explicit local origin recorded on the section coordinate system",
  xAxis: "local +x to the right in the section plane",
  yAxis: "local +y upward in the section plane",
  axialStrainPositive: "longitudinal tension",
  curvatureAboutXPositive: "produces compression at +y (ε decreases as y increases)",
  curvatureAboutYPositive: "produces compression at +x (ε decreases as x increases)",
  axialForcePositive: "tension",
  momentAboutXPositive: "conjugate to φx; compression on the +y face",
  momentAboutYPositive: "conjugate to φy; compression on the +x face",
  strainKinematics: "ε(x,y) = ε0 − φx (y − y0) − φy (x − x0)",
} as const;

export const RC_NUMERICAL_TOLERANCE = {
  relative: 1e-8,
  areaRelative: 5e-3,
  centroidMm: 0.5,
  secondMomentRelative: 2e-2,
  strain: 1e-12,
  forceN: 1e-3,
  momentNm: 1e-3,
  lengthMm: 1e-9,
  jacobianStrainStep: 1e-8,
  jacobianCurvatureStepPerMm: 1e-10,
  maxNewtonIterations: 25,
  maxSubdivision: 160,
} as const;

export type RcPointMm = { xMm: number; yMm: number };

export type RcSectionCoordinateSystem = {
  originMm: RcPointMm;
  xAxis: "+X_RIGHT";
  yAxis: "+Y_UP";
  orientationRad: number;
  lengthUnit: "mm";
  source: string;
  provenanceRef: string;
};

export type RcRegionKind = "RECTANGLE" | "CIRCLE" | "POLYGON";

export type RcConcreteRegion = {
  regionId: string;
  kind: RcRegionKind;
  originMm?: RcPointMm;
  widthMm?: number;
  depthMm?: number;
  centerMm?: RcPointMm;
  diameterMm?: number;
  verticesMm?: readonly RcPointMm[];
};

export type RcSectionVoidGeometry = RcConcreteRegion & {
  voidId: string;
  voidKind: "VOID" | "OPENING" | "DUCT" | "EMBEDDED_REGION";
};

export type RcSectionGeometryInput = {
  sectionId: string;
  shape: "RECTANGULAR" | "CIRCULAR" | "T_SECTION" | "L_SECTION" | "FLANGED" | "POLYGONAL" | "GENERIC_PROFILE";
  regions: readonly RcConcreteRegion[];
  voids: readonly RcSectionVoidGeometry[];
  coordinateSystem: RcSectionCoordinateSystem;
  lengthUnit: "mm";
  geometryVersion: string;
  provenanceRef: string;
};

export type ConcreteSectionGeometryProperties = {
  resultAuthority: "GEOMETRY_RESULT";
  sectionRef: string;
  geometryVersion: string;
  inputDimensions: Record<string, number | string>;
  unitSystem: { length: "mm"; area: "mm2"; secondMoment: "mm4"; angle: "rad" };
  derivationMethod: "DETERMINISTIC_PLANE_GEOMETRY";
  implementationVersion: typeof RC_SECTION_MECHANICS_METHOD_VERSION;
  grossConcreteAreaMm2: number;
  centroidXMm: number;
  centroidYMm: number;
  IxMm4: number;
  IyMm4: number;
  IxyMm4: number;
  principalI1Mm4: number;
  principalI2Mm4: number;
  principalAngleRad: number;
  timestamp: string;
  provenanceRef: string;
  labelledCodeCapacity: false;
};

export type RcGeneralizedStrainState = {
  axialStrain: number;
  curvatureXPerMm: number;
  curvatureYPerMm: number;
  originMm: RcPointMm;
  planeSectionAssumption: typeof RC_PLANE_SECTION_ASSUMPTION;
  universallyValid: false;
};

export type RcStrainFieldResult = {
  resultAuthority: "MECHANICS_REFERENCE";
  sectionRef: string;
  pointMm: RcPointMm;
  generalizedStrainState: RcGeneralizedStrainState;
  strain: number;
  coordinateConvention: typeof RC_SECTION_SIGN_CONVENTIONS;
  methodVersion: typeof RC_SECTION_MECHANICS_METHOD_VERSION;
  assumptionState: typeof RC_PLANE_SECTION_ASSUMPTION;
  provenanceRef: string;
  labelledCodeCapacity: false;
};

export type RcMaterialResponseState = {
  modelId: string;
  authorityType: EngineeringRuleAuthorityType;
  technicalBasis: string;
  applicability: string;
  requiredProperties: readonly string[];
  implementationVersion: string;
  validationState: "MECHANICS_REFERENCE";
  labelledCodeCapacity: false;
};

export type RcMaterialResponse = {
  stressMPa: number;
  tangentMPa: number | null;
  responseState: string;
  provenanceRef: string;
};

export type RcFiber = {
  fiberId: string;
  centroidMm: RcPointMm;
  areaMm2: number;
  widthMm: number;
  heightMm: number;
  regionId: string;
};

export type RcSectionDiscretization = {
  method: "CARTESIAN_CELL";
  resolutionX: number;
  resolutionY: number;
  fibers: readonly RcFiber[];
  totalAreaMm2: number;
  centroidMm: RcPointMm;
  IxMm4: number;
  IyMm4: number;
  IxyMm4: number;
  algorithmVersion: typeof RC_SECTION_MECHANICS_METHOD_VERSION;
};

export type RcSectionResultants = {
  resultAuthority: "MECHANICS_REFERENCE" | "ELASTIC_REFERENCE";
  N_N: number;
  Mx_Nm: number;
  My_Nm: number;
  unitForce: "N";
  unitMoment: "N.m";
  signConvention: typeof RC_SECTION_SIGN_CONVENTIONS;
  geometryVersion: string;
  reinforcementLayoutVersion: string;
  generalizedStrainState: RcGeneralizedStrainState;
  concreteModelId: string;
  reinforcementModelId: string | null;
  integrationAlgorithm: string;
  tolerances: typeof RC_NUMERICAL_TOLERANCE;
  displacementTreatment: RcReinforcementDisplacementTreatment;
  crackState: RcCrackState;
  labelledCodeCapacity: false;
  provenanceRef: string;
};

export type RcEquilibriumResidual = {
  rN_N: number;
  rMx_Nm: number;
  rMy_Nm: number;
  solverKind: "DETERMINISTIC_SECTION_EQUILIBRIUM";
  labelledCodeDesign: false;
};

export type RcNeutralAxisGeometry = {
  exists: boolean;
  pointMm: RcPointMm | null;
  directionRad: number | null;
  labelledCodeCapacity: false;
};

export type RcSectionKernelContext = {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  covers: readonly ConcreteCover[];
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  displacementTreatment: RcReinforcementDisplacementTreatment;
  tensionTreatment: RcConcreteTensionTreatment;
  crackState: RcCrackState;
  provenance: EosGlobalProvenanceContract;
  sourceAuthority: SteelSourceAuthorityType;
};
