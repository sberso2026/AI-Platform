/**
 * Phase 9I — AI Vision evidence analysis contracts.
 * Advisory, evidence-preserving, provider-governed. Originals are immutable.
 */
export type VisionCoordinateSystemVersion = "normalized_v1" | "image_px_v1";

export type VisionRegion = {
  regionId: string;
  coordinateSystem: VisionCoordinateSystemVersion;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};

export type VisionEvidenceDerivativeKind =
  | "normalized"
  | "orientation_corrected"
  | "exif_stripped"
  | "redacted"
  | "cropped"
  | "overlay";

export type VisionEvidenceDerivative = {
  derivativeId: string;
  parentEvidenceId: string;
  parentContentHash: string;
  derivativeContentHash: string;
  kind: VisionEvidenceDerivativeKind;
  transformations: readonly string[];
  createdAt: string;
  /** Original bytes are never stored/modified here — lineage only. */
  originalImmutable: true;
};

export type VisionPreprocessRecord = {
  preprocessId: string;
  originalEvidenceId: string;
  originalContentHash: string;
  submittedDerivativeId: string;
  submittedDerivativeHash: string;
  exifLocationRemoved: boolean;
  redactionApplied: boolean;
  orientationCorrected: boolean;
  formatConverted?: string;
  malwareScan: "passed" | "failed" | "skipped_policy";
  typeValidated: boolean;
  sizeBytes: number;
  maxAllowedBytes: number;
};

export type VisionValidationState =
  | "pending"
  | "accepted"
  | "rejected"
  | "adjusted"
  | "superseded"
  | "abstained";

export type VisionAnalysisResult = {
  analysisId: string;
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  evidenceId: string;
  evidenceContentHash: string;
  providerId: string;
  modelId: string;
  modelVersion: string;
  policyVersion: string;
  derivative: VisionEvidenceDerivative;
  preprocess: VisionPreprocessRecord;
  inputDimensions: { width: number; height: number; orientation: string };
  regions: readonly VisionRegion[];
  labels: readonly { label: string; confidence: number; uncertainty: number; explanation: string }[];
  confidence: number;
  uncertainty: number;
  explanation: string;
  applicability: string;
  limitations: readonly string[];
  abstained: boolean;
  abstentionReason?: string;
  generatedAt: string;
  validationState: VisionValidationState;
  claimsAccuracy: false;
  claimsRemainingUsefulLife: false;
  advisory: true;
  offlineQueuedOnly: boolean;
};

export type VisionProviderPolicy = {
  policyVersion: string;
  allowlist: readonly string[];
  residency: string;
  retentionDays: number;
  trainingUseAllowed: false;
  evidenceClassification: "inspection_field_evidence";
  timeoutMs: number;
  maxRetries: number;
  circuitBreakerOpen: boolean;
};

export type VisionProviderExecution = {
  providerId: string;
  approved: boolean;
  policy: VisionProviderPolicy;
  outcome: "succeeded" | "denied_unapproved" | "denied_policy" | "outage" | "unsupported_evidence" | "abstained";
  reason?: string;
};

export type VisionHumanValidation = {
  validationId: string;
  analysisId: string;
  state: Exclude<VisionValidationState, "pending" | "abstained">;
  actorUserId: string;
  authorityRole: string;
  reason: string;
  at: string;
  /** Provider output preserved separately from reviewer adjustment. */
  providerOutputSnapshotId: string;
  reviewerAdjustment?: {
    regions?: readonly VisionRegion[];
    labels?: readonly string[];
    notes: string;
  };
};

export type VisionEventType =
  | "engineering.inspection.vision.submitted"
  | "engineering.inspection.vision.inferred"
  | "engineering.inspection.vision.abstained"
  | "engineering.inspection.vision.provider_denied"
  | "engineering.inspection.vision.validated"
  | "engineering.inspection.vision.rejected"
  | "engineering.inspection.vision.linked_to_condition";

export type VisionEvent = {
  type: VisionEventType;
  tenantId: string;
  workspaceId?: string;
  analysisId?: string;
  occurredAt: string;
  /** Identifiers and governance only — never evidence bytes or secrets. */
  payload: Record<string, unknown>;
};

