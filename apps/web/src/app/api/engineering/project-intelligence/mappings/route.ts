import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceAdminAccess, requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { handleCommerceDomainError, resolveRequestId } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("project-intelligence-mappings", async (context) => {
  try {
    requireProjectIntelligenceRead(context);
    const { data, error } = await context.ctx.supabase
      .from("project_intelligence_project_mappings")
      .select("*")
      .eq("tenant_id", context.ctx.tenantId)
      .eq("workspace_id", context.ctx.workspaceId ?? "")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ data: data ?? [] });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});

export const POST = withEngineeringApi("project-intelligence-mappings", async (context, request) => {
  try {
    requireProjectIntelligenceAdminAccess(context);
    const body = await request.json();
    if (!context.ctx.workspaceId || !body.engineeringProjectId || !body.legacyProjectIntelligenceProjectId) {
      return NextResponse.json(
        { error: { code: "invalid_mapping_candidate", message: "workspaceId, engineeringProjectId, and legacyProjectIntelligenceProjectId are required", requestId: resolveRequestId(request) } },
        { status: 400 },
      );
    }
    const { data, error } = await context.ctx.supabase
      .from("project_intelligence_project_mappings")
      .insert({
        tenant_id: context.ctx.tenantId,
        workspace_id: context.ctx.workspaceId,
        engineering_project_id: body.engineeringProjectId,
        legacy_project_intelligence_project_id: body.legacyProjectIntelligenceProjectId,
        legacy_source_system: body.legacySourceSystem ?? "project_intelligence",
        mapping_status: "candidate",
        confidence_score: body.confidenceScore ?? 0,
        match_method: body.matchMethod ?? "manual",
        migration_source: body.migrationSource ?? "phase_6b",
        migration_version: body.migrationVersion,
        metadata: body.metadata ?? {},
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
