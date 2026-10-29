import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addAssumption,
  addCalculation,
  addDecision,
  addLoad,
  addOption,
  addStructuralBasis,
  attachStructural,
  createStructuralDelivery,
  deliverableReadiness,
  freezeStructural,
  hiddenCalculations,
  progressStructuralStage,
  registerSolverPackage,
  reviewStructural,
  reviseLoad,
  structuralAdvisory,
  structuralHome,
} from "./engine";
import type { StructuralActor } from "./engine";
import { D1_PRESERVED_LIMITATIONS } from "./model";

const actor: StructuralActor = {
  actorId: "gov-1",
  actorRole: "lifecycle_governor",
  at: "2026-10-28T14:00:00Z",
  workspaceId: "workspace-a",
  canAuthorizeLifecycleTransition: true,
  canApprove: true,
};

function must<T extends { error: string | null; delivery: { lifecycle: { stage: string } } }>(result: T): T {
  expect(result.error).toBeNull();
  return result;
}

describe("EOS 2.3 structural design delivery", () => {
  it("moves a synthetic pipe rack through the lifecycle without calculating new capacity", () => {
    let delivery = must(createStructuralDelivery({
      id: "str-1",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "eos-structural-demo",
      projectTitle: "EOS Structural Design Delivery Demo",
      actorId: actor.actorId,
      at: actor.at,
    })).delivery;
    expect(delivery.lifecycle.stage).toBe("not_classified");
    expect(delivery.audits[0]?.detail.legacyEnrolled).toBe(false);
    delivery = must(progressStructuralStage(delivery, actor, "concept", "classify concept")).delivery;

    delivery = must(addStructuralBasis(delivery, actor, { id: "db-1", title: "Design life", statement: "Synthetic 25 years", status: "draft" })).delivery;
    delivery = must(addOption(delivery, actor, {
      id: "opt-a",
      title: "Braced structural steel pipe rack",
      system: "braced_steel",
      stage: "concept",
      facts: ["Synthetic asset PR-001"],
      assumptions: ["Grid is preliminary"],
      estimates: ["Quantity not calculated"],
      unresolved: ["Geotechnical parameters"],
      recommendation: null,
    })).delivery;
    delivery = must(addOption(delivery, actor, {
      id: "opt-b",
      title: "Moment-frame structural steel pipe rack",
      system: "moment_frame_steel",
      stage: "concept",
      facts: ["Synthetic asset PR-001"],
      assumptions: ["No measured survey"],
      estimates: [],
      unresolved: ["Connection demand"],
      recommendation: null,
    })).delivery;
    delivery = must(addAssumption(delivery, actor, { id: "as-1", statement: "Preliminary grid is an assumption", stage: "concept", blocksNextStage: false })).delivery;
    delivery = must(addDecision(delivery, actor, { id: "dec-1", statement: "Prefer the braced option for the synthetic rack", stage: "concept" })).delivery;
    delivery = must(progressStructuralStage(delivery, actor, "feasibility", "concept gate")).delivery;

    delivery = must(attachStructural(delivery, actor, "risks", { id: "risk-1", statement: "Synthetic erection risk", stage: "feasibility" })).delivery;
    delivery = must(attachStructural(delivery, actor, "interfaces", { id: "if-1", fromDiscipline: "piping", parameter: "support reaction", status: "proposed", loadId: null, revision: 1 })).delivery;
    delivery = must(addLoad(delivery, actor, {
      id: "load-1",
      category: "piping_operating",
      name: "Piping support reaction",
      value: null,
      unit: null,
      direction: "vertical",
      coordinateSystem: "global",
      location: "PR-001 bent 1",
      stage: "feasibility",
      sourceId: "src-1",
      revision: 1,
      status: "current",
      uncertainty: "preliminary",
      synthetic: true,
    })).delivery;
    delivery = must(progressStructuralStage(delivery, actor, "feed", "feasibility gate")).delivery;

    delivery = must(addStructuralBasis(delivery, actor, { id: "db-feed", title: "Controlled structural basis", statement: "Synthetic FEED basis", status: "accepted_for_stage" })).delivery;
    expect(delivery.basis.basisItems.find((item) => item.id === "db-feed")?.approvalGranted).toBe(false);
    delivery = must(attachStructural(delivery, actor, "requirements", { id: "req-1", title: "Strength and stability", sourceId: "src-1", stage: "feed" })).delivery;
    delivery = must(attachStructural(delivery, actor, "interfaces", { id: "if-2", fromDiscipline: "mechanical", parameter: "equipment operating mass", status: "accepted", loadId: "load-1", revision: 1 })).delivery;
    delivery = must(attachStructural(delivery, actor, "systems", { id: "sys-1", name: "Braced steel pipe rack", stage: "feed" })).delivery;
    delivery = must(attachStructural(delivery, actor, "deliverables", {
      id: "del-feed",
      title: "Structural FEED basis",
      stage: "feed",
      maturity: "feed",
      revision: 1,
      calculationIds: [],
      modelIds: [],
      basisLinked: true,
      requirementLinked: true,
      reviewId: null,
      freshness: "current",
      ifc: false,
    })).delivery;
    const frozen = must(freezeStructural(delivery, actor, "feed_baseline", "base-feed"));
    delivery = frozen.delivery;
    const feedSnapshot = delivery.baselines[0];
    delivery = must(progressStructuralStage(delivery, actor, "detailed_engineering", "feed gate")).delivery;
    expect(delivery.lifecycle.stage).toBe("detailed_engineering");

    delivery = must(attachStructural(delivery, actor, "models", {
      id: "model-1",
      purpose: "Synthetic pipe rack reference",
      stage: "detailed_engineering",
      solver: "internal_reference",
      solverVersion: null,
      revision: 1,
      basisRevision: 1,
      loadRevisionIds: ["load-1"],
      checksum: "synthetic",
      status: "registered",
      freshness: "current",
      reviewer: null,
    })).delivery;
    delivery = must(addCalculation(delivery, actor, {
      id: "cal-1",
      purpose: "Link an existing D1 calculation identity",
      stage: "detailed_engineering",
      loadIds: ["load-1"],
      modelId: "model-1",
      d1CalculationId: "d1-existing-reference",
      engine: "existing_d1_reference",
      engineVersion: null,
      resultId: "res-1",
      revision: 1,
      synthetic: true,
    })).delivery;
    expect(delivery.calculations[0]?.codeComplianceClaimed).toBe(false);
    delivery = must(attachStructural(delivery, actor, "results", {
      id: "res-1",
      calculationId: "cal-1",
      kind: "provenance_only",
      value: null,
      unit: null,
      provenance: "synthetic fixture; no capacity invented",
      freshness: "current",
      synthetic: true,
    })).delivery;
    delivery = must(attachStructural(delivery, actor, "deliverables", {
      id: "del-1",
      title: "Detailed calculation link",
      stage: "detailed_engineering",
      maturity: "detailed_engineering",
      revision: 1,
      calculationIds: ["cal-1"],
      modelIds: ["model-1"],
      basisLinked: true,
      requirementLinked: true,
      reviewId: null,
      freshness: "current",
      ifc: false,
    })).delivery;
    expect(deliverableReadiness(delivery, "del-1").ifc).toBe(false);

    const revised = must(reviseLoad(delivery, actor, "load-1", "revised synthetic reaction"));
    delivery = revised.delivery;
    expect(delivery.calculations[0]?.freshness).toBe("potentially_stale");
    expect(delivery.models[0]?.freshness).toBe("potentially_stale");
    expect(delivery.results[0]?.freshness).toBe("potentially_stale");
    expect(delivery.results[0]?.value).toBeNull();
    expect(delivery.deliverables.find((item) => item.id === "del-1")?.freshness).toBe("potentially_stale");
    expect(feedSnapshot?.loadIds).toEqual(["load-1"]);
    expect(revised.delivery.audits.some((item) => item.detail.recalculated === false)).toBe(true);
    expect(structuralAdvisory(delivery)).toMatch(/HUMAN_DECISION_REQUIRED/);
    expect(structuralAdvisory(delivery)).toMatch(/does not invent capacity/);
    expect(structuralHome(delivery).staleCalculations).toBe(1);
  });

  it("preserves D1 boundaries and refuses uncertified solver execution", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(D1_PRESERVED_LIMITATIONS.some((item) => item.includes("two-way slab"))).toBe(true);
    expect(hiddenCalculations().map((item) => item.id)).toEqual(expect.arrayContaining(["two_way_slab", "wall_design", "connection_design", "hosted_solver_execution"]));
    let delivery = createStructuralDelivery({
      id: "str-2",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "eos-structural-demo",
      projectTitle: "EOS Structural Design Delivery Demo",
      actorId: actor.actorId,
      at: actor.at,
    }).delivery;
    const certified = registerSolverPackage(delivery, actor, { id: "solver-1", tool: "SPACE_GASS", certifyExecution: true });
    expect(certified.error).toMatch(/not certified/);
    delivery = must(registerSolverPackage(delivery, actor, { id: "solver-1", tool: "SPACE_GASS" })).delivery;
    expect(delivery.solverPackages[0]?.executionCertified).toBe(false);
    expect(delivery.solverPackages[0]?.status).toBe("read_only_connector");
    const owner = reviewStructural(delivery, { ...actor, actorRole: "owner", canApprove: true }, { id: "rev-1", subjectId: "del-1", revision: 1, outcome: "approved" });
    expect(owner.error).toMatch(/cannot approve/);
    const other = addLoad(delivery, { ...actor, workspaceId: "workspace-b" }, {
      id: "load-x",
      category: "dead",
      name: "Other workspace",
      value: null,
      unit: null,
      direction: null,
      coordinateSystem: null,
      location: null,
      stage: "concept",
      sourceId: null,
      revision: 1,
      status: "current",
      uncertainty: null,
      synthetic: true,
    });
    expect(other.error).toBe("cross_workspace_denied");
    const skipped = progressStructuralStage(delivery, actor, "detailed_engineering", "skip");
    expect(skipped.error).toMatch(/next stage|not allowed|Skipping/i);
  });
});
