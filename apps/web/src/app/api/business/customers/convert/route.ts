import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const entityType = String(body.entityType ?? "");
  try {
    if (entityType === "lead") {
      const data = await ctx.business.customerIntelligence.convertFromLead(scope, {
        leadId: body.leadId ? String(body.leadId) : undefined,
        sourceRef: body.sourceRef ? String(body.sourceRef) : undefined,
        customerId: body.customerId ? String(body.customerId) : undefined,
      });
      return NextResponse.json({ data }, { status: data.created || data.converted ? 201 : 200 });
    }
    if (entityType === "opportunity") {
      const data = await ctx.business.customerIntelligence.convertFromOpportunity(scope, {
        opportunityId: body.opportunityId ? String(body.opportunityId) : undefined,
        sourceRef: body.sourceRef ? String(body.sourceRef) : undefined,
        customerId: body.customerId ? String(body.customerId) : undefined,
        organisationName: body.organisationName ? String(body.organisationName) : undefined,
        domain: body.domain ? String(body.domain) : undefined,
      });
      return NextResponse.json({ data }, { status: data.created || data.converted ? 201 : 200 });
    }
    if (entityType === "link") {
      const data = await ctx.business.customerIntelligence.linkEntity(scope, {
        customerId: String(body.customerId ?? ""),
        entityType: body.linkEntityType === "lead" ? "lead" : "opportunity",
        entityId: String(body.entityId ?? ""),
        sourceType: body.sourceType ? String(body.sourceType) : undefined,
        sourceRef: body.sourceRef ? String(body.sourceRef) : undefined,
      });
      return NextResponse.json({ data }, { status: data.created ? 201 : 200 });
    }
    return NextResponse.json({ error: "entityType must be lead, opportunity, or link", code: "invalid_input" }, { status: 400 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.customer_intelligence.manage");
