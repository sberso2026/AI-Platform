import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { composeProjectCostProgressIntelligence } from "@/lib/project-intelligence/cost-progress-intelligence-service";
import { handleCommerceDomainError, lifecycleErrorResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams(
  "project-intelligence-cost-progress",
  async (context, _request, { projectId }) => {
    try {
      requireProjectIntelligenceRead(context);
      if (!context.ctx.workspaceId) {
        return lifecycleErrorResponse(
          "workspace_not_assigned",
          "An assigned workspace is required",
          403,
          context.correlationId,
        );
      }
      const data = await composeProjectCostProgressIntelligence(context, projectId);
      return NextResponse.json({ data });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
