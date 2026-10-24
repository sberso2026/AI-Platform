"use client";

import Link from "next/link";
import {
  EmptyOperationalState,
  OperationalError,
  OperationalPageIntro,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { asList, asRecord, pickString } from "@/lib/engineering/module-ops";
import { humanSource, useEmiWorkspaceSnapshot } from "@/components/engineering/emi-snapshot-page";

export default function EngineeringModelFederationPage() {
  const { surfaces, error, loading, load } = useEmiWorkspaceSnapshot();
  const models = asList(surfaces?.models?.data).map(asRecord);

  const groups = [
    { name: "IFC", match: (s: string) => s.toLowerCase().includes("ifc") },
    { name: "SPACE GASS", match: (s: string) => s.toLowerCase().includes("space") },
    { name: "ETABS", match: (s: string) => s.toLowerCase().includes("etabs") },
  ];

  return (
    <section data-testid="emi-federation-page" aria-labelledby="emi-federation-title">
      <h1 id="emi-federation-title" className="text-2xl font-semibold text-slate-900">
        Interoperability
      </h1>
      <OperationalPageIntro purpose="Federated models by source. Live solver execution is not available from this workspace." />
      {loading ? <OperationalSkeleton /> : null}
      {error ? <OperationalError message={error} onRetry={load} /> : null}
      {!loading && models.length === 0 ? (
        <EmptyOperationalState
          title="No engineering model is registered for this project."
          description="IFC, SPACE GASS, and ETABS federation records appear here after import."
          testId="emi-interop-empty"
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {groups.map((group) => {
            const count = models.filter((rec) =>
              group.match(humanSource(pickString(rec, ["providerKey", "formatFamily"]))),
            ).length;
            return (
              <div key={group.name} className="rounded-lg border border-slate-200 bg-white p-4">
                <h2 className="text-sm font-semibold">{group.name}</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {count > 0 ? `${count} federated model${count === 1 ? "" : "s"}` : "No federated models yet"}
                </p>
                <p className="mt-2 text-xs text-slate-500">Execution unavailable — imported and federated records only.</p>
              </div>
            );
          })}
        </div>
      )}
      <p className="mt-6 text-sm">
        <Link href="/engineering/apps/model-interoperability/release" className="font-medium underline">
          Provider and execution certification
        </Link>
        <span className="text-slate-500"> is under Administration.</span>
      </p>
    </section>
  );
}
