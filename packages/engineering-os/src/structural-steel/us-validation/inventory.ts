import type { SteelEngineeringRule, UsMethodClassification, UsMethodValidationRecord } from "@rtb/types";
import { AISC_UNKNOWN_EDITION_TOKEN } from "@rtb/types";
import { US_BENDING_METHOD_REGISTRY } from "../us-bending/registry";
import { IMPLEMENTED_US_INTERACTION_METHODS, US_INTERACTION_METHOD_REGISTRY } from "../us-combined/registry";
import { US_COMPRESSION_METHOD_REGISTRY } from "../us-compression/registry";
import { US_MEMBER_IMPLEMENTATION_VERSION } from "../us-member/registry";
import { US_SHEAR_METHOD_REGISTRY } from "../us-shear/registry";
import { US_TENSION_METHOD_REGISTRY } from "../us-tension/registry";

type UsRegistryRule = SteelEngineeringRule & {
  methodType: string;
  aiscEditionRequirement?: string;
  designMethodApplicability?: "LRFD" | "ASD" | "BOTH";
};

function row(
  rule: UsRegistryRule,
  extra: {
    category: string;
    methodType: UsMethodClassification;
    classifications: UsMethodClassification[];
    unsupportedScope: string;
    numericalValidationState?: UsMethodValidationRecord["numericalValidationState"];
    stabilityMethodDependency?: UsMethodValidationRecord["stabilityMethodDependency"];
    classificationDependency?: UsMethodValidationRecord["classificationDependency"];
    localBucklingDependency?: UsMethodValidationRecord["localBucklingDependency"];
  },
): UsMethodValidationRecord {
  const mechanics = extra.classifications.includes("ENGINEERING_MECHANICS_REFERENCE") || extra.classifications.includes("ELASTIC_BUCKLING_REFERENCE");
  return {
    methodId: rule.methodId,
    category: extra.category,
    methodType: extra.methodType,
    technicalBasis: rule.technicalBasisRef,
    authorityType: rule.authorityType,
    aiscEditionRequirement: AISC_UNKNOWN_EDITION_TOKEN,
    designMethodApplicability: rule.designMethodApplicability ?? (extra.methodType === "LRFD_DESIGN_STRENGTH_METHOD" ? "LRFD" : extra.methodType === "ASD_ALLOWABLE_STRENGTH_METHOD" ? "ASD" : "BOTH"),
    unitSystemApplicability: "BOTH",
    loadBasisDependency: extra.methodType === "LRFD_DESIGN_STRENGTH_METHOD" || extra.methodType === "ASD_ALLOWABLE_STRENGTH_METHOD" ? "REQUIRED" : "NONE",
    stabilityMethodDependency: extra.stabilityMethodDependency ?? "NONE",
    classificationDependency: extra.classificationDependency ?? "NONE",
    localBucklingDependency: extra.localBucklingDependency ?? "NONE",
    localAmendmentDependency: "OPTIONAL",
    requiredInputs: [...rule.requiredInputs],
    supportedScope: rule.applicability,
    unsupportedScope: extra.unsupportedScope,
    implementationVersion: rule.implementationVersion,
    benchmarkRefs: [...rule.benchmarkRefs],
    numericalValidationState: extra.numericalValidationState ?? (mechanics && rule.validationState === "BENCHMARKED" ? "PASS" : "NOT_APPLICABLE"),
    engineeringValidationState: "VALIDATION_REQUIRED",
    standardConformanceState: "INTENDED_PROFILE",
    humanReviewRequirement: "required",
    classifications: extra.classifications,
  };
}

const MECHANICS_NOT_AISC = "not AISC design strength, LRFD/ASD factor, classification, local buckling, or adopted-building-code compliance";

