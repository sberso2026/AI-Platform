import type { EurocodeSteelServiceabilityContext, SteelServiceabilityResult } from "@rtb/types";
import { DEFAULT_EU_NATIONAL_ANNEX, EU_SERVICEABILITY_DEFLECTION_ENGINE_DUPLICATED } from "@rtb/types";
import { denyNationalAnnexFromUserLocation } from "../eu-standard/authority";
import { evaluateAuSteelServiceability, type ServiceabilityDemand } from "../au-member/serviceability";

export type { ServiceabilityDemand };

export function evaluateEuSteelServiceability(input: {
  memberRef: string;
  standardProfileRef: string;
  context: EurocodeSteelServiceabilityContext | null;
  demand: ServiceabilityDemand | null;
}): SteelServiceabilityResult | null {
  if (EU_SERVICEABILITY_DEFLECTION_ENGINE_DUPLICATED) throw new Error("EU must not duplicate the D1C deflection engine");
  if (DEFAULT_EU_NATIONAL_ANNEX) throw new Error("a default EU National Annex is forbidden");
  denyNationalAnnexFromUserLocation("explicit");
  if (!input.context && !input.demand) return null;
  const missingAnnex = Boolean(input.context?.criterionRequiresAnnex && !input.context.nationalAnnexRef);
  const missingNdp = Boolean(input.context?.criterionRequiresNdp && (input.context.ndpRefs.length === 0 || !input.context.nationalAnnexRef));
  if (missingAnnex || missingNdp) {
    return {
      resultId: `${input.memberRef}:DEFLECTION`,
      memberRef: input.memberRef,
      demandRef: input.demand?.resultId ?? input.context?.serviceabilityDemandRef ?? null,
      criterionRef: input.context?.criterionRef ?? null,
      criterionSource: input.context?.criterionSource ?? null,
      loadContextRef: input.context?.loadCaseOrCombinationRef ?? input.demand?.combinationId ?? null,
      actualValue: null,
      actualUnits: null,
      allowableValue: null,
      allowableUnits: null,
      ratio: null,
      checkState: "CHECK_UNDETERMINED",
      reason: missingAnnex || !input.context?.nationalAnnexRef ? "NATIONAL_ANNEX_REQUIRED" : "NDP_REQUIRED",
      technicalBasisRef: input.context?.technicalBasisRef ?? "eu-serviceability-annex-ndp",
      standardProfileRef: input.standardProfileRef,
      standardConformanceState: "INTENDED_PROFILE",
      provenanceRef: input.context?.provenanceRef ?? null,
      humanReviewState: "required",
    };
  }
  return evaluateAuSteelServiceability({
    memberRef: input.memberRef,
    standardProfileRef: input.standardProfileRef,
    context: input.context,
    demand: input.demand,
  });
}
