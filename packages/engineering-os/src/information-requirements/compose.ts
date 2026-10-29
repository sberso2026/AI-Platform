import type { ThreadCatalogNode, ThreadGraphInput, ThreadRelation } from "../digital-thread/types";
import type { EngineeringHandoverPackage, EngineeringInformationRequirement } from "./types";

export const INFORMATION_REQUIREMENT_RECON = {
  engineeringRequirements: "REUSE",
  interfaces: "COMPOSE",
  deliverables: "COMPOSE",
  informationIntelligence: "COMPOSE",
  workContext: "COMPOSE",
  lifecycle: "COMPOSE",
  documents: "COMPOSE",
  analysis: "COMPOSE",
  decisions: "COMPOSE",
  digitalThread: "COMPOSE",
  assurance: "COMPOSE",
  actions: "COMPOSE",
  notifications: "COMPOSE",
  informationRequirement: "MISSING",
  handoverPackage: "MISSING",
} as const;

export function composeDeliverableInformationRequirements(bound: boolean, missingCount: number) {
  return {
    bound,
    missingCount,
    maturityUpgraded: false,
    reviewComplete: false,
    approved: false,
  };
}

export function candidateAssuranceConditions(evaluations: Array<{ satisfied: boolean; stale: boolean; acceptedForPurpose: boolean; superseded: boolean }>, handoverMissing: boolean) {
  const conditions: string[] = [];
  if (evaluations.some((row) => !row.satisfied && !row.acceptedForPurpose && !row.stale)) conditions.push("REQUIRED_INFORMATION_MISSING");
  if (evaluations.some((row) => row.stale)) conditions.push("REQUIRED_INFORMATION_STALE");
  if (evaluations.some((row) => !row.satisfied && !row.acceptedForPurpose)) conditions.push("REQUIRED_INFORMATION_UNACCEPTED");
  if (handoverMissing) conditions.push("HANDOVER_INFORMATION_MISSING");
  if (evaluations.some((row) => row.superseded)) conditions.push("HANDOVER_SOURCE_SUPERSEDED");
  return { conditions, automaticFinding: false };
}

export function composeAnalysisInformationInputs(satisfiedTitles: string[]) {
  return {
    requiredInformation: satisfiedTitles,
    solverExecuted: false,
    analysisInputsCompatible: true,
  };
}

export function informationRequirementThreadGraph(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  requirement: EngineeringInformationRequirement;
  informationRefId: string | null;
  workEventId?: string | null;
  deliverableId?: string | null;
  handover?: EngineeringHandoverPackage | null;
}): ThreadGraphInput {
  const node = (objectType: string, objectId: string, extra: Partial<ThreadCatalogNode> = {}): ThreadCatalogNode => ({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    objectType,
    objectId,
    ...extra,
  });
  const link = (relationship: string, fromType: string, fromId: string, toType: string, toId: string): ThreadRelation => ({
    relationship,
    fromType,
    fromId,
    toType,
    toId,
    governed: true,
  });
  const infoId = input.informationRefId ?? "info-pending";
  const workId = input.workEventId ?? "we-start-foundation";
  const deliverableId = input.deliverableId ?? input.requirement.deliverableId ?? "str-anl-feed";
  const handoverId = input.handover?.id ?? "ho-crusher-subsys";
  return {
    nodes: [
      node("engineering_information_requirement", input.requirement.id, { objectCode: input.requirement.requirementType, status: input.requirement.status }),
      node("engineering_information", infoId),
      node("engineering_work_event", workId),
      node("deliverable_expectation", deliverableId),
      node("configuration_baseline", "bl-feed-1"),
      node("engineering_handover_package", handoverId),
      node("interface", input.requirement.interfaceId ?? "if-cr-cv-01"),
      node("requirement", "req-foundation-capacity"),
    ],
    links: [
      link("USES", "engineering_information_requirement", input.requirement.id, "engineering_information", infoId),
      link("DEPENDS_ON", "engineering_work_event", workId, "engineering_information_requirement", input.requirement.id),
      link("USES", "deliverable_expectation", deliverableId, "engineering_information_requirement", input.requirement.id),
      link("BASELINES", "configuration_baseline", "bl-feed-1", "engineering_information", infoId),
      link("USES", "engineering_handover_package", handoverId, "engineering_information_requirement", input.requirement.id),
      link("DEPENDS_ON", "engineering_information_requirement", input.requirement.id, "interface", input.requirement.interfaceId ?? "if-cr-cv-01"),
      link("DEPENDS_ON", "engineering_information_requirement", input.requirement.id, "requirement", "req-foundation-capacity"),
    ],
  };
}
