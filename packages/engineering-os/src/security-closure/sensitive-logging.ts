/**
 * Phase 14D S05 — Sensitive logging minimization / redaction.
 * redaction ≠ deletion · audit evidence ≠ sensitive payload duplication
 */

import type { DataClassification } from "./classification-ai-policy";

const SENSITIVE_KEY =
  /(password|secret|token|api[_-]?key|authorization|cookie|private[_-]?key|prompt|completion|credential)/i;

export interface LogRecordInput {
  classification: DataClassification;
  message: string;
  fields?: Record<string, unknown>;
  /** Governed references safe for audit (ids, hashes) */
  auditRefs?: Record<string, string>;
}

export interface SanitizedLogRecord {
  message: string;
  fields: Record<string, unknown>;
  auditRefs: Record<string, string>;
  redacted: boolean;
  payloadOmitted: boolean;
}

function redactValue(value: unknown): unknown {
  if (typeof value === "string") {
    if (value.length > 24 && /eyJ[A-Za-z0-9_-]+\./.test(value)) return "[REDACTED_JWT]";
    if (value.length > 8 && SENSITIVE_KEY.test(value)) return "[REDACTED]";
    return value.length > 500 ? `${value.slice(0, 64)}…[TRUNCATED]` : value;
  }
  if (Array.isArray(value)) return value.map(redactValue);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = SENSITIVE_KEY.test(k) ? "[REDACTED]" : redactValue(v);
    }
    return out;
  }
  return value;
}

export function sanitizeLogRecord(input: LogRecordInput): SanitizedLogRecord {
  const denyPayload =
    input.classification === "RESTRICTED" ||
    input.classification === "ENGINEERING_SENSITIVE" ||
    input.classification === "CLIENT_CONFIDENTIAL";

  if (denyPayload) {
    return {
      message: `[${input.classification}] ${input.message}`.slice(0, 200),
      fields: {},
      auditRefs: { ...(input.auditRefs ?? {}) },
      redacted: true,
      payloadOmitted: true,
    };
  }

  const fields = redactValue(input.fields ?? {}) as Record<string, unknown>;
  const redacted = JSON.stringify(fields).includes("[REDACTED]");
  return {
    message: input.message.slice(0, 500),
    fields,
    auditRefs: { ...(input.auditRefs ?? {}) },
    redacted,
    payloadOmitted: false,
  };
}

