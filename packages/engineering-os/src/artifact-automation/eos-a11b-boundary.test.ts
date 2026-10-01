import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { ARTIFACT_AI_BOUNDARY, ARTIFACT_PRIVACY } from "./types";
import { WORK_GENERATOR_PRIVACY } from "../work-generator/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A11B boundary", () => {
  it("generates Office drafts without becoming a DMS, solver, or approval engine", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A11B_ENGINEERING_ARTIFACT_AUTOMATION.md"), "utf8");
    expect(docs).toContain("EngineeringArtifactTemplate");
    expect(docs).toContain("ArtifactProvenanceManifest");
    expect(docs).toContain("DEFAULT_CAPTURE_POLICY");
    expect(docs).toContain("A11C");
    expect(docs).not.toMatch(/auto-approve engineering/i);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/work/route.ts"), "utf8");
    expect(api).toContain("generateArtifact");
    expect(api).toContain("downloadArtifact");
    expect(api).toContain("caller_supplied_authority_rejected");
    const generator = readFileSync(join(ROOT, "packages/engineering-os/src/work-generator/service.ts"), "utf8");
    expect(generator).not.toMatch(/xlsx|docx|pptx/i);
    expect(WORK_GENERATOR_PRIVACY.actualXlsxGeneration).toBe(false);
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930170000_eos_a11b_engineering_artifact_automation.sql"), "utf8");
    expect(sql).toContain("engineering_generated_artifacts");
    expect(sql).toContain("engineering_artifact_generation_runs");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).not.toMatch(/password|service_role_key|BEGIN PRIVATE KEY/i);
    expect(ARTIFACT_PRIVACY.newDmsCreated).toBe(false);
    expect(ARTIFACT_PRIVACY.newBlobStorageCreated).toBe(false);
    expect(ARTIFACT_AI_BOUNDARY.mayInventFormulas).toBe(false);
    expect(ARTIFACT_PRIVACY.pdfExportStatus).toBe("DEFERRED");
    expect(ARTIFACT_PRIVACY.macrosCreated).toBe(false);
  });
});
