/**
 * SI length identities for cover-assembly inputs.
 * The decimal radix is the base of SI prefixes. It is not a cover value.
 */

const SI_DECIMAL_RADIX = 10;
const METRE_EXPONENT = { m: 0, cm: -2, mm: -3 } as const;

export type EuC8LengthUnit = keyof typeof METRE_EXPONENT;

/** Non-negative domain for explicit length components. Zero is an explicit value, not a substitute for a missing input. */
export const EU_C8_R2_EXPLICIT_COMPONENT_LOWER_BOUND_MM = 0;

export function convertLengthToMm(
  value: number,
  unit: string,
): { ok: true; mm: number; unit: "mm" } | { ok: false; reason: "NOT_FINITE" | "INVALID_UNITS" } {
  if (typeof value !== "number" || !Number.isFinite(value)) return { ok: false, reason: "NOT_FINITE" };
  if (unit !== "mm" && unit !== "cm" && unit !== "m") return { ok: false, reason: "INVALID_UNITS" };
  const exponent = METRE_EXPONENT[unit] - METRE_EXPONENT.mm;
  return { ok: true, mm: value * (SI_DECIMAL_RADIX ** exponent), unit: "mm" };
}
