"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, SearchInput } from "@rtb/ui";

const REGISTER_ROUTES: Record<string, string> = {
  decisions: "/engineering/decisions",
  actions: "/engineering/actions",
  risks: "/engineering/risks",
  issues: "/engineering/issues",
  technicalQueries: "/engineering/technical-queries",
  lessons: "/engineering/lessons",
};

export default function EngineeringSearchPage() {
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");
  const [results, setResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams({ q: query, type: entityType });
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/engineering/search?${params}`);
    const json = await res.json();
    setResults(json.data ?? null);
    setLoading(false);
  }

  return (
      <>
        <Header
        title="Engineering Search"
        description="Search projects, assets, documents, intelligence registers, and knowledge graph nodes"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <form onSubmit={onSearch} className="mb-6 flex flex-wrap items-center gap-3">
          <SearchInput
            containerClassName="min-w-[240px] flex-1 basis-[280px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search engineering entities..."
            aria-label="Search engineering entities"
          />
          <select
            className="h-11 rounded-md border border-input bg-transparent px-3 text-[0.9375rem]"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          >
            <option value="all">All</option>
            <option value="project">Projects</option>
            <option value="asset">Assets</option>
            <option value="document">Documents</option>
            <option value="decision">Decisions</option>
            <option value="action">Actions</option>
            <option value="risk">Risks</option>
            <option value="issue">Issues</option>
            <option value="technical_query">Technical Queries</option>
            <option value="lesson">Lessons Learned</option>
          </select>
          <Input
            className="w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            placeholder="Status filter"
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? "Searching..." : "Search"}
          </Button>
        </form>

        {results && (
          <div className="grid gap-4 md:grid-cols-2">
            <ResultGroup
              title="Projects"
              items={(results.projects as Record<string, unknown>[]) ?? []}
              href={(id) => `/engineering/projects/${id}`}
              label={(i) => `${i.project_code} — ${i.project_name}`}
            />
            <ResultGroup
              title="Assets"
              items={(results.assets as Record<string, unknown>[]) ?? []}
              href={(id) => `/engineering/assets/${id}`}
              label={(i) => `${i.asset_tag} — ${i.asset_name}`}
            />
            <ResultGroup
              title="Documents"
              items={(results.documents as Record<string, unknown>[]) ?? []}
              href={(id) => `/engineering/documents/${id}`}
              label={(i) => `${i.document_number} — ${i.title}`}
            />
            <RegisterResultGroup
              title="Decisions"
              items={(results.decisions as Record<string, unknown>[]) ?? []}
              href={REGISTER_ROUTES.decisions}
              label={(i) => `${i.decision_number} — ${i.title}`}
            />
            <RegisterResultGroup
              title="Actions"
              items={(results.actions as Record<string, unknown>[]) ?? []}
              href={REGISTER_ROUTES.actions}
              label={(i) => `${i.action_number} — ${i.title}`}
            />
            <RegisterResultGroup
              title="Risks"
              items={(results.risks as Record<string, unknown>[]) ?? []}
              href={REGISTER_ROUTES.risks}
              label={(i) => `${i.risk_number} — ${i.title}`}
            />
            <RegisterResultGroup
              title="Issues"
              items={(results.issues as Record<string, unknown>[]) ?? []}
              href={REGISTER_ROUTES.issues}
              label={(i) => `${i.issue_number} — ${i.title}`}
            />
            <RegisterResultGroup
              title="Technical Queries"
              items={(results.technicalQueries as Record<string, unknown>[]) ?? []}
              href={REGISTER_ROUTES.technicalQueries}
              label={(i) => `${i.tq_number} — ${(i.question as string) ?? i.title}`}
            />
            <RegisterResultGroup
              title="Lessons Learned"
              items={(results.lessons as Record<string, unknown>[]) ?? []}
              href={REGISTER_ROUTES.lessons}
              label={(i) => `${i.lesson_number} — ${i.title}`}
            />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Knowledge Graph</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {((results.knowledgeNodes as Record<string, unknown>[]) ?? []).length === 0 && (
                  <p className="text-sm text-muted-foreground">No matching nodes.</p>
                )}
                {((results.knowledgeNodes as Record<string, unknown>[]) ?? []).map((n) => (
                  <div key={n.id as string} className="flex justify-between text-sm">
                    <span>{n.title as string}</span>
                    <Badge variant="secondary">{n.node_type as string}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      </>
  );
}

function ResultGroup({
  title,
  items,
  href,
  label,
}: {
  title: string;
  items: Record<string, unknown>[];
  href: (id: string) => string;
  label: (item: Record<string, unknown>) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No matches.</p>
        )}
        {items.map((item) => (
          <Link
            key={item.id as string}
            href={href(item.id as string)}
            className="block rounded border p-2 text-sm hover:bg-muted/50"
          >
            {label(item)}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}

function RegisterResultGroup({
  title,
  items,
  href,
  label,
}: {
  title: string;
  items: Record<string, unknown>[];
  href: string;
  label: (item: Record<string, unknown>) => string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">{title}</CardTitle>
        <Link href={href} className="text-xs text-primary underline">
          Open register
        </Link>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No matches.</p>
        )}
        {items.map((item) => (
          <div key={item.id as string} className="rounded border p-2 text-sm">
            {label(item)}
            {item.status ? (
              <Badge className="ml-2" variant="secondary">
                {item.status as string}
              </Badge>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
