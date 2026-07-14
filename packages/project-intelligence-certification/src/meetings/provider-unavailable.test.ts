import { describe, expect, it } from "vitest";
import {
  MEETING_PROVIDER_STATUS,
  assertExternalProvidersUnavailableInUi,
  assertManualProviderOnly,
  meetingProviderCapabilityReport,
  MeetingIntelligenceError,
} from "@rtb/project-intelligence";

describe("Gate P — provider unavailable contracts", () => {
  it("marks only manual as certified", () => {
    expect(MEETING_PROVIDER_STATUS.manual).toBe("certified");
    expect(MEETING_PROVIDER_STATUS.microsoft_teams).toBe("unavailable");
    expect(MEETING_PROVIDER_STATUS.zoom).toBe("unavailable");
    expect(MEETING_PROVIDER_STATUS.google_meet).toBe("unavailable");
  });

  it("rejects external providers for create/schedule flows", () => {
    expect(() => assertManualProviderOnly("manual")).not.toThrow();
    for (const provider of ["microsoft_teams", "zoom", "google_meet"] as const) {
      expect(() => assertManualProviderOnly(provider)).toThrow(MeetingIntelligenceError);
      try {
        assertManualProviderOnly(provider);
      } catch (error) {
        expect(error).toBeInstanceOf(MeetingIntelligenceError);
        expect((error as MeetingIntelligenceError).code).toBe("meeting_provider_unavailable");
        expect((error as MeetingIntelligenceError).statusCode).toBe(422);
      }
    }
  });

  it("exposes capability reports without join/bot/realtime claims", () => {
    for (const provider of ["microsoft_teams", "zoom", "google_meet"] as const) {
      const report = meetingProviderCapabilityReport(provider);
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
