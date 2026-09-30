import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { AI_ASSURANCE_BOUNDARY } from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A8D boundary", () => {
  it("governs Review composition and rule enablement without merging Review or inventing a DSL", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A8D_ASSURANCE_GOVERNANCE_REVIEW.md"), "utf8");
    expect(docs).toContain("ASSURANCE CONDITION");
    expect(docs).toContain("not a Review Finding");
    expect(docs).toContain("not an Issue");
    expect(docs).toContain("RULE_DISABLED");
    expect(docs).toContain("ENGINEERING_STATE_RESOLVED");
    expect(docs).toContain("PARTIAL");
    expect(docs).toContain("Platform KG is not assurance authority");
    expect(docs).not.toMatch(/Engineering Assurance Score/);
    const service = readFileSync(join(ROOT, "packages/engineering-os/src/assurance/service.ts"), "utf8");
    expect(service).toContain("createReviewFromCondition");
    expect(service).toContain("automaticFinding");
    expect(service).not.toMatch(/TrustedReviewService/);
    const evaluate = readFileSync(join(ROOT, "packages/engineering-os/src/assurance/evaluate.ts"), "utf8");
    expect(evaluate).not.toMatch(/knowledge_nodes/);
    expect(AI_ASSURANCE_BOUNDARY.mayCreateAuthoritativeConditions).toBe(false);
  });
});
