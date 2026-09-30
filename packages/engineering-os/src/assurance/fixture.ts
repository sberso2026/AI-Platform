import {
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  crusherExpansionFeedFixture,
} from "../digital-thread/fixture";
import type { ThreadCatalogNode, ThreadRelation } from "../digital-thread/types";
import type { AssuranceEvaluationInput, InterfaceInformationFact } from "./types";

function node(partial: Omit<ThreadCatalogNode, "tenantId" | "workspaceId">): ThreadCatalogNode {
  return {
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    projectId: "proj-crusher-feed",
    ...partial,
  };
}

function link(fromType: string, fromId: string, relationship: string, toType: string, toId: string): ThreadRelation {
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

export const CRUSHER_ASSURANCE_NOW = "2026-09-30T00:00:00.000Z";

export function crusherAssuranceFixture(): AssuranceEvaluationInput {
  const base = crusherExpansionFeedFixture();
  const extraNodes: ThreadCatalogNode[] = [
    node({
      objectType: "requirement",
      objectId: "req-unallocated",
      objectCode: "R-UNALLOC-01",
      title: "FEED structural load envelope not yet allocated",
      status: "active",
    }),
    node({
      objectType: "requirement",
      objectId: "req-draft-unallocated",
      objectCode: "R-DRAFT-01",
      title: "Draft informational placeholder requirement",
      status: "draft",
    }),
    node({
      objectType: "decision",
      objectId: "dec-no-evidence",
      objectCode: "EDN-021",
      title: "Adopt vendor access platform geometry",
      status: "active",
    }),
    node({
      objectType: "decision",
      objectId: "dec-informational",
      objectCode: "EDN-INFO-01",
      title: "Informational site photo orientation",
      status: "active",
      materiality: "low",
    }),
    node({
      objectType: "analysis_result",
      objectId: "res-unreviewed",
      objectCode: "AR-UNREV-01",
      title: "Unreviewed synthetic mechanical envelope",
      status: "UNREVIEWED",
      acceptanceState: "UNREVIEWED",
      reviewRequired: true,
      provenance: { sourceAnalysisId: "ar-mechanical", createdAt: "2026-09-03T00:00:00.000Z", createdBy: "engineer-a1" },
    }),
    node({
      objectType: "configuration_item",
      objectId: "ci-orphan",
      objectCode: "CI-ORPHAN-01",
      title: "Frozen pointer missing provenance",
      status: "active",
    }),
    node({
      objectType: "assumption",
      objectId: "asm-expired",
      objectCode: "A-EXP-01",
      title: "Vendor dynamic factor remains 1.3 through FEED",
      status: "active",
      materiality: "high",
      validationStatus: "partially_validated",
      expiresAt: "2026-09-01T00:00:00.000Z",
    }),
  ];
  const extraLinks: ThreadRelation[] = [
    link("analysis_request", "ar-structural-blocked", "DEPENDS_ON", "interface", "ifc-mech-struct"),
    link("assumption", "asm-expired", "USED_BY", "decision", "dec-support-frame"),
    link("decision", "dec-support-frame", "BASED_ON", "assumption", "asm-expired"),
    link("analysis_request", "ar-mechanical", "PRODUCES", "analysis_result", "res-unreviewed"),
  ];
  const interfaceInformation: InterfaceInformationFact[] = [
    {
      interfaceId: "ifc-mech-struct",
      informationKey: "OPERATING_LOAD",
      status: "INCOMPLETE",
      sourceDiscipline: "MECHANICAL",
      receivingDiscipline: "STRUCTURAL",
      description: "Operating load envelope for structural support design",
    },
  ];
  return {
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    graph: { nodes: [...base.nodes, ...extraNodes], links: [...base.links, ...extraLinks] },
    interfaceInformation,
    now: CRUSHER_ASSURANCE_NOW,
  };
}

export function withRequirementAllocated(input: AssuranceEvaluationInput): AssuranceEvaluationInput {
  return {
    ...input,
    graph: {
      ...input.graph,
      links: [
        ...input.graph.links,
        link("requirement", "req-unallocated", "ALLOCATED_TO", "system", "sys-primary-crushing"),
      ],
    },
  };
}

export function withInterfaceInformationStatus(
  input: AssuranceEvaluationInput,
  status: string,
): AssuranceEvaluationInput {
  return {
    ...input,
    interfaceInformation: (input.interfaceInformation ?? []).map((fact) =>
      fact.interfaceId === "ifc-mech-struct" && fact.informationKey === "OPERATING_LOAD" ? { ...fact, status } : fact,
    ),
  };
}

export function withDecisionEvidence(input: AssuranceEvaluationInput): AssuranceEvaluationInput {
  return {
    ...input,
    graph: {
      ...input.graph,
      links: [
        ...input.graph.links,
        link("decision", "dec-no-evidence", "SUPPORTED_BY", "analysis_result", "res-mechanical"),
      ],
    },
  };
}
