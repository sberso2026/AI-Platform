/**
 * Phase 10H — AssetDecisionContextEngine.
 * Prepares published intelligence context. No autonomous decisions.
 */

import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type {
  AssetDecisionContext,
  DecisionContextClass,
  DecisionContextInput,
  DecisionDimension,
  PublishedSliceRef,
} from "./decision-context";
import type { TrendConfidenceAssessment } from "./trend-confidence";

export type DecisionContextEngineDeps = {
  newId?: (prefix: string) => string;
};

export type DecisionContextResult = {
  context: AssetDecisionContext;
  abstained: boolean;
  abstentionReason?: string;
};

const PUBLISHED = new Set(["published", "approved"]);

function mustAbstainEvidence(ec: EvidenceConfidenceAssessment): boolean {
  return ["insufficient", "conflicting", "revoked"].includes(ec.dataSufficiency);
}

function mustAbstainTrend(tc: TrendConfidenceAssessment): boolean {
  return ["insufficient", "conflicting", "revoked"].includes(tc.dataSufficiency);
}

export class AssetDecisionContextEngine {
  readonly kind = "asset_decision_context_engine" as const;
  private readonly newId: (prefix: string) => string;

  constructor(deps: DecisionContextEngineDeps = {}) {
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  compose(input: DecisionContextInput): DecisionContextResult {
    const contributing: PublishedSliceRef[] = [];
    const available: DecisionDimension[] = [];
    const missing: DecisionDimension[] = [];
    const conflicting: DecisionDimension[] = [];
    const limitations: string[] = [];

    const pick = (
      slice: { stateId: string; reviewStatus: string; note?: string } | undefined,
      dim: DecisionDimension,
    ): string | undefined => {
      if (!slice) {
        missing.push(dim);
        return undefined;
      }
      if (!PUBLISHED.has(slice.reviewStatus)) {
        contributing.push({
          kind: dim,
          stateId: slice.stateId,
          reviewStatus: "excluded",
          note: `not_published:${slice.reviewStatus}`,
        });
        missing.push(dim);
        return undefined;
      }
      contributing.push({
        kind: dim,
        stateId: slice.stateId,
        reviewStatus: "published",
        note: slice.note,
      });
      available.push(dim);
      return slice.stateId;
    };

    const healthProfileRef = input.healthProfileRef;
    if (healthProfileRef) {
      available.push("health");
      contributing.push({
        kind: "health",
        stateId: healthProfileRef,
        reviewStatus: "published",
      });
    } else {
      missing.push("health");
    }

    const criticalityStateRef = pick(input.criticality, "criticality");
    const conditionStateRef = pick(input.condition, "condition");
    const reliabilityStateRef = pick(input.reliability, "reliability");
    const lifecycleIntelligenceRef = pick(input.lifecycle, "lifecycle");

    const failureStateRefs: string[] = [];
    for (const f of input.failures ?? []) {
      if (PUBLISHED.has(f.reviewStatus)) {
        failureStateRefs.push(f.stateId);
        contributing.push({ kind: "failure", stateId: f.stateId, reviewStatus: "published" });
      } else {
        contributing.push({
          kind: "failure",
          stateId: f.stateId,
          reviewStatus: "excluded",
          note: `not_published:${f.reviewStatus}`,
        });
      }
    }
    if (failureStateRefs.length > 0) available.push("failure");
    else missing.push("failure");

    const trendStateRefs: string[] = [];
    const degradationStateRefs: string[] = [];
    let trendConfidence: TrendConfidenceAssessment | undefined;
    let trendExcluded = false;

    for (const t of input.trends ?? []) {
      if (!PUBLISHED.has(t.reviewStatus)) {
        contributing.push({
          kind: "trend",
          stateId: t.stateId,
          reviewStatus: "excluded",
          note: `not_published:${t.reviewStatus}`,
        });
        continue;
      }
      if (t.trendConfidence && mustAbstainTrend(t.trendConfidence)) {
        trendExcluded = true;
        contributing.push({
          kind: "trend",
          stateId: t.stateId,
          reviewStatus: "excluded",
          note: `trend_confidence:${t.trendConfidence.dataSufficiency}`,
        });
        trendConfidence = t.trendConfidence;
        continue;
      }
      trendStateRefs.push(t.stateId);
      if (t.trendConfidence) trendConfidence = t.trendConfidence;
      contributing.push({ kind: "trend", stateId: t.stateId, reviewStatus: "published" });
    }
    for (const d of input.degradations ?? []) {
      if (!PUBLISHED.has(d.reviewStatus)) {
        contributing.push({
          kind: "degradation",
          stateId: d.stateId,
          reviewStatus: "excluded",
          note: `not_published:${d.reviewStatus}`,
        });
        continue;
      }
      if (d.trendConfidence && mustAbstainTrend(d.trendConfidence)) {
        trendExcluded = true;
        contributing.push({
          kind: "degradation",
          stateId: d.stateId,
          reviewStatus: "excluded",
          note: `trend_confidence:${d.trendConfidence.dataSufficiency}`,
        });
        trendConfidence = d.trendConfidence;
        continue;
      }
      degradationStateRefs.push(d.stateId);
      if (d.trendConfidence) trendConfidence = d.trendConfidence;
      contributing.push({
        kind: "degradation",
        stateId: d.stateId,
        reviewStatus: "published",
      });
    }
    if (trendStateRefs.length > 0) available.push("trend");
    else if ((input.trends?.length ?? 0) === 0) missing.push("trend");
    if (degradationStateRefs.length > 0) available.push("degradation");
    else if ((input.degradations?.length ?? 0) === 0) missing.push("degradation");
    if (trendExcluded) {
      limitations.push("trend_or_degradation_excluded_for_insufficient_trend_confidence");
    }

    available.push("evidence_confidence");
    if (trendConfidence) available.push("trend_confidence");

    const ec = input.evidenceConfidence;
    if (ec.dataSufficiency === "conflicting") conflicting.push("evidence_confidence");

    let abstained = false;
    let abstentionReason: string | undefined;
    let decisionContextClass: DecisionContextClass = "complete_enough";

    if (mustAbstainEvidence(ec)) {
      abstained = true;
      abstentionReason = `evidence_${ec.dataSufficiency}`;
      decisionContextClass =
        ec.dataSufficiency === "conflicting" ? "conflicting_context" : "insufficient_evidence";
      limitations.push(`abstained:${abstentionReason}`);
    } else if (missing.includes("condition") && missing.includes("reliability") && !healthProfileRef) {
      abstained = true;
      abstentionReason = "insufficient_core_slices";
      decisionContextClass = "insufficient_evidence";
      limitations.push("abstained:insufficient_core_slices");
    } else if (missing.length > 0) {
      decisionContextClass = "partial";
      limitations.push(`missing:${missing.join(",")}`);
    }

    if (abstained) decisionContextClass = decisionContextClass === "conflicting_context"
      ? "conflicting_context"
      : "abstained";

    const context: AssetDecisionContext = {
      id: this.newId("decision_ctx"),
      assetId: input.assetId,
      snapshotId: input.snapshotId,
      healthProfileRef,
      criticalityStateRef,
      conditionStateRef,
      reliabilityStateRef,
      failureStateRefs,
      trendStateRefs,
      degradationStateRefs,
      lifecycleIntelligenceRef,
      evidenceConfidenceRef: ec.assessmentId,
      trendConfidenceRef: trendConfidence?.assessmentId,
      availableDimensions: [...new Set(available)],
      missingDimensions: [...new Set(missing)],
      conflictingDimensions: [...new Set(conflicting)],
      contributingSlices: contributing,
      decisionContextClass: abstained
        ? decisionContextClass === "conflicting_context"
          ? "conflicting_context"
          : "abstained"
        : decisionContextClass,
      method: "decision_context_compose_v1",
      methodVersion: "1",
      confidence: ec.score,
      limitations,
      provenance: {
        engine: "AssetDecisionContextEngine",
        publishedSlicePolicy: "published_or_approved_only",
        autonomousDecisionAuthority: false,
      },
      evidenceConfidence: ec,
      trendConfidence,
      calculatedAt: input.assessedAt ?? new Date().toISOString(),
      autonomousDecisionAuthority: false,
      mutatesCanonicalLifecycle: false,
      createsCoreRisk: false,
      createsWorkOrder: false,
      calculatesPoF: false,
      calculatesRul: false,
      isHealthFactor: false,
    };

    return { context, abstained, abstentionReason };
  }
}

export function createAssetDecisionContextEngine(
  deps?: DecisionContextEngineDeps,
): AssetDecisionContextEngine {
  return new AssetDecisionContextEngine(deps);
}
