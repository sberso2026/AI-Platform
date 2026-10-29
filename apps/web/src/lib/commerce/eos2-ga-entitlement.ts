/**
 * Canonical EOS 2 GA entitlement evaluator (billing-independent).
 * Fail closed. Product key must be exactly `eos-2`.
 */

export const EOS2_GA_PRODUCT_KEY = "eos-2" as const;

export const EOS2_GA_GRANT_SOURCES = [
  "COMMERCIAL_SUBSCRIPTION",
  "COMMERCIAL_TRIAL",
  "INTERNAL_VALIDATION",
  "COMPLIMENTARY",
] as const;

export type Eos2GaGrantSource = (typeof EOS2_GA_GRANT_SOURCES)[number];

export type Eos2GaEntitlementStatus = "active" | "suspended" | "revoked" | "expired";

export type Eos2GaEntitlementRecord = {
  productKey: string;
  tenantId: string;
  workspaceId: string;
  status: Eos2GaEntitlementStatus;
  grantSource: Eos2GaGrantSource | string;
  validFrom: string;
  validUntil: string | null;
  suspendedAt?: string | null;
  revokedAt?: string | null;
};

export type Eos2GaEntitlementDecision = {
  entitled: boolean;
  reason:
    | "active"
    | "missing"
    | "wrong_product"
    | "wrong_tenant"
    | "wrong_workspace"
    | "expired"
    | "revoked"
    | "suspended"
    | "inactive_status"
    | "not_enrolled"
    | "rollout_off"
    | "kill_switch"
    | "unauthenticated"
    | "indeterminate";
};

export function evaluateEos2GaEntitlement(input: {
  authenticated: boolean;
  requestedProductKey: string;
  tenantId: string | null;
  workspaceId: string | null;
  record: Eos2GaEntitlementRecord | null;
  enrolled: boolean;
  rolloutMode: unknown;
  emergencyOff?: boolean;
  now?: Date;
  indeterminate?: boolean;
}): Eos2GaEntitlementDecision {
  if (input.indeterminate) return { entitled: false, reason: "indeterminate" };
  if (!input.authenticated) return { entitled: false, reason: "unauthenticated" };
  if (input.emergencyOff) return { entitled: false, reason: "kill_switch" };
  if (input.requestedProductKey !== EOS2_GA_PRODUCT_KEY) {
    return { entitled: false, reason: "wrong_product" };
  }
  if (!input.tenantId || !input.workspaceId) return { entitled: false, reason: "missing" };
  if (!input.record) return { entitled: false, reason: "missing" };

  if (input.record.productKey !== EOS2_GA_PRODUCT_KEY) {
    return { entitled: false, reason: "wrong_product" };
  }
  if (input.record.tenantId !== input.tenantId) {
    return { entitled: false, reason: "wrong_tenant" };
  }
  if (input.record.workspaceId !== input.workspaceId) {
    return { entitled: false, reason: "wrong_workspace" };
  }

  const now = input.now ?? new Date();
  if (input.record.revokedAt || input.record.status === "revoked") {
    return { entitled: false, reason: "revoked" };
  }
  if (input.record.suspendedAt || input.record.status === "suspended") {
    return { entitled: false, reason: "suspended" };
  }
  if (input.record.status === "expired") {
    return { entitled: false, reason: "expired" };
  }
  if (input.record.status !== "active") {
    return { entitled: false, reason: "inactive_status" };
  }
  const from = Date.parse(input.record.validFrom);
  if (Number.isFinite(from) && now.getTime() < from) {
    return { entitled: false, reason: "inactive_status" };
  }
  if (input.record.validUntil) {
    const until = Date.parse(input.record.validUntil);
    if (Number.isFinite(until) && now.getTime() > until) {
      return { entitled: false, reason: "expired" };
    }
  }

  // Commercial entitlement is necessary but not sufficient: rollout + enrollment remain separate.
  if (input.rolloutMode !== "controlled_pilot") {
    return { entitled: false, reason: "rollout_off" };
  }
  if (!input.enrolled) {
    return { entitled: false, reason: "not_enrolled" };
  }

  return { entitled: true, reason: "active" };
}

/** Legacy engineering-os product entitlement must never auto-enable EOS 2. */
export function legacyEngineeringOsGrantsEos2(_legacyProductKey: string | null | undefined): false {
  return false;
}
