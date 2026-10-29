import type { SteelGovernedProperty } from "@rtb/types";
import { toMomentNm } from "../../structural-demand/units";
import { toStressPa } from "./tension-force";

/** Jurisdiction-neutral elastic section-modulus conversion. Not a design-code rule. */
export function toSectionModulusM3(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit?.trim()) throw new Error(`steel design fail closed: units incompatible for ${label}`);
  if (property.unit === "m3") return property.value;
  if (property.unit === "mm3") return property.value * 1e-9;
  throw new Error(`steel design fail closed: units incompatible for ${label}`);
}

/**
 * Elastic first-yield moment My = fy × Z.
 * Established engineering mechanics. Not AS 4100, EN 1993 Mc,Rd, or AISC Mn.
 */
export function firstYieldMomentNm(fy: SteelGovernedProperty, sectionModulus: SteelGovernedProperty, fyLabel: string, zLabel: string): number {
  if (fy.unit === "MPa" && sectionModulus.unit === "mm3" && typeof fy.value === "number" && typeof sectionModulus.value === "number") {
    if (!(fy.value > 0) || !(sectionModulus.value > 0)) throw new Error(`steel design fail closed: missing ${fyLabel}`);
    return (fy.value * sectionModulus.value) / 1000;
  }
  return toStressPa(fy, fyLabel) * toSectionModulusM3(sectionModulus, zLabel);
}

export function demandMomentNm(moment: { value: number; unit: string; signed: number }): number {
  if (!Number.isFinite(moment.value) || !moment.unit?.trim()) {
    throw new Error("steel design fail closed: demand missing");
  }
  const magnitude = Math.abs(moment.signed !== 0 ? moment.signed : moment.value);
  try {
    return toMomentNm({ value: magnitude, unit: moment.unit });
  } catch {
    throw new Error("steel design fail closed: units incompatible");
  }
}

export function bendingAxisFromLimitState(limitState: string): "MAJOR_AXIS" | "MINOR_AXIS" {
  if (limitState === "BENDING_MAJOR") return "MAJOR_AXIS";
  if (limitState === "BENDING_MINOR") return "MINOR_AXIS";
  throw new Error("steel design fail closed: missing axis");
}
