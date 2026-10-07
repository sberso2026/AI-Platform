import type { UsConcreteEngineeringRule, UsConcreteMethodDependency } from "@rtb/types";
import {
  DEFAULT_US_CONCRETE_COVER,
  DEFAULT_US_CONCRETE_EXPOSURE_CLASS,
  DEFAULT_US_CREEP_MODEL,
  DEFAULT_US_LAP_LENGTH,
  DEFAULT_US_SHRINKAGE_MODEL,
  IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS,
  NUMERICAL_US_ANCHORAGE_DESIGN_IMPLEMENTED,
  NUMERICAL_US_CODE_COVER_CHECK_IMPLEMENTED,
  NUMERICAL_US_CONCRETE_SHEAR_IMPLEMENTED,
  NUMERICAL_US_CONCRETE_TORSION_IMPLEMENTED,
  NUMERICAL_US_DEVELOPMENT_LENGTH_IMPLEMENTED,
  NUMERICAL_US_PUNCHING_SHEAR_IMPLEMENTED,
  STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_CONCRETE,
  STEEL_STABILITY_RULE_REUSED_FOR_US_CONCRETE,
  US_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED,
  US_CONCRETE_FIRE_DESIGN_IMPLEMENTED,
  US_CONCRETE_IMPLEMENTATION_VERSION,
  US_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED,
  US_CONCRETE_STANDARD_CONFORMANCE_STATE,
  US_CONCRETE_STANDARD_EDITION,
  US_CONCRETE_STRAIN_LIMIT_GUESSED,
  US_CONCRETE_STRENGTH_REDUCTION_FACTOR_GUESSED,
  US_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED,
  US_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
} from "@rtb/types";

function unpopulatedParameter(parameterId: string) {
  return {
    parameterId,
    value: null as number | null,
    units: null as string | null,
    sourceAuthorityRef: null as string | null,
    validationState: "UNPOPULATED" as const,
  };
}

export const US_CONCRETE_MATERIAL_RESPONSE_ADAPTER = {
  ready: true,
  concreteCompressionResponse: unpopulatedParameter("concreteCompressionResponse"),
  concreteTensionTreatment: { explicit: true, selected: null as string | null },
  reinforcementResponse: unpopulatedParameter("reinforcementResponse"),
  strainLimits: unpopulatedParameter("strainLimits"),
  materialDesignValues: unpopulatedParameter("materialDesignValues"),
  numericalImplemented: false,
} as const;

export const US_CONCRETE_STRESS_BLOCK_DEPENDENCY = {
  ruleId: "US_CONCRETE_STRESS_BLOCK_RULE",
  technicalBasisRef: null as string | null,
  standardEditionApplicability: US_CONCRETE_STANDARD_EDITION,
  parameters: {
    beta1: unpopulatedParameter("beta1"),
  },
  implementationVersion: US_CONCRETE_IMPLEMENTATION_VERSION,
  validationState: "FRAMEWORK_ONLY",
  guessed: US_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED,
} as const;

export const US_CONCRETE_STRAIN_LIMIT_DEPENDENCY = {
  ruleId: "US_CONCRETE_STRAIN_LIMIT_RULE",
  ultimateConcreteStrain: unpopulatedParameter("ecu"),
  reinforcementStrainLimit: unpopulatedParameter("esu"),
  ductilityClassification: unpopulatedParameter("ductilityClassification"),
  guessed: US_CONCRETE_STRAIN_LIMIT_GUESSED,
} as const;

export const US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY = {
  ruleId: "US_CONCRETE_STRENGTH_REDUCTION_FACTOR_RULE",
  value: unpopulatedParameter("phi"),
  dependsOn: ["limitState", "strainState", "memberType", "designCondition", "standardEdition", "seismicDesignContext"] as const,
  guessed: US_CONCRETE_STRENGTH_REDUCTION_FACTOR_GUESSED,
  confinedToUsAdapter: true,
  steelLrfdAsdInherited: STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_CONCRETE,
} as const;

export const US_CONCRETE_TIME_DEPENDENT_INTERFACE = {
  creepModelId: null as string | null,
  shrinkageModelId: null as string | null,
  defaultCreepModel: DEFAULT_US_CREEP_MODEL,
  defaultShrinkageModel: DEFAULT_US_SHRINKAGE_MODEL,
} as const;

export function assertUsCodeParametersUnpopulated(): void {
  if (US_CONCRETE_STRESS_BLOCK_PARAMETER_GUESSED || US_CONCRETE_STRESS_BLOCK_DEPENDENCY.parameters.beta1.value != null) {
    throw new Error("US concrete stress-block parameters must not be guessed");
  }
  if (US_CONCRETE_STRAIN_LIMIT_GUESSED || US_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ultimateConcreteStrain.value != null) {
    throw new Error("US concrete strain limits must not be guessed");
  }
  if (US_CONCRETE_STRENGTH_REDUCTION_FACTOR_GUESSED || US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY.value.value != null) {
    throw new Error("US concrete strength-reduction factors must not be guessed");
  }
  if (STEEL_LRFD_ASD_SEMANTICS_REUSED_FOR_US_CONCRETE) {
    throw new Error("steel LRFD/ASD semantics must not be reused for US concrete");
  }
}

export const US_CONCRETE_FLEXURE_PROFILE: UsConcreteMethodDependency = {
  methodId: "US_RC_FLEXURE_ACI318_UNIAXIAL",
  methodType: "ACI318_UNIAXIAL_FLEXURE",
  aciFamily: "ACI 318",
  edition: US_CONCRETE_STANDARD_EDITION,
  buildingCodeDependency: true,
  localAmendmentDependency: true,
  materialResponseRef: US_CONCRETE_MATERIAL_RESPONSE_ADAPTER.concreteCompressionResponse.parameterId,
  stressBlockRef: US_CONCRETE_STRESS_BLOCK_DEPENDENCY.ruleId,
  strainLimitRefs: [US_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ruleId],
  strengthReductionFactorRefs: [US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY.ruleId],
  numericalImplemented: false,
  methodScope: "FRAMEWORK_ONLY",
};

