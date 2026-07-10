"use client";

import type { ReactNode } from "react";

export function CommerceFilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="flex items-center gap-2 text-sm text-slate-600">
      <span className="whitespace-nowrap">{label}</span>
      <select
        className="rounded-md border border-border bg-white px-2 py-1.5 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={`filter-${label.toLowerCase().replace(/\s+/g, "-")}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function CatalogueFallbackBanner({ children }: { children?: ReactNode }) {
  return (
    <div
      className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
      data-testid="catalogue-fallback-banner"
    >
      <strong>Catalogue fallback active.</strong>{" "}
      {children ??
        "Commercial status is shown from the product registry because live commerce data is unavailable for this tenant."}
    </div>
  );
}
