import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { CommerceDomainError } from "@rtb/platform-commerce";

export async function GET(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 422 });
  }

  try {
    const result = await ctx.commerce.trials.checkTrialEligibility({
      tenantId: ctx.tenantId,
      productId,
      requestedPlanId: searchParams.get("planId") ?? undefined,
    });
    return NextResponse.json({ data: result });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
