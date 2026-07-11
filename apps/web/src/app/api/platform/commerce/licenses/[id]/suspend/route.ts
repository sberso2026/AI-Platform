import { NextResponse } from "next/server";
import { emitLifecycleObservation } from "@rtb/platform-commerce";

import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import {
  handleCommerceDomainError,
  resolveRequestId,
  unauthenticatedResponse,
  forbiddenResponse,
} from "@/lib/lifecycle-api";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const requestId = resolveRequestId(request);
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  const denied = await requireCommerceAdmin(ctx);
  if (denied) {
    return forbiddenResponse(requestId, "Commerce permission denied", "commerce_permission_denied");
  }

  const { id } = await params;
  try {
    const result = await ctx.commerce.licences.suspend(ctx.tenantId, id, ctx.userId);
    await emitLifecycleObservation(ctx.commerce.events, {
      eventType: "licence.suspended",
      tenantId: ctx.tenantId,
      actorUserId: ctx.userId,
      actorRole: ctx.roleSlug,
      operation: "licence.suspend",
      result: "success",
      correlationId: requestId,
      aggregateType: "licence",
      aggregateId: id,
    });
    return NextResponse.json({ data: result, requestId });
  } catch (err) {
    return handleCommerceDomainError(err, requestId);
  }
}
