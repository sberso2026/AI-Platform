import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const includeAi = new URL(request.url).searchParams.get("narrative") === "true";
    const data = await ctx.business.revenueExecution.summary(scope);
    const narrative = includeAi ? await ctx.business.revenueExecution.explain(scope) : null;
    return NextResponse.json({ data: { ...data, narrative } });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.revenue_execution.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const kind = String(body.kind ?? "");
  try {
    if (kind === "engagement") {
      const data = await ctx.business.revenueExecution.upsertEngagement(scope, body as never);
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    if (kind === "draft") {
      const data = await ctx.business.revenueExecution.upsertDraft(scope, body as never);
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    if (kind === "proposal") {
      const data = await ctx.business.revenueExecution.upsertProposal(scope, body as never);
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    if (kind === "requirement") {
      const data = await ctx.business.revenueExecution.upsertRequirement(scope, body as never);
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    if (kind === "pricing") {
      const data = await ctx.business.revenueExecution.upsertPricing(scope, body as never);
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    return NextResponse.json({ error: "kind is required", code: "invalid_input" }, { status: 400 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.revenue_execution.manage");
