import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import { __resetWorkPackagesForTests } from "../lib/engineering/eos3-work-package-service";
import { __resetAssetSystemContextForTests } from "../lib/engineering/eos3-asset-system-context";
import { __resetRelationshipGraphForTests } from "../lib/engineering/eos3-relationship-graph-core";
import { __resetDecisionAssumptionLineageForTests } from "../lib/engineering/eos3-decision-assumption-lineage";
import { __resetImpactPropagationForTests } from "../lib/engineering/eos3-impact-propagation";
import { __resetEngineeringPatternEngineForTests } from "../lib/engineering/eos3-engineering-pattern-engine";
import { __resetMultiLevelMaturityForTests } from "../lib/engineering/eos3-multi-level-maturity";
import { __resetEngineeringDependencyStakeholderForTests } from "../lib/engineering/eos3-engineering-dependency-stakeholder";
import { __resetDynamicDisciplineDiscoveryForTests } from "../lib/engineering/eos3-dynamic-affected-discipline-discovery";
import { __resetContextResolutionForTests } from "../lib/engineering/eos3-context-resolution-engine";
import { __resetRiskPrioritizedMyWorkForTests } from "../lib/engineering/eos3-risk-prioritized-my-work-engine";
import { __resetAdaptiveCockpitForTests } from "../lib/engineering/eos3-adaptive-engineering-cockpit";
import { __resetStageAwareGuidedEngineeringForTests } from "../lib/engineering/eos3-stage-aware-guided-engineering";
import {
  auditE2eFoundations,
  measureE2eInteractionJourney,
  runPilot001EndToEndValidation,
} from "../lib/engineering/eos3-e2e-engineering-validation";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const EVIDENCE = resolve(DOCS, "e2e-validation-1-evidence");
const TENANT = "00000000-0000-4000-8000-000000000091";
const WS = "00000000-0000-4000-8000-e2e001";
const PROJECT = "PILOT-001-E2E";

function resetAll() {
  __resetProjectWorkspacesForTests();
  __resetWorkPackagesForTests();
  __resetAssetSystemContextForTests();
  __resetRelationshipGraphForTests();
  __resetDecisionAssumptionLineageForTests();
  __resetImpactPropagationForTests();
  __resetEngineeringPatternEngineForTests();
  __resetMultiLevelMaturityForTests();
  __resetEngineeringDependencyStakeholderForTests();
  __resetDynamicDisciplineDiscoveryForTests();
  __resetContextResolutionForTests();
  __resetRiskPrioritizedMyWorkForTests();
  __resetAdaptiveCockpitForTests();
  __resetStageAwareGuidedEngineeringForTests();
}

describe("EOS-3-VALIDATION-1 End-to-End Engineering Work Package Execution", () => {
  beforeEach(() => resetAll());

  it("audits foundations and runs full PILOT-001 lifecycle", () => {
    const a = auditE2eFoundations();
    expect(a.endToEndEngineeringExecutionValidation).toBe(true);
    expect(a.foundationCoverage).toBe(true);
    expect(a.parallelWorkflowImplementationCreated).toBe(false);
    expect(a.requiresLiveLlm).toBe(false);
    expect(a.constructionManagementImplemented).toBe(false);
    expect(a.majorUiRedesign).toBe(false);
    expect(a.homeVisualReferenceAcceptanceClaimed).toBe(false);
    expect(a.databaseSchemaChanged).toBe(false);

    const report = runPilot001EndToEndValidation({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });

    expect(report.parallelWorkflowCreated).toBe(false);
    expect(report.requiresLiveLlm).toBe(false);
    expect(report.automaticIfcIssue).toBe(false);
    expect(report.autoGateApproval).toBe(false);
    expect(report.dependencyEqualsInvalidity).toBe(false);
    expect(report.calculationQualificationExpansion).toBe(false);
    expect(report.constructionManagementImplemented).toBe(false);

    const failed = report.steps.filter((s) => !s.pass);
    expect(failed.map((f) => `${f.id}:${f.detail}`)).toEqual([]);
    expect(report.allStepsPass).toBe(true);

    expect(report.authorityChecks.unauthorizedActionCount).toBe(0);
    expect(report.authorityChecks.crossWorkspaceLeakCount).toBe(0);
    expect(report.counters.prematureStageAdvancement).toBe(0);
    expect(report.counters.duplicateEngineeringObject).toBe(0);
    expect(report.counters.shadowEngineeringState).toBe(0);
    expect(report.counters.stateContradiction).toBe(0);
    expect(report.counters.deepEngineeringQueryOnHome).toBe(0);

    expect(report.digitalThread.length).toBeGreaterThanOrEqual(8);
    expect(report.lineageExplanations["Why was this design changed?"]).toMatch(/15 t/i);
    expect(report.lineageExplanations["Which revision uses 15 t?"]).toMatch(/15/);

    expect(report.defects.filter((d) => d.severity === "BLOCKER" || d.severity === "MAJOR")).toHaveLength(
      0,
    );

    // Current-build screen evidence (structured state captures — not reused prior screenshots)
    mkdirSync(EVIDENCE, { recursive: true });
    const captures = [
      {
        name: "01-my-work-prioritized",
        body: report.steps.filter((s) => s.id.includes("MY_WORK")),
      },
      {
        name: "02-wp-before-resolution",
        body: report.steps.filter((s) => s.step <= 14),
      },
      {
        name: "03-engineering-design-impact",
        body: report.steps.filter((s) => s.id.includes("IMPACT") || s.id.includes("CALCULATION")),
      },
      {
        name: "04-decision-reassessment",
        body: report.steps.filter((s) => s.id.includes("DECISION")),
      },
      {
        name: "05-revised-review",
        body: report.steps.filter((s) => s.id.includes("REVIEW") || s.id.includes("DELIVERABLE")),
      },
      {
        name: "06-readiness-restored",
        body: report.steps.filter((s) => s.id.includes("READINESS") || s.id.includes("CHECKPOINT")),
      },
      {
        name: "07-completion-closeout",
        body: report.steps.filter((s) => s.step >= 25),
      },
    ];
    for (const c of captures) {
      writeFileSync(
        resolve(EVIDENCE, `${c.name}.json`),
        JSON.stringify({ capturedAt: new Date().toISOString(), build: "validation-1", ...c }, null, 2),
      );
    }
    expect(existsSync(resolve(EVIDENCE, "01-my-work-prioritized.json"))).toBe(true);
  });

  it("measures interaction journey and preserves docs/UI freeze", () => {
    const j = measureE2eInteractionJourney(5);
    expect(j.journeyP95Ms).toBeGreaterThan(0);
    expect(j.includes).toMatch(/MyWork/);

    expect(existsSync(resolve(DOCS, "EOS_3_END_TO_END_ENGINEERING_VALIDATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_E2E_ENGINEERING_SCENARIO.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_E2E_DIGITAL_THREAD_VALIDATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_E2E_AUTHORITY_VALIDATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_E2E_PERFORMANCE_VALIDATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_E2E_DEFECT_REGISTER.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_VALIDATION_1_MANIFEST.json"))).toBe(true);

    const wp = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    const my = readFileSync(
      resolve(WEB_ROOT, "src/app/(platform)/engineering/my/page.tsx"),
      "utf8",
    );
    expect(wp).toContain("wp-cockpit-foundation");
    expect(wp).toContain("wp-contextual-tabs");
    expect(my).toContain("my-work-foundation");
    expect(
      existsSync(
        resolve(WEB_ROOT, "../../supabase/migrations/20261030300000_eos_3_validation_1_e2e.sql"),
      ),
    ).toBe(false);
  });
});
