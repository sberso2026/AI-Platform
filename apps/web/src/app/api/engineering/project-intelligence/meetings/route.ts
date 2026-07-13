import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import {
  createDraftMeeting,
  listMeetings,
} from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("project-intelligence-meetings", async (context) => {
  try {
    requireMeetingsRead(context);
    const data = await listMeetings(context);
    return NextResponse.json({ data, correlationId: context.correlationId });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});

export const POST = withEngineeringApi("project-intelligence-meetings", async (context, request) => {
  try {
    requireMeetingsRead(context);
    const body = await request.json().catch(() => ({}));
    const data = await createDraftMeeting(context, body);
    return NextResponse.json({ data, correlationId: context.correlationId }, { status: 201 });
  } catch (error) {
    return handleCommerceDomainError(error, context.correlationId);
  }
});
