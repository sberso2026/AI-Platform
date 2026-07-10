import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { CommerceDomainError } from "@rtb/platform-commerce";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const subscription = await ctx.commerce.subscriptions.getById(ctx.tenantId, id);
    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found", code: "subscription_not_found" },
        { status: 404 }
      );
    }

    const pendingChange = await ctx.commerce.subscriptionChanges.getPendingChange(
      ctx.tenantId,
      id
    );

    return NextResponse.json({ data: { subscription, pendingChange } });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
