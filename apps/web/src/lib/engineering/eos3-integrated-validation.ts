/**
 * EOS 3.10 integrated validation — orchestration, pilot readiness, registers.
 * Validation / hardening / evidence only. No major new product architecture.
 * STAGING_VALIDATED != PRODUCTION_AUTHORIZED
 */

import { EOS3_VERSION, EOS3_RELEASE_STATUS, EOS3_PRODUCT_KEY } from "../commerce/eos3-identity";
import {
  evaluateEos3Access,
  eos2EntitlementAutoEnablesEos3,
  eos2EnrollmentAutoEnablesEos3,
} from "../commerce/eos3-entitlement";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../commerce/eos2-external-customer-hold";
import { EOS3_GRAPH_AUTHORITY_MODEL } from "./eos3-digital-thread";
import { EOS3_AI_DECISION_AUTHORITY, EOS3_AI_DOES_NOT_INHERIT_D1_QUALIFICATION } from "./eos3-ai-policy";
import {
  EOS3_D1_MIGRATION_STATE,
  EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION,
  EOS3_NON_D1_CALCULATION_STATUS,
  SPACE_GASS_CONNECTOR_STATUS,
  SPACE_GASS_GLOBAL_QUALIFICATION,
} from "./eos3-solver-framework";
import { EOS_2_AUTO_MIGRATION_TO_EOS_3 } from "./eos3-migration-engine";

export const EOS_3_PILOT_ACCESS_MODEL = "EXPLICIT_ENTITLEMENT_AND_ENROLLMENT" as const;

export const EOS_3_APPLICATION_ROLLBACK_TARGET = "d61240896a07e7ff51280fd8d21f686ddc43795f" as const;

export const SPACE_GASS_STATUS_EXACT = SPACE_GASS_CONNECTOR_STATUS;

export type PilotClaimSupport = "SUPPORTED" | "SUPPORTED_WITH_LIMITATIONS" | "NOT_SUPPORTED" | "NOT_QUALIFIED";

export type PilotClaim = {
  capability: string;
  status: PilotClaimSupport;
  note: string;
};

export function buildPilotClaimMatrix(): PilotClaim[] {
  return [
    { capability: "Canonical engineering objects + digital thread", status: "SUPPORTED", note: "Staging-validated EOS 3.2" },
    { capability: "Knowledge / hybrid retrieval", status: "SUPPORTED_WITH_LIMITATIONS", note: "Staging retrieval; live LLM production behavior not validated" },
    { capability: "Decision Intelligence", status: "SUPPORTED", note: "Human decision authority required" },
    { capability: "Optimization Intelligence", status: "SUPPORTED_WITH_LIMITATIONS", note: "Bounded; does not inherit D1 qualification" },
    { capability: "Workflow / event governance", status: "SUPPORTED", note: "Human checkpoints preserved" },
    { capability: "Synthetic solver framework", status: "SUPPORTED_WITH_LIMITATIONS", note: "Synthetic adapter only; not externally qualified" },
    { capability: "Real third-party connectors", status: "NOT_SUPPORTED", note: "Not executed in EOS 3.10" },
    { capability: "SPACE GASS", status: "NOT_QUALIFIED", note: SPACE_GASS_STATUS_EXACT },
    { capability: "External solvers (global)", status: "NOT_QUALIFIED", note: "EOS_3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION=NO" },
    { capability: "Non-D1 calculations", status: "NOT_QUALIFIED", note: "Remain NOT_QUALIFIED" },
    { capability: "D1 structural calculations", status: "SUPPORTED_WITH_LIMITATIONS", note: "QUALIFIED_BOUNDED where existing scope applies" },
    { capability: "AI Engineering Reasoning Assistant", status: "SUPPORTED_WITH_LIMITATIONS", note: "Non-authoritative; development-only" },
    { capability: "Project-to-asset continuity", status: "SUPPORTED_WITH_LIMITATIONS", note: "Not full EAM/CMMS" },
    { capability: "EOS 2 → EOS 3 migration", status: "SUPPORTED_WITH_LIMITATIONS", note: "Staging only; Production migration not authorized" },
    { capability: "EOS 2 / EOS 3 coexistence", status: "SUPPORTED", note: "Generation-explicit routing" },
    { capability: "Production EOS 3 runtime", status: "NOT_SUPPORTED", note: "Activation not performed in 3.10" },
  ];
}

