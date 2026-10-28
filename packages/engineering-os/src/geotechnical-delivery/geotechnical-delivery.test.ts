import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addBearing,
  addDewatering,
  addEarthworks,
  addExcavation,
  addFieldTest,
  addFoundation,
  addGeotechnicalBasis,
  addGroundwaterObservation,
  addGroundModel,
  addHandoff,
  addLabTest,
  addParameter,
  addPileAssessment,
  addPileParameter,
  addSettlement,
  addSlope,
  attachGeotechnical,
  createGeotechnicalDelivery,
  deliverableReadiness,
  freezeGeotechnical,
  geotechnicalAdvisory,
  geotechnicalHome,
  modifyCivilInput,
  modifyStructuralLoad,
  progressGeotechnicalStage,
  receiveCivilInput,
  receiveStructuralLoad,
  recordConflict,
  registerGeotechnicalTool,
  reviewGeotechnical,
  reviseDesignGroundwater,
  reviseGroundModel,
  reviseStructuralLoad,
  setDesignGroundwater,
  unimplementedGeotechnicalCalculations,
} from "./engine";
import type { GeotechnicalActor } from "./engine";

const actor: GeotechnicalActor = {
  actorId: "gov-1",
  actorRole: "lifecycle_governor",
  at: "2026-10-28T18:00:00Z",
  workspaceId: "workspace-a",
  canAuthorizeLifecycleTransition: true,
  canApprove: true,
};

function must<T extends { error: string | null; delivery: unknown }>(result: T): T {
  expect(result.error).toBeNull();
  return result;
}

const linked = ["gm-1", "gw-1", "load-1"];

