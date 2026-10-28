import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addDependency,
  addDependent,
  addInterface,
  addPackage,
  compareUnits,
  coordinateDiagnostic,
  createInterfaceRegister,
  detailedInterfaceGate,
  diagnoseInterfaces,
  disciplineInterfaceSummary,
  feedInterfaceGate,
  freezeInterfaceBaseline,
  interfaceAdvisory,
  interfaceHome,
  interfaceMatrix,
  linkDecision,
  linkTechnicalQuery,
  overwriteSourceValue,
  progressInterface,
  projectInterfaceReadiness,
  publishOverdue,
  recordReceiver,
  restoreSuperseded,
  reviseInterface,
  traverseDependencies,
} from "./engine";
import type { InterfaceActor } from "./engine";
import {
  AI_AUTOMATIC_ENGINEERING_RECALCULATION,
  AI_INTERFACE_ACCEPTANCE_AUTHORITY,
  AI_INTERFACE_VALUE_MUTATION_AUTHORITY,
  type EngineeringInterface,
  type InterfaceDiscipline,
  type InterfaceRegister,
} from "./model";

const at = "2026-10-28T21:00:00Z";
function actor(actingRole: InterfaceActor["actingRole"], role = "lifecycle_governor"): InterfaceActor {
  return { actorId: "eng-1", actorRole: role, actingRole, at, workspaceId: "workspace-a" };
}
function must<T extends { error: string | null; register: InterfaceRegister }>(result: T): InterfaceRegister {
  expect(result.error).toBeNull();
  return result.register;
}
function draft(partial: Partial<Omit<EngineeringInterface, "receivers">> & { id: string; sourceDiscipline: InterfaceDiscipline; receivers: InterfaceDiscipline[]; parameter: string }): Omit<EngineeringInterface, "status" | "current" | "previousId" | "receivers" | "tqId" | "decisionId"> & { receivers: InterfaceDiscipline[] } {
  return {
    revision: 1,
    stage: "feed",
    maturity: "controlled",
    sourceObjectType: "equipment",
    sourceObjectId: partial.id,
    sourceRevision: "1",
    receiverObjectType: null,
    receiverObjectId: null,
    category: "DESIGN_INPUT",
    canonicalParameterId: null,
    value: "synthetic",
    unit: "kg",
    coordinateSystem: "PROJECT_GLOBAL",
    axisConvention: "GLOBAL",
    datum: "AHD",
    transformationId: null,
    criticality: "MEDIUM",
    dueDate: "2026-11-01T00:00:00Z",
    packageId: null,
    assumption: null,
    provenance: "SYNTHETIC_VALIDATION_FIXTURE",
    ...partial,
  };
}
function issue(register: InterfaceRegister, source: InterfaceDiscipline, id: string): InterfaceRegister {
  register = must(progressInterface(register, actor(source), id, "ready_for_issue"));
  return must(progressInterface(register, actor(source), id, "issued"));
}
function accept(register: InterfaceRegister, receiver: InterfaceDiscipline, id: string, detail?: { condition?: string; blocksStage?: "detailed_engineering" }): InterfaceRegister {
  register = must(recordReceiver(register, actor(receiver), id, receiver, "received"));
  register = must(recordReceiver(register, actor(receiver), id, receiver, "under_review"));
  return must(recordReceiver(register, actor(receiver), id, receiver, detail?.condition ? "accepted_with_conditions" : "accepted", detail));
}

