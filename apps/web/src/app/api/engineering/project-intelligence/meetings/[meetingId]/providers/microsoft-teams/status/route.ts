import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import { getMicrosoftTeamsMeetingStatus } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams<{ meetingId: string }>(
  "project-intelligence-meetings",
  async (context, _request, params) => {
    try {
      requireMeetingsRead(context);
      const data = await getMicrosoftTeamsMeetingStatus(context, params.meetingId);
      return NextResponse.json({ data, correlationId: context.correlationId });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
