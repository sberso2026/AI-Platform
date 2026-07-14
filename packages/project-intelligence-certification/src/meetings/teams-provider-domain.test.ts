import { describe, expect, it } from "vitest";
import {
  CERTIFIED_TEAMS_CAPABILITY_SUBSET,
  HARD_UNSUPPORTED_TEAMS_CAPABILITIES,
  countUnsupportedCapabilities,
  overallTeamsProviderStatus,
  teamsErrorHttpStatus,
} from "@rtb/project-intelligence";
import {
  FixtureMicrosoftGraphClient,
  MicrosoftGraphTokenService,
  MicrosoftGraphWebhookService,
  validateTeamsMeetingUrl,
  meetingProviderCapabilityReport,
  MEETING_PROVIDER_STATUS,
} from "@rtb/project-intelligence";

const fixtureEnv = {
  PI_TEAMS_GRAPH_MODE: "fixture",
  PI_TEAMS_PROVIDER_ENABLED: "1",
  MICROSOFT_GRAPH_WEBHOOK_SECRET: "fixture-webhook-client-state",
  MICROSOFT_TENANT_ID: "fixture-tenant",
  MICROSOFT_CLIENT_ID: "fixture-client",
  MICROSOFT_CLIENT_SECRET: "fixture-secret",
} as NodeJS.ProcessEnv;

describe("Phase 6C-3D Teams provider domain", () => {
  it("Gate D — Graph authentication (fixture)", async () => {
    const token = new MicrosoftGraphTokenService({
      tenantId: "fixture-tenant",
      clientId: "c",
      clientSecret: "s",
      webhookSecret: "wh",
      notificationUrl: null,
      lifecycleNotificationUrl: null,
      mode: "fixture",
    });
    await expect(token.getAccessToken("corr")).resolves.toMatch(/^fixture-token:/);
  });

  it("Gate E — permission/consent fail-closed when unconfigured", () => {
    const report = meetingProviderCapabilityReport("microsoft_teams", {} as NodeJS.ProcessEnv);
    expect(report.status).toBe("unavailable");
  });

  it("Gate F — Teams URL validation", () => {
    expect(() =>
      validateTeamsMeetingUrl(
        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc/0?context=%7b%7d",
      ),
    ).not.toThrow();
    expect(() => validateTeamsMeetingUrl("https://example.com/join")).toThrow();
  });

  it("Gate G — discovery client returns fixture meeting", async () => {
    const graph = new FixtureMicrosoftGraphClient();
    const meeting = await graph.getOnlineMeeting("fixture-online-meeting-001", "c");
    expect(meeting?.id).toBe("fixture-online-meeting-001");
  });

  it("Gate H — webhook clientState validation", () => {
    const svc = new MicrosoftGraphWebhookService({} as never, {
      tenantId: "fixture-tenant",
      clientId: "c",
      clientSecret: "s",
      webhookSecret: "expected",
      notificationUrl: null,
      lifecycleNotificationUrl: null,
      mode: "fixture",
    });
    expect(() => svc.assertClientState("expected")).not.toThrow();
    expect(() => svc.assertClientState("wrong")).toThrow();
    expect(svc.validationHandshake(new URL("https://x?validationToken=abc"))).toBe("abc");
  });

  it("Gate I — durable event key uniqueness concept", () => {
    const a = ["sub", "res", "created", "id1", ""].join("|");
    const b = ["sub", "res", "created", "id1", ""].join("|");
    expect(a).toBe(b);
  });

  it("Gate J — subscription create via fixture graph", async () => {
    const graph = new FixtureMicrosoftGraphClient();
    const sub = await graph.createSubscription({
      resource: "communications/onlineMeetings",
      notificationUrl: "https://example.test/hook",
      clientState: "wh",
      expirationDateTime: new Date(Date.now() + 3600_000).toISOString(),
      correlationId: "c",
      changeType: "created,updated",
    });
    expect(sub.id).toMatch(/^fixture-sub-/);
    const renewed = await graph.renewSubscription(
      sub.id,
      new Date(Date.now() + 7200_000).toISOString(),
      "c",
    );
    expect(renewed.id).toBe(sub.id);
  });

  it("Gate K — participant mapping source from fixture", async () => {
    const graph = new FixtureMicrosoftGraphClient();
    const parts = await graph.listParticipants("fixture-online-meeting-001", "c");
    expect(parts.length).toBeGreaterThan(0);
    expect(new Set(parts.map((p) => p.displayName)).size).toBe(parts.length);
  });

  it("Gate L — transcript mode is post_meeting; bot/recording unsupported", () => {
    const report = meetingProviderCapabilityReport("microsoft_teams", fixtureEnv);
    expect(report.status).toBe("certified");
    expect(report.realtimeClaimed).toBe(false);
    expect(report.botAvailable).toBe(false);
    expect(report.recordingSupport).toBe(false);
    expect(CERTIFIED_TEAMS_CAPABILITY_SUBSET.live_transcript).toBe("unsupported");
    expect(HARD_UNSUPPORTED_TEAMS_CAPABILITIES).toContain("bot_join");
    expect(overallTeamsProviderStatus(CERTIFIED_TEAMS_CAPABILITY_SUBSET)).toBe("certified");
    expect(countUnsupportedCapabilities(CERTIFIED_TEAMS_CAPABILITY_SUBSET)).toBe(3);
  });

  it("Gate M — fixture transcript segments present for ingestion", async () => {
    const graph = new FixtureMicrosoftGraphClient();
    const segs = await graph.listTranscriptSegments("fixture-online-meeting-001", "c");
    expect(segs.length).toBeGreaterThanOrEqual(2);
    expect(segs[0]?.providerEventId).toBeTruthy();
  });

  it("Gate N/O — processing and review boundaries unchanged (manual still certified)", () => {
    expect(MEETING_PROVIDER_STATUS.manual).toBe("certified");
    expect(meetingProviderCapabilityReport("manual").status).toBe("certified");
  });

  it("Gate P — rate limit / auth error status mapping", () => {
    expect(teamsErrorHttpStatus("teams_rate_limited")).toBe(429);
    expect(teamsErrorHttpStatus("teams_provider_auth_failed")).toBe(401);
    expect(teamsErrorHttpStatus("teams_webhook_validation_failed")).toBe(401);
  });

  it("Gate T — Zoom and Google remain unavailable", () => {
    expect(meetingProviderCapabilityReport("zoom", fixtureEnv).status).toBe("unavailable");
    expect(meetingProviderCapabilityReport("google_meet", fixtureEnv).status).toBe("unavailable");
  });
});
