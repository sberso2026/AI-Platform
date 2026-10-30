import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import { __resetWorkPackagesForTests, getWorkPackage } from "../lib/engineering/eos3-work-package-service";
import { __resetAssetSystemContextForTests } from "../lib/engineering/eos3-asset-system-context";
import { __resetRelationshipGraphForTests } from "../lib/engineering/eos3-relationship-graph-core";
import { __resetDecisionAssumptionLineageForTests } from "../lib/engineering/eos3-decision-assumption-lineage";
import { __resetImpactPropagationForTests } from "../lib/engineering/eos3-impact-propagation";
import { __resetEngineeringPatternEngineForTests } from "../lib/engineering/eos3-engineering-pattern-engine";
import {
  __resetMultiLevelMaturityForTests,
  auditMaturityFoundations,
  ensurePilot001MaturityState,
  evaluateNextStageReadiness,
  getWorkPackageMaturityHistory,
  mapStageToNormalizedBand,
  measureMaturityPerformanceBaseline,
  queryDeliverableMaturity,
  queryProjectMaturityProfile,
  queryWorkPackageMaturity,
  runMixedDeliverableMaturityScenario,
  runMixedProjectMaturityScenario,
  runMultiPatternMaturityScenario,
  setDeliverableMaturity,
  transitionWorkPackageMaturity,
  unauthorizedMaturityWriteBlocked,
} from "../lib/engineering/eos3-multi-level-maturity";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const TENANT = "00000000-0000-4000-8000-000000000041";
const WS = "00000000-0000-4000-8000-wf20001";
const PROJECT = "PILOT-001-WF2";

