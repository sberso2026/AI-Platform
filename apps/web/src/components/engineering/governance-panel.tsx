"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Link from "next/link";

export type GovernancePanelProps = {
  moduleName: string;
  version: string;
  releaseStatus?: string;
  aiAuthority?: string;
  autonomousApproval?: string;
  externalWrites?: string;
  provenance?: string;
  audit?: string;
  tenantIsolation?: string;
  certificationStatus?: string;
  knownLimitations?: readonly string[];
  technicalHref?: string;
  technicalContent?: ReactNode;
  technicalOpenByDefault?: boolean;
  testId?: string;
};

/**
 * Assurance UX — not the primary operational experience.
 * Certification evidence stays here; operational screens stay work-first.
 */
export function GovernancePanel({
  moduleName,
  version,
  releaseStatus = "Production GA",
  aiAuthority = "Advisory only — human authority required",
  autonomousApproval = "Not permitted",
  externalWrites = "Not permitted from this module",
  provenance = "Evidence-linked; see Methodology on related insights",
  audit = "Platform audit log remains authoritative",
  tenantIsolation = "Tenant and workspace isolation enforced",
  certificationStatus = "Certified V1.0 — see technical certification",
  knownLimitations = [],
  technicalHref,
  technicalContent,
  technicalOpenByDefault = true,
  testId,
}: GovernancePanelProps) {
  const [open, setOpen] = useState(technicalOpenByDefault);

  return (
    <section
      className="rounded-lg border border-slate-200 bg-white p-5"
      data-testid={testId ?? "governance-assurance-panel"}
      aria-labelledby="governance-assurance-title"
    >
      <h2 id="governance-assurance-title" className="text-lg font-semibold text-slate-900">
        Governance &amp; Assurance
      </h2>
      <p className="mt-1 text-sm text-slate-600">
        Release identity and authority boundaries for {moduleName}. This is not the operational
        workspace.
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <GovRow term="Version" value={version} />
        <GovRow term="Release status" value={releaseStatus} />
        <GovRow term="AI authority" value={aiAuthority} />
        <GovRow term="Autonomous approval" value={autonomousApproval} />
        <GovRow term="External writes" value={externalWrites} />
        <GovRow term="Provenance" value={provenance} />
        <GovRow term="Audit" value={audit} />
        <GovRow term="Tenant isolation" value={tenantIsolation} />
        <GovRow term="Certification status" value={certificationStatus} />
      </dl>
      {knownLimitations.length > 0 ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-900">Known limitations</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {knownLimitations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {technicalHref ? (
        <p className="mt-4 text-sm">
          <Link href={technicalHref} className="font-medium text-slate-800 underline-offset-2 hover:underline">
            View technical certification
          </Link>
        </p>
      ) : null}
      {technicalContent ? (
        <div className="mt-4">
          <button
            type="button"
            className="text-sm font-medium text-slate-800 underline-offset-2 hover:underline"
            data-testid="view-technical-certification"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Hide technical certification" : "View technical certification"}
          </button>
          {open ? (
            <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              {technicalContent}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function GovRow({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="font-medium text-slate-900">{term}</dt>
      <dd className="mt-0.5 text-slate-700">{value}</dd>
    </div>
  );
}
