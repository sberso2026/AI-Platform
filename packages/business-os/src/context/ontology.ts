import {
  BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  BUSINESS_CONTEXT_NODE_TYPES,
  type BusinessContextGraphOntologyVersion,
  type BusinessContextNodeType,
  type BusinessContextSourceDomain,
} from "@rtb/types";

export const BOS_GRAPH_NODE_PREFIX = "bos." as const;

export const NODE_TYPE_DOMAIN: Record<BusinessContextNodeType, BusinessContextSourceDomain> = {
  organisation: "growth",
  customer: "customer",
  contact: "customer",
  lead: "growth",
  opportunity: "growth",
  proposal: "revenue",
  work: "operations",
  market_segment: "growth",
  financial_period: "finance",
  financial_fact: "finance",
  profit_fact: "profit",
  risk: "risk",
  control: "risk",
  obligation: "risk",
  decision: "decision",
  action: "decision",
  signal: "owner_command",
  recommendation: "owner_command",
  kpi: "owner_command",
  evidence: "decision",
  document_reference: "platform",
  agent_reference: "platform",
  engineering_project_reference: "engineering_reference",
};

export function kernelNodeType(entityType: BusinessContextNodeType): string {
  return `${BOS_GRAPH_NODE_PREFIX}${entityType}`;
}

export function parseKernelNodeType(nodeType: string): BusinessContextNodeType | null {
  if (!nodeType.startsWith(BOS_GRAPH_NODE_PREFIX)) return null;
  const raw = nodeType.slice(BOS_GRAPH_NODE_PREFIX.length);
  return (BUSINESS_CONTEXT_NODE_TYPES as readonly string[]).includes(raw)
    ? (raw as BusinessContextNodeType)
    : null;
}

export function assertOntologyVersion(
  version: string,
): asserts version is BusinessContextGraphOntologyVersion {
  if (version !== BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION) {
    throw new Error("schema_version_mismatch");
  }
}

export const ONTOLOGY = {
  version: BUSINESS_CONTEXT_GRAPH_ONTOLOGY_VERSION,
  nodeTypes: BUSINESS_CONTEXT_NODE_TYPES,
  kernelPrefix: BOS_GRAPH_NODE_PREFIX,
} as const;
