"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Button, Input } from "@rtb/ui";

export default function NewEngineeringAssetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    assetTag: "",
    assetName: "",
    engineeringProjectId: "",
    location: "",
    system: "",
    subsystem: "",
    criticality: "medium",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engineering/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          engineeringProjectId: form.engineeringProjectId || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create asset");
      router.push(`/engineering/assets/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  return (
      <>
        <Header title="New Engineering Asset" description="Register an engineering asset" />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Asset Tag" value={form.assetTag} onChange={(v) => setForm({ ...form, assetTag: v })} required />
              <Field label="Asset Name" value={form.assetName} onChange={(v) => setForm({ ...form, assetName: v })} required />
              <Field label="Project ID (optional)" value={form.engineeringProjectId} onChange={(v) => setForm({ ...form, engineeringProjectId: v })} />
              <Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
              <Field label="System" value={form.system} onChange={(v) => setForm({ ...form, system: v })} />
              <Field label="Subsystem" value={form.subsystem} onChange={(v) => setForm({ ...form, subsystem: v })} />
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Criticality</label>
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                  value={form.criticality}
                  onChange={(e) => setForm({ ...form, criticality: e.target.value })}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                  <option value="critical">critical</option>
                </select>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Asset"}
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
