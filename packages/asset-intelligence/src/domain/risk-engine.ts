/**
 * Phase 10H — RiskSignalEngine (advisory; no Core Risk mutation / PoF).
 */

import type { AssetRiskCandidate, AssetRiskSignalState, RiskSignalClass, RiskSignalInput } from "./risk";

export type RiskSignalEngineDeps = {
  newId?: (prefix: string) => string;
};

export type RiskSignalResult = {
  riskSignal: AssetRiskSignalState;
  riskCandidate?: AssetRiskCandidate;
  abstained: boolean;
  abstentionReason?: string;
};

export class RiskSignalEngine {
  readonly kind = "risk_signal_engine" as const;
  private readonly newId: (prefix: string) => string;

  constructor(deps: RiskSignalEngineDeps = {}) {
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  assess(input: RiskSignalInput): RiskSignalResult {
    const ctx = input.decisionContext;
    const ec = input.evidenceConfidence;
    const limitations = [...ctx.limitations];
    let abstained = false;
    let abstentionReason: string | undefined;
    let riskSignalClass: RiskSignalClass = "normal_context";

    if (["insufficient", "conflicting", "revoked"].includes(ec.dataSufficiency)) {
      abstained = true;
      abstentionReason = `evidence_${ec.dataSufficiency}`;
      riskSignalClass =
        ec.dataSufficiency === "conflicting" ? "conflicting_context" : "insufficient_evidence";
      limitations.push(`abstained:${abstentionReason}`);
    } else if (ctx.decisionContextClass === "abstained" || ctx.decisionContextClass === "insufficient_evidence") {
      abstained = true;
      abstentionReason = "decision_context_insufficient";
      riskSignalClass = "insufficient_evidence";
      limitations.push("abstained:decision_context_insufficient");
    } else if (ctx.decisionContextClass === "conflicting_context") {
      abstained = true;
      abstentionReason = "decision_context_conflicting";
      riskSignalClass = "conflicting_context";
      limitations.push("abstained:decision_context_conflicting");
    } else {
      const hasFailure = ctx.failureStateRefs.length > 0;
      const hasDegradation = ctx.degradationStateRefs.length > 0;
      const highCriticality =
        ctx.criticalityStateRef != null &&
        ctx.availableDimensions.includes("criticality");

      if (highCriticality && (hasFailure || hasDegradation)) {
        riskSignalClass = "consequence_sensitive";
      } else if (hasFailure && hasDegradation) {
        riskSignalClass = "elevated_attention";
      } else if (hasFailure || hasDegradation || ctx.lifecycleIntelligenceRef) {
        riskSignalClass = "attention";
      } else {
        riskSignalClass = "normal_context";
      }
      if (ctx.missingDimensions.length > 0) {
        limitations.push(`missing_dimensions:${ctx.missingDimensions.join(",")}`);
      }
    }

    const riskSignal: AssetRiskSignalState = {
      id: this.newId("risk_signal"),
      assetId: ctx.assetId,
      version: 1,
      riskSignalClass,
      riskSignalCategory: "advisory_context",
      decisionContextRef: ctx.id,
      healthContextRef: ctx.healthProfileRef,
      criticalityContextRef: ctx.criticalityStateRef,
      failureContextRefs: ctx.failureStateRefs,
      degradationContextRefs: ctx.degradationStateRefs,
      lifecycleContextRef: ctx.lifecycleIntelligenceRef,
      evidenceConfidenceRef: ec.assessmentId,
      trendConfidenceRef: input.trendConfidence?.assessmentId ?? ctx.trendConfidenceRef,
      consequenceContext: highCriticalityHint(ctx),
      exposureContext: exposureHint(ctx),
      confidence: ec.score,
      method: "risk_signal_compose_v1",
      methodVersion: "1",
      reviewStatus: abstained ? "abstained" : "draft",
      provenance: {
        engine: "RiskSignalEngine",
        decisionContextId: ctx.id,
        probabilityOfFailureCertified: false,
        createsCoreRisk: false,
        canonicalEngineeringRiskOwnership: "engineering_core",
        riskCoreAutoMutationAllowed: false,
        publishedSlicePolicy: "published_or_approved_only",
        notUniversalIndustryRiskRating: true,
      },
      limitations,
      assessedAt: input.assessedAt ?? new Date().toISOString(),
      evidenceConfidence: ec,
      trendConfidence: input.trendConfidence ?? ctx.trendConfidence,
      probabilityOfFailureCertified: false,
      createsCoreRisk: false,
      isHealthFactor: false,
      mutatesCanonicalLifecycle: false,
    };

    let riskCandidate: AssetRiskCandidate | undefined;
    if (
      !abstained &&
      (riskSignalClass === "elevated_attention" || riskSignalClass === "consequence_sensitive")
    ) {
      riskCandidate = {
        candidateId: this.newId("risk_candidate"),
        assetId: ctx.assetId,
        riskSignalRef: riskSignal.id,
        title: `Risk attention candidate (${riskSignalClass})`,
        description:
          "Advisory Risk Candidate for human-gated Engineering Core adapter conversion only.",
        consequenceContext: riskSignal.consequenceContext,
        evidenceRefs: [
          ctx.healthProfileRef,
          ctx.criticalityStateRef,
          ...ctx.failureStateRefs,
          ...ctx.degradationStateRefs,
          ctx.lifecycleIntelligenceRef,
        ].filter((x): x is string => Boolean(x)),
        confidence: ec.score,
        limitations: [
          "not_canonical_risk",
          "requires_human_gated_engineering_core_adapter",
          "riskCoreAutoMutationAllowed=false",
        ],
        createdAt: riskSignal.assessedAt,
        status: "proposed",
        autoMutatesCoreRisk: false,
        requiresHumanGatedAdapter: true,
      };
    }

    return { riskSignal, riskCandidate, abstained, abstentionReason };
  }
}

function highCriticalityHint(ctx: { criticalityStateRef?: string; availableDimensions: string[] }): string | undefined {
  if (ctx.criticalityStateRef && ctx.availableDimensions.includes("criticality")) {
    return "criticality_context_present";
  }
  return undefined;
}

function exposureHint(ctx: {
  failureStateRefs: string[];
  degradationStateRefs: string[];
}): string | undefined {
  if (ctx.failureStateRefs.length && ctx.degradationStateRefs.length) {
    return "failure_and_degradation_published";
  }
  if (ctx.failureStateRefs.length) return "failure_published";
  if (ctx.degradationStateRefs.length) return "degradation_published";
  return undefined;
}

export function createRiskSignalEngine(deps?: RiskSignalEngineDeps): RiskSignalEngine {
  return new RiskSignalEngine(deps);
}
