"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ProviderReport = {
  provider: string;
  status: string;
  availableCapabilities: string[];
  limitations: string[];
  transcriptSupport: boolean;
  botAvailable: boolean;
  joinEnabled: boolean;
};

function statusBadgeClass(status: string): string {
  if (status === "certified" || status === "certified_candidate") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "experimental" || status === "beta") {
    return "bg-amber-100 text-amber-800";
  }
  return "bg-slate-100 text-slate-600";
}

export default function MeetingsProvidersSettingsPage() {
  const [providers, setProviders] = useState<ProviderReport[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    fetch("/api/engineering/project-intelligence/meetings/providers")
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load providers");
        setProviders(payload.data ?? []);
      })
      .catch((reason) => setError(reason.message));
  }, []);

  if (error) return <p className="text-red-700" role="alert">{error}</p>;
  if (!providers.length) return <p role="status">Loading providers…</p>;

  return (
    <section data-testid="teams-providers-settings">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-cyan-700">Meetings settings</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Providers</h2>
          <p className="mt-2 text-slate-600">
            Provider status reflects certified capabilities. Zoom and Google Meet remain unavailable.
          </p>
        </div>
        <Link
          className="text-cyan-700 hover:underline text-sm"
          href="/engineering/apps/project-intelligence/meetings/health"
        >
          Meetings health
        </Link>
      </div>

      <ul className="mt-6 space-y-3">
        {providers.map((provider) => {
          const isTeams = provider.provider === "microsoft_teams";
          const isManual = provider.provider === "manual";
          const disabled = !isTeams && !isManual && provider.status === "unavailable";
          return (
            <li
              key={provider.provider}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 px-4 py-3"
              data-testid={`provider-row-${provider.provider}`}
            >
              <div>
                <p className="font-medium text-slate-900">
                  {provider.provider === "microsoft_teams"
                    ? "Microsoft Teams"
                    : provider.provider === "zoom"
                      ? "Zoom"
                      : provider.provider === "google_meet"
                        ? "Google Meet"
                        : "Manual"}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {provider.limitations.slice(0, 2).join(" · ") || "No limitations listed"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${statusBadgeClass(provider.status)}`}
                  data-testid={`provider-status-${provider.provider}`}
                >
                  {provider.status}
                </span>
                {isTeams ? (
                  <Link
                    className="text-sm text-cyan-700 hover:underline"
                    href="/engineering/apps/project-intelligence/meetings/settings/providers/microsoft-teams"
                    data-testid="teams-provider-settings-link"
                  >
                    Configure
                  </Link>
                ) : disabled ? (
                  <button
                    type="button"
                    disabled
                    className="cursor-not-allowed text-sm text-slate-400"
                    data-testid={`provider-unavailable-${provider.provider}`}
                  >
                    Unavailable
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
