import type { AuMethodValidationRecord, SteelEngineeringRule } from "@rtb/types";
import { AU_BENDING_METHOD_REGISTRY } from "../au-bending/registry";
import { AU_COMPRESSION_METHOD_REGISTRY } from "../au-compression/registry";
import { AU_INTERACTION_METHOD_REGISTRY, IMPLEMENTED_INTERACTION_METHODS } from "../au-combined/registry";
import { AU_SHEAR_METHOD_REGISTRY } from "../au-shear/registry";
import { AU_TENSION_METHOD_REGISTRY } from "../au-tension/registry";

function mechanics(rule: SteelEngineeringRule, extra: Partial<AuMethodValidationRecord>): AuMethodValidationRecord {
  return {
    methodId: rule.methodId,
    category: extra.category ?? "STRENGTH_MECHANICS",
    purpose: rule.calculationPurpose,
    technicalBasis: rule.technicalBasisRef,
    authorityType: rule.authorityType,
    implementationVersion: rule.implementationVersion,
    inputs: [...rule.requiredInputs],
    outputs: rule.outputType,
    benchmarkRefs: [...rule.benchmarkRefs],
    numericalValidationState: extra.numericalValidationState ?? "PASS",
    engineeringValidationState: "VALIDATION_REQUIRED",
    standardProfile: "AS4100",
    standardConformanceState: "INTENDED_PROFILE",
    classifications: extra.classifications ?? ["ENGINEERING_MECHANICS_REFERENCE"],
    supportedScope: extra.supportedScope ?? rule.applicability,
    unsupportedScope: extra.unsupportedScope ?? "AS 4100 design capacity, φ, section classification, and code member rules",
    humanReviewRequirement: "required",
  };
}

export const AU_METHOD_VALIDATION_INVENTORY: readonly AuMethodValidationRecord[] = [
  mechanics(AU_TENSION_METHOD_REGISTRY[0]!, {
    category: "TENSION",
    unsupportedScope: "AS 4100 φNt, k_t, connection tear-out, and code tension capacity",
  }),
  mechanics(AU_TENSION_METHOD_REGISTRY[1]!, {
    category: "TENSION",
    unsupportedScope: "AS 4100 φNt, k_t, inferred net area, and code tension capacity",
  }),
  mechanics(AU_COMPRESSION_METHOD_REGISTRY[0]!, {
    category: "COMPRESSION",
    unsupportedScope: "AS 4100 member compression capacity, α_c, form factor, and section classification",
  }),
  mechanics(AU_COMPRESSION_METHOD_REGISTRY[1]!, {
    category: "COMPRESSION_STABILITY",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "STABILITY_REFERENCE"],
    unsupportedScope: "AS 4100 compression member design; Euler is not code compression capacity",
  }),
  mechanics(AU_COMPRESSION_METHOD_REGISTRY[2]!, {
    category: "COMPRESSION_STABILITY",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "STABILITY_REFERENCE"],
    unsupportedScope: "AS 4100 compression member design; Euler is not code compression capacity",
  }),
  mechanics(AU_BENDING_METHOD_REGISTRY[0]!, {
    category: "BENDING_MAJOR",
    unsupportedScope: "AS 4100 member moment capacity, plastic modulus rules, and φ",
  }),
  mechanics(AU_BENDING_METHOD_REGISTRY[1]!, {
    category: "BENDING_MINOR",
    unsupportedScope: "AS 4100 member moment capacity, plastic modulus rules, and φ",
  }),
  mechanics(AU_BENDING_METHOD_REGISTRY[2]!, {
    category: "LTB",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "STABILITY_REFERENCE"],
    unsupportedScope: "AS 4100 member moment capacity, α_m, α_s, and code LTB; elastic Mcr is not code member capacity",
  }),
  mechanics(AU_SHEAR_METHOD_REGISTRY[0]!, {
    category: "SHEAR",
    unsupportedScope: "AS 4100 Vv, 0.6 fy web rules, and φ",
  }),
  mechanics(AU_SHEAR_METHOD_REGISTRY[1]!, {
    category: "SHEAR_BUCKLING",
    classifications: ["ENGINEERING_MECHANICS_REFERENCE", "STABILITY_REFERENCE"],
    unsupportedScope: "AS 4100 shear buckling design, default kv, tension field, and φ",
  }),
  ...AU_INTERACTION_METHOD_REGISTRY.map((rule) => mechanics(rule, {
    category: "COMBINED_ACTION",
    classifications: ["INTERACTION_METHOD"],
    numericalValidationState: "NOT_APPLICABLE",
    supportedScope: "framework detection and CHECK_UNDETERMINED only",
    unsupportedScope: "numerical AS 4100 interaction equations, exponents, and coefficients",
  })),
];

export const AU_NUMERICAL_METHOD_IDS = AU_METHOD_VALIDATION_INVENTORY
  .filter((row) => row.numericalValidationState === "PASS")
  .map((row) => row.methodId);

export function assertNoNumericalInteractionMethods(): void {
  if (IMPLEMENTED_INTERACTION_METHODS.length !== 0) {
    throw new Error("numerical interaction methods must remain NONE until independently validated");
  }
  const numericalInteraction = AU_METHOD_VALIDATION_INVENTORY.filter(
    (row) => row.classifications.includes("INTERACTION_METHOD") && row.numericalValidationState === "PASS",
  );
  if (numericalInteraction.length > 0) {
    throw new Error("numerical interaction methods must remain NONE until independently validated");
  }
}
