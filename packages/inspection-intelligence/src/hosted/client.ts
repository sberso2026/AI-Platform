/**
 * Minimal database port for hosted Inspection Intelligence persistence.
 * Compatible with the Supabase query builder used by Platform / Engineering OS.
 * Domain engine stays independent of transport.
 */

export type InspectionDbError = { message: string; code?: string } | null;

export type InspectionDbRow = Record<string, unknown>;

export interface InspectionQueryBuilder {
  select(columns?: string): InspectionQueryBuilder;
  insert(values: InspectionDbRow | InspectionDbRow[]): InspectionQueryBuilder;
  update(values: InspectionDbRow): InspectionQueryBuilder;
  eq(column: string, value: unknown): InspectionQueryBuilder;
  is(column: string, value: null): InspectionQueryBuilder;
  maybeSingle(): Promise<{ data: InspectionDbRow | null; error: InspectionDbError }>;
  single(): Promise<{ data: InspectionDbRow | null; error: InspectionDbError }>;
  then<TResult1 = { data: InspectionDbRow[] | null; error: InspectionDbError }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: InspectionDbRow[] | null; error: InspectionDbError }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2>;
}

export interface InspectionDbClient {
  from(table: string): InspectionQueryBuilder;
}

export type HostedInspectionContext = {
  tenantId: string;
  workspaceId: string;
  actorUserId: string;
  /** When set, records must couple to this project via InspectionTarget. */
  projectId?: string;
};

export type InspectionAuditPort = {
  log(input: {
    action: string;
    resourceType: string;
    resourceId: string;
    metadata?: Record<string, unknown>;
  }): Promise<void>;
};

export const INSPECTION_HOSTED_TABLE_MAPPING = {
  plans: "inspection_plans",
  templates: "inspection_templates",
  templateVersions: "inspection_template_versions",
  sessions: "inspection_sessions",
  observations: "inspection_observations",
  measurements: "inspection_measurements",
  evidence: "inspection_evidence",
  targets: "inspection_targets",
  defects: "inspection_defects",
  recommendations: "inspection_recommendations",
  correctiveActions: "inspection_corrective_actions",
  assessments: "inspection_assessments",
  verifications: "inspection_verifications",
  conditionRatings: "inspection_condition_ratings",
  events: "inspection_events",
  approvals: "inspection_approvals",
  reportingOutputs: "inspection_reporting_outputs",
} as const;

export function rejectCallerTenantOverride(
  context: HostedInspectionContext,
  suppliedTenantId: unknown,
): void {
  if (suppliedTenantId != null && String(suppliedTenantId) !== context.tenantId) {
    throw new Error("caller_tenant_override_forbidden");
  }
}

export function notFound(kind: string): never {
  throw new Error(`${kind}_not_found`);
}
