import { describe, expect, it } from "vitest";
import { ProjectIntelligenceError } from "@rtb/project-intelligence";

describe("Gate L — nested error HTTP contract", () => {
  it("preserves nested code, detail, and correlation ID", () => {
    const requestId = "c2c9803d-8391-469f-9c21-381411a50b72";
    const error = new ProjectIntelligenceError("mapping_conflict", "Conflict requires review", 409, {
      mappingId: "mapping-1",
      requestId,
    });
    expect(error.toEnvelope()).toEqual({
      error: {
        code: "mapping_conflict",
        message: "Conflict requires review",
        details: { mappingId: "mapping-1", requestId },
      },
    });
  });
});
