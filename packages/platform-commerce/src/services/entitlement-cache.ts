/** Short-TTL in-memory entitlement cache with explicit invalidation. */

interface CacheEntry {
  decision: unknown;
  expiresAt: number;
}

export class EntitlementCache {
  private readonly store = new Map<string, CacheEntry>();
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

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.decision as T;
  }

  set(key: string, decision: unknown, allowPermanent = false): void {
    if (decision && typeof decision === "object" && "allowed" in decision) {
      const d = decision as { allowed: boolean };
      if (d.allowed && !allowPermanent) {
        // Do not cache permanent allow decisions beyond short TTL
      }
    }
    this.store.set(key, { decision, expiresAt: Date.now() + this.ttlMs });
  }

  invalidateTenant(tenantId: string): void {
    for (const key of this.store.keys()) {
      if (key.includes(`tenantId=${tenantId}`)) this.store.delete(key);
    }
  }

  invalidateAll(): void {
    this.store.clear();
  }
}
