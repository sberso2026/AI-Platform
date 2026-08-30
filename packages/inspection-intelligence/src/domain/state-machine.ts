/** Server-side inspection session state machine — every transition requires authorization. */

export const INSPECTION_SESSION_STATES = [
  "draft",
  "planned",
  "scheduled",
  "assigned",
  "started",
  "paused",
  "completed",
  "submitted",
  "reviewed",
  "approved",
  "verified",
  "closed",
  "archived",
  "cancelled",
] as const;

export type InspectionSessionState = (typeof INSPECTION_SESSION_STATES)[number];

const TRANSITIONS: Record<InspectionSessionState, InspectionSessionState[]> = {
  draft: ["planned", "cancelled"],
  planned: ["scheduled", "assigned", "cancelled"],
  scheduled: ["assigned", "cancelled"],
  assigned: ["started", "cancelled"],
  started: ["paused", "completed", "cancelled"],
  paused: ["started", "cancelled"],
  completed: ["submitted", "cancelled"],
  submitted: ["reviewed", "cancelled"],
  reviewed: ["approved", "submitted"],
  approved: ["verified", "closed"],
  verified: ["closed"],
  closed: ["archived"],
  archived: [],
  cancelled: ["archived"],
};

export type TransitionAuth = {
  action:
    | "inspection.write"
    | "inspection.review"
    | "inspection.approve"
    | "inspection.admin";
  actorUserId: string;
};

const REQUIRED_ACTION: Partial<Record<InspectionSessionState, TransitionAuth["action"]>> = {
  reviewed: "inspection.review",
  approved: "inspection.approve",
  verified: "inspection.approve",
  archived: "inspection.admin",
};

export function assertInspectionTransition(
  from: InspectionSessionState,
  to: InspectionSessionState,
  auth: TransitionAuth,
): void {
  const allowed = TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new Error(`invalid_inspection_transition:${from}->${to}`);
  }
  if (!auth.actorUserId) {
    throw new Error("inspection_transition_unauthorized:missing_actor");
  }
  const required = REQUIRED_ACTION[to] ?? "inspection.write";
  const rank: Record<TransitionAuth["action"], number> = {
    "inspection.write": 1,
    "inspection.review": 2,
    "inspection.approve": 3,
    "inspection.admin": 4,
  };
  if (rank[auth.action] < rank[required]) {
    throw new Error(`inspection_transition_unauthorized:need_${required}`);
  }
}

export function canTransition(
  from: InspectionSessionState,
  to: InspectionSessionState,
): boolean {
  return (TRANSITIONS[from] ?? []).includes(to);
}

export function nextInspectionSessionStates(
  from: InspectionSessionState,
): readonly InspectionSessionState[] {
  return TRANSITIONS[from] ?? [];
}

export function requiredActionForSessionState(
  to: InspectionSessionState,
): TransitionAuth["action"] {
  return REQUIRED_ACTION[to] ?? "inspection.write";
}
