import { describe, expect, it, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import { generateGuidedProjectState } from "../lib/engineering/eos3-guided-engineering";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");

const PILOT_010_OBJECTIVE =
  "Upgrade an existing process gas compressor package at KGP to increase operating capacity. Assess the existing compressor system and associated facilities, identify the engineering modifications required, and develop the multidisciplinary engineering scope for the upgrade. The assessment should consider the compressor package, structural supports and foundations, piping and nozzle loads, electrical power requirements, instrumentation and controls, existing plant interfaces, constructability, brownfield constraints, operations requirements, and required engineering deliverables.";

const PILOT_010_REASON =
  "The existing compressor system requires increased operating capacity while maintaining safe, reliable and compliant operation of the existing plant. The upgrade must determine whether the existing equipment, structures, foundations, piping, electrical systems and associated interfaces can accommodate the revised operating conditions, and identify modifications required before implementation.";

function read(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-3-HOTFIX-1B Guided Engineering Interaction Freeze", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
  });

  it("clears transient loading locks with finally / unmount and avoids page-wide pointer lock", () => {
    const panel = read("src/components/engineering/project-workspace/guided-panel.tsx");
    expect(panel).toContain('data-guided-page-wide-pointer-lock="false"');
    expect(panel).toContain('data-guided-interaction="ready"');
    expect(panel.match(/(?<!disabled:)pointer-events-none/g) ?? []).toHaveLength(0);
    expect(panel).toContain("setPreparing(false)");
    expect(panel).toContain("setCapturing(false)");
    expect(panel).toContain("mountedRef.current = false");
    expect(panel).toContain("finally");
    // Local locks only — prepare does not disable accept/reject
    expect(panel).toContain("disabled={preparing || !objective.trim()}");
    expect(panel).toContain("disabled={capturing || !utterance.trim()}");
    expect(panel).not.toContain("disabled={busy");
  });

  it("recovers from failed requests without leaving a freeze overlay", () => {
    const panel = read("src/components/engineering/project-workspace/guided-panel.tsx");
    expect(panel).toContain('data-testid="guided-error"');
    expect(panel).toMatch(/Generation failed|Change capture failed|Bulk accept failed/);
    expect(panel).not.toMatch(/fixed inset-0/);
    expect(panel).not.toMatch(/aria-busy=\{preparing \|\| capturing\}/);
  });

  it("unsaved modal never remains an invisible interaction blocker", () => {
    const guard = read(
      "src/components/engineering/project-workspace/unsaved-changes-guard.tsx",
    );
    expect(guard).toContain('data-testid="unsaved-changes-modal-backdrop"');
    expect(guard).toMatch(/bg-slate-950\/80/);
    expect(guard).toMatch(/border-2 border-amber-400/);
    expect(guard).toMatch(/bg-slate-100/);
    expect(guard).toMatch(/finally\s*\{[\s\S]*setSaving\(false\)/);
    expect(guard).toContain("disabled={false}");
    expect(guard).toContain('data-testid="unsaved-keep-editing"');
    expect(guard).toMatch(/No save handler is available/);
  });

  it("clears orphan Setup dirty locks on unmount and Guided mount", () => {
    const setup = read("src/components/engineering/project-workspace/setup-panel.tsx");
    expect(setup).toMatch(/return \(\) => \{[\s\S]*setDirty\(false\)/);
    const panel = read("src/components/engineering/project-workspace/guided-panel.tsx");
    expect(panel).toMatch(/setDirty\(false\)/);
    expect(panel).toContain("useUnsavedChangesGuard");
  });

  it("keeps main and sidebar scroll containers independent", () => {
    const shell = read("src/components/engineering/project-workspace/shell.tsx");
    expect(shell).toContain('data-testid="project-workspace-content-scroll"');
    expect(shell).toContain("overflow-y-auto");
    expect(shell).toContain('data-testid="project-workspace-nav-scroll"');
    expect(shell).toMatch(/project-workspace-nav-scroll[\s\S]*overflow-y-auto/);
  });

  it("keeps form controls and step return interactive", () => {
    const panel = read("src/components/engineering/project-workspace/guided-panel.tsx");
    expect(panel).toContain('data-testid="guided-objective-input"');
    expect(panel).toContain('data-testid="guided-prepare-definition"');
    expect(panel).toContain('data-testid="guided-return-step-1"');
    expect(panel).toContain('data-testid="guided-capture-change"');
    expect(panel).toContain("Accept draft");
    expect(panel).toContain("Reject");
    expect(panel).toMatch(/disabled:text-slate-100/);
    expect(panel).toMatch(/disabled:opacity-100/);
  });

  it("preserves Hotfix-1 / 1A inference isolation regression", () => {
    const result = generateGuidedProjectState("PILOT-011-1B", {
      objective: PILOT_010_OBJECTIVE,
      whyNeeded: PILOT_010_REASON,
      ownerId: "eng",
    });
    expect(result.projectClassification).toMatch(/Brownfield Process Plant Upgrade/i);
    expect(result.primarySystem).toMatch(/Process Gas Compression/i);
    expect(result.candidateDisciplines).toEqual(
      expect.arrayContaining([
        "Process",
        "Mechanical",
        "Piping",
        "Electrical",
        "Instrumentation & Controls",
        "Structural",
        "Civil",
      ]),
    );
    expect(result.options).toHaveLength(0);
    expect(result.prematureCalculationCount).toBe(0);
    expect(result.prematureDecisionCount).toBe(0);
    expect(result.informationGaps.some((g) => /Vendor-confirmed operating/i.test(g))).toBe(true);
    expect(
      JSON.stringify(result).match(/PILOT-001|pilot-001-template|12\s*t\s*→\s*15\s*t/gi) ?? [],
    ).toHaveLength(0);
  });

  it("records Hotfix-1B docs", () => {
    expect(existsSync(resolve(DOCS, "EOS_3_HOTFIX_1B_GUIDED_INTERACTION_FREEZE.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_HOTFIX_1B_MANIFEST.json"))).toBe(true);
  });
});
