import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { INFORMATION_AI_BOUNDARY } from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A10A boundary", () => {
  it("keeps Information Intelligence as a reference domain, not a DMS or search engine", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A10A_ENGINEERING_INFORMATION_INTELLIGENCE_FOUNDATION.md"), "utf8");
    expect(docs).toContain("Engineering Information");
    expect(docs).toContain("AUTHORITATIVE_FOR_PURPOSE");
    expect(docs).toContain("does not own engineering truth");
    expect(docs).not.toMatch(/AI APPROVED|universal source precedence|SharePoint = authoritative/i);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/information/route.ts"), "utf8");
    expect(api).toContain("caller_supplied_authority_rejected");
    expect(api).toContain("savePolicy");
    const service = readFileSync(join(ROOT, "packages/engineering-os/src/information-intelligence/service.ts"), "utf8");
    expect(service).not.toMatch(/knowledge_nodes/);
    expect(service).toContain("rejectCallerClaims");
    expect(service).toContain("CALLER_SUPPLIED_AUTHORITY_KEYS");
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930130000_eos_a10a_engineering_information_intelligence.sql"), "utf8");
    expect(sql).toContain("engineering_information_refs");
    expect(sql).toContain("engineering_information_authority_policies");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(sql).not.toMatch(/javascript|sql-expression/i);
    expect(INFORMATION_AI_BOUNDARY.maySelectAuthoritativeSource).toBe(false);
    expect(INFORMATION_AI_BOUNDARY.mayApproveInformation).toBe(false);
  });
});
