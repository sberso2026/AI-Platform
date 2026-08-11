"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { AskThisObjectLink } from "@/components/engineering/ask-this-object-link";

export default function EngineeringProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState<{
    project: Record<string, unknown>;
    assets: Record<string, unknown>[];
    documents: Record<string, unknown>[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engineering/projects/${projectId}`)
      .then((r) =>
        parseApiJsonResponse<{
          project: Record<string, unknown>;
          assets: Record<string, unknown>[];
          documents: Record<string, unknown>[];
        }>(r),
      )
      .then((parsed) => {
        if (!parsed.ok || !parsed.data) {
          setError(
            parsed.errorMessage ?? `Request failed with status ${parsed.status}`,
          );
          return;
        }
        setData(parsed.data);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Failed to load project"),
      );
  }, [projectId]);

  const project = data?.project;
  const tabs = ["overview", "assets", "documents", "ai", "knowledge", "settings"];

  return (
    <>
      <Header
        title={
          project
            ? `${project.project_code as string} — ${project.project_name as string}`
            : "Project"
        }
        description="Engineering project foundation"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
        {!project && !error && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}
        {project && (
          <>
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge>{project.status as string}</Badge>
              <Badge variant="secondary">{project.project_phase as string}</Badge>
              {project.client_name ? (
                <Badge variant="outline">{project.client_name as string}</Badge>
              ) : null}
              <AskThisObjectLink
                label="Ask this project"
                projectId={projectId}
                objectType="project"
                objectId={projectId}
                q="Summarise this project"
                testId="ask-this-project"
              />
            </div>
            <div className="mb-4 flex gap-2 border-b">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3 py-2 text-sm capitalize ${
                    tab === t
                      ? "border-b-2 border-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {t === "ai" ? "AI Workspace" : t}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Row label="Code" value={project.project_code as string} />
                    <Row label="Site" value={project.site_name as string} />
                    <Row label="Location" value={project.location as string} />
                    <Row label="Industry" value={project.industry as string} />
                    <Row label="Type" value={project.project_type as string} />
                    <Row
                      label="Knowledge"
                      value={
                        (project.presentation as
                          | {
                              knowledgeLinkStatus?: string;
                              knowledgeNodeTitle?: string | null;
                            }
                          | undefined)?.knowledgeLinkStatus === "linked"
                          ? (project.presentation as { knowledgeNodeTitle?: string | null })
                              .knowledgeNodeTitle
                            ? `Linked — ${(project.presentation as { knowledgeNodeTitle?: string | null }).knowledgeNodeTitle}`
                            : "Linked"
                          : "Not linked"
                      }
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Linked Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Row label="Assets" value={String(data?.assets.length ?? 0)} />
                    <Row label="Documents" value={String(data?.documents.length ?? 0)} />
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === "assets" && (
              <EntityList
                items={data?.assets ?? []}
                empty="No assets linked."
                href={(id) => `/engineering/assets/${id}`}
                title={(i) =>
                  `${i.asset_tag as string} — ${i.asset_name as string}`
                }
              />
            )}

            {tab === "documents" && (
              <EntityList
                items={data?.documents ?? []}
                empty="No documents linked."
                href={(id) => `/engineering/documents/${id}`}
                title={(i) =>
                  `${i.document_number as string} — ${i.title as string}`
                }
              />
            )}

            {tab === "ai" && (
              <Card>
                <CardContent className="p-6">
                  <p className="mb-3 text-sm text-muted-foreground">
                    Open the Engineering AI Workspace with this project selected.
                  </p>
                  <Link
                    href={`/engineering/ai?projectId=${projectId}`}
                    className="text-sm font-medium text-primary underline"
                  >
                    Open AI Workspace
                  </Link>
                </CardContent>
              </Card>
            )}

            {tab === "knowledge" && (
              <Card>
                <CardContent className="p-6 text-sm">
                  {(project.presentation as
                    | {
                        knowledgeLinkStatus?: string;
                        knowledgeNodeTitle?: string | null;
                      }
                    | undefined)?.knowledgeLinkStatus === "linked"
                    ? (project.presentation as { knowledgeNodeTitle?: string | null })
                        .knowledgeNodeTitle
                      ? `Linked — ${(project.presentation as { knowledgeNodeTitle?: string | null }).knowledgeNodeTitle}`
                      : "Knowledge linked via shared Knowledge Graph"
                    : "Knowledge not linked"}
                </CardContent>
              </Card>
            )}
            {tab === "settings" && (
              <Card>
                <CardContent className="p-6 text-sm text-muted-foreground">
                  Project settings shell — advanced Project Intelligence comes in Batch 2.1.
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span>{value || "—"}</span>
    </div>
  );
}

function EntityList({
  items,
  empty,
  href,
  title,
}: {
  items: Record<string, unknown>[];
  empty: string;
  href: (id: string) => string;
  title: (item: Record<string, unknown>) => string;
}) {
  if (!items.length) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <div className="grid gap-2">
      {items.map((item) => (
        <Link
          key={item.id as string}
          href={href(item.id as string)}
          className="rounded border p-3 text-sm hover:bg-muted/50"
        >
          {title(item)}
        </Link>
      ))}
    </div>
  );
}