describe("EOS 2.8 geotechnical design delivery", () => {
  it("moves a synthetic site through the lifecycle without calculating soil capacity", () => {
    let delivery = must(createGeotechnicalDelivery({
      id: "geo-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-geotechnical-demo",
      projectTitle: "EOS Geotechnical Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    })).delivery;
    expect(delivery.lifecycle.stage).toBe("not_classified");
    expect(delivery.audits[0]?.detail.legacyEnrolled).toBe(false);
    expect(delivery.audits[0]?.detail.siteMasterCreated).toBe(false);
    delivery = must(progressGeotechnicalStage(delivery, actor, "concept", "classify concept")).delivery;
    delivery = must(addGeotechnicalBasis(delivery, actor, { id: "db-1", title: "Investigation philosophy", statement: "Synthetic regional sand profile", status: "draft" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "options", { id: "opt-a", title: "Shallow foundations", concept: "shallow", stage: "concept", facts: ["GEO-001"], assumptions: ["Groundwater is uncertain"], unresolved: ["Bearing"] })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "options", { id: "opt-b", title: "Piled foundations", concept: "piled", stage: "concept", facts: ["GEO-001"], assumptions: ["No soil property invented"], unresolved: ["Pile length"] })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "assumptions", { id: "as-1", statement: "Design groundwater is not yet interpreted", stage: "concept", blocksNextStage: false })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "decisions", { id: "dec-1", statement: "Carry both foundation concepts", stage: "concept" })).delivery;
    delivery = must(progressGeotechnicalStage(delivery, actor, "feasibility", "concept gate")).delivery;

    delivery = must(attachGeotechnical(delivery, actor, "sites", { id: "site-1", name: "Synthetic Process Facility Geotechnical Site GEO-001", civilSiteRef: "CIV-001" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "investigations", { id: "inv-1", purpose: "feasibility", coordinateSystem: "MGA", verticalDatum: "AHD", revision: 1, status: "current" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "boreholes", { id: "bh-1", name: "BH-01", depth: "synthetic", unit: "m", provenance: "SYNTHETIC_VALIDATION_FIXTURE" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "cpts", { id: "cpt-1", name: "CPT-01", rawSeparated: true, provenance: "SYNTHETIC_VALIDATION_FIXTURE" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "testPits", { id: "tp-1", name: "TP-01", depth: "synthetic", unit: "m" })).delivery;
    delivery = must(addFieldTest(delivery, actor, { id: "ft-1", testType: "SPT", value: "synthetic", unit: "blows", provenance: "SYNTHETIC_VALIDATION_FIXTURE" })).delivery;
    delivery = must(addLabTest(delivery, actor, { id: "lab-1", testType: "moisture content", sampleId: "sample-1", value: "synthetic", unit: "percent", provenance: "SYNTHETIC_VALIDATION_FIXTURE" })).delivery;
    delivery = must(addGroundwaterObservation(delivery, actor, { id: "obs-1", level: "synthetic", unit: "mAHD", datum: "AHD", designLevel: false })).delivery;
    expect(delivery.groundwaterObservations[0]?.designLevel).toBe(false);
    for (const layer of [
      { id: "ly-1", name: "fill", kind: "fill" as const },
      { id: "ly-2", name: "loose to medium dense sand", kind: "sand" as const },
      { id: "ly-3", name: "dense sand", kind: "dense_sand" as const },
      { id: "ly-4", name: "weathered rock", kind: "weathered_rock" as const },
    ]) delivery = must(attachGeotechnical(delivery, actor, "layers", layer)).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "units", { id: "unit-1", name: "Sand unit", geologicalEquivalent: false })).delivery;
    expect(delivery.units[0]?.geologicalEquivalent).toBe(false);
    delivery = must(addGroundModel(delivery, actor, { id: "gm-1", revision: 1, boundary: "preliminary sand boundary", status: "current", evidenceIds: ["bh-1", "lab-1"], freshness: "current" })).delivery;
    delivery = must(addParameter(delivery, actor, { id: "par-range", name: "friction angle", value: "synthetic range", unit: "deg", classification: "INTERPRETED", evidenceId: "lab-1", justification: null, groundModelId: "gm-1", revision: 1, status: "current", inputIds: ["gm-1"], freshness: "current" })).delivery;
    delivery = must(addFoundation(delivery, actor, { id: "fd-opt", foundationType: "shallow or piled", parameterId: null, structuralCapacityClaimed: false, inputIds: ["gm-1"], freshness: "current" })).delivery;
    delivery = must(addSettlement(delivery, actor, { id: "set-screen", value: null, unit: null, provenance: "metadata", calculatedHere: false, inputIds: ["gm-1"], freshness: "current" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "risks", { id: "risk-1", statement: "Groundwater uncertainty", stage: "feasibility" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "interfaces", { id: "if-open", consumer: "civil", parameter: "subgrade", status: "proposed", inputIds: ["gm-1"], freshness: "current" })).delivery;
    delivery = must(progressGeotechnicalStage(delivery, actor, "feed", "feasibility gate")).delivery;

    delivery = must(addGeotechnicalBasis(delivery, actor, { id: "db-feed", title: "Controlled geotechnical basis", statement: "Synthetic FEED basis", status: "accepted_for_stage" })).delivery;
    expect(delivery.basis.basisItems.find((item) => item.id === "db-feed")?.approvalGranted).toBe(false);
    delivery = must(attachGeotechnical(delivery, actor, "requirements", { id: "req-1", title: "Allowable settlement", sourceId: "src-1", stage: "feed" })).delivery;
    delivery = must(setDesignGroundwater(delivery, actor, { id: "gw-1", level: "synthetic", unit: "mAHD", inferredFromSingleObservation: false, revision: 1, status: "current" })).delivery;
    delivery = must(addParameter(delivery, actor, { id: "par-1", name: "CBR", value: "synthetic", unit: "percent", classification: "DESIGN", evidenceId: "lab-1", justification: null, groundModelId: "gm-1", revision: 1, status: "current", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addFoundation(delivery, actor, { id: "fd-1", foundationType: "shallow pad", parameterId: "par-1", structuralCapacityClaimed: false, inputIds: linked, freshness: "current" })).delivery;
    expect(delivery.foundations.find((item) => item.id === "fd-1")?.structuralCapacityClaimed).toBe(false);
    delivery = must(addBearing(delivery, actor, { id: "br-1", value: "synthetic", unit: "kPa", provenance: "SYNTHETIC_VALIDATION_FIXTURE", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addSettlement(delivery, actor, { id: "set-1", value: "synthetic", unit: "mm", provenance: "SYNTHETIC_VALIDATION_FIXTURE", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    expect(delivery.settlement.find((item) => item.id === "set-1")?.calculatedHere).toBe(false);
    delivery = must(addPileParameter(delivery, actor, { id: "pile-p", name: "shaft resistance", value: null, unit: null, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addPileAssessment(delivery, actor, { id: "pile-a", kind: "axial compression", provenance: "metadata", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addSlope(delivery, actor, { id: "sl-1", factorOfSafety: null, calculatedHere: false, inputIds: ["gm-1", "gw-1"], freshness: "current" })).delivery;
    delivery = must(addExcavation(delivery, actor, { id: "ex-1", depth: "synthetic", unit: "m", certifiedStable: false, inputIds: ["gm-1", "gw-1"], freshness: "current" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "retaining", { id: "ret-1", parameter: "earth pressure input", structuralDesignClaimed: false })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "improvements", { id: "imp-1", technique: "remove/replace", suitable: false })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "liquefaction", { id: "liq-1", result: null, adequate: false, provenance: "metadata" })).delivery;
    delivery = must(addDewatering(delivery, actor, { id: "dw-1", targetLevel: null, unit: null, rateCalculated: false, inputIds: ["gw-1"], freshness: "current" })).delivery;
    delivery = must(addEarthworks(delivery, actor, { id: "ew-1", classification: "sand", reuse: "conditional", inputIds: ["gm-1"], freshness: "current" })).delivery;
    delivery = must(receiveCivilInput(delivery, actor, { id: "civ-1", parameter: "proposed grading", ownedBy: "civil", geotechModified: false, revision: 1, status: "current" })).delivery;
    expect(modifyCivilInput(delivery).error).toMatch(/cannot modify a Civil grading/);
    delivery = must(receiveStructuralLoad(delivery, actor, { id: "load-1", name: "vertical load", value: "synthetic", unit: "kN", ownedBy: "structural", geotechModified: false, revision: 1, status: "current" })).delivery;
    expect(modifyStructuralLoad(delivery).error).toMatch(/cannot modify a Structural load/);
    delivery = must(addHandoff(delivery, actor, { id: "ho-civ", consumer: "civil", parameter: "CBR", value: "synthetic", unit: "percent", inputIds: linked, freshness: "current", structuralCapacityClaimed: false })).delivery;
    delivery = must(addHandoff(delivery, actor, { id: "ho-str", consumer: "structural", parameter: "founding level", value: "synthetic", unit: "mAHD", inputIds: linked, freshness: "current", structuralCapacityClaimed: false })).delivery;
    expect(delivery.handoffs.every((item) => item.structuralCapacityClaimed === false)).toBe(true);
    delivery = must(recordConflict(delivery, actor, { id: "cf-1", subjectId: "gm-1", statement: "Coverage gap" })).delivery;
    expect(delivery.conflicts[0]?.civilModified).toBe(false);
    delivery = must(attachGeotechnical(delivery, actor, "interfaces", { id: "if-civ", consumer: "civil", parameter: "subgrade", status: "accepted", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "interfaces", { id: "if-str", consumer: "structural", parameter: "foundation recommendation", status: "accepted", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "deliverables", { id: "del-feed", title: "Geotechnical FEED basis", stage: "feed", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: linked, freshness: "current", ifc: false })).delivery;
    const frozen = must(freezeGeotechnical(delivery, actor, "feed_baseline", "base-feed"));
    delivery = frozen.delivery;
    const snapshot = delivery.baselines[0];
    delivery = must(progressGeotechnicalStage(delivery, actor, "detailed_engineering", "feed gate")).delivery;
    delivery = must(attachGeotechnical(delivery, actor, "deliverables", { id: "del-1", title: "Detailed geotechnical report", stage: "detailed_engineering", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: linked, freshness: "current", ifc: false })).delivery;
    expect(deliverableReadiness(delivery, "del-1").ifc).toBe(false);

    const revised = must(reviseGroundModel(delivery, actor, "gm-1", "revised sand boundary"));
    delivery = revised.delivery;
    expect(delivery.groundModels.find((item) => item.id === "gm-1")?.boundary).toBe("preliminary sand boundary");
    expect(delivery.parameters.find((item) => item.id === "par-1")?.freshness).toBe("potentially_stale");
    expect(delivery.bearing[0]?.freshness).toBe("potentially_stale");
    expect(delivery.settlement.find((item) => item.id === "set-1")?.freshness).toBe("potentially_stale");
    expect(delivery.pileAssessments[0]?.freshness).toBe("potentially_stale");
    expect(delivery.foundations.find((item) => item.id === "fd-1")?.freshness).toBe("potentially_stale");
    expect(delivery.handoffs.find((item) => item.id === "ho-civ")?.freshness).toBe("potentially_stale");
    expect(delivery.handoffs.find((item) => item.id === "ho-str")?.freshness).toBe("potentially_stale");
    const wetter = must(reviseDesignGroundwater(delivery, actor, "gw-1", "revised synthetic level"));
    delivery = wetter.delivery;
    expect(delivery.designGroundwater.find((item) => item.id === "gw-1")?.level).toBe("synthetic");
    const loaded = must(reviseStructuralLoad(delivery, actor, "load-1", "revised synthetic load"));
    delivery = loaded.delivery;
    expect(delivery.structuralLoads.find((item) => item.id === "load-1")?.value).toBe("synthetic");
    expect(delivery.structuralLoads.find((item) => item.id === "load-1")?.geotechModified).toBe(false);
    expect(delivery.deliverables.find((item) => item.id === "del-1")?.freshness).toBe("potentially_stale");
    expect(snapshot?.modelIds).toEqual(["gm-1"]);
    expect(snapshot?.groundwaterIds).toEqual(["gw-1"]);
    expect(revised.delivery.audits.some((item) => item.detail.recalculated === false)).toBe(true);
    expect(geotechnicalAdvisory(delivery)).toMatch(/does not invent soil properties/);
    expect(geotechnicalHome(delivery).staleCount).toBeGreaterThan(0);
  });

  it("refuses silent promotion, invented parameters, certified tools, and another workspace", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(source).not.toContain("recordGeotechnicalObjectIdentity");
    expect(unimplementedGeotechnicalCalculations().map((item) => item.id)).toEqual(expect.arrayContaining(["bearing_calculation", "settlement_calculation", "slope_factor_of_safety", "hosted_geotechnical_calculation"]));
    let delivery = createGeotechnicalDelivery({
      id: "geo-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-geotechnical-demo", projectTitle: "EOS Geotechnical Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    }).delivery;
    expect(addParameter(delivery, actor, { id: "p-x", name: "phi", value: "30", unit: "", classification: "MEASURED", evidenceId: "lab", justification: null, groundModelId: null, revision: 1, status: "current", inputIds: [], freshness: "current" }).error).toMatch(/unit/);
    expect(addParameter(delivery, actor, { id: "p-y", name: "phi", value: "30", unit: "deg", classification: "DESIGN", evidenceId: "lab", justification: null, groundModelId: null, revision: 1, status: "current", inputIds: [], freshness: "current", promotedFrom: "MEASURED" }).error).toMatch(/not promoted silently/);
    expect(addParameter(delivery, { ...actor, actorRole: "ai" }, { id: "p-ai", name: "phi", value: "30", unit: "deg", classification: "DESIGN", evidenceId: "lab", justification: null, groundModelId: null, revision: 1, status: "current", inputIds: [], freshness: "current" }).error).toMatch(/cannot approve a design parameter/);
    expect(addParameter(delivery, actor, { id: "p-a", name: "phi", value: "30", unit: "deg", classification: "ASSUMED", evidenceId: null, justification: null, groundModelId: null, revision: 1, status: "current", inputIds: [], freshness: "current" }).error).toMatch(/justification/);
    expect(addGroundwaterObservation(delivery, actor, { id: "obs-x", level: "1", unit: "mAHD", datum: "AHD", designLevel: false, makeDesign: true }).error).toMatch(/not a design groundwater/);
    expect(setDesignGroundwater(delivery, actor, { id: "gw-x", level: "1", unit: "mAHD", inferredFromSingleObservation: true, revision: 1, status: "current" }).error).toMatch(/not inferred/);
    expect(addBearing(delivery, actor, { id: "br-x", value: "1", unit: "kPa", provenance: "imported_reference", calculatedHere: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/not calculated/);
    expect(addSlope(delivery, actor, { id: "sl-x", factorOfSafety: "1.5", calculatedHere: false, inputIds: [], freshness: "current" }).error).toMatch(/not calculated/);
    expect(addExcavation(delivery, actor, { id: "ex-x", depth: "1", unit: "m", certifiedStable: false, inputIds: [], freshness: "current", certify: true }).error).toMatch(/not certified/);
    expect(addDewatering(delivery, actor, { id: "dw-x", targetLevel: "1", unit: "mAHD", rateCalculated: false, inputIds: [], freshness: "current", calculateRate: true }).error).toMatch(/not calculated/);
    expect(registerGeotechnicalTool(delivery, actor, { id: "tool-1", tool: "PLAXIS", certifyExecution: true }).error).toMatch(/not certified/);
    expect(registerGeotechnicalTool(delivery, actor, { id: "tool-2", tool: "GeoStudio", bidirectional: true }).error).toMatch(/not implemented/);
    expect(reviewGeotechnical(delivery, { ...actor, actorRole: "owner", canApprove: true }, { id: "rev-1", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(reviewGeotechnical(delivery, { ...actor, actorRole: "ai", canApprove: true }, { id: "rev-2", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(addLabTest(delivery, { ...actor, workspaceId: "workspace-b" }, { id: "lab-b", testType: "CBR", sampleId: "s", value: "1", unit: "percent", provenance: "measured" }).error).toBe("cross_workspace_denied");
    expect(progressGeotechnicalStage(delivery, actor, "detailed_engineering", "skip").error).toMatch(/next stage/i);
  });
});
