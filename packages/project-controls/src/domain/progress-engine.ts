/**
 * Phase 11B — Progress Intelligence Engine.
 *
 * Evidence-driven and abstention-first. The engine will not produce a completion
 * indication unless the confidence engine reports a sufficient or limited basis,
 * and it never derives one from cost, budget or a schedule network.
 *
 * Explicitly forbidden here and enforced by `assertNoEarnedValue`:
 *   - earned value of any flavour (PV/EV/AC, CPI/SPI, BCWS/BCWP/ACWP)
 *   - critical path, float, forward/backward pass
 *   - forecasting a completion date or cost
 */

import {
  createProgressConfidenceEngine,
  type ProgressConfidenceEngine,
} from "./progress-confidence";
import {
  isAbstainingSufficiency,
  progressBandFor,
  type ProgressAssessmentState,
  type ProgressBand,
  type ProgressConfidence,
  type ProgressEvidence,
  type ProgressTrendDirection,
  type ProjectScopeRef,
} from "./progress";
import {
  EARNED_VALUE_IMPLEMENTED,
  CPM_SCHEDULING_IMPLEMENTED,
  COST_ENGINE_IMPLEMENTED,
  FORECASTING_IMPLEMENTED,
  PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY,
  PROGRESS_MEASUREMENT_IS_EARNED_VALUE,
} from "../version";

export type ProgressAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  evidence: readonly ProgressEvidence[];
  /** Version of the state that will be written. Defaults to 1. */
  version?: number;
  status?: ProgressAssessmentState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  /** Previous published indication, used only to describe direction. */
  previousIndication?: number;
  previousAssessedAt?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  disagreementThreshold?: number;
  minimumEvidenceCount?: number;
};

export type ProgressAssessmentResult = {
  assessment: ProgressAssessmentState;
  confidence: ProgressConfidence;
  abstained: boolean;
  abstentionReason?: string;
};

export type ProgressIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: ProgressConfidenceEngine;
};

export class ProgressIntelligenceEngine {
  readonly kind = "progress_intelligence_engine" as const;
  private readonly confidenceEngine: ProgressConfidenceEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: ProgressIntelligenceEngineDeps = {}) {
    assertNoEarnedValue();
    this.confidenceEngine = deps.confidenceEngine ?? createProgressConfidenceEngine();
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: ProgressAssessmentInput): ProgressAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];

    if (!input.projectId) throw new Error("project_id_required");
    if (input.scope.kind !== "project" && !input.scope.referenceId) {
      throw new Error("scope_reference_id_required");
    }
    if (input.scope.projectId !== input.projectId) {
      throw new Error("scope_project_mismatch");
    }

    const evidence = (input.evidence ?? []).map(normaliseEvidence);
    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      sufficiencyThreshold: input.sufficiencyThreshold,
      disagreementThreshold: input.disagreementThreshold,
      minimumEvidenceCount: input.minimumEvidenceCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingSufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_progress_evidence")
      : undefined;

    let indicatedCompletion: number | undefined;
    let band: ProgressBand | undefined;
    let trendDirection: ProgressTrendDirection = "unknown";

    if (abstained) {
      reasons.push("abstained_no_indication_published");
      band = "unavailable";
    } else {
      indicatedCompletion = weightedIndication(evidence);
      if (indicatedCompletion === undefined) {
        // Confidence said the basis was usable but nothing was quantified.
        // Abstain rather than guess.
        return this.abstainedResult(input, confidence, asOf, [
          ...reasons,
          "no_quantified_evidence",
        ]);
      }
      band = progressBandFor(indicatedCompletion);
      trendDirection = describeTrend(indicatedCompletion, input.previousIndication);
      if (confidence.dataSufficiency === "limited") {
        reasons.push("limited_basis_indication_is_advisory");
      }
    }

    const stateId = this.newId("pcprog");
    const assessment: ProgressAssessmentState = {
      stateId,
      assessmentId: stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      version: input.version ?? 1,
      status: input.status ?? (abstained ? "assessed" : "assessed"),
      assessmentClass: abstained ? "abstained" : "assessed",
      indicatedCompletion,
      band,
      trendDirection,
      confidence,
      evidenceRefs: evidence.map((item) => item.evidenceId),
      reasons: dedupe(reasons),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "progress_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      costIntegrated: false,
      forecastProduced: false,
      scheduleExecuted: false,
      resourceLevelled: false,
      physicalPercentCompleteCertified: false,
      paymentCertificationClaimed: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      autonomousPublication: false,
    };

    return { assessment, confidence, abstained, abstentionReason };
  }

  private abstainedResult(
    input: ProgressAssessmentInput,
    confidence: ProgressConfidence,
    asOf: string,
    reasons: string[],
  ): ProgressAssessmentResult {
    const stateId = this.newId("pcprog");
    const abstentionReason = "insufficient_progress_evidence";
    return {
      abstained: true,
      abstentionReason,
      confidence,
      assessment: {
        stateId,
        assessmentId: stateId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        scope: input.scope,
        version: input.version ?? 1,
        status: input.status ?? "assessed",
        assessmentClass: "abstained",
        band: "unavailable",
        trendDirection: "unknown",
        confidence,
        evidenceRefs: (input.evidence ?? []).map((item) => item.evidenceId),
        reasons: dedupe(reasons),
        abstained: true,
        abstentionReason,
        narrative: input.narrative,
        method: "progress_intelligence_advisory_v1",
        methodVersion: "1",
        assessedAt: asOf,
        recordedAt: asOf,
        createdBy: input.createdBy,
        supersedesId: input.supersedesId,
        workflowInstanceId: input.workflowInstanceId,
        earnedValueComputed: false,
        criticalPathComputed: false,
        costIntegrated: false,
        forecastProduced: false,
        scheduleExecuted: false,
        resourceLevelled: false,
        physicalPercentCompleteCertified: false,
        paymentCertificationClaimed: false,
        advisoryOnly: true,
        mutatesProjectIdentity: false,
        autonomousPublication: false,
      },
    };
  }
}

