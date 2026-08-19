import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const customerId = new URL(request.url).searchParams.get("customerId") ?? undefined;
  try {
    const facts = await ctx.business.customerIntelligence.repository.listFacts(scope, customerId);
    return NextResponse.json({ data: { facts } });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.customer_intelligence.view");
