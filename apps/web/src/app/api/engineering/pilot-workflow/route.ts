import { NextResponse } from "next/server";
import { withEos2Api } from "@/lib/commerce/engineering-api";
import {
  CONTROLLED_PILOT_VALIDATION_PROJECT_ID,
  classifyPilotWrite,
} from "@/lib/engineering/eos2-pilot-workflow";

const PROJECT_ID = CONTROLLED_PILOT_VALIDATION_PROJECT_ID;

export const GET = withEos2Api("lifecycle", async ({ ctx }) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const scope = { tenant_id: ctx.tenantId, workspace_id: ctx.workspaceId, project_id: PROJECT_ID };
  const [basis, discipline, handoff, change, deliverable, freeze, audit] = await Promise.all([
    ctx.supabase.from("engineering_basis_sets").select("id, revision, state").match(scope).maybeSingle(),
    ctx.supabase.from("engineering_structural_deliveries").select("id, revision, title, state").match(scope).maybeSingle(),
    ctx.supabase.from("engineering_interface_handoffs").select("id, revision, status, source_discipline, source_revision, current_revision").match(scope).eq("current_revision", true).maybeSingle(),
    ctx.supabase.from("engineering_change_impact_cases").select("id, case_key, status, previous_value, new_value").match(scope).eq("case_key", "pilot-validation-change").maybeSingle(),
    ctx.supabase.from("engineering_governed_deliverables").select("id, revision, freshness, approval_status, release_status").match(scope).eq("current_revision", true).maybeSingle(),
    ctx.supabase.from("engineering_design_freezes").select("id, frozen, approval_status, fingerprint, scope").match(scope).eq("frozen", true).maybeSingle(),
    ctx.supabase.from("engineering_delivery_audit").select("action, created_at").eq("tenant_id", ctx.tenantId).eq("workspace_id", ctx.workspaceId).like("action", "eos2_%").order("created_at", { ascending: false }).limit(20),
  ]);
  return NextResponse.json({
    data: {
      projectId: PROJECT_ID,
      label: "CONTROLLED_PRODUCTION_PILOT_VALIDATION",
      basis: basis.data,
      discipline: discipline.data,
      interface: handoff.data,
      change: change.data,
      deliverable: deliverable.data,
      freeze: freeze.data,
      audit: audit.data ?? [],
      approvalGranted: false,
    },
  });
});

export const POST = withEos2Api("lifecycle", async ({ ctx }, request) => {
  if (!ctx.workspaceId) return NextResponse.json({ error: "workspace_required" }, { status: 400 });
  const body = (await request.json().catch(() => null)) as {
    action?: string;
    actingRole?: string;
    requestKey?: string;
    expectedRevision?: number;
    title?: string;
    statement?: string;
    materiality?: string;
    discipline?: string;
    projectId?: string;
  } | null;
  const action = body?.action ?? "";
  const decision = classifyPilotWrite({
    action,
    roleSlug: ctx.roleSlug,
    actingRole: body?.actingRole,
    projectId: body?.projectId ?? PROJECT_ID,
    materiality: body?.materiality,
  });
  if (!decision.ok) {
    return NextResponse.json({ data: { ok: false, error: decision.error, approvalGranted: false } }, { status: decision.error === "authority_denied" ? 403 : 422 });
  }
  const { data, error } = await ctx.supabase.rpc("eos2_18r_persist", {
    p_action: action,
    p_payload: {
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      projectId: PROJECT_ID,
      actingRole: body?.actingRole ?? "",
      requestKey: body?.requestKey ?? "",
      expectedRevision: body?.expectedRevision ?? null,
      title: body?.title ?? "",
      statement: body?.statement ?? "",
      materiality: body?.materiality ?? "",
      discipline: body?.discipline ?? "",
    },
  });
  if (error) {
    const denied = /authority|receiver_authority|freeze_authority|materiality_authority|ai_approval/.test(error.message);
    return NextResponse.json(
      { data: { ok: false, error: denied ? "authority_denied" : "persist_failed", approvalGranted: false } },
      { status: denied ? 403 : 409 },
    );
  }
  const result = (data ?? {}) as { ok?: boolean; error?: string };
  return NextResponse.json(
    { data: { ...result, approvalGranted: false } },
    { status: result.ok ? 200 : result.error === "authority_denied" ? 403 : 409 },
  );
});
