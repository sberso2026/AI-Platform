import { NextResponse } from "next/server";
import { getAuthContext, type AuthContext } from "@/lib/kernel";
import { getEngineeringApiPolicy } from "@rtb/platform-commerce";
import { createCommerceExecutionContext } from "@rtb/platform-commerce/server";
import type { CommerceExecutionContext } from "@rtb/types";
import { enforceCommercePolicy, type CommerceHandlerContext } from "./with-commerce-entitlement";
import {
  forbiddenResponse,
  handleCommerceDomainError,
  lifecycleErrorResponse,
  unauthenticatedResponse,
} from "@/lib/lifecycle-api";
import { isReadOnlyEngineeringRole } from "@/lib/commerce/canonical-access";

export type { CommerceHandlerContext };

const PI_NOT_INSTALLED_REASONS = new Set([
  "application_not_in_plan",
  "application_not_installed",
  "installation_not_active",
  "installation_not_found",
]);
const PI_LICENCE_SUSPENDED_REASONS = new Set([
  "licence_expired",
  "licence_revoked",
  "licence_missing",
  "licence_not_found",
]);
const PI_WORKSPACE_REASONS = new Set([
  "workspace_required",
  "workspace_not_assigned",
  "workspace_not_entitled",
]);

function projectIntelligenceEntitlementCode(reasonCode: string): string {
  if (PI_NOT_INSTALLED_REASONS.has(reasonCode)) return "project_intelligence_not_installed";
  if (PI_LICENCE_SUSPENDED_REASONS.has(reasonCode)) return "licence_suspended";
  if (reasonCode === "seat_not_assigned") return "seat_not_assigned";
  if (PI_WORKSPACE_REASONS.has(reasonCode)) return "workspace_not_assigned";
  return "project_intelligence_access_denied";
}

async function projectIntelligenceGuardError(response: NextResponse, requestId: string): Promise<NextResponse> {
  const text = await response.clone().text().catch(() => "");
  let body: Record<string, unknown> = {};
  if (text.trim()) {
    try {
      body = JSON.parse(text) as Record<string, unknown>;
    } catch {
      body = {};
    }
  }
  const reasonCode = typeof body?.code === "string" ? body.code : "entitlement_denied";
  return lifecycleErrorResponse(
    projectIntelligenceEntitlementCode(reasonCode),
    typeof body?.error === "string" ? body.error : "Project Intelligence access denied",
    response.status,
    requestId,
    { reasonCode },
  );
}

export async function guardEngineeringApi(
  segment: string,
  method: string
): Promise<CommerceHandlerContext | NextResponse> {
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(crypto.randomUUID());

  const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  if (mutating && isReadOnlyEngineeringRole(ctx.roleSlug)) {
    return forbiddenResponse(
      crypto.randomUUID(),
      "Read-only role cannot mutate engineering records",
      "read_only",
    );
  }

  const policy = getEngineeringApiPolicy(segment, method);
  const result = await enforceCommercePolicy(ctx, policy);
  const correlationId = crypto.randomUUID();
  if (result instanceof NextResponse) {
    return segment.startsWith("project-intelligence")
      ? projectIntelligenceGuardError(result, correlationId)
      : result;
  }
  const commerce = createCommerceExecutionContext({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    actorUserId: ctx.userId,
    correlationId,
    decision: result,
    policy,
  });

  return {
    ctx,
    decision: result,
    correlationId,
    commerce,
  };
}

/** Authorize a distinct engineering API segment with its own commerce action. */
export async function authorizeEngineeringSegment(
  ctx: AuthContext,
  segment: string,
  method: string,
  correlationId: string,
): Promise<CommerceExecutionContext | null> {
  const policy = getEngineeringApiPolicy(segment, method);
  const result = await enforceCommercePolicy(ctx, policy);
  if (result instanceof NextResponse) return null;
  return createCommerceExecutionContext({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    actorUserId: ctx.userId,
    correlationId,
    decision: result,
    policy,
  });
}

export function withEngineeringApi(
  segment: string,
  handler: (context: CommerceHandlerContext, request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    const guarded = await guardEngineeringApi(segment, request.method);
    if (guarded instanceof NextResponse) return guarded;
    try {
      return await handler(guarded, request);
    } catch (err) {
      // Always return a JSON lifecycle/commerce error — never an empty non-JSON body.
      return handleCommerceDomainError(err, guarded.correlationId);
    }
  };
}

export function withEngineeringApiParams<T extends Record<string, string>>(
  segment: string,
  handler: (
    context: CommerceHandlerContext,
    request: Request,
    params: T
  ) => Promise<NextResponse>
) {
  return async (
    request: Request,
    routeContext: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const guarded = await guardEngineeringApi(segment, request.method);
    if (guarded instanceof NextResponse) return guarded;
    try {
      const params = await routeContext.params;
      return await handler(guarded, request, params);
    } catch (err) {
      return handleCommerceDomainError(err, guarded.correlationId);
    }
  };
}
