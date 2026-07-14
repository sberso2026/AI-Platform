import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import { generateMinutes } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApiParams<{ meetingId: string }>(
  "project-intelligence-meetings",
  async (context, request, params) => {
    try {
      requireMeetingsRead(context);
      const body = await request.json().catch(() => ({}));
      const data = await generateMinutes(context, params.meetingId, body);
      return NextResponse.json(
        { data, correlationId: context.correlationId },
        { status: 201 },
      );
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
