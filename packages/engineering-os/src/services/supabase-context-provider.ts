/**
 * Lightweight Supabase-backed ContextDomainProvider for Ask enrichment.
 * Loads only requested records / project members with hard limits — no whole-graph hydration.
 */

import type { SupabaseClient } from "@rtb/database";
import type { DomainLinkHint, DomainRecordHint } from "../phase-e3/canonical-context-assembler";
import type { ContextDomainProvider } from "../phase-e3/canonical-context-resolver";
import { mapDomainTypeToCanonical } from "../phase-e3/contracts";

const TABLE_BY_CANONICAL: Record<string, string> = {
  PROJECT: "engineering_projects",
  ASSET: "engineering_assets",
  DOCUMENT: "engineering_documents",
  DECISION: "engineering_decisions",
  ACTION: "engineering_actions",
  RISK: "engineering_risks",
  ISSUE: "engineering_issues",
  TECHNICAL_QUERY: "engineering_technical_queries",
  LESSON: "engineering_lessons",
};

function rowToHint(
  objectType: string,
  row: Record<string, unknown>,
): DomainRecordHint {
  const projectId =
    (row.engineering_project_id as string | null | undefined) ??
    (row.project_id as string | null | undefined) ??
    null;
  return {
    objectType,
    objectId: String(row.id),
    tenantId: String(row.tenant_id ?? ""),
    workspaceId: (row.workspace_id as string | null | undefined) ?? null,
    projectId,
    belongsToProjectId: projectId,
    displayName:
      (row.title as string | undefined) ??
      (row.project_name as string | undefined) ??
      (row.asset_name as string | undefined) ??
      (row.document_number as string | undefined) ??
      null,
    status: (row.status as string | null | undefined) ?? null,
    lastUpdated: (row.updated_at as string | null | undefined) ?? null,
    linkedDecisionId: (row.decision_id as string | null | undefined) ?? null,
    linkedDocumentId: (row.document_id as string | null | undefined) ?? null,
    linkedAssetId: (row.asset_id as string | null | undefined) ?? null,
    predecessorDocumentId:
      (row.predecessor_document_id as string | null | undefined) ??
      (row.supersedes_document_id as string | null | undefined) ??
      null,
    originatingObjectType:
      (row.originating_object_type as string | null | undefined) ?? null,
    originatingObjectId:
      (row.originating_object_id as string | null | undefined) ?? null,
  };
}

export function createSupabaseContextProvider(
  supabase: SupabaseClient,
  tenantId: string,
): ContextDomainProvider {
  return {
    async getRecord(objectType, objectId) {
      const canonical = mapDomainTypeToCanonical(objectType);
      const table = TABLE_BY_CANONICAL[canonical];
      if (!table) return null;
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("id", objectId)
        .maybeSingle();
      if (error || !data) return null;
      return rowToHint(canonical, data as Record<string, unknown>);
    },

    async listProjectMembers(projectId) {
      const out: DomainRecordHint[] = [];
      const memberSpecs: Array<{ type: string; table: string; col: string }> = [
        { type: "DOCUMENT", table: "engineering_documents", col: "engineering_project_id" },
        { type: "ASSET", table: "engineering_assets", col: "project_id" },
        { type: "DECISION", table: "engineering_decisions", col: "project_id" },
        { type: "ACTION", table: "engineering_actions", col: "project_id" },
        { type: "RISK", table: "engineering_risks", col: "project_id" },
        { type: "ISSUE", table: "engineering_issues", col: "project_id" },
        {
          type: "TECHNICAL_QUERY",
          table: "engineering_technical_queries",
          col: "project_id",
        },
        { type: "LESSON", table: "engineering_lessons", col: "project_id" },
      ];
      // Hard bound: 8 per type to avoid whole-project hydration.
      for (const spec of memberSpecs) {
        if (out.length >= 40) break;
        const { data } = await supabase
          .from(spec.table)
          .select("*")
          .eq("tenant_id", tenantId)
          .eq(spec.col, projectId)
          .limit(8);
        for (const row of data ?? []) {
          out.push(rowToHint(spec.type, row as Record<string, unknown>));
        }
      }
      return out.slice(0, 40);
    },

    async listObjectLinks(objectType, objectId) {
      const t = objectType.toLowerCase();
      const { data } = await supabase
        .from("engineering_object_links")
        .select("*")
        .eq("tenant_id", tenantId)
        .or(
          `and(from_type.eq.${t},from_id.eq.${objectId}),and(to_type.eq.${t},to_id.eq.${objectId})`,
        )
        .limit(40);
      const links: DomainLinkHint[] = [];
      for (const row of data ?? []) {
        const r = row as Record<string, unknown>;
        links.push({
          fromType: String(r.from_type ?? ""),
          fromId: String(r.from_id ?? ""),
          toType: String(r.to_type ?? ""),
          toId: String(r.to_id ?? ""),
          relationshipType: (r.relationship as never) ?? "RELATES_TO",
          projectId: (r.project_id as string | null | undefined) ?? null,
          sourceId: String(r.id ?? ""),
          revoked: Boolean(r.revoked_at ?? r.deleted_at),
        });
      }
      return links.filter((l) => l.fromId && l.toId);
    },
  };
}
