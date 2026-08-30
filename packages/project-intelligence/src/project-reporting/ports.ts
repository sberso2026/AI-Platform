import { ProjectIntelligenceError } from "../domain/errors";

export function reportWriteForbidden(): never {
  throw new ProjectIntelligenceError(
    "project_intelligence_access_denied",
    "Project Reporting Intelligence is read-only. External writes and approvals are forbidden.",
    403,
    { code: "connector_write_forbidden", reason: "report_write_forbidden" },
  );
}

export function writeProjectReport(): never {
  return reportWriteForbidden();
}

export function approveFromReport(): never {
  throw new ProjectIntelligenceError(
    "project_intelligence_access_denied",
    "Project reports cannot approve risks, variations, schedules, cost, or actions.",
    403,
    { reason: "autonomous_approval_forbidden" },
  );
}
