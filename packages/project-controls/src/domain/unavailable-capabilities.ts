/**
 * Phase 11N — machine-readable matrix of what Project Controls V1.0 does NOT do.
 */

import {
  AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED,
  AUTOMATIC_DECISION_EXECUTION_ENABLED,
  BUDGET_LEDGER_IMPLEMENTED,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FINANCIAL_POSTING_IMPLEMENTED,
  PROJECT_CONTROLS_VERSION,
  RESOURCE_LEVELING_IMPLEMENTED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
} from "../version";

export type UnavailabilityKind = "unavailable";

export type UnavailableCapabilityEntry = {
  capabilityId: string;
  label: string;
  kind: UnavailabilityKind;
  governingFlag: string;
  flagValue: boolean;
  userFacingLabel: string;
  reason: string;
  owner: string | null;
};

export const PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES: readonly UnavailableCapabilityEntry[] = [
  {
    capabilityId: "project_controls.native_cpm",
    label: "Native CPM scheduling",
    kind: "unavailable",
    governingFlag: "CPM_SCHEDULING_IMPLEMENTED",
    flagValue: CPM_SCHEDULING_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Schedule intelligence is descriptive and advisory. No CPM engine runs in V1.0.",
    owner: null,
  },
  {
    capabilityId: "project_controls.critical_path_engine",
    label: "Critical path engine",
    kind: "unavailable",
    governingFlag: "CPM_SCHEDULING_IMPLEMENTED",
    flagValue: CPM_SCHEDULING_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "No forward/backward pass or float computation in V1.0.",
    owner: null,
  },
  {
    capabilityId: "project_controls.resource_leveling",
    label: "Resource leveling",
    kind: "unavailable",
    governingFlag: "RESOURCE_LEVELING_IMPLEMENTED",
    flagValue: RESOURCE_LEVELING_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Resource planning and leveling stay outside Project Controls V1.0.",
    owner: null,
  },
  {
    capabilityId: "project_controls.schedule_execution",
    label: "Schedule execution",
    kind: "unavailable",
    governingFlag: "SCHEDULE_EXECUTION_IMPLEMENTED",
    flagValue: SCHEDULE_EXECUTION_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Schedule intelligence never executes schedule changes.",
    owner: null,
  },
  {
    capabilityId: "project_controls.financial_posting",
    label: "Financial posting",
    kind: "unavailable",
    governingFlag: "FINANCIAL_POSTING_IMPLEMENTED",
    flagValue: FINANCIAL_POSTING_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Project Controls is not a ledger and posts nothing.",
    owner: "external_finance_or_future_finance_domain",
  },
  {
    capabilityId: "project_controls.budget_ledger",
    label: "Budget ledger",
    kind: "unavailable",
    governingFlag: "BUDGET_LEDGER_IMPLEMENTED",
    flagValue: BUDGET_LEDGER_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Cost intelligence is descriptive. No budget ledger in V1.0.",
    owner: "external_finance_or_future_finance_domain",
  },
  {
    capabilityId: "project_controls.accounting_ledger",
    label: "Accounting ledger",
    kind: "unavailable",
    governingFlag: "FINANCIAL_POSTING_IMPLEMENTED",
    flagValue: FINANCIAL_POSTING_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Accounting and billing sit in an external finance domain.",
    owner: "external_finance_or_future_finance_domain",
  },
  {
    capabilityId: "project_controls.autonomous_project_management",
    label: "Autonomous project management",
    kind: "unavailable",
    governingFlag: "AUTOMATIC_DECISION_EXECUTION_ENABLED",
    flagValue: AUTOMATIC_DECISION_EXECUTION_ENABLED,
    userFacingLabel: "UNAVAILABLE — human owns project decisions",
    reason: "Decision support is advisory only. No automatic decision execution.",
    owner: "human_only",
  },
  {
    capabilityId: "project_controls.automatic_contract_instruction",
    label: "Automatic contract instruction",
    kind: "unavailable",
    governingFlag: "AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED",
    flagValue: AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED,
    userFacingLabel: "UNAVAILABLE — not a production function of V1.0",
    reason: "Contractual change authority stays outside Project Controls.",
    owner: "reserved_not_project_controls",
  },
  {
    capabilityId: "project_controls.earned_value",
    label: "Earned value (EV/CPI/SPI)",
    kind: "unavailable",
    governingFlag: "EARNED_VALUE_IMPLEMENTED",
    flagValue: EARNED_VALUE_IMPLEMENTED,
    userFacingLabel: "UNAVAILABLE — progress is not earned value",
    reason: "Progress intelligence is advisory and evidence-driven, not EV.",
    owner: null,
  },
] as const;

export function listUnavailableCapabilities(): readonly UnavailableCapabilityEntry[] {
  return PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES;
}

export function isCapabilityUnavailable(capabilityId: string): boolean {
  return PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES.some((e) => e.capabilityId === capabilityId);
}

export function assertUnavailableCapabilitiesClosed(): {
  ok: true;
  version: string;
  unavailableCount: number;
} {
  for (const entry of PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES) {
    if (entry.flagValue !== false) {
      throw new Error(`unavailable_capability_opened:${entry.capabilityId}`);
    }
    if (!entry.userFacingLabel.startsWith("UNAVAILABLE")) {
      throw new Error(`unavailable_capability_mislabelled:${entry.capabilityId}`);
    }
  }
  return {
    ok: true,
    version: PROJECT_CONTROLS_VERSION,
    unavailableCount: PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES.length,
  };
}
