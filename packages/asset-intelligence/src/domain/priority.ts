/**
 * Phase 10H — Asset Priority Profile + Context Engine (dimensional; no opaque score).
 */

import type { AssetDecisionContext } from "./decision-context";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type { AssetMaintenanceRecommendationState } from "./maintenance-recommendation";
import type { AssetRiskSignalState } from "./risk";
import type { TrendConfidenceAssessment } from "./trend-confidence";

export type PriorityClass =
  | "routine"
  | "monitor"
  | "attention"
  | "high_attention"
  | "urgent_review"
  | "insufficient_evidence";

export type PriorityDimensionState = {
  dimension:
    | "health"
    | "criticality"
    | "risk_signal"
    | "failure"
    | "degradation"
    | "lifecycle"
    | "maintenance_recommendation"
    | "evidence_confidence";
  ref?: string;
  status: "present" | "missing" | "excluded" | "conflicting";
  note?: string;
};

export type AssetPriorityProfile = {
  id: string;
  tenantId?: string;
  workspaceId?: string;
  assetId: string;
  version: number;
  snapshotId?: string;
  healthRef?: string;
  criticalityRef?: string;
  riskSignalRef?: string;
  failureRefs: string[];
  degradationRefs: string[];
  lifecycleRef?: string;
  maintenanceRecommendationRefs: string[];
  decisionContextRef: string;
  dimensionStates: PriorityDimensionState[];
  missingDimensions: string[];
  conflictingDimensions: string[];
  priorityClass: PriorityClass;
  priorityRationale: string[];
  priorityConfidence?: number;
  /** No opaque universal numeric score required. */
  numericScore?: never;
  method: "priority_context_compose_v1";
  methodVersion: "1";
  reviewStatus: string;
  reviewInstanceId?: string;
  provenance: Record<string, unknown>;
  limitations: string[];
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  supersedesId?: string;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  isHealthFactor: false;
  impliesPoF: false;
  createsWorkOrder: false;
  mutatesCanonicalLifecycle: false;
};

export type PriorityContextInput = {
  decisionContext: AssetDecisionContext;
  riskSignal?: AssetRiskSignalState;
  maintenanceRecommendations?: AssetMaintenanceRecommendationState[];
  evidenceConfidence: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  assessedAt?: string;
};

export type PriorityContextResult = {
  profile: AssetPriorityProfile;
  abstained: boolean;
  abstentionReason?: string;
};

export type AssetPriorityContextEngineDeps = {
  newId?: (prefix: string) => string;
};

export class AssetPriorityContextEngine {
  readonly kind = "asset_priority_context_engine" as const;
  private readonly newId: (prefix: string) => string;

