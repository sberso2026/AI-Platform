import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import type {
  BusinessCustomerContactIngestInput,
  BusinessCustomerFactIngestInput,
  BusinessCustomerIngestInput,
} from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const includeAi = new URL(request.url).searchParams.get("narrative") === "true";
    const data = await ctx.business.customerIntelligence.summary(scope);
    const narrative = includeAi ? await ctx.business.customerIntelligence.explain(scope) : null;
    return NextResponse.json({ data: { ...data, narrative } });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.customer_intelligence.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const kind = String(body.kind ?? "customer");
  try {
    if (kind === "contact") {
      if (!body.customerId || !body.name || !body.sourceType) {
        return NextResponse.json(
          { error: "customerId, name and sourceType are required", code: "invalid_input" },
          { status: 400 },
        );
      }
      const data = await ctx.business.customerIntelligence.ingestContact(
        scope,
        body as unknown as BusinessCustomerContactIngestInput,
      );
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    if (kind === "fact") {
      if (!body.customerId || !body.currency || !body.sourceType || !body.periodStart || !body.periodEnd) {
        return NextResponse.json(
          { error: "customerId, period, currency and sourceType are required", code: "invalid_input" },
          { status: 400 },
        );
      }
      const data = await ctx.business.customerIntelligence.ingestFact(
        scope,
        body as unknown as BusinessCustomerFactIngestInput,
      );
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    if (!body.organisationName || !body.sourceType) {
      return NextResponse.json(
        { error: "organisationName and sourceType are required", code: "invalid_input" },
        { status: 400 },
      );
    }
    const data = await ctx.business.customerIntelligence.ingestCustomer(
      scope,
      body as unknown as BusinessCustomerIngestInput,
    );
    return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.customer_intelligence.manage");
