import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import { getMinutesVersion } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams<{ meetingId: string; versionId: string }>(
  "project-intelligence-meetings",
  async (context, _request, params) => {
    try {
      requireMeetingsRead(context);
      const data = await getMinutesVersion(context, params.versionId);
      if (String(data.meeting_session_id) !== params.meetingId) {
        return NextResponse.json(
          {
            error: {
              code: "minutes_not_found",
              message: "Minutes version not found for meeting",
              requestId: context.correlationId,
            },
          },
          { status: 404 },
        );
      }
      return NextResponse.json({ data, correlationId: context.correlationId });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
