export interface LegacySourceAvailability {
  available: boolean;
  checkedAt: string;
  correlationId: string;
  reason?: string;
}
export interface LegacySourceRequest { correlationId: string; timeoutMs: number }
export interface LegacyProjectIntelligenceSourceAdapter {
  availability(request: LegacySourceRequest): Promise<LegacySourceAvailability>;
  listProjects(request: LegacySourceRequest): Promise<readonly { id: string; name: string }[]>;
}

export class UnavailableLegacySourceAdapter implements LegacyProjectIntelligenceSourceAdapter {
  constructor(private readonly reason = "Legacy Project Intelligence source is not configured") {}
  async availability(request: LegacySourceRequest): Promise<LegacySourceAvailability> {
    return { available: false, checkedAt: new Date().toISOString(), correlationId: request.correlationId, reason: this.reason };
  }
  async listProjects(request: LegacySourceRequest): Promise<readonly { id: string; name: string }[]> {
    const status = await this.availability(request);
    throw new Error(`${status.reason}; correlationId=${status.correlationId}; timeoutMs=${request.timeoutMs}`);
  }
}

export function createLegacySourceAdapter(adapter?: LegacyProjectIntelligenceSourceAdapter): LegacyProjectIntelligenceSourceAdapter {
  return adapter ?? new UnavailableLegacySourceAdapter();
}
