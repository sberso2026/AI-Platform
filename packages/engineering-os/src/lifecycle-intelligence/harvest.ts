import { createHash } from "node:crypto";
import { fingerprintLifecycleEvidence } from "./fingerprint";
import type {
  LifecycleAssignment,
  LifecycleCompleteness,
  LifecycleEvidence,
  LifecycleEvidenceItem,
  LifecycleEvidenceMode,
  LifecycleEvidenceSnapshot,
  LifecycleProfile,
  LifecycleScopeType,
  OptimizationStagePolicy,
} from "./types";

export type HarvestQuery = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scopeType: LifecycleScopeType;
  scopeId: string;
};

export type CanonicalHarvestRecord = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scopeId?: string | null;
  objectType: string;
  objectId: string;
  state: string;
  fields: Record<string, unknown>;
  stale?: boolean;
  superseded?: boolean;
  version?: string | null;
};

export type CanonicalHarvestBundle = {
  records: CanonicalHarvestRecord[];
  truncated?: boolean;
  failed?: boolean;
  failureReason?: string | null;
  assuranceCompleteness?: LifecycleCompleteness;
  optimizationPolicy?: OptimizationStagePolicy;
  optimizationPresent?: boolean;
};

export interface CanonicalEvidenceSource {
  load(query: HarvestQuery): Promise<CanonicalHarvestBundle>;
}

export function createMemoryCanonicalSource(bundle: CanonicalHarvestBundle | ((query: HarvestQuery) => CanonicalHarvestBundle)): CanonicalEvidenceSource {
  return {
    async load(query) {
      const raw = typeof bundle === "function" ? bundle(query) : bundle;
      const records = raw.records.filter((row) => {
        if (row.tenantId !== query.tenantId || row.workspaceId !== query.workspaceId || row.projectId !== query.projectId) {
          return false;
        }
        if (query.scopeType === "PROJECT") return !row.scopeId || row.scopeId === query.scopeId;
        return row.scopeId === query.scopeId;
      });
      return { ...raw, records };
    },
  };
}

function inScope(row: CanonicalHarvestRecord, query: HarvestQuery): boolean {
  if (row.tenantId !== query.tenantId || row.workspaceId !== query.workspaceId || row.projectId !== query.projectId) return false;
  if (query.scopeType === "PROJECT") return !row.scopeId || row.scopeId === query.scopeId;
  return row.scopeId === query.scopeId;
}

function item(
  row: CanonicalHarvestRecord,
  evidenceType: string,
  harvestedAt: string,
  provenance: LifecycleEvidenceMode,
): LifecycleEvidenceItem {
  return {
    evidenceType,
    canonicalObjectType: row.objectType,
    canonicalObjectId: row.objectId,
    tenantId: row.tenantId,
    workspaceId: row.workspaceId,
    projectId: row.projectId,
    scopeId: row.scopeId ?? null,
    sourceState: row.state,
    sourceVersion: row.version ?? null,
    stale: Boolean(row.stale),
    superseded: Boolean(row.superseded),
    harvestedAt,
    provenance,
  };
}

