export type ProjectIntelligenceErrorCode =
  | "project_intelligence_access_denied"
  | "project_intelligence_admin_required"
  | "project_intelligence_migration_access_denied"
  | "mapping_not_found"
  | "mapping_transition_invalid"
  | "mapping_conflict"
  | "legacy_source_unavailable"
  | "insufficient_evidence";

export class ProjectIntelligenceError extends Error {
  readonly name = "ProjectIntelligenceError";

  constructor(
    readonly code: ProjectIntelligenceErrorCode,
    message: string,
    readonly statusCode: number,
    readonly details: Record<string, unknown> = {},
  ) {
    super(message);
  }

  toEnvelope(): { error: { code: ProjectIntelligenceErrorCode; message: string; details: Record<string, unknown> } } {
    return { error: { code: this.code, message: this.message, details: this.details } };
  }
}
