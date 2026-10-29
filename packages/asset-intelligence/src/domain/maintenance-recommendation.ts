/**
 * Phase 10H — Maintenance Recommendation state + engine (not CMMS).
 */

import type { AssetDecisionContext } from "./decision-context";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type { AssetRiskSignalState } from "./risk";
import type { TrendConfidenceAssessment } from "./trend-confidence";
import {
  createMaintenanceRecommendationTaxonomyRegistry,
  type MaintenanceRecommendationCode,
  type MaintenanceRecommendationTaxonomyRegistry,
} from "./maintenance-taxonomy";

export type AssetMaintenanceRecommendationState = {
  id: string;
  tenantId?: string;
  workspaceId?: string;
  assetId: string;
  version: number;
  recommendationCode: MaintenanceRecommendationCode | string;
  recommendationClass: string;
  decisionContextRef: string;
  riskSignalRef?: string;
  rationale: string[];
  evidenceRefs: string[];
  confidence?: number;
  urgencyContext?: string;
  reviewStatus: string;
  reviewInstanceId?: string;
  method: "maintenance_recommendation_compose_v1";
  methodVersion: "1";
  provenance: Record<string, unknown>;
  limitations: string[];
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  supersedesId?: string;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  createsWorkOrder: false;
  isHealthFactor: false;
  calculatesRul: false;
  mutatesCanonicalLifecycle: false;
};

export type MaintenanceRecommendationInput = {
  decisionContext: AssetDecisionContext;
  riskSignal?: AssetRiskSignalState;
  evidenceConfidence: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  assessedAt?: string;
};

export type MaintenanceRecommendationResult = {
  recommendation: AssetMaintenanceRecommendationState;
  abstained: boolean;
  abstentionReason?: string;
};

export type MaintenanceRecommendationEngineDeps = {
  taxonomy?: MaintenanceRecommendationTaxonomyRegistry;
  newId?: (prefix: string) => string;
};

export class MaintenanceRecommendationEngine {
  readonly kind = "maintenance_recommendation_engine" as const;
  private readonly taxonomy: MaintenanceRecommendationTaxonomyRegistry;
  private readonly newId: (prefix: string) => string;

  constructor(deps: MaintenanceRecommendationEngineDeps = {}) {
    this.taxonomy = deps.taxonomy ?? createMaintenanceRecommendationTaxonomyRegistry();
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  assess(input: MaintenanceRecommendationInput): MaintenanceRecommendationResult {
    const ctx = input.decisionContext;
    const ec = input.evidenceConfidence;
    const limitations: string[] = [...ctx.limitations];
    let abstained = false;
    let abstentionReason: string | undefined;
    let code: MaintenanceRecommendationCode = "monitor";
    const rationale: string[] = [];

    if (["insufficient", "conflicting", "revoked"].includes(ec.dataSufficiency)) {
      abstained = true;
      abstentionReason = `evidence_${ec.dataSufficiency}`;
      code = "insufficient_evidence";
      rationale.push(`abstained:${abstentionReason}`);
      limitations.push(`abstained:${abstentionReason}`);
    } else if (
      ctx.decisionContextClass === "abstained" ||
      ctx.decisionContextClass === "insufficient_evidence"
    ) {
      abstained = true;
      abstentionReason = "decision_context_insufficient";
      code = "insufficient_evidence";
      rationale.push("decision_context_insufficient");
      limitations.push("abstained:decision_context_insufficient");
    } else {
      const riskClass = input.riskSignal?.riskSignalClass;
      if (riskClass === "consequence_sensitive") {
        code = "engineering_assessment";
        rationale.push("consequence_sensitive_risk_signal");
      } else if (riskClass === "elevated_attention") {
        code = ctx.degradationStateRefs.length
          ? "repair_assessment"
          : "condition_reassessment";
        rationale.push("elevated_attention_risk_signal");
      } else if (ctx.lifecycleIntelligenceRef && ctx.degradationStateRefs.length) {
        code = "life_extension_assessment";
        rationale.push("lifecycle_and_degradation_context");
      } else if (ctx.failureStateRefs.length) {
        code = "engineering_assessment";
        rationale.push("published_failure_context");
      } else if (ctx.degradationStateRefs.length) {
        code = "condition_reassessment";
        rationale.push("published_degradation_context");
      } else if (ctx.missingDimensions.includes("condition")) {
        code = "reinspect";
        rationale.push("condition_slice_missing");
      } else {
        code = "monitor";
        rationale.push("normal_context_monitor");
      }
      if (ctx.missingDimensions.length) {
        limitations.push(`missing:${ctx.missingDimensions.join(",")}`);
      }
    }

    const entry = this.taxonomy.get(code);
    const resolvedCode: MaintenanceRecommendationCode = code;
    const recommendation: AssetMaintenanceRecommendationState = {
      id: this.newId("maint_rec"),
      assetId: ctx.assetId,
      version: 1,
      recommendationCode: code,
      recommendationClass: entry?.category ?? "assessment",
      decisionContextRef: ctx.id,
      riskSignalRef: input.riskSignal?.id,
      rationale,
      evidenceRefs: [
        ctx.healthProfileRef,
        ctx.conditionStateRef,
        ctx.reliabilityStateRef,
        ...ctx.failureStateRefs,
        ...ctx.degradationStateRefs,
        ctx.lifecycleIntelligenceRef,
        input.riskSignal?.id,
      ].filter((x): x is string => Boolean(x)),
      confidence: ec.score,
      urgencyContext: urgencyContextFor(resolvedCode),
      reviewStatus: abstained ? "abstained" : "draft",
      method: "maintenance_recommendation_compose_v1",
      methodVersion: "1",
      provenance: {
        engine: "MaintenanceRecommendationEngine",
        taxonomyVersion: entry?.version ?? "1",
        createsWorkOrder: false,
        cmmsWorkOrderOwnership: "none_in_asset_intelligence",
        notCmmsWorkOrder: true,
        notDigitalTwinState: true,
        publishedSlicePolicy: "published_or_approved_only",
      },
      limitations,
      assessedAt: input.assessedAt ?? new Date().toISOString(),
      evidenceConfidence: ec,
      trendConfidence: input.trendConfidence ?? ctx.trendConfidence,
      createsWorkOrder: false,
      isHealthFactor: false,
      calculatesRul: false,
      mutatesCanonicalLifecycle: false,
    };

    return { recommendation, abstained, abstentionReason };
  }
}

function urgencyContextFor(code: MaintenanceRecommendationCode): string {
  if (code === "shutdown_assessment" || code === "operational_restriction_assessment") {
    return "elevated";
  }
  if (code === "monitor" || code === "no_action") return "routine";
  return "attention";
}

export function createMaintenanceRecommendationEngine(
  deps?: MaintenanceRecommendationEngineDeps,
): MaintenanceRecommendationEngine {
  return new MaintenanceRecommendationEngine(deps);
}
