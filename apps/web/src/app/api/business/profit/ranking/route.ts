import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope } from "@/lib/business/owner-command-http";
import type { BusinessProfitDimensionType } from "@rtb/types";
import { BUSINESS_PROFIT_DIMENSION_TYPES } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const params = new URL(request.url).searchParams;
    const dimension = params.get("dimension");
    const by = params.get("by");
    const dimensionType =
      dimension && BUSINESS_PROFIT_DIMENSION_TYPES.includes(dimension as BusinessProfitDimensionType)
        ? (dimension as BusinessProfitDimensionType)
        : undefined;
    const rankBy = by === "margin" || by === "revenue" || by === "contribution" ? by : "contribution";
    const data = await ctx.business.profitIntelligence.ranking(scope, { dimensionType, by: rankBy });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.profit_intelligence.view");