describe("EOS 2.11 cross-discipline interface intelligence", () => {
  it("governs synthetic handoffs across eight disciplines without recalculating", () => {
    let register = must(createInterfaceRegister({
      id: "if-reg", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-interface-demo",
      projectTitle: "EOS Cross-Discipline Interface Intelligence Demo", actorId: "eng-1", at,
    }));
    expect(register.canonicalInterfaceReplaced).toBe(false);
    expect(register.d1kReplaced).toBe(false);
    register = must(addInterface(register, actor("process"), draft({ id: "duty-1", sourceDiscipline: "process", receivers: ["mechanical"], parameter: "pump duty", category: "PROCESS_CONDITION", value: "synthetic", unit: "kW", canonicalParameterId: "p101-duty" })));
    register = issue(register, "process", "duty-1");
    register = accept(register, "mechanical", "duty-1");
    expect(register.interfaces.find((item) => item.id === "duty-1")?.status).toBe("accepted");

    register = must(addInterface(register, actor("mechanical"), draft({ id: "mass-1", sourceDiscipline: "mechanical", receivers: ["structural"], parameter: "operating mass", category: "LOAD", value: "12000", unit: "kg", canonicalParameterId: "p101-mass" })));
    register = issue(register, "mechanical", "mass-1");
    register = accept(register, "structural", "mass-1");
    register = must(addDependent(register, actor("structural"), { id: "str-model", kind: "model", inputIds: ["mass-1"], freshness: "current", conclusion: null }));
    register = must(addDependent(register, actor("structural"), { id: "str-calc", kind: "calculation", inputIds: ["mass-1"], freshness: "current", conclusion: null }));
    register = must(addDependent(register, actor("structural"), { id: "str-del", kind: "deliverable", inputIds: ["mass-1"], freshness: "current", conclusion: null }));

    register = must(addInterface(register, actor("piping"), draft({ id: "reac-1", sourceDiscipline: "piping", receivers: ["structural"], parameter: "support reaction", category: "PIPING_LOAD", value: "45", unit: "kN", coordinateSystem: "PROJECT_GLOBAL", axisConvention: "GLOBAL", transformationId: "xform-1" })));
    register = issue(register, "piping", "reac-1");
    register = accept(register, "structural", "reac-1");
    expect(coordinateDiagnostic({ sourceSystem: "PROJECT_GLOBAL", expectedSystem: "PROJECT_GLOBAL", sourceAxis: "GLOBAL", expectedAxis: "GLOBAL", transformationId: "xform-1", datum: "AHD", requiresDatum: false })).toBeNull();

    register = must(addInterface(register, actor("structural"), draft({ id: "fnd-1", sourceDiscipline: "structural", receivers: ["geotechnical"], parameter: "foundation load", category: "FOUNDATION_INPUT", value: "synthetic", unit: "kN" })));
    register = issue(register, "structural", "fnd-1");
    register = accept(register, "geotechnical", "fnd-1");
    register = must(addInterface(register, actor("geotechnical"), draft({ id: "geo-1", sourceDiscipline: "geotechnical", receivers: ["structural"], parameter: "bearing parameter", category: "GEOTECHNICAL_PARAMETER", value: "synthetic", unit: "kPa" })));
    register = issue(register, "geotechnical", "geo-1");
    register = accept(register, "structural", "geo-1");
    register = must(addInterface(register, actor("civil"), draft({ id: "lvl-1", sourceDiscipline: "civil", receivers: ["structural", "mechanical"], parameter: "finished level", category: "CIVIL_LEVEL", value: "103.25", unit: "m", datum: "AHD" })));
    register = issue(register, "civil", "lvl-1");
    register = accept(register, "structural", "lvl-1");
    expect(register.interfaces.find((item) => item.id === "lvl-1")?.receivers.find((item) => item.discipline === "mechanical")?.status).toBe("pending");
    register = accept(register, "mechanical", "lvl-1");

    register = must(addInterface(register, actor("mechanical"), draft({ id: "pwr-1", sourceDiscipline: "mechanical", receivers: ["electrical"], parameter: "motor rated power", category: "ELECTRICAL_LOAD", value: "synthetic", unit: "kW" })));
    register = issue(register, "mechanical", "pwr-1");
    register = accept(register, "electrical", "pwr-1");
    register = must(addInterface(register, actor("process"), draft({ id: "trip-1", sourceDiscipline: "process", receivers: ["instrumentation_and_control"], parameter: "high-high trip", category: "SAFETY_REQUIREMENT", value: null, unit: null, assumption: "SIL target is not fabricated" })));
    register = issue(register, "process", "trip-1");
    register = accept(register, "instrumentation_and_control", "trip-1");
    register = must(addInterface(register, actor("electrical"), draft({ id: "ups-1", sourceDiscipline: "electrical", receivers: ["instrumentation_and_control"], parameter: "UPS supply", category: "POWER_SUPPLY", value: "synthetic", unit: "kW" })));
    register = issue(register, "electrical", "ups-1");
    register = accept(register, "instrumentation_and_control", "ups-1");
    register = must(addInterface(register, actor("instrumentation_and_control"), draft({ id: "panel-1", sourceDiscipline: "instrumentation_and_control", receivers: ["electrical"], parameter: "panel load", category: "ELECTRICAL_LOAD", value: "synthetic", unit: "kW" })));
    register = issue(register, "instrumentation_and_control", "panel-1");
    register = accept(register, "electrical", "panel-1");
    register = must(addInterface(register, actor("process"), draft({ id: "line-1", sourceDiscipline: "process", receivers: ["piping"], parameter: "design pressure", category: "PROCESS_CONDITION", value: "1600", unit: "kPa" })));
    register = issue(register, "process", "line-1");
    register = accept(register, "piping", "line-1");
    register = must(addInterface(register, actor("process"), draft({ id: "util-1", sourceDiscipline: "process", receivers: ["electrical"], parameter: "utility power", category: "UTILITY_REQUIREMENT", value: "synthetic", unit: "kW" })));
    register = issue(register, "process", "util-1");
    register = accept(register, "electrical", "util-1");
    register = must(addInterface(register, actor("piping"), draft({ id: "tap-1", sourceDiscipline: "piping", receivers: ["instrumentation_and_control"], parameter: "instrument tapping", category: "INSTRUMENT_REQUIREMENT", value: "synthetic", unit: "mm" })));
    register = issue(register, "piping", "tap-1");
    register = accept(register, "instrumentation_and_control", "tap-1");
    register = must(addInterface(register, actor("geotechnical"), draft({ id: "exc-1", sourceDiscipline: "geotechnical", receivers: ["civil"], parameter: "excavation constraint", category: "GEOTECHNICAL_PARAMETER", value: "synthetic", unit: "m" })));
    register = issue(register, "geotechnical", "exc-1");
    register = accept(register, "civil", "exc-1");
    register = must(addInterface(register, actor("piping"), draft({ id: "ug-1", sourceDiscipline: "piping", receivers: ["civil"], parameter: "underground route", category: "GEOMETRY", value: "synthetic", unit: "m" })));
    register = issue(register, "piping", "ug-1");
    register = accept(register, "civil", "ug-1");
    register = must(addInterface(register, actor("civil"), draft({ id: "cut-1", sourceDiscipline: "civil", receivers: ["geotechnical"], parameter: "excavation geometry", category: "GEOMETRY", value: "synthetic", unit: "m" })));
    register = issue(register, "civil", "cut-1");
    register = accept(register, "geotechnical", "cut-1");
    register = must(addPackage(register, actor("mechanical"), { id: "pkg-mass", title: "Mechanical to Structural load package", interfaceIds: ["mass-1"] }));

    register = must(freezeInterfaceBaseline(register, actor("owner"), "feed_baseline", "base-feed"));
    const snapshot = register.baselines[0];
    const revised = must(reviseInterface(register, actor("mechanical"), "mass-1", "14000", "kg"));
    register = revised;
    expect(register.interfaces.find((item) => item.id === "mass-1")?.value).toBe("12000");
    expect(register.interfaces.find((item) => item.id === "mass-1")?.status).toBe("superseded");
    expect(register.interfaces.find((item) => item.id === "mass-1-r2")?.value).toBe("14000");
    expect(register.interfaces.find((item) => item.id === "mass-1-r2")?.receivers[0]?.status).toBe("pending");
    expect(register.dependents.find((item) => item.id === "str-model")?.freshness).toBe("potentially_stale");
    expect(register.dependents.find((item) => item.id === "str-calc")?.freshness).toBe("potentially_stale");
    expect(register.dependents.find((item) => item.id === "str-del")?.freshness).toBe("potentially_stale");
    expect(register.dependents.every((item) => item.conclusion === null)).toBe(true);
    expect(snapshot?.revisions.some((item) => item.id === "mass-1" && item.revision === 1)).toBe(true);
    expect(snapshot?.revisions.some((item) => item.id === "mass-1-r2")).toBe(false);
    expect(restoreSuperseded(register).error).toMatch(/cannot become current/);
    expect(interfaceAdvisory(register)).toMatch(/does not accept an interface/);
    expect(interfaceAdvisory(register)).not.toMatch(/foundation is inadequate/);
    expect(interfaceHome(register, at).stale).toBeGreaterThan(0);
    expect(interfaceMatrix(register).some((row) => row.source === "process" && row.receiver === "mechanical")).toBe(true);
    expect(disciplineInterfaceSummary(register, "structural").received).toBeGreaterThan(0);
    expect(projectInterfaceReadiness(register, at).active).toBeGreaterThan(8);
    expect(AI_INTERFACE_ACCEPTANCE_AUTHORITY).toBe(false);
    expect(AI_INTERFACE_VALUE_MUTATION_AUTHORITY).toBe(false);
    expect(AI_AUTOMATIC_ENGINEERING_RECALCULATION).toBe(false);
  });

  it("detects unit, coordinate, acceptance, and graph failures without crossing workspaces", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(compareUnits("1600", "kPa", "1.6", "MPa").code).toBe("COMPATIBLE_EQUIVALENT");
    expect(compareUnits("1600", "kPa", "1600", "kN").code).toBe("UNIT_MISMATCH");
    expect(compareUnits("12000", "kg", "10500", "kg").code).toBe("VALUE_CONFLICT");
    expect(coordinateDiagnostic({ sourceSystem: "PIPE_LOCAL", expectedSystem: "PROJECT_GLOBAL", sourceAxis: null, expectedAxis: null, transformationId: null, datum: null, requiresDatum: false })).toBe("COORDINATE_SYSTEM_MISMATCH");
    expect(coordinateDiagnostic({ sourceSystem: "PROJECT_GLOBAL", expectedSystem: "PROJECT_GLOBAL", sourceAxis: "LOCAL_Y", expectedAxis: "GLOBAL_Y", transformationId: null, datum: "AHD", requiresDatum: false })).toBe("AXIS_AMBIGUITY");
    expect(coordinateDiagnostic({ sourceSystem: "PIPE_LOCAL", expectedSystem: "PROJECT_GLOBAL", sourceAxis: null, expectedAxis: null, transformationId: "xform-1", datum: "AHD", requiresDatum: false })).toBeNull();

    let register = must(createInterfaceRegister({ id: "if-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-interface-demo", projectTitle: "EOS Cross-Discipline Interface Intelligence Demo", actorId: "eng-1", at }));
    expect(progressInterface(register, actor("process"), "missing", "accepted").error).toMatch(/not found|cannot skip/);
    register = must(addInterface(register, actor("mechanical"), draft({ id: "noz-1", sourceDiscipline: "mechanical", receivers: ["piping"], parameter: "nozzle", category: "NOZZLE_DATA", value: "synthetic", unit: "mm" })));
    expect(progressInterface(register, actor("mechanical"), "noz-1", "issued").error).toMatch(/not legal/);
    register = issue(register, "mechanical", "noz-1");
    expect(recordReceiver(register, actor("mechanical"), "noz-1", "piping", "received").error).toMatch(/cannot record receiver acceptance/);
    expect(recordReceiver(register, { ...actor("piping"), actorRole: "ai", actingRole: "ai" }, "noz-1", "piping", "received").error).toMatch(/cannot accept or reject/);
    register = must(addDependent(register, actor("piping"), { id: "stress-1", kind: "model", inputIds: ["noz-1"], freshness: "current", conclusion: null }));
    register = must(reviseInterface(register, actor("mechanical"), "noz-1", "revised", "mm"));
    expect(register.dependents[0]?.freshness).toBe("potentially_stale");

    register = must(addInterface(register, actor("process"), draft({ id: "rej-1", sourceDiscipline: "process", receivers: ["mechanical"], parameter: "incomplete duty", value: "synthetic", unit: "kW" })));
    register = issue(register, "process", "rej-1");
    register = must(recordReceiver(register, actor("mechanical"), "rej-1", "mechanical", "received"));
    register = must(recordReceiver(register, actor("mechanical"), "rej-1", "mechanical", "under_review"));
    register = must(recordReceiver(register, actor("mechanical"), "rej-1", "mechanical", "rejected", { rationale: "Range is incomplete" }));
    expect(register.interfaces.find((item) => item.id === "rej-1")?.value).toBe("synthetic");
    register = must(linkTechnicalQuery(register, actor("mechanical"), "rej-1", "tq-synthetic"));
    register = must(linkDecision(register, actor("process"), "rej-1", "dec-synthetic"));
    expect(register.interfaces.find((item) => item.id === "rej-1")?.tqId).toBe("tq-synthetic");

    register = must(addInterface(register, actor("mechanical"), draft({ id: "cond-1", sourceDiscipline: "mechanical", receivers: ["piping"], parameter: "nozzle allowable", category: "NOZZLE_DATA", criticality: "CRITICAL", value: "synthetic", unit: "kN" })));
    register = issue(register, "mechanical", "cond-1");
    register = accept(register, "piping", "cond-1", { condition: "Accepted for FEED subject to vendor confirmation", blocksStage: "detailed_engineering" });
    expect(detailedInterfaceGate(register).blockers).toContain("unresolved_condition");

    register = must(addInterface(register, actor("process"), draft({ id: "late-1", sourceDiscipline: "process", receivers: ["mechanical"], parameter: "late duty", criticality: "CRITICAL", stage: "concept", dueDate: "2026-10-01T00:00:00Z", value: "synthetic", unit: "kW" })));
    register = issue(register, "process", "late-1");
    expect(diagnoseInterfaces(register, at)).toContain("OVERDUE_INTERFACE");
    register = must(publishOverdue(register, actor("process")));
    expect(register.events.some((item) => item.type === "interface_overdue")).toBe(true);

    register = must(addInterface(register, actor("process"), draft({ id: "feed-crit", sourceDiscipline: "process", receivers: ["mechanical"], parameter: "critical feed", criticality: "CRITICAL", stage: "feed", value: "synthetic", unit: "kW" })));
    expect(feedInterfaceGate(register).ready).toBe(false);
    register = issue(register, "process", "feed-crit");
    register = accept(register, "mechanical", "feed-crit");
    expect(feedInterfaceGate(register).ready).toBe(true);

    register = must(addInterface(register, actor("civil"), draft({ id: "orphan-1", sourceDiscipline: "civil", receivers: ["structural"], parameter: "orphan", sourceObjectId: null, value: "synthetic", unit: "m", category: "CIVIL_LEVEL", datum: null })));
    expect(diagnoseInterfaces(register, at)).toContain("ORPHAN_INTERFACE");
    expect(diagnoseInterfaces(register, at)).toContain("REFERENCE_DATUM_MISSING");
    register = must(addInterface(register, actor("mechanical"), draft({ id: "same-1", sourceDiscipline: "mechanical", receivers: ["structural"], parameter: "operating mass", sourceObjectId: "same-source", value: "12000", unit: "kg" })));
    expect(addInterface(register, actor("mechanical"), draft({ id: "dup-1", sourceDiscipline: "mechanical", receivers: ["structural"], parameter: "operating mass", sourceObjectId: "same-source", value: "12000", unit: "kg" })).error).toBe("DUPLICATE_INTERFACE");
    register = must(addDependency(register, actor("mechanical"), { id: "edge-1", fromId: "a", toId: "b", relation: "DEPENDS_ON" }));
    expect(addDependency(register, actor("mechanical"), { id: "edge-2", fromId: "b", toId: "a", relation: "DEPENDS_ON" }).error).toMatch(/CIRCULAR_DEPENDENCY/);
    expect(traverseDependencies(register, "a", 2).nodes).toEqual(["a", "b"]);
    expect(overwriteSourceValue(register, actor("structural"), "late-1", "changed").error).toMatch(/cannot overwrite/);
    expect(addInterface(register, { ...actor("process"), workspaceId: "workspace-b" }, draft({ id: "other", sourceDiscipline: "process", receivers: ["mechanical"], parameter: "other", value: "1", unit: "kW" })).error).toBe("cross_workspace_denied");
  });
});
