/**
 * UI representation of canonical Lifecycle authority.
 * Does not replace server-side lifecycle or AAL2 enforcement.
 */

export type LifecycleAssignmentCta = "assign" | "settings" | "none";

export type LifecycleControlState = {
  evaluateEnabled: boolean;
  decisionEnabled: boolean;
  transitionEnabled: boolean;
  targetEditable: boolean;
  reason: string;
  assignmentCta: LifecycleAssignmentCta;
};

export function lifecycleControlState(input: {
  hasAssignment: boolean;
  aal: string | null | undefined;
  canMutate: boolean;
  evaluationReadiness: string | null | undefined;
  evaluationStale: boolean;
  lastDecision: string | null | undefined;
}): LifecycleControlState {
  const aal2 = String(input.aal ?? "") === "aal2";
  const readiness = String(input.evaluationReadiness ?? "").toUpperCase();
  const stale = input.evaluationStale || readiness === "STALE";
  const approved =
    input.lastDecision === "APPROVED_TO_TRANSITION" || input.lastDecision === "APPROVED_WITH_CONDITIONS";

  if (!input.hasAssignment) {
    return {
      evaluateEnabled: false,
      decisionEnabled: false,
      transitionEnabled: false,
      targetEditable: false,
      reason: "Assign a governed Lifecycle Profile and current stage before evaluating or approving a transition.",
      assignmentCta: input.canMutate ? "assign" : "settings",
    };
  }

  if (!input.canMutate) {
    return {
      evaluateEnabled: false,
      decisionEnabled: false,
      transitionEnabled: false,
      targetEditable: false,
      reason: "A workspace engineer or admin must configure and authorize lifecycle transitions.",
      assignmentCta: "settings",
    };
  }

  if (!aal2) {
    return {
      evaluateEnabled: false,
      decisionEnabled: false,
      transitionEnabled: false,
      targetEditable: false,
      reason: "Additional verification is required before protected Lifecycle actions.",
      assignmentCta: "none",
    };
  }

  const evaluateEnabled = true;
  if (!readiness || readiness === "NOT_EVALUATED" || readiness === "EVALUATING") {
    return {
      evaluateEnabled,
      decisionEnabled: false,
      transitionEnabled: false,
      targetEditable: false,
      reason: "Evaluate the gate from canonical evidence before a human decision.",
      assignmentCta: "none",
    };
  }

  if (stale) {
    return {
      evaluateEnabled,
      decisionEnabled: false,
      transitionEnabled: false,
      targetEditable: false,
      reason: "Gate evaluation is stale. Refresh from canonical evidence before deciding or transitioning.",
      assignmentCta: "none",
    };
  }

  if (readiness === "PARTIAL" || readiness === "FAILED" || readiness === "NOT_READY") {
    return {
      evaluateEnabled,
      decisionEnabled: false,
      transitionEnabled: false,
      targetEditable: false,
      reason: "Gate is not ready for review. Transition remains disabled.",
      assignmentCta: "none",
    };
  }

  if (readiness === "READY_FOR_REVIEW" && !approved) {
    return {
      evaluateEnabled,
      decisionEnabled: true,
      transitionEnabled: false,
      targetEditable: true,
      reason: "Human gate decision is required. Readiness does not transition the stage.",
      assignmentCta: "none",
    };
  }

  if (readiness === "READY_FOR_REVIEW" && approved) {
    return {
      evaluateEnabled,
      decisionEnabled: true,
      transitionEnabled: true,
      targetEditable: true,
      reason: "Authorized transition may be executed with the current evaluation and human decision.",
      assignmentCta: "none",
    };
  }

  return {
    evaluateEnabled,
    decisionEnabled: false,
    transitionEnabled: false,
    targetEditable: false,
    reason: "Lifecycle controls follow canonical gate state.",
    assignmentCta: "none",
  };
}

export function allowedTransitionTargets(
  currentStage: string | null | undefined,
  allowed: ReadonlyArray<{ from: string; to: string }>,
): string[] {
  const stage = String(currentStage ?? "");
  return allowed.filter((row) => row.from === stage).map((row) => row.to);
}

export function gateIdForCurrentStage(
  currentStage: string | null | undefined,
  gates: ReadonlyArray<{ gateId: string; fromStage: string; toStage?: string }>,
): string | null {
  const stage = String(currentStage ?? "");
  return gates.find((gate) => gate.fromStage === stage)?.gateId ?? null;
}
