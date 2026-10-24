/**
 * Phase 9E reporting preparation — data models and workflow outputs only (no mobile reporting).
 */
export type InspectionReportingOutputKind =
  | "session_summary"
  | "defect_register"
  | "corrective_action_status"
  | "verification_record"
  | "close_out_certificate"
  | "workflow_audit_export"
  | "kpi_snapshot"
  | "condition_rating_snapshot"
  | "predictive_signal_feed";

export type InspectionReportingDataModel = {
  reportKey: string;
  kind: InspectionReportingOutputKind;
  entityType: string;
  requiredFields: readonly string[];
  workflowStateRequired?: string;
  packAware: boolean;
};

export const INSPECTION_REPORTING_DATA_MODELS: readonly InspectionReportingDataModel[] = [
  {
    reportKey: "inspection.session_summary",
    kind: "session_summary",
    entityType: "inspection_session",
    requiredFields: ["sessionId", "status", "completedAt", "assigneePersonId"],
    workflowStateRequired: "completed",
    packAware: true,
  },
  {
    reportKey: "inspection.defect_register",
    kind: "defect_register",
    entityType: "defect",
    requiredFields: ["defectId", "taxonomy", "severity", "status"],
    packAware: true,
  },
  {
    reportKey: "inspection.corrective_action_status",
    kind: "corrective_action_status",
    entityType: "corrective_action",
    requiredFields: ["correctiveActionId", "ownerPersonId", "dueAt", "status"],
    packAware: false,
  },
  {
    reportKey: "inspection.verification_record",
    kind: "verification_record",
    entityType: "inspection_verification",
    requiredFields: ["verificationId", "status", "completedAt"],
    workflowStateRequired: "verified",
    packAware: false,
  },
  {
    reportKey: "inspection.close_out_certificate",
    kind: "close_out_certificate",
    entityType: "inspection_session",
    requiredFields: ["sessionId", "closedAt", "verifiedCorrectiveActionIds"],
    workflowStateRequired: "closed",
    packAware: true,
  },
  {
    reportKey: "inspection.workflow_audit_export",
    kind: "workflow_audit_export",
    entityType: "engineering_workflow_instance",
    requiredFields: ["instanceId", "auditEntries"],
    packAware: false,
  },
  {
    reportKey: "inspection.kpi_snapshot",
    kind: "kpi_snapshot",
    entityType: "inspection_kpi",
    requiredFields: ["kpiKey", "value", "asOf"],
    packAware: false,
  },
  {
    reportKey: "inspection.condition_rating_snapshot",
    kind: "condition_rating_snapshot",
    entityType: "inspection_condition_rating",
    requiredFields: [
      "ratingId",
      "schemeId",
      "schemeVersion",
      "reviewState",
      "confidence",
      "uncertainty",
      "evidenceSufficiency",
      "approvalStatus",
    ],
    packAware: true,
  },
  {
    reportKey: "inspection.predictive_signal_feed",
    kind: "predictive_signal_feed",
    entityType: "inspection_predictive_signal",
    requiredFields: [
      "signalId",
      "signalType",
      "severity",
      "confidence",
      "uncertainty",
      "advisory",
      "disposition",
      "providerId",
      "dataQuality",
    ],
    packAware: true,
  },
] as const;

export type InspectionWorkflowReportingOutput = {
  outputId: string;
  reportKey: string;
  kind: InspectionReportingOutputKind;
  tenantId: string;
  workspaceId: string;
  entityType: string;
  entityId: string;
  workflowInstanceId: string;
  generatedAt: string;
  payload: Record<string, unknown>;
  /** Mobile reporting is deferred — desktop/web preparation only. */
  mobileReady: false;
};

