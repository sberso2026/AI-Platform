/**
 * Phase 12D — TwinStateReconciliationEngine outcomes.
 */

import type { ObservedTwinStateCandidate } from "./observed-state-candidate";
import type { TwinState } from "./state";

export const RECONCILIATION_OUTCOMES = [
  "accepted",
  "accepted_with_review",
  "conflicting",
  "rejected",
  "superseded",
  "unknown",
] as const;

export type TwinStateReconciliationOutcome = (typeof RECONCILIATION_OUTCOMES)[number];

export type TwinStateReconciliationRecord = {
  reconciliationId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  candidateId: string;
  outcome: TwinStateReconciliationOutcome;
  conflictingStateId?: string;
  supersededStateId?: string;
  notes?: string;
  evaluatedAt: string;
  evaluatedBy?: string;
  requiresReview: boolean;
  autoPublishBlocked: true;
};

export type ReconciliationContext = {
  candidate: ObservedTwinStateCandidate;
  publishedStates: TwinState[];
  authorityAllowsAutoAccept: boolean;
};

export class TwinStateReconciliationEngine {
  readonly kind = "twin_state_reconciliation_engine" as const;

  reconcile(
    ctx: ReconciliationContext,
    newId: (prefix: string) => string,
  ): TwinStateReconciliationRecord {
    const now = new Date().toISOString();
    const conflicting = ctx.publishedStates.find(
      (s) =>
        s.lifecycle === "published" &&
        s.externalRef === ctx.candidate.externalRef &&
        s.category === ctx.candidate.category,
    );

    let outcome: TwinStateReconciliationOutcome = "unknown";
    let requiresReview = true;

    if (ctx.candidate.freshness === "expired") {
      outcome = "rejected";
      requiresReview = false;
    } else if (conflicting && conflicting.provenance.sourceRef !== ctx.candidate.provenance.sourceRef) {
      outcome = "conflicting";
      requiresReview = true;
    } else if (ctx.authorityAllowsAutoAccept && !conflicting) {
      outcome = "accepted_with_review";
      requiresReview = true;
    } else if (!conflicting) {
      outcome = "accepted";
      requiresReview = true;
    } else {
      outcome = "accepted_with_review";
      requiresReview = true;
    }

    return {
      reconciliationId: newId("dtrecon"),
      tenantId: ctx.candidate.tenantId,
      workspaceId: ctx.candidate.workspaceId,
      twinId: ctx.candidate.twinId,
      candidateId: ctx.candidate.candidateId,
      outcome,
      conflictingStateId: conflicting?.stateId,
      notes:
        outcome === "conflicting"
          ? "Published state conflicts with candidate externalRef"
          : undefined,
      evaluatedAt: now,
      requiresReview,
      autoPublishBlocked: true,
    };
  }
}

export function createTwinStateReconciliationEngine(): TwinStateReconciliationEngine {
  return new TwinStateReconciliationEngine();
}

export function assertReconciliationAllowsReview(
  record: TwinStateReconciliationRecord,
): void {
  if (record.outcome === "rejected") {
    throw new Error("reconciliation_rejected");
  }
  if (record.outcome === "conflicting" && !record.requiresReview) {
    throw new Error("conflict_requires_review");
  }
}
