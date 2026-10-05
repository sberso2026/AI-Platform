import type { SteelGovernedProperty } from "@rtb/types";
import { toForceN } from "../../structural-demand/units";
import { toAreaM2, toStressPa, forceWithinTolerance } from "../au-tension/units";
import { toElasticModulusPa } from "../au-compression/units";

export function vonMisesShearYieldN(fy: SteelGovernedProperty, shearArea: SteelGovernedProperty): number {
  if (fy.unit === "MPa" && shearArea.unit === "mm2" && typeof fy.value === "number" && typeof shearArea.value === "number") {
    if (!(fy.value > 0) || !(shearArea.value > 0)) throw new Error("steel design fail closed: missing material.yieldStrength");
    return (fy.value * shearArea.value) / Math.sqrt(3);
  }
  return toStressPa(fy, "material.yieldStrength") * toAreaM2(shearArea, "section.shearArea") / Math.sqrt(3);
}

export function toLengthM(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit?.trim()) throw new Error(`steel design fail closed: units incompatible for ${label}`);
  if (property.unit === "m") return property.value;
  if (property.unit === "mm") return property.value * 1e-3;
  throw new Error(`steel design fail closed: units incompatible for ${label}`);
}

export function poissonRatio(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (property.unit && property.unit !== "1" && property.unit !== "-") {
    throw new Error(`steel design fail closed: units incompatible for ${label}`);
  }
  if (!(property.value > 0) || !(property.value < 0.5)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  return property.value;
}

export function bucklingCoefficient(property: SteelGovernedProperty): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error("steel design fail closed: missing shear buckling coefficient");
  }
  return property.value;
}

/** Elastic critical shear stress for a plate: τcr = kv π² E / (12(1-ν²)(d/t)²). kv must be supplied; it is never defaulted. */
export function elasticShearBucklingForceN(input: {
  EPa: number;
  poisson: number;
  kv: number;
  webDepthM: number;
  webThicknessM: number;
  shearAreaM2: number;
}): number {
  const { EPa, poisson, kv, webDepthM, webThicknessM, shearAreaM2 } = input;
  if (!(EPa > 0) || !(kv > 0) || !(webDepthM > 0) || !(webThicknessM > 0) || !(shearAreaM2 > 0)) {
    throw new Error("steel design fail closed: missing elastic shear-buckling input");
  }
  const slenderness = webDepthM / webThicknessM;
  const tauCrPa = (kv * Math.PI * Math.PI * EPa) / (12 * (1 - poisson * poisson) * slenderness * slenderness);
  return tauCrPa * shearAreaM2;
}

export function demandShearN(shear: { value: number; unit: string; signed: number }): number {
  if (!Number.isFinite(shear.value) || !shear.unit?.trim()) {
    throw new Error("steel design fail closed: demand missing");
  }
  const magnitude = Math.abs(shear.signed !== 0 ? shear.signed : shear.value);
  try {
    return toForceN({ value: magnitude, unit: shear.unit });
  } catch {
    throw new Error("steel design fail closed: units incompatible");
  }
}

export { forceWithinTolerance, toAreaM2, toElasticModulusPa };
