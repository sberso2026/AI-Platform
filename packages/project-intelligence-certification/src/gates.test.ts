import { describe, expect, it } from "vitest";
import { PROJECT_INTELLIGENCE_CERTIFICATION_GATES } from "./gates.js";

describe("certification gates", () => {
  it("lists every required gate from A through Q for Phase 6C-2", () => {
    expect(PROJECT_INTELLIGENCE_CERTIFICATION_GATES.map(([id]) => id)).toEqual("ABCDEFGHIJKLMNOPQ".split(""));
  });
});
