/**
 * Synthetic Crusher Expansion FEED fixture for EOS-A8A.
 * No production data. No real solver results.
 */

import type { ThreadCatalogNode, ThreadGraphInput, ThreadRelation } from "./types";

export const CRUSHER_FEED_TENANT = "tenant-crusher-feed";
export const CRUSHER_FEED_WORKSPACE = "workspace-crusher-a1";
export const CRUSHER_FEED_OTHER_WORKSPACE = "workspace-crusher-a2";
export const CRUSHER_FEED_OTHER_TENANT = "tenant-other";

const base = {
  tenantId: CRUSHER_FEED_TENANT,
  workspaceId: CRUSHER_FEED_WORKSPACE,
  projectId: "proj-crusher-feed",
};

function node(
  partial: Omit<ThreadCatalogNode, "tenantId" | "workspaceId"> &
    Partial<Pick<ThreadCatalogNode, "tenantId" | "workspaceId" | "projectId">>,
): ThreadCatalogNode {
  return { ...base, ...partial };
}

function link(
  fromType: string,
  fromId: string,
  relationship: string,
  toType: string,
  toId: string,
): ThreadRelation {
  return {
    fromType,
    fromId,
    relationship,
    toType,
    toId,
    governed: true,
    createdBy: "engineer-a1",
    createdAt: "2026-09-01T00:00:00.000Z",
  };
}

