/**
 * Phase 13C — Project-aware SPACE GASS provider policy.
 * Abstain when SPACE GASS is not in projectApprovedProviders.
 */

import { SPACEGASS_PROVIDER_KEY } from "./spacegass-version";

export type SpaceGassProjectPolicyInput = {
  projectId?: string;
  projectApprovedProviders?: readonly string[];
};

export type SpaceGassProjectPolicyDecision =
  | {
      allowed: true;
      providerKey: typeof SPACEGASS_PROVIDER_KEY;
      projectId?: string;
    }
  | {
      allowed: false;
      providerKey: typeof SPACEGASS_PROVIDER_KEY;
      projectId?: string;
      reason: "project_not_approved" | "project_policy_missing";
      abstain: true;
      detail: string;
    };

export function assessSpaceGassProjectPolicy(
  input: SpaceGassProjectPolicyInput,
): SpaceGassProjectPolicyDecision {
  const approved = input.projectApprovedProviders;
  if (!approved || approved.length === 0) {
    return {
      allowed: false,
      providerKey: SPACEGASS_PROVIDER_KEY,
      projectId: input.projectId,
      reason: "project_policy_missing",
      abstain: true,
      detail:
        "projectApprovedProviders missing — abstain rather than silent substitute",
    };
  }
  const normalized = approved.map((p) => p.trim().toLowerCase());
  if (!normalized.includes(SPACEGASS_PROVIDER_KEY)) {
    return {
      allowed: false,
      providerKey: SPACEGASS_PROVIDER_KEY,
      projectId: input.projectId,
      reason: "project_not_approved",
      abstain: true,
      detail: `SPACE GASS not listed in projectApprovedProviders for project ${input.projectId ?? "unknown"}`,
    };
  }
  return {
    allowed: true,
    providerKey: SPACEGASS_PROVIDER_KEY,
    projectId: input.projectId,
  };
}
