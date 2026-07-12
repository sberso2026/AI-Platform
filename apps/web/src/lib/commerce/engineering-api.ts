import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { getEngineeringApiPolicy } from "@rtb/platform-commerce";
import { createCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { enforceCommercePolicy, type CommerceHandlerContext } from "./with-commerce-entitlement";
import { lifecycleErrorResponse, unauthenticatedResponse } from "@/lib/lifecycle-api";

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
  const body = await response.clone().json().catch(() => ({}));
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

export function withEngineeringApi(
  segment: string,
  handler: (context: CommerceHandlerContext, request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    const guarded = await guardEngineeringApi(segment, request.method);
    if (guarded instanceof NextResponse) return guarded;
    return handler(guarded, request);
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
    const params = await routeContext.params;
    return handler(guarded, request, params);
  };
}
