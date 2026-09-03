import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("technical-queries", async ({ ctx, commerce }, request) => {
  const params = new URL(request.url).searchParams;
  const data = await ctx.engineering.technicalQueries.listPresented(commerce, ctx.tenantId, {
    projectId: params.get("projectId") ?? undefined,
    view: params.get("view") ?? undefined,
    query: params.get("q") ?? undefined,
    status: params.get("status") ?? undefined,
    disciplineId: params.get("disciplineId") ?? undefined,
    initiatorId: params.get("initiatorId") ?? undefined,
    actionById: params.get("actionById") ?? undefined,
    classification: params.get("classification") ?? undefined,
    priority: params.get("priority") ?? undefined,
    actorUserId: ctx.userId,
  });
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("technical-queries", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const created = await ctx.engineering.technicalQueries.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    title: body.title ?? body.question,
    question: body.question ?? "",
    description: body.description ?? body.reason,
    requesterId: body.requesterId ?? ctx.userId,
    responderId: body.responderId ?? body.assignedTo,
    assignedTo: body.assignedTo ?? body.responderId,
    documentId: body.documentId,
    responseDue: body.responseDue ?? body.responseDueAt,
    projectId: body.projectId,
    assetId: body.assetId,
    disciplineId: body.disciplineId,
    priority: body.priority,
    dueDate: body.dueDate ?? body.responseDue,
    createdBy: ctx.userId,
    submit: body.submit,
    status: body.status,
    suggestedSolution: body.suggestedSolution,
    classification: body.classification,
    area: body.area,
    system: body.system,
    subsystem: body.subsystem,
    workPackage: body.workPackage,
    contractPackage: body.contractPackage,
    originatingCompany: body.originatingCompany,
    respondingCompany: body.respondingCompany,
    externalReference: body.externalReference,
    reviewerUserId: body.reviewerUserId,
    approverUserId: body.approverUserId,
    watchers: body.watchers,
    requireActionBy: body.requireActionBy === true,
    metadata: body.metadata,
  });
  const presented = created?.id
    ? await ctx.engineering.technicalQueries.getPresented(commerce, ctx.tenantId, created.id as string)
    : null;
  return NextResponse.json({ data: presented ?? created }, { status: 201 });
});

export const PATCH = withEngineeringApi("technical-queries", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id) {
    return NextResponse.json({ error: "id required" }, { status: 422 });
  }
  const action =
    typeof body.action === "string" && body.action
      ? body.action
      : body.response
        ? "submit_response"
        : null;
  if (!action) {
    return NextResponse.json({ error: "id and response required" }, { status: 422 });
  }
  if (action === "submit_response" && !body.response && !body.status) {
    return NextResponse.json({ error: "id and response required" }, { status: 422 });
  }
  const data = await ctx.engineering.technicalQueries.applyAction(commerce, ctx.tenantId, body.id, {
    action,
    actorUserId: ctx.userId,
    actorRole: ctx.roleSlug,
    response: body.response,
    responseBasis: body.responseBasis,
    qualifications: body.qualifications,
    followUpActions: body.followUpActions,
    status: body.status,
    assignedTo: body.assignedTo,
    requesterId: body.requesterId,
    reviewerUserId: body.reviewerUserId,
    approverUserId: body.approverUserId,
    question: body.question,
    title: body.title,
    description: body.description,
    suggestedSolution: body.suggestedSolution,
    responseDue: body.responseDue,
    closeoutComments: body.closeoutComments,
    evidenceComplete: body.evidenceComplete,
    actionsCompleted: body.actionsCompleted,
    referencesRetained: body.referencesRetained,
    comment: body.comment,
    toType: body.toType,
    toId: body.toId,
    relationship: body.relationship,
    metadata: body.metadata,
  });
  return NextResponse.json({ data });
});
