import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { createDefect } from "@rtb/inspection-intelligence";
import { CommerceDomainError } from "@rtb/platform-commerce";

/** Pilot-supported Inspection Intelligence subset. Not Inspection Intelligence GA. */
const INSPECTION_PILOT_SUBSET = [
  "plan",
  "start",
  "observe",
  "measure",
  "evidence",
  "defect",
  "recommend",
  "verify",
  "complete",
] as const;

type WorkflowAction = (typeof INSPECTION_PILOT_SUBSET)[number];

function requireWorkspace(workspaceId: string | undefined): string {
  if (!workspaceId) {
    throw new CommerceDomainError("Workspace required", "workspace_required", 403);
  }
  return workspaceId;
}

function fail(message: string): never {
  throw new CommerceDomainError(message, "inspection_workflow_failed", 422);
}

export const GET = withEngineeringApi("inspection-intelligence-workflow", async ({ ctx }) => {
  const workspaceId = requireWorkspace(ctx.workspaceId);
  const tenantId = ctx.tenantId;
  const [
    plans,
    sessions,
    observations,
    measurements,
    evidence,
    defects,
    recommendations,
    actions,
    verifications,
  ] = await Promise.all([
      ctx.supabase
        .from("inspection_plans")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(50),
      ctx.supabase
        .from("inspection_sessions")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(50),
      ctx.supabase
        .from("inspection_observations")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("recorded_at", { ascending: false })
        .limit(100),
      ctx.supabase
        .from("inspection_measurements")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("recorded_at", { ascending: false })
        .limit(100),
      ctx.supabase
        .from("inspection_evidence")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      ctx.supabase
        .from("inspection_defects")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      ctx.supabase
        .from("inspection_recommendations")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      ctx.supabase
        .from("inspection_corrective_actions")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      ctx.supabase
        .from("inspection_verifications")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

  const firstError = [
    plans,
    sessions,
    observations,
    measurements,
    evidence,
    defects,
    recommendations,
    actions,
    verifications,
  ].find((r) => r.error)?.error;
  if (firstError) throw new Error(firstError.message);

  return NextResponse.json({
    data: {
      durable: true,
      persistence: "hosted",
      subset: INSPECTION_PILOT_SUBSET,
      gaClaimed: false,
      plans: plans.data ?? [],
      sessions: sessions.data ?? [],
      observations: observations.data ?? [],
      measurements: measurements.data ?? [],
      evidence: evidence.data ?? [],
      defects: defects.data ?? [],
      recommendations: recommendations.data ?? [],
      correctiveActions: actions.data ?? [],
      verifications: verifications.data ?? [],
    },
  });
});

export const POST = withEngineeringApi(
  "inspection-intelligence-workflow",
  async ({ ctx }, request) => {
    const workspaceId = requireWorkspace(ctx.workspaceId);
    const tenantId = ctx.tenantId;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action ?? "") as WorkflowAction;

    async function ensureTemplate(): Promise<string> {
      const existing = await ctx.supabase
        .from("inspection_templates")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .limit(1)
        .maybeSingle();
      if (existing.data?.id) return existing.data.id as string;
      const inserted = await ctx.supabase
        .from("inspection_templates")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          pack_id: "generic",
          title: "Pilot inspection template",
          checklist_item_types: ["visual", "measurement"],
        })
        .select("id")
        .single();
      if (inserted.error || !inserted.data) fail(inserted.error?.message ?? "Failed to create template");
      return inserted.data.id as string;
    }

    if (action === "plan") {
      const templateId = await ensureTemplate();
      const title = String(body.title ?? "").trim() || "Pilot inspection plan";
      const inserted = await ctx.supabase
        .from("inspection_plans")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          template_id: templateId,
          title,
          status: "planned",
          targets: body.targets ?? [],
        })
        .select("*")
        .single();
      if (inserted.error || !inserted.data) fail(inserted.error?.message ?? "Failed to create plan");
      return NextResponse.json({ data: { plan: inserted.data } }, { status: 201 });
    }

    if (action === "start") {
      let planId = typeof body.planId === "string" ? body.planId : "";
      if (!planId) {
        const templateId = await ensureTemplate();
        const plan = await ctx.supabase
          .from("inspection_plans")
          .insert({
            tenant_id: tenantId,
            workspace_id: workspaceId,
            template_id: templateId,
            title: String(body.title ?? "Pilot inspection"),
            status: "planned",
            targets: [],
          })
          .select("id")
          .single();
        if (plan.error || !plan.data) fail(plan.error?.message ?? "Failed to create plan");
        planId = plan.data.id as string;
      }
      const inserted = await ctx.supabase
        .from("inspection_sessions")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          plan_id: planId,
          status: "started",
          started_at: new Date().toISOString(),
          targets: body.targets ?? [],
        })
        .select("*")
        .single();
      if (inserted.error || !inserted.data) fail(inserted.error?.message ?? "Failed to start session");
      return NextResponse.json({ data: { session: inserted.data, planId } }, { status: 201 });
    }

    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    if (!sessionId) fail("sessionId required");

    if (action === "observe") {
      const observationBody = String(body.body ?? body.notes ?? "").trim();
      if (!observationBody) fail("observation body required");
      const inserted = await ctx.supabase
        .from("inspection_observations")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          session_id: sessionId,
          checklist_item_type: String(body.checklistItemType ?? "visual"),
          body: observationBody,
        })
        .select("*")
        .single();
      if (inserted.error || !inserted.data) fail(inserted.error?.message ?? "Failed to record observation");
      return NextResponse.json({ data: { observation: inserted.data } }, { status: 201 });
    }

    if (action === "measure") {
      const inserted = await ctx.supabase
        .from("inspection_measurements")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          session_id: sessionId,
          observation_id: body.observationId ?? null,
          measurement_type: String(body.measurementType ?? "numeric"),
          observed_value: body.observedValue ?? { value: body.value ?? 0 },
          expected_value: body.expectedValue ?? null,
          unit: body.unit ?? null,
          evaluation_status: String(body.evaluationStatus ?? "recorded"),
        })
        .select("*")
        .single();
      if (inserted.error || !inserted.data) fail(inserted.error?.message ?? "Failed to record measurement");
      return NextResponse.json({ data: { measurement: inserted.data } }, { status: 201 });
    }

    if (action === "evidence") {
      const payload = String(body.body ?? body.notes ?? "field evidence");
      const hash = createHash("sha256").update(payload).digest("hex");
      const inserted = await ctx.supabase
        .from("inspection_evidence")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          session_id: sessionId,
          observation_id: body.observationId ?? null,
          kind: String(body.kind ?? "note"),
          content_hash: hash,
          hash_algorithm: "sha256",
          provenance: { capturedBy: ctx.userId, note: payload },
          chain_of_custody: { capturedBy: ctx.userId },
          immutable: true,
        })
        .select("*")
        .single();
      if (inserted.error || !inserted.data) fail(inserted.error?.message ?? "Failed to record evidence");
      return NextResponse.json({ data: { evidence: inserted.data } }, { status: 201 });
    }

    if (action === "defect") {
      const defect = createDefect({
        tenantId,
        workspaceId,
        sessionId,
        observationId: typeof body.observationId === "string" ? body.observationId : undefined,
        title: String(body.title ?? "Recorded defect"),
        description: String(body.description ?? body.title ?? "Defect recorded during inspection"),
        taxonomy: {
          severity: (body.severity as "low" | "medium" | "high" | "critical") ?? "medium",
          urgency: (body.urgency as "routine" | "priority" | "immediate") ?? "priority",
          monitoringRequired: false,
          defectCategory: String(body.category ?? "condition"),
        },
      });
      const inserted = await ctx.supabase
        .from("inspection_defects")
        .insert({
          id: defect.id,
          tenant_id: tenantId,
          workspace_id: workspaceId,
          session_id: sessionId,
          observation_id: defect.observationId ?? null,
          taxonomy: defect.taxonomy,
          status: defect.status,
          title: defect.title,
          description: defect.description,
        })
        .select("*")
        .single();
      if (inserted.error || !inserted.data) fail(inserted.error?.message ?? "Failed to record defect");
      return NextResponse.json({ data: { defect: inserted.data } }, { status: 201 });
    }

    if (action === "recommend") {
      const rec = await ctx.supabase
        .from("inspection_recommendations")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          session_id: sessionId,
          defect_id: body.defectId ?? null,
          action: String(body.recommendation ?? "Correct recorded condition"),
          rationale: String(body.rationale ?? "Pilot inspection recommendation"),
          status: "open",
        })
        .select("*")
        .single();
      if (rec.error || !rec.data) fail(rec.error?.message ?? "Failed to record recommendation");
      let correctiveAction = null;
      if (body.defectId) {
        const due = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const ca = await ctx.supabase
          .from("inspection_corrective_actions")
          .insert({
            tenant_id: tenantId,
            workspace_id: workspaceId,
            session_id: sessionId,
            defect_id: body.defectId,
            recommendation_id: rec.data.id,
            owner_person_id: ctx.userId,
            due_at: due,
            description: String(body.recommendation ?? rec.data.action),
            status: "open",
          })
          .select("*")
          .single();
        if (ca.error) fail(ca.error.message);
        correctiveAction = ca.data;
      }
      return NextResponse.json(
        { data: { recommendation: rec.data, correctiveAction } },
        { status: 201 },
      );
    }

    if (action === "verify") {
      const inserted = await ctx.supabase
        .from("inspection_verifications")
        .insert({
          tenant_id: tenantId,
          workspace_id: workspaceId,
          session_id: sessionId,
          kind: String(body.kind ?? "session"),
          subject_id: body.subjectId ?? sessionId,
          status: String(body.status ?? "verified"),
          verifier_person_id: ctx.userId,
          notes: body.notes ?? "Human verification recorded",
        })
        .select("*")
        .single();
      if (inserted.error || !inserted.data) fail(inserted.error?.message ?? "Failed to record verification");
      return NextResponse.json({ data: { verification: inserted.data } }, { status: 201 });
    }

    if (action === "complete") {
      const updated = await ctx.supabase
        .from("inspection_sessions")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("tenant_id", tenantId)
        .eq("id", sessionId)
        .select("*")
        .single();
      if (updated.error || !updated.data) fail(updated.error?.message ?? "Failed to complete session");
      return NextResponse.json({ data: { session: updated.data } });
    }

    return NextResponse.json({ error: "Unknown inspection action" }, { status: 422 });
  },
);
