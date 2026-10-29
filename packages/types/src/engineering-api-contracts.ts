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
    path: "/api/engineering/assumptions",
    description: "List or get engineering assumptions",
    query: { projectId: "uuid?", id: "uuid?" },
    response: "{ data: EngineeringAssumption[] | { assumption, links } }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/assumptions",
    description: "Create assumption, validate, or link with governed relation",
    body: { title: "string", statement: "string", action: "validate?|link?" },
    response: "{ data: EngineeringAssumption }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/systems",
    description: "List or get engineering systems; optional projectId filter",
    query: { projectId: "uuid?", id: "uuid?" },
    response: "{ data: EngineeringSystem[] | { system, children, assets, interfaces } }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/systems",
    description: "Create system, set parent, or link/unlink asset",
    body: { name: "string", action: "set_parent?|link_asset?|unlink_asset?" },
    response: "{ data: EngineeringSystem }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/interfaces",
    description: "List or get engineering interfaces",
    query: { projectId: "uuid?", id: "uuid?" },
    response: "{ data: EngineeringInterface[] | { interface, endpoints } }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/interfaces",
    description: "Create interface or add/remove CONNECTS endpoints",
    body: { name: "string", interfaceType: "string", action: "add_endpoint?|remove_endpoint?|set_status?" },
    response: "{ data: EngineeringInterface }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/requirements",
    description: "List or get engineering requirements; optional projectId filter",
    query: { projectId: "uuid?", id: "uuid?" },
    response: "{ data: EngineeringRequirement[] | { requirement, allocations } }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/requirements",
    description: "Create requirement, allocate, or link assumption/evidence",
    body: { title: "string", statement: "string", requirementType: "string", action: "allocate?|unallocate?|link_assumption?" },
    response: "{ data: EngineeringRequirement }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/changes",
    description: "List or get engineering changes",
    query: { projectId: "uuid?", id: "uuid?" },
    response: "{ data: EngineeringChange[] | { change, affected, impacts } }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/changes",
    description: "Create change or link/unlink affected objects",
    body: { title: "string", changeType: "string", action: "link_affected?|unlink_affected?|discover_impacts?" },
    response: "{ data: EngineeringChange }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/impacts",
    description: "List or get engineering impacts; optional candidate discovery via changeId",
    query: { projectId: "uuid?", id: "uuid?", changeId: "uuid?" },
    response: "{ data: EngineeringImpact[] | ImpactCandidate[] }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/impacts",
    description: "Create impact, confirm/reject candidate, or link cause/affected object",
    body: { title: "string", impactType: "string", action: "confirm?|reject?|link_cause?" },
    response: "{ data: EngineeringImpact }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/configuration",
    description: "List or get configuration baselines; optional compareLeft/compareRight",
    query: { projectId: "uuid?", id: "uuid?", compareLeft: "uuid?", compareRight: "uuid?" },
    response: "{ data: EngineeringConfigurationBaseline[] | { baseline, items } }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/configuration",
    description: "Create baseline, add/remove item, freeze, or supersede",
    body: { name: "string", baselineType: "string", action: "add_item?|freeze?|supersede?" },
    response: "{ data: EngineeringConfigurationBaseline }",
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
    path: "/api/engineering/optimization",
    description: "List or get optimization studies/runs; preflight, feasibility, Pareto",
    query: { projectId: "uuid?", id: "uuid?", runId: "uuid?", action: "preflight?|pareto?|feasibility?" },
    response: "{ data: OptimizationStudy[] | study detail | ParetoResult[] }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/optimization",
    description: "Create study/objectives/constraints/variables/scenarios/alternatives/runs or ingest trusted results",
    body: { title: "string", action: "set_context?|set_scope?|add_objective?|queue_run?|ingest_results?" },
    response: "{ data: OptimizationStudy | OptimizationRun }",
    auth: "session",
  },
  {
    method: "GET",
    path: "/api/engineering/analysis",
    description: "List or get Engineering Analysis Requests; preflight, result, explainability",
    query: { projectId: "uuid?", id: "uuid?", action: "preflight?|result?" },
    response: "{ data: EngineeringAnalysisRequest[] | request detail | AnalysisExplainability }",
    auth: "session",
  },
  {
    method: "POST",
    path: "/api/engineering/analysis",
    description: "Create analysis request, execution plan, queue, cancel, review, accept/reject",
    body: { discipline: "string", capability: "string", action: "preflight?|plan?|queue?|cancel?|accept?|reject?|review?" },
    response: "{ data: EngineeringAnalysisRequest | AnalysisExecutionPlan | queue result }",
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
