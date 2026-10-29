import type { EuConcreteFlexureMethodRecord } from "@rtb/types";
import {
  EU_C2_ENGINEER_VALIDATION_STATE,
  EU_C2_FLEXURE_IMPLEMENTATION_VERSION,
  EU_C2_METHOD_IDS,
  EU_C3_ENGINEER_VALIDATION_STATE,
  EU_C3_FLEXURE_IMPLEMENTATION_VERSION,
  EU_C3_METHOD_IDS,
  EU_C4_ENGINEER_VALIDATION_STATE,
  EU_C4_FLEXURE_IMPLEMENTATION_VERSION,
  EU_C4_METHOD_IDS,
  EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  EU_CONCRETE_STANDARD_EDITION,
  EU_FLEXURE_IMPLEMENTATION_VERSION,
  EU_INITIAL_CONCRETE_STANDARD_PART,
} from "@rtb/types";

export const EU_FLEXURE_TOOL_REF = "EOS_EU_CONCRETE_FLEXURE" as const;

export const EU_RC_FLEXURE_ELASTIC_MAJOR: EuConcreteFlexureMethodRecord = {
  methodId: "EU_RC_FLEXURE_ELASTIC_MAJOR",
  methodType: "ELASTIC_SECTION_REFERENCE",
  axis: "MAJOR_AXIS",
  engineeringRuleRef: "EU-RC-FLEXURE-ELASTIC-MAJOR-V1",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "d1e1-uncracked-elastic-section-reference-equilibrated-to-d1c-moment",
  standardFamily: "EN 1992",
  generation: "UNKNOWN_PENDING_CONFIRMATION",
  edition: EU_CONCRETE_STANDARD_EDITION,
  part: EU_INITIAL_CONCRETE_STANDARD_PART,
  nationalAnnexDependency: false,
  ndpDependency: [],
  requiredMaterialModels: ["RC_LINEAR_ELASTIC_CONCRETE_REFERENCE", "RC_LINEAR_ELASTIC_REINFORCEMENT_REFERENCE"],
  stressBlockOrDesignModelDependency: null,
  strainLimitDependencies: [],
  partialFactorDependencies: [],
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; uniaxial major-axis; D1E-1 valid geometry; arbitrary D1E-1 reinforcement layout",
  requiredInputs: ["concrete.elasticModulus", "reinforcement.elasticModulus", "demand.moment", "section", "layout"],
  outputSemantics: "MECHANICS_REFERENCE",
  implementationVersion: EU_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "BENCHMARKED",
  engineeringValidationState: "NOT_VALIDATED",
  standardConformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: ["EU-RC-FLEXURE-BM-ELASTIC-MAJOR-HAND-1"],
  methodScope: "MECHANICS_REFERENCE_ONLY",
};

export const EU_RC_FLEXURE_ELASTIC_MINOR: EuConcreteFlexureMethodRecord = {
  ...EU_RC_FLEXURE_ELASTIC_MAJOR,
  methodId: "EU_RC_FLEXURE_ELASTIC_MINOR",
  axis: "MINOR_AXIS",
  engineeringRuleRef: "EU-RC-FLEXURE-ELASTIC-MINOR-V1",
  applicability: "PURE_OR_NEAR_PURE_FLEXURE_ONLY; uniaxial minor-axis; D1E-1 valid geometry; arbitrary D1E-1 reinforcement layout",
  benchmarkRefs: ["EU-RC-FLEXURE-BM-ELASTIC-MINOR-HAND-1"],
};

