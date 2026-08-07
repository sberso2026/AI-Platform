/**
 * Phase 11B — project identity resolution port.
 *
 * Read-only by construction: the port exposes no write method, so a consumer
 * cannot mutate project identity even by accident. `engineering_projects` and
 * the batch_61 reference tables are the physical store; this port is the only
 * sanctioned read path.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  assertReferenceIsReadOnly,
  type ActivityReference,
  type EngineeringProjectPhaseCode,
  type EngineeringProjectStatus,
  type MilestoneReference,
  type PhaseReference,
  type ProjectReference,
  type ProjectScope,
  type SharedProjectDomainReference,
  type WbsReference,
  type WorkPackageReference,
} from "./references";
import {
  CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
  PROJECT_IDENTITY_MUTATION_BY_CONSUMERS_ALLOWED,
  PRODUCTION_MEMORY_REPOSITORY_ALLOWED,
} from "./version";

export type ProjectReferenceQuery = {
  tenantId: string;
  workspaceId?: string;
  projectId: string;
};

export type ChildReferenceQuery = ProjectReferenceQuery & {
  referenceId: string;
};

export type SharedProjectDomainPort = {
  readonly adapterKind: "memory" | "postgres";
  readonly canonicalProjectIdentityOwnership: typeof CANONICAL_PROJECT_IDENTITY_OWNERSHIP;
  /** Structural proof that the port never writes identity. */
  readonly identityMutationAllowed: false;
  resolveProjectReference(query: ProjectReferenceQuery): Promise<ProjectReference | null>;
  resolvePhaseReference(query: ChildReferenceQuery): Promise<PhaseReference | null>;
  resolveWbsReference(query: ChildReferenceQuery): Promise<WbsReference | null>;
  resolveWorkPackageReference(query: ChildReferenceQuery): Promise<WorkPackageReference | null>;
  resolveActivityReference(query: ChildReferenceQuery): Promise<ActivityReference | null>;
  resolveMilestoneReference(query: ChildReferenceQuery): Promise<MilestoneReference | null>;
  resolveScope(
    query: ProjectReferenceQuery & { scope: ProjectScope },
  ): Promise<SharedProjectDomainReference | null>;
};

/**
 * Convenience wrapper used by consumers that must fail closed when identity is
 * unknown. Keeps `project_reference_not_found` a single well-known error code.
 */
export async function requireProjectReference(
  port: SharedProjectDomainPort,
  query: ProjectReferenceQuery,
): Promise<ProjectReference> {
  const reference = await port.resolveProjectReference(query);
  if (!reference) {
    throw new Error("project_reference_not_found");
  }
  assertReferenceIsReadOnly(reference);
  return reference;
}

/** Standalone port-free helper so callers can resolve without wiring a class. */
export async function resolveProjectReference(
  port: SharedProjectDomainPort,
  query: ProjectReferenceQuery,
): Promise<ProjectReference | null> {
  const reference = await port.resolveProjectReference(query);
  if (reference) assertReferenceIsReadOnly(reference);
  return reference;
}

// ---------------------------------------------------------------------------
// Memory adapter — tests and certification units only
// ---------------------------------------------------------------------------

export type MemorySharedProjectDomainSeed = {
  projects?: ProjectReference[];
  phases?: PhaseReference[];
  wbsNodes?: WbsReference[];
  workPackages?: WorkPackageReference[];
  activities?: ActivityReference[];
  milestones?: MilestoneReference[];
};

function scopeMatches(
  candidate: { tenantId: string; workspaceId?: string },
  query: { tenantId: string; workspaceId?: string },
): boolean {
  if (candidate.tenantId !== query.tenantId) return false;
  if (!query.workspaceId) return true;
  if (!candidate.workspaceId) return true;
  return candidate.workspaceId === query.workspaceId;
}

export class MemorySharedProjectDomainPort implements SharedProjectDomainPort {
  readonly adapterKind = "memory" as const;
  readonly canonicalProjectIdentityOwnership = CANONICAL_PROJECT_IDENTITY_OWNERSHIP;
  readonly identityMutationAllowed = false as const;

  private readonly seed: Required<MemorySharedProjectDomainSeed>;

