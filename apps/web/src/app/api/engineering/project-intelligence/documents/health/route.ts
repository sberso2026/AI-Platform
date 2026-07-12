import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireProjectIntelligenceRead } from "@/lib/project-intelligence/access";
import { getProcessingHealth } from "@/lib/project-intelligence/documents-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("project-intelligence-documents", async (context) => {
  try {
    requireProjectIntelligenceRead(context);
    return NextResponse.json({ data: await getProcessingHealth(context) });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
