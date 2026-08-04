/**
 * Phase 6C-3E — Live Graph subscription create / renew / revoke probe.
 * Never logs clientState or secrets.
 */
import {
  requireLiveMicrosoftGraphConfig,
  MicrosoftGraphTokenService,
  createMicrosoftGraphClient,
  measureLatencyMs,
} from "@rtb/project-intelligence";

async function main(): Promise<void> {
  const config = requireLiveMicrosoftGraphConfig(process.env);
  if (config.mode !== "live") {
    throw new Error("fixture fallback forbidden");
  }
  if (!config.notificationUrl) {
    throw new Error("PI_TEAMS_WEBHOOK_BASE_URL required");
  }
  const notificationUrl = config.notificationUrl;
  const graph = createMicrosoftGraphClient(config, new MicrosoftGraphTokenService(config));
  const created = await measureLatencyMs(() =>
    graph.createSubscription({
      resource: "/communications/onlineMeetings",
      changeType: "updated",
      notificationUrl,
      lifecycleNotificationUrl: config.lifecycleNotificationUrl,
      clientState: config.webhookSecret,
      expirationDateTime: new Date(Date.now() + 3_600_000).toISOString(),
      correlationId: "ci-sub",
    }),
  );
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
      createMs: created.latencyMs,
      renewMs: renewed.latencyMs,
      revokeMs: revoked.latencyMs,
    }),
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Certification step failed");
  process.exit(1);
});
