import type {
  SteelCheckVerdict,
  SteelDesignCheckOutcome,
  SteelDesignContext,
  SteelLimitState,
  SteelOptimizationCandidate,
  SteelUtilizationComposition,
  StructuralDemandResult,
} from "@rtb/types";
import {
  AI_ENGINEERING_APPROVAL,
  CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL,
  LLM_STEEL_CAPACITY_AUTHORITY,
  OPTIMIZATION_REQUIRES_DETERMINISTIC_RECHECK,
  UNIVERSAL_INTERACTION_EQUATION_HARDCODED,
} from "@rtb/types";
import { evaluateSteelCapacity } from "./adapters";
import type { SteelCapacityEngineInput } from "@rtb/types";

export function simpleUtilization(input: {
  declaredValid: boolean;
  demand: { value: number; unit: string };
  capacity: { value: number; unit: string } | null;
}): SteelUtilizationComposition {
  if (!input.declaredValid) {
    throw new Error("complex interaction requires a standard adapter; simple D/C is not universally valid");
  }
  if (UNIVERSAL_INTERACTION_EQUATION_HARDCODED) throw new Error("universal interaction equation is forbidden");
  if (!input.capacity) {
    return { simpleUtilizationValid: true, demand: input.demand, capacity: null, ratio: null };
  }
  if (input.demand.unit !== input.capacity.unit) throw new Error("steel design fail closed: units incompatible");
  if (!(input.capacity.value > 0)) throw new Error("steel design fail closed: capacity must be positive");
  return {
    simpleUtilizationValid: true,
    demand: input.demand,
    capacity: input.capacity,
    ratio: input.demand.value / input.capacity.value,
  };
}

export function verdictFromUtilization(ratio: number | null): SteelCheckVerdict {
  if (ratio == null) return "CHECK_UNDETERMINED";
  return ratio <= 1 ? "CHECK_SATISFIED" : "CHECK_NOT_SATISFIED";
}

export function orchestrateSteelDesignCheck(input: {
  designCheckId: string;
  limitState: SteelLimitState;
  designContext: SteelDesignContext;
  capacityInput: SteelCapacityEngineInput;
  simpleUtilizationValid: boolean;
  demandValue: { value: number; unit: string };
}): SteelDesignCheckOutcome {
  if (LLM_STEEL_CAPACITY_AUTHORITY) throw new Error("LLM must not originate steel capacity");
  if (AI_ENGINEERING_APPROVAL || CHECK_RESULT_EQUALS_ENGINEERING_APPROVAL) {
    throw new Error("check result must not equal engineering approval");
  }
  if (!input.designContext.demandRefs.includes(input.capacityInput.demand.resultId)) {
    throw new Error("steel design fail closed: demand missing from design context");
  }
  if (input.limitState === "COMBINED_ACTION" && input.simpleUtilizationValid) {
    throw new Error("complex interaction requires a standard adapter");
  }
  const capacity = evaluateSteelCapacity(input.capacityInput);
  const utilization = input.simpleUtilizationValid
    ? simpleUtilization({
      declaredValid: true,
      demand: input.demandValue,
      capacity: capacity.capacity && capacity.capacity.value != null && capacity.capacity.units
        ? { value: capacity.capacity.value, unit: capacity.capacity.units }
        : null,
    })
    : null;
  const verdict = verdictFromUtilization(utilization?.ratio ?? null);
  return {
    designCheck: {
      designCheckId: input.designCheckId,
      demandRef: input.capacityInput.demand.resultId,
      capacityRef: capacity.capacity?.capacityResultId ?? null,
      checkType: input.limitState,
      approvalState: "not_approved",
      reviewState: "required",
      validationState: capacity.maturity,
    },
    verdict,
    utilization,
    interactionRequiresAdapter: input.limitState === "COMBINED_ACTION",
    humanReviewRequired: true,
    engineeringApproved: false,
  };
}

