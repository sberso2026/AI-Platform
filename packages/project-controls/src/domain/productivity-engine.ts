/**
 * Phase 11F — Productivity Intelligence Engine.
 *
 * Evidence-driven and abstention-first. Resolves evidence into confidence and
 * a `ProductivityAssessmentState`.
 *
 * What it never does: manage workforce, process timesheets/payroll, compute
 * labour productivity %, produce forecasts, compute earned value or CPM, or
 * execute schedule/change.
 */

import {
  deriveProductivityFactors,
  isAbstainingProductivitySufficiency,
  productivityStateKey,
  type ProductivityAssessmentState,
  type ProductivityConfidence,
  type ProductivityControlContext,
  type ProductivityEvidence,
  type ProductivityEvidenceSufficiency,
  type ProductivityEvidenceTrend,
  type ProductivityPosture,
} from "./productivity";
import {
  createProductivityConfidenceEngine,
  type ProductivityConfidenceEngine,
} from "./productivity-confidence";
import type { ProjectScopeRef } from "./progress";
import {
  EARNED_VALUE_IMPLEMENTED,
  FORECAST_ENGINE_IMPLEMENTED,
  FORECASTING_IMPLEMENTED,
  LABOUR_COST_ENGINE_IMPLEMENTED,
  PAYROLL_IMPLEMENTED,
  PRODUCTIVITY_INTELLIGENCE_IS_ADVISORY_ONLY,
  RESOURCE_PLANNING_IMPLEMENTED,
  TIMESHEET_SYSTEM_IMPLEMENTED,
} from "../version";

export type ProductivityAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ProductivityControlContext;
  evidence: readonly ProductivityEvidence[];
  version?: number;
  status?: ProductivityAssessmentState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

export type ProductivityAssessmentResult = {
  state: ProductivityAssessmentState;
  confidence: ProductivityConfidence;
  abstained: boolean;
  abstentionReason?: string;
};

export type ProductivityIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: ProductivityConfidenceEngine;
};

export class ProductivityIntelligenceEngine {
  readonly kind = "productivity_intelligence_engine" as const;
  private readonly confidenceEngine: ProductivityConfidenceEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: ProductivityIntelligenceEngineDeps = {}) {
    assertNoWorkforceManagement();
    assertNoLabourProductivityMetrics();
    assertNoForecastOrEarnedValue();
    this.confidenceEngine = deps.confidenceEngine ?? createProductivityConfidenceEngine();
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: ProductivityAssessmentInput): ProductivityAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_productivity_intelligence_only",
      "not_workforce_management_or_payroll",
      "no_labour_productivity_percent_or_forecast",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (!input.controlContext.controlUnitId) throw new Error("control_unit_id_required");
    const scope = input.controlContext.scope;
    if (scope.kind !== "project" && !scope.referenceId) {
      throw new Error("scope_reference_id_required");
    }
    if (scope.projectId !== input.projectId) throw new Error("scope_project_mismatch");

    const evidence = (input.evidence ?? []).map(normaliseEvidence);

    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcprodconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope,
      controlContext: input.controlContext,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      sufficiencyThreshold: input.sufficiencyThreshold,
      minimumEvidenceCount: input.minimumEvidenceCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingProductivitySufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_productivity_evidence")
      : undefined;

    let productivityPosture: ProductivityPosture = "unknown";
    let factors = deriveProductivityFactors([]);

    if (abstained) {
      reasons.push("abstained_no_productivity_posture_published");
      limitations.push("abstained_insufficient_evidence");
    } else {
      const usable = evidence.filter(
        (item) => item.revoked !== true && item.reviewStatus !== "revoked",
      );
      productivityPosture = deriveProductivityPosture(usable, confidence.dataSufficiency);
      factors = deriveProductivityFactors(usable);
      if (confidence.dataSufficiency === "limited") {
        reasons.push("limited_basis_productivity_posture_is_advisory");
        limitations.push("limited_evidence_basis");
      }
    }

    const stateId = this.newId("pcprod");
    const state: ProductivityAssessmentState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      controlContext: input.controlContext,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      productivityPosture: abstained ? "unknown" : productivityPosture,
      factors: abstained ? [] : factors,
      evidenceRefs: evidence.map((item) => item.evidenceId),
      confidence,
      reasons: dedupe(reasons),
      limitations: dedupe(limitations),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "productivity_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      workforceManagementPerformed: false,
      timesheetProcessed: false,
      payrollProcessed: false,
      resourcePlanningPerformed: false,
      labourCostComputed: false,
      labourProductivityPercentComputed: false,
      forecastProduced: false,
      financialPostingPerformed: false,
      changeExecuted: false,
      scheduleExecuted: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      autonomousPublication: false,
    };

    return { state, confidence, abstained, abstentionReason };
  }

  keyFor(scope: ProjectScopeRef, controlUnitId: string): string {
    return productivityStateKey(scope, controlUnitId);
  }
}

