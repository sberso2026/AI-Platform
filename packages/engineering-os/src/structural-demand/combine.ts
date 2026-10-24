import type { StructuralBoundCombinationFactor, StructuralLoadCombination, StructuralLoadFactorProviderRequest, StructuralLoadFactorProviderResult } from "@rtb/types";
import { GENERIC_ENGINE_HARDCODES_CODE_FACTORS } from "@rtb/types";

export function provideLoadFactors(request: StructuralLoadFactorProviderRequest): StructuralLoadFactorProviderResult {
  if (GENERIC_ENGINE_HARDCODES_CODE_FACTORS) {
    throw new Error("generic combination engine must not hard-code code factors");
  }
  if (request.packId === "NEUTRAL") {
    return {
      packId: "NEUTRAL",
      implemented: true,
      maturity: "IMPLEMENTED",
      factors: [],
      reason: "Neutral engine evaluates already-bound factors only; it does not invent jurisdiction factors.",
    };
  }
  return {
    packId: request.packId,
    implemented: false,
    maturity: "FRAMEWORK_ONLY",
    factors: [],
    reason: `${request.packId} load-combination factors remain a jurisdiction-pack adapter. D1C does not implement ${request.standardCode ?? "code"} factors.`,
  };
}

export function boundFactorsFromCombination(combination: Pick<StructuralLoadCombination, "combinationId" | "components">): StructuralBoundCombinationFactor[] {
  return combination.components.map((row) => {
    if (row.factor == null || !Number.isFinite(row.factor)) {
      throw new Error("governed combination is malformed: factor must be bound before evaluation");
    }
    return {
      loadCaseId: row.loadCaseId,
      factor: row.factor,
      provenanceRef: combination.combinationId,
      source: "HUMAN_ENTERED",
    };
  });
}

export function scaleByFactor(magnitude: number, factor: number): number {
  if (!Number.isFinite(factor)) throw new Error("governed combination is malformed: factor must be finite");
  return magnitude * factor;
}

export const LOAD_FACTOR_PACK_INTERFACES = {
  AU: { packId: "AU" as const, standardCodes: ["AS/NZS 1170"], ready: true, implemented: false },
  EU: { packId: "EU" as const, standardCodes: ["EN 1990"], ready: true, implemented: false, nationalAnnexRequiredWhenApplicable: true },
  US: { packId: "US" as const, standardCodes: ["ASCE 7"], ready: true, implemented: false },
};
