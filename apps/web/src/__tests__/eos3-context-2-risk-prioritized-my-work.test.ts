import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
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
import { EOS_RISK_PRIORITIZED_MY_WORK_IMPLEMENTED } from "../lib/engineering/eos3-my-work-ui";
import {
  __resetRiskPrioritizedMyWorkForTests,
  auditRiskPrioritizedMyWorkFoundations,
  buildPrioritizedMyWork,
  buildWorkPackagePriorityContextUi,
  comparePriorityItems,
  enableCriticalPriorityScenario,
  enableMultiWpBlockingScenario,
  ensurePilot001RiskPrioritizedMyWork,
  explainPriorityConsequence,
  explainWhyPriority,
  homeLightweightMyWorkCounts,
  measureMyWorkPriorityPerformance,
  queryPrioritizedMyWork,
  recordPriorityOverride,
  unauthorizedMyWorkDisclosureBlocked,
  unauthorizedPriorityOverrideBlocked,
} from "../lib/engineering/eos3-risk-prioritized-my-work-engine";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const TENANT = "00000000-0000-4000-8000-000000000061";
const WS = "00000000-0000-4000-8000-c20001";
const PROJECT = "PILOT-001-C2";

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
}

describe("EOS-3-CONTEXT-2 Risk-Prioritized My Work Engine", () => {
  beforeEach(() => resetAll());

  it("audits foundations and signal governance", () => {
    const a = auditRiskPrioritizedMyWorkFoundations();
    expect(a.riskPrioritizedMyWorkEngine).toBe(true);
    expect(a.notSimpleSortEngine).toBe(true);
    expect(a.requiresLiveLlm).toBe(false);
    expect(a.consequenceOverridesDueDate).toBe(true);
    expect(a.safetySignalGoverned).toBe(true);
    expect(a.assetCriticalityGoverned).toBe(true);
    expect(a.projectPriorityGoverned).toBe(true);
    expect(a.maturityNotAutomaticPriority).toBe(true);
    expect(a.shadowEngineeringStateCreated).toBe(false);
    expect(a.priorityEngineGrantsAuthority).toBe(false);
    expect(a.priorityModelDocumented).toBe(true);
    expect(EOS_RISK_PRIORITIZED_MY_WORK_IMPLEMENTED).toBe(true);
  });

  it("ranks PILOT-001 differently by Structural / TA / Civil roles", () => {
    const { structural, technicalAuthority, civil } = ensurePilot001RiskPrioritizedMyWork({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });

    expect(structural.length).toBeGreaterThan(0);
    const strCalc = structural.find((i) => i.objectStableId === "CALC-001" || /CALC/i.test(i.title));
    const strTopNeeds = structural.filter((i) => i.categories.includes("needs-action"));
    expect(strTopNeeds.some((i) => /CALC|load|15/i.test(i.title + i.reason + i.nextRecommendedAction))).toBe(
      true,
    );
    void strCalc;

    const taDec = technicalAuthority.find((i) => i.objectStableId === "DEC-001");
    expect(taDec).toBeTruthy();
    expect(["HIGH", "CRITICAL"]).toContain(taDec!.priorityBand);
    expect(taDec!.nextRecommendedAction).not.toMatch(/^Approve/i);

    const civilWaiting = civil.filter(
      (i) =>
        i.categories.includes("waiting-for-others") ||
        /waiting on.*reaction|Structural reactions/i.test(i.title),
    );
    expect(civilWaiting.length).toBeGreaterThan(0);
    expect(civil.every((i) => !/Approve DEC/i.test(i.nextRecommendedAction))).toBe(true);

    // Role-specific: TA has DEC as Needs Action; Structural focuses calc review; Civil waits
    expect(taDec!.categories).toContain("needs-action");
    const strDec = structural.find((i) => i.objectStableId === "DEC-001");
    if (strDec) {
      expect(strDec.categories.includes("needs-action")).toBe(false);
      expect(strDec.categories).toContain("decisions");
    }
    expect(
      structural.some(
        (i) =>
          i.categories.includes("needs-action") &&
          (/CALC/i.test(i.objectStableId) || /CALC|load|15/i.test(i.nextRecommendedAction)),
      ),
    ).toBe(true);
    expect(civil.some((i) => i.categories.includes("waiting-for-others"))).toBe(true);
    expect(taDec!.internalScore).toBeGreaterThanOrEqual(
      structural.find((i) => i.objectStableId === "DEC-001")?.internalScore ?? 0,
    );
  });

  it("ranks engineering consequence over sooner due date", () => {
    ensurePilot001RiskPrioritizedMyWork({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const items = buildPrioritizedMyWork({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectIds: [PROJECT],
      authorizedWorkspaceIds: [WS],
    });
    const lowDue = items.find((i) => i.objectStableId === "ITEM-LOW-DUE-SOON")!;
    const stale = items.find((i) => i.objectStableId === "ITEM-STALE-BLOCKING")!;
    expect(comparePriorityItems(stale, lowDue)).toBeLessThan(0);
    expect(PRIORITY_HIGHER(stale.priorityBand, lowDue.priorityBand)).toBe(true);
  });

  it("validates multi-WP blocking, authority, completed, false/missed critical, duplicates", () => {
    ensurePilot001RiskPrioritizedMyWork({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    enableMultiWpBlockingScenario(WS, PROJECT);
    enableCriticalPriorityScenario(WS, PROJECT);

    const items = buildPrioritizedMyWork({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectIds: [PROJECT],
      authorizedWorkspaceIds: [WS],
      capabilities: { canEdit: true, canApprove: false },
    });

    const multi = items.find((i) => i.objectStableId === "ASM-MULTI-BLOCK");
    expect(multi?.blockerStatus).toBe(true);
    expect(multi?.downstreamImpact.length).toBeGreaterThanOrEqual(3);

    expect(items.every((i) => !/^Approve /i.test(i.nextRecommendedAction))).toBe(true);

    const active = items.filter((i) => !i.completed);
    expect(active.every((i) => i.objectStableId !== "DEL-COMPLETED-001" || i.completed)).toBe(true);
    expect(active.some((i) => i.objectStableId === "DEL-COMPLETED-001")).toBe(false);

    const admin = items.find((i) => i.objectStableId === "ADMIN-OVERDUE-001")!;
    expect(admin.priorityBand).not.toBe("CRITICAL");
    expect(items.filter((i) => i.objectStableId === "ADMIN-OVERDUE-001" && i.priorityBand === "CRITICAL").length).toBe(
      0,
    );

    const crit = items.find((i) => i.objectStableId === "CALC-CRITICAL-001");
    expect(crit?.priorityBand).toBe("CRITICAL");

    const ids = items.map((i) => i.attentionId);
    expect(new Set(ids).size).toBe(ids.length);

    const why = explainWhyPriority(crit!);
    expect(why.lines.length).toBeGreaterThan(1);
    const cons = explainPriorityConsequence(crit!);
    expect(cons.bounded).toBe(true);
    expect(cons.speculativeCatastrophe).toBe(false);
  });

  it("supports override provenance, home isolation, WP UI, performance", () => {
    ensurePilot001RiskPrioritizedMyWork({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const o = recordPriorityOverride({
      workspaceId: WS,
      userId: "str-eng-01",
      objectStableId: "ADMIN-OVERDUE-001",
      adjustedBand: "MEDIUM",
      reason: "Temporary focus",
      actorId: "str-eng-01",
      authorized: true,
    });
    expect("error" in o).toBe(false);
    if (!("error" in o)) {
      expect(o.nonDestructive).toBe(true);
      expect(o.originalBand).toBeTruthy();
    }
    expect(unauthorizedPriorityOverrideBlocked({ authorized: false })).toBe(true);
    expect(unauthorizedMyWorkDisclosureBlocked({ canView: false })).toBe(true);

    const home = homeLightweightMyWorkCounts({
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
    });
    expect(home.fullPriorityEngineInvoked).toBe(false);

    const wpUi = buildWorkPackagePriorityContextUi({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      userId: "str-eng-01",
      userDiscipline: "Structural",
    });
    expect(wpUi.testId).toBe("wp-priority-context");

    const cross = buildPrioritizedMyWork({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "intruder",
      projectIds: [PROJECT],
      authorizedWorkspaceIds: ["other-ws"],
    });
    expect(cross.length).toBe(0);

    const perf = measureMyWorkPriorityPerformance(8);
    expect(perf.blockerCount).toBe(0);
    expect(perf.buildP95Ms).toBeLessThan(100);
  });

  it("preserves My Work categories/UI and required docs/migration", () => {
    const myPage = readFileSync(
      resolve(WEB_ROOT, "src/app/(platform)/engineering/my/page.tsx"),
      "utf8",
    );
    expect(myPage).toContain("my-work-foundation");
    expect(myPage).toContain("my-work-category-contract");
    expect(myPage).toContain("my-work-priority-filter");
    expect(myPage).toContain("my-work-priority-enriched");
    expect(myPage).toContain("Needs Action");
    expect(myPage).toContain("Waiting on Others");
    expect(myPage).not.toContain("Priority Engine");
    expect(myPage).not.toContain("context vector");

    const wp = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    expect(wp).toContain("wp-priority-context");
    expect(wp).toContain("wp-cockpit-foundation");

    expect(existsSync(resolve(DOCS, "EOS_3_RISK_PRIORITIZED_MY_WORK_ENGINE.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_ENGINEERING_PRIORITY_SIGNAL_MODEL.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_MY_WORK_PRIORITY_EXPLAINABILITY.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_MY_WORK_PRIORITY_AUTHORITY.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_MY_WORK_PRIORITY_PERFORMANCE.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT2_PILOT_VALIDATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT_2_MANIFEST.json"))).toBe(true);
    expect(
      existsSync(
        resolve(
          WEB_ROOT,
          "../../supabase/migrations/20261030270000_eos_3_context_2_my_work_priority.sql",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(resolve(WEB_ROOT, "src/app/api/engineering/my-work/priority/route.ts")),
    ).toBe(true);

    const high = queryPrioritizedMyWork({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "u",
      projectIds: [PROJECT],
      authorizedWorkspaceIds: [WS],
      priorityBand: "HIGH",
    });
    void high;
  });
});

function PRIORITY_HIGHER(a: string, b: string): boolean {
  const rank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  return (rank[a] ?? 0) > (rank[b] ?? 0);
}
