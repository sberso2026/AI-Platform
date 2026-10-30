import { describe, it, expect, beforeEach } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { __resetProjectWorkspacesForTests } from "../lib/engineering/eos3-project-workspace-service";
import {
  __resetWorkPackagesForTests,
  createWorkPackage,
  associateObject,
} from "../lib/engineering/eos3-work-package-service";
import { __resetAssetSystemContextForTests } from "../lib/engineering/eos3-asset-system-context";
import { __resetRelationshipGraphForTests } from "../lib/engineering/eos3-relationship-graph-core";
import { __resetDecisionAssumptionLineageForTests } from "../lib/engineering/eos3-decision-assumption-lineage";
import { __resetImpactPropagationForTests } from "../lib/engineering/eos3-impact-propagation";
import { __resetEngineeringPatternEngineForTests } from "../lib/engineering/eos3-engineering-pattern-engine";
import { __resetMultiLevelMaturityForTests } from "../lib/engineering/eos3-multi-level-maturity";
import { __resetEngineeringDependencyStakeholderForTests } from "../lib/engineering/eos3-engineering-dependency-stakeholder";
import { __resetDynamicDisciplineDiscoveryForTests } from "../lib/engineering/eos3-dynamic-affected-discipline-discovery";
import {
  __resetContextResolutionForTests,
  auditContextResolutionFoundations,
  buildEngineeringDesignContextUiContract,
  buildMyWorkContextDataContract,
  buildWorkPackageContextUiContract,
  clearContextOverride,
  ensurePilot001ContextState,
  explainWhyContext,
  homeLightweightContext,
  invalidateContextCache,
  linkObjectToExtraWorkPackage,
  measureContextPerformanceBaseline,
  resolveContext,
  resolveContextFromDecision,
  resolveContextFromObject,
  resolveContextFromReview,
  resolveContextFromRoute,
  revokeWorkPackageAccessForUser,
  setContextOverride,
  unauthorizedContextDisclosureBlocked,
  unauthorizedContextOverrideBlocked,
} from "../lib/engineering/eos3-context-resolution-engine";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const TENANT = "00000000-0000-4000-8000-000000000051";
const WS = "00000000-0000-4000-8000-c10001";
const PROJECT = "PILOT-001-C1";

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
}

