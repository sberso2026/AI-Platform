import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { closeSafetyAction, createProcessDelivery, processHome } from "@rtb/engineering-os/process-delivery";

export const GET = withEngineeringApi("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createProcessDelivery({
    id: "unpersisted",
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified process delivery",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const { data } = await ctx.supabase
    .from("engineering_process_deliveries")
    .select("id, project_id, stage, title")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId)
    .limit(20);
  return NextResponse.json({ data: { view: processHome(created.delivery), rows: data ?? [], approvalGranted: false } });
});

export const POST = withEngineeringApi("lifecycle", async ({ ctx }, request) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const body = (await request.json()) as { actionId?: string };
  const created = createProcessDelivery({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified process delivery",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const closed = closeSafetyAction(created.delivery, {
    actorId: ctx.userId,
    actorRole: ctx.roleSlug ?? null,
    at: new Date().toISOString(),
    workspaceId: ctx.workspaceId,
    canApprove: false,
  }, body.actionId ?? "absent");
  return NextResponse.json({ data: { committed: closed.error === null, error: closed.error, approvalGranted: false } });
});
