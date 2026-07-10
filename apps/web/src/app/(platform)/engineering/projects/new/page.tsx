"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, Button, Input } from "@rtb/ui";

export default function NewEngineeringProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    projectCode: "",
    projectName: "",
    clientName: "",
    siteName: "",
    location: "",
    industry: "",
    projectType: "",
    projectPhase: "concept",
    status: "draft",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/engineering/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to create project");
      router.push(`/engineering/projects/${json.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setLoading(false);
    }
  }

  return (
      <>
        <Header title="New Engineering Project" description="Create an engineering project record" />
              <main className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8" data-testid="page-main">
        <Card className="max-w-2xl">
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-4">
              <Field
                label="Project Code"
                value={form.projectCode}
                onChange={(v) => setForm({ ...form, projectCode: v })}
                required
              />
              <Field
                label="Project Name"
                value={form.projectName}
                onChange={(v) => setForm({ ...form, projectName: v })}
                required
              />
              <Field
                label="Client"
                value={form.clientName}
                onChange={(v) => setForm({ ...form, clientName: v })}
              />
              <Field
                label="Site"
                value={form.siteName}
                onChange={(v) => setForm({ ...form, siteName: v })}
              />
              <Field
                label="Location"
                value={form.location}
                onChange={(v) => setForm({ ...form, location: v })}
              />
              <Field
                label="Industry"
                value={form.industry}
                onChange={(v) => setForm({ ...form, industry: v })}
              />
              <Field
                label="Project Type"
                value={form.projectType}
                onChange={(v) => setForm({ ...form, projectType: v })}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Project"}
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
      <label className="mb-1 block text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
