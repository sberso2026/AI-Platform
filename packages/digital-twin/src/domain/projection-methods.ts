/**
 * Phase 12E — Bounded telemetry projection methods.
 */

export const PROJECTION_METHODS = [
  "latest_valid_observation",
  "mean_over_window",
  "min_over_window",
  "max_over_window",
  "count_over_window",
  "last_known_valid",
] as const;

export type ProjectionMethod = (typeof PROJECTION_METHODS)[number];

export function assertProjectionMethodBounded(method: string): asserts method is ProjectionMethod {
  if (!(PROJECTION_METHODS as readonly string[]).includes(method)) {
    throw new Error(`projection_method_not_supported:${method}`);
  }
}

export function applyProjectionMethod(
  method: ProjectionMethod,
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }
  switch (method) {
    case "latest_valid_observation":
    case "last_known_valid":
      return values[values.length - 1] ?? null;
    case "mean_over_window":
      return values.reduce((a, b) => a + b, 0) / values.length;
    case "min_over_window":
      return Math.min(...values);
    case "max_over_window":
      return Math.max(...values);
    case "count_over_window":
      return values.length;
    default:
      throw new Error(`projection_method_not_supported:${method}`);
  }
}
