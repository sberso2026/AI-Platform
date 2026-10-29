import type { EuMethodClassification, EuMethodValidationRecord, SteelEngineeringRule } from "@rtb/types";
import { EUROCODE_UNKNOWN_EDITION_TOKEN } from "@rtb/types";
import { EU_BENDING_METHOD_REGISTRY } from "../eu-bending/registry";
import { EU_INTERACTION_METHOD_REGISTRY, IMPLEMENTED_EU_INTERACTION_METHODS } from "../eu-combined/registry";
import { EU_COMPRESSION_METHOD_REGISTRY } from "../eu-compression/registry";
import { EU_MEMBER_IMPLEMENTATION_VERSION } from "../eu-member/registry";
import { EU_SHEAR_METHOD_REGISTRY } from "../eu-shear/registry";
import { EU_TENSION_METHOD_REGISTRY } from "../eu-tension/registry";

type EuRegistryRule = SteelEngineeringRule & {
  methodType: string;
  standardPartRef: string;
  ndpDependencies: readonly string[];
  ruleRequiresNdp: boolean;
  annexDependency?: string;
};

function annexDependency(rule: EuRegistryRule): EuMethodValidationRecord["nationalAnnexDependency"] {
  if (rule.annexDependency === "NDP_REQUIRED" || rule.ruleRequiresNdp) return "NDP_REQUIRED";
  if (rule.annexDependency === "ANNEX_REQUIRED") return "REQUIRED";
  if (rule.annexDependency === "ANNEX_OPTIONAL") return "OPTIONAL";
  return "NOT_REQUIRED";
}

