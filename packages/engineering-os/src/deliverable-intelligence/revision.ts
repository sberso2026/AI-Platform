import type { CanonicalHarvestRecord } from "../lifecycle-intelligence/harvest";
import { canonicalInactiveDocumentStatus } from "./status-mapping";
import type {
  ArtifactRevisionPolicy,
  ArtifactRevisionResolutionFailure,
  DeliverableArtifactBinding,
} from "./types";

export type ResolvedArtifactRevision = {
  policy: ArtifactRevisionPolicy;
  resolvedRevision: string | null;
  resolvedObjectId: string | null;
  rawStatusCode: string | null;
  superseded: boolean;
  voided: boolean;
  resolved: boolean;
  baselineId: string | null;
  baselineRevisionMatch: boolean | null;
  resolutionFailure: ArtifactRevisionResolutionFailure | null;
};

export function revisionResolutionExplanation(
  failure: ArtifactRevisionResolutionFailure | null | undefined,
): string {
  switch (failure) {
    case "missing_document":
      return "No matching document family was found. Resolution fails closed. Lexical revision ordering is not used.";
    case "exact_revision_not_found":
      return "The pinned exact revision was not found. Resolution fails closed. Lexical revision ordering is not used.";
    case "ambiguous_effective_revision":
      return "Multiple current-effective document revisions exist, so resolution is ambiguous and fails closed. Lexical revision ordering is not used.";
    case "no_effective_revision":
      return "No current-effective document revision exists. Resolution fails closed. Lexical revision ordering is not used.";
    case "baseline_pin_missing":
      return "No frozen configuration baseline pin was found. Resolution fails closed.";
    case "baseline_revision_not_in_family":
      return "The baseline-pinned revision is not present in the document family. Resolution fails closed. Lexical revision ordering is not used.";
    default:
      return "The governing document revision did not resolve using Document domain rules. Lexical revision ordering is not used.";
  }
}

function field(row: CanonicalHarvestRecord | undefined, key: string): string | null {
  const value = row?.fields?.[key];
  if (value == null) return null;
  return String(value);
}

export function documentFamily(
  records: readonly CanonicalHarvestRecord[],
  binding: DeliverableArtifactBinding,
): CanonicalHarvestRecord[] {
  return records.filter((row) => {
    if (row.objectType !== "document") return false;
    return (
      row.objectId === binding.artifactId ||
      field(row, "documentNumber") === binding.artifactId ||
      field(row, "documentId") === binding.artifactId
    );
  });
}

function revisionOf(row: CanonicalHarvestRecord): string | null {
  return field(row, "revision") ?? row.version ?? null;
}

function statusOf(row: CanonicalHarvestRecord | undefined): string | null {
  return field(row, "status") ?? row?.state ?? null;
}

function isVoid(row: CanonicalHarvestRecord): boolean {
  const status = String(statusOf(row) ?? "").toLowerCase();
  return status === "obsolete" || status === "void";
}

/**
 * Resolve the governing revision using Document / Configuration authority.
 * Does not invent lexical revision ordering.
 */
