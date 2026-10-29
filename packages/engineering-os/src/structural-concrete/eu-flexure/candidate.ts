import type { ConcreteMaterial, EuConcreteResolverInput, RcSectionGeometryInput, ReinforcementLayout, ReinforcementMaterial } from "@rtb/types";
import { GENERATIVE_EU_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK, GENERATIVE_OPTIMIZER_CAN_CHANGE_EU_STANDARD_CONTEXT } from "@rtb/types";
import { screenEuRcCandidate } from "../eu-standard/candidate";
import { resolveEurocodeConcreteContext } from "../eu-standard/resolver";
import { assertGenerativeCannotChangeStandardContext } from "./authority";
import { evaluateEuConcreteFlexure, type EuConcreteFlexureInput } from "./evaluate";

export function screenEuFlexureCandidate(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  resolverInput: EuConcreteResolverInput;
  generativeSelectedAnnex?: boolean;
  generativeSelectedNdp?: boolean;
  generativeAttemptedStandardContextChange?: boolean;
}): { accepted: true } {
  if (GENERATIVE_EU_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK) {
    throw new Error("generative EU RC candidate cannot bypass deterministic recheck");
  }
  assertGenerativeCannotChangeStandardContext(input.generativeAttemptedStandardContextChange === true || GENERATIVE_OPTIMIZER_CAN_CHANGE_EU_STANDARD_CONTEXT);
  const resolved = resolveEurocodeConcreteContext(input.resolverInput);
  if (!resolved.ok) throw new Error(`EU concrete flexure fail closed: ${resolved.failReason}`);
  screenEuRcCandidate({
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    standardContext: resolved.context,
    generativeSelectedAnnex: input.generativeSelectedAnnex,
    generativeSelectedNdp: input.generativeSelectedNdp,
  });
  return { accepted: true };
}

export function evaluateEuRcCandidate(input: EuConcreteFlexureInput) {
  screenEuFlexureCandidate(input);
  return evaluateEuConcreteFlexure(input);
}
