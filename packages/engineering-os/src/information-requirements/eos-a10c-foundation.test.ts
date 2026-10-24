import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { describe, expect, it } from "vitest";
import { REQUIREMENT_TYPES } from "../control-intelligence/invariants";
import { traverseThread } from "../digital-thread/traversal";
import { INFORMATION_REQUIREMENT_TYPES } from "./types";
import { A11A_COMPATIBILITY, LIFECYCLE_INFORMATION_PROFILES } from "./catalog";
import {
  candidateAssuranceConditions,
  composeAnalysisInformationInputs,
  composeDeliverableInformationRequirements,
  INFORMATION_REQUIREMENT_RECON,
  informationRequirementThreadGraph,
} from "./compose";
import {
  A10A_MECH_LOAD_ID,
  A10A_SOURCE_B_ID,
  A10C_CONSTRUCTION_REQUEST_ID,
  A10C_GEO_REF_ID,
  A10C_INTERFACE_ID,
  A10C_INTERFACE_LOAD_REF_ID,
  A10C_MANAGED_REPO_ID,
  A10C_SURVEY_REF_ID,
  A10C_SYSTEM_ID,
  A10C_TEST_REF_ID,
  a10cAuthorityPolicies,
  constructionDrawingRef,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  foundationInformationRefs,
  handoverInformationRefs,
  interfaceLoadRef,
} from "./fixture";
import { createMemoryInformationRequirementStore } from "./memory-store";
import { EngineeringInformationRequirementService } from "./service";
import { INFORMATION_REQUIREMENT_AI_BOUNDARY } from "./types";

function commerce(action: "analysis.read" | "analysis.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function stubClient() {
  return { from() { return this; } } as never;
}

function service() {
  return new EngineeringInformationRequirementService(stubClient(), createMemoryInformationRequirementStore());
}

async function accept(
  svc: EngineeringInformationRequirementService,
  requirementId: string,
  informationRefId: string,
) {
  await svc.applyAction(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
    requirementId,
    action: "receiveInformation",
    informationRefId,
    managedRepositoryId: A10C_MANAGED_REPO_ID,
  });
  return svc.applyAction(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
    requirementId,
    action: "acceptForPurpose",
    informationRefId,
    managedRepositoryId: A10C_MANAGED_REPO_ID,
  });
}

