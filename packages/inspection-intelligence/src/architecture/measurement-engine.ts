/**
 * Measurement Engine — reusable subsystem (formulas, tolerances, calibration hooks).
 * Trends and sensor streaming are reserved.
 */

export type MeasurementUnit = string;

export type MeasurementObservationInput = {
  measurementType: string;
  observedValue: number | string | boolean;
  expectedValue?: number | string | boolean | null;
  unit?: MeasurementUnit;
  method?: string;
  instrumentId?: string;
  calibrationCertificateId?: string;
  environmentalConditions?: Record<string, string | number>;
  source: "human" | "instrument" | "ai" | "sensor_stream" | "pack";
  observedAt: string;
  inspectorPersonId?: string;
};

export type ToleranceBand = {
  min?: number;
  max?: number;
  absolute?: number;
  percent?: number;
};

export type AcceptanceCriteria = {
  mode: "tolerance" | "equals" | "set" | "formula" | "pack";
  tolerance?: ToleranceBand;
  equals?: number | string | boolean;
  allowedValues?: Array<number | string | boolean>;
  formulaId?: string;
};

export type MeasurementEvaluation = {
  status: "pass" | "fail" | "conditional" | "unknown";
  calculatedValue?: number | string | boolean | null;
  confidence?: number;
  detail?: string;
};

export type MeasurementEngine = {
  evaluate(
    input: MeasurementObservationInput,
    criteria?: AcceptanceCriteria,
  ): MeasurementEvaluation;
  /** Reserved: time-series trends */
  reservedTrends: true;
  /** Reserved: live sensor adapters */
  reservedSensorIntegration: true;
};

export function createMeasurementEngine(): MeasurementEngine {
  return {
    reservedTrends: true,
    reservedSensorIntegration: true,
    evaluate(input, criteria): MeasurementEvaluation {
      if (!criteria) return { status: "unknown", detail: "no_criteria" };
      if (criteria.mode === "equals") {
        const ok = input.observedValue === criteria.equals;
        return { status: ok ? "pass" : "fail", calculatedValue: input.observedValue };
      }
      if (criteria.mode === "set" && criteria.allowedValues) {
        const ok = criteria.allowedValues.includes(input.observedValue as never);
        return { status: ok ? "pass" : "fail", calculatedValue: input.observedValue };
      }
      if (criteria.mode === "tolerance" && typeof input.observedValue === "number") {
        const expected =
          typeof input.expectedValue === "number" ? input.expectedValue : undefined;
        const t = criteria.tolerance;
        if (!t) return { status: "unknown", detail: "missing_tolerance" };
        let min = t.min;
        let max = t.max;
        if (expected !== undefined && t.absolute !== undefined) {
          min = expected - t.absolute;
          max = expected + t.absolute;
        }
        if (expected !== undefined && t.percent !== undefined) {
          const delta = Math.abs(expected) * (t.percent / 100);
          min = expected - delta;
          max = expected + delta;
        }
        if (min !== undefined && input.observedValue < min) {
          return { status: "fail", calculatedValue: input.observedValue };
        }
        if (max !== undefined && input.observedValue > max) {
          return { status: "fail", calculatedValue: input.observedValue };
        }
        return { status: "pass", calculatedValue: input.observedValue };
      }
      if (criteria.mode === "formula" || criteria.mode === "pack") {
        return { status: "unknown", detail: "formula_or_pack_reserved_for_later" };
      }
      return { status: "unknown" };
    },
  };
}
