import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const id = typeof body.id === "string" ? body.id : "";
  if (!id) return NextResponse.json({ error: "id is required", code: "invalid_input" }, { status: 400 });
  try {
    const data = await ctx.business.businessRisk.openMaterialRiskDecision(scope, id);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.manage");
