/** Short-TTL in-memory entitlement cache with explicit invalidation and version stamps. */

interface CacheEntry {
  decision: unknown;
  expiresAt: number;
  entitlementVersion?: number;
  installationVersion?: number;
}

export class EntitlementCache {
  private readonly store = new Map<string, CacheEntry>();
  private readonly tenantVersions = new Map<
    string,
    { entitlement: number; installation: number }
  >();
  private readonly ttlMs: number;

  constructor(ttlMs = 30_000) {
    this.ttlMs = ttlMs;
  }

  buildKey(parts: Record<string, string | undefined | null>): string {
    return Object.entries(parts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v ?? ""}`)
      .join("|");
  }

  get<T>(key: string, tenantId?: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    if (tenantId) {
      const versions = this.tenantVersions.get(tenantId);
      if (versions) {
        if (
          entry.entitlementVersion !== undefined &&
          entry.entitlementVersion !== versions.entitlement
        ) {
          this.store.delete(key);
          return null;
        }
        if (
          entry.installationVersion !== undefined &&
          entry.installationVersion !== versions.installation
        ) {
          this.store.delete(key);
          return null;
        }
      }
    }
    return entry.decision as T;
  }

  set(
    key: string,
    decision: unknown,
    allowPermanent = false,
    versions?: { entitlementVersion?: number; installationVersion?: number }
  ): void {
    if (decision && typeof decision === "object" && "allowed" in decision) {
      const d = decision as { allowed: boolean };
      if (d.allowed && !allowPermanent) {
        // Do not cache permanent allow decisions beyond short TTL
      }
    }
    this.store.set(key, {
      decision,
      expiresAt: Date.now() + this.ttlMs,
      entitlementVersion: versions?.entitlementVersion,
      installationVersion: versions?.installationVersion,
    });
  }

  setTenantVersions(
    tenantId: string,
    entitlementVersion: number,
    installationVersion: number
  ): void {
    this.tenantVersions.set(tenantId, {
      entitlement: entitlementVersion,
      installation: installationVersion,
    });
  }

  invalidateTenant(tenantId: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(`tenantId=${tenantId}`)) this.store.delete(key);
    }
    const existing = this.tenantVersions.get(tenantId);
    this.tenantVersions.set(tenantId, {
      entitlement: (existing?.entitlement ?? 0) + 1,
      installation: (existing?.installation ?? 0) + 1,
    });
  }

  invalidateAll(): void {
    this.store.clear();
    this.tenantVersions.clear();
  }

  hasStoredDecisions(): boolean {
    return this.store.size > 0;
  }
}
