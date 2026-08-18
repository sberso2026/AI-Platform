import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const kind = String(body.kind ?? "");
  try {
    if (kind === "proposal") {
      const status = body.status === "rejected" ? "rejected" : "approved";
      const data = await ctx.business.revenueExecution.approveProposal(
        scope,
        String(body.id ?? ""),
        status,
        typeof body.rationale === "string" ? body.rationale : undefined,
      );
      return NextResponse.json({ data });
    }
    if (kind === "bid_request") {
      const data = await ctx.business.revenueExecution.requestBidDecision(scope, String(body.opportunityId ?? ""));
      return NextResponse.json({ data });
    }
    if (kind === "bid_complete") {
      const status = body.status === "rejected" || body.status === "deferred" ? body.status : "approved";
      const data = await ctx.business.revenueExecution.completeBidDecision(
        scope,
        String(body.decisionId ?? ""),
        status,
        typeof body.rationale === "string" ? body.rationale : undefined,
      );
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "kind is required", code: "invalid_input" }, { status: 400 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.revenue_execution.approve");
