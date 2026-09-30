import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ASSURANCE_JOB_TYPE, AI_ASSURANCE_BOUNDARY } from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A8C boundary", () => {
  it("persists conditions without becoming findings, issues, KG authority, or a new graph/queue/bus", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A8C_ENGINEERING_ASSURANCE_INTELLIGENCE.md"), "utf8");
    expect(docs).toContain("ASSURANCE CONDITION");
    expect(docs).toContain("not a Review Finding");
    expect(docs).toContain("not an Issue");
    expect(docs).toContain("canonical relational");
    expect(docs).toContain("Platform KG is not assurance authority");
    expect(docs).not.toMatch(/Engineering Assurance Score/);
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930070000_eos_a8c_engineering_assurance_conditions.sql"), "utf8");
    expect(sql).toContain("engineering_assurance_conditions");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).not.toMatch(/CREATE TABLE.*knowledge_/i);
    expect(sql).not.toMatch(/CREATE TABLE.*engineering_issue/i);
    expect(sql).not.toMatch(/CREATE TABLE.*engineering_review_finding/i);
    const evaluate = readFileSync(join(ROOT, "packages/engineering-os/src/assurance/evaluate.ts"), "utf8");
    expect(evaluate).not.toMatch(/knowledge_nodes/);
    expect(evaluate).not.toMatch(/projectedTrace/);
    expect(ASSURANCE_JOB_TYPE).toBe("engineering.assurance.evaluate");
    expect(AI_ASSURANCE_BOUNDARY.mayCreateAuthoritativeConditions).toBe(false);
  });
});
