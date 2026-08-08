/**
 * Phase 12E — Observation quality classification for telemetry projections.
 */

export const OBSERVATION_QUALITY = [
  "good",
  "suspect",
  "bad",
  "missing",
  "out_of_range",
  "stale",
  "unknown",
] as const;

export type ObservationQuality = (typeof OBSERVATION_QUALITY)[number];

export function classifyObservationQuality(input: {
  value?: number | null;
  observedAt?: string;
  now?: string;
  staleAfterMs?: number;
  min?: number;
  max?: number;
}): ObservationQuality {
  const now = input.now ?? new Date().toISOString();
  if (input.value === null || input.value === undefined) {
    return "missing";
  }
  if (input.min !== undefined && input.value < input.min) {
    return "out_of_range";
  }
  if (input.max !== undefined && input.value > input.max) {
    return "out_of_range";
  }
  if (input.observedAt && input.staleAfterMs) {
    const age = Date.parse(now) - Date.parse(input.observedAt);
    if (age > input.staleAfterMs) {
      return "stale";
    }
  }
  return "good";
}

export function isProjectionQualityAcceptable(quality: ObservationQuality): boolean {
  return quality === "good" || quality === "suspect";
}
