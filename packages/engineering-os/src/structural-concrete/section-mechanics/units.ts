import { SILENT_RC_UNIT_CONVERSION } from "@rtb/types";

export function failClosed(message: string): never {
  throw new Error(`RC section fail closed: ${message}`);
}

export function assertFiniteNumber(value: number, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) failClosed(`${label} is not finite`);
  return value;
}

export function assertPositiveLengthMm(value: number, unit: string, label: string): number {
  if (SILENT_RC_UNIT_CONVERSION) failClosed("silent RC unit conversion is forbidden");
  if (unit !== "mm") failClosed(`missing units or unexpected unit ${unit} for ${label}; mm required (explicit conversion only)`);
  const n = assertFiniteNumber(value, label);
  if (!(n > 0)) failClosed(`${label} must be a positive mm length`);
  return n;
}

export function assertLengthMm(value: number, unit: string, label: string): number {
  if (SILENT_RC_UNIT_CONVERSION) failClosed("silent RC unit conversion is forbidden");
  if (!unit?.trim()) failClosed(`missing units for ${label}`);
  if (unit !== "mm") failClosed(`unexpected unit ${unit} for ${label}; mm required`);
  return assertFiniteNumber(value, label);
}

export function mmToM(mm: number): number {
  return assertFiniteNumber(mm, "length-mm") * 1e-3;
}

export function mm2ToM2(mm2: number): number {
  return assertFiniteNumber(mm2, "area-mm2") * 1e-6;
}

export function mm4ToM4(mm4: number): number {
  return assertFiniteNumber(mm4, "second-moment-mm4") * 1e-12;
}

export function nMmToNm(nMm: number): number {
  return assertFiniteNumber(nMm, "moment-Nmm") * 1e-3;
}

export function mpaToPa(mpa: number): number {
  return assertFiniteNumber(mpa, "stress-MPa") * 1e6;
}

export function governedModulusMPa(value: number, unit: string, label: string): number {
  const n = assertFiniteNumber(value, label);
  if (!(n > 0)) failClosed(`${label} must be positive`);
  if (unit === "MPa") return n;
  if (unit === "GPa") return n * 1e3;
  if (unit === "Pa") return n / 1e6;
  failClosed(`unsupported modulus unit ${unit} for ${label}`);
}

export function nearlyEqual(actual: number, expected: number, absTol: number, relTol: number): boolean {
  const denom = Math.max(Math.abs(expected), Math.abs(actual), 1);
  return Math.abs(actual - expected) <= Math.max(absTol, relTol * denom);
}
