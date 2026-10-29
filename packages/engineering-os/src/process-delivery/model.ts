/**
 * EOS 2.4 process design delivery.
 * Coordinates lifecycle and basis for process work.
 * This module does not evaluate process formulas or certify a simulator.
 */

import type { EngineeringBasisGraph } from "../engineering-basis/model";
import type { ConfigurationBaseline, DeliveryLifecycle } from "../delivery-lifecycle/model";

export const PROCESS_CAPABILITY_STATES = [
  "ARCHITECTURE_DEFINED",
  "IMPLEMENTED",
  "VALIDATED",
  "QUALIFIED",
  "EXTERNAL_TOOL_DEPENDENT",
  "BOUNDED_LIMITATION",
  "NOT_IMPLEMENTED",
] as const;

export const PROCESS_CAPABILITIES = [
  { id: "concept_workflow", stage: "concept", state: "IMPLEMENTED" },
  { id: "option_comparison", stage: "concept", state: "IMPLEMENTED" },
  { id: "feasibility_workflow", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "mass_balance_governance", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "mass_balance_calculation", stage: "feasibility", state: "NOT_IMPLEMENTED" },
  { id: "energy_balance_governance", stage: "feasibility", state: "IMPLEMENTED" },
  { id: "thermodynamic_property_calculation", stage: "feasibility", state: "NOT_IMPLEMENTED" },
  { id: "feed_workflow", stage: "feed", state: "IMPLEMENTED" },
  { id: "pfd_governance", stage: "feed", state: "IMPLEMENTED" },
  { id: "pid_governance", stage: "feed", state: "IMPLEMENTED" },
  { id: "pfd_pid_drafting", stage: "feed", state: "NOT_IMPLEMENTED" },
  { id: "detailed_workflow", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "hydraulic_records", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "hydraulic_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "line_sizing_records", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "line_sizing_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "relief_records", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "relief_sizing_calculation", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "control_valve_records", stage: "detailed_engineering", state: "IMPLEMENTED" },
  { id: "hosted_simulator_execution", stage: "detailed_engineering", state: "NOT_IMPLEMENTED" },
  { id: "aspen_hysys", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "aspen_plus", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "unisim", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
  { id: "aft", stage: "detailed_engineering", state: "EXTERNAL_TOOL_DEPENDENT" },
] as const;

export const SIMULATOR_TOOLS = ["ASPEN_HYSYS", "ASPEN_PLUS", "UNISIM", "AFT_FATHOM", "AFT_ARROW"] as const;
export type SimulatorTool = (typeof SIMULATOR_TOOLS)[number];

export const OPERATING_CASE_KINDS = ["normal", "minimum", "maximum", "startup", "shutdown", "standby", "upset", "emergency", "future_design"] as const;

export type ProcessOption = {
  id: string;
  title: string;
  route: "adsorption_dehydration" | "absorption_dehydration" | "other";
  stage: DeliveryLifecycle["stage"];
  facts: string[];
  assumptions: string[];
  estimates: string[];
  unresolved: string[];
};

export type ProcessStream = {
  id: string;
  name: string;
  fromSystemId: string | null;
  toSystemId: string | null;
  phase: string | null;
  flow: string | null;
  flowUnit: string | null;
  pressure: string | null;
  pressureUnit: string | null;
  temperature: string | null;
  temperatureUnit: string | null;
  caseId: string | null;
  inputIds: string[];
  revision: number;
  status: "current" | "superseded";
  freshness: "current" | "potentially_stale";
  synthetic: boolean;
};

export type ProcessDelivery = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  projectTitle: string;
  assetName: string | null;
  lifecycle: DeliveryLifecycle;
  basis: EngineeringBasisGraph;
  options: ProcessOption[];
  systems: Array<{ id: string; name: string; stage: DeliveryLifecycle["stage"] }>;
  subsystems: Array<{ id: string; name: string; systemId: string }>;
  streams: ProcessStream[];
  components: Array<{ id: string; name: string; streamId: string }>;
  cases: Array<{ id: string; kind: string; name: string; stage: DeliveryLifecycle["stage"] }>;
  inputs: Array<{ id: string; name: string; value: string | null; unit: string | null; revision: number; status: "current" | "superseded"; synthetic: boolean }>;
  models: Array<{ id: string; purpose: string; tool: SimulatorTool | "synthetic_fixture"; revision: number; inputIds: string[]; freshness: "current" | "potentially_stale"; executionCertified: false }>;
  runs: Array<{ id: string; modelId: string; provenance: string; convergenceClaimed: false; synthetic: boolean }>;
  massBalances: Array<{ id: string; caseId: string | null; inputIds: string[]; totalFlow: string | null; unit: string | null; freshness: "current" | "potentially_stale"; synthetic: boolean; calculatedHere: false }>;
  energyBalances: Array<{ id: string; caseId: string | null; inputIds: string[]; duty: string | null; unit: string | null; freshness: "current" | "potentially_stale"; synthetic: boolean; calculatedHere: false }>;
  calculations: Array<{ id: string; purpose: string; inputIds: string[]; engine: "not_calculated" | "imported_reference"; freshness: "current" | "potentially_stale"; synthetic: boolean }>;
  duties: Array<{ id: string; equipment: string; duty: string | null; unit: string | null; inputIds: string[]; freshness: "current" | "potentially_stale"; synthetic: boolean }>;
  utilities: Array<{ id: string; utility: string; demand: string | null; unit: string | null; inputIds: string[]; freshness: "current" | "potentially_stale" }>;
  hydraulics: Array<{ id: string; lineId: string; result: null; status: "CALCULATION_EXTERNAL_OR_NOT_IMPLEMENTED" }>;
  lineSizing: Array<{ id: string; lineId: string; selectedSize: string | null; method: "not_calculated" }>;
  reliefCases: Array<{ id: string; scenario: string; rate: null; status: "CALCULATION_EXTERNAL_OR_NOT_IMPLEMENTED" }>;
  controlValves: Array<{ id: string; service: string; cv: string | null; method: "not_calculated" }>;
  envelopes: Array<{ id: string; name: string; caseIds: string[] }>;
  interfaces: Array<{ id: string; consumer: "mechanical" | "piping" | "electrical" | "instrumentation_and_control" | "structural" | "civil"; parameter: string; status: "proposed" | "accepted"; inputId: string | null; freshness: "current" | "potentially_stale" }>;
  safetyActions: Array<{ id: string; study: "HAZID" | "HAZOP" | "LOPA" | "SIL" | "RELIEF" | "ALARM"; statement: string; status: "open" | "closed"; closedByAi: false }>;
  pfds: Array<{ id: string; title: string; revision: number; stage: DeliveryLifecycle["stage"]; inputIds: string[]; freshness: "current" | "potentially_stale"; draftedHere: false }>;
  pids: Array<{ id: string; title: string; revision: number; stage: DeliveryLifecycle["stage"]; inputIds: string[]; freshness: "current" | "potentially_stale"; draftedHere: false }>;
  risks: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  decisions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"] }>;
  assumptions: Array<{ id: string; statement: string; stage: DeliveryLifecycle["stage"]; blocksNextStage: boolean }>;
  requirements: Array<{ id: string; title: string; sourceId: string | null; stage: DeliveryLifecycle["stage"] }>;
  reviews: Array<{ id: string; subjectId: string; revision: number; outcome: string; role: string; approvalGranted: boolean }>;
  deliverables: Array<{ id: string; title: string; stage: DeliveryLifecycle["stage"]; maturity: string; revision: number; basisLinked: boolean; requirementLinked: boolean; reviewId: string | null; freshness: "current" | "potentially_stale"; inputIds: string[]; ifc: false }>;
  baselines: Array<{ id: string; type: ConfigurationBaseline["baselineType"]; frozen: true; inputIds: string[] }>;
  simulatorPackages: Array<{ id: string; tool: SimulatorTool; executionCertified: false; status: "metadata_only" }>;
  audits: Array<{ action: string; at: string; actorId: string; detail: Record<string, string | number | boolean | null> }>;
};
