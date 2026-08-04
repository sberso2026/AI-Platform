import { describe, expect, it } from "vitest";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd(), "../..");
const WORKFLOW = resolve(
  ROOT,
  ".github/workflows/project-intelligence-phase-6c3e-live-teams-provider-certification.yml",
);
const SCRIPTS_DIR = resolve(process.cwd(), "scripts");

const REQUIRED_PROBE_SCRIPTS = [
  "probe-teams-live-graph-auth.ts",
  "probe-teams-live-permission.ts",
  "probe-teams-live-subscription.ts",
  "probe-teams-live-meeting-discovery.ts",
  "probe-teams-live-transcript.ts",
  "run-teams-live-provider-certification.ts",
] as const;

describe("Phase 6C-3E live Teams workflow execution hygiene", () => {
  const workflow = readFileSync(WORKFLOW, "utf8");

  it("does not use tsx -e with top-level await (CJS eval defect)", () => {
    const inlineEvalBlocks = [...workflow.matchAll(/tsx\s+-e\s+"([\s\S]*?)"/g)];
    for (const match of inlineEvalBlocks) {
      const body = match[1] ?? "";
      expect(
        /\bawait\b/.test(body),
        `tsx -e block must not contain top-level await:\n${body.slice(0, 200)}`,
      ).toBe(false);
    }
    // Prefer zero inline evals for live probes
    expect(workflow).not.toMatch(/exec tsx -e/);
  });

  it("does not invoke root-level pnpm tsx (package-local exec required)", () => {
    expect(workflow).not.toMatch(/(^|\n)\s*pnpm tsx\b/);
    expect(workflow).not.toMatch(/\bpnpm exec tsx\b/);
  });

  it("references only existing package-local probe scripts", () => {
    const refs = [...workflow.matchAll(/exec tsx scripts\/([A-Za-z0-9._-]+\.ts)/g)].map(
      (m) => m[1],
    );
    expect(refs.length).toBeGreaterThan(0);
    for (const name of refs) {
      expect(existsSync(resolve(SCRIPTS_DIR, name)), `missing scripts/${name}`).toBe(true);
    }
  });

  it("keeps required live probe scripts with failing async main entry points", () => {
    for (const name of REQUIRED_PROBE_SCRIPTS) {
      const path = resolve(SCRIPTS_DIR, name);
      expect(existsSync(path), `missing ${name}`).toBe(true);
      const src = readFileSync(path, "utf8");
      expect(src).toMatch(/async function main\s*\(\s*\):\s*Promise<\s*void\s*>/);
      expect(src).toMatch(/main\(\)\s*\.catch\s*\(/);
      expect(src).toMatch(/process\.exit\(1\)/);
    }
  });

  it("lists expected probe script filenames in the package scripts directory", () => {
    const files = new Set(readdirSync(SCRIPTS_DIR));
    for (const name of REQUIRED_PROBE_SCRIPTS) {
      expect(files.has(name)).toBe(true);
    }
  });
});
