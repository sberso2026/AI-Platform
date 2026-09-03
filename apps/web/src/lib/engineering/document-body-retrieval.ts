import type { DocumentBodyRetrievalProbe, EngineeringEvidence, EngineeringSearchQuery } from "@rtb/engineering-os";
import {
  PostgresDocumentIndexAdapter,
  ProjectIntelligenceDocumentRetrievalService,
  UnavailableEmbeddingAdapter,
  excerptAroundQuery,
  isAuthoritativeAnswerAllowed,
  tryCreateGovernedEmbeddingAdapter,
  type DocumentProcessingStatus,
} from "@rtb/project-intelligence/retrieval";
import { createServiceClient } from "@/lib/supabase/service";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function citationHref(input: {
  documentId: string;
  page?: number | null;
  section?: string | null;
  chunkId?: string | null;
}): string {
  const params = new URLSearchParams();
  if (input.page) params.set("page", String(input.page));
  if (input.section) params.set("section", input.section);
  if (input.chunkId) params.set("chunk", input.chunkId);
  const query = params.toString();
  return query
    ? `/engineering/documents/${input.documentId}?${query}`
    : `/engineering/documents/${input.documentId}`;
}

export function createDocumentBodyRetrievalProbe(): DocumentBodyRetrievalProbe {
  return {
    async retrieve(query: EngineeringSearchQuery) {
      try {
        return await retrieveDocumentBody(query);
      } catch (error) {
        const name = error instanceof Error ? error.name : "Error";
        return {
          evidence: [],
          limitations: ["Document source search was unavailable."],
          diagnosticLimitations: [`document_body_retrieval_failed:${name}`],
          semanticConfigured: false,
        };
      }
    },
  };
}

