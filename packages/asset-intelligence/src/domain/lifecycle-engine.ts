/**
 * Phase 10G — LifecycleContextEngine.
 * Consumes published slices + read-only canonical lifecycle reference.
 * Never mutates canonical lifecycle or Health Index.
 */

import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type {
  AssetLifecycleIntelligenceState,
  LifecycleContextClass,
  LifecycleContextInput,
  LifecycleSliceContribution,
  LifecycleTransitionCandidate,
} from "./lifecycle";
import {
  createLifecycleTaxonomyRegistry,
  type LifecycleTaxonomyRegistry,
} from "./lifecycle-taxonomy";
import type { TrendConfidenceAssessment } from "./trend-confidence";

export type LifecycleContextEngineDeps = {
  taxonomy?: LifecycleTaxonomyRegistry;
  newId?: (prefix: string) => string;
};

export type LifecycleContextResult = {
  lifecycle: AssetLifecycleIntelligenceState;
  transitionCandidates: LifecycleTransitionCandidate[];
  abstained: boolean;
  abstentionReason?: string;
};

const PUBLISHED = new Set(["published", "approved"]);

export class LifecycleContextEngine {
  readonly kind = "lifecycle_context_engine" as const;
  private readonly taxonomy: LifecycleTaxonomyRegistry;
  private readonly newId: (prefix: string) => string;

