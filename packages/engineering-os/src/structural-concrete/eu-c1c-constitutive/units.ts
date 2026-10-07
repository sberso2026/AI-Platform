export function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function convertGovernedStrain(
  value: number,
  unit: string,
  label: string,
): { ok: true; value: number; outputUnit: "m/m" } | { ok: false; reason: string } {
  const n = finiteNumberOrNull(value);
  if (n == null) return { ok: false, reason: `${label} is not a finite number` };
  const u = unit.trim();
  if (!u) return { ok: false, reason: `${label} requires explicit units` };
  if (u === "m/m" || u === "1" || u === "dimensionless") return { ok: true, value: n, outputUnit: "m/m" };
  if (u === "‰" || u === "permille") return { ok: true, value: n / 1000, outputUnit: "m/m" };
  if (u === "%") return { ok: true, value: n / 100, outputUnit: "m/m" };
  return { ok: false, reason: `unsupported ${label} unit ${u}` };
}

export function convertGovernedStressMPa(
  value: number,
  unit: string,
  label: string,
): { ok: true; value: number; outputUnit: "MPa" } | { ok: false; reason: string } {
  const n = finiteNumberOrNull(value);
  if (n == null) return { ok: false, reason: `${label} is not a finite number` };
  if (!(n > 0)) return { ok: false, reason: `${label} must be positive` };
  const u = unit.trim();
  if (!u) return { ok: false, reason: `${label} requires explicit units` };
  if (u === "MPa") return { ok: true, value: n, outputUnit: "MPa" };
  if (u === "GPa") return { ok: true, value: n * 1e3, outputUnit: "MPa" };
  if (u === "Pa") return { ok: true, value: n / 1e6, outputUnit: "MPa" };
  return { ok: false, reason: `unsupported ${label} unit ${u}` };
}

export function convertGovernedExponent(
  value: number,
  unit: string,
  label: string,
): { ok: true; value: number; outputUnit: "dimensionless" } | { ok: false; reason: string } {
  const n = finiteNumberOrNull(value);
  if (n == null) return { ok: false, reason: `${label} is not a finite number` };
  if (!(n > 0)) return { ok: false, reason: `${label} must be positive` };
  const u = unit.trim();
  if (!u) return { ok: false, reason: `${label} requires explicit units` };
  if (u !== "dimensionless" && u !== "1") return { ok: false, reason: `unsupported ${label} unit ${u}` };
  return { ok: true, value: n, outputUnit: "dimensionless" };
}
