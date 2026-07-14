import { describe, expect, it } from "vitest";
import {
  MEETING_PROVIDER_STATUS,
  assertExternalProvidersUnavailableInUi,
  assertManualProviderOnly,
  meetingProviderCapabilityReport,
  MeetingIntelligenceError,
} from "@rtb/project-intelligence";

const noTeamsEnv = {} as NodeJS.ProcessEnv;

describe("Gate P — provider unavailable contracts", () => {
  it("marks only manual as certified in static status map", () => {
    expect(MEETING_PROVIDER_STATUS.manual).toBe("certified");
    expect(MEETING_PROVIDER_STATUS.microsoft_teams).toBe("unavailable");
    expect(MEETING_PROVIDER_STATUS.zoom).toBe("unavailable");
    expect(MEETING_PROVIDER_STATUS.google_meet).toBe("unavailable");
  });

  it("rejects unconfigured external providers for create/schedule flows", () => {
    expect(() => assertManualProviderOnly("manual", noTeamsEnv)).not.toThrow();
    for (const provider of ["microsoft_teams", "zoom", "google_meet"] as const) {
      expect(() => assertManualProviderOnly(provider, noTeamsEnv)).toThrow(MeetingIntelligenceError);
      try {
        assertManualProviderOnly(provider, noTeamsEnv);
      } catch (error) {
        expect(error).toBeInstanceOf(MeetingIntelligenceError);
        expect((error as MeetingIntelligenceError).code).toBe("meeting_provider_unavailable");
        expect((error as MeetingIntelligenceError).statusCode).toBe(422);
      }
    }
  });

  it("allows microsoft_teams when Teams provider is configured", () => {
    const teamsEnv = {
      PI_TEAMS_PROVIDER_ENABLED: "1",
      PI_TEAMS_GRAPH_MODE: "fixture",
    } as NodeJS.ProcessEnv;
    expect(() => assertManualProviderOnly("microsoft_teams", teamsEnv)).not.toThrow();
    expect(() => assertManualProviderOnly("zoom", teamsEnv)).toThrow(MeetingIntelligenceError);
  });

  it("exposes capability reports without join/bot/realtime claims", () => {
    for (const provider of ["microsoft_teams", "zoom", "google_meet"] as const) {
      const report = meetingProviderCapabilityReport(provider, noTeamsEnv);
      expect(report.joinEnabled).toBe(false);
      expect(report.botAvailable).toBe(false);
      expect(report.realtimeClaimed).toBe(false);
      expect(report.phase6c3bCertified).toBe(false);
    }
  });

  it("forbids enabled Join Teams/Zoom/Meet UI labels", () => {
    expect(() =>
      assertExternalProvidersUnavailableInUi(["Join Teams", "Join Zoom", "Join Google Meet"]),
    ).toThrow(/must not be enabled/);
  });
});
