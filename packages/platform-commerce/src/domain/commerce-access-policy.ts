/** Typed commerce access policy for route and service enforcement. */

export type CommerceCachePolicy = "allow-short-cache" | "fresh";

export interface CommerceAccessPolicy {
  productKey: string;
  applicationKey?: string;
  featureKey?: string;
  action: string;
  seatRequired?: boolean;
  workspaceRequired?: boolean;
  cachePolicy?: CommerceCachePolicy;
  hideResourceExistence?: boolean;
}

export const ENGINEERING_PRODUCT = "engineering-os";

/** Engineering API route key → entitlement policy */
export const ENGINEERING_API_POLICIES: Record<string, CommerceAccessPolicy> = {
  "health.read": { productKey: ENGINEERING_PRODUCT, action: "health.read", seatRequired: false },
  "dashboard.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "dashboard.read", seatRequired: true },
  "projects.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "project.read", seatRequired: true },
  "projects.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "project.create", seatRequired: true, cachePolicy: "fresh" },
  "documents.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "documents", action: "document.read", seatRequired: true },
  "documents.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "documents", action: "document.write", seatRequired: true, cachePolicy: "fresh" },
  "assets.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "asset.read", seatRequired: true },
  "assets.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "asset.write", seatRequired: true, cachePolicy: "fresh" },
  "companies.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "company.read", seatRequired: true },
  "disciplines.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "discipline.read", seatRequired: true },
  "decisions.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "decision.read", seatRequired: true },
  "decisions.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "decision.write", seatRequired: true, cachePolicy: "fresh" },
  "risks.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "risk.read", seatRequired: true },
  "risks.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "risk.write", seatRequired: true, cachePolicy: "fresh" },
  "issues.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "issue.read", seatRequired: true },
  "issues.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "issue.write", seatRequired: true, cachePolicy: "fresh" },
  "actions.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_controls", action: "action.read", seatRequired: true },
  "actions.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_controls", action: "action.write", seatRequired: true, cachePolicy: "fresh" },
  "lessons.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "knowledge", action: "lesson.read", seatRequired: true },
  "lessons.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "knowledge", action: "lesson.write", seatRequired: true, cachePolicy: "fresh" },
  "technical-queries.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "technical_query.read", seatRequired: true },
  "technical-queries.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "technical_query.write", seatRequired: true, cachePolicy: "fresh" },
  "timeline.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "timeline.read", seatRequired: true },
  "activity.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "activity.read", seatRequired: true },
  "search.read": { productKey: ENGINEERING_PRODUCT, action: "search.read", seatRequired: true },
  "ai.read": { productKey: ENGINEERING_PRODUCT, featureKey: "ai_assistant", action: "ai.execute", seatRequired: true },
  "ai.write": { productKey: ENGINEERING_PRODUCT, featureKey: "ai_assistant", action: "ai.execute", seatRequired: true, cachePolicy: "fresh" },
  "settings.read": { productKey: ENGINEERING_PRODUCT, action: "settings.read", seatRequired: true },
  "settings.write": { productKey: ENGINEERING_PRODUCT, action: "settings.write", seatRequired: true, cachePolicy: "fresh" },
  "applications.read": { productKey: ENGINEERING_PRODUCT, action: "application.list", seatRequired: true },
  "demo.read": { productKey: ENGINEERING_PRODUCT, action: "demo.read", seatRequired: true },
  "demo.write": { productKey: ENGINEERING_PRODUCT, action: "demo.admin", seatRequired: true, cachePolicy: "fresh" },
  "project-intelligence-mappings.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "mapping.read", seatRequired: true, workspaceRequired: true },
  "project-intelligence-mappings.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "mapping.write", seatRequired: true, workspaceRequired: true, cachePolicy: "fresh" },
  "project-intelligence-health.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "health.read", seatRequired: true, workspaceRequired: true },
  "project-intelligence-ai-summary.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", featureKey: "ai_assistant", action: "ai.execute", seatRequired: true, workspaceRequired: true, cachePolicy: "fresh" },
  "project-intelligence-documents.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "document.intelligence.read", seatRequired: true, workspaceRequired: true },
  "project-intelligence-documents.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "document.intelligence.write", seatRequired: true, workspaceRequired: true, cachePolicy: "fresh" },
  "project-intelligence-meetings.read": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "meeting.intelligence.read", seatRequired: true, workspaceRequired: true },
  "project-intelligence-meetings.write": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "meeting.intelligence.write", seatRequired: true, workspaceRequired: true, cachePolicy: "fresh" },
};

