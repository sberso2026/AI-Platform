/**
 * Phase 14B — bounded ownership alias enforcement.
 * Semantic asset owner vs certified runtime identifier (no destructive rename).
 */

export const SEMANTIC_ASSET_IDENTITY_OWNERSHIP =
  "engineering_os_shared_asset_domain" as const;
export const RUNTIME_ASSET_IDENTITY_OWNERSHIP =
  "engineering_os_shared_domain" as const;

export const CANONICAL_PROJECT_IDENTITY_OWNERSHIP =
  "engineering_os_shared_project_domain" as const;
export const CANONICAL_SPATIAL_REFERENCE_OWNERSHIP =
  "engineering_os_shared_spatial_domain" as const;

export type OwnershipSurface =
  | "semantic"
  | "runtime"
  | "manifest"
  | "capability"
  | "contract";

export interface NormalizedOwnership {
  surface: OwnershipSurface;
  semanticOwner: typeof SEMANTIC_ASSET_IDENTITY_OWNERSHIP;
  runtimeOwner: typeof RUNTIME_ASSET_IDENTITY_OWNERSHIP;
  resolvedOwner: typeof RUNTIME_ASSET_IDENTITY_OWNERSHIP;
  aliasEnforced: true;
  duplicateAssetOwnershipDetected: false;
}

const ASSET_ALIASES = new Set<string>([
  SEMANTIC_ASSET_IDENTITY_OWNERSHIP,
  RUNTIME_ASSET_IDENTITY_OWNERSHIP,
]);

export function isAssetOwnershipAlias(owner: string): boolean {
  return ASSET_ALIASES.has(owner);
}

export function resolveAssetOwnership(
  owner: string,
  surface: OwnershipSurface = "runtime",
): NormalizedOwnership {
  if (!isAssetOwnershipAlias(owner) && owner !== "engineering_core") {
    throw new Error(
      `Unknown asset ownership token: ${owner}. Expected semantic ${SEMANTIC_ASSET_IDENTITY_OWNERSHIP} or runtime ${RUNTIME_ASSET_IDENTITY_OWNERSHIP}.`,
    );
  }
  return {
    surface,
    semanticOwner: SEMANTIC_ASSET_IDENTITY_OWNERSHIP,
    runtimeOwner: RUNTIME_ASSET_IDENTITY_OWNERSHIP,
    resolvedOwner: RUNTIME_ASSET_IDENTITY_OWNERSHIP,
    aliasEnforced: true,
    duplicateAssetOwnershipDetected: false,
  };
}

export function assertAssetOwnershipAliasConsistent(owners: string[]): void {
  const unknown = owners.filter(
    (o) => !isAssetOwnershipAlias(o) && o !== "engineering_core",
  );
  if (unknown.length) {
    throw new Error(`Asset ownership alias violation: ${unknown.join(", ")}`);
  }
  const resolved = new Set(
    owners.map((o) => resolveAssetOwnership(o).resolvedOwner),
  );
  if (resolved.size > 1) {
    throw new Error("duplicateAssetOwnershipDetected");
  }
}

export const EngineeringOwnershipNormalizer = {
  SEMANTIC_ASSET_IDENTITY_OWNERSHIP,
  RUNTIME_ASSET_IDENTITY_OWNERSHIP,
  resolveAssetOwnership,
  assertAssetOwnershipAliasConsistent,
  isAssetOwnershipAlias,
} as const;
