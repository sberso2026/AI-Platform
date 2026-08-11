"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { EmptyState, SectionHeader } from "@rtb/ui";
import { parseApiJsonResponse } from "@/lib/api/parse-json-response";
import { ENGINEERING_INTELLIGENCE_CATEGORIES } from "@/lib/engineering/experience-surfaces";
import { useExperiencePerf } from "@/hooks/use-experience-perf";

type ModuleRow = {
  applicationKey: string;
  allowed: boolean;
  name: string;
  href: string;
};

/**
 * Intelligence landing — composes entitled certified modules only.
 * Does not copy engines or duplicate dashboards.
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

  const entitledKeys = new Set(modules.map((m) => m.applicationKey));
  const visible = ENGINEERING_INTELLIGENCE_CATEGORIES.filter((c) =>
    entitledKeys.has(c.applicationKey),
  );

  return (
    <>
      <Header
        title="Intelligence"
        description="Entry point to installed engineering intelligence capabilities"
      />
      <main
        className="page-main flex-1 overflow-y-auto px-6 pb-8 pt-6 sm:px-8"
        data-testid="intelligence-landing"
        data-ownership="composition-only"
      >
        <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
          Certified engines remain owned by their modules. This surface only links entitled
          capabilities — no duplicate dashboards or ownership transfer.
        </p>

        {loading ? (
          <p className="text-sm text-muted-foreground" data-testid="intelligence-loading">
            Loading entitled intelligence…
          </p>
        ) : null}
        {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

        {!loading && visible.length === 0 ? (
          <EmptyState
            title="No intelligence modules available"
            description="Install or entitle Project, Asset, or Inspection Intelligence to see entries here."
          />
        ) : (
          <section data-testid="intelligence-categories">
            <SectionHeader title="Available intelligence" description="" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="rounded-md border border-slate-200 bg-white px-4 py-3 hover:border-slate-400"
                  data-testid={`intelligence-item-${item.id}`}
                >
                  <div className="text-sm font-medium text-slate-900">{item.label}</div>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                </Link>
              ))}
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
