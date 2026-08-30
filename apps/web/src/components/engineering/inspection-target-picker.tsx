"use client";

import { useEffect, useState } from "react";
import { hostedGet } from "@/lib/inspection-intelligence/hosted-client";

type Project = { id: string; project_code?: string; project_name?: string };
type Asset = {
  id: string;
  asset_tag?: string;
  asset_name?: string;
  engineering_project_id?: string;
};
type Location = {
  spatial_reference_id: string;
  name?: string;
  code?: string;
  reference_type?: string;
};

export type DraftTarget = {
  kind: "project" | "asset" | "location";
  canonicalId: string;
  label: string;
};

export function InspectionTargetPicker({
  value,
  onChange,
  disabled,
}: {
  value: DraftTarget[];
  onChange: (targets: DraftTarget[]) => void;
  disabled?: boolean;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/engineering/projects").then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load projects");
        return Array.isArray(payload.data) ? (payload.data as Project[]) : [];
      }),
      fetch("/api/engineering/assets").then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error?.message ?? "Unable to load assets");
        return Array.isArray(payload.data) ? (payload.data as Asset[]) : [];
      }),
      hostedGet<Location[]>("locations").catch(() => [] as Location[]),
    ])
      .then(([nextProjects, nextAssets, nextLocations]) => {
        if (cancelled) return;
        setProjects(nextProjects);
        setAssets(nextAssets);
        setLocations(nextLocations);
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to load targets");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function toggle(target: DraftTarget) {
    const exists = value.some((item) => item.kind === target.kind && item.canonicalId === target.canonicalId);
    onChange(exists ? value.filter((item) => !(item.kind === target.kind && item.canonicalId === target.canonicalId)) : [...value, target]);
  }

  if (error) {
    return <p className="text-sm text-red-700" role="alert">{error}</p>;
  }

  return (
    <div className="space-y-4" data-testid="inspection-target-picker">
      <fieldset disabled={disabled} className="space-y-2">
        <legend className="text-sm font-medium text-slate-800">Project</legend>
        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects available in this workspace.</p>
        ) : (
          projects.map((project) => {
            const label = `${project.project_code ?? ""} — ${project.project_name ?? ""}`.replace(/^ — /, "");
            const checked = value.some((item) => item.kind === "project" && item.canonicalId === project.id);
            return (
              <label key={project.id} className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle({ kind: "project", canonicalId: project.id, label })}
                />
                <span>{label || "Unnamed project"}</span>
              </label>
            );
          })
        )}
      </fieldset>
      <fieldset disabled={disabled} className="space-y-2">
        <legend className="text-sm font-medium text-slate-800">Asset</legend>
        {assets.length === 0 ? (
          <p className="text-sm text-slate-500">No assets available. Asset binding can stay unset.</p>
        ) : (
          assets.map((asset) => {
            const label = `${asset.asset_tag ?? ""} — ${asset.asset_name ?? ""}`.replace(/^ — /, "");
            const checked = value.some((item) => item.kind === "asset" && item.canonicalId === asset.id);
            return (
              <label key={asset.id} className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle({ kind: "asset", canonicalId: asset.id, label })}
                />
                <span>{label || "Unnamed asset"}</span>
              </label>
            );
          })
        )}
      </fieldset>
      <fieldset disabled={disabled} className="space-y-2">
        <legend className="text-sm font-medium text-slate-800">Location</legend>
        {locations.length === 0 ? (
          <p className="text-sm text-slate-500">No spatial locations published for this workspace.</p>
        ) : (
          locations.map((location) => {
            const label = location.name || location.code || location.reference_type || "Location";
            const checked = value.some(
              (item) => item.kind === "location" && item.canonicalId === location.spatial_reference_id,
            );
            return (
              <label key={location.spatial_reference_id} className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    toggle({
                      kind: "location",
                      canonicalId: location.spatial_reference_id,
                      label,
                    })
                  }
                />
                <span>{label}</span>
              </label>
            );
          })
        )}
      </fieldset>
    </div>
  );
}
