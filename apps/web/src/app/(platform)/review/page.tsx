"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Card, CardContent, EmptyState } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { REVIEW_DISCLAIMER } from "@/lib/review/labels";

type ProjectRow = {
  id: string;
  code?: string;
  name: string;
};

export default function ReviewHomePage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const response = await fetch("/api/review/projects");
      const parsed = await parseApiJsonResponse<{ id: string; code?: string; name: string }[]>(response);
      if (cancelled) return;
      if (!parsed.ok || !parsed.data) {
        setError(parsed.errorMessage ?? "Unable to load authorized projects");
        setLoaded(true);
        return;
      }
      setProjects(parsed.data);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Header title="Engineering Review" description="Select an authorized project" showEngineeringChrome={false} />
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        <p className="text-sm text-muted-foreground">{REVIEW_DISCLAIMER}</p>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {!loaded ? <p className="text-sm text-muted-foreground">Loading projects…</p> : null}
        {loaded && projects.length === 0 && !error ? (
          <EmptyState
            title="No authorized projects"
            description="You can only review projects in your current workspace."
          />
        ) : null}
        <div className="space-y-3">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardContent className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">{project.code ? `${project.code} — ${project.name}` : project.name}</p>
                </div>
                <Link
                  href={`/review/projects/${project.id}`}
                  className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
                >
                  Open
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