export function createProgressIntelligenceEngine(
  deps: ProgressIntelligenceEngineDeps = {},
): ProgressIntelligenceEngine {
  return new ProgressIntelligenceEngine(deps);
}

/**
 * Structural guard. Called by the engine constructor so a flipped flag fails at
 * construction time rather than producing an uncertified number.
 */
export function assertNoEarnedValue(): {
  ok: true;
  earnedValueImplemented: false;
  cpmImplemented: false;
  costEngineImplemented: false;
  forecastingImplemented: false;
} {
  if (EARNED_VALUE_IMPLEMENTED || PROGRESS_MEASUREMENT_IS_EARNED_VALUE) {
    throw new Error("earned_value_forbidden_in_progress_intelligence");
  }
  if (CPM_SCHEDULING_IMPLEMENTED) {
    throw new Error("cpm_forbidden_in_progress_intelligence");
  }
  if (COST_ENGINE_IMPLEMENTED) {
    throw new Error("cost_engine_forbidden_in_progress_intelligence");
  }
  if (FORECASTING_IMPLEMENTED) {
    throw new Error("forecasting_forbidden_in_progress_intelligence");
  }
  if (!PROGRESS_MEASUREMENT_IS_ADVISORY_ONLY) {
    throw new Error("progress_measurement_must_be_advisory_only");
  }
  return {
    ok: true,
    earnedValueImplemented: false,
    cpmImplemented: false,
    costEngineImplemented: false,
    forecastingImplemented: false,
  };
}

function normaliseEvidence(evidence: ProgressEvidence): ProgressEvidence {
  if (evidence.derivedFromEarnedValue !== false || evidence.derivedFromCostData !== false) {
    throw new Error("progress_evidence_may_not_derive_from_earned_value_or_cost");
  }
  return evidence;
}

/**
 * Weighted mean of reported completions. Weighting reflects source trust only —
 * it is not a budget, quantity or duration weighting, which is what would make
 * this earned value.
 */
function weightedIndication(evidence: readonly ProgressEvidence[]): number | undefined {
  let weightSum = 0;
  let valueSum = 0;
  for (const item of evidence) {
    if (item.revoked) continue;
    if (typeof item.indicatedCompletion !== "number") continue;
    if (!Number.isFinite(item.indicatedCompletion)) continue;
    const weight = typeof item.weight === "number" && item.weight > 0 ? item.weight : 1;
    weightSum += weight;
    valueSum += weight * Math.max(0, Math.min(1, item.indicatedCompletion));
  }
  if (weightSum === 0) return undefined;
  return Math.max(0, Math.min(1, valueSum / weightSum));
}

function describeTrend(current: number, previous?: number): ProgressTrendDirection {
  if (typeof previous !== "number" || !Number.isFinite(previous)) return "unknown";
  const delta = current - previous;
  if (delta > 0.02) return "improving";
  if (delta < -0.02) return "declining";
  return "stable";
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
