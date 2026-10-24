import type { ConcreteGovernedProperty } from "@rtb/types";

export type EuC1QuantityKind = "STRESS" | "AREA";

export function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function convertGovernedQuantity(property: ConcreteGovernedProperty | null | undefined, kind: EuC1QuantityKind, label: string): { ok: true; value: number; outputUnit: string } | { ok: false; reason: string } {
  if (!property) return { ok: false, reason: `missing ${label}` };
  const n = finiteNumberOrNull(property.value);
  if (n == null) return { ok: false, reason: `${label} is not a finite number` };
  const unit = property.unit?.trim() ?? "";
  if (!unit) return { ok: false, reason: `${label} requires explicit units` };
  if (!property.provenanceRef || !property.sourceAuthority) {
    return { ok: false, reason: `${label} requires source/provenance` };
  }
  if (kind === "STRESS") {
    if (!(n > 0)) return { ok: false, reason: `${label} must be positive` };
    if (unit === "MPa") return { ok: true, value: n, outputUnit: "MPa" };
    if (unit === "GPa") return { ok: true, value: n * 1e3, outputUnit: "MPa" }; // SI prefix GPa→MPa
    if (unit === "Pa") return { ok: true, value: n / 1e6, outputUnit: "MPa" }; // SI prefix Pa→MPa
    return { ok: false, reason: `unsupported ${label} unit ${unit}` };
  }
  if (!(n > 0)) return { ok: false, reason: `${label} must be positive` };
  if (unit === "mm2") return { ok: true, value: n, outputUnit: "mm2" };
  if (unit === "m2") return { ok: true, value: n * 1e6, outputUnit: "mm2" }; // SI prefix m²→mm²
  return { ok: false, reason: `unsupported ${label} unit ${unit}` };
}
