import { describe, expect, it } from "vitest";
import {
  InMemoryReviewProductTelemetry,
  assertTelemetryHasNoDocumentContent,
  computePilotRates,
} from "./telemetry";
import { expectCode } from "./expect-code";

describe("product telemetry", () => {
  it("rejects document-content-like payloads", () => {
    expectCode(
      () =>
        assertTelemetryHasNoDocumentContent({
          name: "review_completed",
          at: "2026-09-19T00:00:00.000Z",
          errorCode: "extracted_text",
        }),
      "telemetry_content_forbidden",
    );
  });

  it("computes confirmation and override rates without inventing time saved", () => {
    const sink = new InMemoryReviewProductTelemetry();
    sink.record({
      name: "review_completed",
      at: "2026-09-19T00:00:00.000Z",
      findingCount: 2,
      documentCount: 3,
      durationMs: 1200,
    });
    sink.record({
      name: "finding_disposition",
      at: "2026-09-19T00:01:00.000Z",
      action: "accept",
    });
    sink.record({
      name: "finding_disposition",
      at: "2026-09-19T00:02:00.000Z",
      action: "reject",
    });
    const rates = computePilotRates(sink.events);
    expect(rates.engineer_confirmed_finding_rate).toBe(0.5);
    expect(rates.human_override_rate).toBe(0.5);
    expect(rates.review_time_saved).toBeNull();
  });
});
