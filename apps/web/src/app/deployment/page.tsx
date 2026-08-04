"use client";

import { useEffect, useState } from "react";

type StatusPayload = {
  ok?: boolean;
  webhook?: { path?: string; baseUrlConfigured?: boolean; graphMode?: string };
  environment?: {
    publicMissing?: string[];
    serverMissingNames?: string[];
    teamsMissingNames?: string[];
  };
  https?: { vercelEnv?: string | null };
  timestamp?: string;
};

type IdentityPayload = {
  ok?: boolean;
  commitSha?: string;
  branch?: string;
  deploymentId?: string | null;
};

/**
 * Public deployment diagnostics for Phase 6C-3E.0.
 * Shows presence-only status — never secret values.
 */
export default function DeploymentHealthPage() {
  const [status, setStatus] = useState<StatusPayload | null>(null);
  const [identity, setIdentity] = useState<IdentityPayload | null>(null);
  const [health, setHealth] = useState<{ status?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, i, h] = await Promise.all([
          fetch("/api/deployment/status").then((r) => r.json()),
          fetch("/api/platform/build-identity").then((r) => r.json()),
          fetch("/api/health").then((r) => r.json()),
        ]);
        if (cancelled) return;
        setStatus(s);
        setIdentity(i);
        setHealth(h);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load diagnostics");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main
      className="mx-auto max-w-3xl px-4 py-10 text-slate-900"
      data-testid="deployment-health-page"
    >
      <h1 className="text-2xl font-semibold tracking-tight">AI Platform Deployment Health</h1>
      <p className="mt-2 text-sm text-slate-600">
        Phase 6C-3E.0 production foundation diagnostics. Secret values are never shown.
      </p>

      {error ? (
        <p className="mt-6 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <section className="mt-8 space-y-4" aria-label="Deployment status">
        <div className="rounded border border-slate-200 p-4" data-testid="deployment-health-card">
          <h2 className="font-medium">Health</h2>
          <p className="mt-1 text-sm" data-testid="deployment-health-status">
            {health?.status ?? "loading…"}
          </p>
        </div>

        <div className="rounded border border-slate-200 p-4" data-testid="deployment-identity-card">
          <h2 className="font-medium">Build identity</h2>
          <dl className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">Commit</dt>
              <dd data-testid="deployment-commit-sha">{identity?.commitSha ?? "…"}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Branch</dt>
              <dd>{identity?.branch ?? "…"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-slate-500">Deployment ID</dt>
              <dd>{identity?.deploymentId ?? "—"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded border border-slate-200 p-4" data-testid="deployment-webhook-card">
          <h2 className="font-medium">Microsoft Graph webhook</h2>
          <p className="mt-1 text-sm" data-testid="deployment-webhook-path">
            Path: {status?.webhook?.path ?? "/api/webhooks/microsoft-graph"}
          </p>
          <p className="mt-1 text-sm">
            Base URL configured: {status?.webhook?.baseUrlConfigured ? "yes" : "no"}
          </p>
          <p className="mt-1 text-sm">Graph mode: {status?.webhook?.graphMode ?? "unset"}</p>
        </div>

        <div className="rounded border border-slate-200 p-4" data-testid="deployment-env-card">
          <h2 className="font-medium">Environment validation (names only)</h2>
          <p className="mt-1 text-sm">
            Public missing: {(status?.environment?.publicMissing ?? []).join(", ") || "none"}
          </p>
          <p className="mt-1 text-sm">
            Server missing: {(status?.environment?.serverMissingNames ?? []).join(", ") || "none"}
          </p>
          <p className="mt-1 text-sm">
            Teams missing: {(status?.environment?.teamsMissingNames ?? []).join(", ") || "none"}
          </p>
          <p className="mt-1 text-sm">Vercel env: {status?.https?.vercelEnv ?? "—"}</p>
          <p className="mt-1 text-xs text-slate-500">{status?.timestamp}</p>
        </div>
      </section>
    </main>
  );
}