function row(
  rule: EuRegistryRule,
  extra: {
    category: string;
    methodType: EuMethodClassification;
    classifications: EuMethodClassification[];
    unsupportedScope: string;
    numericalValidationState?: EuMethodValidationRecord["numericalValidationState"];
  },
): EuMethodValidationRecord {
  const mechanics = extra.classifications.includes("ENGINEERING_MECHANICS_REFERENCE") || extra.classifications.includes("STABILITY_REFERENCE");
  return {
    methodId: rule.methodId,
    category: extra.category,
    methodType: extra.methodType,
    technicalBasis: rule.technicalBasisRef,
    authorityType: rule.authorityType,
    standardFamily: "EUROCODE",
    standardPart: rule.standardPartRef,
    editionRequirement: EUROCODE_UNKNOWN_EDITION_TOKEN,
    nationalAnnexDependency: annexDependency(rule),
    ndpDependency: rule.ruleRequiresNdp,
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

const MECHANICS_NOT_CODE = "not EN 1993 design resistance, partial factors, classification, or National Annex/NDP capacity";

export const EU_METHOD_VALIDATION_INVENTORY: readonly EuMethodValidationRecord[] = [
  row(EU_TENSION_METHOD_REGISTRY[0]!, {
    category: "TENSION",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `gross-yield mechanics; ${MECHANICS_NOT_CODE}`,
  }),
  row(EU_TENSION_METHOD_REGISTRY[1]!, {
    category: "TENSION",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `net-fracture mechanics; ${MECHANICS_NOT_CODE}`,
  }),
  row(EU_TENSION_METHOD_REGISTRY[2]!, {
    category: "TENSION",
    methodType: "CODE_PROFILE_METHOD",
    classifications: ["CODE_PROFILE_METHOD"],
    unsupportedScope: "Eurocode-profile tension resistance; FRAMEWORK_ONLY",
  }),
  row(EU_TENSION_METHOD_REGISTRY[3]!, {
    category: "TENSION",
    methodType: "CODE_PROFILE_METHOD",
    classifications: ["CODE_PROFILE_METHOD"],
    unsupportedScope: "Eurocode-profile net-section resistance; FRAMEWORK_ONLY",
  }),
  row(EU_COMPRESSION_METHOD_REGISTRY[0]!, {
    category: "COMPRESSION",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `squash yield mechanics; ${MECHANICS_NOT_CODE}`,
  }),
  row(EU_COMPRESSION_METHOD_REGISTRY[1]!, {
    category: "COMPRESSION_STABILITY",
    methodType: "STABILITY_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "STABILITY_REFERENCE"],
    unsupportedScope: `Euler major-axis Pcr; Euler is not EN 1993 member compression resistance; ${MECHANICS_NOT_CODE}`,
  }),
  row(EU_COMPRESSION_METHOD_REGISTRY[2]!, {
    category: "COMPRESSION_STABILITY",
    methodType: "STABILITY_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "STABILITY_REFERENCE"],
    unsupportedScope: `Euler minor-axis Pcr; Euler is not EN 1993 member compression resistance; ${MECHANICS_NOT_CODE}`,
  }),
  ...EU_COMPRESSION_METHOD_REGISTRY.slice(3).map((rule) => row(rule, {
    category: "COMPRESSION",
    methodType: "CODE_PROFILE_METHOD",
    classifications: ["CODE_PROFILE_METHOD"],
    unsupportedScope: "Eurocode-profile compression/buckling/classification method; FRAMEWORK_ONLY",
  })),
  row(EU_BENDING_METHOD_REGISTRY[0]!, {
    category: "BENDING_MAJOR",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `elastic My; not EN 1993 section resistance; ${MECHANICS_NOT_CODE}`,
  }),
  row(EU_BENDING_METHOD_REGISTRY[1]!, {
    category: "BENDING_MINOR",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `elastic My; not EN 1993 section resistance; ${MECHANICS_NOT_CODE}`,
  }),
  row(EU_BENDING_METHOD_REGISTRY[2]!, {
    category: "LTB",
    methodType: "STABILITY_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "STABILITY_REFERENCE"],
    unsupportedScope: `elastic Mcr; not EN 1993 member resistance; ${MECHANICS_NOT_CODE}`,
  }),
  ...EU_BENDING_METHOD_REGISTRY.slice(3).map((rule) => row(rule, {
    category: "BENDING",
    methodType: "CODE_PROFILE_METHOD",
    classifications: ["CODE_PROFILE_METHOD"],
    unsupportedScope: "Eurocode-profile bending/LTB/classification method; FRAMEWORK_ONLY",
  })),
  row(EU_SHEAR_METHOD_REGISTRY[0]!, {
    category: "SHEAR_MAJOR",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `elastic shear yield; not EN 1993 shear resistance; ${MECHANICS_NOT_CODE}`,
  }),
  row(EU_SHEAR_METHOD_REGISTRY[1]!, {
    category: "SHEAR_MINOR",
    methodType: "ENGINEERING_MECHANICS_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE"],
    unsupportedScope: `elastic shear yield; not EN 1993 shear resistance; ${MECHANICS_NOT_CODE}`,
  }),
  row(EU_SHEAR_METHOD_REGISTRY[2]!, {
    category: "WEB_STABILITY",
    methodType: "STABILITY_REFERENCE",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "STABILITY_REFERENCE"],
    unsupportedScope: `elastic plate shear buckling; not EN 1993 web resistance; ${MECHANICS_NOT_CODE}`,
  }),
  ...EU_SHEAR_METHOD_REGISTRY.slice(3).map((rule) => row(rule, {
    category: "SHEAR",
    methodType: "CODE_PROFILE_METHOD",
    classifications: ["CODE_PROFILE_METHOD"],
    unsupportedScope: "Eurocode-profile shear/web method; FRAMEWORK_ONLY",
  })),
  ...EU_INTERACTION_METHOD_REGISTRY.map((rule) => row(rule, {
    category: "COMBINED_ACTION",
    methodType: "INTERACTION_METHOD",
    classifications: ["INTERACTION_METHOD"],
    unsupportedScope: "numerical EN 1993 interaction equations; FRAMEWORK_ONLY detection only",
    numericalValidationState: "NOT_APPLICABLE",
  })),
  {
    methodId: "EU_SERVICEABILITY_ORCHESTRATION",
    category: "SERVICEABILITY",
    methodType: "SERVICEABILITY_METHOD",
    technicalBasis: "governed-project-or-annex-criterion-plus-d1c-deflection",
    authorityType: "VALIDATED_ENGINEERING_REFERENCE",
    standardFamily: "EUROCODE",
    standardPart: "EN_1990",
    editionRequirement: EUROCODE_UNKNOWN_EDITION_TOKEN,
    nationalAnnexDependency: "OPTIONAL",
    ndpDependency: false,
    requiredInputs: ["serviceabilityDemand", "governedCriterion"],
    supportedScope: "orchestration of explicit governed SLS criteria; D1C deflection reused",
    unsupportedScope: "universal Eurocode deflection limits, default L/n, vibration design",
    implementationVersion: EU_MEMBER_IMPLEMENTATION_VERSION,
    benchmarkRefs: [],
    numericalValidationState: "NOT_APPLICABLE",
    engineeringValidationState: "VALIDATION_REQUIRED",
    standardConformanceState: "INTENDED_PROFILE",
    humanReviewRequirement: "required",
    classifications: ["SERVICEABILITY_METHOD"],
  },
  {
    methodId: "EU_MEMBER_DESIGN_ORCHESTRATION",
    category: "MEMBER_ORCHESTRATION",
    methodType: "ORCHESTRATION_METHOD",
    technicalBasis: "fail-closed-completeness-and-state-propagation",
    authorityType: "VALIDATED_ENGINEERING_REFERENCE",
    standardFamily: "EUROCODE",
    standardPart: "EN_1993_1_1",
    editionRequirement: EUROCODE_UNKNOWN_EDITION_TOKEN,
    nationalAnnexDependency: "OPTIONAL",
    ndpDependency: false,
    requiredInputs: ["demand", "standardContext", "section", "material"],
    supportedScope: "assembles mechanics, code-profile gaps, interaction, serviceability, review, and approval states without collapsing them",
    unsupportedScope: "complete EN 1993 member design, connections, foundations, global frame stability",
    implementationVersion: EU_MEMBER_IMPLEMENTATION_VERSION,
    benchmarkRefs: [],
    numericalValidationState: "NOT_APPLICABLE",
    engineeringValidationState: "VALIDATION_REQUIRED",
    standardConformanceState: "INTENDED_PROFILE",
    humanReviewRequirement: "required",
    classifications: ["ORCHESTRATION_METHOD"],
  },
];

