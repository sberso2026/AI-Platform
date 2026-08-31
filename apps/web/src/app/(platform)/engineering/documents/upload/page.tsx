"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Button, Input } from "@rtb/ui";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

export default function UploadEngineeringDocumentPage() {
  const router = useRouter();
  const { canMutate } = useEngineeringWriteAccess();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    documentNumber: "",
    title: "",
    documentType: "drawing",
    revision: "A",
    engineeringProjectId: "",
    fileName: "",
  });
  const [file, setFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canMutate) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engineering/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          engineeringProjectId: form.engineeringProjectId || undefined,
          fileName: form.fileName || file?.name || `${form.documentNumber}.pdf`,
          source: "upload",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? json.error?.message ?? "Failed to register document");
      const id = json.data?.id as string;
      if (file && id) {
        const body = new FormData();
        body.set("file", file);
        const attach = await fetch(`/api/engineering/documents/${id}/file`, {
          method: "POST",
          body,
        });
        if (!attach.ok) {
          const parsed = await attach.json().catch(() => ({}));
          throw new Error(parsed.error?.message ?? parsed.error ?? "Document registered, but file attach failed");
        }
      }
      router.push(`/engineering/documents/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  return (
      <>
        <Header
        title="Register Document"
        description="Register metadata, then optionally attach the source file to canonical storage"
      />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Document Number" value={form.documentNumber} onChange={(v) => setForm({ ...form, documentNumber: v })} required />
              <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} required />
              <Field label="Document Type" value={form.documentType} onChange={(v) => setForm({ ...form, documentType: v })} />
              <Field label="Revision" value={form.revision} onChange={(v) => setForm({ ...form, revision: v })} />
              <Field label="Project ID (optional)" value={form.engineeringProjectId} onChange={(v) => setForm({ ...form, engineeringProjectId: v })} />
              <Field label="File Name" value={form.fileName} onChange={(v) => setForm({ ...form, fileName: v })} />
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Source file (optional)</label>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="block w-full text-sm"
                  disabled={!canMutate || loading}
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading || !canMutate}>
                {loading ? "Saving..." : "Register Document"}
              </Button>
              {!canMutate ? (
                <p className="text-sm text-muted-foreground">Read-only — document registration is disabled.</p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </main>
      </>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{label}</label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}
