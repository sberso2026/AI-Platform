import { NextResponse } from "next/server";
import { withEos2Api } from "@/lib/commerce/engineering-api";
import { createPipingDelivery, pipingHome, reviewPiping } from "@rtb/engineering-os/piping-delivery";

export const GET = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createPipingDelivery({
    id: "unpersisted",
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified piping delivery",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const { data } = await ctx.supabase
    .from("engineering_piping_deliveries")
    .select("id, project_id, stage, title")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId)
    .limit(20);
  return NextResponse.json({ data: { view: pipingHome(created.delivery), rows: data ?? [], approvalGranted: false } });
});

export const POST = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createPipingDelivery({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified piping delivery",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const reviewed = reviewPiping(created.delivery, {
    actorId: ctx.userId,
    actorRole: ctx.roleSlug ?? null,
    at: new Date().toISOString(),
    workspaceId: ctx.workspaceId,
    canApprove: false,
  }, { id: "absent", subjectId: "absent", revision: 1, outcome: "approved" });
  return NextResponse.json({ data: { committed: reviewed.error === null, error: reviewed.error, approvalGranted: false } });
});
