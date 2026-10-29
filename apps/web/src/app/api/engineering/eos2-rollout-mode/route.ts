import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { canEnrollEos2 } from "@/lib/commerce/eos2-rollout";
import { applyEos2Mode } from "@/lib/commerce/eos2-rollout-mode";
import { lifecycleErrorResponse, unauthenticatedResponse } from "@/lib/lifecycle-api";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(crypto.randomUUID());
  if (!ctx.tenantId) return lifecycleErrorResponse("eos2_rollout_invalid", "Tenant is required.", 422, crypto.randomUUID());
  const tenant = await ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).maybeSingle();
  const settings = tenant.data?.settings as { eos2?: { mode?: unknown } } | null;
  const mode = settings?.eos2?.mode === "controlled_pilot" ? "controlled_pilot" : "off";
  return NextResponse.json({ data: { mode, approvalGranted: false } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(crypto.randomUUID());
  if (!canEnrollEos2(ctx.roleSlug)) {
    return lifecycleErrorResponse("eos2_rollout_denied", "EOS 2 rollout mode requires platform tenant administration.", 403, crypto.randomUUID());
  }
  if (!ctx.tenantId || !ctx.workspaceId) {
    return lifecycleErrorResponse("eos2_rollout_invalid", "Tenant and workspace are required.", 422, crypto.randomUUID());
  }
  const body = (await request.json().catch(() => null)) as { mode?: unknown } | null;
  const requested = typeof body?.mode === "string" ? body.mode : "";
  const preview = applyEos2Mode({}, requested);
  if (!preview.ok) {
    return lifecycleErrorResponse("eos2_rollout_invalid", "Rollout mode must be off or controlled_pilot.", 422, crypto.randomUUID());
  }
  const written = await ctx.supabase.rpc("eos2_18r_set_rollout_mode", {
    p_tenant: ctx.tenantId,
    p_workspace: ctx.workspaceId,
    p_mode: requested,
  });
  if (written.error) {
    return lifecycleErrorResponse("eos2_rollout_failed", "Rollout mode was not saved.", 409, crypto.randomUUID());
  }
  const result = (written.data ?? {}) as { ok?: boolean; mode?: string; error?: string };
  const readBack = await ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).maybeSingle();
  const settings = readBack.data?.settings as { eos2?: { mode?: unknown } } | null;
  const persisted = settings?.eos2?.mode === "controlled_pilot" || settings?.eos2?.mode === "off" ? settings.eos2.mode : null;
  if (!result.ok || persisted !== requested) {
    return NextResponse.json({ data: { ok: false, mode: persisted, error: result.error ?? "not_persisted", approvalGranted: false } }, { status: 409 });
  }
  return NextResponse.json({ data: { ok: true, mode: persisted, approvalGranted: false } });
}
