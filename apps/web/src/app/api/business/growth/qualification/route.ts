import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessGrowthQualificationStatus } from "@rtb/types";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const leadId = String(body.leadId ?? "");
  const status = body.status as BusinessGrowthQualificationStatus;
  if (!leadId || !status) {
    return NextResponse.json({ error: "leadId and status are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.growthIntelligence.qualifyLead(scope, leadId, status);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.growth_intelligence.manage");
