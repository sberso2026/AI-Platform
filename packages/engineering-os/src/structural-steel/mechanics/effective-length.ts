import type { SteelBucklingAxis, SteelGovernedProperty, SteelStabilityContext } from "@rtb/types";
import { SILENT_EFFECTIVE_LENGTH_ASSUMPTION } from "@rtb/types";

export function assertEffectiveLengthGovernance(stability: SteelStabilityContext | null): SteelStabilityContext {
  if (SILENT_EFFECTIVE_LENGTH_ASSUMPTION) throw new Error("effective length must not be assumed silently");
  if (!stability) throw new Error("steel design fail closed: missing stability context");
  if (stability.derived) throw new Error("steel design fail closed: missing effective length");
  const provenance = stability.effectiveLengthProvenanceRef ?? stability.sourceEvidenceRef;
  if (!provenance?.trim()) throw new Error("steel design fail closed: missing effective length provenance");
  if (/^ai$|^llm|ai-inferred|optimizer-inferred/i.test(provenance)) {
    throw new Error("AI cannot supply effective length");
  }
  if (!stability.restraintDescription?.trim() || stability.restraintDescription === "unknown") {
    throw new Error("steel design fail closed: unknown restraint");
  }
  const implied = /^(pinned|fixed|frame)$/i.test(stability.restraintDescription.trim());
  const hasExplicit = (stability.effectiveLengthMajorM != null && stability.effectiveLengthMajorM > 0)
    || (stability.effectiveLengthMinorM != null && stability.effectiveLengthMinorM > 0)
    || (stability.effectiveLengthM != null && stability.effectiveLengthM > 0)
    || (stability.effectiveLengthFactorMajor != null && typeof stability.effectiveLengthFactorMajor.value === "number")
    || (stability.effectiveLengthFactorMinor != null && typeof stability.effectiveLengthFactorMinor.value === "number");
  if (implied && !hasExplicit) {
    throw new Error("steel design fail closed: missing effective length");
  }
  return stability;
}

export function resolveBucklingAxes(stability: SteelStabilityContext): SteelBucklingAxis[] {
  if (stability.bucklingAxis === "MAJOR") return ["MAJOR_AXIS"];
  if (stability.bucklingAxis === "MINOR") return ["MINOR_AXIS"];
  if (stability.bucklingAxis === "BOTH") return ["MAJOR_AXIS", "MINOR_AXIS"];
  throw new Error("steel design fail closed: unsupported buckling mode");
}

export function axisLength(
  stability: SteelStabilityContext,
  axis: "MAJOR_AXIS" | "MINOR_AXIS",
  factor: SteelGovernedProperty | null | undefined,
): number {
  const explicit = axis === "MAJOR_AXIS"
    ? (stability.effectiveLengthMajorM ?? (stability.bucklingAxis === "MAJOR" ? stability.effectiveLengthM : null))
    : (stability.effectiveLengthMinorM ?? (stability.bucklingAxis === "MINOR" ? stability.effectiveLengthM : null));
  if (explicit != null && explicit > 0) return explicit;
  if (factor && typeof factor.value === "number" && factor.value > 0 && factor.provenanceRef && stability.memberLengthM != null && stability.memberLengthM > 0) {
    return factor.value * stability.memberLengthM;
  }
  throw new Error("steel design fail closed: missing effective length");
}

export function assertAiCannotSupplyEffectiveLength(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", lengthPresent: boolean): void {
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && !lengthPresent) {
    throw new Error("AI cannot supply effective length");
  }
}
