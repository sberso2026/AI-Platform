import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type { BusinessGrowthLeadIngestInput, BusinessGrowthOpportunityIngestInput } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const includeAi = new URL(request.url).searchParams.get("narrative") === "true";
    const data = await ctx.business.growthIntelligence.summary(scope);
    const narrative = includeAi ? await ctx.business.growthIntelligence.explain(scope) : null;
    return NextResponse.json({ data: { ...data, narrative } });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.growth_intelligence.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const kind = String(body.kind ?? "lead");
  try {
    if (kind === "opportunity") {
      if (!body.name || !body.currency || !body.sourceType) {
        return NextResponse.json(
          { error: "name, currency and sourceType are required", code: "invalid_input" },
          { status: 400 },
        );
      }
      const data = await ctx.business.growthIntelligence.ingestOpportunity(
        scope,
        body as unknown as BusinessGrowthOpportunityIngestInput,
      );
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    if (kind === "market") {
      if (!body.segmentName || !body.sourceType) {
        return NextResponse.json(
          { error: "segmentName and sourceType are required", code: "invalid_input" },
          { status: 400 },
        );
      }
      const data = await ctx.business.growthIntelligence.ingestMarket(scope, body as never);
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    if (!body.organisationName || !body.sourceType) {
      return NextResponse.json(
        { error: "organisationName and sourceType are required", code: "invalid_input" },
        { status: 400 },
      );
    }
    const data = await ctx.business.growthIntelligence.ingestLead(
      scope,
      body as unknown as BusinessGrowthLeadIngestInput,
    );
    return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.growth_intelligence.manage");
