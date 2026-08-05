import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { decideReview } from "@/lib/project-intelligence/documents-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";
import type { DocumentReviewAction } from "@rtb/project-intelligence/server";

export const POST = withEngineeringApiParams(
  "project-intelligence-documents",
  async (context, request, { reviewId }) => {
    try {
      requireProjectIntelligenceRead(context);
      const body = (await request.json().catch(() => ({}))) as {
        action?: DocumentReviewAction;
        reasonCode?: string;
        comment?: string;
        assignedToUserId?: string;
        evidenceIds?: string[];
      };
      if (!body.action) {
        return NextResponse.json(
          {
            error: {
              code: "document_insufficient_evidence",
              message: "action is required",
              requestId: context.correlationId,
              details: {},
            },
          },
          { status: 400 },
        );
      }
      return NextResponse.json({
        data: await decideReview(context, reviewId, {
          action: body.action,
          reasonCode: body.reasonCode,
          comment: body.comment,
          assignedToUserId: body.assignedToUserId,
          evidenceIds: body.evidenceIds,
        }),
      });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
