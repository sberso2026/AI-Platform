import { describe, expect, it } from "vitest";

import {
  CERTIFIED_TEAMS_CAPABILITY_SUBSET,
  countUnsupportedCapabilities,
  overallTeamsProviderStatus,
} from "../src/meetings/teams/capability-contract";
import { validateTeamsMeetingUrl } from "../src/meetings/teams/teams-url-validation";
import { MicrosoftGraphTokenService } from "../src/meetings/teams/microsoft-graph-token-service";
import {
  containsSecretExposure,
  redactSecretsFromText,
} from "../src/meetings/teams/microsoft-graph-webhook-service";
import { extractOnlineMeetingIdFromGraphResource } from "../src/meetings/teams/microsoft-graph-client";
import {
  assertAllowedMeetingProvider,
  meetingProviderCapabilityReport,
} from "../src/meetings/providers";

describe("Teams URL validation", () => {
  it("accepts HTTPS Teams join URLs", () => {
    const v = validateTeamsMeetingUrl(
      "https://teams.microsoft.com/l/meetup-join/19%3ameeting_abc/0?context=%7b%7d",
    );
    expect(v.host).toBe("teams.microsoft.com");
    expect(v.joinUrlHash).toHaveLength(64);
  });

  it("rejects http and non-Teams hosts", () => {
    expect(() => validateTeamsMeetingUrl("http://teams.microsoft.com/l/meetup-join/x")).toThrow();
    expect(() => validateTeamsMeetingUrl("https://evil.example/l/meetup-join/x")).toThrow();
  });

  it("rejects embedded credentials", () => {
    expect(() =>
      validateTeamsMeetingUrl("https://user:pass@teams.microsoft.com/l/meetup-join/x"),
    ).toThrow();
  });
});

describe("Teams capability contract", () => {
  it("reports certified overall for certified subset", () => {
    expect(overallTeamsProviderStatus(CERTIFIED_TEAMS_CAPABILITY_SUBSET)).toBe("certified");
    expect(countUnsupportedCapabilities(CERTIFIED_TEAMS_CAPABILITY_SUBSET)).toBe(3);
  });
});

describe("Graph token fixture mode", () => {
  it("returns fixture token without network", async () => {
    const svc = new MicrosoftGraphTokenService({
      tenantId: "t",
      clientId: "c",
      clientSecret: "s",
      webhookSecret: "wh",
      notificationUrl: null,
      lifecycleNotificationUrl: null,
      mode: "fixture",
      tenantLabel: "fixture",
      testOrganizer: null,
      testMeetingUrl: null,
      liveCertEnabled: false,
    });
    const token = await svc.getAccessToken("corr-1");
    expect(token.startsWith("fixture-token:")).toBe(true);
    expect(svc.health().tokenCached).toBe(true);
  });
});

describe("Webhook helpers", () => {
  it("extracts online meeting id and redacts secrets", () => {
    expect(
      extractOnlineMeetingIdFromGraphResource("communications/onlineMeetings('abc%20123')"),
    ).toBe("abc 123");
    expect(redactSecretsFromText("secret=abc", ["abc"])).toContain("[REDACTED]");
    expect(containsSecretExposure("token abc end", ["abc"])).toBe(true);
  });
});

describe("Provider gating", () => {
  it("allows Teams when fixture mode configured", () => {
    const env = {
      PI_TEAMS_GRAPH_MODE: "fixture",
      MICROSOFT_GRAPH_WEBHOOK_SECRET: "wh",
    } as NodeJS.ProcessEnv;
    const report = meetingProviderCapabilityReport("microsoft_teams", env);
    expect(report.status).toBe("certified");
    expect(report.botAvailable).toBe(false);
    expect(report.realtimeClaimed).toBe(false);
    expect(() => assertAllowedMeetingProvider("microsoft_teams", env)).not.toThrow();
    expect(() => assertAllowedMeetingProvider("zoom", env)).toThrow();
  });

  it("keeps Teams unavailable without config", () => {
    const env = {} as NodeJS.ProcessEnv;
    expect(meetingProviderCapabilityReport("microsoft_teams", env).status).toBe("unavailable");
  });
});
