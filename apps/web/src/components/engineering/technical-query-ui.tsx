"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { TechnicalQueryNextAction, TechnicalQueryPerson } from "@rtb/engineering-os/browser";
import { personLabel, formatTqDate } from "@/lib/engineering/technical-query-ux";

export function TqPersonBlock({
  label,
  person,
  unassigned = "Unassigned",
}: {
  label: string;
  person: TechnicalQueryPerson | null | undefined;
  unassigned?: string;
}) {
  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{person?.name ?? unassigned}</p>
      {person?.role || person?.company || person?.discipline ? (
        <p className="text-xs text-slate-600">
          {[person.role, person.company, person.discipline].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

export function TqNextActionPanel({
  nextAction,
  overdue,
}: {
  nextAction: TechnicalQueryNextAction;
  overdue?: boolean;
}) {
  return (
    <aside
      className="rounded-lg border border-slate-200 bg-slate-50 p-4"
      data-testid="tq-next-action"
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">Current status</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{nextAction.currentStatus}</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">Action required</dt>
          <dd className="mt-1 text-sm text-slate-800">{nextAction.actionRequired}</dd>
        </div>
        <div>
          <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">Due</dt>
          <dd className={`mt-1 text-sm ${overdue ? "font-semibold text-rose-800" : "text-slate-800"}`}>
            {formatTqDate(nextAction.due)}
            {overdue ? " · Overdue" : ""}
          </dd>
        </div>
        <div>
          <dt className="text-[0.7rem] font-semibold uppercase tracking-wide text-slate-500">Next step</dt>
          <dd className="mt-1 text-sm text-slate-800">{nextAction.nextStep}</dd>
        </div>
      </dl>
    </aside>
  );
}

export function TqSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function TqMultiline({
  id,
  label,
  value,
  onChange,
  required,
  readOnly,
  rows = 6,
}: {
  id: string;
  label: string;
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  readOnly?: boolean;
  rows?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required ? " *" : ""}
      </label>
      <textarea
        id={id}
        rows={rows}
        className="min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm leading-relaxed"
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required={required}
        readOnly={readOnly}
      />
    </div>
  );
}

export function TqPersonSelect({
  id,
  label,
  value,
  people,
  onChange,
  required,
  allowUnassigned = true,
}: {
  id: string;
  label: string;
  value: string;
  people: TechnicalQueryPerson[];
  onChange: (value: string) => void;
  required?: boolean;
  allowUnassigned?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-600">
        {label}
        {required ? " *" : ""}
      </label>
      <select
        id={id}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required && !allowUnassigned}
      >
        {allowUnassigned ? <option value="">Unassigned</option> : null}
        {people.map((person) => (
          <option key={person.id} value={person.id}>
            {personLabel(person, person.name)}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TqHeaderActions({
  href,
  printHref,
}: {
  href: string;
  printHref: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={printHref}
        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:border-slate-400"
      >
        Print
      </Link>
      <Link
        href={href}
        className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 hover:border-slate-400"
      >
        View Register
      </Link>
    </div>
  );
}
