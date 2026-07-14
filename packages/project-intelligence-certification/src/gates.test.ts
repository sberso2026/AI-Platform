import { describe, expect, it } from "vitest";
import {
  PROJECT_INTELLIGENCE_CERTIFICATION_GATES,
  PROJECT_INTELLIGENCE_MEETING_FOUNDATION_CERTIFICATION_GATES,
  PROJECT_INTELLIGENCE_MEETING_PROCESSING_CERTIFICATION_GATES,
  PROJECT_INTELLIGENCE_PROVIDER_CERTIFICATION_GATES,
  PROJECT_INTELLIGENCE_TEAMS_PROVIDER_CERTIFICATION_GATES,
} from "./gates.js";

describe("certification gates", () => {
  it("lists every required gate from A through R for Phase 6C-2 Final", () => {
    expect(PROJECT_INTELLIGENCE_CERTIFICATION_GATES.map(([id]) => id)).toEqual("ABCDEFGHIJKLMNOPQR".split(""));
  });

  it("lists every required gate from A through R for provider closure", () => {
    expect(PROJECT_INTELLIGENCE_PROVIDER_CERTIFICATION_GATES.map(([id]) => id)).toEqual("ABCDEFGHIJKLMNOPQR".split(""));
  });

  it("lists every required gate from A through S for Meeting Intelligence foundation", () => {
    expect(PROJECT_INTELLIGENCE_MEETING_FOUNDATION_CERTIFICATION_GATES.map(([id]) => id)).toEqual(
      "ABCDEFGHIJKLMNOPQRS".split(""),
    );
    expect(PROJECT_INTELLIGENCE_MEETING_FOUNDATION_CERTIFICATION_GATES).toHaveLength(19);
  });

  it("lists every required gate from A through W for Meeting Intelligence processing", () => {
    expect(PROJECT_INTELLIGENCE_MEETING_PROCESSING_CERTIFICATION_GATES.map(([id]) => id)).toEqual(
      "ABCDEFGHIJKLMNOPQRSTUVW".split(""),
    );
    expect(PROJECT_INTELLIGENCE_MEETING_PROCESSING_CERTIFICATION_GATES).toHaveLength(23);
  });

  it("lists every required gate from A through X for Teams provider certification", () => {
    expect(PROJECT_INTELLIGENCE_TEAMS_PROVIDER_CERTIFICATION_GATES.map(([id]) => id)).toEqual(
      "ABCDEFGHIJKLMNOPQRSTUVWX".split(""),
    );
    expect(PROJECT_INTELLIGENCE_TEAMS_PROVIDER_CERTIFICATION_GATES).toHaveLength(24);
  });
});
