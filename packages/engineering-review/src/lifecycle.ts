import { failClosed } from "./errors";
import type { ActorId } from "./ids";

/**
 * Review finding lifecycle.
 *
 * Product labels (ERA-0/1) map onto these stored statuses. Compatible with
 * Project Intelligence findings semantics without importing @rtb/project-intelligence:
 *
 * | Product            | Stored status       | PI analogue        |
 * | ------------------ | ------------------- | ------------------ |
 * | CANDIDATE          | candidate           | candidate          |
 * | AI_REVIEWED        | awaiting_engineer   | triage_pending     |
 * | AWAITING_ENGINEER  | awaiting_engineer   | under_review       |
 * | ASSIGNED           | assigned            | under_review+assign|
 * | MODIFIED           | modified            | changes_requested  |
 * | ACCEPTED           | accepted            | accepted           |
 * | REJECTED           | rejected            | rejected           |
 * | CLOSED             | closed              | closed             |
 *
 * AI may create candidates and move them to awaiting_engineer after evidence
 * verification. AI MUST NOT accept, reject, modify, assign, or close.
 */
export const REVIEW_FINDING_STATUSES = [
  "candidate",
  "awaiting_engineer",
  "assigned",
  "modified",
  "accepted",
  "rejected",
  "closed",
] as const;

export type ReviewFindingStatus = (typeof REVIEW_FINDING_STATUSES)[number];

export type ReviewActorKind = "human" | "system" | "ai";

const TRANSITIONS: Readonly<Record<ReviewFindingStatus, readonly ReviewFindingStatus[]>> = {
  candidate: ["awaiting_engineer", "assigned", "accepted", "rejected", "modified"],
  awaiting_engineer: ["assigned", "accepted", "rejected", "modified"],
  assigned: ["awaiting_engineer", "accepted", "rejected", "modified"],
  modified: ["awaiting_engineer", "assigned", "accepted", "rejected"],
  accepted: ["closed"],
  rejected: ["closed", "awaiting_engineer"],
  closed: ["awaiting_engineer"],
};

export const REVIEW_HUMAN_ONLY_STATUSES = new Set<ReviewFindingStatus>([
  "accepted",
  "rejected",
  "modified",
  "assigned",
  "closed",
]);

export function allowedReviewTransitions(
  status: ReviewFindingStatus,
): readonly ReviewFindingStatus[] {
  return TRANSITIONS[status];
}

export function canTransitionReviewStatus(
  from: ReviewFindingStatus,
  to: ReviewFindingStatus,
): boolean {
  return TRANSITIONS[from].includes(to);
}

export function assertReviewTransition(
  from: ReviewFindingStatus,
  to: ReviewFindingStatus,
  actorKind: ReviewActorKind,
): void {
  if (!canTransitionReviewStatus(from, to)) {
    failClosed("transition_invalid", "Review finding status transition is not allowed", { from, to });
  }
  if (REVIEW_HUMAN_ONLY_STATUSES.has(to) && actorKind !== "human") {
    failClosed(
      "ai_cannot_dispose",
      "AI and system actors cannot accept, reject, modify, assign, or close findings",
      { to, actorKind },
    );
  }
}

export type ReviewLifecycleEvent = {
  action: "review_finding_status_transition";
  fromStatus: ReviewFindingStatus;
  toStatus: ReviewFindingStatus;
  actorId: ActorId;
  actorKind: ReviewActorKind;
  reason?: string;
  at: string;
};

export function createReviewLifecycleEvent(input: {
  from: ReviewFindingStatus;
  to: ReviewFindingStatus;
  actorId: ActorId;
  actorKind: ReviewActorKind;
  reason?: string;
  now?: string;
}): ReviewLifecycleEvent {
  assertReviewTransition(input.from, input.to, input.actorKind);
  if (!input.actorId) {
    failClosed("actor_required", "Actor identity is required for lifecycle transitions");
  }
  return {
    action: "review_finding_status_transition",
    fromStatus: input.from,
    toStatus: input.to,
    actorId: input.actorId,
    actorKind: input.actorKind,
    reason: input.reason,
    at: input.now ?? new Date().toISOString(),
  };
}
