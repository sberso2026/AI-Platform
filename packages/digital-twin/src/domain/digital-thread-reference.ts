/**
 * Phase 12K — typed Digital Thread references (compose REFERENCES only).
 * Cross-domain refs ≠ ownership. Never duplicate Assets/Projects/documents/II/AI/PC/PI/
 * time-series/KG stores/simulation artefact binaries.
 */

export const DIGITAL_THREAD_REFERENCE_KINDS = [
  "twin",
  "twin_thread_link",
  "twin_snapshot",
  "twin_timeline",
  "asset",
  "project",
  "representation",
  "representation_element",
  "state",
  "telemetry_binding",
  "time_series_window",
  "inspection_intelligence",
  "asset_intelligence",
  "project_intelligence",
  "project_controls",
  "document",
  "simulation_definition",
  "simulation_scenario",
  "simulation_input_set",
  "simulation_run",
  "simulation_result",
  "simulated_state",
  "simulation_package",
  "method_qualification",
  "provider_qualification",
  "application_qualification",
  "execution_qualification",
  "capability_qualification",
  "validation",
  "review",
  "knowledge_graph_node",
  "knowledge_graph_edge",
  /** Phase 12M — Shared Spatial Domain SpatialReference participation (refs only). */
  "spatial_reference",
] as const;

export type DigitalThreadReferenceKind =
  (typeof DIGITAL_THREAD_REFERENCE_KINDS)[number];

export type DigitalThreadReference = {
  threadReferenceId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  kind: DigitalThreadReferenceKind;
  /** Opaque foreign reference — never a duplicated payload. */
  targetRef: string;
  targetVersion?: string;
  /** Cross-domain refs do not transfer ownership. */
  ownershipClaimed: false;
  /** Simulation refs never imply observed state. */
  impliesObservedState: false;
  /** TwinSnapshot / TwinTimeline are integrated by reference only. */
  replacesTwinSnapshot: false;
  duplicatesSourceStore: false;
  adapterStatus?: "available" | "reserved" | "unavailable";
  label?: string;
  recordedAt: string;
};

export function createDigitalThreadReference(input: {
  threadReferenceId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  kind: DigitalThreadReferenceKind;
  targetRef: string;
  targetVersion?: string;
  adapterStatus?: DigitalThreadReference["adapterStatus"];
  label?: string;
  recordedAt?: string;
}): DigitalThreadReference {
  if (!input.targetRef.trim()) {
    throw new Error("digital_thread_reference_target_required");
  }
  return {
    threadReferenceId: input.threadReferenceId,
    twinId: input.twinId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    kind: input.kind,
    targetRef: input.targetRef,
    targetVersion: input.targetVersion,
    ownershipClaimed: false,
    impliesObservedState: false,
    replacesTwinSnapshot: false,
    duplicatesSourceStore: false,
    adapterStatus: input.adapterStatus,
    label: input.label,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
  };
}

/** Public contract hooks — mark reserved/unavailable when II/AI/PI/PC adapters missing. */
export function resolveCrossDomainAdapterStatus(input: {
  kind: DigitalThreadReferenceKind;
  hookAvailable?: boolean;
}): "available" | "reserved" | "unavailable" {
  const crossDomain: DigitalThreadReferenceKind[] = [
    "inspection_intelligence",
    "asset_intelligence",
    "project_intelligence",
    "project_controls",
    "document",
    "time_series_window",
    "knowledge_graph_node",
    "knowledge_graph_edge",
  ];
  if (!crossDomain.includes(input.kind)) return "available";
  if (input.hookAvailable === true) return "available";
  if (input.hookAvailable === false) return "unavailable";
  return "reserved";
}