export const EU_RC_FLEXURE_EN1992_MAJOR: EuConcreteFlexureMethodRecord = {
  methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MAJOR",
  methodType: "EN1992_UNIAXIAL_FLEXURE",
  axis: "MAJOR_AXIS",
  engineeringRuleRef: "EU-RC-FLEXURE-EN1992-MAJOR-C2",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "d1e1-material-integration-uls-pure-flexure-zero-axial-eps-cu2-governed-c1c",
  standardFamily: "EN 1992",
  generation: "UNKNOWN_PENDING_CONFIRMATION",
  edition: EU_CONCRETE_STANDARD_EDITION,
  part: EU_INITIAL_CONCRETE_STANDARD_PART,
  nationalAnnexDependency: true,
  ndpDependency: ["gamma_c", "gamma_s", "alpha_cc"],
  requiredMaterialModels: ["EU_C1_CONCRETE_COMPRESSION_RESPONSE", "EU_C1_REINFORCEMENT_RESPONSE"],
  stressBlockOrDesignModelDependency: "MATERIAL_INTEGRATION",
  strainLimitDependencies: ["EU_C1_CONCRETE_STRAIN_LIMITS"],
  partialFactorDependencies: ["gamma_c", "gamma_s"],
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability:
    "reinforced concrete; uniaxial bending; RECTANGULAR geometry numerically validated; pure-flexure zero applied axial; material integration; declared NDP context required; not N-M, biaxial, shear, punching, torsion, prestress, fire, seismic, or connections",
  requiredInputs: [
    "concrete.compressiveStrength",
    "reinforcement.yieldStrength",
    "standardPart",
    "declaredNdpContext",
    "demand.moment",
    "section",
    "layout",
  ],
  outputSemantics: "CODE_PROFILE_REFERENCE",
  implementationVersion: EU_C2_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "NUMERICALLY_VALIDATED",
  engineeringValidationState: EU_C2_ENGINEER_VALIDATION_STATE,
  standardConformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: ["EU-C2-BM-INDEPENDENT-EQUIV-RECT-MAJOR-1"],
  methodScope: "GOVERNED_IMPLEMENTABLE",
};

export const EU_RC_FLEXURE_EN1992_MINOR: EuConcreteFlexureMethodRecord = {
  ...EU_RC_FLEXURE_EN1992_MAJOR,
  methodId: "EU_RC_FLEXURE_EN1992_UNIAXIAL_MINOR",
  axis: "MINOR_AXIS",
  engineeringRuleRef: "EU-RC-FLEXURE-EN1992-MINOR-C2",
  benchmarkRefs: ["EU-C2-BM-INDEPENDENT-EQUIV-RECT-MINOR-1"],
};

export const EU_CONCRETE_FLEXURE_METHODS: readonly EuConcreteFlexureMethodRecord[] = [
  EU_RC_FLEXURE_ELASTIC_MAJOR,
  EU_RC_FLEXURE_ELASTIC_MINOR,
  EU_RC_FLEXURE_EN1992_MAJOR,
  EU_RC_FLEXURE_EN1992_MINOR,
];

export const EU_RC_AXIAL_FLEXURE_EN1992_MAJOR: EuConcreteFlexureMethodRecord = {
  methodId: "EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MAJOR",
  methodType: "EN1992_UNIAXIAL_AXIAL_FLEXURE",
  axis: "MAJOR_AXIS",
  engineeringRuleRef: "EU-RC-AXIAL-FLEXURE-EN1992-MAJOR-C3",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "d1e1-material-integration-uls-uniaxial-nm-eps-cu2-and-eps-yd-governed-c1c",
  standardFamily: "EN 1992",
  generation: "UNKNOWN_PENDING_CONFIRMATION",
  edition: EU_CONCRETE_STANDARD_EDITION,
  part: EU_INITIAL_CONCRETE_STANDARD_PART,
  nationalAnnexDependency: true,
  ndpDependency: ["gamma_c", "gamma_s", "alpha_cc"],
  requiredMaterialModels: ["EU_C1_CONCRETE_COMPRESSION_RESPONSE", "EU_C1_REINFORCEMENT_RESPONSE"],
  stressBlockOrDesignModelDependency: "MATERIAL_INTEGRATION",
  strainLimitDependencies: ["EU_C1_CONCRETE_STRAIN_LIMITS"],
  partialFactorDependencies: ["gamma_c", "gamma_s"],
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability:
    "reinforced concrete; uniaxial N-M; RECTANGULAR geometry numerically validated; axial domain between uniform εcu2 compression and uniform εyd tension mechanics anchors; material integration; declared NDP required; section resistance only; not biaxial, slenderness, second-order, shear, punching, torsion, or prestress",
  requiredInputs: [
    "concrete.compressiveStrength",
    "reinforcement.yieldStrength",
    "standardPart",
    "declaredNdpContext",
    "demand.axial",
    "demand.moment",
    "section",
    "layout",
  ],
  outputSemantics: "CODE_PROFILE_REFERENCE",
  implementationVersion: EU_C3_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "NUMERICALLY_VALIDATED",
  engineeringValidationState: EU_C3_ENGINEER_VALIDATION_STATE,
  standardConformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: ["EU-C3-BM-INDEPENDENT-EQUIV-RECT-MAJOR-NM-1"],
  methodScope: "GOVERNED_IMPLEMENTABLE",
};

