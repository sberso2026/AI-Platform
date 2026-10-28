import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addChange,
  addDependency,
  addRequirement,
  applyRequirementImpact,
  assessMateriality,
  baselineDisposition,
  changeComparison,
  classifyRevision,
  confirmAction,
  createChangeRegister,
  detailedChangeGate,
  discoverImpacts,
  disciplineChangeSummary,
  feedChangeGate,
  freezeChangeBaseline,
  impactAdvisory,
  impactPaths,
  linkRecord,
  progressChange,
  projectChangeReadiness,
  rewriteBaseline,
  supersedeChange,
} from "./engine";
import type { ChangeActor } from "./engine";
import {
  AI_AUTOMATIC_BASELINE_UPDATE_AUTHORITY,
  AI_AUTOMATIC_DELIVERABLE_REVISION_AUTHORITY,
  AI_AUTOMATIC_RECALCULATION_AUTHORITY,
  AI_CHANGE_APPROVAL_AUTHORITY,
  AI_IMPACT_FINALIZATION_AUTHORITY,
  AUTOMATIC_ENGINEERING_RECALCULATION,
  type ChangeRecord,
  type ChangeRegister,
  type Discipline,
  type ImpactNode,
} from "./model";

const at = "2026-10-29T00:20:00Z";
function actor(actingRole: string, role = "change_governor"): ChangeActor {
  return { actorId: "eng-1", actorRole: role, actingRole, at, workspaceId: "workspace-a" };
}
function must<T extends { error: string | null; register: ChangeRegister }>(result: T): ChangeRegister {
  expect(result.error).toBeNull();
  return result.register;
}
function change(partial: Partial<ChangeRecord> & { id: string; initiatingDiscipline: Discipline; changedField: string; sourceObjectId: string }): Omit<ChangeRecord, "status" | "materialityClass" | "exceptionId" | "tqId" | "decisionId" | "actionId"> {
  return {
    title: partial.id,
    description: "Synthetic Feed Pump System P-101",
    origin: "vendor update",
    stage: "feed",
    category: "ENGINEERING_INPUT_CHANGE",
    driver: "vendor update",
    sourceObjectType: "equipment",
    previousRevision: "1",
    newRevision: "2",
    previousValue: "12000",
    newValue: "14000",
    unit: "kg",
    reason: "Controlled synthetic revision",
    owner: "eng-1",
    criticality: "MEDIUM",
    baselineId: null,
    provenance: "SYNTHETIC_VALIDATION_FIXTURE",
    supersedesId: null,
    history: [{ revision: "1", value: partial.previousValue ?? "12000", unit: partial.unit ?? "kg" }],
    ...partial,
  };
}
function link(register: ChangeRegister, discipline: Discipline, sourceId: string, nodes: ImpactNode[]): ChangeRegister {
  let from = sourceId;
  let cursor = register;
  for (const node of nodes) {
    cursor = must(addDependency(cursor, actor(discipline), node, from));
    from = node.id;
  }
  return cursor;
}
function node(id: string, discipline: Discipline, objectType: string, categories: string[], previousResult: string | null = null): ImpactNode {
  return { id, discipline, objectType, categories, previousResult };
}

