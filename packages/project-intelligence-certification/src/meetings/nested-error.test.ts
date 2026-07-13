import { describe, expect, it } from "vitest";
import { MeetingIntelligenceError } from "@rtb/project-intelligence";

describe("Gate L — MeetingIntelligenceError nested HTTP envelope", () => {
  it("preserves nested code, message, details, and optional requestId", () => {
    const requestId = "m3b9803d-8391-469f-9c21-381411a50b72";
    const error = new MeetingIntelligenceError(
      "meeting_transition_invalid",
      "Meeting status transition is not allowed",
      409,
      { from: "draft", to: "live" },
    );

    expect(error.statusCode).toBe(409);
    expect(error.toEnvelope(requestId)).toEqual({
      error: {
        code: "meeting_transition_invalid",
        message: "Meeting status transition is not allowed",
        requestId,
        details: { from: "draft", to: "live" },
      },
    });
  });

  it("maps consent and provider codes to exact status classes", () => {
    expect(new MeetingIntelligenceError("meeting_consent_unresolved", "Consent required").statusCode).toBe(403);
    expect(new MeetingIntelligenceError("meeting_provider_unavailable", "Unavailable").statusCode).toBe(422);
    expect(new MeetingIntelligenceError("meeting_not_found", "Missing").statusCode).toBe(404);
    expect(new MeetingIntelligenceError("meeting_access_denied", "Denied").statusCode).toBe(403);
  });
});
