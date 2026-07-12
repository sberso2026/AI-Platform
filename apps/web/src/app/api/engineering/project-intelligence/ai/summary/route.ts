import { NextResponse } from "next/server";
import { ProjectIntelligenceAIAdapter, type ProjectStateEvidence } from "@rtb/project-intelligence/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

const unavailableDirector = {
  summarize: async () => {
    throw new Error("Project Intelligence AI director is not configured");
  },
};

export const POST = withEngineeringApi("project-intelligence-ai-summary", async (context, request) => {
  try {
    requireProjectIntelligenceRead(context);
    const { mappingId } = await request.json();
    const { data: mapping, error } = await context.ctx.supabase
      .from("project_intelligence_project_mappings")
      .select("metadata")
      .eq("id", mappingId)
      .eq("tenant_id", context.ctx.tenantId)
      .eq("workspace_id", context.ctx.workspaceId ?? "")
      .single();
    if (error) throw error;

    // Evidence is intentionally read from persisted mapping metadata only; callers cannot
    // inject unreviewed prompt content through this read-only endpoint.
    const metadata = (mapping.metadata ?? {}) as { evidence?: ProjectStateEvidence[] };
    const evidence = Array.isArray(metadata.evidence) ? metadata.evidence.slice(0, 1) : [];
    const adapter = new ProjectIntelligenceAIAdapter(unavailableDirector);
    const data = await adapter.summarizeMappedProjectState(evidence, context.correlationId);
    return NextResponse.json({ data });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
