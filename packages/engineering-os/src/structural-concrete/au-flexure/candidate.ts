import type { ConcreteMaterial, RcSectionGeometryInput, ReinforcementLayout, ReinforcementMaterial } from "@rtb/types";
import { GENERATIVE_AU_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK } from "@rtb/types";
import { screenGenerativeRcCandidate } from "../section-mechanics";
import { evaluateAuConcreteFlexure, type AuConcreteFlexureInput } from "./evaluate";

export function screenAuRcCandidate(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
}): { accepted: true } {
  if (GENERATIVE_AU_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK) {
    throw new Error("generative AU RC candidate cannot bypass deterministic recheck");
  }
  screenGenerativeRcCandidate(input);
  return { accepted: true };
}

export function evaluateAuRcCandidate(input: AuConcreteFlexureInput) {
  screenAuRcCandidate(input);
  const result = evaluateAuConcreteFlexure(input);
  if (result.checkState === "CHECK_UNDETERMINED" && input.methodId.includes("AS3600")) {
    return result;
  }
  return result;
}
