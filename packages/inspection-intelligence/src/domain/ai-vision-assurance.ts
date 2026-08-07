/**
 * Phase 9I — Model assurance and human validation for AI Vision.
 */
import type {
  VisionAnalysisResult,
  VisionHumanValidation,
  VisionRegion,
  VisionValidationState,
} from "./ai-vision-analysis";

export type VisionModelAssuranceRecord = {
  assuranceId: string;
  providerId: string;
  modelId: string;
  modelVersion: string;
  evaluationDatasetIds: readonly string[];
  calibrationThresholds: Readonly<Record<string, number>>;
  falsePositiveRate?: number;
  falseNegativeRate?: number;
  abstentionRate?: number;
  packCompatibility: readonly string[];
  driftControls: readonly string[];
  approvalState: "draft" | "approved" | "rolled_back";
  claimsAccuracy: false;
};

export function createModelAssurance(input: {
  providerId: string;
  modelId: string;
  modelVersion: string;
  packCompatibility: readonly string[];
}): VisionModelAssuranceRecord {
  return {
    assuranceId: `va_${Date.now().toString(36)}`,
    providerId: input.providerId,
    modelId: input.modelId,
    modelVersion: input.modelVersion,
    evaluationDatasetIds: ["eval_structural_smoke_v1", "eval_coatings_smoke_v1"],
    calibrationThresholds: { acceptMinConfidence: 0.55, abstainBelow: 0.35 },
    falsePositiveRate: undefined,
    falseNegativeRate: undefined,
    abstentionRate: undefined,
    packCompatibility: input.packCompatibility,
    driftControls: ["version_pin", "threshold_freeze", "manual_rollback"],
    approvalState: "approved",
    claimsAccuracy: false,
  };
}

export function shouldAbstainForConfidence(
  confidence: number,
  assurance: VisionModelAssuranceRecord,
): boolean {
  const floor = assurance.calibrationThresholds.abstainBelow ?? 0.35;
  return confidence < floor;
}

export function validateVisionAnalysis(
  analysis: VisionAnalysisResult,
  input: {
    state: Exclude<VisionValidationState, "pending" | "abstained">;
    actorUserId: string;
    authorityRole: string;
    reason: string;
    bulk?: boolean;
    authorised: boolean;
    reviewerAdjustment?: VisionHumanValidation["reviewerAdjustment"];
  },
): { analysis: VisionAnalysisResult; validation: VisionHumanValidation } {
  if (!input.authorised) throw new Error("vision_validation_unauthorised");
  if (!input.reason.trim()) throw new Error("vision_validation_reason_required");
  if (input.bulk) throw new Error("vision_bulk_validation_forbidden");
  if (analysis.validationState !== "pending" && analysis.validationState !== "abstained") {
    throw new Error(`vision_validation_not_pending:${analysis.validationState}`);
  }
  const validation: VisionHumanValidation = {
    validationId: `vv_${Date.now().toString(36)}`,
    analysisId: analysis.analysisId,
    state: input.state,
    actorUserId: input.actorUserId,
    authorityRole: input.authorityRole,
    reason: input.reason,
    at: new Date().toISOString(),
    providerOutputSnapshotId: `snap_${analysis.analysisId}`,
    reviewerAdjustment: input.reviewerAdjustment,
  };
  return {
    analysis: { ...analysis, validationState: input.state, offlineQueuedOnly: false },
    validation,
  };
}

/** Explicit reviewer action required — never auto-mutate condition ratings. */
export function linkValidatedVisionToConditionObservedInput(input: {
  analysis: VisionAnalysisResult;
  explicitReviewerAction: boolean;
}): { observationSeed: { label: string; confidence: number; evidenceId: string; analysisId: string } } {
  if (!input.explicitReviewerAction) {
    throw new Error("vision_condition_link_requires_explicit_reviewer_action");
  }
  if (input.analysis.validationState !== "accepted" && input.analysis.validationState !== "adjusted") {
    throw new Error(`vision_condition_link_requires_validated:${input.analysis.validationState}`);
  }
  const label = input.analysis.labels[0]?.label ?? "vision_observation";
  return {
    observationSeed: {
      label,
      confidence: input.analysis.confidence,
      evidenceId: input.analysis.evidenceId,
      analysisId: input.analysis.analysisId,
    },
  };
}

export function stabilizeRegions(
  regions: readonly VisionRegion[],
  coordinateSystem: VisionRegion["coordinateSystem"] = "normalized_v1",
): VisionRegion[] {
  return regions.map((r) => ({
    ...r,
    coordinateSystem,
    x: clamp01(r.x),
    y: clamp01(r.y),
    width: clamp01(r.width),
    height: clamp01(r.height),
  }));
}

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}
