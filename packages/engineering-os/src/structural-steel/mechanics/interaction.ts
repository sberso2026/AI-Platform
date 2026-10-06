import type {
  SteelCapacityEngineInput,
  SteelCombinedCapacityComponent,
  SteelCombinedDemandComponent,
  SteelComponentUtilizationRow,
  SteelComponentUtilizationVector,
  SteelInteractionType,
} from "@rtb/types";
import { MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_CODE_INTERACTION } from "@rtb/types";

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

function extras(input: SteelCapacityEngineInput): SteelCombinedDemandComponent[] {
  return input.combined?.componentDemands ?? [];
}

export function axialValue(input: SteelCapacityEngineInput): number {
  const extra = extras(input).find((row) => row.kind === "AXIAL");
  if (extra) return extra.signed !== 0 ? extra.signed : extra.value;
  const axial = input.demand.axial;
  if ("status" in axial && axial.status === "NO_AXIAL_COMPONENTS") return 0;
  return axial.valueN;
}

export function momentMajor(input: SteelCapacityEngineInput): number {
  const extra = extras(input).find((row) => row.kind === "MOMENT_MAJOR");
  if (extra) return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
  return Math.abs(input.demand.moment.signed !== 0 ? input.demand.moment.signed : input.demand.moment.value);
}

export function momentMinor(input: SteelCapacityEngineInput): number {
  const extra = extras(input).find((row) => row.kind === "MOMENT_MINOR");
  if (!extra) return 0;
  return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
}

export function shearValue(input: SteelCapacityEngineInput): number {
  const extra = extras(input).find((row) => row.kind === "SHEAR" || row.kind === "SHEAR_MAJOR" || row.kind === "SHEAR_MINOR");
  if (extra) return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
  return Math.abs(input.demand.shear.signed !== 0 ? input.demand.shear.signed : input.demand.shear.value);
}

export function shearMajor(input: SteelCapacityEngineInput): number {
  const extra = extras(input).find((row) => row.kind === "SHEAR_MAJOR");
  if (extra) return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
  if (input.shear?.shearAxis === "MINOR_SHEAR") return 0;
  return shearValue(input);
}

export function shearMinor(input: SteelCapacityEngineInput): number {
  const extra = extras(input).find((row) => row.kind === "SHEAR_MINOR");
  if (extra) return Math.abs(extra.signed !== 0 ? extra.signed : extra.value);
  if (input.shear?.shearAxis === "MINOR_SHEAR") return shearValue(input);
  return 0;
}

