/**
 * Phase 12E — Telemetry source health states.
 */

export const SOURCE_HEALTH = ["available", "degraded", "unavailable", "unknown"] as const;

export type SourceHealth = (typeof SOURCE_HEALTH)[number];

export function evaluateSourceHealth(input: {
  lastSuccessfulReadAt?: string;
  consecutiveFailures?: number;
  now?: string;
  degradedAfterMs?: number;
  unavailableAfterMs?: number;
}): SourceHealth {
  if (input.consecutiveFailures && input.consecutiveFailures >= 3) {
    return "unavailable";
  }
  if (!input.lastSuccessfulReadAt) {
    return "unknown";
  }
  const now = input.now ?? new Date().toISOString();
  const age = Date.parse(now) - Date.parse(input.lastSuccessfulReadAt);
  const degradedMs = input.degradedAfterMs ?? 5 * 60_000;
  const unavailableMs = input.unavailableAfterMs ?? 30 * 60_000;
  if (age > unavailableMs) {
    return "unavailable";
  }
  if (age > degradedMs) {
    return "degraded";
  }
  return "available";
}
