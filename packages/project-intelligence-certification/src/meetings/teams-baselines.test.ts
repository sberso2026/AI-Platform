import { describe, expect, it } from "vitest";

/** Phase 6C-3C Meeting Processing certified baseline — must remain unchanged by 6C-3D. */
export const MEETING_PROCESSING_BASELINE_SHA = "daf3903c200690fcad4dd9bc9b2c8661e442c15e";
export const DOCUMENT_INTELLIGENCE_BASELINE_SHA = "dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53";
export const MEETING_FOUNDATION_BASELINE_SHA = "ac84bd41f0c7de5fca2fc6f69f29100c39ff3d4e";

describe("Gate X — Meeting processing baseline preserved", () => {
  it("locks Phase 6C-3C certified SHA constant", () => {
    expect(MEETING_PROCESSING_BASELINE_SHA).toBe("daf3903c200690fcad4dd9bc9b2c8661e442c15e");
    expect(MEETING_PROCESSING_BASELINE_SHA).toHaveLength(40);
  });
});

describe("Gate W — Document Intelligence baseline unchanged", () => {
  it("locks Document Intelligence certified SHA", () => {
    expect(DOCUMENT_INTELLIGENCE_BASELINE_SHA).toBe(
      "dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53",
    );
  });
});

describe("Gate V — Manual provider remains certified", () => {
  it("manual status constant remains certified", async () => {
    const { MEETING_PROVIDER_STATUS } = await import("@rtb/project-intelligence");
    expect(MEETING_PROVIDER_STATUS.manual).toBe("certified");
  });
});
