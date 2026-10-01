import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { WORK_GENERATOR_AI_BOUNDARY, WORK_GENERATOR_PRIVACY } from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A11A boundary", () => {
  it("prepares engineering work without becoming a dashboard, WBS, solver, or Office generator", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A11A_ENGINEERING_WORK_GENERATOR.md"), "utf8");
    expect(docs).toContain("EngineeringWorkTemplate");
    expect(docs).toContain("EngineeringWorkPlan");
    expect(docs).toContain("Managed Repository");
    expect(docs).toContain("A11B");
    expect(docs).toContain("employee productivity");
    expect(docs).not.toMatch(/auto-approve engineering/i);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/work/route.ts"), "utf8");
    expect(api).toContain("generatePlan");
    expect(api).toContain("startPlan");
    expect(api).toContain("caller_supplied_authority_rejected");
    const service = readFileSync(join(ROOT, "packages/engineering-os/src/work-generator/service.ts"), "utf8");
    expect(service).toContain("generatePlan");
    expect(service).not.toMatch(/xlsx|docx|pptx|Aconex connector|new EventBus/i);
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930160000_eos_a11a_engineering_work_generator.sql"), "utf8");
    expect(sql).toContain("engineering_work_plans");
    expect(sql).toContain("engineering_core_workspace_member");
    expect(sql).not.toMatch(/password|service_role_key|BEGIN PRIVATE KEY/i);
    expect(WORK_GENERATOR_AI_BOUNDARY.mayApproveWork).toBe(false);
    expect(WORK_GENERATOR_AI_BOUNDARY.maySelectOptionStudyWinner).toBe(false);
    expect(WORK_GENERATOR_PRIVACY.actualXlsxGeneration).toBe(false);
    expect(WORK_GENERATOR_PRIVACY.realSolverExecution).toBe(false);
    expect(WORK_GENERATOR_PRIVACY.employeeProductivityScoring).toBe("PROHIBITED");
  });
});