describe("EOS-3-WORKFLOW-2 Multi-Level Maturity Model", () => {
  beforeEach(() => {
    __resetProjectWorkspacesForTests();
    __resetWorkPackagesForTests();
    __resetAssetSystemContextForTests();
    __resetRelationshipGraphForTests();
    __resetDecisionAssumptionLineageForTests();
    __resetImpactPropagationForTests();
    __resetEngineeringPatternEngineForTests();
    __resetMultiLevelMaturityForTests();
  });

  it("audits concept separation and foundations", () => {
    const audit = auditMaturityFoundations();
    expect(audit.multiLevelMaturityModel).toBe(true);
    expect(audit.conceptSeparation).toBe(true);
    expect(audit.newAssetMaturityModelCreated).toBe(false);
    expect(audit.workPackagePrimaryBoundary).toBe(true);
    expect(audit.falseSingleProjectStageCount).toBe(0);
    expect(audit.manualMaturityPercentRequired).toBe(false);
    expect(audit.transitionAutoApproval).toBe(false);
    expect(audit.automaticMaturityAdvancement).toBe(false);
    expect(audit.impactAutoMaturityChange).toBe(false);
    expect(audit.maturityPrimaryNavCreated).toBe(false);
    expect(audit.grantsEngineeringAuthority).toBe(false);
    expect(mapStageToNormalizedBand("BROWNFIELD_MODIFICATION", "engineering_design")).toBe(
      "DESIGN",
    );
    expect(mapStageToNormalizedBand("GREENFIELD_ENGINEERING", "feed")).toBe("DESIGN");
  });

  it("validates PILOT-001 WP maturity, project divergence, deliverable, and impact scenario", () => {
    const result = ensurePilot001MaturityState({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(result.wpQuery.workType).toBe("Brownfield Modification");
    expect(result.wpQuery.patternNativeStageLabel).toMatch(/Engineering Design/i);
    expect(result.wpQuery.normalizedBand).toBe("DESIGN");
    expect(result.wpQuery.legacyMaturityLabel).toBe("Detailed Engineering");
    expect(result.projectLifecycleKey).toBeTruthy();
    expect(result.projectProfile.authoritativeSingleStage).toBeNull();
    expect(result.projectProfile.falseSingleProjectStage).toBe(false);
    expect(result.projectProfile.summaryIsDerivedOnly).toBe(true);
    expect(result.deliverable.maturity).toBe("IN_DEVELOPMENT");
    expect(result.deliverable.approvalState).toBe("NOT_APPROVED");
    expect(result.deliverable.maturityVsIssuePurposeSeparated).toBe(true);
    expect(result.impactScenario.stageUnchanged).toBe(true);
    expect(result.impactScenario.readinessReduced || result.impactScenario.blockersPresent).toBe(
      true,
    );
  });

  it("reports mixed and multi-pattern project maturity profiles without false single stage", () => {
    const mixed = runMixedProjectMaturityScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const bandsWithWork = mixed.bands.filter((b) => b.count > 0);
    expect(bandsWithWork.length).toBeGreaterThanOrEqual(3);
    expect(mixed.authoritativeSingleStage).toBeNull();
    expect(mixed.summaryLabel).toMatch(/Mixed|Predominantly/);
    expect(mixed.weighting).toBe("UNWEIGHTED_WP_COUNT");

    const multi = runMultiPatternMaturityScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: `${PROJECT}-MP`,
    });
    const patternIds = new Set(multi.workPackages.map((w) => w.patternId));
    expect(patternIds.size).toBeGreaterThanOrEqual(3);
    expect(multi.falseSingleProjectStage).toBe(false);
  });

  it("keeps deliverable maturity independent of WP stage and of issue purpose/approval/revision", () => {
    ensurePilot001MaturityState({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const mixed = runMixedDeliverableMaturityScenario({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(mixed.workPackageStage).toMatch(/Engineering Design/i);
    expect(mixed.deliverables.map((d) => d.maturity)).toEqual(
      expect.arrayContaining(["UNDER_REVIEW", "IN_DEVELOPMENT", "READY_FOR_REVIEW"]),
    );
    const ready = setDeliverableMaturity({
      workspaceId: WS,
      projectId: PROJECT,
      deliverableStableId: "DEL-001",
      maturity: "READY_FOR_CURRENT_PURPOSE",
      revision: "B",
      issuePurpose: "IFC",
      authorized: true,
    });
    expect(ready.maturity).toBe("READY_FOR_CURRENT_PURPOSE");
    expect(ready.approvalState).toBe("NOT_APPROVED");
    expect(ready.revision).toBe("B");
    expect(ready.issuePurpose).toBe("IFC");
    expect(ready.schedulePercentComplete).toBeNull();
  });

  it("supports authorized transitions, provenance history, and non-destructive regression", () => {
    ensurePilot001MaturityState({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(() =>
      transitionWorkPackageMaturity({
        tenantId: TENANT,
        workspaceId: WS,
        projectId: PROJECT,
        workPackageStableId: "WP-STR-004",
        targetStageId: "verification_review",
        actorId: "eng",
        transitionAuthorized: false,
        rationale: "no",
      }),
    ).toThrow(/unauthorized/);

    const forward = transitionWorkPackageMaturity({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      targetStageId: "verification_review",
      actorId: "lead_engineer",
      transitionAuthorized: true,
      rationale: "Ready for verification with override",
      override: {
        reason: "Authorized readiness override for controlled pilot",
        authorityRole: "qualified_reviewer",
        authorityUserId: "rev-1",
      },
    });
    expect(forward.direction).toBe("FORWARD");
    expect(forward.newStageId).toBe("verification_review");
    expect(forward.provenance.autoApproved).toBe(false);

    const back = transitionWorkPackageMaturity({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      targetStageId: "engineering_design",
      actorId: "lead_engineer",
      transitionAuthorized: true,
      rationale: "Vendor load change requires design revisit",
    });
    expect(back.direction).toBe("BACKWARD");
    const history = getWorkPackageMaturityHistory(WS, PROJECT, "WP-STR-004");
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(getWorkPackage(PROJECT, "WP-STR-004")?.maturity).toBe("Detailed Engineering");
  });

  it("answers next-stage, project, WP, and deliverable status queries", () => {
    ensurePilot001MaturityState({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const readiness = evaluateNextStageReadiness({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(readiness.impliesEngineeringApproval).toBe(false);
    expect(readiness.impliesSchedulePercentComplete).toBe(false);
    expect(readiness.basisRule).toBe("EOS_WORKFLOW2_READINESS_WEIGHTED_V1");
    expect(Array.isArray(readiness.blockers)).toBe(true);

    const project = queryProjectMaturityProfile({ workspaceId: WS, projectId: PROJECT });
    expect(project.authoritativeSingleStage).toBeNull();

    const wp = queryWorkPackageMaturity({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(wp.workType).toBeTruthy();
    expect(wp.patternNativeStageLabel).toBeTruthy();
    expect(wp.normalizedBand).toBeTruthy();

    const del = queryDeliverableMaturity({
      workspaceId: WS,
      projectId: PROJECT,
      deliverableStableId: "DEL-001",
    });
    expect(del.maturity).toBeTruthy();
    expect(unauthorizedMaturityWriteBlocked({ callerWorkspaceId: WS, assignmentWorkspaceId: "x" })).toBe(
      true,
    );
  });

  it("measures performance and preserves UI freeze / no maturity nav", () => {
    const perf = measureMaturityPerformanceBaseline(6);
    // eslint-disable-next-line no-console
    console.log("EOS_WORKFLOW2_PERF", JSON.stringify(perf));
    expect(perf.blockerCount).toBe(0);
    expect(perf.projectProfileP95Ms).toBeGreaterThanOrEqual(0);

    for (const f of [
      "EOS_3_MULTI_LEVEL_MATURITY_MODEL.md",
      "EOS_3_PROJECT_MATURITY_PROFILE.md",
      "EOS_3_WORK_PACKAGE_MATURITY_AND_TRANSITIONS.md",
      "EOS_3_DELIVERABLE_MATURITY_MODEL.md",
      "EOS_3_MATURITY_READINESS_SEPARATION.md",
      "EOS_3_WORKFLOW2_PILOT_VALIDATION.md",
      "EOS_3_WORKFLOW_2_MANIFEST.json",
    ]) {
      expect(existsSync(resolve(DOCS, f))).toBe(true);
    }
    expect(
      existsSync(
        resolve(WEB_ROOT, "../../supabase/migrations/20261030230000_eos_3_workflow_2_multi_level_maturity.sql"),
      ),
    ).toBe(true);

    const home = readFileSync(resolve(WEB_ROOT, "src/app/(platform)/engineering/page.tsx"), "utf8");
    expect(home).not.toContain("maturity-profile-engine");
    expect(home).toContain("approved-engineering-1c-locked");

    const wpPanel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    expect(wpPanel).toContain("Current Stage");
    expect(wpPanel).toContain("wp-current-stage");
    expect(wpPanel).toContain("Deliverable Status");

    const nav = readFileSync(
      resolve(WEB_ROOT, "../../packages/platform-core/src/navigation.ts"),
      "utf8",
    );
    expect(nav).not.toMatch(/label:\s*"Maturity"/);
  });
});
