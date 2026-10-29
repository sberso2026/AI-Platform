/**
 * Independent C1 golden expected values.
 * Hand-derived SI conversions only. Must not import production evaluators.
 */

export const EU_C1_GOLDEN_CONCRETE_CHAR_NORMAL = {
  input: { compressiveStrength: { value: 30, unit: "MPa" }, elasticModulus: { value: 30000, unit: "MPa" } },
  expected: { compressiveStrengthMPa: 30, elasticModulusMPa: 30000 },
} as const;

export const EU_C1_GOLDEN_CONCRETE_CHAR_SECOND = {
  input: { compressiveStrength: { value: 40, unit: "MPa" }, elasticModulus: { value: 35000, unit: "MPa" } },
  expected: { compressiveStrengthMPa: 40, elasticModulusMPa: 35000 },
} as const;

export const EU_C1_GOLDEN_CONCRETE_CHAR_BOUNDARY = {
  input: { compressiveStrength: { value: 1, unit: "MPa" }, elasticModulus: { value: 1, unit: "MPa" } },
  expected: { compressiveStrengthMPa: 1, elasticModulusMPa: 1 },
} as const;

export const EU_C1_GOLDEN_CONCRETE_CHAR_UNIT_CONVERTED = {
  input: { compressiveStrength: { value: 30e6, unit: "Pa" }, elasticModulus: { value: 30, unit: "GPa" } },
  expected: { compressiveStrengthMPa: 30, elasticModulusMPa: 30000 },
} as const;

export const EU_C1_GOLDEN_REO_CHAR_NORMAL = {
  input: { yieldStrength: { value: 500, unit: "MPa" }, elasticModulus: { value: 200000, unit: "MPa" }, area: { value: 314, unit: "mm2" } },
  expected: { yieldStrengthMPa: 500, elasticModulusMPa: 200000, areaMm2: 314 },
} as const;

export const EU_C1_GOLDEN_REO_CHAR_SECOND = {
  input: { yieldStrength: { value: 400, unit: "MPa" }, elasticModulus: { value: 210000, unit: "MPa" }, area: { value: 491, unit: "mm2" } },
  expected: { yieldStrengthMPa: 400, elasticModulusMPa: 210000, areaMm2: 491 },
} as const;

export const EU_C1_GOLDEN_REO_CHAR_UNIT_CONVERTED = {
  input: { yieldStrength: { value: 0.5, unit: "GPa" }, elasticModulus: { value: 200, unit: "GPa" }, area: { value: 3.14e-4, unit: "m2" } },
  expected: { yieldStrengthMPa: 500, elasticModulusMPa: 200000, areaMm2: 314 },
} as const;

export const EU_C1_GOLDEN_TENSION_NORMAL = {
  expected: { concreteTensionIncludedInUlsFlexure: false as const, kernelTensionTreatment: "NO_TENSION" as const },
} as const;
