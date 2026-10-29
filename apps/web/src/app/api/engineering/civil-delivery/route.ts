import { NextResponse } from "next/server";
import { withEos2Api } from "@/lib/commerce/engineering-api";
import { createCivilDelivery, civilHome, reviewCivil } from "@rtb/engineering-os/civil-delivery";

export const GET = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createCivilDelivery({
    id: "unpersisted",
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified civil delivery",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const { data } = await ctx.supabase
    .from("engineering_civil_deliveries")
    .select("id, project_id, stage, title")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId)
    .limit(20);
  return NextResponse.json({ data: { view: civilHome(created.delivery), rows: data ?? [], approvalGranted: false } });
});

export const POST = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const created = createCivilDelivery({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    projectTitle: "Unclassified civil delivery",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const reviewed = reviewCivil(created.delivery, {
    actorId: ctx.userId,
    actorRole: ctx.roleSlug ?? null,
    at: new Date().toISOString(),
    workspaceId: ctx.workspaceId,
    canApprove: false,
  }, { id: "absent", subjectId: "absent", revision: 1, outcome: "approved" });
  return NextResponse.json({ data: { committed: reviewed.error === null, error: reviewed.error, approvalGranted: false } });
});
