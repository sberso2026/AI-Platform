import type { SteelGovernedProperty } from "@rtb/types";
import { toMomentNm } from "../../structural-demand/units";
import { toElasticModulusPa, toSecondMomentM4 } from "../au-compression/units";
import { forceWithinTolerance, toStressPa } from "../au-tension/units";

export function toSectionModulusM3(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit?.trim()) throw new Error(`steel design fail closed: units incompatible for ${label}`);
  if (property.unit === "m3") return property.value;
  if (property.unit === "mm3") return property.value * 1e-9;
  throw new Error(`steel design fail closed: units incompatible for ${label}`);
}

export function toWarpingM6(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit?.trim()) throw new Error(`steel design fail closed: units incompatible for ${label}`);
  if (property.unit === "m6") return property.value;
  if (property.unit === "mm6") return property.value * 1e-18;
  throw new Error(`steel design fail closed: units incompatible for ${label}`);
}

export function firstYieldMomentNm(fy: SteelGovernedProperty, sectionModulus: SteelGovernedProperty, fyLabel: string, zLabel: string): number {
  if (fy.unit === "MPa" && sectionModulus.unit === "mm3" && typeof fy.value === "number" && typeof sectionModulus.value === "number") {
    if (!(fy.value > 0) || !(sectionModulus.value > 0)) throw new Error(`steel design fail closed: missing ${fyLabel}`);
    return (fy.value * sectionModulus.value) / 1000;
  }
  return toStressPa(fy, fyLabel) * toSectionModulusM3(sectionModulus, zLabel);
}

/** Uniform-moment elastic critical LTB moment for a doubly-symmetric prismatic member; no moment-modification factor. */
export function elasticLtbMomentNm(input: {
  EPa: number;
  GPa: number;
  IminorM4: number;
  JM4: number;
  IwM6: number;
  unbracedLengthM: number;
}): number {
  const { EPa, GPa, IminorM4, JM4, IwM6, unbracedLengthM: L } = input;
  if (!(EPa > 0) || !(GPa > 0) || !(IminorM4 > 0) || !(JM4 > 0) || !(IwM6 > 0) || !(L > 0)) {
    throw new Error("steel design fail closed: missing elastic LTB input");
  }
  const pi2 = Math.PI * Math.PI;
  const flexural = (pi2 * EPa * IminorM4) / (L * L);
  const torsional = GPa * JM4 + (pi2 * EPa * IwM6) / (L * L);
  return Math.sqrt(flexural * torsional);
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

export { forceWithinTolerance, toElasticModulusPa, toSecondMomentM4 };
