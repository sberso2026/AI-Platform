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
  const productId = body.productId ?? "c1000000-0000-4000-8000-000000000001";
  const subscriptions = await ctx.commerce.subscriptions.listByTenant(ctx.tenantId);
  const subscription =
    subscriptions.find((s) => s.id === body.subscriptionId) ??
    subscriptions.find((s) => s.product_id === productId && s.status === "active") ??
    subscriptions.find((s) => s.product_id === productId);

  if (!subscription) {
    return NextResponse.json(
      { error: "No Engineering OS subscription found to reconcile" },
      { status: 422 },
    );
  }

  try {
    const result = await ctx.commerce.licences.reconcilePilotProfile({
      tenantId: ctx.tenantId,
      productId,
      subscriptionId: subscription.id,
      issuedBy: ctx.userId,
    });
    return NextResponse.json({
      data: {
        profile: "engineering-os-pilot",
        subscriptionId: subscription.id,
        issued: result.issued,
        skipped: result.skipped,
      },
    });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
