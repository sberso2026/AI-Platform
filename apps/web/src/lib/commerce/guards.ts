import { redirect } from "next/navigation";
import type { AuthContext } from "@/lib/kernel";
import type { CommerceAccessPolicy, EntitlementCheckInput } from "@rtb/platform-commerce";
import { EntitlementDeniedError } from "@rtb/platform-commerce";

export async function assertCommercePolicyForPage(
  ctx: AuthContext,
  policy: CommerceAccessPolicy,
  returnPath: string
) {
  const decision = await ctx.commerce.entitlements.check({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    productKey: policy.productKey,
    applicationKey: policy.applicationKey,
    featureKey: policy.featureKey,
    action: policy.action,
    cachePolicy: policy.cachePolicy ?? "allow-short-cache",
  });

  if (policy.seatRequired && decision.seatRequired && !decision.seatAssigned) {
    redirect(`/access-denied?reason=seat_not_assigned&return=${encodeURIComponent(returnPath)}`);
  }

  if (!decision.allowed) {
    redirect(`/access-denied?reason=${decision.reasonCode}&return=${encodeURIComponent(returnPath)}`);
  }

  return decision;
}

const PRODUCT_SLUG_BY_PATH: Record<string, string> = {
  "/engineering": "engineering-os",
};

const APPLICATION_BY_PATH_PREFIX: Array<{ prefix: string; key: string }> = [
  { prefix: "/engineering/project-intelligence", key: "project_intelligence" },
  { prefix: "/engineering/inspection", key: "inspection_intelligence" },
  { prefix: "/engineering/project-controls", key: "project_controls" },
  { prefix: "/engineering/meetings", key: "meetings" },
  { prefix: "/engineering/documents", key: "documents" },
  { prefix: "/engineering/structural-intelligence", key: "structural_intelligence" },
  { prefix: "/engineering/knowledge", key: "knowledge" },
];

export function resolveEntitlementTarget(pathname: string): {
  productKey?: string;
  applicationKey?: string;
} {
  for (const { prefix, key } of APPLICATION_BY_PATH_PREFIX) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return { productKey: "engineering-os", applicationKey: key };
    }
  }
  if (pathname === "/engineering" || pathname.startsWith("/engineering/")) {
    return { productKey: "engineering-os" };
  }
  for (const [path, slug] of Object.entries(PRODUCT_SLUG_BY_PATH)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) {
      return { productKey: slug };
    }
  }
  return {};
}

export async function requireProductEntitlement(
  ctx: AuthContext,
  productKey: string,
  returnPath?: string
) {
  return requireEntitlement(ctx, { productKey }, returnPath);
}

export async function requireApplicationEntitlement(
  ctx: AuthContext,
  productKey: string,
  applicationKey: string,
  returnPath?: string
) {
  return requireEntitlement(ctx, { productKey, applicationKey }, returnPath);
}

export async function requireFeatureEntitlement(
  ctx: AuthContext,
  featureKey: string,
  returnPath?: string
) {
  return requireEntitlement(ctx, { featureKey }, returnPath);
}

export async function requireEntitlement(
  ctx: AuthContext,
  target: { productKey?: string; applicationKey?: string; featureKey?: string },
  returnPath?: string
) {
  const input: EntitlementCheckInput = {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    productKey: target.productKey,
    applicationKey: target.applicationKey,
    featureKey: target.featureKey,
    action: "access",
  };

  const decision = await ctx.commerce.entitlements.check(input);

  if (decision.decision === "unavailable" || decision.decision === "error") {
    redirect(
      `/access-denied?reason=${decision.reasonCode}&return=${encodeURIComponent(returnPath ?? "/")}`
    );
  }

  if (!decision.allowed) {
    redirect(
      `/access-denied?reason=${decision.reasonCode}&return=${encodeURIComponent(returnPath ?? "/")}`
    );
  }

  return decision;
}

export function assertEntitlementOrThrow(
  decision: Awaited<ReturnType<AuthContext["commerce"]["entitlements"]["check"]>>
) {
  if (!decision.allowed) {
    throw new EntitlementDeniedError(decision.reasonCode);
  }
}

export function hasCommerceAdmin(ctx: AuthContext): boolean {
  return (
    ctx.roleSlug === "owner" ||
    ctx.permissions.some(
      (p) => p.resource === "commerce" && (p.action === "admin" || p.action === "manage_subscriptions")
    )
  );
}
