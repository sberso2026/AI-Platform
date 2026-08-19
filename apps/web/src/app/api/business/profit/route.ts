import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessProfitFactIngestInput } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const includeAi = new URL(request.url).searchParams.get("narrative") === "true";
    const data = await ctx.business.profitIntelligence.summary(scope);
    const narrative = includeAi ? await ctx.business.profitIntelligence.explain(scope) : null;
    return NextResponse.json({ data: { ...data, narrative } });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.profit_intelligence.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  if (!body.periodStart || !body.periodEnd || !body.currency || !body.sourceType || !body.dimensionType || !body.dimensionName) {
    return NextResponse.json(
      {
        error: "periodStart, periodEnd, currency, sourceType, dimensionType and dimensionName are required",
        code: "invalid_input",
      },
      { status: 400 },
    );
  }
  try {
    const data = await ctx.business.profitIntelligence.ingestFact(
      scope,
      body as unknown as BusinessProfitFactIngestInput,
    );
    return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.profit_intelligence.manage");