export const US_CONCRETE_AXIAL_FLEXURE_PROFILE: UsConcreteMethodDependency = {
  methodId: "US_RC_AXIAL_FLEXURE_ACI318",
  methodType: "ACI318_N_M_N_MX_MY",
  aciFamily: "ACI 318",
  edition: US_CONCRETE_STANDARD_EDITION,
  buildingCodeDependency: true,
  localAmendmentDependency: true,
  materialResponseRef: null,
  stressBlockRef: US_CONCRETE_STRESS_BLOCK_DEPENDENCY.ruleId,
  strainLimitRefs: [US_CONCRETE_STRAIN_LIMIT_DEPENDENCY.ruleId],
  strengthReductionFactorRefs: [US_CONCRETE_STRENGTH_REDUCTION_FACTOR_DEPENDENCY.ruleId],
  numericalImplemented: false,
  methodScope: "NOT_IMPLEMENTED",
};

export const US_CONCRETE_SHEAR_PROFILE: UsConcreteMethodDependency = {
  ...US_CONCRETE_AXIAL_FLEXURE_PROFILE,
  methodId: "US_RC_SHEAR_ACI318",
  methodType: "ACI318_SHEAR",
  stressBlockRef: null,
  strainLimitRefs: [],
};

export const US_CONCRETE_PUNCHING_PROFILE: UsConcreteMethodDependency = {
  ...US_CONCRETE_SHEAR_PROFILE,
  methodId: "US_RC_PUNCHING_ACI318",
  methodType: "ACI318_PUNCHING",
};

export const US_CONCRETE_TORSION_PROFILE: UsConcreteMethodDependency = {
  ...US_CONCRETE_SHEAR_PROFILE,
  methodId: "US_RC_TORSION_ACI318",
  methodType: "ACI318_TORSION",
};

export const US_CONCRETE_SERVICEABILITY_PROFILE: UsConcreteMethodDependency = {
  ...US_CONCRETE_SHEAR_PROFILE,
  methodId: "US_RC_SLS_ACI318",
  methodType: "ACI318_SERVICEABILITY",
  strengthReductionFactorRefs: [],
};

export const US_CONCRETE_DURABILITY_PROFILE = {
  ready: true,
  exposureContext: null,
  defaultExposureClass: DEFAULT_US_CONCRETE_EXPOSURE_CLASS,
  coverRequirement: null,
  defaultCover: DEFAULT_US_CONCRETE_COVER,
  numericalCoverCheck: NUMERICAL_US_CODE_COVER_CHECK_IMPLEMENTED,
} as const;

export const US_CONCRETE_DETAILING_PROFILE = {
  ready: true,
  minReinforcement: null,
  maxReinforcement: null,
  barSpacing: null,
  transverseReinforcement: null,
  tiesConfinement: null,
  development: null,
  anchorage: null,
  laps: null,
  defaultLapLength: DEFAULT_US_LAP_LENGTH,
  numericalDevelopment: NUMERICAL_US_DEVELOPMENT_LENGTH_IMPLEMENTED,
  numericalAnchorage: NUMERICAL_US_ANCHORAGE_DESIGN_IMPLEMENTED,
} as const;

export const US_CONCRETE_SECOND_ORDER_PROFILE = {
  ready: true,
  reusesSteelStability: STEEL_STABILITY_RULE_REUSED_FOR_US_CONCRETE,
  numericalImplemented: false,
} as const;

export const US_CONCRETE_BOUNDARY_FLAGS = {
  flexureMethodsImplemented: IMPLEMENTED_US_CONCRETE_CODE_FLEXURE_METHODS,
  shearImplemented: NUMERICAL_US_CONCRETE_SHEAR_IMPLEMENTED,
  punchingImplemented: NUMERICAL_US_PUNCHING_SHEAR_IMPLEMENTED,
  torsionImplemented: NUMERICAL_US_CONCRETE_TORSION_IMPLEMENTED,
  fireImplemented: US_CONCRETE_FIRE_DESIGN_IMPLEMENTED,
  seismicImplemented: US_CONCRETE_SEISMIC_DESIGN_IMPLEMENTED,
  connectionImplemented: US_CONCRETE_CONNECTION_DESIGN_IMPLEMENTED,
  prestressImplemented: US_PRESTRESSED_CONCRETE_DESIGN_IMPLEMENTED,
} as const;

export const US_CONCRETE_FLEXURE_RULE_TEMPLATE: UsConcreteEngineeringRule = {
  ruleId: "US_RC_FLEXURE_ACI318_UNIAXIAL",
  authorityType: "VALIDATED_ENGINEERING_REFERENCE",
  technicalBasisRef: "UNBOUND_PENDING_CONFIRMED_ACI318_EDITION",
  aciFamily: "ACI 318",
  edition: US_CONCRETE_STANDARD_EDITION,
  amendmentErrataState: "UNKNOWN_PENDING_CONFIRMATION",
  buildingCodeDependency: true,
  localAmendmentDependency: true,
  applicability: "future bounded uniaxial flexure; not implemented",
  requiredInputs: ["standardContext", "section", "layout", "materials", "demand.moment"],
  implementationVersion: US_CONCRETE_IMPLEMENTATION_VERSION,
  validationState: "FRAMEWORK_ONLY",
  conformanceState: US_CONCRETE_STANDARD_CONFORMANCE_STATE,
};
