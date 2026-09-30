import { describe, expect, it } from "vitest";
import {
  allowedTransitionTargets,
  gateIdForCurrentStage,
  lifecycleControlState,
} from "../lib/engineering/lifecycle-control-state";

describe("EOS-A9F-C lifecycle control state", () => {
  it("disables gate and transition actions when no assignment exists", () => {
    const state = lifecycleControlState({
      hasAssignment: false,
      aal: "aal2",
      canMutate: true,
      evaluationReadiness: null,
      evaluationStale: false,
      lastDecision: null,
    });
    expect(state.decisionEnabled).toBe(false);
    expect(state.transitionEnabled).toBe(false);
    expect(state.targetEditable).toBe(false);
    expect(state.evaluateEnabled).toBe(false);
    expect(state.assignmentCta).toBe("assign");
    expect(state.reason).toContain("Assign a governed Lifecycle Profile");
  });

  it("disables protected actions at AAL1 even with an assignment", () => {
    const state = lifecycleControlState({
      hasAssignment: true,
      aal: "aal1",
      canMutate: true,
      evaluationReadiness: "READY_FOR_REVIEW",
      evaluationStale: false,
      lastDecision: null,
    });
    expect(state.decisionEnabled).toBe(false);
    expect(state.transitionEnabled).toBe(false);
    expect(state.reason).toContain("Additional verification");
  });

  it("disables decision and transition for PARTIAL and STALE gates", () => {
    const partial = lifecycleControlState({
      hasAssignment: true,
      aal: "aal2",
      canMutate: true,
      evaluationReadiness: "PARTIAL",
      evaluationStale: false,
      lastDecision: null,
    });
    const stale = lifecycleControlState({
      hasAssignment: true,
      aal: "aal2",
      canMutate: true,
      evaluationReadiness: "READY_FOR_REVIEW",
      evaluationStale: true,
      lastDecision: "APPROVED_TO_TRANSITION",
    });
    expect(partial.decisionEnabled).toBe(false);
    expect(partial.transitionEnabled).toBe(false);
    expect(stale.decisionEnabled).toBe(false);
    expect(stale.transitionEnabled).toBe(false);
  });

  it("allows human decision at READY_FOR_REVIEW and transition only after approval", () => {
    const ready = lifecycleControlState({
      hasAssignment: true,
      aal: "aal2",
      canMutate: true,
      evaluationReadiness: "READY_FOR_REVIEW",
      evaluationStale: false,
      lastDecision: null,
    });
    const approved = lifecycleControlState({
      hasAssignment: true,
      aal: "aal2",
      canMutate: true,
      evaluationReadiness: "READY_FOR_REVIEW",
      evaluationStale: false,
      lastDecision: "APPROVED_TO_TRANSITION",
    });
    expect(ready.decisionEnabled).toBe(true);
    expect(ready.transitionEnabled).toBe(false);
    expect(approved.transitionEnabled).toBe(true);
  });

  it("restricts target stages to governed allowed transitions", () => {
    expect(
      allowedTransitionTargets("FEED", [
        { from: "FEED", to: "DETAILED_DESIGN" },
        { from: "FEED", to: "FEASIBILITY" },
        { from: "DETAILED_DESIGN", to: "CONSTRUCTION" },
      ]),
    ).toEqual(["DETAILED_DESIGN", "FEASIBILITY"]);
    expect(gateIdForCurrentStage("FEED", [{ gateId: "FEED_EXIT", fromStage: "FEED", toStage: "DETAILED_DESIGN" }])).toBe(
      "FEED_EXIT",
    );
  });
});
