/**
 * Independent constitutive golden expected values.
 * Hand-derived parabola-rectangle and horizontal-bilinear identities.
 * Must not import production evaluators.
 *
 * Concrete (EC2 compression-positive): σc = fcd [1 − (1 − εc/εc2)^n] for 0 ≤ εc ≤ εc2;
 * σc = fcd for εc2 ≤ εc ≤ εcu2. D1E-1 kernel stress = −σc.
 * Reinforcement: σ = Es ε until |σ| = fyd, then horizontal branch.
 */

const HAND_FCD_MPA = 20;
const HAND_EPS_C2 = 0.002;
const HAND_EPS_CU2 = 0.0035;
const HAND_N = 2;
const HAND_ES_MPA = 200000;
const HAND_FYD_MPA = 500 / 1.15;

function parabolaEc2(epsC: number): number {
  const xi = epsC / HAND_EPS_C2;
  return HAND_FCD_MPA * (1 - (1 - xi) ** HAND_N);
}

function kernelFromEc2(epsC: number): number {
  return -parabolaEc2(epsC);
}

export const EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_ZERO = {
  input: { kernelStrain: 0, fcdMPa: HAND_FCD_MPA },
  expected: { kernelStressMPa: 0 },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_INITIAL = {
  input: { kernelStrain: -0.0005, fcdMPa: HAND_FCD_MPA },
  expected: { kernelStressMPa: kernelFromEc2(0.0005) },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_INTERMEDIATE = {
  input: { kernelStrain: -0.001, fcdMPa: HAND_FCD_MPA },
  expected: { kernelStressMPa: kernelFromEc2(0.001) },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_TRANSITION = {
  input: { kernelStrain: -HAND_EPS_C2, fcdMPa: HAND_FCD_MPA },
  expected: { kernelStressMPa: -HAND_FCD_MPA },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_PLATEAU = {
  input: { kernelStrain: -0.003, fcdMPa: HAND_FCD_MPA },
  expected: { kernelStressMPa: -HAND_FCD_MPA },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_CONCRETE_ULTIMATE = {
  input: { kernelStrain: -HAND_EPS_CU2, fcdMPa: HAND_FCD_MPA },
  expected: { kernelStressMPa: -HAND_FCD_MPA },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_STRAIN_STATES = {
  expected: { epsC2: HAND_EPS_C2, epsCu2: HAND_EPS_CU2, n: HAND_N, fckLimitMPa: 50 },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_REO_ZERO = {
  input: { kernelStrain: 0, esMPa: HAND_ES_MPA, fydMPa: HAND_FYD_MPA },
  expected: { kernelStressMPa: 0 },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_REO_ELASTIC = {
  input: { kernelStrain: 0.001, esMPa: HAND_ES_MPA, fydMPa: HAND_FYD_MPA },
  expected: { kernelStressMPa: HAND_ES_MPA * 0.001 },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_REO_YIELD = {
  input: { kernelStrain: HAND_FYD_MPA / HAND_ES_MPA, esMPa: HAND_ES_MPA, fydMPa: HAND_FYD_MPA },
  expected: { kernelStressMPa: HAND_FYD_MPA },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_REO_POST_YIELD = {
  input: { kernelStrain: 0.01, esMPa: HAND_ES_MPA, fydMPa: HAND_FYD_MPA },
  expected: { kernelStressMPa: HAND_FYD_MPA },
} as const;

export const EU_C1C_CONSTITUTIVE_GOLDEN_REO_COMPRESSION = {
  input: { kernelStrain: -0.001, esMPa: HAND_ES_MPA, fydMPa: HAND_FYD_MPA },
  expected: { kernelStressMPa: -HAND_ES_MPA * 0.001 },
} as const;
