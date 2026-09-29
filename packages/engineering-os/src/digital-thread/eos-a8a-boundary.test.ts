import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A8A boundary", () => {
  it("does not add a Digital Thread object table, graph store, or universal score", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A8A_ENGINEERING_DIGITAL_THREAD.md"), "utf8");
    expect(docs).toContain("SOURCE OF TRUTH");
    expect(docs).toContain("engineering_object_links");
    expect(docs).toContain("No third graph store");
    expect(docs).toMatch(/No `EngineeringDigitalThreadGraphDatabase`/);
    expect(docs).toMatch(/\*\*No\*\* Engineering Truth Score/);
    const service = readFileSync(join(ROOT, "packages/engineering-os/src/digital-thread/service.ts"), "utf8");
    expect(service).toContain("engineering_object_links");
    expect(service).not.toMatch(/engineering_digital_thread_/);
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930040000_eos_a8a_digital_thread_link_resolve.sql"), "utf8");
    expect(sql).not.toMatch(/CREATE TABLE/);
    expect(sql).toContain("analysis_request");
  });
});
