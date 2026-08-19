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
    const data = await ctx.business.businessRisk.assess(scope, {
      riskId,
      likelihood: body.likelihood as never,
      impact: body.impact as never,
      assessorLabel: typeof body.assessorLabel === "string" ? body.assessorLabel : null,
      rationale: typeof body.rationale === "string" ? body.rationale : null,
      assumptions: Array.isArray(body.assumptions) ? body.assumptions.map(String) : [],
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.manage");
