import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { lifecycleOkResponse } from "@/lib/lifecycle-api";
import {
  PROJECT_INTELLIGENCE_VERSION,
  collectHealthChecks,
  getProjectIntelligenceVersionDeclaration,
} from "@rtb/project-intelligence";

export const GET = withEngineeringApi("project-intelligence-health", async (context) => {
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
  const version = getProjectIntelligenceVersionDeclaration();
  return lifecycleOkResponse({
    ...report,
    version: PROJECT_INTELLIGENCE_VERSION,
    moduleKey: version.moduleKey,
    releaseTag: version.releaseTag,
    productName: version.productName,
  });
});
