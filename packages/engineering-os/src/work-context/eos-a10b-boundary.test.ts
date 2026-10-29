import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { WORK_CONTEXT_AI_BOUNDARY, WORK_CONTEXT_PRIVACY } from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A10B boundary", () => {
  it("tracks engineering work without desktop surveillance or a new Event Bus", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A10B_ENGINEERING_WORK_CONTEXT_INFORMATION_FLOW.md"), "utf8");
    expect(docs).toContain("Managed Engineering Repository");
    expect(docs).toContain("DEFAULT_CAPTURE_POLICY = DENY");
    expect(docs).toContain("ENGINEERING WORK");
    expect(docs).toContain("employee productivity scoring");
    expect(docs).toContain("No desktop surveillance agent");
    expect(docs).not.toMatch(/keystroke logger/i);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/work/route.ts"), "utf8");
    expect(api).toContain("caller_supplied_authority_rejected");
    expect(api).toContain("saveRepository");
    const service = readFileSync(join(ROOT, "packages/engineering-os/src/work-context/service.ts"), "utf8");
    expect(service).not.toMatch(/CREATE TABLE.*events|new EventBus|keystroke/i);
    expect(service).toContain("kernelWorkEventEnvelope");
    const types = readFileSync(join(ROOT, "packages/engineering-os/src/work-context/types.ts"), "utf8");
    expect(types).toContain("engineering.work.event");
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930140000_eos_a10b_engineering_work_context.sql"), "utf8");
    expect(sql).toContain("engineering_managed_repositories");
    expect(sql).toContain("engineering_work_events");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).not.toMatch(/password|service_role_key|BEGIN PRIVATE KEY/i);
    expect(WORK_CONTEXT_PRIVACY.newEventBusCreated).toBe(false);
    expect(WORK_CONTEXT_AI_BOUNDARY.mayMonitorIndependentAiSessions).toBe(false);
    expect(WORK_CONTEXT_AI_BOUNDARY.mayScoreProductivity).toBe(false);
  });
});
