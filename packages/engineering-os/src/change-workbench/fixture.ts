import type { ThreadCatalogNode, ThreadGraphInput, ThreadRelation } from "../digital-thread/types";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import type { OptionAlternative } from "./types";

export const A11E_TENANT = CRUSHER_FEED_TENANT;
export const A11E_WORKSPACE = CRUSHER_FEED_WORKSPACE;
export const A11E_PROJECT_A = "proj-a11e-alpha";
export const A11E_PROJECT_B = "proj-a11e-beta";

function node(
  partial: Omit<ThreadCatalogNode, "tenantId" | "workspaceId"> & Partial<Pick<ThreadCatalogNode, "tenantId" | "workspaceId">>,
): ThreadCatalogNode {
  return {
    tenantId: A11E_TENANT,
    workspaceId: A11E_WORKSPACE,
    projectId: A11E_PROJECT_A,
    ...partial,
  };
}

function link(fromType: string, fromId: string, relationship: string, toType: string, toId: string): ThreadRelation {
  return { fromType, fromId, relationship, toType, toId, governed: true, createdBy: "engineer-a1", createdAt: "2026-10-01T00:00:00.000Z" };
}

export function loadChangeFixture(): ThreadGraphInput {
  const nodes: ThreadCatalogNode[] = [
    node({ objectType: "change", objectId: "chg-mech-load", objectCode: "ECN-LOAD-01", title: "Mechanical equipment load 1250 kN → 1380 kN", status: "proposed" }),
    node({ objectType: "engineering_information", objectId: "info-mech-load", objectCode: "ML-REV-D", title: "Mechanical Load Rev D 1380 kN", discipline: "MECHANICAL", revision: "D", status: "AUTHORITATIVE_FOR_PURPOSE" }),
    node({ objectType: "interface", objectId: "ifc-mech-struct", objectCode: "IFC-MS-01", title: "Mechanical / Structural interface", discipline: "STRUCTURAL", status: "open" }),
    node({ objectType: "analysis_result", objectId: "an-024", objectCode: "AN-024", title: "Structural Analysis AN-024", discipline: "STRUCTURAL", status: "ACCEPTED", stale: true, staleReasons: ["STALE_SOURCE_CHANGED"] }),
    node({ objectType: "calculation", objectId: "str-calc-021", objectCode: "STR-CALC-021", title: "Foundation calculation STR-CALC-021", discipline: "STRUCTURAL" }),
    node({ objectType: "drawing", objectId: "s-104", objectCode: "S-104", title: "Foundation drawing S-104", discipline: "STRUCTURAL" }),
    node({ objectType: "deliverable_expectation", objectId: "del-foundations", objectCode: "DEL-FND", title: "Foundation deliverable package", discipline: "STRUCTURAL" }),
    node({ objectType: "decision", objectId: "dec-foundation", objectCode: "EDN-FND", title: "Foundation concept decision", discipline: "STRUCTURAL" }),
    node({ objectType: "review_package", objectId: "rev-pre-load", objectCode: "RP-PRE-LOAD", title: "Pre-issue review before load change", status: "completed" }),
    node({ objectType: "engineering_work_plan", objectId: "wp-struct", objectCode: "WP-STR", title: "Structural calculation work plan", discipline: "STRUCTURAL" }),
    node({ objectType: "configuration_baseline", objectId: "bl-dd-01", objectCode: "DD-01", title: "Detailed design baseline", status: "frozen" }),
    node({ objectType: "requirement", objectId: "req-load", objectCode: "R-LOAD", title: "Equipment operating load requirement", discipline: "MECHANICAL" }),
    node({ objectType: "assumption", objectId: "asm-dyn", objectCode: "A-DYN", title: "Dynamic factor 1.3 remains valid", status: "accepted", discipline: "MECHANICAL" }),
    node({ objectType: "system", objectId: "sys-crush", objectCode: "SYS-CRUSH", title: "Primary crushing system" }),
    node({ objectType: "drawing", objectId: "s-notes", objectCode: "S-000", title: "General notes drawing (related, not load-bearing)", discipline: "STRUCTURAL" }),
    node({
      objectType: "drawing",
      objectId: "e-999-unrelated",
      objectCode: "E-999",
      title: "Unrelated electrical lighting drawing",
      discipline: "ELECTRICAL",
      projectId: A11E_PROJECT_B,
    }),
  ];
  const links: ThreadRelation[] = [
    link("change", "chg-mech-load", "AFFECTS", "engineering_information", "info-mech-load"),
    link("change", "chg-mech-load", "BASED_ON", "requirement", "req-load"),
    link("interface", "ifc-mech-struct", "DEPENDS_ON", "engineering_information", "info-mech-load"),
    link("analysis_result", "an-024", "DEPENDS_ON", "interface", "ifc-mech-struct"),
    link("analysis_result", "an-024", "BASED_ON", "assumption", "asm-dyn"),
    link("calculation", "str-calc-021", "DEPENDS_ON", "analysis_result", "an-024"),
    link("drawing", "s-104", "DEPENDS_ON", "calculation", "str-calc-021"),
    link("deliverable_expectation", "del-foundations", "DEPENDS_ON", "drawing", "s-104"),
    link("decision", "dec-foundation", "SUPPORTED_BY", "analysis_result", "an-024"),
    link("review_package", "rev-pre-load", "REVIEWS", "calculation", "str-calc-021"),
    link("engineering_work_plan", "wp-struct", "DEPENDS_ON", "engineering_information", "info-mech-load"),
    link("configuration_baseline", "bl-dd-01", "BASELINES", "drawing", "s-104"),
    link("system", "sys-crush", "CONTAINS", "interface", "ifc-mech-struct"),
    link("system", "sys-crush", "CONTAINS", "drawing", "s-notes"),
    link("requirement", "req-load", "ALLOCATED_TO", "interface", "ifc-mech-struct"),
    link("assumption", "asm-dyn", "USED_BY", "analysis_result", "an-024"),
  ];
  return { nodes, links };
}

