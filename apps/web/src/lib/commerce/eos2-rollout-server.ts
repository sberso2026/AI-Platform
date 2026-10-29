import type { AuthContext } from "@/lib/kernel";
import { decideEos2Access, type Eos2AccessDecision } from "./eos2-rollout";
import {
  EOS2_GA_PRODUCT_KEY,
  evaluateEos2GaEntitlement,
  type Eos2GaEntitlementRecord,
} from "./eos2-ga-entitlement";

function emergencyOff(): boolean {
  return (process.env.EOS_2_ROLLOUT ?? "").trim().toLowerCase() === "off";
}

function mapGrant(row: Record<string, unknown> | null): Eos2GaEntitlementRecord | null {
  if (!row) return null;
  return {
    productKey: String(row.product_key ?? ""),
    tenantId: String(row.tenant_id ?? ""),
    workspaceId: String(row.workspace_id ?? ""),
    status: row.status as Eos2GaEntitlementRecord["status"],
    grantSource: String(row.grant_source ?? ""),
    validFrom: String(row.valid_from ?? new Date(0).toISOString()),
    validUntil: row.valid_until ? String(row.valid_until) : null,
    suspendedAt: row.suspended_at ? String(row.suspended_at) : null,
    revokedAt: row.revoked_at ? String(row.revoked_at) : null,
  };
}

async function loadGrantRow(ctx: AuthContext) {
  return ctx.supabase
    .from("eos2_ga_entitlements")
    .select(
      "product_key, tenant_id, workspace_id, status, grant_source, valid_from, valid_until, suspended_at, revoked_at",
    )
    .eq("tenant_id", ctx.tenantId!)
    .eq("workspace_id", ctx.workspaceId!)
    .eq("product_key", EOS2_GA_PRODUCT_KEY)
    .maybeSingle();
}

/**
 * Commercial GA entitlement is billing-independent and product-filtered (`eos-2`).
 * Rollout mode + workspace enrollment remain separate fail-closed controls.
 */
export async function readEos2Access(ctx: AuthContext): Promise<Eos2AccessDecision> {
  if (!ctx.userId || !ctx.tenantId || !ctx.workspaceId) {
    return decideEos2Access({
      authenticated: Boolean(ctx.userId),
      productEntitled: false,
      workspaceId: ctx.workspaceId ?? null,
      mode: "off",
      enrolled: false,
      emergencyOff: emergencyOff(),
    });
  }

  const [tenant, enrollment, grant] = await Promise.all([
    ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).maybeSingle(),
    ctx.supabase
      .from("eos2_workspace_enrollment")
      .select("enrolled")
      .eq("tenant_id", ctx.tenantId)
      .eq("workspace_id", ctx.workspaceId)
      .maybeSingle(),
    loadGrantRow(ctx),
  ]);

  if (tenant.error || enrollment.error || grant.error) {
    return decideEos2Access({
      authenticated: true,
      productEntitled: false,
      workspaceId: ctx.workspaceId,
      mode: "off",
      enrolled: false,
      emergencyOff: emergencyOff(),
      indeterminate: true,
    });
  }

  const settings = (tenant.data?.settings ?? {}) as { eos2?: { mode?: unknown } };
  const enrolled = enrollment.data?.enrolled === true;

  // Evaluate commercial grant validity independently of current enrollment/mode
  // (pass an active rollout + enrolled to isolate grant checks from access gates).
  const commercial = evaluateEos2GaEntitlement({
    authenticated: true,
    requestedProductKey: EOS2_GA_PRODUCT_KEY,
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    record: mapGrant((grant.data as Record<string, unknown> | null) ?? null),
    enrolled: true,
    rolloutMode: "general_availability",
    emergencyOff: false,
  });

  return decideEos2Access({
    authenticated: true,
    productEntitled: commercial.entitled,
    workspaceId: ctx.workspaceId,
    mode: settings.eos2?.mode,
    enrolled,
    emergencyOff: emergencyOff(),
  });
}

export async function readEos2GaAccessState(ctx: AuthContext): Promise<{
  access: Eos2AccessDecision;
  entitlement: ReturnType<typeof evaluateEos2GaEntitlement>;
}> {
  const access = await readEos2Access(ctx);
  if (!ctx.userId || !ctx.tenantId || !ctx.workspaceId) {
    return {
      access,
      entitlement: { entitled: false, reason: ctx.userId ? "missing" : "unauthenticated" },
    };
  }

  const [tenant, enrollment, grant] = await Promise.all([
    ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).maybeSingle(),
    ctx.supabase
      .from("eos2_workspace_enrollment")
      .select("enrolled")
      .eq("tenant_id", ctx.tenantId)
      .eq("workspace_id", ctx.workspaceId)
      .maybeSingle(),
    loadGrantRow(ctx),
  ]);

  const settings = (tenant.data?.settings ?? {}) as { eos2?: { mode?: unknown } };
  const entitlement = evaluateEos2GaEntitlement({
    authenticated: true,
    requestedProductKey: EOS2_GA_PRODUCT_KEY,
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    record: mapGrant((grant.data as Record<string, unknown> | null) ?? null),
    enrolled: enrollment.data?.enrolled === true,
    rolloutMode: settings.eos2?.mode,
    emergencyOff: emergencyOff(),
    indeterminate: Boolean(tenant.error || enrollment.error || grant.error),
  });

  return { access, entitlement };
}

export async function auditEos2Rollout(
  ctx: AuthContext,
  action: string,
  detail: Record<string, unknown>,
): Promise<void> {
  if (!ctx.workspaceId) return;
  await ctx.supabase.from("engineering_delivery_audit").insert({
    tenant_id: ctx.tenantId,
    workspace_id: ctx.workspaceId,
    action,
    actor_id: ctx.userId,
    detail,
  });
}
