/**
 * Phase 12G — TwinSimulatedState (separate plane) + state semantic firewall.
 *
 * Simulated Twin State NEVER silently replaces Observed/Derived/Operational state.
 * batch_76 observed path keeps simulationExecuted=false.
 */

import type { TwinDerivedState, TwinObservedState, OperationalStateReference } from "./state";

export type TwinSimulatedState = {
  simulatedStateId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  category: "simulated";
  simulationResultRef: string;
  methodId: string;
  providerId: string;
  scenarioId: string;
  inputSetId: string;
  validationId?: string;
  reviewId?: string;
  assumptions?: string[];
  limitations?: string[];
  lifecycle: "draft" | "pending_review" | "published" | "superseded" | "archived";
  externalRef: string;
  /** Distinct plane — not an observed-state row. */
  replacesObservedState: false;
  simulationExecuted: true;
  claimsPhysicalTruth: false;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  createdBy?: string;
};

export function createTwinSimulatedState(input: {
  simulatedStateId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  simulationResultRef: string;
  methodId: string;
  providerId: string;
  scenarioId: string;
  inputSetId: string;
  validationId?: string;
  reviewId?: string;
  assumptions?: string[];
  limitations?: string[];
  externalRef: string;
  createdBy?: string;
}): TwinSimulatedState {
  const now = new Date().toISOString();
  return {
    simulatedStateId: input.simulatedStateId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    category: "simulated",
    simulationResultRef: input.simulationResultRef,
    methodId: input.methodId,
    providerId: input.providerId,
    scenarioId: input.scenarioId,
    inputSetId: input.inputSetId,
    validationId: input.validationId,
    reviewId: input.reviewId,
    assumptions: input.assumptions,
    limitations: input.limitations,
    lifecycle: "draft",
    externalRef: input.externalRef,
    replacesObservedState: false,
    simulationExecuted: true,
    claimsPhysicalTruth: false,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function publishTwinSimulatedState(state: TwinSimulatedState): TwinSimulatedState {
  if (state.replacesObservedState) {
    throw new Error("simulated_state_must_not_replace_observed");
  }
  if (state.claimsPhysicalTruth) {
    throw new Error("simulated_state_must_not_claim_physical_truth");
  }
  return {
    ...state,
    lifecycle: "published",
    publishedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export type StateSemanticPlane = "observed" | "derived" | "operational" | "simulated";

export function assertStateSemanticFirewall(input: {
  observed?: TwinObservedState;
  derived?: TwinDerivedState;
  operational?: OperationalStateReference;
  simulated?: TwinSimulatedState;
}): void {
  const refs = [
    input.observed?.externalRef,
    input.derived?.externalRef,
    input.operational?.externalRef,
    input.simulated?.externalRef,
  ].filter(Boolean);
  if (new Set(refs).size !== refs.length) {
    throw new Error("state_planes_must_not_share_external_refs");
  }
  if (input.simulated?.replacesObservedState) {
    throw new Error("simulated_must_not_replace_observed");
  }
  if (input.observed && input.observed.category !== "observed") {
    throw new Error("observed_category_mismatch");
  }
  if (input.simulated && input.simulated.category !== "simulated") {
    throw new Error("simulated_category_mismatch");
  }
}

export function assertObservedNotSimulated(
  observed: { category: string; externalRef: string },
  simulated: { category: string; externalRef: string },
): void {
  if (observed.category === "simulated" || simulated.category === "observed") {
    throw new Error("observed_simulated_category_swap_forbidden");
  }
  if (observed.externalRef === simulated.externalRef) {
    throw new Error("observed_must_not_equal_simulated");
  }
}

export function assertNeverPublishSimulatedAsObserved(targetCategory: string): void {
  if (targetCategory === "observed") {
    throw new Error("simulated_state_must_not_publish_as_observed");
  }
}
