"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Badge, Button, Card, CardContent, EmptyState, Input } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { EXECUTION_READY, READINESS_LABELS, REVIEW_DISCLAIMER } from "@/lib/review/labels";

type DocumentRow = {
  documentId: string;
  title?: string;
  documentNumber?: string;
  revision: string;
  documentType?: string;
  readiness: string;
  reasons: string[];
};

type PackageRow = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
};

type ProjectPayload = {
  project: { id: string; code?: string; name: string };
  documents: DocumentRow[];
  packages: PackageRow[];
};

export default function ReviewProjectPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [payload, setPayload] = useState<ProjectPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("Review package");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch(`/api/review/projects/${params.projectId}`);
      const parsed = await parseApiJsonResponse<ProjectPayload>(response);
      if (cancelled) return;
      if (!parsed.ok || !parsed.data) {
        setError(parsed.errorMessage ?? "Unable to load project");
        return;
      }
      setPayload(parsed.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [params.projectId]);

  const excluded = useMemo(
    () => (payload?.documents ?? []).filter((doc) => !EXECUTION_READY.has(doc.readiness)),
    [payload],
  );

  async function createPackage() {
    setSaving(true);
    setError(null);
    const response = await fetch(`/api/review/projects/${params.projectId}/packages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, documentIds: selected }),
    });
    const parsed = await parseApiJsonResponse<{ pkg: { id: string } }>(response);
    setSaving(false);
    if (!parsed.ok || !parsed.data?.pkg?.id) {
      setError(parsed.errorMessage ?? "Could not create review package");
      return;
    }
    router.push(`/review/projects/${params.projectId}/packages/${parsed.data.pkg.id}`);
  }

  return (
    <>
      <Header
        title={payload?.project ? payload.project.name : "Project review"}
        description="Select authorized documents and create a review package"
        showEngineeringChrome={false}
      />
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">
          <Link href="/review" className="underline">
            Projects
          </Link>
          {" / "}
          {payload?.project?.code ?? params.projectId}
        </p>
        <p className="text-sm text-muted-foreground">{REVIEW_DISCLAIMER}</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Card>
          <CardContent className="space-y-4 py-4">
            <h2 className="text-base font-semibold">Documents</h2>
            {!payload ? <p className="text-sm text-muted-foreground">Loading documents…</p> : null}
            {payload && payload.documents.length === 0 ? (
              <EmptyState
                title="No authorized documents"
                description="Only documents in this tenant, workspace, and project can be selected."
              />
            ) : null}
            {(payload?.documents ?? []).map((doc) => {
              const ready = EXECUTION_READY.has(doc.readiness);
              return (
                <label key={doc.documentId} className="flex items-start gap-3 rounded-md border p-3">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={selected.includes(doc.documentId)}
                    onChange={(event) => {
                      setSelected((current) =>
                        event.target.checked
                          ? [...current, doc.documentId]
                          : current.filter((id) => id !== doc.documentId),
                      );
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {doc.documentNumber ? `${doc.documentNumber} — ` : ""}
                      {doc.title ?? doc.documentId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rev {doc.revision}
                      {doc.documentType ? ` · ${doc.documentType}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={ready ? "success" : "warning"}>
                        {READINESS_LABELS[doc.readiness] ?? doc.readiness}
                      </Badge>
                      {!ready ? (
                        <span className="text-xs text-muted-foreground">
                          Excluded from execution until ready
                        </span>
                      ) : null}
                    </div>
                  </div>
                </label>
              );
            })}
            {excluded.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                {excluded.length} document{excluded.length === 1 ? "" : "s"} are not machine-readable and
                will be shown as excluded if selected.
              </p>
            ) : null}
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-[16rem] flex-1">
                <label className="mb-1 block text-xs text-muted-foreground">Package name</label>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>
              <Button onClick={() => void createPackage()} disabled={saving || selected.length === 0}>
                {saving ? "Creating…" : "Create review package"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 py-4">
            <h2 className="text-base font-semibold">Existing packages</h2>
            {(payload?.packages ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No review packages yet.</p>
            ) : (
              (payload?.packages ?? []).map((pkg) => (
                <Link
                  key={pkg.id}
                  href={`/review/projects/${params.projectId}/packages/${pkg.id}`}
                  className="block rounded-md border p-3 hover:bg-accent"
                >
                  <p className="font-medium">{pkg.name}</p>
                  <p className="text-xs text-muted-foreground">{pkg.status}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
