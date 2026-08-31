import { NextResponse } from "next/server";
import type { AuthContext } from "@/lib/kernel";
import { getAuthContext } from "@/lib/kernel";
import type {
  CommerceAccessPolicy,
  EntitlementDecision,
  EntitlementEvalProfile,
} from "@rtb/platform-commerce";
import { EntitlementDeniedError } from "@rtb/platform-commerce";
import { createCommerceExecutionContext } from "@rtb/platform-commerce/server";
import type { CommerceExecutionContext } from "@rtb/types";

export interface CommerceHandlerContext {
  ctx: AuthContext;
  decision: EntitlementDecision;
  correlationId: string;
  commerce: CommerceExecutionContext;
  securityProfile?: {
    getAuthContextMs: number;
    entitlementMs: number;
    totalMs: number;
    auth?: AuthContext["authProfile"];
    entitlement?: EntitlementEvalProfile;
  };
}

function correlationId(): string {
  return crypto.randomUUID();
}

function denialResponse(
  decision: EntitlementDecision,
  policy: CommerceAccessPolicy,
  status = 403
): NextResponse {
  if (policy.hideResourceExistence) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (decision.decision === "unavailable") {
    return NextResponse.json(
      { error: "Entitlement service unavailable", code: decision.reasonCode },
      { status: 503 }
    );
  }
  if (decision.decision === "error") {
    return NextResponse.json(
      { error: "Entitlement evaluation failed", code: decision.reasonCode },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { error: "Access denied", code: decision.reasonCode },
    { status }
  );
}

export async function enforceCommercePolicy(
  ctx: AuthContext,
  policy: CommerceAccessPolicy
): Promise<EntitlementDecision | NextResponse> {
  const decision = await ctx.commerce.entitlements.check({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    productKey: policy.productKey,
    applicationKey: policy.applicationKey,
    featureKey: policy.featureKey,
    action: policy.action,
    cachePolicy: policy.cachePolicy ?? "allow-short-cache",
  });

  if (policy.workspaceRequired && !ctx.workspaceId) {
    return NextResponse.json({ error: "Workspace required", code: "workspace_required" }, { status: 403 });
  }

  if (!decision.allowed) {
    return denialResponse(decision, policy);
  }

  if (policy.seatRequired && decision.seatRequired && !decision.seatAssigned) {
    return NextResponse.json({ error: "Seat not assigned", code: "seat_not_assigned" }, { status: 403 });
  }

  return decision;
}

export function withCommerceEntitlement(
  policy: CommerceAccessPolicy,
  handler: (context: CommerceHandlerContext, request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    const ctx = await getAuthContext();
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const cid = request.headers.get("x-correlation-id") ?? correlationId();
    const result = await enforceCommercePolicy(ctx, policy);
    if (result instanceof NextResponse) return result;

    const commerce = createCommerceExecutionContext({
      tenantId: ctx.tenantId,
      workspaceId: ctx.workspaceId,
      actorUserId: ctx.userId,
      correlationId: cid,
      decision: result,
      policy,
    });

    try {
      return await handler({ ctx, decision: result, correlationId: cid, commerce }, request);
    } catch (err) {
      if (err instanceof EntitlementDeniedError) {
        return NextResponse.json({ error: err.message, code: err.reasonCode }, { status: 403 });
      }
      throw err;
    }
  };
}

export function hasCommerceAdmin(ctx: AuthContext): boolean {
  return (
    ctx.roleSlug === "owner" ||
    ctx.permissions.some(
      (p) =>
        p.resource === "commerce" &&
        (p.action === "admin" ||
          p.action === "manage_subscriptions" ||
          p.action === "manage_licences" ||
          p.action === "manage_seats")
    )
  );
}

export async function requireCommerceAdmin(ctx: AuthContext): Promise<NextResponse | null> {
  if (!hasCommerceAdmin(ctx)) {
    return NextResponse.json({ error: "Commerce permission denied" }, { status: 403 });
  }
  return null;
}
