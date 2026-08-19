import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.businessRisk.repository.listObligations(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  try {
    const data = await ctx.business.businessRisk.createObligation(scope, {
      title: typeof body.title === "string" ? body.title : "",
      riskId: typeof body.riskId === "string" ? body.riskId : null,
      sourceRef: typeof body.sourceRef === "string" ? body.sourceRef : null,
      jurisdiction: typeof body.jurisdiction === "string" ? body.jurisdiction : null,
      ownerLabel: typeof body.ownerLabel === "string" ? body.ownerLabel : null,
      dueAt: typeof body.dueAt === "string" ? body.dueAt : null,
      status: typeof body.status === "string" ? (body.status as never) : undefined,
      evidenceRefs: Array.isArray(body.evidenceRefs) ? (body.evidenceRefs as never) : [],
      authorizedConfirmation: Boolean(body.authorizedConfirmation),
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.manage");
