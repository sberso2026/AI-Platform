import { describe, expect, it } from "vitest";
import { projectIntelligenceEventId } from "../src/events/project-intelligence-events.js";

describe("event idempotency", () => {
  it("creates stable identifiers from the operation identity", () => {
    const input = { eventType: "project_intelligence.mapping.approved" as const, mappingId: "m1", operationId: "o1" };
    expect(projectIntelligenceEventId(input)).toBe(projectIntelligenceEventId(input));
  });
});
