/**
 * Phase 13B — Large-model safety bounds (size/count/timeout/memory).
 */

export const LARGE_MODEL_SAFETY_LIMITS = {
  maxContentBytes: 25 * 1024 * 1024,
  maxElementCount: 50_000,
  maxEntityLines: 200_000,
  maxParseDurationMs: 30_000,
  maxPropertyKeysPerElement: 64,
  maxUnsupportedEntitySamples: 50,
} as const;

export type LargeModelSafetyViolation =
  | "content_too_large"
  | "element_count_exceeded"
  | "entity_line_count_exceeded"
  | "parse_timeout"
  | "property_key_limit";

export function assertContentSizeSafe(content: string): {
  ok: boolean;
  code?: LargeModelSafetyViolation;
  detail?: string;
  byteLength: number;
} {
  const byteLength = Buffer.byteLength(content, "utf8");
  if (byteLength > LARGE_MODEL_SAFETY_LIMITS.maxContentBytes) {
    return {
      ok: false,
      code: "content_too_large",
      detail: `content ${byteLength} exceeds ${LARGE_MODEL_SAFETY_LIMITS.maxContentBytes}`,
      byteLength,
    };
  }
  return { ok: true, byteLength };
}

export function assertElementCountSafe(count: number): {
  ok: boolean;
  code?: LargeModelSafetyViolation;
  detail?: string;
} {
  if (count > LARGE_MODEL_SAFETY_LIMITS.maxElementCount) {
    return {
      ok: false,
      code: "element_count_exceeded",
      detail: `elementCount ${count} exceeds ${LARGE_MODEL_SAFETY_LIMITS.maxElementCount}`,
    };
  }
  return { ok: true };
}

export function assertEntityLineCountSafe(count: number): {
  ok: boolean;
  code?: LargeModelSafetyViolation;
  detail?: string;
} {
  if (count > LARGE_MODEL_SAFETY_LIMITS.maxEntityLines) {
    return {
      ok: false,
      code: "entity_line_count_exceeded",
      detail: `entityLines ${count} exceeds ${LARGE_MODEL_SAFETY_LIMITS.maxEntityLines}`,
    };
  }
  return { ok: true };
}

export function isParseTimedOut(startedAtMs: number, nowMs = Date.now()): boolean {
  return nowMs - startedAtMs > LARGE_MODEL_SAFETY_LIMITS.maxParseDurationMs;
}