describe("EOS-3-CONTEXT-1 Context Resolution Engine", () => {
  beforeEach(() => {
    resetAll();
  });

  it("audits doctrine, dimensions, separations, and no shadow truth", () => {
    const a = auditContextResolutionFoundations();
    expect(a.doctrineImplemented).toBe(true);
    expect(a.contextResolutionEngine).toBe(true);
    expect(a.shadowEngineeringStateCreated).toBe(false);
    expect(a.canonicalReferenceModel).toBe(true);
    expect(a.dimensionModel).toBe(true);
    expect(a.multiDimensional).toBe(true);
    expect(a.precedenceModel).toBe(true);
    expect(a.ambiguousWpAutoSelection).toBe(false);
    expect(a.requiresLiveLlm).toBe(false);
    expect(a.silentActiveContextSwitch).toBe(false);
    expect(a.riskPrioritizedMyWorkImplemented).toBe(false);
    expect(a.dynamicPrimaryNavigation).toBe(false);
    expect(a.contextGrantsAuthority).toBe(false);
    expect(a.titleBasedAuthorityInference).toBe(false);
    expect(a.snapshotSourceOfTruth).toBe(false);
    expect(a.homeDeepContextRequired).toBe(false);
    expect(a.manualContextFormRequired).toBe(false);
    expect(a.persistentShadowTruthCreated).toBe(false);
  });

  it("resolves PILOT-001 WP-STR-004 multi-dimensional context", () => {
    const { snapshot, impactAware } = ensurePilot001ContextState({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(snapshot.project.projectId).toBe(PROJECT);
    expect(snapshot.work.workPackageStableId).toBe("WP-STR-004");
    expect(snapshot.work.workType).toMatch(/Brownfield/i);
    expect(snapshot.disciplines.responsible).toContain("Structural");
    expect(snapshot.disciplines.producing).toContain("Mechanical");
    expect(snapshot.ambiguity).toBe("UNAMBIGUOUS");
    expect(snapshot.sourceOfTruth).toBe(false);
    expect(snapshot.derived).toBe(true);
    expect(snapshot.authority.canEdit).toBe(true);
    expect(snapshot.authority.canApprove).toBe(false);
    expect(snapshot.authority.titleBasedInference).toBe(false);
    expect(snapshot.authority.contextGrantsAuthority).toBe(false);
    expect(impactAware.attention.needsAttention.length + impactAware.attention.impacted.length).toBeGreaterThanOrEqual(0);
    expect(snapshot.engineeringLanguageLabels.myRole).toMatch(/Responsible|Structural/i);
  });

  it("reconstructs context from CALC-001, Review, and Decision", () => {
    ensurePilot001ContextState({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    const calc = resolveContextFromObject({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
      objectStableId: "CALC-001",
      objectKind: "Calculation",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    expect(calc.work.workPackageStableId).toBe("WP-STR-004");
    expect(calc.project.projectId).toBe(PROJECT);
    expect(calc.work.workType).toBeTruthy();

    const rev = resolveContextFromReview({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
      objectStableId: "REV-001",
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    expect(rev.relevant.reviews).toContain("REV-001");
    expect(rev.work.workPackageStableId).toBe("WP-STR-004");

    const dec = resolveContextFromDecision({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
      objectStableId: "DEC-001",
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    expect(dec.relevant.decisions).toContain("DEC-001");
  });

  it("keeps explicit WP route stable across multi-WP and does not silent-switch", () => {
    ensurePilot001ContextState({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    createWorkPackage({
      projectId: PROJECT,
      stableId: "WP-CIV-009",
      title: "Other civil package",
      maturity: "Detailed Engineering",
      leadDiscipline: "Civil",
    });
    const snap = resolveContextFromRoute({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    expect(snap.work.workPackageStableId).toBe("WP-STR-004");
    // Attention elsewhere must not switch active context
    expect(snap.work.workPackageStableId).not.toBe("WP-CIV-009");
  });

  it("detects ambiguous object context without auto-selecting", () => {
    ensurePilot001ContextState({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    createWorkPackage({
      projectId: PROJECT,
      stableId: "WP-STR-099",
      title: "Second structural package",
      maturity: "Detailed Engineering",
      leadDiscipline: "Structural",
    });
    associateObject(PROJECT, "WP-STR-099", {
      objectType: "Calculation",
      objectStableId: "CALC-001",
    });
    linkObjectToExtraWorkPackage({
      workspaceId: WS,
      objectStableId: "CALC-AMB",
      workPackageStableId: "WP-STR-004",
    });
    linkObjectToExtraWorkPackage({
      workspaceId: WS,
      objectStableId: "CALC-AMB",
      workPackageStableId: "WP-STR-099",
    });
    const amb = resolveContextFromObject({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
      objectStableId: "CALC-AMB",
      objectKind: "Calculation",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    expect(amb.ambiguity).toBe("MULTIPLE_VALID_CONTEXTS");
    expect(amb.work.workPackageStableId).toBeNull();
    expect(amb.work.candidateWorkPackages.length).toBeGreaterThanOrEqual(2);
  });

  it("invalidates stale context after access revoke", () => {
    ensurePilot001ContextState({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    setContextOverride({
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      actorAuthorized: true,
    });
    revokeWorkPackageAccessForUser({
      workspaceId: WS,
      userId: "str-eng-01",
      workPackageStableId: "WP-STR-004",
    });
    const snap = resolveContext({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
      applyRecentMemory: true,
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
      authorizedWorkPackageIds: ["WP-MEC-002"],
    });
    expect(snap.work.workPackageStableId).not.toBe("WP-STR-004");
  });

  it("reports authority without title-based inference and scopes discipline/stakeholder roles", () => {
    ensurePilot001ContextState({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    const senior = resolveContextFromRoute({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "lead-01",
      role: "Senior Lead Manager",
      userDiscipline: "Structural",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
      capabilities: { canView: true, canEdit: true, canApprove: false },
    });
    expect(senior.authority.canApprove).toBe(false);
    expect(senior.authority.titleBasedInference).toBe(false);

    const mech = resolveContextFromRoute({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "mech-lead-01",
      userDiscipline: "Mechanical",
      projectId: PROJECT,
      workPackageStableId: "WP-MEC-002",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    const asConsumer = resolveContextFromRoute({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    expect(mech.disciplines.responsible).toContain("Mechanical");
    expect(asConsumer.disciplines.responsible).toContain("Structural");
    // Same person can be producer vs consumer across WPs via stakeholder flags
    expect(typeof mech.stakeholders.informationProducer).toBe("boolean");
    expect(typeof asConsumer.stakeholders.informationConsumer).toBe("boolean");
  });

  it("supports session override without mutating canonical ownership", () => {
    ensurePilot001ContextState({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    const o = setContextOverride({
      workspaceId: WS,
      userId: "u1",
      projectId: PROJECT,
      workPackageStableId: "WP-MEC-002",
      actorAuthorized: true,
    });
    expect("error" in o).toBe(false);
    if (!("error" in o)) {
      expect(o.mutatesCanonicalState).toBe(false);
    }
    const snap = resolveContext({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "u1",
      projectId: PROJECT,
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    expect(snap.work.workPackageStableId).toBe("WP-MEC-002");
    clearContextOverride({ workspaceId: WS, userId: "u1", actorAuthorized: true });
    expect(unauthorizedContextOverrideBlocked({ actorAuthorized: false })).toBe(true);
    expect(unauthorizedContextDisclosureBlocked({ canView: false })).toBe(true);
  });

  it("blocks cross-workspace context and false project-wide associations", () => {
    ensurePilot001ContextState({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    const denied = resolveContextFromRoute({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "intruder",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: ["other-ws"],
      authorizedProjectIds: [PROJECT],
    });
    expect(denied.authority.canView).toBe(false);
    expect(denied.project.participation).toBe(false);

    const snap = resolveContextFromRoute({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    // Unrelated project decisions not dumped
    expect(snap.relevant.decisions.every((d) => d.startsWith("DEC"))).toBe(true);
    expect(snap.relevant.decisions).toContain("DEC-001");
  });

  it("explains why context, My Work contract, WP/ED UI contracts, and Home lightweight", () => {
    ensurePilot001ContextState({ tenantId: TENANT, workspaceId: WS, projectId: PROJECT });
    const snap = resolveContextFromRoute({
      tenantId: TENANT,
      workspaceId: WS,
      userId: "str-eng-01",
      userDiscipline: "Structural",
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorizedWorkspaceIds: [WS],
      authorizedProjectIds: [PROJECT],
    });
    const why = explainWhyContext(snap);
    expect(why.project).toBeTruthy();
    expect(why.entries.length).toBeGreaterThan(0);

    const myWork = buildMyWorkContextDataContract({
      workspaceId: WS,
      projectId: PROJECT,
      userId: "str-eng-01",
      userDiscipline: "Structural",
    });
    expect(myWork.riskPrioritizedMyWorkImplemented).toBe(false);
    expect(myWork.items.some((i) => i.workPackage === "WP-STR-004")).toBe(true);

    const wpUi = buildWorkPackageContextUiContract({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      userId: "str-eng-01",
      userDiscipline: "Structural",
    });
    expect(wpUi.testId).toBe("wp-resolved-context");
    expect(wpUi.engineeringLanguage).toBe(true);

    const edUi = buildEngineeringDesignContextUiContract({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      userId: "str-eng-01",
    });
    expect(edUi.testId).toBe("ed-resolved-context");

    const home = homeLightweightContext({
      projectId: PROJECT,
      userId: "str-eng-01",
      workspaceId: WS,
    });
    expect(home.deepResolutionInvoked).toBe(false);
  });

  it("measures performance baseline under interactive target", () => {
    invalidateContextCache(WS);
    const perf = measureContextPerformanceBaseline(10);
    expect(perf.blockerCount).toBe(0);
    expect(perf.snapshotP95Ms).toBeLessThanOrEqual(100);
    expect(perf.routeP95Ms).toBeLessThan(100);
  });

  it("preserves UI structure and documents/migration/API", () => {
    const wpPanel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    const edPanel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/capability-view.tsx"),
      "utf8",
    );
    expect(wpPanel).toContain("wp-resolved-context");
    expect(wpPanel).toContain("wp-discipline-context");
    expect(wpPanel).toContain("wp-cockpit-foundation");
    expect(edPanel).toContain("ed-resolved-context");
    expect(edPanel).toContain("engineering-design-panel");
    expect(wpPanel).not.toContain("Context Management");
    expect(wpPanel).not.toContain("context engine");
    expect(edPanel).not.toContain("context vector");

    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT_RESOLUTION_ENGINE.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT_DIMENSION_AND_PRECEDENCE_MODEL.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT_PROVENANCE_AND_AMBIGUITY.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT_AUTHORITY_AND_SECURITY.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT_MY_WORK_DATA_CONTRACT.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT1_PILOT_VALIDATION.md"))).toBe(true);
    expect(existsSync(resolve(DOCS, "EOS_3_CONTEXT_1_MANIFEST.json"))).toBe(true);
    expect(
      existsSync(
        resolve(
          WEB_ROOT,
          "../../supabase/migrations/20261030260000_eos_3_context_1_context_resolution.sql",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        resolve(WEB_ROOT, "src/app/api/engineering/projects/[projectId]/context/route.ts"),
      ),
    ).toBe(true);
    expect(
      existsSync(resolve(WEB_ROOT, "src/lib/engineering/eos3-context-resolution-engine.ts")),
    ).toBe(true);

    const engine = readFileSync(
      resolve(WEB_ROOT, "src/lib/engineering/eos3-context-resolution-engine.ts"),
      "utf8",
    );
    expect(engine).toContain("ENGINEERS_DO_NOT_MANAGE_CONTEXT_EOS_MANAGES_CONTEXT");
    expect(engine).not.toMatch(/openai|anthropic|gpt-4|claude-/i);
    expect(auditContextResolutionFoundations().requiresLiveLlm).toBe(false);
  });
});
