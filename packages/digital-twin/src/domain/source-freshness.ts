/**
 * Phase 12D — TwinSourceFreshnessPolicy evaluation.
 */

export const FRESHNESS_STATES = [
  "fresh",
  "aging",
  "stale",
  "expired",
  "unknown",
] as const;

export type TwinSourceFreshnessState = (typeof FRESHNESS_STATES)[number];

export type TwinSourceFreshnessPolicy = {
  policyId: string;
  freshThresholdMinutes: number;
  agingThresholdMinutes: number;
  staleThresholdMinutes: number;
  expiredThresholdMinutes: number;
};

export const DEFAULT_FRESHNESS_POLICY: TwinSourceFreshnessPolicy = {
  policyId: "default_governed",
  freshThresholdMinutes: 60,
  agingThresholdMinutes: 240,
  staleThresholdMinutes: 1440,
  expiredThresholdMinutes: 10080,
};

export function evaluateSourceFreshness(input: {
  observedAt: string;
  now?: string;
  policy?: TwinSourceFreshnessPolicy;
}): TwinSourceFreshnessState {
  const policy = input.policy ?? DEFAULT_FRESHNESS_POLICY;
  const observedMs = Date.parse(input.observedAt);
  const nowMs = Date.parse(input.now ?? new Date().toISOString());
  if (Number.isNaN(observedMs) || Number.isNaN(nowMs)) return "unknown";

  const ageMinutes = (nowMs - observedMs) / 60_000;
  if (ageMinutes < 0) return "unknown";
  if (ageMinutes <= policy.freshThresholdMinutes) return "fresh";
  if (ageMinutes <= policy.agingThresholdMinutes) return "aging";
  if (ageMinutes <= policy.staleThresholdMinutes) return "stale";
  if (ageMinutes <= policy.expiredThresholdMinutes) return "expired";
  return "expired";
}

export function assertFreshnessAcceptable(freshness: TwinSourceFreshnessState): void {
  if (freshness === "expired") {
    throw new Error("source_freshness_expired");
  }
}
