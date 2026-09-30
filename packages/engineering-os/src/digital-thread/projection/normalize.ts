import { isGovernedRelationType } from "../../decision-intelligence/relations";
import type { CanonicalGovernedLink } from "./types";

/**
 * A8A/A7B: analysis_request USED_BY upstream result meant USES_RESULT_FROM.
 * Assumption USED_BY consumer remains USED_BY.
 */
export function normalizeProjectedRelation(link: Pick<CanonicalGovernedLink, "fromType" | "relationship">): string {
  if (link.fromType === "analysis_request" && link.relationship === "USED_BY") return "USES";
  return link.relationship;
}

export function isProjectableGovernedLink(link: Pick<CanonicalGovernedLink, "governed" | "relationship">): boolean {
  if (link.governed === false) return false;
  return isGovernedRelationType(link.relationship);
}

export function semanticSignature(fromType: string, fromId: string, normalized: string, toType: string, toId: string): string {
  return `${fromType}:${fromId}:${normalized}:${toType}:${toId}`;
}
