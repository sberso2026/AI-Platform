import type { ConnectorFreshnessState } from "./types";

export function classifyConnectorFreshness(input: {
  sourceTimestamp: string | null;
  retrievedAt: string;
  freshnessPolicyHours?: number;
  now: string;
}): ConnectorFreshnessState {
  const stamp = input.sourceTimestamp || input.retrievedAt;
  if (!stamp) return "unknown";
  const sourceMs = Date.parse(stamp);
  const nowMs = Date.parse(input.now);
  if (!Number.isFinite(sourceMs) || !Number.isFinite(nowMs)) return "unknown";
  const policyHours = input.freshnessPolicyHours;
  if (policyHours == null || policyHours <= 0) return "current";
  const ageHours = (nowMs - sourceMs) / 3_600_000;
  if (!Number.isFinite(ageHours)) return "unknown";
  return ageHours > policyHours ? "stale" : "current";
}
