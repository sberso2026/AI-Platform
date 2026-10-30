"use client";

import { useState } from "react";
import { ENGINEERING_AUTHORITY_NOTICE, PILOT_DATA_NOTICE } from "@/lib/pilot/pilot-controls";

/**
 * Compact controlled-pilot banner with progressive disclosure of full notice text.
 * Required warnings remain available on demand — not removed.
 */
export function PilotDataNotice() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="mb-3 rounded-md border border-[color:var(--eos-gold,#c4a35a)]/35 bg-[color:var(--eos-navy,#0b1f3a)]/5 px-3 py-2"
      data-testid="pilot-data-notice"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-800">
          Controlled pilot — use approved / synthetic data only. AI is not engineering approval.
        </p>
        <button
          type="button"
          className="min-h-8 rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700"
          aria-expanded={open}
          data-testid="pilot-notice-toggle"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide details" : "Details"}
        </button>
      </div>
      {open ? (
        <p className="mt-2 text-xs leading-relaxed text-slate-600" data-testid="pilot-data-notice-full">
          {PILOT_DATA_NOTICE}
        </p>
      ) : null}
    </div>
  );
}

export function EngineeringAuthorityNotice() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="mb-3 rounded-md border border-slate-200 bg-white px-3 py-2"
      data-testid="engineering-authority-notice"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-800">
          Human engineering authority remains with authorized professionals.
        </p>
        <button
          type="button"
          className="min-h-8 rounded border border-slate-300 bg-white px-2 text-[11px] text-slate-700"
          aria-expanded={open}
          data-testid="authority-notice-toggle"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide details" : "Details"}
        </button>
      </div>
      {open ? (
        <p
          className="mt-2 text-xs leading-relaxed text-slate-600"
          data-testid="engineering-authority-notice-full"
        >
          {ENGINEERING_AUTHORITY_NOTICE}
        </p>
      ) : null}
    </div>
  );
}
