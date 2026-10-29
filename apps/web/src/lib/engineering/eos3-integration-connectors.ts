/**
 * EOS 3.6 Integration Framework — canonical connector contracts.
 * CONNECTOR_AVAILABLE != SOLVER_QUALIFIED
 * RESULT_IMPORTED != RESULT_APPROVED
 */

import { createHash } from "node:crypto";
import { buildEos3Provenance } from "../commerce/eos3-provenance";

export const EOS3_CONNECTOR_CATEGORIES = [
  "document_repository",
  "engineering_analysis_tool",
  "deterministic_solver",
  "cad_bim_plant_design",
  "project_controls",
  "asset_system",
  "inspection_system",
  "historian_data_source",
  "identity_system",
  "ai_model_provider",
] as const;

export type Eos3ConnectorCategory = (typeof EOS3_CONNECTOR_CATEGORIES)[number];

export const EOS3_CONNECTOR_CAPABILITIES = [
  "READ_DOCUMENT",
  "WRITE_DOCUMENT",
  "IMPORT_MODEL",
  "EXPORT_MODEL",
  "SUBMIT_ANALYSIS",
  "POLL_ANALYSIS",
  "FETCH_RESULTS",
  "READ_ASSET_DATA",
  "READ_PROJECT_CONTROLS",
  "READ_INSPECTION_DATA",
] as const;

export type Eos3ConnectorCapability = (typeof EOS3_CONNECTOR_CAPABILITIES)[number];

export type ConnectorHealth =
  | "UNCONFIGURED"
  | "CONFIGURED"
  | "AVAILABLE"
  | "DEGRADED"
  | "UNAVAILABLE"
  | "AUTH_FAILED";

export type ConnectorQualificationState =
  | "INTEGRATED_NOT_VALIDATED"
  | "VALIDATED_BOUNDED"
  | "QUALIFIED_BOUNDED"
  | "QUALIFIED";

export type SystemOfRecordClass =
  | "EXTERNAL_AUTHORITATIVE"
  | "EOS_AUTHORITATIVE"
  | "SHARED_GOVERNED"
  | "METADATA_REFERENCE_ONLY";

/** Secrets live outside engineering object tables. */
export type ConnectorSecretVault = {
  vaultId: string;
  /** Never returned to unauthorized callers; value redacted in logs. */
  secrets: Map<string, { cipherRef: string; neverLog: true }>;
};

export type Eos3Connector = {
  connectorId: string;
  category: Eos3ConnectorCategory;
  provider: string;
  vendor: string;
  version: string;
  tenantId: string;
  workspaceId: string;
  projectIds: string[];
  productKey: "eos-3";
  capabilities: Eos3ConnectorCapability[];
  authMethod: "oauth" | "api_key" | "certificate" | "none_synthetic";
  executionMode: "FILE_EXCHANGE" | "REMOTE_API" | "LOCAL_HOSTED" | "MANUAL_IMPORT" | "EOS_HOSTED";
  status: "configured" | "enabled" | "disabled";
  health: ConnectorHealth;
  qualificationState: ConnectorQualificationState;
  systemOfRecord: SystemOfRecordClass;
  ownerId: string;
  configurationRevision: number;
  enabledExecution: boolean;
  secretRef: string | null;
  provenance: Record<string, unknown>;
  audit: Array<{ action: string; actorId: string | null; at: string; detail: Record<string, unknown> }>;
};

export type ImportEnvelope = {
  importId: string;
  sourceSystem: string;
  sourceIdentifier: string;
  sourceRevision: string;
  importTime: string;
  connectorId: string;
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  contentHash: string;
  classification: "RESULT" | "DOCUMENT" | "MODEL" | "METADATA";
  qualificationState: ConnectorQualificationState;
  eosOwnsSource: false;
  systemOfRecord: SystemOfRecordClass;
  provenance: Record<string, unknown>;
  indexedForRetrieval: boolean;
};

