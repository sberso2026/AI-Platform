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
import { __resetRiskPrioritizedMyWorkForTests } from "../lib/engineering/eos3-risk-prioritized-my-work-engine";
import { __resetAdaptiveCockpitForTests } from "../lib/engineering/eos3-adaptive-engineering-cockpit";
import {
  __resetStageAwareGuidedEngineeringForTests,
  auditStageAwareFoundations,
  buildStageGuidanceSnapshot,
  createAuthorizedDraftObject,
  ensurePilot001StageGuidance,
  explainWhyStageGuidance,
  homeDeepStageQueries,
  listJitDrafts,
  measureStageGuidancePerformance,
  queryCompletionRequirements,
  queryNextCheckpointBlockers,
  queryRequiredInformation,
  stageGuidanceForMyWorkEnrichment,
  transitionAndRefreshGuidance,
  validatePatternStageGuidance,
} from "../lib/engineering/eos3-stage-aware-guided-engineering";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const TENANT = "00000000-0000-4000-8000-000000000081";
const WS = "00000000-0000-4000-8000-ux5001";
const PROJECT = "PILOT-001-UX5";

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

describe("EOS-3-UX-5 Stage-Aware Guided Engineering", () => {
  beforeEach(() => resetAll());

  it("audits foundations and doctrine", () => {
    const a = auditStageAwareFoundations();
    expect(a.stageAwareGuidedEngineering).toBe(true);
    expect(a.progressiveDisclosure).toBe(true);
    expect(a.usesExistingFoundations).toBe(true);
    expect(a.patternIntegration).toBe(true);
    expect(a.maturityIntegration).toBe(true);
    expect(a.futureStageObjectPregeneration).toBe(false);
    expect(a.autoApproval).toBe(false);
    expect(a.autoDecision).toBe(false);
    expect(a.autoFinalCalculation).toBe(false);
    expect(a.autoIfcIssue).toBe(false);
    expect(a.shadowTruthCreated).toBe(false);
    expect(a.requiresLiveLlm).toBe(false);
    expect(a.primaryNavItemCreated).toBe(false);
    expect(a.networkWaterfallCount).toBe(0);
    expect(a.homeDeepStageQueryCount).toBe(0);
    expect(a.databaseSchemaChanged).toBe(false);
    expect(homeDeepStageQueries().count).toBe(0);
  });

  it("builds PILOT-001 Required Now and blocks premature Verification", () => {
    const { structural, technicalAuthority, civil } = ensurePilot001StageGuidance({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });

    expect(structural.workType).toMatch(/Brownfield/i);
    expect(structural.currentStage).toMatch(/Engineering Design/i);
    expect(structural.currentStage).not.toBe(structural.readiness);
    expect(structural.nextCheckpoint).toBeTruthy();

    const labels = structural.requiredNow.map((r) => r.label).join(" | ");
    expect(labels).toMatch(/vendor load|15 t/i);
    expect(labels).toMatch(/ASM-001/i);
    expect(labels).toMatch(/CALC-001/i);
    expect(labels).toMatch(/DEC-001/i);
    expect(structural.prematureAdvancementRecommended).toBe(false);
    expect(structural.impactOverridesNormalFlow).toBe(true);
    expect(structural.readyForNextStage).toBe(false);
    expect(
      /proceed.*verification|advance.*verification/i.test(
        structural.nextRecommendedAction.action ?? "",
      ),
    ).toBe(false);

    expect(queryRequiredInformation(structural).items.length).toBeGreaterThan(0);
    expect(queryCompletionRequirements(structural).items.length).toBeGreaterThan(0);
    expect(queryNextCheckpointBlockers(structural).blockers.length).toBeGreaterThan(0);
    expect(explainWhyStageGuidance(structural.requiredNow[0]!).explanation.length).toBeGreaterThan(10);

    // Same facts, user-specific guidance
    expect(structural.projectId).toBe(technicalAuthority.projectId);
    expect(structural.workPackageStableId).toBe(civil.workPackageStableId);
    expect(technicalAuthority.authority.canApprove).toBe(true);
    expect(civil.authority.canApprove).toBe(false);
    expect(civil.requiredNow.some((r) => r.category === "Dependency")).toBe(true);

    const enrich = stageGuidanceForMyWorkEnrichment(structural);
    expect(enrich.nextAction || enrich.why).toBeTruthy();
  });

  it("supports JIT draft Create Draft with provenance, idempotency, no duplicates", () => {
    ensurePilot001StageGuidance({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });

    expect(() =>
      createAuthorizedDraftObject({
        tenantId: TENANT,
        workspaceId: WS,
        projectId: PROJECT,
        workPackageStableId: "WP-STR-004",
        objectClass: "Calculation",
        expectationKey: "Calculation",
        actorId: "str-eng-01",
        authorized: true,
        trigger: "stage_expected_deliverable",
      }),
    ).toThrow(/equivalent_object_already_exists/);

    const d1 = createAuthorizedDraftObject({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      objectClass: "Deliverable",
      expectationKey: "IFC package future",
      actorId: "str-eng-01",
      authorized: true,
      trigger: "user_create_draft",
    });
    expect(d1.status).toBe("DRAFT");
    expect(d1.authoritativeConclusion).toBe(false);
    expect(d1.patternId).toBeTruthy();
    expect(d1.stageId).toBeTruthy();
    expect(d1.trigger).toBe("user_create_draft");
    expect(d1.removable).toBe(true);

    const d2 = createAuthorizedDraftObject({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      objectClass: "Deliverable",
      expectationKey: "IFC package future",
      actorId: "str-eng-01",
      authorized: true,
      trigger: "user_create_draft",
    });
    expect(d2.draftId).toBe(d1.draftId);
    expect(listJitDrafts(WS, PROJECT, "WP-STR-004").length).toBe(1);

    expect(() =>
      createAuthorizedDraftObject({
        tenantId: TENANT,
        workspaceId: WS,
        projectId: PROJECT,
        workPackageStableId: "WP-STR-004",
        objectClass: "Deliverable",
        expectationKey: "x",
        actorId: "str-eng-01",
        authorized: false,
        trigger: "user_create_draft",
      }),
    ).toThrow(/unauthorized/);
  });

  it("validates pattern-specific stage content and transitions", () => {
    const green = validatePatternStageGuidance({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: `${PROJECT}-GF`,
      patternId: "GREENFIELD_ENGINEERING",
      workPackageStableId: "WP-GF-001",
      title: "New process unit",
      description: "Greenfield new installation",
      entryStageId: "detailed_engineering",
    });
    expect(green.workType).toMatch(/Greenfield/i);
    expect(green.requiredNow.map((r) => r.label).join(" ")).not.toMatch(/vendor load 12 t/i);

    const integrity = validatePatternStageGuidance({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: `${PROJECT}-AI`,
      patternId: "ASSET_INTEGRITY_ASSESSMENT",
      workPackageStableId: "WP-AI-001",
      title: "Tank integrity assessment",
      description: "Defect fitness capacity assessment",
      entryStageId: "assessment",
    });
    expect(integrity.requiredNow.map((r) => r.label).join(" ")).toMatch(
      /Condition|Assessment|Capacity|fitness|Recommendation/i,
    );

    const repair = validatePatternStageGuidance({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: `${PROJECT}-RP`,
      patternId: "REPAIR_REMEDIATION",
      workPackageStableId: "WP-RP-001",
      title: "Beam repair",
      description: "Repair remediation of cracked member",
      entryStageId: "repair_design",
    });
    expect(repair.workType).toMatch(/Repair/i);

    const vendor = validatePatternStageGuidance({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: `${PROJECT}-VC`,
      patternId: "VENDOR_CHANGE_ASSESSMENT",
      workPackageStableId: "WP-VC-001",
      title: "Vendor mass change",
      description: "Vendor information change assessment",
      entryStageId: "engineering_impact_review",
    });
    expect(vendor.workType).toMatch(/Vendor/i);

    const site = validatePatternStageGuidance({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: `${PROJECT}-SS`,
      patternId: "SITE_TECHNICAL_SUPPORT",
      workPackageStableId: "WP-SS-001",
      title: "Site RFI response",
      description: "Site originated RFI technical support",
      entryStageId: "technical_response",
    });
    expect(site.workType).toMatch(/Site/i);

    // Forward + backward transition preserves history
    ensurePilot001StageGuidance({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    const fwd = transitionAndRefreshGuidance({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      targetStageId: "verification_review",
      actorId: "ta-01",
    });
    expect(fwd.after.currentStageId).toBe("verification_review");
    expect(fwd.after.currentStage).not.toBe(fwd.before.currentStage);
    expect(fwd.historyCount).toBeGreaterThan(0);
    expect(fwd.after.historyAccessible).toBe(true);

    const back = transitionAndRefreshGuidance({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      targetStageId: "engineering_design",
      actorId: "ta-01",
    });
    expect(back.after.currentStageId).toBe("engineering_design");
    expect(back.historyCount).toBeGreaterThan(fwd.historyCount);

    // Cross-workspace denied
    expect(() =>
      buildStageGuidanceSnapshot({
        tenantId: TENANT,
        workspaceId: WS,
        userId: "x",
        projectId: PROJECT,
        workPackageStableId: "WP-STR-004",
        authorizedWorkspaceIds: ["other-ws"],
      }),
    ).toThrow(/cross_workspace/);
  });

  it("measures performance and preserves UI freeze", () => {
    const perf = measureStageGuidancePerformance(6);
    expect(perf.blockerCount).toBe(0);
    expect(perf.waterfallCount).toBe(0);
    expect(perf.guidanceP95Ms).toBeLessThan(200);

    const wp = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    const ed = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/capability-view.tsx"),
      "utf8",
    );
    const my = readFileSync(
      resolve(WEB_ROOT, "src/app/(platform)/engineering/my/page.tsx"),
      "utf8",
    );
    expect(wp).toContain("wp-cockpit-foundation");
    expect(wp).toContain("wp-contextual-tabs");
    expect(wp).toContain("wp-stage-guidance");
    expect(wp).toContain("wp-stage-required-now");
    expect(wp).not.toContain("state machine");
    expect(wp).not.toContain("workflow engine");
    expect(ed).toContain("engineering-design-panel");
    expect(ed).toContain("ed-stage-guidance");
    expect(ed).toContain("ed-stage-required-now");
    expect(my).toContain("my-work-foundation");
    expect(my).toContain("data-eos-my-work-stage-enrichment");

    expect(existsSync(resolve(DOCS, "EOS_3_STAGE_AWARE_GUIDED_ENGINEERING.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_STAGE_RELEVANT_CONTENT_MODEL.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_JUST_IN_TIME_OBJECT_GENERATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_STAGE_GUIDANCE_AUTHORITY_MODEL.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_STAGE_GUIDANCE_PERFORMANCE.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_UX5_PILOT_VALIDATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_UX_5_MANIFEST.json"))).toBe(true);
    expect(
      existsSync(resolve(WEB_ROOT, "src/app/api/engineering/stage-guidance/route.ts")),
    ).toBe(true);
    expect(
      existsSync(
        resolve(WEB_ROOT, "../../supabase/migrations/20261030290000_eos_3_ux5_stage_guidance.sql"),
      ),
    ).toBe(false);
  });
});