export function crusherExpansionFeedFixture(): ThreadGraphInput {
  const nodes: ThreadCatalogNode[] = [
    node({
      objectType: "requirement",
      objectId: "req-r001",
      objectCode: "R-001",
      title: "Support primary crusher operating loads",
      status: "active",
    }),
    node({
      objectType: "requirement",
      objectId: "req-process",
      objectCode: "R-PROC-01",
      title: "Process duty for primary crushing",
      status: "active",
    }),
    node({
      objectType: "requirement",
      objectId: "req-mech-info",
      objectCode: "R-MECH-INFO-01",
      title: "Mechanical information requirement for structural interface",
      status: "active",
    }),
    node({
      objectType: "system",
      objectId: "sys-primary-crushing",
      objectCode: "SYS-CRUSH-01",
      title: "Primary Crushing System",
      status: "active",
    }),
    node({
      objectType: "system",
      objectId: "sys-process",
      objectCode: "SYS-PROC-01",
      title: "Process System",
      status: "active",
    }),
    node({
      objectType: "interface",
      objectId: "ifc-mech-struct",
      objectCode: "IFC-MS-01",
      title: "Mechanical / Structural Interface",
      status: "active",
    }),
    node({
      objectType: "interface",
      objectId: "ifc-process-mech",
      objectCode: "IFC-PM-01",
      title: "Process / Mechanical Interface",
      status: "active",
    }),
    node({
      objectType: "assumption",
      objectId: "asm-a12",
      objectCode: "A-12",
      title: "Vendor operating mass includes dynamic factor 1.3",
      status: "accepted",
    }),
    node({
      objectType: "analysis_request",
      objectId: "ar-process",
      objectCode: "AR-PROC-01",
      title: "Process simulation of crusher duty",
      discipline: "PROCESS",
      capability: "PROCESS_SIMULATION",
      status: "succeeded",
    }),
    node({
      objectType: "analysis_result",
      objectId: "res-process",
      objectCode: "AR-PROC-01-R",
      title: "Process duty result",
      status: "ACCEPTED",
      provenance: { sourceAnalysisId: "ar-process", createdAt: "2026-09-02T00:00:00.000Z", createdBy: "engineer-a1" },
    }),
    node({
      objectType: "analysis_request",
      objectId: "ar-mechanical",
      objectCode: "AR-MECH-01",
      title: "Mechanical load development",
      discipline: "MECHANICAL",
      capability: "FEA",
      status: "succeeded",
    }),
    node({
      objectType: "analysis_result",
      objectId: "res-mechanical",
      objectCode: "AR-MECH-01-R",
      title: "Operating weight and dynamic load",
      status: "ACCEPTED",
      provenance: { sourceAnalysisId: "ar-mechanical", createdAt: "2026-09-03T00:00:00.000Z", createdBy: "engineer-a1" },
    }),
    node({
      objectType: "analysis_request",
      objectId: "ar-structural-blocked",
      objectCode: "AR-STR-01",
      title: "Linear structural analysis of support frame",
      discipline: "STRUCTURAL",
      capability: "LINEAR_STRUCTURAL_ANALYSIS",
      status: "blocked",
      toolCode: "SPACEGASS",
      toolVersion: "14.2 Trial 14.25.3785",
      adapterVersion: null,
      blockingReasons: [
        "BLOCKED_TOOL_UNAVAILABLE",
        "BLOCKED_AUTOMATION_NOT_PERMITTED",
        "BLOCKED_CAPABILITY_NOT_CERTIFIED",
      ],
    }),
    node({
      objectType: "analysis_request",
      objectId: "ar-synthetic-struct",
      objectCode: "AR-STR-SYN-01",
      title: "Synthetic structural support-frame analysis (TEST/DEV)",
      discipline: "STRUCTURAL",
      capability: "CERTIFICATION_ANALYSIS",
      status: "succeeded",
      toolCode: "SYNTHETIC_CERTIFICATION",
    }),
    node({
      objectType: "analysis_result",
      objectId: "res-synthetic-struct",
      objectCode: "AR-102",
      title: "Synthetic support-frame result",
      status: "ACCEPTED",
      reviewRequired: true,
      stale: true,
      staleReasons: ["STALE_REQUIREMENT_CHANGED"],
      provenance: {
        sourceAnalysisId: "ar-synthetic-struct",
        createdAt: "2026-09-04T00:00:00.000Z",
        createdBy: "engineer-a1",
        sourceExternalTool: "SYNTHETIC_CERTIFICATION",
        inputFingerprint: "synth-fp-1",
      },
    }),
    node({
      objectType: "review_package",
      objectId: "rev-feed-01",
      objectCode: "RP-FEED-01",
      title: "Engineering Review Package FEED-01",
      status: "completed",
    }),
    node({
      objectType: "decision",
      objectId: "dec-support-frame",
      objectCode: "EDN-014",
      title: "Select support-frame concept",
      question: "Which support-frame concept shall be adopted for FEED?",
      alternatives: ["portal frame", "truss frame"],
      status: "approved",
    }),
    node({
      objectType: "decision",
      objectId: "dec-superseded",
      objectCode: "EDN-010",
      title: "Prior support-frame concept",
      status: "superseded",
      superseded: true,
    }),
    node({
      objectType: "change",
      objectId: "chg-vendor-mass",
      objectCode: "ECN-CR-01",
      title: "Crusher vendor operating mass increases",
      status: "open",
    }),
    node({
      objectType: "configuration_baseline",
      objectId: "bl-feed-01",
      objectCode: "FEED-01",
      title: "FEED-01",
      status: "superseded",
      superseded: true,
    }),
    node({
      objectType: "configuration_baseline",
      objectId: "bl-feed-02",
      objectCode: "FEED-02",
      title: "FEED-02",
      status: "frozen",
      snapshotItems: [
        { id: "ci-sys", objectType: "system", objectId: "sys-primary-crushing", objectCode: "SYS-CRUSH-01" },
        { id: "ci-req", objectType: "requirement", objectId: "req-r001", objectCode: "R-001" },
      ],
    }),
    node({
      objectType: "configuration_item",
      objectId: "ci-sys",
      objectCode: "CI-SYS-CRUSH-01",
      title: "Frozen Primary Crushing System pointer",
      provenance: { createdAt: "2026-09-05T00:00:00.000Z", createdBy: "engineer-a1" },
    }),
    node({
      objectType: "document",
      objectId: "doc-bod",
      objectCode: "BOD-CR-01",
      title: "Basis of Design — Crusher Expansion FEED",
    }),
    node({
      ...base,
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_OTHER_WORKSPACE,
      objectType: "requirement",
      objectId: "req-hidden-ws",
      objectCode: "R-HIDDEN",
      title: "Unauthorized workspace requirement",
    }),
    node({
      tenantId: CRUSHER_FEED_OTHER_TENANT,
      workspaceId: "ws-other-tenant",
      objectType: "system",
      objectId: "sys-other-tenant",
      objectCode: "SYS-OTHER",
      title: "Other tenant system",
    }),
  ];

  const links: ThreadRelation[] = [
    link("requirement", "req-r001", "ALLOCATED_TO", "system", "sys-primary-crushing"),
    link("requirement", "req-process", "ALLOCATED_TO", "system", "sys-process"),
    link("requirement", "req-mech-info", "ALLOCATED_TO", "interface", "ifc-mech-struct"),
    link("requirement", "req-r001", "ALLOCATED_TO", "interface", "ifc-mech-struct"),
    link("system", "sys-process", "CONTAINS", "system", "sys-primary-crushing"),
    link("interface", "ifc-process-mech", "CONNECTS", "system", "sys-process"),
    link("interface", "ifc-process-mech", "CONNECTS", "system", "sys-primary-crushing"),
    link("interface", "ifc-mech-struct", "CONNECTS", "system", "sys-primary-crushing"),
    link("analysis_request", "ar-process", "SCOPED_TO", "system", "sys-process"),
    link("analysis_request", "ar-process", "BASED_ON", "requirement", "req-process"),
    link("analysis_request", "ar-mechanical", "SCOPED_TO", "system", "sys-primary-crushing"),
    link("analysis_request", "ar-mechanical", "BASED_ON", "requirement", "req-mech-info"),
    link("analysis_request", "ar-mechanical", "DEPENDS_ON", "analysis_result", "res-process"),
    link("analysis_request", "ar-structural-blocked", "SCOPED_TO", "system", "sys-primary-crushing"),
    link("analysis_request", "ar-structural-blocked", "BASED_ON", "requirement", "req-r001"),
    link("analysis_request", "ar-structural-blocked", "BASED_ON", "assumption", "asm-a12"),
    link("analysis_request", "ar-structural-blocked", "DEPENDS_ON", "analysis_result", "res-mechanical"),
    link("analysis_request", "ar-structural-blocked", "USES", "analysis_result", "res-mechanical"),
    link("analysis_request", "ar-synthetic-struct", "SCOPED_TO", "system", "sys-primary-crushing"),
    link("analysis_request", "ar-synthetic-struct", "BASED_ON", "requirement", "req-r001"),
    link("analysis_request", "ar-synthetic-struct", "BASED_ON", "assumption", "asm-a12"),
    link("assumption", "asm-a12", "USED_BY", "analysis_request", "ar-synthetic-struct"),
    link("assumption", "asm-a12", "USED_BY", "decision", "dec-support-frame"),
    link("review_package", "rev-feed-01", "REVIEWS", "analysis_result", "res-synthetic-struct"),
    link("decision", "dec-support-frame", "SUPPORTED_BY", "analysis_result", "res-synthetic-struct"),
    link("decision", "dec-support-frame", "BASED_ON", "assumption", "asm-a12"),
    link("decision", "dec-support-frame", "SELECTS", "alternative", "alt-portal"),
    link("decision", "dec-support-frame", "SUPERSEDES", "decision", "dec-superseded"),
    link("change", "chg-vendor-mass", "AFFECTS", "system", "sys-primary-crushing"),
    link("change", "chg-vendor-mass", "AFFECTS", "interface", "ifc-mech-struct"),
    link("change", "chg-vendor-mass", "AFFECTS", "analysis_request", "ar-structural-blocked"),
    link("change", "chg-vendor-mass", "BASED_ON", "requirement", "req-r001"),
    link("configuration_baseline", "bl-feed-02", "SUPERSEDES", "configuration_baseline", "bl-feed-01"),
    link("configuration_baseline", "bl-feed-02", "BASELINES", "configuration_item", "ci-sys"),
    link("decision", "dec-support-frame", "AFFECTS", "configuration_baseline", "bl-feed-02"),
    link("requirement", "req-r001", "DEPENDS_ON", "requirement", "req-hidden-ws"),
    link("system", "sys-primary-crushing", "DEPENDS_ON", "system", "sys-other-tenant"),
  ];

  nodes.push(
    node({
      objectType: "alternative",
      objectId: "alt-portal",
      objectCode: "ALT-PORTAL",
      title: "portal frame",
    }),
  );

  return { nodes, links };
}