export type ExportEnvelope = {
  exportId: string;
  objectId: string;
  revisionId: string | null;
  targetConnectorId: string;
  targetSystem: string;
  actorId: string;
  at: string;
  format: string;
  version: string;
  authorizationRole: string;
  status: "EXPORTED" | "FAILED" | "DENIED";
  externalAcceptanceImplied: false;
  provenance: Record<string, unknown>;
};

export type ExternalRevisionMapping = {
  mappingId: string;
  connectorId: string;
  sourceSystem: string;
  sourceIdentifier: string;
  sourceRevision: string;
  eosObjectId: string;
  eosRevisionId: string | null;
  tenantId: string;
  workspaceId: string;
  createdAt: string;
};

export type IntegrationConflict = {
  conflictId: string;
  connectorId: string;
  eosObjectId: string;
  eosRevisionId: string | null;
  externalRevision: string;
  reason: string;
  silentOverwrite: false;
  resolved: boolean;
  visible: true;
};

function id(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}
function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function createSecretVault(): ConnectorSecretVault {
  return { vaultId: id(), secrets: new Map() };
}

export function storeConnectorSecret(
  vault: ConnectorSecretVault,
  connectorId: string,
  secretValue: string,
): { cipherRef: string } {
  const cipherRef = `vault://${vault.vaultId}/${connectorId}/${hash(secretValue).slice(0, 16)}`;
  vault.secrets.set(connectorId, { cipherRef, neverLog: true });
  return { cipherRef };
}

/** Unauthorized roles cannot read secret material. */
export function readConnectorSecret(
  vault: ConnectorSecretVault,
  connectorId: string,
  caller: { role: string; authorizedSecretAccess: boolean },
): { allowed: false; reason: string } | { allowed: true; cipherRef: string; secretValue: never } {
  if (!caller.authorizedSecretAccess || caller.role === "ai") {
    return { allowed: false, reason: "credential_access_denied" };
  }
  const row = vault.secrets.get(connectorId);
  if (!row) return { allowed: false, reason: "secret_not_found" };
  // Never return plaintext; only cipher reference.
  return { allowed: true, cipherRef: row.cipherRef, secretValue: undefined as never };
}

