import { NextResponse } from "next/server";
import { withEos2Api } from "@/lib/commerce/engineering-api";
import { approveFreeze, createFreezeRegister, freezeHome } from "@rtb/engineering-os/design-freeze";

export const GET = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createFreezeRegister({
    id: "unpersisted",
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified design freeze",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const { data } = await ctx.supabase
    .from("engineering_design_freezes")
    .select("id, project_id, freeze_key, freeze_type, frozen, approval_status")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId)
    .limit(20);
  return NextResponse.json({
    data: { view: freezeHome(created.register), rows: data ?? [], approvalGranted: false, releasedByAi: false },
  });
});

export const POST = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createFreezeRegister({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified design freeze",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const reviewed = approveFreeze(created.register, {
    actorId: ctx.userId,
    actorRole: "ai",
    actingRole: "ai",
    at: new Date().toISOString(),
    workspaceId: ctx.workspaceId,
  }, "absent");
  return NextResponse.json({ data: { committed: reviewed.error === null, error: reviewed.error, approvalGranted: false } });
});
