import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { compareDocuments } from "@/lib/project-intelligence/documents-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApi("project-intelligence-documents", async (context, request) => {
  try {
    requireProjectIntelligenceRead(context);
    const body = await request.json().catch(() => ({}));
    return NextResponse.json({ data: await compareDocuments(context, body) });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
