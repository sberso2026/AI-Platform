import type { En1993PartId, EurocodeSteelCombinedActionContext, SteelCapacityEngineInput, SteelInteractionType } from "@rtb/types";
import { EU_INITIAL_STEEL_STANDARD_PART, SILENT_EU_STANDARD_EDITION_INFERENCE } from "@rtb/types";
import { euSectionClassificationState } from "../eu-compression/classification";
import { resolveEurocodePart } from "../eu-standard/family";
import { unknownEditionBlocksConformance } from "../eu-standard/resolver";
import { axialValue, momentMajor, momentMinor, shearMajor, shearMinor } from "../mechanics/interaction";
import { EU_INTERACTION_METHOD_REGISTRY, EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL } from "./registry";

export function assertEuInteractionStandardContext(context: SteelCapacityEngineInput["standardContext"]): void {
  if (SILENT_EU_STANDARD_EDITION_INFERENCE) throw new Error("silent Eurocode edition inference is forbidden");
  if (context.standardCode !== "EN 1993-1-1") {
    throw new Error("steel design fail closed: unsupported standard part");
  }
  resolveEurocodePart(EU_INITIAL_STEEL_STANDARD_PART);
  resolveEurocodePart(EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL.bendingShearPlatedDependencyPart);
  if (!context.edition?.trim()) throw new Error("steel design fail closed: unsupported edition");
}

export function assertInteractionGenerationCompatible(generation: string): void {
  if (generation === "SECOND_GENERATION") {
    throw new Error("STANDARD_VERSION_CONFLICT: EU-6 interaction methods are not silently reused across incompatible Eurocode generations");
  }
}

export function createEuCombinedActionContext(
  input: SteelCapacityEngineInput,
  types: SteelInteractionType[],
): EurocodeSteelCombinedActionContext {
  assertEuInteractionStandardContext(input.standardContext);
  const euro = input.eurocodeContext ?? null;
  if (euro) {
    unknownEditionBlocksConformance(euro);
    assertInteractionGenerationCompatible(euro.version.generationFamily);
  }
  const capacities = input.combined?.componentCapacities ?? [];
  const n = axialValue(input);
  const mx = momentMajor(input);
  const my = momentMinor(input);
  const vMajor = shearMajor(input);
  const vMinor = shearMinor(input);
  const standardPartRefs: En1993PartId[] = [
    EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL.memberInteractionPart,
    EU_INTERACTION_STANDARD_PART_DEPENDENCY_MODEL.bendingShearPlatedDependencyPart,
  ];
  const mechanicsRefs = capacities
    .filter((row) => row.resultClass !== "DESIGN_CAPACITY" && row.authorityState !== "CODE_PROFILE_CAPACITY")
    .map((row) => row.capacityResultId);
  return {
    memberRef: input.designContext.memberRef,
    sectionRef: input.designContext.sectionRef,
    materialRef: input.designContext.materialRef,
    axialDemandRef: n !== 0 ? input.demand.resultId : null,
    majorMomentDemandRef: mx > 0 ? input.demand.resultId : null,
    minorMomentDemandRef: my > 0 ? (input.combined?.componentDemands?.find((row) => row.kind === "MOMENT_MINOR")?.resultId ?? input.demand.resultId) : null,
    majorShearDemandRef: vMajor > 0 ? input.demand.resultId : null,
    minorShearDemandRef: vMinor > 0 ? input.demand.resultId : null,
    componentCapacityRefs: capacities.map((row) => row.capacityResultId),
    componentMechanicsRefs: mechanicsRefs,
    compressionStabilityContextRef: n < 0 ? (input.stability?.stabilityContextId ?? input.designContext.stabilityContextRef) : null,
    bendingStabilityContextRef: mx > 0 || my > 0 ? (input.stability?.stabilityContextId ?? input.designContext.stabilityContextRef) : null,
    sectionClassificationRef: euSectionClassificationState(),
    interactionRuleRef: types[0] ? `EU_INTERACTION_${types[0]}` : null,
    standardContextRef: input.standardContext.contextId,
    standardPartRefs,
    nationalAnnexRef: input.standardContext.nationalAnnexRef?.annexId ?? euro?.nationalAnnex?.nationalAnnexId ?? null,
    ndpSetRef: euro?.nationalAnnex?.nationalParameterSetRef ?? null,
    technicalBasisRef: EU_INTERACTION_METHOD_REGISTRY[0]?.technicalBasisRef ?? "eurocode-interaction-framework",
    provenance: input.designContext.provenanceRef.timestamp,
    validationState: "FRAMEWORK_ONLY",
    conformanceState: "INTENDED_PROFILE",
  };
}
