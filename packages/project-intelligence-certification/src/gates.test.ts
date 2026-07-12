import { describe, expect, it } from "vitest";
import { PROJECT_INTELLIGENCE_CERTIFICATION_GATES } from "./gates.js";

describe("certification gates", () => {
  it("lists every required gate from A through R for Phase 6C-2 Final", () => {
    expect(PROJECT_INTELLIGENCE_CERTIFICATION_GATES.map(([id]) => id)).toEqual("ABCDEFGHIJKLMNOPQR".split(""));
  });
});
