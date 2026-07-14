import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import { mapMicrosoftTeamsMeeting } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApiParams<{ meetingId: string }>(
  "project-intelligence-meetings",
  async (context, request, params) => {
    try {
      requireMeetingsRead(context);
      const body = await request.json().catch(() => ({}));
      const data = await mapMicrosoftTeamsMeeting(context, params.meetingId, {
        teamsJoinUrl: typeof body.teamsJoinUrl === "string" ? body.teamsJoinUrl : undefined,
        providerMeetingId:
          typeof body.providerMeetingId === "string" ? body.providerMeetingId : undefined,
      });
      return NextResponse.json({ data, correlationId: context.correlationId });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
