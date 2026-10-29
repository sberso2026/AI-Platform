import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A9B boundary", () => {
  it("keeps harvest server-authoritative and schedule non-authoritative", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A9B_LIFECYCLE_EVIDENCE_AND_PROJECT_CONTROLS.md"), "utf8");
    expect(docs).toContain("Canonical Evidence Harvester");
    expect(docs).toContain("TEST_FIXTURE");
    expect(docs).toContain("caller-supplied");
    expect(docs).toContain("Project Controls");
    expect(docs).not.toMatch(/AI APPROVED/);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/lifecycle/route.ts"), "utf8");
    expect(api).toContain("caller_supplied_evidence_rejected");
    expect(api).not.toMatch(/evidence_required/);
    const service = readFileSync(join(ROOT, "packages/engineering-os/src/lifecycle-intelligence/service.ts"), "utf8");
    expect(service).toContain("caller_supplied_evidence_rejected");
    expect(service).toContain("TEST_FIXTURE");
    expect(service).not.toMatch(/knowledge_nodes/);
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930100000_eos_a9b_lifecycle_evidence_and_schedule.sql"), "utf8");
    expect(sql).toContain("engineering_lifecycle_schedule_mappings");
    expect(sql).not.toMatch(/javascript|sql-expression/i);
  });
});
