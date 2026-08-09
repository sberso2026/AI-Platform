/**
 * Phase 13E — Project-aware ETABS provider policy.
 * Abstain when ETABS is not in projectApprovedProviders.
 */

import { ETABS_PROVIDER_KEY } from "./etabs-version";

export type EtabsProjectPolicyInput = {
  projectId?: string;
  projectApprovedProviders?: readonly string[];
};

export type EtabsProjectPolicyDecision =
  | {
      allowed: true;
      providerKey: typeof ETABS_PROVIDER_KEY;
      projectId?: string;
    }
  | {
      allowed: false;
      providerKey: typeof ETABS_PROVIDER_KEY;
      projectId?: string;
      reason: "project_not_approved" | "project_policy_missing";
      abstain: true;
      detail: string;
    };

export function assessEtabsProjectPolicy(
  input: EtabsProjectPolicyInput,
): EtabsProjectPolicyDecision {
  const approved = input.projectApprovedProviders;
  if (!approved || approved.length === 0) {
    return {
      allowed: false,
      providerKey: ETABS_PROVIDER_KEY,
      projectId: input.projectId,
      reason: "project_policy_missing",
      abstain: true,
      detail:
        "projectApprovedProviders missing — abstain rather than silent substitute",
    };
  }
  const normalized = approved.map((p) => p.trim().toLowerCase());
  if (!normalized.includes(ETABS_PROVIDER_KEY)) {
    return {
      allowed: false,
      providerKey: ETABS_PROVIDER_KEY,
      projectId: input.projectId,
      reason: "project_not_approved",
      abstain: true,
      detail: `ETABS not listed in projectApprovedProviders for project ${input.projectId ?? "unknown"}`,
    };
  }
  return {
    allowed: true,
    providerKey: ETABS_PROVIDER_KEY,
    projectId: input.projectId,
  };
}
