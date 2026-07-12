import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceMigration } from "@/lib/project-intelligence/access";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

const changes = {
  approve: { mapping_status: "approved" },
  reject: { mapping_status: "retired" },
  conflict: { mapping_status: "conflict", conflict_state: "open" },
  defer: { mapping_status: "pending_review", conflict_state: "deferred" },
} as const;

export const PATCH = withEngineeringApiParams("project-intelligence-mappings", async (context, request, { id }) => {
  try {
    requireProjectIntelligenceMigration(context);
    const body = await request.json();
    const change = changes[body.action as keyof typeof changes];
    if (!change) {
      return NextResponse.json(
        { error: { code: "invalid_mapping_action", message: "Action must be approve, reject, conflict, or defer", requestId: context.correlationId } },
        { status: 400 },
      );
    }

    const timestamp = new Date().toISOString();
    if (body.action === "approve") {
      const { data: mapping, error: mappingError } = await context.ctx.supabase
        .from("project_intelligence_project_mappings")
        .select("confidence_score")
        .eq("id", id)
        .eq("tenant_id", context.ctx.tenantId)
        .eq("workspace_id", context.ctx.workspaceId ?? "")
        .single();
      if (mappingError) throw mappingError;
      if (Number(mapping.confidence_score) < 0.8) {
        return NextResponse.json(
          {
            error: {
              code: "mapping_confidence_too_low",
              message: "Mappings below 80% confidence require conflict resolution or deferral",
              requestId: context.correlationId,
            },
          },
          { status: 409 },
        );
      }
    }
    const update = {
      ...change,
      reviewed_by: context.ctx.userId,
      reviewed_at: timestamp,
      ...(body.action === "approve" ? { approved_by: context.ctx.userId, approved_at: timestamp } : {}),
    };
    const { data, error } = await context.ctx.supabase
      .from("project_intelligence_project_mappings")
      .update(update)
      .eq("id", id)
      .eq("tenant_id", context.ctx.tenantId)
      .eq("workspace_id", context.ctx.workspaceId ?? "")
      .select()
      .single();
    if (error) throw error;

    await context.ctx.supabase.from("project_intelligence_mapping_audit").insert({
      tenant_id: context.ctx.tenantId,
      workspace_id: context.ctx.workspaceId,
      mapping_id: id,
      actor_id: context.ctx.userId,
      action: body.action,
      to_status: change.mapping_status,
      event_id: `project_intelligence.mapping.${body.action}:${id}:${context.correlationId}`,
      details: { registerDataMigrated: false },
    });

    return NextResponse.json({ data, meta: { registerDataMigrated: false } });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