describe("EOS-A10C Engineering Information Requirements, Exchange & Handover", () => {
  it("keeps information requirements distinct from engineering system requirements", () => {
    expect(INFORMATION_REQUIREMENT_RECON.engineeringRequirements).toBe("REUSE");
    expect(INFORMATION_REQUIREMENT_RECON.interfaces).toBe("COMPOSE");
    expect(INFORMATION_REQUIREMENT_TYPES).not.toEqual(expect.arrayContaining([...REQUIREMENT_TYPES]));
    expect(REQUIREMENT_TYPES).not.toContain("DESIGN_INPUT");
    expect(INFORMATION_REQUIREMENT_TYPES).not.toContain("FUNCTIONAL");
    expect(LIFECYCLE_INFORMATION_PROFILES.FEED).toContain("design criteria");
    expect(A11A_COMPATIBILITY.calculationGenerationImplemented).toBe(false);
  });

  it("runs the crusher foundation workflow from BLOCKED_INFORMATION_MISSING to READY", async () => {
    const svc = service();
    const required = svc.getRequiredInformationForWork("FOUNDATION_CALCULATION", "FEED");
    expect(required.map((row) => row.title)).toEqual([
      "Structural design criteria",
      "Mechanical equipment reactions",
      "Geotechnical bearing capacity",
      "Survey level",
    ]);
    const created = await svc.instantiateWorkRequirements(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      lifecycleStage: "FEED",
      systemId: A10C_SYSTEM_ID,
      deliverableId: "str-anl-feed",
    });
    expect(created).toHaveLength(4);
    const byTitle = Object.fromEntries(created.map((row) => [row.title, row]));
    const refs = foundationInformationRefs();
    const policies = a10cAuthorityPolicies();
    await accept(svc, byTitle["Structural design criteria"]!.id, A10A_SOURCE_B_ID);
    await accept(svc, byTitle["Mechanical equipment reactions"]!.id, A10A_MECH_LOAD_ID);
    await accept(svc, byTitle["Survey level"]!.id, A10C_SURVEY_REF_ID);
    const blocked = await svc.resolveWorkReadiness(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      refs,
      policies,
    });
    expect(blocked.state).toBe("BLOCKED_INFORMATION_MISSING");
    expect(blocked.available).toHaveLength(3);
    expect(blocked.missing).toHaveLength(1);
    expect(blocked.projectReadinessScore).toBeNull();
    expect(blocked.engineeringApproved).toBe(false);
    const startBlocked = await svc.startWork(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      refs,
      policies,
    });
    expect(startBlocked.allowed).toBe(false);
    await accept(svc, byTitle["Geotechnical bearing capacity"]!.id, A10C_GEO_REF_ID);
    const t0 = Date.now();
    const ready = await svc.resolveWorkReadiness(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      refs,
      policies,
    });
    const readinessMs = Date.now() - t0;
    expect(ready.state).toBe("READY");
    expect(ready.available).toHaveLength(4);
    expect(ready.engineeringApproved).toBe(false);
    const started = await svc.startWork(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      refs,
      policies,
    });
    expect(started.allowed).toBe(true);
    expect(started.autoApproved).toBe(false);
    expect(readinessMs).toBeLessThan(1000);
    expect(INFORMATION_REQUIREMENT_AI_BOUNDARY.mayApproveEngineering).toBe(false);
  });

  it("keeps Mechanical provider / Structural consumer separate from the Interface object", async () => {
    const svc = service();
    const created = await svc.instantiateWorkRequirements(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CROSS_DISCIPLINE_INTERFACE",
      lifecycleStage: "FEED",
      systemId: A10C_SYSTEM_ID,
      interfaceId: A10C_INTERFACE_ID,
    });
    expect(created).toHaveLength(1);
    expect(created[0]!.providerDiscipline).toBe("MECHANICAL");
    expect(created[0]!.consumerDiscipline).toBe("STRUCTURAL");
    expect(created[0]!.interfaceId).toBe(A10C_INTERFACE_ID);
    expect(svc.catalog().interfaceRemainsSeparate).toBe(true);
    const refs = [interfaceLoadRef()];
    const policies = a10cAuthorityPolicies();
    const received = await svc.applyAction(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      requirementId: created[0]!.id,
      action: "receiveInformation",
      informationRefId: A10C_INTERFACE_LOAD_REF_ID,
      managedRepositoryId: A10C_MANAGED_REPO_ID,
    });
    expect(received.requirement.status).toBe("RECEIVED");
    const unaccepted = await svc.resolveWorkReadiness(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CROSS_DISCIPLINE_INTERFACE",
      refs,
      policies,
    });
    expect(unaccepted.state).toBe("BLOCKED_INFORMATION_UNACCEPTED");
    await svc.applyAction(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      requirementId: created[0]!.id,
      action: "acceptForPurpose",
      informationRefId: A10C_INTERFACE_LOAD_REF_ID,
      managedRepositoryId: A10C_MANAGED_REPO_ID,
    });
    const ready = await svc.resolveWorkReadiness(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CROSS_DISCIPLINE_INTERFACE",
      refs,
      policies,
    });
    expect(ready.state).toBe("READY");
    expect(ready.engineeringApproved).toBe(false);
  });

  it("models a construction RFI/TQ information need without an Aconex connector", async () => {
    const svc = service();
    const created = await svc.instantiateWorkRequirements(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CONSTRUCTION_CLARIFICATION",
      lifecycleStage: "CONSTRUCTION",
      constructionRequestId: A10C_CONSTRUCTION_REQUEST_ID,
    });
    expect(created[0]!.constructionRequestId).toBe(A10C_CONSTRUCTION_REQUEST_ID);
    expect(created[0]!.title).toMatch(/Anchor bolt/);
    const requested = await svc.applyAction(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      requirementId: created[0]!.id,
      action: "requestInformation",
    });
    expect(requested.workEventType).toBe("INFORMATION_REQUESTED");
    await accept(svc, created[0]!.id, constructionDrawingRef().id);
    const ready = await svc.resolveWorkReadiness(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "CONSTRUCTION_CLARIFICATION",
      refs: [constructionDrawingRef()],
      policies: a10cAuthorityPolicies(),
    });
    expect(ready.state).toBe("READY");
  });

  it("evaluates handover completeness without a percentage and retains human acceptance", async () => {
    const svc = service();
    const created = await svc.instantiateWorkRequirements(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "SUBSYSTEM_HANDOVER",
      lifecycleStage: "COMMISSIONING",
      systemId: A10C_SYSTEM_ID,
    });
    expect(created).toHaveLength(4);
    const pkg = await svc.assembleHandoverPackage(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      displayName: "Primary crushing subsystem handover",
      systemId: A10C_SYSTEM_ID,
      requirementIds: created.map((row) => row.id),
    });
    const refs = handoverInformationRefs();
    const policies = a10cAuthorityPolicies();
    for (const row of created.filter((item) => item.title !== "Commissioning test")) {
      const match = refs.find((ref) => ref.informationType === row.informationType)!;
      await accept(svc, row.id, match.id);
    }
    const incomplete = await svc.evaluateHandover(commerce("analysis.read"), CRUSHER_FEED_TENANT, pkg.id, refs, policies);
    expect(incomplete.completeness.completeness).toBe("INCOMPLETE");
    expect(incomplete.completeness.completenessPercent).toBeNull();
    expect(incomplete.completeness.humanAcceptanceRequired).toBe(true);
    expect(incomplete.package.state).toBe("ASSEMBLING");
    await expect(svc.acceptHandover(commerce("analysis.write"), CRUSHER_FEED_TENANT, pkg.id, "eng-admin")).rejects.toThrow(
      /handover_not_ready_for_acceptance/,
    );
    await accept(svc, created.find((row) => row.title === "Commissioning test")!.id, A10C_TEST_REF_ID);
    const complete = await svc.evaluateHandover(commerce("analysis.read"), CRUSHER_FEED_TENANT, pkg.id, refs, policies);
    expect(complete.completeness.completeness).toBe("COMPLETE");
    expect(complete.package.state).toBe("READY_FOR_REVIEW");
    const accepted = await svc.acceptHandover(commerce("analysis.write"), CRUSHER_FEED_TENANT, pkg.id, "eng-admin");
    expect(accepted.state).toBe("ACCEPTED");
    expect(accepted.acceptedBy).toBe("eng-admin");
    expect(svc.catalog().noUniversalCompletenessPercent).toBe(true);
  });

  it("does not let an unmanaged local file silently satisfy a requirement", async () => {
    const svc = service();
    const created = await svc.instantiateWorkRequirements(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      lifecycleStage: "FEED",
    });
    const geo = created.find((row) => row.requirementType === "GEOTECHNICAL_DATA")!;
    await svc.applyAction(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      requirementId: geo.id,
      action: "receiveInformation",
      informationRefId: "C:\\Temp\\bearing.xlsx",
      unmanaged: true,
    });
    const evaluated = await svc.evaluateAll(
      commerce("analysis.read"),
      CRUSHER_FEED_TENANT,
      CRUSHER_EXPANSION_FEED_PROJECT_ID,
      foundationInformationRefs(),
      a10cAuthorityPolicies(),
    );
    const geoEval = evaluated.evaluations.find((row) => row.requirementId === geo.id)!;
    expect(geoEval.satisfied).toBe(false);
    expect(geoEval.unmanagedRejected).toBe(true);
    expect(geoEval.explanation).toMatch(/Managed repository/i);
  });

  it("composes Digital Thread, deliverables, analysis, and assurance without auto-findings", async () => {
    const svc = service();
    const created = await svc.instantiateWorkRequirements(commerce("analysis.write"), CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      workType: "FOUNDATION_CALCULATION",
      lifecycleStage: "FEED",
      interfaceId: A10C_INTERFACE_ID,
      deliverableId: "str-anl-feed",
    });
    const graph = informationRequirementThreadGraph({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      requirement: created[0]!,
      informationRefId: A10A_SOURCE_B_ID,
    });
    const traversal = traverseThread(graph, {
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      root: { objectType: "engineering_information_requirement", objectId: created[0]!.id },
      direction: "both",
      maxDepth: 3,
    });
    expect(graph.nodes.some((node) => node.objectType === "interface")).toBe(true);
    expect(graph.nodes.some((node) => node.objectType === "requirement")).toBe(true);
    expect(traversal.relationships.some((rel) => rel.relationship === "USES")).toBe(true);
    const deliverable = composeDeliverableInformationRequirements(true, 1);
    expect(deliverable.maturityUpgraded).toBe(false);
    expect(composeAnalysisInformationInputs(["Structural design criteria"]).solverExecuted).toBe(false);
    const assurance = candidateAssuranceConditions(
      [{ satisfied: false, stale: false, acceptedForPurpose: false, superseded: false }],
      true,
    );
    expect(assurance.automaticFinding).toBe(false);
    expect(assurance.conditions).toContain("REQUIRED_INFORMATION_MISSING");
    expect(assurance.conditions).toContain("HANDOVER_INFORMATION_MISSING");
  });
});
