import type { EngineerCitation, IiEngineerPlatformToolKey } from "./types";
import { II_ENGINEER_PLATFORM_TOOL_KEYS } from "./types";

export const II_ENGINEER_PLATFORM_TOOLS: readonly {
  toolKey: IiEngineerPlatformToolKey;
  name: string;
  category: "read";
  riskLevel: "low";
  mutates: false;
}[] = [
  { toolKey: "inspection_intelligence.get_inspection", name: "Get inspection plan/session identity", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_session", name: "Get inspection session workspace", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_target_history", name: "Get InspectionTarget history projection", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_defects", name: "Get inspection defects", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_condition_assessment", name: "Get condition assessments and ratings", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_evidence", name: "Get inspection evidence metadata", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_measurements", name: "Get inspection measurements", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_recommendations", name: "Get inspection recommendations", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_corrective_actions", name: "Get inspection corrective actions", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_verifications", name: "Get inspection verifications", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_report_snapshot", name: "Get deterministic report snapshot", category: "read", riskLevel: "low", mutates: false },
  { toolKey: "inspection_intelligence.get_deterministic_indicators", name: "Get deterministic inspection indicators", category: "read", riskLevel: "low", mutates: false },
] as const;

export function listIiEngineerPlatformTools() {
  return II_ENGINEER_PLATFORM_TOOLS;
}

export function isIiEngineerPlatformToolKey(value: string): value is IiEngineerPlatformToolKey {
  return (II_ENGINEER_PLATFORM_TOOL_KEYS as readonly string[]).includes(value);
}

export function cite(entityType: string, entityId: string, label?: string, asOf?: string): EngineerCitation {
  return {
    sourceDomain: "inspection_intelligence",
    entityType,
    entityId,
    asOf,
    label: label ?? `${entityType} ${entityId}`,
  };
}
