import type { ConnectorCanonicalSnapshot, ConnectorContextItem, CanonicalExternalConflict } from "./types";

const SCHEDULE_HINT = /\b(finish|finishes|finished|complete|completes|friday|monday|tuesday|wednesday|thursday|saturday|sunday|\d{4}-\d{2}-\d{2})\b/i;
const HEALTH_HINT = /\b(project is (green|healthy)|all risks are closed|approve (the )?variation)\b/i;

export function detectCanonicalExternalConflicts(
  items: readonly ConnectorContextItem[],
  canonical: ConnectorCanonicalSnapshot,
): CanonicalExternalConflict[] {
  const conflicts: CanonicalExternalConflict[] = [];
  const scheduleUnknown =
    canonical.scheduleState.toUpperCase() === "UNKNOWN" ||
    canonical.scheduleAvailability === "no_data" ||
    canonical.scheduleAvailability === "unavailable";
  const healthUnknown = canonical.health.toUpperCase() === "UNKNOWN";

  for (const item of items) {
    const haystack = `${item.title} ${item.excerpt}`;
    if (scheduleUnknown && SCHEDULE_HINT.test(haystack)) {
      conflicts.push({
        topic: "schedule",
        canonicalText: `Canonical schedule is ${canonical.scheduleState} (${canonical.scheduleAvailability}).`,
        externalText: `An external ${item.sourceSystem} record references timing that is not a confirmed canonical completion date.`,
        item,
      });
    }
    if (healthUnknown && HEALTH_HINT.test(haystack)) {
      conflicts.push({
        topic: "health",
        canonicalText: `Canonical overall health is ${canonical.health}.`,
        externalText: `External context must not replace UNKNOWN with a fabricated healthy state.`,
        item,
      });
    }
  }
  return conflicts;
}

export function conflictClaimText(conflict: CanonicalExternalConflict): string {
  if (conflict.topic === "schedule") {
    return `${conflict.externalText} ${conflict.canonicalText} External Connector Context is not a confirmed completion date.`;
  }
  if (conflict.topic === "health") {
    return `${conflict.canonicalText} ${conflict.externalText}`;
  }
  return `${conflict.canonicalText} External context remains EXTERNAL_CONTEXT and does not override canonical Project Intelligence.`;
}