export function requirementChangeFixture(): ThreadGraphInput {
  return {
    nodes: [
      node({ objectType: "requirement", objectId: "req-prod", objectCode: "R-PROD", title: "Production rate requirement change", discipline: "PROCESS" }),
      node({ objectType: "analysis_request", objectId: "ar-proc", objectCode: "AR-PROC", title: "Process analysis", discipline: "PROCESS" }),
      node({ objectType: "decision", objectId: "dec-duty", objectCode: "EDN-DUTY", title: "Duty selection" }),
      node({ objectType: "deliverable_expectation", objectId: "del-bod", objectCode: "DEL-BOD", title: "Basis of design deliverable" }),
      node({ objectType: "interface", objectId: "ifc-pm", objectCode: "IFC-PM", title: "Process / Mechanical interface" }),
      node({ objectType: "engineering_work_plan", objectId: "wp-proc", objectCode: "WP-PROC", title: "Process study work plan" }),
      node({ objectType: "review_package", objectId: "rev-req", objectCode: "RP-REQ", title: "Requirement review" }),
    ],
    links: [
      link("analysis_request", "ar-proc", "BASED_ON", "requirement", "req-prod"),
      link("decision", "dec-duty", "BASED_ON", "requirement", "req-prod"),
      link("deliverable_expectation", "del-bod", "DEPENDS_ON", "requirement", "req-prod"),
      link("requirement", "req-prod", "ALLOCATED_TO", "interface", "ifc-pm"),
      link("engineering_work_plan", "wp-proc", "DEPENDS_ON", "requirement", "req-prod"),
      link("review_package", "rev-req", "REVIEWS", "requirement", "req-prod"),
    ],
  };
}

export function assumptionInvalidationFixture(): ThreadGraphInput {
  return {
    nodes: [
      node({ objectType: "assumption", objectId: "asm-soil", objectCode: "A-SOIL", title: "Allowable bearing 250 kPa", status: "superseded", discipline: "CIVIL" }),
      node({ objectType: "analysis_result", objectId: "ar-found", objectCode: "AR-FND", title: "Foundation analysis", discipline: "CIVIL" }),
      node({ objectType: "calculation", objectId: "calc-found", objectCode: "CALC-FND", title: "Bearing calculation", discipline: "CIVIL" }),
      node({ objectType: "engineering_work_plan", objectId: "wp-found", objectCode: "WP-FND", title: "Foundation work plan" }),
    ],
    links: [
      link("assumption", "asm-soil", "USED_BY", "analysis_result", "ar-found"),
      link("calculation", "calc-found", "DEPENDS_ON", "analysis_result", "ar-found"),
      link("engineering_work_plan", "wp-found", "DEPENDS_ON", "assumption", "asm-soil"),
    ],
  };
}

