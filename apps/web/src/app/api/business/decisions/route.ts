import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import { BUSINESS_DECISION_STATUSES, type BusinessDecisionStatus } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.ownerCommand.repository.listDecisions(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const statement = typeof body.statement === "string" ? body.statement.trim() : "";
  if (!statement) {
    return NextResponse.json({ error: "statement is required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.ownerCommand.createDecision(scope, {
      statement,
      context: typeof body.context === "string" ? body.context : undefined,
      recommendationId: typeof body.recommendationId === "string" ? body.recommendationId : undefined,
      reviewAt: typeof body.reviewAt === "string" ? body.reviewAt : undefined,
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.manage");

export const PATCH = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const id = typeof body.id === "string" ? body.id : "";
  const status = body.status as BusinessDecisionStatus;
  if (!id || !BUSINESS_DECISION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "id and valid status are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.ownerCommand.updateDecision(scope, id, {
      status,
      decision:
        body.decision === "approve" ||
        body.decision === "reject" ||
        body.decision === "defer" ||
        body.decision === "close"
          ? body.decision
          : undefined,
      rationale: typeof body.rationale === "string" ? body.rationale : undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.manage");
