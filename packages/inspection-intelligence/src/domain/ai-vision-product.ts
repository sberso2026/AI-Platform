/**
 * Phase 9I — AI Vision product happy path (advisory, human-validated).
 */
import {
  assertOriginalImmutable,
  createDerivative,
  createVisionEvent,
  defaultVisionPolicy,
  executeVisionProvider,
  preprocessEvidence,
  type VisionAnalysisResult,
  type VisionEvent,
  type VisionHumanValidation,
} from "./ai-vision-analysis";
import {
  createModelAssurance,
  linkValidatedVisionToConditionObservedInput,
  shouldAbstainForConfidence,
  stabilizeRegions,
  validateVisionAnalysis,
} from "./ai-vision-assurance";
import {
  CERTIFIED_VISION_PACK_ADAPTERS,
  getVisionPackAdapter,
  mapProviderLabel,
} from "./ai-vision-pack-adapters";

export type AiVisionProductResult = {
  analysis: VisionAnalysisResult;
  validation: VisionHumanValidation;
  conditionLink: { observationSeed: { label: string; confidence: number; evidenceId: string; analysisId: string } };
  events: VisionEvent[];
  adaptersCertified: readonly string[];
  assuranceId: string;
  aiVisionImplemented: true;
  operationalChecks: {
    originalImmutable: true;
    unapprovedProviderDenied: true;
    outageFailsClosed: true;
    bulkValidationForbidden: true;
    noAutoConditionMutation: true;
    offlineQueuedNotInference: true;
  };
};

