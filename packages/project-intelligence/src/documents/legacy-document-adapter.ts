/**
 * Temporary read-only equivalence adapter for frozen standalone PI documents.
 * Not a permanent production runtime dependency.
 */
export interface LegacyDocumentRecord {
  legacyDocumentId: string;
  title: string;
  revision: string;
  mimeType?: string;
  processingStatus?: string;
}

export interface LegacyChunkRecord {
  legacyChunkId: string;
  legacyDocumentId: string;
  content: string;
  page?: number;
  section?: string;
}

export interface LegacyFindingRecord {
  legacyFindingId: string;
  legacyDocumentId: string;
  findingType: string;
  title: string;
}

export interface LegacyAnswerEquivalenceSample {
  query: string;
  answerStatus: string;
  citationCount: number;
  abstained: boolean;
}

export interface LegacyDocumentAdapterRequest {
  correlationId: string;
  timeoutMs: number;
}

export interface ProjectIntelligenceLegacyDocumentAdapter {
  availability(request: LegacyDocumentAdapterRequest): Promise<{ available: boolean; reason?: string; correlationId: string }>;
  listDocuments(request: LegacyDocumentAdapterRequest): Promise<readonly LegacyDocumentRecord[]>;
  listChunks(request: LegacyDocumentAdapterRequest & { legacyDocumentId: string }): Promise<readonly LegacyChunkRecord[]>;
  listFindings(request: LegacyDocumentAdapterRequest & { legacyDocumentId: string }): Promise<readonly LegacyFindingRecord[]>;
  sampleAnswers(request: LegacyDocumentAdapterRequest): Promise<readonly LegacyAnswerEquivalenceSample[]>;
}

export class UnavailableLegacyDocumentAdapter implements ProjectIntelligenceLegacyDocumentAdapter {
  constructor(private readonly reason = "Legacy document intelligence source is not configured") {}

  async availability(request: LegacyDocumentAdapterRequest) {
    return { available: false, reason: this.reason, correlationId: request.correlationId };
  }

  async listDocuments(request: LegacyDocumentAdapterRequest): Promise<readonly LegacyDocumentRecord[]> {
    const status = await this.availability(request);
    throw new Error(`${status.reason}; correlationId=${status.correlationId}`);
  }

  async listChunks(request: LegacyDocumentAdapterRequest & { legacyDocumentId: string }): Promise<readonly LegacyChunkRecord[]> {
    const status = await this.availability(request);
    throw new Error(`${status.reason}; document=${request.legacyDocumentId}; correlationId=${status.correlationId}`);
  }

  async listFindings(request: LegacyDocumentAdapterRequest & { legacyDocumentId: string }): Promise<readonly LegacyFindingRecord[]> {
    const status = await this.availability(request);
    throw new Error(`${status.reason}; document=${request.legacyDocumentId}; correlationId=${status.correlationId}`);
  }

  async sampleAnswers(request: LegacyDocumentAdapterRequest): Promise<readonly LegacyAnswerEquivalenceSample[]> {
    const status = await this.availability(request);
    throw new Error(`${status.reason}; correlationId=${status.correlationId}`);
  }
}

export function createLegacyDocumentAdapter(
  adapter?: ProjectIntelligenceLegacyDocumentAdapter,
): ProjectIntelligenceLegacyDocumentAdapter {
  return adapter ?? new UnavailableLegacyDocumentAdapter();
}
