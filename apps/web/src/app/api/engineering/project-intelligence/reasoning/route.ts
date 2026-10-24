import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { runKnowledgeReasoningPipeline } from "@/lib/project-intelligence/knowledge-search-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApi("project-intelligence-reasoning", async (context, request) => {
  try {
    requireProjectIntelligenceRead(context);
    const body = await request.json().catch(() => ({}));
    const tenantId = context.ctx.tenantId;
    const workspaceId = context.ctx.workspaceId;
    if (!tenantId || !workspaceId) {
      return NextResponse.json(
        {
          error: {
            code: "knowledge_scope_required",
            message: "tenant and workspace are required",
            requestId: context.correlationId,
            details: {},
          },
        },
        { status: 400 },
      );
    }
    const question =
      typeof body.question === "string"
        ? body.question.trim()
        : typeof body.query === "string"
          ? body.query.trim()
          : "";
    if (!question) {
      return NextResponse.json(
        {
          error: {
            code: "reasoning_question_required",
            message: "question is required",
            requestId: context.correlationId,
            details: {},
          },
        },
        { status: 400 },
      );
    }
    const data = runKnowledgeReasoningPipeline({
      question,
      tenantId,
      workspaceId,
      seedRefIds: Array.isArray(body.seedRefIds)
        ? body.seedRefIds.filter((id: unknown): id is string => typeof id === "string")
        : undefined,
    });
    return NextResponse.json({ data, correlationId: context.correlationId });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});

export const GET = withEngineeringApi("project-intelligence-reasoning", async (context) => {
  try {
    requireProjectIntelligenceRead(context);
    return NextResponse.json({
      data: {
        feature: "engineering_reasoning_assistant",
        ready: true,
        deterministic: true,
        duplicateOwnership: false,
        usesPlatformAiRuntime: true,
      },
      correlationId: context.correlationId,
    });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
