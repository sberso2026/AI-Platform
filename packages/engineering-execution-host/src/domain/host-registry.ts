/**
 * EngineeringExecutionHostRegistry — register/update/revoke hosts & providers.
 * Does NOT register engineering methods.
 */

import {
  createEngineeringExecutionHost,
  type EngineeringExecutionHost,
  type HostClass,
  type ExecutionMode,
} from "./engineering-execution-host";
import { evaluateHostHealth, type EngineeringExecutionHostHealth } from "./host-health";
import {
  declareProviderInstallation,
  type ProviderInstallationDeclaration,
} from "./provider-installation";
import type { LicenseState } from "./license-state";
import type { ExecutionHostRepositoryPort } from "./persistence";
import { createExecutionHostOutboxEvent } from "./events";

export class EngineeringExecutionHostRegistry {
  constructor(private readonly repo: ExecutionHostRepositoryPort) {}

  async registerHost(input: {
    tenantId: string;
    workspaceId: string;
    hostClass: HostClass;
    operatingSystem?: string;
    architecture?: string;
    executionMode?: ExecutionMode;
    maxConcurrentJobs?: number;
    correlationId?: string;
  }): Promise<EngineeringExecutionHost> {
    const host = createEngineeringExecutionHost({
      hostId: this.repo.newId("host"),
      ...input,
    });
    await this.repo.saveHost(host);
    await this.repo.enqueueOutbox(
      createExecutionHostOutboxEvent({
        outboxId: this.repo.newId("outbox"),
        tenantId: host.tenantId,
        workspaceId: host.workspaceId,
        eventType: "engineering.execution.host.registered",
        payload: { hostId: host.hostId, status: host.status },
        correlationId: input.correlationId,
      }),
    );
    return host;
  }

  async updateHealth(
    tenantId: string,
    workspaceId: string,
    hostId: string,
    patch: {
      heartbeatOk: boolean;
      capacityOk: boolean;
      providerReadinessOk: boolean;
      workspaceReadinessOk: boolean;
      artifactTransportOk: boolean;
      activeJobCount: number;
      detail?: string;
    },
  ): Promise<EngineeringExecutionHostHealth | null> {
    const host = await this.repo.getHost(tenantId, workspaceId, hostId);
    if (!host) return null;
    const health = evaluateHostHealth({
      hostId,
      revoked: host.status === "revoked",
      draining: host.status === "draining",
      maxConcurrentJobs: host.resourcePolicy.maxConcurrentJobs,
      ...patch,
    });
    const updated: EngineeringExecutionHost = {
      ...host,
      health: health.status,
      lastHeartbeat: health.checkedAt,
      updatedAt: health.checkedAt,
      status:
        host.status === "revoked"
          ? "revoked"
          : health.status === "healthy"
            ? "ready"
            : host.status,
    };
    await this.repo.saveHost(updated);
    await this.repo.saveHealth(health);
    await this.repo.enqueueOutbox(
      createExecutionHostOutboxEvent({
        outboxId: this.repo.newId("outbox"),
        tenantId,
        workspaceId,
        eventType: "engineering.execution.host.health_changed",
        payload: { hostId, status: health.status },
      }),
    );
    return health;
  }

  async registerProvider(
    tenantId: string,
    workspaceId: string,
    hostId: string,
    declaration: Omit<ProviderInstallationDeclaration, "observedAt"> & {
      observedAt?: string;
    },
  ): Promise<EngineeringExecutionHost | null> {
    const host = await this.repo.getHost(tenantId, workspaceId, hostId);
    if (!host) return null;
    const installed = declareProviderInstallation(declaration);
    const others = host.installedProviders.filter(
      (p) => p.providerId !== installed.providerId,
    );
    const installedProviderVersions = { ...host.installedProviderVersions };
    if (installed.providerVersion) {
      installedProviderVersions[installed.providerId] = installed.providerVersion;
    }
    const licenseStatuses: Record<string, LicenseState> = {
      ...host.licenseStatuses,
      [installed.providerId]: installed.licenseStatus,
    };
    const updated: EngineeringExecutionHost = {
      ...host,
      installedProviders: [...others, installed],
      installedProviderVersions,
      licenseStatuses,
      updatedAt: new Date().toISOString(),
    };
    await this.repo.saveHost(updated);
    await this.repo.saveProvider(hostId, tenantId, workspaceId, installed);
    return updated;
  }

  async revokeHost(
    tenantId: string,
    workspaceId: string,
    hostId: string,
  ): Promise<EngineeringExecutionHost | null> {
    const host = await this.repo.getHost(tenantId, workspaceId, hostId);
    if (!host) return null;
    const now = new Date().toISOString();
    const updated: EngineeringExecutionHost = {
      ...host,
      status: "revoked",
      health: "revoked",
      revokedAt: now,
      updatedAt: now,
    };
    await this.repo.saveHost(updated);
    return updated;
  }

  async revokeProvider(
    tenantId: string,
    workspaceId: string,
    hostId: string,
    providerId: string,
  ): Promise<EngineeringExecutionHost | null> {
    const host = await this.repo.getHost(tenantId, workspaceId, hostId);
    if (!host) return null;
    const installedProviders = host.installedProviders.map((p) =>
      p.providerId === providerId
        ? { ...p, revoked: true, healthStatus: "unavailable" as const }
        : p,
    );
    const updated: EngineeringExecutionHost = {
      ...host,
      installedProviders,
      updatedAt: new Date().toISOString(),
    };
    await this.repo.saveHost(updated);
    return updated;
  }

  async listHosts(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringExecutionHost[]> {
    return this.repo.listHosts(tenantId, workspaceId);
  }
}
