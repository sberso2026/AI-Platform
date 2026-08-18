import { NextResponse } from "next/server";
import { withBusinessApi } from "@/lib/commerce/business-api";
import { ownerCommandError, ownerCommandScope, readJsonBody } from "@/lib/business/owner-command-http";
import { BUSINESS_ACTION_STATUSES, type BusinessActionStatus } from "@rtb/types";

export const GET = withBusinessApi(async ({ ctx }) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  try {
    const data = await ctx.business.ownerCommand.repository.listActions(scope);
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.view");

export const POST = withBusinessApi(async ({ ctx }, request) => {
  const scope = ownerCommandScope(ctx);
  if (scope instanceof NextResponse) return scope;
  const body = await readJsonBody(request);
  const title = typeof body.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "title is required", code: "invalid_input" }, { status: 400 });
  }
  const priority =
    body.priority === "low" || body.priority === "high" || body.priority === "critical"
      ? body.priority
      : "medium";
  try {
    const data = await ctx.business.ownerCommand.createAction(scope, {
      title,
      decisionId: typeof body.decisionId === "string" ? body.decisionId : undefined,
      dueDate: typeof body.dueDate === "string" ? body.dueDate : undefined,
      priority,
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
  const status = body.status as BusinessActionStatus;
  if (!id || !BUSINESS_ACTION_STATUSES.includes(status)) {
    return NextResponse.json({ error: "id and valid status are required", code: "invalid_input" }, { status: 400 });
  }
  try {
    const data = await ctx.business.ownerCommand.updateAction(scope, id, {
      status,
      completionEvidence:
        body.completionEvidence && typeof body.completionEvidence === "object"
          ? (body.completionEvidence as Record<string, unknown>)
          : undefined,
    });
    return NextResponse.json({ data });
  } catch (error) {
    return ownerCommandError(error);
  }
}, "business_os.owner_command.manage");
