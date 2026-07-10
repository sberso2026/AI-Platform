import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { getEngineeringApiPolicy } from "@rtb/platform-commerce";
import { createCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { enforceCommercePolicy, type CommerceHandlerContext } from "./with-commerce-entitlement";

export type { CommerceHandlerContext };

export async function guardEngineeringApi(
  segment: string,
  method: string
): Promise<CommerceHandlerContext | NextResponse> {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const policy = getEngineeringApiPolicy(segment, method);
  const result = await enforceCommercePolicy(ctx, policy);
  if (result instanceof NextResponse) return result;

  const correlationId = crypto.randomUUID();
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