  constructor(deps: AssetPriorityContextEngineDeps = {}) {
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  compose(input: PriorityContextInput): PriorityContextResult {
    const ctx = input.decisionContext;
    const ec = input.evidenceConfidence;
    const dimensions: PriorityDimensionState[] = [];
    const missing: string[] = [];
    const conflicting: string[] = [];
    const rationale: string[] = [];
    const limitations: string[] = [...ctx.limitations];

    const pushDim = (
      dimension: PriorityDimensionState["dimension"],
      ref: string | undefined,
      presentWhen: boolean,
    ) => {
      if (presentWhen && ref) {
        dimensions.push({ dimension, ref, status: "present" });
      } else {
        dimensions.push({ dimension, ref, status: "missing" });
        missing.push(dimension);
      }
    };

    pushDim("health", ctx.healthProfileRef, Boolean(ctx.healthProfileRef));
    pushDim("criticality", ctx.criticalityStateRef, Boolean(ctx.criticalityStateRef));
    pushDim("risk_signal", input.riskSignal?.id, Boolean(input.riskSignal?.id));
    pushDim(
      "failure",
      ctx.failureStateRefs[0],
      ctx.failureStateRefs.length > 0,
    );
    pushDim(
      "degradation",
      ctx.degradationStateRefs[0],
      ctx.degradationStateRefs.length > 0,
    );
    pushDim("lifecycle", ctx.lifecycleIntelligenceRef, Boolean(ctx.lifecycleIntelligenceRef));
    const maintRefs = (input.maintenanceRecommendations ?? [])
      .filter((r) => r.reviewStatus !== "abstained")
      .map((r) => r.id);
    pushDim("maintenance_recommendation", maintRefs[0], maintRefs.length > 0);
    dimensions.push({
      dimension: "evidence_confidence",
      ref: ec.assessmentId,
      status: ec.dataSufficiency === "conflicting" ? "conflicting" : "present",
    });
    if (ec.dataSufficiency === "conflicting") conflicting.push("evidence_confidence");

    let abstained = false;
    let abstentionReason: string | undefined;
    let priorityClass: PriorityClass = "routine";

    if (["insufficient", "conflicting", "revoked"].includes(ec.dataSufficiency)) {
      abstained = true;
      abstentionReason = `evidence_${ec.dataSufficiency}`;
      priorityClass = "insufficient_evidence";
      rationale.push(`abstained:${abstentionReason}`);
      limitations.push(`abstained:${abstentionReason}`);
    } else {
      const riskClass = input.riskSignal?.riskSignalClass;
      if (riskClass === "consequence_sensitive") {
        priorityClass = "urgent_review";
        rationale.push("consequence_sensitive_risk");
      } else if (riskClass === "elevated_attention") {
        priorityClass = "high_attention";
        rationale.push("elevated_attention_risk");
      } else if (riskClass === "attention") {
        priorityClass = "attention";
        rationale.push("attention_risk");
      } else if (maintRefs.length && input.maintenanceRecommendations?.[0]?.recommendationCode !== "monitor") {
        priorityClass = "monitor";
        rationale.push("maintenance_recommendation_attention");
      } else if (missing.includes("health") && missing.includes("criticality")) {
        priorityClass = "insufficient_evidence";
        abstained = true;
        abstentionReason = "insufficient_priority_dimensions";
        rationale.push("insufficient_priority_dimensions");
        limitations.push("abstained:insufficient_priority_dimensions");
      } else {
        priorityClass = "routine";
        rationale.push("routine_priority_context");
      }
      if (missing.length) limitations.push(`missing:${missing.join(",")}`);
    }

    const profile: AssetPriorityProfile = {
      id: this.newId("priority"),
      assetId: ctx.assetId,
      version: 1,
      snapshotId: ctx.snapshotId,
      healthRef: ctx.healthProfileRef,
      criticalityRef: ctx.criticalityStateRef,
      riskSignalRef: input.riskSignal?.id,
      failureRefs: ctx.failureStateRefs,
      degradationRefs: ctx.degradationStateRefs,
      lifecycleRef: ctx.lifecycleIntelligenceRef,
      maintenanceRecommendationRefs: maintRefs,
      decisionContextRef: ctx.id,
      dimensionStates: dimensions,
      missingDimensions: missing,
      conflictingDimensions: conflicting,
      priorityClass,
      priorityRationale: rationale,
      priorityConfidence: ec.score,
      method: "priority_context_compose_v1",
      methodVersion: "1",
      reviewStatus: abstained ? "abstained" : "draft",
      provenance: {
        engine: "AssetPriorityContextEngine",
        numericPriorityScoreRequired: false,
        opaqueScoreForbidden: true,
        dimensionsPreserved: true,
        impliesPoF: false,
      },
      limitations,
      assessedAt: input.assessedAt ?? new Date().toISOString(),
      evidenceConfidence: ec,
      trendConfidence: input.trendConfidence ?? ctx.trendConfidence,
      isHealthFactor: false,
      impliesPoF: false,
      createsWorkOrder: false,
      mutatesCanonicalLifecycle: false,
    };

    return { profile, abstained, abstentionReason };
  }
}

export function createAssetPriorityContextEngine(
  deps?: AssetPriorityContextEngineDeps,
): AssetPriorityContextEngine {
  return new AssetPriorityContextEngine(deps);
}
