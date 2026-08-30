import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import {
  getAnalystCapability,
  probeAnalystRuntime,
  runProjectAnalyst,
} from "@/lib/project-intelligence/ai-project-analyst-service";
import { handleCommerceDomainError, lifecycleErrorResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams(
  "project-intelligence-analyst",
  async (context, _request, { projectId }) => {
    try {
      requireProjectIntelligenceRead(context);
      const runtime = await probeAnalystRuntime(context);
      return NextResponse.json({
        data: {
          ...getAnalystCapability(),
          projectId: projectId || undefined,
          aiOptional: true,
          mutationEnabled: false,
          runtime,
        },
      });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);

export const POST = withEngineeringApiParams(
  "project-intelligence-analyst",
  async (context, request, { projectId }) => {
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
      if (!projectId) {
        return lifecycleErrorResponse("analyst_project_required", "projectId is required", 400, context.correlationId);
      }
      const body = (await request.json().catch(() => ({}))) as { question?: string };
      const question = typeof body.question === "string" ? body.question.trim() : "";
      if (!question) {
        return lifecycleErrorResponse("analyst_question_required", "question is required", 400, context.correlationId);
      }
      const data = await runProjectAnalyst(context, projectId, question);
      return NextResponse.json({ data });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
