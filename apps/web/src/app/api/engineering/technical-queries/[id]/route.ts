import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { metadataRecord } from "@rtb/engineering-os";

export const PATCH = withEngineeringApiParams(
  "technical-queries",
  async ({ ctx, commerce }, request, { id }) => {
    const body = await request.json();
    const action =
      typeof body.action === "string" && body.action
        ? body.action
        : body.response
          ? "submit_response"
          : null;
    if (!action) {
      return NextResponse.json({ error: "action required" }, { status: 422 });
    }
    const data = await ctx.engineering.technicalQueries.applyAction(commerce, ctx.tenantId, id, {
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
  },
);

export const GET = withEngineeringApiParams(
  "technical-queries",
  async ({ ctx, commerce }, _request, { id }) => {
    const data = await ctx.engineering.technicalQueries.getPresented(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const query = data.query as Record<string, unknown>;
    const metadata = metadataRecord(query.metadata);
    const privileged = ctx.roleSlug === "owner" || ctx.roleSlug === "admin" || ctx.roleSlug === "operator";
    const isInitiator = query.requester_id === ctx.userId || query.created_by === ctx.userId;
    const isActionBy = query.assigned_to === ctx.userId || query.responder_id === ctx.userId;
    const isReviewer = metadata.reviewer_user_id === ctx.userId || metadata.approver_user_id === ctx.userId;
    return NextResponse.json({
      data: {
        ...data,
        capabilities: {
          canRespond: privileged || isActionBy,
          canReview: privileged || isInitiator || isReviewer,
          canEditDraft: privileged || isInitiator,
          canAssign: privileged || isInitiator,
          isInitiator,
          isActionBy,
        },
      },
    });
  },
);
