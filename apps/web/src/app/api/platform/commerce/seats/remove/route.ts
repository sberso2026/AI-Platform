import { NextResponse } from "next/server";
import { emitLifecycleObservation } from "@rtb/platform-commerce";

import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import {
  handleCommerceDomainError,
  lifecycleErrorResponse,
  resolveRequestId,
  unauthenticatedResponse,
  forbiddenResponse,
} from "@/lib/lifecycle-api";

export async function POST(request: Request) {
  const requestId = resolveRequestId(request);
  const ctx = await getAuthContext();
  if (!ctx) return unauthenticatedResponse(requestId);
  const denied = await requireCommerceAdmin(ctx);
  if (denied) {
    return forbiddenResponse(requestId, "Commerce permission denied", "commerce_permission_denied");
  }

  const body = await request.json().catch(() => ({}));
  if (!body.seatPoolId || !body.userId) {
    return lifecycleErrorResponse(
      "validation_error",
      "seatPoolId and userId required",
      422,
      requestId
    );
  }

  try {
    const result = await ctx.commerce.seatAssignment.remove({
      tenantId: ctx.tenantId,
      seatPoolId: body.seatPoolId,
      userId: body.userId,
      removedBy: ctx.userId,
    });
    await emitLifecycleObservation(ctx.commerce.events, {
      eventType: "seat.removed",
      tenantId: ctx.tenantId,
      workspaceId: body.workspaceId,
      actorUserId: ctx.userId,
      actorRole: ctx.roleSlug,
      operation: "seat.remove",
      result: "success",
      correlationId: requestId,
      aggregateType: "seat_assignment",
      aggregateId: String(result?.id ?? body.userId),
      payload: { seatPoolId: body.seatPoolId, userId: body.userId },
    });
    return NextResponse.json({ data: result, requestId });
  } catch (err) {
    return handleCommerceDomainError(err, requestId);
  }
}
