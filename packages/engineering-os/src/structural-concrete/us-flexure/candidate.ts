import type { ConcreteMaterial, RcSectionGeometryInput, ReinforcementLayout, ReinforcementMaterial, UsConcreteResolverInput } from "@rtb/types";
import { GENERATIVE_OPTIMIZER_CAN_CHANGE_US_STANDARD_CONTEXT, GENERATIVE_US_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK } from "@rtb/types";
import { screenUsRcCandidate } from "../us-standard/candidate";
import { resolveUsConcreteContext } from "../us-standard/resolver";
import { assertUsGenerativeCannotChangeStandardContext } from "./authority";
import { evaluateUsConcreteFlexure, type UsConcreteFlexureInput } from "./evaluate";

export function screenUsFlexureCandidate(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  resolverInput: UsConcreteResolverInput;
  generativeSelectedAciEdition?: boolean;
  generativeSelectedBuildingCode?: boolean;
  generativeSelectedAmendment?: boolean;
  generativeAttemptedStandardContextChange?: boolean;
}): { accepted: true } {
  if (GENERATIVE_US_RC_CANDIDATE_BYPASSES_DETERMINISTIC_RECHECK) {
    throw new Error("generative US RC candidate cannot bypass deterministic recheck");
  }
  assertUsGenerativeCannotChangeStandardContext(input.generativeAttemptedStandardContextChange === true || GENERATIVE_OPTIMIZER_CAN_CHANGE_US_STANDARD_CONTEXT);
  const resolved = resolveUsConcreteContext(input.resolverInput);
  if (!resolved.ok) throw new Error(`US concrete flexure fail closed: ${resolved.failReason}`);
  screenUsRcCandidate({
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
    standardContext: resolved.context,
    generativeSelectedAciEdition: input.generativeSelectedAciEdition,
    generativeSelectedBuildingCode: input.generativeSelectedBuildingCode,
    generativeSelectedAmendment: input.generativeSelectedAmendment,
  });
  return { accepted: true };
}

export function evaluateUsRcCandidate(input: UsConcreteFlexureInput) {
  screenUsFlexureCandidate(input);
  return evaluateUsConcreteFlexure(input);
}
