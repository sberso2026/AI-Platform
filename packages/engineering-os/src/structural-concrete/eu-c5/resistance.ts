import {
  EU_C5_CIRCULAR_ARC_CONSTANT,
  EU_C5_K_DEPTH_NUMERATOR_MM,
  EU_C5_K_UPPER_BOUND,
  EU_C5_PERIMETER_OFFSET_FACTOR,
  EU_C5_RHO_STRESS_SCALE,
  EU_C5_RHO_UPPER_BOUND,
} from "./parameters";

export type EuC5StressTerms = {
  k: number;
  rho: number;
  vMainMPa: number;
  vMinMPa: number;
  vRdCMPa: number;
};

function positive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function sizeFactorK(effectiveDepthMm: number): number | null {
  if (!positive(effectiveDepthMm)) return null;
  const depthNumerator = EU_C5_K_DEPTH_NUMERATOR_MM.value;
  const upper = EU_C5_K_UPPER_BOUND.value;
  if (depthNumerator == null || upper == null) return null;
  return Math.min(upper, 1 + Math.sqrt(depthNumerator / effectiveDepthMm));
}

export function cappedRho(rho: number): number | null {
  const upper = EU_C5_RHO_UPPER_BOUND.value;
  if (upper == null || !Number.isFinite(rho) || rho < 0) return null;
  return Math.min(upper, rho);
}

export function concreteShearStressMPa(input: {
  effectiveDepthMm: number;
  rho: number;
  fckMPa: number;
  cRdC: number;
  vMinCoefficient: number;
}): EuC5StressTerms | null {
  if (!positive(input.fckMPa) || !positive(input.cRdC) || !positive(input.vMinCoefficient)) return null;
  const k = sizeFactorK(input.effectiveDepthMm);
  const rho = cappedRho(input.rho);
  const scale = EU_C5_RHO_STRESS_SCALE.value;
  if (k == null || rho == null || scale == null) return null;
  const vMainMPa = input.cRdC * k * Math.cbrt(scale * rho * input.fckMPa);
  const vMinMPa = input.vMinCoefficient * k ** 1.5 * Math.sqrt(input.fckMPa);
  if (!Number.isFinite(vMainMPa) || !Number.isFinite(vMinMPa)) return null;
  return { k, rho, vMainMPa, vMinMPa, vRdCMPa: Math.max(vMainMPa, vMinMPa) };
}

export function shearResistanceN(input: {
  effectiveDepthMm: number;
  webWidthMm: number;
  longitudinalTensionAreaMm2: number;
  fckMPa: number;
  cRdC: number;
  vMinCoefficient: number;
}): (EuC5StressTerms & { resistanceN: number }) | null {
  if (!positive(input.webWidthMm) || !Number.isFinite(input.longitudinalTensionAreaMm2) || input.longitudinalTensionAreaMm2 < 0) {
    return null;
  }
  const rho = input.longitudinalTensionAreaMm2 / (input.webWidthMm * input.effectiveDepthMm);
  const stress = concreteShearStressMPa({ ...input, rho });
  if (!stress || !(stress.vRdCMPa > 0)) return null;
  const resistanceN = stress.vRdCMPa * input.webWidthMm * input.effectiveDepthMm;
  if (!Number.isFinite(resistanceN) || !(resistanceN > 0)) return null;
  return { ...stress, resistanceN };
}

export function interiorRectangularControlPerimeterMm(input: {
  loadedWidthMm: number;
  loadedDepthMm: number;
  effectiveDepthMm: number;
}): number | null {
  if (!positive(input.loadedWidthMm) || !positive(input.loadedDepthMm) || !positive(input.effectiveDepthMm)) return null;
  const offset = EU_C5_PERIMETER_OFFSET_FACTOR.value;
  const pi = EU_C5_CIRCULAR_ARC_CONSTANT.value;
  if (offset == null || pi == null) return null;
  return 2 * (input.loadedWidthMm + input.loadedDepthMm) + 2 * pi * offset * input.effectiveDepthMm;
}
