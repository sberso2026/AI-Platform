"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { parseApiJsonResponse, asRecordArray } from "@/lib/api/parse-json-response";

type AssetOption = {
  id: string;
  label: string;
  projectId: string | null;
};

function assetLabel(row: Record<string, unknown>): string {
  const tag = String(row.asset_tag ?? "").trim();
  const name = String(row.asset_name ?? row.name ?? "").trim();
  if (tag && name && tag !== name) return `${tag} — ${name}`;
  return name || tag || "Asset";
}

export function TqAssetHybridInput({
  projectId,
  assetId,
  text,
  onChange,
}: {
  projectId?: string;
  assetId: string;
  text: string;
  onChange: (next: { assetId: string; text: string }) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(text);
  const [options, setOptions] = useState<AssetOption[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(text);
  }, [text]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query.trim().length >= 2) params.set("q", query.trim());
    else if (projectId) params.set("projectId", projectId);
    const href = `/api/engineering/assets${params.toString() ? `?${params}` : ""}`;
    fetch(href, { signal: controller.signal })
      .then((r) => parseApiJsonResponse(r))
      .then((parsed) => {
        if (!parsed.ok) return;
        const rows = asRecordArray(parsed.data).map((row) => ({
          id: String(row.id ?? ""),
          label: assetLabel(row),
          projectId: typeof row.engineering_project_id === "string" ? row.engineering_project_id : null,
        })).filter((row) => row.id);
        rows.sort((a, b) => {
          const aProject = projectId && a.projectId === projectId ? 0 : 1;
          const bProject = projectId && b.projectId === projectId ? 0 : 1;
          if (aProject !== bProject) return aProject - bProject;
          return a.label.localeCompare(b.label);
        });
        setOptions(rows.slice(0, 12));
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [query, projectId]);

  useEffect(() => {
    function onDocClick(event: MouseEvent) {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return options;
    return options.filter((item) => item.label.toLowerCase().includes(needle));
  }, [options, query]);

  return (
    <div ref={boxRef} className="relative" data-testid="tq-asset-hybrid">
      <label className="mb-1 block text-xs font-medium text-slate-600" htmlFor="tq-asset">
        Asset / Equipment
      </label>
      <div className="flex gap-1">
        <input
          id="tq-asset"
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={query}
          placeholder="V-101, Bund Floor, Firewater Line FW-101…"
          autoComplete="off"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            const next = e.target.value;
            setQuery(next);
            setOpen(true);
            onChange({ assetId: "", text: next });
          }}
        />
        {query || assetId ? (
          <button
            type="button"
            className="h-10 rounded-md border border-slate-200 px-2 text-xs text-slate-600"
            onClick={() => {
              setQuery("");
              onChange({ assetId: "", text: "" });
            }}
          >
            Clear
          </button>
        ) : null}
      </div>
      {open && filtered.length > 0 ? (
        <ul
          className="absolute z-30 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-slate-200 bg-white py-1 shadow-md"
          role="listbox"
        >
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`w-full px-3 py-1.5 text-left text-sm hover:bg-slate-50 ${item.id === assetId ? "bg-slate-100" : ""}`}
                onClick={() => {
                  setQuery(item.label);
                  setOpen(false);
                  onChange({ assetId: item.id, text: item.label });
                }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-1 text-xs text-slate-500">
        Type any equipment description, or choose a canonical asset. An Asset Register entry is not required.
      </p>
    </div>
  );
}
