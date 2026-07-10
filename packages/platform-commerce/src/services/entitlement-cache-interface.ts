/**
 * Commerce entitlement cache with per-tenant version stamps for invalidation.
 *
 * Version limitation: InMemoryCommerceEntitlementCache keeps versions in-process only.
 * They do not survive restarts and are not shared across instances. Production
 * deployments must read `commercial_entitlement_versions.version` (via
 * EntitlementVersionRepository) for distributed cache coherence.
 */

import { EntitlementCache } from "./entitlement-cache";

export interface CommerceEntitlementCache {
  buildKey(parts: Record<string, string | undefined | null>): string;
  get<T>(key: string): T | null;
  set(key: string, decision: unknown, allowPermanent?: boolean): void;
  /** Clears cached decisions and bumps the tenant entitlement version. */
  invalidateTenant(tenantId: string): void | Promise<void>;
  getTenantVersion(tenantId: string): number;
}

export class InMemoryCommerceEntitlementCache implements CommerceEntitlementCache {
  private readonly versions = new Map<string, number>();

  constructor(private readonly inner: EntitlementCache = new EntitlementCache()) {}

  buildKey(parts: Record<string, string | undefined | null>): string {
    return this.inner.buildKey(parts);
  }

  get<T>(key: string): T | null {
    return this.inner.get<T>(key);
  }

  set(key: string, decision: unknown, allowPermanent = false): void {
    this.inner.set(key, decision, allowPermanent);
  }

  invalidateTenant(tenantId: string): void {
    const next = (this.versions.get(tenantId) ?? 0) + 1;
    this.versions.set(tenantId, next);
    this.inner.invalidateTenant(tenantId);
  }

  getTenantVersion(tenantId: string): number {
    return this.versions.get(tenantId) ?? 0;
  }
}
