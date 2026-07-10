"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Button, Input } from "@rtb/ui";

export default function UploadEngineeringDocumentPage() {
  const router = useRouter();
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

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engineering/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          engineeringProjectId: form.engineeringProjectId || undefined,
          fileName: form.fileName || `${form.documentNumber}.pdf`,
          source: "upload",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to register document");
      router.push(`/engineering/documents/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  return (
      <>
        <Header
        title="Register Document"
        description="Document metadata capture shell — full ingestion comes later"
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Register Document"}
              </Button>
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
