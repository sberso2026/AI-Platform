import type { AuthContext } from "@/lib/kernel";
import { decideEos2Access, type Eos2AccessDecision } from "./eos2-rollout";

function emergencyOff(): boolean {
  return (process.env.EOS_2_ROLLOUT ?? "").trim().toLowerCase() === "off";
}

export async function readEos2Access(ctx: AuthContext): Promise<Eos2AccessDecision> {
  if (!ctx.userId || !ctx.tenantId || !ctx.workspaceId) {
    return decideEos2Access({
      authenticated: Boolean(ctx.userId),
      productEntitled: true,
      workspaceId: ctx.workspaceId ?? null,
      mode: "off",
      enrolled: false,
      emergencyOff: emergencyOff(),
    });
  }

  const [tenant, enrollment] = await Promise.all([
    ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).maybeSingle(),
    ctx.supabase
      .from("eos2_workspace_enrollment")
      .select("enrolled")
      .eq("tenant_id", ctx.tenantId)
      .eq("workspace_id", ctx.workspaceId)
      .maybeSingle(),
  ]);

  if (tenant.error || enrollment.error) {
    return decideEos2Access({
      authenticated: true,
      productEntitled: true,
      workspaceId: ctx.workspaceId,
      mode: "off",
      enrolled: false,
      emergencyOff: emergencyOff(),
      indeterminate: true,
    });
  }

  const settings = (tenant.data?.settings ?? {}) as { eos2?: { mode?: unknown } };
  return decideEos2Access({
    authenticated: true,
    productEntitled: true,
    workspaceId: ctx.workspaceId,
    mode: settings.eos2?.mode,
    enrolled: enrollment.data?.enrolled,
    emergencyOff: emergencyOff(),
  });
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
