import type { SteelCapacityEngineInput, SteelGovernedProperty, SteelStabilityContext } from "@rtb/types";
import { SILENT_UNBRACED_LENGTH_ASSUMPTION } from "@rtb/types";

/** Jurisdiction-neutral warping-constant conversion. Not a design-code rule. */
export function toWarpingM6(property: SteelGovernedProperty, label: string): number {
  if (typeof property.value !== "number" || !Number.isFinite(property.value) || !(property.value > 0)) {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit?.trim()) throw new Error(`steel design fail closed: units incompatible for ${label}`);
  if (property.unit === "m6") return property.value;
  if (property.unit === "mm6") return property.value * 1e-18;
  throw new Error(`steel design fail closed: units incompatible for ${label}`);
}

/**
 * Uniform-moment elastic critical LTB moment for a doubly-symmetric prismatic member:
 * Mcr = sqrt( (π² E Iminor / L²) × (G J + π² E Iw / L²) ).
 * No moment-modification factor. Not EN 1993 Mb,Rd.
 */
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

export function ltbContextRequested(input: SteelCapacityEngineInput, axis: "MAJOR_AXIS" | "MINOR_AXIS"): boolean {
  if (axis !== "MAJOR_AXIS") return false;
  const stability = input.stability;
  return Boolean(
    input.section.torsionConstant
    || input.section.warpingConstant
    || input.material.shearModulus
    || (stability?.unbracedLengthM != null && stability.unbracedLengthM > 0)
    || stability?.lateralRestraint
    || stability?.torsionalRestraint
    || stability?.warpingRestraint,
  );
}

export function requireUnbracedLengthForLtb(stability: SteelStabilityContext | null): number {
  if (SILENT_UNBRACED_LENGTH_ASSUMPTION) throw new Error("unbraced length must not be assumed silently");
  if (!stability) throw new Error("steel design fail closed: missing unbraced length");
  if (stability.derived) throw new Error("steel design fail closed: unbraced length must not be assumed silently");
  const lu = stability.unbracedLengthM;
  if (lu == null || !(lu > 0)) throw new Error("steel design fail closed: missing unbraced length");
  const provenance = stability.unbracedLengthProvenanceRef ?? stability.sourceEvidenceRef;
  if (!provenance?.trim()) throw new Error("steel design fail closed: missing unbraced length provenance");
  if (/^ai$|^llm|ai-inferred|optimizer-inferred/i.test(provenance)) throw new Error("AI cannot invent LTB values");
  if (!stability.lateralRestraint?.trim() || stability.lateralRestraint === "unknown") {
    throw new Error("steel design fail closed: unknown restraint");
  }
  if (!stability.torsionalRestraint?.trim() || stability.torsionalRestraint === "unknown") {
    throw new Error("steel design fail closed: unknown restraint");
  }
  if (!stability.warpingRestraint?.trim() || stability.warpingRestraint === "unknown") {
    throw new Error("steel design fail closed: unknown restraint");
  }
  return lu;
}

export function assertLoadHeightNotGuessed(stability: SteelStabilityContext | null): void {
  const position = stability?.loadApplicationPosition?.trim();
  if (!position) return;
  if (!/^(shear[-_ ]?centre|centroid|shear center)$/i.test(position)) {
    throw new Error("steel design fail closed: unknown required code parameter loadApplicationPosition");
  }
}

export function assertAiCannotInventLtb(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", valuesPresent: boolean): void {
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && !valuesPresent) {
    throw new Error("AI cannot invent LTB values");
  }
}

export function consumeD1cDeflectionHandoff(demand: SteelCapacityEngineInput["demand"]): SteelCapacityEngineInput["demand"]["deflection"] {
  return demand.deflection;
}
