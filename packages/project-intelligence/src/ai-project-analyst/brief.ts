import { ANALYST_KNOWN_LIMITATIONS } from "./capability";
import type { AnalystBrief, AnalystContext } from "./types";
import { unknownOrUnavailable } from "./context";

function sectionLine(label: string, section: AnalystContext["schedule"]): string {
  if (unknownOrUnavailable(section)) {
    return `${label}: ${section.state} / ${section.availability}. ${section.summary} Evidence is insufficient for a stronger statement.`;
  }
  return `${label}: ${section.summary}`;
}

export function buildManagementBrief(context: AnalystContext): AnalystBrief {
  const missingOrStale = [
    context.schedule,
    context.cost,
    context.progress,
    context.risk,
    context.change,
    context.queries,
    context.decisions,
    context.actions,
    context.forecast,
  ]
    .filter(unknownOrUnavailable)
    .map((section) => `${section.id}: ${section.availability}/${section.state}`);

  return {
    executiveStatus: `${context.project.projectCode} — ${context.project.projectName}. ${context.health.summary}`,
    topAttention: context.attention.length
      ? context.attention.slice(0, 8).map((item) => `${item.severity.toUpperCase()} · ${item.reasonCode}: ${item.explanation}`)
      : ["No RED/AMBER attention items are currently published."],
    schedule: sectionLine("Schedule", context.schedule),
    costProgress: `${sectionLine("Cost", context.cost)} ${sectionLine("Progress", context.progress)}`,
    riskChange: `${sectionLine("Risk", context.risk)} ${sectionLine("Change", context.change)}`,
    queriesDecisionsActions: `${sectionLine("Queries", context.queries)} ${sectionLine("Decisions", context.decisions)} ${sectionLine("Actions", context.actions)}`,
    forecast: sectionLine("Forecast", context.forecast),
    missingOrStale: missingOrStale.length ? missingOrStale : ["No additional missing or stale sections were flagged beyond published limitations."],
    evidence: [
      ...context.health.evidence,
      ...context.schedule.evidence,
      ...context.forecast.evidence,
    ].slice(0, 12),
    limitations: [...context.limitations, ...ANALYST_KNOWN_LIMITATIONS].slice(0, 12),
    advisory: true,
  };
}
