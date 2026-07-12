import { describe, expect, it } from "vitest";
import { ProjectIntelligenceError } from "../src/domain/errors.js";

describe("nested errors", () => {
  it("uses the standard nested error envelope", () => {
    const error = new ProjectIntelligenceError("mapping_conflict", "Conflict", 409, { mappingId: "m1" });
    expect(error.toEnvelope()).toEqual({ error: { code: "mapping_conflict", message: "Conflict", details: { mappingId: "m1" } } });
  });
});
