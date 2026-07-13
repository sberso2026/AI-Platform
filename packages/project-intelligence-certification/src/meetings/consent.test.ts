import { describe, expect, it } from "vitest";
import {
  assertConsentAllowsLifecycleTransition,
  canEnterRecordingOrLive,
  MeetingIntelligenceError,
} from "@rtb/project-intelligence";

describe("Gate H — privacy and consent", () => {
  it("blocks recording/live when notice required and consent unresolved", () => {
    expect(() =>
      assertConsentAllowsLifecycleTransition({
        recordingNoticeRequired: "required",
        consentStatus: "pending",
        toStatus: "recording",
      }),
    ).toThrow(MeetingIntelligenceError);

    expect(() =>
      assertConsentAllowsLifecycleTransition({
        recordingNoticeRequired: "required",
        consentStatus: "not_requested",
        toStatus: "live",
      }),
    ).toThrow(/consent/);

    expect(canEnterRecordingOrLive("required", "pending")).toBe(false);
  });

  it("allows recording/live when consent granted or not applicable", () => {
    expect(() =>
      assertConsentAllowsLifecycleTransition({
        recordingNoticeRequired: "required",
        consentStatus: "granted",
        toStatus: "live",
      }),
    ).not.toThrow();

    expect(() =>
      assertConsentAllowsLifecycleTransition({
        recordingNoticeRequired: "required",
        consentStatus: "not_applicable",
        toStatus: "recording",
      }),
    ).not.toThrow();

    expect(canEnterRecordingOrLive("required", "granted")).toBe(true);
  });

  it("does not enforce consent when recording notice is not required", () => {
    expect(() =>
      assertConsentAllowsLifecycleTransition({
        recordingNoticeRequired: "not_required",
        consentStatus: "pending",
        toStatus: "live",
      }),
    ).not.toThrow();
  });
});
