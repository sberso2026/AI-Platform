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
  | "kpi_snapshot";

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
