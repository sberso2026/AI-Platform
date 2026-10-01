import type { LifecycleStage } from "../lifecycle-intelligence/types";
import { DEFAULT_WORK_TYPE_FOR_STAGE } from "./journeys";

export type LifecycleEmptyState = {
  title: string;
  explanation: string;
  actionLabel: string;
  workType: string;
  lifecycleStage: LifecycleStage;
};

const LABELS: Record<LifecycleStage, string> = {
  CONCEPT: "Concept",
  PREFEASIBILITY: "Prefeasibility",
  FEASIBILITY: "Feasibility",
  FEED: "FEED",
  DETAILED_DESIGN: "Detailed Design",
  CONSTRUCTION: "Construction",
  COMMISSIONING: "Commissioning",
  OPERATIONS: "Operations",
  MODIFICATION: "Modification",
};

export function lifecycleEmptyState(stage: LifecycleStage | "UNKNOWN", systemLabel = "this system"): LifecycleEmptyState {
  const resolved: LifecycleStage = stage === "UNKNOWN" ? "FEED" : stage;
  const label = LABELS[resolved];
  return {
    title: `No ${label} Work Plan exists for ${systemLabel}.`,
    explanation: `Start ${label} engineering work using inherited project context. EOS will not ask you to re-enter project, system, or prior decisions that already exist.`,
    actionLabel: `Start ${label} Engineering Work`,
    workType: DEFAULT_WORK_TYPE_FOR_STAGE[resolved],
    lifecycleStage: resolved,
  };
}

export function blockedWorkExplanation(input: {
  workType: string;
  lifecycleStage: string;
  whyBlocked: string | null;
  missingTitle?: string | null;
}): { explanation: string; next: Array<{ code: string; label: string }> } {
  const missing = input.missingTitle ?? "required governing information";
  const explanation =
    input.whyBlocked ??
    `${input.lifecycleStage.replaceAll("_", " ")} ${input.workType.replaceAll("_", " ")} cannot start because ${missing} is not accepted for design input.`;
  const next = [
    { code: "OPEN_INFORMATION", label: "Open Information" },
    { code: "REQUEST_UPDATE", label: "Request Update" },
  ];
  if (/CONCEPT|PREFEASIBILITY|FEASIBILITY/i.test(input.lifecycleStage)) {
    next.push({ code: "CREATE_ASSUMPTION", label: "Create Assumption" });
  }
  return { explanation, next };
}
