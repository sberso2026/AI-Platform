import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { canEnrollEos2 } from "@/lib/commerce/eos2-rollout";
import { EOS2_GA_PRODUCT_KEY } from "@/lib/commerce/eos2-ga-entitlement";
import { lifecycleErrorResponse, unauthenticatedResponse } from "@/lib/lifecycle-api";

type Body = {
  action?: "grant" | "suspend" | "revoke" | "restore";
  workspaceId?: string;
  grantSource?: string;
  classification?: string;
  reason?: string;
  validUntil?: string | null;
};

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(crypto.randomUUID());
  if (!ctx.workspaceId) {
    return lifecycleErrorResponse("eos2_entitlement_invalid", "Workspace is required.", 422, crypto.randomUUID());
  }
  const { data, error } = await ctx.supabase
    .from("eos2_ga_entitlements")
    .select(
      "id, product_key, status, grant_source, classification, valid_from, valid_until, suspended_at, revoked_at, reason",
    )
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId)
    .eq("product_key", EOS2_GA_PRODUCT_KEY)
    .maybeSingle();
  if (error) return NextResponse.json({ error: "read_failed" }, { status: 500 });
  return NextResponse.json({ data: { entitlement: data, productKey: EOS2_GA_PRODUCT_KEY } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(crypto.randomUUID());
  if (!canEnrollEos2(ctx.roleSlug)) {
    return lifecycleErrorResponse(
      "eos2_entitlement_denied",
      "EOS 2 GA entitlement changes require tenant owner or admin.",
      403,
      crypto.randomUUID(),
    );
  }
  if (!ctx.tenantId) {
    return lifecycleErrorResponse("eos2_entitlement_invalid", "Tenant is required.", 422, crypto.randomUUID());
  }

  const body = (await request.json().catch(() => null)) as Body | null;
  const workspaceId = body?.workspaceId ?? ctx.workspaceId;
  if (!workspaceId || !body?.action || !body.reason?.trim()) {
    return lifecycleErrorResponse(
      "eos2_entitlement_invalid",
      "action, workspaceId, and reason are required.",
      422,
      crypto.randomUUID(),
    );
  }

  const now = new Date().toISOString();
  const authority = ctx.roleSlug ?? "admin";

  if (body.action === "grant") {
    const grantSource = body.grantSource ?? "INTERNAL_VALIDATION";
    const classification = body.classification ?? "INTERNAL_GA_VALIDATION";
    const row = {
      tenant_id: ctx.tenantId,
      workspace_id: workspaceId,
      product_key: EOS2_GA_PRODUCT_KEY,
      status: "active",
      grant_source: grantSource,
      classification,
      valid_from: now,
      valid_until: body.validUntil ?? null,
      suspended_at: null,
      revoked_at: null,
      reason: body.reason.trim(),
      granted_by: ctx.userId,
      authority_role: authority,
      metadata: { billingIndependent: true },
      updated_at: now,
    };
    const existing = await ctx.supabase
      .from("eos2_ga_entitlements")
      .select("id")
      .eq("tenant_id", ctx.tenantId)
      .eq("workspace_id", workspaceId)
      .eq("product_key", EOS2_GA_PRODUCT_KEY)
      .maybeSingle();
    const written = existing.data?.id
      ? await ctx.supabase
          .from("eos2_ga_entitlements")
          .update(row)
          .eq("id", existing.data.id)
          .select("id, status")
          .single()
      : await ctx.supabase.from("eos2_ga_entitlements").insert(row).select("id, status").single();
    if (written.error) {
      return lifecycleErrorResponse("eos2_entitlement_failed", "Grant was not saved.", 409, crypto.randomUUID());
    }
    await ctx.supabase.from("eos2_ga_entitlement_audit").insert({
      entitlement_id: written.data.id,
      tenant_id: ctx.tenantId,
      workspace_id: workspaceId,
      product_key: EOS2_GA_PRODUCT_KEY,
      action: "grant",
      actor_id: ctx.userId,
      authority_role: authority,
      detail: { grantSource, classification, status: written.data.status },
    });
    return NextResponse.json({ data: { ok: true, id: written.data.id, status: written.data.status } });
  }

  const patch =
    body.action === "suspend"
      ? { status: "suspended", suspended_at: now, updated_at: now, reason: body.reason.trim() }
      : body.action === "revoke"
        ? { status: "revoked", revoked_at: now, updated_at: now, reason: body.reason.trim() }
        : {
            status: "active",
            suspended_at: null,
            revoked_at: null,
            updated_at: now,
            reason: body.reason.trim(),
          };

  const updated = await ctx.supabase
    .from("eos2_ga_entitlements")
    .update(patch)
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", workspaceId)
    .eq("product_key", EOS2_GA_PRODUCT_KEY)
    .select("id, status")
    .maybeSingle();

  if (updated.error || !updated.data) {
    return lifecycleErrorResponse("eos2_entitlement_failed", "Entitlement was not updated.", 409, crypto.randomUUID());
  }

  await ctx.supabase.from("eos2_ga_entitlement_audit").insert({
    entitlement_id: updated.data.id,
    tenant_id: ctx.tenantId,
    workspace_id: workspaceId,
    product_key: EOS2_GA_PRODUCT_KEY,
    action: body.action,
    actor_id: ctx.userId,
    authority_role: authority,
    detail: { status: updated.data.status },
  });

  return NextResponse.json({ data: { ok: true, id: updated.data.id, status: updated.data.status } });
}