export function feedVendorFixture(): ThreadGraphInput {
  return {
    nodes: [
      node({ objectType: "engineering_information", objectId: "info-vendor-fp", objectCode: "VEN-FP-D", title: "Vendor equipment footprint revision", discipline: "MECHANICAL", revision: "D" }),
      node({ objectType: "interface", objectId: "ifc-ms", objectCode: "IFC-MS", title: "Mech/Struct interface", discipline: "STRUCTURAL" }),
      node({ objectType: "analysis_result", objectId: "an-support", objectCode: "AN-SUP", title: "Support frame analysis", discipline: "STRUCTURAL" }),
      node({ objectType: "calculation", objectId: "calc-support", objectCode: "CALC-SUP", title: "Support calculation", discipline: "STRUCTURAL" }),
      node({ objectType: "drawing", objectId: "s-support", objectCode: "S-201", title: "Support drawing", discipline: "STRUCTURAL" }),
      node({ objectType: "drawing", objectId: "c-found", objectCode: "C-110", title: "Civil foundation drawing", discipline: "CIVIL" }),
      node({ objectType: "system", objectId: "sys-eq", objectCode: "SYS-EQ", title: "Equipment system" }),
      node({ objectType: "deliverable_expectation", objectId: "del-feed", objectCode: "DEL-FEED", title: "FEED equipment deliverable" }),
      node({ objectType: "engineering_work_plan", objectId: "wp-feed", objectCode: "WP-FEED", title: "FEED change work plan" }),
    ],
    links: [
      link("interface", "ifc-ms", "DEPENDS_ON", "engineering_information", "info-vendor-fp"),
      link("analysis_result", "an-support", "DEPENDS_ON", "interface", "ifc-ms"),
      link("calculation", "calc-support", "DEPENDS_ON", "analysis_result", "an-support"),
      link("drawing", "s-support", "DEPENDS_ON", "calculation", "calc-support"),
      link("drawing", "c-found", "DEPENDS_ON", "drawing", "s-support"),
      link("system", "sys-eq", "CONTAINS", "interface", "ifc-ms"),
      link("deliverable_expectation", "del-feed", "DEPENDS_ON", "drawing", "s-support"),
      link("engineering_work_plan", "wp-feed", "DEPENDS_ON", "engineering_information", "info-vendor-fp"),
    ],
  };
}

export function fieldChangeFixture(): ThreadGraphInput {
  return {
    nodes: [
      node({ objectType: "technical_query", objectId: "rfi-anchor-75", objectCode: "RFI-75", title: "Move anchor bolts 75 mm / clash with reinforcement", discipline: "STRUCTURAL" }),
      node({ objectType: "drawing", objectId: "s-anchor", objectCode: "S-104", title: "Foundation drawing current", discipline: "STRUCTURAL" }),
      node({ objectType: "drawing", objectId: "s-rebar", objectCode: "S-105", title: "Reinforcement drawing", discipline: "STRUCTURAL" }),
      node({ objectType: "drawing", objectId: "m-baseplate", objectCode: "M-040", title: "Base plate / equipment vendor drawing", discipline: "MECHANICAL" }),
      node({ objectType: "calculation", objectId: "calc-anchor", objectCode: "CALC-AB", title: "Anchor bolt calculation", discipline: "STRUCTURAL" }),
      node({ objectType: "analysis_result", objectId: "an-found", objectCode: "AN-FND", title: "Foundation analysis", discipline: "STRUCTURAL" }),
      node({ objectType: "configuration_baseline", objectId: "bl-con", objectCode: "CON-01", title: "Construction configuration", status: "frozen" }),
      node({ objectType: "system", objectId: "sys-found", objectCode: "SYS-FND", title: "Crusher foundation" }),
      node({ objectType: "engineering_information", objectId: "info-vendor-clear", objectCode: "VEN-CLR", title: "Vendor clearance", discipline: "MECHANICAL" }),
      node({ objectType: "change", objectId: "chg-field-ab", objectCode: "FCN-AB", title: "Proposed field change: move anchors 75 mm", status: "proposed" }),
    ],
    links: [
      link("technical_query", "rfi-anchor-75", "DEPENDS_ON", "drawing", "s-anchor"),
      link("drawing", "s-rebar", "DEPENDS_ON", "drawing", "s-anchor"),
      link("drawing", "m-baseplate", "DEPENDS_ON", "drawing", "s-anchor"),
      link("calculation", "calc-anchor", "DEPENDS_ON", "drawing", "s-anchor"),
      link("analysis_result", "an-found", "DEPENDS_ON", "calculation", "calc-anchor"),
      link("configuration_baseline", "bl-con", "BASELINES", "drawing", "s-anchor"),
      link("system", "sys-found", "CONTAINS", "drawing", "s-anchor"),
      link("change", "chg-field-ab", "AFFECTS", "technical_query", "rfi-anchor-75"),
      link("engineering_information", "info-vendor-clear", "DEPENDS_ON", "drawing", "m-baseplate"),
    ],
  };
}

