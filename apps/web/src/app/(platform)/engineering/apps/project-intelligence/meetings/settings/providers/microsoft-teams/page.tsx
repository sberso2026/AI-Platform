"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type TeamsProviderDetail = {
  provider: string;
  status: string;
  connectionStatus: string;
  consentStatus: string;
  capabilities: Record<string, string>;
  transcriptMode: string;
  graphMode: string;
  limitations: string[];
  botJoin: string;
  recordingAccess: string;
  connection: {
    id: string;
    providerTenantIdRedacted: string;
    status: string;
    consentStatus: string;
    authMode: string;
  } | null;
};

type HealthResult = {
  status: string;
  checks: Array<{ key: string; passed: boolean; detail?: string }>;
  latencyMs: number | null;
  errorCode: string | null;
  graphMode: string;
};

export default function MicrosoftTeamsProviderPage() {
  const [detail, setDetail] = useState<TeamsProviderDetail>();
  const [health, setHealth] = useState<HealthResult>();
  const [error, setError] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    const response = await fetch(
      "/api/engineering/project-intelligence/meetings/providers/microsoft-teams",
    );
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load Teams provider");
    setDetail(payload.data);
  }, []);

  useEffect(() => {
    reload().catch((reason) => setError(reason.message));
  }, [reload]);

  async function runAction(path: string, method: "POST" | "GET", success: string) {
    setBusy(true);
    setError(undefined);
    setMessage(undefined);
    try {
      const response = await fetch(path, { method });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Action failed");
      if (path.endsWith("/health") || path.endsWith("/test")) {
        setHealth(payload.data);
      }
      setMessage(success);
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      setBusy(false);
    }
  }

  if (error && !detail) return <p className="text-red-700" role="alert">{error}</p>;
  if (!detail) return <p role="status">Loading Microsoft Teams provider…</p>;

  const capabilities = detail.capabilities ?? {};

  return (
    <section data-testid="teams-provider-detail">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-700">
            <Link
              href="/engineering/apps/project-intelligence/meetings/settings/providers"
              className="hover:underline"
            >
              Providers
            </Link>
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Microsoft Teams</h2>
          <p className="mt-2 text-slate-600">
            Connection and capability status. Secrets are never shown in the browser.
          </p>
        </div>
      </div>

      <dl className="mt-6 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
        <div>
          <dt className="text-slate-500">Provider status</dt>
          <dd data-testid="teams-connection-status">{detail.status}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Connection</dt>
          <dd>{detail.connectionStatus}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Consent</dt>
          <dd>{detail.consentStatus}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Tenant identity</dt>
          <dd>{detail.connection?.providerTenantIdRedacted ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Graph mode</dt>
          <dd>{detail.graphMode}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Transcript mode</dt>
          <dd data-testid="teams-transcript-mode">{detail.transcriptMode}</dd>
        </div>
        <div>
          <dt className="text-slate-500">Auth mode</dt>
          <dd>{detail.connection?.authMode ?? "—"}</dd>
        </div>
      </dl>

      <h3 className="mt-8 font-semibold text-slate-900">Capabilities</h3>
      <ul
        className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2"
        data-testid="teams-capability-matrix"
      >
        {Object.entries(capabilities).map(([name, status]) => (
          <li key={name} className="flex justify-between gap-3 rounded border border-slate-100 px-3 py-2">
            <span>{name}</span>
            <span className="text-slate-500">{status}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex flex-wrap gap-3 text-sm">
        <span
          className="rounded border border-slate-200 px-3 py-1 text-slate-400"
          data-testid="teams-bot-join-disabled"
          aria-disabled="true"
        >
          Bot join: {detail.botJoin} (disabled)
        </span>
        <span
          className="rounded border border-slate-200 px-3 py-1 text-slate-400"
          data-testid="teams-recording-disabled"
          aria-disabled="true"
        >
          Recording: {detail.recordingAccess} (disabled)
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white disabled:opacity-50"
          data-testid="teams-configure"
          onClick={() =>
            runAction(
              "/api/engineering/project-intelligence/meetings/providers/microsoft-teams/configure",
              "POST",
              "Configured",
            )
          }
        >
          Configure
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          data-testid="teams-test"
          onClick={() =>
            runAction(
              "/api/engineering/project-intelligence/meetings/providers/microsoft-teams/test",
              "POST",
              "Health test complete",
            )
          }
        >
          Test
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded border px-3 py-1.5 text-sm disabled:opacity-50"
          data-testid="teams-health"
          onClick={() =>
            runAction(
              "/api/engineering/project-intelligence/meetings/providers/microsoft-teams/health",
              "GET",
              "Health refreshed",
            )
          }
        >
          Health
        </button>
        <button
          type="button"
          disabled={busy}
          className="rounded border border-red-300 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
          data-testid="teams-revoke"
          onClick={() =>
            runAction(
              "/api/engineering/project-intelligence/meetings/providers/microsoft-teams/revoke",
              "POST",
              "Revoked",
            )
          }
        >
          Revoke
        </button>
      </div>

      {message && <p className="mt-3 text-green-700">{message}</p>}
      {error && (
        <p className="mt-3 text-red-700" role="alert">
          {error}
        </p>
      )}

      {health && (
        <div className="mt-6 rounded border border-slate-200 p-4 text-sm">
          <p className="font-medium">
            Health: {health.status}
            {health.latencyMs != null ? ` · ${health.latencyMs}ms` : ""}
            {health.errorCode ? ` · ${health.errorCode}` : ""}
          </p>
          <ul className="mt-2 space-y-1 text-slate-600">
            {health.checks.map((check) => (
              <li key={check.key}>
                {check.passed ? "✓" : "✗"} {check.key}
                {check.detail ? `: ${check.detail}` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-6 text-sm text-slate-500">
        Limitations: {detail.limitations.join("; ") || "None listed"}
      </p>
    </section>
  );
}
