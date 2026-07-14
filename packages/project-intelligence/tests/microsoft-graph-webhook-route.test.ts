import { describe, expect, it } from "vitest";
import {
  MICROSOFT_GRAPH_WEBHOOK_PATH,
  resolveMicrosoftGraphWebhookUrls,
  readMicrosoftGraphConfig,
} from "../src/meetings/teams/microsoft-graph-token-service";
import { MicrosoftGraphWebhookService } from "../src/meetings/teams/microsoft-graph-webhook-service";
import { MeetingIntelligenceError } from "../src/meetings/errors";

describe("Microsoft Graph webhook URL resolution", () => {
  it("appends canonical path when base URL is an origin", () => {
    const urls = resolveMicrosoftGraphWebhookUrls("https://pilot.rtbea.com.au");
    expect(urls.notificationUrl).toBe(
      `https://pilot.rtbea.com.au${MICROSOFT_GRAPH_WEBHOOK_PATH}`,
    );
    expect(urls.lifecycleNotificationUrl).toBe(
      `https://pilot.rtbea.com.au${MICROSOFT_GRAPH_WEBHOOK_PATH}/lifecycle`,
    );
  });

  it("accepts full notification URL without double-appending", () => {
    const full = "https://pilot.rtbea.com.au/api/webhooks/microsoft-graph";
    const urls = resolveMicrosoftGraphWebhookUrls(full);
    expect(urls.notificationUrl).toBe(full);
    expect(urls.lifecycleNotificationUrl).toBe(`${full}/lifecycle`);
  });

  it("wires resolve into live config from PI_TEAMS_WEBHOOK_BASE_URL", () => {
    const config = readMicrosoftGraphConfig({
      PI_TEAMS_GRAPH_MODE: "live",
      PI_TEAMS_TENANT_ID: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      PI_TEAMS_CLIENT_ID: "11111111-2222-3333-4444-555555555555",
      PI_TEAMS_CLIENT_SECRET: "not-a-fixture-secret-value",
      PI_TEAMS_WEBHOOK_CLIENT_STATE: "live-client-state-value",
      PI_TEAMS_WEBHOOK_BASE_URL: "https://pilot.rtbea.com.au",
      PI_TEAMS_LIVE_CERT_ENABLED: "true",
    } as NodeJS.ProcessEnv);
    expect(config?.notificationUrl).toBe(
      "https://pilot.rtbea.com.au/api/webhooks/microsoft-graph",
    );
  });
});

describe("Microsoft Graph webhook handshake contracts", () => {
  const config = {
    tenantId: "t",
    clientId: "c",
    clientSecret: "s",
    webhookSecret: "expected-state",
    notificationUrl: "https://pilot.rtbea.com.au/api/webhooks/microsoft-graph",
    lifecycleNotificationUrl:
      "https://pilot.rtbea.com.au/api/webhooks/microsoft-graph/lifecycle",
    mode: "live" as const,
    tenantLabel: "staging",
    testOrganizer: null,
    testMeetingUrl: null,
    liveCertEnabled: true,
  };

  it("returns validationToken without requiring clientState", () => {
    const svc = new MicrosoftGraphWebhookService({} as never, config);
    const decoded = svc.validationHandshake(
      new URL("https://x/api/webhooks/microsoft-graph?validationToken=test%20123"),
    );
    expect(decoded).toBe("test 123");
  });

  it("rejects missing clientState", () => {
    const svc = new MicrosoftGraphWebhookService({} as never, config);
    expect(() => svc.assertClientState(undefined)).toThrow(MeetingIntelligenceError);
  });

  it("rejects wrong clientState", () => {
    const svc = new MicrosoftGraphWebhookService({} as never, config);
    expect(() => svc.assertClientState("wrong")).toThrow(MeetingIntelligenceError);
  });

  it("accepts matching clientState", () => {
    const svc = new MicrosoftGraphWebhookService({} as never, config);
    expect(() => svc.assertClientState("expected-state")).not.toThrow();
  });
});
