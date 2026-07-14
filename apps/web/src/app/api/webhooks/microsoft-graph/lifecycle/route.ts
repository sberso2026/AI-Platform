import {
  handleMicrosoftGraphLifecycleWebhook,
} from "@/lib/project-intelligence/meetings-service";
import { MeetingIntelligenceError } from "@rtb/project-intelligence/server";

/**
 * Canonical Microsoft Graph subscription lifecycle endpoint.
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
