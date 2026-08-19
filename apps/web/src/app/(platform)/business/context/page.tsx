"use client";

import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { PageMain } from "@/components/layout/page-main";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  SectionHeader,
  StatusChip,
} from "@rtb/ui";
import { GitBranch } from "lucide-react";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";

type SearchHit = {
  entityType: string;
  entityId: string;
  displayName: string;
  canonicalRef: string;
  domain: string;
};

type Neighbour = {
  node: { entityType: string; displayName: string; entityId: string };
  relationshipType: string;
  evidence: { sourceDomain: string; sourceEntityRef: string; projectedAt: string; status: string };
};

type EntityContext = {
  entity: SearchHit | null;
  neighbours: Neighbour[];
  missingLinks: string[];
  unknown: string[];
  truncated: boolean;
  adjacencyIsNotCausation: true;
  freshness: string | null;
};

type Quality = {
  projectionFreshnessHours: number | null;
  unresolvedRefs: number;
  staleProjections: number;
  relationshipEvidenceCoverageBps: number;
  domainCoverage: string[];
};

type Finding = { code: string; severity: string; message: string; repaired: false };

export default function BusinessContextPage() {
  const [query, setQuery] = useState("Customer ABC");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [entity, setEntity] = useState<EntityContext | null>(null);
  const [quality, setQuality] = useState<Quality | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadQuality = useCallback(async () => {
    const parsed = await parseApiJsonResponse<{ quality: Quality; findings: Finding[] }>(
      await fetch("/api/business/context/diagnostics"),
    );
    if (parsed.ok && parsed.data) {
      setQuality(parsed.data.quality);
      setFindings(parsed.data.findings ?? []);
    }
  }, []);

  useEffect(() => {
    void loadQuality();
  }, [loadQuality]);

  async function runSearch() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse<SearchHit[]>(
        await fetch(`/api/business/context?q=${encodeURIComponent(query)}`),
      );
      if (!parsed.ok) {
        setError(parsed.errorMessage ?? "Search failed");
        return;
      }
      setError(null);
      setHits(parsed.data ?? []);
    } finally {
      setBusy(false);
    }
  }

  async function openEntity(hit: SearchHit) {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse<EntityContext>(
        await fetch(`/api/business/context/entity?type=${encodeURIComponent(hit.entityType)}&id=${encodeURIComponent(hit.entityId)}`),
      );
      if (!parsed.ok) {
        setError(parsed.errorMessage ?? "Unable to load entity context");
        return;
      }
      setError(null);
      setEntity(parsed.data);
    } finally {
      setBusy(false);
    }
  }

  async function seedDemo() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/context/demo", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Unable to load demo fixtures");
      else {
        setError(null);
        await runSearch();
        await loadQuality();
      }
    } finally {
      setBusy(false);
    }
  }

  async function rebuild() {
    setBusy(true);
    try {
      const parsed = await parseApiJsonResponse(await fetch("/api/business/context/rebuild", { method: "POST" }));
      if (!parsed.ok) setError(parsed.errorMessage ?? "Rebuild failed");
      else {
        setError(null);
        await loadQuality();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Header title="Business Context" />
      <PageMain>
        {error && <p className="mb-4 text-sm text-red-700">{error}</p>}
        <p className="mb-6 text-sm text-slate-600">
          Linked customers, work, risks, and decisions from trusted business records. A link is not a cause.
          Personal contacts that are suppressed stay hidden.
        </p>
        <div className="mb-6 flex flex-wrap gap-2">
          <Button disabled={busy} onClick={() => void seedDemo()}>
            Load context demo
          </Button>
          <Button disabled={busy} variant="secondary" onClick={() => void rebuild()}>
            Rebuild projection
          </Button>
        </div>

        <section className="mb-8" data-testid="bos-context-search">
          <SectionHeader title="Context search" description="Find a customer, work item, decision, or risk." />
          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className="min-w-[16rem] rounded border border-slate-300 px-3 py-2 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search business entity"
            />
            <Button disabled={busy} onClick={() => void runSearch()}>
              Search
            </Button>
          </div>
          <div className="mt-4 grid gap-2">
            {hits.length === 0 ? (
              <EmptyState icon={<GitBranch className="h-8 w-8" />} title="No matches" description="Load demo fixtures or search for a known entity." />
            ) : (
              hits.map((hit) => (
                <button
                  key={hit.canonicalRef}
                  className="rounded border border-slate-200 px-3 py-2 text-left text-sm hover:bg-slate-50"
                  onClick={() => void openEntity(hit)}
                >
                  <span className="font-medium">{hit.displayName}</span>
                  <span className="ml-2 text-slate-500">{hit.entityType}</span>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="mb-8" data-testid="bos-context-entity">
          <SectionHeader title="Entity context" description="Related records with evidence. Adjacency is not causation." />
          {!entity?.entity ? (
            <p className="mt-3 text-sm text-slate-500">Select a search result to view related customers, work, risks, and decisions.</p>
          ) : (
            <Card className="mt-3">
              <CardHeader>
                <CardTitle>{entity.entity.displayName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>
                  {entity.entity.entityType} · freshness {entity.freshness ?? "unknown"}
                </p>
                <p className="text-slate-600">A linked risk or customer does not mean one caused the other.</p>
                <div data-testid="bos-context-relationships" className="space-y-2">
                  {entity.neighbours.map((row, index) => (
                    <div key={`${row.relationshipType}-${row.node.entityId}-${index}`} className="rounded bg-slate-50 px-3 py-2">
                      <div className="font-medium">{row.node.displayName}</div>
                      <div className="text-slate-600">
                        {row.relationshipType} · evidence {row.evidence.sourceEntityRef} · {row.evidence.sourceDomain}
                      </div>
                    </div>
                  ))}
                </div>
                {entity.unknown.length > 0 && (
                  <p className="text-amber-700">Unknown: {entity.unknown.join(", ")}</p>
                )}
              </CardContent>
            </Card>
          )}
        </section>

        <section data-testid="bos-context-quality">
          <SectionHeader title="Data quality" description="Unresolved links, stale projections, and missing provenance stay visible." />
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Unresolved links</CardTitle>
              </CardHeader>
              <CardContent>{quality?.unresolvedRefs ?? "Unknown"}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Stale projections</CardTitle>
              </CardHeader>
              <CardContent>{quality?.staleProjections ?? "Unknown"}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Evidence coverage</CardTitle>
              </CardHeader>
              <CardContent>
                {quality ? `${(quality.relationshipEvidenceCoverageBps / 100).toFixed(0)}%` : "Unknown"}
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 space-y-2">
            {findings.slice(0, 12).map((finding, index) => (
              <div key={`${finding.code}-${index}`} className="flex items-center gap-2 text-sm">
                <StatusChip value={finding.severity}>{finding.code}</StatusChip>
                <span>{finding.message}</span>
              </div>
            ))}
          </div>
        </section>
      </PageMain>
    </>
  );
}
