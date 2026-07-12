import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { rejectReview } from "@/lib/project-intelligence/documents-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApiParams(
  "project-intelligence-documents",
  async (context, _request, { reviewId }) => {
    try {
      requireProjectIntelligenceRead(context);
      return NextResponse.json({ data: await rejectReview(context, reviewId) });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