export function harvestToLifecycleEvidence(bundle: CanonicalHarvestBundle, query: HarvestQuery): {
  evidence: LifecycleEvidence;
  items: LifecycleEvidenceItem[];
} {
  const harvestedAt = new Date().toISOString();
  const rows = bundle.records.filter((row) => inScope(row, query));
  const items: LifecycleEvidenceItem[] = [];
  const evidence: LifecycleEvidence = {
    projectId: query.projectId,
    baselines: [],
    requirements: [],
    assumptions: [],
    interfaces: [],
    analyses: [],
    reviews: [],
    decisions: [],
    changes: [],
    assurance: { completeness: bundle.assuranceCompleteness ?? "COMPLETE", conditions: [] },
    optimizationPolicy: bundle.optimizationPolicy ?? "OPTIONAL",
    optimizationPresent: Boolean(bundle.optimizationPresent),
    truncated: Boolean(bundle.truncated),
    failed: Boolean(bundle.failed),
    failureReason: bundle.failureReason ?? null,
  };

  for (const row of rows) {
    if (row.objectType === "configuration_baseline") {
      evidence.baselines.push({
        id: row.objectId,
        baselineType: String(row.fields.baselineType ?? "FEED"),
        status: String(row.fields.status ?? row.state),
      });
      items.push(item(row, "CONFIGURATION_BASELINE", harvestedAt, "CANONICAL"));
    } else if (row.objectType === "requirement") {
      evidence.requirements.push({
        id: row.objectId,
        allocated: Boolean(row.fields.allocated),
        status: String(row.fields.status ?? row.state),
      });
      items.push(item(row, "REQUIREMENT", harvestedAt, "CANONICAL"));
    } else if (row.objectType === "assumption") {
      evidence.assumptions.push({
        id: row.objectId,
        materiality: (row.fields.materiality as string | null) ?? null,
        validationStatus: (row.fields.validationStatus as string | null) ?? null,
        expired: Boolean(row.fields.expired),
        reviewed: Boolean(row.fields.reviewed),
      });
      items.push(item(row, "ASSUMPTION", harvestedAt, "CANONICAL"));
    } else if (row.objectType === "interface") {
      evidence.interfaces.push({
        id: row.objectId,
        informationKey: String(row.fields.informationKey ?? "OPERATING_LOAD"),
        status: String(row.fields.status ?? row.state),
        sourceDiscipline: (row.fields.sourceDiscipline as string | null) ?? null,
        receivingDiscipline: (row.fields.receivingDiscipline as string | null) ?? null,
      });
      items.push(item(row, "INTERFACE", harvestedAt, "CANONICAL"));
    } else if (row.objectType === "analysis_result") {
      evidence.analyses.push({
        id: row.objectId,
        applicable: row.fields.applicable !== false,
        valid: Boolean(row.fields.valid),
        reviewed: Boolean(row.fields.reviewed),
        accepted: Boolean(row.fields.accepted),
        stale: Boolean(row.stale || row.fields.stale),
      });
      items.push(item(row, "ANALYSIS", harvestedAt, "CANONICAL"));
    } else if (row.objectType === "review_package") {
      evidence.reviews.push({ id: row.objectId, status: String(row.fields.status ?? row.state) });
      items.push(item(row, "ENGINEERING_REVIEW", harvestedAt, "CANONICAL"));
    } else if (row.objectType === "decision") {
      evidence.decisions.push({
        id: row.objectId,
        status: String(row.fields.status ?? row.state),
        decisionClass: (row.fields.decisionClass as string | null) ?? null,
      });
      items.push(item(row, "DECISION", harvestedAt, "CANONICAL"));
    } else if (row.objectType === "change") {
      evidence.changes.push({
        id: row.objectId,
        status: String(row.fields.status ?? row.state),
        material: Boolean(row.fields.material),
      });
      items.push(item(row, "CHANGE", harvestedAt, "CANONICAL"));
    } else if (row.objectType === "assurance_condition") {
      evidence.assurance.conditions.push({
        id: row.objectId,
        conditionType: String(row.fields.conditionType ?? row.state),
        materiality: String(row.fields.materiality ?? "UNASSESSED"),
        status: String(row.fields.status ?? row.state),
      });
      items.push(item(row, "ASSURANCE_CONDITION", harvestedAt, "CANONICAL"));
    } else if (row.objectType === "optimization_run" || row.objectType === "optimization_study") {
      evidence.optimizationPresent = true;
      items.push(item(row, "OPTIMIZATION", harvestedAt, "CANONICAL"));
    }
  }
  return { evidence, items };
}