export function resolveArtifactRevision(input: {
  binding: DeliverableArtifactBinding;
  records: readonly CanonicalHarvestRecord[];
}): ResolvedArtifactRevision {
  const policy: ArtifactRevisionPolicy =
    input.binding.revisionPolicy ??
    (input.binding.artifactClass === "document"
      ? input.binding.revisionRef
        ? "EXACT_REVISION"
        : "CURRENT_EFFECTIVE_REVISION"
      : "EXACT_REVISION");

  if (input.binding.artifactClass !== "document") {
    const row = input.records.find((item) => item.objectType === input.binding.artifactClass && item.objectId === input.binding.artifactId);
    return {
      policy,
      resolvedRevision: input.binding.revisionRef ?? row?.version ?? null,
      resolvedObjectId: row?.objectId ?? input.binding.artifactId,
      rawStatusCode: null,
      superseded: Boolean(row?.superseded),
      voided: false,
      resolved: Boolean(row) || Boolean(input.binding.artifactId),
      baselineId: input.binding.baselineId ?? null,
      baselineRevisionMatch: null,
      resolutionFailure: null,
    };
  }

  const family = documentFamily(input.records, input.binding);
  let selected: CanonicalHarvestRecord | undefined;
  let resolutionFailure: ArtifactRevisionResolutionFailure | null = family.length === 0 ? "missing_document" : null;
  if (policy === "EXACT_REVISION") {
    if (family.length === 0) {
      selected = undefined;
    } else if (input.binding.revisionRef) {
      selected = family.find((row) => revisionOf(row) === input.binding.revisionRef);
      if (!selected) resolutionFailure = "exact_revision_not_found";
    } else {
      selected = family.find((row) => row.objectId === input.binding.artifactId) ?? family[0];
    }
  } else if (policy === "CURRENT_EFFECTIVE_REVISION") {
    if (family.length === 0) {
      selected = undefined;
    } else {
      const effective = family.filter((row) => !canonicalInactiveDocumentStatus(statusOf(row)) && !row.superseded);
      if (effective.length === 1) {
        selected = effective[0];
        resolutionFailure = null;
      } else if (effective.length === 0) {
        selected = undefined;
        resolutionFailure = "no_effective_revision";
      } else {
        selected = undefined;
        resolutionFailure = "ambiguous_effective_revision";
      }
    }
  } else {
    const items = input.records.filter(
      (row) =>
        row.objectType === "configuration_item" &&
        String(row.fields.objectType ?? "") === "document" &&
        family.some(
          (doc) =>
            doc.objectId === String(row.fields.objectId ?? "") ||
            field(doc, "documentNumber") === String(row.fields.objectCode ?? row.fields.documentNumber ?? ""),
        ),
    );
    const frozen = items.filter((row) => String(row.fields.baselineStatus ?? row.state) === "frozen");
    const pinned = frozen[0];
    if (pinned) {
      const pinnedRevision = field(pinned, "revisionRef") ?? pinned.version ?? null;
      selected = family.find((row) => revisionOf(row) === pinnedRevision);
      const match = Boolean(selected);
      return {
        policy,
        resolvedRevision: pinnedRevision,
        resolvedObjectId: selected?.objectId ?? null,
        rawStatusCode: statusOf(selected),
        superseded: Boolean(selected?.superseded) || canonicalInactiveDocumentStatus(statusOf(selected)),
        voided: selected ? isVoid(selected) : false,
        resolved: match,
        baselineId: field(pinned, "baselineId"),
        baselineRevisionMatch: match,
        resolutionFailure: match ? null : "baseline_revision_not_in_family",
      };
    }
    return {
      policy,
      resolvedRevision: null,
      resolvedObjectId: null,
      rawStatusCode: null,
      superseded: false,
      voided: false,
      resolved: false,
      baselineId: input.binding.baselineId ?? null,
      baselineRevisionMatch: false,
      resolutionFailure: family.length === 0 ? "missing_document" : "baseline_pin_missing",
    };
  }

  const baselines = input.records.filter((row) => row.objectType === "configuration_item" && String(row.fields.baselineStatus ?? row.state) === "frozen");
  const baselineHit = selected
    ? baselines.find((row) => {
        const objectId = String(row.fields.objectId ?? "");
        const revisionRef = field(row, "revisionRef");
        return (
          (objectId === selected!.objectId || objectId === input.binding.artifactId) &&
          (revisionRef == null || revisionRef === revisionOf(selected!))
        );
      })
    : undefined;

  return {
    policy,
    resolvedRevision: selected ? revisionOf(selected) : input.binding.revisionRef ?? null,
    resolvedObjectId: selected?.objectId ?? null,
    rawStatusCode: selected ? statusOf(selected) : null,
    superseded: Boolean(selected?.superseded) || canonicalInactiveDocumentStatus(statusOf(selected)),
    voided: selected ? isVoid(selected) : false,
    resolved: Boolean(selected),
    baselineId: field(baselineHit, "baselineId") ?? input.binding.baselineId ?? null,
    baselineRevisionMatch: selected ? Boolean(baselineHit) : baselines.length ? false : null,
    resolutionFailure: selected ? null : resolutionFailure,
  };
}
