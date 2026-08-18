import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const proposalId = new URL(request.url).searchParams.get("proposalId") ?? undefined;
    const data = await ctx.business.revenueExecution.repository.listRequirements(scope, proposalId);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.revenue_execution.view");
