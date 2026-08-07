/**
 * Phase 11C — Schedule Intelligence Engine.
 *
 * Evidence-driven and abstention-first. Never computes CPM, float, forward or
 * backward pass. Never mutates activity or milestone identity.
 */

import {
  createScheduleConfidenceEngine,
  type ScheduleConfidenceEngine,
} from "./schedule-confidence";
import {
  dominantMilestonePosture,
  isAbstainingScheduleSufficiency,
  type MilestonePosture,
  type ScheduleAssessmentState,
  type ScheduleConfidence,
  type ScheduleEvidence,
} from "./schedule";
import type { ProjectScopeRef } from "./progress";
import {
  CPM_SCHEDULING_IMPLEMENTED,
  CRITICAL_PATH_COMPUTED,
  EARNED_VALUE_IMPLEMENTED,
  FLOAT_COMPUTATION_IMPLEMENTED,
  FORWARD_BACKWARD_PASS_IMPLEMENTED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
  SCHEDULE_INTELLIGENCE_IS_ADVISORY_ONLY,
  SCHEDULE_INTELLIGENCE_IS_CPM,
} from "../version";

export type ScheduleAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  evidence: readonly ScheduleEvidence[];
  version?: number;
  status?: ScheduleAssessmentState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  disagreementThresholdDays?: number;
  minimumEvidenceCount?: number;
};

export type ScheduleAssessmentResult = {
  assessment: ScheduleAssessmentState;
  confidence: ScheduleConfidence;
  abstained: boolean;
  abstentionReason?: string;
};

export type ScheduleIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: ScheduleConfidenceEngine;
};

export class ScheduleIntelligenceEngine {
  readonly kind = "schedule_intelligence_engine" as const;
  private readonly confidenceEngine: ScheduleConfidenceEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: ScheduleIntelligenceEngineDeps = {}) {
    assertNoCpm();
    this.confidenceEngine = deps.confidenceEngine ?? createScheduleConfidenceEngine();
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: ScheduleAssessmentInput): ScheduleAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];

    if (!input.projectId) throw new Error("project_id_required");
    if (input.scope.kind !== "project" && !input.scope.referenceId) {
      throw new Error("scope_reference_id_required");
    }
    if (input.scope.projectId !== input.projectId) {
      throw new Error("scope_project_mismatch");
    }

    const evidence = (input.evidence ?? []).map(normaliseEvidence);
    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcschedconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      sufficiencyThreshold: input.sufficiencyThreshold,
      disagreementThresholdDays: input.disagreementThresholdDays,
      minimumEvidenceCount: input.minimumEvidenceCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingScheduleSufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_schedule_evidence")
      : undefined;

    let milestonePosture: MilestonePosture | undefined;
    let declaredBaselineDate: string | undefined;
    let declaredCurrentDate: string | undefined;
    let declaredDateDeltaDays: number | undefined;

    if (abstained) {
      reasons.push("abstained_no_schedule_posture_published");
    } else {
      const usable = evidence.filter((item) => !item.revoked);
      const postures = usable
        .map((item) => item.declaredPosture)
        .filter((value): value is MilestonePosture => typeof value === "string");
      milestonePosture = dominantMilestonePosture(postures);
      declaredBaselineDate = latestDate(
        usable.map((item) => item.declaredBaselineDate).filter(Boolean) as string[],
      );
      declaredCurrentDate = latestDate(
        usable.map((item) => item.declaredCurrentDate).filter(Boolean) as string[],
      );
      if (declaredBaselineDate && declaredCurrentDate) {
        declaredDateDeltaDays = Math.round(
          (Date.parse(declaredCurrentDate) - Date.parse(declaredBaselineDate)) / 86_400_000,
        );
        if (declaredDateDeltaDays > 0 && !milestonePosture) {
          milestonePosture = declaredDateDeltaDays > 7 ? "at_risk" : "on_track";
          reasons.push("posture_inferred_from_declared_date_delta_only");
        }
      }
      if (!milestonePosture && !declaredBaselineDate && !declaredCurrentDate) {
        return this.abstainedResult(input, confidence, asOf, [
          ...reasons,
          "no_declared_schedule_signal",
        ]);
      }
      if (!milestonePosture) milestonePosture = "unknown";
      if (confidence.dataSufficiency === "limited") {
        reasons.push("limited_basis_schedule_posture_is_advisory");
      }
    }

    const stateId = this.newId("pcsched");
    const assessment: ScheduleAssessmentState = {
      stateId,
      assessmentId: stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      milestonePosture: abstained ? undefined : milestonePosture,
      declaredBaselineDate: abstained ? undefined : declaredBaselineDate,
      declaredCurrentDate: abstained ? undefined : declaredCurrentDate,
      declaredDateDeltaDays: abstained ? undefined : declaredDateDeltaDays,
      confidence,
      evidenceRefs: evidence.map((item) => item.evidenceId),
      reasons: dedupe(reasons),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "schedule_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      forwardBackwardPassComputed: false,
      costIntegrated: false,
      forecastProduced: false,
      scheduleExecuted: false,
      resourceLevelled: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      mutatesActivityIdentity: false,
      autonomousPublication: false,
    };

    return { assessment, confidence, abstained, abstentionReason };
  }

  private abstainedResult(
    input: ScheduleAssessmentInput,
    confidence: ScheduleConfidence,
    asOf: string,
    reasons: string[],
  ): ScheduleAssessmentResult {
    const stateId = this.newId("pcsched");
    const abstentionReason = "insufficient_schedule_evidence";
    return {
      abstained: true,
      abstentionReason,
      confidence,
      assessment: {
        stateId,
        assessmentId: stateId,
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        scope: input.scope,
        version: input.version ?? 1,
        status: input.status ?? "assessed",
        assessmentClass: "abstained",
        confidence,
        evidenceRefs: (input.evidence ?? []).map((item) => item.evidenceId),
        reasons: dedupe(reasons),
        abstained: true,
        abstentionReason,
        narrative: input.narrative,
        method: "schedule_intelligence_advisory_v1",
        methodVersion: "1",
        assessedAt: asOf,
        recordedAt: asOf,
        createdBy: input.createdBy,
        supersedesId: input.supersedesId,
        workflowInstanceId: input.workflowInstanceId,
        earnedValueComputed: false,
        criticalPathComputed: false,
        floatComputed: false,
        forwardBackwardPassComputed: false,
        costIntegrated: false,
        forecastProduced: false,
        scheduleExecuted: false,
        resourceLevelled: false,
        advisoryOnly: true,
        mutatesProjectIdentity: false,
        mutatesActivityIdentity: false,
        autonomousPublication: false,
      },
    };
  }
}

