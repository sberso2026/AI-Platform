"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type TeamsProviderHealth = {
  status?: string;
  transcriptMode?: string;
  botJoin?: string;
  recordingAccess?: string;
  availableCapabilities?: string[];
  limitations?: string[];
};

export default function MeetingsHealthPage() {
  const [health, setHealth] = useState<Record<string, unknown>>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch("/api/engineering/project-intelligence/meetings/health")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Health failed");
        setHealth(payload.data);
      })
      .catch((reason) => setError(reason.message));
  }, []);

  if (error) return <p className="text-red-700" role="alert">{error}</p>;
  if (!health) return <p role="status">Loading meetings health…</p>;

  const teams = (health.teamsProvider ?? {}) as TeamsProviderHealth;

  return (
    <section data-testid="project-intelligence-meetings-health">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="text-2xl font-semibold text-slate-900">Meetings health</h2>
        <Link
          className="text-sm text-cyan-700 hover:underline"
          href="/engineering/apps/project-intelligence/meetings/settings/providers"
        >
          Providers
        </Link>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        <li data-testid="health-schema">Schema: {String(health.schema)}</li>
        <li data-testid="health-rls">RLS: {String(health.rls)}</li>
        <li data-testid="health-access-guard">Access guard: {String(health.accessGuard)}</li>
        <li data-testid="health-manual-provider">Manual provider: {String(health.manualProvider)}</li>
        <li data-testid="health-transcript">Transcript: {String(health.transcriptPersistence)}</li>
        <li data-testid="health-events">Events: {String(health.events)}</li>
        <li data-testid="health-privacy">Privacy: {String(health.privacyConfiguration)}</li>
        <li data-testid="health-processing">Processing: {String(health.processing)}</li>
        <li data-testid="health-job-queue">Job queue: {String(health.jobQueue)}</li>
        <li data-testid="health-minutes-pages">Minutes pages: {String(health.minutesPages)}</li>
        <li data-testid="health-review-pages">Review pages: {String(health.reviewPages)}</li>
        <li data-testid="health-ai-extraction">AI extraction: {String(health.aiExtraction)}</li>
        <li data-testid="health-transcript-replay">Transcript replay: {String(health.transcriptReplay)}</li>
        <li data-testid="health-teams-status">
          Teams provider: {String(teams.status ?? "unavailable")}
        </li>
        <li data-testid="teams-transcript-mode">
          Teams transcript mode: {String(teams.transcriptMode ?? "unsupported")}
        </li>
        <li data-testid="teams-capability-matrix">
          Teams capabilities: {(teams.availableCapabilities ?? []).join(", ") || "none"}
        </li>
      </ul>
    </section>
  );
}