  constructor(deps: LifecycleContextEngineDeps = {}) {
    this.taxonomy = deps.taxonomy ?? createLifecycleTaxonomyRegistry();
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  compose(input: LifecycleContextInput): LifecycleContextResult {
    if (input.canonicalLifecycle.sourceOwner !== "engineering_os_shared_domain") {
      throw new Error("canonical_lifecycle_owner_must_be_shared_domain");
    }
    if (input.canonicalLifecycle.writeBackForbidden !== true) {
      throw new Error("canonical_lifecycle_writeback_must_be_forbidden");
    }

    const contributing: LifecycleSliceContribution[] = [
      {
        kind: "canonical_lifecycle",
        status: "published",
        note: `stage=${input.canonicalLifecycle.canonicalLifecycleStage}:v${input.canonicalLifecycle.stageVersion}`,
      },
    ];
    const missing: string[] = [];
    const conflicting: string[] = [];

    const condition = pickPublished(input.condition, "condition", contributing, missing);
    const reliability = pickPublished(
      input.reliability,
      "reliability",
      contributing,
      missing,
    );
    // Criticality is context-only — never controls lifecycle stage.
    if (input.criticality && PUBLISHED.has(input.criticality.reviewStatus)) {
      contributing.push({
        kind: "criticality_context",
        stateId: input.criticality.stateId,
        status: "published",
        note: "context_only_not_stage_control",
      });
    } else {
      missing.push("criticality_context");
    }

    const failureRefs: string[] = [];
    for (const f of input.failures ?? []) {
      if (PUBLISHED.has(f.reviewStatus)) {
        failureRefs.push(f.stateId);
        contributing.push({ kind: "failure", stateId: f.stateId, status: "published" });
      } else {
        contributing.push({
          kind: "failure",
          stateId: f.stateId,
          status: "excluded",
          note: `not_published:${f.reviewStatus}`,
        });
      }
    }
    if ((input.failures?.length ?? 0) === 0) missing.push("failure");

    const trendRefs: string[] = [];
    const degradationRefs: string[] = [];
    let trendConfidence: TrendConfidenceAssessment | undefined;
    let trendExcludedForConfidence = false;

    for (const t of input.trends ?? []) {
      if (!PUBLISHED.has(t.reviewStatus)) {
        contributing.push({
          kind: "trend",
          stateId: t.stateId,
          status: "excluded",
          note: `not_published:${t.reviewStatus}`,
        });
        continue;
      }
      if (t.trendConfidence && mustAbstainTrend(t.trendConfidence)) {
        trendExcludedForConfidence = true;
        contributing.push({
          kind: "trend",
          stateId: t.stateId,
          status: "excluded",
          note: `trend_confidence:${t.trendConfidence.dataSufficiency}`,
        });
        continue;
      }
      trendRefs.push(t.stateId);
      contributing.push({ kind: "trend", stateId: t.stateId, status: "published" });
      trendConfidence = t.trendConfidence ?? trendConfidence;
    }

    for (const d of input.degradations ?? []) {
      if (!PUBLISHED.has(d.reviewStatus)) {
        contributing.push({
          kind: "degradation",
          stateId: d.stateId,
          status: "excluded",
          note: `not_published:${d.reviewStatus}`,
        });
        continue;
      }
      if (d.trendConfidence && mustAbstainTrend(d.trendConfidence)) {
        trendExcludedForConfidence = true;
        contributing.push({
          kind: "degradation",
          stateId: d.stateId,
          status: "excluded",
          note: `trend_confidence:${d.trendConfidence.dataSufficiency}`,
        });
        continue;
      }
      degradationRefs.push(d.stateId);
      contributing.push({ kind: "degradation", stateId: d.stateId, status: "published" });
      trendConfidence = d.trendConfidence ?? trendConfidence;
    }

    if ((input.trends?.length ?? 0) === 0) missing.push("trend");
    if ((input.degradations?.length ?? 0) === 0) missing.push("degradation");

    const ec = input.evidenceConfidence;
    const ecAbstain = ec ? mustAbstainEvidence(ec) : false;
    if (ec?.dataSufficiency === "conflicting") {
      conflicting.push("evidence_confidence");
    }

    // Detect simple slice disagreement: published degradation degrading vs reliability excellent.
    if (
      degradationRefs.length > 0 &&
      reliability &&
      (input.reliability?.rating ?? "").toLowerCase() === "excellent"
    ) {
      const deg = (input.degradations ?? []).find((d) => degradationRefs.includes(d.stateId));
      if (deg?.direction === "degrading") {
        conflicting.push("reliability_vs_degradation");
        contributing.push({
          kind: "reliability",
          stateId: reliability.stateId,
          status: "conflicting",
          note: "disagrees_with_published_degradation",
        });
      }
    }

    let contextClass: LifecycleContextClass = "normal_operational_context";
    let abstained = false;
    let abstentionReason: string | undefined;
    const rationale: string[] = [];

    if (ecAbstain || conflicting.length > 0) {
      abstained = true;
      contextClass =
        conflicting.length > 0 ? "conflicting_context" : "insufficient_evidence";
      abstentionReason =
        ec?.abstentionReason ??
        (conflicting.length > 0 ? "conflicting_slices" : "insufficient_evidence");
      rationale.push(abstentionReason);
    } else if (degradationRefs.length > 0) {
      contextClass = "degradation_attention";
      rationale.push("published_degradation_context_present");
    } else if (input.commissionedAt && serviceAgeDays(input.commissionedAt, input.recordedAt) > 365 * 20) {
      // Age is context only — never sole basis for failure/RUL; may flag ageing_context.
      contextClass = "ageing_context";
      rationale.push("service_age_context_only_not_condition_claim");
    } else if (!condition || !reliability) {
      contextClass = "insufficient_evidence";
      abstained = true;
      abstentionReason = "missing_core_published_slices";
      rationale.push("condition_or_reliability_published_slice_missing");
    } else {
      rationale.push("published_condition_and_reliability_support_normal_context");
    }

    if (trendExcludedForConfidence) {
      rationale.push("trend_or_degradation_excluded_due_to_trend_confidence");
    }

    const code =
      contextClass === "normal_operational_context"
        ? "LC.NORMAL_OPERATIONAL_CONTEXT"
        : contextClass === "ageing_context"
          ? "LC.AGEING_CONTEXT"
          : contextClass === "degradation_attention"
            ? "LC.DEGRADATION_ATTENTION"
            : contextClass === "conflicting_context"
              ? "LC.CONFLICTING_CONTEXT"
              : "LC.INSUFFICIENT_EVIDENCE";
    this.taxonomy.requireActive("lifecycle_context_class", code);

    const lifecycle: AssetLifecycleIntelligenceState = {
      kind: "lifecycle_intelligence",
      stateId: this.newId("life"),
      assetId: input.assetId,
      recordedAt: input.recordedAt,
      provenance: {
        ...input.provenance,
        method: abstained ? "abstain_lifecycle_context_v1" : "lifecycle_context_v1",
        confidence: ec?.score,
      },
      silentIdentityMutationForbidden: true,
      canonicalLifecycleRef: input.canonicalLifecycle,
      lifecycleContextClass: contextClass,
      lifecycleContextCode: code,
      lifecycleContextRationale: rationale,
      operatingState: input.operatingState,
      maintenanceState: input.maintenanceState,
      conditionStateRef: condition?.stateId,
      reliabilityStateRef: reliability?.stateId,
      failureStateRefs: failureRefs,
      trendStateRefs: trendRefs,
      degradationStateRefs: degradationRefs,
      contributingSlices: contributing,
      missingSlices: missing,
      conflictingSlices: conflicting,
      evidenceConfidenceRef: ec?.assessmentId,
      trendConfidenceRef: trendConfidence?.assessmentId,
      confidence: ec?.score,
      method: abstained ? "abstain_lifecycle_context_v1" : "lifecycle_context_v1",
      methodVersion: "1",
      reviewStatus: abstained
        ? "draft"
        : input.startReview === false
          ? "draft"
          : "pending_review",
      evidenceConfidence: ec,
      trendConfidence,
      assessedAt: input.recordedAt,
      limitations: [
        "advisory_only",
        "no_canonical_lifecycle_mutation",
        "not_health_factor",
        "not_cmms",
        "not_digital_twin",
        "age_alone_not_condition",
        "age_alone_not_degradation",
        "age_alone_not_rul",
        "failure_presence_not_auto_transition",
        "criticality_context_only",
        ...(trendExcludedForConfidence ? ["trend_confidence_gate_applied"] : []),
      ],
      serviceAgeContext: {
        commissionedAt: input.commissionedAt,
        serviceAgeDays: input.commissionedAt
          ? serviceAgeDays(input.commissionedAt, input.recordedAt)
          : undefined,
        designLifeReference: input.designLifeReference,
        ageAloneDoesNotDetermineCondition: true,
        ageAloneDoesNotDetermineDegradation: true,
        ageAloneDoesNotDetermineRul: true,
      },
      mutatesCanonicalLifecycle: false,
      isHealthFactor: false,
      predictiveMlUsed: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      accuracyClaimsCertified: false,
      aiMayPublishForbidden: true,
    };

    const transitionCandidates: LifecycleTransitionCandidate[] = [];
    if (!abstained && contextClass === "degradation_attention") {
      const tax = this.taxonomy.requireActive(
        "transition_candidate",
        "TC.LIFE_EXTENSION_REVIEW",
      );
      transitionCandidates.push({
        kind: "lifecycle_transition_candidate",
        candidateId: this.newId("ltc"),
        assetId: input.assetId,
        code: tax.code,
        label: tax.name,
        rationale: ["published_degradation_context", "candidate_only"],
        lifecycleIntelligenceStateId: lifecycle.stateId,
        recommendedReview: "shared_domain_lifecycle_governance",
        status: "proposed",
        mutatesCanonicalLifecycle: false,
        createdAt: input.recordedAt,
      });
    }

    return { lifecycle, transitionCandidates, abstained, abstentionReason };
  }
}

export function createLifecycleContextEngine(
  deps?: LifecycleContextEngineDeps,
): LifecycleContextEngine {
  return new LifecycleContextEngine(deps);
}

function pickPublished(
  slice: { stateId: string; reviewStatus: string } | undefined,
  kind: LifecycleSliceContribution["kind"],
  contributing: LifecycleSliceContribution[],
  missing: string[],
): { stateId: string } | undefined {
  if (!slice) {
    missing.push(kind);
    return undefined;
  }
  if (!PUBLISHED.has(slice.reviewStatus)) {
    contributing.push({
      kind,
      stateId: slice.stateId,
      status: "excluded",
      note: `not_published:${slice.reviewStatus}`,
    });
    missing.push(kind);
    return undefined;
  }
  contributing.push({ kind, stateId: slice.stateId, status: "published" });
  return { stateId: slice.stateId };
}

function mustAbstainEvidence(ec: EvidenceConfidenceAssessment): boolean {
  return (
    ec.dataSufficiency === "insufficient" ||
    ec.dataSufficiency === "conflicting" ||
    ec.dataSufficiency === "stale" ||
    ec.dataSufficiency === "revoked"
  );
}

function mustAbstainTrend(tc: TrendConfidenceAssessment): boolean {
  return (
    tc.dataSufficiency === "insufficient" ||
    tc.dataSufficiency === "conflicting" ||
    tc.dataSufficiency === "stale" ||
    tc.dataSufficiency === "revoked" ||
    tc.confidenceClass === "abstain"
  );
}

function serviceAgeDays(commissionedAt: string, asOf: string): number {
  const a = Date.parse(commissionedAt);
  const b = Date.parse(asOf);
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return 0;
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}
