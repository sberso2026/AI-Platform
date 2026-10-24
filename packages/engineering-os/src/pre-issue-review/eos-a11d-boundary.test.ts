import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PRE_ISSUE_AI_BOUNDARY, PRE_ISSUE_PRIVACY, FORBIDDEN_PRE_ISSUE_VERDICTS } from "./types";
import { WORK_GENERATOR_PRIVACY } from "../work-generator/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A11D boundary", () => {
  it("reuses Engineering Review without a second engine, binaries, or autonomous approval", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A11D_AUTOMATED_ENGINEERING_REVIEW_PRE_ISSUE.md"), "utf8");
    expect(docs).toContain("Pre-Issue Review");
    expect(docs).toContain("Engineering Review");
    expect(docs).toContain("A11D_BINARY_DUPLICATION = NO");
    expect(docs).toContain("DEFAULT_CAPTURE_POLICY");
    expect(docs).toContain("A11E");
    expect(docs).toContain("Never returned: `DESIGN_APPROVED`");
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/work/route.ts"), "utf8");
    expect(api).toContain("runPreIssueReview");
    expect(api).toContain("preIssueReview");
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930190000_eos_a11d_pre_issue_engineering_review.sql"), "utf8");
    expect(sql).toContain("engineering_pre_issue_reviews");
    expect(sql).not.toContain("content_base64");
    expect(sql).not.toMatch(/password|service_role_key|BEGIN PRIVATE KEY/i);
    expect(PRE_ISSUE_PRIVACY.newReviewEngineCreated).toBe(false);
    expect(PRE_ISSUE_PRIVACY.binaryDuplication).toBe("NO");
    expect(PRE_ISSUE_AI_BOUNDARY.autonomousApproval).toBe(false);
    expect(WORK_GENERATOR_PRIVACY.realSolverExecution).toBe(false);
    for (const verdict of FORBIDDEN_PRE_ISSUE_VERDICTS) {
      expect(docs).not.toContain(`return ${verdict}`);
    }
  });
});
