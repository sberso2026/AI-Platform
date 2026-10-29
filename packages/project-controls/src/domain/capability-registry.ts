/**
 * Phase 11N — frozen Project Controls V1.0 capability registry.
 *
 * Maturity is part of the contract, not marketing copy:
 *   ga          — production capability, deterministic/governed output
 *   ga_advisory — production capability whose output is advisory input to a
 *                 human decision; it never mutates canonical Engineering state
 *   unavailable — explicitly not a production function of V1.0
 */

import {
  AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED,
  AUTOMATIC_DECISION_EXECUTION_ENABLED,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FINANCIAL_POSTING_IMPLEMENTED,
  PROJECT_CONTROLS_MODULE_KEY,
  PROJECT_CONTROLS_VERSION,
  RESOURCE_LEVELING_IMPLEMENTED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
} from "../version";

export type ProjectCapabilityMaturity = "ga" | "ga_advisory" | "unavailable";

export type ProjectCapabilityEntry = {
  id: string;
  surface: string;
  maturity: ProjectCapabilityMaturity;
  entitlement: string;
  /** V1.0 never mutates canonical Engineering OS state from intelligence output. */
  mutatesCanonicalState: false;
  /** V1.0 never executes contractual or schedule instructions. */
  executesInstruction: false;
  implementationRef: string | null;
  note: string;
};

export const PROJECT_CONTROLS_CAPABILITY_CATALOG: readonly ProjectCapabilityEntry[] = [
  {
    id: "project_controls.progress",
    surface: "progress",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/progress-engine",
    note: "Descriptive progress intelligence. Not earned value.",
  },
  {
    id: "project_controls.schedule",
    surface: "schedule",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/schedule-engine",
    note: "Descriptive schedule intelligence. Not CPM or execution.",
  },
  {
    id: "project_controls.change",
    surface: "change",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/change-engine",
    note: "Descriptive change intelligence. Not contractual authority.",
  },
  {
    id: "project_controls.cost",
    surface: "cost",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/cost-engine",
    note: "Descriptive cost intelligence. Not a budget ledger.",
  },
  {
    id: "project_controls.productivity",
    surface: "productivity",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/productivity-engine",
    note: "Descriptive productivity intelligence. Not workforce management.",
  },
  {
    id: "project_controls.forecast",
    surface: "forecast",
    maturity: "ga_advisory",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/forecast-engine",
    note: "Advisory trajectory from composed contributors. Not predictive scheduling.",
  },
  {
    id: "project_controls.decision_support",
    surface: "decision",
    maturity: "ga_advisory",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/decision-engine",
    note: "Advisory options and recommendations. Human owns decisions.",
  },
  {
    id: "project_controls.scenario_intelligence",
    surface: "scenario",
    maturity: "ga_advisory",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/scenario-engine",
    note: "Exploratory scenario comparison. Not optimisation or auto-execution.",
  },
  {
    id: "project_controls.risk_opportunity_intelligence",
    surface: "risk_opportunity",
    maturity: "ga_advisory",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/risk-opportunity-engine",
    note: "Advisory risk/opportunity signals. No register mutation.",
  },
  {
    id: "project_controls.assurance_intelligence",
    surface: "assurance",
    maturity: "ga_advisory",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/assurance-engine",
    note: "Advisory assurance posture. Not verification or certification authority.",
  },
  {
    id: "project_controls.explainability_intelligence",
    surface: "explainability",
    maturity: "ga_advisory",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/explainability-engine",
    note: "Public explainability summaries with traces. Not chain-of-thought.",
  },
  {
    id: "project_controls.organizational_learning",
    surface: "organizational_learning",
    maturity: "ga_advisory",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/organizational-learning-engine",
    note: "Advisory organizational learning references. No knowledge mutation.",
  },
  {
    id: "project_controls.project_context",
    surface: "profile",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/project-context-engine",
    note: "Project Context Engine composes intelligence about a project reference.",
  },
  {
    id: "project_controls.project_context_composition",
    surface: "composition",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/project-context-composition",
    note: "Twelve active contributors composed into a ProjectProfile.",
  },
  {
    id: "project_controls.snapshot",
    surface: "snapshot",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/engine#createProjectSnapshot",
    note: "Immutable identifier-only project snapshots.",
  },
  {
    id: "project_controls.timeline",
    surface: "timeline",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/engine#listProjectTimeline",
    note: "Append-only project intelligence timeline.",
  },
  {
    id: "project_controls.shared_project_domain",
    surface: "shared_domain",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "engineering-shared-project-domain",
    note: "Consumes ProjectReference from Engineering Shared Project Domain only.",
  },
  {
    id: "project_controls.review_workflow",
    surface: "workflow",
    maturity: "ga",
    entitlement: "project_controls.review",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/review-workflow",
    note: "Governed human review with segregation of duties.",
  },
  {
    id: "project_controls.rls",
    surface: "rls",
    maturity: "ga",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: "domain/postgres-repository",
    note: "Tenant and workspace isolation on every persistence table.",
  },
  {
    id: "project_controls.native_cpm",
    surface: "schedule",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. No native CPM in V1.0.",
  },
  {
    id: "project_controls.critical_path_engine",
    surface: "schedule",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. No critical path computation in V1.0.",
  },
  {
    id: "project_controls.resource_leveling",
    surface: "schedule",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. No resource leveling in V1.0.",
  },
  {
    id: "project_controls.schedule_execution",
    surface: "schedule",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. Schedule intelligence does not execute schedule changes.",
  },
  {
    id: "project_controls.financial_posting",
    surface: "cost",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. Project Controls posts nothing to a ledger.",
  },
  {
    id: "project_controls.budget_ledger",
    surface: "cost",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. No budget ledger in V1.0.",
  },
  {
    id: "project_controls.accounting_ledger",
    surface: "cost",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. No accounting ledger in V1.0.",
  },
  {
    id: "project_controls.autonomous_project_management",
    surface: "decision",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. No autonomous project management in V1.0.",
  },
  {
    id: "project_controls.automatic_contract_instruction",
    surface: "change",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. No automatic contract instruction in V1.0.",
  },
  {
    id: "project_controls.earned_value",
    surface: "progress",
    maturity: "unavailable",
    entitlement: "project_controls.read",
    mutatesCanonicalState: false,
    executesInstruction: false,
    implementationRef: null,
    note: "UNAVAILABLE. Progress intelligence is not earned value.",
  },
] as const;