export function clashFixture(): ThreadGraphInput {
  return {
    nodes: [
      node({ objectType: "technical_query", objectId: "rfi-pipe-beam", objectCode: "RFI-CLASH", title: "Pipe conflicts with structural beam", discipline: "PIPING" }),
      node({ objectType: "asset", objectId: "pipe-12", objectCode: "P-12", title: "Process pipe", discipline: "PIPING" }),
      node({ objectType: "asset", objectId: "beam-s8", objectCode: "S-BEAM-8", title: "Structural beam", discipline: "STRUCTURAL" }),
      node({ objectType: "drawing", objectId: "s-steel", objectCode: "S-301", title: "Steel drawing", discipline: "STRUCTURAL" }),
      node({ objectType: "interface", objectId: "ifc-pipe-struct", objectCode: "IFC-PS", title: "Piping / Structural interface" }),
    ],
    links: [
      link("technical_query", "rfi-pipe-beam", "DEPENDS_ON", "asset", "pipe-12"),
      link("technical_query", "rfi-pipe-beam", "DEPENDS_ON", "asset", "beam-s8"),
      link("interface", "ifc-pipe-struct", "CONNECTS", "asset", "pipe-12"),
      link("interface", "ifc-pipe-struct", "CONNECTS", "asset", "beam-s8"),
      link("drawing", "s-steel", "DEPENDS_ON", "asset", "beam-s8"),
    ],
  };
}

export function commissioningFixture(): ThreadGraphInput {
  return {
    nodes: [
      node({ objectType: "technical_query", objectId: "cq-op-dev", objectCode: "CQ-01", title: "Test result differs from expected operating condition", discipline: "COMMISSIONING" }),
      node({ objectType: "engineering_information", objectId: "info-op", objectCode: "OP-COND", title: "Expected operating condition", discipline: "MECHANICAL" }),
      node({ objectType: "configuration_baseline", objectId: "bl-comm", objectCode: "COMM-01", title: "Commissioning configuration", status: "frozen" }),
      node({ objectType: "decision", objectId: "dec-op", objectCode: "EDN-OP", title: "Operating envelope decision" }),
      node({ objectType: "engineering_handover_package", objectId: "ho-sys", objectCode: "HO-01", title: "Subsystem handover package", status: "ASSEMBLING" }),
    ],
    links: [
      link("technical_query", "cq-op-dev", "DEPENDS_ON", "engineering_information", "info-op"),
      link("configuration_baseline", "bl-comm", "BASELINES", "engineering_information", "info-op"),
      link("decision", "dec-op", "BASED_ON", "engineering_information", "info-op"),
      link("engineering_handover_package", "ho-sys", "DEPENDS_ON", "engineering_information", "info-op"),
    ],
  };
}

export function handoverStaleFixture(): ThreadGraphInput {
  return {
    nodes: [
      node({ objectType: "change", objectId: "chg-late", objectCode: "ECN-LATE", title: "Late approved engineering change after handover assembly", status: "approved" }),
      node({ objectType: "drawing", objectId: "s-final", objectCode: "S-104-1", title: "Final foundation drawing", revision: "1" }),
      node({ objectType: "engineering_handover_package", objectId: "ho-pkg", objectCode: "HO-PKG", title: "Handover package", status: "READY_FOR_REVIEW", stale: true }),
      node({ objectType: "configuration_baseline", objectId: "bl-ho", objectCode: "HO-BL", title: "Handover configuration" }),
      node({ objectType: "engineering_information", objectId: "info-om", objectCode: "OM-01", title: "O&M information" }),
    ],
    links: [
      link("change", "chg-late", "AFFECTS", "drawing", "s-final"),
      link("engineering_handover_package", "ho-pkg", "DEPENDS_ON", "drawing", "s-final"),
      link("engineering_handover_package", "ho-pkg", "DEPENDS_ON", "engineering_information", "info-om"),
      link("configuration_baseline", "bl-ho", "BASELINES", "drawing", "s-final"),
      link("change", "chg-late", "AFFECTS", "engineering_information", "info-om"),
    ],
  };
}

