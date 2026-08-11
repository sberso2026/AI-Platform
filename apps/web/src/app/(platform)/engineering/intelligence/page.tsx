"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { EmptyState, SectionHeader } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { listUserFacingCatalogConcepts } from "@rtb/engineering-os";
import { useExperiencePerf } from "@/hooks/use-experience-perf";

type ModuleRow = {
  applicationKey: string;
  allowed: boolean;
  name: string;
  href: string;
};

/**
 * Intelligence landing — entitled certified capability catalog (composition only).
 * User concepts, not internal engine architecture. No dead tiles.
 */
export default function IntelligenceLandingPage() {
  useExperiencePerf("intelligence");
  const [modules, setModules] = useState<ModuleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/engineering/modules/access")
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (cancelled) return;
        const rows =
          (
            parsed.data as {
              modules?: ModuleRow[];
            } | null
          )?.modules ?? [];
        setModules(rows.filter((m) => m.allowed));
        if (!parsed.ok) setError(parsed.errorMessage ?? "Could not load intelligence access");
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load Intelligence");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const entitledKeys = useMemo(
    () => modules.map((m) => m.applicationKey),
    [modules],
  );
  const concepts = useMemo(
    () => listUserFacingCatalogConcepts(entitledKeys),
    [entitledKeys],
  );

  return (
    <>
      <Header
        title="Intelligence"
        description="Certified engineering intelligence you are entitled to use"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="intelligence-landing"
        data-ownership="composition-only"
        data-phase="e9"
      >
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
          Engines stay owned by Project, Asset, Inspection, and Controls modules. This page only
          surfaces entitled capabilities — no duplicate ownership or dead tiles.
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground" data-testid="intelligence-loading">
            Loading entitled intelligence…
          </p>
        ) : null}
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

        {!loading && concepts.length === 0 ? (
          <EmptyState
            title="No intelligence capabilities available"
            description="Install or entitle Project, Asset, Inspection, or Project Controls intelligence to see entries here."
          />
        ) : (
          <section data-testid="intelligence-categories">
            <SectionHeader title="Available intelligence" description="" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {concepts.map((group) => {
                const primary = group.capabilities[0];
                if (!primary?.href) return null;
                return (
                  <Link
                    key={group.concept}
                    href={primary.href}
                    className="rounded-md border border-slate-200 bg-white px-4 py-3 hover:border-slate-400"
                    data-testid={`intelligence-item-${group.concept.toLowerCase()}`}
                  >
                    <div className="text-sm font-medium text-slate-900">{group.concept}</div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {group.capabilities.map((c) => c.name).join(" · ")}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <div className="mt-8 text-sm">
          <Link
            href="/engineering/modules"
            className="text-slate-700 underline-offset-2 hover:underline"
            data-testid="intelligence-modules-admin"
          >
            Module entitlement status
          </Link>
        </div>
      </main>
    </>
  );
}
