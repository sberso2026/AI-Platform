import type { EurocodeSteelBendingContext, SteelCapacityEngineInput } from "@rtb/types";
import { EU_INITIAL_STEEL_STANDARD_PART, SILENT_EU_STANDARD_EDITION_INFERENCE } from "@rtb/types";
import { resolveEurocodePart } from "../eu-standard/family";
import { unknownEditionBlocksConformance } from "../eu-standard/resolver";
import { bendingAxisFromLimitState } from "../mechanics/bending";
import { euBendingSectionClassificationState } from "./classification";
import { EU_BENDING_METHOD_REGISTRY } from "./registry";

export function assertEuBendingStandardContext(context: SteelCapacityEngineInput["standardContext"]): void {
  if (SILENT_EU_STANDARD_EDITION_INFERENCE) throw new Error("silent Eurocode edition inference is forbidden");
  if (context.standardCode !== "EN 1993-1-1") {
    throw new Error("steel design fail closed: unsupported standard part");
  }
  resolveEurocodePart(EU_INITIAL_STEEL_STANDARD_PART);
  if (!context.edition?.trim()) throw new Error("steel design fail closed: unsupported edition");
}

export function assertBendingGenerationCompatible(generation: string): void {
  if (generation === "SECOND_GENERATION") {
    throw new Error("STANDARD_VERSION_CONFLICT: EU-4 bending methods are not silently reused across incompatible Eurocode generations");
  }
}

export function createEuBendingContext(input: SteelCapacityEngineInput): EurocodeSteelBendingContext {
  assertEuBendingStandardContext(input.standardContext);
  const euro = input.eurocodeContext ?? null;
  if (euro) {
    unknownEditionBlocksConformance(euro);
    assertBendingGenerationCompatible(euro.version.generationFamily);
  }
  const axis = bendingAxisFromLimitState(input.limitState);
  const stability = input.stability;
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    momentDemandRefs: [input.demand.resultId],
    bendingAxis: axis,
    memberLengthM: stability?.memberLengthM ?? null,
    unbracedLengthM: stability?.unbracedLengthM ?? null,
    unbracedLengthProvenanceRef: stability?.unbracedLengthProvenanceRef ?? stability?.sourceEvidenceRef ?? null,
    restraintContext: stability?.restraintDescription ?? null,
    lateralRestraint: stability?.lateralRestraint ?? null,
    torsionalRestraint: stability?.torsionalRestraint ?? null,
    warpingRestraint: stability?.warpingRestraint ?? null,
    momentDistributionContext: stability?.momentDistributionDescription ?? stability?.momentGradientRef ?? null,
    loadApplicationContext: stability?.loadApplicationPosition ?? null,
    standardContextRef: input.standardContext.contextId,
    standardPartRef: EU_INITIAL_STEEL_STANDARD_PART,
    nationalAnnexRef: input.standardContext.nationalAnnexRef?.annexId ?? euro?.nationalAnnex?.nationalAnnexId ?? null,
    ndpSetRef: euro?.nationalAnnex?.nationalParameterSetRef ?? null,
    engineeringRuleRefs: EU_BENDING_METHOD_REGISTRY.filter((row) => row.validationState === "BENCHMARKED").map((row) => row.ruleId),
    technicalBasisRefs: [
      "established-mechanics-first-yield-moment-equals-fy-times-elastic-section-modulus",
      "established-mechanics-uniform-moment-elastic-critical-ltb-sqrt-pi2-EIy-L2-times-GJ-plus-pi2-EIw-L2",
    ],
    validationState: "BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
    provenanceRef: input.designContext.provenanceRef.timestamp,
    sectionClassificationState: euBendingSectionClassificationState(),
    sectionResistanceClassState: "VALIDATION_REQUIRED",
  };
}
