import type { SteelServiceabilityContext, SteelServiceabilityResult, StructuralDemandResult } from "@rtb/types";
import {
  DEFAULT_DEFLECTION_LIMIT_GUESSED,
  SPAN_RATIO_DENOMINATOR_GUESSED,
  STEEL_SERVICEABILITY_CRITERION_SOURCES,
  ULTIMATE_DEMAND_USED_AS_SERVICEABILITY_BY_DEFAULT,
} from "@rtb/types";

export type ServiceabilityDemand = Pick<
  StructuralDemandResult,
  "resultId" | "memberId" | "deflection" | "combinationId" | "capacityPresent"
>;

function toMetres(value: number, unit: string, label: string): number {
  if (!unit?.trim() || !Number.isFinite(value)) throw new Error("steel design fail closed: invalid units");
  if (unit === "m") return value;
  if (unit === "mm") return value / 1000;
  throw new Error(`steel design fail closed: invalid units (${label})`);
}

export function evaluateAuSteelServiceability(input: {
  memberRef: string;
  standardProfileRef: string;
  context: SteelServiceabilityContext | null;
  demand: ServiceabilityDemand | null;
}): SteelServiceabilityResult | null {
  if (DEFAULT_DEFLECTION_LIMIT_GUESSED || SPAN_RATIO_DENOMINATOR_GUESSED) {
    throw new Error("default deflection criterion must not be guessed");
  }
  if (ULTIMATE_DEMAND_USED_AS_SERVICEABILITY_BY_DEFAULT) {
    throw new Error("ultimate demand must not be used as serviceability by default");
  }
  if (!input.context && !input.demand) return null;
  const context = input.context;
  if (context && context.memberRef !== input.memberRef) {
    throw new Error("steel design fail closed: demand member does not match design context");
  }
  if (input.demand && input.demand.memberId !== input.memberRef) {
    throw new Error("steel design fail closed: demand member does not match design context");
  }
  if (input.demand?.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (context?.criterionSource && !(STEEL_SERVICEABILITY_CRITERION_SOURCES as readonly string[]).includes(context.criterionSource)) {
    throw new Error("steel design fail closed: unsupported serviceability criterion source");
  }
  if (input.demand && context?.loadCaseOrCombinationRef && input.demand.combinationId && context.loadCaseOrCombinationRef !== input.demand.combinationId) {
    throw new Error("steel design fail closed: incompatible load combination");
  }
  const base = {
    resultId: `${input.memberRef}:DEFLECTION`,
    memberRef: input.memberRef,
    demandRef: input.demand?.resultId ?? context?.serviceabilityDemandRef ?? null,
    criterionRef: context?.criterionRef ?? null,
    criterionSource: context?.criterionSource ?? null,
    loadContextRef: context?.loadCaseOrCombinationRef ?? input.demand?.combinationId ?? null,
    actualValue: null as number | null,
    actualUnits: null as string | null,
    allowableValue: null as number | null,
    allowableUnits: null as string | null,
    ratio: null as number | null,
    technicalBasisRef: "governed-serviceability-criterion",
    standardProfileRef: input.standardProfileRef,
    standardConformanceState: "INTENDED_PROFILE" as const,
    provenanceRef: context?.provenanceRef ?? null,
    humanReviewState: "required" as const,
  };
  if (!input.demand || "status" in input.demand.deflection) {
    return {
      ...base,
      checkState: "CHECK_UNDETERMINED",
      reason: "SERVICEABILITY_DEMAND_REQUIRED",
    };
  }
  if (!context?.criterionRef || context.criterionType == null || context.criterionValue == null || !context.criterionUnits || !context.criterionSource) {
    return {
      ...base,
      actualValue: Math.abs(input.demand.deflection.signed !== 0 ? input.demand.deflection.signed : input.demand.deflection.value),
      actualUnits: input.demand.deflection.unit,
      checkState: "CHECK_UNDETERMINED",
      reason: "SERVICEABILITY_CRITERION_REQUIRED",
    };
  }
  const actualM = toMetres(
    Math.abs(input.demand.deflection.signed !== 0 ? input.demand.deflection.signed : input.demand.deflection.value),
    input.demand.deflection.unit,
    "deflection",
  );
  let allowableM: number;
  if (context.criterionType === "ABSOLUTE_DISPLACEMENT") {
    allowableM = toMetres(context.criterionValue, context.criterionUnits, "absolute deflection limit");
  } else if (context.criterionType === "SPAN_RATIO") {
    if (!(context.spanM != null && context.spanM > 0)) throw new Error("steel design fail closed: missing span for span-ratio criterion");
    if (context.criterionUnits !== "1") throw new Error("steel design fail closed: invalid units");
    if (!(context.criterionValue > 0)) throw new Error("steel design fail closed: missing span-ratio denominator");
    allowableM = context.spanM / context.criterionValue;
  } else {
    return { ...base, checkState: "CHECK_UNDETERMINED", reason: "SERVICEABILITY_CRITERION_REQUIRED" };
  }
  if (!(allowableM > 0)) throw new Error("steel design fail closed: capacity must be positive");
  const ratio = actualM / allowableM;
  return {
    ...base,
    actualValue: actualM,
    actualUnits: "m",
    allowableValue: allowableM,
    allowableUnits: "m",
    ratio,
    checkState: ratio <= 1 ? "CHECK_SATISFIED" : "CHECK_NOT_SATISFIED",
    reason: ratio <= 1 ? "deterministic check satisfied" : "deterministic check not satisfied",
    technicalBasisRef: context.criterionRef,
  };
}