export function detectRequiredInteractions(input: SteelCapacityEngineInput): SteelInteractionType[] {
  const n = axialValue(input);
  const mx = momentMajor(input);
  const my = momentMinor(input);
  const v = shearValue(input);
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
  for (const row of extras(input)) {
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

export function assertRevisionCompatibility(input: SteelCapacityEngineInput): void {
  const revisions = [
    input.designContext.provenanceRef.sourceRevision,
    ...(extras(input).map((row) => row.revision ?? null)),
    ...((input.combined?.componentCapacities ?? []).map((row) => row.revision ?? null)),
  ].filter((value): value is string => Boolean(value?.trim()));
  if (revisions.length === 0) return;
  const expected = revisions[0];
  if (revisions.some((value) => value !== expected)) {
    throw new Error("steel design fail closed: revision mismatch");
  }
}

export function componentAuthorityState(
  row: SteelCombinedCapacityComponent,
): "MECHANICS_REFERENCE" | "CODE_PROFILE_CAPACITY" {
  if (row.resultClass === "DESIGN_CAPACITY" || row.authorityState === "CODE_PROFILE_CAPACITY") {
    return "CODE_PROFILE_CAPACITY";
  }
  return "MECHANICS_REFERENCE";
}

export function assertMechanicsNotPromotedToCodeInteraction(capacities: readonly SteelCombinedCapacityComponent[]): void {
  if (MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_CODE_INTERACTION) {
    throw new Error("mechanics-reference capacity must not be treated as Eurocode interaction resistance");
  }
  for (const row of capacities) {
    if (row.authorityState === "MECHANICS_REFERENCE" && row.resultClass === "DESIGN_CAPACITY") {
      throw new Error("mechanics-reference capacity must not be treated as Eurocode interaction resistance");
    }
  }
}

export function mechanicsReferenceValidForCodeInteraction(capacities: readonly SteelCombinedCapacityComponent[]): boolean {
  if (MECHANICS_REFERENCE_AUTOMATICALLY_VALID_FOR_CODE_INTERACTION) return true;
  if (capacities.length === 0) return false;
  return capacities.every((row) => componentAuthorityState(row) === "CODE_PROFILE_CAPACITY");
}

export function componentUtilizations(input: SteelCapacityEngineInput, combinationRef: string): SteelComponentUtilizationVector {
  const capacities = input.combined?.componentCapacities ?? [];
  const extraAxial = extras(input).find((row) => row.kind === "AXIAL");
  const extraMajor = extras(input).find((row) => row.kind === "MOMENT_MAJOR");
  const extraMinor = extras(input).find((row) => row.kind === "MOMENT_MINOR");
  const extraShear = extras(input).find((row) => row.kind === "SHEAR");
  const extraShearMajor = extras(input).find((row) => row.kind === "SHEAR_MAJOR");
  const extraShearMinor = extras(input).find((row) => row.kind === "SHEAR_MINOR");
  const rows: SteelComponentUtilizationRow[] = [];
  const push = (
    kind: SteelComponentUtilizationRow["kind"],
    demandValue: number,
    demandUnit: string,
    capKind: SteelCombinedCapacityComponent["kind"],
  ): void => {
    if (!demandUnit?.trim()) throw new Error("steel design fail closed: invalid units");
    const cap = capacities.find((row) => row.kind === capKind);
    if (cap && cap.unit !== demandUnit) throw new Error("steel design fail closed: invalid units");
    rows.push({
      kind,
      demand: { value: Math.abs(demandValue), unit: demandUnit },
      capacity: cap ? { value: cap.value, unit: cap.unit } : null,
      ratio: cap && cap.value > 0 ? Math.abs(demandValue) / cap.value : null,
      informationalOnly: true,
    });
  };
  const n = axialValue(input);
  if (n !== 0) push("AXIAL", n, extraAxial?.unit ?? "N", n > 0 ? "TENSION" : "COMPRESSION");
  const mx = momentMajor(input);
  if (mx > 0) push("BENDING_MAJOR", mx, extraMajor?.unit ?? input.demand.moment.unit, "BENDING_MAJOR");
  if (extraMinor) {
    push("BENDING_MINOR", Math.abs(extraMinor.signed !== 0 ? extraMinor.signed : extraMinor.value), extraMinor.unit, "BENDING_MINOR");
  }
  const vMajor = extraShearMajor ? Math.abs(extraShearMajor.signed !== 0 ? extraShearMajor.signed : extraShearMajor.value) : 0;
  const vMinor = extraShearMinor ? Math.abs(extraShearMinor.signed !== 0 ? extraShearMinor.signed : extraShearMinor.value) : 0;
  if (vMajor > 0) push("SHEAR_MAJOR", vMajor, extraShearMajor!.unit, "SHEAR");
  if (vMinor > 0) push("SHEAR_MINOR", vMinor, extraShearMinor!.unit, "SHEAR");
  const v = extraShear
    ? Math.abs(extraShear.signed !== 0 ? extraShear.signed : extraShear.value)
    : (vMajor > 0 || vMinor > 0 ? 0 : shearValue(input));
  if (v > 0) push("SHEAR", v, extraShear?.unit ?? input.demand.shear.unit, "SHEAR");
  return { combinationRef, rows, equalsInteractionCheck: false };
}

export function assertAiCannotInventInteraction(equation: string | null, proposedBy: "AI" | "OPTIMIZER" | "HUMAN"): void {
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && equation) {
    throw new Error("AI cannot invent interaction equation");
  }
}

export function assertAiCannotChangeComponentResults(llmOriginatedCapacity: boolean): void {
  if (llmOriginatedCapacity) throw new Error("AI cannot change component results");
}

export function assertAiCannotCombineIncompatibleCases(proposedBy: "AI" | "OPTIMIZER" | "HUMAN", sameCombination: boolean): void {
  if ((proposedBy === "AI" || proposedBy === "OPTIMIZER") && !sameCombination) {
    throw new Error("AI cannot combine incompatible load cases");
  }
}
