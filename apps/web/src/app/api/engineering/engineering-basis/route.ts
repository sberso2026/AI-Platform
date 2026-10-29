import { NextResponse } from "next/server";
import { withEos2Api } from "@/lib/commerce/engineering-api";
import { createBasisGraph, overview, reviewBasis } from "@rtb/engineering-os/engineering-basis";
import type { EngineeringBasisGraph } from "@rtb/engineering-os/engineering-basis";

function emptyView(tenantId: string, workspaceId: string, actorId: string) {
  const created = createBasisGraph({
    id: "unpersisted",
    tenantId,
    workspaceId,
    projectId: "unselected",
    actorId,
    at: new Date().toISOString(),
  });
  return overview(created.graph);
}

export const GET = withEos2Api("requirements", async ({ ctx }, request) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const projectId = new URL(request.url).searchParams.get("projectId");
  let query = ctx.supabase
    .from("engineering_basis_sets")
    .select("id, project_id, stage, jurisdiction_profile, revision")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId);
  if (projectId) query = query.eq("project_id", projectId);
  const { data } = await query.limit(20);
  const rows = data ?? [];
  return NextResponse.json({
    data: {
      view: emptyView(ctx.tenantId, ctx.workspaceId, ctx.userId),
      viewSource: "unpersisted_scaffold",
      persistedBasisSetCount: rows.length,
      rows,
      approvalGranted: false,
    },
  });
});

export const POST = withEos2Api("requirements", async ({ ctx }, request) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const body = (await request.json()) as { projectId?: string; itemId?: string; outcome?: "approved" };
  const created = createBasisGraph({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: body.projectId ?? "unselected",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const reviewed = reviewBasis(created.graph, {
    actorId: ctx.userId,
    actorRole: ctx.roleSlug ?? null,
    at: new Date().toISOString(),
    workspaceId: ctx.workspaceId,
    canApprove: false,
  }, {
    itemId: body.itemId ?? "absent",
    outcome: body.outcome ?? "approved",
    comments: null,
  });
  return NextResponse.json({
    data: {
      committed: reviewed.error === null,
      error: reviewed.error,
      view: overview(reviewed.graph as EngineeringBasisGraph),
      approvalGranted: false,
    },
  });
});
