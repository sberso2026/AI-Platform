import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const kind = String(body.kind ?? "research");
  const opportunityId = String(body.opportunityId ?? "");
  if (!opportunityId) {
    return NextResponse.json({ error: "opportunityId is required", code: "invalid_input" }, { status: 400 });
  }
  if (!["research", "engagement", "draft", "proposal", "missing"].includes(kind)) {
    return NextResponse.json({ error: "invalid prepare kind", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.revenueExecution.prepare(
      scope,
      kind as "research" | "engagement" | "draft" | "proposal" | "missing",
      opportunityId,
    );
    return NextResponse.json({ data, agentAuthorityMax: "A2" });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.revenue_execution.manage");
