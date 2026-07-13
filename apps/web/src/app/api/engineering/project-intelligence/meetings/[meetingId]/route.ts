import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import { getMeeting, updateDraftMeeting } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams<{ meetingId: string }>(
  "project-intelligence-meetings",
  async (context, _request, params) => {
    try {
      requireMeetingsRead(context);
      const data = await getMeeting(context, params.meetingId);
      return NextResponse.json({ data, correlationId: context.correlationId });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);

export const PATCH = withEngineeringApiParams<{ meetingId: string }>(
  "project-intelligence-meetings",
  async (context, request, params) => {
    try {
      requireMeetingsRead(context);
      const body = await request.json().catch(() => ({}));
      const data = await updateDraftMeeting(context, params.meetingId, body);
      return NextResponse.json({ data, correlationId: context.correlationId });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
