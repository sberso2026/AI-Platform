"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, StatusChip } from "@rtb/ui";
import {
  asRecordArray,
  parseApiJsonResponse,
} from "@/lib/api/parse-json-response";
import {
  AssetContextHeader,
  EmptyOperationalState,
  EngineeringBreadcrumb,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { withProjectHref } from "@/lib/engineering/enterprise-ux";

const ASSET_TABS = [
  { id: "overview", label: "Overview" },
  { id: "condition", label: "Condition" },
  { id: "inspections", label: "Inspections" },
  { id: "defects", label: "Defects" },
  { id: "documents", label: "Documents" },
  { id: "risks", label: "Risks" },
  { id: "history", label: "History" },
  { id: "twin", label: "Models / Twin" },
  { id: "recommendations", label: "Recommendations" },
  { id: "ai", label: "AI" },
] as const;

export default function EngineeringAssetDetailPage() {
  const params = useParams();
  const assetId = params.assetId as string;
  const [tab, setTab] = useState<(typeof ASSET_TABS)[number]["id"]>("overview");
  const [asset, setAsset] = useState<Record<string, unknown> | null>(null);
  const [documents, setDocuments] = useState<Record<string, unknown>[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError, setDocsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/engineering/assets/${assetId}`)
      .then((r) => parseApiJsonResponse<Record<string, unknown>>(r))
      .then((parsed) => {
        if (!parsed.ok) setError(parsed.errorMessage ?? "Cannot load this asset");
        else setAsset(parsed.data);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : "Cannot load this asset"),
      );
  }, [assetId]);

  useEffect(() => {
    if (tab !== "documents") return;
    setDocsLoading(true);
    setDocsError(null);
    const qs = new URLSearchParams({ assetId });
    const projectId = asset?.engineering_project_id;
    if (typeof projectId === "string" && projectId) {
      qs.set("projectId", projectId);
    }
    fetch(`/api/engineering/documents?${qs.toString()}`)
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) {
          setDocsError(parsed.errorMessage ?? "Cannot load documents");
          setDocuments([]);
        } else {
          setDocuments(asRecordArray(parsed.data));
        }
        setDocsLoading(false);
      })
      .catch((e: unknown) => {
        setDocsError(e instanceof Error ? e.message : "Cannot load documents");
        setDocsLoading(false);
      });
  }, [tab, assetId, asset?.engineering_project_id]);

  const projectId =
    typeof asset?.engineering_project_id === "string" ? asset.engineering_project_id : null;
  const tag = String(asset?.asset_tag ?? "");
  const name = String(asset?.asset_name ?? "Asset");

  return (
    <>
      <Header
        title={asset ? `${tag} — ${name}` : "Asset"}
        description="Asset 360 — recorded identity, condition, and linked engineering work"
      />
      <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        {error ? <OperationalError message={error} retryHref="/engineering/assets" /> : null}
        {!asset && !error ? <OperationalSkeleton label="Loading asset…" /> : null}
        {asset ? (
          <div data-testid="asset-360">
            <EngineeringBreadcrumb
              items={[
                { href: "/engineering/projects", label: "Projects" },
                ...(projectId
                  ? [{ href: `/engineering/projects/${projectId}`, label: "Selected project" }]
                  : []),
                { href: withProjectHref("/engineering/assets", projectId), label: "Assets" },
                { label: tag || name },
              ]}
            />
            <AssetContextHeader
              tag={tag}
              name={name}
              assetId={assetId}
              projectId={projectId}
              status={asset.status as string}
            />
            <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Asset 360">
              {ASSET_TABS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  onClick={() => setTab(item.id)}
                  className={
                    tab === item.id
                      ? "inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
                      : "inline-flex min-h-11 items-center rounded-md px-3 text-sm text-slate-800 hover:bg-slate-100"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>

            {tab === "overview" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <Row label="Tag" value={asset.asset_tag as string} />
                  <Row label="Location" value={asset.location as string} />
                  <Row label="System" value={asset.system as string} />
                  <Row label="Subsystem" value={asset.subsystem as string} />
                  <Row
                    label="Project"
                    value={
                      (asset.presentation as { projectLabel?: string | null } | undefined)
                        ?.projectLabel ?? undefined
                    }
                  />
                </CardContent>
              </Card>
            ) : null}

            {tab === "condition" ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recorded condition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex flex-wrap gap-2">
                    <StatusChip value={String(asset.status ?? "")} />
                    <StatusChip value={String(asset.criticality ?? "")} />
                  </div>
                  <p className="text-slate-600">
                    Condition is shown from recorded status and criticality only. Remaining life and
                    probability of failure are not calculated here.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {tab === "inspections" ? (
              <EmptyOperationalState
                title="Inspections for this asset"
                description="Inspection records live in Inspection Intelligence. Open the inspection workflow to plan, execute, and review recorded sessions."
                action={
                  <Link
                    href={withProjectHref("/engineering/apps/inspection-intelligence", projectId)}
                    className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
                  >
                    Open inspections
                  </Link>
                }
              />
            ) : null}

            {tab === "defects" ? (
              <EmptyOperationalState
                title="Defects for this asset"
                description="Defects are recorded through inspection sessions. This view does not invent defect rows."
                action={
                  <Link
                    href={withProjectHref("/engineering/apps/inspection-intelligence/defects", projectId)}
                    className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
                  >
                    Open defect register
                  </Link>
                }
              />
            ) : null}

            {tab === "documents" ? (
              <Card data-testid="asset-documents-panel">
                <CardHeader>
                  <CardTitle className="text-base">Engineering Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {docsLoading ? <OperationalSkeleton rows={4} /> : null}
                  {docsError ? <OperationalError message={docsError} /> : null}
                  {!docsLoading && !docsError && documents.length === 0 ? (
                    <EmptyOperationalState
                      title="No documents linked"
                      description="No engineering documents are linked to this asset yet."
                    />
                  ) : null}
                  {documents.map((doc) => (
                    <div
                      key={doc.id as string}
                      className="flex items-start justify-between gap-4 border-b pb-2 last:border-0"
                      data-testid="asset-document-row"
                    >
                      <div>
                        <Link
                          href={`/engineering/documents/${doc.id as string}`}
                          className="font-medium underline-offset-2 hover:underline"
                        >
                          {(doc.document_number as string) ?? ""} —{" "}
                          {(doc.title as string) ?? ""}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {(doc.document_type as string) ?? "document"} · revision{" "}
                          {(doc.revision as string) ?? "—"}
                        </p>
                      </div>
                      <StatusChip value={(doc.status as string) ?? ""} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null}

            {tab === "risks" ? (
              <EmptyOperationalState
                title="Risks for this asset"
                description="Open the project risk register to review recorded risks. This page does not invent asset-level risk scores."
                action={
                  <Link
                    href={withProjectHref("/engineering/risks", projectId)}
                    className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
                  >
                    Open risks
                  </Link>
                }
              />
            ) : null}

            {tab === "history" ? (
              <Card>
                <CardContent className="space-y-2 p-6 text-sm">
                  <Row label="Last update" value={String(asset.updated_at ?? "—")} />
                  <Row label="Created" value={String(asset.created_at ?? "—")} />
                  <p className="pt-2 text-slate-600">
                    History is limited to recorded timestamps on this asset. A dedicated activity
                    timeline is not added here.
                  </p>
                </CardContent>
              </Card>
            ) : null}

            {tab === "twin" ? (
              <Card>
                <CardContent className="space-y-3 p-6 text-sm">
                  <Row
                    label="Digital twin"
                    value={
                      (asset.digital_twin_id as string) ? "Linked" : "Not linked"
                    }
                  />
                  {(asset.presentation as { knowledgeLinkStatus?: string; knowledgeNodeTitle?: string | null } | undefined)
                    ?.knowledgeLinkStatus === "linked" ? (
                    <Row
                      label="Knowledge"
                      value={
                        (asset.presentation as { knowledgeNodeTitle?: string | null }).knowledgeNodeTitle ??
                        "Linked"
                      }
                    />
                  ) : (
                    <Row label="Knowledge" value="Not linked" />
                  )}
                  <Link
                    href={withProjectHref("/engineering/apps/digital-twin", projectId)}
                    className="inline-flex min-h-11 items-center text-sm font-medium underline-offset-2 hover:underline"
                  >
                    Open Digital Twin
                  </Link>
                </CardContent>
              </Card>
            ) : null}

            {tab === "recommendations" ? (
              <EmptyOperationalState
                title="No recorded recommendations"
                description="Recommendations appear when they are captured from inspections or actions. Remaining life and failure probability are not calculated."
              />
            ) : null}

            {tab === "ai" ? (
              <EmptyOperationalState
                title="Ask about this asset"
                description="Engineering AI is advisory. It cannot approve engineering work. Evidence and provenance remain visible in the assistant."
                action={
                  <Link
                    href={`/engineering/ask?projectId=${projectId ?? ""}&objectType=asset&objectId=${assetId}&q=${encodeURIComponent("Explain this asset condition from recorded evidence.")}`}
                    className="inline-flex min-h-11 items-center rounded-md bg-slate-900 px-3 text-sm font-medium text-white"
                  >
                    Ask Engineering AI
                  </Link>
                }
              />
            ) : null}
          </div>
        ) : null}
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