async function retrieveDocumentBody(query: EngineeringSearchQuery) {
      const workspaceId = query.workspaceId;
      if (!workspaceId) {
        return {
          evidence: [],
          limitations: ["Workspace is required to search document source text."],
          diagnosticLimitations: ["document_body_retrieval:workspace_required"],
          semanticConfigured: false,
        };
      }

      const scope = query.scope ?? (query.objectType === "document" ? "document" : query.projectId ? "project" : "workspace");
      if (scope !== "document" && scope !== "project") {
        return null;
      }

      let ingestionState: string | undefined;
      const supabase = createServiceClient();
      const documentIds = scope === "document" && query.objectId ? [query.objectId] : undefined;
      const projectIds = scope === "project" && query.projectId ? [query.projectId] : undefined;

      if (documentIds?.length) {
        const { data: core } = await supabase
          .from("engineering_documents")
          .select("id, tenant_id, workspace_id, engineering_project_id, title, document_number, revision, status")
          .eq("id", documentIds[0])
          .eq("tenant_id", query.tenantId)
          .eq("workspace_id", workspaceId)
          .maybeSingle();
        if (!core) {
          return {
            evidence: [],
            limitations: [],
            diagnosticLimitations: ["document_body_retrieval:document_not_in_scope"],
            semanticConfigured: false,
          };
        }

        const { data: ingestion } = await supabase
          .from("project_intelligence_document_ingestions")
          .select("status, engineering_document_id")
          .eq("tenant_id", query.tenantId)
          .eq("workspace_id", workspaceId)
          .eq("engineering_document_id", documentIds[0])
          .is("deleted_at", null)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        const ingestionRow = asRecord(ingestion);
        const status = String(ingestionRow.status ?? "");
        ingestionState = status || "metadata_only";
        if (status && !isAuthoritativeAnswerAllowed(status as DocumentProcessingStatus)) {
          return {
            evidence: [],
            limitations: ["This document's source text is not searchable yet. Indexing may still be running, or only the register entry exists."],
            diagnosticLimitations: [`document_ingestion_status:${status || "unregistered"}`],
            retrievalMode: "lexical",
            semanticConfigured: false,
            ingestionState: status || "metadata_only",
          };
        }
      }

      const embeddings = tryCreateGovernedEmbeddingAdapter();
      const retrieval = new ProjectIntelligenceDocumentRetrievalService(
        new PostgresDocumentIndexAdapter(supabase as unknown as ConstructorParameters<typeof PostgresDocumentIndexAdapter>[0]),
        embeddings ?? new UnavailableEmbeddingAdapter(),
      );

      const result = await retrieval.retrieve(
        {
          tenantId: query.tenantId,
          workspaceId,
          allowedProjectIds: projectIds ?? [],
          authorized: true,
        },
        {
          query: query.query,
          filters: {
            engineeringDocumentIds: documentIds,
            engineeringProjectIds: projectIds,
          },
          limit: scope === "document" ? 12 : 8,
          scoreThreshold: 0,
        },
      );

      const docIds = [...new Set(result.hits.map((hit) => hit.chunk.engineeringDocumentId))];
      const { data: docs } = docIds.length
        ? await supabase
          .from("engineering_documents")
          .select("id, title, document_number, revision, status, engineering_project_id")
          .eq("tenant_id", query.tenantId)
          .eq("workspace_id", workspaceId)
          .in("id", docIds)
        : { data: [] as Array<Record<string, unknown>> };

      const byId = new Map((docs ?? []).map((row) => [String(asRecord(row).id), asRecord(row)]));
      const evidence: EngineeringEvidence[] = result.hits.map((hit) => {
        const core = byId.get(hit.chunk.engineeringDocumentId) ?? {};
        const figureNumber = hit.chunk.metadata?.figureNumber
          ? String(hit.chunk.metadata.figureNumber)
          : hit.chunk.sectionPath?.match(/figure\s*([0-9.]+)/i)?.[1];
        const title = String(core.title ?? "Engineering document");
        const documentNumber = String(core.document_number ?? "");
        const revision = String(core.revision ?? hit.chunk.revision ?? "A");
        return {
          sourceId: hit.chunk.stableChunkId,
          sourceType: "document",
          title: documentNumber ? `${documentNumber} — ${title}` : title,
          canonicalObjectId: hit.chunk.engineeringDocumentId,
          projectId: hit.chunk.engineeringProjectId ?? (core.engineering_project_id as string | null) ?? query.projectId ?? null,
          revision,
          authorityStatus: "CURRENT",
          sourceLocation: citationHref({
            documentId: hit.chunk.engineeringDocumentId,
            page: hit.chunk.pageStart,
            section: hit.chunk.sectionPath,
            chunkId: hit.chunk.stableChunkId,
          }),
          excerpt: excerptAroundQuery(
            hit.chunk.content,
            result.queryPlan?.normalizedQuery ?? query.query,
            420,
            [...(result.queryPlan?.properties ?? []), ...(result.queryPlan?.constraints ?? [])],
          ),
          retrievalScore: Math.round((hit.score ?? 0) * 1000),
          provenance: "engineering_os_native",
          permissionsApplied: true,
          pageStart: hit.chunk.pageStart ?? null,
          pageEnd: hit.chunk.pageEnd ?? null,
          sectionPath: hit.chunk.sectionPath ?? null,
          documentNumber: documentNumber || null,
          figureLabel: figureNumber ? `Figure ${figureNumber}` : null,
          chunkId: hit.chunk.stableChunkId,
        };
      });

      const semanticConfigured = Boolean(embeddings) && (result.vectorHitCount ?? 0) > 0;
      const hybrid = Boolean(embeddings) && (result.vectorAttempted ?? false) && result.hits.some((hit) => hit.source === "hybrid" || hit.source === "vector");
      const diagnostic: string[] = [
        `document_body_hits:${evidence.length}`,
        `lexical_hits:${result.lexicalHitCount ?? 0}`,
        `vector_hits:${result.vectorHitCount ?? 0}`,
        `embeddings_configured:${Boolean(embeddings)}`,
        `retrieval_trace:${result.retrievalTraceId}`,
        `vector_attempted:${result.vectorAttempted ?? false}`,
        `rank1_margin:${result.rank1Margin ?? ""}`,
      ];
      if (result.queryPlanDiagnostic) {
        diagnostic.push(`query_plan:${result.queryPlanDiagnostic}`);
      }
      for (const candidate of result.candidates ?? []) {
        diagnostic.push([
          "candidate",
          candidate.rank,
          candidate.chunkId,
          `page=${candidate.page ?? ""}`,
          `section=${candidate.sectionPath ?? ""}`,
          `lexical=${candidate.lexicalScore ?? ""}`,
          `fts=${candidate.ftsScore ?? ""}`,
          `distinctive=${candidate.distinctiveTermScore ?? ""}`,
          `fallback=${candidate.fallbackScore ?? ""}`,
          `semantic=${candidate.semanticScore ?? ""}`,
          `fusion=${candidate.fusionScore ?? candidate.combinedScore}`,
          `rerank=${candidate.rerankScore ?? ""}`,
          `combined=${candidate.combinedScore}`,
          `threshold=${candidate.threshold}`,
          candidate.selected ? "selected" : "rejected",
          candidate.rejectionReason ?? "",
        ].join(":"));
      }
      const userLimitations: string[] = [];
      if (!embeddings) {
        userLimitations.push("Keyword search is being used for this answer.");
        diagnostic.push("semantic_embeddings_not_configured");
      } else if (!hybrid && (result.vectorAttempted ?? false)) {
        userLimitations.push("Similarity search did not add extra sources; keyword matches were used.");
      }

      return {
        evidence,
        limitations: userLimitations,
        diagnosticLimitations: diagnostic,
        retrievalMode: hybrid ? "hybrid" : embeddings ? "lexical" : "lexical_fallback",
        semanticConfigured,
        ingestionState,
      };
}
