import { describe, expect, it } from "vitest";

import {
  assertMeetingsUsesProjectIntelligenceApp,
  assertConsentAllowsLifecycleTransition,
  assertExternalProvidersUnavailableInUi,
  assertManualProviderOnly,
  assertPhase6c3bManualTransition,
  canTransitionMeetingStatus,
  MEETING_PROVIDER_STATUS,
  meetingProviderCapabilityReport,
  MeetingIntelligenceError,
} from "../src/meetings";

describe("meeting providers", () => {
  it("marks only manual as certified", () => {
    expect(MEETING_PROVIDER_STATUS.manual).toBe("certified");
    expect(MEETING_PROVIDER_STATUS.microsoft_teams).toBe("unavailable");
    expect(MEETING_PROVIDER_STATUS.zoom).toBe("unavailable");
    expect(MEETING_PROVIDER_STATUS.google_meet).toBe("unavailable");
  });

  it("rejects external providers for create flows", () => {
    expect(() => assertManualProviderOnly("zoom")).toThrow(MeetingIntelligenceError);
    expect(() => assertManualProviderOnly("manual")).not.toThrow();
  });

  it("exposes capability reports without bot or join claims", () => {
    const teams = meetingProviderCapabilityReport("microsoft_teams");
    expect(teams.joinEnabled).toBe(false);
    expect(teams.botAvailable).toBe(false);
    expect(teams.realtimeClaimed).toBe(false);
  });

  it("forbids enabled Join Teams/Zoom/Meet labels", () => {
    expect(() =>
      assertExternalProvidersUnavailableInUi(["Join Teams", "Start manual"]),
    ).toThrow(/must not be enabled/);
  });
});

describe("entitlement isolation", () => {
  it("rejects meeting_intelligence stub and separate meetings app keys", () => {
    expect(() => assertMeetingsUsesProjectIntelligenceApp("meeting_intelligence")).toThrow();
    expect(() =>
      assertMeetingsUsesProjectIntelligenceApp("project-intelligence-meetings"),
    ).toThrow();
    expect(() => assertMeetingsUsesProjectIntelligenceApp("project_intelligence")).not.toThrow();
  });
});

describe("consent gates", () => {
  it("blocks recording and live when notice required and consent unresolved", () => {
    expect(() =>
      assertConsentAllowsLifecycleTransition({
        recordingNoticeRequired: "required",
        consentStatus: "pending",
        toStatus: "recording",
      }),
    ).toThrow(/consent/);
    expect(() =>
      assertConsentAllowsLifecycleTransition({
        recordingNoticeRequired: "required",
        consentStatus: "granted",
        toStatus: "live",
      }),
    ).not.toThrow();
  });
});

describe("phase 6c3b manual transitions", () => {
  it("allows ended to archived but not ended to processing via user flow", () => {
    expect(canTransitionMeetingStatus("ended", "processing")).toBe(true);
    expect(() => assertPhase6c3bManualTransition("ended", "processing")).toThrow();
    expect(() => assertPhase6c3bManualTransition("ended", "archived")).not.toThrow();
  });
});
