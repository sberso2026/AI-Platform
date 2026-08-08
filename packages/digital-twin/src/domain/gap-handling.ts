/**
 * Phase 12E — Gap handling for telemetry projections.
 *
 * Interpolation is not implemented in Phase 12E.
 */

export const GAP_HANDLING = [
  "no_data",
  "temporary_gap",
  "stale_source",
  "source_offline",
  "insufficient_samples",
] as const;

export type GapHandling = (typeof GAP_HANDLING)[number];

export const INTERPOLATION_STATUS = "not_implemented" as const;

export function resolveGapHandling(input: {
  sampleCount: number;
  sourceAvailable: boolean;
  lastObservationAt?: string;
  now?: string;
  staleAfterMs?: number;
}): GapHandling {
  if (!input.sourceAvailable) {
    return "source_offline";
  }
  if (input.sampleCount === 0) {
    return "no_data";
  }
  if (input.sampleCount < 2) {
    return "insufficient_samples";
  }
  if (input.lastObservationAt && input.staleAfterMs) {
    const now = input.now ?? new Date().toISOString();
    const age = Date.parse(now) - Date.parse(input.lastObservationAt);
    if (age > input.staleAfterMs) {
      return "stale_source";
    }
  }
  return "temporary_gap";
}
