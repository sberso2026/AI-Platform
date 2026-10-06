import type { EurocodeConcreteCalculationContext, RcSectionGeometryInput, ReinforcementLayout } from "@rtb/types";
import {
  EU_CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED,
  GENERATIVE_MODEL_SELECTS_NATIONAL_ANNEX,
  GENERATIVE_MODEL_SELECTS_NDP,
} from "@rtb/types";
import { screenGenerativeRcCandidate } from "../section-mechanics/candidate";
import { rcSectionMtoHandoff } from "../section-mechanics/handoff";
import type { ConcreteMaterial, ReinforcementMaterial } from "@rtb/types";
import { denyAiEuConcreteNationalAnnexChoice, denyAiEuConcreteNdpSupply } from "./authority";

export function assertEuConcreteInverseDesignContext(context: EurocodeConcreteCalculationContext | null): void {
  if (!context) throw new Error("EU concrete inverse-design candidate must bind an explicit Eurocode concrete standard context");
  if (GENERATIVE_MODEL_SELECTS_NATIONAL_ANNEX) denyAiEuConcreteNationalAnnexChoice();
  if (GENERATIVE_MODEL_SELECTS_NDP) denyAiEuConcreteNdpSupply();
}

export function screenEuRcCandidate(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  standardContext: EurocodeConcreteCalculationContext;
  generativeSelectedAnnex?: boolean;
  generativeSelectedNdp?: boolean;
}): { accepted: true; fingerprintReady: true } {
  assertEuConcreteInverseDesignContext(input.standardContext);
  if (input.generativeSelectedAnnex) denyAiEuConcreteNationalAnnexChoice();
  if (input.generativeSelectedNdp) denyAiEuConcreteNdpSupply();
  return screenGenerativeRcCandidate({
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
  });
}

export function assertEuConcreteOptimizerRejectsUndetermined(checkState: string): void {
  if (!EU_CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED && checkState === "CHECK_UNDETERMINED") {
    throw new Error("EU concrete optimizer cannot accept CHECK_UNDETERMINED as design-valid");
  }
}

export function euConcreteMtoHandoff(input: { geometry: RcSectionGeometryInput; layout: ReinforcementLayout }) {
  return rcSectionMtoHandoff(input);
}