export const REQUIRED_GA_CAPABILITY_IDS: readonly string[] = [
  "project_controls.progress",
  "project_controls.schedule",
  "project_controls.change",
  "project_controls.cost",
  "project_controls.productivity",
  "project_controls.forecast",
  "project_controls.decision_support",
  "project_controls.scenario_intelligence",
  "project_controls.risk_opportunity_intelligence",
  "project_controls.assurance_intelligence",
  "project_controls.explainability_intelligence",
  "project_controls.organizational_learning",
  "project_controls.project_context",
  "project_controls.snapshot",
  "project_controls.timeline",
];

export function listCapabilitiesByMaturity(
  maturity: ProjectCapabilityMaturity,
): readonly ProjectCapabilityEntry[] {
  return PROJECT_CONTROLS_CAPABILITY_CATALOG.filter((c) => c.maturity === maturity);
}

export function getProjectCapability(id: string): ProjectCapabilityEntry | undefined {
  return PROJECT_CONTROLS_CAPABILITY_CATALOG.find((c) => c.id === id);
}

export function assertCapabilityCatalogComplete(): {
  ok: true;
  version: string;
  gaCount: number;
  unavailableCount: number;
} {
  const ids = PROJECT_CONTROLS_CAPABILITY_CATALOG.map((c) => c.id);
  if (new Set(ids).size !== ids.length) throw new Error("capability_duplicate_id");

  for (const required of REQUIRED_GA_CAPABILITY_IDS) {
    const entry = getProjectCapability(required);
    if (!entry) throw new Error(`missing_capability:${required}`);
    if (entry.maturity !== "ga" && entry.maturity !== "ga_advisory") {
      throw new Error(`capability_not_ga:${required}`);
    }
  }

  for (const entry of PROJECT_CONTROLS_CAPABILITY_CATALOG) {
    if (entry.mutatesCanonicalState !== false) {
      throw new Error(`capability_mutates_canonical_state:${entry.id}`);
    }
    if (entry.executesInstruction !== false) {
      throw new Error(`capability_executes_instruction:${entry.id}`);
    }
    if (entry.maturity === "unavailable" && entry.implementationRef !== null) {
      throw new Error(`unavailable_capability_has_implementation:${entry.id}`);
    }
  }

  if (CPM_SCHEDULING_IMPLEMENTED !== false) throw new Error("capability_cpm_enabled");
  if (EARNED_VALUE_IMPLEMENTED !== false) throw new Error("capability_ev_enabled");
  if (FINANCIAL_POSTING_IMPLEMENTED !== false) throw new Error("capability_financial_posting");
  if (SCHEDULE_EXECUTION_IMPLEMENTED !== false) throw new Error("capability_schedule_execution");
  if (RESOURCE_LEVELING_IMPLEMENTED !== false) throw new Error("capability_resource_leveling");
  if (AUTOMATIC_DECISION_EXECUTION_ENABLED !== false) {
    throw new Error("capability_automatic_decision_execution");
  }
  if (AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED !== false) {
    throw new Error("capability_automatic_contract_instruction");
  }

  return {
    ok: true,
    version: PROJECT_CONTROLS_VERSION,
    gaCount: PROJECT_CONTROLS_CAPABILITY_CATALOG.filter(
      (c) => c.maturity === "ga" || c.maturity === "ga_advisory",
    ).length,
    unavailableCount: listCapabilitiesByMaturity("unavailable").length,
  };
}

export function toCapabilityRegistryRegistrationPayload(
  entry: ProjectCapabilityEntry,
  tenantId: string,
) {
  return {
    tenantId,
    moduleKey: PROJECT_CONTROLS_MODULE_KEY,
    capabilityId: entry.id,
    version: PROJECT_CONTROLS_VERSION,
    maturity: entry.maturity,
    entitlement: entry.entitlement,
    available: entry.maturity === "ga" || entry.maturity === "ga_advisory",
  };
}
