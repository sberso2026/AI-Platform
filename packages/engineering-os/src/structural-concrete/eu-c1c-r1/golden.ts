/**
 * Independent C1C-R1 golden expected values.
 * Hand-derived identities only. Must not import production evaluators.
 *
 * Concrete design identity: fcd = αcc × fck / γc
 * Reinforcement design identity: fyd = fyk / γs
 */

const HAND_FCK_MPA = 30;
const HAND_ALPHA_CC = 0.85;
const HAND_GAMMA_C = 1.5;
const HAND_FCD_MPA = (HAND_ALPHA_CC * HAND_FCK_MPA) / HAND_GAMMA_C;

const HAND_FCK_SECOND_MPA = 40;
const HAND_ALPHA_CC_SECOND = 1;
const HAND_FCD_SECOND_MPA = (HAND_ALPHA_CC_SECOND * HAND_FCK_SECOND_MPA) / HAND_GAMMA_C;

const HAND_FYK_MPA = 500;
const HAND_GAMMA_S = 1.15;
const HAND_FYD_MPA = HAND_FYK_MPA / HAND_GAMMA_S;

const HAND_FYK_SECOND_MPA = 400;
const HAND_GAMMA_S_SECOND = 1.2;
const HAND_FYD_SECOND_MPA = HAND_FYK_SECOND_MPA / HAND_GAMMA_S_SECOND;

export const EU_C1C_R1_GOLDEN_GAMMA_C_NORMAL = {
  input: { value: HAND_GAMMA_C, unit: "dimensionless" as const },
  expected: { gammaC: HAND_GAMMA_C },
} as const;

export const EU_C1C_R1_GOLDEN_GAMMA_C_SECOND = {
  input: { value: 1.45, unit: "dimensionless" as const },
  expected: { gammaC: 1.45 },
} as const;

export const EU_C1C_R1_GOLDEN_GAMMA_S_NORMAL = {
  input: { value: HAND_GAMMA_S, unit: "dimensionless" as const },
  expected: { gammaS: HAND_GAMMA_S },
} as const;

export const EU_C1C_R1_GOLDEN_GAMMA_S_SECOND = {
  input: { value: HAND_GAMMA_S_SECOND, unit: "dimensionless" as const },
  expected: { gammaS: HAND_GAMMA_S_SECOND },
} as const;

export const EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_NORMAL = {
  input: { fck: { value: HAND_FCK_MPA, unit: "MPa" as const }, alphaCc: HAND_ALPHA_CC, gammaC: HAND_GAMMA_C },
  expected: { fckMPa: HAND_FCK_MPA, alphaCc: HAND_ALPHA_CC, gammaC: HAND_GAMMA_C, fcdMPa: HAND_FCD_MPA },
} as const;

export const EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_SECOND = {
  input: { fck: { value: HAND_FCK_SECOND_MPA, unit: "MPa" as const }, alphaCc: HAND_ALPHA_CC_SECOND, gammaC: HAND_GAMMA_C },
  expected: { fckMPa: HAND_FCK_SECOND_MPA, alphaCc: HAND_ALPHA_CC_SECOND, gammaC: HAND_GAMMA_C, fcdMPa: HAND_FCD_SECOND_MPA },
} as const;

export const EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_BOUNDARY = {
  input: { fck: { value: 1, unit: "MPa" as const }, alphaCc: HAND_ALPHA_CC_SECOND, gammaC: HAND_GAMMA_C },
  expected: { fckMPa: 1, alphaCc: HAND_ALPHA_CC_SECOND, gammaC: HAND_GAMMA_C, fcdMPa: HAND_ALPHA_CC_SECOND / HAND_GAMMA_C },
} as const;

export const EU_C1C_R1_GOLDEN_CONCRETE_DESIGN_UNIT_CONVERTED = {
  input: { fck: { value: 30e6, unit: "Pa" as const }, alphaCc: HAND_ALPHA_CC, gammaC: HAND_GAMMA_C },
  expected: { fckMPa: HAND_FCK_MPA, alphaCc: HAND_ALPHA_CC, gammaC: HAND_GAMMA_C, fcdMPa: HAND_FCD_MPA },
} as const;

export const EU_C1C_R1_GOLDEN_REO_DESIGN_NORMAL = {
  input: { fyk: { value: HAND_FYK_MPA, unit: "MPa" as const }, gammaS: HAND_GAMMA_S },
  expected: { fykMPa: HAND_FYK_MPA, gammaS: HAND_GAMMA_S, fydMPa: HAND_FYD_MPA },
} as const;

export const EU_C1C_R1_GOLDEN_REO_DESIGN_SECOND = {
  input: { fyk: { value: HAND_FYK_SECOND_MPA, unit: "MPa" as const }, gammaS: HAND_GAMMA_S_SECOND },
  expected: { fykMPa: HAND_FYK_SECOND_MPA, gammaS: HAND_GAMMA_S_SECOND, fydMPa: HAND_FYD_SECOND_MPA },
} as const;

export const EU_C1C_R1_GOLDEN_REO_DESIGN_UNIT_CONVERTED = {
  input: { fyk: { value: 0.5, unit: "GPa" as const }, gammaS: HAND_GAMMA_S },
  expected: { fykMPa: HAND_FYK_MPA, gammaS: HAND_GAMMA_S, fydMPa: HAND_FYD_MPA },
} as const;
