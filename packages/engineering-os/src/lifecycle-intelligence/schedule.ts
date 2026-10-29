import { LIFECYCLE_STAGES, type LifecycleScheduleMapping, type LifecycleStage, type ScheduleAlignment } from "./types";

const LEGACY_PHASE_EXPECTATION: Record<string, LifecycleStage> = {
  concept: "CONCEPT",
  prefeasibility: "PREFEASIBILITY",
  feasibility: "FEASIBILITY",
  feed: "FEED",
  design: "FEED",
  detailed_design: "DETAILED_DESIGN",
  procurement: "DETAILED_DESIGN",
  construction: "CONSTRUCTION",
  commissioning: "COMMISSIONING",
  operations: "OPERATIONS",
  modification: "MODIFICATION",
  decommissioning: "OPERATIONS",
};

export function expectedStageFromLegacyProjectPhase(phase: string | null | undefined): LifecycleStage | null {
  if (!phase) return null;
  return LEGACY_PHASE_EXPECTATION[phase.toLowerCase()] ?? null;
}

function rank(stage: LifecycleStage | "UNKNOWN"): number {
  if (stage === "UNKNOWN") return -1;
  return LIFECYCLE_STAGES.indexOf(stage);
}

export function alignScheduleToLifecycle(input: {
  lifecycleStage: LifecycleStage | "UNKNOWN";
  mappings: readonly LifecycleScheduleMapping[];
}): ScheduleAlignment {
  const active = input.mappings.filter((row) => row.active);
  if (!active.length) {
    return {
      lifecycleStage: input.lifecycleStage,
      state: "UNMAPPED",
      explanation: "No governed Project Controls mappings are configured. Schedule does not define Engineering lifecycle authority.",
      mappings: [],
      scheduleAuthority: false,
    };
  }
  const expected = [...new Set(active.map((row) => row.expectedLifecycleStage))];
  const current = input.lifecycleStage;
  let state: ScheduleAlignment["state"] = "UNKNOWN";
  if (current === "UNKNOWN") state = "UNKNOWN";
  else if (expected.length > 1) state = "OVERLAPPING";
  else if (expected[0] === current) state = "ALIGNED";
  else if (rank(expected[0]!) > rank(current)) state = "AHEAD_OF_LIFECYCLE";
  else state = "BEHIND_LIFECYCLE";

  const explanation =
    state === "ALIGNED"
      ? "Mapped Project Controls context matches the Engineering lifecycle stage. Schedule remains non-authoritative."
      : state === "AHEAD_OF_LIFECYCLE"
        ? "Schedule context is ahead of the Engineering lifecycle stage. This is advisory. It does not approve a gate or transition the stage."
        : state === "BEHIND_LIFECYCLE"
          ? "Schedule context is behind the Engineering lifecycle stage. This is advisory only."
          : state === "OVERLAPPING"
            ? "Multiple mapped schedule activities span more than one expected lifecycle stage. Overlap is allowed and is not an error."
            : "Schedule alignment could not be determined from the mapping set.";

  return {
    lifecycleStage: current,
    state,
    explanation,
    mappings: [...active],
    scheduleAuthority: false,
  };
}

export function scheduleCannotAuthorizeTransition(): { gateDecision: false; transition: false } {
  return { gateDecision: false, transition: false };
}
