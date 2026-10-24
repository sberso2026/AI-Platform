/**
 * Phase 12E — TwinTelemetryBinding lifecycle.
 *
 * draft → pending_review → approved → published → suspended → superseded → retired
 * Stores references only — never raw telemetry values.
 */

import type { TelemetryChannelReference } from "./telemetry-channel";
import type { TelemetrySourceReference } from "./telemetry-source";

export const TELEMETRY_BINDING_LIFECYCLE = [
  "draft",
  "pending_review",
  "approved",
  "published",
  "suspended",
  "superseded",
  "retired",
] as const;

export type TelemetryBindingLifecycle = (typeof TELEMETRY_BINDING_LIFECYCLE)[number];

export type TwinTelemetryBinding = {
  bindingId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  sourceId: string;
  channelId: string;
  bindingKey: string;
  displayName: string;
  lifecycle: TelemetryBindingLifecycle;
  sourceRef: Pick<TelemetrySourceReference, "sourceKind" | "externalRef" | "ownerModule">;
  channelRef: Pick<TelemetryChannelReference, "channelKey" | "twinAttributeKey" | "unit">;
  engineeringSeriesId?: string;
  policyId?: string;
  reviewWorkflowInstanceId?: string;
  supersededByBindingId?: string;
  /** Optional Phase 12F representation element ref (domain field only). */
  representationElementRefId?: string;
  storesRawTelemetry: false;
  autoPublishEnabled: false;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
};

export function createTwinTelemetryBinding(input: {
  bindingId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  sourceId: string;
  channelId: string;
  bindingKey: string;
  displayName: string;
  sourceRef: TwinTelemetryBinding["sourceRef"];
  channelRef: TwinTelemetryBinding["channelRef"];
  engineeringSeriesId?: string;
  policyId?: string;
  representationElementRefId?: string;
  createdBy?: string;
}): TwinTelemetryBinding {
  const now = new Date().toISOString();
  return {
    bindingId: input.bindingId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    twinId: input.twinId,
    sourceId: input.sourceId,
    channelId: input.channelId,
    bindingKey: input.bindingKey,
    displayName: input.displayName,
    lifecycle: "draft",
    sourceRef: input.sourceRef,
    channelRef: input.channelRef,
    engineeringSeriesId: input.engineeringSeriesId,
    policyId: input.policyId,
    representationElementRefId: input.representationElementRefId,
    storesRawTelemetry: false,
    autoPublishEnabled: false,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
  };
}

export function assertBindingNotRawTelemetry(binding: TwinTelemetryBinding): void {
  if (binding.storesRawTelemetry || binding.autoPublishEnabled) {
    throw new Error("telemetry_binding_raw_storage_forbidden");
  }
}

export function canTransitionBindingLifecycle(
  from: TelemetryBindingLifecycle,
  to: TelemetryBindingLifecycle,
): boolean {
  const transitions: Record<TelemetryBindingLifecycle, TelemetryBindingLifecycle[]> = {
    draft: ["pending_review", "retired"],
    pending_review: ["approved", "draft", "retired"],
    approved: ["published", "pending_review", "retired"],
    published: ["suspended", "superseded", "retired"],
    suspended: ["published", "retired"],
    superseded: ["retired"],
    retired: [],
  };
  return transitions[from]?.includes(to) ?? false;
}
