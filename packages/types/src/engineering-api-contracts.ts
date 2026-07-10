/**
 * Engineering OS REST API contracts (Batch 2.06)
 * Stable integration surface for Project Intelligence and external apps.
 */

export const ENGINEERING_API_VERSION = "2.06" as const;

export type EngineeringApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface EngineeringApiEndpoint {
  method: EngineeringApiMethod;
  path: string;
  description: string;
  query?: Record<string, string>;
  body?: Record<string, unknown>;
  response: string;
  auth: "session" | "service";
}

export const ENGINEERING_API_ENDPOINTS: EngineeringApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/engineering/projects",
    description: "List engineering projects for tenant",
    response: "{ data: EngineeringProject[] }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/projects",
    description: "Create engineering project",
    body: { projectCode: "string", projectName: "string", metadata: "object?" },
    response: "{ data: EngineeringProject }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/decisions",
    description: "List decisions; optional projectId filter",
    query: { projectId: "uuid?" },
    response: "{ data: EngineeringDecision[] }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/decisions",
    description: "Create decision (approval_status=pending) or approve",
    body: { title: "string", action: "approve?", id: "uuid?" },
    response: "{ data: EngineeringDecision }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/actions",
    description: "List engineering actions",
    response: "{ data: EngineeringAction[] }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/actions",
    description: "Create action",
    body: { title: "string", dueDate: "date?", projectId: "uuid?" },
    response: "{ data: EngineeringAction }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/risks",
    description: "List risks or matrix view",
    query: { view: "matrix?" },
    response: "{ data: EngineeringRisk[] | { risks, cells } }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/risks",
    description: "Create risk",
    body: { title: "string", probability: "1-5", consequence: "1-5" },
    response: "{ data: EngineeringRisk }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/issues",
    description: "List engineering issues",
    response: "{ data: EngineeringIssue[] }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/issues",
    description: "Create issue or promote to decision",
    body: { title: "string", action: "promote_to_decision?", id: "uuid?" },
    response: "{ data: EngineeringIssue | EngineeringDecision }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/technical-queries",
    description: "List technical queries",
    response: "{ data: EngineeringTechnicalQuery[] }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/technical-queries",
    description: "Create technical query",
    body: { question: "string", responseDue: "date?", projectId: "uuid?" },
    response: "{ data: EngineeringTechnicalQuery }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/lessons",
    description: "List lessons learned",
    response: "{ data: EngineeringLesson[] }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/lessons",
    description: "Capture lesson learned",
    body: { title: "string", lesson: "string", recommendation: "string?" },
    response: "{ data: EngineeringLesson }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/timeline",
    description: "Aggregated engineering timeline",
    query: { projectId: "uuid?" },
    response: "{ data: EngineeringTimelineEvent[] }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/activity",
    description: "Engineering activity feed",
    query: { projectId: "uuid?" },
    response: "{ data: EngineeringActivityEvent[] }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/health",
    description: "Engineering OS health check",
    response: "{ data: EngineeringHealthReport }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/demo/seed",
    description: "Seed tenant-scoped demo data (metadata.demo=true)",
    response: "{ data: DemoSeedResult }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/demo/reset",
    description: "Reset demo data only — never deletes non-demo records",
    response: "{ data: DemoResetResult }",
    auth: "session",
  },
];

export interface EngineeringApiError {
  error: string;
  status: 401 | 403 | 404 | 500;
}

export const DEMO_METADATA_MARKER = { demo: true, seed_batch: "2.06" } as const;

export function isDemoMetadata(metadata: Record<string, unknown> | null | undefined): boolean {
  return metadata?.demo === true;
}
