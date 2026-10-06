import type { EuConcreteEngineeringRule, EuConcreteMethodDependency } from "@rtb/types";
import {
  DEFAULT_EU_CONCRETE_COVER,
  DEFAULT_EU_CREEP_MODEL,
  DEFAULT_EU_LAP_LENGTH,
  DEFAULT_EU_SHRINKAGE_MODEL,
  EU_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED,
  EU_CONCRETE_FIRE_DESIGN_IMPLEMENTED,
  EU_CONCRETE_IMPLEMENTATION_VERSION,
  EU_CONCRETE_PARTIAL_FACTOR_GUESSED,
  EU_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_CONCRETE_STANDARD_EDITION,
  EU_CONCRETE_STRAIN_LIMIT_GUESSED,
  EU_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED,
  EU_INITIAL_CONCRETE_STANDARD_PART,
  EU_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
  IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS,
  NUMERICAL_EU_CODE_COVER_CHECK_IMPLEMENTED,
  NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_EU_DEVELOPMENT_LENGTH_IMPLEMENTED,
  NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED,
  STEEL_STABILITY_RULE_REUSED_FOR_EU_CONCRETE,
} from "@rtb/types";

function unpopulatedParameter(parameterId: string, ndpCapable: boolean) {
  return {
    parameterId,
    value: null as number | null,
    units: null as string | null,
    sourceAuthorityRef: null as string | null,
    ndpCapable,
    validationState: "UNPOPULATED" as const,
  };
}

export const EU_CONCRETE_MATERIAL_RESPONSE_ADAPTER = {
  ready: true,
  concreteCompressionResponse: unpopulatedParameter("concreteCompressionResponse", true),
  concreteTensionTreatment: { explicit: true, selected: null as string | null },
  reinforcementResponse: unpopulatedParameter("reinforcementResponse", true),
  strainLimits: unpopulatedParameter("strainLimits", true),
  materialDesignValues: unpopulatedParameter("materialDesignValues", true),
  numericalImplemented: false,
} as const;

export const EU_CONCRETE_STRESS_BLOCK_DEPENDENCY = {
  ruleId: "EU_CONCRETE_STRESS_BLOCK_RULE",
  technicalBasisRef: null as string | null,
  standardEditionApplicability: EU_CONCRETE_STANDARD_EDITION,
  parameterRefs: ["eta", "lambda"] as const,
  parameters: {
    eta: unpopulatedParameter("eta", true),
    lambda: unpopulatedParameter("lambda", true),
  },
  materialRangeApplicability: null as string | null,
  implementationVersion: EU_CONCRETE_IMPLEMENTATION_VERSION,
  validationState: "FRAMEWORK_ONLY",
  guessed: EU_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED,
} as const;

export const EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY = {
  ruleId: "EU_CONCRETE_STRAIN_LIMIT_RULE",
  ultimateConcreteStrain: unpopulatedParameter("ecu", true),
  reinforcementStrainLimit: unpopulatedParameter("esu", true),
  ductilitySectionState: unpopulatedParameter("ductilitySectionState", true),
  guessed: EU_CONCRETE_STRAIN_LIMIT_GUESSED,
} as const;

export const EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY = {
  ruleId: "EU_CONCRETE_PARTIAL_FACTOR_RULE",
  concreteMaterial: unpopulatedParameter("gamma_c", true),
  reinforcementMaterial: unpopulatedParameter("gamma_s", true),
  otherDesignFactors: [] as const,
  guessed: EU_CONCRETE_PARTIAL_FACTOR_GUESSED,
  confinedToEuAdapter: true,
} as const;

export const EU_CONCRETE_TIME_DEPENDENT_INTERFACE = {
  creepModelId: null as string | null,
  shrinkageModelId: null as string | null,
  defaultCreepModel: DEFAULT_EU_CREEP_MODEL,
  defaultShrinkageModel: DEFAULT_EU_SHRINKAGE_MODEL,
} as const;

export function assertEuCodeParametersUnpopulated(): void {
  if (EU_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED || EU_CONCRETE_STRESS_BLOCK_DEPENDENCY.parameters.eta.value != null) {
    throw new Error("EU concrete stress-block parameters must not be guessed");
  }
  if (EU_CONCRETE_STRAIN_LIMIT_GUESSED || EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ultimateConcreteStrain.value != null) {
    throw new Error("EU concrete strain limits must not be guessed");
  }
  if (EU_CONCRETE_PARTIAL_FACTOR_GUESSED || EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY.concreteMaterial.value != null) {
    throw new Error("EU concrete partial factors must not be guessed");
  }
}

export const EU_CONCRETE_FLEXURE_PROFILE: EuConcreteMethodDependency = {
  methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL",
  methodType: "EN1992_UNIAXIAL_FLEXURE",
  standardPartRefs: [EU_INITIAL_CONCRETE_STANDARD_PART],
  generationApplicability: ["UNKNOWN_PENDING_CONFIRMATION"],
  nationalAnnexRequired: true,
  ndpDependencies: ["gamma_c", "gamma_s", "ecu", "eta", "lambda"],
  materialResponseRef: EU_CONCRETE_MATERIAL_RESPONSE_ADAPTER.concreteCompressionResponse.parameterId,
  stressBlockRef: EU_CONCRETE_STRESS_BLOCK_DEPENDENCY.ruleId,
  strainLimitRefs: [EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ruleId],
  partialFactorRefs: [EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY.ruleId],
  numericalImplemented: false,
  methodScope: "FRAMEWORK_ONLY",
};

