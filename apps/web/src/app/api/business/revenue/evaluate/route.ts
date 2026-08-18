import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const kind = String(body.kind ?? "pricing");
  try {
    if (kind === "bid") {
      if (!body.opportunityId) {
        return NextResponse.json({ error: "opportunityId is required", code: "invalid_input" }, { status: 400 });
      }
      const persist = body.persist !== false;
      const data = await ctx.business.revenueExecution.evaluateBid(scope, String(body.opportunityId), persist);
      return NextResponse.json({ data });
    }
    const data = await ctx.business.revenueExecution.evaluatePricingPreview(scope, body as never);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.revenue_execution.view");