export const US_METHOD_VALIDATION_INVENTORY: readonly UsMethodValidationRecord[] = [
  row(US_TENSION_METHOD_REGISTRY[0]!, {
    category: "TENSION",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `gross-yield mechanics; ${MECHANICS_NOT_AISC}`,
  }),
  row(US_TENSION_METHOD_REGISTRY[1]!, {
    category: "TENSION",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `net-fracture mechanics; ${MECHANICS_NOT_AISC}`,
  }),
  row(US_TENSION_METHOD_REGISTRY[2]!, {
    category: "TENSION",
    methodType: "NOMINAL_STRENGTH_METHOD",
    classifications: ["NOMINAL_STRENGTH_METHOD"],
    unsupportedScope: "effective-net-area AISC tension; FRAMEWORK_ONLY",
  }),
  row(US_TENSION_METHOD_REGISTRY[3]!, {
    category: "TENSION",
    methodType: "LRFD_DESIGN_STRENGTH_METHOD",
    classifications: ["LRFD_DESIGN_STRENGTH_METHOD"],
    unsupportedScope: "LRFD tension design strength; FRAMEWORK_ONLY",
  }),
  row(US_TENSION_METHOD_REGISTRY[4]!, {
    category: "TENSION",
    methodType: "LRFD_DESIGN_STRENGTH_METHOD",
    classifications: ["LRFD_DESIGN_STRENGTH_METHOD"],
    unsupportedScope: "LRFD net-section tension; FRAMEWORK_ONLY",
  }),
  row(US_TENSION_METHOD_REGISTRY[5]!, {
    category: "TENSION",
    methodType: "ASD_ALLOWABLE_STRENGTH_METHOD",
    classifications: ["ASD_ALLOWABLE_STRENGTH_METHOD"],
    unsupportedScope: "ASD tension allowable strength; FRAMEWORK_ONLY",
  }),
  row(US_TENSION_METHOD_REGISTRY[6]!, {
    category: "TENSION",
    methodType: "ASD_ALLOWABLE_STRENGTH_METHOD",
    classifications: ["ASD_ALLOWABLE_STRENGTH_METHOD"],
    unsupportedScope: "ASD net-section tension; FRAMEWORK_ONLY",
  }),
  row(US_TENSION_METHOD_REGISTRY[7]!, {
    category: "TENSION",
    methodType: "NOMINAL_STRENGTH_METHOD",
    classifications: ["NOMINAL_STRENGTH_METHOD"],
    unsupportedScope: "block shear; FRAMEWORK_ONLY",
  }),
  row(US_COMPRESSION_METHOD_REGISTRY[0]!, {
    category: "COMPRESSION",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `squash yield mechanics; ${MECHANICS_NOT_AISC}`,
  }),
  row(US_COMPRESSION_METHOD_REGISTRY[1]!, {
    category: "COMPRESSION_STABILITY",
    methodType: "ELASTIC_BUCKLING_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "ELASTIC_BUCKLING_REFERENCE"],
    unsupportedScope: `Euler major-axis Pcr; Euler is not AISC member compression strength; ${MECHANICS_NOT_AISC}`,
    stabilityMethodDependency: "REQUIRED",
  }),
  row(US_COMPRESSION_METHOD_REGISTRY[2]!, {
    category: "COMPRESSION_STABILITY",
    methodType: "ELASTIC_BUCKLING_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "ELASTIC_BUCKLING_REFERENCE"],
    unsupportedScope: `Euler minor-axis Pcr; Euler is not AISC member compression strength; ${MECHANICS_NOT_AISC}`,
    stabilityMethodDependency: "REQUIRED",
  }),
  row(US_COMPRESSION_METHOD_REGISTRY[3]!, {
    category: "COMPRESSION",
    methodType: "NOMINAL_STRENGTH_METHOD",
    classifications: ["NOMINAL_STRENGTH_METHOD"],
    unsupportedScope: "AISC nominal compression strength; FRAMEWORK_ONLY",
    stabilityMethodDependency: "REQUIRED",
    classificationDependency: "REQUIRED",
    localBucklingDependency: "REQUIRED",
  }),
  row(US_COMPRESSION_METHOD_REGISTRY[4]!, {
    category: "COMPRESSION",
    methodType: "LRFD_DESIGN_STRENGTH_METHOD",
    classifications: ["LRFD_DESIGN_STRENGTH_METHOD"],
    unsupportedScope: "LRFD compression design strength; FRAMEWORK_ONLY",
  }),
  row(US_COMPRESSION_METHOD_REGISTRY[5]!, {
    category: "COMPRESSION",
    methodType: "ASD_ALLOWABLE_STRENGTH_METHOD",
    classifications: ["ASD_ALLOWABLE_STRENGTH_METHOD"],
    unsupportedScope: "ASD compression allowable strength; FRAMEWORK_ONLY",
  }),
  ...US_COMPRESSION_METHOD_REGISTRY.slice(6).map((rule) => row(rule, {
    category: "COMPRESSION",
    methodType: "NOMINAL_STRENGTH_METHOD",
    classifications: ["NOMINAL_STRENGTH_METHOD"],
    unsupportedScope: "AISC compression curve/classification/slenderness/torsional method; FRAMEWORK_ONLY",
    classificationDependency: "REQUIRED",
    localBucklingDependency: "REQUIRED",
  })),
  row(US_BENDING_METHOD_REGISTRY[0]!, {
    category: "BENDING_MAJOR",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `elastic My; not AISC flexural strength; ${MECHANICS_NOT_AISC}`,
  }),
  row(US_BENDING_METHOD_REGISTRY[1]!, {
    category: "BENDING_MINOR",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `elastic My; not AISC flexural strength; ${MECHANICS_NOT_AISC}`,
  }),
  row(US_BENDING_METHOD_REGISTRY[2]!, {
    category: "LTB",
    methodType: "ELASTIC_BUCKLING_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "ELASTIC_BUCKLING_REFERENCE"],
    unsupportedScope: `elastic Mcr; not AISC flexural strength; ${MECHANICS_NOT_AISC}`,
  }),
  row(US_BENDING_METHOD_REGISTRY[3]!, {
    category: "BENDING",
    methodType: "NOMINAL_STRENGTH_METHOD",
    classifications: ["NOMINAL_STRENGTH_METHOD"],
    unsupportedScope: "AISC nominal flexural strength; FRAMEWORK_ONLY",
    classificationDependency: "REQUIRED",
    localBucklingDependency: "REQUIRED",
  }),
  row(US_BENDING_METHOD_REGISTRY[4]!, {
    category: "BENDING_MAJOR",
    methodType: "LRFD_DESIGN_STRENGTH_METHOD",
    classifications: ["LRFD_DESIGN_STRENGTH_METHOD"],
    unsupportedScope: "LRFD major flexural strength; FRAMEWORK_ONLY",
  }),
  row(US_BENDING_METHOD_REGISTRY[5]!, {
    category: "BENDING_MAJOR",
    methodType: "ASD_ALLOWABLE_STRENGTH_METHOD",
    classifications: ["ASD_ALLOWABLE_STRENGTH_METHOD"],
    unsupportedScope: "ASD major flexural strength; FRAMEWORK_ONLY",
  }),
  row(US_BENDING_METHOD_REGISTRY[6]!, {
    category: "BENDING_MINOR",
    methodType: "LRFD_DESIGN_STRENGTH_METHOD",
    classifications: ["LRFD_DESIGN_STRENGTH_METHOD"],
    unsupportedScope: "LRFD minor flexural strength; FRAMEWORK_ONLY",
  }),
  row(US_BENDING_METHOD_REGISTRY[7]!, {
    category: "BENDING_MINOR",
    methodType: "ASD_ALLOWABLE_STRENGTH_METHOD",
    classifications: ["ASD_ALLOWABLE_STRENGTH_METHOD"],
    unsupportedScope: "ASD minor flexural strength; FRAMEWORK_ONLY",
  }),
  ...US_BENDING_METHOD_REGISTRY.slice(8).map((rule) => row(rule, {
    category: "BENDING",
    methodType: "NOMINAL_STRENGTH_METHOD",
    classifications: ["NOMINAL_STRENGTH_METHOD"],
    unsupportedScope: "AISC LTB/local-buckling/classification method; FRAMEWORK_ONLY",
    classificationDependency: "REQUIRED",
    localBucklingDependency: "REQUIRED",
  })),
  row(US_SHEAR_METHOD_REGISTRY[0]!, {
    category: "SHEAR_MAJOR",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `elastic shear yield; not AISC shear strength; ${MECHANICS_NOT_AISC}`,
  }),
  row(US_SHEAR_METHOD_REGISTRY[1]!, {
    category: "SHEAR_MINOR",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `elastic shear yield; not AISC shear strength; ${MECHANICS_NOT_AISC}`,
  }),
  row(US_SHEAR_METHOD_REGISTRY[2]!, {
    category: "WEB_STABILITY",
    methodType: "ELASTIC_BUCKLING_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "ELASTIC_BUCKLING_REFERENCE"],
    unsupportedScope: `elastic plate shear buckling; not AISC web strength; ${MECHANICS_NOT_AISC}`,
  }),
  row(US_SHEAR_METHOD_REGISTRY[3]!, {
    category: "SHEAR",
    methodType: "NOMINAL_STRENGTH_METHOD",
    classifications: ["NOMINAL_STRENGTH_METHOD"],
    unsupportedScope: "AISC nominal shear strength; FRAMEWORK_ONLY",
  }),
  row(US_SHEAR_METHOD_REGISTRY[4]!, {
    category: "SHEAR",
    methodType: "LRFD_DESIGN_STRENGTH_METHOD",
    classifications: ["LRFD_DESIGN_STRENGTH_METHOD"],
    unsupportedScope: "LRFD shear design strength; FRAMEWORK_ONLY",
  }),
  row(US_SHEAR_METHOD_REGISTRY[5]!, {
    category: "SHEAR",
    methodType: "ASD_ALLOWABLE_STRENGTH_METHOD",
    classifications: ["ASD_ALLOWABLE_STRENGTH_METHOD"],
    unsupportedScope: "ASD shear allowable strength; FRAMEWORK_ONLY",
  }),
  ...US_SHEAR_METHOD_REGISTRY.slice(6).map((rule) => row(rule, {
    category: "SHEAR",
    methodType: "NOMINAL_STRENGTH_METHOD",
    classifications: ["NOMINAL_STRENGTH_METHOD"],
    unsupportedScope: "AISC web-slenderness/web-stability/tension-field method; FRAMEWORK_ONLY",
    localBucklingDependency: "REQUIRED",
  })),
  ...US_INTERACTION_METHOD_REGISTRY.map((rule) => row(rule, {
    category: "COMBINED_ACTION",
    methodType: "INTERACTION_METHOD",
    classifications: ["INTERACTION_METHOD"],
    unsupportedScope: "numerical AISC interaction equations; FRAMEWORK_ONLY detection only",
    numericalValidationState: "NOT_APPLICABLE",
    stabilityMethodDependency: "REQUIRED",
    classificationDependency: "REQUIRED",
    localBucklingDependency: "REQUIRED",
  })),
  {
    methodId: "US_SERVICEABILITY_ORCHESTRATION",
    category: "SERVICEABILITY",
    methodType: "SERVICEABILITY_METHOD",
    technicalBasis: "governed-project-client-or-code-criterion-plus-d1c-deflection",
    authorityType: "VALIDATED_ENGINEERING_REFERENCE",
    aiscEditionRequirement: AISC_UNKNOWN_EDITION_TOKEN,
    designMethodApplicability: "NOT_APPLICABLE",
    unitSystemApplicability: "BOTH",
    loadBasisDependency: "REQUIRED",
    stabilityMethodDependency: "NOT_APPLICABLE",
    classificationDependency: "NOT_APPLICABLE",
    localBucklingDependency: "NOT_APPLICABLE",
    localAmendmentDependency: "OPTIONAL",
    requiredInputs: ["serviceabilityDemand", "governedCriterion"],
    supportedScope: "orchestration of explicit governed SLS criteria; D1C deflection reused",
    unsupportedScope: "universal AISC deflection limits, default L/n, vibration design",
    implementationVersion: US_MEMBER_IMPLEMENTATION_VERSION,
    benchmarkRefs: [],
    numericalValidationState: "NOT_APPLICABLE",
    engineeringValidationState: "VALIDATION_REQUIRED",
    standardConformanceState: "INTENDED_PROFILE",
    humanReviewRequirement: "required",
    classifications: ["SERVICEABILITY_METHOD"],
  },
  {
    methodId: "US_MEMBER_DESIGN_ORCHESTRATION",
    category: "MEMBER_ORCHESTRATION",
    methodType: "ORCHESTRATION_METHOD",
    technicalBasis: "fail-closed-completeness-and-state-propagation",
    authorityType: "VALIDATED_ENGINEERING_REFERENCE",
    aiscEditionRequirement: AISC_UNKNOWN_EDITION_TOKEN,
    designMethodApplicability: "BOTH",
    unitSystemApplicability: "BOTH",
    loadBasisDependency: "REQUIRED",
    stabilityMethodDependency: "REQUIRED",
    classificationDependency: "REQUIRED",
    localBucklingDependency: "REQUIRED",
    localAmendmentDependency: "OPTIONAL",
    requiredInputs: ["demand", "standardContext", "section", "material", "designMethod"],
    supportedScope: "assembles mechanics, AISC-profile gaps, LRFD/ASD, interaction, serviceability, building-code/contract, review, and approval states without collapsing them",
    unsupportedScope: "complete AISC member design, connections, foundations, global frame stability, seismic design",
    implementationVersion: US_MEMBER_IMPLEMENTATION_VERSION,
    benchmarkRefs: [],
    numericalValidationState: "NOT_APPLICABLE",
    engineeringValidationState: "VALIDATION_REQUIRED",
    standardConformanceState: "INTENDED_PROFILE",
    humanReviewRequirement: "required",
    classifications: ["ORCHESTRATION_METHOD"],
  },
];

