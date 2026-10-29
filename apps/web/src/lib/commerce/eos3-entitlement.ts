/**
 * EOS 3 development entitlement evaluator.
 * Inherits EOS 2 GA *architecture* (product-filtered, fail-closed, auditable)
 * but NOT EOS 2 grants. eos-2 entitlement never enables eos-3.
 */

import { EOS3_PRODUCT_KEY } from "./eos3-identity";

export const EOS3_DEV_GRANT_SOURCES = [
  "INTERNAL_VALIDATION",
  "INTERNAL_DEVELOPMENT",
  "COMPLIMENTARY",
] as const;

export type Eos3DevEnrollmentState = "NOT_ELIGIBLE" | "DEVELOPMENT" | "STAGING" | "PILOT";

export type Eos3EntitlementRecord = {
  productKey: string;
  tenantId: string;
  workspaceId: string;
  status: "active" | "suspended" | "revoked" | "expired";
  grantSource: string;
  validFrom: string;
  validUntil: string | null;
};

export type Eos3AccessDecision = {
  allowed: boolean;
  reason:
    | "active_development"
    | "unauthenticated"
    | "missing"
    | "wrong_product"
    | "wrong_tenant"
    | "wrong_workspace"
    | "expired"
    | "revoked"
    | "suspended"
    | "not_enrolled"
    | "enrollment_not_eligible"
    | "production_denied"
    | "eos2_grant_does_not_enable_eos3"
    | "kill_switch";
};

/** Explicit: EOS 2 product grants never enable EOS 3. */
export function eos2EntitlementAutoEnablesEos3(_eos2ProductKey: string | null | undefined): false {
  return false;
}

export function eos2EnrollmentAutoEnablesEos3(_enrolled: boolean): false {
  return false;
}

export function evaluateEos3Access(input: {
  authenticated: boolean;
  requestedProductKey: string;
  tenantId: string | null;
  workspaceId: string | null;
  record: Eos3EntitlementRecord | null;
  enrollmentState: Eos3DevEnrollmentState | null;
  productionEnvironment?: boolean;
  emergencyOff?: boolean;
  now?: Date;
}): Eos3AccessDecision {
  if (input.emergencyOff) return { allowed: false, reason: "kill_switch" };
  if (!input.authenticated) return { allowed: false, reason: "unauthenticated" };
  // Production remains inaccessible in EOS 3.1 foundation.
  if (input.productionEnvironment) return { allowed: false, reason: "production_denied" };
  if (input.requestedProductKey !== EOS3_PRODUCT_KEY) {
    return { allowed: false, reason: "wrong_product" };
  }
  if (!input.tenantId || !input.workspaceId) return { allowed: false, reason: "missing" };
  if (!input.record) return { allowed: false, reason: "missing" };
  if (input.record.productKey !== EOS3_PRODUCT_KEY) {
    return { allowed: false, reason: "wrong_product" };
  }
  if (input.record.tenantId !== input.tenantId) return { allowed: false, reason: "wrong_tenant" };
  if (input.record.workspaceId !== input.workspaceId) {
    return { allowed: false, reason: "wrong_workspace" };
  }
  if (input.record.status === "revoked") return { allowed: false, reason: "revoked" };
  if (input.record.status === "suspended") return { allowed: false, reason: "suspended" };
  if (input.record.status === "expired") return { allowed: false, reason: "expired" };
  if (input.record.status !== "active") return { allowed: false, reason: "missing" };

  const now = input.now ?? new Date();
  if (input.record.validUntil) {
    const until = Date.parse(input.record.validUntil);
    if (Number.isFinite(until) && now.getTime() > until) {
      return { allowed: false, reason: "expired" };
    }
  }

  const enrollment = input.enrollmentState ?? "NOT_ELIGIBLE";
  if (enrollment === "NOT_ELIGIBLE" || !enrollment) {
    return { allowed: false, reason: "not_enrolled" };
  }
  if (enrollment !== "DEVELOPMENT" && enrollment !== "STAGING" && enrollment !== "PILOT") {
    return { allowed: false, reason: "enrollment_not_eligible" };
  }

  return { allowed: true, reason: "active_development" };
}
