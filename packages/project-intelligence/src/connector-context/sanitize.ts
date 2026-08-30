import { detectMutationRequest, detectPromptInjection } from "../ai-project-analyst/intent";
import { MAX_CONNECTOR_EXCERPT_CHARS } from "./types";

const SECRET_KEYS = /^(secret|token|access_token|refresh_token|api_key|apikey|password|authorization|bearer|private_key|client_secret)$/i;

export function stripSecretFields(value: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (SECRET_KEYS.test(key)) continue;
    if (item && typeof item === "object" && !Array.isArray(item)) {
      out[key] = stripSecretFields(item as Record<string, unknown>);
    } else if (typeof item === "string" && /bearer\s+\S+|sk_live|xox[baprs]-/i.test(item)) {
      out[key] = "[redacted]";
    } else {
      out[key] = item;
    }
  }
  return out;
}

export function boundedExcerpt(text: string): { excerpt: string; truncated: boolean } {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= MAX_CONNECTOR_EXCERPT_CHARS) return { excerpt: normalized, truncated: false };
  return { excerpt: normalized.slice(0, MAX_CONNECTOR_EXCERPT_CHARS), truncated: true };
}

export function sanitizeConnectorText(text: string): {
  text: string;
  containsInjection: boolean;
  mutationAttempt: boolean;
} {
  const mutationAttempt = detectMutationRequest(text);
  if (detectPromptInjection(text)) {
    return {
      text: "[untrusted instruction stripped from external context]",
      containsInjection: true,
      mutationAttempt,
    };
  }
  return { text, containsInjection: false, mutationAttempt };
}

export function descriptorFromPayload(
  payload: Record<string, unknown>,
  fallback: string,
): { title: string; excerpt: string } {
  const title =
    stringField(payload, "title") ??
    stringField(payload, "subject") ??
    stringField(payload, "name") ??
    stringField(payload, "invoiceNumber") ??
    fallback;
  const excerpt =
    stringField(payload, "excerpt") ??
    stringField(payload, "body") ??
    stringField(payload, "preview") ??
    stringField(payload, "summary") ??
    stringField(payload, "subject") ??
    JSON.stringify(payload);
  return { title, excerpt };
}

function stringField(payload: Record<string, unknown>, key: string): string | null {
  const value = payload[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function safeStructuredFacts(payload: Record<string, unknown>): Record<string, string> {
  const facts: Record<string, string> = {};
  for (const [key, value] of Object.entries(stripSecretFields(payload))) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      facts[key] = String(value).slice(0, 120);
    }
    if (Object.keys(facts).length >= 8) break;
  }
  return facts;
}
