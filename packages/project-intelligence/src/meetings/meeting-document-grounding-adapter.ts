import type { DocumentCitation } from "../documents/types";

export type MeetingGroundingAuth = {
  tenantId: string;
  workspaceId: string;
  engineeringProjectId: string | null;
  allowedProjectIds: readonly string[];
  authorized: boolean;
};

export type MeetingGroundingQuery = {
  query: string;
  limit?: number;
};

export type MeetingGroundingResult = {
  citations: DocumentCitation[];
  retrievalTraceId: string;
  abstained: boolean;
  abstentionReason: string | null;
  maxScore: number;
};

export type DocumentRetrievalPort = {
  retrieve: (
    auth: {
      tenantId: string;
      workspaceId: string;
      allowedProjectIds: readonly string[];
      authorized: boolean;
    },
    request: {
      query: string;
      filters?: {
        engineeringProjectIds?: readonly string[];
      };
      limit?: number;
    },
  ) => Promise<{
    citations: readonly DocumentCitation[];
    retrievalTraceId: string;
    maxScore: number;
  }>;
};

/**
 * Typed adapter around Document Intelligence retrieval.
 * Does not modify DI baseline behaviour; fails closed when retrieval is not configured.
 */
export class MeetingDocumentGroundingAdapter {
  constructor(private readonly retrieval: DocumentRetrievalPort | null = null) {}

  async groundClaim(
    auth: MeetingGroundingAuth,
    request: MeetingGroundingQuery,
  ): Promise<MeetingGroundingResult> {
    if (!this.retrieval) {
      return {
        citations: [],
        retrievalTraceId: `abstain-unconfigured-${Date.now().toString(36)}`,
        abstained: true,
        abstentionReason: "document_retrieval_adapter_not_configured",
        maxScore: 0,
      };
    }

    if (!auth.authorized) {
      return {
        citations: [],
        retrievalTraceId: `abstain-unauthorized-${Date.now().toString(36)}`,
        abstained: true,
        abstentionReason: "document_access_denied",
        maxScore: 0,
      };
    }

    const projectIds = auth.engineeringProjectId
      ? auth.allowedProjectIds.filter((id) => id === auth.engineeringProjectId)
      : [...auth.allowedProjectIds];

    if (auth.engineeringProjectId && !projectIds.includes(auth.engineeringProjectId)) {
      return {
        citations: [],
        retrievalTraceId: `abstain-scope-${Date.now().toString(36)}`,
        abstained: true,
        abstentionReason: "project_scope_mismatch",
        maxScore: 0,
      };
    }

    const result = await this.retrieval.retrieve(
      {
        tenantId: auth.tenantId,
        workspaceId: auth.workspaceId,
        allowedProjectIds: projectIds.length ? projectIds : auth.allowedProjectIds,
        authorized: auth.authorized,
      },
      {
        query: request.query,
        limit: request.limit ?? 5,
        filters: projectIds.length ? { engineeringProjectIds: projectIds } : undefined,
      },
    );

    const citations = result.citations.filter(isValidMeetingCitation);
    if (!citations.length) {
      return {
        citations: [],
        retrievalTraceId: result.retrievalTraceId,
        abstained: true,
        abstentionReason: "insufficient_document_evidence",
        maxScore: result.maxScore,
      };
    }

    return {
      citations,
      retrievalTraceId: result.retrievalTraceId,
      abstained: false,
      abstentionReason: null,
      maxScore: result.maxScore,
    };
  }
}

export function isValidMeetingCitation(citation: DocumentCitation): boolean {
  return Boolean(
    citation.engineeringDocumentId
      && citation.revision
      && citation.excerpt
      && citation.chunkId
      && typeof citation.evidenceScore === "number",
  );
}
