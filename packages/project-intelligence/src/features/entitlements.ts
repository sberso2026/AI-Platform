/**
 * Phase 8B — Unified entitlement surface for Project Intelligence features.
 * Install, seat, workspace, and feature actions share one policy shape.
 */
import type { ProjectIntelligenceFeatureId } from "./registry";
import { PROJECT_INTELLIGENCE_MODULE_KEY } from "./registry";

export type ProjectIntelligenceEntitlementAction =
  | "access"
  | "document.intelligence.read"
  | "document.intelligence.write"
  | "meeting.intelligence.read"
  | "meeting.intelligence.write"
  | "findings.intelligence.read"
  | "reporting.intelligence.read"
  | "ai.execute"
  | "health.read"
  | "settings.read"
  | "migration.access";

export interface ProjectIntelligenceFeatureEntitlement {
  featureId: ProjectIntelligenceFeatureId | "module";
  moduleKey: typeof PROJECT_INTELLIGENCE_MODULE_KEY;
  /** Commerce application_key (install / seat binding). */
  applicationKey: typeof PROJECT_INTELLIGENCE_MODULE_KEY;
  action: ProjectIntelligenceEntitlementAction;
  seatRequired: true;
  workspaceRequired: true;
  /** Feature-level AI entitlement when applicable. */
  featureKey?: "ai_assistant";
}

export const PROJECT_INTELLIGENCE_FEATURE_ENTITLEMENTS: ProjectIntelligenceFeatureEntitlement[] = [
  {
    featureId: "module",
    moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    applicationKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    action: "access",
    seatRequired: true,
    workspaceRequired: true,
  },
  {
    featureId: "document_intelligence",
    moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    applicationKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    action: "document.intelligence.read",
    seatRequired: true,
    workspaceRequired: true,
  },
  {
    featureId: "meeting_intelligence",
    moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    applicationKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    action: "meeting.intelligence.read",
    seatRequired: true,
    workspaceRequired: true,
  },
  {
    featureId: "findings_intelligence",
    moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    applicationKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    action: "findings.intelligence.read",
    seatRequired: true,
    workspaceRequired: true,
  },
  {
    featureId: "reporting_intelligence",
    moduleKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    applicationKey: PROJECT_INTELLIGENCE_MODULE_KEY,
    action: "reporting.intelligence.read",
    seatRequired: true,
    workspaceRequired: true,
  },
];

export function listProjectIntelligenceEntitlements(): ProjectIntelligenceFeatureEntitlement[] {
  return PROJECT_INTELLIGENCE_FEATURE_ENTITLEMENTS;
}

export function assertUnifiedWorkspaceVisibility(): void {
  for (const row of PROJECT_INTELLIGENCE_FEATURE_ENTITLEMENTS) {
    if (!row.seatRequired || !row.workspaceRequired) {
      throw new Error(`Entitlement ${row.action} must require seat and workspace`);
    }
    if (row.applicationKey !== PROJECT_INTELLIGENCE_MODULE_KEY) {
      throw new Error(`Entitlement ${row.action} must bind to ${PROJECT_INTELLIGENCE_MODULE_KEY}`);
    }
  }
}
