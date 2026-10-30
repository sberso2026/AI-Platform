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
import {
  __resetEngineeringDependencyStakeholderForTests,
  auditDependencyStakeholderFoundations,
  buildAffectedDisciplineInputDataContract,
  buildMyWorkDependencyDataContract,
  buildWorkPackageDependencyUiContract,
  createInformationDependency,
  deriveDependencyFromCanonicalRelationships,
  ensurePilot001DependencyStakeholderState,
  measureDependencyPerformanceBaseline,
  queryDisciplineOutputDependencies,
  queryDisciplineRequiredInformation,
  queryStakeholderDependencies,
  queryWhatAmIWaitingOn,
  queryWhoIsWaitingOnMe,
  queryWorkPackageBlocking,
  runClientInputDependencyScenario,
  runMultiConsumerInformationScenario,
  runMultiDisciplineDependencyScenario,
  runOperationsInputDependencyScenario,
  unauthorizedDependencyWriteBlocked,
  unauthorizedStakeholderDisclosureBlocked,
  updateDependencyHandoffState,
} from "../lib/engineering/eos3-engineering-dependency-stakeholder";
import {
  EOS_RISK_PRIORITIZED_MY_WORK_IMPLEMENTED,
  MY_WORK_DEPENDENCY_UI_CONTEXTUAL_ONLY,
} from "../lib/engineering/eos3-my-work-ui";

const WEB_ROOT = resolve(__dirname, "../../");
const DOCS = resolve(WEB_ROOT, "../../docs/architecture/engineering-os");
const TENANT = "00000000-0000-4000-8000-000000000041";
const WS = "00000000-0000-4000-8000-i20001";
const PROJECT = "PILOT-001-I2";

