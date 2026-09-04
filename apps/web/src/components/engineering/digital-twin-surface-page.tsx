"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AskEngineeringAI,
  EmptyOperationalState,
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { asList, asRecord, pickString, readOperationalJson } from "@/lib/engineering/module-ops";

type TwinIdentity = Record<string, unknown>;
type SurfaceBlock = { surface?: string; present?: boolean; data?: unknown; error?: string };

export function DigitalTwinSurfacePage({
  title,
  purpose,
  testId,
  emptyTitle,
  emptyDescription,
  surfaceKey,
}: {
  title: string;
  purpose: string;
  testId: string;
  emptyTitle: string;
  emptyDescription: string;
  surfaceKey: string;
}) {
  return (
    <Suspense fallback={<OperationalSkeleton />}>
      <DigitalTwinSurfacePageInner
        title={title}
        purpose={purpose}
        testId={testId}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        surfaceKey={surfaceKey}
      />
    </Suspense>
  );
}

function DigitalTwinSurfacePageInner({
  title,
  purpose,
  testId,
  emptyTitle,
  emptyDescription,
  surfaceKey,
}: {
  title: string;
  purpose: string;
  testId: string;
  emptyTitle: string;
  emptyDescription: string;
  surfaceKey: string;
}) {
  const searchParams = useSearchParams();
  const requestedTwin = searchParams.get("twinId");
  const [twins, setTwins] = useState<TwinIdentity[]>([]);
  const [block, setBlock] = useState<SurfaceBlock | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    readOperationalJson<{ identities?: { data?: TwinIdentity[] } }>("/api/engineering/digital-twin/workspace-snapshot")
      .then(async (snap) => {
        if (!snap.ok) {
          setError(snap.error ?? "load_failed");
          setTwins([]);
          setLoading(false);
          return;
        }
        const list = asList(snap.data?.identities?.data ?? snap.data?.identities);
        setTwins(list as TwinIdentity[]);
        const twinId =
          requestedTwin ??
          pickString(asRecord(list[0]), ["twinId", "id", "twin_id"], "");
        if (!twinId) {
          setBlock(null);
          setLoading(false);
          return;
        }
        const detail = await readOperationalJson<{
          surfaces?: Record<string, SurfaceBlock>;
        }>(`/api/engineering/digital-twin/twin-snapshot?twinId=${encodeURIComponent(twinId)}`);
        if (!detail.ok) {
          setError(detail.error ?? "load_failed");
          setBlock(null);
          setLoading(false);
          return;
        }
        setBlock(detail.data?.surfaces?.[surfaceKey] ?? null);
        setLoading(false);
      });
  }, [requestedTwin, surfaceKey]);

  useEffect(() => {
    load();
  }, [load]);

  const present = Boolean(block?.present);

  return (
    <section data-testid={testId} aria-labelledby={`${testId}-title`}>
      <h1 id={`${testId}-title`} className="text-2xl font-semibold text-slate-900">
        {title}
      </h1>
      <OperationalPageIntro
        purpose={purpose}
        primaryAction={
          <Link
            href="/engineering/apps/digital-twin/twins"
            className="inline-flex min-h-11 items-center rounded-md border border-slate-200 px-3 text-sm hover:border-slate-400"
          >
            Browse twins
          </Link>
        }
      />
      <AskEngineeringAI q={`Summarize twin ${title.toLowerCase()} from recorded evidence.`} />
      {loading ? <div className="mt-6"><OperationalSkeleton /></div> : null}
      {error ? (
        <div className="mt-6">
          <OperationalError message={error} onRetry={load} />
        </div>
      ) : null}
      {!loading && twins.length === 0 ? (
        <div className="mt-6">
          <EmptyOperationalState
            title="No digital twin has been linked to this asset."
            description="Twin identity is recorded when a twin is registered against a canonical asset or project. This workspace has none yet."
            testId={`${testId}-empty`}
          />
        </div>
      ) : null}
      {!loading && twins.length > 0 && !present ? (
        <div className="mt-6">
          <EmptyOperationalState title={emptyTitle} description={emptyDescription} testId={`${testId}-surface-empty`} />
        </div>
      ) : null}
      {!loading && present ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-800">
            {Array.isArray(block?.data)
              ? `${(block?.data as unknown[]).length} recorded item${(block?.data as unknown[]).length === 1 ? "" : "s"}`
              : "Recorded data available"}
          </p>
        </div>
      ) : null}
    </section>
  );
}
