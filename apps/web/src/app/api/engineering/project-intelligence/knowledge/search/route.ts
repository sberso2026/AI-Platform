import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import {
  analyzeKnowledgeImpact,
  runKnowledgeReasoningPipeline,
  runUnifiedKnowledgeSearch,
} from "@/lib/project-intelligence/knowledge-search-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApi("project-intelligence-knowledge", async (context, request) => {
  try {
    requireProjectIntelligenceRead(context);
    const body = await request.json().catch(() => ({}));
    const action = typeof body.action === "string" ? body.action : "search";
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

    if (action === "reason") {
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
              code: "knowledge_question_required",
              message: "question is required for reasoning",
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
    }

    if (action === "impact") {
      const refId = typeof body.refId === "string" ? body.refId : "";
      if (!refId) {
        return NextResponse.json(
          {
            error: {
              code: "knowledge_ref_required",
              message: "refId is required for impact analysis",
              requestId: context.correlationId,
              details: {},
            },
          },
          { status: 400 },
        );
      }
      const data = analyzeKnowledgeImpact({ refId, tenantId, workspaceId });
      return NextResponse.json({ data, correlationId: context.correlationId });
    }

    const query = typeof body.query === "string" ? body.query.trim() : "";
    if (!query) {
      return NextResponse.json(
        {
          error: {
            code: "knowledge_query_required",
            message: "query is required",
            requestId: context.correlationId,
            details: {},
          },
        },
        { status: 400 },
      );
    }

    const data = runUnifiedKnowledgeSearch({
      query,
      tenantId,
      workspaceId,
      includeGroundedAnswer: body.includeGroundedAnswer !== false,
      limit: typeof body.limit === "number" ? body.limit : 20,
    });
    return NextResponse.json({ data, correlationId: context.correlationId });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});

export const GET = withEngineeringApi("project-intelligence-knowledge", async (context) => {
  try {
    requireProjectIntelligenceRead(context);
    return NextResponse.json({
      data: {
        feature: "knowledge_intelligence",
        ready: true,
        hybrid: true,
        deterministicReasoningPipeline: true,
        duplicateOwnership: false,
        usesPlatformAiRuntime: true,
      },
      correlationId: context.correlationId,
    });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
