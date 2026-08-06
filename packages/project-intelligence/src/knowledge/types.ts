/**
 * Phase 8G — Knowledge node / edge reference types (no duplicate business records).
 */
import { PROJECT_INTELLIGENCE_KG_RELATIONSHIPS } from "@rtb/types";

export const KNOWLEDGE_SOURCE_OWNERS = [
  "engineering_core",
  "document_intelligence",
  "meeting_intelligence",
  "findings_intelligence",
  "reporting_intelligence",
  "knowledge_intelligence",
] as const;

export type KnowledgeSourceOwner = (typeof KNOWLEDGE_SOURCE_OWNERS)[number];

export const KNOWLEDGE_ENTITY_KINDS = [
  "project",
  "asset",
  "document",
  "meeting",
  "finding",
  "risk",
  "issue",
  "action",
  "decision",
  "technical_query",
  "lesson",
  "person",
  "organization",
  "evidence",
  "report",
] as const;

export type KnowledgeEntityKind = (typeof KNOWLEDGE_ENTITY_KINDS)[number];

export const KNOWLEDGE_EDGE_TYPES = PROJECT_INTELLIGENCE_KG_RELATIONSHIPS;

export type KnowledgeEdgeType = (typeof KNOWLEDGE_EDGE_TYPES)[number];

/** Reference to an externally owned record — never a cloned business payload. */
export type KnowledgeNodeRef = {
  refId: string;
  kind: KnowledgeEntityKind;
  owner: KnowledgeSourceOwner;
  title: string;
  projectId?: string;
  workspaceId: string;
  tenantId: string;
  /** Optional search snippet — not authoritative content. */
  snippet?: string;
  drillDownPath: string;
  storesBusinessRecord: false;
};

export type KnowledgeEdgeRef = {
  edgeId: string;
  fromRefId: string;
  toRefId: string;
  edgeType: KnowledgeEdgeType;
  weight: number;
  tenantId: string;
  workspaceId: string;
  storesBusinessRecord: false;
};

export type KnowledgeCitation = {
  owner: KnowledgeSourceOwner;
  kind: KnowledgeEntityKind;
  refId: string;
  excerpt: string;
  score: number;
  drillDownPath: string;
};
