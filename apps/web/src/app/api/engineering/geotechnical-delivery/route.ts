import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { createGeotechnicalDelivery, geotechnicalHome, reviewGeotechnical } from "@rtb/engineering-os/geotechnical-delivery";

export const GET = withEngineeringApi("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createGeotechnicalDelivery({
    id: "unpersisted",
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified geotechnical delivery",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const { data } = await ctx.supabase
    .from("engineering_geotechnical_deliveries")
    .select("id, project_id, stage, title")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId)
    .limit(20);
  return NextResponse.json({ data: { view: geotechnicalHome(created.delivery), rows: data ?? [], approvalGranted: false } });
});

export const POST = withEngineeringApi("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createGeotechnicalDelivery({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified geotechnical delivery",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const reviewed = reviewGeotechnical(created.delivery, {
    actorId: ctx.userId,
    actorRole: ctx.roleSlug ?? null,
    at: new Date().toISOString(),
    workspaceId: ctx.workspaceId,
    canApprove: false,
  }, { id: "absent", subjectId: "absent", revision: 1, outcome: "approved" });
  return NextResponse.json({ data: { committed: reviewed.error === null, error: reviewed.error, approvalGranted: false } });
});
