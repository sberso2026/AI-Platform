import type { ThreadGraphInput } from "../digital-thread/types";
import type { ConstructionWorkbenchContext } from "./types";

function nodesOf(graph: ThreadGraphInput, types: string[], projectId: string) {
  return graph.nodes.filter((n) => types.includes(n.objectType) && (n.projectId ?? projectId) === projectId);
}

export function assembleConstructionContext(input: {
  graph: ThreadGraphInput;
  query: {
    id: string;
    type: ConstructionWorkbenchContext["queryType"];
    summary: string;
    projectId: string;
    location?: string | null;
  };
}): ConstructionWorkbenchContext {
  const started = Date.now();
  void started;
  const assembled = [
    ...nodesOf(input.graph, ["technical_query", "rfi"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "query",
    })),
    ...nodesOf(input.graph, ["system", "asset"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "system_or_asset",
    })),
    ...nodesOf(input.graph, ["drawing", "document"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: /spec/i.test(`${n.objectCode ?? ""} ${n.title ?? ""}`) ? "specification" : "drawing",
    })),
    ...nodesOf(input.graph, ["calculation"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "calculation",
    })),
    ...nodesOf(input.graph, ["analysis_request", "analysis_result"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "analysis",
    })),
    ...nodesOf(input.graph, ["engineering_information"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: /vendor/i.test(`${n.title ?? ""}`) ? "vendor_data" : "information",
    })),
    ...nodesOf(input.graph, ["interface"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "interface",
    })),
    ...nodesOf(input.graph, ["requirement"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "requirement",
    })),
    ...nodesOf(input.graph, ["assumption"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "assumption",
    })),
    ...nodesOf(input.graph, ["decision"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "decision",
    })),
    ...nodesOf(input.graph, ["configuration_baseline"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "configuration",
    })),
    ...nodesOf(input.graph, ["change"], input.query.projectId).map((n) => ({
      objectType: n.objectType,
      objectId: n.objectId,
      title: n.title ?? null,
      role: "open_change",
    })),
  ];
  const unique = [...new Map(assembled.map((row) => [`${row.objectType}:${row.objectId}:${row.role}`, row])).values()];
  const has = (role: string) => unique.some((row) => row.role === role);
  const missingInformation: string[] = [];
  const staleInformation: string[] = [];
  if (!has("drawing")) missingInformation.push("Current drawing not linked");
  if (!has("specification")) missingInformation.push("Current specification not linked");
  if (!has("calculation")) missingInformation.push("Governing calculation not linked");
  if (!has("analysis")) missingInformation.push("Current analysis not linked");
  const stale = input.graph.nodes.filter((n) => n.stale && (n.projectId ?? input.query.projectId) === input.query.projectId);
  for (const row of stale) staleInformation.push(`${row.objectType}:${row.objectId} is stale`);
  return {
    queryId: input.query.id,
    queryType: input.query.type,
    summary: input.query.summary,
    projectId: input.query.projectId,
    systemId: unique.find((row) => row.objectType === "system")?.objectId ?? null,
    location: input.query.location ?? null,
    assembled: unique,
    missingInformation,
    staleInformation,
    requiredEngineeringInput: [
      "Human impact confirmation",
      "Engineering response draft review",
      "Decision / change disposition",
    ],
    workPlanType: "RFI_TQ_RESPONSE",
    humanDecisionRequired: true,
    technicalSolutionChosen: false,
  };
}