/** Page route application guards */
export const ENGINEERING_PAGE_POLICIES: Record<string, CommerceAccessPolicy> = {
  "/engineering": { productKey: ENGINEERING_PRODUCT, action: "access", seatRequired: true },
  "/engineering/projects": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/documents": { productKey: ENGINEERING_PRODUCT, applicationKey: "documents", action: "access", seatRequired: true },
  "/engineering/inspection": { productKey: ENGINEERING_PRODUCT, applicationKey: "inspection_intelligence", action: "access", seatRequired: true },
  "/engineering/project-controls": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_controls", action: "access", seatRequired: true },
  "/engineering/meetings": { productKey: ENGINEERING_PRODUCT, applicationKey: "meetings", action: "access", seatRequired: true },
  "/engineering/structural-intelligence": { productKey: ENGINEERING_PRODUCT, applicationKey: "structural_intelligence", action: "access", seatRequired: true },
  "/engineering/knowledge": { productKey: ENGINEERING_PRODUCT, applicationKey: "knowledge", action: "access", seatRequired: true },
  "/engineering/reports": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "report.access", seatRequired: true },
  "/engineering/ai": { productKey: ENGINEERING_PRODUCT, featureKey: "ai_assistant", action: "access", seatRequired: true },
  "/engineering/assets": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/settings": { productKey: ENGINEERING_PRODUCT, action: "access", seatRequired: true },
  "/engineering/actions": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_controls", action: "access", seatRequired: true },
  "/engineering/decisions": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/risks": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/issues": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/lessons": { productKey: ENGINEERING_PRODUCT, applicationKey: "knowledge", action: "access", seatRequired: true },
  "/engineering/technical-queries": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/timeline": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/activity": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/companies": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/disciplines": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true },
  "/engineering/search": { productKey: ENGINEERING_PRODUCT, action: "access", seatRequired: true },
  "/engineering/apps/project-intelligence": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "access", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/migration": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "migration.access", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/health": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "health.read", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/settings": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "settings.read", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/documents": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "document.intelligence.read", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/documents/query": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "document.intelligence.read", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/documents/review": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "document.intelligence.read", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/documents/health": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "document.intelligence.read", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/meetings": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "meeting.intelligence.read", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/meetings/new": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "meeting.intelligence.write", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/meetings/health": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "meeting.intelligence.read", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/meetings/[meetingId]/review": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "meeting.intelligence.write", seatRequired: true, workspaceRequired: true },
  "/engineering/apps/project-intelligence/meetings/[meetingId]/minutes": { productKey: ENGINEERING_PRODUCT, applicationKey: "project_intelligence", action: "meeting.intelligence.write", seatRequired: true, workspaceRequired: true },
};

export function resolveApiPolicyKey(segment: string, method: string): string {
  const write = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
  const suffix = write ? "write" : "read";
  return `${segment}.${suffix}`;
}

export function getEngineeringApiPolicy(segment: string, method: string): CommerceAccessPolicy {
  const write = method === "POST" || method === "PUT" || method === "PATCH" || method === "DELETE";
  const key = resolveApiPolicyKey(segment, method);
  const policy = ENGINEERING_API_POLICIES[key];
  if (policy) return policy;
  const fallbackKey = `${segment}.read`;
  if (ENGINEERING_API_POLICIES[fallbackKey]) return ENGINEERING_API_POLICIES[fallbackKey];
  return {
    productKey: ENGINEERING_PRODUCT,
    action: `${segment}.${method.toLowerCase()}`,
    seatRequired: true,
    cachePolicy: write ? "fresh" : "allow-short-cache",
  };
}
