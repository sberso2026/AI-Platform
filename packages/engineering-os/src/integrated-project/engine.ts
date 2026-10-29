import { createCivilDelivery } from "../civil-delivery";
import { addChange, addDependency as addChangeEdge, addRequirement as addChangeRequirement, applyRequirementImpact, assessMateriality, baselineDisposition, confirmAction, createChangeRegister, discoverImpacts, freezeChangeBaseline, rewriteBaseline } from "../change-impact";
import type { ChangeActor } from "../change-impact";
import { changeMaturity, createDeliveryLifecycle, requestStageTransition } from "../delivery-lifecycle";
import type { DeliveryLifecycle, DeliveryStage } from "../delivery-lifecycle/model";
import {
  addDeliverable as addFreezeDeliverable,
  addFreeze,
  approveDeliverable,
  approveFreeze,
  assessFreeze,
  compareBaselines,
  createFreezeRegister,
  includeInBaseline,
  markUpstreamRevision,
  progressReview,
  releaseDeliverable,
  supersedeDeliverable,
  updateDependencies,
  updateFreezeItem,
} from "../design-freeze";
import type { FreezeActor, RevisionRef } from "../design-freeze";
import { createElectricalDelivery } from "../electrical-delivery";
import { addBasisItem, addCalculation, addInput, addRequirement, addSource, createBasisGraph, reviseInput, verifyRequirement } from "../engineering-basis";
import { createGeotechnicalDelivery } from "../geotechnical-delivery";
import { createInstrumentationDelivery } from "../instrumentation-delivery";
import { addDependent, addInterface, compareUnits, coordinateDiagnostic, createInterfaceRegister, progressInterface, publishOverdue, recordReceiver, reviseInterface } from "../interface-intelligence";
import type { InterfaceActor, InterfaceDiscipline } from "../interface-intelligence";
import { createMechanicalDelivery } from "../mechanical-delivery";
import { createPipingDelivery } from "../piping-delivery";
import { createProcessDelivery } from "../process-delivery";
import { createStructuralDelivery } from "../structural-delivery";

const at = "2026-10-29T01:00:00Z";
const tenantId = "tenant-a";
const workspaceId = "workspace-a";
const projectId = "EOS-IPF-001";
const projectTitle = "EOS Integrated Process Facility Demonstration";
const provenance = "SYNTHETIC_VALIDATION_FIXTURE";

const NAMED_INTERFACES = [
  ["duty", "process", "mechanical", "pump duty", "PROCESS_CONDITION", "120", "kW"],
  ["mass", "mechanical", "structural", "operating mass", "LOAD", "12000", "kg"],
  ["pressure", "process", "piping", "design pressure", "PROCESS_CONDITION", "1600", "kPa"],
  ["nozzle", "mechanical", "piping", "nozzle location", "NOZZLE_DATA", "north", "deg"],
  ["fnd", "structural", "geotechnical", "foundation load", "FOUNDATION_INPUT", "900", "kN"],
  ["excavation", "geotechnical", "civil", "excavation constraint", "GEOTECHNICAL_PARAMETER", "3.0", "m"],
  ["motor", "mechanical", "electrical", "motor rated power", "ELECTRICAL_LOAD", "75", "kW"],
  ["trip", "process", "instrumentation_and_control", "high-high trip", "SAFETY_REQUIREMENT", "1500", "kPa"],
  ["ups", "electrical", "instrumentation_and_control", "UPS supply", "POWER_SUPPLY", "10", "kW"],
  ["panel", "instrumentation_and_control", "electrical", "panel load", "ELECTRICAL_LOAD", "4", "kW"],
  ["reaction", "piping", "structural", "support reaction", "PIPING_LOAD", "45", "kN"],
  ["level", "civil", "structural", "finished level", "CIVIL_LEVEL", "103.25", "m"],
  ["elevation", "civil", "mechanical", "equipment elevation", "CIVIL_LEVEL", "103.25", "m"],
  ["underground", "piping", "civil", "underground route", "GEOMETRY", "40", "m"],
  ["bearing", "geotechnical", "structural", "bearing parameter", "GEOTECHNICAL_PARAMETER", "150", "kPa"],
  ["utility", "process", "electrical", "utility power", "UTILITY_REQUIREMENT", "200", "kW"],
  ["tapping", "piping", "instrumentation_and_control", "instrument tapping", "INSTRUMENT_REQUIREMENT", "50", "mm"],
  ["signal", "mechanical", "instrumentation_and_control", "package signal", "CONTROL_SIGNAL", "1", "mA"],
  ["outline", "structural", "civil", "foundation outline", "GEOMETRY", "6", "m"],
  ["drainage", "civil", "geotechnical", "drainage outfall", "GEOMETRY", "20", "m"],
  ["reject-note", "process", "mechanical", "preliminary note", "OTHER", "note", "text"],
  ["allowable", "mechanical", "piping", "nozzle allowable", "NOZZLE_DATA", "30", "kN"],
] as const;

export type IntegratedDemonstration = {
  projectId: string;
  projectTitle: string;
  facility: string;
  stage: DeliveryStage;
  stages: DeliveryStage[];
  disciplines: string[];
  conceptDecision: string;
  overrideRationale: string | null;
  fingerprints: Record<string, string>;
  detailedFreezeBefore: string;
  detailedFreezeBlocker: string;
  detailedFreezeAfter: string;
  ifcReleaseBlocked: string;
  originalIfcRevision: string;
  revisedIfcRevision: string;
  originalIfcUnchanged: boolean;
  calculationFreshness: string;
  requirementStatus: string;
  requirementEvidencePreserved: string;
  unitComparison: string;
  coordinateCheck: string;
  feedComparisonRevised: string[];
  auditActions: string[];
  projectControlEvents: string[];
  aiAnswers: Record<string, string>;
  unauthorized: string[];
  counts: { interfaces: number; changes: number; deliverables: number; dependencyEdges: number };
  leakCount: number;
  formulasChanged: false;
  recalculated: boolean;
  baselineRewriteBlocked: string | null;
  impactDisposition: string;
  limitations: string[];
};