export function buildWorkflowReportingOutputs(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  workflowInstanceId: string;
  auditEntryCount: number;
}): InspectionWorkflowReportingOutput[] {
  const generatedAt = new Date().toISOString();
  return INSPECTION_REPORTING_DATA_MODELS.map((model, index) => ({
    outputId: `rpt_${model.kind}_${index}_${input.workflowInstanceId}`,
    reportKey: model.reportKey,
    kind: model.kind,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    entityType: model.entityType,
    entityId: input.sessionId,
    workflowInstanceId: input.workflowInstanceId,
    generatedAt,
    payload: {
      sessionId: input.sessionId,
      reportKey: model.reportKey,
      auditEntryCount: input.auditEntryCount,
      preparedOnly: true,
    },
    mobileReady: false as const,
  }));
}

/** Phase 9H — feed approved condition ratings and reviewed predictive signals into existing reporting prep. */
export function buildConditionPredictiveReportingOutputs(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  workflowInstanceId: string;
  rating: {
    ratingId: string;
    scheme: { schemeId: string; version: string };
    reviewState: string;
    confidence: number;
    uncertainty: number;
    evidenceSufficiency: string;
    published?: unknown;
    stale: boolean;
    observationIds: readonly string[];
    packId: string;
    offlineOrigin: boolean;
  };
  aggregation: {
    aggregationId: string;
    abstained: boolean;
    abstentionReason?: string;
    confidence: number;
    uncertainty: number;
    stale: boolean;
  };
  signals: readonly {
    signalId: string;
    signalType: string;
    severity: string;
    confidence: number;
    uncertainty: number;
    advisory: true;
    disposition: string;
    provider: { providerId: string; version: string };
    dataQuality: string;
    freshness: string;
    abstained: boolean;
    claimsRemainingUsefulLife: false;
    claimsProductionMlAccuracy: false;
  }[];
}): InspectionWorkflowReportingOutput[] {
  const generatedAt = new Date().toISOString();
  const conditionModel = INSPECTION_REPORTING_DATA_MODELS.find(
    (m) => m.kind === "condition_rating_snapshot",
  )!;
  const predictiveModel = INSPECTION_REPORTING_DATA_MODELS.find(
    (m) => m.kind === "predictive_signal_feed",
  )!;
  return [
    {
      outputId: `rpt_condition_${input.rating.ratingId}`,
      reportKey: conditionModel.reportKey,
      kind: conditionModel.kind,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      entityType: conditionModel.entityType,
      entityId: input.rating.ratingId,
      workflowInstanceId: input.workflowInstanceId,
      generatedAt,
      payload: {
        ratingId: input.rating.ratingId,
        schemeId: input.rating.scheme.schemeId,
        schemeVersion: input.rating.scheme.version,
        reviewState: input.rating.reviewState,
        confidence: input.rating.confidence,
        uncertainty: input.rating.uncertainty,
        evidenceSufficiency: input.rating.evidenceSufficiency,
        approvalStatus: input.rating.reviewState,
        stale: input.rating.stale,
        evidenceLinks: input.rating.observationIds,
        packId: input.rating.packId,
        aggregationId: input.aggregation.aggregationId,
        aggregationAbstained: input.aggregation.abstained,
        publicationAuthority: input.rating.offlineOrigin
          ? "local_draft_unauthoritative"
          : "server",
      },
      mobileReady: false as const,
    },
    {
      outputId: `rpt_predictive_${input.sessionId}`,
      reportKey: predictiveModel.reportKey,
      kind: predictiveModel.kind,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      entityType: predictiveModel.entityType,
      entityId: input.sessionId,
      workflowInstanceId: input.workflowInstanceId,
      generatedAt,
      payload: {
        signals: input.signals.map((s) => ({
          signalId: s.signalId,
          signalType: s.signalType,
          severity: s.severity,
          confidence: s.confidence,
          uncertainty: s.uncertainty,
          advisory: true,
          disposition: s.disposition,
          providerId: s.provider.providerId,
          providerVersion: s.provider.version,
          dataQuality: s.dataQuality,
          freshness: s.freshness,
          abstained: s.abstained,
          claimsRemainingUsefulLife: false,
          claimsProductionMlAccuracy: false,
        })),
      },
      mobileReady: false as const,
    },
  ];
}
