/**
 * Contextual intelligence actions for object pages — only when entitled + applicable.
 */
"use client";

import Link from "next/link";
import {
  contextualIntelligenceActions,
  getDefaultIntelligenceCatalog,
} from "@rtb/engineering-os/browser";

export function ContextualIntelligenceActions(props: {
  objectType?: string | null;
  entitledKeys?: string[];
}) {
  const actions = contextualIntelligenceActions({
    objectType: props.objectType,
    entitledKeys: props.entitledKeys,
    catalog: getDefaultIntelligenceCatalog(),
  });
  if (!actions.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5" data-testid="contextual-intelligence-actions">
      {actions.map((a) =>
        a.href ? (
          <Link
            key={a.id}
            href={a.href}
            className="rounded-md border px-2 py-1 text-[11px] text-slate-700 hover:bg-slate-50"
          >
            {a.label}
          </Link>
        ) : (
          <span
            key={a.id}
            className="rounded-md border px-2 py-1 text-[11px] text-slate-700"
          >
            {a.label}
          </span>
        ),
      )}
    </div>
  );
}
