import { failClosed } from "./errors";
import {
  asActorId,
  asFindingDispositionId,
  type ActorId,
  type FindingDispositionId,
  type ReviewFindingId,
} from "./ids";
import {
  assertReviewTransition,
  createReviewLifecycleEvent,
  type ReviewActorKind,
  type ReviewFindingStatus,
  type ReviewLifecycleEvent,
} from "./lifecycle";
import type { ReviewFinding } from "./finding";
import { assertEvidenceNotSilentlyDropped, revokeEvidence, type FindingEvidence } from "./evidence";
import type { ReviewSeverity } from "./severity";

export const REVIEW_DISPOSITION_ACTIONS = [
  "assign",
  "accept",
  "reject",
  "modify",
  "close",
  "reopen",
] as const;
export type ReviewDispositionAction = (typeof REVIEW_DISPOSITION_ACTIONS)[number];

export type FindingDisposition = {
  id: FindingDispositionId;
  findingId: ReviewFindingId;
  action: ReviewDispositionAction;
  previousStatus: ReviewFindingStatus;
  newStatus: ReviewFindingStatus;
  actorId: ActorId;
  actorKind: "human";
  reason?: string;
  assignedTo?: ActorId;
  at: string;
};

const ACTION_STATUS: Record<ReviewDispositionAction, ReviewFindingStatus> = {
  assign: "assigned",
  accept: "accepted",
  reject: "rejected",
  modify: "modified",
  close: "closed",
  reopen: "awaiting_engineer",
};

export function applyHumanDisposition(input: {
  finding: ReviewFinding;
  action: ReviewDispositionAction;
  actorId: string;
  reason?: string;
  assignedTo?: string;
  title?: string;
  description?: string;
  severity?: ReviewSeverity;
  evidence?: readonly FindingEvidence[];
  revokeEvidence?: boolean;
  now?: string;
}): { finding: ReviewFinding; disposition: FindingDisposition; event: ReviewLifecycleEvent } {
  if (!input.actorId?.trim()) {
    failClosed("actor_required", "Human disposition requires an attributable actor");
  }
  const actorKind: ReviewActorKind = "human";
  const to = ACTION_STATUS[input.action];
  if (!to) failClosed("disposition_invalid", "Unknown disposition action", { action: input.action });

  const event = createReviewLifecycleEvent({
    from: input.finding.status,
    to,
    actorId: asActorId(input.actorId),
    actorKind,
    reason: input.reason,
    now: input.now,
  });
  assertReviewTransition(input.finding.status, to, actorKind);

  let evidence = input.finding.evidence;
  if (input.revokeEvidence) {
    evidence = input.finding.evidence.map(revokeEvidence);
  } else {
    assertEvidenceNotSilentlyDropped(input.finding.evidence, input.evidence);
    evidence = input.evidence ?? input.finding.evidence;
  }

  const dispositionId = `disp-${input.finding.id}-${event.at}`;
  const finding: ReviewFinding = {
    ...input.finding,
    status: to,
    title: input.title?.trim() || input.finding.title,
    description: input.description?.trim() || input.finding.description,
    severity: input.severity ?? input.finding.severity,
    evidence,
    verificationState: input.revokeEvidence ? "revoked" : input.finding.verificationState,
    humanDispositionId: dispositionId,
    updatedAt: event.at,
  };

  const disposition: FindingDisposition = {
    id: asFindingDispositionId(dispositionId),
    findingId: input.finding.id,
    action: input.action,
    previousStatus: event.fromStatus,
    newStatus: event.toStatus,
    actorId: asActorId(input.actorId),
    actorKind: "human",
    reason: input.reason,
    assignedTo: input.assignedTo ? asActorId(input.assignedTo) : undefined,
    at: event.at,
  };

  return { finding, disposition, event };
}

export function advanceCandidateAfterVerification(
  finding: ReviewFinding,
  actorId: string,
  actorKind: Exclude<ReviewActorKind, "human">,
  now?: string,
): ReviewFinding {
  const event = createReviewLifecycleEvent({
    from: finding.status,
    to: "awaiting_engineer",
    actorId: asActorId(actorId),
    actorKind,
    reason: "evidence_verification_complete",
    now,
  });
  return { ...finding, status: event.toStatus, updatedAt: event.at };
}
