import type {
  AuCompressionDesignContext,
  SteelBucklingAxis,
  SteelCapacityEngineInput,
  SteelGovernedProperty,
  SteelStabilityContext,
} from "@rtb/types";
import { SECTION_CLASSIFICATION_STATE, SILENT_EFFECTIVE_LENGTH_ASSUMPTION } from "@rtb/types";
import { AU_COMPRESSION_SQUASH_RULE } from "./registry";

function axisLength(
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
  return stability;
}

export function resolveBucklingAxes(stability: SteelStabilityContext): SteelBucklingAxis[] {
  if (stability.bucklingAxis === "MAJOR") return ["MAJOR_AXIS"];
  if (stability.bucklingAxis === "MINOR") return ["MINOR_AXIS"];
  if (stability.bucklingAxis === "BOTH") return ["MAJOR_AXIS", "MINOR_AXIS"];
  throw new Error("steel design fail closed: unsupported buckling mode");
}

export function toAuCompressionContext(input: SteelCapacityEngineInput): AuCompressionDesignContext {
  const stability = assertEffectiveLengthGovernance(input.stability);
  const axes = resolveBucklingAxes(stability);
  if (axes.includes("TORSIONAL") || axes.includes("FLEXURAL_TORSIONAL")) {
    throw new Error("steel design fail closed: unsupported buckling mode");
  }
  if (stability.memberLengthM == null || !(stability.memberLengthM > 0)) {
    throw new Error("steel design fail closed: missing member length");
  }
  const major = axes.includes("MAJOR_AXIS") ? axisLength(stability, "MAJOR_AXIS", stability.effectiveLengthFactorMajor) : null;
  const minor = axes.includes("MINOR_AXIS") ? axisLength(stability, "MINOR_AXIS", stability.effectiveLengthFactorMinor) : null;
  if (axes.includes("MAJOR_AXIS") && axes.includes("MINOR_AXIS") && major == null && minor == null) {
    throw new Error("steel design fail closed: missing effective length");
  }
  return {
    compressionContextId: `${input.designContext.designContextId}:compression`,
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    axialDemandRef: input.demand.resultId,
    memberLengthM: stability.memberLengthM,
    effectiveLengthMajorM: major,
    effectiveLengthMinorM: minor,
    bucklingAxes: axes,
    unbracedLengthM: stability.unbracedLengthM,
    restraintContext: stability.restraintDescription ?? "unknown",
    engineeringRuleRef: AU_COMPRESSION_SQUASH_RULE.ruleId,
    standardProfileRef: input.standardContext.contextId,
    provenanceRef: input.designContext.provenanceRef,
    validationState: input.designContext.validationState,
    effectiveLengthProvenanceRef: stability.effectiveLengthProvenanceRef ?? stability.sourceEvidenceRef ?? "missing",
    sectionClassificationState: SECTION_CLASSIFICATION_STATE,
  };
}

export function assertAiCannotSupplyEffectiveLength(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", lengthPresent: boolean): void {
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && !lengthPresent) {
    throw new Error("AI cannot supply effective length");
  }
}