export function createScheduleIntelligenceEngine(
  deps: ScheduleIntelligenceEngineDeps = {},
): ScheduleIntelligenceEngine {
  return new ScheduleIntelligenceEngine(deps);
}

export function assertNoCpm(): {
  ok: true;
  cpmImplemented: false;
  floatComputed: false;
  scheduleExecutionImplemented: false;
  earnedValueImplemented: false;
} {
  if (
    CPM_SCHEDULING_IMPLEMENTED ||
    CRITICAL_PATH_COMPUTED ||
    FLOAT_COMPUTATION_IMPLEMENTED ||
    FORWARD_BACKWARD_PASS_IMPLEMENTED ||
    SCHEDULE_INTELLIGENCE_IS_CPM
  ) {
    throw new Error("cpm_forbidden_in_schedule_intelligence");
  }
  if (SCHEDULE_EXECUTION_IMPLEMENTED) {
    throw new Error("schedule_execution_forbidden_in_schedule_intelligence");
  }
  if (EARNED_VALUE_IMPLEMENTED) {
    throw new Error("earned_value_forbidden_in_schedule_intelligence");
  }
  if (!SCHEDULE_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("schedule_intelligence_must_be_advisory_only");
  }
  return {
    ok: true,
    cpmImplemented: false,
    floatComputed: false,
    scheduleExecutionImplemented: false,
    earnedValueImplemented: false,
  };
}

function normaliseEvidence(evidence: ScheduleEvidence): ScheduleEvidence {
  if (
    evidence.derivedFromCpm !== false ||
    evidence.derivedFromFloat !== false ||
    evidence.derivedFromEarnedValue !== false ||
    evidence.mutatesActivityIdentity !== false
  ) {
    throw new Error("schedule_evidence_may_not_derive_from_cpm_float_or_earned_value");
  }
  return evidence;
}

function latestDate(values: string[]): string | undefined {
  if (values.length === 0) return undefined;
  return values
    .filter((value) => Number.isFinite(Date.parse(value)))
    .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
