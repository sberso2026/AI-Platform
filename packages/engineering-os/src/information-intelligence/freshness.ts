import type { InformationFreshnessState, SourceDomainFacts } from "./types";

function periodExpired(facts: SourceDomainFacts, now: string): boolean {
  if (!facts.effectiveUntil) return false;
  return Date.parse(facts.effectiveUntil) < Date.parse(now);
}

/**
 * Freshness is composed from canonical source-domain facts.
 * File modified dates are never used.
 */
export function composeInformationFreshness(facts: SourceDomainFacts, now: string): InformationFreshnessState {
  if (facts.superseded) return "SUPERSEDED";
  if (facts.stale) return "STALE";
  if (periodExpired(facts, now)) return "STALE";
  if ((facts.staleReasons ?? []).length) return "POTENTIALLY_STALE";
  if (facts.revision || facts.createdAt || facts.baselineId) return "CURRENT";
  return "UNKNOWN";
}

export function freshnessAllowsAuthoritativeUse(freshness: InformationFreshnessState): boolean {
  return freshness === "CURRENT" || freshness === "POTENTIALLY_STALE";
}
