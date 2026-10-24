/**
 * Postgres-backed execution-host repository (batch_88 tables).
 */

import { randomUUID } from "node:crypto";
import type { EngineeringExecutionHost } from "./engineering-execution-host";
import type { EngineeringExecutionHostHealth } from "./host-health";
import type { ProviderInstallationDeclaration } from "./provider-installation";
import type { EngineeringExecutionJob } from "./execution-job";
import type { JobArtifactBinding } from "./artifacts";
import type { ExecutionHostOutboxEvent } from "./events";
import type { ExecutionHostRepositoryPort } from "./persistence";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = any;

function mapHost(row: Record<string, unknown>): EngineeringExecutionHost {
  return {
    hostId: String(row.host_id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    hostClass: row.host_class as EngineeringExecutionHost["hostClass"],
    operatingSystem: String(row.operating_system ?? "windows"),
    architecture: String(row.architecture ?? "x64"),
    executionMode: row.execution_mode as EngineeringExecutionHost["executionMode"],
    status: row.status as EngineeringExecutionHost["status"],
    health: row.health as EngineeringExecutionHost["health"],
    installedProviders: [],
    installedProviderVersions:
      (row.installed_provider_versions as Record<string, string>) ?? {},
    licenseStatuses: (row.license_statuses as Record<string, never>) ?? {},
    resourcePolicy: {
      maxConcurrentJobs: Number(row.max_concurrent_jobs ?? 1),
    },
    sandboxPolicy: {
      pathConfinement: true,
      processTimeoutRequired: true,
      arbitraryShellInjectionAllowed: false,
      restrictedSecretExposure: true,
      crossTenantIsolation: true,
    },
    workspacePolicy: {
      isolatedJobDirectory: true,
      crossJobFileAccessAllowed: false,
      cleanupRequired: true,
      immutableInputStaging: true,
    },
    artifactPolicy: {
      platformFilesOnly: true,
      inlineModelPayloadAllowed: false,
    },
    networkPolicy: {
      outboundRestricted: true,
      allowProviderLocalApi: true,
    },
    supportedExecutionModes: (row.supported_execution_modes as never) ?? [
      "headless_local",
    ],
    lastHeartbeat: String(row.last_heartbeat ?? new Date().toISOString()),
    metadata: (row.metadata as Record<string, string>) ?? {},
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
    revokedAt: row.revoked_at ? String(row.revoked_at) : undefined,
  };
}

export function createPostgresExecutionHostRepository(
  supabase: SupabaseLike,
): ExecutionHostRepositoryPort {
  return {
    adapterKind: "postgres",
    newId(prefix: string) {
      return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
    },

    async saveHost(host) {
      const { error } = await supabase.from("engineering_execution_hosts").upsert({
        host_id: host.hostId,
        tenant_id: host.tenantId,
        workspace_id: host.workspaceId,
        host_class: host.hostClass,
        operating_system: host.operatingSystem,
        architecture: host.architecture,
        execution_mode: host.executionMode,
        status: host.status,
        health: host.health,
        installed_provider_versions: host.installedProviderVersions,
        license_statuses: host.licenseStatuses,
        max_concurrent_jobs: host.resourcePolicy.maxConcurrentJobs,
        supported_execution_modes: host.supportedExecutionModes,
        last_heartbeat: host.lastHeartbeat,
        metadata: host.metadata,
        revoked_at: host.revokedAt ?? null,
        updated_at: host.updatedAt,
        created_at: host.createdAt,
        silent_solver_fallback_allowed: false,
      });
      if (error) throw new Error(`save_host_failed:${error.message}`);
      return host;
    },

    async getHost(tenantId, workspaceId, hostId) {
      const { data, error } = await supabase
        .from("engineering_execution_hosts")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .eq("host_id", hostId)
        .maybeSingle();
      if (error) throw new Error(`get_host_failed:${error.message}`);
      return data ? mapHost(data) : null;
    },

    async listHosts(tenantId, workspaceId) {
      const { data, error } = await supabase
        .from("engineering_execution_hosts")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId);
      if (error) throw new Error(`list_hosts_failed:${error.message}`);
      return (data ?? []).map(mapHost);
    },

    async saveProvider(hostId, tenantId, workspaceId, provider) {
      const { error } = await supabase
        .from("engineering_execution_host_providers")
        .upsert({
          host_provider_id: `${hostId}:${provider.providerId}`,
          host_id: hostId,
          tenant_id: tenantId,
          workspace_id: workspaceId,
          provider_id: provider.providerId,
          provider_version: provider.providerVersion ?? null,
          installation_status: provider.installationStatus,
          license_status: provider.licenseStatus,
          health_status: provider.healthStatus,
          revoked: provider.revoked,
          detail_notes: provider.detail ?? null,
          observed_at: provider.observedAt,
          updated_at: new Date().toISOString(),
        });
      if (error) throw new Error(`save_provider_failed:${error.message}`);
      return provider;
    },

    async listProviders(tenantId, workspaceId, hostId) {
      const { data, error } = await supabase
        .from("engineering_execution_host_providers")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .eq("host_id", hostId);
      if (error) throw new Error(`list_providers_failed:${error.message}`);
      return (data ?? []).map(
        (row: Record<string, unknown>): ProviderInstallationDeclaration => ({
          providerId: String(row.provider_id),
          providerVersion: row.provider_version
            ? String(row.provider_version)
            : undefined,
          installationStatus: row.installation_status as never,
          licenseStatus: row.license_status as never,
          healthStatus: row.health_status as never,
          revoked: Boolean(row.revoked),
          observedAt: String(row.observed_at),
          detail: row.detail_notes ? String(row.detail_notes) : undefined,
        }),
      );
    },

    async saveJob(job) {
      const { error } = await supabase.from("engineering_execution_jobs").upsert({
        job_id: job.jobId,
        tenant_id: job.tenantId,
        workspace_id: job.workspaceId,
        host_id: job.hostId ?? null,
        provider_id: job.providerId,
        provider_version: job.providerVersion ?? null,
        tool_registration_ref: job.toolRegistrationRef,
        method_qualification_ref: job.methodQualificationRef,
        provider_qualification_ref: job.providerQualificationRef,
        application_qualification_ref: job.applicationQualificationRef,
        source_model_ref: job.sourceModelRef,
        input_artifact_refs: job.inputArtifactRefs,
        status: job.status,
        timeout_ms: job.timeoutMs,
        requested_by: job.requestedBy,
        idempotency_key: job.idempotencyKey ?? null,
        rejection_reason: job.rejectionReason ?? null,
        correlation_id: job.correlationId ?? null,
        request_id: job.requestId ?? null,
        created_at: job.createdAt,
        updated_at: job.updatedAt,
        silent_solver_fallback_used: false,
        spacegass_live_execution_certified: false,
      });
      if (error) throw new Error(`save_job_failed:${error.message}`);
      return job;
    },

    async getJob(tenantId, workspaceId, jobId) {
      const { data, error } = await supabase
        .from("engineering_execution_jobs")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .eq("job_id", jobId)
        .maybeSingle();
      if (error) throw new Error(`get_job_failed:${error.message}`);
      if (!data) return null;
      return {
        jobId: String(data.job_id),
        tenantId: String(data.tenant_id),
        workspaceId: String(data.workspace_id),
        hostId: data.host_id ? String(data.host_id) : undefined,
        providerId: String(data.provider_id),
        providerVersion: data.provider_version
          ? String(data.provider_version)
          : undefined,
        versionPolicy: { mode: "any_declared" },
        toolRegistrationRef: String(data.tool_registration_ref),
        methodQualificationRef: String(data.method_qualification_ref),
        providerQualificationRef: String(data.provider_qualification_ref),
        applicationQualificationRef: String(data.application_qualification_ref),
        sourceModelRef: String(data.source_model_ref),
        inputArtifactRefs: (data.input_artifact_refs as string[]) ?? [],
        executionPolicy: {
          timeoutMs: Number(data.timeout_ms ?? 300000),
          allowRerun: false,
          maxConcurrentOnHost: 1,
        },
        timeoutMs: Number(data.timeout_ms ?? 300000),
        requestedBy: String(data.requested_by),
        status: data.status as EngineeringExecutionJob["status"],
        idempotencyKey: data.idempotency_key
          ? String(data.idempotency_key)
          : undefined,
        createdAt: String(data.created_at),
        updatedAt: String(data.updated_at),
        rejectionReason: data.rejection_reason
          ? String(data.rejection_reason)
          : undefined,
        correlationId: data.correlation_id
          ? String(data.correlation_id)
          : undefined,
        requestId: data.request_id ? String(data.request_id) : undefined,
      };
    },

    async getJobByIdempotencyKey(tenantId, workspaceId, idempotencyKey) {
      const { data, error } = await supabase
        .from("engineering_execution_jobs")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId)
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();
      if (error) throw new Error(`get_job_idempotency_failed:${error.message}`);
      if (!data) return null;
      return this.getJob(tenantId, workspaceId, String(data.job_id));
    },

    async listJobs(tenantId, workspaceId) {
      const { data, error } = await supabase
        .from("engineering_execution_jobs")
        .select("job_id")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId);
      if (error) throw new Error(`list_jobs_failed:${error.message}`);
      const jobs: EngineeringExecutionJob[] = [];
      for (const row of data ?? []) {
        const job = await this.getJob(tenantId, workspaceId, String(row.job_id));
        if (job) jobs.push(job);
      }
      return jobs;
    },

    async saveArtifact(binding) {
      const { error } = await supabase
        .from("engineering_execution_job_artifacts")
        .upsert({
          artifact_id: binding.artifactId,
          job_id: binding.jobId,
          platform_file_ref: binding.ref.platformFileRef,
          role: binding.ref.role,
          content_type: binding.ref.contentType ?? null,
          created_at: binding.createdAt,
        });
      if (error) throw new Error(`save_artifact_failed:${error.message}`);
      return binding;
    },

    async listArtifacts(_tenantId, _workspaceId, jobId) {
      const { data, error } = await supabase
        .from("engineering_execution_job_artifacts")
        .select("*")
        .eq("job_id", jobId);
      if (error) throw new Error(`list_artifacts_failed:${error.message}`);
      return (data ?? []).map(
        (row: Record<string, unknown>): JobArtifactBinding => ({
          jobId: String(row.job_id),
          artifactId: String(row.artifact_id),
          ref: {
            platformFileRef: String(row.platform_file_ref),
            role: row.role as never,
            contentType: row.content_type ? String(row.content_type) : undefined,
            inlinePayloadForbidden: true,
          },
          createdAt: String(row.created_at),
        }),
      );
    },

    async saveHealth(health) {
      const { error } = await supabase
        .from("engineering_execution_host_health")
        .insert({
          health_id: `${health.hostId}_${Date.now()}`,
          host_id: health.hostId,
          status: health.status,
          checked_at: health.checkedAt,
          heartbeat_ok: health.heartbeatOk,
          capacity_ok: health.capacityOk,
          provider_readiness_ok: health.providerReadinessOk,
          workspace_readiness_ok: health.workspaceReadinessOk,
          artifact_transport_ok: health.artifactTransportOk,
          active_job_count: health.activeJobCount,
          max_concurrent_jobs: health.maxConcurrentJobs,
          detail_notes: health.detail ?? null,
        });
      if (error) throw new Error(`save_health_failed:${error.message}`);
      return health;
    },

    async listHealth(_tenantId, _workspaceId, hostId) {
      const { data, error } = await supabase
        .from("engineering_execution_host_health")
        .select("*")
        .eq("host_id", hostId)
        .order("checked_at", { ascending: false })
        .limit(20);
      if (error) throw new Error(`list_health_failed:${error.message}`);
      return (data ?? []).map(
        (row: Record<string, unknown>): EngineeringExecutionHostHealth => ({
          hostId: String(row.host_id),
          status: row.status as never,
          checkedAt: String(row.checked_at),
          heartbeatOk: Boolean(row.heartbeat_ok),
          capacityOk: Boolean(row.capacity_ok),
          providerReadinessOk: Boolean(row.provider_readiness_ok),
          workspaceReadinessOk: Boolean(row.workspace_readiness_ok),
          artifactTransportOk: Boolean(row.artifact_transport_ok),
          activeJobCount: Number(row.active_job_count ?? 0),
          maxConcurrentJobs: Number(row.max_concurrent_jobs ?? 1),
          detail: row.detail_notes ? String(row.detail_notes) : undefined,
        }),
      );
    },

    async enqueueOutbox(record) {
      const { error } = await supabase
        .from("engineering_execution_host_outbox_events")
        .insert({
          outbox_id: record.outboxId,
          tenant_id: record.tenantId,
          workspace_id: record.workspaceId,
          event_type: record.eventType,
          payload: record.payload,
          correlation_id: record.correlationId ?? null,
          published: record.published,
          created_at: record.createdAt,
        });
      if (error) throw new Error(`enqueue_outbox_failed:${error.message}`);
      return record;
    },

    async listOutbox(tenantId, workspaceId) {
      const { data, error } = await supabase
        .from("engineering_execution_host_outbox_events")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("workspace_id", workspaceId);
      if (error) throw new Error(`list_outbox_failed:${error.message}`);
      return (data ?? []).map(
        (row: Record<string, unknown>): ExecutionHostOutboxEvent => ({
          outboxId: String(row.outbox_id),
          tenantId: String(row.tenant_id),
          workspaceId: String(row.workspace_id),
          eventType: row.event_type as never,
          payload: (row.payload as ExecutionHostOutboxEvent["payload"]) ?? {},
          correlationId: row.correlation_id
            ? String(row.correlation_id)
            : undefined,
          published: Boolean(row.published),
          createdAt: String(row.created_at),
          publishedAt: row.published_at ? String(row.published_at) : undefined,
        }),
      );
    },
  };
}
