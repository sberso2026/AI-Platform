import type { EurocodeSteelTensionContext, SteelCapacityEngineInput } from "@rtb/types";
import { EU_INITIAL_STEEL_STANDARD_PART, SILENT_EU_STANDARD_EDITION_INFERENCE } from "@rtb/types";
import { resolveEurocodePart } from "../eu-standard/family";
import { unknownEditionBlocksConformance } from "../eu-standard/resolver";
import { EU_TENSION_METHOD_REGISTRY } from "./registry";

export function assertEuTensionStandardContext(context: SteelCapacityEngineInput["standardContext"]): void {
  if (SILENT_EU_STANDARD_EDITION_INFERENCE) throw new Error("silent Eurocode edition inference is forbidden");
  if (context.standardCode !== "EN 1993-1-1") {
    throw new Error("steel design fail closed: unsupported standard part");
  }
  resolveEurocodePart(EU_INITIAL_STEEL_STANDARD_PART);
  if (!context.edition?.trim()) throw new Error("steel design fail closed: unsupported edition");
}

export function assertGenerationCompatible(generation: string): void {
  if (generation === "SECOND_GENERATION") {
    throw new Error("STANDARD_VERSION_CONFLICT: EU-2 tension methods are not silently reused across incompatible Eurocode generations");
  }
}

export function createEuTensionContext(input: SteelCapacityEngineInput): EurocodeSteelTensionContext {
  assertEuTensionStandardContext(input.standardContext);
  const euro = input.eurocodeContext ?? null;
  if (euro) {
    unknownEditionBlocksConformance(euro);
    assertGenerationCompatible(euro.version.generationFamily);
  }
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    axialDemandRef: input.demand.resultId,
    standardContextRef: input.standardContext.contextId,
    standardPartRef: EU_INITIAL_STEEL_STANDARD_PART,
    nationalAnnexRef: input.standardContext.nationalAnnexRef?.annexId ?? euro?.nationalAnnex?.nationalAnnexId ?? null,
    ndpSetRef: euro?.nationalAnnex?.nationalParameterSetRef ?? null,
    engineeringRuleRefs: EU_TENSION_METHOD_REGISTRY.filter((row) => row.validationState === "BENCHMARKED").map((row) => row.ruleId),
    technicalBasisRefs: ["established-mechanics-nominal-tension-force-equals-stress-times-area"],
    provenanceRef: input.designContext.provenanceRef.timestamp,
    validationState: "BENCHMARKED",
    conformanceState: "INTENDED_PROFILE",
  };
}
