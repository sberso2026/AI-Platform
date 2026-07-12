import { describe, expect, it } from "vitest";
import { PROJECT_INTELLIGENCE_CERTIFICATION_GATES } from "./gates.js";

describe("certification gates", () => {
  it("lists every required gate from A through N", () => {
    expect(PROJECT_INTELLIGENCE_CERTIFICATION_GATES.map(([id]) => id)).toEqual("ABCDEFGHIJKLMN".split(""));
  });
});
