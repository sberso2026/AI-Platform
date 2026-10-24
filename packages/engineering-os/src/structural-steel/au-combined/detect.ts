import type {
  SteelCapacityEngineInput,
  SteelCombinedActionContext,
  SteelCombinedCapacityComponent,
  SteelInteractionType,
} from "@rtb/types";
import { SECTION_CLASSIFICATION_STATE } from "@rtb/types";
import {
  axialValue,
  momentMajor,
  shearValue,
} from "../mechanics/interaction";
import { AU_INTERACTION_TENSION_BENDING_RULE } from "./registry";

export {
  assertAiCannotChangeComponentResults,
  assertAiCannotCombineIncompatibleCases,
  assertAiCannotInventInteraction,
  assertSameCombination,
  CANONICAL_INTERACTION_ORDER,
  detectRequiredInteractions,
} from "../mechanics/interaction";

export function toAuCombinedContext(input: SteelCapacityEngineInput, types: SteelInteractionType[]): SteelCombinedActionContext {
  const extras = input.combined?.componentDemands ?? [];
  const capacities = input.combined?.componentCapacities ?? [];
  const refs = (kind: SteelCombinedCapacityComponent["kind"]): string[] =>
    capacities.filter((row) => row.kind === kind).map((row) => row.capacityResultId);
  const n = axialValue(input);
  return {
    combinedContextId: `${input.designContext.designContextId}:combined`,
    memberRef: input.designContext.memberRef,
    tensionDemandRef: n > 0 ? input.demand.resultId : null,
    compressionDemandRef: n < 0 ? input.demand.resultId : null,
    majorMomentDemandRef: momentMajor(input) > 0 ? input.demand.resultId : null,
    minorMomentDemandRef: extras.find((row) => row.kind === "MOMENT_MINOR")?.resultId ?? null,
    shearDemandRefs: shearValue(input) > 0 ? [input.demand.resultId] : [],
    tensionCapacityRefs: refs("TENSION"),
    compressionCapacityRefs: refs("COMPRESSION"),
    majorBendingCapacityRefs: refs("BENDING_MAJOR"),
    minorBendingCapacityRefs: refs("BENDING_MINOR"),
    shearCapacityRefs: refs("SHEAR"),
    stabilityContextRef: input.stability?.stabilityContextId ?? input.designContext.stabilityContextRef,
    sectionClassificationRef: SECTION_CLASSIFICATION_STATE,
    interactionRuleRef: types[0] ? `AU_INTERACTION_${types[0]}` : AU_INTERACTION_TENSION_BENDING_RULE.ruleId,
    standardProfileRef: input.standardContext.contextId,
    technicalBasisRef: AU_INTERACTION_TENSION_BENDING_RULE.technicalBasisRef,
    provenanceRef: input.designContext.provenanceRef,
    validationState: input.designContext.validationState,
  };
}
