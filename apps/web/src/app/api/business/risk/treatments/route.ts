import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const riskId = typeof body.riskId === "string" ? body.riskId : "";
  if (!riskId) return NextResponse.json({ error: "riskId is required", code: "invalid_input" }, { status: 400 });
  try {
    const data = await ctx.business.businessRisk.createTreatment(scope, {
      riskId,
      strategy: body.strategy as never,
      decisionId: typeof body.decisionId === "string" ? body.decisionId : null,
      expectedResidualLevel: typeof body.expectedResidualLevel === "string" ? (body.expectedResidualLevel as never) : null,
      notes: typeof body.notes === "string" ? body.notes : null,
      actionId: typeof body.actionId === "string" ? body.actionId : null,
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.manage");
