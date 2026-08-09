/**
 * Phase 14D S05 — Classification-aware AI provider policy.
 * Reuses shared AI Runtime / Policy Engine semantics — not a second engine.
 *
 * classification ≠ authorization
 * provider approval ≠ data approval
 */

export type DataClassification =
  | "PUBLIC"
  | "INTERNAL"
  | "CLIENT_CONFIDENTIAL"
  | "ENGINEERING_SENSITIVE"
  | "RESTRICTED"
  | "UNKNOWN";

export interface ClassificationAiDecisionInput {
  classification: DataClassification;
  providerId: string;
  providerApproved: boolean;
  trainingUseRequested: boolean;
  operation: string;
  tenantRef: string;
  workspaceRef: string;
  /** Explicit governed permit for RESTRICTED external processing (rare). */
  restrictedExternalAiPermit?: boolean;
  /** Explicit provider policy allow for ENGINEERING_SENSITIVE / CLIENT_CONFIDENTIAL */
  sensitiveProviderPolicyAllow?: boolean;
}

export type ClassificationAiDecision =
  | { allowed: true; reason: string }
  | { allowed: false; reason: string; failClosed: true };

export function evaluateClassificationAwareAiPolicy(
  input: ClassificationAiDecisionInput,
): ClassificationAiDecision {
  if (!input.tenantRef || !input.workspaceRef) {
    return {
      allowed: false,
      reason: "tenant_workspace_context_required",
      failClosed: true,
    };
  }
  if (input.trainingUseRequested) {
    return {
      allowed: false,
      reason: "training_use_forbidden",
      failClosed: true,
    };
  }
  if (!input.providerApproved) {
    return {
      allowed: false,
      reason: "provider_not_approved",
      failClosed: true,
    };
  }

  switch (input.classification) {
    case "PUBLIC":
    case "INTERNAL":
      return { allowed: true, reason: "classification_provider_ok" };
    case "CLIENT_CONFIDENTIAL":
    case "ENGINEERING_SENSITIVE":
      if (input.sensitiveProviderPolicyAllow === true) {
        return { allowed: true, reason: "explicit_provider_policy_allow" };
      }
      return {
        allowed: false,
        reason: "sensitive_requires_explicit_provider_policy",
        failClosed: true,
      };
    case "RESTRICTED":
      if (input.restrictedExternalAiPermit === true) {
        return { allowed: true, reason: "restricted_governed_permit" };
      }
      return {
        allowed: false,
        reason: "restricted_external_ai_denied",
        failClosed: true,
      };
    case "UNKNOWN":
    default:
      return {
        allowed: false,
        reason: "unknown_classification_fail_closed",
        failClosed: true,
      };
  }
}

export function assertClassificationAwareAiOrThrow(
  input: ClassificationAiDecisionInput,
): void {
  const d = evaluateClassificationAwareAiPolicy(input);
  if (!d.allowed) {
    throw new Error(`AI provider denied: ${d.reason}`);
  }
}