export function cycleFixture(): ThreadGraphInput {
  const tenantId = CRUSHER_FEED_TENANT;
  const workspaceId = CRUSHER_FEED_WORKSPACE;
  const nodes: ThreadCatalogNode[] = [
    { tenantId, workspaceId, objectType: "system", objectId: "sys-a", objectCode: "A", title: "A" },
    { tenantId, workspaceId, objectType: "system", objectId: "sys-b", objectCode: "B", title: "B" },
    { tenantId, workspaceId, objectType: "system", objectId: "sys-c", objectCode: "C", title: "C" },
  ];
  const links: ThreadRelation[] = [
    link("system", "sys-a", "CONTAINS", "system", "sys-b"),
    link("system", "sys-b", "CONTAINS", "system", "sys-c"),
    link("system", "sys-c", "CONTAINS", "system", "sys-a"),
  ];
  return { nodes, links };
}

export function authorizedMemberContext(graph: ThreadGraphInput) {
  return {
    tenantId: CRUSHER_FEED_TENANT,
    allowedWorkspaceIds: [CRUSHER_FEED_WORKSPACE] as const,
    role: "member" as const,
    nodeAccess: new Map(
      graph.nodes.map((n) => [`${n.objectType}:${n.objectId}`, { tenantId: n.tenantId, workspaceId: n.workspaceId }]),
    ),
  };
}
