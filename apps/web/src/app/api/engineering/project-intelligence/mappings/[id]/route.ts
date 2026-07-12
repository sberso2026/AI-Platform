import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceMigration } from "@/lib/project-intelligence/access";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";
import { ProjectIntelligenceError } from "@rtb/project-intelligence";

const changes = {
  approve: { mapping_status: "approved" },
  reject: { mapping_status: "retired" },
  conflict: { mapping_status: "conflict", conflict_state: "open" },
  defer: { mapping_status: "pending_review", conflict_state: "deferred" },
} as const;

async function findScopedMapping(
  context: Parameters<typeof requireProjectIntelligenceMigration>[0],
  id: string,
) {
  const { data, error } = await context.ctx.supabase
    .from("project_intelligence_project_mappings")
    .select("*")
    .eq("id", id)
    .eq("tenant_id", context.ctx.tenantId)
    .eq("workspace_id", context.ctx.workspaceId ?? "")
    .maybeSingle();
  if (error) throw error;
  if (!data) {
    // Scope predicates intentionally make foreign IDs indistinguishable from missing IDs.
    throw new ProjectIntelligenceError("mapping_not_found", "Mapping was not found", 404);
  }
  return data;
}

export const GET = withEngineeringApiParams("project-intelligence-mappings", async (context, _request, { id }) => {
  try {
    requireProjectIntelligenceMigration(context);
    return NextResponse.json({ data: await findScopedMapping(context, id) });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});

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
      const mapping = await findScopedMapping(context, id);
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
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new ProjectIntelligenceError("mapping_not_found", "Mapping was not found", 404);

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
