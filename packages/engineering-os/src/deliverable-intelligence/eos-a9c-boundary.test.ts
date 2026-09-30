import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DELIVERABLE_AI_BOUNDARY, DELIVERABLE_JOB_TYPE } from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A9C boundary", () => {
  it("keeps deliverable maturity as evidence, not a DMS or universal score", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A9C_DELIVERABLE_MATURITY_INTELLIGENCE.md"), "utf8");
    expect(docs).toContain("Deliverable Expectation");
    expect(docs).toContain("purpose-specific");
    expect(docs).toContain("TEST_FIXTURE");
    expect(docs).toContain("waiver");
    expect(docs).not.toMatch(/universal maturity score|83% complete|AI APPROVED/i);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/deliverables/route.ts"), "utf8");
    expect(api).toContain("caller_supplied_maturity_rejected");
    const service = readFileSync(join(ROOT, "packages/engineering-os/src/deliverable-intelligence/service.ts"), "utf8");
    expect(service).toContain("caller_supplied_maturity_rejected");
    expect(service).toContain("TEST_FIXTURE");
    expect(service).not.toMatch(/knowledge_nodes/);
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930110000_eos_a9c_deliverable_maturity.sql"), "utf8");
    expect(sql).toContain("engineering_deliverable_expectations");
    expect(sql).toContain("engineering_deliverable_assessments");
    expect(sql).not.toMatch(/javascript|sql-expression/i);
    expect(DELIVERABLE_JOB_TYPE).toBe("engineering.deliverable.evaluate");
    expect(DELIVERABLE_AI_BOUNDARY.mayApproveDeliverable).toBe(false);
    expect(DELIVERABLE_AI_BOUNDARY.maySetMatureTrue).toBe(false);
  });
});
