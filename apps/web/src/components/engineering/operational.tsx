"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Card, CardContent, EmptyState, StatusChip, cn } from "@rtb/ui";
import { AskThisObjectLink } from "@/components/engineering/ask-this-object-link";
import { ModuleSectionNav, type ModuleNavLink } from "@/components/engineering/module-section-nav";

export type OperationalRow = Record<string, unknown>;

export function recordLabel(row: OperationalRow, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  const id = row.id;
  return typeof id === "string" && id.trim() ? id : "Record";
}

export function recordHref(base: string, row: OperationalRow): string {
  const id = row.id;
  if (typeof id === "string" && id.trim()) return `${base.replace(/\/$/, "")}/${id}`;
  return base;
}

export function OperationalPageIntro({
  title,
  purpose,
  primaryAction,
  testId,
}: {
  title?: string;
  purpose: string;
  primaryAction?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      data-testid={testId}
    >
      <div className="min-w-0">
        {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
        <p className={cn("max-w-2xl text-sm text-slate-600", title && "mt-1")}>{purpose}</p>
      </div>
      {primaryAction ? <div className="shrink-0">{primaryAction}</div> : null}
    </div>
  );
}

export function OperationalMetricCard({
  label,
  value,
  href,
  tone = "neutral",
  testId,
}: {
  label: string;
  value: string | number;
  href: string;
  tone?: "neutral" | "attention" | "critical" | "ok";
  testId?: string;
}) {
  const ring =
    tone === "critical"
      ? "border-red-200 hover:border-red-300"
      : tone === "attention"
        ? "border-amber-200 hover:border-amber-300"
        : tone === "ok"
          ? "border-emerald-200 hover:border-emerald-300"
          : "border-slate-200 hover:border-slate-300";
  return (
    <Link href={href} className="block focus-visible:outline-none" data-testid={testId}>
      <Card className={cn("h-full transition-colors", ring)}>
        <CardContent className="p-4">
          <p className="text-[0.75rem] font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function AttentionSummary({
  items,
}: {
  items: Array<{ id: string; label: string; count: number; href: string }>;
}) {
  const attention = items.filter((item) => item.count > 0);
  return (
    <div
      className="rounded-lg border border-slate-200 bg-white p-4"
      data-testid="attention-summary"
    >
      <p className="text-sm font-semibold text-slate-900">Attention required</p>
      {attention.length === 0 ? (
        <p className="mt-2 text-sm text-slate-600">Nothing needs attention in the current scope.</p>
      ) : (
        <ul className="mt-3 flex flex-wrap gap-2">
          {attention.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="inline-flex min-h-11 items-center rounded-md border border-amber-200 bg-amber-50 px-3 text-sm font-medium text-amber-950 hover:border-amber-300"
              >
                {item.label}
                <span className="ml-2 tabular-nums">{item.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WorkQueue({
  title,
  href,
  rows,
  labelKeys,
  statusKey,
  emptyTitle,
  emptyDescription,
  testId,
  itemHref,
}: {
  title: string;
  href: string;
  rows: OperationalRow[];
  labelKeys: string[];
  statusKey?: string;
  emptyTitle: string;
  emptyDescription: string;
  testId?: string;
  /** When omitted, each row opens the queue destination (no invented detail routes). */
  itemHref?: (row: OperationalRow) => string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4" data-testid={testId}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <Link href={href} className="text-xs font-medium text-slate-700 underline-offset-2 hover:underline">
          View all
        </Link>
      </div>
      {rows.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} className="px-4 py-5" />
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((row) => {
            const id = String(row.id ?? recordLabel(row, labelKeys));
            const dest = itemHref?.(row) ?? href;
            return (
              <li key={id}>
                <Link
                  href={dest}
                  className="flex min-h-11 items-center justify-between gap-3 py-2 text-sm text-slate-800 hover:text-slate-950"
                >
                  <span className="truncate">{recordLabel(row, labelKeys)}</span>
                  {statusKey ? <StatusChip value={String(row[statusKey] ?? "")} /> : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function StatusTable({
  columns,
  rows,
  emptyTitle,
  emptyDescription,
  testId,
  emptyTestId,
}: {
  columns: Array<{ key: string; label: string; hrefKey?: boolean; status?: boolean }>;
  rows: OperationalRow[];
  emptyTitle: string;
  emptyDescription: string;
  testId?: string;
  emptyTestId?: string;
}) {
  if (rows.length === 0) {
    return (
      <div data-testid={emptyTestId ?? testId}>
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white" data-testid={testId}>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 font-semibold">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={String(row.id ?? index)} className="hover:bg-slate-50">
              {columns.map((col) => {
                const raw = row[col.key];
                const text = raw == null || raw === "" ? "—" : String(raw);
                return (
                  <td key={col.key} className="px-4 py-3 text-slate-800">
                    {col.status ? (
                      <StatusChip value={text === "—" ? null : text} />
                    ) : col.hrefKey && typeof row.href === "string" ? (
                      <Link href={row.href as string} className="font-medium underline-offset-2 hover:underline">
                        {text}
                      </Link>
                    ) : (
                      text
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ContextTabs({
  links,
  ariaLabel,
}: {
  links: readonly ModuleNavLink[];
  ariaLabel: string;
}) {
  return <ModuleSectionNav links={links} ariaLabel={ariaLabel} />;
}

export function EmptyOperationalState({
  title,
  description,
  action,
  testId,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  testId?: string;
}) {
  return (
    <div data-testid={testId}>
      <EmptyState title={title} description={description} action={action} />
    </div>
  );
}

export function ProvenanceLink({ href, label = "Methodology & provenance" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="text-xs font-medium text-slate-600 underline-offset-2 hover:underline"
      data-testid="provenance-link"
    >
      {label}
    </Link>
  );
}

export function ProjectContextHeader({
  code,
  name,
  status,
  phase,
  projectId,
}: {
  code?: string;
  name?: string;
  status?: string;
  phase?: string;
  projectId: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" data-testid="project-context-header">
      {status ? <StatusChip value={status} /> : null}
      {phase ? <StatusChip value={phase} /> : null}
      <span className="text-sm text-slate-600">
        {code ? `${code} — ` : ""}
        {name ?? "Project"}
      </span>
      <AskEngineeringAI
        label="Ask Engineering AI"
        projectId={projectId}
        objectType="project"
        objectId={projectId}
        q="What needs my attention on this project?"
        testId="ask-this-project"
      />
    </div>
  );
}

export function AssetContextHeader({
  tag,
  name,
  assetId,
  projectId,
  status,
}: {
  tag?: string;
  name?: string;
  assetId: string;
  projectId?: string | null;
  status?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" data-testid="asset-context-header">
      {status ? <StatusChip value={status} /> : null}
      <span className="text-sm text-slate-600">
        {tag ? `${tag} — ` : ""}
        {name ?? "Asset"}
      </span>
      <AskEngineeringAI
        label="Ask Engineering AI"
        projectId={projectId}
        objectType="asset"
        objectId={assetId}
        q="Explain this asset condition from recorded evidence."
        testId="ask-this-asset"
      />
    </div>
  );
}

export function AskEngineeringAI(props: {
  label?: string;
  projectId?: string | null;
  objectType?: string | null;
  objectId?: string | null;
  q?: string | null;
  testId?: string;
}) {
  return (
    <AskThisObjectLink
      label={props.label ?? "Ask Engineering AI"}
      projectId={props.projectId}
      objectType={props.objectType}
      objectId={props.objectId}
      q={props.q ?? "What needs my attention?"}
      testId={props.testId ?? "ask-engineering-ai"}
    />
  );
}

export function OperationalSkeleton({ label = "Loading operational data…" }: { label?: string }) {
  return (
    <p className="text-sm text-slate-500" data-testid="operational-loading" role="status">
      {label}
    </p>
  );
}

export function OperationalError({
  message,
  retryHref,
}: {
  message: string;
  retryHref?: string;
}) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
      <p>{message}</p>
      {retryHref ? (
        <Link href={retryHref} className="mt-2 inline-block font-medium underline">
          Try again
        </Link>
      ) : null}
    </div>
  );
}
