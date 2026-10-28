import { describe, expect, it } from "vitest";
import { createDeliveryLifecycle } from "../delivery-lifecycle/engine";
import {
  addAssumption,
  addBasisItem,
  addCalculation,
  addCriterion,
  addDeliverable,
  addInput,
  addRequirement,
  addSource,
  basisAdvisory,
  captureBasisBaseline,
  commitBasisImport,
  createBasisGraph,
  itemsForStage,
  lifecycleBasisReadiness,
  missingTraceability,
  previewBasisImport,
  recordChange,
  resolveBasisStatement,
  reviewBasis,
  reviseInput,
  reviseRequirement,
  setJurisdiction,
  traverse,
  verifyRequirement,
} from "./engine";
import { roleMayApproveBasis } from "./model";

const actor = { actorId: "eng-1", actorRole: "basis_reviewer", at: "2026-10-28T13:00:00Z", workspaceId: "workspace-a" };

function graph() {
  return createBasisGraph({
    id: "basis-1",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-1",
    stage: "feed",
    actorId: "eng-1",
    at: "2026-10-28T12:00:00Z",
  }).graph;
}

describe("EOS 2.2 engineering basis", () => {
  it("keeps a new graph unclassified from legacy requirements and separate from lifecycle approval", () => {
    const created = createBasisGraph({
      id: "basis-1",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "project-1",
      actorId: "eng-1",
      at: "2026-10-28T12:00:00Z",
    });
    expect(created.graph.stage).toBe("not_classified");
    expect(created.audit?.detail.legacyRequirementsCopied).toBe(false);
    expect(createDeliveryLifecycle({
      id: "life-1",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "project-1",
      actorId: "eng-1",
      at: "2026-10-28T12:00:00Z",
    }).lifecycle.stage).toBe("not_classified");
  });

  it("inherits a project basis and records an explicit override", () => {
    const source = addSource(graph(), actor, { id: "src-1", kind: "design_brief", title: "Synthetic brief", revision: "A" });
    const project = addBasisItem(source.graph, actor, {
      id: "db-project",
      level: "project",
      discipline: "common",
      category: "design_life",
      title: "Design life",
      statement: "25 years",
      unit: "year",
      sourceId: "src-1",
      sourceRevision: "A",
      stage: "feed",
      status: "draft",
      effectiveAt: null,
      owner: "eng-1",
      provenance: "human_record",
      parentId: null,
      inheritance: "add",
      overrideRationale: null,
      supersedesId: null,
    });
    const inherited = addBasisItem(project.graph, actor, {
      id: "db-discipline",
      level: "discipline",
      discipline: "structural",
      category: "design_life",
      title: "Design life",
      statement: "inherited",
      unit: "year",
      sourceId: "src-1",
      sourceRevision: "A",
      stage: "feed",
      status: "draft",
      effectiveAt: null,
      owner: "eng-1",
      provenance: "human_record",
      parentId: "db-project",
      inheritance: "inherit",
      overrideRationale: null,
      supersedesId: null,
    });
    expect(resolveBasisStatement(inherited.graph, "db-discipline")?.statement).toBe("25 years");
    const silent = addBasisItem(inherited.graph, actor, {
      ...inherited.graph.basisItems[1]!,
      id: "db-silent",
      inheritance: "override",
      parentId: "db-project",
      overrideRationale: null,
      statement: "10 years",
    });
    expect(silent.error).toMatch(/override/i);
    const override = addBasisItem(inherited.graph, actor, {
      id: "db-override",
      level: "system",
      discipline: "mechanical",
      category: "design_life",
      title: "Package design life",
      statement: "15 years",
      unit: "year",
      sourceId: "src-1",
      sourceRevision: "A",
      stage: "feed",
      status: "draft",
      effectiveAt: null,
      owner: "eng-1",
      provenance: "human_record",
      parentId: "db-project",
      inheritance: "override",
      overrideRationale: "Synthetic package replacement cycle.",
      supersedesId: null,
    });
    expect(override.error).toBeNull();
    expect(resolveBasisStatement(override.graph, "db-override")?.overridden).toBe(true);
    const asset = addBasisItem(override.graph, actor, {
      id: "db-asset",
      level: "asset",
      discipline: "mechanical",
      category: "operating_condition",
      title: "Equipment duty",
      statement: "synthetic duty",
      unit: null,
      sourceId: "src-1",
      sourceRevision: "A",
      stage: "feed",
      status: "draft",
      effectiveAt: null,
      owner: "eng-1",
      provenance: "human_record",
      parentId: "db-override",
      inheritance: "specialize",
      overrideRationale: null,
      supersedesId: null,
    });
    expect(asset.graph.basisItems.map((item) => item.level)).toEqual(["project", "discipline", "system", "asset"]);
  });

  it("does not treat stage acceptance or an administrator role as design-basis approval", () => {
    const item = addBasisItem(graph(), actor, {
      id: "db-1",
      level: "project",
      discipline: "common",
      category: "site_condition",
      title: "Site",
      statement: "synthetic coastal industrial facility",
      unit: null,
      sourceId: null,
      sourceRevision: null,
      stage: "feed",
      status: "draft",
      effectiveAt: null,
      owner: "eng-1",
      provenance: "human_record",
      parentId: null,
      inheritance: "add",
      overrideRationale: null,
      supersedesId: null,
    });
    const accepted = reviewBasis(item.graph, actor, { itemId: "db-1", outcome: "accepted_for_stage", comments: "accepted for FEED only" });
    expect(accepted.graph.basisItems[0]?.status).toBe("accepted_for_stage");
    expect(accepted.graph.basisItems[0]?.approvalGranted).toBe(false);
    for (const role of ["owner", "admin", "pilot_engineer", "ai"]) {
      expect(roleMayApproveBasis(role, true)).toBe(false);
      const approved = reviewBasis(item.graph, { ...actor, actorRole: role, canApprove: true }, { itemId: "db-1", outcome: "approved", comments: null });
      expect(approved.error).toMatch(/cannot approve/i);
    }
    const approved = reviewBasis(item.graph, { ...actor, canApprove: true }, { itemId: "db-1", outcome: "approved", comments: "authorized review" });
    expect(approved.error).toBeNull();
    expect(approved.graph.reviews[0]?.approvalGranted).toBe(true);
  });

  it("traces a requirement to evidence and refuses AI verification", () => {
    const source = addSource(graph(), actor, { id: "src-1", kind: "client_specification", title: "Synthetic specification", revision: "1" });
    const requirement = addRequirement(source.graph, actor, {
      id: "req-1",
      title: "Synthetic process capacity",
      statement: "Provide the stated synthetic capacity.",
      requirementType: "performance",
      discipline: "process",
      applicability: "plant",
      sourceId: "src-1",
      sourceRevision: "1",
      sourceLocator: "section 1",
      rationale: "demo",
      introducedStage: "feed",
      requiredByStage: "detailed_engineering",
      criticality: "high",
      status: "draft",
      verificationMethod: "calculation",
      owner: "eng-1",
      reviewer: null,
      legacyRequirementId: null,
      provenance: "human_record",
    });
    const proposed = addRequirement(requirement.graph, { ...actor, actorRole: "ai" }, {
      id: "req-ai",
      title: "Candidate",
      statement: "Candidate text",
      requirementType: "engineering",
      discipline: "common",
      applicability: null,
      sourceId: "src-1",
      sourceRevision: "1",
      sourceLocator: "excerpt locator",
      rationale: "extraction",
      introducedStage: "feed",
      requiredByStage: null,
      criticality: "low",
      status: "accepted",
      verificationMethod: null,
      owner: null,
      reviewer: null,
      legacyRequirementId: "legacy-not-copied",
      provenance: "should-not-stick",
      proposedByAi: true,
    });
    expect(proposed.graph.requirements.find((item) => item.id === "req-ai")?.status).toBe("proposed");
    expect(proposed.graph.requirements.find((item) => item.id === "req-ai")?.label).toBe("PROPOSED");
    const aiVerify = verifyRequirement(requirement.graph, { ...actor, actorRole: "ai" }, {
      requirementId: "req-1",
      method: "review",
      evidenceId: "ev-1",
      result: "noted",
      outcome: "pass",
      comments: null,
    });
    expect(aiVerify.error).toMatch(/AI cannot/);
    const inferred = verifyRequirement(requirement.graph, actor, {
      requirementId: "req-1",
      method: "calculation",
      evidenceId: "calc-1",
      result: "exists",
      outcome: "pass",
      comments: null,
      inferFromCalculation: true,
    });
    expect(inferred.error).toMatch(/does not by itself/);
    const verified = verifyRequirement(requirement.graph, actor, {
      requirementId: "req-1",
      method: "calculation",
      evidenceId: "ev-1",
      result: "evidence recorded",
      outcome: "pass",
      comments: null,
    });
    expect(verified.graph.requirements.find((item) => item.id === "req-1")?.status).toBe("verified");
    const revised = reviseRequirement(requirement.graph, actor, "req-1", "Revised synthetic capacity.");
    expect(revised.graph.requirements.find((item) => item.id === "req-1")?.status).toBe("superseded");
    expect(traverse(verified.graph, "requirement", "req-1", "upstream").some((item) => item.fromId === "src-1")).toBe(true);
    expect(traverse(verified.graph, "requirement", "req-1", "downstream").some((item) => item.toType === "verification")).toBe(true);
  });

  it("flags stale references after an input revision without recomputing", () => {
    let current = graph();
    current = addInput(current, actor, {
      id: "in-1",
      name: "equipment operating mass",
      value: "1000",
      unit: "kg",
      dataType: "number",
      sourceId: null,
      sourceRevision: null,
      effectiveAt: "2026-10-28T13:00:00Z",
      uncertainty: null,
      stage: "feed",
      status: "current",
      discipline: "mechanical",
      owner: "eng-1",
      provenance: "human_record",
      revision: 1,
      supersedesId: null,
      interfaceUse: { sourceDiscipline: "mechanical", receivingDiscipline: "structural", parameter: "operating mass" },
    }).graph;
    current = addCalculation(current, actor, { id: "cal-1", title: "reference only", inputIds: ["in-1"], freshness: "current", revision: 1 }).graph;
    const baseline = captureBasisBaseline(current, "eng-1", "2026-10-28T13:01:00Z");
    const revised = reviseInput(current, actor, "in-1", "1200");
    expect(revised.graph.calculations[0]?.freshness).toBe("potentially_stale");
    expect(revised.audit?.detail.recalculated).toBe(false);
    expect(baseline.inputs[0]?.value).toBe("1000");
    expect(baseline.frozen).toBe(true);
    const changed = recordChange(revised.graph, actor, { id: "chg-1", targets: [{ type: "calculation", id: "cal-1" }] });
    expect(changed.graph.changes[0]?.approved).toBe(false);
  });

  it("reports missing traceability without treating every gap as blocking", () => {
    const requirement = addRequirement(graph(), actor, {
      id: "req-gap",
      title: "Unsourced",
      statement: "Synthetic",
      requirementType: "safety",
      discipline: "electrical",
      applicability: null,
      sourceId: null,
      sourceRevision: null,
      sourceLocator: null,
      rationale: null,
      introducedStage: "feed",
      requiredByStage: null,
      criticality: "medium",
      status: "draft",
      verificationMethod: null,
      owner: null,
      reviewer: null,
      legacyRequirementId: null,
      provenance: "human_record",
    });
    const gaps = missingTraceability(requirement.graph);
    expect(gaps.some((item) => item.code === "requirement_without_source" && item.severity === "review")).toBe(true);
    expect(gaps.some((item) => item.code === "requirement_without_verification_method" && item.severity === "info")).toBe(true);
    expect(gaps.some((item) => item.severity === "blocking")).toBe(false);
    const readiness = lifecycleBasisReadiness(requirement.graph);
    expect(readiness.blockers).toContain("controlled FEED design basis is not recorded");
    expect(readiness.acceptedForStageIsApproval).toBe(false);
    expect(itemsForStage(requirement.graph, "concept")).toEqual([]);
    expect(basisAdvisory(requirement.graph)).toMatch(/does not approve/);
  });

  it("rejects a malformed import and commits only a valid preview as drafts", () => {
    const bad = previewBasisImport({ format: "csv", text: "id,title,recordType\nonly-two" });
    expect(bad.invalid.length).toBeGreaterThan(0);
    expect(commitBasisImport(graph(), actor, bad).error).toMatch(/not committed/);
    const preview = previewBasisImport({
      format: "json",
      text: JSON.stringify([{ id: "src-9", title: "Synthetic source", recordType: "source", revision: "1" }]),
    });
    const committed = commitBasisImport(graph(), actor, preview);
    expect(committed.error).toBeNull();
    expect(committed.graph.sources[0]?.id).toBe("src-9");
    expect(committed.graph.basisItems.every((item) => item.status !== "approved")).toBe(true);
  });

  it("denies another workspace and keeps jurisdiction configurable", () => {
    const current = setJurisdiction(graph(), actor, "australia");
    expect(current.graph.jurisdictionProfile).toBe("australia");
    const denied = addSource(current.graph, { ...actor, workspaceId: "workspace-b" }, { id: "src-x", kind: "survey", title: "Other", revision: "1" });
    expect(denied.error).toBe("cross_workspace_denied");
    expect(denied.graph.sources).toEqual([]);
    const criterion = addCriterion(current.graph, actor, {
      id: "cr-1",
      title: "Design temperature range",
      statement: "synthetic range",
      unit: "C",
      sourceId: null,
      basisItemId: null,
      stage: "feed",
      applicability: "equipment",
      status: "draft",
      revision: 1,
      provenance: "human_record",
    });
    expect(criterion.error).toMatch(/basis item or a source/);
    const assumption = addAssumption(current.graph, actor, {
      id: "as-1",
      description: "synthetic coastal exposure",
      sourceId: null,
      introducedStage: "concept",
      targetResolutionStage: "feed",
      owner: "eng-1",
      status: "accepted_for_stage",
      confidence: "medium",
      impactIfWrong: "material selection may change",
      blocksNextStage: false,
      basisItemId: null,
      requirementId: null,
    });
    expect(assumption.graph.assumptions[0]?.status).toBe("accepted_for_stage");
    expect(assumption.audit?.detail.validated).toBe(false);
    const deliverable = addDeliverable(assumption.graph, actor, { id: "del-1", title: "basis report", basisItemIds: [], freshness: "current", revision: 1 });
    expect(missingTraceability(deliverable.graph).some((item) => item.code === "deliverable_without_basis")).toBe(true);
  });
});
