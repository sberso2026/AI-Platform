export type ProjectIntelligenceErrorCode =
  | "project_intelligence_access_denied"
  /** The Project Intelligence application is not installed for this entitlement scope. */
  | "project_intelligence_not_installed"
  /** The entitlement licence is inactive, expired, revoked, or missing. */
  | "licence_suspended"
  /** The authenticated principal has no required Project Intelligence seat. */
  | "seat_not_assigned"
  /** The selected workspace is not assigned to Project Intelligence. */
  | "workspace_not_assigned"
  | "project_intelligence_admin_required"
  | "project_intelligence_migration_access_denied"
  | "mapping_not_found"
  | "mapping_transition_invalid"
  | "mapping_conflict"
  | "legacy_source_unavailable"
  | "insufficient_evidence"
  | "project_not_found"
  | "project_forbidden"
  | "core_source_failed";

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
