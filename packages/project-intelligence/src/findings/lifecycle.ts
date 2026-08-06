/**
 * Phase 8E — Server-enforced Findings lifecycle transitions.
 * AI may recommend; cannot execute approval, conversion, or closure.
 */
import { FindingsIntelligenceError } from "./errors";
import type { FindingsLifecycleStatus } from "./types";

const TRANSITIONS: Readonly<Record<FindingsLifecycleStatus, readonly FindingsLifecycleStatus[]>> = {
  candidate: ["triage_pending", "rejected", "duplicate", "archived"],
  triage_pending: ["under_review", "rejected", "deferred", "duplicate", "archived"],
  under_review: [
    "changes_requested",
    "accepted",
    "rejected",
    "deferred",
    "duplicate",
    "superseded",
  ],
  changes_requested: ["under_review", "rejected", "deferred", "archived"],
  accepted: ["conversion_proposed", "closed", "superseded", "archived"],
  rejected: ["reopened", "archived"],
  deferred: ["triage_pending", "under_review", "archived"],
  duplicate: ["archived", "reopened"],
  superseded: ["archived"],
  conversion_proposed: ["converted", "accepted", "rejected", "archived"],
  converted: ["closed", "archived"],
  closed: ["reopened", "archived"],
  reopened: ["triage_pending", "under_review", "archived"],
  archived: [],
};

/** Transitions that require a human actor (not AI/system alone). */
export const FINDINGS_HUMAN_ONLY_TRANSITIONS = new Set<FindingsLifecycleStatus>([
  "accepted",
  "rejected",
  "conversion_proposed",
  "converted",
  "closed",
]);

export const FINDINGS_TERMINAL_STATUSES = new Set<FindingsLifecycleStatus>(["archived"]);

export type FindingsTransitionActorKind = "human" | "system" | "ai";

export type FindingsLifecycleEvent = {
  action: "findings_status_transition";
  fromStatus: FindingsLifecycleStatus;
  toStatus: FindingsLifecycleStatus;
  actorId: string;
  actorKind: FindingsTransitionActorKind;
  reason?: string;
  at: string;
  idempotencyKey: string;
};

export function allowedFindingsTransitions(
  status: FindingsLifecycleStatus,
): readonly FindingsLifecycleStatus[] {
  return TRANSITIONS[status];
}

export function canTransitionFindingsStatus(
  from: FindingsLifecycleStatus,
  to: FindingsLifecycleStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertFindingsTransition(
  from: FindingsLifecycleStatus,
  to: FindingsLifecycleStatus,
  actorKind: FindingsTransitionActorKind,
): void {
  if (!canTransitionFindingsStatus(from, to)) {
    throw new FindingsIntelligenceError(
      "findings_transition_invalid",
      "Findings status transition is not allowed",
      409,
      { from, to },
    );
  }
  if (FINDINGS_TERMINAL_STATUSES.has(from)) {
    throw new FindingsIntelligenceError(
      "findings_terminal_state",
      "Terminal findings status cannot transition",
      409,
      { from, to },
    );
  }
  if (FINDINGS_HUMAN_ONLY_TRANSITIONS.has(to) && actorKind !== "human") {
    throw new FindingsIntelligenceError(
      "findings_ai_cannot_approve",
      "AI and system actors cannot approve, convert, or close findings",
      403,
      { to, actorKind },
    );
  }
}

export function createFindingsLifecycleEvent(input: {
  from: FindingsLifecycleStatus;
  to: FindingsLifecycleStatus;
  actorId: string;
  actorKind: FindingsTransitionActorKind;
  reason?: string;
  idempotencyKey: string;
  now?: string;
}): FindingsLifecycleEvent {
  assertFindingsTransition(input.from, input.to, input.actorKind);
  if (!input.actorId.trim()) {
    throw new FindingsIntelligenceError(
      "findings_actor_required",
      "Actor identity is required for lifecycle transitions",
      400,
    );
  }
  if (!input.idempotencyKey.trim()) {
    throw new FindingsIntelligenceError(
      "findings_idempotency_required",
      "Idempotency key is required",
      400,
    );
  }
  return {
    action: "findings_status_transition",
    fromStatus: input.from,
    toStatus: input.to,
    actorId: input.actorId,
    actorKind: input.actorKind,
    reason: input.reason,
    at: input.now ?? new Date().toISOString(),
    idempotencyKey: input.idempotencyKey,
  };
}
