import type { EuC1cR1DeclaredNdpValue } from "@rtb/types";
import { EU_C1C_R1_PARAMETER_VERSION } from "@rtb/types";

export function finiteNumberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function convertDeclaredDimensionless(
  declared: EuC1cR1DeclaredNdpValue | null | undefined,
  label: string,
): { ok: true; value: number; outputUnit: "dimensionless" } | { ok: false; reason: string } {
  if (!declared) return { ok: false, reason: `missing declared ${label}` };
  const n = finiteNumberOrNull(declared.value);
  if (n == null) return { ok: false, reason: `${label} is not a finite number` };
  if (!(n > 0)) return { ok: false, reason: `${label} must be positive` };
  const unit = declared.unit?.trim() ?? "";
  if (!unit) return { ok: false, reason: `${label} requires explicit units` };
  if (unit !== "dimensionless" && unit !== "1") {
    return { ok: false, reason: `unsupported ${label} unit ${unit}` };
  }
  if (!declared.provenanceRef || !declared.sourceAuthority || !declared.ndpIdentity) {
    return { ok: false, reason: `${label} requires source/provenance/NDP identity` };
  }
  if (declared.version && declared.version !== EU_C1C_R1_PARAMETER_VERSION) {
    return { ok: false, reason: `stale ${label} parameter version ${declared.version}` };
  }
  return { ok: true, value: n, outputUnit: "dimensionless" };
}
