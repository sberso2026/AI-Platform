import { describe, expect, it } from "vitest";
import { createBuildIdentity } from "./build-identity.js";

describe("build identity", () => {
  it("is deterministic for a commit and timestamp", () => {
    expect(createBuildIdentity("abc", "2026-07-12T00:00:00.000Z")).toEqual(createBuildIdentity("abc", "2026-07-12T00:00:00.000Z"));
  });
});
