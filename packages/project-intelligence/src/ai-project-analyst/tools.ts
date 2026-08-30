import type { ProjectHealthEvidenceReference } from "../project-health/types";
import type { AnalystCitation, PiAnalystPlatformToolKey } from "./types";
import { PI_ANALYST_PLATFORM_TOOL_KEYS } from "./types";

export const PI_ANALYST_PLATFORM_TOOLS: readonly {
  toolKey: PiAnalystPlatformToolKey;
  name: string;
  category: "read";
  riskLevel: "low";
  mutates: false;
}[] = [
  { toolKey: "project_intelligence.get_project_health", name: "Get project health", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "project_intelligence.get_schedule_intelligence", name: "Get schedule intelligence", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "project_intelligence.get_cost_progress_intelligence", name: "Get cost and progress intelligence", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "project_intelligence.get_risk_change_intelligence", name: "Get risk and change intelligence", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "project_intelligence.get_query_decision_intelligence", name: "Get query, decision, and action intelligence", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "project_intelligence.get_forecast_intelligence", name: "Get forecast intelligence", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "project_intelligence.get_project_evidence", name: "Get project evidence references", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "project_intelligence.get_connector_context", name: "Get project-bound connector context", category: "read", riskLevel: "low", mutates: false },
] as const;

export function listPiAnalystPlatformTools() {
  return PI_ANALYST_PLATFORM_TOOLS;
}

export function isPiAnalystPlatformToolKey(value: string): value is PiAnalystPlatformToolKey {
  return (PI_ANALYST_PLATFORM_TOOL_KEYS as readonly string[]).includes(value);
}

export function citationFromEvidence(
  ref: ProjectHealthEvidenceReference,
  label?: string,
): AnalystCitation {
  return {
    sourceDomain: ref.sourceDomain,
    entityType: ref.entityType,
    entityId: ref.entityId,
    asOf: ref.sourceTimestamp,
    label: label ?? `${ref.entityType} ${ref.entityId}`,
    storesCanonicalCopy: false,
  };
}

export function sectionCitation(source: string, entityType: string, entityId: string, asOf?: string, label?: string): AnalystCitation {
  return {
    sourceDomain: source,
    entityType,
    entityId,
    asOf,
    label: label ?? `${entityType} ${entityId}`,
    storesCanonicalCopy: false,
  };
}
