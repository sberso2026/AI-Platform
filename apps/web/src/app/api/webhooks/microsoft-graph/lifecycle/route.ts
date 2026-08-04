/**
 * Canonical Microsoft Graph subscription lifecycle endpoint.
 * Keep this module free of Document Intelligence / pdfjs imports so Graph
 * validationToken handshakes and fail-closed validation load without DOMMatrix.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type MeetingWebhookError = Error & {
  code?: string;
  statusCode?: number;
  details?: { teamsCode?: string };
};

type GraphLifecycleNotificationLite = {
  subscriptionId?: string;
  lifecycleEvent?: string;
  clientState?: string;
};

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

function isMeetingWebhookError(error: unknown): error is MeetingWebhookError {
  return (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof (error as MeetingWebhookError).statusCode === "number" &&
    "code" in error &&
    typeof (error as MeetingWebhookError).code === "string"
  );
}

function jsonError(
  status: number,
  code: string,
  message: string,
  requestId: string,
): Response {
  return Response.json({ error: { code, message, requestId } }, { status });
}

function extractNotifications(body: unknown): GraphLifecycleNotificationLite[] {
  if (Array.isArray(body)) return body as GraphLifecycleNotificationLite[];
  if (
    typeof body === "object" &&
    body !== null &&
    Array.isArray((body as { value?: unknown }).value)
  ) {
    return (body as { value: GraphLifecycleNotificationLite[] }).value;
  }
  return [];
}

function expectedWebhookClientState(): string {
  return (
    process.env.PI_TEAMS_WEBHOOK_CLIENT_STATE?.trim() ||
    process.env.MICROSOFT_GRAPH_WEBHOOK_CLIENT_STATE?.trim() ||
    ""
  );
}

async function prevalidateLifecyclePost(
  request: Request,
  requestId: string,
): Promise<Response | null> {
  const body = await request.json().catch(() => ({}));
  const notifications = extractNotifications(body);
  if (!notifications.length) {
    return jsonError(
      400,
      "teams_webhook_validation_failed",
      "Graph lifecycle payload required",
      requestId,
    );
  }

  const expected = expectedWebhookClientState();
  if (!expected) {
    return jsonError(
      422,
      "teams_provider_not_configured",
      "Microsoft Teams provider is not configured",
      requestId,
    );
  }

  for (const n of notifications) {
    if (!n.clientState || n.clientState !== expected) {
      return jsonError(
        401,
        "teams_webhook_validation_failed",
        "Graph webhook clientState invalid",
        requestId,
      );
    }
  }

  return null;
}

export async function GET(request: Request) {
  const handshake = validationTokenResponse(request);
  if (handshake) return handshake;
  return Response.json(
    { ok: true, route: "microsoft-graph-lifecycle-webhook" },
    { status: 200 },
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}

export async function POST(request: Request) {
  const handshake = validationTokenResponse(request);
  if (handshake) return handshake;

  const requestId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  const precheck = await prevalidateLifecyclePost(request.clone(), requestId);
  if (precheck) return precheck;

  try {
    const { handleMicrosoftGraphLifecycleWebhook } = await import(
      "@/lib/project-intelligence/meetings-service"
    );
    return await handleMicrosoftGraphLifecycleWebhook(request);
  } catch (error) {
    if (isMeetingWebhookError(error)) {
      return Response.json(
        {
          error: {
            code: error.details?.teamsCode ?? error.code,
            message: error.message,
            requestId,
          },
        },
        { status: error.statusCode },
      );
    }
    return jsonError(
      500,
      "internal_error",
      "Microsoft Graph lifecycle webhook handling failed",
      requestId,
    );
  }
}
