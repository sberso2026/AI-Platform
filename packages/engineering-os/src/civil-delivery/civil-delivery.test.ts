import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addCivilBasis,
  addCulvert,
  addDrainage,
  addEarthworks,
  addFlood,
  addGrading,
  addPavement,
  addQuantity,
  addRoad,
  addSurface,
  addTrench,
  attachCivil,
  createCivilDelivery,
  deliverableReadiness,
  freezeCivil,
  civilAdvisory,
  civilHome,
  modifyGeotech,
  modifyPipingRoute,
  progressCivilStage,
  receiveGeotech,
  receivePipingRoute,
  receiveStructural,
  recordConflict,
  registerCivilTool,
  registerSurvey,
  reviewCivil,
  revisePipingRoute,
  reviseSurvey,
  unimplementedCivilCalculations,
} from "./engine";
import type { CivilActor } from "./engine";

const actor: CivilActor = {
  actorId: "gov-1",
  actorRole: "lifecycle_governor",
  at: "2026-10-28T17:00:00Z",
  workspaceId: "workspace-a",
  canAuthorizeLifecycleTransition: true,
  canApprove: true,
};

function must<T extends { error: string | null; delivery: unknown }>(result: T): T {
  expect(result.error).toBeNull();
  return result;
}

describe("EOS 2.7 civil design delivery", () => {
  it("moves a synthetic site through the lifecycle without calculating civil quantities", () => {
    let delivery = must(createCivilDelivery({
      id: "civ-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-civil-demo",
      projectTitle: "EOS Civil Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    })).delivery;
    expect(delivery.lifecycle.stage).toBe("not_classified");
    expect(delivery.audits[0]?.detail.legacyEnrolled).toBe(false);
    expect(delivery.audits[0]?.detail.areaMasterCreated).toBe(false);
    delivery = must(progressCivilStage(delivery, actor, "concept", "classify concept")).delivery;
    delivery = must(addCivilBasis(delivery, actor, { id: "db-1", title: "Grading philosophy", statement: "Synthetic elevated process area", status: "draft" })).delivery;
    delivery = must(attachCivil(delivery, actor, "options", { id: "opt-a", title: "Balanced earthworks with elevated process area", concept: "balanced_earthworks", stage: "concept", facts: ["CIV-001"], assumptions: ["Survey is preliminary"], unresolved: ["Cut volume"] })).delivery;
    delivery = must(attachCivil(delivery, actor, "options", { id: "opt-b", title: "Reduced fill with increased drainage complexity", concept: "reduced_fill", stage: "concept", facts: ["CIV-001"], assumptions: ["No quantity claim"], unresolved: ["Discharge"] })).delivery;
    delivery = must(attachCivil(delivery, actor, "assumptions", { id: "as-1", statement: "Earthworks volume is unknown", stage: "concept", blocksNextStage: false })).delivery;
    delivery = must(attachCivil(delivery, actor, "decisions", { id: "dec-1", statement: "Prefer balanced earthworks", stage: "concept" })).delivery;
    delivery = must(progressCivilStage(delivery, actor, "feasibility", "concept gate")).delivery;

    delivery = must(attachCivil(delivery, actor, "sites", { id: "site-1", name: "Synthetic Process Facility Site CIV-001", areaRef: null })).delivery;
    delivery = must(attachCivil(delivery, actor, "areas", { id: "area-1", siteId: "site-1", name: "Process pad", kind: "zone", areaRef: null })).delivery;
    delivery = must(registerSurvey(delivery, actor, { id: "sv-1", surveyType: "topographic", horizontalDatum: "MGA", verticalDatum: "AHD", coordinateSystem: "MGA", revision: 1, status: "current", checksum: "aaa", transformationId: null })).delivery;
    delivery = must(addSurface(delivery, actor, { id: "surf-1", kind: "existing", surveyId: "sv-1", datum: "AHD", provenance: "SYNTHETIC_VALIDATION_FIXTURE", revision: 1, inputIds: ["sv-1"], freshness: "current", calculatedHere: false })).delivery;
    delivery = must(addGrading(delivery, actor, { id: "gr-1", zone: "process pad", sourceSurfaceId: "surf-1", designSurfaceId: null, inputIds: ["sv-1"], freshness: "current", calculatedHere: false })).delivery;
    delivery = must(addEarthworks(delivery, actor, { id: "ew-1", cut: "synthetic", cutUnit: "m3", fill: "synthetic", fillUnit: "m3", bulkingFactor: null, provenance: "SYNTHETIC_VALIDATION_FIXTURE", inputIds: ["sv-1"], freshness: "current", calculatedHere: false })).delivery;
    delivery = must(attachCivil(delivery, actor, "catchments", { id: "cat-1", name: "Synthetic pad catchment", inputIds: ["sv-1"], freshness: "current" })).delivery;
    delivery = must(addDrainage(delivery, actor, { id: "dr-1", kind: "network", flow: null, unit: null, provenance: "metadata", inputIds: ["sv-1"], freshness: "current", calculatedHere: false })).delivery;
    delivery = must(attachCivil(delivery, actor, "cases", { id: "case-1", name: "minor system" })).delivery;
    delivery = must(addDrainage(delivery, actor, { id: "ch-1", kind: "channel", flow: null, unit: null, provenance: "metadata", inputIds: ["sv-1"], freshness: "current", calculatedHere: false })).delivery;
    delivery = must(addRoad(delivery, actor, { id: "rd-1", roadClass: "access", width: "synthetic", unit: "m", inputIds: ["sv-1"], freshness: "current" })).delivery;
    delivery = must(addPavement(delivery, actor, { id: "pv-1", thickness: null, unit: null, geotechInputId: null, designedHere: false, inputIds: ["sv-1"], freshness: "current" })).delivery;
    delivery = must(attachCivil(delivery, actor, "hardstands", { id: "hs-1", use: "laydown", temporary: true })).delivery;
    delivery = must(addCulvert(delivery, actor, { id: "cu-1", location: "access crossing", size: null, unit: null, sizedHere: false, inputIds: ["sv-1"], freshness: "current" })).delivery;
    delivery = must(addTrench(delivery, actor, { id: "tr-1", purpose: "underground services", stabilityCalculated: false, inputIds: ["sv-1", "route-1"], freshness: "current" })).delivery;
    delivery = must(attachCivil(delivery, actor, "corridors", { id: "co-1", name: "Synthetic underground corridor", inputIds: ["route-1"], freshness: "current" })).delivery;
    delivery = must(attachCivil(delivery, actor, "crossings", { id: "cr-1", kind: "road over pipe", inputIds: ["route-1"], freshness: "current" })).delivery;
    delivery = must(addQuantity(delivery, actor, { id: "qty-1", category: "cut", value: "synthetic", unit: "m3", provenance: "SYNTHETIC_VALIDATION_FIXTURE", maturity: "feasibility", procurementAccurate: false, inputIds: ["sv-1"], freshness: "current" })).delivery;
    expect(delivery.quantities[0]?.procurementAccurate).toBe(false);
    delivery = must(attachCivil(delivery, actor, "risks", { id: "risk-1", statement: "Synthetic drainage uncertainty", stage: "feasibility" })).delivery;
    delivery = must(attachCivil(delivery, actor, "interfaces", { id: "if-geo", consumer: "geotechnical", parameter: "subgrade", status: "proposed", inputIds: ["route-1"], freshness: "current" })).delivery;
    delivery = must(progressCivilStage(delivery, actor, "feed", "feasibility gate")).delivery;

    delivery = must(addCivilBasis(delivery, actor, { id: "db-feed", title: "Controlled civil basis", statement: "Synthetic FEED basis", status: "accepted_for_stage" })).delivery;
    expect(delivery.basis.basisItems.find((item) => item.id === "db-feed")?.approvalGranted).toBe(false);
    delivery = must(attachCivil(delivery, actor, "requirements", { id: "req-1", title: "Drainage performance", sourceId: "src-1", stage: "feed" })).delivery;
    delivery = must(receiveGeotech(delivery, actor, { id: "geo-1", parameter: "CBR", value: "synthetic", unit: "percent", source: "controlled-record", ownedBy: "geotechnical", civilModified: false, revision: 1, status: "current" })).delivery;
    expect(modifyGeotech(delivery).error).toMatch(/cannot modify a Geotechnical parameter/);
    delivery = must(receivePipingRoute(delivery, actor, { id: "route-1", routeRef: "PIP-001 underground", ownedBy: "piping", civilModified: false, revision: 1, status: "current" })).delivery;
    expect(modifyPipingRoute(delivery).error).toMatch(/cannot modify a Piping route/);
    delivery = must(receiveStructural(delivery, actor, { id: "st-1", parameter: "foundation extent", ownedBy: "structural", civilModified: false, structuralCapacityClaimed: false })).delivery;
    expect(delivery.structuralInputs[0]?.structuralCapacityClaimed).toBe(false);
    delivery = must(addFlood(delivery, actor, { id: "fl-1", source: "synthetic flood study", level: "synthetic", unit: "mAHD", modeledHere: false })).delivery;
    expect(delivery.flood[0]?.modeledHere).toBe(false);
    delivery = must(attachCivil(delivery, actor, "erosion", { id: "er-1", basis: "synthetic erosion philosophy" })).delivery;
    delivery = must(attachCivil(delivery, actor, "retaining", { id: "ret-1", statement: "Civil interface only", structuralCapacityClaimed: false })).delivery;
    delivery = must(recordConflict(delivery, actor, { id: "cf-1", subjectId: "route-1", statement: "Corridor clearance gap" })).delivery;
    expect(delivery.conflicts[0]?.pipingModified).toBe(false);
    delivery = must(attachCivil(delivery, actor, "interfaces", { id: "if-str", consumer: "structural", parameter: "foundation extent", status: "accepted", inputIds: ["route-1"], freshness: "current" })).delivery;
    delivery = must(attachCivil(delivery, actor, "interfaces", { id: "if-pipe", consumer: "piping", parameter: "underground route", status: "accepted", inputIds: ["route-1"], freshness: "current" })).delivery;
    delivery = must(attachCivil(delivery, actor, "interfaces", { id: "if-el", consumer: "electrical", parameter: "duct bank", status: "accepted", inputIds: [], freshness: "current" })).delivery;
    delivery = must(attachCivil(delivery, actor, "interfaces", { id: "if-ic", consumer: "instrumentation_and_control", parameter: "communication trench", status: "accepted", inputIds: [], freshness: "current" })).delivery;
    delivery = must(attachCivil(delivery, actor, "deliverables", { id: "del-feed", title: "Civil FEED basis", stage: "feed", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: ["sv-1", "route-1"], freshness: "current", ifc: false })).delivery;
    const frozen = must(freezeCivil(delivery, actor, "feed_baseline", "base-feed"));
    delivery = frozen.delivery;
    const snapshot = delivery.baselines[0];
    delivery = must(progressCivilStage(delivery, actor, "detailed_engineering", "feed gate")).delivery;

    delivery = must(addSurface(delivery, actor, { id: "surf-2", kind: "design", surveyId: "sv-1", datum: "AHD", provenance: "SYNTHETIC_VALIDATION_FIXTURE", revision: 1, inputIds: ["sv-1"], freshness: "current", calculatedHere: false })).delivery;
    delivery = must(addDrainage(delivery, actor, { id: "dr-2", kind: "network", flow: "synthetic", unit: "m3/s", provenance: "SYNTHETIC_VALIDATION_FIXTURE", inputIds: ["sv-1"], freshness: "current", calculatedHere: false })).delivery;
    expect(delivery.drainage.find((item) => item.id === "dr-2")?.calculatedHere).toBe(false);
    delivery = must(attachCivil(delivery, actor, "deliverables", { id: "del-1", title: "Detailed grading", stage: "detailed_engineering", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: ["sv-1", "route-1"], freshness: "current", ifc: false })).delivery;
    expect(deliverableReadiness(delivery, "del-1").ifc).toBe(false);

    const revised = must(reviseSurvey(delivery, actor, "sv-1", "bbb"));
    delivery = revised.delivery;
    expect(delivery.surveys.find((item) => item.id === "sv-1")?.checksum).toBe("aaa");
    expect(delivery.grading[0]?.freshness).toBe("potentially_stale");
    expect(delivery.earthworks[0]?.freshness).toBe("potentially_stale");
    expect(delivery.drainage[0]?.freshness).toBe("potentially_stale");
    expect(delivery.roads[0]?.freshness).toBe("potentially_stale");
    expect(delivery.culverts[0]?.freshness).toBe("potentially_stale");
    expect(delivery.quantities[0]?.freshness).toBe("potentially_stale");
    const moved = must(revisePipingRoute(delivery, actor, "route-1", "revised synthetic route"));
    delivery = moved.delivery;
    expect(delivery.pipingRoutes.find((item) => item.id === "route-1")?.routeRef).toBe("PIP-001 underground");
    expect(delivery.pipingRoutes.find((item) => item.id === "route-1")?.civilModified).toBe(false);
    expect(delivery.corridors[0]?.freshness).toBe("potentially_stale");
    expect(delivery.crossings[0]?.freshness).toBe("potentially_stale");
    expect(delivery.trenches[0]?.freshness).toBe("potentially_stale");
    expect(delivery.deliverables.find((item) => item.id === "del-1")?.freshness).toBe("potentially_stale");
    expect(snapshot?.surveyIds).toEqual(["sv-1"]);
    expect(snapshot?.routeIds).toEqual(["route-1"]);
    expect(revised.delivery.audits.some((item) => item.detail.recalculated === false)).toBe(true);
    expect(civilAdvisory(delivery)).toMatch(/does not invent survey or geotechnical data/);
    expect(civilHome(delivery).staleCount).toBeGreaterThan(0);
  });

  it("refuses mixed datums, invented parameters, certified tools, and another workspace", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(source).not.toContain("recordCivilObjectIdentity");
    expect(unimplementedCivilCalculations().map((item) => item.id)).toEqual(expect.arrayContaining(["cut_fill_calculation", "drainage_flow_calculation", "pavement_thickness_design", "hosted_civil_calculation"]));
    let delivery = createCivilDelivery({
      id: "civ-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-civil-demo", projectTitle: "EOS Civil Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    }).delivery;
    delivery = must(registerSurvey(delivery, actor, { id: "sv-1", surveyType: "topographic", horizontalDatum: "MGA", verticalDatum: "AHD", coordinateSystem: "MGA", revision: 1, status: "current", checksum: "aaa", transformationId: null })).delivery;
    expect(registerSurvey(delivery, actor, { id: "sv-2", surveyType: "topographic", horizontalDatum: "MGA", verticalDatum: "OTHER", coordinateSystem: "MGA", revision: 1, status: "current", checksum: "ccc", transformationId: null }).error).toMatch(/datum mismatch/);
    expect(addSurface(delivery, actor, { id: "surf-x", kind: "design", surveyId: "sv-1", datum: "OTHER", provenance: "imported_reference", revision: 1, inputIds: [], freshness: "current", calculatedHere: false }).error).toMatch(/datum/);
    expect(addQuantity(delivery, actor, { id: "qty-x", category: "cut", value: "10", unit: "", provenance: "imported_reference", maturity: "feasibility", procurementAccurate: false, inputIds: [], freshness: "current" }).error).toMatch(/unit/);
    expect(addDrainage(delivery, actor, { id: "dr-x", kind: "network", flow: "1", unit: "m3/s", provenance: "imported_reference", inputIds: [], freshness: "current", calculatedHere: false, calculate: true }).error).toMatch(/not calculated/);
    expect(addEarthworks(delivery, actor, { id: "ew-x", cut: "1", cutUnit: "m3", fill: null, fillUnit: null, bulkingFactor: null, provenance: "imported_reference", inputIds: [], freshness: "current", calculatedHere: false, calculate: true }).error).toMatch(/not calculated/);
    expect(addPavement(delivery, actor, { id: "pv-x", thickness: "1", unit: "mm", geotechInputId: null, designedHere: false, inputIds: [], freshness: "current", designHere: true }).error).toMatch(/not designed/);
    expect(receiveGeotech(delivery, actor, { id: "geo-x", parameter: "CBR", value: "5", unit: "percent", source: null, ownedBy: "geotechnical", civilModified: false, revision: 1, status: "current" }).error).toMatch(/cannot invent/);
    expect(registerCivilTool(delivery, actor, { id: "tool-1", tool: "Civil 3D", certifyExecution: true }).error).toMatch(/not certified/);
    expect(registerCivilTool(delivery, actor, { id: "tool-2", tool: "12d Model", bidirectional: true }).error).toMatch(/not implemented/);
    expect(reviewCivil(delivery, { ...actor, actorRole: "owner", canApprove: true }, { id: "rev-1", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(reviewCivil(delivery, { ...actor, actorRole: "ai", canApprove: true }, { id: "rev-2", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(registerSurvey(delivery, { ...actor, workspaceId: "workspace-b" }, { id: "sv-b", surveyType: "topographic", horizontalDatum: "MGA", verticalDatum: "AHD", coordinateSystem: "MGA", revision: 1, status: "current", checksum: "zzz", transformationId: null }).error).toBe("cross_workspace_denied");
    expect(progressCivilStage(delivery, actor, "detailed_engineering", "skip").error).toMatch(/next stage/i);
  });
});