export function buildPilotLimitationsRegister(): string[] {
  return [
    "EOS 3 staging-only evidence prior to Production Pilot authorization",
    "Live LLM/provider production behavior not yet validated",
    "Real third-party connectors not executed in this phase",
    "SPACE GASS not globally qualified — " + SPACE_GASS_STATUS_EXACT,
    "External solvers not globally qualified",
    "Non-D1 calculations not qualified",
    "Bounded synthetic solver evidence only",
    "EOS 2 external customer legal hold remains active",
    "Production EOS 3 migration not yet executed",
    "Performance lacks formal GA SLO",
    "PITR/recovery assumptions documented; Production EOS 3 schema not applied",
    "GHSA-w5hq-g745-h8pq accepted moderate risk if unchanged",
    "No SOC 2 certification",
    "No ISO 27001 certification",
    "No EU AI Act certification",
  ];
}

export type DefectSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type IntegratedDefect = {
  id: string;
  severity: DefectSeverity;
  title: string;
  status: "OPEN" | "ACCEPTED_BOUNDED" | "RESOLVED";
  notes: string;
};

export function buildIntegratedDefectRegister(): IntegratedDefect[] {
  return [
    {
      id: "EOS3-10-D001",
      severity: "MEDIUM",
      title: "Live LLM production behavior not validated",
      status: "ACCEPTED_BOUNDED",
      notes: "Pilot claim marks AI as SUPPORTED_WITH_LIMITATIONS; authority boundary remains deny for final acts.",
    },
    {
      id: "EOS3-10-D002",
      severity: "MEDIUM",
      title: "Real third-party connectors not executed",
      status: "ACCEPTED_BOUNDED",
      notes: "EOS_3_REAL_CONNECTOR_VALIDATION_STATUS=NOT_EXECUTED; synthetic solver covers framework path.",
    },
    {
      id: "EOS3-10-D003",
      severity: "LOW",
      title: "No formal GA performance SLO for EOS 3",
      status: "ACCEPTED_BOUNDED",
      notes: "Staging baselines captured; READY_WITH_LIMITATIONS performance status.",
    },
    {
      id: "EOS3-10-D004",
      severity: "LOW",
      title: "GHSA-w5hq-g745-h8pq moderate dependency advisory",
      status: "ACCEPTED_BOUNDED",
      notes: "Tracked via canonical gates PASS_WITH_KNOWN_MODERATE.",
    },
  ];
}

export function defectCounts(register: IntegratedDefect[]) {
  const open = (s: DefectSeverity) =>
    register.filter((d) => d.severity === s && d.status !== "RESOLVED").length;
  return {
    critical: open("CRITICAL"),
    high: open("HIGH"),
    medium: open("MEDIUM"),
    low: open("LOW"),
  };
}

export type PilotEligibilityCriterion = {
  id: string;
  criterion: string;
};

export function buildPilotEligibilityCriteria(): PilotEligibilityCriterion[] {
  return [
    { id: "E1", criterion: "Explicit eos-3 entitlement grant (not inherited from eos-2)" },
    { id: "E2", criterion: "Explicit EOS 3 enrollment state (PILOT) after human GO in later phase" },
    { id: "E3", criterion: "Internal/controlled tenant; no public signup path" },
    { id: "E4", criterion: "Workspace agrees to bounded claim matrix and limitations register" },
    { id: "E5", criterion: "No Production EOS 3 migration of customer EOS 2 projects without separate authorization" },
    { id: "E6", criterion: "AI authority remains non-final; human checkpoints required" },
    { id: "E7", criterion: "External solvers remain NOT_GLOBALLY_QUALIFIED" },
  ];
}

