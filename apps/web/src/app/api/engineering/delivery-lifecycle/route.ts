import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import {
  createDeliveryLifecycle,
  lifecycleAdvisory,
  requestStageTransition,
  type DeliveryLifecycle,
} from "@rtb/engineering-os/delivery-lifecycle";

function view(lifecycle: DeliveryLifecycle) {
  const blockers = lifecycle.criteria.filter((item) => item.blocking && item.status === "unmet");
  const exceptions = lifecycle.criteria.filter((item) => item.status === "exception");
  return {
    stage: lifecycle.stage,
    maturity: lifecycle.maturity,
    disciplines: lifecycle.disciplines,
    baselineId: lifecycle.baselineId,
    blockers: blockers.map((item) => item.criterion),
    exceptions: exceptions.map((item) => item.criterion),
    openAssumptions: lifecycle.assumptions.filter((item) => item.status === "open" || item.status === "blocking_next_stage").length,
    openInterfaces: lifecycle.interfaces.filter((item) => item.acceptance === "pending").length,
    activeChanges: lifecycle.changes.filter((item) => item.impactStatus !== "decided").length,
    deliverableCount: lifecycle.deliverables.length,
    advisory: lifecycleAdvisory(lifecycle),
    approvalGranted: false,
  };
}

export const GET = withEngineeringApi("lifecycle", async ({ ctx }, request) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const projectId = new URL(request.url).searchParams.get("projectId");
  const created = createDeliveryLifecycle({
    id: "unpersisted",
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: "unselected",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  let query = ctx.supabase
    .from("engineering_delivery_lifecycles")
    .select("id, project_id, stage, maturity, state")
    .eq("tenant_id", ctx.tenantId)
    .eq("workspace_id", ctx.workspaceId);
  if (projectId) query = query.eq("project_id", projectId);
  const { data } = await query.limit(20);
  return NextResponse.json({
    data: {
      classified: Array.isArray(data) ? data.length : 0,
      defaultStage: created.lifecycle.stage,
      view: view(created.lifecycle),
      rows: data ?? [],
    },
  });
});

export const POST = withEngineeringApi("lifecycle", async ({ ctx }, request) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const body = (await request.json()) as {
    projectId?: string;
    to?: string;
    reason?: string;
    actorRole?: string;
  };
  const created = createDeliveryLifecycle({
    id: crypto.randomUUID(),
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    projectId: body.projectId ?? "unselected",
    actorId: ctx.userId,
    at: new Date().toISOString(),
  });
  const result = requestStageTransition(created.lifecycle, {
    to: body.to ?? "concept",
    reason: body.reason ?? "explicit classification",
    actorId: ctx.userId,
    actorRole: body.actorRole ?? ctx.roleSlug ?? null,
    at: new Date().toISOString(),
    canAuthorizeLifecycleTransition: false,
  });
  return NextResponse.json({
    data: {
      committed: result.committed,
      error: result.error,
      blockers: result.blockers,
      view: view(result.lifecycle),
      audit: result.audit,
    },
  });
});
