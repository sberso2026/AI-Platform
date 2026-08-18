import type { Permission } from "@rtb/types";
import type { EntitlementDecision } from "@rtb/platform-commerce";
import { EntitlementReasonCode } from "@rtb/platform-commerce";
import type { BusinessPermission } from "@rtb/types";
import { hasBusinessPermission } from "./permissions";
import { BUSINESS_OS_FEATURE_KEY, BUSINESS_OS_PRODUCT_SLUG } from "./version";

const HARD_DENY_REASONS = new Set<string>([
  EntitlementReasonCode.DENY_SUBSCRIPTION_SUSPENDED,
  EntitlementReasonCode.DENY_SUBSCRIPTION_CANCELLED,
  EntitlementReasonCode.DENY_SUBSCRIPTION_EXPIRED,
  EntitlementReasonCode.DENY_SUBSCRIPTION_INACTIVE,
  EntitlementReasonCode.DENY_LICENCE_EXPIRED,
  EntitlementReasonCode.DENY_LICENCE_REVOKED,
  EntitlementReasonCode.DENY_OVERRIDE_DENY,
  EntitlementReasonCode.DENY_TENANT_INVALID,
  EntitlementReasonCode.DENY_INSTALLATION_NOT_ACTIVE,
  EntitlementReasonCode.DENY_PRODUCT_INACTIVE,
]);

/**
 * Preview is allowed only when commerce has no business-os product presence.
 * Licence/plan/feature-not-in-subscription denies stay closed — they are commercial
 * states, not coming_soon absence. Feature-flag preview is separate (intelligence).
 */
export const FOUNDATION_PREVIEW_REASONS = new Set<string>([
  EntitlementReasonCode.DENY_PRODUCT_NOT_FOUND,
  EntitlementReasonCode.DENY_SUBSCRIPTION_NOT_FOUND,
  EntitlementReasonCode.DENY_INSTALLATION_NOT_FOUND,
]);

export type BusinessAccessReason =
  | "unauthenticated"
  | "feature_disabled"
  | "permission_denied"
  | "entitlement_denied"
  | "entitlement_unavailable"
  | "allowed_preview"
  | "allowed_entitled";

export interface BusinessAccessDecision {
  allowed: boolean;
  reason: BusinessAccessReason;
  featureEnabled: boolean;
  entitlementReasonCode?: string;
}

export interface BusinessAccessInput {
  tenantId: string;
  workspaceId?: string;
  userId: string;
  permissions: Permission[];
  requiredPermission?: BusinessPermission;
  evaluateFeature: (input: {
    tenantId: string;
    userId: string;
    featureKey: string;
  }) => Promise<boolean>;
  checkEntitlement?: (input: {
    tenantId: string;
    workspaceId?: string;
    userId: string;
    productKey: string;
    featureKey: string;
    action: string;
  }) => Promise<EntitlementDecision>;
}

export async function evaluateBusinessOsAccess(
  input: BusinessAccessInput,
): Promise<BusinessAccessDecision> {
  const required = input.requiredPermission ?? "business_os.view";

  let featureEnabled = false;
  try {
    featureEnabled = await input.evaluateFeature({
      tenantId: input.tenantId,
      userId: input.userId,
      featureKey: BUSINESS_OS_FEATURE_KEY,
    });
  } catch {
    return { allowed: false, reason: "feature_disabled", featureEnabled: false };
  }

  if (!featureEnabled) {
    return { allowed: false, reason: "feature_disabled", featureEnabled: false };
  }

  if (!hasBusinessPermission(input.permissions, required)) {
    return { allowed: false, reason: "permission_denied", featureEnabled: true };
  }

  if (!input.checkEntitlement) {
    return { allowed: true, reason: "allowed_preview", featureEnabled: true };
  }

  let entitlement: EntitlementDecision;
  try {
    entitlement = await input.checkEntitlement({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      userId: input.userId,
      productKey: BUSINESS_OS_PRODUCT_SLUG,
      featureKey: BUSINESS_OS_FEATURE_KEY,
      action: "access",
    });
  } catch {
    return {
      allowed: false,
      reason: "entitlement_unavailable",
      featureEnabled: true,
    };
  }

  if (entitlement.decision === "unavailable" || entitlement.decision === "error") {
    return {
      allowed: false,
      reason: "entitlement_unavailable",
      featureEnabled: true,
      entitlementReasonCode: entitlement.reasonCode,
    };
  }

  if (entitlement.allowed) {
    return {
      allowed: true,
      reason: "allowed_entitled",
      featureEnabled: true,
      entitlementReasonCode: entitlement.reasonCode,
    };
  }

  if (HARD_DENY_REASONS.has(entitlement.reasonCode)) {
    return {
      allowed: false,
      reason: "entitlement_denied",
      featureEnabled: true,
      entitlementReasonCode: entitlement.reasonCode,
    };
  }

  if (FOUNDATION_PREVIEW_REASONS.has(entitlement.reasonCode)) {
    return {
      allowed: true,
      reason: "allowed_preview",
      featureEnabled: true,
      entitlementReasonCode: entitlement.reasonCode,
    };
  }

  return {
    allowed: false,
    reason: "entitlement_denied",
    featureEnabled: true,
    entitlementReasonCode: entitlement.reasonCode,
  };
}
