import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { getDocumentChunks } from "@/lib/project-intelligence/documents-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams(
  "project-intelligence-documents",
  async (context, _request, { documentId }) => {
    try {
      requireProjectIntelligenceRead(context);
      return NextResponse.json({ data: await getDocumentChunks(context, documentId) });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
