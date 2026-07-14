import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireMeetingsAdmin } from "@/lib/project-intelligence/access";
import { testMicrosoftTeamsProvider } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApi("project-intelligence-meetings", async (context) => {
  try {
    requireMeetingsAdmin(context);
    const data = await testMicrosoftTeamsProvider(context);
    return NextResponse.json({ data, correlationId: context.correlationId });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
