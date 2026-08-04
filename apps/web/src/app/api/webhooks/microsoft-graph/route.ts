import { MeetingIntelligenceError } from "@rtb/project-intelligence/server";

/**
 * Canonical Microsoft Graph change-notification endpoint.
 * validationToken / GET health are handled without loading Document Intelligence PDF deps.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function validationTokenResponse(request: Request): Response | null {
  const url = new URL(request.url);
  const validationToken = url.searchParams.get("validationToken");
  if (validationToken != null && validationToken.length > 0) {
    return new Response(validationToken, {
      status: 200,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  return null;
}

export async function GET(request: Request) {
  const handshake = validationTokenResponse(request);
  if (handshake) return handshake;
  return Response.json({ ok: true, route: "microsoft-graph-webhook" }, { status: 200 });
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const handshake = validationTokenResponse(request);
  if (handshake) return handshake;

  try {
    const { handleMicrosoftGraphWebhook } = await import(
      "@/lib/project-intelligence/meetings-service"
    );
    return await handleMicrosoftGraphWebhook(request);
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
          message: "Microsoft Graph webhook handling failed",
          requestId: cid,
        },
      },
      { status: 500 },
    );
  }
}
