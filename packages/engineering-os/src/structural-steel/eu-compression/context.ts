import type { EurocodeSteelCompressionContext, SteelCapacityEngineInput } from "@rtb/types";
import { EU_INITIAL_STEEL_STANDARD_PART, SILENT_EU_STANDARD_EDITION_INFERENCE } from "@rtb/types";
import { resolveEurocodePart } from "../eu-standard/family";
import { unknownEditionBlocksConformance } from "../eu-standard/resolver";
import { axisLength, resolveBucklingAxes } from "../mechanics/effective-length";
import { assertEffectiveLengthGovernance } from "../mechanics/effective-length";
import { euSectionClassificationState } from "./classification";
import { EU_COMPRESSION_METHOD_REGISTRY } from "./registry";

export function assertEuCompressionStandardContext(context: SteelCapacityEngineInput["standardContext"]): void {
  if (SILENT_EU_STANDARD_EDITION_INFERENCE) throw new Error("silent Eurocode edition inference is forbidden");
  if (context.standardCode !== "EN 1993-1-1") {
    throw new Error("steel design fail closed: unsupported standard part");
  }
  resolveEurocodePart(EU_INITIAL_STEEL_STANDARD_PART);
  if (!context.edition?.trim()) throw new Error("steel design fail closed: unsupported edition");
}

export function assertCompressionGenerationCompatible(generation: string): void {
  if (generation === "SECOND_GENERATION") {
    throw new Error("STANDARD_VERSION_CONFLICT: EU-3 compression methods are not silently reused across incompatible Eurocode generations");
  }
}

export function createEuCompressionContext(input: SteelCapacityEngineInput): EurocodeSteelCompressionContext {
  assertEuCompressionStandardContext(input.standardContext);
  const euro = input.eurocodeContext ?? null;
  if (euro) {
    unknownEditionBlocksConformance(euro);
    assertCompressionGenerationCompatible(euro.version.generationFamily);
  }
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
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    compressionDemandRef: input.demand.resultId,
    memberLengthM: stability.memberLengthM,
    effectiveLengthMajorM: major,
    effectiveLengthMinorM: minor,
    bucklingAxes: axes,
    restraintContext: stability.restraintDescription ?? "unknown",
    standardContextRef: input.standardContext.contextId,
    standardPartRef: EU_INITIAL_STEEL_STANDARD_PART,
    nationalAnnexRef: input.standardContext.nationalAnnexRef?.annexId ?? euro?.nationalAnnex?.nationalAnnexId ?? null,
    ndpSetRef: euro?.nationalAnnex?.nationalParameterSetRef ?? null,
    engineeringRuleRefs: EU_COMPRESSION_METHOD_REGISTRY.filter((row) => row.validationState === "BENCHMARKED").map((row) => row.ruleId),
    technicalBasisRefs: [
      "established-mechanics-nominal-squash-load-equals-yield-stress-times-gross-area",
      "established-mechanics-euler-elastic-buckling-pcr-pi2-ei-over-le2",
    ],
    validationState: "BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    provenanceRef: input.designContext.provenanceRef.timestamp,
    effectiveLengthProvenanceRef: stability.effectiveLengthProvenanceRef ?? stability.sourceEvidenceRef ?? "missing",
    sectionClassificationState: euSectionClassificationState(),
  };
}