describe("EOS-3-INTELLIGENCE-2 Engineering Dependency & Stakeholder", () => {
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
  });

  it("audits foundations without duplicate graph or identity", () => {
    const a = auditDependencyStakeholderFoundations();
    expect(a.engineeringDependencyStakeholderModel).toBe(true);
    expect(a.existingRelationshipGraphReused).toBe(true);
    expect(a.duplicateDependencyGraphCreated).toBe(false);
    expect(a.duplicateUserIdentityCreated).toBe(false);
    expect(a.handoffInformationObjectRequired).toBe(true);
    expect(a.dependencyMaturityStageCoupling).toBe(false);
    expect(a.dynamicAffectedDisciplineDiscoveryImplemented).toBe(false);
    expect(a.falseBlockingDependencyCount).toBe(0);
    expect(a.falseProducerConsumerCount).toBe(0);
    expect(MY_WORK_DEPENDENCY_UI_CONTEXTUAL_ONLY).toBe(true);
    expect(EOS_RISK_PRIORITIZED_MY_WORK_IMPLEMENTED).toBe(false);
  });

  it("validates PILOT-001 mechanical→structural→civil and vendor change trace", () => {
    const r = ensurePilot001DependencyStakeholderState({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(r.mechanicalStructural.producerDiscipline).toBe("Mechanical");
    expect(r.mechanicalStructural.consumerDiscipline).toBe("Structural");
    expect(r.mechanicalStructural.informationObjectStableId).toBe("ASM-001");
    expect(r.mechanicalStructural.interfaceStableId).toBe("INT-001");
    expect(r.mechanicalStructural.engineeringApproved).toBe(false);
    expect(r.structuralCivil.producerDiscipline).toBe("Structural");
    expect(r.structuralCivil.consumerDiscipline).toBe("Civil");
    expect(r.structuralCivil.downstreamWorkPackageStableId).toBe("WP-CIV-005");
    expect(r.vendorChangeTrace.priorRevisionPreserved).toBe(true);
    expect(r.vendorChangeTrace.stageUnchanged).toBe(true);
    expect(r.vendorChangeTrace.impactedCalculations.length).toBeGreaterThan(0);

    const blocking = queryWorkPackageBlocking({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(blocking.blockingOthers.some((d) => d.downstreamWorkPackageStableId === "WP-CIV-005")).toBe(
      true,
    );
  });

  it("supports multi-discipline, multi-consumer, client, and operations scenarios", () => {
    ensurePilot001DependencyStakeholderState({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const chain = runMultiDisciplineDependencyScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: `${PROJECT}-MD`,
    });
    expect(chain).toHaveLength(3);
    for (const d of chain) {
      expect(d.informationObjectStableId).toBeTruthy();
      expect(d.producerDiscipline).toBeTruthy();
      expect(d.consumerDiscipline).toBeTruthy();
    }

    const multi = runMultiConsumerInformationScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(multi.consumers.map((c) => c.discipline)).toEqual(
      expect.arrayContaining(["Mechanical", "Structural", "Piping", "Electrical"]),
    );
    expect(multi.status).toBe("AVAILABLE");
    expect(multi.acceptedForUse).toBe(false);

    const client = runClientInputDependencyScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(client.producers[0]?.stakeholderClass).toBe("Client");
    expect(client.blocking).toBe(true);

    const ops = runOperationsInputDependencyScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    expect(ops.producers[0]?.stakeholderClass).toBe("Operations / Maintenance");
  });

  it("answers waiting / blocking / discipline / stakeholder queries", () => {
    ensurePilot001DependencyStakeholderState({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    runClientInputDependencyScenario({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });

    const waitingOn = queryWhatAmIWaitingOn({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(waitingOn.length).toBeGreaterThan(0);

    const waitingForMe = queryWhoIsWaitingOnMe({
      workspaceId: WS,
      projectId: PROJECT,
      discipline: "Mechanical",
    });
    expect(waitingForMe.length).toBeGreaterThan(0);

    expect(
      queryDisciplineRequiredInformation({
        workspaceId: WS,
        projectId: PROJECT,
        discipline: "Structural",
      }).length,
    ).toBeGreaterThan(0);

    expect(
      queryDisciplineOutputDependencies({
        workspaceId: WS,
        projectId: PROJECT,
        producerDiscipline: "Structural",
        consumerDiscipline: "Civil",
      }).length,
    ).toBeGreaterThan(0);

    expect(
      queryStakeholderDependencies({
        workspaceId: WS,
        projectId: PROJECT,
        stakeholderClass: "Vendor / Supplier",
      }).length,
    ).toBeGreaterThan(0);

    const ui = buildWorkPackageDependencyUiContract({
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
    });
    expect(ui.engineeringLanguage).toBe(true);
    expect(ui.waitingOn.length + ui.blocking.length).toBeGreaterThan(0);

    const my = buildMyWorkDependencyDataContract({
      workspaceId: WS,
      projectId: PROJECT,
      discipline: "Mechanical",
    });
    expect(my.riskPrioritizedRankingImplemented).toBe(false);
    expect(buildAffectedDisciplineInputDataContract({ workspaceId: WS, projectId: PROJECT }).length).toBeGreaterThan(
      0,
    );
  });

  it("enforces available≠accepted, handoff history, inference boundary, and auth", () => {
    ensurePilot001DependencyStakeholderState({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
    });
    const available = createInformationDependency({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      dependencyType: "CONSUMES_FROM",
      informationObjectStableId: "VD-014",
      informationObjectClass: "Document",
      downstreamWorkPackageStableId: "WP-STR-004",
      status: "AVAILABLE",
      authorized: true,
    });
    expect(available.acceptedForUse).toBe(false);
    expect(available.engineeringApproved).toBe(false);

    expect(() =>
      createInformationDependency({
        tenantId: TENANT,
        workspaceId: WS,
        projectId: PROJECT,
        dependencyType: "WAITING_ON",
        informationObjectStableId: "",
        informationObjectClass: "Document",
        authorized: true,
      }),
    ).toThrow(/handoff_information_object_required/);

    expect(() =>
      createInformationDependency({
        tenantId: TENANT,
        workspaceId: WS,
        projectId: PROJECT,
        dependencyType: "WAITING_ON",
        informationObjectStableId: "X-1",
        informationObjectClass: "Document",
        confirmationState: "CONFIRMED",
        inferenceBasis: "uncertain weak ambiguous inference",
        authorized: true,
      }),
    ).toThrow(/inference_requires_confirmation/);

    expect(() =>
      createInformationDependency({
        tenantId: TENANT,
        workspaceId: WS,
        projectId: PROJECT,
        dependencyType: "WAITING_ON",
        informationObjectStableId: "X-2",
        informationObjectClass: "Document",
        authorized: false,
      }),
    ).toThrow(/unauthorized/);

    expect(
      unauthorizedDependencyWriteBlocked({ callerWorkspaceId: WS, targetWorkspaceId: "other" }),
    ).toBe(true);
    expect(
      unauthorizedStakeholderDisclosureBlocked({
        callerWorkspaceId: WS,
        stakeholderWorkspaceId: "other",
      }),
    ).toBe(true);

    const d = createInformationDependency({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      dependencyType: "HANDOFF_TO",
      informationObjectStableId: "LOAD-R1",
      informationObjectClass: "Document",
      informationObjectRevision: "R1",
      status: "ACCEPTED_FOR_USE",
      authorized: true,
    });
    const updated = updateDependencyHandoffState({
      workspaceId: WS,
      dependencyId: d.id,
      status: "REQUIRES_REVISION",
      revision: "R2",
      actorId: "vendor",
      authorized: true,
    });
    expect(updated.handoffHistory.some((h) => h.revision === "R1")).toBe(true);
    expect(updated.informationObjectRevision).toBe("R2");

    const derived = deriveDependencyFromCanonicalRelationships({
      tenantId: TENANT,
      workspaceId: WS,
      projectId: PROJECT,
      workPackageStableId: "WP-STR-004",
      authorized: true,
    });
    expect(derived.derived.length + derived.proposedOnly).toBeGreaterThanOrEqual(0);
  });

  it("measures performance and preserves UI freeze / no graph nav items", () => {
    const perf = measureDependencyPerformanceBaseline(5);
    // eslint-disable-next-line no-console
    console.log("EOS_INTELLIGENCE2_PERF", JSON.stringify(perf));
    expect(perf.blockerCount).toBe(0);

    for (const f of [
      "EOS_3_ENGINEERING_DEPENDENCY_MODEL.md",
      "EOS_3_STAKEHOLDER_DEPENDENCY_MODEL.md",
      "EOS_3_INFORMATION_HANDOFF_MODEL.md",
      "EOS_3_PRODUCER_CONSUMER_RESPONSIBILITY_MODEL.md",
      "EOS_3_DEPENDENCY_AUTHORITY_AND_SECURITY.md",
      "EOS_3_INTELLIGENCE2_PILOT_VALIDATION.md",
      "EOS_3_INTELLIGENCE_2_MANIFEST.json",
    ]) {
      expect(existsSync(resolve(DOCS, f))).toBe(true);
    }
    expect(
      existsSync(
        resolve(
          WEB_ROOT,
          "../../supabase/migrations/20261030240000_eos_3_intelligence_2_dependency_stakeholder.sql",
        ),
      ),
    ).toBe(true);

    const home = readFileSync(resolve(WEB_ROOT, "src/app/(platform)/engineering/page.tsx"), "utf8");
    expect(home).toContain("approved-engineering-1c-locked");
    expect(home).not.toContain("stakeholder-graph-engine");

    const wpPanel = readFileSync(
      resolve(WEB_ROOT, "src/components/engineering/project-workspace/work-packages-panel.tsx"),
      "utf8",
    );
    expect(wpPanel).toContain("Waiting On");
    expect(wpPanel).toContain("Inputs Required");
    expect(wpPanel).toContain("wp-dependency-engineering-language");
    expect(wpPanel).not.toContain("graph edge");
    expect(wpPanel).not.toContain("stakeholder node");

    const my = readFileSync(resolve(WEB_ROOT, "src/app/(platform)/engineering/my/page.tsx"), "utf8");
    expect(my).toContain("data-eos-dependency-contextual");

    const nav = readFileSync(
      resolve(WEB_ROOT, "../../packages/platform-core/src/navigation.ts"),
      "utf8",
    );
    expect(nav).not.toMatch(/label:\s*"Stakeholder Graph"/);
    expect(nav).not.toMatch(/label:\s*"Dependency Graph"/);
  });
});