export const US_NUMERICAL_METHOD_IDS = US_METHOD_VALIDATION_INVENTORY
  .filter((item) => item.numericalValidationState === "PASS")
  .map((item) => item.methodId);

const CODE_PROFILE_TYPES: readonly UsMethodClassification[] = [
  "NOMINAL_STRENGTH_METHOD",
  "LRFD_DESIGN_STRENGTH_METHOD",
  "ASD_ALLOWABLE_STRENGTH_METHOD",
];

export const US_CODE_PROFILE_METHODS = US_METHOD_VALIDATION_INVENTORY.filter((item) =>
  item.classifications.some((kind) => (CODE_PROFILE_TYPES as readonly string[]).includes(kind)),
);
export const US_CODE_PROFILE_METHOD_COUNT = US_CODE_PROFILE_METHODS.length;
export const US_CODE_PROFILE_IMPLEMENTED_COUNT = US_CODE_PROFILE_METHODS.filter((item) => item.numericalValidationState === "PASS").length;
export const US_CODE_PROFILE_VALIDATED_COUNT = US_CODE_PROFILE_METHODS.filter((item) => item.standardConformanceState === "CONFORMANCE_VALIDATED").length;

export function assertNoNumericalUsInteractionMethodsAfterUs8(): void {
  if (IMPLEMENTED_US_INTERACTION_METHODS.length !== 0) {
    throw new Error("numerical US interaction methods must remain NONE after US-8");
  }
  const numerical = US_METHOD_VALIDATION_INVENTORY.filter(
    (item) => item.classifications.includes("INTERACTION_METHOD") && item.numericalValidationState === "PASS",
  );
  if (numerical.length > 0) {
    throw new Error("numerical US interaction methods must remain NONE after US-8");
  }
}

export function assertMechanicsNotClassifiedAsAiscStrength(): void {
  const leaked = US_METHOD_VALIDATION_INVENTORY.filter((item) => {
    const mechanics = item.classifications.includes("ENGINEERING_MECHANICS_REFERENCE") || item.classifications.includes("ELASTIC_BUCKLING_REFERENCE");
    const aisc = item.classifications.some((kind) => (CODE_PROFILE_TYPES as readonly string[]).includes(kind));
    return mechanics && aisc;
  });
  if (leaked.length > 0) {
    throw new Error("mechanics references must not be classified as AISC design strengths");
  }
}
