import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { TOOL_ORCHESTRATION_PRIVACY, DESKTOP_BRIDGE_STATUS } from "./types";
import { WORK_GENERATOR_PRIVACY } from "../work-generator/types";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

describe("EOS-A11C boundary", () => {
  it("orchestrates tools without surveillance, solvers, or a second registry", () => {
    const docs = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_A11C_ENGINEERING_TOOL_ORCHESTRATION.md"), "utf8");
    expect(docs).toContain("EngineeringToolHandoff");
    expect(docs).toContain("BROWSER_DOWNLOAD");
    expect(docs).toContain("Desktop Bridge");
    expect(docs).toContain("DEFAULT_CAPTURE_POLICY");
    expect(docs).toContain("A11D");
    expect(docs).not.toMatch(/keystroke logger/i);
    const api = readFileSync(join(ROOT, "apps/web/src/app/api/engineering/work/route.ts"), "utf8");
    expect(api).toContain("prepareHandoff");
    expect(api).toContain("publishUpdatedArtifact");
    const generator = readFileSync(join(ROOT, "packages/engineering-os/src/work-generator/service.ts"), "utf8");
    expect(generator).not.toMatch(/xlsx|docx|pptx|cmd.exe|shell:/i);
    expect(WORK_GENERATOR_PRIVACY.realSolverExecution).toBe(false);
    expect(TOOL_ORCHESTRATION_PRIVACY.arbitraryExecutableLaunch).toBe(false);
    expect(DESKTOP_BRIDGE_STATUS).toBe("CONTRACT_ONLY");
    const sql = readFileSync(join(ROOT, "supabase/migrations/20260930180000_eos_a11c_engineering_tool_orchestration.sql"), "utf8");
    expect(sql).toContain("engineering_tool_handoffs");
    expect(sql).toContain("token_hash");
    expect(sql).not.toMatch(/password|service_role_key|BEGIN PRIVATE KEY/i);
  });
});