export const EU_RC_AXIAL_FLEXURE_EN1992_MINOR: EuConcreteFlexureMethodRecord = {
  ...EU_RC_AXIAL_FLEXURE_EN1992_MAJOR,
  methodId: "EU_RC_AXIAL_FLEXURE_EN1992_UNIAXIAL_MINOR",
  axis: "MINOR_AXIS",
  engineeringRuleRef: "EU-RC-AXIAL-FLEXURE-EN1992-MINOR-C3",
  benchmarkRefs: ["EU-C3-BM-INDEPENDENT-EQUIV-RECT-MINOR-NM-1"],
};

export const EU_CONCRETE_AXIAL_FLEXURE_METHODS: readonly EuConcreteFlexureMethodRecord[] = [
  EU_RC_AXIAL_FLEXURE_EN1992_MAJOR,
  EU_RC_AXIAL_FLEXURE_EN1992_MINOR,
];

export const EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR: EuConcreteFlexureMethodRecord = {
  methodId: EU_C4_METHOD_IDS[0],
  methodType: "EN1992_BIAXIAL_PMM",
  axis: "BIAXIAL_PMM",
  engineeringRuleRef: "EU-RC-BIAXIAL-EN1992-PMM-RECT-C4",
  authorityType: "ESTABLISHED_ENGINEERING_MECHANICS",
  technicalBasisRef: "d1e1-material-integration-uls-biaxial-pmm-eps-cu2-or-eps-yd-c3-principal-anchors",
  standardFamily: "EN 1992",
  generation: "UNKNOWN_PENDING_CONFIRMATION",
  edition: EU_CONCRETE_STANDARD_EDITION,
  part: EU_INITIAL_CONCRETE_STANDARD_PART,
  nationalAnnexDependency: true,
  ndpDependency: ["gamma_c", "gamma_s", "alpha_cc"],
  requiredMaterialModels: ["EU_C1_CONCRETE_COMPRESSION_RESPONSE", "EU_C1_REINFORCEMENT_RESPONSE"],
  stressBlockOrDesignModelDependency: "MATERIAL_INTEGRATION",
  strainLimitDependencies: ["EU_C1_CONCRETE_STRAIN_LIMITS"],
  partialFactorDependencies: ["gamma_c", "gamma_s"],
  reinforcementDependencies: ["D1E1_REINFORCEMENT_LAYOUT"],
  applicability:
    "reinforced concrete; biaxial N-Mx-My section resistance; RECTANGULAR geometry numerically validated; axial domain subset of C3 mechanics anchors; material integration; declared NDP required; first-order section only; not slenderness, second-order, shear, punching, torsion, or prestress",
  requiredInputs: [
    "concrete.compressiveStrength",
    "reinforcement.yieldStrength",
    "standardPart",
    "declaredNdpContext",
    "demand.axial",
    "demand.moment",
    "demand.minorMoment",
    "section",
    "layout",
  ],
  outputSemantics: "CODE_PROFILE_REFERENCE",
  implementationVersion: EU_C4_FLEXURE_IMPLEMENTATION_VERSION,
  numericalValidationState: "NUMERICALLY_VALIDATED",
  engineeringValidationState: EU_C4_ENGINEER_VALIDATION_STATE,
  standardConformanceState: EU_CONCRETE_STANDARD_CONFORMANCE_STATE,
  benchmarkRefs: ["EU-C4-BM-INDEPENDENT-EQUIV-RECT-PRINCIPAL", "EU-C4-BM-INDEPENDENT-DIAGONAL-45"],
  methodScope: "GOVERNED_IMPLEMENTABLE",
};

export const EU_CONCRETE_BIAXIAL_METHODS: readonly EuConcreteFlexureMethodRecord[] = [EU_RC_BIAXIAL_EN1992_PMM_RECTANGULAR];

export { EU_C5_METHOD_REGISTRY } from "../eu-c5/registry";

export const IMPLEMENTED_EU_CONCRETE_CODE_FLEXURE_METHODS = EU_C2_METHOD_IDS;
export const FRAMEWORK_ONLY_EU_CONCRETE_FLEXURE_METHODS = [] as const;

export const EU_FLEXURE_DUCTILITY = {
  ruleId: "EU_FLEXURE_DUCTILITY",
  numericThreshold: null,
  implementationState: "FRAMEWORK_ONLY",
} as const;