export function buildEvidenceSnapshot(input: {
  assignment: LifecycleAssignment;
  profile: LifecycleProfile;
  gateId: string;
  evidence: LifecycleEvidence;
  items: LifecycleEvidenceItem[];
  evidenceSource: LifecycleEvidenceMode;
  harvestedAt?: string;
}): LifecycleEvidenceSnapshot {
  const harvestedAt = input.harvestedAt ?? new Date().toISOString();
  const fingerprint = fingerprintLifecycleEvidence(input.evidence);
  return {
    profileId: input.profile.profileId,
    profileVersion: input.profile.profileVersion,
    gateId: input.gateId,
    projectId: input.assignment.projectId,
    scopeType: input.assignment.scopeType,
    scopeId: input.assignment.scopeId,
    effectiveStage: input.assignment.stage,
    evidenceSource: input.evidenceSource,
    harvestedAt,
    items: input.items,
    fingerprint,
    assuranceEvaluationCompleteness: input.evidence.assurance.completeness,
    configurationBaselineId: input.evidence.baselines.find((row) => row.status === "frozen")?.id ?? null,
  };
}

export function fixtureEvidenceToItems(
  evidence: LifecycleEvidence,
  query: HarvestQuery,
  harvestedAt = new Date().toISOString(),
): LifecycleEvidenceItem[] {
  const base = {
    tenantId: query.tenantId,
    workspaceId: query.workspaceId,
    projectId: query.projectId,
    scopeId: query.scopeId,
    harvestedAt,
    provenance: "TEST_FIXTURE" as const,
  };
  return [
    ...evidence.baselines.map((row) => ({ ...base, evidenceType: "CONFIGURATION_BASELINE", canonicalObjectType: "configuration_baseline", canonicalObjectId: row.id, sourceState: row.status })),
    ...evidence.requirements.map((row) => ({ ...base, evidenceType: "REQUIREMENT", canonicalObjectType: "requirement", canonicalObjectId: row.id, sourceState: row.status })),
    ...evidence.assumptions.map((row) => ({ ...base, evidenceType: "ASSUMPTION", canonicalObjectType: "assumption", canonicalObjectId: row.id, sourceState: row.validationStatus ?? "unknown" })),
    ...evidence.interfaces.map((row) => ({ ...base, evidenceType: "INTERFACE", canonicalObjectType: "interface", canonicalObjectId: row.id, sourceState: row.status })),
    ...evidence.analyses.map((row) => ({ ...base, evidenceType: "ANALYSIS", canonicalObjectType: "analysis_result", canonicalObjectId: row.id, sourceState: row.valid ? "valid" : "invalid", stale: row.stale })),
    ...evidence.reviews.map((row) => ({ ...base, evidenceType: "ENGINEERING_REVIEW", canonicalObjectType: "review_package", canonicalObjectId: row.id, sourceState: row.status })),
    ...evidence.decisions.map((row) => ({ ...base, evidenceType: "DECISION", canonicalObjectType: "decision", canonicalObjectId: row.id, sourceState: row.status })),
    ...evidence.changes.map((row) => ({ ...base, evidenceType: "CHANGE", canonicalObjectType: "change", canonicalObjectId: row.id, sourceState: row.status })),
    ...evidence.assurance.conditions.map((row) => ({ ...base, evidenceType: "ASSURANCE_CONDITION", canonicalObjectType: "assurance_condition", canonicalObjectId: row.id, sourceState: row.status })),
  ];
}

export function snapshotFingerprint(snapshot: LifecycleEvidenceSnapshot): string {
  return createHash("sha256")
    .update(JSON.stringify({ fingerprint: snapshot.fingerprint, items: snapshot.items.map((row) => `${row.canonicalObjectType}:${row.canonicalObjectId}:${row.sourceState}`) }))
    .digest("hex");
}

export async function harvestCanonicalLifecycleEvidence(
  source: CanonicalEvidenceSource,
  query: HarvestQuery,
): Promise<{ evidence: LifecycleEvidence; items: LifecycleEvidenceItem[] }> {
  const bundle = await source.load(query);
  return harvestToLifecycleEvidence(bundle, query);
}
