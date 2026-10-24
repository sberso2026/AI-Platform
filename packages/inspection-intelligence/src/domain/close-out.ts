/**
 * Close-out lifecycle — inspection closure only after corrective actions verified.
 */
import type { CorrectiveAction } from "./corrective-actions";
import type { InspectionVerification } from "./verification";
import type { InspectionSessionState } from "./state-machine";
import { assertInspectionTransition, type TransitionAuth } from "./state-machine";

export type CloseOutResult = {
  canClose: boolean;
  reason?: string;
};

export function evaluateInspectionCloseOut(input: {
  sessionStatus: InspectionSessionState;
  correctiveActions: CorrectiveAction[];
  verifications: InspectionVerification[];
}): CloseOutResult {
  if (input.sessionStatus !== "verified" && input.sessionStatus !== "approved") {
    return { canClose: false, reason: "session_not_ready_for_closeout" };
  }
  const actionable = input.correctiveActions.filter((a) => a.status !== "cancelled");
  for (const action of actionable) {
    if (action.status !== "closed") {
      return { canClose: false, reason: `corrective_action_open:${action.id}` };
    }
    const passed = input.verifications.some(
      (v) =>
        v.kind === "corrective_action" &&
        v.subjectId === action.id &&
        v.status === "passed",
    );
    if (!passed) {
      return { canClose: false, reason: `corrective_action_unverified:${action.id}` };
    }
  }
  return { canClose: true };
}

export function closeOutInspectionSession(input: {
  sessionStatus: InspectionSessionState;
  correctiveActions: CorrectiveAction[];
  verifications: InspectionVerification[];
  auth: TransitionAuth;
}): InspectionSessionState {
  const evaluation = evaluateInspectionCloseOut(input);
  if (!evaluation.canClose) {
    throw new Error(evaluation.reason ?? "close_out_blocked");
  }
  let status = input.sessionStatus;
  if (status === "approved") {
    assertInspectionTransition("approved", "verified", {
      action: "inspection.approve",
      actorUserId: input.auth.actorUserId,
    });
    status = "verified";
  }
  assertInspectionTransition("verified", "closed", {
    action: "inspection.approve",
    actorUserId: input.auth.actorUserId,
  });
  return "closed";
}
