import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import { CommerceDomainError } from "@rtb/platform-commerce";

type Params = { params: Promise<{ id: string; action: string }> };

export async function POST(request: Request, { params }: Params) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return denied;

  const { id, action } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const lifecycle = ctx.commerce.lifecycle;
    let result;

    switch (action) {
      case "activate":
        result = await lifecycle.activate(ctx.tenantId, id, ctx.userId);
        break;
      case "pause":
        result = await lifecycle.pause(ctx.tenantId, id, ctx.userId, body.reason);
        break;
      case "resume":
        result = await lifecycle.resume(ctx.tenantId, id, ctx.userId);
        break;
      case "suspend":
        result = await lifecycle.suspend(ctx.tenantId, id, ctx.userId, body.reason);
        break;
      case "schedule-cancellation":
        result = await lifecycle.scheduleCancellation(
          ctx.tenantId,
          id,
          ctx.userId,
          body.effectiveAt
        );
        break;
      case "cancel":
        result = await lifecycle.cancel(ctx.tenantId, id, ctx.userId, body.reason);
        break;
      case "renew":
        result = await lifecycle.renew(ctx.tenantId, id, ctx.userId);
        break;
      case "reverse-cancellation":
        result = await lifecycle.resume(ctx.tenantId, id, ctx.userId);
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
