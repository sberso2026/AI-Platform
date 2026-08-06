/**
 * Engineering Module SDK — reusable infrastructure for all Engineering OS modules.
 * Future modules (Asset Intelligence, Project Controls, Digital Twin, etc.) must reuse this.
 */
export type EngineeringModuleLifecycleState =
  | "discovered"
  | "registered"
  | "installing"
  | "active"
  | "suspended"
  | "disabled";

export type EngineeringModuleSdkRegistration = {
  moduleKey: string;
  version: string;
  displayName: string;
  routePrefix: string;
  commerceApplicationKey: string;
  lifecycle: EngineeringModuleLifecycleState;
};

export type EngineeringModuleWorkflowPort = {
  startApproval(input: {
    tenantId: string;
    workspaceId: string;
    definitionSlug: string;
    context: Record<string, unknown>;
    startedBy?: string;
  }): Promise<{ instanceId: string }>;
};

export type EngineeringModuleEventPort = {
  publish(input: {
    tenantId: string;
    workspaceId?: string;
    eventType: string;
    source: string;
    payload: Record<string, unknown>;
  }): Promise<void>;
};

export type EngineeringModuleTemplatePort = {
  createImmutableVersion(input: {
    templateId: string;
    content: Record<string, unknown>;
  }): Promise<{ version: number; versionId: string }>;
};

export type EngineeringModuleEvidencePort = {
  appendImmutable(input: {
    contentHash: string;
    fileId?: string;
    provenance: Record<string, unknown>;
  }): Promise<{ evidenceId: string; version: number }>;
};

export type EngineeringModuleReportPort = {
  renderPackAware(input: {
    packId: string;
    reportKey: string;
    context: Record<string, unknown>;
  }): Promise<{ reportId: string }>;
};

export type EngineeringModuleAuditPort = {
  link(input: {
    tenantId: string;
    entityType: string;
    entityId: string;
    action: string;
  }): Promise<void>;
};

export type EngineeringModuleEntitlementPort = {
  assertAction(input: {
    applicationKey: string;
    action: string;
    tenantId: string;
    workspaceId?: string;
  }): Promise<void>;
};

export type EngineeringModuleNotificationPort = {
  notify(input: {
    tenantId: string;
    workspaceId?: string;
    channel: string;
    payload: Record<string, unknown>;
  }): Promise<void>;
};

export type EngineeringModuleHealthPort = {
  check(moduleKey: string): Promise<{ ok: boolean; detail?: string }>;
};

export type EngineeringModuleCertificationPort = {
  requiredGates: readonly string[];
};

export type EngineeringModuleAiPort = {
  /** Always Platform AI Runtime — never a private stack. */
  executeAssist(input: {
    promptKey: string;
    context: Record<string, unknown>;
  }): Promise<{ runId: string; reservedPrivateRuntime: false }>;
};

export type EngineeringModulePackRegistrationPort = {
  registerPack(manifest: Record<string, unknown>): Promise<void>;
};

export type EngineeringModuleSdk = {
  registration: EngineeringModuleSdkRegistration;
  lifecycle: EngineeringModuleLifecycleState;
  workflow: EngineeringModuleWorkflowPort;
  events: EngineeringModuleEventPort;
  templates: EngineeringModuleTemplatePort;
  versioning: EngineeringModuleTemplatePort;
  evidence: EngineeringModuleEvidencePort;
  reports: EngineeringModuleReportPort;
  audit: EngineeringModuleAuditPort;
  entitlements: EngineeringModuleEntitlementPort;
  notifications: EngineeringModuleNotificationPort;
  health: EngineeringModuleHealthPort;
  certification: EngineeringModuleCertificationPort;
  ai: EngineeringModuleAiPort;
  packs: EngineeringModulePackRegistrationPort;
};

export function createEngineeringModuleSdkSkeleton(
  registration: EngineeringModuleSdkRegistration,
): EngineeringModuleSdk {
  const notWired = async () => {
    throw new Error("engineering_module_sdk_port_not_wired");
  };
  return {
    registration,
    lifecycle: registration.lifecycle,
    workflow: {
      startApproval: async () => ({ instanceId: "unwired" }),
    },
    events: {
      publish: async () => undefined,
    },
    templates: { createImmutableVersion: async () => ({ version: 1, versionId: "unwired" }) },
    versioning: { createImmutableVersion: async () => ({ version: 1, versionId: "unwired" }) },
    evidence: {
      appendImmutable: async () => ({ evidenceId: "unwired", version: 1 }),
    },
    reports: { renderPackAware: async () => ({ reportId: "unwired" }) },
    audit: { link: async () => undefined },
    entitlements: { assertAction: notWired },
    notifications: { notify: async () => undefined },
    health: { check: async () => ({ ok: true, detail: "sdk_skeleton" }) },
    certification: { requiredGates: ["architecture", "persistence", "security"] },
    ai: {
      executeAssist: async () => ({ runId: "unwired", reservedPrivateRuntime: false as const }),
    },
    packs: { registerPack: async () => undefined },
  };
}

export const ENGINEERING_MODULE_SDK_VERSION = "0.3.0" as const;
export const ENGINEERING_MODULE_SDK_FUTURE_CONSUMERS = [
  "asset_intelligence",
  "project_controls",
  "digital_twin",
  "shm_intelligence",
  "engineering_knowledge",
  "procurement_intelligence",
  "inspection_intelligence",
] as const;
