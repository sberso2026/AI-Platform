import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import { meetingsHealthPayload } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("project-intelligence-meetings", async (context) => {
  try {
    requireMeetingsRead(context);
    return NextResponse.json({
      data: meetingsHealthPayload(),
      correlationId: context.correlationId,
    });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
