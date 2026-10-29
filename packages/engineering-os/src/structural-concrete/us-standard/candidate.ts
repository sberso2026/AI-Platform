import type { ConcreteMaterial, RcSectionGeometryInput, ReinforcementLayout, ReinforcementMaterial, UsConcreteCalculationContext } from "@rtb/types";
import {
  GENERATIVE_MODEL_SELECTS_ACI_EDITION,
  GENERATIVE_MODEL_SELECTS_BUILDING_CODE,
  GENERATIVE_MODEL_SELECTS_LOAD_STANDARD_EDITION,
  GENERATIVE_MODEL_SELECTS_LOCAL_AMENDMENT,
  US_CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED,
} from "@rtb/types";
import { consumeConcreteDemandHandoff } from "../orchestration";
import { screenGenerativeRcCandidate } from "../section-mechanics/candidate";
import { rcSectionMtoHandoff } from "../section-mechanics/handoff";
import {
  denyAiAci318EditionChoice,
  denyAiBuildingCodeAdoption,
  denyAiLoadStandardEdition,
  denyAiUsConcreteLocalAmendment,
} from "./authority";

export function assertUsConcreteInverseDesignContext(context: UsConcreteCalculationContext | null): void {
  if (!context) throw new Error("US concrete inverse-design candidate must bind an explicit US concrete standard context");
  if (GENERATIVE_MODEL_SELECTS_ACI_EDITION) denyAiAci318EditionChoice();
  if (GENERATIVE_MODEL_SELECTS_BUILDING_CODE) denyAiBuildingCodeAdoption();
  if (GENERATIVE_MODEL_SELECTS_LOCAL_AMENDMENT) denyAiUsConcreteLocalAmendment();
  if (GENERATIVE_MODEL_SELECTS_LOAD_STANDARD_EDITION) denyAiLoadStandardEdition();
}

export function screenUsRcCandidate(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concrete: ConcreteMaterial;
  reinforcement: ReinforcementMaterial;
  standardContext: UsConcreteCalculationContext;
  generativeSelectedAciEdition?: boolean;
  generativeSelectedBuildingCode?: boolean;
  generativeSelectedAmendment?: boolean;
}): { accepted: true; fingerprintReady: true } {
  assertUsConcreteInverseDesignContext(input.standardContext);
  if (input.generativeSelectedAciEdition) denyAiAci318EditionChoice();
  if (input.generativeSelectedBuildingCode) denyAiBuildingCodeAdoption();
  if (input.generativeSelectedAmendment) denyAiUsConcreteLocalAmendment();
  return screenGenerativeRcCandidate({
    geometry: input.geometry,
    layout: input.layout,
    concrete: input.concrete,
    reinforcement: input.reinforcement,
  });
}

export function assertUsConcreteOptimizerRejectsUndetermined(checkState: string): void {
  if (!US_CONCRETE_OPTIMIZATION_ACCEPTS_UNDETERMINED && checkState === "CHECK_UNDETERMINED") {
    throw new Error("US concrete optimizer cannot accept CHECK_UNDETERMINED as design-valid");
  }
}

export function usConcreteMtoHandoff(input: { geometry: RcSectionGeometryInput; layout: ReinforcementLayout }) {
  return rcSectionMtoHandoff(input);
}

export function assertUsConcreteReusesD1cDemand(demand: Parameters<typeof consumeConcreteDemandHandoff>[0]): string {
  return consumeConcreteDemandHandoff(demand);
}