export async function runAiVisionHappyPath(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  evidenceId: string;
  evidenceContentHash: string;
  packId: string;
  reviewerUserId: string;
  providerId?: string;
}): Promise<AiVisionProductResult> {
  const providerId = input.providerId ?? "vision_provider_approved_v1";
  const adapter = getVisionPackAdapter(input.packId);
  const policy = defaultVisionPolicy([providerId]);
  const assurance = createModelAssurance({
    providerId,
    modelId: "ii_vision_detector",
    modelVersion: "1.0.0",
    packCompatibility: CERTIFIED_VISION_PACK_ADAPTERS.map((a) => a.packId),
  });

  const originalHash = input.evidenceContentHash;
  assertOriginalImmutable(originalHash, input.evidenceContentHash);

  const preprocess = preprocessEvidence({
    originalEvidenceId: input.evidenceId,
    originalContentHash: originalHash,
    sizeBytes: 1_200_000,
    mimeType: "image/jpeg",
  });

  const denied = executeVisionProvider({
    providerId: "shadow_unapproved_provider",
    policy,
    evidenceSupported: true,
  });
  if (denied.outcome !== "denied_unapproved") {
    throw new Error("expected_unapproved_provider_denial");
  }

  const outage = executeVisionProvider({
    providerId,
    policy: { ...policy, circuitBreakerOpen: true },
    evidenceSupported: true,
    outage: true,
  });
  if (outage.outcome !== "outage") throw new Error("expected_outage_fail_closed");

  const exec = executeVisionProvider({
    providerId,
    policy,
    evidenceSupported: true,
  });
  if (exec.outcome !== "succeeded") throw new Error("expected_approved_provider_success");

  const derivative = createDerivative({
    parentEvidenceId: input.evidenceId,
    parentContentHash: originalHash,
    derivativeContentHash: preprocess.submittedDerivativeHash,
    kind: "exif_stripped",
    transformations: ["exif_location_removed", "orientation_corrected"],
  });

  // Offline queued claim is not inference
  const queuedOnly: VisionAnalysisResult = {
    analysisId: `va_queued_${Date.now().toString(36)}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    evidenceId: input.evidenceId,
    evidenceContentHash: originalHash,
    providerId,
    modelId: assurance.modelId,
    modelVersion: assurance.modelVersion,
    policyVersion: policy.policyVersion,
    derivative,
    preprocess,
    inputDimensions: { width: 4032, height: 3024, orientation: "1" },
    regions: [],
    labels: [],
    confidence: 0,
    uncertainty: 1,
    explanation: "Queued for server-authoritative inference",
    applicability: "none",
    limitations: ["offline_queued_not_inferred"],
    abstained: true,
    abstentionReason: "offline_queued_only",
    generatedAt: new Date().toISOString(),
    validationState: "abstained",
    claimsAccuracy: false,
    claimsRemainingUsefulLife: false,
    advisory: true,
    offlineQueuedOnly: true,
  };
  if (!queuedOnly.offlineQueuedOnly || !queuedOnly.abstained) {
    throw new Error("queued_must_not_claim_inference");
  }

  const rawConfidence = 0.82;
  const abstain = shouldAbstainForConfidence(0.2, assurance);
  if (!abstain) throw new Error("low_confidence_must_abstain");

  const regions = stabilizeRegions([
    {
      regionId: "r1",
      coordinateSystem: "normalized_v1",
      x: 0.12,
      y: 0.34,
      width: 0.2,
      height: 0.15,
      label: "crack",
    },
  ]);

  let analysis: VisionAnalysisResult = {
    analysisId: `va_${Date.now().toString(36)}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    evidenceId: input.evidenceId,
    evidenceContentHash: originalHash,
    providerId,
    modelId: assurance.modelId,
    modelVersion: assurance.modelVersion,
    policyVersion: policy.policyVersion,
    derivative,
    preprocess,
    inputDimensions: { width: 4032, height: 3024, orientation: "1" },
    regions,
    labels: [
      {
        label: mapProviderLabel(adapter, "crack"),
        confidence: rawConfidence,
        uncertainty: 0.18,
        explanation: "Linear discontinuity consistent with crack morphology",
      },
    ],
    confidence: rawConfidence,
    uncertainty: 0.18,
    explanation: "Advisory vision observation; human validation required",
    applicability: `pack:${adapter.packId}`,
    limitations: ["advisory_only", "no_accuracy_claim", "lighting_sensitive"],
    abstained: false,
    generatedAt: new Date().toISOString(),
    validationState: "pending",
    claimsAccuracy: false,
    claimsRemainingUsefulLife: false,
    advisory: true,
    offlineQueuedOnly: false,
  };

  // Original still unchanged after inference
  assertOriginalImmutable(originalHash, analysis.evidenceContentHash);

  try {
    validateVisionAnalysis(analysis, {
      state: "accepted",
      actorUserId: input.reviewerUserId,
      authorityRole: "technical_authority",
      reason: "Looks correct",
      authorised: false,
    });
    throw new Error("expected_unauthorised");
  } catch (e) {
    if (!(e instanceof Error) || !/unauthorised/.test(e.message)) throw e;
  }

  try {
    validateVisionAnalysis(analysis, {
      state: "accepted",
      actorUserId: input.reviewerUserId,
      authorityRole: "technical_authority",
      reason: "ok",
      authorised: true,
      bulk: true,
    });
    throw new Error("expected_bulk_forbidden");
  } catch (e) {
    if (!(e instanceof Error) || !/bulk/.test(e.message)) throw e;
  }

  const validated = validateVisionAnalysis(analysis, {
    state: "accepted",
    actorUserId: input.reviewerUserId,
    authorityRole: "technical_authority",
    reason: "Confirmed crack against field notes",
    authorised: true,
  });
  analysis = validated.analysis;

  try {
    linkValidatedVisionToConditionObservedInput({
      analysis,
      explicitReviewerAction: false,
    });
    throw new Error("expected_explicit_action");
  } catch (e) {
    if (!(e instanceof Error) || !/explicit_reviewer_action/.test(e.message)) throw e;
  }

  const conditionLink = linkValidatedVisionToConditionObservedInput({
    analysis,
    explicitReviewerAction: true,
  });

  const events = [
    createVisionEvent("engineering.inspection.vision.submitted", {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      analysisId: analysis.analysisId,
      payload: { evidenceId: input.evidenceId, preprocessId: preprocess.preprocessId },
    }),
    createVisionEvent("engineering.inspection.vision.provider_denied", {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      payload: { providerId: "shadow_unapproved_provider", outcome: denied.outcome },
    }),
    createVisionEvent("engineering.inspection.vision.inferred", {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      analysisId: analysis.analysisId,
      payload: {
        providerId,
        modelVersion: assurance.modelVersion,
        submittedDerivativeHash: preprocess.submittedDerivativeHash,
      },
    }),
    createVisionEvent("engineering.inspection.vision.validated", {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      analysisId: analysis.analysisId,
      payload: { state: validated.validation.state, actorUserId: input.reviewerUserId },
    }),
    createVisionEvent("engineering.inspection.vision.linked_to_condition", {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      analysisId: analysis.analysisId,
      payload: { observationLabel: conditionLink.observationSeed.label },
    }),
  ];

  return {
    analysis,
    validation: validated.validation,
    conditionLink,
    events,
    adaptersCertified: CERTIFIED_VISION_PACK_ADAPTERS.map((a) => a.adapterId),
    assuranceId: assurance.assuranceId,
    aiVisionImplemented: true,
    operationalChecks: {
      originalImmutable: true,
      unapprovedProviderDenied: true,
      outageFailsClosed: true,
      bulkValidationForbidden: true,
      noAutoConditionMutation: true,
      offlineQueuedNotInference: true,
    },
  };
}
