import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { piProjectScopeResponse } from "@/lib/project-intelligence/pi-route";
import {
  getAnalystCapability,
  prepareAnalystRuntime,
  runProjectAnalyst,
} from "@/lib/project-intelligence/ai-project-analyst-service";
import { lifecycleErrorResponse, lifecycleOkResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams(
  "project-intelligence-analyst",
  async (context, _request, { projectId }) => {
    requireProjectIntelligenceRead(context);
    const runtime = await prepareAnalystRuntime(context);
    return lifecycleOkResponse({
      ...getAnalystCapability(),
      projectId: projectId || undefined,
      aiOptional: true,
      mutationEnabled: false,
      runtime,
    });
  },
);

export const POST = withEngineeringApiParams(
  "project-intelligence-analyst",
  async (context, request, { projectId }) => {
    requireProjectIntelligenceRead(context);
    const denied = piProjectScopeResponse(context, projectId);
    if (denied) return denied;
    const body = (await request.json().catch(() => ({}))) as { question?: string };
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question) {
      return lifecycleErrorResponse("analyst_question_required", "question is required", 400, context.correlationId);
    }
    const data = await runProjectAnalyst(context, projectId, question);
    return lifecycleOkResponse(data);
  },
);
