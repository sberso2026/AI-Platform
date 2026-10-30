"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button, Input } from "@rtb/ui";
import {
  EmptyOperationalState,
  OperationalError,
} from "@/components/engineering/operational";
import type { Eos3CanonicalObject, Eos3ObjectType } from "@/lib/engineering/eos3-canonical-objects";
import {
  engineerFacingGovernedLabel,
  proposedConfirmedEmptyCopy,
  workspaceHref,
} from "@/lib/engineering/project-workspace-ia";
import { useEngineeringWriteAccess } from "@/hooks/use-engineering-write-access";

export function ObjectRegisterPanel({
  projectId,
  objectType,
  title,
  emptyTitle,
  emptyDescription,
  objects,
  onCreate,
  onError,
  bridgeHref,
  extraColumns,
}: {
  projectId: string;
  objectType: Eos3ObjectType;
  title: string;
  emptyTitle: string;
  emptyDescription: string;
  objects: Eos3CanonicalObject[];
  onCreate: (input: {
    stableObjectId: string;
    displayName: string;
    payload: Record<string, unknown>;
  }) => Promise<void>;
  onError?: (message: string) => void;
  bridgeHref?: string;
  extraColumns?: Array<{ key: string; label: string }>;
}) {
  const { canMutate } = useEngineeringWriteAccess();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [stableId, setStableId] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return objects;
    return objects.filter(
      (o) =>
        o.stableObjectId.toLowerCase().includes(q) ||
        o.displayName.toLowerCase().includes(q) ||
        o.lifecycleState.toLowerCase().includes(q),
    );
  }, [objects, query]);

  const proposedCount = objects.filter((o) =>
    String(o.governedState).toUpperCase().includes("PROPOS"),
  ).length;
  const confirmedCount = objects.length - proposedCount;
  const reconciledEmpty = proposedConfirmedEmptyCopy(
    `${objectType.toLowerCase()}s`,
    confirmedCount,
    proposedCount,
  );
  const showEmpty = filtered.length === 0;
  const emptyTitleResolved =
    objects.length > 0 && filtered.length === 0
      ? emptyTitle
      : objects.length === 0
        ? reconciledEmpty.title
        : emptyTitle;
  const emptyDescriptionResolved =
    objects.length === 0 ? reconciledEmpty.description : emptyDescription;

  return (
    <section data-testid={`register-${objectType}`} aria-labelledby={`heading-${objectType}`}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id={`heading-${objectType}`} className="text-lg font-semibold text-slate-900">
            {title}
          </h2>
          <p className="text-xs text-slate-500">
            Project-scoped · human authority for governed writes
            {proposedCount > 0
              ? ` · ${proposedCount} proposed awaiting review · ${confirmedCount} confirmed`
              : null}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {bridgeHref ? (
            <Link
              href={bridgeHref}
              className="inline-flex min-h-11 items-center rounded-md border border-slate-600 px-3 text-sm text-slate-200 hover:bg-slate-800"
            >
              Open legacy register
            </Link>
          ) : null}
          {canMutate ? (
            <Button type="button" size="sm" onClick={() => setOpen(true)}>
              Create {objectType}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mb-3">
        <label className="sr-only" htmlFor={`filter-${objectType}`}>
          Filter {title}
        </label>
        <Input
          id={`filter-${objectType}`}
          placeholder="Filter by ID, title, status…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {localError ? <OperationalError message={localError} /> : null}

      {open && canMutate ? (
        <form
          className="mb-4 grid gap-2 rounded-lg border border-slate-700 bg-slate-900/60 p-4 md:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            setLocalError(null);
            try {
              await onCreate({
                stableObjectId: stableId,
                displayName: name,
                payload: defaultPayload(objectType),
              });
              setOpen(false);
              setStableId("");
              setName("");
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : "Create failed";
              setLocalError(msg);
              onError?.(msg);
            } finally {
              setSaving(false);
            }
          }}
        >
          <label className="text-xs text-slate-400">
            Stable ID
            <Input
              className="mt-1"
              required
              value={stableId}
              onChange={(e) => setStableId(e.target.value)}
              placeholder={`${objectType.slice(0, 3).toUpperCase()}-001`}
            />
          </label>
          <label className="text-xs text-slate-400">
            Title
            <Input
              className="mt-1"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="flex gap-2 md:col-span-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Creating…" : "Create"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {showEmpty ? (
        <EmptyOperationalState
          title={emptyTitleResolved}
          description={emptyDescriptionResolved}
        />
      ) : (
        <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm" role="table">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th scope="col" className="px-3 py-2">
                  ID
                </th>
                <th scope="col" className="px-3 py-2">
                  Title
                </th>
                <th scope="col" className="px-3 py-2">
                  Status
                </th>
                <th scope="col" className="px-3 py-2">
                  State
                </th>
                {extraColumns?.map((c) => (
                  <th key={c.key} scope="col" className="px-3 py-2">
                    {c.label}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2">
                  Related
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((obj) => {
                const gov = engineerFacingGovernedLabel(String(obj.governedState));
                const showWhy =
                  String(obj.governedState).toUpperCase().includes("PROPOS") ||
                  Boolean(obj.payload?.lowConfidence) ||
                  Boolean(obj.payload?.material);
                return (
                  <tr key={obj.id} className="border-t border-slate-100 text-slate-800">
                    <td className="px-3 py-2 font-mono text-xs">{obj.stableObjectId}</td>
                    <td className="px-3 py-2">
                      {obj.displayName}
                      {showWhy ? (
                        <details className="mt-0.5 text-[11px] text-slate-500" data-testid="explainability-why">
                          <summary className="cursor-pointer select-none">Why?</summary>
                          <p className="mt-1 max-w-md">
                            {String(
                              obj.payload?.rationale ??
                                obj.payload?.whySuggested ??
                                "EOS proposed this from project context for human review.",
                            )}
                          </p>
                        </details>
                      ) : null}
                    </td>
                    <td className="px-3 py-2">{obj.lifecycleState}</td>
                    <td className="px-3 py-2">
                      <span
                        className="rounded border border-slate-300 px-1.5 py-0.5 text-[11px]"
                        data-testid="governed-label-friendly"
                        title="Engineer-facing state (e.g. Needs confirmation); Details shows policy"
                      >
                        {gov.label}
                      </span>
                      <details className="mt-0.5 text-[11px] text-slate-500" data-testid="governed-details">
                        <summary className="cursor-pointer select-none">Details</summary>
                        <p className="mt-1 font-mono">{gov.detail}</p>
                      </details>
                    </td>
                    {extraColumns?.map((c) => (
                      <td key={c.key} className="px-3 py-2 text-xs text-slate-600">
                        {String(obj.payload?.[c.key] ?? "—")}
                      </td>
                    ))}
                    <td className="px-3 py-2">
                      <Link
                        href={`${workspaceHref(projectId, "dependencies")}?objectId=${obj.id}`}
                        className="text-xs underline-offset-2 hover:underline"
                      >
                        View dependencies
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function defaultPayload(objectType: Eos3ObjectType): Record<string, unknown> {
  switch (objectType) {
    case "Calculation":
      return { qualificationStatus: "QUALIFIED_BOUNDED", stale: false };
    case "Decision":
      return { humanAuthority: true, aiIsAuthority: false };
    case "Review":
      return { aiMayApprove: false, status: "open" };
    case "OptimizationRun":
      return { qualification: "NOT_QUALIFIED", externalSolverQualified: false };
    case "Assumption":
      return { status: "open", equipmentMass: "12 t" };
    default:
      return { status: "draft" };
  }
}
