import { KERNEL_EVENT_SOURCE, KERNEL_WORK_EVENT_TYPE } from "./types";
import type { EngineeringWorkEvent } from "./types";
import { DEFAULT_CAPTURE_POLICY } from "./types";
import { discoverThreadImpactCandidates, traverseThread } from "../digital-thread/traversal";
import type { ThreadGraphInput } from "../digital-thread/types";

export const WORK_CONTEXT_RECON = {
  eventBus: "REUSE",
  jobService: "REUSE",
  audit: "REUSE",
  activityFeed: "LEGACY",
  workItems: "COMPOSE",
  documents: "COMPOSE",
  analysis: "COMPOSE",
  review: "COMPOSE",
  decisions: "COMPOSE",
  interfaces: "COMPOSE",
  deliverables: "COMPOSE",
  configuration: "COMPOSE",
  digitalThread: "COMPOSE",
  informationIntelligence: "COMPOSE",
  connectors: "EXTEND",
  m365: "EXTEND",
  sharepoint: "EXTEND",
  teams: "CONTRACT",
  outlook: "CONTRACT",
  aconex: "MISSING",
  p6: "MISSING",
  bim: "MISSING",
  externalTools: "COMPOSE",
} as const;

export const WORK_CONTEXT_PRIVACY = {
  tracks: "ENGINEERING_WORK",
  doesNotTrack: "EMPLOYEE_COMPUTER_ACTIVITY",
  defaultCapturePolicy: DEFAULT_CAPTURE_POLICY,
  allowlistedRepositoriesOnly: true,
  localDriveRecursiveScan: "PROHIBITED",
  unmanagedFileIndexing: "PROHIBITED",
  personalOneDriveAccess: "PROHIBITED",
  personalEmailAccess: "PROHIBITED",
  browserHistoryCapture: "PROHIBITED",
  keystrokeCapture: "PROHIBITED",
  employeeProductivityScoring: "PROHIBITED",
  newEventBusCreated: false,
  newSearchEngineCreated: false,
  newGraphStoreCreated: false,
  realConnectorsImplemented: false,
  realSolverExecutionImplemented: false,
} as const;

export function kernelWorkEventEnvelope(event: EngineeringWorkEvent) {
  return {
    tenantId: event.tenantId,
    workspaceId: event.workspaceId,
    eventType: KERNEL_WORK_EVENT_TYPE,
    source: KERNEL_EVENT_SOURCE,
    payload: {
      workEventId: event.id,
      eventType: event.eventType,
      projectId: event.projectId,
      sourceSystem: event.sourceSystem,
      sourceObjectType: event.sourceObjectType,
      sourceObjectId: event.sourceObjectId,
      sourceEventId: event.sourceEventId,
      informationRefId: event.informationRefId,
      materiality: event.materiality,
      confirmationState: event.confirmationState,
    },
  };
}

export function composeWorkEventThreadGraph(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  events: EngineeringWorkEvent[];
}): ThreadGraphInput {
  const node = (objectType: string, objectId: string, extra: Record<string, unknown> = {}) => ({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    objectType,
    objectId,
    ...extra,
  });
  const link = (relationship: string, fromType: string, fromId: string, toType: string, toId: string) => ({
    relationship,
    fromType,
    fromId,
    toType,
    toId,
    governed: true,
  });
  const byType = (type: string) => input.events.find((row) => row.eventType === type);
  const load = byType("SOURCE_REVISED") ?? input.events[0];
  const iface = byType("INTERFACE_INFORMATION_CHANGED");
  const analysis = byType("ANALYSIS_EXECUTED");
  const calc = byType("CALCULATION_PUBLISHED");
  const drawing = byType("DRAWING_ISSUED");
  const review = byType("DOCUMENT_REVIEW_COMPLETED");
  const decision = byType("DECISION_RECORDED");
  const deliverable = byType("DELIVERABLE_UPDATED") ?? byType("DELIVERABLE_ISSUED");
  const nodes = [
    load ? node("engineering_work_event", load.id, { objectCode: load.eventType, status: load.materiality }) : null,
    load?.informationRefId ? node("engineering_information", load.informationRefId) : node("engineering_information", "info-ref-mech-operating-load"),
    iface ? node("interface", iface.sourceObjectId) : node("interface", "if-cr-cv-01"),
    node("analysis_request", "anl-req-struct"),
    analysis ? node("analysis_result", analysis.sourceObjectId) : node("analysis_result", "anl-struct"),
    calc ? node("document", calc.sourceObjectId) : node("document", "calc-str-feed"),
    drawing ? node("document", drawing.sourceObjectId) : node("document", "dwg-str-feed"),
    review ? node("review_package", review.sourceObjectId) : node("review_package", "rev-str-feed"),
    decision ? node("decision", decision.sourceObjectId) : node("decision", "edn-014"),
    deliverable ? node("deliverable_expectation", deliverable.sourceObjectId) : node("deliverable_expectation", "str-anl-feed"),
  ].filter(Boolean);
  const loadId = load?.id ?? "we-load";
  const infoId = load?.informationRefId ?? "info-ref-mech-operating-load";
  return {
    nodes: nodes as ThreadGraphInput["nodes"],
    links: [
      link("USES", "engineering_work_event", loadId, "engineering_information", infoId),
      link("AFFECTS", "engineering_work_event", loadId, "interface", iface?.sourceObjectId ?? "if-cr-cv-01"),
      link("AFFECTS", "engineering_work_event", iface?.id ?? loadId, "analysis_result", analysis?.sourceObjectId ?? "anl-struct"),
      link("DEPENDS_ON", "analysis_request", "anl-req-struct", "engineering_information", infoId),
      link("USES", "document", calc?.sourceObjectId ?? "calc-str-feed", "analysis_result", analysis?.sourceObjectId ?? "anl-struct"),
      link("USES", "document", drawing?.sourceObjectId ?? "dwg-str-feed", "document", calc?.sourceObjectId ?? "calc-str-feed"),
      link("REVIEWS", "review_package", review?.sourceObjectId ?? "rev-str-feed", "document", drawing?.sourceObjectId ?? "dwg-str-feed"),
      link("SUPPORTED_BY", "decision", decision?.sourceObjectId ?? "edn-014", "document", calc?.sourceObjectId ?? "calc-str-feed"),
      link("USES", "deliverable_expectation", deliverable?.sourceObjectId ?? "str-anl-feed", "document", drawing?.sourceObjectId ?? "dwg-str-feed"),
    ],
  };
}

