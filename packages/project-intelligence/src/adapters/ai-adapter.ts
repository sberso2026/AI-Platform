export interface ProjectStateEvidence { source: string; excerpt: string; confidence: number }
export interface AIDirectorPort {
  summarize(input: { promptVersion: string; evidence: readonly ProjectStateEvidence[]; correlationId: string }): Promise<{ summary: string; model: string; traceId: string }>;
}
export interface ProjectStateSummary {
  abstained: boolean;
  reason?: "insufficient_evidence";
  summary?: string;
  model?: string;
  promptVersion: string;
  traceId?: string;
  evidenceCount: number;
}

export class ProjectIntelligenceAIAdapter {
  constructor(private readonly director: AIDirectorPort, private readonly promptVersion = "project-state-v1") {}

  async summarizeMappedProjectState(evidence: readonly ProjectStateEvidence[], correlationId: string): Promise<ProjectStateSummary> {
    const sufficient = evidence.filter((item) => item.excerpt.trim().length > 0 && item.confidence >= 0.6);
    if (sufficient.length < 2) {
      return { abstained: true, reason: "insufficient_evidence", promptVersion: this.promptVersion, evidenceCount: sufficient.length };
    }
    const result = await this.director.summarize({ promptVersion: this.promptVersion, evidence: sufficient, correlationId });
    return { abstained: false, summary: result.summary, model: result.model, promptVersion: this.promptVersion, traceId: result.traceId, evidenceCount: sufficient.length };
  }
}
