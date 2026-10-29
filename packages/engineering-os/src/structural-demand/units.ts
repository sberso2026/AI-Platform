import {
  CANONICAL_INTERNAL_UNITS,
  ENGINEERING_NUMERICAL_TOLERANCE,
  STRUCTURAL_ACTION_CATEGORIES,
  STRUCTURAL_BOUNDARY_CONDITIONS,
  STRUCTURAL_LOAD_APPLICATION_KINDS,
  STRUCTURAL_LOAD_COORDINATE_SYSTEMS,
} from "@rtb/types";
import type { StructuralLoadApplication, StructuralQuantity } from "@rtb/types";

export function assertExplicitUnit(quantity: StructuralQuantity, allowed: readonly string[]): number {
  if (!quantity.unit?.trim()) throw new Error("governed load input is malformed: units are required");
  if (!allowed.includes(quantity.unit)) {
    throw new Error(`unsupported unit ${quantity.unit}; canonical internal units are ${CANONICAL_INTERNAL_UNITS.force}/${CANONICAL_INTERNAL_UNITS.length}`);
  }
  if (!Number.isFinite(quantity.value)) throw new Error("governed load input is malformed: magnitude must be finite");
  return quantity.value;
}

export const EXISTING_FORCE_UNITS = ["N", "kN"] as const;
export const EXISTING_MOMENT_UNITS = ["N.m", "kN.m"] as const;
export const EXISTING_DISTRIBUTED_FORCE_UNITS = ["N/m", "kN/m"] as const;
export const EXISTING_STRESS_UNITS = ["Pa", "MPa", "GPa"] as const;
export const EXISTING_LENGTH_UNITS = ["m"] as const;

const EXISTING_UNIT_FAMILIES = {
  force: EXISTING_FORCE_UNITS,
  moment: EXISTING_MOMENT_UNITS,
  distributedForce: EXISTING_DISTRIBUTED_FORCE_UNITS,
  stress: EXISTING_STRESS_UNITS,
  length: EXISTING_LENGTH_UNITS,
  deflection: EXISTING_LENGTH_UNITS,
} as const;

/** Identity-only family lookup. Does not scale a numeric value. */
export function existingUnitFamily(quantity: string, unit: string): string | null {
  if (!Object.prototype.hasOwnProperty.call(EXISTING_UNIT_FAMILIES, quantity)) return null;
  const allowed = EXISTING_UNIT_FAMILIES[quantity as keyof typeof EXISTING_UNIT_FAMILIES];
  return (allowed as readonly string[]).includes(unit) ? quantity : null;
}

export function toForceN(quantity: StructuralQuantity): number {
  const value = assertExplicitUnit(quantity, EXISTING_FORCE_UNITS);
  return quantity.unit === "kN" ? value * 1000 : value;
}

export function toMomentNm(quantity: StructuralQuantity): number {
  const value = assertExplicitUnit(quantity, EXISTING_MOMENT_UNITS);
  return quantity.unit === "kN.m" ? value * 1000 : value;
}

export function toDistributedNpm(quantity: StructuralQuantity): number {
  const value = assertExplicitUnit(quantity, EXISTING_DISTRIBUTED_FORCE_UNITS);
  return quantity.unit === "kN/m" ? value * 1000 : value;
}

export function toLengthM(value: number, unit: string): number {
  if (!unit?.trim()) throw new Error("governed load input is malformed: length units are required");
  if (!(EXISTING_LENGTH_UNITS as readonly string[]).includes(unit)) throw new Error(`unsupported length unit ${unit}; canonical internal unit is m`);
  if (!Number.isFinite(value) || value < 0) throw new Error("governed load input is malformed: length must be a finite non-negative metre value");
  return value;
}

export function toEPa(quantity: StructuralQuantity): number {
  const value = assertExplicitUnit(quantity, EXISTING_STRESS_UNITS);
  if (quantity.unit === "GPa") return value * 1e9;
  if (quantity.unit === "MPa") return value * 1e6;
  return value;
}

export function toIm4(quantity: StructuralQuantity): number {
  const value = assertExplicitUnit(quantity, ["m4"]);
  if (value <= 0) throw new Error("second moment of area must be positive");
  return value;
}

export function nearlyEqual(actual: number, expected: number, absTol: number = ENGINEERING_NUMERICAL_TOLERANCE.forceN): boolean {
  const denom = Math.max(Math.abs(expected), Math.abs(actual), 1);
  return Math.abs(actual - expected) <= Math.max(absTol, ENGINEERING_NUMERICAL_TOLERANCE.relative * denom);
}

export function assertLoadApplicationShape(row: StructuralLoadApplication): void {
  if (!(STRUCTURAL_ACTION_CATEGORIES as readonly string[]).includes(row.actionCategory)) {
    throw new Error("governed load input is malformed: unknown action category");
  }
  if (!(STRUCTURAL_LOAD_APPLICATION_KINDS as readonly string[]).includes(row.kind)) {
    throw new Error("UNSUPPORTED_CASE: unsupported load application");
  }
  if (!(STRUCTURAL_LOAD_COORDINATE_SYSTEMS as readonly string[]).includes(row.coordinateSystem)) {
    throw new Error("governed load input is malformed: coordinate system is required");
  }
  if (row.coordinateSystem !== "LOCAL_MEMBER" && !row.memberLocalResolved) {
    throw new Error("UNSUPPORTED_CASE: loads must not be silently transformed; provide LOCAL_MEMBER or an already-resolved member-local equivalent");
  }
}

export function assertBoundary(boundary: string): asserts boundary is (typeof STRUCTURAL_BOUNDARY_CONDITIONS)[number] {
  if (!(STRUCTURAL_BOUNDARY_CONDITIONS as readonly string[]).includes(boundary)) {
    throw new Error("UNSUPPORTED_CASE: unsupported support condition");
  }
}
