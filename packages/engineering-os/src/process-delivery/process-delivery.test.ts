import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addEnergyBalance,
  addInput,
  addMassBalance,
  addModel,
  addProcessBasis,
  addStream,
  attachProcess,
  closeSafetyAction,
  createProcessDelivery,
  deliverableReadiness,
  freezeProcess,
  processAdvisory,
  processHome,
  progressProcessStage,
  registerSimulator,
  reviewProcess,
  reviseInput,
  unimplementedProcessCalculations,
} from "./engine";
import type { ProcessActor } from "./engine";

const actor: ProcessActor = {
  actorId: "gov-1",
  actorRole: "lifecycle_governor",
  at: "2026-10-28T15:00:00Z",
  workspaceId: "workspace-a",
  canAuthorizeLifecycleTransition: true,
  canApprove: true,
};

function must<T extends { error: string | null; delivery: unknown }>(result: T): T {
  expect(result.error).toBeNull();
  return result;
}

describe("EOS 2.4 process design delivery", () => {
  it("moves a synthetic gas conditioning unit through the lifecycle without calculating process results", () => {
    let delivery = must(createProcessDelivery({
      id: "proc-1",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "eos-process-demo",
      projectTitle: "EOS Process Design Delivery Demo",
      actorId: actor.actorId,
      at: actor.at,
    })).delivery;
    expect(delivery.lifecycle.stage).toBe("not_classified");
    expect(delivery.audits[0]?.detail.legacyEnrolled).toBe(false);
    delivery = must(progressProcessStage(delivery, actor, "concept", "classify concept")).delivery;
    delivery = must(addProcessBasis(delivery, actor, { id: "db-1", title: "Feed basis", statement: "Synthetic feed gas", status: "draft" })).delivery;
    delivery = must(attachProcess(delivery, actor, "options", { id: "opt-a", title: "Adsorption dehydration", route: "adsorption_dehydration", stage: "concept", facts: ["GCU-001"], assumptions: ["Capacity is preliminary"], estimates: [], unresolved: ["Vendor performance"] })).delivery;
    delivery = must(attachProcess(delivery, actor, "options", { id: "opt-b", title: "Absorption dehydration", route: "absorption_dehydration", stage: "concept", facts: ["GCU-001"], assumptions: ["No commercial claim"], estimates: [], unresolved: ["Solvent duty"] })).delivery;
    delivery = must(attachProcess(delivery, actor, "assumptions", { id: "as-1", statement: "Capacity is an assumption", stage: "concept", blocksNextStage: false })).delivery;
    delivery = must(attachProcess(delivery, actor, "decisions", { id: "dec-1", statement: "Prefer adsorption for the synthetic unit", stage: "concept" })).delivery;
    delivery = must(progressProcessStage(delivery, actor, "feasibility", "concept gate")).delivery;

    delivery = must(attachProcess(delivery, actor, "cases", { id: "case-1", kind: "normal", name: "Normal", stage: "feasibility" })).delivery;
    delivery = must(addInput(delivery, actor, { id: "in-1", name: "Feed gas composition", value: null, unit: null, revision: 1, status: "current", synthetic: true })).delivery;
    delivery = must(addStream(delivery, actor, {
      id: "stream-1", name: "Feed gas", fromSystemId: null, toSystemId: null, phase: "vapor", flow: null, flowUnit: null, pressure: null, pressureUnit: null,
      temperature: null, temperatureUnit: null, caseId: "case-1", inputIds: ["in-1"], revision: 1, status: "current", freshness: "current", synthetic: true,
    })).delivery;
    const calculated = addMassBalance(delivery, actor, { id: "mb-calc", caseId: "case-1", inputIds: ["in-1"], totalFlow: null, unit: null, freshness: "current", synthetic: true, calculatedHere: false, calculate: true });
    expect(calculated.error).toMatch(/not calculated/);
    delivery = must(addMassBalance(delivery, actor, { id: "mb-1", caseId: "case-1", inputIds: ["in-1"], totalFlow: null, unit: null, freshness: "current", synthetic: true, calculatedHere: false })).delivery;
    delivery = must(addEnergyBalance(delivery, actor, { id: "eb-1", caseId: "case-1", inputIds: ["in-1"], duty: null, unit: null, freshness: "current", synthetic: true, calculatedHere: false })).delivery;
    delivery = must(addModel(delivery, actor, { id: "model-1", purpose: "Synthetic fixture", tool: "synthetic_fixture", revision: 1, inputIds: ["in-1"], freshness: "current", executionCertified: false })).delivery;
    delivery = must(attachProcess(delivery, actor, "duties", { id: "duty-1", equipment: "compressor", duty: null, unit: null, inputIds: ["in-1"], freshness: "current", synthetic: true })).delivery;
    delivery = must(attachProcess(delivery, actor, "utilities", { id: "util-1", utility: "power", demand: null, unit: null, inputIds: ["in-1"], freshness: "current" })).delivery;
    delivery = must(attachProcess(delivery, actor, "risks", { id: "risk-1", statement: "Synthetic dehydration uncertainty", stage: "feasibility" })).delivery;
    delivery = must(attachProcess(delivery, actor, "interfaces", { id: "if-1", consumer: "mechanical", parameter: "compressor duty", status: "proposed", inputId: "in-1", freshness: "current" })).delivery;
    delivery = must(attachProcess(delivery, actor, "pfds", { id: "pfd-1", title: "Preliminary PFD", revision: 1, stage: "feasibility", inputIds: ["in-1"], freshness: "current", draftedHere: false })).delivery;
    delivery = must(progressProcessStage(delivery, actor, "feed", "feasibility gate")).delivery;

    delivery = must(addProcessBasis(delivery, actor, { id: "db-feed", title: "Controlled process basis", statement: "Synthetic FEED basis", status: "accepted_for_stage" })).delivery;
    expect(delivery.basis.basisItems.find((item) => item.id === "db-feed")?.approvalGranted).toBe(false);
    delivery = must(attachProcess(delivery, actor, "requirements", { id: "req-1", title: "Product gas water content", sourceId: "src-1", stage: "feed" })).delivery;
    delivery = must(attachProcess(delivery, actor, "interfaces", { id: "if-2", consumer: "piping", parameter: "stream conditions", status: "accepted", inputId: "in-1", freshness: "current" })).delivery;
    delivery = must(attachProcess(delivery, actor, "systems", { id: "sys-1", name: "Dehydration", stage: "feed" })).delivery;
    delivery = must(attachProcess(delivery, actor, "pids", { id: "pid-1", title: "FEED P&ID", revision: 1, stage: "feed", inputIds: ["in-1"], freshness: "current", draftedHere: false })).delivery;
    delivery = must(attachProcess(delivery, actor, "safetyActions", { id: "haz-1", study: "HAZOP", statement: "Synthetic action", status: "open", closedByAi: false })).delivery;
    delivery = must(attachProcess(delivery, actor, "deliverables", { id: "del-feed", title: "Process FEED basis", stage: "feed", maturity: "feed", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, freshness: "current", inputIds: ["in-1"], ifc: false })).delivery;
    const frozen = must(freezeProcess(delivery, actor, "feed_baseline", "base-feed"));
    delivery = frozen.delivery;
    const snapshot = delivery.baselines[0];
    delivery = must(progressProcessStage(delivery, actor, "detailed_engineering", "feed gate")).delivery;

    delivery = must(attachProcess(delivery, actor, "calculations", { id: "cal-1", purpose: "Imported reference", inputIds: ["in-1"], engine: "imported_reference", freshness: "current", synthetic: true })).delivery;
    delivery = must(attachProcess(delivery, actor, "runs", { id: "run-1", modelId: "model-1", provenance: "synthetic fixture; no result invented", convergenceClaimed: false, synthetic: true })).delivery;
    delivery = must(attachProcess(delivery, actor, "reliefCases", { id: "rel-1", scenario: "blocked outlet", rate: null, status: "CALCULATION_EXTERNAL_OR_NOT_IMPLEMENTED" })).delivery;
    delivery = must(attachProcess(delivery, actor, "deliverables", { id: "del-1", title: "Detailed process package", stage: "detailed_engineering", maturity: "detailed_engineering", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, freshness: "current", inputIds: ["in-1"], ifc: false })).delivery;
    expect(deliverableReadiness(delivery, "del-1").ifc).toBe(false);
    const aiClose = closeSafetyAction(delivery, { ...actor, actorRole: "ai" }, "haz-1");
    expect(aiClose.error).toMatch(/AI cannot close/);

    const revised = must(reviseInput(delivery, actor, "in-1", "revised synthetic composition"));
    delivery = revised.delivery;
    expect(delivery.models[0]?.freshness).toBe("potentially_stale");
    expect(delivery.massBalances[0]?.freshness).toBe("potentially_stale");
    expect(delivery.energyBalances[0]?.freshness).toBe("potentially_stale");
    expect(delivery.streams[0]?.freshness).toBe("potentially_stale");
    expect(delivery.duties[0]?.freshness).toBe("potentially_stale");
    expect(delivery.utilities[0]?.freshness).toBe("potentially_stale");
    expect(delivery.pfds[0]?.freshness).toBe("potentially_stale");
    expect(delivery.pids[0]?.freshness).toBe("potentially_stale");
    expect(delivery.interfaces.find((item) => item.id === "if-2")?.freshness).toBe("potentially_stale");
    expect(delivery.massBalances[0]?.totalFlow).toBeNull();
    expect(delivery.reliefCases[0]?.rate).toBeNull();
    expect(snapshot?.inputIds).toEqual(["in-1"]);
    expect(revised.delivery.audits.some((item) => item.detail.recalculated === false)).toBe(true);
    expect(processAdvisory(delivery)).toMatch(/does not invent process results/);
    expect(processHome(delivery).staleModels).toBe(1);
  });

  it("refuses invented simulator certification, owner approval, and another workspace", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(unimplementedProcessCalculations().map((item) => item.id)).toEqual(expect.arrayContaining(["mass_balance_calculation", "relief_sizing_calculation", "hosted_simulator_execution", "pfd_pid_drafting"]));
    let delivery = createProcessDelivery({
      id: "proc-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-process-demo", projectTitle: "EOS Process Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    }).delivery;
    expect(registerSimulator(delivery, actor, { id: "sim-1", tool: "ASPEN_HYSYS", certifyExecution: true }).error).toMatch(/not certified/);
    delivery = must(registerSimulator(delivery, actor, { id: "sim-1", tool: "ASPEN_HYSYS" })).delivery;
    expect(delivery.simulatorPackages[0]?.executionCertified).toBe(false);
    expect(reviewProcess(delivery, { ...actor, actorRole: "owner", canApprove: true }, { id: "rev-1", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(addInput(delivery, { ...actor, workspaceId: "workspace-b" }, { id: "in-x", name: "Other", value: null, unit: null, revision: 1, status: "current", synthetic: true }).error).toBe("cross_workspace_denied");
    expect(addStream(delivery, actor, {
      id: "stream-x", name: "Bad", fromSystemId: null, toSystemId: null, phase: null, flow: "1", flowUnit: null, pressure: null, pressureUnit: null, temperature: null, temperatureUnit: null,
      caseId: null, inputIds: [], revision: 1, status: "current", freshness: "current", synthetic: true,
    }).error).toMatch(/unit/);
    expect(progressProcessStage(delivery, actor, "detailed_engineering", "skip").error).toMatch(/next stage|Skipping/i);
  });
});
