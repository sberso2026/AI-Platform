import { NextResponse } from "next/server";
import { getAuthContext, type AuthContext } from "@/lib/kernel";
import { isReadOnlyEngineeringRole } from "@/lib/commerce/canonical-access";
import {
  forbiddenResponse,
  lifecycleErrorResponse,
  unauthenticatedResponse,
} from "@/lib/lifecycle-api";
import { EngineeringReviewError } from "@rtb/engineering-review";

export type ReviewHandlerContext = {
  ctx: AuthContext;
  actor: {
    userId: string;
    tenantId: string;
    workspaceId: string;
  };
  requestId: string;
};

export async function guardReviewApi(method: string): Promise<ReviewHandlerContext | NextResponse> {
  const requestId = crypto.randomUUID();
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  if (!ctx.workspaceId) {
    return lifecycleErrorResponse(
      "workspace_required",
      "A workspace membership is required for Engineering Review",
      403,
      requestId,
    );
  }
  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  if (mutating && isReadOnlyEngineeringRole(ctx.roleSlug)) {
    return forbiddenResponse(requestId, "Read-only role cannot mutate review records", "read_only");
  }
  return {
    ctx,
    actor: {
      userId: ctx.userId,
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
    },
    requestId,
  };
}

export function reviewErrorResponse(err: unknown, requestId: string): NextResponse {
  if (err instanceof EngineeringReviewError) {
    const status =
      err.code === "unauthenticated"
        ? 401
        : err.code === "project_unauthorized" ||
            err.code === "document_unauthorized" ||
            err.code === "cross_workspace_rejected" ||
            err.code === "cross_tenant_rejected" ||
            err.code === "ai_cannot_dispose" ||
            err.code === "read_only"
          ? 403
          : err.code === "package_not_found" || err.code === "finding_not_found"
            ? 404
            : 400;
    return lifecycleErrorResponse(err.code, err.message, status, requestId, err.details);
  }
  const message = err instanceof Error ? err.message : "Review request failed";
  return lifecycleErrorResponse("review_failed", message, 500, requestId);
}

export function withReviewApi(
  handler: (context: ReviewHandlerContext, request: Request) => Promise<NextResponse>,
) {
  return async (request: Request): Promise<NextResponse> => {
    const guarded = await guardReviewApi(request.method);
    if (guarded instanceof NextResponse) return guarded;
    try {
      return await handler(guarded, request);
    } catch (err) {
      return reviewErrorResponse(err, guarded.requestId);
    }
  };
}

export function withReviewApiParams<T extends Record<string, string>>(
  handler: (context: ReviewHandlerContext, request: Request, params: T) => Promise<NextResponse>,
) {
  return async (request: Request, routeContext: { params: Promise<T> }): Promise<NextResponse> => {
    const guarded = await guardReviewApi(request.method);
    if (guarded instanceof NextResponse) return guarded;
    try {
      const params = await routeContext.params;
      return await handler(guarded, request, params);
    } catch (err) {
      return reviewErrorResponse(err, guarded.requestId);
    }
  };
}
