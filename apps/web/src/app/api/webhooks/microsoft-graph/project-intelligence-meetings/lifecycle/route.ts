import {
  handleMicrosoftGraphLifecycleWebhook,
} from "@/lib/project-intelligence/meetings-service";
import { MeetingIntelligenceError } from "@rtb/project-intelligence/server";

/**
 * Microsoft Graph subscription lifecycle notifications.
 * Canonical path is /api/webhooks/microsoft-graph/lifecycle — this path remains for compatibility.
 * Does not use user JWT — validates Graph validationToken / clientState.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  return handleMicrosoftGraphLifecycleWebhook(request);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
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
          },
        },
        { status: error.statusCode },
      );
    }
    return Response.json(
      {
        error: {
          code: "internal_error",
          message: "Microsoft Graph lifecycle webhook handling failed",
          requestId: cid,
        },
      },
      { status: 500 },
    );
  }
}
