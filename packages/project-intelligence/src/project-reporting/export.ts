import type { ProjectReportSnapshot } from "./types";

/**
 * Text export of a frozen snapshot. Platform has PDF ingest, not PDF generation.
 * Do not introduce a general-purpose document renderer for PI-9.
 */
export function exportProjectReportMarkdown(snapshot: ProjectReportSnapshot): string {
  const lines: string[] = [
    `# ${snapshot.reportType.replace(/_/g, " ")}`,
    "",
    `- Project: ${snapshot.projectCode} — ${snapshot.projectName} (${snapshot.projectId})`,
    `- Tenant: ${snapshot.tenantId}`,
    `- Workspace: ${snapshot.workspaceId}`,
    `- Generated at: ${snapshot.generatedAt}`,
    `- Snapshot: ${snapshot.snapshotId}`,
    `- Overall health: ${snapshot.overallHealth}`,
    `- Advisory / read-only: yes`,
    `- Persisted: no`,
    "",
    "## Limitations",
    ...snapshot.limitations.map((item) => `- ${item}`),
    "",
  ];

  for (const section of snapshot.sections) {
    lines.push(`## ${section.title}`);
    lines.push(`Source: ${section.sourceClassification}. State: ${section.state}. Availability: ${section.availability}.`);
    if (section.freshness) lines.push(`Freshness: ${section.freshness}.`);
    lines.push("");
    lines.push(section.body);
    lines.push("");
    if (section.evidence.length) {
      lines.push("Evidence:");
      for (const ref of section.evidence) {
        lines.push(`- ${ref.sourceDomain}:${ref.entityType}:${ref.entityId}`);
      }
      lines.push("");
    }
    if (section.limitations.length) {
      lines.push("Section limitations:");
      for (const item of section.limitations) lines.push(`- ${item}`);
      lines.push("");
    }
  }

  if (snapshot.narrative.available && snapshot.narrative.text) {
    lines.push("## AI narrative (AI_SUMMARY, not canonical)");
    lines.push(`Provider: ${snapshot.narrative.provider ?? "unspecified"}. Model: ${snapshot.narrative.model ?? "unspecified"}.`);
    lines.push("");
    lines.push(snapshot.narrative.text);
    lines.push("");
  } else {
    lines.push("## AI narrative");
    lines.push(`Unavailable (${snapshot.narrative.skippedReason ?? "not_attached"}). Deterministic report remains available.`);
    lines.push("");
  }

  return lines.join("\n");
}
