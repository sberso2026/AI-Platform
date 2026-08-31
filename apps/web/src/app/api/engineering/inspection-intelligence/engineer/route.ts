import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { handleCommerceDomainError, lifecycleErrorResponse, resolveRequestId } from "@/lib/lifecycle-api";
import { requireInspectionIntelligenceAccess } from "@/lib/inspection-intelligence/access";
import {
  getEngineerCapability,
  prepareEngineerRuntime,
  runInspectionEngineer,
} from "@/lib/inspection-intelligence/ai-inspection-engineer-service";

function mapEngineerError(error: unknown, requestId: string): NextResponse {
  const message = error instanceof Error ? error.message : "engineer_failed";
  if (message.includes("not_found")) {
    return lifecycleErrorResponse("not_found", message, 404, requestId);
  }
  if (message.includes("unauthorized") || message.includes("access_denied") || message.includes("unauthenticated")) {
    return lifecycleErrorResponse("forbidden", message, 403, requestId);
  }
  return handleCommerceDomainError(error, requestId);
}

export const GET = withEngineeringApi("inspection-intelligence-engineer", async (context, request) => {
  const requestId = resolveRequestId(request) ?? context.correlationId;
  try {
    requireInspectionIntelligenceAccess(context);
    const runtime = await prepareEngineerRuntime(context);
    return NextResponse.json({
      data: {
        ...getEngineerCapability(),
        aiOptional: true,
        mutationEnabled: false,
        autonomousApprovalEnabled: false,
        runtime,
      },
      requestId,
    });
  } catch (error) {
    return mapEngineerError(error, requestId);
  }
});

export const POST = withEngineeringApi("inspection-intelligence-engineer", async (context, request) => {
  const requestId = resolveRequestId(request) ?? context.correlationId;
  try {
    requireInspectionIntelligenceAccess(context);
    if (!context.ctx.workspaceId) {
      return lifecycleErrorResponse(
        "workspace_not_assigned",
        "An assigned workspace is required",
        403,
        requestId,
      );
    }
    const body = (await request.json().catch(() => ({}))) as {
      question?: string;
      sessionId?: string;
      reportId?: string;
      targetKind?: string;
      targetCanonicalId?: string;
      projectId?: string;
    };
    const question = typeof body.question === "string" ? body.question.trim() : "";
    if (!question) {
      return lifecycleErrorResponse("engineer_question_required", "question is required", 400, requestId);
    }
    const data = await runInspectionEngineer(context, {
      question,
      sessionId: typeof body.sessionId === "string" ? body.sessionId : undefined,
      reportId: typeof body.reportId === "string" ? body.reportId : undefined,
      targetKind: typeof body.targetKind === "string" ? body.targetKind : undefined,
      targetCanonicalId: typeof body.targetCanonicalId === "string" ? body.targetCanonicalId : undefined,
      projectId: typeof body.projectId === "string" ? body.projectId : undefined,
    });
    return NextResponse.json({ data, requestId });
  } catch (error) {
    return mapEngineerError(error, requestId);
  }
});
