import type { LifecycleStage } from "../lifecycle-intelligence/types";

export type LifecycleImpactFocus =
  | "CONCEPT_OPTION"
  | "DISCIPLINE_INTERFACE_DELIVERABLE"
  | "ANALYSIS_CALCULATION_DRAWING"
  | "FIELD_CONFIGURATION"
  | "TEST_CONFIGURATION_HANDOVER";

const FOCUS: Record<LifecycleStage, LifecycleImpactFocus> = {
  CONCEPT: "CONCEPT_OPTION",
  PREFEASIBILITY: "CONCEPT_OPTION",
  FEASIBILITY: "DISCIPLINE_INTERFACE_DELIVERABLE",
  FEED: "DISCIPLINE_INTERFACE_DELIVERABLE",
  DETAILED_DESIGN: "ANALYSIS_CALCULATION_DRAWING",
  CONSTRUCTION: "FIELD_CONFIGURATION",
  COMMISSIONING: "TEST_CONFIGURATION_HANDOVER",
  OPERATIONS: "TEST_CONFIGURATION_HANDOVER",
  MODIFICATION: "ANALYSIS_CALCULATION_DRAWING",
};

export function impactFocusForStage(stage: LifecycleStage | "UNKNOWN"): LifecycleImpactFocus {
  if (stage === "UNKNOWN") return "DISCIPLINE_INTERFACE_DELIVERABLE";
  return FOCUS[stage];
}

export function impactPresentationLabel(stage: LifecycleStage | "UNKNOWN"): string {
  const focus = impactFocusForStage(stage);
  if (focus === "CONCEPT_OPTION") return "Concept / option impact";
  if (focus === "ANALYSIS_CALCULATION_DRAWING") return "Analysis / calculation / drawing impact";
  if (focus === "FIELD_CONFIGURATION") return "Field / configuration impact";
  if (focus === "TEST_CONFIGURATION_HANDOVER") return "Test / configuration / handover impact";
  return "Discipline / interface / deliverable impact";
}
