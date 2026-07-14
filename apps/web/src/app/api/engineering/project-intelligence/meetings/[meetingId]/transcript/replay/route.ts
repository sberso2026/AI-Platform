import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import { replayTranscript } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams<{ meetingId: string }>(
  "project-intelligence-meetings",
  async (context, request, params) => {
    try {
      requireMeetingsRead(context);
      const url = new URL(request.url);
      const data = await replayTranscript(context, params.meetingId, {
        cursor: url.searchParams.get("cursor"),
        resumeToken: url.searchParams.get("resumeToken"),
      });
      return NextResponse.json({ data, correlationId: context.correlationId });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
