import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { INFORMATION_REQUIREMENT_AI_BOUNDARY } from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A10C boundary", () => {
  it("keeps information requirements action-oriented without a new document store or Event Bus", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A10C_INFORMATION_REQUIREMENTS_EXCHANGE_HANDOVER.md"), "utf8");
    expect(docs).toContain("Information Requirement vs Engineering Requirement");
    expect(docs).toContain("RECEIVED is not ACCEPTED_FOR_PURPOSE");
    expect(docs).toContain("Managed repository boundary");
    expect(docs).toContain("A11A");
    expect(docs).toContain("no universal completeness percentage");
    expect(docs).not.toMatch(/auto-approval of handover/i);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/information-requirements/route.ts"), "utf8");
    expect(api).toContain("caller_supplied_authority_rejected");
    expect(api).toContain("resolveWorkReadiness");
    const service = readFileSync(join(ROOT, "packages/engineering-os/src/information-requirements/service.ts"), "utf8");
    expect(service).toContain("getRequiredInformationForWork");
    expect(service).not.toMatch(/CREATE TABLE.*documents|new EventBus|Aconex connector/i);
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930150000_eos_a10c_information_requirements_handover.sql"), "utf8");
    expect(sql).toContain("engineering_information_requirements");
    expect(sql).toContain("engineering_handover_packages");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).not.toMatch(/password|service_role_key|BEGIN PRIVATE KEY/i);
    expect(INFORMATION_REQUIREMENT_AI_BOUNDARY.mayAcceptHandover).toBe(false);
    expect(INFORMATION_REQUIREMENT_AI_BOUNDARY.mayInferTechnicalCorrectness).toBe(false);
  });
});
