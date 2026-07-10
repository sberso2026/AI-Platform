import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import { CommerceDomainError } from "@rtb/platform-commerce";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDenied = await requireCommerceAdmin(ctx);
  if (adminDenied) return adminDenied;

  const body = await request.json().catch(() => ({}));

  if (!body.subscriptionId || !body.productId) {
    return NextResponse.json(
      { error: "subscriptionId and productId required" },
      { status: 422 }
    );
  }

  try {
    const licenses = await ctx.commerce.licences.issueForSubscription({
      tenantId: ctx.tenantId,
      subscriptionId: body.subscriptionId,
      productId: body.productId,
      planId: body.planId,
      workspaceId: body.workspaceId,
      seatLimit: body.seatLimit,
      issuedBy: ctx.userId,
    });

    return NextResponse.json({ data: licenses }, { status: 201 });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