describe("EOS 2.12 engineering change impact intelligence", () => {
  it("discovers candidate impacts across eight disciplines without recalculating or rewriting a baseline", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(source).not.toContain("recordIacObjectIdentity");
    expect(classifyRevision("description")).toBe("editorial");
    expect(classifyRevision("reviewer_name")).toBe("administrative");
    expect(classifyRevision("operating_mass")).toBe("material");
    expect(classifyRevision("design_pressure")).toBe("material");
    expect(classifyRevision("trip_requirement")).toBe("material");
    expect(classifyRevision("ground_model_boundary")).toBe("material");

    let register = must(createChangeRegister({
      id: "chg-reg", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-change-demo",
      projectTitle: "EOS Engineering Change Impact Intelligence Demo", actorId: "eng-1", at,
    }));
    expect(register.a4Replaced).toBe(false);
    expect(register.d1kReplaced).toBe(false);
    expect(register.recalculated).toBe(false);

    register = must(addChange(register, actor("mechanical"), change({
      id: "mass", initiatingDiscipline: "mechanical", changedField: "operating_mass", sourceObjectId: "p101-mass",
      category: "VENDOR_DATA_CHANGE", criticality: "HIGH", previousValue: "12000", newValue: "14000", unit: "kg",
      history: [
        { revision: "1", value: "12000", unit: "kg" },
        { revision: "2", value: "13000", unit: "kg" },
        { revision: "3", value: "14000", unit: "kg" },
      ],
    })));
    register = link(register, "mechanical", "p101-mass", [
      node("mass-iface", "structural", "interface", ["INTERFACE"]),
      node("shared-model", "structural", "model", ["MODEL"]),
      node("str-calc", "structural", "calculation", ["CALCULATION"], "original-result"),
      node("str-del", "structural", "deliverable", ["DELIVERABLE"]),
      node("str-sch", "structural", "deliverable", ["DELIVERABLE"]),
      node("geo-assess", "geotechnical", "calculation", ["CALCULATION"]),
      node("civil-pad", "civil", "interface", ["INTERFACE"]),
      node("proc-po", "mechanical", "procurement", ["PROCUREMENT"]),
      node("cwp-1", "civil", "construction", ["CONSTRUCTION"]),
      node("sat-1", "instrumentation_and_control", "commissioning", ["COMMISSIONING"]),
    ]);
    register = must(addDependency(register, actor("mechanical"), node("unlinked-doc", "structural", "deliverable", ["DELIVERABLE"]), null));
    register = must(discoverImpacts(register, actor("mechanical"), "mass", 8));
    const calc = register.impacts.find((item) => item.objectId === "str-calc");
    expect(calc?.direct).toBe(false);
    expect(calc?.confidence).toBe("CONFIRMED_DEPENDENCY");
    expect(calc?.materiality).toBe("UNASSESSED");
    expect(calc?.previousResult).toBe("original-result");
    expect(calc?.recalculated).toBe(false);
    expect(calc?.evidence).toContain("p101-mass -> mass-iface -> shared-model -> str-calc");
    expect(register.impacts.some((item) => item.objectId === "unlinked-doc")).toBe(false);
    expect(register.impacts.some((item) => item.direct && item.objectId === "mass-iface")).toBe(true);
    expect(new Set(register.impacts.filter((item) => item.changeId === "mass").map((item) => item.discipline)).size).toBeGreaterThan(3);

    register = must(addChange(register, actor("piping"), change({
      id: "pipe", initiatingDiscipline: "piping", changedField: "support_reaction", sourceObjectId: "pipe-reaction",
      category: "LOAD_CHANGE", previousValue: "40", newValue: "45", unit: "kN",
    })));
    register = must(addDependency(register, actor("piping"), node("pipe-iface", "structural", "interface", ["INTERFACE"]), "pipe-reaction"));
    register = must(addDependency(register, actor("piping"), node("shared-model", "structural", "model", ["MODEL"]), "pipe-iface"));
    register = must(discoverImpacts(register, actor("piping"), "pipe", 4));
    expect(register.impacts.filter((item) => item.objectId === "shared-model")).toHaveLength(2);

    register = must(addChange(register, actor("process"), change({
      id: "temp", initiatingDiscipline: "process", changedField: "design_temperature", sourceObjectId: "temp-src",
      category: "PROCESS_CONDITION_CHANGE", previousValue: "80", newValue: "120", unit: "C",
    })));
    register = link(register, "process", "temp-src", [
      node("stream", "process", "input", ["DESIGN_BASIS"]),
      node("mech-duty", "mechanical", "input", ["INTERFACE"]),
      node("pipe-line", "piping", "input", ["INTERFACE"]),
      node("stress", "piping", "model", ["MODEL"]),
    ]);
    register = must(discoverImpacts(register, actor("process"), "temp", 8));

    register = must(addChange(register, actor("geotechnical"), change({
      id: "water", initiatingDiscipline: "geotechnical", changedField: "groundwater_level", sourceObjectId: "gw-src",
      category: "GROUND_MODEL_CHANGE", previousValue: "RL 98.2", newValue: "RL 99.1", unit: "m",
    })));
    register = link(register, "geotechnical", "gw-src", [
      node("ground-model", "geotechnical", "model", ["MODEL"]),
      node("bearing", "geotechnical", "calculation", ["CALCULATION"]),
      node("fnd-iface", "structural", "interface", ["INTERFACE"]),
      node("drain", "civil", "deliverable", ["DELIVERABLE"]),
    ]);
    register = must(discoverImpacts(register, actor("geotechnical"), "water", 8));

    register = must(addChange(register, actor("mechanical"), change({
      id: "power", initiatingDiscipline: "mechanical", changedField: "motor_power", sourceObjectId: "power-src",
      category: "ELECTRICAL_LOAD_CHANGE", previousValue: "75", newValue: "110", unit: "kW",
    })));
    register = link(register, "mechanical", "power-src", [
      node("load-list", "electrical", "input", ["INTERFACE"]),
      node("sld", "electrical", "deliverable", ["DELIVERABLE"]),
      node("panel", "instrumentation_and_control", "interface", ["INTERFACE"]),
    ]);
    register = must(discoverImpacts(register, actor("mechanical"), "power", 8));

    register = must(addChange(register, actor("process"), change({
      id: "trip", initiatingDiscipline: "process", changedField: "trip_requirement", sourceObjectId: "trip-src",
      category: "SAFETY_REQUIREMENT_CHANGE", criticality: "CRITICAL", previousValue: "1500", newValue: "1400", unit: "kPa",
    })));
    register = link(register, "process", "trip-src", [
      node("trip-req", "instrumentation_and_control", "requirement", ["REQUIREMENT"]),
      node("cause", "instrumentation_and_control", "deliverable", ["DELIVERABLE"]),
      node("fat", "instrumentation_and_control", "commissioning", ["COMMISSIONING"]),
    ]);
    register = must(discoverImpacts(register, actor("process"), "trip", 8));

    register = must(addChange(register, actor("civil"), change({
      id: "level", initiatingDiscipline: "civil", changedField: "finished_level", sourceObjectId: "level-src",
      category: "SITE_CONDITION_CHANGE", previousValue: "103.25", newValue: "103.40", unit: "m",
    })));
    register = link(register, "civil", "level-src", [
      node("fnd-elev", "structural", "input", ["INTERFACE"]),
      node("equip-elev", "mechanical", "input", ["INTERFACE"]),
      node("route", "piping", "model", ["MODEL"]),
      node("cable", "electrical", "input", ["INTERFACE"]),
      node("field", "instrumentation_and_control", "input", ["INTERFACE"]),
    ]);
    register = must(discoverImpacts(register, actor("civil"), "level", 8));

    register = must(addChange(register, actor("mechanical"), change({
      id: "nozzle", initiatingDiscipline: "mechanical", changedField: "nozzle_location", sourceObjectId: "nozzle-src",
      category: "VENDOR_DATA_CHANGE", previousValue: "north", newValue: "east", unit: "deg",
    })));
    register = link(register, "mechanical", "nozzle-src", [
      node("route-2", "piping", "model", ["MODEL"]),
      node("iso", "piping", "deliverable", ["DELIVERABLE"]),
      node("support", "structural", "calculation", ["CALCULATION"]),
    ]);
    register = must(discoverImpacts(register, actor("mechanical"), "nozzle", 8));

    expect(feedChangeGate(register).ready).toBe(false);
    expect(detailedChangeGate(register).ready).toBe(false);
    for (const impact of register.impacts.filter((item) => item.changeId === "trip")) {
      register = must(assessMateriality(register, actor(impact.discipline), impact.id, "NO_MATERIAL_IMPACT", { rationale: "Reviewed for the synthetic trip." }));
    }
    expect(feedChangeGate(register).ready).toBe(true);

    for (const impact of register.impacts.filter((item) => item.changeId === "mass" && item.objectId !== "str-calc")) {
      register = must(assessMateriality(register, actor(impact.discipline), impact.id, impact.objectId === "str-sch" ? "NO_MATERIAL_IMPACT" : "INFORMATION_ONLY", { rationale: "The schedule reference does not use the mass." }));
    }
    register = must(assessMateriality(register, actor("structural"), "mass:str-calc", "MATERIAL_IMPACT", { severity: "HIGH", action: "RECALCULATE", rationale: "The calculation still cites the previous mass." }));
    expect(register.impacts.find((item) => item.id === "mass:str-calc")?.recalculated).toBe(false);
    register = must(confirmAction(register, actor("structural"), "mass:str-calc"));
    expect(register.impacts.find((item) => item.id === "mass:str-calc")?.previousResult).toBe("original-result");
    expect(register.impacts.find((item) => item.id === "mass:str-calc")?.recalculated).toBe(false);
    expect(register.impacts.find((item) => item.id === "mass:str-calc")?.deliverableRevised).toBe(false);
    expect(detailedChangeGate(register).ready).toBe(true);
    expect(register.impacts.find((item) => item.id === "pipe:shared-model")?.materiality).toBe("UNASSESSED");

    const snapshot = [{ objectId: "p101-mass", revision: "1", value: "12000" }];
    register = must(freezeChangeBaseline(register, actor("mechanical"), "base-feed", "feed_baseline", snapshot));
    expect(baselineDisposition(register, "mass")).toBe("BASELINE_REVALIDATION_REQUIRED");
    expect(register.baselines[0]?.items).toEqual(snapshot);
    expect(rewriteBaseline().error).toMatch(/not rewritten/);

    register = must(addRequirement(register, actor("process"), { id: "req-1", governingInputId: "trip-src", evidenceId: "evidence-1", status: "verified" }));
    register = must(applyRequirementImpact(register, actor("process"), "trip"));
    expect(register.requirements[0]).toEqual({ id: "req-1", governingInputId: "trip-src", evidenceId: "evidence-1", status: "reverification_required" });

    expect(changeComparison(register.changes.find((item) => item.id === "mass")!)).toBe("12000 kg -> 14000 kg");
    expect(register.changes.find((item) => item.id === "mass")?.history).toHaveLength(3);
    expect(impactPaths(register, "mass").some((path) => path.includes("str-calc"))).toBe(true);
    expect(impactAdvisory(register, "mass")).toContain("DETERMINISTIC_DEPENDENCY");
    expect(impactAdvisory(register, "mass")).toContain("HUMAN_DECISION_REQUIRED");
    expect(impactAdvisory(register, "mass")).not.toContain("foundation is unsafe");
    expect(disciplineChangeSummary(register, "structural").material).toBeGreaterThan(0);
    expect(projectChangeReadiness(register).staleCalculations).toBeGreaterThan(0);
    expect(AI_CHANGE_APPROVAL_AUTHORITY).toBe(false);
    expect(AI_IMPACT_FINALIZATION_AUTHORITY).toBe(false);
    expect(AI_AUTOMATIC_RECALCULATION_AUTHORITY).toBe(false);
    expect(AI_AUTOMATIC_DELIVERABLE_REVISION_AUTHORITY).toBe(false);
    expect(AI_AUTOMATIC_BASELINE_UPDATE_AUTHORITY).toBe(false);
    expect(AUTOMATIC_ENGINEERING_RECALCULATION).toBe(false);
  });

  it("keeps approval, materiality, traversal, and workspace boundaries governed", () => {
    let register = must(createChangeRegister({
      id: "chg-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-change-demo",
      projectTitle: "EOS Engineering Change Impact Intelligence Demo", actorId: "eng-1", at,
    }));
    register = must(addChange(register, actor("mechanical"), change({ id: "cycle", initiatingDiscipline: "mechanical", changedField: "operating_mass", sourceObjectId: "cycle-a" })));
    register = must(addDependency(register, actor("mechanical"), node("cycle-b", "structural", "calculation", ["CALCULATION"]), "cycle-a"));
    register = must(addDependency(register, actor("mechanical"), node("cycle-a", "mechanical", "equipment", ["DIRECT"]), "cycle-b"));
    register = must(discoverImpacts(register, actor("mechanical"), "cycle", 8));
    expect(register.impacts.filter((item) => item.changeId === "cycle")).toHaveLength(1);
    register = must(addChange(register, actor("process"), change({ id: "shallow", initiatingDiscipline: "process", changedField: "design_temperature", sourceObjectId: "shallow-src", previousValue: "80", newValue: "120", unit: "C" })));
    register = link(register, "process", "shallow-src", [
      node("shallow-1", "mechanical", "input", ["INTERFACE"]),
      node("shallow-2", "piping", "model", ["MODEL"]),
    ]);
    register = must(discoverImpacts(register, actor("process"), "shallow", 1));
    expect(register.impacts.filter((item) => item.changeId === "shallow").map((item) => item.objectId)).toEqual(["shallow-1"]);

    expect(progressChange(register, actor("mechanical"), "cycle", "approved_for_implementation").error).toMatch(/not legal/);
    for (const status of ["submitted", "under_screening", "impact_assessment_required", "impact_assessment_in_progress"] as const) {
      register = must(progressChange(register, actor("mechanical"), "cycle", status));
    }
    expect(assessMateriality(register, { ...actor("structural"), actorRole: "ai", actingRole: "ai" }, "cycle:cycle-b", "MATERIAL_IMPACT").error).toMatch(/cannot finalize materiality/);
    expect(progressChange(register, { ...actor("change_authority"), actorRole: "owner" }, "cycle", "impact_assessed").error).toBeNull();
    register = must(progressChange(register, actor("mechanical"), "cycle", "impact_assessed"));
    expect(progressChange(register, { ...actor("change_authority"), actorRole: "owner" }, "cycle", "approved_for_implementation").error).toMatch(/not granted/);
    expect(progressChange(register, { ...actor("change_authority"), actorRole: "ai", actingRole: "ai" }, "cycle", "approved_for_implementation").error).toMatch(/cannot approve/);
    register = must(assessMateriality(register, actor("structural"), "cycle:cycle-b", "MATERIAL_IMPACT", { action: "RECALCULATE", rationale: "Review the load." }));
    expect(confirmAction(register, { ...actor("structural"), actorRole: "ai", actingRole: "ai" }, "cycle:cycle-b").error).toMatch(/cannot confirm/);
    register = must(confirmAction(register, actor("structural"), "cycle:cycle-b"));
    register = must(progressChange(register, actor("change_authority", "change_governor"), "cycle", "approved_for_implementation"));
    register = must(progressChange(register, actor("mechanical"), "cycle", "implemented"));
    expect(register.changes.find((item) => item.id === "cycle")?.status).toBe("implemented");
    expect(register.audits.some((item) => item.action === "change_implemented" && item.detail.verified === false)).toBe(true);
    register = must(linkRecord(register, actor("structural"), "cycle", "tq", "tq-synthetic"));
    register = must(linkRecord(register, actor("mechanical"), "cycle", "decision", "dec-synthetic"));
    register = must(linkRecord(register, actor("mechanical"), "cycle", "action", "act-synthetic"));
    expect(register.changes.find((item) => item.id === "cycle")?.tqId).toBe("tq-synthetic");

    const later = must(supersedeChange(register, actor("mechanical"), "cycle", change({
      id: "cycle-r3", initiatingDiscipline: "mechanical", changedField: "operating_mass", sourceObjectId: "cycle-a", newRevision: "3", newValue: "15000",
    })));
    register = later;
    expect(register.changes.some((item) => item.id === "cycle")).toBe(true);
    expect(register.changes.find((item) => item.id === "cycle-r3")?.supersedesId).toBe("cycle");
    expect(addChange(register, { ...actor("mechanical"), workspaceId: "workspace-b" }, change({ id: "other", initiatingDiscipline: "mechanical", changedField: "operating_mass", sourceObjectId: "other" })).error).toBe("cross_workspace_denied");
    expect(discoverImpacts(register, { ...actor("mechanical"), workspaceId: "workspace-b" }, "cycle").error).toBe("cross_workspace_denied");
    expect(assessMateriality(register, { ...actor("structural"), workspaceId: "workspace-b" }, "cycle:cycle-b", "NO_MATERIAL_IMPACT").error).toBe("cross_workspace_denied");
  });
});
