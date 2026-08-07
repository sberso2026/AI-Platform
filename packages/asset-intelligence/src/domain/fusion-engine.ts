/**
 * Phase 10I — MultiSourceFusionEngine (no predictive ML).
 */

import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type {
  AssetFusionState,
  FusionComposeInput,
  FusionSourceContribution,
  FusionSourceKind,
} from "./fusion";
import type { TrendConfidenceAssessment } from "./trend-confidence";

export type MultiSourceFusionEngineDeps = {
  newId?: (prefix: string) => string;
};

export type FusionComposeResult = {
  fusion: AssetFusionState;
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

export class MultiSourceFusionEngine {
  readonly kind = "multi_source_fusion_engine" as const;
  private readonly newId: (prefix: string) => string;

  constructor(deps: MultiSourceFusionEngineDeps = {}) {
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  compose(input: FusionComposeInput): FusionComposeResult {
    const contributing: FusionSourceContribution[] = [];
    const missing: FusionSourceKind[] = [];
    const conflicting: FusionSourceKind[] = [];
    const limitations: string[] = [];
    let trendConfidence: TrendConfidenceAssessment | undefined;

    for (const src of input.sources) {
      if (src.kind === "inspection_intelligence_public" && src.contractVersion !== "1.0.0") {
        contributing.push({
          kind: src.kind,
          stateId: src.stateId,
          contractVersion: src.contractVersion,
          reviewStatus: src.reviewStatus,
          status: "excluded",
          note: "ii_contract_must_be_1.0.0",
        });
        limitations.push("ii_private_or_non_1.0.0_excluded");
        continue;
      }
      if (!PUBLISHED.has(src.reviewStatus)) {
        contributing.push({
          kind: src.kind,
          stateId: src.stateId,
          contractVersion: src.contractVersion,
          reviewStatus: src.reviewStatus,
          status: "excluded",
          note: `not_published:${src.reviewStatus}`,
        });
        continue;
      }
      if (src.trendConfidence && mustAbstainTrend(src.trendConfidence)) {
        contributing.push({
          kind: src.kind,
          stateId: src.stateId,
          reviewStatus: src.reviewStatus,
          status: "excluded",
          note: `trend_confidence:${src.trendConfidence.dataSufficiency}`,
        });
        trendConfidence = src.trendConfidence;
        limitations.push(`trend_excluded:${src.kind}`);
        continue;
      }
      if (src.trendConfidence) trendConfidence = src.trendConfidence;
      contributing.push({
        kind: src.kind,
        stateId: src.stateId,
        contractVersion: src.contractVersion,
        reviewStatus: src.reviewStatus,
        status: "included",
        note: src.note,
      });
    }

    const includedKinds = new Set(
      contributing.filter((c) => c.status === "included").map((c) => c.kind),
    );
    const expected: FusionSourceKind[] = [
      "condition",
      "reliability",
      "health",
      "failure",
      "degradation",
      "lifecycle",
      "risk_signal",
    ];
    for (const k of expected) {
      if (!includedKinds.has(k)) missing.push(k);
    }

    // Same-kind duplicates with different stateIds ⇒ conflict signal.
    const byKind = new Map<FusionSourceKind, string[]>();
    for (const c of contributing.filter((x) => x.status === "included" && x.stateId)) {
      const arr = byKind.get(c.kind) ?? [];
      arr.push(c.stateId!);
      byKind.set(c.kind, arr);
    }
    for (const [kind, ids] of byKind) {
      if (new Set(ids).size > 1) {
        conflicting.push(kind);
        for (const c of contributing) {
          if (c.kind === kind && c.status === "included") {
            c.status = "conflicting";
            c.note = "multiple_published_states_same_kind";
          }
        }
      }
    }

    const ec = input.evidenceConfidence;
    let abstained = false;
    let abstentionReason: string | undefined;
    let fusionClass: AssetFusionState["fusionClass"] = "aligned";

    if (mustAbstainEvidence(ec)) {
      abstained = true;
      abstentionReason = `evidence_${ec.dataSufficiency}`;
      fusionClass =
        ec.dataSufficiency === "conflicting" ? "conflicting" : "insufficient_evidence";
      limitations.push(`abstained:${abstentionReason}`);
    } else if (conflicting.length > 0) {
      fusionClass = "conflicting";
      limitations.push(`conflicts:${conflicting.join(",")}`);
    } else if (missing.includes("condition") && missing.includes("reliability") && !includedKinds.has("health")) {
      abstained = true;
      abstentionReason = "insufficient_core_sources";
      fusionClass = "insufficient_evidence";
      limitations.push("abstained:insufficient_core_sources");
    } else if (missing.length > 0) {
      fusionClass = "partial";
      limitations.push(`missing:${missing.join(",")}`);
    }

    if (abstained && fusionClass !== "conflicting") fusionClass = "abstained";

    const fusion: AssetFusionState = {
      id: this.newId("fusion"),
      assetId: input.assetId,
      version: 1,
      contributingSources: contributing,
      missingSources: [...new Set(missing)],
      conflictingSources: [...new Set(conflicting)],
      evidenceConfidenceRef: ec.assessmentId,
      trendConfidenceRef: trendConfidence?.assessmentId,
      fusionClass,
      method: "multi_source_fusion_v1",
      methodVersion: "1",
      confidence: ec.score,
      reviewStatus: abstained ? "abstained" : "draft",
      provenance: {
        engine: "MultiSourceFusionEngine",
        publishedSlicePolicy: "published_or_approved_only",
        iiContracts: "1.0.0",
        predictiveMlExecuted: false,
        opaqueScoreForbidden: true,
      },
      limitations,
      assessedAt: input.assessedAt ?? new Date().toISOString(),
      evidenceConfidence: ec,
      trendConfidence,
      predictiveMlExecuted: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      isHealthFactor: false,
      createsCoreRisk: false,
      createsWorkOrder: false,
      mutatesCanonicalLifecycle: false,
    };

    return { fusion, abstained, abstentionReason };
  }
}

export function createMultiSourceFusionEngine(
  deps?: MultiSourceFusionEngineDeps,
): MultiSourceFusionEngine {
  return new MultiSourceFusionEngine(deps);
}
