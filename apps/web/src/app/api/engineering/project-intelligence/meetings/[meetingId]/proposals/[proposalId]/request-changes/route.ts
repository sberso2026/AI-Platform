import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import { requestMeetingProposalChanges } from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const POST = withEngineeringApiParams<{ meetingId: string; proposalId: string }>(
  "project-intelligence-meetings",
  async (context, request, params) => {
    try {
      requireMeetingsRead(context);
      const body = await request.json().catch(() => ({}));
      const notes = typeof body.notes === "string" ? body.notes : undefined;
      const data = await requestMeetingProposalChanges(context, params.proposalId, notes);
      return NextResponse.json({ data, correlationId: context.correlationId });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