export function redactForLog(payload: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (/secret|token|password|credential|api[_-]?key/i.test(k)) {
      out[k] = "[REDACTED]";
    } else if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = redactForLog(v as Record<string, unknown>);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function createConnector(input: {
  category: Eos3ConnectorCategory;
  provider: string;
  vendor: string;
  version: string;
  tenantId: string;
  workspaceId: string;
  projectIds?: string[];
  capabilities: Eos3ConnectorCapability[];
  authMethod: Eos3Connector["authMethod"];
  executionMode: Eos3Connector["executionMode"];
  ownerId: string;
  systemOfRecord?: SystemOfRecordClass;
  secretRef?: string | null;
}): Eos3Connector {
  return {
    connectorId: id(),
    category: input.category,
    provider: input.provider,
    vendor: input.vendor,
    version: input.version,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectIds: input.projectIds ?? [],
    productKey: "eos-3",
    capabilities: [...input.capabilities],
    authMethod: input.authMethod,
    executionMode: input.executionMode,
    status: "configured",
    health: "CONFIGURED",
    qualificationState: "INTEGRATED_NOT_VALIDATED",
    systemOfRecord: input.systemOfRecord ?? "EXTERNAL_AUTHORITATIVE",
    ownerId: input.ownerId,
    configurationRevision: 1,
    enabledExecution: false,
    secretRef: input.secretRef ?? null,
    provenance: buildEos3Provenance({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectIds?.[0] ?? null,
      objectId: null,
      revisionId: null,
      source: "eos3.integration.connector",
      actorId: input.ownerId,
      authority: "connector_owner",
      method: "createConnector",
      toolOrModel: null,
      evidenceClassification: "FACT",
      qualificationState: "INTEGRATED_NOT_VALIDATED",
    }),
    audit: [{ action: "created", actorId: input.ownerId, at: now(), detail: { health: "CONFIGURED" } }],
  };
}

export function authorizeConnectorAccess(
  caller: {
    authenticated: boolean;
    tenantId: string | null;
    workspaceId: string | null;
    eos3Entitled: boolean;
    eos3Enrolled: boolean;
    productionEnvironment?: boolean;
  },
  connector: Eos3Connector,
  capability?: Eos3ConnectorCapability,
): { allowed: boolean; reason?: string } {
  if (!caller.authenticated) return { allowed: false, reason: "unauthenticated" };
  if (caller.productionEnvironment) return { allowed: false, reason: "production_denied" };
  if (!caller.eos3Entitled || !caller.eos3Enrolled) return { allowed: false, reason: "not_entitled" };
  if (caller.tenantId !== connector.tenantId) return { allowed: false, reason: "tenant_mismatch" };
  if (caller.workspaceId !== connector.workspaceId) return { allowed: false, reason: "workspace_mismatch" };
  if (capability && !connector.capabilities.includes(capability)) {
    return { allowed: false, reason: "capability_not_granted" };
  }
  return { allowed: true };
}

/** Configuration != enabled execution. Requires human checkpoint. */
export function enableConnector(
  connector: Eos3Connector,
  actor: { actorId: string; role: string; isAi?: boolean },
): Eos3Connector {
  if (actor.isAi || actor.role === "ai") throw new Error("ai_cannot_enable_connector");
  if (!["owner", "admin", "integration_admin"].includes(actor.role)) {
    throw new Error("insufficient_connector_enablement_authority");
  }
  return {
    ...connector,
    status: "enabled",
    enabledExecution: true,
    health: connector.health === "CONFIGURED" ? "AVAILABLE" : connector.health,
    configurationRevision: connector.configurationRevision + 1,
    audit: [
      ...connector.audit,
      { action: "enabled", actorId: actor.actorId, at: now(), detail: { enabledExecution: true } },
    ],
  };
}

export function setConnectorHealth(connector: Eos3Connector, health: ConnectorHealth, actorId: string | null): Eos3Connector {
  // Health must never promote qualification.
  return {
    ...connector,
    health,
    qualificationState: connector.qualificationState,
    audit: [...connector.audit, { action: "health", actorId, at: now(), detail: { health } }],
  };
}

export class Eos3IntegrationStore {
  connectors: Eos3Connector[] = [];
  imports: ImportEnvelope[] = [];
  exports: ExportEnvelope[] = [];
  mappings: ExternalRevisionMapping[] = [];
  conflicts: IntegrationConflict[] = [];
  importKeys = new Set<string>();
  vault = createSecretVault();
  observability = {
    connectionFailures: 0,
    authFailures: 0,
    imports: 0,
    exports: 0,
    conflicts: 0,
  };

  register(connector: Eos3Connector): void {
    this.connectors.push(connector);
  }

  importArtifact(input: {
    connector: Eos3Connector;
    sourceSystem: string;
    sourceIdentifier: string;
    sourceRevision: string;
    actorId: string;
    projectId: string;
    content: string;
    classification: ImportEnvelope["classification"];
    authorizedForIndex?: boolean;
    existingEosRevision?: string | null;
  }): ImportEnvelope | { conflict: IntegrationConflict } {
    if (!input.connector.enabledExecution) throw new Error("connector_not_enabled");
    const key = `${input.connector.connectorId}:${input.sourceIdentifier}:${input.sourceRevision}`;
    if (this.importKeys.has(key)) {
      const existing = this.imports.find(
        (i) =>
          i.connectorId === input.connector.connectorId &&
          i.sourceIdentifier === input.sourceIdentifier &&
          i.sourceRevision === input.sourceRevision,
      )!;
      return existing;
    }

    if (input.existingEosRevision && input.existingEosRevision !== input.sourceRevision) {
      const conflict: IntegrationConflict = {
        conflictId: id(),
        connectorId: input.connector.connectorId,
        eosObjectId: input.sourceIdentifier,
        eosRevisionId: input.existingEosRevision,
        externalRevision: input.sourceRevision,
        reason: "external_revision_conflicts_with_canonical",
        silentOverwrite: false,
        resolved: false,
        visible: true,
      };
      this.conflicts.push(conflict);
      this.observability.conflicts += 1;
      return { conflict };
    }

    const contentHash = hash(input.content);
    const envelope: ImportEnvelope = {
      importId: id(),
      sourceSystem: input.sourceSystem,
      sourceIdentifier: input.sourceIdentifier,
      sourceRevision: input.sourceRevision,
      importTime: now(),
      connectorId: input.connector.connectorId,
      actorId: input.actorId,
      tenantId: input.connector.tenantId,
      workspaceId: input.connector.workspaceId,
      projectId: input.projectId,
      contentHash,
      classification: input.classification,
      qualificationState: input.connector.qualificationState,
      eosOwnsSource: false,
      systemOfRecord: input.connector.systemOfRecord,
      provenance: buildEos3Provenance({
        tenantId: input.connector.tenantId,
        workspaceId: input.connector.workspaceId,
        projectId: input.projectId,
        objectId: input.sourceIdentifier,
        revisionId: input.sourceRevision,
        source: input.sourceSystem,
        actorId: input.actorId,
        authority: "importer",
        method: "importArtifact",
        toolOrModel: input.connector.provider,
        evidenceClassification: input.classification === "RESULT" ? "RESULT" : "FACT",
        qualificationState: input.connector.qualificationState,
      }),
      indexedForRetrieval: Boolean(input.authorizedForIndex),
    };
    this.imports.push(envelope);
    this.importKeys.add(key);
    this.observability.imports += 1;

    this.mappings.push({
      mappingId: id(),
      connectorId: input.connector.connectorId,
      sourceSystem: input.sourceSystem,
      sourceIdentifier: input.sourceIdentifier,
      sourceRevision: input.sourceRevision,
      eosObjectId: `eos-ref:${input.sourceIdentifier}`,
      eosRevisionId: `eos-rev:${input.sourceRevision}`,
      tenantId: input.connector.tenantId,
      workspaceId: input.connector.workspaceId,
      createdAt: now(),
    });
    return envelope;
  }

  exportArtifact(input: {
    connector: Eos3Connector;
    objectId: string;
    revisionId: string | null;
    actorId: string;
    format: string;
    authorizationRole: string;
  }): ExportEnvelope {
    const env: ExportEnvelope = {
      exportId: id(),
      objectId: input.objectId,
      revisionId: input.revisionId,
      targetConnectorId: input.connector.connectorId,
      targetSystem: input.connector.provider,
      actorId: input.actorId,
      at: now(),
      format: input.format,
      version: input.connector.version,
      authorizationRole: input.authorizationRole,
      status: "EXPORTED",
      externalAcceptanceImplied: false,
      provenance: buildEos3Provenance({
        tenantId: input.connector.tenantId,
        workspaceId: input.connector.workspaceId,
        projectId: null,
        objectId: input.objectId,
        revisionId: input.revisionId,
        source: "eos3.integration.export",
        actorId: input.actorId,
        authority: input.authorizationRole,
        method: "exportArtifact",
        toolOrModel: input.connector.provider,
        evidenceClassification: "FACT",
        qualificationState: null,
      }),
    };
    this.exports.push(env);
    this.observability.exports += 1;
    return env;
  }
}

export const EOS3_DMS_BOUNDARY_PRESERVED = true as const;
export const EOS3_ARBITRARY_CODE_EXECUTION_DISABLED = true as const;
export const AI_CONNECTOR_CREDENTIAL_AUTHORITY = false as const;
export const AI_SOLVER_QUALIFICATION_AUTHORITY = false as const;
