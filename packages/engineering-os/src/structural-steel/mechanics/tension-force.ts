import { ENGINEERING_NUMERICAL_TOLERANCE } from "@rtb/types";
import type { SteelGovernedProperty } from "@rtb/types";
import { toEPa } from "../../structural-demand/units";

/** Jurisdiction-neutral area conversion. Not a design-code rule. */
export function toAreaM2(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit?.trim()) throw new Error(`steel design fail closed: units incompatible for ${label}`);
  if (property.unit === "m2") return property.value;
  if (property.unit === "mm2") return property.value * 1e-6;
  throw new Error(`steel design fail closed: units incompatible for ${label}`);
}

/** Jurisdiction-neutral stress conversion. Not a design-code rule. */
export function toStressPa(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit?.trim()) throw new Error(`steel design fail closed: units incompatible for ${label}`);
  try {
    return toEPa({ value: property.value, unit: property.unit });
  } catch {
    throw new Error(`steel design fail closed: units incompatible for ${label}`);
  }
}

/**
 * Nominal axial force = stress × area.
 * Established engineering mechanics. Not AS 4100 φNt and not EN 1993 Nt,Rd.
 */
export function nominalTensionForceN(
  stress: SteelGovernedProperty,
  area: SteelGovernedProperty,
  stressLabel: string,
  areaLabel: string,
): number {
  if (stress.unit === "MPa" && area.unit === "mm2" && typeof stress.value === "number" && typeof area.value === "number") {
    if (!(stress.value > 0) || !(area.value > 0)) throw new Error(`steel design fail closed: missing ${stressLabel}`);
    return stress.value * area.value;
  }
  return toStressPa(stress, stressLabel) * toAreaM2(area, areaLabel);
}

export function forceWithinTolerance(actualN: number, expectedN: number): boolean {
  const denom = Math.max(Math.abs(expectedN), Math.abs(actualN), 1);
  return Math.abs(actualN - expectedN) <= Math.max(ENGINEERING_NUMERICAL_TOLERANCE.forceN, ENGINEERING_NUMERICAL_TOLERANCE.relative * denom);
}
