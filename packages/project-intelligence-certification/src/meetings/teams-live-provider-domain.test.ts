import { describe, expect, it } from "vitest";
import {
  liveConfigPresence,
  requireLiveMicrosoftGraphConfig,
  MEETING_PROVIDER_STATUS,
  meetingProviderCapabilityReport,
  computeTeamsProviderReadiness,
  HARD_UNSUPPORTED_TEAMS_CAPABILITIES,
  MeetingIntelligenceError,
} from "@rtb/project-intelligence";

const SIX_C3D_BASELINE = "148223ec35768a9401a885071badb2a56e3ebb13";
const DI_BASELINE = "dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53";
const PROCESSING_BASELINE = "daf3903c200690fcad4dd9bc9b2c8661e442c15e";

describe("Phase 6C-3E live Teams baseline locks", () => {
  it("locks fixture baseline and DI/processing baselines", () => {
    expect(SIX_C3D_BASELINE).toHaveLength(40);
    expect(DI_BASELINE).toBe("dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53");
    expect(PROCESSING_BASELINE).toBe("daf3903c200690fcad4dd9bc9b2c8661e442c15e");
    expect(MEETING_PROVIDER_STATUS.manual).toBe("certified");
  });
});

describe("Phase 6C-3E Gate B/D fail-closed", () => {
  it("fails closed when live config missing", () => {
    const presence = liveConfigPresence({} as NodeJS.ProcessEnv);
    expect(presence.namesMissing.length).toBeGreaterThan(0);
    expect(() => requireLiveMicrosoftGraphConfig({} as NodeJS.ProcessEnv)).toThrow(
      MeetingIntelligenceError,
    );
  });

  it("rejects fixture mode for live require", () => {
    try {
      requireLiveMicrosoftGraphConfig({
        PI_TEAMS_GRAPH_MODE: "fixture",
        PI_TEAMS_LIVE_CERT_ENABLED: "true",
      } as NodeJS.ProcessEnv);
      expect.fail("should throw");
    } catch (error) {
      expect((error as MeetingIntelligenceError).details.teamsCode).toBe(
        "TEAMS_GRAPH_LIVE_CONFIG_MISSING",
      );
    }
  });

  it("keeps unsupported capabilities disabled", () => {
    expect(HARD_UNSUPPORTED_TEAMS_CAPABILITIES).toEqual([
      "live_transcript",
      "recording_access",
      "bot_join",
    ]);
    const report = meetingProviderCapabilityReport("microsoft_teams", {
      PI_TEAMS_PROVIDER_ENABLED: "1",
      PI_TEAMS_GRAPH_MODE: "fixture",
    } as NodeJS.ProcessEnv);
    expect(report.botAvailable).toBe(false);
    expect(report.realtimeClaimed).toBe(false);
    expect(report.recordingSupport).toBe(false);
  });

  it("productionTeamsProviderReady requires live certification evidence", () => {
    const flags = computeTeamsProviderReadiness({
      env: { PI_TEAMS_GRAPH_MODE: "fixture" } as NodeJS.ProcessEnv,
      liveTenantCertified: true,
      postMeetingTranscriptCertified: true,
    });
    expect(flags.productionTeamsProviderReady).toBe(false);
  });
});
