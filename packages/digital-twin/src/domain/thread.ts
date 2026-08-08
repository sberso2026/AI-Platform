/**
 * Phase 12B — Digital thread links.
 *
 * Connects Assets, Projects, Documents, Inspections, AI refs, PC refs.
 * Reuses Platform timelines by reference — does NOT duplicate timeline storage.
 */

export const THREAD_LINK_TARGET_TYPES = [
  "asset",
  "project",
  "document",
  "inspection",
  "asset_intelligence_ref",
  "project_controls_ref",
  "project_intelligence_ref",
  "inspection_intelligence_ref",
  "platform_timeline",
  "knowledge_graph_node",
  "other_twin",
  "representation_source_ref",
  "representation_element_ref",
  "simulation_definition_ref",
  "simulation_scenario_ref",
  "simulation_input_set_ref",
  "simulation_run_ref",
  "simulation_result_ref",
  "simulated_state_ref",
] as const;

export type ThreadLinkTargetType = (typeof THREAD_LINK_TARGET_TYPES)[number];

export const PLATFORM_TIMELINE_REFS = [
  "project_controls_project_timeline",
  "asset_intelligence_timeline",
  "inspection_intelligence_timeline",
  "engineering_project_timeline",
] as const;

export type PlatformTimelineRef = (typeof PLATFORM_TIMELINE_REFS)[number];

/** A link in the digital thread — reference to external artefact or timeline entry. */
export type DigitalThreadLink = {
  linkId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  targetType: ThreadLinkTargetType;
  targetRef: string;
  /** When targetType is platform_timeline, names the reused timeline store */
  platformTimelineRef?: PlatformTimelineRef;
  label?: string;
  recordedAt: string;
  createdBy?: string;
  /** Thread links reference only — no duplicate timeline rows */
  duplicatesTimelineStorage: false;
};

export type TwinThreadReference = {
  twinId: string;
  links: readonly DigitalThreadLink[];
};
