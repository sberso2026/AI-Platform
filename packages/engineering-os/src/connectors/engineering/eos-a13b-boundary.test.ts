import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ENGINEERING_CONNECTOR_PRIVACY, ENGINEERING_CONNECTOR_RECON } from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../../..");

describe("EOS-A13B boundary", () => {
  it("documents Feature Freeze, source ownership, and live-not-tested vendor honesty", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A13B_ENGINEERING_EDMS_CONSTRUCTION_CONNECTORS.md"), "utf8");
    expect(docs).toContain("FEATURE_FREEZE");
    expect(docs).toContain("A13B_BINARY_DUPLICATION = NO");
    expect(docs).toContain("LIVE_ACONEX_CONNECTION = NOT_TESTED");
    expect(docs).toContain("schedule 100%");
    expect(docs).toContain("DEFAULT_CAPTURE_POLICY = DENY");
    expect(docs).not.toContain("EngineeringChangeV2");
    const sql = readFileSync(join(ROOT, "supabase/migrations/20261001190000_eos_a13b_engineering_edms_construction_connectors.sql"), "utf8");
    expect(sql).toContain("engineering_external_connections");
    expect(sql).not.toContain("content_base64");
    expect(sql).not.toMatch(/password|service_role_key|BEGIN PRIVATE KEY/i);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/work/route.ts"), "utf8");
    expect(api).toContain("engineeringConnector");
    expect(ENGINEERING_CONNECTOR_RECON.newDms).toBe(false);
    expect(ENGINEERING_CONNECTOR_PRIVACY.newContentBase64Usage).toBe(false);
  });
});
