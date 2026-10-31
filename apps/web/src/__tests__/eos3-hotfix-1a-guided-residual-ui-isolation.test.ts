import { describe, expect, it, beforeEach } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import {
  engineerFacingExplanation,
  engineerFacingLifecycleLabel,
  EOS_DEFAULT_LIFECYCLE_TEMPLATE_KEY,
  generateGuidedProjectState,
} from "../lib/engineering/eos3-guided-engineering";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");

const PILOT_010_OBJECTIVE =
  "Upgrade an existing process gas compressor package at KGP to increase operating capacity. Assess the existing compressor system and associated facilities, identify the engineering modifications required, and develop the multidisciplinary engineering scope for the upgrade. The assessment should consider the compressor package, structural supports and foundations, piping and nozzle loads, electrical power requirements, instrumentation and controls, existing plant interfaces, constructability, brownfield constraints, operations requirements, and required engineering deliverables.";

const PILOT_010_REASON =
  "The existing compressor system requires increased operating capacity while maintaining safe, reliable and compliant operation of the existing plant. The upgrade must determine whether the existing equipment, structures, foundations, piping, electrical systems and associated interfaces can accommodate the revised operating conditions, and identify modifications required before implementation.";

describe("EOS-3-HOTFIX-1A Guided Engineering Residual UI Isolation", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
  });

  it("change input defaults contain no project/numeric demo facts", () => {
    const panel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/guided-panel.tsx"),
      "utf8",
    );
    expect(panel).not.toMatch(/Vendor increased equipment mass from 12 t to 15 t/);
    expect(panel).not.toMatch(/useState\(\s*["'][^"']*12\s*t/);
    expect(panel).toMatch(/useState\(""\)/);
    expect(panel).toMatch(
      /Describe an actual engineering change, such as revised vendor data, changed operating conditions, or updated site information/,
    );
    expect(panel).not.toMatch(/Install a new 12 t process equipment module/);
    expect(panel.match(/12\s*t|15\s*t|PILOT-001|pilot-001-template/gi) ?? []).toHaveLength(0);
  });

  it("suppresses internal rule identifiers in engineer-facing explanations", () => {
    expect(
      engineerFacingExplanation("EOS_MISSING_EVIDENCE_CREATES_GAP_NOT_FAKE_FACT"),
    ).toMatch(/information gap rather than assuming/i);
    expect(engineerFacingExplanation("EOS_MISSING_EVIDENCE_CREATES_GAP_NOT_FAKE_FACT")).not.toMatch(
      /EOS_MISSING_EVIDENCE/,
    );

    const result = generateGuidedProjectState("PILOT-011-1A", {
      objective: PILOT_010_OBJECTIVE,
      whyNeeded: PILOT_010_REASON,
      ownerId: "eng",
    });
    const engineerFacing = JSON.stringify(
      result.proposals.map((p) => ({
        why: engineerFacingExplanation(p.whySuggested),
        summary: p.summary,
        title: p.title,
      })),
    );
    expect(engineerFacing.match(/EOS_[A-Z0-9_]{6,}/g) ?? []).toHaveLength(0);
    expect(result.proposals.every((p) => !/^EOS_[A-Z0-9_]+$/.test(p.whySuggested.trim()))).toBe(
      true,
    );
  });

  it("keeps unknown loads as information gaps — no auto assumption prompt in UI", () => {
    const panel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/guided-panel.tsx"),
      "utf8",
    );
    expect(panel).not.toMatch(/Record this as an assumption/);
    expect(panel).not.toMatch(/Record as assumption/);
    expect(panel).toMatch(/guided-information-gap-panel/);
    expect(panel).toMatch(/information gap rather than inventing an assumption/i);

    const result = generateGuidedProjectState("PILOT-011-GAP", {
      objective: PILOT_010_OBJECTIVE,
      whyNeeded: PILOT_010_REASON,
      ownerId: "eng",
    });
    expect(result.informationGaps.some((g) => /Vendor-confirmed operating/i.test(g))).toBe(true);
    expect(result.proposals.some((p) => /ASM-DYNAMIC|assumed pending vendor/i.test(p.title + p.summary))).toBe(
      false,
    );
  });

  it("maps lifecycle template key to engineer-facing label", () => {
    expect(EOS_DEFAULT_LIFECYCLE_TEMPLATE_KEY).toBe("pilot-default-p0-g6");
    expect(engineerFacingLifecycleLabel("pilot-default-p0-g6")).toBe(
      "Opportunity / Concept Definition",
    );
    expect(engineerFacingLifecycleLabel(EOS_DEFAULT_LIFECYCLE_TEMPLATE_KEY)).not.toMatch(
      /pilot-default-p0-g6/,
    );

    const result = generateGuidedProjectState("PILOT-011-LC", {
      objective: PILOT_010_OBJECTIVE,
      ownerId: "eng",
    });
    expect(result.setup.lifecycleTemplate).toBe("pilot-default-p0-g6");
    expect(engineerFacingLifecycleLabel(result.setup.lifecycleTemplate)).toBe(
      "Opportunity / Concept Definition",
    );

    const panel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/guided-panel.tsx"),
      "utf8",
    );
    expect(panel).toMatch(/engineerFacingLifecycleLabel/);
    expect(panel).not.toMatch(/value=\{generation\.setup\.lifecycleTemplate/);
  });

  it("labels jurisdiction provenance accurately for KGP inference", () => {
    const result = generateGuidedProjectState("PILOT-011-JUR", {
      objective: PILOT_010_OBJECTIVE,
      whyNeeded: PILOT_010_REASON,
      ownerId: "eng",
    });
    const jur = result.proposals.find((p) => p.stableObjectId.includes("jurisdiction"));
    const why =
      jur?.whySuggested ??
      result.proposals.find((p) => /jurisdiction/i.test(p.title + p.summary))?.whySuggested ??
      "";
    // PROFILE-jurisdiction.country
    const profile = result.proposals.find((p) => /jurisdiction\.country/i.test(p.stableObjectId));
    expect(profile?.summary ?? profile?.whySuggested).toBeTruthy();
    const text = `${profile?.summary ?? ""} ${profile?.whySuggested ?? ""} ${why}`;
    expect(text).toMatch(/inferred from current project context/i);
    expect(text).not.toMatch(/Explicit geography in current project input/i);

    const explicit = generateGuidedProjectState("PILOT-AU-EXPLICIT", {
      objective: "Brownfield upgrade in Australia for process facilities.",
      ownerId: "eng",
    });
    const ex = explicit.proposals.find((p) => /jurisdiction\.country/i.test(p.stableObjectId));
    expect(`${ex?.whySuggested}`).toMatch(/Explicit geography/i);
  });

  it("scopes standards as structural candidates only", () => {
    const result = generateGuidedProjectState("PILOT-011-STD", {
      objective: PILOT_010_OBJECTIVE,
      whyNeeded: PILOT_010_REASON,
      ownerId: "eng",
    });
    const std = result.proposals.find((p) => /standards/i.test(p.stableObjectId));
    expect(std?.summary ?? "").toMatch(/Structural candidate standards/i);
    expect(std?.summary ?? "").not.toMatch(/^AS\/NZS 1170, AS 4100$/);
  });

  it("preserves Hotfix-1 isolation behaviour", () => {
    const result = generateGuidedProjectState("PILOT-011-REG", {
      objective: PILOT_010_OBJECTIVE,
      whyNeeded: PILOT_010_REASON,
      ownerId: "eng",
    });
    expect(result.projectClassification).toMatch(/Brownfield Process Plant Upgrade/i);
    expect(result.primarySystem).toMatch(/Process Gas Compression/i);
    for (const d of [
      "Process",
      "Mechanical",
      "Piping",
      "Electrical",
      "Instrumentation & Controls",
      "Structural",
      "Civil",
    ]) {
      expect(result.candidateDisciplines).toContain(d);
    }
    expect(result.options).toHaveLength(0);
    expect(result.prematureCalculationCount).toBe(0);
    expect(result.prematureDecisionCount).toBe(0);
    expect(JSON.stringify(result).match(/PILOT-001|pilot-001-template|12\s*t\s*→\s*15\s*t/gi) ?? []).toHaveLength(
      0,
    );
  });

  it("records Hotfix-1A docs", () => {
    expect(existsSync(resolve(DOCS, "EOS_3_HOTFIX_1A_GUIDED_RESIDUAL_UI_ISOLATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_HOTFIX_1A_MANIFEST.json"))).toBe(true);
  });

  it("keeps Guided bulk-accept button text readable (WCAG AA contrast classes)", () => {
    const panel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/guided-panel.tsx"),
      "utf8",
    );
    const bulkIdx = panel.indexOf('data-testid="guided-bulk-accept-safe"');
    expect(bulkIdx).toBeGreaterThan(-1);
    const snippet = panel.slice(Math.max(0, bulkIdx - 120), bulkIdx + 900);
    expect(snippet).toContain("Bulk accept low-risk administrative proposals only");
    expect(snippet).toContain("onClick={() => void bulkSafe()}");
    expect(snippet).toContain("bg-slate-100");
    expect(snippet).toContain("text-slate-900");
    expect(snippet).toContain("hover:bg-white");
    expect(snippet).toContain("hover:text-slate-950");
    expect(snippet).toContain("active:bg-slate-200");
    expect(snippet).toContain("focus-visible:ring-amber-300");
    expect(snippet).toContain("disabled:bg-slate-700");
    expect(snippet).toContain("disabled:text-slate-100");
    expect(snippet).toContain("disabled:opacity-100");
    expect(snippet).not.toContain("disabled:opacity-50");
  });
});