export function createProductivityIntelligenceEngine(
  deps: ProductivityIntelligenceEngineDeps = {},
): ProductivityIntelligenceEngine {
  return new ProductivityIntelligenceEngine(deps);
}

export function assertNoWorkforceManagement(): {
  ok: true;
  resourcePlanningImplemented: false;
  timesheetSystemImplemented: false;
  payrollImplemented: false;
} {
  if (
    RESOURCE_PLANNING_IMPLEMENTED ||
    TIMESHEET_SYSTEM_IMPLEMENTED ||
    PAYROLL_IMPLEMENTED
  ) {
    throw new Error("workforce_management_forbidden_in_productivity_intelligence");
  }
  return {
    ok: true,
    resourcePlanningImplemented: false,
    timesheetSystemImplemented: false,
    payrollImplemented: false,
  };
}

export function assertNoLabourProductivityMetrics(): {
  ok: true;
  labourCostEngineImplemented: false;
} {
  if (LABOUR_COST_ENGINE_IMPLEMENTED) {
    throw new Error("labour_cost_forbidden_in_productivity_intelligence");
  }
  return { ok: true, labourCostEngineImplemented: false };
}

export function assertNoForecastOrEarnedValue(): {
  ok: true;
  forecastingImplemented: false;
  forecastEngineImplemented: false;
  earnedValueImplemented: false;
  advisoryOnly: true;
} {
  if (FORECASTING_IMPLEMENTED || FORECAST_ENGINE_IMPLEMENTED || EARNED_VALUE_IMPLEMENTED) {
    throw new Error("forecast_and_earned_value_forbidden_in_productivity_intelligence");
  }
  if (!PRODUCTIVITY_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("productivity_intelligence_must_be_advisory_only");
  }
  return {
    ok: true,
    forecastingImplemented: false,
    forecastEngineImplemented: false,
    earnedValueImplemented: false,
    advisoryOnly: true,
  };
}

function normaliseEvidence(evidence: ProductivityEvidence): ProductivityEvidence {
  if (
    evidence.derivedFromTimesheet !== false ||
    evidence.derivedFromPayroll !== false ||
    evidence.labourProductivityPercentClaimed !== false ||
    evidence.resourcePlanningClaimed !== false ||
    evidence.forecastDerived !== false ||
    evidence.earnedValueDerived !== false
  ) {
    throw new Error(
      "productivity_evidence_may_not_derive_from_timesheet_payroll_or_claim_labour_metrics",
    );
  }
  return evidence;
}

function deriveProductivityPosture(
  usable: readonly ProductivityEvidence[],
  sufficiency: ProductivityEvidenceSufficiency,
): ProductivityPosture {
  const trends = usable
    .map((item) => item.declaredTrend)
    .filter((value): value is ProductivityEvidenceTrend => typeof value === "string")
    .filter((value) => value !== "unknown");

  if (trends.length === 0) return "unknown";
  if (trends.some((value) => value === "constrained")) return "constrained";
  if (trends.some((value) => value === "recovering")) return "recovering";

  const improving = trends.filter((value) => value === "improving").length;
  const declining = trends.filter((value) => value === "declining").length;
  const stable = trends.filter((value) => value === "stable").length;

  if (improving > 0 && declining > 0) return "unknown";
  if (declining > improving && sufficiency !== "insufficient") return "declining";
  if (improving > declining && sufficiency !== "insufficient") return "improving";
  if (stable > 0) return "stable";
  return "unknown";
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
