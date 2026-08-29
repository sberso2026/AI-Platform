import { ProjectIntelligenceError, type ProjectIntelligenceErrorCode } from "../domain/errors";

export type CommandCentreErrorCode = Extract<
  ProjectIntelligenceErrorCode,
  "project_not_found" | "project_forbidden" | "core_source_failed" | "project_intelligence_access_denied"
>;

export class CommandCentreError extends ProjectIntelligenceError {
  constructor(
    code: CommandCentreErrorCode,
    message: string,
    statusCode: number,
    details: Record<string, unknown> = {},
  ) {
    super(code, message, statusCode, details);
  }
}

export function commandCentreNotFound(projectId: string): CommandCentreError {
  return new CommandCentreError("project_not_found", "Project not found", 404, { projectId });
}

export function commandCentreForbidden(projectId: string, reason: string): CommandCentreError {
  return new CommandCentreError("project_forbidden", "Project access denied", 403, {
    projectId,
    reason,
  });
}

export function commandCentreCoreFailed(projectId: string, cause: string): CommandCentreError {
  return new CommandCentreError("core_source_failed", "Engineering Core project access failed", 502, {
    projectId,
    cause,
  });
}