function fail(label: string, error: string | null): never {
  throw new Error(`${label}: ${error ?? "uncommitted"}`);
}
function basisActor(role = "process_engineer") {
  return { actorId: "eng-1", actorRole: role, at, workspaceId };
}
function ifaceActor(actingRole: InterfaceDiscipline | "ai"): InterfaceActor {
  return { actorId: "eng-1", actorRole: actingRole === "ai" ? "ai" : "discipline_engineer", actingRole, at, workspaceId };
}
function changeActor(actingRole: string, role = "discipline_engineer"): ChangeActor {
  return { actorId: "eng-1", actorRole: role, actingRole, at, workspaceId };
}
function freezeActor(actingRole: string, role = "discipline_engineer"): FreezeActor {
  return { actorId: "eng-1", actorRole: role, actingRole, at, workspaceId };
}
function meet(lifecycle: DeliveryLifecycle): DeliveryLifecycle {
  return {
    ...lifecycle,
    criteria: lifecycle.criteria.map((item) => item.stage === lifecycle.stage ? { ...item, status: "met" as const, evidenceRef: `EOS-IPF-001-${lifecycle.stage}`, owner: "pem-1" } : item),
  };
}
function advance(lifecycle: DeliveryLifecycle, to: DeliveryStage): DeliveryLifecycle {
  const result = requestStageTransition(meet(lifecycle), {
    to, reason: `Governed move to ${to}`, actorId: "pem-1", actorRole: "lifecycle_governor", at, canAuthorizeLifecycleTransition: true,
  });
  if (!result.committed || result.error) fail(`stage ${to}`, result.error);
  return result.lifecycle;
}