export const EU_NUMERICAL_METHOD_IDS = EU_METHOD_VALIDATION_INVENTORY
  .filter((item) => item.numericalValidationState === "PASS")
  .map((item) => item.methodId);

export const EU_CODE_PROFILE_METHODS = EU_METHOD_VALIDATION_INVENTORY.filter((item) => item.classifications.includes("CODE_PROFILE_METHOD"));
export const EU_CODE_PROFILE_METHOD_COUNT = EU_CODE_PROFILE_METHODS.length;
export const EU_CODE_PROFILE_IMPLEMENTED_COUNT = EU_CODE_PROFILE_METHODS.filter((item) => item.numericalValidationState === "PASS").length;
export const EU_CODE_PROFILE_VALIDATED_COUNT = EU_CODE_PROFILE_METHODS.filter((item) => item.standardConformanceState === "CONFORMANCE_VALIDATED").length;

export function assertNoNumericalEuInteractionMethodsAfterEu8(): void {
  if (IMPLEMENTED_EU_INTERACTION_METHODS.length !== 0) {
    throw new Error("numerical EU interaction methods must remain NONE after EU-8");
  }
  const numerical = EU_METHOD_VALIDATION_INVENTORY.filter(
    (item) => item.classifications.includes("INTERACTION_METHOD") && item.numericalValidationState === "PASS",
  );
  if (numerical.length > 0) {
    throw new Error("numerical EU interaction methods must remain NONE after EU-8");
  }
}

export function assertMechanicsNotClassifiedAsCodeCapacity(): void {
  const leaked = EU_METHOD_VALIDATION_INVENTORY.filter(
    (item) => item.classifications.includes("ENGINEERING_MECHANICS_REFERENCE") && item.classifications.includes("CODE_PROFILE_METHOD"),
  );
  if (leaked.length > 0) {
    throw new Error("mechanics references must not be classified as EN 1993 code capacities");
  }
}
