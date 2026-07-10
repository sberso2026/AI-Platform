/** Centrally defined entitlement decision reason codes. */
export const EntitlementReasonCode = {
  ALLOW_ACTIVE_APPLICATION_LICENCE: "active_application_licence",
  ALLOW_ACTIVE_PRODUCT_LICENCE: "active_product_licence",
  ALLOW_FEATURE_ENABLED: "feature_enabled",
  ALLOW_OVERRIDE: "administrative_override",
  DENY_SUBSCRIPTION_SUSPENDED: "subscription_suspended",
  DENY_SUBSCRIPTION_CANCELLED: "subscription_cancelled",
  DENY_SUBSCRIPTION_EXPIRED: "subscription_expired",
  DENY_SUBSCRIPTION_NOT_FOUND: "subscription_not_found",
  DENY_SUBSCRIPTION_INACTIVE: "subscription_inactive",
  DENY_LICENCE_EXPIRED: "licence_expired",
  DENY_LICENCE_REVOKED: "licence_revoked",
  DENY_LICENCE_NOT_FOUND: "licence_not_found",
  DENY_SEAT_NOT_ASSIGNED: "seat_not_assigned",
  DENY_APPLICATION_NOT_IN_PLAN: "application_not_in_plan",
  DENY_FEATURE_NOT_ENABLED: "feature_not_enabled",
  DENY_WORKSPACE_NOT_ENTITLED: "workspace_not_entitled",
  DENY_USAGE_LIMIT_EXCEEDED: "usage_limit_exceeded",
  DENY_PRODUCT_NOT_FOUND: "product_not_found",
  DENY_PRODUCT_INACTIVE: "product_inactive",
  DENY_TENANT_INVALID: "tenant_invalid",
  DENY_OVERRIDE_DENY: "override_deny",
  DENY_INSTALLATION_NOT_ACTIVE: "installation_not_active",
  DENY_INSTALLATION_NOT_FOUND: "installation_not_found",
  DENY_WORKSPACE_NOT_ASSIGNED: "workspace_not_assigned",
  UNAVAILABLE_COMMERCE_DATA: "entitlement_unavailable",
  INTERNAL_EVALUATION_ERROR: "internal_evaluation_error",
} as const;

export type EntitlementReasonCode =
  (typeof EntitlementReasonCode)[keyof typeof EntitlementReasonCode];

export type EntitlementDecisionType = "allow" | "deny" | "unavailable" | "error";

export interface EntitlementLimits {
  seatLimit?: number | null;
  usageRemaining?: number | null;
}

export interface EntitlementDecision {
  allowed: boolean;
  decision: EntitlementDecisionType;
  reasonCode: EntitlementReasonCode;
  subscriptionId?: string;
  subscriptionStatus?: string;
  licenceId?: string;
  licenceStatus?: string;
  seatRequired?: boolean;
  seatAssigned?: boolean;
  workspaceAllowed?: boolean;
  validUntil?: string | null;
  limits?: EntitlementLimits;
}

export interface EntitlementCheckInput {
  tenantId: string;
  workspaceId?: string | null;
  userId?: string | null;
  productKey?: string;
  applicationKey?: string;
  featureKey?: string;
  action?: string;
  usageAmount?: number;
  cachePolicy?: import("./commerce-access-policy").CommerceCachePolicy;
}
