/**
 * Phase 12E — TelemetrySourceReference.
 *
 * Twin stores references to kernel/AI telemetry sources — never raw sensor payloads.
 */

export type TelemetrySourceKind =
  | "platform_kernel_telemetry"
  | "asset_intelligence_time_series"
  | "external_system";

export type TelemetrySourceReference = {
  sourceId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  sourceKind: TelemetrySourceKind;
  /** External ref to kernel event or AI series — not inline telemetry. */
  externalRef: string;
  /** When sourceKind is asset_intelligence_time_series, the AI series id. */
  engineeringSeriesId?: string;
  attributeKey?: string;
  displayName: string;
  description?: string;
  ownerModule: "platform_kernel_telemetry" | "asset_intelligence";
  storesRawTelemetry: false;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function createTelemetrySourceReference(input: {
  sourceId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  sourceKind: TelemetrySourceKind;
  externalRef: string;
  engineeringSeriesId?: string;
  attributeKey?: string;
  displayName: string;
  description?: string;
  ownerModule: TelemetrySourceReference["ownerModule"];
  createdBy?: string;
}): TelemetrySourceReference {
  const now = new Date().toISOString();
  return {
    sourceId: input.sourceId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    sourceKind: input.sourceKind,
    externalRef: input.externalRef,
    engineeringSeriesId: input.engineeringSeriesId,
    attributeKey: input.attributeKey,
    displayName: input.displayName,
    description: input.description,
    ownerModule: input.ownerModule,
    storesRawTelemetry: false,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function assertTelemetrySourceReferenceOnly(ref: TelemetrySourceReference): void {
  if (ref.storesRawTelemetry) {
    throw new Error("telemetry_source_raw_storage_forbidden");
  }
}
