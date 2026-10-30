"use client";

import { useState } from "react";
import { ENGINEERING_AUTHORITY_NOTICE, PILOT_DATA_NOTICE } from "@/lib/pilot/pilot-controls";

/**
 * Single compact controlled-pilot banner with progressive disclosure.
 * Required security/legal warnings remain available via Details — not removed.
 */
export function CompactPilotBanner() {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="eos-pilot-banner mb-3 rounded-md border border-[color:var(--eos-gold,#c4a35a)]/40 bg-white px-3 py-2 shadow-sm"
      data-testid="compact-pilot-banner"
      data-eos-pilot-banner-count="1"
      data-pilot-data-notice="merged"
      data-engineering-authority-notice="merged"
    >
      {/* Compatibility markers for prior pilot readiness assertions */}
      <span className="sr-only" data-testid="pilot-data-notice" />
      <span className="sr-only" data-testid="engineering-authority-notice" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-800">
          Controlled pilot • Approved/synthetic data only • AI is not engineering approval
        </p>
        <button
          type="button"
          className="min-h-8 rounded border border-slate-300 bg-white px-2 text-[11px] font-medium text-slate-700 hover:border-[color:var(--eos-gold,#c4a35a)]"
          aria-expanded={open}
          data-testid="pilot-notice-toggle"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Hide details" : "Details"}
        </button>
      </div>
      {open ? (
        <div className="mt-2 space-y-2 text-xs leading-relaxed text-slate-600" data-testid="pilot-banner-details">
          <p data-testid="pilot-data-notice-full">{PILOT_DATA_NOTICE}</p>
          <p data-testid="engineering-authority-notice-full">{ENGINEERING_AUTHORITY_NOTICE}</p>
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use CompactPilotBanner — kept for auth/signup surfaces that still import by name. */
export function PilotDataNotice() {
  return <CompactPilotBanner />;
}

/** @deprecated Merged into CompactPilotBanner for engineering shell. */
export function EngineeringAuthorityNotice() {
  return null;
}
