import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { LIFECYCLE_AI_BOUNDARY, LIFECYCLE_JOB_TYPE } from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A9A boundary", () => {
  it("does not invent a second lifecycle identity, DSL, findings store, or automatic approval", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A9A_LIFECYCLE_INTELLIGENCE_FOUNDATION.md"), "utf8");
    expect(docs).toContain("LIFECYCLE STAGE");
    expect(docs).toContain("GATE READINESS");
    expect(docs).toContain("GATE DECISION");
    expect(docs).toContain("Project Controls");
    expect(docs).toContain("Only an authorized human");
    expect(docs).not.toMatch(/AI APPROVED/);
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930090000_eos_a9a_lifecycle_intelligence.sql"), "utf8");
    expect(sql).toContain("engineering_lifecycle_assignments");
    expect(sql).toContain("engineering_lifecycle_transitions");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).not.toMatch(/CREATE TABLE.*engineering_review_finding/i);
    expect(sql).not.toMatch(/javascript|sql-expression/i);
    expect(sql).not.toMatch(/CREATE TABLE.*lifecycle_findings/i);
    const evaluate = readFileSync(join(ROOT, "packages/engineering-os/src/lifecycle-intelligence/evaluate.ts"), "utf8");
    expect(evaluate).not.toMatch(/knowledge_nodes/);
    expect(evaluate).not.toMatch(/new Function|eval\(/);
    expect(LIFECYCLE_JOB_TYPE).toBe("engineering.lifecycle.evaluate");
    expect(LIFECYCLE_AI_BOUNDARY.mayApproveTransition).toBe(false);
  });
});