export function deepChainFixture(depth: number): ThreadGraphInput {
  const nodes: ThreadCatalogNode[] = [node({ objectType: "change", objectId: "chg-deep", title: "Deep chain source" })];
  const links: ThreadRelation[] = [];
  let prevType = "change";
  let prevId = "chg-deep";
  for (let i = 1; i <= depth; i += 1) {
    const id = `n-${i}`;
    nodes.push(node({ objectType: "document", objectId: id, objectCode: `D-${i}`, title: `Node ${i}` }));
    links.push(link(prevType, prevId, "DEPENDS_ON", "document", id));
    prevType = "document";
    prevId = id;
  }
  return { nodes, links };
}

export function steelConcreteOptions(): OptionAlternative[] {
  return [
    {
      id: "opt-a",
      code: "A",
      name: "Steel-framed support",
      description: "Steel-framed support",
      metrics: [
        { metric_key: "capex", value: 80, unit: "relative" },
        { metric_key: "opex", value: 40, unit: "relative" },
        { metric_key: "schedule", value: 8, unit: "months" },
        { metric_key: "constructability", value: 7, unit: "score" },
        { metric_key: "maintainability", value: 8, unit: "score" },
        { metric_key: "technical_complexity", value: 5, unit: "score" },
        { metric_key: "weight", value: 120, unit: "t" },
        { metric_key: "footprint", value: 90, unit: "m2" },
      ],
      assumptions: ["Shop fabrication available"],
      evidence: ["Synthetic FEED mass"],
      unknowns: ["Coatings durability"],
      constructability: "Prefabrication favourable",
      operability: "Access for inspection",
      costInputAvailable: true,
      scheduleInputAvailable: true,
    },
    {
      id: "opt-b",
      code: "B",
      name: "Concrete substructure + steel superstructure",
      description: "Concrete substructure + steel superstructure",
      metrics: [
        { metric_key: "capex", value: 95, unit: "relative" },
        { metric_key: "opex", value: 30, unit: "relative" },
        { metric_key: "schedule", value: 11, unit: "months" },
        { metric_key: "constructability", value: 5, unit: "score" },
        { metric_key: "maintainability", value: 7, unit: "score" },
        { metric_key: "technical_complexity", value: 6, unit: "score" },
        { metric_key: "weight", value: 280, unit: "t" },
        { metric_key: "footprint", value: 110, unit: "m2" },
      ],
      assumptions: ["Local concrete supply"],
      evidence: ["Synthetic civil quantities"],
      unknowns: ["Geotech confirmation"],
      constructability: "Longer in-situ works",
      operability: "Robust",
      costInputAvailable: true,
      scheduleInputAvailable: true,
    },
    {
      id: "opt-c",
      code: "C",
      name: "Modular arrangement",
      description: "Modular arrangement",
      metrics: [
        { metric_key: "capex", value: 110, unit: "relative" },
        { metric_key: "opex", value: 35, unit: "relative" },
        { metric_key: "schedule", value: 6, unit: "months" },
        { metric_key: "constructability", value: 8, unit: "score" },
        { metric_key: "maintainability", value: 6, unit: "score" },
        { metric_key: "technical_complexity", value: 8, unit: "score" },
        { metric_key: "weight", value: 150, unit: "t" },
        { metric_key: "footprint", value: 70, unit: "m2" },
      ],
      assumptions: ["Heavy-lift available"],
      evidence: ["Synthetic module study"],
      unknowns: ["Transport envelope"],
      constructability: "Site duration reduced",
      operability: "Module joints",
      costInputAvailable: true,
      scheduleInputAvailable: true,
    },
  ];
}

export function authorizedGraphContext(graph: ThreadGraphInput) {
  return {
    tenantId: A11E_TENANT,
    allowedWorkspaceIds: [A11E_WORKSPACE] as const,
    role: "member" as const,
    nodeAccess: new Map(
      graph.nodes
        .filter((n) => n.tenantId === A11E_TENANT && n.workspaceId === A11E_WORKSPACE)
        .map((n) => [`${n.objectType}:${n.objectId}`, { tenantId: n.tenantId, workspaceId: n.workspaceId }]),
    ),
  };
}
