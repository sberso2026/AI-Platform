/**
 * Phase 12D — DigitalTwinSourceAdapter metadata contract.
 *
 * Adapters declare how observed state candidates may enter the twin module.
 * No private coupling to II/PI — consume public contracts only where certified.
 */

import {
  ASSET_INTELLIGENCE_V1_TAG,
  PROJECT_CONTROLS_V1_TAG,
} from "../version";

export const SOURCE_ADAPTER_CLASSES = [
  "manual",
  "inspection_intelligence",
  "asset_intelligence",
  "project_controls",
  "project_intelligence",
  "external_api",
  "file_import",
  "telemetry_reference",
  "operational_system",
] as const;

export type SourceAdapterClass = (typeof SOURCE_ADAPTER_CLASSES)[number];

export const SOURCE_AUTHENTICATION_MODES = [
  "none",
  "service_account",
  "oauth",
  "api_key",
  "mutual_tls",
] as const;

export type SourceAuthenticationMode = (typeof SOURCE_AUTHENTICATION_MODES)[number];

export const SOURCE_POLLING_OR_PUSH_MODES = ["polling", "push", "manual"] as const;
export type SourcePollingOrPushMode = (typeof SOURCE_POLLING_OR_PUSH_MODES)[number];

export const SOURCE_ADAPTER_HEALTH = ["healthy", "degraded", "unhealthy", "unknown"] as const;
export type SourceAdapterHealth = (typeof SOURCE_ADAPTER_HEALTH)[number];

export const SOURCE_ADAPTER_STATUS = [
  "active",
  "inactive",
  "certified",
  "readiness_stub",
  "unsupported",
] as const;
export type SourceAdapterStatus = (typeof SOURCE_ADAPTER_STATUS)[number];

export type DigitalTwinSourceAdapter = {
  adapterId: string;
  adapterVersion: string;
  sourceType: SourceAdapterClass;
  sourceSystem: string;
  sourceOwner: string;
  supportedTargetTypes: string[];
  supportedStateSchemas: string[];
  authenticationMode: SourceAuthenticationMode;
  pollingOrPushMode: SourcePollingOrPushMode;
  dataFreshnessPolicy: string;
  idempotencySupport: boolean;
  health: SourceAdapterHealth;
  status: SourceAdapterStatus;
  /** Public contract reference only — no private module coupling */
  publicContractRef?: string;
  storesTelemetryPayload: false;
  autoPublishEnabled: false;
};

export const CERTIFIED_SOURCE_ADAPTERS: readonly DigitalTwinSourceAdapter[] = [
  {
    adapterId: "manual_governed",
    adapterVersion: "1.0.0",
    sourceType: "manual",
    sourceSystem: "digital_twin",
    sourceOwner: "digital_twin",
    supportedTargetTypes: ["asset", "project", "system"],
    supportedStateSchemas: ["twin.observed.manual.v1"],
    authenticationMode: "none",
    pollingOrPushMode: "manual",
    dataFreshnessPolicy: "manual_entry",
    idempotencySupport: true,
    health: "healthy",
    status: "certified",
    storesTelemetryPayload: false,
    autoPublishEnabled: false,
  },
  {
    adapterId: "asset_intelligence_public_contract",
    adapterVersion: "1.0.0",
    sourceType: "asset_intelligence",
    sourceSystem: "asset_intelligence",
    sourceOwner: "asset_intelligence",
    supportedTargetTypes: ["asset"],
    supportedStateSchemas: [
      "twin.observed.asset_intelligence.v1",
      "twin.observed.telemetry_projection.v1",
    ],
    authenticationMode: "service_account",
    pollingOrPushMode: "push",
    dataFreshnessPolicy: "advisory_slice",
    idempotencySupport: true,
    health: "healthy",
    status: "certified",
    publicContractRef: ASSET_INTELLIGENCE_V1_TAG,
    storesTelemetryPayload: false,
    autoPublishEnabled: false,
  },
  {
    adapterId: "project_controls_public_contract",
    adapterVersion: "1.0.0",
    sourceType: "project_controls",
    sourceSystem: "project_controls",
    sourceOwner: "project_controls",
    supportedTargetTypes: ["project"],
    supportedStateSchemas: ["twin.observed.project_controls.v1"],
    authenticationMode: "service_account",
    pollingOrPushMode: "push",
    dataFreshnessPolicy: "advisory_slice",
    idempotencySupport: true,
    health: "healthy",
    status: "certified",
    publicContractRef: PROJECT_CONTROLS_V1_TAG,
    storesTelemetryPayload: false,
    autoPublishEnabled: false,
  },
] as const;

export const READINESS_STUB_ADAPTERS: readonly DigitalTwinSourceAdapter[] = [
  {
    adapterId: "inspection_intelligence_readiness_stub",
    adapterVersion: "0.0.0",
    sourceType: "inspection_intelligence",
    sourceSystem: "inspection_intelligence",
    sourceOwner: "inspection_intelligence",
    supportedTargetTypes: ["asset"],
    supportedStateSchemas: [],
    authenticationMode: "service_account",
    pollingOrPushMode: "push",
    dataFreshnessPolicy: "unknown",
    idempotencySupport: false,
    health: "unknown",
    status: "readiness_stub",
    publicContractRef: "inspection-intelligence-v1.0.0",
    storesTelemetryPayload: false,
    autoPublishEnabled: false,
  },
  {
    adapterId: "project_intelligence_readiness_stub",
    adapterVersion: "0.0.0",
    sourceType: "project_intelligence",
    sourceSystem: "project_intelligence",
    sourceOwner: "project_intelligence",
    supportedTargetTypes: ["project"],
    supportedStateSchemas: [],
    authenticationMode: "service_account",
    pollingOrPushMode: "push",
    dataFreshnessPolicy: "unknown",
    idempotencySupport: false,
    health: "unknown",
    status: "readiness_stub",
    publicContractRef: "project-intelligence-v1.0.0",
    storesTelemetryPayload: false,
    autoPublishEnabled: false,
  },
] as const;

export function listSourceAdapters(): DigitalTwinSourceAdapter[] {
  return [...CERTIFIED_SOURCE_ADAPTERS, ...READINESS_STUB_ADAPTERS];
}

export function getSourceAdapter(adapterId: string): DigitalTwinSourceAdapter | undefined {
  return listSourceAdapters().find((a) => a.adapterId === adapterId);
}

export function assertAdapterCertified(adapter: DigitalTwinSourceAdapter): void {
  if (adapter.status !== "certified") {
    throw new Error(`source_adapter_not_certified:${adapter.adapterId}`);
  }
  if (adapter.autoPublishEnabled) {
    throw new Error("source_adapter_auto_publish_forbidden");
  }
  if (adapter.storesTelemetryPayload) {
    throw new Error("source_adapter_telemetry_payload_forbidden");
  }
}

export function assertAdapterSupportsSchema(
  adapter: DigitalTwinSourceAdapter,
  schemaId: string,
): void {
  if (!adapter.supportedStateSchemas.includes(schemaId)) {
    throw new Error(`source_adapter_schema_unsupported:${schemaId}`);
  }
}
