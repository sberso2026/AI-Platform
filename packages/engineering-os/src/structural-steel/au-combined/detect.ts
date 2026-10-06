import type {
  SteelCapacityEngineInput,
  SteelCombinedActionContext,
  SteelCombinedCapacityComponent,
  SteelCombinedDemandComponent,
  SteelInteractionType,
} from "@rtb/types";
import { SECTION_CLASSIFICATION_STATE } from "@rtb/types";
import { AU_INTERACTION_TENSION_BENDING_RULE } from "./registry";

export const CANONICAL_INTERACTION_ORDER: readonly SteelInteractionType[] = [
  "TENSION_BENDING",
  "TENSION_BIAXIAL_BENDING",
  "COMPRESSION_BENDING",
  "COMPRESSION_BIAXIAL_BENDING",
  "AXIAL_BIAXIAL_BENDING",
  "BIAXIAL_BENDING",
  "BENDING_SHEAR",
  "AXIAL_SHEAR",
];

function axialValue(input: SteelCapacityEngineInput, extras: SteelCombinedDemandComponent[]): number {
  const extra = extras.find((row) => row.kind === "AXIAL");
  if (extra) return extra.signed !== 0 ? extra.signed : extra.value;
  const axial = input.demand.axial;
  if ("status" in axial && axial.status === "NO_AXIAL_COMPONENTS") return 0;
  return axial.valueN;
}

function momentMajor(input: SteelCapacityEngineInput, extras: SteelCombinedDemandComponent[]): number {
  const extra = extras.find((row) => row.kind === "MOMENT_MAJOR");
  if (extra) return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
  return Math.abs(input.demand.moment.signed !== 0 ? input.demand.moment.signed : input.demand.moment.value);
}

function momentMinor(extras: SteelCombinedDemandComponent[]): number {
  const extra = extras.find((row) => row.kind === "MOMENT_MINOR");
  if (!extra) return 0;
  return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
}

function shearValue(input: SteelCapacityEngineInput, extras: SteelCombinedDemandComponent[]): number {
  const extra = extras.find((row) => row.kind === "SHEAR");
  if (extra) return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
  return Math.abs(input.demand.shear.signed !== 0 ? input.demand.shear.signed : input.demand.shear.value);
}

export function detectRequiredInteractions(input: SteelCapacityEngineInput): SteelInteractionType[] {
  const extras = input.combined?.componentDemands ?? [];
  const n = axialValue(input, extras);
  const mx = momentMajor(input, extras);
  const my = momentMinor(extras);
  const v = shearValue(input, extras);
  const tension = n > 0;
  const compression = n < 0;
  const major = mx > 0;
  const minor = my > 0;
  const shear = v > 0;
  const detected: SteelInteractionType[] = [];
  if (tension && (major || minor)) detected.push("TENSION_BENDING");
  if (tension && major && minor) detected.push("TENSION_BIAXIAL_BENDING");
  if (compression && (major || minor)) detected.push("COMPRESSION_BENDING");
  if (compression && major && minor) detected.push("COMPRESSION_BIAXIAL_BENDING");
  if ((tension || compression) && major && minor) detected.push("AXIAL_BIAXIAL_BENDING");
  if (major && minor) detected.push("BIAXIAL_BENDING");
  if ((major || minor) && shear) detected.push("BENDING_SHEAR");
  if ((tension || compression) && shear) detected.push("AXIAL_SHEAR");
  return CANONICAL_INTERACTION_ORDER.filter((type) => detected.includes(type));
}

export function assertSameCombination(input: SteelCapacityEngineInput): string {
  const combination = input.demand.combinationId ?? input.combined?.combinationRef ?? null;
  if (!combination?.trim()) throw new Error("steel design fail closed: incompatible load combination");
  if (input.demand.combinationId && input.combined?.combinationRef && input.demand.combinationId !== input.combined.combinationRef) {
    throw new Error("steel design fail closed: incompatible load combination");
  }
  const extras = input.combined?.componentDemands ?? [];
  for (const row of extras) {
    if (!row.resultId?.trim()) throw new Error("steel design fail closed: demand missing");
    if (!row.unit?.trim() || !Number.isFinite(row.value)) {
      throw new Error("steel design fail closed: invalid units");
    }
    if (row.combinationId !== combination) {
      throw new Error("steel design fail closed: incompatible load combination");
    }
    if (row.memberId !== input.demand.memberId) {
      throw new Error("steel design fail closed: demand member does not match design context");
    }
  }
  const capacities = input.combined?.componentCapacities ?? [];
  for (const row of capacities) {
    if (row.combinationId != null && row.combinationId !== combination) {
      throw new Error("steel design fail closed: incompatible load combination");
    }
    if (row.memberId !== input.demand.memberId) {
      throw new Error("steel design fail closed: demand member does not match design context");
    }
    if (row.standardProfileRef !== input.standardContext.contextId) {
      throw new Error("steel design fail closed: standard-profile mismatch");
    }
  }
  return combination;
}

export function toAuCombinedContext(input: SteelCapacityEngineInput, types: SteelInteractionType[]): SteelCombinedActionContext {
  const extras = input.combined?.componentDemands ?? [];
  const capacities = input.combined?.componentCapacities ?? [];
  const refs = (kind: SteelCombinedCapacityComponent["kind"]): string[] =>
    capacities.filter((row) => row.kind === kind).map((row) => row.capacityResultId);
  const n = axialValue(input, extras);
  return {
    combinedContextId: `${input.designContext.designContextId}:combined`,
    memberRef: input.designContext.memberRef,
    tensionDemandRef: n > 0 ? input.demand.resultId : null,
    compressionDemandRef: n < 0 ? input.demand.resultId : null,
    majorMomentDemandRef: momentMajor(input, extras) > 0 ? input.demand.resultId : null,
    minorMomentDemandRef: extras.find((row) => row.kind === "MOMENT_MINOR")?.resultId ?? null,
    shearDemandRefs: shearValue(input, extras) > 0 ? [input.demand.resultId] : [],
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

export function assertAiCannotInventInteraction(equation: string | null, proposedBy: "AI" | "OPTIMIZER" | "HUMAN"): void {
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && equation) {
    throw new Error("AI cannot invent interaction equation");
  }
}

export function assertAiCannotChangeComponentResults(llmOriginatedCapacity: boolean): void {
  if (llmOriginatedCapacity) throw new Error("AI cannot change component results");
}
