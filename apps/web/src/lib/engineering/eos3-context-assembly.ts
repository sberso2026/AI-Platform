/** Bounded Engineering Reasoning context pack for later AI phases (not autonomous agents). */

import type { Eos3CanonicalObjectStore } from "./eos3-object-store";
import type { Eos3KnowledgeRegistry } from "./eos3-knowledge-registry";
import {
  assumptionsSupportingCalculation,
  evidenceSupportingDecision,
  requirementsDrivingObject,
  currentRevisionOf,
} from "./eos3-digital-thread";
import type { Eos3AuthorityClass } from "./eos3-knowledge-tiers";

export type ContextItem = {
  itemId: string;
  sourceType: "canonical_object" | "controlled_document" | "relationship" | "revision";
  authority: Eos3AuthorityClass;
  revisionId: string | null;
  provenance: Record<string, unknown>;
  evidenceClass: "FACT" | "INFERENCE" | "ASSUMPTION" | "RECOMMENDATION" | "RESULT" | "HUMAN_DECISION";
  accessScope: { tenantId: string; workspaceId: string; projectId: string };
  summary: string;
  graphDistance: number;
  relevance: number;
};

export type EngineeringContextPack = {
  projectId: string;
  workspaceId: string;
  tenantId: string;
  items: ContextItem[];
  budgetUsed: number;
  budgetMax: number;
  assembledAt: string;
};

export function assembleEngineeringContext(input: {
  store: Eos3CanonicalObjectStore;
  registry: Eos3KnowledgeRegistry;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  focusObjectId?: string | null;
  budgetMax?: number;
}): EngineeringContextPack {
  const budgetMax = input.budgetMax ?? 12;
  const items: ContextItem[] = [];
  const view = input.store.view();

  for (const obj of input.store.objects.values()) {
    if (obj.projectId !== input.projectId) continue;
    if (obj.tenantId !== input.tenantId || obj.workspaceId !== input.workspaceId) continue;
    const rev = currentRevisionOf(view, obj.id);
    const graphDistance = input.focusObjectId
      ? obj.id === input.focusObjectId
        ? 0
        : 1
      : obj.objectType === "Requirement" || obj.objectType === "Decision"
        ? 0
        : 2;
    items.push({
      itemId: obj.id,
      sourceType: "canonical_object",
      authority: "AUTHORITATIVE_STRUCTURED_STATE",
      revisionId: rev?.id ?? obj.currentRevisionId,
      provenance: obj.provenance,
      evidenceClass: "FACT",
      accessScope: {
        tenantId: obj.tenantId,
        workspaceId: obj.workspaceId,
        projectId: obj.projectId,
      },
      summary: `${obj.objectType}:${obj.stableObjectId} (${obj.governedState})`,
      graphDistance,
      relevance: graphDistance === 0 ? 1 : obj.objectType === "Assumption" || obj.objectType === "Evidence" ? 0.8 : 0.5,
    });

    if (obj.objectType === "DisciplineObject" || obj.objectType === "System") {
      for (const req of requirementsDrivingObject(view, obj.id)) {
        items.push({
          itemId: `rel-req-${req.id}-${obj.id}`,
          sourceType: "relationship",
          authority: "AUTHORITATIVE_STRUCTURED_STATE",
          revisionId: null,
          provenance: req.provenance,
          evidenceClass: "FACT",
          accessScope: {
            tenantId: obj.tenantId,
            workspaceId: obj.workspaceId,
            projectId: obj.projectId,
          },
          summary: `Requirement ${req.stableObjectId} drives ${obj.stableObjectId}`,
          graphDistance: 1,
          relevance: 0.9,
        });
      }
    }
    if (obj.objectType === "Calculation") {
      for (const a of assumptionsSupportingCalculation(view, obj.id)) {
        items.push({
          itemId: `rel-asm-${a.id}`,
          sourceType: "relationship",
          authority: "AUTHORITATIVE_STRUCTURED_STATE",
          revisionId: null,
          provenance: a.provenance,
          evidenceClass: "ASSUMPTION",
          accessScope: {
            tenantId: obj.tenantId,
            workspaceId: obj.workspaceId,
            projectId: obj.projectId,
          },
          summary: `Assumption ${a.stableObjectId} supports calculation`,
          graphDistance: 1,
          relevance: 0.85,
        });
      }
    }
    if (obj.objectType === "Decision") {
      for (const e of evidenceSupportingDecision(view, obj.id)) {
        items.push({
          itemId: `rel-ev-${e.id}`,
          sourceType: "relationship",
          authority: "AUTHORITATIVE_STRUCTURED_STATE",
          revisionId: null,
          provenance: e.provenance,
          evidenceClass: "FACT",
          accessScope: {
            tenantId: obj.tenantId,
            workspaceId: obj.workspaceId,
            projectId: obj.projectId,
          },
          summary: `Evidence ${e.stableObjectId} supports decision`,
          graphDistance: 1,
          relevance: 0.9,
        });
      }
    }
  }

  for (const chunk of input.registry.chunks.values()) {
    if (chunk.tenantId !== input.tenantId || chunk.workspaceId !== input.workspaceId) continue;
    if (chunk.projectId && chunk.projectId !== input.projectId) continue;
    if (chunk.effectiveState === "REVOKED" || chunk.effectiveState === "WITHDRAWN") continue;
    items.push({
      itemId: chunk.chunkId,
      sourceType: "controlled_document",
      authority: chunk.authorityClass,
      revisionId: chunk.revisionOrVersion,
      provenance: { sourceId: chunk.sourceId, pageOrSection: chunk.pageOrSection },
      evidenceClass: chunk.evidenceClassification,
      accessScope: {
        tenantId: chunk.tenantId,
        workspaceId: chunk.workspaceId,
        projectId: chunk.projectId ?? input.projectId,
      },
      summary: chunk.text.slice(0, 160),
      graphDistance: 2,
      relevance: chunk.documentStatus === "approved" ? 0.7 : 0.4,
    });
  }

  // Budget by authority, relevance, graph distance — not max tokens vanity.
  items.sort((a, b) => {
    const auth = Number(a.authority === "AUTHORITATIVE_STRUCTURED_STATE") - Number(b.authority === "AUTHORITATIVE_STRUCTURED_STATE");
    if (auth !== 0) return -auth;
    if (b.relevance !== a.relevance) return b.relevance - a.relevance;
    return a.graphDistance - b.graphDistance;
  });

  const selected = items.slice(0, budgetMax);
  return {
    projectId: input.projectId,
    workspaceId: input.workspaceId,
    tenantId: input.tenantId,
    items: selected,
    budgetUsed: selected.length,
    budgetMax,
    assembledAt: new Date().toISOString(),
  };
}
