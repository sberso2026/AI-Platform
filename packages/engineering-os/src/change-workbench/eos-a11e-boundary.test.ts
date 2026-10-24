import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { CHANGE_WORKBENCH_AI_BOUNDARY, CHANGE_WORKBENCH_PRIVACY, FORBIDDEN_IMPACT_ASSESSMENT_STATES } from "./types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A11E boundary", () => {
  it("reuses Change/Impact/Optimization/Decision/Review without binaries or autonomous approval", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A11E_CHANGE_IMPACT_OPTION_CONSTRUCTION_WORKBENCH.md"), "utf8");
    expect(docs).toContain("EngineeringImpactAssessment");
    expect(docs).toContain("POTENTIAL_IMPACT");
    expect(docs).toContain("CONFIRMED_IMPACT");
    expect(docs).toContain("RELATED is not AFFECTED");
    expect(docs).toContain("A11E_BINARY_DUPLICATION = NO");
    expect(docs).toContain("A12A");
    expect(docs).toContain("canonical Change");
    expect(docs).toContain("DEFAULT_CAPTURE_POLICY");
    expect(docs).not.toContain("EngineeringChangeV2");
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/work/route.ts"), "utf8");
    expect(api).toContain("assessChange");
    expect(api).toContain("changeWorkbench");
    expect(api).toContain('authorizeEngineeringSegment(ctx, "work", "GET"');
    expect(api).toContain("getPlan(readCommerce");
    expect(api).toContain("assertCanonicalWorkPlanOwnership");
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930200000_eos_a11e_change_impact_option_construction.sql"), "utf8");
    expect(sql).toContain("engineering_impact_assessments");
    expect(sql).not.toContain("content_base64");
    expect(sql).not.toMatch(/password|service_role_key|BEGIN PRIVATE KEY/i);
    expect(sql).not.toMatch(/CREATE TABLE IF NOT EXISTS engineering_changes /i);
    expect(CHANGE_WORKBENCH_PRIVACY.binaryDuplication).toBe("NO");
    expect(CHANGE_WORKBENCH_AI_BOUNDARY.mayConfirmImpact).toBe(false);
    expect(CHANGE_WORKBENCH_AI_BOUNDARY.mayChooseOption).toBe(false);
    expect(CHANGE_WORKBENCH_AI_BOUNDARY.autonomousChangeApproval).toBe(false);
    expect(FORBIDDEN_IMPACT_ASSESSMENT_STATES).toEqual(expect.arrayContaining(["APPROVED_DESIGN", "SAFE", "IFC_READY"]));
  });
});
