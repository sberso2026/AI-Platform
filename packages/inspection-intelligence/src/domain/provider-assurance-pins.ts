/**
 * Phase 9K — provider / model / policy pins for AI Vision GA freeze.
 */

export const GA_VISION_PROVIDER_PIN = "vision_provider_approved_v1" as const;
export const GA_VISION_MODEL_PIN = "ii_vision_detector@1.0.0" as const;
export const GA_VISION_POLICY_PIN = "vision_policy_v1" as const;
export const GA_VISION_COORDINATE_SYSTEM = "normalized_v1" as const;

export type VisionPinCheck =
  | { outcome: "accepted"; provider: string; model: string; policy: string }
  | { outcome: "denied_unknown_version"; reason: string }
  | { outcome: "denied_outage"; reason: string }
  | { outcome: "denied_unapproved"; reason: string };

export function assertVisionPins(input: {
  providerId: string;
  modelId: string;
  policyId: string;
  outage?: boolean;
  trainingUseRequested?: boolean;
}): VisionPinCheck {
  if (input.outage) {
    return { outcome: "denied_outage", reason: "fail_closed_provider_outage" };
  }
  if (input.providerId !== GA_VISION_PROVIDER_PIN) {
    return { outcome: "denied_unapproved", reason: "unapproved_provider_no_fallback" };
  }
  if (input.modelId !== GA_VISION_MODEL_PIN) {
    return { outcome: "denied_unknown_version", reason: "unknown_model_version" };
  }
  if (input.policyId !== GA_VISION_POLICY_PIN) {
    return { outcome: "denied_unknown_version", reason: "unknown_policy_version" };
  }
  if (input.trainingUseRequested) {
    return { outcome: "denied_unapproved", reason: "training_use_forbidden" };
  }
  return {
    outcome: "accepted",
    provider: input.providerId,
    model: input.modelId,
    policy: input.policyId,
  };
}

export function assertProviderAssuranceFrozen(): {
  ok: true;
  provider: typeof GA_VISION_PROVIDER_PIN;
  model: typeof GA_VISION_MODEL_PIN;
  policy: typeof GA_VISION_POLICY_PIN;
  coordinates: typeof GA_VISION_COORDINATE_SYSTEM;
  trainingUse: "forbidden";
  claimsAccuracy: false;
  claimsRemainingUsefulLife: false;
  humanValidationMandatory: true;
} {
  const denied = assertVisionPins({
    providerId: "shadow",
    modelId: GA_VISION_MODEL_PIN,
    policyId: GA_VISION_POLICY_PIN,
  });
  if (denied.outcome !== "denied_unapproved") throw new Error("expected_unapproved_denial");
  const outage = assertVisionPins({
    providerId: GA_VISION_PROVIDER_PIN,
    modelId: GA_VISION_MODEL_PIN,
    policyId: GA_VISION_POLICY_PIN,
    outage: true,
  });
  if (outage.outcome !== "denied_outage") throw new Error("expected_outage_fail_closed");
  return {
    ok: true,
    provider: GA_VISION_PROVIDER_PIN,
    model: GA_VISION_MODEL_PIN,
    policy: GA_VISION_POLICY_PIN,
    coordinates: GA_VISION_COORDINATE_SYSTEM,
    trainingUse: "forbidden",
    claimsAccuracy: false,
    claimsRemainingUsefulLife: false,
    humanValidationMandatory: true,
  };
}