export function orchestrateAuTensionDesignCheck(input: {
  designCheckId: string;
  designContext: SteelDesignContext;
  capacityInput: SteelCapacityEngineInput;
}): SteelDesignCheckOutcome {
  if (input.capacityInput.adapterId !== "AU_STEEL" || input.capacityInput.limitState !== "TENSION") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  const axial = input.capacityInput.demand.axial;
  if ("status" in axial && axial.status === "NO_AXIAL_COMPONENTS") {
    throw new Error("steel design fail closed: demand missing");
  }
  const demandN = axial.valueN;
  const tensileDemand = demandN > 0;
  return orchestrateSteelDesignCheck({
    designCheckId: input.designCheckId,
    limitState: "TENSION",
    designContext: input.designContext,
    capacityInput: input.capacityInput,
    simpleUtilizationValid: tensileDemand,
    demandValue: { value: demandN, unit: "N" },
  });
}

export function orchestrateAuCompressionDesignCheck(input: {
  designCheckId: string;
  designContext: SteelDesignContext;
  capacityInput: SteelCapacityEngineInput;
}): SteelDesignCheckOutcome {
  if (input.capacityInput.adapterId !== "AU_STEEL") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  if (input.capacityInput.limitState !== "COMPRESSION" && input.capacityInput.limitState !== "MEMBER_STABILITY") {
    throw new Error("steel design fail closed: unsupported calculation scope");
  }
  const axial = input.capacityInput.demand.axial;
  if ("status" in axial && axial.status === "NO_AXIAL_COMPONENTS") {
    throw new Error("steel design fail closed: demand missing");
  }
  const compressionDemandN = axial.valueN < 0 ? Math.abs(axial.valueN) : 0;
  const outcome = orchestrateSteelDesignCheck({
    designCheckId: input.designCheckId,
    limitState: input.capacityInput.limitState,
    designContext: input.designContext,
    capacityInput: input.capacityInput,
    simpleUtilizationValid: compressionDemandN > 0,
    demandValue: { value: compressionDemandN, unit: "N" },
  });
  return {
    ...outcome,
    verdict: "CHECK_UNDETERMINED",
    designCheck: {
      ...outcome.designCheck,
      approvalState: "not_approved",
      validationState: outcome.designCheck.validationState,
    },
  };
}

export function consumeDemandHandoff(demand: Pick<StructuralDemandResult, "resultId" | "capacityPresent" | "memberId">): string {
  if (demand.capacityPresent) throw new Error("D1C demand must not contain capacity");
  if (!demand.resultId) throw new Error("steel design fail closed: demand missing");
  return demand.resultId;
}

export function assertOptimizationCandidateRecheck(candidate: SteelOptimizationCandidate): void {
  if (!OPTIMIZATION_REQUIRES_DETERMINISTIC_RECHECK) throw new Error("optimization candidates must be rechecked deterministically");
  if (!candidate.deterministicRecheckRequired) throw new Error("optimization candidates must be rechecked deterministically");
  if (!candidate.rechecked) throw new Error("candidate optimization section requires deterministic recheck");
}

export function assertLlmCannotOriginateCapacity(llmOriginated: boolean): void {
  if (llmOriginated || LLM_STEEL_CAPACITY_AUTHORITY) throw new Error("AI cannot originate capacity");
}

export const AU_STEEL_IMPLEMENTATION_SUBPHASES = [
  "AU-1 validated material/section identity and bounded tension capacity with licensed AS 4100 authority",
  "AU-2 compression / member stability with explicit effective length",
  "AU-3 bending / member stability including LTB inputs",
  "AU-4 shear",
  "AU-5 combined actions (AS 4100 interaction, not a universal D/C)",
  "AU-6 serviceability criteria referencing D1C deflection + design orchestration",
  "AU-7 independent certification gate (handbook/worked example + human validation)",
] as const;

export const EU_STEEL_IMPLEMENTATION_SUBPHASES = [
  "EU-1 EN 1993 adapter + National Annex parameter bind (no formulas)",
  "EU-2 tension",
  "EU-3 compression / buckling curves as annex-selected parameters",
  "EU-4 bending / LTB",
  "EU-5 shear",
  "EU-6 combined actions (EN interaction, annex-driven)",
  "EU-7 independent certification gate",
] as const;

export const US_STEEL_IMPLEMENTATION_SUBPHASES = [
  "US-1 AISC 360 adapter + LRFD/ASD method selection (explicit, not inferred)",
  "US-2 tension",
  "US-3 compression / member stability",
  "US-4 bending / LTB",
  "US-5 shear",
  "US-6 combined actions (AISC interaction, not a universal D/C)",
  "US-7 independent certification gate",
] as const;
