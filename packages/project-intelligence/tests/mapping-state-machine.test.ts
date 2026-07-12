import { describe, expect, it } from "vitest";
import { canAutoApprove, canTransition, detectConflict } from "../src/domain/mapping-state-machine.js";
import { MappingStatus } from "../src/types/mapping.js";

describe("mapping state machine", () => {
  it("only permits defined transitions", () => {
    expect(canTransition(MappingStatus.Matched, MappingStatus.Approved)).toBe(true);
    expect(canTransition(MappingStatus.Discovered, MappingStatus.Verified)).toBe(false);
  });
  it("requires near-certain confidence for automatic approval", () => {
    expect(canAutoApprove(0.98)).toBe(true);
    expect(canAutoApprove(0.97)).toBe(false);
  });
  it("detects contradictory evidence", () => {
    expect(detectConflict([{ source: "a", field: "code", value: "A" }, { source: "b", field: "code", value: "B" }])).toBe(true);
  });
});