export const EU_CONCRETE_AXIAL_FLEXURE_PROFILE: EuConcreteMethodDependency = {
  methodId: "EU_RC_AXIAL_FLEXURE_EN1992",
  methodType: "EN1992_N_M_N_MX_MY",
  standardPartRefs: [EU_INITIAL_CONCRETE_STANDARD_PART],
  generationApplicability: ["UNKNOWN_PENDING_CONFIRMATION"],
  nationalAnnexRequired: true,
  ndpDependencies: ["gamma_c", "gamma_s"],
  materialResponseRef: null,
  stressBlockRef: EU_CONCRETE_STRESS_BLOCK_DEPENDENCY.ruleId,
  strainLimitRefs: [EU_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ruleId],
  partialFactorRefs: [EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY.ruleId],
  numericalImplemented: false,
  methodScope: "NOT_IMPLEMENTED",
};

export const EU_CONCRETE_SHEAR_PROFILE: EuConcreteMethodDependency = {
  methodId: "EU_RC_SHEAR_EN1992",
  methodType: "EN1992_SHEAR",
  standardPartRefs: [EU_INITIAL_CONCRETE_STANDARD_PART],
  generationApplicability: ["UNKNOWN_PENDING_CONFIRMATION"],
  nationalAnnexRequired: true,
  ndpDependencies: ["gamma_c", "gamma_s"],
  materialResponseRef: null,
  stressBlockRef: null,
  strainLimitRefs: [],
  partialFactorRefs: [EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY.ruleId],
  numericalImplemented: false,
  methodScope: "NOT_IMPLEMENTED",
};

export const EU_CONCRETE_PUNCHING_PROFILE: EuConcreteMethodDependency = {
  methodId: "EU_RC_PUNCHING_EN1992",
  methodType: "EN1992_PUNCHING",
  standardPartRefs: [EU_INITIAL_CONCRETE_STANDARD_PART],
  generationApplicability: ["UNKNOWN_PENDING_CONFIRMATION"],
  nationalAnnexRequired: true,
  ndpDependencies: ["gamma_c"],
  materialResponseRef: null,
  stressBlockRef: null,
  strainLimitRefs: [],
  partialFactorRefs: [EU_CONCRETE_PARTIAL_FACTOR_DEPENDENCY.ruleId],
  numericalImplemented: false,
  methodScope: "NOT_IMPLEMENTED",
};

export const EU_CONCRETE_SERVICEABILITY_PROFILE: EuConcreteMethodDependency = {
  methodId: "EU_RC_SLS_EN1992",
  methodType: "EN1992_SERVICEABILITY",
  standardPartRefs: [EU_INITIAL_CONCRETE_STANDARD_PART],
  generationApplicability: ["UNKNOWN_PENDING_CONFIRMATION"],
  nationalAnnexRequired: true,
  ndpDependencies: [],
  materialResponseRef: null,
  stressBlockRef: null,
  strainLimitRefs: [],
  partialFactorRefs: [],
  numericalImplemented: false,
  methodScope: "NOT_IMPLEMENTED",
};

export const EU_CONCRETE_DURABILITY_PROFILE = {
  ready: true,
  exposureContext: null,
  designLife: null,
  coverRequirement: null,
  defaultCover: DEFAULT_EU_CONCRETE_COVER,
  numericalCoverCheck: NUMERICAL_EU_CODE_COVER_CHECK_IMPLEMENTED,
} as const;

export const EU_CONCRETE_DETAILING_PROFILE = {
  ready: true,
  minReinforcement: null,
  maxReinforcement: null,
  barSpacing: null,
  anchorage: null,
  laps: null,
  defaultLapLength: DEFAULT_EU_LAP_LENGTH,
  transverseReinforcement: null,
  confinement: null,
  numericalDevelopment: NUMERICAL_EU_DEVELOPMENT_LENGTH_IMPLEMENTED,
} as const;

export const EU_CONCRETE_SECOND_ORDER_PROFILE = {
  ready: true,
  reusesSteelStability: STEEL_STABILITY_RULE_REUSED_FOR_EU_CONCRETE,
  numericalImplemented: false,
} as const;

export const EU_CONCRETE_BOUNDARY_FLAGS = {
  shearImplemented: NUMERICAL_EU_CONCRETE_SHEAR_IMPLEMENTED,
  punchingImplemented: NUMERICAL_EU_PUNCHING_SHEAR_IMPLEMENTED,
  fireImplemented: EU_CONCRETE_FIRE_DESIGN_IMPLEMENTED,
  seismicImplemented: EU_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED,
  connectionImplemented: EU_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED,
  prestressImplemented: EU_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
  flexureMethodsImplemented: IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS,
} as const;

export const EU_CONCRETE_FLEXURE_RULE_TEMPLATE: EuConcreteEngineeringRule = {
  ruleId: "EU_RC_FLEXURE_EN1992_UNIAXIAL",
  authorityType: "VALIDATED_ENGINEERING_REFERENCE",
  technicalBasisRef: "UNBOUND_PENDING_CONFIRMED_EN1992_EDITION",
  standardFamily: "EN 1992",
  generation: "UNKNOWN_PENDING_CONFIRMATION",
  edition: EU_CONCRETE_STANDARD_EDITION,
  part: EU_INITIAL_CONCRETE_STANDARD_PART,
  nationalAnnexDependency: true,
  ndpDependency: EU_CONCRETE_FLEXURE_PROFILE.ndpDependencies,
  applicability: "future bounded uniaxial flexure; not implemented",
  implementationVersion: EU_CONCRETE_IMPLEMENTATION_VERSION,
  validationState: "FRAMEWORK_ONLY",
  conformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
};