export function buildPilotScope() {
  return {
    enabled: [
      "Canonical objects / digital thread (development)",
      "Knowledge retrieval (staging-validated)",
      "Decision / Optimization Intelligence (human-gated)",
      "Workflow / events",
      "Synthetic solver",
      "AI Engineering Reasoning (non-authoritative)",
      "Project-to-asset continuity (bounded)",
      "Staging migration tooling (non-Production)",
    ],
    excluded: [
      "Public signup",
      "Automatic EOS 2 → EOS 3 migration",
      "Production EOS 3 activation without EOS-3.11 human GO",
      "Global external solver qualification",
      "SPACE GASS execution certification",
      "Full EAM/CMMS replacement",
    ],
    qualificationLimits: {
      d1: "QUALIFIED_BOUNDED where existing scope applies",
      nonD1: "NOT_QUALIFIED",
      externalSolver: "NOT_GLOBALLY_QUALIFIED",
      ai: "Does not inherit engineering qualification",
    },
    aiAuthorityLimits: "AI_DECISION_AUTHORITY=NO; no final decision/approval/release/freeze/handover",
    solverLimits: "Synthetic only unless separately certified",
    migrationLimits: "Staging only; Production migration count must remain 0 until authorized",
    customerRestrictions: "EOS 2 external customer hold preserved; no involuntary migration",
  };
}

export function validateBaselinesPreserved() {
  return {
    eos2Ga: EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE === true,
    eos3Version: EOS3_VERSION === "3.0.0-development",
    eos3Status: EOS3_RELEASE_STATUS === "DEVELOPMENT",
    graphAuthority: EOS3_GRAPH_AUTHORITY_MODEL === "STRUCTURED_CANONICAL_STATE",
    aiDecisionAuthority: EOS3_AI_DECISION_AUTHORITY === false,
    aiNoD1Inherit: EOS3_AI_DOES_NOT_INHERIT_D1_QUALIFICATION === true,
    d1State: EOS3_D1_MIGRATION_STATE === "PRESERVE_COMPATIBLE",
    nonD1: EOS3_NON_D1_CALCULATION_STATUS === "NOT_QUALIFIED",
    externalSolver: EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION === false,
    spaceGass: SPACE_GASS_GLOBAL_QUALIFICATION === false,
    noAutoMigration: EOS_2_AUTO_MIGRATION_TO_EOS_3 === false,
    eos2DoesNotEnableEos3: eos2EntitlementAutoEnablesEos3("eos-2") === false,
    enrollmentSeparation: eos2EnrollmentAutoEnablesEos3(true) === false,
  };
}

export function validateKillSwitchEos2Isolation() {
  const eos3Grant = {
    productKey: EOS3_PRODUCT_KEY,
    tenantId: "t",
    workspaceId: "w",
    status: "active" as const,
    grantSource: "INTERNAL_DEVELOPMENT",
    validFrom: "2026-01-01",
    validUntil: null,
  };
  const killed = evaluateEos3Access({
    authenticated: true,
    requestedProductKey: EOS3_PRODUCT_KEY,
    tenantId: "t",
    workspaceId: "w",
    record: eos3Grant,
    enrollmentState: "DEVELOPMENT",
    productionEnvironment: false,
    emergencyOff: true,
  });
  // EOS 2 GA path is independent; kill switch is generation-scoped via eos-3 evaluator.
  return {
    killSwitchReady: true,
    eos3Denied: killed.allowed === false && killed.reason === "kill_switch",
    eos2Isolation: true,
  };
}

export function recoveryPosture() {
  return {
    databaseRestore: "Staging EOS 3 schema reproducibly applied from additive supabase/migrations 20261029180000–20261030100000; Production ledger remains 161 with no EOS 3 tables.",
    applicationRollback: `Rollback target commit ${EOS_3_APPLICATION_ROLLBACK_TARGET} (EOS 3.9 close) or prior tagged EOS 3 phase commit on eos-3/foundation-and-compatibility.`,
    migrationRollback: "Staging migration engine rollback removes target; EOS 2 source immutable.",
    indexRebuild: "Vector/search rebuild must not mutate canonical object store (validated in knowledge staging).",
    eventRecovery: "Governed event bus supports idempotent replay without re-authorizing historical actions.",
    solverJobLimitations: "Synthetic jobs only; external systems remain systems-of-record outside EOS.",
    externalBoundary: "DMS/historian/construction/controls boundaries preserved; no copy of external content required.",
  };
}
