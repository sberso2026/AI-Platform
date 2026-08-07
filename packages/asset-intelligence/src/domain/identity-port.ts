/**
 * Phase 10B — Shared Domain identity resolve port (read-only).
 * Asset Intelligence never writes canonical identity.
 */

import type { AssetIdentityReference } from "../architecture/identity-state";

export type SharedDomainAssetIdentityPort = {
  resolve(input: {
    tenantId: string;
    workspaceId: string;
    assetId: string;
  }): Promise<AssetIdentityReference | null>;
};

/** In-memory fixture for certification / unit tests. */
export function createInMemorySharedDomainIdentityPort(
  assets: AssetIdentityReference[],
): SharedDomainAssetIdentityPort {
  return {
    async resolve({ tenantId, workspaceId, assetId }) {
      return (
        assets.find(
          (a) =>
            a.tenantId === tenantId &&
            a.workspaceId === workspaceId &&
            a.assetId === assetId &&
            a.owner === "engineering_os_shared_domain",
        ) ?? null
      );
    },
  };
}
