export const PROJECT_INTELLIGENCE_EVENT_TYPES = [
  "project_intelligence.mapping.candidate_created",
  "project_intelligence.mapping.discovered",
  "project_intelligence.mapping.approved",
  "project_intelligence.mapping.rejected",
  "project_intelligence.mapping.conflict_detected",
  "project_intelligence.mapping.deferred",
  "project_intelligence.migration.completed",
  "project_intelligence.sync.failed",
] as const;

export type ProjectIntelligenceEventType = (typeof PROJECT_INTELLIGENCE_EVENT_TYPES)[number];

export function projectIntelligenceEventId(input: {
  eventType: ProjectIntelligenceEventType;
  mappingId: string;
  operationId: string;
}): string {
  return `${input.eventType}:${input.mappingId}:${input.operationId}`;
}
