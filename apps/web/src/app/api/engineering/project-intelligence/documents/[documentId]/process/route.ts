import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { processDocument } from "@/lib/project-intelligence/documents-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApiParams(
  "project-intelligence-documents",
  async (context, request, { documentId }) => {
    try {
      requireProjectIntelligenceRead(context);
      const body = await request.json().catch(() => ({}));
      return NextResponse.json({ data: await processDocument(context, documentId, body) });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
