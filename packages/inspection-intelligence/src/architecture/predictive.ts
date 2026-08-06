/**
 * Predictive Inspection interfaces — reserved for Asset Intelligence,
 * Digital Twin, and condition monitoring. Not implemented in 9B.
 */

export type PredictiveInspectionSignal = {
  id: string;
  targetId: string;
  signalType: "remaining_life" | "next_due_suggestion" | "condition_feed" | "twin_risk";
  value?: number | string;
  unit?: string;
  observedAt: string;
  sourceSystem: "asset_intelligence" | "digital_twin" | "condition_monitoring" | "other";
  reserved: true;
};

export type PredictiveInspectionAdapter = {
  adapterId: string;
  pullSignals(input: { tenantId: string; workspaceId: string; targetId: string }): Promise<
    PredictiveInspectionSignal[]
  >;
  reserved: true;
};

export const PREDICTIVE_INSPECTION_RESERVED = true as const;
