/**
 * RTB application release-identity policy (ADR_APPLICATION_RELEASE_IDENTITY).
 * Generic across products. Product versions live in each product's version.ts.
 */
export const APPLICATION_RELEASE_IDENTITY_ADR =
  "docs/architecture/adr/ADR_APPLICATION_RELEASE_IDENTITY.md" as const;

export const APPLICATION_GA_TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*-v\d+\.\d+\.\d+$/;

export const GA_TAG_IMMUTABLE = true as const;
export const GA_TAG_FORCE_UPDATE_FORBIDDEN = true as const;
export const RELEASE_MANIFEST_DOES_NOT_SUPERSEDE_HISTORICAL_GA_TAG = true as const;

export const APPLICATION_RELEASE_SEMVER = {
  patch:
    "Backward-compatible defect repair. No new product capability. No public-contract change.",
  minor:
    "Backward-compatible additive product capabilities. Prior GA public contracts remain compatible. Schema additive or unchanged.",
  major:
    "Breaking public-contract change, incompatible schema, or removal of a certified capability without a compatibility window.",
  secondGenerationProductLine:
    "New application key and product slug. Not a version bump of the same application.",
} as const;

export type ApplicationSemverLevel = keyof typeof APPLICATION_RELEASE_SEMVER;

export type HistoricalCertificationIdentity = {
  version: string;
  tag: string;
  certifiedCommit: string;
};

export type CurrentReleaseIdentity = {
  version: string;
  tag: string;
};

export type ApplicationReleaseIdentity = {
  historicalCertification: HistoricalCertificationIdentity;
  currentRelease: CurrentReleaseIdentity;
};

export function formatApplicationGaTag(productSlug: string, version: string): string {
  return `${productSlug}-v${version}`;
}

export function isApplicationGaTag(tag: string): boolean {
  return APPLICATION_GA_TAG_PATTERN.test(tag);
}

export function assertGaTagMatchesVersion(tag: string, productSlug: string, version: string): void {
  const expected = formatApplicationGaTag(productSlug, version);
  if (tag !== expected) {
    throw new Error(`GA tag ${tag} must equal ${expected}`);
  }
  if (!isApplicationGaTag(tag)) {
    throw new Error(`GA tag ${tag} does not match APPLICATION_GA_TAG_PATTERN`);
  }
}
