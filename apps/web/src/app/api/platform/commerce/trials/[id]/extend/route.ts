import { NextResponse } from "next/server";

import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import { CommerceDomainError, TrialNotEligibleError } from "@rtb/platform-commerce";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDenied = await requireCommerceAdmin(ctx);
  if (adminDenied) return adminDenied;

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const extendDays = body.extendDays ?? body.trialDays ?? 7;
    const subscription = await ctx.commerce.trials.extendTrial(
      ctx.tenantId,
      id,
      extendDays,
      ctx.userId
    );

    return NextResponse.json({ data: subscription });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    if (err instanceof TrialNotEligibleError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
