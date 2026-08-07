/**
 * Phase 10D — Evidence Confidence Engine (cross-capability).
 * Describes confidence in the evidence basis — not engineering correctness.
 */

export type EvidenceSufficiencyOutcome =
  | "sufficient"
  | "limited"
  | "insufficient"
  | "conflicting"
  | "stale"
  | "revoked";

export type EvidenceConfidenceAssessment = {
  assessmentId: string;
  assetId: string;
  tenantId?: string;
  workspaceId?: string;
  scope: string;
  score: number;
  confidenceClass: "high" | "medium" | "low" | "unavailable";
  confidence: number;
  sourceCount: number;
  sourceDiversity: number;
  freshness: number;
  reviewCompleteness: number;
  conflictState: "none" | "detected";
  lineageIntegrity: "intact" | "degraded" | "unknown";
  dataSufficiency: EvidenceSufficiencyOutcome;
  abstentionReason?: string;
  method: "evidence_confidence_v1";
  methodVersion: "1";
  assessedAt: string;
  reasons: string[];
  /** Not proof of correctness. */
  engineeringCorrectnessClaimed: false;
};

export type EvidenceConfidenceInput = {
  assessmentId: string;
  assetId: string;
  tenantId?: string;
  workspaceId?: string;
  scope?: string;
  evidenceRefs?: string[];
  sourceKeys?: string[];
  sourceTypes?: string[];
  observedAt?: string;
  asOf?: string;
  reviewStatus?: string;
  confidenceHint?: number;
  conflictDetected?: boolean;
  revokedRefs?: string[];
  lineageIntact?: boolean;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
};

export class EvidenceConfidenceEngine {
  readonly kind = "evidence_confidence_engine" as const;

  assess(input: EvidenceConfidenceInput): EvidenceConfidenceAssessment {
    const asOf = input.asOf ?? new Date().toISOString();
    const refs = (input.evidenceRefs ?? []).filter(
      (r) => !(input.revokedRefs ?? []).includes(r),
    );
    const sources = new Set([
      ...(input.sourceKeys ?? []),
      ...(input.sourceTypes ?? []),
    ]);
    const reasons: string[] = [];

    if ((input.revokedRefs?.length ?? 0) > 0) {
      reasons.push("revoked_evidence_excluded");
    }
    if (input.conflictDetected) {
      reasons.push("conflicting_evidence");
    }
    if (refs.length === 0) reasons.push("no_evidence_refs");

    const evidenceVolumeScore = Math.min(1, refs.length / 3);
    const freshness = scoreFreshness(
      input.observedAt,
      asOf,
      input.freshnessHorizonHours ?? 2160,
    );
    if (freshness < 0.3) reasons.push("stale_evidence");

    const sourceDiversity = Math.min(1, sources.size / 2);
    if (sources.size < 1) reasons.push("no_registered_sources");

    const reviewCompleteness =
      input.reviewStatus === "approved" || input.reviewStatus === "published"
        ? 1
        : input.reviewStatus === "pending_review" || input.reviewStatus === "in_review"
          ? 0.5
          : input.reviewStatus
            ? 0.35
            : 0.2;
    if (reviewCompleteness < 0.5) reasons.push("review_incomplete");

    const lineageIntegrity: EvidenceConfidenceAssessment["lineageIntegrity"] =
      input.lineageIntact === false
        ? "degraded"
        : input.lineageIntact === true
          ? "intact"
          : "unknown";
    if (lineageIntegrity === "degraded") reasons.push("lineage_degraded");

    const hint = typeof input.confidenceHint === "number" ? clamp01(input.confidenceHint) : 0.5;
    const score = clamp01(
      0.28 * evidenceVolumeScore +
        0.22 * freshness +
        0.18 * sourceDiversity +
        0.17 * reviewCompleteness +
        0.1 * hint +
        0.05 * (lineageIntegrity === "intact" ? 1 : lineageIntegrity === "unknown" ? 0.5 : 0.2),
    );

    let dataSufficiency: EvidenceSufficiencyOutcome = "sufficient";
    let abstentionReason: string | undefined;

    if (input.conflictDetected) {
      dataSufficiency = "conflicting";
      abstentionReason = "conflicting_evidence";
    } else if (refs.length === 0) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_evidence";
    } else if (freshness < 0.2) {
      dataSufficiency = "stale";
      abstentionReason = "stale_evidence";
    } else if (score < (input.sufficiencyThreshold ?? 0.45)) {
      dataSufficiency = "insufficient";
      abstentionReason = "insufficient_evidence";
    } else if (score < 0.65) {
      dataSufficiency = "limited";
    }

    const confidenceClass =
      dataSufficiency === "insufficient" ||
      dataSufficiency === "conflicting" ||
      dataSufficiency === "stale" ||
      dataSufficiency === "revoked"
        ? "unavailable"
        : score >= 0.75
          ? "high"
          : score >= 0.5
            ? "medium"
            : "low";

    return {
      assessmentId: input.assessmentId,
      assetId: input.assetId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      scope: input.scope ?? "asset_intelligence",
      score,
      confidenceClass,
      confidence: score,
      sourceCount: refs.length,
      sourceDiversity,
      freshness,
      reviewCompleteness,
      conflictState: input.conflictDetected ? "detected" : "none",
      lineageIntegrity,
      dataSufficiency,
      abstentionReason,
      method: "evidence_confidence_v1",
      methodVersion: "1",
      assessedAt: asOf,
      reasons,
      engineeringCorrectnessClaimed: false,
    };
  }
}

export function createEvidenceConfidenceEngine(): EvidenceConfidenceEngine {
  return new EvidenceConfidenceEngine();
}

function scoreFreshness(
  observedAt: string | undefined,
  asOf: string,
  horizonHours: number,
): number {
  if (!observedAt) return 0.2;
  const ageMs = Date.parse(asOf) - Date.parse(observedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0) return 0.2;
  return clamp01(1 - ageMs / (1000 * 60 * 60) / horizonHours);
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
