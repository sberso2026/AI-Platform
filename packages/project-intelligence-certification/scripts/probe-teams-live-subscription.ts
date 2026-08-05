/**
 * Phase 6C-3E — Live Graph subscription create / renew / revoke probe.
 * Uses resource-specific application roles for the subscribed Graph resource.
 * Never logs clientState, secrets, or access tokens.
 */
import {
  requireLiveMicrosoftGraphConfig,
  MicrosoftGraphTokenService,
  createMicrosoftGraphClient,
  measureLatencyMs,
  CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE,
  tokenRolesSatisfySubscriptionResource,
  normalizeGraphSubscriptionResource,
} from "@rtb/project-intelligence";

type GraphSubError = Error & {
  code?: string;
  httpStatus?: number;
  graphCode?: string | null;
  graphMessage?: string | null;
  innerErrorCode?: string | null;
  requestId?: string | null;
  clientRequestId?: string | null;
  resource?: string;
  expirationDateTime?: string;
  lifecycleNotificationUrlSupplied?: boolean;
};

function decodeJwtRoles(token: string): string[] {
  const parts = token.split(".");
  if (parts.length < 2) return [];
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as {
      roles?: unknown;
    };
    return Array.isArray(json.roles) ? json.roles.map(String) : [];
  } catch {
    return [];
  }
}

function classifySubscriptionFailure(error: GraphSubError): string {
  const status = error.httpStatus ?? 0;
  const code = (error.graphCode ?? error.code ?? "").toLowerCase();
  const message = (error.graphMessage ?? error.message ?? "").toLowerCase();
  if (code.includes("unsupported") || message.includes("resource not supported")) {
    return "unsupported resource";
  }
  if (status === 401 || status === 403 || code.includes("authorization") || code.includes("accessdenied")) {
    return "permission";
  }
  if (message.includes("notificationurl") || message.includes("notification url")) {
    return "invalid notification URL";
  }
  if (message.includes("lifecycle")) {
    return "invalid lifecycle URL";
  }
  if (message.includes("expiration")) {
    return "invalid expiration";
  }
  if (message.includes("transcript") && (message.includes("disabled") || message.includes("not enabled"))) {
    return "tenant transcript access disabled";
  }
  return "product defect";
}

function reportFailure(error: unknown, resource: string, expirationDateTime: string, lifecycleSupplied: boolean): never {
  const e = error as GraphSubError;
  const diagnostics = {
    ok: false,
    classification: e.code === "TEAMS_SUBSCRIPTION_RESOURCE_UNSUPPORTED" ? "unsupported resource" : classifySubscriptionFailure(e),
    httpStatus: e.httpStatus ?? null,
    graphCode: e.graphCode ?? e.code ?? null,
    innerErrorCode: e.innerErrorCode ?? null,
    message: e.graphMessage ?? e.message ?? "subscription failed",
    requestId: e.requestId ?? null,
    clientRequestId: e.clientRequestId ?? null,
    resource: normalizeGraphSubscriptionResource(e.resource ?? resource),
    expirationRequested: e.expirationDateTime ?? expirationDateTime,
    lifecycleNotificationUrlSupplied:
      e.lifecycleNotificationUrlSupplied ?? lifecycleSupplied,
    timestamp: new Date().toISOString(),
  };
  console.error(JSON.stringify(diagnostics, null, 2));
  process.exit(1);
}

async function main(): Promise<void> {
  const config = requireLiveMicrosoftGraphConfig(process.env);
  if (config.mode !== "live") {
    throw new Error("fixture fallback forbidden");
  }
  if (!config.notificationUrl) {
    throw new Error("PI_TEAMS_WEBHOOK_BASE_URL required");
  }

  const resource = CERTIFIED_TEAMS_TRANSCRIPT_SUBSCRIPTION_RESOURCE;
  const notificationUrl = config.notificationUrl;
  const lifecycleNotificationUrl = config.lifecycleNotificationUrl;
  const expirationDateTime = new Date(Date.now() + 3_600_000).toISOString();
  const changeType = "created";

  const tokens = new MicrosoftGraphTokenService(config);
  const accessToken = await tokens.getAccessToken("ci-sub-roles");
  if (!accessToken || accessToken.startsWith("fixture-token:")) {
    throw new Error("live token required");
  }
  const roles = decodeJwtRoles(accessToken);
  const roleCheck = tokenRolesSatisfySubscriptionResource(resource, roles);
  console.log(
    JSON.stringify({
      subscriptionResource: resource,
      requiredRoles: roleCheck.required,
      tokenRolesPresent: roles,
      rolesMissing: roleCheck.missing,
      invalidGenericSubscriptionRoleRequired: false,
    }),
  );
  if (!roleCheck.ok) {
    console.error(
      JSON.stringify({
        ok: false,
        classification: "permission",
        httpStatus: null,
        graphCode: "TEAMS_GRAPH_RESOURCE_PERMISSION_MISSING",
        message: `Token roles missing required permission for resource ${resource}`,
        rolesMissing: roleCheck.missing,
        resource,
        timestamp: new Date().toISOString(),
      }),
    );
    process.exit(1);
  }

  const graph = createMicrosoftGraphClient(config, tokens);
  let createdId: string | null = null;
  try {
    const created = await measureLatencyMs(() =>
      graph.createSubscription({
        resource,
        changeType,
        notificationUrl,
        lifecycleNotificationUrl,
        clientState: config.webhookSecret,
        expirationDateTime,
        correlationId: "ci-sub",
      }),
    );
    createdId = created.result.id;
    const renewed = await measureLatencyMs(() =>
      graph.renewSubscription(
        created.result.id,
        new Date(Date.now() + 3_600_000).toISOString(),
        "ci-sub-renew",
      ),
    );
    const revoked = await measureLatencyMs(() =>
      graph.deleteSubscription(created.result.id, "ci-sub-del"),
    );
    console.log(
      JSON.stringify({
        ok: true,
        subscriptionResource: resource,
        requiredRoles: roleCheck.required,
        createMs: created.latencyMs,
        renewMs: renewed.latencyMs,
        revokeMs: revoked.latencyMs,
        changeType,
        lifecycleNotificationUrlSupplied: Boolean(lifecycleNotificationUrl),
      }),
    );
  } catch (error) {
    if (createdId) {
      try {
        await graph.deleteSubscription(createdId, "ci-sub-cleanup");
      } catch {
        /* best-effort cleanup */
      }
    }
    reportFailure(error, resource, expirationDateTime, Boolean(lifecycleNotificationUrl));
  }
}

main().catch((error: unknown) => {
  console.error(
    JSON.stringify({
      ok: false,
      classification: "product defect",
      message: error instanceof Error ? error.message : "Certification step failed",
      timestamp: new Date().toISOString(),
    }),
  );
  process.exit(1);
});

