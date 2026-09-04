import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_SRC = resolve(__dirname, "..");

function read(rel: string): string {
  return readFileSync(resolve(WEB_SRC, rel), "utf8");
}

describe("EOS-PI-UX-1 operational experience", () => {
  it("scrolls PI main content and keeps back / project context in the shell", () => {
    const shell = read("components/engineering/project-intelligence-shell.tsx");
    const platform = read("components/layout/platform-shell.tsx");
    expect(platform).toContain("h-screen");
    expect(platform).toContain("overflow-hidden");
    expect(shell).toContain("overflow-y-auto");
    expect(shell).toContain("project-intelligence-main");
    expect(shell).toContain("pi-shell-back");
    expect(shell).toContain("pi-shell-return");
    expect(read("components/engineering/pi-project-context.tsx")).toContain("pi-project-select");
    expect(shell).toContain("All Projects");
    expect(shell).toContain("Ask Project Intelligence");
    expect(shell).toContain('label: "Overview"');
    expect(shell).toContain('label: "Schedule"');
    expect(shell).toContain('label: "Cost"');
    expect(shell).toContain("Risk & Change");
    expect(shell).toContain('label: "Engineering"');
    expect(shell).toContain('label: "Decisions"');
    expect(shell).toContain('label: "Reports"');
    expect(shell).toContain("Administration / Diagnostics");
  });

  it("does not expose raw project ID entry on the new meeting form", () => {
    const form = read("app/(platform)/engineering/apps/project-intelligence/meetings/new/page.tsx");
    expect(form).toContain("meeting-project-select");
    expect(form).not.toContain("Project ID");
    expect(form).not.toContain("retentionPolicyId");
    expect(form).not.toContain("tenant");
  });

  it("presents overview attention, change, and evidence-linked brief", () => {
    const overview = read("app/(platform)/engineering/apps/project-intelligence/page.tsx");
    const centre = read("components/engineering/project-command-centre.tsx");
    expect(overview).toContain("Project Intelligence Overview");
    expect(centre).toContain("command-centre-attention");
    expect(centre).toContain("Open source");
    expect(centre).toContain("pi-what-changed");
    expect(centre).toContain("pi-project-brief");
    expect(centre).toContain("pi-project-brief-citations");
    expect(centre).not.toContain("sourceReference.entityId");
  });

  it("keeps analyst diagnostics behind Show diagnostics and reuses the existing analyst stack", () => {
    const analyst = read("components/engineering/project-ai-analyst.tsx");
    expect(analyst).toContain("analyst-show-diagnostics");
    expect(analyst).toContain("Answer / Summary");
    expect(analyst).toContain("Why it matters");
    expect(analyst).toContain("Recommended human action");
    expect(analyst).not.toContain("intent_classification");
    expect(analyst).not.toContain("Run pipeline");
    expect(analyst).not.toContain("graph traversal");
    const hosted = read("lib/project-intelligence/ai-project-analyst-service.ts");
    expect(hosted).toContain("kernel.aiDirector.run");
    expect(hosted).not.toContain("new OpenAI");
  });

  it("adds engineering, decisions, and diagnostics routes without a second project model", () => {
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/project-intelligence/engineering/page.tsx"))).toBe(true);
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/project-intelligence/decisions/page.tsx"))).toBe(true);
    expect(existsSync(resolve(WEB_SRC, "app/(platform)/engineering/apps/project-intelligence/diagnostics/page.tsx"))).toBe(true);
    const engineering = read("components/engineering/project-engineering-intelligence.tsx");
    expect(engineering).toContain("/command-centre");
    expect(engineering).not.toContain("createProjectControlsEngine");
  });

  it("does not render raw evidence IDs or Project ID fields on operational PI surfaces", () => {
    const files = [
      "components/engineering/project-schedule-intelligence.tsx",
      "components/engineering/project-cost-progress-intelligence.tsx",
      "components/engineering/project-risk-change-intelligence.tsx",
      "components/engineering/project-query-decision-intelligence.tsx",
      "components/engineering/project-reporting-intelligence.tsx",
      "components/engineering/project-forecast-intelligence.tsx",
      "components/engineering/project-command-centre.tsx",
      "app/(platform)/engineering/apps/project-intelligence/meetings/new/page.tsx",
    ];
    for (const file of files) {
      const source = read(file);
      expect(source).not.toContain("{ref.sourceDomain}:{ref.entityType}:{ref.entityId}");
      expect(source).not.toContain("snapshot ${snapshot.snapshotId}");
      expect(source).not.toContain("Project ID");
    }
  });
});