export function runIntegratedDemonstration(): IntegratedDemonstration {
  const stages: DeliveryStage[] = ["not_classified"];
  let lifecycle = createDeliveryLifecycle({ id: "eos-ipf-001-life", tenantId, workspaceId, projectId, actorId: "pem-1", at }).lifecycle;
  const skipped = requestStageTransition(lifecycle, { to: "feed", reason: "skip", actorId: "pem-1", actorRole: "lifecycle_governor", at, canAuthorizeLifecycleTransition: true });
  if (skipped.committed) fail("skip", "stage skip was committed");
  lifecycle = advance(lifecycle, "concept");
  stages.push("concept");
  lifecycle = changeMaturity(lifecycle, "concept_reviewed", "pem-1", at).lifecycle;

  const common = { id: "eos-ipf", tenantId, workspaceId, projectId, projectTitle, actorId: "pem-1", at };
  const deliveries = [
    createProcessDelivery({ ...common, id: "proc" }),
    createMechanicalDelivery({ ...common, id: "mech" }),
    createPipingDelivery({ ...common, id: "pipe" }),
    createStructuralDelivery({ ...common, id: "str" }),
    createCivilDelivery({ ...common, id: "civ" }),
    createGeotechnicalDelivery({ ...common, id: "geo" }),
    createElectricalDelivery({ ...common, id: "elec" }),
    createInstrumentationDelivery({ ...common, id: "ic" }),
  ];
  if (deliveries.some((item) => item.error || item.delivery.projectId !== projectId)) fail("discipline enrollment", "delivery did not join the project");
  if (deliveries.some((item) => item.delivery.audits.some((audit) => audit.detail.formulasChanged === true))) fail("formulas", "a discipline delivery changed formulas");

  let basis = createBasisGraph({ id: "basis", tenantId, workspaceId, projectId, stage: "concept", actorId: "pem-1", at }).graph;
  basis = addSource(basis, basisActor(), { id: "src-project", kind: "design_brief", title: "Synthetic project brief", revision: "1" }).graph;
  const life = addBasisItem(basis, basisActor(), {
    id: "basis-life", level: "project", discipline: "common", category: "design_life", title: "Design life", statement: "25 year synthetic design life",
    unit: "year", sourceId: "src-project", sourceRevision: "1", stage: "concept", status: "draft", effectiveAt: at, owner: "pem-1",
    provenance, parentId: null, inheritance: "add", overrideRationale: null, supersedesId: null,
  });
  if (life.error) fail("basis life", life.error);
  basis = life.graph;
  for (const discipline of ["process", "mechanical", "piping", "structural", "civil", "geotechnical", "electrical", "instrumentation_and_control"] as const) {
    const result = addBasisItem(basis, basisActor(), {
      id: `basis-${discipline}`, level: "discipline", discipline, category: "performance_criterion", title: `${discipline} basis`,
      statement: `Synthetic ${discipline} basis inherited from the project design life.`, unit: null, sourceId: "src-project", sourceRevision: "1",
      stage: "concept", status: "draft", effectiveAt: at, owner: discipline, provenance, parentId: "basis-life", inheritance: "inherit", overrideRationale: null, supersedesId: null,
    });
    if (result.error) fail(`basis ${discipline}`, result.error);
    basis = result.graph;
  }
  const override = addBasisItem(basis, basisActor("structural_engineer"), {
    id: "basis-structural-override", level: "discipline", discipline: "structural", category: "design_life", title: "Structural inspection cycle",
    statement: "Synthetic structural inspection cycle is recorded as a controlled override.", unit: "year", sourceId: "src-project", sourceRevision: "1",
    stage: "concept", status: "draft", effectiveAt: at, owner: "structural", provenance, parentId: "basis-life", inheritance: "override",
    overrideRationale: "The synthetic structural inspection cycle is recorded separately from the project design life.", supersedesId: null,
  });
  if (override.error) fail("override", override.error);
  basis = override.graph;
  for (const [id, discipline, statement] of [
    ["req-process", "process", "Synthetic throughput and product condition"],
    ["req-mechanical", "mechanical", "Synthetic equipment duty and maintainability"],
    ["req-piping", "piping", "Synthetic containment, routing, and flexibility"],
    ["req-structural", "structural", "Synthetic strength, serviceability, and support"],
    ["req-civil", "civil", "Synthetic drainage and access"],
    ["req-geotechnical", "geotechnical", "Synthetic foundation performance and settlement"],
    ["req-electrical", "electrical", "Synthetic power continuity and essential loads"],
    ["req-ic", "instrumentation_and_control", "Synthetic measurement, control, and shutdown"],
  ] as const) {
    const result = addRequirement(basis, basisActor(), {
      id, title: id, statement, requirementType: "performance", discipline, applicability: "EOS-IPF-001", sourceId: "src-project",
      sourceRevision: "1", sourceLocator: null, rationale: "Synthetic controlled requirement", introducedStage: "concept", requiredByStage: "feed",
      criticality: "high", status: "accepted", verificationMethod: "review", owner: discipline, reviewer: null, legacyRequirementId: null, provenance,
    });
    if (result.error) fail(id, result.error);
    basis = result.graph;
  }
  const verified = verifyRequirement(basis, basisActor("structural_engineer"), {
    requirementId: "req-structural", method: "review", evidenceId: "evidence-str-1", result: "Synthetic review evidence", outcome: "pass", comments: null,
  });
  if (verified.error) fail("verify", verified.error);
  basis = verified.graph;
  const massInput = addInput(basis, basisActor("mechanical_engineer"), {
    id: "input-mass", name: "P-101 operating mass", value: "12000", unit: "kg", dataType: "number", sourceId: "src-project", sourceRevision: "1",
    effectiveAt: at, uncertainty: null, stage: "detailed_engineering", status: "current", discipline: "mechanical", owner: "mechanical", provenance,
    revision: 1, supersedesId: null, interfaceUse: { sourceDiscipline: "mechanical", receivingDiscipline: "structural", parameter: "operating mass" },
  });
  if (massInput.error) fail("mass input", massInput.error);
  basis = massInput.graph;
  const tempInput = addInput(basis, basisActor("process_engineer"), {
    id: "input-temp", name: "Design temperature", value: "80", unit: "C", dataType: "number", sourceId: "src-project", sourceRevision: "1",
    effectiveAt: at, uncertainty: null, stage: "feed", status: "current", discipline: "process", owner: "process", provenance, revision: 1, supersedesId: null,
    interfaceUse: { sourceDiscipline: "process", receivingDiscipline: "mechanical", parameter: "design temperature" },
  });
  if (tempInput.error) fail("temp input", tempInput.error);
  basis = tempInput.graph;
  const calculation = addCalculation(basis, basisActor("structural_engineer"), { id: "str-cal", title: "Synthetic support check fixture", inputIds: ["input-mass"], freshness: "current", revision: 1 });
  if (calculation.error) fail("calculation", calculation.error);
  basis = calculation.graph;

  let interfaces = createInterfaceRegister({ id: "if", tenantId, workspaceId, projectId, projectTitle, actorId: "pem-1", at }).register;
  for (const [id, source, receiver, parameter, category, value, unit] of NAMED_INTERFACES) {
    const result = addInterface(interfaces, ifaceActor(source), {
      id, revision: 1, stage: id === "mass" || id === "trip" ? "feed" : "concept", maturity: "preliminary", sourceDiscipline: source,
      sourceObjectType: "equipment", sourceObjectId: `p101-${id}`, sourceRevision: "1", receiverObjectType: null, receiverObjectId: null,
      category, parameter, canonicalParameterId: null, value, unit, coordinateSystem: id === "reaction" ? "PIPE_LOCAL" : "PROJECT_GLOBAL",
      axisConvention: "GLOBAL", datum: "AHD", transformationId: null, criticality: id === "mass" || id === "trip" ? "HIGH" : "MEDIUM",
      dueDate: id === "drainage" ? "2026-10-01T00:00:00Z" : "2026-11-01T00:00:00Z", packageId: null, assumption: null, provenance, receivers: [receiver],
    });
    if (result.error) fail(`interface ${id}`, result.error);
    interfaces = result.register;
  }
  const review = (id: string, receiver: InterfaceDiscipline, conditional = false) => {
    for (const step of ["received", "under_review"] as const) {
      const moved = recordReceiver(interfaces, ifaceActor(receiver), id, receiver, step);
      if (moved.error) fail(`review ${id}`, moved.error);
      interfaces = moved.register;
    }
    const done = recordReceiver(interfaces, ifaceActor(receiver), id, receiver, conditional ? "accepted_with_conditions" : "accepted", conditional ? { condition: "Accepted for FEED subject to vendor confirmation." } : undefined);
    if (done.error) fail(`accept ${id}`, done.error);
    interfaces = done.register;
  };
  const accept = (id: string, source: InterfaceDiscipline, receiver: InterfaceDiscipline, conditional = false) => {
    for (const step of ["ready_for_issue", "issued"] as const) {
      const moved = progressInterface(interfaces, ifaceActor(source), id, step);
      if (moved.error) fail(`issue ${id}`, moved.error);
      interfaces = moved.register;
    }
    review(id, receiver, conditional);
  };
  for (const [id, source, receiver] of NAMED_INTERFACES) {
    if (id === "reject-note" || id === "allowable") continue;
    accept(id, source, receiver);
  }
  interfaces = progressInterface(interfaces, ifaceActor("process"), "reject-note", "ready_for_issue").register;
  interfaces = progressInterface(interfaces, ifaceActor("process"), "reject-note", "issued").register;
  interfaces = recordReceiver(interfaces, ifaceActor("mechanical"), "reject-note", "mechanical", "received").register;
  interfaces = recordReceiver(interfaces, ifaceActor("mechanical"), "reject-note", "mechanical", "under_review").register;
  interfaces = recordReceiver(interfaces, ifaceActor("mechanical"), "reject-note", "mechanical", "rejected", { rationale: "The synthetic note is incomplete." }).register;
  const revisedNote = reviseInterface(interfaces, ifaceActor("process"), "reject-note", "revised note", "text");
  if (revisedNote.error) fail("revise note", revisedNote.error);
  interfaces = revisedNote.register;
  review("reject-note-r2", "mechanical");
  accept("allowable", "mechanical", "piping", true);
  interfaces = addDependent(interfaces, ifaceActor("structural"), { id: "str-model", kind: "model", inputIds: ["mass"], freshness: "current", conclusion: null }).register;
  interfaces = addDependent(interfaces, ifaceActor("structural"), { id: "str-calc-dep", kind: "calculation", inputIds: ["mass"], freshness: "current", conclusion: null }).register;
  interfaces = addDependent(interfaces, ifaceActor("structural"), { id: "str-del", kind: "deliverable", inputIds: ["mass"], freshness: "current", conclusion: null }).register;
  const revisedMass = reviseInterface(interfaces, ifaceActor("mechanical"), "mass", "14000", "kg");
  if (revisedMass.error) fail("revise mass", revisedMass.error);
  interfaces = revisedMass.register;
  const overdue = addInterface(interfaces, ifaceActor("civil"), {
    id: "overdue-access", revision: 1, stage: "concept", maturity: "preliminary", sourceDiscipline: "civil", sourceObjectType: "site",
    sourceObjectId: "access-road", sourceRevision: "1", receiverObjectType: null, receiverObjectId: null, category: "ACCESS_REQUIREMENT",
    parameter: "access width", canonicalParameterId: null, value: "6", unit: "m", coordinateSystem: "PROJECT_GLOBAL", axisConvention: "GLOBAL",
    datum: "AHD", transformationId: null, criticality: "LOW", dueDate: "2026-10-01T00:00:00Z", packageId: null, assumption: null, provenance, receivers: ["structural"],
  });
  if (overdue.error) fail("overdue interface", overdue.error);
  const published = publishOverdue(overdue.register, ifaceActor("civil"));
  if (published.error) fail("overdue event", published.error);
  interfaces = published.register;

  lifecycle = advance(lifecycle, "feasibility");
  stages.push("feasibility");
  lifecycle = changeMaturity(lifecycle, "feasibility_selected", "pem-1", at).lifecycle;
  lifecycle = advance(lifecycle, "feed");
  stages.push("feed");
  lifecycle = changeMaturity(lifecycle, "feed_baselined", "pem-1", at).lifecycle;
  lifecycle = advance(lifecycle, "detailed_engineering");
  stages.push("detailed_engineering");
  lifecycle = changeMaturity(lifecycle, "detailed_design_in_progress", "pem-1", at).lifecycle;

  let changes = createChangeRegister({ id: "chg", tenantId, workspaceId, projectId, projectTitle, actorId: "pem-1", at }).register;
  const massChange = addChange(changes, changeActor("mechanical"), {
    id: "chg-mass", title: "P-101 vendor mass and power", description: "Synthetic vendor revision: operating mass 12000 kg to 14000 kg and motor power 75 kW to 110 kW.", origin: "vendor update", initiatingDiscipline: "mechanical",
    stage: "detailed_engineering", category: "VENDOR_DATA_CHANGE", driver: "vendor update", sourceObjectType: "equipment", sourceObjectId: "p101-vendor",
    previousRevision: "1", newRevision: "2", changedField: "operating_mass", previousValue: "12000", newValue: "14000", unit: "kg", reason: "Vendor data",
    owner: "mechanical", criticality: "HIGH", baselineId: "feed", provenance, supersedesId: null,
    history: [{ revision: "1", value: "12000", unit: "kg" }, { revision: "2", value: "14000", unit: "kg" }],
  });
  if (massChange.error) fail("mass change", massChange.error);
  changes = massChange.register;
  const branches: Array<[string, string, "structural" | "geotechnical" | "electrical" | "instrumentation_and_control", string]> = [
    ["p101-vendor", "mass-iface", "structural", "INTERFACE"],
    ["mass-iface", "str-input", "structural", "DESIGN_BASIS"],
    ["str-input", "str-model-node", "structural", "MODEL"],
    ["str-model-node", "str-calc-node", "structural", "CALCULATION"],
    ["str-calc-node", "str-dwg-node", "structural", "DELIVERABLE"],
    ["str-dwg-node", "geo-node", "geotechnical", "CALCULATION"],
    ["p101-vendor", "motor-iface", "electrical", "INTERFACE"],
    ["motor-iface", "elec-load", "electrical", "ELECTRICAL_LOAD"],
    ["elec-load", "elec-study", "electrical", "MODEL"],
    ["elec-study", "ic-io", "instrumentation_and_control", "INTERFACE"],
  ];
  for (const [fromId, id, discipline, category] of branches) {
    const edge = addChangeEdge(changes, changeActor("mechanical"), { id, objectType: "record", discipline, categories: [category], previousResult: id === "str-calc-node" ? "fixture-result" : null }, fromId);
    if (edge.error) fail(id, edge.error);
    changes = edge.register;
  }
  changes = discoverImpacts(changes, changeActor("mechanical"), "chg-mass", 8).register;
  const geoImpact = changes.impacts.find((item) => item.objectId === "geo-node");
  const calcImpact = changes.impacts.find((item) => item.objectId === "str-calc-node");
  if (!geoImpact || !calcImpact) fail("impacts", "expected structural and geotechnical candidates were not found");
  const noMaterial = assessMateriality(changes, changeActor("geotechnical"), geoImpact.id, "NO_MATERIAL_IMPACT", { rationale: "The synthetic foundation demand remains inside the recorded range." });
  if (noMaterial.error) fail("no material", noMaterial.error);
  changes = noMaterial.register;
  const material = assessMateriality(changes, changeActor("structural"), calcImpact.id, "MATERIAL_IMPACT", { severity: "HIGH", action: "RECALCULATE", rationale: "The fixture still cites 12000 kg." });
  if (material.error) fail("material", material.error);
  changes = material.register;

  let freeze = createFreezeRegister({ id: "frz", tenantId, workspaceId, projectId, projectTitle, actorId: "pem-1", at }).register;
  const refs = (ids: string[], discipline: RevisionRef["discipline"]): RevisionRef[] => ids.map((objectId) => ({ objectId, revision: "1", status: "current", source: provenance, discipline }));
  freeze = addFreeze(freeze, freezeActor("process"), { id: "concept", freezeType: "concept_freeze", stage: "concept", title: "Concept freeze", scope: projectTitle, disciplines: ["process", "mechanical", "piping", "structural", "civil", "geotechnical", "electrical", "instrumentation_and_control"], items: refs(["basis-life"], "process") }).register;
  freeze = approveFreeze(freeze, freezeActor("freeze_authority", "freeze_governor"), "concept").register;
  freeze = addFreeze(freeze, freezeActor("process"), { id: "feasibility", freezeType: "feasibility_selection", stage: "feasibility", title: "Feasibility selection", scope: "Option A adsorption", disciplines: ["process"], items: refs(["option-a"], "process") }).register;
  freeze = approveFreeze(freeze, freezeActor("freeze_authority", "freeze_governor"), "feasibility").register;
  const feedItems = refs(["basis-life", "mass"], "mechanical");
  freeze = addFreeze(freeze, freezeActor("mechanical"), { id: "feed", freezeType: "feed_baseline", stage: "feed", title: "FEED baseline", scope: projectTitle, disciplines: ["process", "mechanical", "piping", "structural", "civil", "geotechnical", "electrical", "instrumentation_and_control"], items: feedItems }).register;
  freeze = approveFreeze(freeze, freezeActor("freeze_authority", "freeze_governor"), "feed").register;
  const feedSnapshot = freeze.freezes.find((item) => item.id === "feed")?.items.map((item) => ({ ...item })) ?? [];
  freeze = addFreeze(freeze, freezeActor("structural"), { id: "detailed", freezeType: "detailed_design_freeze", stage: "detailed_engineering", title: "Detailed design freeze", scope: projectTitle, disciplines: ["structural"], items: [{ objectId: "unresolved-impact", revision: "1", status: "stale", source: provenance, discipline: "structural" }] }).register;
  const before = assessFreeze(freeze.freezes.find((item) => item.id === "detailed")!);
  const confirmed = confirmAction(changes, changeActor("structural"), calcImpact.id);
  if (confirmed.error) fail("confirm", confirmed.error);
  changes = confirmed.register;
  const updated = updateFreezeItem(freeze, freezeActor("structural"), "detailed", "unresolved-impact", "current");
  if (updated.error) fail("update freeze", updated.error);
  freeze = updated.register;
  const after = assessFreeze(freeze.freezes.find((item) => item.id === "detailed")!);
  const detailedApproved = approveFreeze(freeze, freezeActor("freeze_authority", "freeze_governor"), "detailed");
  if (detailedApproved.error) fail("detailed freeze", detailedApproved.error);
  freeze = detailedApproved.register;

  const disciplineDeliverables = [
    ["proc-feed", "process", "report", "PR-BAS-001", "Process basis"],
    ["mech-feed", "mechanical", "datasheet", "MECH-DS-001", "Pump datasheet"],
    ["pipe-feed", "piping", "list", "PIP-LL-001", "Line list"],
    ["str-feed", "structural", "calculation", "STR-CAL-001", "Structural calculation package"],
    ["civ-feed", "civil", "drawing", "CIV-GR-001", "Grading plan"],
    ["geo-feed", "geotechnical", "report", "GEO-RPT-001", "Geotechnical report"],
    ["elec-feed", "electrical", "drawing", "ELEC-SLD-001", "Single line diagram"],
    ["ic-feed", "instrumentation_and_control", "list", "IC-IDX-001", "Instrument index"],
  ] as const;
  const ifcDeliverables = [
    ["proc-ifc", "process", "drawing", "PR-PID-001", "P&ID"],
    ["mech-ifc", "mechanical", "datasheet", "MECH-DS-101", "Vendor datasheet"],
    ["pipe-ifc", "piping", "drawing", "PIP-ISO-001", "Isometric"],
    ["str-ifc", "structural", "drawing", "STR-DWG-001", "Structural drawing"],
    ["civ-ifc", "civil", "drawing", "CIV-DR-001", "Drainage drawing"],
    ["geo-ifc", "geotechnical", "report", "GEO-REC-001", "Construction recommendation"],
    ["elec-ifc", "electrical", "drawing", "ELEC-SLD-101", "IFC single line"],
    ["ic-ifc", "instrumentation_and_control", "report", "IC-NAR-001", "Control narrative"],
  ] as const;
  for (const [id, discipline, type, number, title] of [...disciplineDeliverables, ...ifcDeliverables]) {
    const created = addFreezeDeliverable(freeze, freezeActor(discipline), {
      id, discipline, deliverableType: type, number, title, revision: "1", stage: id.endsWith("-ifc") ? "detailed_engineering" : "feed",
      issuePurpose: id.endsWith("-ifc") ? "CONSTRUCTION" : "INFORMATION", engineeringStatus: "in_preparation", reviewStatus: "not_started",
      approvalStatus: "pending", releaseStatus: "not_released", current: true, plannedDate: null,
      dependencies: id === "str-ifc" ? [{ objectId: "p101-mass", revision: "2", status: "current", source: provenance, discipline: "mechanical" }] : id === "pipe-ifc" ? [{ objectId: "input-temp", revision: "1", status: "current", source: provenance, discipline: "process" }] : [],
    });
    if (created.error) fail(id, created.error);
    freeze = created.register;
  }
  const blocked = releaseDeliverable(freeze, freezeActor("release_authority", "release_governor"), "elec-ifc");
  for (const id of ifcDeliverables.map((item) => item[0])) {
    freeze = progressReview(freeze, freezeActor("structural"), id, "in_review").register;
    freeze = progressReview(freeze, freezeActor("structural"), id, "review_complete").register;
    const approved = approveDeliverable(freeze, freezeActor("deliverable_authority", "deliverable_governor"), id);
    if (approved.error) fail(`approve ${id}`, approved.error);
    freeze = approved.register;
    const released = releaseDeliverable(freeze, freezeActor("release_authority", "release_governor"), id);
    if (released.error) fail(`release ${id}`, released.error);
    freeze = released.register;
  }
  freeze = addFreeze(freeze, freezeActor("structural"), { id: "ifc", freezeType: "ifc_baseline", stage: "detailed_engineering", title: "IFC baseline", scope: projectTitle, disciplines: ["process", "mechanical", "piping", "structural", "civil", "geotechnical", "electrical", "instrumentation_and_control"], items: [] }).register;
  for (const id of ifcDeliverables.map((item) => item[0])) {
    const included = includeInBaseline(freeze, freezeActor("structural"), "ifc", id);
    if (included.error) fail(`include ${id}`, included.error);
    freeze = included.register;
  }
  const ifcApproved = approveFreeze(freeze, freezeActor("freeze_authority", "freeze_governor"), "ifc");
  if (ifcApproved.error) fail("ifc", ifcApproved.error);
  freeze = ifcApproved.register;
  const originalIfc = freeze.freezes.find((item) => item.id === "ifc");
  const temperature = addChange(changes, changeActor("process"), {
    id: "chg-temp", title: "Design temperature revision", description: "Synthetic post-IFC change", origin: "design development", initiatingDiscipline: "process",
    stage: "detailed_engineering", category: "PROCESS_CONDITION_CHANGE", driver: "design development", sourceObjectType: "input", sourceObjectId: "input-temp",
    previousRevision: "1", newRevision: "2", changedField: "design_temperature", previousValue: "80", newValue: "120", unit: "C", reason: "Synthetic case",
    owner: "process", criticality: "MEDIUM", baselineId: "ifc", provenance, supersedesId: null, history: [{ revision: "1", value: "80", unit: "C" }, { revision: "2", value: "120", unit: "C" }],
  });
  if (temperature.error) fail("temperature", temperature.error);
  changes = temperature.register;
  const frozenChange = freezeChangeBaseline(changes, changeActor("process"), "ifc-change-snapshot", "ifc_baseline", [{ objectId: "input-temp", revision: "1", value: "80" }]);
  if (frozenChange.error) fail("change baseline", frozenChange.error);
  changes = frozenChange.register;
  const stale = markUpstreamRevision(freeze, freezeActor("process"), "input-temp", "2");
  if (stale.error) fail("stale", stale.error);
  freeze = stale.register;
  const superseded = supersedeDeliverable(freeze, freezeActor("piping"), "pipe-ifc", "2");
  if (superseded.error) fail("supersede", superseded.error);
  freeze = superseded.register;
  const refreshed = updateDependencies(freeze, freezeActor("piping"), "pipe-ifc-2", [{ objectId: "input-temp", revision: "2", status: "current", source: provenance, discipline: "process" }]);
  if (refreshed.error) fail("refresh dependency", refreshed.error);
  freeze = refreshed.register;
  freeze = progressReview(freeze, freezeActor("piping"), "pipe-ifc-2", "in_review").register;
  freeze = progressReview(freeze, freezeActor("piping"), "pipe-ifc-2", "review_complete").register;
  freeze = approveDeliverable(freeze, freezeActor("deliverable_authority", "deliverable_governor"), "pipe-ifc-2").register;
  const rereleased = releaseDeliverable(freeze, freezeActor("release_authority", "release_governor"), "pipe-ifc-2");
  if (rereleased.error) fail("rerelease", rereleased.error);
  freeze = rereleased.register;
  freeze = addFreeze(freeze, freezeActor("piping"), { id: "ifc-r2", freezeType: "ifc_baseline", stage: "detailed_engineering", title: "Revised IFC baseline", scope: projectTitle, disciplines: ["piping"], items: [{ objectId: "pipe-ifc-2", revision: "2", status: "released", source: provenance, discipline: "piping" }] }).register;
  const revisedBaseline = approveFreeze(freeze, freezeActor("freeze_authority", "freeze_governor"), "ifc-r2");
  if (revisedBaseline.error) fail("ifc-r2", revisedBaseline.error);
  freeze = revisedBaseline.register;
  const revisedInput = reviseInput(basis, basisActor("mechanical_engineer"), "input-mass", "14000");
  if (revisedInput.error) fail("revise input", revisedInput.error);
  basis = revisedInput.graph;
  const changeRequirement = addChangeRequirement(changes, changeActor("process"), { id: "req-temp", governingInputId: "input-temp", evidenceId: "evidence-temp-1", status: "verified" });
  if (changeRequirement.error) fail("change requirement", changeRequirement.error);
  changes = changeRequirement.register;
  const reverified = applyRequirementImpact(changes, changeActor("process"), "chg-temp");
  if (reverified.error) fail("reverify", reverified.error);
  changes = reverified.register;

  for (let index = 0; index < 80; index += 1) {
    const result = addInterface(interfaces, ifaceActor("process"), {
      id: `scale-if-${index}`, revision: 1, stage: "concept", maturity: "preliminary", sourceDiscipline: "process", sourceObjectType: "scale",
      sourceObjectId: `scale-src-${index}`, sourceRevision: "1", receiverObjectType: null, receiverObjectId: null, category: "OTHER", parameter: `scale-link-${index}`,
      canonicalParameterId: null, value: "1", unit: "m", coordinateSystem: "PROJECT_GLOBAL", axisConvention: "GLOBAL", datum: "AHD", transformationId: null,
      criticality: "LOW", dueDate: "2026-12-01T00:00:00Z", packageId: null, assumption: null, provenance, receivers: ["mechanical"],
    });
    if (result.error) fail(`scale interface ${index}`, result.error);
    interfaces = result.register;
  }
  for (let index = 0; index < 40; index += 1) {
    const result = addFreezeDeliverable(freeze, freezeActor("process"), {
      id: `scale-del-${index}`, discipline: "process", deliverableType: "report", number: `SCALE-${index}`, title: "Scale fixture", revision: "1",
      stage: "concept", issuePurpose: "WORKING", engineeringStatus: "draft", reviewStatus: "not_started", approvalStatus: "pending", releaseStatus: "not_released",
      current: true, plannedDate: null, dependencies: [],
    });
    if (result.error) fail(`scale deliverable ${index}`, result.error);
    freeze = result.register;
  }
  for (let index = 0; index < 25; index += 1) {
    const result = addChange(changes, changeActor("process"), {
      id: `scale-chg-${index}`, title: "Scale fixture", description: "Scale fixture", origin: "design development", initiatingDiscipline: "process", stage: "concept",
      category: "OTHER", driver: "design development", sourceObjectType: "scale", sourceObjectId: `scale-obj-${index}`, previousRevision: "1", newRevision: "1",
      changedField: "description", previousValue: "a", newValue: "b", unit: null, reason: "Scale", owner: "process", criticality: "LOW", baselineId: null, provenance,
      supersedesId: null, history: [{ revision: "1", value: "a", unit: null }],
    });
    if (result.error) fail(`scale change ${index}`, result.error);
    changes = result.register;
  }
  changes = addChangeEdge(changes, changeActor("process"), { id: "scale-node-0", objectType: "input", discipline: "process", categories: ["DIRECT"], previousResult: null }, null).register;
  let edgeFrom = "scale-node-0";
  for (let index = 1; index <= 240; index += 1) {
    const id = `scale-node-${index}`;
    const edge = addChangeEdge(changes, changeActor("process"), { id, objectType: "input", discipline: "process", categories: ["INDIRECT"], previousResult: null }, edgeFrom);
    if (edge.error) fail(`scale edge ${index}`, edge.error);
    changes = edge.register;
    edgeFrom = id;
  }

  const unauthorized = [
    recordReceiver(interfaces, ifaceActor("ai"), "duty", "mechanical", "accepted").error,
    approveFreeze(freeze, freezeActor("ai", "ai"), "concept").error,
    releaseDeliverable(freeze, freezeActor("release_authority", "owner"), "proc-ifc").error,
    requestStageTransition(lifecycle, { to: "concept", reason: "back", actorId: "ai", actorRole: "ai", at, canAuthorizeLifecycleTransition: true }).error,
  ].filter((item): item is string => Boolean(item));
  const leakAttempts = [
    addInterface(interfaces, { ...ifaceActor("process"), workspaceId: "workspace-b" }, {
      id: "leak", revision: 1, stage: "concept", maturity: "preliminary", sourceDiscipline: "process", sourceObjectType: "x", sourceObjectId: "x",
      sourceRevision: "1", receiverObjectType: null, receiverObjectId: null, category: "OTHER", parameter: "leak", canonicalParameterId: null, value: "1", unit: "m",
      coordinateSystem: null, axisConvention: null, datum: null, transformationId: null, criticality: "LOW", dueDate: null, packageId: null, assumption: null, provenance, receivers: ["mechanical"],
    }).error,
    addChange(changes, { ...changeActor("process"), workspaceId: "workspace-b" }, {
      id: "leak", title: "leak", description: "leak", origin: "leak", initiatingDiscipline: "process", stage: "concept", category: "OTHER", driver: "design development",
      sourceObjectType: "x", sourceObjectId: "x", previousRevision: "1", newRevision: "1", changedField: "description", previousValue: "a", newValue: "b", unit: null,
      reason: "leak", owner: "process", criticality: "LOW", baselineId: null, provenance, supersedesId: null, history: [],
    }).error,
    releaseDeliverable(freeze, { ...freezeActor("release_authority", "release_governor"), workspaceId: "workspace-b" }, "proc-ifc").error,
    addBasisItem(basis, { ...basisActor(), workspaceId: "workspace-b" }, {
      id: "leak", level: "project", discipline: "common", category: "project_objective", title: "leak", statement: "leak", unit: null, sourceId: null,
      sourceRevision: null, stage: "concept", status: "draft", effectiveAt: null, owner: null, provenance, parentId: null, inheritance: "add", overrideRationale: null, supersedesId: null,
    }).error,
  ];
  const requirement = changes.requirements.find((item) => item.id === "req-temp");
  const comparison = compareBaselines(feedSnapshot, feedSnapshot.map((item) => item.objectId === "mass" ? { ...item, revision: "2" } : item));
  return {
    projectId, projectTitle, facility: "Synthetic Gas Conditioning Facility", stage: lifecycle.stage, stages,
    disciplines: ["process", "mechanical", "piping", "structural", "civil", "geotechnical", "electrical", "instrumentation_and_control"],
    conceptDecision: "Option A adsorption-based dehydration is the recorded human selection. AI did not decide it.",
    overrideRationale: basis.basisItems.find((item) => item.id === "basis-structural-override")?.overrideRationale ?? null,
    fingerprints: Object.fromEntries(freeze.freezes.map((item) => [item.id, item.fingerprint])),
    detailedFreezeBefore: before.readiness, detailedFreezeBlocker: before.blockers[0] ?? "none", detailedFreezeAfter: after.readiness,
    ifcReleaseBlocked: blocked.error ?? "not blocked",
    originalIfcRevision: originalIfc?.items.find((item) => item.objectId === "pipe-ifc")?.revision ?? "missing",
    revisedIfcRevision: freeze.freezes.find((item) => item.id === "ifc-r2")?.items[0]?.revision ?? "missing",
    originalIfcUnchanged: freeze.freezes.find((item) => item.id === "ifc")?.fingerprint === originalIfc?.fingerprint,
    calculationFreshness: basis.calculations.find((item) => item.id === "str-cal")?.freshness ?? "missing",
    requirementStatus: requirement?.status ?? "missing", requirementEvidencePreserved: requirement?.evidenceId ?? "missing",
    unitComparison: compareUnits("1600", "kPa", "1.6", "MPa").code,
    coordinateCheck: coordinateDiagnostic({ sourceSystem: "PIPE_LOCAL", expectedSystem: "PROJECT_GLOBAL", sourceAxis: null, expectedAxis: null, transformationId: null, datum: "AHD", requiresDatum: false }) ?? "none",
    feedComparisonRevised: comparison.revised,
    auditActions: [...basis.audits.map((item) => item.action), ...interfaces.audits.map((item) => item.action), ...changes.audits.map((item) => item.action), ...freeze.audits.map((item) => item.action)],
    projectControlEvents: [...interfaces.events.map((item) => item.type), ...changes.events.map((item) => item.type), ...freeze.events.map((item) => item.type)],
    aiAnswers: {
      detailedFreeze: `FACT: Detailed Design Freeze readiness was NOT_READY because ${before.blockers[0] ?? "none"}. HUMAN_DECISION_REQUIRED.`,
      vendorRevision: `FACT: P-101 operating mass moved from 12000 kg to 14000 kg. DETERMINISTIC_DEPENDENCY: ${changes.impacts.filter((item) => item.changeId === "chg-mass").map((item) => `${item.discipline}:${item.objectId}`).join(", ")}. HUMAN_DECISION_REQUIRED.`,
      staleModels: `FACT: calculation str-cal freshness is ${basis.calculations.find((item) => item.id === "str-cal")?.freshness ?? "missing"}. RECOMMENDATION: a structural engineer reviews the fixture. HUMAN_DECISION_REQUIRED.`,
      unresolvedInterfaces: "INTERFACE_VALUE: allowable was accepted with a condition. FACT: the rejected note was revised and accepted. HUMAN_DECISION_REQUIRED.",
      ifcPackage: `DELIVERABLE_STATE: ${blocked.error ?? "not blocked"}. This statement does not authorize release. HUMAN_DECISION_REQUIRED.`,
      reverification: `FACT: requirement req-temp status is ${requirement?.status ?? "missing"}. Evidence evidence-temp-1 remains. HUMAN_DECISION_REQUIRED.`,
      affectedDeliverables: "CHANGE: pipe-ifc depends on input-temp revision 1. DELIVERABLE_STATE: pipe-ifc is potentially stale until a human disposition. HUMAN_DECISION_REQUIRED.",
      sinceFeed: `CONFIGURATION_STATE: feed baseline comparison revised ${comparison.revised.join(", ") || "none"}. The frozen feed snapshot was not rewritten. HUMAN_DECISION_REQUIRED.`,
    },
    unauthorized,
    counts: { interfaces: interfaces.interfaces.length, changes: changes.changes.length, deliverables: freeze.deliverables.length, dependencyEdges: changes.edges.length },
    leakCount: leakAttempts.filter((item) => item !== "cross_workspace_denied").length,
    formulasChanged: false, recalculated: changes.impacts.some((item) => item.recalculated),
    baselineRewriteBlocked: rewriteBaseline().error, impactDisposition: baselineDisposition(changes, "chg-temp"),
    limitations: [
      "No unsupported process, mechanical, piping, civil, geotechnical, electrical, or I&C calculation is executed.",
      "The structural fixture does not change qualified D1 formulas.",
      "AI cannot approve, accept, or release engineering.",
      "Fixtures are SYNTHETIC_VALIDATION_FIXTURE records, not calculation qualification.",
    ],
  };
}

export function integratedSummary(demo: IntegratedDemonstration) {
  return {
    projectId: demo.projectId, projectTitle: demo.projectTitle, facility: demo.facility, stage: demo.stage, stages: demo.stages,
    detailedFreezeBefore: demo.detailedFreezeBefore, detailedFreezeBlocker: demo.detailedFreezeBlocker, detailedFreezeAfter: demo.detailedFreezeAfter,
    ifcReleaseBlocked: demo.ifcReleaseBlocked, counts: demo.counts, leakCount: demo.leakCount, limitations: demo.limitations,
    advisory: demo.aiAnswers.detailedFreeze,
    approvalGranted: false as const, releasedByAi: false as const,
  };
}
