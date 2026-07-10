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

  try {
    let result;
    if (body.targetPlanId) {
      result = await ctx.commerce.subscriptionChanges.convertTrialToPlan(
        ctx.tenantId,
        id,
        body.targetPlanId,
        ctx.userId
      );
    } else {
      result = await ctx.commerce.trials.convertTrial(ctx.tenantId, id, ctx.userId);
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
