import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("BOS-7 action linkage", () => {
  it("reuses business_os_actions via a bounded association table", () => {
    const sql = readFileSync(
      resolve(import.meta.dirname, "../../../../supabase/migrations/20260819120000_batch_103_business_os_work_operations.sql"),
      "utf8",
    );
    expect(sql).toContain("business_os_work_action_links");
    expect(sql).toContain("REFERENCES business_os_actions(id)");
    expect(sql.toLowerCase()).not.toContain("create table if not exists business_os_tasks");
    expect(sql.toLowerCase()).not.toContain("create table if not exists business_os_work_tasks");
    const service = readFileSync(resolve(import.meta.dirname, "service.ts"), "utf8");
    expect(service).toContain("reusesBos1Actions");
  });
});
