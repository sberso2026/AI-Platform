import {
  handleMicrosoftGraphLifecycleWebhook,
} from "@/lib/project-intelligence/meetings-service";
import { MeetingIntelligenceError } from "@rtb/project-intelligence/server";

/**
 * Microsoft Graph subscription lifecycle notifications.
 * Does not use user JWT — validates Graph validationToken / clientState.
 */
export async function GET(request: Request) {
  return handleMicrosoftGraphLifecycleWebhook(request);
}

export async function POST(request: Request) {
  try {
    return await handleMicrosoftGraphLifecycleWebhook(request);
  } catch (error) {
    const cid = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
    if (error instanceof MeetingIntelligenceError) {
      return Response.json(
        {
          error: {
            code: (error.details?.teamsCode as string | undefined) ?? error.code,
            message: error.message,
            requestId: cid,
            details: error.details,
          },
        },
        { status: error.statusCode },
      );
    }
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: error instanceof Error ? error.message : String(error),
          requestId: cid,
        },
      },
      { status: 500 },
    );
  }
}
