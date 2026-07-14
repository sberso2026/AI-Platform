import { describe, expect, it } from "vitest";

import {
  classifyTranscriptAvailabilityLatency,
  emptyLatencyMetrics,
} from "../src/meetings/teams/teams-latency";
import {
  liveConfigPresence,
  readMicrosoftGraphConfig,
  requireLiveMicrosoftGraphConfig,
} from "../src/meetings/teams/microsoft-graph-token-service";
import { computeTeamsProviderReadiness } from "../src/meetings/teams/teams-provider-readiness";
import { MeetingIntelligenceError } from "../src/meetings/errors";

describe("Phase 6C-3E live Graph fail-closed", () => {
  it("accepts PI_TEAMS_* aliases for live config", () => {
    const config = readMicrosoftGraphConfig({
      PI_TEAMS_GRAPH_MODE: "live",
      PI_TEAMS_TENANT_ID: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      PI_TEAMS_CLIENT_ID: "11111111-2222-3333-4444-555555555555",
      PI_TEAMS_CLIENT_SECRET: "not-a-fixture-secret-value",
      PI_TEAMS_WEBHOOK_CLIENT_STATE: "live-client-state-value",
      PI_TEAMS_LIVE_CERT_ENABLED: "true",
      PI_TEAMS_TEST_TENANT_LABEL: "staging-test",
    } as NodeJS.ProcessEnv);
    expect(config?.mode).toBe("live");
    expect(config?.tenantLabel).toBe("staging-test");
    expect(config?.liveCertEnabled).toBe(true);
  });

  it("rejects fixture placeholders when mode is live", () => {
    const config = readMicrosoftGraphConfig({
      PI_TEAMS_GRAPH_MODE: "live",
      PI_TEAMS_TENANT_ID: "fixture-tenant",
      PI_TEAMS_CLIENT_ID: "fixture-client",
      PI_TEAMS_CLIENT_SECRET: "fixture-secret",
      PI_TEAMS_WEBHOOK_CLIENT_STATE: "fixture-webhook-client-state",
    } as NodeJS.ProcessEnv);
    expect(config).toBeNull();
  });

  it("requireLiveMicrosoftGraphConfig fails closed without secrets", () => {
    expect(() => requireLiveMicrosoftGraphConfig({} as NodeJS.ProcessEnv)).toThrow(
      MeetingIntelligenceError,
    );
    try {
      requireLiveMicrosoftGraphConfig({
        PI_TEAMS_GRAPH_MODE: "fixture",
      } as NodeJS.ProcessEnv);
    } catch (error) {
      expect(error).toBeInstanceOf(MeetingIntelligenceError);
      expect((error as MeetingIntelligenceError).details.teamsCode).toBe(
        "TEAMS_GRAPH_LIVE_CONFIG_MISSING",
      );
    }
  });

  it("liveConfigPresence reports names only", () => {
    const presence = liveConfigPresence({
      PI_TEAMS_GRAPH_MODE: "live",
      PI_TEAMS_TENANT_ID: "x",
    } as NodeJS.ProcessEnv);
    expect(presence.namesPresent).toContain("PI_TEAMS_GRAPH_MODE");
    expect(presence.namesPresent).toContain("PI_TEAMS_TENANT_ID");
    expect(presence.namesMissing.length).toBeGreaterThan(0);
  });

  it("productionTeamsProviderReady only when live certified flags are set", () => {
    const blocked = computeTeamsProviderReadiness({
      env: { PI_TEAMS_GRAPH_MODE: "fixture" } as NodeJS.ProcessEnv,
    });
    expect(blocked.productionTeamsProviderReady).toBe(false);
    expect(blocked.microsoftTeamsFixtureCertified).toBe(true);

    const ready = computeTeamsProviderReadiness({
      env: {
        PI_TEAMS_GRAPH_MODE: "live",
        PI_TEAMS_TENANT_ID: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        PI_TEAMS_CLIENT_ID: "11111111-2222-3333-4444-555555555555",
        PI_TEAMS_CLIENT_SECRET: "live-secret-value",
        PI_TEAMS_WEBHOOK_CLIENT_STATE: "live-client-state",
        PI_TEAMS_LIVE_CERT_ENABLED: "true",
      } as NodeJS.ProcessEnv,
      liveTenantCertified: true,
      postMeetingTranscriptCertified: true,
    });
    expect(ready.microsoftTeamsLiveTenantConfigured).toBe(true);
    expect(ready.productionTeamsProviderReady).toBe(true);
    expect(ready.microsoftTeamsRealtimeTranscriptCertified).toBe(false);
    expect(ready.microsoftTeamsBotJoinCertified).toBe(false);
  });

  it("classifies transcript availability latency buckets", () => {
    const ended = "2026-07-14T00:00:00.000Z";
    expect(classifyTranscriptAvailabilityLatency(ended, "2026-07-14T00:03:00.000Z")).toBe(
      "under_5_minutes",
    );
    expect(classifyTranscriptAvailabilityLatency(ended, "2026-07-14T00:10:00.000Z")).toBe(
      "5_to_15_minutes",
    );
    expect(classifyTranscriptAvailabilityLatency(ended, "2026-07-14T00:30:00.000Z")).toBe(
      "15_to_60_minutes",
    );
    expect(classifyTranscriptAvailabilityLatency(ended, "2026-07-14T02:00:00.000Z")).toBe(
      "over_60_minutes",
    );
    expect(emptyLatencyMetrics(["n/a"]).transcriptAvailabilityClass).toBe("unavailable");
  });
});
