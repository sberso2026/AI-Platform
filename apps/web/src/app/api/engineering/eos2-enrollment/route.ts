import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { canEnrollEos2 } from "@/lib/commerce/eos2-rollout";
import { auditEos2Rollout } from "@/lib/commerce/eos2-rollout-server";
import { lifecycleErrorResponse, unauthenticatedResponse } from "@/lib/lifecycle-api";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(crypto.randomUUID());
  if (!canEnrollEos2(ctx.roleSlug)) {
    return lifecycleErrorResponse(
      "eos2_enrollment_denied",
      "EOS 2 enrollment requires platform tenant administration.",
      403,
      crypto.randomUUID(),
    );
  }
  const body = (await request.json().catch(() => null)) as { enrolled?: unknown; reason?: unknown } | null;
  const enrolled = body?.enrolled === true;
  const reason = typeof body?.reason === "string" ? body.reason.trim().slice(0, 240) : "";
  if (!ctx.workspaceId || !reason) {
    return lifecycleErrorResponse("eos2_enrollment_invalid", "Workspace and reason are required.", 422, crypto.randomUUID());
  }
  const now = new Date().toISOString();
  const row = {
    tenant_id: ctx.tenantId,
    workspace_id: ctx.workspaceId,
    enrolled,
    enrolled_at: enrolled ? now : null,
    disabled_at: enrolled ? null : now,
    authority_role: ctx.roleSlug,
    actor_id: ctx.userId,
    reason,
  };
  const existing = await ctx.supabase
    .from("eos2_workspace_enrollment")
    .select("id")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId)
    .maybeSingle();
  const write = existing.data?.id
    ? await ctx.supabase.from("eos2_workspace_enrollment").update(row).eq("id", existing.data.id).select("enrolled")
    : await ctx.supabase.from("eos2_workspace_enrollment").insert(row).select("enrolled");
  if (write.error || !write.data?.length) {
    return lifecycleErrorResponse("eos2_enrollment_denied", "EOS 2 enrollment was not saved.", 403, crypto.randomUUID());
  }
  await auditEos2Rollout(ctx, enrolled ? "eos2_workspace_enrolled" : "eos2_workspace_disabled", {
    authorityRole: ctx.roleSlug,
    approvalGranted: false,
  });
  return NextResponse.json({ data: { enrolled, approvalGranted: false } });
}
