/**
 * Execution-host repository port + memory adapter for tests.
 */

import { randomUUID } from "node:crypto";
import { PRODUCTION_MEMORY_REPOSITORY_ALLOWED } from "../version";
import type { EngineeringExecutionHost } from "./engineering-execution-host";
import type { EngineeringExecutionHostHealth } from "./host-health";
import type { ProviderInstallationDeclaration } from "./provider-installation";
import type { EngineeringExecutionJob } from "./execution-job";
import type { JobArtifactBinding } from "./artifacts";
import type { ExecutionHostOutboxEvent } from "./events";
import { createPostgresExecutionHostRepository } from "./postgres-repository";

export type ExecutionHostRepositoryPort = {
  readonly adapterKind: "memory" | "postgres";
  newId(prefix: string): string;

  saveHost(host: EngineeringExecutionHost): Promise<EngineeringExecutionHost>;
  getHost(
    tenantId: string,
    workspaceId: string,
    hostId: string,
  ): Promise<EngineeringExecutionHost | null>;
  listHosts(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringExecutionHost[]>;

  saveProvider(
    hostId: string,
    tenantId: string,
    workspaceId: string,
    provider: ProviderInstallationDeclaration,
  ): Promise<ProviderInstallationDeclaration>;
  listProviders(
    tenantId: string,
    workspaceId: string,
    hostId: string,
  ): Promise<ProviderInstallationDeclaration[]>;

  saveJob(job: EngineeringExecutionJob): Promise<EngineeringExecutionJob>;
  getJob(
    tenantId: string,
    workspaceId: string,
    jobId: string,
  ): Promise<EngineeringExecutionJob | null>;
  getJobByIdempotencyKey(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<EngineeringExecutionJob | null>;
  listJobs(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringExecutionJob[]>;

  saveArtifact(binding: JobArtifactBinding): Promise<JobArtifactBinding>;
  listArtifacts(
    tenantId: string,
    workspaceId: string,
    jobId: string,
  ): Promise<JobArtifactBinding[]>;

  saveHealth(
    health: EngineeringExecutionHostHealth,
  ): Promise<EngineeringExecutionHostHealth>;
  listHealth(
    tenantId: string,
    workspaceId: string,
    hostId: string,
  ): Promise<EngineeringExecutionHostHealth[]>;

  enqueueOutbox(
    record: ExecutionHostOutboxEvent,
  ): Promise<ExecutionHostOutboxEvent>;
  listOutbox(
    tenantId: string,
    workspaceId: string,
  ): Promise<ExecutionHostOutboxEvent[]>;
};

export type DurableExecutionHostStore = {
  hosts: EngineeringExecutionHost[];
  providers: Array<
    ProviderInstallationDeclaration & {
      hostId: string;
      tenantId: string;
      workspaceId: string;
    }
  >;
  jobs: EngineeringExecutionJob[];
  artifacts: Array<JobArtifactBinding & { tenantId: string; workspaceId: string }>;
  health: Array<
    EngineeringExecutionHostHealth & { tenantId: string; workspaceId: string }
  >;
  outbox: ExecutionHostOutboxEvent[];
};

export function createDurableExecutionHostMemoryStore(
  seed?: Partial<DurableExecutionHostStore>,
): DurableExecutionHostStore {
  return {
    hosts: seed?.hosts ? [...seed.hosts] : [],
    providers: seed?.providers ? [...seed.providers] : [],
    jobs: seed?.jobs ? [...seed.jobs] : [],
    artifacts: seed?.artifacts ? [...seed.artifacts] : [],
    health: seed?.health ? [...seed.health] : [],
    outbox: seed?.outbox ? [...seed.outbox] : [],
  };
}

export class MemoryExecutionHostRepository implements ExecutionHostRepositoryPort {
  readonly adapterKind = "memory" as const;

  constructor(private readonly store: DurableExecutionHostStore) {}

  newId(prefix: string): string {
    return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }

  async saveHost(host: EngineeringExecutionHost): Promise<EngineeringExecutionHost> {
    const idx = this.store.hosts.findIndex(
      (h) =>
        h.hostId === host.hostId &&
        h.tenantId === host.tenantId &&
        h.workspaceId === host.workspaceId,
    );
    if (idx >= 0) this.store.hosts[idx] = host;
    else this.store.hosts.push(host);
    return host;
  }

  async getHost(
    tenantId: string,
    workspaceId: string,
    hostId: string,
  ): Promise<EngineeringExecutionHost | null> {
    return (
      this.store.hosts.find(
        (h) =>
          h.tenantId === tenantId &&
          h.workspaceId === workspaceId &&
          h.hostId === hostId,
      ) ?? null
    );
  }

  async listHosts(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringExecutionHost[]> {
    return this.store.hosts.filter(
      (h) => h.tenantId === tenantId && h.workspaceId === workspaceId,
    );
  }

  async saveProvider(
    hostId: string,
    tenantId: string,
    workspaceId: string,
    provider: ProviderInstallationDeclaration,
  ): Promise<ProviderInstallationDeclaration> {
    const idx = this.store.providers.findIndex(
      (p) =>
        p.hostId === hostId &&
        p.tenantId === tenantId &&
        p.workspaceId === workspaceId &&
        p.providerId === provider.providerId,
    );
    const row = { ...provider, hostId, tenantId, workspaceId };
    if (idx >= 0) this.store.providers[idx] = row;
    else this.store.providers.push(row);
    return provider;
  }

  async listProviders(
    tenantId: string,
    workspaceId: string,
    hostId: string,
  ): Promise<ProviderInstallationDeclaration[]> {
    return this.store.providers
      .filter(
        (p) =>
          p.tenantId === tenantId &&
          p.workspaceId === workspaceId &&
          p.hostId === hostId,
      )
      .map(({ hostId: _h, tenantId: _t, workspaceId: _w, ...rest }) => rest);
  }

  async saveJob(job: EngineeringExecutionJob): Promise<EngineeringExecutionJob> {
    const idx = this.store.jobs.findIndex(
      (j) =>
        j.jobId === job.jobId &&
        j.tenantId === job.tenantId &&
        j.workspaceId === job.workspaceId,
    );
    if (idx >= 0) this.store.jobs[idx] = job;
    else this.store.jobs.push(job);
    return job;
  }

  async getJob(
    tenantId: string,
    workspaceId: string,
    jobId: string,
  ): Promise<EngineeringExecutionJob | null> {
    return (
      this.store.jobs.find(
        (j) =>
          j.tenantId === tenantId &&
          j.workspaceId === workspaceId &&
          j.jobId === jobId,
      ) ?? null
    );
  }

  async getJobByIdempotencyKey(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<EngineeringExecutionJob | null> {
    return (
      this.store.jobs.find(
        (j) =>
          j.tenantId === tenantId &&
          j.workspaceId === workspaceId &&
          j.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  async listJobs(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringExecutionJob[]> {
    return this.store.jobs.filter(
      (j) => j.tenantId === tenantId && j.workspaceId === workspaceId,
    );
  }

  async saveArtifact(binding: JobArtifactBinding): Promise<JobArtifactBinding> {
    const job = this.store.jobs.find((j) => j.jobId === binding.jobId);
    this.store.artifacts.push({
      ...binding,
      tenantId: job?.tenantId ?? "",
      workspaceId: job?.workspaceId ?? "",
    });
    return binding;
  }

  async listArtifacts(
    tenantId: string,
    workspaceId: string,
    jobId: string,
  ): Promise<JobArtifactBinding[]> {
    return this.store.artifacts
      .filter(
        (a) =>
          a.tenantId === tenantId &&
          a.workspaceId === workspaceId &&
          a.jobId === jobId,
      )
      .map(({ tenantId: _t, workspaceId: _w, ...rest }) => rest);
  }

  async saveHealth(
    health: EngineeringExecutionHostHealth,
  ): Promise<EngineeringExecutionHostHealth> {
    const host = this.store.hosts.find((h) => h.hostId === health.hostId);
    this.store.health.push({
      ...health,
      tenantId: host?.tenantId ?? "",
      workspaceId: host?.workspaceId ?? "",
    });
    return health;
  }

  async listHealth(
    tenantId: string,
    workspaceId: string,
    hostId: string,
  ): Promise<EngineeringExecutionHostHealth[]> {
    return this.store.health
      .filter(
        (h) =>
          h.tenantId === tenantId &&
          h.workspaceId === workspaceId &&
          h.hostId === hostId,
      )
      .map(({ tenantId: _t, workspaceId: _w, ...rest }) => rest);
  }

  async enqueueOutbox(
    record: ExecutionHostOutboxEvent,
  ): Promise<ExecutionHostOutboxEvent> {
    this.store.outbox.push(record);
    return record;
  }

  async listOutbox(
    tenantId: string,
    workspaceId: string,
  ): Promise<ExecutionHostOutboxEvent[]> {
    return this.store.outbox.filter(
      (r) => r.tenantId === tenantId && r.workspaceId === workspaceId,
    );
  }
}

export type ExecutionHostRepositoryFactoryOptions = {
  adapter?: "memory" | "postgres";
  nodeEnv?: string;
  memoryStore?: DurableExecutionHostStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase?: any;
};

export function createExecutionHostRepository(
  options: ExecutionHostRepositoryFactoryOptions = {},
): ExecutionHostRepositoryPort {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const adapter =
    options.adapter ??
    (process.env.EXECUTION_HOST_REPOSITORY_ADAPTER as
      | "memory"
      | "postgres"
      | undefined) ??
    (nodeEnv === "production" ? "postgres" : "memory");

  if (adapter === "memory") {
    if (nodeEnv === "production" && !PRODUCTION_MEMORY_REPOSITORY_ALLOWED) {
      throw new Error("production_memory_repository_forbidden");
    }
    return new MemoryExecutionHostRepository(
      options.memoryStore ?? createDurableExecutionHostMemoryStore(),
    );
  }

  if (!options.supabase) {
    throw new Error("postgres_repository_requires_supabase_client");
  }
  return createPostgresExecutionHostRepository(options.supabase);
}
