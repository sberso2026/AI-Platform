/**
 * Corrective Action Framework — ownership, due dates, verification, closure (Phase 9D).
 */
function randomUUID(): string {
  return globalThis.crypto.randomUUID();
}

export type CorrectiveActionStatus =
  | "open"
  | "in_progress"
  | "pending_verification"
  | "verified"
  | "closed"
  | "cancelled";

export type CorrectiveAction = {
  id: string;
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId: string;
  recommendationId?: string;
  ownerPersonId: string;
  dueAt: string;
  description: string;
  status: CorrectiveActionStatus;
  createdAt: string;
  updatedAt: string;
};

const CA_TRANSITIONS: Record<CorrectiveActionStatus, CorrectiveActionStatus[]> = {
  open: ["in_progress", "cancelled"],
  in_progress: ["pending_verification", "open", "cancelled"],
  pending_verification: ["verified", "in_progress"],
  verified: ["closed"],
  closed: [],
  cancelled: [],
};

export function assertCorrectiveActionTransition(
  from: CorrectiveActionStatus,
  to: CorrectiveActionStatus,
): void {
  if (!(CA_TRANSITIONS[from] ?? []).includes(to)) {
    throw new Error(`invalid_corrective_action_transition:${from}->${to}`);
  }
}

export function nextCorrectiveActionStates(
  from: CorrectiveActionStatus,
): readonly CorrectiveActionStatus[] {
  return CA_TRANSITIONS[from] ?? [];
}

export function createCorrectiveAction(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId: string;
  recommendationId?: string;
  ownerPersonId: string;
  dueAt: string;
  description: string;
}): CorrectiveAction {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    ...input,
    status: "open",
    createdAt: now,
    updatedAt: now,
  };
}

export function transitionCorrectiveAction(
  action: CorrectiveAction,
  to: CorrectiveActionStatus,
): CorrectiveAction {
  assertCorrectiveActionTransition(action.status, to);
  return { ...action, status: to, updatedAt: new Date().toISOString() };
}
