import type { SteelServiceabilityResult, USSteelServiceabilityContext } from "@rtb/types";
import { US_SERVICEABILITY_DEFLECTION_ENGINE_DUPLICATED } from "@rtb/types";
import { evaluateAuSteelServiceability, type ServiceabilityDemand } from "../au-member/serviceability";

export type { ServiceabilityDemand };

export function evaluateUsSteelServiceability(input: {
  memberRef: string;
  standardProfileRef: string;
  context: USSteelServiceabilityContext | null;
  demand: ServiceabilityDemand | null;
  directContractProfile: boolean;
}): SteelServiceabilityResult | null {
  if (US_SERVICEABILITY_DEFLECTION_ENGINE_DUPLICATED) throw new Error("US must not duplicate the D1C deflection engine");
  if (!input.context && !input.demand) return null;
  const missingAmendment = Boolean(input.context?.criterionRequiresLocalAmendment && !input.context.localAmendmentSetRef);
  const missingBuildingCode = Boolean(
    input.context?.criterionRequiresBuildingCode
    && !input.directContractProfile
    && !input.context.buildingCodeContextRef,
  );
  if (missingAmendment || missingBuildingCode) {
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
      reason: missingAmendment ? "LOCAL_AMENDMENT_REQUIRED" : "BUILDING_CODE_CONTEXT_REQUIRED",
      technicalBasisRef: input.context?.technicalBasisRef ?? "us-serviceability-context",
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
