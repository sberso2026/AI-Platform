"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EmptyOperationalState,
  OperationalError,
  OperationalSkeleton,
} from "@/components/engineering/operational";

type UiContract = {
  projectId: string;
  workPackage: { stableId: string; title: string; maturity: string | null };
  facility: string | null;
  area: string | null;
  system: string | null;
  primaryAsset: string | null;
  relatedAssets: string[];
};

type ContextNode = {
  stableAssetId: string;
  displayName: string;
  contextKind: string;
  configurationState: string;
  tag: string | null;
};

export function AssetsSystemsPanel({ projectId }: { projectId: string }) {
  const [nodes, setNodes] = useState<ContextNode[]>([]);
  const [contract, setContract] = useState<UiContract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [listRes, uiRes] = await Promise.all([
        fetch(
          `/api/engineering/projects/${encodeURIComponent(projectId)}/assets-systems?view=list&seedPilot=1`,
          { credentials: "include" },
        ),
        fetch(
          `/api/engineering/projects/${encodeURIComponent(projectId)}/assets-systems?view=ui-contract&workPackageId=WP-STR-004&seedPilot=1`,
          { credentials: "include" },
        ),
      ]);
      if (!listRes.ok) throw new Error(`Failed to load assets & systems (${listRes.status})`);
      const listJson = (await listRes.json()) as { data: ContextNode[] };
      setNodes(listJson.data ?? []);
      if (uiRes.ok) {
        const uiJson = (await uiRes.json()) as { data: UiContract };
        setContract(uiJson.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading && nodes.length === 0) {
    return <OperationalSkeleton label="Loading assets & systems…" />;
  }
  if (error && nodes.length === 0) {
    return (
      <OperationalError
        message={error}
        retryHref={`/engineering/projects/${projectId}/assets`}
      />
    );
  }

  return (
    <div className="space-y-6" data-testid="assets-systems-panel">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Assets & Systems</h2>
        <p className="mt-1 text-sm text-slate-400">
          Plant, area, system, and equipment context. Location, functional, and physical structures
          may overlap — they are not one forced hierarchy.
        </p>
      </div>

      {contract ? (
        <div
          className="rounded-lg border border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300 space-y-1"
          data-testid="assets-systems-ui-contract"
        >
          <p>
            <span className="text-slate-500">Project:</span> {contract.projectId}
          </p>
          <p>
            <span className="text-slate-500">Work Package:</span>{" "}
            {contract.workPackage.stableId} {contract.workPackage.title}
            {contract.workPackage.maturity ? ` (${contract.workPackage.maturity})` : ""}
          </p>
          <p>
            <span className="text-slate-500">Facility:</span> {contract.facility ?? "—"}
          </p>
          <p>
            <span className="text-slate-500">Area:</span> {contract.area ?? "—"}
          </p>
          <p>
            <span className="text-slate-500">System:</span> {contract.system ?? "—"}
          </p>
          <p>
            <span className="text-slate-500">Primary Asset:</span> {contract.primaryAsset ?? "—"}
          </p>
          <p>
            <span className="text-slate-500">Related Assets:</span>{" "}
            {contract.relatedAssets.length ? contract.relatedAssets.join("; ") : "—"}
          </p>
        </div>
      ) : null}

      {nodes.length === 0 ? (
        <EmptyOperationalState
          title="No assets linked"
          description="Map plant, systems, and equipment for work package context."
        />
      ) : (
        <ul className="space-y-2" data-testid="assets-systems-list">
          {nodes.map((n) => (
            <li
              key={n.stableAssetId}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
            >
              <span className="font-medium">
                {n.tag ? `${n.tag} · ` : ""}
                {n.displayName}
              </span>
              <span className="mt-1 block text-xs text-slate-400">
                {n.stableAssetId} · {n.contextKind} · {n.configurationState}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
