import { describe, expect, it } from "vitest";
import { ProjectIntelligenceAIAdapter } from "../src/adapters/ai-adapter.js";

describe("AI proof abstention", () => {
  it("does not invoke the director without enough evidence", async () => {
    const adapter = new ProjectIntelligenceAIAdapter({ summarize: async () => { throw new Error("must not run"); } });
    await expect(adapter.summarizeMappedProjectState([{ source: "project", excerpt: "one", confidence: 0.9 }], "c1"))
      .resolves.toMatchObject({ abstained: true, reason: "insufficient_evidence" });
  });
});