  constructor(seed: MemorySharedProjectDomainSeed = {}) {
    this.seed = {
      projects: seed.projects ?? [],
      phases: seed.phases ?? [],
      wbsNodes: seed.wbsNodes ?? [],
      workPackages: seed.workPackages ?? [],
      activities: seed.activities ?? [],
      milestones: seed.milestones ?? [],
    };
  }

  async resolveProjectReference(query: ProjectReferenceQuery): Promise<ProjectReference | null> {
    return (
      this.seed.projects.find(
        (project) => project.projectId === query.projectId && scopeMatches(project, query),
      ) ?? null
    );
  }

  async resolvePhaseReference(query: ChildReferenceQuery): Promise<PhaseReference | null> {
    return (
      this.seed.phases.find(
        (phase) =>
          phase.phaseId === query.referenceId &&
          phase.projectId === query.projectId &&
          scopeMatches(phase, query),
      ) ?? null
    );
  }

  async resolveWbsReference(query: ChildReferenceQuery): Promise<WbsReference | null> {
    return (
      this.seed.wbsNodes.find(
        (node) =>
          node.wbsNodeId === query.referenceId &&
          node.projectId === query.projectId &&
          scopeMatches(node, query),
      ) ?? null
    );
  }

  async resolveWorkPackageReference(
    query: ChildReferenceQuery,
  ): Promise<WorkPackageReference | null> {
    return (
      this.seed.workPackages.find(
        (pkg) =>
          pkg.workPackageId === query.referenceId &&
          pkg.projectId === query.projectId &&
          scopeMatches(pkg, query),
      ) ?? null
    );
  }

  async resolveActivityReference(query: ChildReferenceQuery): Promise<ActivityReference | null> {
    return (
      this.seed.activities.find(
        (activity) =>
          activity.activityId === query.referenceId &&
          activity.projectId === query.projectId &&
          scopeMatches(activity, query),
      ) ?? null
    );
  }

  async resolveMilestoneReference(query: ChildReferenceQuery): Promise<MilestoneReference | null> {
    return (
      this.seed.milestones.find(
        (milestone) =>
          milestone.milestoneId === query.referenceId &&
          milestone.projectId === query.projectId &&
          scopeMatches(milestone, query),
      ) ?? null
    );
  }

  async resolveScope(
    query: ProjectReferenceQuery & { scope: ProjectScope },
  ): Promise<SharedProjectDomainReference | null> {
    return resolveScopeVia(this, query);
  }
}

export function createInMemorySharedProjectDomainPort(
  seed: MemorySharedProjectDomainSeed = {},
): MemorySharedProjectDomainPort {
  return new MemorySharedProjectDomainPort(seed);
}

