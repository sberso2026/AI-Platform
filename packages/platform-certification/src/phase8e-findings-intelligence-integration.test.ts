/**
 * Phase 8E Findings Intelligence integration unit tests.
 */
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { defaultEngineeringModuleRegistry } from "@rtb/engineering-os";
import {
  FINDINGS_INTELLIGENCE_SHARED_SERVICES,
  PROJECT_INTELLIGENCE_MODULE_KEY,
  assertFindingsIntelligenceSharedServices,
  assertNoFindingsPrivateInfrastructure,
  assertProjectIntelligenceSharedStack,
  createDocumentFindingsHandoff,
  createMeetingFindingsHandoff,
  intakeFromDocumentHandoff,
  intakeFromMeetingHandoff,
} from "@rtb/project-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("Phase 8E Findings Intelligence integration", () => {
  it("documents reconciliation, ownership and baselines", () => {
    expect(
      existsSync(resolve(ROOT, "docs/migration/PROJECT_INTELLIGENCE_FINDINGS_PHASE_8E_RECONCILIATION.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/architecture/PROJECT_INTELLIGENCE_FINDINGS_DATA_OWNERSHIP.md")),
    ).toBe(true);
    expect(
      existsSync(resolve(ROOT, "docs/testing/PROJECT_INTELLIGENCE_FINDINGS_PRODUCTION_BASELINE.md")),
    ).toBe(true);
    const recon = readFileSync(
      resolve(ROOT, "docs/migration/PROJECT_INTELLIGENCE_FINDINGS_PHASE_8E_RECONCILIATION.md"),
      "utf8",
    );
    expect(recon.toLowerCase()).not.toMatch(/cortex/);
    expect(recon).toMatch(/Do not rebuild/i);
  });

  it("keeps findings_intelligence registered under Project Intelligence", () => {
    const mod = defaultEngineeringModuleRegistry.get(PROJECT_INTELLIGENCE_MODULE_KEY)!;
    expect(mod.features?.some((f) => f.id === "findings_intelligence")).toBe(true);
    expect(
      mod.features?.find((f) => f.id === "findings_intelligence")?.capabilities?.some(
        (c) => c.id === "findings.intelligence.read",
      ),
    ).toBe(true);
  });

  it("consumes shared Engineering services without private infrastructure", () => {
    expect(() => assertFindingsIntelligenceSharedServices()).not.toThrow();
    expect(() => assertProjectIntelligenceSharedStack()).not.toThrow();
    expect(() =>
      assertNoFindingsPrivateInfrastructure({
        implementsPrivateAudit: false,
        implementsPrivateNotification: false,
        implementsPrivateAiRuntime: false,
        implementsPrivateApprovalEngine: false,
      }),
    ).not.toThrow();
    expect(FINDINGS_INTELLIGENCE_SHARED_SERVICES.length).toBeGreaterThanOrEqual(10);
  });

  it("integrates document and meeting candidate handoffs", () => {
    const doc = createDocumentFindingsHandoff({
      id: "d1",
      findingType: "missing_specification",
      title: "Missing",
      confidence: 0.6,
      evidence: [
        {
          engineeringDocumentId: "doc",
          revision: "A",
          excerpt: "x",
          evidenceScore: 1,
          chunkId: "c",
        },
      ],
      engineeringDocumentId: "doc",
      traceId: "t",
    });
    const meet = createMeetingFindingsHandoff({
      id: "m1",
      meetingSessionId: "ms",
      title: "Finding",
      confidence: 0.5,
      transcriptReferences: ["s1"],
      traceId: "tm",
    });
    expect(
      intakeFromDocumentHandoff(doc, { tenantId: "t", workspaceId: "w" }).sourceType,
    ).toBe("document_intelligence.candidate_finding");
    expect(
      intakeFromMeetingHandoff(meet, { tenantId: "t", workspaceId: "w" }).sourceType,
    ).toBe("meeting_intelligence.candidate_finding");
  });

  it("exposes findings-intelligence-ready inside Project Intelligence shell", () => {
    const page = readFileSync(
      resolve(
        ROOT,
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/findings/page.tsx",
      ),
      "utf8",
    );
    const shell = readFileSync(
      resolve(ROOT, "apps/web/src/components/engineering/project-intelligence-shell.tsx"),
      "utf8",
    );
    expect(page).toContain('data-testid="findings-intelligence-ready"');
    expect(page).toContain('data-testid="project-intelligence-findings-ready"');
    expect(shell).toContain('data-testid="project-intelligence-shell"');
    expect(shell).toContain("Findings Intelligence");
  });

  it("preserves additive findings migration identity", () => {
    const migration = readFileSync(
      resolve(
        ROOT,
        "supabase/migrations/20260806120000_batch_41_project_intelligence_findings.sql",
      ),
      "utf8",
    );
    expect(migration).toMatch(/project_intelligence_findings/);
    expect(migration).toMatch(/project_intelligence_finding_events/);
    expect(migration).toMatch(/ROW LEVEL SECURITY/);
  });
});
