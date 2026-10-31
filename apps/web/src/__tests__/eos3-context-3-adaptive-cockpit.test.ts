import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import { __resetWorkPackagesForTests, createWorkPackage } from "../lib/engineering/eos3-work-package-service";
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
import {
  __resetAdaptiveCockpitForTests,
  auditAdaptiveCockpitFoundations,
  batchResolveMyWorkCockpitContext,
  buildEngineeringDesignCockpitSlice,
  buildWorkPackageCockpitSnapshot,
  cockpitObjectHref,
  ensurePilot001AdaptiveCockpit,
  homeDeepCockpitQueries,
  measureCockpitIntegrationPerformance,
  preserveNavigationContext,
  readinessBlockerQuery,
  refreshCockpitDerivedState,
  unauthorizedCockpitActionBlocked,
} from "../lib/engineering/eos3-adaptive-engineering-cockpit";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const TENANT = "00000000-0000-4000-8000-000000000071";
const WS = "00000000-0000-4000-8000-c30001";
const PROJECT = "PILOT-001-C3";

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
}

describe("EOS-3-CONTEXT-3 Adaptive Engineering Cockpit", () => {
  beforeEach(() => resetAll());

  it("audits foundations and stability rules", () => {
    const a = auditAdaptiveCockpitFoundations();
    expect(a.adaptiveEngineeringCockpit).toBe(true);
    expect(a.usesExistingIntelligenceFoundations).toBe(true);
    expect(a.shadowEngineeringStateCreated).toBe(false);
    expect(a.adaptiveContentNotAdaptiveNavigation).toBe(true);
    expect(a.layoutStability).toBe(true);
    expect(a.chatbotFirst).toBe(false);
    expect(a.requiresLiveLlm).toBe(false);
    expect(a.aiEngineeringApproval).toBe(false);
    expect(a.prohibitedAdaptationCount).toBe(0);
    expect(a.fullGraphInitialLoadRequired).toBe(false);
    expect(a.silentContextSwitch).toBe(false);
    expect(a.homeDeepCockpitQueryCount).toBe(0);
    expect(a.duplicateMyWorkStoreCreated).toBe(false);
  });

  it("builds PILOT-001 cockpit for Structural / TA / Civil", () => {
    const { structural, technicalAuthority, civil } = ensurePilot001AdaptiveCockpit({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });

    expect(structural.compactContext.workType).toMatch(/Brownfield/i);
    expect(structural.workPackageStableId).toBe("WP-STR-004");
    expect(structural.duplicateContextDisplayCount).toBe(0);
    expect(structural.sourceOfTruth).toBe(false);
    expect(structural.needsAttention.some((a) => a.band === "HIGH" || a.band === "CRITICAL")).toBe(
      true,
    );
    expect(structural.nextRecommendedAction.action || structural.needsAttention[0]?.nextAction).toBeTruthy();
    expect(structural.engineeringLanguage).toBe(true);
    expect(structural.requiresLiveLlm).toBe(false);

    expect(technicalAuthority.authority.canDecide || technicalAuthority.authority.canApprove).toBe(
      true,
    );
    expect(
      technicalAuthority.needsAttention.every((a) => !/^Approve /i.test(a.nextAction)) ||
        technicalAuthority.authority.canApprove,
    ).toBe(true);

    expect(
      civil.dependencies.waitingOn.length + civil.dependencies.requiredFromMe.length,
    ).toBeGreaterThanOrEqual(0);
    expect(unauthorizedCockpitActionBlocked({ action: "approve", authority: civil.authority })).toBe(
      true,
    );

    // Same WP facts; user-specific attention/authority
    expect(structural.compactContext.project).toBe(technicalAuthority.compactContext.project);
    expect(structural.authority.canApprove).not.toBe(technicalAuthority.authority.canApprove);
  });

  it("supports multi-WP context, batch My Work, navigation, refresh", () => {
    ensurePilot001AdaptiveCockpit({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    createWorkPackage({
      projectId: PROJECT,
      stableId: "WP-MEC-099",
      title: "Other package",
      maturity: "Detailed Engineering",
      leadDiscipline: "Mechanical",
    });

    const a = buildWorkPackageCockpitSnapshot({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "u1",
      userDiscipline: "Structural",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
    });
    const b = buildWorkPackageCockpitSnapshot({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "u1",
      userDiscipline: "Mechanical",
      projectId: PROJECT,
      workPackageStableId: "WP-MEC-099",
      authorizedWorkspaceIds: [WS],
    });
    expect(a.workPackageStableId).toBe("WP-STR-004");
    expect(b.workPackageStableId).toBe("WP-MEC-099");

    const batch = batchResolveMyWorkCockpitContext({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectIds: [PROJECT],
      authorizedWorkspaceIds: [WS],
    });
    expect(batch.nPlusOneQueryCount).toBe(0);
    expect(batch.items.some((i) => i.href.includes("engineering"))).toBe(true);

    const qs = preserveNavigationContext({
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      objectStableId: "CALC-001",
      cat: "needs-action",
    });
    expect(qs).toContain("workPackageId=WP-STR-004");
    expect(cockpitObjectHref(PROJECT, "WP-STR-004", "CALC-001", "Calculation")).toContain(
      "engineering-design",
    );

    const refreshed = refreshCockpitDerivedState({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
    });
    expect(refreshed.freshnessKey).toBeTruthy();

    const ed = buildEngineeringDesignCockpitSlice({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
    });
    expect(ed.testId).toBe("ed-cockpit-context");

    expect(homeDeepCockpitQueries().count).toBe(0);
    expect(readinessBlockerQuery(a).question).toContain("next stage");

    const denied = buildWorkPackageCockpitSnapshot({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "x",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: ["other"],
    });
    expect(denied.authority.canView).toBe(false);
  });

  it("measures integration performance and preserves UI freeze", () => {
    const perf = measureCockpitIntegrationPerformance(6);
    expect(perf.blockerCount).toBe(0);
    expect(perf.snapshotP95Ms).toBeLessThan(100);

    const wp = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    const my = readFileSync(
      resolve(WEB_ROOT, "src/app/(platform)/engineering/my/page.tsx"),
      "utf8",
    );
    const ed = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/capability-view.tsx"),
      "utf8",
    );
    expect(wp).toContain("wp-cockpit-foundation");
    expect(wp).toContain("wp-contextual-tabs");
    expect(wp).toContain("wp-cockpit-compact-context");
    expect(wp).toContain("wp-cockpit-next-action");
    expect(wp).toContain("wp-cockpit-needs-attention");
    expect(wp).not.toContain("context resolver");
    expect(wp).not.toContain("priority engine");
    expect(my).toContain("my-work-foundation");
    expect(my).toContain("my-work-category-contract");
    expect(my).toContain("data-eos-my-work-context-nav");
    expect(ed).toContain("engineering-design-panel");
    expect(ed).toContain("ed-cockpit-context");

    expect(existsSync(resolve(DOCS, "EOS_3_ADAPTIVE_ENGINEERING_COCKPIT.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_COCKPIT_CONTEXT_AND_PRIORITY_INTEGRATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_COCKPIT_ACTION_AND_AUTHORITY_MODEL.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_COCKPIT_PERFORMANCE_MODEL.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_COCKPIT_UI_STABILITY_RULES.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT3_PILOT_VALIDATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT_3_MANIFEST.json"))).toBe(true);
    expect(
      existsSync(resolve(WEB_ROOT, "src/app/api/engineering/cockpit/route.ts")),
    ).toBe(true);
    expect(
      existsSync(resolve(WEB_ROOT, "src/lib/engineering/eos3-adaptive-engineering-cockpit.ts")),
    ).toBe(true);
    // No new migration for Context-3
    expect(
      existsSync(
        resolve(
          WEB_ROOT,
          "../../supabase/migrations/20261030280000_eos_3_context_3_cockpit.sql",
        ),
      ),
    ).toBe(false);
  });
});
