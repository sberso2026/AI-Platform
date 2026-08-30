import { conflictClaimText } from "../connector-context/conflicts";
import type { ConnectorContextPack } from "../connector-context/types";
import type { ProjectCommandCentreView } from "../command-centre/types";
import type { ManagementAttentionItem, ProjectReportEvidence } from "./types";

function asEvidence(
  sourceDomain: ProjectReportEvidence["sourceDomain"],
  entityType: string,
  entityId: string,
  sourceTimestamp?: string,
): ProjectReportEvidence {
  return { sourceDomain, entityType, entityId, sourceTimestamp, storesCanonicalCopy: false };
}

function kindForReason(reasonCode: string): ManagementAttentionItem["kind"] {
  if (/risk/.test(reasonCode)) return "known_risk";
  if (/unknown|gap|missing|not_produced|insufficient|no_data/.test(reasonCode)) return "missing_information";
  return "known_issue";
}

export function composeManagementAttention(
  view: ProjectCommandCentreView,
  connector: ConnectorContextPack,
): readonly ManagementAttentionItem[] {
  const items: ManagementAttentionItem[] = [];
  const seen = new Set<string>();

  const push = (item: ManagementAttentionItem) => {
    if (seen.has(item.id)) return;
    seen.add(item.id);
    items.push(item);
  };

  for (const item of view.attentionItems) {
    push({
      id: `pi:${item.id}`,
      kind: kindForReason(item.reasonCode),
      severity: item.severity,
      reasonCode: item.reasonCode,
      explanation: item.explanation,
      sourceClassification: "CANONICAL_PI",
      evidence: [
        {
          ...item.sourceReference,
          storesCanonicalCopy: false,
        },
      ],
    });
  }

  for (const conflict of connector.conflicts) {
    push({
      id: `conflict:${conflict.topic}:${conflict.item.externalResourceId}`,
      kind: "conflicting_information",
      severity: "amber",
      reasonCode: `canonical_external_conflict_${conflict.topic}`,
      explanation: conflictClaimText(conflict),
      sourceClassification: "EXTERNAL_CONTEXT",
      evidence: [
        asEvidence(
          "project_intelligence",
          conflict.item.resourceType,
          conflict.item.externalResourceId,
          conflict.item.sourceTimestamp ?? undefined,
        ),
      ],
      freshness: conflict.item.freshness,
    });
  }

  for (const item of connector.items) {
    if (item.freshness !== "stale") continue;
    push({
      id: `stale:${item.externalResourceId}`,
      kind: "stale_external_information",
      severity: "info",
      reasonCode: "stale_external_context",
      explanation: `Stale EXTERNAL_CONTEXT from ${item.sourceSystem}: ${item.title}. Canonical Project Intelligence is unchanged.`,
      sourceClassification: "EXTERNAL_CONTEXT",
      evidence: [asEvidence("project_intelligence", item.resourceType, item.externalResourceId, item.sourceTimestamp ?? undefined)],
      freshness: item.freshness,
    });
  }

  if (view.overallHealth === "UNKNOWN") {
    push({
      id: "missing:overall_health",
      kind: "missing_information",
      severity: "info",
      reasonCode: "overall_health_unknown",
      explanation: "Overall project health is UNKNOWN. UNKNOWN is not assumed healthy or on track.",
      sourceClassification: "CANONICAL_PI",
      evidence: view.evidenceReferences.slice(0, 2),
    });
  }

  return items;
}
