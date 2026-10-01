import type { LifecycleStage } from "../lifecycle-intelligence/types";

export function lifecycleTaskLabel(stage: LifecycleStage | "UNKNOWN"): { title: string; action: string } {
  if (stage === "CONCEPT" || stage === "PREFEASIBILITY") return { title: "Review assumption", action: "Review assumption" };
  if (stage === "FEASIBILITY") return { title: "Review technical constraint", action: "Review information" };
  if (stage === "FEED") return { title: "Review vendor input", action: "Review information" };
  if (stage === "DETAILED_DESIGN") return { title: "Run Pre-Issue Review", action: "Run Pre-Issue Review" };
  if (stage === "CONSTRUCTION") return { title: "Prepare RFI response", action: "Prepare RFI/TQ response" };
  if (stage === "COMMISSIONING") return { title: "Assess test deviation", action: "Assess commissioning query" };
  if (stage === "OPERATIONS") return { title: "Provide missing final information", action: "Prepare handover" };
  if (stage === "MODIFICATION") return { title: "Assess design change", action: "Assess change" };
  return { title: "Continue engineering work", action: "Open work" };
}