/** Builds a `ProjectReference` for tests without touching the database. */
export function createProjectReferenceFixture(input: {
  tenantId: string;
  workspaceId?: string;
  projectId: string;
  projectCode?: string;
  projectName?: string;
  projectPhase?: EngineeringProjectPhaseCode;
  status?: EngineeringProjectStatus;
  resolvedAt?: string;
}): ProjectReference {
  return {
    kind: "project",
    owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
    mutable: false,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    projectCode: input.projectCode ?? `PRJ-${input.projectId.slice(0, 6)}`,
    projectName: input.projectName ?? "Fixture project",
    projectPhase: input.projectPhase ?? "construction",
    status: input.status ?? "active",
    resolvedAt: input.resolvedAt ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Postgres adapter — reads engineering_projects and the batch_61 reference tables
// ---------------------------------------------------------------------------

type AnyClient = SupabaseClient<any, "public", any>;

export class PostgresSharedProjectDomainPort implements SharedProjectDomainPort {
  readonly adapterKind = "postgres" as const;
  readonly canonicalProjectIdentityOwnership = CANONICAL_PROJECT_IDENTITY_OWNERSHIP;
  readonly identityMutationAllowed = false as const;

  constructor(private readonly supabase: AnyClient) {}

  async resolveProjectReference(query: ProjectReferenceQuery): Promise<ProjectReference | null> {
    const { data, error } = await this.supabase
      .from("engineering_projects")
      .select(
        "id, tenant_id, workspace_id, project_code, project_name, project_phase, status, client_name, site_name, location, industry, project_type, start_date, end_date",
      )
      .eq("id", query.projectId)
      .eq("tenant_id", query.tenantId)
      .maybeSingle();
    if (error) throw new Error(`project_reference_read_failed:${error.message}`);
    if (!data) return null;
    if (query.workspaceId && data.workspace_id && data.workspace_id !== query.workspaceId) {
      return null;
    }
    return {
      kind: "project",
      owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
      mutable: false,
      tenantId: data.tenant_id,
      workspaceId: data.workspace_id ?? undefined,
      projectId: data.id,
      projectCode: data.project_code,
      projectName: data.project_name,
      projectPhase: data.project_phase as EngineeringProjectPhaseCode,
      status: data.status as EngineeringProjectStatus,
      clientName: data.client_name ?? undefined,
      siteName: data.site_name ?? undefined,
      location: data.location ?? undefined,
      industry: data.industry ?? undefined,
      projectType: data.project_type ?? undefined,
      startDate: data.start_date ?? undefined,
      endDate: data.end_date ?? undefined,
      resolvedAt: new Date().toISOString(),
    };
  }

  private async readReferenceRow(
    table: string,
    columns: string,
    query: ChildReferenceQuery,
  ): Promise<Record<string, any> | null> {
    const builder = this.supabase
      .from(table)
      .select(columns)
      .eq("id", query.referenceId)
      .eq("tenant_id", query.tenantId)
      .eq("project_id", query.projectId);
    const { data, error } = await (query.workspaceId
      ? builder.eq("workspace_id", query.workspaceId)
      : builder
    ).maybeSingle();
    if (error) throw new Error(`${table}_read_failed:${error.message}`);
    return (data as Record<string, any> | null) ?? null;
  }

  async resolvePhaseReference(query: ChildReferenceQuery): Promise<PhaseReference | null> {
    const row = await this.readReferenceRow(
      "engineering_project_phases",
      "id, tenant_id, workspace_id, project_id, code, name, status, sequence, parent_phase_id",
      query,
    );
    if (!row) return null;
    return {
      kind: "phase",
      owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
      mutable: false,
      tenantId: row.tenant_id,
      workspaceId: row.workspace_id ?? undefined,
      phaseId: row.id,
      projectId: row.project_id,
      code: row.code,
      name: row.name,
      status: row.status,
      sequence: row.sequence ?? undefined,
      parentPhaseId: row.parent_phase_id ?? undefined,
      resolvedAt: new Date().toISOString(),
    };
  }

  async resolveWbsReference(query: ChildReferenceQuery): Promise<WbsReference | null> {
    const row = await this.readReferenceRow(
      "engineering_wbs_nodes",
      "id, tenant_id, workspace_id, project_id, code, name, status, level, parent_wbs_node_id, path",
      query,
    );
    if (!row) return null;
    return {
      kind: "wbs_node",
      owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
      mutable: false,
      tenantId: row.tenant_id,
      workspaceId: row.workspace_id ?? undefined,
      wbsNodeId: row.id,
      projectId: row.project_id,
      code: row.code,
      name: row.name,
      status: row.status,
      level: row.level ?? undefined,
      parentWbsNodeId: row.parent_wbs_node_id ?? undefined,
      path: row.path ?? undefined,
      resolvedAt: new Date().toISOString(),
    };
  }

  async resolveWorkPackageReference(
    query: ChildReferenceQuery,
  ): Promise<WorkPackageReference | null> {
    const row = await this.readReferenceRow(
      "engineering_work_packages",
      "id, tenant_id, workspace_id, project_id, wbs_node_id, code, name, status, discipline_key",
      query,
    );
    if (!row) return null;
    return {
      kind: "work_package",
      owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
      mutable: false,
      tenantId: row.tenant_id,
      workspaceId: row.workspace_id ?? undefined,
      workPackageId: row.id,
      projectId: row.project_id,
      wbsNodeId: row.wbs_node_id ?? undefined,
      code: row.code,
      name: row.name,
      status: row.status,
      disciplineKey: row.discipline_key ?? undefined,
      resolvedAt: new Date().toISOString(),
    };
  }

  async resolveActivityReference(query: ChildReferenceQuery): Promise<ActivityReference | null> {
    const row = await this.readReferenceRow(
      "engineering_activities",
      "id, tenant_id, workspace_id, project_id, work_package_id, wbs_node_id, code, name, status",
      query,
    );
    if (!row) return null;
    return {
      kind: "activity",
      owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
      mutable: false,
      tenantId: row.tenant_id,
      workspaceId: row.workspace_id ?? undefined,
      activityId: row.id,
      projectId: row.project_id,
      workPackageId: row.work_package_id ?? undefined,
      wbsNodeId: row.wbs_node_id ?? undefined,
      code: row.code,
      name: row.name,
      status: row.status,
      resolvedAt: new Date().toISOString(),
    };
  }

  async resolveMilestoneReference(query: ChildReferenceQuery): Promise<MilestoneReference | null> {
    const row = await this.readReferenceRow(
      "engineering_milestones",
      "id, tenant_id, workspace_id, project_id, phase_id, code, name, status, target_date",
      query,
    );
    if (!row) return null;
    return {
      kind: "milestone",
      owner: CANONICAL_PROJECT_IDENTITY_OWNERSHIP,
      mutable: false,
      tenantId: row.tenant_id,
      workspaceId: row.workspace_id ?? undefined,
      milestoneId: row.id,
      projectId: row.project_id,
      phaseId: row.phase_id ?? undefined,
      code: row.code,
      name: row.name,
      status: row.status,
      targetDate: row.target_date ?? undefined,
      resolvedAt: new Date().toISOString(),
    };
  }

  async resolveScope(
    query: ProjectReferenceQuery & { scope: ProjectScope },
  ): Promise<SharedProjectDomainReference | null> {
    return resolveScopeVia(this, query);
  }
}

export function createPostgresSharedProjectDomainPort(
  supabase: AnyClient,
): PostgresSharedProjectDomainPort {
  return new PostgresSharedProjectDomainPort(supabase);
}

async function resolveScopeVia(
  port: SharedProjectDomainPort,
  query: ProjectReferenceQuery & { scope: ProjectScope },
): Promise<SharedProjectDomainReference | null> {
  const { scope } = query;
  if (scope.kind === "project") {
    return port.resolveProjectReference(query);
  }
  if (!scope.referenceId) return null;
  const childQuery: ChildReferenceQuery = { ...query, referenceId: scope.referenceId };
  switch (scope.kind) {
    case "phase":
      return port.resolvePhaseReference(childQuery);
    case "wbs_node":
      return port.resolveWbsReference(childQuery);
    case "work_package":
      return port.resolveWorkPackageReference(childQuery);
    case "activity":
      return port.resolveActivityReference(childQuery);
    case "milestone":
      return port.resolveMilestoneReference(childQuery);
    default:
      return null;
  }
}

export type SharedProjectDomainPortFactoryOptions = {
  adapter?: "memory" | "postgres";
  nodeEnv?: string;
  supabase?: unknown;
  seed?: MemorySharedProjectDomainSeed;
};

export function createSharedProjectDomainPort(
  options: SharedProjectDomainPortFactoryOptions = {},
): SharedProjectDomainPort {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const adapter = options.adapter ?? (nodeEnv === "production" ? "postgres" : "memory");
  if (adapter === "memory") {
    if (nodeEnv === "production" && !PRODUCTION_MEMORY_REPOSITORY_ALLOWED) {
      throw new Error("production_memory_repository_forbidden");
    }
    return createInMemorySharedProjectDomainPort(options.seed);
  }
  if (!options.supabase) {
    throw new Error("postgres_shared_project_domain_port_requires_supabase_client");
  }
  return createPostgresSharedProjectDomainPort(options.supabase as AnyClient);
}

/** Consumers call this before persisting anything keyed on a project. */
export function assertConsumerMayNotMutateIdentity(consumerKey: string): void {
  if (PROJECT_IDENTITY_MUTATION_BY_CONSUMERS_ALLOWED) {
    throw new Error(`consumer_identity_mutation_forbidden:${consumerKey}`);
  }
}
