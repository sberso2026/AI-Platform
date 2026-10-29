"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  AskEngineeringAI,
  EmptyOperationalState,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";
import { asList, asRecord, pickHumanString, pickString, truthfulModelStatus } from "@/lib/engineering/module-ops";
import { humanSource, useEmiWorkspaceSnapshot } from "@/components/engineering/emi-snapshot-page";

export default function EngineeringModelDetailPage() {
  const params = useParams<{ modelId: string }>();
  const modelId = params.modelId;
  const { surfaces, error, loading, load } = useEmiWorkspaceSnapshot();

  const model = asList(surfaces?.models?.data)
    .map(asRecord)
    .find((rec) => pickString(rec, ["modelRefId", "id", "modelId"]) === modelId);
  const versions = asList(surfaces?.versions?.data)
    .map(asRecord)
    .filter((rec) => pickString(rec, ["modelRefId", "model_ref_id"]) === modelId);
  const elements = asList(surfaces?.elements?.data)
    .map(asRecord)
    .filter((rec) => pickString(rec, ["modelRefId", "model_ref_id"]) === modelId);
  const results = asList(surfaces?.results?.data)
    .map(asRecord)
    .filter((rec) => pickString(rec, ["modelRefId", "model_ref_id"]) === modelId);
  const mappings = asList(surfaces?.mappings?.data)
    .map(asRecord)
    .filter((rec) => pickString(rec, ["modelRefId", "model_ref_id"]) === modelId);

  return (
    <section data-testid="emi-model-detail" aria-labelledby="emi-model-detail-title">
      <p className="text-sm">
        <Link href="/engineering/apps/model-interoperability/models" className="underline-offset-2 hover:underline">
          ← Models
        </Link>
      </p>
      <h1 id="emi-model-detail-title" className="mt-2 text-2xl font-semibold text-slate-900">
        {model ? pickHumanString(model, ["displayName", "name", "externalModelId"], "Engineering model") : "Model"}
      </h1>
      <AskEngineeringAI q="Summarize this engineering model from recorded federation evidence." />
      {loading ? <div className="mt-6"><OperationalSkeleton /></div> : null}
      {error ? (
        <div className="mt-6">
          <OperationalError message={error} onRetry={load} />
        </div>
      ) : null}
      {!loading && !model ? (
        <div className="mt-6">
          <EmptyOperationalState
            title="No engineering model is registered for this project."
            description="This identifier is not in the hosted model register."
          />
        </div>
      ) : null}
      {model ? (
        <dl className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 text-sm sm:grid-cols-2">
          <Detail term="Type" value={pickString(model, ["formatFamily", "schemaHint"])} />
          <Detail term="Source" value={humanSource(pickString(model, ["providerKey", "formatFamily"]))} />
          <Detail term="Status" value={truthfulModelStatus(model)} />
          <Detail term="Project" value={pickHumanString(model, ["projectCode", "project_code", "projectName", "project_name"])} />
          <Detail term="Asset" value={pickHumanString(model, ["assetTag", "asset_tag", "assetName", "asset_name"])} />
          <Detail term="Related twin" value={pickHumanString(model, ["twinName", "twinLabel"])} />
          <Detail term="Last update" value={pickString(model, ["updatedAt"])} />
          <Detail term="Result state" value={results.length > 0 ? "Results available" : "Execution unavailable"} />
        </dl>
      ) : null}
      <ul className="mt-6 space-y-3">
        <CountCard label="Versions" count={versions.length} href="/engineering/apps/model-interoperability/versions" />
        <CountCard label="Elements" count={elements.length} href="/engineering/apps/model-interoperability/elements" />
        <CountCard label="Mappings" count={mappings.length} href="/engineering/apps/model-interoperability/mappings" />
        <CountCard label="Results" count={results.length} href="/engineering/apps/model-interoperability/results" />
      </ul>
    </section>
  );
}

function Detail({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-500">{term}</dt>
      <dd className="text-slate-800">{value === "—" ? "Not recorded" : value}</dd>
    </div>
  );
}

function CountCard({ label, count, href }: { label: string; count: number; href: string }) {
  return (
    <li className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-1 text-sm text-slate-600">{count > 0 ? `${count} recorded` : "None recorded"}</p>
      <Link href={href} className="mt-2 inline-flex min-h-11 items-center text-sm font-medium underline">
        Open
      </Link>
    </li>
  );
}
