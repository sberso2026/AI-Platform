export type DirectorFailure = {
  layer: string;
  cause: string;
};

const SECRETISH = /(api[_-]?key|authorization|bearer|sk-[a-z0-9]|secret)/i;

export function parseDirectorFailure(error: unknown): DirectorFailure {
  const message = error instanceof Error ? error.message : String(error ?? "unknown");
  const tagged = message.match(/AI_DIRECTOR_FAILURE layer=([a-z_]+) cause=([^\n]+)/i);
  if (tagged) {
    return { layer: tagged[1], cause: sanitizeCause(tagged[2]) };
  }
  if (/Agent not found|Default platform agent/i.test(message)) {
    return { layer: "agent_resolution", cause: "agent_not_found" };
  }
  if (/Failed to create agent run/i.test(message)) {
    return { layer: "agent_run_persist", cause: sanitizeCause(message.replace(/^Failed to create agent run:\s*/i, "")) };
  }
  if (/Policy denied/i.test(message)) {
    return { layer: "policy", cause: sanitizeCause(message.replace(/^Policy denied:\s*/i, "denied:")) };
  }
  if (/Failed to start trace|Failed to create span/i.test(message)) {
    return { layer: "observability", cause: "trace_insert_failed" };
  }
  if (/Failed to publish event/i.test(message)) {
    return { layer: "event_bus", cause: "publish_failed" };
  }
  if (/Failed to list capabilities|Failed to list models/i.test(message)) {
    return { layer: "registry", cause: sanitizeCause(message) };
  }
  if (/Failed to record cost|Failed to log model usage/i.test(message)) {
    return { layer: "cost_or_usage", cause: sanitizeCause(message) };
  }
  if (/timeout|AbortError/i.test(message)) {
    return { layer: "provider", cause: "timeout" };
  }
  return { layer: "ai_director", cause: sanitizeCause(message) };
}

function sanitizeCause(value: string): string {
  const trimmed = value.trim().slice(0, 180);
  if (SECRETISH.test(trimmed)) return "redacted";
  return trimmed.replace(/\s+/g, " ");
}
