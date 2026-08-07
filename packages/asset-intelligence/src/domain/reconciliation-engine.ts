/**
 * Phase 10I — SourceReconciliationEngine + PredictiveReadinessAssessor.
 */

import type { AssetFusionState, PredictiveReadinessState, SourceReconciliationRecord } from "./fusion";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";

export type SourceReconciliationEngineDeps = {
  newId?: (prefix: string) => string;
};

export class SourceReconciliationEngine {
  readonly kind = "source_reconciliation_engine" as const;
  private readonly newId: (prefix: string) => string;

  constructor(deps: SourceReconciliationEngineDeps = {}) {
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  reconcile(fusion: AssetFusionState): SourceReconciliationRecord {
    const conflicts: SourceReconciliationRecord["conflicts"] = [];
    const limitations: string[] = [];

    for (const kind of fusion.conflictingSources) {
      const peers = fusion.contributingSources.filter(
        (c) => c.kind === kind && (c.status === "conflicting" || c.status === "included"),
      );
      conflicts.push({
        dimension: kind,
        sourceA: peers[0]?.stateId,
        sourceB: peers[1]?.stateId,
        outcome: "require_human_review",
        rationale: "multiple_published_states_same_kind_no_autonomous_resolution",
      });
    }

    if (fusion.fusionClass === "conflicting" && conflicts.length === 0) {
      conflicts.push({
        dimension: "evidence_confidence",
        outcome: "abstain_conflict",
        rationale: "evidence_confidence_conflicting",
      });
    }

    if (conflicts.length === 0) {
      limitations.push("no_conflicts_detected");
    } else {
      limitations.push("autonomous_resolution_forbidden");
    }

    return {
      id: this.newId("reconcile"),
      assetId: fusion.assetId,
      fusionStateRef: fusion.id,
      conflicts,
      method: "source_reconciliation_v1",
      methodVersion: "1",
      reconciledAt: new Date().toISOString(),
      limitations,
      autonomousResolutionForbidden: true,
    };
  }
}

export function createSourceReconciliationEngine(
  deps?: SourceReconciliationEngineDeps,
): SourceReconciliationEngine {
  return new SourceReconciliationEngine(deps);
}

export type PredictiveReadinessAssessorDeps = {
  newId?: (prefix: string) => string;
};

export type PredictiveReadinessResult = {
  readiness: PredictiveReadinessState;
  predictiveAllowed: false;
};

export class PredictiveReadinessAssessor {
  readonly kind = "predictive_readiness_assessor" as const;
  private readonly newId: (prefix: string) => string;

  constructor(deps: PredictiveReadinessAssessorDeps = {}) {
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  assess(input: {
    fusion: AssetFusionState;
    reconciliation?: SourceReconciliationRecord;
    evidenceConfidence: EvidenceConfidenceAssessment;
    assessedAt?: string;
  }): PredictiveReadinessResult {
    const { fusion, reconciliation, evidenceConfidence: ec } = input;
    const rationale: string[] = [];
    const limitations: string[] = [...fusion.limitations];
    let readinessClass: PredictiveReadinessState["readinessClass"] = "not_ready";

    if (["insufficient", "conflicting", "revoked"].includes(ec.dataSufficiency)) {
      readinessClass =
        ec.dataSufficiency === "conflicting" ? "conflicting" : "insufficient";
      rationale.push(`evidence_${ec.dataSufficiency}`);
      limitations.push("predictive_methods_remain_disabled");
    } else if (fusion.conflictingSources.length > 0 || fusion.fusionClass === "conflicting") {
      readinessClass = "conflicting";
      rationale.push("fusion_conflicts_unresolved");
      limitations.push("human_reconciliation_required_before_predictive");
    } else if (
      fusion.fusionClass === "abstained" ||
      fusion.fusionClass === "insufficient_evidence"
    ) {
      readinessClass = "insufficient";
      rationale.push("fusion_insufficient");
    } else if (
      fusion.missingSources.includes("condition") ||
      fusion.missingSources.includes("reliability") ||
      (fusion.missingSources.includes("trend") && fusion.missingSources.includes("degradation"))
    ) {
      readinessClass = "limited";
      rationale.push("core_or_trend_dimensions_missing");
      limitations.push("predictive_methods_remain_disabled_until_sufficient");
    } else if (fusion.fusionClass === "aligned" && fusion.missingSources.length === 0) {
      // Even when fusion is strong, Phase 10I does not enable predictive methods.
      readinessClass = "sufficient";
      rationale.push("fusion_evidence_sufficient_for_future_consideration");
      limitations.push("predictive_ml_enabled=false");
      limitations.push("predictive_methods_certified=false");
      limitations.push("phase_10i_readiness_only_no_execution");
    } else {
      readinessClass = "limited";
      rationale.push("partial_fusion_context");
      limitations.push("predictive_methods_remain_disabled");
    }

    if (reconciliation && reconciliation.conflicts.some((c) => c.outcome === "require_human_review")) {
      if (readinessClass === "sufficient") readinessClass = "limited";
      rationale.push("reconciliation_requires_human_review");
    }

    const readiness: PredictiveReadinessState = {
      id: this.newId("pred_ready"),
      assetId: fusion.assetId,
      version: 1,
      fusionStateRef: fusion.id,
      reconciliationRef: reconciliation?.id,
      readinessClass,
      readinessRationale: rationale,
      evidenceConfidenceRef: ec.assessmentId,
      trendConfidenceRef: fusion.trendConfidenceRef,
      method: "predictive_readiness_v1",
      methodVersion: "1",
      reviewStatus: "draft",
      provenance: {
        engine: "PredictiveReadinessAssessor",
        predictiveMlEnabled: false,
        predictiveMethodsCertified: false,
        predictiveMlExecuted: false,
      },
      limitations,
      assessedAt: input.assessedAt ?? new Date().toISOString(),
      predictiveMlEnabled: false,
      predictiveMethodsCertified: false,
      predictiveMlExecuted: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      isHealthFactor: false,
    };

    return { readiness, predictiveAllowed: false };
  }
}

export function createPredictiveReadinessAssessor(
  deps?: PredictiveReadinessAssessorDeps,
): PredictiveReadinessAssessor {
  return new PredictiveReadinessAssessor(deps);
}
