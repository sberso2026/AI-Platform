import { redirect } from "next/navigation";
import type { AuthContext } from "@/lib/kernel";
import {
  evaluateBusinessOsAccess,
  type BusinessAccessDecision,
  type BusinessPermission,
} from "@rtb/business-os";
import { BUSINESS_OS_FEATURE_KEY } from "@rtb/business-os";
import { AuditService } from "@rtb/platform-core";

export { BUSINESS_OS_FEATURE_KEY };

function mapReasonToRedirect(reason: BusinessAccessDecision["reason"], entitlementReason?: string): string {
  if (reason === "feature_disabled") return "feature_not_enabled";
  if (reason === "permission_denied") return "permission_denied";
  if (reason === "entitlement_unavailable") return "entitlement_unavailable";
  if (reason === "unauthenticated") return "unauthenticated";
  return entitlementReason ?? "access_denied";
}

export async function evaluateBusinessAccess(
  ctx: AuthContext,
  requiredPermission: BusinessPermission = "business_os.view",
): Promise<BusinessAccessDecision> {
  return evaluateBusinessOsAccess({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    permissions: ctx.permissions,
    requiredPermission,
    evaluateFeature: (input) =>
      ctx.kernel.intelligence.features.evaluate({
        tenantId: input.tenantId,
        userId: input.userId,
        featureKey: input.featureKey,
      }),
    checkEntitlement: (input) =>
      ctx.commerce.entitlements.check({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        userId: input.userId,
        productKey: input.productKey,
        featureKey: input.featureKey,
        action: input.action,
      }),
  });
}

export async function requireBusinessOsAccess(
  ctx: AuthContext | null,
  requiredPermission: BusinessPermission = "business_os.view",
  returnPath = "/business",
): Promise<AuthContext> {
  if (!ctx) redirect("/login");

  const decision = await evaluateBusinessAccess(ctx, requiredPermission);
  const audit = new AuditService(ctx.supabase);
  await audit.log({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    action: decision.allowed ? "read" : "reject",
    resourceType: "business_os",
    resourceId: "foundation",
    metadata: {
      reason: decision.reason,
      featureKey: BUSINESS_OS_FEATURE_KEY,
      entitlementReasonCode: decision.entitlementReasonCode ?? null,
    },
  });

  if (!decision.allowed) {
    const reason = mapReasonToRedirect(decision.reason, decision.entitlementReasonCode);
    redirect(`/access-denied?reason=${encodeURIComponent(reason)}&return=${encodeURIComponent(returnPath)}`);
  }

  return ctx;
}
