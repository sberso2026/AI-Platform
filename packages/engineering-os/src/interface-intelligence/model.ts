/**
 * EOS 2.11 cross-discipline interface intelligence.
 * Governs handoff revisions beside the canonical engineering interface identity.
 * This module does not replace that identity or the D1K structural interface runtime.
 * It does not recalculate engineering results or run autonomous change impact.
 */

import type { ConfigurationBaseline, DeliveryLifecycle, DeliveryStage } from "../delivery-lifecycle/model";

export const INTERFACE_DISCIPLINES = [
  "process",
  "mechanical",
  "piping",
  "structural",
  "civil",
  "geotechnical",
  "electrical",
  "instrumentation_and_control",
] as const;
export type InterfaceDiscipline = (typeof INTERFACE_DISCIPLINES)[number];

export const INTERFACE_STATUSES = [
  "draft",
  "ready_for_issue",
  "issued",
  "received",
  "under_review",
  "accepted",
  "accepted_with_conditions",
  "rejected",
  "superseded",
  "cancelled",
] as const;
export type InterfaceStatus = (typeof INTERFACE_STATUSES)[number];

export const INTERFACE_CATEGORIES = [
  "DESIGN_INPUT",
  "DESIGN_OUTPUT",
  "PHYSICAL_INTERFACE",
  "LOAD",
  "REACTION",
  "GEOMETRY",
  "DIMENSION",
  "LOCATION",
  "ELEVATION",
  "COORDINATE",
  "PROCESS_CONDITION",
  "MECHANICAL_DUTY",
  "EQUIPMENT_DATA",
  "NOZZLE_DATA",
  "PIPING_LOAD",
  "FOUNDATION_INPUT",
  "GEOTECHNICAL_PARAMETER",
  "CIVIL_LEVEL",
  "ELECTRICAL_LOAD",
  "POWER_SUPPLY",
  "CONTROL_SIGNAL",
  "INSTRUMENT_REQUIREMENT",
  "SAFETY_REQUIREMENT",
  "UTILITY_REQUIREMENT",
  "MAINTENANCE_REQUIREMENT",
  "ACCESS_REQUIREMENT",
  "VENDOR_DATA",
  "MODEL_INTERFACE",
  "DOCUMENT_INTERFACE",
  "OTHER",
] as const;
export type InterfaceCategory = (typeof INTERFACE_CATEGORIES)[number];

export const AI_INTERFACE_ACCEPTANCE_AUTHORITY = false as const;
export const AI_INTERFACE_VALUE_MUTATION_AUTHORITY = false as const;
export const AI_AUTOMATIC_ENGINEERING_RECALCULATION = false as const;
export const AUTONOMOUS_CHANGE_IMPACT_READY = false as const;

export type Freshness = "current" | "potentially_stale";
export type ReceiverDecision = "pending" | "received" | "under_review" | "accepted" | "accepted_with_conditions" | "rejected";

export type InterfaceReceiver = {
  discipline: InterfaceDiscipline;
  status: ReceiverDecision;
  condition: string | null;
  blocksStage: DeliveryStage | null;
  rationale: string | null;
};

export type EngineeringInterface = {
  id: string;
  revision: number;
  previousId: string | null;
  current: boolean;
  stage: DeliveryStage;
  maturity: "preliminary" | "controlled";
  sourceDiscipline: InterfaceDiscipline;
  receivers: InterfaceReceiver[];
  sourceObjectType: string;
  sourceObjectId: string | null;
  sourceRevision: string;
  receiverObjectType: string | null;
  receiverObjectId: string | null;
  category: InterfaceCategory;
  parameter: string;
  canonicalParameterId: string | null;
  value: string | null;
  unit: string | null;
  coordinateSystem: string | null;
  axisConvention: string | null;
  datum: string | null;
  transformationId: string | null;
  status: InterfaceStatus;
  criticality: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate: string | null;
  packageId: string | null;
  assumption: string | null;
  provenance: "SYNTHETIC_VALIDATION_FIXTURE" | "controlled";
  tqId: string | null;
  decisionId: string | null;
};

export type InterfaceRegister = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  stage: DeliveryStage;
  lifecycle: DeliveryLifecycle;
  interfaces: EngineeringInterface[];
  packages: Array<{ id: string; title: string; interfaceIds: string[] }>;
  dependencies: Array<{ id: string; fromId: string; toId: string; relation: "SUPPLIES" | "CONSUMES" | "DEPENDS_ON" | "SUPERSEDES" | "ACCEPTS" | "REJECTS" | "AFFECTS" | "REFERENCES" | "VERIFIES" }>;
  dependents: Array<{ id: string; kind: "input" | "model" | "calculation" | "deliverable"; inputIds: string[]; freshness: Freshness; conclusion: null }>;
  events: Array<{ type: string; interfaceId: string | null; at: string }>;
  baselines: Array<{ id: string; type: ConfigurationBaseline["baselineType"]; frozen: true; revisions: Array<{ id: string; revision: number; status: InterfaceStatus }> }>;
  audits: Array<{ action: string; at: string; actorId: string; actingRole: string; detail: Record<string, string | number | boolean | null> }>;
  canonicalInterfaceReplaced: false;
  d1kReplaced: false;
};
