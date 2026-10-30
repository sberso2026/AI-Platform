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
import {
  __resetDynamicDisciplineDiscoveryForTests,
  auditDisciplineDiscoveryFoundations,
  buildContextResolutionDisciplineDataContract,
  buildMyWorkDisciplineContextDataContract,
  buildWorkPackageDisciplineContext,
  ensurePilot001DisciplineDiscovery,
  explainWhyDisciplineAffected,
  isEngineeringDiscipline,
  measureDisciplineDiscoveryPerformance,
  normalizeDisciplineName,
  queryAffectedDisciplines,
  queryConsumerDisciplinesForObject,
  queryInformationProviderDisciplines,
  queryProjectDisciplineProfile,
  queryReviewingDisciplines,
  resolveDisciplineConflict,
  runElectricalPositiveDiscoveryScenario,
  runMultiDisciplineDiscoveryScenario,
  runPipingDiscoveryScenario,
  unauthorizedDisciplineWriteBlocked,
} from "../lib/engineering/eos3-dynamic-affected-discipline-discovery";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const TENANT = "00000000-0000-4000-8000-000000000041";
const WS = "00000000-0000-4000-8000-i30001";
const PROJECT = "PILOT-001-I3";

describe("EOS-3-INTELLIGENCE-3 Dynamic Affected Discipline Discovery", () => {
  beforeEach(() => {
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
  });

  it("audits role model and stakeholder/discipline separation", () => {
    const a = auditDisciplineDiscoveryFoundations();
    expect(a.dynamicAffectedDisciplineDiscovery).toBe(true);
    expect(a.initiatingNotCompleteSet).toBe(true);
    expect(a.discoveryRequiresLiveLlm).toBe(false);
    expect(a.approvingDisciplineInference).toBe(false);
    expect(a.patternAutoConfirmation).toBe(false);
    expect(a.manualDisciplineRegisterRequired).toBe(false);
    expect(normalizeDisciplineName("Civil Engineering")).toBe("Civil");
    expect(isEngineeringDiscipline("Vendor")).toBe(false);
    expect(isEngineeringDiscipline("Client")).toBe(false);
    expect(isEngineeringDiscipline("Operations")).toBe(false);
    expect(isEngineeringDiscipline("Structural")).toBe(true);
  });

  it("validates PILOT-001 structural/mechanical/civil and electrical controls", () => {
    const r = ensurePilot001DisciplineDiscovery({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(r.structuralMechanical.byRole.INITIATING).toContain("Structural");
    expect(r.structuralMechanical.byRole.RESPONSIBLE).toContain("Structural");
    expect(r.structuralMechanical.byRole.PRODUCING).toContain("Mechanical");
    expect(r.structuralMechanical.initiatingIsCompleteSet).toBe(false);
    expect(r.civil).toBe(true);
    expect(r.electricalFalsePositive).toBe(false);
    expect(r.opsClientVendorSeparation.vendorIsDiscipline).toBe(false);

    const piping = runPipingDiscoveryScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(piping.some((a) => a.discipline === "Piping")).toBe(true);

    expect(
      queryAffectedDisciplines({
        workspaceId: WS,
        projectId: PROJECT,
        workPackageStableId: "WP-STR-004",
      }).associations.some((a) => a.discipline === "Electrical"),
    ).toBe(false);

    const elec = runElectricalPositiveDiscoveryScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(elec.some((a) => a.discipline === "Electrical")).toBe(true);
  });

  it("supports why/provider/consumer/review queries and contracts", () => {
    ensurePilot001DisciplineDiscovery({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const why = explainWhyDisciplineAffected({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      discipline: "Mechanical",
    });
    expect(why.involved).toBe(true);
    expect(why.explanations.length).toBeGreaterThan(0);

    expect(
      queryInformationProviderDisciplines({
        workspaceId: WS,
        projectId: PROJECT,
        workPackageStableId: "WP-STR-004",
      }).some((a) => a.discipline === "Mechanical"),
    ).toBe(true);

    // Reviewing ≠ all affected
    const reviewing = queryReviewingDisciplines({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    const affected = queryAffectedDisciplines({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(reviewing.length).toBeLessThanOrEqual(affected.associations.length);

    const consumers = queryConsumerDisciplinesForObject({
      workspaceId: WS,
      projectId: PROJECT,
      informationObjectStableId: "CALC-001",
    });
    expect(consumers.some((c) => c.discipline === "Civil")).toBe(true);

    const ctx = buildWorkPackageDisciplineContext({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(ctx.affectedEqualsResponsible).toBe(false);
    expect(ctx.engineeringLanguageLines.length).toBeGreaterThan(0);

    const profile = queryProjectDisciplineProfile({ workspaceId: WS, projectId: PROJECT });
    expect(profile.extensible).toBe(true);
    expect(profile.disciplines.length).toBeGreaterThan(1);

    expect(
      buildMyWorkDisciplineContextDataContract({
        workspaceId: WS,
        projectId: PROJECT,
        userDiscipline: "Structural",
      }).riskPrioritizedMyWorkImplemented,
    ).toBe(false);
    expect(
      buildContextResolutionDisciplineDataContract({
        workspaceId: WS,
        projectId: PROJECT,
        workPackageStableId: "WP-STR-004",
      }).provenancePresent,
    ).toBe(true);
  });

  it("runs multi-discipline, conflict resolution, and auth boundaries", () => {
    ensurePilot001DisciplineDiscovery({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const multi = runMultiDisciplineDiscoveryScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: `${PROJECT}-MD`,
    });
    const names = multi.disciplines.map((d) => d.discipline);
    expect(names).toEqual(
      expect.arrayContaining(["Process", "Mechanical", "Structural", "Civil"]),
    );

    const conflict = resolveDisciplineConflict({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(conflict.retained).toEqual(expect.arrayContaining(["Mechanical", "Structural"]));
    expect(conflict.rolesPreserved).toBe(true);

    expect(
      unauthorizedDisciplineWriteBlocked({ callerWorkspaceId: WS, targetWorkspaceId: "other" }),
    ).toBe(true);
  });

  it("measures performance and preserves UI freeze", () => {
    const perf = measureDisciplineDiscoveryPerformance(5);
    // eslint-disable-next-line no-console
    console.log("EOS_INTELLIGENCE3_PERF", JSON.stringify(perf));
    expect(perf.blockerCount).toBe(0);

    for (const f of [
      "EOS_3_DYNAMIC_AFFECTED_DISCIPLINE_DISCOVERY.md",
      "EOS_3_DISCIPLINE_ROLE_MODEL.md",
      "EOS_3_DISCIPLINE_DISCOVERY_EVIDENCE_AND_CONFIDENCE.md",
      "EOS_3_DISCIPLINE_STAKEHOLDER_SEPARATION.md",
      "EOS_3_DISCIPLINE_DISCOVERY_AUTHORITY.md",
      "EOS_3_INTELLIGENCE3_PILOT_VALIDATION.md",
      "EOS_3_INTELLIGENCE_3_MANIFEST.json",
    ]) {
      expect(existsSync(resolve(DOCS, f))).toBe(true);
    }
    expect(
      existsSync(
        resolve(
          WEB_ROOT,
          "../../supabase/migrations/20261030250000_eos_3_intelligence_3_discipline_discovery.sql",
        ),
      ),
    ).toBe(true);

    const home = readFileSync(resolve(WEB_ROOT, "src/app/(platform)/engineering/page.tsx"), "utf8");
    expect(home).toContain("approved-engineering-1c-locked");
    expect(home).not.toContain("discipline-discovery-engine");

    const wpPanel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    expect(wpPanel).toContain("wp-discipline-context");
    expect(wpPanel).toContain("Providing equipment loads");
    expect(wpPanel).not.toContain("inferred discipline node");

    const nav = readFileSync(
      resolve(WEB_ROOT, "../../packages/platform-core/src/navigation.ts"),
      "utf8",
    );
    expect(nav).not.toMatch(/label:\s*"Discipline Discovery"/);
  });
});
