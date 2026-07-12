import { NextResponse } from "next/server";
import { collectHealthChecks } from "@rtb/project-intelligence";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("project-intelligence-health", async (context) => {
  try {
    requireProjectIntelligenceRead(context);
    const report = await collectHealthChecks({
      mappings: async () => {
        const { error } = await context.ctx.supabase
          .from("project_intelligence_project_mappings")
          .select("id")
          .eq("tenant_id", context.ctx.tenantId)
          .limit(1);
        return error ? { status: "failed", message: error.message } : "healthy";
      },
      workspace: async () =>
        context.ctx.workspaceId ? "healthy" : { status: "degraded", message: "No assigned workspace" },
    });
    return NextResponse.json({ data: report });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
