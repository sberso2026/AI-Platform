import type { SteelGovernedProperty } from "@rtb/types";
import { toEPa } from "../../structural-demand/units";

/** Jurisdiction-neutral second-moment conversion. Not a design-code rule. */
export function toSecondMomentM4(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit?.trim()) throw new Error(`steel design fail closed: units incompatible for ${label}`);
  if (property.unit === "m4") return property.value;
  if (property.unit === "mm4") return property.value * 1e-12;
  throw new Error(`steel design fail closed: units incompatible for ${label}`);
}

/** Jurisdiction-neutral elastic modulus conversion. Not a design-code rule. */
export function toElasticModulusPa(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  try {
    return toEPa({ value: property.value, unit: property.unit ?? "" });
  } catch {
    throw new Error(`steel design fail closed: units incompatible for ${label}`);
  }
}

/**
 * Euler elastic buckling load Pcr = π²EI / Le².
 * Established engineering mechanics. Not EN 1993 member compression resistance.
 */
export function eulerLoadN(elasticModulusPa: number, secondMomentM4: number, effectiveLengthM: number): number {
  if (!(elasticModulusPa > 0) || !(secondMomentM4 > 0) || !(effectiveLengthM > 0)) {
    throw new Error("steel design fail closed: missing compression elastic-buckling input");
  }
  return (Math.PI * Math.PI * elasticModulusPa * secondMomentM4) / (effectiveLengthM * effectiveLengthM);
}
