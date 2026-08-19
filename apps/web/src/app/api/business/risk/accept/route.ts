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
    const data = await ctx.business.businessRisk.acceptRisk(scope, id, {
      rationale: typeof body.rationale === "string" ? body.rationale : undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.business_risk.approve");