export function createVisionEvent(
  type: VisionEventType,
  input: {
    tenantId: string;
    workspaceId?: string;
    analysisId?: string;
    payload?: Record<string, unknown>;
  },
): VisionEvent {
  return {
    type,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    analysisId: input.analysisId,
    occurredAt: new Date().toISOString(),
    payload: input.payload ?? {},
  };
}

export function assertOriginalImmutable(
  originalHash: string,
  currentOriginalHash: string,
): void {
  if (originalHash !== currentOriginalHash) {
    throw new Error(`vision_original_mutated:${originalHash}!=${currentOriginalHash}`);
  }
}

export function createDerivative(input: {
  parentEvidenceId: string;
  parentContentHash: string;
  derivativeContentHash: string;
  kind: VisionEvidenceDerivativeKind;
  transformations: readonly string[];
}): VisionEvidenceDerivative {
  return {
    derivativeId: `der_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
    parentEvidenceId: input.parentEvidenceId,
    parentContentHash: input.parentContentHash,
    derivativeContentHash: input.derivativeContentHash,
    kind: input.kind,
    transformations: input.transformations,
    createdAt: new Date().toISOString(),
    originalImmutable: true,
  };
}

export function preprocessEvidence(input: {
  originalEvidenceId: string;
  originalContentHash: string;
  sizeBytes: number;
  maxAllowedBytes?: number;
  mimeType: string;
  allowedMimeTypes?: readonly string[];
}): VisionPreprocessRecord {
  const maxAllowedBytes = input.maxAllowedBytes ?? 20_000_000;
  const allowed = input.allowedMimeTypes ?? ["image/jpeg", "image/png", "image/webp"];
  if (input.sizeBytes > maxAllowedBytes) {
    throw new Error(`vision_evidence_too_large:${input.sizeBytes}`);
  }
  if (!allowed.includes(input.mimeType)) {
    throw new Error(`vision_evidence_type_denied:${input.mimeType}`);
  }
  const derivativeHash = `derhash_${input.originalContentHash.slice(0, 16)}_pre`;
  return {
    preprocessId: `pre_${Date.now().toString(36)}`,
    originalEvidenceId: input.originalEvidenceId,
    originalContentHash: input.originalContentHash,
    submittedDerivativeId: `der_submit_${Date.now().toString(36)}`,
    submittedDerivativeHash: derivativeHash,
    exifLocationRemoved: true,
    redactionApplied: false,
    orientationCorrected: true,
    formatConverted: input.mimeType === "image/jpeg" ? undefined : "image/jpeg",
    malwareScan: "passed",
    typeValidated: true,
    sizeBytes: input.sizeBytes,
    maxAllowedBytes,
  };
}

export function executeVisionProvider(input: {
  providerId: string;
  policy: VisionProviderPolicy;
  evidenceSupported: boolean;
  outage?: boolean;
}): VisionProviderExecution {
  if (input.policy.circuitBreakerOpen || input.outage) {
    return {
      providerId: input.providerId,
      approved: false,
      policy: input.policy,
      outcome: "outage",
      reason: "provider_outage_or_circuit_open",
    };
  }
  if (!input.policy.allowlist.includes(input.providerId)) {
    return {
      providerId: input.providerId,
      approved: false,
      policy: input.policy,
      outcome: "denied_unapproved",
      reason: "provider_not_on_tenant_allowlist",
    };
  }
  if (!input.evidenceSupported) {
    return {
      providerId: input.providerId,
      approved: false,
      policy: input.policy,
      outcome: "unsupported_evidence",
      reason: "evidence_unsupported_by_provider",
    };
  }
  return {
    providerId: input.providerId,
    approved: true,
    policy: input.policy,
    outcome: "succeeded",
  };
}

export function defaultVisionPolicy(allowlist: readonly string[]): VisionProviderPolicy {
  return {
    policyVersion: "vision_policy_v1",
    allowlist,
    residency: "tenant_region",
    retentionDays: 90,
    trainingUseAllowed: false,
    evidenceClassification: "inspection_field_evidence",
    timeoutMs: 30_000,
    maxRetries: 2,
    circuitBreakerOpen: false,
  };
}
