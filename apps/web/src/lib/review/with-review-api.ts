import { NextResponse } from "next/server";
import { getAuthContext, type AuthContext } from "@/lib/kernel";
import { isReadOnlyEngineeringRole } from "@/lib/commerce/canonical-access";
import {
  forbiddenResponse,
  lifecycleErrorResponse,
  unauthenticatedResponse,
} from "@/lib/lifecycle-api";
import {
  EngineeringReviewError,
  evaluateReviewIdentityPolicy,
  InMemoryReviewSecuritySink,
  resolveReviewIdentityPolicy,
  type ReviewIdentityClaims,
} from "@rtb/engineering-review";

const security = new InMemoryReviewSecuritySink();

export function reviewSecurityEvents() {
  return security;
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const part = token.split(".")[1];
    if (!part) return {};
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
    const json = Buffer.from(padded, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function reviewIdentityClaims(ctx: AuthContext): Promise<ReviewIdentityClaims> {
  const { data } = await ctx.supabase.auth.getSession();
  const payload = data.session?.access_token ? decodeJwtPayload(data.session.access_token) : {};
  return {
    aal: typeof payload.aal === "string" ? payload.aal : null,
    amr: Array.isArray(payload.amr) ? (payload.amr as Array<string | { method?: string }>) : null,
    appMetadata: (ctx as AuthContext & { supabase: AuthContext["supabase"] }).supabase
      ? ((await ctx.supabase.auth.getUser()).data.user?.app_metadata as Record<string, unknown> | undefined) ?? null
      : null,
  };
}

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
  if (!ctx) {
    security.record({
      name: "review.authn_failed",
      at: new Date().toISOString(),
      requestId,
      code: "unauthenticated",
    });
    return unauthenticatedResponse(requestId);
  }
  if (!ctx.workspaceId) {
    security.record({
      name: "review.authz_failed",
      at: new Date().toISOString(),
      actorId: ctx.userId,
      tenantId: ctx.tenantId,
      requestId,
      code: "workspace_required",
    });
    return lifecycleErrorResponse(
      "workspace_required",
      "A workspace membership is required for Engineering Review",
      403,
      requestId,
    );
  }

  const { data: tenant } = await ctx.supabase.from("tenants").select("settings").eq("id", ctx.tenantId).maybeSingle();
  const policy = resolveReviewIdentityPolicy((tenant?.settings as Record<string, unknown> | null) ?? {});
  const claims = await reviewIdentityClaims(ctx);
  const identity = evaluateReviewIdentityPolicy(policy, claims);
  if (!identity.allowed) {
    security.record({
      name: "review.identity_assurance_failed",
      at: new Date().toISOString(),
      actorId: ctx.userId,
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      requestId,
      code: identity.reason,
    });
    return lifecycleErrorResponse(
      "identity_assurance_insufficient",
      "Authentication succeeded but Review identity policy was not met",
      403,
      requestId,
      { reason: identity.reason },
    );
  }

  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  if (mutating && isReadOnlyEngineeringRole(ctx.roleSlug)) {
    security.record({
      name: "review.authz_failed",
      at: new Date().toISOString(),
      actorId: ctx.userId,
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      requestId,
      code: "read_only",
    });
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
    if (err.code === "cross_workspace_rejected") {
      security.record({
        name: "review.cross_workspace_attempt",
        at: new Date().toISOString(),
        requestId,
        code: err.code,
      });
    }
    if (err.code === "cross_tenant_rejected") {
      security.record({
        name: "review.cross_tenant_attempt",
        at: new Date().toISOString(),
        requestId,
        code: err.code,
      });
    }
    const status =
      err.code === "unauthenticated"
        ? 401
        : err.code === "project_unauthorized" ||
            err.code === "document_unauthorized" ||
            err.code === "cross_workspace_rejected" ||
            err.code === "cross_tenant_rejected" ||
            err.code === "ai_cannot_dispose" ||
            err.code === "read_only" ||
            err.code === "identity_assurance_insufficient" ||
            err.code === "external_upload_disabled"
          ? 403
          : err.code === "package_not_found" || err.code === "finding_not_found"
            ? 404
            : 400;
    return lifecycleErrorResponse(err.code, err.message, status, requestId, err.details);
  }
  const message = err instanceof Error ? err.message : "Review request failed";
  security.record({
    name: "review.execution_failed",
    at: new Date().toISOString(),
    requestId,
    code: "review_failed",
  });
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
