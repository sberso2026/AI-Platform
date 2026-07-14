import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import { submitMinutesReview } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApiParams<{ meetingId: string; minutesId: string }>(
  "project-intelligence-meetings",
  async (context, _request, params) => {
    try {
      requireMeetingsRead(context);
      const data = await submitMinutesReview(context, params.minutesId);
      return NextResponse.json({ data, correlationId: context.correlationId });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
