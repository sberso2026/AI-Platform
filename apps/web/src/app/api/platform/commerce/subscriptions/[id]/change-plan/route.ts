import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import { CommerceDomainError } from "@rtb/platform-commerce";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDenied = await requireCommerceAdmin(ctx);
  if (adminDenied) return adminDenied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  if (!body.targetPlanId) {
    return NextResponse.json({ error: "targetPlanId required" }, { status: 422 });
  }

  try {
    const input = {
      tenantId: ctx.tenantId,
      subscriptionId: id,
      targetPlanId: body.targetPlanId,
      effectiveAt: body.effectiveAt,
      requestedBy: ctx.userId,
      reason: body.reason,
      immediate: body.immediate,
    };

    let result;
    if (body.changeType === "upgrade") {
      result = await ctx.commerce.subscriptionChanges.requestUpgrade(input);
    } else if (body.changeType === "downgrade") {
      result = await ctx.commerce.subscriptionChanges.requestDowngrade(input);
    } else {
      return NextResponse.json({ error: "Invalid changeType" }, { status: 422 });
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
