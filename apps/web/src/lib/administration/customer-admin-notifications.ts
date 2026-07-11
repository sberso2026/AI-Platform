import type { AuthContext } from "@/lib/kernel";

const emittedKeys = new Set<string>();

function dedupeKey(tenantId: string, type: string, correlationId: string): string {
  return `${tenantId}:${type}:${correlationId}`;
}

async function resolveAdminUserIds(ctx: AuthContext): Promise<string[]> {
  const { data: memberships } = await ctx.supabase
    .from("tenant_memberships")
    .select("user_id, role_id")
    .eq("tenant_id", ctx.tenantId)
    .eq("status", "active");

  const { data: roles } = await ctx.supabase
    .from("roles")
    .select("id, slug")
    .in("slug", ["owner", "admin"]);

  const adminRoleIds = new Set((roles ?? []).map((r) => r.id as string));
  return (memberships ?? [])
    .filter((m) => adminRoleIds.has(m.role_id as string))
    .map((m) => m.user_id as string);
}

export async function notifyTenantAdmins(
  ctx: AuthContext,
  input: {
    type: string;
    title: string;
    body?: string;
    linkTarget?: string;
    correlationId: string;
    metadata?: Record<string, unknown>;
    targetUserIds?: string[];
  }
): Promise<void> {
  const key = dedupeKey(ctx.tenantId, input.type, input.correlationId);
  if (emittedKeys.has(key)) return;
  emittedKeys.add(key);

  const userIds = input.targetUserIds ?? (await resolveAdminUserIds(ctx));

  await Promise.all(
    userIds.map((userId) =>
      ctx.kernel.notifications
        .create({
          tenantId: ctx.tenantId,
          userId,
          type: input.type,
          title: input.title,
          body: input.body,
          linkTarget: input.linkTarget,
          metadata: { ...input.metadata, correlationId: input.correlationId },
        })
        .catch(() => undefined)
    )
  );
}

export const AdminNotificationTypes = {
  installationRequested: "commerce.installation.requested",
  installationCompleted: "commerce.installation.completed",
  installationFailed: "commerce.installation.failed",
  productDegraded: "commerce.product.degraded",
  licenceExpiring: "commerce.licence.expiring",
  renewalApproaching: "commerce.subscription.renewal_approaching",
  seatPoolNearCapacity: "commerce.seats.near_capacity",
  usageThreshold: "commerce.usage.threshold",
  growthCreditsExpiring: "commerce.growth_credits.expiring",
  workspaceAccessRemoved: "commerce.workspace.access_removed",
  upgradeAvailable: "commerce.upgrade.available",
  upgradeCompleted: "commerce.upgrade.completed",
  rollbackCompleted: "commerce.rollback.completed",
  invoiceIssued: "commerce.invoice.issued",
  paymentOverdue: "commerce.payment.overdue",
} as const;