export function potentialImpactsForWorkEvents(graph: ThreadGraphInput, rootEventId: string) {
  const rootNode = graph.nodes.find((row) => row.objectType === "engineering_work_event" && row.objectId === rootEventId) ?? graph.nodes[0];
  const traversal = traverseThread(graph, {
    tenantId: rootNode?.tenantId ?? "",
    workspaceId: rootNode?.workspaceId ?? "",
    root: { objectType: "engineering_work_event", objectId: rootEventId },
    direction: "downstream",
    maxDepth: 4,
  });
  return discoverThreadImpactCandidates(traversal).map((row) => ({
    ...row,
    label: "POTENTIAL IMPACT" as const,
    confirmedImpact: false as const,
    actualEngineeringImpact: false as const,
  }));
}

export function aggregateEngineeringDay(events: EngineeringWorkEvent[], sinceIso: string, actorId?: string | null) {
  const since = Date.parse(sinceIso);
  const inWindow = events.filter((row) => Date.parse(row.occurredAt) >= since);
  const count = (type: string) => inWindow.filter((row) => row.eventType === type).length;
  return {
    since: sinceIso,
    sourcesRevised: count("SOURCE_REVISED"),
    sourcesPublished: count("SOURCE_PUBLISHED"),
    analysesExecuted: count("ANALYSIS_EXECUTED"),
    reviewsCompleted: count("DOCUMENT_REVIEW_COMPLETED"),
    decisionsRecorded: count("DECISION_RECORDED"),
    drawingsIssued: count("DRAWING_ISSUED"),
    calculationsPublished: count("CALCULATION_PUBLISHED"),
    changed: inWindow.filter((row) =>
      ["SOURCE_REVISED", "SOURCE_PUBLISHED", "INTERFACE_INFORMATION_CHANGED", "CONFIGURATION_CHANGED"].includes(row.eventType),
    ),
    myWork: actorId ? inWindow.filter((row) => row.actorId === actorId) : [],
    waiting: inWindow.filter((row) =>
      ["DOCUMENT_REVIEW_REQUESTED", "RFI_CREATED", "ACTION_CREATED"].includes(row.eventType),
    ),
    completed: inWindow.filter((row) =>
      [
        "DOCUMENT_REVIEW_COMPLETED",
        "RFI_CLOSED",
        "ACTION_COMPLETED",
        "DECISION_RECORDED",
        "DRAWING_ISSUED",
        "DELIVERABLE_ISSUED",
        "CALCULATION_PUBLISHED",
      ].includes(row.eventType),
    ),
    productivityScore: null,
    employeeRanking: null,
  };
}

export function futureAssuranceConditions() {
  return ["MANAGED_SOURCE_REQUIRED_BUT_UNAVAILABLE", "UNMANAGED_SOURCE_REFERENCED", "WORKFLOW_EVENT_MISSING_PROVENANCE"] as const;
}

export function explainCapture(reason: string) {
  return { whyCaptured: reason, hiddenSecurityMetadata: false };
}
