/**
 * Inspection KPI Framework — contracts for performance, condition, recurring defects.
 */
export type InspectionKpiKey =
  | "sessions_completed"
  | "sessions_overdue"
  | "defects_open"
  | "defects_critical"
  | "corrective_actions_overdue"
  | "verification_pass_rate"
  | "recurring_defect_rate"
  | "asset_condition_index"
  | "mean_time_to_close";

export type InspectionKpiDefinition = {
  key: InspectionKpiKey;
  label: string;
  unit: "count" | "ratio" | "days" | "index";
  reservedComputation: boolean;
};

export type InspectionKpiSnapshot = {
  key: InspectionKpiKey;
  value: number | null;
  asOf: string;
  reserved: boolean;
};

export const INSPECTION_KPI_DEFINITIONS: InspectionKpiDefinition[] = [
  { key: "sessions_completed", label: "Sessions completed", unit: "count", reservedComputation: false },
  { key: "sessions_overdue", label: "Sessions overdue", unit: "count", reservedComputation: false },
  { key: "defects_open", label: "Open defects", unit: "count", reservedComputation: false },
  { key: "defects_critical", label: "Critical defects", unit: "count", reservedComputation: false },
  {
    key: "corrective_actions_overdue",
    label: "Overdue corrective actions",
    unit: "count",
    reservedComputation: false,
  },
  {
    key: "verification_pass_rate",
    label: "Verification pass rate",
    unit: "ratio",
    reservedComputation: false,
  },
  {
    key: "recurring_defect_rate",
    label: "Recurring defect rate",
    unit: "ratio",
    reservedComputation: true,
  },
  {
    key: "asset_condition_index",
    label: "Asset condition index",
    unit: "index",
    reservedComputation: true,
  },
  {
    key: "mean_time_to_close",
    label: "Mean time to close",
    unit: "days",
    reservedComputation: false,
  },
];

export function computeBasicInspectionKpis(input: {
  sessionsCompleted: number;
  sessionsOverdue: number;
  defectsOpen: number;
  defectsCritical: number;
  correctiveActionsOverdue: number;
  verificationsPassed: number;
  verificationsTotal: number;
  meanTimeToCloseDays: number | null;
}): InspectionKpiSnapshot[] {
  const asOf = new Date().toISOString();
  return [
    { key: "sessions_completed", value: input.sessionsCompleted, asOf, reserved: false },
    { key: "sessions_overdue", value: input.sessionsOverdue, asOf, reserved: false },
    { key: "defects_open", value: input.defectsOpen, asOf, reserved: false },
    { key: "defects_critical", value: input.defectsCritical, asOf, reserved: false },
    {
      key: "corrective_actions_overdue",
      value: input.correctiveActionsOverdue,
      asOf,
      reserved: false,
    },
    {
      key: "verification_pass_rate",
      value:
        input.verificationsTotal === 0
          ? null
          : input.verificationsPassed / input.verificationsTotal,
      asOf,
      reserved: false,
    },
    { key: "recurring_defect_rate", value: null, asOf, reserved: true },
    { key: "asset_condition_index", value: null, asOf, reserved: true },
    { key: "mean_time_to_close", value: input.meanTimeToCloseDays, asOf, reserved: false },
  ];
}
