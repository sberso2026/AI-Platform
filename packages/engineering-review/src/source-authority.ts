/**
 * Source authority / freshness for PILOT-1.
 * ERA must not silently treat superseded package members as current authority.
 * Approved-versus-draft EOS document status is not stored on Review evidence;
 * when unknown, represent uncertainty rather than inventing currency.
 */
export const SOURCE_AUTHORITY_STATES = [
  "current",
  "superseded",
  "unknown_revision",
  "unknown_authority",
] as const;
export type SourceAuthorityState = (typeof SOURCE_AUTHORITY_STATES)[number];

export type SourceAuthorityInput = {
  inclusion?: "current" | "superseded";
  revision?: string;
};

export function classifySourceAuthority(input: SourceAuthorityInput): SourceAuthorityState {
  const inclusion = input.inclusion ?? "current";
  if (inclusion === "superseded") return "superseded";
  if (!input.revision?.trim()) return "unknown_revision";
  return "current";
}

export function supersededIsEquivalentToCurrentAuthority(): false {
  return false;
}

export function currentAuthorityAllowsClaimSupport(state: SourceAuthorityState, allowSupersededCitation: boolean): boolean {
  if (state === "current") return true;
  if (state === "superseded") return allowSupersededCitation;
  return false;
}
