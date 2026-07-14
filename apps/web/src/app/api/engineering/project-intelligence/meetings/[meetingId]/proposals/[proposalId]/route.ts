import { NextResponse } from "next/server";
import { withEngineeringApiParams } from "@/lib/commerce/engineering-api";
import { requireMeetingsRead } from "@/lib/project-intelligence/access";
import {
  getMeetingProposal,
  patchMeetingProposal,
} from "@/lib/project-intelligence/meetings-service";
import { handleCommerceDomainError } from "@/lib/lifecycle-api";

export const GET = withEngineeringApiParams<{ meetingId: string; proposalId: string }>(
  "project-intelligence-meetings",
  async (context, _request, params) => {
    try {
      requireMeetingsRead(context);
      const data = await getMeetingProposal(context, params.proposalId);
      if (String(data.meeting_session_id) !== params.meetingId) {
        return NextResponse.json(
          {
            error: {
              code: "proposal_not_found",
              message: "Proposal not found for meeting",
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

export const PATCH = withEngineeringApiParams<{ meetingId: string; proposalId: string }>(
  "project-intelligence-meetings",
  async (context, request, params) => {
    try {
      requireMeetingsRead(context);
      const existing = await getMeetingProposal(context, params.proposalId);
      if (String(existing.meeting_session_id) !== params.meetingId) {
        return NextResponse.json(
          {
            error: {
              code: "proposal_not_found",
              message: "Proposal not found for meeting",
              requestId: context.correlationId,
            },
          },
          { status: 404 },
        );
      }
      const body = await request.json().catch(() => ({}));
      const data = await patchMeetingProposal(context, params.proposalId, body);
      return NextResponse.json({ data, correlationId: context.correlationId });
    } catch (error) {
      return handleCommerceDomainError(error, context.correlationId);
    }
  },
);
