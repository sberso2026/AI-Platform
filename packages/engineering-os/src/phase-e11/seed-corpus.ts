/**
 * Synthetic seeded engineering corpus for deterministic benchmarks.
 * Not client-confidential. Not production accuracy evidence.
 */

export type SeedDocument = {
  id: string;
  title: string;
  revision: string;
  status: "current" | "superseded";
  supersedesId?: string;
  projectId: string;
  assetId?: string;
  classification: "internal" | "restricted";
};

export type SeedDecision = {
  id: string;
  title: string;
  projectId: string;
  assetId?: string;
  outcome: string;
  supersededById?: string;
};

export type SeedAsset = {
  id: string;
  tag: string;
  projectId: string;
  history: string[];
};

export type SeedMemory = {
  id: string;
  precedent: string;
  assetId?: string;
  projectId: string;
  restricted: boolean;
  superseded: boolean;
  sourceId: string;
};

export type SeedEvidence = {
  id: string;
  kind: "inspection" | "measurement" | "document" | "tq" | "decision";
  assetId: string;
  summary: string;
  conflictsWithId?: string;
  tenantId: string;
};

export const E11_SEED_TENANT = "seed-e11-benchmark-tenant";
export const E11_OTHER_TENANT = "seed-e11-other-tenant";

export const E11_SEED_CORPUS = {
  disclaimer:
    "Synthetic fixtures for Engineering OS evaluation only — not production accuracy or client data.",
  projectId: "proj-integrity-alpha",
  asset: {
    id: "asset-pipe-p101",
    tag: "P-101",
    projectId: "proj-integrity-alpha",
    history: [
      "2019 install",
      "2022 UT thickness survey",
      "2024 visual inspection finding corrosion",
    ],
  } satisfies SeedAsset,
  documents: [
    {
      id: "doc-spec-v1",
      title: "Piping Integrity Spec",
      revision: "A",
      status: "superseded",
      projectId: "proj-integrity-alpha",
      assetId: "asset-pipe-p101",
      classification: "internal",
    },
    {
      id: "doc-spec-v2",
      title: "Piping Integrity Spec",
      revision: "B",
      status: "current",
      supersedesId: "doc-spec-v1",
      projectId: "proj-integrity-alpha",
      assetId: "asset-pipe-p101",
      classification: "internal",
    },
    {
      id: "doc-restricted",
      title: "Restricted integrity memo",
      revision: "1",
      status: "current",
      projectId: "proj-integrity-alpha",
      assetId: "asset-pipe-p101",
      classification: "restricted",
    },
  ] satisfies SeedDocument[],
  decisions: [
    {
      id: "dec-coat-2023",
      title: "Approve coating repair scope",
      projectId: "proj-integrity-alpha",
      assetId: "asset-pipe-p101",
      outcome: "Approved local coating repair; re-inspect in 12 months",
    },
    {
      id: "dec-coat-2023-superseded",
      title: "Defer coating (draft)",
      projectId: "proj-integrity-alpha",
      assetId: "asset-pipe-p101",
      outcome: "Deferred",
      supersededById: "dec-coat-2023",
    },
  ] satisfies SeedDecision[],
  memories: [
    {
      id: "mem-coating-precedent",
      precedent: "Similar coating repair on P-088 completed with UT follow-up",
      assetId: "asset-pipe-p101",
      projectId: "proj-integrity-alpha",
      restricted: false,
      superseded: false,
      sourceId: "dec-coat-2023",
    },
    {
      id: "mem-restricted",
      precedent: "Restricted commercial settlement note",
      projectId: "proj-integrity-alpha",
      restricted: true,
      superseded: false,
      sourceId: "doc-restricted",
    },
  ] satisfies SeedMemory[],
  evidence: [
    {
      id: "ev-insp-2024",
      kind: "inspection",
      assetId: "asset-pipe-p101",
      summary: "Visual inspection: external corrosion at support",
      tenantId: E11_SEED_TENANT,
    },
    {
      id: "ev-ut-2022",
      kind: "measurement",
      assetId: "asset-pipe-p101",
      summary: "UT min thickness 6.2 mm at SP-03",
      tenantId: E11_SEED_TENANT,
    },
    {
      id: "ev-doc-spec",
      kind: "document",
      assetId: "asset-pipe-p101",
      summary: "Spec Rev B thickness criteria",
      tenantId: E11_SEED_TENANT,
    },
    {
      id: "ev-tq-01",
      kind: "tq",
      assetId: "asset-pipe-p101",
      summary: "TQ: confirm coating system at support",
      tenantId: E11_SEED_TENANT,
    },
    {
      id: "ev-dec-01",
      kind: "decision",
      assetId: "asset-pipe-p101",
      summary: "Decision: approve coating repair",
      tenantId: E11_SEED_TENANT,
    },
    {
      id: "ev-conflict-a",
      kind: "measurement",
      assetId: "asset-pipe-p101",
      summary: "Field note claims thickness 8.0 mm",
      conflictsWithId: "ev-ut-2022",
      tenantId: E11_SEED_TENANT,
    },
    {
      id: "ev-other-tenant",
      kind: "document",
      assetId: "asset-pipe-p101",
      summary: "Other tenant confidential note",
      tenantId: E11_OTHER_TENANT,
    },
  ] satisfies SeedEvidence[],
  scenarios: [
    { id: "sc-repair", label: "Local coating repair", supported: true },
    { id: "sc-replace", label: "Full spool replacement", supported: false },
  ],
  risks: [
    {
      id: "risk-corrosion",
      title: "External corrosion at support",
      attentionRequired: true,
    },
    {
      id: "risk-low",
      title: "Paint aesthetic",
      attentionRequired: false,
    },
  ],
} as const;

export function listCurrentDocuments() {
  return E11_SEED_CORPUS.documents.filter((d) => d.status === "current");
}

export function listSupersededDocuments() {
  return E11_SEED_CORPUS.documents.filter((d) => d.status === "superseded");
}

export function evidenceForTenant(tenantId: string) {
  return E11_SEED_CORPUS.evidence.filter((e) => e.tenantId === tenantId);
}
